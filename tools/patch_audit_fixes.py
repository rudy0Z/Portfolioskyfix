import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply, replace_region

PATH = r"D:\Portfolioskyfix\src\styles\global.css"

# ── 1. the cutoff architecture: camera sink + bottom-up dissolve mask ───────
apply(PATH, [
    ('''.garden {
  position: absolute;
  inset: 0;
  transform: scale(calc(1 + var(--p) * 0.06));
  transform-origin: 50% 62%;
  /* Hold fully visible until the work section is close, then dissolve into
     the persistent sky — the handoff is sky meeting sky, never a hard edge. */
  opacity: clamp(0, calc((1 - var(--p)) * 5), 1);
  will-change: transform, opacity;
}''',
'''.garden {
  position: absolute;
  inset: 0;
  /* Camera sink: the meadow leaves through the BOTTOM edge while the push-in
     continues — the ground never slides across the viewport as a slab. */
  transform: translate3d(0, calc(var(--p) * 10vh), 0) scale(calc(1 + var(--p) * 0.06));
  transform-origin: 50% 62%;
  /* Bottom-up dissolve mask (scroll-driven): at rest it is fully open; as the
     work approaches the ground organically melts into the sky behind it, so
     no pixel row of the canvas can ever form a straight line. */
  -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - var(--p) * 44vh), transparent 100%);
  mask-image: linear-gradient(180deg, #000 calc(100% - var(--p) * 44vh), transparent 100%);
  /* Hold fully visible until the work section is close, then dissolve into
     the persistent sky — the handoff is sky meeting sky, never a hard edge. */
  opacity: clamp(0, calc((1 - var(--p)) * 5), 1);
  will-change: transform, opacity;
}'''),
])

# ── 2. delete the boxy mist (the razor blade) ────────────────────────────────
apply(PATH, [
    ('''/* ── cloud-mist hero-to-work handoff ───────────────────────────────────── */
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

''', ''),
])

# ── 3. prune orphaned legacy blocks (grep-verified unused) ───────────────────
apply(PATH, [
    ('''.works-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(14px, 1.5vw, 22px); }

.work-card {
  position: relative;
  display: flex; flex-direction: column;
  min-height: clamp(320px, 40vh, 420px);
  padding: clamp(22px, 2.4vw, 34px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  /* Obsidian slate: opaque enough that type never depends on the sky behind it. */
  background: rgba(16, 20, 36, 0.85);
  backdrop-filter: blur(18px) saturate(1.1);
  -webkit-backdrop-filter: blur(18px) saturate(1.1);
  color: var(--ui); text-decoration: none; overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 30px 70px -40px rgba(4, 7, 16, 0.75);
  transition: border-color 400ms var(--ease-smooth), background 400ms var(--ease-smooth), opacity 90ms linear;
  will-change: transform, opacity;
}
.work-card::after {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
  opacity: calc(0.5 + var(--golden) * 0.5);
}
.work-card:hover {
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(21, 26, 45, 0.9);
}
.work-card:focus-visible { outline: 1px solid rgba(255, 240, 210, 0.85); outline-offset: 4px; }

.work-card-top {
  display: flex; align-items: baseline; justify-content: space-between;
  font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.18em;
  text-transform: uppercase; color: rgba(246, 243, 234, 0.62);
}
.work-index { color: rgba(246, 243, 234, 0.95); }

.work-plate { margin: clamp(26px, 4vh, 44px) 0 0; padding: 0 clamp(4px, 2.4vw, 30px); color: rgba(255, 255, 255, 0.42); }
.work-plate-svg { width: 100%; height: auto; max-height: 118px; }

.work-body { margin-top: auto; padding-top: clamp(22px, 3.4vh, 34px); }
.work-title {
  margin: 0;
  color: #fbf9f5;
  font-family: var(--font-display);
  font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 96;
  font-weight: 300;
  font-size: clamp(23px, 2.1vw, 31px);
  line-height: 1.06; letter-spacing: -0.024em;
}
.work-summary {
  margin: 12px 0 0; max-width: 44ch;
  font-size: 13px; line-height: 1.62; font-weight: 350;
  color: rgba(246, 243, 234, 0.8);
}
.work-card-foot {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
  margin-top: clamp(20px, 3vh, 30px); padding-top: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ui-dim);
}
.work-year { color: var(--ui); }

.works-foot {
  display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
  gap: 16px; margin-top: clamp(56px, 8vh, 88px); padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}
.works-foot p { margin: 0; font-size: 12.5px; color: var(--ui-dim); }
.works-more {
  display: inline-flex; align-items: center; gap: 9px;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.16em;
  text-transform: uppercase; text-decoration: none;
  border-bottom: 1px solid var(--hairline-strong); padding-bottom: 3px;
  transition: border-color 220ms var(--ease-smooth);
}
.works-more:hover { border-color: rgba(255, 255, 255, 0.6); }

''', '''
'''),
    ('''/* (site footer styles live at the bottom — `.foot-*`) */''',
     '''/* (site footer styles live at the bottom — `.foot-*`) */
'''),
    ('''.site-foot-title {
  margin: 22px 0 0;
  font-family: var(--font-display);
  font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 144;
  font-weight: 300;
  font-size: clamp(38px, 5.8vw, 84px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  text-wrap: balance;
  color: var(--ui);
  text-shadow: 0 2px 44px rgba(5, 8, 18, 0.35);
}
.site-foot-title em {
  font-style: italic;
  font-variation-settings: "SOFT" 100, "WONK" 1, "opsz" 144;
  color: color-mix(in oklab, var(--ui), var(--sky-sun-glow) 24%);
}
.site-foot-contact {''',
'''.site-foot-contact {'''),
    ('''.site-foot-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(28px, 4vw, 56px);
  margin-top: clamp(64px, 9vh, 96px);
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
''', ''),
    ('''.btn-sprout {
  position: relative;
  overflow: hidden;
}
.btn-sprout::after {
  content: "❋";
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) scale(0) rotate(-45deg);
  opacity: 0;
  transition: transform 300ms var(--ease-out), opacity 300ms ease;
  color: #10b981;
  font-size: 10px;
}
.btn-sprout:hover::after {
  transform: translateY(-50%) scale(1) rotate(0deg);
  opacity: 1;
}

''', ''),
])

# ── 4. prune the .hud instrument block + the whole thermal-nav block ────────
apply(PATH, [
    ('''/* HUD instrument */
.hud {
  position: fixed;
  right: clamp(14px, 2vw, 26px);
  bottom: clamp(14px, 2vh, 24px);
  z-index: 50;
  display: flex; flex-direction: column; gap: 8px;
  width: 214px;
  padding: 14px 14px 11px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  background: linear-gradient(
    172deg,
    rgba(16, 20, 34, 0.62) 0%,
    rgba(12, 16, 28, 0.55) 46%,
    rgba(10, 13, 24, 0.68) 100%
  );
  backdrop-filter: blur(26px) saturate(1.1);
  -webkit-backdrop-filter: blur(26px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 30px 70px -34px rgba(0, 0, 0, 0.85);
  transition: opacity 320ms var(--ease-smooth), transform 320ms var(--ease-out);
}
.hud[data-open="false"] { transform: translateY(calc(100% - 40px)); opacity: 0.55; }

''', ''),
])

replace_region(
    PATH,
    "/* ==========================================================================\n   Thermal Navigation Bar — Premium Glass HUD\n   ========================================================================== */",
    "/* ── site top chrome ──",
    "",
)
print("audit CSS fixes applied")
