import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px", backgroundColor: "#f8fafc", minHeight: "80vh" }}>
      <h1 style={{ marginBottom: "20px", color: "#0f172a" }}>Find Jobs</h1>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px", backgroundColor: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
        <input 
          type="text" 
          placeholder="Job title or keyword..." 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ flex: "1 1 250px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "15px" }}
        />
        
        <select 
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ flex: "1 1 200px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "15px", backgroundColor: "#fff" }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select 
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          style={{ flex: "1 1 200px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "15px", backgroundColor: "#fff" }}
        >
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Search
          </button>
          <button type="button" onClick={clearFilters} style={{ padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}>
            Clear
          </button>
        </div>
      </form>

      {/* Results Area */}
      {loading && <p style={{ textAlign: "center", color: "#64748b" }}>Loading jobs...</p>}

      {!loading && jobs.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ color: "#0f172a" }}>No jobs found</h3>
          <p style={{ color: "#64748b" }}>Try changing your search filters or check back later.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ color: "#64748b", marginBottom: "0" }}>Showing <strong>{jobs.length}</strong> jobs</p>
          
          {jobs.map((job) => (
            <Link 
              to={`/jobs/${job.id}`} 
              key={job.id} 
              style={{ 
                textDecoration: "none", 
                backgroundColor: "#fff", 
                border: "1px solid #e2e8f0", 
                borderRadius: "10px", 
                padding: "20px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                flexWrap: "wrap", 
                gap: "15px", 
                color: "#111",
                transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{job.title}</h3>
                  {job.is_featured && <span style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "bold" }}>FEATURED</span>}
                </div>
                <p style={{ margin: "0 0 5px 0", color: "#2563eb", fontWeight: "500" }}>{job.employers?.company_name || "Company"}</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  📍 {job.locations?.name || "Location"} &nbsp;•&nbsp; 💼 {job.categories?.name || "Category"} &nbsp;•&nbsp; ⏱️ {job.job_type}
                </p>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontWeight: "bold", color: "#16a34a", fontSize: "16px" }}>{formatSalary(job.min_salary, job.max_salary)}</p>
                <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>
                  {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}