# Sky Portfolio — Test Infrastructure Specification (`TEST_INFRA.md`)

## 1. Overview & Architecture

The Sky Portfolio E2E Testing Infrastructure provides an automated, requirement-driven, opaque-box test harness designed to rigorously verify requirements **R1**, **R2**, and **R3** across all 11 features (**F1** through **F11**) specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

- **Framework**: Native Node.js ESM test harness and runner (`node:perf_hooks`, `node:fs`, `node:path`).
- **Dependencies**: Zero external testing daemon dependencies — runs directly in Node.js v20+ with lightning-fast execution (<50ms).
- **Execution Interface**: Standardized npm and direct script invocations (`npm test`, `npm run test:e2e`, `node tests/e2e/runner.mjs`).
- **Scope & Boundaries**: Pure opaque-box testing against interface contracts, mathematical invariants, state machine state spaces, and source component structures. Test code lives strictly in `tests/e2e/` and never mutates application implementation files in `src/`.

---

## 2. Directory Layout & File Organization

```
D:\skyportfolio\
├── tests/
│   └── e2e/
│       ├── harness.mjs                # Test runner core, assertion helpers, DOM simulator & mathematical oracles
│       ├── tier1-features.test.mjs    # Tier 1: Feature Coverage (>=5 test cases per feature for F1-F10, 61 tests)
│       ├── tier2-boundaries.test.mjs  # Tier 2: Boundary & Corner Cases (>=5 test cases per feature for F1-F10, 52 tests)
│       ├── tier3-cross-feature.test.mjs # Tier 3: Cross-Feature Combinations (7 pairwise integration suites)
│       ├── tier4-scenarios.test.mjs   # Tier 4: Real-World Application Scenarios (4 end-to-end full visitor journeys)
│       └── runner.mjs                 # Master test execution script with terminal reporting and exit codes
├── TEST_INFRA.md                      # This infrastructure specification document
├── TEST_READY.md                      # Test suite readiness and execution verification report
└── package.json                       # Includes "test" and "test:e2e" execution scripts
```

---

## 3. Four-Tier Testing Methodology

| Tier | Name | Focus | Test Count | Status |
|------|------|-------|------------|--------|
| **Tier 1** | Feature Coverage | Primary behavior, interface contracts, DOM roles, styles, and timing across F1–F10 | 61 tests | **PASSED** (100%) |
| **Tier 2** | Boundary & Corner Cases | Viewport extremes, negative values, mathematical limits, race conditions, error handling | 52 tests | **PASSED** (100%) |
| **Tier 3** | Cross-Feature Combinations | Pairwise interactions between concurrent subsystems (e.g. scroll + audio, clock + notch morph) | 7 suites | **PASSED** (100%) |
| **Tier 4** | Real-World Application Scenarios | Complete multi-step visitor journeys from initial botanical bloom to excavation crater & orbit | 4 journeys | **PASSED** (100%) |
| **Total**| **Complete E2E Suite** | **Comprehensive opaque-box verification** | **124 tests** | **PASSED (100%)** |

---

## 4. Authoritative Specification Oracles

All tests evaluate against explicit, authoritative mathematical derivations defined in `PROJECT.md`:

### 4.1 Cursor-Tracking Flower Mathematics (F3)
- **Vector Angle**:
  $$\theta = \operatorname{atan2}(Y_m - Y_f, X_m - X_f)$$
- **Damped Clamped Radius**:
  $$D = \sqrt{(X_m - X_f)^2 + (Y_m - Y_f)^2}$$
  $$R = R_{\max} \cdot \tanh\left(\frac{D}{280}\right), \quad R_{\max} = 4.5\text{px}$$
- **Displacement Offsets**:
  $$dx = R \cdot \cos\theta, \quad dy = R \cdot \sin\theta$$
- **3D Tilt Perspective**:
  $$\text{perspective}(400\text{px}) \;\operatorname{rotateX}(\operatorname{clamp}(-20^\circ, 20^\circ, -(dy / vh) \cdot 40^\circ)) \;\operatorname{rotateY}(\operatorname{clamp}(-25^\circ, 25^\circ, (dx / vw) \cdot 50^\circ))$$

### 4.2 Top Notch Morphing State Machine (F4)
- **Case Study Detection**: $\text{isCaseStudy} = \text{path}.\operatorname{startsWith}("/\text{case}/")$
- **Scroll Detection**: $\text{isScrolled} = scrollY > 60$
- **Morph Condition**:
  $$\text{isCompact} = (\text{isCaseStudy} \lor \text{isScrolled}) \land \neg\text{isHovered} \land \neg\text{isMobileDrawerOpen}$$
- **Dimensions**:
  - Expanded: `height = 44px`, `width = auto`
  - Compact: `height = 48px`, `width = 48px` (circular flower notch)

### 4.3 Character Video Slot Solar Relighting (F8)
- **Night Emissive**: $\text{nightEmissive} = 1 - \text{daylight}$
- **Directional Rim Shadow**:
  $$\text{rimShadowX} = \text{cloudKeyX} \times 30\text{px}, \quad \text{rimShadowY} = \text{cloudKeyY} \times 15\text{px}$$
- **Night Backlight Opacity**: $15\% \times \text{nightEmissive}$
- **Aspect Ratio**: Locked to $16:9$ (`aspect-[16/9]`)

### 4.4 Hero Island Parallax Progress (F7)
- **Scroll Progress**:
  $$p = \operatorname{clamp}\left(0, 1, \frac{scrollY}{\text{heroTrackHeight} - \text{viewportHeight}}\right)$$

---

## 5. Execution Commands

### Run Full Test Suite
```bash
npm test
```
*or*
```bash
npm run test:e2e
```
*or*
```bash
node tests/e2e/runner.mjs
```

### Exit Codes
- `0`: All tests passed cleanly (100% success).
- `1`: One or more tests failed (details logged to stdout).
