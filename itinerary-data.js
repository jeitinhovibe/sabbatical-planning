// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-06-21');
  const END = new Date('2027-06-16');
  const MS = 86400000;
  const totalDays = Math.round((END - START) / MS);

  // Lookup helper for any date → "Day N of M"
  function dayCounter(date) {
    const d = (date instanceof Date) ? date : new Date(date);
    const n = Math.round((d - START) / MS) + 1;
    return { n: Math.max(1, Math.min(totalDays, n)), total: totalDays };
  }

  // Google Maps deep link
  function mapsUrl(query, lat, lng) {
    if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  // loremflickr — returns real Flickr photos matching the keyword.
  // Deterministic per keyword via a hash-derived lock value.
  function photoUrl(keywords, w = 1200, h = 900) {
    const terms = encodeURIComponent(keywords.trim().replace(/\s+/g, ','));
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) {
      hash = ((hash << 5) - hash) + keywords.charCodeAt(i);
      hash |= 0;
    }
    const lock = Math.abs(hash) % 500;
    return `https://loremflickr.com/${w}/${h}/${terms}?lock=${lock}`;
  }

  function fmt(d, { year = false } = {}) {
    const dt = new Date(d);
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getUTCMonth()];
    return year ? `${m} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}` : `${m} ${dt.getUTCDate()}`;
  }

  function dayRange(start, end) {
    return `${fmt(start)} – ${fmt(end)}`;
  }

  // ── Regions for visual grouping / coloring ──
  const REGIONS = {
    americas:     { name: 'Americas',       accent: '#8b6040' },
    mediterranean:{ name: 'Mediterranean',  accent: '#4a7fa5' },
    crossroads:   { name: 'Crossroads',     accent: '#c2693a' },
    himalaya:     { name: 'Himalaya',       accent: '#7a8a52' },
    northeast:    { name: 'Northeast',      accent: '#a8543e' },
    middle:       { name: 'China & HK',     accent: '#b03a3a' },
    archipelago:  { name: 'Archipelago',    accent: '#2c6f7a' },
    isthmus:      { name: 'SE Asia',        accent: '#c98a2a' },
    rainforest:   { name: 'Rainforest',     accent: '#3d6e4f' },
  };

  // ── Trip-progression color: a single ember hue, light at the start ──
  // (Brasil) deepening to dark roast by the end (spring China). Chapters
  // read as one journey; position along the ramp shows time, not identity.
  const CHAPTER_COLORS = {
    'brasil':       '#e4833a',
    'toronto':      '#e27e33',
    'athens':       '#e1792e',
    'turkey':       '#df7428',
    'baku':         '#dd6f22',
    'india':        '#d66b21',
    'nepal':        '#cf6721',
    'china-e1':     '#c76321',
    'hk':           '#c05f20',
    'china-e2':     '#b95b20',
    'malaysia':     '#b2571f',
    'thailand':     '#ab541f',
    'taiwan':       '#a8521f',
    'japan':        '#a4501e',
    'indonesia-a':  '#9d4c1e',
    'borneo':       '#96491d',
    'philippines':  '#8f451c',
    'indonesia-b':  '#88421b',
    'singapore':    '#813e1b',
    'china-spring': '#77391a',
    'korea':        '#6d3418',
  };

  // Chapter identity color — falls back to the region accent for ids
  // added later without a palette entry.
  function chapterColor(ch) {
    if (ch && CHAPTER_COLORS[ch.id]) return CHAPTER_COLORS[ch.id];
    const region = ch && REGIONS[ch.region];
    return (region && region.accent) || '#c2693a';
  }

  // Readable text over a chapter color: ink on the light end of the
  // ramp, white everywhere else (the detail pill uses this).
  function contrastText(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#fff';
    const v = [0, 2, 4].map((i) => {
      const c = parseInt(m[1].substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const lum = 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    return lum > 0.3 ? '#2a2118' : '#fff';
  }

  // ── Chapters ──
  // Each entry: id, kind, country, flag, title, dates, days, theme,
  // intro (poetic), tldr (condensed), weather, region, places[]
  // Each place: name, days, query, photo, plan (one prose paragraph — what you
  // do there, in order), notes[] (≤4 quiet constraints: closures, gear, ticket
  // mechanics, the one irreversible transfer). No date stamps, prices or
  // timetables — the stop's own dates sit in the timeline, and bookings live in
  // todo-data.js.
  // NOTE: chapter numbers are NOT stored here — itinerary-store.js derives
  // them from array order on load, so inserting/reordering is renumber-free.
  const chapters = [
    {
      id: 'brasil', kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'Brasil',
      start: '2026-06-21', end: '2026-08-26', days: 66,
      theme: 'Mountains and diving certs, kite condo, farewell BBQ',
      intro: 'The trip opens at home: Rio for the Petrópolis–Teresópolis trail and diving certifications (Advanced Open Water + NITROX), then a month in a Cumbuco condo for short kitesurfing sessions and downwinders, closing with friends, family and a farewell BBQ in São Paulo.',
      tldr: 'Rio de Janeiro · Cumbuco · São Paulo',
      weather: { hi: 30, lo: 18, label: 'Inverno brasileiro, 18°–30°', emoji: '🏠', rainyDays: 12 },
      photos: ['rio aerial'],
      places: [
        { name: 'Rio de Janeiro', photo: 'copacabana beach', days: 29, query: 'Ipanema, Rio de Janeiro',
          plan: 'Three weeks at home before anything abroad: the Petrópolis–Teresópolis traverse through the Serra dos Órgãos, Advanced Open Water and NITROX over two weekends of diving, and the Zona Sul in between — Ipanema mornings, Botafogo for dinner, Lapa when it is loud. Rio is also where the kit gets tested, before it has to work for a year.', },
        { name: 'Cumbuco', photo: 'cumbuco beach kites', days: 30, query: 'Cumbuco, Caucaia, Ceará',
          plan: 'A month in a condo a few steps off the kite beach: short sessions most afternoons, the flat water at Cauípe lagoon on light days, and a downwinder north when the trades settle. Evenings belong to the village\'s beach bars and a fridge full of fruit — the last month where nothing has to be booked.', },
        { name: 'São Paulo', photo: 'masp sao paulo', days: 7, query: 'Avenida Paulista, São Paulo',
          plan: 'A week of friends, family and a farewell BBQ — the last errands, the last proper Brazilian food for a year, and a soft close to the home chapter before the overnight flight.',
          notes: ['Aug 26: 21:35 flight to Toronto, landing Aug 27 — the overnight is not a gap in the plan'] },
      ],
    },
    {
      id: 'toronto', kind: 'chapter', region: 'americas',
      country: 'Canada', flag: '🇨🇦', title: 'Canada',
      start: '2026-08-27', end: '2026-09-01', days: 5,
      theme: 'Friends & family send-off before Europe',
      intro: 'Five days in Toronto before crossing the Atlantic — mostly to meet friends and family. Stayed at a friend\'s place, played with their kids. Overnight flight out on Aug 31, landing in Athens Sep 1.',
      tldr: 'Friends & family · Toronto Islands · High Park · UofT bike ride',
      weather: { hi: 27, lo: 17, label: 'Late summer, 27°/17°', emoji: '🍁', rainyDays: 2 },
      photos: ['toronto cn tower'],
      places: [
        { name: 'Toronto', photo: 'toronto distillery', days: 5, query: 'Kensington Market, Toronto',
          plan: 'Five days at a friend\'s place, deliberately low-key: the Islands ferry for the skyline from the water, High Park, a bike loop through campus, and long dinners at home with the kids. The point of the stop is the people, not the city.' },
      ],
    },
    {
      id: 'athens', kind: 'chapter', region: 'mediterranean',
      country: 'Greece', flag: '🇬🇷', title: 'Greece',
      start: '2026-09-01', end: '2026-09-21', days: 20,
      theme: 'Athens, Cretan trails, island-hopping the western Cyclades',
      intro: 'Twenty nights arcing south through Greece in September — crowds thinning, sea at its warmest. Athens first, then Crete with a car in Chania, and the ferry chain north through Santorini, Folegandros and Milos.',
      tldr: 'Athens · Chania · Rethymno · Santorini · Folegandros · Milos',
      weather: { hi: 29, lo: 20, label: 'September Aegean, 29°/20°', emoji: '🏛️', rainyDays: 2 },
      photos: ['athens acropolis'],
      places: [
        { name: 'Athens', photo: 'athens monastiraki', days: 4, query: 'Acropolis, Athens, Greece',
          plan: 'The Acropolis at opening, before the groups and the heat, then the museum underneath it; Plaka and Anafiotika in the evening, Monastiraki\'s flea market and the mezedes bars on the side streets. One night at the Thision open-air cinema, one slow sunset from Philopappos Hill, and the Agora or the National Garden whenever the legs want a gentler day.', },
        { name: 'Crete — Chania', photo: 'chania old town', days: 4, query: 'Chania old town, Crete',
          plan: 'A car out of Chania and west Crete by day — Balos lagoon, Elafonisi\'s pink sand, Therisos gorge, Falasarna — with the Venetian harbour, the lighthouse and a taverna dinner waiting at the end of each one. Chania\'s old town is the evening, not the day.',
          notes: ['Car collected in Chania; the far-west beaches are 1–1.5h each way'] },
        { name: 'Crete — Rethymno', photo: 'rethymno old town', days: 3, query: 'Rethymno old town, Crete',
          plan: 'The old town and the Venetian harbour on foot, a beach afternoon, then the seasonal fast ferry south. It is the shortest stop in the chapter and the one the wind can reshape.',
          notes: ['Sep 12 fast ferry to Santorini; if the meltemi cancels it, drive to Heraklion and sail from there'] },
        { name: 'Santorini', photo: 'santorini oia', days: 2, query: 'Fira, Santorini',
          plan: 'Two nights outside the caldera: the rim path from Fira through Imerovigli to Oia at dusk, Akrotiri and the museum if the wind is up, and a swim at Perissa instead of the postcard. Sleeping away from the cliff is what makes two nights affordable.',
          notes: ['Lodging away from the caldera is the only way the price stays sane'] },
        { name: 'Folegandros', photo: 'folegandros chora', days: 2, query: 'Chora, Folegandros',
          plan: 'The un-hyped bet: a small walkable Chora, the Panagia trail for sunset, and Agali and Katergo reached by boat taxi — no car, no agenda, and the quietest two nights of the island run.',
          notes: ['Local bus is ~€2 a hop'] },
        { name: 'Milos', photo: 'milos sarakiniko', days: 4, query: 'Sarakiniko, Milos',
          plan: 'Sarakiniko\'s white rock over turquoise water, three days of driving between Tsigrado, Firopotamos and Papafragas, the Kleftiko boat day as the chapter\'s splurge, and Plaka\'s sunset over Klima\'s painted boathouses.', },
        { name: 'Athens', photo: 'cape sounion', days: 1, query: 'Piraeus, Athens',
          plan: 'One night near the airport before the Cappadocia flight — a buffer, with Sounion\'s temple at sunset if the connection allows.' },
      ],
      decisions: ['Crete instead of Naxos: better trails, a cheaper interior, and a direct seasonal ferry from Rethymno', 'The car comes out of Chania, for the west-Crete days — Balos, Elafonisi, Falasarna; Rethymno is on foot', 'Folegandros is the un-hyped pick: fully walkable, no car, and the quietest two nights of the island run', 'Ferry back from Milos with a buffer night by the airport — a flight would have saved nothing and added a transfer'],
    },
    {
      id: 'turkey', kind: 'chapter', region: 'crossroads',
      country: 'Turkey', flag: '🇹🇷', title: 'Turkey',
      start: '2026-09-21', end: '2026-10-12', days: 21,
      theme: 'Cappadocia valleys, Aegean kitesurfing, Lycian coast, unhurried Istanbul',
      intro: 'Landing from Athens into Göreme Sep 21. Three nights in the valleys (September balloon cancelled — high winds), then Sep 24: fly Kayseri → Izmir for a rental-car loop down the Aegean coast: Alaçatı, Şirince (Ephesus), Kaş and Akyaka. Return the car at Izmir Oct 2, fly to Istanbul and stay until the Oct 12 flight to Baku.',
      tldr: 'Cappadocia (Göreme) · Alaçatı · Şirince · Kaş · Akyaka · Istanbul',
      weather: { hi: 26, lo: 14, label: 'Early autumn, 26°/14°', emoji: '☀️', rainyDays: 3 },
      photos: ['cappadocia balloons'],
      places: [
        { name: 'Cappadocia — Göreme', photo: 'goreme valley', days: 3, query: 'Göreme, Cappadocia, Turkey',
          plan: 'Three nights in the valleys: Rose and Love Valley on foot at golden hour, the Open Air Museum\'s rock-cut churches, Kaymakli underground, and terrace breakfasts as the balloons clear the ridge — though September\'s flights were cancelled for wind, so the mornings stay unhurried.', },
        { name: 'Alaçatı', photo: 'alacati aegean', days: 3, query: 'Alaçatı, Çeşme, Turkey',
          plan: 'Land Izmir late and drive an hour to the coast: restored stone houses, windmills on the ridge, and three slow days between Alaçatı, Çeşme and Ilıca — the recovery stop after three weeks of moving.',
          notes: ['Car collected at Izmir and kept through Oct 2'] },
        { name: 'Şirince', photo: 'ephesus library', days: 1, query: 'Şirince, Selçuk, Turkey',
          plan: 'Ephesus in the morning, before the coaches and the heat, then a quiet village night in the hills among fruit wine and stone houses.' },
        { name: 'Kaş', photo: 'kas harbour', days: 3, query: 'Kaş, Antalya, Turkey',
          plan: 'A long drive south to the harbour, then two full days: Kekova\'s sunken city by boat, Kaputaş for a swim, the amphitheatre above town at dusk, and dinner on the water.' },
        { name: 'Akyaka', photo: 'akyaka azmak', days: 1, query: 'Akyaka, Muğla, Turkey',
          plan: 'The Azmak river, a slow evening and one last swim — a deliberate stop on the road back to Izmir rather than another transit day.',
          notes: ['Oct 2: drive to Izmir, drop the car, fly to Istanbul — the only tight day in the loop'] },
        { name: 'Istanbul', photo: 'istanbul mosque', days: 10, query: 'Sultanahmet, Istanbul',
          plan: 'Ten nights, deliberately unhurried: Hagia Sophia and Topkapi on separate mornings, the Blue Mosque and the basilica cistern, ferries to Kadıköy for market mornings and Moda\'s cafés, and the Bosphorus as a daily commute. Ten days is what turns the peninsula from a checklist into a neighbourhood.', },
      ],
      decisions: ['A car loop down the Aegean rather than a Kaş turnaround: Alaçatı, Ephesus, Kaş, Akyaka, back to Izmir', 'Şirince earns its night on Ephesus access; Akyaka breaks the long Kaş→Izmir drive instead of being a transit day', 'Istanbul closes the chapter with ten nights — the first real stay after three weeks of moving', 'Baku is a deliberate stopover: one full day, and the Istanbul→Delhi red-eye becomes two civilised flights'],
    },
    {
      id: 'baku', kind: 'chapter', region: 'crossroads',
      country: 'Azerbaijan', flag: '🇦🇿', title: 'Azerbaijan',
      start: '2026-10-12', end: '2026-10-14', days: 2,
      theme: 'Caspian layover between Istanbul and Delhi',
      intro: 'One full day on the ground (Oct 13) between flights: leave Oct 12, arrive Delhi Oct 14. Flame Towers at dusk, the walled Old City, and the Caspian promenade.',
      tldr: 'Flame Towers · Icherisheher · Caspian Bulvar',
      weather: { hi: 19, lo: 13, label: 'Mild autumn, 19°/13°', emoji: '🔥', rainyDays: 2 },
      photos: ['baku flame towers'],
      places: [
        { name: 'Baku', photo: 'baku old city', days: 2, query: 'Baku, Azerbaijan',
          plan: 'One full day on the ground between flights: Flame Towers at dusk over the Caspian, the walled Old City with the Maiden Tower and the Shirvanshahs\' palace, and the Bulvar promenade for the evening.',
          notes: ['Late arrival on the 12th and the Delhi flight on the night of the 13th — one full day, no slack'] },
      ],
    },
    {
      id: 'india', kind: 'chapter', region: 'himalaya',
      country: 'India', flag: '🇮🇳', title: 'India',
      start: '2026-10-14', end: '2026-10-21', days: 7,
      theme: 'Sacred intensity, iconic monuments, Himalayan slow life',
      intro: 'A tight, intentional India: land in Delhi Oct 14 from Baku, day trip to the Taj on Oct 15, early train to Varanasi Oct 17, then Varanasi Oct 17–21 at full spiritual intensity before flying direct to Kathmandu on Oct 21.',
      tldr: 'Delhi · Agra · Varanasi (via Baku)',
      weather: { hi: 30, lo: 16, label: 'Post-monsoon clear, 30°/16°', emoji: '🌅', rainyDays: 1 },
      photos: ['taj mahal sunrise'],
      places: [
        { name: 'Delhi + Agra', photo: 'old delhi jama masjid', days: 3, query: 'Taj Mahal, Agra',
          plan: 'Delhi for the noise — Jama Masjid, Chandni Chowk\'s lanes, Humayun\'s Tomb — then a day trip to Agra: the Taj at sunrise, the fort, and Mehtab Bagh across the river at sunset.', },
        { name: 'Varanasi', photo: 'varanasi ghats', days: 4, query: 'Varanasi ghats, India',
          plan: 'The Ganges at dawn from a rowing boat, the aarti at Dashashwamedh at dusk, the cremation ghats at Manikarnika, and Sarnath one afternoon out. The rest is alleys, chai stalls, silk shops and a city that rewards getting lost.', },
      ],
    },
    {
      id: 'nepal', kind: 'chapter', region: 'himalaya',
      country: 'Nepal', flag: '🇳🇵', title: 'Nepal',
      start: '2026-10-21', end: '2026-11-07', days: 17,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'Late October into November — post-monsoon clarity holds, skies still crystalline, Himalayan views unobstructed 360°. Slightly cooler than October, meaning fewer crowds on the trail and sharper air at altitude.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek',
      weather: { hi: 18, lo: 2, label: 'Late post-monsoon, 18°/2°', emoji: '🏔️', rainyDays: 1 },
      photos: ['annapurna himalaya'],
      places: [
        { name: 'Kathmandu', photo: 'kathmandu boudhanath stupa', days: 4, query: 'Kathmandu, Nepal',
          plan: 'Boudhanath, Pashupatinath and Swayambhunath at an easy pace, plus one admin morning in Thamel to meet the guide and porter, check the gear and collect the permits.',
          notes: ['ACAP and TIMS run through the agency — confirm at the office'] },
        { name: 'Annapurna Base Camp Trek', photo: 'everest prayer flags', days: 10, query: 'Annapurna Base Camp, Nepal',
          plan: 'Ten days out of Pokhara with Discovery World, on the classic ABC line: Tikhedhunga and Ulleri\'s stone stairs, rhododendron forest up to Ghorepani and Poon Hill before dawn, then Tadapani, Chomrong and Himalaya to the sanctuary at 4,130m — and back down through Bamboo to Jhinu\'s hot springs.',
          notes: ['Guide and porter for two, 9kg each; full board and loaned sleeping bag and down jacket on the trail', 'Carry cash for tips (~$150), showers and WiFi; no helicopter-evac cover — a risk taken deliberately'] },
        { name: 'Kathmandu', photo: 'patan durbar', days: 3, query: 'Thamel, Kathmandu',
          plan: 'Back to Thamel to rest: massage, express laundry, a repack for China. A dawn kora at Boudhanath, Patan\'s Durbar Square if the afternoon stretches, and a farewell dinner close it out.',
          notes: ['Return the loaned sleeping bag and down jacket at the DWT office, and buy down in Thamel', 'Nov 7: the 11:45 flight wants the taxi out of Thamel by 08:45'] },
      ],
    },
    {
      id: 'china-e1', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-11-07', end: '2026-11-23', days: 16,
      theme: 'First entry: slow Beijing start (trek recovery), the Yellow Mountain, and a night in Hongcun on the way out',
      intro: 'Sixteen days north to south: Beijing late on Nov 7, opening slow so the hutongs absorb the post-trek fatigue while the last autumn light holds. Then the morning train to Tangkou for three nights and one full mountain day, in the last week before West Sea Canyon and Tiandu close for winter. A night inside Hongcun at Tachuan\'s colour peak, then four Hangzhou nights at peak gingko-and-maple — timed to the booked 08:00 flight to Hong Kong.',
      tldr: 'Beijing · Huangshan · Hongcun · Hangzhou',
      weather: { hi: 15, lo: 2, label: 'Cold north → mild Jiangnan, 15°/2°', emoji: '🍁', rainyDays: 4 },
      photos: ['great wall snow'],
      places: [
        { name: 'Beijing', photo: 'forbidden city', days: 8, query: 'Mutianyu Great Wall, Beijing',
          plan: 'A late landing and two deliberately empty days — hutongs, the Drum and Bell Towers, duck at a proper roast shop — while the trek fatigue drains. Then the Forbidden City in the cold light of a weekday, Mutianyu on the clearest of the three, and the Temple of Heaven\'s morning park and 798 filling what is left. Eight nights is enough to see the city twice, which is the point of opening here.',
          notes: ['Forbidden City shuts Mon 9; every other day in the window works', 'Mutianyu Tue 10 – Thu 12: weekday crowds, and the last of the foliage', 'Nothing booked for the morning of the 15th — that is the train south'] },
        { name: 'Huangshan', photo: 'huangshan sea of clouds', days: 3, query: 'Huangshan, Anhui',
          plan: 'Two climbing days from the village at the mountain\'s foot. The first is the full circuit — Yungu cable up, Shixin and Beihai, West Sea Canyon and its monorail, Guangmingding, Aoyu, then down the Yuping side before the last cable. The second is decided at the exit gate: Tiandu Peak if it is open and the sky is clear, the villages and hot springs if not.',
          notes: ['Base at Tangkou\'s Zhaixi end — 5min from the first bus, and spikes and a shell rentable there', 'West Sea Canyon and Tiandu both shut for winter on 1 Dec: this is the last full week', 'No summit bed, so no sunrise and no sunset — both days are cableway round trips'] },
        { name: 'Hongcun', photo: 'hongcun moon pond', days: 1, query: 'Hongcun, Yi County, Anhui',
          plan: 'One night inside the village, which is the entire purchase: lanterns on empty lanes at dusk, the Moon Pond and South Lake to yourself at dawn before the buses arrive, and Tachuan\'s colour in the afternoon while the light is still good.',
          notes: ['Name-linked ¥94 ticket, 3-day re-entry — buy it ahead with the passports', 'No cars inside: packs move by hand cart from the south gate'] },
        { name: 'Hangzhou', photo: 'west lake', days: 4, query: 'West Lake, Hangzhou',
          plan: 'Four nights at the lake in peak colour: the causeways and a boat out to Three Pools, Lingyin\'s carvings and the cedar groves behind them, the tea terraces at Meijiawu and Longjing, Hefang Street for an old-town evening, and a Shaoxing day trip when the city needs a change.',
          notes: ['Base at Wulin Square — Line 19 runs straight to the airport', 'Nov 23: the 08:00 flight is the chapter\'s one fixed point'] },
      ],
      decisions: ['Mountain-side before every climb, village-side on the way out: Tangkou takes the arrival night, Hongcun the last, when its lanes are empty', 'One mountain day planned, a second decided at the exit gate — re-entry can only be reserved after the first check-in', 'Tangkou rather than the summit: summit doubles are ¥1,000–1,680, so the chapter buys a full canyon day instead of a sunrise', 'Suzhou is a spring day trip from Shanghai, not a stop here — the flight out is HGH, and the old chain ran two connections for one morning'],
    },
    {
      id: 'hk', kind: 'chapter', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong',
      start: '2026-11-23', end: '2026-11-28', days: 5,
      theme: 'Neon city + dim sum + visa reset, priced before Christmas week',
      intro: 'Five late-November days: dry 20° air, early WinterFest lights, shoulder-season prices — the 30-day visa clock resets for the southern leg, and the Tuesday-morning TECO errand files the Taiwan visitor visas for the December crossing. Five days with friends and a proper chapter, not transit.',
      tldr: 'Victoria Peak · Kowloon neon · Dim sum · Lamma Island',
      weather: { hi: 20, lo: 14, label: 'Pre-Christmas dry, 20°/14°', emoji: '🥟', rainyDays: 1 },
      photos: ['hong kong skyline'],
      places: [
        { name: 'Hong Kong', photo: 'kowloon neon', days: 5, query: 'Victoria Peak, Hong Kong',
          plan: 'Five days of city: the Peak at dusk with the tram up, the Star Ferry at night, dim sum until it becomes a habit — Tim Ho Wan, Lin Heung, One Dim Sum — Temple Street\'s jade and fortune tellers, and the Nan Lian garden and Chi Lin nunnery for quiet. A Lamma day trip for seafood and a car-free walk, and the TECO errand that gates Taiwan.',
          notes: ['TECO visa filing for Taiwan on the Tuesday morning — allow 3–5 business days'] },
      ],
      decisions: ['Five days, not two: the stop resets the 30-day mainland clock, and TECO needs 3–5 business days for the Taiwan visas'],
    },
    {
      id: 'china-e2', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-11-28', end: '2026-12-06', days: 8,
      theme: 'Cantonese opening, Pearl Delta friends, Shenzhen exit',
      intro: 'Second mainland block, deliberately short: eight days across the Pearl River Delta. A Cantonese blitz in Guangzhou straight off the Hong Kong HSR, then six nights in Shenzhen — four with friends, two more once they leave — before the direct Shenzhen → Kuala Lumpur flight on Dec 6. The mainland stay is nine days, comfortably inside the 30-day visa-free entry.',
      tldr: 'Guangzhou · Shenzhen',
      weather: { hi: 22, lo: 14, label: 'Subtropical south, mostly dry, 22°/14°', emoji: '🌉', rainyDays: 4 },
      photos: ['guangzhou canton tower aerial'],
      places: [
        { name: 'Guangzhou', photo: 'guangzhou canton tower', days: 2, query: 'Shamian Island, Guangzhou',
          plan: 'Two days of Cantonese eating — morning dim sum where it was born, roast goose from a proper siu mei shop — with Shamian\'s arcades, the Chen Clan Academy and Canton Tower at night between meals.',
          notes: ['Nov 28 is the second visa entry — it restarts the 30 days'] },
        { name: 'Shenzhen', photo: 'huaqiangbei', days: 6, query: 'Shekou, Shenzhen',
          plan: 'Six nights built around friends: four days together, then two quieter ones once they go — Huaqiangbei\'s electronics floors, OCT-LOFT\'s galleries, Nantou\'s old town, Lianhuashan for the skyline, and Shekou for the sea.', },
      ],
      decisions: ['Macau cut: two nights bought a ferry and a second airport for a chapter that ended in transit, and Shenzhen already had the bed and the friends', 'Eight days, one 30-day entry: this block is a bridge between Hong Kong and Malaysia, not a destination on its own'],
    },
    {
      id: 'malaysia', kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2026-12-06', end: '2026-12-14', days: 8,
      theme: 'KL decompression + Langkawi beach before the Andaman',
      intro: 'Eight nights, two bases: Kuala Lumpur for four as the soft landing after the Pearl Delta — Petronas, Batu Caves, Jalan Alor — then a 35-minute hop to Langkawi for four beach days, which doubles as the launchpad for the 90-minute cross-border ferry straight to Koh Lipe.',
      tldr: 'Kuala Lumpur · Langkawi',
      weather: { hi: 32, lo: 24, label: 'KL wet season → Langkawi dry, 32°/24°', emoji: '🍜', rainyDays: 5 },
      photos: ['petronas towers night'],
      places: [
        { name: 'Kuala Lumpur', photo: 'batu caves rainbow steps', days: 4, query: 'Petronas Twin Towers, KL',
          plan: 'A soft landing after the Pearl Delta: hawker food on Jalan Alor, the Petronas towers from KLCC park after dark, Batu Caves\' rainbow steps in the morning, Merdeka 118, and Bukit Bintang\'s coffee. A decompression, not a checklist.', },
        { name: 'Langkawi', photo: 'langkawi beach', days: 4, query: 'Pantai Cenang, Langkawi',
          plan: 'Four beach days between Pantai Cenang and the quieter Tanjung Rhu, the SkyCab and Sky Bridge over the rainforest, a Kilim mangrove boat and duty-free sunsets. Very little is scheduled on purpose.',
          notes: ['Dec 14: 90min ferry from Telaga Harbour — Thai immigration is on the beach'] },
      ],
      decisions: ['Langkawi is the only clean bridge to Koh Lipe — a 90-minute ferry against a seven-hour van-and-boat via Pak Bara', 'Penang stays cut: it needs five nights to be worth the move, and Taiwan already covers the slow food city'],
    },
    {
      id: 'thailand', kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Thailand',
      start: '2026-12-14', end: '2026-12-29', days: 15,
      theme: 'Andaman island-hopping, then Bangkok for the peak days',
      intro: 'Fifteen days in peak Andaman dry season: step off the 90-minute Langkawi ferry onto Koh Lipe\'s turquoise beaches, hop north by speedboat to Ko Lanta for a quiet Christmas and eight unhurried nights, then move to Bangkok for the three peakest days of the Thai season — a city that absorbs the holiday instead of buckling under it, and in its best weather of the year. Bangkok earns its place here on logistics and comfort, not novelty.',
      tldr: 'Koh Lipe · Ko Lanta · Bangkok',
      weather: { hi: 31, lo: 23, label: 'Andaman peak dry season, 31°/23°', emoji: '🏝️', rainyDays: 2 },
      photos: ['koh lipe tropical beach'],
      places: [
        { name: 'Koh Lipe', photo: 'koh lipe beach', days: 4, query: 'Sunrise Beach, Koh Lipe, Thailand',
          plan: 'Off the ferry straight onto the sand: four days between Sunrise and Pattaya beach, one longtail day out around Koh Adang and Koh Rawi\'s soft coral, and walking-street dinners. Arriving ahead of the Christmas peak means the island is still at its calmest.', },
        { name: 'Ko Lanta', photo: 'koh lanta beach', days: 8, query: 'Ko Lanta, Krabi, Thailand',
          plan: 'Eight slow nights on the Andaman\'s most laid-back big island: long, half-empty sand at Long Beach and Kantiang, a Koh Rok and Koh Haa day trip for reef sharks and coral, a moped up to the old town\'s stilt houses and the national-park lighthouse, and a quiet Christmas — Lanta\'s New Year is the busy one, and this plan is gone by then.',
          notes: ['Dec 26: ferry and van to Krabi airport (~2.5–3h) before the afternoon flight — a half-day cost'] },
        { name: 'Bangkok', photo: 'bangkok wat arun', days: 3, query: 'Talad Noi, Bangkok',
          plan: 'Three days in the city\'s best weather, eating rather than sightseeing: Charoenkrung and Talad Noi\'s shophouse restaurants, Yaowarat at night, Ari\'s cafés, a river ferry to ICONSIAM, and a proper Thai massage before Taiwan.', },
      ],
      decisions: ['In by ferry at Koh Lipe, out by air from Bangkok — the Andaman threaded south to north with no airport backtracking', 'Bangkok rather than Railay for Dec 26–29: Railay is at its absolute peak, sold out at two to three times the price; the city has capacity and better weather', 'Christmas on Ko Lanta, which keeps it quiet — the NYE countdown is skipped entirely by leaving on the 29th'],
    },
    {
      id: 'taiwan', kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2026-12-29', end: '2027-01-13', days: 15,
      theme: 'Warm, dry south-to-north sweep: Kaohsiung NYE, Tainan food, Alishan clouds, Taipei',
      intro: 'Fifteen days running south-to-north through Taiwan in its dry winter: land in Kaohsiung with two clear days before a warm, uncrowded harbour countdown, graze Tainan for four days (arguably the best street food in the Chinese-speaking world), climb to Alishan for the January sea of clouds, and finish in Taipei for museums, hot springs and the departure to Osaka. Deliberately avoids the Taipei 101 crush: NYE here is a harbour-front fireworks show with room to stand, 20°C and dry.',
      tldr: 'Kaohsiung (NYE) · Tainan · Alishan · Taipei',
      weather: { hi: 22, lo: 14, label: 'Dry mild south → cooler drizzly north, 22°/14°', emoji: '🏮', rainyDays: 6 },
      photos: ['taipei 101 elephant mountain'],
      places: [
        { name: 'Kaohsiung', photo: 'kaohsiung harbor', days: 4, query: 'Kaohsiung Harbor, Taiwan',
          plan: 'Two clear days before New Year\'s Eve — Pier-2\'s warehouses, Cijin by ferry for the sunset, the dragon and tiger pagodas at Lotus Pond — then the harbour fireworks at midnight: 200–400k people with room to stand, warm and dry, and a walk home afterwards.',
          notes: ['NYE at the port draws 200–400k with room to stand, against Xinyi\'s million'] },
        { name: 'Tainan', photo: 'tainan chihkan tower', days: 4, query: 'Chihkan Tower, Tainan',
          plan: 'Four days of street food and temples, after the domestic New Year crowds have gone: Guohua and Shennong streets after dark, beef soup for breakfast, Chihkan Tower and the Confucius Temple, Anping\'s fort and treehouse, and the Sicao mangrove tunnel by boat.', },
        { name: 'Alishan', photo: 'alishan sea of clouds', days: 2, query: 'Alishan National Forest Recreation Area, Taiwan',
          plan: 'Two nights at 2,200m in the red cypress forest: the sunrise train to Chushan above the clouds, the Giant Trees trail, high-mountain oolong at a tea house, and the sea of clouds January is supposed to deliver.',
          notes: ['The lodge is the scarce booking; the forest railway opens 14 days out, 06:00 sharp'] },
        { name: 'Taipei', photo: 'taipei taiyuan road', days: 5, query: 'Xinyi District, Taipei',
          plan: 'The departure city, not the NYE one: the National Palace Museum\'s jade and bronzes, Dihua Street\'s old shopfronts, Beitou\'s hot springs on a wet afternoon, Jiufen at dusk on a weekday, and Raohe or Ningxia for dinner.',
          notes: ['National Palace Museum shut Mondays'] },
      ],
      decisions: ['NYE in Kaohsiung, not Taipei: 200–400k people with room to stand, against a million in Xinyi', 'South to north — warm, dry Kaohsiung and Tainan first, Taipei last as the departure hub', 'Two clear days in Kaohsiung before the 31st, so a delayed flight cannot cost the countdown', 'Tainan after Jan 3, once Taiwan\'s domestic New Year travel is over'],
    },
    {
      id: 'japan', kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan',
      start: '2027-01-13', end: '2027-02-24', days: 42,
      theme: 'Empty temples, snow villages, blue-sky Mt. Fuji + two powder bases',
      intro: 'One fused six-week winter chapter (90-day visa-free for BR ePassports): land at Kansai directly from Bangkok, open in Kyoto for empty winter temples and early plum, Osaka for food and Nara, then head into the snowy Hida Alps (Takayama + Shirakawa-go) and across to Hakone/Kawaguchiko for Mt. Fuji in peak January blue skies before Tokyo absorbs CNY week (Feb 5–12). Close with two back-to-back snow bases — Nozawa Onsen (5n) and Myoko Kogen + Madarao (9n, Feb 14–23) — with 13–15m of Sea of Japan powder and a fraction of Hakuba\'s crowds.',
      tldr: 'Kyoto · Osaka · Takayama/Shirakawa-go · Hakone/Mt. Fuji · Tokyo (CNY) · Nozawa + Myoko powder',
      weather: { hi: 8, lo: -3, label: 'Crisp sunny Pacific + deep Alps powder, 8°/-3°', emoji: '🏂', rainyDays: 6 },
      photos: ['fushimi inari'],
      places: [
        { name: 'Kyoto', photo: 'kyoto autumn maple', days: 8, query: 'Kitano Tenmangu, Kyoto',
          plan: 'Eight days in an empty winter city: Fushimi Inari\'s gates at dawn, Arashiyama and Tenryu-ji early, the Philosopher\'s Path without a queue, Nishiki market for lunch, Kurama\'s onsen on a cold day, and plum opening at Kitano Tenmangu at the end of the month. Eight nights is what allows a recurring café and structured mornings instead of a temple sprint.',
          notes: ['Jan 13: KIX to Kyoto on the Haruka express — the airport train with no transfer'] },
        { name: 'Osaka', photo: 'osaka dotonbori', days: 4, query: 'Dotonbori, Osaka',
          plan: 'Crab season in Dotonbori, kushikatsu in Shinsekai, Kuromon market in the morning, Osaka Castle\'s grounds, and a Nara day trip for deer and Todai-ji. Four nights is enough to eat well twice a day.',
          notes: ['Jan 25: Hida Wide View to Takayama — point-to-point tickets beat a 21-day JR Pass'] },
        { name: 'Takayama + Shirakawa-go', photo: 'shirakawa-go snow', days: 3, query: 'Shirakawa-go, Gifu, Japan',
          plan: 'Three nights in the Hida Alps: Shirakawa-go\'s gassho farmhouses under snow at dusk, Takayama\'s Sanmachi streets, sake breweries and Miyagawa morning market, Hida beef, and one ryokan night with an onsen.', },
        { name: 'Hakone + Mt. Fuji', photo: 'mount fuji winter', days: 3, query: 'Lake Kawaguchiko, Yamanashi, Japan',
          plan: 'The Pacific side in its clearest month: Fuji from Kawaguchiko and Chureito Pagoda, the Hakone Open-Air Museum, Owakudani\'s sulphur vents, a boat across Lake Ashi, and onsen with the mountain in the window.', },
        { name: 'Tokyo', photo: 'tokyo shimokitazawa', days: 9, query: 'Shimokitazawa, Tokyo',
          plan: 'Nine nights that absorb CNY week without trying: Shimokitazawa\'s vintage shops and live houses, Yanaka\'s lanes, Tsukiji\'s outer market for breakfast, the Nezu and Hokusai museums, a Kamakura and Enoshima day trip, and the odd aimless neighbourhood.', },
        { name: 'Nozawa Onsen', photo: 'nozawa onsen snow', days: 5, query: 'Nozawa Onsen, Nagano, Japan',
          plan: 'A classic onsen village with 13 free public baths, the Yu Road walkway up to the gondola, and three or four ride days on wide intermediate runs plus one rest day — the snow will still be there. Evenings are izakaya, ramen and a walk between baths.', },
        { name: 'Myoko Kogen + Madarao', photo: 'hakuba snowboarding', days: 9, query: 'Akakura Onsen, Myoko, Niigata, Japan',
          plan: 'Five empty weekdays on snow — gentle progression at Akakura Onsen, tree runs and bowls at Madarao, Seki Onsen for the steep quiet — then two onsen rest days before the domestic weekend arrives. Akakura is a walkable village: lodges, izakaya, and lifts at the end of the street.',
          notes: ['Rent everything locally, boots included; reserve sizes ahead', 'English lessons at Myoko Snowsports; Seki Onsen for the quiet'] },
        { name: 'Tokyo', days: 1, query: 'Tokyo Station, Japan',
          plan: 'One night to catch the flight: off the Shinkansen, repack, and out.', },
      ],
      decisions: ['Hakone and Fuji replace Kanazawa: late January is the Pacific side\'s clearest month (~80% visibility), and Takayama still delivers the deep-snow villages', 'Two snow bases instead of one: Nozawa\'s onsen village and gentle slopes first, then Myoko\'s booked week and Madarao\'s tree runs', 'CNY week lands in Tokyo by design — a big city absorbs the domestic surge, and Myoko starts after it', 'Point-to-point Shinkansen tickets only: a 21-day JR Pass would waste money on a route this slow and base-heavy'],
    },
    {
      id: 'indonesia-a', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-02-24', end: '2027-03-21', days: 25,
      theme: 'Java temples in Ramadan calm, Bali staging, then the best diving on Earth',
      intro: 'Fly in from Tokyo Feb 24 on the 30-day free entry (exit Mar 21, ~26 days used). Ramadan-quiet Java — Borobudur without crowds, night markets after dark — then a Nyepi silent day in Ubud and a domestic hop to Sorong Mar 10. Board Mar 11, off the boat Mar 20, fly to Borneo the next morning — zero international stress until then.',
      tldr: 'Jakarta · Yogyakarta · Ubud · Raja Ampat liveaboard',
      weather: { hi: 32, lo: 25, label: 'Wet-tail Java/Bali → Raja mid-season, 32°/25°', emoji: '🐠', rainyDays: 6 },
      photos: ['manta ray indonesia'],
      places: [
        { name: 'Jakarta', photo: 'jakarta monas', days: 2, query: 'Jakarta, Indonesia',
          plan: 'Two nights to land: Monas and Kota Tua\'s Dutch square, the Ramadan evening food markets, and a first taste of Indonesia before the train east.',
          notes: ['Feb 24: the 30-day free entry starts here; exit by Mar 21'] },
        { name: 'Yogyakarta', photo: 'borobudur sunrise', days: 4, query: 'Borobudur, Yogyakarta',
          plan: 'Borobudur at sunrise without the crowd Ramadan empties out, Prambanan\'s temples at golden hour, the Kraton and Malioboro, and the kampung night markets once the fast breaks. Jogja is also where the pace drops again after Japan.',
          notes: ['Daytime food through malls and hotels; warungs are curtained', 'Earplugs for the 3am sahur drums', 'Fly to Bali by Mar 2 — the mudik starts after that'] },
        { name: 'Ubud', photo: 'bali ubud rice terrace', days: 8, query: 'Ubud, Bali',
          plan: 'Eight slow days before the boat: Tegallalang\'s terraces at dawn, Tirta Empul\'s spring baths, the Monkey Forest, massage most afternoons, and a gear check on day six. Nyepi shuts the whole island for a day, which from Ubud is a gift.',
          notes: ['Mar 8: Nyepi — hotel-only, and the airport closes'] },
        { name: 'Sorong (pre-boat)', days: 1, query: 'Sorong, West Papua',
          plan: 'A transit night, already inside the country, with nothing to do but sleep before boarding.', },
        { name: 'Raja Ampat Liveaboard', photo: 'manta ray cleaning station', days: 9, query: 'Wayag, Raja Ampat',
          plan: 'Nine nights on a liveaboard through the best reef on earth: Wayag\'s karst islands and the Pianemo viewpoint, Cape Kri\'s record fish count, Manta Sandy\'s cleaning station, Melissa\'s Garden\'s hard coral, and the walking sharks and pygmy seahorses that make the checklists.',
          notes: ['Mar 11–20 on the boat; the operator\'s run ends in Sorong, not at the Mar 21 flight'] },
        { name: 'Sorong (post-boat)', days: 1, query: 'Sorong, West Papua',
          plan: 'Off the boat, repack the gear, one last Papua meal and an early night.', },
      ],
    },
    {
      id: 'borneo', kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysian Borneo',
      start: '2027-03-21', end: '2027-03-31', days: 10,
      theme: 'Sabah wildlife + the Indonesia visa reset',
      intro: 'The other Malaysia — 2,000 km east and three months after the Penang/Langkawi run. Fly in from Sorong Mar 21: a reef-to-rainforest switch right after the Raja Ampat apex, and the exit resets Indonesia\'s 30-day clock for the second stay. Proboscis monkeys, pygmy elephants bathing at dawn, orangutans at Sepilok. Late March sits in the Mar–May prime wildlife window.',
      tldr: 'KK · Sepilok · Kinabatangan River · Manila next',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧', rainyDays: 6 },
      photos: ['borneo orangutan'],
      places: [
        { name: 'Kota Kinabalu', photo: 'kk city mosque', days: 2, query: 'Kota Kinabalu, Sabah',
          plan: 'Two nights between the reef and the rainforest: the waterfront sunset, the Filipino night market, and a slow day in a city that is mostly a gateway.' },
        { name: 'Sepilok + Sandakan', photo: 'sepilok', days: 1, query: 'Sepilok Orangutan Centre',
          plan: 'Orangutans at the morning feeding platform, the sun bears next door, then straight inland to the river.',
          notes: ['Both centres sit on the same road out of Sandakan'] },
        { name: 'Kinabatangan River', photo: 'kinabatangan river', days: 5, query: 'Kinabatangan River, Sabah',
          plan: 'Five nights on the river: proboscis monkeys in the trees, pygmy elephants at dawn, hornbills, kingfishers and crocodiles on the banks, fireflies after dark, and gibbons at first light from a jungle lodge.',
          notes: ['Mar 26 Good Friday is a Sabah holiday — the lodges operate'] },
        { name: 'Kota Kinabalu', photo: 'kk city mosque', days: 2, query: 'Tunku Abdul Rahman Park, Kota Kinabalu',
          plan: 'Back to the coast for a snorkel day in the Tunku Abdul Rahman park and a seafood goodbye.', },
      ],
    },
    {
      id: 'philippines', kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-03-31', end: '2027-04-14', days: 14,
      theme: 'Post-Easter Palawan: wrecks at peak vis, glassy lagoons, sardines',
      intro: 'Arrive from Borneo Mar 31 into the post-Holy Week lull — the single best Palawan window: flat seas, 20m+ visibility, crowds gone. Coron wrecks first (nitrogen-correct), El Nido lagoons, Moalboal sardines, then hop to Bali Apr 14. Fourteen days inside the 30-day visa-free.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal (post-Easter)',
      weather: { hi: 33, lo: 25, label: 'Hot dry peak, 33°/25°', emoji: '🏝️', rainyDays: 1 },
      photos: ['el nido lagoon'],
      places: [
        { name: 'Manila', photo: 'intramuros manila', days: 2, query: 'Intramuros, Manila',
          plan: 'Two nights to reset the dive gear, walk Intramuros\' walls at dusk, and eat properly before the islands.', },
        { name: 'Coron', photo: 'coron kayangan lake', days: 5, query: 'Coron, Palawan, Philippines',
          plan: 'Five days of wreck diving — the Okikawa Maru, Irako and Akitsushima — with a check dive first, and Kayangan and Barracuda lakes, Twin Lagoon and CYC beach on the off-gassing day.',
          notes: ['Deep wrecks only after the check dive', 'Banca boats for the lakes and Twin Lagoon'] },
        { name: 'El Nido', photo: 'el nido big lagoon', days: 4, query: 'El Nido, Palawan',
          plan: 'Four days of island hopping: the Big and Small lagoons, Cadlao, Snake Island\'s sandbar, and a second water day held back as the weather buffer. Nacpan for the empty twin beach and a sunset.' },
        { name: 'Cebu / Moalboal', photo: 'moalboal sardine run', days: 3, query: 'Moalboal, Cebu, Philippines',
          plan: 'The sardine run at Pescador, turtles off the beach at dawn, and Kawasan\'s canyoneering if there is time — the apex diving was already Raja\'s.',
          notes: ['Apr 14: fly to Denpasar via Manila — Entry 2 starts; the Singapore ticket is in hand'] },
      ],
    },
    {
      id: 'indonesia-b', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-04-14', end: '2027-05-01', days: 17,
      theme: 'Cliffs, dragons, drift dives, volcano — second stay',
      intro: 'Second stay (17 days — fresh visa-free entry from Apr 14, no extension needed). Pick up where Raja left off: Nusa Penida mantas, Komodo dragons and drift dives, then Bali rice terraces and a volcano at 3am before the hop to Singapore May 1.',
      tldr: 'Nusa Penida · Komodo · Batur',
      weather: { hi: 32, lo: 24, label: 'Dry season building, 32°/24°', emoji: '🐉', rainyDays: 4 },
      photos: ['kelingking beach trex'],
      places: [
        { name: 'Sanur (arrival night)', days: 1, query: 'Sanur, Bali',
          plan: 'An arrival night on the beach path, from where the Penida boat leaves in the morning.' },
        { name: 'Nusa Penida', photo: 'broken beach', days: 3, query: 'Kelingking Beach, Nusa Penida',
          plan: 'Three days on scooters: Kelingking\'s cliff, Angel\'s Billabong and Broken Beach, Crystal Bay for the mantas at first light, and Atuh on the quiet east coast.', },
        { name: 'Komodo', photo: 'komodo dragon', days: 7, query: 'Komodo National Park',
          plan: 'Seven days out of Labuan Bajo: mantas at Manta Point, the drift at Crystal Rock and Castle Rock, Batu Bolong\'s coral, Pink Beach, dragons with a ranger at Rinca, and Padar at sunrise — phinisi boats and harbour dinners in between.', },
        { name: 'Bali + Volcano', photo: 'mount batur sunrise', days: 6, query: 'Ubud, Bali',
          plan: 'Back to Bali for the last stretch: Tanah Lot at sunset, a Canggu evening, the rice terraces at Sidemen, and Batur at 3am for the crater rim at sunrise.', },
      ],
    },
    {
      id: 'singapore', kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-05-01', end: '2027-05-06', days: 5,
      theme: 'World-class food, modern wonder, city recharge',
      intro: 'Effective recharge hub: clean, organized, excellent food infrastructure, everything works.',
      tldr: 'Hawker centres · Gardens by the Bay · Marina Bay',
      weather: { hi: 31, lo: 25, label: 'Hot + humid', emoji: '🌳', rainyDays: 4 },
      photos: ['gardens by the bay supertree'],
      places: [
        { name: 'Singapore', photo: 'marina bay sands night', days: 5, query: 'Marina Bay, Singapore',
          plan: 'Five days of hawker centres and air conditioning, sitting out China\'s Golden Week: Maxwell and Lau Pa Sat, Old Airport Road, Gardens by the Bay after dark, the Marina Bay deck, Little India and Haji Lane, and the National Gallery\'s Southeast Asian rooms.', },
      ],
    },
    {
      id: 'china-spring', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2027-05-06', end: '2027-06-02', days: 27,
      theme: 'May sweet spot: Xi\'an walls, Sichuan pandas + hotpot, Avatar pillars & lantern towns',
      intro: 'Twenty-seven days in the May sweet spot: in on May 6, as the Labor Day peak clears, and out three weeks before the Meiyu rains settle on Sichuan and Hunan. Xi\'an under crisp spring skies, high-speed rail to Chengdu and Chongqing for pandas and Yangtze nights at 24–26°C, then Zhangjiajie\'s sandstone pillars and Fenghuang\'s river lanterns — finishing in Shanghai, warm in May and a far better hub than Changsha.',
      tldr: 'Xi\'an · Chengdu · Chongqing · Zhangjiajie · Fenghuang · Shanghai',
      weather: { hi: 26, lo: 17, label: 'Prime late spring, 26°/17° (pre-plum-rain)', emoji: '🐉', rainyDays: 6 },
      photos: ['xian terracotta warriors'],
      places: [
        { name: 'Xi\'an', photo: 'xian city wall', days: 5, query: 'Terracotta Warriors, Xi\'an',
          plan: 'Five days inside the walls: the Terracotta Warriors on a morning slot, the wall itself by bike, the Muslim Quarter at night for lamb skewers and biangbiang noodles, the Wild Goose Pagoda and Tang Paradise, and Huashan as a day trip if the legs still want granite and plank walks.',
          notes: ['May 6: arrive as Golden Week clears — the city is a day past its peak'] },
        { name: 'Chengdu', photo: 'chengdu panda', days: 5, query: 'Chengdu Panda Base',
          plan: 'Pandas at opening, then the day trips — Sanxingdui\'s bronze masks, the Leshan Buddha — with People\'s Park teahouses, Wenshu monastery, Jinli and Kuanzhai in the evenings, and hotpot more than once.',
          notes: ['Panda base opens 07:30; May mornings are cool and the bears active'] },
        { name: 'Chongqing', photo: 'chongqing cyberpunk night', days: 4, query: 'Chongqing, China',
          plan: 'A mountain megacity in mild spring: Hongyadong from Qiansimen bridge at night, the Yangtze cable car, the monorail running through the building at Liziba, Ciqikou\'s old town, and hotpot until it stops being a novelty.', },
        { name: 'Zhangjiajie + Tianmen', photo: 'zhangjiajie avatar pillars', days: 4, query: 'Zhangjiajie National Park',
          plan: 'Four days among the sandstone pillars: Yuanjiajie\'s viewpoints and the First Bridge under Heaven, Tianzi Mountain, the Golden Whip Stream walk, then Tianmen\'s cable car and the 999 steps.',
          notes: ['Bailong Elevator and the glass bridge are separate tickets'] },
        { name: 'Fenghuang + Furong', photo: 'fenghuang riverside', days: 3, query: 'Fenghuang Ancient Town, China',
          plan: 'Furong\'s waterfall through the stilt houses first, then Fenghuang at dusk — lanterns on the Tuo, the Hong Bridge, the diaojiaolou houses — and two days of not climbing anything.', },
        { name: 'Changsha (buffer)', days: 1, query: 'Changsha, China',
          plan: 'A laundry-and-last-Hunan-meal night between trains — the one stop on the route that exists purely for logistics.', },
        { name: 'Shanghai', photo: 'shanghai bund night', days: 5, query: 'The Bund, Shanghai',
          plan: 'Five days in the city\'s best month: the Bund at night, Yu Garden, Tianzifang and M50, the French Concession at lunch, the Shanghai Museum East, and a Suzhou day trip for the gardens at spring green.',
          notes: ['Suzhou is 25min from Hongqiao — a day trip, not a move'] },
      ],
      decisions: ['In on May 6, as Labor Day clears; out on Jun 2, ahead of Dragon Boat and the Meiyu plum rains', 'May, not June: Chengdu, Chongqing, Zhangjiajie and Fenghuang at 23–26°C and roughly 40% less rain', 'Shanghai ends the chapter as the departure hub, with Suzhou a 25-minute day trip rather than a second city', 'Chongqing → Zhangjiajie → Fenghuang → Changsha → Shanghai runs on direct HSR, with Guilin and Longji dropped'],
    },
    {
      id: 'korea', kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2027-06-02', end: '2027-06-16', days: 14,
      theme: 'Sunny early-summer finale: Jeju volcanic coast, Busan sea, Gyeongju + Seoul',
      intro: 'Fourteen days to close the sabbatical in sunny, pre-monsoon weather (24–26°C, two full weeks before Korea\'s late-June Jangma rains): start in the south on Jeju Island, hop to Busan\'s coast and Gyeongju\'s royal tombs, then finish with six nights in Seoul so the long-haul flight home to Brazil departs directly from Incheon with zero last-day domestic transit stress.',
      tldr: 'Jeju · Busan · Gyeongju · Seoul',
      weather: { hi: 25, lo: 16, label: 'Sunny late spring / early summer, 25°/16°', emoji: '🌸', rainyDays: 5 },
      photos: ['myeongdong night market'],
      places: [
        { name: 'Jeju', photo: 'jeju yongmeori', days: 3, query: 'Jeju Island, South Korea',
          plan: 'Three days on the volcanic island: Yongmeori\'s cliffs and Sanbangsan, Seongsan Ilchulbong at sunrise, Udo by ferry, the Jusangjeolli columns, and Hallasan\'s lower trails.', },
        { name: 'Busan', photo: 'busan gamcheon', days: 3, query: 'Gamcheon Culture Village, Busan',
          plan: 'Gamcheon\'s hillside lanes, Haeundae and Gwangalli on foot, Jagalchi market and BIFF street food, Haedong Yonggungsa at dawn, and the bridge lit at night.', },
        { name: 'Gyeongju', photo: 'gyeongju temple', days: 2, query: 'Bulguksa Temple, Gyeongju',
          plan: 'Two days of royal tombs and temples: Bulguksa and Seokguram, the Daereungwon mounds, Hwangridan-gil\'s cafés, and Wolji pond lit at dusk.', },
        { name: 'Seoul', photo: 'seoul deoksugung autumn', days: 6, query: 'Bukchon Hanok Village, Seoul',
          plan: 'Six final nights: the palaces at opening, Bukchon\'s hanok mornings, Ikseon-dong and Seongsu-dong for coffee, Gwangjang market and Euljiro\'s pocha alleys at night, a Han River picnic, and the DMZ or Suwon if the mood takes you.',
          notes: ['Gyeongbokgung shuts Tuesdays, Changdeokgung Mondays', 'Jun 16: AREX to Incheon for the flight home'] },
      ],
      decisions: ['Korea last because it stays 24–26°C and dry until the Jangma monsoon arrives in late June', 'South to north, so the final six nights are in Seoul — one AREX ride to Incheon for the long-haul home'],
    },
  ];

  // Bookings live in todo-data.js — the single todo ledger. Nothing here.

  // Budget — full-trip model, USD for two travelers (couple).
  // Per-chapter parts are researched estimates (see notes); the three locked
  // costs came from actual bookings/quotes. Totals are COMPUTED in the UI
  // (BudgetView) from these parts — never hardcoded — so edits stay consistent.
  const budget = {
    currency: 'USD',
    basis: 'couple · 360 days · mid-range with strategic splurges',
    fxBRL: 5.2,
    estimate: 'USD ~94.1k for two',
    perDay: '~USD 262/day for two',
    inBRL: '~R$245k per person at R$5.20',
    contingencyPct: 8,
    // Confirmed figures — do not re-estimate.
    locked: [
      { item: 'GRU–YYZ–ATH flights (2 pax)', cost: 1700, note: 'Bought ✅ — long-haul positioning into the trip' },
      { item: 'Raja Ampat liveaboard 10d (2 pax)', cost: 8400, note: 'Quoted/held — the trip splurge' },
      { item: 'Annapurna Base Camp trek, Discovery World (2 pax)', cost: 1440, note: 'Booked ✅ — $720pp, paid in full ($144 advance + $1,296 balance Oct 24); guide + porter + teahouses + meals on trail' },
      { item: 'Cumbuco Airbnb, 1 month', cost: 1900, note: 'Actual — paid' },
      { item: 'Greece ferries, 4 legs (2 pax)', cost: 770, note: 'Booked ✅ — €685 actual' },
      { item: 'Petrópolis–Teresópolis trail (2 pax)', cost: 770, note: 'Actual — R$4,000' },
      { item: 'Diving certs AOW + Nitrox (2 pax)', cost: 960, note: 'Actual — R$5,000' },
      { item: 'Rio Airbnb, Jun 21–Jul 19', cost: 1350, note: 'Actual — R$7,000' },
      { item: 'São Paulo Airbnb, Aug 19–26', cost: 270, note: 'Actual — R$1,400' },
      { item: 'Varanasi Airbnb, Oct 17–21 (4n)', cost: 208, note: 'Actual — R$1,081 (~$208 at R$5.20)' },
      { item: 'Kathmandu → Beijing flight Nov 7 (2 pax)', cost: 477, note: 'Actual — $477 for two' },
      { item: 'Kathmandu hotel, Oct 21–25 (4n)', cost: 171, note: 'Booked ✅ — $171 pre-trek' },
      { item: 'Kathmandu hotel, Nov 4–7 (3n)', cost: 129, note: 'Booked ✅ — $129 post-trek' },
      { item: 'Beijing stay, Nov 7–15 (8n)', cost: 472, note: 'Booked ✅ — $472 total for the 8 nights (was $528 at 9n; 9th night released)' },
      { item: 'Huangshan stay, Nov 15–18 (3n)', cost: 84, note: 'Booked ✅ — $84 total, Tangkou (Zhaixi end), $28/n' },
      { item: 'Hongcun stay, Nov 18–19 (1n)', cost: 60, note: 'Booked ✅ — $60, inside the village' },
      { item: 'Hangzhou stay, Nov 19–23 (4n)', cost: 156, note: 'Booked ✅ — $156 total, Wulin Square / West Lake Cultural Square, $39/n' },
      { item: 'Hangzhou → Hong Kong flight Nov 23 (2 pax)', cost: 183, note: 'Booked ✅ — $183, 08:00–10:40, includes the HK visa reset entry' },
      { item: 'Beijing → Huangshan HSR Nov 15 (2 pax)', cost: 176, note: 'Booked ✅ — G2553 07:17, 2nd class. The plan priced a ¥982-per-person fare; this is the cheaper morning service' },
      { item: 'Huangshan North → Hangzhou East HSR Nov 19 (2 pax)', cost: 33, note: 'Booked ✅ — G2396 13:30. The later train is what makes the Hongcun dawn and the Hangzhou afternoon both fit' },
      { item: 'Langkawi stay, Dec 10–14 (4n)', cost: 286, note: 'Booked ✅ — $71.50/n against the Malaysia line\'s $55/n' },
      { item: 'Koh Lipe stay, Dec 14–18 (4n)', cost: 369, note: 'Booked ✅ — $92.25/n against the Thailand line\'s $74.67/n' },
      { item: 'Ko Lanta stay, Dec 18–26 (8n, Christmas)', cost: 900, note: 'Booked ✅ — $112.50/n. Christmas week on the Andaman is the peak inside the peak' },
      { item: 'Kaohsiung stay, Dec 29–Jan 2 (4n, NYE)', cost: 431, note: 'Booked ✅ — $107.75/n. NYE harbour-front, where the plan already warned hotels go 2–3×' },
      { item: 'Alishan stay, Jan 6–8 (2n)', cost: 183, note: 'Booked ✅ — $91.50/n, inside the recreation area' },
      { item: 'Shenzhen stay, Nov 30–Dec 6 (6n)', cost: 249, note: 'Booked ✅ — $41.50/n, roughly half the $77.50 China E2 line; the mainland is cheap even on the Pearl Delta' },
      { item: 'Guangzhou stay, Nov 28–30 (2n)', cost: 78, note: 'Booked ✅ — $39/n, half the China E2 line; Cantonese opening weekend' },
      { item: 'Hong Kong stay, Nov 23–28 (5n)', cost: 570, note: 'Booked ✅ — $570, $114/n against the $150/n the chapter carried' },
      { item: 'Shenzhen → Kuala Lumpur flight Dec 6 (2 pax)', cost: 288, note: 'Bought ✅ — R$1,500 (~$288 at R$5.20)' },
      { item: 'Krabi → Bangkok flight Dec 26 (2 pax)', cost: 148, note: 'Bought ✅ — R$768 (~$148 at R$5.20); the peak-day penalty, $58 over the estimate' },
      { item: 'Bangkok → Kaohsiung flight Dec 29 (2 pax)', cost: 195, note: 'Bought ✅ — R$1,012 (~$195 at R$5.20)' },
    ],
    // Per-chapter estimates for two. lodging/food are chapter totals; transport
    // is in-chapter only (inter-chapter flights live in `flights` below).
    chapters: [
      { id: 'brasil', days: 66, lodging: 3520, food: 3150, transport: 1350, activities: 1930, fees: 0, note: 'Rio Airbnb R$7,000 + Cumbuco $1,900/mo + SP R$1,400 actual · trail + certs actual · internal flights Rio→Fortaleza + Fortaleza→SP ~$750' },
      { id: 'toronto', days: 5, lodging: 0, food: 450, transport: 150, activities: 50, fees: 0, note: "Friend's place · TTC + Islands ferry · mostly home meals" },
      { id: 'athens', days: 20, lodging: 1700, food: 1700, transport: 1230, activities: 570, fees: 0, note: 'Booked stays avg ~$85/n · 4 ferries €685 actual (~$770) · Chania car ~$240 · Kleftiko ~$260' },
      { id: 'turkey', days: 21, lodging: 1865, food: 1470, transport: 790, activities: 300, fees: 120, note: 'Göreme 3n + Alaçatı 3n + Şirince/Kaş/Akyaka + Istanbul 10n · balloon Sep 22/23 cancelled (weather), $480 refunded · car 8d ~$450 · e-visa' },
      { id: 'baku', days: 2, lodging: 0, food: 140, transport: 60, activities: 30, fees: 50, note: 'Stopover program — lodging free · ASAN e-visa · walkable old city' },
      { id: 'india', days: 7, lodging: 315, food: 315, transport: 190, activities: 120, fees: 55, note: 'Agra day trip Oct 15 · Varanasi train Oct 17 booked ✅ · Varanasi Airbnb R$1,081 · VNS→KTM $343 booked ✅ · Taj + forts + boats' },
      { id: 'nepal', days: 17, lodging: 300, food: 260, transport: 100, activities: 1440, fees: 100, note: 'Trek $1,440 locked w/ Discovery World ($720pp; $144 paid, $1,296 due Oct 24) · KTM 7n (pre 4n Oct 21–25 booked ✅ $171 + post 3n Nov 4–7 booked ✅ $129) · KTM→PEK Nov 7 ($477) · tips/visa cash' },
      { id: 'china-e1', days: 16, lodging: 1134, food: 1045, transport: 550, activities: 350, fees: 0, note: 'Beijing 8n Nov 7–15 (booked $472) + Tangkou 3n Nov 15–18 (booked $84) + Hongcun 1n Nov 18–19 (booked $60) + Hangzhou 4n Nov 19–23 (booked $156) — all 16 nights locked at $772 vs $1,134 est (−$362, $48.25/n) · G2553 Beijing South→Huangshan North $176 + G2396 Huangshan North→Hangzhou East $33, both booked · HGH→HKG $183 booked in flights · Suzhou moved to spring · Beijing activities actual so far: Mutianyu ¥400 + Forbidden City $31 + Universal Studios $119 + Huangshan entry ¥380 (~$53) = $259, with the Huangshan lifts (~$87) and Hongcun (~$26) still to come — this line is running over $350, so read it as ~$470' },
      { id: 'hk', days: 5, lodging: 750, food: 450, transport: 120, activities: 0, fees: 0, note: 'Booked ✅ Nov 23–28 at $570 ($114/n vs $150 est, −$180) · Peak tram + ferries + Lamma · free gardens/markets' },
      { id: 'china-e2', days: 8, lodging: 440, food: 520, transport: 120, activities: 120, fees: 0, note: 'Guangzhou 2n + Shenzhen 6n · all 8 nights booked: Guangzhou Nov 28–30 $78 + Shenzhen Nov 30–Dec 6 $249 — $327 vs $440 est (−$113, $40.88/n) · Macau cut — no ferry, no second airport · SZX→KUL direct Dec 6 bought ✅ R$1,500 (~$288, in flights)' },
      { id: 'malaysia', days: 8, lodging: 440, food: 320, transport: 190, activities: 70, fees: 0, note: 'KL 4n + Langkawi 4n · Langkawi booked Dec 10–14 at $286 ($71.50/n vs $55 est) · KL still open · KL→Langkawi flight · Langkawi is the ferry bridge to Koh Lipe' },
      { id: 'thailand', days: 15, lodging: 1120, food: 620, transport: 250, activities: 180, fees: 0, note: 'Koh Lipe 4n + Ko Lanta 8n + Bangkok 3n · Lipe booked Dec 14–18 $369 + Lanta booked Dec 18–26 $900 — 12 of 15 nights at $105.75/n vs $74.67 est, Christmas week doing most of it · Bangkok still open · Lipe→Lanta speedboat + Lanta→Krabi transfer still open · both flights bought: Krabi→Bangkok Dec 26 $148 + Bangkok→Kaohsiung Dec 29 $195 (in flights)' },
      { id: 'taiwan', days: 15, lodging: 1125, food: 675, transport: 300, activities: 200, fees: 0, note: 'Kaohsiung 4n + Tainan 4n + Alishan 2n + Taipei 5n · Kaohsiung booked Dec 29–Jan 2 $431 + Alishan booked Jan 6–8 $183 — 6 of 15 nights at $102.33/n vs $75 est, NYE doing most of it · Tainan + Taipei still open · HSR + Alishan forest railway + Kaohsiung/Tainan trains' },
      { id: 'japan', days: 42, lodging: 5460, food: 3990, transport: 700, activities: 2300, fees: 0, note: 'Cities/Alps/Fuji 28n ~$125/n · Nozawa 5n + Myoko Kogen + Madarao 9n · lift/rental/lessons across two snow bases · point-to-point trains' },
      { id: 'indonesia-a', days: 25, lodging: 850, food: 500, transport: 550, activities: 8600, fees: 0, note: 'Liveaboard $8,400 locked · JKT→JOG→DPS hops ~$260 + DPS→SOQ ~$250 · Ramadan Java + Nyepi Ubud staging · Entry 1 Feb 24–Mar 21 (26d)' },
      { id: 'borneo', days: 10, lodging: 1020, food: 200, transport: 520, activities: 60, fees: 0, note: 'Kinabatangan 3D2N ~$600 + 2 lodge nights (full board) · Sepilok fees · in from SOQ Mar 21, out BKI→MNL Mar 31' },
      { id: 'philippines', days: 14, lodging: 780, food: 690, transport: 450, activities: 1050, fees: 0, note: 'Manila 2n staging + gear prep · Coron 5d + El Nido 4d post-Easter peak vis · sardines (Malapascua dropped)' },
      { id: 'indonesia-b', days: 17, lodging: 760, food: 1120, transport: 450, activities: 1010, fees: 20, note: 'CEB→DPS in flights · Penida + Komodo dives Apr 15–25 · Batur · Bali levies · Entry 2 Apr 14–May 1 (17d)' },
      { id: 'singapore', days: 5, lodging: 700, food: 275, transport: 90, activities: 80, fees: 0, note: '~$140/n · hawker-first food · Gardens domes · waits out China May Day Golden Week' },
      { id: 'china-spring', days: 27, lodging: 1880, food: 1490, transport: 1450, activities: 520, fees: 0, note: 'May 6 – Jun 2 · XIY→CTU + CTU→CKG + CKG→DYG + Fenghuang→CSX→SHA HSR hops · pandas/Sanxingdui + pillars tickets · Shanghai 5n finale' },
      { id: 'korea', days: 14, lodging: 1750, food: 980, transport: 300, activities: 250, fees: 0, note: 'Jeju 3n + Busan 3n + Gyeongju 2n + Seoul 6n · CJU→PUS flight + KTX north · DMZ/Suwon · fly home from ICN Jun 16' },
    ],
    // Between-chapter flights for two (in-chapter transport stays above).
    // Every leg carries a `date` (departure day) so the calendar sync can
    // place flight blocks; totals are unchanged by leg splits.
    flights: [
      { route: 'São Paulo → Toronto', cost: 900, date: '2026-08-26', note: 'Bought ✅ (locked) — 21:35 departure, lands Toronto Aug 27; overnight, so the Canada chapter starts the next day' },
      { route: 'Toronto → Athens', cost: 800, date: '2026-08-31', note: 'Bought ✅ (locked), overnight, lands Sep 1' },
      { route: 'Athens → Cappadocia via IST', cost: 500, date: '2026-09-21', note: 'Bought ✅ (est.)' },
      { route: 'Istanbul → Baku', cost: 450, date: '2026-10-12', note: 'Bought ✅ (est.)' },
      { route: 'Baku → Delhi', cost: 550, date: '2026-10-14', note: 'Bought ✅ (est.)' },
      { route: 'Varanasi → Kathmandu (direct)', cost: 343, date: '2026-10-21', note: 'Bought ✅ ($343 for two), 08:30 direct' },
      { route: 'Kathmandu → Beijing', cost: 477, date: '2026-11-07', note: 'Late-night arrival; Entry 1 starts Nov 7' },
      { route: 'Hangzhou (HGH) → Hong Kong', cost: 183, date: '2026-11-23', note: 'Bought ✅ $183 — 08:00–10:40; HK visa reset next' },
      { route: 'Hong Kong → Guangzhou (HSR)', cost: 70, date: '2026-11-28', note: 'Estimate — West Kowloon → Guangzhou South direct, ~1h; Entry 2 starts' },
      { route: 'Shenzhen → Kuala Lumpur (direct)', cost: 288, date: '2026-12-06', note: 'Bought ✅ R$1,500 (~$288 at R$5.20) — direct SZX–KUL; Malaysia begins' },
      { route: 'Langkawi → Koh Lipe (ferry)', cost: 110, date: '2026-12-14', note: 'Estimate — 90-min cross-border ferry from Telaga Harbour; Thailand Andaman begins' },
      { route: 'Krabi → Bangkok', cost: 148, date: '2026-12-26', note: 'Bought ✅ R$768 (~$148 at R$5.20) — afternoon flight after the Lanta transfer. The $90 estimate was a normal-season fare; Dec 26 is the peak' },
      { route: 'Bangkok → Kaohsiung (direct)', cost: 195, date: '2026-12-29', note: 'Bought ✅ R$1,012 (~$195 at R$5.20) — direct BKK–KHH; Taiwan begins' },
      { route: 'Taipei → Osaka (direct)', cost: 300, date: '2027-01-13', note: 'Estimate — TPE–KIX ~2h45; Japan begins' },
      { route: 'Tokyo → Jakarta (direct)', cost: 500, date: '2027-02-24', note: 'Estimate — direct daily (ANA/JAL/Garuda), 30-day free entry starts' },
      { route: 'Denpasar → Sorong (via Makassar)', cost: 250, date: '2027-03-10', note: 'Estimate — domestic, book 6–8 wks ahead (Lebaran surge)' },
      { route: 'Sorong → Kota Kinabalu (via UPG/CGK)', cost: 400, date: '2027-03-21', note: 'Estimate — off-boat day' },
      { route: 'Kota Kinabalu → Manila (via KUL)', cost: 250, date: '2027-03-31', note: 'Estimate, AirAsia' },
      { route: 'Cebu → Denpasar (via MNL/SIN)', cost: 300, date: '2027-04-14', note: 'Estimate — daily, easy; Entry 2 starts' },
      { route: 'Bali → Singapore', cost: 200, date: '2027-05-01', note: 'Estimate, AirAsia' },
      { route: 'Singapore → Xi\'an (direct)', cost: 300, date: '2027-05-06', note: 'Estimate — Scoot direct ~5h30; China spring begins right after May Day Golden Week' },
      { route: 'Shanghai → Seoul (direct)', cost: 280, date: '2027-06-02', note: 'Estimate — PVG–ICN ~2h; South Korea finale begins' },
      { route: 'Seoul → São Paulo (return, unticketed)', cost: 1400, date: '2027-06-16', note: 'Estimate ~$700pp — 1-stop from Incheon (ICN); the trip ends here. The only modelled return leg; booking tracked as todo `korea-10` (due ~3 months out)' },
    ],
    extras: [
      { item: 'Health insurance, $150/mo × 12 months (couple)', cost: 1800, note: 'Covers the full trip, both travelers' },
      { item: 'eSIMs + trail/trek sundries', cost: 350, note: '~15 countries + thermals/laundry gaps' },
    ],
    assumptions: [
      'All figures USD for two; mid-range with strategic splurges, researched Oct 2026 prices',
      'China entries are 16 + 8 days (Hong Kong SAR reset between, all inside the 30d visa-free and pre-Dec-31-2026) — no visa needed; spring entry (May 6–28, 22d) needs one L visa (~$300 for two) unless the waiver renews',
      'Malaysia and Thailand visa-free, Korea K-ETA (~$8 pp); Taiwan visitor visa required for BR passports (~$50–160 pp, TECO Hong Kong filing Nov 24)',
      'Own kite gear in Cumbuco; mask + dive computer owned; snowboard kit rented at Nozawa Onsen and Myoko Kogen',
      'Free stays: Toronto (friends) and Azerbaijan (stopover program) — lodging paid elsewhere',
      'Inter-chapter flights are one-way advance fares; peak-season spikes are what the 8% contingency is for',
    ],
    levers: [
      'Diving is ~$12k of the total — fewer Coron/Komodo/Penida dive days saves $1,500+ fast',
      'Japan + Korea are ~$16k combined — business hotels + konbini breakfasts already assumed; ryokan splurge kept to zero',
      'Shoulder-season flights (booked early) and slow-travel lodging (weekly rates) are the two biggest structural savers',
      'Toronto + Azerbaijan avoid lodging costs; monthly rates in Rio/Cumbuco beat nightly prices',
    ],
  };

  // Packing notes
  const packing = [
    { layer: 'Base kit', items: 'Carry-on + 30L backpack only throughout' },
    { layer: 'Japan winter', items: 'Light thermal base layers from Beijing/Nepal. Rent ALL snowboard kit at Nozawa Onsen and Myoko Kogen.' },
    { layer: 'China May spring', items: 'Breathable layers + light rain shell for Zhangjiajie/Sichuan (mild 23–26°C in May, much cooler and drier than June).' },
    { layer: 'Beijing Wall day (mid-Nov)', items: 'Windproof shell + insulated boots over down/fleece bought in Kathmandu Thamel (sub-zero wind chill); pick the bluest morning' },
    { layer: 'Diving', items: 'Bring personal mask + computer. BCD/reg/wetsuit rented per site.' },
    { layer: 'Nusa Penida', items: 'Reef-safe sunscreen, rash guard, water shoes (rocky entry)' },
    { layer: 'Nepal trek', items: 'Rent trekking poles + sleeping bag liner in Kathmandu' },
  ];

  // Hand-authored calendar highlights: key attractions + car rentals.
  // Synced by the calendar integration alongside chapters + flights.
  // `end` is the inclusive last day.
  const calendarEvents = [
    { id: 'abctrek', title: 'Annapurna Base Camp trek', start: '2026-10-25', end: '2026-11-04', note: '11-day teahouse trek: Nayapul → ABC (4,130m) → Jhinu hot springs' },
    { id: 'rajaampatdiving', title: 'Raja Ampat Diving (liveaboard)', start: '2027-03-11', end: '2027-03-20', note: '10 days on the water: Wayag, Cape Kri, Manta Sandy' },
    { id: 'chaniacar', title: '🚗 Rental car — Chania', start: '2026-09-05', end: '2026-09-09', note: 'Return 8:30am Sep 9' },
    { id: 'izmircar', title: '🚗 Rental car — Izmir (ADB)', start: '2026-09-25', end: '2026-10-02', note: 'Pickup ~1am Sep 25 · return Oct 2 before the 19:45 flight' },
  ];

  // Ground + sea legs for the calendar sync. `date` is the departure day;
  // all-day events (end is exclusive, computed by calendar.jsx). Inter-chapter
  // flights stay in budget.flights; this list covers trains, buses, ferries and
  // in-chapter flights so every travel day reaches the calendar.
  const transports = [
    // Brasil — internal hops (travelled)
    { mode: 'flight', route: 'Rio de Janeiro → Fortaleza', date: '2026-07-20', note: 'In-chapter hop — Cumbuco next' },
    { mode: 'flight', route: 'Fortaleza → São Paulo', date: '2026-08-19', note: 'In-chapter hop — farewell week, then the Toronto flight Aug 26' },
    // Turkey — in-chapter flights inside the Aegean car loop
    { mode: 'flight', route: 'Kayseri → Izmir', date: '2026-09-24', note: 'In-chapter hop, 22:50 — car collected ~01:00 at ADB' },
    { mode: 'flight', route: 'Izmir → Istanbul', date: '2026-10-02', note: 'In-chapter hop, 19:45 — car returned at ADB first' },
    // Greece — ferries
    { mode: 'ferry', route: 'Rethymno → Santorini', date: '2026-09-12', note: 'Seasonal fast ferry (~2h)' },
    { mode: 'ferry', route: 'Santorini → Folegandros', date: '2026-09-14', note: 'Inter-island ferry' },
    { mode: 'ferry', route: 'Folegandros → Milos', date: '2026-09-16', note: 'Inter-island ferry' },
    { mode: 'ferry', route: 'Milos → Athens (Piraeus)', date: '2026-09-20', note: 'Ferry + buffer night before the Sep 21 flight' },
    // Nepal — tourist buses
    { mode: 'bus', route: 'Kathmandu → Pokhara', date: '2026-10-25', note: 'Tourist bus, 6–7h; lakeside briefing on arrival' },
    { mode: 'bus', route: 'Pokhara → Kathmandu', date: '2026-11-04', note: 'Tourist bus, 6–7h — back to Thamel' },
    // India
    { mode: 'train', route: 'Delhi → Varanasi', date: '2026-10-17', note: 'Early train (06:00) — booked ✅' },
    // China E1
    { mode: 'train', route: 'Beijing South → Huangshan North', date: '2026-11-15', note: 'G2553 07:17 — booked, $176 for two. 21min later than the G87 the plan priced, so the pre-dawn start stands and Tangkou is still reached the same afternoon; the mountain day is Nov 16, not today' },
    { mode: 'bus', route: 'Huangshan North → Tangkou', date: '2026-11-15', note: 'Station shuttle from the forecourt, ¥30, 45–60min, every 20–30min (06:30–19:00) — no connection to miss, in town by ~13:45. Taxi ¥130–160 the fallback. A direct station→Hongcun shuttle now also exists (~¥35, roughly hourly to mid-afternoon) if the order ever flips back' },
    { mode: 'bus', route: 'Tangkou → Hongcun', date: '2026-11-18', note: '09:00 from the Zhaixi transfer centre, ¥15–25, 50–70min — village ~10:15, ahead of the 09:30–15:00 coach peak' },
    { mode: 'bus', route: 'Hongcun → Huangshan North', date: '2026-11-19', note: '65–80min back to the station for the 13:30 train — leave Hongcun by ~11:15 for an hour of slack. The later train is what makes the village dawn, the 09:00 walk and Tunxi old street compatible; with the old late-morning service they were not' },
    { mode: 'train', route: 'Huangshan North → Hangzhou East', date: '2026-11-19', note: 'G2396 13:30 — booked, $33 for two. To East, not West (West adds 35min on Line 19); Hangzhou by mid-afternoon at the plan\'s ~1h30' },
    // China E2
    { mode: 'train', route: 'Guangzhou → Shenzhen', date: '2026-11-30', note: 'HSR ~30min' },
    { mode: 'flight', route: 'Shenzhen → Kuala Lumpur', date: '2026-12-06', note: 'Direct ~4h10 — daily SZX–KUL (AirAsia/CZ/ZH/MH); Malaysia begins' },
    // Malaysia — short west-coast run
    { mode: 'flight', route: 'Kuala Lumpur → Langkawi', date: '2026-12-10', note: 'In-chapter hop ~1h' },
    // Thailand — Andaman south-to-north
    { mode: 'ferry', route: 'Koh Lipe → Ko Lanta', date: '2026-12-18', note: 'Speedboat north up the Andaman chain (~3h)' },
    { mode: 'bus', route: 'Ko Lanta → Krabi airport', date: '2026-12-26', note: 'Ferry/van ~2.5–3h; then the afternoon flight to Bangkok' },
    // Taiwan — south to north
    { mode: 'train', route: 'Kaohsiung → Tainan', date: '2027-01-02', note: 'TRA ~35min' },
    { mode: 'train', route: 'Tainan → Chiayi → Alishan', date: '2027-01-06', note: 'TRA Tainan→Chiayi ~35min (no booking), then the forest railway — Chiayi 09:00 or 10:00, Alishan 14:56 on the second. Web booking opens 06:00 exactly 14 days out (Dec 23 for Jan 6; Fri orders reach +16, Sat +15; the Fenqihu–Alishan segment only 3 days out); the county bus from Chiayi bus station is the fallback' },
    { mode: 'train', route: 'Chiayi → Taipei', date: '2027-01-08', note: 'Alishan bus down + HSR ~1h40' },
    // China spring finale
    { mode: 'train', route: 'Changsha → Shanghai', date: '2027-05-28', note: 'HSR ~5h' },
    { mode: 'flight', route: 'Shanghai → Seoul', date: '2027-06-02', note: 'Direct ~2h — Korea begins' },
    // Japan
    { mode: 'train', route: 'Kyoto → Osaka', date: '2027-01-21', note: 'Local/rapid train ~30min' },
    { mode: 'train', route: 'Osaka → Takayama (via Shirakawa-go)', date: '2027-01-25', note: 'Hida Wide View limited express (~3.5h) + Nohi bus to Shirakawa-go' },
    { mode: 'train', route: 'Takayama → Hakone / Mt. Fuji', date: '2027-01-28', note: 'Hida train to Nagoya + Shinkansen to Odawara / Kawaguchiko' },
    { mode: 'train', route: 'Hakone / Kawaguchiko → Tokyo', date: '2027-01-31', note: 'Odakyu Romancecar or highway bus ~1.5–2h' },
    { mode: 'train', route: 'Tokyo → Nozawa Onsen', date: '2027-02-09', note: 'Hokuriku Shinkansen to Iiyama + bus ~2.5h' },
    { mode: 'train', route: 'Nozawa Onsen → Myoko Kogen', date: '2027-02-14', note: 'Bus/train via Nagano ~2h' },
    { mode: 'train', route: 'Myoko Kogen → Tokyo', date: '2027-02-23', note: 'Hokuriku Shinkansen + local transfer' },
    // Indonesia A
    { mode: 'train', route: 'Jakarta → Yogyakarta', date: '2027-02-26', note: 'Executive train (or 1h flight)' },
    { mode: 'flight', route: 'Yogyakarta → Bali', date: '2027-03-02', note: 'In-chapter hop ~1h — pre-mudik, book 14+ days ahead' },
    // Borneo — KK base, rainforest, back
    { mode: 'flight', route: 'Kota Kinabalu → Sandakan (Sepilok)', date: '2027-03-23', note: '~45min to Sandakan + 30min road; the all-road alternative is ~6h' },
    { mode: 'bus', route: 'Sepilok → Kinabatangan (Sukau)', date: '2027-03-24', note: '~2h lodge transfer, usually bundled with the river lodge' },
    { mode: 'bus', route: 'Kinabatangan → Kota Kinabalu', date: '2027-03-29', note: 'Road via Sandakan, ~5–6h — the long transfer day' },
    // Philippines — Palawan south, then Cebu
    { mode: 'flight', route: 'Manila → Coron (Busuanga)', date: '2027-04-02', note: '~1h20, then a 30min van into Coron town' },
    { mode: 'ferry', route: 'Coron → El Nido', date: '2027-04-07', note: 'Fast ferry ~3h30–4h — weather-exposed; van + boat is the fallback' },
    { mode: 'flight', route: 'El Nido → Cebu', date: '2027-04-11', note: 'Via Manila (Lio–MNL–CEB) — half a travel day' },
    // Indonesia B
    { mode: 'ferry', route: 'Sanur → Nusa Penida', date: '2027-04-15', note: 'Fast boat ~45min — the morning after the Cebu arrival' },
    { mode: 'flight', route: 'Bali → Labuan Bajo', date: '2027-04-18', note: 'In-chapter hop ~1h10 into Komodo' },
    { mode: 'flight', route: 'Labuan Bajo → Bali', date: '2027-04-25', note: 'In-chapter hop ~1h10 — back for the volcano finish' },
    // China Spring — May sweet spot
    { mode: 'train', route: 'Xi\'an → Chengdu', date: '2027-05-11', note: 'HSR ~3.5h' },
    { mode: 'train', route: 'Chengdu → Chongqing', date: '2027-05-16', note: 'HSR ~1h' },
    { mode: 'train', route: 'Chongqing → Zhangjiajie', date: '2027-05-20', note: 'Direct HSR ~2–2.5h' },
    { mode: 'train', route: 'Zhangjiajie → Fenghuang (via Furong)', date: '2027-05-24', note: 'HSR/bus with the Furong waterfall-town stop en route (~1–2h)' },
    { mode: 'train', route: 'Fenghuang → Changsha', date: '2027-05-27', note: 'HSR ~2h; buffer night before the Korea flight' },
    // Korea — early-summer finale (south-to-north)
    { mode: 'flight', route: 'Jeju → Busan', date: '2027-06-05', note: 'In-chapter hop ~50min' },
    { mode: 'train', route: 'Busan → Gyeongju', date: '2027-06-08', note: 'KTX/train ~35min' },
    { mode: 'train', route: 'Gyeongju → Seoul', date: '2027-06-10', note: 'KTX ~2h — 6 final nights in Seoul before ICN flight home' },
  ];

  return {
    start: START, end: END, totalDays,
    travelers: 2,
    chapters,
    budget, packing,
    calendarEvents, transports,
    REGIONS,
    CHAPTER_COLORS,
    chapterColor,
    helpers: { dayCounter, mapsUrl, photoUrl, fmt, dayRange, contrastText },
  };
})();
