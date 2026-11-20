"use client";

import { Link } from "@/router/Router";

interface NavBotanicalLogoProps {
  /** Optional double-click or explicit action to replay the intro bloom. */
  onReplayBloom?: () => void;
}

/**
 * NavBotanicalLogo — refined lowercase editorial serif wordmark (`rudraksh`).
 *
 * Keeps small-scale navbar typography razor-sharp and readable (matching the
 * architectural restraint of Akshat's TypeGarden serif), accented with a single
 * graceful calligraphic botanical sprout rather than busy micro-stickers.
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
        aria-label="rudraksh — Home"
      >
        <span className="site-wordmark">rudraksh</span>
        <svg
          className="nav-sprout"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          {/* Delicate calligraphic vine curling off the final stem */}
          <path
            d="M2 16.5 C6 15.5, 9.5 11.5, 11.8 6.8 C13 4.4, 15.8 3.6, 17.6 5.2"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          {/* Tapered botanical leaf */}
          <path
            d="M8.8 11.6 C11.4 9.2, 15.4 9.5, 16.4 11.6 C14.2 13.4, 10.6 13.2, 8.8 11.6 Z"
            fill="currentColor"
            opacity="0.88"
          />
          {/* Single tiny lupine-lavender bud accent */}
          <circle cx="17.8" cy="5.2" r="2.05" fill="#9b92f0" />
          <circle cx="17.3" cy="4.7" r="0.7" fill="#eef0ff" />
        </svg>
      </Link>
    </span>
  );
}

