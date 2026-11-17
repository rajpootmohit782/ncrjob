import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CreditCard,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useEmployer from "../../hooks/useEmployer";
import { supabase } from "../../lib/supabaseClient";
import { formatDate } from "../../lib/format";
import { EmptyState, LoadingState } from "../../components/ui";

function statusClasses(status) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "blocked") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

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
        .select("id, title, status, is_featured, created_at, locations(name)", {
          count: "exact",
        })
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
      <div className="page-shell">
        <div className="container-page py-12">
          <LoadingState label="Loading employer dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <EmptyState
            icon={Building2}
            title="No employer profile found for this account."
            action={
              <Link to="/become-employer" className="btn btn-primary">
                Create an employer account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
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
    <div className="page-shell">
      <div className="container-page py-8 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Employer Dashboard</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/employer/post-job" className="btn btn-accent min-h-10 px-4 py-2 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Post a Job
            </Link>
            <Link to="/employer/profile" className="btn btn-secondary min-h-10 px-4 py-2 text-xs">
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit Profile
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost min-h-10 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>

        {employer.status === "blocked" && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            This account is blocked. Please contact support if you think this is a
            mistake.
          </div>
        )}

        {employer.status !== "blocked" && needsPlan && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <span>
                <strong>
                  {employer.status === "active"
                    ? "Your plan has expired."
                    : "Your account is not active yet."}
                </strong>{" "}
                Choose a plan to publish jobs and receive applications.
              </span>
            </span>
            <Link to="/become-employer" className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-900 hover:underline">
              Choose a plan
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}

        {employer.status === "active" && !needsPlan && outOfCredits && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <span>
                <strong>You have used all job credits.</strong> Renew your plan to
                keep hiring.
              </span>
            </span>
            <Link to="/become-employer" className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-900 hover:underline">
              Renew plan
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Job credits</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className={`mt-4 font-display text-3xl font-extrabold ${outOfCredits ? "text-rose-600" : "text-ink"}`}>
              {employer.job_limit ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Remaining job posts</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Plan valid till</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className={`mt-4 text-lg font-bold ${isExpired ? "text-rose-600" : "text-ink"}`}>
              {employer.subscription_expires_at
                ? formatDate(employer.subscription_expires_at)
                : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isExpired ? "Expired — renew to continue" : "One-time plan"}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Jobs posted</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-ink">{totalJobs}</p>
            <p className="mt-1 text-xs text-slate-400">Across all statuses</p>
          </div>
        </div>

        <div className="card mt-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-brand">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">{employer.company_name || "Your Company"}</h2>
                <p className="mt-1 text-sm text-muted">
                  <strong className="text-ink">Logged in as:</strong> {profile?.name || "Employer"}
                </p>
              </div>
            </div>
            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusClasses(employer.status)}`}>
              {employer.status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Company Status</p>
              <p className="mt-1 font-semibold capitalize text-ink">{employer.status}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Verified</p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-semibold text-ink">
                {employer.is_verified ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Yes
                  </>
                ) : (
                  "No"
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">WhatsApp Number</p>
              <p className="mt-1 font-semibold text-ink">{employer.whatsapp_number || "Not added"}</p>
            </div>
          </div>

          {employer.status !== "active" && (
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-700">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Your account is not active yet. Choose a plan to start posting jobs.
            </p>
          )}
        </div>

        <div className="card mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">Recent Jobs</h2>
            <Link to="/employer/post-job" className="link-arrow">
              Post a job
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {jobsLoading ? (
            <p className="mt-5 text-sm text-muted">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="mt-5 text-sm leading-6 text-muted">
              No jobs posted yet. Create your first listing to start receiving
              applications.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-slate-50/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-ink">{job.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {job.locations?.name || "Location not set"} •{" "}
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusClasses(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link to="/employer/profile" className="card card-hover group p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Company Profile</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Update company details and WhatsApp number.
            </p>
          </Link>

          <Link to="/employer/post-job" className="card card-hover group p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Post Job</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Create a new job listing for candidates.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
