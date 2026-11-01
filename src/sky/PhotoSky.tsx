"use client";

/**
 * PhotoSky — the default "volumetric" variant, rendered in WebGL2.
 *
 * A ray-marched cumulus layer around the island, lit by the same light model
 * that drives the CSS variables, so the clouds, the sun, the island rim and
 * the glass cards always agree on where the light is.
 *
 *  - Scroll lifts the camera through the layer (the island floats up, we rise
 *    with it).
 *  - Scrubbing the clock races the clouds like a timelapse: drift is tied to
 *    the hours you sweep through, not only to wall time.
 *  - Renders at 30 fps when nothing is moving, every frame while you scrub or
 *    scroll, and not at all in a background tab.
 *
 * If WebGL2 is unavailable (or the context is lost) it falls back to the CSS
 * plate sky, so the page never shows an empty canvas.
 */

import { useEffect, useRef, useState } from "react";
import type { LightModel } from "@/lib/lighting";
import { SkyRenderer } from "./webgl/SkyRenderer";
import { VolumetricSky } from "./VolumetricSky";

const shortestHours = (from: number, to: number) => {
  let d = (to - from) % 24;
  if (d > 12) d -= 24;
  if (d < -12) d += 24;
  return d;
};

export function PhotoSky({ light, still = false }: { light: LightModel; still?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkyRenderer | null>(null);
  const lightRef = useRef(light);
  const dirty = useRef(true);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // Accumulated scrub, for the timelapse drift.
  const lapse = useRef({ hours: 0, last: light.time, changedAt: 0 });

  useEffect(() => {
    const l = lapse.current;
    l.hours += shortestHours(l.last, light.time);
    if (Math.abs(light.time - l.last) > 1e-6) l.changedAt = performance.now();
    l.last = light.time;
    lightRef.current = light;
    rendererRef.current?.setLight(light);
    dirty.current = true;
  }, [light]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = SkyRenderer.create(canvas);
    if (!renderer) {
      setFailed(true);
      return;
    }
    rendererRef.current = renderer;
    renderer.setLight(lightRef.current);

    const reduced = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastDraw = 0;
    let lastScroll = -1;
    let scrollAt = 0;
    let first = true;
    let prevRaf = 0;
    let renderedPrev = false;
    // reduced motion: after a change, render a few frames so the temporal
    // accumulation settles, then stop
    let settle = 0;
    const qa = new URLSearchParams(window.location.search).get("skyqa");
    const qaPasses = Number(qa) || 1;

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    const onResize = () => (dirty.current = true);
    window.addEventListener("resize", onResize);
    const onVisible = () => {
      if (!document.hidden) {
        renderer.resetTiming();
        prevRaf = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (renderedPrev && prevRaf) renderer.sampleFrame(now - prevRaf);
      prevRaf = now;
      renderedPrev = false;

      const y = window.scrollY;
      if (y !== lastScroll) {
        lastScroll = y;
        scrollAt = now;
        dirty.current = true;
      }
      const busy = now - scrollAt < 400 || now - lapse.current.changedAt < 400;
      if (dirty.current) settle = 10;
      if (reduced) {
        if (settle <= 0) return;
      } else if (!busy && !dirty.current && now - lastDraw < 33) {
        // idle: 30 fps is plenty for drifting cloud
        return;
      }
      settle--;
      lastDraw = now;
      dirty.current = false;
      renderedPrev = true;

      const lift = Math.min(1, y / (window.innerHeight * 2.4));
      // QA hook: ?skyqa=N renders N accumulation frames up front so headless
      // screenshots (software GL, ~1 fps) show the converged image.
      const passes = first ? qaPasses : 1;
      for (let i = 0; i < passes; i++) {
        renderer.render(now, { lift, timelapseHours: lapse.current.hours, still: reduced, fast: busy && passes === 1 });
      }
      if (first) {
        first = false;
        setReady(true);
      }
    };
    raf = requestAnimationFrame(frame);

    if (qa) (window as unknown as { __sky?: unknown }).__sky = renderer;

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisible);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [still]);

  if (failed) return <VolumetricSky light={light} />;

  return (
    <div className="fill photo-sky" data-sky-variant="volumetric" data-ready={ready} aria-hidden>
      {/* first paint: the palette gradient, until the first frame lands */}
      <div className="fill photo-sky-base" />
      <canvas ref={canvasRef} className="fill photo-sky-canvas" />
    </div>
  );
}
