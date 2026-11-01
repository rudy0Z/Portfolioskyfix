"use client";

/**
 * VolumetricSky — the atmospheric default.
 *
 * Built for depth rather than illustration. Four things do the work:
 *
 *  1. A *non-linear* gradient: stops crowd toward the horizon, mirroring the
 *     exponential increase in air mass you look through at low altitude. This
 *     is why real skies go pale at the horizon rather than evenly fading.
 *  2. A wide elliptical horizon glow centred on the sun's x, warm near the
 *     disc and falling off fast — scattering light, not a spotlight.
 *  3. Cloud plates made of many soft radial-gradient puffs at low opacity,
 *     heavily blurred. No outlines, no silhouettes: only density and light.
 *  4. Aerial perspective: near plates are larger, slower and slightly cooler;
 *     far plates sit low and are almost transparent.
 *
 * Everything reads `--sky-*` variables, so scrubbing relights the whole sky
 * without a re-render.
 */

import { useEffect, useMemo, useRef } from "react";
import { Celestial } from "./Celestial";
import type { LightModel } from "@/lib/lighting";
import { seeded } from "@/lib/celestial";

interface Puff {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  o: number;
}

interface Plate {
  y: number;
  x: number;
  w: number;
  depth: number;
  speed: number;
  seed: number;
  puffs: Puff[];
}

/**
 * Build a plate of overlapping ellipses. Puffs are wider than tall and packed
 * with variance, so the union has no readable edge — the blur does the rest.
 */
function makePlate(seed: number, count: number): Puff[] {
  const rand = seeded(seed);
  const puffs: Puff[] = [];
  for (let i = 0; i < count; i++) {
    const t = 0.5 + (rand() - 0.5) * 1.0;
    const spread = 1 - Math.pow(Math.abs(t - 0.5) * 2, 2.2);
    puffs.push({
      cx: (t + (rand() - 0.5) * 0.05) * 1000,
      cy: (0.5 + (rand() - 0.5) * 0.5) * 300 * (1 - spread * 0.3),
      rx: (70 + rand() * 140) * (0.6 + spread * 0.8),
      ry: (34 + rand() * 58) * (0.55 + spread * 0.7),
      o: (0.4 + rand() * 0.6) * (0.5 + spread * 0.5),
    });
  }
  return puffs;
}

const PLATES: Plate[] = [
  // far bank, low over the horizon — almost pure haze
  { y: 0.7, x: 0.16, w: 0.62, depth: 0.06, speed: 0.4, seed: 11, puffs: makePlate(11, 16) },
  { y: 0.73, x: 0.62, w: 0.54, depth: 0.08, speed: 0.45, seed: 12, puffs: makePlate(12, 14) },
  { y: 0.66, x: 0.93, w: 0.4, depth: 0.1, speed: 0.5, seed: 13, puffs: makePlate(13, 12) },
  // mid field — the readable clouds
  { y: 0.44, x: 0.33, w: 0.52, depth: 0.4, speed: 0.9, seed: 21, puffs: makePlate(21, 20) },
  { y: 0.36, x: 0.82, w: 0.44, depth: 0.36, speed: 0.85, seed: 22, puffs: makePlate(22, 18) },
  { y: 0.24, x: 0.1, w: 0.3, depth: 0.5, speed: 1.05, seed: 23, puffs: makePlate(23, 14) },
  // near wisps, high and thin
  { y: 0.12, x: 0.62, w: 0.5, depth: 0.8, speed: 1.4, seed: 31, puffs: makePlate(31, 16) },
  { y: 0.05, x: 0.24, w: 0.36, depth: 0.72, speed: 1.25, seed: 32, puffs: makePlate(32, 12) },
];

function PlateEl({ plate, index }: { plate: Plate; index: number }) {
  // Structure survives at 4–12px. Anything above ~14px turns form into fog.
  const blur = 4 + plate.depth * 8;
  const scale = 0.8 + plate.depth * 0.65;
  return (
    <div
      className="sky-plate"
      style={{
        top: `${plate.y * 100}%`,
        left: `${plate.x * 100}%`,
        width: `${plate.w * 100 * scale}vw`,
        opacity: 0.26 + plate.depth * 0.46,
        filter: `blur(${blur}px)`,
        translate: `calc(var(--drift-${index}) * 1px) 0`,
      }}
    >
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="sky-plate-svg">
        <defs>
          <linearGradient id={`pf-${plate.seed}`} x1="0" y1="0" x2="0.12" y2="1">
            <stop offset="0%" stopColor="var(--cloud-top)" stopOpacity="1" />
            <stop offset="42%" stopColor="var(--cloud-mid)" stopOpacity="0.92" />
            <stop offset="100%" stopColor="var(--cloud-base)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* ambient shadow base — offset down, keeps the mass grounded */}
        <g opacity="0.6" transform="translate(0 14)">
          {plate.puffs.map((p, i) => (
            <ellipse
              key={`s-${i}`}
              cx={p.cx}
              cy={p.cy}
              rx={p.rx * 0.97}
              ry={p.ry * 0.92}
              fill="var(--cloud-shadow-fill)"
              opacity={p.o * 0.9}
            />
          ))}
        </g>
        {/* body */}
        {plate.puffs.map((p, i) => (
          <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={`url(#pf-${plate.seed})`} opacity={p.o} />
        ))}
        {/* sun-facing rim — thin crescents along the top of each puff */}
        <g opacity="calc(0.25 + var(--golden) * 0.75)" transform="translate(-2 -5)">
          {plate.puffs.map((p, i) => (
            <ellipse
              key={`r-${i}`}
              cx={p.cx}
              cy={p.cy - p.ry * 0.34}
              rx={p.rx * 0.82}
              ry={p.ry * 0.4}
              fill="var(--cloud-top)"
              opacity={p.o * 0.5}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function VolumetricSky({ light }: { light: LightModel }) {
  const raf = useRef(0);
  const start = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const root = document.documentElement;
    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const s = (ts - start.current) / 1000;
      const vw = window.innerWidth;
      PLATES.forEach((p, i) => {
        const span = vw * 1.2;
        const travel = (2.2 + p.depth * 2.6) * p.speed;
        const offset = (((s * travel + p.x * span) % span) + span) % span;
        root.style.setProperty(`--drift-${i}`, String(offset - span * 0.5 - p.w * vw * 0.5));
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const sorted = useMemo(() => [...PLATES].sort((a, b) => a.depth - b.depth), []);

  return (
    <div className="fill" aria-hidden data-sky-variant="volumetric">
      {/* 1 — atmospheric base. Stops crowd toward the horizon. */}
      <div
        data-layer="gradient"
        className="fill"
        style={{
          background: `linear-gradient(180deg,
            var(--sky-zenith) 0%,
            var(--sky-zenith) 22%,
            var(--sky-mid) 58%,
            var(--sky-mid) 68%,
            var(--sky-horizon) 84%,
            var(--sky-haze) 96%,
            var(--sky-haze) 100%)`,
        }}
      />

      {/* 2 — horizon glow: a wide ellipse that follows the sun's x */}
      <div
        data-layer="horizon-glow"
        className="sky-horizon-glow"
        style={{
          left: "var(--sun-x)",
          background:
            "radial-gradient(ellipse 62% 26% at 50% 100%, var(--glow-core) 0%, var(--glow-mid) 34%, var(--glow-out) 72%)",
          opacity: "calc(0.2 + var(--golden) * 0.5 + var(--twilight) * 0.2)",
        }}
      />

      {/* 3 — the discs and stars */}
      <Celestial light={light} mode="soft" />

      {/* 4 — cloud field: far → near */}
      <div className="fill" style={{ opacity: "calc(0.55 + var(--cloud-opacity) * 0.45)" }}>
        {sorted.map((p) => (
          <PlateEl key={p.seed} plate={p} index={PLATES.indexOf(p)} />
        ))}
      </div>

      {/* 5 — near-horizon haze band, in front of the far cloud bank */}
      <div
        className="sky-haze-band"
        style={{
          height: "14vh",
          opacity: 0.45,
          background:
            "linear-gradient(180deg, var(--haze-out) 0%, var(--haze-mid) 70%, var(--haze-mid) 100%)",
        }}
      />
    </div>
  );
}
