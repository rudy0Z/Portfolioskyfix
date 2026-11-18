# GEMINI CARBON / AI WORKSPACE CHEAT-SHEET
# Project: Sky Field Portfolio (Rudraksh Singh)
# Quick Reference & Token-Optimized Context Loader

## SYSTEM OVERVIEW
- **Stack:** React 19, TypeScript 5.9, Vite 8, Tailwind v4, WebGL2 (GLSL), HTML5 Canvas 2D.
- **Theme:** Living atmosphere portfolio driven by 24h solar time.
- **Root Entry:** `src/App.tsx` (Single-page hash router + persistent sky + loader + route views).

---

## CRITICAL INVARIANTS (NEVER BREAK)
1. **Never hardcode hex colors in components:** Always use CSS variables:
   - Sky: `var(--sky-zenith)`, `var(--sky-mid)`, `var(--sky-horizon)`, `var(--sky-haze)`, `var(--sky-sun-glow)`
   - Surfaces: `var(--ui)`, `var(--ui-dim)`, `var(--ui-faint)`, `var(--hairline)`, `var(--hairline-strong)`
2. **Never break the single time store:** Solar time `t ∈ [0, 24)` lives in `src/lib/useTimeOfDay.ts`.
3. **Never invent metrics/claims:** Use verified benchmarks only (Sentinel: 7:12 exercise run, LokAI: 4 laws gate-checked, Feul: ₹100 session one).
4. **Never introduce `transition: all`:** Always specify exact CSS properties.
5. **Never omit aspect-ratio on media containers:** Required for zero-CLS compliance.

---

## WHERE TO EDIT FOR COMMON TASKS

| If You Need To... | Edit These Files |
| :--- | :--- |
| **Add/Modify Case Studies** | `src/caseStudies/sentinel.ts`, `lokai.ts`, `feul.ts`, or `types.ts` |
| **Change Case Study Layout** | `src/pages/CaseStudyPage.tsx` and `src/styles/case-reader.css` |
| **Edit Homepage Sections / Beats** | `src/sections/HomeBeats.tsx` and `src/styles/home-beats.css` |
| **Modify Project Cards on Homepage**| `src/sections/StackingProjects.tsx` and `src/styles/global.css` |
| **Tweak Sky Lighting & Palette** | `src/lib/skyPalette.ts`, `src/lib/lighting.ts`, `src/lib/color.ts` |
| **Adjust Volumetric Clouds / Sun Rays**| `src/sky/webgl/shaders.ts` and `src/sky/webgl/SkyRenderer.ts` |
| **Tune Garden Grass, Flowers, Wind** | `src/components/originkit/BluebellPass.tsx` and `src/sections/GardenField.tsx` |
| **Modify Clock Horizon Instrument** | `src/sky/ThermalSkyClock.tsx` |
| **Adjust Navigation & Header** | `src/components/Header.tsx` |
| **Edit Footer, Timezones, Contact** | `src/sections/SiteFooter.tsx` |
| **Change Global Typography & Shell** | `src/styles/global.css` |

---

## KEY COMPONENT & FILE INDEX

- `src/App.tsx`: Top-level router switch, mounting `<Hero />`, `<StackingProjects />`, `<HomeBeats />`, `<SiteFooter />`.
- `src/lib/heroClock.ts`: Normalized scroll position `heroClock.p` driving the Push, Swallow, and Mist Handoff.
- `src/lib/frameBudget.ts`: 8-tier hysteresis quality governor (`T0` to `T7`) defending frame budgets.
- `src/sections/HeroMist.tsx`: 3-strip GPU-composited canvas mist generator replacing opacity fades.
- `src/sections/HomeBeats.tsx`: 8-beat homepage progression (`Manifesto`, `Recognition`, `Greenhouse`, `FAQ`, `NOW`, `Colophon`).
- `src/caseStudies/types.ts`: TypeScript contracts for `narrative`, `decision`, `fact-gate`, `anatomy`, `embed`, `video`.

---

## BUILD & VERIFICATION COMMANDS
```bash
npm run typecheck    # Must pass with 0 errors (tsc --noEmit)
npm run build        # Production bundle check (tsc -b && vite build)
npm run dev          # Start local dev server on http://localhost:5173/
```
