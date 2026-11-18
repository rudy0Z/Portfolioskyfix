# Repository File Tracker & Necessity Audit
**Repository:** `D:\Portfolioskyfix` (`sky-field` v2.0 Stratosphere Edition)  
**Total Scanned:** 1,212 files · 805.32 MB (excluding `node_modules` and `.git`)  
**Audit Date:** November 19, 2026

---

## Executive Summary: Where the 805 MB Lives

```
┌───────────────────────────┬────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ Category / Directory      │ File Count │ Size (MB)   │ Git / Push Status & Recommendation                    │
├───────────────────────────┼────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ 1. Production Source (src)│ 79 files   │    1.20 MB  │ 🔴 CRITICAL — Must be pushed (Vite app runtime)        │
│ 2. Public Runtime Assets  │ 436 files  │   29.99 MB  │ 🔴 CRITICAL — Must be pushed (Fonts, covers, embeds)   │
│ 3. Master Prompts & Docs  │ 17 files   │    0.68 MB  │ 🔴 CRITICAL — Must be pushed (Configs, constitutions)   │
│ 4. Signature Blueprints   │ 22 files   │   15.65 MB  │ 🟡 ESSENTIAL BLUEPRINT — Must be pushed (Screenshots)  │
│ 5. Session Transcripts    │ 18 files   │    2.06 MB  │ 🔵 VALUABLE REFERENCE — Push / Keep (Text logs)        │
│ 6. Tooling & Test Scripts │ 22 files   │    0.20 MB  │ 🔵 LOCAL UTILITIES — Keep / Push                      │
│ 7. Automated Test Dumps   │ 441 files  │  663.23 MB  │ ⚫ BLOAT / DO NOT PUSH (640MB PNG/WebM dump in LFS)     │
│ 8. Video Frame Extractions│ 39 files   │    2.90 MB  │ ⚫ BLOAT / DO NOT PUSH (Individual JPG frames)          │
│ 9. Obsolete Archive Video │ 19 files   │    7.24 MB  │ ⚫ BLOAT / DO NOT PUSH (7MB old MP4 in archive)         │
│ 10. Agent & Scratch Logs  │ 47 files   │    0.21 MB  │ 🔵 LOCAL REFERENCE — Keep locally                     │
├───────────────────────────┼────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ TOTAL                     │ 1,212 files│  805.32 MB  │ 756 MB is unneeded media bloat; core app is < 48 MB!   │
└───────────────────────────┴────────────┴─────────────┴────────────────────────────────────────────────────────┘
```

> [!WARNING]
> **Git LFS Quota Risk:** GitHub provides **1 GB free LFS storage** and **1 GB bandwidth per month**. Pushing the 765 MB of automated test frame dumps (`reviews/2026-11-10/`) will consume ~80% of your total account quota in a single push. The core application and all signature blueprints require only **~48 MB**.

---

## Detailed Directory & File Inventory

### Tier 1: Production Core (Essential — Must Push)

| Path | Files | Size | Purpose & Role |
| :--- | :--- | :--- | :--- |
| **`src/App.tsx`** | 1 | 4 KB | Root orchestrator: mounts persistent sky, top nav, hash router, and views. |
| **`src/sections/`** | 5 | ~45 KB | Core layout sections: `Hero.tsx`, `HeroMist.tsx`, `GardenField.tsx`, `StackingProjects.tsx`, `HomeBeats.tsx`, `SiteFooter.tsx`. |
| **`src/components/`** | 8 | ~220 KB | Core UI components: `Header.tsx`, `NavigationNotch.tsx`, `TrackingFlower.tsx`, `TypeGardenLoader.tsx`, `ButterflyCursor.tsx`, `CelestialNight.tsx`. |
| **`src/components/originkit/BluebellPass.tsx`** | 1 | 152 KB | Canvas 2D multi-species meadow engine (Lupines, Cosmos, Poppies, Daisies, wind physics). |
| **`src/sky/`** | 7 | ~95 KB | WebGL2 volumetric raymarching sky, cloud shaders, and `ThermalSkyClock.tsx`. |
| **`src/caseStudies/`** | 5 | ~85 KB | Polymorphic case study data schemas: `sentinel.ts`, `lokai.ts`, `feul.ts`, `types.ts`, `index.ts`. |
| **`src/pages/`** | 5 | ~120 KB | Multi-page route views: `CaseStudyPage.tsx`, `AboutPage.tsx`, `ProjectsPage.tsx`, `JournalPage.tsx`, `ResumePage.tsx`. |
| **`src/lib/`** | 7 | ~65 KB | Central mathematical governors: `useTimeOfDay.ts`, `lighting.ts`, `skyPalette.ts`, `color.ts`, `heroClock.ts`, `frameBudget.ts`. |
| **`src/styles/`** | 3 | ~240 KB | Global styling tokens and reset: `global.css`, `case-reader.css`, `home-beats.css`. |
| **`public/`** | 436 | 29.99 MB | Production static assets: self-hosted webfonts (`JetBrains Mono`, `Inter`, `Fraunces`), `covers/*.webm`, `case/*` illustrations, `embed/*` standalone harnesses, and `resume.pdf`. |
| **Root Configs** | 9 | ~40 KB | `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `tailwind.config.js`, `.gitignore`, `.gitattributes`. |

---

### Tier 2: Master Blueprint & Visual Reference Ground Truth (Must Push)

These are the exact ground-truth files required for any human or AI to restore the signature UI:

| Path | Size | Description & Necessity |
| :--- | :--- | :--- |
| **`MASTER_RECOVERY_PROMPT.md`** | ~14 KB | **Master Prompt:** The complete A to Z recovery specification, design invariants, and implementation plan. |
| **`REPO_FILE_TRACKER.md`** | ~12 KB | **File Tracker:** This document, mapping all 1,212 files and their necessity. |
| **`AGENTS.md`** | ~6 KB | Single source of truth for AI assistants: architectural laws, zero-CLS constraints, math formulas. |
| **`GEMINI.md`** | ~3 KB | Quick reference & token-optimized context cheat-sheet. |
| **`ARCHITECTURE.md`** | ~4 KB | Architectural layer map and frame budget governor spec. |
| **`HANDOFF.md`** | ~8 KB | Extracted session handoff matrix from OpenCode recovery. |
| **`reviews/new-visual-hero.png`** | 4.02 MB | **Visual Ground Truth #1:** The Day Hero stage, centered frosted capsule nav, left frosted card. |
| **`reviews/new-visual-scroll-800.png`**| 4.08 MB | **Visual Ground Truth #2:** The Multi-Species Daytime Meadow (Lupines, Cosmos, Poppies, Daisies). |
| **`reviews/live-solar-dial-popover.png`**| 2.15 MB | **Visual Ground Truth #3:** The 180° Horizon Sundial Dome popover with live golden hour glow. |
| **`reviews/live-work-fresh.png`** | 2.49 MB | **Visual Ground Truth #4:** Interactive Case Studies header + Sentinel tactical mission console card. |
| **`reviews/traycer-session-3f46217e/components_source/`** | ~100 KB | **8 Recovered Component Templates:** Complete standalone HTML/CSS source code for Hero Card Option A/B, Horizon Sundial, TypeGarden Meadow Footer, Top Hub Capsule, and Section Header. |
| **`reviews/traycer-artifacts/blueprint/`** | ~11 KB | Frame-by-frame study of reference portfolios (Thoufik, Air, Pranshu, Pinkesh) and the Horizon Sundial remix spec. |
| **`reviews/traycer-artifacts/audit/`** | ~42 KB | The full interactive 24-issue audit report with severity classifications. |

---

### Tier 3: Local Audit Logs & Historical Transcripts (Keep Locally / Optional)

| Path | Files | Size | Description & Recommendation |
| :--- | :--- | :--- | :--- |
| **`reviews/traycer-session-3f46217e/`** | 6 | 1.05 MB | Full session transcripts and file change audits from the November 12 recovery session. *Keep locally.* |
| **`reviews/traycer-session-night-rebuild/`** | 4 | 0.90 MB | Transcripts from the nocturnal rebuild session. *Keep locally.* |
| **`reviews/findings_raw.js`** | 1 | 18 KB | Raw JavaScript array of the 24 verified codebase audit bugs. *Keep in Git.* |
| **`tools/`** | 15 | ~90 KB | Python patch utilities and analysis scripts (`repo_audit_scanner.py`, `scan_reviews.py`, `safepatch.py`). *Keep in Git.* |
| **`.agents/`** | 47 | 0.21 MB | Agent team briefing docs and scratch progress notes. *Keep locally.* |

---

### Tier 4: Media Bloat & Video Extraction Dumps (DO NOT PUSH TO GITHUB)

These files take **756+ MB** and represent raw automation frame dumps and obsolete video files. They should **NOT** be pushed to GitHub to protect your Git LFS quota:

| Path | Files | Size | Why It Should NOT Be Pushed |
| :--- | :--- | :--- | :--- |
| **`reviews/2026-11-10/`** | 411 | **640.01 MB** | **Automated Test Run Dump:** 393 full-resolution viewport PNGs and 11 WebM recordings generated during an automated headless test run. None are referenced by the website. |
| **`reviews/2026-11-07/`** | 30 | **23.22 MB** | Legacy design review screenshots from an earlier prototype sprint. |
| **`reviews/thoufik-reference/`** | 9 | **24.92 MB** | 4K full-page screenshots of `thoufik.space`. (The essential design takeaways are already synthesized in `blueprint/index.html`). |
| **`reviews/thoufik-video-frames/`** | 18 | **1.28 MB** | Frame-by-frame extracted JPG images from a reference video. |
| **`reviews/captures-frames/`** | 21 | **1.62 MB** | Frame-by-frame extracted JPG images from an old capture. |
| **`reviews/shots/`** | 17 | **14.48 MB** | Redundant crop dumps of earlier sky horizon passes. |
| **`archive/public/videos/designer-vintage-desk-loop.mp4`** | 1 | **6.50 MB** | Old video loop previously replaced by WebGL and canvas meadow rendering. |

---

## 4. Git LFS Hygiene: What to Push vs. What to Ignore

To ensure a fast, reliable GitHub repository that never hits bandwidth caps:

```gitignore
# Exclude heavy automated test dumps and raw video extractions from Git LFS:
reviews/2026-11-10/
reviews/2026-11-07/
reviews/thoufik-reference/
reviews/thoufik-video-frames/
reviews/captures-frames/
reviews/shots/
archive/public/videos/
```

By excluding these directories, your repository push size drops from **~805 MB down to ~48 MB**, while preserving 100% of your source code, components, master prompts, and high-fidelity reference screenshots.
