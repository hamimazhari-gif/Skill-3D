// All locations in one scene at different x offsets. Story: "Mata kedutan" (eyelid twitching: omens vs science, then overtime).
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {kantor: 0, lab: 40, klinik: 80};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'steady' (new for this video; round no-sleep face, fringe hair, thick brows).
export const CHAR_DESIGN = 'steady';
const CAST = {
  raka: {outfit: 'shirt', jacket: '#bfd8e8', tie: '#2f4f8a', lower: '#3a3a48', pocket: '#a8c4d8', hair: '#2b2326', hairStyle: 'fringe', hat: 'none', lanyard: '#2f4f8a'},
  t1: {outfit: 'batik', jacket: '#8a4a2a', print: '#e8c35a', print2: '#3a2420', lower: '#2a2a33', tie: '#8a4a2a', hair: '#2b2326', hat: 'peci', hatColor: '#1f1d24', mustache: 'thick'},
  t2: {hairStyle: 'hijab', hijab: '#7a5aa8', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'shirt', jacket: '#f3efe6', tie: '#7a5aa8', lower: '#3a3a48', pocket: '#e8e0d0', lanyard: '#2f4f8a'},
  t3: {outfit: 'shirt', jacket: '#e8c35a', tie: '#3a5a3a', lower: '#3a3a48', pocket: '#d8b34a', hair: '#9a9a9a', hairStyle: 'bald', hat: 'none', glasses: true},
  dokter: {outfit: 'shirt', jacket: '#fbfbf8', tie: '#4f8fc8', lower: '#3a4a6a', pocket: '#e8eef4', hair: '#2b2326', hairStyle: 'side', hat: 'none', glasses: true},
  bos: {outfit: 'suit', jacket: '#3a3a48', lapel: '#26262f', tie: '#d8413a', lower: '#2a2a33', hair: '#2b2326', hairStyle: 'side', hat: 'none', mustache: 'thick'},
};

const office = {...LOOK_PRESETS.interiorCool, keyI: 2.3, hemiI: 1.2};
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
export const LOOK = {
  kantor: {keys: [{at: 0, ...office}, {at: 'peramal', ...office, ...MOODS.mystery}, {at: 'kepercayaan', ...office}, {at: 'cut10', ...office, ...MOODS.tense}, {at: 'cut12', ...office}]},
  lab: {...studio},
  klinik: {...LOOK_PRESETS.interiorCool, keyI: 2.4, hemiI: 1.3},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.peramal, dur: 0.3, color: '#b8a0ff', strength: 0.3}, {t: EVt.korsleting, dur: 0.3, color: '#ffffff', strength: 0.35}, {t: EVt.dokter, dur: 0.3, color: '#bfe4ff', strength: 0.25},
      {t: EVt.eh, dur: 0.3, color: '#ff8a7a', strength: 0.3}, {t: EVt.lemburan, dur: 0.35, color: '#ff8a7a', strength: 0.35}, {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.dug, dur: 0.5, amp: 0.012}, {t: EVt.korsleting, dur: 0.3, amp: 0.015}, {t: EVt.lemburan, dur: 0.35, amp: 0.02}],
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
  const twitch = (a, b, step = 0.14) => { const out = []; for (let t = a; t < b; t += step) out.push({t, expr: Math.round((t - a) / step) % 2 ? 'neutral' : 'sleep'}); return out; };

  // ---------- the office: the twitch (1), the fortune tellers (2-3), causes (5-7), waiting for luck (9), overtime (10-11), the question (12) ----------
  {
    const g = addLoc('kantor');
    under(g, '#2a2228');
    g.add(P.room(8, 3, 6, {wall: '#dfe6ea', floor: '#9aa4ac', wain: '#5a7a8a', tiles: true}));
    const desk = P.desk({color: '#b08454'}); at(desk, 0.3, 0, -3.8); g.add(desk);
    const mon = P.monitor('#8fd0e0'); at(mon.group || mon, 0.3, 0.77, -4.0); g.add(mon.group || mon);
    const mug = P.mug('#fbf6ea'); at(mug, 0.85, 0.77, -3.7); g.add(mug);
    const clk = P.wallClock(0.3); clk.set(17, 0); at(clk.group, 2.4, 2.2, -4.85); g.add(clk.group); updaters.push((t) => clk.set(t > E('lemburan') ? 23 : 17, t > E('lemburan') ? 30 : 0));
    const raka = ch('raka', {seed: 1}, g, -0.2, -3.1, 0.1);
    raka.act([{t: 0, pose: 'idle', expr: 'neutral'}, ...twitch(0.4, 3.8), {t: 3.9, pose: 'chin', expr: 'confused'},
      {t: E('wah'), pose: 'idle', expr: 'surprised'}, {t: E('bukan') + 0.1, pose: 'shrug', expr: 'confused'}, {t: E('sedih'), pose: 'idle', expr: 'worried'},
      {t: E('tapi'), pose: 'pointUp', expr: 'thinking'},
      {t: cut(5), pose: 'chin', expr: 'thinking'}, {t: E('stres') - 0.1, pose: 'headHold', expr: 'tired'}, {t: E('kurang') - 0.1, pose: 'idle', expr: 'drowsy'}, {t: E('kopi') - 0.1, pose: 'drink', expr: 'paranoid'}, {t: E('layar') - 0.1, pose: 'tap', expr: 'tired'},
      {t: cut(7), pose: 'idle', expr: 'happy'}, {t: E('tidur2') - 0.1, pose: 'idle', expr: 'sleep'}, {t: E('kurangi') - 0.1, pose: 'stop', expr: 'determined'}, {t: E('istirahatkan') - 0.1, pose: 'cheer', expr: 'happy'},
      {t: cut(9), pose: 'beg', expr: 'cheesy'}, ...twitch(cut(9) + 0.3, E('datang') + 0.3, 0.16), {t: E('datang') + 0.4, pose: 'beg', expr: 'excited'},
      {t: E('eh') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('kerjaan') + 0.1, pose: 'idle', expr: 'shocked'}, {t: E('malam') + 0.1, pose: 'headHold', expr: 'cry'},
      {t: E('lemburan'), pose: 'headHold', expr: 'scream'}, {t: cut(12), pose: 'shrug', expr: 'nervous'}, {t: E('komentar') - 0.15, pose: 'point', expr: 'cheesy'}]);
    raka.act([{t: E('lemburan'), action: 'tremble', dur: 1.5}]);
    label(g, 'DUG!', -0.6, 2.0, -3.0, 3.3, 3.95, {w: 0.32, h: 0.16}); label(g, 'DUG!', 0.2, 2.1, -3.0, 3.5, 4.1, {w: 0.32, h: 0.16}); label(g, 'DUG!', -0.2, 2.25, -3.0, 3.68, 4.3, {w: 0.32, h: 0.16});
    // the fortune tellers
    const tellers = [['t1', -1.3, -3.4, 0.4, 3, L.rezeki], ['t2', 0.85, -3.2, -0.3, 4, L.jauh], ['t3', 1.7, -3.7, -0.4, 5, L.sedih]].map(([k, x, z, y, si, lb], i) => {
      const c = ch(k, {seed: 10 + i}, g, x, z, y); showWhen(c.group, (t) => inShots(t, 2) || inShots(t, 3));
      c.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('peramal') + i * 0.1, pose: 'chin', expr: 'scheming'}]);
      speak(c, si, [[0, ['excited', 'smug', 'sad'][i], ['pointUp', 'point', 'chin'][i]]]);
      label(g, lb, [-0.7, 0.6, 1.25][i], 2.3 + i * 0.32, z + 0.4, T.S[si].start - 0.05, cut(4), {w: 1.3, bg: ['#f2d24a', '#7fc4e8', '#b8a0ff'][i], vis: (t) => inShots(t, 2) || inShots(t, 3)}); return c; });
    const orb = ball(0.16, new THREE.MeshBasicMaterial({color: '#c8b8ff', transparent: true, opacity: 0.85}), {hull: 0.008}); g.add(orb); const og = P.glowSprite('#b8a0ff', 0.9); g.add(og);
    updaters.push((t) => { const on = inShots(t, 2) && t > E('peramal'); orb.visible = og.visible = on; at(orb, -1.0, 1.2, -3.1); at(og, -1.0, 1.2, -3.1); });
    // causes (6): stress cloud, a pillow, coffee cups, the laptop glare
    const cl = P.cloud(0.22, 7, '#5a6070'); g.add(cl); updaters.push((t) => { cl.visible = inShots(t, 6) && t > E('stres') - 0.1; cl.scale.setScalar(pop(t, E('stres') - 0.1, 0.35)); at(cl, -0.2, 2.15, -3.1); });
    fx(g, FX.lightning([-0.1, 2.15, -3.1], [-0.15, 1.95, -3.1], E('stres'), {dur: 0.4, seed: 4}), (t) => inShots(t, 6));
    const zz = sign('Zzz', 0.5, 0.24, {bg: '#2b2b33', fg: '#fbf6ea', frame: '#fbf6ea'}); popSign(g, zz, 0.45, 2.0, -3.0, E('kurang') - 0.05, cut(7));
    const cups = [0, 1, 2, 3, 4].map((i) => { const m = P.mug(['#fbf6ea', '#e8737a', '#7fc4e8'][i % 3]); m.scale.setScalar(1.4); g.add(m); updaters.push((t) => { m.visible = inShots(t, 6) && t > E('kopi') - 0.1 + i * 0.08; at(m, 0.6 + (i % 3) * 0.17, 0.77 + Math.floor(i / 3) * 0.17, -3.65); }); return m; });
    const glare = P.glowSprite('#bfe4ff', 1.4); g.add(glare); updaters.push((t) => { glare.visible = inShots(t, 6) && t > E('layar') - 0.1; at(glare, 0.3, 1.1, -3.85); });
    label(g, L.stres, -0.7, 2.6, -3.0, E('stres') - 0.05, cut(7), {w: 0.7}); label(g, L.tidur, -0.85, 1.75, -3.0, E('kurang') - 0.05, cut(7), {w: 1.0}); label(g, L.kopi, 0.9, 2.6, -3.0, E('kopi') - 0.05, cut(7), {w: 0.6}); label(g, L.layar, 0.9, 2.25, -3.0, E('layar') - 0.05, cut(7), {w: 0.7});
    // fixes (7)
    label(g, L.safe, -0.2, 2.6, -3.0, E('berbahaya') - 0.1, E('caranya'), {w: 1.5, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'});
    [[L.fix1, 'tidur2'], [L.fix2, 'kurangi'], [L.fix3, 'istirahatkan']].forEach(([tx, k], i) => label(g, '✓ ' + tx, 0.8, 2.6 - i * 0.36, -3.0, E(k) - 0.1, cut(8), {w: 1.5, bg: '#fbfbf8', fg: '#1f6a3a'}));
    // waiting for luck (9), the boss (10), overtime (11)
    fx(g, FX.glints([-0.2, 2.0, -3.0], E('menunggu'), {n: 24}), (t) => inShots(t, 9));
    const bos = ch('bos', {seed: 20}, g, 2.6, -3.0, -0.4); showWhen(bos.group, (t) => t > cut(10) - 0.1 && t < cut(12));
    walkPath(bos, [[cut(10), 2.6, -3.0], [E('eh') + 0.4, 0.9, -2.9]]);
    const files = P.fileStack(10); held(bos, files, {y: 0.02, z: 0.1}); showWhen(files, (t) => t < E('malam'));
    const files2 = P.fileStack(14); at(files2, 0.0, 0.77, -3.6); g.add(files2); showWhen(files2, (t) => t > E('malam'));
    bos.act([{t: 0, pose: 'carry', expr: 'smug'}, {t: E('eh'), pose: 'carry', expr: 'scheming'}, {t: E('malam'), pose: 'point', expr: 'smug'}]);
    speak(bos, 19, [[0, 'scheming', 'carry'], [0.6, 'smug', 'point']]);
    label(g, L.lembur, -0.2, 2.45, -2.9, E('lemburan') - 0.05, cut(12), {w: 1.2, h: 0.4, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    label(g, L.question, -0.2, 2.6, -2.9, E('kalau') - 0.1, 1e9, {w: 2.0, h: 0.38, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, -0.2, 2.18, -2.85, E('komentar') - 0.1, 1e9, {w: 1.7, h: 0.32, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([-0.2, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the lab: the eyelid muscle and a little short circuit (4) ----------
  {
    const g = addLoc('lab');
    under(g, '#14161c');
    const fl0 = box(30, 0.04, 14, toon('#262a36', {paint: {seed: 1101}}), {edges: false}); at(fl0, 0, -0.03, -3); g.add(fl0);
    const wall = box(30, 9, 0.2, toon('#1e2840', {paint: {seed: 1102}}), {edges: false}); at(wall, 0, 0, -6.2); g.add(wall);
    const em = P.eyeModel({s: 4}); at(em.group, -0.3, 1.5, -3.6); g.add(em.group);
    updaters.push((t) => { const tw = t > E('otot') && t < cut(5) ? 0.2 + 0.28 * Math.abs(Math.sin(t * 22)) : 0.2; em.setLid(tw); });
    fx(g, FX.sparks([0.9, 1.75, -3.8], E('korsleting'), {n: 40, color: '#f2d24a'}));
    fx(g, FX.lightning([0.7, 1.6, -3.8], [1.3, 1.9, -3.9], E('korsleting') + 0.05, {dur: 0.5, seed: 9, color: '#f2d24a'}));
    label(g, L.otot, -0.3, 2.8, -3.4, E('otot') - 0.1, cut(5), {w: 1.8, bg: '#e8737a', fg: '#fff3df', frame: '#8a2a36'});
    label(g, L.short, -0.3, 0.45, -3.0, E('korsleting') - 0.1, cut(5), {w: 1.9, bg: '#f2d24a'});
  }

  // ---------- the clinic: when to see a doctor (8) ----------
  {
    const g = addLoc('klinik');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#e8f0f4', floor: '#bfc8cc', wain: '#7fb0c8', tiles: true}));
    const crs = sign('+', 0.5, 0.5, {bg: '#fbfbf8', fg: '#d8312a', frame: '#d8312a'}); at(crs, -1.8, 2.2, -4.85); g.add(crs);
    const dok = ch('dokter', {seed: 30}, g, -0.9, -3.2, 0.3);
    dok.act([{t: 0, pose: 'present', expr: 'thinking'}, {t: E('minggu'), pose: 'pointUp', expr: 'determined'}, {t: E('dokter') - 0.1, pose: 'present', expr: 'happy'}]);
    [[L.w1, 'minggu'], [L.w2, 'tertutup'], [L.w3, 'menjalar']].forEach(([tx, k], i) => label(g, '⚠ ' + tx, 0.45, 2.55 - i * 0.36, -3.1, E(k) - 0.1, cut(9), {w: 1.5, bg: '#f2d24a'}));
    label(g, L.doctor, 0.45, 1.35, -3.0, E('dokter') - 0.1, cut(9), {w: 1.7, bg: '#4f8fc8', fg: '#fff3df', frame: '#2f5a8a'});
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
