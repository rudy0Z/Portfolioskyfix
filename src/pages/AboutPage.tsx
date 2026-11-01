import { useState } from "react";
import { Link } from "@/router/Router";
import { MusicWidgetHost, type MusicWidgetStyle } from "@/components/music/MusicWidgetHost";

const CHAPTERS = [
  {
    id: "visual-foundation",
    index: "CH.01",
    title: "The Visual Foundation",
    body: [
      "I didn't start in design — I started with images. Years of photography and editing taught me where the eye lands, what feels heavy, and why some combinations feel inevitable, long before I could explain any of it in design language.",
      "Posters for college fests, retouched frames, half-finished edits — the messy work taught me more than polished decks ever did. Composition stopped being taste and became a method.",
    ],
  },
  {
    id: "systems-shift",
    index: "CH.02",
    title: "The Systems Shift",
    body: [
      "Organising events and rebuilding the systems around them turned visual instinct into product practice. I learned that a screen is downstream of a decision — name the decision a person is making, and the layout mostly designs itself.",
      "That conviction runs through everything since: design the decision, not the screen. Prototype the doubt. A clickable rough thing ends arguments faster than another slide.",
    ],
  },
  {
    id: "autonomous-intelligence",
    index: "CH.03",
    title: "Autonomous Intelligence",
    body: [
      "Now I design in the AI and interaction space — interfaces where the system acts and the human authorizes. Sentinel's 90-second verification window, LokAI's boundary gates, Feul's visible payout contract: each is about a person understanding what's happening and knowing what to do next.",
      "I build my own prototypes in code until my instincts catch up with my taste. This site is one of them.",
    ],
  },
];

const TIMELINE = [
  { period: "2026", title: "FlytBase Sentinel", detail: "Independent challenge concept — emergency response aerial command interface" },
  { period: "2025", title: "LokAI", detail: "Hackathon flagship — deterministic legal triage with boundary-safe AI responses" },
  { period: "2025", title: "Feul.AI", detail: "Startup-origin concept — voice-data marketplace for vernacular contributors" },
  { period: "2024 →", title: "Product Design & Engineering Practice", detail: "Self-directed systems, prototypes, and visual engineering" },
];

const FILM_SLIDES = [
  {
    id: "s1",
    title: "Tunnel of Trees",
    exif: "35mm · f/2.8 · ISO 100",
    loc: "Monsoon Wetland Passage",
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s2",
    title: "Riverboats at Dawn",
    exif: "50mm · f/1.8 · ISO 200",
    loc: "Tapi River Bank",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s3",
    title: "Solitary Egret",
    exif: "85mm · f/4.0 · ISO 160",
    loc: "Estuary Wildlife Refuge",
    src: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s4",
    title: "Stratosphere Kite",
    exif: "24mm · f/5.6 · ISO 100",
    loc: "Coastal Horizon Wind",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s5",
    title: "Lunar Horizon",
    exif: "200mm · f/8.0 · ISO 400",
    loc: "Night Sky Observation",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
  },
];

const TOOL_GROUPS = [
  { group: "Design & Systems", tools: ["Figma", "Design Systems Tokens", "Framer", "Vector Choreography", "Typography"] },
  { group: "Engineering & Runtimes", tools: ["React 19", "TypeScript", "Next.js", "WebGL2 / GLSL", "Tailwind CSS", "Vite"] },
  { group: "Autonomous Intelligence", tools: ["Claude / Anthropic", "Cursor AI", "Python / PyTorch", "Deterministic Boundary Gates", "Acoustic Signal Processing"] },
];

export function AboutPage({
  externalMusicStyle,
}: {
  externalMusicStyle?: MusicWidgetStyle;
}) {
  const [activeSlide, setActiveSlide] = useState<string | null>(null);

  return (
    <div className="about-page relative w-full pt-28 pb-32 px-4 sm:px-8 max-w-6xl mx-auto select-text text-white">
      {/* Header Breadcrumb */}
      <div className="mb-14">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 mb-3">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-amber-300">EXPLORER&apos;S STUDIO // ABOUT</span>
        </div>
        <h1 className="font-serif text-[42px] sm:text-[60px] font-normal leading-[1.05] tracking-tight">
          Life Outside Pixels is Still Pixels
        </h1>
        <p className="mt-3 font-sans text-[17px] text-white/70 max-w-2xl font-light leading-relaxed">
          From photography and composition to decision architecture and autonomous intelligence.
        </p>
      </div>

      {/* Two Column Layout: Sticky Left Profile & Soundtrack, Right Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Portrait & Switchable Music Player */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          {/* Portrait Paper Card with Real Cutout */}
          <div className="p-4 rounded-2xl border border-white/15 bg-neutral-900/80 backdrop-blur-xl shadow-2xl">
            <div className="relative aspect-[4/5] w-full rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 flex flex-col items-center justify-end p-6 text-center border border-white/5 overflow-hidden">
              <img
                src="/portrait-cutout.png"
                alt="Rudraksh Singh"
                className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.05]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="relative z-10 w-full p-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                <span className="font-serif text-[18px] font-medium text-white block">Rudraksh Singh</span>
                <span className="font-mono text-[9.5px] uppercase tracking-widest text-amber-300 block mt-0.5">
                  SYSTEMS &amp; PRODUCT DESIGNER
                </span>
                <span className="font-mono text-[9px] text-white/50 block mt-1">
                  SURAT, INDIA · 21°N
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-wider text-white/50 px-1">
              <span>PLATE · PORTRAIT // 2026</span>
              <span>CANON EOS 35MM</span>
            </div>
          </div>

          {/* Switchable Music Player Widget */}
          <MusicWidgetHost defaultStyle="pinui" externalStyle={externalMusicStyle} />
        </div>

        {/* Right Column: 3 Chapters, Timeline, Tools, Film Slide Gallery */}
        <div className="lg:col-span-7 space-y-20">
          {/* 3 Chapters */}
          <div className="space-y-16">
            {CHAPTERS.map((ch) => (
              <article key={ch.id} className="p-6 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  {ch.index}
                </span>
                <h2 className="font-serif text-[30px] sm:text-[38px] font-medium leading-tight text-white mt-2 mb-4">
                  {ch.title}
                </h2>
                <div className="space-y-4 font-sans text-[15px] font-light leading-relaxed text-white/80">
                  {ch.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Film Slide Mounts Gallery (35mm Photography) */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
              OBSERVATORY // 35MM FILM SLIDE ARCHIVE
            </div>
            <h3 className="font-serif text-[24px] font-medium text-white mb-6">
              Snapshots Outside the Screen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {FILM_SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  onClick={() => setActiveSlide(slide.id)}
                  className="group relative p-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-1"
                >
                  {/* Film Slide Perforated Frame with Real Image */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/70 border border-white/10 mb-2.5">
                    <img
                      src={slide.src}
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-amber-300">
                        CLICK TO INSPECT FRAME ↗
                      </span>
                    </div>
                  </div>
                  <div className="font-sans text-[13px] text-white font-medium truncate">
                    {slide.title}
                  </div>
                  <div className="font-mono text-[8.5px] uppercase tracking-wider text-white/50 flex justify-between mt-1">
                    <span>{slide.exif}</span>
                    <span className="text-amber-400">{slide.id.toUpperCase()}</span>
                  </div>
                  <div className="font-sans text-[10.5px] text-white/40 truncate mt-0.5">
                    {slide.loc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fullscreen Snapshot Inspection Modal */}
          {activeSlide && (() => {
            const slide = FILM_SLIDES.find((s) => s.id === activeSlide);
            if (!slide) return null;
            return (
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-8"
                onClick={() => setActiveSlide(null)}
              >
                <div
                  className="relative max-w-3xl w-full rounded-2xl border border-white/20 bg-neutral-950 p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300">
                      35MM FRAME INSPECTION // {slide.id.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(null)}
                      className="font-mono text-[14px] text-white/50 hover:text-white"
                    >
                      ✕ ESC
                    </button>
                  </div>
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black mb-4">
                    <img src={slide.src} alt={slide.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] text-white/70">
                    <div>
                      <span className="text-white font-bold">{slide.title}</span> — <span>{slide.loc}</span>
                    </div>
                    <div className="text-amber-300 font-semibold">{slide.exif}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Experience Timeline */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
              CHRONOLOGY // FLIGHT RECORD
            </div>
            <h3 className="font-serif text-[24px] font-medium text-white mb-6">
              Experience &amp; Challenges
            </h3>
            <div className="space-y-6">
              {TIMELINE.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="font-mono text-[11px] font-bold text-amber-300 w-16 pt-0.5">
                    {item.period}
                  </span>
                  <div>
                    <h4 className="font-sans text-[15px] font-semibold text-white">
                      {item.title}
                    </h4>
                    <p className="font-sans text-[13px] text-white/60 font-light mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Engineering Matrix */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
              SYSTEM CAPABILITIES // TOOL MATRIX
            </div>
            <h3 className="font-serif text-[24px] font-medium text-white mb-6">
              Core Competencies
            </h3>
            <div className="space-y-6">
              {TOOL_GROUPS.map((tg) => (
                <div key={tg.group}>
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white/70 mb-2">
                    {tg.group}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tg.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10.5px] text-white/85"
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
      {/* Film Slide Lightbox Modal */}
      {activeSlide && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setActiveSlide(null)}
        >
          <div className="relative p-8 rounded-3xl border border-white/20 bg-neutral-900 text-center max-w-md">
            <div className="font-mono text-[10px] text-amber-300 uppercase tracking-widest mb-2">
              35MM CHROMOGENIC SLIDE MOUNT
            </div>
            <div className="aspect-[4/3] rounded-xl bg-black border border-white/10 flex items-center justify-center p-6 mb-4">
              <span className="font-serif text-[24px] text-white">
                {FILM_SLIDES.find((s) => s.id === activeSlide)?.title}
              </span>
            </div>
            <div className="font-mono text-[11px] text-white/70">
              {FILM_SLIDES.find((s) => s.id === activeSlide)?.exif}
            </div>
            <div className="font-sans text-[12px] text-white/50 mt-1">
              {FILM_SLIDES.find((s) => s.id === activeSlide)?.loc}
            </div>
            <button
              type="button"
              className="mt-6 px-4 py-1.5 rounded-full border border-white/20 font-mono text-[10px] text-white/70 hover:bg-white/10"
              onClick={() => setActiveSlide(null)}
            >
              Close Slide ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
