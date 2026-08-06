# No page may cite a rule by a TYPED number — only <RuleRef key="…"> (or a value
# derived from rules.js). Comments are stripped first, because the check is about
# shipped copy, not about notes to the next reader.
#
# IT EXITS NONZERO. It did not until 2026-08-06: it printed its hits and returned 0,
# so .githooks/pre-push — which judges every check by its exit code — ended "all checks
# clean" while this one was listing live hits above it. It was the only check of the
# seven with no exit call, and the spine's own note says to negative-control it by
# confirming the script FAILS. It could not.
#
# THE CHANGELOG IS EXEMPT, and the exemption is DECLARED rather than left to a pattern
# that happens not to match. /changelog is a dated period record: an entry names what it
# named on the day, and this project's rule for that surface is that annotating beats
# revising (the same reason check-device-coverage.py exempts it). A rule number typed in
# a live lesson is a fact that can go stale; a rule number typed in a dated entry is what
# was said at that date. Nothing else is exempt.
import re, pathlib, sys
BAD = re.compile(r'rules#rule-\d|(?:rule|principle)s?\s+(?:number\s+)?'
                 r'(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b', re.I)
SKIP = {'RuleRef.astro', 'RuleBand.astro', 'rules.astro', 'changelog.js'}
hits = []
for f in sorted(pathlib.Path('src').rglob('*')):
    if f.suffix not in ('.astro', '.js') or f.name in SKIP: continue
    src = f.read_text()
    # strip: /* */ block, {/* */} JSX, <!-- --> HTML, // line
    src = re.sub(r'\{?/\*.*?\*/\}?', '', src, flags=re.S)
    src = re.sub(r'<!--.*?-->', '', src, flags=re.S)
    src = re.sub(r'(?m)^\s*//.*$', '', src)
    for i, line in enumerate(src.splitlines(), 1):
        line = re.sub(r'//.*$', '', line)
        m = BAD.search(line)
        if m: hits.append(f'{f}:{i}: {m.group(0)!r} in {line.strip()[:100]}')
if hits:
    print('\n'.join(hits))
    print(f'!! {len(hits)} typed rule/principle citation(s) in shipped copy — cite by '
          f'<RuleRef key="…"> or a value derived from rules.js, never a number.')
    sys.exit(1)
print('clean — no typed rule or principle citation in shipped copy '
      '(changelog.js exempt: a dated record states what it stated on the day)')
