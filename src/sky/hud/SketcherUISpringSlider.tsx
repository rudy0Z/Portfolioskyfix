import { useRef, useState, useCallback, type PointerEvent } from "react";
import { formatTime, momentLabel } from "@/lib/timeOfDay";
import {
  glideSkyTime,
  pauseSkyTime,
  playSkyTime,
  syncToLocalTime,
  useSkyTime,
  useSyncState,
} from "@/lib/useTimeOfDay";
import { solarAltitude } from "@/lib/celestial";

export function SketcherUISpringSlider() {
  const t = useSkyTime();
  const { mode, playing } = useSyncState();
  const live = mode === "auto";
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const sunAlt = solarAltitude(t);
  const phase = momentLabel(t);
  const pct = (t / 24) * 100;

  const updateFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pad = 12;
    const effectiveW = Math.max(1, rect.width - pad * 2);
    const clampedX = Math.max(0, Math.min(effectiveW, clientX - (rect.left + pad)));
    const newT = (clampedX / effectiveW) * 24;
    glideSkyTime(newT, { omega: 20 });
  }, []);

  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e.clientX);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    updateFromPointer(e.clientX);
  };

  const onPointerUp = () => setDragging(false);

  // 24 Hour ticks
  const ticks = Array.from({ length: 49 }, (_, i) => {
    const hour = i / 2;
    const isFullHour = i % 2 === 0;
    const isQuarter = i % 12 === 0;
    return { hour, isFullHour, isQuarter };
  });

  return (
    <div className="sketcher-ui-slider flex flex-col p-3 w-64 select-none">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          SPRING SLIDER // SKETCHER
        </span>
        <div className="flex items-center gap-2">
          <span className="font-serif text-[18px] font-semibold text-white">
            {formatTime(t)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-amber-300">
            {phase}
          </span>
        </div>
      </div>

      {/* Spring Physics Ruler Track */}
      <div
        ref={trackRef}
        className="relative h-14 flex items-center cursor-ew-resize py-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Baseline ruler wire */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/20 -translate-y-1/2" />

        {/* Ticks graduation */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-1">
          {ticks.map((tk, idx) => (
            <div
              key={idx}
              className={`w-[1px] transition-all ${
                tk.isQuarter
                  ? "h-6 bg-white/70"
                  : tk.isFullHour
                    ? "h-4 bg-white/35"
                    : "h-2 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Dawn / Noon / Dusk indicator marks */}
        <div className="absolute top-1 left-[25%] -translate-x-1/2 font-mono text-[7px] text-sky-300/40 pointer-events-none">
          06:00
        </div>
        <div className="absolute top-1 left-[50%] -translate-x-1/2 font-mono text-[7px] text-amber-300/60 pointer-events-none font-bold">
          12:00
        </div>
        <div className="absolute top-1 left-[75%] -translate-x-1/2 font-mono text-[7px] text-orange-300/40 pointer-events-none">
          18:00
        </div>

        {/* Spring Slider Puck / Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none transition-transform duration-75 ease-out"
          style={{ left: `calc(12px + ${(pct / 100)} * (100% - 24px))` }}
        >
          {/* Elastic Puck */}
          <div
            className={`w-4 h-7 rounded-[3px] border border-amber-300/80 bg-neutral-900 shadow-[0_0_12px_rgba(251,191,36,0.5)] flex items-center justify-center transition-transform ${
              dragging ? "scale-110 shadow-[0_0_18px_rgba(251,191,36,0.8)]" : ""
            }`}
          >
            <div className="w-[1.5px] h-4 bg-amber-400" />
          </div>

          {/* Coordinate indicator tooltip */}
          <span className="mt-1 font-mono text-[8px] text-white/60 whitespace-nowrap bg-black/60 px-1 rounded border border-white/10">
            {sunAlt >= 0 ? `+${Math.round(sunAlt)}°` : `${Math.round(sunAlt)}°`}
          </span>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 font-mono text-[10px]">
        <button
          type="button"
          onClick={syncToLocalTime}
          className={`px-2 py-0.5 rounded transition-colors ${
            live ? "text-emerald-400 bg-emerald-500/10" : "text-white/50 hover:text-white"
          }`}
        >
          {live ? "● LOCAL TIME" : "SYNC LOCAL"}
        </button>

        <button
          type="button"
          onClick={() => (playing ? pauseSkyTime() : playSkyTime())}
          className="text-white/60 hover:text-white transition-colors"
        >
          {playing ? "PAUSE ❚❚" : "TIMELAPSE ▶"}
        </button>
      </div>
    </div>
  );
}
