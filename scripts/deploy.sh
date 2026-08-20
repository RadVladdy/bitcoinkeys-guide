#!/usr/bin/env bash
# Deploy dist/ to Cloudflare Pages (direct upload).
# Token: uses $CLOUDFLARE_API_TOKEN if set, else falls back to the local
# secrets file (this box). Run via: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  TOKEN_FILE="$HOME/secure/cloudflare-deploy-token"
  if [ -f "$TOKEN_FILE" ]; then
    CLOUDFLARE_API_TOKEN="$(tr -d '\n\r ' < "$TOKEN_FILE")"
    export CLOUDFLARE_API_TOKEN
  else
    echo "ERROR: set CLOUDFLARE_API_TOKEN or provide $TOKEN_FILE" >&2
    exit 1
  fi
fi

npx wrangler pages deploy dist --project-name=bitcoinkeys-guide --commit-dirty=true

echo "── deployed. Verify on the live domain before calling it done."

# ── Drop the edge cache, then PROVE the edge matches origin ───────────────────
# A green wrangler log plus a stale edge is indistinguishable from a fix that
# does not work. radvladdy.com hit this twice (2026-08-15, 2026-08-20), and both
# times the live pages served the OLD HTML under `cf-cache-status: HIT` while
# the origin was already correct. The lesson was written down the first time and
# changed nothing, because it was recorded as knowledge and never wired as
# behaviour. This is the wiring, and it is the same line in all four repos.
#
# ⚠️ IT RUNS BEFORE INDEXNOW ON PURPOSE. Telling six search engines to come and
# index right now, while the edge still hands out the previous version, is worse
# than not telling them — it banks the stale page.
#
# A failure here must NOT fail the deploy (the site is already live), but it must
# not be silent either. `cf-purge verify` is the half that can go red: it compares
# a cache-busted fetch against an ordinary one, because a plain check can be
# answered by the very cache it is meant to catch.
"$HOME/bin/cf-purge" deploy bitcoinkeys.guide || echo "── ⚠️ CACHE PURGE/VERIFY FAILED — the deploy itself was fine. Do not call it live until: cf-purge deploy bitcoinkeys.guide"

# ── Tell the non-Google engines, immediately ──────────────────────────────────
# IndexNow reaches Bing, Yandex, Naver, Seznam.cz, Yep and DuckDuckGo in one
# call. NOT Google, which declined to adopt it — Google discovers this deploy on
# its own schedule and nothing here changes that.
#
# It lives HERE rather than in the nightly wrapper for the reason this file's own
# header gives about the deploy itself: the automated and manual paths must not
# drift into two implementations. Every route that ships this site runs this line.
#
# ⚠️ A FAILURE HERE MUST NOT FAIL THE DEPLOY — the site is already live and
# rolling that back over a search-engine ping would be absurd. But it must not be
# SILENT either, so it prints loudly and records the result to
# ~/.local/state/indexnow.json, which is what a staleness check reads later.
# Absolute path: cron's PATH does not include ~/bin.
"$HOME/bin/indexnow" submit bitcoinkeys.guide || echo "── ⚠️ IndexNow submission FAILED (the deploy itself was fine; run: indexnow check)"
