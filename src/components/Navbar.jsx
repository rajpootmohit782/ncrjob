import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { ArrowRightIcon, CloseIcon, MenuIcon } from "./Icons";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/jobs", label: "Browse jobs" },
  { to: "/become-employer", label: "For employers" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  const role = profile?.role;
  const dashboard =
    role === "admin"
      ? { to: "/admin/dashboard", label: "Admin dashboard" }
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
    <header className="site-header">
      <div className="container nav">
        <Logo />

        <nav className="nav-links" aria-label="Main navigation">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {!authLoading && dashboard ? (
            <Link to={dashboard.to} className="btn btn-ghost btn-sm nav-login">
              {dashboard.label}
            </Link>
          ) : !authLoading && !user ? (
            <Link to="/employer-login" className="btn btn-ghost btn-sm nav-login">
              Employer login
            </Link>
          ) : null}

          {!authLoading && role !== "admin" && (
            <Link to={postJobTo} className="btn btn-primary btn-sm">
              Post a job <ArrowRightIcon size={14} />
            </Link>
          )}

          {!authLoading && user && (
            <button
              type="button"
              className="btn btn-ghost btn-sm nav-login"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          )}

          <button
            type="button"
            className="nav-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" id="mobile-menu">
          <nav className="container" aria-label="Mobile navigation">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mobile-actions">
              <Link to="/jobs" className="btn btn-secondary btn-block">
                Browse jobs
              </Link>

              {dashboard ? (
                <Link to={dashboard.to} className="btn btn-secondary btn-block">
                  {dashboard.label}
                </Link>
              ) : !user ? (
                <Link
                  to="/employer-login"
                  className="btn btn-secondary btn-block"
                >
                  Employer login
                </Link>
              ) : null}

              {role !== "admin" && (
                <Link to={postJobTo} className="btn btn-primary btn-block">
                  Post a job
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
