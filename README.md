# VMWjobs

A private-sector job marketplace for **Delhi NCR** — Noida, Greater Noida, Gurugram and Delhi.

Candidates browse and apply for free. Employers buy a simple one-time plan and receive applications directly on WhatsApp. There are no government-job listings, no middlemen and no candidate fees.

Built with **React 19 + Vite 7**, **Supabase** and **Razorpay**.

---

## Highlights

- Fully responsive public site with live job counts and filters
- Employer signup with Razorpay Standard Web Checkout
- Automatic employer activation after signature verification
- Admin moderation for jobs, employers and payments
- Direct WhatsApp applications — no candidate inbox to manage
- Row-level security on every application table
- Private-sector categories only (NCR-focused)

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 7 |
| Styling | Page-level inline styles + shared font/reset in `src/index.css` |
| Database & auth | Supabase (Postgres, Auth, RLS) |
| Payments | Razorpay Standard Web Checkout |
| Serverless | Supabase Edge Functions (Deno) |
| Hosting | Vercel (SPA rewrites via `vercel.json`) |

## Quick start

### Requirements

- **Node.js 22 LTS** (Vite 7 supports 20.19+, 22.12+ and 24)
- npm 10+
- A Supabase project
- A Razorpay account (test mode is fine)

> On Windows PowerShell, if `npm` is blocked by the execution policy, use `npm.cmd` instead.

### Install

```powershell
git clone https://github.com/rajpootmohit782/ncrjob.git
cd ncrjob
npm.cmd install
Copy-Item .env.example .env
```

Fill in `.env` with your project values, then start the dev server:

```powershell
npm.cmd run dev
```

The app runs at <http://localhost:5173>.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon/publishable key |
| `VITE_RAZORPAY_KEY_ID` | Frontend | Public Razorpay key ID |
| `RAZORPAY_KEY_ID` | Server only | Razorpay key ID used by Edge Functions |
| `RAZORPAY_KEY_SECRET` | Server only | Razorpay secret used to sign/verify orders |

**Never put the Razorpay secret or the Supabase service-role key in a `VITE_*` variable.** Anything prefixed with `VITE_` is bundled into the browser.

Server-only values are pushed to Supabase secrets with:

```powershell
npm.cmd run sb:secrets
```

`.env` is git-ignored. Commit only `.env.example`.

## Database setup

Detailed instructions live in [`supabase/README.md`](supabase/README.md).

1. Open **Supabase Dashboard → SQL Editor**.
2. Edit section 7 of [`supabase/00_full_reset.sql`](supabase/00_full_reset.sql) and set a strong admin email and password.
3. Run the SQL.

> **`00_full_reset.sql` is destructive.** It drops application objects and `auth.users`. Use it only for a fresh environment or a deliberate reset.

The reset seeds:

- Categories without `Government Jobs`
- Plans: **Basic ₹9** (5 jobs / 30 days) and **Pro ₹29** (35 jobs / 90 days)
- One admin account with the credentials you set in section 7

Optional maintenance helpers are in [`supabase/01_helpers.sql`](supabase/01_helpers.sql) (password reset, promote admin, emergency activation).

## Razorpay setup

The payment flow is:

```text
/become-employer
  1. supabase.auth.signUp()                 -> account + session
  2. employers.upsert()                     -> pending, job_limit 0
  3. create-order (Edge Function)           -> Razorpay order + subscription row
  4. Razorpay Checkout                      -> UPI / card / net banking
  5. verify-payment (Edge Function)         -> HMAC signature + payment check
  6. activate_employer_subscription()       -> active account, credits, expiry
```

Deploy the functions:

```powershell
npm.cmd run sb:login
npm.cmd run sb:secrets
npm.cmd run sb:deploy
```

Functions:

| Function | Purpose |
| --- | --- |
| `create-order` | Creates an order using the price stored in `plans` |
| `verify-payment` | Verifies the Razorpay signature and activates the employer |

The employer can never activate their own account. `status`, `is_verified`, `job_limit` and `subscription_expires_at` are protected by a database trigger and can only be changed by an admin or `service_role`.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run sb:login` | Supabase CLI browser login |
| `npm run sb:secrets` | Push server secrets from `.env` |
| `npm run sb:deploy` | Deploy both Razorpay Edge Functions |

## Routes

### Public

| Route | Page |
| --- | --- |
| `/` | Homepage |
| `/jobs` | Job search and filters |
| `/jobs/:id` | Job details + WhatsApp apply |
| `/become-employer` | Plans and employer signup |
| `/about` | About VMWjobs |
| `/contact` | Contact and report a listing |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/disclaimer` | Disclaimer |

### Auth

| Route | Purpose |
| --- | --- |
| `/login` | General sign-in (routes by role) |
| `/register` | Job-seeker account (browsing is free without one) |
| `/employer-login` | Employer sign-in |
| `/admin/login` | Admin sign-in |

### Employer (protected)

| Route | Page |
| --- | --- |
| `/employer-dashboard` | Stats, credits and recent listings |
| `/employer/profile` | Company profile |
| `/employer/post-job` | Create a listing |

### Admin (protected)

| Route | Page |
| --- | --- |
| `/admin/dashboard` | Overview and queue counts |
| `/admin/jobs` | Approve, reject, close or feature jobs |
| `/admin/employers` | Review payments and activate accounts |

## Project structure

```text
src/
  components/          Shared UI, icons, nav, footer, route guards
  context/             Auth provider
  hooks/               useEmployer
  lib/                 Supabase client, Razorpay, site config, formatting
  pages/
    public/            Home, Jobs, JobDetails, BecomeEmployer
    auth/              Login, Register, EmployerLogin
    employer/          Dashboard, Profile, PostJob
    admin/             Dashboard, Jobs, Employers, AdminLogin
    static/            About, Contact, Privacy, Terms, Disclaimer
  App.jsx              Routes
  index.css            Global fonts and base reset (page styles are inline)
supabase/
  functions/           create-order, verify-payment, shared HTTP helper
  00_full_reset.sql    Full schema + seed + admin bootstrap
  01_helpers.sql       Optional maintenance functions
```

## Configuration

| What | Where |
| --- | --- |
| Brand, contact email, phone, address, socials | `src/lib/site.js` |
| Global fonts and base reset | `src/index.css` |
| Plans and prices | `plans` table (seeded by the reset SQL) |
| Razorpay checkout branding | `src/lib/razorpay.js` |
| Production URL rewrites | `vercel.json` |

Before going live, replace the placeholder contact details in `src/lib/site.js` and add real social links.

## Deployment

### Vercel

1. Import this repository into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add the three `VITE_*` environment variables for Production and Preview.
6. Deploy.

`vercel.json` rewrites every path to `index.html` so React Router works on refresh.

### Supabase

Deploy the Edge Functions and their secrets once per environment:

```powershell
npm.cmd run sb:secrets
npm.cmd run sb:deploy
```

For live payments, replace the test Razorpay keys with live keys, update `VITE_RAZORPAY_KEY_ID` in Vercel, and push the live server keys to Supabase secrets.

## Security model

- RLS is enabled on all application tables.
- Admin-only writes are checked with `public.is_admin()`.
- Employer activation fields are protected by a trigger.
- Only active, paid employers with credits can insert jobs.
- A database trigger deducts one credit per new job.
- `activate_employer_subscription(uuid)` is executable only by `service_role`.
- Razorpay signatures are verified server-side.
- Card, UPI and bank details never touch this application.
- `.env` and `supabase/.temp` are ignored by Git.

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. All changes are expected to keep the production build green:

```powershell
npm.cmd run build
```

## License

Private and proprietary. Copyright © 2026 VMWjobs / MohitSpace.in. All rights reserved.
