import { useEffect, useState, useCallback } from "react";
import { useSkyTime } from "@/lib/useTimeOfDay";

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
}

export function CelestialNight({
  forceAurora = false,
  forceNight = false,
}: {
  forceAurora?: boolean;
  forceNight?: boolean;
}) {
  const t = useSkyTime();
  // Night is between 21:30 (21.5) and 04:30 (4.5)
  const isNightTime = forceNight || t >= 21.5 || t <= 4.5;
  const isAuroraActive = forceAurora || (isNightTime && (t >= 23.5 || t <= 3.5));

  const [stars, setStars] = useState<ShootingStar[]>([]);

  const spawnShootingStar = useCallback(() => {
    const star: ShootingStar = {
      id: Date.now() + Math.random(),
      startX: 15 + Math.random() * 70, // percent
      startY: 5 + Math.random() * 25, // percent
      length: 120 + Math.random() * 100, // px
      angle: 25 + Math.random() * 20, // deg
      speed: 0.6 + Math.random() * 0.4,
      opacity: 0.8 + Math.random() * 0.2,
    };
    setStars((prev) => [...prev, star]);

    setTimeout(() => {
      setStars((prev) => prev.filter((s) => s.id !== star.id));
    }, 1200);
  }, []);

  // Listen to manual dev event
  useEffect(() => {
    const onTrigger = () => spawnShootingStar();
    window.addEventListener("spawnshootingstar", onTrigger);
    return () => window.removeEventListener("spawnshootingstar", onTrigger);
  }, [spawnShootingStar]);

  // Periodic shooting stars in night hours
  useEffect(() => {
    if (!isNightTime) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.6) {
        spawnShootingStar();
      }
    }, 18000);
    return () => clearInterval(interval);
  }, [isNightTime, spawnShootingStar]);

  if (!isNightTime && !forceAurora) return null;

  return (
    <div className="celestial-night-root fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* ============================================================== */}
      {/* ATMOSPHERIC NORTHERN AURORA BOREALIS RIBBONS                   */}
      {/* ============================================================== */}
      {isAuroraActive && (
        <div className="aurora-curtains absolute top-0 inset-x-0 h-[45vh] opacity-55 mix-blend-screen transition-opacity duration-1000">
          {/* Soft Emerald Primary Ribbon (zero-blur radial gradient) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(62% 55% at 50% 24%, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.06) 52%, transparent 80%)",
            }}
          />
          {/* Soft Violet / Indigo Secondary Ribbon */}
          <div
            className="absolute -top-8 inset-x-0 h-[36vh]"
            style={{
              background:
                "radial-gradient(58% 60% at 32% 30%, rgba(139, 92, 246, 0.18) 0%, transparent 74%)",
            }}
          />
          {/* Soft Cyan Ionized Shimmer */}
          <div
            className="absolute top-4 inset-x-0 h-[28vh]"
            style={{
              background:
                "radial-gradient(46% 54% at 68% 36%, rgba(6, 182, 212, 0.14) 0%, transparent 72%)",
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SHOOTING STAR STREAKS                                          */}
      {/* ============================================================== */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            transform: `rotate(${s.angle}deg)`,
          }}
        >
          {/* Ionized Meteor Head & Plasma Tail */}
          <div
            className="h-[2px] bg-gradient-to-r from-white via-cyan-300 to-transparent animate-shooting-star"
            style={{
              width: `${s.length}px`,
              opacity: s.opacity,
            }}
          />
        </div>
      ))}
    </div>
  );
}
