"use client";

import React, { useState } from "react";
import { Link, useRoute } from "@/router/Router";

export function NotFoundPage() {
  const { navigate } = useRoute();
  // Frequency in kHz/MHz: 404 (Lost Frequency static) -> 100.0 (Homeland FM)
  const [freq, setFreq] = useState(404);
  const isLocked = Math.abs(freq - 100) < 6;

  const handleTune = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreq(Number(e.target.value));
  };

  return (
    <div className="not-found-page relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 px-4 select-none text-white text-center">
      {/* Kicker */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/50 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
        <span>ALTITUDE DISCONTINUITY // FREQUENCY 404 KHZ</span>
      </div>

      <h1 className="font-serif text-[42px] sm:text-[64px] font-normal tracking-tight text-white mb-2 leading-none">
        Lost Frequency <span className="text-white/30">/</span> 404
      </h1>

      <p className="font-sans text-[15px] sm:text-[17px] text-white/70 max-w-lg mb-10 font-light">
        The coordinates you entered have drifted out of range. An authentic Art Deco transistor radio sits
        quietly in the prairie grass at twilight.
      </p>

      {/* Art Deco Transistor Radio Vector SVG */}
      <div className="relative w-full max-w-md p-6 rounded-3xl border border-white/20 bg-gradient-to-b from-[#2a1a10] via-[#1a110a] to-[#0d0805] shadow-[0_20px_60px_rgba(0,0,0,0.8)] mb-8">
        <svg viewBox="0 0 400 240" className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="radioCase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0a00" />
            </linearGradient>
            <linearGradient id="brassBezel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>

          {/* Bakelite Radio Body */}
          <rect x="20" y="10" width="360" height="220" rx="18" fill="url(#radioCase)" stroke="url(#brassBezel)" strokeWidth="2.5" />

          {/* Speaker Grille Slats (Left) */}
          <g stroke="#291206" strokeWidth="3" opacity="0.9">
            <line x1="45" y1="50" x2="160" y2="50" />
            <line x1="45" y1="65" x2="160" y2="65" />
            <line x1="45" y1="80" x2="160" y2="80" />
            <line x1="45" y1="95" x2="160" y2="95" />
            <line x1="45" y1="110" x2="160" y2="110" />
            <line x1="45" y1="125" x2="160" y2="125" />
            <line x1="45" y1="140" x2="160" y2="140" />
            <line x1="45" y1="155" x2="160" y2="155" />
            <line x1="45" y1="170" x2="160" y2="170" />
          </g>

          {/* Tuning Scale Display Window (Right) */}
          <rect x="180" y="45" width="180" height="75" rx="6" fill="#0c0704" stroke="#ca8a04" strokeWidth="1" />
          {/* Dial scale markings */}
          <text x="190" y="65" fill="#ca8a04" fontFamily="monospace" fontSize="9">
            AM 540 · 404 · 800 · 1200 · 1600
          </text>
          <text x="190" y="80" fill="#38bdf8" fontFamily="monospace" fontSize="9">
            FM 88 · 94 · 100.0 · 108 MHz
          </text>

          {/* Analog Tuning Needle (Controlled by slider) */}
          {/* Freq range: 50 -> 450 maps to x: 190 -> 345 */}
          {(() => {
            const needleX = 190 + ((freq - 50) / 400) * 155;
            return (
              <line
                x1={needleX}
                y1="50"
                x2={needleX}
                y2="115"
                stroke={isLocked ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                className="transition-all duration-100"
              />
            );
          })()}

          {/* Carrier Lock Indicator LED */}
          <circle
            cx="345"
            cy="105"
            r="4"
            fill={isLocked ? "#10b981" : "#450a0a"}
            className={isLocked ? "animate-pulse" : ""}
          />
          <text x="270" y="108" fill={isLocked ? "#10b981" : "#7f1d1d"} fontFamily="monospace" fontSize="8" fontWeight="bold">
            {isLocked ? "● CARRIER LOCKED" : "○ SEARCHING"}
          </text>

          {/* Vintage Brass Rotary Knobs */}
          {/* Volume Knob */}
          <circle cx="230" cy="175" r="24" fill="#1c0a00" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="230" cy="175" r="16" fill="#451a03" />
          <line x1="230" y1="155" x2="230" y2="165" stroke="#fef08a" strokeWidth="2" />
          <text x="230" y="210" fill="#a16207" fontFamily="monospace" fontSize="8" textAnchor="middle">
            VOLUME
          </text>

          {/* Tuning Knob */}
          <circle cx="310" cy="175" r="24" fill="#1c0a00" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="310" cy="175" r="16" fill="#451a03" />
          <line x1="310" y1="155" x2="310" y2="165" stroke="#fef08a" strokeWidth="2" />
          <text x="310" y="210" fill="#a16207" fontFamily="monospace" fontSize="8" textAnchor="middle">
            TUNING
          </text>

          {/* Prairie Grass Tufts around Radio Base */}
          <path d="M 10 235 Q 25 210, 35 190" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 20 238 Q 30 215, 45 200" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M 370 235 Q 360 210, 350 190" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 380 238 Q 370 215, 360 200" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.7" />
        </svg>

        {/* Rotary Frequency Slider Control */}
        <div className="mt-4 px-4">
          <div className="flex justify-between font-mono text-[10px] text-amber-300/70 mb-1">
            <span>STATIC 404 AM (LOST)</span>
            <span className="font-bold text-white">{freq.toFixed(1)} {freq > 150 ? "AM" : "FM"}</span>
            <span className="text-emerald-400">100.0 FM (HOME)</span>
          </div>
          <input
            type="range"
            min="50"
            max="450"
            step="1"
            value={freq}
            onChange={handleTune}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* Signal Status and Navigation Action */}
      <div className="flex flex-col items-center gap-4">
        {isLocked ? (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-md max-w-md animate-fade-in">
            <div className="font-mono text-[11px] font-bold text-emerald-400 mb-1">
              ✓ HOMELAND BROADCAST DETECTED // 100.0 FM
            </div>
            <p className="font-sans text-[13px] text-emerald-200/80 mb-3">
              Carrier signal locked to Stratosphere origin. All flight systems and portfolio routes available.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-full bg-emerald-400 text-black font-semibold text-[13px] hover:bg-emerald-300 transition-colors shadow-lg"
            >
              RETURN TO HOMELAND →
            </button>
          </div>
        ) : (
          <div className="font-mono text-[11px] text-white/50 flex items-center gap-2">
            <span className="animate-pulse">●</span>
            <span>Drag the frequency slider above to 100.0 FM to tune out of the static.</span>
          </div>
        )}

        <div className="mt-4 flex gap-3 font-mono text-[11px] text-white/40">
          <Link href="/" className="hover:text-white underline">
            Home Ground
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-white underline">
            About
          </Link>
          <span>·</span>
          <Link href="/projects" className="hover:text-white underline">
            Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
