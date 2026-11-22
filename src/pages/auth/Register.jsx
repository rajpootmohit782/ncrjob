import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FormMessage } from "../../components/ui";
import useSeo from "../../hooks/useSeo";

export default function Register() {
  useSeo({ title: "Create an Account | VMWjobs", description: "Create a free VMWjobs candidate account.", robots: "noindex,nofollow", path: "/register" });
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
    <div className="page-shell relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-lg">
        <Link to="/" className="link-arrow mb-5">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <div className="card p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Browsing jobs is free. An account is optional and helps you keep your
            details ready.
          </p>

          {error && (
            <div className="mt-5">
              <FormMessage type="error">{error}</FormMessage>
            </div>
          )}

          {success && (
            <div className="mt-5">
              <FormMessage type="success">{success}</FormMessage>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="input"
              />
              <p className="mt-1.5 text-xs text-muted">At least 6 characters.</p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-muted">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
            </p>
            <p className="text-xs">
              Hiring?{" "}
              <Link to="/become-employer" className="font-semibold text-brand hover:underline">Create an employer account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
