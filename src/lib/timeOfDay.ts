/**
 * Time-of-Day system — a continuous 24-hour clock, not four phases.
 *
 * `SkyTime` is fractional hours in [0, 24): 18.5 === 18:30. Everything upstream
 * (sky, island, cards, header) reads from this one number.
 *
 * The four legacy phases (morning / afternoon / evening / night) still exist as
 * derived labels so older consumers and copy keep working, but they are no
 * longer the source of truth.
 */

import { clamp, wrapHours } from "./color";

export type SkyTime = number; // 0..24 fractional hours

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/** Named moments in the arc, so copy and tests share one vocabulary. */
export const ANCHORS = {
  midnight: 2,
  blueHour: 6,
  noon: 12,
  sunset: 18,
  dusk: 20.5,
} as const;

export const SKY_ID = "sky-time";

export const clampTime = (t: number) => clamp(wrapHours(t), 0, 24 - 1e-6);

/** 18.5 → "18:30" */
export function formatTime(t: number): string {
  const h = wrapHours(t);
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  const m = minutes === 60 ? 0 : minutes;
  const hh = minutes === 60 ? (hours + 1) % 24 : hours;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "18:30" → 18.5 */
export function parseTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h + min / 60;
}

/**
 * Forgiving parser for a time someone types into the clock:
 * "7", "07", "730", "0730", "7:30", "7.30", "19h30", "7pm", "7:30 am",
 * "noon", "midnight", "now". Returns fractional hours, or null.
 */
export function parseClockInput(raw: string): number | null {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!v) return null;
  if (v === "noon" || v === "midday") return 12;
  if (v === "midnight") return 0;
  if (v === "now") return localNow();

  const m = /^(\d{1,4})(?:[:.h](\d{1,2}))?(am|pm|a|p)?$/.exec(v);
  if (!m) return null;
  let h: number;
  let min: number;
  if (m[2] !== undefined) {
    h = Number(m[1]);
    min = Number(m[2].padEnd(2, "0"));
  } else if (m[1].length <= 2) {
    h = Number(m[1]);
    min = 0;
  } else {
    // "730" → 7:30, "1945" → 19:45
    h = Number(m[1].slice(0, -2));
    min = Number(m[1].slice(-2));
  }
  const suffix = m[3];
  if (suffix) {
    if (h < 1 || h > 12) return null;
    const pm = suffix.startsWith("p");
    h = (h % 12) + (pm ? 12 : 0);
  }
  if (h === 24 && min === 0) h = 0;
  if (h > 23 || min > 59) return null;
  return h + min / 60;
}

/** Visitor's real local clock, in fractional hours. */
export function localNow(date = new Date()): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/**
 * Coarse phase label derived from the continuous time. Boundaries are chosen so
 * "night" begins when stars are clearly visible, not at a clean hour.
 */
export function phaseAt(t: number): TimeOfDay {
  const h = wrapHours(t);
  if (h >= 5.5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 20.75) return "evening";
  return "night";
}

export function isNight(t: number): boolean {
  return phaseAt(t) === "night";
}

/** Human label for the dial, e.g. "Golden hour". */
export function momentLabel(t: number): string {
  const h = wrapHours(t);
  if (h < 4.5) return "Deep night";
  if (h < 5.5) return "First light";
  if (h < 6.5) return "Blue hour";
  if (h < 8) return "Sunrise";
  if (h < 11) return "Morning";
  if (h < 14) return "Midday";
  if (h < 16.5) return "Afternoon";
  if (h < 17.75) return "Golden hour";
  if (h < 18.75) return "Sunset";
  if (h < 19.75) return "Afterglow";
  if (h < 21) return "Dusk";
  if (h < 22.5) return "Nightfall";
  return "Night";
}

/** Legacy attribute value (kept so existing `data-scenario` CSS still matches). */
export function todToScenario(tod: TimeOfDay): string {
  return tod === "morning" ? "dawn" : tod === "afternoon" ? "day" : tod === "evening" ? "dusk" : "night";
}

export function scenarioToTimeOfDay(scenario: string): TimeOfDay {
  switch (scenario) {
    case "dawn":
      return "morning";
    case "day":
    case "golden":
      return "afternoon";
    case "dusk":
      return "evening";
    case "night":
      return "night";
    default:
      return phaseAt(12);
  }
}

/** Back-compat helper kept from the prototype. */
export function detectTimeOfDay(): TimeOfDay {
  return phaseAt(localNow());
}

export { wrapHours } from "./color";
