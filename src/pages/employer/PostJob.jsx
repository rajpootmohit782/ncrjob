import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
} from "../../components/Icons";

const EMPTY_FORM = {
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
};

export default function PostJob() {
  const { employer, loading: employerLoading, error: employerError } = useEmployer();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(0);

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

    if (!error) setCategories(data || []);
  }

  async function fetchLocations() {
    const { data, error } = await supabase
      .from("locations")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (!error) setLocations(data || []);
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!employer) {
      setMessage("Employer profile not found.");
      setMessageType("error");
      return;
    }

    if (employer.status !== "active") {
      setMessage(
        "Your account is not active yet. Choose a plan from your dashboard before posting jobs.",
      );
      setMessageType("error");
      return;
    }

    if (
      employer.subscription_expires_at &&
      new Date(employer.subscription_expires_at) < new Date()
    ) {
      setMessage("Your plan has expired. Renew it to keep posting jobs.");
      setMessageType("error");
      return;
    }

    const remaining = Math.max((employer.job_limit ?? 0) - creditsUsed, 0);

    if (remaining <= 0) {
      setMessage(
        "You have used all your job credits. Renew your plan to post another job.",
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
          "Your account is not active yet. Choose a plan before posting jobs.",
        );
      } else {
        setMessage("Unable to create the job. Please try again.");
      }

      setMessageType("error");
    } else {
      setMessage(
        "Job submitted. It will appear publicly once it has been reviewed.",
      );
      setMessageType("success");

      // The database trigger `jobs_decrement_limit` already deducted 1 from
      // the employer's job_limit. Do not update it again from the browser.
      setCreditsUsed((used) => used + 1);

      setForm(EMPTY_FORM);
    }

    setSaving(false);
  }

  if (employerLoading) {
    return (
      <div className="page">
        <div className="container container-md">
          <div className="skeleton" style={{ height: "16rem" }} />
        </div>
      </div>
    );
  }

  if (employerError) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <span className="empty-ico">
              <AlertIcon />
            </span>
            <h1>Unable to load your account</h1>
            <p>{employerError}</p>
            <Link className="btn btn-secondary btn-sm mt-2" to="/employer-dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <h1>Employer profile not found</h1>
            <p>Create your employer account before posting a job.</p>
            <Link className="btn btn-primary btn-sm mt-2" to="/become-employer">
              Create employer account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = employer.status === "active";
  const credits = Math.max((employer.job_limit ?? 0) - creditsUsed, 0);

  return (
    <div className="page">
      <div className="container container-md">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/employer-dashboard">Employer dashboard</Link>
          <ChevronRightIcon />
          <span>Post a job</span>
        </nav>

        <div className="page-head">
          <div>
            <span className="eyebrow">Employer workspace</span>
            <h1>Post a job</h1>
            <p className="page-sub">
              Clear listings get better candidates. Add the details they need to
              decide.
            </p>
          </div>

          <div className="row wrap">
            <span className={`badge ${credits > 0 ? "badge-brand" : "badge-warn"}`}>
              {credits} {credits === 1 ? "credit" : "credits"} left
            </span>
            <Link className="btn btn-ghost btn-sm" to="/employer-dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>

        {!isActive && (
          <div className="notice notice-warn">
            <AlertIcon />
            <div className="grow">
              <strong>Your account is not active yet.</strong> Choose a plan to
              start publishing jobs and receiving applications.
            </div>
            <Link className="btn btn-primary btn-sm" to="/become-employer">
              Choose a plan <ArrowRightIcon size={14} />
            </Link>
          </div>
        )}

        {isActive && credits <= 0 && (
          <div className="notice notice-warn">
            <AlertIcon />
            <div className="grow">
              <strong>No job credits left.</strong> Renew your plan to publish
              another listing.
            </div>
            <Link className="btn btn-primary btn-sm" to="/become-employer">
              View plans <ArrowRightIcon size={14} />
            </Link>
          </div>
        )}

        {message && (
          <div
            className={`alert ${
              messageType === "success" ? "alert-success" : "alert-error"
            }`}
            role="status"
          >
            {messageType === "success" ? <CheckIcon /> : <AlertIcon />}
            <span>{message}</span>
          </div>
        )}

        <form className="card card-pad form-grid mt-2" onSubmit={handleSubmit}>
          <fieldset className="fieldset">
            <div className="fieldset-title">Role basics</div>

            <label className="field">
              <span className="field-label">Job title *</span>
              <input
                className="input"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Data Entry Executive"
                required
              />
            </label>

            <div className="field-row mt-2">
              <label className="field">
                <span className="field-label">Category</span>
                <select
                  className="select"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Location</span>
                <select
                  className="select"
                  name="location_id"
                  value={form.location_id}
                  onChange={handleChange}
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field-row mt-2">
              <label className="field">
                <span className="field-label">Job type</span>
                <select
                  className="select"
                  name="job_type"
                  value={form.job_type}
                  onChange={handleChange}
                >
                  <option value="full-time">Full time</option>
                  <option value="part-time">Part time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </label>

              <label className="field">
                <span className="field-label">Application deadline</span>
                <input
                  className="input"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <div className="fieldset-title">Compensation & experience</div>

            <div className="field-row">
              <label className="field">
                <span className="field-label">Minimum salary (₹ / month)</span>
                <input
                  className="input"
                  type="number"
                  name="min_salary"
                  value={form.min_salary}
                  onChange={handleChange}
                  placeholder="e.g. 18000"
                  min="0"
                />
              </label>

              <label className="field">
                <span className="field-label">Maximum salary (₹ / month)</span>
                <input
                  className="input"
                  type="number"
                  name="max_salary"
                  value={form.max_salary}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  min="0"
                />
              </label>
            </div>

            <div className="field-row mt-2">
              <label className="field">
                <span className="field-label">Minimum experience (years)</span>
                <input
                  className="input"
                  type="number"
                  step="0.5"
                  name="experience_min"
                  value={form.experience_min}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </label>

              <label className="field">
                <span className="field-label">Maximum experience (years)</span>
                <input
                  className="input"
                  type="number"
                  step="0.5"
                  name="experience_max"
                  value={form.experience_max}
                  onChange={handleChange}
                  placeholder="3"
                  min="0"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <div className="fieldset-title">Description</div>

            <label className="field">
              <span className="field-label">Job description *</span>
              <textarea
                className="textarea"
                name="description"
                rows={7}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the day-to-day work, working hours, shift and who the role suits."
                required
              />
            </label>

            <label className="field mt-2">
              <span className="field-label">Requirements</span>
              <textarea
                className="textarea"
                name="requirements"
                rows={4}
                value={form.requirements}
                onChange={handleChange}
                placeholder="Example: basic computer knowledge, good communication, own transport."
              />
            </label>
          </fieldset>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving || !isActive || credits <= 0}
            >
              {saving ? "Submitting…" : "Publish job"}
            </button>
            <Link className="btn btn-ghost" to="/employer-dashboard">
              Cancel
            </Link>
            <span className="field-help">
              New listings are reviewed before they go live.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
