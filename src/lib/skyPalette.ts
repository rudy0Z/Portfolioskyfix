/**
 * Sky palette — a 24-hour OKLCH keyframe track.
 *
 * Stops are dense around sunrise and sunset (where hue changes fastest) and
 * sparse in the stable middle of the day and night. Every stop defines the full
 * atmosphere — zenith/mid/horizon, a sun bloom, cloud body + rim, terrain tint
 * — so a single time value can drive every surface in the scene consistently.
 *
 * Interpolation happens in OKLCH (hue along the short arc), then gamut-maps to
 * sRGB on output. Where a blue stop meets a warm one, the warm hue is chosen
 * so the short arc runs through rose rather than green (e.g. 232° → 42°, not
 * 232° → 60°): real twilight never passes through teal. That is why 18:00 terracotta can slide into 20:30 violet
 * without passing through mud.
 */

import { type OKLCH, mix, sampleTrack, type Stop } from "./color";

export interface SkyStop {
  zenith: OKLCH;
  /** Mid-sky band, roughly where clouds sit. */
  mid: OKLCH;
  horizon: OKLCH;
  /** Haze at the horizon line — separates land from sky. */
  haze: OKLCH;
  /** Sun/moon core disc color. */
  sunCore: OKLCH;
  /** Sun bloom / halo. */
  sunGlow: OKLCH;
  /** Cloud body, in shadow. */
  cloudShadow: OKLCH;
  /** Cloud body, lit side. */
  cloudLit: OKLCH;
  /** Thin rim highlight catching the key light. */
  cloudRim: OKLCH;
  /** Broad wash used to tint SVG terrain and illustration. */
  terrain: OKLCH;
  /** Paper/ink tint for foreground stipple. */
  ink: OKLCH;
}

const Z = (
  zenith: OKLCH,
  mid: OKLCH,
  horizon: OKLCH,
  haze: OKLCH,
  sunCore: OKLCH,
  sunGlow: OKLCH,
  cloudShadow: OKLCH,
  cloudLit: OKLCH,
  cloudRim: OKLCH,
  terrain: OKLCH,
  ink: OKLCH,
): SkyStop => ({ zenith, mid, horizon, haze, sunCore, sunGlow, cloudShadow, cloudLit, cloudRim, terrain, ink });

/* ── the arc ─────────────────────────────────────────────────────────────── */

export const SKY_TRACK: Stop<SkyStop>[] = [
  // 00:00 — true midnight indigo
  { at: 0, value: Z(
    { l: 0.17, c: 0.055, h: 272 }, { l: 0.21, c: 0.06, h: 268 }, { l: 0.27, c: 0.07, h: 262 },
    { l: 0.3, c: 0.06, h: 258 }, { l: 0.94, c: 0.015, h: 95 }, { l: 0.6, c: 0.06, h: 250 },
    { l: 0.2, c: 0.04, h: 270 }, { l: 0.34, c: 0.045, h: 265 }, { l: 0.55, c: 0.03, h: 250 },
    { l: 0.28, c: 0.05, h: 268 }, { l: 0.16, c: 0.03, h: 270 },
  ) },
  // 02:00 — deepest point, almost black-blue
  { at: 2, value: Z(
    { l: 0.155, c: 0.05, h: 274 }, { l: 0.19, c: 0.058, h: 270 }, { l: 0.25, c: 0.068, h: 264 },
    { l: 0.27, c: 0.055, h: 260 }, { l: 0.94, c: 0.012, h: 95 }, { l: 0.5, c: 0.05, h: 248 },
    { l: 0.19, c: 0.038, h: 272 }, { l: 0.31, c: 0.042, h: 266 }, { l: 0.5, c: 0.028, h: 252 },
    { l: 0.24, c: 0.045, h: 270 }, { l: 0.14, c: 0.028, h: 272 },
  ) },
  // 04:15 — pre-dawn, the sky lifts at the horizon only
  { at: 4.25, value: Z(
    { l: 0.18, c: 0.05, h: 276 }, { l: 0.25, c: 0.06, h: 272 }, { l: 0.36, c: 0.07, h: 268 },
    { l: 0.4, c: 0.055, h: 262 }, { l: 0.94, c: 0.02, h: 90 }, { l: 0.55, c: 0.07, h: 255 },
    { l: 0.24, c: 0.04, h: 272 }, { l: 0.38, c: 0.05, h: 270 }, { l: 0.6, c: 0.04, h: 260 },
    { l: 0.3, c: 0.05, h: 268 }, { l: 0.18, c: 0.03, h: 272 },
  ) },
  // 05:15 — first light, cold rose creeping along the horizon
  { at: 5.25, value: Z(
    { l: 0.25, c: 0.055, h: 274 }, { l: 0.36, c: 0.055, h: 280 }, { l: 0.56, c: 0.07, h: 330 },
    { l: 0.62, c: 0.05, h: 340 }, { l: 1.0, c: 0.02, h: 80 }, { l: 0.78, c: 0.07, h: 30 },
    { l: 0.4, c: 0.05, h: 300 }, { l: 0.62, c: 0.06, h: 330 }, { l: 0.8, c: 0.07, h: 20 },
    { l: 0.46, c: 0.05, h: 310 }, { l: 0.26, c: 0.03, h: 285 },
  ) },
  // 06:00 — the blue hour you named. Cool, luminous, 260–235.
  { at: 6, value: Z(
    { l: 0.36, c: 0.06, h: 268 }, { l: 0.52, c: 0.07, h: 255 }, { l: 0.7, c: 0.08, h: 232 },
    { l: 0.76, c: 0.06, h: 238 }, { l: 1.0, c: 0.03, h: 75 }, { l: 0.88, c: 0.09, h: 48 },
    { l: 0.52, c: 0.06, h: 268 }, { l: 0.76, c: 0.05, h: 285 }, { l: 0.94, c: 0.08, h: 40 },
    { l: 0.55, c: 0.05, h: 245 }, { l: 0.35, c: 0.04, h: 265 },
  ) },
  // 06:45 — sunrise: amber and rose *underlighting* on the cloud bases
  { at: 6.75, value: Z(
    { l: 0.48, c: 0.065, h: 262 }, { l: 0.66, c: 0.085, h: 240 }, { l: 0.82, c: 0.1, h: 42 },
    { l: 0.86, c: 0.07, h: 52 }, { l: 1.0, c: 0.04, h: 70 }, { l: 0.9, c: 0.14, h: 62 },
    { l: 0.62, c: 0.07, h: 300 }, { l: 0.85, c: 0.09, h: 25 }, { l: 0.98, c: 0.13, h: 62 },
    { l: 0.66, c: 0.06, h: 60 }, { l: 0.42, c: 0.045, h: 258 },
  ) },
  // 08:30 — settled morning: pale air blue, warm haze low down
  { at: 8.5, value: Z(
    { l: 0.54, c: 0.066, h: 252 }, { l: 0.68, c: 0.06, h: 242 }, { l: 0.82, c: 0.04, h: 228 },
    { l: 0.87, c: 0.032, h: 84 }, { l: 0.98, c: 0.026, h: 95 }, { l: 0.9, c: 0.05, h: 88 },
    { l: 0.7, c: 0.036, h: 252 }, { l: 0.87, c: 0.026, h: 235 }, { l: 0.98, c: 0.045, h: 84 },
    { l: 0.76, c: 0.042, h: 80 }, { l: 0.48, c: 0.044, h: 252 },
  ) },
  // 12:00 — midday: atmospheric slate blue, not electric cyan. Chroma is held
  // back and the horizon keeps a natural warm-grey haze.
  { at: 12, value: Z(
    { l: 0.56, c: 0.072, h: 250 }, { l: 0.7, c: 0.062, h: 244 }, { l: 0.84, c: 0.036, h: 235 },
    { l: 0.88, c: 0.022, h: 95 }, { l: 0.98, c: 0.018, h: 95 }, { l: 0.9, c: 0.035, h: 92 },
    { l: 0.74, c: 0.03, h: 248 }, { l: 0.92, c: 0.012, h: 92 }, { l: 0.98, c: 0.022, h: 95 },
    { l: 0.8, c: 0.036, h: 84 }, { l: 0.5, c: 0.042, h: 250 },
  ) },
  // 15:00 — afternoon: the same air blue, warming slightly
  { at: 15, value: Z(
    { l: 0.55, c: 0.07, h: 250 }, { l: 0.69, c: 0.062, h: 243 }, { l: 0.83, c: 0.04, h: 226 },
    { l: 0.88, c: 0.03, h: 80 }, { l: 0.98, c: 0.024, h: 90 }, { l: 0.9, c: 0.05, h: 84 },
    { l: 0.72, c: 0.034, h: 250 }, { l: 0.9, c: 0.024, h: 84 }, { l: 0.98, c: 0.045, h: 80 },
    { l: 0.79, c: 0.045, h: 78 }, { l: 0.5, c: 0.044, h: 250 },
  ) },
  // 17:15 — golden hour, the flush begins
  { at: 17.25, value: Z(
    { l: 0.58, c: 0.1, h: 250 }, { l: 0.74, c: 0.1, h: 236 }, { l: 0.86, c: 0.095, h: 42 },
    { l: 0.88, c: 0.08, h: 58 }, { l: 1.0, c: 0.05, h: 75 }, { l: 0.95, c: 0.13, h: 68 },
    { l: 0.68, c: 0.07, h: 300 }, { l: 0.94, c: 0.055, h: 70 }, { l: 1.0, c: 0.13, h: 68 },
    { l: 0.82, c: 0.085, h: 66 }, { l: 0.48, c: 0.055, h: 252 },
  ) },
  // 18:00 — sun on the horizon: terracotta and rose, sky still luminous
  { at: 18, value: Z(
    { l: 0.42, c: 0.105, h: 288 }, { l: 0.58, c: 0.13, h: 315 }, { l: 0.7, c: 0.175, h: 42 },
    { l: 0.72, c: 0.155, h: 38 }, { l: 1.0, c: 0.06, h: 62 }, { l: 0.84, c: 0.175, h: 46 },
    { l: 0.46, c: 0.115, h: 318 }, { l: 0.72, c: 0.16, h: 34 }, { l: 0.95, c: 0.175, h: 60 },
    { l: 0.64, c: 0.14, h: 44 }, { l: 0.32, c: 0.075, h: 300 },
  ) },
  // 18:40 — true sunset: the disc is half-sunk, the underside of the sky burns
  { at: 18.66, value: Z(
    { l: 0.34, c: 0.1, h: 292 }, { l: 0.48, c: 0.135, h: 322 }, { l: 0.6, c: 0.185, h: 36 },
    { l: 0.62, c: 0.165, h: 30 }, { l: 1.0, c: 0.06, h: 58 }, { l: 0.7, c: 0.18, h: 34 },
    { l: 0.36, c: 0.11, h: 330 }, { l: 0.56, c: 0.165, h: 20 }, { l: 0.82, c: 0.175, h: 44 },
    { l: 0.5, c: 0.13, h: 30 }, { l: 0.25, c: 0.07, h: 305 },
  ) },
  // 19:20 — afterglow: peach low, violet above, the last warm hold
  { at: 19.33, value: Z(
    { l: 0.26, c: 0.085, h: 292 }, { l: 0.36, c: 0.115, h: 305 }, { l: 0.48, c: 0.15, h: 12 },
    { l: 0.48, c: 0.12, h: 8 }, { l: 0.98, c: 0.05, h: 55 }, { l: 0.55, c: 0.14, h: 20 },
    { l: 0.28, c: 0.085, h: 312 }, { l: 0.42, c: 0.12, h: 330 }, { l: 0.66, c: 0.13, h: 10 },
    { l: 0.38, c: 0.1, h: 320 }, { l: 0.2, c: 0.05, h: 300 },
  ) },
  // 20:30 — dusk violet you specified
  { at: 20.5, value: Z(
    { l: 0.205, c: 0.07, h: 286 }, { l: 0.29, c: 0.09, h: 294 }, { l: 0.38, c: 0.105, h: 318 },
    { l: 0.38, c: 0.08, h: 310 }, { l: 0.97, c: 0.03, h: 60 }, { l: 0.44, c: 0.08, h: 328 },
    { l: 0.22, c: 0.06, h: 300 }, { l: 0.32, c: 0.075, h: 305 }, { l: 0.5, c: 0.06, h: 318 },
    { l: 0.29, c: 0.065, h: 305 }, { l: 0.17, c: 0.035, h: 295 },
  ) },
  // 21:45 — nightfall, stars resolving
  { at: 21.75, value: Z(
    { l: 0.18, c: 0.06, h: 280 }, { l: 0.23, c: 0.07, h: 278 }, { l: 0.31, c: 0.08, h: 288 },
    { l: 0.31, c: 0.06, h: 280 }, { l: 0.95, c: 0.02, h: 90 }, { l: 0.5, c: 0.06, h: 265 },
    { l: 0.2, c: 0.045, h: 285 }, { l: 0.31, c: 0.05, h: 278 }, { l: 0.48, c: 0.04, h: 280 },
    { l: 0.25, c: 0.05, h: 282 }, { l: 0.155, c: 0.03, h: 280 },
  ) },
  // 23:00 — settling toward midnight
  { at: 23, value: Z(
    { l: 0.17, c: 0.056, h: 276 }, { l: 0.21, c: 0.062, h: 272 }, { l: 0.28, c: 0.072, h: 270 },
    { l: 0.3, c: 0.055, h: 264 }, { l: 0.94, c: 0.015, h: 95 }, { l: 0.56, c: 0.06, h: 252 },
    { l: 0.2, c: 0.04, h: 274 }, { l: 0.33, c: 0.045, h: 270 }, { l: 0.52, c: 0.03, h: 262 },
    { l: 0.27, c: 0.048, h: 272 }, { l: 0.16, c: 0.03, h: 274 },
  ) },
];

/** Blend two full sky stops field by field, in OKLCH. */
export function blendStops(a: SkyStop, b: SkyStop, t: number): SkyStop {
  const out = {} as SkyStop;
  (Object.keys(a) as (keyof SkyStop)[]).forEach((k) => {
    out[k] = mix(a[k], b[k], t);
  });
  return out;
}

export function paletteAt(hours: number): SkyStop {
  return sampleTrack(SKY_TRACK, hours, blendStops);
}
