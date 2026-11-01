# Master Design Manifesto & Content Audit: Sky Portfolio

> **Project:** Rudraksh Singh — Systems & Product Design Portfolio  
> **Architecture Version:** 2.0 (Stratosphere Edition)  
> **Status:** Canonical Master Specification & Content Audit  
> **Date:** October 2026  

---

# Part I: The Creative Universe & Narrative Architecture

The portfolio is not a standard web page with a background image. It is **one continuous, living physical world suspended in the atmosphere**, lit by a real 24-hour sun, which the visitor navigates through vertical altitude rather than flat page transitions.

```
[ALTITUDE 00: INITIALIZATION]
Type-Garden Blooming Loader ──► Plants seeds, editorial name blooms with flowers ──► Shrinks into persistent corner logo

[ALTITUDE 01: THE STRATOSPHERE (HERO @ 0% SCROLL)]
Grounded Prairie Knoll ──► Wild grasses, flowers, vintage wooden desk, laptop, designer working peacefully
Infinite Living Sky behind (WebGL2 Raymarched Cumulus, OKLCH Solar Engine)

[ALTITUDE 02: THE REVEAL (SCROLL 0% → 100%)]
The Camera Pulls Down ──► Reveals the meadow is an elevated Floating Island
Underside Keel: Eroded rock strata, hanging roots, industrial rocket thrusters + Iron Man / Mech suit at apex thrusting the island upward

[ALTITUDE 03: ORBITAL PAVILIONS (SCROLL 100% → 300%)]
Island exits upward ──► The living sky becomes the page surface
Selected Works float as Architectural Glass & Titanium Pavilions (Contra Labs style bento cards)

[ALTITUDE 04: TOUCHDOWN (FOOTER)]
Camera lands on solid Earth ──► The Excavation Crater / Quarry where the island was lifted from
Surveyor's field basecamp: "From this ground, we build systems", BookCallButton, Communication HUD, "Return to Orbit" trigger
```

---

## 1. Core Visual & Narrative Pillars

### A. The Type-Garden Brand Identity & Loader (`type-garden (1).html`)
* **The Loading Sequence:**
  1. The screen opens in deep ambient dark/cream silence.
  2. The designer's name draws in bold editorial typography (`Playfair Display` / `Fraunces`).
  3. **Botanical vines, leaves, and wildflower petals organically sprout and bloom directly around the letterforms via canvas animation.**
  4. Once the WebGL sky engine finishes compiling, the blooming lockup smoothly scales down and glides into the top-left corner, becoming the persistent header logo.
* **Floral Micro-Interactions:**
  * Interactive buttons have subtle botanical sprout effects on hover (a single petal or leaf uncurling along the hairline border).
  * Page navigation triggers gentle wind petals scattering across the screen.
  * The custom garden butterfly cursor flits across the interface.

### B. The Hero Floating Island (Tranquil Surface vs. Raw Engineering)
* **The Surface (Hero Viewport):**
  * A tranquil open meadow with tall prairie grasses and wildflowers swaying softly in the wind.
  * Sitting in the center: a vintage work desk with a laptop and the designer at work (drawn in the high-fashion `@skaigenerated` risograph stipple-grain aesthetic).
  * Creates an initial illusion of being grounded on a peaceful open field.
* **The Underside Reveal (The Sokovia / Iron Man Thruster Engine):**
  * As the visitor scrolls, the camera perspective pulls downward, revealing that this meadow is actually the top surface of a **celestial floating plateau**.
  * The underside reveals eroded geological strata, hanging roots, and **active industrial rocket thrusters firing downward**.
  * At the central apex/keel of the island: an **Iron Man / Mech pilot in an exoskeleton suit**, blasting thrusters upward to physically lift the island and drive the page scroll.
  * **Asset Architecture:** Built as **two separate modular layers** (Layer A: Top Meadow surface; Layer B: Underside Keel + Thrusters) to preserve 60fps performance, avoid massive vertical video files, and allow 3D differential parallax.

### C. The Excavation Crater Footer ("The Landing Ground")
* **The Concept:** A closed narrative loop. When the visitor scrolls to the very bottom, they don't hit a generic grey footer box—they land on solid earth at the rim of the **massive crater where the floating island was carved out**.
* **Visual Framing:** Silhouetted crater walls, hanging roots, and exposed stone against the dusk/night horizon.
* **Footer Contents:**
  1. **Surveyor's Plaque:** *"From this ground, we build systems."*
  2. **The Book Call Button:** Interactive ignition switch (`easyui.site/components/book-call-button` style) for scheduling consultations.
  3. **The Communication HUD:** One-click email copy, social coordinates (X, LinkedIn, GitHub), and live multi-timezone clock (Surat · San Francisco · UTC).
  4. **The "Return to Orbit" Control:** Smoothly glides the camera back to the floating sky island (`00:00 N, 00:00 E`).

### D. The Living Sky & Solar Chronometer Engine
* **24-Hour Continuous Time (`t ∈ [0, 24)`):**
  * Built on WebGL2 raymarched volumetric cumulus with 3D Perlin-Worley noise, Beer-Lambert self-shadowing, and multiple scattering.
  * 16 OKLCH keyframes interpolated in linear-light OKLab space, preventing muddy gray midtones during dawn/sunset.
  * Single `LightModel` driving the sky, cloud rim lighting, island shadows, and card materials.
* **The Bespoke Solar Chronometer (Adapted from PinUI ThermalDial):**
  * Circular glass lens with 1px hairline rim, 96 tick ring, and traveling comet wave.
  * Split-slot rolling digits (`HH : MM`) driven by spring physics.
  * Staggered letter-blur title indicating solar phase: **DAWN**, **MORNING**, **MIDDAY**, **AFTERNOON**, **GOLDEN HOUR**, **TWILIGHT**, **NIGHTFALL**.
  * Tactile haptic buzz (`navigator.vibrate?.(6)`) on phones when scrubbing across hours.
  * Double-click anywhere to snap back to the visitor's live local clock.
* **The Night Pack:**
  * **Shooting Stars:** Angled celestial streaks across the upper ionosphere every 15–30 seconds during night hours (`21:30 – 04:30`).
  * **Atmospheric Aurora:** Soft undulating emerald-green and violet ribbons (`#10b981` / `#8b5cf6`) across the northern horizon.

### E. The Bespoke 404 Page ("Lost Frequency")
* **Concept:** Instead of a generic template, the visitor lands on a quiet edge of the prairie knoll at twilight.
* **The Scene:** An authentic Art Deco vintage transistor radio sits in the tall grass.
* **The Interaction:** A rotary frequency dial. Tuning to `404 AM` plays quiet radio static / wind ambiance. Tuning to `100.0 FM (Home)` locks onto calm music with an action button: `RETURN TO HOMELAND →`.

---

# Part II: Full Content Audit (Old Portfolio vs. New Portfolio)

This section maps out every piece of existing copy, structure, and media in the original portfolio (`D:\Portfolio`), detailing exactly what to port, what to trim, and what new assets are required.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PORTFOLIO INVENTORY MATRIX                                                  │
├──────────────────────┬───────────────────────┬──────────────────────────────┤
│ Page in D:\Portfolio │ Current Structure     │ New Stratosphere Destination │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `app/page.tsx`       │ Hero, Selected Works, │ Stratosphere Homepage        │
│                      │ Philosophy, Footer    │ (Island → Pavilions → Crater)│
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `app/about/page.tsx` │ 3 Chapters, Timeline, │ The Explorer's Studio        │
│                      │ Tools, Gallery        │ (Observatory / Log / Audio)  │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `app/projects/page`  │ 3-Tier Catalog,       │ The Flight Log               │
│                      │ Filter Pills, Table   │ (Specimens + Experiments)    │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `sentinel/page.tsx`  │ 546-line case study + │ Executive Dossier: Sentinel  │
│                      │ Live Embed Prototype  │ (30s Reel + Decision Cards)  │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `lokai/page.tsx`      │ 545-line case study + │ Executive Dossier: LokAI     │
│                      │ Live Embed Prototype  │ (30s Reel + Decision Cards)  │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `feul/page.tsx`       │ 511-line case study + │ Executive Dossier: Feul.AI   │
│                      │ Live Embed Prototype  │ (30s Reel + Decision Cards)  │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `journal/page.tsx`   │ 3 Placeholder Essays  │ Field Notes from the Sky     │
├──────────────────────┼───────────────────────┼──────────────────────────────┤
│ `resume/page.tsx`    │ Printable 2-col CV    │ Telemetry Dossier / Resume   │
└──────────────────────┴───────────────────────┴──────────────────────────────┘
```

---

## 2. Detailed Page-by-Page Audit & Transformation Plan

### 1. Homepage (`app/page.tsx`)
* **Existing Copy to Keep:**
  * *"Product Designer & Engineer"*
  * *"Designing in the AI space and thinking in systems — building products end to end, from the first question to the shipped interface."*
* **Transformation Required:**
  * Mount the **Type-Garden blooming loader** on initial entry.
  * Replace the static hero diorama with the **Two-Layer Floating Island** (Top prairie meadow + Underside thrusters/Iron Man apex).
  * Selected Works: Feature the **3 Flagship Projects** (Sentinel, LokAI, Feul) styled as semi-opaque obsidian pavilions with 1px hairline borders over the living sky.
  * Replace the flat footer with the **Excavation Crater Footer** + `BookCallButton`.

### 2. The 3 Flagship Case Studies (`sentinel`, `lokai`, `feul`)
Recruiters do not read 2,000-word walls of text. Case studies must adopt the **Air.inc / Executive Dossier** pattern (3 tiers of depth):

#### Tier 1: The 30-Second Motion Reel (Top of Case Study)
* Short, high-octane 30–45s product walkthrough video showcasing the shipped interface, interaction sound, and fluid states.
* Generated/edited using Motion Tools / After Effects.

#### Tier 2: The 1-Minute Executive Decision Cards
Instead of generic design process ("Discovery → Empathy → Wireframes"), highlight the **3 hardest engineering/design decisions**:
1. **FlytBase Sentinel (Wildfire Initial Attack Command):**
   * *Decision 1:* 90-Second Verification Window (Human authorization vs. autonomous dispatch).
   * *Decision 2:* The Attention Arbiter (Suppressing non-critical telemetry during active fire spread).
   * *Decision 3:* 3D Terrain Exploration vs. 2D Tactical Grid (Dual-fidelity map degradation ladder).
2. **LokAI (Indian Legal-AI Consumer Refund Guide):**
   * *Decision 1:* Deterministic Boundary Gates (No fabricated legal claims; grounded claim counters).
   * *Decision 2:* Multilingual Script Engine (Devanagari/Tamil typography with localized legal metaphors: 1915, e-Daakhil, registered post).
   * *Decision 3:* Stop-tier Response Modes (Disabling draft creation when legal merit is absent).
3. **Feul.AI (Vernacular Voice-Data Marketplace):**
   * *Decision 1:* Transparent Micro-Payout Contracts (Building trust with non-English gig contributors).
   * *Decision 2:* Audio Waveform Verification (Low-latency acoustic validation on budget mobile devices).
   * *Decision 3:* Tiered Contributor Reputation (Quality gates for model training datasets).

#### Tier 3: The Interactive Live Embed Prototype
* Embed the working prototypes (`/embed/sentinel`, `/embed/lokai`) in full-screen expandable modals so design directors can test the live software directly.

### 3. About Page (`app/about/page.tsx`) — "The Explorer's Studio"
* **Existing Content to Preserve:**
  * **Chapter 1: The Visual Foundation:**
    *"I didn't start in design — I started with images. Years of photography and editing taught me where the eye lands, what feels heavy, and why some combinations feel inevitable, long before I could explain any of it in design language."*
  * **Chapter 2: The Systems Shift:**
    *"Organising events and rebuilding the systems around them turned visual instinct into product practice. A screen is downstream of a decision — design the decision, not the screen. Prototype the doubt."*
  * **Chapter 3: Autonomous Intelligence:**
    *"Now I design in the AI and interaction space — interfaces where the system acts and the human authorizes. Sentinel's 90-second verification window, LokAI's boundary gates, Feul's visible payout contract."*
  * **Experience Timeline:**
    - `2026`: FlytBase Sentinel (Emergency response command interface)
    - `2025`: LokAI (Legal triage with boundary-safe AI responses)
    - `2025`: Feul.AI (Voice-data marketplace for vernacular contributors)
    - `2024 →`: Product Design & Engineering Practice
  * **Tool Groups:** Design (Figma, Framer), Engineering (React, Next.js, TypeScript, Tailwind, WebGL), AI & Research (Claude, Cursor, Python).
* **New Spatial Framing:**
  * Format the page as an **Observatory Log**.
  * Integrate the **SnapshotsGallery** as vintage photographic film slide mounts.
  * Integrate the **Transistor Radio / Spotify Widget** as the soundtrack station.

### 4. Projects Catalog (`app/projects/page.tsx`) — "The Flight Log"
* **Keep the 3-Tier Structure:**
  * *Tier 1: Specimen Plates* (Sentinel, LokAI, Feul).
  * *Tier 2: Client & Consumer MVPs* (Scribble, Design-Blend).
  * *Tier 3: Design Engineering Experiments:*
    - ASCII field shaders (WebGL · GLSL)
    - Risograph halftone kit (Figma · Plugin)
    - Scroll choreography set (GSAP · ScrollTrigger)
    - Physics artifacts (Matter.js)
    - Matrix bloom typography (CSS · Keyframes)
    - Time-of-day theming (CSS Vars · React)

### 5. Journal Page (`app/journal/page.tsx`) — "Field Notes from the Sky"
* **The 3 Canonical Essays:**
  1. *"Designing the decision, not the screen"* (Process: Why the layout is downstream of human decisions).
  2. *"Prototyping the doubt"* (Craft: Why an ugly clickable prototype ends arguments faster than 50 slides).
  3. *"Images taught me composition before product did"* (Story: How years of photography quietly built an engineering practice).
* **Format:** Pure distraction-free reading sheets floating in the upper atmosphere.

### 6. Resume Page (`app/resume/page.tsx`) — "Telemetry Dossier"
* Clean, high-contrast, printable 2-column layout.
* Includes one-click print override (`@media print`) and PDF download.

---

# Part III: Git Deployment Strategy

### Phase 1: Freeze & Checkpoint the Original Portfolio (`D:\Portfolio`)
Before making any changes to production, freeze the old version permanently:
```bash
git -C "D:\Portfolio" add .
git -C "D:\Portfolio" commit -m "chore: save v1 portfolio checkpoint before sky architecture"
git -C "D:\Portfolio" tag -a v1-checkpoint -m "Preserve v1 garden edition"
git -C "D:\Portfolio" push origin newcloud
git -C "D:\Portfolio" push origin v1-checkpoint
```

### Phase 2: Push New Sky Architecture to `skyportfolio`
Initialize `D:\Downloads\new portofio design` as a git repository and link to `https://github.com/rudy0Z/skyportfolio.git`:
```bash
cd "D:\Downloads\new portofio design"
git init
git remote add origin https://github.com/rudy0Z/skyportfolio.git
git add .
git commit -m "feat: complete stratosphere sky engine, solar chronometer, and floating island diorama"
git branch -M main
git push -u origin main
```

---

# Part IV: File-by-File Inventory, Intended Roles & Current Status

Following the full codebase audit and refactoring pass (November 2026), here is the canonical manifest of all files saved in the project, their originally planned purpose, what failed or succeeded, and their current operational status:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SKY PORTFOLIO FILE & ASSET INVENTORY ROADMAP                                                          │
├──────────────────────────────────────┬────────────────────────────────────────────────────────────────┤
│ File / Directory Path                │ Planned Role, Status & Execution Plan                          │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sky/VolumetricSky.tsx            │ CANONICAL SKY ENGINE (Active)                                  │
│                                      │ WebGL2 raymarched cumulus cloud shader with fractional         │
│                                      │ Brownian motion (fBm). LOCKED as the exclusive sky engine.    │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sky/DitherSky.tsx                │ RETIRED (Deprecated)                                           │
│ src/sky/VectorSky.tsx                │ Retro 1-bit Bayer dither and vector art shaders. Bypassed     │
│                                      │ per user directive: "no dither style, only volumetric".       │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sky/hud/SolarChronometer.tsx     │ COCKPIT HUD REMOVED FROM VIEW                                  │
│ src/sky/hud/PinUIThermalDial.tsx     │ Experimental debug instruments that caused the "cockpit"       │
│ src/sky/hud/PuffyUIGlassArc.tsx      │ clutter at the bottom-right. Completely purged from standard  │
│ src/sky/hud/SketcherUISpringSlider.tsx│ production viewport.                                           │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sky/ThermalSkyClock.tsx          │ TOP-RIGHT LUXURY LENS CLOCK (Active)                           │
│                                      │ Precision horological gauge anchored at top-right corner.      │
│                                      │ Stays unobtrusive in thumbnail mode; expands on click.         │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/components/navigation/           │ INTERACTIVE NOTCH & TRACKING FLOWER (Active)                   │
│ NavigationNotch.tsx                  │ Collapsible top pill housing navigation links, Lo-Fi audio     │
│ TrackingFlower.tsx                   │ player, and the living cursor-tracking flower. Morphs into     │
│ CompactAudioPlayer.tsx               │ compact 48px circle on scroll to prevent interference.         │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/components/originkit/            │ MULTI-SHADER GPU PROTO (Isolated / Replaced)                   │
│ Aetherglint.tsx, BluebellPass.tsx,   │ 5 heavy WebGL shaders intended for meadow grass & flowers.     │
│ GlimmerVale.tsx, BloomingFlower.tsx, │ Running all 5 simultaneously with volumetric clouds caused     │
│ MoonlitPetals.tsx                    │ GPU meltdown. Island base decoupled from synchronous contexts. │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/components/depth-flow/           │ 2.5D DEPTH-MAP PARALLAX (Available Foundation)                 │
│ DepthFlowCanvas.tsx,                 │ Lightweight fragment shaders using grayscale depth maps to     │
│ MeadowDepthShader.tsx                │ extrude flat images into mouse-responsive 3D planes.           │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/components/LumaKeyVideo.tsx      │ VIDEO PLAYBACK RETIRED (Replaced)                              │
│                                      │ Real-time canvas luma-keying for white video backgrounds.      │
│                                      │ Caused edge artifacts & performance drops; replaced by clean  │
│                                      │ static image cutout (/portrait-cutout.png).                    │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ public/portrait-cutout.png           │ CURRENT CHARACTER ARTWORK (Active)                             │
│                                      │ Clean static illustration cutout of Rudraksh at vintage desk.  │
│                                      │ Integrated with dynamic OKLCH lighting filters.                │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sections/HeroIsland.tsx          │ THE LIVING FLOATING ISLAND (Under Refinement)                  │
│                                      │ Orchestrates Layer 0.5 (Keel + Thrusters) and Layer 1-4.       │
│                                      │ Temporary SVG wedge placeholder slated for replacement by      │
│                                      │ pre-rendered 3D/AI asset (Meshy / Google Flow).                │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sections/StackingProjects.tsx    │ ORBITAL PAVILIONS (Active & Polished)                          │
│                                      │ 3 tactile stacking case study dossiers: Sentinel, LokAI,       │
│                                      │ Feul.AI with clean obsidian glass styling.                     │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ src/sections/ExcavationCraterFooter  │ EXCAVATION CRATER FOOTER (Active & Polished)                   │
│ .tsx                                 │ Bedrock touchdown ground datum (-42m) with editorial           │
│                                      │ typography, timezone clocks, and consultation briefing.        │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

# Part V: Strategic Next Steps for the Island Asset

1. **Retire Crude SVG Geometry:** The temporary triangular wedge in `HeroIsland.tsx` served only as an interactive layout anchor during refactoring. It will be replaced with an authentic 3D / illustrated floating meadow island plate.
2. **Model Asset Pipeline:**
   - Option A: Generate high-resolution front-angle and underside renders in **Meshy / Google Flow / Midjourney** with clean alpha channels.
   - Option B: Single lightweight Three.js / Spline GLTF model with baked textures, eliminating shader collisions while providing true 360° rotational parallax.
3. **Desk Lighting Integration:** The baked yellow lamp glow in the character illustration replaces clumsy procedural CSS glow blobs, preserving crisp line art and clean transparent margins.

