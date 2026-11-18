import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply

PATH = r"D:\Portfolioskyfix\src\sections\StackingProjects.tsx"

OLD_HEADER = '''      <div className="mb-14 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>SELECTED WORK · SYSTEMS &amp; PRODUCTS</span>
          </div>
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
            THREE CASE STUDIES
          </span>
        </div>
        <h2 className="font-serif text-[44px] sm:text-[64px] font-light leading-[1.02] tracking-tight text-white">
          Flagship Systems &amp; Case Studies
        </h2>
        <p className="mt-4 font-sans text-[16.5px] text-white/70 max-w-2xl font-light leading-relaxed">
          Three deep dives — an autonomous emergency-response system, the human
          verification window, and verified physical reality.
        </p>
      </div>'''

NEW_HEADER = '''      <header className="works-head" data-reveal>
        <p className="microlabel">
          Selected work <span className="microlabel-rule" aria-hidden="true" />
        </p>
        <h2 className="works-title">
          Flagship systems
          <br />
          &amp; case studies
        </h2>
        <p className="works-lede">
          Three deep dives — an autonomous emergency-response system, the human
          verification window, and verified physical reality.
        </p>
      </header>'''

OLD_CARDS = '''      {/* Sticky Stacking Track */}
      <div className="relative flex flex-col gap-20 pb-16">
        {FLAGSHIP_PROJECTS.map((proj, idx) => (
          <div
            key={proj.id}
            id={`project-card-${proj.id}`}
            className="sticky rounded-2xl border border-white/15 bg-neutral-900/90 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 transition-all duration-300"
            style={{
              top: `calc(5rem + ${idx * 28}px)`,
              zIndex: 10 + idx,
              boxShadow: `0 ${16 + idx * 8}px ${48 + idx * 16}px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.15)`,
            }}
          >
            {/* Top Card Kicker */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[12px] font-bold text-white/40">
                  {proj.index}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 font-mono text-[9.5px] uppercase tracking-wider text-amber-300 border border-white/15">
                  {proj.badge}
                </span>
                <span className="font-mono text-[11px] text-white/50">
                  {proj.year}
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
                {proj.discipline}
              </span>
            </div>

            {/* Main Card Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
              {/* Left Column: Project Copy & Decision Architecture */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-[30px] sm:text-[38px] font-medium leading-tight text-white mb-3">
                    {proj.title}
                  </h3>
                  <p className="font-sans text-[14.5px] text-white/75 font-light leading-relaxed mb-6">
                    {proj.tagline}
                  </p>

                  {/* Architecture Tension & Decision */}
                  <div className="space-y-4 mb-6">
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-rose-300/80 mb-1">
                        Core System Tension
                      </div>
                      <p className="font-sans text-[12.5px] text-white/70 leading-normal">
                        {proj.problem}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-emerald-300/80 mb-1">
                        The Architectural Decision
                      </div>
                      <p className="font-sans text-[12.5px] text-white/70 leading-normal">
                        {proj.decision}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {proj.metrics.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-white/80"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-4">
                  <Link
                    href={proj.caseHref}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-sans text-[13px] font-semibold hover:bg-amber-300 hover:text-black transition-all shadow-lg hover:shadow-amber-400/20"
                  >
                    <span>View case study</span>
                    <span className="font-mono text-[14px]">→</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Stylized SVG Screen Placeholder */}
              <div className="lg:col-span-7 flex items-center justify-center min-h-[320px] sm:min-h-[380px]">
                {proj.renderScreenSvg()}
              </div>
            </div>
          </div>
        ))}
      </div>'''

NEW_CARDS = '''      {/* Sticky stacking track — cards rest on the sky, nearest on top */}
      <div className="relative flex flex-col gap-[72px] pb-8">
        {FLAGSHIP_PROJECTS.map((proj, idx) => (
          <article
            key={proj.id}
            id={`project-card-${proj.id}`}
            className="work-stack"
            data-reveal
            style={{
              top: `calc(5.5rem + ${idx * 26}px)`,
              zIndex: 10 + idx,
            }}
          >
            <div className="work-stack-head">
              <span className="work-stack-index" aria-hidden="true">{proj.index}</span>
              <h3 className="work-stack-name">{proj.title}</h3>
              <span className="work-stack-badge">{proj.badge}</span>
            </div>

            <div className="work-stack-grid">
              <div>
                <p className="work-stack-tagline">{proj.tagline}</p>

                <div className="work-stack-block">
                  <p className="microlabel">The tension</p>
                  <p>{proj.problem}</p>
                </div>

                <div className="work-stack-block">
                  <p className="microlabel">The decision</p>
                  <p>{proj.decision}</p>
                </div>

                <p className="work-stack-metrics">{proj.metrics.join("  ·  ")}</p>

                <div className="work-stack-cta">
                  <Link href={proj.caseHref} className="btn btn-primary">
                    Read the case study
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Product screen — SVG renders the interface itself */}
              <div className="work-stack-screen">{proj.renderScreenSvg()}</div>
            </div>
          </article>
        ))}
      </div>'''

OLD_STRIP = '''      {/* ── Continue to contact ── */}
      <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] text-white/50">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>MORE IN CONVERSATION — SAY HELLO</span>
        </div>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white transition-all text-[11px]"
        >
          <span>Get in touch</span>
          <span>↓</span>
        </a>
      </div>'''

NEW_STRIP = '''      {/* ── Continue to contact ── */}
      <div
        className="mt-14 pt-7 border-t border-white/10 flex flex-wrap items-center justify-between gap-4"
        data-reveal
      >
        <p className="m-0 text-[12.5px] font-light" style={{ color: "var(--ink-dim)" }}>
          More lives in conversation than on this page.
        </p>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="link-arrow"
        >
          <span>Get in touch</span>
          <span className="arw" aria-hidden="true">↓</span>
        </a>
      </div>'''

apply(PATH, [
    (OLD_HEADER, NEW_HEADER),
    (OLD_CARDS, NEW_CARDS),
    (OLD_STRIP, NEW_STRIP),
])
