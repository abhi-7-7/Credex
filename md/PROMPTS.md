# Prompts

This file documents the full prompt strings used in the Anthropic API call that generates the personalised audit summary.

---

## AI Summary Prompt

**Used in:** `app/api/audit-summary/route.ts`  
**Model:** `claude-haiku-4-5`  
**Max tokens:** 180  
**Temperature:** default (1.0)

### System prompt

None (stateless single-turn call).

### User message template

```
You are an expert startup CFO advisor. Write a concise, direct ~100-word personalised audit summary for a startup based on these findings:

Total current AI spend: ${{totalCurrentSpend}}/month
Total estimated savings: ${{totalEstimatedSaving}}/month

Top recommendations:
{{toolSummary}}

Write in second person ("your team", "you're currently"). Be specific about numbers. End with one concrete next action. No bullet points — flowing paragraph only.
```

Where `{{toolSummary}}` is built as:
```
{{toolName}}: save ${{estimatedSaving}}/mo by — {{recommendedAction}}
```
for each recommendation, joined by newlines.

---

## Prompt Design Decisions

### Why Haiku and not Sonnet/Opus?
The task is constrained (100 words, structured input, clear format instructions). Haiku produces equivalent quality for this prompt type at ~95% lower cost. This is consistent with the audit engine's own recommendation logic for Anthropic API users.

### Why no system prompt?
The user message is self-contained with role, task, and constraints. A system prompt would add token cost without improving output for a single-turn, highly-constrained generation.

### Why "flowing paragraph only"?
Bullets make the AI summary feel like a repeat of the recommendation cards already shown on the results page. A paragraph creates a different register — more like a CFO reading a memo — which differentiates the AI summary section visually and contextually.

### Fallback behaviour
If the API call fails (network, rate limit, or invalid key), the route falls back to a deterministic template string constructed from the audit result data. This ensures the results page always renders, even without a valid `GROQ_API_KEY`.

```typescript
// Fallback template (from route.ts)
`Your team is spending $${totalCurrentSpend}/month across AI tools, 
with an estimated $${totalEstimatedSaving}/month in avoidable costs identified. 
${topRec ? `The biggest opportunity is ${topRec.recommendedAction}, saving ~$${topRec.estimatedSaving}/month.` : ""} 
Review the recommendations below and action the highest-confidence items first.`
```

---

## Example Output

**Input:**
- Total spend: $1,390/month
- Recommendations: OpenAI API (switch gpt-4o → gpt-4o-mini, save $930), Copilot (Business → Individual ×4 seats, save $36)

**Output (actual Haiku response):**
> Your team is currently spending $1,390/month across AI tools, with $966/month in identified savings — a 70% reduction achievable through two targeted changes. The largest opportunity is your OpenAI API usage: switching from GPT-4o to GPT-4o-mini for document processing tasks alone saves $930/month, as the mini model handles non-reasoning workloads at 93% lower cost with comparable output quality. Additionally, your four Copilot Business seats can move to Individual plans at $9/seat less, saving a further $36/month. Start with the OpenAI model switch this week — it requires a single configuration change and delivers the majority of your savings immediately.
