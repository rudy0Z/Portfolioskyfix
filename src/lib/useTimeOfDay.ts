"use client";

/**
 * useTimeOfDay — the single source of truth for sky time.
 *
 * A tiny external store (subscribe / getSnapshot / getServerSnapshot) so any
 * component can read the current fractional hour with `useSyncExternalStore`
 * and re-render only when it actually changes. The old CustomEvent API is kept
 * alive for backwards compatibility, but it is now an *output*, not the input.
 */

import { useEffect, useSyncExternalStore } from "react";
import {
  type TimeOfDay,
  type SkyTime,
  formatTime,
  localNow,
  parseTime,
  phaseAt,
  todToScenario,
} from "./timeOfDay";

export type SyncMode = "auto" | "manual";

let current: SkyTime = 12;
let syncMode: SyncMode = "manual";
let mounted = false;

const listeners = new Set<() => void>();

function emit() {
  if (typeof window === "undefined") return;
  // Legacy compatibility: existing consumers still listen for this event.
  window.dispatchEvent(
    new CustomEvent("timeofdaychange", {
      detail: { t: current, phase: phaseAt(current), label: formatTime(current) },
    }),
  );
  document.documentElement.setAttribute("data-scenario", todToScenario(phaseAt(current)));
  document.documentElement.style.setProperty("--sky-hour", String(current));
}

function notify() {
  listeners.forEach((fn) => fn());
  emit();
}

const wrap = (t: number) => ((t % 24) + 24) % 24;

/** Signed shortest way round the clock from `from` to `to`, in hours. */
export function shortestHours(from: number, to: number) {
  let d = (to - from) % 24;
  if (d > 12) d -= 24;
  if (d < -12) d += 24;
  return d;
}

/* ── motion ─────────────────────────────────────────────────────────────
 * Every interactive change goes through a critically damped spring, so the
 * sky glides instead of jumping. The spring runs on an *unwrapped* hour line:
 * the target is always placed the short way round from where the motion is
 * already heading, so dragging through midnight keeps going forward.
 */

type Motion =
  | { kind: "idle" }
  | { kind: "spring"; target: number; vel: number; omega: number }
  | { kind: "play"; rate: number };

let motion: Motion = { kind: "idle" };
let pos = current; // unwrapped position while animating
let raf = 0;
let lastTick = 0;

function tick(now: number) {
  const dt = Math.min(0.05, Math.max(0, (now - lastTick) / 1000));
  lastTick = now;

  if (motion.kind === "spring") {
    // exact step of a critically damped spring toward a fixed target
    const { omega, target } = motion;
    const x = pos - target;
    const e = Math.exp(-omega * dt);
    const k = (motion.vel + omega * x) * dt;
    motion.vel = (motion.vel - omega * k) * e;
    pos = target + (x + k) * e;
    if (Math.abs(pos - target) < 2e-4 && Math.abs(motion.vel) < 2e-3) {
      pos = target;
      motion = { kind: "idle" };
    }
  } else if (motion.kind === "play") {
    pos += motion.rate * dt;
  }

  current = wrap(pos);
  notify();
  raf = motion.kind === "idle" ? 0 : requestAnimationFrame(tick);
}

function run() {
  if (typeof window === "undefined" || raf) return;
  lastTick = performance.now();
  raf = requestAnimationFrame(tick);
}

function stopMotion() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  motion = { kind: "idle" };
}

/** Set the clock instantly. Passing `manual` (any interaction) stops auto-sync. */
export function setSkyTime(t: SkyTime, mode: SyncMode = "manual") {
  stopMotion();
  current = wrap(t);
  pos = current;
  syncMode = mode;
  notify();
}

export interface GlideOptions {
  /**
   * Spring stiffness (rad/s). ~20 tracks a finger, ~7 is a click-to-seek,
   * ~4 is a slow cinematic sweep.
   */
  omega?: number;
  mode?: SyncMode;
  duration?: number;
}

/** Glide to `t` the short way round the dial. Retargets smoothly mid-flight. */
export function glideSkyTime(t: SkyTime, { omega = 7, mode = "manual" }: GlideOptions = {}) {
  if (motion.kind !== "spring") {
    pos = current;
    motion = { kind: "spring", target: current, vel: 0, omega };
  }
  motion.target += shortestHours(wrap(motion.target), wrap(t));
  motion.omega = omega;
  syncMode = mode;
  notify();
  run();
}

/** Where the clock is heading (the spring target), or where it is. */
export function getSkyTarget(): SkyTime {
  return motion.kind === "spring" ? wrap(motion.target) : current;
}

/** Timelapse: advance at `rate` hours per second until something else moves the clock. */
export function playSkyTime(rate = 0.5) {
  if (motion.kind !== "play") pos = current;
  motion = { kind: "play", rate };
  syncMode = "manual";
  notify();
  run();
}

export function pauseSkyTime() {
  if (motion.kind === "play") stopMotion();
  notify();
}

export function isPlaying() {
  return motion.kind === "play";
}

/** Jump back to the visitor's real local time — gliding there. */
export function syncToLocalTime() {
  glideSkyTime(localNow(), { omega: 5, mode: "auto" });
}

export function getSkyTime(): SkyTime {
  return current;
}

export function getSyncMode(): SyncMode {
  return syncMode;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Client reads the live clock; the server snapshot is pinned to noon. */
function getSnapshot(): SkyTime {
  return current;
}

function getServerSnapshot(): SkyTime {
  return 12;
}

/**
 * Mount once: read URL overrides (useful for screenshots / sharing a moment),
 * otherwise take the visitor's local clock. While in `auto`, re-sync every 30s.
 */
function boot() {
  if (mounted || typeof window === "undefined") return;
  mounted = true;

  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get("t");
  const parsed = fromParam ? parseTime(fromParam) : null;

  if (parsed !== null) {
    current = parsed;
    syncMode = "manual";
  } else {
    current = localNow();
    syncMode = "auto";
  }
  pos = current;
  notify();

  window.setInterval(() => {
    if (syncMode === "auto" && motion.kind === "idle") {
      current = localNow();
      pos = current;
      notify();
    }
  }, 30_000);

  // Deep-link support: ?t=18:30 changed at runtime.
  window.addEventListener("popstate", () => {
    const p = new URLSearchParams(window.location.search).get("t");
    const v = p ? parseTime(p) : null;
    if (v !== null) setSkyTime(v, "manual");
  });
}

/** Live fractional hour, re-rendering subscribers on change. */
export function useSkyTime(): SkyTime {
  const t = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(boot, []);
  return t;
}

/** Legacy phase hook — derive from the continuous clock. */
export function useTimeOfDay(): TimeOfDay {
  return phaseAt(useSkyTime());
}

export function useSyncState(): { mode: SyncMode; time: string; playing: boolean } {
  const t = useSkyTime();
  return { mode: syncMode, time: formatTime(t), playing: motion.kind === "play" };
}
