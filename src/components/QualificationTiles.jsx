import { QUALIFICATIONS } from "../lib/qualifications";

const TONE_CLASSES = {
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
};

/**
 * Six compact qualification tiles laid out in a single row from 320px up.
 * Mobile shows a short label ("10th", "B.Tech"); from `sm` the full tile label
 * is shown. Clicking a tile filters the feed in place via ?qualification=.
 */
export default function QualificationTiles({
  active = "",
  counts = {},
  loading = false,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-6 gap-1 sm:gap-1.5 md:gap-2">
      {QUALIFICATIONS.map(({ value, tileLabel, shortLabel, Icon, tone }) => {
        const isActive = active === value;
        const count = counts[value];

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(isActive ? "" : value)}
            aria-pressed={isActive}
            aria-label={tileLabel}
            title={tileLabel}
            className={`group flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-1.5 text-center transition-all duration-200 sm:gap-1 sm:rounded-xl sm:px-1 sm:py-2 ${
              isActive
                ? "border-brand bg-brand text-white shadow-md shadow-indigo-950/20"
                : "border-line bg-card text-ink shadow-soft hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lift"
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md sm:h-7 sm:w-7 ${
                isActive
                  ? "bg-white/15 text-white"
                  : TONE_CLASSES[tone] || TONE_CLASSES.indigo
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </span>

            <span className="w-full text-[9px] font-bold leading-[1.15] sm:text-[10px] md:text-[11px]">
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:block">{tileLabel}</span>
            </span>

            <span
              className={`w-full text-[8px] font-medium leading-none sm:text-[9px] md:text-[10px] ${
                isActive ? "text-indigo-100" : "text-muted"
              }`}
            >
              {loading || count === undefined ? (
                <span
                  className={`mx-auto block h-2 w-6 rounded sm:w-8 ${
                    isActive ? "bg-white/25" : "bg-slate-200/80"
                  }`}
                />
              ) : (
                <>
                  {count}
                  <span className="hidden sm:inline"> {count === 1 ? "job" : "jobs"}</span>
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
