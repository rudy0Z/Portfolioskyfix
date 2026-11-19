import test from "node:test";
import assert from "node:assert/strict";
import {
  SUNDIAL_GEOM,
  arcPoint,
  buildCombTicks,
  chromaticTickColor,
  hourToArcProgress,
  solarPhaseMeta,
  svgPointToHour,
} from "./sundialMath.ts";

test("hourToArcProgress maps East (06:00), Noon (12:00), West (18:00), and Midnight (00:00) accurately", () => {
  const east = hourToArcProgress(6);
  assert.equal(east.isDay, true);
  assert.equal(east.u, 0);

  const noon = hourToArcProgress(12);
  assert.equal(noon.isDay, true);
  assert.equal(noon.u, 0.5);

  const west = hourToArcProgress(18);
  assert.equal(west.isDay, true);
  assert.equal(west.u, 1);

  const midnight = hourToArcProgress(0);
  assert.equal(midnight.isDay, false);
  assert.equal(midnight.u, 0.5);
});

test("arcPoint places u=0 at East, u=0.5 at Zenith, u=1 at West", () => {
  const { cx, cy, radius } = SUNDIAL_GEOM;
  const pEast = arcPoint(0);
  assert.ok(Math.abs(pEast.x - (cx - radius)) < 1e-6);
  assert.ok(Math.abs(pEast.y - cy) < 1e-6);

  const pZenith = arcPoint(0.5);
  assert.ok(Math.abs(pZenith.x - cx) < 1e-6);
  assert.ok(Math.abs(pZenith.y - (cy - radius)) < 1e-6);

  const pWest = arcPoint(1);
  assert.ok(Math.abs(pWest.x - (cx + radius)) < 1e-6);
  assert.ok(Math.abs(pWest.y - cy) < 1e-6);
});

test("svgPointToHour round-trips with arcPoint across solar day and lunar night", () => {
  for (const h of [6.5, 9.25, 12.0, 16.5, 17.75]) {
    const { u, isDay } = hourToArcProgress(h);
    const pt = arcPoint(u);
    const back = svgPointToHour(pt.x, pt.y, isDay);
    assert.ok(Math.abs(back - h) < 0.01, `Expected ${h}, got ${back}`);
  }
  for (const h of [19.5, 22.0, 0.0, 3.5]) {
    const { u, isDay } = hourToArcProgress(h);
    const pt = arcPoint(u);
    const back = svgPointToHour(pt.x, pt.y, isDay);
    assert.ok(Math.abs(back - h) < 0.01, `Expected ${h}, got ${back}`);
  }
});

test("buildCombTicks returns 48 chromatic ticks with expected endpoints and active highlight", () => {
  const ticks = buildCombTicks(0.875, 48);
  assert.equal(ticks.length, 48);
  assert.equal(ticks[0].color, "#38bdf8");
  assert.equal(ticks[47].color, "#818cf8");
  assert.ok(ticks.some((t) => t.active), "Expected at least one tick near activeU to be highlighted");
  assert.equal(chromaticTickColor(0.36), "#fde047");
  assert.equal(chromaticTickColor(0.72), "#fb923c");
});

test("solarPhaseMeta classifies 16:30 as GOLDEN HOUR and 01:00 as NIGHT WATCH", () => {
  assert.equal(solarPhaseMeta(16.5).label, "GOLDEN HOUR");
  assert.equal(solarPhaseMeta(16.2).label, "GOLDEN HOUR");
  assert.equal(solarPhaseMeta(12.0).label, "HIGH DAYLIGHT");
  assert.equal(solarPhaseMeta(6.25).label, "DAWN BREAK");
  assert.equal(solarPhaseMeta(1.0).label, "NIGHT WATCH");
});
