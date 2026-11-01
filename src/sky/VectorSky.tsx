"use client";

/**
 * Vector sky — pure, high-precision gradients and clean SVG cloud drift.
 *
 * The "no texture" control: hard banding earned by precise stops, crisp cloud
 * silhouettes, a flat sun disc. It exists so you can see the underlying design
 * system without grain, and because some contexts (print, very large displays)
 * want exactly this.
 */

import { CLOUDS, cachedCloudPath } from "./Clouds";
import { Celestial } from "./Celestial";
import type { LightModel } from "@/lib/lighting";

export function VectorSky({ light }: { light: LightModel }) {
  return (
    <div className="fill" aria-hidden data-sky-variant="vector">
      {/* base ramp — three-stop, tight */}
      <div
        className="fill"
        style={{
          background: `linear-gradient(180deg,
            var(--sky-zenith) 0%,
            var(--sky-mid) 48%,
            var(--sky-horizon) 88%,
            var(--sky-haze) 100%)`,
        }}
      />

      {/* precise horizon ribbon: a hard-edged gradient band, no blur */}
      <div
        className="fill"
        style={{
          top: "78%",
          height: "22%",
          background:
            "linear-gradient(180deg, var(--sun-glow-a0b) 0%, var(--sky-horizon-a70) 40%, var(--sky-horizon-a20) 100%)",
          opacity: "calc(0.5 + var(--twilight) * 0.5)",
        }}
      />

      <Celestial light={light} mode="crisp" />

      {/* clouds: crisp cut paths, one solid fill + one rim stroke */}
      <div
        className="fill"
        style={{ opacity: "calc(var(--cloud-opacity) * 0.95)" }}
      >
        {[...CLOUDS]
          .sort((a, b) => a.depth - b.depth)
          .map((c) => {
            const i = CLOUDS.indexOf(c);
            return (
              <div
                key={c.seed}
                className="sky-cloud-plate"
                style={{
                  left: `${c.x * 100}%`,
                  top: `${(c.y - 0.12) * 100}%`,
                  width: `${(c.w * 100 * (0.4 + c.depth * 0.5))}%`,
                  translate: `calc(var(--drift-${i}) * 1px) 0`,
                  opacity: 0.45 + c.depth * 0.5,
                }}
              >
                <svg viewBox="0 0 1000 300" className="block-full">
                  <path d={cachedCloudPath(c.seed)} fill="var(--sky-cloud-lit)" />
                  <path
                    d={cachedCloudPath(c.seed)}
                    fill="none"
                    stroke="var(--sky-cloud-rim)"
                    strokeWidth={2}
                    style={{ opacity: "var(--cloud-rim-strength)" }}
                  />
                  {/* flat underside wedge for graphic weight */}
                  <path
                    d={cachedCloudPath(c.seed)}
                    fill="var(--sky-cloud-shadow)"
                    opacity={0.22}
                    transform="translate(0 10) scale(1 0.9)"
                    style={{ transformOrigin: "500px 260px" }}
                  />
                </svg>
              </div>
            );
          })}
      </div>

      <div className="sky-grain fill opacity-60" />
    </div>
  );
}
