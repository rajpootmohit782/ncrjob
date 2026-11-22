import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Archive,
  BriefcaseBusiness,
  Check,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import { EmptyState, FormMessage, LoadingState } from "../../components/ui";
import { QUALIFICATION_OPTIONS } from "../../lib/qualifications";

function statusClasses(status) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (status === "closed") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all",
  );
  const [employerFilter, setEmployerFilter] = useState(
    () => searchParams.get("employer") || "all",
  );
  const [employers, setEmployers] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  function changeStatusFilter(value) {
    setStatusFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next, { replace: true });
  }

  function changeEmployerFilter(value) {
    setEmployerFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("employer");
    else next.set("employer", value);
    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, employerFilter]);

  useEffect(() => {
    let active = true;
    supabase
      .from("employers")
      .select("id, company_name")
      .order("company_name", { ascending: true })
      .limit(500)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error(error);
        else setEmployers(data || []);
      });
    return () => {
      active = false;
    };
  }, []);

  async function fetchJobs() {
    setLoading(true);
    setError("");
    setSuccess("");

    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        status,
        is_featured,
        qualification,
        created_at,
        employers (
          company_name,
          profiles (email)
        ),
        categories (
          name
        ),
        locations (
          name
        )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (employerFilter !== "all") {
      query = query.eq("employer_id", employerFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setError("Unable to load jobs.");
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  async function updateJob(jobId, payload, successMessage) {
    setActionLoadingId(jobId);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", jobId);

    if (error) {
      console.error(error);
      setError("Unable to update job.");
    } else {
      setSuccess(successMessage);
      await fetchJobs();
    }

    setActionLoadingId(null);
  }

  async function handleDelete(job) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${job.title}"?`,
    );

    if (!confirmDelete) return;

    setActionLoadingId(job.id);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("jobs").delete().eq("id", job.id);

    if (error) {
      console.error(error);
      setError("Unable to delete job.");
    } else {
      setSuccess("Job deleted successfully.");
      await fetchJobs();
    }

    setActionLoadingId(null);
  }

  const filters = ["all", "pending", "active", "rejected", "closed"];

  const actionButton =
    "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="page-shell">
      <div className="container-page max-w-6xl py-8 sm:py-12">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Manage Jobs</h1>

        <div className="mt-6">
          <AdminMenu />
        </div>

        {error && (
          <div className="mb-4">
            <FormMessage type="error">{error}</FormMessage>
          </div>
        )}
        {success && (
          <div className="mb-4">
            <FormMessage type="success">{success}</FormMessage>
          </div>
        )}

        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => changeStatusFilter(filter)}
              className={`inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-xs font-bold ring-1 transition-all duration-200 ${
                statusFilter === filter
                  ? "bg-brand text-white ring-brand shadow-md shadow-indigo-950/20"
                  : "bg-white text-slate-600 ring-line hover:bg-indigo-50 hover:text-brand"
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="employer-filter">
            Employer
          </label>
          <select
            id="employer-filter"
            value={employerFilter}
            onChange={(event) => changeEmployerFilter(event.target.value)}
            className="select min-h-10 max-w-full py-2 text-xs sm:w-72"
          >
            <option value="all">All employers</option>
            {employers.map((employer) => (
              <option key={employer.id} value={employer.id}>
                {employer.company_name || "No company name"}
              </option>
            ))}
          </select>
          {employerFilter !== "all" && (
            <button
              type="button"
              onClick={() => changeEmployerFilter("all")}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Clear employer filter
            </button>
          )}
          <span className="text-xs text-muted">{jobs.length} jobs shown (max 100)</span>
        </div>

        {loading ? (
          <LoadingState label="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <EmptyState icon={BriefcaseBusiness} title="No jobs found." />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-semibold">Job</th>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Qualification</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Featured</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-line/80 last:border-0 align-top">
                      <td className="px-4 py-4">
                        <strong className="block font-semibold text-ink">{job.title}</strong>
                        <Link to={`/jobs/${job.id}`} className="mt-1 inline-block text-xs font-semibold text-brand hover:underline">
                          View public page
                        </Link>
                      </td>

                      <td className="px-4 py-4 text-muted">
                        <span className="block">{job.employers?.company_name || "N/A"}</span>
                        {job.employers?.profiles?.email && (
                          <span className="mt-1 block text-xs">{job.employers.profiles.email}</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-muted">
                        {job.locations?.name || "N/A"}
                      </td>

                      <td className="px-4 py-4">
                        <label className="sr-only" htmlFor={`qualification-${job.id}`}>
                          Minimum qualification
                        </label>
                        <select
                          id={`qualification-${job.id}`}
                          value={job.qualification || "ANY"}
                          disabled={actionLoadingId === job.id}
                          onChange={(event) =>
                            updateJob(
                              job.id,
                              { qualification: event.target.value },
                              "Qualification updated.",
                            )
                          }
                          className="select min-h-9 w-40 py-1.5 pl-2.5 pr-8 text-xs"
                        >
                          {QUALIFICATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClasses(job.status)}`}>
                          {job.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-muted">
                        {job.is_featured ? "Yes" : "No"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {job.status !== "active" && (
                            <button
                              disabled={actionLoadingId === job.id}
                              onClick={() =>
                                updateJob(
                                  job.id,
                                  { status: "active" },
                                  "Job approved and published.",
                                )
                              }
                              className={`${actionButton} bg-emerald-600 text-white hover:bg-emerald-500`}
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Approve
                            </button>
                          )}

                          {job.status !== "rejected" && (
                            <button
                              disabled={actionLoadingId === job.id}
                              onClick={() =>
                                updateJob(
                                  job.id,
                                  { status: "rejected" },
                                  "Job rejected.",
                                )
                              }
                              className={`${actionButton} bg-rose-600 text-white hover:bg-rose-500`}
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              Reject
                            </button>
                          )}

                          {job.status !== "closed" && (
                            <button
                              disabled={actionLoadingId === job.id}
                              onClick={() =>
                                updateJob(
                                  job.id,
                                  { status: "closed" },
                                  "Job closed.",
                                )
                              }
                              className={`${actionButton} bg-slate-500 text-white hover:bg-slate-400`}
                            >
                              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                              Close
                            </button>
                          )}

                          <button
                            disabled={actionLoadingId === job.id}
                            onClick={() =>
                              updateJob(
                                job.id,
                                { is_featured: !job.is_featured },
                                "Featured status updated.",
                              )
                            }
                            className={`${actionButton} bg-amber-500 text-slate-950 hover:bg-amber-400`}
                          >
                            {job.is_featured ? (
                              <StarOff className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <Star className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {job.is_featured ? "Remove Featured" : "Make Featured"}
                          </button>

                          <button
                            disabled={actionLoadingId === job.id}
                            onClick={() => handleDelete(job)}
                            className={`${actionButton} bg-slate-900 text-white hover:bg-slate-700`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </button>
                        </div>

                        {actionLoadingId === job.id && (
                          <span className="mt-2 block text-xs text-muted">Processing...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
