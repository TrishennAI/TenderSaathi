-- OAuth (Google): map provider metadata to profiles and keep role safe.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_role text;
  v_full text;
begin
  v_role := case
    when new.raw_user_meta_data->>'role' = 'agent' then 'agent'
    else 'user'
  end;

  v_full := nullif(trim(coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    ''
  )), '');

  insert into public.profiles (id, role, full_name, phone, business_name)
  values (
    new.id,
    v_role,
    v_full,
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    nullif(trim(new.raw_user_meta_data->>'business_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
