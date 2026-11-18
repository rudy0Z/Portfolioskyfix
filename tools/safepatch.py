"""safepatch — guarded text patching for this repo.

Why this exists: a `str.replace` whose search text silently fails to match
does nothing (Python never errors on no-match), and a slice built from a
failed `find` (-1) can evaluate to "" — and `s.replace("", x)` interleaves x
between EVERY character of the file. That turned a 146KB source file into
276MB in one edit and nearly took the machine down (2026-11-03).

Rules enforced here, always:
  1. Search text must exist (asserted, with the expected occurrence count).
  2. Search text must never be empty.
  3. The patched result must stay within a sane size envelope.
  4. Nothing is written unless every check passes.
"""

from __future__ import annotations

import sys
from pathlib import Path

MAX_REASONABLE = 600_000  # largest source file in this repo is ~150KB


def apply(path: str | Path, replacements: list[tuple[str, str]], *, count: int = 1) -> None:
    """Apply every (old, new) replacement to `path` atomically.

    Fails loudly — with the file untouched — if any search text is missing.
    """
    p = Path(path)
    before = p.read_text(encoding="utf8")

    if not before:
        raise SystemExit(f"safepatch: {path} is empty — refusing")

    current = before
    for i, (old, new) in enumerate(replacements):
        if not old:
            raise SystemExit(f"safepatch: replacement {i} has EMPTY search text — forbidden")
        found = current.count(old)
        if found < count:
            shown = old[:120].replace("\n", "\\n")
            raise SystemExit(
                f"safepatch: replacement {i} marker found {found}x (need {count}) in {path}: {shown!r}"
            )
        current = current.replace(old, new) if count == 1 else current.replace(old, new, count)

    grown = len(current) / max(1, len(before))
    if len(current) > MAX_REASONABLE or grown > 1.2:
        raise SystemExit(
            f"safepatch: size envelope blown on {path}: {len(before)} -> {len(current)} "
            f"({grown:.2f}x) — refusing to write"
        )

    p.write_text(current, encoding="utf8", newline="")
    print(f"safepatch: {path} {len(before)} -> {len(current)} bytes, {len(replacements)} edit(s) ok")


def replace_region(path: str | Path, start: str, end: str, new: str, *, include_end: bool = False, max_growth: float = 1.2) -> None:
    """Replace [start marker .. end marker) with `new` — guarded like apply().

    Both markers must occur EXACTLY once, end must come after start, empty
    markers are forbidden, and the size envelope is enforced before writing.
    `max_growth` may only be raised for intentional, marker-verified region
    restorations — never to squeeze an accidental blowup through.
    """
    p = Path(path)
    before = p.read_text(encoding="utf8")

    if not before:
        raise SystemExit(f"safepatch: {path} is empty — refusing")
    if not start or not end:
        raise SystemExit("safepatch: replace_region markers must be non-empty")

    n_start, n_end = before.count(start), before.count(end)
    if n_start != 1 or n_end != 1:
        raise SystemExit(
            f"safepatch: region markers not unique in {path} (start {n_start}x, end {n_end}x)"
        )

    a = before.index(start)
    b = before.index(end)
    if b < a:
        raise SystemExit(f"safepatch: end marker precedes start marker in {path}")
    b2 = b + len(end) if include_end else b

    current = before[:a] + new + before[b2:]
    grown = len(current) / max(1, len(before))
    if len(current) > MAX_REASONABLE or grown > max_growth:
        raise SystemExit(
            f"safepatch: size envelope blown on {path}: {len(before)} -> {len(current)} "
            f"({grown:.2f}x) — refusing to write"
        )

    p.write_text(current, encoding="utf8", newline="")
    print(f"safepatch: {path} region {a}..{b2} replaced, {len(before)} -> {len(current)} bytes")


if __name__ == "__main__":
    print("import me: from safepatch import apply")
    sys.exit(1)
