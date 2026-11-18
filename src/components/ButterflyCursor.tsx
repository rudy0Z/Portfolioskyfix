import { useEffect, useRef } from "react";

/**
 * ButterflyCursor — the garden's living cursor: a small butterfly with a
 * spring-damped flight and fluttering wings, now trailing a wake of soft
 * glowing pollen motes that drift upward and dissipate into the air.
 */

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  r: number;
  hue: number;
}

export function ButterflyCursor({ enabled = true }: { enabled?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftWingRef = useRef<SVGGElement>(null);
  const rightWingRef = useRef<SVGGElement>(null);
  const pollenRef = useRef<HTMLCanvasElement>(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const motesRef = useRef<Mote[]>([]);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };

      // emit pollen along the flight path (throttled)
      const now = performance.now();
      if (!reduced && now - lastSpawnRef.current > 85 && motesRef.current.length < 22) {
        lastSpawnRef.current = now;
        motesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.25 - Math.random() * 0.45,
          born: now,
          life: 1200 + Math.random() * 700,
          r: 1.4 + Math.random() * 2.2,
          hue: Math.random() < 0.5 ? 48 : 199, // dewdrop gold / starlight azure
        });
      }
    };

    const pollen = pollenRef.current;
    const pg = pollen?.getContext("2d") ?? null;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);

    const resize = () => {
      if (!pollen) return;
      pollen.width = Math.round(window.innerWidth * dpr);
      pollen.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let pollenClean = true; // skip canvas work entirely when no motes live

    const loop = (now: number) => {
      // Gentle spring follow
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      currentPos.current.x += dx * 0.14;
      currentPos.current.y += dy * 0.14;

      const flutter = Math.sin(now * 0.014) * 25; // Wing flutter angle
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

      // Pollen wake — soft glowing motes rising and dissipating.
      // Idle-skip: with no motes alive the canvas is left untouched.
      if (pg) {
        const motes = motesRef.current;
        if (motes.length === 0) {
          if (!pollenClean) {
            pg.setTransform(dpr, 0, 0, dpr, 0, 0);
            pg.clearRect(0, 0, window.innerWidth, window.innerHeight);
            pollenClean = true;
          }
        } else {
          pollenClean = false;
          pg.setTransform(dpr, 0, 0, dpr, 0, 0);
          pg.clearRect(0, 0, window.innerWidth, window.innerHeight);
          pg.globalCompositeOperation = "screen";
          for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i];
          const age = now - m.born;
          if (age > m.life) {
            motes.splice(i, 1);
            continue;
          }
          m.x += m.vx;
          m.y += m.vy;
          m.vx += Math.sin((now + i * 380) * 0.001) * 0.012; // gentle wander
          const fade = 1 - age / m.life;
          const r = m.r * (0.7 + fade * 0.6);
          const grad = pg.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 3);
          grad.addColorStop(0, `hsla(${m.hue}, 90%, 80%, ${0.5 * fade})`);
          grad.addColorStop(1, "hsla(0, 0%, 100%, 0)");
          pg.fillStyle = grad;
          pg.beginPath();
          pg.arc(m.x, m.y, r * 3, 0, Math.PI * 2);
          pg.fill();
          }
          pg.globalCompositeOperation = "source-over";
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={pollenRef}
        className="pollen-canvas fixed top-0 left-0 pointer-events-none z-[998]"
        style={{ width: "100vw", height: "100vh" }}
        aria-hidden="true"
      />
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
    </>
  );
}
