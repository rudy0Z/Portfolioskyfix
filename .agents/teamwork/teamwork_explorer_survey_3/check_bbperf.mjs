import { chromium } from "file:///C:/Users/rudra/AppData/Local/Temp/pwqa/node_modules/playwright-core/index.mjs";

const exe = process.env.LOCALAPPDATA + "\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe";
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("console", (m) => console.log("[console]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

console.log("Navigating to 12:00 with #/...");
await page.goto("http://localhost:5199/?t=12:00&fast=1#/", { waitUntil: "networkidle" });

for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  const res = await page.evaluate(() => {
    return {
      bb: window.__bbPerf,
      budget: window.__budget ? window.__budget.state() : null,
      canvas: !!document.querySelector("canvas"),
      body: document.body.innerHTML.slice(0, 100),
    };
  });
  console.log(`t=${i + 1}s:`, res.bb, "budget:", res.budget?.tier, "canvas:", res.canvas);
  if (res.bb) break;
}

await browser.close();
