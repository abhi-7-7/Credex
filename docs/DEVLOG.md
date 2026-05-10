# DEVLOG.md

> Daily build diary — one entry per day, honest and specific.
> The purpose is to show a real 7-day build, not a polished story.

---

## Day 1 — Setup + Research

**Date:** 2025-07-09
**Hours:** ~4h
**Mood:** Focused

### What I did
- Initialised Next.js 14 project with TypeScript and Tailwind
- Set up Vitest and wrote the test scaffold
- Drafted all core TypeScript types (`ToolEntry`, `AuditResult`, `Recommendation`)
- Researched and verified pricing for all 6 tools — this took longer than expected.
  Gemini's pricing is split across three different product pages.
- Wrote `PRICING_DATA.md` with official sources and dates
- Built the audit engine (`engine.ts`) with rules for Cursor, Copilot, ChatGPT, Claude
  and API tools (OpenAI, Anthropic, Gemini)
- Wrote 14 unit tests — all passing
- Set up `.github/workflows/ci.yml`
- Reached out to 3 people for user interviews (scheduled 2 for tomorrow)

### What I learned
- The hardest part of the audit engine isn't the math — it's defining when a recommendation
  is *not* valid. The `validForUseCases` array in `MODEL_DOWNGRADE_MAP` is load-bearing.
- Gemini pricing is genuinely confusing. Three separate SKUs that partially overlap.
  Flagged this in audit logic as "medium confidence" until I can test with real users.

### Blockers
- None today. Need Supabase + Resend credentials tomorrow.

### Tomorrow
- Build the spend input form (multi-step)
- First 1-2 user interviews
- Start on results dashboard layout

---

## Day 2 — Form + Interviews

**Date:** 2025-07-10
**Hours:** ~5h
**Mood:** Good — got real feedback

*(Fill in after Day 2)*

---

## Day 3 — Results + AI Summary

**Date:** 2025-07-11

*(Fill in after Day 3)*

---

## Day 4 — Backend + Email + Shareable URL

**Date:** 2025-07-12

*(Fill in after Day 4)*

---

## Day 5 — Deploy + Lighthouse

**Date:** 2025-07-13

*(Fill in after Day 5)*

---

## Day 6 — Markdown + GTM + Economics

**Date:** 2025-07-14

*(Fill in after Day 6)*

---

## Day 7 — Polish + Submit

**Date:** 2025-07-15

*(Fill in after Day 7)*
