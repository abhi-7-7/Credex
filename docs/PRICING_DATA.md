# PRICING_DATA.md

> All pricing verified from official pages. Date of last check noted per tool.
> This file is the single source of truth for the audit engine.
> Re-verify before any submission — AI tool pricing changes frequently.

---

## Cursor

**Last verified:** 2025-07-09
**Source:** https://cursor.com/pricing

| Plan | Price/seat/month | Key inclusions |
|------|-----------------|----------------|
| Hobby | $0 | 2,000 completions, limited AI requests |
| Pro | $20 | Unlimited completions, 500 fast requests/month, GPT-4o, Claude |
| Business | $40 | Everything in Pro + SSO, centralized billing, admin dashboard |

**Audit logic basis:**
- Business → Pro saving: $20/seat/month (50% reduction)
- Downgrade valid when team is not using SSO or admin features

---

## GitHub Copilot

**Last verified:** 2025-07-09
**Source:** https://github.com/features/copilot#pricing

| Plan | Price/seat/month | Key inclusions |
|------|-----------------|----------------|
| Individual | $10 | IDE completions, Copilot Chat in IDE |
| Business | $19 | + Centralized policy, audit logs, exclude files |
| Enterprise | $39 | + Copilot Chat on GitHub.com, fine-tuned models |

**Audit logic basis:**
- Enterprise → Business saving: $20/seat/month
- Business → Individual saving: $9/seat/month (only when policy mgmt not needed)

---

## ChatGPT (Subscriptions)

**Last verified:** 2025-07-09
**Source:** https://openai.com/chatgpt/pricing

| Plan | Price/seat/month | Key inclusions |
|------|-----------------|----------------|
| Free | $0 | GPT-4o mini, limited GPT-4o |
| Plus | $20 | GPT-4o, DALL·E, extended context |
| Team | $30 | + Shared workspaces, admin console, higher limits |
| Enterprise | Custom | + SSO, compliance, unlimited context |

**Audit logic basis:**
- Team → Plus saving: $10/seat/month when shared workspaces are unused

---

## Claude (Subscriptions)

**Last verified:** 2025-07-09
**Source:** https://anthropic.com/claude#pricing

| Plan | Price/seat/month | Key inclusions |
|------|-----------------|----------------|
| Free | $0 | Claude 3.5 Haiku, limited Claude 3.5 Sonnet |
| Pro | $20 | Claude 3.5 Sonnet, 5× usage vs free, Projects |
| Team | $30 | + Admin dashboard, higher limits, priority access |
| Enterprise | Custom | SSO, compliance, custom context |

**Audit logic basis:**
- Team → Pro saving: $10/seat/month when admin features are unused

---

## Gemini (Subscriptions)

**Last verified:** 2025-07-09
**Source:** https://one.google.com/about/plans

| Plan | Price/month | Key inclusions |
|------|------------|----------------|
| Free | $0 | Gemini 1.5 Flash, limited Gemini 1.5 Pro |
| Google One AI Premium | $19.99 | Gemini 1.5 Pro, Gemini in Workspace, 2TB storage |
| Gemini for Workspace | $30/seat | Gemini in Gmail, Docs, Sheets, Meet |

**Note:** Pricing fragmented across Google One and Google Workspace.
Audit flags when paying for both subscriptions with overlapping use cases.

---

## OpenAI API

**Last verified:** 2025-07-09
**Source:** https://openai.com/api/pricing

### Input / output prices (per million tokens)

| Model | Input | Output | Batch input | Batch output |
|-------|-------|--------|-------------|--------------|
| GPT-4o | $5.00 | $15.00 | $2.50 | $7.50 |
| GPT-4o mini | $0.15 | $0.60 | $0.075 | $0.30 |
| o3 | $10.00 | $40.00 | $5.00 | $20.00 |
| GPT-4o Realtime | $40.00 | $80.00 | N/A | N/A |

**Audit logic basis:**
- GPT-4o → GPT-4o mini: ~97% cost reduction for non-reasoning tasks
  - Valid use cases: chat_general, document_writing, customer_support, other
  - Invalid: complex_reasoning, advanced_data_analysis
- Batch API discount: 50% on supported models (async workloads, up to 24h latency)
- Price ratio for model switch = target_avg_price / current_avg_price (60/40 input/output split)

---

## Anthropic API

**Last verified:** 2025-07-09
**Source:** https://anthropic.com/pricing

### Input / output prices (per million tokens)

| Model | Input | Output | Batch input | Batch output | Cached input |
|-------|-------|--------|-------------|--------------|--------------|
| Claude Opus 4 | $15.00 | $75.00 | $7.50 | $37.50 | $1.50 |
| Claude Sonnet 4 | $3.00 | $15.00 | $1.50 | $7.50 | $0.30 |
| Claude Haiku 4.5 | $0.80 | $4.00 | $0.40 | $2.00 | $0.08 |

**Audit logic basis:**
- Opus → Sonnet: ~80% cost reduction for non-complex-reasoning tasks
- Sonnet → Haiku: ~73% cost reduction for high-volume simple tasks
- Batch API: 50% discount for async workloads
- Prompt caching: up to 90% saving on repeated prompt prefixes
  - Requires structured prompts with stable prefix (system prompt, documents)
  - Conservative estimate used in audit: 70% saving (not max 90%)

---

## Gemini API

**Last verified:** 2025-07-09
**Source:** https://ai.google.dev/pricing

### Input / output prices (per million tokens)

| Model | Input | Output | Cached input |
|-------|-------|--------|--------------|
| Gemini 1.5 Pro | $3.50 | $10.50 | $0.875 |
| Gemini 1.5 Flash | $0.075 | $0.30 | $0.01875 |
| Gemini 2.0 Flash | $0.10 | $0.40 | $0.025 |

**Audit logic basis:**
- Gemini 1.5 Pro → Flash: ~98% cost reduction for non-complex tasks
- Context caching available on both models

---

## Audit engine assumptions

All token-volume estimates use a **60% input / 40% output** split,
which is a reasonable average for mixed workloads. Actual ratios vary.

When actual usage logs are unavailable (which is true for all form-based inputs),
savings figures are marked as **estimates**. The confidence field reflects:

- `high`: saving is purely arithmetic (price × seats), no estimation
- `medium`: saving depends on a reasonable but unverified assumption (e.g. token split)
- `low`: saving depends on behavior change or team adoption
