/**
 * Color engine — OKLCH↔sRGB with gamma-correct, hue-preserving interpolation.
 *
 * Why this exists: linear-RGB or HSL ramps between a terracotta sunset and a
 * violet dusk pass through desaturated gray. Interpolating in OKLab keeps
 * luminance perceptually even and holds hue, because OKLab is designed to be
 * uniform in perceived lightness.
 *
 * Everything is emitted as CSS color strings so the DOM, SVG and canvas all
 * paint identical values from the same source.
 */

export interface OKLCH {
  l: number; // 0..1 lightness
  c: number; // chroma (unbounded, gamut-mapped on output)
  h: number; // hue degrees 0..360
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hermite smoothstep — used for every fade so nothing ever pops. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Wrap a time value into [0, 24). */
export const wrapHours = (h: number) => ((h % 24) + 24) % 24;

// ── OKLab ────────────────────────────────────────────────────────────────────

interface Lab { L: number; a: number; b: number }

export function oklchToOklab({ l, c, h }: OKLCH): Lab {
  const rad = (h * Math.PI) / 180;
  return { L: l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

function oklabToLinear({ L, a, b }: Lab): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

const inGamut = (rgb: [number, number, number]) =>
  rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/**
 * Gamut-map by reducing chroma at constant lightness/hue until it fits sRGB.
 * This is what keeps sunset oranges saturated instead of clipping to flat red.
 * Returns 0..255 channel ints.
 */
export function oklchToRgb(color: OKLCH): [number, number, number] {
  let { l, c, h } = color;
  l = clamp(l);
  if (inGamut(oklabToLinear(oklchToOklab({ l, c, h })))) {
    return toBytes(oklabToLinear(oklchToOklab({ l, c, h })));
  }
  let lo = 0;
  let hi = c;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToLinear(oklchToOklab({ l, c: mid, h })))) lo = mid;
    else hi = mid;
  }
  return toBytes(oklabToLinear(oklchToOklab({ l, c: lo, h })));
}

function toBytes(lin: [number, number, number]): [number, number, number] {
  return lin.map((v) => Math.round(clamp(gamma(clamp(v))) * 255)) as [number, number, number];
}

const hex2 = (n: number) => n.toString(16).padStart(2, "0");

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

export function oklch(color: OKLCH): string {
  return rgbToHex(oklchToRgb(color));
}

/** "#rrggbb" + alpha → "rgba()" so older Safari also honours it. */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha).toFixed(3)})`;
}

/** Shortest-arc hue interpolation (350° → 10° goes through 0°, not 180°). */
function lerpAngle(a: number, b: number, t: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return (a + d * t + 360) % 360;
}

/** Perceptual mix of two OKLCH colors. */
export function mix(a: OKLCH, b: OKLCH, t: number): OKLCH {
  return {
    l: lerp(a.l, b.l, t),
    c: lerp(a.c, b.c, t),
    h: lerpAngle(a.h, b.h, t),
  };
}

export const mixOklch = mix;

/** Mix toward a target by perceptual "weight" — convenience for tints. */
export const tint = (base: OKLCH, target: OKLCH, amount: number) => mix(base, target, clamp(amount));

export interface Stop<T> { at: number; value: T }

/**
 * Sample a cyclic keyframe track. Keyframes must be sorted by `at` in [0,24).
 * Wraps across midnight so 23:00 → 01:00 blends on the short side.
 */
export function sampleTrack<T>(
  track: Stop<T>[],
  hours: number,
  blend: (a: T, b: T, t: number) => T,
): T {
  const h = wrapHours(hours);
  const n = track.length;
  for (let i = 0; i < n; i++) {
    const cur = track[i];
    const next = track[(i + 1) % n];
    const start = cur.at;
    const end = i === n - 1 ? next.at + 24 : next.at;
    const hh = i === n - 1 && h < start ? h + 24 : h;
    if (hh >= start && hh <= end) {
      const span = end - start || 1;
      return blend(cur.value, next.value, (hh - start) / span);
    }
  }
  return track[0].value;
}
