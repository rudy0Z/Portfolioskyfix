import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply

PATH = r"D:\Portfolioskyfix\src\sky\ThermalSkyClock.tsx"

apply(PATH, [

# ── 1. spectrum: derive the skin (the sky at this hour) + adaptive ink ──────
('''  return {
    headHex,
    crestHex,
    bodyHex,
    midTrailHex,
    farTrailHex,
    leadHex,
    rawNow: palNow,
    rawTrailMid: palTrailMid,
    rawTrailFar: palTrailFar,
  };
}''',
'''  /* the skin — the card wears the sky itself at the set hour */
  const skyDeep = mixOklch(palNow.horizon, { l: 0.13, c: 0.04, h: 252 }, 0.72);
  const darkSkin = skyDeep.l < 0.45;
  const glowHex = boost(palNow.sunGlow, 0.06, 1.3);

  return {
    headHex,
    crestHex,
    bodyHex,
    midTrailHex,
    farTrailHex,
    leadHex,
    rawNow: palNow,
    rawTrailMid: palTrailMid,
    rawTrailFar: palTrailFar,
    skyZenithHex: boost(palNow.zenith, 0.02, 1.08),
    skyMidHex: boost(palNow.mid, 0.0, 1.05),
    skyDeepHex: oklch(skyDeep),
    glowHex,
    /* ink that stays readable whatever the sky is doing */
    darkSkin,
    skinL: skyDeep.l,
    inkStrong: darkSkin ? "#F7F5F0" : "#182031",
    inkDim: darkSkin ? "rgba(247, 245, 240, 0.32)" : "rgba(16, 22, 38, 0.35)",
    lumeHex: darkSkin ? headHex : glowHex,
    accentHex: darkSkin
      ? headHex
      : oklch({ l: 0.34, c: Math.max(0.07, palNow.horizon.c * 0.85), h: palNow.horizon.h }),
  };
}'''),

# ── 2. state: drop per-frame React state, add direct-DOM refs ───────────────
('''  const [isDragging, setIsDragging] = useState(false);
  const [hoverAngle, setHoverAngle] = useState<number | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);''',
'''  const [isDragging, setIsDragging] = useState(false);
  const [hoverAngle, setHoverAngle] = useState<number | null>(null);
  /* Direct-DOM handles: the travelling tick wave and the sweeping second hand
     run outside React (like the Thermal Dial's engine), so live mode costs
     zero re-renders per frame. */
  const secondHandRef = useRef<SVGGElement>(null);
  const tickElsRef = useRef<(SVGLineElement | null)[]>([]);
  const tickGeoRef = useRef<{ deg: number; outerR: number; amp: number }[]>([]);
  const syncModeRef = useRef(syncMode);
  syncModeRef.current = syncMode;'''),

# ── 3. the live engine: wave + second hand, one rAF, no setState ────────────
('''  // Smooth sweeping seconds when synced to real-time clock
  useEffect(() => {
    if (syncMode !== "auto") return;
    let raf = 0;
    const tick = () => {
      const now = new Date();
      setLiveSeconds(now.getSeconds() + now.getMilliseconds() / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [syncMode]);''',
'''  // The living layer: the Pin UI travelling wave undulates the lit tick tips
  // and the second hand sweeps — all by direct attribute mutation.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let phase = Math.random() * 10;
    const loop = () => {
      phase += 0.037; // ≈ 2.2 rad/s
      const geo = tickGeoRef.current;
      for (let i = 0; i < geo.length; i++) {
        const g = geo[i];
        const el = tickElsRef.current[i];
        if (!el) continue;
        const p = polar(g.outerR + Math.sin(phase - i * 0.35) * g.amp, g.deg);
        el.setAttribute("x2", p.x.toFixed(2));
        el.setAttribute("y2", p.y.toFixed(2));
      }
      if (syncModeRef.current === "auto") {
        const now = new Date();
        const s = now.getSeconds() + now.getMilliseconds() / 1000;
        secondHandRef.current?.setAttribute(
          "transform",
          `rotate(${(s * 6).toFixed(2)} ${CX} ${CY})`
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Geometry snapshot for the wave engine, refreshed after every render.
  useEffect(() => {
    tickGeoRef.current = ticks.map((tk) => ({
      deg: tk.deg,
      outerR: tk.outerR,
      amp: 0.8 + tk.energy * 3.2,
    }));
  }, [ticks]);'''),

# ── 4. second angle: rAF owns it in live mode ────────────────────────────────
('''  const secondAngle =
    syncMode === "auto" ? liveSeconds * 6 : (((t * 3600) % 60) / 60) * 360;''',
'''  // In live mode the rAF engine sweeps the second hand directly; this value
  // only covers manual mode and the first painted frame.
  const secondAngle =
    syncMode === "auto" ? 0 : (((t * 3600) % 60) / 60) * 360;'''),

# ── 5. ticks: contrast-aware lit color, expose wave geometry ────────────────
('''      const strokeWidth =
        (isMajor ? 1.65 : 1.05) + head * 1.55 + trail * 0.65 + hoverBoost * 0.5;
      const opacity = isMajor
        ? 0.38 + energy * 0.62
        : 0.16 + energy * 0.84;

      return {
        i,
        deg,
        p1,
        p2,
        energy,
        head,
        isMajor,
        strokeWidth,
        opacity,
        color: energy > 0.06 ? activeTickHex : "rgba(255, 255, 255, 0.28)",
      };
    });
  }, [hourAngle, hoverAngle, isDragging, spectrum.rawNow.sunCore, t]);''',
'''      const strokeWidth =
        (isMajor ? 1.65 : 1.05) + head * 1.55 + trail * 0.65 + hoverBoost * 0.5;
      const opacity = isMajor
        ? 0.38 + energy * 0.62
        : 0.16 + energy * 0.84;

      /* contrast-aware ink: on a bright noon skin the ticks darken into it,
         on deep skins they lift out of it */
      const litHex = spectrum.darkSkin
        ? activeTickHex
        : oklch({
            l: Math.min(
              Math.max(blendedOklch.l, 0.2),
              Math.max(0.2, spectrum.skinL - 0.18)
            ),
            c: Math.min(0.3, blendedOklch.c * (1.1 + energy * 0.2)),
            h: blendedOklch.h,
          });

      return {
        i,
        deg,
        p1,
        p2,
        energy,
        head,
        isMajor,
        strokeWidth,
        opacity,
        outerR,
        color: energy > 0.06 ? litHex : "var(--tsc-ink-dim)",
      };
    });
  }, [hourAngle, hoverAngle, isDragging, spectrum, t]);'''),

# ── 6. root vars: publish the skin ───────────────────────────────────────────
('''          "--tsc-zone-x": `${zoneX}%`,
          "--tsc-zone-y": `${zoneY}%`,
          "--tsc-angle": `${hourAngle}deg`,
        } as React.CSSProperties''',
'''          "--tsc-zone-x": `${zoneX}%`,
          "--tsc-zone-y": `${zoneY}%`,
          "--tsc-angle": `${hourAngle}deg`,
          "--tsc-sky-zenith": spectrum.skyZenithHex,
          "--tsc-sky-mid": spectrum.skyMidHex,
          "--tsc-sky-deep": spectrum.skyDeepHex,
          "--tsc-glow": spectrum.glowHex,
          "--tsc-ink": spectrum.inkStrong,
          "--tsc-ink-dim": spectrum.inkDim,
          "--tsc-lume": spectrum.lumeHex,
          "--tsc-accent": spectrum.accentHex,
        } as React.CSSProperties'''),

# ── 7. skin layers in the root ───────────────────────────────────────────────
('''      {/* Ambient Pin UI Thermal Heat Wash (Conic + Radial Travelling Glow) */}
      <div className="tsc-heat-aura" aria-hidden="true" />''',
'''      {/* The sky skin: gradient body, horizon wash, hairline rim, bloom */}
      <div className="tsc-skin" aria-hidden="true">
        <div className="tsc-skin-wash" />
      </div>
      <div className="tsc-skin-rim" aria-hidden="true" />
      <div className="tsc-bloom" aria-hidden="true" />
      <div className="tsc-halo" aria-hidden="true" />

      {/* Ambient Pin UI Thermal Heat Wash (Conic + Radial Travelling Glow) */}
      <div className="tsc-heat-aura" aria-hidden="true" />'''),

# ── 8. the bezel is gone — the skin is the face ─────────────────────────────
('''          {/* Outer Stationary Luxury Bezel */}
          <circle
            cx={CX}
            cy={CY}
            r={112}
            fill="rgba(8, 10, 18, 0.92)"
            stroke={`url(#tsc-bezel-${uid})`}
            strokeWidth={1.5}
          />
          <circle
            cx={CX}
            cy={CY}
            r={108}
            fill={`url(#tsc-face-${uid})`}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={0.75}
          />''',
'''          {/* No bezel — the sky skin itself is the face. */}'''),

# ── 9. tick nodes: ref + style-carried stroke (var() support) ───────────────
('''                {ticks.map((tk) => (
                  <line
                    key={tk.i}
                    x1={tk.p1.x}
                    y1={tk.p1.y}
                    x2={tk.p2.x}
                    y2={tk.p2.y}
                    stroke={tk.color}
                    strokeWidth={tk.strokeWidth}
                    strokeLinecap="round"
                    strokeOpacity={tk.opacity}
                    filter={tk.head > 0.55 ? `url(#tsc-glow-${uid})` : undefined}
                  />
                ))}''',
'''                {ticks.map((tk) => (
                  <line
                    key={tk.i}
                    ref={(el) => {
                      if (el) tickElsRef.current[tk.i] = el;
                    }}
                    x1={tk.p1.x}
                    y1={tk.p1.y}
                    x2={tk.p2.x}
                    y2={tk.p2.y}
                    style={{ stroke: tk.color }}
                    strokeWidth={tk.strokeWidth}
                    strokeLinecap="round"
                    strokeOpacity={tk.opacity}
                    filter={tk.head > 0.55 ? `url(#tsc-glow-${uid})` : undefined}
                  />
                ))}'''),

# ── 10. second hand: ref for the sweep ──────────────────────────────────────
('''                  <g
                    transform={`rotate(${secondAngle} ${CX} ${CY})`}
                    style={{ pointerEvents: "none" }}
                  >''',
'''                  <g
                    ref={secondHandRef}
                    transform={`rotate(${secondAngle} ${CX} ${CY})`}
                    style={{ pointerEvents: "none" }}
                  >'''),

# ── 11. hands & accents go ink-aware ─────────────────────────────────────────
('''                      fill="#F4F2ED"
                      stroke="rgba(10, 12, 20, 0.6)"
                      strokeWidth={0.6}''',
'''                      fill="var(--tsc-ink, #F4F2ED)"
                      stroke="rgba(10, 12, 20, 0.45)"
                      strokeWidth={0.6}'''),
('''                    <rect
                      x={CX - 2.4}
                      y={CY - 74}
                      width={4.8}
                      height={88}
                      rx={2.4}
                      fill="#FBF9F5"
                      stroke="rgba(10, 12, 20, 0.6)"
                      strokeWidth={0.6}
                    />''',
'''                    <rect
                      x={CX - 2.4}
                      y={CY - 74}
                      width={4.8}
                      height={88}
                      rx={2.4}
                      fill="var(--tsc-ink, #FBF9F5)"
                      stroke="rgba(10, 12, 20, 0.45)"
                      strokeWidth={0.6}
                    />'''),
('''                      fill={spectrum.crestHex}''',
'''                      fill="var(--tsc-lume)"'''),
('''                    <rect
                      x={CX - 1.3}
                      y={CY - 46}
                      width={2.6}
                      height={36}
                      rx={1.3}
                      fill={spectrum.headHex}
                    />''',
'''                    <rect
                      x={CX - 1.3}
                      y={CY - 46}
                      width={2.6}
                      height={36}
                      rx={1.3}
                      fill="var(--tsc-lume)"
                    />'''),
('''                      stroke={spectrum.headHex}
                      strokeWidth={1.15}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={CX}
                      cy={CY + 12}
                      r={2.6}
                      fill="rgba(10, 12, 20, 0.9)"
                      stroke={spectrum.headHex}
                      strokeWidth={1.15}
                    />''',
'''                      stroke="var(--tsc-lume)"
                      strokeWidth={1.15}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={CX}
                      cy={CY + 12}
                      r={2.6}
                      fill="rgba(10, 12, 20, 0.9)"
                      stroke="var(--tsc-lume)"
                      strokeWidth={1.15}
                    />'''),
('''                  <circle
                    cx={CX}
                    cy={CY}
                    r={5.6}
                    fill="#141724"
                    stroke="#FBF9F5"
                    strokeWidth={1.4}
                  />
                  <circle cx={CX} cy={CY} r={2.1} fill={spectrum.headHex} />''',
'''                  <circle
                    cx={CX}
                    cy={CY}
                    r={5.6}
                    fill="#141724"
                    stroke="var(--tsc-ink, #FBF9F5)"
                    strokeWidth={1.4}
                  />
                  <circle cx={CX} cy={CY} r={2.1} fill="var(--tsc-accent)" />'''),
('''                r={isThumbnail ? 3.2 : 2.6}
                fill={spectrum.headHex}
                filter={`url(#tsc-glow-${uid})`}''',
'''                r={isThumbnail ? 3.2 : 2.6}
                fill="var(--tsc-accent)"
                filter={`url(#tsc-glow-${uid})`}'''),

# ── 12. thumbnail time readout — the half-time-focused look ─────────────────
('''      {/* Bottom Live Readout & Quick Solar Anchors (Full View) */}''',
'''      {/* Thumbnail time readout — the half-time-focused look */}
      {isThumbnail && (
        <div className="tsc-thumb-time" aria-hidden="true">
          {formatted}
        </div>
      )}

      {/* Bottom Live Readout & Quick Solar Anchors (Full View) */}'''),

# ── 13. digital current digit goes ink-aware ────────────────────────────────
('''              style={{
                color: isCurrent ? "#FBF9F5" : undefined,''',
'''              style={{
                color: isCurrent ? "var(--tsc-ink, #FBF9F5)" : undefined,'''),
])
