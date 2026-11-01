"use client";

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { BloomingFlower, BluebellPass, MoonlitPetals, MoonpetalMeadow } from "@/components/originkit";
import type { BluebellPassProps } from "@/components/originkit/BluebellPass";
import type { MoonpetalAdvanced } from "@/components/originkit/MoonpetalMeadow";
import { ROCK_SHAPES } from "@/components/originkit/Aetherglint";
import { clamp, mix, oklch, tint, type OKLCH } from "@/lib/color";
import { getLight } from "@/lib/lighting";
import { useSkyTime } from "@/lib/useTimeOfDay";

/*
 * GardenField — the home hero's landscape: an open Bluebell meadow running to
 * a long horizon under the persistent sky, a low Aetherglint-style rise behind
 * it, the portrait seated in the field, a Moonpetal foreground and a Moonlit
 * Petals canopy reaching in from the upper right.
 *
 * Lighting comes from the shared 24-hour light model. The CSS layers read the
 * `--sky-*` / `--daylight` variables continuously; Bluebell bakes its ground,
 * so it is re-lit in steps (see useRelightStep).
 */

/** Bluebell `horizonY`: where the horizon sits in its reference frame (%). */
const HORIZON_Y = 56;

/* ── field relighting ───────────────────────────────────────────────────── */

/** Re-light the canvas every 20 sky-minutes… */
const RELIGHT_STEPS_PER_HOUR = 3;
/** …and at most every 1.5 s while the clock is scrubbed or played. */
const RELIGHT_GAP_MS = 1500;

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

interface FieldPalette {
  flower: string;
  glow: number;
  far: string;
  mid: string;
  near: string;
  grass: string;
  grassLit: string;
  stem: string;
  haze: string;
}

const lch = (l: number, c: number, h: number): OKLCH => ({ l, c, h });

const FIELD_NIGHT = { far: lch(0.27, 0.075, 258), mid: lch(0.2, 0.045, 205), near: lch(0.1, 0.025, 228) };
const FIELD_DAY = { far: lch(0.6, 0.065, 150), mid: lch(0.43, 0.095, 146), near: lch(0.23, 0.06, 152) };
const FIELD_GOLD = { far: lch(0.57, 0.09, 72), mid: lch(0.36, 0.085, 112), near: lch(0.15, 0.04, 140) };
const FIELD_DUSK = lch(0.31, 0.07, 292);

function fieldPalette(t: number): FieldPalette {
  const light = getLight(t);
  const { daylight: d, golden: g, twilight: tw } = light;
  const ground = (k: keyof typeof FIELD_DAY) =>
    tint(tint(mix(FIELD_NIGHT[k], FIELD_DAY[k], d), FIELD_GOLD[k], g * 0.65), FIELD_DUSK, tw * 0.4);
  // Atmospheric perspective: the far field melts into the horizon haze.
  const far = tint(ground("far"), light.stops.haze, 0.22 * d + 0.18 * g + 0.1 * tw);
  // Electric bluebell at night, violet-blue by day, warmer in golden light.
  const flower = tint(mix(lch(0.58, 0.2, 262), lch(0.64, 0.16, 278), d), lch(0.62, 0.15, 305), g * 0.5);

  return {
    flower: oklch(flower),
    glow: Math.round(clamp(95 - 60 * d + 10 * g, 0, 100) / 5) * 5,
    far: oklch(far),
    mid: oklch(ground("mid")),
    near: oklch(ground("near")),
    grass: oklch(tint(mix(lch(0.17, 0.04, 168), lch(0.33, 0.075, 146), d), lch(0.3, 0.06, 110), g * 0.5)),
    grassLit: oklch(mix(lch(0.55, 0.1, 165), lch(0.72, 0.14, 136), d)),
    stem: oklch(mix(lch(0.38, 0.08, 160), lch(0.5, 0.1, 146), d)),
    haze: oklch(mix(lch(0.68, 0.14, 268), light.stops.haze, d)),
  };
}

/* ── frame: Bluebell's horizon on this viewport ─────────────────────────── */

interface GardenFrame {
  zoom: number;
  /** Horizon line as a fraction of the stage height. */
  horizon: number;
}

function frameFor(W: number, H: number): GardenFrame {
  const aspect = W / Math.max(1, H);
  // Bluebell fits a 3:2 frame, so tall screens get a closer field.
  const zoom = aspect < 0.8 ? 190 : aspect < 1.2 ? 140 : 100;
  const S = Math.min(H, W / 1.5) * (zoom / 100);
  return { zoom, horizon: (H / 2 + (HORIZON_Y / 100 - 0.5) * S) / Math.max(1, H) };
}

function useGardenFrame(ref: RefObject<HTMLDivElement | null>): GardenFrame {
  const [frame, setFrame] = useState<GardenFrame>(() => frameFor(window.innerWidth, window.innerHeight));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientWidth || !el.clientHeight) return;
      const next = frameFor(el.clientWidth, el.clientHeight);
      setFrame((f) => (f.zoom === next.zoom && Math.abs(f.horizon - next.horizon) < 0.002 ? f : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [ref]);

  return frame;
}

/* ── the rise: low swells + faceted rocks after Aetherglint ─────────────── */

const VB_W = 1600;
const VB_H = 220;
const bump = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));
/** Near swell — a long, low rise lifting right of centre. Horizon ≈ y 190. */
const nearY = (x: number) => 206 - 82 * bump(x, 1210, 330) - 30 * bump(x, 860, 200) - 14 * bump(x, 380, 260);
/** Far swell — paler shoulders out at the edges. */
const farY = (x: number) => 200 - 34 * bump(x, 470, 300) - 46 * bump(x, 1560, 380) - 18 * bump(x, 900, 220);

function ridgePath(y: (x: number) => number) {
  let d = `M0 ${VB_H}`;
  for (let x = 0; x <= VB_W; x += 16) d += ` L${x} ${y(x).toFixed(1)}`;
  return `${d} L${VB_W} ${VB_H} Z`;
}

function prng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Facet {
  points: string;
  tone: number;
}

/** Aetherglint's rock bake — jittered outline, inner ring drawn to the peak, lit from the upper right. */
function facetRock(shape: string, x: number, y: number, w: number, h: number, seed: number): Facet[] {
  const rnd = prng(seed);
  const { pts: base, peak: C } = ROCK_SHAPES[shape];
  const pts: number[][] = [];
  for (let i = 0; i < base.length; i++) {
    const a = base[i];
    const b = base[(i + 1) % base.length];
    pts.push(a);
    if (i < base.length - 1) {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      const j = (rnd() - 0.5) * 0.08;
      pts.push([(a[0] + b[0]) / 2 - (dy / l) * j, (a[1] + b[1]) / 2 + (dx / l) * j]);
    }
  }
  const Q = pts.map((p) => {
    const k = 0.45 + (rnd() - 0.5) * 0.2;
    return [p[0] + (C[0] - p[0]) * k + (rnd() - 0.5) * 0.04, p[1] + (C[1] - p[1]) * k + (rnd() - 0.5) * 0.04];
  });
  const lx = 0.75 / Math.hypot(0.75, 0.66);
  const ly = -0.66 / Math.hypot(0.75, 0.66);
  const P = (p: number[]) => `${(x + p[0] * w).toFixed(1)},${(y + p[1] * h).toFixed(1)}`;
  const out: Facet[] = [];
  const tri = (a: number[], b: number[], c: number[], inner: boolean) => {
    const gx = ((a[0] + b[0] + c[0]) / 3 - C[0]) * w * 1.5;
    const gy = ((a[1] + b[1] + c[1]) / 3 - C[1]) * h;
    const gl = Math.hypot(gx, gy) || 1;
    const facing = ((gx / gl) * lx + (gy / gl) * ly) * (inner ? 0.5 : 1);
    const shade = clamp(0.5 + 0.45 * facing + (rnd() - 0.5) * 0.28, 0.04, 1);
    out.push({ points: `${P(a)} ${P(b)} ${P(c)}`, tone: Math.min(4, Math.floor(shade * 5)) });
  };
  for (let i = 0; i < pts.length; i++) {
    const i2 = (i + 1) % pts.length;
    tri(pts[i], pts[i2], Q[i2], false);
    tri(pts[i], Q[i2], Q[i], false);
    tri(C, Q[i], Q[i2], true);
  }
  return out;
}

const ROCKS = [
  { shape: "slab", x: 742, w: 78, h: 30 },
  { shape: "boulder", x: 812, w: 112, h: 62 },
  { shape: "small", x: 884, w: 44, h: 24 },
  { shape: "wedge", x: 1488, w: 64, h: 40 },
  { shape: "small", x: 1540, w: 34, h: 18 },
];

const NEAR_PATH = ridgePath(nearY);
const FAR_PATH = ridgePath(farY);
const FACETS = ROCKS.flatMap((r, i) => {
  const baseY = nearY(r.x) + r.h * 0.14; // sunk a little into the swell
  return facetRock(r.shape, r.x - r.w / 2, baseY - r.h, r.w, r.h, 11 + i * 7);
});

function GardenRise() {
  return (
    <div className="garden-rise" aria-hidden="true">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="garden-rise-near" x1="0" y1="0" x2="0" y2="1">
            <stop className="garden-rise-near-top" offset="0.35" />
            <stop className="garden-rise-near-base" offset="1" />
          </linearGradient>
        </defs>
        <path className="garden-rise-far" d={FAR_PATH} />
        <path d={NEAR_PATH} fill="url(#garden-rise-near)" />
        <g className="garden-rocks">
          {FACETS.map((f, i) => (
            <polygon key={i} points={f.points} className={`t${f.tone}`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ── flora settings ─────────────────────────────────────────────────────── */

const FIELD_STYLE: CSSProperties = { position: "absolute", inset: 0 };

/** Front-facing anemones, daisies and florets tuned to the bluebell palette. */
const MEADOW: Partial<MoonpetalAdvanced> = {
  seed: 11,
  packing: 70,
  indigo: "#5267EE",
  violet: "#977BE8",
  lilac: "#C9C4F1",
  mauve: "#7A68B5",
  dusk: "#8EA0D6",
  centerColor: "#E9C66A",
  inkColor: "#0F1530",
  daisies: 5,
  daisyColor: "#F2F0FA",
  clusters: 18,
  floretColor: "#3D62F4",
  leaves: 150,
  leafColor: "#1C4A44",
  undergrowth: 40,
  dewDots: 40,
};

const CANOPY_ADVANCED = {
  flowers: 5600,
  twigs: 22,
  crownReach: 94,
  nearShare: 12,
  dofBlur: 2,
  branchColor: "#2B2430",
  hazeOpacity: 0,
  grain: 0,
  vignette: 0,
  bokehOpacity: 0,
};

const CANOPY_STYLE: CSSProperties = { minWidth: 0, minHeight: 0 };

/* ── scene ──────────────────────────────────────────────────────────────── */

const GardenScene = memo(function GardenScene({ pal, frame }: { pal: FieldPalette; frame: GardenFrame }) {
  const field: BluebellPassProps = {
    landscape: "open",
    sky: false,
    background: "transparent",
    sceneScale: frame.zoom,
    stars: 0,
    flowerColor: pal.flower,
    glow: pal.glow,
    speed: 64,
    sway: { lean: "toward", reach: 6, bounce: 5 },
    advanced: {
      horizonY: HORIZON_Y,
      vignette: 0,
      grain: 0,
      pebbleCount: 0,
      hazeOpacity: 55,
      hazeColor: pal.haze,
      grassColor: pal.grass,
      grassLit: pal.grassLit,
      stemColor: pal.stem,
      fieldFar: pal.far,
      fieldMid: pal.mid,
      fieldNear: pal.near,
      lightRadius: 18,
      lightBoost: 30,
    },
    style: FIELD_STYLE,
  };

  return (
    <div className="garden" style={{ "--horizon": `${(frame.horizon * 100).toFixed(2)}%` } as CSSProperties}>
      <GardenRise />

      <div className="garden-field" aria-hidden="true">
        <BluebellPass {...field} />
      </div>

      <div className="garden-haze" aria-hidden="true" />
      <div className="garden-sun" aria-hidden="true" />

      <figure className="garden-portrait">
        <span className="garden-portrait-shadow" aria-hidden="true" />
        <img
          src="/portrait-cutout.png"
          alt="Rudraksh Singh at his desk with a laptop and a reading lamp"
          width={1024}
          height={571}
          decoding="async"
          draggable={false}
        />
      </figure>

      <div className="garden-meadow" aria-hidden="true">
        <MoonpetalMeadow advanced={MEADOW} />
      </div>

      <div className="garden-bloom" aria-hidden="true">
        <BloomingFlower
          background="transparent"
          baseColor="#8E9BFF"
          stemColor="#2C6B57"
          accentColor="#F2D38B"
          accentMix={70}
          density={60}
          dotSize={9}
          speed={40}
          closed={30}
        />
      </div>

      <div className="garden-canopy" aria-hidden="true">
        <MoonlitPetals
          direction="right"
          background="transparent"
          blossomColor="#E6CDF5"
          petals={64}
          wind={24}
          speed={70}
          glow={55}
          advanced={CANOPY_ADVANCED}
          style={CANOPY_STYLE}
        />
      </div>

      <div className="garden-grade" aria-hidden="true" />
    </div>
  );
});

export const GardenField = memo(function GardenField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frame = useGardenFrame(rootRef);
  const step = useRelightStep();
  const pal = useMemo(() => fieldPalette(step / RELIGHT_STEPS_PER_HOUR), [step]);

  return (
    <div ref={rootRef} className="garden-frame">
      <GardenScene pal={pal} frame={frame} />
    </div>
  );
});
