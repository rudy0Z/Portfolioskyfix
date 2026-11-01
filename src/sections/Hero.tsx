"use client";

import { useEffect, useRef } from "react";
import { GardenField } from "./GardenField";
import { momentLabel } from "@/lib/timeOfDay";
import { useSkyTime } from "@/lib/useTimeOfDay";
import { Link } from "@/router/Router";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const t = useSkyTime();

  // Scroll progress through the pinned stage drives the garden's exit (--p).
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, travel)));
      stage.style.setProperty("--p", p.toFixed(4));
      document.documentElement.setAttribute("data-scrolled", p > 0.04 ? "true" : "false");
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
      <div ref={stageRef} className="hero-stage">
        <GardenField />

        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="hero-dot" aria-hidden />
            Rudraksh Singh
            <span className="hero-sep" aria-hidden>/</span>
            <span className="hero-moment">{momentLabel(t)}</span>
          </p>

          <h1 className="hero-title">
            <span>Product Designer</span>
            <span className="hero-title-alt">&amp; Engineer</span>
          </h1>

          <p className="hero-lede">
            Designing in the AI space and thinking in systems — building
            products end to end, from the first question to the shipped
            interface.
          </p>

          <div className="hero-actions">
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn btn-primary"
            >
              Selected work
            </a>
            <Link href="/about" className="btn btn-ghost">
              About studio
            </Link>
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
