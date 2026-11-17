import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { FormMessage } from "../../components/ui";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

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

    if (profileRow?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This login is for admin accounts only.");
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  }

  return (
    <div className="page-shell relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Admin Login</h1>

          {error && (
            <div className="mt-5">
              <FormMessage type="error">{error}</FormMessage>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="admin-email">Admin Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="admin-email"
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
              <label className="label" htmlFor="admin-password">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="admin-password"
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
              {loading ? "Logging in..." : "Admin Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
