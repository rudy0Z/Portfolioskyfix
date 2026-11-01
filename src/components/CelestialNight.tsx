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
        <div className="aurora-curtains absolute top-0 inset-x-0 h-[45vh] opacity-60 mix-blend-screen transition-opacity duration-1000">
          {/* Emerald Green Primary Ribbon */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10b981]/25 to-transparent blur-3xl animate-pulse"
            style={{ animationDuration: "6s" }}
          />
          {/* Violet / Indigo Secondary Ribbon */}
          <div
            className="absolute -top-10 inset-x-0 h-[35vh] bg-gradient-to-r from-transparent via-[#8b5cf6]/20 to-transparent blur-2xl animate-pulse"
            style={{ animationDuration: "9s" }}
          />
          {/* Cyan Ionized Shimmer */}
          <div
            className="absolute top-5 left-1/4 right-1/4 h-[25vh] bg-gradient-to-b from-[#06b6d4]/15 to-transparent blur-xl"
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
