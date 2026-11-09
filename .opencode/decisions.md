# Decision log

Settled questions, the options that lost, and why. Future sessions must not
re-litigate these without new evidence, and must not silently re-collapse an
open question into one answer.

Format: **Decision** · date · options considered · why.

---

## 2026-11-09 — Macau cut; Shenzhen grows to six nights

Macau removed from China E2. Its two nights go to Shenzhen (4 → 6) and the Dec 6
flight moves from MFM to SZX. Nothing downstream moves: Malaysia still starts
Dec 6, and the mainland stay grows 6 → 9 days, still inside one 30-day visa-free
entry, so there is no visa consequence.

- **Why.** Macau's two nights bought a Shekou ferry, a second airport and a
  chapter that ended in transit. Shenzhen already holds the only booked bed, the
  friends, and a daily direct SZX→KUL (~4h10; AirAsia/CZ/ZH/MH).
- **Cost accepted.** The extra two days are a big-city repeat rather than a new
  place, spent after the friends leave. Pacing is fine (6 nights ≫ the 4-night
  floor); the loss is novelty, not rhythm.
- **Cheaper:** lodging estimate 620 → 440, in-chapter transport 170 → 120 (ferry
  gone), flight estimate $300 → $280. The booked Shenzhen rate ($53.75/n) may not
  extend — the two extra nights are a new todo.
- **Rejected: Guangzhou 3 + Shenzhen 5.** Guangzhou's Cantonese blitz is only
  1.5 usable days, so it is the thinner stop. Kept Shenzhen because the extra
  nights land after the rendezvous, when a familiar base beats a new one.
- **Rejected: Shenzhen 5 + one Zhuhai night.** Zhuhai is Macau-lite without the
  historic centre — the border friction, none of the reason to go.
- **Rejected: leave Dec 5 and add a KL night.** No saving on the flight and it
  eats one of the two new nights for a city already getting four.

---

## 2026-11-05 — Tangkou takes the arrival night; Hongcun moves to last night

Reverses the same-day call that gave Hongcun the arrival night. The block is
still 4 nights, Beijing's 8 and Hangzhou's 4 are untouched — only the order
inside the block changed: **Tangkou 3 (Nov 15–18) · Hongcun 1 (Nov 18–19)**.

- **Why the reversal.** The old arrangement put the village night *inside* the
  mountain window, so Nov 16 was a prep day and the mountain got two candidate
  mornings (17, 18). Now the first full day is a mountain morning: three
  candidates (16, 17, 18), the third only by sacrificing Hongcun. West Sea
  Canyon and Tiandu shut on 1 Dec, so candidate mornings are the scarce good.
- **The arrival leg is also easier.** Huangshan North → Tangkou is a station
  shuttle every 20–30min, ¥30, 45–60min, 06:30–19:00. Hongcun needed a coach you
  must catch. The 12:35-only framing was stale: since Jan 2026 there is a
  customised station→Hongcun shuttle (~¥35, roughly hourly to mid-afternoon).
- **Cost accepted: the base prep day.** The canyon day is now the morning after
  a 5h17 train, with spikes rented on the arrival afternoon. Beijing's 8 slow
  days already cover the recovery argument; the 13:45 arrival leaves 3–4h of light
  for gear, food and an early night.
- **Also corrected:** "Hongcun as the last night → only the 10:44 train works" was
  wrong. Hongcun → Huangshan North is 65–80min, and 40+/day trains run to
  Hangzhou East with the first Hangzhou night unbooked — the departure is loose.
- **Rejected: keep Hongcun first (status quo).** Two mountain mornings, and the
  village night sits between arrival and the climb for no gain.
- **Rejected: swap but keep a prep day (climb Nov 17).** Same arrival, but one
  sure mountain morning and the day-2 decision gets worse, not better.
- **Rejected: all Tangkou, 4 nights.** Three mornings, cheapest — but Hongcun
  then exists only in the 09:30–15:00 coach peak, or not at all.
- **Rejected: Tangkou 2 + Hongcun 2.** Buys a second village dawn at the cost of
  the second mountain day; the canyon is the reason for the block.

Operational consequences: the mountain reservation targets **Nov 16** (due Nov
10), the re-entry decision is made at the exit gate on **Nov 16**, and the
Hongcun guesthouse (due Oct 26) now books Nov 18 — midweek, cheaper and quieter
than the peak-colour Sunday it used to hold. Keep it cancellable: it is the
thing that gets traded for a third mountain morning.

---

## 2026-11-05 — The year spine is a date picker, not a chapter picker

A tick on the 360-day spine is one day, so clicking it resolves to the city the
plan has you in that day and flies the map there. Hovering names the date and
that city.

- **Chosen: date → city.** The spine's resolution is a day; collapsing it to
  "open this chapter" threw away the only information the control has.
- **Chosen: the clicked day is its own marker.** That tick grows and glows in
  its chapter colour, which is the whole affordance — a second playhead beside
  today's read as clutter and was removed the same day. Today keeps the only
  vertical playhead, a 2px bar (a subpixel 1px hairline renders as two lines).
- **Chosen: the click recentres, it does not open the card.** The stop popup
  (`open in Google Maps`) belongs to the map's own pin; a date click only moves
  the camera.
- **Rejected: chapter-level jumps.** Still available through the reel and the
  chapter grid; the spine did not need to duplicate them.

---

## 2026-11-05 — Site redesign: the night atlas

The site now opens as a cinematic cover, then a full-bleed night atlas: the
globe is the canvas, today's chapter is set in giant type over it, the 360-day
year is a clickable spine under the header, and all 21 chapters live in a
photo reel along the bottom edge. Chapters open as editorial spreads, the
budget became a visual ledger, and the to-do list became the field kit.

- **Chosen: night atlas.** It matches what the page actually is — a map of a
  year, not a dashboard. The globe is the one asset that can carry a full-bleed
  layout, and the satellite imagery already lived in a dark palette.
- **Rejected: keep the cream left-rail binder.** Safe and readable, but it made
  the map a panel beside a list; the journey was furniture.
- **Rejected: a bright magazine skin.** Would have lost the globe's atmosphere
  and the sense of moving through a year.
- **Rejected: a KPI dashboard.** More widgets, less story; this is a personal
  project for two independent travellers, not an operations console.
- **Colour is derived, not authored.** Chapter colour is a 21-step ember→violet
  spectrum applied at runtime in `shared.jsx` from chapter order. The plan in
  `itinerary-data.js` is untouched.
- **URLs are additive.** `?view=atlas|chapters|ledger|kit` is the new surface;
  `map`, `budget`, and `todo` remain aliases so old shared links still land.

---

## 2026-11-05 — Hongcun gets the arrival night; one mountain day, not two

Hongcun was a day trip inside the Huangshan block. It should not be: its good
hours are **06:00–08:00 and 17:00–19:00**, and a day visit lands in the
09:30–15:00 coach window. So night 1 (Nov 15) moves into the village and the
mountain nights follow at Zhaixi.

> **Superseded later on 2026-11-05** — the order was flipped to Tangkou 3
> (Nov 15–18) then Hongcun 1 (Nov 18–19). See the entry above. The facts below
> still hold; the ordering does not.

- **Hongcun 1n (Nov 15) · Zhaixi/Tangkou 3n (Nov 16–19).** One 25-min move, no
  day lost. The ¥94–104 ticket is 3-day re-entry, so sleeping there costs
  nothing that the day trip would not have cost.
- **The rule: sleep village-side on arrival, mountain-side before you climb.**
  From Hongcun the 06:20 bus reaches Tangkou ~07:25 — after the cableway opens
  and the canyon clock is running. That single fact kills every "Hongcun as a
  mountain-morning base" variant.
- **Rejected: all Tangkou.** Cheapest, but buys Hongcun only during coach peak.
- **Rejected: 2n Hongcun.** Eats the second mountain day and adds a check-in.
- **Rejected: Hongcun as the last night.** Same dawn, but 65–80 min to the
  station on departure morning and only the 10:44 train works.

**One mountain day is planned; the second is a decision at the gate.** A second
entry **cannot be pre-booked** — it is re-reserved on the mini-programme after
the first check-in, against a daily quota. So day 2 is taken only if Tiandu is
open and the forecast is clear: worth ~60–70% of day 1 with Tiandu, ~30%
without. Otherwise Nov 18 becomes Tachuan colour, Xidi or the hot springs.

Facts that made this decidable, all verified: **Tiandu reopened 7 Apr 2026 and
needs its own quota reservation; Lotus Peak is in five-year rotation rest** —
and West Sea Canyon *and* Tiandu close for winter on **1 Dec**, so Nov 15–19 is
the last full week. Also corrected: **¥308pp is one canyon day** (Yungu ¥80 +
Yuping ¥90 + rail ¥100 + shuttle ¥19×2); the ¥396 figure quoted earlier was two
days *without* the rail. And with no summit bed there is no dawn or dusk at all —
sunrise 06:35 vs gates 07:00, sunset 17:09 vs last cable 17:10.

Hongcun photo vendored from Wikimedia Commons (EditQ, CC BY-SA 4.0) and credited.

---

## 2026-11-05 — China E1 reshaped: 8/4/4, no summit, Suzhou to spring

New fixed edges: the travelers booked **HGH→HKG on Nov 23, 08:00–10:40 ($183)** and
dropped Suzhou; Huangshan gets **no summit hotel**. Beijing's hotel is freely
cancellable, so its nights were the only free variable across the 16 fixed nights.

**Chosen: Beijing 8 (Nov 7–15) · Huangshan block 4 — Hongcun 1 + Tangkou 3
(Nov 15–19) · Hangzhou 4 (Nov 19–23).** Cost-neutral: −1 Beijing night, +1 Tangkou, +2 Hangzhou, −2 Suzhou.

- Beijing lost its 9th night because that night was **Monday Nov 16** — Forbidden
  City and National Museum closed, first day of the municipal heating season, and
  the darkest/coldest night of the chapter (9°/0°, sunset 16:58). It buys the 4th
  Huangshan night, which lands on the mountain's best week: colour, cloud-sea
  season, West Sea Canyon still open, no hard ice.
- Hangzhou gained two nights because the chapter now ends at a **08:00 flight**,
  so the last night cannot move and two nights could hold neither West Lake nor a
  day trip.
- **Rejected: keep Beijing 9.** Huangshan at 3 nights = travel day + one 9-hour
  forced march; P3 breach.
- **Rejected: Beijing 7 / Huangshan 5.** Defensible (weather buffer + 06:30
  weekend cableway), but it strips the Wall's blue-sky spare and a third
  recovery day. The 4-night block already yields two candidate mountain days
  because the ¥190 ticket is **3-day re-enterable** — pick the clearest morning.
- **Rejected: insert Nanjing.** Four 3-nighters, and it re-buys imperial-city
  content Beijing already covers.
- **Rejected: summit dorm night.** The ¥1,000–1,680 doubles were the actual price
  objection, and dorm beds (¥250–300pp) are **sold out for these dates**. So the
  chapter has no summit sunrise: cableway starts 07:00, ~30min after sunrise.
  Accepted cost, recorded in the chapter text so no future session re-adds it.

Operational consequences now in the ledger: **G87 06:56→12:13 is the day's
earliest arrival** (all others 13:46–21:11) — the train to aim for, not the only
one that works: an afternoon service still leaves an evening in Tangkou, and
only the last (21:11) eats the arrival night. The canyon day has a hard 17:10
last cableway and a 16:00 canyon-rail close. Hangzhou→Hangzhou **East**, not
West. HGH at 08:00 means a 04:45 wake; staying airport-side buys nothing.

**Suzhou is not cut, it is re-homed**: a day trip from Shanghai in the spring
chapter (21–30 min from Hongqiao, 240+ pairs/day), since the gardens are a May
repeat of what spring already covers and the old Suzhou→Hongqiao→SHA chain was
two connections for one morning.

Nothing downstream moved: HK Nov 23, E2 Nov 28, chapter lengths and trip total
all unchanged.

---

## 2026-11-04 — Full todo↔itinerary audit after the PR #50 reorder

Todo ledger re-derived from `itinerary-data.js` on the reordered plan. What the
audit found beyond formatting:

- **Korea ground legs were still on pre-reorder dates** in `transports`
  (Jeju→Busan May 31, Busan→Gyeongju Jun 3, Gyeongju→Seoul Jun 5) — before the
  Korea chapter even starts on Jun 2. Corrected to Jun 5 / Jun 8 / Jun 10 to
  match the places and the todo.
- **The HK chapter still said "there is no Taiwan visa errand this time."** That
  line dates from when Taiwan was cut from the plan; Taiwan is back and the TECO
  filing gates the whole chapter. Restored, and the visa item moved from the
  Taiwan group (Dec 29) into the HK group (Nov 24) so it shows up when they are
  actually in Hong Kong.
- **Huangshan summit hotel** carried a Oct 27 due date while its own note said
  "book ~3 days ahead"; it now reads Nov 13 and says explicitly it is the night
  on the mountain, not the Tangkou base.
- **Home flight `korea-10` dropped** at the travelers' request — the trip ends
  in Seoul with no ticketed return yet. Deliberate, not an omission. The **cost
  stays modelled** in `flights` (`Seoul → São Paulo`, $1,400): they still have to
  fly home, so deleting it would understate the budget by $1,400. Only the
  booking reminder went, not the money.
  **Reversed 2026-11-05:** `korea-10` is back in the ledger (due 2027-03-15, ~3
  months out). Removing the reminder while keeping the cost line is exactly how
  `flights` and `todo-data.js` drift apart, and it made the return leg look stale
  to the next audit. One row, and the two files stay legible against each other.

Every stay, leg and visa now tiles its chapter with no gaps: nights sum to the
chapter length in all 21 chapters. Cache versions bumped.

---

## 2026-11-04 — Todo ledger reconciled against `itinerary-data.js`

Three stale labels from earlier merges, corrected in `todo-data.js`:

- **Athens buffer night** read "Oct 20–21"; the Milos ferry lands Sep 20 and the
  Cappadocia flight is Sep 21. Fixed to **Sep 20–21**.
- **Alaçatı** read "Sep 24–26" for a 3-night allocation. The 1am Sep 25 arrival
  plus Şirince on Sep 27 means the room must run **Sep 24–27**; otherwise the
  Sep 26 night is unbooked.
- **IDP note** claimed a Malaysia rental; the peninsula leg is rail + coach.
  Note now names Greece + Turkey only.

Added: **VPN purchase before China** (`china-e1-vpn`, due Nov 6) — it cannot be
bought inside the mainland. Bought per trip, not as a standing subscription: one
30-day plan spans Nov 7 – Dec 6 (HK is between E1 and E2), cancelled after, and a
fresh one for spring China May 6 – Jun 2.

Resolved after review, same day:

- **SafetyWing** was in place — `nepal-5` now `done: true`. It **does not cover
  helicopter evacuation**; the gap was a deliberate accepted risk, not an
  oversight. Corrected the "heli-evac insurance (mandatory)" line in the trek
  highlights to say so, so no future session re-assumes cover exists.
- **ADB→IST was 19:45** (the todo record was right); the Izmir-car calendar note
  said 16:45 and has been corrected in `itinerary-data.js`.
- **China spring entry needs its own visa gate** (due 2027-03-15): verify the
  visa-free waiver renewed past Dec 31, 2026, else file an L visa (~$300 for
  two) before ticketing the entry leg. On rebase onto the PR #50 reorder, main
  already carried `china-spring-0-visa` for this; kept theirs and added the
  filing lead time + the don't-ticket-yet rule to its note.
- **Deleted the `bookings` array from `itinerary-data.js`.** It duplicated the
  todo ledger, was unread by any view, and had drifted into claiming Türkiye was
  still unbooked. Todos live in `todo-data.js` only.

---

## 2026-10-24 — Railay replaced by Bangkok for the Dec 26–29 peak

Railay was sold out or priced at 2–3× for the three peakest days of the Thai
season. Replaced with Bangkok, same 3 nights, same chapter length.

- Lipe 4 (Dec 14–18) · Lanta 8 (Dec 18–26) · **Bangkok 3 (Dec 26–29)**
- Krabi→Bangkok Dec 26, Bangkok→Kaohsiung Dec 29 (no same-day connection)
- Slightly cheaper; Bangkok is in its best weather of the year (cool season)
- Leaves Dec 29, before the Bangkok countdown — the largest crowd in Thailand

**Rejected:** Ao Nang as a Railay substitute — cheap and available, but a
charmless strip and a poor beach. **Rejected:** Koh Yao Noi — better scenery but
adds a transfer day. **Rejected:** extending Lanta to 11 nights — no extra move,
but a 3-hour airport transfer on departure day.

Cost: the Thailand chapter now ends in a city rather than under the karst.

---

## 2026-10-24 — Malaysia/Thailand un-hurried by moving Shanghai to spring

The December block was boxed: Raja Ampat pins Indonesia A to late February, so
extra nights could only come from before Japan. Moving Shanghai out of China E2
and onto the end of spring China freed 6 nights with no cost to Japan or Taiwan.

- Malaysia 6n → 8n (KL 4, Langkawi 4)
- Thailand 11n → 15n (Lipe 4, Lanta 8, Railay 3)
- Taiwan 15n unchanged, but now arrives Dec 29 with two days before NYE
- China E2 14n → 8n (Guangzhou, Shenzhen, Macau only); spring China 22n → 27n
- Trip 355 → 360 days, ending Jun 16

**Rejected:** holding 32 nights and cutting a base — it would have dropped Railay
and forced a Lanta→Krabi backtrack.
**Rejected:** trimming Indonesia staging to buy the nights — Java/Bali is already
at its minimum before the liveaboard.

Shanghai is not cut, just rescheduled: December is its dampest, grayest month and
May suits it. It also replaces Changsha as the departure hub.

---

## 2026-10-23 — NYE: Ko Lanta (PR #47) vs Kaohsiung (PR #50) — **open, travelers decide**

Options considered:

1. **Ko Lanta, Thailand** — beach bonfires, 3/10 crowds, 31°C. In #47.
2. **Taipei 101, Taiwan** — iconic fireworks, 9/10 crowds (~1M in Xinyi), 15°C + drizzle.
3. **Kaohsiung, Taiwan** — harbour fireworks, 5/10 crowds (~200–400k), 20°C dry. In #50.
4. **Tainan, Taiwan** — city countdown, 3/10 crowds, 21°C dry.

**Rejected: Taipei 101.** Runs against P1 (gray/rain, fireworks often obscured)
and P2 (the largest crowd in the region), and buys nothing the alternatives do not. This was the canonical answer and the wrong
one; it should have been eliminated in the first pass, not after a blanket
rejection of "NYE in Taiwan". Lesson recorded in `AGENTS.md` D5.

**Live:** #47 (Lanta) vs #50 (Kaohsiung). The real trade is *Penang + 4 Andaman
nights* vs *a new country*. Both are valid; left to the travelers.

---

## 2026-10-23 — Singapore stays in May

Options considered: move to December (before or after Malaysia); keep in May;
drop it and extend Indonesia B to May 6.

**Decision: keep in May.** It absorbs China's Labor Day peak, doubles as
pre-China decompression, and sits naturally on the Bali → China routing.
December has no slack: the Malaysian run must clear the school-holiday crush and
the island chain has to end on the cross-border ferry date.

**Rejected: December placement.** Creates four urban stops before the first
beach and pushes the Malaysian stops into the holiday peak.

**Rejected: dropping it.** Loses the Golden Week shield and a top-tier food city
for only ~5 extra Indonesian nights.

---

## 2026-10-23 — Snow time is protected; expansion comes from Japan's city nights

The travelers care about snowboarding **quality**, not fixed dates or a particular
resort region. So the snow block is load-bearing, and any *additional* snow time is
funded by cutting Japan **city** nights — never by taking days from the December
warm-weather block.

Crowd rule: prefer non-holiday, non-weekend riding; shift dates rather than fight a
peak.

Consequence for the design space: Japan's city nights are the elastic part of the
Japan chapter, not the snow nights.

---

## 2026-10-23 — Malaysia appears twice (Dec + Mar) on purpose

The March `borneo` chapter is the **Indonesia visa reset** (30-day clock) plus
wildlife, 2,000 km east and three months after the peninsula chapter. Relabelled
**"Malaysian Borneo"** so the rail does not read as a duplicate. Not merged.

---

## 2026-10-22 — Korea moves to late spring; Taiwan and Guilin/Longji dropped

Winter Korea (sub-zero, dark by late afternoon) and winter Sichuan (lowest-sun
window of the year) both ran against P1. Korea moved to late spring; Sichuan moved
to the pre-monsoon sweet spot; Guilin/Longji dropped for flood-season risk.
Taiwan was dropped at this point for visa bureaucracy — later reconsidered as a
southern-NYE variant.

---

## 2026-11-05 — The map opens on the current chapter, not the world

The trip is live (Day 138), so a world view on load is a screensaver, not a
starting point. Both map modes now open framed on the chapter today falls in
(2D fit of its places, globe camera on its anchor, spin paused); the whole-route
view stays one click away via "← Back to whole route". Once no chapter contains
today — before the trip or after Jun 16 2027 — the home view reverts to the world
view exactly as before.

The rail follows: today's chapter is pinned to the top of the viewport with a
`NOW` tag, exited chapters drop to 45% opacity, future ones stay at full contrast.
A `?chapter=` deep link still wins the scroll so shared links land on their own row.

Amended same day, after seeing it: the state belongs in the **rail head**, not the
app header — it replaces "The Arc / N entries" (a count nobody acts on). Two
jump-to lines: "Currently in <chapter> · N days left" and "Next up <chapter> · date".
The countdown appears **once**, on the current chapter, because an exit day *is*
the next chapter's arrival day — "2 days left" and "in 2 days" are always the same
number. Mobile reuses the same component above the day counter, label inline, on
the standard kicker/serif scale (10px mono / 14px serif), not the 7.5px micro-text
of the first cut. Before the trip only "Next up" shows; after it, "Trip complete".

The 2D map opens capped at **z4 (continent level)** rather than fitted to the
chapter's cities: zoomed to a region it read as "I can't see the trip", zoomed to
the world it was a screensaver. The globe keeps its closer anchor framing — it is
the postcard view; the 2D map is the geography view.

Second amendment: the two lines name the **town**, not the chapter — "Currently in
Kathmandu · 2 days left / Next up Beijing · Nov 7". Chapter names were too coarse to
act on; the town is the unit you book, walk and wake up in. Place windows are derived
from `chapter.start` + the cumulative `place.days` (the same math the detail panel
uses), so a city change mid-chapter moves the label without touching the data. The
countdown now runs to the **next town's arrival**, which on a chapter's last stop is
its exit day — same number as before, but it now means what it says. On an exit day
where the next flight is overnight (São Paulo → Toronto, Aug 26) it reads
"leaving today" rather than "1 day left".

Third pass: the **country flag replaces the chapter-colour dot** — the dot carried no
information, the flag says which passport you're on at a glance. And the second line
is labelled **Next stop** when the next town sits in the chapter you're already in
(same flag, same country); **Next up** is kept for a chapter change, so a border
crossing never passes for a local hop.

Fourth pass: the day counter moved into the mobile header (`Asia. · DAY 138 / 359`),
in the same mono/10px/0.16em style as the desktop meta — it was floating in its own
strip in the wrong font. The strip keeps the now/next block and a bare progress
rule. And the next cell lost its date: during the trip the countdown on the line
above already says when you move, so only the pre-trip state (no countdown) still
shows an arrival date.

Fifth pass: the **progress bar** joins the day counter in the mobile header. Below
880px it is not a 220px inline bar — it becomes the header's bottom edge (full
bleed, replacing the 1px rule), which is the only place a bar fits next to the
brand, day count and nav. The separate progress row in the strip is gone; the strip
is now just now/next. The 881–980 clamp that hid the bar is dropped too, so it stays
inline on tablets now that the brand meta is off there.

## 2026-11-05 — "Unsynced" is measured against the payload, not the browser

The header carries a 6px amber dot when the itinerary or the to-dos have moved
since this browser's last successful push, and each row of the Sync menu shows its
own dot so the right target is obvious. The test is a fingerprint (FNV-1a over the
built payload) stored after a clean sync — Calendar over stop/flight/transport
titles, dates and descriptions; Tasks over title, notes, due date and done flag.
What that buys and what it deliberately ignores:

- Prose edits in `itinerary-data.js` (intros, decisions, themes) don't light it,
  because they never reach Google. A re-timed stop, a renamed leg, a new flight do.
- Editing a note or a `done:` in `todo-data.js` lights it; a browser tick does not.
  Ticks are local until Export → commit, and the Tasks sync reads the file — so the
  dot would never clear if ticks counted.
- A partial sync (any failed event/task) leaves the fingerprint unset, so the dot
  survives until a run is actually clean.
- A browser that has never synced shows nothing: the bare `Sync` label is already
  the prompt. One that synced *before* fingerprints existed shows the dot once —
  there is no baseline, so a push is due rather than a claim of "synced".

## 2026-11-05 — The dot has two states: amber = behind, blue = working

Below 880px the header sync button drops its label, so `Syncing…` never renders
and a running push looked exactly like an idle one — the amber dot read as "still
behind", not "in progress". The dot is now a two-state indicator and **busy
overrides stale**:

- **Blue, blinking (1s)** while a push is in flight — even when nothing was stale,
  so a manual sync on a clean state isn't silent on mobile.
- **Amber, static** when the payload has moved since the last clean push.
- Busy wins on *both* breakpoints, deliberately: one meaning per state beats a
  desktop that says `Syncing…` next to an amber "unsynced" dot.
- `prefers-reduced-motion` drops the blink and keeps the colour — the state is
  still legible without motion.

## 2026-11-05 — A stop's `days` are nights, never calendar days

Nepal's stops summed to 17 but split 4 / **11** / **2**. The trek was quoted by
the operator as "Oct 25 – Nov 4" (11 inclusive days, **10 nights**), so the
inclusive span got copied in and the post-trek Kathmandu block lost its Nov 4
night. The chapter total was right, which is why nothing caught it: the error
only moved a night from one stop to another.

- **Rule: `places[].days` = nights.** The card renders `start … start+days-1`
  and the chapter's exit day always falls outside the last window. So a tour
  whose dates read "Oct 25 – Nov 4" is `days: 10`, and the return-leg day
  belongs to the **next** stop, not the one you left.
- **The tell for a future audit:** if a stop's highlights mention a date the
  derived window doesn't cover, or a hotel booking names one more night than
  the card claims, the split is wrong even when the chapter sum is not.
- Nepal now reads 4 / 10 / 3 = 17, and Nov 7 carries the actual morning
  (11:45 wheels-up, ~08:45 taxi, TIA by 09:00) rather than "early departure" —
  which also settles that the Boudhanath farewell kora is Nov 6, not Nov 7.
- **Not changed:** the flight, the Nov 7 chapter end, Beijing Nov 7–15. The
  plan already matched the booking; only the split was wrong.

## 2026-11-06 — A type floor, and the scrim that was never painting

Two complaints, one root cause each: the UI was set for print at arm's length,
and the atlas title was trusting a backdrop that did not exist.

- **Micro type lifted ~2px app-wide**, not per page. Labels/kickers move from
  6.5–9 to 9.5–11.5, mono metadata from 9.5–11 to 12–13, prose from 12–14.5 to
  14–16; display sizes are untouched. Relative hierarchy is preserved, which is
  why the pages still read as one system. The old binder-only "+1.5px" override
  was the tell that the rest of the app needed the same licence — it is gone.
- **`.atlas-vignette` was dead code.** It sat inside `.atlas-canvas`, whose
  Leaflet panes (z-index 200–700) paint above anything at z-index 1, so the
  gradient intended to back the chapter title had been invisible since the map
  was introduced. It is now a stage-level sibling of `.atlas-canvas` at z-index
  5: above the map, below the title (20), reel (25) and tools (30).
- **The scrim owns the title corner.** A radial throw anchored on the title
  block carries the sub-row and the "next up" line; per-element text-shadows are
  the second line of defence for the case where a bright tile slides under while
  the map pans. Rejected: a glass chip behind the metadata — it puts a card on
  an otherwise surface-free immersive map, and the weather pills already own that
  language.
- **Phones get a different object, not a smaller one.** The desktop throw covers
  more than half a phone screen; mobile uses a top band that is gone by ~50% of
  the stage, so the title reads and the imagery stays the point.
- A scrim that is still opaque at its own edge draws a rectangle — the gradient
  must reach zero inside the box. Sizing it in px (not %) is what makes that
  hold as the viewport changes.

## 2026-11-06 — The scrim steps back, past chapters get a check, no rails

Three readability follow-ups to the scrim commit, all in the same direction:
the map is the object, the chrome should not vote.

- **Scrim dialled down, not off.** The corner throw ran 0.90/0.60/0.22 and read
  as a black card over the imagery. Now 0.76/0.44/0.15, with the two edge
  gradients on the same shave. The title was never carrying itself on the
  gradient alone — the text-shadows are the insurance, so the scrim can be a
  lens instead of a wall. Rejected: deleting it and leaning on shadows; a
  snowfield or a bright city grid still wins that fight at 12px mono.
- **Past chapters are marked, not dimmed.** `.reel-card.is-past` at 0.58 opacity
  made a third of the reel look disabled, which reads as "unavailable", not
  "travelled". The card keeps full colour and gets a small circular check on the
  photo's top-right — the same slot the amber "Now" pill uses, which is safe
  because a card can be the current chapter or past, never both. Rejected:
  striking the date, and a checklist on the year spine (the spine's ticks are
  3px wide; there is no room for a glyph).
- **No visible scrollbars anywhere.** The 10px rail was the loudest chrome on
  screen and every scrolling surface here is a page, not a box. Hidden globally
  in Chrome/Safari and by name on `.page`, `.detail-scroll`, `.binder-scroll`,
  `.ledger-table-wrap` and `.reel-track` for Firefox. Scrolling itself is
  untouched; only the rail is withheld. Accepted cost: no length cue in the
  binder — the content column and the type scale carry that job now.
- **The giant name is scenery on touch, and its tap is recovered by hit-test.**
  It is a `<button>` (tap → open the chapter), so a pinch with one thumb over
  the title hit the button and the map engine — Leaflet's `touchstart` is bound
  to its own container, OrbitControls' `pointerdown` to the canvas — never saw a
  second touch. Under `@media (hover: none)` the name is `pointer-events: none`,
  so the whole title block pans and pinches like open map. The tap is then
  rebuilt on the stage (`touchstart`/`move`/`end`, 12px slop, 700ms): a short
  single-finger release inside the name's box opens the chapter unless a pin, a
  reel card or a tool was under the finger, or the releasing element is not the
  map itself — the title box can sit under the open spread. The release is
  `preventDefault`ed (plus a 600ms guard on `onBackgroundClick`) because the map
  reads the same gesture as a click on empty water and would close the sheet it
  just opened. Rejected: re-dispatching synthetic touches at the engine — Leaflet
  would take a synthesized `touchstart`, but OrbitControls' pointer bookkeeping
  and capture make the globe version a re-implementation, not a bridge.
- **The phone band takes the same shave**, .90/.80 → .82/.72 at the top and
  .90 → .82 at the reel. It is the only backing the title gets on a phone and
  the band is bigger than the desktop throw, so it stays heavier there on
  purpose.
- **The sync menu is pinned to the screen edge, not to its tab.** On the phone
  nav the menu hung off the last tab with `right: -30px`, and that tab is flush
  with the viewport, so a 160px panel started 30px off-screen and `.app`'s
  `overflow: hidden` cut it. `right: 10px` anchors it inside the edge. (The
  desktop button sits inside the header padding, where `right: 0` was already
  right — the override existed only for the bottom nav.)

## 2026-11-06 — Two phantom nights, a nine-night boat, and the legs nobody could see

A full todo↔itinerary audit (21 chapters, 359 nights, 157 todo items). The
chapter arithmetic, geo, colours, photo keywords, budget rows and totals all
checked out; what did not was where three nights actually lived.

- **The Denpasar night was Cebu's.** `philippines` ended with a 1n "Denpasar"
  stop (Apr 13–14) while its own text said "Apr 14 Cebu → Denpasar", the flight
  record was Apr 14 and Indonesia Entry 2 began Apr 14 in Nusa Penida. A place
  can only hold nights the chapter actually spends there. Cebu / Moalboal goes
  2n → 3n and the Denpasar place is gone; the chapter stays 14 nights.
- **Sanur, not Penida, gets the first Bali night.** `indonesia-b` opened with
  Nusa Penida 4n from Apr 14, but its own highlight and the transport record
  both had the fast boat leaving Sanur on Apr 15 — the flight lands Apr 14, from
  Cebu via Manila/Singapore. So: Sanur 1n (Apr 14), Penida 3n (Apr 15–18),
  Komodo 7n, Bali 6n — still 17. **Cost: Penida loses a night.** The alternative
  was keeping 4n and putting an international arrival and a 45-min boat ride in
  the same afternoon; not worth a night on a scooter island.
- **The liveaboard is nine nights, not ten.** The operator's run is Mar 11–20
  (traveller-confirmed), so Raja Ampat is 9n and the Mar 20 night is in Sorong,
  before the Mar 21 flight to Kota Kinabalu. The plan had the boat ending Mar 21
  — which is where the "10 days" in the calendar event came from. Sorong now
  appears twice (pre-boat, post-boat), which is why the geo key is renamed.
- **Baku has no stay todo because there is no stay to book.** The Azerbaijan
  Airlines stopover programme covers the hotel; the budget already carried $0
  lodging. Recorded as a done item so the gap does not get re-audited every
  time, and so nobody "fixes" the empty lodging line.
- **Eleven travel legs existed only in prose.** `transports` is what the
  calendar syncs, and it was missing the in-chapter flights and road/sea legs
  the plan assumes: Kayseri→Izmir and Izmir→Istanbul (Sep), Yogyakarta→Bali,
  Bali↔Labuan Bajo, Manila→Coron→El Nido→Cebu, and Borneo's three transfers.
  All added as estimates — none of them is ticketed, and none should be read as
  a timetable.
- **Left alone on purpose:** eleven todo `place` labels that name a route, an
  office or a landmark rather than a stop (Izmir, TECO, Borobudur, Java, Sipadan,
  "Cebu → Bali"). The field is display-only; renaming them would churn the file
  without changing a single date.
