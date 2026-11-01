import { useState, useMemo } from "react";
import { Link } from "@/router/Router";

type FilterKey = "all" | "autonomous" | "legal" | "systems" | "experiments";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "ALL WORKS" },
  { key: "autonomous", label: "AUTONOMOUS & AI" },
  { key: "legal", label: "LEGAL & FINTECH" },
  { key: "systems", label: "DESIGN SYSTEMS" },
  { key: "experiments", label: "EXPERIMENTS" },
];

const SPECIMENS = [
  {
    id: "sentinel",
    title: "FlytBase Sentinel",
    tagline: "Wildfire initial-attack aerial command interface. 90-second verification window, TALON AI copilot.",
    year: "2026",
    cat: "autonomous",
    badge: "Live Prototype",
    href: "/case/sentinel",
  },
  {
    id: "lokai",
    title: "LokAI",
    tagline: "Deterministic Indian legal-AI consumer-refund guide. Three-zone fact verification and statutory drafting.",
    year: "2025",
    cat: "legal",
    badge: "Material+ Top 10",
    href: "/case/lokai",
  },
  {
    id: "feul",
    title: "Feul.AI",
    tagline: "Vernacular voice-data crowdsourcing marketplace with transparent micro-payout contracts.",
    year: "2025",
    cat: "legal",
    badge: "Startup Origin",
    href: "/case/feul",
  },
];

const MVPS = [
  {
    title: "Scribble",
    tagline: "Collaborative whiteboard canvas with spatial ink clustering and low-latency vector smoothing.",
    year: "2024",
    cat: "experiments",
    status: "Client MVP",
  },
  {
    title: "Design-Blend",
    tagline: "Universal token migration orchestrator converting Figma variables to multi-brand CSS/JSON maps.",
    year: "2024",
    cat: "systems",
    status: "Internal Tool",
  },
];

const EXPERIMENTS = [
  { name: "ASCII field shaders", tech: "WebGL2 · GLSL", status: "Active", cat: "experiments" },
  { name: "Risograph halftone kit", tech: "Figma Plugin · Canvas", status: "Shipped", cat: "systems" },
  { name: "Scroll choreography engine", tech: "GSAP · ScrollTrigger", status: "Shipped", cat: "systems" },
  { name: "Physics ragdoll artifacts", tech: "Matter.js · Verlets", status: "Exploration", cat: "experiments" },
  { name: "Matrix botanical typography", tech: "HTML5 Canvas · Curves", status: "Shipped here", cat: "experiments" },
  { name: "24-Hour living sky engine", tech: "OKLCH Linear · WebGL", status: "Shipped here", cat: "autonomous" },
];

export function ProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visibleSpecimens = useMemo(() => {
    if (filter === "all") return SPECIMENS;
    return SPECIMENS.filter((s) => s.cat === filter);
  }, [filter]);

  const visibleMvps = useMemo(() => {
    if (filter === "all") return MVPS;
    return MVPS.filter((m) => m.cat === filter);
  }, [filter]);

  const visibleExperiments = useMemo(() => {
    if (filter === "all") return EXPERIMENTS;
    return EXPERIMENTS.filter((e) => e.cat === filter);
  }, [filter]);

  return (
    <div className="projects-catalog relative w-full pt-28 pb-32 px-4 sm:px-8 max-w-6xl mx-auto select-text text-white">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 mb-3">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-amber-300">FLIGHT LOG // PROJECTS CATALOG</span>
        </div>
        <h1 className="font-serif text-[42px] sm:text-[60px] font-normal leading-[1.05] tracking-tight">
          Selected &amp; Experimental Works
        </h1>
        <p className="mt-3 font-sans text-[17px] text-white/70 max-w-2xl font-light leading-relaxed">
          Three tiers of work: Flagship Autonomous &amp; Legal Systems, Client MVPs, and Design-Engineering Experiments.
        </p>
      </div>

      {/* Filter Pills */}
      <div className="sticky top-20 z-30 py-3 mb-12 flex flex-wrap gap-2 backdrop-blur-md bg-black/40 rounded-full px-4 border border-white/10">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all ${
              filter === f.key
                ? "bg-white text-black font-bold shadow-md"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tier 1: Specimen Plates */}
      {visibleSpecimens.length > 0 && (
        <section className="mb-20">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-6 flex items-center gap-2">
            <span>TIER 01 // SPECIMEN PLATES (FLAGSHIP CASE STUDIES)</span>
            <span className="flex-1 h-[1px] bg-white/10" />
          </div>
          <div className="space-y-6">
            {visibleSpecimens.map((spec) => (
              <div
                key={spec.id}
                className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-neutral-900/70 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/30 transition-all"
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 font-mono text-[10px] text-white/50 mb-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/15">
                      {spec.badge}
                    </span>
                    <span>{spec.year}</span>
                  </div>
                  <h3 className="font-serif text-[28px] font-medium text-white mb-2">
                    {spec.title}
                  </h3>
                  <p className="font-sans text-[14px] text-white/70 font-light leading-relaxed">
                    {spec.tagline}
                  </p>
                </div>
                <Link
                  href={spec.href}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-sans text-[12px] font-semibold hover:bg-amber-300 transition-colors whitespace-nowrap"
                >
                  Open Dossier →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tier 2: Consumer MVPs & Client Concepts */}
      {visibleMvps.length > 0 && (
        <section className="mb-20">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300 mb-6 flex items-center gap-2">
            <span>TIER 02 // CONSUMER APPS &amp; CLIENT MVPS</span>
            <span className="flex-1 h-[1px] bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleMvps.map((mvp) => (
              <div
                key={mvp.title}
                className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-white/50 mb-2">
                    <span>{mvp.status}</span>
                    <span>{mvp.year}</span>
                  </div>
                  <h4 className="font-serif text-[22px] font-medium text-white mb-2">
                    {mvp.title}
                  </h4>
                  <p className="font-sans text-[13.5px] text-white/70 font-light leading-relaxed mb-4">
                    {mvp.tagline}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-white/40">
                  SHIPPED PRODUCTION CODE
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tier 3: Experiments Dense Table */}
      {visibleExperiments.length > 0 && (
        <section>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
            <span>TIER 03 // DESIGN ENGINEERING EXPERIMENTS &amp; ARTIFACTS</span>
            <span className="flex-1 h-[1px] bg-white/10" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 border-b border-white/10 font-mono text-[9px] uppercase tracking-wider text-white/40">
              <span className="col-span-6">EXPERIMENT / ARTIFACT</span>
              <span className="col-span-4">STACK</span>
              <span className="col-span-2 text-right">STATUS</span>
            </div>
            <div className="divide-y divide-white/5">
              {visibleExperiments.map((exp, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors font-mono text-[12px]"
                >
                  <span className="col-span-6 font-sans text-[14px] text-white font-medium">
                    {exp.name}
                  </span>
                  <span className="col-span-4 text-white/60 text-[11px]">
                    {exp.tech}
                  </span>
                  <span className="col-span-2 text-right text-emerald-400 text-[10.5px]">
                    {exp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
