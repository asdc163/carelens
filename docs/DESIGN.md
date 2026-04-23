# CareLens — Design System & Information Architecture

## Brand tokens

```css
/* Calm, trust-forward, warmer than medical cold */
--color-bg: #fafaf9;          /* warm off-white, not stark */
--color-surface: #ffffff;
--color-surface-raised: #ffffff;
--color-border: #e7e5e4;      /* stone-200 */
--color-border-strong: #d6d3d1;

--color-ink: #1c1917;         /* stone-900, not pure black */
--color-ink-muted: #57534e;   /* stone-600 */
--color-ink-dim: #78716c;     /* stone-500 */

--color-primary: #0d9488;     /* teal-600 — calm, health-adjacent, not generic blue */
--color-primary-soft: #ccfbf1; /* teal-100 */
--color-primary-ink: #ffffff;

--color-success: #16a34a;     /* green-600 */
--color-warning: #d97706;     /* amber-600 */
--color-danger: #dc2626;      /* red-600 */

--radius-sm: 6px;
--radius: 10px;
--radius-lg: 16px;
--radius-xl: 24px;

--shadow-sm: 0 1px 2px rgb(0 0 0 / 0.04);
--shadow: 0 4px 12px rgb(0 0 0 / 0.06);
--shadow-lg: 0 12px 40px rgb(0 0 0 / 0.08);

/* Typography — Inter for Latin, Noto Sans TC for 中文, consistent weights */
--font-sans: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
--font-display: 'Inter', 'Noto Sans TC', system-ui, sans-serif;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;  /* min body size — respects elder readers */
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 42px;   /* landing hero */

/* Spacing scale — rem-based */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

## Why these choices

- **Warm off-white**, not stark white — reduces eye strain for elder readers, feels "family room" not "clinic"
- **Teal primary** — adjacent to health without being the overused medical blue; good in light & dark
- **Noto Sans TC** — critical: Traditional Chinese must render beautifully, not fall back to system serif
- **16px base body** — not 14px, accessibility-first
- **High-contrast ink colors** — 4.5:1+ on all body text, 3:1+ on large text (WCAG AA)
- **Generous radii** — 10-24px, reads as "consumer SaaS" not "admin tool"

## Information Architecture

```
/ (marketing)
  ├─ hero → "管理爸媽的健康，只需一張照片"
  ├─ problem
  ├─ 3-feature grid (OCR, Interactions, Family)
  ├─ screenshots (live product)
  ├─ FAQ
  └─ footer (bilingual toggle, GitHub, contact)

/app (auth required)
  ├─ /app/onboarding      (first-run wizard, new elder setup)
  ├─ /app                 (dashboard — all elders picker + today's summary)
  ├─ /app/elders/[id]     (elder detail — tabs: 概覽 / 藥物 / 生命徵象 / 時間軸 / 家人)
  │    ├─ overview        (insight cards + today's vitals + recent activity)
  │    ├─ medications     (list + add + interaction warnings)
  │    │    └─ /new       (photo capture OR manual)
  │    │    └─ /[medId]   (edit)
  │    ├─ vitals          (table + chart + add form)
  │    ├─ timeline        (activity feed)
  │    └─ family          (members + invites + roles)
  └─ /app/settings
       ├─ profile         (name, locale, avatar)
       └─ account         (change email, delete account, export data)

/invite/[token]           (accept family invite — public, one-click)
/auth                     (sign in / sign up)
/auth/callback            (OAuth return)

/api
  ├─ /api/auth/*
  ├─ /api/elders
  ├─ /api/medications
  ├─ /api/ocr              (POST: photoUrl → extracted fields)
  ├─ /api/interactions/check (POST: elderId → severity + details)
  ├─ /api/vitals
  ├─ /api/insights          (GET: elderId → today's summary)
  ├─ /api/family/invite     (POST: elderId + email + role)
  └─ /api/family/accept     (POST: token → membership)
```

## Component library (shadcn/ui subset)

Used: button, card, input, label, select, textarea, dialog, sheet, dropdown-menu, tabs, badge, avatar, alert, toast (sonner), skeleton, progress, separator, form (react-hook-form).

Custom components:
- `<ElderPicker />` — switch active elder in header
- `<VitalSparkline />` — SVG trend chart, lightweight
- `<InteractionBadge severity={} />` — color-coded chip
- `<PhotoCapture />` — wraps `<input type="file" capture>` + preview + retake
- `<InsightCard />` — AI-generated card with disclaimer footer
- `<LocaleSwitch />` — 繁中 / English toggle

## Critical UI states for every screen

Every data-bound screen has four named states:

1. **Loading** — skeleton matching final layout (no generic spinner)
2. **Empty** — iconic illustration + headline + specific CTA
3. **Error** — actionable message + retry button
4. **Populated** — actual data

## Key screens — wireframe specs

### Landing (/)

**Hero (above fold):**
- Logo top-left, `繁中 | English` toggle + "登入" top-right
- H1 (4xl, bold): "管理爸媽的健康，只需一張照片"
  - EN: "Take one photo. CareLens handles the rest."
- Subhead (xl, muted): "拍下藥袋，CareLens 自動辨識藥名、檢查交互作用、通知全家人。專為華人家庭設計的 AI 長照助手。"
- Two CTAs: "免費試用 →" (primary) and "看看怎麼運作" (ghost, scrolls to feature section)
- Right side: product screenshot or phone mockup

**Problem section:**
- Three pain points in cards: scattered info / language barrier / sibling miscoordination
- Each with icon, headline, 1-line body

**Feature trio:**
- OCR demo (animated gif of photo → extracted fields)
- Interaction check demo (two med cards + warning banner)
- Family timeline screenshot

**FAQ:**
- Is this a substitute for a doctor? (no)
- Is my data safe? (yes, isolated per family)
- Pricing? (free for now)

**Footer:** GitHub, contact email, locale toggle, medical disclaimer

### Dashboard (/app)

**Header bar:** CareLens logo / ElderPicker (Mom, Dad, +add) / invite avatar stack / profile menu

**Main (grid on desktop, stacked on mobile):**
- Hero insight card: today's AI summary (繁中 body, collapsed EN on click)
  - "今天血壓 128/82，比昨天略高但仍在正常範圍。最近三天睡眠偏少，可能有關。"
- Vital snapshot row: 4 small cards (BP / HR / Glucose / Weight), each with today's value + tiny sparkline
- Medication warning banner (only if any active interaction ≥ MODERATE)
- Recent activity feed (last 10 events: "Dad logged BP 2h ago")
- Quick actions strip: "+ 記錄生命徵象" / "+ 新增藥物" / "邀請家人"

**Empty state (new user, no elder):** centered illustration + "還沒有長輩資料" + "開始照護 Mom or Dad →"

### Medication list (/app/elders/[id]/medications)

- Page header: "目前用藥 (6)" with "+ 新增藥物" CTA (primary)
- Interaction banner if any: "⚠️ Warfarin 和 Aspirin 同時使用可能增加出血風險" [了解更多 →]
- Each med: card with name (ZH + EN), dose, frequency, "since" date, added by avatar
- Click → opens Sheet with full details + edit + stop medication option
- Empty: "還沒記錄藥物" + "拍照新增 📷" primary + "手動輸入" secondary

### Add medication (/app/elders/[id]/medications/new)

Two paths, tabs: **📷 拍照** (default) / **✏️ 手動**

**Photo path:**
1. Big dashed drop zone with camera icon, "點擊拍照或拖曳上傳"
2. On upload: preview + progress bar during OCR (~3s)
3. Extracted fields form (pre-filled): name ZH, name EN (if resolvable), dose, frequency, quantity
4. Each field has confidence badge (high/med/low from Claude)
5. Low-confidence fields show inline "請確認此項"
6. Interaction preview: "新增後將會跟 ___ 一起檢查"
7. Save button → checks interactions → navigates back with toast

**Manual path:** same form, no OCR, all empty.

### Family invite flow

- From family tab: email input + role select + "寄出邀請"
- Toast: "邀請已寄出給 ___"
- Invitee gets email link → `/invite/[token]` → sign in if not authenticated → accept screen showing elder + role → one-click "加入照護團隊"
- On accept: redirect to `/app/elders/[id]`

## Accessibility checklist

- [ ] All interactive elements ≥44×44px tap target on mobile
- [ ] All color-indicator info also has text/icon (colorblind safe)
- [ ] Forms have `<label>` bound to inputs, not placeholder-as-label
- [ ] Focus ring visible on keyboard nav
- [ ] `aria-live="polite"` on dynamic insight updates
- [ ] Images (user photos) have `alt` from filename or AI description
- [ ] Skip-to-content link on every page
- [ ] Passes Lighthouse a11y 95+
- [ ] Tested with macOS VoiceOver on landing + dashboard + add-med flow

## Responsive breakpoints

- Mobile: 320-767px (primary design target)
- Tablet: 768-1023px (grid becomes 2-col)
- Desktop: 1024px+ (grid becomes 3-col, fixed sidebar)

## Motion principles

- Transitions: 150-250ms, cubic-bezier(0.2, 0, 0, 1) (ease-out-ish)
- No animations on reduce-motion preference
- Page transitions: fade only, no slide
- Loading skeleton: gentle shimmer, not jarring pulse
