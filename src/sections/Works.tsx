"use client";

/**
 * Works — selected work as architectural glass pavilions over the living sky.
 *
 * The conflict is the point: soft organic cloud behind, hyper-rigid Swiss grid
 * in front. Cards are translucent glass with hairline borders, numbered, and
 * set on a strict 12-column rhythm. They lift and settle as they enter the
 * viewport, but never bounce — motion is a slow parallax, not an entrance.
 */

import { useEffect, useRef } from "react";

interface Project {
  index: string;
  title: string;
  discipline: string;
  year: string;
  summary: string;
  href: string;
  tag: string;
}

const PROJECTS: Project[] = [
  {
    index: "01",
    title: "Atmospheric Interfaces",
    discipline: "Product · Design systems",
    year: "2026",
    summary:
      "A design language for products that respond to place and time — ambient surfaces, adaptive typography, and a token system that survives every lighting condition.",
    href: "#",
    tag: "Case study",
  },
  {
    index: "02",
    title: "The Quiet Tool",
    discipline: "AI · Interaction",
    year: "2025",
    summary:
      "An AI writing surface designed around interruption instead of completion. Shipped end to end, from research through the type ramp.",
    href: "#",
    tag: "Case study",
  },
  {
    index: "03",
    title: "Field Notes",
    discipline: "Editorial · Web",
    year: "2025",
    summary:
      "A long-form publishing system for a research studio — typographic grid, print-derived plate system, and a CMS that gets out of the way.",
    href: "#",
    tag: "Case study",
  },
  {
    index: "04",
    title: "Strata",
    discipline: "Data · Visualisation",
    year: "2024",
    summary:
      "Geological time as an interactive top layer. A visualisation engine for layered records, built for a science museum installation.",
    href: "#",
    tag: "Case study",
  },
];

/** Scroll-linked parallax, transform-only. */
function useSettle() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const cards = el.querySelectorAll<HTMLElement>("[data-card]");
      const vh = window.innerHeight;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const enter = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7)));
        const p = reduced ? 1 : enter;
        card.style.setProperty("--settle", p.toFixed(3));
        card.style.transform = `translate3d(0, ${((1 - p) * 44).toFixed(1)}px, 0)`;
        card.style.opacity = String(0.15 + p * 0.85);
      });
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
  return ref;
}

export function Works() {
  const ref = useSettle();

  return (
    <section id="work" ref={ref} className="works" data-hud-section="Selected works">
      <div className="works-inner">
        <header className="works-head">
          <p className="works-kicker">
            <span>Selected works</span>
            <span className="works-kicker-rule" aria-hidden />
            <span>{PROJECTS.length} of 12</span>
          </p>
          <h2 className="works-title">
            Built to sit in the air.
          </h2>
          <p className="works-lede">
            Structural, quiet, and deliberately few. Each project is a system:
            a question, a grid, and the smallest interface that answers it.
          </p>
        </header>

        <div className="works-grid">
          {PROJECTS.map((p, i) => (
            <a
              key={p.index}
              href={p.href}
              data-card
              className="work-card"
              style={{ ["--i" as string]: i }}
            >
              <div className="work-card-top">
                <span className="work-index">{p.index}</span>
                <span className="work-tag">{p.tag}</span>
              </div>

              <div className="work-plate" aria-hidden>
                {/* a small architectural glyph: layered pavilion elevation */}
                <svg viewBox="0 0 200 120" className="work-plate-svg">
                  <line x1="6" y1="98" x2="194" y2="98" stroke="currentColor" strokeWidth="0.75" />
                  {[0, 1, 2].map((k) => (
                    <rect
                      key={k}
                      x={22 + k * 10}
                      y={34 + k * 20}
                      width={156 - k * 20}
                      height={18}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      opacity={0.85 - k * 0.22}
                    />
                  ))}
                  <line x1="100" y1="18" x2="100" y2="98" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
                </svg>
              </div>

              <div className="work-body">
                <h3 className="work-title">{p.title}</h3>
                <p className="work-summary">{p.summary}</p>
              </div>

              <footer className="work-card-foot">
                <span>{p.discipline}</span>
                <span className="work-year">{p.year}</span>
              </footer>
            </a>
          ))}
        </div>

        <footer className="works-foot">
          <p>More work available on request.</p>
          <a href="mailto:hello@example.com" className="works-more">
            Get in touch <span aria-hidden>→</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
