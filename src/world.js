// All locations in one scene at different x offsets. Story: "Kenapa laut asin" (rain, rivers, evaporation, the salt stays).
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {pantai: 0, darat: 40, laut: 80, kota: 120};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'sunny' (new for this video; round no-sleep face, tuft hair, thick brows).
export const CHAR_DESIGN = 'sunny';
const CAST = {
  bimo: {outfit: 'hawaii', jacket: '#f2a93a', lower: '#3f8ad8', tie: '#f2a93a', pocket: '#f2a93a', hair: '#2b2326', hairStyle: 'tuft', hat: 'none'},
  kurir: {outfit: 'tshirt', jacket: '#3fb06a', print: '#fff3df', print2: '#f2d24a', lower: '#2a3448', tie: '#3fb06a', hair: '#2b2326', hat: 'cap', hatColor: '#f2d24a', hatColor2: '#d8a82a'},
  ibu: {hairStyle: 'hijab', hijab: '#4f8fc8', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#e8737a', print: '#fff3df', print2: '#8a2a3a', lower: '#e8737a', tie: '#e8737a', round: true},
  anak: {outfit: 'tshirt', jacket: '#7fc4e8', print: '#fff3df', print2: '#f2d24a', lower: '#3a4050', tie: '#7fc4e8', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
};

const beachL = {...LOOK_PRESETS.noon, near: 30, far: 140};
export const LOOK = {
  pantai: {...beachL},
  darat: {keys: [{at: 0, ...LOOK_PRESETS.day, near: 30, far: 140}, {at: 'cut3', ...LOOK_PRESETS.overcast, near: 30, far: 140}, {at: 'cut4', ...LOOK_PRESETS.day, near: 30, far: 140}]},
  laut: {...LOOK_PRESETS.goldenHour, near: 30, far: 160},
  kota: {...LOOK_PRESETS.day, near: 40, far: 200},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.asin, dur: 0.3, color: '#ffffff', strength: 0.3}, {t: EVt.melarutkan, dur: 0.3, color: '#ffe9b0', strength: 0.25}, {t: EVt.paket, dur: 0.3, color: '#ffe9b0', strength: 0.25},
      {t: EVt.tertinggal, dur: 0.3, color: '#ffffff', strength: 0.3}, {t: EVt.seratus, dur: 0.35, color: '#ffffff', strength: 0.4}, {t: EVt.lantai, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.asin, dur: 0.3, amp: 0.015}, {t: EVt.gunung, dur: 0.4, amp: 0.015}],
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


  const label = (g, txt, x, y, z, t0, t1, o = {}) => popSign(g, sign(txt, o.w || 1.3, o.h || 0.32, {bg: o.bg || '#fff3df', fg: o.fg || '#351f22', frame: o.frame || '#351f22', ...(o.sub ? {sub: o.sub} : {})}), x, y, z, t0, t1, o.vis);
  const sea = (g, x, z, w, d, c = '#3f8ac8') => { const m = box(w, 0.04, d, toon(c, {paint: {seed: 961, stripes: {n: 30, color: '#5aa0d8'}}}), {edges: false}); at(m, x, -0.02, z); g.add(m); return m; };
  const talkOf = (si) => (t) => { const S = T.S[si]; const segs = S.voiced || [[S.start, S.end]]; return segs.some(([a, b]) => t > a && t < b) ? Math.abs(Math.sin(t * 18)) : 0; };

  // ---------- the beach: a mouthful of sea water (1), "take only what you need" (11), the question (12) ----------
  {
    const g = addLoc('pantai');
    under(g, '#e8d4a0', 200);
    const sand = box(60, 0.03, 30, toon('#e8d4a0', {paint: {seed: 971, stains: 20}}), {edges: false}); at(sand, 0, -0.03, 6); g.add(sand);
    sea(g, 0, -20, 80, 34);
    for (let i = 0; i < 3; i++) { const p = P.coconutPalm({seed: 980 + i}).group; at(p, -4 + i * 8.5, 0, -1.5 - (i % 2)); g.add(p); }
    const bimo = ch('bimo', {seed: 1}, g, -0.2, -3.2, 0.1);
    bimo.act([{t: 0, pose: 'cheer', expr: 'happy'}, {t: E('menelan') - 0.1, pose: 'drink', expr: 'grimace'}, {t: E('asin') - 0.05, pose: 'headHold', expr: 'disgusted'}, {t: E('truk') + 0.05, pose: 'point', expr: 'furious'},
      {t: cut(11), pose: 'idle', expr: 'happy'}, {t: cut(12), pose: 'shrug', expr: 'cheesy'}, {t: E('komentar') - 0.15, pose: 'point', expr: 'cheesy'}]);
    bimo.act([{t: E('asin'), action: 'jump', dur: 0.5}]); speak(bimo, 1, [[0, 'disgusted', 'headHold'], [0.45, 'furious', 'point']]);
    walkPath(bimo, [[0, -0.2, -3.2], [cut(11) - 0.02, -0.2, -3.2], [cut(11), 1.6, -3.4]]);
    fx(g, FX.splash([-0.2, 0.2, -3.0], 0.4, {n: 40}), (t) => inShots(t, 1));
    label(g, L.salty, 0.1, 2.45, -3.0, E('asin') - 0.05, cut(2), {w: 0.9, h: 0.36, bg: '#fbfbf8', fg: '#d8312a'});
    const ibu = ch('ibu', {seed: 2}, g, -0.9, -3.2, 0.3), anak = ch('anak', {seed: 3, scale: 0.72}, g, 0.3, -3.0, -0.2);
    [ibu, anak].forEach((c) => showWhen(c.group, (t) => inShots(t, 11) || inShots(t, 12)));
    const bk = P.bucket({color: '#e8737a'}); held(anak, bk, {y: -0.3, z: 0.08}); const pile = ball(0.17, '#fbfbf8', {sy: 0.7, hull: 0.006}); pile.position.y = 0.32; bk.add(pile);
    ibu.act([{t: 0, pose: 'hips', expr: 'smug'}, {t: E('secukupnya'), pose: 'point', expr: 'happy'}, {t: E('jangan'), pose: 'stop', expr: 'annoyed'}]); speak(ibu, 24, [[0, 'happy', 'point'], [0.55, 'annoyed', 'stop']]);
    anak.act([{t: 0, pose: 'carry', expr: 'cheesy'}, {t: E('jangan') + 0.2, pose: 'carry', expr: 'nervous'}]);
    const mound = cone(1.0, 0.7, toon('#fbfbf8', {wear: false}), {seg: 14, hull: 0.01}); at(mound, 1.6, 0, -4.2); g.add(mound); showWhen(mound, (t) => inShots(t, 11) || inShots(t, 12));
    label(g, L.question, 0.1, 2.6, -2.9, E('fakta') - 0.1, 1e9, {w: 2.0, h: 0.38, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, 0.1, 2.2, -2.85, E('komentar') - 0.1, 1e9, {w: 1.7, h: 0.32, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([-0.2, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the land: a fresh river (2), rain on the rocks (3), the river courier (4), fresh water (5) ----------
  {
    const g = addLoc('darat');
    under(g, '#8fae6a', 200);
    const grass = box(80, 0.03, 50, toon('#8fae6a', {paint: {seed: 991, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -14); g.add(grass);
    const river = box(80, 0.04, 2.2, toon('#7fc4e8', {paint: {seed: 992, stripes: {n: 40, color: '#9ad4f0'}}}), {edges: false}); at(river, 0, -0.01, -4.2); g.add(river);
    const mt = P.mountain(6, 4.5); at(mt, -6, 0, -12); g.add(mt); const mt2 = P.mountain(4.5, 3.5, {seed: 952}); at(mt2, -1.5, 0, -14); g.add(mt2);
    for (let i = 0; i < 5; i++) { const r = ball(0.4 + (i % 2) * 0.2, toon('#8a8a90', {paint: {seed: 993 + i}}), {sy: 0.7, hull: 0.012}); at(r, -3.2 + i * 0.9, 0, -6.4 - (i % 2) * 0.4); g.add(r); }
    const bimo = ch('bimo', {seed: 4}, g, 0.4, -2.6, -0.1); showWhen(bimo.group, (t) => inShots(t, 2) || inShots(t, 5));
    bimo.act([{t: 0, pose: 'drink', expr: 'happy'}, {t: E('tawar'), pose: 'drink', expr: 'proud'}, {t: E('mengalir') + 0.1, pose: 'point', expr: 'thinking'}, {t: E('beda'), pose: 'shrug', expr: 'confused'},
      {t: cut(5), pose: 'shrug', expr: 'confused'}, {t: E('diganti'), pose: 'point', expr: 'thinking'}, {t: E('lidah'), pose: 'drink', expr: 'happy'}]);
    label(g, L.fresh, 0.4, 2.3, -2.4, E('tawar') - 0.05, cut(3), {w: 0.9, bg: '#7fc4e8', vis: (t) => inShots(t, 2)});
    // rain on the rocks; minerals glint as they dissolve
    fx(g, FX.rain([-2, -7, 10, 6], {from: cut(3), to: cut(4)}));
    for (let i = 0; i < 5; i++) fx(g, FX.glints([-3.2 + i * 0.9, 0.4, -6.2], E('melarutkan') + i * 0.15, {n: 10, color: '#fbfbf8', seed: i}), (t) => inShots(t, 3));
    label(g, L.acid, -1.4, 2.6, -6.0, E('asam') - 0.1, cut(4), {w: 1.8, bg: '#bfe4ff'});
    label(g, L.mineral, -1.4, 2.2, -5.95, E('melarutkan') - 0.1, cut(4), {w: 1.6, bg: '#fbfbf8'});
    // the courier on a raft down the river
    const rx = (t) => -3 + 7 * smooth((t - cut(4)) / (cut(5) - cut(4)));
    const rf = P.raft(); g.add(rf); const kur = ch('kurir', {seed: 5}, g, 0, -4.2, 0.2); const bx = P.cardboardBox('GARAM', {w: 0.5, h: 0.35, d: 0.4});
    g.add(bx); updaters.push((t) => { const x = rx(t); at(rf, x, 0, -4.2); kur.group.position.set(x - 0.2, 0.16, -4.2); at(bx, x + 0.3, 0.16, -4.2); rf.visible = bx.visible = inShots(t, 4); });
    showWhen(kur.group, (t) => inShots(t, 4)); kur.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('paket'), pose: 'present', expr: 'cheesy'}, {t: E('tanda'), pose: 'give', expr: 'excited'}]);
    speak(kur, 9, [[0, 'cheesy', 'present'], [0.5, 'excited', 'give']]);
    const pkts = Array.from({length: 4}, (_, i) => { const c = P.saltCrystal(0.6); g.add(c); updaters.push((t) => { at(c, rx(t) - 1.2 - i * 0.6, 0.06, -4.0 + (i % 2) * 0.3); c.visible = inShots(t, 4); c.rotation.y = t + i; }); return c; });
    label(g, L.little, 0.8, 2.45, -2.4, E('sedikit') - 0.1, cut(6), {w: 1.9, bg: '#fbfbf8', vis: (t) => inShots(t, 5)});
    const few = [0, 1].map((i) => { const c = P.saltCrystal(0.35); g.add(c); updaters.push((t) => { at(c, 1.4 + i * 0.6 + ((t * 0.6) % 2), 0.05, -4.0); c.visible = inShots(t, 5); }); return c; });
    fx(g, FX.rain([0, -5, 8, 5], {from: E('diganti') - 0.2, to: E('sedikit')}));
  }

  // ---------- the sea: evaporation (6), the salt stays (7), the cycle and the volcano (8) ----------
  {
    const g = addLoc('laut');
    under(g, '#3f8ac8', 200);
    sea(g, 0, -10, 80, 40);
    const sun = P.sunRays(1.0); at(sun, 3.5, 6, -16); g.add(sun);
    const drops = Array.from({length: 8}, (_, i) => { const d = P.droplet(0.9); g.add(d); updaters.push((t) => { const t0 = E('matahari') + i * 0.25; const u = Math.max(0, t - t0); d.visible = (inShots(t, 6) || inShots(t, 7)) && u > 0 && u < 6; at(d, -1.6 + i * 0.45, 0.05 + u * 0.9, -3.6 - (i % 3) * 0.4); d.rotation.y = Math.sin(t * 2 + i) * 0.4; }); return d; });
    const clouds = [[-1.6, 7.5, -7.5], [1.8, 8.0, -8.5]].map(([x, y, z], i) => { const c = P.cloud(0.6, 5 + i); at(c, x, y, z); g.add(c); updaters.push((t) => { c.visible = t > E('awan') - 0.2; c.scale.setScalar(pop(t, E('awan') - 0.2, 0.5)); }); return c; });
    const salt = P.saltCrystal(1.4); at(salt, 0.2, 0.05, -2.9); g.add(salt);
    const others = [[-0.9, -3.4], [1.1, -3.6], [-0.3, -4.1]].map(([x, z]) => { const c = P.saltCrystal(0.8); at(c, x, 0.05, z, x); g.add(c); return c; });
    updaters.push((t) => { const on = t > E('garamnya') - 0.2 && t < cut(9); salt.visible = on; others.forEach((c) => { c.visible = on; }); salt.position.y = 0.05 + (talkOf(17)(t) > 0 ? Math.abs(Math.sin(t * 9)) * 0.05 : 0); salt.rotation.z = Math.sin(t * 2) * 0.08; });
    label(g, L.evap, -0.2, 3.1, -3.6, E('matahari') - 0.1, E('garamnya'), {w: 1.1, bg: '#bfe4ff'});
    label(g, L.stays, 0.2, 1.75, -3.6, E('tertinggal') - 0.1, cut(8), {w: 1.7, bg: '#fbfbf8'});
    // the cycle (8): rain back over the far mountains, a volcano under the sea
    const vol = P.mountain(2.2, 1.8, {volcano: true, color: '#5a4a4a', seed: 953}); at(vol, 2.6, -1.4, -5.5); g.add(vol); showWhen(vol, (t) => t > E('gunung') - 0.3);
    fx(g, FX.smoke([2.6, 0.8, -5.5], E('gunung'), {n: 20, every: 0.12, life: 1.6, size: 0.4, grow: 2, rise: 1.2, color: '#9a9aa2', opacity: 0.55}), (t) => inShots(t, 8));
    fx(g, FX.sparks([2.6, 0.8, -5.5], E('gunung') + 0.1, {n: 40, color: '#ffb03a'}), (t) => inShots(t, 8));
    fx(g, FX.rain([-1, -6, 8, 5], {from: E('turun') - 0.2, to: E('jutaan') + 1.5}));
    label(g, L.years, -0.8, 3.0, -3.6, E('jutaan') - 0.1, E('gunung'), {w: 1.4, bg: '#f2d24a'});
    label(g, L.volcano, 2.0, 2.6, -4.4, E('gunung') - 0.1, cut(9), {w: 1.8, bg: '#e8737a', fg: '#fff3df', frame: '#8a2a36'});
  }

  // ---------- the city: 150 m of salt (9), as high as a 50-floor building (10) ----------
  {
    const g = addLoc('kota');
    under(g, '#8fae6a', 300);
    const grass = box(120, 0.03, 80, toon('#8fae6a', {paint: {seed: 1001, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -30); g.add(grass);
    [[-14, -24, 8, '#bfd8e8'], [-7, -26, 14, '#e8dcc0'], [0, -36, 58, '#3f6a9a'], [8, -25, 18, '#f3efe6'], [15, -24, 10, '#e0c8a8']].forEach(([x, z, h, c], i) => { const b = box(4.5, h, 4.5, toon(c, {paint: {seed: 1010 + i, windows: true}})); at(b, x, 0, z); g.add(b); });
    const saltL = box(120, 1, 50, toon('#fbfbf8', {paint: {seed: 1020, stains: 10}}), {edges: false}); at(saltL, 0, 0, -45); g.add(saltL);
    updaters.push((t) => { const u = smooth((t - E('disebar')) / (E('lantai') + 0.3 - E('disebar'))); saltL.scale.y = Math.max(0.01, 46 * u); saltL.visible = u > 0.002; });
    const bimo = ch('bimo', {seed: 6}, g, 0, -3.0, 0); showWhen(bimo.group, (t) => t < E('disebar'));
    bimo.act([{t: 0, pose: 'idle', expr: 'surprised'}, {t: E('dikeruk'), pose: 'headHold', expr: 'shocked'}]);
    label(g, L.m150, -9, 36, -18, E('seratus') - 0.1, cut(11), {w: 14, h: 3.6, bg: '#f2d24a'});
    label(g, L.floors, 0, 64, -30, E('lantai') - 0.1, cut(11), {w: 14, h: 3.6, bg: '#fbfbf8'});
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
