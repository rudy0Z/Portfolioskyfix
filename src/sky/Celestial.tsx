"use client";

/**
 * Celestial layer — sun, moon and stars.
 *
 * Shared by the vector and volumetric skies (dither rasterizes its own sky and
 * hides this). Positions come from the light model every frame of the scrub, so
 * the discs genuinely travel the arc rather than crossfading between states.
 *
 * The moon is drawn as two intersecting discs (an offset shadow circle whose
 * displacement encodes phase) — a cheap terminator that reads correctly at
 * portfolio scale and stays perfectly crisp at any resolution.
 */

import { useMemo } from "react";
import type { LightModel } from "@/lib/lighting";

function Sun({ light }: { light: LightModel }) {
  const glow = light.golden * 0.9 + light.daylight * 0.3;
  return (
    <div
      className="sky-sun pointer-events-none absolute"
      style={{
        left: "var(--sun-x)",
        top: "var(--sun-y)",
        opacity: "var(--sun-op)",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="sky-sun-halo"
        style={{
          background:
            "radial-gradient(circle, var(--sun-glow-a0) 0%, var(--sun-glow-a0b) 68%)",
          opacity: 0.55 + glow * 0.45,
        }}
      />
      <div
        className="sky-sun-core"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #fffdf6 0%, var(--sky-sun-core) 55%, color-mix(in oklab, var(--sky-sun-core), var(--sky-sun-glow) 60%) 100%)",
        }}
      />
    </div>
  );
}

function Moon({ light }: { light: LightModel }) {
  const phase = light.moonPhase;
  // Displacement of the shadow disc, in moon-radius units.
  // new (0) → +2.2, full (0.5) → far off, quarter (0.25/0.75) → ~0
  const shadowX = Math.cos(phase * Math.PI * 2) * 2.2;
  const shadowY = Math.sin(phase * Math.PI * 2) * 0.35;
  const shadowOpacity = 0.86;

  return (
    <div
      className="sky-moon pointer-events-none absolute"
      style={{
        left: "var(--moon-x)",
        top: "var(--moon-y)",
        opacity: "var(--moon-op)",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="sky-moon-halo"
        style={{
          opacity: 0.25 + light.moonIllumination * 0.55,
        }}
      />
      <div className="sky-moon-body">
        <div
          className="sky-moon-shadow"
          style={{
            transform: `translate(${shadowX * 50}%, ${shadowY * 50}%)`,
            opacity: shadowOpacity,
          }}
        />
        {/* faint maria so the disc isn't a flat hole */}
        <span className="sky-moon-maria" />
      </div>
    </div>
  );
}

function Stars({ light }: { light: LightModel }) {
  const nodes = useMemo(
    () =>
      light.stars.map((s, i) => (
        <span
          key={i}
          className="sky-star"
          style={
            {
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.brightness,
              animationDelay: `${-s.phase}s`,
              animationDuration: `${3 + s.speed * 4}s`,
              boxShadow: s.halo
                ? `0 0 ${s.size * 4}px ${s.size * 0.8}px rgba(220,232,255,${0.18 + s.brightness * 0.2})`
                : undefined,
            } as React.CSSProperties
          }
        />
      )),
    [light.stars],
  );

  return (
    <div
      className="fill no-events"
      style={{ opacity: "var(--star-opacity)" }}
      aria-hidden
    >
      {nodes}
    </div>
  );
}

export function Celestial({ light, mode = "soft" }: { light: LightModel; mode?: "soft" | "crisp" }) {
  return (
    <div className="fill no-events" data-celestial={mode} aria-hidden>
      <Stars light={light} />
      <Moon light={light} />
      <Sun light={light} />
    </div>
  );
}
