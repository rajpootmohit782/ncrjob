import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LockKeyhole, Mail, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { FormMessage } from "../../components/ui";
import useSeo from "../../hooks/useSeo";

export default function Login({ employerMode = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const title = employerMode ? "Employer Login" : "Login";
  useSeo({ title: `${title} | VMWjobs`, description: "Sign in to your VMWjobs account.", robots: "noindex,nofollow", path: employerMode ? "/employer-login" : "/login" });

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
    <div className="page-shell relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <div className="mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand">
              {employerMode ? <LogIn className="h-5 w-5" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
          </div>

          {error && (
            <div className="mb-4">
              <FormMessage type="error">{error}</FormMessage>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Logging in..." : title}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-muted">
            {!employerMode && (
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-brand hover:underline">Register</Link>
              </p>
            )}

            {employerMode && (
              <p>
                Normal user?{" "}
                <Link to="/login" className="font-semibold text-brand hover:underline">Go to normal login</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
