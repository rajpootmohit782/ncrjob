import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "12px 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <Link to="/" style={{ textDecoration: "none", fontSize: "24px", fontWeight: "800", color: "#2563eb" }}>
          VM<span style={{ color: "#0f172a" }}>jobs</span>
        </Link>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#0f172a", fontWeight: "500" }}>Home</Link>
          <Link to="/jobs" style={{ textDecoration: "none", color: "#0f172a", fontWeight: "500" }}>All Jobs</Link>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/become-employer" style={{ textDecoration: "none", padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#0f172a", fontSize: "14px" }}>
              Post a Job
            </Link>
            <Link to="/employer-login" style={{ textDecoration: "none", padding: "8px 16px", backgroundColor: "#2563eb", borderRadius: "6px", color: "#fff", fontSize: "14px" }}>
              Employer Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}