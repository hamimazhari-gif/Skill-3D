// All locations in one scene at different x offsets. Story: "Roy Sullivan, disambar petir 7 kali" (1942-1977).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {park: 0, road: 40, town: 80, lake: 120, museum: 160};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'sturdy' (new for this video; round no-sleep face, side hair, thick brows, sturdy limbs, long torso).
export const CHAR_DESIGN = 'sturdy';
const ROY = {outfit: 'shirt', jacket: '#c9b07a', tie: '#3a5a3a', lower: '#4a5a3a', pocket: '#b89e68', hair: '#3a2a26', hairStyle: 'side', hat: 'ranger', hatColor: '#c9a26a', hatColor2: '#5a3a26'};
const CAST = {
  roy: ROY,
  royB: {...ROY, soot: true, noBrows: true},
  royF: {...ROY, hat: 'none', hairStyle: 'frazzle', hair: '#2b2326', soot: true},
  f1: {outfit: 'tshirt', jacket: '#d8413a', print: '#fff3df', print2: '#f2d24a', lower: '#3f5f8a', tie: '#d8413a', hair: '#6a4a32', hairStyle: 'fringe', hat: 'cap', hatColor: '#3f5f8a', hatColor2: '#2f4f7a'},
  f2: {outfit: 'hoodie', jacket: '#7a5aa8', lower: '#3a3a48', tie: '#7a5aa8', hair: '#c9a25a', hairStyle: 'bun', hat: 'none'},
  f3: {outfit: 'farmer', jacket: '#5a9a8a', lower: '#5a4a3a', pocket: '#4a8a7a', tie: '#5a9a8a', hair: '#2b2326', hairStyle: 'tuft', hat: 'none', glasses: true, mustache: 'thin'},
};

// Lighting: storms for every strike (dark blue-grey, the bolt lights the scene), a sunny park for the intro,
// a grey town under the following cloud, a warm museum at the end.
const stormL = {...LOOK_PRESETS.storm, keyI: 1.5, hemiI: 1.0};
const dayL = {...LOOK_PRESETS.day};
export const LOOK = {
  park: {keys: [{at: 0, ...stormL}, {at: 'cut2', ...dayL}, {at: 'menyukai', ...stormL}, {at: 'cut3', ...stormL}]},
  road: {keys: [{at: 0, ...LOOK_PRESETS.overcast}, {at: 's2', ...stormL}, {at: 'cut5', ...LOOK_PRESETS.overcast}, {at: 'cut7', ...stormL}]},
  town: {keys: [{at: 0, ...dayL}, {at: 'cut8', ...dayL}, {at: 'mendung', ...LOOK_PRESETS.overcast, ...MOODS.sad}, {at: 'cut12', ...LOOK_PRESETS.overcast}]},
  lake: {keys: [{at: 0, ...LOOK_PRESETS.overcast}, {at: 's7', ...stormL}, {at: 'beruang', ...LOOK_PRESETS.overcast}]},
  museum: {...LOOK_PRESETS.interiorWarm, keyI: 2.3, hemiI: 1.3, ...MOODS.joyful},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };
const STRIKES = ['petir0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];

// Screen-level effects: a white flash and a shake on every strike.
export function storyFx(T, EVt) {
  return {
    flashes: [...STRIKES.map((k) => ({t: EVt[k] + 0.1, dur: 0.35, color: '#eaf6ff', strength: 0.7})),
      {t: EVt.selamat, dur: 0.3, color: '#ffe9b0', strength: 0.3}, {t: EVt.guinness, dur: 0.35, color: '#ffe9b0', strength: 0.35}, {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.35}],
    shakes: STRIKES.map((k) => ({t: EVt[k] + 0.1, dur: 0.4, amp: 0.025})),
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
  const speak = (c, si, exprs = [], from = -1) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).map(([a, b]) => [Math.max(a, from - 0.05), b]).filter(([a, b]) => b - a > 0.05);
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
  const seat = (c, y0) => updaters.push(() => { c.group.position.y = y0; }); // seated behind a table: body lowered
  // the clock motif: a small digital board with the hour, popping in on its word
  const clock = (g, txt, x, y, z, word, vis = () => true) => popSign(g, P.digitalBoard(txt, 0.9, 0.32, {color: '#ffcf4a'}), x, y, z, E(word) - 0.1, 1e9, vis);


  const S0 = (k) => E(k) + 0.1; // the moment a bolt lands
  const bolt = (g, x, y, z, k, seed = 7) => { const t0 = S0(k); fx(g, FX.lightning([x + 0.6, 10, z - 1.5], [x, y, z], t0, {seed, dur: 0.45})); fx(g, FX.sparks([x, y, z], t0, {n: 40, seed}));
    fx(g, FX.smoke([x, y, z], t0 + 0.05, {n: 10, every: 0.12, life: 1.4, size: 0.3, grow: 2, rise: 0.6, color: '#6a6a72', opacity: 0.55})); };
  const counter = (g, n, x, y, z, k, until) => popSign(g, sign(L.strike(n), 1.3, 0.32, {bg: '#2b2b33', fg: '#f2d24a', frame: '#f2d24a'}), x, y, z, S0(k), until);
  const darkCloud = (g, x, y, z, s = 1, eyes = false) => { const c = P.cloud(s, 11, '#5a6070'); at(c, x, y, z); g.add(c);
    if (eyes) for (const sd of [-1, 1]) { const w = ball(0.22 * s, '#fbfbf8', {hull: 0.01}); at(w, sd * 0.35 * s, 0.05, 0.75 * s); c.add(w); const pu = ball(0.09 * s, INK, {hull: 0}); at(pu, sd * 0.35 * s + 0.03, 0.02, 0.95 * s); c.add(pu);
      const br = box(0.32 * s, 0.06 * s, 0.04, INK, {hull: 0}); at(br, sd * 0.35 * s, 0.25 * s, 0.85 * s, 0, 0, -sd * 0.35); c.add(br); }
    return c; };
  const forest = (g, n, seed, xr = 9) => { const rr = (() => { let v = seed; return () => (v = (v * 9301 + 49297) % 233280) / 233280; })();
    for (let i = 0; i < n; i++) { const x = (rr() - 0.5) * 2 * xr, z = -6 - rr() * 10; if (Math.abs(x) < 1.2 && z > -8) continue; const tr = P.tree({seed: seed + i, h: 2.4 + rr() * 1.6}); at(tr, x, 0, z); g.add(tr); } };

  // ---------- the park: the hook (1), the ranger (2), strike 1 at the lookout tower (3), strikes 3 and 4 (5), strike 6 (9) ----------
  {
    const g = addLoc('park');
    under(g, '#7fa05a', 120);
    const grass = box(60, 0.03, 40, toon('#7fa05a', {paint: {seed: 301, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -12); g.add(grass);
    g.add(P.hills('#6f9a5a'));
    forest(g, 34, 310);
    const tower = P.lookoutTower(4.2); at(tower, 2.6, 0, -6.2); g.add(tower);
    const hut = P.house(3.2, 2.4, 3, {color: '#8a6242', roof: '#4f6a4a', windows: 1, doorX: -0.5, seed: 30}); at(hut, -2.6, 0, -5.2); g.add(hut);
    popSign(g, P.banner(L.park, 2.6, 0.46, {bg: '#4f6a4a', fg: '#f2d24a', frame: '#2f4a2a', poleH: 3.3}), 0, 0, -4.4, cut(2) - 0.5, cut(3), (t) => inShots(t, 2));
    popSign(g, sign(L.usa, 1.3, 0.3, {bg: '#fbf6ea', fg: '#2f4f8a', frame: '#d8413a'}), 0.95, 2.35, -2.9, E('amerika') - 0.1, cut(3), (t) => inShots(t, 2));
    // the hook: Roy is struck and survives
    const roy1 = ch('roy', {seed: 1}, g, 0, -2.6, 0); showWhen(roy1.group, (t) => (inShots(t, 1) && t < S0('petir0')) || inShots(t, 2));
    const royF1 = ch('royF', {seed: 2}, g, 0, -2.6, 0); showWhen(royF1.group, (t) => inShots(t, 1) && t >= S0('petir0'));
    roy1.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('pria') + 0.2, pose: 'idle', expr: 'worried'},
      {t: cut(2), pose: 'wave', expr: 'happy'}, {t: E('penjaga') + 0.05, pose: 'hips', expr: 'proud'}, {t: E('alam') + 0.05, pose: 'presentBoth', expr: 'happy'},
      {t: E('sepertinya') + 0.1, pose: 'idle', expr: 'worried'}, {t: E('menyukai') + 0.1, pose: 'headHold', expr: 'grimace'}]);
    royF1.act([{t: 0, pose: 'armsUp', expr: 'scream'}, {t: E('tujuh0'), pose: 'limp', expr: 'tired'}, {t: E('selamat') + 0.05, pose: 'cheer', expr: 'cheesy'}]);
    royF1.act([{t: S0('petir0'), action: 'tremble', dur: 0.9}, {t: E('selamat'), action: 'jump', dur: 0.5}]);
    bolt(g, 0, 2.3, -2.6, 'petir0');
    fx(g, FX.smoke([0, 2.1, -2.6], S0('petir0') + 0.3, {n: 12, every: 0.2, life: 1.6, size: 0.25, grow: 2, rise: 0.5, color: '#7a7a82', opacity: 0.45}), (t) => inShots(t, 1));
    popSign(g, sign(L.seven, 1.2, 0.36, {bg: '#f2d24a', fg: '#351f22', frame: '#351f22'}), -0.55, 2.8, -2.4, E('tujuh0') - 0.05, cut(2));
    popSign(g, sign(L.alive, 1.2, 0.36, {bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'}), 0.55, 2.8, -2.35, E('selamat') - 0.05, cut(2));
    // lightning loves him: a cloud with a heart
    const lc = darkCloud(g, 0.2, 4.0, -4.2, 0.55); showWhen(lc, (t) => inShots(t, 2) && t > E('sepertinya'));
    updaters.push((t) => { lc.scale.setScalar(pop(t, E('sepertinya'), 0.4)); });
    const hrt = P.heart('#e0626e'); g.add(hrt); updaters.push((t) => { hrt.visible = inShots(t, 2) && t > E('menyukai') - 0.05; hrt.scale.setScalar(0.9 * pop(t, E('menyukai') - 0.05, 0.4)); at(hrt, 0.2, 3.45 + Math.sin(t * 4) * 0.05, -3.3); });
    for (let i = 0; i < 3; i++) fx(g, FX.lightning([-6 + i * 5, 12, -18], [-6 + i * 5 + 1, 0, -18], E('menyukai') + 0.2 + i * 0.35, {seed: 40 + i, dur: 0.3}), (t) => inShots(t, 2));
    // strike 1: by the lookout tower, the big toenail flies off
    const roy3 = ch('roy', {seed: 3}, g, 1.4, -4.9, -0.2); showWhen(roy3.group, (t) => inShots(t, 3));
    roy3.act([{t: cut(3), pose: 'idle', expr: 'neutral'}, {t: S0('s1'), pose: 'armsUp', expr: 'scream'}, {t: E('kuku'), pose: 'headHold', expr: 'grimace'}, {t: E('copot') + 0.05, pose: 'headHold', expr: 'cry'}]);
    roy3.act([{t: S0('s1'), action: 'jump', dur: 0.5}, {t: E('kuku'), action: 'hop', dur: 0.4}, {t: E('kuku') + 0.45, action: 'hop', dur: 0.4}, {t: E('copot'), action: 'hop', dur: 0.4}]);
    bolt(g, 1.4, 2.0, -4.9, 's1', 11);
    const nail = box(0.07, 0.015, 0.06, '#f6efe0', {hull: 0.004}); g.add(nail);
    updaters.push((t) => { const u = t - E('copot') + 0.15; nail.visible = inShots(t, 3) && u > 0; const k = Math.min(u, 1.2); at(nail, 1.55 + k * 0.9, 0.05 + k * 2.2 - k * k * 1.6, -4.7 + k * 0.6, 0, k * 9, k * 7); });
    fx(g, FX.glints([1.6, 0.4, -4.6], E('copot') - 0.1, {n: 16}), (t) => inShots(t, 3));
    counter(g, 1, 1.4, 3.05, -4.6, 's1', cut(4));
    popSign(g, sign(L.toe, 1.6, 0.34, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), 1.4, 2.65, -4.5, E('kuku') - 0.05, cut(4));
    fx(g, FX.rain([0, -4, 14, 10], {from: cut(3), to: cut(4)}));
    // strikes 3 (shoulder) and 4 (hair), by the ranger hut
    const roy5 = ch('roy', {seed: 5}, g, -2.0, -3.4, 0.2); showWhen(roy5.group, (t) => inShots(t, 5) && t < S0('s4'));
    const royF5 = ch('royF', {seed: 6}, g, -2.0, -3.4, 0.2); showWhen(royF5.group, (t) => inShots(t, 5) && t >= S0('s4'));
    roy5.act([{t: cut(5), pose: 'idle', expr: 'worried'}, {t: S0('s3'), pose: 'armsUp', expr: 'scream'}, {t: E('bahu'), pose: 'facepalm', expr: 'grimace'}]);
    roy5.act([{t: S0('s3'), action: 'jump', dur: 0.5}]);
    royF5.act([{t: 0, pose: 'headHold', expr: 'scream'}]); royF5.act([{t: S0('s4'), action: 'tremble', dur: 1.5}]);
    walkPath(royF5, [[S0('s4') + 0.3, -2.0, -3.4], [S0('s4') + 0.9, -1.2, -3.0], [S0('s4') + 1.5, -2.0, -2.6], [S0('s4') + 2.1, -2.6, -3.1]], 'run');
    bolt(g, -1.8, 1.7, -3.4, 's3', 13); bolt(g, -2.0, 2.2, -3.4, 's4', 14);
    fx(g, FX.flame([-1.75, 1.75, -3.3], {size: 0.35, seed: 3}), (t) => inShots(t, 5) && t > S0('s3') && t < S0('s4') - 0.2);
    const hf = FX.flame([0, 0, 0], {size: 0.55, seed: 5}); g.add(hf.obj); updaters.push((t) => { hf.update(t); hf.obj.visible = inShots(t, 5) && t > S0('s4'); hf.obj.position.set(royF5.group.position.x + 2.0, 2.2, royF5.group.position.z + 3.4); });
    counter(g, 3, -1.9, 3.05, -3.6, 's3', S0('s4'));
    popSign(g, sign(L.shoulder, 1.5, 0.32, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), -1.9, 2.67, -3.5, E('bahu') - 0.05, S0('s4'));
    counter(g, 4, -1.9, 3.05, -3.6, 's4', cut(6));
    popSign(g, sign(L.hair, 1.6, 0.32, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), -1.9, 2.67, -3.5, E('rambut4') - 0.05, cut(6));
    // strike 6: the legs
    const roy9 = ch('roy', {seed: 7}, g, 0.6, -3.0, 0.1); showWhen(roy9.group, (t) => inShots(t, 9));
    roy9.act([{t: cut(9), pose: 'idle', expr: 'tired'}, {t: S0('s6'), pose: 'armsUp', expr: 'scream'}, {t: E('terluka'), pose: 'beg', expr: 'cry'}]);
    roy9.act([{t: S0('s6'), action: 'jump', dur: 0.5}, {t: E('terluka'), action: 'hop', dur: 0.4}, {t: E('terluka') + 0.45, action: 'hop', dur: 0.4}]);
    bolt(g, 0.6, 2.2, -3.0, 's6', 16);
    fx(g, FX.smoke([0.6, 0.3, -2.9], S0('s6') + 0.1, {n: 10, every: 0.12, life: 1.2, size: 0.25, grow: 2, rise: 0.4, color: '#6a6a72', opacity: 0.5}), (t) => inShots(t, 9));
    counter(g, 6, 0.6, 3.05, -3.2, 's6', cut(10));
    popSign(g, sign(L.leg, 1.4, 0.32, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), 0.6, 2.67, -3.1, E('terluka') - 0.05, cut(10));
    fx(g, FX.rain([0, -4, 14, 10], {from: cut(9), to: cut(10)}));
  }

  // ---------- the road: strike 2 in the car (4), the following cloud (7) ----------
  {
    const g = addLoc('road');
    under(g, '#7fa05a', 160);
    const road = box(80, 0.02, 4, toon('#4a4a52', {paint: {seed: 321, stains: 20}}), {edges: false}); at(road, 0, -0.02, -4); g.add(road);
    for (let i = 0; i < 30; i++) { const m = box(1.4, 0.025, 0.12, '#f3efe6', {hull: 0, edges: false}); at(m, -36 + i * 2.6, -0.01, -4); g.add(m); }
    forest(g, 40, 330, 30);
        const mkCar = () => { const c = P.car('#4f6a4a'); c.children.filter((m) => m.geometry && m.geometry.type === 'ConeGeometry').forEach((m) => c.remove(m)); return c; };
    // strike 2: the parked truck
    const car4 = mkCar(); at(car4, 0, 0, -4.2, Math.PI / 2); g.add(car4); showWhen(car4, (t) => inShots(t, 4));
    const royIn = ch('roy', {seed: 8}, g, -0.45, -4.55, 0, 0.12); showWhen(royIn.group, (t) => inShots(t, 4) && t < E('alis') - 0.2);
    royIn.act([{t: cut(4), pose: 'idle', expr: 'happy'}, {t: S0('s2'), pose: 'armsUp', expr: 'scream'}]); royIn.act([{t: S0('s2'), action: 'tremble', dur: 1.2}]);
    bolt(g, 0, 1.4, -4.2, 's2', 21);
    const royB = ch('royB', {seed: 9}, g, 1.3, -2.9, -0.2); showWhen(royB.group, (t) => inShots(t, 4) && t >= E('alis') - 0.2);
    royB.act([{t: 0, pose: 'idle', expr: 'shocked'}, {t: E('hangus') + 0.1, pose: 'facepalm', expr: 'tired'}]);
    fx(g, FX.smoke([1.3, 1.9, -2.8], E('alis'), {n: 10, every: 0.15, life: 1.4, size: 0.18, grow: 2, rise: 0.4, color: '#7a7a82', opacity: 0.45}), (t) => inShots(t, 4));
    counter(g, 2, -0.6, 2.6, -3.6, 's2', cut(5));
    popSign(g, sign(L.brows, 1.3, 0.32, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), 0.2, 2.6, -2.6, E('alis') - 0.05, cut(5));
    // strike 5 and the chase: a dark cloud with angry eyes follows the truck
    const car7 = mkCar(); g.add(car7); showWhen(car7, (t) => inShots(t, 7));
    const xAt = (t) => -4 + 12 * smooth((t - E('menyetir') + 0.2) / (E('mengejar') + 0.4 - E('menyetir')));
    updaters.push((t) => { at(car7, xAt(t), 0, -4.4, Math.PI / 2); for (const w of car7.userData.wheels) w.rotation.x = -xAt(t) * 3; });
    const royIn7 = ch('roy', {seed: 10}, g, -4.45, -4.75, 0, 0.12); updaters.push((t) => { royIn7.group.position.set(xAt(t) - 0.45, 0.12, -4.75); }); showWhen(royIn7.group, (t) => inShots(t, 7) && t < E('pergi') - 0.12);
    royIn7.act([{t: cut(7), pose: 'idle', expr: 'neutral'}, {t: S0('s5'), pose: 'armsUp', expr: 'scream'}, {t: E('bersumpah') + 0.1, pose: 'pointUp', expr: 'paranoid'}, {t: E('menyetir'), pose: 'tap', expr: 'grimace'}, {t: E('tapi5'), pose: 'tap', expr: 'scream'}]);
    const cl = darkCloud(g, 0, 4.0, -4.6, 1.2, true); showWhen(cl, (t) => inShots(t, 7));
    updaters.push((t) => { cl.position.x = xAt(t - 0.35) - 0.3; cl.position.y = 4.0 + Math.sin(t * 2) * 0.1; });
    updaters.push(() => {}); bolt(g, -4, 1.4, -4.4, 's5', 22);
    const royOut = ch('roy', {seed: 11}, g, 8.6, -2.6, -0.3); showWhen(royOut.group, (t) => inShots(t, 7) && t >= E('pergi') - 0.12);
    royOut.act([{t: 0, pose: 'pointUp', expr: 'furious'}, {t: E('cari') + 0.05, pose: 'shrug', expr: 'gritted'}]);
    royOut.act([{t: E('pergi'), action: 'jump', dur: 0.5}]);
    speak(royOut, 13, [[0, 'furious', 'pointUp'], [0.45, 'gritted', 'shrug']]);
    counter(g, 5, -4.0, 2.4, -2.8, 's5', E('menyetir'));
    popSign(g, sign(L.go, 0.9, 0.34, {bg: '#d8413a', fg: '#fff3df', frame: '#8a1a1a'}), 8.85, 2.75, -2.5, E('pergi') - 0.05, cut(8));
  }

  // ---------- the town: the bucket of water (6), friends keep away (8), the question (12) ----------
  {
    const g = addLoc('town');
    under(g, '#c9c2b0', 120);
    const street = box(40, 0.02, 6, toon('#5a5a62', {paint: {seed: 341}}), {edges: false}); at(street, 0, -0.02, 0.5); g.add(street);
    const walk = box(40, 0.08, 3, toon('#c9c2b0', {paint: {seed: 342}}), {edges: false}); at(walk, 0, 0, -3.5); g.add(walk);
    [['#e8c35a', '#b5543c'], ['#7fc4e8', '#4f6a7a'], ['#e0809a', '#7a4a32'], ['#f3efe6', '#b5543c'], ['#bfd8b0', '#4f6a7a']].forEach(([c, rf], i) => {
      const h = P.house(3.4, 3.0, 3, {color: c, roof: rf, windows: 2, doorX: -0.4, seed: 40 + i}); at(h, -7 + i * 3.6, 0, -5.4); g.add(h); });
    for (const x of [-4.3, 3.8]) { const l = P.streetLamp(); at(l, x, 0, -2.3); g.add(l); }
    // the bucket, everywhere
    const roy6 = ch('roy', {seed: 12}, g, -2.5, -3.1, 0.4); showWhen(roy6.group, (t) => inShots(t, 6));
    walkPath(roy6, [[cut(6) + 0.1, -2.5, -3.1], [E('jaga') - 0.2, 0.4, -3.0]]);
    const bk = P.bucket(); held(roy6, bk, {y: -0.32, z: 0.06}); showWhen(bk, (t) => inShots(t, 6));
    roy6.act([{t: cut(6), pose: 'hold', expr: 'happy'}, {t: E('ember') + 0.05, pose: 'hold', expr: 'proud'}, {t: E('jaga') - 0.1, pose: 'hold', expr: 'paranoid'},
      {t: E('kepala') - 0.1, pose: 'carry', expr: 'worried'}, {t: E('lagi') + 0.15, pose: 'carry', expr: 'happy'}]);
    updaters.push((t) => { const u = smooth((t - E('lagi') + 0.1) / 0.3); bk.rotation.z = u * 2.4; bk.position.y = -0.32 + u * 0.1; });
    fx(g, FX.splash([0.4, 2.0, -2.9], E('lagi') + 0.15), (t) => inShots(t, 6));
    popSign(g, sign(L.water, 0.6, 0.24, {bg: '#7fc4e8', fg: '#fff3df', frame: '#2f6a8a'}), -0.3, 2.55, -3.2, E('ember') - 0.05, E('jaga'), (t) => inShots(t, 6));
    // friends run away when the sky turns grey
    const roy8 = ch('roy', {seed: 13}, g, 0, -3.0, 0); showWhen(roy8.group, (t) => inShots(t, 8) || inShots(t, 12));
    const pal = [['f1', -1.0, -2.7, 0.3], ['f2', 1.0, -2.8, -0.3], ['f3', 1.8, -3.0, -0.3]].map(([k, x, z, y], i) => {
      const c = ch(k, {seed: 70 + i}, g, x, z, y); showWhen(c.group, (t) => inShots(t, 8) && t < E('maaf') - 0.15);
      c.act([{t: cut(8), pose: ['wave', 'idle', 'hips'][i], expr: 'happy'}, {t: E('takut') - 0.1 + i * 0.1, pose: 'idle', expr: 'worried'}, {t: E('mendung') + 0.1, pose: 'armsUp', expr: ['scream', 'grimace', 'scream'][i]}]);
      walkPath(c, [[E('menjauh') - 0.2 + i * 0.1, x, z], [E('menjauh') + 0.9 + i * 0.1, x + (x < 0 ? -4.5 : 4.5), z + 0.6]], 'run');
      return c; });
    const cl8 = darkCloud(g, 0, 4.2, -3.2, 1.0, true); showWhen(cl8, (t) => (inShots(t, 8) && t > E('mendung') - 0.2) || inShots(t, 12));
    updaters.push((t) => { cl8.scale.setScalar(inShots(t, 12) ? 1 : pop(t, E('mendung') - 0.2, 0.4)); cl8.position.y = 4.2 + Math.sin(t * 1.7) * 0.08; });
    roy8.act([{t: cut(8), pose: 'present', expr: 'happy'}, {t: E('takut') + 0.1, pose: 'idle', expr: 'confused'}, {t: E('menjauh') + 0.2, pose: 'beg', expr: 'sad'},
      {t: E('maaf'), pose: 'hold', expr: 'cry'}, {t: cut(12), pose: 'hold', expr: 'nervous'}, {t: E('berani') + 0.05, pose: 'shrug', expr: 'cheesy'}, {t: E('komentar') - 0.1, pose: 'point', expr: 'cheesy'}]);
    const ph8 = P.phone(); held(roy8, ph8, {y: 0.03, z: 0.06}); showWhen(ph8, (t) => inShots(t, 8) && t > E('maaf') - 0.2);
    const bk12 = P.bucket(); held(roy8, bk12, {hand: 0, y: -0.32, z: 0.06}); showWhen(bk12, (t) => inShots(t, 12));
    // far away, a friend calls instead
    const caller = ch('f2', {seed: 75}, g, 3.0, -3.3, -0.2); showWhen(caller.group, (t) => inShots(t, 8) && t > E('maaf') - 0.15);
    const ph2 = P.phone(); held(caller, ph2, {y: 0.03, z: 0.06}); caller.act([{t: 0, pose: 'drink', expr: 'nervous'}]);
    speak(caller, 16, [[0, 'nervous', 'drink'], [0.5, 'cheesy', 'drink']]);
    popSign(g, sign(L.phone, 1.7, 0.32, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), 3.0, 2.55, -3.0, E('telepon') - 0.1, cut(9));
    popSign(g, sign(L.question, 2.0, 0.4, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}), 0, 2.75, -2.7, E('berani') - 0.15, 1e9, (t) => inShots(t, 12));
    popSign(g, sign(L.comment, 1.6, 0.36, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}), 0, 2.32, -2.65, E('komentar') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.confetti([0, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the lake: strike 7 while fishing, the bear (10), an unlucky day (11) ----------
  {
    const g = addLoc('lake');
    under(g, '#7fa05a', 120);
    const lake = box(30, 0.04, 14, toon('#5a8ab0', {paint: {seed: 351}}), {edges: false}); at(lake, 0, -0.04, -12); g.add(lake);
    const shore = box(30, 0.06, 6, toon('#b8a47a', {paint: {seed: 352, stains: 20}}), {edges: false}); at(shore, 0, -0.03, -2.2); g.add(shore);
    forest(g, 12, 370, 12); for (let i = 0; i < 6; i++) { const tr = P.tree({seed: 380 + i, h: 2.8}); at(tr, -9 + i * 0.9 - (i % 2) * 0.5, 0, -1.5 - i * 0.7); g.add(tr); }
    const roy10 = ch('roy', {seed: 14}, g, 0.6, -3.8, -0.1); showWhen(roy10.group, (t) => inShots(t, 10) && t < S0('s7'));
    const royF10 = ch('royF', {seed: 15}, g, 0.6, -3.8, -0.1); showWhen(royF10.group, (t) => (inShots(t, 10) && t >= S0('s7')) || inShots(t, 11) && t < cut(11) + (E('tercatat') - cut(11)));
    const rod = P.fishingRod(); held(roy10, rod, {y: 0.02, z: 0.08, rx: -0.6});
    const rod2 = P.fishingRod(); held(royF10, rod2, {y: 0.02, z: 0.08, rx: -0.6}); showWhen(rod2, (t) => t < E('mengusir') - 0.1);
    const stick = cyl(0.025, 0.035, 1.1, '#7a5236', {hull: 0.006}); held(royF10, stick, {hand: 0, y: 0.0, z: 0.06, rx: 0.3}); showWhen(stick, (t) => t > E('mengusir') - 0.1 && t < cut(11));
    roy10.act([{t: cut(10), pose: 'tap', expr: 'happy'}, {t: E('memancing') + 0.05, pose: 'tap', expr: 'proud'}, {t: S0('s7'), pose: 'armsUp', expr: 'scream'}]);
    royF10.act([{t: 0, pose: 'tap', expr: 'scream'}, {t: E('seolah'), pose: 'tap', expr: 'tired'}, {t: E('beruang') + 0.1, pose: 'tap', expr: 'shocked'},
      {t: E('mengusir') - 0.1, pose: 'hammerUp', expr: 'furious'}, {t: E('ranting') + 0.1, pose: 'hammerDown', expr: 'gritted'},
      {t: cut(11), pose: 'limp', expr: 'tired'}]);
    royF10.act([{t: S0('s7'), action: 'tremble', dur: 1.2}, {t: E('beruang'), action: 'jump', dur: 0.5}]);
    walkPath(royF10, [[E('mengusir') - 0.1, 0.6, -3.8], [E('ranting') + 0.5, -1.6, -3.2], [cut(11) - 0.05, -1.6, -3.2], [cut(11), 0.6, -3.6]], 'run');
    bolt(g, 0.6, 2.2, -3.8, 's7', 31);
    const hf = FX.flame([0, 0, 0], {size: 0.5, seed: 7}); g.add(hf.obj); updaters.push((t) => { hf.update(t); hf.obj.visible = inShots(t, 10) && t > S0('s7') && t < E('seolah'); hf.obj.position.set(royF10.group.position.x, 2.15, royF10.group.position.z + 0.1); });
    const basket = P.basket(undefined, 0); if (basket) { at(basket, -0.6, 0, -3.5); g.add(basket); }
    const fishes = [0, 1].map((i) => { const f = P.fish('#7aa3b8'); at(f, -0.55 + i * 0.12, 0.32 + i * 0.05, -3.5, 0, 0, 0.3); g.add(f); return f; });
    const br = P.bear(); g.add(br.group); br.group.scale.setScalar(0.85);
    const bx = (t) => { const a = smooth((t - E('beruang') + 0.2) / 1.0), b = smooth((t - E('mengusir') + 0.05) / 1.3); return -5.5 + 4.4 * a - 6 * b; };
    updaters.push((t) => { const x = bx(t); br.group.position.set(x, 0, -3.3); br.group.rotation.y = t > E('mengusir') ? Math.PI : 0; br.group.visible = inShots(t, 10);
      br.legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 14 + i * 1.6) * 0.3 * (t > E('beruang') - 0.2 ? 1 : 0); });
      fishes[0].visible = t < E('mencuri') + 0.2; });
    const stolen = P.fish('#7aa3b8'); br.group.add(stolen); at(stolen, 1.15, 0.9, 0, 0, 0, 1.3); updaters.push((t) => { stolen.visible = t > E('mencuri') + 0.2; });
    counter(g, 7, 0.6, 3.05, -3.6, 's7', E('seolah'));
    popSign(g, sign(L.hair, 1.6, 0.32, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), 0.6, 2.67, -3.5, E('rambut7') - 0.05, E('beruang') - 0.2);
    popSign(g, sign(L.unlucky, 1.3, 0.36, {bg: '#2b2b33', fg: '#f2d24a', frame: '#f2d24a'}), 0.6, 2.6, -3.3, E('sial') - 0.15, E('tercatat'), (t) => inShots(t, 11));
    fx(g, FX.rain([0, -4, 14, 10], {from: cut(10), to: cut(12)}));
  }

  // ---------- the Guinness museum: two burnt hats (11) ----------
  {
    const g = addLoc('museum');
    under(g, '#14161c');
    g.add(P.room(8, 3.6, 7, {wall: '#3a3048', floor: '#6a5a50', wain: '#c9a25a', floorPaint: {planks: 0}}));
    popSign(g, sign(L.record, 3.2, 0.5, {bg: '#2f4f8a', fg: '#fff3df', frame: '#f2d24a', sub: L.recordSub}), 0, 2.75, -5.8, E('guinness') - 0.2);
    for (const [x, i] of [[-1.0, 0], [1.0, 1]]) {
      const d = P.glassDome(0.5); at(d, x, 0, -4.2); g.add(d);
      const h = P.rangerHat({burnt: true}); h.scale.setScalar(1.4); at(h, x, 1.07, -4.2, i * 0.6); g.add(h); updaters.push((t) => { h.rotation.y = t * 0.4 + i; });
      const sp = P.glowSprite('#fff2c8', 1.0); at(sp, x, 1.5, -4.2); g.add(sp);
    }
    popSign(g, sign(L.hats, 1.4, 0.28, {bg: '#fbf6ea', fg: '#351f22', frame: '#c9a25a'}), 0, 0.7, -3.7, E('topi') - 0.1);
    const roy11 = ch('roy', {seed: 16}, g, 0, -4.9, 0);
    roy11.act([{t: 0, pose: 'present', expr: 'proud'}, {t: E('selamat2') + 0.05, pose: 'cheer', expr: 'cheesy'}, {t: E('topi') + 0.05, pose: 'presentBoth', expr: 'proud'}]);
    fx(g, FX.confetti([0, 3.0, -3.5], E('guinness') + 0.05));
    fx(g, FX.glints([-1.0, 1.4, -4.0], E('topi'), {n: 18})); fx(g, FX.glints([1.0, 1.4, -4.0], E('topi') + 0.15, {n: 18, seed: 5}));
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
