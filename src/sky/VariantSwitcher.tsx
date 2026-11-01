"use client";

/**
 * VariantSwitcher — inspect all three texture modes live.
 * Keys 1 / 2 / 3 switch as well (wired in App).
 */

import { SKY_VARIANTS, type SkyVariant } from "./CodedSky";

const LABELS: Record<SkyVariant, string> = {
  volumetric: "Volumetric",
  dither: "Dither",
  vector: "Vector",
};

export function VariantSwitcher({
  value,
  onChange,
  className = "",
}: {
  value: SkyVariant;
  onChange: (v: SkyVariant) => void;
  className?: string;
}) {
  return (
    <div className={`variant-switcher pointer-events-auto ${className}`} role="group" aria-label="Sky texture">
      <span className="variant-switcher-label">Sky</span>
      {SKY_VARIANTS.map((v, i) => (
        <button
          key={v}
          type="button"
          className="variant-switcher-btn"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          title={`${LABELS[v]} (press ${i + 1})`}
        >
          <span className="variant-switcher-key" aria-hidden>{i + 1}</span>
          {LABELS[v]}
        </button>
      ))}
    </div>
  );
}
