import { useEffect, useState } from "react";
import { PinUIThermalDial } from "./PinUIThermalDial";
import { PuffyUIGlassArc } from "./PuffyUIGlassArc";
import { SketcherUISpringSlider } from "./SketcherUISpringSlider";

export type HudStyle = "pinui" | "puffy" | "sketcher";

const HUD_STYLE_KEY = "solar-hud-style";

export function SolarChronometer({
  externalStyle,
  onStyleChange,
}: {
  externalStyle?: HudStyle;
  onStyleChange?: (style: HudStyle) => void;
}) {
  const [style, setStyle] = useState<HudStyle>(() => {
    if (typeof window === "undefined") return "pinui";
    const stored = window.localStorage.getItem(HUD_STYLE_KEY) as HudStyle | null;
    if (stored === "pinui" || stored === "puffy" || stored === "sketcher") return stored;
    return "pinui";
  });

  const activeStyle = externalStyle || style;

  const handleSelect = (s: HudStyle) => {
    setStyle(s);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HUD_STYLE_KEY, s);
      window.dispatchEvent(new CustomEvent("hudstylechange", { detail: s }));
    }
    if (onStyleChange) onStyleChange(s);
  };

  useEffect(() => {
    const onExternalChange = (e: Event) => {
      const custom = e as CustomEvent<HudStyle>;
      if (custom.detail) setStyle(custom.detail);
    };
    window.addEventListener("hudstylechange", onExternalChange);
    return () => window.removeEventListener("hudstylechange", onExternalChange);
  }, []);

  return (
    <div className="solar-chronometer-root flex flex-col items-center">
      {/* Design Style Switcher Pills */}
      <div className="hud-style-switcher flex items-center gap-1 mb-2 p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleSelect("pinui")}
          className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider transition-all ${
            activeStyle === "pinui"
              ? "bg-white/20 text-white font-bold border border-white/30"
              : "text-white/40 hover:text-white/80"
          }`}
          title="PinUI ThermalDial (96-tick ring & comet wave)"
        >
          PinUI
        </button>
        <button
          type="button"
          onClick={() => handleSelect("puffy")}
          className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider transition-all ${
            activeStyle === "puffy"
              ? "bg-white/20 text-white font-bold border border-white/30"
              : "text-white/40 hover:text-white/80"
          }`}
          title="PuffyUI GlassArc (Frosted glass knob arc)"
        >
          Puffy Glass
        </button>
        <button
          type="button"
          onClick={() => handleSelect("sketcher")}
          className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider transition-all ${
            activeStyle === "sketcher"
              ? "bg-white/20 text-white font-bold border border-white/30"
              : "text-white/40 hover:text-white/80"
          }`}
          title="Sketcher SpringSlider (Architectural physics slider)"
        >
          Spring Slider
        </button>
      </div>

      {/* Active Design Style Rendering */}
      <div className="solar-chronometer-body">
        {activeStyle === "pinui" && <PinUIThermalDial />}
        {activeStyle === "puffy" && <PuffyUIGlassArc />}
        {activeStyle === "sketcher" && <SketcherUISpringSlider />}
      </div>
    </div>
  );
}
