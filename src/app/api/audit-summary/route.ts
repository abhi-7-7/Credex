import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import type { AuditInput } from "@/types/audit";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    new URL(url); // Validates URL format
    return createClient(url, key);
  } catch {
    console.error("Invalid Supabase URL provided in environment variables");
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body: AuditInput = await req.json();
  const audit = runAudit(body);

  // ── AI summary ─────────────────────────────────────────────────
  let aiSummary = "";
  try {
    const lines = audit.recommendations.map(
      r => `${r.toolName}: save $${r.estimatedSaving}/mo — ${r.recommendedAction}`
    ).join("\n") || "No specific optimisations found — spend appears well-optimised.";

    const msg = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
    aiSummary = msg.choices[0]?.message?.content || "";
  } catch {
    // Fallback — always show results even if AI call fails
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
      // Fail silently to ensure the user still gets their audit results
    }
  }

  return NextResponse.json({ ...audit, aiSummary, auditId, createdAt: new Date().toISOString() });
}
