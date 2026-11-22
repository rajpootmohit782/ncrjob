import { useCallback, useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, LoaderCircle, SearchX } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import JobCard, { JobCardSkeleton } from "./JobCard";
import { EmptyState } from "./ui";
import { formatSalary } from "../lib/format";
import { qualificationFilterValues } from "../lib/qualifications";

const PAGE_SIZE = 12;

const JOB_FIELDS = `
  id,
  title,
  job_type,
  min_salary,
  max_salary,
  is_featured,
  created_at,
  qualification,
  employers (contact_person),
  locations (id, name)
`;

/**
 * The public job feed: newest-first, 12 per page with a Load More button,
 * skeleton placeholders while loading and a friendly empty state.
 */
export default function JobFeed({
  keyword = "",
  locationId = "",
  qualification = "",
  heading = "Latest Jobs",
  onClearFilters,
}) {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const buildQuery = useCallback(
    (from, to) => {
      let query = supabase
        .from("jobs")
        .select(JOB_FIELDS, { count: "exact" })
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (keyword) {
        query = query.ilike("title", `%${keyword}%`);
      }

      if (locationId) {
        query = query.eq("location_id", locationId);
      }

      const qualificationValues = qualificationFilterValues(qualification);
      if (qualificationValues.length) {
        query = query.in("qualification", qualificationValues);
      }

      return query;
    },
    [keyword, locationId, qualification],
  );

  useEffect(() => {
    const requestId = ++requestRef.current;

    setLoading(true);
    setError("");

    (async () => {
      const { data, count, error: queryError } = await buildQuery(0, PAGE_SIZE - 1);

      // A newer filter change has superseded this request.
      if (requestId !== requestRef.current) return;

      if (queryError) {
        console.error(queryError);
        setJobs([]);
        setTotal(0);
        setError("Unable to load jobs right now. Please try again.");
      } else {
        setJobs(data || []);
        setTotal(count || 0);
      }

      setLoading(false);
    })();
  }, [buildQuery]);

  async function loadMore() {
    if (loadingMore || jobs.length >= total) return;

    const requestId = requestRef.current;
    setLoadingMore(true);

    const from = jobs.length;
    const { data, error: queryError } = await buildQuery(from, from + PAGE_SIZE - 1);

    if (requestId !== requestRef.current) return;

    if (queryError) {
      console.error(queryError);
      setError("Unable to load more jobs. Please try again.");
    } else if (data?.length) {
      setJobs((previous) => {
        const seen = new Set(previous.map((job) => job.id));
        return [...previous, ...data.filter((job) => !seen.has(job.id))];
      });
    }

    setLoadingMore(false);
  }

  const hasMore = jobs.length < total;

  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-ink sm:text-base">
          {heading} ({loading ? "…" : total})
        </h2>
        {total > 0 && !loading && (
          <span className="text-[11px] font-medium text-muted">
            Showing {jobs.length} of {total}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card px-5 py-8 text-center text-sm text-rose-700">{error}</div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No jobs match these filters"
          description="Try a different keyword, location or qualification — new openings are added every week."
          action={
            onClearFilters ? (
              <button type="button" onClick={onClearFilters} className="btn btn-primary">
                Clear filters
              </button>
            ) : null
          }
        />
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              salary={formatSalary(job.min_salary, job.max_salary)}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn btn-secondary min-w-40"
              >
                {loadingMore ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  <>
                    <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                    Load more jobs
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
