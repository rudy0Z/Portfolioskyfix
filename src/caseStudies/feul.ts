import type { CaseStudy } from "./types";

/**
 * Feul — Vernacular Voice-Data Marketplace.
 * Sourced from the locked payout architecture, 13k LOC stateful React prototype,
 * and primary-source Indian voice-AI market research.
 */
export const feul: CaseStudy = {
  id: "feul",
  index: "03",
  name: "Feul",
  fullName: "Feul Voice Marketplace",
  tagline: "FEUL · VERNACULAR VOICE-DATA MARKETPLACE",
  discipline: "Vernacular voice AI · ethical contributor platform",
  title: "Designing the labour contract underneath Indian AI — starting with",
  titleAccent: "₹100 in session one.",
  hookLine:
    "AI labs buy scarce dialect × acoustic coverage, not raw hours. Feul shows the exact pay formula before recording, obtains native-language consent before touching the mic, and never holds a contributor’s earned money hostage.",
  status: "Real startup engagement · continued independently after closure",
  role: "Independent product design & build — market economics, payout ledger, 13k LOC prototype",
  year: "2026 · stateful prototype & measured critique redesign",
  origin: "Founder’s mobile brief, rebuilt end-to-end downstream of Submit",
  surface: "Mobile · budget Android, 360px-first, 300-nit daylight legible",
  build: "React 19 + TypeScript (13,160 LOC) · mechanical slop-scan QA gate",
  metaGrid: [
    { label: "Role", value: "Product Design & Code" },
    { label: "Core Screen", value: "Pre-Record Economics & Booth" },
    { label: "Key Metric", value: "₹100 withdrawable in session one" },
    { label: "Prototype", value: "13k LOC Stateful Ledger Build" },
  ],
  prototype: {
    title: "Feul — Vernacular Contributor Marketplace & Stateful Wallet",
    src: "/embed/feul/index.html?embed=1",
    deepLink: "#Scenes%20list",
    scenarios: [
      { label: "Scenes List · Coverage Multipliers", deepLink: "#Scenes%20list" },
      { label: "Contributor Home", deepLink: "#" },
    ],
  },
  chips: [
    "₹100 withdrawable in session one",
    "Coverage multiplier shown before recording",
    "Deleted my own Security Reserve mechanic",
  ],
  boundary:
    "Never shipped to production. No live payment rails, no live marketplace, and no field contributor testing. Contributor personas and ₹ amounts are prototype fixtures; market benchmarks cite primary research (AI4Bharat IndicVoices, Kathbath, Project Vaani, Karya) solely to frame domain economics.",
  closeLine:
    "The strongest version of Feul is not the one with the most screens — it is the one that stays understandable when clips fail review, campaigns close mid-take, or a contributor deletes their voice data.",
  colophon:
    "React 19 + Vite + TypeScript: single store governing full money lifecycles, 40 shared components, 23 bundled offline script fonts, and exit-code slop-scan QA.",
  sections: [
    {
      id: "brief",
      no: "01",
      navLabel: "Coverage vs. hours economics",
      kicker: "Market Reframe & Brief",
      title: "Everything that decides whether voice data is a real business happens after Submit.",
      standfirst:
        "AI labs already hold thousands of hours of clean studio speech. What is scarce is a 60-year-old Bhojpuri speaker in a real kitchen — yet gig platforms hide pay logic behind gamified points and freeze first-time balances.",
      blocks: [
        {
          t: "table",
          head: ["Actor", "Original Assumption", "Reframed Product Architecture"],
          rows: [
            ["Founder brief", "Gamified streaks & point surges", "Deleted streak surges; replaced with real lab coverage demand (+15% Tamil room audio)"],
            ["AI labs (demand)", "Buy bulk hours of audio", "Buy multidimensional coverage: speaker × dialect × district × acoustic floor"],
            ["Contributor (supply)", "Record now, hope payout clears later", "Exact pay formula shown pre-record + ₹100 withdrawable in session one"],
          ],
          caption:
            "Market framing grounded in AI4Bharat IndicVoices (7,348h), Kathbath (~60% raw rejection rate), Project Vaani (31,278h), and Karya benchmarks.",
        },
        {
          t: "pull",
          text: "total = round(base × coverageMult) + bonus — shown before the microphone ever opens.",
        },
      ],
    },
    {
      id: "case-walkthrough",
      no: "02",
      navLabel: "45s motion walkthrough",
      kicker: "Product Walkthrough · Contributor Loop",
      title: "From pre-record coverage pricing to the ON AIR recording booth and verifiable receipt.",
      standfirst:
        "Calm, daylight-legible browsing elevates into a high-contrast acoustic studio the instant recording begins.",
      blocks: [
        {
          t: "video",
          src: "",
          previewVideo: "/covers/feul-cover.webm",
          poster: "/case/feul/cover.png",
          duration: "00:45",
          plate: "FEUL · COVERAGE ECONOMICS & RECORDING STUDIO WALKTHROUGH",
          foldHint:
            "Once you scroll past this reel, the 6 chapters fold into the Top Hub Capsule ↑",
          caption:
            "Preview the running contributor flow capture above, or explore the live embedded marketplace in Chapter 03 below.",
        },
      ],
    },
    {
      id: "marketplace-stage",
      no: "03",
      navLabel: "Pre-record pay formula stage",
      kicker: "Live Prototype Stage · Coverage Pricing",
      title: "Checkable campaign pricing before a single syllable is spoken.",
      standfirst:
        "Every campaign displays its live collection progress and coverage multiplier upfront — recruiting scarce dialect supply with transparent information rather than manipulative countdowns.",
      blocks: [
        {
          t: "embed",
          src: "/embed/feul/index.html?embed=1",
          deepLink: "#Scenes%20list",
          title: "Feul Live Prototype — Coverage Multipliers & Pre-Record Sheet",
          height: 760,
          aspectRatio: "16 / 12",
          caption:
            "Live 13k LOC stateful prototype served directly from this study. Inspect campaign multipliers (`× rare voice`) and open any scene to verify the pre-record payout breakdown.",
        },
        {
          t: "disclosure",
          summary: "Read the decision background — guarding rarity-gaming without taxing honest earners",
          items: [
            {
              label: "Supply-side verification over balance holds",
              text: "Scarcity multipliers invite dialect spoofing. Instead of withholding contributor balances, phonetic checks and peer validation sit on account standing and clip acceptance — keeping the payout contract clean.",
            },
          ],
        },
      ],
    },
    {
      id: "session-one",
      no: "04",
      navLabel: "₹100 session-one & consent",
      kicker: "First-Session Trust & Payout Ledger",
      title: "Deleting my own Security Reserve so session one ends in withdrawable money.",
      standfirst:
        "A first-time contributor on a budget Android has zero reason to trust an unknown voice app. Consent happens in their own script strictly before microphone permission, and two guided tasks reach a withdrawable ₹100 with no first-withdrawal floor.",
      blocks: [
        {
          t: "decision",
          label: "D-03 · Self-Edit",
          title: "Why I deleted the Security Reserve I originally designed",
          tension:
            "Holding 20% of earnings in a rolling Security Reserve protected the marketplace from synthetic-audio fraud — by putting the platform between an honest newcomer and their first ₹100.",
          decision:
            "Deleted the reserve completely. Fraud gates moved to identity and progressive tiers (phone → VPA name-match → PAN at high volume), while earned balances remain 100% withdrawable.",
          proof:
            "“A balance you can’t withdraw isn’t proof that we pay. It’s proof that we count.”",
        },
        {
          t: "figure",
          src: "/case/feul/consent.png",
          aspectRatio: "9 / 19.5",
          phone: true,
          alt: "Feul plain-language DPDP Act 2023 voice consent screen before microphone access",
          caption:
            "Consent before mic: under DPDP Act 2023, contributors can delete voice recordings anytime — and money already paid is never clawed back.",
        },
        {
          t: "figure",
          src: "/case/feul/wallet.png",
          aspectRatio: "9 / 19.5",
          phone: true,
          alt: "Feul wallet screen separating Available, Waiting on Validator Review, and Total balances",
          caption:
            "Explicit ledger states (“Waiting on validator review”, never vague “Pending”) and exact gap math (“₹18 more to withdraw”) instead of disabled buttons.",
        },
      ],
    },
    {
      id: "repair-studio",
      no: "05",
      navLabel: "Repair studio & booth craft",
      kicker: "Failure Recovery & Acoustic Studio",
      title: "9 of 10 clips pass; 1 clip enters Repair Studio instead of failing the batch.",
      standfirst:
        "After burying three visual eras (gamified points, 3D clay toys, sterile flat cards), Generation 4 keeps browsing quiet so the ON AIR recording booth and partial-rejection Repair Studio carry unmistakable acoustic focus.",
      blocks: [
        {
          t: "figure",
          src: "/case/feul/review.png",
          aspectRatio: "9 / 19.5",
          phone: true,
          alt: "Feul review screen showing 9/10 clips passed and 1 clip eligible for ₹25 targeted repair",
          caption:
            "9/10 passed · Fix 1 → ₹25. Accepted work stays paid; only the clipped take is re-recorded.",
        },
        {
          t: "figure",
          src: "/case/feul/studio-rec.png",
          aspectRatio: "9 / 19.5",
          phone: true,
          alt: "Feul ON AIR recording booth with live functional waveform and tally indicator",
          caption:
            "Generation 4 Recording Booth — hold-to-record tally lamp, functional SNR waveform, and full reduced-motion parity.",
        },
      ],
    },
    {
      id: "outcomes",
      no: "06",
      navLabel: "Outcomes & market boundaries",
      kicker: "Stateful Verification & Open Market Questions",
      title: "13,160 lines of stateful money lifecycles — and honest pre-market boundaries.",
      standfirst:
        "Every edge state — 24-hour interrupted-take resume, mid-session campaign closure honoring in-flight work, UTR payout receipts, and non-clawback data deletion — runs live in a single deterministic store.",
      blocks: [
        {
          t: "receipts",
          leftTitle: "Shipped in the 13k LOC prototype",
          left: [
            "Native-script DPDP consent gate strictly ahead of mic access",
            "₹100 session-one path (₹50 paid calibration + ₹50 first scene) with ₹0 first-withdrawal minimum",
            "Pre-record `base × coverageMult + bonus` sheet across 23 bundled offline scripts",
            "Partial-rejection Repair Studio + 24h interrupted-session recovery",
            "Verifiable UTR / VPA withdrawal receipts & mechanical slop-scan QA",
          ],
          rightTitle: "What only a live market deployment can validate",
          right: [
            "Second-session retention vs. ₹100 activation unit economics",
            "Synthetic-voice spoofing defenses at scale under real payout incentives",
            "Validator dispute turnaround times across low-resource regional dialects",
            "Enterprise lab willingness-to-pay premiums for DPDP-revocable datasets",
          ],
        },
        {
          t: "pull",
          text: "Protecting against fraud by taxing a newcomer’s trust costs more than it saves.",
        },
      ],
    },
  ],
};
