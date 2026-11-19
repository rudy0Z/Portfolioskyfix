"use client";

import { Link } from "@/router/Router";

interface NavBotanicalLogoProps {
  /** Optional double-click or explicit action to replay the intro bloom. */
  onReplayBloom?: () => void;
}

/**
 * NavBotanicalLogo — the docked living serif brand mark inside the top nav capsule.
 *
 * Replaces the old geometric diamond `TrackingFlower` icon completely: renders
 * editorial serif `Rudraksh` woven with delicate miniature vines and micro
 * blossoms of our 4 meadow species (violet lupine, pink cosmos, golden poppy,
 * white daisy) that gently sway on hover.
 */
export function NavBotanicalLogo({ onReplayBloom }: NavBotanicalLogoProps) {
  return (
    <span
      className="site-brand-wordmark-wrap"
      onDoubleClick={(e) => {
        if (!onReplayBloom) return;
        e.preventDefault();
        onReplayBloom();
      }}
    >
      <Link
        href="/"
        className="site-brand-wordmark"
        aria-label="Rudraksh — Home"
      >
      {/* Back miniature tendrils weaving behind the serif strokes */}
      <svg
        className="nav-flora nav-flora--back"
        viewBox="0 0 132 34"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="nav-flora-vine"
          d="M5 23 C12 29, 22 10, 32 16 C40 21, 50 7, 62 15 C74 23, 86 9, 98 16 C109 22, 119 13, 127 17"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          className="nav-flora-vine nav-flora-vine--soft"
          d="M16 25 C22 14, 34 8, 43 13 M78 24 C86 12, 98 11, 108 18"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Tiny emerald leaves */}
        <ellipse cx="26" cy="14" rx="3.4" ry="1.5" transform="rotate(-32 26 14)" fill="#2d8a55" />
        <ellipse cx="56" cy="12" rx="3.2" ry="1.4" transform="rotate(24 56 12)" fill="#2d8a55" />
        <ellipse cx="90" cy="13" rx="3.3" ry="1.4" transform="rotate(-22 90 13)" fill="#2d8a55" />
        <ellipse cx="114" cy="16" rx="3" ry="1.3" transform="rotate(28 114 16)" fill="#2d8a55" />
      </svg>

      <span className="site-wordmark">Rudraksh</span>

      {/* Front miniature 4-species meadow blossoms weaving over the letters */}
      <svg
        className="nav-flora nav-flora--front"
        viewBox="0 0 132 34"
        fill="none"
        aria-hidden="true"
      >
        {/* Left tendril curl */}
        <path
          className="nav-flora-vine"
          d="M9 19 C4 18, 3 13, 7 12"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        {/* Right tendril curl */}
        <path
          className="nav-flora-vine"
          d="M123 17 C128 16, 129 11, 125 10"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        {/* Species 1: Violet lupine micro-spire (above 'u') */}
        <g className="nav-bloom nav-bloom--1" transform="translate(27 9)">
          <ellipse cx="0" cy="-3.2" rx="1.4" ry="1.8" fill="#8b73f2" />
          <ellipse cx="-1.5" cy="-0.8" rx="1.3" ry="1.5" fill="#7c5ce6" />
          <ellipse cx="1.5" cy="-0.8" rx="1.3" ry="1.5" fill="#a78bfa" />
          <circle cx="0" cy="-5" r="1.05" fill="#ddd6fe" />
        </g>

        {/* Species 2: Pink cosmos micro-bloom (nestled on 'd/r') */}
        <g className="nav-bloom nav-bloom--2" transform="translate(49 23)">
          <circle cx="0" cy="-2.4" r="1.45" fill="#f472b6" />
          <circle cx="2.3" cy="-0.7" r="1.45" fill="#ec4899" />
          <circle cx="1.4" cy="2" r="1.45" fill="#f472b6" />
          <circle cx="-1.4" cy="2" r="1.45" fill="#ec4899" />
          <circle cx="-2.3" cy="-0.7" r="1.45" fill="#f472b6" />
          <circle cx="0" cy="0" r="1.25" fill="#fbbf24" />
        </g>

        {/* Species 3: Golden-amber poppy cup (above 'a/k') */}
        <g className="nav-bloom nav-bloom--3" transform="translate(76 9.5)">
          <circle cx="-1.9" cy="0.5" r="1.75" fill="#f97316" />
          <circle cx="1.9" cy="0.5" r="1.75" fill="#fb923c" />
          <circle cx="0" cy="-1.6" r="1.85" fill="#fbbf24" />
          <circle cx="0" cy="0.3" r="0.95" fill="#7c2d12" />
        </g>

        {/* Species 4: Crisp white meadow daisy (near 's/h') */}
        <g className="nav-bloom nav-bloom--4" transform="translate(106 10.5)">
          <ellipse cx="0" cy="-2.5" rx="0.9" ry="1.8" fill="#ffffff" />
          <ellipse cx="0" cy="2.5" rx="0.9" ry="1.8" fill="#ffffff" />
          <ellipse cx="-2.5" cy="0" rx="1.8" ry="0.9" fill="#ffffff" />
          <ellipse cx="2.5" cy="0" rx="1.8" ry="0.9" fill="#ffffff" />
          <circle cx="0" cy="0" r="1.3" fill="#f59e0b" />
        </g>
      </svg>
      </Link>
    </span>
  );
}
