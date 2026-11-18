// 3D globe view — Flighty-style satellite Earth, Three.js (WebGL).
// Blue Marble texture + country labels + glowing route arcs. Same external
// interface as MapView: selectedId / selectedPlaceIdx / onSelectChapter /
// onSelectPlace / focusKey.

(function () {
  const { chapterColor } = window.TRIP;

  const HOME = { lat: 18, lng: 15, r: 3.3 };
  // How far out the wheel is allowed to go. The whole-route view (HOME.r) is
  // already framing the planet; past roughly a quarter further the Earth
  // shrinks to a marble on a field of black and the pins stop being readable,
  // so the zoom-out floor sits just beyond home instead of at the far plane.
  const MAX_DIST = HOME.r * 1.25;
  // The opening move: the camera starts exactly on the framing the atlas used to
  // land on — the town you are in at 2.7, the world view at HOME.r — and pushes
  // in 13% over 15s. Slow on purpose: it is a drift while you read the title,
  // not a flight you wait for. 13% is also the ceiling: it lands on the chapter
  // framing (2.35), the closest distance at which the planet's sides are still
  // inside the frame. Any deeper and the globe reads as a flat map.
  const INTRO_ZOOM = 0.87;
  const INTRO_MS = 15000;
  // Base tube radius (world units, at the home distance) — the tick loop
  // thins tubes as you zoom in so the on-screen line weight stays ~constant.
  const ARC_R = 0.0014;
  // Blue Marble (shaded relief + bathymetry), vendored rather than hotlinked
  // from unpkg — NASA GIBS tiles stitched at 20480×10240, so the same winter
  // composite the CDN file used, at up to 16k. Three tiers, picked by what
  // the screen can actually resolve: 4k is already sharp at 1x, the 16k only
  // pays off on a retina desktop. Each tier ships as KTX2 (GPU-compressed, the
  // path the globe uses) and WebP (the master, kept as the fallback). The
  // 16k WebP is 16382 texels wide — libwebp refuses anything above 16383 —
  // which is why the KTX2 build resizes that tier to 16384×8192.
  const EARTH_TEX = {
    big: 'extra-pictures/earth/blue-marble-16k',
    mid: 'extra-pictures/earth/blue-marble-8k',
    small: 'extra-pictures/earth/blue-marble-4k',
  };
  // First paint: a 2k WebP small enough to preload with the document and be
  // ready before the globe mounts, then replaced by the tier's KTX2.
  const EARTH_POSTER = 'extra-pictures/earth/blue-marble-poster.webp';
  // 16k is 2607 texels per radian of longitude. At camera distance d the
  // surface under the camera sits (d-1) radii away, so it renders at
  // f/(d-1) px per radian — with a 1740px-tall retina canvas that is 1:1 at
  // d = 2.0. Each tier stops where its own texel budget runs out, so going
  // closer costs the same upscale at the floor either way: more texels buy
  // reach, not sharpness. Mobile gets 1.5 on the 8k tier; it is a 3x-up-scaled
  // view by then on a high-DPI phone, which is the price of the extra travel.
  const MIN_DIST = { big: 1.45, mid: 1.5, small: 1.85 };
  const DEFAULT_MIN_DIST = 1.72;

  // [name, lng, lat] — major countries + trip-relevant places
  const COUNTRIES = [
    ['United States', -100, 40], ['Canada', -105, 56], ['Mexico', -102, 23],
    ['Cuba', -79, 22], ['Colombia', -73, 4], ['Brazil', -52, -10],
    ['Peru', -76, -10], ['Argentina', -64, -35], ['Chile', -71, -33],
    ['Greenland', -42, 72], ['Iceland', -18, 65],
    ['United Kingdom', -2, 54], ['Ireland', -8, 53], ['France', 2, 47],
    ['Spain', -4, 40], ['Portugal', -8, 39.5], ['Italy', 12.5, 42.5],
    ['Germany', 10, 51], ['Poland', 20, 52], ['Norway', 8, 62],
    ['Sweden', 15, 62], ['Finland', 26, 64], ['Ukraine', 32, 49],
    ['Russia', 95, 62], ['Greece', 24, 39], ['Turkey', 35, 39],
    ['Georgia', 44, 42], ['Syria', 39, 35], ['Iraq', 44, 33],
    ['Saudi Arabia', 45, 24], ['Yemen', 48, 16], ['Oman', 58, 21],
    ['Iran', 54, 32], ['Afghanistan', 66, 34], ['Pakistan', 70, 30],
    ['Azerbaijan', 47.7, 40.3], ['Kazakhstan', 68, 48], ['Uzbekistan', 64, 41],
    ['India', 79, 22], ['Nepal', 84, 28], ['Sri Lanka', 81, 8],
    ['Bangladesh', 90, 24], ['Myanmar', 96, 21], ['Thailand', 101, 16],
    ['Laos', 104, 18], ['Vietnam', 108, 14], ['Cambodia', 105, 13],
    ['Malaysia', 102, 4], ['Singapore', 104, 1.35], ['Indonesia', 115, -2],
    ['Philippines', 122, 13], ['Taiwan', 121, 24], ['Hong Kong', 114, 22.3],
    ['China', 104, 35], ['Mongolia', 105, 46], ['Japan', 139, 37],
    ['South Korea', 128, 36], ['Egypt', 30, 27], ['Libya', 18, 28],
    ['Morocco', -6, 32], ['Algeria', 3, 28], ['Tunisia', 10, 34],
    ['Sudan', 30, 13], ['Chad', 19, 15], ['Niger', 12, 17], ['Mali', -2, 17],
    ['Nigeria', 8, 10], ['Ethiopia', 40, 9], ['Kenya', 38, 1],
    ['Somalia', 46, 6], ['DR Congo', 23, -3], ['Tanzania', 35, -6],
    ['Angola', 18, -12], ['Namibia', 17, -22], ['South Africa', 25, -29],
    ['Mozambique', 36, -18], ['Madagascar', 47, -20],
    ['Australia', 134, -25], ['New Zealand', 172, -42], ['Papua New Guinea', 141, -6],
  ];

  // Switching to the 2D map unmounts the globe, and its cleanup disposes the
  // renderer, the transcoder and every texture. Re-deriving a 16k Basis texture
  // on the way back costs seconds (worker boot + transcode), so the decoded
  // texture is kept for the page's lifetime and re-uploaded into the next
  // context. Keyed by tier: the screen can change between mounts.
  let earthCache = null; // { tier, texture }

  function GlobeView({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, focusKey, onBackgroundClick, intro, initialCenter, initialZoom, onCenterChange }) {
    const store = window.useStore();
    const chapters = store.getChapters();

    const ref = React.useRef(null);
    const st = React.useRef(null);
    const propsRef = React.useRef({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters, onBackgroundClick, onCenterChange });
    propsRef.current = { selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters, onBackgroundClick, onCenterChange };

    function llv(lat, lng, r) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    function facing(worldPos, margin) {
      const s = st.current;
      const n = worldPos.clone().normalize();
      const c = s.camera.position.clone().normalize();
      return n.dot(c) > (margin == null ? 0.08 : margin);
    }

    // The inverse of llv(): the point on the surface the camera is looking at.
    // OrbitControls always targets the origin, so the camera's own direction is
    // the centre of the frame.
    function centerOf(pos) {
      const r = pos.length() || 1;
      const y = Math.max(-1, Math.min(1, pos.y / r));
      const lat = 90 - (Math.acos(y) * 180) / Math.PI;
      let lng = (Math.atan2(pos.z, -pos.x) * 180) / Math.PI - 180;
      if (lng < -180) lng += 360;
      if (lng > 180) lng -= 360;
      return [lat, lng];
    }

    function toScreen(worldPos) {
      const s = st.current;
      const v = worldPos.clone().project(s.camera);
      return [(v.x * 0.5 + 0.5) * s.w, (-v.y * 0.5 + 0.5) * s.h];
    }

    // ── one-time setup ──────────────────────────────────────────────────
    React.useEffect(() => {
      const THREE = window.THREE;
      if (!THREE || st.current) return;
      const el = ref.current;
      if (!el) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 1000);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const sun = new THREE.DirectionalLight(0xffffff, 1.5);
      sun.position.set(5, 2.5, 4);
      scene.add(sun);

      // Earth
      const earth = new THREE.Group();
      scene.add(earth);
      const maxTex = renderer.capabilities.maxTextureSize || 4096;
      const dpr = window.devicePixelRatio || 1;
      const wide = window.innerWidth >= 1200;
      const tier = (dpr >= 1.5 && wide && maxTex >= 16384) ? 'big'
        : (dpr >= 1.5 && maxTex >= 8192) ? 'mid'
        : 'small';
      const texBase = EARTH_TEX[tier];
      const minDist = MIN_DIST[tier] || DEFAULT_MIN_DIST;
      // Already decoded this session and the screen still wants the same tier:
      // skip the poster and the transcode entirely.
      const cachedEarth = earthCache && earthCache.tier === tier ? earthCache.texture : null;
      // The material starts on a 1x1 black texture so the shader compiles with
      // a map on the first frame; the real one replaces it when the fetch (and,
      // for KTX2, the worker transcode) lands. Same black planet the old
      // pending-WebP texture drew, without recompiling the material mid-flight.
      const placeholder = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
      placeholder.needsUpdate = true;
      const earthMat = new THREE.MeshPhongMaterial({ map: placeholder, shininess: 12, specular: new THREE.Color(0x222222) });
      const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
      earth.add(globe);

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      let textured = false;
      let alive = true;
      const applyTexture = (texture) => {
        if (!alive) return;
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = maxAniso;
        texture.needsUpdate = true;
        const old = earthMat.map;
        earthMat.map = texture;
        textured = true;
        if (old && old !== texture) old.dispose();
      };
      const loadWebp = (url, done) => {
        // Same-origin vendored asset: clear three.js's default CORS mode, or
        // the globe goes black when index.html is opened straight from disk
        // (undefined leaves the attribute off; an empty string still means
        // "anonymous").
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = undefined;
        // On error hand over anyway: the caller's next step is the better
        // texture, and a failed poster must not strand the globe on black.
        loader.load(url, (tex) => { applyTexture(tex); if (done) done(); }, undefined, () => { if (done) done(); });
      };
      let ktx2 = null;
      if (!cachedEarth && THREE.KTX2Loader && window.location.protocol !== 'file:') {
        ktx2 = new THREE.KTX2Loader();
        ktx2.setTranscoderPath('vendor/basis/').detectSupport(renderer);
      }
      // KTX2 reaches the GPU already compressed, so the 16k tier is no longer
      // 134M pixels decoded into 537MB of RGBA, mip-mapped and uploaded — it
      // lands as 89–179MB of VRAM (BC1 or ASTC) against ≈716MB. It costs ~12MB
      // of download against the WebP's 6MB; the win is memory and upload time,
      // not bytes.
      //
      // The tier's KTX2 is the second texture, not the first. Booting the Basis
      // transcoder plus a 16k transcode is ~3s before anything can be drawn, so
      // the 2k WebP poster (preloaded by index.html, native decode) paints as
      // soon as the globe mounts and the tier's KTX2 replaces it when it lands.
      // WebP is also the outright fallback: file:// cannot fetch the .ktx2, and
      // a failed transcode should degrade, not go black.
      const loadKtx2 = () => {
        ktx2.load(texBase + '.ktx2', (tex) => {
          if (!alive) return;
          applyTexture(tex);
          earthCache = { tier, texture: tex };
        }, undefined, (err) => {
          console.warn('KTX2 globe texture failed, falling back to WebP', err);
          if (!textured) loadWebp(texBase + '.webp');
        });
      };
      if (cachedEarth) applyTexture(cachedEarth);
      else if (ktx2) loadWebp(EARTH_POSTER, loadKtx2);
      else loadWebp(texBase + '.webp');

      // Atmosphere rim glow
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(1.03, 96, 96),
        new THREE.ShaderMaterial({
          vertexShader: 'varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec3 vNormal; void main(){ float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 3.5); gl_FragColor = vec4(0.35, 0.55, 0.9, 1.0) * intensity; }',
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        })
      );
      scene.add(atmo);

      // Stars
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(900 * 3);
      for (let i = 0; i < 900; i++) {
        const r = 30 + Math.random() * 60;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
        starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        starPos[i * 3 + 2] = r * Math.cos(p);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xffffff, size: 1.4, sizeAttenuation: false,
        transparent: true, opacity: 0.75, depthWrite: false,
      }));
      scene.add(stars);

      const arcs = new THREE.Group();
      scene.add(arcs);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = minDist;
      controls.maxDistance = MAX_DIST;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
      // First manual grab (drag or wheel) stops the spin for good — it only
      // resumes on an explicit "back to whole route" — and takes over from the
      // opening move.
      controls.addEventListener('start', () => {
        const s = st.current; if (!s) return;
        s.spinOff = true;
        s.intro = null;
        s.controls.autoRotate = false;
      });
      // Where the camera is looking and how close it is, reported to the shell
      // so switching to the 2D map opens on the same ground at the same size.
      // A ref in App, not state: this fires on every frame of a drag and must
      // not re-render anything.
      const reportCenter = () => {
        const s = st.current; if (!s) return;
        const c = centerOf(s.camera.position);
        const z = window.mapZoomForGlobe(s.camera.position.length(), c[0], s.h || h0);
        const cb = propsRef.current.onCenterChange;
        if (cb) cb([c[0], c[1], z]);
      };
      controls.addEventListener('change', reportCenter);

      // HTML overlays
      const overlay = document.createElement('div');
      overlay.className = 'eq-pins';
      el.appendChild(overlay);

      st.current = {
        renderer, scene, camera, controls, earth, arcs, stars, minDist, ktx2,
        overlay, w: 0, h: 0, raf: 0, tween: null, world: true,
        spinOff: false, arcMats: [], intro: null, introDone: false,
        noMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      };

      const home = llv(HOME.lat, HOME.lng, HOME.r);
      // Stage height for the zoom conversion; the resize observer has not run
      // yet at this point, so read it straight off the element.
      const h0 = el.clientHeight || window.innerHeight;
      // Open facing the town, not the chapter: today's city, and outside the
      // trip the first or last stop (the same chapters the title falls back
      // to). Opening holds still — a spin would drift off the place you are.
      // Coming back from the 2D map, the point to open on is the one that map
      // was showing: switching modes should not move the ground under you.
      const nowStop = window.TRIP_NOW ? window.TRIP_NOW.homeStop(chapters) : null;
      const here = initialCenter && initialCenter.length >= 2
        ? initialCenter
        : nowStop
          ? (nowStop.place && nowStop.place.coords) || (nowStop.chapter && nowStop.chapter.anchor) || null
          : null;
      // The 2D map's zoom converts to a camera distance (same ground at the same
      // size, see globeDistForMap), clamped to what this view can actually do:
      // its own range is roughly z2.9–z4.9, so a close 2D view lands at the
      // closest the sphere can be without losing its shape.
      const carriedR = here && initialZoom != null
        ? Math.max(minDist, Math.min(MAX_DIST, globeDistForMap(initialZoom, here[0], h0)))
        : null;
      const openPos = here ? llv(here[0], here[1], carriedR || 2.7) : home;
      camera.position.copy(openPos);
      controls.target.set(0, 0, 0);
      controls.update();
      reportCenter();
      if (here) {
        controls.autoRotate = false;
        st.current.spinOff = true;
      }

      // A click on the ocean is a click on the background: it should close an
      // open chapter. A drag ends with a click too, so a press that travelled
      // is not one.
      let downX = 0, downY = 0;
      const onDown = (e) => { downX = e.clientX; downY = e.clientY; };
      const onClick = (e) => {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
        const cb = propsRef.current.onBackgroundClick;
        if (cb) cb();
      };
      renderer.domElement.addEventListener('pointerdown', onDown);
      renderer.domElement.addEventListener('click', onClick);

      const ro = new ResizeObserver(() => size());
      ro.observe(el);
      size();

      const tick = () => {
        const s = st.current;
        if (!s) return;
        s.raf = requestAnimationFrame(tick);
        stepIntro();
        stepTween();
        syncDragSpeed();
        s.controls.update();
        if (!s.noMotion) {
          const t = performance.now() * 0.001;
          for (let i = 0; i < s.arcMats.length; i++) s.arcMats[i].uniforms.uTime.value = t;
        }
        // Zoom-compensated line weight: thin the tubes as the camera moves
        // in so their on-screen width stays ~constant; never thicken past
        // the base radius when zoomed out (keeps the world view airy).
        const dist = s.camera.position.length();
        const shrink = ARC_R * (1 - Math.max(0.3, Math.min(1, dist / HOME.r)));
        if (Math.abs(shrink - (s.lastShrink || 0)) > 1e-5) {
          s.lastShrink = shrink;
          for (let i = 0; i < s.arcMats.length; i++) s.arcMats[i].uniforms.uShrink.value = shrink;
        }
        updateOverlay();
        s.renderer.render(s.scene, s.camera);
      };
      tick();

      rebuildAll();

      // Country and city labels are measured once for the on-disc test; the
      // webfont can arrive after the first frame and change how wide a word is,
      // so drop the cached sizes and re-measure in one batch.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          const s = st.current; if (!s) return;
          for (let i = 0; i < s.overlay.children.length; i++) {
            const el = s.overlay.children[i];
            if (el._country || el._cityLabel) { el._w = 0; el._h = 0; }
          }
          measureLabels();
        });
      }

      return () => {
        ro.disconnect();
        alive = false;
        if (st.current) {
          cancelAnimationFrame(st.current.raf);
          if (st.current.ktx2) st.current.ktx2.dispose();
          st.current.controls.removeEventListener('change', reportCenter);
          st.current.controls.dispose();
          // The cached earth texture outlives this mount — it is the whole
          // point of the cache, and disposing it would send the next switch
          // back to the transcoder.
          const keep = earthCache ? earthCache.texture : null;
          st.current.scene.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
              const ms = Array.isArray(o.material) ? o.material : [o.material];
              ms.forEach((m) => { if (m.map && m.map !== keep) m.map.dispose(); m.dispose(); });
            }
          });
          st.current.renderer.domElement.removeEventListener('pointerdown', onDown);
          st.current.renderer.domElement.removeEventListener('click', onClick);
          st.current.renderer.dispose();
          st.current.renderer.domElement.remove();
          st.current.overlay.remove();
          st.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Drag sensitivity. OrbitControls turns 2π/clientHeight radians per
    // pixel — roughly four times what the surface under your finger actually
    // travels, which is why dragging felt twitchy (worst on a phone, where
    // the globe is small). Matching the two gives 1:1 grabbing at every zoom
    // level and on every screen:
    //   speed = (distance − 1) · tan(fov/2) / π
    // Recomputed each frame because it depends on where the camera is.
    function syncDragSpeed() {
      const s = st.current; if (!s) return;
      const d = s.camera.position.length();
      const k = (d - 1) * Math.tan((s.camera.fov / 2) * Math.PI / 180) / Math.PI;
      s.controls.rotateSpeed = Math.max(0.04, Math.min(0.6, k));
    }

    function size() {
      const s = st.current; if (!s) return;
      const el = ref.current; if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      s.w = w; s.h = h;
      s.camera.aspect = w / h;
      s.camera.updateProjectionMatrix();
      s.renderer.setSize(w, h);
    }

    // The opening move, driven every frame from the tick so it composes with
    // the spin and with damping instead of fighting them: only the distance to
    // the centre changes, and the direction is whatever the frame already has.
    // A grab, a wheel or a fly-to cancels it (s.intro = null).
    function stepIntro() {
      const s = st.current;
      const it = s && s.intro;
      if (!it) return;
      const t = Math.min(1, (performance.now() - it.start) / it.dur);
      const e = t * t * (3 - 2 * t); // smoothstep: soft at both ends
      s.camera.position.setLength(it.from * (1 + (INTRO_ZOOM - 1) * e));
      if (t >= 1) s.intro = null;
    }

    function stepTween() {
      const s = st.current;
      const tw = s && s.tween;
      if (!tw) return;
      const t = Math.min(1, (performance.now() - tw.start) / tw.dur);
      const e = 1 - Math.pow(1 - t, 3);
      s.controls.target.lerpVectors(tw.fromT, tw.toT, e);
      // Swing the camera *around* the globe instead of sliding it through the
      // middle: a straight line between two points on a sphere passes under
      // the surface, so a Rio→Tokyo selection used to dive inside the planet
      // and pop back out. Interpolating the bearing and the distance to the
      // centre keeps the whole flight outside the surface and reads as an
      // orbit rather than a cut with a zoom baked in.
      tw.tmpQ.identity().slerp(tw.rot, e);
      tw.tmpV.copy(tw.fromDir).applyQuaternion(tw.tmpQ);
      s.camera.position.copy(tw.tmpV)
        .multiplyScalar(tw.fromR + (tw.toR - tw.fromR) * e);
      if (t >= 1) {
        s.tween = null;
        s.controls.enabled = true;
      }
    }

    function flyTo(targetPos, camPos, dur) {
      const s = st.current; if (!s) return;
      s.intro = null;
      if (s.noMotion) {
        s.tween = null;
        s.controls.target.copy(targetPos);
        s.camera.position.copy(camPos);
        s.controls.enabled = true;
        return;
      }
      const fromP = s.camera.position.clone();
      const fromDir = fromP.clone().normalize();
      const toDir = camPos.clone().normalize();
      const angle = fromDir.angleTo(toDir);
      s.tween = {
        start: performance.now(),
        // Near hops settle quickly; an intercontinental swing earns its
        // ~1.3s. A fixed duration made both feel wrong in opposite ways.
        dur: dur || 520 + 800 * (angle / Math.PI),
        fromT: s.controls.target.clone(), toT: targetPos.clone(),
        fromDir, toDir,
        fromR: fromP.length(), toR: camPos.length(),
        rot: new window.THREE.Quaternion().setFromUnitVectors(fromDir, toDir),
        tmpQ: new window.THREE.Quaternion(),
        tmpV: new window.THREE.Vector3(),
      };
      s.controls.enabled = false;
      s.controls.autoRotate = false;
    }

    function arcBetween(a, b, color) {
      // Great-circle slerp lifted above the surface (Flighty-style arcs),
      // rendered as a real 3D tube with an animated dashed glow shader.
      // (THREE.Line is always 1px in WebGL — thin, aliased, no glow —
      // which is why the old LineDashedMaterial looked fuzzy.)
      const va = llv(a[0], a[1], 1).normalize();
      const vb = llv(b[0], b[1], 1).normalize();
      const angle = va.angleTo(vb);
      const lift = 0.008 + 0.10 * Math.min(1, angle / Math.PI);
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const t = i / 48;
        const v = va.clone().lerp(vb, t).normalize()
          .multiplyScalar(1.005 + lift * Math.sin(Math.PI * t));
        pts.push(v);
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const len = curve.getLength();
      // Keep world-space dash period ~0.014: short duty + tight spacing
      // reads as a dotted series.
      const dashCount = Math.max(4, Math.round(len / 0.014));
      const geo = new THREE.TubeGeometry(curve, 64, ARC_R, 6, false);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color || 0xe8823f) },
          uTime: { value: 0 },
          uDashCount: { value: dashCount },
          uOpacity: { value: 0.95 },
          uShrink: { value: 0 },
        },
        // uShrink slides verts inward along the tube normals to thin the
        // line without rebuilding geometry (driven by zoom in tick()).
        vertexShader: 'varying vec2 vUv; uniform float uShrink; void main(){ vUv = uv; vec3 p = position - normal * uShrink; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
        fragmentShader: [
          'varying vec2 vUv;',
          'uniform vec3 uColor;',
          'uniform float uTime;',
          'uniform float uDashCount;',
          'uniform float uOpacity;',
          'void main(){',
          // Flow toward the destination (vUv.x = 0 at origin, 1 at dest).
          '  float x = fract(vUv.x * uDashCount - uTime * 1.2);',
          // Dot-like dash: short duty with soft edges (~20% of each cell).
          '  float dash = smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.15, 0.20, x));',
          // Fade the tube ends so dashes dissolve into the city dots.
          '  float ends = smoothstep(0.0, 0.03, vUv.x) * (1.0 - smoothstep(0.97, 1.0, vUv.x));',
          '  float a = dash * ends * uOpacity;',
          '  if (a < 0.003) discard;',
          '  gl_FragColor = vec4(uColor, a);',
          '}',
        ].join('\n'),
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 3;
      mesh.userData.arcMat = mat;
      return mesh;
    }

    // Screen-space circle the planet occupies. The camera always looks at the
    // globe's centre (OrbitControls targets the origin, even when a chapter is
    // selected), so the silhouette is a circle at the screen centre with
    // radius f·R/√(d²−R²) for R = 1.
    function globeDisc() {
      const s = st.current;
      const d = s.camera.position.length();
      const f = (s.h * 0.5) / Math.tan((s.camera.fov * Math.PI) / 360);
      return {
        cx: s.w * 0.5,
        cy: s.h * 0.5,
        r: d > 1 ? f / Math.sqrt(d * d - 1) : f,
      };
    }

    // Label widths for the on-disc test and the declutter pass. offsetWidth
    // forces layout, so it is measured in one batch (measureLabels) instead of
    // per element per frame — a hundred separate reads on first paint is a
    // visible hitch. Invalidated once the webfont lands, since the fallback mono
    // face can be wider than JetBrains Mono.
    function labelSize(el) {
      if (!el._w) return [el.offsetWidth || 1, el.offsetHeight || 1];
      return [el._w, el._h];
    }

    // One layout for the whole label layer: unhide the ones currently parked,
    // read every box, then restore. Called when the pins are rebuilt and when
    // the font arrives.
    function measureLabels() {
      const s = st.current; if (!s) return;
      const list = [];
      for (let i = 0; i < s.overlay.children.length; i++) {
        const el = s.overlay.children[i];
        if (el._country || el._cityLabel) list.push(el);
      }
      const parked = [];
      list.forEach((el) => {
        if (el.style.display === 'none') { el.style.display = ''; parked.push(el); }
      });
      list.forEach((el) => { el._w = el.offsetWidth || 1; el._h = el.offsetHeight || 1; });
      parked.forEach((el) => { el.style.display = 'none'; });
    }

    function updateOverlay() {
      const s = st.current; if (!s) return;
      // project() reads camera.matrixWorldInverse, which only the renderer
      // refreshes inside render(). OrbitControls has already moved the camera
      // by this point, so without this line every label is placed with last
      // frame's matrix while the planet is drawn with the current one — the
      // pins and country names skate a frame behind the globe as it turns.
      s.camera.updateMatrixWorld();
      const disc = globeDisc();
      // Tangency latitude for a sphere of radius 1 seen from d: the horizon is
      // n·ĉ = 1/d, not 0. Anything below it is behind the planet's body.
      const horizon = 1 / s.camera.position.length();
      const kids = s.overlay.children;
      // Labels that survive the on-disc test, for the declutter pass below.
      // Filled in DOM order, resolved after every position is known.
      const cand = [];
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i];
        if (el._hidden) {
          el.style.display = 'none';
          continue;
        }
        const a = el._anchor;
        if (!a) continue;
        const wp = llv(a[0], a[1], 1);
        const facing = wp.clone().normalize().dot(s.camera.position.clone().normalize());
        // Visible cap, not the front hemisphere. A point with n·ĉ between
        // R/d and 0 is past the limb but still on the camera's side, so it
        // projects *inside* the disc and draws through the planet — that is
        // how a CUBA label survived on the wrong side of the world.
        if (facing < horizon) {
          el.style.display = 'none';
          el._shown = false;
          continue;
        }
        const sp = wp.clone().project(s.camera);
        const x = (sp.x * 0.5 + 0.5) * s.w;
        const y = (-sp.y * 0.5 + 0.5) * s.h;
        // A city name hangs under its dot; countries and pins sit on the point.
        const ly = el._cityLabel ? y + CITY_LABEL_DY : y;
        el.style.display = null;
        el.style.transform = el._country
          ? `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`
          : el._cityLabel
            ? `translate3d(${x.toFixed(1)}px,${ly.toFixed(1)}px,0) translate(-50%,0)`
            : `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        if (el._country || el._cityLabel) {
          // A label belongs to the map only while the whole word sits on the
          // planet. Anchored at a surface point, its centre is inside the limb
          // while half the text hangs off into space — that reads as a floating
          // HUD callout, not a place name. Fade over the last 14px of travel
          // instead of toggling a class at the edge: a binary threshold flaps
          // when a slow drag jitters by a pixel at the rim. Opacity is
          // continuous, so the same jitter is invisible.
          const [lw, lh] = labelSize(el);
          const lyc = el._cityLabel ? ly + lh / 2 : y;
          const ox = Math.abs(x - disc.cx) + lw / 2;
          const oy = Math.abs(lyc - disc.cy) + lh / 2;
          // Inside the planet *and* inside the frame. On a phone the globe is
          // wider than the screen, so a label can sit well inside the limb and
          // still run off the viewport edge — it used to be cut mid-word by
          // .eq-pins' overflow. Fade at whichever edge comes first.
          const inside = Math.min(
            disc.r - Math.sqrt(ox * ox + oy * oy),
            x - lw / 2,
            s.w - (x + lw / 2),
            lyc - lh / 2,
            s.h - (lyc + lh / 2),
          );
          const fade = Math.max(0, Math.min(1, inside / 14));
          el.style.opacity = fade === 1 ? '' : fade.toFixed(3);
          if (fade < 0.6) {
            el._shown = false;
          } else {
            const dx = x - disc.cx, dy = lyc - disc.cy;
            cand.push({ el, x, y: lyc, w: lw, h: lh, pri: el._pri || 0, dist: Math.sqrt(dx * dx + dy * dy) });
          }
        }
      }

      // Declutter: greedy, nearest-to-centre first. Font size is deliberately
      // zoom-invariant — scaling it with the globe would scale label widths
      // and anchor spacing by the same factor and leave every overlap exactly
      // where it was. The only thing that actually separates tight clusters
      // (Norway/Sweden/Finland at full-planet zoom) is dropping the labels
      // that collide, which is what a map does as you zoom out. Zooming in
      // spreads the anchors and they come back.
      //
      // Priority decides *which* label gives way when two collide: today's
      // cities first, then the rest of the itinerary, then country names. They
      // are scored in pixels so a bonus reads as "up to N px closer to the
      // centre". Labels already on screen get an 8px head start, so two labels
      // sitting at the same distance cannot trade places frame after frame.
      cand.sort((a, b) => (a.dist - a.pri - (a.el._shown ? 8 : 0)) - (b.dist - b.pri - (b.el._shown ? 8 : 0)));
      const kept = [];
      for (let i = 0; i < cand.length; i++) {
        const c = cand[i];
        let clear = true;
        for (let j = 0; j < kept.length; j++) {
          const k = kept[j];
          // A few px of breathing room so two labels never touch.
          if (Math.abs(c.x - k.x) < (c.w + k.w) / 2 + 4
            && Math.abs(c.y - k.y) < (c.h + k.h) / 2 + 3) {
            clear = false;
            break;
          }
        }
        c.el._shown = clear;
        // The inner span carries the collision fade, so the continuous rim
        // opacity on the parent stays untouched.
        c.el.firstChild.classList.toggle('is-off', !clear);
        if (clear) kept.push(c);
      }
    }

    function pinEl(c) {
      const accent = chapterColor(c);
      const wrap = document.createElement('div');
      wrap.className = 'eq-pin-wrap';
      wrap._anchor = c.anchor;
      wrap._id = c.id;
      wrap._chId = c.id;
      wrap.innerHTML = `<div class="map-pin" data-chapter="${c.id}">`
        + `<div class="map-pin-num" style="--pin-c: ${accent};">${c.num == null ? '' : c.num}</div>`
        + `<div class="map-pin-label">${c.title}</div></div>`;
      wrap.querySelector('.map-pin').addEventListener('click', (e) => {
        e.stopPropagation();
        const cb = propsRef.current.onSelectChapter;
        if (cb) cb(c.id);
      });
      return wrap;
    }

    function cityEl(c, p, i) {
      const accent = chapterColor(c);
      const wrap = document.createElement('div');
      wrap.className = 'eq-pin-wrap eq-city-wrap';
      wrap._anchor = p.coords;
      wrap._chId = c.id;
      wrap.innerHTML = `<div class="map-place" data-chapter="${c.id}" data-idx="${i}">`
        + `<div class="map-place-dot" style="--pin-c: ${accent}"></div>`
        + `<div class="map-place-label">${i + 1}. ${p.name}</div></div>`;
      wrap.querySelector('.map-place').addEventListener('click', (e) => {
        e.stopPropagation();
        const pr = propsRef.current;
        if (pr.onSelectChapter) pr.onSelectChapter(c.id);
        if (pr.onSelectPlace) pr.onSelectPlace(i);
      });
      return wrap;
    }

    function countryEl(name, lng, lat) {
      const el = document.createElement('div');
      el.className = 'eq-country';
      el._anchor = [lat, lng];
      el._country = true;
      // Inner span: the rim fade drives the parent's opacity continuously,
      // while the declutter fade lives here so the two never fight over one
      // property.
      const span = document.createElement('span');
      span.textContent = name;
      el.appendChild(span);
      return el;
    }

    // The dot's hover pill carries the numbered stop ("3. Hongcun"), which is
    // the right label once a chapter is open. On the home view the same cities
    // need a name at rest, so the itinerary gets its own always-on label layer:
    // plain name, no number, and only the places the plan actually visits.
    const CITY_LABEL_DY = 8;

    // "Takayama + Shirakawa-go", "Cebu / Moalboal", "Sanur (arrival night)",
    // "Cappadocia — Göreme": a globe annotation is one town, so take the first
    // name in the list and drop the qualifier. The dot's pill keeps the full
    // string, which is what the chapter's spread is keyed to.
    function cityName(raw) {
      return String(raw || '').split(/\s+[+—–/]\s+|\s*\(/)[0].trim();
    }

    function cityLabelEl(c, p, i, pri) {
      const el = document.createElement('div');
      el.className = 'eq-city-label';
      el._anchor = p.coords;
      el._chId = c.id;
      el._idx = i;
      el._pri = pri;
      el._pri0 = pri;   // base rank; the picked stop lifts above it
      el._cityLabel = true;
      const span = document.createElement('span');
      span.textContent = cityName(p.name);
      el.appendChild(span);
      return el;
    }

    function rebuildAll() {
      const s = st.current; if (!s) return;
      const { onSelectChapter } = propsRef.current;
      s.overlay.innerHTML = '';
      COUNTRIES.forEach(([name, lng, lat]) => s.overlay.appendChild(countryEl(name, lng, lat)));
      const list = propsRef.current.chapters.filter((c) => c.kind !== 'transit' && c.anchor);
      // Which names win a collision is decided once, here: today's city beats
      // its neighbours (Huangshan and Hongcun are 15km apart), then today's
      // chapter, then the rest of the itinerary, then country names. Scored in
      // pixels, so a bonus reads as "up to N px closer to the centre".
      const now = window.TRIP_NOW ? window.TRIP_NOW.homeStop(list) : null;
      const cityPri = (c, i) => (!now ? 60
        : c.id !== now.chapter.id ? 60
        : i === now.idx ? 400 : 220);
      // The labels first, so the dots and pins paint over them.
      list.forEach((c) => {
        (c.places || []).forEach((p, i) => {
          if (p.coords) s.overlay.appendChild(cityLabelEl(c, p, i, cityPri(c, i)));
        });
      });
      // City dots in itinerary order; anchor fallback pins for chapters
      // without place coords.
      list.forEach((c) => {
        const withCoords = (c.places || [])
          .map((p, i) => ({ p, i }))
          .filter((s) => s.p.coords);
        if (withCoords.length) withCoords.forEach(({ p, i }) => s.overlay.appendChild(cityEl(c, p, i)));
        else s.overlay.appendChild(pinEl(c));
      });
      // route arcs through the city stops in travel order, each painted with
      // the starting dot's chapter color
      const stops = [];
      list.forEach((c) => {
        const withCoords = (c.places || []).filter((p) => p.coords);
        if (withCoords.length) withCoords.forEach((p) => stops.push({ coords: p.coords, ch: c }));
        else if (c.anchor) stops.push({ coords: c.anchor, ch: c });
      });
      while (s.arcs.children.length) {
        const l = s.arcs.children.pop();
        s.arcs.remove(l);
        l.geometry.dispose();
        l.material.dispose();
      }
      s.arcMats.length = 0;
      for (let i = 0; i + 1 < stops.length; i++) {
        const arc = arcBetween(stops[i].coords, stops[i + 1].coords, chapterColor(stops[i].ch));
        s.arcs.add(arc);
        if (arc.userData.arcMat) s.arcMats.push(arc.userData.arcMat);
      }
      void onSelectChapter;
      measureLabels();
      refreshSelection();
    }

    function refreshSelection() {
      const s = st.current; if (!s) return;
      const { selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters } = propsRef.current;
      [...s.overlay.children].forEach((el) => {
        const pin = el.querySelector('.map-pin');
        if (pin) pin.classList.toggle('is-active', el._id === selectedId);
      });
      // Hide the whole-route city dots of the selected chapter (re-rendered
      // below as their own numbered markers); updateOverlay honors _hidden. The
      // names stay: the numbered pill is hover-only, so dropping the label too
      // would leave the chapter you just opened as the only unlabelled one.
      [...s.overlay.children].forEach((el) => {
        if (el.classList && el.classList.contains('eq-city-wrap')) {
          el._hidden = el._chId === selectedId;
        }
      });
      [...s.overlay.querySelectorAll('.eq-place-wrap')].forEach((el) => el.remove());
      // The stop you picked keeps its name. Its neighbour can be 15km away and
      // outrank it on proximity alone, which leaves the highlighted dot wearing
      // the wrong word (Huangshan highlighted, "Hongcun" beside it).
      for (let i = 0; i < s.overlay.children.length; i++) {
        const el = s.overlay.children[i];
        if (!el._cityLabel) continue;
        const picked = el._chId === selectedId && el._idx != null && el._idx === selectedPlaceIdx;
        el._pri = el._pri0 + (picked ? 300 : 0);
      }
      s.controls.autoRotate = !selectedId && !s.spinOff;

      if (!selectedId) {
        // Panel just closed: make sure the orbit target is back at the
        // globe center (and cancel any interrupted fly-to) so rotate/pan
        // behaves normally again instead of orbiting a surface point.
        s.tween = null;
        s.controls.enabled = true;
        if (s.controls.target.length() > 1e-6) s.controls.target.set(0, 0, 0);
        return;
      }
      const ch = chapters.find((c) => c.id === selectedId);
      if (!ch) return;
      const accent = chapterColor(ch);
      ch.places.forEach((p, i) => {
        if (!p.coords) return;
        const wrap = document.createElement('div');
        wrap.className = 'eq-pin-wrap eq-place-wrap';
        wrap._anchor = p.coords;
        wrap.innerHTML = `<div class="map-place${i === selectedPlaceIdx ? ' is-active' : ''}">`
          + `<div class="map-place-dot" style="--pin-c: ${accent}"></div>`
          + `<div class="map-place-label">${i + 1}. ${p.name}</div></div>`;
        wrap.querySelector('.map-place').addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectChapter) onSelectChapter(ch.id);
          if (onSelectPlace) onSelectPlace(i);
        });
        s.overlay.appendChild(wrap);
      });

      // Fly the camera to face the chapter. The orbit target stays at the
      // globe center — targeting a surface point would leave OrbitControls
      // orbiting off-center after the panel closes, making pan/zoom feel
      // broken until the next "back to whole route". A selected stop pulls
      // the camera closer and off the chapter's anchor so the day's city,
      // not the whole chapter, is what fills the frame.
      const focused = selectedPlaceIdx != null ? ch.places[selectedPlaceIdx] : null;
      if (focused && focused.coords) {
        // Sits just outside OrbitControls' minDistance; any closer and the
        // first wheel tick would snap the camera back out.
        const md = (st.current && st.current.minDist) || DEFAULT_MIN_DIST;
        const camPos = llv(focused.coords[0], focused.coords[1], md + 0.14);
        flyTo(new window.THREE.Vector3(0, 0, 0), camPos);
      } else if (ch.anchor) {
        // "Back to where I am" frames the town, matching the landing view; any
        // other chapter frames its anchor, which is what its spread describes.
        let at = ch.anchor;
        const hereCh = window.TRIP_NOW && window.TRIP_NOW.currentChapter(chapters);
        if (hereCh && hereCh.id === ch.id) {
          const w = window.TRIP_NOW.currentCity(chapters);
          if (w && w.place && w.place.coords) at = w.place.coords;
        }
        const camPos = llv(at[0], at[1], 2.35);
        flyTo(new window.THREE.Vector3(0, 0, 0), camPos);
      }
    }

    // ── rebuild pins + route when chapters change ─────────────────────────
    const chapKey = chapters.map((c) => c.id + ':' + (c.anchor || []).join(',') + ':' + (c.places || []).map((p) => (p.coords || []).join(',')).join(';')).join('|');
    React.useEffect(() => {
      if (st.current) rebuildAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapKey]);

    // ── selection ─────────────────────────────────────────────────────────
    React.useEffect(() => {
      if (st.current) refreshSelection();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, selectedPlaceIdx, chapters]);

    // ── external recentre trigger ─────────────────────────────────────────
    // "Whole route" now means "back to where I am", which is the selected
    // chapter — and a bump that changes nothing else, so it has to re-run the
    // framing explicitly. With nothing selected it is still the whole planet.
    React.useEffect(() => {
      const s = st.current; if (!s || !focusKey) return;
      if (propsRef.current.selectedId) { refreshSelection(); return; }
      flyTo(new window.THREE.Vector3(0, 0, 0), llv(HOME.lat, HOME.lng, HOME.r));
      s.spinOff = false;
      s.controls.autoRotate = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusKey]);

    // ── opening move ──────────────────────────────────────────────────────
    // Waits for the cover to lift: a move behind a dark curtain is spent before
    // anyone sees it. A chapter that arrives already selected (deep link) keeps
    // its own closer framing, and reduced-motion lands directly on the end
    // distance instead of travelling there. Arriving with a zoom from the other
    // map is a resume, not an opening — it opens where that view left off and
    // stays there.
    React.useEffect(() => {
      const s = st.current; if (!s || !intro || s.introDone) return;
      s.introDone = true;
      if (propsRef.current.selectedId || initialZoom != null) return;
      if (s.noMotion) { s.camera.position.setLength(s.camera.position.length() * INTRO_ZOOM); return; }
      s.intro = { start: performance.now(), from: s.camera.position.length(), dur: INTRO_MS };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intro]);

    // CDN guard — render a message instead of a blank globe when the
    // Three.js scripts failed to load. (Placed after all hooks.)
    if (!window.THREE) {
      return <div className="map-container is-globe"><div className="map-fallback"><div className="kicker">3D globe unavailable</div><p>Three.js failed to load. Check your connection and retry.</p></div></div>;
    }

    return <div ref={ref} className="map-container is-globe" style={{ width: '100%', height: '100%' }} />;
  }

  window.GlobeView = GlobeView;
})();
