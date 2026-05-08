# UI / UX specification (Gem Portal)

Companion to the product plan: how we present the portal, localize it, theme it, and learn from user behavior. **Implementation follows this doc**; nothing here requires shipping every analytics feature on day one—prioritize what unblocks a polished first impression.

---

## 1. Languages (English + Hindi)

### Goals

- **Primary:** English (`en`).
- **Secondary:** Hindi (`hi`) in **Devanagari** script (LTR—no RTL layout work).
- Copy should feel **natural in Hindi**, not machine-translated where it matters (hero, CTAs, errors); marketing/legal strings can start with professional translation review.

### Folder layout (source of strings)

Keep UI strings out of components as much as possible:

```text
locales/
  en/
    common.json      # shared: buttons, nav, errors
    marketing.json   # landing / public pages (if split)
    dashboard.json   # authenticated app
  hi/
    common.json
    marketing.json
    dashboard.json
```

Optional: `locales/en/cases.json` for case-status labels if those files grow large.

### Routing (Next.js App Router)

- Use a **dynamic `[locale]` segment** at the root of localized routes, e.g. `/en/dashboard`, `/hi/dashboard`, with **middleware** that:
  - detects `Accept-Language` / cookie / user preference,
  - redirects `/` → `/en` or `/hi` as default,
  - persists choice in a **cookie** (and optionally `profiles.preferred_locale` later).

### Library choice

- **`next-intl`** (or equivalent) is a strong default: type-safe keys, ICU messages, App Router integration, and colocation with the `locales/` tree above.

### Hindi-specific UX

- **Font stack:** load a high-quality Devanagari web font (e.g. **Noto Sans Devanagari** via `next/font/google`) so body text does not fall back to inconsistent system fonts on Android.
- **Line height / length:** Hindi copy often runs longer than English; allow **flexible layouts** and avoid fixed-width buttons that clip text.
- **Numbers and currency:** use **locale-aware formatting** (`799` display, `INR`, grouping) via `Intl.NumberFormat` per locale.

---

## 2. Light and dark theme

### Behavior

- **System default** on first visit (`prefers-color-scheme`).
- **Explicit toggle** (sun/moon) in header/settings, persisted in **`localStorage`** (and optionally synced to profile later).
- **No flash of wrong theme:** **`@teispace/next-themes`** (maintained fork compatible with `next-themes` API) plus **`suppressHydrationWarning`** on `<html>` in [`app/layout.tsx`](../app/layout.tsx). Plain **`next-themes`** 0.4.x triggers React 19 “script tag in component” warnings with Next 16; the fork avoids that.

### Implementation shape

- **CSS variables** for semantic tokens in [`app/globals.css`](../app/globals.css) (or a dedicated `theme.css`):

  - `--background`, `--foreground`, `--muted`, `--card`, `--border`, `--primary`, `--primary-foreground`, `--accent`, `--destructive`, etc.
- **Light and dark** each define a full token set; components consume **semantic names only**, never raw hex in JSX.

### Accessibility

- Verify **contrast ratios** (WCAG **AA** minimum, **AAA** where cheap) for both themes, especially **primary buttons** and **muted helper text**.

---

## 3. Color scheme (research-backed direction)

> **Note:** “Hooking” users ethically means **clarity, trust, and low cognitive load**—not dark patterns. The palette below follows common **color psychology** and **fintech / gov-adjacent** patterns used in professional services; validate with **real users** in India after launch.

### Positioning

- Product sits near **government marketplace / tender support**: users need **trust**, **calm**, and **clear next steps**—not casino-like urgency.

### Recommended palette direction

| Role | Direction | Rationale (industry pattern) |
|------|-----------|-------------------------------|
| **Primary** | Deep **teal** or **blue-green** | Associated with **trust**, **stability**, and **competence**; common in financial and professional services; aligns mentally with “official-adjacent” without impersonating government branding. |
| **Secondary / surface** | **Cool neutrals** (slate / blue-gray) | Reduces eye strain; keeps **content and status** as the hero. |
| **Accent (CTA)** | **Warm amber** or **coral** (single accent) | Draws the eye to **one primary action** per view; warmth balances cool primary (classic complementary tension used in dashboards). |
| **Success / positive state** | Restrained **emerald** | “Approved / paid / complete”—avoid neon green that feels gamified. |
| **Warning / attention** | **Amber** (distinct from CTA if both used—separate hue or saturation) | “Action needed” without panic red. |
| **Error / destructive** | **Accessible red** | Clear failures; do not use red for marketing CTAs. |

### What to avoid

- **Over-saturation** and rainbow gradients (read as cheap or distracting).
- **Palette that mimics** official GeM or government portals **logos/colors** too closely—legal and trust risk; stay **distinctly “partner”** not “impersonator.”
- **Low-contrast** teal-on-teal or gray-on-gray for body copy (hurts **older users** and **sunlight mobile**).

### Deliverable before build

- Lock **8–12 semantic tokens** (not 40 hex codes) in a small **Figma or Tailwind theme extension** document, then map 1:1 to CSS variables in §2.

---

## 4. Animation and professional UI

### Principles (priority order)

1. **Clarity over spectacle** — motion explains **where attention went** (e.g. drawer opened, step completed), not decoration for its own sake.
2. **Performance** — prefer **CSS transitions** (`transform`, `opacity`) and **GPU-friendly** properties; avoid animating `width`/`height`/`top` on large trees.
3. **Respect `prefers-reduced-motion`** — provide a **reduced** or **no-motion** path (CSS media query + optional user setting).
4. **Consistency** — one **easing curve** and **duration scale** (e.g. `150ms` / `200ms` / `300ms`) across the app.

### Suggested motions

| Surface | Motion |
|---------|--------|
| **Page / layout** | Subtle **fade + slight Y** on route content (keep header stable). |
| **Lists (cases)** | **Staggered fade-in** on first paint (once per load, not on every refetch). |
| **Cards / modals** | **Scale from 0.98 + fade** or slide-up sheet on mobile. |
| **Primary CTA** | **Micro-scale on press** (`active:scale-[0.98]`) + focus ring for keyboard. |
| **Status changes** | Short **color / icon crossfade** on timeline updates. |

### Libraries (pick one stack, do not stack competitors)

- **Tailwind CSS** (already in project) for layout and transitions.
- **Framer Motion** *or* **CSS-only** for orchestrated enters—Framer is faster for staggered lists; CSS-only is fewer deps. **Choose one** for MVP consistency.

### “Professional” checklist (non-motion)

- **Typography scale** (limited sizes), **8px grid**, consistent **radius** (e.g. `lg` cards, `full` pills).
- **Empty states** and **loading skeletons** for dashboards (never a blank screen).
- **Touch targets** ≥ 44px on mobile for CTAs and nav.

---

## 5. User activity monitoring and drop-off

### Goals

- **Product analytics:** where users **land**, **convert** (signup, case created), and **abandon** (funnel steps).
- **Stability:** **Web Vitals** and errors (separate from “marketing hooks”).

### Recommended stack (MVP-friendly)

| Layer | Tool (examples) | Use for |
|-------|------------------|--------|
| **Funnels & events** | **PostHog** (self-serve), **Plausible**, or **Vercel Web Analytics** + custom events | Step completion, CTA clicks, locale switches, theme toggles. |
| **Session understanding** | **PostHog session replay** (optional, privacy-gated) | “Where did they get stuck?”—blur or mask **inputs**; **disable** or **do not record** authenticated pages that show **PII** until legal sign-off. |
| **Performance** | **Vercel Speed Insights** / **Web Vitals** | LCP, CLS—correlate drop-off with slow pages. |
| **Errors** | **Sentry** (or similar) | JS errors that cause silent abandonment. |

### Events to define (names illustrative)

Define a **single taxonomy** in code (e.g. `analytics.track('case_flow', { step, case_id_hash })`):

- `landing_view`, `locale_changed`, `theme_changed`
- `signup_started`, `signup_completed`, `login_completed`
- `case_create_started`, `case_create_submitted`, `case_create_failed`
- `whatsapp_cta_clicked` (from which step)
- `payment_qr_viewed`, `payment_verify_clicked` (agent)
- `dashboard_viewed`, `case_detail_viewed`

**Drop-off definition:** for a funnel `A → B → C`, drop-off at **B** = users who fired **A** but not **B** within a **session** or **7-day window** (configure in tool).

### Privacy and compliance (India + global baseline)

- **Privacy policy** must disclose **analytics**, **cookies**, and **replay** if used.
- Prefer **aggregated** metrics first; add **replay** only with **masking** and **retention limits**.
- **Do not** send secrets, full PAN, or payment proof images to analytics payloads.

### What ships first vs later

- **First:** Vercel Analytics (or Plausible) + **5–10 key events** + Web Vitals.
- **Later:** full funnel dashboards, session replay on safe pages, agent-specific dashboards.

---

## Implementation checklist (for devs)

**Shipped (see [PRODUCT.md](./PRODUCT.md)):**

- [x] `locales/en` + `locales/hi` via cookie + `lib/i18n` (no `[locale]` URL segment yet; §1 “routing” item remains optional).
- [x] `@teispace/next-themes` + semantic CSS variables + header theme toggle + global `prefers-reduced-motion` handling.
- [x] Semantic color tokens (light/dark) in `app/globals.css`; periodic contrast review still recommended (§3).
- [ ] Motion polish per §4 on representative mid-range Android hardware.
- [ ] Expand analytics events + privacy copy per §5 as you approach public launch.

---

## Related docs

- [PLAN.md](./PLAN.md) — product roadmap and deploy notes.
- **Cursor plan** `tender_support_portal_mvp`: the **§ Implementation checklist** below is mirrored as todos **`ui-i18n`**, **`ui-theme`**, **`ui-color-tokens`**, **`ui-motion`**, **`ui-analytics`** in the plan frontmatter—single source for execution order; this file remains the **design spec**.
