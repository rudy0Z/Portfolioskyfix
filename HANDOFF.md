# Sky Field Portfolio — Complete Rebuild & Sprint Handoff

> **Workspace (Real Disk):** `D:\Portfolioskyfix`  
> **Verification Status:** `npm run typecheck` (`0 errors`) · `npm run build` (`0 warnings`, clean split chunks)  
> **Location Invariant:** `Greater Noida, India · IST` (`SURAT 21°N` purged from live navigation)

---

## 1. Everything Completed & Saved on Disk (`D:\Portfolioskyfix`)

All primary sprint tasks (`Task 1`, `Task 2`, `Task 3`) plus the recruiter homepage sections and architectural safeguards have been rebuilt **directly inside `D:\Portfolioskyfix`** (not in a temporary worktree).

### A. Task 1 — Centered 920px Case Study Layout + Top Hub Capsule
* **Files:** `src/pages/CaseStudyPage.tsx`, `src/styles/case-reader.css`, `src/caseStudies/types.ts`, `src/caseStudies/index.ts`
* **Centered 920px Reading Stage:**
  * Replaced the asymmetrical layout with `.cs-col { max-width: 920px; margin-inline: auto; }` inside adaptive frosted editorial cards floating over the persistent 24-hour WebGL sky.
  * **Diurnal Theme Bridge (`src/lib/lighting.ts` + `src/styles/case-reader.css`):** `applyLight()` sets `html[data-sky-theme="light" | "dark"]` strictly from solar hour `t ∈ [0, 24)` (`06:25–18:05` warm frosted alabaster `#fcf9f3` + `#0f172a` slate ink; `18:05–06:25` obsidian mineral glass + `#f7f5ef` ivory ink). Fixed the dark-on-dark active pill contrast bug from the previous session's screenshots.
* **State 1 (Top of Case Study — Above `#case-walkthrough`):**
  * Tagline (`FLYTBASE SENTINEL · AUTONOMOUS AERIAL COMMAND`), Display Heading (`Plus Jakarta Sans` + `Instrument Serif` italic accent), Hook subtext, 4-cell Recruiter Metadata Grid, and Pervasive Honesty Boundary disclosure.
  * **Upfront 6-Chapter Overview Grid:** Displays all 6 chapters (`01`–`06`) immediately above `#case-walkthrough` with one-click smooth scroll.
  * **`#case-walkthrough` (16:9 Zero-CLS Glass Slot):** Explicit `aspect-ratio: 16 / 9` stage with poster frame, live running-console `.webm` preview toggle (`/covers/<slug>-cover.webm`), fold cue, and direct `Launch Full Prototype ↗` button.
* **State 2 (Sticky Floating Frosted Top Hub Capsule):**
  * Automatically folds the 6 chapters into `[ ← Work | #3 · 90-second verification gate ▾ | Full Prototype ↗ | 17:45 ]` as soon as `#case-walkthrough` scrolls past the top threshold.
  * **Chapter Dropdown:** Opens on **hover or click** (with 170ms hover-intent smoothing + `Escape` / outside-click dismissal) with live rAF scroll-spy tracking (`✓` completed, `●` active).
  * **`Full Prototype ↗` Veil Modal:** Opens `public/embed/sentinel/harness.html` (or LokAI / Feul builds) inside an expanded `.veil-modal` with scenario quick-jump pills in the modal header.
  * **Live Solar Clock Pill (`17:45`):** Reads `useSkyTime()` and toggles the interactive `ThermalSkyClock` horizon popover directly beneath the capsule.
  * **Homepage Header De-duplication (`src/App.tsx`):** Hides `<Header />` on case study routes so only the unified Top Hub Capsule occupies the top chrome.

### B. Task 2 — Sentinel Interactive Prototype Stage (Chapter 03)
* **Files:** `src/pages/CaseStudyPage.tsx` (`SentinelVerificationStage`), `src/caseStudies/sentinel.ts`
* **Scenario Toggles:**
  * `Hotspot +620°C (Active Ignition)` vs. `Timeout / False Alert Reverted`.
* **Console HUD Telemetry:**
  * **Live 90s Countdown (`00:42`):** Initializes at `00:42`, gently starts ticking after entering viewport (respecting `prefers-reduced-motion`), with `⏸/▶` pause/resume, `Test 00:00 Lapse`, and `↺ Reset 00:42 Gate` controls.
  * **Dual Sensor Viewports (Explicit `16 / 10` Zero-CLS):** Side-by-side **RGB Electro-Optical (`FT-01 Kite · MEA`)** and **FLIR Long-Wave Infrared (`8–14μm · +620°C Crown Ignition` vs. `Plot AU-2214 Permitted Burn`)** feeds with targeting reticles.
  * **Mutual Aid Packet & Primary CTA:** Pre-staged CalFire + County Sheriff WEA (`OWNED + REQ`) status bar and tactile green **`[1] Authorize Mutual Aid ↵`** button.
* **Live Three.js Harness Integration:**
  * Embeds `public/embed/sentinel/harness.html` right inside the stage, dynamically syncing scenarios (`?situation=wui-breakout&phase=D` vs. `?situation=falsepos`) and calling `contentWindow.player.authorize()` live when `Authorize Mutual Aid` is clicked.

### C. Harmonized All 3 Case Studies + Homepage Recruiter Upgrades + Clean Bundle
* **LokAI & Feul Upgraded (`src/caseStudies/lokai.ts`, `src/caseStudies/feul.ts`):** Migrated onto the exact 6-chapter schema with upfront overview grids, `#case-walkthrough` WebM preview slots, explicit `aspectRatio` Zero-CLS plates, and live embedded prototypes (`/embed/lokai/index.html`, `/embed/feul/index.html?embed=1`).
* **Early-Career Recruiter Sections (`src/sections/HomeBeats.tsx`, `src/styles/home-beats.css`):** Added **Craft in Action (`#craft`)** (1-click 4-state solar tester: `Dawn 06:25`, `Noon 12:00`, `Golden 17:45`, `Midnight 01:00`) + **What I Can Own From Week One** (3 ownership pillars).
* **Pervasive Honesty & Clean Routing (`src/router/Router.tsx`, `src/components/navigation/NavigationNotch.tsx`, `src/sections/SiteFooter.tsx`, `public/resume.pdf`):**
  * Unlinked unauthored secondary pages (`AboutPage`, `ProjectsPage`, `JournalPage`, `ResumePage` containing placeholder stock photos / unverified claims) from live navigation and redirected legacy paths safely to homepage anchors.
  * Added canonical `/projects/:slug` and `/projects/:slug/e` route aliases alongside `/case/:slug`.
  * Generated a clean, verified placeholder `public/resume.pdf` so `Resume PDF ↗` links never 404.
* **Bundle & CSS Hygiene (`src/sections/GardenField.tsx`, `src/App.tsx`, `src/styles/global.css`):**
  * Bypassed the `@/components/originkit` barrel import (dropping transformed modules from `493 → 54`) and lazy-split routes (`CaseStudyPage` in its own `21.9 kB` gzipped chunk, zero Vite chunk warnings).
  * Zero hardcoded hex colors in new/updated `.tsx` components; replaced legacy `transition: all` rules in `.tsc-*` with explicit property lists.

---

## 2. What Remains Left (Post-Sprint / Optional Follow-Ups)

1. **Commit Your Work Immediately in Git (`D:\Portfolioskyfix`):**
   * Everything is saved on disk in `D:\Portfolioskyfix`, but uncommitted in git. Run:
     ```powershell
     cd D:\Portfolioskyfix
     git add -A
     git commit -m "feat: centered 920px case reader, top hub capsule, sentinel stage, diurnal system"
     ```
2. **Final Narrated 45s Motion Reels (Content Asset Swap):**
   * `#case-walkthrough` currently previews the real looping build captures (`/covers/sentinel-cover.webm`, `lokai-cover.webm`, `feul-cover.webm`) and labels the 45s narrated cut honestly. Once your final exported `.mp4`/`.webm` reels are ready, drop their paths into `blocks[0].src` inside `sentinel.ts`, `lokai.ts`, and `feul.ts`.
3. **Final Designed Resume PDF Swap:**
   * Replace `public/resume.pdf` with your final typeset CV export whenever ready (all Hero, Nav, and Footer links already point to `/resume.pdf`).
4. **Legacy Test Suite Alignment & Unused File Pruning (Optional Housekeeping):**
   * `tests/e2e/tier1-features.test.mjs` still asserts archived v1 files (`HeroIsland.tsx`, `SokoviaKeelThrusters`, `ExcavationCraterFooter.tsx`, `Surat`). Updating Tier 1 assertions to match the v2 Stratosphere / Centered Case Reader architecture — and optionally deleting unused legacy files (`src/pages/AboutPage.tsx`, `ResumePage.tsx`, `JournalPage.tsx`, `ProjectsPage.tsx`, unused `originkit/*` shaders) — can be done anytime after your git commit.
5. **Optional Footer / Sky Dialer V2 Explorations (From Previous Chat Ideas):**
   * `SiteFooter.tsx` currently ships the clean Aurora `"Say hello."` pavilion, and `ThermalSkyClock.tsx` ships the parabolic horizon comet instrument. If you later want the interactive `TypeGarden` `"Rudraksh"` playground footer or 96-pin Horizon Dome dialer explored in the earlier brainstorm, they can be layered onto a separate git branch safely without risking the main build.

---

## 3. Quick Run & Verification Commands

```powershell
cd D:\Portfolioskyfix
npm run typecheck   # 0 errors
npm run build       # Clean production build in dist/
npm run dev         # Live dev server at http://localhost:5173/
```
