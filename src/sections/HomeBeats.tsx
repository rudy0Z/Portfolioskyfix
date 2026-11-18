/**
 * HomeBeats — the homepage buildout (synthesis §"Homepage fullness").
 *
 * Six beats between the work stack and the footer pavilion:
 *   1. manifesto interstitial      2. recognition as prose
 *   3. the greenhouse (six cards)  4. FAQ — answered straight
 *   5. NOW strip                   6. colophon card
 *
 * Voice rules this file obeys: every claim is a receipt, not a boast — the
 * proof pointers name artifacts that actually exist and run on this very
 * page; no invented metrics, no testimonials, no fake logos, no fake links.
 * Styles live in src/styles/home-beats.css (hb-* classes only).
 */
import { useState, type CSSProperties } from "react";
import { formatTime, phaseAt } from "@/lib/timeOfDay";
import { glideSkyTime, syncToLocalTime, useSkyTime, useSyncState } from "@/lib/useTimeOfDay";
import "./../styles/home-beats.css";

/* ── Craft in Action + What I Can Own From Week One (CARBON_SPRINT_CONTEXT §6) ── */
const SOLAR_TEST_STATES: { label: string; timeLabel: string; hour: number; note: string }[] = [
  { label: "Dawn", timeLabel: "06:25", hour: 6.42, note: "Frosted alabaster · low warm horizon" },
  { label: "Noon", timeLabel: "12:00", hour: 12.0, note: "High-glare sky · ~15:1 slate contrast" },
  { label: "Golden", timeLabel: "17:45", hour: 17.75, note: "Volumetric shafts · terracotta rim" },
  { label: "Midnight", timeLabel: "01:00", hour: 1.0, note: "Obsidian mineral glass · ~15.8:1 ivory" },
];

const WEEK_ONE_PILLARS: { index: string; title: string; body: string }[] = [
  {
    index: "01",
    title: "Decision-Heavy AI & Systems Design",
    body: "Complex state-machine UI, explicit human-authority gates, error boundaries, and failure-mode mitigation designed before touching surface polish.",
  },
  {
    index: "02",
    title: "Code-Grade Prototyping",
    body: "Full React + TypeScript prototypes from day one — testing timers, statutory refusals, and edge states directly in code to eliminate handoff friction.",
  },
  {
    index: "03",
    title: "Production Component Craft",
    body: "Tactile micro-interactions, keyboard-first accessibility, GPU frame-budget governors, and strict zero-CLS container geometry.",
  },
];

/* ── NOW strip — the one place on the site that must be kept current. ─────
   Three lines, one date. Edit here, nowhere else. */
const NOW_WHEN = "November 2026";
const NOW_LINES: { tag: string; text: string }[] = [
  {
    tag: "This week",
    text: "Shipping the Sky Field rework — saturated palette, light shafts, and a mist exit for the hero.",
  },
  {
    tag: "In the cut",
    text: "Cutting the Sentinel motion reel for the case study's empty video slot.",
  },
  {
    tag: "Ongoing",
    text: "Refining the three case studies against the final project builds.",
  },
];

/* ── the greenhouse — artifacts that are already real, currently unnamed ── */

const GREENHOUSE: { index: string; name: string; pitch: string; proof: string }[] = [
  {
    index: "01",
    name: "24-hour sky engine",
    pitch: "The sky above you — it drives every colour on this page.",
    proof: "Live right now · one OKLCH palette follows the sun across 24 hours, and the type, glass and garden all read from it.",
  },
  {
    index: "02",
    name: "TypeGarden intro bloom",
    pitch: "The botanical glass intro that opened this visit.",
    proof: "Click the docked flower in the top nav — the bloom replays from seed.",
  },
  {
    index: "03",
    name: "ThermalSkyClock",
    pitch: "The instrument that sets the sky's hour.",
    proof: "Top right — scrub its horizon and the whole scene relights on the same solar model.",
  },
  {
    index: "04",
    name: "Butterfly cursor",
    pitch: "A companion with its own flight math.",
    proof: "Move your pointer across the meadow — a spring-damped flight trails a wake of pollen motes.",
  },
  {
    index: "05",
    name: "Garden field engine",
    pitch: "The meadow you just scrolled — Canvas2D with aerial-perspective bakes, gust fields, a 60fps budget.",
    proof: "A frame-budget governor watches every draw — it gives back effects before it ever drops a frame.",
  },
  {
    index: "06",
    name: "Safepatch rig",
    pitch: "The patch tooling that guards every edit to this site.",
    proof: "tools/safepatch.py — changes land as reviewed, checkable patches, not rewrites.",
  },
];

/* ── FAQ — questions, answered straight (synthesis beat 1) ─────────────── */

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do you really design and build?",
    a: "Yes — every interface on this site was drawn by me and then wired by me: the Sentinel terrain engine, LokAI's verify gate, the meadow this page sits on. Design and build aren't two roles here; they are one loop, sketch to code and back to the sketch.",
  },
  {
    q: "What does “decision-heavy” mean?",
    a: "Interfaces where a person authorizes something they will answer for — an escalation at 3 AM, a legal call, a first payout. I design the moment of judgment: what evidence is on screen, what happens when silence expires, who the system lets act. The pixels are downstream of that.",
  },
  {
    q: "These are concepts — did anything ship?",
    a: "The honest record: working prototypes and boundary lines, nothing fielded. The Sentinel harness runs five real situations in your browser, LokAI's gate fails its own build on invented numbers, and every metric on the work cards says where it came from. Zero production deployments; a checkable decision trail.",
  },
  {
    q: "How long does something like Sentinel take?",
    a: "Longer than the hackathon weekend it started in, and it isn't finished — I kept building after the deadline, and the case study says so. I don't quote tidy week-counts; I show the build instead, running.",
  },
  {
    q: "What don't you do?",
    a: "I don't invent metrics, design dark patterns, or dress up screens that take authority nobody handed them. I will tell you when an idea should be deleted — the Security Reserve in Feul was my own mechanic, and I cut it. What I won't do is protect a bad decision with good typography.",
  },
  {
    q: "What would you do first at a company?",
    a: "Sit with whoever carries the consequences of the product — the operator at 3 AM, the first-time earner — before touching a pixel. Then map every decision the interface asks a human to make, and start with the worst one.",
  },
];

/* ── colophon — the site proving itself is the honest credential ───────── */

const COLOPHON: { term: string; text: string }[] = [
  {
    term: "Sky",
    text: "A 24-hour OKLCH engine — the palette you are reading through is generated from the sun's position, not picked from a swatch file.",
  },
  {
    term: "Garden",
    text: "A Canvas2D meadow with aerial-perspective bakes, running under a frame-budget governor that keeps the draw inside budget.",
  },
  {
    term: "Workflow",
    text: "Verify-first — every change passes a typecheck and a screenshot gate before it stays.",
  },
  {
    term: "Built with",
    text: "React 19 + Vite, deployed as static files. No dashboards, no telemetry — the only numbers on this site are the ones with sources.",
  },
];

const rd = (i: number) => ({ ["--rd" as string]: i }) as CSSProperties;

/* ── beat 1 — manifesto interstitial ───────────────────────────────────── */

function Manifesto() {
  return (
    <section className="hb-manifesto" aria-label="A working belief">
      <div className="hb-manifesto-scrim" aria-hidden="true" />
      <div className="shell hb-manifesto-inner">
        <p className="microlabel" data-reveal>
          A working belief <span className="microlabel-rule" aria-hidden="true" />
        </p>
        <p className="hb-manifesto-line" data-reveal style={rd(1)}>
          Good interface design disappears when you need it most.
        </p>
      </div>
    </section>
  );
}

/* ── beat 2 — recognition as prose ─────────────────────────────────────── */

function Recognition() {
  return (
    <section className="hb-recogn" aria-label="Recognition">
      <div className="shell">
        <div className="hb-recogn-inner" data-reveal>
          <p className="microlabel">
            Recognition <span className="microlabel-rule" aria-hidden="true" />
          </p>
          <p className="hb-recogn-line">
            FlytBase Sentinel <span className="hb-dim">(Autonomous Command)</span>
            <span className="hb-sep" aria-hidden="true">·</span>
            Material+ Buildathon Top 10
            <span className="hb-sep" aria-hidden="true">·</span>
            a real voice-AI startup brief, continued independently.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── beat 3 — the greenhouse ───────────────────────────────────────────── */

function Greenhouse() {
  return (
    <section className="hb-lab" aria-label="The greenhouse">
      <div className="shell">
        <header className="hb-lab-head" data-reveal>
          <p className="microlabel">
            The greenhouse <span className="microlabel-rule" aria-hidden="true" />
          </p>
          <h2 className="hb-lab-title">
            Things already running
            <br />
            on this page
          </h2>
          <p className="hb-lab-lede">
            Not a roadmap — a lab bench. Each of these is live right now;
            the proof line tells you where to look.
          </p>
        </header>

        <div className="hb-lab-grid">
          {GREENHOUSE.map((g, i) => (
            <article key={g.index} className="hb-lab-card" data-reveal style={rd(i % 3)}>
              <div className="hb-lab-card-top">
                <span className="hb-lab-index" aria-hidden="true">{g.index}</span>
                <h3 className="hb-lab-name">{g.name}</h3>
              </div>
              <p className="hb-lab-pitch">{g.pitch}</p>
              <p className="hb-lab-proof">
                <span className="hb-lab-proof-mark" aria-hidden="true">↳</span> {g.proof}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── beat 4 — FAQ, answered straight ───────────────────────────────────── */

function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="hb-faq" aria-label="Questions, answered straight">
      <div className="shell">
        <header className="hb-faq-head" data-reveal>
          <p className="microlabel">
            Questions, answered straight <span className="microlabel-rule" aria-hidden="true" />
          </p>
          <h2 className="hb-faq-title">The questions behind the work</h2>
        </header>

        <div className="hb-faq-list">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            const btnId = `hb-faq-q-${i}`;
            const panelId = `hb-faq-a-${i}`;
            return (
              <div key={item.q} className="hb-faq-item" data-reveal style={rd(Math.min(i, 2))}>
                <h3 className="hb-faq-q">
                  <button
                    type="button"
                    id={btnId}
                    className="hb-faq-btn"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className="hb-faq-index" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="hb-faq-q-text">{item.q}</span>
                    <span className="hb-faq-chev" aria-hidden="true">
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="hb-faq-a"
                  hidden={!isOpen}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── beat 5 — NOW strip ────────────────────────────────────────────────── */

function NowStrip() {
  return (
    <section className="hb-now" aria-label={`Now — ${NOW_WHEN}`}>
      <div className="shell">
        <div className="hb-now-inner" data-reveal>
          <p className="microlabel">
            Now <span className="microlabel-rule" aria-hidden="true" /> {NOW_WHEN}
          </p>
          <ul className="hb-now-list">
            {NOW_LINES.map((line) => (
              <li key={line.tag} className="hb-now-row">
                <span className="hb-now-tag">{line.tag}</span>
                <span className="hb-now-text">{line.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── beat 6 — colophon card ────────────────────────────────────────────── */

function Colophon() {
  return (
    <section className="hb-colo" aria-label="Colophon">
      <div className="shell">
        <div className="hb-colo-card" data-reveal>
          <div className="hb-colo-head">
            <p className="microlabel">
              Colophon <span className="microlabel-rule" aria-hidden="true" />
            </p>
            <h2 className="hb-colo-title">This site is a prototype too.</h2>
          </div>
          <dl className="hb-colo-list">
            {COLOPHON.map((row) => (
              <div key={row.term} className="hb-colo-row">
                <dt className="hb-colo-term">{row.term}</dt>
                <dd className="hb-colo-text">{row.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ── beat 0 — Craft in Action (#craft) & What I Can Own From Week One ──── */

function CraftAndWeekOne() {
  const skyTime = useSkyTime();
  const { mode: syncMode } = useSyncState();
  const currentPhase = phaseAt(skyTime);
  const currentClock = formatTime(skyTime);
  const isDayTheme = skyTime >= 6.416 && skyTime <= 18.083;

  return (
    <section id="craft" className="hb-craft" aria-label="Craft in Action and Week-One Ownership">
      <div className="shell">
        <div className="hb-craft-card" data-reveal>
          <div className="hb-craft-head">
            <div>
              <p className="microlabel">
                Craft in action <span className="microlabel-rule" aria-hidden="true" /> Live diurnal system
              </p>
              <h2 className="hb-craft-title">
                Built as a working system, not a static template.
              </h2>
              <p className="hb-craft-lede">
                Every surface, border, and ink token derives from a single 24-hour OKLCH solar clock — preserving WCAG AAA contrast from midday glare to midnight watch.
              </p>
            </div>

            <div className="hb-craft-tester" role="group" aria-label="Test 24-hour solar states">
              <div className="hb-craft-status">
                <span className="hb-craft-dot" aria-hidden="true" />
                <span>
                  Sky now: <strong>{currentClock}</strong> IST ({currentPhase}) ·{" "}
                  {isDayTheme ? "Alabaster Day Theme" : "Obsidian Night Theme"}
                </span>
                {syncMode === "manual" && (
                  <button
                    type="button"
                    className="hb-craft-reset"
                    onClick={() => syncToLocalTime()}
                  >
                    Sync IST ↺
                  </button>
                )}
              </div>

              <div className="hb-craft-pills">
                {SOLAR_TEST_STATES.map((st) => {
                  const active = Math.abs(skyTime - st.hour) < 0.35;
                  return (
                    <button
                      key={st.label}
                      type="button"
                      className={`hb-craft-pill ${active ? "is-active" : ""}`}
                      aria-pressed={active}
                      onClick={() => glideSkyTime(st.hour, { duration: 680 })}
                      title={st.note}
                    >
                      <span className="hb-craft-pill-name">{st.label}</span>
                      <span className="hb-craft-pill-time">{st.timeLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hb-weekone">
            <p className="microlabel">
              What I can own from week one <span className="microlabel-rule" aria-hidden="true" />
            </p>
            <div className="hb-weekone-grid">
              {WEEK_ONE_PILLARS.map((p, i) => (
                <article key={p.index} className="hb-weekone-item" style={rd(i)}>
                  <span className="hb-weekone-index" aria-hidden="true">{p.index}</span>
                  <h3 className="hb-weekone-title">{p.title}</h3>
                  <p className="hb-weekone-body">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── the beats, in order (composition happens in App.tsx) ──────────────── */

export function HomeBeats() {
  return (
    <div className="hb-home">
      <CraftAndWeekOne />
      <Manifesto />
      <Recognition />
      <Greenhouse />
      <Faq />
      <NowStrip />
      <Colophon />
    </div>
  );
}
