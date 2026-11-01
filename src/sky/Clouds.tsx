"use client";

/**
 * Cloud geometry — shared by all three variants.
 *
 * A cloud is a lumpy dome with a flat-ish base. We build it procedurally from a
 * seeded PRNG so the composition is stable across reloads, then hand the same
 * path data to vector (crisp fill), volumetric (feathered plates) and dither
 * (rasterized to canvas) renderers. That is what makes the variants feel like
 * three renderings of one physical sky rather than three different skies.
 */

import { seeded } from "@/lib/celestial";

export interface CloudSpec {
  /** Center x, 0..1 of viewport width. */
  x: number;
  /** Base y, 0..1 of viewport height. */
  y: number;
  /** Width as a fraction of viewport width. */
  w: number;
  /** Depth layer 0..1 (0 = far, 1 = near). Drives speed, blur and opacity. */
  depth: number;
  /** Drift multiplier. */
  speed: number;
  /** Seed for the silhouette. */
  seed: number;
}

/** Composition: sparse, wide, horizontal — a stratosphere, not a cumulus field. */
export const CLOUDS: CloudSpec[] = [
  // Far bank, low and wide — sits just above the horizon
  { x: 0.14, y: 0.66, w: 0.44, depth: 0.12, speed: 0.55, seed: 11 },
  { x: 0.58, y: 0.7, w: 0.36, depth: 0.1, speed: 0.5, seed: 12 },
  { x: 0.9, y: 0.62, w: 0.3, depth: 0.14, speed: 0.6, seed: 13 },
  // Mid band
  { x: 0.34, y: 0.42, w: 0.5, depth: 0.45, speed: 1, seed: 21 },
  { x: 0.78, y: 0.34, w: 0.38, depth: 0.4, speed: 0.9, seed: 22 },
  { x: 0.05, y: 0.28, w: 0.26, depth: 0.5, speed: 1.1, seed: 23 },
  // Near, high and thin — hangs above the island
  { x: 0.62, y: 0.16, w: 0.34, depth: 0.78, speed: 1.5, seed: 31 },
  { x: 0.22, y: 0.1, w: 0.22, depth: 0.7, speed: 1.4, seed: 32 },
  // A low streak catching the horizon light
  { x: 0.46, y: 0.8, w: 0.6, depth: 0.22, speed: 0.7, seed: 41 },
];

/**
 * Build a closed path for a lumpy cloud dome.
 * Coordinates are in a 1000×300 local box; callers scale it.
 */
export function cloudPath(seed: number, w = 1000, h = 300): string {
  const rand = seeded(seed * 7919);
  const bumps = 4 + Math.floor(rand() * 4); // 4..7 domes
  const baseY = h * 0.86;

  // Domes across the top, each an arc with its own radius and peak height.
  const points: { x: number; y: number }[] = [];
  let x = w * 0.02;
  for (let i = 0; i < bumps; i++) {
    const remaining = bumps - i;
    const segW = (w * 0.96 - x) / remaining;
    const cx = x + segW * (0.35 + rand() * 0.3);
    const peak = h * (0.18 + rand() * 0.5) * (1 - Math.abs(i - bumps / 2) / bumps);
    points.push({ x: cx, y: baseY - peak });
    x += segW;
  }

  let d = `M 0 ${baseY}`;
  points.forEach((p, i) => {
    const prev = i === 0 ? { x: -w * 0.02, y: baseY } : points[i - 1];
    const midX = (prev.x + p.x) / 2;
    // Control points above the chord give the soft shoulder of a formed cloud.
    d += ` C ${midX} ${prev.y - h * 0.22}, ${midX} ${p.y - h * 0.26}, ${p.x} ${p.y}`;
  });
  // Far shoulder then flat base
  const last = points[points.length - 1];
  d += ` C ${w + w * 0.01} ${last.y - h * 0.2}, ${w * 1.0} ${baseY - h * 0.02}, ${w} ${baseY}`;
  d += ` L ${w} ${baseY + h * 0.06} Q ${w * 0.5} ${baseY + h * 0.13}, 0 ${baseY + h * 0.06} Z`;
  return d;
}

/** Precompute path data once per cloud so renders are pure string reuse. */
const PATHS = new Map<number, string>();
export function cachedCloudPath(seed: number): string {
  let p = PATHS.get(seed);
  if (!p) {
    p = cloudPath(seed);
    PATHS.set(seed, p);
  }
  return p;
}

/** Cheap parallax offset for a cloud at time `s` seconds. */
export function driftX(c: CloudSpec, s: number, vw = 1): number {
  const travel = 0.55 + c.depth * 0.5; // fraction of viewport travelled per cycle
  const t = ((s * c.speed * 0.004 + c.x * 3.1) % 1 + 1) % 1;
  return (t * travel - travel * 0.5) * vw;
}
