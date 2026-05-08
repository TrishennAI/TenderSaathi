# Build first, details later

Yes — **it is okay to build the app first** and provide branding, legal, contact, UPI QR, and final copy **after** the engineering skeleton is working. This doc records that agreement so expectations stay aligned.

---

## Why this works

- **Engineering** needs stable decisions: stack, data model, RLS, routes, status machine, WhatsApp handoff, payment verification flow. Those do **not** require your final logo or legal pages on day one.
- **Product/legal** assets can ship in a **second pass**: swap placeholders, turn on production keys, and publish policies when you are ready.

---

## What we use until you provide finals

| Area | During build (placeholder) |
|------|-------------------------------|
| **Brand name / logo** | Working title (e.g. “Gem Portal”) and text or simple monogram in header |
| **Marketing copy** | Existing landing structure with neutral or lorem-style sections where needed |
| **Phone / email / address** | Env-driven or obvious placeholders (`+91…`, `support@example.com`) — **not** real customers’ data |
| **Agent WhatsApp** | `NEXT_PUBLIC_AGENT_WHATSAPP` or similar env var (digits only for `wa.me`) — you fill when ready |
| **799 UPI QR** | Placeholder image in `public/` or “QR coming soon” panel until you supply the real file |
| **Auth** | Email + password and optional **Google** (OAuth) — enable Google in Supabase + Google Cloud when you want it live; see [SETUP.md](./SETUP.md#3b-google-sign-in-optional) |
| **Privacy / terms** | Stub routes or “Contact us for policy” — **must** be replaced before broad public launch |

---

## What you should provide **before real users / real money**

These are **not** required to *start* coding, but they **are** required to *go live* responsibly:

1. Final **brand** (name, logo if any, tone).
2. **Real** support/agent **WhatsApp** (E.164) and any public phone/email.
3. **Real UPI QR** image (or confirmed payment flow) for **799 INR**.
4. **Privacy policy** and **terms** (and refund/support text if you take payment).
5. **Vercel + Supabase** projects and **env vars** in production (you own the accounts).
6. **Auth** — confirm whether Google stays enabled in production and that redirect URLs match your deployed domain and port for local dev.

---

## Order of work (suggested)

1. **Build** — Schema, RLS, auth shell, user/agent dashboards, case flow, WhatsApp CTA, QR panel, status transitions, i18n/theme per [UI.md](./UI.md) as planned.
2. **Integrate** — You drop in env vars, QR asset, and copy (or we apply a PR you send).
3. **Launch checklist** — Legal pages live, analytics disclosure if enabled, commercial Vercel plan if applicable.

---

## Risk note

Building first does **not** remove legal or payment risk — it **defers** it. Do not point a **custom domain** or **paid ads** at the site until placeholders for money and privacy are resolved.

---

## Related docs

- [UI.md](./UI.md) — Visual and analytics spec (can also use placeholders until finals).
- [PLAN.md](./PLAN.md) — Marketing site and deploy checklist.
- Cursor plan `tender_support_portal_mvp` — Portal MVP scope and todos.
