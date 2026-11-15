import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  formatSalary,
  initials,
  jobTypeLabel,
  timeAgo,
} from "../../lib/format";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  PinIcon,
  SearchIcon,
  ShieldIcon,
  WhatsAppIcon,
} from "../../components/Icons";

function FeaturedCard({ job }) {
  return (
    <Link className="job-card" to={`/jobs/${job.id}`}>
      <div className="job-top">
        <span className="company-mark company-mark-green">
          {initials(job.employers?.company_name)}
        </span>
        <div className="grow">
          <h3>{job.title}</h3>
          <p className="job-company">
            {job.employers?.company_name || "Employer"}
          </p>
        </div>
        <span className="badge badge-featured">Featured</span>
      </div>

      <div className="job-meta">
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
          {timeAgo(job.created_at)}
        </span>
      </div>

      <div className="job-foot">
        <span className="salary">{formatSalary(job.min_salary, job.max_salary)}</span>
        <span className="link-arrow">
          View job <ArrowRightIcon size={14} />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, employers: 0, locations: 0 });
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [locationId, setLocationId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHome() {
      const [categoryRes, locationRes, latestRes, featuredRes, jobsCount, employersCount, locationsCount] =
        await Promise.all([
          supabase
            .from("categories")
            .select("id, name")
            .eq("status", "active")
            .order("name")
            .limit(10),
          supabase
            .from("locations")
            .select("id, name")
            .eq("status", "active")
            .order("name"),
          supabase
            .from("jobs")
            .select(
              "id, title, job_type, min_salary, max_salary, is_featured, created_at, employers(company_name), locations(name)",
            )
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("jobs")
            .select(
              "id, title, job_type, min_salary, max_salary, created_at, employers(company_name), locations(name)",
            )
            .eq("status", "active")
            .eq("is_featured", true)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("employers")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("locations")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
        ]);

      if (!active) return;

      setCategories(categoryRes.data || []);
      setLocations(locationRes.data || []);
      setLatestJobs(latestRes.data || []);
      setFeaturedJobs(featuredRes.data || []);
      setStats({
        jobs: jobsCount.count || 0,
        employers: employersCount.count || 0,
        locations: locationsCount.count || 0,
      });
      setLoading(false);
    }

    loadHome();

    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (locationId) params.set("location", locationId);

    const query = params.toString();
    navigate(`/jobs${query ? `?${query}` : ""}`);
  }

  const panelJobs = latestJobs.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="hero home-hero">
        <div className="container home-hero-grid">
          <div className="hero-copy">
            <span className="hero-badge">
              <ShieldIcon size={14} />
              Verified private-sector jobs across Delhi NCR
            </span>

            <h1>
              Good work, closer to home. <span className="accent">Start here.</span>
            </h1>

            <p className="hero-sub">
              VMWjobs brings together genuine openings from Noida, Greater Noida,
              Gurugram and Delhi — with clear salaries, real employers and a direct
              way to apply.
            </p>

            <form className="search-card" onSubmit={handleSearch}>
              <label className="search-field">
                <SearchIcon />
                <span className="sr-only">Job title, skill or company</span>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Job title, skill or company"
                />
              </label>

              <label className="search-field">
                <PinIcon />
                <span className="sr-only">Location</span>
                <select
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                >
                  <option value="">All locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>

              <button className="btn btn-primary btn-lg" type="submit">
                Search jobs
              </button>
            </form>

            <div className="trust-row">
              <span className="trust-item">
                <CheckCircleIcon /> Free for candidates
              </span>
              <span className="trust-item">
                <CheckCircleIcon /> No middlemen
              </span>
              <span className="trust-item">
                <CheckCircleIcon /> Apply on WhatsApp
              </span>
            </div>

            <div className="stats-strip">
              <div className="stat">
                <b>{stats.jobs.toLocaleString("en-IN")}</b>
                <span>Live openings</span>
              </div>
              <div className="stat">
                <b>{stats.employers.toLocaleString("en-IN")}</b>
                <span>Active employers</span>
              </div>
              <div className="stat">
                <b>{stats.locations.toLocaleString("en-IN")}</b>
                <span>NCR locations</span>
              </div>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Recently added jobs">
            <div className="hero-panel-head">
              <span className="live-dot" aria-hidden="true" /> Recently added
            </div>

            {loading ? (
              <>
                <div className="skeleton skeleton-row" />
                <div className="skeleton skeleton-row" />
                <div className="skeleton skeleton-row" />
              </>
            ) : panelJobs.length > 0 ? (
              panelJobs.map((job) => (
                <Link className="hero-job" to={`/jobs/${job.id}`} key={job.id}>
                  <span className="company-mark">
                    {initials(job.employers?.company_name)}
                  </span>
                  <span className="hero-job-main">
                    <strong>{job.title}</strong>
                    <span>
                      {job.employers?.company_name || "Employer"} ·{" "}
                      {job.locations?.name || "NCR"}
                    </span>
                  </span>
                  {job.is_featured ? (
                    <span className="badge badge-featured">Featured</span>
                  ) : (
                    <ChevronRightIcon size={15} />
                  )}
                </Link>
              ))
            ) : (
              <p className="hero-panel-empty">
                New roles are added every week. Check back soon.
              </p>
            )}

            <div className="hero-panel-foot">
              <span>
                <ShieldIcon /> Reviewed before publishing
              </span>
              <Link to="/jobs" className="link-arrow">
                All jobs <ArrowRightIcon size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <div className="container">
        {/* Category shortcuts */}
        <section className="section-sm">
          <div className="term-row">
            <span className="small muted">Popular searches:</span>
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                className="term"
                to={`/jobs?category=${category.id}`}
              >
                {category.name}
              </Link>
            ))}
            <Link className="term" to="/jobs">
              All categories
            </Link>
          </div>
        </section>

        {/* Latest openings + promise */}
        <section className="section">
          <div className="home-split">
            <div>
              <div className="section-head">
                <div>
                  <h2>Latest openings</h2>
                  <p className="section-sub">
                    Fresh roles from employers hiring right now.
                  </p>
                </div>
                <Link to="/jobs" className="link-arrow">
                  View all <ArrowRightIcon size={15} />
                </Link>
              </div>

              {loading ? (
                <div className="stack-sm">
                  <div className="skeleton skeleton-row" />
                  <div className="skeleton skeleton-row" />
                  <div className="skeleton skeleton-row" />
                  <div className="skeleton skeleton-row" />
                </div>
              ) : latestJobs.length > 0 ? (
                <div className="job-list">
                  {latestJobs.map((job) => (
                    <Link className="job-row" to={`/jobs/${job.id}`} key={job.id}>
                      <span className="company-mark">
                        {initials(job.employers?.company_name)}
                      </span>

                      <div className="job-row-main">
                        <div className="job-row-title">
                          <h3>{job.title}</h3>
                          {job.is_featured && (
                            <span className="badge badge-featured">Featured</span>
                          )}
                        </div>
                        <div className="job-meta">
                          <span className="chip">
                            <PinIcon />
                            {job.locations?.name || "Delhi NCR"}
                          </span>
                          <span className="chip">
                            <BriefcaseIcon />
                            {jobTypeLabel(job.job_type)}
                          </span>
                        </div>
                      </div>

                      <div className="job-row-side">
                        <span className="salary">
                          {formatSalary(job.min_salary, job.max_salary)}
                        </span>
                        <span className="small muted">{timeAgo(job.created_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-ico">
                    <BriefcaseIcon />
                  </span>
                  <h3>No openings just yet</h3>
                  <p>
                    Employers are preparing their listings. Check back shortly or
                    browse all jobs.
                  </p>
                  <Link className="btn btn-secondary btn-sm mt-2" to="/jobs">
                    Browse jobs
                  </Link>
                </div>
              )}
            </div>

            <aside className="home-aside">
              <div className="card card-pad">
                <span className="eyebrow">The VMWjobs promise</span>
                <h3>Listings you can act on.</h3>

                <ul className="promise-list">
                  <li>
                    <ShieldIcon />
                    <span>Every employer is reviewed before a job goes live.</span>
                  </li>
                  <li>
                    <CheckCircleIcon />
                    <span>Never pay for a job, interview or registration.</span>
                  </li>
                  <li>
                    <WhatsAppIcon />
                    <span>Apply directly with the employer on WhatsApp.</span>
                  </li>
                  <li>
                    <ClockIcon />
                    <span>New private-sector roles added through the week.</span>
                  </li>
                </ul>
              </div>

              <div className="card card-pad side-cta">
                <span className="eyebrow">For employers</span>
                <h3>Hiring in NCR?</h3>
                <p>
                  Put your vacancy in front of local candidates. No agency, no
                  long contracts.
                </p>

                <div className="price-line">
                  <b>₹9</b>
                  <span>for 5 job posts · 30 days</span>
                </div>

                <Link to="/become-employer" className="btn btn-light btn-block">
                  Post a job <ArrowRightIcon size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* Featured roles */}
        {featuredJobs.length > 0 && (
          <section className="section">
            <div className="section-head">
              <div>
                <h2>Featured roles</h2>
                <p className="section-sub">
                  Hand-picked openings from verified employers.
                </p>
              </div>
              <Link to="/jobs" className="link-arrow">
                Browse all <ArrowRightIcon size={15} />
              </Link>
            </div>

            <div className="job-grid-3">
              {featuredJobs.map((job) => (
                <FeaturedCard job={job} key={job.id} />
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="section">
          <div className="card card-pad how-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Simple by design</span>
                <h2>How VMWjobs works</h2>
              </div>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <span className="step-num">1</span>
                <h3>Search without signing up</h3>
                <p>
                  Browse every live opening by role or location. No account needed
                  to look around.
                </p>
              </div>

              <div className="step-card">
                <span className="step-num">2</span>
                <h3>Check the details</h3>
                <p>
                  Salary, experience and location are shown on every listing —
                  before you apply.
                </p>
              </div>

              <div className="step-card">
                <span className="step-num">3</span>
                <h3>Apply directly</h3>
                <p>
                  Message the employer on WhatsApp and take the conversation from
                  there. No fees, ever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Employer CTA */}
        <section className="section">
          <div className="cta-band">
            <div>
              <span className="eyebrow">For employers</span>
              <h2>Hire locally. Hire with confidence.</h2>
              <p>
                Post your first role today — plans start at ₹9 for five job
                listings, valid for 30 days.
              </p>
            </div>

            <div className="row wrap">
              <Link to="/become-employer" className="btn btn-light btn-lg">
                Post a job <ArrowRightIcon size={16} />
              </Link>
              <Link to="/employer-login" className="btn btn-ghost btn-lg">
                Employer login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
