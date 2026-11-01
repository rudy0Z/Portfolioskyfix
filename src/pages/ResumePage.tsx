import { Link } from "@/router/Router";

export function ResumePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-page relative min-h-screen w-full pt-24 pb-28 px-4 sm:px-6 flex flex-col items-center select-text">
      {/* Print CSS overrides */}
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #111111 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print, nav, footer, .hud, .sky-fixed, .dev-menu-root, .site-header {
            display: none !important;
          }
          .resume-page {
            padding: 0 !important;
            min-height: auto !important;
          }
          .resume-sheet {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          @page {
            margin: 10mm 12mm;
            size: letter portrait;
          }
        }
      `}</style>

      {/* ── TOP CONTROL BAR (no-print) ─────────────────────────────────── */}
      <div className="no-print w-full max-w-4xl mb-6 flex items-center justify-between text-white/80 font-mono text-[11px]">
        {/* Left: Breadcrumbs & Social Icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors text-white"
            title="Return to Home"
          >
            ⌂
          </Link>
          <a
            href="https://linkedin.com/in/rudraksh-singh"
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors text-white font-bold"
            title="LinkedIn Profile"
          >
            in
          </a>
          <a
            href="https://x.com/rudrakshsinghh"
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors text-white font-bold"
            title="X / Twitter @rudrakshsinghh"
          >
            𝕏
          </a>
        </div>

        {/* Right: Actions & Section Anchors */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/about" className="hidden sm:inline-block hover:text-white transition-colors">
            Design Philosophy
          </Link>
          <Link href="/journal" className="hidden sm:inline-block hover:text-white transition-colors">
            Life &amp; Stories
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-black border border-white/30 font-sans font-medium text-[12px] shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>View / Print PDF</span>
            <span className="text-[10px]">🖨</span>
          </button>
        </div>
      </div>

      {/* ── THE WHITE RESUME PAPER SHEET (Exact Bikiron Bora style) ───── */}
      <div className="resume-sheet relative w-full max-w-4xl bg-white text-neutral-900 rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,0.55)] border border-neutral-200/90 p-8 sm:p-12 transition-all">
        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-start gap-5">
            {/* Circular Avatar Photo */}
            <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 rounded-full overflow-hidden border-2 border-neutral-200 shadow-md bg-neutral-100">
              <img
                src="/portrait-cutout.png"
                alt="Rudraksh Singh"
                className="h-full w-full object-cover object-top"
                onError={(e) => {
                  // Fallback vector avatar if bitmap is loading
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-amber-200 to-sky-200 text-neutral-800 font-serif font-bold text-2xl -z-10">
                RS
              </div>
            </div>

            {/* Name & Title */}
            <div>
              <h1 className="font-serif text-[32px] sm:text-[40px] font-bold text-neutral-950 tracking-tight leading-none mb-1.5">
                Rudraksh Singh
              </h1>
              <div className="font-sans text-[11px] sm:text-[12px] uppercase font-bold tracking-[0.16em] text-neutral-500">
                Lead Product Designer &amp; Systems Architect
              </div>
            </div>
          </div>

          {/* Top Right: Direct Contact Email */}
          <div className="sm:self-start">
            <a
              href="mailto:rudraksh.singhh@outlook.com"
              className="inline-flex items-center gap-2 font-mono text-[11.5px] text-neutral-600 hover:text-neutral-950 transition-colors bg-neutral-50 hover:bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200/70"
            >
              <span>✉</span>
              <span>rudraksh.singhh@outlook.com</span>
            </a>
          </div>
        </div>

        {/* Speech Bubble / Greeting Pill Card (under profile header) */}
        <div className="relative mt-5 mb-8 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 max-w-2xl text-[13px] text-neutral-700 leading-relaxed font-sans shadow-sm">
          {/* Subtle triangle notch pointing to avatar */}
          <div className="absolute -top-1.5 left-8 w-3 h-3 bg-slate-50 border-t border-l border-slate-200/80 transform rotate-45" />
          <div className="font-bold text-neutral-900 mb-0.5 flex items-center gap-1.5">
            <span>👋 Hi there!</span>
          </div>
          <p className="font-light text-neutral-600">
            With 3+ years designing in the autonomous AI and interaction space. Focused on decision-heavy interfaces,
            evidence visibility, and prototype-led case studies. Beside work, I like to experiment with creative WebGL shaders,
            film photography, and modular systems.
          </p>
        </div>

        {/* Two-Column Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* ── LEFT COLUMN: EXPERIENCE (~66%) ────────────────────────── */}
          <div className="md:col-span-8 space-y-8">
            <div className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              EXPERIENCE ~3 YEARS
            </div>

            {/* Role 1: FlytBase Sentinel */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[14px] shrink-0 shadow-sm mt-0.5">
                  FS
                </div>
                <div>
                  <div className="font-sans text-[16px] font-bold text-neutral-950 flex flex-wrap items-baseline gap-2">
                    <span>FlytBase Sentinel</span>
                    <span className="font-mono text-[11px] font-medium text-neutral-500">
                      May 2026 – Present (Current)
                    </span>
                  </div>
                  <div className="font-sans text-[13px] font-medium text-emerald-800">
                    Lead Product Designer &amp; Systems Architect
                  </div>
                </div>
              </div>
              <ul className="list-disc list-outside pl-11 space-y-1.5 font-sans text-[12.5px] text-neutral-600 font-light leading-relaxed">
                <li>
                  Designed the operator command interface for an autonomous wildfire initial-attack aerial command system.
                </li>
                <li>
                  Architected the <strong>90-Second Human Verification Window</strong> and deterministic Attention Arbiter,
                  compressing wildfire escalation delays from 48 minutes down to 90 seconds.
                </li>
                <li>
                  Engineered a <strong>dual-fidelity degradation ladder</strong> connecting 2D tactical maps with on-demand
                  3D drone photogrammetry without visual drift.
                </li>
              </ul>
            </div>

            {/* Role 2: LokAI */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[14px] shrink-0 shadow-sm mt-0.5">
                  LK
                </div>
                <div>
                  <div className="font-sans text-[16px] font-bold text-neutral-950 flex flex-wrap items-baseline gap-2">
                    <span>LokAI</span>
                    <span className="font-mono text-[11px] font-medium text-neutral-500">
                      2025 (Flagship Concept)
                    </span>
                  </div>
                  <div className="font-sans text-[13px] font-medium text-indigo-800">
                    Founding Product Designer
                  </div>
                </div>
              </div>
              <ul className="list-disc list-outside pl-11 space-y-1.5 font-sans text-[12.5px] text-neutral-600 font-light leading-relaxed">
                <li>
                  Designed a multilingual legal-AI triage guide helping Indian consumers navigate refund disputes and consumer grievances.
                </li>
                <li>
                  Engineered <strong>deterministic boundary gates</strong> that verify legal facts and stop before unsafe advice,
                  grounded in real statutes (1915, e-Daakhil).
                </li>
                <li>
                  Built localized typography systems supporting Devanagari and Tamil scripts across responsive mobile viewports.
                </li>
              </ul>
            </div>

            {/* Role 3: Feul.AI */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-[14px] shrink-0 shadow-sm mt-0.5">
                  FL
                </div>
                <div>
                  <div className="font-sans text-[16px] font-bold text-neutral-950 flex flex-wrap items-baseline gap-2">
                    <span>Feul.AI</span>
                    <span className="font-mono text-[11px] font-medium text-neutral-500">
                      2025 (Startup Origin)
                    </span>
                  </div>
                  <div className="font-sans text-[13px] font-medium text-amber-800">
                    Product &amp; Interaction Designer
                  </div>
                </div>
              </div>
              <ul className="list-disc list-outside pl-11 space-y-1.5 font-sans text-[12.5px] text-neutral-600 font-light leading-relaxed">
                <li>
                  Designed a trust-first voice recording marketplace for non-English vernacular gig contributors in India.
                </li>
                <li>
                  Created <strong>transparent micro-payout contracts</strong> with visible ₹50 Calibration Quests and instant UPI wallet transfers.
                </li>
                <li>
                  Designed real-time <strong>48-bar acoustic waveform verification</strong> to ensure high-grade training dataset quality.
                </li>
              </ul>
            </div>

            {/* Role 4: Product Practice */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-[14px] shrink-0 shadow-sm mt-0.5">
                  RS
                </div>
                <div>
                  <div className="font-sans text-[16px] font-bold text-neutral-950 flex flex-wrap items-baseline gap-2">
                    <span>Independent Practice</span>
                    <span className="font-mono text-[11px] font-medium text-neutral-500">
                      2024 – Present
                    </span>
                  </div>
                  <div className="font-sans text-[13px] font-medium text-neutral-700">
                    Product Designer &amp; Creative Engineer
                  </div>
                </div>
              </div>
              <ul className="list-disc list-outside pl-11 space-y-1.5 font-sans text-[12.5px] text-neutral-600 font-light leading-relaxed">
                <li>
                  Building production-grade design systems, WebGL volumetric raymarching engines, and interactive code prototypes.
                </li>
                <li>
                  Authoring open-source developer tooling and interactive canvas experiments.
                </li>
              </ul>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SKILLS, TOOLS, EDUCATION (~34%) ─────────── */}
          <div className="md:col-span-4 space-y-8 md:border-l md:border-neutral-100 md:pl-8">
            {/* Skills */}
            <div>
              <div className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3.5">
                SKILLS
              </div>
              <ul className="space-y-2 font-sans text-[12.5px] text-neutral-700 font-light">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Problem Discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Systems Architecture</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Interaction Design</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>High Fidelity Prototyping</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Design Systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>User Research</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Storytelling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Visual Design &amp; Typography</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>UI Animation &amp; Motion</span>
                </li>
              </ul>
            </div>

            {/* Tools */}
            <div>
              <div className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3.5">
                TOOLS
              </div>
              <ul className="space-y-2 font-sans text-[12.5px] text-neutral-700 font-light">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Figma &amp; FigJam</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>React 19 &amp; Next.js</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>TypeScript &amp; JavaScript</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Tailwind CSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>WebGL2 &amp; GLSL Shaders</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Node.js &amp; Git CLI</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span>Claude &amp; Cursor AI</span>
                </li>
              </ul>
            </div>

            {/* Education */}
            <div>
              <div className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3.5">
                EDUCATION
              </div>
              <div className="space-y-1">
                <div className="font-sans text-[13px] font-bold text-neutral-900">
                  Bennett University
                </div>
                <div className="font-sans text-[12px] text-neutral-600">
                  B.Tech in Computer Science &amp; Engineering
                </div>
                <div className="font-mono text-[10.5px] text-neutral-400">
                  2022 – 2026 · India
                </div>
                <p className="font-sans text-[11.5px] text-neutral-500 font-light pt-1 leading-normal">
                  Core: Design &amp; Analysis of Algorithms, Object-Oriented Software Architecture, Distributed Systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtle watermark */}
        <div className="mt-12 pt-6 border-t border-neutral-100 flex items-center justify-between font-mono text-[10px] text-neutral-400">
          <span>PORTFOLIO DOSSIER // RUDRAKSH SINGH</span>
          <span>PRINT OPTIMIZED · {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
