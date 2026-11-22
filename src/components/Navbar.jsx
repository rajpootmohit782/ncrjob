import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = profile?.role;

  const dashboard =
    role === "admin"
      ? { to: "/admin/dashboard", label: "Admin Dashboard" }
      : role === "employer"
        ? { to: "/employer-dashboard", label: "Dashboard" }
        : null;

  const postJobTo =
    role === "employer" ? "/employer/post-job" : "/become-employer";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center justify-between gap-2">
        <Link
          to="/"
          className="group flex min-h-11 shrink-0 items-center gap-2"
          aria-label="VMW NCR Jobs home"
        >
          <img
            src="/vmw-ncr-jobs-logo.png"
            alt=""
            width="36"
            height="36"
            className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain ring-1 ring-slate-200/80 transition-transform duration-200 group-hover:-rotate-3 sm:h-9 sm:w-9"
          />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display text-base font-extrabold tracking-tight sm:text-lg">
              <span className="text-amber-500">VMW</span>{" "}
              <span className="text-brand">NCR Jobs</span>
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
              www.vmwncrjob.in
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex sm:gap-2">
          <Link
            to="/jobs"
            className="inline-flex min-h-11 items-center px-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-brand"
          >
            Jobs
          </Link>

          {!authLoading && dashboard && (
            <Link
              to={dashboard.to}
              className="btn btn-secondary min-h-11 px-2.5 py-2 text-xs"
              aria-label={dashboard.label}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">{dashboard.label}</span>
            </Link>
          )}

          {!authLoading && role !== "admin" && (
            <Link to={postJobTo} className="btn btn-accent min-h-11 px-3 py-2 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Post a Job</span>
              <span className="sm:hidden">Post</span>
            </Link>
          )}

          {!authLoading && !user && (
            <Link to="/employer-login" className="btn btn-primary min-h-11 px-3 py-2 text-xs">
              Employer Login
            </Link>
          )}

          {!authLoading && user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-ghost min-h-11 px-2.5 py-2 text-xs"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          )}
        </div>

        {/* Mobile navigation: full brand + employer shortcut + menu */}
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          {!authLoading && !user && (
            <Link
              to="/employer-login"
              className="btn btn-primary min-h-10 px-2.5 py-1.5 text-xs"
            >
              Employer
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-lg sm:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/jobs" className="mobile-nav-link">
              Browse Jobs
            </Link>

            {!authLoading && role !== "admin" && (
              <Link to={postJobTo} className="mobile-nav-link">
                {role === "employer" ? "Post a Job" : "Become an Employer"}
              </Link>
            )}

            {!authLoading && dashboard && (
              <Link to={dashboard.to} className="mobile-nav-link">
                {dashboard.label}
              </Link>
            )}

            {!authLoading && !user && (
              <Link to="/login" className="mobile-nav-link">
                Candidate Login
              </Link>
            )}

            {!authLoading && user && (
              <button type="button" onClick={handleSignOut} className="mobile-nav-link text-left text-rose-600">
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
