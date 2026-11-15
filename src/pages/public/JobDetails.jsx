import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  formatDate,
  formatSalary,
  initials,
  jobTypeLabel,
} from "../../lib/format";
import {
  AlertIcon,
  BriefcaseIcon,
  BuildingIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalIcon,
  PinIcon,
  ShieldIcon,
  WhatsAppIcon,
} from "../../components/Icons";

function formatExperience(min, max) {
  if (min == null && max == null) return "Not specified";
  if (min != null && max != null) return `${min} – ${max} years`;
  if (min != null) return `${min}+ years`;
  return `Up to ${max} years`;
}

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

    const { data, error: fetchError } = await supabase
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
          website,
          whatsapp_number,
          is_verified
        ),
        categories ( name ),
        locations ( name )
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      setError("We couldn't load this job right now. Please try again.");
    } else {
      setJob(data);
    }

    setLoading(false);
  }

  function getWhatsAppLink() {
    const rawNumber = job?.employers?.whatsapp_number || "";
    const whatsappNumber = rawNumber.replace(/[^0-9]/g, "");

    if (!whatsappNumber) return "";

    const message = `Hello, I am interested in the "${job.title}" position at ${
      job.employers?.company_name || "your company"
    }. I found this job on VMWjobs.`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="skeleton" style={{ height: "10rem", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ height: "18rem" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <span className="empty-ico">
              <AlertIcon />
            </span>
            <h1>Something went wrong</h1>
            <p>{error}</p>
            <Link className="btn btn-secondary btn-sm mt-2" to="/jobs">
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <span className="empty-ico">
              <BriefcaseIcon />
            </span>
            <h1>Job not found</h1>
            <p>This listing may have been closed or removed by the employer.</p>
            <Link className="btn btn-primary btn-sm mt-2" to="/jobs">
              Browse all jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappLink = getWhatsAppLink();
  const company = job.employers?.company_name || "Employer";

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/jobs">Jobs</Link>
          <ChevronRightIcon />
          <span>{job.categories?.name || "Private sector"}</span>
          <ChevronRightIcon />
          <span>{job.title}</span>
        </nav>

        <div className="job-detail-grid">
          <div className="job-detail-main">
            <article className="card job-detail-head">
              <div className="job-top">
                <span className="company-mark company-mark-green">
                  {initials(company)}
                </span>

                <div className="grow">
                  <p className="job-company">{company}</p>
                  <h1>{job.title}</h1>
                </div>

                {job.is_featured && (
                  <span className="badge badge-featured">Featured</span>
                )}
              </div>

              <div className="job-meta mt-2">
                <span className="chip">
                  <PinIcon />
                  {job.locations?.name || "Delhi NCR"}
                </span>
                <span className="chip">
                  <BriefcaseIcon />
                  {jobTypeLabel(job.job_type)}
                </span>
                <span className="chip">
                  <ClockIcon />
                  Posted {formatDate(job.created_at)}
                </span>
              </div>

              <dl className="job-summary">
                <div className="kv">
                  <dt>Salary</dt>
                  <dd>{formatSalary(job.min_salary, job.max_salary)}</dd>
                </div>
                <div className="kv">
                  <dt>Experience</dt>
                  <dd>
                    {formatExperience(job.experience_min, job.experience_max)}
                  </dd>
                </div>
                <div className="kv">
                  <dt>Job type</dt>
                  <dd>{jobTypeLabel(job.job_type)}</dd>
                </div>
                <div className="kv">
                  <dt>Apply before</dt>
                  <dd>{job.deadline ? formatDate(job.deadline) : "Open until filled"}</dd>
                </div>
              </dl>
            </article>

            <section className="card card-pad">
              <h2>About the role</h2>
              <div className="prose long-copy mt-1">
                {job.description || "The employer has not added a description yet."}
              </div>

              <h2 className="mt-2">What you'll need</h2>
              <div className="prose long-copy mt-1">
                {job.requirements || "No specific requirements were listed."}
              </div>
            </section>

            <section className="card card-pad">
              <h2>About {company}</h2>
              <div className="prose long-copy mt-1">
                {job.employers?.description ||
                  "This employer has not added a company description yet."}
              </div>

              <div className="job-meta mt-2">
                {job.employers?.industry && (
                  <span className="chip">
                    <BuildingIcon />
                    {job.employers.industry}
                  </span>
                )}
                {(job.employers?.location || job.locations?.name) && (
                  <span className="chip">
                    <PinIcon />
                    {job.employers?.location || job.locations?.name}
                  </span>
                )}
                {job.employers?.website && (
                  <a
                    className="chip"
                    href={job.employers.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalIcon />
                    Company website
                  </a>
                )}
              </div>
            </section>
          </div>

          <aside className="job-detail-side">
            <div className="card apply-card">
              <div className="employer-mini">
                <span className="company-mark">
                  {initials(company)}
                </span>
                <div className="employer-mini-main">
                  <strong>{company}</strong>
                  <span className="employer-mini-meta">
                    {job.employers?.is_verified ? (
                      <>
                        <ShieldIcon /> Verified employer on VMWjobs
                      </>
                    ) : (
                      "Employer on VMWjobs"
                    )}
                  </span>
                </div>
              </div>

              <h3>Interested in this role?</h3>
              <p className="small muted mt-1">
                Send the employer a WhatsApp message with your profile. It only
                takes a minute.
              </p>

              {whatsappLink ? (
                <a
                  className="btn btn-whatsapp btn-block btn-lg mt-2"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon /> Apply on WhatsApp
                </a>
              ) : (
                <div className="alert alert-warn mt-2">
                  <AlertIcon />
                  This employer has not added a WhatsApp number. Please check
                  back later.
                </div>
              )}

              <p className="apply-note">
                <AlertIcon />
                Never pay anyone for a job, interview or registration. Report
                suspicious listings to us.
              </p>
            </div>

            <div className="card card-pad">
              <h3>Job overview</h3>
              <dl className="kv-list">
                <div className="kv">
                  <dt>Salary</dt>
                  <dd>{formatSalary(job.min_salary, job.max_salary)}</dd>
                </div>
                <div className="kv">
                  <dt>Experience</dt>
                  <dd>
                    {formatExperience(job.experience_min, job.experience_max)}
                  </dd>
                </div>
                <div className="kv">
                  <dt>Category</dt>
                  <dd>{job.categories?.name || "Private sector"}</dd>
                </div>
                <div className="kv">
                  <dt>Location</dt>
                  <dd>{job.locations?.name || "Delhi NCR"}</dd>
                </div>
                <div className="kv">
                  <dt>Job type</dt>
                  <dd>{jobTypeLabel(job.job_type)}</dd>
                </div>
              </dl>

              <Link className="btn btn-secondary btn-block btn-sm mt-2" to="/jobs">
                <BriefcaseIcon /> Browse similar jobs
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
