import { wrapHours } from "../lib/timeOfDay";

export const SUNDIAL_GEOM = {
  vbW: 320,
  vbH: 150,
  cx: 160,
  cy: 128,
  radius: 108,
  tickCount: 48,
} as const;

export const PIN_DIAL_GEOM = {
  vbW: 440,
  vbH: 458,
  cx: 220,
  cy: 310,
  radius: 158,
  tickCount: 96,
  angleStart: -115,
  angleEnd: 115,
} as const;

export interface ArcPoint {
  x: number;
  y: number;
  angleRad: number;
}

export interface CombTick {
  index: number;
  u: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  major: boolean;
  active: boolean;
}

export interface SolarPhaseMeta {
  label: string;
  shortLabel: string;
  hint: string;
  isDay: boolean;
  accentColor: string;
}

export interface PinDialAtmosphere {
  theme: "light" | "dark";
  c1: string;
  c2: string;
  c3: string;
  orbColor: string;
  orbCore: string;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixRgbHex(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

/**
 * Chromatic spectrum across the horizon arc:
 * Pre-Dawn Indigo (#6366f1) -> Morning Sky (#38bdf8) -> Solar Noon (#facc15)
 * -> Golden Amber (#fb923c) -> Dusk Violet (#818cf8)
 */
const CHROMATIC_STOPS: readonly { u: number; rgb: [number, number, number] }[] = [
  { u: 0.0, rgb: [99, 102, 241] },   // #6366f1 Midnight / Pre-dawn
  { u: 0.24, rgb: [245, 158, 11] },  // #f59e0b Dawn break
  { u: 0.42, rgb: [56, 189, 248] },  // #38bdf8 Crisp morning
  { u: 0.56, rgb: [250, 204, 21] },  // #facc15 Solar noon
  { u: 0.74, rgb: [251, 146, 60] },  // #fb923c Golden hour
  { u: 0.86, rgb: [168, 85, 247] },  // #a855f7 Blue dusk
  { u: 1.0, rgb: [99, 102, 241] },   // #6366f1 Midnight
];

export function chromaticTickColor(u: number): string {
  const t = clamp(u, 0, 1);
  for (let i = 0; i < CHROMATIC_STOPS.length - 1; i++) {
    const a = CHROMATIC_STOPS[i];
    const b = CHROMATIC_STOPS[i + 1];
    if (t >= a.u && t <= b.u) {
      const local = (t - a.u) / Math.max(1e-6, b.u - a.u);
      return mixRgbHex(a.rgb, b.rgb, local);
    }
  }
  const last = CHROMATIC_STOPS[CHROMATIC_STOPS.length - 1].rgb;
  return mixRgbHex(last, last, 0);
}

/**
 * Maps fractional hour t ∈ [0, 24) to PinUI sweep angle in [-115°, +115°].
 * Full continuous 24h scrub: 00:00 (-115°) -> 12:00 (0° zenith) -> 24:00 (+115°).
 */
export function hourToPinAngle(hour: number): number {
  const h = wrapHours(hour);
  const f = h / 24;
  return PIN_DIAL_GEOM.angleStart + f * (PIN_DIAL_GEOM.angleEnd - PIN_DIAL_GEOM.angleStart);
}

/**
 * Converts a PinUI dial angle (degrees from 12 o'clock, clockwise positive)
 * into a continuous fractional hour in [0, 24).
 */
export function pinAngleToHour(angleDeg: number): number {
  const { angleStart, angleEnd } = PIN_DIAL_GEOM;
  const gapHalf = (360 - (angleEnd - angleStart)) / 2;
  let a = angleDeg;
  if (a > angleEnd) a = a < angleEnd + gapHalf ? angleEnd : angleStart;
  if (a < angleStart) a = a > angleStart - gapHalf ? angleStart : angleEnd;
  const f = clamp((a - angleStart) / (angleEnd - angleStart), 0, 1);
  // Keep 23:59 instead of wrapping immediately back to 00:00 at the right stop
  return Math.min(23.983, f * 24);
}

/**
 * Computes PinUI-grade rising bottom atmospheric wash colors & polarity for hour t.
 * Daylight & golden hour wear warm alabaster with luminous atmospheric glow;
 * twilight & night wear deep precision obsidian with cool celestial indigo/silver wash.
 */
export function pinDialAtmosphere(hour: number): PinDialAtmosphere {
  const h = wrapHours(hour);

  // Adaptive polarity: light alabaster from dawn break through golden hour; dark obsidian at dusk/night
  const theme: "light" | "dark" = h >= 6.0 && h <= 18.6 ? "light" : "dark";

  const stops: { h: number; c1: [number, number, number]; c2: [number, number, number]; c3: [number, number, number] }[] = [
    { h: 0.0, c1: [30, 58, 138], c2: [59, 130, 246], c3: [191, 219, 254] },    // Midnight indigo-blue
    { h: 5.5, c1: [124, 58, 237], c2: [244, 114, 182], c3: [253, 213, 177] },  // Pre-dawn violet-rose
    { h: 6.75, c1: [217, 119, 6], c2: [251, 146, 60], c3: [254, 240, 199] },   // Sunrise amber
    { h: 10.5, c1: [14, 116, 144], c2: [56, 189, 248], c3: [224, 242, 254] },  // Morning azure
    { h: 13.5, c1: [2, 132, 199], c2: [96, 165, 250], c3: [254, 249, 195] },   // Solar noon crisp blue-gold
    { h: 16.8, c1: [194, 65, 12], c2: [251, 146, 60], c3: [254, 215, 130] },   // Golden hour molten amber
    { h: 18.8, c1: [153, 27, 27], c2: [234, 88, 12], c3: [253, 186, 116] },    // Sunset terracotta
    { h: 20.2, c1: [55, 48, 163], c2: [99, 102, 241], c3: [199, 210, 254] },   // Blue hour twilight
    { h: 24.0, c1: [30, 58, 138], c2: [59, 130, 246], c3: [191, 219, 254] },   // Wrap to midnight
  ];

  let c1 = "#1e3a8a";
  let c2 = "#3b82f6";
  let c3 = "#bfdbfe";
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (h >= a.h && h <= b.h) {
      const local = (h - a.h) / Math.max(1e-6, b.h - a.h);
      c1 = mixRgbHex(a.c1, b.c1, local);
      c2 = mixRgbHex(a.c2, b.c2, local);
      c3 = mixRgbHex(a.c3, b.c3, local);
      break;
    }
  }

  const isDay = h >= 6.0 && h <= 18.5;
  return {
    theme,
    c1,
    c2,
    c3,
    orbColor: isDay ? "#f97316" : "#93c5fd",
    orbCore: isDay ? "#fff7ed" : "#f8fafc",
  };
}

/**
 * Legacy-compatible 180° dome helpers (preserved for unit test & route compatibility).
 */
export function hourToArcProgress(hour: number): { u: number; isDay: boolean } {
  const h = wrapHours(hour);
  if (h >= 6 && h <= 18) {
    return { u: clamp((h - 6) / 12, 0, 1), isDay: true };
  }
  const nightOffset = h > 18 ? h - 18 : h + 6;
  return { u: clamp(nightOffset / 12, 0, 1), isDay: false };
}

export function arcPoint(u: number, radius: number = SUNDIAL_GEOM.radius): ArcPoint {
  const t = clamp(u, 0, 1);
  const angleRad = Math.PI * (1 - t);
  return {
    x: SUNDIAL_GEOM.cx + Math.cos(angleRad) * radius,
    y: SUNDIAL_GEOM.cy - Math.sin(angleRad) * radius,
    angleRad,
  };
}

export function svgPointToHour(x: number, y: number, isDayArc: boolean): number {
  const dx = x - SUNDIAL_GEOM.cx;
  const dy = SUNDIAL_GEOM.cy - y;
  const angleRad = Math.atan2(Math.max(0, dy), dx);
  const u = clamp(1 - angleRad / Math.PI, 0, 1);
  if (isDayArc) {
    return 6 + u * 12;
  }
  return wrapHours(18 + u * 12);
}

export function buildCombTicks(
  activeU: number,
  tickCount: number = SUNDIAL_GEOM.tickCount,
): CombTick[] {
  const count = Math.max(2, tickCount);
  const ticks: CombTick[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    const major = i % 6 === 0 || i === count - 1;
    const active = Math.abs(u - activeU) <= 0.032;
    const innerR = SUNDIAL_GEOM.radius - (major ? 10 : 6);
    const outerR = SUNDIAL_GEOM.radius + (active ? 5 : major ? 2.5 : 0);
    const p1 = arcPoint(u, innerR);
    const p2 = arcPoint(u, outerR);
    ticks.push({
      index: i,
      u,
      x1: Number(p1.x.toFixed(2)),
      y1: Number(p1.y.toFixed(2)),
      x2: Number(p2.x.toFixed(2)),
      y2: Number(p2.y.toFixed(2)),
      color: chromaticTickColor(u),
      major,
      active,
    });
  }
  return ticks;
}

/**
 * Human-readable astronomical phase label and metadata.
 */
export function solarPhaseMeta(hour: number): SolarPhaseMeta {
  const h = wrapHours(hour);
  if (h >= 5.25 && h < 7.25) {
    return {
      label: "DAWN",
      shortLabel: "Dawn",
      hint: "Drag arc to scrub sky",
      isDay: true,
      accentColor: "#ea580c",
    };
  }
  if (h >= 7.25 && h < 11.25) {
    return {
      label: "MORNING",
      shortLabel: "Morning",
      hint: "Drag arc to scrub sky",
      isDay: true,
      accentColor: "#0284c7",
    };
  }
  if (h >= 11.25 && h < 15.75) {
    return {
      label: "SOLAR NOON",
      shortLabel: "Daylight",
      hint: "Drag arc to scrub sky",
      isDay: true,
      accentColor: "#0369a1",
    };
  }
  if (h >= 15.75 && h <= 18.45) {
    return {
      label: "GOLDEN HOUR",
      shortLabel: "Golden hour",
      hint: "Drag arc to scrub sky",
      isDay: true,
      accentColor: "#ea580c",
    };
  }
  if (h > 18.45 && h < 20.5) {
    return {
      label: "BLUE HOUR",
      shortLabel: "Dusk",
      hint: "Drag arc to scrub sky",
      isDay: false,
      accentColor: "#818cf8",
    };
  }
  return {
    label: "NIGHT",
    shortLabel: "Night",
    hint: "Drag arc to scrub sky",
    isDay: false,
    accentColor: "#93c5fd",
  };
}
