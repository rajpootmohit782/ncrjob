import { Link, useLocation } from "react-router-dom";
import { BriefcaseBusiness, Building2, LayoutDashboard } from "lucide-react";

const links = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/admin/employers", label: "Employers", icon: Building2 },
];

export default function AdminMenu() {
  const location = useLocation();

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-soft"
      aria-label="Admin sections"
    >
      {links.map((link) => {
        const active = location.pathname === link.to;
        const Icon = link.icon;

        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-brand text-white shadow-md shadow-indigo-950/20"
                : "text-slate-600 hover:bg-indigo-50 hover:text-brand"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
