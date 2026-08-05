#!/usr/bin/env python3
"""No lesson links to a take-action page.

THE POLICY (2026-08-04): the curriculum teaches; it does not hand the reader a
door out. A lesson ending in "Find your setup →" removes a reader from a
seventeen-lesson course at the exact point the material starts paying off, and
every page that did it sat in the first two-thirds, where the reader has the
least context for the decision being offered. Where the doing lives is now said
IN WORDS — LessonClose.astro names the menu group and label, derived from nav.js
— so the reader navigates there deliberately instead of being pushed.

WHY THIS IS A SCRIPT. The links were not added carelessly; each one was a
reasonable local decision by someone improving one page, and five of them
accumulated without anyone deciding the course should behave that way. That is
exactly the failure mode this repo already knows: a rule kept as prose is a
hope. The no-forward-links invariant was prose for a day and a walk then found
nine live violations.

WHAT IS ALLOWED, and the distinction is the whole rule:

  · backward links to earlier lessons — the course is linear and that is fine
  · /glossary, /resources, /how-we-weigh-risk, /about — reference and
    methodology, not things to go and DO
  · /privacy-tools/* — the same class, and declared here rather than left to
    the fact that it simply is not in the list below. Added 2026-08-05, when
    three tools were promoted out of run-a-node's last section onto their own
    pages. They send the reader nowhere to buy or sign up, they name software
    without linking to it, and they hand the reader back to the privacy lesson.
    A page that ever starts linking out to a wallet vendor stops qualifying and
    belongs in ACTION_PREFIXES instead.
  · /demos/<name> — limited, self-contained, and they hand the reader back
  · the security advisory — a safety warning, not an action surface, and it is
    linked site-wide from the banner on every page anyway. Removing it from a
    lesson about seed generation would cost a reader a safety path to satisfy a
    consistency that nobody is served by. Declared here rather than assumed.

Usage: npm run build && python3 scripts/check-lesson-exits.py
"""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

# Take-action surfaces. A lesson may describe these; it may not link to them.
ACTION_PREFIXES = (
    '/find-your-setup',
    '/my-plan',
    '/checklist',
    '/wallets',
    '/standard',
    '/collaborative',
    '/metal-backups',
    '/roll-your-own-seed',
    '/dice-word-table',
    '/tip',
)

# Declared exceptions, each with the reason it is one.
ALLOWED = {
    '/advisory': 'a safety warning, not an action surface — and the site-wide banner '
                 'links it from every page regardless',
}


def lessons():
    out = subprocess.run(
        ['node', '-e',
         'import("./src/data/curriculum.js").then(m=>console.log(JSON.stringify('
         'm.lessonSequence.map(l=>l.href))))'],
        cwd=ROOT, capture_output=True, text=True)
    if out.returncode:
        sys.exit(f'!! could not read the curriculum\n{out.stderr.strip()}')
    return json.loads(out.stdout)


def main():
    if not DIST.exists():
        sys.exit('!! no dist/ — run npm run build first')
    bad = []
    allowed_hits = 0
    checked = 0
    for href in lessons():
        f = DIST / href.strip('/') / 'index.html'
        if not f.exists():
            bad.append((href, '(no built page)'))
            continue
        checked += 1
        html = f.read_text()
        m = re.search(r'<main\b.*?>(.*)</main>', html, re.S)
        body = m.group(1) if m else html
        # The prev/next footer is the course's own navigation, not an exit.
        body = re.sub(r'<nav class="lesson-nav".*?</nav>', '', body, flags=re.S)
        for link in sorted({h for h in re.findall(r'href="(/[^"#?]*)', body)}):
            clean = link.rstrip('/') or '/'
            if any(clean == a or clean.startswith(a + '/') for a in ALLOWED):
                allowed_hits += 1
                continue
            if any(clean == a or clean.startswith(a + '/') for a in ACTION_PREFIXES):
                bad.append((href, clean))

    for src, dst in bad:
        print(f'  {src:34s} --EXIT--> {dst}')
    if bad:
        print(f'\n!! {len(bad)} take-action link(s) from {len(set(b[0] for b in bad))} lesson(s).')
        print('   The curriculum describes where the doing lives; it does not link to it.')
        print('   Use LessonClose.astro — it names the menu group and label from nav.js.')
        sys.exit(1)
    print(f'clean — no lesson links to a take-action page '
          f'({checked} lessons checked, {allowed_hits} declared exception(s) allowed)')


if __name__ == '__main__':
    main()
