"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { withAlpha } from "@/lib/color";
import { getLight, type LightModel } from "@/lib/lighting";
import { useSkyTime } from "@/lib/useTimeOfDay";

/*
 * HeroMist — the luminous mist the garden melts into (hero plan §6.2, phase B).
 *
 * Three sprite strips are BAKED once per field relight (same cadence as the
 * garden) from the palette's haze / cloud colours, so the mist inherits
 * time-of-day automatically. At runtime the layers are plain GPU-composited
 * `transform`/`opacity` — scroll position drives the exit envelope through
 * the shared --hero-* vars, a slow CSS keyframe adds ambient drift. No canvas
 * work, no rAF of its own.
 */

const RELIGHT_STEPS_PER_HOUR = 6;
const RELIGHT_GAP_MS = 450;

/** Same stepped relight cadence as the garden's field palette. */
function useRelightStep(): number {
  const t = useSkyTime();
  const steps = 24 * RELIGHT_STEPS_PER_HOUR;
  const step = ((Math.round(t * RELIGHT_STEPS_PER_HOUR) % steps) + steps) % steps;
  const [applied, setApplied] = useState(step);
  const lastRef = useRef(0);

  useEffect(() => {
    if (step === applied) return;
    const wait = Math.max(160, RELIGHT_GAP_MS - (performance.now() - lastRef.current));
    const id = window.setTimeout(() => {
      lastRef.current = performance.now();
      setApplied(step);
    }, wait);
    return () => window.clearTimeout(id);
  }, [step, applied]);

  return applied;
}

/* ── sprite bake ─────────────────────────────────────────────────────────── */

/** Deterministic RNG so re-bakes change colour, never composition (no pop). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STRIP_W = 640;
const STRIP_H = 280;

interface LayerSpec {
  seed: number;
  puffs: number;
  rMin: number;
  rMax: number;
  /** Vertical band the puff centres live in (fraction of strip height). */
  yMin: number;
  yMax: number;
  alpha: number;
  /** Share of lit-top colour mixed into the puff cores. */
  lit: number;
  /** Share of cloud-shadow kissed into the undersides. */
  shade: number;
}

const LAYERS: LayerSpec[] = [
  // The bank: a few big soft masses, dense at the bottom — carries the mask line.
  { seed: 11, puffs: 13, rMin: 84, rMax: 148, yMin: 0.52, yMax: 0.94, alpha: 0.2, lit: 0.55, shade: 0.35 },
  // The billow: medium puffs, a little higher — gives the melt body.
  { seed: 47, puffs: 21, rMin: 44, rMax: 88, yMin: 0.34, yMax: 0.9, alpha: 0.15, lit: 0.7, shade: 0.25 },
  // The wisps: small bright motes near the top — what dissipates upward in C.
  { seed: 83, puffs: 30, rMin: 20, rMax: 44, yMin: 0.14, yMax: 0.78, alpha: 0.1, lit: 0.85, shade: 0.1 },
];

function bakeStrip(light: LightModel, spec: LayerSpec): string {
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const body = light.palette.haze;
  const lit = light.palette.cloudLit;
  const shadow = light.palette.cloudShadow;
  const rnd = mulberry32(spec.seed);

  for (let i = 0; i < spec.puffs; i++) {
    const r = spec.rMin + rnd() * (spec.rMax - spec.rMin);
    // Bias centres toward the bottom of their band: mist banks low.
    const y = STRIP_H * (spec.yMin + (1 - rnd() * rnd()) * (spec.yMax - spec.yMin));
    const x = STRIP_W * (-0.04 + rnd() * 1.08);
    const a = spec.alpha * (0.65 + rnd() * 0.7);
    const litMix = spec.lit * (0.55 + rnd() * 0.6);

    // Core: haze body with a lit crown (the key light grazes the tops).
    const core = ctx.createRadialGradient(x, y - r * 0.34, r * 0.1, x, y, r);
    core.addColorStop(0, withAlpha(lit, Math.min(1, a * (0.5 + litMix))));
    core.addColorStop(0.45, withAlpha(body, a));
    core.addColorStop(1, withAlpha(body, 0));
    ctx.fillStyle = core;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    // Underside: a whisper of cloud shadow so the bank has weight.
    if (spec.shade > 0) {
      const under = ctx.createRadialGradient(x, y + r * 0.42, 0, x, y + r * 0.3, r * 0.85);
      under.addColorStop(0, withAlpha(shadow, a * spec.shade * 0.5));
      under.addColorStop(1, withAlpha(shadow, 0));
      ctx.fillStyle = under;
      ctx.fillRect(x - r, y, r * 2, r);
    }
  }

  // Edge fades (destination-in). Soft top AND soft bottom: the strip can ride
  // up with the swallow line without ever showing a straight edge — density
  // peaks around its lower-middle, where the dissolve line is carried.
  ctx.globalCompositeOperation = "destination-in";
  const v = ctx.createLinearGradient(0, 0, 0, STRIP_H);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.3, "rgba(0,0,0,0.5)");
  v.addColorStop(0.58, "rgba(0,0,0,0.9)");
  v.addColorStop(0.82, "rgba(0,0,0,0.5)");
  v.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);
  const h = ctx.createLinearGradient(0, 0, STRIP_W, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.09, "rgba(0,0,0,1)");
  h.addColorStop(0.91, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  return canvas.toDataURL("image/png");
}

function bakeMistSprites(light: LightModel): string[] {
  return LAYERS.map((spec) => bakeStrip(light, spec));
}

/* ── layer ───────────────────────────────────────────────────────────────── */

const LAYER_ALPHAS = [0.85, 0.6, 0.45];

export function HeroMist() {
  const step = useRelightStep();
  const [sprites, setSprites] = useState<string[] | null>(null);

  useEffect(() => {
    setSprites(bakeMistSprites(getLight(step / RELIGHT_STEPS_PER_HOUR)));
  }, [step]);

  return (
    <div className="hero-mist" aria-hidden="true">
      {LAYERS.map((spec, i) => (
        <i
          key={spec.seed}
          style={
            {
              "--mist-a": LAYER_ALPHAS[i],
              "--mist-sprite": sprites?.[i] ? `url(${sprites[i]})` : "none",
            } as CSSProperties
          }
        >
          <b />
        </i>
      ))}
    </div>
  );
}
