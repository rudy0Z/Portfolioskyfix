"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/router/Router";
import { useSkyTime } from "@/lib/useTimeOfDay";
import {
  buildWordmarkGarden,
  pickRandomWordmarkPreset,
  renderWordmarkGarden,
  type BotanicalPointer,
  type GlyphSlot,
  type WordmarkGarden,
} from "@/components/botanical/BotanicalWordmarkEngine";

/**
 * SiteFooter — Unified Serene Editorial Floral Footer.
 *
 * Zero garden control buttons or toolbars. Instead:
 * 1. Clean alabaster (day) / deep obsidian (night) rounded editorial container
 *    housing a calm contact header, copyable email, Resume PDF, and social links.
 * 2. Centered monumental serif `Rudraksh` wordmark woven behind & in front with
 *    our 4-species meadow flowers (lupine, cosmos, poppy, daisy) via the shared
 *    BotanicalWordmarkEngine.
 * 3. Smoothly blooms into place when scrolled into view, automatically choosing
 *    one random TypeGarden choreography preset per visit (`breathe`, `growWither`,
 *    `scatter`, `reach`, `visitor`, `gust`), always layered with subtle ambient
 *    breath/gust and silky mouse-interactive flower sway.
 */

const EMAIL = "rudraksh.singhh@outlook.com";
const WORDMARK = "rudraksh";

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "https://x.com/rudrakshsinghh" },
  { label: "GitHub", href: "https://github.com/rudy0Z" },
  { label: "LinkedIn", href: "https://linkedin.com/in/rudraksh-singh" },
];

export function SiteFooter() {
  const skyTime = useSkyTime();
  const isNight = skyTime < 6.0 || skyTime > 18.6;

  const [copied, setCopied] = useState(false);
  const [istClock, setIstClock] = useState("");
  const [hasArrived, setHasArrived] = useState(false);

  // Pick one random choreography preset per visit
  const activePreset = useMemo(() => pickRandomWordmarkPreset(), []);

  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const isNightRef = useRef(isNight);
  isNightRef.current = isNight;

  useEffect(() => {
    const update = () =>
      setIstClock(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const id = window.setInterval(update, 15000);
    return () => window.clearInterval(id);
  }, []);

  const copyEmail = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(EMAIL).catch(() => {
        /* fallback silent */
      });
    }
  };

  const backToSky = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Living 4-species botanical weave around monumental serif Rudraksh
  useEffect(() => {
    const stage = stageRef.current;
    const word = wordRef.current;
    const back = backRef.current;
    const front = frontRef.current;
    if (!stage || !word || !back || !front) return;
    const gb = back.getContext("2d");
    const gf = front.getContext("2d");
    if (!gb || !gf) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let garden: WordmarkGarden | null = null;
    let visible = false;
    let bloomStartTs: number | null = null;
    let lastTs = performance.now();
    let raf = 0;

    const pointer: BotanicalPointer = { x: 0, y: 0, active: false };
    const gardenSeed = (Date.now() ^ 0x2c1b3c6d) & 0xfffffff;

    const measure = () => {
      const sr = stage.getBoundingClientRect();
      const w = Math.max(1, sr.width);
      const h = Math.max(1, sr.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const cv of [back, front]) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }

      const spans = Array.from(word.querySelectorAll<HTMLElement>("[data-footer-ch]"));
      const slots: GlyphSlot[] = spans.map((sp, i) => {
        const r = sp.getBoundingClientRect();
        return {
          cx: r.left - sr.left + r.width / 2,
          baseY: r.bottom - sr.top - r.height * 0.14,
          topY: r.top - sr.top + r.height * 0.12,
          w: r.width,
          h: r.height,
          delayMs: 60 + i * 75,
        };
      });

      garden = buildWordmarkGarden(slots, w, h, {
        seed: gardenSeed,
        preset: activePreset,
        density: "footer",
      });

      // Paint one static frame immediately if reduced-motion or already arrived
      if (reduced || bloomStartTs !== null) {
        renderWordmarkGarden(garden, gb, gf, reduced ? 4000 : performance.now() - (bloomStartTs ?? 0), 0.016, pointer, {
          dpr,
          isNight: isNightRef.current,
          reducedMotion: reduced,
        });
      }
    };

    const render = (now: number) => {
      raf = 0;
      if (!visible || !garden) return;
      if (bloomStartTs === null) bloomStartTs = now;
      const elapsed = now - bloomStartTs;
      const dtMs = now - lastTs;
      const minInterval = pointer.active || elapsed < 3200 ? 15 : 33;
      if (dtMs < minInterval) {
        if (!reduced) raf = requestAnimationFrame(render);
        return;
      }
      const dt = Math.min(0.05, dtMs / 1000);
      lastTs = now;
      renderWordmarkGarden(garden, gb, gf, elapsed, dt, pointer, {
        dpr,
        isNight: isNightRef.current,
        reducedMotion: reduced,
      });
      if (!reduced) {
        raf = requestAnimationFrame(render);
      }
    };

    const wake = () => {
      if (!raf && visible && garden) {
        lastTs = performance.now();
        raf = requestAnimationFrame(render);
      }
    };

    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);

    // Wait for fonts before initial glyph measurement so stems align accurately
    measure();
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          setHasArrived(true);
          if (bloomStartTs === null) bloomStartTs = performance.now();
          wake();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.08 },
    );
    io.observe(stage);

    const onPointerMove = (e: PointerEvent) => {
      const sr = stage.getBoundingClientRect();
      pointer.x = e.clientX - sr.left;
      pointer.y = e.clientY - sr.top;
      pointer.active = true;
      wake();
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [activePreset]);

  return (
    <footer id="contact" className={`site-foot-editorial ${isNight ? "is-night" : "is-day"}`}>
      {/* Legacy alias anchor */}
      <span id="crater" aria-hidden="true" className="absolute top-0" />

      <div className="shell foot-inner">
        {/* 1. Calm Top Contact Strip */}
        <div className="foot-contact-row" data-reveal>
          <div className="foot-contact-copy">
            <p className="foot-eyebrow">Product Design &amp; Code · 2026</p>
            <h2 className="foot-headline">
              Have a product, team, or prototype in mind?
            </h2>
            <p className="foot-location">
              Greater Noida, India · <span className="tabular-nums">{istClock || "--:--"} IST</span>
            </p>
          </div>

          <div className="foot-contact-actions">
            <div className="foot-action-primary">
              <button
                type="button"
                className="foot-email-btn"
                onClick={copyEmail}
                aria-label={`Copy ${EMAIL} to clipboard`}
              >
                <span>{copied ? "Copied to clipboard ✓" : EMAIL}</span>
                {!copied && (
                  <span className="foot-copy-glyph" aria-hidden="true">
                    ⧉
                  </span>
                )}
              </button>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="foot-resume-btn"
              >
                Resume ↗
              </a>
            </div>

            <div className="foot-social-row" aria-label="Social links">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="foot-social-link"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="foot-rule" />

        {/* 2. Monumental Living Floral Wordmark Stage (Akshat TypeGarden proportions, zero toolbar) */}
        <div
          ref={stageRef}
          className={`foot-flora-stage ${hasArrived ? "is-arrived" : ""}`}
          data-preset={activePreset}
        >
          <canvas ref={backRef} className="foot-flora-canvas" aria-hidden="true" />
          <div ref={wordRef} className="foot-wordmark" aria-label="rudraksh">
            {WORDMARK.split("").map((ch, idx) => (
              <span key={idx} data-footer-ch={ch} aria-hidden="true">
                {ch}
              </span>
            ))}
          </div>
          <canvas
            ref={frontRef}
            className="foot-flora-canvas foot-flora-canvas--front"
            aria-hidden="true"
          />
        </div>

        <hr className="foot-rule" />

        {/* 3. Quiet Minimal Colophon & Back to Sky */}
        <div className="foot-meta-row">
          <div className="foot-meta-left">
            <span>© {new Date().getFullYear()} Rudraksh Singh</span>
            <span className="foot-meta-sep" aria-hidden="true">·</span>
            <nav className="foot-meta-cases" aria-label="Case studies">
              <Link href="/case/sentinel">Sentinel</Link>
              <Link href="/case/lokai">LokAI</Link>
              <Link href="/case/feul">Feul</Link>
            </nav>
          </div>

          <button type="button" className="foot-top-btn" onClick={backToSky}>
            <span aria-hidden="true">↑</span> Back to sky
          </button>
        </div>
      </div>
    </footer>
  );
}
