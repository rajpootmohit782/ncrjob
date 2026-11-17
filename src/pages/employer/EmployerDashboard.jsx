import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useEmployer from "../../hooks/useEmployer";
import { supabase } from "../../lib/supabaseClient";
import { formatDate } from "../../lib/format";

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

  function getStatusColor(status) {
    if (status === "active") return "#dcfce7";
    if (status === "pending") return "#fef3c7";
    if (status === "blocked") return "#fee2e2";
    return "#e5e7eb";
  }

  function getStatusTextColor(status) {
    if (status === "active") return "#166534";
    if (status === "pending") return "#92400e";
    if (status === "blocked") return "#991b1b";
    return "#374151";
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading employer dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  if (!employer) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No employer profile found for this account.</p>
        <Link to="/become-employer">Create an employer account</Link>
      </div>
    );
  }

  const isExpired =
    employer.subscription_expires_at &&
    new Date(employer.subscription_expires_at) < new Date();

  const needsPlan = employer.status !== "active" || isExpired;
  const outOfCredits = employer.job_limit != null && employer.job_limit <= 0;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>Employer Dashboard</h1>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            to="/employer/post-job"
            style={{
              padding: "8px 14px",
              backgroundColor: "#2563eb",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Post a Job
          </Link>
          <Link
            to="/employer/profile"
            style={{
              padding: "8px 14px",
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Edit Profile
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 14px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {employer.status === "blocked" && (
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px" }}>
          This account is blocked. Please contact support if you think this is a
          mistake.
        </div>
      )}

      {employer.status !== "blocked" && needsPlan && (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span>
            <strong>
              {employer.status === "active"
                ? "Your plan has expired."
                : "Your account is not active yet."}
            </strong>{" "}
            Choose a plan to publish jobs and receive applications.
          </span>
          <Link to="/become-employer" style={{ color: "#92400e", fontWeight: "bold" }}>
            Choose a plan →
          </Link>
        </div>
      )}

      {employer.status === "active" && !needsPlan && outOfCredits && (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span>
            <strong>You have used all job credits.</strong> Renew your plan to
            keep hiring.
          </span>
          <Link to="/become-employer" style={{ color: "#92400e", fontWeight: "bold" }}>
            Renew plan →
          </Link>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", backgroundColor: "#fff" }}>
          <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: "13px" }}>Job credits</p>
          <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: outOfCredits ? "#dc2626" : "#0f172a" }}>
            {employer.job_limit ?? 0}
          </p>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>Remaining job posts</p>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", backgroundColor: "#fff" }}>
          <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: "13px" }}>Plan valid till</p>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: isExpired ? "#dc2626" : "#0f172a" }}>
            {employer.subscription_expires_at
              ? formatDate(employer.subscription_expires_at)
              : "—"}
          </p>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>
            {isExpired ? "Expired — renew to continue" : "One-time plan"}
          </p>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", backgroundColor: "#fff" }}>
          <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: "13px" }}>Jobs posted</p>
          <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>{totalJobs}</p>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>Across all statuses</p>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "#fff",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {employer.company_name || "Your Company"}
        </h2>

        <p style={{ margin: "4px 0" }}>
          <strong>Logged in as:</strong> {profile?.name || "Employer"}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Company Status:</strong>{" "}
          <span
            style={{
              backgroundColor: getStatusColor(employer.status),
              color: getStatusTextColor(employer.status),
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "13px",
            }}
          >
            {employer.status}
          </span>
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Verified:</strong>{" "}
          {employer.is_verified ? "Yes" : "No"}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>WhatsApp Number:</strong>{" "}
          {employer.whatsapp_number || "Not added"}
        </p>

        {employer.status !== "active" && (
          <p style={{ color: "#b45309", marginTop: "10px" }}>
            Your account is not active yet. Choose a plan to start posting jobs.
          </p>
        )}
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "#fff",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Recent Jobs</h2>
          <Link to="/employer/post-job" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Post a job →
          </Link>
        </div>

        {jobsLoading ? (
          <p style={{ color: "#64748b" }}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            No jobs posted yet. Create your first listing to start receiving
            applications.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  padding: "12px 14px",
                  border: "1px solid #f1f5f9",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: "600", color: "#0f172a" }}>
                    {job.title}
                  </p>
                  <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>
                    {job.locations?.name || "Location not set"} •{" "}
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: getStatusColor(job.status),
                    color: getStatusTextColor(job.status),
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    textTransform: "capitalize",
                  }}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <Link
          to="/employer/profile"
          style={{
            textDecoration: "none",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "#fff",
            color: "#111",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Company Profile</h3>
          <p style={{ marginBottom: 0, color: "#555" }}>
            Update company details and WhatsApp number.
          </p>
        </Link>

        <Link
          to="/employer/post-job"
          style={{
            textDecoration: "none",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "#fff",
            color: "#111",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Post Job</h3>
          <p style={{ marginBottom: 0, color: "#555" }}>
            Create a new job listing for candidates.
          </p>
        </Link>
      </div>
    </div>
  );
}
