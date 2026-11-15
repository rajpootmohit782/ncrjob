# Security policy

## Supported version

Security fixes are applied to the `main` branch. Older commits and forks are not supported.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Email **hello@ncrjob.in** with the subject **“Security — VMWjobs”**, including:

- A short description of the issue
- Steps to reproduce
- The affected route, function or database object
- Any relevant request/response evidence (redact secrets and personal data)

We aim to acknowledge reports within **3 working days** and will keep you updated while we investigate.

## In scope

- Authentication or authorization bypass
- Supabase RLS policy gaps
- Exposure of the Razorpay secret, service-role key or other server secrets
- Payment verification bypass or price manipulation
- Ability for an employer to self-activate or grant themselves job credits
- Stored XSS or unsafe rendering of employer/job content
- Account takeover or password-reset abuse

## Out of scope

- Denial of service through very large traffic volumes
- Issues that require a compromised device or browser
- Reports from automated scanners without a reproducible impact
- Social engineering of staff or users

## Handling secrets

- Never commit `.env`, `supabase/.temp`, service-role keys or Razorpay secrets.
- If a secret is exposed, rotate it immediately:
  - **Razorpay**: rotate the key secret in the dashboard, then update Supabase secrets and Vercel.
  - **Supabase**: rotate the service-role key and redeploy the Edge Functions.
- Change the admin password if it was ever shared, committed or reused.
