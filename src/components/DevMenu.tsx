"use client";

import React, { useState } from "react";
import { useSkyTime, glideSkyTime, syncToLocalTime } from "@/lib/useTimeOfDay";
import { formatTime, momentLabel } from "@/lib/timeOfDay";
import { useRoute, type RoutePath } from "@/router/Router";
import { type SkyVariant } from "@/sky/CodedSky";
import { type HudStyle } from "@/sky/hud/SolarChronometer";
import { type MusicWidgetStyle } from "@/components/music/MusicWidgetHost";

interface DevMenuProps {
  currentVariant: SkyVariant;
  onVariantChange: (v: SkyVariant) => void;
  currentHudStyle: HudStyle;
  onHudStyleChange: (s: HudStyle) => void;
  currentMusicStyle: MusicWidgetStyle;
  onMusicStyleChange: (s: MusicWidgetStyle) => void;
  showLayerA: boolean;
  onToggleLayerA: () => void;
  showLayerB: boolean;
  onToggleLayerB: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  forceAurora: boolean;
  onToggleAurora: () => void;
  forceNight: boolean;
  onToggleNight: () => void;
  butterflyEnabled: boolean;
  onToggleButterfly: () => void;
}

export function DevMenu({
  currentVariant,
  onVariantChange,
  currentHudStyle,
  onHudStyleChange,
  currentMusicStyle,
  onMusicStyleChange,
  showLayerA,
  onToggleLayerA,
  showLayerB,
  onToggleLayerB,
  wireframe,
  onToggleWireframe,
  forceAurora,
  onToggleAurora,
  forceNight,
  onToggleNight,
  butterflyEnabled,
  onToggleButterfly,
}: DevMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useSkyTime();
  const { path, navigate } = useRoute();

  const handleTimeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    glideSkyTime(val, { omega: 24 });
  };

  const handleSpawnStar = () => {
    window.dispatchEvent(new CustomEvent("spawnshootingstar"));
  };

  const PRESETS: { label: string; time: number }[] = [
    { label: "Dawn", time: 6.0 },
    { label: "Midday", time: 12.0 },
    { label: "Golden Hr", time: 17.75 },
    { label: "Twilight", time: 19.5 },
    { label: "Nightfall", time: 23.5 },
    { label: "Aurora Peak", time: 2.0 },
  ];

  const ROUTES: { path: RoutePath; label: string }[] = [
    { path: "/", label: "Home (Hero Island)" },
    { path: "/about", label: "About (Explorer's Studio)" },
    { path: "/projects", label: "Projects (Flight Log)" },
    { path: "/journal", label: "Journal (Field Notes)" },
    { path: "/resume", label: "Resume (Telemetry)" },
    { path: "/lab", label: "🧪 Originkit Lab (Shaders & Button)" },
    { path: "/404", label: "404 (Lost Frequency Radio)" },
    { path: "/case/sentinel", label: "Case: Sentinel" },
    { path: "/case/lokai", label: "Case: LokAI" },
    { path: "/case/feul", label: "Case: Feul.AI" },
  ];

  return (
    <>
      {/* Dev Menu Floating Trigger Button (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 z-[90]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl text-white font-mono text-[11px] uppercase tracking-wider hover:bg-white hover:text-black hover:border-white transition-all shadow-xl"
          title="Open Developer Testing Control Center"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DEV CONTROLS</span>
          <span className="text-white/40">{isOpen ? "✕" : "⚙"}</span>
        </button>
      </div>

      {/* Dev Menu Popup Modal */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-[95] w-96 max-h-[80vh] overflow-y-auto rounded-2xl border border-white/20 bg-neutral-950/95 backdrop-blur-2xl p-5 shadow-2xl text-white select-none">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold">
              <span>⚙ FLIGHT TEST CONTROLS // DEV HUD</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-mono text-[11px] text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            {/* 1. Time of Day Control */}
            <div>
              <div className="flex justify-between items-center font-mono text-[10px] text-white/60 mb-1.5">
                <span>TIME OF DAY ({formatTime(t)})</span>
                <span className="text-amber-300 font-bold uppercase">{momentLabel(t)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.05"
                value={t}
                onChange={handleTimeSlider}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none mb-2"
              />
              <div className="grid grid-cols-3 gap-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => glideSkyTime(p.time, { omega: 20 })}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 font-mono text-[9px] uppercase text-white/80"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={syncToLocalTime}
                className="w-full mt-1.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9.5px] uppercase"
              >
                ● Sync to Real Local Clock
              </button>
            </div>

            {/* 2. Sky Texture Variant */}
            <div className="pt-3 border-t border-white/10">
              <div className="font-mono text-[10px] text-white/60 mb-1.5">
                SKY TEXTURE VARIANT
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[9.5px]">
                {(["volumetric", "dither", "vector"] as SkyVariant[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onVariantChange(v)}
                    className={`py-1.5 rounded uppercase border transition-all ${
                      currentVariant === v
                        ? "bg-white text-black font-bold border-white"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Solar Chronometer HUD Design Style */}
            <div className="pt-3 border-t border-white/10">
              <div className="font-mono text-[10px] text-white/60 mb-1.5">
                SOLAR CHRONOMETER HUD DESIGN STYLE
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
                {(["pinui", "puffy", "sketcher"] as HudStyle[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onHudStyleChange(s);
                      window.dispatchEvent(new CustomEvent("hudstylechange", { detail: s }));
                    }}
                    className={`py-1.5 rounded uppercase border transition-all ${
                      currentHudStyle === s
                        ? "bg-amber-400 text-black font-bold border-amber-300"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Music Widget Style */}
            <div className="pt-3 border-t border-white/10">
              <div className="font-mono text-[10px] text-white/60 mb-1.5">
                MUSIC WIDGET STYLE
              </div>
              <div className="grid grid-cols-4 gap-1 font-mono text-[8.5px]">
                {(["pinui", "puffy", "transistor", "vinyl"] as MusicWidgetStyle[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onMusicStyleChange(m);
                      window.dispatchEvent(new CustomEvent("musicstylechange", { detail: m }));
                    }}
                    className={`py-1 rounded uppercase border transition-all ${
                      currentMusicStyle === m
                        ? "bg-sky-400 text-black font-bold border-sky-300"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Sub-Page Fast Jumper */}
            <div className="pt-3 border-t border-white/10">
              <div className="font-mono text-[10px] text-white/60 mb-1.5">
                ROUTE NAVIGATOR
              </div>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9.5px]">
                {ROUTES.map((r) => (
                  <button
                    key={r.path}
                    type="button"
                    onClick={() => {
                      navigate(r.path);
                      setIsOpen(false);
                    }}
                    className={`p-1.5 rounded text-left truncate border transition-all ${
                      path === r.path
                        ? "bg-white/25 text-white font-bold border-white/40"
                        : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Atmosphere & Celestial Triggers */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-mono text-[10px] text-white/60">
                ATMOSPHERE &amp; NIGHT PACK
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSpawnStar}
                  className="flex-1 py-1.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[9.5px] uppercase hover:bg-amber-400/20"
                >
                  ★ Spawn Shooting Star
                </button>
                <button
                  type="button"
                  onClick={onToggleAurora}
                  className={`flex-1 py-1.5 rounded font-mono text-[9.5px] uppercase border transition-all ${
                    forceAurora
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  {forceAurora ? "Aurora: ON" : "Aurora: AUTO"}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onToggleNight}
                  className={`flex-1 py-1.5 rounded font-mono text-[9.5px] uppercase border transition-all ${
                    forceNight
                      ? "bg-indigo-500/30 border-indigo-400 text-indigo-300"
                      : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  {forceNight ? "Night Pack: FORCE" : "Night Pack: AUTO"}
                </button>
                <button
                  type="button"
                  onClick={onToggleButterfly}
                  className={`flex-1 py-1.5 rounded font-mono text-[9.5px] uppercase border transition-all ${
                    butterflyEnabled
                      ? "bg-amber-500/30 border-amber-400 text-amber-300"
                      : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  {butterflyEnabled ? "Butterfly: ON" : "Butterfly: OFF"}
                </button>
              </div>
            </div>

            {/* 7. Hero Floating Island Inspector */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-mono text-[10px] text-white/60">
                FLOATING ISLAND LAYER INSPECTOR
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onToggleLayerA}
                  className={`flex-1 py-1.5 rounded font-mono text-[9.5px] uppercase border transition-all ${
                    showLayerA
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >
                  {showLayerA ? "Layer A: Meadow [ON]" : "Layer A: [OFF]"}
                </button>
                <button
                  type="button"
                  onClick={onToggleLayerB}
                  className={`flex-1 py-1.5 rounded font-mono text-[9.5px] uppercase border transition-all ${
                    showLayerB
                      ? "bg-orange-500/20 border-orange-400 text-orange-300"
                      : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >
                  {showLayerB ? "Layer B: Thrusters [ON]" : "Layer B: [OFF]"}
                </button>
              </div>
              <button
                type="button"
                onClick={onToggleWireframe}
                className={`w-full py-1.5 rounded font-mono text-[9.5px] uppercase border transition-all ${
                  wireframe
                    ? "bg-cyan-500/30 border-cyan-400 text-cyan-300"
                    : "bg-white/5 border-white/10 text-white/60"
                }`}
              >
                {wireframe ? "Wireframe Mesh: ON" : "Wireframe Mesh: OFF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
