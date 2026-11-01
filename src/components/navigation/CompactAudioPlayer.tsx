"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface CompactAudioPlayerProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

interface Track {
  title: string;
  artist: string;
}

const PLAYLIST: Track[] = [
  { title: "Terminal Frost", artist: "Pink Floyd" },
  { title: "An Ending (Ascent)", artist: "Brian Eno" },
  { title: "Persephone", artist: "Opeth" },
  { title: "Shine On You Crazy Diamond", artist: "Pink Floyd" },
];

export function CompactAudioPlayer({
  onPlayStateChange,
  className = "",
}: CompactAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>([4, 6, 4, 7]);
  const [showTooltip, setShowTooltip] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    gainNode: GainNode;
    oscillators: OscillatorNode[];
    filterNode: BiquadFilterNode;
  } | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = PLAYLIST[trackIdx];

  // Helper to safely start or resume Web Audio synthesized celestial ambient pad
  const startSynth = useCallback(() => {
    try {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // If already playing nodes, stop them first
      if (nodesRef.current) {
        try {
          nodesRef.current.gainNode.gain.cancelScheduledValues(ctx.currentTime);
          nodesRef.current.gainNode.gain.setValueAtTime(0, ctx.currentTime);
          nodesRef.current.oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
        } catch {
          // Ignore cleanup errors
        }
        nodesRef.current = null;
      }

      // Master gain node with smooth envelope ramp
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);

      // Warm celestial lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Chord frequencies: C3, G3, C4, E4 (Lush ambient suspension)
      const freqs = [130.81, 196.0, 261.63, 329.63];
      const oscillators: OscillatorNode[] = [];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        // Subtle micro-detune for lush celestial chorus
        osc.frequency.setValueAtTime(freq + (i - 1.5) * 0.45, ctx.currentTime);

        // Sub oscillator gain
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        oscillators.push(osc);
      });

      nodesRef.current = {
        gainNode: masterGain,
        oscillators,
        filterNode: filter,
      };
    } catch (err) {
      console.warn("Web Audio ambient pad initialization error:", err);
    }
  }, []);

  const stopSynth = useCallback(() => {
    try {
      if (audioCtxRef.current && nodesRef.current) {
        const ctx = audioCtxRef.current;
        const currentNodes = nodesRef.current;
        const { gainNode } = currentNodes;
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

        if (stopTimeoutRef.current) {
          clearTimeout(stopTimeoutRef.current);
        }

        stopTimeoutRef.current = setTimeout(() => {
          currentNodes.oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // Ignore
            }
          });
          if (nodesRef.current === currentNodes) {
            nodesRef.current = null;
          }
          stopTimeoutRef.current = null;
        }, 650);
      }
    } catch {
      // Ignore
    }
  }, []);

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (onPlayStateChange) onPlayStateChange(nextState);

    if (nextState) {
      startSynth();
    } else {
      stopSynth();
    }
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackIdx((prev) => (prev + 1) % PLAYLIST.length);
  };

  // Equalizer visualizer animation loop
  useEffect(() => {
    if (!isPlaying) {
      setBarHeights([4, 6, 4, 7]);
      return;
    }

    const interval = setInterval(() => {
      // 4 dynamic visualizer bars: heights between 4px and 16px
      setBarHeights([
        Math.floor(6 + Math.random() * 8),
        Math.floor(10 + Math.random() * 7),
        Math.floor(7 + Math.random() * 9),
        Math.floor(9 + Math.random() * 8),
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      if (nodesRef.current && audioCtxRef.current) {
        try {
          nodesRef.current.oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
        } catch {
          // Ignore
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return (
    <div
      className={`relative flex items-center gap-2 select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? "Pause Ambient Soundscape" : "Play Ambient Soundscape"}
        aria-label={isPlaying ? "Pause soundscape" : "Play soundscape"}
        className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-white/40"
      >
        {isPlaying ? (
          // Pause Icon
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          // Play Icon
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* 4 Dynamic Animated Equalizer Bars */}
      <button
        type="button"
        onClick={handleNextTrack}
        title="Cycle next ambient soundscape track"
        className="flex items-end gap-[2px] h-4 py-0.5 px-0.5 cursor-pointer group focus:outline-none"
        aria-label="Next track"
      >
        {barHeights.map((h, i) => (
          <span
            key={i}
            className={`w-[2.5px] rounded-full transition-all duration-100 ${
              isPlaying
                ? "bg-emerald-400 group-hover:bg-emerald-300"
                : "bg-white/30 group-hover:bg-white/60"
            }`}
            style={{
              height: `${h}px`,
            }}
          />
        ))}
      </button>

      {/* Track Title Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute -bottom-9 right-0 z-50 whitespace-nowrap px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/15 shadow-xl text-[10px] font-mono text-white/90 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          <span className="text-emerald-400 font-semibold">{currentTrack.artist}</span>
          <span className="text-white/40 mx-1">·</span>
          <span>{currentTrack.title}</span>
          <span className="text-white/40 ml-1.5 text-[8.5px]">({isPlaying ? "Playing" : "Paused"})</span>
        </div>
      )}
    </div>
  );
}
