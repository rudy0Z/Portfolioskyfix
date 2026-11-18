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
import { getLight } from "@/lib/lighting";
import { moonAt, sunAt } from "@/lib/celestial";
import {
  formatTime,
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
   ThermalSkyClock — the horizon instrument.

   The face is NOT a clock circle: it is a shallow horizon arc across a
   landscape window. The sun and moon markers ride the arc at their real
   altitudes (positions come straight from the site's LightModel — no
   astronomy is recomputed here), and the 4-stop OKLCH sky trail
   (−2.85h / −1.35h / now / +0.65h) is painted along the arc as a comet whose
   head is the active body: position = now. Needle, tick ring and hands are
   gone — the trail IS the read.

   Interaction: click the horizon where the body would be (glides there),
   drag horizontally to scrub (one arc-span ≈ 12 h, Shift = fine), arrow
   keys step time, wheel scrubs while expanded, presets + LIVE + digital
   rolling readout unchanged.
   ========================================================================== */

/* ── Horizon face geometry ─────────────────────────────────────────────── */

const VB_W = 240;
const VB_H = 150;

/** Instrument span of the horizon line (graduations + comet live here). */
const ARC_L = 14;
const ARC_R = 226;
const ARC_MID = (ARC_L + ARC_R) / 2;
/** Face overdraw so the thumbnail camera can pan without revealing edges. */
const FACE_L = -10;
const FACE_R = 250;

/** Parabolic bow: y = ARC_APEX + ARC_BOW·u², u = (x − mid)/half-span. */
const ARC_APEX = 80;
const ARC_BOW = 14;
const ARC_EDGE = ARC_APEX + ARC_BOW;

/** Card px of rise per unit of model altitude (noon sun ≈ 1.0). */
const ALT_RISE = 38;
const MOON_RISE = 32; // the moon rides a little lower than the sun

/** Thumbnail camera: a square stage crops the 240-wide face to a 150-wide
    slice (preserveAspectRatio slice); the camera tracks the body within it. */
const THUMB_PAN = (VB_W - VB_H) / 2;

function arcY(x: number): number {
  const u = (x - ARC_MID) / ((ARC_R - ARC_L) / 2);
  return ARC_APEX + ARC_BOW * u * u;
}

function cardX(modelX: number): number {
  return ARC_L + modelX * (ARC_R - ARC_L);
}

/** Exact quadratic for the parabola between two symmetric x endpoints. */
function arcPath(x0: number, x1: number): string {
  const y0 = arcY(x0);
  const y1 = arcY(x1);
  return `M ${x0} ${y0.toFixed(2)} Q ${ARC_MID} ${(2 * ARC_APEX - y0).toFixed(2)} ${x1} ${y1.toFixed(2)}`;
}

const FACE_ARC = arcPath(FACE_L, FACE_R);
const INSTRUMENT_ARC = arcPath(ARC_L, ARC_R);

export type ClockMode = "analog" | "digital";
export type ClockSize = "thumbnail" | "full";

export interface ThermalSkyClockProps {
  /** Initial or controlled mode: 'analog' (face only) or 'digital' (face + rolling readout) */
  mode?: ClockMode;
  onModeChange?: (mode: ClockMode) => void;
  /** 'thumbnail' is the panning nav-chrome window; 'full' is the interactive horizon instrument */
  size?: ClockSize;
  /** If true (default), clicking the thumbnail automatically expands it into a full popover */
  expandable?: boolean;
  onSizeChange?: (size: ClockSize) => void;
  className?: string;
}

/* ==========================================================================
   Sky sampling — everything comes from the site's own models.
   ========================================================================== */

type BodyAt = (h: number) => ReturnType<typeof sunAt>;

function bodyFor(active: "sun" | "moon", h: number) {
  return active === "sun" ? sunAt(h) : moonAt(h);
}

/**
 * Samples the portfolio's OKLCH sky palette at time `t`, extracting the
 * 4-stop trail spectrum (far past → mid past → now → lead) that is painted
 * along the horizon arc, plus the chrome colors (glass frame inks stay light:
 * the frame is dark glass at every hour).
 */
function getThermalSpectrum(t: number) {
  const palNow = paletteAt(t);
  const palTrailMid = paletteAt(wrapHours(t - 1.35));
  const palTrailFar = paletteAt(wrapHours(t - 2.85));
  const palLead = paletteAt(wrapHours(t + 0.65));

  const boost = (c: OKLCH, lAdd = 0, cMul = 1.22): string =>
    oklch({
      l: Math.min(0.96, Math.max(0.25, c.l + lAdd)),
      c: Math.min(0.32, c.c * cMul),
      h: c.h,
    });

  const headHex = boost(palNow.sunCore, 0.04, 1.3);
  const crestHex = boost(palNow.cloudRim, 0.05, 1.28);
  const bodyHex = boost(palNow.horizon, 0.0, 1.25);
  const midTrailHex = boost(palTrailMid.horizon, -0.05, 1.2);
  const farTrailHex = boost(palTrailFar.mid, -0.1, 1.12);
  const leadHex = boost(palLead.sunGlow, 0.02, 1.2);

  /* the chrome — dark glass at every hour, so frame ink is always light */
  const deepBase: OKLCH = { l: 0.14, c: 0.045, h: 252 };
  const skyDeep = mixOklch(palNow.horizon, deepBase, 0.8);

  return {
    headHex,
    crestHex,
    bodyHex,
    midTrailHex,
    farTrailHex,
    leadHex,
    rawNow: palNow,
    skyZenithHex: oklch(mixOklch(palNow.zenith, deepBase, 0.68)),
    skyMidHex: oklch(mixOklch(palNow.mid, deepBase, 0.7)),
    skyDeepHex: oklch(skyDeep),
    glowHex: boost(palNow.sunGlow, 0.06, 1.3),
    inkStrong: "#F7F5F0",
    inkDim: "rgba(247, 245, 240, 0.35)",
  };
}

/* Horizon graduations: where each body actually stands at whole hours of its
   own arc — sampled straight from the celestial model, never hand-placed.
   The sun owns 06–18, the antiphase moon owns 19–05 (same handover the sky
   engine uses: sun.active while altitude > −0.05). */
const SUN_MARKS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => ({
  h,
  x: cardX(sunAt(h).x),
}));
const MOON_MARKS = [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5].map((h) => ({
  h,
  x: cardX(moonAt(h).x),
}));

/* Click-to-scrub table: every quarter hour each body is above the horizon,
   with its card x. Nearest-x wins, so a click means "put the body HERE". */
function sampleArc(bodyFn: BodyAt) {
  const out: { h: number; x: number }[] = [];
  for (let h = 0; h < 24; h += 0.25) {
    const b = bodyFn(h);
    if (b.altitude > 0.005) out.push({ h, x: cardX(b.x) });
  }
  return out;
}
const SUN_ARC_SAMPLES = sampleArc(sunAt);
const MOON_ARC_SAMPLES = sampleArc(moonAt);

/* ==========================================================================
   Rolling Digit Slot Machine (digital readout)
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
                color: isCurrent ? "var(--tsc-ink, #FBF9F5)" : undefined,
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
   Main Component: ThermalSkyClock (horizon instrument)
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
  const [hover, setHover] = useState<{ x: number; hour: number } | null>(null);

  const activeMode = controlledMode ?? internalMode;
  const activeSize = controlledSize ?? internalSize;
  const isThumbnail = activeSize === "thumbnail";
  // A controlled, expandable clock can fold back into its thumbnail. Clicks
  // outside are the owner's to handle (App renders a backdrop for that).
  const collapsible = expandable && controlledSize !== undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStateRef = useRef<{ active: boolean; lastX: number; moved: boolean }>({
    active: false,
    lastX: 0,
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
     The light model — sun/moon positions, altitudes and the live palette
     all come from the site's single derivation. No astronomy here.
     ------------------------------------------------------------------------ */
  const light = useMemo(() => getLight(t), [t]);
  const spectrum = useMemo(() => getThermalSpectrum(t), [t]);

  // Same body handover the sky engine uses for its key light.
  const activeBody: "sun" | "moon" = light.sun.altitude > -0.05 ? "sun" : "moon";
  const body = activeBody === "sun" ? light.sun : light.moon;

  /* Comet stops along the arc: the tail samples the active body's OWN past
     positions (where it stood 1.35 h / 2.85 h ago), the lead where it will
     stand in 0.65 h. A sample from before the body rose wraps to a pre-rise
     arc position, so past samples clamp to at-or-behind the head — a just-
     risen body simply has no tail yet, and it grows as it travels. */
  const trail = useMemo(() => {
    const at = (h: number) => cardX(bodyFor(activeBody, h).x);
    const off = (x: number) =>
      Math.min(1, Math.max(0, (x - ARC_L) / (ARC_R - ARC_L)));
    const now = off(cardX(body.x));
    const far = Math.min(off(at(wrapHours(t - 2.85))), now);
    const mid = Math.max(Math.min(off(at(wrapHours(t - 1.35))), now), far);
    const lead = Math.max(off(at(wrapHours(t + 0.65))), now);
    return { far, mid, now, lead };
  }, [t, activeBody, body.x]);

  /* Markers at real altitudes over the bowed line. */
  const sunX = cardX(light.sun.x);
  const sunY = arcY(sunX) - light.sun.altitude * ALT_RISE;
  const moonX = cardX(light.moon.x);
  const moonY = arcY(moonX) - light.moon.altitude * MOON_RISE;
  const headX = activeBody === "sun" ? sunX : moonX;

  /* Thumbnail camera: track the body along the horizon (the pan idiom, kept
     as an idiom — it is now a horizon tracking shot, not a dial orbit). */
  const panX = isThumbnail
    ? Math.max(-THUMB_PAN, Math.min(THUMB_PAN, ARC_MID - headX))
    : 0;
  const panY = isThumbnail ? body.altitude * 5 : 0;

  /* Ground afterglow: the sky's own light pooling on the field under the head. */
  const groundGlow =
    activeBody === "sun"
      ? Math.min(
          0.55,
          light.golden * 0.5 + light.daylight * 0.2 + light.twilight * 0.35
        )
      : 0.14 + light.moonIllumination * 0.12;

  /* Click-to-scrub: nearest quarter-hour sample of the active body's arc. */
  const hourForCardX = useCallback(
    (x: number) => {
      const table = activeBody === "sun" ? SUN_ARC_SAMPLES : MOON_ARC_SAMPLES;
      let best = table[0]?.h ?? t;
      let bestD = Infinity;
      for (const s of table) {
        const d = Math.abs(s.x - x);
        if (d < bestD) {
          bestD = d;
          best = s.h;
        }
      }
      return best;
    },
    [activeBody, t]
  );

  /* ------------------------------------------------------------------------
     Pointer interaction — click the horizon, or drag along it to scrub.
     ------------------------------------------------------------------------ */
  const unitsFromClient = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return ARC_MID;
    const rect = svg.getBoundingClientRect();
    const scale = Math.max(rect.width / VB_W, rect.height / VB_H);
    return (
      (clientX - rect.left - (rect.width - VB_W * scale) / 2) / scale
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // In compact navbar thumbnail mode, clicking expands to full view first
    if (isThumbnail && expandable) {
      e.stopPropagation();
      handleSizeSwitch("full");
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = { active: true, lastX: e.clientX, moved: false };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const x = Math.min(ARC_R, Math.max(ARC_L, unitsFromClient(e.clientX)));

    if (!dragStateRef.current.active) {
      if (!isThumbnail) setHover({ x, hour: hourForCardX(x) });
      return;
    }

    const dx = e.clientX - dragStateRef.current.lastX;
    if (Math.abs(dx) < 0.5) return;
    dragStateRef.current.lastX = e.clientX;
    dragStateRef.current.moved = true;

    const rect = svgRef.current?.getBoundingClientRect();
    const scale = rect ? Math.max(rect.width / VB_W, rect.height / VB_H) : 1;
    const units = dx / scale;
    // One horizon-span of drag = 12 hours (Shift = fine, 3 hours per span).
    const hours = (units / (ARC_R - ARC_L)) * (e.shiftKey ? 3 : 12);
    setSkyTime(wrapHours(getSkyTime() + hours), "manual");
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStateRef.current.active) return;
    const wasMoved = dragStateRef.current.moved;
    dragStateRef.current.active = false;
    setIsDragging(false);

    // A click (no drag) glides the active body to the clicked horizon spot.
    if (!wasMoved && !isThumbnail) {
      const x = Math.min(ARC_R, Math.max(ARC_L, unitsFromClient(e.clientX)));
      glideSkyTime(hourForCardX(x), { duration: 520 });
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

  const marks = activeBody === "sun" ? SUN_MARKS : MOON_MARKS;
  const nightStars = useMemo(
    () => light.stars.filter((s) => s.y < 0.5 && s.x > 0.02 && s.x < 0.98),
    [light.stars]
  );

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
          "--tsc-sky-zenith": spectrum.skyZenithHex,
          "--tsc-sky-mid": spectrum.skyMidHex,
          "--tsc-sky-deep": spectrum.skyDeepHex,
          "--tsc-glow": spectrum.glowHex,
          "--tsc-ink": spectrum.inkStrong,
          "--tsc-ink-dim": spectrum.inkDim,
        } as React.CSSProperties
      }
    >
      {/* Outer atmosphere kept from the chrome: a palette-tinted under-glow */}
      <div className="tsc-bloom" aria-hidden="true" />
      <div className="tsc-halo" aria-hidden="true" />

      {/* Top Instrument Bar (Hidden in compact Navbar Thumbnail mode) */}
      {!isThumbnail && (
        <header className="tsc-header">
          <div className="tsc-controls">
            <div className="tsc-mode-toggle" role="tablist" aria-label="Clock display mode">
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === "analog"}
                className={`tsc-mode-btn ${activeMode === "analog" ? "is-active" : ""}`}
                onClick={() => handleModeSwitch("analog")}
              >
                Face
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

      {/* The Horizon Face */}
      <div className="tsc-dial-stage">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="tsc-svg"
          role="slider"
          tabIndex={0}
          aria-label="Sky horizon instrument — click the arc, drag, or use arrow keys to set site time"
          aria-valuemin={0}
          aria-valuemax={24}
          aria-valuenow={Number(t.toFixed(2))}
          aria-valuetext={formatted}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => {
            if (!isDragging) setHover(null);
          }}
          onKeyDown={handleKeyDown}
        >
          <defs>
            {/* The real sky above the line — raw palette, no dial darkening */}
            <linearGradient
              id={`thc-sky-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2={ARC_EDGE}
            >
              <stop offset="0%" stopColor={oklch(spectrum.rawNow.zenith)} />
              <stop offset="52%" stopColor={oklch(spectrum.rawNow.mid)} />
              <stop offset="86%" stopColor={oklch(spectrum.rawNow.horizon)} />
              <stop offset="100%" stopColor={oklch(spectrum.rawNow.haze)} />
            </linearGradient>

            {/* The field below the line — terrain keyed to the same sky */}
            <linearGradient
              id={`thc-ground-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={ARC_EDGE - 4}
              x2="0"
              y2={VB_H + 30}
            >
              <stop
                offset="0%"
                stopColor={oklch(
                  mixOklch(spectrum.rawNow.terrain, spectrum.rawNow.horizon, 0.35)
                )}
              />
              <stop
                offset="100%"
                stopColor={oklch(
                  mixOklch(spectrum.rawNow.terrain, { l: 0.055, c: 0.03, h: 252 }, 0.78)
                )}
              />
            </linearGradient>

            {/* The OKLCH trail comet — the primary read. Past sky colors trail
                behind the now-marker, lead color ahead; position = now. */}
            <linearGradient
              id={`thc-trail-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1={ARC_L}
              y1={ARC_APEX}
              x2={ARC_R}
              y2={ARC_APEX}
            >
              <stop
                offset={Math.max(0, trail.far - 0.1)}
                stopColor={spectrum.farTrailHex}
                stopOpacity={0}
              />
              <stop offset={trail.far} stopColor={spectrum.farTrailHex} />
              <stop offset={trail.mid} stopColor={spectrum.midTrailHex} />
              <stop
                offset={Math.max(trail.far, trail.now - (trail.now - trail.mid) * 0.45)}
                stopColor={spectrum.bodyHex}
              />
              <stop offset={trail.now} stopColor={spectrum.crestHex} />
              <stop offset={trail.lead} stopColor={spectrum.leadHex} />
              <stop offset="100%" stopColor={spectrum.leadHex} stopOpacity={0.35} />
            </linearGradient>

            {/* Ground afterglow pooling under the comet head */}
            <radialGradient id={`thc-wash-${uid}`}>
              <stop offset="0%" stopColor={withAlpha(spectrum.glowHex, 0.6)} />
              <stop offset="55%" stopColor={withAlpha(spectrum.bodyHex, 0.22)} />
              <stop offset="100%" stopColor={withAlpha(spectrum.bodyHex, 0)} />
            </radialGradient>

            {/* Soft bloom for markers and the comet under-glow */}
            <filter
              id={`thc-soft-${uid}`}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Face window */}
            <clipPath id={`thc-clip-${uid}`}>
              <rect x="0" y="0" width={VB_W} height={VB_H} rx="12" />
            </clipPath>

            {/* Moon phase crescent */}
            <mask id={`thc-moon-${uid}`}>
              <circle cx={moonX} cy={moonY} r="3.1" fill="#fff" />
              <circle cx={moonX + 1.5} cy={moonY - 0.9} r="2.6" fill="#000" />
            </mask>
          </defs>

          <g clipPath={`url(#thc-clip-${uid})`}>
            {/* Pannable horizon stage (thumbnail camera tracks the body) */}
            <g
              className="thc-camera"
              style={{
                transform: `translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0) scale(${isThumbnail ? 1.12 : 1})`,
                transformOrigin: `${ARC_MID}px ${ARC_APEX}px`,
              }}
            >
              {/* Sky half */}
              <path
                d={`${FACE_ARC} L ${FACE_R} -60 L ${FACE_L} -60 Z`}
                fill={`url(#thc-sky-${uid})`}
              />

              {/* Night stars — the sky model's own field, gated by starOpacity */}
              <g opacity={light.starOpacity} fill="#E9EFFA">
                {nightStars.map((s, i) =>
                  i % 2 === 0 ? (
                    <circle
                      key={i}
                      cx={cardX(s.x)}
                      cy={6 + (s.y / 0.56) * 60}
                      r={Math.max(0.45, s.size * 0.85)}
                      opacity={s.brightness}
                    />
                  ) : null
                )}
              </g>

              {/* Field half */}
              <path
                d={`${FACE_ARC} L ${FACE_R} ${VB_H + 60} L ${FACE_L} ${VB_H + 60} Z`}
                fill={`url(#thc-ground-${uid})`}
              />

              {/* Afterglow pooling on the ground under the comet head */}
              <ellipse
                cx={headX}
                cy={arcY(headX) + 4}
                rx={38}
                ry={10}
                fill={`url(#thc-wash-${uid})`}
                opacity={groundGlow}
              />

              {/* Horizon graduations — the body's true whole-hour stations */}
              <g aria-hidden="true">
                {marks.map((m) => {
                  const y = arcY(m.x);
                  const major = m.h % 3 === 0;
                  return (
                    <line
                      key={m.h}
                      x1={m.x}
                      y1={y + 1.4}
                      x2={m.x}
                      y2={y + 1.4 + (major ? 5 : 2.8)}
                      stroke={
                        major ? "rgba(247, 245, 240, 0.5)" : "rgba(247, 245, 240, 0.2)"
                      }
                      strokeWidth={major ? 1 : 0.7}
                    />
                  );
                })}
                {marks
                  .filter((m) => m.h % 3 === 0)
                  .map((m) => (
                    <text
                      key={`l${m.h}`}
                      x={m.x}
                      y={arcY(m.x) + 14.5}
                      textAnchor="middle"
                      className="thc-hour-label"
                    >
                      {String(m.h).padStart(2, "0")}
                    </text>
                  ))}
              </g>

              {/* The comet: under-glow, trail stroke, then the crisp line */}
              <path
                d={INSTRUMENT_ARC}
                fill="none"
                stroke={`url(#thc-trail-${uid})`}
                strokeWidth={6}
                strokeOpacity={0.28}
                filter={`url(#thc-soft-${uid})`}
              />
              <path
                d={INSTRUMENT_ARC}
                fill="none"
                stroke={`url(#thc-trail-${uid})`}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
              <path
                d={INSTRUMENT_ARC}
                fill="none"
                stroke="rgba(247, 245, 240, 0.3)"
                strokeWidth={0.6}
              />

              {/* Moon marker (rides its own real arc) */}
              <g opacity={light.moon.opacity}>
                <circle
                  cx={moonX}
                  cy={moonY}
                  r={6}
                  fill="rgba(216, 226, 242, 0.28)"
                  filter={`url(#thc-soft-${uid})`}
                />
                <circle
                  cx={moonX}
                  cy={moonY}
                  r={3.1}
                  fill="#DCE6F4"
                  mask={`url(#thc-moon-${uid})`}
                  opacity={0.55 + light.moonIllumination * 0.45}
                />
              </g>

              {/* Sun marker (the comet's head while it owns the sky) */}
              <g opacity={light.sun.opacity}>
                <circle
                  cx={sunX}
                  cy={sunY}
                  r={7.2}
                  fill={withAlpha(spectrum.headHex, 0.32)}
                  filter={`url(#thc-soft-${uid})`}
                />
                <circle cx={sunX} cy={sunY} r={3} fill={spectrum.headHex} />
              </g>

              {/* Hover ghost — where the body would stand at this spot */}
              {hover && !isDragging && Math.abs(hover.x - headX) > 5
                ? (() => {
                    const gb = bodyFor(activeBody, hover.hour);
                    const gy =
                      arcY(hover.x) -
                      gb.altitude * (activeBody === "sun" ? ALT_RISE : MOON_RISE);
                    return (
                      <g pointerEvents="none">
                        <circle
                          cx={hover.x}
                          cy={gy}
                          r={4.4}
                          fill="none"
                          stroke="rgba(247, 245, 240, 0.78)"
                          strokeWidth={0.8}
                          strokeDasharray="2 2.4"
                        />
                        <text
                          x={hover.x}
                          y={gy - 8}
                          textAnchor="middle"
                          className="thc-ghost-label"
                        >
                          {formatTime(hover.hour)}
                        </text>
                      </g>
                    );
                  })()
                : null}
            </g>
          </g>
        </svg>

        {/* Digital rolling readout over the face */}
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

      {/* Thumbnail time readout — the half-time-focused look */}
      {isThumbnail && (
        <div className="tsc-thumb-time" aria-hidden="true">
          {formatted}
        </div>
      )}

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
