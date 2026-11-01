/**
 * E2E Test Harness & Specification Oracles for Sky Portfolio
 * Authoritative mathematical derivations, interface contracts, DOM/browser simulation,
 * and assertions for 4-tier requirement verification.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, "../..");
export const SRC_DIR = path.resolve(ROOT_DIR, "src");

/* ==========================================================================
   1. Test Suite Registry & Assertions
   ========================================================================== */

export const testSuites = [];
let currentSuite = null;

export function describe(suiteName, suiteFn) {
  const suite = {
    name: suiteName,
    tests: [],
  };
  testSuites.push(suite);
  const previousSuite = currentSuite;
  currentSuite = suite;
  try {
    suiteFn();
  } finally {
    currentSuite = previousSuite;
  }
}

export function it(testName, testFn) {
  if (!currentSuite) {
    throw new Error(`Test "${testName}" must be inside a describe block.`);
  }
  currentSuite.tests.push({
    name: testName,
    fn: testFn,
  });
}

export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const defaultMsg = `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`;
    throw new Error(message ? `${message} (${defaultMsg})` : defaultMsg);
  }
}

export function assertApprox(actual, expected, epsilon = 0.001, message) {
  const diff = Math.abs(actual - expected);
  if (diff > epsilon) {
    const defaultMsg = `Expected ~${expected} (±${epsilon}), but got ${actual} (diff: ${diff.toFixed(6)})`;
    throw new Error(message ? `${message} (${defaultMsg})` : defaultMsg);
  }
}

export function assertMatches(actual, regex, message) {
  if (!regex.test(String(actual))) {
    const defaultMsg = `Expected "${actual}" to match regex ${regex}`;
    throw new Error(message ? `${message} (${defaultMsg})` : defaultMsg);
  }
}

export function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(message || "Expected function to throw, but it did not throw.");
  }
}

export function assertArrayEqual(actual, expected, message) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    throw new Error(message || `Expected both arguments to be arrays.`);
  }
  if (actual.length !== expected.length) {
    throw new Error(
      message ||
        `Array length mismatch: expected ${expected.length}, got ${actual.length}`
    );
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(
        message ||
          `Array element mismatch at index ${i}: expected ${actual[i]}, got ${expected[i]}`
      );
    }
  }
}

/* ==========================================================================
   2. Authoritative Specification Oracles (PROJECT.md / ORIGINAL_REQUEST.md)
   ========================================================================== */

/**
 * Cursor-Tracking Flower pupil offset oracle
 * θ = atan2(Ym - Yf, Xm - Xf)
 * D = hypot(dx, dy)
 * R = Rmax * tanh(D / 280), Rmax = 4.5px
 * pupilX = R * cos(θ), pupilY = R * sin(θ)
 */
export function calculateFlowerPupil(mouseX, mouseY, flowerX, flowerY, maxRadius = 4.5) {
  if (
    mouseX === null ||
    mouseY === null ||
    Number.isNaN(mouseX) ||
    Number.isNaN(mouseY)
  ) {
    return { x: 0, y: 0, angle: 0, distance: 0, clampedRadius: 0 };
  }
  const dx = mouseX - flowerX;
  const dy = mouseY - flowerY;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const dampFactor = Math.tanh(distance / 280);
  const clampedRadius = maxRadius * dampFactor;
  const x = Math.cos(angle) * clampedRadius;
  const y = Math.sin(angle) * clampedRadius;
  return { x, y, angle, distance, clampedRadius };
}

/**
 * Cursor-Tracking Flower 3D tilt perspective oracle
 * perspective(400px) rotateX(clamp(-20deg, 20deg)) rotateY(clamp(-25deg, 25deg))
 */
export function calculateFlower3DTilt(mouseX, mouseY, flowerX, flowerY, vw = 1000, vh = 800) {
  const dx = mouseX - flowerX;
  const dy = mouseY - flowerY;
  const tiltX = Math.max(-20, Math.min(20, -(dy / vh) * 40));
  const tiltY = Math.max(-25, Math.min(25, (dx / vw) * 50));
  return { tiltX, tiltY };
}

/**
 * Top Notch Morphing State Machine oracle
 * isCaseStudy = path.startsWith("/case/")
 * isScrolled = scrollY > 60
 * isCompact = (isCaseStudy || isScrolled) && !isHovered && !isMobileDrawerOpen
 */
export function computeNotchMorphState({
  path = "/",
  scrollY = 0,
  isHovered = false,
  isMobileDrawerOpen = false,
}) {
  const isCaseStudy = path.startsWith("/case/");
  const isScrolled = scrollY > 60;
  const isCompact = (isCaseStudy || isScrolled) && !isHovered && !isMobileDrawerOpen;
  const notchWidth = isCompact ? 48 : "auto";
  const notchHeight = isCompact ? 48 : 44;
  return {
    isCaseStudy,
    isScrolled,
    isCompact,
    notchWidth,
    notchHeight,
  };
}

/**
 * Video Character Slot Solar Relighting oracle
 * nightEmissive = 1 - daylight
 * rimShadowX = cloudKeyX * 30, rimShadowY = cloudKeyY * 15
 */
export function computeSolarRelighting({ daylight = 1, cloudKeyX = 0.5, cloudKeyY = -0.5 }) {
  const clampedDaylight = Math.max(0, Math.min(1, daylight));
  const nightEmissive = 1 - clampedDaylight;
  const rimShadowX = cloudKeyX * 30;
  const rimShadowY = cloudKeyY * 15;
  const backlightOpacity = nightEmissive * 0.15;
  return {
    nightEmissive,
    rimShadowX,
    rimShadowY,
    backlightOpacity,
    aspectRatio: "16/9",
  };
}

/**
 * Hero Island Parallax Progress oracle
 * p = clamp(0, 1, scrollY / (heroTrackHeight - viewportHeight))
 */
export function computeParallaxProgress(scrollY, heroTrackHeight = 3000, viewportHeight = 1000) {
  const range = heroTrackHeight - viewportHeight;
  if (range <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / range));
}

/* ==========================================================================
   3. Synthetic DOM & Browser Environment Simulator
   ========================================================================== */

export function createMockBrowserEnvironment({
  width = 1280,
  height = 800,
  initialHash = "#/",
} = {}) {
  const listeners = new Map();

  class MockElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase();
      this.attributes = new Map();
      this.classList = new Set();
      this.style = {};
      this.children = [];
      this.innerHTML = "";
      this.innerText = "";
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }

    getAttribute(name) {
      return this.attributes.get(name) || null;
    }

    getBoundingClientRect() {
      // Default notch or element box
      return {
        left: width / 2 - 250,
        top: 14,
        width: 500,
        height: 44,
        right: width / 2 + 250,
        bottom: 58,
      };
    }
  }

  class MockAudioContext {
    constructor() {
      this.state = "suspended";
      this.currentTime = 0;
    }

    resume() {
      this.state = "running";
      return Promise.resolve();
    }

    suspend() {
      this.state = "suspended";
      return Promise.resolve();
    }

    createGain() {
      return {
        gain: {
          value: 1,
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
          cancelScheduledValues: () => {},
        },
        connect: () => {},
      };
    }

    createOscillator() {
      return {
        type: "sine",
        frequency: { setValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }

    createBiquadFilter() {
      return {
        type: "lowpass",
        frequency: { setValueAtTime: () => {} },
        Q: { setValueAtTime: () => {} },
        connect: () => {},
      };
    }
  }

  const location = {
    hash: initialHash,
    pathname: "/",
    search: "",
  };

  const windowMock = {
    innerWidth: width,
    innerHeight: height,
    scrollY: 0,
    scrollX: 0,
    location,
    AudioContext: MockAudioContext,
    matchMedia: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    scrollTo: ({ top = 0 }) => {
      windowMock.scrollY = top;
      windowMock.dispatchEvent(new Event("scroll"));
    },
    addEventListener: (type, handler) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener: (type, handler) => {
      if (listeners.has(type)) {
        listeners.get(type).delete(handler);
      }
    },
    dispatchEvent: (event) => {
      const handlers = listeners.get(event.type);
      if (handlers) {
        for (const handler of handlers) {
          handler(event);
        }
      }
    },
  };

  class Event {
    constructor(type, params = {}) {
      this.type = type;
      Object.assign(this, params);
    }
  }

  class MouseEvent extends Event {
    constructor(type, params = {}) {
      super(type, params);
      this.clientX = params.clientX ?? 0;
      this.clientY = params.clientY ?? 0;
    }
  }

  const documentMock = {
    documentElement: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    createElement: (tag) => new MockElement(tag),
    getElementById: () => null,
  };

  return {
    window: windowMock,
    document: documentMock,
    Event,
    MouseEvent,
    MockElement,
    MockAudioContext,
  };
}

/* ==========================================================================
   4. Codebase Source Inspector
   ========================================================================== */

export function inspectSourceFile(relativePath) {
  const fullPath = path.resolve(SRC_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    return {
      exists: false,
      path: fullPath,
      content: "",
      hasText: () => false,
      hasRegex: () => false,
    };
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  return {
    exists: true,
    path: fullPath,
    content,
    hasText: (text) => content.includes(text),
    hasRegex: (regex) => regex.test(content),
    linesCount: content.split("\n").length,
  };
}
