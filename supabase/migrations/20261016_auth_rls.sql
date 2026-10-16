-- =========================================================================
-- Vihara MNSBDI: real authentication + Row Level Security
-- Run once in Supabase Dashboard -> SQL Editor, AFTER the pengurus have
-- activated their accounts (see /login/aktivasi) so nobody is locked out.
-- Safe to re-run.
-- =========================================================================

-- 1. Link Supabase Auth users to umat/pengurus profiles --------------------
alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

-- 2. Helper functions (security definer so policies can use them) ---------
create or replace function public.current_profile_id()
returns text language sql stable security definer set search_path = public as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'admin' and coalesce(is_active, true)
  )
$$;

-- Called right after sign-in: attaches the signed-in user to the profile with
-- the same, confirmed email. Never re-links a profile that already has an owner.
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

  update public.profiles
     set auth_user_id = auth.uid()
   where auth_user_id is null and lower(email) = lower(user_email)
  returning id into pid;

  return pid;
end
$$;

-- Registration counts for the public catalogue without exposing who registered.
create or replace function public.event_registration_counts()
returns table (event_id text, total bigint) language sql stable security definer set search_path = public as $$
  select r.event_id, count(*)::bigint
    from public.event_registrations r
    join public.events e on e.id = r.event_id
   where e.is_published or public.is_admin()
   group by r.event_id
$$;

-- Umat may edit their own contact details, but never their role, status or account link.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
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

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Birthdays contain personal data: pengurus only.
create or replace function public.get_birthdays_by_month(target_month int)
returns setof public.profiles language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    return;
  end if;
  return query
    select * from public.profiles
     where is_active = true and birth_date is not null
       and extract(month from birth_date) = target_month;
end
$$;

revoke all on function public.link_my_profile() from anon;
revoke all on function public.get_birthdays_by_month(int) from anon;

-- 3. Replace the open "allow everything" policies ---------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','cetyas','hans','events','event_registrations','event_budgets',
    'inventory','inventory_transactions','donations','event_proposal_rundowns','event_skenario_kerja'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Allow app access %s" on public.%I', t, t);
  end loop;
end $$;

-- profiles
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_admin_write on public.profiles;
drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_select on public.profiles for select
  using (public.is_admin() or auth_user_id = auth.uid());
create policy profiles_update on public.profiles for update
  using (public.is_admin() or auth_user_id = auth.uid())
  with check (public.is_admin() or auth_user_id = auth.uid());
create policy profiles_admin_write on public.profiles for insert
  with check (public.is_admin());
create policy profiles_admin_delete on public.profiles for delete
  using (public.is_admin());

-- cetyas / hans: readable by signed-in users, managed by pengurus
drop policy if exists cetyas_read on public.cetyas;
drop policy if exists cetyas_admin on public.cetyas;
create policy cetyas_read on public.cetyas for select using (auth.role() = 'authenticated');
create policy cetyas_admin on public.cetyas for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists hans_read on public.hans;
drop policy if exists hans_admin on public.hans;
create policy hans_read on public.hans for select using (auth.role() = 'authenticated');
create policy hans_admin on public.hans for all using (public.is_admin()) with check (public.is_admin());

-- events: published events are public, everything else is pengurus only
drop policy if exists events_read on public.events;
drop policy if exists events_admin on public.events;
create policy events_read on public.events for select using (is_published or public.is_admin());
create policy events_admin on public.events for all using (public.is_admin()) with check (public.is_admin());

-- event_registrations: pengurus manage all; umat see and manage only their own
drop policy if exists regs_select on public.event_registrations;
drop policy if exists regs_self_insert on public.event_registrations;
drop policy if exists regs_self_delete on public.event_registrations;
drop policy if exists regs_admin on public.event_registrations;
create policy regs_select on public.event_registrations for select
  using (public.is_admin() or profile_id = public.current_profile_id());
create policy regs_self_insert on public.event_registrations for insert
  with check (
    profile_id = public.current_profile_id()
    and registration_method = 'self'
    and exists (select 1 from public.events e where e.id = event_id and e.is_published and not coalesce(e.is_completed, false))
  );
create policy regs_self_delete on public.event_registrations for delete
  using (profile_id = public.current_profile_id());
create policy regs_admin on public.event_registrations for all
  using (public.is_admin()) with check (public.is_admin());

-- pengurus-only tables
do $$
declare t text;
begin
  foreach t in array array['event_budgets','inventory','inventory_transactions','donations','event_proposal_rundowns','event_skenario_kerja'] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', t || '_admin', t);
  end loop;
end $$;

-- 4. Quick check: should list one row per table with rls_enabled = true
select relname as table_name, relrowsecurity as rls_enabled
  from pg_class
 where relnamespace = 'public'::regnamespace and relkind = 'r'
 order by relname;
