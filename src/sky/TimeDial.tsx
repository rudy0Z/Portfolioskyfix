"use client";

/**
 * TimeDial — a tactile 24-hour scrubber, not a set of phase buttons.
 *
 * Interaction model:
 *   - drag anywhere on the track (pointer capture, works with touch and pen)
 *   - arrow keys step 15 min, Shift+arrow 1 h, Page Up/Down 3 h, Home/End
 *   - vertical wheel fine-scrubs while focused/hovered
 *   - on release, momentum carries the clock a little further and decays
 *   - "Now" returns to the visitor's real local time and re-enables auto-sync
 *
 * Visual: the track itself is painted from the 24h palette, so it previews the
 * entire day as a strip of light. The knob is the sun by day, the moon at night.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ANCHORS, clampTime, formatTime, momentLabel, phaseAt } from "@/lib/timeOfDay";
import {
  getSkyTime,
  setSkyTime,
  syncToLocalTime,
  useSkyTime,
  useSyncState,
} from "@/lib/useTimeOfDay";
import { SKY_TRACK } from "@/lib/skyPalette";
import { oklch } from "@/lib/color";

const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21];

/** A strip of the actual palette, left→right across the day. */
const TRACK_GRADIENT = `linear-gradient(90deg, ${SKY_TRACK.map(
  (s) => `${oklch(s.value.mid)} ${(s.at / 24) * 100}%`,
).join(", ")})`;

export function TimeDial({ className = "" }: { className?: string }) {
  const t = useSkyTime();
  const { mode } = useSyncState();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const timeRef = useRef(t);
  timeRef.current = t;
  const raf = useRef(0);
  const [active, setActive] = useState(false);

  const night = phaseAt(t) === "night";

  const valueFromEvent = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return clampTime(((clientX - r.left) / r.width) * 24);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setActive(true);
    velocity.current = 0;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    setSkyTime(valueFromEvent(e.clientX), "manual");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const next = valueFromEvent(e.clientX);
    const dt = Math.max(1, performance.now() - lastT.current);
    // hours per second, smoothed
    velocity.current = velocity.current * 0.7 + ((next - t) / (dt / 1000)) * 0.3;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    setSkyTime(next, "manual");
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    // Inertia: glide with decaying velocity, capped so it stays controllable.
    let v = Math.max(-40, Math.min(40, velocity.current));
    const glide = () => {
      const dt = 1 / 60;
      if (Math.abs(v) < 0.4) return;
      const cur = clampTime(timeRef.current + v * dt);
      timeRef.current = cur;
      setSkyTime(cur, "manual");
      v *= 0.92;
      raf.current = requestAnimationFrame(glide);
    };
    raf.current = requestAnimationFrame(glide);
  };

  // Read from the store, not the render snapshot: a keypress can arrive
  // before React has re-rendered after a drag, and a stale `t` would jump.
  const nudge = (hours: number) => setSkyTime(clampTime(getSkyTime() + hours), "manual");

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 0.25;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        nudge(-step);
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        nudge(step);
        break;
      case "PageDown":
        e.preventDefault();
        nudge(-3);
        break;
      case "PageUp":
        e.preventDefault();
        nudge(3);
        break;
      case "Home":
        e.preventDefault();
        setSkyTime(0, "manual");
        break;
      case "End":
        e.preventDefault();
        setSkyTime(23.99, "manual");
        break;
      default:
        break;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    setSkyTime(clampTime(getSkyTime() + Math.sign(e.deltaY) * 0.08), "manual");
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const pct = (t / 24) * 100;

  return (
    <div
      className={`time-dial pointer-events-auto select-none ${className}`}
      data-variant="glass"
      data-active={active}
    >
      <div className="time-dial-head">
        <div className="time-dial-clock">
          <span className="time-dial-time tabular-nums">{formatTime(t)}</span>
          <span className="time-dial-moment">{momentLabel(t)}</span>
        </div>
        <button
          type="button"
          className="time-dial-now"
          onClick={syncToLocalTime}
          data-live={mode === "auto"}
          title="Sync to your local time"
        >
          <span className="time-dial-dot" aria-hidden />
          {mode === "auto" ? "Live" : "Now"}
        </button>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Time of day"
        aria-valuemin={0}
        aria-valuemax={24}
        aria-valuenow={Number(t.toFixed(2))}
        aria-valuetext={`${formatTime(t)} — ${momentLabel(t)}`}
        className="time-dial-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        style={{ ["--pct" as string]: `${pct}%` }}
      >
        {/* palette preview strip */}
        <div className="time-dial-strip" style={{ background: TRACK_GRADIENT }} />
        {/* daylight wash shows above/below the strip */}
        <div className="time-dial-shade" />
        {/* hour ticks */}
        {HOUR_TICKS.map((h) => (
          <span
            key={h}
            className="time-dial-tick"
            style={{ left: `${(h / 24) * 100}%` }}
            aria-hidden
          />
        ))}
        {/* named anchors get a bolder tick */}
        {Object.values(ANCHORS).map((h) => (
          <span
            key={`a-${h}`}
            className="time-dial-anchor"
            style={{ left: `${(h / 24) * 100}%` }}
            aria-hidden
          />
        ))}
        {/* knob */}
        <span className={`time-dial-knob ${night ? "is-moon" : "is-sun"}`} aria-hidden>
          <span className="time-dial-knob-core" />
        </span>
      </div>

      <div className="time-dial-foot">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  );
}
