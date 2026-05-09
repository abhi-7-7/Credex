import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { AuditResult } from "@/types/audit";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

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
  const { email, auditResult }: { email: string; auditResult: AuditResult & { aiSummary?: string } } = await req.json();

  if (!email?.includes("@")) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  // Store lead
  const db = supabase();
  if (db) {
    try {
      await db.from("leads").insert({
        email,
        audit_id: auditResult.auditId,
        total_spend: auditResult.totalCurrentSpend,
        total_saving: auditResult.totalEstimatedSaving,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Supabase lead insert failed:", e);
    }
  }

  // Send email
  const top = auditResult.recommendations[0];
  try {
    await resend.emails.send({
      from: "Credex Audit <audit@credex.ai>",
      to: email,
      subject: `Your AI Spend Audit — $${auditResult.totalEstimatedSaving.toLocaleString()}/mo in savings identified`,
      html: `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0a0f1e;color:#e2e8f0;margin:0;padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;">
  <div style="font-size:20px;font-weight:700;margin-bottom:32px;">⚡ Credex Audit</div>
  <h1 style="font-size:26px;font-weight:700;margin-bottom:8px;">Your AI Spend Report</h1>
  <p style="color:#94a3b8;margin-bottom:32px;">Here's what we found.</p>

  <div style="background:#111827;border:1px solid #1e293b;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
    <p style="color:#818cf8;font-size:13px;margin-bottom:8px;">ESTIMATED MONTHLY SAVINGS</p>
    <p style="font-size:52px;font-weight:700;color:#6366f1;margin:0;">$${auditResult.totalEstimatedSaving.toLocaleString()}</p>
    <p style="color:#64748b;font-size:13px;margin-top:8px;">on your current $${auditResult.totalCurrentSpend.toLocaleString()}/month spend</p>
  </div>

  ${top ? `
  <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px;">
    <p style="font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">TOP RECOMMENDATION</p>
    <p style="font-weight:600;margin-bottom:6px;">${top.toolName} · Save $${top.estimatedSaving}/mo</p>
    <p style="color:#94a3b8;font-size:14px;margin-bottom:10px;">${top.recommendedAction}</p>
    <a href="${top.sourceUrl}" style="color:#818cf8;font-size:13px;">Verify pricing ↗</a>
  </div>` : ""}

  ${auditResult.aiSummary ? `
  <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px;">
    <p style="font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">AI ANALYSIS</p>
    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;">${auditResult.aiSummary}</p>
  </div>` : ""}

  ${auditResult.credexCtaVisible ? `
  <div style="text-align:center;margin-bottom:32px;">
    <a href="https://credex.ai" style="background:#6366f1;color:#fff;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;display:inline-block;">
      Stack more savings with Credex →
    </a>
  </div>` : ""}

  <p style="color:#475569;font-size:12px;border-top:1px solid #1e293b;padding-top:20px;">
    Credex AI Spend Audit · Pricing data sourced from official vendor pages · You requested this report.
  </p>
</div>
</body></html>`,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  return NextResponse.json({ success: true });
}
