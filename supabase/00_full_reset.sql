-- ============================================================================
--  VMWjobs  —  COMPLETE DATABASE RESET & SCHEMA
-- ============================================================================
--  HOW TO RUN
--    1. Open  https://supabase.com/dashboard  ->  your project
--    2. Left menu  ->  SQL Editor  ->  New query
--    3. Paste this WHOLE file and press RUN.
--
--  !!! THIS IS DESTRUCTIVE !!!
--    * Deletes ALL jobs, employers, subscriptions, categories, locations.
--    * Deletes ALL login accounts (auth.users) so every forgotten password
--      is gone for good.
--    * Creates ONE fresh admin account (see section 7, change the password!).
--
--  What this script sets up
--    * Private-sector job marketplace for NCR (NO "Government Jobs").
--    * employers / categories / locations / jobs / profiles /
--      employer_subscriptions / plans
--    * Razorpay-ready payment columns (order id, payment id, signature)
--    * Row Level Security so an employer can NOT activate himself for free
--    * Auto job-limit decrement when a job is posted
--    * Auto profile creation on signup (role can never be self-set to admin)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. WIPE
--    This database also contains leftovers from older versions
--    (job_seeker_profiles, applications, saved_jobs, storage policies, ...).
--    Instead of naming each one, drop EVERY app object in `public` and let
--    CASCADE remove the policies/triggers that depend on them.
-- ----------------------------------------------------------------------------
do $$
declare
  r record;
begin
  -- 0a. views first
  for r in
    select c.relname, c.relkind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind in ('v', 'm')
       and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
  loop
    if r.relkind = 'm' then
      execute format('drop materialized view if exists public.%I cascade', r.relname);
    else
      execute format('drop view if exists public.%I cascade', r.relname);
    end if;
  end loop;

  -- 0b. tables (skips tables owned by extensions)
  for r in
    select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind in ('r', 'p')
       and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
  loop
    execute format('drop table if exists public.%I cascade', r.relname);
  end loop;

  -- 0c. functions (this also removes policies that referenced is_admin())
  for r in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('drop function if exists %s cascade', r.sig);
  end loop;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

-- Delete every login account (this also removes their sessions/tokens).
-- Comment this line out if you want to keep the existing logins.
delete from auth.users;

-- Needed for password hashing.
create extension if not exists pgcrypto with schema extensions;

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  phone       text,
  role        text not null default 'seeker' check (role in ('seeker', 'employer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index profiles_email_idx on public.profiles (lower(email));

-- NOTE: user_id points at profiles (not auth.users) so that PostgREST can
-- embed `profiles (name, email)` and `employers (...)` in the admin screens.
create table public.employers (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references public.profiles(id) on delete cascade,
  company_name            text not null,
  contact_person          text,
  phone                   text,
  logo_url                text,
  banner_url              text,
  website                 text,
  description            text,
  industry                text,
  company_size            text,
  location                text,
  whatsapp_number         text,
  is_verified             boolean not null default false,
  status                  text not null default 'pending' check (status in ('pending', 'active', 'blocked')),
  job_limit               integer not null default 0 check (job_limit >= 0),
  subscription_expires_at timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now()
);

create table public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now()
);

-- Plan catalogue. Prices are in INR and are validated server-side, so a user
-- can never change the amount from the browser.
create table public.plans (
  id            text primary key,
  name          text not null,
  price_inr     integer not null check (price_inr >= 1),
  job_limit     integer not null check (job_limit > 0),
  duration_days integer not null check (duration_days > 0),
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create table public.jobs (
  id              uuid primary key default gen_random_uuid(),
  employer_id     uuid not null references public.employers(id) on delete cascade,
  category_id     uuid references public.categories(id) on delete set null,
  location_id     uuid references public.locations(id) on delete set null,
  title           text not null,
  description     text not null,
  requirements    text,
  min_salary      numeric(12, 2),
  max_salary      numeric(12, 2),
  experience_min  numeric(4, 1),
  experience_max  numeric(4, 1),
  job_type        text not null default 'full-time' check (job_type in ('full-time', 'part-time', 'internship', 'remote', 'contract', 'temporary')),
  status          text not null default 'pending' check (status in ('pending', 'active', 'rejected', 'closed')),
  is_featured     boolean not null default false,
  deadline        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.employer_subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  employer_id             uuid references public.employers(id) on delete cascade,
  plan_id                 text references public.plans(id) on delete set null,
  plan_name               text not null,
  amount                  integer not null check (amount >= 0),          -- INR
  currency                text not null default 'INR',
  job_limit               integer not null default 0,
  duration_days           integer,
  status                  text not null default 'created'
                            check (status in ('created', 'pending', 'approved', 'rejected', 'failed', 'cancelled')),
  razorpay_order_id       text unique,
  razorpay_payment_id     text unique,
  razorpay_signature      text,
  paid_at                 timestamptz,
  -- legacy columns kept so the current admin screen keeps working
  upi_reference           text,
  payment_screenshot_url  text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. INDEXES
-- ----------------------------------------------------------------------------
create index employers_user_id_idx        on public.employers (user_id);
create index employers_status_idx         on public.employers (status);
create index jobs_employer_id_idx         on public.jobs (employer_id);
create index jobs_category_id_idx         on public.jobs (category_id);
create index jobs_location_id_idx         on public.jobs (location_id);
create index jobs_status_created_idx      on public.jobs (status, created_at desc);
create index jobs_featured_idx            on public.jobs (is_featured) where is_featured;
create index subs_user_id_idx             on public.employer_subscriptions (user_id);
create index subs_status_idx              on public.employer_subscriptions (status);
create index subs_order_id_idx            on public.employer_subscriptions (razorpay_order_id);

-- ----------------------------------------------------------------------------
-- 3. FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- 3a. updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 3b. Is the caller an admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 3c. Create a profile automatically for every new signup.
--     IMPORTANT: the role is sanitised here. A user can never sign up as
--     "admin" by tampering with the request metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    case
      when new.raw_user_meta_data ->> 'role' = 'employer' then 'employer'
      else 'seeker'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3d. Employers may edit their company profile, but NEVER their own
--     subscription fields. This is what makes Razorpay payments meaningful.
create or replace function public.protect_employer_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- trusted paths: service_role (auth.uid() is null), direct SQL, admin,
  -- or an internal trigger that raised the bypass flag.
  if auth.uid() is null
     or public.is_admin()
     or coalesce(current_setting('ncrjob.bypass_guard', true), '0') = '1' then
    return new;
  end if;

  new.user_id                 := old.user_id;
  new.status                  := old.status;
  new.is_verified             := old.is_verified;
  new.job_limit               := old.job_limit;
  new.subscription_expires_at := old.subscription_expires_at;
  return new;
end;
$$;

create trigger employers_protect_fields
before update on public.employers
for each row execute function public.protect_employer_fields();

-- 3e. Employers may edit a job, but only an admin can change status/featured.
create or replace function public.protect_job_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null
     or public.is_admin()
     or coalesce(current_setting('ncrjob.bypass_guard', true), '0') = '1' then
    return new;
  end if;

  new.employer_id := old.employer_id;
  new.status      := old.status;
  new.is_featured := old.is_featured;
  return new;
end;
$$;

create trigger jobs_protect_fields
before update on public.jobs
for each row execute function public.protect_job_fields();

-- 3f. New job -> consume one credit from the employer's plan.
create or replace function public.decrement_job_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform set_config('ncrjob.bypass_guard', '1', true);

  update public.employers
     set job_limit  = greatest(job_limit - 1, 0),
         updated_at = now()
   where id = new.employer_id
     and job_limit > 0;

  perform set_config('ncrjob.bypass_guard', '0', true);
  return new;
end;
$$;

create trigger jobs_decrement_limit
after insert on public.jobs
for each row execute function public.decrement_job_limit();

-- 3g. Keep employer_id on the subscription row in sync with user_id.
create or replace function public.fill_subscription_employer()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.employer_id is null then
    select id into new.employer_id
      from public.employers
     where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger subscriptions_fill_employer
before insert on public.employer_subscriptions
for each row execute function public.fill_subscription_employer();

-- 3h. Activate a paid subscription.
--     Called by the Razorpay Edge Function / webhook with the service_role
--     key AFTER the payment signature has been verified.
create or replace function public.activate_employer_subscription(p_subscription_id uuid)
returns public.employer_subscriptions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_sub  public.employer_subscriptions;
  v_emp  public.employers;
  v_days integer;
  v_base timestamptz;
begin
  select * into v_sub
    from public.employer_subscriptions
   where id = p_subscription_id
   for update;

  if not found then
    raise exception 'Subscription % not found', p_subscription_id;
  end if;

  -- idempotent: paying twice / webhook + redirect both call this
  if v_sub.status = 'approved' then
    return v_sub;
  end if;

  v_days := coalesce(
    v_sub.duration_days,
    case when v_sub.plan_name ilike '%pro%' then 90 else 30 end
  );

  update public.employer_subscriptions
     set status    = 'approved',
         paid_at   = coalesce(paid_at, now()),
         updated_at = now()
   where id = p_subscription_id
   returning * into v_sub;

  select * into v_emp
    from public.employers
   where user_id = v_sub.user_id
   for update;

  if not found then
    raise exception 'Employer profile missing for user %', v_sub.user_id;
  end if;

  v_base := greatest(coalesce(v_emp.subscription_expires_at, now()), now());

  perform set_config('ncrjob.bypass_guard', '1', true);

  update public.employers
     set status                  = 'active',
         is_verified             = true,
         job_limit               = coalesce(job_limit, 0) + coalesce(v_sub.job_limit, 0),
         subscription_expires_at = v_base + make_interval(days => v_days),
         updated_at              = now()
   where id = v_emp.id;

  perform set_config('ncrjob.bypass_guard', '0', true);

  return v_sub;
end;
$$;

revoke all on function public.activate_employer_subscription(uuid) from public;
revoke all on function public.activate_employer_subscription(uuid) from anon, authenticated;
grant execute on function public.activate_employer_subscription(uuid) to service_role;

-- 3i. updated_at triggers
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger employers_set_updated_at
before update on public.employers
for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.employer_subscriptions
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.profiles               enable row level security;
alter table public.employers              enable row level security;
alter table public.categories             enable row level security;
alter table public.locations              enable row level security;
alter table public.plans                  enable row level security;
alter table public.jobs                   enable row level security;
alter table public.employer_subscriptions enable row level security;

-- profiles -------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid() and role in ('seeker', 'employer'));

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_role_name());

-- employers ------------------------------------------------------------------
-- anonymous visitors may read ACTIVE companies only (job cards need this)
create policy "employers_select_public"
  on public.employers for select to anon, authenticated
  using (status = 'active' or user_id = auth.uid() or public.is_admin());

create policy "employers_insert_own"
  on public.employers for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and is_verified = false
    and job_limit = 0
    and subscription_expires_at is null
  );

create policy "employers_update_own_or_admin"
  on public.employers for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "employers_delete_admin"
  on public.employers for delete to authenticated
  using (public.is_admin());

-- categories / locations / plans ---------------------------------------------
create policy "categories_select_public"
  on public.categories for select to anon, authenticated
  using (status = 'active' or public.is_admin());

create policy "categories_admin_write"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "locations_select_public"
  on public.locations for select to anon, authenticated
  using (status = 'active' or public.is_admin());

create policy "locations_admin_write"
  on public.locations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "plans_select_public"
  on public.plans for select to anon, authenticated
  using (is_active or public.is_admin());

create policy "plans_admin_write"
  on public.plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- jobs -----------------------------------------------------------------------
create policy "jobs_select_public"
  on public.jobs for select to anon, authenticated
  using (
    status = 'active'
    or public.is_admin()
    or exists (
      select 1 from public.employers e
      where e.id = employer_id and e.user_id = auth.uid()
    )
  );

-- only an ACTIVE (paid) employer can post, and only as 'pending'
create policy "jobs_insert_active_employer"
  on public.jobs for insert to authenticated
  with check (
    status = 'pending'
    and is_featured = false
    and exists (
      select 1 from public.employers e
      where e.id = employer_id
        and e.user_id = auth.uid()
        and e.status = 'active'
        and e.job_limit > 0
    )
  );

create policy "jobs_update_owner_or_admin"
  on public.jobs for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.employers e
      where e.id = employer_id and e.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.employers e
      where e.id = employer_id and e.user_id = auth.uid()
    )
  );

create policy "jobs_delete_owner_or_admin"
  on public.jobs for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.employers e
      where e.id = employer_id and e.user_id = auth.uid()
    )
  );

-- employer_subscriptions -----------------------------------------------------
create policy "subs_select_own_or_admin"
  on public.employer_subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "subs_insert_own_pending"
  on public.employer_subscriptions for insert to authenticated
  with check (
    user_id = auth.uid()
    and status in ('created', 'pending')
  );

create policy "subs_update_admin"
  on public.employer_subscriptions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "subs_delete_admin"
  on public.employer_subscriptions for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. GRANTS
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.categories, public.locations, public.plans, public.employers, public.jobs
  to anon;

grant select, insert, update, delete on public.profiles, public.employers, public.jobs,
  public.employer_subscriptions, public.categories, public.locations, public.plans
  to authenticated;

grant all on all tables in schema public to service_role;

-- ----------------------------------------------------------------------------
-- 6. SEED DATA  (NO government jobs — private/NCR market only)
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug) values
  ('Private Jobs',                    'private-jobs'),
  ('Data Entry & Back Office',        'data-entry-back-office'),
  ('BPO & Customer Care',             'bpo-customer-care'),
  ('Delivery, Driver & Logistics',    'delivery-driver-logistics'),
  ('Sales & Marketing',               'sales-marketing'),
  ('Receptionist & Front Office',     'receptionist-front-office'),
  ('Security Guard & Housekeeping',   'security-housekeeping'),
  ('Accounts & Finance',              'accounts-finance'),
  ('HR & Admin',                      'hr-admin'),
  ('Teaching & Tutoring',             'teaching-tutoring'),
  ('Campus & Trainee Jobs',           'campus-trainee'),
  ('Aadhar & Field Verification',     'aadhar-field-verification'),
  ('IIT & Institute Jobs',            'iit-institute-jobs'),
  ('Work From Home',                  'work-from-home'),
  ('Noida Jobs',                      'noida-jobs'),
  ('Gurgaon Jobs',                    'gurgaon-jobs'),
  ('Other Jobs',                      'other-jobs')
on conflict (slug) do nothing;

insert into public.locations (name) values
  ('Delhi'),
  ('Noida'),
  ('Greater Noida'),
  ('Gurgaon'),
  ('Ghaziabad'),
  ('Faridabad'),
  ('Mumbai'),
  ('Pune'),
  ('Bengaluru'),
  ('Hyderabad'),
  ('Chennai'),
  ('Kolkata'),
  ('Ahmedabad'),
  ('Jaipur'),
  ('Remote')
on conflict (name) do nothing;

insert into public.plans (id, name, price_inr, job_limit, duration_days, sort_order) values
  ('basic', 'Basic Plan', 9,  5,  30, 1),
  ('pro',   'Pro Plan',   29, 35, 90, 2)
on conflict (id) do update
  set name          = excluded.name,
      price_inr     = excluded.price_inr,
      job_limit     = excluded.job_limit,
      duration_days = excluded.duration_days,
      sort_order    = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- 7. ADMIN ACCOUNT  ->  !!! CHANGE EMAIL + PASSWORD BEFORE RUNNING !!!
-- ----------------------------------------------------------------------------
do $$
declare
  v_admin_email text := 'admin@ncrjob.in';               -- <-- your admin email
  v_admin_pass  text := 'CHANGE_ME_BEFORE_RUNNING';      -- <-- your admin password
  v_admin_name  text := 'VMWjobs Admin';
  v_uid uuid;
begin
  if v_admin_pass = 'CHANGE_ME_BEFORE_RUNNING' or length(v_admin_pass) < 12 then
    raise exception 'Set a strong admin password (12+ characters) in section 7 before running this reset.';
  end if;

  select id into v_uid from auth.users where lower(email) = lower(v_admin_email) limit 1;

  if v_uid is null then
    v_uid := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_uid,
      'authenticated',
      'authenticated',
      v_admin_email,
      extensions.crypt(v_admin_pass, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', v_admin_name, 'role', 'admin'),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_uid,
      v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', v_admin_email, 'email_verified', true),
      'email',
      now(), now(), now()
    )
    on conflict (provider_id, provider) do nothing;
  else
    update auth.users
       set encrypted_password = extensions.crypt(v_admin_pass, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at         = now()
     where id = v_uid;
  end if;

  insert into public.profiles (id, name, email, role)
  values (v_uid, v_admin_name, v_admin_email, 'admin')
  on conflict (id) do update
    set name       = excluded.name,
        email      = excluded.email,
        role       = 'admin',
        updated_at = now();
end;
$$;

-- Make PostgREST pick up the new schema immediately.
notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- 8. QUICK VERIFY  (optional — safe to keep)
-- ----------------------------------------------------------------------------
-- select table_name from information_schema.tables where table_schema='public' order by 1;
-- select id, email, role from public.profiles;
-- select id, name, price_inr, job_limit, duration_days from public.plans;
-- select count(*) as categories_without_government from public.categories;
