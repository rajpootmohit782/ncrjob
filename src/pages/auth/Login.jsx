import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

export default function Login({ employerMode = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const title = employerMode ? "Employer Login" : "Login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;

    if (!userId) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);
      setError("Unable to read profile after login.");
      setLoading(false);
      return;
    }

    if (employerMode) {
      if (profileRow?.role !== "employer") {
        await supabase.auth.signOut();
        setError("This login is for employer accounts only.");
        setLoading(false);
        return;
      }

      navigate("/employer-dashboard");
    } else if (profileRow?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (profileRow?.role === "employer") {
      navigate("/employer-dashboard");
    } else {
      navigate("/");
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>{title}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          {loading ? "Logging in..." : title}
        </button>
      </form>

      {!employerMode && (
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      )}

      {employerMode && (
        <p>
          Normal user? <Link to="/login">Go to normal login</Link>
        </p>
      )}
    </div>
  );
}