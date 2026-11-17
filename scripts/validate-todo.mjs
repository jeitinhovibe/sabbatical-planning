#!/usr/bin/env node

// The bookings ledger has to answer the two questions you actually ask of it:
// where the bed is and what it costs a night, and which station or airport a
// leg leaves from and what it costs. Prose drifts; fields do not. This checks
// that every stay carries area/perNight/checkin/checkout and every flight,
// ferry and bus carries from/to/price/date, and that the dates sit inside the
// chapter they belong to.

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function loadWindow(...files) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
  return ctx.window;
}

const win = loadWindow('itinerary-data.js', 'todo-data.js');
const trip = win.TRIP;
const items = win.TODO_ITEMS || [];
const chapters = new Map((trip?.chapters || []).map((c) => [c.id, c]));

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const day = (s) => new Date(`${s}T00:00:00Z`);
const nights = (a, b) => Math.round((day(b) - day(a)) / 86400000);

const errors = [];
const warnings = [];
const ids = new Set();
const seen = (id) => {
  if (ids.has(id)) errors.push(`${id}: duplicate id`);
  ids.add(id);
};

const CATS = new Set(['transport', 'stay', 'car', 'attraction', 'visa', 'admin']);
let stays = 0;
let legs = 0;

for (const t of items) {
  const where = `${t.id}`;
  seen(t.id);
  if (!CATS.has(t.cat)) errors.push(`${where}: unknown cat '${t.cat}'`);
  const ch = chapters.get(t.ch);
  if (t.ch !== 'prep' && !ch) errors.push(`${where}: chapter '${t.ch}' does not exist`);
  if (!ISO.test(t.due || '')) errors.push(`${where}: due is not a YYYY-MM-DD date`);

  if (t.cat === 'stay') {
    stays++;
    if (!t.area) errors.push(`${where}: stay has no area`);
    if (typeof t.perNight !== 'number' || t.perNight < 0) errors.push(`${where}: stay has no perNight`);
    // The sub-header prints area · price · dates, so the title and the note must
    // not print the dates again — that is the duplication this shape exists to
    // kill. Dates inside a sentence ("booked for the 1am Sep 25 arrival") stay.
    const MONTH = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
    if (new RegExp(`^${MONTH}\\s\\d`).test(t.note || '')) {
      errors.push(`${where}: note opens with the dates the sub-header already shows`);
    }
    if (new RegExp(`${MONTH}\\s\\d{1,2}`).test(t.title || '')) {
      errors.push(`${where}: title carries a date the sub-header already shows`);
    }
    if (!ISO.test(t.checkin || '') || !ISO.test(t.checkout || '')) {
      errors.push(`${where}: stay needs checkin/checkout dates`);
    } else {
      const n = nights(t.checkin, t.checkout);
      if (n < 1) errors.push(`${where}: checkout is not after checkin`);
      if (ch) {
        if (t.checkin < ch.start) errors.push(`${where}: checkin ${t.checkin} is before chapter start ${ch.start}`);
        if (t.checkout > ch.end) errors.push(`${where}: checkout ${t.checkout} is after chapter end ${ch.end}`);
      }
    }
  }

  if (t.cat === 'transport') {
    legs++;
    if (!t.from) errors.push(`${where}: leg has no departure station/airport`);
    if (!t.to) errors.push(`${where}: leg has no arrival station/airport`);
    if (typeof t.price !== 'number' || t.price < 0) errors.push(`${where}: leg has no price`);
    if (!ISO.test(t.date || '')) {
      errors.push(`${where}: leg has no travel date`);
    } else if (ch && (t.date < ch.start || t.date > ch.end)) {
      errors.push(`${where}: travel date ${t.date} is outside chapter ${ch.id} (${ch.start}–${ch.end})`);
    }
  }
}

// Every night of the trip is either a stay row or covered by something named
// in a note (the ABC trek and the Raja Ampat boat are sold as packages).
for (const c of trip.chapters) {
  const sum = items
    .filter((t) => t.ch === c.id && t.cat === 'stay' && ISO.test(t.checkin || ''))
    .reduce((n, t) => n + nights(t.checkin, t.checkout), 0);
  if (sum > c.days) errors.push(`${c.id}: stays total ${sum} nights but the chapter is ${c.days}`);
}

console.log(`Checked ${stays} stays and ${legs} legs across ${items.length} items.`);
for (const w of warnings) console.log(`  warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.log(`  fail  ${e}`);
  console.log(`\n${errors.length} booking-ledger problem(s).`);
  process.exit(1);
}
console.log('Booking ledger OK — every stay names its area, price and dates; every leg names its ends, price and date.');
