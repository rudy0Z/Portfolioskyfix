/**
 * Adversarial Empirical Stress Test Suite — Challenger 1
 * Targets:
 * 1. Flower tracking math (extreme coords, clamped travel, singularities, NaN poisoning, 3D tilt).
 * 2. Notch morphing hysteresis & oscillation churn around 60px threshold.
 * 3. Audio player rapid click storm (100+ clicks, WebAudio node leaks, stale closure race condition).
 */

import { performance } from "node:perf_hooks";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

console.log("\n==================================================================");
console.log("       CHALLENGER 1 — EMPIRICAL ADVERSARIAL STRESS SUITE          ");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;
const findings = [];

function testCase(name, fn) {
  try {
    const t0 = performance.now();
    fn();
    const dt = (performance.now() - t0).toFixed(2);
    console.log(`  ✓ PASS: ${name} (${dt}ms)`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
    findings.push({ name, error: err.message, stack: err.stack });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function assertApprox(actual, expected, eps = 0.001, message) {
  if (Math.abs(actual - expected) > eps) {
    throw new Error(`${message}: expected ~${expected} (eps ${eps}), got ${actual}`);
  }
}

/* ==========================================================================
   PART 1: FLOWER TRACKING MATHEMATICS STRESS TEST
   ========================================================================== */
console.log("▶ DOMAIN 1: Flower Tracking Mathematical Stress & Fuzzing");

// Implementation logic from TrackingFlower.tsx
function computeFlowerRaw(clientX, clientY, cx = 600, cy = 20, vw = 1200, vh = 800) {
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const maxR = 4.5;
  const dampFactor = Math.tanh(dist / 280);
  const targetX = Math.cos(angle) * maxR * dampFactor;
  const targetY = Math.sin(angle) * maxR * dampFactor;

  const targetTiltX = Math.max(-20, Math.min(20, -(dy / vh) * 24));
  const targetTiltY = Math.max(-25, Math.min(25, (dx / vw) * 28));

  return { dx, dy, dist, angle, dampFactor, targetX, targetY, targetTiltX, targetTiltY };
}

// 1. Extreme Coordinate Stress Test
testCase("1.1 Extreme coordinates (10^6, -10^6) strictly clamp R <= 4.5px", () => {
  const extremePairs = [
    [1e6, -1e6],
    [-1e6, 1e6],
    [-1e6, -1e6],
    [1e6, 1e6],
    [1e9, 1e9],
    [-1e9, -1e9],
    [1e15, -1e15],
  ];

  for (const [x, y] of extremePairs) {
    const res = computeFlowerRaw(x, y);
    const r = Math.hypot(res.targetX, res.targetY);
    assertApprox(r, 4.5, 0.0001, `Extreme point (${x}, ${y}) clamped R`);
    assert(r <= 4.50000001, `R cannot exceed max 4.5px`);
    assert(res.targetTiltX >= -20 && res.targetTiltX <= 20, "tiltX clamped to ±20");
    assert(res.targetTiltY >= -25 && res.targetTiltY <= 25, "tiltY clamped to ±25");
  }
});

// 2. Singularity at Origin / Coincident Point (cx, cy)
testCase("1.2 Coincident cursor singularity (dx=0, dy=0) yields (0, 0) without NaN", () => {
  const res = computeFlowerRaw(600, 20);
  assert(!Number.isNaN(res.targetX), "targetX must not be NaN");
  assert(!Number.isNaN(res.targetY), "targetY must not be NaN");
  assert(!Number.isNaN(res.angle), "angle must not be NaN");
  assertEqual(res.targetX, 0, "targetX must be 0 at coincident point");
  assertEqual(res.targetY, 0, "targetY must be 0 at coincident point");
  assertEqual(res.targetTiltX, 0, "targetTiltX must be 0");
  assertEqual(res.targetTiltY, 0, "targetTiltY must be 0");
});

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

// 3. Fuzzing 10,000 Random Viewport & Off-Screen Coordinates
testCase("1.3 Fuzz test: 10,000 random coordinates never produce NaN or R > 4.5", () => {
  for (let i = 0; i < 10000; i++) {
    const rx = (Math.random() - 0.5) * 200000;
    const ry = (Math.random() - 0.5) * 200000;
    const res = computeFlowerRaw(rx, ry);
    const r = Math.hypot(res.targetX, res.targetY);

    if (Number.isNaN(res.targetX) || Number.isNaN(res.targetY)) {
      throw new Error(`NaN generated for coordinate (${rx}, ${ry})`);
    }
    if (r > 4.500001) {
      throw new Error(`Radius exceeded 4.5px: ${r} for (${rx}, ${ry})`);
    }
  }
});

// 4. NaN / Undefined Poisoning in TrackingFlower State Loop
testCase("1.4 Adversarial NaN injection into spring damping loop (Vulnerability Check)", () => {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const ease = 0.14;

  const tick = () => {
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
  };

  // Run 10 clean ticks
  targetX = 3.0;
  targetY = 2.0;
  for (let i = 0; i < 10; i++) tick();
  assert(currentX > 0 && currentY > 0, "Spring advanced normally");

  // Inject a single poisoned NaN event
  const poisonedEvent = { clientX: Number.NaN, clientY: undefined };
  const cx = 600, cy = 20;
  const dx = poisonedEvent.clientX - cx;
  const dy = poisonedEvent.clientY - cy;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  targetX = Math.cos(angle) * 4.5 * Math.tanh(dist / 280);
  targetY = Math.sin(angle) * 4.5 * Math.tanh(dist / 280);

  // Tick with poisoned target
  tick();

  const isPoisoned = Number.isNaN(currentX) || Number.isNaN(currentY);
  assert(isPoisoned, "Current coordinates must become NaN when exposed to raw NaN event");

  // Now attempt to recover with 50 valid ticks
  targetX = 1.0;
  targetY = 1.0;
  for (let i = 0; i < 50; i++) tick();

  const recovered = !Number.isNaN(currentX) && !Number.isNaN(currentY);
  // This demonstrates that once NaN enters currentX += (targetX - currentX) * ease, currentX NEVER recovers!
  if (!recovered) {
    console.log("    [FINDING CONFIRMED]: Damping loop does NOT self-heal once poisoned by NaN.");
    console.log("    Target code in TrackingFlower.tsx lacks finite guard on e.clientX/clientY.");
  }
});

/* ==========================================================================
   PART 2: NOTCH MORPHING HYSTERESIS & SCROLL OSCILLATION
   ========================================================================== */
console.log("\n▶ DOMAIN 2: Notch Morphing Hysteresis & Rapid Scroll Oscillation");

// Implementation logic from NavigationNotch.tsx
function computeNotchMorph(scrollY, path = "/", isHovered = false, isMobileDrawerOpen = false) {
  const isCaseStudy = path.startsWith("/case/");
  const isScrolled = scrollY > 60;
  const shouldBeCompact = ((isCaseStudy || isScrolled) && !isHovered && !isMobileDrawerOpen);
  return { isScrolled, shouldBeCompact, isCaseStudy };
}

// 2.1 Boundary threshold check at exact 60.00px
testCase("2.1 Strict threshold at 60.0px (scrollY > 60 vs <= 60)", () => {
  assertEqual(computeNotchMorph(60.0).shouldBeCompact, false, "60.0px is NOT compact");
  assertEqual(computeNotchMorph(60.0001).shouldBeCompact, true, "60.0001px IS compact");
  assertEqual(computeNotchMorph(59.9999).shouldBeCompact, false, "59.9999px is NOT compact");
});

// 2.2 Rapid 1000-cycle scroll oscillation around 60px
testCase("2.2 1,000-cycle scroll flutter (59.9px <-> 60.1px) simulation & churn measurement", () => {
  let toggleCount = 0;
  let previousState = null;

  for (let i = 0; i < 1000; i++) {
    const scrollY = i % 2 === 0 ? 59.9 : 60.1;
    const { shouldBeCompact } = computeNotchMorph(scrollY);
    if (previousState !== null && shouldBeCompact !== previousState) {
      toggleCount++;
    }
    previousState = shouldBeCompact;
  }

  assertEqual(toggleCount, 999, "Every flutter cycle flips shouldBeCompact");
  console.log(`    [OBSERVATION]: 1,000 scroll oscillations produced ${toggleCount} full state flips.`);
  console.log("    Absence of a hysteresis deadband (e.g. 55px-65px) means micro-scroll causes continuous layout thrash.");
});

// 2.3 Audio Player Unmount Churn during scroll oscillation
testCase("2.3 Component churn: CompactAudioPlayer unmounts during compact morph", () => {
  const notchSource = fs.readFileSync(path.resolve(ROOT_DIR, "src/components/navigation/NavigationNotch.tsx"), "utf-8");
  const audioSource = fs.readFileSync(path.resolve(ROOT_DIR, "src/components/navigation/CompactAudioPlayer.tsx"), "utf-8");

  // Check if CompactAudioPlayer is conditionally rendered in expanded branch only
  const hasConditionalAudio = notchSource.includes("{shouldBeCompact ?") && 
    notchSource.indexOf("<CompactAudioPlayer") > notchSource.indexOf("{shouldBeCompact ?");

  assert(hasConditionalAudio, "NavigationNotch conditionally mounts CompactAudioPlayer only when expanded");

  // Check if CompactAudioPlayer closes audioCtx on unmount
  const hasUnmountClose = audioSource.includes("audioCtxRef.current.close()");
  assert(hasUnmountClose, "CompactAudioPlayer closes AudioContext on unmount");

  console.log("    [CRITICAL ARCHITECTURAL FINDING]: When user scrolls past 60px, notch morphs to compact.");
  console.log("    Because CompactAudioPlayer is inside expanded branch, it unmounts and executes AudioContext.close().");
  console.log("    Result: Ambient soundscape is terminated when user scrolls down to view portfolio!");
});

// 2.4 Hover immunity during scroll oscillation
testCase("2.4 Hover state overrides scroll oscillation cleanly (Hover Immunity)", () => {
  for (let i = 0; i < 100; i++) {
    const scrollY = i % 2 === 0 ? 59.9 : 60.1;
    const { shouldBeCompact } = computeNotchMorph(scrollY, "/", true); // isHovered = true
    assertEqual(shouldBeCompact, false, "Hover must keep notch expanded regardless of scroll oscillation");
  }
});

/* ==========================================================================
   PART 3: AUDIO RAPID CLICK STORM & CONCURRENCY RACE CONDITIONS
   ========================================================================== */
console.log("\n▶ DOMAIN 3: Audio Rapid Click Storm & Race Condition Verification");

class SimulatedWebAudioEngine {
  constructor() {
    this.audioCtx = {
      state: "running",
      currentTime: 0,
      createGain: () => ({
        gain: {
          value: 1,
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
          cancelScheduledValues: () => {},
        },
        connect: () => {},
      }),
      createBiquadFilter: () => ({
        type: "lowpass",
        frequency: { setValueAtTime: () => {} },
        Q: { setValueAtTime: () => {} },
        connect: () => {},
      }),
      createOscillator: () => {
        const osc = {
          started: false,
          stopped: false,
          start: () => { osc.started = true; activeOscillators++; totalOscillatorsCreated++; },
          stop: () => {
            if (!osc.stopped) {
              osc.stopped = true;
              activeOscillators--;
            }
          },
          connect: () => {},
          frequency: { setValueAtTime: () => {} },
        };
        return osc;
      },
      destination: {},
    };
  }
}

let activeOscillators = 0;
let totalOscillatorsCreated = 0;

// Replicate CompactAudioPlayer toggle / startSynth / stopSynth logic exactly
class SimulatedCompactAudioPlayer {
  constructor() {
    this.isPlaying = false;
    this.audioCtxRef = { current: new SimulatedWebAudioEngine().audioCtx };
    this.nodesRef = { current: null };
    this.activeTimeouts = [];
  }

  startSynth() {
    const ctx = this.audioCtxRef.current;
    if (this.nodesRef.current) {
      try {
        this.nodesRef.current.oscillators.forEach((osc) => osc.stop());
      } catch {}
      this.nodesRef.current = null;
    }

    const oscillators = [];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.start();
      oscillators.push(osc);
    }

    this.nodesRef.current = {
      gainNode: ctx.createGain(),
      oscillators,
      filterNode: ctx.createBiquadFilter(),
    };
  }

  stopSynth(scheduleDelayMs = 650) {
    if (this.audioCtxRef.current && this.nodesRef.current) {
      const { oscillators } = this.nodesRef.current;
      const tId = setTimeout(() => {
        oscillators.forEach((osc) => {
          try { osc.stop(); } catch {}
        });
        this.nodesRef.current = null; // <- Line 128 in CompactAudioPlayer.tsx
      }, scheduleDelayMs);
      this.activeTimeouts.push(tId);
    }
  }

  togglePlay(scheduleDelayMs = 650) {
    const nextState = !this.isPlaying;
    this.isPlaying = nextState;
    if (nextState) {
      this.startSynth();
    } else {
      this.stopSynth(scheduleDelayMs);
    }
  }
}

// 3.1 100-Click Rapid Synchronous Toggle Storm
testCase("3.1 100-Click rapid toggle storm parity check", () => {
  activeOscillators = 0;
  totalOscillatorsCreated = 0;
  const player = new SimulatedCompactAudioPlayer();

  for (let i = 0; i < 100; i++) {
    player.togglePlay(650);
  }

  assertEqual(player.isPlaying, false, "100 clicks must leave isPlaying = false");
  assertEqual(totalOscillatorsCreated, 50 * 4, "50 plays must create 200 oscillators");
});

// 3.2 Race Condition: Sub-650ms Rapid Toggle Storm with Delayed Timeouts
testCase("3.2 Delayed Timeout Race Condition: nodesRef.current corrupted to null while playing", async () => {
  activeOscillators = 0;
  totalOscillatorsCreated = 0;
  const player = new SimulatedCompactAudioPlayer();

  // Step 1: User clicks Play
  player.togglePlay(50); // delay 50ms for test speed
  assertEqual(player.isPlaying, true, "Player is playing");
  assertEqual(activeOscillators, 4, "4 active oscillators");
  assert(player.nodesRef.current !== null, "nodesRef must exist");

  // Step 2: 10ms later, User clicks Pause -> stopSynth schedules timeout in 50ms
  player.togglePlay(50);
  assertEqual(player.isPlaying, false, "Player is paused");

  // Step 3: 20ms later (total 30ms), User clicks Play again -> startSynth starts new nodes
  player.togglePlay(50);
  assertEqual(player.isPlaying, true, "Player is playing again");
  assertEqual(activeOscillators, 4, "4 active oscillators (old ones stopped in startSynth)");
  const newNodes = player.nodesRef.current;
  assert(newNodes !== null, "New nodes created");

  // Step 4: Wait 60ms for Step 2's timeout to fire!
  await new Promise((r) => setTimeout(r, 65));

  // Step 5: Check player.nodesRef.current!
  // The stale timeout from Step 2 ran `this.nodesRef.current = null;`!
  const isCorrupted = player.nodesRef.current === null;

  if (isCorrupted) {
    console.log("    [CRITICAL RACE CONDITION CONFIRMED]: nodesRef.current was set to null while isPlaying=true!");
    console.log(`    Active running oscillators in audio context: ${activeOscillators}`);
    
    // Step 6: Now user clicks Pause to stop the music!
    player.togglePlay(50);
    // Because nodesRef.current is null, stopSynth() does nothing!
    assertEqual(player.isPlaying, false, "UI shows Paused");
    console.log(`    Oscillators still active and running after Pause click: ${activeOscillators}`);
    assert(activeOscillators > 0, "Oscillators were orphaned and leaked because nodesRef was null!");
    console.log("    RESULT: Audio is permanently orphaned and playing in background, un-stoppable!");
  }

  assert(isCorrupted, "Demonstrated delayed timeout race condition in CompactAudioPlayer");
});

/* ==========================================================================
   PART 4: SUMMARY & STATS
   ========================================================================== */
console.log("\n==================================================================");
console.log(`STRESS TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("==================================================================\n");

if (findings.length > 0) {
  console.log("FAILURES / FINDINGS REQUIRING ATTENTION:");
  findings.forEach((f, i) => {
    console.log(`${i + 1}) ${f.name}: ${f.error}`);
  });
}
