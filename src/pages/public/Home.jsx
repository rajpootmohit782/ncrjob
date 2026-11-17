import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    activeEmployers: 0,
    activeLocations: 0,
  });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function fetchHomeData() {
    setLoading(true);

    const [catRes, featRes, latestRes, jobsCount, employersCount, locationsRes] = await Promise.all([
      supabase.from("categories").select("id, name, slug").eq("status", "active").limit(8),
      supabase.from("jobs").select("*, employers(company_name), locations(name)").eq("status", "active").eq("is_featured", true).limit(6),
      supabase.from("jobs").select("*, employers(company_name), locations(name)").eq("status", "active").order("created_at", { ascending: false }).limit(6),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("employers").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("locations").select("id, name").eq("status", "active").order("name")
    ]);

    setCategories(catRes.data || []);
    setFeaturedJobs(featRes.data || []);
    setLatestJobs(latestRes.data || []);
    setLocations(locationsRes.data || []);
    setStats({
      activeJobs: jobsCount.count || 0,
      activeEmployers: employersCount.count || 0,
      activeLocations: (locationsRes.data || []).length,
    });

    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (searchKeyword.trim()) params.set("keyword", searchKeyword.trim());
    if (searchLocation) params.set("location", searchLocation);

    const query = params.toString();
    navigate(`/jobs${query ? `?${query}` : ""}`);
  }

  function formatSalary(min, max) {
    if (!min && !max) return "Not disclosed";
    const format = (v) => Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    if (min && max) return `₹${format(min)} - ₹${format(max)}`;
    if (min) return `₹${format(min)}`;
    return `₹${format(max)}`;
  }

  // Category icons mapping
  function getCategoryIcon(slug) {
    const icons = {
      "private-jobs": "🏢",
      "data-entry-back-office": "💻",
      "bpo-customer-care": "📞",
      "delivery-driver-logistics": "🚚",
      "sales-marketing": "📊",
      "receptionist-front-office": "🪑",
      "security-housekeeping": "🛡️",
      "accounts-finance": "💰",
      "hr-admin": "👥",
      "teaching-tutoring": "📚",
      "campus-trainee": "🎓",
      "aadhar-field-verification": "🪪",
      "iit-institute-jobs": "🏫",
      "work-from-home": "🏠",
      "noida-jobs": "📍",
      "gurgaon-jobs": "📍",
      "other-jobs": "📋",
    };
    return icons[slug] || "💼";
  }

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      
      {/* ==================== HERO SECTION ==================== */}
      <section style={{ 
        background: "linear-gradient(135deg, #669ee7 0%, #7e0d62 100%)", 
        padding: "70px 20px 80px", 
        textAlign: "center", 
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "rgba(37, 99, 235, 0.1)" }}></div>
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "150px", height: "150px", borderRadius: "50%", backgroundColor: "rgba(37, 99, 235, 0.08)" }}></div>
        
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ 
            display: "inline-block", 
            backgroundColor: "rgba(123, 159, 238, 0.2)", 
            padding: "6px 16px", 
            borderRadius: "20px", 
            marginBottom: "20px",
            border: "1px solid rgba(124, 164, 250, 0.3)"
          }}>
            <span style={{ fontSize: "14px", color: "#93c5fd" }}>
              🎯 Delhi NCR's private-sector job marketplace
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: "42px", 
            marginBottom: "12px", 
            fontWeight: "800", 
            lineHeight: "1.2",
            margin: "0 auto 35px",
            letterSpacing: "-0.5px"
          }}>
               Find Your <span style={{ color: "#60a5fa" }}>Next Job</span> in NCR
          </h1>
          
          <p style={{ 
            fontSize: "18px", 
            marginBottom: "35px", 
            color: "#94a3b8",
            maxWidth: "500px",
            margin: "0 auto 35px"
          }}>
            Connect with verified private-sector employers across Noida, Greater
            Noida, Gurugram and Delhi.
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ 
            maxWidth: "750px", 
            margin: "0 auto", 
            display: "flex", 
            gap: "12px", 
            flexWrap: "wrap", 
            justifyContent: "center", 
            backgroundColor: "#fff", 
            padding: "12px", 
            borderRadius: "16px", 
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)" 
          }}>
            <div style={{ flex: "1 1 220px", position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px" }}>🔍</span>
              <input 
                type="text" 
                placeholder="Job title or Keyword" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "14px 15px 14px 45px", 
                  border: "2px solid #e2e8f0", 
                  borderRadius: "10px", 
                  fontSize: "15px", 
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            
            <div style={{ flex: "1 1 180px", position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px" }}>📍</span>
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "14px 15px 14px 45px", 
                  border: "2px solid #e2e8f0", 
                  borderRadius: "10px", 
                  fontSize: "15px", 
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                  cursor: "pointer"
                }}
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" style={{ 
              padding: "14px 35px", 
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)", 
              color: "#fff", 
              border: "none", 
              borderRadius: "10px", 
              fontWeight: "bold", 
              cursor: "pointer", 
              fontSize: "16px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
              transition: "all 0.3s"
            }}>
              Search Jobs
            </button>
          </form>
          
          {/* Quick Stats */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "40px", 
            marginTop: "35px",
            flexWrap: "wrap"
          }}>
            <div>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0, color: "#60a5fa" }}>{stats.activeJobs}</p>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>Active Jobs</p>
            </div>
            <div>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0, color: "#60a5fa" }}>{stats.activeEmployers}</p>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>Active Employers</p>
            </div>
            <div>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0, color: "#60a5fa" }}>{stats.activeLocations}</p>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>Locations</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* ==================== CATEGORIES SECTION ==================== */}
        <section style={{ marginBottom: "50px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "26px", margin: "0 0 6px", color: "#0f172a", fontWeight: "700" }}>
                Browse by Category
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
                Find jobs in your preferred field
              </p>
            </div>
          </div>
          
          {loading ? (
            <p style={{ color: "#64748b" }}>Loading categories...</p>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
              gap: "14px" 
            }}>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/jobs?category=${cat.id}`} 
                  style={{ 
                    textDecoration: "none", 
                    backgroundColor: "#fff", 
                    padding: "20px 16px", 
                    borderRadius: "12px", 
                    border: "1px solid #e2e8f0", 
                    textAlign: "center", 
                    transition: "all 0.3s ease", 
                    color: "#0f172a",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(37, 99, 235, 0.15)";
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <div style={{ 
                    fontSize: "32px", 
                    marginBottom: "10px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    {cat.name}
                  </h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                    View jobs →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ==================== FEATURED JOBS ==================== */}
        {featuredJobs.length > 0 && (
          <section style={{ marginBottom: "50px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "26px", margin: "0 0 6px", color: "#0f172a", fontWeight: "700" }}>
                  ⭐ Featured Jobs
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
                  Hand-picked opportunities for you
                </p>
              </div>
              <Link to="/jobs" style={{ 
                color: "#2563eb", 
                textDecoration: "none", 
                fontWeight: "600", 
                fontSize: "14px",
                padding: "8px 16px",
                backgroundColor: "#eff6ff",
                borderRadius: "8px"
              }}>
                View All →
              </Link>
            </div>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
              gap: "18px" 
            }}>
              {featuredJobs.map((job) => (
                <Link 
                  to={`/jobs/${job.id}`} 
                  key={job.id} 
                  style={{ 
                    textDecoration: "none", 
                    backgroundColor: "#fff", 
                    border: "1px solid #e2e8f0", 
                    borderRadius: "14px", 
                    padding: "22px", 
                    position: "relative", 
                    color: "#111",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  }}
                >
                  <span style={{ 
                    position: "absolute", 
                    top: "14px", 
                    right: "14px", 
                    background: "linear-gradient(135deg, #f59e0b, #d97706)", 
                    color: "#fff", 
                    fontSize: "10px", 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    fontWeight: "bold",
                    letterSpacing: "0.5px"
                  }}>
                    ⭐ FEATURED
                  </span>
                  
                  <h3 style={{ margin: "0 0 10px", fontSize: "17px", color: "#0f172a", fontWeight: "700", paddingRight: "80px" }}>
                    {job.title}
                  </h3>
                  
                  <p style={{ margin: "0 0 6px", fontWeight: "600", color: "#2563eb", fontSize: "14px" }}>
                    {job.employers?.company_name || "Company"}
                  </p>
                  
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                      📍 {job.locations?.name || "Location"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                      💼 {job.job_type}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    paddingTop: "12px",
                    borderTop: "1px solid #f1f5f9"
                  }}>
                    <p style={{ margin: 0, fontWeight: "bold", color: "#16a34a", fontSize: "15px" }}>
                      {formatSalary(job.min_salary, job.max_salary)}
                    </p>
                    <span style={{ 
                      fontSize: "12px", 
                      color: "#2563eb", 
                      fontWeight: "600",
                      backgroundColor: "#eff6ff",
                      padding: "4px 10px",
                      borderRadius: "6px"
                    }}>
                      Apply Now →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ==================== LATEST JOBS ==================== */}
        <section style={{ marginBottom: "50px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "26px", margin: "0 0 6px", color: "#0f172a", fontWeight: "700" }}>
                🆕 Latest Jobs
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
                Recently posted opportunities
              </p>
            </div>
            <Link to="/jobs" style={{ 
              color: "#2563eb", 
              textDecoration: "none", 
              fontWeight: "600", 
              fontSize: "14px",
              padding: "8px 16px",
              backgroundColor: "#eff6ff",
              borderRadius: "8px"
            }}>
              View All →
            </Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {!loading && latestJobs.length === 0 && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "30px", textAlign: "center", color: "#64748b" }}>
                New jobs are being reviewed. Check back soon or browse all
                openings.
              </div>
            )}
            {latestJobs.map((job) => (
              <Link 
                to={`/jobs/${job.id}`} 
                key={job.id} 
                style={{ 
                  textDecoration: "none", 
                  backgroundColor: "#fff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "12px", 
                  padding: "18px 20px", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  flexWrap: "wrap", 
                  gap: "12px", 
                  color: "#111",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.1)";
                  e.currentTarget.style.borderColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "10px", 
                    background: "linear-gradient(135deg, #eff6ff, #dbeafe)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0
                  }}>
                    💼
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 5px", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                      {job.title}
                    </h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                      {job.employers?.company_name} • 📍 {job.locations?.name} • {job.job_type}
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                  <p style={{ margin: 0, fontWeight: "bold", color: "#16a34a", fontSize: "14px" }}>
                    {formatSalary(job.min_salary, job.max_salary)}
                  </p>
                  <span style={{ 
                    fontSize: "12px", 
                    color: "#2563eb", 
                    fontWeight: "600",
                    backgroundColor: "#eff6ff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap"
                  }}>
                    Apply →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ==================== CTA SECTION ==================== */}
        <section style={{ 
          background: "linear-gradient(135deg, #1e3a5f, #0f172a)", 
          borderRadius: "16px", 
          padding: "40px", 
          textAlign: "center",
          color: "#fff"
        }}>
          <h2 style={{ fontSize: "28px", margin: "0 0 10px", fontWeight: "700" }}>
            Are You an Employer?
          </h2>
          <p style={{ fontSize: "16px", color: "#94a3b8", margin: "0 0 25px" }}>
            Post your job listings and reach candidates across Delhi NCR.
          </p>
          <Link 
            to="/become-employer" 
            style={{ 
              display: "inline-block",
              padding: "14px 35px", 
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)", 
              color: "#fff", 
              textDecoration: "none", 
              borderRadius: "10px", 
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
            }}
          >
            Post a Job →
          </Link>
        </section>

      </div>
    </div>
  );
}