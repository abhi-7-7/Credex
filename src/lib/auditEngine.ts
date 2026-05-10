import type { AuditInput, AuditResult, Recommendation, ToolEntry } from "@/types/audit";

/* ── Official pricing (verified against vendor pages) ─────────── */
const PRICING = {
  cursor:        { hobby: 0, pro: 20, business: 40,  source: "https://cursor.com/pricing" },
  copilot:       { individual: 10, business: 19, enterprise: 39, source: "https://github.com/features/copilot#pricing" },
  claude_sub:    { free: 0, pro: 20, team: 30, source: "https://www.anthropic.com/pricing" },
  chatgpt_sub:   { free: 0, plus: 20, team: 30, source: "https://openai.com/chatgpt/pricing" },
  gemini:        { free: 0, google_one_ai: 19.99, workspace: 30, source: "https://one.google.com/about/plans" },
  windsurf:      { free: 0, pro: 15, team: 35, source: "https://windsurf.com/pricing" },
  openai_api:    { gpt4o_to_mini_ratio: 0.93, batch_discount: 0.5, source: "https://openai.com/api/pricing" },
  anthropic_api: { opus_to_haiku_ratio: 0.95, sonnet_to_haiku_ratio: 0.80, source: "https://www.anthropic.com/pricing" },
} as const;

/* ── Per-tool auditors (return array of ALL applicable recommendations) ── */

function auditCursor(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const seats = e.seats ?? 1;
  const planPrices: Record<string, number> = { hobby: 0, pro: 20, business: 40 };
  const expectedCost = seats * (planPrices[e.plan ?? "pro"] ?? 20);
  const currentSpend = e.monthlySpend || expectedCost;

  if (e.plan === "business") {
    const saving = seats * (PRICING.cursor.business - PRICING.cursor.pro);
    recs.push({ toolId: "cursor", toolName: "Cursor", currentSpend, recommendedAction: `Downgrade ${seats} seat(s) from Business ($40) to Pro ($20/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Cursor Business adds SSO and centralised billing. Unless your team requires SSO, Pro seats are functionally identical for developers.", sourceUrl: PRICING.cursor.source, confidence: "high" });
  }
  // Overspend: paying more than expected for plan
  if (currentSpend > expectedCost && expectedCost > 0) {
    const saving = currentSpend - expectedCost;
    recs.push({ toolId: "cursor", toolName: "Cursor", currentSpend, recommendedAction: `You're paying $${currentSpend}/mo but ${seats} ${e.plan ?? "pro"} seat(s) should cost $${expectedCost}/mo — renegotiate or verify billing`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Your actual spend exceeds the published list price for your plan and seat count. This often happens with legacy pricing, forgotten add-ons, or billing errors.", sourceUrl: PRICING.cursor.source, confidence: "medium" });
  }
  return recs;
}

function auditCopilot(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const seats = e.seats ?? 1;
  const planPrices: Record<string, number> = { individual: 10, business: 19, enterprise: 39 };
  const expectedCost = seats * (planPrices[e.plan ?? "individual"] ?? 19);
  const currentSpend = e.monthlySpend || expectedCost;

  if (e.plan === "business" && seats <= 4) {
    const saving = seats * (PRICING.copilot.business - PRICING.copilot.individual);
    recs.push({ toolId: "copilot", toolName: "GitHub Copilot", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Business ($19) to Individual ($10/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Copilot Business adds policy controls and audit logs. Teams under 5 seats rarely need centralised policy — Individual plans give identical code completion at half the price.", sourceUrl: PRICING.copilot.source, confidence: "high" });
  }
  if (e.plan === "enterprise" && seats <= 9) {
    const saving = seats * (PRICING.copilot.enterprise - PRICING.copilot.business);
    recs.push({ toolId: "copilot", toolName: "GitHub Copilot", currentSpend, recommendedAction: `Downgrade ${seats} seat(s) from Enterprise ($39) to Business ($19/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Copilot Enterprise adds GitHub.com chat and fine-tuning. Teams under 10 rarely use these features enough to justify the $20/seat premium.", sourceUrl: PRICING.copilot.source, confidence: "medium" });
  }
  if (currentSpend > expectedCost && expectedCost > 0) {
    const saving = currentSpend - expectedCost;
    recs.push({ toolId: "copilot", toolName: "GitHub Copilot", currentSpend, recommendedAction: `Billing exceeds list price — ${seats} ${e.plan} seat(s) should cost $${expectedCost}/mo, not $${currentSpend}/mo`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Your actual spend exceeds published pricing. Check for duplicate subscriptions or legacy pricing.", sourceUrl: PRICING.copilot.source, confidence: "medium" });
  }
  return recs;
}

function auditClaudeSub(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const seats = e.seats ?? 1;
  const planPrices: Record<string, number> = { free: 0, pro: 20, team: 30 };
  const expectedCost = seats * (planPrices[e.plan ?? "pro"] ?? 20);
  const currentSpend = e.monthlySpend || expectedCost;

  if (e.plan === "team" && seats <= 3) {
    const saving = seats * (PRICING.claude_sub.team - PRICING.claude_sub.pro);
    recs.push({ toolId: "claude_sub", toolName: "Claude (subscription)", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Team ($30) to individual Pro ($20/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Claude Team adds centralised billing and higher limits. Groups of 3 or fewer rarely exhaust Pro limits or need admin controls.", sourceUrl: PRICING.claude_sub.source, confidence: "high" });
  }
  if (e.plan === "team" && seats > 3) {
    const saving = Math.round(currentSpend * 0.10);
    recs.push({ toolId: "claude_sub", toolName: "Claude (subscription)", currentSpend, recommendedAction: "Negotiate annual billing with Anthropic for ~10% volume discount", estimatedSaving: saving, savingPercent: 10, reasoning: "Teams of 4+ seats on monthly billing typically qualify for annual contract discounts. Anthropic offers ~10% off for annual commitments.", sourceUrl: PRICING.claude_sub.source, confidence: "low" });
  }
  if (currentSpend > expectedCost && expectedCost > 0) {
    const saving = currentSpend - expectedCost;
    recs.push({ toolId: "claude_sub", toolName: "Claude (subscription)", currentSpend, recommendedAction: `Billing exceeds list price — ${seats} ${e.plan} seat(s) should cost $${expectedCost}/mo`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Your actual spend exceeds published pricing for your plan and seat count.", sourceUrl: PRICING.claude_sub.source, confidence: "medium" });
  }
  return recs;
}

function auditChatGPTSub(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const seats = e.seats ?? 1;
  const planPrices: Record<string, number> = { free: 0, plus: 20, team: 30 };
  const expectedCost = seats * (planPrices[e.plan ?? "plus"] ?? 20);
  const currentSpend = e.monthlySpend || expectedCost;

  if (e.plan === "team" && seats <= 3) {
    const saving = seats * (PRICING.chatgpt_sub.team - PRICING.chatgpt_sub.plus);
    recs.push({ toolId: "chatgpt_sub", toolName: "ChatGPT (subscription)", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Team ($30) to Plus ($20/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "ChatGPT Team adds shared workspaces and admin controls. Small independent users get the same models with a Plus plan at $10/seat less.", sourceUrl: PRICING.chatgpt_sub.source, confidence: "high" });
  }
  if (currentSpend > expectedCost && expectedCost > 0) {
    const saving = currentSpend - expectedCost;
    recs.push({ toolId: "chatgpt_sub", toolName: "ChatGPT (subscription)", currentSpend, recommendedAction: `Billing exceeds list price — ${seats} ${e.plan} seat(s) should cost $${expectedCost}/mo`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Your actual spend exceeds published pricing. Check for duplicate subscriptions or forgotten add-ons.", sourceUrl: PRICING.chatgpt_sub.source, confidence: "medium" });
  }
  return recs;
}

function auditGemini(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const planPrices: Record<string, number> = { free: 0, google_one_ai: 19.99, workspace: 30 };
  const seats = e.seats ?? 1;
  const expectedCost = seats * (planPrices[e.plan ?? "free"] ?? 0);
  const currentSpend = e.monthlySpend || expectedCost;

  if (e.plan === "workspace" && seats <= 5) {
    const saving = seats * (30 - 19.99);
    recs.push({ toolId: "gemini", toolName: "Gemini", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Workspace ($30) to Google One AI Premium ($19.99/seat)`, estimatedSaving: Math.round(saving), savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Workspace AI add-on is designed for enterprise compliance. Teams under 5 get the same Gemini Advanced model with Google One AI Premium at ~$10/seat less.", sourceUrl: PRICING.gemini.source, confidence: "high" });
  }
  if (currentSpend > expectedCost && expectedCost > 0) {
    const saving = currentSpend - expectedCost;
    recs.push({ toolId: "gemini", toolName: "Gemini", currentSpend, recommendedAction: `Billing exceeds list price — expected $${Math.round(expectedCost)}/mo for ${seats} seat(s)`, estimatedSaving: Math.round(saving), savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Your actual spend exceeds published pricing for your plan and seat count.", sourceUrl: PRICING.gemini.source, confidence: "medium" });
  }
  return recs;
}

function auditOpenAIApi(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const spend = e.monthlySpend ?? 0;
  if (!spend) return recs;

  if (e.model === "gpt-4o" && e.useCase !== "complex_reasoning") {
    const saving = Math.round(spend * PRICING.openai_api.gpt4o_to_mini_ratio);
    recs.push({ toolId: "openai_api", toolName: "OpenAI API", currentSpend: spend, recommendedAction: "Switch from GPT-4o to GPT-4o-mini (93% cheaper per token) for non-reasoning tasks", estimatedSaving: saving, savingPercent: 93, reasoning: "GPT-4o-mini handles code completion, chat, and document tasks at 93% lower cost with comparable output quality for non-complex workloads.", sourceUrl: PRICING.openai_api.source, confidence: "high" });
  }
  if (e.model === "gpt-4-turbo") {
    const saving = Math.round(spend * 0.85);
    recs.push({ toolId: "openai_api", toolName: "OpenAI API", currentSpend: spend, recommendedAction: "Migrate from GPT-4 Turbo to GPT-4o-mini — 85% cheaper with better speed", estimatedSaving: saving, savingPercent: 85, reasoning: "GPT-4 Turbo is a legacy model. GPT-4o-mini is newer, faster, and dramatically cheaper per token while matching quality for most tasks.", sourceUrl: PRICING.openai_api.source, confidence: "high" });
  }
  if (!e.usingBatchApi && spend > 100) {
    const saving = Math.round(spend * 0.6 * PRICING.openai_api.batch_discount);
    recs.push({ toolId: "openai_api", toolName: "OpenAI API", currentSpend: spend, recommendedAction: "Enable Batch API for async workloads — 50% discount on eligible calls", estimatedSaving: saving, savingPercent: Math.round((saving / spend) * 100), reasoning: "OpenAI's Batch API offers 50% off for requests that don't need real-time responses. Conservatively ~60% of typical API usage is async-safe.", sourceUrl: PRICING.openai_api.source, confidence: "medium" });
  }
  return recs;
}

function auditAnthropicApi(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const spend = e.monthlySpend ?? 0;
  if (!spend) return recs;

  if (e.model === "claude-opus-4" && e.useCase !== "complex_reasoning") {
    const saving = Math.round(spend * PRICING.anthropic_api.opus_to_haiku_ratio);
    recs.push({ toolId: "anthropic_api", toolName: "Anthropic API", currentSpend: spend, recommendedAction: "Switch from Claude Opus 4 to Claude Haiku 4 (95% cheaper) for non-reasoning tasks", estimatedSaving: saving, savingPercent: 95, reasoning: "Haiku handles chat, document processing, and simple tasks at 95% lower cost than Opus with comparable quality.", sourceUrl: PRICING.anthropic_api.source, confidence: "high" });
  }
  if (e.model === "claude-sonnet-4" && e.useCase !== "complex_reasoning") {
    const saving = Math.round(spend * PRICING.anthropic_api.sonnet_to_haiku_ratio);
    recs.push({ toolId: "anthropic_api", toolName: "Anthropic API", currentSpend: spend, recommendedAction: "Switch from Claude Sonnet 4 to Claude Haiku 4 (80% cheaper) for non-reasoning workloads", estimatedSaving: saving, savingPercent: 80, reasoning: "Sonnet is over-spec for chat, formatting, and simple tasks. Haiku handles these at 80% lower cost.", sourceUrl: PRICING.anthropic_api.source, confidence: "high" });
  }
  if (!e.usingPromptCaching && spend > 50) {
    const saving = Math.round(spend * 0.3);
    recs.push({ toolId: "anthropic_api", toolName: "Anthropic API", currentSpend: spend, recommendedAction: "Enable prompt caching — up to 90% saving on repeated system prompt tokens", estimatedSaving: saving, savingPercent: 30, reasoning: "Anthropic's prompt caching reduces costs by up to 90% on repeated system prompt tokens. Conservative estimate: 30% net saving across a typical API workload.", sourceUrl: PRICING.anthropic_api.source, confidence: "medium" });
  }
  return recs;
}

function auditWindsurf(e: ToolEntry): Recommendation[] {
  const recs: Recommendation[] = [];
  const seats = e.seats ?? 1;
  const planPrices: Record<string, number> = { free: 0, pro: 15, team: 35 };
  const expectedCost = seats * (planPrices[e.plan ?? "pro"] ?? 15);
  const currentSpend = e.monthlySpend || expectedCost;

  if (e.plan === "team" && seats <= 4) {
    const saving = seats * (35 - 15);
    recs.push({ toolId: "windsurf", toolName: "Windsurf", currentSpend, recommendedAction: `Downgrade ${seats} seat(s) from Team ($35) to Pro ($15/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Windsurf Team adds admin controls and centralised billing. Teams of 4 or fewer rarely need these — Pro gives identical AI flows at $20/seat less.", sourceUrl: PRICING.windsurf.source, confidence: "high" });
  }
  if (currentSpend > expectedCost && expectedCost > 0) {
    const saving = currentSpend - expectedCost;
    recs.push({ toolId: "windsurf", toolName: "Windsurf", currentSpend, recommendedAction: `Billing exceeds list price — expected $${expectedCost}/mo for ${seats} ${e.plan} seat(s)`, estimatedSaving: Math.round(saving), savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Your actual spend exceeds published pricing for your plan.", sourceUrl: PRICING.windsurf.source, confidence: "medium" });
  }
  return recs;
}

/* ── Cross-tool overlap detection ─────────────────────────────── */

function detectOverlap(entries: ToolEntry[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const enabled = entries.filter(e => e.enabled);
  const codeEditors = enabled.filter(e => ["cursor", "copilot", "windsurf"].includes(e.toolId));

  if (codeEditors.length >= 2) {
    const nameMap: Record<string, string> = { cursor: "Cursor", copilot: "Copilot", windsurf: "Windsurf" };
    const sorted = [...codeEditors].sort((a, b) => (b.monthlySpend ?? 0) - (a.monthlySpend ?? 0));
    const drop = sorted[sorted.length - 1];
    const keep = sorted[0];
    const saving = drop.monthlySpend ?? 0;
    if (saving > 0) {
      recs.push({
        toolId: drop.toolId, toolName: `${codeEditors.map(e => nameMap[e.toolId]).join(" + ")} overlap`,
        currentSpend: codeEditors.reduce((s, e) => s + (e.monthlySpend ?? 0), 0),
        recommendedAction: `Consolidate to a single AI code editor — drop ${nameMap[drop.toolId] ?? drop.toolId} and keep ${nameMap[keep.toolId] ?? keep.toolId}`,
        estimatedSaving: saving, savingPercent: Math.round((saving / codeEditors.reduce((s, e) => s + (e.monthlySpend ?? 0), 0)) * 100),
        reasoning: "Running multiple AI code editors (Cursor, Copilot, Windsurf) provides overlapping functionality — code completion, inline chat, and code generation. Most teams can consolidate to one without loss of productivity.",
        sourceUrl: "https://cursor.com/pricing", confidence: "medium",
      });
    }
  }

  const chatSubs = enabled.filter(e => ["claude_sub", "chatgpt_sub"].includes(e.toolId));
  if (chatSubs.length >= 2) {
    const cheapest = [...chatSubs].sort((a, b) => (a.monthlySpend ?? 0) - (b.monthlySpend ?? 0))[0];
    const saving = cheapest.monthlySpend ?? 0;
    if (saving > 0) {
      recs.push({
        toolId: cheapest.toolId, toolName: "Claude + ChatGPT overlap",
        currentSpend: chatSubs.reduce((s, e) => s + (e.monthlySpend ?? 0), 0),
        recommendedAction: "Consolidate to a single AI chat subscription — Claude and ChatGPT serve similar use cases",
        estimatedSaving: saving, savingPercent: Math.round((saving / chatSubs.reduce((s, e) => s + (e.monthlySpend ?? 0), 0)) * 100),
        reasoning: "Claude and ChatGPT both offer general-purpose chat, writing, and analysis. Running both subscriptions creates redundant coverage. Pick the one your team prefers and drop the other.",
        sourceUrl: "https://www.anthropic.com/pricing", confidence: "medium",
      });
    }
  }

  return recs;
}

/* ── Main auditor registry ────────────────────────────────────── */

const AUDITORS: Record<string, (e: ToolEntry) => Recommendation[]> = {
  cursor: auditCursor,
  copilot: auditCopilot,
  claude_sub: auditClaudeSub,
  chatgpt_sub: auditChatGPTSub,
  gemini: auditGemini,
  openai_api: auditOpenAIApi,
  anthropic_api: auditAnthropicApi,
  windsurf: auditWindsurf,
};

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: Recommendation[] = [];
  let totalCurrentSpend = 0;
  let totalEstimatedSaving = 0;

  for (const entry of input.tools) {
    if (!entry.enabled) continue;
    totalCurrentSpend += entry.monthlySpend ?? 0;
    const recs = AUDITORS[entry.toolId]?.(entry) ?? [];
    recommendations.push(...recs);
  }

  // Cross-tool overlap checks
  recommendations.push(...detectOverlap(input.tools));

  for (const r of recommendations) totalEstimatedSaving += r.estimatedSaving;

  return {
    totalCurrentSpend: Math.round(totalCurrentSpend),
    totalEstimatedSaving: Math.round(totalEstimatedSaving),
    recommendations: recommendations.sort((a, b) => b.estimatedSaving - a.estimatedSaving),
    credexCtaVisible: totalEstimatedSaving >= 500,
  };
}
