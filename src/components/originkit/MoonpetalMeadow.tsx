"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const ADVANCED_DEFAULTS = {
  seed: 7,
  flowerMin: 5,
  flowerMax: 10,
  packing: 100,
  indigo: "#4CDE86",
  violet: "#E74FDD",
  lilac: "#A6B8C4",
  mauve: "#6A4E78",
  dusk: "#8A84A4",
  centerColor: "#C8A060",
  inkColor: "#1A1433",
  shading: 45,
  veins: 70,
  swayPeriod: 6000,
  leafSway: 4,
  drift: 3,
  breathe: 10,
  daisies: 6,
  daisyColor: "#F4F4F6",
  clusters: 22,
  floretColor: "#2C4BF2",
  leaves: 320,
  leafColor: "#23504E",
  undergrowth: 70,
  dewDots: 60,
  fireflySize: 6,
  glowSize: 5,
  fireflyDrift: 3,
  pulseMs: 3000,
  speckle: 160,
  speckleSize: 3,
  twinkle: 70,
  hoverRadius: 22,
  hoverLean: 4,
  grain: 0,
  vignette: 0,
  hover: 100,
};

export type MoonpetalAdvanced = typeof ADVANCED_DEFAULTS;

export interface MoonpetalMeadowProps {
  speed?: number;
  scale?: number;
  density?: number;
  advanced?: Partial<MoonpetalAdvanced>;
  style?: CSSProperties;
  className?: string;
}

type RGBA = [number, number, number, number];
type Leaf = { cv: HTMLCanvasElement; ox: number; oy: number; L: number };

const TAU = Math.PI * 2;
const WHITE: RGBA = [255, 255, 255, 1];
const DEEP: RGBA = [18, 16, 48, 1];
const TONE_WEIGHTS = [0.3, 0.24, 0.16, 0.14, 0.16];
const TONE_FALLBACK: RGBA[] = [
  [75, 69, 216, 1],
  [135, 98, 181, 1],
  [166, 184, 196, 1],
  [106, 78, 120, 1],
  [138, 132, 164, 1],
];

function parseColor(s: unknown, fb: RGBA): RGBA {
  if (typeof s !== "string") return fb;
  const fn = s.match(/rgba?\(([^)]+)\)/i);
  if (fn) {
    const p = fn[1].split(/[\s,/]+/).filter(Boolean);
    const n = p.map((v) => parseFloat(v));
    if (n.length >= 3 && n.slice(0, 3).every((v) => isFinite(v))) {
      const a = n.length > 3 && isFinite(n[3]) ? n[3] : 1;
      return [n[0], n[1], n[2], Math.max(0, Math.min(1, a))];
    }
  }
  const hx = s.match(/#([0-9a-f]{3,8})\b/i);
  if (hx) {
    let h = hx[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length === 6 || h.length === 8) {
      const v = (i: number) => parseInt(h.slice(i, i + 2), 16);
      return [v(0), v(2), v(4), h.length === 8 ? v(6) / 255 : 1];
    }
  }
  return fb;
}

const mix = (a: RGBA, b: RGBA, t: number): RGBA => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
  a[3],
];
const lighten = (c: RGBA, t: number) => mix(c, WHITE, t);
const darken = (c: RGBA, t: number) => mix(c, DEEP, t);
const css = (c: RGBA, a = 1) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${Math.max(
    0,
    Math.min(1, c[3] * a)
  ).toFixed(3)})`;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

function makeFlowerSprite(
  R: number,
  base: RGBA,
  center: RGBA,
  ink: RGBA,
  shading: number,
  veins: number,
  dew: number,
  rnd: () => number
) {
  const S = Math.ceil(R * 2.16) + 4;
  const cv = makeCanvas(S, S);
  const g = cv.getContext("2d")!;
  const c = S / 2;
  const rot0 = rnd() * TAU;
  const lw = Math.max(1, R * 0.016);
  g.lineCap = "round";
  g.lineJoin = "round";

  for (const i of [0, 2, 4, 1, 3]) {
    const axis = rot0 + (i * TAU) / 5 + (rnd() - 0.5) * 0.18;
    const len = R * (0.88 + rnd() * 0.12);
    const hw = 0.72 + rnd() * 0.1;
    const k = 2 + Math.floor(rnd() * 2);
    const ph = rnd() * 2;
    const ph2 = rnd() * 6;
    const asym = (rnd() - 0.5) * 0.3;
    const tone = (rnd() - 0.5) * 0.16;
    const col = tone > 0 ? lighten(base, tone) : darken(base, -tone);
    const path = new Path2D();
    const N = 72;

    for (let j = 0; j <= N; j++) {
      const u = -1 + (2 * j) / N;
      const th = axis + u * hw;
      const shape = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.6)), 0.55) * (1 + asym * u);
      const lobes = 1 - 0.11 * Math.pow(0.5 + 0.5 * Math.cos((u * k + ph) * Math.PI), 8);
      const jag = 1 + 0.018 * Math.sin(u * 29 + ph2) + 0.01 * Math.sin(u * 63 + ph2 * 2);
      const r = len * (0.08 + 0.92 * shape) * lobes * jag;
      const px = c + Math.cos(th) * r;
      const py = c + Math.sin(th) * r;
      if (j === 0) path.moveTo(px, py);
      else path.lineTo(px, py);
    }
    path.closePath();

    const grad = g.createRadialGradient(c, c, R * 0.04, c, c, len);
    grad.addColorStop(0, css(darken(col, 0.6)));
    grad.addColorStop(0.3, css(darken(col, 0.22)));
    grad.addColorStop(0.7, css(col));
    grad.addColorStop(1, css(lighten(col, 0.12)));
    g.fillStyle = grad;
    g.fill(path);
    g.save();
    g.clip(path);

    // Inner petal shading
    g.beginPath();
    g.moveTo(c, c);
    g.arc(c, c, R * 1.2, axis - hw - 0.1, axis - 0.06 + (rnd() - 0.5) * 0.1);
    g.closePath();
    g.fillStyle = css(darken(col, 0.5), (shading / 100) * 0.5);
    g.fill();

    // Petal veins
    const nv = Math.round(8 + (veins / 100) * 14);
    g.fillStyle = css(ink, 0.25 + (veins / 100) * 0.55);
    for (let q = 0; q < nv; q++) {
      const u = (rnd() * 2 - 1) * 0.85;
      const a = axis + u * hw * 0.9;
      const r0 = R * (0.1 + rnd() * 0.1);
      const r1 = len * (0.3 + rnd() * 0.5) * (1 - 0.3 * Math.abs(u));
      const w0 = R * (0.005 + rnd() * 0.01);
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      const bx = c + Math.cos(a) * r0;
      const by = c + Math.sin(a) * r0;
      const a2 = a + u * 0.05;
      g.beginPath();
      g.moveTo(bx + nx * w0, by + ny * w0);
      g.lineTo(c + Math.cos(a2) * r1, c + Math.sin(a2) * r1);
      g.lineTo(bx - nx * w0, by - ny * w0);
      g.closePath();
      g.fill();
    }

    // Dew droplets
    const nd = Math.round((dew / 100) * 14);
    for (let d = 0; d < nd; d++) {
      const a = axis + (rnd() * 2 - 1) * hw * 0.85;
      const rr = len * (0.22 + rnd() * 0.72);
      const sz = R * (0.006 + rnd() * rnd() * 0.02);
      g.fillStyle = `rgba(255,255,255,${(0.5 + rnd() * 0.5).toFixed(3)})`;
      g.beginPath();
      g.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, sz, 0, TAU);
      g.fill();
    }

    g.restore();
    g.strokeStyle = css(ink, 0.9);
    g.lineWidth = lw;
    g.stroke(path);
  }

  // Golden stamen pollen core
  const hc = darken(base, 0.72);
  const hg = g.createRadialGradient(c, c, 0, c, c, R * 0.27);
  hg.addColorStop(0, css(hc, 0.95));
  hg.addColorStop(0.55, css(hc, 0.6));
  hg.addColorStop(1, css(hc, 0));
  g.fillStyle = hg;
  g.beginPath();
  g.arc(c, c, R * 0.27, 0, TAU);
  g.fill();

  for (let i = 0; i < 32; i++) {
    const a = rnd() * TAU;
    const rr = R * 0.1 * Math.sqrt(rnd());
    const sz = R * (0.014 + rnd() * 0.012);
    g.fillStyle = css(lighten(center, rnd() * 0.4));
    g.beginPath();
    g.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, sz, 0, TAU);
    g.fill();
  }

  return cv;
}

function makeDaisySprite(R: number, col: RGBA, center: RGBA, ink: RGBA, rnd: () => number) {
  const S = Math.ceil(R * 2.2) + 4;
  const cv = makeCanvas(S, S);
  const g = cv.getContext("2d")!;
  const c = S / 2;
  const rot = rnd() * TAU;

  for (let i = 0; i < 7; i++) {
    const axis = rot + (i * TAU) / 7 + (rnd() - 0.5) * 0.2;
    g.save();
    g.translate(c, c);
    g.rotate(axis);
    g.beginPath();
    g.ellipse(R * 0.52, 0, R * 0.47, R * 0.24, 0, 0, TAU);
    const gr = g.createLinearGradient(0, 0, R, 0);
    gr.addColorStop(0, css(darken(col, 0.2)));
    gr.addColorStop(0.5, css(col));
    gr.addColorStop(1, css(col));
    g.fillStyle = gr;
    g.fill();
    g.strokeStyle = css(ink, 0.7);
    g.lineWidth = Math.max(1, R * 0.04);
    g.stroke();
    g.restore();
  }

  const cc = mix(center, [245, 170, 60, 1], 0.6);
  g.fillStyle = css(cc);
  g.beginPath();
  g.arc(c, c, R * 0.2, 0, TAU);
  g.fill();

  for (let i = 0; i < 14; i++) {
    const a = rnd() * TAU;
    const rr = R * 0.12 * Math.sqrt(rnd());
    g.fillStyle = css(rnd() < 0.5 ? darken(cc, 0.3) : lighten(cc, 0.3));
    g.beginPath();
    g.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, R * 0.035, 0, TAU);
    g.fill();
  }
  return cv;
}

function makeFloretSprite(R: number, col: RGBA, ink: RGBA) {
  const S = Math.ceil(R * 2.4) + 2;
  const cv = makeCanvas(S, S);
  const g = cv.getContext("2d")!;
  const c = S / 2;
  for (let i = 0; i < 5; i++) {
    const a = (i * TAU) / 5 - Math.PI / 2;
    g.beginPath();
    g.arc(c + Math.cos(a) * R * 0.52, c + Math.sin(a) * R * 0.52, R * 0.48, 0, TAU);
    g.fillStyle = css(col);
    g.fill();
    g.strokeStyle = css(ink, 0.6);
    g.lineWidth = Math.max(0.5, R * 0.08);
    g.stroke();
  }
  g.beginPath();
  g.arc(c, c, R * 0.18, 0, TAU);
  g.fillStyle = css(lighten(col, 0.65));
  g.fill();
  return cv;
}

function makeLeafSprite(L: number, col: RGBA, rim: number): Leaf {
  const w = L * 0.19;
  const pad = 3;
  const cv = makeCanvas(L + pad * 2, w * 2 + pad * 2);
  const g = cv.getContext("2d")!;
  const oy = cv.height / 2;
  g.translate(pad, oy);
  const path = new Path2D();
  path.moveTo(0, 0);
  path.quadraticCurveTo(L * 0.38, -w * 1.3, L, 0);
  path.quadraticCurveTo(L * 0.38, w * 1.3, 0, 0);
  g.fillStyle = css(col);
  g.fill(path);
  g.save();
  g.clip(path);
  g.fillStyle = css(darken(col, 0.3), 0.6);
  g.fillRect(0, 0, L, w * 2);
  g.strokeStyle = css(lighten(col, 0.35), rim);
  g.lineWidth = Math.max(1, L * 0.03);
  g.stroke(path);
  g.restore();
  g.strokeStyle = css(lighten(col, 0.25), 0.1 + rim * 0.5);
  g.lineWidth = Math.max(0.8, L * 0.01);
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(L * 0.5, -w * 0.08, L * 0.95, 0);
  g.stroke();
  return { cv, ox: pad, oy, L };
}

function makeGlowSprite(R: number, col: RGBA, coreFrac: number) {
  const S = Math.ceil(R * 2) + 2;
  const cv = makeCanvas(S, S);
  const g = cv.getContext("2d")!;
  const c = S / 2;
  const cf = clamp(coreFrac, 0.05, 1);
  const gr = g.createRadialGradient(c, c, 0, c, c, R);
  gr.addColorStop(0, css(lighten(col, 0.6)));
  gr.addColorStop(cf * 0.6, css(lighten(col, 0.15)));
  gr.addColorStop(cf, css(col, 0.9));
  gr.addColorStop(Math.min(0.99, cf * 2.2), css(col, 0.3));
  gr.addColorStop(1, css(col, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);
  return cv;
}

type Flower = { x: number; y: number; r: number; v: number; a: number; ph: number; z: number };
type LeafItem = { x: number; y: number; len: number; a: number; v: number; flip: number; ph: number };
type Floret = { x: number; y: number; r: number; v: number; ph: number };
type Daisy = { x: number; y: number; r: number; a: number; ph: number };
type Speck = { x: number; y: number; r: number; a: number; per: number; ph: number; bright: boolean };
type Fly = { x: number; y: number; ax: number; ay: number; pa: number; pb: number; pp: number; s: number };
type Layout = {
  flowers: Flower[];
  under: LeafItem[];
  leaves: LeafItem[];
  florets: Floret[];
  daisies: Daisy[];
  specks: Speck[];
  flies: Fly[];
};

function pickTone(rnd: () => number) {
  let x = rnd();
  for (let i = 0; i < TONE_WEIGHTS.length; i++) {
    x -= TONE_WEIGHTS[i];
    if (x <= 0) return i;
  }
  return TONE_WEIGHTS.length - 1;
}

function buildLayout(W: number, H: number, adv: MoonpetalAdvanced): Layout {
  const rnd = mulberry32((adv.seed | 0) * 9973 + 17);
  const flowers: Flower[] = [];
  const daisies: Daisy[] = [];
  const florets: Floret[] = [];
  const leaves: LeafItem[] = [];
  const under: LeafItem[] = [];
  const specks: Speck[] = [];
  const flies: Fly[] = [];

  const flowerCount = Math.round((adv.packing / 100) * 24);
  for (let i = 0; i < flowerCount; i++) {
    const x = rnd() * W;
    const y = H * (0.45 + rnd() * 0.5);
    const r = H * (0.04 + rnd() * 0.05);
    flowers.push({
      x,
      y,
      r,
      v: pickTone(rnd),
      a: (rnd() - 0.5) * 0.4,
      ph: rnd() * TAU,
      z: y / H,
    });
  }

  for (let i = 0; i < adv.daisies; i++) {
    daisies.push({
      x: (0.1 + (i / Math.max(1, adv.daisies - 1)) * 0.8 + (rnd() - 0.5) * 0.1) * W,
      y: H * (0.65 + rnd() * 0.3),
      r: H * (0.045 + rnd() * 0.035),
      a: (rnd() - 0.5) * 0.5,
      ph: rnd() * TAU,
    });
  }

  for (let i = 0; i < adv.clusters; i++) {
    florets.push({
      x: rnd() * W,
      y: H * (0.4 + rnd() * 0.55),
      r: H * (0.012 + rnd() * 0.014),
      v: Math.floor(rnd() * 2),
      ph: rnd() * TAU,
    });
  }

  const leafCount = Math.round(adv.leaves);
  for (let i = 0; i < leafCount; i++) {
    const isUnder = i < adv.undergrowth;
    const item: LeafItem = {
      x: rnd() * W,
      y: H * (0.55 + rnd() * 0.45),
      len: H * (0.08 + rnd() * 0.16),
      a: -Math.PI / 2 + (rnd() - 0.5) * 0.8,
      v: Math.floor(rnd() * 3),
      flip: rnd() > 0.5 ? 1 : -1,
      ph: rnd() * TAU,
    };
    if (isUnder) under.push(item);
    else leaves.push(item);
  }

  for (let i = 0; i < adv.speckle; i++) {
    specks.push({
      x: rnd() * W,
      y: rnd() * H,
      r: 1 + rnd() * (adv.speckleSize || 3),
      a: rnd(),
      per: 2000 + rnd() * 3000,
      ph: rnd() * TAU,
      bright: rnd() > 0.7,
    });
  }

  const flyCount = 12;
  for (let i = 0; i < flyCount; i++) {
    flies.push({
      x: rnd() * W,
      y: H * (0.3 + rnd() * 0.6),
      ax: (rnd() - 0.5) * 30,
      ay: (rnd() - 0.5) * 20,
      pa: rnd() * TAU,
      pb: rnd() * TAU,
      pp: 2000 + rnd() * 3000,
      s: 2 + rnd() * adv.fireflySize,
    });
  }

  return { flowers, under, leaves, florets, daisies, specks, flies };
}

export function MoonpetalMeadow({
  advanced = {},
  style,
  className = "",
}: MoonpetalMeadowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const adv: MoonpetalAdvanced = { ...ADVANCED_DEFAULTS, ...advanced };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.clientWidth || 800);
    let height = (canvas.height = canvas.clientHeight || 500);
    let layout = buildLayout(width, height, adv);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth || 800;
      height = canvas.height = canvas.clientHeight || 500;
      // Positions are absolute pixels, so re-lay out for the new size.
      layout = buildLayout(width, height, adv);
    };
    window.addEventListener("resize", onResize);

    // Skip drawing while scrolled out of view.
    let onScreen = true;
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
    });
    io.observe(canvas);

    const rnd = mulberry32(adv.seed);
    const centerC = parseColor(adv.centerColor, [200, 160, 96, 1]);
    const inkC = parseColor(adv.inkColor, [26, 20, 51, 1]);
    const daisyC = parseColor(adv.daisyColor, [244, 244, 246, 1]);
    const leafC = parseColor(adv.leafColor, [35, 80, 78, 1]);
    const floretC = parseColor(adv.floretColor, [44, 75, 242, 1]);

    const flowerTones: RGBA[] = [
      parseColor(adv.indigo, TONE_FALLBACK[0]),
      parseColor(adv.violet, TONE_FALLBACK[1]),
      parseColor(adv.lilac, TONE_FALLBACK[2]),
      parseColor(adv.mauve, TONE_FALLBACK[3]),
      parseColor(adv.dusk, TONE_FALLBACK[4]),
    ];

    // Bake Sprites
    const flowerSprites = flowerTones.map((tone) =>
      makeFlowerSprite(48, tone, centerC, inkC, adv.shading, adv.veins, adv.dewDots, rnd)
    );
    const daisySprite = makeDaisySprite(44, daisyC, centerC, inkC, rnd);
    const floretSprite = makeFloretSprite(14, floretC, inkC);
    const leafSprites = [
      makeLeafSprite(70, leafC, 0.4),
      makeLeafSprite(90, lighten(leafC, 0.15), 0.5),
      makeLeafSprite(110, darken(leafC, 0.2), 0.3),
    ];
    const glowSprite = makeGlowSprite(24, [255, 230, 140, 1], 0.3);

    let mouseX = width / 2;
    let mouseY = height / 2;
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const render = (timeMs: number) => {
      if (!onScreen) {
        animId = requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const swayAngle =
        Math.sin((timeMs / adv.swayPeriod) * TAU) * ((adv.leafSway * Math.PI) / 180);

      // 1. Draw Undergrowth Leaves
      for (const item of layout.under) {
        const lf = leafSprites[item.v % leafSprites.length];
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.a + swayAngle * 0.6);
        ctx.scale(1, item.flip);
        ctx.drawImage(lf.cv, -lf.ox, -lf.oy);
        ctx.restore();
      }

      // 2. Draw Foreground Leaves
      for (const item of layout.leaves) {
        const lf = leafSprites[item.v % leafSprites.length];
        const dist = Math.hypot(item.x - mouseX, item.y - mouseY);
        const hoverForce = dist < 120 ? (1 - dist / 120) * 0.2 : 0;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.a + swayAngle + hoverForce);
        ctx.scale(1, item.flip);
        ctx.drawImage(lf.cv, -lf.ox, -lf.oy);
        ctx.restore();
      }

      // 3. Draw Daisies
      for (const daisy of layout.daisies) {
        ctx.save();
        ctx.translate(daisy.x, daisy.y);
        ctx.rotate(daisy.a + swayAngle * 0.8);
        ctx.drawImage(daisySprite, -daisySprite.width / 2, -daisySprite.height / 2);
        ctx.restore();
      }

      // 4. Draw Main Flowers
      for (const flower of layout.flowers) {
        const spr = flowerSprites[flower.v % flowerSprites.length];
        ctx.save();
        ctx.translate(flower.x, flower.y);
        ctx.rotate(flower.a + swayAngle);
        ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
        ctx.restore();
      }

      // 5. Draw Florets
      for (const floret of layout.florets) {
        ctx.save();
        ctx.translate(floret.x, floret.y);
        ctx.drawImage(floretSprite, -floretSprite.width / 2, -floretSprite.height / 2);
        ctx.restore();
      }

      // 6. Draw Fireflies
      for (const fly of layout.flies) {
        const fx = fly.x + Math.sin(timeMs / fly.pp + fly.pa) * fly.ax;
        const fy = fly.y + Math.cos(timeMs / fly.pp + fly.pb) * fly.ay;
        const pulse = 0.4 + 0.6 * Math.sin(timeMs / 400 + fly.pa);
        ctx.save();
        ctx.globalAlpha = Math.max(0, pulse);
        ctx.drawImage(glowSprite, fx - 12, fy - 12, 24, 24);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", onResize);
      io.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [adv.seed]);

  return (
    <div className={`moonpetal-meadow-wrap relative w-full h-full ${className}`} style={style}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default MoonpetalMeadow;
