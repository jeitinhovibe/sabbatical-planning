#!/usr/bin/env python3
"""Regenerate the reel thumbnails.

The chapter reel shows one photo per chapter in a ~240px slot, but it used to
point <img> at the full-size 1600px file: 4.0MB of imagery for 21 postage
stamps. This writes 480px WebP copies (enough for 2x on a 240px slot) to
extra-pictures/thumbs/, mirroring the source tree.

Run from the repo root:  python3 scripts/make-reel-thumbs.py
Needs Pillow (pip install pillow). The output is committed, so the site never
depends on this script — it is here so the thumbs can be rebuilt.
"""
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTH = 480
QUALITY = 78


def reel_photos():
    """The header photo of every chapter, resolved through PHOTO_IDS."""
    js = r"""
    const fs = require('fs');
    global.window = {};
    for (const f of ['itinerary-photos.js', 'itinerary-data.js', 'itinerary-geo.js']) {
      eval(fs.readFileSync(f, 'utf8'));
    }
    const ids = global.window.PHOTO_IDS;
    const out = [];
    for (const c of global.window.TRIP.chapters) {
      const k = (c.photos || [])[0];
      if (k && ids[k]) out.push(ids[k]);
    }
    console.log(out.join('\n'));
    """
    res = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True, check=True)
    return [p for p in res.stdout.splitlines() if p.strip()]


def main():
    total_in = total_out = 0
    for rel in reel_photos():
        src = os.path.join(ROOT, rel)
        if not os.path.exists(src):
            print(f'  missing  {rel}')
            continue
        out_rel = os.path.join('extra-pictures', 'thumbs', os.path.splitext(rel)[1] and rel.split('extra-pictures/', 1)[1])
        out_rel = os.path.splitext(out_rel)[0] + '.webp'
        out = os.path.join(ROOT, out_rel)
        os.makedirs(os.path.dirname(out), exist_ok=True)

        im = Image.open(src).convert('RGB')
        if im.width > WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        im.save(out, 'WEBP', quality=QUALITY, method=6)

        a, b = os.path.getsize(src), os.path.getsize(out)
        total_in += a
        total_out += b
        print(f'  {rel}  {a // 1024}K -> {b // 1024}K')

    print(f'\n  {total_in / 1048576:.1f}MB -> {total_out / 1048576:.1f}MB')


if __name__ == '__main__':
    sys.exit(main())
