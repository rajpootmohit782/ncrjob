import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import JobFeed from "../../components/JobFeed";
import QualificationTiles from "../../components/QualificationTiles";
import {
  ANY_QUALIFICATION,
  QUALIFICATIONS,
  normalizeQualification,
} from "../../lib/qualifications";
import useSeo from "../../hooks/useSeo";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const keywordParam = (searchParams.get("keyword") || "").trim();
  const locationParam = searchParams.get("location") || "";
  const qualificationParam = normalizeQualification(
    searchParams.get("qualification"),
  );

  const [keyword, setKeyword] = useState(keywordParam);
  const [locations, setLocations] = useState([]);
  const [counts, setCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    activeEmployers: 0,
    activeLocations: 0,
  });

  useSeo({
    title:
      "Jobs in Delhi NCR — 10th, 12th, ITI, Diploma, Graduate & B.Tech Jobs | NCR Jobs",
    description:
      "Find private-sector jobs in Delhi NCR — Noida, Greater Noida, Gurugram and Delhi. Browse 10th pass, 12th pass, ITI, diploma, graduation and B.Tech / M.Tech jobs, updated daily.",
    path: "/",
  });

  // Keep the input in sync when the URL changes (back/forward, tile clicks).
  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [locationsRes, jobsCount, employersCount, ...countResults] =
        await Promise.all([
          supabase
            .from("locations")
            .select("id, name")
            .eq("status", "active")
            .order("name"),
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("employers")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          ...QUALIFICATIONS.map(({ value }) =>
            supabase
              .from("jobs")
              .select("*", { count: "exact", head: true })
              .eq("status", "active")
              .in("qualification", [value, ANY_QUALIFICATION]),
          ),
        ]);

      if (cancelled) return;

      const locationRows = locationsRes.data || [];
      setLocations(locationRows);

      const nextCounts = {};
      QUALIFICATIONS.forEach(({ value }, index) => {
        nextCounts[value] = countResults[index]?.count ?? 0;
      });
      setCounts(nextCounts);

      // Plain integers only — the old CountUp animation could render negative
      // numbers while interpolating, so the stats are no longer animated.
      setStats({
        activeJobs: Math.max(jobsCount.count ?? 0, 0),
        activeEmployers: Math.max(employersCount.count ?? 0, 0),
        activeLocations: locationRows.length,
      });

      setCountsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateParams(partial) {
    const params = new URLSearchParams(searchParams);

    Object.entries(partial).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    setSearchParams(params, { replace: true });
  }

  function handleSearch(event) {
    event.preventDefault();
    updateParams({
      keyword: keyword.trim(),
      location: locationParam,
      qualification: qualificationParam,
    });
  }

  function clearFilters() {
    setKeyword("");
    setSearchParams({}, { replace: true });
  }

  return (
    <div className="page-shell">
      <section className="hero-gradient relative overflow-hidden pb-12 pt-9 sm:pb-16 sm:pt-12">
        <div className="hero-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="hero-glow pointer-events-none absolute -right-24 top-4 h-72 w-72 rounded-full blur-3xl sm:h-96 sm:w-96" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" aria-hidden="true" />

        <div className="container-page relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-100 backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              Delhi NCR's private-sector job marketplace
            </span>

            <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find Your <span className="text-amber-400">Next Job</span> in NCR
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-indigo-100/80 sm:text-base">
              Connect with verified private-sector employers across Noida,
              Greater Noida, Gurugram and Delhi.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
              <div className="glass-chip flex items-center gap-2.5">
                <BriefcaseBusiness className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <div className="text-left">
                  <p className="font-display text-lg font-bold leading-none text-white">
                    {stats.activeJobs}
                  </p>
                  <p className="mt-1 text-[11px] text-indigo-100/80">Active Jobs</p>
                </div>
              </div>

              <div className="glass-chip flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <div className="text-left">
                  <p className="font-display text-lg font-bold leading-none text-white">
                    {stats.activeEmployers}
                  </p>
                  <p className="mt-1 text-[11px] text-indigo-100/80">Active Employers</p>
                </div>
              </div>

              <div className="glass-chip flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-sky-300" aria-hidden="true" />
                <div className="text-left">
                  <p className="font-display text-lg font-bold leading-none text-white">
                    {stats.activeLocations}
                  </p>
                  <p className="mt-1 text-[11px] text-indigo-100/80">Locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page pb-8 pt-3 sm:pt-4">
        {/* Compact search — sticks under the navbar while the feed scrolls. */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="sticky top-[57px] z-40 -mt-8 rounded-2xl border border-line bg-white/95 p-2 shadow-lift backdrop-blur-xl sm:-mt-10"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Job title or keyword"
                aria-label="Job title or keyword"
                className="input pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-44 sm:flex-none">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <select
                  value={locationParam}
                  onChange={(event) =>
                    updateParams({ location: event.target.value })
                  }
                  aria-label="Location"
                  className="select pl-9"
                >
                  <option value="">All locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary shrink-0 px-5">
                <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Go</span>
              </button>
            </div>
          </div>
        </form>

        <section className="mt-4" aria-labelledby="browse-qualification">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 id="browse-qualification" className="text-sm font-bold text-ink">
              Browse by Qualification
            </h2>
            {qualificationParam && (
              <button
                type="button"
                onClick={() => updateParams({ qualification: "" })}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <QualificationTiles
            active={qualificationParam}
            counts={counts}
            loading={countsLoading}
            onSelect={(value) => updateParams({ qualification: value })}
          />
        </section>

        <JobFeed
          keyword={keywordParam}
          locationId={locationParam}
          qualification={qualificationParam}
          heading="Latest Jobs"
          onClearFilters={clearFilters}
        />

        <Link
          to="/become-employer"
          className="mt-6 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-2.5 text-sm shadow-soft transition-all duration-200 hover:border-indigo-200 hover:shadow-lift"
        >
          <span className="min-w-0 truncate text-muted">
            <strong className="font-semibold text-ink">Hiring?</strong> Reach
            thousands of NCR candidates
          </span>
          <span className="link-arrow shrink-0">
            Post a Job
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  );
}
