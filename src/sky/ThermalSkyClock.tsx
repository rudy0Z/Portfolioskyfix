"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { oklch, mixOklch, withAlpha, type OKLCH } from "@/lib/color";
import { paletteAt } from "@/lib/skyPalette";
import {
  formatTime,
  momentLabel,
  phaseAt,
  wrapHours,
} from "@/lib/timeOfDay";
import {
  getSkyTime,
  glideSkyTime,
  setSkyTime,
  syncToLocalTime,
  useSkyTime,
  useSyncState,
} from "@/lib/useTimeOfDay";

/* ==========================================================================
   Geometry & Physics Constants
   ========================================================================== */

const VB_SIZE = 240;
const CX = 120;
const CY = 120;

/** 72 ticks = 5° spacing (10-minute intervals on a 12h face) for lush Pin UI density */
const SKY_TICKS = 72;

/** LensClock signature viewport pan distance in thumbnail mode */
const PAN_DISTANCE = 22;

export type ClockMode = "analog" | "digital";
export type ClockSize = "thumbnail" | "full";

export interface ThermalSkyClockProps {
  /** Initial or controlled mode: 'analog' (LensClock + Thermal ring) or 'digital' (Rolling slots) */
  mode?: ClockMode;
  onModeChange?: (mode: ClockMode) => void;
  /** 'thumbnail' activates LensClock camera panning for navbar placement; 'full' opens the complete interactive dial */
  size?: ClockSize;
  /** If true (default), clicking the thumbnail automatically expands it into a full popover dial */
  expandable?: boolean;
  onSizeChange?: (size: ClockSize) => void;
  className?: string;
}

/* ==========================================================================
   Math & Color Helpers
   ========================================================================== */

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function wrapDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  let d = ((toDeg - fromDeg) % 360 + 540) % 360 - 180;
  return d;
}

/**
 * Samples the portfolio's OKLCH sky palette at time `t`, extracting a rich
 * 4-stop thermal spectrum that moves and morphs with the time of day.
 */
function getThermalSpectrum(t: number) {
  const palNow = paletteAt(t);
  const palTrailMid = paletteAt(wrapHours(t - 1.35));
  const palTrailFar = paletteAt(wrapHours(t - 2.85));
  const palLead = paletteAt(wrapHours(t + 0.65));

  // Boost chroma slightly on the dial so the instrument ticks pop like Pin UI
  const boost = (c: OKLCH, lAdd = 0, cMul = 1.22): string =>
    oklch({
      l: Math.min(0.96, Math.max(0.25, c.l + lAdd)),
      c: Math.min(0.32, c.c * cMul),
      h: c.h,
    });

  const headHex = boost(palNow.sunCore, 0.04, 1.3);
  const crestHex = boost(palNow.cloudRim, 0.02, 1.28);
  const bodyHex = boost(palNow.horizon, 0.0, 1.25);
  const midTrailHex = boost(palTrailMid.horizon, -0.02, 1.2);
  const farTrailHex = boost(palTrailFar.mid, -0.04, 1.15);
  const leadHex = boost(palLead.sunGlow, 0.02, 1.2);

  return {
    headHex,
    crestHex,
    bodyHex,
    midTrailHex,
    farTrailHex,
    leadHex,
    rawNow: palNow,
    rawTrailMid: palTrailMid,
    rawTrailFar: palTrailFar,
  };
}

/* ==========================================================================
   Rolling Digit Slot Machine (Pin UI Thermal Dial Digital Synthesis)
   ========================================================================== */

function RollingDigit({
  digit,
  accentColor,
}: {
  digit: number;
  accentColor: string;
}) {
  return (
    <div className="tsc-digit-slot" aria-hidden="true">
      <div
        className="tsc-digit-strip"
        style={{
          transform: `translate3d(0, ${-digit * 10}%, 0)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const isCurrent = n === digit;
          return (
            <span
              key={n}
              className={`tsc-digit-cell ${isCurrent ? "is-current" : ""}`}
              style={{
                color: isCurrent ? "#FBF9F5" : undefined,
                textShadow: isCurrent
                  ? `0 0 18px ${withAlpha(accentColor, 0.55)}`
                  : undefined,
              }}
            >
              {n}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   Main Hybrid Component: ThermalSkyClock
   ========================================================================== */

export function ThermalSkyClock({
  mode: controlledMode,
  onModeChange,
  size: controlledSize,
  expandable = true,
  onSizeChange,
  className = "",
}: ThermalSkyClockProps) {
  const uid = useId().replace(/:/g, "");
  const t = useSkyTime();
  const { mode: syncMode } = useSyncState();

  const [internalMode, setInternalMode] = useState<ClockMode>("analog");
  const [internalSize, setInternalSize] = useState<ClockSize>(
    controlledSize ?? "full"
  );
  const [isDragging, setIsDragging] = useState(false);
  const [hoverAngle, setHoverAngle] = useState<number | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  const activeMode = controlledMode ?? internalMode;
  const activeSize = controlledSize ?? internalSize;
  const isThumbnail = activeSize === "thumbnail";
  // A controlled, expandable clock can fold back into its thumbnail. Clicks
  // outside are the owner's to handle (App renders a backdrop for that).
  const collapsible = expandable && controlledSize !== undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStateRef = useRef<{
    active: boolean;
    target: "hour" | "minute" | "ring";
    lastAngle: number;
    moved: boolean;
  }>({
    active: false,
    target: "ring",
    lastAngle: 0,
    moved: false,
  });

  const handleModeSwitch = useCallback(
    (next: ClockMode) => {
      setInternalMode(next);
      onModeChange?.(next);
    },
    [onModeChange]
  );

  const handleSizeSwitch = useCallback(
    (next: ClockSize) => {
      setInternalSize(next);
      onSizeChange?.(next);
    },
    [onSizeChange]
  );

  // Smooth sweeping seconds when synced to real-time clock
  useEffect(() => {
    if (syncMode !== "auto") return;
    let raf = 0;
    const tick = () => {
      const now = new Date();
      setLiveSeconds(now.getSeconds() + now.getMilliseconds() / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [syncMode]);

  // Escape folds the expanded clock back into its thumbnail.
  useEffect(() => {
    if (!collapsible || isThumbnail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSizeSwitch("thumbnail");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsible, isThumbnail, handleSizeSwitch]);

  // Wheel scrubbing while expanded. React's wheel listener is passive and
  // cannot stop the page scrolling, so bind a native one; the thumbnail lets
  // the wheel scroll the page.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isThumbnail) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += e.deltaMode === 0 ? e.deltaY : e.deltaY * 40;
      if (Math.abs(acc) < 40) return; // trackpads send many small deltas
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      const step = e.shiftKey ? 1.0 : 0.25; // 15-min ticks or 1-hour with Shift
      setSkyTime(wrapHours(getSkyTime() + dir * step), "manual");
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isThumbnail]);

  /* ------------------------------------------------------------------------
     Horological Angles & AM/PM State
     ------------------------------------------------------------------------ */
  const isPM = t >= 12;
  const isDaylight = t >= 6 && t < 18.5;
  const hour12 = t % 12;
  const hourAngle = (hour12 / 12) * 360; // 30° per hour
  const minuteAngle = ((t * 60) % 60) * 6; // 6° per minute
  const secondAngle =
    syncMode === "auto" ? liveSeconds * 6 : (((t * 3600) % 60) / 60) * 360;

  // 24-hour solar/lunar complication rotation (0° = Noon at top, 180° = Midnight at top)
  const complicationAngle = ((t - 12) / 24) * 360;

  /* ------------------------------------------------------------------------
     LensClock Camera Panning (Active in Thumbnail View)
     ------------------------------------------------------------------------ */
  const hourRad = ((hourAngle - 90) * Math.PI) / 180;
  const panX = isThumbnail ? Math.cos(hourRad) * PAN_DISTANCE : 0;
  const panY = isThumbnail ? Math.sin(hourRad) * PAN_DISTANCE : 0;

  // Directional light zone coordinates (shifts internal glow toward active hand)
  const zoneX = (50 + Math.cos(hourRad) * 34).toFixed(1);
  const zoneY = (50 + Math.sin(hourRad) * 34).toFixed(1);

  /* ------------------------------------------------------------------------
     Multi-Stop Dynamic Atmospheric Spectrum
     ------------------------------------------------------------------------ */
  const spectrum = useMemo(() => getThermalSpectrum(t), [t]);

  /* ------------------------------------------------------------------------
     72-Tick Pin UI Wave Physics + Per-Tick Chromatic Gradient
     ------------------------------------------------------------------------ */
  const ticks = useMemo(() => {
    const focusAngle = isDragging && hoverAngle !== null ? hoverAngle : hourAngle;

    return Array.from({ length: SKY_TICKS }, (_, i) => {
      const deg = (i / SKY_TICKS) * 360;

      // Angular distances
      const behind = (focusAngle - deg + 360) % 360;
      const ahead = (deg - focusAngle + 360) % 360;
      const nearest = Math.min(behind, ahead);

      // 1. Pin UI Symmetric Tactile Wave Crest (Raised Cosine Kernel)
      const waveSpan = 42; // degrees of influence around active needle
      const waveRaw =
        nearest < waveSpan
          ? 0.5 * (1 + Math.cos((Math.PI * nearest) / waveSpan))
          : 0;
      const head = Math.pow(waveRaw, 1.35);

      // 2. Travelling Comet Trail (145° sweep behind the rotation)
      const trailSpan = 145;
      const trailRaw = behind < trailSpan ? 1 - behind / trailSpan : 0;
      const trail = Math.pow(trailRaw, 1.55) * 0.82;

      // 3. Hover Resonance Ripple (secondary tactile feedback when pointer hovers)
      let hoverBoost = 0;
      if (hoverAngle !== null && !isDragging) {
        const hDist = Math.min(
          (hoverAngle - deg + 360) % 360,
          (deg - hoverAngle + 360) % 360
        );
        if (hDist < 28) {
          hoverBoost =
            Math.pow(0.5 * (1 + Math.cos((Math.PI * hDist) / 28)), 1.5) * 0.45;
        }
      }

      const energy = Math.min(1, Math.max(head, trail) + hoverBoost);
      const isMajor = i % 6 === 0; // Every 12th of dial (hour markers)
      const isMedium = i % 3 === 0 && !isMajor; // Half-hour markers

      // Dynamic Radial Geometry (Lively Pin UI inward + outward expansion)
      const baseInner = isMajor ? 82.5 : isMedium ? 85 : 86.8;
      const baseOuter = isMajor ? 94.5 : isMedium ? 93 : 91.8;

      const innerR = baseInner - head * 4.2 - trail * 1.8 - hoverBoost * 2.2;
      const outerR = baseOuter + head * 8.4 + trail * 3.8 + hoverBoost * 4.0;

      const p1 = polar(CX, CY, innerR, deg);
      const p2 = polar(CX, CY, outerR, deg);

      // Multi-Color Travelling Spectrum Calculation per Tick:
      // Each tick samples its exact solar time offset along the sky palette!
      const tickHourOffset =
        nearest === ahead && ahead < 36
          ? (ahead / 360) * 6
          : -(behind / 360) * 8;
      const tickPal = paletteAt(wrapHours(t + tickHourOffset));

      const blendedOklch =
        head > 0.65
          ? mixOklch(tickPal.horizon, spectrum.rawNow.sunCore, (head - 0.65) / 0.35)
          : mixOklch(tickPal.mid, tickPal.horizon, Math.min(1, energy * 1.3));

      const activeTickHex = oklch({
        l: Math.min(0.95, Math.max(0.38, blendedOklch.l + head * 0.14)),
        c: Math.min(0.3, blendedOklch.c * (1.15 + energy * 0.25)),
        h: blendedOklch.h,
      });

      const strokeWidth =
        (isMajor ? 1.65 : 1.05) + head * 1.55 + trail * 0.65 + hoverBoost * 0.5;
      const opacity = isMajor
        ? 0.38 + energy * 0.62
        : 0.16 + energy * 0.84;

      return {
        i,
        deg,
        p1,
        p2,
        energy,
        head,
        isMajor,
        strokeWidth,
        opacity,
        color: energy > 0.06 ? activeTickHex : "rgba(255, 255, 255, 0.28)",
      };
    });
  }, [hourAngle, hoverAngle, isDragging, spectrum.rawNow.sunCore, t]);

  /* ------------------------------------------------------------------------
     Pointer Interaction & Continuous 24h Unwrapping
     ------------------------------------------------------------------------ */
  const angleFromPointer = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;
    return wrapDeg(deg);
  }, []);

  const handlePointerDown = (
    e: React.PointerEvent<SVGSVGElement>,
    target: "hour" | "minute" | "ring" = "ring"
  ) => {
    // If in compact navbar thumbnail mode, clicking expands to full view first
    if (isThumbnail && expandable) {
      e.stopPropagation();
      handleSizeSwitch("full");
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const angle = angleFromPointer(e.clientX, e.clientY);

    dragStateRef.current = {
      active: true,
      target,
      lastAngle: angle,
      moved: false,
    };
    setIsDragging(true);
    setHoverAngle(angle);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const angle = angleFromPointer(e.clientX, e.clientY);
    setHoverAngle(angle);

    if (!dragStateRef.current.active) return;

    const deltaDeg = shortestAngleDelta(dragStateRef.current.lastAngle, angle);
    if (Math.abs(deltaDeg) > 0.4) {
      dragStateRef.current.moved = true;
    }
    dragStateRef.current.lastAngle = angle;

    // Fine scrub if holding Shift or dragging Minute hand (1 turn = 1 hour)
    // Normal scrub on Ring or Hour hand (1 turn = 12 hours, continuous across AM/PM)
    const hoursPerTurn =
      e.shiftKey || dragStateRef.current.target === "minute" ? 1 : 12;
    const deltaHours = (deltaDeg / 360) * hoursPerTurn;

    setSkyTime(wrapHours(getSkyTime() + deltaHours), "manual");
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStateRef.current.active) return;
    const wasMoved = dragStateRef.current.moved;
    const releaseAngle = angleFromPointer(e.clientX, e.clientY);

    dragStateRef.current.active = false;
    setIsDragging(false);

    // If user clicked a tick on the ring without dragging, smoothly glide to that hour
    if (!wasMoved) {
      const target12 = (releaseAngle / 360) * 12;
      const currentT = getSkyTime();
      const baseHalfDay = currentT >= 12 ? 12 : 0;
      let candidate = baseHalfDay + target12;
      // Pick the candidate within +-6 hours for natural shortest-path glide
      if (candidate - currentT > 6) candidate -= 12;
      else if (currentT - candidate > 6) candidate += 12;
      glideSkyTime(wrapHours(candidate), { duration: 520 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isThumbnail && expandable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleSizeSwitch("full");
      return;
    }
    const step = e.shiftKey ? 1.0 : 0.25;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSkyTime(wrapHours(getSkyTime() + step), "manual");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSkyTime(wrapHours(getSkyTime() - step), "manual");
    } else if (e.key === "Home") {
      e.preventDefault();
      glideSkyTime(6, { duration: 500 });
    } else if (e.key === "End") {
      e.preventDefault();
      glideSkyTime(18.5, { duration: 500 });
    }
  };

  // Digital Clock formatting
  const formatted = formatTime(t); // "HH:MM"
  const [hhStr, mmStr] = formatted.split(":");
  const h1 = Number(hhStr[0] ?? 0);
  const h2 = Number(hhStr[1] ?? 0);
  const m1 = Number(mmStr[0] ?? 0);
  const m2 = Number(mmStr[1] ?? 0);

  // Tip position of the active solar wave
  const cometTip = polar(CX, CY, 89, hourAngle);

  return (
    <div
      ref={containerRef}
      className={`tsc-root ${isThumbnail ? "tsc-root--thumbnail" : "tsc-root--full"} ${
        isDragging ? "is-dragging" : ""
      } ${className}`}
      style={
        {
          "--tsc-head": spectrum.headHex,
          "--tsc-crest": spectrum.crestHex,
          "--tsc-body": spectrum.bodyHex,
          "--tsc-trail-mid": spectrum.midTrailHex,
          "--tsc-trail-far": spectrum.farTrailHex,
          "--tsc-lead": spectrum.leadHex,
          "--tsc-wash": withAlpha(spectrum.bodyHex, isThumbnail ? 0.42 : 0.32),
          "--tsc-wash-deep": withAlpha(spectrum.midTrailHex, 0.24),
          "--tsc-zone-x": `${zoneX}%`,
          "--tsc-zone-y": `${zoneY}%`,
          "--tsc-angle": `${hourAngle}deg`,
        } as React.CSSProperties
      }
    >
      {/* Ambient Pin UI Thermal Heat Wash (Conic + Radial Travelling Glow) */}
      <div className="tsc-heat-aura" aria-hidden="true" />

      {/* Top Instrument Bar (Hidden in compact Navbar Thumbnail mode) */}
      {!isThumbnail && (
        <header className="tsc-header">
          <div className="tsc-phase-pill">
            <span
              className="tsc-phase-dot"
              style={{
                background: spectrum.headHex,
                boxShadow: `0 0 10px ${spectrum.headHex}`,
              }}
            />
            <span className="tsc-phase-name">{momentLabel(t)}</span>
            <span className="tsc-meridiem-tag">{isPM ? "PM" : "AM"}</span>
          </div>

          <div className="tsc-controls">
            <div className="tsc-mode-toggle" role="tablist" aria-label="Clock display mode">
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === "analog"}
                className={`tsc-mode-btn ${activeMode === "analog" ? "is-active" : ""}`}
                onClick={() => handleModeSwitch("analog")}
              >
                Analog
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === "digital"}
                className={`tsc-mode-btn ${activeMode === "digital" ? "is-active" : ""}`}
                onClick={() => handleModeSwitch("digital")}
              >
                Digital
              </button>
            </div>

            {collapsible && (
              <button
                type="button"
                className="tsc-close-btn"
                onClick={() => handleSizeSwitch("thumbnail")}
                aria-label="Collapse clock to navbar thumbnail"
                title="Collapse"
              >
                ×
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Horological Dial Canvas */}
      <div className="tsc-dial-stage">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
          className="tsc-svg"
          role="slider"
          tabIndex={0}
          aria-label="Interactive Sky Time Horological Dial"
          aria-valuemin={0}
          aria-valuemax={24}
          aria-valuenow={Number(t.toFixed(2))}
          aria-valuetext={`${formatted} — ${momentLabel(t)}`}
          onPointerDown={(e) => handlePointerDown(e, "ring")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => {
            if (!isDragging) setHoverAngle(null);
          }}
          onKeyDown={handleKeyDown}
        >
          <defs>
            {/* Dynamic Multi-Stop Travelling Gradient synced to skyPalette */}
            <linearGradient
              id={`tsc-spectrum-${uid}`}
              x1={`${50 + Math.cos(hourRad) * 45}%`}
              y1={`${50 + Math.sin(hourRad) * 45}%`}
              x2={`${50 - Math.cos(hourRad) * 45}%`}
              y2={`${50 - Math.sin(hourRad) * 45}%`}
            >
              <stop offset="0%" stopColor={spectrum.headHex} />
              <stop offset="28%" stopColor={spectrum.crestHex} />
              <stop offset="62%" stopColor={spectrum.bodyHex} />
              <stop offset="100%" stopColor={spectrum.farTrailHex} />
            </linearGradient>

            {/* Inner Obsidian Bezel Surface Gradient with Directional Solar Highlight */}
            <radialGradient
              id={`tsc-face-${uid}`}
              cx={`${zoneX}%`}
              cy={`${zoneY}%`}
              r="72%"
            >
              <stop
                offset="0%"
                stopColor={withAlpha(spectrum.bodyHex, 0.22)}
              />
              <stop
                offset="42%"
                stopColor={withAlpha(spectrum.midTrailHex, 0.09)}
              />
              <stop offset="78%" stopColor="rgba(12, 14, 24, 0.94)" />
              <stop offset="100%" stopColor="rgba(7, 9, 16, 0.98)" />
            </radialGradient>

            {/* Crisp Bezel Metallic Rim */}
            <linearGradient id={`tsc-bezel-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.32)" />
              <stop offset="45%" stopColor="rgba(255, 255, 255, 0.07)" />
              <stop offset="100%" stopColor={withAlpha(spectrum.bodyHex, 0.38)} />
            </linearGradient>

            {/* Soft Bloom Filter for Active Wave Crest & Lume */}
            <filter
              id={`tsc-glow-${uid}`}
              x="-35%"
              y="-35%"
              width="170%"
              height="170%"
            >
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip Path for LensClock Camera Panning inside Bezel */}
            <clipPath id={`tsc-lens-clip-${uid}`}>
              <circle cx={CX} cy={CY} r={108} />
            </clipPath>
          </defs>

          {/* Outer Stationary Luxury Bezel */}
          <circle
            cx={CX}
            cy={CY}
            r={112}
            fill="rgba(8, 10, 18, 0.92)"
            stroke={`url(#tsc-bezel-${uid})`}
            strokeWidth={1.5}
          />
          <circle
            cx={CX}
            cy={CY}
            r={108}
            fill={`url(#tsc-face-${uid})`}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={0.75}
          />

          {/* ================================================================
              Pannable Horological Stage (LensClock PAN_DISTANCE in Thumbnail)
              ================================================================ */}
          <g clipPath={`url(#tsc-lens-clip-${uid})`}>
            <g
              className="tsc-lens-camera"
              style={{
                transform: `translate3d(${panX.toFixed(2)}px, ${panY.toFixed(
                  2
                )}px, 0) scale(${isThumbnail ? 1.14 : 1})`,
                transformOrigin: `${CX}px ${CY}px`,
              }}
            >
              {/* Ambient Travelling Comet Arc Underlay */}
              <circle
                cx={CX}
                cy={CY}
                r={89}
                fill="none"
                stroke={`url(#tsc-spectrum-${uid})`}
                strokeWidth={10}
                strokeOpacity={0.16}
                filter={`url(#tsc-glow-${uid})`}
              />

              {/* LensClock Fine Structural Spokes */}
              <g className="tsc-spokes" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => {
                  const deg = i * 30;
                  const pIn = polar(CX, CY, 24, deg);
                  const pOut = polar(CX, CY, 78, deg);
                  return (
                    <line
                      key={i}
                      x1={pIn.x}
                      y1={pIn.y}
                      x2={pOut.x}
                      y2={pOut.y}
                      stroke="rgba(255, 255, 255, 0.055)"
                      strokeWidth={0.75}
                    />
                  );
                })}
              </g>

              {/* Concentric Horological Chapter Rings */}
              <circle
                cx={CX}
                cy={CY}
                r={78}
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth={0.75}
                strokeDasharray="1.5 3.5"
              />
              <circle
                cx={CX}
                cy={CY}
                r={54}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={0.75}
              />

              {/* 72-Tick Pin UI Reactive Thermal Comb */}
              <g className="tsc-tick-ring">
                {ticks.map((tk) => (
                  <line
                    key={tk.i}
                    x1={tk.p1.x}
                    y1={tk.p1.y}
                    x2={tk.p2.x}
                    y2={tk.p2.y}
                    stroke={tk.color}
                    strokeWidth={tk.strokeWidth}
                    strokeLinecap="round"
                    strokeOpacity={tk.opacity}
                    filter={tk.head > 0.55 ? `url(#tsc-glow-${uid})` : undefined}
                  />
                ))}
              </g>

              {/* Active Wave Crest Orb (Rides the tip of the thermal wave) */}
              <circle
                cx={cometTip.x}
                cy={cometTip.y}
                r={isThumbnail ? 3.2 : 2.6}
                fill={spectrum.headHex}
                filter={`url(#tsc-glow-${uid})`}
              />

              {/* Cardinal Hour Numerals (12, 3, 6, 9) */}
              {activeMode === "analog" &&
                [
                  { label: "12", deg: 0 },
                  { label: "3", deg: 90 },
                  { label: "6", deg: 180 },
                  { label: "9", deg: 270 },
                ].map((num) => {
                  const pos = polar(CX, CY, 67, num.deg);
                  return (
                    <text
                      key={num.label}
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="tsc-cardinal-num"
                    >
                      {num.label}
                    </text>
                  );
                })}

              {/* ============================================================
                  MODE A: ANALOG HOROLOGY (Hands + AM/PM Moonphase Sub-Dial)
                  ============================================================ */}
              {activeMode === "analog" && (
                <>
                  {/* 6 O'Clock AM/PM Celestial Moonphase & Sun Sub-Dial Complication */}
                  <g
                    className="tsc-complication"
                    transform={`translate(${CX}, ${CY + 34})`}
                  >
                    {/* Sunken Guilloché Register */}
                    <circle
                      cx={0}
                      cy={0}
                      r={19}
                      fill="rgba(5, 7, 14, 0.85)"
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth={0.8}
                    />
                    {/* Upper Hemisphere Tint (Reflects live sky horizon) */}
                    <path
                      d="M -18 0 A 18 18 0 0 1 18 0 Z"
                      fill={withAlpha(spectrum.bodyHex, isDaylight ? 0.28 : 0.1)}
                    />

                    {/* Rotating 24-Hour Celestial Disc (Sun + Moon in antiphase) */}
                    <g transform={`rotate(${complicationAngle})`}>
                      {/* Solar Orb */}
                      <circle
                        cx={0}
                        cy={-11}
                        r={3.6}
                        fill={spectrum.headHex}
                        filter={`url(#tsc-glow-${uid})`}
                      />
                      {/* Lunar Crescent */}
                      <g transform="translate(0, 11)">
                        <circle cx={0} cy={0} r={3.3} fill="#D8E2F2" />
                        <circle
                          cx={1.4}
                          cy={-0.8}
                          r={2.9}
                          fill="rgba(5, 7, 14, 0.95)"
                        />
                      </g>
                    </g>

                    {/* Horizon Bridge Mask & Engraved AM/PM Readout */}
                    <path
                      d="M -18.5 1 Q -9 -2.5 0 1 T 18.5 1 L 18.5 19 L -18.5 19 Z"
                      fill="rgba(8, 10, 19, 0.92)"
                    />
                    <line
                      x1={-17}
                      y1={1}
                      x2={17}
                      y2={1}
                      stroke="rgba(255, 255, 255, 0.14)"
                      strokeWidth={0.6}
                    />
                    <text
                      x={0}
                      y={10.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="tsc-complication-ampm"
                      fill={spectrum.crestHex}
                    >
                      {isPM ? "PM ·" : "AM ·"} {isDaylight ? "DAY" : "NIGHT"}
                    </text>
                  </g>

                  {/* LensClock Skeleton Hour Hand with Thermal Lume Strip */}
                  <g
                    transform={`rotate(${hourAngle} ${CX} ${CY})`}
                    className="tsc-hand-group"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handlePointerDown(e as unknown as React.PointerEvent<SVGSVGElement>, "hour");
                    }}
                  >
                    {/* Hand Shadow */}
                    <rect
                      x={CX - 3.6}
                      y={CY - 52}
                      width={7.2}
                      height={62}
                      rx={3.6}
                      fill="rgba(0, 0, 0, 0.55)"
                      transform="translate(0, 2)"
                    />
                    {/* Brushed Chassis */}
                    <rect
                      x={CX - 3.4}
                      y={CY - 52}
                      width={6.8}
                      height={62}
                      rx={3.4}
                      fill="#F4F2ED"
                      stroke="rgba(10, 12, 20, 0.6)"
                      strokeWidth={0.6}
                    />
                    {/* Chromatic Lume Inlay */}
                    <rect
                      x={CX - 1.3}
                      y={CY - 46}
                      width={2.6}
                      height={36}
                      rx={1.3}
                      fill={spectrum.headHex}
                    />
                  </g>

                  {/* LensClock Skeleton Minute Hand with Thermal Lume Strip */}
                  <g
                    transform={`rotate(${minuteAngle} ${CX} ${CY})`}
                    className="tsc-hand-group"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handlePointerDown(e as unknown as React.PointerEvent<SVGSVGElement>, "minute");
                    }}
                  >
                    <rect
                      x={CX - 2.6}
                      y={CY - 74}
                      width={5.2}
                      height={88}
                      rx={2.6}
                      fill="rgba(0, 0, 0, 0.55)"
                      transform="translate(0, 2.5)"
                    />
                    <rect
                      x={CX - 2.4}
                      y={CY - 74}
                      width={4.8}
                      height={88}
                      rx={2.4}
                      fill="#FBF9F5"
                      stroke="rgba(10, 12, 20, 0.6)"
                      strokeWidth={0.6}
                    />
                    <rect
                      x={CX - 0.95}
                      y={CY - 68}
                      width={1.9}
                      height={54}
                      rx={0.95}
                      fill={spectrum.crestHex}
                    />
                  </g>

                  {/* Sweeping Second Hand with Counterweight */}
                  <g
                    transform={`rotate(${secondAngle} ${CX} ${CY})`}
                    style={{ pointerEvents: "none" }}
                  >
                    <line
                      x1={CX}
                      y1={CY + 18}
                      x2={CX}
                      y2={CY - 81}
                      stroke={spectrum.headHex}
                      strokeWidth={1.15}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={CX}
                      cy={CY + 12}
                      r={2.6}
                      fill="rgba(10, 12, 20, 0.9)"
                      stroke={spectrum.headHex}
                      strokeWidth={1.15}
                    />
                  </g>

                  {/* Precision Center Pivot Cap */}
                  <circle
                    cx={CX}
                    cy={CY}
                    r={5.6}
                    fill="#141724"
                    stroke="#FBF9F5"
                    strokeWidth={1.4}
                  />
                  <circle cx={CX} cy={CY} r={2.1} fill={spectrum.headHex} />
                </>
              )}
            </g>
          </g>
        </svg>

        {/* ====================================================================
            MODE B: DIGITAL ROLLING SLOT MACHINE OVERLAY (Pin UI Synthesis)
            ==================================================================== */}
        {activeMode === "digital" && !isThumbnail && (
          <div className="tsc-digital-center">
            <div className="tsc-digital-slots">
              <RollingDigit digit={h1} accentColor={spectrum.headHex} />
              <RollingDigit digit={h2} accentColor={spectrum.headHex} />
              <span
                className="tsc-digital-colon"
                style={{ color: spectrum.headHex }}
              >
                :
              </span>
              <RollingDigit digit={m1} accentColor={spectrum.crestHex} />
              <RollingDigit digit={m2} accentColor={spectrum.crestHex} />
            </div>

            <div className="tsc-digital-sub">
              <span>{phaseAt(t).toUpperCase()}</span>
              <span className="tsc-digital-sep">·</span>
              <span>{isPM ? "PM" : "AM"}</span>
            </div>

            <div className="tsc-digital-steppers">
              <button
                type="button"
                className="tsc-step-btn"
                onClick={() =>
                  glideSkyTime(wrapHours(getSkyTime() - 1), { duration: 280 })
                }
              >
                −1h
              </button>
              <button
                type="button"
                className="tsc-step-btn"
                onClick={() =>
                  glideSkyTime(wrapHours(getSkyTime() - 0.25), { duration: 220 })
                }
              >
                −15m
              </button>
              <button
                type="button"
                className="tsc-step-btn"
                onClick={() =>
                  glideSkyTime(wrapHours(getSkyTime() + 0.25), { duration: 220 })
                }
              >
                +15m
              </button>
              <button
                type="button"
                className="tsc-step-btn"
                onClick={() =>
                  glideSkyTime(wrapHours(getSkyTime() + 1), { duration: 280 })
                }
              >
                +1h
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Readout & Quick Solar Anchors (Full View) */}
      {!isThumbnail && (
        <footer className="tsc-footer">
          <div className="tsc-readout-group">
            <span className="tsc-mono-time">{formatted}</span>
            <button
              type="button"
              className={`tsc-sync-badge ${syncMode === "auto" ? "is-live" : ""}`}
              onClick={() => syncToLocalTime()}
              title="Reset to real local time"
            >
              <span className="tsc-sync-dot" />
              {syncMode === "auto" ? "LIVE" : "SYNC NOW"}
            </button>
          </div>

          <div className="tsc-presets" aria-label="Quick solar presets">
            {[
              { label: "Dawn", hr: 6.25 },
              { label: "Noon", hr: 12.0 },
              { label: "Golden", hr: 17.5 },
              { label: "Night", hr: 1.5 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                className="tsc-preset-chip"
                onClick={() => glideSkyTime(p.hr, { duration: 640 })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}

/* ==========================================================================
   Convenience Named Exports for Existing Imports
   ========================================================================== */

export function ThermalSkyAnalogClock(
  props: Omit<ThermalSkyClockProps, "mode">
) {
  return <ThermalSkyClock {...props} mode="analog" />;
}

export function ThermalSkyDigitalClock(
  props: Omit<ThermalSkyClockProps, "mode">
) {
  return <ThermalSkyClock {...props} mode="digital" />;
}
