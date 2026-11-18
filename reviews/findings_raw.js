module.exports = [
      {
        id: "BUG-01",
        sev: "P0",
        cat: "Interactive Bugs",
        title: "Clicking any 35mm film slide on /about opens TWO overlapping modals — the top one hides the photo behind an empty black box",
        file: "src/pages/AboutPage.tsx:210-246 & 306-335",
        evidence: "Verified in live browser: clicking 'Tunnel of Trees' sets activeSlide='s1', mounting both the real image modal (line 210) and a duplicate placeholder modal (line 306) at z-[120]. The second modal covers the photo with a solid black box showing only text. Neither modal listens for Escape despite the button reading '✕ ESC'.",
        fix: "Delete the duplicate modal block at lines 306–335 of AboutPage.tsx and attach a window keydown Escape listener while activeSlide !== null."
      },
      {
        id: "BUG-02",
        sev: "P0",
        cat: "Interactive Bugs",
        title: "Mobile hamburger button is permanently visible on desktop and spawns an invisible click-swallowing overlay",
        file: "src/styles/global.css:1604-1617 · NavigationNotch.tsx:85-107",
        evidence: "Measured at 1280×800: getComputedStyle('.site-menu-btn').display === 'flex' alongside '.site-links'. Clicking it on >=1024px sets isMobileDrawerOpen=true: the drawer itself has 'lg:hidden', but its sibling 'fixed inset-0 z-40' backdrop still mounts invisibly and swallows the next page click.",
        fix: "Add '@media (min-width: 1024px) { .site-menu-btn { display: none; } }' in global.css (or 'lg:hidden' on the button) and add 'lg:hidden' to the z-40 backdrop div."
      },
      {
        id: "BUG-03",
        sev: "P0",
        cat: "Layout & Responsive",
        title: "Sticky stacking project cards clip 443px+ of content and CTA buttons off-screen on mobile & short laptops",
        file: "src/sections/StackingProjects.tsx:351-356",
        evidence: "Measured at 400×800: each sticky card is 1,147–1,163px tall pinned at top: 80px / 108px / 136px. Once pinned, the bottom ~443px of Card 1 and ~455px of Card 2 never scroll into the 800px viewport before the next z-indexed card slides directly over them.",
        fix: "Only apply 'sticky' on viewports tall/wide enough to fit the card (e.g. 'lg:sticky' with '@media (min-height: 760px)'), or make cards normal flow on mobile."
      },
      {
        id: "BUG-04",
        sev: "P0",
        cat: "Interactive Bugs",
        title: "Music player style switcher on /about is completely dead (locked to 'pinui') and plays zero audio",
        file: "src/App.tsx:87 · src/components/music/MusicWidgetHost.tsx:53",
        evidence: "App.tsx passes externalMusicStyle='pinui', and MusicWidgetHost computes 'activeStyle = externalStyle || style'. Clicking Puffy Pill, Transistor, or Vinyl updates internal state, which is ignored. Furthermore, no <audio>, Web Audio synth, or Spotify embed exists — 'PLAY SOUNDTRACK ▶' toggles UI state in total silence.",
        fix: "Remove externalMusicStyle='pinui' in App.tsx (use defaultStyle='pinui' instead) and wire real audio playback (Web Audio pad or licensed audio/Spotify embed) or clearly label it as a UI component demo."
      },
      {
        id: "BUG-05",
        sev: "P0",
        cat: "Interactive Bugs",
        title: "All 3 Case Studies show literal 'PLACEHOLDER' labels, fake video scrub bars, and dead prototype buttons",
        file: "src/pages/CaseStudyPage.tsx:95-118, 334, 359-379, 474-511",
        evidence: "Line 334 renders 'TIER 01 // 30-SECOND MOTION REEL PLACEHOLDER' in live UI; clicking Play just shifts a static bar from 45% to 75% over a static SVG. Under Tier 03, 'Simulate 90s Verification Sequence →', 'Review Grounded Statutory Draft →', and 'Execute Smart Contract Payout →' have no onClick handlers, and 'Launch Fullscreen Prototype Modal ↗' re-renders the same dead card.",
        fix: "Remove 'PLACEHOLDER' from live headings, replace fake reel controls with real screen recordings or interactive animated sequences, and implement interactive state machines (or embed live prototype URLs) for Tier 03."
      },
      {
        id: "BUG-06",
        sev: "P0",
        cat: "Layout & Responsive",
        title: "Portrait cutout (1024×571 wide desk scene) is cropped into a headless lamp on /resume and sliced in half on /about",
        file: "src/pages/ResumePage.tsx:96-105 · AboutPage.tsx:116-124",
        evidence: "public/portrait-cutout.png is a 16:9 wide illustration of a desk, lamp, and character. On /resume, an 80×80 rounded-full avatar with 'object-cover object-top' shows only the yellow lamp shade and blank background — no face. On /about, 'aspect-[4/5] object-cover' chops off 56% of the horizontal scene while labeling the digital illustration 'CANON EOS 35MM'.",
        fix: "Use a dedicated square headshot photo for ResumePage and a real 4:5 portrait photo (or 16:9 'object-contain' illustration frame with accurate caption) on AboutPage."
      },
      {
        id: "BUG-07",
        sev: "P1",
        cat: "Credibility & Copy",
        title: "Resume lists an 'Independent Challenge Concept' (FlytBase Sentinel) as current employment ('May 2026 – Present')",
        file: "src/pages/ResumePage.tsx:164-170 vs StackingProjects.tsx:36",
        evidence: "Home ('Independent Flagship Concept'), About ('Independent challenge concept'), and Case Study ('Challenge Prototype') explicitly state Sentinel is self-initiated, yet Resume lists 'FlytBase Sentinel | May 2026 – Present (Current) | Lead Product Designer & Systems Architect' under 'EXPERIENCE ~3 YEARS'.",
        fix: "Relabel the Resume section as 'Selected Systems & Product Projects' or clearly mark FlytBase Sentinel, LokAI, and Feul.AI as Independent Concept / Hackathon Winner / Startup Concept so recruiters never read it as misrepresented employment."
      },
      {
        id: "BUG-08",
        sev: "P1",
        cat: "Credibility & Copy",
        title: "About page '35mm Film Slide Archive' uses famous Unsplash stock photos — including a cat photo labeled 'Solitary Egret'",
        file: "src/pages/AboutPage.tsx:42-78",
        evidence: "Slide s3 ('Solitary Egret · Estuary Wildlife Refuge · 85mm f/4.0') loads Unsplash photo-1518791841217-8f162f1e1131 (a famous brown tabby cat closeup), and s2 ('Riverboats at Dawn · Tapi River Bank') loads Unsplash's generic tropical beach wave photo. Given the essay 'Images taught me composition before product did', fake stock photos undermine authenticity.",
        fix: "Replace all 5 Unsplash URLs with Rudraksh's actual photographs stored in public/photos/ with genuine EXIF metadata."
      },
      {
        id: "BUG-09",
        sev: "P1",
        cat: "Layout & Responsive",
        title: "About page sticky left column traps the Music Widget below the viewport fold on 800p/900p laptops",
        file: "src/pages/AboutPage.tsx:113",
        evidence: "Measured at 1280×800: the 'lg:sticky lg:top-24' left column is 853.5px tall (96px + 853.5px = 949.5px > 800px). While scrolling through Chapters 1–3, the column stays pinned at top: 96px, keeping the entire MusicWidgetHost clipped below the bottom of the screen until the very end of the page.",
        fix: "Reduce the portrait card height on desktop (e.g. max-h-[360px] or compact horizontal profile card) or only apply sticky when min-height >= 980px."
      },
      {
        id: "BUG-10",
        sev: "P1",
        cat: "Layout & Responsive",
        title: "Hero blossom canopy slashes dark branches directly across the H1 headline on mobile and behind nav links on desktop",
        file: "src/sections/GardenField.tsx:193-195 · BluebellPass.tsx:1082",
        evidence: "Verified in 400×800 screenshot: mobile sets 'canopyReach: 80', stretching dark #2B2430 branches 80% across the screen straight through 'Product Designer & Engineer' and the subtitle. At 1280×800, the branches sit directly under WORK / ABOUT / PROJECTS / JOURNAL / RESUME.",
        fix: "Lower canopyReach on mobile (or anchor canopy below hero-copy / reduce branch opacity in upper 28% of viewport) so text and nav sit over clean sky."
      },
      {
        id: "BUG-11",
        sev: "P1",
        cat: "Sky & Performance",
        title: "WebGL sky horizon (85%) is desynced from celestial sun/moon horizon (56%) — sun & moon vanish floating in mid-air",
        file: "src/sky/webgl/SkyRenderer.ts:25 vs src/lib/celestial.ts:41",
        evidence: "celestial.ts changed HORIZON_Y to 0.56 to match the home meadow, while SkyRenderer.ts kept HORIZON_Y = 0.85. SkyRenderer maps L.sun.y (0.56 at sunset) via screenToDir() calibrated for 0.85, so the WebGL sun/moon stop ~16° above the WebGL horizon and fade out mid-sky — visibly broken on /about, /projects, /journal, and /case/*.",
        fix: "Decouple WebGL sky camera/celestial horizon (0.85) from meadow occlusion, or align HORIZON_Y across celestial.ts and SkyRenderer.ts."
      },
      {
        id: "BUG-12",
        sev: "P1",
        cat: "Layout & Responsive",
        title: "Resume 'View / Print PDF' prints the top wordmark, ThermalSkyClock, and butterfly cursor over the CV",
        file: "src/pages/ResumePage.tsx:19",
        evidence: "@media print hides '.site-header' and '.hud', neither of which is the active top bar class ('.site-top' in NavigationNotch.tsx, '.tsc-root', '.butterfly-cursor-wrapper', '.celestial-night-root'). Fixed elements render on top of the printed resume.",
        fix: "Add '.site-top, .tsc-root, .butterfly-cursor-wrapper, .celestial-night-root { display: none !important; }' to the @media print block."
      },
      {
        id: "BUG-13",
        sev: "P1",
        cat: "Interactive Bugs",
        title: "404 Transistor Radio slider direction is backwards relative to its labels and dial scale",
        file: "src/pages/NotFoundPage.tsx:68-80, 130-143",
        evidence: "Above the range input, left says 'STATIC 404 AM (LOST)' and right says '100.0 FM (HOME)', but the input has min='50' (left) and max='450' (right) starting at value=404 (far right). Dragging right toward '100.0 FM (HOME)' actually moves toward 450 AM; users must drag LEFT toward 'STATIC 404 AM' to hit 100.0 FM. Dial text also prints '540 · 404 · 800' out of numerical order.",
        fix: "Swap the left/right labels above the slider (100.0 FM on left, 404 AM on right) or invert the slider mapping, and fix the AM dial markings."
      },
      {
        id: "BUG-14",
        sev: "P1",
        cat: "Credibility & Copy",
        title: "Zero real product UI screenshots shown — 2 MB of real project covers sit unused in public/",
        file: "public/{sentinel-cover,lokai_cover,feulai_cover}.jpg · StackingProjects.tsx",
        evidence: "Design hiring managers evaluate visual craft from actual shipped/Figma interfaces, yet every project card and case study renders simple coded wireframe SVGs while sentinel-cover.jpg, lokai_cover.jpg, and feulai_cover.jpg sit unreferenced in public/.",
        fix: "Compress those cover images to WebP/AVIF (~80–120 KB each) and integrate real high-DPI interface screens into StackingProjects and CaseStudyPage."
      },
      {
        id: "BUG-15",
        sev: "P1",
        cat: "Credibility & Copy",
        title: "Inconsistent metrics, titles, and dates across pages (₹45 vs ₹50 payout; 6 different job titles)",
        file: "ResumePage.tsx:117,142,244 · StackingProjects.tsx:228 · JournalPage.tsx:18",
        evidence: "Feul.AI states '₹45/prompt' on Home/Case Study but '₹50 Calibration Quests' on Resume. Job title shifts between 'Product Designer & Engineer', 'Systems & Product Designer', 'Lead Product Designer & Systems Architect', 'Legal Tech Architect', and 'Founding Technologist'. Resume claims '3+ years designing' alongside B.Tech 2022–2026 and '2024 →' practice start.",
        fix: "Standardize one canonical title, align experience duration with timeline dates, and reconcile Feul.AI's payout figures."
      },
      {
        id: "BUG-16",
        sev: "P2",
        cat: "Sky & Performance",
        title: "Barrel import in GardenField pulls unused Three.js, Motion, and 8 shaders into one 468.7 KB JS bundle",
        file: "src/sections/GardenField.tsx:4 · src/components/originkit/index.ts",
        evidence: "Vite build emits a single 468.69 KB (148.82 KB gzip) JS chunk. GardenField imports BluebellPass via '@/components/originkit' barrel, forcing Rollup to bundle StillSunsetMeadow (Three.js), StarfieldButton/BloomingFlower (Motion), and 6 other unused Originkit shaders — contradicting README's 'no animation library, no 3D library'.",
        fix: "Import BluebellPass directly from '@/components/originkit/BluebellPass', lazy-load secondary routes with React.lazy(), and remove unused 'three' and 'motion' dependencies."
      },
      {
        id: "BUG-17",
        sev: "P2",
        cat: "SEO, Routing & A11y",
        title: "Rudraksh Singh's name is missing from <title> and meta description; zero OpenGraph, Twitter, or favicon tags",
        file: "index.html:1-17 · src/router/Router.tsx",
        evidence: "<title> is hardcoded to 'Sky Field — Portfolio' across every route, with no favicon (404 in browser), no canonical URL, and no og:title / og:description / og:image social preview cards.",
        fix: "Update index.html title to 'Rudraksh Singh — Product Designer & Design Engineer', add favicon + OG/Twitter metadata, and update document.title per route in Router.tsx."
      },
      {
        id: "BUG-18",
        sev: "P2",
        cat: "SEO, Routing & A11y",
        title: "URL bar polluted with ?variant=volumetric; direct /#work, /#contact, and /#projects deep links misfire",
        file: "src/App.tsx:33-42 · src/router/Router.tsx:31-55 · StackingProjects.tsx:324",
        evidence: "App.tsx rewrites every URL to '?variant=volumetric' on mount. Visiting '/#work' or '/#contact' resolves path='/' in Router.tsx without scrolling to the target element. StackingProjects renders id='projects' on Home, colliding with '#/projects' route.",
        fix: "Stop forcing '?variant=volumetric' into window.history, trigger scrollIntoView after mount for anchorAliases, and remove duplicate id='projects' from StackingProjects."
      },
      {
        id: "BUG-19",
        sev: "P2",
        cat: "SEO, Routing & A11y",
        title: "Keyboard & screen-reader gaps: concatenated H1, non-focusable cards, missing <header> landmark & dialog roles",
        file: "Hero.tsx:61 · NavigationNotch.tsx:57 · AboutPage.tsx:176 · JournalPage.tsx:85",
        evidence: "Accessibility tree reads H1 as 'Product Designer& Engineer' (missing space between flex spans). Top chrome is a <div> instead of <header>. Film slides (<div onClick>) and Journal essays (<article onClick>) have no button/link semantics or keyboard handlers. Modals lack role='dialog', aria-modal='true', and Escape/backdrop close (Journal & CaseStudy). NotFoundPage range input lacks an aria-label.",
        fix: "Add a space inside Hero H1 ('Product Designer '), change .site-top to <header>, use <button> triggers on Film Slides and Essays, and add dialog semantics + Escape/backdrop handlers to all modals."
      },
      {
        id: "BUG-20",
        sev: "P2",
        cat: "Sky & Performance",
        title: "ButterflyCursor ignores prefers-reduced-motion and touch screens; Footer ticks full re-renders at 1Hz",
        file: "src/components/ButterflyCursor.tsx:11-50 · ExcavationCraterFooter.tsx:14-37",
        evidence: "ButterflyCursor runs an unconditional 60fps requestAnimationFrame loop even under prefers-reduced-motion: reduce and on mobile touch devices (where synthetic mousemove leaves a stuck butterfly on tap). ExcavationCraterFooter runs a 1000ms setInterval re-rendering the entire 350-line footer component every second even when off-screen.",
        fix: "Disable ButterflyCursor when matchMedia('(prefers-reduced-motion: reduce)') or '(pointer: coarse)' matches, and isolate the timezone clock text into a tiny memoized leaf component (update every 15–60s or only when visible)."
      },
      {
        id: "BUG-21",
        sev: "P2",
        cat: "SEO, Routing & A11y",
        title: "Journal essays cannot be linked or shared individually despite defining slugs",
        file: "src/pages/JournalPage.tsx:14-60, 84-152",
        evidence: "Each essay defines a 'slug' ('designing-the-decision-not-the-screen', etc.), but clicking an essay only opens local component state in a modal with no hash/route update.",
        fix: "Sync activeEssay with '#/journal/<slug>' (or '?note=<slug>') in Router.tsx so essays can be bookmarked and shared directly."
      },
      {
        id: "BUG-22",
        sev: "P3",
        cat: "Codebase & Tests",
        title: "20 of 124 automated E2E tests fail ('npm test' exits 1), contradicting TEST_READY.md's '100% PASS' claim",
        file: "tests/e2e/tier1-features.test.mjs · TEST_READY.md",
        evidence: "Running 'node tests/e2e/runner.mjs' fails 20 assertions expecting archived files (TypeGardenLoader.tsx, CompactAudioPlayer.tsx, HeroIsland.tsx) and superseded NavigationNotch / ThermalSkyClock markup.",
        fix: "Update Tier 1 E2E assertions to test the current GardenField, NavigationNotch, and ThermalSkyClock architecture, and refresh TEST_READY.md."
      },
      {
        id: "BUG-23",
        sev: "P3",
        cat: "Layout & Responsive",
        title: "ProjectsPage Tier 3 dense 12-column grid cramps text on 320px–375px phones and NotFoundPage blocks text selection",
        file: "src/pages/ProjectsPage.tsx:204-226 · NotFoundPage.tsx:17",
        evidence: "Tier 3 table uses fixed 'grid-cols-12 px-6' without responsive stacking or overflow-x-auto, squeezing STATUS into ~45px on narrow phones. NotFoundPage puts 'select-none' on the entire page container.",
        fix: "Stack Tier 3 experiment rows on <640px (or wrap in overflow-x-auto) and restrict 'select-none' on NotFoundPage to the SVG radio graphic."
      },
      {
        id: "BUG-24",
        sev: "P3",
        cat: "Codebase & Tests",
        title: "README.md and MASTER-MANIFESTO.md describe retired controls, missing qa/ scripts, and dead files",
        file: "README.md:92-136, 156-165 · src/* (28 unused files)",
        evidence: "README tells users to press '1'/'2'/'3' to switch sky variants, '[' to hide HUD, edit TimeClock.tsx / Island.tsx / Works.tsx, and run 'node qa/shoot.mjs' (qa/ does not exist). Meanwhile 28 unused source files and archive/ sit in the repo.",
        fix: "Prune unused components/styles and rewrite README.md to match the actual VolumetricSky + GardenField + ThermalSkyClock codebase."
      }
    ];

    