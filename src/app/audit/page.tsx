"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronDown, ChevronUp, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditInput, ToolEntry, ToolId, UseCase } from "@/types/audit";

const TOOLS = [
  { id: "cursor"        as ToolId, name: "Cursor",                  emoji: "⬛", hint: "AI code editor",             isApi: false },
  { id: "copilot"       as ToolId, name: "GitHub Copilot",          emoji: "🐙", hint: "Code completion in IDE",      isApi: false },
  { id: "claude_sub"    as ToolId, name: "Claude (subscription)",   emoji: "🔶", hint: "Anthropic Pro / Team plans",  isApi: false },
  { id: "chatgpt_sub"   as ToolId, name: "ChatGPT",                 emoji: "🟢", hint: "OpenAI Plus / Team plans",    isApi: false },
  { id: "gemini"        as ToolId, name: "Gemini",                  emoji: "💎", hint: "Google AI assistant",         isApi: false },
  { id: "windsurf"      as ToolId, name: "Windsurf",                emoji: "🌊", hint: "AI IDE by Codeium",           isApi: false },
  { id: "openai_api"    as ToolId, name: "OpenAI API",              emoji: "⚡", hint: "Billed per token",            isApi: true  },
  { id: "anthropic_api" as ToolId, name: "Anthropic API",           emoji: "🔶", hint: "Claude API, billed per token", isApi: true  },
];

const PLANS: Record<string, { value: string; label: string }[]> = {
  cursor:     [{ value:"hobby", label:"Hobby – Free" },{ value:"pro", label:"Pro – $20/seat" },{ value:"business", label:"Business – $40/seat" }],
  copilot:    [{ value:"individual", label:"Individual – $10/seat" },{ value:"business", label:"Business – $19/seat" },{ value:"enterprise", label:"Enterprise – $39/seat" }],
  claude_sub: [{ value:"pro", label:"Pro – $20/seat" },{ value:"team", label:"Team – $30/seat" },{ value:"enterprise", label:"Enterprise – Custom" }],
  chatgpt_sub:[{ value:"plus", label:"Plus – $20/seat" },{ value:"team", label:"Team – $30/seat" },{ value:"enterprise", label:"Enterprise – Custom" }],
  gemini:     [{ value:"free", label:"Free" },{ value:"google_one_ai", label:"Google One AI Premium – $19.99/mo" },{ value:"workspace", label:"Workspace AI add-on – ~$30/seat" }],
  windsurf:   [{ value:"free", label:"Free" },{ value:"pro", label:"Pro – $15/seat" },{ value:"team", label:"Team – $35/seat" }],
};

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai_api:    [{ value:"gpt-4o", label:"GPT-4o" },{ value:"gpt-4o-mini", label:"GPT-4o mini" },{ value:"gpt-4-turbo", label:"GPT-4 Turbo" },{ value:"gpt-3.5-turbo", label:"GPT-3.5 Turbo" }],
  anthropic_api: [{ value:"claude-opus-4", label:"Claude Opus 4" },{ value:"claude-sonnet-4", label:"Claude Sonnet 4" },{ value:"claude-haiku-4", label:"Claude Haiku 4" }],
};

const USE_CASES: { value: UseCase; label: string }[] = [
  { value:"code_completion",    label:"Code completion / autocomplete" },
  { value:"chat_assistant",     label:"Chat / Q&A assistant" },
  { value:"document_processing",label:"Document processing / summarisation" },
  { value:"simple_tasks",       label:"Simple tasks / formatting" },
  { value:"complex_reasoning",  label:"Complex reasoning / analysis" },
];

const STORAGE_KEY = "credex_audit_form";

function mkEntry(toolId: ToolId): ToolEntry {
  return { toolId, enabled:false, plan:PLANS[toolId]?.[1]?.value, seats:1, monthlySpend:0, model:MODELS[toolId]?.[0]?.value, useCase:undefined, usingBatchApi:false, usingPromptCaching:false };
}

function loadSavedEntries(): Record<ToolId, ToolEntry> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function AuditPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Record<ToolId, ToolEntry>>(
    () => loadSavedEntries() ?? Object.fromEntries(TOOLS.map(t => [t.id, mkEntry(t.id)])) as Record<ToolId, ToolEntry>
  );
  const [expanded, setExpanded] = useState<ToolId | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  // Persist form state across page reloads
  const saveEntries = useCallback((e: Record<ToolId, ToolEntry>) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(e)); } catch { /* quota exceeded — ignore */ }
  }, []);

  useEffect(() => { saveEntries(entries); }, [entries, saveEntries]);

  const activeCount = Object.values(entries).filter(e => e.enabled).length;

  function toggleTool(id: ToolId) {
    const next = !entries[id].enabled;
    setEntries(p => ({ ...p, [id]: { ...p[id], enabled: next } }));
    setExpanded(next ? id : expanded === id ? null : expanded);
  }

  function upd<K extends keyof ToolEntry>(id: ToolId, k: K, v: ToolEntry[K]) {
    setEntries(p => ({ ...p, [id]: { ...p[id], [k]: v } }));
  }

  async function submit() {
    if (!activeCount) { setError("Enable at least one tool."); return; }
    setError(null); setLoading(true);
    try {
      const res  = await fetch("/api/audit-summary", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tools: Object.values(entries) } as AuditInput) });
      if (!res.ok) throw new Error("Audit failed — please try again.");
      const data = await res.json();
      sessionStorage.setItem("auditResult", JSON.stringify(data));
      router.push(`/audit/results?id=${data.auditId}`);
    } catch(e) { setError(e instanceof Error ? e.message : "Something went wrong."); setLoading(false); }
  }

  return (
    <main className="min-h-screen px-4 py-12 pb-32 bg-brand-bg">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-2 text-brand-text-muted text-[14px] font-medium mb-2 uppercase tracking-[0.05em]">
          <Zap size={15} className="text-brand-blue" /> Credex Audit
        </div>
        <h1 className="text-[36px] font-bold mb-1 text-brand-text tracking-[-0.02em]">Your AI spend</h1>
        <p className="text-brand-text-muted text-[14px] mb-10 leading-[1.6]">Toggle each tool your team uses, fill in the details, and we&apos;ll find every saving.</p>

        {/* Tool list */}
        <div className="flex flex-col gap-3">
          {TOOLS.map(tool => {
            const e      = entries[tool.id];
            const isOpen = expanded === tool.id && e.enabled;
            return (
              <div key={tool.id} className={cn("card transition-all shadow-sm", e.enabled && "border-brand-blue shadow-md ring-1 ring-brand-blue/10")}>

                {/* Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{tool.emoji}</span>
                    <div>
                      <div className="font-semibold text-[16px] text-brand-text">{tool.name}</div>
                      <div className="text-[13px] text-brand-text-muted font-medium">{tool.hint}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {e.enabled && (
                      <button onClick={() => setExpanded(isOpen ? null : tool.id)} aria-label="Toggle details"
                        className="text-slate-400 hover:text-brand-text transition-colors p-1">
                        {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                      </button>
                    )}
                    {/* Toggle switch */}
                    <button role="switch" aria-checked={e.enabled} aria-label={`Toggle ${tool.name}`}
                      onClick={() => toggleTool(tool.id)}
                      className={cn("relative w-[44px] h-[24px] rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-blue", e.enabled ? "bg-brand-blue" : "bg-slate-300")}>
                      <span aria-hidden className={cn("absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-all", e.enabled ? "left-[22px]" : "left-[2px]")} />
                    </button>
                  </div>
                </div>

                {/* Expanded fields */}
                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-brand-border grid grid-cols-2 gap-4">

                    {!tool.isApi ? (
                      <>
                        <div>
                          <label className="label" htmlFor={`plan-${tool.id}`}>Plan</label>
                          <select id={`plan-${tool.id}`} className="input" value={e.plan??""} onChange={ev => upd(tool.id,"plan",ev.target.value)}>
                            {PLANS[tool.id]?.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor={`seats-${tool.id}`}>Active seats</label>
                          <input id={`seats-${tool.id}`} type="number" min={1} className="input" value={e.seats??1}
                            onChange={ev => upd(tool.id,"seats",Math.max(1,Number(ev.target.value)))} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="label" htmlFor={`model-${tool.id}`}>Primary model</label>
                          <select id={`model-${tool.id}`} className="input" value={e.model??""} onChange={ev => upd(tool.id,"model",ev.target.value)}>
                            {MODELS[tool.id]?.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor={`uc-${tool.id}`}>Primary use case</label>
                          <select id={`uc-${tool.id}`} className="input" value={e.useCase??""} onChange={ev => upd(tool.id,"useCase",ev.target.value as UseCase)}>
                            <option value="">Select…</option>
                            {USE_CASES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </select>
                        </div>
                        {tool.id === "openai_api" && (
                          <label className="col-span-2 flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="accent-brand-blue w-4 h-4" checked={e.usingBatchApi??false}
                              onChange={ev => upd(tool.id,"usingBatchApi",ev.target.checked)} />
                            <span className="text-[14px] text-brand-text font-medium">Already using Batch API (50% discount)</span>
                          </label>
                        )}
                        {tool.id === "anthropic_api" && (
                          <label className="col-span-2 flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="accent-brand-blue w-4 h-4" checked={e.usingPromptCaching??false}
                              onChange={ev => upd(tool.id,"usingPromptCaching",ev.target.checked)} />
                            <span className="text-[14px] text-brand-text font-medium">Already using prompt caching</span>
                          </label>
                        )}
                      </>
                    )}

                    {/* Monthly spend — always shown */}
                    <div className="col-span-2">
                      <label className="label" htmlFor={`spend-${tool.id}`}>Monthly spend (USD)</label>
                      <div className="relative">
                        <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted text-[14px] font-medium select-none">$</span>
                        <input id={`spend-${tool.id}`} type="number" min={0} className="input pl-7" placeholder="0"
                          value={e.monthlySpend||""} onChange={ev => upd(tool.id,"monthlySpend",Math.max(0,Number(ev.target.value)))} />
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Popup */}
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-brand-surface rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] w-full max-w-md p-6 border border-brand-border">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle size={20} />
                </div>
                <button onClick={() => setError(null)} className="text-slate-400 hover:text-brand-text p-1 rounded-full hover:bg-slate-50 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-[18px] font-bold text-brand-text mb-2">Audit couldn&apos;t be completed</h3>
              <p className="text-[14px] text-brand-text-muted mb-5 leading-relaxed">
                {error}
              </p>

              <div className="bg-brand-input-bg rounded-lg p-4 mb-6 border border-brand-border">
                <h4 className="text-[12px] font-semibold text-brand-text mb-2 uppercase tracking-[0.05em]">How to fix this</h4>
                <ul className="text-[13px] text-brand-text-muted list-disc pl-4 space-y-1.5 leading-relaxed">
                  {error.includes("one tool") ? (
                    <li>Toggle the switch to <span className="font-medium text-brand-text">ON</span> for at least one AI tool on the dashboard.</li>
                  ) : (
                    <>
                      <li>Check your internet connection and verify you aren&apos;t offline.</li>
                      <li>Ensure your <code className="bg-slate-200 px-1 py-0.5 rounded text-brand-text">ANTHROPIC_API_KEY</code> is properly configured in your <code className="bg-slate-200 px-1 py-0.5 rounded text-brand-text">.env.local</code> file.</li>
                      <li>Try submitting the audit form again.</li>
                    </>
                  )}
                </ul>
              </div>

              <button onClick={() => setError(null)} className="btn-primary w-full shadow-sm text-[15px]">
                Dismiss & Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 inset-x-0 px-4 pb-6 pt-4 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          <button onClick={submit} disabled={loading||activeCount===0} className="btn-primary w-full flex items-center justify-center gap-2 text-[16px] shadow-sm">
            {loading ? (
              <><span aria-hidden className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analysing your spend…</>
            ) : (
              <>Run Audit {activeCount>0 && <span className="bg-white/20 text-[12px] px-2 py-0.5 rounded font-semibold">{activeCount} tool{activeCount!==1?"s":""}</span>}</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
