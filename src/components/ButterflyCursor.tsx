import { useEffect, useRef } from "react";

export function ButterflyCursor({ enabled = true }: { enabled?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftWingRef = useRef<SVGGElement>(null);
  const rightWingRef = useRef<SVGGElement>(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const loop = () => {
      // Gentle spring follow
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      currentPos.current.x += dx * 0.14;
      currentPos.current.y += dy * 0.14;

      const flutter = Math.sin(Date.now() * 0.014) * 25; // Wing flutter angle
      const scaleX = 1 - Math.abs(flutter) / 45;

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${currentPos.current.x + 14}px, ${currentPos.current.y - 14}px, 0)`;
        wrapperRef.current.style.opacity = currentPos.current.x > 0 ? "0.9" : "0";
      }

      if (leftWingRef.current) {
        leftWingRef.current.style.transform = `scaleX(${scaleX})`;
      }
      if (rightWingRef.current) {
        rightWingRef.current.style.transform = `scaleX(${scaleX})`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapperRef}
      className="butterfly-cursor-wrapper fixed top-0 left-0 pointer-events-none z-[999] transition-opacity duration-200 will-change-transform"
      style={{
        transform: `translate3d(-100px, -100px, 0)`,
        opacity: 0,
      }}
    >
      <svg viewBox="0 0 32 32" className="w-6 h-6 overflow-visible drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]">
        {/* Left Wing */}
        <g ref={leftWingRef} style={{ transformOrigin: "16px 16px" }}>
          <path
            d="M 16 16 C 10 6, 2 8, 4 18 C 5 24, 12 22, 16 17 Z"
            fill="#fbbf24"
            fillOpacity="0.8"
            stroke="#f59e0b"
            strokeWidth="0.75"
          />
          <circle cx="8" cy="14" r="1.5" fill="#f43f5e" />
        </g>

        {/* Right Wing */}
        <g ref={rightWingRef} style={{ transformOrigin: "16px 16px" }}>
          <path
            d="M 16 16 C 22 6, 30 8, 28 18 C 27 24, 20 22, 16 17 Z"
            fill="#fbbf24"
            fillOpacity="0.8"
            stroke="#f59e0b"
            strokeWidth="0.75"
          />
          <circle cx="24" cy="14" r="1.5" fill="#f43f5e" />
        </g>

        {/* Slender Body */}
        <line x1="16" y1="10" x2="16" y2="22" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        {/* Antennae */}
        <path d="M 16 10 Q 14 6, 12 5" stroke="#1e293b" strokeWidth="0.75" fill="none" />
        <path d="M 16 10 Q 18 6, 20 5" stroke="#1e293b" strokeWidth="0.75" fill="none" />
      </svg>
    </div>
  );
}
