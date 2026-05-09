import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const saving  = Number(searchParams.get("saving")  ?? 0);
  const spend   = Number(searchParams.get("spend")   ?? 0);
  const percent = spend > 0 ? Math.round((saving / spend) * 100) : 0;

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0f1e"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#g)"/>
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="#111827" stroke="#1e293b" stroke-width="1.5"/>
  <text x="100" y="140" font-size="20" font-weight="600" fill="#818cf8" font-family="system-ui,sans-serif">⚡ Credex AI Spend Audit</text>
  <text x="100" y="250" font-size="80" font-weight="700" fill="#6366f1" font-family="system-ui,sans-serif">$${saving.toLocaleString()}/mo</text>
  <text x="100" y="305" font-size="28" fill="#94a3b8" font-family="system-ui,sans-serif">in savings identified</text>
  <rect x="100" y="360" width="320" height="76" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="260" y="392" font-size="12" fill="#64748b" text-anchor="middle" font-family="system-ui,sans-serif">CURRENT SPEND</text>
  <text x="260" y="420" font-size="24" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="system-ui,sans-serif">$${spend.toLocaleString()}/mo</text>
  <rect x="440" y="360" width="320" height="76" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="600" y="392" font-size="12" fill="#64748b" text-anchor="middle" font-family="system-ui,sans-serif">REDUCTION</text>
  <text x="600" y="420" font-size="24" font-weight="600" fill="#34d399" text-anchor="middle" font-family="system-ui,sans-serif">${percent}%</text>
  <rect x="780" y="360" width="300" height="76" rx="12" fill="#4f46e5"/>
  <text x="930" y="406" font-size="18" font-weight="600" fill="white" text-anchor="middle" font-family="system-ui,sans-serif">Run your free audit →</text>
  <text x="100" y="548" font-size="15" fill="#475569" font-family="system-ui,sans-serif">Verified against official vendor pricing · credex-audit.vercel.app</text>
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
