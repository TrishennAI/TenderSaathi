# Gem Portal — Project plan

This document describes goals, scope, technical choices, and rollout steps for the marketing site in this repo (BizHelp-style GeM consultancy landing page, built with Next.js).

---

## 1. Purpose

- **Product:** A professional, fast-loading marketing site for GeM-related services (registration, consultancy, tenders, training).
- **Audience:** Indian MSMEs and vendors exploring or using Government e-Marketplace (GeM).
- **Success:** Clear positioning, strong CTAs (WhatsApp / phone), credible structure (services, social proof, FAQ), and a path to real hosting when ready.

---

## 2. Current state (baseline)

| Area | Status |
|------|--------|
| Stack | Next.js (App Router), React, TypeScript, Tailwind CSS v4 |
| Homepage | Single-page layout: header, hero, metrics, services, why us, testimonials, anchor sections (training / pricing / tools / tenders), FAQ, CTA, footer |
| Build | `npm run build` and `npm run lint` pass |
| Hosting | Not deployed; intended for Vercel later |
| Legal / branding | Demo clone structure; replace copy, guarantees, and branding before production |

---

## 3. Goals and non-goals

### Goals

- Ship a **deployable** static/SSR-friendly marketing site with excellent mobile layout.
- **Own the content**: final headlines, guarantees, testimonials, and contact details aligned with your business and legal review.
- **Vercel production** with custom domain when you are ready.
- Optional: **analytics** (e.g. Vercel Analytics or privacy-conscious alternative) after launch.

### Non-goals (initially)

- Full GeM portal integration or authenticated seller dashboards (separate product surface).
- Backend CRM or payment capture on this repo unless explicitly scoped later.

---

## 4. Technical decisions (locked for v1)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js | First-class on Vercel; SEO and routing when you add real pages |
| Language | TypeScript | Safer refactors as the site grows |
| Styling | Tailwind CSS v4 | Rapid UI iteration, consistent design tokens |
| Package location | `gem-portal/` | npm naming; Vercel root directory = `gem-portal` if repo root is `GemPortal` |

---

## 5. Phased roadmap

### Phase A — Local polish (now)

- [ ] Replace placeholder / clone-sensitive copy with **your** brand name, value props, and accurate service list.
- [ ] Wire **real** phone, WhatsApp, email, and address in header, hero, CTA, footer.
- [ ] Add **favicon** and Open Graph metadata (`layout.tsx` / `metadata`) for link previews.
- [ ] Add real **Privacy**, **Terms**, and **Refund** pages (even stub + “contact us” is better than `#` links).

### Phase B — Pre-launch

- [ ] **Commercial hosting plan**: use a Vercel plan that matches commercial use (e.g. Pro when required by [Vercel plan terms](https://vercel.com/docs/pricing)); do not rely on Hobby for long-term commercial production if terms disallow it.
- [ ] Connect **Git** repo and import project with root **`gem-portal`** on Vercel.
- [ ] Environment: document any `NEXT_PUBLIC_*` vars if you add forms or APIs later.
- [ ] **SEO**: unique `title` / `description` per route; sensible heading hierarchy (already mostly OK on home).

### Phase C — Real routes (optional next)

- [ ] Split **Training**, **Pricing**, **Tools** into real routes (`/training`, `/pricing`, …) instead of in-page anchors only.
- [ ] **Blog** or resources section if content marketing is part of strategy.
- [ ] **Contact form** (Server Action + email provider or third-party) if you want leads without WhatsApp-only.

### Phase D — Demos without production hosting

- [ ] For **one-off previews**, run `npm run dev` and a **Cloudflare quick tunnel**: `cloudflared tunnel --url http://localhost:<port>`.
- [ ] Share the `https://*.trycloudflare.com` link; keep machine + dev server + tunnel running for the duration of the demo.
- [ ] **ngrok** remains an alternative if you prefer account-based tunnels and dashboard tooling.

---

## 6. Vercel checklist (when you host)

1. Sign up / log in at [vercel.com](https://vercel.com).
2. **Import** the Git repository.
3. Set **Root Directory** to `gem-portal` (if the monorepo root is the parent folder).
4. Framework preset: **Next.js** (auto-detected).
5. Deploy; verify production URL; add **custom domain** in project settings.
6. Enable **Preview deployments** for every PR (default on Vercel) for stakeholder review.

---

## 7. Risks and compliance

- **Intellectual property:** Do not ship competitor logos, proprietary assets, or unsubstantiated claims. All public claims (success rates, guarantees) should be **verifiable** and **legally approved**.
- **Data:** If you add forms, define retention and privacy in your policy pages.
- **Quick tunnels:** Public URLs expose your local app to anyone with the link; do not use for confidential data.

---

## 8. Maintenance

- Keep **Next.js** and dependencies reasonably up to date (`npm outdated`, periodic `npm audit`).
- Re-run **`npm run build`** after major dependency bumps.
- Revisit this plan when scope changes (e.g. adding auth, CMS, or multi-language).

---

## 9. Quick reference — commands

```bash
cd gem-portal
npm install          # after clone
npm run dev          # local development
npm run build        # production check
npm run lint         # ESLint
```

**Preview to someone (same machine must stay on):**

```bash
cloudflared tunnel --url http://localhost:3002   # match `npm run dev` port
```

---

*Project docs live under `docs/`. Edit this file and the checklists as you execute.*
