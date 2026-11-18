const { chromium } = require("C:/Users/rudra/AppData/Roaming/npm/node_modules/playwright");
const OUT = "D:/Portfolioskyfix/reviews/shots";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const [name, t] of [["dawn", "06:25"], ["noon", "12:00"], ["mid", "01:00"]]) {
    await page.goto(`http://localhost:5173/?t=${t}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    // horizon band region
    await page.screenshot({ path: `${OUT}/crop-horizon-${name}.png`, clip: { x: 0, y: 380, width: 1440, height: 200 } });
    // sky top-left cloud region
    await page.screenshot({ path: `${OUT}/crop-cloud-${name}.png`, clip: { x: 0, y: 0, width: 720, height: 300 } });
    // hero copy region
    await page.screenshot({ path: `${OUT}/crop-copy-${name}.png`, clip: { x: 40, y: 460, width: 700, height: 220 } });
  }

  // Sample the garden canvas pixels at the same coords across times to test
  // whether the meadow actually relights.
  const samples = {};
  for (const t of ["01:00", "06:25", "12:00", "17:45"]) {
    await page.goto(`http://localhost:5173/?t=${t}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    samples[t] = await page.evaluate(() => {
      const c = document.querySelector(".garden-field canvas");
      if (!c) return "NO CANVAS";
      const g = document.createElement("canvas");
      g.width = c.width; g.height = c.height;
      g.getContext("2d").drawImage(c, 0, 0);
      const ctx = g.getContext("2d");
      const pick = (x, y) => {
        const d = ctx.getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1).data;
        return `${d[0]},${d[1]},${d[2]}`;
      };
      return {
        size: `${c.width}x${c.height}`,
        fieldMid: pick(0.5, 0.72),
        fieldNear: pick(0.3, 0.9),
        flowerArea: pick(0.72, 0.78),
        skyAboveHorizon: pick(0.2, 0.3),
      };
    });
  }
  console.log("GARDEN CANVAS SAMPLES:", JSON.stringify(samples, null, 2));

  // Contrast of hero lede text against its actual painted backdrop
  await page.goto("http://localhost:5173/?t=12:00", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const contrast = await page.evaluate(() => {
    const el = document.querySelector(".hero-lede");
    const r = el.getBoundingClientRect();
    return {
      ledeColor: getComputedStyle(el).color,
      ledeShadow: getComputedStyle(el).textShadow,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      scrimOpacity: getComputedStyle(document.querySelector(".hero-stage"), "::before").opacity,
    };
  });
  console.log("LEDGE STYLE:", JSON.stringify(contrast, null, 2));

  // Does a moon render at noon?
  await page.goto("http://localhost:5173/?t=12:00", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const moon = await page.evaluate(() => {
    const m = document.querySelector(".sky-moon") || document.querySelector("[class*=moon]");
    if (!m) return "no .sky-moon element";
    const cs = getComputedStyle(m);
    const r = m.getBoundingClientRect();
    return { opacity: cs.opacity, display: cs.display, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
  });
  console.log("MOON AT NOON:", JSON.stringify(moon, null, 2));

  await browser.close();
})();
