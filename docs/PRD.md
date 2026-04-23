# CareLens — Product Requirements Document

**Last updated:** 2026-04-23
**Status:** Draft v1.0 — MVP scope locked
**Owner:** Tommy

---

## 1. One-liner

CareLens is a bilingual (繁中 / English) AI caregiving copilot that lets adult children manage their aging parents' health — medications, vitals, appointments — from a shared family dashboard. Snap a photo of a pill bottle, CareLens reads it, checks for dangerous drug interactions, and warns the whole family if something looks off.

## 2. Problem

Adult children caring for aging parents face three compounding pains:

1. **Information is scattered.** Medication lists live on paper, vitals live in a BP cuff, appointments live in someone's head. Nothing is unified.
2. **Nobody has the medical literacy.** Family members can't read handwritten prescriptions, don't know which drug combos are dangerous, and can't spot trends in vitals.
3. **Coordination across siblings breaks down.** Mom lives with the eldest daughter, but the doctor visit is done by the youngest son. They don't sync. Things get missed.

Existing tools are either (a) marketplace apps for hiring caregivers (CareLinx, Honor), (b) simple reminder apps for a single person (Medisafe), or (c) enterprise EHR for clinicians. **Nothing exists that treats the family as the unit of care, uses multimodal AI to remove the literacy barrier, and is designed for Traditional Chinese–speaking households.**

## 3. Target user

**Primary persona — "Sandwich-generation daughter"**
- Female, 35-50, urban Taiwan / Hong Kong / Singapore / overseas Chinese
- Works full-time, has kids, lives near (not with) an aging parent
- Reads Traditional Chinese natively, may read English
- Phone-first, not tech-averse but not a power user
- Already uses LINE / WhatsApp to coordinate with siblings about parents

**Secondary persona — "Adult son coordinating remotely"**
- 30-55, lives in different city or country from the parent
- Relies on sibling for day-to-day, wants visibility

**Anti-persona (not targeted in MVP):**
- The elder themselves (not tech-fluent in target demographic)
- Professional caregivers / nurses (different workflow, different tool)
- Clinicians / doctors (use EHR, not this)

## 4. Jobs to be done

When I get a worried call from my parent or sibling, I want **a single place that shows everything about Mom's health right now**, so I can tell whether this is normal or needs a doctor.

When Mom gets a new prescription, I want **to know immediately whether it's safe with her other meds**, so I don't have to wait until the next doctor visit to ask.

When my sibling does the grocery run or hospital visit, I want **them to log what happened in one tap**, so I'm not calling them to ask.

## 5. MVP scope (what ships in v1)

### In scope

| # | Feature | Why |
|---|---------|-----|
| F1 | Email + Google OAuth login via Supabase | Table stakes |
| F2 | Elder profile (name, birthdate, conditions, allergies) | Core entity |
| F3 | Family invite + role (Owner / Caregiver / Viewer) | Coordination is the differentiator |
| F4 | Medication list (add via photo OR manual) | Core entity |
| F5 | **Pill bottle photo → Claude Vision OCR** (drug name, dose, frequency) | Killer demo, removes literacy barrier |
| F6 | **Drug interaction check** (AI-powered, severity-graded) | Killer demo, prevents harm |
| F7 | Vitals log (BP, HR, blood glucose, weight) — manual entry | Trend data |
| F8 | **AI daily summary** — "今天血壓偏高，可能是..." | Differentiator vs. passive trackers |
| F9 | Timeline / activity feed (who did what when) | Coordination |
| F10 | Bilingual UI (繁中 default, English toggle) | Underserved market |
| F11 | Mobile-first responsive web (PWA-ready) | Phone is primary surface |
| F12 | Marketing landing page with screenshots | Needed for hackathon submissions |

### Out of scope (v1)

- Native iOS / Android apps (responsive PWA covers it)
- Payment / subscription (free for hackathon phase)
- Apple Health / Google Fit integration
- Wearable integration
- Clinician-facing portal
- Teleconsult booking
- Blockchain / on-chain anything (no user value at MVP stage)
- AI chatbot (focus on proactive insights, not reactive Q&A)
- Document vault (medical records PDF upload) — v2

## 6. Success metrics (for hackathon judging)

- **Perceived polish**: lighthouse scores >90 across perf/a11y/best-practices
- **Depth**: OCR-to-interaction-check flow works end-to-end on real pill photos
- **Coverage**: 繁中 + English both fully translated, no missing strings
- **Reliability**: 0 JS errors in the happy path on production URL
- **Storytelling**: landing page clearly communicates problem → solution → differentiator in <30s

## 7. User journey — happy path (critical demo flow)

1. User lands on marketing page → clicks "試用 CareLens 試算" / "Try CareLens"
2. Sign in with Google → first-run: "為誰服務 / Who are you caring for?" wizard
3. Enter elder name, birthdate, 1-2 conditions
4. Empty dashboard → prominent CTA: "新增第一個藥物 / Add first medication"
5. Opens camera / file picker → snaps photo of pill bottle
6. Loading state (~3s) → Claude Vision extracts: name, dose, frequency, quantity
7. Review card with extracted fields pre-filled → user confirms or edits
8. **Auto-check interaction** against existing meds → if severity ≥ MODERATE, banner pops: "⚠️ 警告：此藥物與 ___ 併用可能導致 ___"
9. Save → returns to dashboard, now shows 1 med
10. "邀請家人 / Invite family" sidebar item → enter email, picks role → sent
11. Daily vitals card shows empty state: "記錄今天血壓 / Log today's BP"
12. User enters values → after 2+ days of data, AI summary card appears: "這週血壓趨勢平穩"

## 8. Design principles

- **Every screen has a named empty state** — no generic "no data"
- **Mobile-first**, but desktop must also look deliberate (not stretched)
- **One primary action per screen** — clear CTA, no decision paralysis
- **Errors are specific and actionable** — "無法辨識藥名，請重拍或手動輸入" not "Error 500"
- **Reading age < grade 9** in both languages — this is not a clinician tool
- **Large tap targets (≥44px)**, high-contrast text — respects that users' parents may see the screen too

## 9. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Claude Vision OCR misreads Chinese drug names | Always show extracted result for user to edit before save; log miss rate |
| Drug interaction advice is wrong → patient harm | Big disclaimer: "本工具僅供參考，不取代醫師專業判斷" on every interaction warning |
| Scope creep in 12 hours | Feature list is frozen above; anything not in "In scope" table is v2 |
| Supabase RLS bug exposes other families' data | Write RLS policies day 1, test with two accounts before shipping |
| Landing page looks generic → hackathon judges don't take product seriously | Budget 1.5 hours on landing, use real screenshots not Figma mockups |

## 10. Why this is the right product for the hackathon circuit

Pitches cleanly into multiple hackathon tracks **without substantive rewriting**:

| Track / hackathon | Angle |
|-------------------|-------|
| Healthcare AI (Agents Assemble, $25K) | Agentic drug interaction + vitals insights |
| Consumer AI | Family coordination + multimodal |
| Social Good | Caregiver burden, aging society |
| Claude API / Anthropic builder comps | Claude Sonnet 4.6 + Vision end-to-end |
| Gemma 4 Good Health (if we add Gemma path) | Swap model layer, demo both |
| Taiwan / HK / SG local events | Traditional Chinese first, solves local pain |

Crucially: **none of these require a video** for initial submission — a deployed URL, README, and screenshots are enough. Video is upside, not a blocker.
