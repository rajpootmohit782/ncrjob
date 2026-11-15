import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  ClockIcon,
  PinIcon,
  SearchIcon,
} from "../../components/Icons";

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const keywordParam = searchParams.get("keyword") || "";
  const categoryParam = searchParams.get("category") || "";
  const locationParam = searchParams.get("location") || "";

  const [keyword, setKeyword] = useState(keywordParam);
  const [categoryId, setCategoryId] = useState(categoryParam);
  const [locationId, setLocationId] = useState(locationParam);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    setKeyword(keywordParam);
    setCategoryId(categoryParam);
    setLocationId(locationParam);
    fetchJobs();
  }, [searchParams]);

  async function fetchFilters() {
    const [categoryRes, locationRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .eq("status", "active")
        .order("name"),
      supabase
        .from("locations")
        .select("id, name")
        .eq("status", "active")
        .order("name"),
    ]);

    setCategories(categoryRes.data || []);
    setLocations(locationRes.data || []);
  }

  async function fetchJobs() {
    setLoading(true);

    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        job_type,
        min_salary,
        max_salary,
        is_featured,
        created_at,
        employers (company_name),
        categories (id, name),
        locations (id, name)
      `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (keywordParam) query = query.ilike("title", `%${keywordParam}%`);
    if (categoryParam) query = query.eq("category_id", categoryParam);
    if (locationParam) query = query.eq("location_id", locationParam);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setJobs([]);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  function handleSearch(event) {
    event.preventDefault();

    const params = {};
    if (keyword.trim()) params.keyword = keyword.trim();
    if (categoryId) params.category = categoryId;
    if (locationId) params.location = locationId;

    setSearchParams(params);
  }

  function clearFilters() {
    setKeyword("");
    setCategoryId("");
    setLocationId("");
    setSearchParams({});
  }

  const hasFilters = Boolean(keywordParam || categoryParam || locationParam);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <span className="eyebrow">Find your next role</span>
            <h1>Jobs in Delhi NCR</h1>
            <p className="page-sub">
              Private-sector openings from reviewed employers — no fees, no
              middlemen.
            </p>
          </div>

          <Link to="/become-employer" className="btn btn-secondary btn-sm">
            Post a job <ArrowRightIcon size={14} />
          </Link>
        </div>

        <form className="card filter-card" onSubmit={handleSearch}>
          <div className="filter-grid">
            <label className="field">
              <span className="field-label">Keyword</span>
              <input
                className="input"
                type="search"
                placeholder="Job title or skill"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Category</span>
              <select
                className="select"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">All categories</option>
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

            <div className="filter-actions">
              <button className="btn btn-primary" type="submit">
                <SearchIcon size={16} /> Search
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="stack-sm mt-2">
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
            <div className="skeleton skeleton-row" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state mt-2">
            <span className="empty-ico">
              <SearchIcon />
            </span>
            <h3>No jobs match your search</h3>
            <p>
              Try a different keyword or location, or clear the filters to see
              every opening.
            </p>
            {hasFilters && (
              <button
                className="btn btn-secondary btn-sm mt-2"
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="result-bar">
              <p className="small muted">
                Showing <strong>{jobs.length}</strong>{" "}
                {jobs.length === 1 ? "open role" : "open roles"}
                {keywordParam ? ` for “${keywordParam}”` : ""}
              </p>
              {hasFilters && (
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={clearFilters}
                >
                  Reset filters
                </button>
              )}
            </div>

            <div className="job-list">
              {jobs.map((job) => (
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

                    <p className="job-company">
                      {job.employers?.company_name || "Employer"}
                    </p>

                    <div className="job-meta">
                      <span className="chip">
                        <PinIcon />
                        {job.locations?.name || "Delhi NCR"}
                      </span>
                      <span className="chip">
                        <BriefcaseIcon />
                        {job.categories?.name || "Private sector"}
                      </span>
                      <span className="chip">
                        <ClockIcon />
                        {timeAgo(job.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="job-row-side">
                    <span className="salary">
                      {formatSalary(job.min_salary, job.max_salary)}
                    </span>
                    <span className="small muted">
                      {jobTypeLabel(job.job_type)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
