#!/usr/bin/env python3
"""Pseudonymity check — nothing that identifies the author may reach the public site.

WHY THIS EXISTS. On 2026-07-30 the owner's real first name shipped to production in
THREE places at once, all from a single day's commenting habit, and he found it on
his own site before any check did. This runs before every push now.

Two mechanisms did it, and neither is obvious:

  1. AN HTML COMMENT IN AN .astro TEMPLATE SHIPS TO THE BROWSER. `<!-- ... -->` is
     not a build-time comment; it is output. Every internal note written that way is
     readable in view-source. Thirty-three of them were.

  2. `{/* ... */}` INSIDE A JAVASCRIPT TEMPLATE LITERAL IS NOT A COMMENT — it is
     literal text, and it RENDERS ON THE PAGE. That one was visible to any reader,
     mid-card, in the middle of a recommendation. Same family as the
     `${...}`-in-a-plain-quoted-attribute trap already in the spine: JSX syntax
     placed inside a string is just characters.

The safe place for internal reasoning is the `---` frontmatter block, as `//`
comments. Those are compiled away and never ship.

Usage:  python3 scripts/check-pseudonymity.py     (exits non-zero on a finding)
"""
import re
import sys
import pathlib

DIST = pathlib.Path('dist')
SRC = pathlib.Path('src')

# The names to look for are NOT stored in this repo — that would put the very
# string we are trying to keep out of it back into it, in the file whose whole job
# is to keep it out. They live in an untracked local file, one pattern per line:
#
#     ~/.config/bkeys-identifiers.txt
#
# Structural identifiers that name nobody (home paths, personal mail hosts) are
# built in, so the check still does useful work if that file is missing — but it
# says loudly that it is running degraded rather than printing a clean pass.
STRUCTURAL = [
    r'/Users/[a-z]+',                  # a Mac home directory
    r'/home/(?!runner)[a-z]+/',        # a Linux home directory
    r'[a-z0-9._%+-]+@gmail\.com',
]
NAMES_FILE = pathlib.Path.home() / '.config' / 'bkeys-identifiers.txt'
names = []
if NAMES_FILE.exists():
    names = [l.strip() for l in NAMES_FILE.read_text().splitlines()
             if l.strip() and not l.startswith('#')]
IDENTIFIERS = re.compile('|'.join(STRUCTURAL + [r'\b' + n + r'\b' for n in names]), re.I)

ALLOWED = re.compile(r'keys@bitcoinkeys\.guide|Bitcoineconomyai@gmail\.com', re.I)

fails = []

# ── 1. the built output — what the public can actually read ──────────────────
for f in sorted(DIST.rglob('*')):
    if not f.is_file() or f.suffix not in ('.html', '.js', '.css', '.xml', '.txt', '.json'):
        continue
    try:
        text = f.read_text(errors='replace')
    except Exception:
        continue
    for m in IDENTIFIERS.finditer(text):
        if ALLOWED.match(m.group(0)):
            continue
        ctx = re.sub(r'\s+', ' ', text[max(0, m.start() - 90):m.end() + 60])
        fails.append(f'IDENTIFIER IN BUILT OUTPUT  {f}\n    …{ctx}…')

# ── 2. the mechanisms, so the next one is caught before it ships ─────────────
for f in sorted(SRC.rglob('*.astro')):
    s = f.read_text()
    body = s.split('---', 2)[-1] if s.startswith('---') else s
    for m in re.finditer(r'<!--.*?-->', body, re.S):
        if IDENTIFIERS.search(m.group(0)):
            fails.append(f'IDENTIFIER IN AN HTML COMMENT (these SHIP)  {f}\n    {m.group(0)[:120]}')
    # a {/* */} that sits inside a template literal renders as visible text
    for m in re.finditer(r'\{/\*.*?\*/\}', s, re.S):
        if s[:m.start()].count('`') % 2 == 1:
            fails.append(
                f'JSX COMMENT INSIDE A TEMPLATE LITERAL — RENDERS AS TEXT  {f}\n'
                f'    {re.sub(chr(10), " ", m.group(0))[:120]}'
            )

if not NAMES_FILE.exists():
    print(f'!! DEGRADED: {NAMES_FILE} is missing, so only structural identifiers were')
    print('   checked. Recreate it (one name per line) before trusting a clean result.')
    sys.exit(2)

if fails:
    print('!! PSEUDONYMITY CHECK FAILED\n')
    for f in fails:
        print('  ' + f + '\n')
    print(f'{len(fails)} finding(s). Move internal notes into the --- frontmatter as // comments.')
    sys.exit(1)

print('clean — no identifying content in dist/, no HTML comment carrying one, '
      'no JSX comment inside a template literal')
