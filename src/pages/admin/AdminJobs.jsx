import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import { statusTone } from "../../lib/format";
import {
  AlertIcon,
  BriefcaseIcon,
  CheckIcon,
  ExternalIcon,
  ShieldIcon,
} from "../../components/Icons";

const FILTERS = ["all", "pending", "active", "rejected", "closed"];

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  async function fetchJobs() {
    setLoading(true);

    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        status,
        is_featured,
        created_at,
        employers ( company_name ),
        categories ( name ),
        locations ( name )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error(fetchError);
      setError("Unable to load jobs right now.");
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  async function updateJob(jobId, payload, successMessage) {
    setActionLoadingId(jobId);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", jobId);

    if (updateError) {
      console.error(updateError);
      setError("Unable to update this job. Please try again.");
    } else {
      setSuccess(successMessage);
      await fetchJobs();
    }

    setActionLoadingId(null);
  }

  async function handleDelete(job) {
    const confirmDelete = window.confirm(
      `Delete "${job.title}" permanently? This cannot be undone.`,
    );

    if (!confirmDelete) return;

    setActionLoadingId(job.id);
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id);

    if (deleteError) {
      console.error(deleteError);
      setError("Unable to delete this job.");
    } else {
      setSuccess("Job deleted.");
      await fetchJobs();
    }

    setActionLoadingId(null);
  }

  return (
    <div className="page dash">
      <div className="container">
        <div className="dash-head">
          <div className="dash-title">
            <span className="avatar-lg">
              <BriefcaseIcon />
            </span>
            <div>
              <span className="eyebrow">Admin console</span>
              <h1>Jobs</h1>
              <p>Review, publish and manage every listing on VMWjobs.</p>
            </div>
          </div>

          <div className="dash-actions">
            <span className="badge badge-brand">
              {loading ? "Loading…" : `${jobs.length} shown`}
            </span>
            <Link className="btn btn-secondary btn-sm" to="/jobs">
              <ExternalIcon size={14} /> View public site
            </Link>
          </div>
        </div>

        <AdminMenu />

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="status">
            <CheckIcon />
            <span>{success}</span>
          </div>
        )}

        <div className="filter-bar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill${statusFilter === filter ? " active" : ""}`}
              onClick={() => {
                setStatusFilter(filter);
                setError("");
                setSuccess("");
              }}
            >
              {filter === "all" ? "All jobs" : filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="stack-sm">
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-ico">
              <BriefcaseIcon />
            </span>
            <h3>No jobs in this view</h3>
            <p>
              {statusFilter === "all"
                ? "Employers have not posted any jobs yet."
                : `There are no ${statusFilter} jobs right now.`}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => {
                  const busy = actionLoadingId === job.id;

                  return (
                    <tr key={job.id}>
                      <td>
                        <div className="cell-title">{job.title}</div>
                        <div className="cell-sub">
                          <Link to={`/jobs/${job.id}`}>View public page</Link>
                          {job.categories?.name ? ` · ${job.categories.name}` : ""}
                        </div>
                      </td>

                      <td>{job.employers?.company_name || "—"}</td>
                      <td>{job.locations?.name || "—"}</td>

                      <td>
                        <span className={`badge badge-${statusTone(job.status)}`}>
                          {job.status}
                        </span>
                      </td>

                      <td>
                        {job.is_featured ? (
                          <span className="badge badge-featured">Featured</span>
                        ) : (
                          <span className="muted small">—</span>
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          {job.status !== "active" && (
                            <button
                              className="btn btn-success btn-sm"
                              disabled={busy}
                              onClick={() =>
                                updateJob(
                                  job.id,
                                  { status: "active" },
                                  "Job approved and published.",
                                )
                              }
                            >
                              Approve
                            </button>
                          )}

                          {job.status !== "rejected" && (
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={busy}
                              onClick={() =>
                                updateJob(
                                  job.id,
                                  { status: "rejected" },
                                  "Job rejected.",
                                )
                              }
                            >
                              Reject
                            </button>
                          )}

                          {job.status !== "closed" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={busy}
                              onClick={() =>
                                updateJob(
                                  job.id,
                                  { status: "closed" },
                                  "Job closed.",
                                )
                              }
                            >
                              Close
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={busy}
                            onClick={() =>
                              updateJob(
                                job.id,
                                { is_featured: !job.is_featured },
                                "Featured status updated.",
                              )
                            }
                          >
                            {job.is_featured ? "Unfeature" : "Feature"}
                          </button>

                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={busy}
                            onClick={() => handleDelete(job)}
                          >
                            Delete
                          </button>

                          {busy && <span className="small muted">Working…</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="notice notice-info mt-2">
          <ShieldIcon />
          <div>
            <strong>Jobs go live only after approval.</strong> Check the pay,
            location and contact details before publishing a listing.
          </div>
        </div>
      </div>
    </div>
  );
}
