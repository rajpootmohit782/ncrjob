import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { AlertIcon } from "../../components/Icons";

export default function Login({ employerMode = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const title = employerMode ? "Employer sign in" : "Sign in";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
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
      setError("Unable to read your profile after login.");
      setLoading(false);
      return;
    }

    if (employerMode) {
      if (profileRow?.role !== "employer") {
        await supabase.auth.signOut();
        setError(
          "This sign-in is for employer accounts only. Job seekers can browse without an account.",
        );
        setLoading(false);
        return;
      }

      navigate("/employer-dashboard");
      return;
    }

    if (profileRow?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (profileRow?.role === "employer") {
      navigate("/employer-dashboard");
    } else {
      navigate("/");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <h1>{title}</h1>
          <p>
            {employerMode
              ? "Access your hiring dashboard and job listings."
              : "Sign in to manage your VMWjobs account."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <label className="field">
            <span className="field-label">Email address</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
            />
          </label>

          <button
            className="btn btn-primary btn-lg btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : title}
          </button>
        </form>

        {employerMode ? (
          <p className="auth-switch">
            New to VMWjobs?{" "}
            <Link to="/become-employer">Create an employer account</Link>
          </p>
        ) : (
          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
            {" · "}
            <Link to="/employer-login">Employer sign in</Link>
          </p>
        )}

        <p className="auth-foot">
          <Link to="/">← Back to VMWjobs</Link>
        </p>
      </div>
    </div>
  );
}
