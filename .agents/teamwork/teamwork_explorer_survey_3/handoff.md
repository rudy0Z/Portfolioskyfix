# Handoff Report — Performance & Benchmark Audit

**Agent**: Explorer 3 (Performance & Benchmark Auditor)  
**Date**: 2026-11-10T22:35:00Z  
**Workspace**: `d:\Portfolioskyfix`  
**Status**: HARD HANDOFF (Task Complete)

---

## 1. Observation

### 1.1 Production Build & Typecheck
- **Typecheck Command**: `npm run typecheck` (`tsc --noEmit`)
  - **Exit Status**: 0 (Clean)
  - **Duration**: 12.85s (12,849 ms)
  - **Verbatim Output**:
    ```
    > sky-field@0.1.0 typecheck
    > tsc --noEmit
    ```
    Zero errors, zero warnings.

- **Production Build Command**: `npm run build` (`tsc -b && vite build`)
  - **Exit Status**: 0 (Clean)
  - **Total Duration**: 18.90s (18,898 ms); Vite client bundling phase: 6.58s (493 modules transformed).
  - **Verbatim Output**:
    ```
    vite v8.3.5 building client environment for production...
    transforming...
    ✓ 493 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                                                     0.65 kB │ gzip:   0.40 kB
    dist/assets/jetbrains-mono-vietnamese-wght-normal-Bt-aOZkq.woff2    7.50 kB
    dist/assets/jetbrains-mono-greek-wght-normal-Bw9x6K1M.woff2         9.00 kB
    dist/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2            10.25 kB
    dist/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2             11.23 kB
    dist/assets/fraunces-vietnamese-wght-normal-CnvboYUG.woff2         11.57 kB
    dist/assets/jetbrains-mono-cyrillic-wght-normal-D73BlboJ.woff2     12.10 kB
    dist/assets/jetbrains-mono-latin-ext-wght-normal-DBQx-q_a.woff2    15.19 kB
    dist/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2              18.74 kB
    dist/assets/inter-greek-wght-normal-CkhJZR-_.woff2                 18.99 kB
    dist/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2          25.96 kB
    dist/assets/fraunces-latin-ext-wght-normal-Ca2vKHc0.woff2          33.58 kB
    dist/assets/fraunces-latin-wght-normal-ukD16Tqj.woff2              36.62 kB
    dist/assets/jetbrains-mono-latin-wght-normal-B9CIFXIH.woff2        40.40 kB
    dist/assets/inter-latin-wght-normal-Dx4kXJAl.woff2                 48.25 kB
    dist/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2             85.06 kB
    dist/assets/index-D6vAJHcW.css                                    220.30 kB │ gzip:  39.70 kB
    dist/assets/index-C5lcPMnm.js                                     551.26 kB │ gzip: 183.23 kB

    [plugin builtin:vite-reporter] 
    (!) Some chunks are larger than 500 kB after minification. Consider:
    - Using dynamic import() to code-split the application
    - Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
    - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
    ✓ built in 6.58s
    ```

### 1.2 Bundle Size Inventory & Comparison
- **Client Application Core Assets (`dist/assets/`)**:
  - `dist/index.html`: 656 B (0.65 kB raw, 0.40 kB gzip)
  - `dist/assets/index-C5lcPMnm.js`: 551,262 B (551.26 kB raw, 183.23 kB gzip)
  - `dist/assets/index-D6vAJHcW.css`: 220,303 B (220.30 kB raw, 39.70 kB gzip)
  - Total Critical Initial Payload: 772,221 B (772.21 kB raw, 223.33 kB gzip)
  - Fonts: 14 variable font subsets totaling 384.44 kB (393,668 B), loaded on-demand per `unicode-range`.
- **Media & Cover Assets (`dist/covers/`)**:
  - `sentinel-cover.webm`: 647,215 B (647.22 kB, VP9, 1280×720, 25fps)
  - `lokai-cover.webm`: 190,624 B (190.62 kB, VP9, 1170×810, 25fps)
  - `feul-cover.webm`: 186,664 B (186.66 kB, VP9, 1092×756, 25fps)
  - All 3 covers pass the <= 2.5 MB budget cap with a total size of 1.02 MB.
- **Case Study Static Assets (`dist/case/`)**:
  - 18 high-resolution PNGs totaling ~13.6 MB (largest: `dist/case/feul/signature.png` at 2.36 MB, `standby.png` at 1.38 MB, `detect.png` at 1.35 MB, `falsepos.png` at 1.28 MB, `plan-gate.png` at 1.27 MB, `revision.png` at 1.23 MB, `contain-notify.png` at 1.12 MB).
- **Interactive Embed Sub-Applications (`dist/embed/`)**:
  - Static embed applications total ~13.2 MB (`sentinel` 2.5 MB, `lokai` 5.5 MB, `feul` 5.2 MB).
- **Historical Comparison against `reviews/2026-11-10/ship-audit.md`**:
  | Asset | Historical (`ship-audit.md`) | Current Build | Delta |
  |---|---|---|---|
  | JS Bundle | 550.83 kB (gzip 183.21 kB) | 551.26 kB (gzip 183.23 kB) | +0.43 kB (+0.02 kB gzip) |
  | CSS Bundle | 219.66 kB (gzip 39.59 kB) | 220.30 kB (gzip 39.70 kB) | +0.64 kB (+0.11 kB gzip) |
  | HTML | 0.65 kB (gzip 0.40 kB) | 0.65 kB (gzip 0.40 kB) | 0 kB |
  | Fonts | ~400 kB woff2 lazy | ~384 kB woff2 lazy | Stable |
  | Covers | 647 / 191 / 187 kB WebM | 647.2 / 190.6 / 186.7 kB WebM | Verified identical |

### 1.3 Repository Test & Benchmark Scripts
- **`npm run test` (`node tests/e2e/runner.mjs`)**:
  - Exited with code 1. Output revealed 30 test failures out of 4 tiers.
  - Failures were caused by obsolete assumptions looking for removed pre-pipeline components:
    - `ExcavationCraterFooter.tsx must exist`
    - `CompactAudioPlayer.tsx must exist`
    - `AtmosphericHeader.tsx must exist`
    - `ThermalSkyClock must define PAN_DISTANCE = 22 for LensClock signature pan`
- **`tests/stress/adversarial-stress.mjs`**:
  - Exited with code 0 (9 passed, 1 failed on deleted `CompactAudioPlayer.tsx`).
  - Proved flower cursor tracking math is mathematically robust: clamped R <= 4.5px, 10,000 random coordinates produced 0 NaN values.
  - Proved scroll flutter without hysteresis deadband at 60px flips state churn on micro-scroll.

### 1.4 Empirical Render & Runtime Performance Measurements
Captured via live Playwright headless Chromium execution (`C:\Users\rudra\AppData\Local\Temp\pwqa\p12perf.mjs`) on `http://localhost:5199`:
- **Golden Hour (17:45, Default FrameBudget)**:
  - `[rest 0]`: `draw 10.5ms · q 1.00 · 30fps · tier 0` (sky median: 121.2ms)
  - `[rest 1]`: `draw 12.2ms · q 0.80 · 30fps · tier 0` (sky median: 121.1ms)
  - `[rest 2]`: `draw 5.8ms · q 0.60 · 30fps · tier 2` (sky median: 72.8ms)
  - `[rest 3]`: `draw 5.8ms · q 0.60 · 30fps · tier 5` (sky median: 54.5ms)
  - `[wake 0]`: `draw 8.5ms · q 0.60 · 60fps · tier 7` (pointer sweep wake)
  - `[exit y=600]`: `draw 5.4ms · q 0.60 · 30fps · tier 7` (sky: 18.1ms)
  - `[exit y=900]`: `draw 6.2ms · q 0.60 · 30fps · tier 7` (sky: 12.1ms)
  - `[exit y=1200]`: `draw 7.9ms · q 0.60 · 30fps · tier 7` (sky: 24.2ms)
  - `[exit y=1500]`: `draw 6.0ms · q 0.60 · 30fps · tier 7` (sky: 12.2ms)
  - `[after handoff y=1800]`: `draw 6.0ms · q 0.60 · 30fps · tier 7` (sky: 6.0ms — cloud march skip active)
- **Golden Hour (17:45, `?budget=off` A/B Comparison)**:
  - `[rest 0]`: `draw 11.0ms · q 1.00 · 30fps · tier 0` (sky: 103.1ms)
  - `[rest 1]`: `draw 6.6ms · q 0.80 · 30fps · tier 0` (sky: 24.1ms)
  - `[rest 2]`: `draw 7.6ms · q 0.80 · 30fps · tier 0` (sky: 18.3ms)
- **Twilight Hour (18:30, Default FrameBudget, Software-GL Under Sustained Session Load)**:
  - Opened at tier 7 via `sessionStorage` (`bb.budget.v1` restored).
  - Software-GL draw EMA: 20.3ms to 55.0ms (historical real-hardware baseline recorded in Phase 7/8 was 4.1ms to 4.3ms).

---

## 2. Logic Chain

1. **Build & Type Safety Chain**:
   - `npm run typecheck` returned exit code 0 in 12.85s with no errors or warnings (Obs 1.1).
   - `npm run build` completed in 18.90s, generating clean bundles and assets with exit code 0 (Obs 1.1).
   - Therefore, the codebase is structurally and synthetically type-safe without compilation defects.

2. **Bundle Architecture & Payload Chain**:
   - `dist/assets/index-C5lcPMnm.js` measures 551.26 kB uncompressed and 183.23 kB gzip (Obs 1.2).
   - Vite issued `(!) Some chunks are larger than 500 kB after minification` because all 7 pages (`/`, `/about`, `/projects`, `/journal`, `/resume`, `/404`, `/case/*`) and all libraries (`three`, `motion`, `react`) are imported synchronously in `src/App.tsx` and `src/router/Router.tsx` without dynamic `import()` or `React.lazy` (Obs 1.1, Obs 1.2).
   - However, the gzip payload is only 183.23 kB (+0.02 kB over baseline), and fonts are split across 14 discrete files downloaded only when unicode characters are rendered.
   - Therefore, the bundle size is stable and manageable on wire transfer, but lacks route-level code splitting.

3. **Runtime Performance & FrameBudget Governor Chain**:
   - When the page loads at 17:45 in software-GL mode, the sky frame duration reports high (>26ms) (Obs 1.4).
   - In response, `frameBudget.ts` activates its down-step logic: after 3 bad windows, it steps tier 0 → 2 → 5 → 7 (Obs 1.4).
   - Tier 7 caps `BluebellPass` bake quality at 0.60, disables WebGL shafts (`shafts: 0`), and caps sky scale at 0.28.
   - Consequently, Bluebell draw EMA drops from 10.5ms down to 5.8ms at rest, and stays between 5.4ms and 7.9ms across the entire hero exit scroll (y=600 to y=1500), successfully satisfying the `< 8ms` budget target (Obs 1.4).
   - Beyond the hero exit (`y >= 1800`), `PhotoSky.tsx` activates `cloudSkip`, cutting sky compute time down to 6.0ms (Obs 1.4).
   - Therefore, the FrameBudget coordinator, internal governors, and cadence decimation work in tandem to hold frame budgets under stress.

4. **Health & Regression Categorization Chain**:
   - **Good Changes**:
     - FrameBudget 8-tier hysteresis ladder (`src/lib/frameBudget.ts`): Prevents dual-canvas GPU thrashing.
     - Epsilon+Gap Relight (`src/sections/GardenField.tsx`): Eliminates arbitrary 10-minute timer bakes; bakes only when delta > 0.015 and gap >= 450ms.
     - IntersectionObserver Cover Decoders (`src/sections/StackingProjects.tsx`): Ensures only on-screen WebM videos decode; off-screen videos pause.
     - Reduced-motion integration: Disables mist drift keyframes and hides video decoders when `prefers-reduced-motion` is active.
     - ThermalSkyClock redesign (`src/sky/ThermalSkyClock.tsx`): Removed internal rAF loop, rendering purely on prop updates.
   - **Bad / Risky Changes & Technical Debt**:
     - Zero route splitting: All routes and case studies bundled into a single 551 kB JS file.
     - Unoptimized Case Study PNGs: Over 13.6 MB of raw PNGs in `dist/case/` without WebP or `srcset` compression.
     - Broken legacy test suite: `tests/e2e/runner.mjs` fails due to referencing deleted components.

---

## 3. Caveats

1. **Headless Software-GL Rendering**:
   - The empirical measurements were conducted inside headless Chromium using software-GL (SwiftShader CPU emulation). Under software emulation, Canvas2D blitting and WebGL shaders execute on CPU threads. Absolute frame times at complex lighting angles (such as 18:30 twilight with high backlit calculations) are significantly elevated compared to real hardware GPUs (where rest draw EMA is ~4.1–4.3ms as recorded in historical hardware sessions).
2. **Network Payload in Isolation**:
   - Bundle measurements do not include external dynamic assets loaded inside iframe embeds (e.g., three.js loaded via jsDelivr CDN inside `public/embed/sentinel/harness.html`).
3. **Legacy E2E Test Suite**:
   - The test runner in `tests/e2e/` was built prior to the overnight refactoring. It was not updated during the pipeline phases to reflect the deletion of `ExcavationCraterFooter.tsx`, `CompactAudioPlayer.tsx`, or `AtmosphericHeader.tsx`.

---

## 4. Conclusion

1. **Build & Typecheck**: Completely clean. `npm run typecheck` and `npm run build` pass with zero compiler errors.
2. **Bundle Budget Compliance**: The main bundle is 551.26 kB (183.23 kB gzip), representing a negligible +0.43 kB (+0.07%) variance from historical numbers. While exceeding Vite's 500 kB chunk warning threshold, its wire transfer size is light for a 3D volumetric sky + procedural botanicals portfolio.
3. **Render Performance**: The FrameBudget coordinator successfully holds the hero exit path inside its `< 8ms` draw EMA envelope (5.4ms – 7.9ms at 17:45), gracefully stepping down quality under load and decimating sky passes past the hero exit.
4. **Actionable Recommendations**:
   - *P1 (Performance)*: Implement route-level code splitting using `React.lazy()` for `/about`, `/projects`, `/journal`, `/resume`, and `/case/*` to bring initial JS chunk size well below 400 kB.
   - *P2 (Assets)*: Convert the 13.6 MB of case study PNGs in `public/case/` to modern WebP/AVIF format.
   - *P3 (Maintenance)*: Update or prune `tests/e2e/` to align with the current component architecture, replacing references to deleted components with tests for `SiteFooter.tsx` and `HomeBeats.tsx`.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Typecheck**:
   ```powershell
   npm run typecheck
   ```
   *Expected*: Exit code 0, 0 errors, 0 warnings.

2. **Verify Production Build**:
   ```powershell
   npm run build
   ```
   *Expected*: Exit code 0. Output lists `dist/assets/index-*.js` (~551 kB) and `dist/assets/index-*.css` (~220 kB).

3. **Verify Bundle File Sizes**:
   ```powershell
   Get-ChildItem -Path dist/assets -File | Select-Object Name, Length
   ```
   *Expected*: `index-*.js` length is ~551,262 bytes; `index-*.css` length is ~220,303 bytes.

4. **Verify Live Render & FrameBudget Metrics**:
   - Start local preview or dev server: `npx vite --port 5199`
   - Run performance probe:
     ```powershell
     cd C:\Users\rudra\AppData\Local\Temp\pwqa
     node p12perf.mjs
     ```
   - Invalidation condition: If garden draw EMA at 17:45 exit (y=600–1500) exceeds 8.0ms with FrameBudget active, or if FrameBudget fails to step down under stress, the performance guarantee is invalidated.
