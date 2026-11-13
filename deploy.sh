#!/bin/bash
# Publish the static site to Cloudflare Workers (static assets).
#
#   ./deploy.sh            -> production: https://sabbatical.jeitinhovibe.online
#   ./deploy.sh preview <name> -> https://<name>.sabbatical.jeitinhovibe.online
#   ./deploy.sh stage      -> stage _site/ only (CI does the uploading)
#
# Run ./build.sh first if any .jsx changed; `dist/` is committed, so this never
# rebuilds on its own. Requires a logged-in `wrangler` (npx fetches it).
set -euo pipefail
cd "$(dirname "$0")"

export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-9b30dc9ed19dff935fa4e6a6cb4ae6a7}"
MODE="${1:-production}"

# Stage exactly what the site serves: the same excludes the GitHub Pages job
# used, so build tooling and notes never end up in the upload.
STAGE="_site"
rm -rf "$STAGE"
mkdir -p "$STAGE"
rsync -a \
  --exclude='.git' --exclude='.github' --exclude='node_modules' \
  --exclude='.npm-cache' --exclude='_site' --exclude='reviews' \
  --exclude='.opencode' --exclude='scripts' --exclude='package.json' \
  --exclude='package-lock.json' --exclude='wrangler.jsonc' \
  --exclude='build.sh' --exclude='deploy.sh' --exclude='README.md' \
  --exclude='.gitignore' '--exclude=PR-*' \
  ./ "$STAGE"/

case "$MODE" in
  stage)   exit 0 ;;
  preview) npx --yes wrangler@4 preview --name "${2:-local-preview}" ;;
  *)       npx --yes wrangler@4 deploy ;;
esac
