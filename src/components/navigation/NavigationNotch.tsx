"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link, useRoute } from "@/router/Router";
import { NavBotanicalLogo } from "@/components/botanical/NavBotanicalLogo";

export interface NavigationNotchProps {
  /** Adaptive solar time trigger pill + PinUI-inspired sundial popover on the right. */
  clock?: ReactNode;
  /** Optional replay of the intro botanical bloom on logo double-click. */
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
  { href: "/#contact", label: "Contact" },
  { href: "/resume.pdf", label: "Resume ↗", externalPdf: true },
];

/*
 * NavigationNotch — Full-Width Unboxed Editorial Top Bar.
 * Left: razor-sharp lowercase serif `rudraksh` wordmark.
 * Center: quiet unboxed typographic nav links (`Work`, `Contact`, `Resume ↗`).
 * Right: docked solar time trigger opening the 180° sundial cleanly over the upper-right sky.
 */
export function NavigationNotch({ clock, onReplayBloom, className = "" }: NavigationNotchProps) {
  const { path } = useRoute();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("/#work");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled((prev) => {
        if (!prev && scrollY > 70) return true;
        if (prev && scrollY < 45) return false;
        return prev;
      });

      const sections: { id: string; href: string }[] = [
        { id: "contact", href: "/#contact" },
        { id: "work", href: "/#work" },
      ];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.42) {
          setActiveHash(s.href);
          return;
        }
      }
      setActiveHash("/#work");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [path]);

  return (
    <header className={`site-nav-host ${isScrolled ? "is-scrolled" : ""} ${className}`}>
      <div className="shell site-nav-bar">
        {/* Zone 1 (Left): Lowercase editorial serif `rudraksh` wordmark */}
        <div className="site-brand">
          <NavBotanicalLogo onReplayBloom={onReplayBloom} />
        </div>

        {/* Zone 2 (Center): Quiet unboxed typographic nav links */}
        <nav className="site-links" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            if (link.externalPdf) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-link site-link--external"
                >
                  {link.label}
                </a>
              );
            }
            const isActive = path === "/" && activeHash === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-link ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveHash(link.href)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3 (Right): Solar time trigger docked at right edge + mobile menu */}
        <div className="site-right">
          {clock}

          <button
            type="button"
            className="site-menu-btn"
            onClick={() => setIsMobileDrawerOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileDrawerOpen}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.6">
              {isMobileDrawerOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer (strictly below 1024px) */}
      {isMobileDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="site-mobile-drawer lg:hidden">
            <div className="site-mobile-drawer-head">
              <span className="site-mobile-drawer-title">Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="site-mobile-drawer-close"
                aria-label="Close navigation menu"
              >
                Close ×
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => {
                if (link.externalPdf) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="site-mobile-link"
                    >
                      {link.label}
                    </a>
                  );
                }
                const isActive = path === "/" && activeHash === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveHash(link.href);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`site-mobile-link ${isActive ? "is-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="site-mobile-drawer-foot">
              <span>Greater Noida · IST</span>
              <span>Live 24h Sky</span>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
