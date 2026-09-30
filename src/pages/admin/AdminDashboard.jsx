import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";

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
      color: "#0f172a",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      color: "#16a34a",
    },
    {
      title: "Pending Jobs",
      value: stats.pendingJobs,
      color: "#d97706",
    },
    {
      title: "Total Employers",
      value: stats.totalEmployers,
      color: "#2563eb",
    },
    {
      title: "Pending Employers",
      value: stats.pendingEmployers,
      color: "#9333ea",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      color: "#0891b2",
    },
    {
      title: "Locations",
      value: stats.totalLocations,
      color: "#65a30d",
    },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <AdminMenu />

      {loading && <p>Loading dashboard stats...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                backgroundColor: "#fff",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "#555",
                  fontSize: "14px",
                }}
              >
                {card.title}
              </p>

              <h2
                style={{
                  margin: 0,
                  color: card.color,
                }}
              >
                {card.value}
              </h2>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "24px",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        
      </div>
    </div>
  );
}