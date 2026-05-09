import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingDown, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="border-b border-brand-border px-6 py-4 flex items-center justify-between bg-brand-surface">
        <div className="flex items-center gap-2 font-bold text-[18px] tracking-[-0.01em] text-brand-text">
          <Zap className="text-brand-blue" size={20} />
          Credex <span className="text-brand-text-muted font-normal text-[14px] ml-1">Audit</span>
        </div>
        <Link href="/audit" className="btn-primary text-[14px] py-2 px-4 shadow-sm">
          Run Free Audit
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 flex-1">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-brand-blue/20 rounded-full px-4 py-1.5 text-[12px] font-medium text-brand-blue mb-8 uppercase tracking-[0.05em]">
          <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
          Free · 60 seconds · No signup required
        </div>

        <h1 className="text-[48px] sm:text-[60px] font-bold leading-[1.2] tracking-[-0.02em] text-brand-text mb-6 max-w-3xl">
          Your startup is{" "}
          <span className="text-brand-blue">overpaying for AI.</span>
          <br />Find out by how much.
        </h1>

        <p className="text-brand-text-muted text-[18px] max-w-xl mb-10 leading-[1.6]">
          Enter your current AI tool subscriptions. We&apos;ll audit every line
          against official published pricing and show you exactly where money is leaking.
        </p>

        <Link href="/audit" className="btn-primary text-[16px] inline-flex items-center gap-2 shadow-sm h-12 px-8">
          Start Free Audit <ArrowRight size={18} />
        </Link>

        <ul className="mt-8 flex flex-wrap justify-center gap-4">
          {[
            "Logic-based — not AI guesses",
            "Verified against official vendor pricing",
            "Every number is citable",
            "No account needed",
          ].map((t) => (
            <li key={t} className="flex items-center gap-1.5 text-brand-text-muted font-medium text-[14px]">
              <CheckCircle size={14} className="text-brand-blue" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Stats ───────────────────────────────────────── */}
      <section className="border-t border-brand-border px-6 py-14 bg-brand-surface">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { val: "$2,400+", label: "Average annual savings per startup" },
            { val: "7 tools", label: "Cursor · Copilot · Claude · ChatGPT · Gemini · APIs" },
            { val: "100%", label: "Logic-based · verified against official pricing" },
          ].map((s) => (
            <div key={s.val}>
              <div className="text-[36px] font-bold text-brand-blue mb-2 tracking-[-0.02em]">{s.val}</div>
              <div className="text-brand-text-muted text-[14px] font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="border-t border-brand-border px-6 py-20 bg-brand-bg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[24px] font-bold text-center mb-14 tracking-[-0.01em] text-brand-text">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { Icon: Shield,       n: "01", title: "Enter your tools",      desc: "Select the AI tools your team uses. Add plan type, seat count, and monthly spend." },
              { Icon: TrendingDown, n: "02", title: "We audit every line",   desc: "Our engine checks each tool against current published pricing and flags every overpayment." },
              { Icon: Zap,          n: "03", title: "Get your report",       desc: "See a detailed breakdown with exact savings. Share with your team or CFO instantly." },
            ].map(({ Icon, n, title, desc }) => (
              <div key={n} className="card text-center shadow-sm">
                <div className="w-12 h-12 bg-blue-50 border border-brand-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-brand-blue" />
                </div>
                <div className="text-[12px] text-brand-text-muted font-mono mb-2 uppercase tracking-[0.05em]">{n}</div>
                <h3 className="font-semibold text-[16px] text-brand-text mb-2">{title}</h3>
                <p className="text-brand-text-muted text-[14px] leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-brand-border bg-brand-surface px-6 py-6 text-center text-slate-500 font-medium text-[13px]">
        © 2025 Credex · Pricing data verified from official vendor sources
      </footer>
    </main>
  );
}
