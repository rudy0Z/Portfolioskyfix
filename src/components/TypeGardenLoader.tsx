"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSkyTime } from "@/lib/useTimeOfDay";
import { paletteAt } from "@/lib/skyPalette";
import { mixOklch, oklch, type OKLCH } from "@/lib/color";
import {
  buildWordmarkGarden,
  pickRandomWordmarkPreset,
  renderWordmarkGarden,
  type GlyphSlot,
  type WordmarkGarden,
} from "@/components/botanical/BotanicalWordmarkEngine";

/**
 * TypeGardenLoader — first-visit typed botanical bloom.
 *
 * Types "Rudraksh" letter-by-letter in editorial serif as our 4-species
 * portfolio meadow flowers (lupine, cosmos, poppy, daisy) and weaving vines
 * sprout organically over and behind each typed glyph. Once bloomed (~1.85s),
 * the living wordmark smoothly FLIP-docks into the top nav capsule as the
 * atmospheric veil lifts to reveal the live sky and meadow.
 */

const SEED_WORD = "Rudraksh";
const LETTER_STEP_MS = 95;
const BLOOM_HOLD_MS = 1850;
const DOCK_DURATION_MS = 760;

interface TypeGardenLoaderProps {
  /** Fired when the bloom completes and the FLIP docking flight begins. */
  onDockingStart?: () => void;
  /** Fired when the wordmark has landed and the veil is fully lifted. */
  onComplete?: () => void;
  /** Replay: ignore the once-per-session guard. */
  ignoreSession?: boolean;
}

function veilColors(t: number) {
  const p = paletteAt(t);
  const isNight = t < 6.0 || t > 18.6;
  if (isNight) {
    const deep: OKLCH = { l: 0.12, c: 0.032, h: 252 };
    return {
      isNight: true,
      top: oklch(mixOklch(p.zenith, deep, 0.72)),
      bot: oklch(mixOklch(p.horizon, deep, 0.78)),
    };
  }
  // Serene alabaster-sky wash during daylight so serif & 4-species flowers pop crisply
  const alabasterTop: OKLCH = { l: 0.96, c: 0.014, h: p.zenith.h };
  const alabasterBot: OKLCH = { l: 0.985, c: 0.008, h: p.horizon.h };
  return {
    isNight: false,
    top: oklch(mixOklch(p.zenith, alabasterTop, 0.82)),
    bot: oklch(mixOklch(p.horizon, alabasterBot, 0.88)),
  };
}

export function TypeGardenLoader({
  onDockingStart,
  onComplete,
  ignoreSession = false,
}: TypeGardenLoaderProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  const [finished, setFinished] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const t = useSkyTime();
  const veil = veilColors(t);
  const isNightRef = useRef(veil.isNight);
  isNightRef.current = veil.isNight;

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const params = new URLSearchParams(window.location.search);
    const fast = params.has("fast") || params.get("autostart") === "1";
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
    const stage = stageRef.current;
    if (!back || !front || !word || !stage) return;
    const gb = back.getContext("2d");
    const gf = front.getContext("2d");
    if (!gb || !gf) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const preset = pickRandomWordmarkPreset();
    let garden: WordmarkGarden | null = null;
    const startTs = performance.now();
    let lastTs = startTs;

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const cv of [back, front]) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      const spans = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
      const slots: GlyphSlot[] = spans.map((sp, i) => {
        const r = sp.getBoundingClientRect();
        return {
          cx: r.left + r.width / 2,
          baseY: r.bottom - r.height * 0.14,
          topY: r.top + r.height * 0.12,
          w: r.width,
          h: r.height,
          delayMs: 70 + i * LETTER_STEP_MS,
        };
      });
      garden = buildWordmarkGarden(slots, w, h, {
        seed: (Date.now() ^ 0x5f3759df) & 0xfffffff,
        preset,
        density: "loader",
      });
    };

    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    // Typed reveal timers — each letter types in smoothly while its flowers sprout
    const typeTimers: number[] = [];
    for (let i = 1; i <= SEED_WORD.length; i++) {
      typeTimers.push(
        window.setTimeout(() => {
          setTypedCount(i);
        }, 60 + (i - 1) * LETTER_STEP_MS),
      );
    }

    let raf = 0;
    const loop = (now: number) => {
      const dt = (now - lastTs) / 1000;
      lastTs = now;
      if (garden) {
        renderWordmarkGarden(
          garden,
          gb,
          gf,
          now - startTs,
          dt,
          { x: 0, y: 0, active: false },
          { dpr, isNight: isNightRef.current, reducedMotion: false },
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Smooth FLIP docking into the nav bar logo while the veil lifts
    const dockTimer = window.setTimeout(() => {
      const target =
        document.querySelector<HTMLElement>(".site-brand-wordmark") ||
        document.querySelector<HTMLElement>(".site-wordmark");
      onDockingStart?.();
      if (target && stage) {
        const tr = target.getBoundingClientRect();
        const wr = word.getBoundingClientRect();
        const dx = tr.left + tr.width / 2 - (wr.left + wr.width / 2);
        const dy = tr.top + tr.height / 2 - (wr.top + wr.height / 2);
        const k = Math.max(0.14, Math.min(0.42, tr.height / Math.max(1, wr.height)));
        stage.style.transition = `transform ${DOCK_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 580ms ease 220ms`;
        stage.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
        stage.style.opacity = "0";
      }
      veilRef.current?.classList.add("is-lifting");
    }, BLOOM_HOLD_MS);

    const doneTimer = window.setTimeout(() => {
      document.body.classList.remove("intro-lock");
      try {
        sessionStorage.setItem("tg-bloomed", "1");
      } catch {
        /* private mode */
      }
      onComplete?.();
      setFinished(true);
    }, BLOOM_HOLD_MS + DOCK_DURATION_MS + 60);

    return () => {
      cancelAnimationFrame(raf);
      typeTimers.forEach((id) => window.clearTimeout(id));
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
      className={`typegarden-veil ${veil.isNight ? "is-night" : "is-day"}`}
      style={
        {
          "--tg-veil-top": veil.top,
          "--tg-veil-bot": veil.bot,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div ref={stageRef} className="typegarden-stage">
        <canvas ref={backRef} className="typegarden-canvas" />
        <div ref={wordRef} className="typegarden-word">
          {SEED_WORD.split("").map((ch, i) => (
            <span
              key={i}
              data-ch={ch}
              className={i < typedCount ? "is-typed" : ""}
            >
              {ch}
            </span>
          ))}
          <span
            className={`typegarden-caret ${typedCount >= SEED_WORD.length ? "is-done" : ""}`}
            aria-hidden="true"
          />
        </div>
        <canvas ref={frontRef} className="typegarden-canvas typegarden-canvas--front" />
      </div>
    </div>
  );
}
