#!/usr/bin/env python3
"""Fail when a literal \\uXXXX escape sequence reaches a reader.

WHAT THIS CATCHES, and it was live for fourteen days before anything did.
/metal-backups shipped 2026-07-31 with its opening paragraph reading

    \\u201cMove it to metal\\u201d is easy to say and oddly hard to act on \\u2014 ...

instead of curly quotes and an em dash. Four corrupted characters in the first
sentence a reader meets on that page.

WHY EVERY EXISTING CHECK WAS BLIND TO IT. The nine other check-*.py scripts
compare the site to its DATA FILES — rule citations, device coverage, freshness
stamps, backwards links. Every one of them passed, correctly: the page agreed
with wallets.js and metal.js perfectly. Nothing in this repo had ever asked
whether the rendered PROSE is well-formed, because prose is what the editorial
walk is for -- and /metal-backups was created the day AFTER that walk closed
(Action side finished 2026-07-30), so it is the one substantive page nobody has
ever read end to end. A gap in a human pass and a gap in the machine passes
lined up exactly.

WHY THE MISTAKE IS EASY AND WILL RECUR. In an .astro file the escape is
interpreted in some positions and literal in others, and the two look identical
in the editor:

    title="... \\u00b7 ..."          <- prop, parsed as a JS string   -> renders ·
    description={`... \\u2014 ...`}  <- expression, a JS template     -> renders —
    <p>... \\u2014 ...</p>           <- TEXT CHILD, raw HTML          -> renders \\u2014

Only the third is broken, so a writer who checks the title and the meta
description sees them come out right and reasonably concludes the file is fine.

SCOPE, deliberately narrow. <script> and <style> bodies are skipped: `\\u` is
legitimate and common inside JavaScript string literals, and flagging it there
would make this the fourth check in this repo to cry wolf. It reads dist/, not
src/, because the question is what a READER receives -- the same reason
check-pseudonymity.py scans built output.
"""
import pathlib
import re
import sys

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist"
ESCAPE = re.compile(r"\\u[0-9a-fA-F]{4}")
STRIPPED = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S | re.I)


def main() -> int:
    if not DIST.is_dir():
        print("check-literal-escapes: no dist/ — run `npm run build` first", file=sys.stderr)
        return 1

    pages = sorted(DIST.rglob("*.html"))
    if not pages:
        # A run that inspects nothing must not report clean. Same guard the
        # diagram measurer grew on 2026-08-12, for the same reason.
        print("check-literal-escapes: dist/ holds no HTML — refusing to pass", file=sys.stderr)
        return 1

    faults = []
    for page in pages:
        body = STRIPPED.sub(" ", page.read_text(errors="replace"))
        for m in ESCAPE.finditer(body):
            start = max(0, m.start() - 50)
            context = re.sub(r"\s+", " ", body[start:m.end() + 30])
            faults.append((page.relative_to(DIST).as_posix(), m.group(0), context))

    if faults:
        print(f"check-literal-escapes: {len(faults)} literal escape(s) reaching readers\n")
        for where, esc, context in faults:
            print(f"  {where}")
            print(f"     {esc}  ::  ...{context}...")
        print("\nThese are TEXT, not characters. Replace each with the character it names.")
        return 1

    print(f"check-literal-escapes: clean — {len(pages)} built page(s), no literal escapes in reader-visible text")
    return 0


if __name__ == "__main__":
    sys.exit(main())
