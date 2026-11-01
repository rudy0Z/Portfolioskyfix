import { useState } from "react";
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
    <div className="journal-page relative w-full pt-28 pb-32 px-4 sm:px-8 max-w-5xl mx-auto select-text text-white">
      {/* Header */}
      <div className="mb-14">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 mb-3">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-amber-300">FIELD NOTES // JOURNAL</span>
        </div>
        <h1 className="font-serif text-[42px] sm:text-[60px] font-normal leading-[1.05] tracking-tight">
          Field Notes from the Sky
        </h1>
        <p className="mt-3 font-sans text-[17px] text-white/70 max-w-2xl font-light leading-relaxed">
          Distraction-free essays on decision architecture, rapid code prototyping, and visual foundations.
        </p>
      </div>

      {/* 3 Reading Sheets */}
      <div className="space-y-8">
        {ESSAYS.map((essay) => (
          <article
            key={essay.slug}
            className="p-8 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl hover:border-white/25 transition-all group cursor-pointer"
            onClick={() => setActiveEssay(essay)}
          >
            <div className="flex items-center justify-between font-mono text-[10px] text-white/50 mb-3">
              <span className="px-2.5 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10 uppercase tracking-wider">
                {essay.tag}
              </span>
              <span>{essay.date} · {essay.readTime}</span>
            </div>

            <h2 className="font-serif text-[28px] sm:text-[34px] font-medium text-white group-hover:text-amber-200 transition-colors mb-3 leading-snug">
              {essay.title}
            </h2>

            <p className="font-sans text-[15px] text-white/70 font-light leading-relaxed mb-6">
              {essay.excerpt}
            </p>

            <div className="flex items-center gap-2 font-mono text-[11px] text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>Read complete field note</span>
              <span>→</span>
            </div>
          </article>
        ))}
      </div>

      {/* Full Essay Reading Modal Sheet */}
      {activeEssay && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-8">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-neutral-950 p-8 sm:p-12 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                FIELD NOTE // {activeEssay.tag} · {activeEssay.date}
              </span>
              <button
                type="button"
                onClick={() => setActiveEssay(null)}
                className="font-mono text-[12px] px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-white/70"
              >
                CLOSE ✕
              </button>
            </div>

            <h2 className="font-serif text-[32px] sm:text-[40px] font-medium text-white leading-tight mb-8">
              {activeEssay.title}
            </h2>

            <div className="space-y-6 font-sans text-[16px] text-white/85 font-light leading-relaxed">
              {activeEssay.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center font-mono text-[10px] text-white/40">
              <span>Rudraksh Singh // Stratosphere Notes</span>
              <button
                type="button"
                onClick={() => setActiveEssay(null)}
                className="text-amber-300 hover:underline"
              >
                Back to Field Notes ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
