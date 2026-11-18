# Sky Field — 90-Minute Final Build Sprint Context (Carbon Gemini)

> **Target Repository:** `D:\Portfolioskyfix`  
> **Host Stack:** React 19 + Vite 8 + TypeScript 5.9 + Tailwind v4 + WebGL2 GLSL  
> **Target Execution Window:** 90 Minutes  
> **Goal:** Ship the final, recruiter-grade, award-ready version of the **Hero**, **Centered Case Study Reader**, and **FlytBase Sentinel Case Study**.

---

## 1. How to Setup Workspace in Traycer (Crucial Safeguard)
1. In Traycer Desktop, open or create an Epic for **Sky Field Portfolio**.
2. **Attach Workspace:** Point the workspace directory directly to:
   ```text
   D:\Portfolioskyfix
   ```
   *(Ensure it operates directly in `D:\Portfolioskyfix` so every write goes to the real disk, not a detached temporary worktree).*
3. Verify connection: run `git status` inside Traycer to confirm it is pointing to `D:\Portfolioskyfix`.

---

## 2. Core Architectural Invariants (Do Not Violate)
1. **The Single Solar Truth (`t ∈ [0, 24)`):**
   * All lighting derives strictly from solar hour `t` in `src/lib/useTimeOfDay.ts`.
   * **Never hardcode hex colors in UI components.** Use CSS variables:
     * Sky: `var(--sky-zenith)`, `var(--sky-mid)`, `var(--sky-horizon)`, `var(--sky-sun-glow)`
     * Surfaces: `var(--ui)`, `var(--ui-dim)`, `var(--ui-faint)`, `var(--hairline)`, `var(--hairline-strong)`
     * Diurnal theme: `data-sky-theme="light"` (frosted alabaster `#fcf9f3` + slate ink `#0f172a`) vs `dark` (obsidian `#0a0e1a` + ivory ink `#f7f5ef`).
2. **Pervasive Honesty & Anti-Slop (Strictly Verified Facts):**
   * **Sentinel:** "Compressing wildfire verification from 48 minutes to 90 seconds" · "7:12 exercise-run decision against a 38-minute baseline" (zero fabricated claims).
   * **LokAI:** "Four laws, gate-checked in code" (zero fake confidence percentages).
   * **Feul:** "₹100 withdrawable in session one" (not "instant UPI").
   * **Location:** Always `Greater Noida, India · IST` (Purge every mention of `Surat` / `21°N`).
3. **Zero-CLS Container Geometry:**
   * All media containers (`.work-viewport`, `.work-stack-screen`, `.cs-fig`) must specify explicit `aspectRatio`.
   * Standard width: `.shell` max-width 1240px; Case Study reading column: **920px centered**.

---

## 3. Targeted Final Result #1: Centered Case Study + Top Hub Capsule
*(Reference: Canvas Design Blueprint State 1 & State 2)*

### State 1: Top of Case Study (Above Walkthrough Reel)
* **Centered 920px Column:** Symmetrical reading stage (no Thoufik asymmetrical left-rail layout).
* **Header & Metadata:**
  * Tagline: `FLYTBASE SENTINEL · AUTONOMOUS AERIAL COMMAND`
  * Heading: **"Compressing wildfire verification from 48 minutes to 90 seconds."**
  * Subtext: *"Autonomous drones spot ridge ignitions fast, but false dispatches waste scarce aerial tankers. Sentinel stages thermal evidence automatically while keeping irreversible escalation in human hands."*
  * Meta Grid: `Role: Product Design & Code` · `Core Screen: Incident Command Console` · `Key Metric: 48m → 90s target flow` · `Prototype: Live React State Machine`.
* **6-Chapter Overview Card (Visible Upfront):**
  A clean 6-item grid displaying all chapters so recruiters see the complete story outline immediately:
  1. `01 · The 48-minute dispatch gap`
  2. `02 · 45s motion walkthrough`
  3. `03 · 90-second verification gate`
  4. `04 · Attention arbiter filter`
  5. `05 · 2G / 5G bandwidth ladder`
  6. `06 · Outcomes & reflection`
* **Video Slot (`#case-walkthrough`):**
  * 16:9 glass container awaiting motion reel, rendering an elegant placeholder state: *"Once you scroll past this reel, the 6 chapters fold into the Top Hub Capsule →"*.

### State 2: Scrolled Past Reel (Top Hub Capsule Activated)
* As soon as `#case-walkthrough` scrolls past the top of the viewport, the chapter overview folds into a **Floating Frosted Top Hub Capsule**:
  ```text
  [ ← Work | #2 · 90-second verification gate ▾ | Full Prototype ↗ | 17:45 ]
  ```
* **Top Hub Capsule Features:**
  * `← Work`: One-click link back to homepage work section (`/#work`).
  * **Chapter Dropdown:** Hover or click opens a frosted glass dropdown menu listing all 6 chapters with live scroll-spy tracking (active chapter highlighted).
  * `Full Prototype ↗`: Launches the sandboxed prototype from `public/embed/sentinel/harness.html` in an expanded modal.
  * `17:45`: Miniature live solar sky clock pill.

---

## 4. Targeted Final Result #2: Sentinel Interactive Prototype Stage
* Inside Chapter `03 · 90-second verification gate`:
  * Embed the live interactive React state machine connected to `public/embed/sentinel/harness.html`.
  * **Interactive Scenario Tabs:**
    * Tab A: `Hotspot +620°C (Active Ignition)`
    * Tab B: `Timeout / False Alert Reverted`
  * **Console HUD Elements:**
    * Live 90-second countdown timer (`00:42`).
    * Dual thermal video feeds (RGB + FLIR Long-Wave Infrared).
    * `Authorize Mutual Aid` green primary button with tactile press state.
    * Mutual Aid CalFire packet pre-staged status indicator.

---

## 5. Targeted Final Result #3: Hero Typography (Option A)
*(Reference: Canvas Design Blueprint Type Option A)*

* **Typography Pairing:**
  * Primary Sans: **`Plus Jakarta Sans`** (`600`, tight `-0.03em` tracking).
  * Editorial Accent: **`Instrument Serif`** italic.
  * Technical Monospace: **`DM Mono`** or **`JetBrains Mono`**.
* **Hero Content:**
  * Kicker: `● Greater Noida, India · Open to Product Design Roles`
  * Heading:
    > **Hi, I'm Rudraksh — a *product designer* who builds in code.**
  * Lede:
    > *"I design decision-critical AI interfaces and prototype the hardest edge cases directly in React & TypeScript, so what gets designed actually holds up in production."*
  * Actions:
    * Primary CTA: `[Explore selected work →]` (scrolls smoothly to `#work`).
    * Secondary CTA: `[Resume PDF ↗]` (links to `/resume.pdf`).

---

## 6. Targeted Final Result #4: Early-Career Recruiter Sections
* On Homepage below Stacking Projects:
  * **Craft in Action (`#craft`):** One-click 4-state solar tester (`Dawn 06:25` · `Noon 12:00` · `Golden 17:45` · `Midnight 01:00`) showing recruiters real-time diurnal WCAG AAA contrast adaptation.
  * **What I Can Own From Week One:**
    1. *Decision-Heavy AI & Systems Design:* Complex state-machine UI, error boundaries, failure-mode mitigation.
    2. *Code-Grade Prototyping:* Full React + TypeScript prototypes from day one, eliminating design-to-engineering handoff friction.
    3. *Production Component Craft:* Micro-interactions, keyboard accessibility, performance frame budgets, 0-CLS.

---

## 7. Relevant Local Files for Carbon to Read & Edit
| Role | File Path |
| :--- | :--- |
| **Top Shell & Routing** | `src/App.tsx`, `src/router/Router.tsx` |
| **Top Hub Capsule & Nav**| `src/components/navigation/NavigationNotch.tsx`, `src/components/Header.tsx` |
| **Hero Stage & Type** | `src/sections/Hero.tsx` |
| **Case Study Reader** | `src/pages/CaseStudyPage.tsx`, `src/styles/case-reader.css` |
| **Sentinel Content Model**| `src/caseStudies/sentinel.ts`, `src/caseStudies/types.ts` |
| **Sentinel Embed Build** | `public/embed/sentinel/harness.html`, `public/embed/sentinel/data/` |
| **Global Styles & Tokens**| `src/styles/global.css`, `index.html` |
