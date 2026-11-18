import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply, replace_region

PATH = r"D:\Portfolioskyfix\src\styles\global.css"

START = """/* ==========================================================================
   ThermalSkyClock — Pin UI Thermal Dial × LensClock Hybrid
   ========================================================================== */"""

END = "/* ── site top chrome ──"

NEW_CSS = """/* ==========================================================================
   ThermalSkyClock — the sky instrument.
   Body: Pin UI Thermal Dial's card (gradient object, hairline rim lit top /
   warm floor, heat wash rising from the bottom edge, bloom bleeding out) with
   its palette rewritten live from the site's sky palette. Dial: LensClock's
   panned camera — the thumbnail shows a big half-view of the arc opposite the
   hour hand. Every length is a fraction of --skc-w so it scales as one object.
   ========================================================================== */

.skc-root {
  --skc-w: 54px;
  position: relative;
  width: var(--skc-w);
  aspect-ratio: 1;
  color: #fbf9f5;
  font-family: var(--font-body);
  user-select: none;
  -webkit-user-select: none;
  isolation: isolate;
  transition:
    width 0.46s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}
.skc-root--thumbnail { --skc-w: 54px; cursor: pointer; }
.skc-root--full { --skc-w: 268px; }

/* travelling conic aura behind the card (brightens while dragging) */
.skc-aura {
  position: absolute;
  inset: -9px;
  z-index: -1;
  border-radius: 30%;
  pointer-events: none;
  opacity: 0.55;
  filter: blur(22px);
  background: conic-gradient(
    from calc(var(--skc-angle, 0deg) - 120deg) at 50% 50%,
    transparent 0deg,
    var(--skc-trail-far) 35deg,
    var(--skc-body) 85deg,
    var(--skc-head) 125deg,
    transparent 165deg,
    transparent 360deg
  );
  transition: opacity 0.25s ease;
}
.skc-root.is-dragging .skc-aura { opacity: 0.92; filter: blur(26px); }

/* the bloom & halo — the horizon glow bleeding out from under the card */
.skc-bloom,
.skc-halo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.9;
  transition: opacity 0.6s ease;
}
.skc-bloom {
  left: 8%;
  right: 8%;
  bottom: calc(var(--skc-w) * -0.085);
  height: calc(var(--skc-w) * 0.24);
  background: radial-gradient(
    closest-side,
    var(--skc-wash-core) 0%,
    color-mix(in srgb, var(--skc-wash-c2) 72%, transparent) 55%,
    transparent 100%
  );
  filter: blur(calc(var(--skc-w) * 0.07));
}
.skc-halo {
  inset: 42% -5% -3%;
  background: radial-gradient(
    60% 50% at 50% 82%,
    color-mix(in srgb, var(--skc-wash-c2) 38%, transparent),
    transparent 70%
  );
  filter: blur(calc(var(--skc-w) * 0.085));
}

/* the card object */
.skc-card {
  position: absolute;
  inset: 0;
  border-radius: 27%;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  outline: none;
  background: radial-gradient(
    125% 92% at 50% -2%,
    var(--skc-top) 0%,
    var(--skc-midbody) 50%,
    var(--skc-deep) 100%
  );
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.045),
    0 18px 44px -14px rgba(2, 4, 10, 0.85),
    0 44px 90px -30px rgba(2, 4, 10, 0.7);
  transition: background 0.5s ease;
  -webkit-tap-highlight-color: transparent;
}
.skc-root.is-dragging .skc-card { cursor: grabbing; }
.skc-root--thumbnail:hover .skc-card {
  transform: translateY(-1px);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.5s ease;
}
.skc-card:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, var(--skc-wash-c3) 55%, transparent), 0 18px 44px -14px rgba(2, 4, 10, 0.85); }

/* the heat wash — the horizon rising from the floor of the card */
.skc-clip {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
}
.skc-wash {
  position: absolute;
  inset: 0;
  transform-origin: 50% 100%;
  background:
    radial-gradient(
      62% 20% at 50% 103%,
      var(--skc-wash-core) 0%,
      color-mix(in srgb, var(--skc-wash-c3) 70%, transparent) 42%,
      transparent 82%
    ),
    linear-gradient(
      0deg,
      var(--skc-wash-c3) 0%,
      var(--skc-wash-c2) 10%,
      var(--skc-wash-c1) 22%,
      transparent 44%
    );
  filter: blur(calc(var(--skc-w) * 0.02));
  animation: skcBreathe 5.6s ease-in-out infinite;
}
@keyframes skcBreathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.035); }
}

/* the lower side walls catch the horizon light too */
.skc-walls {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 calc(var(--skc-w) * -0.018) calc(var(--skc-w) * 0.05) calc(var(--skc-w) * -0.012) color-mix(in srgb, var(--skc-wash-c3) 72%, white),
    inset calc(var(--skc-w) * 0.014) calc(var(--skc-w) * -0.045) calc(var(--skc-w) * 0.05) calc(var(--skc-w) * -0.03) color-mix(in srgb, var(--skc-wash-c2) 72%, transparent),
    inset calc(var(--skc-w) * -0.014) calc(var(--skc-w) * -0.045) calc(var(--skc-w) * 0.05) calc(var(--skc-w) * -0.03) color-mix(in srgb, var(--skc-wash-c2) 72%, transparent);
}

/* the hairline rim: lit along the top, warm along the floor */
.skc-rim {
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.08) 24%,
    rgba(255, 255, 255, 0.05) 55%,
    color-mix(in srgb, var(--skc-wash-c2) 70%, transparent) 86%,
    var(--skc-wash-c3) 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* the dial */
.skc-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.skc-camera {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.skc-root.is-dragging .skc-camera { transition: none; }

/* the time — gradient numerals sinking into the wash */
.skc-time {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6.5%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
  font-size: calc(var(--skc-w) * 0.225);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.skc-root--full .skc-time {
  bottom: 12%;
  font-size: calc(var(--skc-w) * 0.185);
}
.skc-digit {
  position: relative;
  display: inline-block;
  height: 1em;
  overflow: hidden;
  filter: drop-shadow(0 2px 10px rgba(4, 6, 14, 0.45));
}
.skc-digit-strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.55s cubic-bezier(0.2, 0.9, 0.25, 1);
  will-change: transform;
}
.skc-digit i {
  display: block;
  height: 1em;
  line-height: 1;
  font-style: normal;
  background: linear-gradient(
    180deg,
    #ffffff 22%,
    #fff6e8 55%,
    color-mix(in srgb, var(--skc-wash-c3) 80%, #ffffff) 108%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.skc-colon {
  padding: 0 0.03em;
  opacity: 0.7;
  transform: translateY(-0.04em);
}

/* controls (expanded only) — a quiet hairline row over the card's top */
.skc-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: calc(var(--skc-w) * 0.06) calc(var(--skc-w) * 0.075);
}
.skc-presets { display: flex; align-items: center; gap: calc(var(--skc-w) * 0.032); }
.skc-preset {
  width: calc(var(--skc-w) * 0.05);
  height: calc(var(--skc-w) * 0.05);
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: var(--dot, rgba(255, 255, 255, 0.4));
  cursor: pointer;
  transition: transform 0.2s var(--ease-out-expo), border-color 0.2s ease, box-shadow 0.2s ease;
}
.skc-preset:hover { transform: scale(1.2); border-color: rgba(255, 255, 255, 0.65); }
.skc-preset.is-active {
  border-color: #ffffff;
  box-shadow: 0 0 9px color-mix(in srgb, var(--dot, #fff) 85%, transparent);
}
.skc-side { display: flex; align-items: center; gap: calc(var(--skc-w) * 0.028); }
.skc-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(8, 10, 18, 0.38);
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.14em;
  color: rgba(251, 249, 245, 0.82);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.skc-live:hover { border-color: rgba(255, 255, 255, 0.4); color: #fff; }
.skc-live-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}
.skc-live.is-live .skc-live-dot {
  background: #a6e3b0;
  box-shadow: 0 0 7px rgba(166, 227, 176, 0.8);
}
.skc-close {
  width: calc(var(--skc-w) * 0.072);
  height: calc(var(--skc-w) * 0.072);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  background: rgba(8, 10, 18, 0.38);
  color: rgba(251, 249, 245, 0.82);
  font-size: calc(var(--skc-w) * 0.055);
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.skc-close:hover { border-color: rgba(255, 255, 255, 0.4); color: #fff; }

@media (max-width: 640px) {
  .skc-root--full { --skc-w: 232px; }
}

@media (prefers-reduced-motion: reduce) {
  .skc-wash { animation: none; }
  .skc-camera, .skc-digit-strip, .skc-root { transition: none; }
  .skc-aura { opacity: 0.4; }
}

"""

replace_region(PATH, START, END, NEW_CSS)

# The expanded popover's fixed anchor lives in the site-top section; rename it.
apply(PATH, [
    (""".tsc-root--full {
  position: fixed;
  top: 62px;
  right: 18px;
  z-index: 50;
}
@media (max-width: 640px) {
  .tsc-root--full {
    top: 58px;
    right: 10px;
  }""",
     """.skc-root--full {
  position: fixed;
  top: 62px;
  right: 18px;
  z-index: 50;
}
@media (max-width: 640px) {
  .skc-root--full {
    top: 58px;
    right: 10px;
  }"""),
])
