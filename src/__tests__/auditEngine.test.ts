import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/auditEngine";

describe("Cursor", () => {
  it("recommends Pro over Business and calculates saving correctly", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:true, plan:"business", seats:3, monthlySpend:120 }] });
    expect(r.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(r.recommendations.find(x => x.estimatedSaving === 60)).toBeTruthy();
  });
  it("returns nothing for Pro plan at correct price", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:true, plan:"pro", seats:2, monthlySpend:40 }] });
    expect(r.recommendations).toHaveLength(0);
  });
  it("flags overspend when actual spend exceeds list price", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:true, plan:"pro", seats:2, monthlySpend:100 }] });
    expect(r.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(r.recommendations[0].estimatedSaving).toBe(60); // 100 - 40
  });
  it("skips disabled tools completely", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:false, plan:"business", seats:10, monthlySpend:400 }] });
    expect(r.recommendations).toHaveLength(0);
    expect(r.totalCurrentSpend).toBe(0);
  });
});

describe("Copilot", () => {
  it("recommends Individual over Business for teams under 5 seats", () => {
    const r = runAudit({ tools: [{ toolId:"copilot", enabled:true, plan:"business", seats:4, monthlySpend:76 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 36)).toBeTruthy();
    expect(r.recommendations[0].sourceUrl).toContain("github.com");
  });
  it("recommends Business over Enterprise for teams under 10 seats", () => {
    const r = runAudit({ tools: [{ toolId:"copilot", enabled:true, plan:"enterprise", seats:5, monthlySpend:195 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 100)).toBeTruthy();
  });
});

describe("Claude subscription", () => {
  it("recommends Pro over Team for 3 or fewer seats", () => {
    const r = runAudit({ tools: [{ toolId:"claude_sub", enabled:true, plan:"team", seats:2, monthlySpend:60 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 20)).toBeTruthy();
  });
  it("suggests annual billing for larger teams", () => {
    const r = runAudit({ tools: [{ toolId:"claude_sub", enabled:true, plan:"team", seats:5, monthlySpend:150 }] });
    expect(r.recommendations.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ChatGPT subscription", () => {
  it("recommends Plus over Team for 3 or fewer seats", () => {
    const r = runAudit({ tools: [{ toolId:"chatgpt_sub", enabled:true, plan:"team", seats:3, monthlySpend:90 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 30)).toBeTruthy();
  });
});

describe("OpenAI API", () => {
  it("recommends gpt-4o-mini for non-reasoning tasks on gpt-4o", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"document_processing", usingBatchApi:false, monthlySpend:1000 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 930)).toBeTruthy();
  });
  it("does NOT recommend model downgrade for complex_reasoning", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"complex_reasoning", usingBatchApi:true, monthlySpend:500 }] });
    expect(r.recommendations).toHaveLength(0);
  });
  it("recommends Batch API when not in use and spend > $100", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o-mini", useCase:"chat_assistant", usingBatchApi:false, monthlySpend:500 }] });
    expect(r.recommendations[0].estimatedSaving).toBeGreaterThan(0);
  });
  it("flags GPT-4 Turbo as legacy model", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4-turbo", useCase:"chat_assistant", usingBatchApi:false, monthlySpend:200 }] });
    expect(r.recommendations.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Anthropic API", () => {
  it("recommends Haiku for Opus on non-reasoning tasks", () => {
    const r = runAudit({ tools: [{ toolId:"anthropic_api", enabled:true, model:"claude-opus-4", useCase:"chat_assistant", usingPromptCaching:false, monthlySpend:2000 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 1900)).toBeTruthy();
  });
  it("recommends Haiku for Sonnet on non-reasoning tasks", () => {
    const r = runAudit({ tools: [{ toolId:"anthropic_api", enabled:true, model:"claude-sonnet-4", useCase:"chat_assistant", usingPromptCaching:false, monthlySpend:1000 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 800)).toBeTruthy();
  });
  it("recommends prompt caching when not in use", () => {
    const r = runAudit({ tools: [{ toolId:"anthropic_api", enabled:true, model:"claude-haiku-4", useCase:"chat_assistant", usingPromptCaching:false, monthlySpend:200 }] });
    expect(r.recommendations[0].estimatedSaving).toBeGreaterThan(0);
  });
});

describe("Windsurf", () => {
  it("recommends Pro over Team for small teams", () => {
    const r = runAudit({ tools: [{ toolId:"windsurf", enabled:true, plan:"team", seats:3, monthlySpend:105 }] });
    expect(r.recommendations.find(x => x.estimatedSaving === 60)).toBeTruthy();
  });
  it("returns nothing for Pro plan at correct price", () => {
    const r = runAudit({ tools: [{ toolId:"windsurf", enabled:true, plan:"pro", seats:2, monthlySpend:30 }] });
    expect(r.recommendations).toHaveLength(0);
  });
});

describe("Cross-tool overlap", () => {
  it("detects Cursor + Copilot redundancy", () => {
    const r = runAudit({ tools: [
      { toolId:"cursor", enabled:true, plan:"pro", seats:1, monthlySpend:20 },
      { toolId:"copilot", enabled:true, plan:"individual", seats:1, monthlySpend:10 },
    ]});
    expect(r.recommendations.find(x => x.toolName.includes("overlap"))).toBeTruthy();
  });
});

describe("Aggregate logic", () => {
  it("shows Credex CTA when savings >= $500", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"simple_tasks", usingBatchApi:false, monthlySpend:1000 }] });
    expect(r.credexCtaVisible).toBe(true);
  });
  it("hides Credex CTA when savings < $500", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:true, plan:"business", seats:1, monthlySpend:40 }] });
    expect(r.credexCtaVisible).toBe(false);
  });
  it("sorts recommendations by saving descending", () => {
    const r = runAudit({ tools: [
      { toolId:"cursor", enabled:true, plan:"business", seats:1, monthlySpend:40 },
      { toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"simple_tasks", usingBatchApi:false, monthlySpend:500 },
    ]});
    expect(r.recommendations[0].estimatedSaving).toBeGreaterThanOrEqual(r.recommendations[1].estimatedSaving);
  });
  it("sums total current spend correctly", () => {
    const r = runAudit({ tools: [
      { toolId:"cursor", enabled:true, plan:"pro", seats:1, monthlySpend:20 },
      { toolId:"copilot", enabled:true, plan:"individual", seats:1, monthlySpend:10 },
    ]});
    expect(r.totalCurrentSpend).toBe(30);
  });
});
