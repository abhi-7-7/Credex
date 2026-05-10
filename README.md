# Credex AI Spend Audit

> Find out exactly how much your startup is overspending on AI tools — in 2 minutes.

**Live URL:** https://credex-audit.vercel.app *(replace after deploy)*
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Groq API

---

## What it does

Startups spend thousands per month on AI tools — often on plans that are two tiers
too expensive, models overkill for the task, or features already paid for elsewhere.

This app takes your current AI spend (tool, plan, seats, monthly cost) and runs it
through a rules-based audit engine that surfaces specific, finance-defensible savings.

Every recommendation links to an official pricing page. Every number is verifiable.

---

## MVP features

| # | Feature | Status |
|---|---------|--------|
| 1 | Spend input form (Cursor, Copilot, ChatGPT, Claude, Gemini, OpenAI API, Anthropic API) | ✅ |
| 2 | Audit engine — logic-based, no AI, all sources cited | ✅ |
| 3 | Results dashboard with hero savings number | ✅ |
| 4 | AI-generated 100-word summary via Groq API | ✅ |
| 5 | Email capture → Supabase storage → transactional email | ✅ |
| 6 | Shareable URL with Open Graph preview | ✅ |

---

## Running locally

```bash
# 1. Clone and install
git clone https://github.com/your-username/credex-audit
cd credex-audit
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Run tests
npm test
```

---

## Running tests

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Tests live in `src/__tests__/auditEngine.test.ts`.
23 tests covering: Cursor, Copilot, OpenAI API, Anthropic API, Windsurf, consolidation logic, and aggregates.

---

## Environment variables

```env
# Groq API (for AI summary generation)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (lead storage + audit snapshots)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJh...

# Resend (transactional email)
RESEND_API_KEY=re_...

# Public app URL (for OG tags and shareable URLs)
NEXT_PUBLIC_APP_URL=https://credex-audit.vercel.app
```

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with spend form
│   ├── audit/page.tsx        # Multi-step audit form
│   ├── audit/results/page.tsx # Results dashboard
│   ├── api/
│   │   ├── audit-summary/route.ts # Returns AI summary
│   │   ├── capture-lead/route.ts  # Stores email + audit snapshot
│   │   └── share/[id]/route.ts    # Returns audit by shareable slug
├── lib/
│   ├── auditEngine.ts        # Core audit logic + pricing constants
│   └── utils.ts              # UI utilities
├── types/
│   └── audit.ts              # Shared TypeScript types
└── __tests__/
    └── auditEngine.test.ts   # Vitest unit tests
```

---

## Repository files

| File | Purpose |
|------|---------|
| `README.md` | This file |
| `docs/ARCHITECTURE.md` | System diagrams and design decisions |
| `docs/DEVLOG.md` | 7-day build diary |
| `docs/TESTS.md` | What each test covers and why |
| `docs/PRICING_DATA.md` | Verified pricing with official sources |
| `docs/PROMPTS.md` | Full AI summary prompt strings |
| `docs/GTM.md` | Go-to-market strategy |
| `docs/ECONOMICS.md` | Unit economics for Credex |
| `docs/REFLECTION.md` | Post-build analysis |
| `docs/USER_INTERVIEWS.md` | Notes from 3 user conversations |
| `docs/LANDING_COPY.md` | All user-facing copy |
| `docs/METRICS.md` | North Star metric and targets |

---

## Lighthouse scores (mobile)

| Category | Target | Score |
|----------|--------|-------|
| Performance | ≥ 85 | *run after deploy* |
| Accessibility | ≥ 90 | *run after deploy* |
| Best Practices | ≥ 90 | *run after deploy* |

---

## Built for

Credex — 7-day entrepreneurial build challenge.
Submission deadline: Day 7.
