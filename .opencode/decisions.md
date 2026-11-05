# Decision log

Settled questions, the options that lost, and why. Future sessions must not
re-litigate these without new evidence, and must not silently re-collapse an
open question into one answer.

Format: **Decision** · date · options considered · why.

---

## 2026-11-05 — Hongcun gets the arrival night; one mountain day, not two

Hongcun was a day trip inside the Huangshan block. It should not be: its good
hours are **06:00–08:00 and 17:00–19:00**, and a day visit lands in the
09:30–15:00 coach window. So night 1 (Nov 15) moves into the village and the
mountain nights follow at Zhaixi.

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

**Chosen: Beijing 8 (Nov 7–15) · Huangshan 4 Tangkou (Nov 15–19) · Hangzhou 4
(Nov 19–23).** Cost-neutral: −1 Beijing night, +1 Tangkou, +2 Hangzhou, −2 Suzhou.

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

Operational consequences now in the ledger: **G87 06:56→12:13 is the only train
landing before noon** (all others 13:46–21:11) and it is a single daily fast
service — the chapter's one time-critical booking. The canyon day has a hard
17:10 last cableway and a 16:00 canyon-rail close. Hangzhou→Hangzhou **East**,
not West. HGH at 08:00 means a 04:45 wake; staying airport-side buys nothing.

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
