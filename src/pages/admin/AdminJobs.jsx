import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  async function fetchJobs() {
    setLoading(true);
    setError("");
    setSuccess("");

    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        status,
        is_featured,
        created_at,
        employers (
          company_name
        ),
        categories (
          name
        ),
        locations (
          name
        )
        `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setError("Unable to load jobs.");
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  async function updateJob(jobId, payload, successMessage) {
    setActionLoadingId(jobId);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", jobId);

    if (error) {
      console.error(error);
      setError("Unable to update job.");
    } else {
      setSuccess(successMessage);
      await fetchJobs();
    }

    setActionLoadingId(null);
  }

  async function handleDelete(job) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmDelete) return;

    setActionLoadingId(job.id);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id);

    if (error) {
      console.error(error);
      setError("Unable to delete job.");
    } else {
      setSuccess("Job deleted successfully.");
      await fetchJobs();
    }

    setActionLoadingId(null);
  }

  function getStatusStyle(status) {
    if (status === "active") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "pending") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "rejected") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (status === "closed") {
      return {
        backgroundColor: "#e5e7eb",
        color: "#374151",
      };
    }

    return {
      backgroundColor: "#e5e7eb",
      color: "#111",
    };
  }

  const filters = ["all", "pending", "active", "rejected", "closed"];

  const smallButtonStyle = {
    padding: "6px 10px",
    marginRight: "6px",
    marginBottom: "6px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
      <h1>Manage Jobs</h1>

      <AdminMenu />

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ marginBottom: "16px" }}>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            style={{
              padding: "8px 14px",
              marginRight: "8px",
              marginBottom: "8px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              backgroundColor:
                statusFilter === filter ? "#0f172a" : "#fff",
              color: statusFilter === filter ? "#fff" : "#111",
            }}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p>Loading jobs...</p>}

      {!loading && jobs.length === 0 && <p>No jobs found.</p>}

      {!loading && jobs.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px" }}>Job</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Company</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Location</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Featured</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  style={{
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <td style={{ padding: "10px" }}>
                    <strong>{job.title}</strong>
                    <br />
                    <Link
                      to={`/jobs/${job.id}`}
                      style={{
                        fontSize: "13px",
                        color: "#2563eb",
                        textDecoration: "none",
                      }}
                    >
                      View public page
                    </Link>
                  </td>

                  <td style={{ padding: "10px" }}>
                    {job.employers?.company_name || "N/A"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {job.locations?.name || "N/A"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        ...getStatusStyle(job.status),
                      }}
                    >
                      {job.status}
                    </span>
                  </td>

                  <td style={{ padding: "10px" }}>
                    {job.is_featured ? "Yes" : "No"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {job.status !== "active" && (
                      <button
                        disabled={actionLoadingId === job.id}
                        onClick={() =>
                          updateJob(
                            job.id,
                            { status: "active" },
                            "Job approved and published."
                          )
                        }
                        style={{
                          ...smallButtonStyle,
                          backgroundColor: "#16a34a",
                          color: "#fff",
                        }}
                      >
                        Approve
                      </button>
                    )}

                    {job.status !== "rejected" && (
                      <button
                        disabled={actionLoadingId === job.id}
                        onClick={() =>
                          updateJob(
                            job.id,
                            { status: "rejected" },
                            "Job rejected."
                          )
                        }
                        style={{
                          ...smallButtonStyle,
                          backgroundColor: "#dc2626",
                          color: "#fff",
                        }}
                      >
                        Reject
                      </button>
                    )}

                    {job.status !== "closed" && (
                      <button
                        disabled={actionLoadingId === job.id}
                        onClick={() =>
                          updateJob(
                            job.id,
                            { status: "closed" },
                            "Job closed."
                          )
                        }
                        style={{
                          ...smallButtonStyle,
                          backgroundColor: "#6b7280",
                          color: "#fff",
                        }}
                      >
                        Close
                      </button>
                    )}

                    <button
                      disabled={actionLoadingId === job.id}
                      onClick={() =>
                        updateJob(
                          job.id,
                          { is_featured: !job.is_featured },
                          "Featured status updated."
                        )
                      }
                      style={{
                        ...smallButtonStyle,
                        backgroundColor: "#d97706",
                        color: "#fff",
                      }}
                    >
                      {job.is_featured ? "Remove Featured" : "Make Featured"}
                    </button>

                    <button
                      disabled={actionLoadingId === job.id}
                      onClick={() => handleDelete(job)}
                      style={{
                        ...smallButtonStyle,
                        backgroundColor: "#0f172a",
                        color: "#fff",
                      }}
                    >
                      Delete
                    </button>

                    {actionLoadingId === job.id && (
                      <span style={{ fontSize: "12px", color: "#555" }}>
                        Processing...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}