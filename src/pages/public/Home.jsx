import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
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
      const [locationsRes, ...countResults] = await Promise.all([
        supabase
          .from("locations")
          .select("id, name")
          .eq("status", "active")
          .order("name"),
        ...QUALIFICATIONS.map(({ value }) =>
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "active")
            .in("qualification", [value, ANY_QUALIFICATION]),
        ),
      ]);

      if (cancelled) return;

      setLocations(locationsRes.data || []);

      const nextCounts = {};
      QUALIFICATIONS.forEach(({ value }, index) => {
        nextCounts[value] = countResults[index]?.count ?? 0;
      });
      setCounts(nextCounts);
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
      <div className="container-page pb-8 pt-3 sm:pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Jobs in Delhi NCR
        </h1>
        <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
          10th, 12th, ITI, diploma, graduate and B.Tech openings across Noida,
          Greater Noida, Gurugram and Delhi.
        </p>

        {/* Compact search — sticks under the navbar while the feed scrolls. */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="sticky top-[57px] z-40 mt-3 rounded-2xl border border-line bg-white/95 p-2 shadow-soft backdrop-blur-xl"
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
