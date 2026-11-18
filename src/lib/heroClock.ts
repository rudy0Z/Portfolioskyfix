/**
 * heroClock — the one master timeline of the hero exit (hero plan §6.2).
 *
 * Hero's scroll rAF writes the raw progress `p` (0 at rest, 1 when the pinned
 * stage has travelled its 85 vh) plus the eased sky `lift` derived from it;
 * PhotoSky reads both in its render loop so the cloud lift thickens on the
 * SAME clock the garden dissolves on — the three unsynced clocks (garden --p,
 * raw-scrollY sky lift, copy fade) become one.
 *
 * `active` is true only while the Hero (home route) is mounted; everywhere
 * else the sky falls back to its own raw-scroll behaviour.
 */

export const heroClock = {
  /** Raw exit progress, 0..1 (matches the stage's `--p`). */
  p: 0,
  /** Eased camera lift for the cloud deck, 0..1 — easeInOut(p), held at 1. */
  lift: 0,
  /** True while the hero owns the timeline (home route). */
  active: false,
};

/** `?lite=exit` — bisect flag: restores the pre-rework exit (old mask + late
 *  linear fade + raw-y sky lift, no mist) for A/B. Named value so the plain
 *  `?lite` and `?lite=sky` semantics stay untouched. */
export const EXIT_LITE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("lite") === "exit";
