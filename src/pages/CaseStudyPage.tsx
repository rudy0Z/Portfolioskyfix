import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRoute } from "@/router/Router";
import {
  CASE_ORDER,
  getCase,
  type Block,
  type CasePrototypeConfig,
  type CaseSection,
  type CaseStudy,
} from "@/caseStudies";
import { ThermalSkyClock } from "@/sky/ThermalSkyClock";
import { formatTime } from "@/lib/timeOfDay";
import { useSkyTime } from "@/lib/useTimeOfDay";
import "./../styles/case-reader.css";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Apply an embed block's deepLink to an iframe src: "#…" sets the hash,
 *  "?…" is spliced in before the hash (replacing any existing query). */
function withDeepLink(src: string, deepLink?: string): string {
  if (!deepLink) return src;
  const hashAt = src.indexOf("#");
  const noHash = hashAt < 0 ? src : src.slice(0, hashAt);
  const oldHash = hashAt < 0 ? "" : src.slice(hashAt);
  if (deepLink.startsWith("#")) return `${noHash}${deepLink}`;
  const queryAt = noHash.indexOf("?");
  const base = queryAt < 0 ? noHash : noHash.slice(0, queryAt);
  return `${base}${deepLink}${oldHash}`;
}

function formatCountdown(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface HarnessPlayerWindow extends Window {
  player?: {
    authorize?: () => void;
  };
}

/* ── Full Prototype Veil Modal ───────────────────────────────────────────── */

function PrototypeVeilModal({
  proto,
  initialDeepLink,
  onClose,
}: {
  proto: CasePrototypeConfig;
  initialDeepLink?: string;
  onClose: () => void;
}) {
  const [activeDeepLink, setActiveDeepLink] = useState<string | undefined>(
    initialDeepLink ?? proto.deepLink,
  );
  const fullSrc = withDeepLink(proto.src, activeDeepLink);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="veil-modal"
      role="dialog"
      aria-modal="true"
      aria-label={proto.title}
      onClick={onClose}
    >
      <div
        className="veil-modal-sheet cs-embed-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cs-embed-modal-head">
          <div className="cs-embed-modal-titlegroup">
            <span className="cs-embed-live" aria-hidden="true" />
            <p className="cs-embed-title">{proto.title}</p>
          </div>

          {proto.scenarios && proto.scenarios.length > 0 && (
            <div className="cs-modal-scenarios" role="group" aria-label="Prototype scenarios">
              {proto.scenarios.map((sc) => {
                const isActive = activeDeepLink === sc.deepLink;
                return (
                  <button
                    key={sc.label}
                    type="button"
                    className={`cs-modal-scenario-btn ${isActive ? "is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveDeepLink(sc.deepLink)}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="cs-embed-modal-actions">
            <a
              href={fullSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-embed-standalone"
            >
              Standalone ↗
            </a>
            <button type="button" className="veil-close" onClick={onClose}>
              Close ✕
            </button>
          </div>
        </div>

        <iframe
          className="cs-embed-modal-frame"
          src={fullSrc}
          title={proto.title}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
        />
      </div>
    </div>
  );
}

/* ── Sticky Floating Frosted Top Hub Capsule ─────────────────────────────── */

function TopHubCapsule({
  data,
  activeIdx,
  isPastWalkthrough,
  onSelectChapter,
  onOpenPrototype,
}: {
  data: CaseStudy;
  activeIdx: number;
  isPastWalkthrough: boolean;
  onSelectChapter: (sectionId: string) => void;
  onOpenPrototype: (deepLink?: string) => void;
}) {
  const skyTime = useSkyTime();
  const formattedClock = formatTime(skyTime);
  const [menuOpen, setMenuOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const hoverTimerRef = useRef<number>(0);
  const hubRef = useRef<HTMLDivElement>(null);

  const activeSection = data.sections[activeIdx] ?? data.sections[0];

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }
  };

  const handleMouseEnterDropdown = () => {
    clearHoverTimer();
    if (window.matchMedia("(hover: hover)").matches) {
      setClockOpen(false);
      setMenuOpen(true);
    }
  };

  const handleMouseLeaveDropdown = () => {
    clearHoverTimer();
    if (window.matchMedia("(hover: hover)").matches) {
      hoverTimerRef.current = window.setTimeout(() => {
        setMenuOpen(false);
      }, 170);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setClockOpen(false);
      }
    };
    const onDocClick = (e: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
      clearHoverTimer();
    };
  }, []);

  const handleBackToWork = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = "/";
    let tries = 12;
    const scrollWork = () => {
      const target = document.getElementById("work");
      if (target) target.scrollIntoView({ behavior: "instant" });
      else if (tries-- > 0) window.setTimeout(scrollWork, 120);
    };
    window.setTimeout(scrollWork, 100);
  };

  return (
    <div
      ref={hubRef}
      className={`cs-hub-anchor ${isPastWalkthrough ? "is-folded" : ""}`}
      role="navigation"
      aria-label="Case study navigation hub"
    >
      <div className="cs-hub-capsule">
        {/* 1. Back to Work */}
        <a href="/#work" onClick={handleBackToWork} className="cs-hub-back">
          <span aria-hidden="true">←</span> Work
        </a>

        <span className="cs-hub-sep" aria-hidden="true" />

        {/* 2. Chapter Dropdown Trigger (State 1 = Case Name · State 2 = #N · Chapter ▾) */}
        <div
          className="cs-hub-chapter-wrap"
          onMouseEnter={handleMouseEnterDropdown}
          onMouseLeave={handleMouseLeaveDropdown}
        >
          <button
            type="button"
            className={`cs-hub-chapter-btn ${isPastWalkthrough ? "is-folded" : ""} ${
              menuOpen ? "is-open" : ""
            }`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => {
              setClockOpen(false);
              setMenuOpen((v) => !v);
            }}
          >
            {isPastWalkthrough ? (
              <>
                <span className="cs-hub-ch-num">#{activeIdx + 1}</span>
                <span className="cs-hub-ch-dot" aria-hidden="true">
                  ·
                </span>
                <span className="cs-hub-ch-label">{activeSection?.navLabel}</span>
              </>
            ) : (
              <span className="cs-hub-ch-label">{data.fullName}</span>
            )}
            <span className="cs-hub-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {menuOpen && (
            <div className="cs-hub-dropdown" role="menu" aria-label="Chapters in this case study">
              <div className="cs-hub-dropdown-head">
                <span>Story chapters</span>
                <span>
                  {String(activeIdx + 1).padStart(2, "0")} /{" "}
                  {String(data.sections.length).padStart(2, "0")}
                </span>
              </div>
              <ol className="cs-hub-dropdown-list">
                {data.sections.map((sec, i) => {
                  const isCurrent = i === activeIdx;
                  const isPast = i < activeIdx;
                  return (
                    <li key={sec.id}>
                      <button
                        type="button"
                        role="menuitem"
                        aria-current={isCurrent ? "location" : undefined}
                        className={`cs-hub-dropdown-item ${isCurrent ? "is-active" : ""} ${
                          isPast ? "is-past" : ""
                        }`}
                        onClick={() => {
                          setMenuOpen(false);
                          onSelectChapter(sec.id);
                        }}
                      >
                        <span className="cs-hub-item-no">{sec.no}</span>
                        <span className="cs-hub-item-title">{sec.navLabel}</span>
                        <span className="cs-hub-item-state" aria-hidden="true">
                          {isCurrent ? "●" : isPast ? "✓" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        <span className="cs-hub-sep" aria-hidden="true" />

        {/* 3. Full Prototype Modal Trigger */}
        <button
          type="button"
          className="cs-hub-proto-btn"
          onClick={() => {
            setMenuOpen(false);
            setClockOpen(false);
            onOpenPrototype();
          }}
        >
          <span className="cs-hub-proto-full">Full Prototype</span>
          <span className="cs-hub-proto-short">Prototype</span>
          <span aria-hidden="true">↗</span>
        </button>

        <span className="cs-hub-sep" aria-hidden="true" />

        {/* 4. Miniature Live Solar Sky Clock Pill */}
        <button
          type="button"
          className={`cs-hub-clock-btn ${clockOpen ? "is-open" : ""}`}
          aria-expanded={clockOpen}
          aria-label={`Solar sky time ${formattedClock} — click to adjust`}
          onClick={() => {
            setMenuOpen(false);
            setClockOpen((v) => !v);
          }}
        >
          <span className="cs-hub-sun-orb" aria-hidden="true" />
          <span className="cs-hub-clock-text">{formattedClock}</span>
        </button>
      </div>

      {/* Expandable Solar Horizon Instrument Popover */}
      {clockOpen && (
        <>
          <div
            className="cs-hub-clock-backdrop"
            onClick={() => setClockOpen(false)}
            aria-hidden="true"
          />
          <div className="cs-hub-clock-popover">
            <ThermalSkyClock
              size="full"
              expandable={true}
              onSizeChange={(next) => {
                if (next === "thumbnail") setClockOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Task 2: Sentinel Interactive 90-Second Verification Stage ────────────── */

type SentinelStageBlock = Extract<Block, { t: "sentinel-stage" }>;
type ScenarioMode = "active" | "reverted";
type GateDecisionState = "open" | "authorized" | "lapsed";

function SentinelVerificationStage({
  b,
  onOpenFullModal,
}: {
  b: SentinelStageBlock;
  onOpenFullModal: (deepLink?: string) => void;
}) {
  const [scenario, setScenario] = useState<ScenarioMode>("active");
  const [gateState, setGateState] = useState<GateDecisionState>("open");
  const [secondsLeft, setSecondsLeft] = useState<number>(42);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [embedOk, setEmbedOk] = useState<boolean | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeIframeSrc = withDeepLink(
    b.embedSrc,
    scenario === "active" ? b.activeDeepLink : b.revertedDeepLink,
  );

  // Verify harness.html availability
  useEffect(() => {
    let alive = true;
    fetch(b.embedSrc, { method: "HEAD" })
      .then((r) => {
        if (alive) setEmbedOk(r.ok);
      })
      .catch(() => {
        if (alive) setEmbedOk(false);
      });
    return () => {
      alive = false;
    };
  }, [b.embedSrc]);

  // Gently begin live countdown 2.6s after scrolling into view (unless reduced motion)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let startDelay = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(startDelay);
        if (entry.isIntersecting && scenario === "active" && gateState === "open") {
          startDelay = window.setTimeout(() => {
            setTimerRunning(true);
          }, 2600);
        } else {
          setTimerRunning(false);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(startDelay);
    };
  }, [scenario, gateState]);

  // Countdown tick loop
  useEffect(() => {
    if (!timerRunning || scenario !== "active" || gateState !== "open") return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setGateState("lapsed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, scenario, gateState]);

  const handleScenarioSwitch = (next: ScenarioMode) => {
    setScenario(next);
    if (next === "active") {
      setGateState("open");
      setSecondsLeft(42);
      setTimerRunning(false);
    } else {
      setGateState("lapsed");
      setSecondsLeft(0);
      setTimerRunning(false);
    }
  };

  const handleAuthorize = useCallback(() => {
    setScenario("active");
    setGateState("authorized");
    setTimerRunning(false);
    try {
      const win = iframeRef.current?.contentWindow as HarnessPlayerWindow | null;
      win?.player?.authorize?.();
    } catch {
      /* same-origin guard */
    }
  }, []);

  const handleSimulateLapse = () => {
    setTimerRunning(false);
    setSecondsLeft(0);
    setGateState("lapsed");
  };

  const handleResetGate = () => {
    setScenario("active");
    setGateState("open");
    setSecondsLeft(42);
    setTimerRunning(false);
  };

  const isRevertedView = scenario === "reverted" || gateState === "lapsed";

  return (
    <div ref={stageRef} className="cs-col" data-reveal>
      <figure className="cs-fig cs-sentinel-stage">
        <div className="cs-sentinel-shell">
          {/* Top Console Bar & Scenario Switcher */}
          <div className="cs-sentinel-topbar">
            <div className="cs-sentinel-brand">
              <span
                className={`cs-sentinel-led ${
                  gateState === "authorized"
                    ? "is-ok"
                    : isRevertedView
                      ? "is-reverted"
                      : "is-alert"
                }`}
                aria-hidden="true"
              />
              <span className="cs-sentinel-kicker">
                SENTINEL INCIDENT CONSOLE · 90S VERIFICATION STATE MACHINE
              </span>
            </div>

            <div
              className="cs-sentinel-tabs"
              role="tablist"
              aria-label="Verification gate scenarios"
            >
              <button
                type="button"
                role="tab"
                aria-selected={scenario === "active"}
                className={`cs-sentinel-tab ${scenario === "active" ? "is-active" : ""}`}
                onClick={() => handleScenarioSwitch("active")}
              >
                Hotspot +620°C (Active Ignition)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={scenario === "reverted"}
                className={`cs-sentinel-tab ${scenario === "reverted" ? "is-active" : ""}`}
                onClick={() => handleScenarioSwitch("reverted")}
              >
                Timeout / False Alert Reverted
              </button>
            </div>
          </div>

          {/* Dual FLIR Thermal + RGB Feeds */}
          <div className="cs-sentinel-feeds">
            {/* Feed 1: Optical RGB */}
            <div className="cs-feed-card">
              <div className="cs-feed-head">
                <span className="cs-feed-tag">RGB ELECTRO-OPTICAL · FT-01 KITE</span>
                <span className="cs-prov-chip">MEA</span>
              </div>
              <div className="cs-feed-viewport" style={{ aspectRatio: "16 / 10" }}>
                <img
                  src={
                    scenario === "active"
                      ? "/case/sentinel/detect.png"
                      : "/case/sentinel/falsepos.png"
                  }
                  alt={
                    scenario === "active"
                      ? "FT-01 optical drone feed over Encinal Canyon ridge showing active smoke plume"
                      : "FT-01 optical drone feed confirming registered permitted burn boundary AU-2214"
                  }
                />
                <div className="cs-feed-hud-overlay" aria-hidden="true">
                  <span className="cs-feed-hud-tl">ALT 1,200 FT · WIND 14KT NW</span>
                  <span className="cs-feed-crosshair" />
                  <span className="cs-feed-hud-br">
                    {scenario === "active"
                      ? "ENCINAL RIDGE N · SMOKE COLUMN VERIFIED"
                      : "PLOT AU-2214 · AGRICULTURAL REGISTRY MATCH"}
                  </span>
                </div>
              </div>
            </div>

            {/* Feed 2: FLIR Long-Wave Infrared */}
            <div className="cs-feed-card">
              <div className="cs-feed-head">
                <span className="cs-feed-tag">FLIR LWIR 8–14μm · RADIOMETRIC IR</span>
                <span className="cs-prov-chip">MEA</span>
              </div>
              <div
                className={`cs-feed-viewport cs-feed-viewport--flir ${
                  scenario === "active" ? "is-hot" : "is-calm"
                }`}
                style={{ aspectRatio: "16 / 10" }}
              >
                <img
                  src={
                    scenario === "active"
                      ? "/case/sentinel/plan-gate.png"
                      : "/case/sentinel/falsepos.png"
                  }
                  alt={
                    scenario === "active"
                      ? "FLIR Long-Wave Infrared thermal feed isolating +620°C crown ignition hotspot"
                      : "FLIR thermal feed showing contained low-intensity agricultural burn within perimeter"
                  }
                />
                <div className="cs-feed-hud-overlay" aria-hidden="true">
                  <span className="cs-feed-hud-tl">
                    {scenario === "active" ? "PEAK CORE +620°C · ΔT +412K" : "CONTAINED +190°C · NO SPREAD"}
                  </span>
                  <span
                    className={`cs-flir-reticle ${scenario === "active" ? "is-hot" : "is-calm"}`}
                  >
                    <i />
                  </span>
                  <span className="cs-feed-hud-br">
                    {scenario === "active"
                      ? "71% SPREAD MATCH [MOD] · 37 HOMES IN PATH"
                      : "0 FIRE SURFACES DRAWN · WATCH HELD"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry HUD Decision Gate Bar */}
          <div className="cs-sentinel-hudbar">
            <div className="cs-sentinel-packet">
              <div className="cs-sentinel-packet-top">
                <span className="cs-sentinel-packet-badge">
                  {gateState === "authorized"
                    ? "COMMITTED · PACKET TRANSMITTED"
                    : isRevertedView
                      ? "SAFE DEFAULT · REVERTED TO PERIMETER WATCH"
                      : "CALFIRE MUTUAL AID PACKET PRE-STAGED"}
                </span>
                <span className="cs-prov-chip cs-prov-chip--mod">OWNED + REQ</span>
              </div>

              <p className="cs-sentinel-packet-title">
                {gateState === "authorized"
                  ? "Mutual aid & Sheriff WEA requisition authorized by Operator (Asha, IC). Encinal egress routes locked solid cyan."
                  : scenario === "reverted"
                    ? "Registry match on Plot AU-2214 (permitted burn). Alert closed cleanly — 0 aerial tankers launched, 0 false alarms."
                    : gateState === "lapsed"
                      ? "90-second gate expired without input. Silence ≠ approval: nothing transmitted; escalated to Regional Duty Supervisor."
                      : "Dual EO + FLIR confirm +620°C crown ignition. OWNED: FT-01/02 orbit · REQ: CalFire Tanker 910 + County Sheriff WEA (917 devices)."}
              </p>
            </div>

            <div className="cs-sentinel-gatebox">
              <div className="cs-sentinel-clockrow">
                <span className="cs-sentinel-clocklabel">
                  {gateState === "authorized"
                    ? "DECISION LOGGED"
                    : isRevertedView
                      ? "GATE CLOSED"
                      : "90S GATE WINDOW"}
                </span>
                <output
                  className={`cs-sentinel-timer ${
                    gateState === "authorized"
                      ? "is-ok"
                      : isRevertedView
                        ? "is-reverted"
                        : ""
                  }`}
                  aria-live="polite"
                >
                  {gateState === "authorized" ? "T+0:13" : formatCountdown(secondsLeft)}
                </output>
              </div>

              <div className="cs-sentinel-cta-row">
                {scenario === "active" && gateState === "open" && (
                  <>
                    <button
                      type="button"
                      className="cs-authorize-btn"
                      onClick={handleAuthorize}
                    >
                      <kbd className="cs-keycap">1</kbd>
                      <span>Authorize Mutual Aid</span>
                      <span aria-hidden="true">↵</span>
                    </button>
                    <button
                      type="button"
                      className="cs-secondary-hud-btn"
                      onClick={handleSimulateLapse}
                      title="Test what happens if the operator does not click before 00:00"
                    >
                      Test 00:00 Lapse
                    </button>
                  </>
                )}

                {(gateState !== "open" || scenario === "reverted") && (
                  <>
                    <button
                      type="button"
                      className="cs-secondary-hud-btn"
                      onClick={handleResetGate}
                    >
                      ↺ Reset 00:42 Gate
                    </button>
                    {scenario === "reverted" && (
                      <button
                        type="button"
                        className="cs-authorize-btn"
                        onClick={() => handleScenarioSwitch("active")}
                      >
                        Switch to +620°C Ignition →
                      </button>
                    )}
                  </>
                )}

                {scenario === "active" && gateState === "open" && (
                  <button
                    type="button"
                    className="cs-timer-toggle-btn"
                    onClick={() => setTimerRunning((r) => !r)}
                    aria-label={timerRunning ? "Pause countdown" : "Run live countdown"}
                    title={timerRunning ? "Pause countdown" : "Run live countdown"}
                  >
                    {timerRunning ? "⏸" : "▶"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Embedded Live Three.js Tactical Terrain Harness (public/embed/sentinel/harness.html) */}
          <div className="cs-sentinel-harness-wrap">
            <div className="cs-embed-head">
              <span className="cs-embed-live" aria-hidden="true" />
              <p className="cs-embed-title">
                Live Three.js Tactical Terrain Engine ({scenario === "active" ? "WUI Breakout · Gate D" : "Plot AU-2214 False Alert"})
              </p>
              <button
                type="button"
                className="cs-embed-expand"
                onClick={() =>
                  onOpenFullModal(scenario === "active" ? b.activeDeepLink : b.revertedDeepLink)
                }
              >
                Expand Full Console ↗
              </button>
            </div>

            {embedOk === false ? (
              <div
                className="cs-embed-frame cs-embed-missing"
                style={{ aspectRatio: "16 / 10" }}
              >
                <p className="cs-embed-missing-title">Prototype build unavailable</p>
                <p className="cs-embed-missing-note">
                  Static build expected at {b.embedSrc}.
                </p>
              </div>
            ) : (
              <div className="cs-sentinel-iframe-box" style={{ aspectRatio: "16 / 10" }}>
                <iframe
                  ref={iframeRef}
                  key={activeIframeSrc}
                  className="cs-embed-frame cs-embed-frame--fill"
                  src={activeIframeSrc}
                  title="FlytBase Sentinel Tactical Terrain Engine"
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {b.caption && <figcaption className="cs-cap">{b.caption}</figcaption>}
      </figure>
    </div>
  );
}

/* ── Generic Embed Block ─────────────────────────────────────────────────── */

type EmbedBlockData = Extract<Block, { t: "embed" }>;

function EmbedBlock({
  b,
  onOpenModal,
}: {
  b: EmbedBlockData;
  onOpenModal: (deepLink?: string) => void;
}) {
  const [ok, setOk] = useState<boolean | null>(null);
  const src = withDeepLink(b.src, b.deepLink);

  useEffect(() => {
    let alive = true;
    fetch(src.split("#")[0], { method: "HEAD" })
      .then((r) => {
        if (alive) setOk(r.ok);
      })
      .catch(() => {
        if (alive) setOk(false);
      });
    return () => {
      alive = false;
    };
  }, [src]);

  return (
    <div className="cs-col" data-reveal>
      <figure className="cs-fig cs-fig-embed">
        <div className="cs-plate cs-plate-embed">
          <div className="cs-embed-head">
            <span className="cs-embed-live" aria-hidden="true" />
            <p className="cs-embed-title">{b.title}</p>
            {ok !== false && (
              <button
                type="button"
                className="cs-embed-expand"
                onClick={() => onOpenModal(b.deepLink)}
              >
                Full Prototype ↗
              </button>
            )}
          </div>
          {ok === false ? (
            <div
              className="cs-embed-frame cs-embed-missing"
              style={{ aspectRatio: b.aspectRatio ?? "16 / 10" }}
            >
              <p className="cs-embed-missing-title">Prototype build unavailable</p>
              <p className="cs-embed-missing-note">
                The static build isn’t deployed at {b.src} — this slot stays for it.
              </p>
            </div>
          ) : (
            <div
              className="cs-sentinel-iframe-box"
              style={{ aspectRatio: b.aspectRatio ?? "16 / 10" }}
            >
              <iframe
                className="cs-embed-frame cs-embed-frame--fill"
                src={src}
                title={b.title}
                sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                loading="lazy"
              />
            </div>
          )}
        </div>
        {b.caption && <figcaption className="cs-cap">{b.caption}</figcaption>}
      </figure>
    </div>
  );
}

/* ── Walkthrough Video Slot (#case-walkthrough) ──────────────────────────── */

type VideoBlockData = Extract<Block, { t: "video" }>;

function WalkthroughVideoBlock({
  b,
  onOpenPrototype,
}: {
  b: VideoBlockData;
  onOpenPrototype: () => void;
}) {
  const hasFullReel = b.src.trim().length > 0;
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="cs-col" data-reveal>
      <figure className="cs-fig cs-fig-video">
        <div className="cs-plate cs-plate-video">
          {hasFullReel ? (
            <video
              className="cs-video"
              src={b.src}
              poster={b.poster}
              controls
              preload="metadata"
            />
          ) : (
            <div className="cs-video-slot" style={{ aspectRatio: "16 / 9" }}>
              {previewing && b.previewVideo ? (
                <video
                  className="cs-video-preview"
                  src={b.previewVideo}
                  poster={b.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                b.poster && (
                  <img
                    src={b.poster}
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                  />
                )
              )}

              <div className={`cs-video-hold ${previewing ? "is-previewing" : ""}`}>
                <div className="cs-video-topbar">
                  {b.plate && <p className="cs-video-plate">{b.plate}</p>}
                  {b.duration && <span className="cs-video-dur">{b.duration}</span>}
                </div>

                {!previewing && (
                  <div className="cs-video-center">
                    {b.previewVideo ? (
                      <button
                        type="button"
                        className="cs-video-playbtn"
                        onClick={() => setPreviewing(true)}
                      >
                        <span className="cs-video-play-tri" aria-hidden="true" />
                        <span>Preview Running Console Capture</span>
                      </button>
                    ) : (
                      <span className="cs-video-play" aria-hidden="true" />
                    )}
                    {b.foldHint && <p className="cs-video-foldhint">{b.foldHint}</p>}
                  </div>
                )}

                <div className="cs-video-footbar">
                  <span className="cs-video-footlabel">
                    {previewing
                      ? "Playing live capture loop · 45s narrated cut in edit"
                      : "16:9 Walkthrough Stage"}
                  </span>
                  <div className="cs-video-footactions">
                    {previewing && (
                      <button
                        type="button"
                        className="cs-video-mini-btn"
                        onClick={() => setPreviewing(false)}
                      >
                        Hold Poster
                      </button>
                    )}
                    <button
                      type="button"
                      className="cs-video-mini-btn"
                      onClick={onOpenPrototype}
                    >
                      Launch Full Prototype ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {b.caption && <figcaption className="cs-cap">{b.caption}</figcaption>}
      </figure>
    </div>
  );
}

/* ── Block Dispatcher ────────────────────────────────────────────────────── */

function BlockView({
  b,
  onOpenPrototype,
}: {
  b: Block;
  onOpenPrototype: (deepLink?: string) => void;
}) {
  switch (b.t) {
    case "lede":
      return (
        <div className="cs-col" data-reveal>
          <p className="cs-lede">{b.text}</p>
        </div>
      );
    case "p":
      return (
        <div className="cs-col" data-reveal>
          <p className="cs-p">{b.text}</p>
        </div>
      );
    case "pull":
      return (
        <div className="cs-col" data-reveal>
          <figure className="cs-pull">
            <blockquote>{b.text}</blockquote>
            {b.cite && <figcaption className="cs-pull-cite">{b.cite}</figcaption>}
          </figure>
        </div>
      );
    case "figure":
      return (
        <div
          className={["cs-figwrap", b.phone ? "cs-col-phone" : "cs-col"].join(" ")}
          data-reveal
        >
          <figure className={b.phone ? "cs-fig cs-fig-phone" : "cs-fig"}>
            <div
              className="cs-plate"
              style={{
                aspectRatio: b.aspectRatio ?? (b.phone ? "9 / 19.5" : "16 / 9"),
              }}
            >
              <img src={b.src} alt={b.alt} loading="lazy" />
            </div>
            {b.caption && <figcaption className="cs-cap">{b.caption}</figcaption>}
          </figure>
        </div>
      );
    case "decision":
      return (
        <div className="cs-col" data-reveal>
          <article className="cs-decision">
            <p className="cs-decision-label">{b.label}</p>
            {b.title && <h3 className="cs-decision-title">{b.title}</h3>}
            <div className="cs-decision-grid">
              {b.tension && (
                <div className="cs-facet">
                  <p className="cs-facet-label">The tension</p>
                  <p>{b.tension}</p>
                </div>
              )}
              {b.decision && (
                <div className="cs-facet">
                  <p className="cs-facet-label">The decision</p>
                  <p>{b.decision}</p>
                </div>
              )}
            </div>
            {b.tradeoff && (
              <div className="cs-facet cs-facet-tradeoff">
                <p className="cs-facet-label">Trade-off accepted</p>
                <p>{b.tradeoff}</p>
              </div>
            )}
            {b.proof && (
              <div className="cs-facet cs-facet-proof">
                <p className="cs-facet-label">Proof</p>
                <p>{b.proof}</p>
              </div>
            )}
          </article>
        </div>
      );
    case "disclosure":
      return (
        <div className="cs-col" data-reveal>
          <details className="cs-disclosure">
            <summary className="cs-disclosure-summary">
              <span>{b.summary ?? "Read the decision background"}</span>
              <span className="cs-disclosure-icon" aria-hidden="true">
                ⌄
              </span>
            </summary>
            <div className="cs-disclosure-body">
              {b.items.map((it) => (
                <div key={it.label} className="cs-disclosure-row">
                  <h4>{it.label}</h4>
                  <p>{it.text}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      );
    case "table":
      return (
        <div className="cs-col" data-reveal>
          <figure className="cs-tablewrap">
            <div className="cs-table-scroll">
              <table className="cs-table">
                <thead>
                  <tr>
                    {b.head.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {b.caption && <figcaption className="cs-cap">{b.caption}</figcaption>}
          </figure>
        </div>
      );
    case "timeline":
      return (
        <div className="cs-col" data-reveal>
          {b.title && <p className="cs-timeline-title">{b.title}</p>}
          <ol className="cs-timeline">
            {b.items.map((it, i) => (
              <li key={i} className="cs-timeline-item">
                <span className="cs-timeline-time">{it.time}</span>
                <div>
                  <h4>{it.title}</h4>
                  <p>{it.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      );
    case "receipts":
      return (
        <div className="cs-col" data-reveal>
          <div className="cs-receipts">
            <div className="cs-receipt">
              <p className="cs-facet-label">{b.leftTitle}</p>
              <ul>
                {b.left.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            </div>
            <div className="cs-receipt">
              <p className="cs-facet-label">{b.rightTitle}</p>
              <ul>
                {b.right.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    case "list":
      return (
        <div className="cs-col" data-reveal>
          {b.ordered ? (
            <ol className="cs-list">
              {b.items.map((li, i) => (
                <li key={i}>
                  <span className="cs-list-no" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{li}</span>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="cs-list cs-list-plain">
              {b.items.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          )}
        </div>
      );
    case "note":
      return (
        <div className="cs-col" data-reveal>
          <aside className="cs-note">
            <p className="cs-facet-label">{b.label}</p>
            <p>{b.text}</p>
          </aside>
        </div>
      );
    case "chips":
      return (
        <div className="cs-col" data-reveal>
          <div className="cs-chiprow">
            {b.items.map((c) => (
              <span key={c} className="cs-chip">
                {c}
              </span>
            ))}
          </div>
        </div>
      );
    case "video":
      return <WalkthroughVideoBlock b={b} onOpenPrototype={() => onOpenPrototype()} />;
    case "sentinel-stage":
      return <SentinelVerificationStage b={b} onOpenFullModal={onOpenPrototype} />;
    case "embed":
      return <EmbedBlock b={b} onOpenModal={onOpenPrototype} />;
    case "anatomy": {
      const hasPins = b.layers.some(
        (l) => typeof l.x === "number" && typeof l.y === "number",
      );
      return (
        <div className="cs-col" data-reveal>
          <figure className={hasPins ? "cs-fig cs-anatomy cs-anatomy-pins" : "cs-fig cs-anatomy"}>
            <p className="cs-anatomy-title">{b.title}</p>
            <div className="cs-plate cs-anatomy-plate">
              <div
                className="cs-anatomy-shot"
                style={{ aspectRatio: b.aspectRatio ?? "16 / 9" }}
              >
                <img src={b.src} alt={b.alt} loading="lazy" />
                {hasPins &&
                  b.layers.map((l, i) =>
                    typeof l.x === "number" && typeof l.y === "number" ? (
                      <span
                        key={i}
                        className="cs-anatomy-pin"
                        style={{ left: `${l.x}%`, top: `${l.y}%` }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                    ) : null,
                  )}
              </div>
            </div>
            <ol className="cs-anatomy-list">
              {b.layers.map((l, i) => (
                <li key={i}>
                  <span className="cs-anatomy-no" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h4>{l.label}</h4>
                    <p>{l.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            {b.caption && <figcaption className="cs-cap">{b.caption}</figcaption>}
          </figure>
        </div>
      );
    }
    default:
      return null;
  }
}

/* ── Chapter Section Card ────────────────────────────────────────────────── */

function SectionView({
  s,
  onOpenPrototype,
}: {
  s: CaseSection;
  onOpenPrototype: (deepLink?: string) => void;
}) {
  return (
    <section id={s.id} className="cs-section">
      <div className="cs-chapter-card">
        <div className="cs-col" data-reveal>
          <div className="cs-sechead">
            <p className="cs-sectno">
              <span className="cs-sectno-n">{s.no}</span>
              <span className="cs-sectno-rule" aria-hidden="true" />
              <span className="cs-sectno-k">{s.kicker}</span>
            </p>
            <h2 className="cs-sectitle">{s.title}</h2>
            {s.standfirst && <p className="cs-standfirst">{s.standfirst}</p>}
          </div>
        </div>
        {s.blocks.map((b, i) => (
          <BlockView key={i} b={b} onOpenPrototype={onOpenPrototype} />
        ))}
      </div>
    </section>
  );
}

/* ── Main Centered 920px Case Study Reader ───────────────────────────────── */

export function CaseStudyPage() {
  const { path, params } = useRoute();
  const caseId = path.replace(/^\/(case|projects)\//, "").replace(/\/e$/, "");
  const data = getCase(caseId);
  const idx = Math.max(0, CASE_ORDER.indexOf(data.id));
  const nextId = CASE_ORDER[(idx + 1) % CASE_ORDER.length];
  const next = getCase(nextId);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPastWalkthrough, setIsPastWalkthrough] = useState(false);
  const [protoModalOpen, setProtoModalOpen] = useState(() => params.get("prototype") === "1");
  const [protoDeepLink, setProtoDeepLink] = useState<string | undefined>(undefined);

  // Sync modal state when route query changes (e.g. /projects/sentinel/e)
  useEffect(() => {
    if (params.get("prototype") === "1") {
      setProtoModalOpen(true);
    }
  }, [params, data.id]);

  // Reset scroll spy on case switch
  useEffect(() => {
    setActiveIdx(0);
    setIsPastWalkthrough(false);
  }, [data.id]);

  // Live Scroll-Spy & #case-walkthrough Fold Detector (rAF-throttled)
  useEffect(() => {
    let raf = 0;
    const updateScrollState = () => {
      raf = 0;
      const walkthroughEl = document.getElementById("case-walkthrough");
      if (walkthroughEl) {
        const rect = walkthroughEl.getBoundingClientRect();
        // Fold the 6 chapters into the Top Hub Capsule once #case-walkthrough scrolls past
        setIsPastWalkthrough(rect.bottom <= 130);
      } else {
        setIsPastWalkthrough(window.scrollY > 560);
      }

      const threshold = window.innerHeight * 0.34;
      let current = 0;
      for (let i = 0; i < data.sections.length; i++) {
        const el = document.getElementById(data.sections[i].id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) {
          current = i;
        }
      }
      setActiveIdx(current);
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [data.sections]);

  const scrollToChapter = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const openPrototypeModal = useCallback((deepLink?: string) => {
    setProtoDeepLink(deepLink);
    setProtoModalOpen(true);
  }, []);

  return (
    <div className="case-reader" data-case={data.id}>
      {/* ── State 1 & State 2 Unified Floating Top Hub Capsule ──────────── */}
      <TopHubCapsule
        data={data}
        activeIdx={activeIdx}
        isPastWalkthrough={isPastWalkthrough}
        onSelectChapter={scrollToChapter}
        onOpenPrototype={openPrototypeModal}
      />

      {/* ── Centered 920px Editorial Stage Over the Persistent 24h Sky ───── */}
      <div className="cs-stage">
        {/* State 1: Hero Header + Metadata + Upfront 6-Chapter Overview Grid */}
        <header className="cs-hero-section">
          <div className="cs-chapter-card cs-hero-card">
            <div className="cs-col">
              <div className="cs-hero-eyebrow-row">
                <p className="cs-tagline">{data.tagline}</p>
                <span className="cs-status-pill">
                  <span className="cs-status-dot" aria-hidden="true" />
                  {data.status}
                </span>
              </div>

              <h1 className="cs-title">
                {data.title}{" "}
                {data.titleAccent && (
                  <span className="cs-title-accent">{data.titleAccent}</span>
                )}
              </h1>

              <p className="cs-hook">{data.hookLine}</p>

              {/* 4-Cell Recruiter Metadata Grid */}
              <div className="cs-meta-grid">
                {data.metaGrid.map((m) => (
                  <div key={m.label} className="cs-meta-cell">
                    <span className="cs-meta-k">{m.label}</span>
                    <span className="cs-meta-v">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Upfront 6-Chapter Overview Card (Visible immediately before scrolling) */}
              <nav className="cs-overview-box" aria-label="6-chapter case study overview">
                <div className="cs-overview-head">
                  <span className="cs-overview-title">Chapters on this page</span>
                  <span className="cs-overview-hint">
                    Folds into Top Hub Capsule past walkthrough ↓
                  </span>
                </div>
                <div className="cs-overview-grid">
                  {data.sections.map((s, i) => {
                    const isCurrent = i === activeIdx;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`cs-overview-item ${isCurrent ? "is-active" : ""}`}
                        onClick={() => scrollToChapter(s.id)}
                      >
                        <span className="cs-overview-no">{s.no}</span>
                        <span className="cs-overview-label">{s.navLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Pervasive Honesty Boundary */}
              <details className="cs-boundary-disclosure">
                <summary className="cs-boundary-summary">
                  <span className="cs-boundary-badge">Pervasive Honesty Boundary</span>
                  <span className="cs-boundary-preview">
                    Greater Noida, India · IST · Verified benchmarks &amp; scripted scope
                  </span>
                  <span className="cs-disclosure-icon" aria-hidden="true">
                    ⌄
                  </span>
                </summary>
                <p className="cs-boundary-body">{data.boundary}</p>
              </details>
            </div>
          </div>
        </header>

        {/* 6 Sequential Chapters (01 -> 02 #case-walkthrough -> 03 Stage -> 04 -> 05 -> 06) */}
        {data.sections.map((s) => (
          <SectionView key={s.id} s={s} onOpenPrototype={openPrototypeModal} />
        ))}

        {/* Closing Reflection & Next Case Study Ramp */}
        <section className="cs-section cs-close-section">
          <div className="cs-chapter-card cs-close-card">
            <div className="cs-col" data-reveal>
              <div className="cs-pull cs-close-pull">
                <blockquote>{data.closeLine}</blockquote>
              </div>
              {data.colophon && <p className="cs-colophon">{data.colophon}</p>}

              <div className="cs-check">
                <p className="cs-check-label">Verification &amp; Direct Contact</p>
                <p className="cs-check-line">
                  Every metric in this case study carries its source basis —{" "}
                  <a className="cs-check-mail" href="mailto:rudraksh.singhh@outlook.com">
                    rudraksh.singhh@outlook.com
                  </a>{" "}
                  · Greater Noida, India · IST
                </p>
              </div>

              <div className="cs-nextrow">
                <Link href={`/case/${next.id}`} className="cs-next">
                  <span className="cs-next-meta">
                    Next case study · {next.index} — {next.fullName}
                  </span>
                  <span className="cs-next-title">
                    {next.title} {next.titleAccent ?? ""}
                  </span>
                  <span className="cs-next-arw" aria-hidden="true">
                    →
                  </span>
                </Link>

                <button
                  type="button"
                  className="cs-top"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  Back to top ↑
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Expanded Full-Viewport Prototype Veil Modal */}
      {protoModalOpen && (
        <PrototypeVeilModal
          proto={data.prototype}
          initialDeepLink={protoDeepLink}
          onClose={() => setProtoModalOpen(false)}
        />
      )}
    </div>
  );
}
