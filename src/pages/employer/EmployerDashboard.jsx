import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useEmployer from "../../hooks/useEmployer";
import { supabase } from "../../lib/supabaseClient";
import { formatDate, initials, statusTone } from "../../lib/format";
import {
  AlertIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  CreditCardIcon,
  ExternalIcon,
  FileTextIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
} from "../../components/Icons";

export default function EmployerDashboard() {
  const { profile, signOut } = useAuth();
  const { employer, loading, error } = useEmployer();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    if (!employer?.id) {
      setJobsLoading(false);
      return;
    }

    let active = true;

    async function loadJobs() {
      const { data, count } = await supabase
        .from("jobs")
        .select(
          "id, title, status, is_featured, created_at, locations(name)",
          { count: "exact" },
        )
        .eq("employer_id", employer.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!active) return;

      setJobs(data || []);
      setTotalJobs(count || 0);
      setJobsLoading(false);
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, [employer?.id]);

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="skeleton" style={{ height: "4rem", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ height: "9rem" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <span className="empty-ico">
              <AlertIcon />
            </span>
            <h1>Dashboard unavailable</h1>
            <p>{error}</p>
            <button className="btn btn-secondary btn-sm mt-2" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <span className="empty-ico">
              <BuildingIcon />
            </span>
            <h1>No company profile yet</h1>
            <p>
              Create your employer account and choose a plan to start posting
              jobs.
            </p>
            <Link className="btn btn-primary btn-sm mt-2" to="/become-employer">
              Create employer account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired =
    employer.subscription_expires_at &&
    new Date(employer.subscription_expires_at) < new Date();

  const needsPlan = employer.status !== "active" || isExpired;
  const outOfCredits = employer.job_limit != null && employer.job_limit <= 0;

  return (
    <div className="page dash">
      <div className="container">
        <div className="dash-head">
          <div className="dash-title">
            <span className="avatar-lg">{initials(employer.company_name)}</span>
            <div>
              <span className="eyebrow">Employer workspace</span>
              <h1>{employer.company_name}</h1>
              <p>Signed in as {profile?.name || profile?.email || "Employer"}</p>
            </div>
          </div>

          <div className="dash-actions">
            <Link className="btn btn-primary btn-sm" to="/employer/post-job">
              <PlusIcon size={15} /> Post a job
            </Link>
            <Link className="btn btn-secondary btn-sm" to="/employer/profile">
              <PencilIcon size={15} /> Edit profile
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOutIcon size={15} /> Sign out
            </button>
          </div>
        </div>

        {employer.status === "blocked" && (
          <div className="alert alert-error">
            <AlertIcon />
            <span>
              This account is blocked. Please contact support if you think this
              is a mistake.
            </span>
          </div>
        )}

        {employer.status !== "blocked" && needsPlan && (
          <div className="notice notice-warn">
            <AlertIcon />
            <div className="grow">
              <strong>Your account is not active yet.</strong> Choose a plan to
              publish jobs and receive applications.
            </div>
            <Link className="btn btn-primary btn-sm" to="/become-employer">
              Choose a plan <ArrowRightIcon size={14} />
            </Link>
          </div>
        )}

        {employer.status === "active" && !needsPlan && outOfCredits && (
          <div className="notice notice-warn">
            <AlertIcon />
            <div className="grow">
              <strong>You have used all job credits.</strong> Renew your plan to
              keep hiring.
            </div>
            <Link className="btn btn-primary btn-sm" to="/become-employer">
              Renew plan <ArrowRightIcon size={14} />
            </Link>
          </div>
        )}

        <div className="stat-grid mt-2">
          <div className="card stat-card">
            <div className="stat-label">Account status</div>
            <div className="stat-value">
              <span className={`badge badge-${statusTone(employer.status)}`}>
                {employer.status}
              </span>
            </div>
            <div className="stat-meta">
              {employer.is_verified ? "Verified employer" : "Verification pending"}
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Job credits</div>
            <div className="stat-value">{employer.job_limit ?? 0}</div>
            <div className="stat-meta">Remaining job posts</div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Plan valid till</div>
            <div className="stat-value">
              {employer.subscription_expires_at
                ? formatDate(employer.subscription_expires_at)
                : "—"}
            </div>
            <div className="stat-meta">
              {isExpired ? "Expired — renew to continue" : "One-time plan"}
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Jobs posted</div>
            <div className="stat-value">{totalJobs}</div>
            <div className="stat-meta">Across all statuses</div>
          </div>
        </div>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Quick actions</h2>
              <p className="section-sub">Everything you need to keep hiring.</p>
            </div>
          </div>

          <div className="quick-grid">
            <Link className="quick-card" to="/employer/post-job">
              <span className="quick-ico">
                <FileTextIcon />
              </span>
              <div>
                <h3>Post a job</h3>
                <p>Create a new listing for candidates in NCR.</p>
              </div>
            </Link>

            <Link className="quick-card" to="/employer/profile">
              <span className="quick-ico">
                <BuildingIcon />
              </span>
              <div>
                <h3>Company profile</h3>
                <p>Update your details and WhatsApp number.</p>
              </div>
            </Link>

            <Link className="quick-card" to="/jobs">
              <span className="quick-ico">
                <ExternalIcon />
              </span>
              <div>
                <h3>View public jobs</h3>
                <p>See your listings the way candidates do.</p>
              </div>
            </Link>

            <Link className="quick-card" to="/become-employer">
              <span className="quick-ico">
                <CreditCardIcon />
              </span>
              <div>
                <h3>Plans & billing</h3>
                <p>Renew or upgrade your job posting plan.</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Recent jobs</h2>
              <p className="section-sub">Your five most recent listings.</p>
            </div>
            <Link to="/employer/post-job" className="link-arrow">
              Post a job <ArrowRightIcon size={15} />
            </Link>
          </div>

          {jobsLoading ? (
            <div className="skeleton" style={{ height: "10rem" }} />
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-ico">
                <BriefcaseIcon />
              </span>
              <h3>No jobs posted yet</h3>
              <p>
                Publish your first role and start receiving applications on
                WhatsApp.
              </p>
              <Link className="btn btn-primary btn-sm mt-2" to="/employer/post-job">
                Post your first job
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="cell-title">
                          {job.title}
                          {job.is_featured && (
                            <span className="badge badge-featured">Featured</span>
                          )}
                        </div>
                      </td>
                      <td>{job.locations?.name || "—"}</td>
                      <td>
                        <span className={`badge badge-${statusTone(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="muted">{formatDate(job.created_at)}</td>
                      <td>
                        <Link className="btn btn-secondary btn-sm" to={`/jobs/${job.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {!employer.whatsapp_number && (
          <div className="notice notice-info mt-2">
            <ShieldIcon />
            <div className="grow">
              <strong>Add a WhatsApp number to receive applications.</strong>{" "}
              Candidates apply by messaging this number from your job pages.
            </div>
            <Link className="btn btn-secondary btn-sm" to="/employer/profile">
              Add number
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
