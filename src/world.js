// All locations in one scene at different x offsets. Story: "Kalau emak-emak jadi presiden" (comedy).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {palace: 0, cabinet: 40, market: 80, home: 120};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'cozy' (new for this video; round no-sleep face, fringe hair, thick brows, longer torso, short legs).
export const CHAR_DESIGN = 'cozy';
const suit = (jacket, lapel, lower, tie, o = {}) => ({outfit: 'suit', jacket, lapel, lower, tie, pocket: jacket, ...o});
const EMAK = {hairStyle: 'hijab', hijab: '#9a2a3a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26'}; // hijab look (a minister, a shopper)
const DASTER = {hairStyle: 'bun', hair: '#2b2326', hat: 'none', outfit: 'hawaii', jacket: '#e0809a', lower: '#d0708a', tie: '#e0809a', pocket: '#e0809a'}; // emak: daster + konde (storyboard)
const CAST = {
  emak: {...DASTER},
  emakHome: {...DASTER},
  m0: suit('#3f4f6a', '#2c3a52', '#2a3448', '#d8413a', {hair: '#2b2326', hat: 'peci', hatColor: '#1f1d24'}),
  m1: {outfit: 'batik', jacket: '#4a5a8a', print: '#e8e0c8', print2: '#24304a', lower: '#2a2a33', tie: '#4a5a8a', pocket: '#4a5a8a', hair: '#2b2326', hat: 'peci', hatColor: '#1f1d24'},
  m2: suit('#6a6a72', '#4a4a52', '#3a3a42', '#3f8a5a', {hair: '#3a2a26', hairStyle: 'side', hat: 'none', glasses: true}),
  m3: {outfit: 'batik', jacket: '#7a3a3a', print: '#f2d24a', print2: '#3a1a1a', lower: '#2a2a33', tie: '#7a3a3a', pocket: '#7a3a3a', hair: '#d8d0c8', hairStyle: 'bald', hat: 'none', mustache: 'thick'},
  m4: {...EMAK, hijab: '#3f6a8a', outfit: 'suit', jacket: '#3f6a8a', lapel: '#2c4c66', lower: '#2a3448', tie: '#fbf6ea', pocket: '#3f6a8a'},
  bambang: suit('#8a8a90', '#6a6a72', '#4a4a52', '#e8c35a', {hair: '#2b2326', hat: 'peci', mustache: 'thick'}),
  abang: {outfit: 'tshirt', jacket: '#e8823a', print: '#fff3df', print2: '#d8413a', lower: '#4a4a52', tie: '#e8823a', hair: '#2b2326', hat: 'cap', hatColor: '#3f6a8a', hatColor2: '#2c4c66', towel: '#fbf6ea'},
  tetangga: {outfit: 'farmer', jacket: '#7fa35a', lower: '#4a4a52', tie: '#7fa35a', pocket: '#6f934a', hair: '#2b2326', hairStyle: 'tuft', hat: 'none', towel: '#f2d24a'},
  shopper: {...EMAK, hijab: '#4f8a6a', outfit: 'hawaii', jacket: '#7fc4e8', lower: '#5a8ab0', tie: '#7fc4e8', pocket: '#7fc4e8'},
  bapak: {outfit: 'tshirt', jacket: '#4f7fa6', print: '#f2d24a', print2: '#d8413a', lower: '#5a4a3a', tie: '#4f7fa6', hair: '#2b2326', hairStyle: 'fringe', hat: 'none', mustache: 'thick'},
  kid: {outfit: 'tshirt', jacket: '#d8413a', print: '#fff3df', print2: '#4f7fa6', lower: '#3f5f8a', tie: '#d8413a', hair: '#3a2a26', hairStyle: 'tuft', hat: 'none'},
};

// Lighting: a warm grand hall for the inauguration, a cool meeting room (tense when she scolds, red when Bambang is late),
// a bright market, a warm home that turns joyful when she is "president at home".
const hall = {...LOOK_PRESETS.interiorWarm, keyI: 2.5, hemiI: 1.35};
const meet = {...LOOK_PRESETS.interiorCool, keyI: 2.5, hemiI: 1.4};
const homeL = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
export const LOOK = {
  palace: {keys: [{at: 0, ...hall}, {at: 'total', ...hall, ...MOODS.joyful}, {at: 'cut2', ...hall}, {at: 'dimatikan', ...hall, keyI: 1.1, hemiI: 0.7}, {at: 'cut9', ...hall}]},
  cabinet: {keys: [{at: 0, ...meet}, {at: 'muter', ...meet, ...MOODS.tense}, {at: 'cut3', ...meet}, {at: 'bambang', ...meet, ...MOODS.danger}, {at: 'tegak', ...meet}]},
  market: {keys: [{at: 0, ...LOOK_PRESETS.day}, {at: 'sebelah', ...LOOK_PRESETS.day, ...MOODS.joyful}]},
  home: {keys: [{at: 0, ...homeL}, {at: 'rumah', ...homeL, ...MOODS.joyful}]},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

// Screen-level effects: flashes and shakes.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.total, dur: 0.35, color: '#fff4d6', strength: 0.4},
      {t: EVt.enggak, dur: 0.3, color: '#ffc0b0', strength: 0.3},
      {t: EVt.stabil, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.uang, dur: 0.3, color: '#ffe9b0', strength: 0.35},
      {t: EVt.rumah, dur: 0.35, color: '#fff4d6', strength: 0.4},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.enggak, dur: 0.3, amp: 0.015}, {t: EVt.sebelah, dur: 0.3, amp: 0.012}, {t: EVt.bambang, dur: 0.4, amp: 0.025}, {t: EVt.mulut, dur: 0.3, amp: 0.015}],
  };
}

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

  const seat = (c, y0, f) => updaters.push((t) => { c.group.position.y = f ? f(t) : y0; }); // seated behind a table: body lowered

  // ---------- the palace: inauguration (1), the budget (7), new policies (8) ----------
  {
    const g = addLoc('palace');
    under(g, '#2a2228');
    g.add(P.room(12, 4, 7, {wall: '#efe3c8', floor: '#9a3a36', wain: '#c9a25a', floorPaint: {planks: 0}}));
    for (const x of [-4.6, -1.6, 1.6]) { const col = box(0.45, 4, 0.45, toon('#f6efe0', {paint: {seed: 5}})); at(col, x * 1.25, 0, -5.6); g.add(col); }
    const pod = P.podium(L.podium); at(pod, 0, 0, -2.9); g.add(pod);
    const flags = [-1.35, 1.35].map((x, i) => { const f = P.flag(2.7, {phase: i}); at(f.group, x, 0, -3.5); g.add(f.group); updaters.push((t) => f.update(t)); return f; });
    popSign(g, sign(L.banner, 2.6, 0.62, {bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'}), 0, 3.15, -5.7, E('presiden0') - 0.1, cut(2), (t) => inShots(t, 1));
    popSign(g, sign(L.change, 1.7, 0.42, {bg: '#f2d24a', fg: '#351f22', frame: '#8a6a1a'}), 0, 2.55, -3.0, E('berubah') - 0.05, cut(2), (t) => inShots(t, 1));
    fx(g, FX.confetti([0, 3.0, -2.8], E('total')), (t) => inShots(t, 1));
    const emak = ch('emak', {seed: 1}, g, -1.6, -3.0, 0.6);
    showWhen(emak.group, (t) => inShots(t, 1));
    walkPath(emak, [[0.15, -1.6, -3.0], [1.25, -0.25, -3.45], [1.4, 0, -3.45]]);
    const lad = P.ladle(); held(emak, lad, {y: 0.02, z: 0.08, rz: 0.4});
    const taps = [1.6, 1.95, 2.3];
    emak.act([{t: 0, pose: 'hold', expr: 'determined'}, ...taps.map((t0) => ({t: t0, pose: 'tap', expr: 'smug'})), ...taps.map((t0) => ({t: t0 + 0.17, pose: 'hold', expr: 'smug'})),
      {t: E('presiden0') + 0.1, pose: 'hips', expr: 'proud'}, {t: E('berubah') + 0.05, pose: 'pointUp', expr: 'determined'}, {t: E('total') + 0.05, pose: 'cheer', expr: 'cheesy'}]);
    const fans = [['m0', -2.3, -2.9, 0.35], ['m2', 2.3, -2.9, -0.35]].map(([k, x, z, y]) => { const c = ch(k, {seed: 30 + x}, g, x, z, y); showWhen(c.group, (t) => inShots(t, 1));
      c.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('presiden0'), pose: 'presentBoth', expr: 'surprised'}, {t: E('total'), pose: 'cheer', expr: 'excited'}]); return c; });
    // the office corner: desk, cartoon budget book, biscuit tin of money, ceiling lamps, folded bags
    const ox = 4.7;
    const desk = P.desk({color: '#7a4a32'}); at(desk, ox, 0, -3.2); g.add(desk);
    const book = P.cartoonBook(L.book); at(book, ox - 0.45, 0.86, -3.05, 0.15, -0.35); g.add(book);
    const calc = P.calculator(); at(calc, ox + 0.05, 0.77, -2.95, -0.2); g.add(calc);
    const tin = P.biscuitTin({label: L.tin}); at(tin.group, ox + 0.35, 0.77, -3.1); g.add(tin.group);
    updaters.push((t) => { tin.group.visible = t > E('kaleng') - 0.1; tin.group.scale.setScalar(pop(t, E('kaleng') - 0.1, 0.35)); tin.open(smooth((t - E('uang') + 0.25) / 0.4)); });
    fx(g, FX.glints([ox + 0.35, 1.05, -3.0], E('uang'), {n: 22}), (t) => inShots(t, 7));
    const lamps = [-1, 0, 1].map((k) => {
      const l = new THREE.Group(); const cord = cyl(0.01, 0.01, 0.6, '#3a3a40', {hull: 0}); at(cord, 0, -0.6, 0); l.add(cord);
      const sh = cyl(0.06, 0.2, 0.18, '#e8c35a', {hull: 0.008}); at(sh, 0, -0.78, 0); l.add(sh);
      const bulbM = new THREE.MeshBasicMaterial({color: '#fff3c8'}); const b = ball(0.07, bulbM, {hull: 0}); at(b, 0, -0.8, 0); l.add(b);
      const glow = P.glowSprite('#ffe2a0', 1.3); glow.position.y = -0.85; l.add(glow);
      at(l, ox + k * 1.0, 4.0, -2.9); g.add(l);
      updaters.push((t) => { const on = t < E('dimatikan') + 0.1 + (k + 1) * 0.12; glow.visible = on; bulbM.color.set(on ? '#fff3c8' : '#8a8478'); });
      return l; });
    popSign(g, sign('PENGUMUMAN RESMI', 1.9, 0.44, {bg: '#fbf6ea', fg: '#2f4f7a', frame: '#2f4f7a'}), ox, 3.15, -5.75, E('kebijakan') - 0.1, cut(9), (t) => inShots(t, 8));
    popSign(g, sign(L.rule1, 1.4, 0.32, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), ox - 0.85, 2.6, -5.7, E('lampu') - 0.05, cut(9), (t) => inShots(t, 8));
    popSign(g, sign(L.rule2, 1.4, 0.32, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), ox + 0.85, 2.6, -5.7, E('kantong') - 0.05, cut(9), (t) => inShots(t, 8));
    const bags = [0, 1, 2, 3, 4, 5].map((i) => { const b = P.foldedBag(['#f3efe6', '#e0626e', '#7fc4e8', '#f2d24a', '#7fa35a', '#f3efe6'][i]); g.add(b); return b; });
    updaters.push((t) => bags.forEach((b, i) => { const t0 = E('segitiga') + i * 0.18; b.visible = inShots(t, 8) && t > t0; b.scale.setScalar(pop(t, t0, 0.3)); at(b, ox - 0.55 + i * 0.2, 0.86, -2.92, 0.15 * (i % 2 ? 1 : -1)); }));
    const boss = ch('emak', {seed: 2}, g, ox, -3.9, 0);
    showWhen(boss.group, (t) => inShots(t, 7, 8));
    boss.act([{t: cut(7), pose: 'tap', expr: 'thinking'}, {t: E('anggaran') + 0.05, pose: 'present', expr: 'proud'}, {t: E('kartun') + 0.05, pose: 'present', expr: 'cheesy'}, {t: E('sisanya') - 0.05, pose: 'shrug', expr: 'smug'},
      {t: E('kaleng') + 0.05, pose: 'present', expr: 'scheming'}, {t: E('bukan') + 0.05, pose: 'stop', expr: 'smug'}, {t: E('uang') + 0.1, pose: 'presentBoth', expr: 'toothy'},
      {t: cut(8), pose: 'hips', expr: 'determined'}, {t: E('lampu') + 0.05, pose: 'pointUp', expr: 'annoyed'}, {t: E('dimatikan') + 0.3, pose: 'hips', expr: 'smug'},
      {t: E('kantong') + 0.05, pose: 'present', expr: 'proud'}, {t: E('siapa') + 0.05, pose: 'chin', expr: 'scheming'}]);
  }

  // ---------- the cabinet room: the 5-minute meeting (2), late Bambang (5), sitting up straight (6) ----------
  {
    const g = addLoc('cabinet');
    under(g, '#1e2228');
    g.add(P.room(10, 3.6, 7, {wall: '#e4e8ec', floor: '#6a5a4a', wain: '#4f6a7a'}));
    const table = box(5.4, 0.76, 1.1, toon('#7a4a32', {paint: {planks: 5, seed: 121}})); at(table, 0.6, 0, -3.4); g.add(table);
    for (let i = 0; i < 5; i++) { const n = sign(['', 'MENTERI', 'MENTERI', 'MENTERI', 'MENTERI'][i] || 'MENTERI', 0.42, 0.12, {bg: '#fbf6ea', fg: '#351f22', frame: '#351f22', depth: 0.03, border: false}); at(n, -1.4 + i, 0.8, -2.95, 0, -0.3); g.add(n); }
    const screen = P.muterScreen(L.screen); at(screen, -3.0, 1.0, -5.8); g.add(screen);
    const cs = sign(L.cabinet, 1.6, 0.36, {bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'}); at(cs, 1.3, 2.95, -5.8); g.add(cs);
    const clock = P.wallClock(0.3, {rim: '#2b2b33'}); at(clock.group, -1.0, 2.75, -5.85); g.add(clock.group); clock.set(9, 47);
    const door = box(1.0, 2.2, 0.08, toon('#7a4a32', {paint: {planks: 3, seed: 7}})); g.add(door);
    const doorPiv = new THREE.Group(); at(doorPiv, -4.7, 0, -5.8); doorPiv.add(door); at(door, 0.5, 0, 0); g.add(doorPiv);
    const doorFrame = box(1.15, 2.3, 0.05, '#2b2226'); at(doorFrame, -4.2, 0, -5.88); g.add(doorFrame);
    updaters.push((t) => { doorPiv.rotation.y = 1.4 * smooth((t - E('telat') + 0.3) / 0.6); });
    const chairs = [-1.4, -0.4, 0.6, 1.6, 2.6].map((x, i) => { const c = box(0.5, 1.2, 0.08, toon('#2f3a4a', {paint: {seed: 130 + i}})); at(c, x, 0, -4.4); g.add(c); return c; });
    const mins = [['m1', -0.4], ['m2', 0.6], ['m3', 1.6], ['m4', 2.6]].map(([k, x], i) => {
      const c = ch(k, {seed: 40 + i}, g, x, -4.05, -0.05 * i);
      seat(c, 0, (t) => (t < cut(5) ? -0.4 : t < E('tegak') - 0.1 ? -0.52 : -0.4 + 0.04 * Math.max(0, 1 - (t - E('tegak') + 0.1) / 0.3)));
      c.act([{t: 0, pose: 'idle', expr: ['tired', 'sleep', 'drowsy', 'tired'][i]}, {t: E('pakMenteri') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('enggak') + 0.05, pose: 'idle', expr: 'shocked'},
        {t: cut(5), pose: 'idle', expr: ['sleep', 'drowsy', 'tired', 'drowsy'][i]}, {t: E('bambang') + 0.05, pose: 'idle', expr: 'shocked'}, {t: E('jam') + 0.1, pose: 'idle', expr: 'grimace'},
        {t: E('tegak') - 0.1, pose: 'idle', expr: ['determined', 'nervous', 'determined', 'nervous'][i]}]);
      c.act([{t: E('enggak'), action: 'tremble', dur: 0.6}, {t: E('tegak') - 0.1, action: 'jump', dur: 0.4}]);
      return c; });
    const presenter = ch('m0', {seed: 50}, g, -1.9, -4.7, -0.5);
    const pointer = cyl(0.01, 0.01, 0.6, '#3a3a40', {hull: 0.004, center: true}); held(presenter, pointer, {y: 0.0, z: 0.05, rz: 1.2});
    showWhen(presenter.group, (t) => t < cut(5));
    presenter.act([{t: 0, pose: 'point', expr: 'cheesy'}, {t: E('pakMenteri') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('muter') + 0.1, pose: 'idle', expr: 'nervous'},
      {t: E('intinya') + 0.05, pose: 'shrug', expr: 'grimace'}, {t: E('enggak') + 0.05, pose: 'headHold', expr: 'scream'}]);
    presenter.act([{t: E('enggak'), action: 'jump', dur: 0.5}]);
    const emak = ch('emak', {seed: 3}, g, 3.9, -2.9, -0.55);
    emak.act([{t: 0, pose: 'cross', expr: 'annoyed'}, {t: E('lima') + 0.05, pose: 'pointUp', expr: 'determined'}, {t: cut(5), pose: 'cross', expr: 'thinking'},
      {t: E('telat') + 0.05, pose: 'hips', expr: 'annoyed'}, {t: E('seluruh') + 0.1, pose: 'cross', expr: 'smug'}]);
    speak(emak, 3, [[0, 'annoyed', 'point'], [0.55, 'irritated', 'hips']]);
    speak(emak, 4, [[0, 'angry', 'shrug']]);
    speak(emak, 5, [[0, 'furious', 'point'], [0.5, 'gritted', 'stop']]);
    speak(emak, 11, [[0, 'furious', 'point']]);
    speak(emak, 12, [[0, 'angry', 'hips']]);
    emak.act([{t: E('mau'), action: 'shake', dur: 0.6}]);
    const bam = ch('bambang', {seed: 60}, g, -4.2, -5.5, 0.4);
    showWhen(bam.group, (t) => t > E('telat') - 0.1 && t < cut(7));
    walkPath(bam, [[E('telat'), -4.2, -5.5], [E('bambang') - 0.2, -3.2, -4.6], [cut(6) + 0.1, -3.2, -4.6], [E('tegak') - 0.25, -1.4, -4.05]], 'walk');
    seat(bam, 0, (t) => -0.4 * smooth((t - E('tegak') + 0.25) / 0.2));
    bam.act([{t: E('telat'), pose: 'idle', expr: 'nervous'}, {t: E('bambang') + 0.05, pose: 'armsUp', expr: 'shocked'}, {t: E('jam') + 0.05, pose: 'beg', expr: 'grimace'},
      {t: cut(6), pose: 'idle', expr: 'nervous'}, {t: E('tegak') - 0.1, pose: 'idle', expr: 'determined'}]);
    bam.act([{t: E('bambang'), action: 'jump', dur: 0.5}, {t: E('jam'), action: 'tremble', dur: 0.8}]);
    popSign(g, sign('BAMBANG', 1.2, 0.46, {bg: '#fff3df', fg: '#b8232a', frame: '#351f22', sub: 'SUTRISNO WIJAYA'}), -3.2, 2.6, -4.4, E('bambang') - 0.05, cut(6), (t) => inShots(t, 5));
    fx(g, FX.glints([1.1, 1.5, -3.9], E('tegak'), {n: 24}), (t) => inShots(t, 6));
  }

  // ---------- the market: chilli prices (3), the bargain (4) ----------
  {
    const g = addLoc('market');
    under(g, '#c9b48a', 120);
    const ground = box(30, 0.02, 20, toon('#cbb894', {paint: {seed: 141, stains: 22}}), {edges: false}); at(ground, 0, -0.03, -4); g.add(ground);
    for (const [x, c] of [[-5.2, '#e8c35a'], [-1.8, '#d9c9a6'], [1.6, '#ead2a2'], [5.0, '#d8b88a']]) { const f = P.facade(3.4, 3.4, {color: c, windows: 2, doorX: 0.6, seed: Math.round(x * 3 + 20), trim: '#8a6a4a'}); at(f, x, 0, -7.2); g.add(f); }
    const chili = P.chiliStall({sub: 'CABAI / KG'}); at(chili.group, 0, 0, -3.2); g.add(chili.group);
    chili.board(L.price0); chili.board('Rp50.000'); chili.board('Rp30.000'); chili.board(L.price1);
    const tPrice = E('sebelah') + 0.45;
    updaters.push((t) => chili.setPrice(t < E('stabil') ? L.price0 : t < E('ditawar') ? 'Rp50.000' : t < tPrice ? 'Rp30.000' : L.price1));
    fx(g, FX.glints([-0.5, 1.2, -2.5], tPrice, {n: 20}), (t) => inShots(t, 4));
    const nb = box(1.6, 0.8, 0.9, toon('#6a8a5a', {paint: {planks: 4, seed: 151}})); at(nb, 2.6, 0, -3.6); g.add(nb);
    const veg = P.vegPile(); at(veg, 2.6, 0, -3.6); g.add(veg);
    const nroof = box(2.0, 0.08, 1.4, toon('#d8413a', {paint: {stripes: {n: 10, color: '#f3ece0'}}})); at(nroof, 2.6, 2.3, -3.4); g.add(nroof);
    for (const s of [-1, 1]) { const p = cyl(0.04, 0.04, 2.3, '#6a4a32', {hull: 0.01}); at(p, 2.6 + s * 0.9, 0, -2.9); g.add(p); }
    const ls = box(1.6, 0.8, 0.9, toon('#8a6a4a', {paint: {planks: 4, seed: 152}})); at(ls, -2.7, 0, -3.8); g.add(ls);
    const veg2 = P.vegPile(); at(veg2, -2.7, 0, -3.8); g.add(veg2);
    popSign(g, sign(L.neighbor + ' →', 1.0, 0.3, {bg: '#f2d24a', fg: '#351f22', frame: '#8a6a1a'}), 2.6, 2.7, -3.2, E('sebelah') - 0.1, cut(5), (t) => inShots(t, 4));
    const abang = ch('abang', {seed: 70}, g, 0.1, -4.05, -0.1);
    const tetangga = ch('tetangga', {seed: 71}, g, 2.6, -4.4, -0.3);
    const shopper = ch('shopper', {seed: 72}, g, -2.6, -2.7, 0.2);
    const emak = ch('emak', {seed: 4}, g, -0.95, -2.25, 0.45);
    const bag = P.shopBag('#e8c35a'); held(emak, bag, {hand: 0, y: -0.38, z: 0.08});
    emak.act([{t: cut(3), pose: 'idle', expr: 'thinking'}, {t: E('stabil') + 0.05, pose: 'hips', expr: 'smug'}, {t: E('ditawar') + 0.05, pose: 'point', expr: 'scheming'}]);
    speak(emak, 8, [[0, 'cheesy', 'point'], [0.6, 'smug', 'hips']]);
    speak(emak, 9, [[0, 'scheming', 'cross'], [0.45, 'annoyed', 'point']]);
    emak.act([{t: E('pindah'), action: 'lean', dur: 1.0, amount: -0.12}, {t: E('sebelah') + 0.6, pose: 'cheer', expr: 'toothy'}]);
    abang.act([{t: cut(3), pose: 'present', expr: 'cheesy'}, {t: E('menang') + 0.05, pose: 'idle', expr: 'nervous'}, {t: E('ditawar') + 0.1, pose: 'idle', expr: 'worried'},
      {t: E('limaBelas') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('bang') + 0.1, pose: 'beg', expr: 'grimace'}, {t: E('sebelah') + 0.1, pose: 'facepalm', expr: 'cry'}, {t: tPrice + 0.2, pose: 'give', expr: 'cry'}]);
    abang.act([{t: E('limaBelas'), action: 'jump', dur: 0.5}]);
    tetangga.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('sebelah'), pose: 'wave', expr: 'excited'}]);
    shopper.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('ditawar'), pose: 'cheer', expr: 'excited'}]);
  }

  // ---------- home: lost things (9), president at home (10-11), the question (12) ----------
  {
    const g = addLoc('home');
    under(g, '#2a2228');
    g.add(P.room(8, 3.2, 6, {wall: '#f0dcb8', floor: '#a87a52', wain: '#7fa35a'}));
    const sofa = P.sofa('#6a8ab0'); at(sofa, -2.4, 0, -4.1); g.add(sofa);
    const tv = P.tv(); at(tv.group, 0.5, 0, -4.5); g.add(tv.group); updaters.push((t) => tv.update(t));
    const ct = box(1.0, 0.42, 0.6, toon('#8a5a3a', {paint: {planks: 3, seed: 161}})); at(ct, -0.5, 0, -3.1); g.add(ct);
    const clock = P.wallClock(0.26, {rim: '#d8413a'}); at(clock.group, 0.2, 2.45, -4.85); g.add(clock.group); clock.set(7, 10); clock.group.position.x = -1.2;
    const KX = 2.45; // the kitchen corner
    const stove = P.stoveCounter(1.6); at(stove, KX, 0, -3.4); g.add(stove);
    const pot = P.cookPot('#b8c0c8'); at(pot, KX + 0.32, 0.93, -3.4); g.add(pot);
    fx(g, FX.smoke([KX + 0.32, 1.25, -3.4], cut(10), {n: 60, every: 0.2, life: 1.6, size: 0.25, grow: 2.0, rise: 0.6, drift: 0.05, color: '#fbf6ea', opacity: 0.5}), (t) => inShots(t, 10, 11));
    const cal = P.calendar(L.noLeave, {crossed: true});
    popSign(g, cal, KX - 0.25, 2.78, -3.6, E('cuti') - 0.1, 1e9, (t) => inShots(t, 11));
    const rem = P.remote(); g.add(rem);
    const bapak = ch('bapak', {seed: 80}, g, -1.3, -3.6, 0.2);
    const kid = ch('kid', {seed: 81, scale: 0.62}, g, 1.4, -3.0, -0.2);
    const emak = ch('emakHome', {seed: 5}, g, 0.7, -2.6, -0.3);
    const queen = ch('emakHome', {seed: 6, hat: 'crown'}, g, KX - 0.25, -4.05, 0.15);
    const queen2 = ch('emakHome', {seed: 7, hat: 'crown'}, g, 0, -2.8, 0); showWhen(queen2.group, (t) => t >= cut(12));
    const tQ = E('rumah') - 0.05;
    showWhen(emak.group, (t) => t < tQ); showWhen(queen.group, (t) => t >= tQ && t < cut(12));
    walkPath(emak, [[cut(9), 0.7, -2.6], [cut(10) - 0.03, 0.7, -2.6], [cut(10), KX - 0.25, -4.05]]);
    const lad1 = P.ladle(), lad2 = P.ladle(); held(emak, lad1, {y: 0.02, z: 0.08, rz: 0.4}); held(queen, lad2, {y: 0.02, z: 0.08, rz: 0.4}); showWhen(lad1, (t) => t >= cut(10));
    const stir = (c, a, b) => { const cues = []; for (let t0 = a; t0 < b; t0 += 0.45) cues.push({t: t0, pose: 'tap'}, {t: t0 + 0.22, pose: 'hold'}); c.act(cues); };
    stir(emak, cut(10) + 0.2, tQ); stir(queen, tQ + 0.6, E('keuangan') - 0.1); stir(queen, E('setiap'), cut(12) - 0.1);
    fx(g, FX.smoke([KX - 0.25, 1.3, -3.85], tQ - 0.1, {n: 10, every: 0.015, life: 0.7, size: 0.5, grow: 1.8, rise: 0.4, drift: 0.2, color: '#fff3df', opacity: 0.85}), (t) => inShots(t, 10));
    fx(g, FX.glints([KX - 0.25, 2.1, -3.85], tQ, {n: 26}), (t) => inShots(t, 10));
    // the remote: on the table, then in her hand
    const remH = P.remote(); held(emak, remH, {y: 0.0, z: 0.08}); showWhen(remH, (t) => t > E('mata') - 0.2 && t < cut(10));
    updaters.push((t) => { rem.visible = t < E('mata') - 0.2; at(rem, -0.4, 0.43, -3.0, 0.4); });
    popSign(g, sign(L.found, 0.9, 0.32, {bg: '#3f8a5a', fg: '#fff3df', frame: '#1f5a3a'}), 0.2, 2.35, -2.6, E('mata') - 0.1, cut(10), (t) => inShots(t, 9));
    emak.act([{t: cut(9), pose: 'hips', expr: 'annoyed'}, {t: E('mata') - 0.2, pose: 'present', expr: 'furious'}]);
    speak(emak, 21, [[0, 'annoyed', 'present'], [0.5, 'furious', 'pointUp']]);
    emak.act([{t: cut(10), pose: 'hold', expr: 'tired'}, {t: E('sebenarnya') + 0.05, expr: 'thinking'}, {t: E('sudah'), expr: 'happy'}]);
    bapak.act([{t: cut(9), pose: 'headHold', expr: 'confused'}, {t: E('mata'), pose: 'idle', expr: 'surprised'}, {t: E('mulut') + 0.1, pose: 'facepalm', expr: 'nervous'},
      {t: cut(11), pose: 'idle', expr: 'neutral'}, {t: E('semua') + 0.1, pose: 'wave', expr: 'cheesy'}, {t: cut(12), pose: 'idle', expr: 'happy'}, {t: E('komentar'), pose: 'point', expr: 'cheesy'}]);
    walkPath(bapak, [[cut(11), -1.3, -3.6], [E('semua') - 0.2, KX - 1.2, -3.6], [E('semua') + 0.5, KX - 1.75, -3.3], [cut(12) - 0.02, KX - 1.75, -3.3], [cut(12), -1.3, -2.9]]);
    showWhen(bapak.group, (t) => !inShots(t, 10));
    kid.act([{t: cut(9), pose: 'idle', expr: 'cheesy'}, {t: E('mulut'), pose: 'cheer', expr: 'laugh'}, {t: cut(11), pose: 'idle', expr: 'neutral'},
      {t: E('semua') + 0.15, pose: 'cheer', expr: 'excited'}, {t: cut(12), pose: 'wave', expr: 'toothy'}]);
    walkPath(kid, [[cut(11), 1.4, -3.0], [E('semua') - 0.1, KX + 1.5, -3.2], [E('semua') + 0.5, KX + 1.5, -3.2], [cut(12) - 0.02, KX + 1.5, -3.2], [cut(12), 1.3, -2.7]]);
    showWhen(kid.group, (t) => !inShots(t, 10));
    queen.act([{t: tQ, pose: 'hips', expr: 'proud'}, {t: tQ + 0.6, expr: 'happy'}, {t: E('keuangan') - 0.05, pose: 'presentBoth', expr: 'proud'}, {t: E('makanan') + 0.05, pose: 'present', expr: 'cheesy'},
      {t: E('kesehatan') + 0.05, pose: 'presentBoth', expr: 'determined'}, {t: E('setiap') + 0.05, expr: 'tired'}, {t: E('cuti') + 0.1, expr: 'happy'}]);
    queen2.act([{t: cut(12), pose: 'shrug', expr: 'happy'}, {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy'}]);
    // what she runs, popping around her
    const wl = P.wallet(); wl.open(1); const wal = wl.group; const aid = new THREE.Group();
    aid.add(box(0.36, 0.26, 0.2, '#fbf6ea', {hull: 0.01})); const cross = sign('+', 0.2, 0.2, {bg: '#fbf6ea', fg: '#d8312a', frame: '#fbf6ea', depth: 0.01, border: false}); at(cross, 0, 0.13, 0.105); aid.add(cross);
    [[wal, 'keuangan', L.money, KX - 0.95, 2.15], [P.cookPot(), 'makanan', L.food, KX + 0.85, 2.15], [aid, 'kesehatan', L.health, KX - 0.95, 1.4]].forEach(([obj, k, lab, x, y]) => {
      const grp = new THREE.Group(); obj.scale.setScalar(1.3); grp.add(obj);
      const l = sign(lab, 0.8, 0.2, {bg: '#fff3df', fg: '#351f22', frame: '#351f22', depth: 0.02}); at(l, 0, -0.18, 0.1); grp.add(l);
      popSign(g, grp, x, y, -3.0, E(k) - 0.05, cut(12), (t) => inShots(t, 11));
    });
    popSign(g, sign(L.all, 0.9, 0.24, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), KX + 0.85, 1.4, -3.0, E('semua') - 0.05, cut(12), (t) => inShots(t, 11));
    popSign(g, sign(L.question, 1.8, 0.42, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}), 0, 2.72, -2.2, E('emakmu') - 0.1, 1e9, (t) => inShots(t, 12));
    popSign(g, sign(L.comment, 1.5, 0.36, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}), 0, 2.28, -2.15, E('komentar') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.confetti([0, 2.9, -2.6], E('komentar') + 0.05), (t) => inShots(t, 12));
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
