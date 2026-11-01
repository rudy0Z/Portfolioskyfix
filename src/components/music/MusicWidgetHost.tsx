import { useState, useEffect } from "react";

export type MusicWidgetStyle = "pinui" | "puffy" | "transistor" | "vinyl";

const MUSIC_STYLE_KEY = "music-widget-style";

interface Track {
  title: string;
  artist: string;
  album: string;
}

const PLAYLIST: Track[] = [
  {
    title: "Terminal Frost",
    artist: "Pink Floyd",
    album: "A Momentary Lapse of Reason (1987)",
  },
  {
    title: "Persephone",
    artist: "Opeth",
    album: "Sorceress (2016)",
  },
  {
    title: "Shine On You Crazy Diamond",
    artist: "Pink Floyd",
    album: "Wish You Were Here (1975)",
  },
  {
    title: "An Ending (Ascent)",
    artist: "Brian Eno",
    album: "Apollo: Atmospheres and Soundtracks",
  },
];

export function MusicWidgetHost({
  defaultStyle = "pinui",
  externalStyle,
  onStyleChange,
}: {
  defaultStyle?: MusicWidgetStyle;
  externalStyle?: MusicWidgetStyle;
  onStyleChange?: (s: MusicWidgetStyle) => void;
}) {
  const [style, setStyle] = useState<MusicWidgetStyle>(() => {
    if (typeof window === "undefined") return defaultStyle;
    const stored = window.localStorage.getItem(MUSIC_STYLE_KEY) as MusicWidgetStyle | null;
    return stored || defaultStyle;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const activeStyle = externalStyle || style;
  const currentTrack = PLAYLIST[trackIdx];

  const handleNextTrack = () => {
    setTrackIdx((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrevTrack = () => {
    setTrackIdx((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleSelect = (s: MusicWidgetStyle) => {
    setStyle(s);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MUSIC_STYLE_KEY, s);
      window.dispatchEvent(new CustomEvent("musicstylechange", { detail: s }));
    }
    if (onStyleChange) onStyleChange(s);
  };

  useEffect(() => {
    const onExt = (e: Event) => {
      const custom = e as CustomEvent<MusicWidgetStyle>;
      if (custom.detail) setStyle(custom.detail);
    };
    window.addEventListener("musicstylechange", onExt);
    return () => window.removeEventListener("musicstylechange", onExt);
  }, []);

  return (
    <div className="music-widget-host flex flex-col items-center p-4 rounded-2xl border border-white/10 bg-neutral-900/70 backdrop-blur-xl">
      {/* Style Switcher Pills */}
      <div className="flex items-center gap-1.5 mb-4 p-1 rounded-full bg-black/40 border border-white/10 font-mono text-[9px] uppercase tracking-wider">
        <button
          type="button"
          onClick={() => handleSelect("pinui")}
          className={`px-2.5 py-1 rounded-full transition-all ${
            activeStyle === "pinui" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"
          }`}
        >
          PinUI VU
        </button>
        <button
          type="button"
          onClick={() => handleSelect("puffy")}
          className={`px-2.5 py-1 rounded-full transition-all ${
            activeStyle === "puffy" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"
          }`}
        >
          Puffy Pill
        </button>
        <button
          type="button"
          onClick={() => handleSelect("transistor")}
          className={`px-2.5 py-1 rounded-full transition-all ${
            activeStyle === "transistor" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"
          }`}
        >
          Transistor
        </button>
        <button
          type="button"
          onClick={() => handleSelect("vinyl")}
          className={`px-2.5 py-1 rounded-full transition-all ${
            activeStyle === "vinyl" ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"
          }`}
        >
          Vinyl
        </button>
      </div>

      {/* Track Info & Next/Prev Controls */}
      <div className="text-center mb-3 w-full">
        <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ON REPEAT // SPOTIFY STUDIO SESSIONS</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-1">
          <button
            type="button"
            onClick={handlePrevTrack}
            className="text-white/40 hover:text-white font-mono text-[12px] transition-colors"
            title="Previous Track"
          >
            ◀
          </button>
          <div className="flex flex-col items-center max-w-[200px]">
            <span className="font-serif text-[15px] text-white font-medium truncate">
              {currentTrack.title}
            </span>
            <span className="font-mono text-[10.5px] text-white/50 truncate">
              {currentTrack.artist} — {currentTrack.album}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNextTrack}
            className="text-white/40 hover:text-white font-mono text-[12px] transition-colors"
            title="Next Track"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Render Active Style */}
      <div className="w-full flex items-center justify-center min-h-[120px]">
        {/* 1. PinUI VU Meter Style */}
        {activeStyle === "pinui" && (
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 160 90" className="w-40 h-24 overflow-visible">
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="4"
              />
              <path
                d="M 115 40 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
              />
              {/* Needle */}
              <line
                x1="80"
                y1="80"
                x2={isPlaying ? "110" : "60"}
                y2={isPlaying ? "35" : "45"}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <circle cx="80" cy="80" r="5" fill="#f59e0b" />
            </svg>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-[10px]"
              >
                {isPlaying ? "PAUSE ❚❚" : "PLAY SOUNDTRACK ▶"}
              </button>
            </div>
          </div>
        )}

        {/* 2. PuffyUI Glass Pill Player Style */}
        {activeStyle === "puffy" && (
          <div className="flex items-center gap-4 px-5 py-3 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            {/* Animated Audio Equalizer Bars */}
            <div className="flex items-center gap-1 h-6">
              {[12, 22, 16, 24, 18, 14, 20].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-sky-300 transition-all ${
                    isPlaying ? "animate-pulse" : "opacity-40"
                  }`}
                  style={{
                    height: isPlaying ? `${h}px` : "6px",
                    animationDuration: `${0.4 + i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-white/70">02:14 / 04:26</span>
          </div>
        )}

        {/* 3. Retro Transistor Radio Style */}
        {activeStyle === "transistor" && (
          <div className="w-56 p-3 rounded-xl border border-amber-900/40 bg-gradient-to-b from-[#2a1b12] to-[#1a110b] shadow-inner text-amber-100 flex flex-col items-center">
            <div className="w-full flex justify-between font-mono text-[8px] text-amber-400/60 pb-1 border-b border-amber-900/40">
              <span>AM 540 · 800 · 1200</span>
              <span>FM 88 · 96 · 104</span>
            </div>
            <div className="relative w-full h-8 flex items-center my-1 bg-black/40 rounded px-2">
              <div
                className="absolute top-1 bottom-1 w-0.5 bg-red-500 shadow-[0_0_6px_red] transition-all"
                style={{ left: isPlaying ? "65%" : "30%" }}
              />
              <span className="font-mono text-[10px] text-amber-200">100.0 FM // LOKAI FREQ</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="mt-1 px-4 py-1 rounded bg-amber-800/40 hover:bg-amber-700/60 font-mono text-[9.5px] uppercase tracking-wider text-amber-200"
            >
              {isPlaying ? "POWER OFF" : "TUNE IN (AM/FM)"}
            </button>
          </div>
        )}

        {/* 4. Vinyl Turntable Style */}
        {activeStyle === "vinyl" && (
          <div className="flex items-center gap-4">
            {/* Spinning Vinyl Record */}
            <div
              className={`relative h-20 w-20 rounded-full bg-neutral-950 border border-neutral-800 shadow-2xl flex items-center justify-center ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "3s" }}
            >
              <div className="absolute inset-1 rounded-full border border-neutral-800/80" />
              <div className="absolute inset-3 rounded-full border border-neutral-800/60" />
              <div className="h-8 w-8 rounded-full bg-rose-600 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-black" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">
                33⅓ RPM STEREO
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 font-mono text-[10px] text-white"
              >
                {isPlaying ? "LIFT NEEDLE" : "DROP NEEDLE ▶"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
