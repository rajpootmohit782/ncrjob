import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";

export default function PostJob() {
  const { employer, loading: employerLoading, error: employerError } = useEmployer();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    title: "",
    category_id: "",
    location_id: "",
    job_type: "full-time",
    min_salary: "",
    max_salary: "",
    experience_min: "",
    experience_max: "",
    deadline: "",
    description: "",
    requirements: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (!error) {
      setCategories(data || []);
    }
  }

  async function fetchLocations() {
    const { data, error } = await supabase
      .from("locations")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (!error) {
      setLocations(data || []);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!employer) {
      setMessage("Employer profile not found.");
      setMessageType("error");
      return;
    }

    if (employer.status !== "active") {
      setMessage(
        "Your employer account is not active yet. Admin must approve your company before you can post jobs."
      );
      setMessageType("error");
      return;
    }

    if (!form.title.trim()) {
      setMessage("Job title is required.");
      setMessageType("error");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Job description is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const payload = {
      employer_id: employer.id,
      title: form.title.trim(),
      category_id: form.category_id || null,
      location_id: form.location_id || null,
      job_type: form.job_type,
      min_salary: toNumberOrNull(form.min_salary),
      max_salary: toNumberOrNull(form.max_salary),
      experience_min: toNumberOrNull(form.experience_min),
      experience_max: toNumberOrNull(form.experience_max),
      deadline: form.deadline || null,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      status: "pending",
    };

    const { error } = await supabase.from("jobs").insert(payload);

    if (error) {
      console.error(error);

      if (error.message.includes("row-level security")) {
        setMessage(
          "Your employer account is not active yet. Admin must approve your company before you can post jobs."
        );
      } else {
        setMessage("Unable to create job. Please try again.");
      }

      setMessageType("error");
    } else {
      setMessage("Job created successfully. It is pending admin approval.");
      setMessageType("success");

      setForm({
        title: "",
        category_id: "",
        location_id: "",
        job_type: "full-time",
        min_salary: "",
        max_salary: "",
        experience_min: "",
        experience_max: "",
        deadline: "",
        description: "",
        requirements: "",
      });
    }

    setSaving(false);
  }

  if (employerLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (employerError) {
    return <div style={{ padding: "20px", color: "red" }}>{employerError}</div>;
  }

  if (!employer) {
    return <div style={{ padding: "20px" }}>Employer profile not found.</div>;
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      <Link to="/employer-dashboard">← Back to dashboard</Link>

      <h1>Post Job</h1>

      {employer.status !== "active" && (
        <p style={{ color: "#b45309" }}>
          Your company is pending approval. Jobs cannot be posted until admin
          activates your employer account.
        </p>
      )}

      {message && (
        <p
          style={{
            color: messageType === "success" ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>Job Title *</label>
          <br />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Category</label>
          <br />
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Location</label>
          <br />
          <select
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Job Type</label>
          <br />
          <select
            name="job_type"
            value={form.job_type}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label>Min Salary</label>
            <br />
            <input
              type="number"
              name="min_salary"
              value={form.min_salary}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>Max Salary</label>
            <br />
            <input
              type="number"
              name="max_salary"
              value={form.max_salary}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label>Min Experience (years)</label>
            <br />
            <input
              type="number"
              step="0.5"
              name="experience_min"
              value={form.experience_min}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>Max Experience (years)</label>
            <br />
            <input
              type="number"
              step="0.5"
              name="experience_max"
              value={form.experience_max}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Application Deadline</label>
          <br />
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Job Description *</label>
          <br />
          <textarea
            name="description"
            rows={6}
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Requirements</label>
          <br />
          <textarea
            name="requirements"
            rows={4}
            value={form.requirements}
            onChange={handleChange}
            placeholder="Example: ReactJS, Node.js, Communication skills"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={saving || employer.status !== "active"}
          style={{
            padding: "10px 18px",
            backgroundColor:
              employer.status === "active" ? "#0f172a" : "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor:
              saving || employer.status !== "active" ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}