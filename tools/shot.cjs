const { chromium } = require("C:/Users/rudra/AppData/Roaming/npm/node_modules/playwright");

const OUT = "D:/Portfolioskyfix/reviews/shots";
const URL = "http://localhost:5173/";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

  async function shot(name, { t, scroll, wait = 2600 } = {}) {
    const url = t !== undefined ? `${URL}?t=${t}` : URL;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(wait);
    if (scroll) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      await page.waitForTimeout(1400);
    }
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log("shot:", name);
  }

  await shot("01-hero-midnight", { t: "01:00" });
  await shot("02-hero-dawn", { t: "06:25" });
  await shot("03-hero-noon", { t: "12:00" });
  await shot("04-hero-golden", { t: "17:45" });
  await shot("05-hero-exit-40", { t: "17:45", scroll: 0 });
  await shot("06-work", { t: "12:00", scroll: 1600 });
  await shot("07-beats", { t: "12:00", scroll: 4200 });
  await shot("08-faq-footer", { t: "17:45", scroll: 8200 });

  console.log("ERRORS:", JSON.stringify(errors, null, 2));
  await browser.close();
})();
