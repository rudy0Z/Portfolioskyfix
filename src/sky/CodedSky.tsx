"use client";

/**
 * CodedSky — the persistent sky canvas.
 *
 * One component owns the variant switch. It reads the live time, derives the
 * light model once, publishes it as CSS variables (so static layers inherit
 * lighting with no re-render), and mounts exactly one renderer:
 *
 *   variant="vector"      precise gradients, crisp SVG clouds
 *   variant="dither"      risograph raster, Bayer-quantized ink
 *   variant="volumetric"  WebGL ray-marched cumulus, photographic  ← default
 *                         (falls back to feathered CSS plates without WebGL2)
 *
 * Drop-in note: the only external dependencies are React and CSS variables.
 * The `<div data-sky-slot>` wrapper is the seam where a video cutout can be
 * swapped in later.
 */

import { useEffect, useMemo } from "react";
import { applyLight, getLight } from "@/lib/lighting";
import { useSkyTime } from "@/lib/useTimeOfDay";
import { PhotoSky } from "./PhotoSky";
import { VectorSky } from "./VectorSky";
import { DitherSky } from "./DitherSky";

export type SkyVariant = "vector" | "dither" | "volumetric";

export const SKY_VARIANTS: SkyVariant[] = ["volumetric", "dither", "vector"];

export interface CodedSkyProps {
  variant?: SkyVariant;
  /** Extra class names on the root — position/size is the caller's job. */
  className?: string;
  /** Pause CSS cloud drift (dither/volumetric) — e.g. for reduced motion. */
  still?: boolean;
}

export function CodedSky({ variant = "volumetric", className = "", still = false }: CodedSkyProps) {
  const t = useSkyTime();
  const light = useMemo(() => getLight(t), [t]);

  // Publish the model to CSS variables. Runs before paint relative to the
  // render below, so children see fresh values.
  useEffect(() => {
    applyLight(light);
  }, [light]);

  useEffect(() => {
    document.documentElement.setAttribute("data-variant", variant);
  }, [variant]);

  return (
    <div
      className={`sky-root ${still ? "sky-still" : ""} ${className}`}
      data-sky-root
      data-sky-variant={variant}
      aria-hidden
    >
      <div data-sky-slot="canvas" className="fill">
        {variant === "volumetric" && <PhotoSky light={light} still={still} />}
        {variant === "vector" && <VectorSky light={light} />}
        {variant === "dither" && <DitherSky light={light} />}
      </div>

      {/* Slot seam: an optional video/photo cutout would mount here and be
          graded by the same CSS variables (var(--grade-tint)). */}
      <div data-sky-slot="cutout" className="fill no-events" />
    </div>
  );
}
