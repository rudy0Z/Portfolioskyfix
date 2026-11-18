"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link, useRoute } from "@/router/Router";
import { TrackingFlower } from "@/components/TrackingFlower";

export interface NavigationNotchProps {
  /** The sky clock lives at the right end of the row, combined with the links. */
  clock?: ReactNode;
  /** Replay the intro bloom — fired by the tracking flower. */
  onReplayBloom?: () => void;
  className?: string;
}

interface NavLinkItem {
  href: string;
  label: string;
  externalPdf?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: "/#work", label: "Work" },
  { href: "/#craft", label: "Craft" },
  { href: "/#contact", label: "Contact" },
  { href: "/resume.pdf", label: "Resume ↗", externalPdf: true },
];

/*
 * SiteTop — the whole top chrome: wordmark pinned to the left corner, links
 * and the sky clock combined on the right. No bar, no pill — text floats over
 * the sky behind a soft top scrim (the Air reference), and the expanded clock
 * panel drops below the row so nothing ever overlaps.
 */
export function NavigationNotch({ clock, onReplayBloom, className = "" }: NavigationNotchProps) {
  const { path } = useRoute();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Slightly stronger scrim once the page scrolls (with hysteresis).
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled((prev) => {
        if (!prev && scrollY > 70) return true;
        if (prev && scrollY < 45) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the drawer on route change.
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [path]);

  return (
    <div className={`site-top ${isScrolled ? "is-scrolled" : ""} ${className}`}>
      <div className="site-top-row">
        {/* Docked living logo — the tracking flower rides beside the wordmark */}
        <div className="site-brand">
          <TrackingFlower onActivate={onReplayBloom} className="site-brand-flower" />
          <Link href="/" className="site-wordmark">
            Rudraksh Singh
          </Link>
        </div>

        {/* Right cluster: links + clock + mobile trigger */}
        <div className="site-right">
          <nav className="site-links" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              if (link.externalPdf) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-link"
                  >
                    {link.label}
                  </a>
                );
              }
              const isActive = path === "/" && link.href === "/#work";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`site-link ${isActive ? "is-active" : ""}`}
                >
                  {link.label}
                  {/* uncurling hairline leaf on hover */}
                  <svg className="site-link-leaf" viewBox="0 0 14 8" aria-hidden="true">
                    <path
                      d="M1 7 Q4 0.5 7 3.5 Q10 6.5 13 1"
                      pathLength="1"
                    />
                  </svg>
                  {isActive && <span className="site-link-dot" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          {clock}

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="site-menu-btn"
            onClick={() => setIsMobileDrawerOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileDrawerOpen}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2">
              {isMobileDrawerOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-xs p-4 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-serif text-[13px] text-white/80">Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="text-white/40 hover:text-white text-[11px] font-mono"
              >
                CLOSE ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => {
                if (link.externalPdf) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="flex min-h-[44px] items-center px-3 py-2 rounded-xl font-mono text-[12px] uppercase tracking-wider transition-colors text-white/70 hover:text-white hover:bg-white/10"
                    >
                      {link.label}
                    </a>
                  );
                }
                const isActive = path === "/" && link.href === "/#work";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex min-h-[44px] items-center px-3 py-2 rounded-xl font-mono text-[12px] uppercase tracking-wider transition-colors ${
                      isActive ? "bg-white text-black font-semibold" : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>GREATER NOIDA · IST</span>
              <span className="text-emerald-400">● LIVE SKY</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
