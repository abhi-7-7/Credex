import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import type { AuditInput } from "@/types/audit";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    new URL(url);
    return createClient(url, key);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body: AuditInput = await req.json();
  const audit = runAudit(body);

  // ── AI summary via Anthropic claude-haiku ──────────────────────
  let aiSummary = "";
  try {
    const lines = audit.recommendations
      .map(r => `${r.toolName}: save $${r.estimatedSaving}/mo — ${r.recommendedAction}`)
      .join("\n") || "No specific optimisations found — spend appears well-optimised.";

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 180,
      messages: [{
        role: "user",
        content: `You are an expert startup CFO advisor. Write a concise ~100-word personalised audit summary based on these findings:

Total current AI spend: $${audit.totalCurrentSpend}/month
Total estimated savings: $${audit.totalEstimatedSaving}/month

Top recommendations:
${lines}

Rules: second person ("your team", "you're currently"). Specific numbers. End with one concrete next action. Flowing paragraph only — no bullet points.`,
      }],
    });
    aiSummary = msg.content[0].type === "text" ? msg.content[0].text : "";
  } catch {
    const top = audit.recommendations[0];
    aiSummary = `Your team is spending $${audit.totalCurrentSpend}/month across AI tools, with an estimated $${audit.totalEstimatedSaving}/month in identified savings.${top ? ` The biggest opportunity is ${top.recommendedAction} — saving ~$${top.estimatedSaving}/month.` : ""} Review the recommendations below and act on the highest-confidence items first.`;
  }

  // ── Store in Supabase ───────────────────────────────────────────
  const auditId = randomUUID();
  const db = supabase();
  if (db) {
    try {
      await db.from("audit_results").insert({
        id: auditId,
        result: audit,
        ai_summary: aiSummary,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Supabase insert failed:", e);
    }
  }

  return NextResponse.json({ ...audit, aiSummary, auditId, createdAt: new Date().toISOString() });
}
