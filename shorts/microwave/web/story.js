// "The Candy Bar That Invented the Microwave" — one shot plan, two timings (#id / #en in the page hash).
import { BEATS } from './beats.js';
import * as TT from './toon.js';
import { M, camFromKeys, idle, blinkAt, q, clamp, lerp, ramp } from './motion.js';

const LANG = (typeof location !== 'undefined' && /en/.test(location.hash)) ? 'en' : 'id';
const B = BEATS[LANG];
export const FPS = 30, TOTAL = B.end;
export const SHOTS = [
  { id: 'hook', a: 0, light: 'kday' },
  { id: 'candy', a: B.candy, light: 'lab' },
  { id: 'lab', a: B.forties, light: 'lab' },
  { id: 'school', a: B.school, light: 'lab' },
  { id: 'tube', a: B.oneday, light: 'lab' },
  { id: 'melt', a: B.melt - 12, light: 'lab' },
  { id: 'corn', a: B.corn, light: 'lab' },
  { id: 'egg', a: B.egg, light: 'lab' },
  { id: 'wave', a: B.wave, light: 'blue' },
  { id: 'oven', a: B.oven, light: 'lab' },
  { id: 'today', a: B.today, light: 'kday' },
];
SHOTS.forEach((s, i) => { s.b = i < SHOTS.length - 1 ? SHOTS[i + 1].a - 1 : TOTAL - 1; s.n = s.b - s.a + 1; });
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const smooth = M.smooth;
const at = (S, u) => Math.round(S.a + u * S.n); // fraction of the shot -> frame

// ---------- lights ----------
export const LIGHTS = {
  kday: { az: 72, el: 50, sky: '#d4e4f6', ground: '#9a9078', hemi: 1.2, sun: '#fff3e0', sunI: 2.3, fog: '#d6e6f4', fogNear: 40, fogFar: 500,
    skyTop: '#4f8fdc', skyHor: '#cfe2f4', sat: 1.12, vig: 0.2, shadowExt: 5 },
  lab: { az: 68, el: 54, sky: '#efe2c6', ground: '#7a6a50', hemi: 1.15, sun: '#ffe7c4', sunI: 2.1, fog: '#e2d6ba', fogNear: 40, fogFar: 320,
    skyTop: '#86acd6', skyHor: '#eadfc6', sat: 0.93, gain: '#fff1da', lift: '#0a0602', vig: 0.32, shadowExt: 6 },
  blue: { az: 70, el: 38, sky: '#5466a8', ground: '#1a2036', hemi: 1.0, sun: '#8aa6ff', sunI: 1.3, fog: '#1e2846', fogNear: 8, fogFar: 90,
    skyTop: '#0b1330', skyHor: '#26335f', sat: 1.08, gain: '#d0dcff', vig: 0.4, shadowExt: 5 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- stage marks ----------
const SP = [-0.25, 0, -0.5];         // Spencer at the bench
const CWP = [0.95, 0, -0.85];        // coworker
const BENCH_Y = 0.86, BOWL = [-0.05, BENCH_Y, -1.35], KETTLE = [-0.75, BENCH_Y, -1.45], TUBE = [0.75, BENCH_Y, -1.65];
const MWC = [40, 1.08, -2.42];       // kitchen microwave front centre
const U = 0.00225;
const pocketWorld = (T, pos, s = 1) => { const [px, py] = T.pocketXY(3); return [pos[0] + (px - 300) * U * s, pos[1] + (975 - py) * U * s, pos[2] + 0.02]; };
const FACE_Y = 1.78;

// ---------- cameras ----------
const camKeys = (S) => {
  const A = (u) => at(S, u);
  switch (S.id) {
    case 'hook': return [
      { f: 0, pos: [40.32, 1.3, -1.05], look: [39.97, 1.07, -2.45], fov: 40 },
      { f: S.b, pos: [40.06, 1.14, -1.7], look: [39.98, 1.07, -2.45], fov: 33, roll: -2 },
    ];
    case 'candy': { const P = pocketWorld(TT, SP); return [
      { f: S.a, pos: [P[0] + 0.06, P[1] + 0.12, P[2] + 0.6], look: [P[0], P[1] + 0.06, P[2]], fov: 32 },
      { f: A(0.45), pos: [P[0] + 0.06, P[1] + 0.12, P[2] + 0.7], look: [P[0], P[1] + 0.08, P[2]], fov: 32 },
      { f: S.b, pos: [SP[0] + 0.15, 1.6, SP[2] + 2.3], look: [SP[0] + 0.05, 1.45, SP[2]], fov: 38, ease: 'smooth' },
    ]; }
    case 'lab': return [
      { f: S.a, pos: [3.4, 2.9, 7.2], look: [-1.2, 1.5, -4.0], fov: 46 },
      { f: A(0.55), pos: [1.0, 1.75, 2.6], look: [-0.1, 1.35, -1.0], fov: 42, path: [[2.4, 2.4, 5.2]] },
      { f: S.b, pos: [0.85, 1.7, 2.3], look: [-0.05, 1.35, -1.0], fov: 40 },
    ];
    case 'school': return [
      { f: S.a, pos: [0.42, 1.62, 2.8], look: [0.36, 1.5, -0.6], fov: 44 },
      { f: S.b, pos: [0.4, 1.62, 2.45], look: [0.36, 1.52, -0.6], fov: 41 },
    ];
    case 'tube': return [
      { f: S.a, pos: [1.9, 1.55, 1.0], look: [0.45, 1.25, -1.2], fov: 42 },
      { f: S.b, pos: [1.15, 1.38, 0.35], look: [0.22, 1.2, -0.85], fov: 36 },
    ];
    case 'melt': { const P = pocketWorld(TT, TP), F = [TP[0], FACE_Y, TP[2]]; return [
      { f: S.a, pos: [P[0] + 0.1, P[1] + 0.06, P[2] + 0.62], look: P, fov: 32 },
      { f: B.melt + 16, pos: [P[0] + 0.08, P[1] + 0.04, P[2] + 0.55], look: P, fov: 31 },
      { f: B.melt + 24, pos: [F[0] + 0.05, F[1] - 0.15, F[2] + 1.75], look: [F[0], F[1] - 0.12, F[2]], fov: 36, ease: 'easeOut' },
      { f: S.b, pos: [F[0] + 0.05, F[1] - 0.15, F[2] + 1.95], look: [F[0], F[1] - 0.12, F[2]], fov: 37 },
    ]; }
    case 'corn': return [
      { f: S.a, pos: [0.15, 1.38, -0.15], look: [-0.05, 0.98, -1.35], fov: 38 },
      { f: B.pop - 2, pos: [0.12, 1.34, -0.3], look: [-0.05, 0.98, -1.35], fov: 36 },
      { f: B.pop + 18, pos: [0.1, 1.85, 3.6], look: [0.1, 1.3, -0.9], fov: 50, ease: 'easeOut' },
      { f: S.b, pos: [0.1, 1.82, 3.4], look: [0.1, 1.3, -0.9], fov: 49 },
    ];
    case 'egg': return [
      { f: S.a, pos: [-0.2, 1.55, 1.7], look: [-0.85, 1.32, -1.1], fov: 36 },
      { f: B.burst - 2, pos: [-0.3, 1.55, 1.35], look: [-0.9, 1.35, -1.1], fov: 34 },
      { f: S.b, pos: [-0.25, 1.6, 1.9], look: [-0.6, 1.4, -1.0], fov: 38, roll: 2 },
    ];
    case 'wave': return [
      { f: S.a, pos: [0.3, 1.3, 0.75], look: [0.3, 1.2, -0.9], fov: 40 },
      { f: S.b, pos: [0.3, 1.24, 0.35], look: [0.3, 1.18, -0.9], fov: 36, roll: -2 },
    ];
    case 'oven': return [
      { f: S.a, pos: [0.75, 1.25, 4.6], look: [0.62, 1.12, 0.3], fov: 44 },
      { f: B.piano - 26, pos: [0.75, 1.3, 4.2], look: [0.62, 1.15, 0.3], fov: 43 },
      { f: B.piano - 6, pos: [1.75, 2.1, 7.6], look: [1.75, 1.45, 0.3], fov: 56, ease: 'easeOut' },
      { f: S.b, pos: [1.75, 2.05, 7.3], look: [1.75, 1.4, 0.3], fov: 55 },
    ];
    case 'today': return [
      { f: S.a, pos: [41.3, 1.55, 0.9], look: [40.0, 1.15, -2.4], fov: 46 },
      { f: B.popcorn - 8, pos: [40.15, 1.2, -1.35], look: [39.98, 1.1, -2.45], fov: 36 },
      { f: S.b, pos: [40.1, 1.18, -1.15], look: [39.98, 1.12, -2.45], fov: 40, ease: 'easeOut' },
    ];
  }
};
const KICKS = [{ f: B.melt, a: 0.03 }, { f: B.pop, a: 0.05 }, { f: B.burst, a: 0.05 }, { f: B.piano, a: 0.07 }, { f: B.popcorn, a: 0.05 }];
const TP = [0.3, 0, -0.75];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(camKeys(S), f, { kicks: KICKS });
  const fl = (a, n = 6, k = 0.85) => (f >= a && f < a + n ? (1 - (f - a) / n) * k : 0);
  c.flash = Math.max(fl(B.candy), fl(B.oven), fl(B.today), fl(B.wave, 5, 0.4), fl(B.popcorn, 4, 0.3));
  if (S.id === 'oven') c.shadowAt = [1.8, 1, 0.3];
  if (S.id === 'hook' || S.id === 'today') c.shadowAt = [40, 1, -2.4];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, MWC), cinf: 10 };
    case 'today': return { focus: dist(C.pos, MWC), cinf: lerp(4, 10, smooth(ramp(f, S.a, B.popcorn - 8))) };
    case 'candy': return { focus: dist(C.pos, f < at(S, 0.5) ? [-0.06, 1.28, -0.5] : [-0.22, 1.55, -0.5]), cinf: 12 };
    case 'lab': return { focus: dist(C.pos, [SP[0], 1.5, SP[2]]), cinf: lerp(2, 9, smooth(ramp(f, S.a, at(S, 0.6)))) };
    case 'school': return { focus: dist(C.pos, [SP[0], FACE_Y, SP[2]]), cinf: 8 };
    case 'tube': return { focus: dist(C.pos, [TP[0], 1.5, TP[2]]), cinf: 9 };
    case 'melt': return { focus: dist(C.pos, C.look), cinf: 12 };
    case 'corn': return { focus: dist(C.pos, f < B.pop ? BOWL : [0, 1.3, -0.8]), cinf: f < B.pop ? 12 : lerp(12, 4, smooth(ramp(f, B.pop, B.pop + 18))) };
    case 'egg': return { focus: dist(C.pos, [-1.2, FACE_Y, -0.95]), cinf: 9 };
    case 'wave': return { focus: dist(C.pos, [0.3, 1.2, -0.75]), cinf: 12 };
    case 'oven': return { focus: dist(C.pos, [0.3, 1.5, 0.7]), cinf: lerp(8, 2, smooth(ramp(f, B.piano - 26, B.piano - 6))) };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
const TILT0 = Math.asin(0.35 / 1.8);
export const worldAt = (f) => {
  const S = shotAt(f);
  const W = { seesaw: S.id === 'oven', tube: 0, blue: S.light === 'blue', mwOn: 0, mwDoor: 0, tilt: TILT0, piano: -1, pianoUp: 0, pianoSpin: 0, lid: 0, popped: false };
  if (['lab', 'tube', 'melt', 'corn', 'egg', 'wave'].includes(S.id)) W.tube = S.id === 'lab' ? smooth(ramp(f, B.built + 10, B.built + 20)) : 1;
  if (S.id === 'hook') W.mwOn = 1;
  if (S.id === 'today') { W.mwOn = f < B.popcorn - 3 ? 1 : 0.4; W.mwDoor = M.back(ramp(f, B.popcorn - 3, B.popcorn + 7)); }
  if (S.id === 'corn') W.popped = f >= B.pop;
  if (S.id === 'egg') W.lid = f >= B.burst - 1 ? clamp((f - B.burst + 1) / 22, 0, 1.15) : 0;
  if (S.id === 'oven') {
    const fall0 = B.piano - 14, t = (f - fall0) / 14;
    W.piano = f >= fall0 - 30 ? 1 : -1;
    W.pianoUp = t < 1 ? 7 * (1 - Math.min(1, Math.max(0, t)) ** 2) : 0;
    W.pianoSpin = t < 1 ? 0.12 * (1 - Math.max(0, t)) : 0;
    const s = (f - B.piano) / 30;
    W.tilt = f < B.piano ? TILT0 : TILT0 * (1 - M.spring(s, 1.6, 4.5)) ;
  }
  return W;
};

// ---------- actors (2D cards) ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'blue' ? '#9fb2ff' : '#ffffff';
  const spencer = (o, pos = SP, extra = {}) => out.push(R(T, 'spencer', { seed: 3, ...life(f, 3), ...o }, pos, { tint, ...extra }));
  const cowork = (o, pos = CWP, extra = {}) => out.push(R(T, 'cowork', { seed: 8, ...life(f, 8), ...o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'candy': spencer({ expr: f > at(S, 0.6) ? 'smile' : 'neutral', look: 0.2, melt: 0 }); break;
    case 'lab': {
      const work = f > B.built - 3;
      spencer({ expr: work ? 'stern' : 'neutral', R: work ? 'reach' : 'hang', L: 'hip', look: work ? 0.6 : 0.2, headTilt: work ? q(3 * Math.sin(f * 0.3), 1) : 0, melt: 0 });
      cowork({ expr: 'neutral', look: -0.5, L: 'hang', R: 'hang' }, [3.0, 0, -4.4]);
      break;
    }
    case 'school': {
      const k = smooth(ramp(f, B.school + 6, B.school + 20));
      spencer({ expr: k > 0.5 ? 'grin' : 'smile', R: k > 0.3 ? 'thumb' : 'hang', look: 0.3, melt: 0 }, [-0.05, 0, -0.45]);
      cowork({ expr: k > 0.4 ? 'shock' : 'neutral', L: k > 0.4 ? 'cheek' : 'hang', R: k > 0.4 ? 'cheek' : 'hang', look: -0.6, facing: -1, bob: q(k > 0.4 ? -0.015 * Math.abs(Math.sin(f * 0.4)) : 0, 3) }, [0.8, 0, -1.0]);
      break;
    }
    case 'tube': spencer({ expr: 'whistle', look: 0.7, R: 'hip', melt: 0 }, TP); break;
    case 'melt': {
      const m = smooth(ramp(f, B.melt - 6, B.melt + 14));
      spencer({ expr: f > B.melt + 18 ? 'shock' : 'neutral', look: f > B.melt + 18 ? 0 : 0.6, melt: q(m, 2), L: f > B.melt + 22 ? 'cheek' : 'hang', R: f > B.melt + 22 ? 'cheek' : 'hip' }, TP);
      break;
    }
    case 'corn': {
      const popd = f >= B.pop;
      spencer({ expr: popd ? (f > B.pop + 14 ? 'laugh' : 'shock') : 'grin', L: popd ? 'up' : 'point', R: popd ? 'up' : 'hip', look: 0.7, melt: 1, bob: q(popd && f > B.pop + 14 ? Math.abs(Math.sin(f * 0.5)) * 0.02 : 0, 3) }, [-0.95, 0, -0.75], { flip: false });
      cowork({ expr: popd ? 'shock' : 'nervous', L: popd ? 'cheek' : 'hang', R: popd ? 'cheek' : 'hang', look: -0.7, bob: q(popd ? -0.06 * smooth(ramp(f, B.pop, B.pop + 8)) : 0, 3) }, [1.15, 0, -0.65]);
      break;
    }
    case 'egg': {
      const hit = f >= B.burst, y = smooth(ramp(f, B.burst, B.burst + 5));
      cowork({ expr: hit ? (f > B.burst + 20 ? 'dazed' : 'shock') : 'neutral', look: hit ? 0 : 0.6, L: hit ? 'up' : 'hip', R: hit ? 'up' : 'hang', yolk: q(y, 2), tilt: hit ? 0 : 9 }, [-1.25, 0, -0.95]);
      spencer({ expr: hit ? 'laugh' : 'smile', L: hit ? 'belly' : 'hang', R: hit ? 'belly' : 'hip', look: -0.6, melt: 1, bob: q(hit ? Math.abs(Math.sin(f * 0.55)) * 0.025 : 0, 3), tilt: hit ? q(4 * Math.sin(f * 0.55), 1) : 0 }, [0.25, 0, -0.55]);
      break;
    }
    case 'oven': {
      const landed = f >= B.piano;
      spencer({ expr: landed ? (f > B.piano + 20 ? 'grin' : 'shock') : 'smile', look: landed ? 0.6 : 0.8, L: 'hip', R: landed ? 'up' : 'point', melt: 0 }, [0.22, 0, 0.75]);
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, c, s, extra = {}) => ({ key, draw, x: c[0], y: c[1] - (975 - 500) * U * s, z: c[2], s, blob: false, shadow: false, order: 5, ...extra });
const hash = (i) => ((Math.sin(i * 91.17) * 43758.5453) % 1 + 1) % 1;
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'blue' ? '#c4d0ff' : '#ffffff';
  if (S.id === 'candy') { const t = q(ramp(f, S.a + 6, S.a + 22), 2); if (t > 0 && t < 1) { const P = pocketWorld(T, SP); out.push(FX('glint' + t, (p) => T.fxGlint(p, t), [P[0] + 0.03, P[1] + 0.1, P[2] + 0.05], 0.06)); } }
  if (S.id === 'lab') for (const k of [B.built + 12, B.built + 34]) { const t = q(ramp(f, k, k + 10), 2); if (t > 0 && t < 1) out.push(FX('spark' + t, (p) => T.fxSpark(p, t), [TUBE[0] - 0.2, TUBE[1] + 0.55, TUBE[2] + 0.4], 0.12)); }
  if (['tube', 'melt'].includes(S.id) || (S.id === 'lab' && f > B.built + 20)) { // waves from the horn toward Spencer
    const t = q((f * 0.035) % 1, 2); out.push(FX('waves' + t, (p) => T.fxWaves(p, t), [TUBE[0] - 0.55, TUBE[1] + 0.42, TUBE[2] + 0.55], 0.16, { flip: true, alpha: 0.95 }));
  }
  if (S.id === 'melt' && f > B.melt + 26) { const t = q(((f - B.melt) * 0.05) % 1, 2); out.push(FX('steam' + t, (p) => T.fxSteam(p, t), [TP[0] + 0.18, 1.45, TP[2] + 0.06], 0.1)); }
  if (S.id === 'corn') {
    if (f < B.pop) { const t = q((f * 0.04) % 1, 2); out.push(FX('wavesC' + t, (p) => T.fxWaves(p, t), [0.25, 1.15, -1.2], 0.14, { flip: true })); }
    else for (let i = 0; i < 16; i++) { // ballistic kernels from the bowl, scatter and land
      const t = (f - B.pop + hash(i) * 3) / 30, a = hash(i + 3) * Math.PI * 2, sp = 0.8 + hash(i + 7) * 1.6, up = 3 + hash(i + 11) * 2.5;
      let x = BOWL[0] + Math.cos(a) * sp * t, z = BOWL[2] + Math.abs(Math.sin(a)) * sp * t * 1.3, y = BOWL[1] + 0.15 + up * t - 4.9 * t * t;
      const floorY = Math.abs(x - 0) < 1.7 && z < -1.05 ? BENCH_Y + 0.03 : 0.03; if (y < floorY) y = floorY;
      out.push(FX('pc' + (i % 5), (p) => T.fxPopcorn(p, i % 5 + 1), [x, y, z], 0.12 + hash(i + 2) * 0.05, { roll: q(t * 6 * (i % 2 ? 1 : -1), 1), order: 6 }));
    }
  }
  if (S.id === 'egg') {
    if (f < B.burst) { const t = q((f * 0.04) % 1, 2); out.push(FX('wavesE' + t, (p) => T.fxWaves(p, t), [-0.35, 1.2, -1.25], 0.12, { flip: true })); }
    const t = q(ramp(f, B.burst - 1, B.burst + 16), 2); if (t > 0 && t < 1) out.push(FX('splat' + t, (p) => T.fxSplat(p, t), [KETTLE[0] - 0.15, KETTLE[1] + 0.45, KETTLE[2] + 0.55], 0.32));
    if (f > B.burst + 20) { const t = q(((f - B.burst) * 0.03) % 1, 2); out.push(FX('stars' + t, (p) => { p.g.translate(90, 380); T.fxStars(p, t); }, [-1.25, 2.12, -0.9], 0.22)); }
  }
  if (S.id === 'wave') {
    const k = smooth(ramp(f, B.hands - 4, B.hands + 10)), sp = 0.35 + 0.65 * k;
    [[0.06, 1.5, -0.85], [0.52, 1.44, -0.9], [0.29, 1.14, -0.8], [0.04, 0.84, -0.88], [0.54, 0.82, -0.85]].forEach((P, i) => {
      const ph = f * (0.5 + 1.1 * k) + i * 1.7, jit = 0.012 * sp;
      const o = { rub: q(Math.sin(ph * 2.2), 1), expr: k > 0.5 ? (i % 2 ? 'laugh' : 'grin') : 'smile', blink: blinkAt(f, 20 + i), hot: q(k, 1) };
      out.push(FX('mol' + JSON.stringify(o), (p) => T.fxMolecule(p, o), [P[0] + Math.sin(ph * 3.1) * jit, P[1] + Math.cos(ph * 2.7) * jit, P[2]], 0.3, { roll: q(Math.sin(ph * 2) * 0.12 * sp, 2), tint: '#ffffff', order: 6 }));
    });
    const t = q((f * 0.03) % 1, 2); out.push(FX('wavesW' + t, (p) => T.fxWaves(p, t, '#9fe6ff'), [-0.25, 1.2, -1.1], 0.3, { flip: false, alpha: 0.9 }));
    if (k > 0.3) { const s2 = q(((f - B.hands) * 0.03) % 1, 2); out.push(FX('steamW' + s2, (p) => T.fxSteam(p, s2), [0.3, 1.45, -1.05], 0.2)); }
  }
  if (S.id === 'oven' && f >= B.piano) { const t = q(ramp(f, B.piano, B.piano + 18), 2); if (t < 1) for (const dx of [-0.9, 0.9]) out.push(FX('puff' + t, (p) => { p.g.translate(150, 320); p.g.scale(1.4, 1.4); T.fxPuff(p, t); }, [3.35 + dx * 0.9, 0.3, 0.9], 0.6)); }
  if (S.id === 'today' && f >= B.popcorn - 2) for (let i = 0; i < 14; i++) { // popcorn bursts out of the door toward camera
    const t = (f - B.popcorn + 2 + hash(i) * 2) / 30, a = hash(i + 5) * Math.PI * 2, r = 0.25 + hash(i + 9) * 0.5;
    let x = MWC[0] - 0.05 + Math.cos(a) * r * t * 1.4, y = MWC[1] + Math.sin(a) * r * t + 1.2 * t - 3.2 * t * t, z = MWC[2] + 0.1 + t * (0.9 + hash(i + 13) * 0.6);
    if (y < 0.95 && z < -1.95) y = 0.95;
    out.push(FX('kp' + (i % 5), (p) => T.fxPopcorn(p, i % 5 + 1), [x, y, z], 0.1 + hash(i + 1) * 0.04, { roll: q(t * 7 * (i % 2 ? 1 : -1), 1), order: 6 }));
  }
  return out;
};
