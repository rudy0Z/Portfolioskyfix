"use client";

import { useEffect, useRef } from "react";
import { GardenField } from "./GardenField";
import { HeroMist } from "./HeroMist";
import { EXIT_LITE, heroClock } from "@/lib/heroClock";

/* Easing set for the exit timeline (hero plan §6.2). */
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

  // Scroll progress through the pinned stage drives the garden's exit (--p)
  // and the ONE master timeline every part of the exit reads: --hero-p on
  // :root plus eased phase sub-progressions (push / swallow / handoff / copy),
  // the sky's cloud lift (heroClock, read by PhotoSky), and the works
  // section's entry band opacity.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    // prefers-reduced-motion: the three-phase choreography compresses to a
    // plain scroll-tied fade (all phases key off one linear progression).
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

      // Shared clock for the sky (PhotoSky reads this — no CSS parsing).
      heroClock.p = p;
      heroClock.active = true;
      heroClock.lift = lite ? Math.min(1, window.scrollY / (window.innerHeight * 2.4)) : easeInOutCubic(p);

      if (lite) return; // old behaviour: only --p and the raw-y lift

      const root = document.documentElement.style;
      if (reduced) {
        // Compressed fade: one linear progression drives everything. The copy
        // leg runs steeper so no readable remnant survives mid-exit (same
        // no-ghost rule as the full choreography).
        const fade = clamp01((p - 0.15) / 0.6);
        root.setProperty("--hero-p", p.toFixed(4));
        root.setProperty("--hero-push", clamp01(p / 0.3).toFixed(4));
        root.setProperty("--hero-swallow", fade.toFixed(4));
        root.setProperty("--hero-handoff", clamp01((p - 0.4) / 0.6).toFixed(4));
        root.setProperty("--hero-copy", clamp01((p - 0.15) / 0.35).toFixed(4));
      } else {
        // Phase A — push (0 → 0.3): mist band rises, copy starts lifting.
        const push = easeOutCubic(clamp01(p / 0.3));
        // Phase B — swallow (0.3 → 0.75): bottom-up mask dissolve.
        const swallow = easeInOutCubic(clamp01((p - 0.3) / 0.45));
        // Phase C — handoff (0.75 → 1): mist dissipates upward, works arrives.
        const handoff = easeInOutCubic(clamp01((p - 0.75) / 0.25));
        // Copy exit: starts 0.15, fully out ~0.6 (depth-of-field rise).
        const copy = smooth01((p - 0.15) / 0.45);
        root.setProperty("--hero-p", p.toFixed(4));
        root.setProperty("--hero-push", push.toFixed(4));
        root.setProperty("--hero-swallow", swallow.toFixed(4));
        root.setProperty("--hero-handoff", handoff.toFixed(4));
        root.setProperty("--hero-copy", copy.toFixed(4));
      }

      // Works entry (Phase C handoff): the works section's top == this
      // section's bottom; `enter` runs 0 → 1 while it crosses the viewport.
      // The haze band fades in fast (cards meet mist, not sky) and is gone
      // before the section settles.
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

  // Pointer position (-1…1) for a little depth parallax between garden layers.
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
        {!EXIT_LITE && <HeroMist />}

        {/* Floating frosted white hero card from new-visual-scroll-800.png */}
        <div className="hero-card">
          <div className="hero-card-kicker">
            <span className="hero-card-kicker-dot" aria-hidden="true" />
            Greater Noida, India · Open to Product Design Roles
          </div>

          <h1 className="hero-card-title">
            Hi, I’m Rudraksh —<br />
            a product designer<br />
            who builds <span className="hero-card-title-accent">in code.</span>
          </h1>

          <p className="hero-card-lede">
            I design decision-critical AI interfaces and prototype the hardest edge cases directly in React &amp; TypeScript, so what gets designed actually holds up in production.
          </p>

          <div className="hero-card-actions">
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hero-btn-dark"
            >
              Explore selected work ↓
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-ghost"
            >
              Resume PDF ↗
            </a>
          </div>
        </div>

        {/* Replaces the legacy "underside thrusters / mech keel" reveal hint;
            the hero now just invites the visitor down to the work. */}
        <div className="hero-hint" aria-hidden>
          <span className="hero-hint-line" />
          <span className="hero-hint-text">Scroll to selected work</span>
        </div>
      </div>
    </section>
  );
}
