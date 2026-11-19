import test from "node:test";
import assert from "node:assert/strict";
import { getLight } from "./lighting";
import { computeMeadowGlow, computeMeadowGoldenRim } from "./diurnalBloom";
import {
  hourToPinAngle,
  pinAngleToHour,
  pinDialAtmosphere,
  solarPhaseMeta,
} from "../sky/sundialMath";
import {
  WORDMARK_PRESETS,
  buildWordmarkGarden,
  pickRandomWordmarkPreset,
  type GlyphSlot,
} from "../components/botanical/BotanicalWordmarkEngine";

test("meadow bloom is strictly 0 during bright morning, midday, and afternoon", () => {
  for (const hour of [8, 10, 12, 14.5, 16]) {
    const light = getLight(hour);
    assert.equal(
      computeMeadowGlow(light),
      0,
      `Expected 0 meadow bloom at ${hour}:00 (daylight=${light.daylight.toFixed(2)})`,
    );
  }
});

test("meadow bloom activates smoothly during pre-dawn, evening dusk, and night", () => {
  for (const hour of [4.5, 19.5, 23]) {
    const light = getLight(hour);
    const glow = computeMeadowGlow(light);
    assert.ok(
      glow > 0,
      `Expected nocturnal/twilight meadow bloom > 0 at ${hour}:00, got ${glow}`,
    );
  }
  assert.ok(
    computeMeadowGlow(getLight(23)) >= computeMeadowGlow(getLight(19.5)),
    "Deep night glow should be at least as strong as early dusk",
  );
});

test("golden rim lighting stays zero at midday and activates during golden hour", () => {
  assert.equal(computeMeadowGoldenRim(getLight(12.5)), 0);
  assert.ok(computeMeadowGoldenRim(getLight(18.25)) > 0);
});

test("PinUI solar horizon dial angle-to-hour round trip holds across 24h", () => {
  for (const hr of [0.5, 6.0, 12.0, 16.5, 22.5]) {
    const ang = hourToPinAngle(hr);
    const back = pinAngleToHour(ang);
    assert.ok(
      Math.abs(back - hr) < 0.05,
      `Expected round-trip within 0.05h for ${hr}, got ${back}`,
    );
  }
});

test("PinUI dial atmosphere adapts light/dark polarity cleanly across day and night", () => {
  assert.equal(pinDialAtmosphere(12.0).theme, "light");
  assert.equal(pinDialAtmosphere(16.5).theme, "light");
  assert.equal(pinDialAtmosphere(23.0).theme, "dark");
  assert.equal(pinDialAtmosphere(2.0).theme, "dark");

  assert.equal(solarPhaseMeta(16.5).label, "GOLDEN HOUR");
  assert.equal(solarPhaseMeta(12.5).label, "SOLAR NOON");
  assert.equal(solarPhaseMeta(23.0).label, "NIGHT");
});

test("BotanicalWordmarkEngine covers all 6 TypeGarden choreography presets and 4 meadow species", () => {
  const expected = ["breathe", "growWither", "scatter", "reach", "visitor", "gust"];
  assert.deepEqual([...WORDMARK_PRESETS], expected);

  const picked = new Set(expected.map((_, i) => pickRandomWordmarkPreset(i)));
  assert.equal(picked.size, 6);

  const slots: GlyphSlot[] = "Rudraksh".split("").map((_, i) => ({
    cx: 200 + i * 64,
    baseY: 220,
    topY: 130,
    w: 58,
    h: 90,
    delayMs: i * 80,
  }));

  const garden = buildWordmarkGarden(slots, 960, 320, {
    seed: 12345,
    preset: "gust",
    density: "footer",
  });

  assert.ok(garden.stems.length >= 6, "Expected weaving vine stems around Rudraksh");
  assert.ok(garden.blooms.length >= 6, "Expected meadow blooms around Rudraksh");
  const speciesSeen = new Set(garden.blooms.map((b) => b.species));
  assert.equal(speciesSeen.size, 4, "Expected all 4 meadow species (lupine, cosmos, poppy, daisy)");
});
