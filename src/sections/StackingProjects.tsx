import { useEffect, useRef } from "react";
import { Link } from "@/router/Router";
import { SentinelTacticalHud } from "@/components/SentinelTacticalHud";

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
  caseHref: string;
  cover: string;
  coverAlt: string;
  coverAspect: string;
  coverVideo?: string;
  stage: string;
}

const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    id: "sentinel",
    index: "01",
    title: "FlytBase Sentinel",
    year: "2026",
    discipline: "Autonomous systems · emergency response command",
    tagline:
      "A wildfire command console where TALON assembles dual-feed evidence and a human authorizes escalation. The 90-second target is a design north star — the exercise run measures 7:12 against a 38-minute baseline, and every number declares its provenance.",
    problem:
      "The sensor fires instantly; a drone can be airborne in under a minute. The 48 minutes in between are a person assembling a threat picture from disconnected tools — at 3 AM, in the dark, managing more than one zone.",
    decision:
      "Designed a constitution, not just screens: two authority tiers, an alarm-budget on interrupts, explicit provenance on every number, and gates where silence expires to nothing-sent — built with a Three.js terrain engine and 45 verify checks.",
    metrics: ["7:12 exercise-run decision", "0 silent executions on lapse", "45 verify · 35 e2e checks"],
    caseHref: "/case/sentinel",
    cover: "/sentinel-cover.jpg",
    coverAlt: "FlytBase Sentinel console on night watch — fleet, fire weather, and dark terrain",
    coverAspect: "16 / 9",
    stage: "running build",
  },
  {
    id: "lokai",
    index: "02",
    title: "LokAI",
    year: "2025–2026",
    discipline: "Legal AI systems · consumer protection",
    tagline:
      "The first ten minutes of an Indian consumer problem. A deterministic legal companion that verifies facts before assessing, shows the exact statute it stands on, and stops when it cannot own the answer — in five languages including Urdu RTL.",
    problem:
      "Most people never name a private dispute as a legal problem. General AI answers anyway with confident prose in the wrong register — and a person under stress will accept a confident wrong answer.",
    decision:
      "Four laws gate-checked in code: legal content lives in one store, zero fabricated confidence percentages, uncertainty downgrades to caution, and nothing leaves the app without explicit user consent.",
    metrics: ["4 laws, gate-checked in code", "5 packs incl. Urdu RTL", "0 invented percentages"],
    caseHref: "/case/lokai",
    cover: "/lokai_cover.jpg",
    coverAlt: "LokAI — the voice front door and the notice finding, in the Gazette register",
    coverAspect: "16 / 10",
    stage: "prototype",
  },
  {
    id: "feul",
    index: "03",
    title: "Feul",
    year: "2026",
    discipline: "Vernacular voice AI · contributor platform",
    tagline:
      "A voice-data marketplace where the contributor is the labour underneath Indian AI. Coverage economics shown transparently before recording, a ₹100 first session, and a payout contract that never holds a contributor’s balance.",
    problem:
      "AI labs buy coverage — speaker × dialect × district × acoustic condition — while gig platforms sell hours, obscure pay logic, and hold first balances. A first-time earner who sees a hold does not return.",
    decision:
      "Rebuilt everything downstream of Submit from primary research: pay formula shown pre-record, ₹100 withdrawable in session one, and deletion of my own Security Reserve mechanic because taxing trust costs more than fraud.",
    metrics: ["₹100 withdrawable in session one", "Pay formula shown pre-record", "Security Reserve deleted"],
    caseHref: "/case/feul",
    cover: "/feulai_cover.jpg",
    coverAlt: "Feul — the contributor home and the job economics sheet with the coverage multiplier",
    coverAspect: "16 / 10",
    stage: "prototype",
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

/** Clean hairline viewport — preserves explicit coverAspect for zero-CLS. */
function GlassViewport({ proj }: { proj: FlagshipProject }) {
  return (
    <figure className="work-viewport">
      <div className="work-viewport-bar" aria-hidden="true">
        <span className="work-viewport-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="work-viewport-url">{proj.caseHref}</span>
        <span className="work-viewport-stage">{proj.stage}</span>
      </div>
      <div className="work-viewport-screen" style={{ aspectRatio: proj.coverAspect }}>
        <img
          src={proj.cover}
          alt={proj.coverAlt}
          loading={proj.index === "01" ? "eager" : "lazy"}
        />
        {proj.coverVideo && <CoverVideo src={proj.coverVideo} />}
      </div>
    </figure>
  );
}

export function StackingProjects() {
  return (
    <section id="work" className="stacking-projects-section relative w-full">
      <div id="projects" className="absolute -top-24" />

      <div className="shell">
        {/* Open Editorial Section Header directly over the clearing sky (no bulky card box) */}
        <header className="work-editorial-head" data-reveal>
          <p className="work-editorial-kicker">Selected Work · 01 — 03</p>
          <h2 className="work-editorial-title">
            Where <em>human decisions</em> meet autonomous systems.
          </h2>
          <p className="work-editorial-sub">
            Three end-to-end product systems framed around real operational constraints and
            built as running code prototypes.
          </p>
        </header>

        {/* Three Flagship Architectural Slabs (zero-pill metadata, crisp hairline hierarchy) */}
        <div className="work-stack-list">
          {FLAGSHIP_PROJECTS.map((proj, idx) => (
            <article
              key={proj.id}
              id={`project-card-${proj.id}`}
              className="work-stack"
              data-reveal
              style={{
                top: `calc(5.25rem + ${idx * 22}px)`,
                zIndex: 10 + idx,
              }}
            >
              {/* Zero-pill typographic meta bar */}
              <div className="work-stack-meta">
                <div className="work-stack-meta-left">
                  <span className="work-stack-index">{proj.index}</span>
                  <span className="work-stack-meta-sep" aria-hidden="true">/</span>
                  <span className="work-stack-year">{proj.year}</span>
                </div>
                <p className="work-stack-discipline">{proj.discipline}</p>
              </div>

              <div className="work-stack-grid">
                <div className="work-stack-body">
                  <h3 className="work-stack-name">{proj.title}</h3>
                  <p className="work-stack-tagline">{proj.tagline}</p>

                  <div className="work-stack-pairs">
                    <div className="work-stack-block">
                      <p className="work-stack-label">The tension</p>
                      <p>{proj.problem}</p>
                    </div>
                    <div className="work-stack-block">
                      <p className="work-stack-label">The decision</p>
                      <p>{proj.decision}</p>
                    </div>
                  </div>

                  {/* Zero-pill typographic receipts */}
                  <ul className="work-receipts" aria-label="Verified project outcomes">
                    {proj.metrics.map((m) => (
                      <li key={m} className="work-receipt">
                        {m}
                      </li>
                    ))}
                  </ul>

                  <div className="work-stack-cta">
                    <Link href={proj.caseHref} className="work-cta-btn">
                      Read case study
                      <span className="work-cta-arrow" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                {proj.id === "sentinel" ? (
                  <SentinelTacticalHud />
                ) : (
                  <GlassViewport proj={proj} />
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
