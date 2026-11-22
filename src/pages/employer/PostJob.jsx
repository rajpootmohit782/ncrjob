import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, CircleAlert } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";
import { FormMessage, LoadingState } from "../../components/ui";
import { QUALIFICATION_OPTIONS } from "../../lib/qualifications";
import { hasUnlimitedJobs } from "../../lib/employer";

const POST_JOB_DRAFT_KEY = "vmw_post_job_draft";

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

function loadPostJobDraft() {
  try {
    const raw = sessionStorage.getItem(POST_JOB_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_FORM, ...parsed };
  } catch {
    return null;
  }
}

function savePostJobDraft(nextForm) {
  try {
    sessionStorage.setItem(POST_JOB_DRAFT_KEY, JSON.stringify(nextForm));
  } catch {
    // Draft persistence is best-effort and should never block posting.
  }
}

function clearPostJobDraft() {
  try {
    sessionStorage.removeItem(POST_JOB_DRAFT_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export default function PostJob() {
  const { employer, loading: employerLoading, error: employerError } = useEmployer();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState(() => loadPostJobDraft() ?? INITIAL_FORM);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  // Pre-fill the company from the employer profile the first time, so every
  // post already has a company without forcing the employer to retype it.
  useEffect(() => {
    if (!employer?.company_name) return;

    setForm((previous) => {
      if (previous.company) return previous;
      const next = { ...previous, company: employer.company_name };
      savePostJobDraft(next);
      return next;
    });
  }, [employer]);

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
    const nextForm = { ...form, [e.target.name]: e.target.value };
    setForm(nextForm);
    savePostJobDraft(nextForm);
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
        "Your employer account is not active yet. Choose a plan from your dashboard before posting jobs."
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
        "You have used all your job credits. Renew your plan to post another job."
      );
      setMessageType("error");
      return;
    }

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
      setMessage("Minimum qualification is required. Choose \"Any / No specific qualification\" if none applies.");
      setMessageType("error");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Job description is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const company = form.company.trim();
    const title = form.title.trim();

    const payload = {
      employer_id: employer.id,
      // The public title always carries the company: "Title (Company Name)".
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
      status: "pending",
    };

    const { error } = await supabase.from("jobs").insert(payload);

    if (error) {
      console.error(error);

      if (error.message.includes("row-level security")) {
        setMessage(
          "Your employer account is not active yet. Choose a plan from your dashboard before posting jobs."
        );
      } else {
        setMessage("Unable to create job. Please try again.");
      }

      setMessageType("error");
    } else {
      setMessage("Job submitted. It will appear publicly once it has been reviewed.");
      setMessageType("success");

      clearPostJobDraft();

      // The database trigger `jobs_decrement_limit` already deducted 1 from
      // the employer's job_limit. Do not update it again from the browser.
      setCreditsUsed((used) => used + 1);

      setForm({ ...INITIAL_FORM, company: employer.company_name || "" });
    }

    setSaving(false);
  }

  if (employerLoading) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <LoadingState label="Loading..." />
        </div>
      </div>
    );
  }

  if (employerError) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {employerError}
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="card p-8 text-sm text-muted">Employer profile not found.</div>
        </div>
      </div>
    );
  }

  const isUnlimited = hasUnlimitedJobs(employer);
  const remainingCredits = isUnlimited
    ? Number.POSITIVE_INFINITY
    : Math.max((employer.job_limit ?? 0) - creditsUsed, 0);

  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-8 sm:py-12">
        <Link to="/employer-dashboard" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand">
              <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Post Job</h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ${
              isUnlimited || remainingCredits > 0
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-rose-50 text-rose-700 ring-rose-200"
            }`}
          >
            {isUnlimited ? "Unlimited" : `${remainingCredits} job ${remainingCredits === 1 ? "credit" : "credits"} left`}
          </span>
        </div>

        {employer.status !== "active" && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Your account is not active yet. Choose a plan from your dashboard
            before posting jobs.
          </div>
        )}

        {employer.status === "active" && !isUnlimited && remainingCredits <= 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            You have used all your job credits. Renew your plan to post another
            job.
          </div>
        )}

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
                placeholder="Example: TCS, Infosys, Wipro"
                className="input"
              />
              <p className="mt-1.5 text-xs text-muted">
                Shown on the job as{" "}
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

          <button
            type="submit"
            disabled={saving || employer.status !== "active" || (!isUnlimited && remainingCredits <= 0)}
            className="btn btn-primary mt-6 w-full sm:w-auto"
          >
            {saving ? "Creating..." : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
