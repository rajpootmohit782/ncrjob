import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useEmployer from "../../hooks/useEmployer";

export default function EmployerDashboard() {
  const { profile, signOut } = useAuth();
  const { employer, loading, error } = useEmployer();
  const navigate = useNavigate();

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
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>Employer Dashboard</h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
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
            Your company is pending approval. You may not be able to post jobs
            until admin activates your employer account.
          </p>
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