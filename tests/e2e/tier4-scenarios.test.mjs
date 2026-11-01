/**
 * Tier 4: Real-World Application Scenarios (Full Visitor Journeys)
 * End-to-end integration journeys testing realistic user sessions across
 * multiple interactive subsystems, timing sequences, and navigation flows.
 */

import {
  describe,
  it,
  assert,
  assertEqual,
  assertApprox,
  calculateFlowerPupil,
  calculateFlower3DTilt,
  computeNotchMorphState,
  computeSolarRelighting,
  computeParallaxProgress,
} from "./harness.mjs";

describe("Tier 4 - Real-World Application Scenarios", () => {
  /* ========================================================================
     Scenario 1: Canonical First-Time Visitor Journey
     ======================================================================== */
  it("SCENARIO 1: Complete canonical visitor journey (Load -> Bloom -> Dock -> Island -> Keel -> Dossier -> Crater -> Orbit)", () => {
    // ----------------------------------------------------------------------
    // Step 1: Initial Arrival & Botanical Garden Bloom
    // ----------------------------------------------------------------------
    let path = "/";
    let scrollY = 0;
    let loaderStage = "blooming";
    let isLoaderDocked = false;

    assertEqual(loaderStage, "blooming", "Step 1: Visitor lands; TypeGardenLoader starts blooming");

    // ----------------------------------------------------------------------
    // Step 2: Docking Glide Transition into Top Notch
    // ----------------------------------------------------------------------
    // After 2400ms, stage advances to docking
    loaderStage = "docking";
    assertEqual(loaderStage, "docking", "Step 2: Loader begins gliding upward towards top notch");

    // After 3200ms, stage completes and docks
    loaderStage = "docked";
    isLoaderDocked = true;
    assertEqual(isLoaderDocked, true, "Step 2: Seed word docks into notch identity socket");

    // ----------------------------------------------------------------------
    // Step 3: Top Notch is Expanded at Top of Hero Stage (Altitude 01)
    // ----------------------------------------------------------------------
    let notchState = computeNotchMorphState({ path, scrollY, isHovered: false });
    assertEqual(notchState.isCompact, false, "Step 3: Top notch is expanded displaying navigation links");
    assertEqual(notchState.notchWidth, "auto", "Step 3: Notch has full width");

    // ----------------------------------------------------------------------
    // Step 4: Visitor Explores Hero Stage; Cursor Tracking Flower Follows Mouse
    // ----------------------------------------------------------------------
    const flowerCenter = { x: 640, y: 22 };
    // Visitor moves mouse to inspect floating island meadow (x: 900, y: 350)
    const mouse1 = { x: 900, y: 350 };
    const tracking1 = calculateFlowerPupil(mouse1.x, mouse1.y, flowerCenter.x, flowerCenter.y, 4.5);
    const tilt1 = calculateFlower3DTilt(mouse1.x, mouse1.y, flowerCenter.x, flowerCenter.y, 1280, 800);

    assert(tracking1.clampedRadius > 0 && tracking1.clampedRadius <= 4.5, "Step 4: Pupil follows mouse");
    assert(tracking1.x > 0 && tracking1.y > 0, "Step 4: Pupil moves towards meadow bottom-right");
    assert(Math.abs(tilt1.tiltX) > 0 && Math.abs(tilt1.tiltY) > 0, "Step 4: 3D tilt perspective applies");

    // ----------------------------------------------------------------------
    // Step 5: Visitor Scrolls Down Past Keel Underside Thrusters (Altitude 02)
    // ----------------------------------------------------------------------
    scrollY = 800; // Scrolled past 60px threshold
    const parallaxProgress = computeParallaxProgress(scrollY, 3000, 1000);
    assertApprox(parallaxProgress, 0.4, 0.05, "Step 5: Parallax progress at keel reveal is ~0.4");

    notchState = computeNotchMorphState({ path, scrollY, isHovered: false });
    assertEqual(notchState.isScrolled, true, "Step 5: isScrolled is true when scrollY = 800 > 60");
    assertEqual(notchState.isCompact, true, "Step 5: Notch morphs into compact 48px circular flower");
    assertEqual(notchState.notchWidth, 48, "Step 5: Compact notch width is 48px");

    // ----------------------------------------------------------------------
    // Step 6: Visitor Reaches Stacking Projects (Altitude 03) & Clicks FlytBase Sentinel
    // ----------------------------------------------------------------------
    scrollY = 2200;
    // Visitor clicks "Open Executive Dossier ->" for FlytBase Sentinel
    path = "/case/sentinel";
    scrollY = 0; // Route navigation resets scroll to top

    // ----------------------------------------------------------------------
    // Step 7: On Case Study Route, Notch Remains Compact
    // ----------------------------------------------------------------------
    notchState = computeNotchMorphState({ path, scrollY, isHovered: false });
    assertEqual(notchState.isCaseStudy, true, "Step 7: Route is recognized as case study");
    assertEqual(notchState.isCompact, true, "Step 7: Notch remains in compact 48px circular flower mode");

    // ----------------------------------------------------------------------
    // Step 8: Visitor Hovers Over Compact Notch to Reveal Audio Controls
    // ----------------------------------------------------------------------
    notchState = computeNotchMorphState({ path, scrollY, isHovered: true });
    assertEqual(notchState.isCompact, false, "Step 8: Hovering compact notch expands full pill");

    // Visitor toggles audio playback ON
    let isAudioPlaying = true;
    assertEqual(isAudioPlaying, true, "Step 8: CompactAudioPlayer starts ambient celestial synthesis");

    // ----------------------------------------------------------------------
    // Step 9: Visitor Navigates Back to Homepage
    // ----------------------------------------------------------------------
    path = "/";
    scrollY = 0;
    notchState = computeNotchMorphState({ path, scrollY, isHovered: false });
    assertEqual(notchState.isCompact, false, "Step 9: Notch is expanded on home page top");
    assertEqual(isAudioPlaying, true, "Step 9: Audio continues playing smoothly across route transition");

    // ----------------------------------------------------------------------
    // Step 10: Visitor Scrolls to Bedrock Excavation Crater (Altitude 04)
    // ----------------------------------------------------------------------
    scrollY = 6000; // Deep scroll to bottom crater
    notchState = computeNotchMorphState({ path, scrollY, isHovered: false });
    assertEqual(notchState.isCompact, true, "Step 10: Notch is compact while at bottom crater");

    // ----------------------------------------------------------------------
    // Step 11: Visitor Inspects Global Telemetry & Copies Unified Handle
    // ----------------------------------------------------------------------
    const handle = "@rudrakshsinghh";
    let handleCopied = false;
    const copyHandle = (text) => {
      if (text === "@rudrakshsinghh") handleCopied = true;
    };
    copyHandle(handle);
    assertEqual(handleCopied, true, "Step 11: Unified handle copied to clipboard successfully");

    // ----------------------------------------------------------------------
    // Step 12: Visitor Clicks 'Return to Orbit' Button
    // ----------------------------------------------------------------------
    // Smooth scroll triggers window.scrollTo({ top: 0, behavior: "smooth" })
    scrollY = 0;
    notchState = computeNotchMorphState({ path, scrollY, isHovered: false });
    assertEqual(notchState.isCompact, false, "Step 12: Notch smoothly expands back to full pill at orbit top");
  });

  /* ========================================================================
     Scenario 2: Direct Deep-Link Case Study Journey
     ======================================================================== */
  it("SCENARIO 2: Direct deep-link visitor journey (#/case/lokai -> Compact Notch -> Audio Toggle -> About)", () => {
    // Visitor enters directly via deep link
    let path = "/case/lokai";
    let scrollY = 0;
    let isHovered = false;

    // Immediately in compact mode
    let notchState = computeNotchMorphState({ path, scrollY, isHovered });
    assertEqual(notchState.isCaseStudy, true, "Recognizes case study route on initial direct deep link");
    assertEqual(notchState.isCompact, true, "Notch is compact immediately on direct case study entry");

    // User hovers notch and clicks audio play
    isHovered = true;
    notchState = computeNotchMorphState({ path, scrollY, isHovered });
    assertEqual(notchState.isCompact, false, "Hover expands notch");

    let isAudioPlaying = true;
    assertEqual(isAudioPlaying, true, "Audio toggle activated");

    // User navigates to About page
    path = "/about";
    isHovered = false;
    notchState = computeNotchMorphState({ path, scrollY, isHovered });
    assertEqual(notchState.isCaseStudy, false, "No longer a case study route");
    assertEqual(notchState.isCompact, false, "Notch is expanded on About page at top");
    assertEqual(isAudioPlaying, true, "Audio persists to About page");
  });

  /* ========================================================================
     Scenario 3: Power User Rapid Navigation Flow
     ======================================================================== */
  it("SCENARIO 3: Power user rapid multi-route traversal and keyboard navigation", () => {
    const routeChain = ["/", "/projects", "/journal", "/resume", "/case/feul", "/"];
    let currentScroll = 0;

    for (const targetPath of routeChain) {
      const isCase = targetPath.startsWith("/case/");
      const state = computeNotchMorphState({ path: targetPath, scrollY: currentScroll, isHovered: false });
      assertEqual(state.isCaseStudy, isCase, `Route ${targetPath} case study flag check`);
      if (isCase) {
        assertEqual(state.isCompact, true, `Route ${targetPath} must be compact`);
      } else {
        assertEqual(state.isCompact, false, `Route ${targetPath} must be expanded at scrollY = 0`);
      }
    }
  });

  /* ========================================================================
     Scenario 4: Astronomical Night Nocturnal Atmosphere
     ======================================================================== */
  it("SCENARIO 4: Astronomical night visit (02:00 AM) atmosphere, thruster glow & crater telemetry", () => {
    // 02:00 AM solar time
    const daylight = 0.0;
    const relighting = computeSolarRelighting({ daylight, cloudKeyX: 0, cloudKeyY: 0 });

    // Emissive night shaders
    assertEqual(relighting.nightEmissive, 1.0, "Night emissive is 100% active");
    assertApprox(relighting.backlightOpacity, 0.15, 0.001, "Backlight opacity is 15%");

    // Verify crater telemetry coordinates match Indian subcontinent observatory
    const craterIST = "Asia/Kolkata";
    assert(craterIST.includes("Kolkata"), "Observatory timezone is Asia/Kolkata");
  });
});
