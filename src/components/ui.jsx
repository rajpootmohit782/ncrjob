import { useEffect, useRef, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

const TONES = {
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50 text-teal-600",
  orange: "bg-orange-50 text-orange-600",
};

export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const delayClass =
    delay > 240 ? "reveal-delay-4" : delay > 160 ? "reveal-delay-3" : delay > 80 ? "reveal-delay-2" : delay > 0 ? "reveal-delay-1" : "";

  return (
    <Tag
      ref={ref}
      className={`reveal ${delayClass} ${visible ? "reveal-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CountUp({ value = 0, suffix = "", className = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplay(0);
      return undefined;
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return undefined;
    }

    let frame = 0;
    const duration = 850;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="section-heading mb-0">
        {eyebrow && <p className="section-kicker">{eyebrow}</p>}
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function IconChip({ icon: Icon, tone = "indigo", size = "md", className = "" }) {
  const sizeClass = size === "sm" ? "h-9 w-9 rounded-xl" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-xl";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${sizeClass} ${TONES[tone] || TONES.indigo} ${className}`}>
      <Icon className={size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5"} aria-hidden="true" />
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted">
      <LoaderCircle className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function FormMessage({ type = "error", children }) {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : type === "info"
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : "border-rose-200 bg-rose-50 text-rose-800";

  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>{children}</div>;
}

export function ArrowLink({ to, children, className = "" }) {
  return (
    <a href={to} className={`link-arrow ${className}`}>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
