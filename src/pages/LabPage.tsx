import { useState } from "react";
import { Link } from "@/router/Router";
import {
  StarfieldButton,
  EmberglowHorizon,
  GlimmerVale,
  Aetherglint,
  MoonpetalMeadow,
  BluebellPass,
  MoonlitPetals,
  BloomingFlower,
  StillSunsetMeadow,
} from "@/components/originkit";

type LabTab = "button" | "horizon" | "vale" | "aether" | "meadow" | "bluebell" | "petals" | "bloom" | "sunset";

export function LabPage() {
  const [activeTab, setActiveTab] = useState<LabTab>("button");

  // Starfield button interactive state
  const [btnLabel, setBtnLabel] = useState("INITIATE DOCKING");
  const [btnColor, setBtnColor] = useState("#FC731C");
  const [clickCount, setClickCount] = useState(0);

  // Emberglow horizon state
  const [horizonY, setHorizonY] = useState(80);
  const [sunXPos, setSunXPos] = useState(55);
  const [rippleSpeed, setRippleSpeed] = useState(60);

  return (
    <div className="lab-page min-h-screen w-full bg-[#07090e] text-white pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Breadcrumb & Telemetry Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400 mb-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>LABORATORY // EXPERIMENTAL SHADERS &amp; ORIGINKIT VAULT</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Originkit Component Gallery
            </h1>
            <p className="font-sans text-sm text-white/50 mt-1 max-w-2xl">
              Isolated laboratory sandbox for high-fidelity WebGL2 shaders, procedural flora, and interactive cosmic button primitives. Kept separate from the main portfolio page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/originkit-showcase.html"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-[11px] transition-all flex items-center gap-1.5"
            >
              <span>↗</span>
              <span>Standalone HTML</span>
            </a>
            <Link
              href="/"
              className="px-4 py-1.5 rounded-lg border border-cyan-400/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 font-mono text-[11px] transition-all"
            >
              ← Back to Main Page
            </Link>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md mb-8 overflow-x-auto">
          {[
            { id: "button", label: "Starfield Button", icon: "✦", badge: "Motion + Canvas" },
            { id: "horizon", label: "Emberglow Horizon", icon: "🌅", badge: "Sunset Shader" },
            { id: "vale", label: "Glimmer Vale", icon: "🌼", badge: "3D Daisy Ridges" },
            { id: "aether", label: "Aetherglint", icon: "🌾", badge: "Prairie Wind" },
            { id: "meadow", label: "Moonpetal Meadow", icon: "🌸", badge: "Botanical Flora" },
            { id: "bluebell", label: "Bluebell Pass", icon: "🌌", badge: "Night Bloom Pass" },
            { id: "petals", label: "Moonlit Petals", icon: "🌙", badge: "Backlit Canopy" },
            { id: "bloom", label: "Blooming Flower", icon: "🌺", badge: "Spring Bloom 3D" },
            { id: "sunset", label: "Still Sunset Meadow", icon: "🧱", badge: "Voxel Prairie" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as LabTab)}
              className={`px-3.5 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70">({tab.badge})</span>
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: STARFIELD BUTTON SHOWCASE                               */}
        {/* ============================================================== */}
        {activeTab === "button" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                ACTIVE INTERACTIVE PREVIEW // HOVER &amp; CLICK
              </div>

              {/* Central Button Display */}
              <div className="flex flex-col items-center gap-6 z-10">
                <StarfieldButton
                  label={btnLabel}
                  glow={{ color: btnColor, size: 24, opacity: 100 }}
                  stroke={{ color: btnColor, size: 100, speed: 50, count: 1, thickness: 2 }}
                  pixel={{ color: btnColor, size: 4, density: 60, brightness: 100 }}
                  onClick={() => setClickCount((c) => c + 1)}
                  style={{ minWidth: 240, minHeight: 52 }}
                />

                <div className="font-mono text-xs text-white/50 flex items-center gap-2">
                  <span>Clicks registered:</span>
                  <span className="text-amber-400 font-bold">{clickCount}</span>
                </div>
              </div>

              {/* Sub-presets row */}
              <div className="mt-12 pt-8 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-4">
                <div className="font-mono text-[10px] uppercase text-white/40 w-full text-center mb-1">
                  ALTERNATIVE READY-TO-USE PRESETS
                </div>
                <StarfieldButton
                  label="ORBIT ROUTE"
                  glow={{ color: "#00F0FF", size: 18, opacity: 100 }}
                  stroke={{ color: "#00F0FF", size: 80, speed: 60, count: 2, thickness: 1.5 }}
                  pixel={{ color: "#00F0FF", size: 3, density: 50, brightness: 100 }}
                  style={{ minWidth: 160 }}
                />
                <StarfieldButton
                  label="NEBULA DUSK"
                  glow={{ color: "#A855F7", size: 20, opacity: 100 }}
                  stroke={{ color: "#A855F7", size: 90, speed: 40, count: 1, thickness: 2 }}
                  pixel={{ color: "#A855F7", size: 4, density: 70, brightness: 100 }}
                  style={{ minWidth: 160 }}
                />
                <StarfieldButton
                  label="EMERALD SIGNAL"
                  glow={{ color: "#10B981", size: 18, opacity: 100 }}
                  stroke={{ color: "#10B981", size: 85, speed: 70, count: 1, thickness: 2 }}
                  pixel={{ color: "#10B981", size: 3, density: 40, brightness: 100 }}
                  style={{ minWidth: 160 }}
                />
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                  <span>⚙</span>
                  <span>Interactive Controls</span>
                </h3>

                <div className="space-y-5 font-mono text-xs">
                  <div>
                    <label className="block text-white/60 mb-1.5 uppercase text-[10px]">
                      Button Text Label
                    </label>
                    <input
                      type="text"
                      value={btnLabel}
                      onChange={(e) => setBtnLabel(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1.5 uppercase text-[10px]">
                      Theme Color Preset
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { color: "#FC731C", name: "Amber" },
                        { color: "#00F0FF", name: "Cyan" },
                        { color: "#A855F7", name: "Purple" },
                        { color: "#10B981", name: "Emerald" },
                      ].map((item) => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => setBtnColor(item.color)}
                          className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                            btnColor === item.color
                              ? "border-white scale-105"
                              : "border-white/20 opacity-70 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 text-white/40 font-mono text-[10px] leading-relaxed">
                Source: Originkit Cosmic Primitive · Built with Framer Motion, HTML5 Canvas particle stars &amp; radiant sweep beam.
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: EMBERGLOW HORIZON SHOWCASE                              */}
        {/* ============================================================== */}
        {activeTab === "horizon" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-amber-300 bg-black/60 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                EMBERGLOW HORIZON // LOW-ANGLE SUNSET SHADER (PITCH 114°, HORIZON 80%)
              </div>

              {/* WebGL2 AmberVesper Canvas */}
              <div className="w-full h-[520px] relative">
                <EmberglowHorizon
                  speed={rippleSpeed}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* Real-time controls footer */}
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[10px] uppercase">Horizon Y:</span>
                    <input
                      type="range"
                      min={40}
                      max={95}
                      value={horizonY}
                      onChange={(e) => setHorizonY(Number(e.target.value))}
                      className="w-28 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-amber-400 w-8">{horizonY}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[10px] uppercase">Sun Azimuth X:</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={sunXPos}
                      onChange={(e) => setSunXPos(Number(e.target.value))}
                      className="w-28 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-amber-400 w-8">{sunXPos}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[10px] uppercase">Ripple Hz:</span>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      value={rippleSpeed}
                      onChange={(e) => setRippleSpeed(Number(e.target.value))}
                      className="w-28 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-white/50">
                  Move mouse over canvas to trigger interactive heatwave ripples
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-5 text-amber-200/90 font-mono text-xs leading-relaxed">
              <span className="font-bold text-amber-400 block mb-1">
                ✦ ARCHITECTURAL INSIGHT — THE HORIZON GEOMETRY:
              </span>
              Notice why this horizon feels so atmospheric: the camera pitch sits at 114° with the horizon line fixed at 80% down the frame. The glowing sun core, red/peach atmospheric scatter, and tree silhouette ridge-line all meet right at the bottom edge. When you gaze through prairie wildflowers (like in the worm&apos;s-eye daisy reference), this low-angle horizon compression is what creates the emotional sunset glow!
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GLIMMER VALE SHOWCASE                                   */}
        {/* ============================================================== */}
        {activeTab === "vale" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-violet-300 bg-black/60 px-3 py-1 rounded-full border border-violet-500/30 backdrop-blur-md">
                GLIMMER VALE // PROCEDURAL 3D TERRAIN RIDGES &amp; BIG DAISIES
              </div>
              <div className="w-full h-[540px] relative">
                <GlimmerVale style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: 72,000 Ridge Points · Procedural Big Daisies · Wind Sway · Chromatic Aberration Fringe</span>
                <span className="text-violet-400">WebGL2 Native</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AETHERGLINT SHOWCASE                                    */}
        {/* ============================================================== */}
        {activeTab === "aether" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-emerald-300 bg-black/60 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
                AETHERGLINT // PRAIRIE GRASS BLADES &amp; FLOWER STALKS WIND SIMULATION
              </div>
              <div className="w-full h-[540px] relative">
                <Aetherglint style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: Vector Wind Field · Rock Meshes · Interactive Cursor Breeze · Dynamic Grass Stems</span>
                <span className="text-emerald-400">Interactive Cursor Follow</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: MOONPETAL MEADOW SHOWCASE                               */}
        {/* ============================================================== */}
        {activeTab === "meadow" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-pink-300 bg-black/60 px-3 py-1 rounded-full border border-pink-500/30 backdrop-blur-md">
                MOONPETAL MEADOW // PROCEDURAL SHASTA DAISIES, ANEMONES &amp; DEW DROPS
              </div>
              <div className="w-full h-[540px] relative">
                <MoonpetalMeadow style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: 7-Petal Shasta Daisies · Jagged Anemones · Ink Veins · Interactive Hover Lean</span>
                <span className="text-pink-400">Procedural Canvas2D Flora</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: BLUEBELL PASS SHOWCASE                                  */}
        {/* ============================================================== */}
        {activeTab === "bluebell" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-blue-300 bg-black/60 px-3 py-1 rounded-full border border-blue-500/30 backdrop-blur-md">
                BLUEBELL PASS // 3500 CARPET BLOOMS, WIND SWAY &amp; MILKY WAY DRIFT
              </div>
              <div className="w-full h-[540px] relative">
                <BluebellPass style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: 3500 Carpet Blooms · 1600 Grass Tufts · Star Twinkle · Near-Field Flower Sway</span>
                <span className="text-blue-400">Originkit High-Density Pass</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: MOONLIT PETALS SHOWCASE                                 */}
        {/* ============================================================== */}
        {activeTab === "petals" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-purple-300 bg-black/60 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-md">
                MOONLIT PETALS // 11,000 CHERRY BLOSSOMS, CANOPY PHYSICS &amp; WARP
              </div>
              <div className="w-full h-[540px] relative">
                <MoonlitPetals style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: 11,000 Cherry Blossoms · Falling Petal Particles · Branch Physics · Halo &amp; Bokeh</span>
                <span className="text-purple-400">Night Backlit Tree Canopy</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: BLOOMING FLOWER SHOWCASE                                */}
        {/* ============================================================== */}
        {activeTab === "bloom" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-rose-300 bg-black/60 px-3 py-1 rounded-full border border-rose-500/30 backdrop-blur-md">
                BLOOMING FLOWER // 3D POINT-CLOUD PROCEDURAL FLOWER OPEN/CLOSE SPRING
              </div>
              <div className="w-full h-[540px] relative">
                <BloomingFlower style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: Hover-driven spring bloom · 3D cupped petal math · WebGL point cloud · Dynamic stem sway</span>
                <span className="text-rose-400">Hover Cursor To Bloom</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: STILL SUNSET MEADOW SHOWCASE                            */}
        {/* ============================================================== */}
        {activeTab === "sunset" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-amber-300 bg-black/60 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                STILL SUNSET MEADOW // 3D VOXEL PRAIRIE (THREE.JS + DAY CYCLE)
              </div>
              <div className="w-full h-[540px] relative">
                <StillSunsetMeadow style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/60">
                <span>Features: Voxel Instanced Blades &amp; Flowers · Dynamic Day-Night Cycle · Block Clouds · Interactive Push</span>
                <span className="text-amber-400">Three.js Voxel Engine</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
