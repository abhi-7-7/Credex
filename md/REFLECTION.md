# Reflection

Honest retrospective on the 7-day build. What worked, what didn't, what I'd do differently.

---

## What Went Well

### Starting with pricing data, not code
The best decision of the build was writing PRICING_DATA.md on Day 1 before any code. It forced me to confront the complexity of the API tool pricing (per-token, model-dependent) early, which completely changed the form design. If I'd started with the UI, I would have built a form that couldn't capture the right data for a defensible API recommendation.

### Pure function audit engine
Writing `runAudit` as a pure TypeScript function with no side effects made it testable, readable, and debuggable without spinning up a server. The 15 tests wrote themselves once the types were clean. This is the single piece of code I'm most confident in.

### Doing user interviews on Day 2 and Day 5, not Day 7
Talking to real people early surfaced the "fragmented spend across cards" insight and the "inactive seats" problem before the UI was locked. Day 7 interviews are useless — you can't change anything.

---

## What Didn't Work

### Gemini audit rule is weak
The Gemini pricing is genuinely fragmented (Google One vs. Workspace vs. API) and the audit rule I wrote is more of a "consider this alternative" than a hard saving. A finance person could legitimately push back on the Cursor Pro comparison. This needs either: a cleaner rule, or dropping Gemini from the audit engine until pricing stabilises.

### OG image is text-only
The shareable URL OG preview shows the savings number but it's just dynamically-generated text metadata — there's no actual OG image. A proper OG image (styled card with the savings number) would dramatically improve share engagement on Twitter/X. Ran out of time.

### Email sequence isn't implemented beyond Day 0
The transactional email (Day 0) sends. The Day 3 and Day 7 follow-up emails described in GTM.md aren't implemented — they'd need a cron job or a Supabase scheduled function. This is the biggest gap between the GTM strategy and the actual product.

### The "inactive seats" problem
The third user interview surfaced that teams often pay for seats where people don't actively use the tool. The audit engine asks for seat count but has no way to know how many are actually active. A form with "seats you're paying for" vs. "seats actively used" would unlock a whole category of recommendations the current engine can't make.

---

## What I'd Do Differently

**If I had 7 more days:**
1. Build the OG image as a proper styled card (Next.js `/api/og` with `@vercel/og`)
2. Implement the full 3-email sequence (Supabase scheduled functions)
3. Add "active seats" field to the form and audit logic
4. Add CSV/JSON import from OpenAI usage dashboard (requested by 1/3 interviewees)
5. Add a benchmark comparison: "you're spending 2× the median for your team size"

**If I had 7 fewer days (one-day build):**
Only the audit engine + results page. No backend, no email — just run the logic client-side and show the results. The core value is in the audit engine, not the storage layer.

---

## Honest Assessment of the Audit Logic

The seat-based tool rules (Cursor, Copilot, Claude, ChatGPT) are genuinely defensible. The logic is simple, the price sources are official, and the conditions are objective.

The API tool rules are defensible in principle but depend on the user being honest about their use case. "Complex reasoning vs. simple tasks" is a judgment call, not an objective measurement. In production, I'd want to add: "What % of your prompts are under 1,000 tokens?" and "How often do you need multi-step reasoning?" to make the use-case classification more objective.

The Gemini rule is the weakest. I'd consider removing it in V2 unless Google simplifies their pricing structure.

---

## Biggest Lesson

The assignment is testing whether you can build something real in a week, not something perfect. The temptation is to keep iterating on the UI or adding features. The thing that matters is: does the audit engine produce correct, defensible numbers? Is the lead capture working? Does the email send? Everything else is polish.

Ship the correct thing, then make it pretty.
