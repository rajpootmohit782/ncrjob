import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getCategoryIcon, getCategoryTone } from "../../components/CategoryIcon";
import JobCard from "../../components/JobCard";
import { CountUp, EmptyState, LoadingState, Reveal, SectionHeading } from "../../components/ui";

const HOVER_BORDERS = {
  indigo: "hover:border-indigo-300",
  sky: "hover:border-sky-300",
  emerald: "hover:border-emerald-300",
  amber: "hover:border-amber-300",
  rose: "hover:border-rose-300",
  violet: "hover:border-violet-300",
  teal: "hover:border-teal-300",
  orange: "hover:border-orange-300",
};

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

  return (
    <div className="page-shell">
      <section className="hero-gradient relative overflow-hidden pb-32 pt-14 sm:pt-20">
        <div className="hero-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="hero-glow pointer-events-none absolute -right-24 top-4 h-80 w-80 rounded-full blur-3xl sm:h-[28rem] sm:w-[28rem]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" aria-hidden="true" />

        <div className="container-page relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-indigo-100 backdrop-blur-md sm:text-sm">
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
              Delhi NCR's private-sector job marketplace
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your <span className="text-amber-400">Next Job</span> in NCR
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-indigo-100/80 sm:text-lg">
              Connect with verified private-sector employers across Noida, Greater
              Noida, Gurugram and Delhi.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3">
              <div className="glass-chip flex min-w-[7.5rem] items-center gap-2.5">
                <BriefcaseBusiness className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <div className="text-left">
                  <p className="font-display text-xl font-bold leading-none text-white">
                    <CountUp value={stats.activeJobs} />
                  </p>
                  <p className="mt-1 text-[11px] text-indigo-100/80">Active Jobs</p>
                </div>
              </div>
              <div className="glass-chip flex min-w-[7.5rem] items-center gap-2.5">
                <Building2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <div className="text-left">
                  <p className="font-display text-xl font-bold leading-none text-white">
                    <CountUp value={stats.activeEmployers} />
                  </p>
                  <p className="mt-1 text-[11px] text-indigo-100/80">Active Employers</p>
                </div>
              </div>
              <div className="glass-chip flex min-w-[7.5rem] items-center gap-2.5">
                <MapPin className="h-4 w-4 text-sky-300" aria-hidden="true" />
                <div className="text-left">
                  <p className="font-display text-xl font-bold leading-none text-white">
                    <CountUp value={stats.activeLocations} />
                  </p>
                  <p className="mt-1 text-[11px] text-indigo-100/80">Locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page relative z-20 -mt-16">
        <form
          onSubmit={handleSearch}
          className="card flex flex-col gap-2 p-2 shadow-lift sm:flex-row sm:items-center"
        >
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-xl px-3 sm:px-4">
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Job title or Keyword"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full min-w-0 border-0 bg-transparent py-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />

          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border-t border-line px-3 sm:border-t-0 sm:px-4">
            <MapPin className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <select
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full min-w-0 appearance-none border-0 bg-transparent py-3 text-sm text-ink focus:outline-none focus:ring-0"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-accent w-full sm:w-auto sm:px-7">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search Jobs
          </button>
        </form>
      </div>

      <div className="container-page py-14 sm:py-20">
        <Reveal as="section" className="mb-16 sm:mb-20">
          <SectionHeading
            title="Browse by Category"
            description="Find jobs in your preferred field"
          />

          {loading ? (
            <LoadingState label="Loading categories..." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {categories.map((cat, index) => {
                const tone = getCategoryTone(index);
                const CategoryIcon = getCategoryIcon(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    to={`/jobs?category=${cat.id}`}
                    className={`card card-hover group flex min-h-40 flex-col p-4 sm:p-5 ${HOVER_BORDERS[tone] || HOVER_BORDERS.indigo}`}
                  >
                    <IconChipForCategory tone={tone} icon={CategoryIcon} />
                    <h3 className="mt-4 text-sm font-bold leading-5 text-ink sm:text-base">
                      {cat.name}
                    </h3>
                    <p className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-slate-400 transition-colors group-hover:text-brand">
                      View jobs
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </Reveal>

        {featuredJobs.length > 0 && (
          <Reveal as="section" className="mb-16 sm:mb-20" delay={80}>
            <SectionHeading
              title={
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500" aria-hidden="true" />
                  Featured Jobs
                </span>
              }
              description="Hand-picked opportunities for you"
              action={
                <Link to="/jobs" className="link-arrow">
                  View All
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />

            <div className="flex flex-col gap-2.5">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} salary={formatSalary(job.min_salary, job.max_salary)} featured />
              ))}
            </div>
          </Reveal>
        )}

        <Reveal as="section" className="mb-16 sm:mb-20" delay={120}>
          <SectionHeading
            title="Latest Jobs"
            description="Recently posted opportunities"
            action={
              <Link to="/jobs" className="link-arrow">
                View All
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />

          {loading ? (
            <LoadingState label="Loading jobs..." />
          ) : latestJobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="New jobs are being reviewed. Check back soon or browse all openings."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {latestJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  salary={formatSalary(job.min_salary, job.max_salary)}
                  showDate
                />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal as="section" delay={160}>
          <div className="hero-gradient relative overflow-hidden rounded-3xl p-6 text-center shadow-lift sm:p-10 lg:p-14">
            <div className="hero-dots pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="hero-glow pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Are You an Employer?</h2>
              <p className="mt-3 text-sm leading-7 text-indigo-100/80 sm:text-base">
                Post your job listings and reach candidates across Delhi NCR.
              </p>
              <Link to="/become-employer" className="btn btn-accent mt-7">
                Post a Job
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function IconChipForCategory({ tone, icon: Icon }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
    teal: "bg-teal-50 text-teal-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone] || tones.indigo}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
