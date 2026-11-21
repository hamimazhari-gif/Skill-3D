// "GTA 6 vs the 1958 tennis game" — one shot plan, two timings (#id / #en in the page hash).
import { BEATS } from './beats.js';
import { M, camFromKeys, idle, blinkAt, q, clamp, lerp, lerp3, ramp } from './motion.js';

const LANG = (typeof location !== 'undefined' && /en/.test(location.hash)) ? 'en' : 'id';
const B = BEATS[LANG];
export const FPS = 30, TOTAL = B.end;
const NIGHT = 'night', LAB = 'lab';
export const SHOTS = [
  { id: 'hook', a: 0, light: NIGHT }, { id: 'gta', a: B.gta, light: NIGHT }, { id: 'superhero', a: B.superhero, light: NIGHT }, { id: 'cost', a: B.cost, light: NIGHT },
  { id: 'first', a: B.first, light: LAB }, { id: 'weeks', a: B.weeks, light: LAB }, { id: 'scientist', a: B.scientist, light: LAB }, { id: 'bored', a: B.bored - 14, light: LAB },
  { id: 'argue', a: B.argue, light: NIGHT }, { id: 'ny', a: B.ny, light: LAB }, { id: 'dull', a: B.dull, light: LAB }, { id: 'grab', a: B.grab, light: LAB },
  { id: 'tennis', a: B.tennis, light: LAB }, { id: 'net', a: B.net, light: LAB }, { id: 'boxes', a: B.boxes, light: LAB }, { id: 'hundreds', a: B.hundreds, light: LAB },
  { id: 'nextyear', a: B.nextyear, light: LAB }, { id: 'apart', a: B.apart, light: LAB }, { id: 'patents', a: B.patents, light: LAB },
  { id: 'later', a: B.later, light: LAB }, { id: 'city', a: Math.round((B.later + B.city) / 2), light: NIGHT }, { id: 'buttons', a: B.buttons, light: NIGHT },
  { id: 'line', a: B.line, light: LAB }, { id: 'preorders', a: B.preorders, light: NIGHT }, { id: 'still', a: B.still, light: NIGHT },
];
SHOTS.forEach((s, i) => { s.b = i < SHOTS.length - 1 ? SHOTS[i + 1].a - 1 : TOTAL - 1; s.n = s.b - s.a + 1; });
const _shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const smooth = M.smooth;
const at = (S, u) => Math.round(S.a + u * S.n);

// ---------- lights ----------
export const LIGHTS = {
  night: { az: 200, el: 38, sky: '#6a5ab0', ground: '#2a1a3a', hemi: 1.25, sun: '#9aaaff', sunI: 0.9, fog: '#3a2a5e', fogNear: 35, fogFar: 260,
    skyTop: '#120a30', skyHor: '#ff6a8a', sat: 1.18, vig: 0.34, shadowExt: 12 },
  lab: { az: 68, el: 54, sky: '#efe2c6', ground: '#7a6a50', hemi: 1.15, sun: '#ffe7c4', sunI: 2.1, fog: '#e2d6ba', fogNear: 40, fogFar: 320,
    skyTop: '#86acd6', skyHor: '#eadfc6', sat: 0.82, gain: '#ffeccc', lift: '#0c0703', vig: 0.34, shadowExt: 6 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- marks ----------
const C = 60;                         // city x origin
const SW = 0.15;                      // sidewalk height
const SCR = [0, 1.035, -1.333];       // scope screen centre (table position)
const HIG = [-0.5, 0, -0.8], TECH = [0.65, 0, -0.85];
const QX = (i) => C - 1.6 - i * 0.92, QZ = (i) => -5.6 + (i % 2 ? 0.28 : -0.2); // city queue
const GRAN = 9;                       // grandpa's place in the city queue

// ---------- cameras ----------
const camKeys = (S) => {
  const A = (u) => at(S, u);
  switch (S.id) {
    case 'hook': return [
      { f: 0, pos: [C - 0.6, 1.3, 0.6], look: [C - 0.2, 6.4, -8.4], fov: 52 },
      { f: S.b, pos: [C - 0.9, 1.5, 1.6], look: [C - 0.4, 6.8, -8.4], fov: 50 } ];
    case 'gta': return [
      { f: S.a, pos: [C - 14, 1.7, -1.6], look: [C - 6, 1.5, -6.0], fov: 46 },
      { f: S.b, pos: [C - 4, 2.2, -0.2], look: [C + 0.5, 2.6, -7.4], fov: 44 } ];
    case 'superhero': return [
      { f: S.a, pos: [C + 9, 1.6, 4.5], look: [C + 17, 5, -7], fov: 52 },
      { f: S.b, pos: [C + 8.5, 2.0, 6.0], look: [C + 19, 19, -6], fov: 58 } ];
    case 'cost': return [
      { f: S.a, pos: [C - 4.2, 0.9, 6.2], look: [C - 2, 0.9, 1.5], fov: 46 },
      { f: S.b, pos: [C - 3.4, 1.4, 4.8], look: [C - 2, 1.2, 1.5], fov: 42 } ];
    case 'first': return [
      { f: S.a, pos: [SCR[0] + 0.04, SCR[1] + 0.02, SCR[2] + 0.36], look: SCR, fov: 32 },
      { f: S.b, pos: [SCR[0] + 0.12, SCR[1] + 0.1, SCR[2] + 0.75], look: SCR, fov: 34 } ];
    case 'weeks': return [
      { f: S.a, pos: [0.3, 1.6, 2.2], look: [0.05, 1.4, -1.3], fov: 46 },
      { f: S.b, pos: [0.25, 1.55, 1.9], look: [0.05, 1.4, -1.3], fov: 44 } ];
    case 'scientist': return [
      { f: S.a, pos: [-0.3, 1.6, 1.25], look: [-0.5, 1.5, -0.8], fov: 42 },
      { f: S.b, pos: [-0.33, 1.62, 1.0], look: [-0.5, 1.52, -0.8], fov: 40 } ];
    case 'bored': return [
      { f: S.a, pos: [-3.1, 1.5, 1.4], look: [-4.6, 1.35, -1.2], fov: 44 },
      { f: S.b, pos: [-3.3, 1.5, 1.1], look: [-4.6, 1.35, -1.2], fov: 42 } ];
    case 'argue': return [
      { f: S.a, pos: [QX(3.5), 1.75, -2.6], look: [QX(3.5), 1.75, -5.6], fov: 44 },
      { f: S.b, pos: [QX(3.5) + 0.05, 1.72, -2.9], look: [QX(3.5), 1.75, -5.6], fov: 42, roll: -2 } ];
    case 'ny': return [
      { f: S.a, pos: [3.2, 2.2, 8.4], look: [0.8, 1.7, -4], fov: 50 },
      { f: S.b, pos: [2.4, 1.9, 6.6], look: [0.4, 1.5, -3], fov: 48 } ];
    case 'dull': return [
      { f: S.a, pos: [-4.2, 1.6, -0.9], look: [-6.1, 1.45, -2.5], fov: 44 },
      { f: B.photos + 8, pos: [-4.3, 1.6, -1.1], look: [-6.1, 1.45, -2.5], fov: 42 },
      { f: B.charts + 4, pos: [-3.4, 1.6, 1.5], look: [-5.5, 1.4, -0.4], fov: 44 },
      { f: B.machines + 10, pos: [-4.0, 1.45, 3.4], look: [-6.0, 1.0, 1.9], fov: 42 },
      { f: S.b, pos: [-4.15, 1.42, 3.2], look: [-6.0, 1.0, 1.9], fov: 40 } ];
    case 'grab': return [
      { f: S.a, pos: [0.5, 1.6, 1.9], look: [-0.2, 1.2, -1.3], fov: 46 },
      { f: S.b, pos: [0.35, 1.5, 1.3], look: [-0.15, 1.1, -1.3], fov: 44 } ];
    case 'tennis': return [
      { f: S.a, pos: [SCR[0] + 0.05, SCR[1] + 0.03, SCR[2] + 0.42], look: SCR, fov: 34 },
      { f: B.screen - 2, pos: [SCR[0] + 0.06, SCR[1] + 0.04, SCR[2] + 0.5], look: SCR, fov: 34 },
      { f: B.screen + 18, pos: [0.25, 1.45, 0.55], look: [-0.2, 1.3, -1.2], fov: 40, ease: 'easeOut' },
      { f: S.b, pos: [0.22, 1.43, 0.45], look: [-0.2, 1.3, -1.2], fov: 39 } ];
    case 'net': return [
      { f: S.a, pos: [SCR[0] + 0.03, SCR[1] + 0.02, SCR[2] + 0.34], look: SCR, fov: 33 },
      { f: S.b, pos: [SCR[0] + 0.0, SCR[1] + 0.0, SCR[2] + 0.3], look: SCR, fov: 32 } ];
    case 'boxes': return [
      { f: S.a, pos: [0.05, 1.32, 0.05], look: [0, 0.9, -1.2], fov: 44 },
      { f: S.b, pos: [-0.02, 1.22, -0.2], look: [-0.05, 0.88, -1.2], fov: 42 } ];
    case 'hundreds': case 'line': return [
      { f: S.a, pos: [2.2, 2.0, 6.2], look: [0, 1.3, -1], fov: 46 },
      { f: S.b, pos: [1.8, 1.8, 5.2], look: [0, 1.25, -1], fov: 44 } ];
    case 'nextyear': { const s = 1.6, P = [0, 0.82 + 0.215 * s, -1.6 + 0.267 * s]; return [
      { f: S.a, pos: [P[0] + 0.1, P[1] + 0.08, P[2] + 0.9], look: P, fov: 36 },
      { f: B.moon - 4, pos: [P[0] + 0.05, P[1] + 0.03, P[2] + 0.62], look: P, fov: 34 },
      { f: S.b, pos: [P[0] - 0.03, P[1] + 0.02, P[2] + 0.56], look: P, fov: 33, roll: 2 } ]; }
    case 'apart': return [
      { f: S.a, pos: [1.2, 1.55, 2.6], look: [1.0, 1.0, -1.1], fov: 46 },
      { f: S.b, pos: [1.5, 1.45, 2.3], look: [1.6, 0.85, -1.0], fov: 44 } ];
    case 'patents': return [
      { f: S.a, pos: [-0.1, 1.6, 1.9], look: [-0.3, 1.4, -0.9], fov: 42 },
      { f: B.thisone, pos: [-0.2, 1.6, 1.4], look: [-0.35, 1.45, -0.9], fov: 40 },
      { f: S.b, pos: [-0.15, 1.6, 1.15], look: [-0.25, 1.48, -0.9], fov: 42 } ];
    case 'later': return [
      { f: S.a, pos: [SCR[0] + 0.04, SCR[1] + 0.02, SCR[2] + 0.4], look: SCR, fov: 33 },
      { f: S.b, pos: [SCR[0] + 0.0, SCR[1] + 0.0, SCR[2] + 0.12], look: SCR, fov: 30, ease: 'easeIn' } ];
    case 'city': return [
      { f: S.a, pos: [C - 22, 11, 9], look: [C - 12, 0.5, -1], fov: 52 },
      { f: S.b, pos: [C - 4, 9, 8], look: [C + 4, 0.5, -2], fov: 50 } ];
    case 'buttons': return [
      { f: S.a, pos: [C + 0.3, 1.6, -2.6], look: [C, 1.5, -7], fov: 40 },
      { f: S.b, pos: [C + 0.2, 1.55, -3.1], look: [C, 1.5, -7], fov: 38 } ];
    case 'preorders': return [
      { f: S.a, pos: [C - 9.5, 1.7, -3.0], look: [C - 6, 1.6, -5.8], fov: 42 },
      { f: S.b, pos: [C - 22, 3.4, 1.0], look: [C - 8, 3.0, -6.5], fov: 48, ease: 'easeOut' } ];
    case 'still': return [
      { f: S.a, pos: [QX(GRAN) + 0.4, 1.72, -2.6], look: [QX(GRAN), 1.62, -5.6], fov: 42 },
      { f: S.b, pos: [QX(GRAN) + 0.15, 1.75, -3.6], look: [QX(GRAN), 1.75, -5.6], fov: 40 } ];
  }
};
const KICKS = [{ f: B.button, a: 0.02 }, { f: B.jupiter, a: 0.03 }, { f: B.apart + 22, a: 0.03 }];
const _camAt = (f) => {
  const S = _shotAt(f), c = camFromKeys(camKeys(S), f, { kicks: KICKS });
  const fl = (a, n = 6, k = 0.85) => (f >= a && f < a + n ? (1 - (f - a) / n) * k : 0);
  const cityShot = SHOTS.find((s) => s.id === 'city').a;
  c.flash = Math.max(fl(B.first), fl(B.argue, 5, 0.6), fl(B.ny, 5, 0.6), fl(cityShot, 8, 1), fl(B.line, 6, 0.7), fl(B.preorders, 6, 0.7), fl(B.moon, 3, 0.25), fl(B.jupiter, 3, 0.25));
  if (S.light === NIGHT) c.shadowAt = c.look.map((v, i) => (i === 1 ? 0 : v));
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const _dofAt = (f) => {
  const S = _shotAt(f), Cm = _camAt(f), L = Cm.look;
  switch (S.id) {
    case 'hook': case 'superhero': case 'city': case 'ny': return { focus: dist(Cm.pos, L), cinf: 2 };
    case 'first': case 'tennis': case 'net': case 'nextyear': case 'later': return { focus: dist(Cm.pos, L), cinf: 10 };
    case 'boxes': return { focus: dist(Cm.pos, [0, 0.9, -1.2]), cinf: 12 };
    case 'gta': case 'preorders': return { focus: dist(Cm.pos, L), cinf: 6 };
  }
  return { focus: dist(Cm.pos, L), cinf: 9 };
};

// ---------- world state ----------
const TABLE_TOP = 0.82;
const _worldAt = (f) => {
  const S = _shotAt(f);
  const W = { scopeVis: true, scopeP: [0, TABLE_TOP, -1.6], scopeS: 1, compVis: true, compP: [0.6, 0, -2.4], ctrlVis: true, knob: 0, press: false, lidUp: 0,
    on: true, mode: 'tennis', net: 1, ball: 1, bb: 3.79e9, bbLabel: '24 HOURS', money: 1, coins: 0 };
  if (S.id === 'hook') { W.bb = 3.79e9 * M.easeOut(ramp(f, 6, B.gta - 20)); }
  if (S.id === 'superhero') W.money = M.easeOut(ramp(f, S.a + 8, S.b - 10));
  if (S.id === 'cost') W.coins = M.back(ramp(f, S.a + 4, S.a + 40));
  if (S.id === 'hook') W.money = 0;
  if (S.id === 'gta') W.money = 0;
  if (['weeks', 'scientist', 'bored', 'ny', 'dull'].includes(S.id)) { W.scopeVis = false; W.compVis = false; W.ctrlVis = false; }
  if (S.id === 'weeks') { W.scopeVis = true; W.on = false; W.ctrlVis = false; }
  if (S.id === 'grab') {
    const tc = smooth(ramp(f, S.a + 6, S.a + 30)), ts = M.back(ramp(f, at(S, 0.45), at(S, 0.45) + 18));
    W.compP = [lerp(3.5, 0.6, tc), 0, -2.4]; W.scopeP = [0, TABLE_TOP + (1 - ts) * 1.2, -1.6]; W.on = false; W.ctrlVis = false;
  }
  if (S.id === 'tennis') { W.on = f >= B.tennis - 1; W.net = 0; W.ball = 0; W.ctrlVis = true; }
  if (S.id === 'net') { W.net = ramp(f, B.net - 2, B.net + 22); W.ball = f >= B.ball - 2 ? 1 : 0; }
  if (S.id === 'boxes') { W.knob = f >= B.knob - 2 ? smooth(ramp(f, B.knob - 2, B.knob + 14)) * 2.2 : 0; W.press = f >= B.button - 1 && f < B.button + 6; }
  if (S.id === 'nextyear') { W.scopeS = M.back(ramp(f, S.a + 2, S.a + 20)) * 0.6 + 1; W.mode = f >= B.jupiter - 2 ? 'jupiter' : f >= B.moon - 2 ? 'moon' : 'tennis'; }
  if (S.id === 'apart') {
    const t = smooth(ramp(f, S.a + 6, S.a + 24)); W.ctrlVis = f < S.a + 6;
    W.scopeP = [lerp(0, 1.7, t), TABLE_TOP + Math.sin(t * Math.PI) * 0.4 - t * 0.5, lerp(-1.6, -0.9, t)]; W.scopeS = 1 - t * 0.3; W.scopeVis = t < 0.98; W.on = false;
    W.lidUp = f < S.a + 24 ? 0.5 * smooth(ramp(f, S.a, S.a + 6)) : 0.5 * (1 - smooth(ramp(f, S.a + 24, S.a + 30)));
    W.compP = [lerp(0.6, 4.5, smooth(ramp(f, S.a + 26, S.b))), 0, -2.4];
  }
  if (S.id === 'patents') { W.scopeVis = false; W.ctrlVis = false; W.compP = [4.5, 0, -2.4]; }
  if (S.id === 'later') { W.net = 0; W.mode = 'tennis'; W.ctrlVis = false; }
  if (['preorders', 'still', 'buttons'].includes(S.id)) { W.bb = 32.5e6; W.bbLabel = 'PRE-ORDERS'; }
  return W;
};

// ---------- actors (2D cards) ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
const YOUTH = ['youA', 'youB', 'youC', 'youD', 'youE'];
const cityQueue = (f, T, out, tint, opts = {}) => {
  for (let i = 0; i < 16; i++) {
    const who = i === GRAN && opts.gran ? 'gran58' : YOUTH[(i * 3) % 5], near = opts.near ? Math.abs(i - opts.near) < 3 : i < 3;
    const o = near ? { seed: 20 + i, ...life(f, 20 + i), look: q(opts.look ?? 0.3, 1), expr: opts.exprs?.[i] || (i % 3 ? 'smile' : 'neutral'), ...(opts.pose?.[i] || {}) } : { seed: 20 + i, look: 0.3, expr: 'neutral', blink: 0 };
    out.push(R(T, who, o, [QX(i), SW, QZ(i)], { tint, ground: SW, s: who === 'gran58' ? 0.98 : 1 }));
  }
};
const labQueue = (f, T, out, tint) => {
  const who = ['dad58', 'mom58', 'kid58', 'gran58', 'dad58', 'mom58', 'kid58', 'mom58', 'dad58'];
  for (let i = 0; i < 9; i++) { const near = i < 3;
    const o = near ? { seed: 40 + i, ...life(f, 40 + i), expr: i % 2 ? 'grin' : 'smile', look: -0.3 } : { seed: 40 + i, expr: 'smile', look: -0.3 };
    out.push(R(T, who[i], o, [0.15 + (i % 2 ? 0.35 : -0.25), 0, -0.1 + i * 0.75], { tint, s: who[i] === 'kid58' ? 0.74 : 1 })); }
};
const _actorsAt = (f, T) => {
  const S = _shotAt(f), out = [];
  const tint = S.light === NIGHT ? '#d6ccff' : '#ffffff';
  const hig = (o, pos = HIG, extra = {}) => out.push(R(T, 'higgy', { seed: 5, ...life(f, 5), ...o }, pos, { tint, ...extra }));
  const tech = (o, pos = TECH, extra = {}) => out.push(R(T, 'tech', { seed: 9, ...life(f, 9), facing: -1, ...o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'hook': cityQueue(f, T, out, tint, { look: 0.8, exprs: { 0: 'shock', 1: 'grin', 2: 'shock' }, pose: { 0: { L: 'up', R: 'up' }, 2: { L: 'cheek', R: 'cheek' } } }); break;
    case 'gta': cityQueue(f, T, out, tint, { near: 12, look: 0.6, exprs: { 10: 'grin', 11: 'laugh', 12: 'grin', 13: 'smile' }, pose: { 11: { L: 'up', R: 'wave', wv: q(f * 0.4, 1) } } }); break;
    case 'superhero': case 'cost': cityQueue(f, T, out, tint, { look: 0.5, exprs: { 0: 'shock', 1: 'shock', 2: 'shock' } }); break;
    case 'weeks': {
      hig({ expr: 'stern', R: 'reach', L: 'hip', look: 0.6 }); tech({ expr: 'smile', L: 'reach', look: -0.6, headTilt: q(4 * Math.sin(f * 0.3), 1) });
      break;
    }
    case 'scientist': hig({ expr: f > S.a + 8 ? 'grin' : 'smile', look: 0.1, R: 'wave', wv: q(f * 0.35, 1) }); break;
    case 'bored': {
      const yw = (k) => ((f + k * 9) % 60) < 30;
      out.push(R(T, 'dad58', { seed: 41, ...life(f, 41), expr: yw(0) ? 'yawn' : 'dazed', L: yw(0) ? 'cheek' : 'hang' }, [-4.9, 0, -1.6], { tint }));
      out.push(R(T, 'mom58', { seed: 42, ...life(f, 42), expr: yw(1) ? 'yawn' : 'neutral' }, [-4.4, 0, -1.2], { tint }));
      out.push(R(T, 'kid58', { seed: 43, expr: 'snore', blink: 1, tilt: 8 }, [-4.0, 0, -0.9], { tint, s: 0.74 }));
      break;
    }
    case 'argue': {
      const k = smooth(ramp(f, S.a + 6, S.a + 16));
      cityQueue(f, T, out, tint, { near: 4, look: 0, exprs: { 3: k > 0.5 ? 'stubborn' : 'neutral', 4: k > 0.5 ? 'shock' : 'neutral' },
        pose: { 3: { L: 'point', facing: 1, look: 0.8, R: 'hip' }, 4: { L: 'up', R: 'up', facing: -1, look: -0.8 } } });
      break;
    }
    case 'ny': {
      const w = (i) => Math.max(0, f - S.a - i * 8) / 30 * 0.9;
      [['dad58', 1.0], ['mom58', 1.5], ['kid58', 2.0], ['gran58', 2.5]].forEach(([who, x], i) => out.push(R(T, who, { seed: 41 + i, step: q(((f + i * 7) % 18) / 18, 2), look: -0.2 }, [x, 0, 4.5 - w(i)], { tint, s: who === 'kid58' ? 0.74 : 1 })));
      hig({ expr: 'smile', R: 'wave', wv: q(f * 0.35, 1), look: 0.3 });
      break;
    }
    case 'dull': {
      const yw = (k) => ((f + k * 11) % 54) < 26;
      out.push(R(T, 'dad58', { seed: 41, ...life(f, 41), expr: yw(0) ? 'yawn' : 'dazed', L: yw(0) ? 'cheek' : 'hang', look: -0.6 }, [-5.0, 0, -2.0], { tint }));
      out.push(R(T, 'mom58', { seed: 42, ...life(f, 42), expr: yw(1) ? 'yawn' : 'neutral', look: -0.6 }, [-5.0, 0, -0.65], { tint }));
      out.push(R(T, 'kid58', { seed: 43, expr: 'snore', blink: 1, tilt: 10 }, [-5.2, 0, 1.75], { tint, s: 0.74 }));
      break;
    }
    case 'grab': {
      const lift = f > at(S, 0.4) && f < at(S, 0.65);
      hig({ expr: f > at(S, 0.6) ? 'grin' : 'stern', L: lift ? 'lift' : 'point', R: 'hip', look: 0.6, lift: 0.4 });
      break;
    }
    case 'tennis': hig({ expr: 'grin', R: f > B.screen ? 'point' : 'hip', L: 'hip', look: 0.7 }, [-0.45, 0, -0.85]); break;
    case 'boxes': break;
    case 'hundreds': case 'line': {
      labQueue(f, T, out, tint);
      hig({ expr: 'grin', L: 'hip', R: 'thumb', look: 0.5 }, [-1.0, 0, -0.6]);
      break;
    }
    case 'apart': tech({ expr: 'neutral', L: 'reach', R: 'reach', lift: q(smooth(ramp(f, S.a + 4, S.a + 20)), 2), look: -0.4 }, [2.35, 0, -1.25]); break;
    case 'patents': {
      const shrug = f >= B.never - 2 && f < B.simple - 4;
      hig({ expr: f >= B.simple - 3 ? 'smile' : f >= B.never - 2 ? 'whistle' : f >= B.thisone - 2 ? 'nervous' : 'smile',
        L: shrug ? 'up' : f >= B.simple - 3 ? 'hip' : 'hip', R: shrug ? 'up' : f >= B.simple - 3 ? 'thumb' : 'point', headTilt: shrug ? 8 : 0, look: f < B.thisone ? 0.6 : 0 });
      break;
    }
    case 'preorders': cityQueue(f, T, out, tint, { near: 10, gran: true, look: 0.5, exprs: { 9: 'smile', 10: 'grin', 11: 'smile' } }); break;
    case 'still': {
      const qn = f >= B.question - 2;
      cityQueue(f, T, out, tint, { near: GRAN, gran: true, look: 0, exprs: { [GRAN]: qn ? 'wink' : 'smile', [GRAN - 1]: qn ? 'grin' : 'smile', [GRAN + 1]: 'smile' },
        pose: { [GRAN]: { R: qn ? 'thumb' : 'hang' }, [GRAN - 1]: { look: qn ? 0 : -0.7 } } });
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const U = 0.00225;
const FX = (key, draw, c, s, extra = {}) => ({ key, draw, x: c[0], y: c[1] - (975 - 500) * U * s, z: c[2], s, blob: false, shadow: false, order: 5, ...extra });
const _fxAt = (f, T) => {
  const S = _shotAt(f), out = [];
  if (S.id === 'weeks') { const d = Math.min(14, 1 + Math.floor(ramp(f, S.a + 4, S.b - 4) * 13)); out.push(FX('cal' + d, (p) => T.fxCalendar(p, d), [0.05, 2.25, -2.6], 0.42)); }
  if (S.id === 'argue') { const k = smooth(ramp(f, S.a + 8, S.a + 18)); if (k > 0) { out.push(FX('q?', (p) => T.fxGlyph(p, '?'), [QX(3) + 0.1, 2.35, QZ(3)], 0.22 * k)); out.push(FX('q!', (p) => T.fxGlyph(p, '!', '#ff4fa0'), [QX(4) - 0.1, 2.35, QZ(4)], 0.22 * k)); } }
  if (S.id === 'bored' || S.id === 'dull') { const t = q(((f - S.a) % 30) / 30, 1); out.push(FX('yawn' + t, (p) => T.fxYawn(p, t), [S.id === 'bored' ? -4.7 : -4.8, 2.0, S.id === 'bored' ? -1.4 : -1.5], 0.2)); }
  if (S.id === 'dull' || S.id === 'bored') { const t = q(((f - S.a) / 50) % 1, 2); out.push(FX('zk' + t, (p) => T.fxZ(p, t), S.id === 'dull' ? [-5.1, 1.45, 1.85] : [-3.95, 1.4, -0.85], 0.4)); }
  if (S.id === 'patents') { const n = Math.round(20 * smooth(ramp(f, S.a + 2, S.a + 30))); out.push(FX('pat' + n, (p) => T.fxPatents(p, n), [0.12, 0.82 + (930 - 500) * U * 0.4, -1.15], 0.4)); }
  if (S.id === 'city') { // the dot races through the streets
    const u = smooth(ramp(f, S.a + 2, S.b)); const x = C - 20 + u * 26;
    out.push(FX('dot', (p) => T.fxDot(p), [x, 0.9, -0.5], 2.4, { order: 7 }));
    for (let k = 1; k < 6; k++) out.push(FX('dot', (p) => T.fxDot(p, 0.6), [x - k * 1.6, 0.9, -0.5], 2.4 - k * 0.3, { order: 6, alpha: 1 - k * 0.16 }));
  }
  if (S.id === 'buttons') { const t = q(smooth(ramp(f, S.a + 4, S.a + 26)), 2); out.push(FX('ctl' + t, (p) => T.fxController(p, t), [C, 1.55, -4.9], 0.55, { order: 7 })); }
  return out;
};


// ---------- thumbnail modes (#thumbA city, #thumbB lab) ----------
const TH = typeof location !== 'undefined' ? (location.hash.match(/thumb([AB])/) || [])[1] : null;
const TS = { A: { id: 'thA', light: NIGHT, a: 0, b: 0, n: 1 }, B: { id: 'thB', light: LAB, a: 0, b: 0, n: 1 } };
const TC = { A: { pos: [C - 2.5, 1.75, -1.4], look: [C - 2.52, 1.7, -5.7], fov: 50, roll: 3 }, B: { pos: [0.0, 1.4, 2.1], look: [0.0, 1.8, -1.3], fov: 54, roll: -3 } };
export const shotAt = (f) => TH ? TS[TH] : _shotAt(f);
export const camAt = (f) => { if (!TH) return _camAt(f); const c = { ...TC[TH], flash: 0 }; c.shadowAt = TH === 'A' ? [C - 1.5, 0, -5.8] : [-0.2, 1, -1]; return c; };
export const dofAt = (f) => TH ? { focus: TH === 'A' ? 4.0 : 2.0, cinf: 7 } : _dofAt(f);
export const worldAt = (f) => { const W = _worldAt(TH ? B.boxes : f); if (TH) { W.on = true; W.net = 1; W.ball = 1; W.money = 1; W.coins = 0; W.ctrlVis = true; W.scopeVis = true; W.scopeS = TH === 'B' ? 2.1 : 1; } return W; };
export const actorsAt = (f, T) => {
  if (!TH) return _actorsAt(f, T);
  const out = [];
  if (TH === 'A') {
    const P = [['youB', { expr: 'shock', L: 'up', R: 'up', look: 0.2 }], ['youA', { expr: 'laugh', L: 'wave', R: 'up', look: -0.3 }], ['youC', { expr: 'grin', L: 'point', R: 'hip', look: 0.5 }], ['youE', { expr: 'shock', L: 'cheek', R: 'cheek', look: 0 }], ['youD', { expr: 'grin', look: 0.3 }]];
    P.forEach(([who, o], i) => out.push(R(T, who, { seed: 20 + i, ...o }, [QX(i), SW, QZ(i)], { tint: '#e6dcff', ground: SW })));
  } else {
    out.push(R(T, 'higgy', { seed: 5, expr: 'grin', L: 'hip', R: 'point', look: 0.6, tilt: -4 }, [-0.62, 0, -0.75]));
    out.push(R(T, 'kid58', { seed: 43, expr: 'shock', L: 'cheek', R: 'cheek', look: -0.5, facing: -1 }, [0.62, 0, -0.8], { s: 0.74 }));
  }
  return out;
};
export const fxAt = (f, T) => TH ? [] : _fxAt(f, T);

