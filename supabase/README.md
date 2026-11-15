# Supabase — NCR Job database

## 1. Run the reset (first time / clean slate)

Open **Supabase Dashboard → SQL Editor → New query**, paste the whole of
[`00_full_reset.sql`](./00_full_reset.sql) and press **Run**.

It is **destructive**:

| What | Effect |
| --- | --- |
| every app object in `public` | dropped dynamically (also old leftovers: `job_seeker_profiles`, `applications`, `saved_jobs`, old functions) |
| storage policies using `is_admin()` | dropped together with the old function (`CASCADE`) |
| `auth.users` | **deleted** (every forgotten password disappears) |
| Admin account | created fresh with the email/password from section 7 of the file |
| Categories | seeded **without** `Government Jobs` |
| Plans | `basic` ₹9 / 5 jobs / 30 days, `pro` ₹29 / 35 jobs / 90 days |

Before running, edit section 7:

```sql
v_admin_email text := 'admin@ncrjob.in';
v_admin_pass  text := 'Admin@12345';
```

Then log in at `/admin/login` with those credentials and change the password.

## 2. Optional helpers

[`01_helpers.sql`](./01_helpers.sql) — safe, non-destructive utilities:

```sql
select public.admin_reset_password('employer@example.com', 'NewPass@123');
select public.admin_make_admin('you@example.com');
update public.categories set status = 'inactive' where slug = 'government-jobs';
```

## 3. Schema overview

```
auth.users
   └── profiles            (1:1, role: seeker | employer | admin)
         └── employers     (1:1, status: pending | active | blocked)
               ├── jobs    (status: pending | active | rejected | closed)
               └── employer_subscriptions
                           (status: created | pending | approved | rejected | failed | cancelled)

categories ─┐
locations  ─┼── jobs
plans      ─┴── employer_subscriptions
```

### Security rules that matter

- `is_verified`, `status`, `job_limit`, `subscription_expires_at` on `employers`
  can only be changed by an admin or by `service_role` — an employer can never
  activate himself.
- Deleting a user cascades: profile → employer → jobs → subscriptions.
- Posting a job automatically subtracts 1 from `job_limit`
  (trigger `jobs_decrement_limit`).
- `activate_employer_subscription(uuid)` is executable **only** by
  `service_role`; the Razorpay Edge Function calls it after verifying the
  payment signature.

### Razorpay columns (already in place)

`employer_subscriptions`: `razorpay_order_id`, `razorpay_payment_id`,
`razorpay_signature`, `paid_at`, `plan_id`, `duration_days`, `currency`.

## 4. Deploying the Razorpay Edge Functions

The frontend calls two Supabase Edge Functions:

| Function | Endpoint | Purpose |
| --- | --- | --- |
| `create-order` | `POST /functions/v1/create-order` | creates the Razorpay order (amount comes from `plans`) |
| `verify-payment` | `POST /functions/v1/verify-payment` | HMAC signature check + Razorpay confirmation + activation |

Deploy them with the Supabase CLI (needs a Supabase access token):

```powershell
npm.cmd run sb:login     # --agent=no so it can prompt; opens the browser
npm.cmd run sb:secrets   # pushes RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET from .env
npm.cmd run sb:deploy    # uploads both functions (server-side bundling, no Docker)
```

> Supabase CLI 3.x disables prompts when it detects an AI agent (`AGENT`,
> `AI_AGENT`, `OPENCODE` env vars). The `sb:login` script passes `--agent=no`
> to re-enable the interactive browser flow.

Non-interactive alternative (recommended):

```powershell
supabase.cmd login --token sbp_xxxxxxxxxxxxxxxx
npm.cmd run sb:secrets
npm.cmd run sb:deploy
```

Verify:

```powershell
curl.exe -i -X OPTIONS https://vqbatlkrteqzwlunhdln.supabase.co/functions/v1/create-order
# expect 200 + access-control-allow-origin
```

Secrets are read with `Deno.env.get(...)`; they are never bundled into the
frontend. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically by Supabase.

Local development (optional):

```powershell
supabase functions serve create-order --env-file .env
supabase functions serve verify-payment --env-file .env
```

Test cards: <https://razorpay.com/docs/payments/payments/test-card-details/>

## 5. Payment flow

```
BecomeEmployer.jsx
  1. supabase.auth.signUp()                     -> account + session
  2. employers.upsert()                         -> pending, job_limit 0
  3. create-order  (JWT)                        -> Razorpay order + subscription row
  4. Razorpay Checkout modal                    -> UPI / card / netbanking
  5. verify-payment (JWT + signature)           -> HMAC ok + payment captured
  6. activate_employer_subscription()           -> status active, credits, expiry
```

The employer can never activate himself: `status`, `is_verified`, `job_limit`
and `subscription_expires_at` are protected by a trigger and only an admin or
`service_role` may change them.

