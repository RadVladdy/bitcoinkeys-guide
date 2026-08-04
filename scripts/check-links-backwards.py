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
the demo hub was a lesson then — position 17 in curriculum.js, under the name
/deep-dive. So every "deeper dive →" link was a forward link the check
structurally could not see: seven of them on /learn/bitcoin-keys alone, plus the
ladder and beyond-the-ladder. The invariant was passing because the regex missed,
not because we had decided anything.

Those links stay. The demos call themselves optional and skippable, so an aside
into one is not the same as sending a reader forward through the course — but
that is a DECISION, and it has to be declared rather than assumed.

WHAT CHANGED SINCE, and it is why DEMO_ASIDE now COUNTS rather than suppresses:
level 201 was removed on 2026-08-01 and the hub stopped being a lesson at all, so
a link into a demo can no longer be a forward link by construction. The exception
is kept anyway, and the count is printed, because a number that appears in the
output is a number somebody notices changing — if the demos are ever folded back
into the course, this is the line that says so. Renamed /deep-dive → /demos on
2026-08-04 with the rest of that vocabulary.

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

# The one declared exception. A demo under /demos/<name> is an optional aside,
# not a step in the course. If the hub is ever made a lesson again, linking IT
# from an earlier lesson is a forward link and still fails.
DEMO_ASIDE = re.compile(r'^/demos/[^/]+/?$')

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
        if DEMO_ASIDE.match(link):
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
      f'{asides} declared demo asides allowed)')
