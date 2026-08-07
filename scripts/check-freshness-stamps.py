#!/usr/bin/env python3
"""Pre-push gate: no published "Last verified" date may claim more than the registry can back.

WHY THIS EXISTS. On 2026-08-06 `/collaborative` was publishing *"Last verified: August 1,
2026"* while the oldest fact behind it had been verified on **2026-07-19** — a reader-facing
freshness claim running 13 days ahead of the evidence, on the one page that asks someone to
trust a company with a key. Nothing had gone wrong in the runner. The constant was moved by
hand during an editorial pass (`49bcced`) and no machine anywhere compared the two numbers.

AND THE RUNNER STRUCTURALLY CANNOT CATCH IT, which is the argument for a checker rather than
a fix to the engine alone. `freshness.py`'s stamp-sync ends with:

    if floor <= m.group(2):
        continue  # nothing newer to honestly claim

It only ever moves a stamp FORWARD. That guard is right — the runner must never invent a
verification — but it also means an over-claiming date is PERMANENT until a human notices.
The one direction the engine refuses to move is the only direction that is dishonest.

WHAT IT CHECKS.
  · FAIL — a constant NEWER than its group's floor. That is the site claiming a verification
    that did not happen.
  · REPORT — a constant OLDER than its floor. Honest (it under-claims), and the next runner
    pass moves it forward on its own. Not a failure.
  · REPORT — a published stamp with NO stamp-sync rule behind it at all. This arm is what
    named `metalVerified` and `diceVerified` on every push until 2026-08-06, when both were
    given a group and a rule; ALL SIX published stamps now derive from a floor. The arm stays
    because the next stamp somebody adds will arrive hand-typed, and a note nobody re-reads is
    how the first two lasted as long as they did.

⚠️ THE GROUP SELECTOR IS `OR`, NOT `AND`, and this is the one thing to get right when editing
this file. `registries.json` gives each rule `kinds` and `subtypes`, and reading that config
alone suggests an intersection. The engine does not:

    and (f["_json_item"].get("kind") in kinds
         or f["_json_item"].get("subtype") in subs)

Read as AND, `walletsVerified` selects zero items and looks like an unwatched stamp — it is
not, it selects 17. This checker was written after making exactly that mistake, so the rule
is: replicate the ENGINE, never the config's apparent intent, and re-read freshness.py if the
selector semantics ever move.

BOX-LOCAL BY NECESSITY, AND IT SAYS SO RATHER THAN PASSING QUIETLY. The registry lives in
`~/dev/bkeys-freshness` and the manifest in `~/dev/freshness`; both are local-only and this
repo is public. On a machine without them the check SKIPS and prints why. A skip is not a
pass, and the wording says so — the alternative is a green line that means nothing, which is
the failure mode this project keeps paying for.
"""
import json
import os
import pathlib
import re
import sys

MANIFEST = pathlib.Path(os.path.expanduser("~/dev/freshness/registries.json"))
SRC = pathlib.Path(__file__).resolve().parent.parent / "src" / "data"

failures, notes = [], []


def load_domain():
    manifest = json.loads(MANIFEST.read_text())
    for dom in manifest["domains"]:
        if dom["id"] == "bitcoinkeys":
            return dom
    raise KeyError("no 'bitcoinkeys' domain in registries.json")


def published_stamps():
    """Every `…Verified = 'YYYY-MM-DD'` constant shipped from src/data."""
    found = {}
    for f in sorted(SRC.glob("*.js")):
        for m in re.finditer(r"\b(\w+Verified)\s*=\s*'(\d{4}-\d{2}-\d{2})'", f.read_text()):
            found[m.group(1)] = (m.group(2), f.name)
    return found


def main():
    if not MANIFEST.exists():
        print(f"SKIPPED (not a failure, and not a pass): {MANIFEST} is absent — the freshness "
              f"manifest is box-local and this repo is public. Nothing was verified.")
        return 0

    dom = load_domain()
    registry_path = pathlib.Path(os.path.expanduser(dom["registry"]))
    if not registry_path.exists():
        print(f"SKIPPED (not a failure, and not a pass): {registry_path} is absent. Nothing was verified.")
        return 0

    reg = json.loads(registry_path.read_text())
    items = reg["items"] if isinstance(reg, dict) and "items" in reg else reg
    review_dir = pathlib.Path(os.path.expanduser(dom.get("review_dir", "")))
    stamps = published_stamps()
    ruled = set()

    for rule in dom.get("stamp_sync", []):
        var = rule["var"]
        ruled.add(var)
        kinds, subs = set(rule.get("kinds", [])), set(rule.get("subtypes", []))
        # ENGINE SEMANTICS — OR, not AND. See the header before touching this.
        group = [i for i in items
                 if i.get("check", True)
                 and (i.get("kind") in kinds or i.get("subtype") in subs)]
        if var not in stamps:
            failures.append(f"{var}: stamp_sync names it, but no `{var} = '…'` exists in src/data/")
            continue
        pub, where = stamps[var]
        if not group:
            failures.append(f"{var} ({where}): its stamp_sync rule selects ZERO registry items — "
                            f"a stamp that looks watched and is not (kinds={sorted(kinds)}, "
                            f"subtypes={sorted(subs)})")
            continue
        # A CURRENT FLOOR IS NOT THE SAME AS CURRENT CONTENT, and this arm exists
        # because using this checker on 2026-08-06 showed the gap. Re-verifying an
        # item stamps `last_verified` = today whether the answer was "unchanged" or
        # "this moved" — correctly, because we DID look. But an item whose proposal
        # is still pending is one we have looked at and NOT yet acted on, so the
        # floor goes current while the published copy is known-stale. The engine's
        # own stamp-sync holds on pending proposals for exactly this reason; a
        # checker that did not mirror it would bless the window between the two.
        pending = []
        if review_dir.exists():
            for it in group:
                for f in sorted(review_dir.glob(f"*__{it['id']}.md")):
                    if re.search(r"^status:\s*pending", f.read_text(), re.M):
                        pending.append(f.name)
        if pending:
            failures.append(
                f"{var} ({where}): {len(pending)} unapplied change proposal(s) for items in its "
                f"group — the stamp would publish a verification whose finding has not reached "
                f"the site yet ({', '.join(pending[:3])}). Apply or reject them first.")
            continue

        dated = [i for i in group if i.get("last_verified")]
        never = [i["id"] for i in group if not i.get("last_verified")]
        if never:
            notes.append(f"{var}: {len(never)} item(s) in its group have NEVER been verified "
                         f"({', '.join(never[:4])}{'…' if len(never) > 4 else ''}) — the runner "
                         f"holds the stamp until they are")
        if not dated:
            failures.append(f"{var} ({where}): publishes {pub} with no verified item behind it at all")
            continue
        floor = min(i["last_verified"] for i in dated)
        if pub > floor:
            oldest = sorted(dated, key=lambda i: i["last_verified"])[:3]
            failures.append(
                f"{var} ({where}) publishes {pub} but its oldest fact was verified {floor} — "
                f"the site claims a freshness it cannot back. Oldest: "
                + "; ".join(f"{i['id']} @ {i['last_verified']}" for i in oldest)
                + ". Re-verify the group (do NOT hand-type a date); lowering the constant to the "
                  "floor is the honest fallback.")
        elif pub < floor:
            notes.append(f"{var}: publishes {pub}, floor is {floor} — under-claiming, which is "
                         f"honest; the next runner pass moves it forward on its own")
        else:
            notes.append(f"{var}: {pub} — matches its group floor across {len(group)} item(s)")

    # THE REGISTRY'S OWN DESCRIPTION OF WHAT IT WATCHES, checked in the one direction a
    # machine can check it. `meta.site_data` named `quiz.js` and `howtos.js` for two days
    # and five days after each was deleted, and omitted every file that replaced them —
    # so the registry described a site that no longer existed, and the next person to ask
    # "what does this watch" would have been told to read two absent files.
    #
    # ⚠️ ONLY HALF OF THIS IS CHECKABLE, and saying so is the point. A named file that is
    # gone is a fact; a file that BELONGS here and is missing is a judgement about what the
    # entries claim about, and no script can make it. That half stays a review step — add
    # the file name in the same pass as the entry, the same way a new page owes a watcher.
    # EVERY prose row of meta is scanned, not just `site_data` — because `notes` was rotten
    # in exactly the same way and in the same file, and a check aimed at one row would have
    # walked past it. A key ending in `_history` is EXEMPT and holds the record: the first
    # draft of this arm failed the push on its own explanation, since the note recording the
    # fix named the two files it had just removed. Current pointers are checked; history is
    # allowed to name the dead.
    meta = reg.get("meta") or {}
    named, scanned = {}, 0
    for key, val in meta.items():
        if not isinstance(val, str) or key.endswith("_history"):
            continue
        scanned += 1
        for js in re.findall(r"\b[\w.-]+\.js\b", val):
            named.setdefault(js, key)   # first row that names it — the one the failure cites
    missing = sorted(js for js in named if not (SRC / js).exists())
    for js in missing:
        failures.append(f"registry meta.{named[js]} names src/data/{js}, which does not exist — "
                        f"the registry is describing a site that has moved on. (If this is a "
                        f"file name kept as history, move it to a meta key ending in "
                        f"`_history`, which is not scanned.)")
    if named and not missing:
        notes.append(f"meta: {len(named)} distinct src/data file(s) named across {scanned} "
                     f"scanned row(s), all present (the reverse — a file that belongs and is "
                     f"missing — is a review step, not a check)")

    for var, (pub, where) in sorted(stamps.items()):
        if var not in ruled:
            notes.append(f"{var} ({where}): publishes {pub} with NO stamp_sync rule behind it — "
                         f"hand-typed, nothing watches its subject (backlog item 26)")

    for n in notes:
        print(f"   {n}")
    if failures:
        print()
        for f in failures:
            print(f"!! {f}")
        print(f"\n!! {len(failures)} place(s) where the site and the freshness registry "
              f"disagree about what is verified.")
        return 1
    print(f"clean — every stamp with a watcher matches its group floor "
          f"({len(ruled)} watched, {len(stamps) - len(ruled)} hand-typed and reported above)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
