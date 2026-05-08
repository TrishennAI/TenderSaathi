-- Gem Portal MVP schema
-- Run on the Supabase Postgres database (SQL editor or `supabase db push`).
-- Single agent, WhatsApp-only artifacts, manual UPI payment verification.

-- =========================================================================
-- ENUMS
-- =========================================================================
do $$ begin
  create type public.case_status as enum (
    'submitted',
    'agent_assigned',
    'whatsapp_active',
    'documents_requested',
    'documents_under_review',
    'documents_approved',
    'awaiting_payment',
    'payment_pending_verification',
    'in_progress',
    'completed',
    'rejected',
    'on_hold'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'awaiting_payment',
    'pending_verification',
    'verified',
    'rejected'
  );
exception when duplicate_object then null; end $$;

-- =========================================================================
-- TABLES
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'agent')),
  full_name text,
  phone text,
  business_name text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'hi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  display_name text not null,
  whatsapp_phone_e164 text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  status public.case_status not null default 'submitted',
  title text not null,
  summary text,
  document_requirements jsonb not null default '[]'::jsonb,
  agent_notes text,
  final_notes text,
  amount_inr integer not null default 799,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_user_id_idx on public.cases(user_id);
create index if not exists cases_agent_id_idx on public.cases(agent_id);
create index if not exists cases_status_idx on public.cases(status);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete cascade,
  amount_inr integer not null default 799,
  status public.payment_status not null default 'awaiting_payment',
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- HELPERS
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_cases on public.cases;
create trigger set_updated_at_cases before update on public.cases
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_payments on public.payments;
create trigger set_updated_at_payments before update on public.payments
  for each row execute function public.set_updated_at();

create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'agent'
  );
$$;

-- Profile bootstrap on signup (so RLS never sees a user without a profile).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-assign the single active agent on case creation.
create or replace function public.assign_default_agent()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_agent_id uuid;
begin
  if new.agent_id is null then
    select id into v_agent_id
    from public.agents
    where is_active = true
    order by created_at
    limit 1;

    if v_agent_id is not null then
      new.agent_id := v_agent_id;
      if new.status = 'submitted' then
        new.status := 'agent_assigned';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists before_insert_case_assign_agent on public.cases;
create trigger before_insert_case_assign_agent
  before insert on public.cases
  for each row execute function public.assign_default_agent();

-- Auto-create payment row when status transitions to awaiting_payment.
create or replace function public.ensure_payment_for_case()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if new.status = 'awaiting_payment'
     and (TG_OP = 'INSERT' or old.status is distinct from new.status) then
    insert into public.payments (case_id, amount_inr, status)
    values (new.id, new.amount_inr, 'awaiting_payment')
    on conflict (case_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists after_case_status_payment on public.cases;
create trigger after_case_status_payment
  after insert or update of status on public.cases
  for each row execute function public.ensure_payment_for_case();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.agents   enable row level security;
alter table public.cases    enable row level security;
alter table public.payments enable row level security;

-- profiles: users see/update only themselves; agent sees all.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  using (id = auth.uid() or public.is_agent());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- agents: any authenticated user can read (so we can build wa.me link).
drop policy if exists agents_select on public.agents;
create policy agents_select on public.agents
  for select
  using (auth.uid() is not null);

-- cases: owner or agent can read; only owner inserts; only agent updates.
drop policy if exists cases_select on public.cases;
create policy cases_select on public.cases
  for select
  using (user_id = auth.uid() or public.is_agent());

drop policy if exists cases_insert_self on public.cases;
create policy cases_insert_self on public.cases
  for insert
  with check (user_id = auth.uid() and not public.is_agent());

drop policy if exists cases_update_agent on public.cases;
create policy cases_update_agent on public.cases
  for update
  using (public.is_agent())
  with check (public.is_agent());

-- payments: agent writes, owner or agent reads.
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select
  using (
    public.is_agent()
    or exists (
      select 1 from public.cases c
      where c.id = case_id and c.user_id = auth.uid()
    )
  );

drop policy if exists payments_insert_agent on public.payments;
create policy payments_insert_agent on public.payments
  for insert
  with check (public.is_agent());

drop policy if exists payments_update_agent on public.payments;
create policy payments_update_agent on public.payments
  for update
  using (public.is_agent())
  with check (public.is_agent());
