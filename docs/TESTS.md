# TESTS.md

> Documents each test in the audit engine suite, what it covers, and why it matters.
> All tests live in `src/__tests__/auditEngine.test.ts` and run via Vitest.

---

## Running the suite

```bash
npm test              # single run
npm run test:watch    # watch mode during development
```

**Current status:** 23 tests, all passing ✅

---

## Test coverage

### Cursor (4 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | recommends Pro over Business | Business→Pro saves `seats × $20`. Confidence: high. |
| 2 | returns nothing for Pro at correct price | No false positive when already optimal. |
| 3 | flags overspend when actual spend exceeds list price | Detects billing anomalies (e.g. $100/mo for 2 Pro seats should be $40). |
| 4 | skips disabled tools completely | Disabled tools contribute $0 to spend and produce no recs. |

### Copilot (2 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 5 | recommends Individual over Business for ≤4 seats | $9/seat saving, source URL contains github.com. |
| 6 | recommends Business over Enterprise for ≤9 seats | $20/seat saving with medium confidence. |

### Claude subscription (2 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 7 | recommends Pro over Team for ≤3 seats | $10/seat saving, high confidence. |
| 8 | suggests annual billing for larger teams | Teams of 4+ get annual discount suggestion. |

### ChatGPT subscription (1 test)

| # | Test | What it verifies |
|---|------|-----------------|
| 9 | recommends Plus over Team for ≤3 seats | $10/seat saving, high confidence. |

### OpenAI API (4 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 10 | recommends GPT-4o-mini for non-reasoning tasks | 93% cost reduction, high confidence. |
| 11 | does NOT recommend downgrade for complex_reasoning | Prevents harmful model downgrades. |
| 12 | recommends Batch API when not in use and spend > $100 | 50% discount on async workloads. |
| 13 | flags GPT-4 Turbo as legacy model | 85% saving by migrating to GPT-4o-mini. |

### Anthropic API (3 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 14 | recommends Haiku for Opus on non-reasoning tasks | 95% cost reduction, high confidence. |
| 15 | recommends Haiku for Sonnet on non-reasoning tasks | 80% cost reduction, high confidence. |
| 16 | recommends prompt caching when not in use | 30% net saving estimate, medium confidence. |

### Windsurf (2 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 17 | recommends Pro over Team for ≤4 seats | $20/seat saving, high confidence. |
| 18 | returns nothing for Pro at correct price | No false positive when already optimal. |

### Cross-tool overlap (1 test)

| # | Test | What it verifies |
|---|------|-----------------|
| 19 | detects Cursor + Copilot redundancy | Recommends consolidating to one AI code editor. |

### Aggregate logic (4 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 20 | shows Credex CTA when savings ≥ $500 | Product's core lead-gen trigger fires correctly. |
| 21 | hides Credex CTA when savings < $500 | Prevents pushy CTA on small savings. |
| 22 | sorts recommendations by saving descending | Highest-value action surfaces first. |
| 23 | sums total current spend correctly | Validates the hero number accuracy. |

---

## What is NOT tested (and why)

| Scope | Reason not tested |
|-------|-------------------|
| AI summary content | Non-deterministic — tested via prompt validation in PROMPTS.md |
| Supabase writes | Integration test, requires live DB credentials |
| Email delivery | Integration test, requires live Resend credentials |
| UI rendering | Covered by Lighthouse audit + manual review |
| OG preview | Verified manually with opengraph.xyz |
