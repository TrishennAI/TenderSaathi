-- Human-readable case reference for WhatsApp / support (e.g. TS-000001).
-- Keeps cases.id UUID as primary key.

create sequence if not exists public.cases_reference_seq;

alter table public.cases
  add column if not exists reference_code text;

-- Backfill existing rows (stable order by creation time).
with ordered as (
  select id, row_number() over (order by created_at asc, id asc) as rn
  from public.cases
  where reference_code is null
)
update public.cases c
set reference_code = 'TS-' || lpad(o.rn::text, 6, '0')
from ordered o
where c.id = o.id;

-- Align sequence so the next insert gets max + 1.
select setval(
  'public.cases_reference_seq',
  coalesce((
    select max(
      substring(reference_code from 4)::bigint
    )
    from public.cases
    where reference_code ~ '^TS-[0-9]+$'
  ), 0)::bigint
);

alter table public.cases
  alter column reference_code set not null;

create unique index if not exists cases_reference_code_key
  on public.cases (reference_code);

create or replace function public.set_case_reference_code()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.reference_code is null or btrim(new.reference_code) = '' then
    new.reference_code := 'TS-' || lpad(nextval('public.cases_reference_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists before_insert_case_set_reference_code on public.cases;
create trigger before_insert_case_set_reference_code
  before insert on public.cases
  for each row execute function public.set_case_reference_code();
