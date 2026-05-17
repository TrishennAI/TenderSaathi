# Operations, staging, and runbook

This document captures **deployment**, **database migrations**, **human-readable case references**, **frontend quirks** (e.g. hydration), and **Vercel troubleshooting** so the team does not rely on chat history.

Repo root is **TenderSaathi** (some older docs still say `gem-portal`; use this folder for commands).

---

## Git branches and hosting

| Branch | Typical Vercel mapping | Notes |
|--------|------------------------|--------|
| `main` | **Production** | Stable releases. |
| `stg` | **Preview** (or a dedicated “staging” project/domain if configured) | Integration branch for staging. |

**Deploy staging (app code):** commit on `stg`, then `git push origin stg`. Vercel builds **Preview** deployments for that branch (unless the project is configured differently).

**Important:** The Next.js app and Supabase are separate. Pushing to Vercel **does not** run SQL migrations. Apply migrations to **each** Supabase project (local, staging, production) as needed.

---

## Supabase migrations

Migrations live in [`supabase/migrations/`](../supabase/migrations/). Apply them **in numeric order** on the target database.

### Option A — Dashboard (no CLI)

1. Supabase Dashboard → your project → **SQL Editor** → New query.
2. Paste the **full file** for the migration you need (e.g. `0006_case_reference_code.sql`).
3. Run. If the migration was partially applied before, you may need to fix objects manually or adjust the script; read Postgres errors carefully.

### Option B — Supabase CLI

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # Dashboard → Project Settings → General
supabase db push
```

`project-ref` appears in the project URL: `https://supabase.com/dashboard/project/<ref>`.

### Option C — Local Supabase only

```bash
supabase start
supabase migration up
# or: supabase db reset  (wipes local data; reapplies all migrations)
```

Local applies **hosted** staging/production only if you explicitly `link` + `db push` to that remote.

### After any migration

- Confirm in **Table Editor** that new columns exist and constraints match expectations.
- Smoke-test the app against that project’s env vars (`NEXT_PUBLIC_*_SUPABASE_*`).

---

## Human-readable case reference (`TS-000001`)

### Why

`cases.id` stays a **UUID** for URLs, foreign keys (`payments.case_id`), and RLS. WhatsApp copy and humans use a short **public reference** instead of a 36-character id.

### Database

- Migration: [`0006_case_reference_code.sql`](../supabase/migrations/0006_case_reference_code.sql).
- Column: `cases.reference_code` — `text`, **NOT NULL**, **UNIQUE**, format `TS-` + 6-digit zero-padded sequence (e.g. `TS-000042`).
- **Backfill:** existing rows get codes ordered by `created_at`, `id`.
- **New rows:** `BEFORE INSERT` trigger fills `reference_code` when null/blank using sequence `cases_reference_seq`.

### Application

- Type: [`lib/types.ts`](../lib/types.ts) — `Case` includes `reference_code: string`.
- Create case: [`app/cases/new/page.tsx`](../app/cases/new/page.tsx) — `.select("id, reference_code")`; WhatsApp template uses `*Case ref:* ${reference_code}`.
- Case detail: [`app/cases/[id]/page.tsx`](../app/cases/[id]/page.tsx) — follow-up WhatsApp message uses `caseRow.reference_code`; UI shows localized “Reference” + code.
- Lists: [`app/dashboard/page.tsx`](../app/dashboard/page.tsx), [`app/agent/page.tsx`](../app/agent/page.tsx) — cards show `reference_code` with the date.
- Helper: [`lib/cases.ts`](../lib/cases.ts) — `buildWhatsappUrl` accepts optional `referenceCode` (prefers it over `caseId` in the default message).

### Verification

1. DB: every `cases` row has a unique `reference_code`.
2. App: new case → prefilled WhatsApp text contains `TS-…`, not the UUID.
3. `/cases/[uuid]` and agent links still use **UUID** in the path (unchanged).

---

## Password recovery (Supabase Auth)

Flows use Supabase **reset password** emails and PKCE/session handling:

- [`app/forgot-password/page.tsx`](../app/forgot-password/page.tsx), [`components/ForgotPasswordForm.tsx`](../components/ForgotPasswordForm.tsx)
- [`app/auth/update-password/page.tsx`](../app/auth/update-password/page.tsx), [`components/UpdatePasswordForm.tsx`](../components/UpdatePasswordForm.tsx)
- Callback: [`app/auth/callback/route.ts`](../app/auth/callback/route.ts)

In Supabase Dashboard → **Authentication** → **URL configuration**, add redirect URLs for each environment (e.g. `https://<stg-domain>/auth/callback`, `https://<stg-domain>/auth/update-password` if required by your flow).

### Duplicate email on signup (“email sent” but nothing arrived)

With **Confirm email** enabled, GoTrue often returns **no error** for `signUp` when the address is **already registered** (anti–email-enumeration). The response can include a **user whose `identities` array is empty**, and **no** confirmation email is sent. The app must not treat that like a successful “check your inbox” flow.

[`components/SignupForm.tsx`](../components/SignupForm.tsx) treats empty `identities` as **duplicate email** and shows a localized error (`emailAlreadyRegistered`) instead of `confirmEmailSent`.

---

## Signup page: React hydration and browser extensions

### Symptom

Console / overlay: **Hydration failed** — server HTML did not match the client. Diff often shows extra attributes on `<input>` (e.g. `data-keeper-lock-id`) or custom elements such as `<keeper-lock>`.

### Cause

**Password manager extensions** (e.g. Keeper) inject DOM into form fields **before** React finishes hydrating. The server never renders those nodes or attributes, so React reports a mismatch.

### Mitigation in this repo

[`components/SignupForm.tsx`](../components/SignupForm.tsx) defers mounting the real `<form>` with inputs until after `useEffect` runs (`inputsReady`). The first paint uses a short **skeleton** (no inputs), so hydration succeeds; real fields appear immediately after.

If similar warnings appear on **login**, apply the same **defer inputs until client mount** pattern there.

Workarounds for local debugging: incognito without extensions, or disable the extension on `localhost`.

---

## Vercel: deploy stuck in “Initializing”

Normal builds for this app are on the order of **tens of seconds** once **Building** starts. If a deployment stays in **Initializing** for many minutes:

1. Open the deployment → **Logs**. See whether it is queued, cloning, or errored before build.
2. **Cancel** the deployment and **Redeploy** the same commit (clears wedged jobs).
3. Check [Vercel Status](https://www.vercel-status.com) for incidents.
4. On **Hobby**, only one build may run at a time; another project’s build can delay this one.
5. Confirm **Git** integration under Project → Settings → Git (repo connected, permissions OK).

If **Building** starts but hangs, inspect build logs for OOM, network, or env-specific failures.

---

## Environment parity checklist (staging)

- [ ] Vercel **Preview** / staging project has all required env vars (Supabase URL + anon key, WhatsApp fallback, payment flags, etc.).
- [ ] Supabase **staging** project has migrations applied through the latest file (including `0006` if using case refs).
- [ ] Supabase **Auth** redirect URLs include the staging site origin(s).
- [ ] After deploy: create a case, open WhatsApp CTA, confirm **Case ref** appears and matches the dashboard.

---

## Related docs

- [SETUP.md](./SETUP.md) — local install, env, Google OAuth, Playwright.
- [PRODUCT.md](./PRODUCT.md) — routes, data model, product behavior (update cross-refs there when the product changes).
- [BUILD-FIRST.md](./BUILD-FIRST.md) — launch vs placeholder scope.
