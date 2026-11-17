import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, name, "seeker");

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created. Taking you to the jobs page…");
    setLoading(false);
    window.setTimeout(() => navigate("/jobs"), 1500);
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "440px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Home
        </Link>

        <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: "20px" }}>
          <h1 style={{ fontSize: "26px", color: "#0f172a", margin: "0 0 8px" }}>
            Create your account
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}>
            Browsing jobs is free. An account is optional and helps you keep your
            details ready.
          </p>

          {error && (
            <p style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: "600", fontSize: "14px" }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", backgroundColor: "#dcfce7", color: "#166534", fontWeight: "600", fontSize: "14px" }}>
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
              />
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748b" }}>
                At least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "13px", background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)" }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#64748b" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#2563eb" }}>Sign in</Link>
          </p>

          <p style={{ textAlign: "center", marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
            Hiring?{" "}
            <Link to="/become-employer" style={{ color: "#2563eb" }}>Create an employer account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
