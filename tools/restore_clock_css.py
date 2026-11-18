"""Restore the original tsc-* CSS block (from git HEAD) in place of the skc-* block."""
import subprocess
import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply, replace_region

PATH = r"D:\Portfolioskyfix\src\styles\global.css"

head_css = subprocess.run(
    ["git", "show", "HEAD:src/styles/global.css"],
    capture_output=True, text=True, encoding="utf8", check=True,
).stdout

BLOCK_START = "/* ==========================================================================\n   ThermalSkyClock — Pin UI Thermal Dial × LensClock Hybrid\n   ========================================================================== */"
REGION_END = "/* ── site top chrome ──"

a = head_css.index(BLOCK_START)
b = head_css.index(REGION_END)
restored_block = head_css[a:b]
assert "tsc-root--full" in restored_block and "thermal-nav" in restored_block
print(f"extracted original clock CSS block: {len(restored_block)} bytes")

SKC_START = "/* ==========================================================================\n   ThermalSkyClock — the sky instrument."
replace_region(
    PATH,
    SKC_START,
    REGION_END,
    restored_block,
    max_growth=1.4,  # intentional, marker-verified restoration of a committed block
)

# The site-top section's popover anchor was renamed to .skc-root--full; rename back.
apply(PATH, [
    (""".skc-root--full {
  position: fixed;
  top: 62px;
  right: 18px;
  z-index: 50;
}
@media (max-width: 640px) {
  .skc-root--full {
    top: 58px;
    right: 10px;
  }""",
     """.tsc-root--full {
  position: fixed;
  top: 62px;
  right: 18px;
  z-index: 50;
}
@media (max-width: 640px) {
  .tsc-root--full {
    top: 58px;
    right: 10px;
  }"""),
])
