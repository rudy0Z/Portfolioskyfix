import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "@/router/Router";

type FilterKey = "all" | "autonomous" | "legal" | "systems" | "experiments";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All works" },
  { key: "autonomous", label: "Autonomous & AI" },
  { key: "legal", label: "Legal & fintech" },
  { key: "systems", label: "Design systems" },
  { key: "experiments", label: "Experiments" },
];

const SPECIMENS = [
  {
    id: "sentinel",
    title: "FlytBase Sentinel",
    tagline: "Wildfire initial-attack aerial command interface. TALON assembles the evidence, a human authorizes — exercise run 7:12 against a 38-minute baseline.",
    year: "2026",
    cat: "autonomous",
    badge: "Autonomous aerial command · prototype",
    href: "/case/sentinel",
  },
  {
    id: "lokai",
    title: "LokAI",
    tagline: "Deterministic Indian legal-AI companion that verifies facts before assessing — four laws, gate-checked in code.",
    year: "2025 → 2026",
    cat: "legal",
    badge: "Material+ Buildathon Top 10 · rebuilt",
    href: "/case/lokai",
  },
  {
    id: "feul",
    title: "Feul",
    tagline: "Vernacular voice-data marketplace where the contributor sees the pay formula before recording — ₹100 withdrawable in session one.",
    year: "2026",
    cat: "legal",
    badge: "Startup engagement · continued independently",
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
    status: "Internal tool",
  },
];

const EXPERIMENTS = [
  { name: "ASCII field shaders", tech: "WebGL2 · GLSL", status: "Active", cat: "experiments" },
  { name: "Risograph halftone kit", tech: "Figma Plugin · Canvas", status: "Shipped", cat: "systems" },
  { name: "Scroll choreography engine", tech: "GSAP · ScrollTrigger", status: "Shipped", cat: "systems" },
  { name: "Physics ragdoll artifacts", tech: "Matter.js · Verlets", status: "Exploration", cat: "experiments" },
  { name: "Matrix botanical typography", tech: "HTML5 Canvas · Curves", status: "Shipped here", cat: "experiments" },
  { name: "24-hour living sky engine", tech: "OKLCH Linear · WebGL", status: "Shipped here", cat: "autonomous" },
];

export function ProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visibleSpecimens = useMemo(
    () => (filter === "all" ? SPECIMENS : SPECIMENS.filter((s) => s.cat === filter)),
    [filter],
  );
  const visibleMvps = useMemo(
    () => (filter === "all" ? MVPS : MVPS.filter((m) => m.cat === filter)),
    [filter],
  );
  const visibleExperiments = useMemo(
    () => (filter === "all" ? EXPERIMENTS : EXPERIMENTS.filter((e) => e.cat === filter)),
    [filter],
  );

  return (
    <div className="veil-sky relative w-full pb-28 select-text text-white">
      <div className="sky-veil" aria-hidden="true" />
      <header className="page-head" data-reveal>
        <p className="atmo-kicker">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="opacity-50"> · Projects</span>
        </p>
        <h1 className="atmo-title">Selected &amp; experimental works</h1>
        <p className="atmo-body">
          Flagship case studies, client MVPs, and design-engineering experiments
          — each one taken from the first awkward question to a working build.
        </p>
      </header>

      {/* one shell container — shares the page-head title edge */}
      <div className="shell">
        {/* Filters — quiet pills, sticky under the top row */}
        <div className="sticky top-20 z-30 py-3 -mx-1 px-1 mb-12" data-reveal>
          <div className="chip-row">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`chip${filter === f.key ? " is-active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case studies — hairline editorial rows */}
        {visibleSpecimens.length > 0 && (
          <section className="mb-20" data-reveal>
            <p className="microlabel mb-4">Case studies</p>
            <div className="row-list">
              {visibleSpecimens.map((spec, i) => (
                <Link
                  key={spec.id}
                  href={spec.href}
                  className="row-item"
                  data-reveal
                  style={{ ["--rd" as string]: i } as CSSProperties}
                >
                  <span className="row-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="row-title">{spec.title}</span>
                    <span className="row-tag">{spec.tagline}</span>
                  </span>
                  <span className="meta-row row-meta-end">
                    <span>{spec.badge}</span>
                    <span>{spec.year}</span>
                  </span>
                  <span className="row-arw" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Client MVPs */}
        {visibleMvps.length > 0 && (
          <section className="mb-20" data-reveal>
            <p className="microlabel mb-4">Client MVPs</p>
            <div className="row-list">
              {visibleMvps.map((mvp) => (
                <div key={mvp.title} className="row-item">
                  <span className="row-index" aria-hidden="true">·</span>
                  <span>
                    <span className="row-title">{mvp.title}</span>
                    <span className="row-tag">{mvp.tagline}</span>
                  </span>
                  <span className="meta-row row-meta-end">
                    <span>{mvp.status}</span>
                    <span>{mvp.year}</span>
                  </span>
                  <span className="row-arw" aria-hidden="true" style={{ opacity: 0.3 }}>·</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experiments — dense index */}
        {visibleExperiments.length > 0 && (
          <section data-reveal>
            <p className="microlabel mb-4">Experiments &amp; artifacts</p>
            <div className="row-list">
              {visibleExperiments.map((exp) => (
                <div key={exp.name} className="exp-row">
                  <span className="exp-name">{exp.name}</span>
                  <span className="exp-tech">{exp.tech}</span>
                  <span className="exp-status">{exp.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
