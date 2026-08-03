#!/usr/bin/env bash
# Build every dice PDF this site ships, from the BUILT pages.
#
# THREE DOCUMENTS, and they are ASSEMBLED FROM RENDERED SHEETS, never re-laid-out:
#
#   public/bip39-word-table.pdf   the reference table on its own          (4 pp)
#   public/roll-12-word-seed.pdf  12-word method + worksheet + the table  (6 pp)
#   public/roll-24-word-seed.pdf  24-word method + worksheet + the table  (6 pp)
#
# THE METHOD SHEET IS PER LENGTH TOO, not shared. A single sheet saying
# "twenty-three words, or eleven for a 12-word seed" makes every reader pick
# their own half out of a sentence while holding key material, and it meant both
# "per-length" documents shared a page that talked about the other one.
#
# WHY ASSEMBLY AND NOT THREE LAYOUTS. Every page here is a photograph of one of
# two real pages — /dice-word-table for the method sheet and worksheets, and
# /dice-word-table-v2 for the table. Building the per-length documents from
# their own templates would give this guide two renderings of one procedure,
# which is the exact failure the original single-PDF script was written to
# prevent for the table, applied to the instructions instead. A method sheet
# that drifts between two print-outs is worse than one that is merely wrong,
# because only one of the two is.
#
# So: render the two source pages once each, verify them, then select sheets.
# A reader printing the 24-word document and a reader printing the standalone
# table are looking at literally the same rendered page.
#
# The BIP-39 wordlist is frozen by the standard, so this only needs rerunning if
# a page's LAYOUT changes.
#
# Usage: npm run build && scripts/build-dice-pdfs.sh
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${PORT:-4388}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; [ -n "${SRV:-}" ] && kill "$SRV" 2>/dev/null || true' EXIT

for f in dist/dice-word-table/index.html dist/dice-word-table-v2/index.html; do
  [ -f "$f" ] || { echo "!! $f not built — run npm run build first"; exit 1; }
done

npx astro preview --port "$PORT" >"$TMP/serve.log" 2>&1 &
SRV=$!
curl -fsS -o /dev/null --retry 30 --retry-delay 1 --retry-connrefused --retry-all-errors \
  "http://localhost:$PORT/dice-word-table/" || { echo "!! preview server never came up"; exit 1; }

render() {
  google-chrome --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="$2" "http://localhost:$PORT/$1/" >/dev/null 2>&1
  [ -s "$2" ] || { echo "!! chrome produced no PDF for /$1/"; exit 1; }
}
render dice-word-table    "$TMP/src.pdf"
render dice-word-table-v2 "$TMP/table.pdf"

node -e "import('./src/data/dice-table.js').then(m=>{require('fs').writeFileSync('$TMP/words.txt',m.rows.map(r=>r.word).join('\n'))})"

# Assemble and verify. Every word, in every document that contains the table,
# or none of them ship.
~/.venvs/ots/bin/python - "$TMP" <<'PY'
import sys, os, fitz

tmp = sys.argv[1]
src   = fitz.open(os.path.join(tmp, 'src.pdf'))     # m12 · ws12 · m24 · ws24 · table v1 ×4
table = fitz.open(os.path.join(tmp, 'table.pdf'))   # the v2 table, alone
expected = [w.strip() for w in open(os.path.join(tmp, 'words.txt')) if w.strip()]

# The source page's own shape is an assumption, so it is asserted rather than
# trusted: if a worksheet ever spills or the method sheet grows, the sheet
# indices below would silently pick the wrong pages and ship a document whose
# instructions belong to a different length.
if src.page_count != 8:
    raise SystemExit(f"!! /dice-word-table rendered {src.page_count} pages, expected 8 "
                     "(12-word method · 12-word worksheet · 24-word method · "
                     "24-word worksheet · 4 table) — the sheet indices below are "
                     "no longer valid")
def sheet_is(doc, i, needle, what):
    if needle not in doc[i].get_text():
        raise SystemExit(f"!! page {i+1} of the source is not the {what}")
sheet_is(src, 0, 'Rolling a 12-word seed',   '12-word method sheet')
sheet_is(src, 1, 'Worksheet — 12-word seed', '12-word worksheet')
sheet_is(src, 2, 'Rolling a 24-word seed',   '24-word method sheet')
sheet_is(src, 3, 'Worksheet — 24-word seed', '24-word worksheet')

def build(out, sheets, with_table, label):
    doc = fitz.open()
    for i in sheets:
        doc.insert_pdf(src, from_page=i, to_page=i)
    if with_table:
        doc.insert_pdf(table)
    text = "\n".join(p.get_text() for p in doc)
    if with_table:
        missing = [w for w in expected if w not in text]
        if missing:
            raise SystemExit(f"!! {label} is missing {len(missing)} of {len(expected)} words, "
                             f"e.g. {missing[:5]}")
    doc.save(out)
    print(f"   {label}: {doc.page_count} pages"
          + (f", all {len(expected)} words present" if with_table else ""))
    doc.close()

build('public/bip39-word-table.pdf',  [],     True, 'bip39-word-table.pdf')
build('public/roll-12-word-seed.pdf', [0, 1], True, 'roll-12-word-seed.pdf')
build('public/roll-24-word-seed.pdf', [2, 3], True, 'roll-24-word-seed.pdf')
PY

for f in public/bip39-word-table.pdf public/roll-12-word-seed.pdf public/roll-24-word-seed.pdf; do
  echo "   wrote $f ($(du -h "$f" | cut -f1))"
done
