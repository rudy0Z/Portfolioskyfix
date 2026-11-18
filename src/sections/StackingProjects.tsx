import { useEffect, useRef } from "react";
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
  caseHref: string;
  badge: string;
  /** The real interface, shot at retina. Doubles as the poster for coverVideo. */
  cover: string;
  coverAlt: string;
  /** Aspect of the cover assets — reserves the screen box before the lazy img decodes. */
  coverAspect: string;
  /** Real footage cut from the running build (phase 11), muted looping VP9. */
  coverVideo?: string;
  /** honest stage label for the viewport chip */
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
      "A wildfire command console where TALON assembles the evidence and a human authorizes the escalation. The 90 seconds is a design north star — the exercise run measures 7:12 against a 38-minute baseline, and every number admits where it came from.",
    problem:
      "The sensor fires instantly; a drone can be airborne in under a minute. The 48 minutes in between are a person assembling a threat picture from disconnected tools — at 3 AM, in the dark, managing more than one zone.",
    decision:
      "Designed a constitution, not screens: two authority tiers, an alarm-budget on interrupts, provenance (measured / modeled / authored) on every number, and gates where silence expires to nothing-sent. Then built it — a Three.js terrain engine, five situation arcs, and 45 verify checks that guard the design system.",
    metrics: ["7:12 exercise-run decision", "0 silent executions on lapse", "45 verify · 35 e2e checks"],
    caseHref: "/case/sentinel",
    badge: "Autonomous aerial command · kept building",
    cover: "/case/sentinel/standby.png",
    coverAlt: "FlytBase Sentinel console on night watch — fleet, fire weather, and dark terrain",
    coverAspect: "16 / 9",
    coverVideo: "/covers/sentinel-cover.webm",
    stage: "running build",
  },
  {
    id: "lokai",
    index: "02",
    title: "LokAI",
    year: "2025 → 2026",
    discipline: "Legal AI systems · consumer protection",
    tagline:
      "The first ten minutes of an Indian consumer problem. A deterministic legal companion that verifies facts before assessing, shows the law it stands on, and stops when it can’t own the answer — in five languages, Urdu included, right-to-left.",
    problem:
      "Access-to-justice research says most people never name a private disaster as a legal problem. General AI answers anyway — confident prose, majority language, sometimes the wrong register. A person under stress will accept a confident wrong answer.",
    decision:
      "Four laws, enforced by a verify gate that fails the build: legal content lives in one store, no percentage confidence, uncertainty downgrades to caution — never a silent proceed, and nothing leaves the app without the user. The best screen is not the chat; it is the fact gate that catches her own mistakes.",
    metrics: ["4 laws, gate-checked in code", "5 full packs incl. Urdu RTL", "0 invented percentages"],
    caseHref: "/case/lokai",
    badge: "Material+ Buildathon Top 10 · rebuilt",
    cover: "/case/lokai/cover.png",
    coverAlt: "LokAI — the voice front door and the notice finding, in the Gazette register",
    coverAspect: "13 / 9",
    coverVideo: "/covers/lokai-cover.webm",
    stage: "prototype",
  },
  {
    id: "feul",
    index: "03",
    title: "Feul",
    year: "2026",
    discipline: "Vernacular voice AI · ethical contributor platform",
    tagline:
      "A voice-data marketplace where the contributor is the labour underneath Indian AI. Coverage economics shown before recording, a ₹100 first session, and a payout contract that never holds the contributor’s money.",
    problem:
      "AI labs buy coverage — speaker × dialect × district × acoustic condition — but gig platforms sell hours, hide the pay logic, and hold balances. A first-time earner who sees a hold on their money does not come back.",
    decision:
      "Researched the market from primary sources, then rebuilt everything downstream of Submit: the pay formula shown before recording, no minimum on the first withdrawal, and the deletion of my own Security Reserve mechanic — because protecting against fraud by taxing trust costs more than it saves.",
    metrics: ["₹100 withdrawable in session one", "Pay formula shown pre-record", "Security Reserve — deleted"],
    caseHref: "/case/feul",
    badge: "Startup engagement · continued independently",
    cover: "/case/feul/cover.png",
    coverAlt: "Feul — the contributor home and the job economics sheet with the coverage multiplier",
    coverAspect: "13 / 9",
    coverVideo: "/covers/feul-cover.webm",
    stage: "prototype",
  },
];

/** Phase 11: the looping cover. React sets `muted` as a DOM property only
    (no attribute), so Chromium's attribute-based autoplay heuristic never
    fires — playback is started explicitly once; if the browser refuses, the
    static cover underneath simply stays. */
function CoverVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    /* Play only while the card is on screen — the three covers stack over
       each other, so at most one or two decode at a time (three always-on
       decoders starve the compositor on software rendering). */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!el) return;
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    /* Loop watchdog — headless/software compositors can stall the media clock
       at the loop boundary or after a boundary seek (ended never fires, loop
       never wraps). If the clock stops advancing for 2 s while nominally
       playing, reload the source. Never triggers in a healthy pipeline. */
    let last = -1;
    let stuck = 0;
    const id = window.setInterval(() => {
      if (el.paused || el.readyState < 3 || !el.duration) { last = -1; stuck = 0; return; }
      if (el.currentTime >= el.duration - 0.05) { el.currentTime = 0; last = -1; stuck = 0; return; }
      if (el.currentTime === last) {
        stuck += 1;
        if (stuck >= 2) { el.load(); void el.play().catch(() => {}); stuck = 0; last = -1; }
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

/** Precision glass browser viewport — the real shipped interface floats inside. */
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
        <span className="work-viewport-live">
          <i /> {proj.stage}
        </span>
      </div>
      <div className="work-viewport-screen" style={{ aspectRatio: proj.coverAspect }}>
        <img
          src={proj.cover}
          alt={proj.coverAlt}
          loading={proj.index === "01" ? "eager" : "lazy"}
        />
        {proj.coverVideo && (
          /* phase 11: real footage from the running build, cut to the same
             aspect as the cover above — the img stays the poster + the
             reduced-motion fallback (video hides over it via global.css). */
          <CoverVideo src={proj.coverVideo} />
        )}
        <div className="work-viewport-glare" aria-hidden="true" />
      </div>
    </figure>
  );
}

export function StackingProjects() {
  return (
    <section id="work" className="stacking-projects-section relative w-full py-24">
      {/* Anchor for deep links */}
      <div id="projects" className="absolute -top-24" />

      {/* phase 9 deferral closed (phase 11): the section content now shares the
          one .shell edge with the header, the beats and the footer pavilion. */}
      <div className="shell">
        <header className="works-head" data-reveal>
          <p className="microlabel">
            Selected work <span className="microlabel-rule" aria-hidden="true" />
          </p>
          <h2 className="works-title">
            Flagship systems
            <br />
            &amp; case studies
          </h2>
          <p className="works-lede">
            Three deep studies — an emergency-response constitution, a legal-triage
            trust system, and the labour market underneath Indian voice AI.
          </p>
        </header>
  
        {/* Sticky stacking track — frosted slabs resting on the sky */}
        <div className="relative flex flex-col gap-[72px] pb-8">
          {FLAGSHIP_PROJECTS.map((proj, idx) => (
            <article
              key={proj.id}
              id={`project-card-${proj.id}`}
              className="work-stack"
              data-reveal
              style={{
                top: `calc(5.5rem + ${idx * 26}px)`,
                zIndex: 10 + idx,
              }}
            >
              <div className="work-stack-head">
                <span className="work-stack-index" aria-hidden="true">{proj.index}</span>
                <h3 className="work-stack-name">{proj.title}</h3>
                <span className="work-stack-badge">{proj.badge}</span>
              </div>
  
              <div className="work-stack-grid">
                <div>
                  <p className="work-stack-tagline">{proj.tagline}</p>
  
                  <div className="work-stack-block">
                    <p className="microlabel">The tension</p>
                    <p>{proj.problem}</p>
                  </div>
  
                  <div className="work-stack-block">
                    <p className="microlabel">The decision</p>
                    <p>{proj.decision}</p>
                  </div>
  
                  <div className="work-metrics" aria-label="Outcome metrics">
                    {proj.metrics.map((m) => (
                      <span key={m} className="work-metric">
                        {m}
                      </span>
                    ))}
                  </div>
  
                  <div className="work-stack-cta">
                    <Link href={proj.caseHref} className="btn btn-primary">
                      Read the case study
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
  
                <GlassViewport proj={proj} />
              </div>
            </article>
          ))}
        </div>
  
        {/* ── Continue to contact ── */}
        <div
          className="mt-14 pt-7 border-t border-white/10 flex flex-wrap items-center justify-between gap-4"
          data-reveal
        >
          <p className="m-0 text-[12.5px] font-light" style={{ color: "var(--ink-dim)" }}>
            More lives in conversation than on this page.
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="link-arrow"
          >
            <span>Get in touch</span>
            <span className="arw" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {/* Phase-C handoff (hero plan §6.2): the low haze the first card rises
          through — opacity is the entry envelope, written by Hero's rAF. */}
      <div className="works-mist" aria-hidden="true" />
    </section>
  );
}
