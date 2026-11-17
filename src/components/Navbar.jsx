import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const role = profile?.role;

  const dashboard =
    role === "admin"
      ? { to: "/admin/dashboard", label: "Admin Dashboard" }
      : role === "employer"
        ? { to: "/employer-dashboard", label: "Dashboard" }
        : null;

  const postJobTo =
    role === "employer" ? "/employer/post-job" : "/become-employer";

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <nav style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "12px 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <Link to="/" style={{ textDecoration: "none", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
          VMW<span style={{ color: "#2563eb" }}>jobs</span>
        </Link>

        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#0f172a", fontWeight: "500" }}>Home</Link>
          <Link to="/jobs" style={{ textDecoration: "none", color: "#0f172a", fontWeight: "500" }}>All Jobs</Link>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {!authLoading && dashboard && (
              <Link to={dashboard.to} style={{ textDecoration: "none", padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#0f172a", fontSize: "14px" }}>
                {dashboard.label}
              </Link>
            )}

            {!authLoading && role !== "admin" && (
              <Link to={postJobTo} style={{ textDecoration: "none", padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#0f172a", fontSize: "14px" }}>
                Post a Job
              </Link>
            )}

            {!authLoading && !user && (
              <Link to="/employer-login" style={{ textDecoration: "none", padding: "8px 16px", backgroundColor: "#2563eb", borderRadius: "6px", color: "#fff", fontSize: "14px" }}>
                Employer Login
              </Link>
            )}

            {!authLoading && user && (
              <button
                type="button"
                onClick={handleSignOut}
                style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#0f172a", fontSize: "14px", cursor: "pointer" }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
