import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AlertIcon } from "../../components/Icons";

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

    setSuccess("Account created. Taking you to the homepage…");
    setLoading(false);
    window.setTimeout(() => navigate("/"), 1500);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <h1>Create your account</h1>
          <p>Save your details and keep your job search in one place.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="status">
              <span>{success}</span>
            </div>
          )}

          <label className="field">
            <span className="field-label">Full name</span>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </label>

          <label className="field">
            <span className="field-label">Email address</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
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
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </label>

          <button
            className="btn btn-primary btn-lg btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          Hiring instead?{" "}
          <Link to="/become-employer">Create an employer account</Link>
          <br />
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

        <p className="auth-foot">
          <Link to="/">← Back to VMWjobs</Link>
        </p>
      </div>
    </div>
  );
}
