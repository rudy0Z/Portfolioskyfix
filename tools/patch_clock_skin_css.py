import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply

PATH = r"D:\Portfolioskyfix\src\styles\global.css"

apply(PATH, [

# root: box-shadow out of the morph transition (it re-paints every frame)
('''  transition:
    width 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease;''',
'''  transition:
    width 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 0.42s cubic-bezier(0.22, 1, 0.36, 1);'''),

# full view: the card IS the sky — no glass, no backdrop blur (the perf fix)
('''/* Full Interactive Instrument View */
.tsc-root--full {
  width: 268px;
  padding: 14px 16px 14px;
  border-radius: 26px;
  background:
    radial-gradient(
      115% 115% at var(--tsc-zone-x, 50%) var(--tsc-zone-y, 30%),
      var(--tsc-wash, rgba(255, 160, 100, 0.22)) 0%,
      var(--tsc-wash-deep, rgba(120, 90, 180, 0.12)) 46%,
      rgba(9, 11, 20, 0.92) 100%
    );
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(28px) saturate(1.4);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 28px 64px -20px rgba(3, 5, 12, 0.78),
    0 0 42px -12px var(--tsc-wash, transparent);
}''',
'''/* Full Interactive Instrument View — the card wears the sky itself */
.tsc-root--full {
  width: 268px;
  padding: 14px 16px 14px;
  border-radius: 26%;
  background: linear-gradient(
    180deg,
    var(--tsc-sky-zenith, #33415c) 0%,
    var(--tsc-sky-mid, #22304a) 52%,
    var(--tsc-sky-deep, #101a2c) 100%
  );
  border: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 30px 70px -22px rgba(3, 5, 12, 0.85);
}'''),

# thumbnail: squircle sky card in the nav row
('''/* Compact Navbar Thumbnail View (Features LensClock Pan + Multi-Hue Rim) */
.tsc-root--thumbnail {
  width: 56px;
  height: 56px;
  padding: 3px;
  border-radius: 999px;
  cursor: pointer;
  background:
    radial-gradient(
      circle at var(--tsc-zone-x, 50%) var(--tsc-zone-y, 50%),
      var(--tsc-wash, rgba(255, 160, 100, 0.4)) 0%,
      rgba(10, 12, 22, 0.94) 85%
    );
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 10px 26px -8px rgba(0, 0, 0, 0.7),
    0 0 22px -4px var(--tsc-wash, transparent);
}

.tsc-root--thumbnail:hover {
  transform: translateY(-1px) scale(1.04);
  border-color: var(--tsc-head, rgba(255, 255, 255, 0.45));
}''',
'''/* Compact Navbar Thumbnail — a squircle of live sky, panned half-view */
.tsc-root--thumbnail {
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 30%;
  cursor: pointer;
  background: linear-gradient(
    180deg,
    var(--tsc-sky-zenith, #33415c) 0%,
    var(--tsc-sky-mid, #22304a) 55%,
    var(--tsc-sky-deep, #101a2c) 100%
  );
  border: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 10px 26px -8px rgba(0, 0, 0, 0.66),
    0 0 20px -6px var(--tsc-glow, transparent);
}

.tsc-root--thumbnail:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 14px 30px -8px rgba(0, 0, 0, 0.7),
    0 0 26px -6px var(--tsc-glow, transparent);
}'''),

# ink-aware readouts & controls
('''  fill: rgba(251, 249, 245, 0.72);
  pointer-events: none;
}''',
'''  fill: var(--tsc-ink, rgba(251, 249, 245, 0.72));
  opacity: 0.75;
  pointer-events: none;
}'''),
('''/* Footer Readout & Quick Presets */
.tsc-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);''',
'''/* Footer Readout & Quick Presets */
.tsc-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--tsc-ink, #fff) 16%, transparent);'''),
('''.tsc-mono-time {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}''',
'''.tsc-mono-time {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: var(--tsc-ink, #fbf9f5);
}'''),
('''  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(251, 249, 245, 0.78);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.15s ease;
}''',
'''  border: 1px solid color-mix(in srgb, var(--tsc-ink, #fff) 24%, transparent);
  background: color-mix(in srgb, var(--tsc-ink, #fff) 7%, transparent);
  color: color-mix(in srgb, var(--tsc-ink, #fff) 84%, transparent);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.15s ease;
}'''),
('''.tsc-preset-chip {
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(251, 249, 245, 0.72);''',
'''.tsc-preset-chip {
  border: 1px solid color-mix(in srgb, var(--tsc-ink, #fff) 18%, transparent);
  background: color-mix(in srgb, var(--tsc-ink, #fff) 6%, transparent);
  color: color-mix(in srgb, var(--tsc-ink, #fff) 76%, transparent);'''),
('''.tsc-preset-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--tsc-crest);
  color: #ffffff;
}''',
'''.tsc-preset-chip:hover {
  background: color-mix(in srgb, var(--tsc-ink, #fff) 14%, transparent);
  border-color: color-mix(in srgb, var(--tsc-ink, #fff) 45%, transparent);
  color: var(--tsc-ink, #ffffff);
}'''),
('''.tsc-mode-toggle {
  display: inline-flex;
  padding: 2px;
  border-radius: 999px;
  background: rgba(5, 7, 14, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.09);
}''',
'''.tsc-mode-toggle {
  display: inline-flex;
  padding: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tsc-ink, #fff) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--tsc-ink, #fff) 14%, transparent);
}'''),
('''.tsc-mode-btn {
  border: 0;
  background: transparent;
  color: rgba(251, 249, 245, 0.52);''',
'''.tsc-mode-btn {
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--tsc-ink, #fff) 58%, transparent);'''),
('''.tsc-mode-btn.is-active {
  background: rgba(255, 255, 255, 0.14);
  color: #fbf9f5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}''',
'''.tsc-mode-btn.is-active {
  background: color-mix(in srgb, var(--tsc-ink, #fff) 16%, transparent);
  color: var(--tsc-ink, #fbf9f5);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}'''),
('''.tsc-digital-slots {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(6, 8, 16, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.11);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}''',
'''.tsc-digital-slots {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--tsc-sky-deep, #0a0e18) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--tsc-ink, #fff) 14%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}'''),
('''.tsc-digit-cell {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 23px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.25);
}''',
'''.tsc-digit-cell {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 23px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--tsc-ink, #fff) 28%, transparent);
}'''),
('''.tsc-digital-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(251, 249, 245, 0.66);
}''',
'''.tsc-digital-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.14em;
  color: color-mix(in srgb, var(--tsc-ink, #fff) 68%, transparent);
}'''),

# the skin layer system, appended at the end of the tsc section
('''/* Pin UI Travelling Conic Heat Bloom behind the Bezel */''',
'''/* ── the sky skin (the card wears the sky at the set hour) ─────────────────
   A gradient body poured over by the horizon wash at the floor (the Pin UI
   placement), a hairline rim lit along the top and warm at the bottom, and a
   bloom bleeding out from under the card. All colors come from the live sky
   palette the component samples, so the instrument re-lights with the field. */
.tsc-header,
.tsc-dial-stage,
.tsc-footer { position: relative; z-index: 1; }

.tsc-skin {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}
.tsc-skin-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      72% 24% at 50% 104%,
      var(--tsc-glow, transparent) 0%,
      color-mix(in srgb, var(--tsc-crest, transparent) 55%, transparent) 46%,
      transparent 85%
    ),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--tsc-glow, transparent) 80%, transparent) 0%,
      color-mix(in srgb, var(--tsc-body, transparent) 50%, transparent) 13%,
      transparent 44%
    );
  filter: blur(6px);
  transform-origin: 50% 100%;
  animation: tscSkinBreathe 6s ease-in-out infinite;
  opacity: 0.92;
}
@keyframes tscSkinBreathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.04); }
}
.tsc-skin-rim {
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.08) 24%,
    rgba(255, 255, 255, 0.05) 55%,
    color-mix(in srgb, var(--tsc-crest, #fff) 55%, transparent) 86%,
    var(--tsc-glow, #fff) 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
.tsc-bloom,
.tsc-halo {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.85;
  transition: opacity 0.5s ease;
}
.tsc-bloom {
  left: 9%;
  right: 9%;
  bottom: -7%;
  height: 22%;
  background: radial-gradient(
    closest-side,
    var(--tsc-glow, transparent) 0%,
    color-mix(in srgb, var(--tsc-crest, transparent) 68%, transparent) 55%,
    transparent 100%
  );
  filter: blur(18px);
}
.tsc-halo {
  inset: 40% -5% -3%;
  background: radial-gradient(
    60% 50% at 50% 82%,
    color-mix(in srgb, var(--tsc-body, transparent) 32%, transparent),
    transparent 70%
  );
  filter: blur(22px);
}
.tsc-root--thumbnail .tsc-bloom { bottom: -12%; height: 26%; filter: blur(10px); }
.tsc-root--thumbnail .tsc-halo { filter: blur(12px); }

/* the thumbnail's half-time readout */
.tsc-thumb-time {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5%;
  z-index: 2;
  text-align: center;
  font-size: 10.5px;
  font-weight: 550;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--tsc-ink, #fbf9f5);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .tsc-skin-wash { animation: none; }
}

/* Pin UI Travelling Conic Heat Bloom behind the Bezel */'''),
])
