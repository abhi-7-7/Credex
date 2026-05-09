import type { AuditInput, AuditResult, Recommendation, ToolEntry } from "@/types/audit";

const PRICING = {
  cursor:        { hobby: 0, pro: 20, business: 40,  source: "https://cursor.com/pricing" },
  copilot:       { individual: 10, business: 19, enterprise: 39, source: "https://github.com/features/copilot#pricing" },
  claude_sub:    { pro: 20, team: 30, source: "https://www.anthropic.com/pricing" },
  chatgpt_sub:   { plus: 20, team: 30, source: "https://openai.com/chatgpt/pricing" },
  gemini:        { free: 0, google_one_ai: 19.99, workspace: 30, source: "https://one.google.com/about/plans" },
  openai_api:    { gpt4o_to_mini_ratio: 0.93, batch_discount: 0.5, source: "https://openai.com/api/pricing" },
  groq_api: { llama_to_gemma_ratio: 0.95, mixtral_to_gemma_ratio: 0.80, source: "https://groq.com/pricing" },
} as const;

function auditCursor(e: ToolEntry): Recommendation | null {
  const seats = e.seats ?? 1;
  const currentSpend = e.monthlySpend || seats * PRICING.cursor.business;
  if (e.plan === "business") {
    const saving = seats * (PRICING.cursor.business - PRICING.cursor.pro);
    return { toolId: "cursor", toolName: "Cursor", currentSpend, recommendedAction: `Downgrade ${seats} seat(s) from Business ($40) to Pro ($20/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Cursor Business adds SSO and centralised billing. Unless your team requires SSO, Pro seats are functionally identical for developers.", sourceUrl: PRICING.cursor.source, confidence: "high" };
  }
  return null;
}

function auditCopilot(e: ToolEntry): Recommendation | null {
  const seats = e.seats ?? 1;
  const priceMap: Record<string, number> = { individual: 10, business: 19, enterprise: 39 };
  const currentSpend = e.monthlySpend || seats * (priceMap[e.plan ?? "individual"] ?? 19);
  if (e.plan === "business" && seats <= 4) {
    const saving = seats * (PRICING.copilot.business - PRICING.copilot.individual);
    return { toolId: "copilot", toolName: "GitHub Copilot", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Business ($19) to Individual ($10/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Copilot Business adds policy controls and audit logs. Teams under 5 seats rarely need centralised policy — Individual plans give identical code completion at half the price.", sourceUrl: PRICING.copilot.source, confidence: "high" };
  }
  if (e.plan === "enterprise" && seats <= 9) {
    const saving = seats * (PRICING.copilot.enterprise - PRICING.copilot.business);
    return { toolId: "copilot", toolName: "GitHub Copilot", currentSpend, recommendedAction: `Downgrade ${seats} seat(s) from Enterprise ($39) to Business ($19/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Copilot Enterprise adds GitHub.com chat and fine-tuning. Teams under 10 rarely use these features enough to justify the $20/seat premium.", sourceUrl: PRICING.copilot.source, confidence: "medium" };
  }
  return null;
}

function auditClaudeSub(e: ToolEntry): Recommendation | null {
  const seats = e.seats ?? 1;
  const currentSpend = e.monthlySpend || seats * PRICING.claude_sub.team;
  if (e.plan === "team" && seats <= 3) {
    const saving = seats * (PRICING.claude_sub.team - PRICING.claude_sub.pro);
    return { toolId: "claude_sub", toolName: "Claude (subscription)", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Team ($30) to individual Pro ($20/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "Claude Team adds centralised billing and higher limits. Groups of 3 or fewer rarely exhaust Pro limits or need admin controls.", sourceUrl: PRICING.claude_sub.source, confidence: "high" };
  }
  return null;
}

function auditChatGPTSub(e: ToolEntry): Recommendation | null {
  const seats = e.seats ?? 1;
  const currentSpend = e.monthlySpend || seats * PRICING.chatgpt_sub.team;
  if (e.plan === "team" && seats <= 3) {
    const saving = seats * (PRICING.chatgpt_sub.team - PRICING.chatgpt_sub.plus);
    return { toolId: "chatgpt_sub", toolName: "ChatGPT (subscription)", currentSpend, recommendedAction: `Switch ${seats} seat(s) from Team ($30) to Plus ($20/seat)`, estimatedSaving: saving, savingPercent: Math.round((saving / currentSpend) * 100), reasoning: "ChatGPT Team adds shared workspaces and admin controls. Small independent users get the same models with a Plus plan at $10/seat less.", sourceUrl: PRICING.chatgpt_sub.source, confidence: "high" };
  }
  return null;
}

function auditGemini(e: ToolEntry): Recommendation | null {
  const priceMap: Record<string, number> = { free: 0, google_one_ai: 19.99, workspace: 30 };
  const currentSpend = e.monthlySpend || priceMap[e.plan ?? "free"] || 0;
  if (e.plan === "google_one_ai" && currentSpend > 0) {
    const saving = Math.max(0, currentSpend - PRICING.cursor.pro);
    return { toolId: "gemini", toolName: "Gemini (Google One AI)", currentSpend, recommendedAction: "Compare to Cursor Pro ($20/mo) if your primary use is coding", estimatedSaving: saving, savingPercent: Math.max(0, Math.round((saving / currentSpend) * 100)), reasoning: "Google One AI Premium ($19.99/mo) includes Gemini Advanced. If coding is your main use, Cursor Pro ($20/mo) provides a purpose-built IDE experience at the same price.", sourceUrl: PRICING.gemini.source, confidence: "medium" };
  }
  return null;
}

function auditOpenAIApi(e: ToolEntry): Recommendation | null {
  const spend = e.monthlySpend ?? 0;
  if (!spend) return null;
  if (e.model === "gpt-4o" && e.useCase !== "complex_reasoning") {
    const saving = Math.round(spend * PRICING.openai_api.gpt4o_to_mini_ratio);
    return { toolId: "openai_api", toolName: "OpenAI API", currentSpend: spend, recommendedAction: "Switch from GPT-4o to GPT-4o-mini (93% cheaper per token) for non-reasoning tasks", estimatedSaving: saving, savingPercent: 93, reasoning: "OpenAI publishes per-token pricing at openai.com/api/pricing. GPT-4o-mini handles code completion, chat, and document tasks at 93% lower cost with comparable output quality for non-complex workloads.", sourceUrl: PRICING.openai_api.source, confidence: "high" };
  }
  if (!e.usingBatchApi && spend > 100) {
    const saving = Math.round(spend * 0.6 * PRICING.openai_api.batch_discount);
    return { toolId: "openai_api", toolName: "OpenAI API", currentSpend: spend, recommendedAction: "Enable Batch API for async workloads — 50% discount on eligible calls", estimatedSaving: saving, savingPercent: Math.round((saving / spend) * 100), reasoning: "OpenAI's Batch API offers 50% off for requests that don't need real-time responses. Conservatively, ~60% of typical API usage is async-safe (document processing, analysis pipelines).", sourceUrl: PRICING.openai_api.source, confidence: "medium" };
  }
  return null;
}

function auditGroqApi(e: ToolEntry): Recommendation | null {
  const spend = e.monthlySpend ?? 0;
  if (!spend) return null;
  if (e.model === "llama-3.3-70b" && e.useCase !== "complex_reasoning") {
    const saving = Math.round(spend * PRICING.groq_api.llama_to_gemma_ratio);
    return { toolId: "groq_api", toolName: "Groq API", currentSpend: spend, recommendedAction: "Switch from Llama 3.3 70B to Gemma 7B (95% cheaper) for non-reasoning tasks", estimatedSaving: saving, savingPercent: 95, reasoning: "Groq's per-token pricing shows Gemma is significantly cheaper. For simple tasks, it delivers comparable quality at ultra-high speeds.", sourceUrl: PRICING.groq_api.source, confidence: "high" };
  }
  if (e.model === "mixtral-8x7b" && e.useCase === "simple_tasks") {
    const saving = Math.round(spend * PRICING.groq_api.mixtral_to_gemma_ratio);
    return { toolId: "groq_api", toolName: "Groq API", currentSpend: spend, recommendedAction: "Switch from Mixtral 8x7B to Gemma 7B (80% cheaper) for simple task workloads", estimatedSaving: saving, savingPercent: 80, reasoning: "Mixtral is over-spec for simple tasks like formatting and basic Q&A. Gemma handles these at lower cost on Groq.", sourceUrl: PRICING.groq_api.source, confidence: "high" };
  }
  return null;
}

const AUDITORS: Record<string, (e: ToolEntry) => Recommendation | null> = {
  cursor: auditCursor,
  copilot: auditCopilot,
  claude_sub: auditClaudeSub,
  chatgpt_sub: auditChatGPTSub,
  gemini: auditGemini,
  openai_api: auditOpenAIApi,
  groq_api: auditGroqApi,
};

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: Recommendation[] = [];
  let totalCurrentSpend = 0;
  let totalEstimatedSaving = 0;

  for (const entry of input.tools) {
    if (!entry.enabled) continue;
    totalCurrentSpend += entry.monthlySpend ?? 0;
    const rec = AUDITORS[entry.toolId]?.(entry);
    if (rec) { recommendations.push(rec); totalEstimatedSaving += rec.estimatedSaving; }
  }

  return {
    totalCurrentSpend: Math.round(totalCurrentSpend),
    totalEstimatedSaving: Math.round(totalEstimatedSaving),
    recommendations: recommendations.sort((a, b) => b.estimatedSaving - a.estimatedSaving),
    credexCtaVisible: totalEstimatedSaving >= 500,
  };
}
