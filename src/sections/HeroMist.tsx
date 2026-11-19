"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { withAlpha } from "@/lib/color";
import { getLight, type LightModel } from "@/lib/lighting";
import { useSkyTime } from "@/lib/useTimeOfDay";

/*
 * HeroMist — rising horizon cloud-mist curtain (Hero → Selected Work handoff).
 *
 * Three volumetric cloud-mist strips are baked once per solar relight step from
 * the live sky palette's haze, sunlit cloud crown, and cloud shadow tokens.
 * At runtime, scroll progress (`--hero-push`, `--hero-swallow`, `--hero-handoff`)
 * lifts these layered banks upward from the meadow horizon as a soft cloud
 * curtain, seamlessly clearing into Selected Work with zero per-frame canvas work.
 */

const RELIGHT_STEPS_PER_HOUR = 6;
const RELIGHT_GAP_MS = 450;

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

const STRIP_W = 720;
const STRIP_H = 340;

interface LayerSpec {
  seed: number;
  puffs: number;
  rMin: number;
  rMax: number;
  yMin: number;
  yMax: number;
  alpha: number;
  lit: number;
  shade: number;
}

const LAYERS: LayerSpec[] = [
  // Dense low horizon bank — sweeps cleanly over the meadow line
  { seed: 11, puffs: 16, rMin: 102, rMax: 176, yMin: 0.44, yMax: 0.92, alpha: 0.34, lit: 0.68, shade: 0.28 },
  // Mid cumulus billow — gives volumetric cloud-curtain body
  { seed: 47, puffs: 24, rMin: 56, rMax: 112, yMin: 0.28, yMax: 0.86, alpha: 0.24, lit: 0.82, shade: 0.2 },
  // Upper sunlit wisps — dissipate effortlessly into Selected Work
  { seed: 83, puffs: 32, rMin: 28, rMax: 62, yMin: 0.12, yMax: 0.72, alpha: 0.16, lit: 0.92, shade: 0.08 },
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
    const y = STRIP_H * (spec.yMin + (1 - rnd() * rnd()) * (spec.yMax - spec.yMin));
    const x = STRIP_W * (-0.06 + rnd() * 1.12);
    const a = spec.alpha * (0.7 + rnd() * 0.6);
    const litMix = spec.lit * (0.6 + rnd() * 0.5);

    const core = ctx.createRadialGradient(x, y - r * 0.36, r * 0.08, x, y, r);
    core.addColorStop(0, withAlpha(lit, Math.min(1, a * (0.6 + litMix))));
    core.addColorStop(0.46, withAlpha(body, a * 0.95));
    core.addColorStop(1, withAlpha(body, 0));
    ctx.fillStyle = core;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    if (spec.shade > 0) {
      const under = ctx.createRadialGradient(x, y + r * 0.42, 0, x, y + r * 0.28, r * 0.88);
      under.addColorStop(0, withAlpha(shadow, a * spec.shade * 0.45));
      under.addColorStop(1, withAlpha(shadow, 0));
      ctx.fillStyle = under;
      ctx.fillRect(x - r, y, r * 2, r);
    }
  }

  ctx.globalCompositeOperation = "destination-in";
  const v = ctx.createLinearGradient(0, 0, 0, STRIP_H);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.24, "rgba(0,0,0,0.62)");
  v.addColorStop(0.56, "rgba(0,0,0,0.98)");
  v.addColorStop(0.84, "rgba(0,0,0,0.62)");
  v.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  const h = ctx.createLinearGradient(0, 0, STRIP_W, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.08, "rgba(0,0,0,1)");
  h.addColorStop(0.92, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  return canvas.toDataURL("image/png");
}

function bakeMistSprites(light: LightModel): string[] {
  return LAYERS.map((spec) => bakeStrip(light, spec));
}

const LAYER_ALPHAS = [0.96, 0.78, 0.56];

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
