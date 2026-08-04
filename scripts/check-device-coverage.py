#!/usr/bin/env python3
"""A rated device must appear on any page that enumerates rated devices.

WHY THIS IS A SCRIPT AND NOT A SENTENCE. It was recorded as a proposal with no
enforcement point, verified satisfied, and left as prose — and it had already
been FALSE for two days in August: Bitkey sat in a third state ('n/a') that fell
out of both derived lists, so /learn/generate-your-seed enumerated eleven of the
twelve devices we rate and named the twelfth nowhere. Nothing was broken, every
list was internally consistent, and no check could see it. The data files now
assert their own side of that (wallets.js requires a dice.js entry for every
device; dice.js requires every rated device to land in exactly one of its three
published lists) — but a complete LIST is not a rendered PAGE. A template that
slices, a filter that drops a tier, or a section that quietly renders only the
cold tier would pass every data assert and ship the same omission.

So this reads the BUILT output. It is the only layer that can.

TWO HALVES, and the second is the one that survives a redesign:

  1. DECLARED pages must name every rated device.
  2. Any UNDECLARED page naming at least half of them must be declared or
     exempted. A new page that enumerates devices is exactly how this invariant
     gets quietly re-broken, and a fixed list of three pages would never see it.

MATCHING IS LONGEST-FIRST AND CONSUMING, deliberately. "Jade" is a substring of
"Jade Plus" and "Jade Core", so a page naming only the Plus would otherwise be
credited with the plain Jade as well — a false pass on the exact family where
the real omission happened. Each name found is struck from the text before any
shorter name is searched.

Usage: npm run build && python3 scripts/check-device-coverage.py
"""
import html
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

# Pages that enumerate the rated roster. Each must name every device.
DECLARED = {
    '/wallets': 'the comparison + chooser',
    '/standard': 'the published rating rubric, device by device',
    '/learn/generate-your-seed': 'what your device allows — the three dice states',
}

# Pages that name many devices and must NOT be held to the whole roster. A
# reason is required, and "it does not list them all" is not one — the question
# each answer has to settle is whether a device could go MISSING here without
# anybody noticing.
EXEMPT = {
    '/changelog':
        'a dated period record — an entry names what it named on the day, and '
        'annotating beats revising',
    '/roll-your-own-seed':
        'names devices PER OPTION, not the roster: a device with no dice path is '
        'correctly absent. Safe because each list is ratedDevicesForMethod() and '
        "dice.js asserts every rated device lands in exactly one of its three "
        'states, so one cannot fall out of all of them the way Bitkey did',
}

# A page naming this share of the roster is enumerating it, whatever it calls
# itself. Half is deliberately generous: the failure being caught is a roster of
# twelve rendering eleven, not a lesson mentioning two devices in passing.
ENUMERATING_SHARE = 0.5


def roster():
    """name + the short form pages actually print, from wallets.js itself."""
    out = subprocess.run(
        ['node', '-e',
         "import('./src/data/wallets.js').then(m=>console.log(JSON.stringify("
         "m.deviceCatalog.map(d=>({slug:d.slug,name:d.name,short:m.shortName(d.name)})))))"],
        cwd=ROOT, capture_output=True, text=True)
    if out.returncode:
        sys.exit(f'!! could not read the device roster from wallets.js\n{out.stderr.strip()}')
    return json.loads(out.stdout)


def page_text(f):
    """The page's own body, tags stripped. Nav and footer are every page's."""
    s = f.read_text()
    m = re.search(r'<main\b.*?>(.*)</main>', s, re.S)
    body = m.group(1) if m else s
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', body)).split())


def named(text, devices):
    """Which devices this text names. Longest form first, consuming as it goes."""
    forms = []
    for d in devices:
        for f in {d['name'], d['short']}:
            forms.append((f, d['slug']))
    forms.sort(key=lambda p: -len(p[0]))
    found = set()
    for form, slug in forms:
        pat = re.compile(r'(?<![\w-])' + re.escape(form) + r'(?![\w-])')
        if pat.search(text):
            found.add(slug)
            text = pat.sub('   ', text)
    return found


def main():
    if not DIST.exists():
        sys.exit('!! no dist/ — run npm run build first')
    devices = roster()
    by_slug = {d['slug']: d['name'] for d in devices}
    total = len(devices)
    threshold = max(2, round(total * ENUMERATING_SHARE))

    failures = []
    checked = []
    for f in DIST.rglob('index.html'):
        rel = f.parent.relative_to(DIST).as_posix()
        url = '/' + rel if rel != '.' else '/'
        found = named(page_text(f), devices)
        if url in EXEMPT:
            continue
        if url in DECLARED:
            missing = [by_slug[s] for s in by_slug if s not in found]
            checked.append((url, len(found), missing))
            if missing:
                failures.append(
                    f'{url} enumerates rated devices ({DECLARED[url]}) but names '
                    f'{len(found)} of {total} — missing: {", ".join(missing)}')
        elif len(found) >= threshold:
            failures.append(
                f'{url} names {len(found)} of {total} rated devices, so it enumerates '
                f'the roster, but it is neither declared nor exempt in this script. '
                f'Declare it (and make it complete) or exempt it with a reason.')

    for url, n, missing in sorted(checked):
        print(f'   {url}: {n}/{total}' + ('' if not missing else f'  MISSING {missing}'))
    for url, why in sorted(EXEMPT.items()):
        print(f'   {url}: exempt — {why}')

    if failures:
        print()
        for x in failures:
            print(f'!! {x}')
        sys.exit(1)
    print(f'clean — every rated device appears on all {len(DECLARED)} pages that enumerate them, '
          f'and no undeclared page enumerates them')


if __name__ == '__main__':
    main()
