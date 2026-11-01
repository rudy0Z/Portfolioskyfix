import { useCallback, useRef, useState, type PointerEvent } from "react";
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

export function PuffyUIGlassArc() {
  const t = useSkyTime();
  const { mode, playing } = useSyncState();
  const live = mode === "auto";
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time normalized to 0..1 for arc
  const norm = Math.max(0, Math.min(1, t / 24));
  const sunAlt = solarAltitude(t);
  const phase = momentLabel(t);

  const handlePointer = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.58;
    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle from 12 o'clock vertical (0 is top, +90 is right, -90 is left)
    let theta = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (theta < -140) theta = -140;
    if (theta > 140) theta = 140;

    const progress = (theta + 140) / 280; // 0..1
    const newTime = progress * 24;
    glideSkyTime(newTime, { omega: 22 });
  }, []);

  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    handlePointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    handlePointer(e.clientX, e.clientY);
  };

  const onPointerUp = () => setDragging(false);

  // SVG Arc coordinates (center = 100, 95; radius = 80; sweep -140 deg to +140 deg)
  const radius = 80;
  const startAngle = -140;
  const totalSweep = 280;
  const currentAngle = startAngle + norm * totalSweep;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const knobX = 100 + radius * Math.sin(toRad(currentAngle));
  const knobY = 95 - radius * Math.cos(toRad(currentAngle));

  // Dynamic active glowing arc path
  const sweepAngle = norm * totalSweep;
  const largeArcFlag = sweepAngle > 180 ? 1 : 0;
  const activeArcD =
    norm > 0.005
      ? `M 48.58 156.28 A 80 80 0 ${largeArcFlag} 1 ${knobX.toFixed(2)} ${knobY.toFixed(2)}`
      : "";

  return (
    <div
      ref={containerRef}
      className="puffy-ui-glass-arc relative flex flex-col items-center p-3 select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <span className="font-mono text-[9px] uppercase tracking-widest text-sky-200/50">
          GLASS ARC // PUFFYUI
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[9px] uppercase tracking-wider text-amber-200">
          {phase}
        </span>
      </div>

      <div className="relative w-48 h-36 flex items-center justify-center cursor-pointer">
        <svg viewBox="0 0 200 150" className="w-full h-full overflow-visible">
          <defs>
            {/* Puffy Frosted Glass Filter */}
            <filter id="puffyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="puffyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Background curved track (M 48.58 156.28 to 151.42 156.28) */}
          <path
            d="M 48.58 156.28 A 80 80 0 1 1 151.42 156.28"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Glowing active arc from start to knob position */}
          {activeArcD && (
            <path
              d={activeArcD}
              fill="none"
              stroke="url(#puffyGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#puffyGlow)"
            />
          )}

          {/* Frosted Glass Knob */}
          <g transform={`translate(${knobX}, ${knobY})`} className="cursor-grab active:cursor-grabbing">
            {/* Outer glass sphere */}
            <circle
              r="14"
              fill="rgba(255, 255, 255, 0.35)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="1.5"
              style={{
                backdropFilter: "blur(12px)",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              }}
            />
            {/* Specular highlight rim */}
            <circle cx="-3" cy="-3" r="5" fill="rgba(255, 255, 255, 0.85)" />
            {/* Core glowing jewel */}
            <circle r="4" fill="#fbbf24" className="animate-pulse" />
          </g>
        </svg>

        {/* Floating Digital Center Pill */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center gap-2">
            <span className="font-mono text-[16px] font-bold text-white tracking-tight">
              {formatTime(t)}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/60">
              {sunAlt > 0 ? "DAY" : "NIGHT"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between w-full mt-2 font-mono text-[10px]">
        <button
          type="button"
          onClick={syncToLocalTime}
          className={`px-2 py-0.5 rounded-full border border-white/10 transition-colors ${
            live ? "text-cyan-300 bg-cyan-500/20 border-cyan-400/40" : "text-white/60 hover:text-white"
          }`}
        >
          {live ? "● LOCAL SYNC" : "SYNC"}
        </button>

        <button
          type="button"
          onClick={() => (playing ? pauseSkyTime() : playSkyTime())}
          className="px-2 py-0.5 rounded-full border border-white/10 text-white/70 hover:text-white transition-colors"
        >
          {playing ? "PAUSE ❚❚" : "TIMELAPSE ▶"}
        </button>
      </div>
    </div>
  );
}
