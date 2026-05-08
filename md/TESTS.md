# TESTS.md

> Documents each test in the audit engine suite, what it covers, and why it matters.
> All tests live in `__tests__/audit-engine.test.ts` and run via Vitest.

---

## Running the suite

```bash
npm test              # single run
npm run test:watch    # watch mode during development
npm run test:coverage # coverage report (html in coverage/)
```

**Current status:** 14 tests, all passing ✅

---

## Test coverage

### 1. Cursor: recommends downgrade Business → Pro
**What:** When a team is on Cursor Business at $40/seat, the engine recommends Pro at $20/seat.
**Why it matters:** This is a pure arithmetic saving — the highest-confidence recommendation type.
Verifies the saving is exactly `seats × $20` and that `annualSaving = monthlySaving × 12`.

### 2. Cursor: no downgrade from Pro plan
**What:** No downgrade recommendation is generated when the team is already on Pro.
**Why it matters:** Prevents false positives. Users on the cheapest viable plan should see no downgrade.

### 3. Copilot: Enterprise → Business downgrade
**What:** 10 seats on Enterprise should generate a recommendation saving $20/seat/month.
**Why it matters:** Verifies the correct price delta ($39 - $19 = $20) and medium confidence level
(because the Enterprise feature set might be intentionally used).

### 4. Copilot: every recommendation has a source URL
**What:** All recommendations for Copilot have a non-empty `sourceUrl` starting with `https://`.
**Why it matters:** "Finance-person defensible" requires every claim to link to an official source.
This test ensures no recommendation sneaks in without a citation.

### 5. OpenAI API: model downgrade GPT-4o → GPT-4o mini for general chat
**What:** $1,000/month on GPT-4o with `chat_general` use case should trigger a switch_model recommendation.
**Why it matters:** This is the highest-value API recommendation. Tests that the use-case gate works.

### 6. OpenAI API: no model downgrade for complex reasoning
**What:** Same setup as above but with `complex_reasoning` use case — no model switch should appear.
**Why it matters:** GPT-4o mini is NOT a valid substitute for reasoning tasks. This test prevents
the engine from suggesting a downgrade that would actively harm the user's product.

### 7. OpenAI API: Batch API recommendation when not enabled
**What:** $2,000/month on GPT-4o without Batch API → recommends enabling it (50% saving = $1,000).
**Why it matters:** Batch API is the highest-certainty discount (official 50% rate, no model change).
Verifies the exact arithmetic.

### 8. OpenAI API: no Batch API recommendation when already enabled
**What:** Same as above but `usingBatchApi: true` — no batch recommendation generated.
**Why it matters:** Prevents the engine from recommending something the user is already doing.

### 9. Anthropic API: prompt caching recommendation for qualifying use cases
**What:** Claude Sonnet on `document_writing` without prompt caching → caching recommendation appears.
**Why it matters:** Prompt caching is Anthropic-specific and requires structured prompts.
Verifies confidence is "medium" (conservative — depends on prompt structure we can't verify).

### 10. Consolidation: Cursor + Copilot overlap flagged
**What:** When both Cursor and Copilot are in the tool list, a consolidation recommendation appears.
**Why it matters:** Cross-tool redundancy is a real savings source but requires the engine to
look across all entries, not just per-tool. Tests the consolidation logic runs.

### 11. Aggregates: showCredexCta = true when savings ≥ $500
**What:** 30 Cursor Business seats → >$500/month saving → `showCredexCta` is true.
**Why it matters:** The $500 CTA threshold is the product's core lead-gen trigger.
A bug here directly impacts conversion.

### 12. Aggregates: showCredexCta = false when savings < $500
**What:** 2 Cursor Business seats → <$500 saving → `showCredexCta` is false.
**Why it matters:** Showing the CTA prematurely would feel pushy and damage trust.

### 13. Aggregates: annual saving = exactly 12× monthly saving
**What:** Verifies `totalAnnualSaving === totalMonthlySaving × 12` after rounding.
**Why it matters:** The hero number on the dashboard is the annual figure. A floating-point
error here would show a visibly wrong number to users.

### 14. Aggregates: each audit generates a unique ID
**What:** Two consecutive `runAudit()` calls produce different `id` values.
**Why it matters:** Shareable URLs depend on unique IDs. Collisions would serve the wrong result.

---

## What is NOT tested (and why)

| Scope | Reason not tested |
|-------|------------------|
| AI summary content | Non-deterministic — tested via prompt validation in PROMPTS.md |
| Supabase writes | Integration test, requires live DB credentials |
| Email delivery | Integration test, requires live Resend credentials |
| UI rendering | Covered by Lighthouse audit + manual review |
| OG preview | Verified manually with opengraph.xyz |
