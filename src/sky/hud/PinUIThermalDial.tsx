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

const SIZE = 200;
const C = SIZE / 2;
const R_TRACK = 87;
const R_TICK = 78;
const R_LABEL = 62;
const R_DEAD = 44;
const SUNRISE = 5 + 40 / 60;
const SUNSET = 18 + 40 / 60;

const angleOf = (t: number) => (180 + t * 15) % 360;
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
};

function arc(r: number, a: number, b: number) {
  const from = angleOf(a);
  const span = ((((b - a) % 24) + 24) % 24) * 15;
  const p0 = pt(r, from);
  const p1 = pt(r, from + span);
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

function timeAtPointer(svg: SVGSVGElement, x: number, y: number, dead: number) {
  const r = svg.getBoundingClientRect();
  const dx = x - (r.left + r.width / 2);
  const dy = y - (r.top + r.height / 2);
  const dist = (Math.hypot(dx, dy) / r.width) * SIZE;
  if (dist < dead) return null;
  const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  return ((deg - 180 + 360) % 360) / 15;
}

export function PinUIThermalDial() {
  const t = useSkyTime();
  const { mode, playing } = useSyncState();
  const live = mode === "auto";
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const onRingDown = useCallback((e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || e.button !== 0) return;
    const at = timeAtPointer(svg, e.clientX, e.clientY, R_DEAD);
    if (at === null) return;
    svg.setPointerCapture(e.pointerId);
    setDragging(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
    glideSkyTime(at, { omega: 12 });
  }, []);

  const onRingMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || !dragging) return;
      const at = timeAtPointer(svg, e.clientX, e.clientY, 14);
      if (at !== null) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(4);
          } catch {}
        }
        glideSkyTime(at, { omega: 22 });
      }
    },
    [dragging]
  );

  const endRing = useCallback(() => setDragging(false), []);

  const sunAngle = angleOf(t);
  const sunPos = pt(R_TRACK, sunAngle);
  const moonT = (t + 12) % 24;
  const moonPos = pt(R_TRACK, angleOf(moonT));
  const sunAlt = solarAltitude(t);
  const isDay = sunAlt > 0;
  const phase = momentLabel(t).toUpperCase();

  // 96 ticks around the ring (every 15 minutes)
  const ticks = Array.from({ length: 96 }, (_, i) => {
    const deg = (i * 360) / 96;
    const isHour = i % 4 === 0;
    const isMajor = i % 24 === 0;
    const rIn = isMajor ? R_TICK - 8 : isHour ? R_TICK - 5 : R_TICK - 2.5;
    const p1 = pt(R_TICK, deg);
    const p2 = pt(rIn, deg);
    return { deg, p1, p2, isHour, isMajor };
  });

  return (
    <div className="pinui-thermal-dial flex flex-col items-center select-none">
      {/* Season & Solar Phase blur title */}
      <div className="flex items-center justify-between w-full px-2 mb-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">
          THERMAL DIAL // PINUI
        </span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
          {phase}
        </span>
      </div>

      <div className="relative flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-48 h-48 block cursor-grab active:cursor-grabbing"
          onPointerDown={onRingDown}
          onPointerMove={onRingMove}
          onPointerUp={endRing}
          onPointerCancel={endRing}
          onDoubleClick={syncToLocalTime}
        >
          <defs>
            {/* Comet glow gradient following solar needle */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffeedd" stopOpacity="1" />
              <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dayArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="nightArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#312e81" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Outer dial ring housing */}
          <circle
            cx={C}
            cy={C}
            r={SIZE / 2 - 2}
            fill="rgba(11, 15, 34, 0.75)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />

          {/* Day & Night track arcs */}
          <path
            d={arc(R_TRACK, SUNRISE, SUNSET)}
            fill="none"
            stroke="url(#dayArc)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={arc(R_TRACK, SUNSET, SUNRISE)}
            fill="none"
            stroke="url(#nightArc)"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />

          {/* 96 Ticks */}
          {ticks.map((tk, idx) => (
            <line
              key={idx}
              x1={tk.p1.x}
              y1={tk.p1.y}
              x2={tk.p2.x}
              y2={tk.p2.y}
              stroke={
                tk.isMajor
                  ? "rgba(255,255,255,0.7)"
                  : tk.isHour
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.15)"
              }
              strokeWidth={tk.isMajor ? 1.5 : 1}
            />
          ))}

          {/* Hour labels (00, 06, 12, 18) */}
          {[
            { label: "12", t: 12 },
            { label: "18", t: 18 },
            { label: "00", t: 0 },
            { label: "06", t: 6 },
          ].map((l) => {
            const p = pt(R_LABEL, angleOf(l.t));
            return (
              <text
                key={l.label}
                x={p.x}
                y={p.y + 3.5}
                textAnchor="middle"
                className="fill-white/40 font-mono text-[9px] font-medium"
              >
                {l.label}
              </text>
            );
          })}

          {/* Sun Celestial Comet Marker */}
          <g transform={`translate(${sunPos.x}, ${sunPos.y})`}>
            <circle r="12" fill="url(#sunGlow)" className="animate-pulse" />
            <circle r="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
          </g>

          {/* Moon Celestial Marker */}
          <g transform={`translate(${moonPos.x}, ${moonPos.y})`} opacity="0.6">
            <circle r="3" fill="#cbd5e1" />
          </g>

          {/* Center dead ring boundary */}
          <circle
            cx={C}
            cy={C}
            r={R_DEAD}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        </svg>

        {/* Central Split-Slot Rolling Digits Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-mono text-[22px] font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            {formatTime(t)}
          </div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-white/50">
            {isDay ? "SOLAR +" : "LUNAR -"}
            {Math.abs(Math.round(sunAlt))}°
          </div>
        </div>
      </div>

      {/* Dial Controls Footer */}
      <div className="flex items-center justify-between w-full px-2 mt-2 pt-2 border-t border-white/10 font-mono text-[10px]">
        <button
          type="button"
          onClick={syncToLocalTime}
          className={`px-2 py-0.5 rounded transition-colors ${
            live ? "text-emerald-400 bg-emerald-400/10" : "text-white/50 hover:text-white"
          }`}
          title="Sync with live local clock"
        >
          {live ? "● LIVE" : "SYNC"}
        </button>

        <button
          type="button"
          onClick={() => (playing ? pauseSkyTime() : playSkyTime())}
          className="text-white/60 hover:text-white transition-colors"
          title="Play 24-hr timelapse"
        >
          {playing ? "PAUSE ❚❚" : "TIMELAPSE ▶"}
        </button>
      </div>
    </div>
  );
}
