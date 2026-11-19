/**
 * Diurnal bloom & meadow atmosphere math — pure, unit-testable functions.
 *
 * Physical realism law:
 *   Wildflowers do NOT emit additive neon bloom under bright midday or
 *   afternoon sun. Bioluminescent / luminous meadow glow is strictly gated to
 *   night, evening dusk (evening -> night), and pre-dawn (night -> morning)
 *   transitions. Turning glow completely off during daylight also eliminates
 *   unnecessary additive halo draws in the meadow pass.
 */

export interface DiurnalLightInput {
  /** Fractional hour in [0, 24). */
  time: number;
  /** 0 (night) .. 1 (full daylight). */
  daylight: number;
  /** 0 .. 1 golden-hour factor. */
  golden: number;
  /** 0 .. 1 twilight (dawn/dusk) factor. */
  twilight: number;
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Computes meadow floral bloom intensity (0..100).
 *
 * - Full morning & afternoon daylight (daylight >= 0.65): strictly 0.
 * - Golden hour while sun is still high: 0 (warmth comes from directional light, not neon bloom).
 * - Evening dusk transition (daylight dropping below 0.65 into twilight) and
 *   pre-dawn transition (night -> morning): smooth ramp 0 -> 88.
 * - Deep night (daylight ~ 0): rich natural nocturnal glow ~88.
 */
export function computeMeadowGlow(light: DiurnalLightInput): number {
  const d = clamp(light.daylight);
  const tw = clamp(light.twilight);

  // Zero bloom throughout bright morning, midday, and afternoon
  if (d >= 0.65) return 0;

  // Nocturnal dominance ramps smoothly only as daylight fades below 0.62
  const darkFactor = 1 - smoothstep(0.08, 0.62, d);
  // Subtle twilight transition boost only during low-light dawn/dusk
  const twilightLift = tw * (1 - smoothstep(0.28, 0.65, d)) * 0.28;

  const raw = clamp(darkFactor * 0.88 + twilightLift, 0, 0.92);
  const quantized = Math.round((raw * 100) / 5) * 5;
  return quantized < 5 ? 0 : quantized;
}

/**
 * Computes subtle backlit warmth for golden hour (0..100) without over-blooming
 * high-noon afternoon petals.
 */
export function computeMeadowGoldenRim(light: DiurnalLightInput): number {
  const g = clamp(light.golden);
  const d = clamp(light.daylight);
  // Keep afternoon crisp; reserve warm rim-light for low-angle golden hour
  if (g < 0.08 && d > 0.75) return 0;
  return Math.round(clamp(g * 0.85, 0, 0.85) * 100);
}
