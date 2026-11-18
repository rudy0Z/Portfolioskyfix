import { useState, type CSSProperties } from "react";
import { Link } from "@/router/Router";

interface Essay {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  excerpt: string;
  content: string[];
}

const ESSAYS: Essay[] = [
  {
    slug: "designing-the-decision-not-the-screen",
    title: "Designing the decision, not the screen",
    date: "July 2026",
    readTime: "4 min read",
    tag: "Process",
    excerpt:
      "Why I stopped starting with Figma layouts and started with the exact moment a human has to decide something under pressure.",
    content: [
      "The through-line I keep coming back to across every project: the screen is always downstream of a decision. When you open a design canvas and immediately start drawing cards, sidebars, and button hierarchies, you are solving visual composition before you have identified the cognitive tension.",
      "In FlytBase Sentinel, the question was never 'what does an aerial drone dashboard look like?' The question was: 'A fire is spreading at 14 knots toward residential ridge cabins. An operator has 90 seconds before dispatch protocol lapses. What exact evidence do they need to authorize an irreversible tanker strike without second-guessing?'",
      "Once you name that decision, the layout designs itself: suppress non-critical telemetry, pin the thermal delta, stage the mutual aid packet, and give the operator one unequivocal confirmation threshold.",
      "If you design the decision first, the pixels fall into place with architectural inevitability. If you design the screen first, you spend months debating drop shadows on widgets that shouldn't exist in the first place.",
    ],
  },
  {
    slug: "prototyping-the-doubt",
    title: "Prototyping the doubt",
    date: "June 2026",
    readTime: "5 min read",
    tag: "Craft",
    excerpt:
      "A clickable, rough prototype built in code ends stakeholder arguments faster than fifty polished slides ever could.",
    content: [
      "Whenever a team spends more than twenty minutes debating an abstract user journey, it is almost never because the problem is complex. It is because everyone is imagining a different version of the unknown.",
      "The fastest antidote to architectural paralysis is what I call prototyping the doubt. Don't build the happy path that everyone already agrees on. Build the exact corner of the flow where everyone is afraid the system will break.",
      "In LokAI, the doubt was: 'What if a consumer has no legal standing and the AI generates an unauthorized legal notice that gets them sued?' We didn't build a 50-slide presentation on AI safety. We coded a deterministic stop-tier gate that literally disabled the draft generation button when grounded evidence fell below 100%.",
      "An ugly, working prototype in code transforms subjective speculation into tangible physics. Concrete doubt can be tested, measured, and solved in an afternoon.",
    ],
  },
  {
    slug: "images-taught-me-composition",
    title: "Images taught me composition before product did",
    date: "May 2026",
    readTime: "3 min read",
    tag: "Story",
    excerpt:
      "How years behind a 35mm lens quietly taught me where the human eye lands and why certain combinations feel physically inevitable.",
    content: [
      "I didn't begin my career in design systems or interaction engineering. I started with a camera in my hands, standing on riverbanks at dawn, waiting for the light to hit the mist at an angle that made chaos feel ordered.",
      "Photography teaches you two brutal lessons that interface design often hides: you cannot invent light that isn't there, and every element you include in the frame either helps tell the story or subtracts from it.",
      "Years of retouched frames, darkroom exposures, and fest posters taught me where the eye lands, what feels heavy, and why some typographic pairings feel natural long before I knew the terms for kerning or optical balance.",
      "When I design an emergency response interface or a 24-hour solar sky engine today, the instinct is identical: find the light, balance the mass, and give the focal point room to breathe.",
    ],
  },
];

export function JournalPage() {
  const [activeEssay, setActiveEssay] = useState<Essay | null>(null);

  return (
    <div className="veil-sky relative w-full pb-28 px-4 sm:px-8 select-text text-white">
      <div className="sky-veil" aria-hidden="true" />
      <header className="page-head" data-reveal>
        <p className="atmo-kicker">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="opacity-50"> · Journal</span>
        </p>
        <h1 className="atmo-title">Field notes from the sky</h1>
        <p className="atmo-body">
          Essays on decision architecture, rapid code prototyping, and visual
          foundations — written between builds.
        </p>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="row-list" data-reveal>
          {ESSAYS.map((essay, i) => (
            <button
              key={essay.slug}
              type="button"
              onClick={() => setActiveEssay(essay)}
              className="row-item text-left w-full cursor-pointer"
              data-reveal
              style={{ ["--rd" as string]: i } as CSSProperties}
            >
              <span className="row-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="row-title">{essay.title}</span>
                <span className="row-tag">{essay.excerpt}</span>
              </span>
              <span className="meta-row row-meta-end">
                <span>{essay.tag}</span>
                <span>{essay.date}</span>
                <span>{essay.readTime}</span>
              </span>
              <span className="row-arw" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Essay reader */}
      {activeEssay && (
        <div className="veil-modal" onClick={() => setActiveEssay(null)}>
          <div
            className="veil-modal-sheet w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 sm:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-5 mb-8 border-b border-white/10">
              <span className="microlabel">
                {activeEssay.tag} · {activeEssay.date}
              </span>
              <button type="button" className="veil-close" onClick={() => setActiveEssay(null)}>
                Close
              </button>
            </div>

            <h2 className="font-serif text-[30px] sm:text-[38px] text-white leading-tight mb-8" style={{ fontWeight: 400 }}>
              {activeEssay.title}
            </h2>

            <div className="space-y-6 max-w-[62ch]">
              {activeEssay.content.map((para, i) => (
                <p key={i} className="m-0 text-[15.5px] leading-[1.78] font-light" style={{ color: "var(--ink-soft)" }}>
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-12 pt-7 border-t border-white/10 flex justify-between items-center">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: "var(--ui-faint)" }}>
                Rudraksh Singh · {activeEssay.readTime}
              </span>
              <button type="button" onClick={() => setActiveEssay(null)} className="link-arrow">
                <span>More field notes</span>
                <span className="arw" aria-hidden="true">↑</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
