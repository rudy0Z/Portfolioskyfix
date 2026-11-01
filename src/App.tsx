"use client";

import { useCallback, useEffect, useState } from "react";
import { RouterProvider, useRoute } from "@/router/Router";
import { CodedSky, type SkyVariant } from "@/sky/CodedSky";
import { Header } from "@/components/Header";
import { TypeGardenLoader } from "@/components/TypeGardenLoader";
import { CelestialNight } from "@/components/CelestialNight";
import { ButterflyCursor } from "@/components/ButterflyCursor";
import { ThermalSkyClock } from "@/sky/ThermalSkyClock";

// Page & Section Components
import { Hero } from "@/sections/Hero";
import { StackingProjects } from "@/sections/StackingProjects";
import { ExcavationCraterFooter } from "@/sections/ExcavationCraterFooter";
import { AboutPage } from "@/pages/AboutPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { JournalPage } from "@/pages/JournalPage";
import { ResumePage } from "@/pages/ResumePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { CaseStudyPage } from "@/pages/CaseStudyPage";
import { LabPage } from "@/pages/LabPage";
import { setSkyTime } from "@/lib/useTimeOfDay";

const VARIANT_KEY = "sky-variant";
/** Set once the Type Garden bloom has played; later visits open straight onto the site. */
const GARDEN_BLOOMED_KEY = "type-garden-bloomed";

function hasBloomedBefore() {
  try {
    return window.localStorage.getItem(GARDEN_BLOOMED_KEY) === "1";
  } catch {
    return false;
  }
}

function PortfolioContent() {
  const { path } = useRoute();
  const [variant] = useState<SkyVariant>("volumetric");
  const [hasLoadedGarden, setHasLoadedGarden] = useState(hasBloomedBefore);
  const [isLoaderDocked, setIsLoaderDocked] = useState(hasLoadedGarden);
  const [fullscreenGarden, setFullscreenGarden] = useState(false);
  const [clockSize, setClockSize] = useState<"thumbnail" | "full">("thumbnail");

  // Visual layer flags
  const forceAurora = false;
  const forceNight = false;
  const butterflyEnabled = true;

  const openGarden = useCallback(() => setFullscreenGarden(true), []);
  const handleDockingStart = useCallback(() => setIsLoaderDocked(true), []);
  const handleLoaderComplete = useCallback(() => {
    try {
      window.localStorage.setItem(GARDEN_BLOOMED_KEY, "1");
    } catch {
      // Storage unavailable: the bloom simply plays again next visit.
    }
    setHasLoadedGarden(true);
    setIsLoaderDocked(true);
    setFullscreenGarden(false);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VARIANT_KEY, "volumetric");
    const params = new URLSearchParams(window.location.search);
    params.set("variant", "volumetric");
    const t = params.get("t");
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
    if (t) {
      const [h, m] = t.split(":").map(Number);
      if (Number.isFinite(h)) setSkyTime(h + (m || 0) / 60, "manual");
    }
  }, []);

  return (
    <>
      {/* ── Persistent Raymarched / Halftone Sky Engine ──────────────── */}
      <div className="sky-fixed">
        <CodedSky variant={variant} />
      </div>

      {/* ── Celestial Night Pack (Shooting Stars & Aurora) ──────────── */}
      <CelestialNight forceAurora={forceAurora} forceNight={forceNight} />

      {/* ── Garden Butterfly Cursor Trail ───────────────────────────── */}
      <ButterflyCursor enabled={butterflyEnabled} />

      {/* ── Fixed Top-Right Corner Clock (Refined Luxury Pill) ─────── */}
      {/* The clock expands itself (onSizeChange); the backdrop and Escape collapse it. */}
      <div className="fixed top-3.5 right-4 sm:right-6 z-50 pointer-events-auto">
        <ThermalSkyClock
          size={clockSize}
          onSizeChange={setClockSize}
          expandable={true}
        />
      </div>
      {clockSize === "full" && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setClockSize("thumbnail")}
          aria-hidden="true"
        />
      )}

      {/* ── Persistent Top Navigation Notch ─────────────── */}
      <Header isLoaderDocked={isLoaderDocked} onOpenGarden={openGarden} />

      {/* ── Type Garden bloom: first visit only, or when replayed from the header ── */}
      {(!hasLoadedGarden || fullscreenGarden) && (
        <TypeGardenLoader onDockingStart={handleDockingStart} onComplete={handleLoaderComplete} />
      )}

      {/* ── Main Multi-Page Route Viewport ──────────────────────────── */}
      <main className="page relative z-10 min-h-screen">
        {path === "/" && (
          <>
            <Hero />
            <StackingProjects />
            <ExcavationCraterFooter />
          </>
        )}

        {path === "/about" && (
          <>
            <AboutPage externalMusicStyle="pinui" />
            <ExcavationCraterFooter />
          </>
        )}

        {path === "/projects" && (
          <>
            <ProjectsPage />
            <ExcavationCraterFooter />
          </>
        )}

        {path === "/journal" && (
          <>
            <JournalPage />
            <ExcavationCraterFooter />
          </>
        )}

        {path === "/resume" && (
          <>
            <ResumePage />
            <ExcavationCraterFooter />
          </>
        )}

        {path === "/lab" && <LabPage />}

        {path === "/404" && (
          <>
            <NotFoundPage />
            <ExcavationCraterFooter />
          </>
        )}

        {path.startsWith("/case/") && (
          <>
            <CaseStudyPage />
            <ExcavationCraterFooter />
          </>
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <PortfolioContent />
    </RouterProvider>
  );
}
