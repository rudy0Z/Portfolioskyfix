/**
 * frameBudget — the one budget shared by the sky and the garden (hero plan §5.3).
 *
 * Each renderer already protects itself: BluebellPass tracks a draw-cost EMA
 * (the number `window.__bbPerf` shows) and steps its own bake resolution down
 * (quality 1 → 0.6), SkyRenderer tracks a 30-frame median (`sampleFrame`) and
 * steps cloud resolution down (scale → minScale). But each protects itself
 * alone — on a weak GPU both run flat out and the *combined* frame blows past
 * the budget. The coordinator reads both governors' existing signals and steps
 * a shared quality ladder with hysteresis:
 *
 *   - down on 3 consecutive bad windows (600 ms each), up on 6 good ones;
 *   - per-tier flip counters: a tier that has flapped needs a longer good run
 *     to climb back into, so the ladder cannot oscillate;
 *   - persisted in sessionStorage, so a reload in the same tab starts where
 *     the device proved it should be instead of re-stressing.
 *
 * The ladder gives the newest effects back first (shafts off → ripple off →
 * sky scale → garden scale); the long-standing visuals are the last to
 * degrade, and the bottom rungs sit at each governor's own designed floor, so
 * every tier reads as intentional art direction (plan constraint 0.2).
 *
 * Consumers sample `state()` — a pure function of time that eases between
 * tiers over ~600 ms — so tier changes cross-fade instead of snapping, and
 * neither governor needs a new rAF loop. `?budget=off` pins tier 0 for A/B.
 */

/** What consumers read. The numeric channels animate across tier changes. */
export interface BudgetChannels {
  /** Cap for the garden bake resolution (BluebellPass `quality`, ≤ 1). */
  garden: number;
  /** Cap for the cloud pass resolution (SkyRenderer `quality.scale`, ≤ 1). */
  sky: number;
  /** 0–1 — god-ray amplitude multiplier (0 = shafts off). */
  shafts: number;
  /** 0–1 — pointer-ripple amplitude multiplier (§5.2 knob must also be on). */
  ripple: number;
}

export interface BudgetState extends BudgetChannels {
  /** Current tier index, 0 = full quality. */
  tier: number;
}

/** The ladder. Newest effects first out; garden/sky floors match the
 *  governors' own designed minimums (Bluebell quality 0.6, sky minScale 0.28). */
const TIERS: BudgetChannels[] = [
  { garden: 1, sky: 1, shafts: 1, ripple: 1 }, // 0 — everything on
  { garden: 1, sky: 1, shafts: 0, ripple: 1 }, // 1 — shafts give back first
  { garden: 1, sky: 1, shafts: 0, ripple: 0 }, // 2 — ripple next
  { garden: 1, sky: 0.5, shafts: 0, ripple: 0 }, // 3 — cloud pass resolution capped
  { garden: 0.9, sky: 0.44, shafts: 0, ripple: 0 }, // 4 — garden bake joins
  { garden: 0.8, sky: 0.38, shafts: 0, ripple: 0 },
  { garden: 0.7, sky: 0.32, shafts: 0, ripple: 0 },
  { garden: 0.6, sky: 0.28, shafts: 0, ripple: 0 }, // 7 — both at designed floors
];

const WINDOW_MS = 600; // one evaluation window
const DOWN_RUN = 2; // consecutive bad windows before a step down (was 3 — 1.8 s of visible lag)
const UP_RUN = 6; // consecutive good windows before a step up (× flap penalty)
const MAX_FLAP_PENALTY = 3; // up-run multiplier caps at 1 + 3
const GARDEN_BAD_MS = 10; // draw-cost EMA over this = bad (target < 8; was 15 — let lag through)
const GARDEN_GOOD_MS = 6; // …under this = good
const SKY_BAD_MS = 26; // 30-frame median over this = bad
const SKY_GOOD_MS = 18; // …under this = good (idle renders every ~16.7 ms)
const STALE_MS = 2500; // signal older than this = renderer not drawing → ignore
const WARMUP_MS = 4000; // ignore bad windows right after load (compile/bake jank)
const FADE_MS = 600; // tier cross-fade
const STORE_KEY = "bb.budget.v1";

type Signal = { value: number; at: number };
const NO_SIGNAL: Signal = { value: NaN, at: 0 };

let tier = 0;
const flaps: number[] = new Array(TIERS.length).fill(0);
let from: BudgetChannels = TIERS[0];
let changedAt = -1e9; // −inf → state() returns the tier values as-is
let garden: Signal = NO_SIGNAL;
let sky: Signal = NO_SIGNAL;
let badRun = 0;
let goodRun = 0;
let bootAt = -1;
let booted = false;
let timer = 0;
let frozen = false; // ?budget=off — stay at tier 0, no evaluation

/** Knob + persisted tier, applied at module load so a same-tab reload starts
 *  where the device proved it should be — no re-stress window. */
function boot() {
  if (booted) return;
  booted = true;
  frozen = !readKnob();
  restore();
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function readKnob(): boolean {
  if (typeof window === "undefined") return true;
  return new URLSearchParams(window.location.search).get("budget") !== "off";
}

/** Restore the persisted tier (same tab reloads don't re-stress). */
function restore() {
  if (typeof window === "undefined" || frozen) return;
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { tier?: number; flaps?: number[] };
    const t = Math.min(TIERS.length - 1, Math.max(0, Math.round(saved.tier ?? 0)));
    tier = t;
    if (Array.isArray(saved.flaps)) saved.flaps.forEach((f, i) => (flaps[i] = Number(f) || 0));
    from = TIERS[tier];
    changedAt = -1e9;
  } catch {
    /* private mode / disabled storage — run unpersisted */
  }
}

function persist() {
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ tier, flaps }));
  } catch {
    /* ignore */
  }
}

function mixChannels(a: number, b: number, e: number): number {
  return a + (b - a) * e;
}

/** The animated channels — pure function of time, sampled by consumers. */
function channels(): BudgetChannels {
  const k = Math.min(1, Math.max(0, (now() - changedAt) / FADE_MS));
  const e = k * k * (3 - 2 * k); // smoothstep — no visible velocity jump
  const to = TIERS[tier];
  return {
    garden: mixChannels(from.garden, to.garden, e),
    sky: mixChannels(from.sky, to.sky, e),
    shafts: mixChannels(from.shafts, to.shafts, e),
    ripple: mixChannels(from.ripple, to.ripple, e),
  };
}

function setTier(next: number) {
  if (next === tier) return;
  from = channels(); // continue the fade from wherever it is now
  tier = next;
  changedAt = now();
  flaps[tier] += 1;
  badRun = 0;
  goodRun = 0;
  persist();
}

function evaluate() {
  if (frozen || typeof document === "undefined" || document.hidden) return;
  const t = now();
  const gLive = Number.isFinite(garden.value) && t - garden.at < STALE_MS;
  const sLive = Number.isFinite(sky.value) && t - sky.at < STALE_MS;
  if (!gLive && !sLive) {
    // Nobody is drawing (scrolled away / hidden): keep the tier, reset runs.
    badRun = 0;
    goodRun = 0;
    return;
  }
  const gBad = gLive && garden.value > GARDEN_BAD_MS;
  const sBad = sLive && sky.value > SKY_BAD_MS;
  if (gBad || sBad) {
    if (t - bootAt < WARMUP_MS) return; // cold-start jank is not a signal
    badRun += 1;
    goodRun = 0;
    if (badRun >= DOWN_RUN && tier < TIERS.length - 1) setTier(tier + 1);
    return;
  }
  const gGood = !gLive || garden.value < GARDEN_GOOD_MS;
  const sGood = !sLive || sky.value < SKY_GOOD_MS;
  if (gGood && sGood) {
    goodRun += 1;
    badRun = 0;
    const needed = UP_RUN * (1 + Math.min(MAX_FLAP_PENALTY, flaps[tier - 1] ?? 0));
    if (goodRun >= needed && tier > 0) setTier(tier - 1);
  } else {
    badRun = 0;
    goodRun = 0;
  }
}

function start() {
  if (timer || typeof window === "undefined" || frozen) return;
  timer = window.setInterval(evaluate, WINDOW_MS);
}

/** Garden draw-cost EMA (ms) — the number behind `window.__bbPerf`. */
export function reportGarden(emaMs: number) {
  boot();
  if (bootAt < 0) bootAt = now();
  garden = { value: emaMs, at: now() };
  start();
}

/** Sky 30-frame median (ms) — from SkyRenderer.sampleFrame. */
export function reportSky(medianMs: number) {
  boot();
  if (bootAt < 0) bootAt = now();
  sky = { value: medianMs, at: now() };
  start();
}

/** Current (animating) budget. Quantize at the consumer if a channel drives a
 *  discrete resource (canvas resize), so the fade walks in small real steps. */
export function state(): BudgetState {
  return { tier, ...channels() };
}

/** QA/verification hook: jump straight to a tier (still cross-faded). */
export function forceTier(next: number) {
  setTier(Math.min(TIERS.length - 1, Math.max(0, Math.round(next))));
}

/** Introspection for the QA harness (`window.__budget`). */
export function debug() {
  return {
    get tier() {
      return tier;
    },
    get flaps() {
      return [...flaps];
    },
    get garden() {
      return garden.value;
    },
    get sky() {
      return sky.value;
    },
    get frozen() {
      return frozen;
    },
    state,
    forceTier,
    TIERS,
  };
}

if (typeof window !== "undefined") {
  boot();
  (window as unknown as { __budget?: unknown }).__budget = { debug, state, forceTier, reportGarden, reportSky };
}
