import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { AlertIcon, ShieldIcon } from "../../components/Icons";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

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
      setError("Unable to read profile after login.");
      setLoading(false);
      return;
    }

    if (profileRow?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This sign-in is for admin accounts only.");
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <h1>Admin sign in</h1>
          <p>Review employers, jobs and listing activity.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <label className="field">
            <span className="field-label">Admin email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="admin@vmwjobs.in"
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
            {loading ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>

        <p className="auth-foot">
          <ShieldIcon size={13} /> Restricted area ·{" "}
          <Link to="/">Back to VMWjobs</Link>
        </p>
      </div>
    </div>
  );
}
