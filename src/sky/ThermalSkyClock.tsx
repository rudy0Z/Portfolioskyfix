"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate, stagger } from "motion/react";
import { formatTime, wrapHours } from "@/lib/timeOfDay";
import {
  getSkyTime,
  glideSkyTime,
  setSkyTime,
  syncToLocalTime,
  useSkyTime,
  useSyncState,
} from "@/lib/useTimeOfDay";
import { computeUiPalette } from "@/lib/lighting";
import {
  PIN_DIAL_GEOM,
  chromaticTickColor,
  hourToPinAngle,
  pinAngleToHour,
  pinDialAtmosphere,
  solarPhaseMeta,
} from "./sundialMath";

/* ==========================================================================
   ThermalSkyClock — Adaptive PinUI-Inspired Solar Horizon Dial

   Combines PinUI's sculptural hardware craft (gradient rim bevel, breathing
   rising atmospheric wash, 96-tick chromatic sweep with spring wave + comet
   head + receding < drag > cue, blur-staggered solar phase title, spring-
   rolling split digits, adaptive alabaster/obsidian polarity) with quiet
   editorial utility (clean nav trigger pill, reset-to-live icon ↺, and a
   collapsed-by-default `Sky options ⌄` drawer).
   ========================================================================== */

export type ClockMode = "analog" | "digital";
export type ClockSize = "thumbnail" | "full";

export interface ThermalSkyClockProps {
  mode?: ClockMode;
  onModeChange?: (mode: ClockMode) => void;
  size?: ClockSize;
  expandable?: boolean;
  onSizeChange?: (size: ClockSize) => void;
  showTrigger?: boolean;
  cloudDrift?: boolean;
  onToggleCloudDrift?: () => void;
  nightStars?: boolean;
  onToggleNightStars?: () => void;
  className?: string;
}

const {
  vbW: VB_W,
  vbH: VB_H,
  cx: CX,
  cy: CY,
  radius: ARC_R,
  tickCount: TICK_COUNT,
  angleStart: ANGLE_START,
  angleEnd: ANGLE_END,
} = PIN_DIAL_GEOM;

const DEG_TO_RAD = Math.PI / 180;
const TICK_ANGLES = Array.from({ length: TICK_COUNT }, (_, i) => {
  const u = i / (TICK_COUNT - 1);
  return {
    u,
    angle: ANGLE_START + u * (ANGLE_END - ANGLE_START),
    color: chromaticTickColor(u),
    major: i % 6 === 0 || i === TICK_COUNT - 1,
  };
});

/** Single spring-rolling tabular digit (0–9) */
function RollingDigit({ value }: { value: string }) {
  const num = Number(value);
  const isDigit = Number.isFinite(num) && value >= "0" && value <= "9";
  if (!isDigit) {
    return <span className="pdial__colon">{value}</span>;
  }
  return (
    <span className="pdial__digit-slot" aria-hidden="true">
      <span
        className="pdial__digit-track"
        style={{ transform: `translate3d(0, ${-num * 10}%, 0)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span key={d} className="pdial__digit-glyph">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Blur-staggered solar phase title (PinUI kinetic typography) */
function PhaseTitle({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const chars = el.querySelectorAll<HTMLElement>(".pdial__phase-ch");
    if (!chars.length) return;
    animate(
      chars,
      {
        opacity: [0, 1],
        y: [5, 0],
        filter: ["blur(4px)", "blur(0px)"],
      },
      {
        duration: 0.36,
        delay: stagger(0.018),
        ease: [0.22, 1, 0.36, 1],
      },
    );
  }, [label]);

  return (
    <div ref={ref} className="pdial__phase" aria-live="polite">
      {label.split("").map((ch, idx) => (
        <span key={`${label}-${idx}`} className="pdial__phase-ch">
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </div>
  );
}

export function ThermalSkyClock({
  size: controlledSize,
  expandable = true,
  onSizeChange,
  showTrigger = false,
  cloudDrift = true,
  onToggleCloudDrift,
  nightStars = false,
  onToggleNightStars,
  className = "",
}: ThermalSkyClockProps) {
  const t = useSkyTime();
  const { mode: syncMode } = useSyncState();

  const [internalSize, setInternalSize] = useState<ClockSize>(controlledSize ?? "full");
  const [isDragging, setIsDragging] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const activeSize = controlledSize ?? internalSize;
  const isExpanded = activeSize === "full";
  const collapsible = expandable && controlledSize !== undefined;

  const popoverRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);
  const orbGroupRef = useRef<SVGGElement>(null);

  const targetAngle = useMemo(() => hourToPinAngle(t), [t]);
  const targetAngleRef = useRef(targetAngle);
  targetAngleRef.current = targetAngle;

  const isDraggingRef = useRef(isDragging);
  isDraggingRef.current = isDragging;

  // Hand-rolled spring state for silk-smooth 96-tick wave & comet tracking
  const springRef = useRef({
    angle: targetAngle,
    vel: 0,
    raf: 0,
  });

  const atmo = useMemo(() => pinDialAtmosphere(t), [t]);
  const dayMix = useMemo(() => (computeUiPalette(t).isLight ? 1 : 0), [t]);
  const phase = useMemo(() => solarPhaseMeta(t), [t]);
  const formatted = formatTime(t);
  const isDay = phase.isDay;

  const handleSizeSwitch = useCallback(
    (next: ClockSize) => {
      setInternalSize(next);
      if (next === "thumbnail") setOptionsOpen(false);
      onSizeChange?.(next);
    },
    [onSizeChange],
  );

  const shellRef = useRef<HTMLDivElement>(null);

  // Escape or outside click closes floating popover cleanly
  useEffect(() => {
    if (!collapsible || !isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSizeSwitch("thumbnail");
    };
    const onPointerDownOutside = (e: PointerEvent) => {
      const shell = shellRef.current;
      if (shell && !shell.contains(e.target as Node)) {
        handleSizeSwitch("thumbnail");
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDownOutside);
    };
  }, [collapsible, isExpanded, handleSizeSwitch]);

  // Smooth wheel scrub while popover is open
  useEffect(() => {
    const el = popoverRef.current;
    if (!el || !isExpanded) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += e.deltaMode === 0 ? e.deltaY : e.deltaY * 40;
      if (Math.abs(acc) < 34) return;
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      const step = e.shiftKey ? 1.0 : 0.25;
      setSkyTime(wrapHours(getSkyTime() + dir * step), "manual");
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isExpanded]);

  // Paint spring-interpolated 68-tick 180° chromatic arc + comet orb directly to SVG DOM
  const paintArcAt = useCallback((angDeg: number, dayFactor: number) => {
    const activeU = (angDeg - ANGLE_START) / (ANGLE_END - ANGLE_START);
    const r = Math.round(255 + (18 - 255) * dayFactor);
    const g = Math.round(255 + (28 - 255) * dayFactor);
    const b = Math.round(255 + (45 - 255) * dayFactor);
    const inactiveStroke = `rgba(${r}, ${g}, ${b}, 0.16)`;
    const majorInactive = `rgba(${r}, ${g}, ${b}, 0.27)`;

    for (let i = 0; i < TICK_COUNT; i++) {
      const line = tickRefs.current[i];
      if (!line) continue;
      const tk = TICK_ANGLES[i];
      const dist = Math.abs(tk.u - activeU);
      const wave = Math.exp(-(dist * dist) / 0.0016);
      const passed = tk.u <= activeU + 0.004;

      const innerR = ARC_R - (tk.major ? 14 : 9) - wave * 4;
      const outerR = ARC_R + (tk.major ? 3.5 : 0) + wave * 8.5;
      const rad = (tk.angle - 90) * DEG_TO_RAD;
      const c = Math.cos(rad);
      const s = Math.sin(rad);

      line.setAttribute("x1", (CX + c * innerR).toFixed(2));
      line.setAttribute("y1", (CY + s * innerR).toFixed(2));
      line.setAttribute("x2", (CX + c * outerR).toFixed(2));
      line.setAttribute("y2", (CY + s * outerR).toFixed(2));

      if (passed || wave > 0.35) {
        line.setAttribute("stroke", tk.color);
        line.setAttribute("stroke-opacity", (0.68 + wave * 0.32).toFixed(2));
        line.setAttribute("stroke-width", (1.7 + wave * 1.25).toFixed(2));
      } else {
        line.setAttribute("stroke", tk.major ? majorInactive : inactiveStroke);
        line.setAttribute("stroke-opacity", "1");
        line.setAttribute("stroke-width", tk.major ? "1.65" : "1.15");
      }
    }

    // Position glowing sun/moon orb cleanly along the inner 180° orbital track
    const orbRad = (angDeg - 90) * DEG_TO_RAD;
    const orbTrackR = ARC_R - 23;
    const ox = CX + Math.cos(orbRad) * orbTrackR;
    const oy = CY + Math.sin(orbRad) * orbTrackR;
    if (orbGroupRef.current) {
      orbGroupRef.current.setAttribute("transform", `translate(${ox.toFixed(2)} ${oy.toFixed(2)})`);
    }
  }, []);

  const dayMixRef = useRef(dayMix);
  dayMixRef.current = dayMix;

  useEffect(() => {
    if (!isExpanded) return;
    const sp = springRef.current;

    const step = () => {
      sp.raf = 0;
      const target = targetAngleRef.current;
      const diff = target - sp.angle;
      if (isDraggingRef.current) {
        // Direct high-responsiveness spring during drag
        sp.angle += diff * 0.42;
        sp.vel *= 0.4;
      } else {
        // Tactile damped spring (k=0.16, d=0.76)
        sp.vel = (sp.vel + diff * 0.16) * 0.76;
        sp.angle += sp.vel;
      }

      paintArcAt(sp.angle, dayMixRef.current);

      if (Math.abs(target - sp.angle) > 0.04 || Math.abs(sp.vel) > 0.04) {
        sp.raf = requestAnimationFrame(step);
      } else {
        sp.angle = target;
        sp.vel = 0;
        paintArcAt(sp.angle, dayMixRef.current);
      }
    };

    if (!sp.raf) sp.raf = requestAnimationFrame(step);
    return () => {
      if (sp.raf) cancelAnimationFrame(sp.raf);
      sp.raf = 0;
    };
  }, [isExpanded, targetAngle, dayMix, paintArcAt]);

  // Snap spring immediately when opening
  useEffect(() => {
    if (isExpanded) {
      springRef.current.angle = targetAngleRef.current;
      springRef.current.vel = 0;
      paintArcAt(targetAngleRef.current, dayMixRef.current);
    }
  }, [isExpanded, paintArcAt]);

  const pointerToHour = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return getSkyTime();
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * VB_W;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * VB_H;
    const angleDeg = Math.atan2(y - CY, x - CX) / DEG_TO_RAD + 90;
    // Normalize into [-180, 180]
    const norm = ((angleDeg + 180) % 360 + 360) % 360 - 180;
    return pinAngleToHour(norm);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setSkyTime(pointerToHour(e.clientX, e.clientY), "manual");
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    setSkyTime(pointerToHour(e.clientX, e.clientY), "manual");
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 1.0 : 0.25;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSkyTime(wrapHours(getSkyTime() + step), "manual");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSkyTime(wrapHours(getSkyTime() - step), "manual");
    } else if (e.key === "Home") {
      e.preventDefault();
      glideSkyTime(6.25, { duration: 480 });
    } else if (e.key === "End") {
      e.preventDefault();
      glideSkyTime(18.0, { duration: 480 });
    }
  };

  const horizonPath = useMemo(() => {
    const x1 = CX - ARC_R - 14;
    const x2 = CX + ARC_R + 14;
    const y = CY + 13;
    return `M ${x1.toFixed(1)} ${y} Q ${CX} ${y - 14} ${x2.toFixed(1)} ${y}`;
  }, []);

  return (
    <div
      ref={shellRef}
      className={`pdial-shell ${isExpanded ? "is-open" : ""} ${className}`}
      style={
        {
          "--pdial-c1": atmo.c1,
          "--pdial-c2": atmo.c2,
          "--pdial-c3": atmo.c3,
          "--pdial-orb": atmo.orbColor,
          "--pdial-orb-core": atmo.orbCore,
        } as React.CSSProperties
      }
    >
      {/* Compact Adaptive Nav Trigger Pill */}
      {(showTrigger || !isExpanded) && (
        <button
          type="button"
          className={`pdial-trigger ${isExpanded ? "is-active" : ""}`}
          aria-expanded={isExpanded}
          aria-label={`Solar time ${formatted} (${phase.shortLabel}) — open solar horizon dial`}
          onClick={(e) => {
            e.stopPropagation();
            if (expandable) handleSizeSwitch(isExpanded ? "thumbnail" : "full");
          }}
        >
          <span className="pdial-trigger-icon" aria-hidden="true">
            {isDay ? (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="3" />
                <path
                  d="M8 1.6v1.7M8 12.7v1.7M1.6 8h1.7M12.7 8h1.7M3.5 3.5l1.2 1.2M11.3 11.3l1.2 1.2M12.5 3.5l-1.2 1.2M4.7 11.3l-1.2 1.2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  d="M12.6 9.8A5.2 5.2 0 0 1 6.2 3.4a5.3 5.3 0 1 0 6.4 6.4Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="pdial-trigger-time tabular-nums">{formatted}</span>
          <svg
            className="pdial-trigger-chev"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Adaptive PinUI-Inspired Sculptural Squircle Popover */}
      {isExpanded && (
        <div
          ref={popoverRef}
          className={`pdial-popover ${showTrigger ? "pdial-popover--floating" : ""} ${
            isDragging ? "is-dragging" : ""
          }`}
          data-theme={atmo.theme}
          role="dialog"
          aria-label="Solar Horizon Dial"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Exterior atmospheric halo */}
          <div className="pdial__halo" aria-hidden="true" />
          <div className="pdial__bloom" aria-hidden="true" />

          {/* Main hardware squircle enclosure */}
          <div className="pdial__device">
            <div className="pdial__rim" aria-hidden="true" />
            <div className="pdial__walls" aria-hidden="true" />
            <div className="pdial__wash" aria-hidden="true" />

            {/* Quiet Header Bar */}
            <header className="pdial__head">
              <span className="pdial__loc">Greater Noida · IST</span>
              <div className="pdial__head-btns">
                {syncMode === "manual" && (
                  <button
                    type="button"
                    className="pdial__icon-btn"
                    onClick={() => syncToLocalTime()}
                    title="Return to live local time"
                    aria-label="Return to live local time"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path
                        d="M3.2 7.5a4.8 4.8 0 1 1 1.2 3.4M3.2 4.2v3.3h3.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                {collapsible && (
                  <button
                    type="button"
                    className="pdial__icon-btn"
                    onClick={() => handleSizeSwitch("thumbnail")}
                    aria-label="Close solar dial"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </header>

            {/* Kinetic Solar Phase Label */}
            <PhaseTitle label={phase.label} />

            {/* 180° Half-Dome Chromatic Comb + Nestled Digital Time Inside the Dome */}
            <div className="pdial__arc-stage">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="pdial__svg"
                role="slider"
                tabIndex={0}
                aria-label="24-hour solar horizon dial — drag along arc or use arrow keys to scrub time"
                aria-valuemin={0}
                aria-valuemax={24}
                aria-valuenow={Number(t.toFixed(2))}
                aria-valuetext={`${formatted} ${phase.label}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
              >
                {/* 68 Spring-Responsive Chromatic Ticks */}
                <g aria-hidden="true">
                  {TICK_ANGLES.map((_, idx) => (
                    <line
                      key={idx}
                      ref={(el) => {
                        tickRefs.current[idx] = el;
                      }}
                      x1={CX}
                      y1={CY - ARC_R}
                      x2={CX}
                      y2={CY - ARC_R - 8}
                      strokeLinecap="round"
                    />
                  ))}
                </g>

                {/* Subtle horizon baseline curve */}
                <path
                  d={horizonPath}
                  fill="none"
                  className="pdial__horizon-line"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />

                {/* Glowing Sun / Moon Orbital Thumb */}
                <g ref={orbGroupRef} className="pdial__orb-group">
                  <circle cx="0" cy="0" r="17" fill={atmo.orbColor} opacity="0.24" />
                  <circle
                    cx="0"
                    cy="0"
                    r="9.5"
                    fill={atmo.orbColor}
                    stroke="#ffffff"
                    strokeWidth="2.2"
                  />
                  <circle cx="0" cy="0" r="3.2" fill={atmo.orbCore} />
                </g>
              </svg>

              {/* Spring-Rolling Split Digital Readout nestled inside the 180° dome */}
              <div className="pdial__readout" aria-label={`Selected solar time ${formatted}`}>
                {formatted.split("").map((ch, idx) => (
                  <RollingDigit key={idx} value={ch} />
                ))}
              </div>
            </div>

            {/* Collapsible Quiet Sky Options Drawer (collapsed by default) */}
            <div className={`pdial__drawer ${optionsOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="pdial__drawer-toggle"
                aria-expanded={optionsOpen}
                onClick={() => setOptionsOpen((v) => !v)}
              >
                <span>Sky options</span>
                <svg
                  className="pdial__drawer-chev"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {optionsOpen && (
                <div className="pdial__drawer-body">
                  {/* Quick Solar Jumps */}
                  <div className="pdial__jumps" role="group" aria-label="Quick solar jumps">
                    {[
                      { label: "Dawn", hr: 6.25 },
                      { label: "Noon", hr: 12.5 },
                      { label: "Golden", hr: 16.5 },
                      { label: "Night", hr: 23.0 },
                    ].map((p) => {
                      const active = Math.abs(t - p.hr) < 0.55;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          className={`pdial__jump ${active ? "is-active" : ""}`}
                          onClick={() => glideSkyTime(p.hr, { duration: 560 })}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Atmosphere Toggles */}
                  <div className="pdial__toggles" role="group" aria-label="Atmosphere controls">
                    <button
                      type="button"
                      className={`pdial__toggle ${cloudDrift ? "is-on" : ""}`}
                      aria-pressed={cloudDrift}
                      onClick={() => onToggleCloudDrift?.()}
                    >
                      <span>Cloud drift</span>
                      <span className="pdial__switch" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      className={`pdial__toggle ${nightStars ? "is-on" : ""}`}
                      aria-pressed={nightStars}
                      onClick={() => onToggleNightStars?.()}
                    >
                      <span>Night preview</span>
                      <span className="pdial__switch" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ThermalSkyAnalogClock(props: Omit<ThermalSkyClockProps, "mode">) {
  return <ThermalSkyClock {...props} mode="analog" />;
}

export function ThermalSkyDigitalClock(props: Omit<ThermalSkyClockProps, "mode">) {
  return <ThermalSkyClock {...props} mode="digital" />;
}
