# Unit Economics

All figures are estimates based on industry benchmarks and assumptions stated explicitly. This is a model, not a guarantee.

---

## The Funnel

```
Visitors → Audits Completed → Emails Captured → Credex Customers
  100%          40%                20%                  3%
```

**Assumed conversion rates (conservative):**
- Visitor → Audit: 40% (tool is fast, no signup required)
- Audit → Email: 20% (shown after value — higher than typical lead capture)
- Email → Credex customer: 3% (typical SaaS trial-to-paid for bottom-of-funnel lead)

**At 1,000 monthly visitors:**
- 400 audits completed
- 80 emails captured
- ~2–3 Credex customers per month

---

## Revenue Model

Credex earns margin on discounted AI credits. Assumption: 15% gross margin on credits sold.

**Average Credex customer:**
- Current AI spend: ~$800/month (audit leads are self-selected spenders)
- Credits purchased via Credex: $600/month (75% of spend shifts to Credex)
- Credex gross margin: $600 × 15% = **$90/month per customer**

**Annual revenue per customer:** $90 × 12 = **$1,080**

---

## CAC (Customer Acquisition Cost)

| Channel | Cost | Customers | CAC |
|---------|------|-----------|-----|
| Organic (HN, Twitter) | ~$0 direct | 2/month | ~$0 |
| Content/SEO | ~$500/month (time cost) | 3/month | ~$167 |
| Paid (future) | TBD | TBD | Target < $300 |

**Blended CAC target:** < $200

---

## LTV / CAC Ratio

- LTV = $1,080 (assuming 12-month average customer life — conservative for B2B)
- CAC = $200 (blended)
- **LTV:CAC = 5.4× — healthy for early-stage SaaS**

---

## Payback Period

- Monthly gross margin per customer: $90
- CAC: $200
- **Payback period: 2.2 months**

This is an extremely short payback period — characteristic of a business where the acquisition cost is low (free tool, organic) and the product has immediate utilisation.

---

## Break-Even Analysis

**Fixed costs (monthly):**
- Infrastructure (Vercel Pro + Supabase Pro + Resend): ~$50/month
- Anthropic API (audit summaries): ~$5/month at 1,000 audits (Haiku is cheap)
- Domain + misc: ~$15/month
- **Total fixed: ~$70/month**

**Break-even customers:** $70 / $90 = **0.8 customers** — break-even at the very first customer.

The tool's infrastructure cost is negligible. This is a lead-gen machine with near-zero marginal cost.

---

## Sensitivity Analysis

| Scenario | Monthly visitors | Conversion to customer | Monthly revenue |
|----------|-----------------|----------------------|-----------------|
| Conservative | 500 | 1.5% | $135 |
| Base | 1,000 | 3% | $270 |
| Optimistic | 5,000 | 3% | $1,350 |
| Viral (1 HN front page) | 20,000 | 2% | $3,600 |

**Key insight:** The model doesn't need high conversion. It needs volume. A single viral post can generate 6 months of base-case revenue in one week.

---

## Assumptions & Risks

| Assumption | Risk if wrong |
|------------|---------------|
| 15% gross margin on credits | If Credex margin is lower, LTV shrinks proportionally |
| 12-month customer life | Churn is the biggest unknown — need real data by month 3 |
| $800/month average spend | Audit completions will show real data within 2 weeks |
| 3% email → customer | Could be 0.5% (fine) or 8% (great) — test with first 100 leads |

---

## North Star Metric

**Qualified leads per week** (audits completed with savings ≥ $500/month).

This is the number that matters most because: it filters for people who would buy, it's measurable from day 1, and it directly predicts revenue without waiting for the full funnel to mature.
