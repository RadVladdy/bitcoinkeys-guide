#!/usr/bin/env bash
# Build the printable self-custody checklists — ONE PER RUNG — from the BUILT page.
#
#   public/checklist-single-sig.pdf      single-signature
#   public/checklist-passphrase.pdf      single-signature + passphrase
#   public/checklist-multisig.pdf        multi-signature
#   public/checklist-collaborative.pdf   collaborative multi-signature
#
# WHY FOUR AND NOT ONE. The reasoning is in src/data/checklist.js § the printed
# sheets, and it is the same call the dice method sheet already paid for: one
# sheet serving two seed lengths made every reader pick their own half out of a
# sentence while handling key material. A single printed checklist is worse than
# that — it tells a single-sig reader to use a different maker for each of three
# keys, with nothing on the paper to say the line is not for them.
#
# WHY ASSEMBLY AND NOT FOUR TEMPLATES. Every page here is a photograph of ONE
# real page — /checklist, which renders all four sheets print-only. A printed
# artifact built from its own template is a second rendering of the thing, and
# this repo has already paid for that twice (the dice table shipped at two
# different layouts for two days). The sheets and the interactive list on that
# page are the same steps through the same itemApplies(); only the layout of the
# page differs from the layout of the paper.
#
# WHAT IS ASSERTED BEFORE ANYTHING SHIPS, and the second one is the real gate:
#   1. STRUCTURE — exactly four sheet titles are found, each starting a page, in
#      the order ladder.js declares. Titles are matched LONGEST-FIRST, because
#      "Single-signature" is a prefix of "Single-signature + passphrase" and a
#      naive search would file the passphrase sheet under single-sig.
#   2. CONTENTS — every step that belongs on a rung's sheet is present in that
#      document, AND every step that belongs to a DIFFERENT rung is absent from
#      it. That is the check that can refuse to ship a document whose steps
#      belong to another setup, which is exactly what build-dice-pdfs.sh's page
#      assert has already done once for the method sheets.
#   3. GEOMETRY — measured, never looked at, because on these sheets the eye has
#      been wrong in both directions: one TICK BOX PER STEP is actually drawn
#      (they are hairline rectangles rather than fills, so they survive a reader
#      whose printer drops background graphics); nothing sits outside the page
#      margin; no page ENDS on a phase heading, which would put a heading on one
#      sheet of paper and its steps on the next; and a colour census finds no
#      stray tint — the site's cream survived a page-level white override on the
#      dice sheets and left 5,200 warm pixels nobody saw.
#
# The step list is not typed here. It comes out of src/data/checklist.js — the
# same module the page renders from — so a step added to a rung is a step this
# script starts requiring in the same run.
#
# ⚠️ AND THAT IS ALSO WHERE THE RUN STOPS LOOKING, so do not read a clean run as
# more than it is. Every assert compares the DOCUMENT against checklistSheets; it
# says nothing about whether checklistSheets is right. Delete an `only:` from a
# step in checklist.js and that step correctly appears on all four sheets, both
# lists move together, and this script prints CLEAN — verified, not assumed. What
# it catches is a document that has drifted from the data; what it cannot catch is
# data that has drifted from the truth. Whether a step belongs to a rung is a
# reading job, and the place it is decided is checklist.js.
#
# Every other arm has been driven to failure against these sheets rather than
# taken on trust: a missing page break (refused as MISSING steps, which shadows
# the leak arm), a foreign step printed onto a sheet (refused as a LEAK), a
# reworded sheet title, a shrunk tick box, text over the margin, and a stranded
# phase heading.
#
# 🚨 PAGE COUNTS ARE CONSTRAINTS AND THEY MOVE. /checklist and the offer block on
# it print each document's length from pdfPages(), which reads the built file, so
# a print-CSS change carries its own copy. Rerun this after any change to the
# print block and read the counts it prints.
#
# Usage: npm run build && scripts/build-checklist-pdfs.sh && npm run build
#        (the second build is what lets the page counts render — pdfPages() reads
#        the file from public/, which did not exist on the first pass)
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${PORT:-4389}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; [ -n "${SRV:-}" ] && kill "$SRV" 2>/dev/null || true' EXIT

[ -f dist/checklist/index.html ] || { echo "!! dist/checklist/index.html not built — run npm run build first"; exit 1; }

npx astro preview --port "$PORT" >"$TMP/serve.log" 2>&1 &
SRV=$!
curl -fsS -o /dev/null --retry 30 --retry-delay 1 --retry-connrefused --retry-all-errors \
  "http://localhost:$PORT/checklist/" || { echo "!! preview server never came up"; exit 1; }

google-chrome --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$TMP/src.pdf" "http://localhost:$PORT/checklist/" >/dev/null 2>&1
[ -s "$TMP/src.pdf" ] || { echo "!! chrome produced no PDF for /checklist/"; exit 1; }

# The sheets, straight out of the data layer: what each document must contain and
# what it must not. Written to a file rather than passed as arguments — the step
# descriptions are paragraphs.
node -e "
import('./src/data/checklist.js').then((m) => {
  require('fs').writeFileSync('$TMP/sheets.json', JSON.stringify({
    phaseTags: m.PHASES.map((p) => p.tag),
    phaseIntros: m.PHASES.map((p) => p.intro),
    sheets: m.checklistSheets.map((s) => ({
      slug: s.slug,
      file: s.file,
      title: 'Self-custody checklist — ' + s.name,
      present: s.items.map((it) => it.t),
      absent: m.checklistItems.filter((it) => !s.items.includes(it)).map((it) => it.t),
    })),
  }));
});
"

~/.venvs/ots/bin/python - "$TMP" <<'PY'
import json, os, re, sys
import fitz

tmp = sys.argv[1]
src = fitz.open(os.path.join(tmp, 'src.pdf'))
meta = json.load(open(os.path.join(tmp, 'sheets.json')))
sheets = meta['sheets']
# The phase tags and intros come from PHASES rather than being typed, so a
# renamed phase does not silently stop being checked for below.
#
# BOTH, and the intro is the half a first draft missed. A phase heading is
# followed immediately by its intro line, so the shape that actually strands a
# phase is "heading AND intro at the foot, steps overleaf" — and a check reading
# only for the heading scores that page as fine, because the last thing on it is
# the intro. Found by negative-controlling this: the lever that produces the
# heading-only orphan (`break-after: page` on the heading) turns out to change
# nothing in Chrome at all, while the lever that produces the real one leaves the
# intro last. The check that could never fail was the one written first.
PHASE_HEADS = meta['phaseTags'] + meta['phaseIntros']

# Chrome breaks lines wherever the column ends, so a step title arrives with a
# newline in the middle of it. Every comparison below runs on whitespace-collapsed
# text, on both sides. (Nothing here sets `hyphens`, so words themselves stay
# whole — if that ever changes, this normalisation stops being enough.)
def flat(s):
    return re.sub(r'\s+', ' ', s).strip()

pages = [flat(p.get_text()) for p in src]

# A title that is a PREFIX of another title must lose to the longer one, or the
# "Single-signature + passphrase" sheet files itself under "Single-signature".
by_len = sorted(sheets, key=lambda s: -len(s['title']))
starts = {}
for i, text in enumerate(pages):
    for s in by_len:
        if flat(s['title']) in text:
            starts.setdefault(s['slug'], i)
            break

missing = [s['slug'] for s in sheets if s['slug'] not in starts]
if missing:
    raise SystemExit(f"!! no sheet title found on any page for: {', '.join(missing)} "
                     f"({src.page_count} pages rendered) — /checklist is not rendering "
                     "its print block, or a rung name changed on one side only")

order = [starts[s['slug']] for s in sheets]
if order != sorted(order) or order[0] != 0:
    raise SystemExit(f"!! the sheets do not start where they should (page indices {order}); "
                     "expected them in ladder order, the first on page 1 — the print CSS "
                     "page breaks have moved")

# One document per sheet: its own start page up to the next sheet's.
bounds = order + [src.page_count]

for n, s in enumerate(sheets):
    lo, hi = bounds[n], bounds[n + 1]
    doc = fitz.open()
    doc.insert_pdf(src, from_page=lo, to_page=hi - 1)
    text = flat("\n".join(p.get_text() for p in doc))

    absent_titles = {flat(t) for t in s['absent']}
    present_titles = {flat(t) for t in s['present']}
    # A step title that is a substring of another step's title would make the
    # absence check unanswerable. Say so rather than reporting a phantom leak.
    overlap = sorted(a for a in absent_titles if any(a in p for p in present_titles))
    if overlap:
        raise SystemExit(f"!! {s['file']}: step title(s) {overlap[:3]} are substrings of steps that "
                         "DO belong on this sheet, so their absence cannot be checked — "
                         "rename one of them in src/data/checklist.js")

    gone = [t for t in present_titles if t not in text]
    if gone:
        raise SystemExit(f"!! {s['file']} is missing {len(gone)} of {len(present_titles)} steps, "
                         f"e.g. {gone[:3]}")
    leaked = [t for t in absent_titles if t in text]
    if leaked:
        raise SystemExit(f"!! {s['file']} carries {len(leaked)} step(s) that belong to a DIFFERENT "
                         f"setup: {leaked[:3]} — the page breaks have moved and a document is "
                         "holding another rung's instructions")

    # ── Measured, not looked at ──────────────────────────────────────────────
    # The margin is @page's 11mm; 1pt of slack absorbs the renderer's rounding.
    margin = 11 / 25.4 * 72
    boxes = 0
    for pi, page in enumerate(doc):
        blocks = [b for b in page.get_text('blocks') if b[4].strip()]
        if not blocks:
            raise SystemExit(f"!! {s['file']} page {pi+1} has no text on it at all")
        left, right = min(b[0] for b in blocks), max(b[2] for b in blocks)
        top, bottom = min(b[1] for b in blocks), max(b[3] for b in blocks)
        if (left < margin - 1 or right > page.rect.width - margin + 1
                or top < margin - 1 or bottom > page.rect.height - margin + 1):
            raise SystemExit(f"!! {s['file']} page {pi+1}: text runs outside the {margin:.1f}pt "
                             f"margin — x[{left:.1f},{right:.1f}] y[{top:.1f},{bottom:.1f}] on a "
                             f"{page.rect.width:.0f}x{page.rect.height:.0f}pt page")
        # The tick boxes are 10pt hairline rects. Counting them is what proves a
        # reader gets somewhere to tick — a box implemented as a background fill
        # would count zero here and print as nothing on half the world's printers.
        boxes += sum(1 for dr in page.get_drawings()
                     if abs(dr['rect'].width - 10) < 1.5 and abs(dr['rect'].height - 10) < 1.5)
        # A phase heading — or its intro line — is the LAST thing on a page only
        # when that phase's steps have fallen to the next one, which puts the
        # title of a group of steps on one sheet of paper and the steps on
        # another. `break-after: avoid` on both is meant to prevent it; Chrome's
        # support for that property is the weaker half of the fragmentation spec,
        # so this measurement is the part that is actually load-bearing.
        tail = flat(blocks[-1][4])
        if any(tail.startswith(flat(t)) for t in PHASE_HEADS):
            raise SystemExit(f"!! {s['file']} page {pi+1} ends on a phase heading or its intro "
                             f"(\"{tail[:60]}\") — that phase's steps are on the next sheet of paper")
        # A colour census, sampled: these sheets are black on white and any tint
        # is the site's own surface colour surviving the print override.
        pm = page.get_pixmap(dpi=72)
        stray = sum(1 for y in range(0, pm.height, 3) for x in range(0, pm.width, 3)
                    if (lambda p: not (abs(p[0]-p[1]) < 6 and abs(p[1]-p[2]) < 6))(pm.pixel(x, y)))
        if stray:
            raise SystemExit(f"!! {s['file']} page {pi+1}: {stray} sampled pixels are not grey — "
                             "something coloured survived the print stylesheet")

    if boxes != len(present_titles):
        raise SystemExit(f"!! {s['file']} drew {boxes} tick boxes for {len(present_titles)} steps")

    out = 'public' + s['file']
    doc.save(out)
    print(f"   {s['file']}: {doc.page_count} pages, all {len(present_titles)} steps present, "
          f"none of the other {len(absent_titles)}, {boxes} tick boxes, inside the margin, no stray colour")
    doc.close()
PY

for f in public/checklist-*.pdf; do
  echo "   wrote $f ($(du -h "$f" | cut -f1))"
done
