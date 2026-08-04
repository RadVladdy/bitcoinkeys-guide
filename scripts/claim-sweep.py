#!/usr/bin/env python3
"""Claim sweep — read every surface that talks about one subject, side by side.

WHAT THIS IS, AND WHAT IT IS NOT. This is NOT a pass/fail check and it never can
be: deciding whether two sentences contradict each other is a judgement, which is
the same reason invariant #11 is written as a review step rather than a script.
What it does is remove the hard part of that judgement — FINDING the sentences.

Every genuine editorial bug on this site has been the same shape: two surfaces
saying incompatible things about one subject, where each is internally fine and
only the pair is wrong. They are invisible to a top-to-bottom read because you
have to hold both halves in your head at once, and they are invisible to every
link/count/template check because nothing is broken. The ones found by hand:

  · the rule band's footer restating its own eyebrow
  · /standard calling two Trezors caveat-free while /wallets flagged them twice
  · home, /start and rules.js each nominating a different "one idea"
  · /checklist calling the course "how-tos" one line below its rule chips
  · §3 of the keys lesson calling a public key "safe to share" while §4 (and the
    glossary, and a demo) said the opposite  ← this is the one that prompted the
    script, 2026-07-30

So: name a SUBJECT and the STANCE words that get taken about it, and the script
prints every place on the built site where they meet. Then a human reads the
column. It runs against dist/ — the built output — because three of the five above
were invisible in source (component props, generated data, client-injected copy).

Usage:  python3 scripts/claim-sweep.py            # every topic
        python3 scripts/claim-sweep.py sharing    # one topic
Exit code is always 0. It reports; it does not judge.
"""
import re
import sys
import pathlib

DIST = pathlib.Path('dist')

# Each topic: the SUBJECT the site makes claims about, and the STANCES it takes.
# A hit is a sentence where both appear. Tune these as the site grows — a topic
# earns its place when the site says something load-bearing about it more than once.
TOPICS = {
    'sharing': dict(
        why='What may be published. The distinction that matters is SPEND vs PRIVACY, '
            'and collapsing them into "safe" is what went wrong on 2026-07-30.',
        subject=r'\b(address(?:es)?|public key|xpub|extended public key|descriptor)\b',
        stance=r'\b(safe|freely|harmless|private|never share|don.t (?:share|publish|hand)|'
               r'can.t hurt|reveals?|leaks?|exposes?|permanent)\b',
    ),
    'passphrase-location': dict(
        why='Where a passphrase lives. "In your head" shipped once and contradicted five '
            'other surfaces; it is the single most documented way people lose coins.',
        subject=r'\bpassphrase\b',
        stance=r'\b(in your head|memor(?:y|ise|ize)|remember|never writ|back(?:ed)? up|'
               r'stored?|written down|steel|metal)\b',
    ),
    'passphrase-construction': dict(
        why='How a passphrase is BUILT — a different subject from where it lives, and the '
            'cascade trigger for the 2026-08-03 stance ("roll it, don\'t invent it") names this '
            'topic by name. Three surfaces state it and dice.js computes the figures: rung 2 '
            '`craft`, the passphrase-choose checklist step, /roll-your-own-seed. The drift to '
            'watch for is the OLD advice — "choose one carefully" — surviving somewhere as a '
            'standalone instruction, which is what this stance exists to replace; and any word '
            'count or bit figure appearing as a TYPED number rather than from passphraseTargets.',
        subject=r'\bpassphrase|25th word\b',
        stance=r'\b(roll\w*|dice|generat\w*|invent\w*|choose|chose|pick\w*|memorable|guessab\w*|'
               r'words?|bits?|throws?|flips?|entropy|ASCII|unicode|whitespace|space|capital\w*|'
               r'length|limit|maximum|fingerprint|offline|crack\w*|PBKDF2|iterations?|'
               r'strong|weak|complex\w*)\b',
    ),
    'privacy-promise': dict(
        why='The site\'s most load-bearing promise. It must name every destination and '
            'then make the claim that actually holds — that WE never see it.',
        subject=r'\b(nothing|never|no one|we)\b',
        stance=r'\b(sent|stored|logged|leaves your (?:device|browser)|analytics|trackers?|'
               r'cookies?|we never see)\b',
    ),
    'absolutes': dict(
        why='Unqualified absolutes on a safety guide. Each one should be true without a '
            'reader having to supply the caveat themselves.',
        subject=r'\b(no one|nobody|nothing|never|always|impossible|guarantee\w*|100%|'
                r'completely safe|totally)\b',
        stance=r'\b(can|could|will|is|are|steal|spend|lose|break|reach|access)\b',
    ),
    'device-tiers': dict(
        why='Two renderings of one judgement — the badges on /wallets and the caveats on '
            '/standard. Only the badges are checkable, so the caveat is where they drift.',
        subject=r'\b(Coldcard|Trezor|BitBox|Jade|Passport|Bitkey|Ledger)\b',
        stance=r'\b(caveat|clears? (?:the|our) bar|doesn.t clear|built for (?:cold|spending)|'
               r'we.d trust|would not|wouldn.t|best|recommend)\b',
    ),
    'complexity': dict(
        why='The site\'s stance is that complexity is the top cause of loss. Any page '
            'implying more keys = more secure is arguing against rule 03.',
        subject=r'\b(multisig|multi-signature|passphrase|more keys|complexity|rung)\b',
        stance=r'\b(more secure|safer|better|stronger|upgrade|should climb|advanced)\b',
    ),
    'seed-randomness': dict(
        why='Where a seed\'s randomness comes from. The stance — "where your device allows it, add '
            'your own throws" — is stated on the lesson, the tool page and the checklist step, and the '
            'checklist step REPOINTS ITSELF at runtime, so a change to an option key silently changes '
            'what it links to. Added 2026-08-01: the topic existed on three surfaces before it existed here.',
        subject=r'\b(dice|entropy|randomness|random number|seed (?:is )?generat\w*|your own throws|rolls?)\b',
        stance=r'\b(add|mix\w*|supply|suppl\w+|own|trust|default|recommend\w*|cannot be worse|can.t be worse|'
               r'optional|sovereign|enrich\w*|no route|allows?|does not apply|n/a)\b',
    ),
    'finder-output': dict(
        why='What the finder recommends and why. The engine, /how-we-weigh-risk, the result card, '
            '/my-plan and the checklist intro all describe one decision — and the result card\'s copy '
            'comes from a DIFFERENT engine than the ranking behind it, which is exactly how a card '
            'ended up naming a worry the reader had just rated low.',
        subject=r'\b(setup|recommend\w*|passphrase|multisig|single-sig|collaborative|rung|concern|'
                r'assessment|risk picture)\b',
        stance=r'\b(because your|we (?:did not|didn.t|deliberately)|your answers|scored?|fits you|'
               r'best|simplest|step up|elevated|typical|low|high|holdback|caveat|trade)\b',
    ),
    'retired-vocabulary': dict(
        why='Terms the site has retired. Each one shipped as current copy at some point '
            'and survived at least one pass.',
        subject=r'\b(how-?tos?|principles?|chapters?|rung page|walkthrough|take the quiz)\b',
        stance=r'',   # any occurrence is worth a look
    ),
}

SENTENCE = re.compile(r'[^.!?]*[.!?]')


# Pages whose copy this sweep CANNOT read, filled in as it goes.
#
# THE LIMIT: this reads rendered <main>. A page that BUILDS its copy at runtime —
# the finder's whole result screen, the plan's roadmap — puts none of that in the
# HTML; Astro hoists the script to an external module and the sentences only
# exist once the reader clicks. Nothing in a static read can see them.
#
# That is not a bug to fix by scanning minified JS. It is a limit that has to be
# VISIBLE, because an empty report from a partial reader looks exactly like an
# empty report from a complete one — and this file's whole job is telling a human
# where to look.
#
# It has already cost something: "walkthrough" was retired vocabulary and this
# sweep found one instance, on a lesson. Two more sat in the finder's result
# markup — reader-visible, and structurally unreadable from here. Found by
# grepping src/ by hand on 2026-08-04.
#
# The threshold is the excess over the site-wide baseline bundle (the nav's, on
# every page). Listing all 48 pages would make this noise, and a warning that
# fires everywhere is one nobody reads.
UNREAD = {}
RUNTIME_COPY_BYTES = 4096
_bundles = []


def unread_pages():
    """Pages carrying materially more client JS than the site-wide baseline."""
    if not _bundles:
        return []
    baseline = min(n for _, n in _bundles if n) if any(n for _, n in _bundles) else 0
    return sorted(u for u, n in _bundles if n - baseline > RUNTIME_COPY_BYTES)


def pages():
    for f in sorted(DIST.rglob('index.html')):
        url = f.parent.relative_to(DIST).as_posix()
        url = '/' if url == '.' else '/' + url
        html = f.read_text()
        if '<main' not in html or '</main>' not in html:
            continue
        mods = {m for m in re.findall(r'src="(/_astro/[^"]+\.js)"', html)}
        js = sum((DIST / m.lstrip('/')).stat().st_size
                 for m in mods if (DIST / m.lstrip('/')).exists())
        _bundles.append((url, js))
        body = html[html.index('<main'):html.index('</main>')]
        body = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', body, flags=re.S)
        text = re.sub(r'<[^>]+>', ' ', body)
        text = re.sub(r'&[a-z]+;|&#\d+;', ' ', text)
        yield url, re.sub(r'\s+', ' ', text)


def sweep(name, spec):
    subj = re.compile(spec['subject'], re.I)
    stance = re.compile(spec['stance'], re.I) if spec['stance'] else None
    hits = []
    for url, text in pages():
        # /changelog is a dated period record and is never reconciled — skip it, or
        # every historical entry reports forever.
        if url.startswith('/changelog'):
            continue
        for s in SENTENCE.findall(text):
            s = s.strip()
            if len(s) < 25:
                continue
            if subj.search(s) and (stance is None or stance.search(s)):
                hits.append((url, s))
    print(f'\n{"═" * 78}\n▸ {name.upper()}  ({len(hits)} sentences)\n  {spec["why"]}\n{"═" * 78}')
    last = None
    for url, s in hits:
        if url != last:
            print(f'\n  {url}')
            last = url
        print(f'    · {s[:210]}')
    return len(hits)


if __name__ == '__main__':
    want = sys.argv[1:] or list(TOPICS)
    total = 0
    for name in want:
        if name not in TOPICS:
            print(f'unknown topic {name!r} — have: {", ".join(TOPICS)}')
            continue
        total += sweep(name, TOPICS[name])
    print(f'\n{"─" * 78}\n{total} sentences across {len(want)} topic(s). '
          f'This is a reading list, not a verdict — invariant #11.')
    unread = unread_pages()
    if unread:
        print('\n⚠ NOT SWEPT — these pages BUILD their copy at runtime, in a client '
              'script this cannot read.\n  Grep src/ by hand before calling a topic '
              'done. "Walkthrough" hid here for a fortnight:')
        for url in unread:
            print(f'    {url}')
