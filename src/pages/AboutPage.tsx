import { useState, type CSSProperties } from "react";
import { Link } from "@/router/Router";
import { MusicWidgetHost, type MusicWidgetStyle } from "@/components/music/MusicWidgetHost";

const CHAPTERS = [
  {
    id: "visual-foundation",
    index: "Ch. 01",
    title: "The visual foundation",
    body: [
      "I didn't start in design — I started with images. Years of photography and editing taught me where the eye lands, what feels heavy, and why some combinations feel inevitable, long before I could explain any of it in design language.",
      "Posters for college fests, retouched frames, half-finished edits — the messy work taught me more than polished decks ever did. Composition stopped being taste and became a method.",
    ],
  },
  {
    id: "systems-shift",
    index: "Ch. 02",
    title: "The systems shift",
    body: [
      "Organising events and rebuilding the systems around them turned visual instinct into product practice. I learned that a screen is downstream of a decision — name the decision a person is making, and the layout mostly designs itself.",
      "That conviction runs through everything since: design the decision, not the screen. Prototype the doubt. A clickable rough thing ends arguments faster than another slide.",
    ],
  },
  {
    id: "autonomous-intelligence",
    index: "Ch. 03",
    title: "Autonomous intelligence",
    body: [
      "Now I design in the AI and interaction space — interfaces where the system acts and the human authorizes. Sentinel runs on a constitution: TALON proposes, Asha disposes, silence sends nothing, and every number admits where it came from. LokAI refuses percentages because a fabricated confidence score is a lie a demo can't survive. Feul deleted a mechanic I designed because it taxed the user's trust to protect the platform. Each one is about a person understanding what's happening and knowing what to do next.",
      "I build my own prototypes in code until my instincts catch up with my taste — state machines, verify gates and all. This site is one of them.",
    ],
  },
];

const TIMELINE = [
  { period: "2026", title: "FlytBase Sentinel", detail: "Autonomous aerial command interface, kept building — TALON copilot, terrain engine, 45 verification gates" },
  { period: "2025 → 2026", title: "LokAI", detail: "Material+ Buildathon Top 10 — rebuilt as a governed first-action flow with a verify gate and Urdu RTL" },
  { period: "2026", title: "Feul", detail: "Startup-origin concept — voice-data marketplace; payout architecture and a measured redesign program" },
  { period: "2024 →", title: "Product Design & Engineering Practice", detail: "Self-directed systems, prototypes, and visual engineering" },
];

const FILM_SLIDES = [
  {
    id: "s1",
    title: "Tunnel of Trees",
    exif: "Unsplash",
    loc: "mood: green quiet",
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s2",
    title: "Shoreline at Dawn",
    exif: "Unsplash",
    loc: "mood: water first light",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s3",
    title: "Cat, Resting",
    exif: "Unsplash",
    loc: "mood: patience",
    src: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s4",
    title: "Lake at Dusk",
    exif: "Unsplash",
    loc: "mood: open air",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s5",
    title: "Ridges in Fog",
    exif: "Unsplash",
    loc: "mood: layered distance",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
  },
];

const TOOL_GROUPS = [
  { group: "Design & systems", tools: ["Figma", "Design Systems Tokens", "Framer", "Vector Choreography", "Typography"] },
  { group: "Engineering & runtimes", tools: ["React 19", "TypeScript", "Next.js", "WebGL2 / GLSL", "Tailwind CSS", "Vite"] },
  { group: "Autonomous intelligence", tools: ["Claude / Anthropic", "Cursor AI", "Python / PyTorch", "Deterministic Boundary Gates", "Acoustic Signal Processing"] },
];

export function AboutPage({
  externalMusicStyle,
}: {
  externalMusicStyle?: MusicWidgetStyle;
}) {
  const [activeSlide, setActiveSlide] = useState<string | null>(null);
  const slide = FILM_SLIDES.find((s) => s.id === activeSlide) ?? null;

  return (
    <div className="veil-sky relative w-full pb-28 select-text text-white">
      <div className="sky-veil" aria-hidden="true" />
      <header className="page-head" data-reveal>
        <p className="atmo-kicker">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="opacity-50"> · About</span>
        </p>
        <h1 className="atmo-title">Life outside pixels is still pixels</h1>
        <p className="atmo-body">
          From photography and composition to decision architecture and
          autonomous intelligence.
        </p>
      </header>

      {/* one shell container — the grid shares the page-head title edge */}
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: portrait & soundtrack, sticky */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5" data-reveal>
          <div className="panel relative p-4">
            <div className="relative aspect-[4/5] w-full rounded-[14px] overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-950">
              <img
                src="/portrait-cutout.png"
                alt="Rudraksh Singh"
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-x-3 bottom-3 p-3.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/10">
                <span className="font-serif text-[18px] text-white block">Rudraksh Singh</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] block mt-1" style={{ color: "var(--ui-dim)" }}>
                  Product Designer &amp; Engineer
                </span>
                <span className="font-mono text-[9px] block mt-0.5" style={{ color: "var(--ui-faint)" }}>
                  Greater Noida, India · IST
                </span>
              </div>
            </div>
            <div
              className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] px-1"
              style={{ color: "var(--ui-faint)" }}
            >
              <span>Plate · Portrait // 2026</span>
              <span>Drawn portrait — not a photograph</span>
            </div>
          </div>

          {/* Switchable music player — handcrafted, kept as-is */}
          <MusicWidgetHost defaultStyle="pinui" externalStyle={externalMusicStyle} />
        </div>

        {/* Right: chapters, film slides, chronology, tools */}
        <div className="lg:col-span-7 space-y-20">
          <div className="space-y-14">
            {CHAPTERS.map((ch, i) => (
              <article key={ch.id} className="about-chapter" data-reveal style={{ ["--rd" as string]: i } as CSSProperties}>
                <p className="microlabel">{ch.index}</p>
                <h2>{ch.title}</h2>
                {ch.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </article>
            ))}
          </div>

          {/* image moodboard — credited, not claimed as personal photography */}
          <div data-reveal>
            <p className="microlabel mb-1">Image moodboard · via Unsplash</p>
            <h3 className="font-serif text-[24px] text-white mb-6" style={{ fontWeight: 400 }}>
              Frames outside the screen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {FILM_SLIDES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlide(s.id)}
                  className="about-slide text-left"
                >
                  <span className="about-slide-frame block">
                    <img src={s.src} alt={s.title} loading="lazy" />
                    <span className="about-slide-peek">Inspect frame ↗</span>
                  </span>
                  <span className="about-slide-cap">
                    <span className="t truncate">{s.title}</span>
                    <span className="e">{s.exif}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chronology */}
          <div data-reveal>
            <p className="microlabel mb-1">Chronology</p>
            <h3 className="font-serif text-[24px] text-white mb-4" style={{ fontWeight: 400 }}>
              Experience &amp; challenges
            </h3>
            <div>
              {TIMELINE.map((item) => (
                <div key={item.title} className="timeline-row">
                  <span className="when">{item.period}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div data-reveal>
            <p className="microlabel mb-1">Capabilities</p>
            <h3 className="font-serif text-[24px] text-white mb-6" style={{ fontWeight: 400 }}>
              Tools &amp; materials
            </h3>
            <div className="space-y-7">
              {TOOL_GROUPS.map((tg) => (
                <div key={tg.group}>
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2.5"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {tg.group}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tg.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1.5 rounded-full border font-mono text-[10px]"
                        style={{ borderColor: "var(--hairline)", color: "var(--ui-dim)", background: "rgba(12,16,28,0.3)" }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Frame inspection lightbox — the single one */}
      {slide && (
        <div className="veil-modal" onClick={() => setActiveSlide(null)}>
          <div
            className="veil-modal-sheet w-full max-w-3xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <span className="microlabel">Moodboard · {slide.loc}</span>
              <button type="button" className="veil-close" onClick={() => setActiveSlide(null)}>
                Close
              </button>
            </div>
            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black mb-5">
              <img src={slide.src} alt={slide.title} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="font-serif text-[20px] text-white">{slide.title}</div>
              <div className="font-mono text-[10.5px]" style={{ color: "var(--ui-dim)" }}>
                {slide.exif}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
