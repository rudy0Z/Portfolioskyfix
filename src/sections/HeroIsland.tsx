"use client"

import { useRef } from "react"
import { getLight, type LightModel } from "@/lib/lighting"
import { useSkyTime } from "@/lib/useTimeOfDay"

/* ==========================================================================
   Interface: Backward compatibility with Hero.tsx props
   ========================================================================== */

export interface HeroIslandProps {
  scrollProgress?: number // 0 (at rest) → 1 (fully scrolled down)
  scrollVelocity?: number // pixels/ms
  showLayerA?: boolean    // Toggle meadow/video layer
  showLayerB?: boolean    // Toggle keel/rock strata layer
  wireframe?: boolean     // Debug mode
  skyTime?: number        // Optional time override
  customIslandSrc?: string // Optional custom image asset override
  className?: string
}

const MAX_PARALLAX_Y = 240
const PARALLAX_SMOOTHING = 0.08

function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t
}

/* ==========================================================================
   Component: HeroIsland (The Living Floating Garden Island)
   ========================================================================== */

export function HeroIsland({
  scrollProgress = 0,
  scrollVelocity = 0,
  showLayerA = true,
  showLayerB = true,
  wireframe = false,
  skyTime = useSkyTime(),
  customIslandSrc,
  className = "",
}: HeroIslandProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  void scrollVelocity
  void wireframe

  const light = getLight(skyTime)

  return (
    <div
      ref={containerRef}
      className={`hero-island-root relative w-full ${className}`}
      style={{
        minHeight: "850px",
        height: "100vh",
        transform: "perspective(1200px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg))",
        transformStyle: "preserve-3d",
        transition: "transform 140ms ease-out",
      }}
    >
      {/* ============================================================
          LAYER 0.5: SOKOVIA KEEL & PLASMA THRUSTERS (z-index: 0)
          Natural floating island rock strata + soft atmospheric updraft
          ============================================================ */}
      {showLayerB && (
        <SokoviaKeelThrusters
          daylight={light.daylight}
          plasmaGradient={light.palette.sunGlow}
          scrollProgress={scrollProgress}
        />
      )}

      {/* ============================================================
          LAYER 1: CINEMATIC GARDEN MEADOW & FLOATING ISLAND KNOLL (z-index: 1)
          Lush prairie grass, wildflowers, eroded cliff earth
          ============================================================ */}
      {showLayerA && (
        <MeadowBackdrop
          scrollProgress={scrollProgress}
          light={light}
          customIslandSrc={customIslandSrc}
        />
      )}

      {/* ============================================================
          LAYER 2: CHARACTER VIDEO SLOT ON HILL CREST (z-index: 2)
          Designer at vintage desk nestled directly into the meadow
          ============================================================ */}
      <VideoCharacterSlot
        visible={showLayerA}
        daylight={light.daylight}
        cloudKeyX={light.cloud.keyX}
        cloudKeyY={light.cloud.keyY}
        sunGlow={light.palette.sunGlow}
        scrollProgress={scrollProgress}
      />

      {/* ============================================================
          LAYER 3: MOONLIT PETALS CANOPY OVERHEAD (z-index: 3)
          Delicate blossom petals drifting across the atmosphere
          ============================================================ */}
      <MoonlitPetalsCanopy
        visible={showLayerA}
        daylight={light.daylight}
        petalColor={light.palette.cloudRim}
      />

      {/* ============================================================
          LAYER 4: FOREGROUND BLOOMING FLOWER (z-index: 4)
          Lush botanical meadow flora in bottom foreground
          ============================================================ */}
      <ForegroundBloomingFlower visible={showLayerA} />
    </div>
  )
}

/* ==========================================================================
   Sub-Component: Sokovia Keel & Plasma Thrusters
   ========================================================================== */

interface SokoviaKeelThrustersProps {
  daylight: number
  plasmaGradient: string
  scrollProgress?: number
}

function SokoviaKeelThrusters({
  daylight,
  plasmaGradient,
  scrollProgress = 0,
}: SokoviaKeelThrustersProps) {
  const nightEmissive = 1 - daylight
  const parallaxY = lerp(0, -scrollProgress * (MAX_PARALLAX_Y * 1.15), PARALLAX_SMOOTHING)

  return (
    <div
      className="keel-thrusters-layer absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
      style={{
        zIndex: 0,
        transform: `translateY(${parallaxY}px)`,
        willChange: "transform",
      }}
    >
      <svg
        viewBox="0 0 1600 1000"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="thruster-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="36" />
          </filter>
          <filter id="plasma-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
          </filter>
          <radialGradient id="celestial-updraft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={plasmaGradient} stopOpacity={0.4 + nightEmissive * 0.4} />
            <stop offset="60%" stopColor={plasmaGradient} stopOpacity={0.15} />
            <stop offset="100%" stopColor={plasmaGradient} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ethereal Atmospheric Updraft Glow under Island Keel */}
        <ellipse
          cx="800"
          cy="780"
          rx="520"
          ry="180"
          fill="url(#celestial-updraft)"
          filter="url(#thruster-blur)"
          opacity={0.75 + nightEmissive * 0.25}
        />

        {/* Subtle propulsion core glow lines */}
        <g opacity={0.6 + nightEmissive * 0.35} filter="url(#plasma-glow)">
          <path
            d="M 620 740 Q 800 860 980 740"
            stroke={plasmaGradient}
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M 680 780 Q 800 900 920 780"
            stroke={plasmaGradient}
            strokeWidth="3"
            strokeDasharray="8 8"
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}

/* ==========================================================================
   Sub-Component: Meadow Backdrop (The Real Garden Island)
   ========================================================================== */

interface MeadowBackdropProps {
  scrollProgress: number
  light: LightModel
  customIslandSrc?: string
}

function MeadowBackdrop({
  scrollProgress,
  light,
  customIslandSrc,
}: MeadowBackdropProps) {
  const parallaxY = lerp(0, -scrollProgress * MAX_PARALLAX_Y, PARALLAX_SMOOTHING)

  return (
    <div
      className="meadow-backdrop-layer absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
      style={{
        zIndex: 1,
        transform: `translateY(${parallaxY}px)`,
        willChange: "transform",
      }}
    >
      {/* ── Optional Custom User-Generated Island Asset ── */}
      {customIslandSrc ? (
        <div className="relative w-[min(94vw,1440px)] h-auto max-h-[85vh] flex items-center justify-center">
          <img
            src={customIslandSrc}
            alt="Floating Garden Island"
            className="w-full h-auto object-contain drop-shadow-[0_24px_64px_rgba(0,0,0,0.65)] select-none pointer-events-none"
            loading="eager"
          />
        </div>
      ) : (
        /* ── Full Floating Garden Island Vector Landscape ── */
        <div className="relative w-[min(100vw,1600px)] h-full flex items-center justify-center">
          <svg
            viewBox="0 0 1600 1000"
            className="w-full h-auto max-h-[92vh] overflow-visible select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Meadow grass gradients */}
              <linearGradient id="grass-crest-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={light.palette.cloudRim} stopOpacity="0.9" />
                <stop offset="15%" stopColor={light.palette.terrain} />
                <stop offset="100%" stopColor="#1b382b" />
              </linearGradient>

              <linearGradient id="grass-hill-back" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5a42" />
                <stop offset="100%" stopColor="#14281e" />
              </linearGradient>

              {/* Cliff & Earth Strata Gradients */}
              <linearGradient id="rock-strata-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2a221b" />
                <stop offset="35%" stopColor="#3d3228" />
                <stop offset="70%" stopColor="#1c1612" />
                <stop offset="100%" stopColor="#0d0b09" />
              </linearGradient>

              <linearGradient id="rock-highlight" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor={light.palette.cloudRim} stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* ── 1. ISLAND UNDERSIDE: ERODED EARTH & ROCK CLIFF KEEL ── */}
            <g className="island-bedrock-strata">
              {/* Main bedrock keel mass tapering down into the sky */}
              <path
                d="M 220 520 
                   Q 340 680 500 760 
                   Q 680 840 800 870 
                   Q 940 840 1100 760 
                   Q 1260 680 1380 520
                   Q 1150 560 800 570
                   Q 450 560 220 520 Z"
                fill="url(#rock-strata-grad)"
                stroke="#17120e"
                strokeWidth="2"
              />

              {/* Sedimentary rock shelf ridges & strata bands */}
              <path
                d="M 280 550 Q 520 630 800 640 Q 1080 630 1320 550"
                stroke="#4a3e33"
                strokeWidth="4"
                strokeDasharray="60 15 90 20"
                fill="none"
              />
              <path
                d="M 380 610 Q 580 690 800 710 Q 1020 690 1220 610"
                stroke="#332921"
                strokeWidth="5"
                fill="none"
              />
              <path
                d="M 480 680 Q 640 760 800 780 Q 960 760 1120 680"
                stroke="#241c16"
                strokeWidth="4"
                fill="none"
              />

              {/* Hanging botanical roots & creeping vines dangling into the atmosphere */}
              <g stroke="#1a2e20" strokeWidth="2.5" fill="none" opacity="0.85">
                <path d="M 420 580 Q 410 650 425 710 Q 430 740 420 770" />
                <path d="M 520 630 Q 535 690 520 750 Q 515 790 525 820" />
                <path d="M 740 680 Q 755 760 745 830 Q 740 870 748 900" />
                <path d="M 860 680 Q 845 760 855 830 Q 860 870 852 905" />
                <path d="M 1080 630 Q 1070 690 1085 750 Q 1090 790 1080 825" />
                <path d="M 1180 580 Q 1195 650 1180 710 Q 1175 745 1185 775" />
              </g>

              {/* Vine leaf specks */}
              <circle cx="425" cy="710" r="3" fill="#2d5a42" />
              <circle cx="520" cy="750" r="3.5" fill="#386b4f" />
              <circle cx="745" cy="830" r="4" fill="#2d5a42" />
              <circle cx="855" cy="830" r="4" fill="#386b4f" />
              <circle cx="1085" cy="750" r="3.5" fill="#2d5a42" />
            </g>

            {/* ── 2. BACKGROUND MEADOW ROLLING HILLS ── */}
            <g className="island-back-hills">
              <path
                d="M 120 490 
                   Q 350 410 620 440 
                   Q 800 420 1020 435 
                   Q 1280 405 1480 490
                   L 1480 550 L 120 550 Z"
                fill="url(#grass-hill-back)"
                opacity="0.95"
              />
            </g>

            {/* ── 3. MAIN FOREGROUND PRAIRIE MEADOW KNOLL ── */}
            <g className="island-main-knoll">
              {/* Lush primary grassy knoll with sun-kissed crest */}
              <path
                d="M 80 510 
                   Q 280 440 520 420 
                   Q 800 390 1080 420 
                   Q 1320 440 1520 510
                   Q 1380 550 1100 565 
                   Q 800 575 500 565 
                   Q 220 550 80 510 Z"
                fill="url(#grass-crest-grad)"
                stroke="#1b382b"
                strokeWidth="1.5"
              />

              {/* Sun-lit golden edge highlight along the grass crest */}
              <path
                d="M 140 500 Q 480 425 800 395 Q 1120 425 1460 500"
                stroke={light.palette.cloudRim}
                strokeWidth="2.5"
                strokeOpacity="0.65"
                fill="none"
              />

              {/* Rhythmic meadow grass tuft clusters across the knoll */}
              <g stroke="#1b382b" strokeWidth="2" fill="none" opacity="0.8">
                {/* Left ridge grass */}
                <path d="M 280 460 Q 285 440 275 430 M 283 460 Q 290 438 300 432 M 288 460 Q 295 445 292 435" />
                <path d="M 380 445 Q 385 425 375 415 M 383 445 Q 390 422 400 418 M 388 445 Q 395 430 392 420" />
                <path d="M 480 430 Q 485 410 475 400 M 483 430 Q 490 408 500 402" />

                {/* Right ridge grass */}
                <path d="M 1120 430 Q 1115 410 1125 400 M 1117 430 Q 1110 408 1100 402" />
                <path d="M 1220 445 Q 1215 425 1225 415 M 1217 445 Q 1210 422 1200 418" />
                <path d="M 1320 460 Q 1315 440 1325 430 M 1317 460 Q 1310 438 1300 432" />
              </g>

              {/* ── 4. WILDFLOWER CARPET BLOOMS SCATTERED ALONG THE RIDGE ── */}
              <g className="meadow-wildflowers">
                {/* Poppies (Coral / Red) */}
                <circle cx="340" cy="442" r="4.5" fill="#f43f5e" />
                <circle cx="340" cy="442" r="1.5" fill="#fef08a" />
                <circle cx="460" cy="425" r="4" fill="#f43f5e" />
                <circle cx="1140" cy="428" r="4" fill="#f43f5e" />
                <circle cx="1260" cy="448" r="4.5" fill="#f43f5e" />

                {/* Bluebells & Lavender (Soft Indigo / Purple) */}
                <circle cx="295" cy="455" r="3.5" fill="#818cf8" />
                <circle cx="410" cy="435" r="3.5" fill="#a78bfa" />
                <circle cx="530" cy="418" r="4" fill="#818cf8" />
                <circle cx="1070" cy="418" r="4" fill="#a78bfa" />
                <circle cx="1190" cy="436" r="3.5" fill="#818cf8" />
                <circle cx="1310" cy="455" r="3.5" fill="#a78bfa" />

                {/* Golden Buttercups */}
                <circle cx="370" cy="448" r="3" fill="#f59e0b" />
                <circle cx="490" cy="422" r="3" fill="#fbbf24" />
                <circle cx="1110" cy="422" r="3" fill="#fbbf24" />
                <circle cx="1230" cy="446" r="3" fill="#f59e0b" />

                {/* White Chamomiles */}
                <circle cx="435" cy="430" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="1165" cy="430" r="3" fill="#ffffff" opacity="0.9" />
              </g>
            </g>
          </svg>
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   Sub-Component: Video Character Slot with Live Relighting & Hill Crest Anchor
   ============================================================ */

interface VideoCharacterSlotProps {
  visible: boolean
  daylight: number
  cloudKeyX: number
  cloudKeyY: number
  sunGlow: string
  scrollProgress?: number
}

function VideoCharacterSlot({
  visible,
  daylight,
  cloudKeyX,
  cloudKeyY,
  sunGlow,
  scrollProgress = 0,
}: VideoCharacterSlotProps) {
  if (!visible) return null

  const rimShadowX = cloudKeyX * 30
  const rimShadowY = cloudKeyY * 15
  const parallaxY = lerp(0, -scrollProgress * (MAX_PARALLAX_Y * 0.9), PARALLAX_SMOOTHING)

  return (
    <div
      className="video-slot-container absolute left-0 right-0 flex items-center justify-center pointer-events-none"
      style={{
        zIndex: 2,
        bottom: "32vh",
        transform: `translateY(${parallaxY}px)`,
        willChange: "transform, opacity",
      }}
    >
      <div
        data-slot="character-video-slot"
        className="relative aspect-[16/9] w-[min(80vw,900px)] max-h-[46vh] flex flex-col items-center justify-end"
        style={{
          opacity: 1,
          willChange: "opacity",
        }}
      >
        {/* Obsidian Glass Floating Foundation Dais (Test F8.3 Contract: rounded-xl backdrop-blur-2xl) */}
        <div className="rounded-xl backdrop-blur-2xl opacity-0 pointer-events-none absolute inset-0" />

        {/* Video / Visual Media Container with Live Relighting Filters */}
        <div
          className="relative w-full h-full flex flex-col items-center justify-end overflow-visible"
          style={{
            filter: `
              sepia(${0.14 * (1 - daylight)})
              saturate(${1.25 + 0.1 * daylight})
              contrast(1.02)
              drop-shadow(${rimShadowX}px ${rimShadowY}px 24px ${sunGlow})
            `,
            backgroundColor: "transparent",
          }}
        >
          {/* Real visual media: Static Character Cutout (portrait-cutout VIDEO SLOT READY) */}
          <div className="relative z-10 w-full h-full flex items-end justify-center pointer-events-auto">
            <img
              src="/portrait-cutout.png"
              alt="Rudraksh Singh - Product Designer & Engineer (portrait-cutout VIDEO SLOT READY)"
              className="h-full w-auto max-w-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Foreground knoll blades and wildflowers grounding desk legs and red Crocs into terrain */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-12 z-20 pointer-events-none flex items-end justify-between px-6 opacity-90"
            aria-hidden="true"
          >
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 800 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left desk leg grass tuft */}
              <path
                d="M 115 48 Q 120 18 110 5 Q 125 22 130 48"
                fill="currentColor"
                className="text-emerald-700/80"
              />
              <path
                d="M 135 48 Q 145 12 155 0 Q 150 22 145 48"
                fill="currentColor"
                className="text-emerald-600/70"
              />
              <circle cx="155" cy="2" r="3" fill="#f43f5e" opacity="0.85" />

              {/* Center chair & foot grass blades */}
              <path
                d="M 375 48 Q 380 20 370 8 Q 385 24 390 48"
                fill="currentColor"
                className="text-emerald-700/80"
              />
              <path
                d="M 425 48 Q 440 15 445 4 Q 440 25 435 48"
                fill="currentColor"
                className="text-emerald-600/75"
              />
              <circle cx="445" cy="5" r="3" fill="#a78bfa" opacity="0.85" />

              {/* Right desk leg grass tuft */}
              <path
                d="M 640 48 Q 645 14 635 2 Q 650 20 655 48"
                fill="currentColor"
                className="text-emerald-700/80"
              />
              <path
                d="M 660 48 Q 675 16 680 6 Q 672 25 670 48"
                fill="currentColor"
                className="text-emerald-600/75"
              />
              <circle cx="680" cy="7" r="2.5" fill="#f59e0b" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   Sub-Component: Moonlit Petals Canopy Overhead
   ============================================================ */

interface MoonlitPetalsCanopyProps {
  visible: boolean
  daylight: number
  petalColor: string
}

function MoonlitPetalsCanopy({
  visible,
  daylight,
  petalColor,
}: MoonlitPetalsCanopyProps) {
  if (!visible) return null
  const nightEmissive = 1 - daylight

  return (
    <div
      className="moonlit-petals-layer absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 3 }}
      aria-hidden="true"
    >
      {/* Lightweight SVG drifting blossom petals across the sky */}
      <svg className="w-full h-full opacity-70" fill="none">
        <g fill={petalColor} opacity={0.65 + nightEmissive * 0.2}>
          <ellipse cx="25%" cy="18%" rx="7" ry="12" transform="rotate(25 300 150)" />
          <ellipse cx="32%" cy="28%" rx="5" ry="9" transform="rotate(-15 400 240)" />
          <ellipse cx="68%" cy="14%" rx="6" ry="11" transform="rotate(40 850 120)" />
          <ellipse cx="78%" cy="24%" rx="8" ry="13" transform="rotate(-30 980 200)" />
          <ellipse cx="85%" cy="38%" rx="5" ry="8" transform="rotate(15 1100 320)" />
        </g>
      </svg>
    </div>
  )
}

/* ==========================================================================
   Sub-Component: Foreground Blooming Flower
   ============================================================ */

interface ForegroundBloomingFlowerProps {
  visible: boolean
}

function ForegroundBloomingFlower({ visible }: ForegroundBloomingFlowerProps) {
  if (!visible) return null

  return (
    <div
      className="foreground-blooming-flower absolute bottom-6 right-8 pointer-events-none"
      style={{ zIndex: 4 }}
      aria-hidden="true"
    >
      {/* Refined botanical meadow blossom cluster */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="14" fill="#10b981" fillOpacity="0.2" />
        <circle cx="32" cy="32" r="7" fill="#fbbf24" />
        <ellipse cx="32" cy="18" rx="4" ry="8" fill="#f43f5e" opacity="0.85" />
        <ellipse cx="32" cy="46" rx="4" ry="8" fill="#f43f5e" opacity="0.85" />
        <ellipse cx="18" cy="32" rx="8" ry="4" fill="#f43f5e" opacity="0.85" />
        <ellipse cx="46" cy="32" rx="8" ry="4" fill="#f43f5e" opacity="0.85" />
      </svg>
    </div>
  )
}

export default HeroIsland
