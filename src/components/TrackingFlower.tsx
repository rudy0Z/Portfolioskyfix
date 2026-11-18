"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TrackingFlower — the living mark beside the wordmark. A small botanical
 * rosette whose central pistil follows the cursor with spring damping (an
 * organic pupil), flares its specular rim on hover, and blooms a ripple ring
 * when clicked (which also offers replaying the intro bloom).
 */

export interface TrackingFlowerProps {
  /** Click affordance — replaying the intro bloom, per the docked logo. */
  onActivate?: () => void;
  className?: string;
}

export function TrackingFlower({ onActivate, className = "" }: TrackingFlowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
  const [hovered, setHovered] = useState(false);
  const [rippling, setRipling] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const l = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", l);
    return () => mq.removeEventListener("change", l);
  }, []);

  // Cursor tracking with exponential spring damping — the pistil is a pupil.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let tTx = 0;
    let tTy = 0;
    let cx = 0;
    let cy = 0;
    let cTx = 0;
    let cTy = 0;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const maxR = 3.6;
      const damp = Math.tanh(dist / 260);
      tx = (dx / dist) * maxR * damp;
      ty = (dy / dist) * maxR * damp;
      tTx = Math.max(-18, Math.min(18, -(dy / window.innerHeight) * 22));
      tTy = Math.max(-22, Math.min(22, (dx / window.innerWidth) * 26));
    };

    const tick = () => {
      const ease = 0.14;
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      cTx += (tTx - cTx) * ease;
      cTy += (tTy - cTy) * ease;
      const delta =
        Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(tTx - cTx) + Math.abs(tTy - cTy);
      if (delta > 0.02) setOffset({ x: cx, y: cy, tiltX: cTx, tiltY: cTy });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const activate = () => {
    setRipling(true);
    setTimeout(() => setRipling(false), 620);
    onActivate?.();
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Replay the bloom"
      aria-label="Replay the intro bloom"
      className={`tracking-flower relative flex items-center justify-center cursor-pointer select-none outline-none ${
        hovered ? "is-hovered" : ""
      } ${className}`}
      style={{ perspective: "360px" }}
    >
      <div
        className="tracking-flower-stage"
        style={{
          transform: reduced
            ? "none"
            : `rotateX(${offset.tiltX.toFixed(2)}deg) rotateY(${offset.tiltY.toFixed(2)}deg)`,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {/* faint outer halo */}
          <circle cx="12" cy="12" r="10.5" strokeWidth="0.5" strokeDasharray="2 2" className="tf-halo" />
          {/* 4-petal glass rosette */}
          <path
            d="M12 2C13.5 6 18 10.5 22 12C18 13.5 13.5 18 12 22C10.5 18 6 13.5 2 12C6 10.5 10.5 6 12 2Z"
            className="tf-petal"
          />
          {/* interlocking diamond foliage */}
          <path
            d="M5 5C9 7 15 7 19 5C17 9 17 15 19 19C15 17 9 17 5 19C7 15 7 9 5 5Z"
            className="tf-foliage"
          />
          {/* stamen ring */}
          <circle cx="12" cy="12" r="5" className="tf-stamens" />
          {/* cursor-tracking pistil + specular glint */}
          <circle
            cx={12 + (reduced ? 0 : offset.x)}
            cy={12 + (reduced ? 0 : offset.y)}
            r={hovered ? 3 : 2.5}
            className="tf-pistil"
          />
          <circle
            cx={11.2 + (reduced ? 0 : offset.x * 0.7)}
            cy={11.2 + (reduced ? 0 : offset.y * 0.7)}
            r="0.8"
            className="tf-glint"
          />
        </svg>
        {rippling && <span className="tf-ripple" aria-hidden="true" />}
      </div>
    </div>
  );
}
