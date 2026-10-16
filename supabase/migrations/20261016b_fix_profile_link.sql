-- Fix: the profile-protection trigger blocked link_my_profile() on first sign-in,
-- because the user is not recognised as pengurus until the link exists.
-- link_my_profile() now marks its own update, and the trigger lets exactly that through.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.

create or replace function public.link_my_profile()
returns text language plpgsql security definer set search_path = public as $$
declare
  pid text;
  confirmed timestamptz;
  user_email text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select id into pid from public.profiles where auth_user_id = auth.uid();
  if pid is not null then
    return pid;
  end if;

  select email, email_confirmed_at into user_email, confirmed from auth.users where id = auth.uid();
  if confirmed is null or user_email is null then
    return null;
  end if;

  -- Transaction-local flag read by protect_profile_fields().
  perform set_config('vihara.linking_profile', 'on', true);

  update public.profiles
     set auth_user_id = auth.uid()
   where auth_user_id is null and lower(trim(email)) = lower(trim(user_email))
  returning id into pid;

  perform set_config('vihara.linking_profile', 'off', true);
  return pid;
end
$$;

create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;

  -- The one-time account link done by link_my_profile(): only auth_user_id may change,
  -- and only from empty to the caller's own id.
  if coalesce(current_setting('vihara.linking_profile', true), 'off') = 'on'
     and old.auth_user_id is null
     and new.auth_user_id = auth.uid() then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.is_active is distinct from old.is_active
     or new.auth_user_id is distinct from old.auth_user_id
     or new.sentra is distinct from old.sentra
     or new.cetya is distinct from old.cetya
     or new.han is distinct from old.han
     or new.bagian is distinct from old.bagian then
    raise exception 'Hanya pengurus yang dapat mengubah peran, status, atau naungan umat.';
  end if;
  return new;
end
$$;

revoke all on function public.link_my_profile() from anon;

-- Check: pengurus profiles and whether they are linked to a login yet.
select full_name, email, role, auth_user_id is not null as terhubung
  from public.profiles
 where role = 'admin';
