# CareLens — Hackathon Submission Plan

**Last updated:** 2026-04-23
**Product status:** Shipped to GitHub. 8 polished screenshots. Build green. Demo account works locally end-to-end.

---

## Hackathon landscape reality check

After systematic review of Devpost, DoraHacks, Kaggle, Cerebral Valley, Anthropic, and healthcare-specific platforms, the intersection of **(international · solo-friendly · accepting submissions · doesn't require demo video · matches CareLens's "bilingual AI caregiving SaaS for Chinese-speaking families" angle)** is narrow. Most hackathons either:

- Require a demo video (DoraHacks, Gemma 4 Good, Agents Assemble, Opus 4.7, most Devpost events)
- Require a specific platform (Prompt Opinion, MeDo, MCP Registry, etc.)
- Are US-only for prize money (ACL Caregiver AI) or US-residency (HackUNCP, Axxess)
- Have already ended in Q1 2026
- Are in-person (HSIL Harvard, Bridge2AI in Florida)

## What to do anyway

### 🎯 Tier 1 — Do now, highest ROI

**1. ACL Caregiver AI Prize Challenge — Phase 1**
- Prize: up to $2.5M across 20 winners
- Deadline: **July 31, 2026** (Phase 1)
- Eligibility: International can participate, **U.S. citizens / permanent residents only can win**
- Theme: Bullseye — this is literally the world's flagship caregiver AI competition
- Strategy: Submit anyway for **portfolio visibility and judge feedback**. Prize ineligibility is a known constraint; the resume value of a Phase 1 submission to the ACL federal challenge is substantial.
- Video: check; if required, record a 3-min screen capture (no face, just product walkthrough) post-hoc.
- Link: https://acl.gov/caregiver-ai-competition

### 🎯 Tier 2 — Track and enter when they open

**2. Next Cerebral Valley Claude Code hackathon**
- Opus 4.6 (Feb) and 4.7 (Apr) are closed. Pattern = roughly one every 2–3 months.
- When the next one opens: CareLens is already eligible (built with Claude), and the first-wave application window is typically 1 week.
- Action: monitor https://cerebralvalley.ai/hackathons weekly.

**3. AWS AI League 2026 (year-round)**
- $50K prize, finale at re:Invent
- Can submit anytime before 9/30
- Theme: AI/Cloud — would require adding AWS-specific integration (Bedrock AgentCore or SageMaker) to CareLens. Effort: 1-2 days.

**4. MunichTech Innovation Hackathon — 2026 Fall**
- Enterprise AI, online, international
- Scheduled for September — CareLens with B2B pivot (clinic / senior-living-facility portal) could fit.

### 🟡 Tier 3 — Already-registered, decide per-event

**5. Build with MeDo ($50K, 6/4)**
- Already submitted ServiceBot Studio for community vote. CareLens not eligible (not built on MeDo platform).

**6. HashKey Chain Horizon (40K USDT, 4/23 today)**
- Already submitted ElderCare BUIDL. CareLens is the SaaS evolution of the same core idea but wasn't built on HashKey Chain — separate submission would require re-architecting onto HashKey. Skip; ride the existing BUIDL.

**7. Boring AI ($3K, 5/3)**
- DoraHacks, 44 participants, low competition.
- Theme: "automate the boring upgrade/refactor/migration work in software."
- CareLens doesn't fit this theme. Skip; use ethers-v6-codemod project (already built) instead.

**8. BLI Legal Tech ($50K, 11/1)**
- Theme: Legal tech. CareLens's family-consent-with-roles model *could* be repositioned as a "family healthcare consent platform for cross-border legal compliance" but it's a stretch.
- Low priority — revisit in Q3.

**9. Four.Meme AI Sprint ($50K, 4/30)**
- Blocked on demo video requirement. Existing ElderCare BUIDL already submitted to platform, just needs video to complete submission. Separate problem from CareLens.

**10. Gemma 4 Good ($200K, 5/18)**
- Requires video AND Gemma 4 integration.
- CareLens *could* add a Gemma 4 backend swap as an optional model layer (already has Claude abstraction in `src/lib/claude.ts`), then record a video.
- Effort: 1 day engineering + 3 hours video.
- Worth it if Tommy is willing to record.

### ⛔ Skipped

- **Agents Assemble ($25K, 5/11)** — requires Prompt Opinion platform + demo video
- **AI for Healthcare (Devpost)** — ended 2021
- **Axxess** — ended Feb 2026, students only
- **Built with Opus 4.7** — application closed April 17
- **HackUNCP, HackUSF, H2AI Georgetown** — student-only or in-person

## Decision matrix

| Hackathon | Prize potential for Tommy | Effort | Time window | Decision |
|-----------|--------------------------|--------|-------------|----------|
| ACL Caregiver AI Phase 1 | $0 (ineligible) but huge portfolio value | Medium | Until 7/31 | **Submit** |
| Next Opus/Sonnet hackathon | $ varies | Low (reuse CareLens) | Opens ~quarterly | **Wait & apply** |
| Gemma 4 Good | $200K realistic shot | Medium (add Gemma + video) | Until 5/18 | **Decide when Tommy next reviews** |
| AWS AI League | $50K | Medium (add AWS integration) | Until 9/30 | **Decide Q3** |
| Boring AI / BLI / Four.Meme | Varies | Low, but bad fit | Various | **Skip for CareLens** — use other projects |

## Hidden value

Independent of any hackathon outcome, CareLens is now:

- A polished, working bilingual SaaS on GitHub (https://github.com/asdc163/carelens)
- An 8-screenshot portfolio piece showing real UX craft
- A reusable foundation for any future healthcare-AI pitch
- A real demo Tommy can show to any investor, employer, or grant committee

**Shipping the product was the hackathon.** The competition-entry layer is upside.
