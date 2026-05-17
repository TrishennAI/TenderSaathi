# Gem Portal — local setup by OS

The app lives in the `gem-portal` directory. Open a terminal there for all commands unless noted.

**Stack:** Next.js (App Router), TypeScript, Tailwind v4, Supabase (Auth + Postgres), **`@teispace/next-themes`** for light/dark (React 19–friendly). Dev server uses **port 3002** (`npm run dev`; use `npm run dev:3001` or `dev:3000` if needed).

---

## Prerequisites (all platforms)

1. **Git** — clone the repo.
2. **Node.js** — use a current **LTS** (20.x or 22.x). Next.js 16 works well on these; avoid unmaintained majors.
3. **npm** — ships with Node; `pnpm` / `yarn` work if you prefer, but examples below use `npm`.

Optional:

- **Supabase account** — for hosted Auth/DB, or run Supabase locally with the [Supabase CLI](https://supabase.com/docs/guides/cli).
- **Playwright** — only if you run E2E tests (`npm run test:e2e`).

---

## 1. Clone and install

```bash
cd gem-portal
npm install
```

---

## 2. Environment variables

Copy the example env file into a local file Next.js loads automatically:

| OS | Command |
|----|---------|
| **macOS / Linux** | `cp .env.example .env.local` |
| **Windows (PowerShell)** | `Copy-Item .env.example .env.local` |
| **Windows (Command Prompt)** | `copy .env.example .env.local` |

Edit `.env.local` and set at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Values come from your Supabase project: **Project Settings → API**. Other keys in `.env.example` have sensible defaults for local dev.

Set **`NEXT_PUBLIC_AGENT_WHATSAPP_FALLBACK`** to your support WhatsApp in **E.164** (e.g. `+919876543210`) so the case page **Open WhatsApp** link works before an **`agents`** row exists; production should also set **`agents.whatsapp_phone_e164`** for the seeded agent.

**Line endings:** Prefer LF for `.env.local` if an editor offers a choice; mixed endings rarely break Next.js, but consistency avoids odd parse issues.

---

## 3. Database schema (Supabase)

Migrations are under `supabase/migrations/`. Apply them to your Supabase project (hosted or local):

- **Supabase Dashboard:** SQL Editor → run each file **in numeric order** (`0001_…` through the latest).
- **Supabase CLI:** from the repo root, follow [local development](https://supabase.com/docs/guides/cli/local-development) or `supabase link` + `supabase db push` (see [OPERATIONS.md](./OPERATIONS.md) for details and staging/production notes).

See [PRODUCT.md](./PRODUCT.md) for roles, RLS, and agent seeding notes.

---

## 3b. Google sign-in (optional)

The app supports **Google OAuth** alongside email + password. Nothing extra is required in `.env.local` beyond the Supabase URL and anon key; configuration lives in **Supabase** and **Google Cloud**.

1. **Google Cloud Console** — Create an OAuth 2.0 **Web application** client. Add Supabase’s redirect URI (shown in Supabase when you enable the Google provider), usually `https://<project-ref>.supabase.co/auth/v1/callback`.
2. **Supabase Dashboard** → **Authentication** → **Providers** → **Google** — Paste the client ID and secret.
3. **Supabase Dashboard** → **Authentication** → **URL configuration** — Under **Redirect URLs**, add every URL your Next app uses to complete OAuth (PKCE exchange), **including port**:
   - Local: `http://localhost:3002/auth/callback` (or `3000` / `3001` if you use those scripts).
   - Production: `https://<your-production-domain>/auth/callback`

The Next.js route handler is [`app/auth/callback/route.ts`](../app/auth/callback/route.ts). If sign-in fails after returning from Google, the app redirects to `/login?error=oauth` or `/signup?error=oauth` with a short message.

---

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002). Use `npm run dev:3001` or `npm run dev:3000` for other ports.

---

## Platform-specific notes

### macOS

- Install Node via [nodejs.org](https://nodejs.org/), [nvm](https://github.com/nvm-sh/nvm), or [fnm](https://github.com/Schniz/fnm).
- If `npm install` fails on native addons, ensure Xcode Command Line Tools: `xcode-select --install`.
- **Apple Silicon:** use native arm64 Node builds; no Rosetta required for this stack.

### Windows

- Install Node from [nodejs.org](https://nodejs.org/) (LTS) or use [nvm-windows](https://github.com/coreybutler/nvm-windows).
- Use **PowerShell** or **Windows Terminal** for the copy commands above; avoid mixing `cp` unless you use Git Bash or WSL.
- **Long paths:** If installs fail with path-length errors, enable long paths in Windows or keep the repo in a short path (e.g. `C:\dev\GemPortal`).
- **Git and line endings:** The repo should use `.gitattributes` if you add one; otherwise set `git config core.autocrlf true` (typical on Windows) so shell scripts in other tools are not broken when checked out.
- **Playwright:** First time E2E: `npm run test:e2e:install` then `npm run test:e2e`. Chromium downloads into `.pw-browsers` per `package.json`. Corporate proxies may need `HTTPS_PROXY` set.
- **Windows Defender:** First `next dev` can be slower while files are scanned; a dev-folder exclusion is optional.
- **WSL2:** Treat as **Linux** inside WSL: use `cp`, run `npm install` and `npm run dev` from the Linux filesystem (`~/...`) for best file-watch performance; access the app at `http://localhost:3002` from Windows browser.

### Linux

- Install Node from your distro, [nvm](https://github.com/nvm-sh/nvm), or [NodeSource](https://github.com/nodesource/distributions) if you need a specific major.
- If file watchers hit limits during `next dev`, raise `fs.inotify` limits (common on Debian/Ubuntu).

---

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright E2E (starts dev server via config) |
| `npm run test:e2e:install` | Install Playwright Chromium to `.pw-browsers` |

---

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| Auth or DB errors | Confirm `.env.local` URLs/keys and that migrations ran. |
| Google OAuth redirect mismatch | Supabase **Redirect URLs** must include `http://localhost:<port>/auth/callback` for the port you actually use, plus production `https://…/auth/callback`. |
| Port in use | Stop the other process or use `npm run dev:3000` / change port in `package.json`. |
| `EACCES` on global npm | Avoid global installs; use a Node version manager or fix npm prefix per Node docs. |
| Playwright cannot launch browser | Re-run `npm run test:e2e:install`; on Linux install OS deps from [Playwright docs](https://playwright.dev/docs/ci#linux). |

For product behavior and routes, see [PRODUCT.md](./PRODUCT.md). For UI and i18n, see [UI.md](./UI.md).
