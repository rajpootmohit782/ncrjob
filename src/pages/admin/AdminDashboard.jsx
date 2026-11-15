import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import {
  AlertIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  ClockIcon,
  ExternalIcon,
  LogOutIcon,
  ShieldIcon,
} from "../../components/Icons";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    totalEmployers: 0,
    pendingEmployers: 0,
    totalCategories: 0,
    totalLocations: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  function getCount(result) {
    if (result.error) throw result.error;
    return result.count || 0;
  }

  async function fetchStats() {
    setLoading(true);
    setError("");

    try {
      const [
        totalJobs,
        activeJobs,
        pendingJobs,
        totalEmployers,
        pendingEmployers,
        totalCategories,
        totalLocations,
      ] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("employers").select("*", { count: "exact", head: true }),
        supabase
          .from("employers")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("locations").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalJobs: getCount(totalJobs),
        activeJobs: getCount(activeJobs),
        pendingJobs: getCount(pendingJobs),
        totalEmployers: getCount(totalEmployers),
        pendingEmployers: getCount(pendingEmployers),
        totalCategories: getCount(totalCategories),
        totalLocations: getCount(totalLocations),
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard stats right now.");
    }

    setLoading(false);
  }

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  const primaryStats = [
    {
      label: "Total jobs",
      value: stats.totalJobs,
      meta: "All listings",
    },
    {
      label: "Live jobs",
      value: stats.activeJobs,
      meta: "Visible to candidates",
    },
    {
      label: "Pending jobs",
      value: stats.pendingJobs,
      meta: "Awaiting review",
    },
    {
      label: "Employers",
      value: stats.totalEmployers,
      meta: "Registered companies",
    },
  ];

  const platformStats = [
    {
      label: "Pending employers",
      value: stats.pendingEmployers,
      meta: "Need a plan or approval",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      meta: "Job categories",
    },
    {
      label: "Locations",
      value: stats.totalLocations,
      meta: "NCR locations",
    },
  ];

  return (
    <div className="page dash">
      <div className="container">
        <div className="dash-head">
          <div className="dash-title">
            <span className="avatar-lg">
              <ShieldIcon />
            </span>
            <div>
              <span className="eyebrow">Admin console</span>
              <h1>Overview</h1>
              <p>Jobs, employers and listing health at a glance.</p>
            </div>
          </div>

          <div className="dash-actions">
            <Link className="btn btn-secondary btn-sm" to="/">
              <ExternalIcon size={14} /> View site
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOutIcon size={15} /> Sign out
            </button>
          </div>
        </div>

        <AdminMenu />

        {loading ? (
          <>
            <div className="stat-grid">
              <div className="skeleton" style={{ height: "6rem" }} />
              <div className="skeleton" style={{ height: "6rem" }} />
              <div className="skeleton" style={{ height: "6rem" }} />
              <div className="skeleton" style={{ height: "6rem" }} />
            </div>
          </>
        ) : error ? (
          <div className="alert alert-error">
            <AlertIcon />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {stats.pendingJobs > 0 && (
              <div className="notice notice-warn">
                <ClockIcon />
                <div className="grow">
                  <strong>
                    {stats.pendingJobs}{" "}
                    {stats.pendingJobs === 1 ? "listing is" : "listings are"}{" "}
                    awaiting review.
                  </strong>{" "}
                  Approve them to make them visible to candidates.
                </div>
                <Link className="btn btn-primary btn-sm" to="/admin/jobs">
                  Review jobs <ArrowRightIcon size={14} />
                </Link>
              </div>
            )}

            {stats.pendingEmployers > 0 && (
              <div className="notice notice-info">
                <BuildingIcon />
                <div className="grow">
                  <strong>
                    {stats.pendingEmployers}{" "}
                    {stats.pendingEmployers === 1 ? "employer is" : "employers are"}{" "}
                    pending activation.
                  </strong>{" "}
                  Check their payment status before approving.
                </div>
                <Link className="btn btn-secondary btn-sm" to="/admin/employers">
                  Review employers <ArrowRightIcon size={14} />
                </Link>
              </div>
            )}

            <div className="stat-grid">
              {primaryStats.map((card) => (
                <div className="card stat-card" key={card.label}>
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-meta">{card.meta}</div>
                </div>
              ))}
            </div>

            <section className="section">
              <div className="section-head">
                <div>
                  <h2>Quick actions</h2>
                  <p className="section-sub">
                    The tasks that keep the marketplace healthy.
                  </p>
                </div>
              </div>

              <div className="quick-grid">
                <Link className="quick-card" to="/admin/jobs">
                  <span className="quick-ico">
                    <BriefcaseIcon />
                  </span>
                  <div>
                    <h3>Review jobs</h3>
                    <p>Approve, reject, feature or close listings.</p>
                  </div>
                </Link>

                <Link className="quick-card" to="/admin/employers">
                  <span className="quick-ico">
                    <BuildingIcon />
                  </span>
                  <div>
                    <h3>Approve employers</h3>
                    <p>Check payments and activate company accounts.</p>
                  </div>
                </Link>

                <Link className="quick-card" to="/">
                  <span className="quick-ico">
                    <ExternalIcon />
                  </span>
                  <div>
                    <h3>View public site</h3>
                    <p>See the homepage and listings as candidates do.</p>
                  </div>
                </Link>
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <div>
                  <h2>Platform totals</h2>
                  <p className="section-sub">
                    Supporting data behind the marketplace.
                  </p>
                </div>
              </div>

              <div className="stat-grid">
                {platformStats.map((card) => (
                  <div className="card stat-card" key={card.label}>
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-meta">{card.meta}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
