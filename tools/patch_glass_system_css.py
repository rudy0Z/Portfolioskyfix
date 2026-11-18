import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply, replace_region

PATH = r"D:\Portfolioskyfix\src\styles\global.css"

apply(PATH, [

# ── retimed hero entrance for the TypeGarden loader timeline ────────────────
('''html[data-intro="wait"] .hero-title .line-mask > span,
html[data-intro="lift"] .hero-title .line-mask > span {
  animation: lineRise 1.1s var(--ease-out-expo) 1020ms both;
}
html[data-intro="wait"] .hero-title .line-mask:nth-child(2) > span,
html[data-intro="lift"] .hero-title .line-mask:nth-child(2) > span {
  animation-delay: 1150ms;
}
html[data-intro="wait"] .hero-lede,
html[data-intro="lift"] .hero-lede {
  animation: fadeUp 1s var(--ease-out-expo) 1450ms both;
}
html[data-intro="wait"] .hero-actions,
html[data-intro="lift"] .hero-actions {
  animation: fadeUp 1s var(--ease-out-expo) 1620ms both;
}''',
'''html[data-intro="wait"] .hero-title .line-mask > span,
html[data-intro="lift"] .hero-title .line-mask > span {
  animation: lineRise 1.15s var(--ease-out-expo) 1900ms both;
}
html[data-intro="wait"] .hero-title .line-mask:nth-child(2) > span,
html[data-intro="lift"] .hero-title .line-mask:nth-child(2) > span {
  animation-delay: 2040ms;
}
html[data-intro="wait"] .hero-lede,
html[data-intro="lift"] .hero-lede {
  animation: fadeUp 1s var(--ease-out-expo) 2260ms both;
}
html[data-intro="wait"] .hero-actions,
html[data-intro="lift"] .hero-actions {
  animation: fadeUp 1s var(--ease-out-expo) 2400ms both;
}'''),
])

NEW_BLOCK = '''
/* ==========================================================================
   Botanical Glass system — TypeGarden loader, docked living logo, uncurling
   leaf links, glass browser viewports, metric pills, sundial pavilion footer
   with living aurora, starfield CTA glass, and the cloud-mist handoff.
   ========================================================================== */

/* ── TypeGarden intro veil ─────────────────────────────────────────────── */
.typegarden-veil {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: linear-gradient(180deg, var(--tg-veil-top, #10182b) 0%, var(--tg-veil-bot, #0a0f1c) 100%);
  clip-path: inset(0 0 0 0);
  pointer-events: all;
}
.typegarden-veil.is-lifting {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 800ms var(--ease-out-expo);
}
.typegarden-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.typegarden-canvas--front { z-index: 2; }
.typegarden-word {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  font-family: var(--font-display);
  font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 144;
  font-weight: 330;
  font-size: clamp(44px, 8.4vw, 84px);
  letter-spacing: 0.015em;
  line-height: 1.12;
  filter: drop-shadow(0 3px 26px rgba(6, 9, 18, 0.55));
  will-change: transform, opacity;
  user-select: none;
}
.typegarden-word span {
  display: inline-block;
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 640ms var(--ease-out-expo), transform 760ms var(--ease-out-expo);
  /* frosted glass glyph — the flora canvases show through the translucent fill */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 6%, rgba(255, 255, 255, 0.16) 52%, rgba(255, 236, 199, 0.34) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.typegarden-word.is-grown span {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .typegarden-word span { transition: none; }
}

/* ── docked living logo (wordmark + tracking flower) ───────────────────── */
.site-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  transition: opacity 560ms var(--ease-out-expo) 140ms;
}
html[data-intro="wait"] .site-brand {
  opacity: 0;
  pointer-events: none;
}
.tracking-flower { width: 21px; height: 21px; flex: none; }
.tracking-flower-stage {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 120ms ease-out;
}
.tracking-flower svg { width: 100%; height: 100%; overflow: visible; display: block; }
.tf-halo { stroke: rgba(255, 255, 255, 0.35); opacity: 0.3; transition: opacity 300ms; }
.tracking-flower.is-hovered .tf-halo { opacity: 0.65; }
.tf-petal {
  fill: rgba(255, 255, 255, 0.2);
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 1.2;
  transform-origin: 12px 12px;
  transition: fill 300ms ease, transform 420ms var(--ease-out-expo);
}
.tracking-flower.is-hovered .tf-petal {
  fill: rgba(255, 236, 199, 0.3);
  transform: rotate(45deg) scale(1.06);
}
.tf-foliage { fill: rgba(255, 255, 255, 0.09); stroke: rgba(255, 255, 255, 0.38); stroke-width: 0.7; }
.tf-stamens { stroke: rgba(255, 255, 255, 0.28); stroke-width: 0.7; stroke-dasharray: 1.5 1.5; fill: none; }
.tf-pistil {
  fill: var(--sky-sun-glow, #ffe9c2);
  filter: drop-shadow(0 0 5px rgba(255, 236, 199, 0.8));
}
.tf-glint { fill: #ffffff; opacity: 0.85; }
.tf-ripple {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 1px solid rgba(255, 236, 199, 0.7);
  animation: tfRipple 620ms var(--ease-out-expo) forwards;
  pointer-events: none;
}
@keyframes tfRipple {
  from { opacity: 0.9; transform: scale(0.55); }
  to { opacity: 0; transform: scale(1.8); }
}

/* ── uncurling hairline leaf under nav links ───────────────────────────── */
.site-link-leaf {
  position: absolute;
  left: 50%;
  bottom: -3px;
  width: 14px;
  height: 9px;
  transform: translateX(-50%);
  overflow: visible;
  pointer-events: none;
}
.site-link-leaf path {
  fill: none;
  stroke: var(--sky-sun-glow, #ffe9c2);
  stroke-width: 1.1;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition: stroke-dashoffset 440ms var(--ease-out-expo), opacity 220ms ease;
}
.site-link:hover .site-link-leaf path,
.site-link:focus-visible .site-link-leaf path {
  stroke-dashoffset: 0;
  opacity: 0.85;
}

/* ── glass browser viewport in the work slabs ──────────────────────────── */
.work-viewport {
  margin: 0;
  align-self: center;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 14, 24, 0.55);
  backdrop-filter: blur(18px) saturate(1.1);
  -webkit-backdrop-filter: blur(18px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 34px 90px -42px rgba(3, 6, 14, 0.92);
}
.work-viewport-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  color: var(--ui-faint);
}
.work-viewport-dots { display: flex; gap: 5px; }
.work-viewport-dots i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.work-viewport-url { flex: 1; text-align: center; }
.work-viewport-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.work-viewport-live i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #7be0a2;
  box-shadow: 0 0 6px rgba(123, 224, 162, 0.8);
}
.work-viewport-screen { position: relative; }
.work-viewport-screen img { display: block; width: 100%; height: auto; }
.work-viewport-glare {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 30%, transparent 48%);
  pointer-events: none;
}

/* ── floating metric pills ─────────────────────────────────────────────── */
.work-metrics { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 0; }
.work-metric {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--ui);
}

/* ── the sundial glass pavilion footer ─────────────────────────────────── */
.foot-pavilion {
  position: relative;
  max-width: var(--maxw);
  margin: 0 auto;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(170deg, rgba(14, 18, 32, 0.52), rgba(9, 12, 22, 0.44));
  backdrop-filter: blur(26px) saturate(1.15);
  -webkit-backdrop-filter: blur(26px) saturate(1.15);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    0 44px 120px -42px rgba(2, 4, 10, 0.92);
  overflow: hidden;
}
.foot-pavilion::after {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.32), transparent);
  opacity: calc(0.5 + var(--golden, 0) * 0.5);
  pointer-events: none;
}
.foot-pavilion-inner {
  --foot-pad: clamp(22px, 4vw, 56px);
  padding: clamp(34px, 5vh, 60px) var(--foot-pad) 0;
}

.foot-say-wrap { position: relative; max-width: 14ch; }
.foot-say {
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-variation-settings: "SOFT" 0, "WONK" 1, "opsz" 144;
  font-weight: 300;
  font-size: clamp(52px, 8.5vw, 116px);
  line-height: 0.98;
  letter-spacing: -0.03em;
  color: var(--ui);
  cursor: pointer;
  display: inline-block;
  text-shadow: 0 2px 44px rgba(5, 8, 18, 0.35);
}
.foot-say span {
  display: inline-block;
  transition: transform 320ms var(--ease-out-expo), color 220ms ease;
}
.foot-say span:hover {
  transform: translateY(-5px);
  color: color-mix(in oklab, var(--ui), var(--sky-sun-glow) 42%);
}
.foot-inspect { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.foot-inspect svg { position: absolute; overflow: visible; }
.foot-inspect-tag {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(255, 236, 199, 0.9);
  background: rgba(8, 11, 20, 0.62);
  border: 1px solid rgba(255, 236, 199, 0.25);
  border-radius: 5px;
  padding: 2px 7px;
  white-space: nowrap;
}
.foot-toast {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #7be0a2;
  animation: toastIn 320ms var(--ease-out-expo) both;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(6px); }
}

.foot-directory {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(24px, 3.4vw, 48px);
  margin-top: clamp(40px, 6vh, 64px);
  padding-top: 26px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.foot-brand {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16.5px;
  color: var(--ui);
}
.foot-brand-mark { color: var(--sky-sun-glow); margin-right: 5px; }
.foot-id .foot-blurb { max-width: 40ch; }
.foot-live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7be0a2;
  box-shadow: 0 0 8px rgba(123, 224, 162, 0.85);
  animation: livePulse 2.6s ease-in-out infinite;
}
.foot-time { margin-top: 14px; }

/* living aurora — the pavilion's lower half */
.foot-aurora-zone {
  position: relative;
  margin: clamp(36px, 5vh, 56px) calc(-1 * var(--foot-pad)) 0;
}
.foot-aurora {
  position: relative;
  height: clamp(170px, 25vh, 250px);
  overflow: hidden;
}
.foot-aurora-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.foot-aurora-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 13, 24, 0.32) 0%, transparent 42%, rgba(8, 11, 20, 0.4) 100%);
  pointer-events: none;
}
.foot-aurora-zone .site-foot-base {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 14px var(--foot-pad) 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(7, 10, 19, 0), rgba(7, 10, 19, 0.52));
}
.foot-aurora-label { opacity: 0.65; }
@media (max-width: 860px) {
  .foot-directory { grid-template-columns: 1fr 1fr; }
  .foot-id { grid-column: 1 / -1; }
  .foot-aurora-label { display: none; }
}

/* ── starfield CTA glass ───────────────────────────────────────────────── */
.hero-cta-wrap { display: inline-flex; border-radius: 999px; }
.hero-cta {
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
}

/* ── cloud-mist hero-to-work handoff ───────────────────────────────────── */
.hero-mist {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: calc(var(--p) * 1.15);
}
.hero-mist::before {
  content: "";
  position: absolute;
  inset-inline: -20%;
  bottom: calc(-14vh + var(--p) * 36vh);
  height: 46vh;
  background:
    radial-gradient(58% 100% at 28% 100%, rgba(236, 240, 248, 0.42) 0%, transparent 72%),
    radial-gradient(52% 92% at 74% 100%, rgba(226, 232, 244, 0.34) 0%, transparent 74%);
}
.hero-mist::after {
  content: "";
  position: absolute;
  inset-inline: -12%;
  bottom: calc(-8vh + var(--p) * 46vh);
  height: 36vh;
  background: linear-gradient(180deg, transparent 0%, rgba(240, 244, 250, 0.28) 62%, rgba(240, 244, 250, 0.44) 100%);
}

@media (max-width: 720px) {
  .typegarden-word { font-size: clamp(34px, 10vw, 52px); }
  .work-metrics { margin-top: 14px; }
  .foot-pavilion { border-radius: 24px; }
}
'''

append_marker = """@media (max-width: 720px) {
  .page-head { padding-top: 96px; }
}"""

apply(PATH, [(append_marker, append_marker + "\n" + NEW_BLOCK)])
print("glass system CSS appended")
