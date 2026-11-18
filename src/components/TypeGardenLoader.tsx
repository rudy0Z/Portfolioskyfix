"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSkyTime } from "@/lib/useTimeOfDay";
import { paletteAt } from "@/lib/skyPalette";
import { mixOklch, oklch, type OKLCH } from "@/lib/color";

/**
 * TypeGardenLoader — the botanical glass intro.
 *
 * "RUDRAKSH" renders as nine frosted-glass glyphs (each with a real
 * backdrop-filter, so the flora behind them is literally refracted), while
 * two canvas layers grow procedural flora — translucent bluebells, alpine
 * starflowers, buds and curling tendrils, woven behind and in front of the
 * type. Every color is poured from the 24-hour sky palette at the visitor's
 * current time. When the garden takes root (~1.8s) the wordmark flies into
 * its nav slot on a FLIP trajectory while the curtain lifts, revealing the
 * living meadow hero.
 *
 * Engine lineage: the archived TypeGardenLoader (vine/curl/weave growth math,
 * spring settles, layer weaving) — re-painted from flat roses into glass
 * botanicals bound to the live sky.
 */

const SEED_WORD = "RUDRAKSH";

interface TypeGardenLoaderProps {
  /** Fired when the bloom completes and the FLIP docking flight begins. */
  onDockingStart?: () => void;
  /** Fired when the wordmark has landed and the veil is fully lifted. */
  onComplete?: () => void;
  /** Replay (flower click): ignore the once-per-session guard. */
  ignoreSession?: boolean;
}

/* ── small math (from the archived engine) ───────────────────────────────── */

const rng = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const eo = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const spr = (t: number, k = 7, w = 16) =>
  t <= 0 ? 0 : 1 - Math.exp(-t * k) * Math.cos(t * w);

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Pt = [number, number];

const vine = (
  base: Pt,
  dir: number,
  len: number,
  amp: number,
  waves: number,
  ph: number,
  bend: number,
  n = 40,
): Pt[] => {
  const P: Pt[] = [[base[0], base[1]]];
  const step = len / n;
  let x = base[0];
  let y = base[1];
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const a = dir + bend * u + amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 3);
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    P.push([x, y]);
  }
  return P;
};

const curl = (P: Pt[], sign: number, rad: number) => {
  const n = P.length;
  const e = P[n - 1];
  const a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0]);
  const c: Pt = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad];
  const a0 = Math.atan2(e[1] - c[1], e[0] - c[0]);
  for (let i = 1; i <= 14; i++) {
    const u = i / 14;
    const t = a0 + sign * u * Math.PI * 1.6;
    const rr = rad * (1 - 0.5 * u);
    P.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]);
  }
  return P;
};

const weave = (r: () => number, startLayer: number) => {
  const cuts: number[] = [];
  const nc = 1 + Math.floor(r() * 3);
  for (let i = 0; i < nc; i++) cuts.push(0.15 + r() * 0.7);
  cuts.sort((a, b) => a - b);
  const segs: { u0: number; u1: number; layer: number }[] = [];
  let u0 = 0;
  let layer = startLayer;
  for (const c of cuts) {
    if (c <= u0) continue;
    segs.push({ u0, u1: c, layer });
    u0 = c;
    layer = 1 - layer;
  }
  segs.push({ u0, u1: 1, layer });
  return segs;
};

const layerAt = (segs: { u0: number; u1: number; layer: number }[], u: number) => {
  for (const s of segs) if (u >= s.u0 && u <= s.u1) return s.layer;
  return segs[segs.length - 1].layer;
};

const at = (P: Pt[], u: number): [Pt, number] => {
  const n = P.length;
  const i = Math.min(n - 2, Math.max(1, Math.round(u * (n - 1))));
  return [P[i], Math.atan2(P[i + 1][1] - P[i - 1][1], P[i + 1][0] - P[i - 1][0])];
};

const path = (g: CanvasRenderingContext2D, p: Pt[], closed: boolean) => {
  const n = p.length;
  if (n < 2) return;
  const m = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const s = m(p[n - 1], p[0]);
    g.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const q = m(p[i], p[(i + 1) % n]);
      g.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]);
    }
    g.closePath();
  } else {
    g.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const q = m(p[i], p[i + 1]);
      g.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]);
    }
    g.lineTo(p[n - 1][0], p[n - 1][1]);
  }
};

const strokeRange = (
  g: CanvasRenderingContext2D,
  P: Pt[],
  a: number,
  b: number,
  col: string,
  w: number,
) => {
  const n = P.length - 1;
  const lerp = (t: number): Pt => {
    const i = Math.min(n - 1, Math.floor(t));
    const f = t - i;
    return [
      P[i][0] + (P[i + 1][0] - P[i][0]) * f,
      P[i][1] + (P[i + 1][1] - P[i][1]) * f,
    ];
  };
  const ia = a * n;
  const ib = b * n;
  const pts = [lerp(ia)];
  for (let i = Math.floor(ia) + 1; i < ib; i++) pts.push(P[i]);
  pts.push(lerp(ib));
  if (pts.length >= 2) {
    g.beginPath();
    path(g, pts, false);
    g.strokeStyle = col;
    g.lineWidth = w;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.stroke();
  }
};

/* ── the botanical palette — poured from the live sky ────────────────────── */

const DEEP: OKLCH = { l: 0.13, c: 0.045, h: 252 };

interface BotanicalPalette {
  veilTop: string;
  veilBot: string;
  stem: string;
  stemLit: string;
  petal: string;
  petalDeep: string;
  rim: string;
  glow: string;
  stipple: string;
}

function botanicalPalette(t: number): BotanicalPalette {
  const p = paletteAt(t);
  const day = smooth(5.6, 7.2, t) * (1 - smooth(18.3, 19.9, t));
  const golden = (1 - day) * (smooth(15.9, 17.1, t) * (1 - smooth(19.2, 20.3, t)) + smooth(5.0, 5.9, t) * (1 - smooth(6.9, 7.9, t)));
  const night = Math.max(0, 1 - day - golden);

  const w3 = (a: OKLCH, b: OKLCH, c: OKLCH): OKLCH => ({
    l: a.l * day + b.l * golden + c.l * night,
    c: a.c * day + b.c * golden + c.c * night,
    h: a.h * day + b.h * golden + c.h * night,
  });

  const petal = w3(
    { l: 0.93, c: 0.045, h: p.horizon.h },            // dewdrop white, sky-tinted
    { l: 0.86, c: 0.1, h: 62 },                        // liquid amber
    { l: 0.74, c: 0.13, h: 248 },                      // bioluminescent blue
  );
  const stem = w3(
    { l: 0.62, c: 0.11, h: 145 },                      // alpine emerald
    { l: 0.58, c: 0.1, h: 105 },
    { l: 0.52, c: 0.09, h: 205 },
  );
  const glow = w3(
    { l: 0.85, c: 0.1, h: p.sunGlow.h },
    { l: 0.84, c: 0.14, h: 66 },
    { l: 0.8, c: 0.13, h: 232 },
  );

  return {
    veilTop: oklch(mixOklch(p.zenith, DEEP, 0.78)),
    veilBot: oklch(mixOklch(p.horizon, DEEP, 0.84)),
    stem: oklch(stem),
    stemLit: oklch({ ...stem, l: Math.min(0.85, stem.l + 0.14) }),
    petal: oklch(petal),
    petalDeep: oklch({ ...petal, l: petal.l - 0.18, c: petal.c * 0.9 }),
    rim: oklch({ ...petal, l: Math.min(0.97, petal.l + 0.07), c: petal.c * 1.15 }),
    glow: oklch(glow),
    stipple: oklch({ ...petal, l: Math.min(0.95, petal.l + 0.04) }),
  };
}

/* ── the flora — three material passes: glass fill, opposing rims, glow ──── */

type FloraElement =
  | { t: "stem"; pts: Pt[]; segs: { u0: number; u1: number; layer: number }[]; d0: number; dur: number; w: number }
  | { t: "leaf"; x: number; y: number; a: number; L: number; bend: number; layer: number; d0: number }
  | { t: "bell"; x: number; y: number; R: number; rot: number; layer: number; d0: number; ph: number; seed: number }
  | { t: "star"; x: number; y: number; R: number; rot: number; layer: number; d0: number; seed: number }
  | { t: "bud"; x: number; y: number; R: number; rot: number; layer: number; d0: number };

function paintBell(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  rot: number,
  prog: number,
  C: BotanicalPalette,
  seed: number,
) {
  const s = spr(prog / 1000, 8, 13);
  if (s <= 0.001) return;
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  const T = (px: number, py: number): Pt => [x + px * cr - py * sr, y + px * sr + py * cr];

  // Bell silhouette: hangs down, scalloped mouth, translucent body.
  const N = 26;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const yy = -R * 0.92 + u * R * 1.5;
    const flare = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.18)), 0.8);
    const half = R * (0.1 + 0.52 * flare);
    left.push(T(-half, yy));
    right.push(T(half, yy));
  }
  const mouth: Pt[] = [];
  const lobes = 3;
  for (let i = 0; i <= lobes * 6; i++) {
    const u = i / (lobes * 6);
    const half = R * 0.62;
    const scallop = 1 + 0.09 * Math.cos(u * lobes * Math.PI * 2 + seed);
    mouth.push(T(-half + u * half * 2, R * 0.58 + Math.sin(u * Math.PI * lobes) * -R * 0.1 * scallop));
  }

  const body = [...left, ...mouth, ...right.slice().reverse()];
  g.beginPath();
  path(g, body, true);
  const grad = g.createLinearGradient(x, y - R, x, y + R * 0.7);
  grad.addColorStop(0, C.petal);
  grad.addColorStop(0.55, C.petalDeep);
  grad.addColorStop(1, C.petal);
  g.globalAlpha = 0.4 * s;
  g.fillStyle = grad;
  g.fill();
  g.globalAlpha = 1;

  // opposing subpixel rims — screen-blended along both edges
  g.globalCompositeOperation = "screen";
  g.lineWidth = 1.1;
  g.globalAlpha = 0.62 * s;
  strokeRange(g, left, 0.1, 0.96, C.rim, 1.1);
  g.globalAlpha = 0.34 * s;
  strokeRange(g, right, 0.1, 0.96, C.rim, 1.1);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";

  // luminous pistil glowing at the mouth
  const [gx, gy] = T(0, R * 0.18);
  const gr = g.createRadialGradient(gx, gy, 0, gx, gy, R * 0.42);
  gr.addColorStop(0, C.glow);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.globalCompositeOperation = "screen";
  g.globalAlpha = 0.5 * s;
  g.fillStyle = gr;
  g.beginPath();
  g.arc(gx, gy, R * 0.42, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
}

function paintStar(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  rot: number,
  prog: number,
  C: BotanicalPalette,
  seed: number,
) {
  const s = spr(prog / 1000, 8, 13);
  if (s <= 0.001) return;
  const r = rng(seed);
  const petals = 6;
  for (let i = 0; i < petals; i++) {
    const a = rot + (i / petals) * Math.PI * 2 + r() * 0.06;
    const L = R * (0.82 + r() * 0.3);
    const W = R * 0.2;
    const tip: Pt = [x + Math.cos(a) * L * s, y + Math.sin(a) * L * s];
    const px = -Math.sin(a);
    const py = Math.cos(a);
    const mid1: Pt = [x + Math.cos(a) * L * 0.5 * s + px * W, y + Math.sin(a) * L * 0.5 * s + py * W];
    const mid2: Pt = [x + Math.cos(a) * L * 0.5 * s - px * W, y + Math.sin(a) * L * 0.5 * s - py * W];

    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(mid1[0], mid1[1], tip[0], tip[1]);
    g.quadraticCurveTo(mid2[0], mid2[1], x, y);
    g.closePath();
    g.globalAlpha = 0.34 * s;
    g.fillStyle = C.petal;
    g.fill();

    // leading-edge rim glint
    g.globalCompositeOperation = "screen";
    g.globalAlpha = 0.5 * s;
    g.strokeStyle = C.rim;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(mid1[0], mid1[1], tip[0], tip[1]);
    g.stroke();
    g.globalCompositeOperation = "source-over";
  }

  // micro-dot stippling + luminous eye
  g.globalCompositeOperation = "screen";
  for (let i = 0; i < 7; i++) {
    const aa = r() * Math.PI * 2;
    const rr = R * (0.16 + r() * 0.3);
    g.globalAlpha = 0.5 * s;
    g.fillStyle = C.stipple;
    g.beginPath();
    g.arc(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr, 0.9, 0, Math.PI * 2);
    g.fill();
  }
  const gr = g.createRadialGradient(x, y, 0, x, y, R * 0.4);
  gr.addColorStop(0, C.glow);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.globalAlpha = 0.55 * s;
  g.fillStyle = gr;
  g.beginPath();
  g.arc(x, y, R * 0.4, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
}

function paintBud(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  rot: number,
  prog: number,
  C: BotanicalPalette,
) {
  const s = spr(prog / 1000, 8, 13);
  if (s <= 0.001) return;
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.beginPath();
  g.ellipse(0, 0, R * 0.42 * s, R * 0.9 * s, 0, 0, Math.PI * 2);
  const grad = g.createLinearGradient(0, -R, 0, R);
  grad.addColorStop(0, C.petal);
  grad.addColorStop(1, C.petalDeep);
  g.globalAlpha = 0.42 * s;
  g.fillStyle = grad;
  g.fill();
  g.globalCompositeOperation = "screen";
  g.globalAlpha = 0.5 * s;
  g.strokeStyle = C.rim;
  g.lineWidth = 1;
  g.beginPath();
  g.ellipse(0, 0, R * 0.42 * s, R * 0.9 * s, 0, -Math.PI * 0.85, Math.PI * 0.1);
  g.stroke();
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  g.restore();
}

function paintLeaf(
  g: CanvasRenderingContext2D,
  bx: number,
  by: number,
  a: number,
  L: number,
  bend: number,
  prog: number,
  C: BotanicalPalette,
) {
  if (L < 0.5) return;
  const s = spr(prog / 1000, 7, 15);
  if (s <= 0.001) return;
  const LL = L * s;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const px = -sa;
  const py = ca;
  const ax = (u: number): Pt => {
    const b = Math.sin(Math.PI * u) * bend * 0.15 * LL;
    return [bx + ca * u * LL + px * b, by + sa * u * LL + py * b];
  };
  const hw = (u: number) => LL * 0.2 * Math.sin(Math.PI * Math.pow(u, 0.8));
  const N = 12;
  const s1: Pt[] = [];
  const s2: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const c = ax(u);
    const w = hw(u);
    s1.push([c[0] + px * w, c[1] + py * w]);
    s2.push([c[0] - px * w, c[1] - py * w]);
  }
  const tip = ax(1);
  const base = ax(0);
  g.beginPath();
  path(g, [base, ...s1.slice(1, N), tip, tip, ...s2.slice(1, N).reverse(), base], true);
  const grad = g.createLinearGradient(base[0], base[1], tip[0], tip[1]);
  grad.addColorStop(0, C.petalDeep);
  grad.addColorStop(1, C.petal);
  g.globalAlpha = 0.38;
  g.fillStyle = grad;
  g.fill();
  g.globalCompositeOperation = "screen";
  g.globalAlpha = 0.55;
  g.strokeStyle = C.rim;
  g.lineWidth = 1;
  g.beginPath();
  path(g, [base, ...s1.slice(1, N)], false);
  g.stroke();
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
}

/* ── flora generation per glyph ──────────────────────────────────────────── */

interface GlyphSlot {
  cx: number;
  baseY: number;
  topY: number;
  w: number;
}

function genFlora(slot: GlyphSlot, seed: number, depthScale = 1): FloraElement[] {
  const r = rng(seed);
  const E: FloraElement[] = [];

  const growVine = (o: {
    base: Pt;
    dir: number;
    len: number;
    d0: number;
    tip?: "bell" | "star" | "bud" | "leaf" | "curl";
  }) => {
    const tip =
      o.tip ||
      (r() < 0.34 ? "bell" : r() < 0.5 ? "star" : r() < 0.72 ? "leaf" : r() < 0.86 ? "bud" : "curl");
    let P = vine(
      o.base,
      o.dir,
      o.len,
      (0.35 + r() * 0.45) * 1.1,
      1 + r() * 1.6,
      r() * 6.28,
      (r() - 0.5) * 1.2,
      40,
    );
    if (tip === "curl") P = curl(P, r() < 0.5 ? -1 : 1, 14 + r() * 16);
    const segs = weave(r, r() < 0.5 ? 0 : 1);
    const dur = Math.max(320, o.len * 6.4);
    E.push({ t: "stem", pts: P, segs, d0: o.d0, dur, w: depthScale });

    const nl = Math.floor(r() * 2.6);
    let sd = r() < 0.5 ? -1 : 1;
    for (let i = 0; i < nl; i++) {
      const u = 0.25 + r() * 0.6;
      const [q, a] = at(P, u);
      sd = -sd;
      E.push({
        t: "leaf",
        x: q[0],
        y: q[1],
        a: a + sd * (0.55 + r() * 0.5),
        L: (0.12 + r() * 0.16) * slot.w * depthScale,
        bend: (r() - 0.5) * 1.2,
        layer: layerAt(segs, u),
        d0: o.d0 + dur * u,
      });
    }

    const [tp, ta] = at(P, 1);
    const td = o.d0 + dur * 0.8;
    const tl = layerAt(segs, 1);
    const big = (0.1 + r() * 0.1) * slot.w * depthScale;
    if (tip === "bell") {
      E.push({ t: "bell", x: tp[0], y: tp[1], R: big * 1.25, rot: ta + Math.PI / 2 + (r() - 0.5) * 0.4, layer: tl, d0: td, ph: r() * 6.28, seed: Math.floor(r() * 1e9) });
    } else if (tip === "star") {
      E.push({ t: "star", x: tp[0], y: tp[1], R: big * 1.35, rot: r() * 6.28, layer: tl, d0: td, seed: Math.floor(r() * 1e9) });
    } else if (tip === "bud") {
      E.push({ t: "bud", x: tp[0], y: tp[1], R: big * 1.1, rot: ta + Math.PI / 2, layer: tl, d0: td });
    } else if (tip === "leaf") {
      E.push({ t: "leaf", x: tp[0], y: tp[1], a: ta + (r() - 0.5) * 0.3, L: big * 1.4, bend: r() - 0.5, layer: tl, d0: td });
    }
  };

  const side = r() < 0.5 ? -1 : 1;
  growVine({
    base: [slot.cx + side * slot.w * 0.22, slot.baseY + 6],
    dir: -Math.PI / 2 + (r() - 0.5) * 0.5,
    len: (slot.baseY - slot.topY) * (0.9 + r() * 0.5) * depthScale,
    d0: 60 + r() * 160,
  });
  if (r() < 0.62) {
    growVine({
      base: [slot.cx - side * slot.w * 0.3, slot.baseY + 4],
      dir: -Math.PI / 2 + (r() - 0.5) * 0.9,
      len: (slot.baseY - slot.topY) * (0.55 + r() * 0.4) * depthScale,
      d0: 180 + r() * 220,
    });
  }
  if (r() < 0.3) {
    // a descending tendril from the cap line
    growVine({
      base: [slot.cx + (r() - 0.5) * slot.w * 0.6, slot.topY - 4],
      dir: Math.PI / 2 + (r() - 0.5) * 0.7,
      len: (slot.baseY - slot.topY) * 0.4 * depthScale,
      d0: 340 + r() * 200,
    });
  }
  return E;
}

/* ── the component ───────────────────────────────────────────────────────── */

export function TypeGardenLoader({ onDockingStart, onComplete, ignoreSession = false }: TypeGardenLoaderProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);
  const t = useSkyTime();
  const palette = botanicalPalette(t);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fast = new URLSearchParams(window.location.search).has("fast");
    const seen = (() => {
      try {
        return sessionStorage.getItem("tg-bloomed") === "1";
      } catch {
        return false;
      }
    })();

    if (reduced || fast || (seen && !ignoreSession)) {
      root.dataset.intro = "off";
      document.body.classList.remove("intro-lock");
      onComplete?.();
      setFinished(true);
      return;
    }

    root.dataset.intro = "wait";
    document.body.classList.add("intro-lock");

    const back = backRef.current;
    const front = frontRef.current;
    const word = wordRef.current;
    if (!back || !front || !word) return;
    const gb = back.getContext("2d");
    const gf = front.getContext("2d");
    if (!gb || !gf) return;

    const dpr = Math.min(1.75, window.devicePixelRatio || 1);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let slots: GlyphSlot[] = [];
    let flora: FloraElement[] = [];

    const measure = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      for (const cv of [back, front]) {
        cv.width = Math.round(width * dpr);
        cv.height = Math.round(height * dpr);
      }
      // Canvas coordinates are viewport px (the context transform handles dpr).
      const spans = word.querySelectorAll<HTMLElement>("[data-ch]");
      slots = Array.from(spans).map((sp) => {
        const r = sp.getBoundingClientRect();
        return {
          cx: r.left + r.width / 2,
          baseY: r.bottom + r.height * 0.08,
          topY: r.top,
          w: r.width,
        };
      });
      flora = slots.flatMap((slot, i) => {
        const seed = (SEED_WORD.length * 31 + i * 977) | 0;
        return genFlora(slot, seed, 1);
      });
    };

    const paintLayer = (
      g: CanvasRenderingContext2D,
      layer: number,
      now: number,
    ) => {
      const C = paletteRef.current;
      for (const e of flora) {
        const isStem = e.t === "stem";
        if (isStem) {
          const st = e as Extract<FloraElement, { t: "stem" }>;
          const fr = eo((now - st.d0) / st.dur);
          if (fr <= 0) continue;
          for (const sg of st.segs) {
            if (sg.layer !== layer) continue;
            const b = Math.min(sg.u1, fr);
            if (b <= sg.u0) continue;
            strokeRange(g, st.pts, sg.u0, b, C.stem, Math.max(1, 2.1 * st.w));
            // lit highlight on the growth front
            strokeRange(g, st.pts, Math.max(sg.u0, b - 0.12), b, C.stemLit, Math.max(0.8, 1.1 * st.w));
          }
        } else if (e.layer === layer) {
          if (e.t === "leaf") {
            paintLeaf(g, e.x, e.y, e.a, e.L, e.bend, now - e.d0, C);
          } else if (e.t === "bell") {
            paintBell(g, e.x, e.y, e.R, e.rot, now - e.d0, C, e.seed);
          } else if (e.t === "star") {
            paintStar(g, e.x, e.y, e.R, e.rot, now - e.d0, C, e.seed);
          } else if (e.t === "bud") {
            paintBud(g, e.x, e.y, e.R, e.rot, now - e.d0, C);
          }
        }
      }
    };

    let raf = 0;
    const loop = (now: number) => {
      gb.setTransform(dpr, 0, 0, dpr, 0, 0);
      gf.setTransform(dpr, 0, 0, dpr, 0, 0);
      gb.clearRect(0, 0, width, height);
      gf.clearRect(0, 0, width, height);

      paintLayer(gb, 0, now);
      paintLayer(gf, 1, now);

      raf = requestAnimationFrame(loop);
    };

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    measure();

    // letter-by-letter reveal of the glass word
    const spans = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
    spans.forEach((sp, i) => {
      sp.style.transitionDelay = `${i * 85}ms`;
    });
    requestAnimationFrame(() => word.classList.add("is-grown"));

    raf = requestAnimationFrame(loop);

    // FLIP docking: fly the wordmark into its nav slot as the veil lifts.
    const dockTimer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(".site-wordmark");
      onDockingStart?.();
      if (target && word) {
        const tr = target.getBoundingClientRect();
        const wr = word.getBoundingClientRect();
        const dx = tr.left + tr.width / 2 - (wr.left + wr.width / 2);
        const dy = tr.top + tr.height / 2 - (wr.top + wr.height / 2);
        const k = tr.height / Math.max(1, wr.height);
        word.style.transition = "transform 750ms cubic-bezier(0.22,1,0.36,1), opacity 640ms ease 240ms";
        word.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${k})`;
        word.style.opacity = "0";
      }
      veilRef.current?.classList.add("is-lifting");
    }, 1850);

    const doneTimer = window.setTimeout(() => {
      document.body.classList.remove("intro-lock");
      try {
        sessionStorage.setItem("tg-bloomed", "1");
      } catch {
        /* private mode — the bloom simply replays next visit */
      }
      onComplete?.();
      // Fully unmount: the veil, both canvases and the flying word must not
      // linger in the DOM (and can freeze half-dissolved if the tab sleeps
      // mid-transition).
      setFinished(true);
    }, 1850 + 800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(dockTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("intro-lock");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (finished) return null;

  return (
    <div
      ref={veilRef}
      className="typegarden-veil"
      style={
        {
          "--tg-veil-top": palette.veilTop,
          "--tg-veil-bot": palette.veilBot,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <canvas ref={backRef} className="typegarden-canvas" />
      <div ref={wordRef} className="typegarden-word">
        {SEED_WORD.split("").map((ch, i) => (
          <span key={i} data-ch={ch}>
            {ch}
          </span>
        ))}
      </div>
      <canvas ref={frontRef} className="typegarden-canvas typegarden-canvas--front" />
    </div>
  );
}
