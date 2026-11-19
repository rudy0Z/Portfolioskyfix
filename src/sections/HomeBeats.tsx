/**
 * HomeBeats — Ultra-lean Editorial Manifesto section between Selected Work
 * and the unified floral footer.
 *
 * Replaces the old 6-section wall (Craft tester, Recognition, Greenhouse,
 * FAQ, NOW strip, Colophon) with one calm, authoritative architectural pause.
 */

const CRAFT_PILLARS: readonly { index: string; title: string; body: string }[] = [
  {
    index: "01",
    title: "Decision-heavy AI & systems",
    body: "State-machine UI, explicit human-authority gates, and failure-mode restraint designed before touching surface polish.",
  },
  {
    index: "02",
    title: "Code-grade prototyping",
    body: "Real React & TypeScript builds from day one — testing timers, statutory refusals, and edge states directly in the browser.",
  },
  {
    index: "03",
    title: "Production component craft",
    body: "Tactile spring physics, keyboard accessibility, adaptive 24-hour contrast, and frame-budget discipline that holds at 60fps.",
  },
];

export function HomeBeats() {
  return (
    <section id="about" className="manifesto-section" aria-label="A working belief">
      <span id="craft" aria-hidden="true" className="absolute -top-24" />
      <span id="process" aria-hidden="true" className="absolute -top-24" />

      <div className="shell">
        <div className="manifesto-panel" data-reveal>
          <div className="manifesto-top">
            <p className="manifesto-kicker">A working belief</p>
            <h2 className="manifesto-quote">
              Good interface design <em>disappears</em> when you need it most.
            </h2>
            <p className="manifesto-lede">
              Design and engineering aren’t two handoff steps here — they are one loop. Every
              interface begins at the moment of human judgment, then gets stress-tested directly
              in running code.
            </p>
          </div>

          <div className="manifesto-pillars">
            {CRAFT_PILLARS.map((pillar) => (
              <article key={pillar.index} className="manifesto-pillar">
                <span className="manifesto-pillar-idx" aria-hidden="true">
                  {pillar.index}
                </span>
                <h3 className="manifesto-pillar-title">{pillar.title}</h3>
                <p className="manifesto-pillar-body">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
