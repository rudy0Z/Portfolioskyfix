// bench_all_hours.mjs — Comprehensive empirical render & FrameBudget benchmark
import { chromium } from "file:///C:/Users/rudra/AppData/Local/Temp/pwqa/node_modules/playwright-core/index.mjs";
import { writeFileSync } from "node:fs";

const exe = process.env.LOCALAPPDATA + "\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe";
const base = "http://localhost:5199";
const results = [];

const hours = ["12:00", "17:45", "18:30", "20:30", "23:30"];

const browser = await chromium.launch({ executablePath: exe });

async function benchHour(hour, budgetMode = "on") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);

  const url = `${base}/?t=${encodeURIComponent(hour)}&fast=1${budgetMode === "off" ? "&budget=off" : ""}`;
  console.log(`\nBenchmarking: ${hour} (budget: ${budgetMode}) -> ${url}`);

  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.__bbPerf && window.__bbPerf.length > 0, null, { timeout: 120000 });

  // Settle at rest for 8s
  await page.waitForTimeout(8000);

  const getMetrics = async (phase) => {
    return await page.evaluate((ph) => {
      const budget = window.__budget ? window.__budget.state() : null;
      const dbg = window.__budget && window.__budget.debug ? window.__budget.debug() : null;
      return {
        phase: ph,
        scrollY: Math.round(window.scrollY),
        perf: window.__bbPerf || "(empty)",
        tier: budget ? budget.tier : null,
        gardenCap: budget ? budget.garden : null,
        skyCap: budget ? budget.sky : null,
        shafts: budget ? budget.shafts : null,
        ripple: budget ? budget.ripple : null,
        flaps: dbg ? dbg.flaps : [],
        gardenRaw: dbg && isFinite(dbg.garden) ? +dbg.garden.toFixed(2) : null,
        skyRaw: dbg && isFinite(dbg.sky) ? +dbg.sky.toFixed(2) : null,
      };
    }, phase);
  };

  const restMetrics = await getMetrics("rest");

  // Wake phase: move mouse across the field
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(400 + i * 100, 650);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(3000);
  const wakeMetrics = await getMetrics("wake");

  // Exit scroll sequence
  const exitMetrics = [];
  for (const y of [600, 900, 1200, 1500, 1800]) {
    await page.evaluate((val) => window.scrollTo(0, val), y);
    await page.waitForTimeout(2500);
    exitMetrics.push(await getMetrics(`exit_y${y}`));
  }

  const record = {
    hour,
    budgetMode,
    rest: restMetrics,
    wake: wakeMetrics,
    exit: exitMetrics,
  };

  results.push(record);
  console.log(`[${hour}] REST: ${restMetrics.perf} (Tier ${restMetrics.tier}, shafts: ${restMetrics.shafts})`);
  console.log(`[${hour}] WAKE: ${wakeMetrics.perf} (Tier ${wakeMetrics.tier}, shafts: ${wakeMetrics.shafts})`);
  console.log(`[${hour}] EXIT y=1200: ${exitMetrics[2].perf} (Tier ${exitMetrics[2].tier})`);
  console.log(`[${hour}] EXIT y=1800: ${exitMetrics[4].perf} (Tier ${exitMetrics[4].tier})`);

  await context.close();
}

for (const h of hours) {
  await benchHour(h, "on");
}

// Also test 18:30 with budget=off for direct A/B comparison
await benchHour("18:30", "off");

await browser.close();

const outPath = "d:/Portfolioskyfix/.agents/teamwork/teamwork_explorer_survey_3/bench_results.json";
writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nAll benchmarks complete! Written to ${outPath}`);
