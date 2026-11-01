"use client";

/**
 * Dither sky — the risograph print.
 *
 * Rendered on a deliberately tiny canvas (~360px wide) and upscaled with
 * `image-rendering: pixelated`. Each pixel is:
 *   1. painted from the same 24h palette as the other variants,
 *   2. shaded by a 3-octave directional noise field for cloud volume,
 *   3. quantized to a small ink set through a Bayer 4×4 threshold, so dithering
 *      reads as deliberate print texture rather than noise.
 *
 * Cost control: redraws are throttled, and only happen when time or size change
 * (plus a slow drift tick). The canvas pauses entirely when offscreen.
 */

import { useEffect, useRef } from "react";
import type { LightModel } from "@/lib/lighting";
import { CLOUDS, cachedCloudPath } from "./Clouds";

/** 4×4 Bayer matrix, normalized to (0,1). */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => v / 16));

const W = 560; // internal pixel width — cells read as pigment, not pixels
const ASPECT = 9 / 16;

/* ── tiny deterministic value noise ─────────────────────────────────────── */

function hash2(x: number, y: number) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x: number, y: number) {
  return vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.17;
}

/** Read a hex color off :root into [r,g,b]. */
function readVar(name: string, fallback: [number, number, number]): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hex = raw.replace("#", "");
  if (hex.length !== 6) return fallback;
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

const mixRGB = (a: number[], b: number[], t: number) =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as [
    number,
    number,
    number,
  ];

const lerpColors = (stops: [number, [number, number, number]][], t: number) => {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (x >= p0 && x <= p1) return mixRGB(c0, c1, (x - p0) / (p1 - p0 || 1));
  }
  return stops[stops.length - 1][1];
};

export function DitherSky({ light }: { light: LightModel }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ key: "", drift: 0, running: true });
  // Latest light, read inside the rAF loop — keeps the effect from tearing
  // down and rebuilding on every dial tick.
  const lightRef = useRef(light);
  lightRef.current = light;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const H = Math.round(W * ASPECT);
    canvas.width = W;
    canvas.height = H;

    /*
     * Cloud coverage is rasterized once from the *same* SVG silhouettes the
     * vector and volumetric variants draw. Dithering an identical mask is what
     * makes the three variants feel like three prints of one sky rather than
     * three unrelated skies.
     */
    const mask = document.createElement("canvas");
    mask.width = W;
    mask.height = H;
    const mctx = mask.getContext("2d");
    if (mctx) {
      mctx.fillStyle = "#000";
      CLOUDS.forEach((c) => {
        const scale = 0.42 + c.depth * 0.5;
        const w = W * c.w * scale;
        const h = w * 0.3;
        const x = W * c.x - w / 2;
        const y = H * (c.y - 0.12) - h * 0.4;
        mctx.save();
        mctx.globalAlpha = 0.45 + c.depth * 0.5;
        mctx.filter = `blur(${(1 + c.depth * 3).toFixed(1)}px)`;
        mctx.translate(x, y);
        mctx.scale(w / 1000, h / 300);
        mctx.fill(new Path2D(cachedCloudPath(c.seed)));
        mctx.restore();
      });
    }
    const maskData = mctx ? mctx.getImageData(0, 0, W, H).data : null;

    let raf = 0;
    let lastDraw = 0;

    const draw = () => {
      const cs = getComputedStyle(document.documentElement);

      // Ink set — deliberately few. Each is a palette role from lighting.ts.
      const zenith = readVar("--sky-zenith", [24, 30, 62]);
      const mid = readVar("--sky-mid", [42, 54, 96]);
      const horizon = readVar("--sky-horizon", [120, 110, 150]);
      const haze = readVar("--sky-haze", [160, 140, 160]);
      const glow = readVar("--sky-sun-glow", [255, 224, 190]);
      const cloudLit = readVar("--sky-cloud-lit", [236, 236, 240]);
      const cloudShadow = readVar("--sky-cloud-shadow", [90, 96, 130]);
      const cloudRim = readVar("--sky-cloud-rim", [255, 236, 200]);

      const sunX = parseFloat(cs.getPropertyValue("--sun-x")) / 100;
      const sunY = parseFloat(cs.getPropertyValue("--sun-y")) / 100;
      const sunOp = parseFloat(cs.getPropertyValue("--sun-op")) || 0;
      const moonX = parseFloat(cs.getPropertyValue("--moon-x")) / 100;
      const moonY = parseFloat(cs.getPropertyValue("--moon-y")) / 100;
      const moonOp = parseFloat(cs.getPropertyValue("--moon-op")) || 0;
      const starOp = parseFloat(cs.getPropertyValue("--star-opacity")) || 0;
      const rim = parseFloat(cs.getPropertyValue("--cloud-rim-strength")) || 0;
      const cloudOp = parseFloat(cs.getPropertyValue("--cloud-opacity")) || 0.5;

      const bands: [number, [number, number, number]][] = [
        [0, zenith],
        [0.42, mid],
        [0.8, horizon],
        [1, haze],
      ];

      const img = ctx.createImageData(W, H);
      const data = img.data;

      // stars are quantized too — drawn as single bright pixels
      const stars = lightRef.current.stars;

      for (let y = 0; y < H; y++) {
        const vy = y / H;
        const base = lerpColors(bands, Math.pow(vy, 0.92));

        for (let x = 0; x < W; x++) {
          const vx = x / W;
          const i = (y * W + x) * 4;

          let r = base[0];
          let g = base[1];
          let b = base[2];

          // Sun bloom: warm falloff around the disc, plus a hard disc itself.
          if (sunOp > 0.01) {
            const dx = (vx - sunX) * 1.0;
            const dy = (vy - sunY) * 1.78 * 0.62;
            const d = Math.sqrt(dx * dx + dy * dy);
            const bloom = Math.max(0, 1 - d / 0.55) ** 2.4 * sunOp;
            r += (glow[0] - r) * bloom * 0.75;
            g += (glow[1] - g) * bloom * 0.75;
            b += (glow[2] - b) * bloom * 0.75;
            if (d < 0.028) {
              r = 255;
              g = 250;
              b = 236;
            }
          }

          // Moon: a small silver disc with a phase-ish bite.
          if (moonOp > 0.01) {
            const dx = (vx - moonX) * 1.0;
            const dy = (vy - moonY) * 1.78 * 0.62;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 0.024) {
              r = 232;
              g = 238;
              b = 246;
            } else if (d < 0.05) {
              const k = (1 - (d - 0.024) / 0.026) * moonOp * 0.5;
              r += (210 - r) * k;
              g += (222 - g) * k;
              b += (240 - b) * k;
            }
          }

          // Cloud density comes from the rasterized silhouette mask, with a
          // little noise erosion so the edges feathered by blur pick up a
          // stippled breakup instead of a soft gradient.
          let density = 0;
          if (maskData) {
            const mi = (y * W + x) * 4;
            const raw = maskData[mi + 3] / 255;
            if (raw > 0.01) {
              const erode = fbm(vx * 14 + 3.1, vy * 14 + 7.7);
              density = Math.max(0, raw * (0.55 + erode * 0.9));
            }
          }
          density = Math.min(1, density * cloudOp * 1.35);

          if (density > 0.01) {
            // lit top / shadow base, with a hot rim on the sun-facing edge
            const lit = Math.min(1, density * 1.9);
            const shade = Math.min(1, Math.max(0, (vy - 0.3) * 1.1));
            // Body stays cool and paper-like; warmth is reserved for the rim,
            // which is what sells a lit edge in a two-ink print.
            const body = mixRGB(cloudLit, cloudShadow, 0.32 + shade * 0.38);
            r += (body[0] - r) * lit;
            g += (body[1] - g) * lit;
            b += (body[2] - b) * lit;

            const rimMask = Math.max(0, density - 0.62) * 2.4 * rim;
            if (rimMask > 0.02) {
              r += (cloudRim[0] - r) * Math.min(1, rimMask);
              g += (cloudRim[1] - g) * Math.min(1, rimMask);
              b += (cloudRim[2] - b) * Math.min(1, rimMask);
            }
          }

          // Stars — sparse single-pixel points with a dithered halo.
          if (starOp > 0.02) {
            for (let s = 0; s < stars.length; s += 1) {
              const st = stars[s];
              const sx = Math.floor(st.x * W);
              const sy = Math.floor(st.y * H);
              if (sx === x && sy === y) {
                const k = st.brightness * starOp;
                r += (255 - r) * k;
                g += (255 - g) * k;
                b += (252 - b) * k;
              }
            }
          }

          // Quantize to a narrow ink ladder with Bayer dithering. Steps are
          // gentle (14 levels) so the posterisation reads as riso screens
          // rather than a coarse checkerboard.
          const thr = BAYER[y & 3][x & 3];
          const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
          const steps = 14;
          const q = Math.round((lum * steps + (thr - 0.5) * 0.85)) / steps;
          const scale = q / (lum || 1);
          r = Math.min(255, r * scale);
          g = Math.min(255, g * scale);
          b = Math.min(255, b * scale);

          // Paper tooth — fine, fixed, never banded.
          const grain = (hash2(x * 13 + 7, y * 17 + 3) - 0.5) * 7;
          data[i] = r + grain;
          data[i + 1] = g + grain;
          data[i + 2] = b + grain;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
    };

    const tick = (ts: number) => {
      const st = stateRef.current;
      const key = `${lightRef.current.time.toFixed(3)}|${W}x${H}`;
      const changed = key !== st.key;
      // Repaint on change; otherwise drift slowly (riso clouds crawl).
      if (changed || ts - lastDraw > 220) {
        st.key = key;
        st.drift += 0.002;
        lastDraw = ts;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // Visibility guard — don't burn CPU behind the fold.
    const io = new IntersectionObserver(
      ([entry]) => {
        stateRef.current.running = entry.isIntersecting;
        if (entry.isIntersecting) raf = requestAnimationFrame(tick);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fill" aria-hidden data-sky-variant="dither">
      <canvas
        ref={canvasRef}
        className="block-full"
        style={{ imageRendering: "pixelated", display: "block" }}
      />
      {/* print registration wash + paper tooth over the raster */}
      <div className="sky-grain fill opacity-40" />
    </div>
  );
}
