#!/bin/bash
# Rebuild the globe's KTX2 earth textures from the vendored WebP masters.
#
#   TOKTX=/path/to/toktx ./scripts/build-earth-ktx2.sh
#
# KTX-Software (https://github.com/KhronosGroup/KTX-Software) provides toktx;
# `brew install ktx-software` is not packaged, so grab the Darwin/Linux release
# from GitHub. Everything else here uses macOS `sips`.
#
# Why the flip: three.js only honours UNPACK_FLIP_Y_WEBGL for uncompressed
# images, and KTX2 data is uploaded as-is. SphereGeometry puts the north pole at
# v=1, which samples the last row of the texture — so the file has to be stored
# upside down relative to the WebP, or the planet spins south-up.
#
# ETC1S, not UASTC: UASTC is ~4 bpp and 10x the download for a photographic
# texture whose quality target is a background globe; ETC1S lands within a few
# percent of the WebP byte size and 4-8 bpp after transcode instead of RGBA8.
# qlevel 160 over the default 128: the default visibly blocks up the ocean
# gradients and softens coastlines at 1:1, and the fix costs ~13% at 4k, ~20% at 16k.
set -euo pipefail
cd "$(dirname "$0")/.."

TOKTX="${TOKTX:-toktx}"
if ! command -v "$TOKTX" >/dev/null 2>&1; then
  echo "toktx not found. Set TOKTX=/path/to/toktx (KTX-Software release)." >&2
  exit 1
fi

SRC=extra-pictures/earth
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# name:width:height — 16k is resized up two pixels because ETC1S blocks are
# 4x4 and WebP's 16383 limit left the master at 16382x8191.
while IFS=: read -r name width height; do
  echo "→ $name"
  sips -s format png "$SRC/$name.webp" --out "$TMP/$name.png" >/dev/null
  sips --flip vertical "$TMP/$name.png" --out "$TMP/$name-flip.png" >/dev/null
  "$TOKTX" --t2 --encode etc1s --qlevel 160 --genmipmap \
    --assign_oetf srgb --resize "${width}x${height}" \
    "$SRC/$name.ktx2" "$TMP/$name-flip.png"
  rm -f "$TMP/$name.png" "$TMP/$name-flip.png"
done <<'EOF'
blue-marble-16k:16384:8192
blue-marble-8k:8192:4096
blue-marble-4k:4096:2048
EOF

ls -lh "$SRC"/*.ktx2
