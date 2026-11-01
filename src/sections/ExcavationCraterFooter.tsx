"use client";

import { useEffect, useState } from "react";

export function ExcavationCraterFooter() {
  const [copied, setCopied] = useState(false);
  const [handleCopied, setHandleCopied] = useState(false);
  const [_activeSocial, setActiveSocial] = useState<string | null>(null);
  const [ignitionActive, setIgnitionActive] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [times, setTimes] = useState({ surat: "", sf: "", utc: "" });

  // Update multi-timezone clocks every second
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      const format = (tz: string) =>
        now.toLocaleTimeString("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

      setTimes({
        surat: format("Asia/Kolkata"),
        sf: format("America/Los_Angeles"),
        utc: format("UTC"),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close consultation modal on Escape key
  useEffect(() => {
    if (!showCallModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCallModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCallModal]);

  const handleCopyEmail = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText("rudraksh.singhh@outlook.com");
      }
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyHandle = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText("@rudrakshsinghh");
      }
    } catch {
      // Fallback
    }
    setHandleCopied(true);
    setTimeout(() => setHandleCopied(false), 2500);
  };

  const handleReturnToOrbit = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIgnitionToggle = () => {
    if (ignitionActive || showCallModal) return;
    setIgnitionActive(true);
    setTimeout(() => {
      setShowCallModal(true);
      setIgnitionActive(false);
    }, 400);
  };

  return (
    <footer id="contact" className="excavation-crater-footer relative w-full overflow-hidden bg-gradient-to-b from-[#080a0f] via-[#050608] to-[#020304] pt-20 pb-16 text-white border-t border-white/10">
      {/* Alias anchor so older /#crater deep links still land here. */}
      <span id="crater" aria-hidden="true" className="absolute top-0" />
      {/* Horizon divider (the `crater-rim` class is kept as a stable hook). */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 mb-12">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 text-center">
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400/80 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>COMMON GROUND · SURAT, INDIA · 21°N</span>
          </div>

          <svg
            viewBox="0 0 1200 60"
            className="crater-rim w-full h-12 overflow-visible mx-auto opacity-75"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="craterRock" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
                <stop offset="20%" stopColor="#334155" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#475569" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#334155" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 50 Q 300 20 600 35 Q 900 20 1200 50"
              stroke="url(#craterRock)"
              strokeWidth="2"
              fill="none"
              className="crater-rim"
            />
          </svg>
        </div>
      </div>

      {/* ============================================================== */}
      {/* REFINED EDITORIAL FOOTER CONTENT                               */}
      {/* ============================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* 1. Designer Inscription Plaque */}
        <div className="md:col-span-5 p-7 rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-emerald-400/90 mb-3">
            FIELD NOTE
          </div>
          <h3 className="font-serif text-[28px] font-normal tracking-tight text-white mb-3 leading-snug">
            &ldquo;From this ground, we build systems.&rdquo;
          </h3>
          <p className="font-sans text-[14px] font-light text-white/70 leading-relaxed mb-5">
            Every enduring interface starts with solid bedrock: unyielding clarity on what decisions humans must make,
            and where autonomous systems must step back.
          </p>
          <div className="flex items-center gap-2 font-mono text-[10.5px] text-white/40">
            <span>RUDRAKSH SINGH</span>
            <span>·</span>
            <span>2024 — {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* 2. Direct Engagement & Communication Channels */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Consultation / Call Card */}
          <div className="p-7 rounded-2xl border border-white/15 bg-neutral-900/50 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>LET&apos;S TALK</span>
              </div>
              <div className="font-sans text-[17px] font-semibold text-white">
                Book an architecture briefing
              </div>
              <div className="font-sans text-[13px] text-white/60 mt-0.5">
                Direct discussion on product design, AI command interfaces, and design engineering.
              </div>
            </div>

            <button
              type="button"
              onClick={handleIgnitionToggle}
              className={`group relative px-6 py-3 rounded-xl border font-mono text-[12px] uppercase tracking-wider font-semibold transition-all shadow-md ${
                ignitionActive
                  ? "bg-amber-400 text-black border-amber-300 shadow-amber-400/30"
                  : "bg-white/10 border-white/20 text-white hover:border-amber-400/60 hover:bg-white/15"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>Start a Conversation →</span>
              </span>
            </button>
          </div>

          {/* Social Channels & Global Timezone Clocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Social Channels */}
            <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9.5px] uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>CHANNELS</span>
                </div>
                <span className="font-mono text-[9px] text-white/40">ONE HANDLE</span>
              </div>

              {/* Unified Handle Dock */}
              <div className="py-2 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleCopyHandle}
                  className="group px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-cyan-400/80 shadow-sm flex items-center gap-2 transition-all hover:scale-105"
                  title="Click to copy handle"
                >
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-[13px] font-bold text-white tracking-wide">
                    @rudrakshsinghh
                  </span>
                  <span className="font-mono text-[10px] text-white/50 group-hover:text-cyan-300">
                    {handleCopied ? "✓ COPIED" : "⧉"}
                  </span>
                </button>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-2.5 mt-4">
                  <a
                    href="https://x.com/rudrakshsinghh"
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => setActiveSocial("x")}
                    onMouseLeave={() => setActiveSocial(null)}
                    className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/20 border border-white/15 hover:border-white text-white flex items-center justify-center transition-all hover:scale-110 font-bold text-[12px]"
                    title="X (Twitter)"
                  >
                    𝕏
                  </a>

                  <a
                    href="https://github.com/rudy0Z"
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => setActiveSocial("github")}
                    onMouseLeave={() => setActiveSocial(null)}
                    className="h-9 w-9 rounded-full bg-white/5 hover:bg-emerald-950/60 border border-white/15 hover:border-emerald-400 text-white flex items-center justify-center transition-all hover:scale-110 font-mono text-[11px]"
                    title="GitHub"
                  >
                    gh
                  </a>

                  <a
                    href="https://linkedin.com/in/rudraksh-singh"
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => setActiveSocial("linkedin")}
                    onMouseLeave={() => setActiveSocial(null)}
                    className="h-9 w-9 rounded-full bg-white/5 hover:bg-sky-950/60 border border-white/15 hover:border-sky-400 text-white flex items-center justify-center transition-all hover:scale-110 font-bold text-[11px]"
                    title="LinkedIn"
                  >
                    in
                  </a>

                  <a
                    href="mailto:rudraksh.singhh@outlook.com"
                    onMouseEnter={() => setActiveSocial("mail")}
                    onMouseLeave={() => setActiveSocial(null)}
                    className="h-9 w-9 rounded-full bg-white/5 hover:bg-amber-950/60 border border-white/15 hover:border-amber-400 text-white flex items-center justify-center transition-all hover:scale-110 text-[13px]"
                    title="Direct Mail"
                  >
                    ✉
                  </a>
                </div>
              </div>

              {/* Direct Email Strip */}
              <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between font-mono text-[11px]">
                <span className="text-white/40">Direct:</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-white/90 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <span>rudraksh.singhh@outlook.com</span>
                  <span className="text-[10px] text-white/50">{copied ? "✓" : "⧉"}</span>
                </button>
              </div>
            </div>

            {/* Multi-Timezone Clocks */}
            <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col justify-between">
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-white/50 mb-3">
                TIME ZONES
              </div>
              <div className="space-y-2.5 font-mono text-[11.5px]">
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-white/40">SURAT (IST)</span>
                  <span className="font-semibold text-emerald-400">{times.surat || "12:00:00"}</span>
                </div>
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-white/40">SAN FRANCISCO (PT)</span>
                  <span className="text-sky-300">{times.sf || "12:00:00"}</span>
                </div>
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-white/40">UNIVERSAL (UTC)</span>
                  <span className="text-white/60">{times.utc || "12:00:00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back-to-top button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/40">
        <div>TYPE GARDEN — GROWN UNDER A LIVE 24-HOUR SKY · 21°N</div>

        <button
          type="button"
          onClick={handleReturnToOrbit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:text-white text-white/80 transition-all shadow-sm"
        >
          <span aria-hidden="true">▲</span>
          <span>BACK TO THE GARDEN</span>
        </button>
      </div>

      {/* Consultation Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300">
                ARCHITECTURE BRIEFING
              </span>
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                aria-label="Close"
                className="font-mono text-[14px] text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h4 className="font-serif text-[22px] font-medium text-white mb-2">
              Schedule a briefing
            </h4>
            <p className="font-sans text-[13px] text-white/60 mb-6 font-light">
              Let&apos;s evaluate your system constraints, autonomous AI interaction models, or product vision.
            </p>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:rudraksh.singhh@outlook.com?subject=Product%20Architecture%20Inquiry"
                className="w-full block py-3 text-center rounded-xl bg-white text-black font-semibold text-[13px] hover:bg-amber-300 transition-colors"
              >
                Send an email →
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full py-2.5 rounded-xl border border-white/20 font-mono text-[11px] text-white/80 hover:bg-white/5"
              >
                {copied ? "✓ Copied to Clipboard" : "Copy Direct Email (rudraksh.singhh@outlook.com)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default ExcavationCraterFooter;
