# Gem Portal — Product implementation snapshot

This file records what is **actually built** in the repo (vs. the architecture plan and UI spec).

---

## Stack

- **Next.js (App Router)** + **TypeScript** + **Tailwind CSS v4**.
- **Supabase**: Auth + Postgres + RLS. **No Storage**, **no Realtime**, **no in-app chat** in MVP.
- **Vercel Analytics** wired (`@vercel/analytics/react`).
- **`@teispace/next-themes`** for light/dark (React 19–safe fork of `next-themes`; avoids inline-`<script>` dev errors with Next 16).
- Lightweight i18n via JSON dictionaries under [`locales/`](../locales) (no `next-intl`).

---

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/` | Public | Product landing with hero + 3-step explainer |
| `/login` | Public | Email + password and **Continue with Google** |
| `/signup` | Public | Email + password signup with name/phone/business; **Continue with Google** |
| `/auth/callback` | Public | OAuth PKCE callback (`exchangeCodeForSession`); not linked in the UI |
| `/dashboard` | User | Lists cases + “New case” CTA |
| `/cases/new` | User | Create case (title + summary) |
| `/cases/[id]` | User and agent | Case detail: WhatsApp CTA, document checklist, payment QR, timeline. Agent sees `AgentCaseControls`. |
| `/agent` | Agent only | Queue / active / closed segmented view |
| `/api/locale` | Public | Sets locale cookie |

[`middleware.ts`](../middleware.ts) protects `/dashboard`, `/cases`, `/agent` and redirects by `profiles.role`.

---

## Data model

SQL: [`0001_init.sql`](../supabase/migrations/0001_init.sql), [`0002_seed_helpers.sql`](../supabase/migrations/0002_seed_helpers.sql), [`0003_oauth_profile.sql`](../supabase/migrations/0003_oauth_profile.sql) (OAuth profile mapping for `handle_new_user`).

- `profiles(id, role, full_name, phone, business_name, preferred_locale, ...)` — bootstrapped from auth.users by trigger.
- `agents(id, user_id, display_name, whatsapp_phone_e164, is_active)` — **single active row** in MVP.
- `cases(id, user_id, agent_id, status, title, summary, document_requirements jsonb, agent_notes, final_notes, amount_inr default 799)` with Postgres `case_status` enum.
- `payments(id, case_id unique, amount_inr, status, verified_by, verified_at, rejection_reason)` with Postgres `payment_status` enum.

Triggers:

- `handle_new_user` → inserts a profile on `auth.users` insert (email signup metadata plus OAuth: maps `full_name` / `name`, optional `phone` / `business_name`; only promotes to `role = agent` when metadata explicitly says `agent`).
- `assign_default_agent` → fills `agent_id` on case insert with the single active agent and bumps status to `agent_assigned`.
- `ensure_payment_for_case` → inserts a `payments` row when status transitions to `awaiting_payment`.
- `set_updated_at` → keeps `updated_at` columns fresh.

RLS:

- Users see/insert their own cases; cannot update.
- Agent reads everything and updates cases + payments.
- Profiles: self or agent reads; self updates.
- Agents table: any authenticated user reads (so the WhatsApp link can be built).

---

## Auth

- **Email + password** via Supabase Auth on `/login` and `/signup`.
- **Google** via `signInWithOAuth` → Supabase → redirect to `/auth/callback` → session cookies, then redirect to `/dashboard` (or `next` query param). Configure the provider and redirect allowlist in Supabase; see [SETUP.md § Google sign-in](./SETUP.md#3b-google-sign-in-optional).
- Profile is created via the `handle_new_user` trigger from `raw_user_meta_data` (email `signUp` options and Google user metadata).
- Agent profile must still be **manually flipped** to `role = 'agent'` and a row inserted into `agents` (see [`0002_seed_helpers.sql`](../supabase/migrations/0002_seed_helpers.sql)); Google (or any) sign-in does **not** auto-grant agent.

---

## WhatsApp

- All conversation, documents, and payment screenshots are sent over WhatsApp.
- Case detail shows an **Open WhatsApp** CTA built from `agents.whatsapp_phone_e164` (or `NEXT_PUBLIC_AGENT_WHATSAPP_FALLBACK` if no agent yet) with a prefilled message that includes case title and id.

---

## Documents (logical only)

- `cases.document_requirements` is a JSONB array of `{ id, label, done }`.
- Agents edit the checklist inline on the case page; users see read-only state.
- Status transitions through `documents_requested → documents_under_review → documents_approved` are agent-driven.

---

## Payment (799 INR)

- Static QR file at [`public/upi-qr.svg`](../public/upi-qr.svg) (placeholder; replace with real merchant QR).
- Amount, QR path, and currency display are env-driven (`NEXT_PUBLIC_PAYMENT_AMOUNT_INR`, `NEXT_PUBLIC_PAYMENT_QR_PATH`).
- Payment row is auto-created when case enters `awaiting_payment`.
- User pays off-app; sends screenshot via WhatsApp; **agent** marks payment `verified` from `AgentCaseControls`. The same action advances `cases.status` to `in_progress`.

---

## i18n

- Dictionaries in [`locales/en/`](../locales/en) and [`locales/hi/`](../locales/hi) (`common`, `dashboard`, `auth`).
- `lib/i18n.ts` reads cookie / Accept-Language and returns the right dictionary.
- Header shows a **language switcher** that posts to `/api/locale` and refreshes.
- **Devanagari** font (Noto Sans Devanagari) loaded in [`app/layout.tsx`](../app/layout.tsx).

---

## Theme

- `@teispace/next-themes` (`ThemeProvider` in [`components/Providers.tsx`](../components/Providers.tsx)) with system default.
- Toggle in `AppHeader` via `useTheme`.
- Semantic CSS variables for light/dark in [`app/globals.css`](../app/globals.css).
- `prefers-reduced-motion` honored globally.

---

## Analytics

- Vercel Analytics is mounted in the root layout. Custom event taxonomy from [`UI.md`](./UI.md) can be wired with `import { track } from "@vercel/analytics"` per page when you choose what to instrument.

---

## What still needs you (per [`BUILD-FIRST.md`](./BUILD-FIRST.md))

1. **Supabase project** — create one, paste keys into Vercel env vars (and `.env.local` for development).
2. **Run** migrations in order: [`0001_init.sql`](../supabase/migrations/0001_init.sql), [`0002_seed_helpers.sql`](../supabase/migrations/0002_seed_helpers.sql), [`0003_oauth_profile.sql`](../supabase/migrations/0003_oauth_profile.sql).
3. **Create the agent user** in Supabase Auth, flip `profiles.role = 'agent'` for that user, and insert a row into `agents` (helpers in [`0002_seed_helpers.sql`](../supabase/migrations/0002_seed_helpers.sql)).
4. **Replace** `public/upi-qr.svg` with the real UPI QR (PNG/JPG/SVG; update `NEXT_PUBLIC_PAYMENT_QR_PATH` if you change the filename).
5. **Set** `NEXT_PUBLIC_AGENT_WHATSAPP_FALLBACK` (E.164) for the case where the agent row isn’t seeded yet.
6. **Brand / legal** — replace landing copy and add real Privacy / Terms before public launch.

---

## Local commands

```bash
cd gem-portal
cp .env.example .env.local   # then fill keys
npm install
npm run dev                  # http://localhost:3002 (default port in package.json)
                             # npm run dev:3000 — use port 3000 instead
npm run build                # production check
npm run lint                 # ESLint
```
