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
