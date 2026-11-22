import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Grid2X2,
  LogOut,
  MapPin,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import { CountUp, FormMessage, LoadingState } from "../../components/ui";

const CARD_STYLES = {
  ink: { chip: "bg-slate-100 text-slate-600", value: "text-ink" },
  emerald: { chip: "bg-emerald-50 text-emerald-600", value: "text-emerald-600" },
  amber: { chip: "bg-amber-50 text-amber-600", value: "text-amber-600" },
  indigo: { chip: "bg-indigo-50 text-indigo-600", value: "text-indigo-600" },
  violet: { chip: "bg-violet-50 text-violet-600", value: "text-violet-600" },
  sky: { chip: "bg-sky-50 text-sky-600", value: "text-sky-600" },
  lime: { chip: "bg-lime-50 text-lime-600", value: "text-lime-600" },
};

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
    if (result.error) {
      throw result.error;
    }

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
      setError("Unable to load admin dashboard stats.");
    }

    setLoading(false);
  }

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  const cards = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      tone: "ink",
      icon: BriefcaseBusiness,
      to: "/admin/jobs",
      hint: "View all jobs",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      tone: "emerald",
      icon: CheckCircle2,
      to: "/admin/jobs?status=active",
      hint: "View published jobs",
    },
    {
      title: "Pending Jobs",
      value: stats.pendingJobs,
      tone: "amber",
      icon: Clock3,
      to: "/admin/jobs?status=pending",
      hint: "Approve pending jobs",
    },
    {
      title: "Total Employers",
      value: stats.totalEmployers,
      tone: "indigo",
      icon: Building2,
      to: "/admin/employers",
      hint: "View all employers",
    },
    {
      title: "Pending Employers",
      value: stats.pendingEmployers,
      tone: "violet",
      icon: Users,
      to: "/admin/employers?status=pending",
      hint: "Review pending employers",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      tone: "sky",
      icon: Grid2X2,
      to: "/admin/categories",
      hint: "Manage categories",
    },
    {
      title: "Locations",
      value: stats.totalLocations,
      tone: "lime",
      icon: MapPin,
      to: "/admin/locations",
      hint: "Manage locations",
    },
  ];

  return (
    <div className="page-shell">
      <div className="container-page max-w-6xl py-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Admin Dashboard
          </h1>

          <button onClick={handleLogout} className="btn btn-secondary min-h-10 px-4 py-2 text-xs text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>

        <AdminMenu />

        {error && (
          <div className="mb-5">
            <FormMessage type="error">{error}</FormMessage>
          </div>
        )}

        {loading ? (
          <LoadingState label="Loading dashboard stats..." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const style = CARD_STYLES[card.tone] || CARD_STYLES.ink;
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="card card-hover block p-5"
                  aria-label={`${card.title}: ${card.hint}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-muted">{card.title}</p>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.chip}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>

                  <p className={`mt-4 font-display text-3xl font-extrabold ${style.value}`}>
                    <CountUp value={card.value} />
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    {card.hint}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
