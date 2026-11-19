import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

const NEW_JOB_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function isNewJob(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < NEW_JOB_WINDOW_MS;
}

export default function JobCard({ job, salary }) {
  const company = job.employers?.company_name || "Company";
  const location = job.locations?.name || "";
  const fresh = isNewJob(job.created_at);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card group block p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lift sm:grid sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_auto_auto] sm:items-center sm:gap-4 sm:px-5 sm:py-4"
    >
      <div className="min-w-0">
        <h3 className="break-words text-sm font-bold leading-5 text-ink transition-colors group-hover:text-brand sm:text-base">
          {job.title}
          {fresh && <span className="badge-new ml-2 align-middle">New</span>}
        </h3>

        {location && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="chip">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {location}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 sm:contents">
        <p className="min-w-0 break-words text-xs font-medium text-brand sm:text-sm">
          {company}
        </p>
        <p className="shrink-0 text-sm font-bold text-emerald-600 sm:text-right">
          {salary}
        </p>
        <span className="btn btn-primary min-h-9 shrink-0 px-3 py-1.5 text-xs">
          Apply
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="card p-4 sm:grid sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_auto_auto] sm:items-center sm:gap-4 sm:px-5 sm:py-4">
      <div>
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton mt-2 h-5 w-20 rounded-full" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 sm:contents">
        <div className="skeleton h-4 w-1/2 sm:w-3/4" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
}
