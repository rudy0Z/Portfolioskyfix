/**
 * BotanicalWordmarkEngine — unified living flora renderer shared by the
 * first-visit typed loader and the monumental editorial footer.
 *
 * Adapts Akshat Agarwal's vine-weaving, curling tendrils, and 6 choreography
 * presets (`breathe`, `growWither`, `scatter`, `reach`, `visitor`, `gust`),
 * replacing flat roses with Sky Field's 4-species meadow flowers:
 *   1. Violet lupine spire
 *   2. Soft pink cosmos
 *   3. Golden-amber California poppy
 *   4. Crisp white meadow daisy
 *
 * Renders across two stacked Canvas2D layers (layer 0 = behind typography,
 * layer 1 = weaving over typography) with gentle ambient breath/gust and
 * spring-damped pointer sway.
 */

export const WORDMARK_PRESETS = [
  "breathe",
  "growWither",
  "scatter",
  "reach",
  "visitor",
  "gust",
] as const;

export type WordmarkPreset = (typeof WORDMARK_PRESETS)[number];

export function pickRandomWordmarkPreset(seed?: number): WordmarkPreset {
  const n = WORDMARK_PRESETS.length;
  if (typeof seed === "number" && Number.isFinite(seed)) {
    const idx = Math.abs(Math.floor(seed)) % n;
    return WORDMARK_PRESETS[idx];
  }
  return WORDMARK_PRESETS[Math.floor(Math.random() * n) % n];
}

export type MeadowSpecies = "lupine" | "cosmos" | "poppy" | "daisy";
const SPECIES: readonly MeadowSpecies[] = ["lupine", "cosmos", "poppy", "daisy"];

export interface GlyphSlot {
  cx: number;
  baseY: number;
  topY: number;
  w: number;
  h: number;
  /** Relative ms offset when this glyph's flora may start growing (used by typed loader). */
  delayMs?: number;
}

export interface BotanicalPointer {
  x: number;
  y: number;
  active: boolean;
}

type Pt = [number, number];

interface WeaveSeg {
  u0: number;
  u1: number;
  layer: 0 | 1;
}

interface StemNode {
  pts: Pt[];
  segs: WeaveSeg[];
  d0: number;
  dur: number;
  w: number;
  phase: number;
  anchor: Pt;
  cycleOffset: number;
}

interface LeafNode {
  stemIdx: number;
  u: number;
  baseA: number;
  L: number;
  bend: number;
  layer: 0 | 1;
  d0: number;
  phase: number;
}

interface BloomNode {
  stemIdx: number;
  u: number;
  species: MeadowSpecies;
  R: number;
  baseRot: number;
  layer: 0 | 1;
  d0: number;
  phase: number;
  seed: number;
  isBud: boolean;
  nod: number;
}

interface DriftPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  r: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface WordmarkGarden {
  stems: StemNode[];
  leaves: LeafNode[];
  blooms: BloomNode[];
  petals: DriftPetal[];
  preset: WordmarkPreset;
  width: number;
  height: number;
  /** Smoothed sway value per stem for spring-like pointer & gust deflection. */
  sway: Float32Array;
  swayVel: Float32Array;
  lastPetalAt: number;
  visitorIdx: number;
  visitorNextAt: number;
  visitorPos: Pt;
}

/* ── deterministic PRNG & math ──────────────────────────────────────────── */

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutCubic = (x: number) =>
  x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);

const springPop = (sec: number, k = 7.4, w = 13.5) =>
  sec <= 0 ? 0 : Math.max(0, 1 - Math.exp(-sec * k) * Math.cos(sec * w));

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function makeVine(
  base: Pt,
  dir: number,
  len: number,
  amp: number,
  waves: number,
  ph: number,
  bend: number,
  n = 34,
): Pt[] {
  const P: Pt[] = [[base[0], base[1]]];
  const step = len / n;
  let x = base[0];
  let y = base[1];
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const a =
      dir +
      bend * u +
      amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 2.8);
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    P.push([x, y]);
  }
  return P;
}

function addCurl(P: Pt[], sign: number, rad: number): Pt[] {
  const n = P.length;
  if (n < 2) return P;
  const e = P[n - 1];
  const a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0]);
  const c: Pt = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad];
  const a0 = Math.atan2(e[1] - c[1], e[0] - c[0]);
  for (let i = 1; i <= 12; i++) {
    const u = i / 12;
    const t = a0 + sign * u * Math.PI * 1.55;
    const rr = rad * (1 - 0.52 * u);
    P.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]);
  }
  return P;
}

function makeWeave(r: () => number, startLayer: 0 | 1): WeaveSeg[] {
  const cuts: number[] = [];
  const nc = 1 + Math.floor(r() * 2.5);
  for (let i = 0; i < nc; i++) cuts.push(0.18 + r() * 0.68);
  cuts.sort((a, b) => a - b);
  const segs: WeaveSeg[] = [];
  let u0 = 0;
  let layer: 0 | 1 = startLayer;
  for (const c of cuts) {
    if (c <= u0 + 0.04) continue;
    segs.push({ u0, u1: c, layer });
    u0 = c;
    layer = layer === 0 ? 1 : 0;
  }
  segs.push({ u0, u1: 1, layer });
  return segs;
}

function layerAt(segs: WeaveSeg[], u: number): 0 | 1 {
  for (const s of segs) {
    if (u >= s.u0 && u <= s.u1) return s.layer;
  }
  return segs[segs.length - 1].layer;
}

function samplePts(P: Pt[], u: number): [Pt, number] {
  const n = P.length;
  const f = clamp(u, 0, 1) * (n - 1);
  const i = Math.min(n - 2, Math.max(0, Math.floor(f)));
  const frac = f - i;
  const x = P[i][0] + (P[i + 1][0] - P[i][0]) * frac;
  const y = P[i][1] + (P[i + 1][1] - P[i][1]) * frac;
  const prev = P[Math.max(0, i - 1)];
  const next = P[Math.min(n - 1, i + 1)];
  return [[x, y], Math.atan2(next[1] - prev[1], next[0] - prev[0])];
}

function displacePt(pt: Pt, anchor: Pt, u: number, swayRad: number): Pt {
  const dx = pt[0] - anchor[0];
  const dy = pt[1] - anchor[1];
  const theta = swayRad * u * u;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [anchor[0] + dx * c - dy * s, anchor[1] + dx * s + dy * c];
}

function smoothPath(g: CanvasRenderingContext2D, p: Pt[], closed: boolean) {
  const n = p.length;
  if (n < 2) return;
  if (closed) {
    const sx = (p[n - 1][0] + p[0][0]) / 2;
    const sy = (p[n - 1][1] + p[0][1]) / 2;
    g.moveTo(sx, sy);
    for (let i = 0; i < n; i++) {
      const next = p[(i + 1) % n];
      g.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + next[0]) / 2, (p[i][1] + next[1]) / 2);
    }
    g.closePath();
  } else {
    g.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < n - 1; i++) {
      g.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
    }
    g.lineTo(p[n - 1][0], p[n - 1][1]);
  }
}

/* ── build garden geometry around measured glyph slots ─────────────────── */

export function buildWordmarkGarden(
  slots: GlyphSlot[],
  width: number,
  height: number,
  options: {
    seed?: number;
    preset?: WordmarkPreset;
    density?: "loader" | "footer";
  } = {},
): WordmarkGarden {
  const seed = options.seed ?? 20261112;
  const preset = options.preset ?? pickRandomWordmarkPreset();
  const density = options.density ?? "footer";
  const r = mulberry32(seed);

  const stems: StemNode[] = [];
  const leaves: LeafNode[] = [];
  const blooms: BloomNode[] = [];

  // Ensure balanced representation of all 4 meadow species across the wordmark
  let speciesCursor = Math.floor(r() * SPECIES.length);

  slots.forEach((slot, idx) => {
    const baseDelay = slot.delayMs ?? idx * 75;
    const h = Math.max(40, slot.h || slot.baseY - slot.topY);
    const scale = clamp(h / 115, 0.52, 1.48);

    const addVine = (cfg: {
      base: Pt;
      dir: number;
      len: number;
      d0: number;
      species: MeadowSpecies;
      hasBloom: boolean;
      isBud?: boolean;
      isCurl?: boolean;
      sizeMul?: number;
    }) => {
      let pts = makeVine(
        cfg.base,
        cfg.dir,
        cfg.len,
        0.3 + r() * 0.42,
        1.0 + r() * 1.4,
        r() * Math.PI * 2,
        (r() - 0.5) * 1.1,
        32,
      );
      if (cfg.isCurl) {
        pts = addCurl(pts, r() < 0.5 ? -1 : 1, (9 + r() * 11) * scale);
      }
      const segs = makeWeave(r, (idx + stems.length) % 2 === 0 ? 0 : 1);
      const dur = Math.max(360, cfg.len * (density === "loader" ? 4.8 : 6.2));
      const stemIdx = stems.length;

      stems.push({
        pts,
        segs,
        d0: cfg.d0,
        dur,
        w: (1.55 + r() * 0.65) * scale,
        phase: r() * Math.PI * 2,
        anchor: [cfg.base[0], cfg.base[1]],
        cycleOffset: r() * Math.PI * 2,
      });

      // 2-3 tapered leaves per vine
      const leafCount = density === "footer" ? 2 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2);
      let side = r() < 0.5 ? -1 : 1;
      for (let li = 0; li < leafCount; li++) {
        const u = 0.24 + (li / Math.max(1, leafCount)) * 0.52 + r() * 0.08;
        const [, ang] = samplePts(pts, u);
        side = -side;
        leaves.push({
          stemIdx,
          u: clamp(u, 0.18, 0.86),
          baseA: ang + side * (0.58 + r() * 0.44),
          L: (14 + r() * 10) * scale,
          bend: (r() - 0.5) * 1.1,
          layer: layerAt(segs, u),
          d0: cfg.d0 + dur * u * 0.9,
          phase: r() * Math.PI * 2,
        });
      }

      if (cfg.hasBloom) {
        const [, tipAng] = samplePts(pts, 0.98);
        blooms.push({
          stemIdx,
          u: 0.98,
          species: cfg.species,
          R: (12.5 + r() * 6.5) * scale * (cfg.sizeMul ?? 1),
          baseRot: tipAng + Math.PI / 2 + (r() - 0.5) * 0.35,
          layer: layerAt(segs, 0.98),
          d0: cfg.d0 + dur * 0.78,
          phase: r() * Math.PI * 2,
          seed: Math.floor(r() * 1e9),
          isBud: Boolean(cfg.isBud),
          nod: 0,
        });
      }
    };

    // Primary upward vine weaving through the glyph
    const side = idx % 2 === 0 ? -1 : 1;
    const primarySpecies = SPECIES[speciesCursor++ % SPECIES.length];
    addVine({
      base: [slot.cx + side * slot.w * 0.2, slot.baseY + 2],
      dir: -Math.PI / 2 + (r() - 0.5) * 0.48,
      len: h * (0.86 + r() * 0.44),
      d0: baseDelay + 40 + r() * 80,
      species: primarySpecies,
      hasBloom: true,
      sizeMul: idx === 0 || idx === slots.length - 1 ? 1.1 : 1.0,
    });

    // Secondary companion vine or curling tendril
    if (r() < 0.78 || density === "footer") {
      const secondaryIsCurl = r() < 0.32;
      const secondarySpecies = SPECIES[speciesCursor++ % SPECIES.length];
      addVine({
        base: [slot.cx - side * slot.w * 0.24, slot.baseY - h * (0.05 + r() * 0.18)],
        dir: -Math.PI / 2 + (r() - 0.5) * 0.95,
        len: h * (0.52 + r() * 0.36),
        d0: baseDelay + 140 + r() * 130,
        species: secondarySpecies,
        hasBloom: !secondaryIsCurl,
        isBud: !secondaryIsCurl && r() < 0.28,
        isCurl: secondaryIsCurl,
        sizeMul: 0.84,
      });
    }

    // Bookend outward tendrils on first and last glyph (signature serif flourish)
    if (idx === 0 || idx === slots.length - 1) {
      const outward = idx === 0 ? -1 : 1;
      addVine({
        base: [slot.cx + outward * slot.w * 0.4, slot.baseY - h * 0.25],
        dir: outward < 0 ? Math.PI + 0.18 : -0.18,
        len: h * (0.58 + r() * 0.22),
        d0: baseDelay + 220,
        species: SPECIES[speciesCursor++ % SPECIES.length],
        hasBloom: false,
        isCurl: true,
      });
    }
  });

  const firstBloom = blooms[0];
  const initialVisitor: Pt = firstBloom
    ? samplePts(stems[firstBloom.stemIdx].pts, firstBloom.u)[0]
    : [width / 2, height / 2];

  return {
    stems,
    leaves,
    blooms,
    petals: [],
    preset,
    width,
    height,
    sway: new Float32Array(stems.length),
    swayVel: new Float32Array(stems.length),
    lastPetalAt: 0,
    visitorIdx: 0,
    visitorNextAt: 2200,
    visitorPos: initialVisitor,
  };
}

/* ── 4-Species Portfolio Meadow Flower Painters ─────────────────────────── */

function paintLeaf(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  L: number,
  bend: number,
  scale: number,
  isNight: boolean,
) {
  if (scale <= 0.02 || L < 1) return;
  const LL = L * scale;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const px = -sa;
  const py = ca;

  const axis = (u: number): Pt => {
    const b = Math.sin(Math.PI * u) * bend * 0.18 * LL;
    return [x + ca * u * LL + px * b, y + sa * u * LL + py * b];
  };

  const N = 8;
  const s1: Pt[] = [];
  const s2: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const c = axis(u);
    const hw = LL * 0.23 * Math.sin(Math.PI * Math.pow(u, 0.78));
    s1.push([c[0] + px * hw, c[1] + py * hw]);
    s2.push([c[0] - px * hw, c[1] - py * hw]);
  }
  const base = axis(0);
  const tip = axis(1);

  g.beginPath();
  smoothPath(g, [base, ...s1.slice(1, N), tip, ...s2.slice(1, N).reverse()], true);
  const grad = g.createLinearGradient(base[0], base[1], tip[0], tip[1]);
  if (isNight) {
    grad.addColorStop(0, "#1c5646");
    grad.addColorStop(1, "#3f9c78");
  } else {
    grad.addColorStop(0, "#1b6b42");
    grad.addColorStop(1, "#3ba363");
  }
  g.fillStyle = grad;
  g.fill();

  // Subtle central vein
  g.strokeStyle = isNight ? "rgba(148, 226, 192, 0.35)" : "rgba(218, 248, 224, 0.42)";
  g.lineWidth = 0.7;
  g.beginPath();
  g.moveTo(base[0], base[1]);
  g.lineTo(tip[0], tip[1]);
  g.stroke();
}

function paintMeadowBloom(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  species: MeadowSpecies,
  rot: number,
  scale: number,
  isNight: boolean,
  isBud: boolean,
) {
  if (scale <= 0.02 || r <= 0.8) return;
  const R = r * scale;

  g.save();
  g.translate(x, y);
  g.rotate(rot);

  if (isBud) {
    // Tapered meadow bud wrapped in emerald sepals
    g.fillStyle = isNight ? "#24664e" : "#1f7a49";
    g.beginPath();
    g.ellipse(0, R * 0.16, R * 0.34, R * 0.56, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle =
      species === "lupine"
        ? "#9b87f5"
        : species === "cosmos"
          ? "#f472b6"
          : species === "poppy"
            ? "#fb923c"
            : "#f8fafc";
    g.beginPath();
    g.ellipse(0, -R * 0.24, R * 0.26, R * 0.44, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    return;
  }

  // Soft night luminescence strictly when dark theme is active
  if (isNight) {
    const haloCol =
      species === "lupine"
        ? "rgba(150, 140, 255, 0.22)"
        : species === "cosmos"
          ? "rgba(244, 132, 186, 0.2)"
          : species === "poppy"
            ? "rgba(251, 168, 76, 0.22)"
            : "rgba(220, 234, 255, 0.18)";
    const hr = R * 1.9;
    const halo = g.createRadialGradient(0, 0, 0, 0, 0, hr);
    halo.addColorStop(0, haloCol);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = halo;
    g.beginPath();
    g.arc(0, 0, hr, 0, Math.PI * 2);
    g.fill();
  }

  if (species === "lupine") {
    // Tiered conical violet lupine spire matching our meadow
    const tiers = 5;
    for (let t = 0; t < tiers; t++) {
      const u = t / (tiers - 1);
      const fy = R * 0.58 - u * R * 1.85;
      const spread = R * (0.46 * (1 - u * 0.65) + 0.08);
      const cA = isNight ? "#a5b4fc" : "#8b73f2";
      const cB = isNight ? "#818cf8" : "#6c52d9";
      for (const s of [-1, 0, 1]) {
        if (u > 0.72 && s !== 0) continue;
        g.fillStyle = s === 0 ? cA : cB;
        g.beginPath();
        g.ellipse(
          s * spread * 0.68,
          fy,
          R * (0.28 - u * 0.08),
          R * (0.21 - u * 0.05),
          s * 0.28,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    }
    // Delicate pale lavender crown tip
    g.fillStyle = isNight ? "#e0e7ff" : "#ddd6fe";
    g.beginPath();
    g.arc(0, -R * 1.38, R * 0.17, 0, Math.PI * 2);
    g.fill();
  } else if (species === "cosmos") {
    // 8-petal painterly rose-pink cosmos with notched feel and warm golden disc
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      g.save();
      g.rotate(a);
      const pg = g.createLinearGradient(0, -R * 0.1, 0, -R * 1.05);
      if (isNight) {
        pg.addColorStop(0, "#db2777");
        pg.addColorStop(0.55, "#f472b6");
        pg.addColorStop(1, "#fbcfe8");
      } else {
        pg.addColorStop(0, "#e11d74");
        pg.addColorStop(0.5, "#f472b6");
        pg.addColorStop(1, "#fce7f3");
      }
      g.fillStyle = pg;
      g.beginPath();
      g.ellipse(0, -R * 0.56, R * 0.25, R * 0.46, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    // Golden pollen center + warm ring
    g.fillStyle = "#d97706";
    g.beginPath();
    g.arc(0, 0, R * 0.27, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fde047";
    g.beginPath();
    g.arc(-R * 0.04, -R * 0.04, R * 0.18, 0, Math.PI * 2);
    g.fill();
  } else if (species === "poppy") {
    // 5-petal luminous golden-orange California poppy cup
    const petals = 5;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
      g.save();
      g.rotate(a);
      const pg = g.createLinearGradient(0, 0, 0, -R);
      pg.addColorStop(0, "#c2410c");
      pg.addColorStop(0.45, "#f97316");
      pg.addColorStop(1, "#fcd34d");
      g.fillStyle = pg;
      g.beginPath();
      g.ellipse(0, -R * 0.46, R * 0.4, R * 0.46, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    g.fillStyle = "#451a03";
    g.beginPath();
    g.arc(0, 0, R * 0.18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f59e0b";
    g.beginPath();
    g.arc(0, 0, R * 0.09, 0, Math.PI * 2);
    g.fill();
  } else {
    // 12-petal crisp white meadow daisy with delicate shadow rim & honey disc
    const petals = 12;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      g.save();
      g.rotate(a);
      const pg = g.createLinearGradient(0, -R * 0.15, 0, -R * 1.05);
      pg.addColorStop(0, isNight ? "#cbd5e1" : "#e2e8f0");
      pg.addColorStop(0.4, "#ffffff");
      pg.addColorStop(1, "#ffffff");
      g.fillStyle = pg;
      g.beginPath();
      g.ellipse(0, -R * 0.6, R * 0.135, R * 0.44, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    g.fillStyle = "#d97706";
    g.beginPath();
    g.arc(0, 0, R * 0.27, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fbbf24";
    g.beginPath();
    g.arc(-R * 0.04, -R * 0.04, R * 0.2, 0, Math.PI * 2);
    g.fill();
  }

  g.restore();
}

/* ── per-frame simulation + dual-layer rendering ────────────────────────── */

export function renderWordmarkGarden(
  garden: WordmarkGarden,
  backCtx: CanvasRenderingContext2D,
  frontCtx: CanvasRenderingContext2D,
  elapsedMs: number,
  dtSec: number,
  pointer: BotanicalPointer,
  options: {
    dpr: number;
    isNight: boolean;
    reducedMotion?: boolean;
  },
) {
  const { dpr, isNight, reducedMotion = false } = options;
  const { stems, leaves, blooms, preset, width, height } = garden;
  const tSec = elapsedMs * 0.001;
  const dt = clamp(dtSec, 0.004, 0.05);

  backCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  backCtx.clearRect(0, 0, width, height);
  frontCtx.clearRect(0, 0, width, height);

  // Periodic gust wave (subtle baseline always present; heightened during `gust` preset)
  const gustCycle = (tSec * 0.22) % 1;
  const gustFrontX = (gustCycle * 1.5 - 0.25) * width;
  const gustStrength = preset === "gust" ? 0.32 : 0.1;

  // Update spring-damped sway per stem (ambient breathe + gentle gust + pointer interaction)
  for (let i = 0; i < stems.length; i++) {
    const st = stems[i];
    if (reducedMotion) {
      garden.sway[i] = 0;
      continue;
    }

    // Universal gentle breathe wave
    let target = Math.sin(tSec * 1.35 + st.phase) * (preset === "breathe" ? 0.085 : 0.048);

    // Sweeping gust front
    const dxFront = st.anchor[0] - gustFrontX;
    const frontPulse = Math.exp(-(dxFront * dxFront) / Math.max(12000, width * width * 0.035));
    target += frontPulse * gustStrength * (0.7 + 0.3 * Math.sin(tSec * 5.2 + st.phase));

    // `reach` preset: stems subtly lean toward a slow overhead solar drift
    if (preset === "reach") {
      const sunX = width * (0.5 + 0.38 * Math.sin(tSec * 0.45));
      target += clamp((sunX - st.anchor[0]) / Math.max(1, width), -0.45, 0.45) * 0.22;
    }

    // Mouse / pointer sway (always active & responsive!)
    if (pointer.active) {
      const [tip] = samplePts(st.pts, 0.9);
      const dx = tip[0] - pointer.x;
      const dy = tip[1] - pointer.y;
      const dist = Math.hypot(dx, dy);
      const reachR = Math.max(120, Math.min(200, width * 0.24));
      if (dist < reachR) {
        const push = (1 - dist / reachR) * (1 - dist / reachR);
        // Gentle parting sway away from cursor
        target += Math.sign(dx || 1) * push * 0.34;
      }
    }

    const k = 22;
    const damp = 5.4;
    const accel = (target - garden.sway[i]) * k - garden.swayVel[i] * damp;
    garden.swayVel[i] += accel * dt;
    garden.sway[i] += garden.swayVel[i] * dt;
  }

  // `visitor` preset: gentle pollen-light wisp drifting between blooms
  if (preset === "visitor" && !reducedMotion && blooms.length > 0 && elapsedMs > 1200) {
    if (elapsedMs >= garden.visitorNextAt) {
      garden.visitorIdx = (garden.visitorIdx + 1 + Math.floor(Math.sin(elapsedMs) * 2 + 2)) % blooms.length;
      garden.visitorNextAt = elapsedMs + 2200 + (garden.visitorIdx % 3) * 650;
    }
    const targetBloom = blooms[garden.visitorIdx];
    const st = stems[targetBloom.stemIdx];
    const [rawTip] = samplePts(st.pts, targetBloom.u);
    const tip = displacePt(rawTip, st.anchor, targetBloom.u, garden.sway[targetBloom.stemIdx]);
    const follow = 1 - Math.exp(-dt * 2.4);
    garden.visitorPos[0] += (tip[0] - garden.visitorPos[0]) * follow;
    garden.visitorPos[1] += (tip[1] - 10 - garden.visitorPos[1]) * follow;
    const dist = Math.hypot(tip[0] - garden.visitorPos[0], tip[1] - 10 - garden.visitorPos[1]);
    if (dist < 22) {
      targetBloom.nod = Math.min(1, targetBloom.nod + dt * 3.5);
    }
  }

  // `scatter` preset: release delicate drifting petals from open blooms
  if (
    preset === "scatter" &&
    !reducedMotion &&
    blooms.length > 0 &&
    elapsedMs > 1400 &&
    elapsedMs - garden.lastPetalAt > 540
  ) {
    garden.lastPetalAt = elapsedMs;
    const b = blooms[Math.floor(tSec * 3.7) % blooms.length];
    if (!b.isBud) {
      const st = stems[b.stemIdx];
      const [rawTip] = samplePts(st.pts, b.u);
      const tip = displacePt(rawTip, st.anchor, b.u, garden.sway[b.stemIdx]);
      const pCol =
        b.species === "lupine"
          ? "#a78bfa"
          : b.species === "cosmos"
            ? "#f472b6"
            : b.species === "poppy"
              ? "#fb923c"
              : "#ffffff";
      garden.petals.push({
        x: tip[0],
        y: tip[1],
        vx: 14 + Math.random() * 24,
        vy: -8 + Math.random() * 14,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 2.6,
        r: 2.8 + Math.random() * 2.4,
        color: pCol,
        life: 0,
        maxLife: 2.8 + Math.random() * 1.4,
      });
      if (garden.petals.length > 18) garden.petals.shift();
    }
  }

  const stemStroke = isNight ? "rgba(62, 166, 124, 0.88)" : "rgba(28, 122, 68, 0.88)";
  const stemHighlight = isNight ? "rgba(134, 239, 192, 0.42)" : "rgba(104, 198, 132, 0.42)";

  const paintLayer = (g: CanvasRenderingContext2D, layer: 0 | 1) => {
    // 1. Vines
    for (let i = 0; i < stems.length; i++) {
      const st = stems[i];
      let growth = reducedMotion ? 1 : easeOutCubic((elapsedMs - st.d0) / st.dur);
      if (preset === "growWither" && !reducedMotion && elapsedMs > st.d0 + st.dur + 800) {
        const wave = 0.5 + 0.5 * Math.sin(tSec * 0.52 + st.cycleOffset);
        growth = 0.38 + 0.62 * wave;
      }
      if (growth <= 0.01) continue;

      const swayRad = garden.sway[i];
      const n = st.pts.length - 1;

      for (const seg of st.segs) {
        if (seg.layer !== layer) continue;
        const b = Math.min(seg.u1, growth);
        if (b <= seg.u0 + 0.005) continue;

        const ia = seg.u0 * n;
        const ib = b * n;
        const pts: Pt[] = [];
        const sampleDisplaced = (idxF: number): Pt => {
          const idx0 = clamp(Math.floor(idxF), 0, n - 1);
          const frac = idxF - idx0;
          const u = idxF / n;
          const rx = st.pts[idx0][0] + (st.pts[idx0 + 1][0] - st.pts[idx0][0]) * frac;
          const ry = st.pts[idx0][1] + (st.pts[idx0 + 1][1] - st.pts[idx0][1]) * frac;
          return displacePt([rx, ry], st.anchor, u, swayRad);
        };

        pts.push(sampleDisplaced(ia));
        for (let k = Math.floor(ia) + 1; k < ib; k++) {
          pts.push(displacePt(st.pts[k], st.anchor, k / n, swayRad));
        }
        pts.push(sampleDisplaced(ib));

        if (pts.length >= 2) {
          g.beginPath();
          smoothPath(g, pts, false);
          g.strokeStyle = stemStroke;
          g.lineWidth = st.w;
          g.lineCap = "round";
          g.lineJoin = "round";
          g.stroke();

          if (pts.length >= 4) {
            g.beginPath();
            smoothPath(g, pts.slice(Math.max(0, pts.length - 4)), false);
            g.strokeStyle = stemHighlight;
            g.lineWidth = Math.max(0.8, st.w * 0.55);
            g.stroke();
          }
        }
      }
    }

    // 2. Leaves
    for (const lf of leaves) {
      if (lf.layer !== layer) continue;
      const st = stems[lf.stemIdx];
      let gFactor = reducedMotion ? 1 : springPop((elapsedMs - lf.d0) / 1000, 7.2, 13);
      if (preset === "growWither" && !reducedMotion && elapsedMs > lf.d0 + 900) {
        const wave = 0.5 + 0.5 * Math.sin(tSec * 0.52 + st.cycleOffset);
        gFactor *= clamp((wave - 0.15) / 0.65, 0.25, 1);
      }
      if (gFactor <= 0.02) continue;

      const swayRad = garden.sway[lf.stemIdx];
      const [rawPt] = samplePts(st.pts, lf.u);
      const pt = displacePt(rawPt, st.anchor, lf.u, swayRad);
      const flutter = reducedMotion ? 0 : Math.sin(tSec * 2.1 + lf.phase) * 0.07;
      paintLeaf(g, pt[0], pt[1], lf.baseA + swayRad * lf.u + flutter, lf.L, lf.bend, gFactor, isNight);
    }

    // 3. 4-Species Meadow Blooms
    for (const bl of blooms) {
      if (bl.layer !== layer) continue;
      const st = stems[bl.stemIdx];
      let scale = reducedMotion ? 1 : springPop((elapsedMs - bl.d0) / 1000, 6.8, 12.5);
      if (preset === "growWither" && !reducedMotion && elapsedMs > bl.d0 + 900) {
        const wave = 0.5 + 0.5 * Math.sin(tSec * 0.52 + st.cycleOffset);
        scale *= clamp((wave - 0.22) / 0.72, 0.05, 1);
      }
      if (scale <= 0.02) continue;

      // Gentle ambient breath (always alive, richer on `breathe`)
      if (!reducedMotion) {
        const breatheAmp = preset === "breathe" ? 0.095 : 0.045;
        scale *= 1 + Math.sin(tSec * 1.9 + bl.phase) * breatheAmp;
      }

      // Decay visitor nod
      if (bl.nod > 0) bl.nod = Math.max(0, bl.nod - dt * 1.4);

      const swayRad = garden.sway[bl.stemIdx];
      const [rawTip] = samplePts(st.pts, bl.u);
      const tip = displacePt(rawTip, st.anchor, bl.u, swayRad);

      let faceTurn = 0;
      if (pointer.active && !reducedMotion) {
        const aim = Math.atan2(pointer.x - tip[0], Math.max(48, tip[1] - pointer.y));
        faceTurn = clamp(aim * 0.32, -0.45, 0.45);
      } else if (preset === "reach" && !reducedMotion) {
        const sunX = width * (0.5 + 0.36 * Math.sin(tSec * 0.45));
        faceTurn = clamp(((sunX - tip[0]) / Math.max(1, width)) * 0.7, -0.42, 0.42);
      }

      const rot = bl.baseRot + swayRad * 1.15 + faceTurn + bl.nod * 0.26;
      paintMeadowBloom(g, tip[0], tip[1], bl.R, bl.species, rot, scale, isNight, bl.isBud);
    }
  };

  paintLayer(backCtx, 0);
  paintLayer(frontCtx, 1);

  // Foreground drifting petals (`scatter`)
  if (garden.petals.length > 0) {
    for (let i = garden.petals.length - 1; i >= 0; i--) {
      const p = garden.petals[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        garden.petals.splice(i, 1);
        continue;
      }
      p.x += (p.vx + Math.sin(tSec * 2.5 + i) * 8) * dt;
      p.y += (p.vy + Math.cos(tSec * 1.9 + i) * 6 + 6) * dt;
      p.rot += p.vrot * dt;
      const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.82;
      frontCtx.save();
      frontCtx.translate(p.x, p.y);
      frontCtx.rotate(p.rot);
      frontCtx.globalAlpha = alpha;
      frontCtx.fillStyle = p.color;
      frontCtx.beginPath();
      frontCtx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
      frontCtx.fill();
      frontCtx.restore();
    }
  }

  // Foreground `visitor` light-pollen wisp
  if (preset === "visitor" && !reducedMotion && elapsedMs > 1200) {
    const [vx, vy] = garden.visitorPos;
    const hoverY = vy + Math.sin(tSec * 5.2) * 3.5;
    const glow = frontCtx.createRadialGradient(vx, hoverY, 0, vx, hoverY, 13);
    glow.addColorStop(0, isNight ? "rgba(253, 224, 71, 0.9)" : "rgba(245, 158, 11, 0.72)");
    glow.addColorStop(0.5, isNight ? "rgba(253, 224, 71, 0.25)" : "rgba(245, 158, 11, 0.16)");
    glow.addColorStop(1, "rgba(245, 158, 11, 0)");
    frontCtx.fillStyle = glow;
    frontCtx.beginPath();
    frontCtx.arc(vx, hoverY, 13, 0, Math.PI * 2);
    frontCtx.fill();
  }
}
