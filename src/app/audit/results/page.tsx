"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, Mail, CheckCircle, ExternalLink, Zap, ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import type { AuditResult } from "@/types/audit";

const LABELS: Record<string,string> = { cursor:"Cursor", copilot:"Copilot", claude_sub:"Claude", chatgpt_sub:"ChatGPT", gemini:"Gemini", openai_api:"OpenAI API", anthropic_api:"Anthropic API", windsurf:"Windsurf" };
const COLORS = ["#0052FF", "#3f4f65", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const CONF   = { high:"text-emerald-700 bg-emerald-50 border border-emerald-200", medium:"text-yellow-700 bg-yellow-50 border border-yellow-200", low:"text-slate-600 bg-slate-50 border border-slate-200" } as const;

type Full = AuditResult & { aiSummary?: string };

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-text-muted text-[14px]">Loading your audit…</p>
      </div>
    </div>
  );
}

function Results() {
  const params  = useSearchParams();
  const id      = params.get("id");
  const [result, setResult]             = useState<Full|null>(null);
  const [err,    setErr]                = useState(false);
  const [email,  setEmail]              = useState("");
  const [sent,   setSent]               = useState(false);
  const [sending,setSending]            = useState(false);
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    const s = sessionStorage.getItem("auditResult");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) { setResult(JSON.parse(s)); return; }
    if (!id) { setErr(true); return; }
    fetch(`/api/share/${id}`).then(r => r.ok ? r.json() : Promise.reject()).then(setResult).catch(() => setErr(true));
  }, [id]);

  async function sendEmail() {
    if (!email||!result) return;
    setSending(true);
    await fetch("/api/capture-lead",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,auditResult:result}) });
    setSent(true); setSending(false);
  }

  async function share() {
    await navigator.clipboard.writeText(`${window.location.origin}/audit/results?id=${result?.auditId}`);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }

  if (err) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-bg">
      <div className="text-center">
        <h1 className="text-[24px] font-semibold mb-3 tracking-[-0.01em] text-brand-text">Audit not found</h1>
        <p className="text-brand-text-muted text-[14px] mb-6">This link may have expired.</p>
        <Link href="/audit" className="btn-primary">Run a new audit</Link>
      </div>
    </div>
  );

  if (!result) return <Spinner />;

  const pct  = result.totalCurrentSpend > 0 ? Math.round((result.totalEstimatedSaving/result.totalCurrentSpend)*100) : 0;
  const bars = result.recommendations.map(r => ({ name: LABELS[r.toolId]??r.toolId, saving: r.estimatedSaving }));

  return (
    <main className="min-h-screen px-4 py-12 bg-brand-bg">
      <div className="max-w-3xl mx-auto">

        {/* Brand bar */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/audit" className="text-brand-text-muted hover:text-brand-text transition-colors" aria-label="Back">
            <ArrowLeft size={18}/>
          </Link>
          <div className="flex items-center gap-1.5 text-brand-text-muted text-[14px] font-medium">
            <Zap size={14} className="text-brand-blue"/> Credex Audit · Results
          </div>
        </div>

        {/* ── Hero card ───────────────────────────────── */}
        <div className="card mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-brand-blue text-[12px] font-semibold uppercase tracking-[0.05em] mb-4">
            <TrendingDown size={14}/> Estimated monthly savings
          </div>
          <div className="text-[72px] font-bold text-brand-text mb-2 tabular-nums tracking-[-0.02em] leading-tight">
            ${result.totalEstimatedSaving.toLocaleString()}
            <span className="text-[24px] text-brand-text-muted font-normal ml-1">/mo</span>
          </div>
          <p className="text-brand-text-muted text-[14px] mb-6 font-medium">
            {pct}% of your current ${result.totalCurrentSpend.toLocaleString()}/month AI spend
          </p>
          <button onClick={share} className="btn-ghost text-[13px] inline-flex items-center gap-2">
            <Copy size={14}/> {copied ? "Link copied!" : "Share this report"}
          </button>
        </div>

        {/* ── AI Summary ──────────────────────────────── */}
        {result.aiSummary && (
          <div className="card mb-6 bg-slate-50/50">
            <div className="text-[12px] text-brand-blue font-semibold uppercase tracking-[0.05em] mb-3">AI Analysis</div>
            <p className="text-brand-text leading-[1.6] text-[14px]">{result.aiSummary}</p>
          </div>
        )}

        {/* ── Chart ───────────────────────────────────── */}
        {bars.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold text-[16px] text-brand-text mb-6">Savings breakdown by tool</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bars} barSize={40} margin={{top:0,right:0,left:0,bottom:0}}>
                <XAxis dataKey="name" tick={{fill:"#64748b",fontSize:12,fontFamily:"Inter"}} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{fill:"#64748b",fontSize:12,fontFamily:"Inter"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={50}/>
                <Tooltip contentStyle={{background:"#ffffff",border:"1px solid #E2E8F0",borderRadius:4,color:"#0F172A",fontSize:13,boxShadow:"0 4px 6px -1px rgb(0 0 0 / 0.05)"}}
                  formatter={(v:any)=>[`$${v.toLocaleString()}/mo`,"Est. saving"]} /* eslint-disable-line @typescript-eslint/no-explicit-any */ />
                <Bar dataKey="saving" radius={[4,4,0,0]}>
                  {bars.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Recommendations ─────────────────────────── */}
        <div className="flex flex-col gap-4 mb-8">
          <h2 className="font-semibold text-[12px] text-brand-text-muted uppercase tracking-[0.05em]">Recommendations</h2>

          {result.recommendations.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="text-emerald-600 mx-auto mb-4" size={40}/>
              <h3 className="font-semibold text-[18px] text-brand-text mb-2">Your spend looks optimised!</h3>
              <p className="text-brand-text-muted text-[14px] max-w-xs mx-auto leading-[1.6]">No significant savings found with your current selections.</p>
            </div>
          ) : result.recommendations.map((rec,i) => (
            <article key={i} className="card">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-semibold text-[16px] text-brand-text">{rec.toolName}</h3>
                  <div className="text-[13px] text-brand-text-muted mt-1 font-medium">${rec.currentSpend.toLocaleString()}/mo current</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-emerald-600 font-bold text-[24px] tabular-nums leading-none mb-2">
                    −${rec.estimatedSaving.toLocaleString()}<span className="text-[14px] font-normal text-emerald-700/70 ml-1">/mo</span>
                  </div>
                  <span className={`text-[12px] px-2.5 py-1 rounded font-medium ${CONF[rec.confidence]}`}>{rec.confidence} confidence</span>
                </div>
              </div>
              <p className="text-[14px] font-semibold text-brand-text mb-2">{rec.recommendedAction}</p>
              <p className="text-[14px] text-brand-text-muted leading-[1.6] mb-4">{rec.reasoning}</p>
              <a href={rec.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-[13px] text-brand-blue hover:text-brand-blue-hover font-medium flex items-center gap-1 transition-colors w-fit">
                Verify pricing <ExternalLink size={14}/>
              </a>
            </article>
          ))}
        </div>

        {/* ── Credex CTA — $500+ only ──────────────────── */}
        {result.credexCtaVisible && (
          <div className="card border-brand-blue/30 bg-blue-50/40 mb-8 text-center shadow-sm">
            <div className="text-[12px] text-brand-blue font-semibold uppercase tracking-[0.05em] mb-3">Take it further with Credex</div>
            <h2 className="text-[24px] font-semibold text-brand-text mb-3 tracking-[-0.01em]">Stack more savings with discounted AI credits</h2>
            <p className="text-brand-text-muted text-[14px] leading-[1.6] mb-6 max-w-md mx-auto">
              The audit above finds plan optimisations. Credex unlocks discounted API credits on top — typically 15–30% additional saving for high-volume teams.
            </p>
            <a href="https://credex.ai" target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 shadow-sm">
              See Credex pricing <ExternalLink size={16}/>
            </a>
          </div>
        )}

        {/* ── Email capture ────────────────────────────── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-brand-blue"/> <h2 className="font-semibold text-[18px] text-brand-text tracking-[-0.01em]">Get this report by email</h2>
          </div>
          {sent ? (
            <div className="flex items-center gap-2 text-emerald-600 text-[14px] font-medium"><CheckCircle size={16}/> Sent — check your inbox.</div>
          ) : (
            <>
              <div className="flex gap-3">
                <input type="email" placeholder="you@startup.com" className="input flex-1 shadow-sm" value={email}
                  onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendEmail()}
                  autoCapitalize="none" autoComplete="email" aria-label="Email address"/>
                <button onClick={sendEmail} disabled={sending||!email} className="btn-primary whitespace-nowrap shadow-sm">
                  {sending?"Sending…":"Send report"}
                </button>
              </div>
              <p className="text-[13px] text-slate-500 mt-3 font-medium">One email only. No spam. No account created.</p>
            </>
          )}
        </div>

      </div>
    </main>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<Spinner/>}><Results/></Suspense>;
}
