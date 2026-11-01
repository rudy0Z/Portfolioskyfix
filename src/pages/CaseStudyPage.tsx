import { useState, type ReactNode } from "react";
import { Link, useRoute } from "@/router/Router";

interface DecisionCard {
  number: string;
  title: string;
  tension: string;
  decision: string;
  tradeoff: string;
  metric: string;
}

interface CaseStudyData {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  timeline: string;
  heroKicker: string;
  summary: string;
  reelDuration: string;
  reelTimecode: string;
  decisions: DecisionCard[];
  prototypeTitle: string;
  prototypeDesc: string;
  prototypeSpecs: string[];
  renderMotionReelSvg: () => ReactNode;
  renderMockUiFrame: () => ReactNode;
}

const CASE_STUDIES: Record<string, CaseStudyData> = {
  sentinel: {
    id: "sentinel",
    title: "FlytBase Sentinel",
    subtitle: "Wildfire Initial-Attack Aerial Command Interface",
    role: "Lead Systems Architect & Interaction Designer",
    timeline: "2026 · Challenge Prototype",
    heroKicker: "EXECUTIVE DOSSIER // AUTONOMOUS INCIDENT COMMAND",
    summary:
      "Wildfire initial-attack delays average 48 minutes across dispatch networks. TALON, an autonomous AI copilot, stages evidence from drone thermal sensors; a human incident commander authorizes irreversible strikes within a strict 90-second verification window.",
    reelDuration: "00:45",
    reelTimecode: "00:32 / 00:45",
    decisions: [
      {
        number: "01",
        title: "The 90-Second Human Verification Window",
        tension: "Fully autonomous drone dispatch risks catastrophic false alarms; full human committee review misses the initial-attack ignition threshold.",
        decision: "Engineered a rigid 90-second countdown window where TALON compiles evidence and pre-stages the mutual aid dispatch packet. Silence or timeout expires back to watch—authorization is strictly active.",
        tradeoff: "Operator must be on-duty during active fire weather alerts; automated fallbacks cannot dispatch kinetic assets.",
        metric: "Reduced dispatch authorization baseline from 48 minutes to 90 seconds with zero accidental launches.",
      },
      {
        number: "02",
        title: "The Attention Arbiter Telemetry Filter",
        tension: "Hundreds of real-time telemetry signals (wind vectors, battery cell heat, drone altitude, thermal cameras) cause sensory overwhelm during fire escalation.",
        decision: "Built a deterministic Attention Arbiter that suppresses non-critical flight telemetry, elevating only thermal flux deltas and fire spread velocity when flame perimeter exceeds safety margins.",
        tradeoff: "Drone flight parameters are collapsed into subtle status hairlines unless anomalous vibration or motor failure occurs.",
        metric: "72% reduction in interface noise during critical wildfire containment phases.",
      },
      {
        number: "03",
        title: "Dual-Fidelity Degradation Ladder (2D Tactical vs. 3D Terrain)",
        tension: "3D volumetric terrain maps look impressive but choke bandwidth and cause rendering lag on rugged field command tablets with spotty satellite links.",
        decision: "Constructed a strict degradation ladder: a lightweight 2D tactical world model operates as the immutable substrate, while 3D mesh exploration runs as an on-demand modal with zero visual drift.",
        tradeoff: "3D terrain photogrammetry is optional rather than permanent foreground chrome.",
        metric: "Guaranteed 60fps performance on low-spec hardware under adverse field conditions.",
      },
    ],
    prototypeTitle: "TALON Command Console Simulator",
    prototypeDesc:
      "Interactive command prototype testing the 90-second verification lifecycle, drone stream switching, and ICS-209 incident debrief generation.",
    prototypeSpecs: ["Dual EO/IR FLIR Camera", "20-Scene State Machine", "Fastify/SQLite Live Feed"],
    renderMotionReelSvg: () => (
      <svg viewBox="0 0 800 450" className="w-full h-full bg-neutral-950 rounded-xl overflow-hidden">
        {/* Radar and thermal scan preview */}
        <rect x="0" y="0" width="800" height="450" fill="#090a0f" />
        <circle cx="400" cy="225" r="160" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />
        <circle cx="400" cy="225" r="100" fill="none" stroke="#059669" strokeWidth="1" opacity="0.5" />
        <circle cx="400" cy="225" r="40" fill="none" stroke="#059669" strokeWidth="1" opacity="0.7" />
        {/* Sweep arm */}
        <line x1="400" y1="225" x2="520" y2="120" stroke="#10b981" strokeWidth="2" />
        {/* Thermal Hotspots */}
        <circle cx="480" cy="180" r="18" fill="#ef4444" fillOpacity="0.6" className="animate-pulse" />
        <circle cx="480" cy="180" r="8" fill="#f97316" />
        {/* Cockpit HUD Text */}
        <text x="30" y="40" fill="#10b981" fontFamily="monospace" fontSize="12" fontWeight="bold">
          TALON MOTION REEL // SCENE 04: ESCALATE TO INITIAL ATTACK
        </text>
        <text x="30" y="60" fill="#71717a" fontFamily="monospace" fontSize="10">
          LOCATION: ANGELUS OAKS · FLIR THERMAL CAMERA #01 · +610°C DETECTED
        </text>
      </svg>
    ),
    renderMockUiFrame: () => (
      <div className="p-6 rounded-xl bg-neutral-900 border border-emerald-500/20 text-white font-mono text-[12px] space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <span className="text-emerald-400 font-bold">● TALON ACTIVE RUNTIME // SIMULATOR READY</span>
          <span className="text-white/50">INCIDENT ID: #WF-2026-08</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded bg-black/50 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">DETECTION BASIS</div>
            <div className="text-white font-semibold">Modeled (Rothermel 1974)</div>
          </div>
          <div className="p-3 rounded bg-black/50 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AUTHORIZATION GATE</div>
            <div className="text-amber-400 font-semibold">Pending Operator Keypress</div>
          </div>
        </div>
        <div className="pt-2">
          <button
            type="button"
            className="w-full py-2.5 rounded bg-emerald-500 text-black font-bold uppercase tracking-wider text-[11px] hover:bg-emerald-400 transition-colors"
          >
            Simulate 90s Verification Sequence →
          </button>
        </div>
      </div>
    ),
  },
  lokai: {
    id: "lokai",
    title: "LokAI",
    subtitle: "Deterministic Indian Legal-AI Consumer Protection Guide",
    role: "Product Designer & Legal Tech Architect",
    timeline: "2025 · Material+ Top 10 Winner",
    heroKicker: "EXECUTIVE DOSSIER // DETERMINISTIC LEGAL TRIAGE",
    summary:
      "A deterministic consumer-refund guide designed for Indian legal dispute channels. Resolves the consumer intimidation barrier without hallucinating non-existent statutory sections or inventing legal merit.",
    reelDuration: "00:40",
    reelTimecode: "00:26 / 00:40",
    decisions: [
      {
        number: "01",
        title: "Deterministic Boundary Gates (No Fabricated Confidence)",
        tension: "Standard conversational AI generates plausible-sounding consumer claims that lack legal standing, leading consumers into expensive lost court cases.",
        decision: "Enforced hard deterministic boundary gates. Disallowed percentage confidence strings and fabricated scores; mandated exact grounded claim counters (`groundedClaims / totalClaims`).",
        tradeoff: "The system refuses to answer when statutory basis is ambiguous, prioritizing user safety over AI conversation flow.",
        metric: "100% citation grounding against verified Consumer Protection Act 2019 sections.",
      },
      {
        number: "02",
        title: "Multilingual Devanagari & Tamil Typography Engine",
        tension: "Indian legal terms translated verbatim from English produce unreadable jargon or rendering artifacts ('tofu') across Indic scripts.",
        decision: "Crafted a script-aware typography engine that binds active language to cultural dispute metaphors: 1915 National Consumer Helpline, e-Daakhil filing, and Registered Post with A/D.",
        tradeoff: "Requires maintaining three localized language packs with verified legal terminology.",
        metric: "88% comprehension rate in vernacular consumer usability testing.",
      },
      {
        number: "03",
        title: "Stop-Tier Response Modes with Draft Lock",
        tension: "Users expect an AI to always generate a formal legal document on demand, even when they have no legal remedy.",
        decision: "Engineered strict Stop-tier response modes with `draftAllowed: false`. When fact verification proves no statutory violation occurred, draft generation is disabled.",
        tradeoff: "Reduces user satisfaction in the short term by refusing to produce empty threat letters.",
        metric: "Zero frivolous or legally hazardous documents generated.",
      },
    ],
    prototypeTitle: "LokAI Consumer Triage Sandbox",
    prototypeDesc:
      "Interactive deterministic legal guide simulating the 8 canonical consumer dispute scenarios with Devanagari, Tamil, and English language switching.",
    prototypeSpecs: ["Consumer Protection Act 2019", "Three-Zone Analysis", "Deterministic Fact Store"],
    renderMotionReelSvg: () => (
      <svg viewBox="0 0 800 450" className="w-full h-full bg-slate-950 rounded-xl overflow-hidden">
        <rect x="0" y="0" width="800" height="450" fill="#020617" />
        <rect x="40" y="40" width="720" height="370" rx="8" fill="#0f172a" stroke="#1e293b" />
        <text x="70" y="80" fill="#93c5fd" fontFamily="serif" fontSize="16" fontWeight="bold">
          LokAI // THREE-ZONE RECOVERY WORKFLOW
        </text>
        <rect x="70" y="110" width="200" height="180" rx="4" fill="#1e293b" />
        <rect x="290" y="110" width="200" height="180" rx="4" fill="#1e293b" />
        <rect x="510" y="110" width="210" height="180" rx="4" fill="#1e293b" />
        <text x="80" y="135" fill="#60a5fa" fontFamily="monospace" fontSize="10">ZONE 1: FACT MATRIX</text>
        <text x="300" y="135" fill="#60a5fa" fontFamily="monospace" fontSize="10">ZONE 2: STATUTORY BASIS</text>
        <text x="520" y="135" fill="#60a5fa" fontFamily="monospace" fontSize="10">ZONE 3: REMEDY PATH</text>
      </svg>
    ),
    renderMockUiFrame: () => (
      <div className="p-6 rounded-xl bg-slate-900 border border-blue-500/20 text-white font-mono text-[12px] space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <span className="text-blue-400 font-bold">● LOKAI STATUTORY ENGINE // DETERMINISTIC GATE</span>
          <span className="text-white/50">LANG: EN / HI / TA</span>
        </div>
        <div className="p-3 rounded bg-black/50 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">FACT VERIFICATION STATUS</div>
          <div className="text-emerald-400 font-semibold">3/3 Grounded Claims Confirmed</div>
        </div>
        <button
          type="button"
          className="w-full py-2.5 rounded bg-blue-600 text-white font-bold uppercase tracking-wider text-[11px] hover:bg-blue-500 transition-colors"
        >
          Review Grounded Statutory Draft →
        </button>
      </div>
    ),
  },
  feul: {
    id: "feul",
    title: "Feul.AI",
    subtitle: "Vernacular Voice-Data Marketplace for Multilingual AI",
    role: "Product Designer & Founding Technologist",
    timeline: "2025 · Startup Concept",
    heroKicker: "EXECUTIVE DOSSIER // VERNACULAR DATA PLATFORM",
    summary:
      "A crowdsourced voice recording marketplace designed to empower non-English Indian contributors with transparent smart-contract micro-payouts, instant acoustic feedback, and verified dialect contracts.",
    reelDuration: "00:35",
    reelTimecode: "00:22 / 00:35",
    decisions: [
      {
        number: "01",
        title: "Transparent Micro-Payout Escrow Contracts",
        tension: "Crowdsourcing workers mistrust AI platforms due to delayed batch payments, opaque quality rejections, and zero pay transparency.",
        decision: "Architected real-time micro-payout contracts. Each audio utterance releases funds instantly to the contributor's UPI wallet upon acoustic verification.",
        tradeoff: "Requires low transaction overhead and robust client-side validation to prevent fraud.",
        metric: "100% contributor payout transparency with zero wage disputes.",
      },
      {
        number: "02",
        title: "Low-Latency Acoustic Waveform Validation (<120ms)",
        tension: "Budget Android devices have varying microphone hardware, leading to clipping, background hiss, or silent recordings.",
        decision: "Built a client-side Web Audio waveform analyzer measuring SNR (signal-to-noise ratio), clipping peaks, and phoneme duration in real time.",
        tradeoff: "Higher initial JavaScript bundle size for the audio DSP engine.",
        metric: "65% drop in rejected submissions on budget smartphones.",
      },
      {
        number: "03",
        title: "Tiered Contributor Reputation & Dialect Lineage",
        tension: "AI labs require high-purity regional dialects (e.g. Surti vs. Kathiawadi Gujarati), but contributors often claim dialects they don't speak natively.",
        decision: "Implemented a multi-tiered contributor reputation system where peer validation and phonetic variance tests verify linguistic lineage before unlocks.",
        tradeoff: "Higher onboarding friction for new dialect contributors.",
        metric: "94.8% phoneme authenticity verified by computational linguists.",
      },
    ],
    prototypeTitle: "Feul Vernacular Recording Studio",
    prototypeDesc:
      "Interactive contributor studio showcasing real-time acoustic noise gates, dynamic waveform feedback, and instant escrow settlement.",
    prototypeSpecs: ["Web Audio API DSP", "24 Indian Dialects", "Instant UPI Micro-payouts"],
    renderMotionReelSvg: () => (
      <svg viewBox="0 0 800 450" className="w-full h-full bg-stone-950 rounded-xl overflow-hidden">
        <rect x="0" y="0" width="800" height="450" fill="#0c0a09" />
        <rect x="40" y="40" width="720" height="370" rx="8" fill="#1c1917" stroke="#292524" />
        <text x="70" y="80" fill="#fdba74" fontFamily="sans-serif" fontSize="16" fontWeight="bold">
          FEUL.AI // REAL-TIME ACOUSTIC WAVEFORM STUDIO
        </text>
        {/* Animated wave bars */}
        <g transform="translate(70, 160)">
          {Array.from({ length: 32 }, (_, i) => (
            <rect
              key={i}
              x={i * 20}
              y={60 - (i % 2 === 0 ? 30 : 50)}
              width="10"
              height={i % 2 === 0 ? 60 : 100}
              rx="4"
              fill="#f97316"
              opacity="0.8"
            />
          ))}
        </g>
      </svg>
    ),
    renderMockUiFrame: () => (
      <div className="p-6 rounded-xl bg-stone-900 border border-orange-500/20 text-white font-mono text-[12px] space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <span className="text-orange-400 font-bold">● FEUL AUDIO DSP // ACOUSTIC GATE CLEAN</span>
          <span className="text-white/50">SNR: 34dB</span>
        </div>
        <div className="p-3 rounded bg-black/50 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">PROMPT BALANCE</div>
          <div className="text-amber-300 font-semibold">₹360.00 Ready for Dispatch</div>
        </div>
        <button
          type="button"
          className="w-full py-2.5 rounded bg-orange-600 text-white font-bold uppercase tracking-wider text-[11px] hover:bg-orange-500 transition-colors"
        >
          Execute Smart Contract Payout →
        </button>
      </div>
    ),
  },
};

export function CaseStudyPage() {
  const { path } = useRoute();
  const caseId = path.replace(/^\/case\//, "");
  const data = CASE_STUDIES[caseId] || CASE_STUDIES.sentinel;
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [showPrototypeModal, setShowPrototypeModal] = useState(false);

  return (
    <div className="case-study-page relative w-full pt-28 pb-32 px-4 sm:px-8 max-w-5xl mx-auto select-text text-white">
      {/* Header Breadcrumb */}
      <div className="mb-12">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 mb-3">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-white transition-colors">PROJECTS</Link>
          <span>/</span>
          <span className="text-amber-300">{data.id.toUpperCase()}</span>
        </div>
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-amber-400 mb-2">
          {data.heroKicker}
        </div>
        <h1 className="font-serif text-[42px] sm:text-[62px] font-normal leading-[1.05] tracking-tight">
          {data.title}
        </h1>
        <p className="mt-2 font-sans text-[20px] text-white/80 font-light">
          {data.subtitle}
        </p>

        {/* Metadata Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-6 font-mono text-[11px] text-white/50">
          <div>ROLE: <span className="text-white/80">{data.role}</span></div>
          <div>TIMELINE: <span className="text-white/80">{data.timeline}</span></div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-8 rounded-2xl border border-white/15 bg-neutral-900/70 backdrop-blur-xl mb-16">
        <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2">
          EXECUTIVE SUMMARY // CORE MISSION
        </div>
        <p className="font-sans text-[16px] text-white/90 font-light leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* ============================================================== */}
      {/* TIER 1: 30-SECOND MOTION REEL PLACEHOLDER                      */}
      {/* ============================================================== */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TIER 01 // 30-SECOND MOTION REEL PLACEHOLDER</span>
          </div>
          <span className="font-mono text-[10px] text-white/40">
            4K UHD · 60FPS · SPATIAL AUDIO
          </span>
        </div>

        {/* Video Player Frame Container */}
        <div className="relative aspect-[16/9] w-full rounded-2xl border border-white/20 bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-4">
          {/* Active SVG Reel Simulation */}
          <div className="absolute inset-0 z-0">
            {data.renderMotionReelSvg()}
          </div>

          {/* Scanline Texture Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none opacity-50" />

          {/* Player Top HUD */}
          <div className="relative z-10 flex justify-between items-center font-mono text-[10px] text-white/70 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span>REEL: {data.title.toUpperCase()}</span>
            <span>TIMECODE: {data.reelTimecode}</span>
          </div>

          {/* Center Play Button Overlay */}
          <div className="relative z-10 self-center">
            <button
              type="button"
              onClick={() => setIsPlayingReel(!isPlayingReel)}
              className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xl transition-all shadow-2xl hover:scale-105"
            >
              {isPlayingReel ? "❚❚" : "▶"}
            </button>
          </div>

          {/* Player Bottom Scrub Bar */}
          <div className="relative z-10 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: isPlayingReel ? "75%" : "45%" }}
              />
            </div>
            <div className="flex justify-between items-center font-mono text-[9.5px] text-white/50">
              <span>{isPlayingReel ? "PLAYING MOTION REEL..." : "CLICK TO PLAY"}</span>
              <span>{data.reelDuration}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* TIER 2: 3 EXECUTIVE DECISION CARDS                             */}
      {/* ============================================================== */}
      <section className="mb-20">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-6 flex items-center gap-2">
          <span>TIER 02 // THREE HARDEST ARCHITECTURAL DECISIONS</span>
          <span className="flex-1 h-[1px] bg-white/10" />
        </div>

        <div className="space-y-8">
          {data.decisions.map((dec) => (
            <div
              key={dec.number}
              className="p-8 rounded-2xl border border-white/15 bg-neutral-900/80 backdrop-blur-xl shadow-xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] font-bold text-amber-400">
                  DECISION {dec.number}
                </span>
                <span className="flex-1 h-[1px] bg-white/10" />
              </div>

              <h3 className="font-serif text-[26px] sm:text-[30px] font-medium text-white leading-tight">
                {dec.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-rose-300 mb-1">
                    The System Tension
                  </div>
                  <p className="font-sans text-[13.5px] text-white/75 font-light leading-relaxed">
                    {dec.tension}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-emerald-300 mb-1">
                    The Architectural Decision
                  </div>
                  <p className="font-sans text-[13.5px] text-white/75 font-light leading-relaxed">
                    {dec.decision}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-[11px]">
                <div className="text-white/60">
                  <strong className="text-white">Trade-off Accepted:</strong> {dec.tradeoff}
                </div>
                <div className="px-3 py-1 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  {dec.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* TIER 3: LIVE PROTOTYPE MODAL PLACEHOLDER                       */}
      {/* ============================================================== */}
      <section className="p-8 rounded-2xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl shadow-2xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-400 mb-2">
          TIER 03 // LIVE PROTOTYPE RUNTIME EMBED
        </div>
        <h3 className="font-serif text-[28px] font-medium text-white mb-2">
          {data.prototypeTitle}
        </h3>
        <p className="font-sans text-[14px] text-white/70 font-light leading-relaxed mb-6">
          {data.prototypeDesc}
        </p>

        {/* Mock UI Frame Placeholder */}
        <div className="mb-6">
          {data.renderMockUiFrame()}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {data.prototypeSpecs.map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-white/70"
              >
                {spec}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowPrototypeModal(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black font-sans text-[12px] font-semibold hover:bg-amber-300 transition-colors shadow-lg"
          >
            Launch Fullscreen Prototype Modal ↗
          </button>
        </div>
      </section>

      {/* Fullscreen Interactive Prototype Modal */}
      {showPrototypeModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-8">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/20 bg-neutral-950 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                {data.title.toUpperCase()} // PROTOTYPE RUNTIME PREVIEW
              </span>
              <button
                type="button"
                onClick={() => setShowPrototypeModal(false)}
                className="font-mono text-[12px] px-3 py-1 rounded-full border border-white/20 text-white/70 hover:bg-white/10"
              >
                EXIT SIMULATOR ✕
              </button>
            </div>

            <div className="my-8 flex items-center justify-center min-h-[340px]">
              {data.renderMockUiFrame()}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between font-mono text-[10px] text-white/40">
              <span>Prototype Sandbox: No Network Required</span>
              <span>Deterministic Mode</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
