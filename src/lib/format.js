/* Shared display helpers used across the public site and dashboards. */

export function initials(name, fallback = "VMW") {
  const letters = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return letters || fallback;
}

export function formatSalary(min, max, undisclosed = "Salary not disclosed") {
  if (!min && !max) return undisclosed;

  const format = (value) =>
    Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  if (min && max) return `₹${format(min)} – ₹${format(max)}`;
  if (min) return `₹${format(min)}+`;
  return `Up to ₹${format(max)}`;
}

export function jobTypeLabel(value) {
  return (value || "full-time")
    .replace("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatDate(value, options = {}) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function timeAgo(value) {
  if (!value) return "";

  const then = new Date(value).getTime();
  const days = Math.floor((Date.now() - then) / 86400000);

  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;

  return formatDate(value);
}

export function statusTone(status) {
  switch (status) {
    case "active":
    case "approved":
      return "success";
    case "pending":
    case "created":
      return "warn";
    case "blocked":
    case "rejected":
    case "failed":
      return "danger";
    default:
      return "muted";
  }
}
