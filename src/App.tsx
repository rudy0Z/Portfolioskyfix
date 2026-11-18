"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { RouterProvider, useRoute } from "@/router/Router";
import { CodedSky, type SkyVariant } from "@/sky/CodedSky";
import { Header } from "@/components/Header";
import { CelestialNight } from "@/components/CelestialNight";
import { ButterflyCursor } from "@/components/ButterflyCursor";
import { ThermalSkyClock } from "@/sky/ThermalSkyClock";

// Homepage Critical Path Components
import { Hero } from "@/sections/Hero";
import { StackingProjects } from "@/sections/StackingProjects";
import { HomeBeats } from "@/sections/HomeBeats";
import { SiteFooter } from "@/sections/SiteFooter";
import { TypeGardenLoader } from "@/components/TypeGardenLoader";
import { useReveal } from "@/lib/useReveal";
import { setSkyTime } from "@/lib/useTimeOfDay";

// Route-split Page Views (keeps initial homepage bundle fast & warning-free)
const CaseStudyPage = lazy(() =>
  import("@/pages/CaseStudyPage").then((m) => ({ default: m.CaseStudyPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function PortfolioContent() {
  const { path } = useRoute();
  const [variant] = useState<SkyVariant>("volumetric");
  const [clockSize, setClockSize] = useState<"thumbnail" | "full">("thumbnail");
  // Remounting the TypeGarden loader replays the bloom (docked flower click).
  const [bloomKey, setBloomKey] = useState(0);

  // Scroll-reveal engine — one class toggle per element, CSS carries motion.
  useReveal(path);

  // Visual layer flags
  const forceAurora = false;
  const forceNight = false;
  const butterflyEnabled = true;

  const isCaseRoute = path.startsWith("/case/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (t) {
      const [h, m] = t.split(":").map(Number);
      if (Number.isFinite(h)) setSkyTime(h + (m || 0) / 60, "manual");
    }
  }, []);

  return (
    <>
      {/* ── TypeGarden intro: the botanical glass bloom, docking into the nav ── */}
      <TypeGardenLoader
        key={bloomKey}
        ignoreSession={bloomKey > 0}
        onDockingStart={() => {
          document.documentElement.dataset.intro = "lift";
        }}
        onComplete={() => {
          document.documentElement.dataset.intro = "done";
        }}
      />

      {/* ── Persistent Raymarched / Halftone Sky Engine ──────────────── */}
      <div className="sky-fixed">
        <CodedSky variant={variant} />
      </div>

      {/* ── Celestial Night Pack (Shooting Stars & Aurora) ──────────── */}
      <CelestialNight forceAurora={forceAurora} forceNight={forceNight} />

      {/* ── Garden Butterfly Cursor Trail ───────────────────────────── */}
      <ButterflyCursor enabled={butterflyEnabled} />

      {/* ── Top chrome: wordmark left, links + sky clock right ──────────── */}
      {/* On Case Study routes, the unified Floating Top Hub Capsule owns the top
          chrome so there are never duplicate bars. */}
      {!isCaseRoute && (
        <Header
          onReplayBloom={() => setBloomKey((k) => k + 1)}
          clock={
            <>
              <ThermalSkyClock size={clockSize} onSizeChange={setClockSize} expandable={true} />
              {clockSize === "full" && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setClockSize("thumbnail")}
                  aria-hidden="true"
                />
              )}
            </>
          }
        />
      )}

      {/* ── Main Multi-Page Route Viewport ──────────────────────────── */}
      <main className="page relative z-10 min-h-screen">
        {path === "/" && (
          <>
            <Hero />
            <StackingProjects />
            <HomeBeats />
            <SiteFooter />
          </>
        )}

        <Suspense fallback={null}>
          {path === "/404" && (
            <>
              <NotFoundPage />
              <SiteFooter />
            </>
          )}

          {path.startsWith("/case/") && (
            <>
              <CaseStudyPage />
              <SiteFooter />
            </>
          )}
        </Suspense>
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
