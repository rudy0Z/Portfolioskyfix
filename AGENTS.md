# Sky Field — Agent Operating Context & Engineering Constitution

> **Single Source of Truth for AI Assistants (Gemini Carbon, Cursor, Claude Code, Antigravity)**  
> **Repository:** `d:\Portfolioskyfix` (`sky-field` v2.0 Stratosphere Edition)  
> **Stack:** React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS v4 + WebGL2 / GLSL + Canvas 2D + Motion

---

## 1. Core Architectural Laws (Do Not Violate)

1. **The Single Solar Truth (`t ∈ [0, 24)`):**
   * All lighting, sky atmosphere, garden ground tones, and glass reflections derive strictly from fractional solar hour `t` in `src/lib/useTimeOfDay.ts`.
   * **Never compute or hardcode hex colors inside UI components.** Components read CSS variables (`var(--sky-zenith)`, `var(--sky-sun-glow)`, `var(--ui)`, `var(--hairline)`).
   * Color interpolation runs through OKLab / OKLCH in `src/lib/color.ts` and `src/lib/skyPalette.ts` to prevent muddy gray midtones during dawn/sunset.

2. **The Two Central Governors:**
   * **`src/lib/heroClock.ts` (Scroll Coordinator):** Normalizes hero scroll into $p \in [0, 1]$. Coordinates the Push ($0 \to 0.3$), Swallow ($0.3 \to 0.75$), and Handoff ($0.75 \to 1.0$) phases. Direct JS bridge `heroClock.lift` feeds `PhotoSky.tsx` without CSS readback overhead.
   * **`src/lib/frameBudget.ts` (Render Coordinator):** 8-tier hysteresis governor (`T0` to `T7`). Dynamically sheds effects (sky shafts $\to$ pointer ripple $\to$ FBO resolution $\to$ blade counts) when frame time exceeds budgets.

3. **Pervasive Honesty & Anti-Slop Discipline:**
   * **Never invent vanity metrics, fake percentages, or unverified claims.**
   * *Sentinel:* "7:12 exercise-run decision against a 38-minute baseline" (not "90-second window achieved").
   * *LokAI:* "Four laws, gate-checked in code" (zero fabricated confidence percentages).
   * *Feul:* "₹100 withdrawable in session one" (not "instant UPI").
   * *Visual Assets:* Unsplash photos are labeled as credited moodboards. Portrait is labeled "Drawn portrait — not a photograph".

4. **Zero-CLS Container Constraint:**
   * All media containers (`.work-viewport`, `.work-stack-screen`) must specify explicit aspect ratios (`aspectRatio: proj.coverAspect`) to prevent layout shifts.

5. **Shell Geometry Law:**
   * All sections route through `.shell` (`max-width: 1240px`, `--gutter: clamp(20px, 4.5vw, 72px)`). Never introduce custom container widths.

---

## 2. Directory & Component Map

```
src/
├── App.tsx                     # Top-level shell, Persistent Sky, Intro Loader, Route viewport
├── main.tsx                    # Entry point mounting React 19 root
├── caseStudies/                # Polymorphic Case Study Content Models
│   ├── types.ts                # Schema: CaseStudy, DecisionBlock, FactGate, Anatomy, Embed
│   ├── sentinel.ts             # FlytBase Sentinel (Wildfire Emergency Command)
│   ├── lokai.ts                # LokAI (Deterministic Consumer Legal AI)
│   ├── feul.ts                 # Feul (Vernacular Voice-Data Marketplace)
│   └── index.ts                # Registry and export helpers
├── components/
│   ├── Header.tsx              # Top chrome: Wordmark, Nav links, ThermalSkyClock pill
│   ├── ButterflyCursor.tsx     # Canvas2D interactive cursor trail (reduced-motion gated)
│   ├── CelestialNight.tsx      # Ionosphere shooting stars and undulating auroras
│   ├── TypeGardenLoader.tsx    # Botanical seed blooming into persistent logo
│   └── music/                  # Ambient sound synthesizer host
├── lib/
│   ├── useTimeOfDay.ts         # Central time store (useSyncExternalStore), solar glide spring
│   ├── lighting.ts             # LightModel generator, getLight(t), applyLight() to CSS vars
│   ├── skyPalette.ts           # 16 OKLCH keyframes across 24 hours
│   ├── color.ts                # OKLab math, gamut mapping, linear light conversions
│   ├── heroClock.ts            # Pinned hero scroll timeline normalizer
│   └── frameBudget.ts          # 8-tier hysteresis quality governor
├── pages/
│   ├── CaseStudyPage.tsx       # Longform paper reader: Sticky TOC, Anatomy pins, Sandboxed embeds
│   ├── AboutPage.tsx           # Explorer studio, 3 chapters, Timeline, Credited moodboard
│   ├── ProjectsPage.tsx        # Catalog: 3 Flagships, MVPs, 6 Engineering experiments
│   ├── JournalPage.tsx         # Field notes & philosophy essays
│   ├── ResumePage.tsx          # Telemetry dossier (clean print overrides)
│   └── NotFoundPage.tsx        # 404 Radio frequency exploration
├── router/
│   └── Router.tsx              # Lightweight hash router (custom navigate, parseLocation)
├── sections/
│   ├── Hero.tsx                # Grounded knoll stage, desk illustration, scroll hint
│   ├── HeroMist.tsx            # 3-strip GPU-composited luminous mist exit
│   ├── GardenField.tsx         # Botanical meadow host, relighting step coordinator
│   ├── StackingProjects.tsx    # 3 Stacking orbital pavilions with looping WebM covers
│   ├── HomeBeats.tsx           # 8-beat homepage progression (Manifesto, FAQ, Greenhouse, NOW)
│   └── SiteFooter.tsx          # Excavation crater pavilion, live timezone clocks, contact
├── sky/
│   ├── CodedSky.tsx            # Sky engine variant switcher (default: volumetric)
│   ├── PhotoSky.tsx            # WebGL2 canvas mount, cadence decimation (cloudSkip)
│   ├── ThermalSkyClock.tsx     # Parabolic horizon instrument (sun/moon altitude + comet trail)
│   └── webgl/
│       ├── SkyRenderer.ts      # WebGL2 pipeline: Perlin-Worley 3D noise, Beer-Lambert scattering
│       └── shaders.ts          # GLSL: Raymarched cumulus, 160x96 FBO god rays, atmosphere
└── styles/
    ├── global.css              # Global tokens, reset, typography, shell, stacking projects
    ├── home-beats.css          # Homepage beats <=90vh viewport budget styles
    └── case-reader.css         # Case study paper reader, sticky TOC, anatomy callouts
```

---

## 3. Essential Commands & Toolchain

```bash
# Development server (with host exposed)
npm run dev

# Strict TypeScript check (0 errors required)
npm run typecheck     # tsc --noEmit

# Production build (clean bundle check)
npm run build         # tsc -b && vite build

# Local preview of dist/
npm run preview
```

---

## 4. Key Mathematical Formulations

* **Botanical Constant-Arc Curvature:**
  $$d_{\text{arc}} = \frac{L}{2 \cdot \cos \theta}$$
  Control points for grass blades preserve botanical arc length under wind load.

* **Exponential Aerial Perspective Falloff:**
  $$\text{air}(z) = \text{aerialK} \cdot \left(1 - e^{-\max(0, z_{\max} - z) \cdot 2.4}\right)$$
  Blends distant meadow elements and ground dabs into the horizon haze.

* **Volumetric Sun Transmittance (God Rays):**
  $$T_{i+1} = T_i \cdot (1.0 - \text{coverage}(\mathbf{p}) \cdot 0.72), \quad \text{Output} = \frac{1}{6} \sum_{i=1}^6 T_i$$
  6-step march directly toward the key light vector in an isolated 160×96 FBO.

---

## 5. Working Conventions for Modifications

1. **Styling:** Always use existing CSS custom properties defined in `:root` of `src/styles/global.css`. Avoid inline arbitrary hex codes.
2. **Animation:** Never introduce `transition: all`. Specify exact properties (`transform`, `opacity`, `background-color`). Buttons must have active press scaling (`transform: scale(0.96-0.97)`).
3. **Responsive Breakpoints:**
   * Mobile: `< 720px` (Stacking projects release to static flow; columns stack).
   * Tablet: `720px - 1023px`.
   * Desktop: `>= 1024px` (Full sticky stacking, 2-column case reader).
4. **Media Queries:** All `:hover` pseudo-classes on interactive components must be wrapped inside `@media (hover: hover)` to prevent sticky touch states on mobile devices.
