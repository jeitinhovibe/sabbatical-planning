# Decision log

Settled questions, the options that lost, and why. Future sessions must not
re-litigate these without new evidence, and must not silently re-collapse an
open question into one answer.

Format: **Decision** · date · options considered · why.

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
bought inside the mainland, and it has to cover all three China entries.

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
