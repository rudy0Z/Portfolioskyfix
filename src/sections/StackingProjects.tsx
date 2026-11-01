import type { ReactNode } from "react";
import { Link } from "@/router/Router";

interface FlagshipProject {
  id: string;
  index: string;
  title: string;
  year: string;
  discipline: string;
  tagline: string;
  problem: string;
  decision: string;
  metrics: string[];
  brandColor: string;
  caseHref: string;
  badge: string;
  renderScreenSvg: () => ReactNode;
}

const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    id: "sentinel",
    index: "01",
    title: "FlytBase Sentinel",
    year: "2026",
    discipline: "Autonomous Systems · Emergency Response Command",
    tagline:
      "A wildfire initial-attack aerial command interface built around FlytBase's 48-minute challenge baseline and 90-second target. AI compiles evidence; a human authorizes escalation.",
    problem:
      "Wildfire initial-attack delays average 48 minutes across dispatch networks. Fully autonomous drone dispatch risks catastrophic false alarms; full human review is too slow.",
    decision:
      "Architected the 90-Second Human Verification Window & Attention Arbiter. TALON (AI copilot) detects and stages evidence; human operator authorizes with single-keystroke certainty.",
    metrics: ["48 min → 90s authorization", "Zero unverified dispatches", "Dual-fidelity 2D/3D map ladder"],
    brandColor: "#0E7A5E",
    caseHref: "/case/sentinel",
    badge: "Independent Flagship Concept",
    renderScreenSvg: () => (
      <svg viewBox="0 0 600 380" className="w-full h-full rounded-lg bg-neutral-950/90 border border-white/10 p-3">
        <defs>
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#059669" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Tactical Command Top Bar */}
        <rect x="10" y="10" width="580" height="32" rx="4" fill="#18181b" stroke="#27272a" />
        <circle cx="26" cy="26" r="4" fill="#10b981" />
        <text x="38" y="30" fill="#a1a1aa" fontFamily="monospace" fontSize="11" fontWeight="bold">
          TALON FLIGHT COMMAND // SECTOR 04 NORTH RIDGE
        </text>
        <rect x="440" y="16" width="140" height="20" rx="3" fill="#047857" />
        <text x="450" y="30" fill="#ffffff" fontFamily="monospace" fontSize="10" fontWeight="bold">
          90S WINDOW: 00:42 REMAINING
        </text>

        {/* Left: FLIR Thermal Drone Feed */}
        <rect x="10" y="52" width="310" height="240" rx="4" fill="#09090b" stroke="#27272a" />
        {/* Terrain wireframe */}
        <path d="M 20 220 Q 90 140, 160 190 T 300 160" fill="none" stroke="#27272a" strokeWidth="1.5" />
        <path d="M 30 260 Q 140 180, 220 230 T 310 200" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
        {/* Thermal Hotspot Flare */}
        <circle cx="170" cy="180" r="28" fill="#ef4444" fillOpacity="0.35" className="animate-pulse" />
        <circle cx="170" cy="180" r="14" fill="#f97316" fillOpacity="0.6" />
        <circle cx="170" cy="180" r="5" fill="#fef08a" />
        {/* HUD Crosshairs */}
        <line x1="150" y1="180" x2="190" y2="180" stroke="#38bdf8" strokeWidth="1" />
        <line x1="170" y1="160" x2="170" y2="200" stroke="#38bdf8" strokeWidth="1" />
        <text x="180" y="172" fill="#ef4444" fontFamily="monospace" fontSize="9" fontWeight="bold">
          HOTSPOT +620°C
        </text>
        <text x="20" y="74" fill="#38bdf8" fontFamily="monospace" fontSize="9">
          DRONE EO/IR #02 · ALT 412M · WIND 14KT NW
        </text>

        {/* Right: Tactical Azimuth Radar */}
        <rect x="330" y="52" width="260" height="240" rx="4" fill="#09090b" stroke="#27272a" />
        <circle cx="460" cy="172" r="85" fill="url(#radarSweep)" stroke="#27272a" strokeWidth="1" />
        <circle cx="460" cy="172" r="55" fill="none" stroke="#27272a" strokeDasharray="3 3" />
        <circle cx="460" cy="172" r="25" fill="none" stroke="#27272a" />
        <line x1="460" y1="87" x2="460" y2="257" stroke="#27272a" strokeWidth="1" />
        <line x1="375" y1="172" x2="545" y2="172" stroke="#27272a" strokeWidth="1" />
        {/* Radar targets */}
        <circle cx="490" cy="140" r="4" fill="#ef4444" />
        <circle cx="425" cy="200" r="3" fill="#38bdf8" />
        <text x="342" y="74" fill="#10b981" fontFamily="monospace" fontSize="9">
          TACTICAL GRID 100M // 3 SENSORS
        </text>

        {/* Bottom Verification Command Dock */}
        <rect x="10" y="302" width="580" height="68" rx="4" fill="#18181b" stroke="#27272a" />
        <text x="26" y="326" fill="#f4f4f5" fontFamily="sans-serif" fontSize="12" fontWeight="600">
          Recommendation: Dispatch Mutual Aid CalFire Tanker Group
        </text>
        <text x="26" y="344" fill="#71717a" fontFamily="monospace" fontSize="10">
          Confidence: 94.2% verified by 2 thermal feeds · Human Authorization Required
        </text>
        <rect x="420" y="316" width="160" height="38" rx="4" fill="#10b981" />
        <text x="444" y="340" fill="#000000" fontFamily="sans-serif" fontSize="11" fontWeight="bold">
          AUTHORIZE STRIKE ↵
        </text>
      </svg>
    ),
  },
  {
    id: "lokai",
    index: "02",
    title: "LokAI",
    year: "2025",
    discipline: "Legal AI Systems · Consumer Protection",
    tagline:
      "A deterministic Indian legal-AI consumer refund guide. Verifies facts against statutory databases, shows grounded citations, and stops before generating unsafe legal advice.",
    problem:
      "Indian consumer dispute systems (e-Daakhil, 1915) have 78% drop-off rates due to intimidating legal jargon, while LLMs hallucinate non-existent statutory sections.",
    decision:
      "Engineered Deterministic Boundary Gates and Multilingual Script Engine (Devanagari, Tamil, English). Prohibited live LLM hallucination in legal merits; enforced 100% grounded claim counters.",
    metrics: ["100% Grounded claims", "Zero hallucinated sections", "3 Indian vernacular channels"],
    brandColor: "#1F3A60",
    caseHref: "/case/lokai",
    badge: "Material+ Top 10 Winner",
    renderScreenSvg: () => (
      <svg viewBox="0 0 600 380" className="w-full h-full rounded-lg bg-slate-950/90 border border-white/10 p-3">
        {/* Header Bar */}
        <rect x="10" y="10" width="580" height="34" rx="4" fill="#0f172a" stroke="#1e293b" />
        <text x="26" y="32" fill="#93c5fd" fontFamily="serif" fontSize="14" fontWeight="bold">
          LokAI // Consumer Rights Dossier
        </text>
        <rect x="430" y="16" width="150" height="22" rx="3" fill="#1e3a8a" />
        <text x="442" y="31" fill="#e0f2fe" fontFamily="monospace" fontSize="10">
          CLAIMS GROUNDED: 3/3 (100%)
        </text>

        {/* 3-Zone Legal Assessment Panels */}
        <rect x="10" y="54" width="186" height="240" rx="4" fill="#020617" stroke="#1e293b" />
        <text x="22" y="78" fill="#60a5fa" fontFamily="monospace" fontSize="10" fontWeight="bold">
          ZONE 1: FACT MATRIX
        </text>
        <line x1="22" y1="88" x2="184" y2="88" stroke="#1e293b" />
        <text x="22" y="108" fill="#e2e8f0" fontFamily="sans-serif" fontSize="10">
          • Defective AC Unit delivered
        </text>
        <text x="22" y="126" fill="#e2e8f0" fontFamily="sans-serif" fontSize="10">
          • Return window rejected
        </text>
        <text x="22" y="144" fill="#e2e8f0" fontFamily="sans-serif" fontSize="10">
          • ₹38,400 invoice verified
        </text>
        <rect x="22" y="180" width="162" height="24" rx="3" fill="#064e3b" />
        <text x="30" y="196" fill="#6ee7b7" fontFamily="monospace" fontSize="9">
          ✓ INVOICE AUTHENTICATED
        </text>

        <rect x="206" y="54" width="188" height="240" rx="4" fill="#020617" stroke="#1e293b" />
        <text x="218" y="78" fill="#60a5fa" fontFamily="monospace" fontSize="10" fontWeight="bold">
          ZONE 2: STATUTORY BASIS
        </text>
        <line x1="218" y1="88" x2="382" y2="88" stroke="#1e293b" />
        <rect x="218" y="98" width="164" height="42" rx="3" fill="#172554" />
        <text x="226" y="114" fill="#bfdbfe" fontFamily="sans-serif" fontSize="9" fontWeight="bold">
          Consumer Protection Act 2019
        </text>
        <text x="226" y="130" fill="#93c5fd" fontFamily="monospace" fontSize="8.5">
          Section 2(47): Unfair Trade Practice
        </text>
        <rect x="218" y="150" width="164" height="42" rx="3" fill="#172554" />
        <text x="226" y="166" fill="#bfdbfe" fontFamily="sans-serif" fontSize="9" fontWeight="bold">
          Remedy: Full Refund + Interest
        </text>
        <text x="226" y="182" fill="#93c5fd" fontFamily="monospace" fontSize="8.5">
          Section 39(1)(e): Defect Removal
        </text>

        <rect x="404" y="54" width="186" height="240" rx="4" fill="#020617" stroke="#1e293b" />
        <text x="416" y="78" fill="#60a5fa" fontFamily="monospace" fontSize="10" fontWeight="bold">
          ZONE 3: RECOVERY PATH
        </text>
        <line x1="416" y1="88" x2="578" y2="88" stroke="#1e293b" />
        <rect x="416" y="100" width="162" height="32" rx="3" fill="#1e1b4b" />
        <text x="424" y="116" fill="#c7d2fe" fontFamily="monospace" fontSize="9">
          Step 1: 1915 NCH Helpline
        </text>
        <text x="424" y="127" fill="#818cf8" fontFamily="sans-serif" fontSize="8">
          Status: Ready to file
        </text>
        <rect x="416" y="142" width="162" height="32" rx="3" fill="#1e1b4b" />
        <text x="424" y="158" fill="#c7d2fe" fontFamily="monospace" fontSize="9">
          Step 2: Legal Demand Notice
        </text>
        <text x="424" y="169" fill="#818cf8" fontFamily="sans-serif" fontSize="8">
          Registered Post A/D Draft
        </text>
        <rect x="416" y="184" width="162" height="32" rx="3" fill="#1e1b4b" />
        <text x="424" y="200" fill="#c7d2fe" fontFamily="monospace" fontSize="9">
          Step 3: e-Daakhil Portal
        </text>
        <text x="424" y="211" fill="#818cf8" fontFamily="sans-serif" fontSize="8">
          District Consumer Commission
        </text>

        {/* Bottom Bilingual Bar */}
        <rect x="10" y="304" width="580" height="66" rx="4" fill="#0f172a" stroke="#1e293b" />
        <text x="26" y="328" fill="#ffffff" fontFamily="sans-serif" fontSize="11" fontWeight="bold">
          Generated Legal Demand Notice (Devanagari / English Verified)
        </text>
        <text x="26" y="346" fill="#94a3b8" fontFamily="monospace" fontSize="10">
          Channel Metaphors: 1915 NCH · e-Daakhil · Speed Post A.D.
        </text>
        <rect x="420" y="318" width="160" height="36" rx="4" fill="#2563eb" />
        <text x="444" y="340" fill="#ffffff" fontFamily="sans-serif" fontSize="11" fontWeight="bold">
          EXPORT NOTICE PDF →
        </text>
      </svg>
    ),
  },
  {
    id: "feul",
    index: "03",
    title: "Feul.AI",
    year: "2025",
    discipline: "Vernacular Voice AI · Ethical Contributor Platform",
    tagline:
      "A voice-data marketplace concept built around transparent micro-payout contracts, real-time acoustic waveform validation, and consent repair for non-English contributors.",
    problem:
      "AI lab vernacular datasets exploit non-English gig contributors with opaque batch payouts, 40% rejection rates with zero feedback, and zero consent auditability.",
    decision:
      "Designed Transparent Micro-Payout Escrow contracts where payment is confirmed per validated utterance. Built client-side acoustic noise gate meters to prevent wasted efforts.",
    metrics: ["₹45/prompt verified", "24 Indian dialects supported", "<120ms acoustic validation"],
    brandColor: "#9E3512",
    caseHref: "/case/feul",
    badge: "Startup-Origin Concept",
    renderScreenSvg: () => (
      <svg viewBox="0 0 600 380" className="w-full h-full rounded-lg bg-stone-950/90 border border-white/10 p-3">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Top Ledger Bar */}
        <rect x="10" y="10" width="580" height="34" rx="4" fill="#1c1917" stroke="#292524" />
        <text x="26" y="32" fill="#fdba74" fontFamily="sans-serif" fontSize="13" fontWeight="bold">
          FEUL.AI // Vernacular Voice Stream #842
        </text>
        <rect x="420" y="16" width="160" height="22" rx="3" fill="#431407" />
        <text x="432" y="31" fill="#fed7aa" fontFamily="monospace" fontSize="10" fontWeight="bold">
          PAYOUT: ₹45.00 / UTTERANCE
        </text>

        {/* Center Prompt & Waveform Studio */}
        <rect x="10" y="54" width="580" height="150" rx="4" fill="#0c0a09" stroke="#292524" />
        <text x="26" y="80" fill="#a8a29e" fontFamily="monospace" fontSize="10">
          PROMPT TARGET [SURTI GUJARATI · DIALECT BHARUCHI]:
        </text>
        <text x="26" y="108" fill="#ffffff" fontFamily="sans-serif" fontSize="17" fontWeight="bold">
          "આ વર્ષે ચોમાસું સારું રહેશે તો ખેતરમાં કપાસ પાક જોરદાર થશે."
        </text>
        <text x="26" y="128" fill="#78716c" fontFamily="sans-serif" fontSize="11">
          (If the monsoon is favorable this year, the cotton yield in the fields will be outstanding.)
        </text>

        {/* Real-time Dynamic Acoustic Waveform Graph */}
        <g transform="translate(26, 140)">
          {Array.from({ length: 48 }, (_, i) => {
            const h = Math.max(3, 8 + Math.sin(i * 0.45) * 22 + (i % 3 === 0 ? 12 : 0));
            return (
              <rect
                key={i}
                x={i * 11.2}
                y={28 - h / 2}
                width="6"
                height={h}
                rx="3"
                fill="url(#waveGrad)"
                opacity={0.85}
              />
            );
          })}
        </g>

        {/* Bottom Verification & Escrow Contract Grid */}
        <rect x="10" y="214" width="280" height="150" rx="4" fill="#1c1917" stroke="#292524" />
        <text x="26" y="238" fill="#fb923c" fontFamily="monospace" fontSize="10" fontWeight="bold">
          ACOUSTIC QUALITY METER
        </text>
        <line x1="26" y1="248" x2="276" y2="248" stroke="#292524" />
        <text x="26" y="272" fill="#d6d3d1" fontFamily="sans-serif" fontSize="10">
          Signal-to-Noise Ratio: 32dB (Clean)
        </text>
        <text x="26" y="292" fill="#d6d3d1" fontFamily="sans-serif" fontSize="10">
          Phoneme Coverage: 98.4%
        </text>
        <rect x="26" y="316" width="250" height="26" rx="3" fill="#14532d" />
        <text x="36" y="333" fill="#86efac" fontFamily="monospace" fontSize="9.5">
          ✓ PASSES TRAINING REPUTATION GATE
        </text>

        <rect x="300" y="214" width="290" height="150" rx="4" fill="#1c1917" stroke="#292524" />
        <text x="316" y="238" fill="#fb923c" fontFamily="monospace" fontSize="10" fontWeight="bold">
          TRANSPARENT ESCROW LEDGER
        </text>
        <line x1="316" y1="248" x2="576" y2="248" stroke="#292524" />
        <text x="316" y="272" fill="#d6d3d1" fontFamily="sans-serif" fontSize="10">
          Contributor ID: #GJ-SRT-9021
        </text>
        <text x="316" y="292" fill="#d6d3d1" fontFamily="sans-serif" fontSize="10">
          Session Payout: ₹360 (8 prompts)
        </text>
        <rect x="316" y="316" width="260" height="26" rx="3" fill="#7c2d12" />
        <text x="330" y="333" fill="#fdba74" fontFamily="monospace" fontSize="9.5">
          INSTANT UPI PAYOUT DISPATCHED ⚡
        </text>
      </svg>
    ),
  },
];

export function StackingProjects() {
  return (
    <section id="work" className="stacking-projects-section relative w-full py-24 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Anchor for deep links */}
      <div id="projects" className="absolute -top-24" />

      <div className="mb-14 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>SELECTED WORK · SYSTEMS &amp; PRODUCTS</span>
          </div>
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
            THREE CASE STUDIES
          </span>
        </div>
        <h2 className="font-serif text-[38px] sm:text-[52px] font-normal leading-[1.05] tracking-tight text-white">
          Flagship Systems &amp; Case Studies
        </h2>
        <p className="mt-3 font-sans text-[16px] text-white/70 max-w-2xl font-light leading-relaxed">
          Three deep-dive case studies exploring autonomous systems, the human verification window,
          and verified physical reality.
        </p>
      </div>

      {/* Sticky Stacking Track */}
      <div className="relative flex flex-col gap-20 pb-16">
        {FLAGSHIP_PROJECTS.map((proj, idx) => (
          <div
            key={proj.id}
            id={`project-card-${proj.id}`}
            className="sticky rounded-2xl border border-white/15 bg-neutral-900/90 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 transition-all duration-300"
            style={{
              top: `calc(5rem + ${idx * 28}px)`,
              zIndex: 10 + idx,
              boxShadow: `0 ${16 + idx * 8}px ${48 + idx * 16}px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.15)`,
            }}
          >
            {/* Top Card Kicker */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[12px] font-bold text-white/40">
                  {proj.index}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 font-mono text-[9.5px] uppercase tracking-wider text-amber-300 border border-white/15">
                  {proj.badge}
                </span>
                <span className="font-mono text-[11px] text-white/50">
                  {proj.year}
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
                {proj.discipline}
              </span>
            </div>

            {/* Main Card Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
              {/* Left Column: Project Copy & Decision Architecture */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-[30px] sm:text-[38px] font-medium leading-tight text-white mb-3">
                    {proj.title}
                  </h3>
                  <p className="font-sans text-[14.5px] text-white/75 font-light leading-relaxed mb-6">
                    {proj.tagline}
                  </p>

                  {/* Architecture Tension & Decision */}
                  <div className="space-y-4 mb-6">
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-rose-300/80 mb-1">
                        Core System Tension
                      </div>
                      <p className="font-sans text-[12.5px] text-white/70 leading-normal">
                        {proj.problem}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-emerald-300/80 mb-1">
                        The Architectural Decision
                      </div>
                      <p className="font-sans text-[12.5px] text-white/70 leading-normal">
                        {proj.decision}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {proj.metrics.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-white/80"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-4">
                  <Link
                    href={proj.caseHref}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-sans text-[13px] font-semibold hover:bg-amber-300 hover:text-black transition-all shadow-lg hover:shadow-amber-400/20"
                  >
                    <span>View case study</span>
                    <span className="font-mono text-[14px]">→</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Stylized SVG Screen Placeholder */}
              <div className="lg:col-span-7 flex items-center justify-center min-h-[320px] sm:min-h-[380px]">
                {proj.renderScreenSvg()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Continue to contact ── */}
      <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] text-white/50">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>MORE IN CONVERSATION — SAY HELLO</span>
        </div>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white transition-all text-[11px]"
        >
          <span>Get in touch</span>
          <span>↓</span>
        </a>
      </div>
    </section>
  );
}
