"use client";

import { useCallback, useEffect, useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
      
      // Track active section based on scroll position
      const sections = ["home", "work", "about"];
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= scrollPos && rect.bottom >= scrollPos) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "work", label: "Work" },
    { id: "about", label: "About" },
  ];

  return (
    <nav
      className={`thermal-nav ${
        isScrolled ? "thermal-nav--scrolled" : ""
      } ${scrollDirection === "down" ? "thermal-nav--slide-down" : ""}`}
      aria-label="Primary navigation"
    >
      {/* Premium gradient background with glass effect */}
      <div className="thermal-nav-bg">
        <div className="thermal-nav-glow" aria-hidden />
      </div>

      <div className="thermal-nav-content">
        {/* Left: Brand/Logo */}
        <button
          className="thermal-nav-brand"
          onClick={() => scrollToSection("home")}
          aria-label="Go to home section"
        >
          <span className="thermal-nav-logo">SKY</span>
        </button>

        {/* Center: Navigation links */}
        <ul className="thermal-nav-links" role="menubar">
          {navItems.map((item) => (
            <li
              key={item.id}
              className="thermal-nav-item"
              role="presentation"
            >
              <button
                className={`thermal-nav-link ${
                  activeSection === item.id ? "thermal-nav-link--active" : ""
                }`}
                onClick={() => scrollToSection(item.id)}
                role="menuitem"
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right: Clock thumbnail & CTA */}
        <div className="thermal-nav-actions">
          {/* Thumbnail clock mode (click to expand) */}
          {/* Future integration point for ThermalSkyClock thumbnail */}
          
          {/* CTA Button */}
          <a
            href="#contact"
            className="thermal-nav-cta"
            role="button"
            aria-label="Get in touch"
          >
            <span className="thermal-nav-cta-text">Get in touch</span>
            <svg
              viewBox="0 0 12 12"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M2 6h8M7 3l5 3-5 3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom hairline separator */}
      <div className="thermal-nav-sep" aria-hidden />
    </nav>
  );
}
