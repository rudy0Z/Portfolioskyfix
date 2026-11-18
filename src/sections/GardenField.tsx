"use client";

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import BluebellPass, { type BluebellPassProps } from "@/components/originkit/BluebellPass";
import { clamp, mix, oklch, tint, type OKLCH } from "@/lib/color";
import { getLight } from "@/lib/lighting";
import { useSkyTime } from "@/lib/useTimeOfDay";

/*
 * GardenField — the home hero's landscape. Everything lives in one canvas: an
 * open Bluebell meadow running to a long horizon under the persistent sky,
 * four botanical species on wind-blown stems, the portrait seated into the
 * field at midground depth (near grass and flowers overlap the desk legs),
 * and a blossom canopy hanging over the desk from the upper right.
 *
 * Lighting comes from the shared 24-hour light model. The CSS layers read the
 * `--sky-*` / `--daylight` variables continuously; Bluebell bakes its ground,
 * sprites and desk, so it is re-lit when the palette has visibly moved (see
 * useRelight) — the same moments the sky moves, not on a fixed cadence.
 */

/** Bluebell `horizonY`: where the horizon sits in its reference frame (%). */
const HORIZON_Y = 56;

/* ── field relighting ───────────────────────────────────────────────────── */

/** Re-light when the light model has moved more than this since the last bake
 *  (max channel delta on the palette's OKLCH stops, hue scaled to 0–1, plus
 *  the daylight scalars) — hero plan §5.1. A step this small is below what the
 *  eye catches between two palettes, so the field moves exactly when the sky
 *  visibly moves instead of on a fixed 10-sky-minute cadence. */
const RELIGHT_EPSILON = 0.015;
/** …and at most every 450 ms, so a dial scrub steps at the bake budget rather
    than per frame. Slow drift fires the moment the epsilon is crossed. */
const RELIGHT_GAP_MS = 450;

/** Compact signature of everything the field bake consumes from the light
 *  model: the raw OKLCH palette stops (l, c, h/360) plus the daylight mix
 *  scalars and the sun screen position the shafts/backlit aim at. */
function lightSignature(t: number): Float64Array {
  const L = getLight(t);
  const s = L.stops;
  const ch = (o: OKLCH) => [o.l, o.c, o.h / 360];
  return new Float64Array([
    ...ch(s.zenith), ...ch(s.mid), ...ch(s.horizon), ...ch(s.haze), ...ch(s.sunGlow),
    ...ch(s.cloudShadow), ...ch(s.cloudLit), ...ch(s.terrain),
    L.daylight, L.golden, L.twilight, L.shafts,
    L.sun.x, L.sun.y, L.sun.opacity,
  ]);
}

function maxChannelDelta(a: Float64Array, b: Float64Array): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    const v = Math.abs(a[i] - b[i]);
    if (v > d) d = v;
  }
  return d;
}

function useRelight(t: number): number {
  const [applied, setApplied] = useState(t);
  const appliedSig = useRef<Float64Array | null>(null);
  const lastRef = useRef(0);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (appliedSig.current === null) {
      // First bake lands wherever the clock starts.
      appliedSig.current = lightSignature(t);
      lastRef.current = performance.now();
      setApplied(t);
      return;
    }
    const delta = maxChannelDelta(lightSignature(t), appliedSig.current);
    if (delta <= RELIGHT_EPSILON) return; // the sky hasn't visibly moved yet
    const wait = Math.max(0, RELIGHT_GAP_MS - (performance.now() - lastRef.current));
    const id = window.setTimeout(() => {
      lastRef.current = performance.now();
      appliedSig.current = lightSignature(tRef.current);
      setApplied(tRef.current);
      // QA probe (like __bbPerf / __sky): when the field last baked and how
      // many epsilon-triggered relights have fired this session.
      const w = window as unknown as { __relight?: { t: number; fires: number } };
      w.__relight = { t: tRef.current, fires: (w.__relight?.fires ?? 0) + 1 };
    }, wait);
    return () => window.clearTimeout(id);
  }, [t]);

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
  /** Canvas relight filter for the desk cut-out bake. */
  deskFilter: string;
  /** Bottom-up night-cast strength for the desk bake. */
  deskShade: number;
  /** Golden backlit glow + night color grade, 0-100. */
  golden: number;
  night: number;
  /** Day pollen motes / night fireflies, 0-100. */
  motes: number;
  fireflies: number;
  /** Sun screen position + strength for the light shafts. */
  sunFx: { x: number; y: number; s: number };
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
    // The portrait's old CSS relight, ported to the canvas bake.
    deskFilter: `brightness(${(0.6 + d * 0.4 + g * 0.06).toFixed(3)}) saturate(${(0.74 + d * 0.28).toFixed(3)}) contrast(1.03)`,
    deskShade: clamp(0.5 - d * 0.3, 0, 1),
    golden: Math.round(clamp(g * 1.25) * 100),
    night: Math.round(clamp(1 - d * 3.2) * 100),
    motes: Math.round(clamp(0.2 + d * 0.8) * 100),
    fireflies: Math.round(clamp(1 - d * 1.5) * 100),
    // The sun disc's viewport position — same fraction the sky's Celestial
    // layer uses, so the shafts radiate from the real disc.
    sunFx: {
      x: clamp(light.sun.x, 0.04, 0.96),
      y: clamp(light.sun.y, 0.02, 0.6),
      s: clamp(d * 0.75 + g * 1.1),
    },
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

/* ── flora settings ─────────────────────────────────────────────────────── */

const FIELD_STYLE: CSSProperties = { position: "absolute", inset: 0 };

/*
 * The desk cut-out, seated on the midground swell. All coordinates are
 * editable here:
 *   fx — horizontal anchor as a screen fraction (0 = left edge, 1 = right;
 *        0.6 seats Rudraksh at ~60% from the left, balancing the headline).
 *   z  — depth into the field from the horizon edge, world units (bigger =
 *        nearer the camera; grass and flowers beyond this depth overlap the
 *        desk legs and Crocs).
 *   h  — desk image height in world units (0.25 ≈ 25vh at desktop zoom,
 *        ~57% of the old oversized foreground portrait).
 */
const DESK = {
  src: "/portrait-cutout.png",
  fx: 0.6,
  z: 0.08,
  h: 0.25,
};

/* ── scene ──────────────────────────────────────────────────────────────── */

/** `?lite` — deterministic A/B switch: disables every per-frame effect added
 *  in the life & light pass (shafts, motes, fireflies, backlit, gust) so a
 *  smoothness regression can be bisected in one reload. The named value
 *  `?lite=exit` is the exit-choreography bisect (hero plan §6) and leaves the
 *  field effects ON, so it isolates the exit rework alone. */
const LITE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("lite") !== "exit" &&
  new URLSearchParams(window.location.search).has("lite");

const GardenScene = memo(function GardenScene({ pal, frame }: { pal: FieldPalette; frame: GardenFrame }) {
  // Tall phone screens: a quieter field — fewer blooms and blades, stronger
  // defocus so the foreground melts back and the desk stays the subject.
  const mobile = frame.zoom >= 190;
  const field: BluebellPassProps = {
    landscape: "open",
    sky: false,
    background: "transparent",
    sceneScale: frame.zoom,
    stars: 0,
    flowerColor: pal.flower,
    glow: pal.glow,
    speed: 64,
    density: mobile ? 70 : 100,
    sway: LITE ? { lean: "toward", reach: 6, bounce: 5 } : { lean: "toward", reach: 8, bounce: 6 },
    desk: { ...DESK, filter: pal.deskFilter, shade: pal.deskShade },
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
      // Canopy off: the crowned branch never earned its keep — it comes back
      // only as a proper planted tree, not a corner wedge.
      canopy: 0,
      motes: LITE ? 0 : pal.motes,
      fireflies: LITE ? 0 : pal.fireflies,
      golden: LITE ? 0 : pal.golden,
      night: pal.night,
      sunFx: LITE ? { x: 0, y: 0, s: 0 } : pal.sunFx,
      wind: LITE ? 35 : mobile ? 40 : 48,
      waveSpread: LITE ? 60 : 72,
      swayAngle: LITE ? 3 : 4.5,
      nearSway: LITE ? 2 : 3,
      ...(mobile
        ? {
            flowerCount: 250,
            grassCount: 850,
            carpetCount: 2000,
            defocus: 11,
            glowSize: 150,
          }
        : {}),
    },
    style: FIELD_STYLE,
  };

  return (
    <div className="garden" style={{ "--horizon": `${(frame.horizon * 100).toFixed(2)}%` } as CSSProperties}>
      <span className="sr-only">
        Rudraksh Singh at his desk with a laptop and a reading lamp, seated in a wildflower meadow under a
        blossom canopy.
      </span>

      <div className="garden-field" aria-hidden="true">
        <BluebellPass {...field} />
      </div>

      <div className="garden-haze" aria-hidden="true" />
      <div className="garden-sun" aria-hidden="true" />

      <div className="garden-grade" aria-hidden="true" />
    </div>
  );
});

export const GardenField = memo(function GardenField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frame = useGardenFrame(rootRef);
  const t = useSkyTime();
  const relit = useRelight(t);
  const pal = useMemo(() => fieldPalette(relit), [relit]);

  return (
    <div ref={rootRef} className="garden-frame">
      <GardenScene pal={pal} frame={frame} />
    </div>
  );
});
