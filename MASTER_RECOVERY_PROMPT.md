# 📋 MASTER PROMPT: Rebuilding the "Stratosphere" Visual UI (GitHub Edition)

> **GitHub Repository:** [`rudy0Z/Portfolioskyfix`](https://github.com/rudy0Z/Portfolioskyfix)  
> **Branch:** `main`  
> **Stack:** React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS v4 · WebGL2 (GLSL) · Canvas 2D · Git LFS  
> **Target Ground Truth:** The verified live build from November 12, 2026 (16:11–16:33 IST)

---

## 1. Quickstart & Setup for Any Agent or Developer

```bash
# 1. Clone the repository and fetch LFS assets
git clone https://github.com/rudy0Z/Portfolioskyfix.git
cd Portfolioskyfix
git lfs pull

# 2. Install dependencies & verify baseline build
npm install
npm run typecheck   # Must return 0 errors (tsc --noEmit)
npm run build       # Must succeed in < 2.0s
npm run dev         # Launches local dev server on http://localhost:5173/
```

---

## 2. Verified Ground-Truth References (All Tracked on GitHub)

Every reference file below is committed and pushed directly to `main` on GitHub:

| UI Element | GitHub Repository Path | Purpose & Ground Truth |
| :--- | :--- | :--- |
| **Daytime Hero & Capsule Nav** | [`reviews/new-visual-hero.png`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/reviews/new-visual-hero.png) | Centered frosted top capsule nav, floating frosted hero card on left, *"in code."* in green italic serif. |
| **Multi-Species Daytime Meadow**| [`reviews/new-visual-scroll-800.png`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/reviews/new-visual-scroll-800.png) | 4 distinct floral species (violet lupines, pink cosmos, orange poppies, white daisies) in daylight with bokeh. |
| **Astronomical Horizon Sundial** | [`reviews/live-solar-dial-popover.png`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/reviews/live-solar-dial-popover.png) | 180° East-West horizon dome, chromatic LED comb ticks, `GOLDEN HOUR`, orange draggable thumb, bold `16:30`. |
| **Interactive Tactical Cards** | [`reviews/live-work-fresh.png`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/reviews/live-work-fresh.png) | Frosted entrance card (*"Where human decisions meet autonomous"*) + Sentinel card with dark `TALON` radar HUD. |
| **Component HTML/CSS Templates**| [`reviews/traycer-session-3f46217e/components_source/`](https://github.com/rudy0Z/Portfolioskyfix/tree/main/reviews/traycer-session-3f46217e/components_source) | Raw, standalone HTML/CSS prototypes for all 6 target components. |
| **Design Remix Blueprint** | [`reviews/traycer-artifacts/blueprint/index.html`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/reviews/traycer-artifacts/blueprint/index.html) | Comparative study of Thoufik (`thoufik.space`), Air (`air.inc`), Pranshu, and Pinkesh Patel. |
| **24-Point Codebase Audit** | [`reviews/traycer-artifacts/audit/index.html`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/reviews/traycer-artifacts/audit/index.html) | Full audit report classifying 6 P0, 9 P1, 6 P2, and 3 P3 issues. |
| **File Tracker & Necessity** | [`REPO_FILE_TRACKER.md`](https://github.com/rudy0Z/Portfolioskyfix/blob/main/REPO_FILE_TRACKER.md) | Exhaustive inventory of all 1,212 repo files and why bloat was excluded from Git LFS. |

---

## 3. Strict Architectural Laws & Constraints

1. **The Single Solar Truth ($t \in [0, 24)$):**
   * Sky atmosphere, cloud lighting, and surface materials derive strictly from fractional hour `t` in `src/lib/useTimeOfDay.ts`.
   * **Never hardcode hex colors in components.** Read CSS variables (`var(--sky-zenith)`, `var(--ui)`, `var(--hairline)`).
   * Color transitions run through OKLab/OKLCH in `src/lib/skyPalette.ts` and `src/lib/color.ts` to prevent muddy dawn/dusk midtones.
2. **Pervasive Honesty & Anti-Slop:**
   * Never invent vanity metrics, fake percentages, or placeholder labels.
   * FlytBase Sentinel: *"7:12 exercise-run decision against a 38-minute baseline"* | *"Autonomous aerial command brief, kept building"*.
3. **Zero-CLS Constraint:**
   * Media containers must specify explicit aspect ratios (`aspectRatio: proj.coverAspect`) to prevent layout shifts.
4. **Animation Discipline:**
   * Never introduce `transition: all`. Specify exact properties (`transform`, `opacity`, `background-color`). Buttons must have active press scaling (`transform: scale(0.97)`).
5. **No Desktop Hamburger:**
   * `@media (min-width: 1024px) { .site-menu-btn { display: none !important; } }`. Desktop navigation must be 100% visible in the top capsule.

---

## 4. The 6 Signature Components to Restore

### Component 1: Centered Floating Frosted Top Nav Capsule
* **Files:** `src/components/navigation/NavigationNotch.tsx` and `src/styles/global.css`
* **Reference Template:** `reviews/traycer-session-3f46217e/components_source/01_hero_card_option_a.html`
* **Visual Reference:** `reviews/new-visual-hero.png`
* **CSS Implementation:**
  ```css
  .site-nav-capsule {
    position: fixed;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 999px;
    background: rgba(252, 250, 246, 0.92);
    border: 1px solid rgba(15, 23, 42, 0.1);
    box-shadow: 0 16px 40px -16px rgba(15, 23, 42, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px) saturate(140%);
    font-size: 13px;
  }
  .site-nav-divider {
    width: 1px;
    height: 16px;
    background: rgba(15, 23, 42, 0.12);
  }
  ```
* **Internal Structure:**
  - Left: Living botanical `Rudraksh` wordmark with green vine (`TrackingFlower.tsx`).
  - Middle: Navigation links: `Work` · `About` · `Process` · `Contact` · `Resume ↗`.
  - Right: Frosted solar time pill (`● 16:11`). Clicking opens the Horizon Sundial Popover.

---

### Component 2: Floating Frosted Left-Aligned Hero Card
* **Files:** `src/sections/Hero.tsx` and `src/styles/global.css`
* **Reference Template:** `reviews/traycer-session-3f46217e/components_source/01_hero_card_option_a.html`
* **Visual Reference:** `reviews/new-visual-hero.png`
* **CSS Implementation:**
  ```css
  .hero-card {
    position: absolute;
    top: clamp(96px, 14vh, 140px);
    left: max(var(--gutter), 4vw);
    max-width: min(560px, calc(100vw - 32px));
    z-index: 20;
    padding: 34px 38px;
    border-radius: 28px;
    background: rgba(252, 250, 246, 0.92);
    border: 1px solid rgba(15, 23, 42, 0.09);
    box-shadow: 0 28px 64px -24px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(28px) saturate(140%);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hero-card-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.05);
    border: 1px solid rgba(15, 23, 42, 0.08);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 11.5px;
    color: #334155;
    width: fit-content;
  }
  .hero-card-kicker-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #16a34a;
    box-shadow: 0 0 8px rgba(22, 163, 74, 0.6);
  }
  .hero-card-title {
    margin: 0;
    font-family: var(--font-sans, "Plus Jakarta Sans", sans-serif);
    font-size: clamp(34px, 4vw, 44px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: #0f172a;
  }
  .hero-card-title-accent {
    font-family: var(--font-serif, "Instrument Serif", "Fraunces", serif);
    font-style: italic;
    font-weight: 400;
    color: #15803d; /* Botanical emerald green */
  }
  .hero-card-lede {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: #334155;
  }
  .hero-card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }
  .hero-btn-dark {
    padding: 11px 22px;
    border-radius: 999px;
    background: #0f172a;
    color: #f8fafc;
    font-weight: 600;
    font-size: 13.5px;
    text-decoration: none;
    transition: transform 0.15s ease, background-color 0.15s ease;
  }
  .hero-btn-dark:hover { background: #1e293b; transform: translateY(-1px); }
  .hero-btn-dark:active { transform: scale(0.97); }
  .hero-btn-ghost {
    padding: 11px 22px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.05);
    border: 1px solid rgba(15, 23, 42, 0.12);
    color: #0f172a;
    font-size: 13.5px;
    font-weight: 500;
    text-decoration: none;
    transition: transform 0.15s ease, background-color 0.15s ease;
  }
  .hero-btn-ghost:hover { background: rgba(15, 23, 42, 0.08); transform: translateY(-1px); }
  .hero-btn-ghost:active { transform: scale(0.97); }
  ```
* **HTML Markup in `Hero.tsx`:**
  ```html
  <div className="hero-card">
    <div className="hero-card-kicker">
      <span className="hero-card-kicker-dot" aria-hidden="true" />
      Greater Noida, India · Open to Product Design Roles
    </div>
    <h1 className="hero-card-title">
      Hi, I’m Rudraksh —<br />
      a product designer<br />
      who builds <span className="hero-card-title-accent">in code.</span>
    </h1>
    <p className="hero-card-lede">
      I design decision-critical AI interfaces and prototype the hardest edge cases directly in React &amp; TypeScript, so what gets designed actually holds up in production.
    </p>
    <div className="hero-card-actions">
      <a href="#work" className="hero-btn-dark">Explore selected work ↓</a>
      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hero-btn-ghost">Resume PDF ↗</a>
    </div>
  </div>
  ```

---

### Component 3: Multi-Species Daytime Meadow (`BluebellPass.tsx`)
* **File:** `src/components/originkit/BluebellPass.tsx`
* **Visual Reference:** `reviews/new-visual-scroll-800.png`
* **Botanical Species Architecture:**
  The Canvas 2D pass must render 4 distinct species simultaneously during daytime ($t \in [8, 18]$):
  1. **Violet Lupines / Lavender:** Conical tiered florets (`#8b5cf6`, `#a78bfa`, `#c4b5fd`).
  2. **Pink Cosmos:** Flat 8-petal ray flowers with notched tips and bright yellow disc center (`#f472b6`, `#ec4899`, `#fbbf24`).
  3. **Golden-Orange California Poppies:** Cup-shaped blooms with warm orange gradients (`#f59e0b`, `#ea580c`).
  4. **Crisp White Meadow Daisies:** Slender radiating white petals with raised amber stippled centers (`#ffffff`, `#f59e0b`).
* **Optical Depth:**
  - Foreground: Soft bokeh blur on nearest grass blades and flower stems.
  - Midground: Crisp botanical geometry around the 2.5D desk illustration.
  - Background: Exponential aerial haze falloff (`air(z) = aerialK * (1 - exp(-max(0, zmax - z) * 2.4))`) blending smoothly into the distant hills.

---

### Component 4: East-West Astronomical Horizon Sundial Popover
* **Files:** `src/sky/ThermalSkyClock.tsx` and `src/styles/global.css`
* **Reference Template:** `reviews/traycer-session-3f46217e/components_source/02_remixed_horizon_sundial.html`
* **Visual Reference:** `reviews/live-solar-dial-popover.png`
* **Geometry & Behavior:**
  - Replaces the 240° thermostat with a 180° East $\to$ Zenith $\to$ West Horizon Dome.
  - **Card Container:**
    `background: radial-gradient(75% 42% at 68% 62%, rgba(251, 146, 60, 0.28), transparent 72%), linear-gradient(180deg, rgba(16, 21, 36, 0.94) 0%, rgba(9, 12, 22, 0.97) 100%); border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.18); box-shadow: 0 32px 80px -24px rgba(0, 0, 0, 0.75); padding: 22px 24px;`
  - **SVG Arc (viewBox: `0 0 320 150`):**
    - Hairline prairie baseline with markers `06:00 EAST`, `NOON`, `18:00 WEST`.
    - 48 Chromatic LED comb ticks gradient-mapped from sunrise cyan (`#38bdf8`) to midday golden-yellow (`#fde047`) to sunset orange (`#fb923c`) and night indigo (`#818cf8`).
    - Draggable amber solar orb updating solar time `t` live across the whole portfolio.
  - **Status & Digital Readout:**
    - Monospace readout: `16:30` (or live time).
    - Subtitle: `GOLDEN HOUR · Drag sun along horizon` (10px, uppercase, letter-spacing 0.18em, color `#fdba74`).
  - **Atmosphere Chips:** `☁ Cloud Drift` · `✦ Night Stars` · `📍 My Time`.

---

### Component 5: Stacking Projects & Tactical Console Card
* **Files:** `src/sections/StackingProjects.tsx` and `src/styles/global.css`
* **Reference Template:** `reviews/traycer-session-3f46217e/components_source/05_centered_case_study_header.html`
* **Visual Reference:** `reviews/live-work-fresh.png`
* **Structure:**
  1. **Section Entrance Card:**
     ```html
     <div class="work-section-intro-card">
       <span class="work-intro-kicker">Interactive Case Studies</span>
       <h2 class="work-intro-title">
         Where <span class="work-intro-title-accent">human decisions</span> meet autonomous
       </h2>
       <p class="work-intro-sub">
         Three end-to-end product case studies — framed around real operational constraints and built with testable code prototypes.
       </p>
     </div>
     ```
     - Styled as a frosted off-white container (`border-radius: 28px; background: rgba(252, 250, 246, 0.92);`).
     - *"human decisions"* rendered in green italic serif (`Instrument Serif` / `Fraunces`, color `#15803d`).
  2. **FlytBase Sentinel Card with Tactical HUD:**
     - Sleek off-white container (`border-radius: 28px`).
     - Right Column: **Dark Mission Console (`TALON FLIGHT COMMAND`):**
       - Container: `#0b0f19` dark glass with hairline border.
       - Top Bar: `● TALON FLIGHT COMMAND · SECTOR 04 NORTH RIDGE` + green HUD timer `90S WINDOW: 00:42 LEFT`.
       - Telemetry: `DRONE EO/IR #02 · ALT 412M · WIND 14KT NW` · `TACTICAL GRID 100M · 3 SENSORS`.
       - Radar Display: Live rotating sweep reticle with target blips and sensor range cones.

---

### Component 6: Monumental TypeGarden Botanical Footer
* **Files:** `src/sections/SiteFooter.tsx` and `src/styles/global.css`
* **Reference Template:** `reviews/traycer-session-3f46217e/components_source/03_typegarden_meadow_footer.html`
* **Visual Reference:** `reviews/live-solar-dial-popover.png` (background)
* **Structure:**
  1. **Asymmetric Contact Bridge:**
     - Header: `● OPEN FOR PRODUCT DESIGN & DESIGN ENG · 2026` (emerald pulsing dot).
     - Title: `Have a product or prototype in mind?`
     - Action: One-click email copy button `rudraksh.singhh@outlook.com ⧉` + `Resume PDF ↗` + social pills (`𝕏`, `GitHub`, `LinkedIn`).
  2. **Monumental Botanical Name Stage:**
     - Giant display wordmark: **Rudraksh** (`180px–200px`, font-weight 380, letter-spacing -0.035em).
     - Interactive Canvas `#footer-flora`: Living botanical vines grow through each letter, blooming multi-colored flowers on cursor hover, click, or drag.
     - Controls: `Breathe`, `Wind gust`, `Follow light`, `↻ Regrow`.

---

## 5. Verification & Acceptance Checklist

Before considering the task complete, verify:
* [ ] `npm run typecheck` passes with **0 errors**.
* [ ] `npm run build` succeeds in **under 2.0s**.
* [ ] Open `http://localhost:5173/?t=16:12`:
  - [ ] Centered frosted capsule nav is visible at top with links and solar pill.
  - [ ] Left-aligned frosted hero card is visible over the knoll with green italic *"in code."*.
  - [ ] Botanical meadow displays rich multi-colored flowers (violet, pink, orange, white) under daylight.
  - [ ] Clicking the top-right solar pill opens the semicircular horizon sundial popover.
  - [ ] Stacking projects begin with the frosted *"Where human decisions meet autonomous"* card and Sentinel displays the dark tactical radar HUD.
  - [ ] Mobile hamburger button is hidden on desktop ($\ge 1024\text{px}$).
```
