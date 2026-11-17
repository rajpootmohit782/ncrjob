# Contributing

Thanks for helping improve VMWjobs. This project is a production job marketplace, so changes should be small, tested and safe for real users and payments.

## Before you start

- Use **Node.js 22 LTS** and `npm.cmd` on Windows PowerShell.
- Copy `.env.example` to `.env` and use your own Supabase/Razorpay **test** credentials.
- Never commit `.env`, API secrets, service-role keys or real customer data.

## Workflow

1. Create a branch from `main`:

   ```powershell
   git checkout -b feat/short-description
   ```

   Prefixes: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`.

2. Make the change.
3. Run the production build:

   ```powershell
   npm.cmd run build
   ```

4. Open a pull request using the repository template.
5. Keep the PR focused. Unrelated refactors belong in a separate PR.

## Code conventions

- Match the existing page-level inline style patterns. `src/index.css` is only a font import and base reset, so keep new page styles local to the component.
- Reuse shared helpers from `src/lib/` and keep brand/contact values in `src/lib/site.js`.
- Keep brand/contact values in `src/lib/site.js`.
- Follow the existing file and component naming (PascalCase pages/components, camelCase helpers).
- Prefer accessible markup: labels on inputs, button text, focus states, meaningful link text.
- Test at desktop and narrow (≈400px) widths.

## Database changes

- Put schema changes in a new SQL file under `supabase/`; do not edit production data by hand without a migration path.
- Keep RLS enabled on new tables and add explicit policies.
- Never trust client-side role checks for authorization. Enforce it in policies or triggers.
- Employer activation fields must remain admin/`service_role` only.
- Job updates from employers must not be able to change `status`, `is_featured`, `employer_id` or credits.

## Payments

- Razorpay amounts are read from the `plans` table on the server, never from the browser.
- Signature verification is mandatory.
- Do not log keys, signatures or full payment payloads.
- Test with Razorpay test cards before asking for a review.

## Commit messages

Use short, imperative subjects:

```text
Add employer credit badge on dashboard
Fix admin job approval message
Document Razorpay deployment
```

Add a body when the reason is not obvious.

## Pull request checklist

- [ ] Build passes (`npm run build`)
- [ ] No secrets or `.env` files added
- [ ] Responsive at desktop and mobile widths
- [ ] RLS/permissions reviewed for data changes
- [ ] Payment logic tested with test keys (if applicable)
- [ ] Screenshots included for visual changes

## Reporting security issues

Do **not** open a public issue for a vulnerability. Follow [SECURITY.md](SECURITY.md).
