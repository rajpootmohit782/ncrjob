import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        description,
        requirements,
        job_type,
        min_salary,
        max_salary,
        experience_min,
        experience_max,
        deadline,
        is_featured,
        created_at,
        employers (
          company_name,
          description,
          industry,
          location,
          whatsapp_number,
          is_verified
        ),
        categories (
          name
        ),
        locations (
          name
        )
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setError("Unable to load job details.");
    } else {
      setJob(data);
    }

    setLoading(false);
  }

  function formatSalary(min, max) {
    if (!min && !max) return "Not disclosed";

    const format = (value) =>
      Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      });

    if (min && max) {
      return `₹${format(min)} - ₹${format(max)}`;
    }

    if (min) {
      return `₹${format(min)}`;
    }

    return `₹${format(max)}`;
  }

  function formatExperience(min, max) {
    if (min === null && max === null) return "Not specified";

    if (min !== null && max !== null) {
      return `${min} - ${max} years`;
    }

    if (min !== null) {
      return `${min}+ years`;
    }

    return `Up to ${max} years`;
  }

  function getWhatsAppLink() {
    const rawNumber = job?.employers?.whatsapp_number || "";

    const whatsappNumber = rawNumber.replace(/[^0-9]/g, "");

    if (!whatsappNumber) {
      return "";
    }

    const message = `Hello, I am interested in the "${job.title}" position at ${
      job.employers?.company_name || "your company"
    }. I found this job on VMWjobs.`;

    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading job...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  if (!job) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Job not found.</p>
        <Link to="/jobs">Back to jobs</Link>
      </div>
    );
  }

  const whatsappLink = getWhatsAppLink();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <Link to="/jobs">← Back to jobs</Link>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          marginTop: "16px",
          backgroundColor: "#fff",
        }}
      >
        <h1 style={{ marginTop: 0 }}>{job.title}</h1>

        <p style={{ margin: "4px 0" }}>
          <strong>Company:</strong>{" "}
          {job.employers?.company_name || "Company"}
          {job.employers?.is_verified && (
            <span style={{ display: "inline-block", marginLeft: "8px", backgroundColor: "#dcfce7", color: "#166534", fontSize: "11px", fontWeight: "bold", padding: "3px 8px", borderRadius: "999px" }}>
              ✓ Verified employer
            </span>
          )}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Location:</strong> {job.locations?.name || "N/A"}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Category:</strong> {job.categories?.name || "N/A"}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Job Type:</strong> {job.job_type || "N/A"}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Salary:</strong>{" "}
          {formatSalary(job.min_salary, job.max_salary)}
        </p>

        <p style={{ margin: "4px 0" }}>
          <strong>Experience:</strong>{" "}
          {formatExperience(job.experience_min, job.experience_max)}
        </p>

        {job.deadline && (
          <p style={{ margin: "4px 0" }}>
            <strong>Apply Before:</strong>{" "}
            {new Date(job.deadline).toLocaleDateString()}
          </p>
        )}

        {job.is_featured && (
          <span
            style={{
              display: "inline-block",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "999px",
              marginTop: "8px",
            }}
          >
            Featured Job
          </span>
        )}
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          marginTop: "16px",
          backgroundColor: "#fff",
        }}
      >
        <h2>Description</h2>
        <p style={{ whiteSpace: "pre-line" }}>{job.description || "N/A"}</p>

        <h2>Requirements</h2>
        <p style={{ whiteSpace: "pre-line" }}>{job.requirements || "N/A"}</p>
      </div>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          marginTop: "16px",
          backgroundColor: "#fff",
          textAlign: "center",
        }}
      >
        <h2>Apply for this job</h2>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              backgroundColor: "#25D366",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Apply on WhatsApp
          </a>
        ) : (
          <p style={{ color: "red" }}>
            Employer WhatsApp number is not available for this job.
          </p>
        )}

        <p style={{ marginTop: "10px", color: "#555" }}>
          You will be redirected to the employer WhatsApp chat.
        </p>
      </div>
    </div>
  );
}