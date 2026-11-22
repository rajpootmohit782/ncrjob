import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, CircleAlert, Save } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";
import { FormMessage, LoadingState } from "../../components/ui";
import { QUALIFICATION_OPTIONS } from "../../lib/qualifications";

const draftKey = (jobId) => `vmw_edit_job_draft_${jobId}`;

const INITIAL_FORM = {
  title: "",
  company: "",
  category_id: "",
  location_id: "",
  job_type: "full-time",
  qualification: "",
  min_salary: "",
  max_salary: "",
  experience_min: "",
  experience_max: "",
  deadline: "",
  description: "",
  requirements: "",
};

function loadDraft(jobId) {
  try {
    const raw = sessionStorage.getItem(draftKey(jobId));
    if (!raw) return null;
    return { ...INITIAL_FORM, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function saveDraft(jobId, nextForm) {
  try {
    sessionStorage.setItem(draftKey(jobId), JSON.stringify(nextForm));
  } catch {
    // Draft persistence is best-effort and must never block editing.
  }
}

function clearDraft(jobId) {
  try {
    sessionStorage.removeItem(draftKey(jobId));
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Jobs are saved as "Title (Company)". Split them back apart so the employer
 * sees two editable fields, exactly like on the post form.
 */
function splitTitle(fullTitle = "") {
  const match = fullTitle.match(/^(.*?)\s*\(([^()]*)\)\s*$/);

  if (match && match[1].trim()) {
    return { title: match[1].trim(), company: match[2].trim() };
  }

  return { title: fullTitle.trim(), company: "" };
}

function toFormValue(job) {
  const { title, company } = splitTitle(job.title);

  return {
    ...INITIAL_FORM,
    title,
    company,
    category_id: job.category_id || "",
    location_id: job.location_id || "",
    job_type: job.job_type || "full-time",
    qualification: job.qualification || "",
    min_salary: job.min_salary ?? "",
    max_salary: job.max_salary ?? "",
    experience_min: job.experience_min ?? "",
    experience_max: job.experience_max ?? "",
    deadline: job.deadline || "",
    description: job.description || "",
    requirements: job.requirements || "",
  };
}

export default function EditJob() {
  const { id } = useParams();
  const { employer, loading: employerLoading, error: employerError } = useEmployer();

  const [job, setJob] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    let active = true;

    async function loadJob() {
      if (!employer?.id) return;

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("employer_id", employer.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error(error);
        setLoadError("Unable to load this job.");
      } else if (!data) {
        setLoadError("Job not found, or it does not belong to your account.");
      } else {
        setJob(data);
        setForm(loadDraft(id) ?? toFormValue(data));
      }

      setLoading(false);
    }

    loadJob();

    return () => {
      active = false;
    };
  }, [employer?.id, id]);

  useEffect(() => {
    let active = true;

    async function loadFilters() {
      const [catRes, locRes] = await Promise.all([
        supabase.from("categories").select("id, name").eq("status", "active").order("name"),
        supabase.from("locations").select("id, name").eq("status", "active").order("name"),
      ]);

      if (!active) return;
      setCategories(catRes.data || []);
      setLocations(locRes.data || []);
    }

    loadFilters();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(e) {
    const nextForm = { ...form, [e.target.name]: e.target.value };
    setForm(nextForm);
    saveDraft(id, nextForm);
  }

  function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!form.title.trim()) {
      setMessage("Job title is required.");
      setMessageType("error");
      return;
    }

    if (!form.company.trim()) {
      setMessage("Company name is required.");
      setMessageType("error");
      return;
    }

    if (!form.qualification) {
      setMessage("Minimum qualification is required.");
      setMessageType("error");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Job description is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const title = form.title.trim();
    const company = form.company.trim();

    // status / is_featured are intentionally absent: the DB trigger keeps
    // those admin-only, so an edit can never publish or feature a job.
    const payload = {
      title: company ? `${title} (${company})` : title,
      category_id: form.category_id || null,
      location_id: form.location_id || null,
      job_type: form.job_type,
      qualification: form.qualification,
      min_salary: toNumberOrNull(form.min_salary),
      max_salary: toNumberOrNull(form.max_salary),
      experience_min: toNumberOrNull(form.experience_min),
      experience_max: toNumberOrNull(form.experience_max),
      deadline: form.deadline || null,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
    };

    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", id)
      .eq("employer_id", employer.id);

    if (error) {
      console.error(error);
      setMessage("Unable to save changes. Please try again.");
      setMessageType("error");
    } else {
      clearDraft(id);
      setMessage("Job updated successfully.");
      setMessageType("success");
    }

    setSaving(false);
  }

  if (employerLoading || loading) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <LoadingState label="Loading job..." />
        </div>
      </div>
    );
  }

  if (employerError || loadError) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {employerError || loadError}
          </div>
          <Link to="/employer/jobs" className="link-arrow mt-5">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to my jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!employer || !job) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="card p-8 text-sm text-muted">Job not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-8 sm:py-12">
        <Link to="/employer/jobs" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to my jobs
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand">
            <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Edit Job</h1>
            <p className="mt-1 text-sm text-muted">Status: {job.status}</p>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          You can edit the job details below. Publishing, approval and
          featured status stay under admin control.
        </div>

        {message && (
          <div className="mb-4">
            <FormMessage type={messageType === "success" ? "success" : "error"}>
              {message}
            </FormMessage>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="title">Job Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="company">Company Name *</label>
              <input
                id="company"
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                placeholder="Company hiring for this job"
                className="input"
              />
              <p className="mt-1.5 text-xs text-muted">
                Enter the client company for{" "}
                <strong className="font-semibold text-ink">this job</strong> —
                it changes with every post. Shown as{" "}
                <span className="font-semibold text-ink">
                  {form.title.trim() || "Job Title"}
                  {form.company.trim() ? ` (${form.company.trim()})` : ""}
                </span>
              </p>
            </div>

            <div>
              <label className="label" htmlFor="category_id">Category</label>
              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="location_id">Location</label>
              <select
                id="location_id"
                name="location_id"
                value={form.location_id}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="job_type">Job Type</label>
              <select
                id="job_type"
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                className="select"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="qualification">Minimum Qualification *</label>
              <select
                id="qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                required
                className="select"
              >
                <option value="">Select minimum qualification</option>
                {QUALIFICATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="deadline">Application Deadline</label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="min_salary">Min Salary</label>
              <input
                id="min_salary"
                type="number"
                name="min_salary"
                value={form.min_salary}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="max_salary">Max Salary</label>
              <input
                id="max_salary"
                type="number"
                name="max_salary"
                value={form.max_salary}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="experience_min">Min Experience (years)</label>
              <input
                id="experience_min"
                type="number"
                step="0.5"
                name="experience_min"
                value={form.experience_min}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="experience_max">Max Experience (years)</label>
              <input
                id="experience_max"
                type="number"
                step="0.5"
                name="experience_max"
                value={form.experience_max}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={form.description}
                onChange={handleChange}
                required
                className="input min-h-36 resize-y"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={form.requirements}
                onChange={handleChange}
                placeholder="Example: ReactJS, Node.js, Communication skills"
                className="input min-h-28 resize-y"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary mt-6 w-full sm:w-auto">
            {saving ? (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
