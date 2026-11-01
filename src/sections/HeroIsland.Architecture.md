# HeroIsland - Production-Ready 3D Atmospheric Hero

## Overview

`HeroIsland.tsx` is a single-file React 19 + TypeScript component architecture for an ultimate portfolio hero section. It operates as a cohesive 3D-feeling world layered over your persistent full-page WebGL/CSS 24-hour OKLCH sky engine (`CodedSky.tsx`).

The scene features **"Optical Botanica & Obsidian Glass"** aesthetic with:
- High-chroma colors (electric indigos, slate-air blues, incandescent ambers)
- Obsidian glass materials (`rgba(16,20,36,0.85)` + `backdrop-blur(26px)`)
- Live astronomical lighting from `src/lib/lighting.ts`
- Zero React render lag on scroll/drag via shared mutable refs

---

## 1. Visual Design System

### Color Palette (OKLCH Engine)
All colors derive from `src/lib/skyPalette.ts` which defines a **24-hour keyframe track**:
```typescript
const SKY_TRACK: Stop<SkyStop>[] = [
  { at: 0, value: Z(/* midnight indigo */)},
  { at: 6, value: Z(/* blue hour */)},
  { at: 12, value: Z(/* midday slate */)},
  { at: 18, value: Z(/* terracotta sunset */)},
  // ... 16 total stops spanning sunrise → golden hour → dusk → night
];
```

**Live relighting hooks** automatically update all surfaces:
- `--sky-sun-glow` – Thermal dial saturation, thruster plasma color
- `--sky-cloud-rim` – Petal canopy hue, wildflower tints
- `--sky-terrain` – Meadow grass gradient base, rock strata grading
- `--grade-tint` – Video slot atmospheric multiplication factor

### Typography
- **Display Headers:** *Fraunces Variable* (optical sizing, wonk axis)
- **Body & UI:** *Inter Variable*
- **Temporal Telemetry:** *JetBrains Mono*

---

## 2. Layout Structure & Scroll Choreography

### 300vh World Model
The hero container spans **300vh** with a sticky `100vh` viewport stage (`.hero-stage`). As visitor scrolls down (`--p: 0 → 1`), camera executes continuous perspective pull:

#### Phase 1: Rest Position (scroll = 0%)
- Visitor is **grounded** on wide asymmetric prairie ridge (spans edge-to-edge `128vw`)
- Wild fescue grass, clover, and shimmering daisy crests frame screen
- Overhead: **MoonlitPetals** cherry blossom canopy arching across top right, dropping drifting petals

#### Phase 2: On Scroll (scroll 20% → 70%)
- Entire landmass **dollies upward and backward** (`translateY` + scale-down parallax)
- Revealing this tranquil meadow is actually a **massive floating island suspended in stratosphere**
- Subterranean rock keel comes into view below

#### Phase 3: Keel Revelation (scroll > 70%)
- Full Sokovia underside revealed
- **Iron Man Plasma Thrusters** ignite at lowest bedrock tip
- Thruster flame cones flare based on scroll velocity physics

---

## 3. Three-Layer Unified Hero Sandwich

### LAYER 0.5: The Sokovia Keel & Plasma Thrusters (`z-index: 0`)

**Physical Location:** Beneath plateau turf, hidden until scroll reveals

**Materials:**
- Craggy bedrock strata with multi-stop geological gradients
- Hanging ancient root tendrils (SVG path curves)
- Tectonic quarry shelves (layered translucent fills)

**Iron Man Plasma Thrusters:**
- **Idle State:** Boot jets and core manifolds pulse soft cyan/turquoise corona with heat-shimmer displacement
- **Scroll-Velocity State:** When user scrolls down, flames flare into blinding white-cyan jets
  ```typescript
  const thrusterScale = clamp(1 + abs(scrollVelocity) * 0.8, 1, 2.2);
  ```
- Cast live upward bounce lighting against stone strata (night mode only)

**Central Apex (Aesthetic):** Stylized Arc Reactor exoskeleton mounted at keel tip (x=800, y=900), pulsing in sync with thermal wave sine function.

### LAYER 1: Background Meadow Horizon & Distant Ridges (`z-index: 1`)

**Generative Prairie Grass:**
- Procedural stipple-grained prairie horizon spanning `128vw`
- SVG paths with animated sways (`@keyframes grassSway`)
- Base frequency turbulence noise filter for texture variation

**Wildflower Clusters:**
- 25 randomized clusters positioned using seeded PRNG
- Each cluster samples hues from rose-violet range (280°–350° OKLCH)
- Gentle sine-wave wiggle animations based on timestamp phase

**Parallax Physics:**
```typescript
const paralaxY = useMemoParallax(scrollProgress, MAX_PARALLAX_Y, PARALLAX_SCALE_FACTOR);
// Returns interpolated Y-offset: lerp(target, current, 0.08)
```

### LAYER 2: Character Video Slot (`z-index: 2`)

**Responsive CSS Grid Slot Container:**
```tsx
<div data-slot="character-video-slot" className="relative aspect-[16/9] w-[min(80vw,900px)]">
  {/* Obsidian Glass Frame */}
  <div style={{ 
    backgroundColor: "rgba(16, 20, 36, 0.85)",
    backdropFilter: "blur(26px) saturate(1.35)",
    border: "1px solid rgba(255,255,255,0.14)"
  }} />
  
  {/* Video Element with Live Relighting */}
  <video autoPlay loop muted playsInline>
    <source src="/videos/designer-vintage-desk-loop.mp4" type="video/mp4" />
  </video>
</div>
```

**Dynamic Filter Hook (Real-time Atmospheric Grading):**
```typescript
const videoFilterStyle = useMemoVideoRelightFilter(light): CSSProperties => {
  const { palette, grade, cloud, daylight } = light;
  
  return {
    // Atmospheric tint multiplication
    filter: `
      sepia(${grade.tintAmount * 0.25})
      saturate(${1 + grade.tintAmount * 0.3})
      contrast(1.02)
      drop-shadow(${cloud.keyX * 40}px ${cloud.keyY * 20}px ${24}px ${palette.sunGlow})
    `,
    
    // Night emissive overlay (laptop screen / lamp warm glow)
    backgroundColor: `rgba(245,158,11, ${(1 - daylight) * 0.15})`,
    mixBlendMode: "screen",
  };
};
```

**Three Light Channels Applied Simultaneously:**
1. **Atmospheric Tint** – Multiplies video exposure/color by `--sky-terrain` and `--sky-haze`
2. **Directional Sun Rim-Light** – Dynamic `drop-shadow()` tracking sun azimuth (warm gold left edge at dawn, fiery vermilion right edge at sunset)
3. **Night Emissive Glow** – Automated overlay mask on laptop screen & desk lamp ignites (`opacity: calc(1 - var(--daylight))`) casting warm amber bounce-light onto character

### LAYER 3: MoonlitPetals Canopy Overhead (`z-index: 3`)

**Cherry Blossom Arch:**
- Positioned top-right quadrant (width: `60vw`, height: `50vh`)
- Reuses existing `MoonlitPetals` component with custom seed (42) for deterministic geometry
- Drops occasional drifting petals with physics-based swaying

**Soft Shadow Projection:**
```tsx
<div style={{
  background: "radial-gradient(ellipse at 70% 0%, rgba(0,0,0,0.25) 0%, transparent 60%)",
  mixBlendMode: "multiply",
  opacity: 0.6 - dayProportion * 0.4,
}} />
```

### LAYER 4: Foreground Macro Wildflowers (`z-index: 4`)

**Large Stylized Blooms:**
- SVG-style geometric representations (5-petal ellipses, pistil centers)
- **Cursor-responsive hover states** (`hover:scale-110`)
- Gentle sway animations driven by shared timestamp sine waves
- Golden hour backlighting (`mixBlendMode: screen`)

**Interactive Sway Physics:**
```typescript
const swayAngle = Math.sin(timestamp * 0.5 + index * 0.7) * 3;
const petalOffset = Math.cos(timestamp * 0.8 + index * 1.1) * 2;
```

---

## 4. Interactive HUD & Temporal Control Integration

### Navbar ThermalSkyClock Thumbnail (LensClock Mode)

**Compact 56px Circular Thumbnail:**
- Features 72-tick PinUI thermal wave + LensClock panning geometry (`PAN_DISTANCE = 22`)
- Clicking expands into full interactive popover dial
- Supports both Analog Horology (AM/PM moonphase sub-dial) and Digital Rolling Slot-Machine modes

**Full Popover Dial Capabilities:**
- Continuous 24h unwrapping drag interaction
- Fine scrub (Shift+drag) for ±15-minute precision
- Preset quick-jumps: Dawn (6.25), Noon (12), Golden Hour (17.5), Midnight (0)

### Global Reactive Binding

Changing time on clock **instantly updates** entire hero's:
- Sky gradient stops (sampled from `SKY_TRACK`)
- Star opacity (`--star-opacity`)
- Ridge sparkle color (multiplied by daylight factor)
- Cloud rim-lighting intensity (`--cloud-rim-strength`)
- Video relighting filters (atmospheric tint, directional shadow)

All updates propagate via **CSS custom properties** written once per frame by `applyLight()`:
```typescript
export function applyLight(light: LightModel) {
  const root = document.documentElement.style;
  root.setProperty("--sky-zenith", p.zenith);
  root.setProperty("--sky-mid", p.mid);
  root.setProperty("--sky-horizon", p.horizon);
  // ... 50+ tokens written atomically
}
```

---

## 5. Performance Architecture

### Zero React Render Lag on Scroll/Drag

**Shared Mutable Ref Pattern:**
All parallax/thruster/math computed in refs, never component state:
```typescript
const paralaxY = useMemoParallax(scrollProgress, MAX_PARALLAX_Y, PARALLAX_SCALE_FACTOR);
const thrusterScale = useMemoThrusterFlare(scrollVelocity, THRUSTER_VELOCITY_MULTIPLIER);

// Inside hook:
ref.current = lerp(ref.current, target, 0.08); // Smooth interpolation
return ref.current; // Returned directly, no re-render triggered
```

**Root CSS Properties for Particles:**
Heavy math drives `transform:` transforms written directly to DOM nodes via inline styles updated in rAF loops, bypassing React's reconciliation entirely.

### Strict Canvas/Animation Lifecycle Management

**IntersectionObserver Halted Loops:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        setIsInView(true); // Resume MoonlitPetals rAF, start thruster physics
      } else {
        setIsInView(false); // Halt all heavy WebGL/Canvas loops
      }
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
  );
  
  observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```

**Lazy Component Mounting:**
Sub-components (`HeroKeelThrusters`, `MeadowBackdrop`, `MoonlitPetalsCanopy`) only render when `isVisible === true`.

### Clean Architecture

**Portable Tailwind/CSS Rules:**
```css
.obsidian-glass {
  background: rgba(16, 20, 36, 0.85);
  backdrop-filter: blur(26px) saturate(135%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 24px 48px -12px rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.14);
}
```

**Strict TypeScript Types:**
```typescript
interface HeroIslandProps {
  skyTime?: number;          // 0–24 hours, bound to ThermalSkyClock
  scrollProgress: number;     // 0 (rest) → 1 (fully scrolled)
  scrollVelocity: number;     // pixels/ms, signed (+ down, - up)
  videoSlotOpacity?: number;  // 0–1 fade control
  onEnterViewport?: () => void;
  onExitViewport?: () => void;
  className?: string;
}
```

**Modular Separation:**
```
src/
├─ sections/
│  ├─ HeroIsland.tsx              # Main component
│  ├─ HeroIsland.example.tsx      # Full integration demo
│  └─ HeroIsland.Architecture.md  # This file
├─ hooks/
│  └─ useScrollVelocity.ts        # High-performance scroll tracker
├─ lib/
│  ├─ lighting.ts                 # OKLCH light model
│  ├─ skyPalette.ts               # 24h atmosphere track
│  └─ color.ts                    # OKLCH conversion helpers
└─ components/
   └─ originkit/
      └─ MoonlitPetals.tsx        # Cherry blossom generative system
```

---

## 6. Installation Guide

### Step 1: Add Dependencies
Already included in your project:
- ✅ React 19
- ✅ TypeScript (strict mode enabled)
- ✅ Tailwind CSS
- ✅ OKLCH color library (`@/lib/color`)

### Step 2: Import & Use
```tsx
import { HeroIsland } from "@/sections/HeroIsland";
import useScrollVelocity from "@/hooks/useScrollVelocity";

export default function Page() {
  const { scrollTop, smoothedVelocity } = useScrollVelocity();
  
  return (
    <section className="relative min-h-screen">
      <HeroIsland
        scrollProgress={scrollTop / 2000}
        scrollVelocity={smoothedVelocity}
        className="bg-gradient-to-b from-[var(--sky-mid)] to-[var(--sky-horizon)]"
      />
    </section>
  );
}
```

### Step 3: Wire ThermalSkyClock
```tsx
import { ThermalSkyClock } from "@/sky/ThermalSkyClock";
import { useSkyTime } from "@/lib/useTimeOfDay";

function Navbar() {
  const skyTime = useSkyTime();
  
  return (
    <nav className="fixed top-0 z-50">
      <ThermalSkyClock size="thumbnail" mode="analog" />
    </nav>
  );
}
```

### Step 4: Add Global Styles
Add to `globals.css` or `tailwind.config.js`:
```css
@keyframes grassSway {
  0%, 100% { transform: rotate(-2deg) scaleY(1); }
  50% { transform: rotate(2deg) scaleY(1.02); }
}

@keyframes petalWiggle {
  0%, 100% { transform: skewX(-3deg); }
  50% { transform: skewX(3deg); }
}
```

---

## 7. Optimization Checklist

- ✅ **Memoization:** All gradient computations wrapped in `useMemo()` hooks
- ✅ **Lazy Loading:** Sub-components mount only when visible
- ✅ **Reduced Motion:** Respects `prefers-reduced-motion` media query
- ✅ **Performance Budget:** rAF loops throttled to 30fps when velocity < 0.01 px/ms
- ✅ **Memory Cleanup:** IntersectionObservers disconnected on unmount
- ✅ **Zero Garbage Collection:** Shared mutable refs prevent object allocation on scroll

---

## 8. Future Enhancements (Not Yet Implemented)

- [ ] WebGL particle system for petal drift physics (instead of Canvas fallback)
- [ ] Web Audio API spatial audio for thruster hum (pitch varies with scroll velocity)
- [ ] Haptic feedback API integration (mobile vibration on thruster flare)
- [ ] SSR hydration guard for `window.scrollY` (Next.js App Router compatibility)
- [ ] A/B testing framework for alternative thruster materials (plasma vs combustion)

---

## 9. Credits & References

**Inspired By:**
- Contra Labs' atmospheric interfaces
- Linear's kinetic scroll choreography
- Awwwards Site of the Year winners (2023–2024)
- DVFLab's generative meadow shaders (`MeadowDepthShader.tsx`)
- Originkit's botanical systems (`BloomingFlower`, `BluebellPass`)

**Technical Foundations:**
- OKLCH color space (Google's perceptually-uniform luminance-chroma-hue model)
- React 19 useTransition & useDeferredValue hooks (available but not yet utilized)
- CSS Custom Properties as zero-cost communication channel between sky engine & hero

---

**Version:** 1.0.0  
**License:** Proprietary (SKYPORTFOLIO Internal Use Only)  
**Last Updated:** October 29, 2026
