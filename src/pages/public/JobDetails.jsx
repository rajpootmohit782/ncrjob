import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Briefcase,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { LoadingState } from "../../components/ui";
import { qualificationLabel } from "../../lib/qualifications";

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
        qualification,
        employers (
          contact_person,
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
      job?.employers?.contact_person || "your employer"
    }. I found this job on VMWjobs.`;

    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <LoadingState label="Loading job..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="card p-8 text-center">
            <p className="text-sm text-muted">Job not found.</p>
            <Link to="/jobs" className="btn btn-secondary mt-5">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappLink = getWhatsAppLink();
  const employerName = job.employers?.contact_person || "Employer";

  return (
    <div className="page-shell">
      <div className="container-page py-8 sm:py-12">
        <Link to="/jobs" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            <div className="card overflow-hidden">
              <div className="hero-gradient relative p-6 text-white sm:p-8">
                <div className="hero-dots pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100 backdrop-blur-md">
                      <Briefcase className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {job.categories?.name || "N/A"}
                    </span>
                    {job.is_featured && (
                      <span className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Featured Job
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                    {job.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-indigo-100/85">
                    <span className="inline-flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      {formatSalary(job.min_salary, job.max_salary)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-sky-300" aria-hidden="true" />
                      {job.locations?.name || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                      {job.job_type || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-ink">Employer</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span className="font-semibold text-ink">{employerName}</span>
                  {job.employers?.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified employer
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <DetailItem icon={MapPin} label="Location" value={job.locations?.name || "N/A"} />
                  <DetailItem icon={Briefcase} label="Category" value={job.categories?.name || "N/A"} />
                  <DetailItem icon={Clock3} label="Job Type" value={job.job_type || "N/A"} />
                  <DetailItem icon={GraduationCap} label="Minimum Qualification" value={qualificationLabel(job.qualification)} />
                  <DetailItem icon={Banknote} label="Salary" value={formatSalary(job.min_salary, job.max_salary)} />
                  <DetailItem icon={BadgeCheck} label="Experience" value={formatExperience(job.experience_min, job.experience_max)} />
                  {job.deadline && (
                    <DetailItem
                      icon={CalendarDays}
                      label="Apply Before"
                      value={new Date(job.deadline).toLocaleDateString()}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              <div className="section-heading mb-6">
                <h2 className="text-xl font-bold text-ink">Description</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-muted">{job.description || "N/A"}</p>

              <div className="section-heading mb-6 mt-10">
                <h2 className="text-xl font-bold text-ink">Requirements</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-muted">{job.requirements || "N/A"}</p>
            </div>
          </div>

          <aside className="min-w-0 card p-6 lg:sticky lg:top-24">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-ink">Apply for this job</h2>

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn mt-5 w-full bg-[#25D366] text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-[#1fb85a]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Apply on WhatsApp
              </a>
            ) : (
              <p className="mt-4 text-sm font-medium text-rose-600">
                Employer WhatsApp number is not available for this job.
              </p>
            )}

            <p className="mt-4 text-xs leading-6 text-muted">
              You will be redirected to the employer WhatsApp chat.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
      <span className="mt-0.5 text-slate-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
