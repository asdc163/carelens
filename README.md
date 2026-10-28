# CareLens

> Bilingual family-care coordination prototype exploring image-to-structured-data with Claude.

**Prototype status:** This repository contains implemented feature paths and deterministic no-key mocks. Current provider behavior, OCR accuracy, latency, clinical correctness, and deployment availability have not been established by the portfolio review. Model confidence is not a calibrated reliability score; mock output is not an image-recognition result.

[Read the AI implementation evidence](https://github.com/asdc163/ai-builder-portfolio/blob/main/docs/ai-capability-evidence.md)

![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8)
![Prisma 7](https://img.shields.io/badge/Prisma-7-2D3748)
![Claude Sonnet 4.5](https://img.shields.io/badge/Claude-Sonnet%204.5-D97757)

![Landing page](./public/screenshots/landing.png)

---

## Screenshots

| Dashboard | Medications |
|-----------|-------------|
| ![Dashboard](./public/screenshots/dashboard.png) | ![Medications](./public/screenshots/medications.png) |
| **Vitals** | **Add medication (OCR flow)** |
| ![Vitals](./public/screenshots/vitals.png) | ![Add medication](./public/screenshots/new-med.png) |
| **Family & roles** | **Activity timeline** |
| ![Family](./public/screenshots/family.png) | ![Timeline](./public/screenshots/timeline.png) |

---

## Why CareLens

Adult children caring for aging parents face three compounding pains:

1. **Information is scattered.** Medication lists on paper, vitals in a notebook, appointments in a group chat — nobody sees the whole picture.
2. **Medical literacy is missing.** Handwritten prescriptions, confusing drug combinations, unclear side-effects.
3. **Siblings fall out of sync.** The one who lives closest sees the doctor; the one who lives abroad relies on phone calls.

These are problem hypotheses behind the prototype, not findings from a user study. The implementation explores family coordination, a Traditional Chinese interface, and optional multimodal input.

## Implemented prototype paths

- **Photo-to-structured medication data.** Point phone at a pill bottle or prescription slip → Claude Vision extracts drug name (ZH + EN), dose, frequency, warnings. The response includes a model-generated confidence label; it is not a calibrated measure of accuracy.
- **Drug interaction check with severity grading.** Every new medication is automatically cross-checked against the existing list. Severity: NONE / MILD / MODERATE / SEVERE / CRITICAL. The generated report is an unvalidated prototype output, not a clinical assessment.
- **Proactive daily insight.** The dashboard shows an AI-written summary ("血壓 128/82，比上週高，睡眠偏少可能有關") instead of making the caregiver stare at charts.
- **Family sharing with roles.** Invite siblings or professional carers as `CAREGIVER` (read + write) or `VIEWER` (read-only). The owner controls access. Activity timeline shows who did what when.
- **Vital signs with trend sparklines.** The prototype provides entry screens for vital-sign values and trend displays.
- **繁中-first UI, English toggle.** Every string translated, including AI-generated summaries. Noto Sans TC bundled so typography looks deliberate.
- **Mobile-first responsive.** Phone is the primary surface; desktop isn't an afterthought.

## Try it

### Hosted demo

No hosted-demo availability was verified in the 2026-10-28 review. The prototype includes a **"Try with demo account"** sign-in path with seeded sample data. Check provider/mock configuration and access controls before using a deployment. Demo fixtures are not model-performance evidence.

### Run locally

```bash
pnpm install
pnpm db:migrate     # creates prisma/carelens.db
pnpm db:seed        # populates demo account with realistic data
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Click **"Try with demo account"** on `/auth`.

Optional: add `ANTHROPIC_API_KEY` to `.env` to run real Claude Vision OCR and interaction analysis. Without a key, the app uses deterministic mock responses so the full UX is demoable offline.

## Architecture

- **Next.js 16** App Router, server components, server actions — no separate backend.
- **Prisma 7 + SQLite** for local use. A move to a production database requires schema, deployment, access-control, and restore validation.
- **Claude Sonnet 4.5** via Anthropic SDK for OCR (multimodal), interaction analysis, and daily insights. Model helpers request JSON and parse responses with Zod; structural parsing does not establish semantic correctness.
- **Tailwind v4 + shadcn/ui (Radix)** — warm off-white + teal palette, OKLCH color space, contrast and assistive-technology coverage require separate verification.
- **Session-based auth** — bcrypt + httpOnly cookies, Session table in DB. Stays portable across hosts (no third-party identity provider required).
- **i18n** — custom lightweight layer with typed message maps. No bundle bloat.

### Data model highlights

- `Elder` is the unit of care. `FamilyMember` is a user-elder-role join table with three roles.
- `Interaction` is an AI-generated artifact — cached so we don't re-run Claude on every page load, re-computed when meds change.
- `ActivityLog` is append-only, powering the family timeline and acting as an audit trail.
- All write paths go through server actions that re-check role via `requireElderAccess` → `canWrite`. No direct DB access from the client.

## Project structure

```
carelens/
├── prisma/
│   ├── schema.prisma       # User, Elder, Medication, Vital, Interaction, Insight, FamilyMember, ActivityLog
│   └── seed.ts             # Realistic demo household
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing (繁中-first, bilingual)
│   │   ├── auth/           # Sign-in / sign-up + demo login
│   │   ├── app/            # Authenticated app shell
│   │   │   ├── onboarding/ # First-elder wizard
│   │   │   └── elders/[elderId]/
│   │   │       ├── page.tsx           # Dashboard
│   │   │       ├── medications/       # List + OCR new flow
│   │   │       ├── vitals/            # Log + trend sparklines
│   │   │       ├── timeline/          # Activity feed
│   │   │       └── family/            # Invite + role management
│   │   ├── invite/[token]/ # Accept-invite flow
│   │   ├── actions/        # Server actions (auth, elders, meds, vitals, family)
│   │   └── api/ocr/        # Claude Vision endpoint
│   ├── components/ui/      # shadcn components
│   └── lib/
│       ├── db.ts           # Prisma + better-sqlite3 adapter
│       ├── auth.ts         # Session creation / retrieval
│       ├── claude.ts       # Anthropic SDK wrappers w/ mock fallbacks
│       ├── elders.ts       # Access control helpers
│       ├── i18n.ts         # zh-TW + en-US message maps
│       └── locale.ts       # Cookie-based locale persistence
└── docs/
    ├── PRD.md              # Product requirements, scope, risks
    ├── ARCHITECTURE.md     # Technical design, RLS, AI flows
    └── DESIGN.md           # Design tokens, IA, wireframe notes
```

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # run production build
pnpm lint         # ESLint
pnpm db:migrate   # run Prisma migrations
pnpm db:seed      # re-seed demo data
pnpm db:studio    # open Prisma Studio
```

## Production deployment notes

The current repo ships with SQLite for portability and zero-config local dev. For production on Vercel:

1. Provision a Postgres instance (Neon, Supabase, or Vercel Postgres).
2. Change `schema.prisma` datasource provider to `postgresql`.
3. Set `DATABASE_URL` in Vercel env vars.
4. Set `ANTHROPIC_API_KEY`.
5. `pnpm prisma migrate deploy` on first boot.

The rest — auth, API routes, UI — works unchanged.

## Roadmap (post-hackathon)

- Native iOS / Android wrapper (PWA install prompt shipped; native wrappers next)
- Apple Health / Google Fit ingestion for automatic vitals
- PDF monthly report for doctor visits
- Clinician-facing read-only portal with QR handoff
- Email notifications for interaction warnings
- Optional on-chain consent receipts (planned for HashKey Chain)

## Safety & disclaimer

CareLens is informational. It is **not** medical advice and does **not** replace professional clinical judgment. Every AI-generated interaction warning and insight card displays a persistent disclaimer. The app never recommends stopping a prescribed medication — it always defers to the prescribing physician.

## License

MIT — see [LICENSE](./LICENSE).

---

**Built for Chinese-speaking families.** 為華人家庭而做。
