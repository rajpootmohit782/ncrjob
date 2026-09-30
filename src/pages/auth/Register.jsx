import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
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

    const { error: signUpError } = await signUp(email, password, name, role);
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created. Check your email to confirm your account.");
    setLoading(false);
    window.setTimeout(() => navigate("/login"), 2000);
  }

  return (
    <main className="auth-shell register-shell">
      <section className="auth-panel">
        <p className="eyebrow">NCR JOB / GET STARTED</p>
        <h1>Find your next right move.</h1>
        <p className="auth-copy">Create a focused profile and make the search feel more like progress.</p>

        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        {success && <p className="form-message form-message-success" role="status">{success}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete="new-password" />
          </label>
          <fieldset className="role-options">
            <legend>I am joining as</legend>
            <label className={role === "seeker" ? "role-option selected" : "role-option"}>
              <input type="radio" name="role" value="seeker" checked={role === "seeker"} onChange={(event) => setRole(event.target.value)} />
              <span><strong>Job seeker</strong><small>Discover work that fits.</small></span>
            </label>
            <label className={role === "employer" ? "role-option selected" : "role-option"}>
              <input type="radio" name="role" value="employer" checked={role === "employer"} onChange={(event) => setRole(event.target.value)} />
              <span><strong>Employer</strong><small>Find people who can.</small></span>
            </label>
          </fieldset>
          <button className="button button-wide" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
      <aside className="auth-aside register-aside" aria-label="NCR Job statement">
        <span className="aside-mark">N</span>
        <p>A better job search starts with a clear direction.</p>
      </aside>
    </main>
  );
}
