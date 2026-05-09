import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });

  const resolvedParams = await params;
  const db = createClient(url, key);
  const { data, error } = await db
    .from("audit_results")
    .select("result, ai_summary, created_at")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...data.result, aiSummary: data.ai_summary, auditId: resolvedParams.id, createdAt: data.created_at });
}
