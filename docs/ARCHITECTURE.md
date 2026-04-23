# CareLens — Technical Architecture

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | SSR for landing SEO, RSC for dashboard |
| Language | TypeScript strict | Catches integration bugs before runtime |
| Styling | Tailwind v4 + shadcn/ui | Fastest path to polished UI |
| Auth | Supabase Auth (Google OAuth + email) | Built-in, matches DB |
| Database | Supabase Postgres | RLS for multi-tenant isolation |
| ORM | Prisma | Type-safe queries |
| File storage | Supabase Storage | Pill photos |
| AI | Claude Sonnet 4.6 via Anthropic SDK | OCR + reasoning + insights in one provider |
| Deployment | Vercel | One-click from GitHub |
| i18n | next-intl | First-class App Router i18n |
| Forms | react-hook-form + zod | Boundary validation |

## Data model

```
Users (from Supabase auth.users)
  id (uuid, PK)
  email
  display_name
  locale (zh-TW | en-US)

Elders
  id (uuid, PK)
  owner_id (fk -> users)  -- whoever created the record
  name
  birthdate
  conditions (text[])
  allergies (text[])
  created_at

FamilyMembers  -- join table: who has access to which elder
  id (uuid, PK)
  elder_id (fk -> elders)
  user_id (fk -> users)
  role (enum: OWNER | CAREGIVER | VIEWER)
  invited_by (fk -> users, nullable)
  joined_at

Medications
  id (uuid, PK)
  elder_id (fk -> elders)
  name (generic + brand)
  dose (string, e.g. "5mg")
  frequency (string, e.g. "BID" or "每日兩次")
  started_on (date)
  ended_on (date, nullable)
  photo_url (nullable)
  notes
  added_by (fk -> users)
  created_at

Vitals
  id (uuid, PK)
  elder_id (fk -> elders)
  measured_at (timestamp)
  type (enum: BP_SYSTOLIC | BP_DIASTOLIC | HR | GLUCOSE | WEIGHT | SPO2)
  value (numeric)
  unit (string)
  logged_by (fk -> users)

Interactions  -- cached AI analyses, re-run when meds change
  id (uuid, PK)
  elder_id (fk -> elders)
  med_ids (uuid[])  -- the combination checked
  severity (enum: NONE | MILD | MODERATE | SEVERE | CRITICAL)
  summary (text)
  details (jsonb)
  checked_at (timestamp)

Insights  -- daily AI summaries
  id (uuid, PK)
  elder_id (fk -> elders)
  date (date)
  summary (text)
  highlights (jsonb)  -- structured cards (trend, alert, reminder)
  generated_at (timestamp)

ActivityLog  -- audit trail for family timeline
  id (uuid, PK)
  elder_id (fk -> elders)
  actor_id (fk -> users)
  action (string, e.g. "MED_ADDED", "VITALS_LOGGED")
  payload (jsonb)
  created_at
```

## Row Level Security (RLS)

**Critical: zero data leaks across families.**

Default: deny all. Add policies per table:

- `elders`: SELECT/UPDATE/DELETE → only if `user_id IN (SELECT user_id FROM family_members WHERE elder_id = elders.id)`
- `family_members`: INSERT → only if requester is `OWNER` of that elder
- `medications`, `vitals`, `interactions`, `insights`, `activity_log`: same family-membership check via `elder_id`
- `VIEWER` role: SELECT only, no INSERT/UPDATE/DELETE
- `CAREGIVER`: full read + write on `medications`/`vitals`, no `family_members` changes
- `OWNER`: full access including deletion and invites

Test plan: create two accounts in different browser profiles, try to access each other's elder by UUID. Must 403.

## AI flows

### Flow A: Pill bottle OCR

```
User uploads photo →
Supabase Storage (signed URL) →
POST /api/ocr { photoUrl, elderId }
  → Claude messages API with image + structured prompt:
    "You are extracting medication info from a pill bottle photo.
     Return JSON: { name, name_zh, dose, frequency, quantity, warnings[] }.
     If handwritten, flag with confidence: low. Never hallucinate."
  → Validate with zod schema
  → Return to client for user review
User confirms → POST /api/medications (with confirmed fields)
```

### Flow B: Drug interaction check

```
Trigger: after any medication INSERT/UPDATE/DELETE on an elder →
POST /api/interactions/check { elderId }
  → Fetch all active medications for elder
  → Claude prompt:
    "Given this list of meds, identify interactions.
     Severity: NONE/MILD/MODERATE/SEVERE/CRITICAL.
     Return JSON per interaction pair."
  → Cache result in Interactions table
  → If severity >= MODERATE, push realtime notification to family via Supabase Realtime
```

### Flow C: Daily insight

```
Cron (Vercel daily at 20:00 local time per elder timezone) →
For each elder with data in last 7 days:
  → Fetch recent vitals, meds, activities
  → Claude prompt:
    "Summarize this week's health state in 繁中 and English.
     Be concise. Flag trends, not single readings.
     Include: summary, top 3 highlights, any concerns."
  → Write to Insights table
  → Render on dashboard
```

## Security

- Supabase Auth with Google OAuth + email/password
- JWT verified on every API route via `supabase.auth.getUser()`
- RLS enforced at DB layer (defense in depth)
- No API keys in client — all Claude calls server-side
- Photos stored with signed URLs (24h expiry on read)
- CSP header: script-src self + Vercel, no inline
- Rate limit: 20 OCR calls / hour / user
- Medical disclaimer banner persistent on every interaction/insight card

## Internationalization

- Default locale: `zh-TW`
- Also supported: `en-US`
- Locale stored on user profile, persisted across sessions
- All strings live in `/messages/zh-TW.json` + `/messages/en-US.json`
- Format numbers, dates via `Intl.*` APIs
- AI outputs: ask Claude for both languages, store both, render based on user locale

## Observability (minimal but real)

- Vercel Logs for API errors
- Claude API call logged: tokens in/out, duration, model, cost
- Supabase query logs for slow queries
- Client error boundary → reports to `/api/client-error` (no Sentry to keep scope tight)

## Performance budgets

- Landing page LCP < 2.0s on 4G
- Dashboard TTI < 3.0s
- OCR round-trip < 5s (photo upload + Claude call + response)
- Lighthouse: perf 90+, a11y 95+, best-practices 95+, SEO 90+

## Deployment & environments

- GitHub repo: `asdc163/carelens`
- Vercel project linked to repo
- Supabase project: carelens-prod
- Env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only)
  - `ANTHROPIC_API_KEY` (server only)
  - `DATABASE_URL` (Prisma, server only)
- Preview deploys on every PR

## Out of scope explicitly

- Microservices — monolith Next.js is enough
- GraphQL — REST via route handlers + RSC suffice
- Redis / caching layer — Supabase is fast enough at MVP scale
- Queue system — Vercel Cron + synchronous endpoints are fine
- ML pipelines — Claude API is the "model layer"
