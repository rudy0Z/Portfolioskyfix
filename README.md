# Sky Field — Portfolio

> **Canonical Specification & Content Audit:** Read [docs/MASTER-MANIFESTO-AND-CONTENT-AUDIT.md](./docs/MASTER-MANIFESTO-AND-CONTENT-AUDIT.md) for the full narrative architecture, visual direction, and comparison with the legacy portfolio.


A portfolio suspended in a living sky. Continuous 24-hour light, a floating
island, and project cards that sit in the air like glass pavilions.

Vite + React 19 + TypeScript. No UI framework, no animation library, no 3D
library — plain React, plain CSS custom properties, and one hand-written
WebGL2 renderer for the photographic sky.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/ (static, deploy anywhere)
npm run preview    # serve dist/ locally
```

Node 20.19+ (Vite 8) and a WebGL2 browser (every current desktop and mobile browser).
Without WebGL2 the sky falls back to the CSS cloud plates automatically.

## The idea in one line

One continuous place, lit by one sun, that you scroll *through*: grounded
prairie → the ground falls away and reveals a floating island → the island
leaves and the sky becomes the page.

## How the sky works

Everything derives from a single number, `t` ∈ [0, 24) — fractional hours.

```
useTimeOfDay.ts      store (useSyncExternalStore) → t, with a spring for glides
   ↓
skyPalette.ts        16 OKLCH keyframes → full atmosphere per stop
color.ts             OKLab interpolation + gamut mapping → sRGB hex
celestial.ts         sun/moon arc, star field, moon phase
   ↓
lighting.ts          getLight(t) → LightModel (the one truth)
   ↓                    ↓
applyLight()         SkyRenderer.setLight()
CSS variables        WebGL uniforms (linear light)
   ↓                    ↓
island, cards, HUD   photographic sky
```

Components never compute colour. The CSS side reads `var(--sky-zenith)`,
`var(--sun-x)` and so on; the WebGL side converts the same palette to linear
light. That's why scrubbing the clock re-lights the clouds, the island rim and
the glass cards together.

### The photographic sky (`volumetric`, default)

`src/sky/webgl/` — a ray-marched cumulus layer, rendered every frame.

- **Noise.** At start-up a 64³ tileable Perlin–Worley volume is baked on the
  GPU (≈ms). Inverted Worley cells are what make the rounded "cauliflower"
  lobes of real cumulus.
- **Clouds.** The camera sits *inside* the cloud layer — it's a floating
  island — so towers stand around you and recede into haze. A 2D weather map
  decides where clouds grow and how tall; the 3D noise carves turrets; a
  finer octave erodes wisps at the base and billows at the top.
- **Light.** Each sample marches toward the sun (or the moon at night) for
  Beer–Lambert self-shadowing, uses a dual-lobe phase function (the silver
  lining when you look toward the sun), a three-octave multiple-scattering
  approximation, sky light from above and bounce from below. Distance fogs
  clouds into the horizon colour (aerial perspective).
- **Composite** (full resolution): palette sky blended in linear light, sun
  with limb darkening and lens glare, a moon with the real phase, a star
  field with a faint Milky Way, filmic highlight roll-off, grain.
- **Cost control.** Clouds render at ~0.5× resolution and are up-sampled
  with a bicubic filter; temporal accumulation (per-frame jitter, blended
  history) removes the noise of a short march. Resolution adapts to the
  device's frame time (0.28×–0.62×). 30 fps when idle, every frame while you
  scrub or scroll, nothing in a background tab.
- **Motion.** Clouds drift with the wind; scrubbing the clock races them like
  a timelapse; scrolling lifts the camera through the layer.
- `prefers-reduced-motion`: no drift, renders only when the time changes.

**Why OKLCH:** a linear-RGB or HSL ramp from terracotta (18:40) to violet
(20:30) passes through gray. Interpolating in OKLab holds hue and perceptual
lightness, and gamut-mapping by reducing chroma keeps sunset oranges saturated
instead of clipping.

**Sun and moon:** rise 05:40, set 18:40, antiphase moon. The WebGL camera is
fitted so its horizon sits exactly where the CSS layout expects it (85 % of
the viewport), so the sun disc and the CSS `--sun-x/--sun-y` always agree.

## The variants

Switch live with `1` / `2` / `3` or the HUD dots. Also by prop
(`<CodedSky variant="dither" />`) or URL (`?variant=dither`).

| Variant | Implementation | Character |
| --- | --- | --- |
| `volumetric` **(default)** | WebGL2 ray-marched cumulus (falls back to feathered CSS plates) | Photographic |
| `dither` | 560px canvas, Bayer 4×4 quantized to 14 ink steps | Risograph print |
| `vector` | CSS gradients + crisp SVG paths | Precise, architectural |

## The clock

`src/sky/TimeClock.tsx` — a 24-hour solar dial with a digital readout at its
centre. It shows your real local time until you touch it.

- **One turn = one day**, laid out like the sky: midnight at the bottom,
  sunrise left, noon top, sunset right. The sun (or the moon, in its real
  phase) rides the ring.
- **Press anywhere on the ring** and the sky glides there; keep dragging and
  it follows. No winding. Wheel over the ring: ±15 min.
- **Digits:** hours and minutes roll — scroll or drag them up/down (hours ±1,
  minutes ±5, Shift ±1 min). **Click to type** a time: `7`, `730`, `19:45`,
  `7pm`, `noon`.
- **Back to now** returns to live time; **▶** plays the day as a timelapse.
- Every change goes through a critically damped spring in the time store, so
  the sky eases instead of cutting.

Keys: `[` hides the HUD, `1`/`2`/`3` switch variants.

## The island reveal

`Hero.tsx` is a 300vh section with a 100vh sticky stage. One scroll listener
writes `--p` (0→1) to the stage; all motion is `transform`/`opacity` only.

`Island.tsx` deliberately draws **no figure and no props** — the character
art is a slot, not a shape:

```
.hero-art-slot          ← editorial image / video cutout goes here
data-slot="surface"     the lit turf crest
data-slot="underside"   rock, strata and roots, dissolving into mist
data-slot="mist"        drifting mist at the base
```

**To add the real art:** put an `<img>` or `<video>` inside `.hero-art-slot`.
It moves with the scroll parallax and inherits the sky grade.

## Porting back to Next.js (App Router)

The components use only standard `<button>`, `<a>`, `<div>`, `<canvas>` and
CSS classes; client components are already marked `"use client"`.

1. Copy `src/lib`, `src/sky`, `src/sections`, `src/styles/global.css`.
2. Add `"@/*": ["./src/*"]` to `tsconfig` paths (or import relatively).
3. Import `global.css` in `app/layout.tsx`; render `<CodedSky>` inside a
   `position: fixed` wrapper in the layout so it survives route changes.
4. The WebGL renderer touches `window` only inside effects, so it is SSR-safe;
   the server snapshot pins the sky to noon until hydration.
5. Install the three `@fontsource-variable/*` packages, or swap the
   `--font-*` tokens for `next/font`.
6. The legacy `timeofdaychange` CustomEvent still fires; `useTimeOfDay()`
   still returns `morning | afternoon | evening | night`.

## QA

`qa/` drives headless Chrome over CDP (needs `google-chrome` on PATH). Point
them at another server with `SKY_URL=http://…`.

```bash
node qa/shoot.mjs "http://localhost:5173/?t=18:00&skyqa=12" out.png   # one frame
node qa/clock.mjs                                                       # clock interaction test
node qa/capture.mjs                                                     # time × variant matrix → qa/shots
node qa/mobile.mjs                                                      # 390×844 + a11y audit
```

Headless Chrome renders WebGL in software (~1 fps), so `?skyqa=N` renders N
accumulation frames before the first paint — screenshots then show the
converged image. Never judge performance from a headless run.

URL params make any state reproducible: `?t=18:40&variant=dither`.

## Accessibility

- The ring is a `role="slider"` with `aria-valuetext` ("18:40, Sunset"),
  arrow keys (15 min), Shift+arrow (1 h), PageUp/Down (3 h), Home/End.
- Hours and minutes are `role="spinbutton"`s; Enter or a digit key opens the
  text field; Escape cancels.
- `prefers-reduced-motion` stops cloud drift, twinkle and the hero hint.
- Every control is a native button with a text label.

## Known limits

- The moon's terminator in the HUD is an offset-disc approximation.
- The WebGL sky is the heaviest thing on the page; it adapts resolution, but
  on very old integrated GPUs expect a softer sky rather than a fast one.
- `TimeDial.tsx` and `VariantSwitcher.tsx` are earlier controls kept for
  reference; nothing imports them.
- Placeholder project copy — swap `PROJECTS` in `sections/Works.tsx`.
