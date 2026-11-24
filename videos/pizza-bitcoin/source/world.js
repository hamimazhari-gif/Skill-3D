// All locations in one scene at different x offsets. Story: "Pizza Bitcoin" (Laszlo Hanyecz, 22 May 2010).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';
import {RECEIPT} from './timing';

export const LOC = {vault: 0, room: 40, stage: 80, field: 120, street: 160};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'spry' (new for this video; round no-sleep face, tuft hair, thin brows, slim limbs).
export const CHAR_DESIGN = 'spry';
const CAST = {
  laszlo: {outfit: 'tshirt', jacket: '#5a9a6a', print: '#f2d24a', print2: '#e8823a', lower: '#3f5f8a', tie: '#5a9a6a', hair: '#6a4a32', hairStyle: 'side', hat: 'none', glasses: true},
  kurir: {outfit: 'tshirt', jacket: '#3f6a8a', print: '#fff3df', print2: '#f2d24a', lower: '#2a3448', tie: '#3f6a8a', hair: '#2b2326', hat: 'cap', hatColor: '#f2d24a', hatColor2: '#d8a82a'},
  guard: {outfit: 'farmer', jacket: '#2f3a4a', lower: '#22283a', tie: '#2f3a4a', pocket: '#283244', hair: '#2b2326', hat: 'cap', hatColor: '#2f3a4a', hatColor2: '#c9a25a', mustache: 'thick'},
  p1: {hairStyle: 'hijab', hijab: '#4f8a6a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'hawaii', jacket: '#7fc4e8', lower: '#5a8ab0', tie: '#7fc4e8', pocket: '#7fc4e8'},
  p2: {outfit: 'tshirt', jacket: '#d8413a', print: '#fff3df', print2: '#4f7fa6', lower: '#5a4a3a', tie: '#d8413a', hair: '#2b2326', hairStyle: 'fringe', hat: 'none', mustache: 'thick'},
  p3: {outfit: 'tshirt', jacket: '#f2d24a', print: '#d8413a', print2: '#4f7fa6', lower: '#3f5f8a', tie: '#f2d24a', hair: '#3a2a26', hairStyle: 'tuft', hat: 'none'},
};

// Lighting: a dark museum with a spotlight, Laszlo's warm 2010 room, a dark studio for the charts (green when it rockets,
// red when it crashes), a sunny field for the comparisons.
const museum = {...LOOK_PRESETS.interiorCool, keyI: 1.6, hemiI: 0.75, grade: {sat: 1.0, contrast: 1.1, tint: '#c8d8ff', tintAmt: 0.06, vignette: 0.55}};
const roomL = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
export const LOOK = {
  vault: {...museum},
  room: {keys: [{at: 0, ...roomL}, {at: 'lapar', ...roomL, ...MOODS.sad}, {at: 'forum', ...roomL}, {at: 'bahagia', ...roomL, ...MOODS.joyful}, {at: 'tunggu', ...roomL, ...MOODS.tense},
    {at: 'cut9', ...roomL}, {at: 'cut11', ...roomL, ...MOODS.joyful}, {at: 'cut12', ...roomL}]},
  stage: {keys: [{at: 0, ...studio}, {at: 'triliun', ...studio, ...MOODS.joyful}, {at: 'cut11', ...studio}, {at: 'anjlok', ...studio, ...MOODS.danger}]},
  field: {...LOOK_PRESETS.day, near: 30, far: 140},
  street: {...LOOK_PRESETS.goldenHour, near: 30, far: 160},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

// Screen-level effects: flashes and shakes.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.triliun0, dur: 0.35, color: '#ffe9b0', strength: 0.4},
      {t: EVt.bahagia, dur: 0.3, color: '#ffe9b0', strength: 0.25},
      {t: EVt.triliun, dur: 0.4, color: '#fff4d6', strength: 0.45},
      {t: EVt.tunggu, dur: 0.3, color: '#ffffff', strength: 0.35},
      {t: EVt.seratus, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.anjlok, dur: 0.35, color: '#ff8a7a', strength: 0.35},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.meroket, dur: 0.5, amp: 0.02}, {t: EVt.triliun, dur: 0.35, amp: 0.02}, {t: EVt.tunggu, dur: 0.3, amp: 0.015}, {t: EVt.anjlok, dur: 0.4, amp: 0.025}],
  };
}

// a gold Bitcoin coin texture (B with two strokes)
let _btc;
function btcTex() {
  if (_btc) return _btc;
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = '#f2a93a'; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill();
  x.strokeStyle = '#c8822a'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 108, 0, 7); x.stroke();
  x.fillStyle = '#fff8e8'; x.font = '900 150px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('B', 132, 136);
  x.fillRect(104, 40, 12, 30); x.fillRect(134, 40, 12, 30); x.fillRect(104, 196, 12, 30); x.fillRect(134, 196, 12, 30);
  _btc = texFrom(c); return _btc;
}
const btcCoin = (r = 0.06) => P.coin(r, {tex: btcTex(), color: '#c8822a'});

export function buildWorld(lang, T, EVt, L) {
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar('hero', {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const speak = (c, si, exprs = []) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).filter(([a, b]) => b - a > 0.05);
    c.act([...segs.map(([a, b]) => ({t: a, action: 'talk', dur: b - a})), ...exprs.map(([f, e, p]) => ({t: at0(f), expr: e, ...(p ? {pose: p} : {})}))]);
  };
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const walkPath = (c, keys, action = 'walk') => {
    const rest = c.state.yaw0;
    for (let i = 0; i < keys.length - 1; i++) { const [a, x0, z0] = keys[i], [b, x1, z1] = keys[i + 1]; if (b - a > 0.05 && Math.hypot(x1 - x0, z1 - z0) > 0.2) c.act([{t: a, action, dur: b - a}]); }
    updaters.push((t) => {
      let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
      const [a, x0, z0] = keys[i], [b, x1, z1] = keys[Math.min(i + 1, keys.length - 1)];
      const u = b > a ? Math.max(0, Math.min(1, (t - a) / (b - a))) : 1;
      c.group.position.x = x0 + (x1 - x0) * u; c.group.position.z = z0 + (z1 - z0) * u;
      const moving = b - a > 0.05 && t > a && t < b && Math.hypot(x1 - x0, z1 - z0) > 0.2;
      const dir = Math.max(-1.1, Math.min(1.1, Math.atan2(x1 - x0, Math.abs(z1 - z0) + 0.001)));
      const ramp = moving ? Math.min(1, (t - a) / 0.2, (b - t) / 0.2) : 0;
      c.state.yaw0 = rest + (dir - rest) * ramp;
    });
  };
  const popSign = (g, s, x, y, z, t0, t1 = 1e9, vis = () => true) => { at(s, x, y, z); g.add(s); updaters.push((t) => { s.visible = vis(t) && t > t0 && t < t1; s.scale.setScalar(pop(t, t0, 0.35)); s.position.y = y + Math.sin(t * 2.4 + x) * 0.02; }); return s; };
  const showWhen = (obj, f) => updaters.push((t) => { obj.visible = f(t); });
  const lamp = (g, x, z, ry = 0) => { const l = P.streetLamp(); at(l, x, 0, z, ry); g.add(l); return l; };
  const parisRow = (g, xs, z, seed) => xs.forEach((x, i) => { const tr = P.terrace(3.2, {color: ['#e8dcc0', '#ded0b0', '#efe3c8', '#d9c9a6'][(i + seed) % 4], roof: '#5a6a7a', trim: '#fbf6ea', shutter: '#4f6a7a', door: '#3a4a5a', seed: seed + i}).group; at(tr, x, 0, z); g.add(tr); });


  // ---------- the museum: the most expensive pizza in the world (1) ----------
  {
    const g = addLoc('vault');
    under(g, '#14161c');
    g.add(P.room(8, 4, 7, {wall: '#2c3444', floor: '#4a4450', wain: '#c9a25a', floorPaint: {planks: 0}}));
    const ms = sign(L.museum, 2.0, 0.42, {bg: '#1e2430', fg: '#e8c04a', frame: '#c9a25a'}); at(ms, 0, 3.1, -5.8); g.add(ms);
    const ped = P.glassDome(0.45); at(ped, 0, 0, -3.0); g.add(ped);
    const pz = P.pizza(0.32); at(pz, 0, 1.06, -3.0); g.add(pz);
    updaters.push((t) => { pz.rotation.y = t * 0.25; });
    const spot = P.glowSprite('#fff2c8', 1.4); at(spot, 0, 1.6, -3.0); g.add(spot);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.0, 24, 1, true), new THREE.MeshBasicMaterial({color: '#fff6d8', transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide}));
    beam.position.set(0, 2.55, -3.0); g.add(beam);
    const fl = FX.fireLight([0, 2.4, -2.6], {intensity: 2.2, dist: 5}); g.add(fl.obj); updaters.push((t) => fl.update(t));
    for (const x of [-0.9, 0.9]) { const post = cyl(0.04, 0.06, 0.9, '#c9a25a', {hull: 0.008}); at(post, x, 0, -2.2); g.add(post); }
    const rope = cyl(0.02, 0.02, 1.8, '#a82a36', {hull: 0.005, center: true}); at(rope, 0, 0.8, -2.2, 0, 0, Math.PI / 2); g.add(rope);
    popSign(g, sign(L.cheese, 0.55, 0.2, {bg: '#f6d46a', fg: '#351f22', frame: '#8a6a1a', depth: 0.02}), -0.62, 1.45, -2.95, E('keju') - 0.05, cut(2));
    popSign(g, sign(L.sausage, 0.55, 0.2, {bg: '#a8322a', fg: '#fff3df', frame: '#6a1a1a', depth: 0.02}), 0.62, 1.45, -2.95, E('sosis') - 0.05, cut(2));
    const guard = ch('guard', {seed: 1}, g, -1.6, -3.4, 0.35);
    guard.act([{t: 0, pose: 'cross', expr: 'smug'}, {t: E('triliun0') + 0.1, pose: 'cross', expr: 'shocked'}, {t: E('sosis') + 0.1, pose: 'idle', expr: 'cheesy'}]);
    guard.act([{t: E('triliun0'), action: 'jump', dur: 0.5}]);
    fx(g, FX.glints([0, 1.3, -2.8], E('termahal'), {n: 24}));
  }

  // ---------- Laszlo's room, 2010 (2-5, 8-10, the party 11, the question 12) ----------
  {
    const g = addLoc('room');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#c9d6c0', floor: '#9a7a5a', wain: '#6a8a9a'}));
    const desk = P.desk({color: '#b08454'}); at(desk, -1.3, 0, -3.7); g.add(desk);
    const crt = P.crtMonitor(L.post); at(crt, -1.55, 0.77, -3.75); g.add(crt);
    const kb = box(0.45, 0.03, 0.16, '#d8d0bc', {hull: 0.006}); at(kb, -1.55, 0.77, -3.3); g.add(kb);
    const coins = new THREE.Group(); const cr = (s) => { let v = s; return () => (v = (v * 9301 + 49297) % 233280) / 233280; }; const rr = cr(7);
    for (let i = 0; i < 26; i++) { const c = btcCoin(0.05); at(c, -0.75 + (rr() - 0.5) * 0.35, 0.78 + Math.floor(i / 6) * 0.012, -3.6 + (rr() - 0.5) * 0.3, rr() * 6, (rr() - 0.5) * 0.3); coins.add(c); }
    g.add(coins);
    const doorF = box(1.1, 2.2, 0.06, '#3a2a26'); at(doorF, 2.2, 0, -4.92); g.add(doorF);
    const door = box(1.0, 2.1, 0.06, toon('#7a4a32', {paint: {planks: 3, seed: 8}})); const dp = new THREE.Group(); at(dp, 1.7, 0, -4.86); at(door, 0.5, 0, 0); dp.add(door); g.add(dp);
    updaters.push((t) => { const o1 = smooth((t - E('pemuda') + 0.2) / 0.5) * (1 - smooth((t - E('bahagia')) / 0.5)), o2 = smooth((t - cut(9) + 0.3) / 0.4) * (1 - smooth((t - cut(10)) / 0.4)); dp.rotation.y = 1.3 * Math.max(o1, o2); });
    const cal = sign(L.year, 0.5, 0.36, {bg: '#fbf6ea', fg: '#d8312a', frame: '#d8312a'}); popSign(g, cal, 0.2, 2.2, -4.85, E('tahun') - 0.1, 1e9, (t) => !inShots(t, 11));
    const tbl = box(0.9, 0.42, 0.6, toon('#8a5a3a', {paint: {planks: 3, seed: 15}})); at(tbl, 0.45, 0, -2.6); g.add(tbl);
    const laszlo = ch('laszlo', {seed: 1}, g, -0.5, -3.1, 0.1);
    popSign(g, sign(L.hungry, 0.9, 0.28, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22', depth: 0.03}), -0.15, 1.15, -2.6, E('lapar') - 0.05, E('bitcoin0') + 0.6, (t) => inShots(t, 2));
    popSign(g, sign(L.cheap, 1.1, 0.3, {bg: '#f2a93a', fg: '#351f22', frame: '#8a5a1a'}), -0.75, 1.35, -3.5, E('harganya') - 0.1, cut(3), (t) => inShots(t, 2));
    // the delivery: two boxes arrive and open on the little table
    const kurir = ch('kurir', {seed: 2}, g, 2.2, -4.6, -0.3);
    showWhen(kurir.group, (t) => (t > E('pemuda') - 0.3 && t < E('bahagia') + 0.6) || inShots(t, 9));
    walkPath(kurir, [[E('pemuda') - 0.2, 2.2, -4.6], [E('datang') - 0.4, 1.25, -3.0], [E('datang') + 0.6, 1.25, -3.0], [E('bahagia') + 0.5, 2.2, -4.6], [cut(9) - 0.02, 2.2, -4.6], [cut(9), 1.3, -3.2]]);
    const carried = [0, 1].map((i) => { const b = P.pizzaBox(); held(kurir, b.group, {hand: 1, y: 0.02 + i * 0.06, z: 0.15}); showWhen(b.group, (t) => t < E('datang') - 0.1); return b; });
    const boxes = [0, 1].map((i) => { const b = P.pizzaBox(); at(b.group, 0.25 + i * 0.45, 0.42, -2.6, (i - 0.5) * 0.2); g.add(b.group); updaters.push((t) => { b.group.visible = t > E('datang') - 0.1 && t < cut(6); b.open(smooth((t - E('makan') + 0.1 - i * 0.2) / 0.4)); }); return b; });
    const third = P.pizzaBox(); held(kurir, third.group, {hand: 1, y: 0.02, z: 0.15}); showWhen(third.group, (t) => inShots(t, 9));
    const slice = P.pizzaSlice(0.16); held(laszlo, slice, {y: 0.03, z: 0.1, rx: -0.4}); showWhen(slice, (t) => (t > E('makan') && t < cut(6)) || t >= cut(11));
    popSign(g, sign(L.deal, 1.5, 0.36, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), 0.2, 2.2, -3.0, E('empat') - 0.1, cut(5), (t) => inShots(t, 4));
    popSign(g, sign(L.yum, 1.0, 0.3, {bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'}), -0.5, 2.25, -3.0, E('worth') - 0.05, cut(6), (t) => inShots(t, 5));
    fx(g, FX.glints([0.45, 0.7, -2.6], E('makan'), {n: 20}), (t) => inShots(t, 4));
    // the plot twist: a tower of pizza boxes
    const stack = []; for (let i = 0; i < 14; i++) { const b = P.pizzaBox({color: i % 2 ? '#e8dcc0' : '#efe4cc'}); at(b.group, 0.75 + (i % 2) * 0.03, i * 0.065, -3.75, (i % 3 - 1) * 0.08); g.add(b.group); stack.push(b.group); }
    updaters.push((t) => stack.forEach((b, i) => { const t0 = E('ternyata') + i * ((E('berkali') - E('ternyata')) / 14); b.visible = t > t0 && t < cut(11); b.scale.setScalar(pop(t, t0, 0.25)); }));
    // more stacks fill the room
    const more = []; [[-2.6, -4.3], [-2.9, -2.2], [2.9, -3.3], [1.6, -2.1], [-1.9, -1.4], [2.6, -1.6], [-0.2, -4.5]].forEach(([x, z], j) => {
      const n = 6 + (j * 3) % 7; for (let i = 0; i < n; i++) { const b = P.pizzaBox({color: (i + j) % 2 ? '#e8dcc0' : '#efe4cc'}); at(b.group, x + (i % 2) * 0.03, i * 0.065, z, (i % 3 - 1) * 0.1 + j); g.add(b.group); more.push([b.group, j, i]); } });
    updaters.push((t) => more.forEach(([b, j, i]) => { const t0 = E('seratus') + j * 0.25 + i * 0.05; b.visible = t > t0 && t < cut(11); b.scale.setScalar(pop(t, t0, 0.25)); }));
    popSign(g, sign(L.wait, 1.3, 0.34, {bg: '#2b2b33', fg: '#f2d24a', frame: '#f2d24a'}), -0.5, 2.3, -3.0, E('tunggu') - 0.05, E('ternyata'), (t) => inShots(t, 8));
    popSign(g, sign(L.total, 1.3, 0.36, {bg: '#f2a93a', fg: '#351f22', frame: '#8a5a1a'}), 0.75, 2.45, -3.6, E('seratus') - 0.1, cut(9), (t) => inShots(t, 8));
    popSign(g, sign('"Yang penting kenyang."', 1.4, 0.34, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), -0.5, 2.25, -3.35, E('menyesal') - 0.05, cut(11), (t) => inShots(t, 10));
    laszlo.act([
      {t: cut(2), pose: 'idle', expr: 'tired'}, {t: E('lapar') + 0.1, pose: 'idle', expr: 'cry'}, {t: E('bitcoin0') + 0.1, pose: 'present', expr: 'proud'}, {t: E('harganya') + 0.1, pose: 'shrug', expr: 'confused'},
      {t: cut(3), pose: 'tap', expr: 'thinking'}, {t: E('siapa') - 0.1, pose: 'tap', expr: 'scheming'}, {t: E('bayar') + 0.1, pose: 'tap', expr: 'excited'},
      {t: E('pemuda') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('datang') + 0.1, pose: 'cheer', expr: 'excited'}, {t: E('makan') + 0.05, pose: 'eat', expr: 'happy'}, {t: E('empat') + 0.1, pose: 'eat', expr: 'cheesy'},
      {t: cut(8), pose: 'idle', expr: 'neutral'}, {t: E('tunggu') + 0.05, pose: 'stop', expr: 'surprised'}, {t: E('ternyata') + 0.1, pose: 'idle', expr: 'nervous'}, {t: E('seratus') + 0.1, pose: 'shrug', expr: 'cheesy'},
      {t: cut(9), pose: 'idle', expr: 'cheesy'}, {t: E('cicilan') + 0.1, pose: 'shrug', expr: 'nervous'},
      {t: cut(10), pose: 'idle', expr: 'smug'}, {t: E('menyesal') + 0.05, pose: 'hips', expr: 'proud'},
      {t: cut(11), pose: 'cheer', expr: 'excited'}, {t: cut(12), pose: 'eat', expr: 'happy'}, {t: E('santai') + 0.1, pose: 'eat', expr: 'cheesy'}, {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy'}]);
    laszlo.act([{t: E('tunggu'), action: 'tremble', dur: 0.6}, {t: E('geleng'), action: 'shake', dur: 0.8}]);
    speak(laszlo, 11, [[0, 'happy', 'eat'], [0.6, 'cheesy', 'eat']]);
    speak(laszlo, 12, [[0, 'excited', 'pointUp']]);
    kurir.act([{t: E('pemuda') - 0.2, pose: 'carry', expr: 'neutral'}, {t: E('datang') - 0.1, pose: 'give', expr: 'cheesy'}, {t: E('datang') + 0.6, pose: 'wave', expr: 'happy'},
      {t: cut(9), pose: 'give', expr: 'confused'}]);
    speak(kurir, 20, [[0, 'confused', 'give'], [0.5, 'grimace', 'give']]);
    // the party (11)
    const party = [['p1', -1.7, -2.7, 0.3], ['p2', 1.45, -2.9, -0.3], ['p3', 0.65, -2.35, -0.1]].map(([k, x, z, y], i) => {
      const c = ch(k, {seed: 30 + i, scale: k === 'p3' ? 0.62 : 1}, g, x, z, y); showWhen(c.group, (t) => inShots(t, 11) && t < E('ingat'));
      const s = P.pizzaSlice(0.14); held(c, s, {y: 0.03, z: 0.1, rx: -0.4});
      c.act([{t: cut(11), pose: 'cheer', expr: ['excited', 'toothy', 'laugh'][i]}, {t: E('mei') + 0.1, pose: 'eat', expr: 'happy'}, {t: E('pizzaDay') + 0.1, pose: 'cheer', expr: 'excited'}]);
      return c; });
    popSign(g, sign(L.day, 2.2, 0.46, {bg: '#f2a93a', fg: '#351f22', frame: '#8a5a1a', sub: L.may}), 0, 2.45, -4.6, E('sejak') - 0.1, E('ingat'), (t) => inShots(t, 11));
    fx(g, FX.confetti([0, 2.8, -2.8], E('pizzaDay')), (t) => inShots(t, 11));
    popSign(g, sign(L.question, 1.6, 0.4, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}), -0.5, 2.55, -2.8, E('nangis') - 0.2, 1e9, (t) => inShots(t, 12));
    popSign(g, sign(L.comment, 1.5, 0.36, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}), -0.5, 2.12, -2.75, E('komentar') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.confetti([-0.5, 2.8, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the studio: the price rockets (6), the world learns (10), up and down (11) ----------
  {
    const g = addLoc('stage');
    under(g, '#14161c');
    const fl0 = box(30, 0.04, 14, toon('#262a36', {paint: {seed: 221}}), {edges: false}); at(fl0, 0, -0.03, -3); g.add(fl0);
    const wall = box(30, 9, 0.2, toon('#1e2840', {paint: {seed: 222}}), {edges: false}); at(wall, 0, 0, -6.2); g.add(wall);
    const H = Array.from({length: 17}, (_, i) => 0.04 + 3.0 * Math.pow(i / 16, 4));
    const chart = P.barChart(H, {w: 4.2}); at(chart.group, 0.4, 0, -4.4); g.add(chart.group);
    updaters.push((t) => chart.show(smooth((t - E('tahunDemi')) / (E('meroket') + 0.6 - E('tahunDemi')))));
    const rk = P.rocket(); g.add(rk);
    updaters.push((t) => { const u = Math.max(0, t - E('meroket')); rk.visible = inShots(t, 6) && t > E('meroket') - 0.1; rk.position.set(2.35 + u * 0.2, 3.2 + u * u * 1.4, -4.3); rk.rotation.z = -0.15; });
    fx(g, FX.smoke([2.35, 3.0, -4.3], E('meroket'), {n: 20, every: 0.08, life: 1.2, size: 0.35, grow: 2, rise: -0.4, drift: 0.1, color: '#f3ece0', opacity: 0.6}), (t) => inShots(t, 6));
    popSign(g, sign(L.years, 1.4, 0.34, {bg: '#1e2430', fg: '#e8e0c8', frame: '#e8e0c8'}), -1.3, 3.3, -5.9, E('tahunDemi') - 0.1, cut(7), (t) => inShots(t, 6));
    const l1 = ch('laszlo', {seed: 3}, g, -1.15, -2.6, 0.45);
    showWhen(l1.group, (t) => inShots(t, 6));
    l1.act([{t: cut(6), pose: 'idle', expr: 'neutral'}, {t: E('meroket') + 0.1, pose: 'headHold', expr: 'surprised'}, {t: E('triliun') + 0.05, pose: 'headHold', expr: 'scream'}]);
    l1.act([{t: E('triliun'), action: 'jump', dur: 0.5}]);
    // the globe: the world learns that bitcoin can pay for things
    const GX = -9;
    const gl = P.globe(1.1); at(gl.group, GX, 1.9, -4.3); g.add(gl.group);
    const gfl = FX.fireLight([GX, 2.6, -2.4], {intensity: 2.0, dist: 6}); g.add(gfl.obj); updaters.push((t) => gfl.update(t)); updaters.push((t) => { gl.group.rotation.y = t * 0.4; });
    const orb = P.pizza(0.2); g.add(orb); const oc = btcCoin(0.12); g.add(oc);
    updaters.push((t) => { const a = t * 1.6; orb.position.set(GX + Math.cos(a) * 1.6, 1.9 + Math.sin(a) * 0.35, -4.3 + Math.sin(a) * 1.0); orb.rotation.x = 1.2; oc.position.set(GX + Math.cos(a + Math.PI) * 1.6, 1.9 - Math.sin(a) * 0.35, -4.3 - Math.sin(a) * 1.0); oc.rotation.set(1.57, 0, a); });
    popSign(g, sign(L.world, 2.3, 0.4, {bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'}), GX, 3.55, -3.9, E('dunia') - 0.1, cut(11), (t) => inShots(t, 10));
    // up and down (11): a second chart that rises and crashes
    const CX = 9;
    const H2 = [0.4, 0.7, 0.6, 1.1, 1.6, 1.4, 2.1, 2.6, 2.4, 3.0, 1.6, 0.9, 0.5];
    const ch2 = P.barChart(H2, {w: 3.6, crashN: 3}); at(ch2.group, CX + 0.3, 0, -4.4); g.add(ch2.group);
    updaters.push((t) => ch2.show(smooth((t - E('ingat')) / (E('naik') + 0.5 - E('ingat'))) * 10 / 13 + smooth((t - E('anjlok') + 0.3) / 0.6) * 3 / 13));
    popSign(g, sign(L.up, 0.8, 0.3, {bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'}), CX - 0.6, 3.5, -4.2, E('naik') - 0.05, cut(12), (t) => inShots(t, 11));
    popSign(g, sign(L.down, 1.0, 0.3, {bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'}), CX + 1.3, 2.2, -4.0, E('anjlok') - 0.05, cut(12), (t) => inShots(t, 11));
    popSign(g, sign(L.risk, 2.0, 0.44, {bg: '#f2d24a', fg: '#351f22', frame: '#351f22'}), CX, 2.65, -3.0, E('jangan') - 0.1, cut(12), (t) => inShots(t, 11));
    const l2 = ch('laszlo', {seed: 4}, g, CX - 1.15, -2.5, 0.4);
    showWhen(l2.group, (t) => inShots(t, 11) && t > E('ingat') - 0.3);
    l2.act([{t: E('ingat') - 0.3, pose: 'pointUp', expr: 'determined'}, {t: E('naik') + 0.1, pose: 'cheer', expr: 'excited'}, {t: E('anjlok') + 0.05, pose: 'headHold', expr: 'shocked'},
      {t: E('jangan') + 0.05, pose: 'pointUp', expr: 'annoyed'}]);
    l2.act([{t: E('anjlok'), action: 'jump', dur: 0.5}, {t: E('jangan') + 0.1, action: 'shake', dur: 0.9}]);
  }

  // ---------- the street: a courier knocks, a receipt as long as the highway (1) ----------
  {
    const g = addLoc('street');
    under(g, '#8fae6a', 300);
    const road = box(5, 0.02, 240, toon('#4a4a52', {paint: {seed: 241, stains: 30}}), {edges: false}); at(road, 3.6, -0.02, -110); g.add(road);
    for (let i = 0; i < 40; i++) { const m = box(0.15, 0.025, 1.6, '#f3efe6', {hull: 0, edges: false}); at(m, 3.6, -0.01, -2 - i * 6); g.add(m); }
    const walk = box(2.4, 0.06, 240, toon('#c9c2b0', {paint: {seed: 242}}), {edges: false}); at(walk, 0.0, 0, -110); g.add(walk);
    const house = P.house(4.5, 3.0, 4, {color: '#e8c35a', roof: '#b5543c', windows: 2, doorX: -0.6, seed: 4}); at(house, -2.6, 0, -3.2); g.add(house);
    for (let i = 0; i < 10; i++) { const tr = P.tree({seed: 50 + i, h: 2.4}); at(tr, -1.6 - (i % 2) * 1.5, 0, -9 - i * 7); g.add(tr); const tr2 = P.tree({seed: 70 + i, h: 2.6}); at(tr2, 7.4 + (i % 2) * 1.2, 0, -6 - i * 7); g.add(tr2); }
    const kurir = ch('kurir', {seed: 9}, g, -2.0, -2.6, -0.55);
    const pb = P.pizzaBox(); held(kurir, pb.group, {hand: 0, y: 0.02, z: 0.15}); 
    const knocks = [0.55, 0.8, 1.05, 1.9, 2.15];
    kurir.act([{t: 0, pose: 'idle', expr: 'neutral'}, ...knocks.map((t0) => ({t: t0, pose: 'tap'})), ...knocks.map((t0) => ({t: t0 + 0.12, pose: 'hold'})),
      {t: E('harganya1'), pose: 'idle', expr: 'surprised'}, {t: E('triliun0') + 0.05, pose: 'headHold', expr: 'shocked'}]);
    kurir.act([{t: E('triliun0'), action: 'jump', dur: 0.5}]);
    // the receipt: a paper strip that unrolls down the road, with the amount printed again and again
    const c = canvas(256, 1024), x = c.getContext('2d'); x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, 256, 1024);
    x.fillStyle = '#351f22'; x.textAlign = 'center'; x.font = '800 22px "JetBrains Mono", monospace';
    for (let i = 0; i < 16; i++) { x.fillText(i % 4 === 0 ? 'PIZZA x2' : i % 4 === 2 ? RECEIPT : '- - - - - - - - -', 128, 40 + i * 62); }
    const tex = texFrom(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 60);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 220), new THREE.MeshBasicMaterial({map: tex})); strip.rotation.x = -Math.PI / 2;
    const stripG = new THREE.Group(); stripG.add(strip); strip.position.z = -110; at(stripG, 3.6, 0.03, 0.6); g.add(stripG);
    const roll = cyl(0.22, 0.22, 1.4, '#fbfbf6', {seg: 20, center: true}); roll.rotation.z = Math.PI / 2; g.add(roll);
    updaters.push((t) => { const u = smooth((t - E('harganya1')) / 1.6); stripG.scale.z = Math.max(0.001, u); stripG.visible = t > E('harganya1') - 0.05; at(roll, 3.6, 0.22, 0.6 - 220 * u, 0, 0, Math.PI / 2); roll.visible = stripG.visible && u < 0.98; });
    popSign(g, sign(RECEIPT, 2.6, 0.46, {bg: '#fbfbf6', fg: '#d8312a', frame: '#351f22', font: '"JetBrains Mono", monospace'}), 2.5, 2.1, -2.2, E('triliun0') - 0.1);
  }

  // ---------- the field: thousands of houses, jets, gorengan to the clouds (7) ----------
  {
    const g = addLoc('field');
    under(g, '#8fae6a', 300);
    const grass = box(80, 0.03, 80, toon('#8fae6a', {paint: {seed: 231, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -20); g.add(grass);
    const houses = []; let k = 0;
    for (let row = 0; row < 4; row++) for (let i = 0; i < 4; i++) { const h = P.house(1.5, 1.3, 1.5, {color: ['#e8c35a', '#e0809a', '#7fc4e8', '#f3efe6'][(row + i) % 4], roof: ['#b5543c', '#4f6a7a', '#7a4a32'][(row * 2 + i) % 3], windows: 1, seed: k}); at(h, -8.0 + i * 1.8 + (row % 2) * 0.9, 0, -4 - row * 2.6); g.add(h); houses.push([h, k++]); }
    updaters.push((t) => houses.forEach(([h, i]) => { const t0 = E('rumah') - 0.3 + i * 0.05; h.visible = t > t0; h.scale.setScalar(pop(t, t0, 0.3)); }));
    const jets = [0, 1, 2].map((i) => { const p = P.plane(); p.scale.setScalar(0.32); at(p, 2.7 + i * 1.2, 0, -4.5 - i * 2.8, -0.5); g.add(p); return p; });
    updaters.push((t) => jets.forEach((p, i) => { const t0 = E('jet') - 0.2 + i * 0.15; p.visible = t > t0; p.scale.setScalar(0.32 * pop(t, t0, 0.3)); }));
    popSign(g, sign(L.houses, 1.6, 0.36, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), -3.6, 2.6, -4.5, E('rumah') - 0.1, cut(8));
    popSign(g, sign(L.jets, 1.5, 0.36, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), 3.6, 2.6, -5.0, E('jet') - 0.1, cut(8));
    // the gorengan tower, up into the clouds
    const tower = new THREE.Group(); at(tower, 0, 0, -4.8); g.add(tower);
    const pieces = []; const rr = (() => { let v = 5; return () => (v = (v * 9301 + 49297) % 233280) / 233280; })();
    for (let i = 0; i < 240; i++) { const p = P.gorengan(i % 3); at(p, (rr() - 0.5) * 0.12, i * 0.055, (rr() - 0.5) * 0.12, rr() * 6, (rr() - 0.5) * 0.3); tower.add(p); pieces.push(p); }
    updaters.push((t) => { const n = Math.floor(240 * smooth((t - E('gorengan') + 0.2) / (E('awan') + 0.8 - E('gorengan')))); pieces.forEach((p, i) => { p.visible = i < n; }); });
    popSign(g, sign(L.gor, 1.3, 0.34, {bg: '#e8a83a', fg: '#351f22', frame: '#8a5a1a'}), 0, 1.0, -3.9, E('gorengan') - 0.1, cut(8));
    [[0, 12.8, -5.2, 1.6], [-4, 12, -7, 1.3], [4.5, 11.5, -8, 1.4], [-2, 13.5, -9, 1.2]].forEach(([x, y, z, s], i) => { const c = P.cloud(s, 7 + i); at(c, x, y, z); g.add(c); });
    fx(g, FX.glints([0, 12.6, -4.6], E('awan') + 0.4, {n: 26}));
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
