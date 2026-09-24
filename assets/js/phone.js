/* Kuldeep Singh · Portfolio — iPhone simulation. Vanilla JS, no dependencies. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const screen = $('#screen'), device = $('#device'), fitBox = $('#fit'), hint = $('.hint');
const home = $('#home'), pages = $('#pages'), lock = $('#lock'), island = $('#island');
const cc = $('#cc'), spot = $('#spot'), ctx = $('#ctx'), banner = $('#banner'), homezone = $('#homezone');
const APPS = $$('.app');

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.32,.72,0,1)';
const T = ms => (RM ? 0 : ms);
const haptic = () => navigator.vibrate?.(8); // Android only; iOS Safari ignores it

let S = 1; // client px per device pt
const st = { locked: true, cover: false, sleep: false, app: null, sw: false, cc: false, silent: false, torch: false, vol: .5, bright: 1 };
const flags = { air: false, cell: true, wifi: true, bt: true, rot: false };

/* ── FIT: framed phone on desktop, full-bleed on phones ───── */
function fit() {
  const full = innerWidth <= 500;
  document.documentElement.classList.toggle('full', full);
  let h = 874, w = 434, dh;
  if (full) {
    S = innerWidth / 402; h = innerHeight / S; w = 402; dh = h;
  } else {
    dh = h + 32;
    const short = innerHeight < 760;
    hint.hidden = short;
    S = Math.min(1, (innerHeight - (short ? 24 : 80)) / dh, (innerWidth - 32) / (w + 24));
  }
  device.style.setProperty('--h', h + 'px');
  device.style.setProperty('--s', S);
  fitBox.style.width = w * S + 'px';
  fitBox.style.height = dh * S + 'px';
  if (st.sw) layoutCards();
}

/* ── CLOCK & BATTERY ──────────────────────────────────────── */
const h12 = !/^h2/.test(Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle || 'h12');
const delhi = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
function tick() {
  const d = new Date();
  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: h12 }).replace(/\s?[AP]M$/i, '');
  $$('[data-clock]').forEach(e => { if (e.textContent !== t) e.textContent = t; });
  $('#lkDate').textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const p = Object.fromEntries(delhi.formatToParts(d).map(x => [x.type, +x.value]));
  $('#hh').style.transform = `rotate(${(p.hour % 12) * 30 + p.minute / 2}deg)`;
  $('#mh').style.transform = `rotate(${p.minute * 6 + p.second / 10}deg)`;
  $('#sh').style.transform = `rotate(${p.second * 6}deg)`;
}
navigator.getBattery?.().then(b => {
  const el = $('.sb-batt');
  const up = () => {
    el.style.setProperty('--b', Math.max(8, b.level * 100) + '%');
    el.classList.toggle('chg', b.charging);
    el.classList.toggle('low', !b.charging && b.level <= .2);
  };
  up();
  b.addEventListener('levelchange', up);
  b.addEventListener('chargingchange', up);
}).catch(() => {});

/* ── STATE → UI ───────────────────────────────────────────── */
function sync() {
  const covered = st.locked || st.cover;
  const inApp = !!st.app && !covered;
  screen.dataset.sb = inApp && !st.cc && screen.dataset.theme !== 'dark' ? 'dark' : 'light';
  screen.classList.toggle('in-app', inApp && !st.cc);
  screen.classList.toggle('unlocked', !covered);
  screen.classList.toggle('sw-on', st.sw);
  home.inert = covered || !!st.app || st.sw || !spot.hidden;
  lock.inert = !covered;
  APPS.forEach(a => { a.inert = covered || a !== st.app; });
}
function mark(k, on) {
  $$(`[data-tg="${k}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
const mq = matchMedia('(prefers-color-scheme: dark)');
function setTheme(dark) { screen.dataset.theme = dark ? 'dark' : 'light'; mark('dark', dark); sync(); }

/* ── DYNAMIC ISLAND & BANNER ──────────────────────────────── */
let ilT;
function islandShow(left, right, w = 220, ms = 2000) {
  $('#ilL').innerHTML = left;
  $('#ilR').innerHTML = right;
  island.style.width = w + 'px';
  island.classList.add('act');
  clearTimeout(ilT);
  ilT = setTimeout(() => { island.classList.remove('act'); island.style.width = ''; }, ms);
}
island.addEventListener('click', () => {
  if (island.classList.contains('act')) return;
  island.classList.remove('bump'); void island.offsetWidth; island.classList.add('bump');
  haptic();
});
function setSilent(on) {
  st.silent = on;
  mark('silent', on);
  const c = on ? '#ff453a' : '#fff';
  const slash = on ? '<path d="M3 3l18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' : '';
  islandShow(`<svg viewBox="0 0 24 24" style="color:${c}"><use href="#i-bell"/>${slash}</svg>`, `<span style="color:${c}">${on ? 'Silent' : 'Ring'}</span>`, 200, 1800);
  haptic();
}

let bT;
function notify(title, body, ico = 'g-about', sym = 'i-person', open = 'about') {
  $('#bTitle').textContent = title;
  $('#bBody').textContent = body;
  const i = $('.b-ico');
  i.className = 'ico b-ico ' + ico;
  i.innerHTML = `<svg><use href="#${sym}"/></svg>`;
  banner.dataset.open = open;
  banner.classList.add('show');
  clearTimeout(bT);
  bT = setTimeout(() => banner.classList.remove('show'), 4200);
}

/* ── GESTURES ─────────────────────────────────────────────── */
// A tap that turned into a drag must not also "click".
let noClickUntil = 0;
addEventListener('click', e => {
  if (performance.now() < noClickUntil) { e.stopPropagation(); e.preventDefault(); }
}, true);

// Pointer drag in device points: move(dx, dy, ev) · end(dx, dy, vx, vy, moved)
function drag(el, o) {
  el.addEventListener('pointerdown', e => {
    if (e.button > 0 || (o.start && o.start(e) === false)) return;
    const x0 = e.clientX, y0 = e.clientY;
    let lx = x0, ly = y0, lt = e.timeStamp, vx = 0, vy = 0, dx = 0, dy = 0, moved = false;
    const mv = ev => {
      if (ev.pointerId !== e.pointerId) return;
      dx = (ev.clientX - x0) / S; dy = (ev.clientY - y0) / S;
      const dt = Math.max(1, ev.timeStamp - lt);
      vx = .7 * vx + .3 * ((ev.clientX - lx) / S / dt);
      vy = .7 * vy + .3 * ((ev.clientY - ly) / S / dt);
      lx = ev.clientX; ly = ev.clientY; lt = ev.timeStamp;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true;
      o.move?.(dx, dy, ev);
    };
    const up = ev => {
      if (ev.pointerId !== e.pointerId) return;
      removeEventListener('pointermove', mv);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      if (ev.timeStamp - lt > 90) vx = vy = 0; // finger rested before lifting
      if (moved) noClickUntil = performance.now() + 350;
      o.end?.(dx, dy, vx, vy, moved, ev);
    };
    addEventListener('pointermove', mv);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  });
}

// Animate from the element's *current* look (or explicit frames) and keep the end state.
function anim(el, to, o = {}) {
  let frames = to;
  if (!Array.isArray(to)) {
    const cs = getComputedStyle(el);
    frames = [Object.fromEntries(Object.keys(to).map(k => [k, cs[k]])), to];
  }
  el.getAnimations().forEach(a => a.cancel());
  const a = el.animate(frames, { duration: T(o.d ?? 450), easing: o.e || EASE, delay: o.delay || 0, fill: 'both' });
  return a.finished.then(() => { try { a.commitStyles(); } catch { /* not rendered */ } a.cancel(); }, () => {});
}

/* ── LOCK SCREEN ──────────────────────────────────────────── */
const H = () => screen.clientHeight;
let welcomed = false;

function faceId() {
  lock.classList.remove('open');
  setTimeout(() => { if (!st.sleep) lock.classList.add('open'); }, T(800));
}
function unlock(instant) {
  if (!st.locked && !st.cover) return;
  const first = st.locked;
  st.locked = st.cover = false;
  lock.classList.add('open');
  anim(lock, { transform: `translateY(${-H()}px)` }, { d: instant ? 0 : 420, e: 'cubic-bezier(.25,.8,.3,1)' })
    .then(() => { if (!st.locked && !st.cover) lock.classList.add('gone'); });
  if (!st.app) anim(home, { transform: 'scale(1)', opacity: 1 }, { d: instant ? 0 : 600 });
  sync();
  if (first && !instant && !welcomed) {
    welcomed = true;
    setTimeout(() => notify('Portfolio', 'Welcome, let\'s explore!'), T(900));
  }
}
function settleLock() {
  anim(lock, { transform: 'translateY(0px)' }, { d: 380 });
  if (!st.app && st.locked) anim(home, { transform: 'scale(1.12)', opacity: .6 }, { d: 380 });
}
function showCover() { st.cover = true; lock.classList.add('open'); anim(lock, { transform: 'translateY(0px)' }, { d: 420 }); sync(); }
function hideCover() { anim(lock, { transform: `translateY(${-H()}px)` }, { d: 320 }).then(() => { if (!st.cover && !st.locked) lock.classList.add('gone'); }); }

drag(lock, {
  start: () => !st.sleep && (st.locked || st.cover),
  move: (dx, dy) => {
    lock.getAnimations().forEach(a => a.cancel());
    lock.style.transform = `translateY(${Math.min(0, dy)}px)`;
    if (!st.app && st.locked) {
      const p = clamp(-dy / (H() * .5), 0, 1);
      home.getAnimations().forEach(a => a.cancel());
      home.style.transform = `scale(${1.12 - .12 * p})`;
      home.style.opacity = .6 + .4 * p;
    }
  },
  end: (dx, dy, vx, vy, moved) => {
    if (!moved) return;
    if (dy < -H() * .18 || vy < -.45) unlock(); else settleLock();
  },
});
$('#unlockBtn').addEventListener('click', () => unlock());

// Pull down from the top-left: Notification Center (the Cover Sheet)
drag($('#hotL'), {
  start: () => !st.sleep && !st.locked && !st.cover,
  move: (dx, dy) => {
    lock.classList.remove('gone');
    lock.classList.add('open');
    lock.getAnimations().forEach(a => a.cancel());
    lock.style.transform = `translateY(${Math.min(0, Math.max(0, dy) - H())}px)`;
  },
  end: (dx, dy, vx, vy, moved) => {
    if (!moved) return;
    if (dy > 120 || vy > .45) showCover(); else hideCover();
  },
});

/* ── SLEEP / WAKE & HARDWARE BUTTONS ──────────────────────── */
function sleep() {
  if (st.sw) swHome();
  st.sleep = true;
  screen.classList.add('sleep');
  closeOverlays();
  hideCC(true);
  if (!st.locked) {
    st.locked = true; st.cover = false;
    lock.getAnimations().forEach(a => a.cancel());
    lock.classList.remove('gone');
    lock.style.transform = 'translateY(0px)';
    if (!st.app) { home.style.transform = 'scale(1.12)'; home.style.opacity = .6; }
  }
  lock.classList.remove('open');
  sync();
}
function wake() { st.sleep = false; screen.classList.remove('sleep'); faceId(); }
$('#off').addEventListener('click', wake);

let vT;
function setVol(v, hud) {
  st.vol = clamp(v, 0, 1);
  const sl = $('#slVol');
  sl.style.setProperty('--v', st.vol);
  sl.setAttribute('aria-valuenow', Math.round(st.vol * 100));
  if (!hud) return;
  const h = $('#volhud');
  h.style.setProperty('--v', st.vol * 100 + '%');
  h.classList.add('show');
  clearTimeout(vT);
  vT = setTimeout(() => h.classList.remove('show'), 1400);
}
function setBright(v) {
  st.bright = clamp(v, 0, 1);
  const sl = $('#slBright');
  sl.style.setProperty('--v', st.bright);
  sl.setAttribute('aria-valuenow', Math.round(st.bright * 100));
  screen.style.setProperty('--dim', ((1 - st.bright) * .7).toFixed(3));
}
$$('[data-hw]').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.hw;
  if (k === 'power') return st.sleep ? wake() : sleep();
  if (k === 'action') return setSilent(!st.silent);
  if (!st.sleep) setVol(st.vol + (k === 'up' ? 1 : -1) / 16, true);
}));

/* ── CONTROL CENTER ───────────────────────────────────────── */
function ccP(p, animate) { cc.classList.toggle('anim', !!animate); cc.style.setProperty('--p', p); }
function showCC() {
  st.cc = true;
  cc.hidden = false;
  void cc.offsetWidth;
  ccP(1, true);
  sync();
}
function hideCC(now) {
  if (!st.cc && cc.hidden) return;
  st.cc = false;
  ccP(0, !now);
  setTimeout(() => { if (!st.cc) cc.hidden = true; }, now ? 0 : T(460));
  sync();
}
drag($('#hotR'), {
  start: () => !st.sleep,
  move: (dx, dy) => { st.cc = true; cc.hidden = false; ccP(clamp(dy / 220, 0, 1)); },
  end: (dx, dy, vx, vy, moved) => { if (!moved || dy > 70 || vy > .4) showCC(); else hideCC(); },
});
drag(cc, {
  start: e => !e.target.closest('.sl'),
  move: (dx, dy) => ccP(clamp(1 + dy / 260, 0, 1)),
  end: (dx, dy, vx, vy, moved) => { if (moved) (dy < -50 || vy < -.4) ? hideCC() : showCC(); },
});
cc.addEventListener('click', e => { if (!e.target.closest('.m')) hideCC(); });

// Sliders drag relative to where you grab them, like iOS
[['#slBright', setBright, () => st.bright], ['#slVol', v => setVol(v), () => st.vol]].forEach(([sel, set, get]) => {
  const el = $(sel);
  el.addEventListener('pointerdown', e => {
    const hgt = el.getBoundingClientRect().height, v0 = get(), y0 = e.clientY;
    const mv = ev => set(v0 - (ev.clientY - y0) / hgt);
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
    addEventListener('pointermove', mv);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  });
  el.addEventListener('keydown', e => {
    const d = { ArrowUp: .1, ArrowRight: .1, ArrowDown: -.1, ArrowLeft: -.1 }[e.key];
    if (d) { e.preventDefault(); set(get() + d); }
  });
});

function toggle(k) {
  if (k === 'dark') return setTheme(screen.dataset.theme !== 'dark');
  if (k === 'silent') return setSilent(!st.silent);
  if (k === 'torch') { st.torch = !st.torch; mark('torch', st.torch); return haptic(); }
  flags[k] = !flags[k];
  if (k === 'air') flags.cell = flags.wifi = !flags.air;
  Object.keys(flags).forEach(f => mark(f, flags[f]));
  screen.classList.toggle('air', flags.air);
  screen.classList.toggle('nowifi', !flags.wifi);
  screen.classList.toggle('nocell', !flags.cell);
}

/* ── APP LAUNCH / CLOSE (zooms from & back into the icon) ─── */
const R = () => parseFloat(getComputedStyle(screen).getPropertyValue('--R')) || 0;
function rectOf(el) {
  const r = el.getBoundingClientRect(), s = screen.getBoundingClientRect();
  return { x: (r.left - s.left) / S, y: (r.top - s.top) / S, w: r.width / S, h: r.height / S };
}
// transform + clip that make the full-screen app look like rect r
function frameAt(r, rad) {
  const W = screen.clientWidth, k = r.w / W, cy = Math.max(0, (H() - r.h / k) / 2);
  return { transform: `translate(${r.x}px, ${r.y - cy * k}px) scale(${k})`, clipPath: `inset(${cy}px 0px ${cy}px 0px round ${rad / k}px)` };
}
const FULL = () => ({ transform: 'translate(0px, 0px) scale(1)', clipPath: `inset(0px 0px 0px 0px round ${R()}px)` });
const CENTER = () => frameAt({ x: screen.clientWidth / 2 - 32, y: H() / 2 - 32, w: 64, h: 64 }, 15);

// The on-screen icon/widget an app should grow from or shrink into (null → centre fade)
function target(app, from) {
  const W = screen.clientWidth;
  for (const c of [from, ...$$(`#home [data-open="${app.id}"]`)]) {
    if (!c || !home.contains(c)) continue;
    const el = c.querySelector('.ico') || c, r = rectOf(el);
    if (r.w && r.x > -2 && r.y > -2 && r.x + r.w < W + 2 && r.y + r.h < H() + 2) {
      return { r, rad: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 15 };
    }
  }
  return null;
}

// History mirrors the foreground app: base → #app → #app (one entry per pushed view)
let depth = 0, ignorePop = false; // entries owned by the foreground app; ignorePop may carry a follow-up
function syncHistory(app) {
  const push = () => {
    if (!app) return;
    history.pushState({ app: app.id }, '', '#' + app.id);
    app._stack.slice(1).forEach(v => history.pushState({ app: app.id, view: v.id }, '', '#' + app.id));
  };
  const n = depth;
  depth = app ? app._stack.length : 0;
  if (n) { ignorePop = push; history.go(-n); } else push();
}

const onOpen = {};
const recents = []; // backgrounded apps keep their state, oldest → newest

function resetApp(app) {
  app._stack = [$('.view.root', app)];
  $$('.scroll', app).forEach(s => { s.scrollTop = 0; });
  $$('.view', app).forEach(v => { v.hidden = !v.classList.contains('root'); v.removeAttribute('style'); v.classList.remove('scrolled'); });
  app._scroll = null;
  app.classList.remove('shown');
  app.hidden = true;
  app.removeAttribute('style');
}
// display:none drops scroll offsets, so remember them while an app is backgrounded
function park(app) { app._scroll = $$('.scroll', app).map(s => s.scrollTop); app.hidden = true; app.removeAttribute('style'); }
function unpark(app) { app.hidden = false; $$('.scroll', app).forEach((s, i) => { s.scrollTop = app._scroll?.[i] || 0; }); }

function openApp(id, from, fromPop) {
  const app = document.getElementById(id);
  if (!app || !APPS.includes(app) || st.app || st.sw || st.locked || st.cover || home.classList.contains('jiggle')) return;
  closeOverlays();
  settleRecents();
  const fresh = !recents.includes(app);
  if (fresh) resetApp(app); else recents.splice(recents.indexOf(app), 1);
  recents.push(app);
  if (fromPop && app._stack.length > 1) resetApp(app); // history only knows the app's root entry
  st.app = app;
  app._from = from;
  unpark(app);
  const t = target(app, from);
  anim(app, [{ ...(t ? frameAt(t.r, t.rad) : CENTER()), opacity: t ? 1 : 0 }, { ...FULL(), opacity: 1 }], { d: 560 })
    .then(() => { if (st.app === app) { app.style.clipPath = 'none'; app.classList.add('shown'); home.style.visibility = 'hidden'; } });
  anim($('.splash', app), [{ opacity: 1 }, { opacity: 0 }], { d: 260, delay: 90, e: 'ease-out' });
  anim(home, { transform: 'scale(1.1)', opacity: 1 }, { d: 560 });
  if (fresh) onOpen[id]?.(app);
  if (fromPop) depth = app._stack.length; else syncHistory(app);
  sync();
  haptic();
}

function closeApp(fromPop) {
  const app = st.app;
  if (!app) return;
  settleRecents();
  st.app = null;
  home.style.visibility = '';
  home.getAnimations().forEach(a => a.cancel());
  const ht = home.style.transform;
  home.style.transform = 'none';            // measure the icon where it will land
  const t = target(app, app._from);
  home.style.transform = ht || 'scale(1.1)';
  anim(app, t ? { ...frameAt(t.r, t.rad), opacity: 1 } : { ...CENTER(), opacity: 0 }, { d: 500 })
    .then(() => { if (st.app !== app && !st.sw) park(app); });
  anim($('.splash', app), { opacity: 1 }, { d: 200, delay: 180 });
  anim(home, { transform: 'scale(1)', opacity: 1 }, { d: 500 });
  if (fromPop) depth = 0; else syncHistory(null);
  sync();
}
const goHome = () => closeApp();

// Swipe up on the home indicator: the card follows your finger. Pause mid-swipe for the App Switcher.
// Swipe sideways along it to hop between recent apps.
let armed = false, holdT = 0, hzAxis = null;
function arm(on) {
  armed = on;
  if (on) { haptic(); sw.hidden = false; requestAnimationFrame(() => sw.classList.add('show')); return; }
  sw.classList.remove('show');
  setTimeout(() => { if (!armed && !st.sw) sw.hidden = true; }, T(360));
}
drag(homezone, {
  start: () => {
    hzAxis = null;
    return st.sw || !!st.app || (recents.length > 0 && spot.hidden && !st.cc && !home.classList.contains('jiggle'));
  },
  move: (dx, dy) => {
    if (st.sw) return;
    hzAxis ||= st.app && Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (hzAxis === 'x') return qsMove(dx);
    const up = Math.max(0, -dy);
    clearTimeout(holdT);
    if (!armed && up > 70) holdT = setTimeout(() => arm(true), 160);
    if (armed && up < 40) arm(false);
    const app = st.app;
    if (!app) return;
    const W = screen.clientWidth, p = Math.min(1, up / (H() * .7)), k = 1 - .55 * p;
    app._rad = Math.max(R(), 36) / k;
    app.getAnimations().forEach(a => a.cancel());
    home.getAnimations().forEach(a => a.cancel());
    home.style.visibility = '';
    app.style.transform = `translate(${(W - W * k) / 2 + dx * .9}px, ${H() - up - H() * k}px) scale(${k})`;
    app.style.clipPath = `inset(0px 0px 0px 0px round ${app._rad}px)`;
    home.style.transform = `scale(${1.1 - .1 * p})`;
  },
  end: (dx, dy, vx, vy, moved) => {
    clearTimeout(holdT);
    if (st.sw) return swHome();
    if (hzAxis === 'x') return qsEnd(dx, vx);
    if (armed) { armed = false; return enterSwitcher(); }
    const app = st.app;
    if (!app) return;
    if (!moved || -dy > 80 || vy < -.35) return goHome();
    anim(app, FULL(), { d: 380 }).then(() => { if (st.app === app) { app.style.clipPath = 'none'; home.style.visibility = 'hidden'; } });
    anim(home, { transform: 'scale(1.1)' }, { d: 380 });
  },
});

/* ── APP SWITCHER (cards are the live, backgrounded apps) ─── */
const sw = $('#sw'), swL = $('#swL');
const SWK = .6, SHADOW = '0 0 60px rgba(0,0,0,.45)';
let swPos = 0, swFrom = null, posRAF = 0;
const cardW = () => screen.clientWidth * SWK;
const cardH = () => H() * SWK;
const SP = () => cardW() * .6;            // distance between neighbouring cards
const cardTop = () => (H() - cardH()) / 2 + 18;
const cardX = i => screen.clientWidth / 2 + cardW() * .1 + (i - swPos) * SP() - cardW() / 2; // focus sits right of centre so the previous card peeks in
const cardStyle = (i, dy = 0) => ({ transform: `translate(${cardX(i)}px, ${cardTop() + dy}px) scale(${SWK})`, borderRadius: '58px', clipPath: 'none', boxShadow: SHADOW, opacity: 1 });
// labels stick to the left margin and truncate (then fade) as the next card slides over them
const lblStyle = (i, dy = 0) => {
  const x = Math.max(12, cardX(i) + 4), room = i < recents.length - 1 ? cardX(i + 1) - x - 8 : cardW();
  return { transform: `translate(${x}px, ${cardTop() - 40 + dy}px)`, maxWidth: Math.max(0, room) + 'px', opacity: clamp((room - 30) / 20, 0, 1) };
};

function layoutCards() {
  recents.forEach((a, i) => { a.getAnimations().forEach(x => x.cancel()); Object.assign(a.style, cardStyle(i), { zIndex: 10 + i }); });
  [...swL.children].forEach((l, i) => { l.getAnimations().forEach(x => x.cancel()); Object.assign(l.style, lblStyle(i)); });
}
function settlePos(to) {
  cancelAnimationFrame(posRAF);
  const from = swPos, t0 = performance.now(), d = T(380) || 1;
  const step = now => {
    const p = Math.min(1, (now - t0) / d);
    swPos = from + (to - from) * (1 - (1 - p) ** 3);
    layoutCards();
    if (p < 1) posRAF = requestAnimationFrame(step);
  };
  posRAF = requestAnimationFrame(step);
}
function cardAt(cx, cy) {
  const s = screen.getBoundingClientRect(), x = (cx - s.left) / S, y = (cy - s.top) / S;
  for (let i = recents.length - 1; i >= 0; i--) { // newest card is on top
    const l = cardX(i), t = cardTop();
    if (x >= l && x <= l + cardW() && y >= t && y <= t + cardH()) return recents[i];
  }
  return null;
}

function enterSwitcher() {
  const cur = st.app;
  if (st.sw || (!cur && !recents.length)) return;
  closeOverlays();
  settleRecents();
  st.sw = true;
  st.app = null;
  swFrom = cur;
  swPos = recents.length - 1;
  swL.innerHTML = recents.map(a => `<button class="sw-lbl" data-sw="${a.id}">${appIco(a)}<span>${a.dataset.name}</span></button>`).join('');
  sw.hidden = swL.hidden = false;
  [...swL.children].forEach((l, i) => Object.assign(l.style, lblStyle(i)));
  requestAnimationFrame(() => { sw.classList.add('show'); swL.classList.add('show'); });
  home.style.visibility = '';
  anim(home, { transform: 'scale(1)', opacity: 1 }, { d: 450 });
  recents.forEach((a, i) => {
    const to = cardStyle(i);
    a.style.zIndex = 10 + i;
    if (a === cur) { // same corners as the dragged card, but as border-radius so it can cast a shadow
      a.getAnimations().forEach(x => x.cancel());
      Object.assign(a.style, { clipPath: 'none', borderRadius: (a._rad || R()) + 'px' });
      anim(a, to, { d: 480 });
    } else {
      showCard(a);
      const off = cur ? `translate(${cardX(i) - 140}px, ${cardTop()}px)` : `translate(${cardX(i)}px, ${cardTop() + 180}px)`;
      anim(a, [{ ...to, transform: `${off} scale(${SWK})`, opacity: 0 }, to], { d: 480 });
    }
  });
  sync();
  haptic();
}
// Show a backgrounded app as a live card (no launch-screen icon over it)
function showCard(a) {
  unpark(a);
  const splash = $('.splash', a);
  splash.getAnimations().forEach(x => x.cancel()); // a just-closed app may still be fading its icon in
  splash.style.opacity = 0;
}
function hideSw() {
  sw.classList.remove('show');
  swL.classList.remove('show');
  setTimeout(() => { if (!st.sw && !armed) sw.hidden = swL.hidden = true; }, T(360));
}
function swOpen(app) {
  if (!st.sw || !app) return;
  cancelAnimationFrame(posRAF);
  const others = recents.filter(a => a !== app);
  recents.splice(recents.indexOf(app), 1);
  recents.push(app);
  st.sw = false;
  st.app = app;
  app.style.zIndex = 33;
  hideSw();
  anim(app, { transform: 'translate(0px, 0px) scale(1)', borderRadius: R() + 'px', boxShadow: '0 0 0px rgba(0,0,0,0)' }, { d: 450 })
    .then(() => {
      if (st.app !== app) return;
      app.removeAttribute('style');
      home.style.visibility = 'hidden';
      home.style.transform = 'scale(1.1)';
      others.forEach(a => { if (!st.sw) park(a); });
    });
  if (app !== swFrom) syncHistory(app);
  swFrom = null;
  sync();
  haptic();
}
function swHome() {
  if (!st.sw) return;
  cancelAnimationFrame(posRAF);
  st.sw = false;
  swFrom = null;
  hideSw();
  recents.forEach((a, i) => anim(a, { transform: `translate(${cardX(i) + cardW() * .06}px, ${cardTop() - 50}px) scale(${SWK * .88})`, opacity: 0 }, { d: 300 })
    .then(() => { if (!st.sw && st.app !== a) park(a); }));
  anim(home, { transform: 'scale(1)', opacity: 1 }, { d: 400 });
  syncHistory(null);
  sync();
}
// Swipe a card up to quit that app
function kill(app) {
  const i = recents.indexOf(app), p = Math.round(swPos);
  recents.splice(i, 1);
  swL.children[i]?.remove();
  if (swFrom === app) swFrom = null;
  anim(app, { transform: `translate(${cardX(i)}px, ${-cardH() - 60}px) scale(${SWK})` }, { d: 320, e: 'cubic-bezier(.4,0,.8,.6)' })
    .then(() => { if (!recents.includes(app)) resetApp(app); });
  haptic();
  if (!recents.length) return setTimeout(swHome, T(220));
  swPos = clamp(i <= p ? p - 1 : p, 0, recents.length - 1);
  recents.forEach((a, j) => anim(a, cardStyle(j), { d: 380 }));
  [...swL.children].forEach((l, j) => anim(l, lblStyle(j), { d: 380 }));
}

let swHit = null, swAxis = null, pos0 = 0;
drag(sw, {
  start: e => {
    if (!st.sw) return false;
    cancelAnimationFrame(posRAF);
    swHit = cardAt(e.clientX, e.clientY);
    swAxis = null;
    pos0 = swPos;
  },
  move: (dx, dy) => {
    swAxis ||= Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (swAxis === 'x') {
      const n = recents.length - 1, v = pos0 - dx / SP();
      swPos = v < 0 ? v / 3 : v > n ? n + (v - n) / 3 : v; // rubber-band past either end
      return layoutCards();
    }
    if (!swHit) return;
    const i = recents.indexOf(swHit), y = dy < 0 ? dy : dy / 4;
    swHit.getAnimations().forEach(x => x.cancel());
    swHit.style.transform = cardStyle(i, y).transform;
    if (swL.children[i]) Object.assign(swL.children[i].style, lblStyle(i, y));
  },
  end: (dx, dy, vx, vy, moved) => {
    if (!moved) return swHit ? swOpen(swHit) : swHome();
    if (swAxis === 'x') return settlePos(clamp(Math.round(swPos - vx * 160 / SP()), 0, recents.length - 1));
    if (!swHit) return;
    if (dy < -110 || vy < -.5) return kill(swHit);
    const i = recents.indexOf(swHit);
    anim(swHit, cardStyle(i), { d: 300 });
    if (swL.children[i]) anim(swL.children[i], lblStyle(i), { d: 300 });
  },
});
swL.addEventListener('click', e => { const b = e.target.closest('[data-sw]'); if (b) swOpen(document.getElementById(b.dataset.sw)); });

/* ── QUICK SWITCH (swipe along the home bar) ──────────────── */
let qs = null, qsT = 0, qsApp = null;
const qsFrame = (off, k) => {
  const W = screen.clientWidth;
  return { transform: `translate(${(W - W * k) / 2 + off}px, ${(H() - H() * k) / 2}px) scale(${k})`, clipPath: `inset(0px 0px 0px 0px round ${Math.max(R(), 36) / k}px)` };
};
// Like iOS, recents only reorder once you settle in an app, so repeated swipes keep walking back
function settleRecents() {
  clearTimeout(qsT);
  if (qs) { qsT = setTimeout(settleRecents, 500); return; }
  if (qsApp && recents.includes(qsApp)) { recents.splice(recents.indexOf(qsApp), 1); recents.push(qsApp); }
  qsApp = null;
}
function qsMove(dx) {
  const cur = st.app, dir = dx > 0 ? -1 : 1; // swipe right → the older app slides in from the left
  const nb = recents[recents.indexOf(cur) + dir] || null;
  if (!qs) { qs = {}; home.style.visibility = ''; sw.hidden = false; requestAnimationFrame(() => sw.classList.add('show')); }
  if (qs.nb && qs.nb !== nb) park(qs.nb); // changed direction mid-swipe
  if (nb && nb !== qs.nb) { showCard(nb); nb.style.zIndex = 11; }
  Object.assign(qs, { cur, nb, dir });
  const W = screen.clientWidth, x = nb ? dx : dx / 3, k = 1 - .08 * Math.min(1, Math.abs(x) / (W * .5)); // rubber-band when nothing is there
  [cur, nb].forEach(a => a?.getAnimations().forEach(an => an.cancel()));
  Object.assign(cur.style, qsFrame(x, k));
  if (nb) Object.assign(nb.style, qsFrame(x + dir * (W * k + 16), k));
}
function qsEnd(dx, vx) {
  if (!qs) return;
  const { cur, nb, dir } = qs, W = screen.clientWidth;
  qs = null;
  hideSw();
  const go = !!nb && (Math.abs(dx) > W * .3 || vx * -dir > .35);
  const [inn, out] = go ? [nb, cur] : [cur, nb];
  if (go) {
    st.app = nb;
    qsApp = nb;
    clearTimeout(qsT);
    qsT = setTimeout(settleRecents, 2000);
    syncHistory(nb);
    sync();
    haptic();
  }
  anim(inn, FULL(), { d: 380 }).then(() => {
    if (st.app !== inn) return;
    inn.removeAttribute('style');
    inn.classList.add('shown');
    home.style.visibility = 'hidden';
  });
  if (out) anim(out, qsFrame((go ? -dir : dir) * (W + 16), .92), { d: 380 }).then(() => { if (st.app !== out) park(out); });
}

/* ── IN-APP NAVIGATION (push / pop with edge-swipe back) ──── */
function pushView(v) {
  const app = st.app, prev = app._stack.at(-1);
  v.hidden = false;
  v.classList.remove('scrolled');
  $('.scroll', v).scrollTop = 0;
  app._stack.push(v);
  anim(v, [{ transform: 'translateX(100%)' }, { transform: 'translateX(0%)' }], { d: 500 });
  anim(prev, { transform: 'translateX(-30%)' }, { d: 500 });
  history.pushState({ app: app.id, view: v.id }, '', '#' + app.id);
  depth++;
}
function popView(fromPop) {
  const app = st.app;
  if (!app || app._stack.length < 2) return;
  const v = app._stack.pop(), prev = app._stack.at(-1);
  anim(v, { transform: 'translateX(100%)' }, { d: 420 }).then(() => { if (!app._stack.includes(v)) v.hidden = true; });
  anim(prev, { transform: 'translateX(0%)' }, { d: 420 });
  if (!fromPop) { ignorePop = true; history.back(); }
  depth--;
}
$$('.view:not(.root)').forEach(v => drag(v, {
  start: e => st.app?._stack.at(-1) === v && (e.clientX - screen.getBoundingClientRect().left) / S < 30,
  move: dx => {
    const prev = st.app._stack.at(-2), x = Math.max(0, dx);
    v.getAnimations().forEach(a => a.cancel());
    prev.getAnimations().forEach(a => a.cancel());
    v.style.transform = `translateX(${x}px)`;
    prev.style.transform = `translateX(${-.3 * screen.clientWidth + .3 * x}px)`;
  },
  end: (dx, dy, vx, vy, moved) => {
    if (!moved) return;
    if (dx > 110 || vx > .35) return popView();
    anim(v, { transform: 'translateX(0%)' }, { d: 300 });
    anim(st.app._stack.at(-2), { transform: 'translateX(-30%)' }, { d: 300 });
  },
}));
// Large title → inline title when content scrolls under the bar
$$('.scroll').forEach(s => s.addEventListener('scroll', () => s.parentElement.classList.toggle('scrolled', s.scrollTop > 30), { passive: true }));

// Browser/Android back closes views and apps; forward reopens
addEventListener('popstate', e => {
  if (ignorePop) { const then = ignorePop; ignorePop = false; if (typeof then === 'function') then(); return; }
  if (st.sw) { depth = Math.max(0, depth - 1); return swHome(); }
  const s = e.state || {};
  if (st.app && s.app !== st.app.id) { depth = 0; closeApp(true); } else if (st.app && !s.view && st.app._stack.length > 1) popView(true);
  else if (!st.app && s.app) openApp(s.app, null, true);
});

/* ── HOME SCREEN: paging, pull-down Spotlight ─────────────── */
const spill = $('#spill'), dots = $$('.sp-d i');
let pageT;
pages.addEventListener('scroll', () => {
  const i = Math.round(pages.scrollLeft / pages.clientWidth);
  dots.forEach((d, j) => d.classList.toggle('on', i === j));
  spill.classList.add('paging');
  clearTimeout(pageT);
  pageT = setTimeout(() => spill.classList.remove('paging'), 1300);
}, { passive: true });

let axis = null, sl0 = 0;
drag(pages, {
  start: () => { axis = null; sl0 = pages.scrollLeft; },
  move: (dx, dy, ev) => {
    axis ||= Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (axis === 'x' && ev.pointerType === 'mouse') { pages.classList.add('dragging'); pages.scrollLeft = sl0 - dx; }
  },
  end: (dx, dy, vx, vy, moved, ev) => {
    if (axis === 'x' && ev.pointerType === 'mouse') {
      const w = pages.clientWidth, n = pages.children.length;
      let i = Math.round((sl0 - dx) / w);
      if (Math.abs(vx) > .3) i = Math.round(sl0 / w) + (vx < 0 ? 1 : -1);
      pages.classList.remove('dragging');
      pages.scrollTo({ left: clamp(i, 0, n - 1) * w, behavior: RM ? 'auto' : 'smooth' });
    }
    if (axis === 'y' && dy > 60 && !home.classList.contains('jiggle')) openSpot();
  },
});

/* ── HAPTIC TOUCH MENU & EDIT MODE ────────────────────────── */
let lpT;
home.addEventListener('pointerdown', e => {
  const ic = e.target.closest('.icon, .widget');
  if (!ic || e.button > 0 || home.classList.contains('jiggle')) return;
  ic.classList.add('pressed');
  const x0 = e.clientX, y0 = e.clientY;
  const clear = () => {
    clearTimeout(lpT);
    ic.classList.remove('pressed');
    removeEventListener('pointermove', mv);
    removeEventListener('pointerup', clear);
    removeEventListener('pointercancel', clear);
  };
  const mv = ev => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) clear(); };
  addEventListener('pointermove', mv);
  addEventListener('pointerup', clear);
  addEventListener('pointercancel', clear);
  lpT = setTimeout(() => { clear(); showCtx(ic); }, 480);
});
home.addEventListener('contextmenu', e => {
  e.preventDefault();
  const ic = e.target.closest('.icon, .widget');
  if (ic && !home.classList.contains('jiggle')) showCtx(ic);
});

const menu = $('#ctxMenu');
let lifted = null;
function showCtx(ic) {
  if (!ctx.hidden) return;
  haptic();
  const vis = ic.querySelector('.ico') || ic, r = rectOf(vis);
  const clone = vis.cloneNode(true);
  clone.style.cssText = `width:${r.w}px;height:${r.h}px;margin:0;animation:none`;
  const box = $('#ctxIco');
  box.replaceChildren(clone);
  Object.assign(box.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  lifted = vis;
  vis.style.visibility = 'hidden';

  const id = ic.dataset.open, href = ic.getAttribute('href');
  const name = ic.querySelector('.lbl')?.textContent || '';
  const url = href || `${location.origin}${location.pathname}#${id}`;
  const items = id || href ? [
    [href ? `Open ${name}` : 'Open', 'i-open', () => (href ? window.open(href, '_blank', 'noopener') : openApp(id, ic))],
    ['Copy Link', 'i-copy', () => copy(url)],
    ['Share…', 'i-share', () => share(name || 'Kuldeep Singh', url)],
    ['Edit Home Screen', 'i-apps', () => setJiggle(true), 'gap'],
  ] : [['Edit Home Screen', 'i-apps', () => setJiggle(true)]];
  menu.replaceChildren(...items.map(([label, sym, fn, cls]) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'menuitem');
    if (cls) b.className = cls;
    b.innerHTML = `<span></span><svg><use href="#${sym}"/></svg>`;
    b.firstChild.textContent = label;
    b.addEventListener('click', () => { hideCtx(); fn(); });
    return b;
  }));

  ctx.hidden = false;
  const mh = menu.offsetHeight, below = r.y + r.h + 16 + mh < H() - 24;
  const x = clamp(r.x + r.w / 2 - 125, 12, screen.clientWidth - 262);
  menu.style.left = x + 'px';
  menu.style.top = (below ? r.y + r.h + 16 : r.y - 16 - mh) + 'px';
  menu.style.transformOrigin = `${r.x + r.w / 2 - x}px ${below ? 0 : mh}px`;
  requestAnimationFrame(() => ctx.classList.add('show'));
  menu.querySelector('button').focus({ preventScroll: true });
}
function hideCtx() {
  if (ctx.hidden) return;
  ctx.classList.remove('show');
  setTimeout(() => {
    ctx.hidden = true;
    if (lifted) lifted.style.visibility = '';
    lifted = null;
  }, T(260));
}
ctx.addEventListener('click', e => { if (!e.target.closest('.ctx-menu')) hideCtx(); });

function setJiggle(on) {
  home.classList.toggle('jiggle', on);
  screen.classList.toggle('jig', on);
  if (on) haptic();
}
$('#doneBtn').addEventListener('click', () => setJiggle(false));
pages.addEventListener('click', e => {
  if (home.classList.contains('jiggle') && !e.target.closest('.icon, .widget')) setJiggle(false);
});

function copy(text) {
  navigator.clipboard?.writeText(text).then(() => notify('Link Copied', text, 'g-connect', 'i-copy', ''), () => {});
}
function share(title, url) {
  if (navigator.share) navigator.share({ title, url }).catch(() => {});
  else copy(url);
}

/* ── SPOTLIGHT (searches every app's content) ─────────────── */
const q = $('#q'), res = $('#spotRes');
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const seen = new Set();
const INDEX = APPS.flatMap(app => $$('.scroll *', app)
  .filter(el => !el.children.length && el.textContent.trim().length > 1)
  .map(el => ({ app, el, t: el.textContent.trim().replace(/\s+/g, ' ') }))
  .filter(x => !seen.has(app.id + x.t) && seen.add(app.id + x.t)));
const appIco = a => `<span class="ico ${a.dataset.ico}">${$('.splash', a).innerHTML}</span>`;

function renderSpot(v) {
  const s = v.trim().toLowerCase();
  if (!s) {
    res.innerHTML = '<p class="sr-h">Siri Suggestions</p><div class="sr-apps">' + ['about', 'exp', 'skills', 'resume'].map(id => {
      const a = document.getElementById(id);
      return `<button class="icon" data-open="${id}">${appIco(a)}<span class="lbl">${a.dataset.name}</span></button>`;
    }).join('') + '</div>';
    return;
  }
  const mark = t => { let i = t.toLowerCase().indexOf(s); if (i > 22) { t = '…' + t.slice(i - 12); i = 13; } return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + s.length)) + '</mark>' + esc(t.slice(i + s.length)); };
  const apps = APPS.filter(a => a.dataset.name.toLowerCase().includes(s));
  const hits = INDEX.map((x, n) => ({ ...x, n })).filter(x => x.t.toLowerCase().includes(s)).slice(0, 15);
  let html = '';
  if (apps.length) {
    html += '<p class="sr-h">Apps</p><div class="sr-list">' + apps.map(a =>
      `<button class="sr-row" data-open="${a.id}">${appIco(a)}<span class="sr-t"><span>${mark(a.dataset.name)}</span><small>Application</small></span></button>`).join('') + '</div>';
  }
  if (hits.length) {
    html += '<p class="sr-h">In Portfolio</p><div class="sr-list">' + hits.map(x =>
      `<button class="sr-row" data-hit="${x.n}">${appIco(x.app)}<span class="sr-t"><span>${mark(x.t)}</span><small>${x.app.dataset.name}</small></span></button>`).join('') + '</div>';
  }
  res.innerHTML = html || `<p class="sr-empty">No Results for “${esc(v.trim())}”</p>`;
}
function openSpot() {
  if (st.app || st.sw || st.locked || st.cover || !spot.hidden) return;
  spot.hidden = false;
  q.value = '';
  renderSpot('');
  requestAnimationFrame(() => spot.classList.add('show'));
  q.focus({ preventScroll: true });
  anim(home, { transform: 'scale(.96)' }, { d: 400 });
  sync();
}
function closeSpot() {
  if (spot.hidden) return;
  spot.classList.remove('show');
  q.blur();
  if (!st.app) anim(home, { transform: 'scale(1)' }, { d: 400 });
  setTimeout(() => { if (!spot.classList.contains('show')) { spot.hidden = true; sync(); } }, T(320));
}
function closeOverlays() { hideCtx(); closeSpot(); }

q.addEventListener('input', () => renderSpot(q.value));
q.addEventListener('keydown', e => { if (e.key === 'Enter') res.querySelector('button')?.click(); });
spill.addEventListener('click', openSpot);
$('#spotX').addEventListener('click', closeSpot);
spot.addEventListener('click', e => {
  if (e.target === spot || e.target === res) return closeSpot();
  const hit = e.target.closest('[data-hit]');
  if (hit) reveal(INDEX[+hit.dataset.hit]);
});
// Open the app, navigate to the matching view, scroll to and flash the result
function reveal({ app, el }) {
  openApp(app.id, null);
  const v = el.closest('.view'), sub = !v.classList.contains('root');
  setTimeout(() => {
    if (sub) pushView(v);
    setTimeout(() => {
      const sc = el.closest('.scroll'), er = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
      sc.scrollTo({ top: sc.scrollTop + (er.top - sr.top + er.height / 2) / S - sc.clientHeight / 2, behavior: RM ? 'auto' : 'smooth' });
      (el.closest('.cell, .bullets p, .tags span, .stats div, .pass, .group') || el)
        .animate([{ background: 'rgba(255,204,0,.45)' }, { background: 'transparent' }], { duration: 1800, easing: 'ease-out' });
    }, sub ? T(520) : 0);
  }, T(580));
}

/* ── PHONE · MAIL · RESUME ────────────────────────────────── */
const MY_NUMBER = $('#kpNum').textContent;
let dialed = MY_NUMBER, typing;
function setDial(v) {
  dialed = v;
  $('#kpNum').textContent = v;
  $('#kpWho').textContent = v === MY_NUMBER ? 'Kuldeep Singh' : '';
  $('#kpDel').classList.toggle('show', v.length > 0);
  $('#kpCall').href = 'tel:' + v.replace(/[^\d+*#]/g, '');
}
onOpen.phone = () => {
  clearInterval(typing);
  let i = 0;
  setDial('');
  typing = setInterval(() => { setDial(MY_NUMBER.slice(0, ++i)); if (i >= MY_NUMBER.length) clearInterval(typing); }, T(40) || 1);
};
$$('.kp-grid [data-k]').forEach(b => b.addEventListener('click', () => {
  clearInterval(typing);
  haptic();
  setDial((dialed === MY_NUMBER ? '' : dialed) + b.dataset.k);
}));
$('#kpDel').addEventListener('click', () => setDial(dialed.slice(0, -1)));

$('#mailSend').addEventListener('click', () => {
  const to = $('#mail .token').textContent;
  location.href = `mailto:${to}?subject=${encodeURIComponent($('#mailSubj').value)}&body=${encodeURIComponent($('#mailBody').value)}`;
  setTimeout(goHome, T(300));
});

onOpen.resume = () => {
  const f = $('#cv');
  if (f.src) return;
  f.addEventListener('load', () => f.classList.add('ready'), { once: true });
  f.src = f.dataset.src;
};
$('#shareBtn').addEventListener('click', () => share('Kuldeep Singh — Resume', $('#resume .btn-primary').href));

/* ── TAPS (one delegated handler) ─────────────────────────── */
screen.addEventListener('click', e => {
  const t = e.target, jig = home.classList.contains('jiggle');
  if (jig && t.closest('#home a')) return e.preventDefault();
  const o = t.closest('[data-open], [data-href]');
  if (o && !(jig && home.contains(o))) {
    if (o === banner) { banner.classList.remove('show'); if (o.dataset.open && !st.app) openApp(o.dataset.open); return; }
    if (lock.contains(o)) { // lock-screen notification: unlock, then open it
      unlock();
      if (o.dataset.href) window.open(o.dataset.href, '_blank', 'noopener');
      else setTimeout(() => openApp(o.dataset.open, null), T(380));
      return;
    }
    if (o.dataset.open) return openApp(o.dataset.open, o);
  }
  const p = t.closest('[data-push]');
  if (p) return pushView(document.getElementById(p.dataset.push));
  if (t.closest('.back')) return popView();
  if (t.closest('[data-home]')) return goHome();
  const g = t.closest('[data-tg]');
  if (g) return toggle(g.dataset.tg);
});
drag(banner, {
  move: (dx, dy) => { banner.style.transition = 'none'; banner.style.transform = `translateY(${Math.min(0, dy)}px)`; },
  end: (dx, dy, vx, vy, moved) => { banner.style.transition = banner.style.transform = ''; if (moved && dy < -16) banner.classList.remove('show'); },
});

addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && (st.locked || st.cover) && !st.sleep && document.activeElement === document.body) return unlock();
  if (st.sw && !st.cc && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return settlePos(clamp(Math.round(swPos) + (e.key === 'ArrowRight' ? 1 : -1), 0, recents.length - 1));
  if (st.sw && !st.cc && e.key === 'Enter' && !e.target.closest('button')) return swOpen(recents[Math.round(swPos)]);
  if (e.key !== 'Escape') return;
  if (!ctx.hidden) return hideCtx();
  if (home.classList.contains('jiggle')) return setJiggle(false);
  if (!spot.hidden) return closeSpot();
  if (st.cc) return hideCC();
  if (st.sw) return swHome();
  if (st.app?._stack.length > 1) return popView();
  if (st.app) goHome();
});

/* ── BOOT ─────────────────────────────────────────────────── */
fit();
addEventListener('resize', fit);
tick();
setInterval(tick, 1000);
setTheme(mq.matches);
mq.addEventListener?.('change', ev => setTheme(ev.matches));
setVol(.5);
setBright(1);
home.style.transform = 'scale(1.12)';
home.style.opacity = .6;
faceId();
const deep = location.hash.slice(1);
if (APPS.some(a => a.id === deep)) { // shared link like /#exp opens straight into that app
  history.replaceState(null, '', location.pathname + location.search);
  unlock(true);
  openApp(deep, null);
}
sync();
})();
