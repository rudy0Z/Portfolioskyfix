# MISSION: Restore the Signature "Stratosphere" Visual Architecture for Sky Field Portfolio

> **Master Recovery Specification & Brief for Developers & AI Assistants**  
> **Repository:** `D:\Portfolioskyfix` (`sky-field` v2.0 Stratosphere Edition)  
> **Target Ground Truth:** Shipped and verified build on November 12, 2026 (16:11 – 16:33 IST)

---

## 1. Ground Truth References & Visual Assets

Inspect these exact files in the repository before writing any code:
* **Day Hero & Centered Capsule Nav:** `reviews/new-visual-hero.png`
* **Multi-Species Daytime Botanical Meadow:** `reviews/new-visual-scroll-800.png`
* **Astronomical Horizon Sundial Popover:** `reviews/live-solar-dial-popover.png`
* **Interactive Case Studies & Tactical Console Card:** `reviews/live-work-fresh.png`
* **Complete Recovered Component Source Templates:**
  - `reviews/traycer-session-3f46217e/components_source/01_hero_card_option_a.html` (Hero Card)
  - `reviews/traycer-session-3f46217e/components_source/02_remixed_horizon_sundial.html` (Horizon Sundial)
  - `reviews/traycer-session-3f46217e/components_source/03_typegarden_meadow_footer.html` (Botanical Footer)
  - `reviews/traycer-session-3f46217e/components_source/04_top_hub_capsule_dropdown.html` (Top Hub Capsule)
  - `reviews/traycer-session-3f46217e/components_source/05_centered_case_study_header.html` (Section Header)
  - `reviews/traycer-session-3f46217e/assets/tokens.css` (Font & Color Tokens)

---

## 2. Core Architectural Laws & Invariants (Never Violate)

1. **The Single Solar Truth ($t \in [0, 24)$):**
   * All sky atmosphere, lighting, and glass reflections derive strictly from solar hour `t` in `src/lib/useTimeOfDay.ts`.
   * **Never hardcode hex colors inside components.** Components read CSS variables (`var(--sky-zenith)`, `var(--sky-sun-glow)`, `var(--ui)`, `var(--hairline)`). Color transitions run through OKLab/OKLCH in `src/lib/skyPalette.ts` and `src/lib/color.ts`.
2. **Pervasive Honesty & Anti-Slop Discipline:**
   * Never invent vanity metrics, fake percentages, or placeholder text.
   * Sentinel: *"7:12 exercise-run decision against a 38-minute baseline"* | *"Autonomous aerial command brief, kept building"*.
3. **Zero-CLS Container Constraint:**
   * All media containers (`.work-viewport`, `.work-stack-screen`) must specify explicit aspect ratios (`aspectRatio: proj.coverAspect`).
4. **No Unbounded Transitions:**
   * Never use `transition: all`. Always specify explicit CSS properties (`transform`, `opacity`, `background-color`).
5. **No Mobile Hamburger on Desktop:**
   * Hide `.site-menu-btn` on viewports $\ge 1024\text{px}$ (`@media (min-width: 1024px) { display: none; }`).

---

## 3. The 6 Signature Components to Restore

### Component 1: Centered Floating Frosted Top Nav Capsule
* **Visual Reference:** `reviews/new-visual-hero.png` and `reviews/traycer-session-3f46217e/components_source/01_hero_card_option_a.html`
* **File to Modify:** `src/components/navigation/NavigationNotch.tsx` and `src/styles/global.css`
* **Specification:**
  - **Position:** `position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 50;`
  - **Container Glass:** `background: rgba(252, 250, 246, 0.92); backdrop-filter: blur(20px) saturate(140%); border-radius: 999px; border: 1px solid rgba(15, 23, 42, 0.1); box-shadow: 0 16px 40px -16px rgba(15, 23, 42, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.95);`
  - **Internal Structure:**
    `[Brand Wordmark + Tracking Flower] | Work | About | Process | Contact | Resume ↗ | [● 16:11 Solar Pill]`
  - **Brand Mark:** Living botanical `Rudraksh` wordmark with green vine blooming.
  - **Dividers:** 1px vertical hairlines (`rgba(15, 23, 42, 0.12)`).
  - **Right Solar Pill:** Frosted capsule showing glowing amber solar disc + digital time (`16:11`). Clicking opens the Horizon Sundial Popover.

---

### Component 2: Floating Frosted Left-Aligned Hero Card
* **Visual Reference:** `reviews/crops/hero_card.png`, `reviews/new-visual-hero.png`, and `01_hero_card_option_a.html`
* **Files to Modify:** `src/sections/Hero.tsx` and `src/styles/global.css`
* **Specification:**
  - **Position & Geometry:** Floating on the left knoll over the meadow.
    `position: absolute; top: clamp(96px, 14vh, 140px); left: max(var(--gutter), 4vw); max-width: min(560px, calc(100vw - 32px)); z-index: 20; padding: 34px 38px; border-radius: 28px;`
  - **Glass System:** `background: rgba(252, 250, 246, 0.92); backdrop-filter: blur(28px) saturate(140%); border: 1px solid rgba(15, 23, 42, 0.09); box-shadow: 0 28px 64px -24px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.95);`
  - **Kicker Pill:** Frosted pill badge with pulsing green dot:
    `● Greater Noida, India · Open to Product Design Roles` (DM Mono / JetBrains Mono, 11px).
  - **H1 Headline:**
    ```html
    <h1 class="hero-card-title">
      Hi, I’m Rudraksh —<br />
      a product designer<br />
      who builds <span class="hero-card-title-accent">in code.</span>
    </h1>
    ```
    - Font: Bold modern sans (`Plus Jakarta Sans` or `Manrope`, 46px, line-height 1.1, letter-spacing -0.025em).
    - Accent: `.hero-card-title-accent` in `Instrument Serif` / `Fraunces`, *italic*, color `#15803d` (deep botanical emerald green).
  - **Lede Paragraph:**
    `I design decision-critical AI interfaces and prototype the hardest edge cases directly in React & TypeScript, so what gets designed actually holds up in production.` (15px, color `#334155`).
  - **Actions:**
    - Primary Button: Solid dark pill (`background: #0f172a; color: #f8fafc; border-radius: 999px; padding: 11px 22px; font-weight: 600;`) `Explore selected work ↓`.
    - Secondary Button: Frosted ghost pill (`background: rgba(15, 23, 42, 0.05); border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 999px; padding: 11px 22px;`) `Resume PDF ↗`.
  - **Craft Detail:** A subtle yellow butterfly resting on the top edge of the card.

---

### Component 3: Multi-Species Daytime Meadow (`BluebellPass.tsx`)
* **Visual Reference:** `reviews/new-visual-scroll-800.png`
* **File to Modify:** `src/components/originkit/BluebellPass.tsx`
* **Specification:**
  - The meadow must render **four distinct floral species** in daytime lighting:
    1. **Violet Lupines / Lavender:** Conical spires with tiered, rounded purple/violet florets (`#8b5cf6`, `#a78bfa`, `#c4b5fd`).
    2. **Pink Cosmos:** Flat, open 8-petal ray flowers with notched serrated tips and bright yellow disc centers (`#f472b6`, `#ec4899`, `#fbbf24`).
    3. **Golden-Orange California Poppies:** Cup-shaped blooms with warm yellow-orange gradients and deep amber centers (`#f59e0b`, `#ea580c`).
    4. **Crisp White Meadow Daisies:** Slender white radiating petals with raised golden-orange stippled centers (`#ffffff`, `#f59e0b`).
  - **Depth of Field:** Foreground bokeh/blur on nearest blades, razor-sharp botanical detail at the midground desk, smooth aerial haze blending into the distant horizon ridges.
  - **Daylight Palette:** When $t \in [8, 18]$, avoid the monochromatic cyan nocturnal shift; preserve the natural pink, purple, orange, and white colors under daylight sun scattering.

---

### Component 4: Semicircular Astronomical Horizon Sundial Popover
* **Visual Reference:** `reviews/crops/dial_overview.png`, `reviews/live-solar-dial-popover.png`, and `02_remixed_horizon_sundial.html`
* **Files to Modify:** `src/sky/ThermalSkyClock.tsx` and `src/styles/global.css`
* **Specification:**
  - Replaces the generic 240° thermostat dial with the **East $\to$ Zenith $\to$ West Horizon Dome**.
  - **Card Container:**
    `background: radial-gradient(75% 42% at 68% 62%, rgba(251, 146, 60, 0.28), transparent 72%), linear-gradient(180deg, rgba(16, 21, 36, 0.94) 0%, rgba(9, 12, 22, 0.97) 100%); border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.18); box-shadow: 0 32px 80px -24px rgba(0, 0, 0, 0.75);`
  - **Header:** `Greater Noida · IST` + close button `×`.
  - **Subhead:** `GOLDEN HOUR` (10px uppercase, letter-spacing 0.18em, color `#fdba74`).
  - **Astronomical SVG Horizon Dome (viewBox: 0 0 320 150):**
    - Baseline: Hairline prairie ridge with `06:00 EAST`, `NOON`, `18:00 WEST`.
    - Arc: Semicircular 180° curve with 48 chromatic LED comb ticks (cyan at sunrise $\to$ midday yellow $\to$ sunset orange $\to$ night indigo).
    - Draggable Thumb: Glowing amber sun/moon orb with ring, labeled `drag`, updating solar time `t` continuously across the portfolio.
  - **Large Digital Readout:** Bold monospace numbers (e.g. `16:30` / `17:45`, 34px).
  - **Tactile Toggle Chips:** `☁ Cloud Drift` | `✦ Night Stars` | `📍 My Time`.

---

### Component 5: Stacking Projects & Tactical Console Card
* **Visual Reference:** `reviews/crops/work_card.png`, `reviews/live-work-fresh.png`, and `05_centered_case_study_header.html`
* **Files to Modify:** `src/sections/StackingProjects.tsx` and `src/styles/global.css`
* **Specification:**
  - **Section Entrance Card:** Dedicated frosted white card introducing the work:
    - Kicker: `Interactive Case Studies` (DM Mono, uppercase).
    - Headline: `Where human decisions meet autonomous` (with *"human decisions"* in green italic serif).
    - Lede: `Three end-to-end product case studies — framed around real operational constraints and built with testable code prototypes.`
    - Decorative yellow butterfly on top border.
  - **Project Card 1 (FlytBase Sentinel):**
    - Sleek off-white container (`border-radius: 28px; background: rgba(252, 250, 246, 0.95);`).
    - Top Meta Row: `01` `Systems Concept` (pill badge) `2026` · `Autonomous Systems · Incident Command`.
    - Left Column: Problem, Operational Tension, Architecture.
    - Right Column: **Embedded Live Tactical Mission Console (`TALON FLIGHT COMMAND`):**
      - Dark console HUD (`#0b0f19` dark glass).
      - Header bar: `● TALON FLIGHT COMMAND · SECTOR 04 NORTH RIDGE` with green HUD badge `90S WINDOW: 00:42 LEFT`.
      - Telemetry bar: `DRONE EO/IR #02 · ALT 412M · WIND 14KT NW` · `TACTICAL GRID 100M · 3 SENSORS`.
      - Interactive tactical circular radar grid with targeting reticle and sensor cones.

---

### Component 6: Monumental TypeGarden Interactive Botanical Footer
* **Visual Reference:** `reviews/crops/dial_overview.png` and `03_typegarden_meadow_footer.html`
* **Files to Modify:** `src/sections/SiteFooter.tsx` and `src/styles/global.css`
* **Specification:**
  - **Floating Contact Bridge:**
    - Kicker: `● OPEN FOR PRODUCT DESIGN & DESIGN ENG · 2026` (emerald green dot).
    - Heading: `Have a product or prototype in mind?`
    - Subhead: `Greater Noida, India (IST) · Designing decision-critical interfaces in code.`
    - Action Buttons: `rudraksh.singhh@outlook.com ⧉` (one-click copy with feedback) | `Resume PDF ↗` | `𝕏` | `GitHub` | `LinkedIn`.
  - **Monumental Botanical Name Stage:**
    - Giant serif display wordmark: **Rudraksh** (180px–200px, letter-spacing -0.035em).
    - Interactive Canvas `#footer-flora`: Living botanical vines wrap through each letter with pink cosmos, yellow poppies, and daisies blooming on cursor hover, click, or drag.
    - Controls: `Breathe`, `Wind gust`, `Follow light`, `↻ Regrow`.

---

## 4. Execution Sequence for the Implementer

1. **Step 1 — Centered Nav Capsule:** Update `NavigationNotch.tsx` and `global.css` to render the centered floating frosted capsule, replacing the split-corner layout.
2. **Step 2 — Hero Frosted Card:** Add the CSS styles for `.hero-card`, `.hero-card-kicker`, `.hero-card-title`, and `.hero-card-actions` to `global.css`, matching `01_hero_card_option_a.html`.
3. **Step 3 — Horizon Sundial Popover:** Wire the top nav solar pill click to mount the remixed 180° horizon dome popover from `02_remixed_horizon_sundial.html` in `ThermalSkyClock.tsx`.
4. **Step 4 — Meadow Flora Shaders:** Ensure `BluebellPass.tsx` renders the 4-species daytime palette (lupines, cosmos, poppies, daisies) cleanly under daylight solar hours ($t = 16.2$).
5. **Step 5 — Stacking Work & Tactical HUD:** Insert the frosted *"Where human decisions meet autonomous"* entrance card into `StackingProjects.tsx` and embed the dark `TALON FLIGHT COMMAND` console into the Sentinel card.
6. **Step 6 — Botanical Footer:** Mount the monumental TypeGarden wordmark with `#footer-flora` canvas interaction in `SiteFooter.tsx`.
7. **Verification:**
   - Run `npm run typecheck` $\to$ **Must pass with 0 errors**.
   - Run `npm run build` $\to$ **Must pass cleanly in under 2 seconds**.
   - Test on desktop ($1280\times800$) and mobile ($400\times800$) with zero layout shifts.
