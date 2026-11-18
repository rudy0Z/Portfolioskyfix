import type { CaseStudy } from "./types";

/**
 * LokAI — Deterministic Consumer Legal AI.
 * Sourced from the v2.0 repo's own case-study document and its verify gates.
 * Four laws, gate-checked in code; zero fabricated confidence percentages.
 */
export const lokai: CaseStudy = {
  id: "lokai",
  index: "02",
  name: "LokAI",
  fullName: "LokAI Legal Triage",
  tagline: "LOKAI · DETERMINISTIC CONSUMER LEGAL TRIAGE",
  discipline: "Legal AI systems · consumer protection",
  title: "Trust is not a tone of voice — it is a set of",
  titleAccent: "provable refusals.",
  hookLine:
    "The first ten minutes of an Indian consumer problem, designed so a stressed citizen can verify her facts, inspect the statute, or safely stop — governed by four laws gate-checked in code.",
  status: "Material+ Buildathon · Top 10 · reframed and rebuilt after",
  role: "End-to-end product design & build — research, visual system, voice, verify gates",
  year: "2025 → 2026 · v2 deterministic rebuild",
  origin: "Buildathon chatbot, rebuilt as a governed first-action flow",
  surface: "Mobile-first · 390px framed on desktop, full-bleed on phones",
  build: "React 19 · Vite · Tailwind 4 · automated build-failing verify gate",
  metaGrid: [
    { label: "Role", value: "Product Design & Code" },
    { label: "Core Screen", value: "Signed Fact Gate & Finding" },
    { label: "Key Metric", value: "Four laws, gate-checked in code" },
    { label: "Prototype", value: "Deterministic 5-Pack React Flow" },
  ],
  prototype: {
    title: "LokAI v2 — Deterministic Consumer Triage & Fact Gate",
    src: "/embed/lokai/index.html",
    deepLink: "#/?embed=1&s=refund-golden",
    scenarios: [
      { label: "Refund Golden Path (Fact Gate)", deepLink: "#/?embed=1&s=refund-golden" },
      { label: "Full Prototype Home", deepLink: "#/?embed=1" },
    ],
  },
  chips: [
    "Four laws, gate-checked in code",
    "Words, not percentages — 0 fabricated confidence",
    "5 full language packs incl. Urdu RTL",
  ],
  boundary:
    "Interactive prototype. Never shipped and never tested with affected citizens or practising lawyers (n = 0). Statutes, findings and outputs are deterministic prototype content with visible [VERIFY] markers. No live LLM, no network, no mic, no OCR. This is not legal advice.",
  closeLine:
    "If LokAI cannot show the citizen the law it is standing on, it has no business giving them an answer. I kept that sentence — and built the verify gate that enforces it.",
  colophon:
    "One legal store. 13 entries carrying visible [VERIFY] badges. Five full language packs (incl. Urdu RTL), 13 core, 5 honest fallback. 34 WCAG AA token pairs gate-checked across light and dark.",
  sections: [
    {
      id: "tension",
      no: "01",
      navLabel: "The confident-wrong-answer risk",
      kicker: "Problem & Access-to-Justice Mechanism",
      title: "A cracked ₹8,999 mixer grinder, a closed return window, and a dangerous chatbot.",
      standfirst:
        "When customer care claims a 48-hour return window is closed, a stressed buyer opens general AI and receives fluent prose that either over-promises (“file immediately!”) or hides behind boilerplate disclaimers — with zero verifiable statutory basis.",
      blocks: [
        {
          t: "list",
          items: [
            "Legal consciousness gap: Civil-justice mechanism research (Sandefur, n=668 US baseline) shows most citizens never name a private consumer loss as a legal category with free statutory remedies.",
            "Fluency masks hallucination: Under stress, a user accepts a confident wrong citation or abandons a cold government-form intake.",
            "Origin of v2: Auditing my own v1 hackathon chatbot caught it answering an out-of-scope query as consumer law — prompting a complete rebuild from chatbot to deterministic classifier + fact gate.",
          ],
        },
        {
          t: "pull",
          text: "A person under stress will accept a confident wrong answer. The product has to be warm enough to stay open, and hard enough to stop.",
        },
        {
          t: "disclosure",
          summary: "Read the decision background — composite framing & fictional seller law",
          items: [
            {
              label: "Honest composite scope",
              text: "No clinical or legal-aid field study was conducted. Seller names (HomeKart) and amounts (₹8,999) are strictly fictional by codebase rule, and high-stakes tenancy/eviction disputes hard-stop immediately rather than pretending a 10-minute flow can defend someone’s housing.",
            },
          ],
        },
      ],
    },
    {
      id: "case-walkthrough",
      no: "02",
      navLabel: "45s motion walkthrough",
      kicker: "Product Walkthrough · Gazette Register",
      title: "Speak, confirm your own facts, inspect the law, and act only when ready.",
      standfirst:
        "From voice read-back through the signed Fact Gate, three-zone statutory finding, and clipboard-only demand notice — without a single auto-committed action.",
      blocks: [
        {
          t: "video",
          src: "",
          previewVideo: "/covers/lokai-cover.webm",
          poster: "/case/lokai/cover.png",
          duration: "00:45",
          plate: "LOKAI V2 · FACT GATE & GAZETTE REGISTER WALKTHROUGH",
          foldHint:
            "Once you scroll past this reel, the 6 chapters fold into the Top Hub Capsule ↑",
          caption:
            "Toggle the live Gazette-register prototype capture above, or interact directly with the deterministic v2 build in Chapter 04 below.",
        },
      ],
    },
    {
      id: "four-laws",
      no: "03",
      navLabel: "Four laws gate-checked in code",
      kicker: "Constitutional Engineering",
      title: "A design rule that lives only in Figma is a moodboard.",
      standfirst:
        "Four non-negotiable laws live inside scripts/verify.mjs and fail the build whenever a component violates them — zero percentage confidence meters, zero unverified blue links, and mandatory protective stops.",
      blocks: [
        {
          t: "decision",
          label: "Four Laws",
          title: "Enforced mechanically at build time",
          tension:
            "Early drafts flirted with a “94% Legal Confidence” ring and inline statute strings — theater that a prototype cannot honestly defend.",
          decision:
            "1) Single legal store with visible [VERIFY] flags · 2) Words only (Clear / Likely — please confirm / Not sure), never percentages · 3) Uncertainty downgrades to caution or Protective Stop (DLSA referral) · 4) Clipboard-only output behind an unchecked consent box.",
          tradeoff:
            "Self-audit still caught six statute strings leaked into page views and an 1888 typo on the Transfer of Property Act (1882) — named openly as P0 in the repo rather than swept under polish.",
        },
        {
          t: "anatomy",
          title: "Anatomy — the signed fact gate & finding",
          src: "/case/lokai/golden-finding.png",
          aspectRatio: "9 / 19",
          alt: "Annotated LokAI fact gate and three-zone finding screen",
          layers: [
            {
              label: "One chip question at a time",
              x: 32,
              y: 45,
              note: "Replaces overwhelming intake forms with single-turn questions so stressed users stay oriented.",
            },
            {
              label: "First-class “Not sure” chip",
              x: 72.5,
              y: 55.4,
              note: "Uncertainty is never punished — the action ladder adapts instead of forcing a guessed purchase date.",
            },
            {
              label: "Signed facts become the matter record",
              x: 48,
              y: 37.5,
              note: "Downstream findings read exclusively from the paragraph she confirmed; editing an earlier answer marks later cards stale.",
            },
          ],
          caption:
            "The best screen in LokAI is not the chat — it is the Fact Gate that catches a wrong purchase date before any assessment runs.",
        },
      ],
    },
    {
      id: "live-instrument",
      no: "04",
      navLabel: "Live deterministic triage stage",
      kicker: "Interactive Prototype Stage",
      title: "Seven moves from spoken worry to an editable paper notice.",
      standfirst:
        "Step through the live deterministic v2 prototype below — test the Fact Gate, inspect the [VERIFY] statutory tags, and switch across all five full language packs.",
      blocks: [
        {
          t: "embed",
          src: "/embed/lokai/index.html",
          deepLink: "#/?embed=1&s=refund-golden",
          title: "LokAI v2 — Refund Golden Path (Deterministic, Offline)",
          height: 680,
          aspectRatio: "16 / 11",
          caption:
            "Live embedded LokAI v2 build. Click through the Fact Gate, three-zone finding, and action ladder, or click Full Prototype ↗ in the Top Hub Capsule for a full-viewport sheet.",
        },
        {
          t: "table",
          head: ["Trust Device", "What It Does", "What It Refuses"],
          rows: [
            ["Fact gate", "Turns user-confirmed words into the matter record", "Engine-invented assumptions"],
            ["Confidence in words", "States Clear / Likely / Not sure", "Win-rate percentages (e.g. “88% grounded”)"],
            ["Protective stop", "Routes tenancy/safety cases to human DLSA aid & saves notes", "Dead-end “I cannot help with that”"],
            ["Paper notice + clipboard", "Keeps the citizen as the explicit sender", "Unlicensed “AI will email seller” buttons"],
          ],
        },
      ],
    },
    {
      id: "urdu-rtl",
      no: "05",
      navLabel: "Multilingual & Urdu RTL",
      kicker: "Script Equity & Typography",
      title: "22 languages in a dropdown is easy; Urdu RTL holding on the stop screen is the work.",
      standfirst:
        "Five full packs (English, Hindi, Marathi, Tamil, and right-to-left Urdu), 13 core Eighth-Schedule chrome packs, and 5 honest script fallbacks — tuned with per-script root scales and zero faux-bold.",
      blocks: [
        {
          t: "figure",
          src: "/case/lokai/urdu-rtl.png",
          aspectRatio: "9 / 19.5",
          phone: true,
          alt: "LokAI protective stop screen holding layout symmetry in right-to-left Urdu script",
          caption:
            "Urdu RTL holding cleanly on the Protective Stop screen, paired with explicit `reviewedByNativeSpeaker: false` flags until human legal-translator sign-off.",
        },
        {
          t: "figure",
          src: "/case/lokai/stop-dlsa.png",
          aspectRatio: "9 / 19.5",
          phone: true,
          alt: "Protective stop screen routing eviction/safety issues to District Legal Services Authority",
          caption:
            "The Protective Stop — preserves everything she typed while routing out-of-bounds housing or safety matters to human legal aid.",
        },
      ],
    },
    {
      id: "outcomes",
      no: "06",
      navLabel: "Failure receipts & reflection",
      kicker: "Prototype Receipts & Refused Metrics",
      title: "Failures read straight from the build rather than invented usability scores.",
      standfirst:
        "Success in consumer triage is an informed human decision — including deciding to put the phone down and leave a minor dispute alone.",
      blocks: [
        {
          t: "receipts",
          leftTitle: "Verified in the v2 prototype",
          left: [
            "Four constitutional laws enforced by build-script verification",
            "4 domain playbooks × 2 branches (formal invoice vs. informal GPay/Instagram)",
            "Signed Fact Gate with automatic stale-marking on upstream edits",
            "5 full language packs incl. Urdu RTL + 34 WCAG AA light/dark token pairs",
            "Voice review-before-send & consent-gated paper demand stationery",
          ],
          rightTitle: "Metrics intentionally refused (and named bugs)",
          right: [
            "0 fabricated confidence percentages, win-rates, or invented walkthrough N counts",
            "Refused “cases filed” as a KPI — abstention (“leave it”) is a valid success outcome",
            "Named open defect: Marathi/Tamil/Urdu domain bodies still fall back to English",
            "Named open defect: focus-trap cleanup needed on the inverted Protective Stop composer",
          ],
        },
        {
          t: "pull",
          text: "The verify gate is more important than the design tokens. When visual polish and statutory honesty conflict, the gate fails the build.",
        },
      ],
    },
  ],
};
