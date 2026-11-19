"use client";

import { useEffect, useRef } from "react";
import { GardenField } from "./GardenField";
import { HeroMist } from "./HeroMist";
import { EXIT_LITE, heroClock } from "@/lib/heroClock";

/* Easing set for the rising cloud-mist horizon exit timeline. */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth01 = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Scroll progress through the pinned stage drives the meadow's horizon mist
  // curtain (--p, --hero-push/swallow/handoff/copy) and the sky's cloud lift.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lite = EXIT_LITE;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, travel)));
      stage.style.setProperty("--p", p.toFixed(4));
      document.documentElement.setAttribute("data-scrolled", p > 0.04 ? "true" : "false");

      heroClock.p = p;
      heroClock.active = true;
      heroClock.lift = lite ? Math.min(1, window.scrollY / (window.innerHeight * 2.4)) : easeInOutCubic(p);

      if (lite) return;

      const root = document.documentElement.style;
      if (reduced) {
        const fade = clamp01((p - 0.15) / 0.6);
        root.setProperty("--hero-p", p.toFixed(4));
        root.setProperty("--hero-push", clamp01(p / 0.3).toFixed(4));
        root.setProperty("--hero-swallow", fade.toFixed(4));
        root.setProperty("--hero-handoff", clamp01((p - 0.4) / 0.6).toFixed(4));
        root.setProperty("--hero-copy", clamp01((p - 0.15) / 0.35).toFixed(4));
      } else {
        // Phase A — horizon mist swells upward (0 → 0.34)
        const push = easeOutCubic(clamp01(p / 0.34));
        // Phase B — cloud-mist curtain lifts across the meadow (0.24 → 0.76)
        const swallow = easeInOutCubic(clamp01((p - 0.24) / 0.52));
        // Phase C — mist parts upward to reveal Selected Work (0.72 → 1.0)
        const handoff = easeInOutCubic(clamp01((p - 0.72) / 0.28));
        // Editorial headline lifts gently into the clouds (0.10 → 0.52)
        const copy = smooth01((p - 0.1) / 0.42);
        root.setProperty("--hero-p", p.toFixed(4));
        root.setProperty("--hero-push", push.toFixed(4));
        root.setProperty("--hero-swallow", swallow.toFixed(4));
        root.setProperty("--hero-handoff", handoff.toFixed(4));
        root.setProperty("--hero-copy", copy.toFixed(4));
      }

      const vh = window.innerHeight;
      const enter = clamp01((vh - rect.bottom) / vh);
      const band = Math.min(enter * 3.5, (1 - enter) * 3);
      root.setProperty("--works-enter-o", clamp01(band).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      heroClock.active = false;
    };
  }, []);

  // Pointer position (-1…1) for subtle depth parallax between meadow layers.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      stage.style.setProperty("--mx", nx.toFixed(3));
      stage.style.setProperty("--my", ny.toFixed(3));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <section ref={sectionRef} className="hero" data-hud-section="Home">
      <div
        ref={stageRef}
        className="hero-stage"
        data-exit={EXIT_LITE ? "lite" : "clock"}
      >
        <GardenField />

        {/* Invisible feathered atmospheric luminance veil behind the open type */}
        <div className="hero-sky-veil" aria-hidden="true" />

        {/* Open editorial typography directly over the live sky (no floating box) */}
        <div className="shell hero-editorial-shell">
          <div className="hero-editorial">
            <p className="hero-eyebrow">
              Greater Noida, India · Product Design &amp; Code
            </p>

            <h1 className="hero-title">
              Hi, I’m Rudraksh —<br />
              a product designer<br />
              who builds <em>in code.</em>
            </h1>

            <p className="hero-lede">
              Designing decision-critical AI interfaces and prototyping the hardest edge cases
              directly in React &amp; TypeScript.
            </p>

            <div className="hero-actions">
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hero-btn-primary"
              >
                Selected work <span aria-hidden="true">↓</span>
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn-secondary"
              >
                Resume PDF <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Rising layered horizon cloud-mist curtain (sweeps up on scroll) */}
        {!EXIT_LITE && <HeroMist />}

        {/* Quiet scroll cue */}
        <div className="hero-hint" aria-hidden="true">
          <span className="hero-hint-line" />
          <span className="hero-hint-text">Scroll to selected work</span>
        </div>
      </div>
    </section>
  );
}
