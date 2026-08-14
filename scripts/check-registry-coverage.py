#!/usr/bin/env python3
"""Pre-push gate: every external URL a reader can click is watched by the freshness
registry, or declared exempt here with a reason.

WHY THIS EXISTS, AND IT IS THE STRUCTURAL HALF OF A FINDING RATHER THAN THE FINDING.
On 2026-08-14 a deficiency audit diffed every outbound link in `dist/` against the
freshness registry by hand and found EIGHT reader-visible external sources with no
watcher at all. All eight returned 200 that day, so nothing was broken — the defect
was coverage. The strongest of them says why it matters more than the count: the
BitBox Diceware *LookupTable* PDF was unwatched while its sibling *HowTo* PDF, in
the same directory and on the same page, had been watched since 2026-08-06. Nobody
decided that. The pair simply arrived one at a time.

That is the shape this file exists for. Adding eight rows fixes eight links; the
class regrows the next time a page gains a citation, and the only thing standing
between it and another silent gap is somebody happening to run the same diff again.

WHAT IT CHECKS. Every `href="http…"` in the built site, minus our own family of
sites, must appear in the registry as an entry URL — matched on host and path, so
`www.` and a trailing slash and a `#fragment` are all the same link. It asks
NOTHING about whether the page behind the URL still says what we claim it says:
that is a `judge` entry, it costs money on every run, and deciding one is a
judgement no script can make. This asks only *is anything watching this at all*.

WHY A `link` ROW IS THE RIGHT ANSWER TO ALMOST EVERY HIT. `check_link` in the
freshness engine is a pure HTTP HEAD/GET with a verdict map; only `judge` rows
reach the batched model call, which is why whole bitcoinkeys runs log `$0.0000`.
The 2026-08-06 watcher-scope test — *could this change without our noticing?*, with
a never-firing entry rejected as noise that reads as coverage — was written about
judges, where the entry costs money and manufactures the appearance of thoroughness.
A free HTTP tripwire that fires only on rot is a different trade. So the bar for
adding to EXEMPT below is high: the honest default is a row.

⚠️ THE EXEMPTION LIST IS PRINTED ON EVERY RUN, AND THAT IS NOT TIDINESS. The
hand-run diff that found the eight reported SIX. Two — the CC BY 4.0 licence deed
in the footer of 62 pages, and the site's own GitHub repo link — were dropped by
the exclusion list the diff was written with: the same list the spine recipe's
external-host census uses, where `creativecommons.org` carries the annotation "the
licence line" and is therefore *expected*. Expected on a census means *not a
surprise*. It was read as *not a source*. An invisible filter is indistinguishable
from a clean sweep — this project's own item-27 lesson, arriving inside the pass
that was closing a coverage gap. Both are watched now, and every exemption this
check applies prints itself rather than being trusted to a reader of the source.

BOX-LOCAL BY NECESSITY, AND IT SAYS SO RATHER THAN PASSING QUIETLY. The registry
lives in `~/dev/bkeys-freshness` and the manifest in `~/dev/freshness`; both are
local-only and this repo is public. On a machine without them the check SKIPS and
prints why. A skip is not a pass, and the wording says so — same convention as
check-freshness-stamps.py, for the same reason.

DECLARED LIMITS, so a clean run is not read as more than it is:
  · It reads `href` only. A URL printed as plain text is not a link a reader clicks,
    and no page here does that; if one ever does, this check is blind to it.
  · It reads `dist/`, so it is only as current as the last build. The hook's other
    checks share that dependency — build first.
  · A BARE-DOMAIN link counts as covered when any deeper path on the same host is
    watched (a subpage check answers "is this site alive"). Printed as
    host-covered, never silently absorbed. It does NOT work the other way round:
    a specific document is never covered by a watcher on some other document from
    the same host — which is exactly the BitBox pair, and treating hosts as
    interchangeable would have hidden the strongest of the eight.
"""
import json
import os
import pathlib
import re
import sys
from collections import defaultdict
from urllib.parse import urlparse

REPO = pathlib.Path(__file__).resolve().parent.parent
DIST = REPO / "dist"
MANIFEST = pathlib.Path(os.path.expanduser("~/dev/freshness/registries.json"))

HREF = re.compile(r'href="(https?://[^"]+)"', re.I)

# Our own sites. Their liveness is a deploy fact we control, not a source that can
# move under us — and the sister-project footer means every page links the other two.
OWN_HOSTS = {
    "bitcoinkeys.guide",
    "timechain.wiki",
    "bitcoineconomy.ai",
    "radvladdy.com",
}

# url (normalized, no scheme) -> the reason it is deliberately unwatched.
# EMPTY ON PURPOSE as of 2026-08-14: every external link a reader can click has a
# row. Adding here is a decision that owes a sentence saying what makes a free
# HTTP tripwire the wrong answer for that URL. "It is ours" is not that sentence —
# that reasoning is what left the repo link and the licence deed uncovered.
EXEMPT: dict[tuple[str, str], str] = {}


def norm(url: str) -> tuple[str, str]:
    """(host without www, path without trailing slash). Fragment and query dropped —
    `#dice-rolls-only` on a watched page is the watched page."""
    p = urlparse(url)
    return (p.netloc or "").lower().removeprefix("www."), p.path.rstrip("/")


def load_registry_path():
    if not MANIFEST.exists():
        return None
    for dom in json.loads(MANIFEST.read_text())["domains"]:
        if dom["id"] == "bitcoinkeys":
            return pathlib.Path(os.path.expanduser(dom["registry"]))
    raise KeyError("no 'bitcoinkeys' domain in registries.json")


def main() -> int:
    if not DIST.is_dir():
        print("check-registry-coverage: no dist/ — run `npm run build` first", file=sys.stderr)
        return 1
    pages = sorted(DIST.rglob("*.html"))
    if not pages:
        # A run that inspects nothing must not report clean.
        print("check-registry-coverage: dist/ holds no HTML — refusing to pass", file=sys.stderr)
        return 1

    registry_path = load_registry_path()
    if registry_path is None or not registry_path.exists():
        where = registry_path or MANIFEST
        print(f"SKIPPED (not a failure, and not a pass): {where} is absent — the freshness "
              f"registry is box-local and this repo is public. Nothing was verified.")
        return 0

    reg = json.loads(registry_path.read_text())
    items = reg["items"] if isinstance(reg, dict) and "items" in reg else reg
    watched = {norm(i["url"]): i["id"] for i in items if i.get("url")}
    watched_hosts = {h for h, _ in watched}

    external = defaultdict(set)
    own_seen = set()
    for page in pages:
        where = page.parent.relative_to(DIST).as_posix() or "/"
        for url in HREF.findall(page.read_text(errors="replace")):
            host, _ = norm(url)
            if host in OWN_HOSTS or any(host.endswith("." + o) for o in OWN_HOSTS):
                own_seen.add(host)
                continue
            external[url.split("#")[0]].add(where)

    if not external:
        # Every substantive page on this site cites something. Zero external links
        # means the scan found nothing, not that the site links nowhere — the
        # measurer's 2026-08-12 guard, in the check that would otherwise report the
        # emptiest possible sweep as the cleanest one.
        print("check-registry-coverage: found ZERO external links across "
              f"{len(pages)} page(s) — refusing to pass. This site cites sources; a "
              "run that sees none is measuring nothing.", file=sys.stderr)
        return 1

    covered, host_covered, exempted, missing = [], [], [], []
    for url in sorted(external):
        key = norm(url)
        if key in watched:
            covered.append((url, watched[key]))
        elif key in EXEMPT:
            exempted.append((url, EXEMPT[key]))
        elif key[1] == "" and key[0] in watched_hosts:
            host_covered.append(url)
        else:
            missing.append((url, sorted(external[url])))

    print(f"   {len(external)} distinct external URL(s) across {len(pages)} built page(s); "
          f"{len(covered)} watched by the registry")
    print(f"   own-family hosts skipped (not sources we can lose): "
          f"{', '.join(sorted(own_seen)) or 'none present'}")
    for url in host_covered:
        print(f"   host-covered: {url} — bare domain, and a deeper path on that host is watched")
    for url, reason in exempted:
        print(f"   EXEMPT: {url} — {reason}")
    if not EXEMPT:
        print("   0 declared exemptions — every external link a reader can click has a registry row")

    if missing:
        print(f"\ncheck-registry-coverage: {len(missing)} external URL(s) shown to readers with "
              f"NO freshness watcher\n")
        for url, where in missing:
            print(f"  {url}")
            print(f"     on: {', '.join(where[:6])}{' …' if len(where) > 6 else ''}")
        print("\nAdd a `link` row to ~/dev/bkeys-freshness/registry.json for each — it is a pure "
              "HTTP check and costs nothing, so that is the default. Exempting instead is a "
              "decision: put it in EXEMPT above WITH the reason a free tripwire is wrong here.")
        return 1

    print("check-registry-coverage: clean — every external link a reader can click is watched "
          "or declared")
    return 0


if __name__ == "__main__":
    sys.exit(main())
