-- Fix profile creation trigger to work for both OAuth and email/password signups
-- With proper error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_role text;
  v_full text;
  v_phone text;
  v_business text;
  v_meta jsonb;
begin
  -- Safely get metadata (could be NULL for some auth methods)
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  
  -- Get role from metadata or default to 'user'
  -- Handle case where role might not be in metadata
  v_role := 'user';
  if v_meta ? 'role' and v_meta->>'role' = 'agent' then
    v_role := 'agent';
  end if;
  
  -- Try multiple sources for full name (OAuth vs email/password)
  -- OAuth providers use 'name', email/password uses 'full_name'
  v_full := nullif(trim(coalesce(
    v_meta->>'full_name',
    v_meta->>'name',
    ''
  )), '');
  
  -- Get phone and business_name from metadata
  v_phone := nullif(trim(v_meta->>'phone'), '');
  v_business := nullif(trim(v_meta->>'business_name'), '');
  
  -- Insert profile with all available data
  -- Use ON CONFLICT DO NOTHING in case profile already exists
  insert into public.profiles (id, role, full_name, phone, business_name, preferred_locale)
  values (
    new.id,
    v_role,
    v_full,
    v_phone,
    v_business,
    'en'  -- Default locale
  )
  on conflict (id) do nothing;
  
  return new;
exception
  when others then
    -- Log error but don't fail user creation
    -- In a real production system, you might want to log to a table
    raise warning 'Profile creation failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;