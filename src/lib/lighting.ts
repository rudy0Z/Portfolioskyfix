/**
 * The light model — one derivation from one number.
 *
 * `getLight(t)` turns a fractional hour into every value the scene needs:
 * disc positions, star opacity, the resolved palette (hex, gamut-mapped), and
 * cloud shading split into body / rim / shadow so clouds can be lit by the same
 * sun as the terrain, the island and the glass cards.
 *
 * Components never compute color themselves — they read this model. That is
 * what keeps the whole page feeling lit by a single sky.
 */

import { clamp, lerp, tint, withAlpha, type OKLCH } from "./color";
import {
  buildStars,
  goldenWeight,
  moonAt,
  moonIllumination,
  moonPhase,
  starVisibility,
  sunAt,
  twilightWeight,
  type Star,
} from "./celestial";
import { paletteAt, type SkyStop } from "./skyPalette";
import { phaseAt, type TimeOfDay } from "./timeOfDay";
import { oklch } from "./color";

export interface ResolvedPalette {
  zenith: string;
  mid: string;
  horizon: string;
  haze: string;
  sunCore: string;
  sunGlow: string;
  cloudShadow: string;
  cloudLit: string;
  cloudRim: string;
  terrain: string;
  ink: string;
}

export interface LightModel {
  time: number;
  phase: TimeOfDay;
  /** Raw OKLCH stops — for anything that needs to mix further. */
  stops: SkyStop;
  /** Resolved CSS colors. */
  palette: ResolvedPalette;

  sun: ReturnType<typeof sunAt>;
  moon: ReturnType<typeof moonAt>;
  moonPhase: number;
  moonIllumination: number;

  /** 0..1 — how much daylight there is. */
  daylight: number;
  /** 0..1 — golden-hour influence (rim lights, warm shadow bounce). */
  golden: number;
  /** 0..1 — twilight influence (sky-side glow). */
  twilight: number;
  /** 0..1 — stars visible. */
  starOpacity: number;

  /** Cloud model — derived once, shared by all three sky variants. */
  cloud: {
    /** Body fill where the light does not reach. */
    shadow: string;
    /** Body fill lit by the key light. */
    lit: string;
    /** Thin, hot edge facing the sun. */
    rim: string;
    /** Alpha weight of the rim. */
    rimStrength: number;
    /** Overall opacity — clouds dissolve into night. */
    opacity: number;
    /** Direction of the key light in screen space, -1 (left) … 1 (right). */
    keyX: number;
    /** Height of the key light: 1 at zenith, 0 at horizon, negative under. */
    keyY: number;
  };

  /** How strongly terrain/illustration should be graded toward the sky. */
  grade: { tintColor: string; tintAmount: number; shadowColor: string; shadowAmount: number };

  stars: Star[];
}

const STARS = buildStars();

export function getLight(t: number): LightModel {
  const stops = paletteAt(t);
  const sun = sunAt(t);
  const moon = moonAt(t);
  const phase = moonPhaseOfDay(t);
  const illum = moonIllumination(phase);

  const daylight = clamp(sun.altitude * 1.4);
  const golden = goldenWeight(sun.altitude);
  const twilight = twilightWeight(sun.altitude);
  const night = 1 - clamp((sun.altitude + 0.1) * 2.2);
  const starOpacity = starVisibility(sun.altitude);

  const palette: ResolvedPalette = {
    zenith: oklch(stops.zenith),
    mid: oklch(stops.mid),
    horizon: oklch(stops.horizon),
    haze: oklch(stops.haze),
    sunCore: oklch(stops.sunCore),
    sunGlow: oklch(stops.sunGlow),
    cloudShadow: oklch(stops.cloudShadow),
    cloudLit: oklch(stops.cloudLit),
    cloudRim: oklch(stops.cloudRim),
    terrain: oklch(stops.terrain),
    ink: oklch(stops.ink),
  };

  /*
   * Cloud lighting. The key light comes from the sun by day and from the moon
   * by night, so the same function lights both — only intensity and hue change.
   * `moonLight` is a cool silver, deliberately desaturated.
   */
  const moonLight: OKLCH = { l: 0.82, c: 0.02, h: 240 };
  const keyBody =
    sun.altitude > -0.05
      ? tint(stops.cloudLit, stops.sunGlow, golden * 0.28)
      : tint(stops.cloudLit, moonLight, 0.55 * (0.35 + illum));

  const rimBase = sun.altitude > -0.05
    ? tint(stops.cloudRim, stops.sunGlow, golden * 0.45)
    : tint(stops.cloudRim, moonLight, 0.4);

  const cloud = {
    shadow: oklch(stops.cloudShadow),
    lit: oklch(keyBody),
    rim: oklch(rimBase),
    rimStrength: clamp(0.18 + golden * 0.7 + night * 0.22 * illum, 0, 1),
    opacity: clamp(0.34 + daylight * 0.62 - night * 0.32 + twilight * 0.12, 0.18, 1),
    keyX: sun.altitude > -0.05 ? sun.x * 2 - 1 : moon.x * 2 - 1,
    keyY: sun.altitude > -0.05 ? sun.altitude : -moon.altitude,
  };

  const grade = {
    tintColor: palette.haze,
    tintAmount: clamp(0.06 + golden * 0.16 + twilight * 0.12 + night * 0.34, 0, 0.6),
    shadowColor: palette.zenith,
    shadowAmount: clamp(0.05 + night * 0.25 + (1 - daylight) * 0.12, 0, 0.5),
  };

  return {
    time: t,
    phase: phaseAt(t),
    stops,
    palette,
    sun,
    moon,
    moonPhase: phase,
    moonIllumination: illum,
    daylight,
    golden,
    twilight,
    starOpacity,
    cloud,
    grade,
    stars: STARS,
  };
}

/**
 * Moon phase advances a little across the day so a long scrub feels alive.
 * Uses today's lunar phase as the base.
 */
function moonPhaseOfDay(t: number) {
  const base = moonPhase();
  return (base + t / 24 / 2953) % 1; // 1/2953 ≈ a lunar month spread over 24h is imperceptible
}

/* ── CSS custom properties ──────────────────────────────────────────────── */

/**
 * Write the whole model into CSS variables on <html>. Components then style
 * themselves with `var(--sky-zenith)` etc. This is the seam that lets plain
 * CSS/SVG/Tailwind inherit dynamic lighting with zero re-renders.
 */
export function applyLight(light: LightModel) {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  const p = light.palette;
  const set = (k: string, v: string) => root.setProperty(k, v);

  set("--sky-zenith", p.zenith);
  set("--sky-mid", p.mid);
  set("--sky-horizon", p.horizon);
  set("--sky-haze", p.haze);
  set("--sky-sun-core", p.sunCore);
  set("--sky-sun-glow", p.sunGlow);
  set("--sky-cloud-shadow", p.cloudShadow);
  set("--sky-cloud-lit", p.cloudLit);
  set("--sky-cloud-rim", p.cloudRim);
  set("--sky-terrain", p.terrain);
  set("--sky-ink", p.ink);

  set("--sun-x", `${(light.sun.x * 100).toFixed(2)}%`);
  set("--sun-y", `${(light.sun.y * 100).toFixed(2)}%`);
  set("--sun-op", light.sun.opacity.toFixed(3));
  set("--moon-x", `${(light.moon.x * 100).toFixed(2)}%`);
  set("--moon-y", `${(light.moon.y * 100).toFixed(2)}%`);
  set("--moon-op", light.moon.opacity.toFixed(3));
  set("--moon-illum", light.moonIllumination.toFixed(3));
  set("--moon-phase", light.moonPhase.toFixed(4));

  set("--star-opacity", light.starOpacity.toFixed(3));
  set("--daylight", light.daylight.toFixed(3));
  set("--golden", light.golden.toFixed(3));
  set("--twilight", light.twilight.toFixed(3));

  set("--cloud-key-x", light.cloud.keyX.toFixed(3));
  set("--cloud-key-y", light.cloud.keyY.toFixed(3));
  set("--cloud-rim-strength", light.cloud.rimStrength.toFixed(3));
  set("--cloud-opacity", light.cloud.opacity.toFixed(3));

  /* Pre-mixed gradient stops. Chrome mis-composites large `color-mix()` values
     inside layered `background-image`s (and inside blend modes), so every
     gradient stop is delivered as a plain rgba string instead. */
  set("--sky-zenith-a0", withAlpha(p.zenith, 1));
  set("--sky-zenith-a55", withAlpha(p.zenith, 0.55));
  set("--sky-mid-a62", withAlpha(p.mid, 0.62));
  set("--sky-horizon-a70", withAlpha(p.horizon, 0.7));
  set("--sky-horizon-a20", withAlpha(p.horizon, 0.2));
  set("--sky-haze-a55", withAlpha(p.haze, 0.55));
  set("--sky-haze-a12", withAlpha(p.haze, 0.12));
  set("--sun-glow-a0", withAlpha(p.sunGlow, 0.9));
  set("--sun-glow-a55", withAlpha(p.sunGlow, 0.55));
  set("--sun-glow-a0b", withAlpha(p.sunGlow, 0));
  set("--moon-glow-a0", withAlpha("#cfe0ff", 0.5));
  set("--moon-glow-a0b", withAlpha("#cfe0ff", 0));
  set("--cloud-shadow-a32", withAlpha(p.cloudShadow, 0.32));
  /* ── atmospheric layers (volumetric sky) ───────────────────────────────
     Cloud tops catch the key light, bases sit in their own shadow. Horizon
     glow is the sun's warm scatter, strongest at the land line. */
  set("--cloud-top", withAlpha(p.cloudLit, 0.95));
  set("--cloud-mid", withAlpha(p.cloudLit, 0.78));
  set("--cloud-base", withAlpha(p.cloudShadow, 0.85));
  set(
    "--cloud-shadow-fill",
    withAlpha(oklch(tint(light.stops.cloudShadow, light.stops.zenith, 0.35)), 0.55),
  );
  set("--glow-core", withAlpha(p.sunGlow, light.sun.altitude > -0.1 ? 0.72 : 0.28));
  set("--glow-mid", withAlpha(p.horizon, 0.3));
  set("--glow-out", withAlpha(p.horizon, 0));
  set("--haze-core", withAlpha(p.haze, 0.85));
  set("--haze-mid", withAlpha(p.haze, 0.4));
  set("--haze-out", withAlpha(p.haze, 0));

  set("--grade-tint", withAlpha(p.haze, light.grade.tintAmount));
  set("--grade-shadow", withAlpha(p.zenith, light.grade.shadowAmount));
  set("--grade-ink", p.ink);

  set("--sky-hour", String(light.time));
  set("--sky-clock", clockText(light.time));
}

function clockText(t: number) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m === 60 ? 0 : m).padStart(2, "0")}`;
}

/** Interpolate between two light-derived numbers with a scroll driver. */
export const mixNum = lerp;
