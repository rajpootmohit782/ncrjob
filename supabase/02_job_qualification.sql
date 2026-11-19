-- ----------------------------------------------------------------------------
-- 02. JOB QUALIFICATION TAXONOMY
-- ----------------------------------------------------------------------------
-- Adds the "minimum qualification" filter used by the homepage tiles and the
-- /jobs page. Non-destructive and safe to run more than once, both on a live
-- project and on a freshly reset database.
--
-- Run this in Supabase Dashboard -> SQL Editor, or with:
--   supabase db push
-- ----------------------------------------------------------------------------

-- 1. Enum (guarded so re-running does not fail).
do $$
begin
  create type public.job_qualification as enum (
    'TENTH',        -- 10th pass
    'TWELFTH',      -- 12th pass
    'ITI',          -- ITI certificate
    'DIPLOMA',      -- polytechnic diploma
    'GRADUATE',     -- graduation / bachelor's
    'BTECH_MTECH',  -- B.Tech / M.Tech
    'ANY'           -- no specific qualification
  );
exception
  when duplicate_object then null;
end;
$$;

-- 2. Column. The default backfills every existing row with ANY, so old jobs
--    keep showing up in every qualification filter until an employer edits
--    them. Postgres 11+ applies the constant default without a table rewrite.
alter table public.jobs
  add column if not exists qualification public.job_qualification not null default 'ANY';

-- 3. Belt and braces: normalise anything that slipped through as NULL.
update public.jobs
   set qualification = 'ANY'
 where qualification is null;

-- 4. Indexes that match the homepage feed queries
--    (status + qualification, newest first) and the tile counts.
create index if not exists jobs_status_qualification_created_idx
  on public.jobs (status, qualification, created_at desc);

create index if not exists jobs_qualification_idx
  on public.jobs (qualification);

-- 5. Make PostgREST pick up the new column immediately.
notify pgrst, 'reload schema';
