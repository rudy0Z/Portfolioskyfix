/**
 * Celestial mechanics — where the sun, moon and stars are at any hour.
 *
 * Intentionally simple and continuous rather than astronomically exact:
 *  - The sun rises at 06:00, peaks at 12:00, sets at 18:00.
 *  - The moon runs in antiphase (rises 18:00, peaks 00:00, sets 06:00) so there
 *    is always exactly one disc in the sky and it swaps at the horizon.
 *  - Altitude follows a smooth cosine; position along the arc follows a
 *    parabola-ish easing so the disc decelerates near the horizon exactly the
 *    way a timelapse looks.
 *
 * All positions are normalized 0..1 in viewport space, so components can place
 * them with percentages and stay resolution-independent.
 */

import { clamp, smoothstep, wrapHours } from "./color";

export interface Body {
  /** 0 = left edge, 1 = right edge. */
  x: number;
  /** 0 = top of sky, 1 = horizon line. */
  y: number;
  /** -1 (far below horizon) … 0 (horizon) … 1 (zenith). */
  altitude: number;
  /** Visible above the horizon line. */
  visible: boolean;
  /** 0..1 opacity fade through the horizon crossing. */
  opacity: number;
}

/** Height the sun reaches at noon, in framed sky units. */
const SUN_PEAK = 0.52;
/** Height the moon reaches at midnight — lower, so it never leaves frame. */
const MOON_PEAK = 0.44;
/**
 * Where the horizon sits in the framed sky — measured against the island's
 * crown at rest (≈85% of viewport height). A setting sun meets the rim of the
 * land; it does not sink to the bottom edge of the screen.
 */
const HORIZON_Y = 0.85;

/** Altitude curve: -1 at 00:00, 0 at 06:00/18:00, +1 at 12:00. */
export function solarAltitude(t: number): number {
  const h = wrapHours(t);
  // Dawn at 05:40, sunset at 18:40 — a late-summer day, which is what makes a
  // 18:00 scrub read as blazing terracotta rather than nightfall.
  return Math.sin((Math.PI * (h - 5.667)) / 13);
}

/**
 * Horizontal position along a half-circle from 06:00 (left) to 18:00 (right).
 * Uses cos so motion is slowest at the horizon — the classic timelapse feel.
 */
function arcX(t: number, riseAt: number): number {
  const h = wrapHours(t);
  const span = ((h - riseAt + 24) % 24) / 12; // 0..1 over a 12h half-arc, 1..2 over the night
  return 0.5 - 0.5 * Math.cos(Math.PI * span);
}

function body(altitude: number, x: number, peak = SUN_PEAK): Body {
  const arcY = HORIZON_Y - Math.max(0, altitude) * peak;
  // Below the horizon the disc keeps sinking past the land line.
  const y = altitude >= 0 ? arcY : HORIZON_Y + Math.abs(altitude) * 0.14;
  const opacity = smoothstep(-0.06, 0.18, altitude);
  return { x: clamp(x, -0.15, 1.15), y, altitude, visible: opacity > 0.01, opacity };
}

export function sunAt(t: number): Body {
  const alt = solarAltitude(t);
  // Arc runs 05:40 → 18:40. Clamped to 8–92% of the width so the disc never
  // slips off-frame at the extremes of the day.
  const x = 0.08 + arcX(t, 5.667) * 0.84;
  // Ease the climb: a real sunrise clears the treeline quickly, so bias the
  // altitude upward near the horizon (this also keeps the disc visible behind
  // the island's crown instead of vanishing into it).
  return body(Math.sign(alt) * Math.pow(Math.abs(alt), 0.72), x);
}

/** Antiphase moon — but with a small offset so the swap feels organic. */
/**
 * The moon rises in the east as the sun sets in the west, so it travels the
 * *mirrored* arc (right → left) rather than retracing the sun's path.
 */
export function moonAt(t: number): Body {
  const alt = -solarAltitude(t);
  const x = 0.92 - arcX(t, 18.5) * 0.84;
  return body(alt, x, MOON_PEAK);
}

/* ── moon phase ─────────────────────────────────────────────────────────── */

const SYNODIC = 29.530588;
const KNOWN_NEW_MOON = Date.UTC(2026, 0, 18, 19, 52); // a real new moon anchor

/** 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
export function moonPhase(date = new Date()): number {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86_400_000;
  return wrapHours(days / SYNODIC) / 24;
}

/** Illuminated fraction 0..1. */
export function moonIllumination(phase: number): number {
  return (1 - Math.cos(2 * Math.PI * phase)) / 2;
}

/* ── stars ──────────────────────────────────────────────────────────────── */

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  /** Per-star twinkle offset so they don't pulse in unison. */
  phase: number;
  speed: number;
  /** A few stars get a faint halo. */
  halo: boolean;
}

/** Deterministic PRNG so the sky is identical across reloads and SSR. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildStars(count = 220, seed = 20261021): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => ({
    x: rand(),
    // Bias stars away from the very bottom where terrain sits.
    y: Math.pow(rand(), 0.85) * 0.9,
    size: 0.8 + Math.pow(rand(), 3) * 2.6,
    brightness: 0.25 + rand() * 0.75,
    phase: rand() * Math.PI * 2,
    speed: 0.35 + rand() * 0.9,
    halo: rand() > 0.93 || i < 6,
  }));
}

/**
 * Stars fade in as the sun drops. Above 0.15 altitude: none. By -0.15: full.
 * Returns 0..1.
 */
export function starVisibility(sunAltitude: number): number {
  return 1 - smoothstep(-0.12, 0.12, sunAltitude);
}

/** Golden-hour weight: strong when the sun is low but above the horizon. */
export function goldenWeight(sunAltitude: number): number {
  return (
    smoothstep(-0.05, 0.06, sunAltitude) * (1 - smoothstep(0.1, 0.42, sunAltitude))
  );
}

/** Civil twilight weight: strongest right around the horizon line. */
export function twilightWeight(sunAltitude: number): number {
  return 1 - Math.abs(smoothstep(-0.32, 0.3, sunAltitude) * 2 - 1);
}
