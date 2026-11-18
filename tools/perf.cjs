const { chromium } = require("C:/Users/rudra/AppData/Roaming/npm/node_modules/playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173/?t=17:45", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  // 1. Idle FPS at the hero
  const idle = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const tick = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(tick); else res(Math.round(n / ((performance.now() - t0) / 1000))); };
    requestAnimationFrame(tick);
  }));
  console.log("IDLE FPS (hero):", idle);

  // 2. FPS + frame times while scrolling through the hero exit
  const scroll = await page.evaluate(() => new Promise((res) => {
    const frames = [];
    let last = performance.now(); let y = 0; const max = document.querySelector(".hero").offsetHeight - window.innerHeight;
    const step = () => {
      const now = performance.now();
      frames.push(now - last); last = now;
      y += 28;
      window.scrollTo(0, y);
      if (y < max) requestAnimationFrame(step);
      else {
        frames.sort((a, b) => a - b);
        res({
          frames: frames.length,
          median: +frames[Math.floor(frames.length / 2)].toFixed(1),
          p95: +frames[Math.floor(frames.length * 0.95)].toFixed(1),
          worst: +frames[frames.length - 1].toFixed(1),
          over32ms: frames.filter((f) => f > 32).length,
        });
      }
    };
    requestAnimationFrame(step);
  }));
  console.log("SCROLL FRAME TIMES (hero exit):", JSON.stringify(scroll));

  // 3. FPS in the work section (glass cards over the live sky)
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(1500);
  const work = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const tick = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(tick); else res(Math.round(n / ((performance.now() - t0) / 1000))); };
    requestAnimationFrame(tick);
  }));
  console.log("IDLE FPS (work section):", work);

  // 4. Layer census — how many canvases / animated surfaces are alive
  const layers = await page.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas")].map((c) => ({
      cls: c.className || c.parentElement?.className || "?",
      size: `${c.width}x${c.height}`,
      cssSize: `${Math.round(c.getBoundingClientRect().width)}x${Math.round(c.getBoundingClientRect().height)}`,
    }));
    return {
      canvasCount: cs.length,
      canvases: cs,
      animatedEls: document.querySelectorAll('canvas, [class*="aurora"], [class*="celestial"], [class*="mote"], [class*="butterfly"]').length,
      filterAndBlur: [...document.querySelectorAll("*")].filter((e) => {
        const s = getComputedStyle(e);
        return (s.backdropFilter && s.backdropFilter !== "none") || (s.filter && s.filter !== "none");
      }).length,
    };
  });
  console.log("LAYER CENSUS:", JSON.stringify(layers, null, 2));

  // 5. What element paints the flat horizon band?
  const band = await page.evaluate(() => {
    const el = document.elementFromPoint(720, 475);
    const chain = [];
    let e = el;
    while (e && chain.length < 5) { chain.push(e.tagName + "." + (e.className || "")); e = e.parentElement; }
    return chain;
  });
  console.log("ELEMENT AT HORIZON BAND:", JSON.stringify(band, null, 2));

  await browser.close();
})();
