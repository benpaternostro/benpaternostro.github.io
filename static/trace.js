/* The effects on the home page: the career waterfall, the two ridges of lines, the clock in the top
   bar and the text that settles into place. Everything here is progressive: without this script
   the page is a plain, complete list. The colours come from styles.css. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const make = (tag, cls, parent) => { const n = document.createElement(tag); if (cls) n.className = cls; if (parent) parent.appendChild(n); return n; };

  /* ---------- Time axis: January of the first role's year to December of this year, in months ----------
     Each role carries its dates as the résumé data writes them: "Sep 2026", or "Present". */
  const section = document.getElementById('career');
  const list = section.querySelector('.career');
  const rows = [...list.children];
  const roleEls = [...list.querySelectorAll('.role')];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const stamp = (s) => { const [mon, year] = s.split(' '); return Number(year) * 12 + MONTHS.indexOf(mon); };
  const isNow = (n) => n.dataset.end === 'Present';
  const AXIS_YEAR = Math.floor(Math.min(...roleEls.map((r) => stamp(r.dataset.start))) / 12);
  const monthOf = (s) => stamp(s) - AXIS_YEAR * 12;
  const startOf = (n) => monthOf(n.dataset.start);
  // "Now" is never before the newest date on the page, so a clock that is set wrong cannot turn a bar inside out.
  const today = new Date();
  const nowM = Math.max((today.getFullYear() - AXIS_YEAR) * 12 + today.getMonth() + today.getDate() / 31,
    ...roleEls.map((r) => (isNow(r) ? startOf(r) : monthOf(r.dataset.end)) + 1));
  const YEARS = Math.ceil(nowM / 12), AXIS_MONTHS = YEARS * 12;
  const endOf = (n) => (isNow(n) ? nowM : monthOf(n.dataset.end) + 1); // end month is inclusive
  const monthName = (m) => MONTHS[Math.floor(m) % 12] + ' ' + (AXIS_YEAR + Math.floor(m / 12));
  const frac = (m) => m / AXIS_MONTHS;
  const pct = (f) => (f * 100).toFixed(3) + '%';

  /* ---------- Waterfall: built from the data attributes ---------- */
  section.style.setProperty('--now', frac(nowM).toFixed(5));
  section.style.setProperty('--years', YEARS); // the stylesheet spaces the year lines with it

  const axis = make('div', 'axis');
  axis.setAttribute('aria-hidden', 'true');
  const axisTrack = make('div', 'axis-track', axis);
  for (let y = 0; y < YEARS; y++) {
    const t = make('span', 'tick' + (y % 2 ? ' odd' : ''), axisTrack);
    t.style.left = pct(frac(y * 12));
    t.textContent = AXIS_YEAR + y;
  }
  make('span', 'now-tick', axisTrack);
  const wrap = make('div', 'wf-wrap');
  list.before(wrap);
  wrap.append(axis, list);

  const roleBars = [];
  const bars = rows.map((li) => {
    const roles = [...li.querySelectorAll('.role')].sort((a, b) => startOf(a) - startOf(b));
    const s = startOf(roles[0]), e = Math.max(...roles.map(endOf)), live = roles.some(isNow);
    const track = make('span', 'track');
    track.setAttribute('aria-hidden', 'true');
    track.style.setProperty('--s', frac(s).toFixed(5));
    track.style.setProperty('--e', frac(e).toFixed(5));
    const bar = make('span', 'bar' + (live ? ' live' : ''), track);
    roles.forEach((r, i) => {
      const rs = startOf(r), re = endOf(r);
      const seg = make('span', 'seg' + (i ? ' notch' : '') + (i === roles.length - 1 ? ' last' : ''), bar);
      seg.dataset.kind = r.dataset.kind;
      seg.style.left = pct((rs - s) / (e - s));
      seg.style.width = pct((re - rs) / (e - s));
      // The role's own thin bar inside the opened row, on the same axis.
      const rt = make('span', 'rtrack');
      rt.setAttribute('aria-hidden', 'true');
      rt.style.setProperty('--s', frac(rs).toFixed(5));
      rt.style.setProperty('--e', frac(re).toFixed(5));
      make('span', 'rbar', rt).dataset.kind = r.dataset.kind;
      roleBars.push({ el: rt, m0: rs, m1: re });
      r.querySelector('.role-dates').after(rt);
    });
    if (live) make('span', 'cap', bar);
    const ls = make('span', 'lab lab-s', track);
    ls.textContent = monthName(s);
    const le = make('span', 'lab lab-e' + (live ? ' live' : ''), track);
    le.textContent = live ? 'Now' : monthName(e - 1);
    const lr = make('span', 'lab lab-r' + (live ? ' live' : '') + ((s + e) / 2 > AXIS_MONTHS / 2 ? ' end' : ''), track);
    lr.textContent = monthName(s) + ' to ' + (live ? 'now' : monthName(e - 1));
    li.querySelector('h3').after(track);
    // The row's colours, in proportion, for the highlight on the sticky axis.
    const grad = 'linear-gradient(90deg,' + roles.map((r) => `var(--${r.dataset.kind}) ${pct((startOf(r) - s) / (e - s))} ${pct((endOf(r) - s) / (e - s))}`).join(',') + ')';
    return { li, track, bar, s: frac(s), e: frac(e), m0: s, m1: e, grad, f: 1, t0: -1, from: 0, inView: false };
  });
  section.classList.add('wf');

  /* ---------- Layout cache: read once, and again only when the width changes ---------- */
  let trackW = 0, trackL = 0, pageW = 0, rowBoxes = [], listTop = 0, listBottom = 0;
  function measureRows() {
    const y = scrollY, lr = list.getBoundingClientRect();
    listTop = lr.top + y; listBottom = lr.bottom + y;
    rowBoxes = bars.map((b) => { const r = b.li.getBoundingClientRect(); return [r.top + y, r.bottom + y]; });
  }
  function measure() {
    const lr = list.getBoundingClientRect(), tr = bars[0].track.getBoundingClientRect();
    trackW = tr.width; trackL = tr.left; pageW = root.clientWidth;
    wrap.style.setProperty('--tx', (tr.left - lr.left).toFixed(1) + 'px');
    wrap.style.setProperty('--tw', trackW.toFixed(1) + 'px');
    measureRows();
  }
  let lastW = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; requestAnimationFrame(measure); } });
  measure();
  if (document.fonts) document.fonts.ready.then(measure);
  addEventListener('load', measureRows);

  /* ---------- One animation loop for the whole page ----------
     Effects register a task; a task returns false when it has nothing left to do. */
  const tasks = new Set();
  let raf = 0;
  function frame(t) {
    raf = 0;
    for (const fn of tasks) if (fn(t) === false) tasks.delete(fn);
    if (tasks.size && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function run(fn) { tasks.add(fn); if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && tasks.size && !raf) raf = requestAnimationFrame(frame); });

  // Pills on the axis stay fully inside the page, even at the very ends of the axis.
  const pillX = (x, half) => Math.max(half + 4 - trackL, Math.min(pageW - trackL - half - 4, x)).toFixed(1);

  /* ---------- Playback: a playhead sweeps from the first year to now, and each bar grows as it passes ----------
     A bar grows only while it is on screen. One that was off screen grows on its own when it arrives. */
  const nowF = frac(nowM), SWEEP = 2400, GROW = 700;
  const easeInOut = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const playhead = make('div', 'playhead', wrap);
  const phRead = make('span', 'pill ph-read', axisTrack);
  let sweepT0 = -1, sweepOn = false, ph = 0, phYear = -1;

  function setBar(b, f) {
    if (f === b.f) return;
    b.f = f;
    b.track.classList.toggle('grow', f < 1);
    // inset(50%) is an empty clip: a zero-width inset would still leak an anti-aliased sliver.
    b.bar.style.clipPath = f >= 1 ? '' : f <= 0 ? 'inset(50%)' : 'inset(-12px ' + ((1 - f) * 100).toFixed(2) + '% -12px -12px)';
  }
  function growSolo(b, t) { b.from = b.f; b.t0 = t; }
  function waterfallTick(t) {
    let busy = false;
    if (sweepOn) {
      if (sweepT0 < 0) sweepT0 = t;
      const k = Math.min(1, (t - sweepT0) / SWEEP);
      ph = nowF * easeInOut(k);
      const x = ph * trackW;
      playhead.style.transform = `translateX(${x.toFixed(1)}px)`;
      phRead.style.transform = `translateX(${pillX(x, 28)}px)`;
      const yr = AXIS_YEAR + Math.min(YEARS - 1, Math.floor(ph * YEARS));
      if (yr !== phYear) { phYear = yr; phRead.textContent = yr; }
      section.style.setProperty('--ph', ph.toFixed(4));
      for (const b of bars) if (b.inView && b.t0 < 0 && ph > b.s) setBar(b, Math.max(b.f, Math.min(1, (ph - b.s) / (b.e - b.s))));
      if (k >= 1) {
        sweepOn = false;
        section.classList.remove('playing');
        for (const b of bars) if (b.inView && b.f < 1 && b.t0 < 0) growSolo(b, t);
      }
      busy = true;
    }
    for (const b of bars) {
      if (b.t0 < 0) continue;
      const k = Math.min(1, (t - b.t0) / GROW);
      setBar(b, b.from + (1 - b.from) * easeOut(k));
      if (k < 1) busy = true; else b.t0 = -1;
    }
    return busy;
  }

  if (!reduced) {
    for (const b of bars) setBar(b, 0);
    const byTrack = new Map(bars.map((b) => [b.track, b]));
    const seen = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const b = byTrack.get(en.target);
        b.inView = en.isIntersecting;
        // Arrived after the playhead went past it: grow it now rather than leave it empty.
        if (b.inView && b.f < 1 && b.t0 < 0 && ph > b.s) { growSolo(b, performance.now()); run(waterfallTick); }
      }
    });
    bars.forEach((b) => seen.observe(b.track));
    // Play once, when the top of the list is a little above the middle of the screen.
    const start = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      start.disconnect();
      sweepOn = true;
      section.classList.add('playing');
      run(waterfallTick);
    }, { rootMargin: '0px 0px -45% 0px' });
    start.observe(list);
  }

  /* ---------- Inspect (mouse): a crosshair with the month under it ---------- */
  const xhair = make('div', 'xhair', wrap);
  const xRead = make('span', 'pill xread', axisTrack);
  let xMonth = -1;
  function crossOff() {
    if (xMonth < 0) return;
    xMonth = -1;
    wrap.classList.remove('x-on');
    for (const b of bars) b.li.classList.remove('is-hit');
    for (const r of roleBars) r.el.classList.remove('is-hit');
  }
  wrap.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const x = e.clientX - trackL;
    if (x < 0 || x >= trackW) { crossOff(); return; }
    xhair.style.transform = `translateX(${x.toFixed(1)}px)`;
    xRead.style.transform = `translateX(${pillX(x, 44)}px)`;
    const m = Math.floor((x / trackW) * AXIS_MONTHS);
    if (m === xMonth) return;
    xMonth = m;
    xRead.textContent = monthName(m);
    wrap.classList.add('x-on');
    for (const b of bars) b.li.classList.toggle('is-hit', m >= b.m0 && m < b.m1);
    for (const r of roleBars) r.el.classList.toggle('is-hit', m >= r.m0 && m < r.m1);
  }, { passive: true });
  wrap.addEventListener('pointerleave', crossOff);

  /* ---------- Active row: its range is marked on the sticky axis ----------
     Touch screens: the row nearest the middle of the screen, as the list scrolls.
     Mouse and keyboard: the row under the pointer or with focus. */
  const scrub = make('span', 'scrub', axisTrack);
  let active = null;
  function setActive(b) {
    if (b === active) return;
    if (active) active.li.classList.remove('is-active');
    active = b;
    scrub.classList.toggle('on', !!b);
    if (!b) return;
    b.li.classList.add('is-active');
    scrub.style.left = pct(b.s);
    scrub.style.width = pct(b.e - b.s);
    scrub.style.setProperty('--grad', b.grad);
  }
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  function scrubTick() {
    const mid = scrollY + innerHeight / 2;
    let best = null;
    if (mid > listTop && mid < listBottom) {
      let bd = Infinity;
      rowBoxes.forEach(([top, bottom], i) => {
        const d = mid < top ? top - mid : mid > bottom ? mid - bottom : 0;
        if (d < bd) { bd = d; best = bars[i]; }
      });
    }
    setActive(best);
    return false;
  }
  addEventListener('scroll', () => { if (!fine.matches) run(scrubTick); }, { passive: true });
  bars.forEach((b) => {
    b.li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive(b); });
    b.li.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && active === b) setActive(null); });
    b.li.querySelector('summary').addEventListener('focus', () => setActive(b));
    b.li.querySelector('summary').addEventListener('blur', () => { if (active === b && fine.matches) setActive(null); });
  });

  /* ---------- The signal ridge ----------
     Lines drawn back to front; each fills under itself with the page colour, so lines in front hide
     the ones behind. Every line is a damped string (1D wave equation) pulled towards a slowly
     drifting noise shape under a window that keeps the edges flat, and pushed by the mouse, a
     finger, a tap or a fast scroll. Physics runs at a fixed 120 steps a second on any device. */
  const touchUI = !fine.matches;
  const STEP = 1000 / 120, HARM = 4;
  // The canvas draws in the page's colours, read once from the stylesheet (plain six-digit hex there).
  const ink = (() => {
    const cs = getComputedStyle(root), get = (name) => cs.getPropertyValue(name).trim();
    const rgb = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255); };
    const line = rgb(get('--ridge')), hot = rgb(get('--hot'));
    return { bg: get('--bg'), line, glow1: `rgba(${hot},.5)`, glow2: `rgba(${hot},.95)`, kinds: [get('--build'), get('--test'), get('--run')] };
  })();
  const ridges = [];
  const seeded = (n) => () => ((n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296);

  function makeRidge(host, o) {
    if (!host) return;
    const cvs = make('canvas', '', host);
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const rnd = seeded(o.seed);
    let N = touchUI ? o.phoneLines : o.lines, P = touchUI ? 96 : 160, dpr = Math.min(devicePixelRatio || 1, touchUI ? 1.5 : 2);
    let W = 0, H = 0, left = 0, docTop = 0, gap = 1, amp = 1;
    let u, v, tg, win, en, sinK, cosK, xs, ys, base, par, strokes = [];
    let running = false, last = 0, acc = 0, frames = 0, slow = 0, level = 0, nextPacket = 0;
    const R = { on: false, gust: 0 };
    const ptr = { on: false, x: 0, y: 0, speed: 0, t: 0 };
    const packets = [0, 1, 2].map(() => ({ on: false, line: 0, pos: 0, v: 0, c: 0, age: 0 }));

    function build(np) {
      const oldU = u, oldV = v, op = P;
      P = np;
      u = new Float32Array(N * P); v = new Float32Array(N * P); tg = new Float32Array(N * P); win = new Float32Array(N * P);
      sinK = new Float32Array(N * HARM * P); cosK = new Float32Array(N * HARM * P);
      xs = new Float32Array(P); ys = new Float32Array(P);
      if (!par) {
        base = new Float32Array(N); en = new Float32Array(N); par = [];
        for (let i = 0; i < N; i++) par.push({
          c: .5 + (rnd() - .5) * .18, w: .15 + rnd() * .09, a: .5 + rnd() * .5,
          k: [1.2 + rnd() * 1.6, 3.4 + rnd() * 2.8, 7 + rnd() * 5, 16 + rnd() * 8],
          ph: [0, 0, 0, 0].map(() => rnd() * 6.3), sp: [.8, 1.3, 1.9, 3].map((x) => (rnd() - .5) * x),
        });
      }
      for (let i = 0; i < N; i++) {
        const { c, w, k } = par[i];
        for (let j = 0; j < P; j++) {
          const x = j / (P - 1), d = (x - c) / w;
          win[i * P + j] = Math.exp(-d * d * d * d); // flat top in the middle, flat at the edges
          for (let h = 0; h < HARM; h++) { const q = (i * HARM + h) * P + j; sinK[q] = Math.sin(k[h] * 6.2832 * x); cosK[q] = Math.cos(k[h] * 6.2832 * x); }
        }
      }
      // A step down in resolution keeps the strings where they were, so it is seamless.
      if (oldU) for (let i = 0; i < N; i++) for (let j = 0; j < P; j++) {
        const x = (j / (P - 1)) * (op - 1), j0 = Math.floor(x), j1 = Math.min(op - 1, j0 + 1), f = x - j0;
        u[i * P + j] = oldU[i * op + j0] * (1 - f) + oldU[i * op + j1] * f;
        v[i * P + j] = oldV[i * op + j0] * (1 - f) + oldV[i * op + j1] * f;
      }
      W = 0; // force a resize on the next layout
    }

    function layout() {
      const r = host.getBoundingClientRect();
      docTop = r.top + scrollY; left = r.left;
      if (r.width === W && r.height === H) return;
      W = r.width; H = r.height;
      cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
      const top = H * o.top;
      gap = (H - o.bottom - top) / N; amp = H * o.amp;
      for (let i = 0; i < N; i++) base[i] = top + (i + 1) * gap;
      for (let j = 0; j < P; j++) xs[j] = (j / (P - 1)) * W;
      // Line colours: faint at the back, full strength towards the front, fading out at both sides.
      strokes = [];
      for (let i = 0; i < N; i++) {
        const a = Math.min(1, .3 + .95 * Math.pow(i / (N - 1), 1.5)).toFixed(3), g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, `rgba(${ink.line},0)`); g.addColorStop(.12, `rgba(${ink.line},${a})`);
        g.addColorStop(.88, `rgba(${ink.line},${a})`); g.addColorStop(1, `rgba(${ink.line},0)`);
        strokes.push(g);
      }
      if (!running) { if (reduced) target(14, true); draw(); }
    }

    // The resting shape: four drifting harmonics per line under its window (no trig per point),
    // through a cubic so the valleys flatten and the peaks stand up like a pulsar trace.
    const cs = new Float32Array(HARM * 2);
    function target(t, still) {
      for (let i = 0; i < N; i++) {
        const p = par[i], A = amp * p.a * 1.9;
        for (let h = 0; h < HARM; h++) { cs[h * 2] = Math.cos(p.sp[h] * t + p.ph[h]); cs[h * 2 + 1] = Math.sin(p.sp[h] * t + p.ph[h]); }
        const q0 = i * HARM * P, q1 = q0 + P, q2 = q1 + P, q3 = q2 + P;
        for (let j = 0; j < P; j++) {
          const n = .5 * (sinK[q0 + j] * cs[0] + cosK[q0 + j] * cs[1]) + .28 * (sinK[q1 + j] * cs[2] + cosK[q1 + j] * cs[3])
            + .14 * (sinK[q2 + j] * cs[4] + cosK[q2 + j] * cs[5]) + .08 * (sinK[q3 + j] * cs[6] + cosK[q3 + j] * cs[7]);
          const q = .5 + .5 * n;
          tg[i * P + j] = win[i * P + j] * A * q * q * q;
        }
      }
      if (still) u.set(tg);
    }

    function step() {
      if (ptr.on) {
        const jx = ((ptr.x - left) / W) * (P - 1), push = o.push * (1 + Math.min(4, ptr.speed * 2));
        const j0 = Math.max(1, Math.floor(jx - 7)), j1 = Math.min(P - 2, Math.ceil(jx + 7));
        for (let i = 0; i < N; i++) {
          const dy = (base[i] - ptr.y) / (gap * 1.7);
          if (dy > 3 || dy < -3) continue;
          const wy = Math.exp(-dy * dy) * push;
          for (let j = j0; j <= j1; j++) { const dx = (j - jx) / 2.4; v[i * P + j] += wy * Math.exp(-dx * dx); }
        }
        ptr.speed *= .97;
      }
      if (R.gust > .02) {
        for (let i = 0; i < N; i++) v[i * P + 1 + ((rnd() * (P - 2)) | 0)] += (rnd() - .25) * R.gust * o.gust;
        R.gust *= .985;
      }
      for (let i = 0; i < N; i++) {
        const o0 = i * P;
        for (let j = 1; j < P - 1; j++) {
          const q = o0 + j;
          v[q] += .25 * (u[q - 1] - 2 * u[q] + u[q + 1]) + .02 * (tg[q] - u[q]) - .012 * v[q];
        }
        let m = 0;
        for (let j = 1; j < P - 1; j++) { const w = v[o0 + j]; u[o0 + j] += w; if (w > m) m = w; else if (-w > m) m = -w; }
        en[i] = m; // fastest point on this line, so draw() knows which strings are ringing
      }
    }

    function pulse(x, y, s) {
      const jx = ((x - left) / W) * (P - 1);
      const j0 = Math.max(1, Math.floor(jx - 4)), j1 = Math.min(P - 2, Math.ceil(jx + 4));
      for (let i = 0; i < N; i++) {
        const dy = (base[i] - y) / (gap * 4), wy = Math.exp(-dy * dy) * s;
        for (let j = j0; j <= j1; j++) { const dx = (j - jx) / 1.3; v[i * P + j] += wy * Math.exp(-dx * dx); }
      }
      wake();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = 'round';
      ctx.fillStyle = ink.bg;
      for (let i = 0; i < N; i++) {
        const by = base[i], o0 = i * P, floor = Math.min(H, by + gap * 3);
        // A string swinging below the canvas floor is drawn along it rather than vanishing.
        for (let j = 0; j < P; j++) { const y = by - u[o0 + j]; ys[j] = y > H - 1 ? H - 1 : y; }
        ctx.beginPath(); ctx.moveTo(0, floor);
        for (let j = 0; j < P; j++) ctx.lineTo(xs[j], ys[j]);
        ctx.lineTo(W, floor); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, ys[0]);
        for (let j = 1; j < P; j++) ctx.lineTo(xs[j], ys[j]);
        ctx.lineWidth = 1.25; ctx.strokeStyle = strokes[i]; ctx.stroke();
        // Plucked strings are redrawn in the second ink where they move fast, so a strum shows running outward.
        if (en[i] > 2) { glow(o0, 2, ink.glow1, 1.4); if (en[i] > 4.5) glow(o0, 4.5, ink.glow2, 1.7); }
        for (const pk of packets) if (pk.on && pk.line === i) drawPacket(pk);
      }
      host.classList.add('live');
    }

    function glow(o0, min, style, width) {
      ctx.beginPath();
      let open = false;
      for (let j = 1; j < P; j++) {
        const q = o0 + j, a = v[q] < 0 ? -v[q] : v[q];
        if (a > min) {
          if (!open) { ctx.moveTo(xs[j - 1], ys[j - 1]); open = true; }
          ctx.lineTo(xs[j], ys[j]);
        } else if (open) { ctx.lineTo(xs[j], ys[j]); open = false; }
      }
      ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
    }

    // A packet: a short trail in one of the three bar colours travelling along one line, strongest at its head.
    function drawPacket(pk) {
      const head = pk.pos * (P - 1), len = P * .07, fade = Math.min(1, pk.age * 3);
      ctx.strokeStyle = ink.kinds[pk.c]; ctx.lineWidth = 1.8;
      for (let s = 0; s < 6; s++) {
        const a = head - len + (s * len) / 6, j0 = Math.max(0, Math.floor(a)), j1 = Math.min(P - 1, Math.ceil(a + len / 6) + 1);
        if (j1 <= j0) continue;
        ctx.globalAlpha = ((s + 1) / 6) * .95 * fade;
        ctx.beginPath(); ctx.moveTo(xs[j0], ys[j0]);
        for (let j = j0 + 1; j <= j1; j++) ctx.lineTo(xs[j], ys[j]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function packetsUpdate(t, dt) {
      for (const pk of packets) {
        if (!pk.on) continue;
        pk.pos += pk.v * dt / 1000; pk.age += dt / 1000;
        if (pk.pos > 1.08) pk.on = false;
      }
      if (t < nextPacket) return;
      nextPacket = t + 1300 + rnd() * 2200;
      const pk = packets.find((p) => !p.on);
      if (pk) Object.assign(pk, { on: true, line: Math.floor(N * .3 + rnd() * N * .7), pos: -.02, v: .2 + rnd() * .14, c: (rnd() * 3) | 0, age: 0 });
    }

    // Quality ladder: if the first 90 frames are mostly slow, drop to 1x pixels and fewer points per
    // line (twice at most). Phones already start at 1.5x and 96 points.
    function degrade() {
      level++; frames = 0; slow = 0;
      dpr = 1;
      build(Math.round(P * .7)); layout();
    }

    function tick(t) {
      if (!R.on) { running = false; return false; }
      const raw = t - last;
      last = t;
      // Count real frame times (a gap over 400 ms is a tab switch, not a slow device); clamp only the physics.
      if (level < 2 && raw < 400 && ++frames <= 90) { if (raw > 26) slow++; if (frames === 90 && slow > 50) degrade(); }
      const dt = raw > 100 || raw < 0 ? 16 : raw;
      acc = Math.min(acc + dt, 60);
      target(t / 1000);
      while (acc >= STEP) { step(); acc -= STEP; }
      packetsUpdate(t, dt);
      draw();
      return true;
    }
    function wake() { if (R.on && !running && !reduced) { running = true; last = performance.now(); run(tick); } }

    // Mouse: pushes lines up under the pointer; a fast pass strums them; a click plucks.
    function aim(x, y, ts) {
      const yy = y + scrollY - docTop, d = Math.hypot(x - ptr.x, yy - ptr.y), dt = Math.max(8, ts - ptr.t);
      if (ptr.on) ptr.speed = Math.max(ptr.speed * .6, d / dt);
      ptr.x = x; ptr.y = yy; ptr.t = ts; ptr.on = true;
      wake();
    }
    host.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') aim(e.clientX, e.clientY, e.timeStamp); });
    host.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') ptr.on = false; });
    host.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') pulse(e.clientX, e.clientY + scrollY - docTop, o.tap); });
    // Finger: passive touch events keep coming while the page scrolls under the finger. A tap plucks.
    let tap = null;
    host.addEventListener('touchstart', (e) => {
      const f = e.touches[0];
      docTop = host.getBoundingClientRect().top + scrollY;
      tap = { x: f.clientX, y: f.clientY, t: e.timeStamp };
      ptr.on = false; aim(f.clientX, f.clientY, e.timeStamp);
    }, { passive: true });
    host.addEventListener('touchmove', (e) => {
      const f = e.touches[0];
      if (tap && Math.hypot(f.clientX - tap.x, f.clientY - tap.y) > 10) tap = null;
      aim(f.clientX, f.clientY, e.timeStamp);
    }, { passive: true });
    const release = (e) => {
      ptr.on = false;
      if (tap && e.type === 'touchend' && e.timeStamp - tap.t < 350) pulse(tap.x, tap.y + scrollY - docTop, o.tap);
      tap = null;
    };
    host.addEventListener('touchend', release, { passive: true });
    host.addEventListener('touchcancel', release, { passive: true });

    new IntersectionObserver(([en]) => { R.on = en.isIntersecting; wake(); }).observe(host);
    build(P); layout();
    ridges.push({ layout, gust: (g) => { if (R.on && !reduced) { R.gust = Math.max(R.gust, g); wake(); } } });
  }

  makeRidge(document.getElementById('ridge-top'), { lines: 24, phoneLines: 16, top: .3, bottom: 1, amp: touchUI ? .3 : .38, push: 1.5, tap: 9, gust: 7, seed: 7 });
  makeRidge(document.getElementById('ridge-low'), { lines: 12, phoneLines: 9, top: .42, bottom: 14, amp: .2, push: 1.3, tap: 8, gust: 6, seed: 23 });

  // Ridge boxes: re-read on any resize (a height-only change leaves their size alone, so nothing restarts).
  const relayout = () => requestAnimationFrame(() => ridges.forEach((r) => r.layout()));
  addEventListener('resize', relayout);
  // A career row that opens or closes changes the height of the list, step by step while it animates:
  // the row positions are read again, and so is the contact ridge, which moves down the page.
  new ResizeObserver(() => { measureRows(); relayout(); }).observe(list);

  // A fast scroll sends a gust through whichever ridge is on screen.
  let lastY = scrollY, lastT = 0;
  addEventListener('scroll', (e) => {
    const dy = Math.abs(scrollY - lastY), dt = e.timeStamp - lastT;
    lastY = scrollY; lastT = e.timeStamp;
    if (dt > 0 && dt < 200 && dy / dt > .9) for (const r of ridges) r.gust(Math.min(1, (dy / dt - .9) / 2.5));
  }, { passive: true });

  /* ---------- Clock in the top bar (decorative, hidden from screen readers) ---------- */
  const clock = document.querySelector('.clock');
  // A browser that does not know the time zone leaves the clock empty; nothing below depends on it.
  if (clock) try {
    const clockFmt = new Intl.DateTimeFormat('en-AU', { timeZone: clock.dataset.zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    clock.textContent = clock.dataset.place + ' ';
    const clockTime = make('b', '', clock), cells = [];
    // One box per character: the font's digits differ in width, and the top bar must not shuffle every second.
    (function tickClock() {
      const now = [...clockFmt.format(new Date())];
      while (cells.length > now.length) cells.pop().remove();
      now.forEach((ch, i) => {
        const c = cells[i] || (cells[i] = make('span', '', clockTime));
        if (c.textContent !== ch) { c.textContent = ch; c.className = ch >= '0' && ch <= '9' ? 'digit' : ''; }
      });
      setTimeout(tickClock, 1005 - (Date.now() % 1000));
    })();
  } catch (e) { clock.textContent = ''; }

  /* ---------- Decode: characters flicker through glyphs, then settle left to right ----------
     Screen readers get the real heading from a hidden copy; the flickering copy is aria-hidden,
     and the original markup is put back when it settles. */
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+<>/=';
  const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  function decode(h, dur) {
    const original = h.innerHTML, cells = [];
    const shadow = make('span');
    shadow.setAttribute('aria-hidden', 'true');
    (function copy(from, to) {
      for (const n of from.childNodes) {
        if (n.nodeType === 1) { const e = n.cloneNode(false); to.append(e); copy(n, e); continue; }
        for (const ch of n.textContent) {
          if (ch === ' ') { to.append(' '); continue; }
          const c = make('span', 'dc', to);
          c.textContent = ch; c.dataset.g = glyph(); cells.push(c);
        }
      }
    })(h, shadow);
    const real = make('span', 'sr-only');
    real.textContent = h.textContent;
    h.replaceChildren(real, shadow);
    let t0 = -1;
    run((t) => {
      if (t0 < 0) t0 = t;
      const e = t - t0;
      let left = 0;
      cells.forEach((c, i) => {
        if (!c.dataset.g) return;
        if (e >= 60 + (i / cells.length) * (dur - 120)) { delete c.dataset.g; return; }
        left++;
        if (Math.random() < .4) c.dataset.g = glyph();
      });
      if (left) return true;
      h.innerHTML = original;
      return false;
    });
  }
  const once = (el, fn, threshold) => new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { ob.disconnect(); fn(); } }, { threshold }).observe(el);

  const frameEl = document.querySelector('.frame');
  const chips = [...document.querySelectorAll('.chips li')];
  if (!reduced) {
    // The headline settles only when the script starts early: text someone is already reading is left alone.
    if (performance.now() < 2000) decode(document.getElementById('hero-title'), 900);
    for (const id of ['career-heading', 'contact-heading']) { const h = document.getElementById(id); once(h, () => decode(h, 600), .8); }

    // Side project picture: hidden at first, scanned in when it is well on screen.
    if (frameEl) {
      frameEl.classList.add('armed');
      once(frameEl, () => frameEl.classList.add('scan'), .35);
    }

    // Toolkit names: scrambled until the panel arrives, then each settles left to right, staggered.
    chips.forEach((c) => { c.dataset.g = c.textContent.replace(/\S/g, glyph); });
    once(document.getElementById('toolkit'), () => {
      let t0 = -1;
      run((t) => {
        if (t0 < 0) t0 = t;
        let busy = false;
        chips.forEach((c, k) => {
          if (!c.dataset.g) return;
          busy = true;
          const s = c.textContent, n = Math.floor(((t - t0 - k * 26) / 340) * s.length);
          if (n >= s.length) delete c.dataset.g;
          else if (n >= 0) c.dataset.g = s.slice(0, n) + s.slice(n).replace(/\S/g, glyph);
        });
        return busy;
      });
    }, .25);
  }
})();
