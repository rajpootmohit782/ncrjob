import { Link } from "react-router-dom";

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`brand ${className}`.trim()} aria-label="VMWjobs home">
      <span className="brand-mark" aria-hidden="true">
        V
      </span>
      <span className="brand-text">
        <span className="brand-name">
          VMW<span>jobs</span>
        </span>
        <span className="brand-tag">Careers in NCR</span>
      </span>
    </Link>
  );
}
