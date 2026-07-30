#!/usr/bin/env python3
"""Invariant #9 — links point backwards.

The course is linear, so a lesson may link to material the reader has already
passed, never to material ahead of it. The sole exception is LessonNav's "next
lesson" footer, which is stripped before checking.

ADDED 2026-07-30. The invariant had been asserted in prose since 07-29 with no
tool behind it, and two pages were breaking it in production the whole time:
/learn/how-bitcoin-is-lost carried eight forward links (it ended every risk
bucket with "the page in this guide that defends against it", at position 3 of
15), and /learn/bitcoin-keys pointed twice at the ladder three lessons ahead.
That is the same failure the old /principles page was retired for — so it gets a
check rather than a promise.

THE BLIND SPOT, found 2026-07-30: this only ever matched href="/learn/*", but
/deep-dive IS a lesson — position 17 in curriculum.js. So every "deeper dive →"
link was a forward link the check structurally could not see: seven of them on
/learn/bitcoin-keys alone, plus the ladder and beyond-the-ladder. The invariant was
passing because the regex missed, not because we had decided anything.

Those links stay. 201 calls itself optional and skippable, so a deeper-dive aside
is not the same as sending a reader forward through the course — but that is a
DECISION, and it now has to be declared rather than assumed. DEEP_DIVE_ASIDE below
is the exception, and a forward link to any OTHER lesson still fails, /deep-dive
included if it is ever linked as a lesson rather than as an aside.

Run against dist/ after a build:   python3 scripts/check-links-backwards.py
Exits non-zero if any lesson points forward.
"""
import json
import pathlib
import re
import subprocess
import sys

DIST = pathlib.Path('dist')

seq = json.loads(subprocess.run(
    ['node', '-e',
     'import("./src/data/curriculum.js").then(m=>console.log(JSON.stringify('
     'm.lessonSequence.map(l=>({h:l.href})))))'],
    capture_output=True, text=True, check=True).stdout)

order = {l['h'].rstrip('/'): i for i, l in enumerate(seq)}

# The one declared exception. A demo under /deep-dive/<name> is an optional aside
# into level 201, not a step in the course. The hub itself (/deep-dive) is a lesson,
# so linking IT from an earlier lesson is still a forward link and still fails.
DEEP_DIVE_ASIDE = re.compile(r'^/deep-dive/[^/]+/?$')

bad = []
asides = 0
for href, pos in order.items():
    page = DIST / href.strip('/') / 'index.html'
    if not page.exists():
        print(f'  !! no built page for lesson {href}')
        bad.append((href, pos + 1, '(missing page)', 0))
        continue
    html = page.read_text()
    main = html[html.index('<main'):html.index('</main>')] if '<main' in html else html
    # the prev/next footer is the one legal forward link
    main = re.sub(r'<nav class="lesson-nav".*?</nav>', '', main, flags=re.S)
    # Every internal link, not just /learn/* — that narrowing was the blind spot.
    for link in sorted(set(re.findall(r'href="(/[^"#?]*)', main))):
        target = link.rstrip('/')
        if DEEP_DIVE_ASIDE.match(link):
            asides += 1
            continue
        if target in order and order[target] > pos:
            bad.append((href, pos + 1, target, order[target] + 1))

for src, spos, dst, dpos in sorted(bad, key=lambda x: x[1]):
    print(f'  L{spos:>2} {src:<32} --FORWARD--> L{dpos:>2} {dst}')

if bad:
    print(f'\n!! {len(bad)} forward link(s) across '
          f'{len(set(b[0] for b in bad))} lesson(s) — invariant #9 broken')
    sys.exit(1)

print(f'clean — no lesson links forward ({len(order)} lessons checked, '
      f'{asides} declared deep-dive asides allowed)')
