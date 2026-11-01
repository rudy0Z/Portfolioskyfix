"use client";

/**
 * Island — a wide prairie knoll that becomes a floating plateau.
 *
 * At rest the hero shows only the crest: a broad, low ridge running past both
 * edges of the viewport, sitting in the bottom third. No cone, no bowl.
 *
 * As you scroll, the camera pulls down and the mass beneath is revealed:
 * organic crags (asymmetric, eroded), roots, and horizontal strata, with the
 * bottom dissolving into atmospheric mist rather than ending in an edge.
 *
 * The figure and props are NOT drawn here — they arrive through the
 * `hero-art` slot in Hero.tsx.
 */

import { useMemo } from "react";

const VB_W = 1600;
const VB_H = 700;
/** Y of the crest where it meets the sky. */
const CREST_Y = 430;
/** Where the rock begins to lose itself in mist. */
const FADE_FROM = 575;
const FADE_TO = 700;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Crest: a long, gentle ridge, deliberately not centred or symmetric. */
function crest() {
  const rand = rng(90210);
  const pts: { x: number; y: number }[] = [];
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = -120 + u * (VB_W + 240);
    // two low swells at different positions so the skyline is never a dome
    const s1 = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.05) / 0.55))) ** 0.7 * 22;
    const s2 = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.42) / 0.5))) ** 0.8 * 12;
    const wob = Math.sin(u * 11 + 0.6) * 4 + (rand() - 0.5) * 3;
    pts.push({ x, y: CREST_Y - s1 - s2 + wob });
  }
  return pts;
}

/**
 * The mass below the crest. Left and right edges are shaped differently (the
 * right side is more eroded), and the bottom edge is ragged so the silhouette
 * never reads as geometric.
 */
function bodyPath(pts: { x: number; y: number }[]) {
  const right = VB_W + 120;
  const left = -120;

  // right flank: steps out then in, then falls
  const rightEdge = `C ${right - 40} ${CREST_Y + 70}, ${right - 130} ${CREST_Y + 110}, ${right - 190} ${CREST_Y + 160} ` +
    `C ${right - 250} ${CREST_Y + 215}, ${right - 300} ${CREST_Y + 250}, ${right - 330} ${CREST_Y + 300} `;

  // bottom: ragged, with two crag notches
  // Curved crags of differing size — erosion, not a sawtooth.
  const bottom =
    `C ${right - 380} ${FADE_TO - 6}, ${right - 420} ${FADE_TO - 64}, ${right - 470} ${FADE_TO - 52} ` +
    `C ${right - 520} ${FADE_TO - 40}, ${right - 540} ${FADE_TO + 6}, ${right - 600} ${FADE_TO - 22} ` +
    `C ${1020} ${FADE_TO - 62}, ${980} ${FADE_TO - 18}, ${930} ${FADE_TO - 40} ` +
    `C ${860} ${FADE_TO - 70}, ${820} ${FADE_TO - 10}, ${760} ${FADE_TO - 46} ` +
    `C ${700} ${FADE_TO - 80}, ${660} ${FADE_TO - 24}, ${600} ${FADE_TO - 54} ` +
    `C ${540} ${FADE_TO - 84}, ${500} ${FADE_TO - 30}, ${440} ${FADE_TO - 52} ` +
    `C ${360} ${FADE_TO - 84}, ${330} ${FADE_TO - 16}, ${260} ${FADE_TO - 38} ` +
    `C ${180} ${FADE_TO - 62}, ${140} ${FADE_TO - 8}, ${60} ${FADE_TO - 30} `;

  // left flank: smoother, taller
  const leftEdge = `L ${left + 210} ${CREST_Y + 290} ` +
    `C ${left + 150} ${CREST_Y + 240}, ${left + 90} ${CREST_Y + 190}, ${left + 60} ${CREST_Y + 120} ` +
    `C ${left + 40} ${CREST_Y + 80}, ${left + 20} ${CREST_Y + 40}, ${left} ${CREST_Y + 8} `;

  return (
    `M ${left} ${CREST_Y + 8} ` +
    `L ${pts.map((p) => `${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(" L ")} ` +
    `L ${right} ${CREST_Y + 8} ` +
    rightEdge +
    bottom +
    leftEdge +
    " Z"
  );
}

function strata() {
  const rand = rng(777);
  const bands: { d: string; tone: string; op: number }[] = [];
  const tones = [
    "var(--land-under-top)",
    "var(--land-under-mid)",
    "var(--land-under-end)",
    "var(--land-under-top)",
    "var(--land-under-mid)",
  ];
  let y = CREST_Y + 34;
  for (let i = 0; i < 7; i++) {
    const thickness = 14 + rand() * 26;
    const pts: string[] = [];
    const steps = 14;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const x = -60 + u * (VB_W + 120);
      // bands dip and rise slowly; amplitude grows with depth
      const ampl = 4 + i * 2.2;
      const yy = y + Math.sin(u * 4.2 + i * 1.7) * ampl + Math.sin(u * 9.1 + i) * ampl * 0.4;
      pts.push(`${x.toFixed(0)} ${yy.toFixed(0)}`);
    }
    bands.push({
      d: `M -60 ${y - 60} L ${pts.join(" L ")} L ${VB_W + 60} ${y - 60} Z`,
      tone: tones[i % tones.length],
      op: 0.4 + (i % 3) * 0.2,
    });
    y += thickness + 18;
  }
  return bands;
}

function roots() {
  const rand = rng(5150);
  const out: { d: string; w: number }[] = [];
  for (let i = 0; i < 26; i++) {
    const x = 80 + rand() * (VB_W - 160);
    const y = CREST_Y + 18 + rand() * 40;
    const len = 18 + rand() * 54;
    const bend = (rand() - 0.5) * 40;
    out.push({
      d: `M ${x} ${y} C ${x + bend * 0.4} ${y + len * 0.4}, ${x - bend * 0.3} ${y + len * 0.7}, ${x + bend * 0.2} ${y + len}`,
      w: 0.7 + rand() * 1.5,
    });
  }
  return out;
}

export function Island({ className = "" }: { className?: string }) {
  const c = useMemo(crest, []);
  const body = useMemo(() => bodyPath(c), [c]);
  const bands = useMemo(strata, []);
  const rootSet = useMemo(roots, []);

  const crestLine = `M ${c.map((p) => `${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(" L ")}`;

  return (
    <div className={`island ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" className="island-svg">
        <defs>
          {/* turf: light at the crest, darkening as it turns under */}
          <linearGradient id="knoll-turf" x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stopColor="var(--land-light)" />
            <stop offset="48%" stopColor="var(--land-mid)" />
            <stop offset="100%" stopColor="var(--land-dark)" />
          </linearGradient>

          {/* rock face */}
          <linearGradient id="knoll-rock" x1="0" y1="0" x2="0.1" y2="1">
            <stop offset="0%" stopColor="var(--land-under-top)" />
            <stop offset="45%" stopColor="var(--land-under-mid)" />
            <stop offset="100%" stopColor="var(--land-under-end)" />
          </linearGradient>

          {/* the base dissolves into mist: opacity falls with depth, and the
              dissolve is uneven so there's no flat cut */}
          <linearGradient
            id="knoll-fade"
            x1="0"
            y1={FADE_FROM}
            x2="0"
            y2={VB_H}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="knoll-mask">
            <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#knoll-fade)" />
          </mask>

          <filter id="knoll-edge" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter id="knoll-mist" x="-20%" y="-60%" width="140%" height="240%">
            <feGaussianBlur stdDeviation="26" />
          </filter>

          <clipPath id="knoll-clip">
            <path d={body} />
          </clipPath>
        </defs>

        {/* ── rock mass with strata, clipped and dissolved ───────────── */}
        <g data-slot="underside" mask="url(#knoll-mask)">
          <path d={body} fill="url(#knoll-rock)" filter="url(#knoll-edge)" />
          <g clipPath="url(#knoll-clip)">
            {bands.map((b, i) => (
              <path key={i} d={b.d} fill={b.tone} opacity={b.op} />
            ))}
            {/* eroded crag shading on the flanks */}
            <g stroke="var(--land-under-end)" strokeWidth="1" fill="none" opacity="0.22">
              <path d={`M 210 ${CREST_Y + 60} C 250 ${CREST_Y + 160}, 230 ${CREST_Y + 260}, 300 ${CREST_Y + 340}`} />
              <path d={`M 1370 ${CREST_Y + 50} C 1330 ${CREST_Y + 140}, 1360 ${CREST_Y + 230}, 1300 ${CREST_Y + 320}`} />
              <path d={`M 760 ${CREST_Y + 40} C 780 ${CREST_Y + 130}, 740 ${CREST_Y + 210}, 780 ${CREST_Y + 300}`} />
            </g>
            {/* roots hanging from the turf line */}
            {rootSet.map((r, i) => (
              <path
                key={`r${i}`}
                d={r.d}
                stroke="var(--land-dark)"
                strokeWidth={r.w}
                strokeLinecap="round"
                fill="none"
                opacity={0.5 + (i % 3) * 0.14}
              />
            ))}
          </g>
        </g>

        {/* ── turf crest ─────────────────────────────────────────────── */}
        <g data-slot="surface">
          {/* turf: a deep falloff from the crest, not a flat band */}
          <path
            d={`${crestLine} L ${VB_W + 120} ${CREST_Y + 78} L -120 ${CREST_Y + 78} Z`}
            fill="url(#knoll-turf)"
            opacity="0.96"
          />
          {/* the turf's front edge melts into the rock face */}
          <path
            d={`M -120 ${CREST_Y + 78} L ${VB_W + 120} ${CREST_Y + 78} L ${VB_W + 120} ${CREST_Y + 96} L -120 ${CREST_Y + 96} Z`}
            fill="var(--land-dark)"
            opacity="0.25"
          />
          {/* sun-facing rim highlight along the top edge */}
          <path
            d={crestLine}
            stroke="var(--land-rim)"
            strokeWidth="1.2"
            fill="none"
            opacity="calc(0.4 + var(--golden) * 0.6)"
          />
        </g>

        {/* ── mist at the dissolve line ──────────────────────────────── */}
        <g data-slot="mist" filter="url(#knoll-mist)" className="island-mist">
          <ellipse cx="300" cy={FADE_FROM + 70} rx="380" ry="30" fill="var(--mist)" opacity="0.3" />
          <ellipse cx="1180" cy={FADE_FROM + 90} rx="420" ry="34" fill="var(--mist)" opacity="0.26" />
          <ellipse cx="760" cy={FADE_FROM + 130} rx="520" ry="40" fill="var(--mist)" opacity="0.22" />
        </g>
      </svg>
    </div>
  );
}
