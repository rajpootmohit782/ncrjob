-- ----------------------------------------------------------------------------
-- 03. QUALIFICATION-ONLY CATEGORY TAXONOMY
-- ----------------------------------------------------------------------------
-- Replaces the 17 legacy field categories (BPO, Data Entry, Sales, …) with the
-- six qualification categories used by the homepage tiles and the /jobs filter.
--
-- ⚠ DESTRUCTIVE: every row in public.categories is deleted.
--   jobs.category_id uses ON DELETE SET NULL, so existing jobs survive but lose
--   their category. Keep a backup if you care about the old ids:
--     create table public.categories_backup as select * from public.categories;
--
-- Keep this list in sync with src/lib/qualifications.js.
-- ----------------------------------------------------------------------------

begin;

delete from public.categories;

insert into public.categories (name, slug, status) values
  ('10th Pass Jobs',       '10th-pass-jobs',   'active'),
  ('12th Pass Jobs',       '12th-pass-jobs',   'active'),
  ('ITI Jobs',             'iti-jobs',         'active'),
  ('Diploma Jobs',         'diploma-jobs',     'active'),
  ('Graduation Jobs',      'graduate-jobs',    'active'),
  ('B.Tech / M.Tech Jobs', 'btech-mtech-jobs', 'active');

commit;

notify pgrst, 'reload schema';
