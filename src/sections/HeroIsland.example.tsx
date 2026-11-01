/**
 * HeroIsland Usage Example - Full Integration with ThermalSkyClock
 * 
 * This component demonstrates how to wire up HeroIsland with:
 * - ThermalSkyClock for time-of-day control
 * - useScrollVelocity for thruster physics
 * - IntersectionObserver lifecycle management
 */

"use client";

import React, { useRef } from "react";
import { HeroIsland } from "./HeroIsland";
import { ThermalSkyClock } from "@/sky/ThermalSkyClock";
import useScrollVelocity from "@/hooks/useScrollVelocity";

export function HeroIslandDemo() {
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Bind scroll velocity with viewport awareness
  const { scrollTop, velocity, direction, smoothedVelocity } = useScrollVelocity(
    [], // Empty deps = always track
  );

  const [clockTime, setClockTime] = React.useState(() => 
    Math.floor(new Date().getHours() + new Date().getMinutes() / 60)
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      {/* ============================================================
          NAVBAR: ThermalSkyClock Thumbnail (LensClock Mode)
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo Brand */}
          <div className="text-lg font-semibold tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>
            SKYPORTFOLIO
          </div>

          {/* Clock Thumbnail - Click to expand */}
          <div className="pointer-events-auto">
            <ThermalSkyClock
              size="thumbnail"
              mode="analog"
              onSizeChange={(size) => console.log("Clock size:", size)}
              className="cursor-pointer transition-transform hover:scale-105"
            />
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION: 300vh Scroll World
          ============================================================ */}
      <section ref={heroRef} className="relative">
        <HeroIsland
          skyTime={clockTime}
          scrollProgress={scrollTop / 2000}
          scrollVelocity={smoothedVelocity}
          className="bg-gradient-to-b from-[var(--sky-mid)] to-[var(--sky-horizon)]"
        />

        {/* Manual Time Controls (Optional Debug UI) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-3 rounded-xl backdrop-blur-md bg-slate-900/70 border border-white/10">
          {[
            { label: "Dawn", value: 6.25 },
            { label: "Noon", value: 12 },
            { label: "Golden Hour", value: 17.5 },
            { label: "Midnight", value: 0 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setClockTime(preset.value)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          
          {/* Analog Slider for Fine Control */}
          <input
            type="range"
            min="0"
            max="23.9"
            step="0.1"
            value={clockTime}
            onChange={(e) => setClockTime(parseFloat(e.target.value))}
            className="w-32 accent-indigo-500"
          />
        </div>
      </section>

      {/* ============================================================
          FILLER CONTENT (To Enable Scroll)
          ============================================================ */}
      <section className="relative h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: "Fraunces, variable" }}>
            SCROLL DOWN
          </h1>
          <p className="text-xl text-slate-400 font-light" style={{ fontFamily: "Inter, variable" }}>
            Reveal the floating island & Sokovia keel
          </p>
          
          {/* Scroll Progress Indicator */}
          <div className="mt-12 w-64 h-1 mx-auto rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-75"
              style={{ width: `${(scrollTop / 2000) * 100}%` }}
            />
          </div>
          <p className="text-sm font-mono text-slate-500">
            Velocity: {Math.abs(velocity * 1000).toFixed(2)} px/s | Direction: {direction === 1 ? "↓" : direction === -1 ? "↑" : "•"}
          </p>
        </div>
      </section>

      {/* ============================================================
          SECONDARY SECTIONS (Additional Content)
          ============================================================ */}
      <section className="relative min-h-[150vh] bg-gradient-to-b from-slate-950 to-slate-900 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-semibold" style={{ fontFamily: "Fraunces, variable" }}>
            Atmospheric Architecture
          </h2>
          <p className="text-lg leading-relaxed text-slate-400" style={{ fontFamily: "Inter, variable" }}>
            The entire scene is lit by a single astronomical light model. Every surface—from the prairie grass to the rock strata, 
            from the obsidian glass frame to the plasma thrusters—receives physically accurate directional lighting, volumetric haze, 
            and temporal color grading based on the active time of day.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-left">
            {[
              { label: "Sky Gradient", value: "OKLCH 24h track" },
              { label: "Cloud Rim Lighting", value: `Sun azimuth ${parseFloat("245").toFixed(0)}°` },
              { label: "Terrain Tint", value: `Kappa factor ${(0.35).toFixed(2)}` },
              { label: "Thruster Physics", value: `${(Math.abs(velocity * 1000)).toFixed(1)} px/s` },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">{stat.label}</p>
                <p className="text-lg font-semibold mt-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ============================================================
          GLOBAL STYLE OVERRIDES (Add to globals.css or tailwind.config.js)
          ============================================================ */}
      <style>{`
        @font-face {
          font-family: 'Fraunces';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: url('https://fonts.gstatic.com/s/fraunces/v15/Fraunces-Font.woff2') format('woff2');
          featureSettings: "ss01";
          opticalSizing: auto;
          variation-axis: "wdth", "GRAD";
        }
        
        @font-face {
          font-family: 'Inter Variable';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: url('https://fonts.gstatic.com/s/inter-uflational/r1/V8m0oRdptBcHJKTpoLKOVaJXNLnD2MOpNkA.woff2') format('woff2');
          optical-sizing: auto;
          weight: 100 900;
          angle: 0 180;
        }
        
        /* Grass sway animation */
        @keyframes grassSway {
          0%, 100% { transform: rotate(-2deg) scaleY(1); }
          50% { transform: rotate(2deg) scaleY(1.02); }
        }
        
        /* Petal wiggle effect */
        @keyframes petalWiggle {
          0%, 100% { transform: skewX(-3deg); }
          50% { transform: skewX(3deg); }
        }
        
        /* Obsidian glass shadow layering */
        .obsidian-glass {
          background: rgba(16, 20, 36, 0.85);
          backdrop-filter: blur(26px) saturate(135%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            0 24px 48px -12px rgba(0, 0, 0, 0.45),
            0 8px 16px -8px rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        
        /* Smooth parallax scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Reduce motion preference */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default HeroIslandDemo;
