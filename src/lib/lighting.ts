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

import { clamp, lerp, smoothstep, tint, withAlpha, type OKLCH } from "./color";
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
  /**
   * 0..1 — god-ray strength: openings in the cloud deck light the air only
   * while the sun is low (golden/twilight) and up (night gate). Exported to
   * CSS as `--sky-shafts` and consumed by the WebGL composite and the garden's
   * haze glow, so sky shafts and field light breathe together.
   */
  shafts: number;
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
  // Shafts need a low sun (the high-noon beam is invisible in haze) and the
  // night gate kills them after sunset. User directive: golden-hour window
  // only (17:00–19:00 with soft edges), strength capped at 0.3 — they read as
  // a glitch through content pages at full strength.
  const goldenWindow = smoothstep(16.4, 17.1, t) * (1 - smoothstep(18.9, 19.5, t));
  const shafts = clamp(
    smoothstep(-0.02, 0.1, sun.altitude) *
      clamp(golden * 1.05 + twilight * 0.45, 0, 1) *
      0.3 *
      goldenWindow,
  );

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
    shafts,
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
  set("--sky-shafts", light.shafts.toFixed(3));

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

  const ui = computeUiPalette(light.time);

  set("--ui-day-mix", ui.dayMix.toFixed(4));
  set("--ui-nav-bg", ui.navBg);
  set("--ui-nav-bg-scrolled", ui.navBgScrolled);
  set("--ui-nav-border", ui.navBorder);
  set("--ui-nav-inset", ui.navInset);

  set("--ui-card-bg", ui.cardBg);
  set("--ui-card-border", ui.cardBorder);
  set("--ui-card-inset", ui.cardInset);
  set("--ui-surface-canvas", ui.surfaceCanvas);

  set("--ui-dial-top", ui.dialTop);
  set("--ui-dial-bot", ui.dialBot);
  set("--ui-dial-rim-top", ui.dialRimTop);
  set("--ui-dial-rim-mid", ui.dialRimMid);

  set("--ui-ink", ui.ink);
  set("--ui-ink-82", ui.ink82);
  set("--ui-ink-66", ui.ink66);
  set("--ui-ink-52", ui.ink52);
  set("--ui-hairline", ui.hairline);

  set("--ui-pill-bg", ui.pillBg);
  set("--ui-pill-bg-active", ui.pillBgActive);
  set("--ui-pill-border", ui.pillBorder);

  set("--ui-cta-bg", ui.ctaBg);
  set("--ui-cta-ink", ui.ctaInk);
  set("--ui-ghost-bg", ui.ghostBg);
  set("--ui-ghost-border", ui.ghostBorder);
  set("--ui-hint-bg", ui.hintBg);

  set("--ui-veil-core", ui.veilCore);
  set("--ui-veil-mid", ui.veilMid);
  set("--ui-hero-shadow", ui.heroShadow);
  set("--ui-flora-stem", ui.floraStem);

  const nextSkyTheme = ui.isLight ? "light" : "dark";
  if (document.documentElement.dataset.skyTheme !== nextSkyTheme) {
    document.documentElement.dataset.skyTheme = nextSkyTheme;
  }
}

export interface UiAtmosphericPalette {
  isLight: boolean;
  dayMix: number;
  cardRgb: [number, number, number];
  inkRgb: [number, number, number];
  ctaBgRgb: [number, number, number];
  ctaInkRgb: [number, number, number];
  navBg: string;
  navBgScrolled: string;
  navBorder: string;
  navInset: string;
  cardBg: string;
  cardBorder: string;
  cardInset: string;
  surfaceCanvas: string;
  dialTop: string;
  dialBot: string;
  dialRimTop: string;
  dialRimMid: string;
  ink: string;
  ink82: string;
  ink66: string;
  ink52: string;
  hairline: string;
  pillBg: string;
  pillBgActive: string;
  pillBorder: string;
  ctaBg: string;
  ctaInk: string;
  ghostBg: string;
  ghostBorder: string;
  hintBg: string;
  veilCore: string;
  veilMid: string;
  heroShadow: string;
  floraStem: string;
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  k: number,
): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], k)),
    Math.round(lerp(a[1], b[1], k)),
    Math.round(lerp(a[2], b[2], k)),
  ];
}

function rgbaOf(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a.toFixed(3)})`;
}

/**
 * Dual-band high-contrast atmospheric UI palette:
 * - Daylight band (06:10 → 18:05): smoothly warms from crisp alabaster at noon
 *   into sunlit golden ivory near dawn/sunset while keeping deep espresso/obsidian ink.
 * - Night/Twilight band (18:05 → 06:10): smoothly shifts from velvet twilight
 *   plum-indigo at dusk/pre-dawn into deep midnight obsidian with luminous cream ink.
 * Crossing the twilight seam triggers a silky 820ms CSS transition (via @property
 * & explicit color/background transitions) so surfaces melt seamlessly without ever
 * colliding in unreadable mid-gray.
 */
export function computeUiPalette(hour: number): UiAtmosphericPalette {
  const h = ((hour % 24) + 24) % 24;
  const dayMix = computeSurfaceDaylight(h);
  const isLight = h >= 6.1 && h <= 18.08;

  if (isLight) {
    // Warmth peaks at sunrise (06:10–07:45) and golden hour (16:15–18:05)
    const morningWarm = 1 - smoothstep(6.2, 8.2, h);
    const eveningWarm = smoothstep(15.8, 17.9, h);
    const warm = clamp(Math.max(morningWarm, eveningWarm), 0, 1);

    const cardRgb = mixRgb([252, 251, 248], [253, 243, 229], warm);
    const dialTopRgb = mixRgb([253, 252, 249], [254, 247, 237], warm);
    const dialBotRgb = mixRgb([245, 243, 238], [249, 232, 210], warm);
    const inkRgb = mixRgb([14, 22, 38], [30, 22, 18], warm);
    const ctaBgRgb = mixRgb([15, 23, 42], [32, 22, 18], warm);
    const ctaInkRgb = mixRgb([251, 250, 246], [255, 248, 238], warm);
    const veilRgb = mixRgb([252, 250, 246], [254, 239, 218], warm);
    const stemRgb = mixRgb([31, 122, 74], [46, 114, 62], warm);

    return {
      isLight: true,
      dayMix,
      cardRgb,
      inkRgb,
      ctaBgRgb,
      ctaInkRgb,
      navBg: rgbaOf(cardRgb, 0.84),
      navBgScrolled: rgbaOf(cardRgb, 0.94),
      navBorder: rgbaOf(inkRgb, 0.1),
      navInset: "rgba(255, 255, 255, 0.88)",
      cardBg: rgbaOf(cardRgb, 0.97),
      cardBorder: rgbaOf(inkRgb, 0.09),
      cardInset: "rgba(255, 255, 255, 0.96)",
      surfaceCanvas: rgbaOf(cardRgb, 0.985),
      dialTop: rgbaOf(dialTopRgb, 1),
      dialBot: rgbaOf(dialBotRgb, 1),
      dialRimTop: "rgba(255, 255, 255, 0.95)",
      dialRimMid: rgbaOf(inkRgb, 0.085),
      ink: rgbaOf(inkRgb, 1),
      ink82: rgbaOf(inkRgb, 0.8),
      ink66: rgbaOf(inkRgb, 0.64),
      ink52: rgbaOf(inkRgb, 0.5),
      hairline: rgbaOf(inkRgb, 0.095),
      pillBg: rgbaOf(inkRgb, 0.05),
      pillBgActive: rgbaOf(inkRgb, 0.095),
      pillBorder: rgbaOf(inkRgb, 0.12),
      ctaBg: rgbaOf(ctaBgRgb, 1),
      ctaInk: rgbaOf(ctaInkRgb, 1),
      ghostBg: rgbaOf(cardRgb, 0.64),
      ghostBorder: rgbaOf(inkRgb, 0.18),
      hintBg: rgbaOf(cardRgb, 0.8),
      veilCore: rgbaOf(veilRgb, 0.44),
      veilMid: rgbaOf(veilRgb, 0.15),
      heroShadow: "rgba(255, 255, 255, 0.46)",
      floraStem: rgbaOf(stemRgb, 1),
    };
  }

  // Night & twilight band: velvet plum-indigo near dusk (18:08–20:00) and pre-dawn (04:45–06:10)
  const duskGlow = h >= 18.0 ? 1 - smoothstep(18.1, 20.4, h) : 0;
  const preDawnGlow = h <= 6.2 ? smoothstep(4.5, 6.1, h) : 0;
  const twi = clamp(Math.max(duskGlow, preDawnGlow), 0, 1);

  const cardRgb = mixRgb([11, 16, 29], [31, 26, 52], twi);
  const dialTopRgb = mixRgb([17, 23, 39], [38, 31, 61], twi);
  const dialBotRgb = mixRgb([10, 14, 26], [26, 21, 44], twi);
  const inkRgb = mixRgb([246, 244, 238], [253, 245, 236], twi);
  const ctaBgRgb = mixRgb([246, 244, 238], [253, 242, 228], twi);
  const ctaInkRgb = mixRgb([11, 16, 29], [28, 22, 46], twi);
  const veilRgb = mixRgb([6, 10, 22], [22, 16, 40], twi);
  const stemRgb = mixRgb([74, 222, 128], [110, 231, 162], twi);

  return {
    isLight: false,
    dayMix,
    cardRgb,
    inkRgb,
    ctaBgRgb,
    ctaInkRgb,
    navBg: rgbaOf(cardRgb, 0.8),
    navBgScrolled: rgbaOf(cardRgb, 0.92),
    navBorder: rgbaOf(inkRgb, 0.14),
    navInset: "rgba(255, 255, 255, 0.09)",
    cardBg: rgbaOf(cardRgb, 0.96),
    cardBorder: rgbaOf(inkRgb, 0.12),
    cardInset: "rgba(255, 255, 255, 0.085)",
    surfaceCanvas: rgbaOf(cardRgb, 0.98),
    dialTop: rgbaOf(dialTopRgb, 1),
    dialBot: rgbaOf(dialBotRgb, 1),
    dialRimTop: "rgba(255, 255, 255, 0.24)",
    dialRimMid: "rgba(255, 255, 255, 0.06)",
    ink: rgbaOf(inkRgb, 1),
    ink82: rgbaOf(inkRgb, 0.84),
    ink66: rgbaOf(inkRgb, 0.68),
    ink52: rgbaOf(inkRgb, 0.54),
    hairline: rgbaOf(inkRgb, 0.12),
    pillBg: "rgba(255, 255, 255, 0.08)",
    pillBgActive: "rgba(255, 255, 255, 0.15)",
    pillBorder: "rgba(255, 255, 255, 0.16)",
    ctaBg: rgbaOf(ctaBgRgb, 1),
    ctaInk: rgbaOf(ctaInkRgb, 1),
    ghostBg: rgbaOf(cardRgb, 0.56),
    ghostBorder: rgbaOf(inkRgb, 0.24),
    hintBg: rgbaOf(cardRgb, 0.76),
    veilCore: rgbaOf(veilRgb, 0.54),
    veilMid: rgbaOf(veilRgb, 0.18),
    heroShadow: "rgba(2, 6, 23, 0.68)",
    floraStem: rgbaOf(stemRgb, 1),
  };
}

/**
 * Continuous diurnal UI surface luminance s ∈ [0, 1].
 * Smoothly ramps up across sunrise (05:15 → 07:00) and down across
 * golden hour & dusk (17:15 → 19:15) so surfaces never snap abruptly.
 */
export function computeSurfaceDaylight(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  const dawn = smoothstep(5.25, 7.0, h);
  const dusk = 1 - smoothstep(17.25, 19.25, h);
  return clamp(dawn * dusk, 0, 1);
}

function clockText(t: number) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m === 60 ? 0 : m).padStart(2, "0")}`;
}

/** Interpolate between two light-derived numbers with a scroll driver. */
export const mixNum = lerp;
