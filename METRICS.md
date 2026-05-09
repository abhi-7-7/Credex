# Metrics

## North Star Metric

**Qualified leads per week** — defined as: audit completions where `totalEstimatedSaving >= $500/month`.

### Why this metric

1. It's a leading indicator of revenue — people with $500+/month in identified savings have enough motivation to explore Credex
2. It's measurable from day 1 without waiting for the full funnel to close
3. It filters out noise — someone who uses one $20/month tool and saves $5 is not a Credex prospect
4. It's actionable — if this number is low, the problem is either traffic or audit logic (tools too cheap or rules too conservative)

**Target:** 10 qualified leads/week by end of month 1

---

## Supporting Metrics

| Metric | Target (Month 1) | Why it matters |
|--------|-----------------|----------------|
| Weekly audit completions | 100 | Volume needed to hit NSM |
| Audit completion rate | ≥ 40% (visitors who start → complete) | Form friction indicator |
| Email capture rate | ≥ 20% (of audits) | Value delivery indicator |
| Share rate | ≥ 5% (of audits) | Viral coefficient |
| Credex CTA click rate | ≥ 10% (of $500+ results) | Commercial intent |
| Email → Credex conversion | ≥ 3% (30-day window) | Revenue predictor |

---

## Instrumentation Plan

All metrics tracked via Supabase event logging (no third-party analytics required at this stage).

**Events to log:**
```
audit_started       { timestamp, source_referrer }
audit_completed     { timestamp, total_spend, total_saving, credex_cta_shown }
email_captured      { timestamp, audit_id, saving_tier }
share_clicked       { timestamp, audit_id }
credex_cta_clicked  { timestamp, audit_id, total_saving }
```

**Dashboard:** Simple Supabase SQL view. Upgrade to a real dashboard tool (Metabase, Retool) when team > 1 person needs access.

---

## Weekly Review Cadence

Every Monday: pull last 7 days of metrics. Ask three questions:

1. **Is the NSM moving?** If qualified leads < 5/week, diagnose: traffic problem or conversion problem?
2. **What's the audit completion rate?** If < 30%, the form has friction — likely the API tool fields are too complex.
3. **What's the share rate?** If > 10%, double down on the shareable URL feature (better OG design, share nudge).

---

## Metrics That Don't Matter (Yet)

| Metric | Why we're ignoring it |
|--------|----------------------|
| Total page views | Vanity — audit completions matter more |
| Bounce rate | No meaningful baseline until month 2 |
| Email open rate | Too early — first batch of leads is tiny |
| Revenue | No Credex integration instrumented yet |

---

## Anti-goals

- Do not optimise for audit completions at the expense of qualified leads. If we lower the tool selection bar (e.g. add a $5/month tool), completions go up but lead quality goes down.
- Do not push Credex CTA to sub-$500 savers. Short-term click rate goes up, but trust erodes and email conversion will crater.
