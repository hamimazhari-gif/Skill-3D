// All locations in one scene at different x offsets. Story: "Tes umur" (six 90s childhood memories, then flying a kite).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {studio: 0, gudang: 40, rumah: 80, phone: 120, wartel: 160, kampung: 200, warung: 240};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'jolly' (new for this video; round no-sleep face, side hair, thin brows).
export const CHAR_DESIGN = 'jolly';
const KECIL = {outfit: 'tshirt', jacket: '#f2a93a', print: '#fff3df', print2: '#d8413a', lower: '#3a5a8a', tie: '#f2a93a', hair: '#2b2326', hairStyle: 'tuft', hat: 'none'};
const CAST = {
  anak: {outfit: 'shirt', jacket: '#fbf6ea', tie: '#c9353a', lower: '#c9353a', pocket: '#ece4d4', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
  ayah: {outfit: 'shirt', jacket: '#7fb08a', tie: '#3a5a3a', lower: '#3a4050', pocket: '#6fa07a', hair: '#2b2326', hairStyle: 'side', hat: 'none', glasses: true, mustache: 'thin'},
  kecil: KECIL,
  kecilRaja: {...KECIL, hat: 'crown'},
  kakek: {outfit: 'tshirt', jacket: '#fbf6ea', lower: '#3a5a8a', sarung: '#2a3a6a', tie: '#fbf6ea', hair: '#e8e4dc', hairStyle: 'bald', hat: 'none', mustache: 'thick'},
  galak: {outfit: 'batik', jacket: '#8a4a2a', print: '#e8c35a', print2: '#3a2420', lower: '#2a2a33', tie: '#8a4a2a', hair: '#2b2326', hairStyle: 'side', hat: 'none', mustache: 'thick'},
  emak: {hairStyle: 'hijab', hijab: '#3f8a5a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#e0809a', print: '#fff3df', print2: '#8a2a4a', lower: '#e0809a', tie: '#e0809a', round: true},
  teman: {outfit: 'tshirt', jacket: '#3fb06a', print: '#fff3df', print2: '#f2d24a', lower: '#5a4a3a', tie: '#3fb06a', hair: '#3a2a26', hairStyle: 'fringe', hat: 'none'},
  penjual: {outfit: 'farmer', jacket: '#e8a83a', lower: '#4a4a52', pocket: '#d8982a', tie: '#e8a83a', hair: '#9a9a9a', hairStyle: 'side', hat: 'none', towel: '#fbf6ea'},
};

// Lighting: a bright quiz studio, a dusty storeroom, warm nostalgic afternoons for the memories, dusk for magrib, a golden sunset for the kite.
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
const gudangL = {...LOOK_PRESETS.interiorWarm, keyI: 1.9, hemiI: 1.0, grade: {sat: 0.95, contrast: 1.05, tint: '#e8c89a', tintAmt: 0.08, vignette: 0.55}};
const retro = {...LOOK_PRESETS.day, ...MOODS.nostalgic};
const retroIn = {...LOOK_PRESETS.interiorWarm, keyI: 2.3, hemiI: 1.3, ...MOODS.nostalgic};
export const LOOK = {
  studio: {...studio},
  gudang: {...gudangL},
  rumah: {...LOOK_PRESETS.overcast, grade: {sat: 0.7, contrast: 1.0, tint: '#e8c89a', tintAmt: 0.22, vignette: 0.55}},
  phone: {...retroIn},
  wartel: {...retroIn},
  kampung: {keys: [{at: 0, ...LOOK_PRESETS.dusk, ...MOODS.nostalgic}, {at: 'cut10', ...LOOK_PRESETS.sunset, ...MOODS.joyful}]},
  warung: {...retro},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.tua, dur: 0.3, color: '#ffffff', strength: 0.3}, {t: EVt.harta, dur: 0.3, color: '#ffe9b0', strength: 0.35}, {t: EVt.tersedak, dur: 0.3, color: '#ffffff', strength: 0.25},
      {t: EVt.halo, dur: 0.3, color: '#ff8a7a', strength: 0.3}, {t: EVt.sultan, dur: 0.35, color: '#ffe9b0', strength: 0.4}, {t: EVt.layangan, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.tersedak, dur: 0.3, amp: 0.015}, {t: EVt.halo, dur: 0.3, amp: 0.015}, {t: EVt.ditutup, dur: 0.25, amp: 0.012}, {t: EVt.namaLengkap, dur: 0.35, amp: 0.02}],
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
  const check = (g, n, x, y, z, k, until) => label(g, L.ch(n), x, y, z, E(k) - 0.1, until, {w: 0.7, h: 0.36, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'});

  // ---------- the studio: the age test (1), your score (12) ----------
  {
    const g = addLoc('studio');
    under(g, '#14161c');
    const fl0 = box(30, 0.04, 14, toon('#262a36', {paint: {seed: 821}}), {edges: false}); at(fl0, 0, -0.03, -3); g.add(fl0);
    const wall = box(30, 9, 0.2, toon('#1e2840', {paint: {seed: 822}}), {edges: false}); at(wall, 0, 0, -6.2); g.add(wall);
    label(g, L.test, 0, 2.7, -3.6, E('tes') - 0.1, cut(2), {w: 2.0, h: 0.5, bg: '#f2d24a'});
    label(g, L.rule, 0, 2.2, -3.55, E('tiga0') - 0.1, cut(2), {w: 2.0, h: 0.34, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const board = box(1.4, 1.6, 0.06, toon('#fbf6ea', {wear: false}), {hull: 0.01}); at(board, 1.5, 0.3, -3.8); g.add(board);
    for (let i = 0; i < 6; i++) { const ln = box(0.9, 0.02, 0.01, '#9ab8d8', {hull: 0}); at(ln, 1.6, 0.55 + i * 0.22, -3.76); g.add(ln); const bx = box(0.12, 0.12, 0.01, '#fbf6ea', {hull: 0.004}); at(bx, 1.05, 0.5 + i * 0.22, -3.76); g.add(bx); }
    const ayah = ch('ayah', {seed: 1}, g, -0.3, -3.0, 0.2); showWhen(ayah.group, (t) => inShots(t, 1));
    ayah.act([{t: 0, pose: 'present', expr: 'happy'}, {t: E('hitung') + 0.1, pose: 'chin', expr: 'thinking'}, {t: E('maaf0'), pose: 'idle', expr: 'surprised'}, {t: E('tua') + 0.05, pose: 'headHold', expr: 'shocked'}]);
    ayah.act([{t: E('tua'), action: 'jump', dur: 0.5}]);
    const anak = ch('anak', {seed: 2, scale: 0.78}, g, -0.6, -3.0, 0.2); showWhen(anak.group, (t) => inShots(t, 12));
    anak.act([{t: 0, pose: 'present', expr: 'cheesy'}, {t: E('komentar') - 0.1, pose: 'point', expr: 'excited'}]);
    label(g, L.question, 0, 2.7, -3.4, E('skor') - 0.1, 1e9, {w: 2.2, h: 0.4, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, 0, 2.27, -3.35, E('komentar') - 0.1, 1e9, {w: 2.0, h: 0.34, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([0, 2.9, -3.0], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the storeroom: the box (2), the cassette (3), the question and the kite (9) ----------
  {
    const g = addLoc('gudang');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#b8a890', floor: '#8a7a6a', wain: '#7a6a5a'}));
    for (let r = 0; r < 3; r++) { const sh = box(2.0, 0.05, 0.5, toon('#7a5236', {paint: {seed: 830 + r}})); at(sh, -2.0, 0.6 + r * 0.7, -4.6); g.add(sh); for (let i = 0; i < 3; i++) { const b = box(0.4, 0.35, 0.35, toon(['#c9a06a', '#b8905a', '#d8b07a'][(i + r) % 3], {paint: {seed: 840 + i + r}})); at(b, -2.6 + i * 0.6, 0.65 + r * 0.7, -4.55); g.add(b); } }
    const kb = P.cardboardBox(L.box); at(kb, 0.4, 0, -3.2); g.add(kb);
    fx(g, FX.dust([0.4, 0.6, -3.2], 0.5, {n: 12})); fx(g, FX.dust([0.4, 0.6, -3.2], E('kardus'), {n: 12}));
    const sun = P.glowSprite('#ffe8b0', 2.0); at(sun, 1.6, 2.2, -4.8); g.add(sun);
    const anak = ch('anak', {seed: 3, scale: 0.78}, g, -0.6, -2.9, 0.3);
    const ayah = ch('ayah', {seed: 4}, g, 1.5, -3.5, -0.3); showWhen(ayah.group, (t) => t > cut(3) - 0.1);
    walkPath(anak, [[0, -1.8, -2.9], [E('kardus') + 0.2, -0.4, -2.9]]);
    const cas = P.cassette(1.0); held(anak, cas, {y: 0.03, z: 0.08}); showWhen(cas, (t) => t > E('yah') - 0.3 && t < cut(4));
    const mugA = P.mug('#fbf6ea'); held(ayah, mugA, {y: 0.02, z: 0.06}); showWhen(mugA, (t) => t < cut(4));
    fx(g, FX.splash([1.45, 1.75, -3.2], E('tersedak'), {n: 30, color: '#8a5a3a', size: 0.06}));
    const pen = P.pencil(); g.add(pen); updaters.push((t) => { pen.visible = inShots(t, 3) && t > E('pensil') - 0.2; at(pen, -0.28, 1.25, -2.65, 0, 0, t * 6); });
    label(g, L.powerbank, -0.15, 2.25, -2.8, E('powerbank') - 0.1, E('kaset'), {w: 1.1, bg: '#7fc4e8'});
    label(g, L.cassette, -0.15, 2.25, -2.8, E('kaset') - 0.1, cut(4), {w: 0.9, bg: '#f2d24a'});
    label(g, '0/6', 0.25, 2.55, -3.3, 0.3, E('kaset') - 0.1, {w: 0.7, h: 0.36, bg: '#fbf6ea', fg: '#351f22', frame: '#351f22'});
    check(g, 1, 1.0, 2.5, -3.0, 'kaset', cut(4));
    anak.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('kardus') + 0.1, pose: 'point', expr: 'excited'}, {t: E('harta') + 0.05, pose: 'cheer', expr: 'cheesy'},
      {t: cut(3), pose: 'read', expr: 'confused'}, {t: E('tersedak') + 0.1, pose: 'read', expr: 'surprised'}, {t: E('pensil') + 0.1, pose: 'read', expr: 'thinking'},
      {t: cut(9), pose: 'idle', expr: 'confused'}, {t: E('hp') + 0.05, pose: 'shrug', expr: 'confused'}, {t: E('tersenyum') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('tunjukkan') + 0.2, pose: 'cheer', expr: 'excited'}]);
    speak(anak, 5, [[0, 'confused', 'read']]);
    speak(anak, 28, [[0.35, 'confused', 'shrug']], E('hp') - 1.0);
    ayah.act([{t: cut(3), pose: 'drink', expr: 'happy'}, {t: E('tersedak') - 0.05, pose: 'facepalm', expr: 'shocked'}, {t: E('kaset') - 0.1, pose: 'point', expr: 'annoyed'},
      {t: E('pensil') + 0.1, pose: 'present', expr: 'proud'}, {t: cut(9), pose: 'idle', expr: 'neutral'}, {t: E('tersenyum'), pose: 'idle', expr: 'happy'},
      {t: E('layangan') - 0.1, pose: 'carry', expr: 'smug'}, {t: E('tunjukkan'), pose: 'present', expr: 'cheesy'}]);
    ayah.act([{t: E('tersedak'), action: 'tremble', dur: 0.8}]);
    speak(ayah, 7, [[0, 'annoyed', 'point']]); speak(ayah, 31, [[0, 'cheesy', 'present']]);
    walkPath(ayah, [[cut(9), 1.5, -3.5], [E('layangan') - 0.6, 0.9, -3.4]]);
    const kt = P.kite('#d8413a'); kt.scale.setScalar(0.9); held(ayah, kt, {y: 0.4, z: 0.08}); showWhen(kt, (t) => inShots(t, 9) && t > E('layangan') - 0.15);
    fx(g, FX.glints([0.9, 2.2, -3.2], E('layangan'), {n: 22}), (t) => inShots(t, 9));
  }

  // ---------- the house: grandpa on the roof turns the antenna (4) ----------
  {
    const g = addLoc('rumah');
    under(g, '#8fae6a', 120);
    const grass = box(40, 0.03, 30, toon('#8fae6a', {paint: {seed: 851, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -8); g.add(grass);
    const hs = P.house(5, 2.6, 4, {color: '#e8dcc0', roof: '#b5543c', windows: 2, doorX: -1.2, seed: 50}); at(hs, 0.6, 0, -5.2); g.add(hs);
    const ant = P.antenna(); at(ant, 1.5, 3.95, -7.1); g.add(ant);
    updaters.push((t) => { ant.rotation.y = Math.sin(t * 1.8) * 0.6 * (t > E('antena') && t < E('kebanyakan') + 1 ? 1 : 0.1); });
    const kakek = ch('kakek', {seed: 5}, g, 0.7, -7.0, 0.2, 4.15);
    kakek.act([{t: 0, pose: 'hold', expr: 'determined'}, {t: E('jelas') - 0.1, pose: 'pointUp', expr: 'annoyed'}, {t: E('kebanyakan'), pose: 'facepalm', expr: 'furious'}]);
    speak(kakek, 12, [[0, 'annoyed', 'pointUp']]);
    const tv = P.crtTV(); at(tv.group, -1.3, 0, -2.9); g.add(tv.group); updaters.push((t) => { tv.update(t); tv.setClear(t > E('kiri') + 0.3 && t < E('kebanyakan') ? 1 : 0); });
    const kecil = ch('kecil', {seed: 6, scale: 0.75}, g, 0.0, -2.6, 0.2);
    kecil.act([{t: 0, pose: 'pointUp', expr: 'determined'}, {t: E('operator') + 0.1, pose: 'point', expr: 'cheesy'}, {t: E('kiri') - 0.1, pose: 'point', expr: 'excited'}, {t: E('kebanyakan') + 0.05, pose: 'headHold', expr: 'grimace'}]);
    speak(kecil, 13, [[0, 'excited', 'point'], [0.55, 'grimace', 'headHold']]);
        label(g, L.left, -0.55, 1.9, -2.4, E('kiri') - 0.1, cut(5), {w: 0.85, bg: '#7fc4e8'});
    check(g, 2, -0.7, 3.4, -3.8, 'no2', cut(5));
    fx(g, FX.rain([0, -4, 16, 12], {from: cut(4), to: cut(5)}));
  }

  // ---------- the phone call (5): the crush's father answers ----------
  {
    const g = addLoc('phone');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#c8d8b0', floor: '#a8784a', wain: '#7a9a6a'}));
    const ph = P.homePhone('#c9353a'); at(ph, -0.4, 0, -3.5); g.add(ph);
    const kecil = ch('kecil', {seed: 7, scale: 0.85}, g, -1.0, -3.2, 0.3);
    const hs = box(0.3, 0.06, 0.08, '#c9353a', {hull: 0.006}); held(kecil, hs, {y: 0.05, z: 0.05, rz: 1.2}); showWhen(hs, (t) => t > E('gebetan') - 0.2 && t < E('ditutup'));
    kecil.act([{t: cut(5), pose: 'tap', expr: 'nervous'}, {t: E('gebetan') - 0.2, pose: 'drink', expr: 'cheesy'}, {t: E('jantung'), pose: 'drink', expr: 'nervous'},
      {t: E('halo') + 0.1, pose: 'drink', expr: 'scream'}, {t: E('ditutup') - 0.05, pose: 'tap', expr: 'grimace'}]);
    kecil.act([{t: E('jantung'), action: 'tremble', dur: 2.0}, {t: E('ditutup'), action: 'jump', dur: 0.5}]);
    const hrt = P.heart('#e0626e'); g.add(hrt); updaters.push((t) => { const b = 1 + 0.25 * Math.abs(Math.sin(t * 9)); hrt.visible = inShots(t, 5) && t > E('jantung') - 0.1 && t < E('halo'); hrt.scale.setScalar(0.35 * b); at(hrt, -0.4, 2.1, -3.0); });
    // the other house: the father picks up
    const GX = 6;
    const room2 = P.room(7, 3, 6, {wall: '#e8d0c0', floor: '#8a6242', wain: '#8a4a3a'}); room2.position.x = GX; g.add(room2);
    const ph2 = P.homePhone('#2b2b33'); at(ph2, GX + 0.4, 0, -3.5); g.add(ph2);
    const galak = ch('galak', {seed: 8}, g, GX - 0.3, -3.2, 0.1);
    const hs2 = box(0.3, 0.06, 0.08, '#2b2b33', {hull: 0.006}); held(galak, hs2, {y: 0.05, z: 0.05, rz: 1.2});
    galak.act([{t: 0, pose: 'drink', expr: 'smug'}, {t: E('halo') - 0.1, pose: 'drink', expr: 'furious'}]);
    speak(galak, 17, [[0, 'furious', 'drink']]);
    label(g, L.hello, GX - 0.1, 2.3, -2.9, E('halo') - 0.05, E('ditutup'), {w: 1.4, h: 0.34, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    check(g, 3, -1.9, 2.55, -3.0, 'no3', cut(6));
  }

  // ---------- the wartel (6): every second costs pocket money ----------
  {
    const g = addLoc('wartel');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#e8e0cc', floor: '#9aa4ac', wain: '#4f6a7a', tiles: true}));
    for (const x of [-1.5, 0, 1.5]) { const b = P.wartelBooth(); at(b, x, 0, -4.0); g.add(b); }
    label(g, L.wartel, 0, 2.7, -4.8, -1, 1e9, {w: 1.6, h: 0.45, bg: '#2f6a8a', fg: '#fff3df', frame: '#f2d24a'});
    const vals = ['0', '350', '700', '1.050', '1.400', '1.750', '2.100', '2.450'];
    vals.forEach((v, i) => { const b = P.digitalBoard(L.argo(v), 0.8, 0.28, {color: '#ff5a4a'}); at(b, 0.2, 2.05, -3.3); g.add(b); const t0 = E('argo') - 0.2 + i * ((cut(7) - E('argo')) / vals.length); showWhen(b, (t) => t >= t0 && (i === vals.length - 1 || t < t0 + (cut(7) - E('argo')) / vals.length)); });
    const kecil = ch('kecil', {seed: 9, scale: 0.85}, g, -0.2, -3.6, 0.2);
    const hs = box(0.3, 0.06, 0.08, '#2b2b33', {hull: 0.006}); held(kecil, hs, {y: 0.05, z: 0.05, rz: 1.2});
    kecil.act([{t: 0, pose: 'drink', expr: 'happy'}, {t: E('argo') + 0.1, pose: 'drink', expr: 'nervous'}, {t: E('cepat'), pose: 'drink', expr: 'grimace'}, {t: E('jajan'), pose: 'drink', expr: 'cry'}]);
    kecil.act([{t: E('cepat'), action: 'talk', dur: E('jajan') - E('cepat') + 0.5}, {t: E('detik'), action: 'tremble', dur: 1.2}]);
    check(g, 4, -1.5, 2.6, -3.2, 'no4', cut(7));
    [['teman', 0.95, -2.7, -0.4], ['penjual', 1.55, -2.4, -0.5]].forEach(([k, x, z, y], i) => { const q = ch(k, {seed: 90 + i, scale: k === 'teman' ? 0.8 : 1}, g, x, z, y); q.act([{t: 0, pose: 'cross', expr: 'annoyed'}, {t: E('detik') + i * 0.2, pose: 'tap', expr: 'irritated'}]); });
  }

  // ---------- the kampung: play until magrib (7), flying a kite at sunset (10-11) ----------
  {
    const g = addLoc('kampung');
    under(g, '#8fae6a', 160);
    const grass = box(60, 0.03, 40, toon('#8fae6a', {paint: {seed: 871, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -12); g.add(grass);
    g.add(P.hills('#7fa05a'));
    const ms = P.mosque(); at(ms, -4.5, 0, -12); g.add(ms);
    for (let i = 0; i < 4; i++) { const h = P.house(2.6, 2.2, 2.4, {color: ['#e8c35a', '#e0809a', '#7fc4e8', '#f3efe6'][i], roof: '#b5543c', windows: 1, seed: 60 + i}); at(h, 1.5 + i * 3, 0, -11 - (i % 2)); g.add(h); }
    for (let i = 0; i < 6; i++) { const tr = P.tree({seed: 880 + i, h: 2.8}); at(tr, -8 + i * 3.4, 0, -8 - (i % 2) * 1.5); g.add(tr); }
    const ball7 = P.footballBall ? P.footballBall() : ball(0.12, '#fbf6ea'); g.add(ball7);
    updaters.push((t) => { ball7.visible = inShots(t, 7) && t < E('azan'); at(ball7, Math.sin(t * 2.5) * 0.9, 0.12 + Math.abs(Math.sin(t * 5)) * 0.5, -3.0); });
    const k1 = ch('kecil', {seed: 10, scale: 0.75}, g, -0.9, -3.2, 0.3), k2 = ch('teman', {seed: 11, scale: 0.75}, g, 0.9, -3.3, -0.3);
    [k1, k2].forEach((c, i) => { showWhen(c.group, (t) => inShots(t, 7)); c.act([{t: 0, pose: 'cheer', expr: 'laugh'}, {t: E('azan') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('namaLengkap') - 0.1, pose: 'headHold', expr: 'grimace'}]); c.act([{t: cut(7), action: 'jump', dur: 0.5}, {t: E('main') + i * 0.2, action: 'hop', dur: 0.4}]); });
    walkPath(k1, [[E('namaLengkap') + 0.1, -0.9, -3.2], [E('namaLengkap') + 1.2, -3.0, -2.2]], 'run');
    const emak = ch('emak', {seed: 12}, g, -1.9, -3.9, 0.5); showWhen(emak.group, (t) => inShots(t, 7) && t > E('telat') - 0.3);
    emak.act([{t: 0, pose: 'hips', expr: 'furious'}]); speak(emak, 25, [[0.5, 'furious', 'hips']], E('emak'));
    const speaker = P.glowSprite('#ffe2a0', 1.2); at(speaker, -1.9, 5.2, -10.6); g.add(speaker); showWhen(speaker, (t) => inShots(t, 7) && t > E('azan') - 0.1);
    label(g, L.magrib, -2.2, 3.2, -6, E('azan') - 0.1, cut(8), {w: 1.2, h: 0.36, bg: '#3f8a5a', fg: '#fff3df', frame: '#1f5a3a'});
    label(g, L.fullName, -0.6, 2.35, -3.4, E('namaLengkap') - 0.1, cut(8), {w: 2.2, h: 0.34, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    check(g, 5, 0.6, 2.7, -3.4, 'no5', cut(8));
    // the kite at sunset (10-11): father and son
    const KX = 10;
    const ay = ch('ayah', {seed: 13}, g, KX - 0.5, -3.0, 0.3), an = ch('anak', {seed: 14, scale: 0.78}, g, KX + 0.5, -3.0, -0.2);
    [ay, an].forEach((c, i) => { showWhen(c.group, (t) => t > cut(10) - 0.1); c.act([{t: 0, pose: 'pointUp', expr: i ? 'excited' : 'happy'}, {t: E('dulu'), pose: 'pointUp', expr: i ? 'laugh' : 'proud'}, {t: cut(12), pose: i ? 'point' : 'pointUp', expr: 'cheesy'}]); });
    const kite1 = P.kite('#d8413a'); g.add(kite1);
    updaters.push((t) => { const u = smooth((t - cut(10)) / 2.5); kite1.visible = t > cut(10) - 0.1; at(kite1, KX + 0.2 + Math.sin(t * 1.3) * 0.4, 1.8 + u * 3.2 + Math.sin(t * 2) * 0.15, -5.5, 0, 0, Math.sin(t * 1.7) * 0.25); });
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 4), new THREE.MeshBasicMaterial({color: '#fbf6ea'})); g.add(str);
    updaters.push((t) => { str.visible = kite1.visible; const a = new THREE.Vector3(KX + 0.35, 1.4, -2.95), b = kite1.position.clone(); const m = a.clone().add(b).multiplyScalar(0.5); str.position.copy(m); str.scale.y = a.distanceTo(b); str.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); });
    const sunB = P.sunRays ? P.sunRays(0.9) : null; if (sunB) { at(sunB, KX - 3, 3.0, -16); g.add(sunB); showWhen(sunB, (t) => t > cut(10) - 0.1); }
    fx(g, FX.glints([KX, 3.5, -5], E('segalanya'), {n: 20}));
    label(g, L.question, KX, 2.55, -2.8, E('skor') - 0.1, 1e9, {w: 2.2, h: 0.38, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, KX, 2.13, -2.75, E('komentar') - 0.1, 1e9, {w: 2.0, h: 0.32, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([KX, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the warung (8): Rp500 makes you a sultan ----------
  {
    const g = addLoc('warung');
    under(g, '#c9b48a', 120);
    const ground = box(40, 0.03, 30, toon('#c9b48a', {paint: {seed: 891, stains: 30}}), {edges: false}); at(ground, 0, -0.03, -8); g.add(ground);
    const st = P.stall('WARUNG', {w: 2.4}); at(st, 0.4, 0, -3.6); g.add(st);
    const sn = P.snackTray ? P.snackTray() : null; if (sn) { at(sn, 0.4, 0.86, -3.6); g.add(sn); }
    const pj = ch('penjual', {seed: 15}, g, 0.8, -4.3, -0.1); pj.act([{t: 0, pose: 'presentBoth', expr: 'happy'}, {t: E('sultan') + 0.1, pose: 'cheer', expr: 'laugh'}]);
    const kc = ch('kecil', {seed: 16, scale: 0.75}, g, -0.6, -2.6, 0.3), kr = ch('kecilRaja', {seed: 17, scale: 0.75}, g, -0.6, -2.6, 0.3);
    showWhen(kc.group, (t) => t < E('sultan') - 0.1); showWhen(kr.group, (t) => t >= E('sultan') - 0.1);
    kc.act([{t: 0, pose: 'pointUp', expr: 'excited'}]); kr.act([{t: 0, pose: 'hips', expr: 'proud'}]); kr.act([{t: E('sultan'), action: 'jump', dur: 0.5}]);
    const coin = P.coin(0.12); g.add(coin); updaters.push((t) => { at(coin, -0.42, 1.55 + Math.sin(t * 4) * 0.03, -2.4, 0, 1.4, t * 2); coin.visible = t < E('sultan') - 0.1; });
    label(g, L.coin, -0.6, 2.05, -2.4, E('limaRatus') - 0.1, cut(9), {w: 0.8, bg: '#e8c35a'});
        fx(g, FX.glints([-0.6, 1.6, -2.4], E('sultan'), {n: 30}));
    const rr = (() => { let v = 9; return () => (v = (v * 9301 + 49297) % 233280) / 233280; })();
    const snacks = Array.from({length: 60}, (_, i) => { const k = i % 4; const q = k === 0 ? box(0.14, 0.2, 0.05, ['#d8413a', '#3f8ad8', '#f2d24a'][i % 3], {hull: 0.004}) : k === 1 ? ball(0.06, ['#e8737a', '#7fd0a0', '#b07ad8'][i % 3], {hull: 0.004}) : k === 2 ? cyl(0.05, 0.05, 0.16, '#c9822a', {hull: 0.004}) : box(0.16, 0.06, 0.1, '#f2a93a', {hull: 0.004});
      const a = rr() * 6.28, d = rr() * 0.6, y = (1 - d / 0.6) * 0.9 * rr(); g.add(q); const t0 = E('sultan') - 0.1 + i * 0.012;
      updaters.push((t) => { q.visible = inShots(t, 8) && t > t0; q.scale.setScalar(pop(t, t0, 0.25)); at(q, -0.05 + Math.cos(a) * d, y, -2.55 + Math.sin(a) * d * 0.5, a, rr() * 0, a); }); return q; });
    check(g, 6, 1.5, 2.6, -3.0, 'no6', cut(9));
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
