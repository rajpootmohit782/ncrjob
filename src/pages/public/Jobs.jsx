import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase, MapPin, Search, SlidersHorizontal, SearchX } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import JobCard, { JobCardSkeleton } from "../../components/JobCard";
import { EmptyState } from "../../components/ui";

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read URL parameters
  const keywordParam = searchParams.get("keyword") || "";
  const categoryParam = searchParams.get("category") || "";
  const locationParam = searchParams.get("location") || "";

  // Local state for inputs
  const [keyword, setKeyword] = useState(keywordParam);
  const [categoryId, setCategoryId] = useState(categoryParam);
  const [locationId, setLocationId] = useState(locationParam);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  async function fetchFilters() {
    const [catRes, locRes] = await Promise.all([
      supabase.from("categories").select("id, name").eq("status", "active").order("name"),
      supabase.from("locations").select("id, name").eq("status", "active").order("name")
    ]);
    setCategories(catRes.data || []);
    setLocations(locRes.data || []);
  }

  async function fetchJobs() {
    setLoading(true);

    let query = supabase
      .from("jobs")
      .select(`
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
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Apply Filters
    if (keywordParam) {
      // ilike is case-insensitive search in Postgres
      query = query.ilike("title", `%${keywordParam}%`);
    }
    if (categoryParam) {
      query = query.eq("category_id", categoryParam);
    }
    if (locationParam) {
      query = query.eq("location_id", locationParam);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
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

  function formatSalary(min, max) {
    if (!min && !max) return "Not disclosed";
    const format = (v) => Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    if (min && max) return `₹${format(min)} - ₹${format(max)}`;
    if (min) return `₹${format(min)}`;
    return `₹${format(max)}`;
  }

  return (
    <div className="page-shell">
      <div className="container-page py-8 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Find Jobs</h1>
        </div>

        {/* Search & Filter Bar */}
        <form
          onSubmit={handleSearch}
          className="sticky top-[73px] z-30 mb-8 rounded-2xl border border-line bg-white/90 p-3 shadow-soft backdrop-blur-xl sm:p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Job title or keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Job title or keyword"
                className="input pl-10"
              />
            </div>

            <div className="relative min-w-0 flex-1 lg:max-w-[16rem]">
              <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="Category"
                className={`select pl-10 ${categoryId ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-500/10" : ""}`}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="relative min-w-0 flex-1 lg:max-w-[16rem]">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                aria-label="Location"
                className={`select pl-10 ${locationId ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-500/10" : ""}`}
              >
                <option value="">All Locations</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1 px-6 lg:flex-none">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <button type="button" onClick={clearFilters} className="btn btn-secondary flex-1 px-5 lg:flex-none">
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Results Area */}
        {loading && (
          <div>
            <p className="mb-5 text-sm text-muted">Loading jobs...</p>
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="No jobs found"
            description="Try changing your search filters or check back later."
          />
        )}

        {!loading && jobs.length > 0 && (
          <div>
            <p className="mb-5 text-sm text-muted">
              Showing <strong className="font-semibold text-ink">{jobs.length}</strong> jobs
            </p>

            <div className="flex flex-col gap-2.5">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  salary={formatSalary(job.min_salary, job.max_salary)}
                  featured={Boolean(job.is_featured)}
                  showDate
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
