import type { CaseStudy } from "./types";

/**
 * FlytBase Sentinel — Autonomous Aerial Wildfire Command.
 * Sourced from CASE-STUDY-SENTINEL-2026 and its verification logs.
 * Every metric carries its basis: 48m → 90s target flow; 7:12 exercise-run
 * decision against a 38-minute authored baseline; zero fabricated claims.
 */
export const sentinel: CaseStudy = {
  id: "sentinel",
  index: "01",
  name: "Sentinel",
  fullName: "FlytBase Sentinel",
  tagline: "FLYTBASE SENTINEL · AUTONOMOUS AERIAL COMMAND",
  discipline: "AI-native command interface · emergency response",
  title: "Compressing wildfire verification from 48 minutes to",
  titleAccent: "90 seconds.",
  hookLine:
    "Autonomous drones spot ridge ignitions fast, but false dispatches waste scarce aerial tankers. Sentinel stages thermal evidence automatically while keeping irreversible escalation in human hands.",
  status: "Autonomous aerial command · FlytBase brief, kept building",
  role: "Product Design & Code — research → constitution → React + Three.js",
  year: "2026 · multiple shipped iterations",
  origin: "FlytBase challenge brief, continued independently",
  surface: "Incident Command Console · 1920-first, dark watch & day field",
  build: "React + TypeScript + Three.js · guarded by 45 verify + 35 e2e checks",
  metaGrid: [
    { label: "Role", value: "Product Design & Code" },
    { label: "Core Screen", value: "Incident Command Console" },
    { label: "Key Metric", value: "48m → 90s target · 7:12 exercise run" },
    { label: "Prototype", value: "Live React + Three.js State Machine" },
  ],
  prototype: {
    title: "FlytBase Sentinel — Tactical Terrain & Incident Command Console",
    src: "/embed/sentinel/harness.html",
    deepLink: "?situation=wui-breakout&phase=D",
    scenarios: [
      { label: "WUI Breakout · Gate Open (T+0:06)", deepLink: "?situation=wui-breakout&phase=D" },
      { label: "False Alert Reverted (Plot AU-2214)", deepLink: "?situation=falsepos" },
      { label: "Direct Containment Arc", deepLink: "?situation=contain" },
      { label: "Calm Night Watch (Standby)", deepLink: "?situation=standby" },
    ],
  },
  chips: [
    "Every number admits where it came from — MEA / MOD / AUT",
    "Silence is never approval — an expired gate sends nothing",
    "7:12 exercise-run decision against a 38-minute baseline",
  ],
  boundary:
    "Exercise data. Terrain, roads, structures and land cover are real (USGS 3DEP / OpenStreetMap / ESA WorldCover). The fire, weather, units, times and TALON are authored scenario fixtures. No live drone feeds, no trained ML model, and no real dispatcher testing — the canonical exercise run measures a 7:12 detection-to-order decision against a 38-minute authored baseline while targeting a 90-second verification flow.",
  closeLine:
    "I started designing screens. I ended up designing a constitution. Those are not the same thing — and every chapter of this study is the moment I noticed the difference.",
  colophon:
    "Three-tier runtime: a Three.js terrain engine that knows nothing about fires, a situation player mounting incidents as data, and the operator console above both. Enforced by 45 verify checks and 35 e2e checks.",
  sections: [
    {
      id: "dispatch-gap",
      no: "01",
      navLabel: "The 48-minute dispatch gap",
      kicker: "Problem & Operational Reality",
      title: "The drone hardware was already fast. Manual evidence assembly wasn’t.",
      standfirst:
        "FlytBase docks launch autonomously in under 60 seconds and stream live radiometric thermal feeds. Yet across regional dispatch networks, initial-attack verification still stretches up to 48 minutes because one sleep-deprived human has to stitch a threat picture across disconnected tools at 03:47.",
      blocks: [
        {
          t: "list",
          items: [
            "Fragmented triage: Operators manually cross-reference mast thermal alerts, burn-permit registries, wind vectors, and parcel maps across separate screens.",
            "High-cost false positives: Launching aerial tankers or county Wireless Emergency Alerts on an unverified permitted agricultural burn wastes scarce regional assets and erodes public trust.",
            "Legal accountability cannot be automated away: FAA Part 107 RPIC rules and California Penal Code § 409.5 road-closure statutes require an identifiable human signature — never “the AI launched.”",
          ],
        },
        {
          t: "table",
          head: ["Clock", "Manual baseline event", "Cumulative lag"],
          rows: [
            ["03:47", "Mast thermal sensor detects ridge heat anomaly", "0 min"],
            ["03:52", "Raw alert reaches regional monitoring center", "+5 min"],
            ["03:58", "Operator cross-references registry, weather, and GIS manually", "+11 min"],
            ["04:05", "Initial recon dispatched to confirm active flame", "+18 min"],
            ["04:18", "Field crew visually confirms crown ignition", "+31 min"],
            ["04:35", "Coordinated mutual-aid & egress response ordered", "+48 min"],
          ],
          caption:
            "The challenge brief’s 48-minute manual assembly baseline (authored scenario benchmark, not a fielded field-trial measurement).",
        },
        {
          t: "disclosure",
          summary: "Read the decision background — burying three wrong product architectures first",
          items: [
            {
              label: "Rejected v1 · The one-drag escalation slider",
              text: "My first draft compressed Assess → Contain → Rescue into a single gesture. It looked minimal and failed immediately: dragging a slider deployed drones to coordinates the operator never inspected. A macro is not an auditable life-safety decision.",
            },
            {
              label: "Rejected v2 · The chatty AI copilot sidebar",
              text: "Shipping a persistent right-hand TALON chat column reflowed the map and flooded the operator during peak stress — violating Easterbrook’s cue-utilization narrowing and ISA-18.2 alarm-load limits.",
            },
            {
              label: "Surviving constitution",
              text: "TALON absorbs 100% of evidence assembly under cited standing orders, never moves the operator’s map furniture, and surfaces a single bounded decision card only when human authority is legally required.",
            },
          ],
        },
      ],
    },
    {
      id: "case-walkthrough",
      no: "02",
      navLabel: "45s motion walkthrough",
      kicker: "Canonical Incident Walkthrough · 00:45",
      title: "From 03:47 thermal anomaly to priced courses of action in one continuous console.",
      standfirst:
        "One spatial surface from standby night watch through detection, registry conflict, and statutory mutual-aid authorization — zero page navigation, zero map reflow.",
      blocks: [
        {
          t: "video",
          src: "",
          previewVideo: "/covers/sentinel-cover.webm",
          poster: "/case/sentinel/plan-gate.png",
          duration: "00:45",
          plate: "45S MOTION WALKTHROUGH · CANONICAL WUI BREAKOUT RUN",
          foldHint:
            "Once you scroll past this reel, the 6 chapters fold into the Top Hub Capsule ↑",
          caption:
            "Full 45-second narrated motion cut is in final edit — toggle the live console capture preview above, or step directly into the interactive state machine in Chapter 03 below.",
        },
      ],
    },
    {
      id: "verification-gate",
      no: "03",
      navLabel: "90-second verification gate",
      kicker: "Core Interaction · Live State Machine",
      title: "Silence reverts to watch; escalation requires an explicit human act.",
      standfirst:
        "When TALON detects a +620°C ridge ignition, it pre-stages dual EO/FLIR drone feeds, cross-checks the burn-permit registry, and opens a bounded 90-second verification gate. Test both operational branches live below — connected directly to the Encinal Canyon Three.js engine.",
      blocks: [
        {
          t: "sentinel-stage",
          embedSrc: "/embed/sentinel/harness.html",
          activeDeepLink: "?situation=wui-breakout&phase=D",
          revertedDeepLink: "?situation=falsepos",
          caption:
            "Interactive verification gate paired with the live Encinal Canyon Tactical Terrain Engine (USGS 3DEP elevation + OpenStreetMap road network). Toggle between Active Ignition (+620°C) and Timeout / False Alert Reverted, or authorize the pre-staged CalFire mutual-aid packet.",
        },
        {
          t: "list",
          items: [
            "Pre-staged dual evidence, zero menu hunting: Optical RGB and FLIR Long-Wave Infrared feeds arrive side-by-side with wind vectors and provenance chips (MEA / MOD / AUT).",
            "Safe timeout law (Silence ≠ Approval): If the countdown reaches 00:00 without input, nothing is transmitted — drones hold perimeter watch under Standing Order SO-1 and escalate to the Regional Duty Supervisor.",
            "OWNED vs. REQ authority split: The card separates drone tasking (within operator authority) from Sheriff WEA & CalFire tanker requisitions so the button never overstates its legal reach.",
          ],
        },
        {
          t: "anatomy",
          title: "Anatomy — the egress & mutual-aid decision card",
          src: "/case/sentinel/plan-gate.png",
          aspectRatio: "16 / 9",
          alt: "Annotated teardown of Sentinel’s egress proposal card over the Encinal Canyon map: gate countdown, priced COA compare, OWNED vs REQ split, lapse consequence, and keyboard 1–3 signature",
          layers: [
            {
              label: "Bounded gate countdown",
              x: 91,
              y: 10.4,
              note: "Visible on both the card and topbar. When the clock lapses without a human pick, the audit log records “expired — nothing sent.”",
            },
            {
              label: "Commensurable COA pricing",
              x: 74.5,
              y: 29.3,
              note: "Courses of action are priced in operational units — households in path, WEA devices, clearance minutes — so Asha compares trade-offs rather than raw probabilities.",
            },
            {
              label: "OWNED vs. REQ authority split",
              x: 74.5,
              y: 44.5,
              note: "Drone perimeter orbits execute under operator authority (OWNED); county WEA and aerial mutual aid route as attributed statutory requisitions (REQ).",
            },
            {
              label: "Explicit lapse consequence",
              x: 74.5,
              y: 50.5,
              note: "“If it lapses: Nothing is sent” is printed before any click happens — defending abstention as a first-class recorded outcome.",
            },
            {
              label: "Keys 1–3 hardware-grade confirmation",
              x: 74.5,
              y: 56.6,
              note: "Keys 1–3 answer the open card; typing “approve” into free-text chat is rejected with STATUTORY GATE LOCKED because chat text is not a signature.",
            },
          ],
          caption:
            "Every element on the interrupt card answers two questions: what am I authorizing right now, and what happens if I don’t.",
        },
        {
          t: "disclosure",
          summary: "Read the decision background — provenance tags instead of fake AI confidence %",
          items: [
            {
              label: "Why percentages fail at 03:47",
              text: "Showing “87% AI Confidence” gives an incident commander nothing to push back on during a post-incident burn review. Sentinel replaces percentages with three provenance tags on every number: MEA (sensor-measured), MOD (spread-model derived), and AUT (scenario-authored).",
            },
            {
              label: "Verbatim dissent & non-punitive re-raise",
              text: "When the operator declines an escalation, her tactical rationale is logged verbatim. TALON may only re-raise on genuinely new sensor evidence, routed transparently to the Regional Duty Supervisor.",
            },
          ],
        },
      ],
    },
    {
      id: "attention-arbiter",
      no: "04",
      navLabel: "Attention arbiter filter",
      kicker: "Cognitive Load & ISA-18.2 Alarm Budget",
      title: "The interface gets quieter as the fire gets louder.",
      standfirst:
        "Displaying 120 simultaneous drone telemetry widgets during an active WUI breakout induces tunnel vision. Sentinel enforces an ISA-18.2 interrupt budget (max 2 interrupts per 10 minutes) and collapses routine fleet health into quiet status hairlines when flames cross the ridge.",
      blocks: [
        {
          t: "figure",
          src: "/case/sentinel/standby.png",
          aspectRatio: "16 / 9",
          wide: true,
          alt: "Sentinel console in calm night-watch standby: quiet 58px crew deck segments, dark Encinal terrain, zero pulsing alarms",
          caption:
            "T−0:30 Standby Watch — tuned for a 4-hour night watch. Nothing pulses or begs for clicks; the interface earns its right to interrupt by staying silent first.",
        },
        {
          t: "list",
          items: [
            "58px Crew Deck (L1): Five independent spatial segments (Situation · Resources · Egress · Comms · Authority) leave ~150px more live terrain visible than traditional bottom dashboards.",
            "Inverse urgency density: Rotor RPM, cell voltages, and gimbal pitch stay tucked away during active escalation unless a hardware safety threshold (e.g., FT-01 < 14% return-home battery) is crossed.",
            "Sheepish AI self-correction: At T+1:29, when spot fire SPOT-1 jumps Encinal Canyon Rd 40 minutes ahead of forecast, TALON keeps its old projection line visible beside the new one (`was T+2:09`) so the operator can verify model drift at a glance.",
          ],
        },
        {
          t: "figure",
          src: "/case/sentinel/revision.png",
          aspectRatio: "16 / 9",
          wide: true,
          alt: "Sentinel T+1:29 route revision: old spread projection preserved alongside revised perimeter and spot-fire jump receipt",
          caption:
            "T+1:29 Forecast Drift Receipt — most AI demos hide prior wrong predictions. Preserving “(was T+2:09)” directly on the map turned skepticism into calibrated trust.",
        },
        {
          t: "disclosure",
          summary: "Read the decision background — catching my own “gate open · 0:00” alarm bug",
          items: [
            {
              label: "The bug caught in protocol simulation",
              text: "An early build kept rendering an amber pulsing “gate open · 0:00” chip after a gate expired. A permanently pulsing expired alarm trains an operator to ignore the topbar within a single shift. Keying the segment strictly off `gate.open` eliminated stale alarm fatigue.",
            },
          ],
        },
      ],
    },
    {
      id: "bandwidth-ladder",
      no: "05",
      navLabel: "2G / 5G bandwidth ladder",
      kicker: "Spatial Engine & Field Resilience",
      title: "Chrominance, geometry, and a graceful 3D → 2D topo ladder.",
      standfirst:
        "Wildland-urban command spans fiber-lit central dispatch rooms and bandwidth-starved field tablets in smoke-degraded canyons. Plan state is encoded in geometry + chrominance — never color alone — and one terrain mesh serves both 3D tactical perspective and zero-overhead 2D topographic ortho.",
      blocks: [
        {
          t: "table",
          head: ["Link / Surface Tier", "Visual Representation", "GPU & Bandwidth Discipline"],
          rows: [
            [
              "5G / Command Room (3D Tactical)",
              "Hypsometric DEM relief (2× exag), instanced chaparral, live drone gimbal PiP + +15/+30/+60m spread isochrones",
              "≤ 20 draw calls · ≤ 30 fps cap · auto-parks GPU to 0 fps after 45s idle",
            ],
            [
              "Degraded Link (2D Topographic)",
              "Instant camera tween to orthographic 20m/100m contour map; vector routes & provenance telemetry prioritized over video",
              "Same geometry buffer (zero mesh rebuild) · static frames cost 0 ms GPU",
            ],
            [
              "2G / C2 Drop Boundary (Named Open Work)",
              "Vector state + last-known unit breadcrumbs; explicit stale-timestamp watermark required before any field deployment",
              "Honest audit note: full offline state machine remains P0 open work beyond current toast",
            ],
          ],
          caption:
            "Plan-status ladder: Proposed = periwinkle hollow/dashed · Committed = solid cyan · Draft = amber parallel offset · Compromised = P0 red cut.",
        },
        {
          t: "figure",
          src: "/case/sentinel/falsepos.png",
          aspectRatio: "16 / 9",
          wide: true,
          alt: "Chaos 01 false-positive arc: permitted burn plot AU-2214 outlined cleanly on terrain with recommendation to close without dispatch",
          caption:
            "Chaos 01 False-Positive Arc — Registry identifies Permitted Burn Plot AU-2214. Zero fire surfaces drawn, zero tankers launched. The save is a first-class ending.",
        },
        {
          t: "disclosure",
          summary: "Read the decision background — why draft revisions never overwrite committed lines",
          items: [
            {
              label: "Spatial continuity under stress",
              text: "When TALON proposes switching primary egress from Encinal Canyon Rd to Decker Rd, the amber dashed draft renders parallel beside the solid cyan committed route — never replacing it until Asha approves. Under washed-out projector light or high stress, dashed vs. solid geometry still reads unmistakably.",
            },
            {
              label: "Code-enforced design system",
              text: "45 automated verify checks parse stylesheets and state transitions so no raw hex outside token blocks can ship, and scrubbing backward on the incident timeline restores every map layer and TALON state deterministically.",
            },
          ],
        },
      ],
    },
    {
      id: "outcomes",
      no: "06",
      navLabel: "Outcomes & reflection",
      kicker: "Verified Exercise Benchmarks & Honest Limits",
      title: "What the running build proves — and what I refuse to fabricate.",
      standfirst:
        "The 90-second verification window is a product design target flow, not a claimed field-trial reduction. On the canonical scripted exercise run, detection-to-authorized-order completes in 7:12 scene time against the brief’s 38-minute authored baseline — with every single action attributable.",
      blocks: [
        {
          t: "receipts",
          leftTitle: "Verified in the running build",
          left: [
            "7:12 exercise-run detection-to-order decision against a 38-minute authored baseline (0:51 median card decision time)",
            "0 unauthorized dispatches on the Plot AU-2214 false-positive arc",
            "0 silent auto-executions on gate timeout — 100% of lapsed gates send nothing and escalate to supervisor",
            "100% of telemetry values carry explicit MEA / MOD / AUT provenance tags",
            "14-minute spread-projection error surfaced transparently via T+1:29 drift receipt",
            "45 verify checks + 35 e2e checks passing with 0 console errors",
          ],
          rightTitle: "What I would instrument & test next with real dispatchers",
          right: [
            "Operator override rate — >85% rubber-stamping signals automation complacency; >40% override signals miscalibrated priors",
            "Statutory requisition time-to-acknowledge with County Sheriff & OES",
            "SAGAT situation-awareness freeze probes & NASA-TLX workload scoring with active wildfire dispatchers",
            "Promoting the T+1:55 road-cut drawer log into an unmissable P0 map-lane interrupt card",
            "Replacing the C2 link-drop toast with a full stale-data watermark degradation state machine",
          ],
        },
        {
          t: "pull",
          text: "Good interface design disappears when you need it most. What remains at 03:47 is the exact decision only a human can legally own — and an audit trail that never lies about who made it.",
        },
      ],
    },
  ],
};
