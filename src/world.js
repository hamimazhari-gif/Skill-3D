// All locations in one scene at different x offsets. Story: "Tubuhmu bukan tubuh yang sama" (cells renew; brain and lens stay).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {home: 0, factory: 40, body: 80};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'gentle' (new for this video; round no-sleep face, fringe hair, thin brows, long torso).
export const CHAR_DESIGN = 'gentle';
const CAST = {
  dimas: {outfit: 'tshirt', jacket: '#4f8fc8', print: '#fff3df', print2: '#f2d24a', lower: '#3a3a48', tie: '#4f8fc8', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
  mama: {hairStyle: 'hijab', hijab: '#e0809a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#7fb08a', print: '#fff3df', print2: '#3a5a3a', lower: '#7fb08a', tie: '#7fb08a', round: true},
  teman: {outfit: 'tshirt', jacket: '#e0626e', print: '#fff3df', print2: '#f2d24a', lower: '#3a3a48', tie: '#e0626e', hair: '#3a2a26', hairStyle: 'bun', hat: 'none'},
};

// Lighting: a warm home with a sunbeam, a bright inside-the-body factory, the pink gut, a red vessel, a calm blue brain stage.
const roomL = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
const fac = {...LOOK_PRESETS.interiorCool, keyI: 2.2, hemiI: 1.2, fog: '#2a3448'};
const gutL = {...LOOK_PRESETS.interiorWarm, keyI: 2.2, hemiI: 1.3, fog: '#5a1a2a', key: '#ffd0c0'};
export const LOOK = {
  home: {keys: [{at: 0, ...roomL}, {at: 'cut10', ...roomL, ...MOODS.nostalgic}, {at: 'cut11', ...roomL}]},
  factory: {keys: [{at: 0, ...fac}, {at: 'twist', ...fac, ...MOODS.mystery}]},
  body: {keys: [{at: 0, ...gutL}, {at: 'cut9', ...LOOK_PRESETS.interiorCool, keyI: 2.0, hemiI: 1.1, fog: '#141824'}]},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.bukan0, dur: 0.3, color: '#ffffff', strength: 0.3}, {t: EVt.miliar, dur: 0.35, color: '#ffe9b0', strength: 0.4}, {t: EVt.pensiun, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.twist, dur: 0.3, color: '#b8a0ff', strength: 0.35}, {t: EVt.mitos, dur: 0.35, color: '#ff8a7a', strength: 0.4}, {t: EVt.ilmiah, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.mitos, dur: 0.35, amp: 0.02}, {t: EVt.berubah, dur: 0.3, amp: 0.012}],
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

  // ---------- home: the mirror (1), the dust (5), memories (10), "you've changed" (11), the question (12) ----------
  {
    const g = addLoc('home');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#e8dcc8', floor: '#a8784a', wain: '#7a9ab0'}));
    const mir = box(0.9, 1.6, 0.05, new THREE.MeshBasicMaterial({color: '#cfe4ee'}), {hull: 0.01}); at(mir, 0.6, 0.5, -4.85); g.add(mir);
    const mf = box(1.0, 1.7, 0.04, '#8a5a3a'); at(mf, 0.6, 0.45, -4.88); g.add(mf);
    const ph = sign(L.lastYear, 0.5, 0.4, {bg: '#fbf6ea', fg: '#7a5aa8', frame: '#7a5236'}); at(ph, -0.8, 1.75, -4.84); g.add(ph);
    label(g, L.now, 0.6, 2.45, -4.7, E('sekarang') - 0.1, cut(2), {w: 0.7, h: 0.3, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'});
    const refl = ch('dimas', {seed: 4, scale: 0.55}, g, 0.6, -4.78, 0, 0.55); showWhen(refl.group, (t) => inShots(t, 1));
    refl.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('sekarang') - 0.1, pose: 'wave', expr: 'scheming'}, {t: E('tahunLalu'), pose: 'wave', expr: 'cheesy'}]);
    const dimas = ch('dimas', {seed: 1}, g, -0.25, -3.2, 0.2);
    dimas.act([{t: 0, pose: 'hips', expr: 'smug'}, {t: E('sekarang') + 0.2, pose: 'headHold', expr: 'shocked'}, {t: E('tahunLalu') + 0.1, pose: 'point', expr: 'confused'},
      {t: cut(5), pose: 'idle', expr: 'happy'}, {t: E('kamu8') + 0.05, pose: 'headHold', expr: 'surprised'}, {t: E('ma') - 0.1, pose: 'beg', expr: 'cry'},
      {t: cut(10), pose: 'read', expr: 'happy'}, {t: E('kenangan') + 0.05, pose: 'read', expr: 'proud'},
      {t: cut(11), pose: 'idle', expr: 'neutral'}, {t: E('berubah') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('iya') - 0.05, pose: 'hips', expr: 'smug'}, {t: E('ilmiah'), pose: 'pointUp', expr: 'scheming'},
      {t: cut(12), pose: 'shrug', expr: 'cheesy'}, {t: E('komentar') - 0.15, pose: 'point', expr: 'cheesy'}]);
    dimas.act([{t: E('bukan0'), action: 'jump', dur: 0.5}]);
    speak(dimas, 9, [[0, 'cry', 'beg']]); speak(dimas, 21, [[0, 'smug', 'hips'], [0.45, 'scheming', 'pointUp']]);
    walkPath(dimas, [[0, -0.25, -3.2], [cut(5) - 0.02, -0.25, -3.2], [cut(5), -0.6, -3.0]]);
    // the sunbeam full of dust; Mama sweeps
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.9, 3.4, 20, 1, true), new THREE.MeshBasicMaterial({color: '#fff2c8', transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide}));
    beam.position.set(0.9, 1.5, -3.6); beam.rotation.z = -0.35; g.add(beam); showWhen(beam, (t) => inShots(t, 5));
    fx(g, FX.fall([0.9, -3.6, 1.6, 1.2], {n: 160, h: 2.8, speed: 0.08, color: '#fff2c8', size: 0.05, drift: 0.2, sway: 0.3, seed: 7, from: cut(5), to: cut(6)}));
    const mama = ch('mama', {seed: 2}, g, 1.2, -3.4, -0.3); showWhen(mama.group, (t) => inShots(t, 5));
    const br = P.broom(); held(mama, br, {y: -0.6, z: 0.08, rz: 0.4}); 
    mama.act([{t: 0, pose: 'hold', expr: 'happy'}, {t: E('debu'), pose: 'point', expr: 'smug'}, {t: E('ma'), pose: 'hold', expr: 'happy'}, {t: E('disapu') + 0.1, pose: 'hold', expr: 'confused'}]);
    updaters.push((t) => { br.rotation.z = 0.4 + Math.sin(t * 6) * 0.3 * (t < E('ma') ? 1 : 0.1); });
    label(g, '"ITU SEBAGIAN KAMU!"', 0.25, 2.5, -3.4, E('kamu8') - 0.2, cut(6), {w: 1.9, bg: '#f2d24a', vis: (t) => inShots(t, 5)});
    // memories (10): photos of him as a kid, a teen, now, around a glow
    ['KECIL', 'SMA', 'SEKARANG'].forEach((txt, i) => label(g, txt, -1.3 + i * 0.95, 2.35 + (i % 2) * 0.2, -3.6, E('kenangan') - 0.2 + i * 0.15, cut(11), {w: 0.8, h: 0.55, bg: '#fbf6ea', fg: '#7a5aa8', frame: '#7a5236', vis: (t) => inShots(t, 10)}));
    const hrt = P.heart('#e0626e'); g.add(hrt); updaters.push((t) => { hrt.visible = inShots(t, 10) && t > E('tetap') - 0.1; hrt.scale.setScalar(0.35 * pop(t, E('tetap') - 0.1, 0.35)); at(hrt, -0.6, 1.95 + Math.sin(t * 3) * 0.04, -2.8); });
    // the friend (11)
    const teman = ch('teman', {seed: 3}, g, 0.7, -3.0, -0.35); showWhen(teman.group, (t) => inShots(t, 11));
    teman.act([{t: 0, pose: 'cross', expr: 'thinking'}, {t: E('berubah') - 0.1, pose: 'point', expr: 'annoyed'}, {t: E('ilmiah') + 0.2, pose: 'facepalm', expr: 'confused'}]);
    speak(teman, 20, [[0, 'annoyed', 'point']]);
    label(g, L.question, -0.2, 2.6, -2.9, E('fakta') - 0.1, 1e9, {w: 2.3, h: 0.38, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, -0.2, 2.18, -2.85, E('komentar') - 0.1, 1e9, {w: 1.7, h: 0.32, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([-0.2, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the cell factory (2), the skin (4), the bone renovation (7), the plot twist (8) ----------
  {
    const g = addLoc('factory');
    under(g, '#1e2430');
    const fl0 = box(60, 0.04, 14, toon('#3a4458', {paint: {seed: 911}}), {edges: false}); at(fl0, 10, -0.03, -3); g.add(fl0);
    const wall = box(60, 9, 0.2, toon('#2a3448', {paint: {seed: 912}}), {edges: false}); at(wall, 10, 0, -6.2); g.add(wall);
    for (let i = 0; i < 8; i++) { const p = cyl(0.12, 0.12, 6, '#5a6a7a', {hull: 0.01}); at(p, -3 + i * 6, 0, -5.8); g.add(p); }
    const cv = P.conveyor(5, 0.8); at(cv.group, 0, 0, -3.4); g.add(cv.group); updaters.push((t) => cv.update(t));
    for (let i = 0; i < 6; i++) { const old = P.cell('#b8a0a8', {tired: true}), nw = P.cell('#f2a0b0'); g.add(old, nw);
      updaters.push((t) => { const u = ((t * 0.4 + i / 6) % 1); const x = -2.3 + u * 4.6; const isNew = x > 0; old.visible = !isNew; nw.visible = isNew; at(old, x, 0.72, -3.4); at(nw, x, 0.72, -3.4); nw.scale.setScalar(isNew ? Math.min(1, (x / 0.3)) : 0.01); }); }
    const gate = new THREE.Group(); for (const z of [-3.95]) { const p = box(0.12, 0.8, 0.12, '#f2c23a', {hull: 0.008}); at(p, 0, 0.7, z); gate.add(p); } const top = box(0.2, 0.2, 1.1, toon('#f2c23a', {paint: {seed: 913}})); at(top, 0, 1.45, -3.4); gate.add(top); g.add(gate);
    fx(g, FX.glints([0.5, 1.2, -3.2], E('diganti'), {n: 26}));
    [[-0.55, -2.65, 0], [0.6, -2.65, 1]].forEach(([x, z, i]) => { const w = P.cell('#e8d8a8'); const hh = P.hardHat(); hh.position.y = 0.44; w.add(hh); w.scale.setScalar(0.9); g.add(w);
      updaters.push((t) => { at(w, x + Math.sin(t * 3 + i) * 0.15, Math.abs(Math.sin(t * 6 + i)) * 0.08, z, Math.sin(t * 2 + i) * 0.5); }); });
    label(g, L.factory, 0, 2.7, -3.6, E('pabrik') - 0.1, cut(3), {w: 1.6, h: 0.4, bg: '#f2c23a'});
        // skin (4): flakes come off the top layer
    const SX = 12;
    const sk = P.skinSlab(3, 1.4); at(sk, SX, 0, -3.6); g.add(sk);
    const flakes = Array.from({length: 24}, (_, i) => { const f = box(0.12, 0.015, 0.1, '#fbf0e4', {hull: 0.004}); g.add(f); return f; });
    updaters.push((t) => flakes.forEach((f, i) => { const t0 = E('rontok') - 0.3 + (i % 8) * 0.18; const u = Math.max(0, t - t0); f.visible = inShots(t, 4) && u > 0; at(f, SX - 1.3 + (i * 0.37) % 2.6, 0.99 + u * 0.5 + Math.sin(u * 3 + i) * 0.1, -3.5 + ((i * 0.53) % 1) - 0.5 + u * 0.3, u * 2, u * 3, u); }));
        // bone (7): a renovation site
    const BX = 24;
    const bn = P.bone(2.6, 0.2); at(bn, BX, 0.45, -3.6); g.add(bn);
    for (const x of [-1.4, 1.4]) { const c = P.trafficCone(); at(c, BX + x, 0, -2.7); g.add(c); }
    for (const x of [-1.3, 1.3]) for (const y of [0, 1.1]) { const pl = box(0.05, 1.1, 0.05, '#9aa8b4', {hull: 0.004}); at(pl, BX + x, y, -4.1); g.add(pl); }
    const plank = box(2.8, 0.05, 0.4, '#c9a06a'); at(plank, BX, 1.1, -4.1); g.add(plank);
    const workers = [-0.7, 0.2, 0.9].map((x, i) => { const c = P.cell('#e8d8a8'); const hh = P.hardHat(); hh.position.y = 0.44; c.add(hh); g.add(c);
      updaters.push((t) => { at(c, BX + x, (i === 1 ? 1.13 : 0) + Math.abs(Math.sin(t * 5 + i)) * 0.06, -3.0 - (i === 1 ? 1.1 : 0)); c.rotation.z = Math.sin(t * 8 + i) * 0.08; }); return c; });
    fx(g, FX.sparks([BX + 0.2, 0.6, -3.4], E('renovasi'), {n: 30}));
    label(g, L.reno, BX, 2.1, -3.6, E('renovasi') - 0.1, cut(8), {w: 1.9, bg: '#f2753a', fg: '#fff3df', frame: '#8a3a1a'});
        // plot twist (8)
    const TX = 36;
    label(g, L.seven, TX, 1.9, -3.6, E('banyak') - 0.1, 1e9, {w: 2.6, h: 0.42, bg: '#fbf6ea'});
    label(g, L.myth, TX + 0.4, 1.55, -3.3, E('mitos') - 0.05, 1e9, {w: 1.2, h: 0.5, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const q = sign('?', 0.6, 0.7, {bg: '#b8a0ff', fg: '#351f22', frame: '#351f22'}); popSign(g, q, TX, 2.9, -3.6, E('twist') - 0.1, E('banyak'));
  }

  // ---------- inside the body: the gut lining (3), red blood cells (6), the brain and the eye (9) ----------
  {
    const g = addLoc('body');
    under(g, '#5a1a2a');
    const tube = P.gutTube(10, 1.3); at(tube.group, 0, 0, -3.4); g.add(tube.group); updaters.push((t) => tube.update(t));
    const lining = Array.from({length: 7}, (_, i) => { const old = P.cell('#c98a98', {tired: true}), nw = P.cell('#f2a0b0'); g.add(old, nw); return [old, nw, i]; });
    updaters.push((t) => lining.forEach(([old, nw, i]) => { const x = -2.4 + i * 0.8; const sw = E('digantiU') + i * 0.12; at(old, x, 0.06, -3.9); at(nw, x, 0.06, -3.9); old.visible = t < sw; nw.visible = t >= sw; nw.scale.setScalar(pop(t, sw, 0.3)); old.rotation.z = Math.sin(t * 9 + i) * 0.08 * (t > E('keras') ? 1 : 0); }));
    const rug = box(5.6, 0.03, 0.9, toon('#f2a0b0', {paint: {stripes: {n: 10, color: '#e88a9a'}, seed: 930}}), {hull: 0.006}); g.add(rug);
    const rugW = P.cell('#e8d8a8'); const rugH = P.hardHat(); rugH.position.y = 0.44; rugW.add(rugH); g.add(rugW);
    updaters.push((t) => { const u = ((t - cut(3)) / 1.6) % 1; rug.scale.x = Math.max(0.02, u); at(rug, -2.8 + 2.8 * u, 0.06, -3.2); rug.visible = inShots(t, 3); at(rugW, -2.8 + 5.6 * u, 0.08, -3.0); rugW.visible = inShots(t, 3); });
    const food = [0, 1, 2].map((i) => { const f = ball(0.12, ['#f2d24a', '#7fd0a0', '#c9822a'][i], {hull: 0.006}); g.add(f); updaters.push((t) => { at(f, -2 + ((t * 0.8 + i * 1.3) % 4), 0.2, -3.2); f.visible = inShots(t, 3); }); return f; });
        // a red vessel with red blood cells; one retires with a party hat
    const VX = 14;
    const ves = P.gutTube(10, 1.3); at(ves.group, VX, 0, -3.4); ves.group.traverse((m) => { if (m.material && m.material.color) m.material.color.set('#a8323a'); }); g.add(ves.group); updaters.push((t) => ves.update(t));
    const rbcs = Array.from({length: 9}, (_, i) => { const r = P.redCell(0.22); g.add(r); updaters.push((t) => { at(r, VX - 4 + ((t * 1.2 + i * 0.9) % 8), 0.5 + (i % 3) * 0.35, -3.6 + (i % 2) * 0.4, t + i, 0, t * 0.5 + i); }); return r; });
    const ret = P.redCell(0.3); const hat = P.partyHat(); hat.position.set(0, 0.32, 0); ret.add(hat); g.add(ret);
    updaters.push((t) => { at(ret, VX + 0.3, 0.6 + Math.abs(Math.sin(t * 4)) * 0.1, -2.7, 0, 0, Math.sin(t * 3) * 0.2); ret.visible = t > E('pensiun') - 0.3; ret.scale.setScalar(pop(t, E('pensiun') - 0.3, 0.35)); });
    fx(g, FX.confetti([VX + 0.3, 2.0, -2.6], E('pensiun')));
        label(g, L.retire, VX + 0.3, 1.4, -2.6, E('pensiun') - 0.05, cut(7), {w: 0.9, h: 0.3, bg: '#f2d24a'});
    // the brain and the eye lens: they stay
    const BRX = 28;
    const fl = box(12, 0.04, 10, toon('#262a36', {paint: {seed: 921}}), {edges: false}); at(fl, BRX, -0.02, -3); g.add(fl);
    const bw = box(12, 8, 0.2, toon('#1e2840', {paint: {seed: 922}}), {edges: false}); at(bw, BRX, 0, -6.2); g.add(bw);
    const brain = P.brainMascot(); brain.group.scale.setScalar(1.2); at(brain.group, BRX - 0.6, 1.4, -3.6); g.add(brain.group);
    updaters.push((t) => { brain.group.position.y = 1.4 + Math.sin(t * 2) * 0.05; if (t > E('kecil')) brain.setFace('happy'); });
    const eye = P.eyeball(); eye.scale.setScalar(1.6); at(eye, BRX + 1.0, 1.3, -3.4); g.add(eye); showWhen(eye, (t) => t > E('lensa') - 0.2); updaters.push((t) => { eye.scale.setScalar(1.6 * pop(t, E('lensa') - 0.2, 0.35)); });
        label(g, L.lens, BRX + 0.4, 0.55, -3.0, E('lensa') - 0.1, cut(10), {w: 1.7, bg: '#7fc4e8'});
    [0, 1].forEach((i) => { const w = P.cell('#e8d8a8'); const hh = P.hardHat(); hh.position.y = 0.44; w.add(hh); g.add(w); const nc = P.cell('#f2a0b0'); nc.scale.setScalar(0.6); g.add(nc);
      updaters.push((t) => { const u = smooth((t - E('otak') + 0.3) / 1.2), back = smooth((t - E('kecil') - 0.3) / 0.8); const x = BRX - 2.6 + 1.0 * u - 1.2 * back + i * 0.45; at(w, x, Math.abs(Math.sin(t * 7 + i)) * 0.06, -2.9 - i * 0.3, back > 0.1 ? Math.PI : 0); at(nc, x + 0.15, 0.55, -2.8 - i * 0.3); w.visible = nc.visible = inShots(t, 9); }); });
    label(g, 'TIDAK! SAYA DI SINI SEUMUR HIDUP!', BRX - 0.2, 2.5, -3.2, E('kecil') - 0.3, cut(10), {w: 2.6, h: 0.36, bg: '#b8a0ff'});
    for (let i = 0; i < 4; i++) { const sp = P.glowSprite('#c8b8ff', 0.6); at(sp, BRX - 0.6 + Math.cos(i * 1.6) * 0.9, 1.5 + Math.sin(i * 1.6) * 0.6, -3.4); g.add(sp); }
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
