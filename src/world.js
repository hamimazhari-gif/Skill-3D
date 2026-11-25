// All locations in one scene at different x offsets. Story: "Kalau semua serangga punah" (what if every insect vanished).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {space: 0, bedroom: 40, garden: 80, market: 120, choco: 160, pond: 200, forest: 240, stage: 280};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'nimble' (new for this video; round no-sleep face, tuft hair, thin brows, long legs).
export const CHAR_DESIGN = 'nimble';
const ANDI = {outfit: 'tshirt', jacket: '#4f9a8a', print: '#f2d24a', print2: '#d8413a', lower: '#3f5f8a', tie: '#4f9a8a', hair: '#2b2326', hairStyle: 'tuft', hat: 'none'};
const CAST = {
  andi: ANDI,
  andiP: {...ANDI, jacket: '#7fa6d8', print: null, lower: '#7fa6d8', hat: 'nightcap', hatColor: '#7fa6d8', hatColor2: '#fbf6ea'},
  seller: {outfit: 'farmer', jacket: '#e8a83a', lower: '#4a4a52', pocket: '#d8982a', tie: '#e8a83a', hair: '#2b2326', hairStyle: 'side', hat: 'none', towel: '#fbf6ea', mustache: 'thin'},
};

// Lighting: deep space for the Earth, a blue night bedroom (warm morning after), sunny garden and market,
// a warm cocoa shop, a pond in the afternoon, a gloomy green-grey forest when it stinks, a hero stage.
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
const nightL = {...LOOK_PRESETS.interiorCool, keyI: 1.3, hemiI: 0.8, key: '#a9c4ff', grade: {sat: 0.85, contrast: 1.05, tint: '#8aa0d8', tintAmt: 0.12, vignette: 0.55}};
const roomL = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
export const LOOK = {
  space: {...studio},
  bedroom: {keys: [{at: 0, ...nightL}, {at: 'surga', ...nightL, ...MOODS.joyful}, {at: 'cut3', ...roomL, ...MOODS.sad}, {at: 'cut11', ...roomL}]},
  garden: {keys: [{at: 0, ...LOOK_PRESETS.day}, {at: 'lebah', ...LOOK_PRESETS.day, ...MOODS.nostalgic}, {at: 'cut5', ...LOOK_PRESETS.day}]},
  market: {...LOOK_PRESETS.day, ...MOODS.sad},
  choco: {keys: [{at: 0, ...roomL}, {at: 'apa', ...roomL, ...MOODS.danger}]},
  pond: {keys: [{at: 0, ...LOOK_PRESETS.goldenHour}, {at: 'kelaparan', ...LOOK_PRESETS.goldenHour, ...MOODS.sad}]},
  forest: {...LOOK_PRESETS.overcast, grade: {sat: 0.8, contrast: 1.05, tint: '#9ab07a', tintAmt: 0.14, vignette: 0.5}},
  stage: {...studio, ...MOODS.joyful},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.punah, dur: 0.35, color: '#ffffff', strength: 0.45}, {t: EVt.surga, dur: 0.35, color: '#ffe9b0', strength: 0.35},
      {t: EVt.cokelat, dur: 0.3, color: '#ff8a7a', strength: 0.3}, {t: EVt.apa, dur: 0.3, color: '#ff8a7a', strength: 0.35}, {t: EVt.runtuh, dur: 0.3, color: '#ffffff', strength: 0.3},
      {t: EVt.bau, dur: 0.35, color: '#b8e07a', strength: 0.35}, {t: EVt.pahlawan, dur: 0.4, color: '#ffe9b0', strength: 0.45}, {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.punah, dur: 0.3, amp: 0.015}, {t: EVt.apa, dur: 0.4, amp: 0.02}, {t: EVt.runtuh + 0.2, dur: 0.4, amp: 0.02}],
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


  const bugs = []; // insects with flapping wings
  const bug = (g, ins, s, pos, vis) => { ins.group.scale.setScalar(s); g.add(ins.group); updaters.push((t) => { const p = pos(t); if (p) ins.group.position.set(p[0], p[1], p[2]); if (p && p[3] !== undefined) ins.group.rotation.y = p[3]; ins.flap(t); ins.group.visible = vis ? vis(t) : true; }); bugs.push(ins); return ins; };
  const label = (g, txt, x, y, z, t0, t1, o = {}) => popSign(g, sign(txt, o.w || 1.3, o.h || 0.32, {bg: o.bg || '#fff3df', fg: o.fg || '#351f22', frame: o.frame || '#351f22'}), x, y, z, t0, t1, o.vis);
  const problem = (g, n, x, y, z, k, until) => label(g, L['m' + n], x, y, z, E(k) - 0.1, until, {w: 1.2, h: 0.32, bg: '#2b2b33', fg: '#f2d24a', frame: '#f2d24a'});
  const flowers = (g, cx, cz, n, seed) => { const rr = (() => { let v = seed; return () => (v = (v * 9301 + 49297) % 233280) / 233280; })();
    for (let i = 0; i < n; i++) { const x = cx + (rr() - 0.5) * 3, z = cz + (rr() - 0.5) * 1.4; const st = cyl(0.015, 0.015, 0.5, '#4f8a4a', {hull: 0}); at(st, x, 0, z); g.add(st);
      const f = ball(0.08, ['#e8737a', '#f2d24a', '#fbf6ea', '#b07ad8'][i % 4], {sy: 0.5, hull: 0.006}); at(f, x, 0.52, z); g.add(f); } };

  // ---------- space: the Earth loses its insects (1) ----------
  {
    const g = addLoc('space');
    under(g, '#0c0f18');
    const bg = box(30, 14, 0.2, toon('#101526', {wear: false}), {edges: false}); at(bg, 0, -2, -9); g.add(bg);
    const stars = P.stars ? P.stars() : null; if (stars) { at(stars, 0, 0, -8); g.add(stars); }
    const gl = P.globe(1.15); at(gl.group, 0, 1.8, -3.6); g.add(gl.group); updaters.push((t) => { gl.group.rotation.y = t * 0.3; });
    const fl = FX.fireLight([0, 2.6, -1.8], {intensity: 2.0, dist: 6}); g.add(fl.obj); updaters.push((t) => fl.update(t));
    for (let i = 0; i < 16; i++) { const ins = i % 3 === 0 ? P.butterfly(['#e8737a', '#f2a93a', '#7fc4e8'][i % 3]) : P.bee();
      const t0 = E('punah') - 0.4 + i * 0.05, a0 = i / 16 * Math.PI * 2, rad = 1.55 + (i % 3) * 0.18, yy = (i % 5 - 2) * 0.35;
      bug(g, ins, 0.32, (t) => { const a = a0 + t * 0.9; return [Math.cos(a) * rad, 1.8 + yy + Math.sin(t * 3 + i) * 0.08, -3.6 + Math.sin(a) * rad, -a]; }, (t) => t < t0);
      fx(g, FX.glints([0, 0, 0], t0, {n: 6, seed: i}), (t) => t > t0 - 0.05 && t < t0 + 1.2); }
    label(g, L.gone, 0, 3.45, -3.2, E('punah') - 0.05, cut(2), {w: 1.9, h: 0.4, bg: '#d8413a', fg: '#fff3df', frame: '#8a1a1a'});
  }

  // ---------- the bedroom: no more mosquitoes (2), the bad feeling (3), "you may come back" (11) ----------
  {
    const g = addLoc('bedroom');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#c8d4e8', floor: '#a8784a', wain: '#7a8ab0'}));
    const win = sign('', 1.1, 0.9, {bg: '#9cc6e6', frame: '#fbf6ea', wear: false}); at(win, -1.6, 1.4, -4.88); g.add(win);
    const bed = P.bed({color: '#8a5a3a', sheet: '#7fa6c9'}); at(bed, 1.2, 0, -3.7, Math.PI / 2); g.add(bed);
    const ns = box(0.45, 0.5, 0.4, toon('#8a6242', {paint: {seed: 411}})); at(ns, -0.35, 0, -4.4); g.add(ns);
    const coil = P.mosquitoCoil(); g.add(coil);
    updaters.push((t) => { const u = Math.max(0, t - E('obat') - 0.05); const k = Math.min(u, 1.0); at(coil, -0.35 + k * 1.6, 0.5 + k * 2.2 - k * k * 2.6, -4.4 + k * 1.0, 0, k * 8, k * 6); coil.visible = !(u > 0.95) || t > cut(11); if (t > cut(11)) at(coil, -0.35, 0.5, -4.4); });
    const andiP = ch('andiP', {seed: 1}, g, -0.6, -3.0, 0.2); showWhen(andiP.group, (t) => inShots(t, 2) && t < E('hariPertama') - 0.1);
    andiP.act([{t: 0, pose: 'cheer', expr: 'excited'}, {t: E('nyamuk1') + 0.05, pose: 'armsUp', expr: 'toothy'}, {t: E('obat') - 0.15, pose: 'give', expr: 'cheesy'}]);
    andiP.act([{t: E('akhirnya'), action: 'jump', dur: 0.5}, {t: E('tidur') - 0.1, action: 'hop', dur: 0.4}]);
    speak(andiP, 1, [[0, 'excited', 'cheer'], [0.35, 'toothy', 'armsUp'], [0.7, 'cheesy', 'give']]);
    const sleeper = ch('andiP', {seed: 2, noFace: true}, g, 2.55, -3.7, 0); showWhen(sleeper.group, (t) => inShots(t, 2) && t >= E('hariPertama') - 0.1);
    updaters.push(() => { sleeper.group.rotation.z = Math.PI / 2; sleeper.group.position.y = 0.86; });
    sleeper.act([{t: 0, pose: 'limp', expr: 'sleep'}, {t: E('surga'), pose: 'limp', expr: 'happy'}]);
    const blanket = box(1.4, 0.24, 1.25, toon('#7fa6c9', {paint: {seed: 412}}), {hull: 0.01}); at(blanket, 1.95, 0.52, -3.7); g.add(blanket); showWhen(blanket, (t) => inShots(t, 2) && t >= E('hariPertama') - 0.1);
    label(g, L.zzz, 1.45, 1.45, -3.5, E('hariPertama'), cut(3), {w: 0.8, bg: '#2b2b33', fg: '#fbf6ea', frame: '#fbf6ea', vis: (t) => inShots(t, 2)});
    label(g, L.heaven, 1.0, 1.95, -3.5, E('surga') - 0.05, cut(3), {w: 1.2, h: 0.38, bg: '#f2d24a', vis: (t) => inShots(t, 2)});
    fx(g, FX.glints([0.9, 1.4, -3.4], E('surga'), {n: 30}), (t) => inShots(t, 2));
    // the next morning: something feels wrong
    const andi3 = ch('andi', {seed: 3}, g, -1.1, -3.4, 0.25); showWhen(andi3.group, (t) => inShots(t, 3) || inShots(t, 11));
    andi3.act([{t: cut(3), pose: 'hips', expr: 'happy'}, {t: E('tapi') + 0.1, pose: 'idle', expr: 'confused'}, {t: E('bertahan') + 0.05, pose: 'chin', expr: 'worried'},
      {t: cut(11), pose: 'hips', expr: 'thinking'}, {t: E('boleh') - 0.1, pose: 'present', expr: 'happy'}, {t: E('jangan') - 0.05, pose: 'point', expr: 'smug'}]);
    speak(andi3, 20, [[0, 'thinking', 'hips'], [0.35, 'happy', 'present'], [0.65, 'smug', 'point']]);
    const mq = bug(g, P.mosquito(), 0.35, (t) => { const u = smooth((t - E('yaSudah') + 0.3) / 1.0); const a = t * 2.2; return [-0.2 + Math.cos(a) * 0.35 - (1 - u) * 3, 2.0 + Math.sin(t * 5) * 0.08, -3.1 + Math.sin(a) * 0.25, -a]; }, (t) => inShots(t, 11));
    label(g, L.ok, -1.1, 2.75, -3.2, E('boleh') - 0.1, 1e9, {w: 1.5, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a', vis: (t) => inShots(t, 11)});
    label(g, L.noBite, -1.1, 2.4, -3.15, E('jangan') - 0.1, 1e9, {w: 1.5, bg: '#d8413a', fg: '#fff3df', frame: '#8a1a1a', vis: (t) => inShots(t, 11)});
  }

  // ---------- the garden: plants without fruit (4) ----------
  {
    const g = addLoc('garden');
    under(g, '#8fae6a', 120);
    const grass = box(40, 0.03, 30, toon('#8fae6a', {paint: {seed: 421, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -8); g.add(grass);
    g.add(P.hills('#7fa05a'));
    for (let i = 0; i < 6; i++) { const tr = P.tree({seed: 430 + i, h: 2.6}); at(tr, -4.5 + i * 1.8, 0, -6 - (i % 2) * 1.2); g.add(tr); }
    flowers(g, 0.4, -3.4, 30, 7);
    const andi = ch('andi', {seed: 4}, g, -0.75, -2.6, 0.3);
    andi.act([{t: cut(4), pose: 'idle', expr: 'confused'}, {t: E('berbuah') + 0.05, pose: 'shrug', expr: 'confused'}, {t: E('lebah') + 0.1, pose: 'point', expr: 'surprised'}, {t: E('bunga') + 0.1, pose: 'idle', expr: 'happy'}]);
    problem(g, 1, 0.55, 2.65, -3.4, 'masalah1', E('lebah') - 0.12);
    label(g, L.noFruit, 0.55, 2.28, -3.35, E('berbuah') - 0.1, E('lebah') - 0.12, {w: 1.5, fg: '#d8413a'});
    const b1 = bug(g, P.bee(), 0.3, (t) => { const u = t - E('lebah'); return [0.2 + Math.cos(u * 1.4) * 0.9, 0.85 + Math.sin(u * 5) * 0.12, -3.3 + Math.sin(u * 1.4) * 0.5, -u * 1.4]; }, (t) => inShots(t, 4) && t > E('lebah') - 0.1);
    const b2 = bug(g, P.butterfly('#f2a93a'), 0.35, (t) => { const u = t - E('kupu'); return [1.1 + Math.cos(-u) * 0.7, 1.0 + Math.sin(u * 3) * 0.15, -3.6 + Math.sin(-u) * 0.4, u]; }, (t) => inShots(t, 4) && t > E('kupu') - 0.1);
    fx(g, FX.glints([0.3, 0.7, -3.3], E('menyerbuki'), {n: 26, color: '#f2d24a'}), (t) => inShots(t, 4));
  }

  // ---------- the fruit market: scarce fruit (5) ----------
  {
    const g = addLoc('market');
    under(g, '#c9b48a', 120);
    const ground = box(40, 0.03, 30, toon('#c9b48a', {paint: {seed: 441, stains: 30}}), {edges: false}); at(ground, 0, -0.03, -8); g.add(ground);
    const st = P.stall('BUAH', {w: 2.4}); at(st, 0, 0, -3.2); g.add(st);
    for (let i = 0; i < 4; i++) { const c = P.crate ? P.crate() : box(0.5, 0.3, 0.4, '#a8784a'); c.scale.setScalar(0.8); at(c, -0.9 + i * 0.6, 0.85, -3.4); g.add(c); }
    const seller = ch('seller', {seed: 5}, g, 0.4, -3.9, -0.05);
    seller.act([{t: cut(5), pose: 'shrug', expr: 'sad'}, {t: E('langka') + 0.05, pose: 'facepalm', expr: 'cry'}, {t: E('tomat') + 0.1, pose: 'shrug', expr: 'tired'}]);
    const andi = ch('andi', {seed: 6}, g, -1.05, -2.2, 0.5);
    andi.act([{t: cut(5), pose: 'point', expr: 'confused'}, {t: E('langka') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('semangka') + 0.1, pose: 'headHold', expr: 'grimace'}]);
    [['apel', P.fruit('apple')], ['mangga', P.fruit('mango')], ['semangka', P.watermelon(0.16)], ['tomat', P.fruit('tomato')]].forEach(([k, f], i) => {
      const x = -0.9 + i * 0.6; popSign(g, f, x, 1.05, -2.6, E(k) - 0.05);
      label(g, L[k], x, 1.55, -2.6, E(k) - 0.05, 1e9, {w: 0.55, h: 0.18});
      label(g, L.scarce, x, 0.8, -2.55, E(k) + 0.25, 1e9, {w: 0.55, h: 0.18, bg: '#d8413a', fg: '#fff3df', frame: '#8a1a1a'}); });
  }

  // ---------- the cocoa shop: chocolate almost gone (6), "mosquitoes, come back!" (7) ----------
  {
    const g = addLoc('choco');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#e8d0b0', floor: '#8a5a3a', wain: '#6a3a2a'}));
    label(g, L.shop, 0.5, 2.6, -4.85, -1, 1e9, {w: 1.8, h: 0.4, bg: '#5a2f1f', fg: '#f2d24a', frame: '#3a1a10'});
    for (let r = 0; r < 3; r++) { const sh = box(2.2, 0.05, 0.4, toon('#7a4a32', {paint: {seed: 450 + r}})); at(sh, 0.9, 0.7 + r * 0.55, -4.6); g.add(sh); }
    const bars = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const b = box(0.22, 0.32, 0.05, ['#5a2f1f', '#8a4a2a', '#d8413a'][(i + r) % 3], {hull: 0.005}); at(b, 0.1 + i * 0.32, 0.76 + r * 0.55, -4.5); g.add(b); bars.push(b); }
    updaters.push((t) => bars.forEach((b, i) => { const t0 = E('hilang') - 0.2 + i * 0.04; b.visible = t < t0; }));
    fx(g, FX.glints([0.9, 1.4, -4.4], E('hilang') - 0.2, {n: 20}));
    const pot = cyl(0.3, 0.25, 0.4, '#b5543c'); at(pot, -2.2, 0, -3.9); g.add(pot);
    const ct = P.cacaoTree({h: 2.1, seed: 9}); at(ct, -2.2, 0.35, -3.9); g.add(ct);
    const big = box(0.5, 0.75, 0.08, '#5a2f1f', {hull: 0.01}); const bigW = box(0.52, 0.4, 0.09, '#d8413a', {hull: 0.008}); const bigG = new THREE.Group(); at(big, 0, 0, 0); at(bigW, 0, 0.18, 0); bigG.add(big, bigW); g.add(bigG);
    updaters.push((t) => { bigG.visible = inShots(t, 6) && t > E('cokelat') - 0.1 && t < E('hilang') + 0.4; bigG.scale.setScalar(pop(t, E('cokelat') - 0.1, 0.35)); at(bigG, 0.4, 1.5 + Math.sin(t * 2) * 0.03, -3.2, Math.sin(t) * 0.2); });
    fx(g, FX.smoke([0.4, 1.8, -3.2], E('hilang') + 0.35, {n: 8, every: 0.03, life: 0.8, size: 0.3, grow: 2, rise: 0.3, color: '#fbf6ea', opacity: 0.7}), (t) => inShots(t, 6));
    problem(g, 2, 0.4, 2.75, -3.4, 'masalah2', cut(7));
    label(g, L.chocoGone, 0.4, 2.4, -3.35, E('cokelat') - 0.05, E('kakao'), {w: 2.0, fg: '#d8413a'});
    const mid = bug(g, P.mosquito(), 0.16, (t) => [-2.0 + Math.cos(t * 3) * 0.25, 1.2 + Math.sin(t * 6) * 0.06, -3.6 + Math.sin(t * 3) * 0.2, -t * 3], (t) => inShots(t, 6) && t > E('agas') - 0.15 && t < E('hilang') + 99 && t < E('kopi'));
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 32), new THREE.MeshBasicMaterial({color: '#f2d24a'})); g.add(ring); updaters.push((t) => { ring.visible = inShots(t, 6) && t > E('agas') - 0.1 && t < E('kopi'); ring.position.set(-2.0, 1.2, -3.3); ring.scale.setScalar(pop(t, E('agas') - 0.1, 0.3)); });
    label(g, L.midge, -2.0, 1.75, -3.3, E('agas') - 0.1, E('kopi'), {w: 0.7, bg: '#f2d24a'});
    const cup = P.mug('#fbf6ea'); cup.scale.setScalar(2.2); g.add(cup); updaters.push((t) => { cup.visible = inShots(t, 6) && t > E('kopi') - 0.1; at(cup, 0.4, 1.2, -3.2); cup.scale.setScalar(2.2 * pop(t, E('kopi') - 0.1, 0.35)); });
    fx(g, FX.smoke([0.4, 1.55, -3.2], E('kopi'), {n: 10, every: 0.2, life: 1.4, size: 0.15, grow: 2, rise: 0.5, color: '#fbf6ea', opacity: 0.5}), (t) => inShots(t, 6));
    label(g, L.coffee, 0.4, 2.4, -3.35, E('kopi') - 0.05, cut(7), {w: 2.0, fg: '#8a4a2a'});
    const andi = ch('andi', {seed: 7}, g, -0.9, -2.8, 0.3);
    andi.act([{t: cut(6), pose: 'idle', expr: 'happy'}, {t: E('menyakitkan') + 0.05, pose: 'idle', expr: 'worried'}, {t: E('hilang') + 0.1, pose: 'headHold', expr: 'shocked'},
      {t: E('kakao') + 0.1, pose: 'point', expr: 'confused'}, {t: E('kopi') + 0.1, pose: 'headHold', expr: 'cry'},
      {t: E('apa') - 0.1, pose: 'headHold', expr: 'scream'}, {t: E('kembalilah') - 0.25, pose: 'armsUp', expr: 'cry'}]);
    andi.act([{t: E('hilang'), action: 'jump', dur: 0.5}, {t: E('apa'), action: 'jump', dur: 0.5}, {t: E('kembalilah'), action: 'tremble', dur: 1.0}]);
    speak(andi, 11, [[0, 'scream', 'headHold'], [0.35, 'furious', 'headHold'], [0.65, 'cry', 'armsUp']]);
  }

  // ---------- the pond: the food chain collapses (8) ----------
  {
    const g = addLoc('pond');
    under(g, '#8fae6a', 120);
    const grass = box(40, 0.03, 30, toon('#8fae6a', {paint: {seed: 461, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -8); g.add(grass);
    const pond = cyl(1.8, 1.8, 0.04, toon('#5a8ab0', {wear: false}), {seg: 32, hull: 0.02}); pond.scale.z = 0.6; at(pond, -0.2, 0.0, -3.4); g.add(pond);
    for (const [x, z] of [[-0.9, -3.2], [0.4, -3.7], [-0.2, -2.9]]) { const lp = cyl(0.22, 0.22, 0.02, '#4f8a4a', {seg: 16, hull: 0.006}); at(lp, x, 0.04, z); g.add(lp); }
    for (let i = 0; i < 6; i++) { const tr = P.tree({seed: 470 + i, h: 2.6}); at(tr, -4.5 + i * 1.8, 0, -6.5 - (i % 2)); g.add(tr); }
    const tower = P.chainTower(L.chain); at(tower.group, 2.1, 0, -4.2); g.add(tower.group);
    updaters.push((t) => tower.fall(smooth((t - E('runtuh') + 0.1) / 1.1)));
    fx(g, FX.dust([2.6, 0.1, -4.0], E('runtuh') + 0.6, {n: 10}));
    problem(g, 3, -0.2, 2.75, -3.4, 'masalah3', E('burung'));
    const animals = [['burung', P.bird(), -1.6, -2.6, 0.9], ['katak', P.frog(), -0.9, -3.2, 0.9], ['kadal', P.lizard(), 0.9, -2.6, 0.9], ['ikan', P.fish('#e8a83a'), 0.1, -3.1, 1.5]];
    animals.forEach(([k, a, x, z, s], i) => { a.scale.setScalar(s); at(a, x, k === 'ikan' ? 0.15 : 0.04, z, k === 'kadal' ? -2.6 : 0.5); g.add(a); a.visible = false;
      updaters.push((t) => { a.visible = t > E(k) - 0.05; const p = pop(t, E(k) - 0.05, 0.35); const sad = smooth((t - E('kelaparan')) / 0.5); a.scale.setScalar(s * p * (1 - 0.15 * sad)); a.position.y = (k === 'ikan' ? 0.15 + Math.abs(Math.sin(t * 3)) * 0.2 * (1 - sad) : 0.04); });
      label(g, L.hungry, x, 0.95 + (i % 2) * 0.25, z + 0.1, E('kelaparan') - 0.05 + i * 0.08, cut(9), {w: 0.75, h: 0.22, fg: '#d8413a'}); });
    label(g, L.threat, 2.1, 2.6, -3.9, E('terancam') - 0.1, cut(9), {w: 1.6, bg: '#d8413a', fg: '#fff3df', frame: '#8a1a1a'});
  }

  // ---------- the forest: nature's rubbish piles up (9) ----------
  {
    const g = addLoc('forest');
    under(g, '#6f8a4a', 120);
    const ground = box(40, 0.03, 30, toon('#7a7a4a', {paint: {seed: 481, stains: 30}}), {edges: false}); at(ground, 0, -0.03, -8); g.add(ground);
    for (let i = 0; i < 10; i++) { const tr = P.tree({seed: 490 + i, h: 3.0}); at(tr, -5 + i * 1.1, 0, -5.5 - (i % 3) * 1.2); g.add(tr); }
    const piles = [[-1.6, -3.4, 0.9, 1], [1.4, -3.6, 1.0, 2], [0.2, -4.6, 1.1, 3], [-2.6, -4.8, 0.8, 4]].map(([x, z, r, sd]) => { const p = P.leafPile(r, sd); at(p, x, 0, z); g.add(p); return p; });
    updaters.push((t) => piles.forEach((p, i) => { const u = smooth((t - E('menumpuk') + 0.3 - i * 0.2) / 1.2) + smooth((t - E('tanpa4')) / 1.5) * 0.8; p.scale.set(1 + u * 0.3, 0.3 + u * 1.6, 1 + u * 0.3); }));
    const poops = [[0.8, -2.8], [-0.5, -3.1], [2.0, -2.9]].map(([x, z], i) => { const p = P.poop(); at(p, x, 0, z); g.add(p); updaters.push((t) => { p.visible = t > E('kumbang') + 0.2 + i * 0.15; p.scale.setScalar(pop(t, E('kumbang') + 0.2 + i * 0.15, 0.3)); }); return p; });
    problem(g, 4, 0, 2.75, -3.4, 'masalah4', E('semut'));
    label(g, L.pile, 0, 2.4, -3.35, E('menumpuk') - 0.1, E('semut'), {w: 2.1, fg: '#8a5a2a'});
    const helpers = [['semut', P.ant(), -0.6], ['rayap', P.ant('#e8d8b0'), 0.1], ['kumbang', P.beetle(), 0.8]].map(([k, ins, x], i) => {
      bug(g, ins, 0.5, (t) => [x, 0.05, -2.6, Math.sin(t * 2 + i) * 0.4], (t) => inShots(t, 9) && t > E(k) - 0.05 && t < E('tanpa4'));
      label(g, k.toUpperCase(), x, 0.7, -2.55, E(k) - 0.05, E('tanpa4'), {w: 0.7, h: 0.2}); });
    fx(g, FX.smoke([0, 0.4, -3.6], E('bau') - 0.3, {n: 24, every: 0.08, life: 1.6, size: 0.4, grow: 2, rise: 0.5, drift: 0.4, color: '#9ad04a', opacity: 0.45}));
    label(g, L.smell, 1.3, 2.3, -3.2, E('bau') - 0.05, cut(10), {w: 0.9, h: 0.36, bg: '#9ad04a'});
    const andi = ch('andi', {seed: 8}, g, -0.9, -2.4, 0.3); showWhen(andi.group, (t) => t > E('tanpa4') - 0.3);
    andi.act([{t: 0, pose: 'idle', expr: 'confused'}, {t: E('bau') - 0.1, pose: 'shh', expr: 'disgusted'}]); andi.act([{t: E('bau'), action: 'tremble', dur: 1.2}]);
  }

  // ---------- the stage: hidden heroes (10), the question (12) ----------
  {
    const g = addLoc('stage');
    under(g, '#14161c');
    const fl0 = box(30, 0.04, 14, toon('#262a36', {paint: {seed: 501}}), {edges: false}); at(fl0, 0, -0.03, -3); g.add(fl0);
    const wall = box(30, 9, 0.2, toon('#1e2840', {paint: {seed: 502}}), {edges: false}); at(wall, 0, 0, -6.2); g.add(wall);
    const heights = [0.5, 0.8, 0.65, 0.4]; const kinds = [P.ant(), P.bee(), P.butterfly('#7fc4e8'), P.beetle()];
    kinds.forEach((ins, i) => { const x = -1.35 + i * 0.9; const pd = box(0.8, heights[i], 0.8, toon(['#c9a25a', '#e8c35a', '#c9a25a', '#b08454'][i], {paint: {seed: 510 + i}})); at(pd, x, 0, -3.6); g.add(pd);
      ins.group.add(P.cape(['#d8413a', '#3f5f8a', '#7a5aa8', '#3fb06a'][i]));
      bug(g, ins, 0.55, (t) => [x, heights[i] + (i === 1 || i === 2 ? 0.25 + Math.sin(t * 3 + i) * 0.05 : 0.02), -3.55, Math.sin(t * 1.5 + i) * 0.3], (t) => t > E('ternyata') - 0.2 + i * 0.12);
      const sp = P.glowSprite('#fff2c8', 1.3); at(sp, x, heights[i] + 0.6, -3.7); g.add(sp); });
    label(g, L.hero, 0, 2.65, -3.4, E('pahlawan') - 0.1, cut(11), {w: 2.3, h: 0.42, bg: '#f2d24a'});
    fx(g, FX.confetti([0, 3.0, -3.0], E('pahlawan')));
    fx(g, FX.glints([0, 1.2, -3.4], E('hidup'), {n: 30}));
    const andi = ch('andi', {seed: 9}, g, 0, -2.2, 0); showWhen(andi.group, (t) => inShots(t, 12));
    andi.act([{t: 0, pose: 'present', expr: 'happy'}, {t: E('berjasa') - 0.1, pose: 'shrug', expr: 'thinking'}, {t: E('tulis') - 0.05, pose: 'point', expr: 'cheesy'}]);
    speak(andi, 21, [[0, 'thinking', 'present']]); speak(andi, 22, [[0, 'cheesy', 'point']]);
    label(g, L.question, 0, 2.95, -3.0, E('seranggaApa') - 0.1, 1e9, {w: 2.2, h: 0.4, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, 0, 2.52, -2.95, E('tulis') - 0.1, 1e9, {w: 1.7, h: 0.36, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([0, 3.0, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
