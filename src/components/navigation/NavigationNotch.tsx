"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useRoute } from "@/router/Router";
import { TrackingFlower } from "./TrackingFlower";
import { CompactAudioPlayer } from "./CompactAudioPlayer";

export interface NavigationNotchProps {
  onOpenGarden?: () => void;
  isLoaderDocked?: boolean;
  className?: string;
}

interface NavLinkItem {
  href: string;
  label: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/journal", label: "Journal" },
  { href: "/resume", label: "Resume" },
];

export function NavigationNotch({
  onOpenGarden,
  isLoaderDocked = true,
  className = "",
}: NavigationNotchProps) {
  const { path } = useRoute();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const notchRef = useRef<HTMLElement>(null);

  // Detect scroll offset with hysteresis (collapse when > 70px, expand when < 45px)
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

  // Detect mobile viewport (< 1024px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [path]);

  // Case study routes trigger compact mode
  const isCaseStudy = path.startsWith("/case/");

  // Core morphing logic: compact on mobile viewports (<1024px), when scrolling, on case studies, or before loader docks, unless hovered or mobile drawer open
  const shouldBeCompact =
    !isLoaderDocked ||
    ((isMobileViewport || isCaseStudy || isScrolled) && !isHovered && !isMobileDrawerOpen);

  return (
    <>
      <motion.header
        ref={notchRef}
        layout
        initial={{ y: -40, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          width: shouldBeCompact ? 48 : "auto",
        }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 28,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredSection(null);
        }}
        className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xl border border-white/12 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:border-white/25 transition-colors duration-300 ${
          shouldBeCompact ? "h-12 w-12 p-0" : "h-11 px-3 lg:px-4"
        } ${className}`}
        style={{
          boxShadow: shouldBeCompact
            ? "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
            : "0 12px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Subtle iridescent top highlight line */}
        <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Compact Mode: Only the tracking flower in a 48px circular pill */}
        {shouldBeCompact ? (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer"
            onClick={() => {
              if (isMobileViewport) {
                setIsMobileDrawerOpen((v) => !v);
              } else {
                setIsHovered(true);
              }
            }}
            title="Expand Navigation (or Click to Bloom Garden)"
          >
            <TrackingFlower
              isCompact={true}
              isPlaying={isAudioPlaying}
              onOpenFullscreen={onOpenGarden}
            />
          </div>
        ) : (
          /* Expanded Mode: Full navigation notch controls */
          <div className="flex items-center gap-2 lg:gap-3 whitespace-nowrap">
            {/* Left: Botanical flower + Type Garden identity */}
            <div className="flex items-center gap-2">
              <TrackingFlower
                isCompact={false}
                isPlaying={isAudioPlaying}
                hoveredSection={hoveredSection}
                onOpenFullscreen={onOpenGarden}
              />
              <button
                type="button"
                onClick={onOpenGarden}
                className="group flex items-center gap-1.5 focus:outline-none"
                title="Type Garden — replay the bloom"
              >
                <span className="font-serif text-[13.5px] lg:text-[14px] font-semibold text-white/95 group-hover:text-emerald-300 transition-colors">
                  Type Garden
                </span>
              </button>
            </div>

            {/* Vertical hairline divider */}
            <div className="hidden lg:block w-px h-3.5 bg-white/15 mx-0.5" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = path === link.href;
                return (
                  <span
                    key={link.href}
                    onMouseEnter={() => setHoveredSection(link.label)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className="inline-flex"
                  >
                    <Link
                      href={link.href}
                      className={`relative px-2.5 lg:px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-white text-black font-semibold shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </span>
                );
              })}
            </nav>

            {/* Vertical hairline divider */}
            <div className="w-px h-3.5 bg-white/15 mx-0.5" />
          </div>
        )}

        {/* Right: Compact Audio Player (Persistently mounted across notch morphs to maintain continuous audio) */}
        <div className={shouldBeCompact ? "hidden pointer-events-none" : "flex items-center gap-2"}>
          <CompactAudioPlayer
            onPlayStateChange={(playing) => setIsAudioPlaying(playing)}
          />

          {/* Mobile Menu Hamburger Trigger for small screens */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white/80 hover:text-white"
            onClick={() => setIsMobileDrawerOpen((v) => !v)}
            aria-label="Toggle mobile navigation menu"
            title="Menu"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2">
              {isMobileDrawerOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Dropdown when opened on small viewports */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-xs p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-3"
            >
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
              <nav className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => {
                  const isActive = path === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`px-3 py-2 rounded-xl font-mono text-[12px] uppercase tracking-wider transition-all ${
                        isActive
                          ? "bg-white text-black font-semibold"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
                <span>SURAT 21°N</span>
                <span className="text-emerald-400">● LIVE SKY</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
