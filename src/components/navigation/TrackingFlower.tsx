"use client";

import { useEffect, useRef, useState } from "react";

export interface TrackingFlowerProps {
  /** Whether the parent notch is in collapsed compact mode (48px pill) */
  isCompact?: boolean;
  /** Whether ambient audio is currently playing, triggering rhythmic core pulsing */
  isPlaying?: boolean;
  /** Section currently hovered in the navigation (for expressive color shifting) */
  hoveredSection?: string | null;
  /** Optional callback when user clicks the flower to bloom the fullscreen garden */
  onOpenFullscreen?: () => void;
  className?: string;
}

export function TrackingFlower({
  isCompact = false,
  isPlaying = false,
  hoveredSection,
  onOpenFullscreen,
  className = "",
}: TrackingFlowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Position offsets
  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
    tiltX: 0,
    tiltY: 0,
    distance: 0,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Viewport mouse tracking
  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let targetDist = 0;

    let currentX = 0;
    let currentY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Clamped pistil travel: Rmax = 4.5px with tanh distance damping
      const maxR = 4.5;
      const dampFactor = Math.tanh(dist / 280);
      targetX = Math.cos(angle) * maxR * dampFactor;
      targetY = Math.sin(angle) * maxR * dampFactor;
      targetDist = dist;

      // 3D perspective orientation: pitch (rotateX) clamped to ±20deg, yaw (rotateY) clamped to ±25deg
      const vh = window.innerHeight || 800;
      const vw = window.innerWidth || 1200;
      targetTiltX = Math.max(-20, Math.min(20, -(dy / vh) * 24));
      targetTiltY = Math.max(-25, Math.min(25, (dx / vw) * 28));
    };

    // Smooth physical spring-like damping loop
    const tick = () => {
      if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
        targetX = 0;
        targetY = 0;
      }
      const ease = 0.14; // smooth exponential decay
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentTiltX += (targetTiltX - currentTiltX) * ease;
      currentTiltY += (targetTiltY - currentTiltY) * ease;

      if (!Number.isFinite(currentX)) currentX = 0;
      if (!Number.isFinite(currentY)) currentY = 0;
      if (!Number.isFinite(currentTiltX)) currentTiltX = 0;
      if (!Number.isFinite(currentTiltY)) currentTiltY = 0;

      const delta =
        Math.abs(targetX - currentX) +
        Math.abs(targetY - currentY) +
        Math.abs(targetTiltX - currentTiltX) +
        Math.abs(targetTiltY - currentTiltY);

      if (delta > 0.02) {
        setOffset({
          x: currentX,
          y: currentY,
          tiltX: currentTiltX,
          tiltY: currentTiltY,
          distance: targetDist,
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Section-based reactive color for the core pistil
  const coreColor = hoveredSection === "Work"
    ? "#38bdf8" // sky blue
    : hoveredSection === "About"
    ? "#34d399" // emerald
    : hoveredSection === "Projects"
    ? "#f59e0b" // amber
    : hoveredSection === "Journal"
    ? "#a78bfa" // violet
    : hoveredSection === "Resume"
    ? "#ec4899" // rose pink
    : isPlaying
    ? "#10b981" // playing emerald
    : "#f43f5e"; // default botanical crimson

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={onOpenFullscreen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenFullscreen?.();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Type Garden Botanical Flower (Follows cursor · Click to bloom)"
      aria-label="Interactive Botanical Flower tracking cursor"
      className={`group relative flex items-center justify-center cursor-pointer select-none outline-none transition-transform duration-300 ${
        isCompact ? "w-9 h-9" : "w-8 h-8"
      } ${className}`}
      style={{
        perspective: "400px",
      }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: prefersReducedMotion
            ? "none"
            : `rotateX(${offset.tiltX.toFixed(2)}deg) rotateY(${offset.tiltY.toFixed(2)}deg)`,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className={`w-full h-full text-emerald-400 transition-all duration-500 ease-out ${
            isHovered ? "rotate-45 scale-110" : ""
          } ${isPlaying ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"}`}
          fill="none"
          stroke="currentColor"
        >
          {/* Subtle outer petal halo */}
          <circle
            cx="12"
            cy="12"
            r="10.5"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            className="opacity-30 group-hover:opacity-60 transition-opacity"
          />

          {/* Primary 8-Petal Botanical Rose Star */}
          <path
            d="M12 2C13.5 6 18 10.5 22 12C18 13.5 13.5 18 12 22C10.5 18 6 13.5 2 12C6 10.5 10.5 6 12 2Z"
            fill="currentColor"
            fillOpacity={isHovered ? 0.35 : 0.22}
            stroke="currentColor"
            strokeWidth="1.25"
            className="transition-all duration-300"
          />

          {/* Secondary Interlocking Diamond Foliage Petals */}
          <path
            d="M5 5C9 7 15 7 19 5C17 9 17 15 19 19C15 17 9 17 5 19C7 15 7 9 5 5Z"
            fill="currentColor"
            fillOpacity={isHovered ? 0.18 : 0.1}
            stroke="currentColor"
            strokeWidth="0.8"
            className="transition-all duration-300"
          />

          {/* Internal Stamens Ring */}
          <circle
            cx="12"
            cy="12"
            r="5"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.75"
            strokeDasharray="1.5 1.5"
          />

          {/* Cursor-Tracking Central Pistil (Pupil equivalent) */}
          <circle
            cx={12 + (prefersReducedMotion ? 0 : offset.x)}
            cy={12 + (prefersReducedMotion ? 0 : offset.y)}
            r={isHovered ? 3.2 : isPlaying ? 3.0 : 2.6}
            fill={coreColor}
            className="transition-all duration-75"
            style={{
              filter: `drop-shadow(0 0 6px ${coreColor})`,
            }}
          />

          {/* Secondary specular glint inside the pistil for living organ eye-depth */}
          <circle
            cx={11.2 + (prefersReducedMotion ? 0 : offset.x * 0.7)}
            cy={11.2 + (prefersReducedMotion ? 0 : offset.y * 0.7)}
            r="0.8"
            fill="#ffffff"
            className="opacity-80"
          />
        </svg>

        {/* Ambient pulse ring during music playback */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />
        )}
      </div>
    </div>
  );
}
