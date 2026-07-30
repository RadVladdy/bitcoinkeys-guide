# No page may cite a rule by a TYPED number — only <RuleRef key="…"> (or a value
# derived from rules.js). Comments are stripped first, because the check is about
# shipped copy, not about notes to the next reader.
import re, pathlib
BAD = re.compile(r'rules#rule-\d|(?:rule|principle)s?\s+(?:number\s+)?'
                 r'(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b', re.I)
SKIP = {'RuleRef.astro', 'RuleBand.astro', 'rules.astro'}
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
print('\n'.join(hits) if hits else 'clean — no typed rule or principle citation in shipped copy')
