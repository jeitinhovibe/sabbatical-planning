#!/usr/bin/env node

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PHOTOS_PATH = path.join(ROOT, 'itinerary-photos.js');
const DATA_PATH = path.join(ROOT, 'itinerary-data.js');

function loadWindowObject(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return ctx.window;
}

function uniqueChapterPhotoKeywords(trip) {
  return [...new Set((trip?.chapters || []).flatMap((ch) => ch.photos || []))];
}

async function checkUrl(url, attempts = 3) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: { 'User-Agent': 'sabbatical-photo-validator/1.0' },
      });

      if (res.status === 405 || res.status === 403) {
        const retry = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: { Range: 'bytes=0-0', 'User-Agent': 'sabbatical-photo-validator/1.0' },
        });
        if (retry.ok) return { ok: true, status: retry.status };
        if (retry.status === 429 && i < attempts) {
          await sleep(700 * i);
          continue;
        }
        return { ok: false, status: retry.status };
      }

      if (res.ok) return { ok: true, status: res.status };
      if (res.status === 429 && i < attempts) {
        await sleep(700 * i);
        continue;
      }
      return { ok: false, status: res.status };
    } catch (err) {
      if (i < attempts) {
        await sleep(700 * i);
        continue;
      }
      return { ok: false, status: 'ERR', error: String(err?.message || err) };
    }
  }
  return { ok: false, status: 'ERR', error: 'Unknown error' };
}

async function main() {
  const trip = loadWindowObject(DATA_PATH).TRIP;
  const photoIds = loadWindowObject(PHOTOS_PATH).PHOTO_IDS || {};

  const keywords = uniqueChapterPhotoKeywords(trip);
  const missing = keywords.filter((k) => !(k in photoIds));

  // Local photos answer narrow viewports with a 480px WebP twin
  // (scripts/make-reel-thumbs.py). A source without its twin 404s in the
  // chapter reel, so a new photo must ship both files.
  const thumbOf = (p) => path.join(ROOT, p.replace(/^extra-pictures\//, 'extra-pictures/thumbs/').replace(/\.[^.]+$/, '.webp'));
  const missingThumbs = Object.values(photoIds)
    .filter((value) => String(value).startsWith('extra-pictures/'))
    .filter((value) => fs.existsSync(path.join(ROOT, value)) && !fs.existsSync(thumbOf(value)));

  const directUrls = Object.entries(photoIds).filter(([, value]) => String(value).startsWith('http'));
  const broken = [];
  const rateLimited = [];

  for (const [keyword, url] of directUrls) {
    const result = await checkUrl(url);
    if (result.ok) continue;
    // 429 = rate-limited by the host (e.g. Wikimedia throttling this network),
    // not proof the photo is gone. Warn instead of failing so content commits
    // aren't blocked by transient throttling. Photos stay included by reference.
    if (result.status === 429) {
      rateLimited.push({ keyword, url, ...result });
      continue;
    }
    broken.push({ keyword, url, ...result });
  }

  console.log(`Checked keywords: ${keywords.length}`);
  console.log(`Direct URLs: ${directUrls.length}`);
  console.log(`Missing keyword mappings: ${missing.length}`);
  console.log(`Missing 480px thumbnails: ${missingThumbs.length}`);
  console.log(`Broken URLs: ${broken.length}`);
  console.log(`Rate-limited (skipped): ${rateLimited.length}`);

  if (missing.length) {
    console.log('\nMissing mappings:');
    for (const key of missing) console.log(`- ${key}`);
  }

  if (missingThumbs.length) {
    console.log('\nMissing thumbnails (run: python3 scripts/make-reel-thumbs.py):');
    for (const file of missingThumbs) console.log(`- ${file}`);
  }

  if (broken.length) {
    console.log('\nBroken URLs:');
    for (const item of broken) {
      const suffix = item.error ? ` (${item.error})` : '';
      console.log(`- ${item.keyword}: [${item.status}] ${item.url}${suffix}`);
    }
  }

  if (rateLimited.length) {
    console.log('\nRate-limited (not verified, keeping URLs):');
    for (const item of rateLimited) {
      console.log(`- ${item.keyword}: [${item.status}] ${item.url}`);
    }
  }

  if (missing.length || broken.length || missingThumbs.length) process.exit(1);
  if (rateLimited.length) console.log('\nPhoto validation passed with rate-limit warnings.');
  else console.log('\nPhoto validation passed.');
}

main().catch((err) => {
  console.error('Photo validation failed with unexpected error:', err);
  process.exit(1);
});

