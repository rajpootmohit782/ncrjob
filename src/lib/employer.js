// Central helper for employer job-post limits.
export const UNLIMITED_JOB_LIMIT = 1000000;

export function hasUnlimitedJobs(employer) {
  return Boolean(
    employer &&
      employer.status === "active" &&
      employer.job_limit != null &&
      employer.job_limit >= UNLIMITED_JOB_LIMIT,
  );
}
