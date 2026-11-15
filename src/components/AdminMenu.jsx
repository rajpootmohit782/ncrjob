import { NavLink } from "react-router-dom";
import { BriefcaseIcon, BuildingIcon, ShieldIcon } from "./Icons";

const LINKS = [
  { to: "/admin/dashboard", label: "Overview", Icon: ShieldIcon, end: true },
  { to: "/admin/jobs", label: "Jobs", Icon: BriefcaseIcon },
  { to: "/admin/employers", label: "Employers", Icon: BuildingIcon },
];

export default function AdminMenu() {
  return (
    <nav className="admin-menu" aria-label="Admin sections">
      {LINKS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          <Icon size={14} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
