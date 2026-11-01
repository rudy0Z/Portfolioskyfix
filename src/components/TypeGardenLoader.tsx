import { useEffect, useRef, useState, useCallback } from "react";

interface TypeGardenLoaderProps {
  onComplete?: () => void;
  onDockingStart?: () => void;
  isPersistentLogo?: boolean;
  onOpenFullscreen?: () => void;
}

const FONT_FAMILY = '"Fraunces Variable", "Fraunces", Georgia, serif';

const PALETTES = [
  ["Rose noir", "#000000", "#FF1400", "#3257FF", "#FFB4A8", "#FFFFFF"],
  ["Paper", "#F3EEE4", "#FF3B1F", "#1C2B8F", "#FFD2C4", "#111111"],
  ["Midnight", "#0D1B4C", "#FF5A4E", "#9FB4FF", "#FFD6CF", "#FFFFFF"],
  ["Citrus", "#0E1A12", "#FF8A00", "#1FA463", "#FFE2B8", "#FFF6E8"],
  ["Orchid", "#140A1F", "#E63CFF", "#2FB8A6", "#F9D1FF", "#FFFFFF"],
  ["Moss", "#133A2A", "#FFB7C5", "#7FD18B", "#FFFFFF", "#F6F1E7"],
  ["Tomato", "#FF1400", "#FFF1E0", "#0B0B0B", "#FF1400", "#000000"],
  ["Butter", "#FFE9A8", "#E4002B", "#0F5132", "#FFC2C2", "#1A1A1A"],
  ["Blush", "#FAD4D8", "#C8102E", "#274690", "#FFE3E6", "#1A1A1A"],
  ["Mono", "#000000", "#F2F2F2", "#6E6E6E", "#000000", "#FFFFFF"],
];

interface Letter {
  ch: string;
  id: number;
  birth: number;
  tb: number;
  ws: number;
  wi: number;
  prev: Letter | null;
  dead?: number;
  cut?: number | null;
  endEls?: any[];
  els?: any[];
  x?: number;
  y?: number;
  tx?: number;
  ty?: number;
  tw?: number;
  line?: number;
}

export function TypeGardenLoader({
  onComplete,
  onDockingStart,
  isPersistentLogo = false,
  onOpenFullscreen,
}: TypeGardenLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState<"blooming" | "docking" | "docked">(
    isPersistentLogo ? "docked" : "blooming"
  );
  const [statusText, setStatusText] = useState("Planting the type garden…");
  const [palIdx, setPalIdx] = useState(0);

  // The bloom runs once per mount. Callbacks and the palette are read through
  // refs so a parent re-render or a palette pick cannot restart it (which
  // re-seeded the word and reset the timers).
  const onCompleteRef = useRef(onComplete);
  const onDockingStartRef = useRef(onDockingStart);
  const palIdxRef = useRef(palIdx);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onDockingStartRef.current = onDockingStart;
    palIdxRef.current = palIdx;
  });

  // Growth animation loop references
  const lettersRef = useRef<Letter[]>([]);
  const uidRef = useRef(1);
  const cacheRef = useRef<Record<string, number>>({});
  const sdRef = useRef(0);
  const stRef = useRef(0);
  const cxRef = useRef(0);
  const cyRef = useRef(0);
  const ctxRef = useRef(0);
  const ctyRef = useRef(0);
  const wrappedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const ltRef = useRef<number>(0);

  const pal = useCallback(() => {
    const p = PALETTES[palIdxRef.current];
    return {
      bg: p[1],
      C: { red: p[2], blue: p[3], line: p[4], text: p[5], vein: p[1] },
    };
  }, []);

  useEffect(() => {
    if (isPersistentLogo) return;

    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;

    // Start from an empty bed (StrictMode runs effects twice in development).
    lettersRef.current = [];
    uidRef.current = 1;
    ltRef.current = 0;
    wrappedRef.current = false;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      layout(true);
    };

    const rng = (seed: number) => {
      let s = seed | 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const eo = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
    const spr = (t: number, k = 7, w = 16) =>
      t <= 0 ? 0 : 1 - Math.exp(-t * k) * Math.cos(t * w);

    const mw = (ch: string) => {
      if (cacheRef.current[ch] != null) return cacheRef.current[ch];
      g.font = `700 100px ${FONT_FAMILY}`;
      let w = g.measureText(ch).width / 100;
      if (ch === " ") w *= 1.4;
      return (cacheRef.current[ch] = w);
    };

    const wordParams = (ws: number) => {
      const r = rng(ws * 7 + 13);
      return {
        roseP: 0.3 + r() * 0.3,
        leafy: 0.6 + r() * 0.8,
        lean: (r() - 0.5) * 0.6,
        big: 0.85 + r() * 0.45,
        curvy: 0.8 + r() * 0.6,
        bridgeP: 0.45 + r() * 0.35,
        w: 0.5,
      };
    };

    const vine = (
      base: [number, number],
      dir: number,
      len: number,
      amp: number,
      waves: number,
      ph: number,
      bend: number,
      n = 40
    ) => {
      const P: [number, number][] = [[base[0], base[1]]];
      const step = len / n;
      let x = base[0],
        y = base[1];
      for (let i = 1; i <= n; i++) {
        const u = i / n;
        const a =
          dir + bend * u + amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 3);
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
        P.push([x, y]);
      }
      return P;
    };

    const curl = (P: [number, number][], sign: number, rad: number) => {
      const n = P.length;
      const e = P[n - 1];
      const a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0]);
      const c = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad];
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
      let u0 = 0,
        layer = startLayer;
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

    const at = (P: [number, number][], u: number): [[number, number], number] => {
      const n = P.length;
      const i = Math.min(n - 2, Math.max(1, Math.round(u * (n - 1))));
      return [P[i], Math.atan2(P[i + 1][1] - P[i - 1][1], P[i + 1][0] - P[i - 1][0])];
    };

    const grow = (
      r: () => number,
      E: any[],
      nid: () => number,
      p: any,
      o: any
    ) => {
      const tip =
        o.tip ||
        (r() < p.roseP
          ? "rose"
          : r() < 0.45
            ? "fan"
            : r() < 0.6
              ? "leaf"
              : "curl");
      let P =
        o.pts ||
        vine(
          o.base,
          o.dir,
          o.len,
          (0.35 + r() * 0.45) * p.curvy,
          1 + r() * 1.6,
          r() * 6.28,
          (r() - 0.5) * 1.2,
          40
        );
      if (tip === "curl") P = curl(P, r() < 0.5 ? -1 : 1, 0.05 + r() * 0.05);
      const segs = weave(r, o.layer0 != null ? o.layer0 : r() < 0.5 ? 0 : 1);
      const dur = Math.max(320, (o.len || 0.8) * 620);
      const thorns: { u: number; s: number }[] = [];
      const nt = Math.floor(r() * 2.5);
      for (let i = 0; i < nt; i++)
        thorns.push({ u: 0.15 + r() * 0.65, s: r() < 0.5 ? -1 : 1 });
      E.push({
        t: "stem",
        id: nid(),
        pts: P,
        segs,
        d0: o.d0,
        dur,
        w: o.depth ? 0.82 : 1,
        thorns,
      });

      const nl = Math.floor(r() * 2.8 * p.leafy);
      let sd = r() < 0.5 ? -1 : 1;
      for (let i = 0; i < nl; i++) {
        const u = 0.25 + r() * 0.6;
        const [q, a] = at(P, u);
        sd = -sd;
        E.push({
          t: "leaf",
          id: nid(),
          x: q[0],
          y: q[1],
          a: a + sd * (0.55 + r() * 0.5),
          L: (0.14 + r() * 0.2) * (o.depth ? 0.8 : 1),
          bend: (r() - 0.5) * 1.2,
          layer: layerAt(segs, u),
          d0: o.d0 + dur * u,
        });
      }

      const [tp, ta] = at(P, 1);
      const td = o.d0 + dur * 0.8;
      const tl = layerAt(segs, 1);
      if (tip === "rose") {
        const R = (0.13 + r() * 0.15) * p.big * (o.depth ? 0.75 : 1);
        E.push({
          t: "rose",
          id: nid(),
          x: tp[0],
          y: tp[1],
          R,
          rot: (r() - 0.5) * 1.0,
          ph1: r() * 6.28,
          ph2: r() * 6.28,
          turns: 1.8 + r() * 1,
          layer: tl,
          d0: td,
        });
      } else if (tip === "fan") {
        const spread = 0.6 + r() * 0.3;
        for (let j = 0; j < 2; j++)
          E.push({
            t: "leaf",
            id: nid(),
            x: tp[0],
            y: tp[1],
            a: ta + (j - 0.5) * spread,
            L: 0.2 + r() * 0.2,
            bend: (j - 0.5) * 0.8,
            layer: tl,
            d0: td + j * 60,
          });
      } else if (tip === "leaf") {
        E.push({
          t: "leaf",
          id: nid(),
          x: tp[0],
          y: tp[1],
          a: ta + (r() - 0.5) * 0.3,
          L: 0.16 + r() * 0.16,
          bend: r() - 0.5,
          layer: tl,
          d0: td,
        });
      }
    };

    const gen = (l: Letter) => {
      const r = rng(
        (l.ws ^ Math.imul(l.wi + 1, 2654435761)) + Math.floor(Math.random() * 1e6)
      );
      const p = wordParams(l.ws);
      const E: any[] = [];
      let k0 = 0;
      const nid = () => l.id * 100 + k0++;
      const w = mw(l.ch);
      const inX = () => (r() - 0.5) * w * 0.7;
      p.w = w;

      grow(r, E, nid, p, {
        base: [inX(), -r() * 0.3],
        dir: -Math.PI / 2 + p.lean * 0.5 + (r() - 0.5) * 0.7,
        len: 0.6 + r() * 0.5,
        d0: 40,
        tip: l.wi === 0 ? "rose" : null,
      });
      if (r() < 0.4)
        grow(r, E, nid, p, {
          base: [inX(), -0.1 - r() * 0.35],
          dir: Math.PI / 2 + (r() - 0.5) * 0.8,
          len: 0.35 + r() * 0.35,
          d0: 160,
        });

      l.els = E;
    };

    const layout = (snap = false) => {
      const A = lettersRef.current.filter((l) => !l.dead);
      if (A.length === 0) return;

      const maxW = width * 0.85;
      const S0 = height * 0.22;
      const LH = 1.9;
      const ws = A.map((l) => mw(l.ch));

      const words: { sp?: boolean; idx: number[] }[] = [];
      let cur: { idx: number[] } | null = null;
      A.forEach((l, i) => {
        if (l.ch === " ") {
          if (cur) {
            words.push(cur);
            cur = null;
          }
          words.push({ sp: true, idx: [i] });
        } else {
          if (!cur) cur = { idx: [] };
          cur.idx.push(i);
        }
      });
      if (cur) words.push(cur);

      const lineW = (li: number[], S: number) => {
        let e = li.length;
        while (e > 0 && A[li[e - 1]].ch === " ") e--;
        let w = 0;
        for (let k = 0; k < e; k++) w += ws[li[k]];
        return w * S;
      };

      const wrap = (S: number) => {
        const lines: number[][] = [[]];
        let lw = 0;
        for (const w of words) {
          const ww = w.idx.reduce((s, i) => s + ws[i], 0) * S;
          if (!w.sp && lw > 0 && lw + ww > maxW) {
            lines.push([]);
            lw = 0;
          }
          lines[lines.length - 1].push(...w.idx);
          lw += ww;
        }
        return lines;
      };

      let lines = [A.map((_, i) => i)];
      const unit = lineW(lines[0], 1);
      let S = unit > 0 ? Math.min(S0, maxW / unit) : S0;
      const multi = words.filter((w) => !w.sp).length > 1;
      let wrapped = multi && S < height * 0.12;
      if (wrapped) {
        let lo = height * 0.04,
          hi = height * 0.16;
        for (let k = 0; k < 20; k++) {
          const mid = (lo + hi) / 2;
          const ls = wrap(mid);
          const ok =
            ls.every((li) => lineW(li, mid) <= maxW) &&
            ls.length * LH * mid <= height * 0.85;
          if (ok) lo = mid;
          else hi = mid;
        }
        S = lo;
        lines = wrap(S);
      }

      wrappedRef.current = wrapped;
      const n = lines.length,
        lh = LH * S;
      lines.forEach((li, k) => {
        let x = width / 2 - lineW(li, S) / 2;
        const y = height / 2 + (k - (n - 1) / 2) * lh + 0.33 * S;
        li.forEach((i) => {
          const l = A[i],
            w = ws[i] * S;
          l.tx = x + w / 2;
          l.ty = y;
          l.tw = w;
          l.line = k;
          x += w;
        });
      });

      A.forEach((l) => {
        if (l.x == null) {
          l.x = l.tx;
          l.y = l.ty;
        }
      });
      const last = A[A.length - 1];
      stRef.current = S;
      ctxRef.current = last ? (last.tx || 0) + (last.tw || 0) / 2 + 0.07 * S : width / 2;
      ctyRef.current = last ? (last.ty || 0) - 0.33 * S : height / 2;

      if (snap || !sdRef.current) {
        sdRef.current = S;
        cxRef.current = ctxRef.current;
        cyRef.current = ctyRef.current;
        A.forEach((l) => {
          l.x = l.tx;
          l.y = l.ty;
        });
      }
    };

    const path = (
      g: CanvasRenderingContext2D,
      p: [number, number][],
      closed: boolean
    ) => {
      const n = p.length;
      if (n < 2) return;
      const m = (a: [number, number], b: [number, number]): [number, number] => [
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2,
      ];
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
      P: [number, number][],
      a: number,
      b: number,
      col: string,
      w: number
    ) => {
      const n = P.length - 1;
      const ia = a * n;
      const ib = b * n;
      const lerp = (t: number): [number, number] => {
        const i = Math.min(n - 1, Math.floor(t));
        const f = t - i;
        return [
          P[i][0] + (P[i + 1][0] - P[i][0]) * f,
          P[i][1] + (P[i + 1][1] - P[i][1]) * f,
        ];
      };
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

    const drawLeaf = (
      bx: number,
      by: number,
      a: number,
      L: number,
      bend: number
    ) => {
      if (L < 0.5) return;
      const ca = Math.cos(a),
        sa = Math.sin(a),
        px = -sa,
        py = ca;
      const ax = (u: number): [number, number] => {
        const b = Math.sin(Math.PI * u) * bend * 0.15 * L;
        return [bx + ca * u * L + px * b, by + sa * u * L + py * b];
      };
      const hw = (u: number) => L * 0.18 * Math.sin(Math.PI * Math.pow(u, 0.8));
      const N = 12;
      const s1: [number, number][] = [];
      const s2: [number, number][] = [];
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
      g.fillStyle = pal().C.blue;
      g.fill();
    };

    const drawRose = (
      cx: number,
      cy: number,
      R: number,
      rot: number,
      e: any,
      a: number
    ) => {
      const cr = Math.cos(rot),
        sr = Math.sin(rot);
      const T = (x: number, y: number): [number, number] => [
        cx + x * cr - y * sr,
        cy + x * sr + y * cr,
      ];
      const P = [
        [0, -0.36, 0.56, 0.54, 0],
        [-0.5, -0.06, 0.6, 0.6, -0.35],
        [0.52, -0.06, 0.6, 0.6, 0.35],
        [-0.42, 0.3, 0.62, 0.48, 0.2],
        [0.47, 0.3, 0.62, 0.48, -0.2],
        [0.05, 0.42, 0.56, 0.38, 0],
      ];
      const st = 85;
      P.forEach((q, i) => {
        const s = spr((a - i * st) / 1000, 8, 14);
        if (s <= 0.001) return;
        const open = (1 - Math.min(1, s)) * (q[0] < 0 ? 0.5 : -0.5);
        const ang = q[4] + open;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const pt = (th: number) => {
          const rr = 1 + 0.08 * Math.sin(3 * th + e.ph1 + i);
          const lx = Math.cos(th) * q[2] * rr;
          const ly = Math.sin(th) * q[3] * rr;
          return T(
            (q[0] + lx * ca - ly * sa) * R * s,
            (q[1] + lx * sa + ly * ca) * R * s
          );
        };
        const pts: [number, number][] = [];
        for (let k = 0; k < 24; k++) pts.push(pt((k / 24) * Math.PI * 2));
        g.beginPath();
        path(g, pts, true);
        g.fillStyle = pal().C.red;
        g.fill();
      });
    };

    const addLetter = (ch: string, now: number) => {
      const A = lettersRef.current.filter((l) => !l.dead);
      const last = A[A.length - 1];
      if (ch === " ") {
        lettersRef.current.push({
          ch: " ",
          id: uidRef.current++,
          birth: now,
          tb: now,
          ws: last ? last.ws : 12345,
          wi: 0,
          prev: null,
          els: [],
        });
        layout();
        return;
      }
      const same = last && last.ch !== " ";
      const l: Letter = {
        ch,
        id: uidRef.current++,
        birth: now,
        tb: now,
        ws: same ? last.ws : Math.floor(Math.random() * 1e9),
        wi: same ? last.wi + 1 : 0,
        prev: same ? last : null,
      };
      gen(l);
      lettersRef.current.push(l);
      layout();
    };

    // Seed letters with the garden's name (formerly "RUDRAKSH")
    const seedWord = "TYPE GARDEN";
    const startTime = performance.now();
    seedWord.split("").forEach((ch, idx) => {
      addLetter(ch, startTime + idx * 80);
    });

    const loop = () => {
      const now = performance.now();
      const dt = Math.min(64, now - (ltRef.current || now));
      ltRef.current = now;

      const k = 1 - Math.exp(-dt / 80);
      sdRef.current += (stRef.current - sdRef.current) * k;
      cxRef.current += (ctxRef.current - cxRef.current) * k;
      cyRef.current += (ctyRef.current - cyRef.current) * k;

      for (const l of lettersRef.current) {
        if (!l.dead && l.tx != null && l.ty != null) {
          l.x = (l.x || l.tx) + (l.tx - (l.x || l.tx)) * k;
          l.y = (l.y || l.ty) + (l.ty - (l.y || l.ty)) * k;
        }
      }

      // Render
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = pal().bg;
      g.fillRect(0, 0, width, height);

      const S = sdRef.current;
      const L = lettersRef.current;

      const drawFloraLayer = (layer: number) => {
        for (const l of L) {
          if (l.ch === " " || !l.els) continue;
          const age = now - l.birth;
          const all = [...l.els, ...(l.endEls || [])];
          for (const e of all) {
            if (e.t === "stem") {
              const fr = eo((age - e.d0) / e.dur);
              if (fr <= 0) continue;
              const P = e.pts.map((p: [number, number]) => [
                (l.x || 0) + p[0] * S,
                (l.y || 0) + p[1] * S,
              ]);
              for (const sg of e.segs) {
                if (sg.layer !== layer) continue;
                const b = Math.min(sg.u1, fr);
                if (b <= sg.u0) continue;
                strokeRange(P, sg.u0, b, pal().C.blue, S * 0.022);
              }
            } else if (e.layer === layer) {
              if (e.t === "leaf") {
                const sc = spr((age - e.d0) / 1000, 7, 15);
                if (sc > 0)
                  drawLeaf(
                    (l.x || 0) + e.x * S,
                    (l.y || 0) + e.y * S,
                    e.a,
                    e.L * S * sc,
                    e.bend
                  );
              } else if (e.t === "rose") {
                const a = age - e.d0;
                if (a > 0)
                  drawRose(
                    (l.x || 0) + e.x * S,
                    (l.y || 0) + e.y * S,
                    e.R * S,
                    e.rot,
                    e,
                    a
                  );
              }
            }
          }
        }
      };

      // Back flora layer
      drawFloraLayer(0);

      // Render typography letters
      g.fillStyle = pal().C.text;
      g.font = `700 ${S}px ${FONT_FAMILY}`;
      g.textAlign = "center";
      g.textBaseline = "alphabetic";

      for (const l of L) {
        if (l.ch !== " " && l.x != null && l.y != null) {
          const age = now - l.birth;
          const sc = Math.min(1, age / 250);
          g.save();
          g.translate(l.x, l.y);
          g.scale(sc, sc);
          g.fillText(l.ch, 0, 0);
          g.restore();
        }
      }

      // Front flora layer
      drawFloraLayer(1);

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    rafRef.current = requestAnimationFrame(loop);

    // Timed progression into docking
    const t1 = setTimeout(() => {
      setStatusText("Letters taking root…");
    }, 1200);

    const t2 = setTimeout(() => {
      setStatusText("Opening the garden…");
      setStage("docking");
      onDockingStartRef.current?.();
    }, 2400);

    const t3 = setTimeout(() => {
      setStage("docked");
      onCompleteRef.current?.();
    }, 3200);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isPersistentLogo, pal]);

  // Docked persistent state: A compact, blooming editorial badge
  if (stage === "docked" || isPersistentLogo) {
    return (
      <button
        type="button"
        className="type-garden-docked group flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md hover:border-white/30 transition-all duration-300"
        onClick={onOpenFullscreen}
        title="Type Garden — replay the bloom"
        aria-label="Type Garden — replay the bloom"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <svg
            className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform duration-500 ease-out"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            {/* Organic botanical rose petal star */}
            <path
              d="M12 2C13.5 6 18 10.5 22 12C18 13.5 13.5 18 12 22C10.5 18 6 13.5 2 12C6 10.5 10.5 6 12 2Z"
              fill="currentColor"
              fillOpacity="0.25"
            />
            <circle cx="12" cy="12" r="2.5" fill="#f43f5e" />
          </svg>
        </span>
        <span className="font-serif text-[15px] font-semibold tracking-tight text-white/95">
          Type Garden
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white/70">
          Rudraksh Singh
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-800 ${
        stage === "docking" ? "bg-black/0 pointer-events-none" : "bg-black pointer-events-auto"
      }`}
    >
      {/* Gliding Canvas Layer: Coordinates smoothly translate into top notch socket */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-800"
        style={{
          transform:
            stage === "docking"
              ? "translateY(calc(-50vh + 32px)) scale(0.28)"
              : "translateY(0) scale(1)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: stage === "docking" ? 0.35 : 1,
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Atmospheric calibration overlay */}
      <div
        className={`absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-opacity duration-500 ${
          stage === "docking" ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
      >
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{statusText}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            {PALETTES.slice(0, 5).map((p, idx) => (
              <button
                key={p[0]}
                type="button"
                className={`h-4 w-4 rounded-full border transition-transform ${
                  idx === palIdx ? "scale-125 border-white" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: p[2] }}
                title={p[0]}
                onClick={() => setPalIdx(idx)}
              />
            ))}
          </div>

          <button
            type="button"
            className="px-4 py-1.5 rounded-full border border-white/20 bg-white/10 font-mono text-[11px] uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors"
            onClick={() => {
              setStage("docked");
              onCompleteRef.current?.();
            }}
          >
            Enter the garden →
          </button>
        </div>
      </div>
    </div>
  );
}
