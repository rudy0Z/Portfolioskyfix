import { useEffect, useRef } from "react";
import { Link } from "@/router/Router";
import { SentinelTacticalHud } from "@/components/SentinelTacticalHud";

interface FlagshipProject {
  id: string;
  index: string;
  title: string;
  year: string;
  discipline: string;
  summary: string;
  proof: string;
  caseHref: string;
  cover: string;
  coverAlt: string;
  coverAspect: string;
  coverVideo?: string;
}

const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    id: "sentinel",
    index: "01",
    title: "FlytBase Sentinel",
    year: "2026",
    discipline: "Autonomous systems · Emergency command",
    summary:
      "Wildfire command console where AI assembles dual-feed evidence and a human authorizes escalation.",
    proof: "7:12 exercise run against a 38-minute baseline · 0 silent executions on lapse",
    caseHref: "/case/sentinel",
    cover: "/sentinel-cover.jpg",
    coverAlt: "FlytBase Sentinel console on night watch — fleet, fire weather, and dark terrain",
    coverAspect: "16 / 10",
  },
  {
    id: "lokai",
    index: "02",
    title: "LokAI",
    year: "2025–2026",
    discipline: "Legal AI · Consumer protection",
    summary:
      "Deterministic legal companion that verifies facts first, cites exact statutes, and stops when uncertain.",
    proof: "Four laws, gate-checked in code · Five language packs including Urdu RTL",
    caseHref: "/case/lokai",
    cover: "/lokai_cover.jpg",
    coverAlt: "LokAI — the voice front door and the notice finding, in the Gazette register",
    coverAspect: "16 / 10",
  },
  {
    id: "feul",
    index: "03",
    title: "Feul",
    year: "2026",
    discipline: "Vernacular voice AI · Contributor platform",
    summary:
      "Voice-data marketplace showing coverage pay formulas transparently before contributors record.",
    proof: "₹100 withdrawable in session one · Security Reserve deleted after research",
    caseHref: "/case/feul",
    cover: "/feulai_cover.jpg",
    coverAlt: "Feul — the contributor home and the job economics sheet with the coverage multiplier",
    coverAspect: "16 / 10",
  },
];

function CoverVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!el) return;
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    let last = -1;
    let stuck = 0;
    const id = window.setInterval(() => {
      if (el.paused || el.readyState < 3 || !el.duration) {
        last = -1;
        stuck = 0;
        return;
      }
      if (el.currentTime >= el.duration - 0.05) {
        el.currentTime = 0;
        last = -1;
        stuck = 0;
        return;
      }
      if (el.currentTime === last) {
        stuck += 1;
        if (stuck >= 2) {
          el.load();
          void el.play().catch(() => {});
          stuck = 0;
          last = -1;
        }
      } else stuck = 0;
      last = el.currentTime;
    }, 1000);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, []);
  return (
    <video
      ref={ref}
      className="work-cover-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={-1}
      aria-hidden="true"
    >
      <source src={src} type="video/webm" />
    </video>
  );
}

/** Borderless architectural media frame — zero fake browser chrome, explicit aspectRatio for zero-CLS. */
function ShowcaseMedia({ proj }: { proj: FlagshipProject }) {
  return (
    <Link href={proj.caseHref} className="work-viewport-link" aria-label={`Open ${proj.title} case study`}>
      <figure className="work-viewport">
        <div className="work-viewport-screen" style={{ aspectRatio: proj.coverAspect }}>
          <img
            src={proj.cover}
            alt={proj.coverAlt}
            loading={proj.index === "01" ? "eager" : "lazy"}
          />
          {proj.coverVideo && <CoverVideo src={proj.coverVideo} />}
        </div>
      </figure>
    </Link>
  );
}

export function StackingProjects() {
  return (
    <section id="work" className="stacking-projects-section relative w-full">
      <div id="projects" className="absolute -top-24" />

      <div className="shell">
        <header className="work-editorial-head" data-reveal>
          <p className="work-editorial-kicker">Selected Work · 01 — 03</p>
          <h2 className="work-editorial-title">
            Where <em>human judgment</em> meets autonomous systems.
          </h2>
        </header>

        {/* Three Flagship Case Study Cards — concise, visual-first, zero fake browser chrome */}
        <div className="work-stack-list">
          {FLAGSHIP_PROJECTS.map((proj, idx) => (
            <article
              key={proj.id}
              id={`project-card-${proj.id}`}
              className="work-stack"
              data-reveal
              style={{
                top: `calc(5.25rem + ${idx * 20}px)`,
                zIndex: 10 + idx,
              }}
            >
              <div className="work-stack-grid">
                <div className="work-stack-body">
                  <div className="work-stack-meta">
                    <span className="work-stack-index">{proj.index}</span>
                    <span className="work-stack-meta-sep" aria-hidden="true">·</span>
                    <span className="work-stack-year">{proj.year}</span>
                    <span className="work-stack-meta-sep" aria-hidden="true">—</span>
                    <span className="work-stack-discipline">{proj.discipline}</span>
                  </div>

                  <h3 className="work-stack-name">{proj.title}</h3>
                  <p className="work-stack-summary">{proj.summary}</p>
                  <p className="work-proof">{proj.proof}</p>

                  <div className="work-stack-cta">
                    <Link href={proj.caseHref} className="work-cta-btn">
                      Read case study
                      <span className="work-cta-arrow" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                {proj.id === "sentinel" ? (
                  <div className="work-media-col">
                    <SentinelTacticalHud />
                  </div>
                ) : (
                  <div className="work-media-col">
                    <ShowcaseMedia proj={proj} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="works-mist" aria-hidden="true" />
    </section>
  );
}
