# TenderSaathi (Gem Portal)

> **Next.js-based tender support workflow application** for Indian MSMEs and vendors using the Government e-Marketplace (GeM). Provides consultancy services for GeM registration, tender support, training, and document management with a WhatsApp-first communication approach.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)

---

## 🚀 Features

- **🔐 Authentication**: Email/password + Google OAuth with role-based access (user/agent)
- **📋 Case Management**: Complete workflow from submission to completion with 12-state progression
- **💬 WhatsApp Integration**: All communication and document exchange via WhatsApp
- **💳 Payment System**: Fixed ₹799 INR payment with UPI QR code and manual verification
- **🌐 Multi-language**: English and Hindi with Devanagari font support
- **🎨 Theme System**: Light/dark mode with system preference detection
- **📊 Analytics**: Vercel Analytics integration
- **🔒 Security**: Row-level security (RLS) with Supabase

---

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** — OS-specific setup for macOS, Windows, Linux, WSL2
- **[Product Overview](./docs/PRODUCT.md)** — What's built, routes, data model, features
- **[UI Specification](./docs/UI.md)** — Design system, i18n, theme, animations
- **[Build Guide](./docs/BUILD-FIRST.md)** — Build-first approach and deployment checklist
- **[Project Plan](./docs/PLAN.md)** — Roadmap and deployment strategy

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2.4 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19.2.4 |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Supabase (Auth + Postgres + RLS) |
| **Theme** | @teispace/next-themes |
| **Animation** | Framer Motion 12.38.0 |
| **Validation** | Zod 4.4.1 |
| **Analytics** | Vercel Analytics |
| **Testing** | Playwright (E2E) |

---

## 🏃 Quick Start

### Prerequisites

- Node.js 20.x or 22.x (LTS)
- npm (or pnpm/yarn)
- Supabase account (or local Supabase CLI)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd TenderSaathi

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# TS_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
# TS_SUPABASE_ANON_KEY=YOUR-PUBLIC-ANON-KEY
```

### Database Setup

Run migrations in order from `supabase/migrations/`:

1. `0001_init.sql` — Core schema (profiles, agents, cases, payments)
2. `0002_seed_helpers.sql` — Helper functions and agent seeding
3. `0003_oauth_profile.sql` — OAuth profile mapping

Apply via Supabase Dashboard (SQL Editor) or Supabase CLI.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

---

## 📁 Project Structure

```
TenderSaathi/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── agent/             # Agent dashboard
│   ├── cases/             # Case management
│   ├── dashboard/         # User dashboard
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities, types, Supabase client
├── locales/              # i18n dictionaries (en, hi)
├── supabase/             # Database migrations
├── docs/                 # Documentation
├── e2e/                  # Playwright tests
└── public/               # Static assets
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TS_SUPABASE_URL` | Supabase project URL | ✅ |
| `TS_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `TS_AGENT_WHATSAPP_NUMBER` | Agent WhatsApp (E.164) | ✅ |
| `TS_PAYMENT_AMOUNT` | Payment amount in INR | ⚠️ |
| `TS_PAYMENT_QR_IMAGE_PATH` | UPI QR image path | ⚠️ |


---

## 🗺️ Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with hero, services, FAQ |
| `/login` | Public | Email/password + Google sign-in |
| `/signup` | Public | User registration |
| `/auth/callback` | Public | OAuth callback handler |
| `/dashboard` | User | Case list + create new case |
| `/cases/new` | User | Create case form |
| `/cases/[id]` | User/Agent | Case detail with timeline, documents, payment |
| `/agent` | Agent | Agent queue (queue/active/closed) |
| `/api/locale` | Public | Locale cookie setter |

---

## 📊 Database Schema

### Tables

- **`profiles`** — User profiles with role, name, phone, business, locale
- **`agents`** — Agent info with WhatsApp E.164 number
- **`cases`** — Case records with status, documents (JSONB), notes
- **`payments`** — Payment records with verification status

### Case Status Flow

```
submitted → agent_assigned → whatsapp_active → documents_requested 
→ documents_under_review → documents_approved → awaiting_payment 
→ payment_pending_verification → in_progress → completed
```

Plus: `rejected`, `on_hold`

---

## 🧪 Testing

```bash
# Install Playwright browsers
npm run test:e2e:install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 3002 |
| `npm run dev:3000` | Dev server on port 3000 |
| `npm run dev:3001` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run tests with UI |
| `npm run test:e2e:install` | Install Playwright browsers |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Set all `NEXT_PUBLIC_*` variables
- Configure Supabase redirect URLs:
  - `https://YOUR_DOMAIN/auth/callback`
- Replace `public/upi-qr.svg` with real UPI QR
- Add Privacy Policy and Terms of Service

---

## 🔒 Security

- Row-level security (RLS) policies on all tables
- Role-based access control (user/agent)
- Secure session management with Supabase Auth
- Environment variables for sensitive data
- HTTPS-only in production

---

## 🌐 Internationalization

- **Languages**: English (en), Hindi (hi)
- **Font**: Noto Sans Devanagari for Hindi
- **Storage**: Cookie-based locale persistence
- **Dictionaries**: JSON files in `locales/` folder

---

## 🎨 Theme

- Light/dark mode with system preference
- Semantic CSS variables
- `prefers-reduced-motion` support
- Persistent theme selection via `@teispace/next-themes`

---

## 📝 License

Private project. All rights reserved.

---

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.

---

## 📞 Support

For issues or questions:
- Check [docs/SETUP.md](./docs/SETUP.md) for setup help
- Review [docs/PRODUCT.md](./docs/PRODUCT.md) for feature details
- Contact: [Your contact information]

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)

---

**Made with ❤️ for Indian MSMEs and GeM vendors**
