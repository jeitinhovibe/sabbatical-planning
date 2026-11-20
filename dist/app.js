"use strict";

// The Long Way East — app shell: chrome, year spine, atlas stage, chapter reel,
// cover, and the four sections (Atlas / Chapters / Budget / Tasks).

(function () {
  const {
    totalDays,
    helpers,
    REGIONS
  } = window.TRIP;
  const {
    fmt,
    dayCounter
  } = helpers;
  const {
    todayISO,
    currentChapter,
    currentCity,
    nextCity,
    daysUntil,
    chapterStatus
  } = window.TRIP_NOW;
  const TODAY = (() => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  })();
  function useIsMobile(bp = 880) {
    const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
    React.useEffect(() => {
      const on = () => setM(window.innerWidth < bp);
      window.addEventListener('resize', on);
      return () => window.removeEventListener('resize', on);
    }, [bp]);
    return m;
  }

  // Deep-link params. New names win; the old map/budget/todo names still work
  // so links shared before the redesign keep landing somewhere sensible.
  function readUrlParams() {
    try {
      const q = new URLSearchParams(window.location.search);
      const rawView = (q.get('view') || '').toLowerCase();
      const view = rawView === 'budget' || rawView === 'ledger' ? 'ledger' : rawView === 'todo' || rawView === 'kit' || rawView === 'tasks' ? 'kit' : rawView === 'map' || rawView === 'atlas' || rawView === 'journey' ? 'atlas' : null;
      const mapRaw = (q.get('map') || '').toLowerCase();
      const map = mapRaw === 'globe' || mapRaw === '3d' ? 'globe' : mapRaw === 'map' || mapRaw === '2d' ? 'map' : null;
      const chId = q.get('chapter');
      const ch = chId && window.STORE ? window.STORE.getChapter(chId) : null;
      let place = null;
      if (ch) {
        const n = parseInt(q.get('place'), 10);
        if (Number.isInteger(n) && n >= 0 && ch.places && n < ch.places.length) place = n;
      }
      const detail = q.get('detail');
      return {
        view,
        map,
        chapterId: ch ? ch.id : null,
        placeIdx: place,
        detail: detail === '0' ? false : null
      };
    } catch {
      return {
        view: null,
        map: null,
        chapterId: null,
        placeIdx: null,
        detail: null
      };
    }
  }
  const VIEWS = [{
    id: 'atlas',
    label: 'Atlas',
    index: '01',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.globe, p)
  }, {
    id: 'ledger',
    label: 'Budget',
    index: '02',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.wallet, p)
  }, {
    id: 'kit',
    label: 'Tasks',
    index: '03',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.check, p)
  }];

  // ── Cover / title card ────────────────────────────────────────────────
  // Shown once per browser session. It is a curtain, not a gate: a click,
  // a key, or two seconds and it is gone.
  function Cover({
    onDone,
    stats
  }) {
    const [leaving, setLeaving] = React.useState(false);
    React.useEffect(() => {
      const t = setTimeout(() => setLeaving(true), 2300);
      return () => clearTimeout(t);
    }, []);
    React.useEffect(() => {
      if (!leaving) return undefined;
      const t = setTimeout(onDone, 750);
      return () => clearTimeout(t);
    }, [leaving, onDone]);
    React.useEffect(() => {
      const skip = () => setLeaving(true);
      window.addEventListener('keydown', skip);
      return () => window.removeEventListener('keydown', skip);
    }, []);
    const chapters = window.STORE.getChapters();
    let acc = 0;
    return /*#__PURE__*/React.createElement("div", {
      className: `cover ${leaving ? 'is-leaving' : ''}`,
      onClick: () => setLeaving(true),
      role: "button",
      tabIndex: 0,
      "aria-label": "Enter the atlas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cover-grain"
    }), /*#__PURE__*/React.createElement("div", {
      className: "cover-glow"
    }), /*#__PURE__*/React.createElement("div", {
      className: "cover-stars",
      "aria-hidden": "true"
    }, Array.from({
      length: 46
    }).map((_, i) => /*#__PURE__*/React.createElement("i", {
      key: i,
      style: {
        left: `${i * 37.3 % 100}%`,
        top: `${i * 61.7 % 100}%`,
        animationDelay: `${i % 9 * 0.4}s`
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "cover-top"
    }, /*#__PURE__*/React.createElement("span", null, "2026 \u2014 2027"), /*#__PURE__*/React.createElement("span", null, "SABBATICAL \xB7 NO. 02")), /*#__PURE__*/React.createElement("div", {
      className: "cover-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cover-kicker"
    }, "One year \xB7 two travellers \xB7 twenty-one chapters"), /*#__PURE__*/React.createElement("h1", null, "The Long", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "Way East"))), /*#__PURE__*/React.createElement("div", {
      className: "cover-route",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "cover-route-line"
    }), chapters.map((c, i) => {
      const left = acc / totalDays;
      acc += c.days || 0;
      return /*#__PURE__*/React.createElement("span", {
        key: c.id,
        className: "cover-route-dot",
        style: {
          left: `${left * 100}%`,
          background: window.chapterTint(c),
          animationDelay: `${0.8 + i * 0.035}s`
        }
      });
    })), /*#__PURE__*/React.createElement("div", {
      className: "cover-bottom"
    }, /*#__PURE__*/React.createElement("span", null, stats.days, " days"), /*#__PURE__*/React.createElement("span", null, stats.countries, " countries"), /*#__PURE__*/React.createElement("span", null, stats.stops, " stops"), /*#__PURE__*/React.createElement("span", {
      className: "cover-enter"
    }, "Enter the atlas ", /*#__PURE__*/React.createElement(window.Icon.arrow, {
      size: 12
    }))));
  }

  // ── Header ────────────────────────────────────────────────────────────
  function Header({
    view,
    onView,
    day,
    total,
    isMobile
  }) {
    const pct = Math.max(0, Math.min(1, day / Math.max(1, total)));
    return /*#__PURE__*/React.createElement("header", {
      className: "topbar"
    }, /*#__PURE__*/React.createElement("button", {
      className: "brand",
      onClick: () => onView('atlas'),
      "aria-label": "The Long Way East \u2014 open the atlas"
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-mark"
    }, /*#__PURE__*/React.createElement(window.Icon.compass, {
      size: 19
    })), /*#__PURE__*/React.createElement("span", {
      className: "brand-text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-name"
    }, "The Long Way ", /*#__PURE__*/React.createElement("em", null, "East")), /*#__PURE__*/React.createElement("span", {
      className: "brand-sub"
    }, "Sabbatical \xB7 2026\u201427"))), !isMobile && /*#__PURE__*/React.createElement("nav", {
      className: "topnav",
      "aria-label": "Sections"
    }, VIEWS.map(v => /*#__PURE__*/React.createElement("button", {
      key: v.id,
      className: view === v.id ? 'is-active' : '',
      onClick: () => onView(v.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "topnav-index"
    }, v.index), /*#__PURE__*/React.createElement("span", null, v.label)))), /*#__PURE__*/React.createElement("div", {
      className: "topbar-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dayclock",
      title: `Day ${day} of ${total}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "dayclock-ring",
      style: {
        '--p': `${pct * 360}deg`
      }
    }, /*#__PURE__*/React.createElement("span", null, String(day).padStart(3, '0'))), /*#__PURE__*/React.createElement("div", {
      className: "dayclock-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dayclock-of"
    }, "/ ", total, " days"), /*#__PURE__*/React.createElement("span", {
      className: "dayclock-label"
    }, "on the road"))), !isMobile && /*#__PURE__*/React.createElement(window.SyncButton, null)));
  }

  // ── The year spine ────────────────────────────────────────────────────
  // 360 individual days, coloured by chapter, dimmed once they are behind
  // you. It is the whole trip in one line and a jump target at the same time.
  function YearSpine({
    chapters,
    current,
    selectedId,
    onPickDay,
    focusDay
  }) {
    const today = todayISO();
    const idx = window.dayIndex(today);
    const total = totalDays;
    const months = window.monthsBetween();
    const [hover, setHover] = React.useState(null);

    // One cell per day: the chapter that owns it, its date, and the city you
    // are actually in that day. The city is what the tooltip names and what a
    // click flies the map to — a day is a place, not a chapter.
    const cells = React.useMemo(() => {
      const tripStart = Date.parse('2026-06-21T00:00:00Z');
      const winsById = {};
      chapters.forEach(ch => {
        winsById[ch.id] = window.TRIP_NOW.placeWindows(ch);
      });
      const out = [];
      let carried = null;
      for (let i = 0; i < total; i++) {
        const date = new Date(tripStart + i * 86400000).toISOString().slice(0, 10);
        // Same owner rule the rest of the app uses, so the tooltip's city and
        // the click's destination can never disagree on a shared exit day.
        const ch = currentChapter(chapters, date) || carried || chapters[chapters.length - 1];
        carried = ch;
        const wins = winsById[ch.id] || [];
        const win = wins.find(w => w.start <= date && date <= w.end) || wins[wins.length - 1] || null;
        out.push({
          ch,
          date,
          city: win ? win.place.name : ch.title,
          placeIdx: win ? win.idx : null
        });
      }
      return out;
    }, [chapters, total]);
    const focusIdx = focusDay ? window.dayIndex(focusDay) : null;
    const tip = hover != null ? cells[hover] : null;
    return /*#__PURE__*/React.createElement("div", {
      className: "spine",
      "aria-label": "The year"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spine-months"
    }, months.map(m => /*#__PURE__*/React.createElement("span", {
      key: `${m.label}-${m.year}`,
      style: {
        left: `${m.at / total * 100}%`
      }
    }, m.label, /*#__PURE__*/React.createElement("i", null, String(m.year).slice(2))))), /*#__PURE__*/React.createElement("div", {
      className: "spine-track"
    }, cells.map((cell, i) => {
      const ch = cell.ch;
      const isNow = i === idx;
      const isPast = i < idx;
      const isSelected = ch.id === selectedId;
      const isCurrent = !!current && ch.id === current.id;
      const isFocused = focusIdx === i;
      return /*#__PURE__*/React.createElement("button", {
        key: i,
        className: `spine-tick ${isNow ? 'is-now' : ''} ${isPast ? 'is-past' : 'is-future'} ${isSelected ? 'is-selected' : ''} ${isCurrent ? 'is-current' : ''} ${isFocused ? 'is-focused' : ''}`,
        style: {
          '--tint': window.chapterTint(ch)
        },
        onClick: () => onPickDay(cell.date),
        onMouseEnter: () => setHover(i),
        onMouseLeave: () => setHover(h => h === i ? null : h),
        onFocus: () => setHover(i),
        onBlur: () => setHover(h => h === i ? null : h),
        "aria-label": `Day ${i + 1}, ${cell.city}, ${fmt(cell.date)}`
      });
    }), tip && /*#__PURE__*/React.createElement("div", {
      className: "spine-tip",
      "aria-hidden": "true",
      style: {
        left: `clamp(78px, ${(hover + 0.5) / total * 100}%, calc(100% - 78px))`
      }
    }, /*#__PURE__*/React.createElement("b", null, fmt(tip.date)), /*#__PURE__*/React.createElement("span", null, tip.city)), /*#__PURE__*/React.createElement("span", {
      className: "spine-now",
      style: {
        left: `${(idx + 0.5) / total * 100}%`
      }
    })));
  }

  // ── Atlas: giant chapter name ─────────────────────────────────────────
  function AtlasTitle({
    active,
    current,
    selected,
    here,
    next,
    nowId,
    onOpen
  }) {
    const isLong = active.title.length > 12;
    // "Now" selects a chapter so the camera has somewhere to go, but the
    // title should keep the present-tense voice — today's city, the next
    // stop — rather than switching to the "you opened this" one.
    const isNow = !!nowId && active.id === nowId;
    const live = !selected || isNow;
    let sub = '';
    if (selected && !isNow) {
      sub = `${fmt(active.start)} – ${fmt(active.end)} · ${active.days} nights`;
    } else if (here && current) {
      sub = here.place.name;
    } else {
      sub = `${fmt(active.start)} – ${fmt(active.end)}`;
    }
    const weather = active.weather;
    return /*#__PURE__*/React.createElement("div", {
      className: `atlas-title ${isLong ? 'is-long' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      className: "atlas-name",
      onClick: onOpen,
      title: `Open ${active.title}`
    }, /*#__PURE__*/React.createElement("span", null, active.title), /*#__PURE__*/React.createElement(window.Icon.arrow, {
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      className: "atlas-sub"
    }, /*#__PURE__*/React.createElement("span", null, sub), weather && /*#__PURE__*/React.createElement("span", {
      className: "atlas-weather"
    }, /*#__PURE__*/React.createElement(window.Icon.sun, {
      size: 12
    }), " ", weather.hi, "\xB0 / ", weather.lo, "\xB0"), weather && /*#__PURE__*/React.createElement("span", {
      className: "atlas-weather"
    }, /*#__PURE__*/React.createElement(window.Icon.rain, {
      size: 12
    }), " ", weather.rainyDays ?? 0, "d")), live && next && /*#__PURE__*/React.createElement("div", {
      className: "atlas-next"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atlas-next-label"
    }, current && next.chapter.id === current.id ? 'Next stop' : current ? 'Next up' : 'Begins'), /*#__PURE__*/React.createElement("span", {
      className: "atlas-next-city"
    }, next.place.name), /*#__PURE__*/React.createElement("span", {
      className: "atlas-next-when"
    }, current ? `in ${Math.max(0, daysUntil(next.start))} days` : fmt(next.start))));
  }

  // ── Atlas tools ───────────────────────────────────────────────────────
  function AtlasTools({
    mapMode,
    onMapMode,
    onReset
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "atlas-tools"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tool-seg",
      role: "group",
      "aria-label": "Map style"
    }, /*#__PURE__*/React.createElement("button", {
      className: mapMode === 'globe' ? 'is-active' : '',
      onClick: () => onMapMode('globe'),
      title: "3D globe"
    }, /*#__PURE__*/React.createElement(window.Icon.globe, {
      size: 12
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, "Globe")), /*#__PURE__*/React.createElement("button", {
      className: mapMode === 'map' ? 'is-active' : '',
      onClick: () => onMapMode('map'),
      title: "2D map"
    }, /*#__PURE__*/React.createElement(window.Icon.map, {
      size: 12
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, "Map"))), /*#__PURE__*/React.createElement("button", {
      className: "tool-btn",
      onClick: onReset,
      title: "Back to where you are today"
    }, /*#__PURE__*/React.createElement(window.Icon.pin, {
      size: 13
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, "Now")));
  }

  // ── Chapter reel ──────────────────────────────────────────────────────
  function ChapterReel({
    chapters,
    current,
    selectedId,
    onOpen
  }) {
    const trackRef = React.useRef(null);
    // Collapsing the strip is a "let me see the map" move: it stays collapsed
    // across reloads (like the 2D/3D switch), and starts expanded for anyone
    // who has never touched it.
    const [collapsed, setCollapsed] = React.useState(() => {
      try {
        return localStorage.getItem('reel-collapsed') === '1';
      } catch {
        return false;
      }
    });
    const toggle = () => {
      setCollapsed(was => {
        try {
          localStorage.setItem('reel-collapsed', was ? '0' : '1');
        } catch {}
        return !was;
      });
    };
    const focusId = selectedId || current && current.id;
    React.useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector('.reel-card.is-selected') || track.querySelector('.reel-card.is-now') || track.querySelector('.reel-card.is-focus');
      if (!card) return;
      const target = card.offsetLeft - track.offsetLeft;
      track.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth'
      });
    }, [focusId, chapters.length]);
    // Mouse drag scrolls the strip. Touch already does it natively, so this
    // only engages for a mouse.
    //
    // Capture is taken only once the pointer has actually travelled: holding
    // it from pointerdown retargets pointerup to the track, and the browser
    // then fires the click on the track instead of the card — which silently
    // killed every card click. A press that never moves is a plain click and
    // is left alone.
    const drag = React.useRef({
      active: false,
      x: 0,
      left: 0,
      moved: 0,
      captured: false
    });
    const DRAG_SLOP = 6;
    const onDragStart = e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const track = trackRef.current;
      if (!track) return;
      drag.current = {
        active: true,
        x: e.clientX,
        left: track.scrollLeft,
        moved: 0,
        captured: false
      };
    };
    const onDragMove = e => {
      const d = drag.current;
      if (!d.active) return;
      if (e.buttons === 0) {
        onDragEnd(e);
        return;
      }
      const dx = e.clientX - d.x;
      d.moved = Math.max(d.moved, Math.abs(dx));
      if (!d.captured && d.moved > DRAG_SLOP) {
        const track = trackRef.current;
        track.setPointerCapture(e.pointerId);
        track.classList.add('is-dragging');
        d.captured = true;
      }
      if (d.captured) trackRef.current.scrollLeft = d.left - dx;
    };
    const onDragEnd = e => {
      const d = drag.current;
      if (!d.active) return;
      d.active = false;
      const track = trackRef.current;
      if (!track) return;
      track.classList.remove('is-dragging');
      if (d.captured) {
        try {
          track.releasePointerCapture(e.pointerId);
        } catch {}
        d.captured = false;
      }
    };
    const onClickCapture = e => {
      if (drag.current.moved > DRAG_SLOP) {
        e.preventDefault();
        e.stopPropagation();
      }
      drag.current.moved = 0;
    };
    return /*#__PURE__*/React.createElement("div", {
      className: `reel ${collapsed ? 'is-collapsed' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "reel-head"
    }, /*#__PURE__*/React.createElement("button", {
      className: "reel-head-left",
      onClick: toggle,
      "aria-expanded": !collapsed,
      "aria-controls": "reel-track",
      title: collapsed ? 'Show the chapter strip' : 'Hide the chapter strip'
    }, /*#__PURE__*/React.createElement("span", {
      className: "reel-kicker"
    }, "The arc"), /*#__PURE__*/React.createElement("span", {
      className: "reel-count"
    }, chapters.length, " chapters \xB7 ", totalDays, " days")), /*#__PURE__*/React.createElement("button", {
      className: "reel-toggle",
      onClick: toggle,
      "aria-expanded": !collapsed,
      "aria-controls": "reel-track",
      "aria-label": collapsed ? 'Show the chapter strip' : 'Hide the chapter strip',
      title: collapsed ? 'Show the chapter strip' : 'Hide the chapter strip'
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 14 14",
      width: "12",
      height: "12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 5.4 7 9.4 11 5.4"
    })))), /*#__PURE__*/React.createElement("div", {
      id: "reel-track",
      className: "reel-track",
      ref: trackRef,
      onPointerDown: onDragStart,
      onPointerMove: onDragMove,
      onPointerUp: onDragEnd,
      onPointerCancel: onDragEnd,
      onClickCapture: onClickCapture,
      onDragStart: e => e.preventDefault()
    }, chapters.map(c => {
      const isNow = !!current && c.id === current.id;
      const isSelected = c.id === selectedId;
      const isPast = current && c.end < todayISO();
      const status = isNow ? 'is-now' : isSelected ? 'is-selected' : isPast ? 'is-past' : '';
      return /*#__PURE__*/React.createElement("button", {
        key: c.id,
        className: `reel-card ${status} ${isNow || isSelected ? 'is-focus' : ''}`,
        onClick: () => onOpen(c.id),
        title: `${c.title} · ${fmt(c.start)} – ${fmt(c.end)}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "reel-photo"
      }, /*#__PURE__*/React.createElement(window.Photo, {
        keyword: c.photos && c.photos[0],
        alt: c.title,
        ratio: "auto",
        style: {
          width: '100%',
          height: '100%',
          aspectRatio: 'unset'
        },
        sizes: "240px"
      }), /*#__PURE__*/React.createElement("span", {
        className: "reel-num"
      }, c.kind === 'chapter' && c.num != null ? String(c.num).padStart(2, '0') : '··'), isNow && /*#__PURE__*/React.createElement("span", {
        className: "reel-now"
      }, /*#__PURE__*/React.createElement("i", null), " Now"), isPast && !isNow && /*#__PURE__*/React.createElement("span", {
        className: "reel-done",
        role: "img",
        title: "Already travelled",
        "aria-label": "Already travelled"
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 12 12",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M2.4 6.4 4.8 8.8 9.6 3.4"
      }))), /*#__PURE__*/React.createElement("span", {
        className: "reel-days"
      }, c.days, " nights")), /*#__PURE__*/React.createElement("span", {
        className: "reel-meta"
      }, /*#__PURE__*/React.createElement("span", {
        className: "reel-title"
      }, c.title), /*#__PURE__*/React.createElement("span", {
        className: "reel-date"
      }, fmt(c.start), " \u2013 ", fmt(c.end), " ", /*#__PURE__*/React.createElement("i", null, "\xB7"), " ", c.flag)));
    })));
  }

  // ── Easter egg ────────────────────────────────────────────────────────
  // The two of them in the rocket, lapping the planet: one slow revolution
  // every minute or so, forty pixels wide, then gone again. It sits on a
  // fixed layer above the atlas and below every piece of chrome, so it can
  // never move the layout or cover something you are reading; it takes the
  // pointer only while it is out. The ring is a fixed circle on the stage —
  // deliberately not scaled to the globe's zoom, the lap is the same lap
  // whatever the camera is doing.
  const EGG = {
    lap: 16000,
    // one revolution — a drift round the planet, not a fly-by
    fade: 400,
    // the only moment it is not solid: the blink on and off
    gap: [44000, 62000],
    // quiet time between sightings (~1 min door to door)
    first: 20000,
    // let the intro settle before the first one
    radius: 0.36,
    // ring radius, as a share of the shorter stage side
    tilt: -14,
    // the ring's line of nodes, tipped up to the right
    squash: 0.36,
    // how flat the ring reads from here
    nose: 8,
    // the rocket's own nose sits ~8° above its horizon
    open: 2.8,
    // how far a click opens it up
    openFor: 1300 // ms
  };
  function EasterEgg({
    enabled
  }) {
    const shipRef = React.useRef(null);
    const popRef = React.useRef(null);
    const spinRef = React.useRef(null);
    const pointer = React.useRef({
      spin: 0,
      open: false
    });
    const openTimer = React.useRef(0);

    // The sprite's own transform: the roll the arrows ask for, plus the pop a
    // click asks for. Both are transitions, so this is written on demand, not
    // per frame — the lap below only moves the wrapper.
    const paintShip = () => {
      if (spinRef.current) spinRef.current.style.transform = `rotate(${pointer.current.spin}deg)`;
      if (popRef.current) popRef.current.style.transform = `scale(${pointer.current.open ? EGG.open : 1})`;
    };
    const onShipClick = () => {
      pointer.current.open = true;
      paintShip();
      clearTimeout(openTimer.current);
      openTimer.current = setTimeout(() => {
        pointer.current.open = false;
        paintShip();
      }, EGG.openFor);
    };
    React.useEffect(() => {
      const el = shipRef.current;
      if (!el || !enabled) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const tilt = EGG.tilt * Math.PI / 180;
      const ct = Math.cos(tilt),
        st = Math.sin(tilt);
      let raf = 0,
        timer = 0,
        t0 = 0,
        alive = true;

      // The stage, not the planet: one circle, near enough to the globe at the
      // default framing that it reads as an orbit, and unchanged when you zoom.
      function anchor() {
        const box = document.querySelector('.atlas-canvas');
        const r = box ? box.getBoundingClientRect() : null;
        const w = r ? r.width : window.innerWidth;
        const h = r ? r.height : window.innerHeight;
        return {
          cx: (r ? r.left : 0) + w / 2,
          cy: (r ? r.top : 0) + h / 2,
          R: Math.max(70, Math.min(w, h) * EGG.radius)
        };
      }
      function frame(now) {
        const p = (now - t0) / EGG.lap;
        if (p >= 1) {
          el.classList.remove('is-live');
          el.style.opacity = '0';
          timer = setTimeout(lap, EGG.gap[0] + Math.random() * (EGG.gap[1] - EGG.gap[0]));
          return;
        }
        const a = anchor();
        // Round the ring clockwise, from the near side: up the left limb, over
        // the top travelling right, down the right limb, back underneath.
        const th = -Math.PI / 2 - p * Math.PI * 2;
        const x0 = Math.cos(th) * a.R;
        const y0 = -Math.sin(th) * a.R * EGG.squash;
        const vx0 = Math.sin(th) * a.R;
        const vy0 = Math.cos(th) * a.R * EGG.squash;
        const x = a.cx + x0 * ct - y0 * st;
        const y = a.cy + x0 * st + y0 * ct;
        const vx = vx0 * ct - vy0 * st;
        const vy = vx0 * st + vy0 * ct;
        // Nose on the tangent: the rocket always flies forwards, never sideways
        // or backwards. Only the far half shrinks a little — a depth hint with
        // no dimming, so it stays a solid sticker the whole way round.
        const near = (1 - Math.sin(th)) / 2;
        const scale = 0.8 + 0.2 * near;
        const edge = Math.min(1, p * EGG.lap / EGG.fade, (1 - p) * EGG.lap / EGG.fade);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) ` + `rotate(${(Math.atan2(vy, vx) * 180 / Math.PI + EGG.nose).toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = Math.max(0, edge).toFixed(3);
        raf = requestAnimationFrame(frame);
      }
      function lap() {
        if (!alive) return;
        t0 = performance.now();
        el.classList.add('is-live');
        raf = requestAnimationFrame(frame);
      }

      // A roll per arrow press, and only while the ship is out — the arrows
      // still mean nothing to the atlas, so this never steals a key.
      const onKey = e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (!el.classList.contains('is-live')) return;
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        pointer.current.spin += e.key === 'ArrowUp' ? 360 : -360;
        paintShip();
      };
      window.addEventListener('keydown', onKey);
      timer = setTimeout(lap, EGG.first);
      return () => {
        alive = false;
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        el.classList.remove('is-live');
        el.style.opacity = '0';
        clearTimeout(openTimer.current);
      };
    }, [enabled]);
    return /*#__PURE__*/React.createElement("div", {
      ref: shipRef,
      className: "egg-ship",
      "aria-hidden": "true",
      onClick: onShipClick
    }, /*#__PURE__*/React.createElement("span", {
      className: "egg-pop",
      ref: popRef
    }, /*#__PURE__*/React.createElement("img", {
      ref: spinRef,
      src: "extra-pictures/rocket-couple.png",
      alt: "",
      draggable: "false"
    })));
  }

  // ── App ───────────────────────────────────────────────────────────────
  function App() {
    const store = window.useStore();
    const chapters = store.getChapters();
    const [urlParams] = React.useState(readUrlParams);
    const [view, setView] = React.useState(urlParams.view || 'atlas');
    const [selectedId, setSelectedId] = React.useState(urlParams.chapterId);
    const [selectedPlaceIdx, setSelectedPlaceIdx] = React.useState(urlParams.placeIdx);
    const [focusDay, setFocusDay] = React.useState(null);
    // What the 2D map should do about zoom when a stop is selected. A day on
    // the spine is about locating the city in its country, so it frames at the
    // chapter's zoom; a dot click passes 'keep' and only moves the centre.
    const [placeZoom, setPlaceZoom] = React.useState(null);
    const [detailOpen, setDetailOpen] = React.useState(!!urlParams.chapterId && urlParams.detail !== false);
    const [focusKey, setFocusKey] = React.useState(0);
    const [mapRetry, setMapRetry] = React.useState(0);
    const [mapMode, setMapMode] = React.useState(() => {
      if (urlParams.map) return urlParams.map;
      try {
        return localStorage.getItem('map-mode') || 'globe';
      } catch {
        return 'globe';
      }
    });
    const [cover, setCover] = React.useState(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        // A shared chapter or section link should open straight into it.
        return !sessionStorage.getItem('tlwe-cover') && !q.has('nocover') && !q.has('chapter') && !q.has('view') && !q.has('map');
      } catch {
        return false;
      }
    });
    const isMobile = useIsMobile();
    const stageRef = React.useRef(null);
    // Timestamp of the last title tap that opened the sheet, so the map's click
    // on the same release does not immediately close it again (see below).
    const swallowClick = React.useRef(0);

    // Trackpad pinch arrives as ctrl+wheel, and both OrbitControls and
    // Leaflet listen on the map surface only — so a pinch that started over
    // the chapter title or the map controls did nothing. Re-dispatch those
    // gestures at the surface so the whole stage is pinchable.
    React.useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return undefined;
      const onWheel = e => {
        if (!e.ctrlKey) return; // pinch only; plain wheel is not ours
        const surface = stage.querySelector('.leaflet-container') || stage.querySelector('canvas');
        if (!surface || surface.contains(e.target)) return; // already on the map
        surface.dispatchEvent(new WheelEvent('wheel', {
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaMode: e.deltaMode,
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        }));
      };
      stage.addEventListener('wheel', onWheel, {
        passive: true
      });
      return () => stage.removeEventListener('wheel', onWheel);
    }, [mapMode, view, cover]);

    // Touch has the mirror problem, and it cannot be re-dispatched: a finger
    // that lands on a control belongs to that control, so Leaflet/OrbitControls
    // never see it and a pinch started partly on the 2D/3D switch or a reel card
    // is not a pinch. The controls have to stay tappable, so the fix is the CSS
    // one — the chrome around them is pointer-events: none. What is left is the
    // release: the browser still fires a click on the control the thumb started
    // on, flipping the map mid-gesture. Track whether the gesture had more than
    // one finger and swallow the click it leaves behind; the next single-finger
    // tap clears the flag.
    React.useEffect(() => {
      const stage = stageRef.current;
      if (!stage || view !== 'atlas') return undefined;
      let multi = false;
      const onTouchStart = e => {
        multi = e.touches.length > 1;
      };
      const onClick = e => {
        if (!multi) return;
        const t = e.target;
        if (!t || !t.closest || !t.closest('.atlas-tools, .reel')) return;
        e.preventDefault();
        e.stopPropagation();
      };
      stage.addEventListener('touchstart', onTouchStart, {
        passive: true
      });
      stage.addEventListener('click', onClick, true);
      return () => {
        stage.removeEventListener('touchstart', onTouchStart);
        stage.removeEventListener('click', onClick, true);
      };
    }, [view]);
    const today = todayISO();
    const current = currentChapter(chapters, today);
    const here = current ? currentCity(chapters, today) : null;
    const next = nextCity(chapters, today);
    // The giant name belongs to the atlas, not to the spread. A spread opens by
    // sliding over the atlas while the atlas fades out under it — if the name
    // swapped to the clicked chapter in the same commit, the new title stayed
    // on screen for the whole fade: a flash of the next chapter's name before
    // the panel covered it. So the name samples the selection only while the
    // atlas is visible. Adjusting it during render (rather than in an effect)
    // means the catch-up happens in the same paint the atlas is still hidden,
    // and no half-faded title is ever shown in either direction.
    const [titleId, setTitleId] = React.useState(selectedId);
    if (!detailOpen && titleId !== selectedId) setTitleId(selectedId);
    const active = titleId && store.getChapter(titleId) || current || (next ? chapters[0] : chapters[chapters.length - 1]);
    const stats = window.tripStats();
    const day = window.dayIndex(today) + 1;

    // Reflect the whole state into the URL so any view is shareable.
    React.useEffect(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        // Public names in the URL, internal ids in state.
        if (view === 'atlas') q.delete('view');else q.set('view', view === 'kit' ? 'tasks' : view === 'ledger' ? 'budget' : view);
        if (mapMode === 'globe') q.delete('map');else q.set('map', '2d');
        if (selectedId) q.set('chapter', selectedId);else q.delete('chapter');
        if (selectedId && selectedPlaceIdx != null) q.set('place', String(selectedPlaceIdx));else q.delete('place');
        if (selectedId && !detailOpen) q.set('detail', '0');else q.delete('detail');
        q.delete('nocover');
        const qs = q.toString();
        const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        if (nextUrl !== window.location.pathname + window.location.search) {
          window.history.replaceState(null, '', nextUrl);
        }
      } catch {}
    }, [view, mapMode, selectedId, selectedPlaceIdx, detailOpen]);

    // Escape closes the chapter panel; arrows step between chapters.
    React.useEffect(() => {
      const onKey = e => {
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (e.key === 'Escape') {
          if (detailOpen) setDetailOpen(false);
        }
        if (detailOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          const i = chapters.findIndex(c => c.id === selectedId);
          if (i < 0) return;
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
          setSelectedId(chapters[n].id);
          setSelectedPlaceIdx(null);
          setFocusDay(null);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [detailOpen, selectedId, chapters]);
    const setMapModeAndSave = m => {
      setMapMode(m);
      try {
        localStorage.setItem('map-mode', m);
      } catch {}
    };
    const goView = v => {
      setDetailOpen(false);
      setView(v);
    };
    const openChapter = id => {
      setSelectedId(id);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlaceZoom(null);
      setDetailOpen(true);
      if (view === 'ledger' || view === 'kit') setView('atlas');
    };

    // The giant name is scenery on touch — pointer-events: none, so a thumb on
    // it still pans and pinches the map (a button there ate one finger of every
    // pinch, and Leaflet/OrbitControls never saw the other). Its tap is
    // recovered here instead of in CSS: on release, a short single-finger tap
    // inside the name's box opens the chapter, unless a pin or a real control
    // was under the finger — the title is the biggest target, not the top one.
    React.useEffect(() => {
      const stage = stageRef.current;
      if (!stage || view !== 'atlas') return undefined;
      const slop = 12;
      let start = null;
      const inName = (x, y) => {
        const el = stage.querySelector('.atlas-name');
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      };
      const onTouchStart = e => {
        // Two fingers on the title is a pinch, not two taps.
        if (e.touches.length !== 1 || e.target.closest && e.target.closest('.atlas-name')) {
          start = null;
          return;
        }
        const t = e.touches[0];
        start = inName(t.clientX, t.clientY) ? {
          x: t.clientX,
          y: t.clientY,
          at: Date.now()
        } : null;
      };
      const onTouchMove = e => {
        if (!start) return;
        const t = e.touches[0];
        if (e.touches.length !== 1 || !t || Math.hypot(t.clientX - start.x, t.clientY - start.y) > slop) start = null;
      };
      const onTouchEnd = e => {
        const s = start;
        start = null;
        if (!s) return;
        const t = e.changedTouches && e.changedTouches[0];
        if (!t || Date.now() - s.at > 700) return;
        if (Math.hypot(t.clientX - s.x, t.clientY - s.y) > slop) return;
        const under = document.elementFromPoint(t.clientX, t.clientY);
        if (!under || !under.closest) return;
        // A pin, a reel card or a tool under the finger keeps its own tap.
        if (under.closest('.map-pin, .map-place, button, a, input, .reel-card')) return;
        // And only a tap that actually landed on the map counts: the title box
        // can sit under the open spread, and a thumb on the spread is not a tap
        // on the title.
        if (under.tagName !== 'CANVAS' && !under.closest('.map-container, .leaflet-container')) return;
        // The map treats the same release as a click on empty water and would
        // close the sheet we are about to open. preventDefault kills the
        // compatibility click; the flag catches it if a browser sends one anyway.
        e.preventDefault();
        swallowClick.current = Date.now();
        if (active) openChapter(active.id);
      };
      stage.addEventListener('touchstart', onTouchStart, {
        passive: true
      });
      stage.addEventListener('touchmove', onTouchMove, {
        passive: true
      });
      stage.addEventListener('touchend', onTouchEnd);
      stage.addEventListener('touchcancel', onTouchEnd);
      return () => {
        stage.removeEventListener('touchstart', onTouchStart);
        stage.removeEventListener('touchmove', onTouchMove);
        stage.removeEventListener('touchend', onTouchEnd);
        stage.removeEventListener('touchcancel', onTouchEnd);
      };
    }, [view, cover, active && active.id]);

    // A spine click is a date, not a chapter: jump to the city the plan has
    // you in that day, and leave the today marker where it is. The spread
    // opens on that stop; the camera only recentres.
    const openDay = iso => {
      const ch = currentChapter(chapters, iso);
      if (!ch) return;
      const win = window.TRIP_NOW.placeWindows(ch).find(w => w.start <= iso && iso <= w.end);
      setFocusDay(iso);
      setSelectedId(ch.id);
      setSelectedPlaceIdx(win ? win.idx : null);
      setPlaceZoom(null);
      setDetailOpen(true);
      if (view === 'ledger' || view === 'kit') setView('atlas');
    };

    // A city click is a request to read about it: open the spread and let it
    // scroll itself to that stop. The 2D map moves the centre there but keeps
    // the zoom you are already at ('keep'), so clicking a dot is a pan, not a
    // re-scale.
    const onSelectPlace = idx => {
      setSelectedPlaceIdx(idx);
      setPlaceZoom('keep');
      setDetailOpen(true);
      if (view !== 'atlas') setView('atlas');
    };

    // Tapping empty map is "nothing selected": the spread closes *and* the
    // stop loses its highlight, its own markers go and the URL drops ?chapter.
    // The camera stays put — a click on the water is not a "back to route" —
    // so this is a deselect, not a re-frame. Skipped on the release that a
    // title tap just used to open the spread, which is the same click from the
    // map's side.
    const onBackgroundClick = () => {
      if (Date.now() - swallowClick.current < 600) return;
      setDetailOpen(false);
      setSelectedId(null);
      setSelectedPlaceIdx(null);
      setPlaceZoom(null);
    };

    // "Whole route" is really "put me back where I am": today's chapter, and
    // outside the timeline the first one before the trip or the last one
    // after it. focusKey forces the view to re-frame even when the selection
    // has not changed, since a no-op setState would otherwise do nothing.
    const nowTarget = current || (chapters[0] && today < chapters[0].start ? chapters[0] : chapters[chapters.length - 1]);
    const onReset = () => {
      setSelectedId(nowTarget ? nowTarget.id : null);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlaceZoom(null);
      setDetailOpen(false);
      setFocusKey(k => k + 1);
    };
    const mapFallback = err => /*#__PURE__*/React.createElement("div", {
      className: "map-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "map-fallback"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "The map missed its connection"), /*#__PURE__*/React.createElement("p", null, String(err && err.message || err || 'Unknown error')), /*#__PURE__*/React.createElement("div", {
      className: "map-fallback-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => setMapRetry(k => k + 1)
    }, "Try again"), /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => setMapModeAndSave(mapMode === 'map' ? 'globe' : 'map')
    }, "Switch to ", mapMode === 'map' ? '3D globe' : '2D map'))));
    const showDetail = detailOpen && !!selectedId && !!store.getChapter(selectedId);
    // Where the atlas is looking and how close: [lat, lng, leafletZoom]. A ref,
    // not state — the globe reports on every frame of a drag, and the only
    // consumer is the next map mount, so the switch reads it at render time and
    // nothing re-renders.
    const viewCenter = React.useRef(null);
    const onCenterChange = c => {
      viewCenter.current = c;
    };
    const carried = viewCenter.current;
    return /*#__PURE__*/React.createElement("div", {
      className: `app view-${view} ${isMobile ? 'is-mobile' : ''} ${showDetail ? 'has-detail' : ''}`
    }, /*#__PURE__*/React.createElement(Header, {
      view: view,
      onView: goView,
      day: day,
      total: totalDays,
      isMobile: isMobile
    }), /*#__PURE__*/React.createElement(YearSpine, {
      chapters: chapters,
      current: current,
      selectedId: selectedId,
      onPickDay: openDay,
      focusDay: focusDay
    }), /*#__PURE__*/React.createElement("main", {
      className: "app-body"
    }, view === 'atlas' && /*#__PURE__*/React.createElement("div", {
      className: "atlas",
      ref: stageRef
    }, /*#__PURE__*/React.createElement("div", {
      className: "atlas-canvas"
    }, /*#__PURE__*/React.createElement(window.ErrorBoundary, {
      key: `${mapMode}:${mapRetry}`,
      fallback: mapFallback
    }, mapMode === 'globe' ? /*#__PURE__*/React.createElement(window.GlobeView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectChapter: id => {
        setSelectedId(id);
        setSelectedPlaceIdx(null);
        setPlaceZoom(null);
        setDetailOpen(true);
      },
      onSelectPlace: onSelectPlace,
      onBackgroundClick: onBackgroundClick,
      focusKey: focusKey,
      intro: !cover,
      initialCenter: carried,
      initialZoom: carried ? carried[2] : null,
      onCenterChange: onCenterChange
    }) : /*#__PURE__*/React.createElement(window.MapView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      placeZoom: placeZoom,
      onSelectChapter: id => {
        setSelectedId(id);
        setSelectedPlaceIdx(null);
        setPlaceZoom(null);
        setDetailOpen(true);
      },
      onSelectPlace: onSelectPlace,
      onBackgroundClick: onBackgroundClick,
      focusKey: focusKey,
      initialCenter: carried,
      initialZoom: carried ? carried[2] : null,
      onCenterChange: onCenterChange
    }))), /*#__PURE__*/React.createElement("div", {
      className: "atlas-vignette",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement(AtlasTitle, {
      active: active,
      current: current,
      selected: !!selectedId,
      here: here,
      next: next,
      nowId: nowTarget ? nowTarget.id : null,
      onOpen: () => openChapter(active.id)
    }), /*#__PURE__*/React.createElement(AtlasTools, {
      mapMode: mapMode,
      onMapMode: setMapModeAndSave,
      onReset: onReset
    }), /*#__PURE__*/React.createElement(ChapterReel, {
      chapters: chapters,
      current: current,
      selectedId: selectedId,
      onOpen: openChapter
    })), (view === 'ledger' || view === 'kit') && /*#__PURE__*/React.createElement(window.Binder, {
      view: view,
      onOpenChapter: openChapter
    })), isMobile && /*#__PURE__*/React.createElement("nav", {
      className: "bottomnav",
      "aria-label": "Sections"
    }, VIEWS.map(v => /*#__PURE__*/React.createElement("button", {
      key: v.id,
      className: view === v.id ? 'is-active' : '',
      onClick: () => goView(v.id)
    }, v.icon({
      size: 16
    }), /*#__PURE__*/React.createElement("span", null, v.label))), /*#__PURE__*/React.createElement(window.SyncButton, {
      compact: true,
      nav: true
    })), showDetail && /*#__PURE__*/React.createElement(window.DetailPanel, {
      chapterId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectPlace: onSelectPlace,
      onClose: () => setDetailOpen(false),
      onOpenChapter: openChapter
    }), /*#__PURE__*/React.createElement(EasterEgg, {
      enabled: view === 'atlas' && !cover
    }), cover && /*#__PURE__*/React.createElement(Cover, {
      stats: stats,
      onDone: () => {
        setCover(false);
        try {
          sessionStorage.setItem('tlwe-cover', '1');
        } catch {}
      }
    }));
  }
  window.App = App;
})();