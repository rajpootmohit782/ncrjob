import { Link, useLocation } from "react-router-dom";

export default function AdminMenu() {
  const location = useLocation();

  const links = [
    {
      to: "/admin/dashboard",
      label: "Overview",
    },
    {
      to: "/admin/jobs",
      label: "Jobs",
    },
    {
      to: "/admin/employers",
      label: "Employers",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          style={{
            textDecoration: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            backgroundColor:
              location.pathname === link.to ? "#0f172a" : "#f1f5f9",
            color: location.pathname === link.to ? "#fff" : "#111",
            fontSize: "14px",
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}