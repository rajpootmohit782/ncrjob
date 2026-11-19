import {
  BookOpen,
  Cpu,
  GraduationCap,
  School,
  ScrollText,
  Wrench,
} from "lucide-react";

// Homepage qualification tiles. Order matters: it is the order shown to users.
export const QUALIFICATIONS = [
  {
    value: "TENTH",
    label: "10th Pass Jobs",
    tileLabel: "10th Pass",
    shortLabel: "10th",
    slug: "10th-pass-jobs",
    Icon: BookOpen,
    tone: "indigo",
  },
  {
    value: "TWELFTH",
    label: "12th Pass Jobs",
    tileLabel: "12th Pass",
    shortLabel: "12th",
    slug: "12th-pass-jobs",
    Icon: School,
    tone: "sky",
  },
  {
    value: "ITI",
    label: "ITI Jobs",
    tileLabel: "ITI",
    shortLabel: "ITI",
    slug: "iti-jobs",
    Icon: Wrench,
    tone: "emerald",
  },
  {
    value: "DIPLOMA",
    label: "Diploma Jobs",
    tileLabel: "Diploma",
    shortLabel: "Diploma",
    slug: "diploma-jobs",
    Icon: ScrollText,
    tone: "amber",
  },
  {
    value: "GRADUATE",
    label: "Graduation Jobs",
    tileLabel: "Graduation",
    shortLabel: "Graduate",
    slug: "graduate-jobs",
    Icon: GraduationCap,
    tone: "violet",
  },
  {
    value: "BTECH_MTECH",
    label: "B.Tech / M.Tech Jobs",
    tileLabel: "B.Tech / M.Tech",
    shortLabel: "B.Tech",
    slug: "btech-mtech-jobs",
    Icon: Cpu,
    tone: "rose",
  },
];

export const ANY_QUALIFICATION = "ANY";

export const ANY_QUALIFICATION_LABEL = "Any / No specific qualification";

// Options for the post-job form and the /jobs filter.
export const QUALIFICATION_OPTIONS = [
  ...QUALIFICATIONS.map(({ value, label }) => ({ value, label })),
  { value: ANY_QUALIFICATION, label: ANY_QUALIFICATION_LABEL },
];

const LABELS = {
  ...Object.fromEntries(
    QUALIFICATIONS.map(({ value, label }) => [value, label]),
  ),
  [ANY_QUALIFICATION]: ANY_QUALIFICATION_LABEL,
};

export const QUALIFICATION_VALUES = QUALIFICATION_OPTIONS.map(
  ({ value }) => value,
);

/** Human label for a stored value, e.g. "BTECH_MTECH" -> "B.Tech / M.Tech Jobs". */
export function qualificationLabel(value) {
  return LABELS[value] || ANY_QUALIFICATION_LABEL;
}

/** Tile metadata (icon, slug, tone) for a stored value, or null for ANY/unknown. */
export function getQualification(value) {
  return QUALIFICATIONS.find((item) => item.value === value) || null;
}

/** Landing-page slug for a value, e.g. "ITI" -> "iti-jobs". */
export function qualificationSlug(value) {
  return getQualification(value)?.slug || null;
}

/** Normalises a ?qualification= URL value; returns "" when absent/invalid. */
export function normalizeQualification(value) {
  if (!value) return "";
  const upper = String(value).toUpperCase();
  return QUALIFICATION_VALUES.includes(upper) ? upper : "";
}

/**
 * A category filter matches jobs tagged with that qualification plus jobs
 * tagged ANY, so legacy jobs remain visible everywhere until they are edited.
 */
export function qualificationFilterValues(value) {
  return value ? [value, ANY_QUALIFICATION] : [];
}
