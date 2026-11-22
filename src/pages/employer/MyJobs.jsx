import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  SearchX,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";
import { formatDate } from "../../lib/format";
import { EmptyState, LoadingState } from "../../components/ui";

function statusClasses(status) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (status === "closed") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function MyJobs() {
  const { employer, loading: employerLoading, error: employerError } = useEmployer();

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employer?.id) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadJobs() {
      const { data, count, error } = await supabase
        .from("jobs")
        .select(
          "id, title, status, is_featured, created_at, deadline, locations(name), categories(name)",
          { count: "exact" },
        )
        .eq("employer_id", employer.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) console.error(error);
      setJobs(data || []);
      setTotal(count || 0);
      setLoading(false);
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, [employer?.id]);

  if (employerLoading || loading) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <LoadingState label="Loading your jobs..." />
        </div>
      </div>
    );
  }

  if (employerError) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {employerError}
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="card p-8 text-sm text-muted">Employer profile not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container-page py-8 sm:py-12">
        <Link to="/employer-dashboard" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand">
              <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">My Jobs</h1>
              <p className="mt-1 text-sm text-muted">
                {total} {total === 1 ? "job" : "jobs"} posted
              </p>
            </div>
          </div>

          <Link to="/employer/post-job" className="btn btn-accent min-h-10 px-4 py-2 text-xs">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post a Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No jobs posted yet"
            description="Create your first listing to start receiving applications."
            action={
              <Link to="/employer/post-job" className="btn btn-primary">
                Post a Job
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 break-words font-semibold text-ink">{job.title}</p>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${statusClasses(job.status)}`}
                    >
                      {job.status}
                    </span>
                    {job.is_featured && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {job.categories?.name || "No category"} •{" "}
                    {job.locations?.name || "Location not set"} • Posted{" "}
                    {formatDate(job.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {job.status === "active" && (
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn btn-secondary min-h-9 px-3 py-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      View
                    </Link>
                  )}
                  <Link
                    to={`/employer/edit-job/${job.id}`}
                    className="btn btn-primary min-h-9 px-3 py-1.5 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
