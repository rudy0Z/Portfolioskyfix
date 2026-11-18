"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/router/Router";
import { useSkyTime } from "@/lib/useTimeOfDay";
import { paletteAt } from "@/lib/skyPalette";
import { oklch } from "@/lib/color";
import type { OKLCH } from "@/lib/color";

/**
 * SiteFooter — the Sundial pavilion. A floating frosted-glass capsule resting
 * on the persistent sky: the directory on top, a living fluid aurora billowing
 * beneath the glass in the lower half, its colors poured straight from the
 * 24-hour solar model. "Say hello." is set giant, and hovering its letters
 * draws precision vector-inspection boxes over each glyph.
 */

const EMAIL = "rudraksh.singhh@outlook.com";

const STUDIO_LINKS = [
  { label: "Selected Work", href: "/#work" },
  { label: "Craft & Diurnal System", href: "/#craft" },
  { label: "Resume PDF ↗", href: "/resume.pdf", external: true },
];

const EXPLORE_LINKS = [
  { label: "01 · FlytBase Sentinel", href: "/case/sentinel" },
  { label: "02 · LokAI Legal Triage", href: "/case/lokai" },
  { label: "03 · Feul Marketplace", href: "/case/feul" },
];

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "https://x.com/rudrakshsinghh" },
  { label: "LinkedIn", href: "https://linkedin.com/in/rudraksh-singh" },
  { label: "GitHub", href: "https://github.com/rudy0Z" },
];

const boost = (c: OKLCH, lAdd: number, cMul: number) =>
  oklch({
    l: Math.min(0.93, Math.max(0.2, c.l + lAdd)),
    c: Math.min(0.32, c.c * cMul),
    h: c.h,
  });

/** Aurora bands — poured from the live sky, with one aurora-green at night. */
function auroraColors(t: number): string[] {
  const p = paletteAt(t);
  const night = t < 5.75 || t > 20.25;
  const warm = t > 16.4 && t < 20.0;
  if (night) {
    return [
      boost(p.mid, 0.16, 1.35),
      boost(p.zenith, 0.22, 1.5),
      "#34d399",
      boost(p.horizon, -0.02, 1.2),
    ];
  }
  if (warm) {
    return [
      boost(p.sunGlow, 0.02, 1.3),
      boost(p.horizon, 0.03, 1.35),
      boost(p.cloudRim, 0.0, 1.2),
      boost(p.mid, 0.04, 1.25),
    ];
  }
  return [
    boost(p.mid, 0.06, 1.3),
    boost(p.horizon, 0.02, 1.15),
    boost(p.cloudRim, 0.02, 1.2),
    boost(p.sunGlow, -0.04, 1.1),
  ];
}

/* ── the fluid aurora — thermal silk under frosted glass ─────────────────── */

function AuroraVeil() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const t = useSkyTime();
  const colors = useMemo(() => auroraColors(t), [t]);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const g = cv.getContext("2d");
    if (!g) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const blobs = [
      { ax: 0.22, ay: 0.42, r: 0.62, sx: 0.00021, sy: 0.00017, ph: 0.0, ci: 0 },
      { ax: 0.52, ay: 0.3, r: 0.8, sx: 0.00016, sy: 0.00023, ph: 1.7, ci: 1 },
      { ax: 0.78, ay: 0.5, r: 0.7, sx: 0.00019, sy: 0.00015, ph: 3.1, ci: 2 },
      { ax: 0.36, ay: 0.72, r: 0.66, sx: 0.00024, sy: 0.0002, ph: 4.4, ci: 3 },
      { ax: 0.64, ay: 0.85, r: 0.74, sx: 0.00014, sy: 0.00021, ph: 5.3, ci: 0 },
      { ax: 0.9, ay: 0.24, r: 0.5, sx: 0.00022, sy: 0.00018, ph: 2.6, ci: 1 },
    ];

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      // Low-res canvas, upscaled by CSS — the softness IS the aesthetic.
      w = Math.max(2, Math.round(Math.min(560, rect.width / 2.4)));
      h = Math.max(2, Math.round(Math.min(300, rect.height / 2.4)));
      cv.width = w;
      cv.height = h;
      // Setting width clears the canvas — repaint the static frame.
      draw(performance.now());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          // draw() keeps looping only when visible and motion is allowed;
          // under reduced motion it paints a single held frame.
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(wrap);

    function draw(now = 0) {
      if (!g) return;
      const cols = colorsRef.current;
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "screen";
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const col = cols[b.ci % cols.length];
        const x = (b.ax + Math.sin(now * b.sx + b.ph) * 0.16) * w;
        const y = (b.ay + Math.cos(now * b.sy + b.ph) * 0.14) * h;
        const r = b.r * Math.max(w, h) * (0.9 + 0.12 * Math.sin(now * 0.0004 + b.ph));
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, col);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.globalAlpha = 0.34;
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      if (visibleRef.current && !reduced) raf = requestAnimationFrame(draw);
    }

    // Static first frame (also the reduced-motion state — silk, frozen).
    draw(1200);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="foot-aurora" aria-hidden="true">
      <canvas ref={canvasRef} className="foot-aurora-canvas" />
      <div className="foot-aurora-sheen" />
    </div>
  );
}

/* ── vector inspection hover on the giant "Say hello." ───────────────────── */

interface InspectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
  ch: string;
}

function SayHello({ onSay }: { onSay: () => void }) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<InspectionBox | null>(null);

  const inspect = (el: HTMLElement) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // Clamp inside the wrap so the tag never clips off-screen on mobile.
    const x = Math.max(
      6,
      Math.min(Math.round(r.left - wr.left), Math.round(wr.width - r.width - 6)),
    );
    setBox({
      x,
      y: Math.round(r.top - wr.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
      ch: el.dataset.ch || "",
    });
  };

  return (
    <div className="foot-say-wrap">
      {/* A real button — "Say hello." was a <p onClick>, unreachable by
          keyboard and screen readers (synthesis P0 6). Same visual. */}
      <button
        ref={wrapRef}
        type="button"
        className="foot-say"
        onClick={onSay}
        aria-label="Say hello — copies the email address and opens your mail app"
      >
        {"Say hello.".split("").map((ch, i) => (
          <span
            key={i}
            data-ch={ch === " " ? "·" : ch}
            aria-hidden="true"
            onMouseEnter={(e) => inspect(e.currentTarget)}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </button>

      {box && (
        <div className="foot-inspect" aria-hidden="true">
          <svg
            width={box.w + 14}
            height={box.h + 14}
            style={{ left: box.x - 7, top: box.y - 7 }}
          >
            <rect
              x="3.5"
              y="3.5"
              width={box.w + 7}
              height={box.h + 7}
              fill="none"
              stroke="rgba(255,236,199,0.75)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            {[
              [3.5, 3.5],
              [box.w + 10.5, 3.5],
              [3.5, box.h + 10.5],
              [box.w + 10.5, box.h + 10.5],
            ].map(([cx, cy], i) => (
              <g key={i} stroke="rgba(255,236,199,0.9)" strokeWidth="1">
                <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} />
                <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} />
              </g>
            ))}
          </svg>
          <span className="foot-inspect-tag" style={{ left: box.x - 7, top: box.y + box.h + 14 }}>
            [{box.x}, {box.y}] · {box.w}×{box.h}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── the pavilion ────────────────────────────────────────────────────────── */

export function SiteFooter() {
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const update = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  const sayHello = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      /* clipboard unavailable — the mailto still opens */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
    window.location.href = `mailto:${EMAIL}?subject=Hello%20Rudraksh`;
  };

  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Work lives on the home page. From any other route a bare "/#work" falls
  // through the router into /404, so go home first, then scroll to the section
  // once React has actually rendered it.
  const goToWork = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const el = document.getElementById("work");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.hash = "/";
    let tries = 12;
    const tryScroll = () => {
      const target = document.getElementById("work");
      // instant: "auto" would inherit html's smooth scroll-behavior and the
      // route-change DOM swap aborts smooth scrolls mid-flight — land like a
      // classic cross-page anchor instead
      if (target) target.scrollIntoView({ behavior: "instant" });
      else if (tries-- > 0) setTimeout(tryScroll, 140);
    };
    setTimeout(tryScroll, 120);
  };

  return (
    <footer id="contact" className="site-foot">
      {/* Alias anchor so older /#crater deep links still land here. */}
      <span id="crater" aria-hidden="true" className="absolute top-0" />

      {/* One shell container — the pavilion's glass edge sits on the shared
          site content edge (synthesis P0 8). */}
      <div className="shell">
        <div className="foot-pavilion" data-reveal>
          <div className="foot-pavilion-inner">
          {/* CTA */}
          <div className="foot-cta">
            <p className="microlabel">
              New inboxes, always open <span className="microlabel-rule" aria-hidden="true" />
            </p>
            <SayHello onSay={sayHello} />
            <div className="site-foot-contact">
              <a className="site-foot-mail" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
              <button
                type="button"
                className="site-foot-copy"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(EMAIL);
                  } catch {
                    /* noop */
                  }
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2400);
                }}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
              {copied && <span className="foot-toast">Email copied — talk soon.</span>}
            </div>
          </div>

          {/* Upper glass directory */}
          <div className="foot-directory">
            <div className="foot-id">
              <p className="foot-brand">
                <span className="foot-brand-mark" aria-hidden="true">✿</span> Rudraksh Singh
              </p>
              <p className="foot-blurb">
                Product designer &amp; engineer — building decision-heavy
                interfaces for autonomous systems, and every prototype in code.
              </p>
              <p className="foot-time">
                <span className="foot-live-dot" aria-hidden="true" /> Greater Noida, India ·{" "}
                <strong>{clock || "--:--"}</strong> IST · Open to roles
              </p>
            </div>

            <nav aria-label="Studio">
              <p className="foot-col-title">Studio</p>
              <ul className="foot-list">
                {STUDIO_LINKS.map((l) => (
                  <li key={l.label}>
                    {l.href === "/#work" ? (
                      <a href="/#work" onClick={goToWork}>
                        {l.label}
                      </a>
                    ) : l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Explore">
              <p className="foot-col-title">Explore</p>
              <ul className="foot-list">
                {EXPLORE_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="foot-col-title">Social</p>
              <ul className="foot-list">
                {SOCIAL_LINKS.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label} <span className="ext">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Living aurora + base row riding on it */}
          <div className="foot-aurora-zone">
            <AuroraVeil />
            <div className="site-foot-base">
              <span>© {new Date().getFullYear()} Rudraksh Singh</span>
              <span className="foot-aurora-label">Aurora follows the live 24-hour sky</span>
              <button type="button" className="foot-top" onClick={backToTop}>
                <span>Back to top</span>
                <span className="up" aria-hidden="true">↑</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
