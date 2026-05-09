import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/auditEngine";
describe("Cursor", () => {
  it("recommends Pro over Business and calculates saving correctly", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:true, plan:"business", seats:3, monthlySpend:120 }] });
    expect(r.recommendations).toHaveLength(1);
    expect(r.recommendations[0].estimatedSaving).toBe(60); // 3 × $20
    expect(r.recommendations[0].confidence).toBe("high");
  });
  it("returns nothing for Pro plan (already optimal)", () => {
    const r = runAudit({ tools: [{ toolId:"cursor", enabled:true, plan:"pro", seats:2, monthlySpend:40 }] });
    expect(r.recommendations).toHaveLength(0);
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
    expect(r.recommendations[0].estimatedSaving).toBe(36); // 4 × $9
    expect(r.recommendations[0].sourceUrl).toContain("github.com");
  });
  it("recommends Business over Enterprise for teams under 10 seats", () => {
    const r = runAudit({ tools: [{ toolId:"copilot", enabled:true, plan:"enterprise", seats:5, monthlySpend:195 }] });
    expect(r.recommendations[0].estimatedSaving).toBe(100); // 5 × $20
  });
});

describe("Claude subscription", () => {
  it("recommends Pro over Team for 3 or fewer seats", () => {
    const r = runAudit({ tools: [{ toolId:"claude_sub", enabled:true, plan:"team", seats:2, monthlySpend:60 }] });
    expect(r.recommendations[0].estimatedSaving).toBe(20); // 2 × $10
  });
});

describe("ChatGPT subscription", () => {
  it("recommends Plus over Team for 3 or fewer seats", () => {
    const r = runAudit({ tools: [{ toolId:"chatgpt_sub", enabled:true, plan:"team", seats:3, monthlySpend:90 }] });
    expect(r.recommendations[0].estimatedSaving).toBe(30); // 3 × $10
  });
});

describe("OpenAI API", () => {
  it("recommends gpt-4o-mini for non-reasoning tasks on gpt-4o", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"document_processing", usingBatchApi:false, monthlySpend:1000 }] });
    expect(r.recommendations[0].estimatedSaving).toBe(930);
    expect(r.recommendations[0].confidence).toBe("high");
  });
  it("does NOT recommend downgrade for complex_reasoning", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"complex_reasoning", usingBatchApi:true, monthlySpend:500 }] });
    expect(r.recommendations).toHaveLength(0);
  });
  it("recommends Batch API when not in use and spend > $100", () => {
    const r = runAudit({ tools: [{ toolId:"openai_api", enabled:true, model:"gpt-4o-mini", useCase:"chat_assistant", usingBatchApi:false, monthlySpend:500 }] });
    expect(r.recommendations[0].estimatedSaving).toBeGreaterThan(0);
  });
});

describe("Groq API", () => {
  it("recommends Gemma for Llama on non-reasoning tasks", () => {
    const r = runAudit({ tools: [{ toolId:"groq_api", enabled:true, model:"llama-3.3-70b", useCase:"chat_assistant", usingPromptCaching:false, monthlySpend:2000 }] });
    expect(r.recommendations[0].estimatedSaving).toBe(1900);
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
      { toolId:"cursor",     enabled:true, plan:"business", seats:1, monthlySpend:40 },
      { toolId:"openai_api", enabled:true, model:"gpt-4o", useCase:"simple_tasks", usingBatchApi:false, monthlySpend:500 },
    ]});
    expect(r.recommendations[0].estimatedSaving).toBeGreaterThan(r.recommendations[1].estimatedSaving);
  });
  it("sums total current spend correctly", () => {
    const r = runAudit({ tools: [
      { toolId:"cursor",  enabled:true, plan:"pro", seats:1, monthlySpend:20 },
      { toolId:"copilot", enabled:true, plan:"individual", seats:1, monthlySpend:10 },
    ]});
    expect(r.totalCurrentSpend).toBe(30);
  });
});
