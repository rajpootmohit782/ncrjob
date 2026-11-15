-- ============================================================================
--  VMWjobs — OPTIONAL HELPERS  (safe: no data is deleted)
-- ============================================================================
--  Run these one at a time in the Supabase SQL Editor, only if you need them.
--  The full reset (00_full_reset.sql) already handles a fresh start.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RESET A PASSWORD (admin / employer / any user)
--    Works without access to the old password and without sending email.
--    Change the two values, then run.
-- ----------------------------------------------------------------------------
create or replace function public.admin_reset_password(
  p_email        text,
  p_new_password text
)
returns text
language plpgsql
security definer
set search_path = public, extensions, auth, pg_temp
as $$
declare
  v_uid uuid;
begin
  if length(p_new_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  select id into v_uid
    from auth.users
   where lower(email) = lower(p_email)
   limit 1;

  if v_uid is null then
    raise exception 'No account found for %', p_email;
  end if;

  update auth.users
     set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         updated_at         = now()
   where id = v_uid;

  return 'Password updated for ' || p_email;
end;
$$;

revoke all on function public.admin_reset_password(text, text) from public;
revoke all on function public.admin_reset_password(text, text) from anon, authenticated;

-- Usage:
--   select public.admin_reset_password('employer@example.com', 'NewPass@123');


-- ----------------------------------------------------------------------------
-- 2. PROMOTE AN EXISTING USER TO ADMIN
-- ----------------------------------------------------------------------------
create or replace function public.admin_make_admin(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where lower(email) = lower(p_email) limit 1;

  if v_uid is null then
    raise exception 'No account found for %', p_email;
  end if;

  update public.profiles set role = 'admin', updated_at = now() where id = v_uid;

  return p_email || ' is now an admin';
end;
$$;

revoke all on function public.admin_make_admin(text) from public;
revoke all on function public.admin_make_admin(text) from anon, authenticated;

-- Usage:
--   select public.admin_make_admin('you@example.com');


-- ----------------------------------------------------------------------------
-- 3. REMOVE "GOVERNMENT JOBS" WITHOUT WIPING THE DATABASE
--    (already excluded from 00_full_reset.sql — use only on the old database)
-- ----------------------------------------------------------------------------
update public.categories
   set status = 'inactive'
 where slug = 'government-jobs';

-- If you prefer the category gone completely:
-- delete from public.categories where slug = 'government-jobs';


-- ----------------------------------------------------------------------------
-- 4. EMERGENCY: reactivate an employer manually (e.g. payment done offline)
-- ----------------------------------------------------------------------------
-- update public.employers
--    set status      = 'active',
--        is_verified = true,
--        job_limit   = 5,
--        subscription_expires_at = now() + interval '30 days'
--  where user_id = (select id from auth.users where email = 'employer@example.com');


-- ----------------------------------------------------------------------------
-- 5. EMERGENCY: clear a stuck Razorpay order so the employer can retry
-- ----------------------------------------------------------------------------
-- update public.employer_subscriptions
--    set status = 'failed', updated_at = now()
--  where razorpay_order_id = 'order_XXXXXXXXXXXX';
