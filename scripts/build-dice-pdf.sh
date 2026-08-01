#!/usr/bin/env bash
# Regenerate public/dice-word-table.pdf from the BUILT /dice-word-table page.
#
# The PDF is a photograph of the HTML page, never a second rendering of the
# data. Two independent renderings of 2,048 rows would drift, and on this
# artifact a single wrong row is a word the reader cannot recover from.
#
# It then VERIFIES the PDF contains every word in the wordlist before replacing
# the shipped file. A silently truncated PDF looks fine at a glance — it is 26
# pages either way — so the check is the whole point of having a script.
#
# The BIP-39 wordlist is frozen by the standard and will never change, so this
# only needs rerunning if the page's LAYOUT changes.
#
# Usage: npm run build && scripts/build-dice-pdf.sh
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${PORT:-4399}"
OUT="public/dice-word-table.pdf"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; [ -n "${SRV:-}" ] && kill "$SRV" 2>/dev/null || true' EXIT

[ -f dist/dice-word-table/index.html ] || { echo "!! dist/dice-word-table not built — run npm run build first"; exit 1; }

npx astro preview --port "$PORT" >"$TMP/serve.log" 2>&1 &
SRV=$!
# curl does the waiting: a bare shell retry loop spins through every attempt
# instantly, because a refused connection fails in under a millisecond.
curl -fsS -o /dev/null --retry 30 --retry-delay 1 --retry-connrefused --retry-all-errors \
  "http://localhost:$PORT/dice-word-table/" || { echo "!! preview server never came up"; exit 1; }

google-chrome --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$TMP/out.pdf" "http://localhost:$PORT/dice-word-table/" >/dev/null 2>&1

[ -s "$TMP/out.pdf" ] || { echo "!! chrome produced no PDF"; exit 1; }

# Every word, or it does not ship.
node -e "import('./src/data/dice-table.js').then(m=>{require('fs').writeFileSync('$TMP/words.txt',m.rows.map(r=>r.word).join('\n'))})"
~/.venvs/ots/bin/python - "$TMP/out.pdf" "$TMP/words.txt" <<'PY'
import sys, fitz
pdf, wordfile = sys.argv[1], sys.argv[2]
doc = fitz.open(pdf)
text = "\n".join(p.get_text() for p in doc)
expected = [w.strip() for w in open(wordfile) if w.strip()]
missing = [w for w in expected if w not in text]
if missing:
    print(f"!! PDF is missing {len(missing)} of {len(expected)} words, e.g. {missing[:5]}")
    raise SystemExit(1)
print(f"   PDF verified: {doc.page_count} pages, all {len(expected)} words present")
PY

mv "$TMP/out.pdf" "$OUT"
echo "   wrote $OUT ($(du -h "$OUT" | cut -f1))"
