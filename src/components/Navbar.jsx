import { Link, useNavigate } from "react-router-dom";
import { Briefcase, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const role = profile?.role;

  const dashboard =
    role === "admin"
      ? { to: "/admin/dashboard", label: "Admin Dashboard" }
      : role === "employer"
        ? { to: "/employer-dashboard", label: "Dashboard" }
        : null;

  const postJobTo =
    role === "employer" ? "/employer/post-job" : "/become-employer";

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-2.5">
        <Link to="/" className="group flex min-h-11 items-center gap-2.5" aria-label="VMWjobs home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/20 transition-transform duration-200 group-hover:-rotate-3">
            <Briefcase className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            VMW<span className="text-brand">jobs</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-600 transition-colors hover:text-brand"
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-600 transition-colors hover:text-brand"
            >
              All Jobs
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!authLoading && dashboard && (
              <Link to={dashboard.to} className="btn btn-secondary min-h-10 px-4 py-2 text-xs">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {dashboard.label}
              </Link>
            )}

            {!authLoading && role !== "admin" && (
              <Link to={postJobTo} className="btn btn-accent min-h-10 px-4 py-2 text-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Post a Job
              </Link>
            )}

            {!authLoading && !user && (
              <Link to="/employer-login" className="btn btn-primary min-h-10 px-4 py-2 text-xs">
                Employer Login
              </Link>
            )}

            {!authLoading && user && (
              <button type="button" onClick={handleSignOut} className="btn btn-ghost min-h-10 px-3 py-2 text-xs">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
