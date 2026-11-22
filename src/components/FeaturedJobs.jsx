import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import JobCard from "./JobCard";
import { formatSalary } from "../lib/format";

const FEATURED_FIELDS = `
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

const FEATURED_LIMIT = 6;

/**
 * Homepage highlight strip: the jobs an admin marked "Make Featured" in the
 * admin dashboard. Renders nothing when there are none, so the layout stays
 * clean before any job is featured.
 */
export default function FeaturedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(FEATURED_FIELDS)
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(FEATURED_LIMIT);

      if (cancelled) return;

      setJobs(error ? [] : data || []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || jobs.length === 0) return null;

  return (
    <section className="mt-5" aria-labelledby="featured-jobs">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2
          id="featured-jobs"
          className="flex items-center gap-1.5 text-sm font-bold text-ink sm:text-base"
        >
          <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
          Featured Jobs ({jobs.length})
        </h2>
        <span className="text-[11px] font-medium text-muted">
          Hand-picked by our team
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            salary={formatSalary(job.min_salary, job.max_salary)}
            featured
          />
        ))}
      </div>
    </section>
  );
}
