---
name: gem-portal-setup
description: >-
  Sets up or troubleshoots the Gem Portal Next.js app locally on macOS, Windows,
  or Linux. Covers Node, env files, Supabase env vars, migrations, dev server
  (port 3002), and Playwright. Use when the user asks to set up, install, run,
  or fix local development for Gem Portal or gem-portal.
---

# Gem Portal — local setup

## Source of truth

Read and follow **[docs/SETUP.md](../../../docs/SETUP.md)** for full OS-specific steps (copy commands, Windows vs macOS/Linux, WSL2, Playwright, troubleshooting). If the workspace root is the parent folder `GemPortal`, use **`gem-portal/docs/SETUP.md`** instead.

## Quick reference

- **Project root for commands:** repository path ending in `gem-portal` (where `package.json` lives).
- **Install:** `npm install`
- **Env:** copy `.env.example` → `.env.local` (use OS-appropriate copy command from SETUP.md); set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_AGENT_WHATSAPP_FALLBACK` (E.164) per SETUP.md.
- **Database:** apply `supabase/migrations/*.sql` in order (`0001`, `0002`, `0003_oauth_profile`, …) via Supabase Dashboard SQL or CLI (details in SETUP.md and PRODUCT.md).
- **Google sign-in:** optional; configure Supabase Auth provider + redirect URLs per [docs/SETUP.md](../../../docs/SETUP.md) § Google sign-in (or `gem-portal/docs/SETUP.md` from repo root).
- **Dev:** `npm run dev` → [http://localhost:3002](http://localhost:3002) (`npm run dev:3001` / `dev:3000` for other ports)
- **E2E:** `npm run test:e2e:install` then `npm run test:e2e` (Playwright uses port 3002 per `playwright.config.ts`).

## Agent behavior

1. Prefer **docs/SETUP.md** over guessing platform commands (`cp` vs `Copy-Item`, etc.).
2. Do not commit `.env.local` or real secrets.
3. For schema or auth behavior, use **docs/PRODUCT.md** after env is correct.
