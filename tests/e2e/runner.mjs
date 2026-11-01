#!/usr/bin/env node

/**
 * Sky Portfolio — E2E Master Test Runner
 * Executes Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner Cases),
 * Tier 3 (Cross-Feature Combinations), and Tier 4 (Real-World Scenarios).
 */

import { performance } from "node:perf_hooks";
import { testSuites } from "./harness.mjs";

// ANSI color codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

async function main() {
  const startTime = performance.now();

  console.log("");
  console.log(`${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║              SKY PORTFOLIO — 4-TIER E2E TEST RUNNER              ║${RESET}`);
  console.log(`${BOLD}${CYAN}║     Opaque-Box Requirement Verification (R1, R2, R3, F1-F11)     ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════════╝${RESET}`);
  console.log("");

  // Import all test suites
  await import("./tier1-features.test.mjs");
  await import("./tier2-boundaries.test.mjs");
  await import("./tier3-cross-feature.test.mjs");
  await import("./tier4-scenarios.test.mjs");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  const tierStats = {
    "Tier 1": { total: 0, passed: 0, failed: 0 },
    "Tier 2": { total: 0, passed: 0, failed: 0 },
    "Tier 3": { total: 0, passed: 0, failed: 0 },
    "Tier 4": { total: 0, passed: 0, failed: 0 },
  };

  for (const suite of testSuites) {
    // Determine tier
    let tierKey = "Tier 1";
    if (suite.name.startsWith("Tier 2")) tierKey = "Tier 2";
    else if (suite.name.startsWith("Tier 3")) tierKey = "Tier 3";
    else if (suite.name.startsWith("Tier 4")) tierKey = "Tier 4";

    console.log(`${BOLD}${MAGENTA}▶ ${suite.name}${RESET}`);

    for (const test of suite.tests) {
      totalTests++;
      tierStats[tierKey].total++;
      const testStart = performance.now();

      try {
        await test.fn();
        const duration = (performance.now() - testStart).toFixed(2);
        passedTests++;
        tierStats[tierKey].passed++;
        console.log(`  ${GREEN}✓${RESET} ${test.name} ${DIM}(${duration}ms)${RESET}`);
      } catch (err) {
        const duration = (performance.now() - testStart).toFixed(2);
        failedTests++;
        tierStats[tierKey].failed++;
        console.log(`  ${RED}✗${RESET} ${test.name} ${DIM}(${duration}ms)${RESET}`);
        console.log(`    ${RED}${err.message}${RESET}`);
        failures.push({
          suite: suite.name,
          test: test.name,
          error: err,
        });
      }
    }
    console.log("");
  }

  const totalDuration = (performance.now() - startTime).toFixed(2);

  console.log(`${BOLD}──────────────────────────────────────────────────────────────────${RESET}`);
  console.log(`${BOLD}TEST EXECUTION SUMMARY${RESET}`);
  console.log(`${BOLD}──────────────────────────────────────────────────────────────────${RESET}`);

  for (const [tier, stats] of Object.entries(tierStats)) {
    const statusColor = stats.failed === 0 ? GREEN : RED;
    console.log(
      `  ${BOLD}${tier.padEnd(8)}:${RESET} ${statusColor}${stats.passed}/${stats.total} passed${RESET} ${
        stats.failed > 0 ? `(${RED}${stats.failed} failed${RESET})` : ""
      }`
    );
  }

  console.log(`${BOLD}──────────────────────────────────────────────────────────────────${RESET}`);
  console.log(
    `  ${BOLD}Total Tests:${RESET} ${totalTests} | ${GREEN}${passedTests} passed${RESET} | ${
      failedTests > 0 ? RED : GREEN
    }${failedTests} failed${RESET}`
  );
  console.log(`  ${BOLD}Total Time :${RESET} ${totalDuration}ms`);
  console.log(`${BOLD}──────────────────────────────────────────────────────────────────${RESET}`);
  console.log("");

  if (failures.length > 0) {
    console.log(`${BOLD}${RED}FAILURES DETAIL (${failures.length}):${RESET}`);
    for (let i = 0; i < failures.length; i++) {
      const f = failures[i];
      console.log(`\n${i + 1}) [${f.suite}] ${f.test}`);
      console.log(`   ${RED}${f.error.stack || f.error.message}${RESET}`);
    }
    console.log("");
    process.exit(1);
  } else {
    console.log(`${BOLD}${GREEN}✔ ALL 4 TIERS PASSED WITH 100% SUCCESS.${RESET}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("FATAL RUNNER ERROR:", err);
  process.exit(1);
});
