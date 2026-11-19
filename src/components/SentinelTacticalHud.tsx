"use client";

import { useEffect, useState } from "react";

interface SensorFeed {
  id: string;
  label: string;
  alt: string;
  wind: string;
  bearing: string;
  blipX: number;
  blipY: number;
  tag: string;
}

const SENSOR_FEEDS: SensorFeed[] = [
  {
    id: "eoir",
    label: "DRONE EO/IR #02",
    alt: "412M",
    wind: "14KT NW",
    bearing: "038° NNE",
    blipX: 196,
    blipY: 84,
    tag: "THERMAL DELTA · N4 RIDGE",
  },
  {
    id: "thermal",
    label: "THERMAL SAT #01",
    alt: "680M",
    wind: "16KT NW",
    bearing: "312° WNW",
    blipX: 118,
    blipY: 98,
    tag: "SMOKE PLUME · SECTOR 04",
  },
  {
    id: "lidar",
    label: "WIND-LIDAR #03",
    alt: "290M",
    wind: "14KT NW",
    bearing: "064° ENE",
    blipX: 224,
    blipY: 132,
    tag: "EMBER DRIFT · 100M GRID",
  },
];

/**
 * SentinelTacticalHud — Component 5c: Dark Mission Console (`TALON FLIGHT COMMAND`).
 * Renders a crisp dark-glass radar tactical console (#0b0f19) with a live
 * 90S north-star window readout, telemetry bar, concentric tactical grid,
 * rotating radar sweep reticle, sensor cones, and interactive feed focus.
 */
export function SentinelTacticalHud() {
  const [secondsLeft, setSecondsLeft] = useState(42);
  const [paused, setPaused] = useState(false);
  const [activeFeedIdx, setActiveFeedIdx] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 42 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  const feed = SENSOR_FEEDS[activeFeedIdx];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <figure className="talon-hud" aria-label="TALON Flight Command tactical radar console">
      {/* Top Status & 90s North-Star Window Bar */}
      <div className="talon-hud-top">
        <div className="talon-hud-ident">
          <span className="talon-hud-dot" aria-hidden="true" />
          <span className="talon-hud-title">TALON FLIGHT COMMAND · SECTOR 04 NORTH RIDGE</span>
        </div>

        <button
          type="button"
          className={`talon-hud-timer ${paused ? "is-paused" : ""}`}
          onClick={() => setPaused((p) => !p)}
          title={paused ? "Resume 90s window timer" : "Pause 90s window timer"}
        >
          90S WINDOW: {mm}:{ss} LEFT
        </button>
      </div>

      {/* Explicit 16/9 Tactical Radar Screen (Zero-CLS) */}
      <div className="talon-hud-screen" style={{ aspectRatio: "16 / 9" }}>
        <svg
          viewBox="0 0 360 202"
          className="talon-radar-svg"
          role="img"
          aria-label={`Radar reticle tracking ${feed.tag}`}
        >
          <defs>
            <pattern id="talon-grid-100m" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgba(56, 189, 248, 0.09)"
                strokeWidth="0.6"
              />
            </pattern>

            <radialGradient id="talon-radar-bg" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.14)" />
              <stop offset="55%" stopColor="rgba(15, 23, 42, 0.2)" />
              <stop offset="100%" stopColor="rgba(11, 15, 25, 0.96)" />
            </radialGradient>

            <linearGradient id="talon-sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0)" />
              <stop offset="100%" stopColor="rgba(52, 211, 153, 0.34)" />
            </linearGradient>

            <radialGradient id="talon-blip-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(251, 146, 60, 0.85)" />
              <stop offset="100%" stopColor="rgba(251, 146, 60, 0)" />
            </radialGradient>
          </defs>

          {/* Tactical 100m Grid & Terrain Contours */}
          <rect x="0" y="0" width="360" height="202" fill="url(#talon-grid-100m)" />
          <rect x="0" y="0" width="360" height="202" fill="url(#talon-radar-bg)" />

          {/* Subtle Ridge Contour Lines */}
          <path
            d="M 22 152 Q 112 120 184 128 T 342 86"
            fill="none"
            stroke="rgba(148, 163, 184, 0.14)"
            strokeWidth="0.9"
            strokeDasharray="3 4"
          />
          <path
            d="M 16 176 Q 124 148 214 152 T 348 118"
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="0.8"
          />

          {/* Concentric Range Reticle Rings */}
          <g transform="translate(180, 101)">
            <circle r="30" fill="none" stroke="rgba(52, 211, 153, 0.24)" strokeWidth="0.8" />
            <circle r="60" fill="none" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="0.8" strokeDasharray="3 3" />
            <circle r="88" fill="none" stroke="rgba(52, 211, 153, 0.16)" strokeWidth="0.9" />

            {/* Cardinal Crosshairs */}
            <line x1="-96" y1="0" x2="96" y2="0" stroke="rgba(52, 211, 153, 0.14)" strokeWidth="0.7" />
            <line x1="0" y1="-92" x2="0" y2="92" stroke="rgba(52, 211, 153, 0.14)" strokeWidth="0.7" />

            {/* Sensor Field-of-View Cones */}
            <path
              d="M 0 0 L 58 -54 A 79 79 0 0 1 82 -14 Z"
              fill="rgba(56, 189, 248, 0.1)"
              stroke="rgba(56, 189, 248, 0.28)"
              strokeWidth="0.7"
            />
            <path
              d="M 0 0 L -70 -26 A 75 75 0 0 1 -44 -60 Z"
              fill="rgba(52, 211, 153, 0.08)"
              stroke="rgba(52, 211, 153, 0.22)"
              strokeWidth="0.7"
            />

            {/* Rotating Radar Sweep Beam */}
            <g className={`talon-radar-sweep ${paused ? "is-paused" : ""}`}>
              <path
                d="M 0 0 L 0 -88 A 88 88 0 0 1 62 -62 Z"
                fill="url(#talon-sweep-grad)"
              />
              <line x1="0" y1="0" x2="62" y2="-62" stroke="#34d399" strokeWidth="1.25" />
            </g>

            {/* Center Command Post Reticle */}
            <circle r="3.2" fill="#34d399" />
            <circle r="7.5" fill="none" stroke="rgba(52, 211, 153, 0.5)" strokeWidth="0.8" />

            {/* Range Ring Labels */}
            <text x="33" y="-3" className="talon-svg-lbl">100M</text>
            <text x="63" y="-3" className="talon-svg-lbl">250M</text>
          </g>

          {/* Target Blips for all 3 sensors */}
          {SENSOR_FEEDS.map((s, idx) => {
            const isSelected = idx === activeFeedIdx;
            return (
              <g key={s.id} className="talon-blip">
                {isSelected && (
                  <circle cx={s.blipX} cy={s.blipY} r="14" fill="url(#talon-blip-glow)" />
                )}
                <circle
                  cx={s.blipX}
                  cy={s.blipY}
                  r={isSelected ? 4.2 : 2.8}
                  fill={isSelected ? "#fb923c" : "#38bdf8"}
                  stroke={isSelected ? "#fff7ed" : "rgba(255,255,255,0.6)"}
                  strokeWidth="1"
                />
                {isSelected && (
                  <>
                    <circle
                      cx={s.blipX}
                      cy={s.blipY}
                      r="9.5"
                      fill="none"
                      stroke="rgba(251, 146, 60, 0.72)"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={s.blipX + 12}
                      y={s.blipY - 5}
                      className="talon-svg-tag"
                    >
                      {s.tag}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Corner HUD Brackets */}
          <g stroke="rgba(52, 211, 153, 0.36)" strokeWidth="1" fill="none">
            <path d="M 10 22 L 10 10 L 22 10" />
            <path d="M 338 10 L 350 10 L 350 22" />
            <path d="M 10 180 L 10 192 L 22 192" />
            <path d="M 338 192 L 350 192 L 350 180" />
          </g>
        </svg>

        {/* Interactive Sensor Switcher Overlay (top-left inside radar) */}
        <div className="talon-sensor-tabs" role="tablist" aria-label="Active drone sensors">
          {SENSOR_FEEDS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === activeFeedIdx}
              className={`talon-sensor-tab ${idx === activeFeedIdx ? "is-active" : ""}`}
              onClick={() => setActiveFeedIdx(idx)}
            >
              {s.id === "eoir" ? "EO/IR #02" : s.id === "thermal" ? "THERMAL #01" : "LIDAR #03"}
            </button>
          ))}
        </div>

        {/* Authority Gate Pill (bottom-left inside radar) */}
        <div className="talon-gate-chip">
          <span className="talon-gate-dot" aria-hidden="true" />
          HUMAN AUTH REQUIRED · SILENCE EXPIRES SAFE
        </div>
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="talon-hud-foot">
        <span>
          {feed.label} · ALT {feed.alt} · WIND {feed.wind}
        </span>
        <span className="talon-hud-grid-meta">TACTICAL GRID 100M · 3 SENSORS</span>
      </div>
    </figure>
  );
}
