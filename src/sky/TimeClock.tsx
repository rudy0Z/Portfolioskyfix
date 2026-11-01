"use client";

/**
 * TimeClock — a 24-hour solar dial with a digital readout at its heart.
 *
 * One turn of the dial is one whole day, laid out the way the sky is:
 * midnight at the bottom, sunrise on the left, noon at the top, sunset on the
 * right. The sun (or moon) rides the ring.
 *
 *   Dial      press anywhere on the ring and the sky glides there; keep
 *             dragging and it follows your finger. No winding, no hands to
 *             find — the point under your pointer *is* the time.
 *             Wheel over the ring: ±15 min.
 *   Digits    hours and minutes are separate spinners. Scroll or drag them up
 *             and down (hours ±1, minutes ±5, Shift for ±1 min), or click to
 *             type a time — "7", "730", "19:45", "7pm", "noon".
 *   Buttons   return to your local time (live), or play a timelapse of the day.
 *
 * Every change runs through the time store's spring, so the sky eases into
 * place instead of cutting.
 *
 * Accessibility: the ring is a `role="slider"`; hours and minutes are
 * `role="spinbutton"`s with arrow keys; Enter on either opens the text field.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { clampTime, formatTime, momentLabel, parseClockInput } from "@/lib/timeOfDay";
import {
  getSkyTarget,
  glideSkyTime,
  pauseSkyTime,
  playSkyTime,
  syncToLocalTime,
  useSkyTime,
  useSyncState,
} from "@/lib/useTimeOfDay";
import { moonIllumination, moonPhase, solarAltitude } from "@/lib/celestial";

/* ── geometry (SVG units) ─────────────────────────────────────────────── */

const SIZE = 200;
const C = SIZE / 2;
const R_TRACK = 87; // the ring the sun rides
const R_TICK = 78; // hour ticks, outer edge
const R_LABEL = 62; // 00 / 06 / 12 / 18
const R_DEAD = 46; // inside this, the pointer belongs to the digits
const SUNRISE = 5 + 40 / 60;
const SUNSET = 18 + 40 / 60;

/** Clock time → angle in degrees, 0 at the top, clockwise. Midnight at the bottom. */
const angleOf = (t: number) => (180 + t * 15) % 360;
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
};
/** Clockwise arc from time a to time b on radius r. */
function arc(r: number, a: number, b: number) {
  const from = angleOf(a);
  const span = ((((b - a) % 24) + 24) % 24) * 15;
  const p0 = pt(r, from);
  const p1 = pt(r, from + span);
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/** Pointer → clock time, or null inside the dead zone. */
function timeAtPointer(svg: SVGSVGElement, x: number, y: number, dead: number) {
  const r = svg.getBoundingClientRect();
  const dx = x - (r.left + r.width / 2);
  const dy = y - (r.top + r.height / 2);
  const dist = (Math.hypot(dx, dy) / r.width) * SIZE;
  if (dist < dead) return null;
  const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  return ((deg - 180 + 360) % 360) / 15;
}

/** Wheel deltas arrive in pixels, lines or pages depending on the device. */
const wheelPixels = (e: WheelEvent) => e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);

/* ── stepping ─────────────────────────────────────────────────────────── */

type Unit = "h" | "m";

/** One notch from the current *target*, so fast scrolling accumulates. */
function stepFrom(base: number, unit: Unit, dir: 1 | -1, fine: boolean) {
  if (unit === "h") return clampTime(base + dir);
  const size = fine ? 1 : 5;
  const mins = Math.round(base * 60);
  const snapped = dir > 0 ? Math.floor(mins / size) * size + size : Math.ceil(mins / size) * size - size;
  return clampTime(snapped / 60);
}

function step(unit: Unit, dir: 1 | -1, fine = false, omega = 14) {
  glideSkyTime(stepFrom(getSkyTarget(), unit, dir, fine), { omega });
}

/* ── digit spinner ────────────────────────────────────────────────────── */

function Segment({
  unit,
  value,
  onEdit,
}: {
  unit: Unit;
  value: number;
  onEdit: (seed?: string) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ id: number; y0: number; applied: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Native, non-passive wheel listener: React's onWheel is passive and
  // cannot stop the page from scrolling underneath.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += wheelPixels(e);
      const notch = 34;
      while (Math.abs(acc) >= notch) {
        step(unit, acc < 0 ? 1 : -1, e.shiftKey);
        acc -= Math.sign(acc) * notch;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [unit]);

  const label = unit === "h" ? "Hours" : "Minutes";
  const text = String(value).padStart(2, "0");

  return (
    <span
      ref={ref}
      className="clock-seg"
      data-unit={unit}
      data-dragging={dragging}
      role="spinbutton"
      tabIndex={0}
      aria-label={`${label} — scroll, drag or type`}
      aria-valuemin={0}
      aria-valuemax={unit === "h" ? 23 : 59}
      aria-valuenow={value}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { id: e.pointerId, y0: e.clientY, applied: 0, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const dy = d.y0 - e.clientY;
        if (!d.moved && Math.abs(dy) > 4) {
          d.moved = true;
          setDragging(true);
        }
        if (!d.moved) return;
        const steps = Math.trunc(dy / 13);
        while (d.applied !== steps) {
          const dir = steps > d.applied ? 1 : -1;
          step(unit, dir, e.shiftKey, 18);
          d.applied += dir;
        }
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        setDragging(false);
        if (d && !d.moved && e.type === "pointerup") onEdit();
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          e.preventDefault();
          step(unit, 1, e.shiftKey);
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          e.preventDefault();
          step(unit, -1, e.shiftKey);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit();
        } else if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          onEdit(e.key);
        }
      }}
    >
      <span className="clock-seg-chev clock-seg-chev--up" aria-hidden />
      {text}
      <span className="clock-seg-chev clock-seg-chev--down" aria-hidden />
    </span>
  );
}

/* ── the clock ────────────────────────────────────────────────────────── */

export function TimeClock({ className = "" }: { className?: string }) {
  const t = useSkyTime();
  const { mode, playing } = useSyncState();
  const live = mode === "auto";
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<false | { seed: string }>(false);

  /* ring: press to seek, drag to follow */
  const onRingDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || e.button !== 0) return;
    const at = timeAtPointer(svg, e.clientX, e.clientY, R_DEAD);
    if (at === null) return;
    svg.setPointerCapture(e.pointerId);
    setDragging(true);
    glideSkyTime(at, { omega: 9 });
  }, []);

  const onRingMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || !dragging) return;
      // Near the centre the angle is unstable — hold until the pointer is out.
      const at = timeAtPointer(svg, e.clientX, e.clientY, 14);
      if (at !== null) glideSkyTime(at, { omega: 20 });
    },
    [dragging],
  );

  const endRing = useCallback(() => setDragging(false), []);

  // wheel over the ring: quarter hours
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += wheelPixels(e);
      const notch = 30;
      while (Math.abs(acc) >= notch) {
        glideSkyTime(clampTime(getSkyTarget() + (acc < 0 ? 0.25 : -0.25)), { omega: 12 });
        acc -= Math.sign(acc) * notch;
      }
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onRingKey = (e: React.KeyboardEvent) => {
    const big = e.shiftKey ? 1 : 0.25;
    const map: Record<string, number> = {
      ArrowRight: big,
      ArrowUp: big,
      ArrowLeft: -big,
      ArrowDown: -big,
      PageUp: 3,
      PageDown: -3,
    };
    if (e.key in map) {
      e.preventDefault();
      glideSkyTime(clampTime(getSkyTarget() + map[e.key]), { omega: 10 });
    } else if (e.key === "Home") {
      e.preventDefault();
      glideSkyTime(0, { omega: 6 });
    } else if (e.key === "End") {
      e.preventDefault();
      glideSkyTime(12, { omega: 6 });
    }
  };

  /* derived */
  const total = Math.round(t * 60) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const day = solarAltitude(t) > -0.02;
  const knob = pt(R_TRACK, angleOf(t));
  const needleIn = pt(R_TICK - 11, angleOf(t));
  const needleOut = pt(R_TRACK - 9, angleOf(t));
  const phase = moonPhase();
  const illum = moonIllumination(phase);

  // trail: the last two hours of the sun's path, fading out behind it
  const TRAIL = 14;
  const trail = Array.from({ length: TRAIL }, (_, i) => {
    const a = t - 2.2 + (i * 2.2) / TRAIL;
    return { d: arc(R_TRACK, a, a + 2.2 / TRAIL + 0.01), o: ((i + 1) / TRAIL) ** 1.6 };
  });

  return (
    <div className={`time-clock ${className}`} data-dragging={dragging} data-live={live} data-day={day}>
      <div className="time-clock-dial">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="time-clock-face"
          role="slider"
          tabIndex={0}
          aria-label="Time of day — press or drag on the ring to move the sky"
          aria-valuemin={0}
          aria-valuemax={24}
          aria-valuenow={Number(t.toFixed(2))}
          aria-valuetext={`${formatTime(t)}, ${momentLabel(t)}`}
          onKeyDown={onRingKey}
          onPointerDown={onRingDown}
          onPointerMove={onRingMove}
          onPointerUp={endRing}
          onPointerCancel={endRing}
          onLostPointerCapture={endRing}
        >
          <defs>
            <radialGradient id="tc-face" cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="rgba(40, 46, 66, 0.55)" />
              <stop offset="70%" stopColor="rgba(14, 18, 32, 0.6)" />
              <stop offset="100%" stopColor="rgba(8, 11, 22, 0.75)" />
            </radialGradient>
            {/* the day arc runs dawn-rose → noon-pale → sunset-amber */}
            <linearGradient id="tc-day" gradientUnits="userSpaceOnUse" x1={C - R_TRACK} y1="0" x2={C + R_TRACK} y2="0">
              <stop offset="0%" stopColor="#e6a3a8" />
              <stop offset="50%" stopColor="#f6eedb" />
              <stop offset="100%" stopColor="#f0a46e" />
            </linearGradient>
            <radialGradient id="tc-sun" cx="40%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#fffdf6" />
              <stop offset="60%" stopColor="#ffe8bd" />
              <stop offset="100%" stopColor="#f6c27f" />
            </radialGradient>
            <radialGradient id="tc-glow">
              <stop offset="0%" stopColor="var(--sky-sun-glow)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--sky-sun-glow)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="tc-moonglow">
              <stop offset="0%" stopColor="#cfdcff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#cfdcff" stopOpacity="0" />
            </radialGradient>
            <clipPath id="tc-moonclip">
              <circle cx={knob.x} cy={knob.y} r="6.2" />
            </clipPath>
          </defs>

          {/* face */}
          <circle cx={C} cy={C} r={R_TRACK + 9} fill="url(#tc-face)" />
          <circle cx={C} cy={C} r={R_TRACK + 9} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="0.8" />
          <circle cx={C} cy={C} r={R_DEAD + 2} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

          {/* track: a groove, the night arc, the day arc */}
          <circle cx={C} cy={C} r={R_TRACK} fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth="7" />
          <path d={arc(R_TRACK, SUNSET, SUNRISE)} fill="none" stroke="rgba(170, 188, 236, 0.28)" strokeWidth="1.6" strokeLinecap="round" />
          <path d={arc(R_TRACK, SUNRISE, SUNSET)} fill="none" stroke="url(#tc-day)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

          {/* trail behind the sun */}
          <g className="time-clock-trail">
            {trail.map((s, i) => (
              <path key={i} d={s.d} fill="none" stroke={day ? "#ffe7bf" : "#d8e2ff"} strokeWidth="3" strokeLinecap="butt" opacity={s.o * 0.55} />
            ))}
          </g>

          {/* hour ticks: 24, with the four quarters longer */}
          {Array.from({ length: 24 }, (_, h) => {
            const major = h % 6 === 0;
            const a = pt(R_TICK - (major ? 6 : 3.2), angleOf(h));
            const b = pt(R_TICK, angleOf(h));
            return (
              <line
                key={h}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={major ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}
                strokeWidth={major ? 1.2 : 0.8}
                strokeLinecap="round"
              />
            );
          })}

          {[0, 6, 12, 18].map((h) => {
            const p = pt(R_LABEL, angleOf(h));
            return (
              <text key={h} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="time-clock-label">
                {String(h).padStart(2, "0")}
              </text>
            );
          })}

          {/* needle: a short bezel pointer, so the centre stays for the digits */}
          <line
            x1={needleIn.x}
            y1={needleIn.y}
            x2={needleOut.x}
            y2={needleOut.y}
            stroke={day ? "#fff1d6" : "#dfe7ff"}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* the sun, or the moon in its real phase */}
          <g className="time-clock-knob">
            <circle cx={knob.x} cy={knob.y} r="15" fill={day ? "url(#tc-glow)" : "url(#tc-moonglow)"} className="time-clock-knob-glow" />
            {day ? (
              <circle cx={knob.x} cy={knob.y} r="6.6" fill="url(#tc-sun)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" />
            ) : (
              <g>
                <circle cx={knob.x} cy={knob.y} r="6.2" fill="#e7ecf7" />
                <circle
                  cx={knob.x + (phase < 0.5 ? -1 : 1) * 12.4 * illum}
                  cy={knob.y}
                  r="6.4"
                  fill="#1b2134"
                  opacity="0.88"
                  clipPath="url(#tc-moonclip)"
                />
                <circle cx={knob.x} cy={knob.y} r="6.2" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
              </g>
            )}
            {/* generous invisible grab target */}
            <circle cx={knob.x} cy={knob.y} r="18" fill="transparent" />
          </g>
        </svg>

        {/* the digital heart */}
        <div className="time-clock-center">
          {editing ? (
            <TimeInput
              seed={editing.seed}
              initial={formatTime(t)}
              onDone={(value) => {
                setEditing(false);
                if (value !== null) glideSkyTime(value, { omega: 4.2 });
              }}
            />
          ) : (
            <div className="clock-digits" data-live={live}>
              <Segment unit="h" value={hh} onEdit={(seed) => setEditing({ seed: seed ?? "" })} />
              <span className="clock-colon" aria-hidden>
                :
              </span>
              <Segment unit="m" value={mm} onEdit={(seed) => setEditing({ seed: seed ?? "" })} />
            </div>
          )}
          <div className="clock-moment">{momentLabel(t)}</div>
        </div>
      </div>

      <div className="time-clock-actions">
        <button type="button" className="time-clock-now" onClick={syncToLocalTime} data-live={live}>
          <span className="time-clock-dot" aria-hidden />
          {live ? "Live · your time" : "Back to now"}
        </button>
        <button
          type="button"
          className="time-clock-play"
          data-playing={playing}
          aria-pressed={playing}
          aria-label={playing ? "Pause timelapse" : "Play the day as a timelapse"}
          title={playing ? "Pause" : "Timelapse"}
          onClick={() => (playing ? pauseSkyTime() : playSkyTime(0.55))}
        >
          {playing ? (
            <svg viewBox="0 0 10 10" aria-hidden>
              <rect x="2" y="1.5" width="2" height="7" rx="0.6" />
              <rect x="6" y="1.5" width="2" height="7" rx="0.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 10 10" aria-hidden>
              <path d="M3 1.6 L8.4 5 L3 8.4 Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── type-a-time ──────────────────────────────────────────────────────── */

function TimeInput({
  seed,
  initial,
  onDone,
}: {
  seed: string;
  initial: string;
  onDone: (value: number | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(seed || initial);
  const [invalid, setInvalid] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (seed) el.setSelectionRange(seed.length, seed.length);
    else el.select();
  }, [seed]);

  const commit = () => {
    if (done.current) return;
    const parsed = parseClockInput(value);
    if (parsed === null) {
      setInvalid(true);
      window.setTimeout(() => setInvalid(false), 420);
      return false;
    }
    done.current = true;
    onDone(parsed);
    return true;
  };

  return (
    <input
      ref={ref}
      className="clock-input"
      data-invalid={invalid}
      value={value}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      maxLength={9}
      aria-label="Type a time, e.g. 7:30, 1945, 7pm or noon"
      placeholder="hh:mm"
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          done.current = true;
          onDone(null);
        }
      }}
      onBlur={() => {
        if (done.current) return;
        if (parseClockInput(value) !== null) commit();
        else {
          done.current = true;
          onDone(null);
        }
      }}
    />
  );
}
