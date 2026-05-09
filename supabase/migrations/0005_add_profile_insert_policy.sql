-- Add INSERT policy for profiles table so users can create their own profile
-- (fallback for when the trigger fails)
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert
  with check (id = auth.uid());