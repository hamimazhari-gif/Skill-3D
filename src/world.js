// All locations in one scene at different x offsets. Story: "Kalau suhu Bumi turun 30 derajat" (snow on Monas, Snowball Earth).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {space: 0, jakarta: 40, house: 80, field: 120, lab: 160};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'cheery' (new for this video; round no-sleep face, side hair, thick brows, slim limbs).
export const CHAR_DESIGN = 'cheery';
const CAST = {
  bapak: {outfit: 'tshirt', jacket: '#d8413a', print: '#fff3df', print2: '#f2d24a', lower: '#3a4050', tie: '#d8413a', hair: '#2b2326', hairStyle: 'side', hat: 'none', mustache: 'thick'},
  ibu: {hairStyle: 'hijab', hijab: '#4f8a6a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#e8c35a', print: '#fff3df', print2: '#8a4a2a', lower: '#5a4a3a', tie: '#e8c35a', round: true},
  dek: {outfit: 'tshirt', jacket: '#4f8fc8', print: '#fff3df', print2: '#f2d24a', lower: '#3a4050', tie: '#4f8fc8', hair: '#2b2326', hairStyle: 'tuft', hat: 'none'},
  ilmuwan: {outfit: 'shirt', jacket: '#fbf6ea', tie: '#2f6a8a', lower: '#3a3a48', pocket: '#e8e0d0', hair: '#9a9a9a', hairStyle: 'side', hat: 'none', glasses: true, mustache: 'thin'},
};

// Lighting: deep space for the Earth, a hot Jakarta day that turns into a cold grey-blue winter, a cold blue house
// (warm glow from the rice cooker), a frozen field, a cool lab.
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
const winter = {...LOOK_PRESETS.winter, near: 30, far: 120};
const hot = {...LOOK_PRESETS.noon, near: 30, far: 120, grade: {sat: 1.1, contrast: 1.05, tint: '#ffd8a0', tintAmt: 0.1, vignette: 0.3}};
const coldRoom = {...LOOK_PRESETS.interiorCool, keyI: 1.8, hemiI: 1.0, grade: {sat: 0.8, contrast: 1.05, tint: '#a8c4e8', tintAmt: 0.14, vignette: 0.5}};
export const LOOK = {
  space: {...studio},
  jakarta: {keys: [{at: 0, ...hot}, {at: 'anjlok', ...winter}, {at: 'tapi', ...winter, ...MOODS.sad}, {at: 'cut11', ...hot}, {at: 'cut12', ...winter}]},
  house: {keys: [{at: 0, ...coldRoom}, {at: 'magicCom', ...coldRoom, grade: {sat: 0.95, contrast: 1.05, tint: '#ffd0a0', tintAmt: 0.08, vignette: 0.5}}]},
  field: {keys: [{at: 0, ...winter}, {at: 'uduk', ...LOOK_PRESETS.overcast}]},
  lab: {keys: [{at: 0, ...LOOK_PRESETS.interiorCool, keyI: 2.2, hemiI: 1.2}, {at: 'bencana', ...LOOK_PRESETS.interiorCool, keyI: 2.2, hemiI: 1.2, ...MOODS.danger}]},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.tigaPuluh0, dur: 0.35, color: '#dff0ff', strength: 0.45}, {t: EVt.salju, dur: 0.35, color: '#ffffff', strength: 0.4}, {t: EVt.magicCom, dur: 0.3, color: '#ffd0a0', strength: 0.3},
      {t: EVt.melambung, dur: 0.3, color: '#ff8a7a', strength: 0.3}, {t: EVt.bolaSalju, dur: 0.35, color: '#ffffff', strength: 0.45}, {t: EVt.bencana, dur: 0.35, color: '#ff8a7a', strength: 0.4},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.tigaPuluh0, dur: 0.3, amp: 0.015}, {t: EVt.minggir, dur: 0.3, amp: 0.015}, {t: EVt.bencana, dur: 0.4, amp: 0.02}],
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
  const problem = (g, n, x, y, z, k, until) => label(g, L['m' + n], x, y, z, E(k) - 0.1, until, {w: 1.2, h: 0.32, bg: '#2b2b33', fg: '#7fc4e8', frame: '#7fc4e8'});
  const lerpT = (t, a, b, va, vb) => va + (vb - va) * smooth((t - a) / Math.max(0.01, b - a));
  const frost = (gl, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r * 1.01, 32, 16), new THREE.MeshBasicMaterial({color: '#f3f8ff', transparent: true, opacity: 0, depthWrite: false})); gl.group.add(m); return m; };
  const iceCap = (gl, r, top) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r * 1.015, 32, 16, 0, Math.PI * 2, top ? 0 : Math.PI, Math.PI / 2), toon('#f3f8ff', {wear: false})); if (!top) m.rotation.x = 0; gl.group.add(m); return m; };

  // ---------- space: the whole Earth cools (1), the ice-albedo loop (8) ----------
  {
    const g = addLoc('space');
    under(g, '#0c0f18');
    const bg = box(40, 16, 0.2, toon('#101526', {wear: false}), {edges: false}); at(bg, 0, -3, -10); g.add(bg);
    const st = P.stars(); at(st, 0, 0, -9); g.add(st);
    const gl = P.globe(1.1); at(gl.group, 0, 1.8, -3.6); g.add(gl.group); updaters.push((t) => { gl.group.rotation.y = t * 0.25; });
    const fr = frost(gl, 1.1); updaters.push((t) => { fr.material.opacity = inShots(t, 1) ? lerpT(t, E('turun0'), E('tigaPuluh0') + 1.2, 0, 0.55) : 0; });
    const th = P.thermometer(2.0); at(th.group, 1.75, 0.6, -3.0); g.add(th.group);
    updaters.push((t) => { th.group.visible = inShots(t, 1); th.set(lerpT(t, E('turun0'), E('tigaPuluh0') + 1.0, 15, -15)); });
    label(g, L.minus30, 1.75, 3.0, -3.0, E('tigaPuluh0') - 0.05, cut(2), {w: 0.9, h: 0.38, bg: '#4f8fc8', fg: '#fff3df', frame: '#2f5a8a'});
    // the albedo loop: the sun shines, ice reflects, ice grows
    const AX = 12;
    const gl2 = P.globe(1.1); at(gl2.group, AX + 0.6, 1.8, -3.8); g.add(gl2.group); updaters.push((t) => { gl2.group.rotation.y = t * 0.2; });
    const capN = iceCap(gl2, 1.1, true), capS = iceCap(gl2, 1.1, false);
    updaters.push((t) => { const k = lerpT(t, E('putih') - 0.2, E('putih') + 0.5, 0.25, 0.35) + lerpT(t, E('banyakEs'), E('banyakEs') + 1.0, 0, 0.25) + lerpT(t, E('dingin'), E('dingin') + 1.0, 0, 0.3) + lerpT(t, E('siklus'), E('berulang') + 0.8, 0, 0.1);
      capN.scale.set(1, 1, 1); capN.geometry.dispose(); capN.geometry = new THREE.SphereGeometry(1.115, 32, 16, 0, Math.PI * 2, 0, Math.PI * Math.min(0.5, k)); capS.geometry.dispose(); capS.geometry = new THREE.SphereGeometry(1.115, 32, 16, 0, Math.PI * 2, Math.PI * (1 - Math.min(0.5, k)), Math.PI * Math.min(0.5, k)); });
    const sun = P.sunRays(0.6); at(sun, AX - 2.0, 3.2, -4.5); g.add(sun);
    const arrows = [0, 1, 2].map((i) => { const inA = P.arrow(1.6, '#f2c23a'); g.add(inA); const outA = P.arrow(1.4, '#bfe4ff'); g.add(outA);
      updaters.push((t) => { const y = 2.4 - i * 0.45; at(inA, AX - 1.4, y + 0.3, -4.0, 0, 0, -1.9); inA.visible = inShots(t, 8) && t > E('putih') - 0.3 + i * 0.1;
        at(outA, AX - 0.35, y, -3.4, 0, 0, 1.1 + i * 0.1); outA.visible = inShots(t, 8) && t > E('memantulkan') + i * 0.12; outA.scale.setScalar(pop(t, E('memantulkan') + i * 0.12, 0.3)); }); return inA; });
    label(g, L.reflect, AX - 1.2, 0.6, -3.4, E('memantulkan') - 0.05, E('banyakEs'), {w: 1.2, bg: '#bfe4ff'});
    label(g, L.moreIce, AX + 0.6, 3.35, -3.6, E('banyakEs') - 0.05, E('dingin'), {w: 1.3, bg: '#f3f8ff'});
    label(g, L.colder, AX + 0.6, 3.35, -3.6, E('dingin') - 0.05, E('siklus'), {w: 1.3, bg: '#7fc4e8'});
    label(g, L.cycle, AX + 0.6, 3.35, -3.6, E('siklus') - 0.05, cut(9), {w: 1.6, bg: '#2b2b33', fg: '#7fc4e8', frame: '#7fc4e8'});
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 6, 48, Math.PI * 1.7), new THREE.MeshBasicMaterial({color: '#7fc4e8'})); g.add(ring);
    const rh = P.arrow(0.4, '#7fc4e8', 0.05); ring.add(rh); at(rh, 1.6 * Math.cos(Math.PI * 1.7), 1.6 * Math.sin(Math.PI * 1.7), 0, 0, 0, Math.PI * 1.7);
    updaters.push((t) => { ring.visible = inShots(t, 8) && t > E('siklus') - 0.1; at(ring, AX + 0.6, 1.8, -3.0, 0, 0, -t * 2.5); ring.scale.setScalar(pop(t, E('siklus') - 0.1, 0.4)); });
    problem(g, 3, AX + 0.6, 3.35, -3.6, 'masalah3', E('putih') - 0.15);
  }

  // ---------- Jakarta: snow on Monas (2-4), back to the heat (11), the question (12) ----------
  {
    const g = addLoc('jakarta');
    under(g, '#8fae6a', 160);
    const grass = box(60, 0.03, 40, toon('#8fae6a', {paint: {seed: 611, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -12); g.add(grass);
    const plaza = box(10, 0.04, 26, toon('#d8d0c0', {paint: {seed: 612}}), {edges: false}); at(plaza, 0, -0.01, -10); g.add(plaza);
    const mon = P.monas(10); at(mon, 0, 0, -18); g.add(mon);
    for (let i = 0; i < 10; i++) { const tr = P.tree({seed: 620 + i, h: 2.8}); at(tr, (i % 2 ? 1 : -1) * (5.5 + (i % 3) * 1.2), 0, -4 - i * 2.2); g.add(tr); }
    [[-12, -26, '#e8dcc0'], [-8, -30, '#bfd8e8'], [9, -28, '#f3efe6'], [13, -24, '#e0c8a8']].forEach(([x, z, c], i) => { const b = box(3.5, 7 + i * 2, 3, toon(c, {paint: {seed: 630 + i, windows: true}})); at(b, x, 0, z); g.add(b); });
    const snowy = (t) => t > E('salju') && (t < cut(11) || t >= cut(12));
    const cover = box(60, 0.05, 40, toon('#f3f8ff', {wear: false}), {edges: false}); at(cover, 0, 0.01, -12); g.add(cover);
    updaters.push((t) => { const u = inShots(t, 12) ? 1 : smooth((t - E('salju') - 0.3) / 2.5); cover.visible = snowy(t) && u > 0.02; cover.position.y = -0.04 + u * 0.06; });
    fx(g, FX.fall([0, -6, 16, 16], {n: 900, h: 9, speed: 1.2, color: '#ffffff', size: 0.09, drift: 0.4, sway: 0.4, from: E('salju') - 0.2, to: cut(11)}));
    fx(g, FX.fall([0, -6, 16, 16], {n: 900, h: 9, speed: 1.2, color: '#ffffff', size: 0.09, drift: 0.4, sway: 0.4, seed: 13, from: cut(12), to: 1e9}));
    const th = P.thermometer(1.6); at(th.group, 1.15, 0.0, -3.3); g.add(th.group);
    updaters.push((t) => { th.group.visible = inShots(t, 2); th.set(lerpT(t, E('panasnya'), E('nol') + 0.5, 30, 0)); });
    label(g, L.temp30, 1.15, 2.1, -3.3, E('panasnya') - 0.05, E('anjlok'), {w: 0.8, h: 0.34, bg: '#f2a93a'});
    label(g, L.temp0, 1.15, 2.1, -3.3, E('anjlok') - 0.05, cut(3), {w: 0.8, h: 0.34, bg: '#7fc4e8'});
    const fam = [['bapak', -0.75, -3.0, 0.2, 1], ['ibu', 0.15, -3.2, 0, 1], ['dek', -0.25, -2.5, 0.1, 0.7]].map(([k, x, z, y, s], i) => {
      const c = ch(k, {seed: 1 + i, scale: s}, g, x, z, y); showWhen(c.group, (t) => !inShots(t, 11) || k === 'bapak');
      return c; });
    const [bapak, ibu, dek] = fam;
    bapak.act([{t: cut(2), pose: 'idle', expr: 'tired'}, {t: E('anjlok') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('salju') + 0.1, pose: 'pointUp', expr: 'excited'},
      {t: cut(3), pose: 'cheer', expr: 'toothy'}, {t: E('tapi') + 0.1, pose: 'cross', expr: 'chatter'},
      {t: cut(11), pose: 'hold', expr: 'tired'}, {t: E('ingat') + 0.05, pose: 'hips', expr: 'happy'}, {t: E('magic2') + 0.05, pose: 'present', expr: 'cheesy'},
      {t: cut(12), pose: 'cross', expr: 'chatter'}, {t: E('kalau') + 0.1, pose: 'shrug', expr: 'cheesy'}, {t: E('komentar') - 0.15, pose: 'point', expr: 'cheesy'}]);
    bapak.act([{t: E('tapi'), action: 'tremble', dur: 2.2}, {t: E('panas') - 0.2, action: 'tremble', dur: 0.01}]);
    ibu.act([{t: cut(2), pose: 'idle', expr: 'tired'}, {t: E('anjlok') + 0.15, pose: 'headHold', expr: 'shocked'}, {t: E('salju') + 0.15, pose: 'presentBoth', expr: 'excited'},
      {t: cut(3), pose: 'cheer', expr: 'laugh'}, {t: E('tapi') + 0.15, pose: 'cross', expr: 'chatter'}, {t: cut(12), pose: 'cross', expr: 'chatter'}]);
    ibu.act([{t: E('tapi') + 0.1, action: 'tremble', dur: 2.2}, {t: cut(12), action: 'tremble', dur: 4.0}]);
    dek.act([{t: cut(2), pose: 'idle', expr: 'tired'}, {t: E('salju') + 0.1, pose: 'armsUp', expr: 'excited'}, {t: E('luarNegeri') - 0.1, pose: 'cheer', expr: 'cheesy'},
      {t: E('tapi') + 0.05, pose: 'cross', expr: 'chatter'}, {t: cut(12), pose: 'armsUp', expr: 'cheesy'}]);
    dek.act([{t: E('wah') - 0.1, action: 'jump', dur: 0.5}, {t: E('tapi') + 0.1, action: 'tremble', dur: 2.2}]);
    speak(dek, 3, [[0, 'excited', 'armsUp'], [0.45, 'cheesy', 'cheer']]);
    label(g, L.abroad, -0.25, 2.1, -2.8, E('luarNegeri') - 0.1, cut(4), {w: 1.9, h: 0.34, bg: '#7fc4e8', vis: (t) => inShots(t, 3)});
    // back in the heat (11): sweat, a fan of paper, and no rice cooker to hug
    fx(g, FX.glints([-0.75, 2.2, -3.0], E('ingat'), {n: 20}), (t) => inShots(t, 11));
    const sweat = FX.smoke([-0.75, 2.1, -3.0], cut(11), {n: 10, every: 0.25, life: 1.2, size: 0.25, grow: 2, rise: 0.6, color: '#fff2d0', opacity: 0.4}); fx(g, sweat, (t) => inShots(t, 11));
    const rc = P.riceCooker(1.3); g.add(rc); updaters.push((t) => { rc.visible = inShots(t, 11) && t > E('magic2') - 0.1; rc.scale.setScalar(1.3 * pop(t, E('magic2') - 0.1, 0.35)); at(rc, 0.35, 0.0, -2.9); });
    label(g, 'NGGAK PERLU!', 0.4, 0.95, -2.85, E('magic2') + 0.2, cut(12), {w: 1.0, h: 0.26, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a', vis: (t) => inShots(t, 11)});
    label(g, L.question, -0.25, 2.75, -2.7, E('kalau') - 0.1, 1e9, {w: 2.4, h: 0.4, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, -0.25, 2.32, -2.65, E('komentar') - 0.12, 1e9, {w: 1.7, h: 0.36, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([-0.25, 2.9, -2.5], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the house: not ready for cold (5), hugging the rice cooker (6) ----------
  {
    const g = addLoc('house');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#f0e0c0', floor: '#a8784a', wain: '#7a9a8a'}));
    for (const x of [-2.0, 1.8]) { const w = sign('', 0.9, 0.9, {bg: '#bfd8e8', frame: '#fbf6ea', wear: false}); at(w, x, 1.3, -4.86); g.add(w); for (let k = 0; k < 4; k++) { const lv = box(0.85, 0.03, 0.05, '#8a6242', {hull: 0}); at(lv, x, 1.0 + k * 0.2, -4.8, 0, 0.4); g.add(lv); } }
    const fanP = P.fan(); at(fanP, 2.4, 0, -3.8, -0.5); g.add(fanP); updaters.push((t) => { fanP.userData.blades.rotation.z = t * 12; });
    fx(g, FX.fall([0, -3, 6, 4], {n: 120, h: 3, speed: 0.6, color: '#ffffff', size: 0.06, drift: 0.3, sway: 0.3, seed: 31}));
    const tbl = box(0.9, 0.38, 0.6, toon('#8a5a3a', {paint: {planks: 3, seed: 641}})); at(tbl, 0, 0, -2.9); g.add(tbl);
    const rc = P.riceCooker(1.1); at(rc, 0, 0.38, -2.9); g.add(rc);
    const glowL = FX.fireLight([0, 1.0, -2.6], {intensity: 1.6, dist: 3}); g.add(glowL.obj); updaters.push((t) => { glowL.update(t); glowL.obj.visible = t > E('magicCom') - 0.2; });
    const fam = [['bapak', -1.6, -3.6, 0.3, 1], ['ibu', 1.5, -3.6, -0.3, 1], ['dek', -0.6, -3.9, 0.1, 0.7]].map(([k, x, z, y, s], i) => ch(k, {seed: 10 + i, scale: s}, g, x, z, y));
    const [bapak, ibu, dek] = fam;
    walkPath(bapak, [[E('berebut') - 0.3, -1.6, -3.6], [E('magicCom') + 0.2, -0.55, -3.3], [E('minggir') - 0.1, -0.55, -3.3], [E('giliran'), 0.0, -3.35]]);
    walkPath(ibu, [[E('berebut') - 0.2, 1.5, -3.6], [E('magicCom') + 0.3, 0.6, -3.35]]);
    walkPath(dek, [[E('berebut') - 0.1, -0.6, -3.9], [E('magicCom'), 0.0, -3.4], [E('minggir') - 0.05, 0.0, -3.4], [E('minggir') + 0.4, 1.15, -3.6]], 'run');
    problem(g, 1, 0, 2.75, -3.4, 'masalah1', E('sejuk'));
    label(g, L.notReady, 0, 2.38, -3.35, E('siap') - 0.1, E('sejuk'), {w: 1.9, fg: '#2f5a8a'});
    label(g, L.noHeater, 0, 2.6, -3.35, E('pemanas') - 0.1, E('jaket'), {w: 1.9, fg: '#d8413a'});
    label(g, L.noJacket, 0, 2.6, -3.35, E('jaket') - 0.1, E('keluarga'), {w: 2.0, fg: '#d8413a'});
    bapak.act([{t: cut(5), pose: 'cross', expr: 'chatter'}, {t: E('sejuk') + 0.1, pose: 'shrug', expr: 'worried'}, {t: E('pemanas'), pose: 'cross', expr: 'chatter'},
      {t: E('magicCom'), pose: 'read', expr: 'happy'}, {t: E('minggir') - 0.1, pose: 'stop', expr: 'gritted'}, {t: E('giliran') + 0.1, pose: 'read', expr: 'toothy'}]);
    ibu.act([{t: cut(5), pose: 'cross', expr: 'chatter'}, {t: E('magicCom') + 0.1, pose: 'read', expr: 'happy'}, {t: E('minggir') + 0.1, pose: 'read', expr: 'confused'}]);
    dek.act([{t: cut(5), pose: 'cross', expr: 'chatter'}, {t: E('magicCom') + 0.05, pose: 'read', expr: 'laugh'}, {t: E('minggir') + 0.1, pose: 'headHold', expr: 'cry'}]);
    for (const c of fam) c.act([{t: cut(5), action: 'tremble', dur: E('magicCom') - cut(5)}]);
    speak(bapak, 9, [[0, 'gritted', 'stop'], [0.45, 'toothy', 'read']]);
    fx(g, FX.glints([0, 0.9, -2.9], E('magicCom'), {n: 20, color: '#ffd0a0'}));
  }

  // ---------- the rice field freezes, nasi uduk costs a fortune (7) ----------
  {
    const g = addLoc('field');
    under(g, '#8fae6a', 160);
    const grass = box(60, 0.03, 40, toon('#7a9a6a', {paint: {seed: 651, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -12); g.add(grass);
    g.add(P.hills('#9ab0a0'));
    const water = box(8, 0.03, 6, toon('#8ab0c8', {wear: false}), {edges: false}); at(water, -0.5, 0.0, -4.5); g.add(water);
    const rows = []; for (let r = 0; r < 6; r++) { const p = P.paddy(10, {seed: r + 3}); at(p.group, -0.5, 0.02, -2.4 - r * 0.6); g.add(p.group); rows.push(p); }
    updaters.push((t) => rows.forEach((p, i) => p.freeze(smooth((t - E('membeku') + 0.2 - i * 0.05) / 1.0))));
    const ice = box(8, 0.04, 6, new THREE.MeshBasicMaterial({color: '#e8f4ff', transparent: true, opacity: 0.6, depthWrite: false}), {edges: false}); at(ice, -0.5, 0.03, -4.5); g.add(ice); updaters.push((t) => { ice.visible = t > E('membeku'); });
    fx(g, FX.fall([0, -5, 14, 12], {n: 500, h: 8, speed: 1.2, color: '#ffffff', size: 0.08, drift: 0.4, sway: 0.4, seed: 41}));
    problem(g, 2, -0.5, 2.6, -3.4, 'masalah2', E('butuh'));
    label(g, L.frozen, -0.5, 2.25, -3.35, E('membeku') - 0.1, E('uduk') - 0.15, {w: 1.6, bg: '#bfe4ff'});
    label(g, L.scarce, -0.5, 1.85, -3.3, E('langka') - 0.1, E('uduk') - 0.15, {w: 1.4, fg: '#d8413a'});
    // the nasi uduk stall
    const WX = 7;
    const st = P.stall(L.warung, {w: 2.2}); at(st, WX, 0, -3.4); g.add(st);
    const plate = P.plate(); at(plate, WX, 0.86, -3.1); g.add(plate);
    label(g, L.price1, WX, 1.55, -2.7, E('uduk') - 0.2, E('melambung') - 0.05, {w: 1.6, h: 0.32});
    label(g, L.price2, WX, 1.55, -2.7, E('melambung') - 0.05, cut(8), {w: 1.8, h: 0.36, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const ar = P.arrow(1.0, '#d8312a', 0.07); g.add(ar); updaters.push((t) => { ar.visible = t > E('melambung'); at(ar, WX + 1.1, 1.3 + smooth((t - E('melambung')) / 0.6) * 0.6, -2.7); });
    const bp = ch('bapak', {seed: 20}, g, WX - 0.9, -2.4, 0.4);
    bp.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('melambung') + 0.05, pose: 'headHold', expr: 'scream'}]); bp.act([{t: E('melambung'), action: 'jump', dur: 0.5}]);
  }

  // ---------- the lab: Snowball Earth (9), the comparison (10) ----------
  {
    const g = addLoc('lab');
    under(g, '#2a2228');
    g.add(P.room(7, 3.2, 6, {wall: '#dfe6ea', floor: '#9aa4ac', wain: '#5a7a8a', tiles: true}));
    const stand = cyl(0.25, 0.35, 0.9, '#5a6a7a'); at(stand, 0.6, 0, -3.6); g.add(stand);
    const sb = P.globe(0.7); at(sb.group, 0.6, 1.65, -3.6); g.add(sb.group); updaters.push((t) => { sb.group.rotation.y = t * 0.3; });
    const sf = frost(sb, 0.7); updaters.push((t) => { sf.material.opacity = lerpT(t, E('tertutup') - 0.3, E('tertutup') + 0.8, 0, 0.92); });
    fx(g, FX.glints([0.6, 1.7, -3.3], E('bolaSalju'), {n: 24}));
    label(g, L.ago, 0.2, 2.75, -3.5, E('tujuhRatus') - 0.1, cut(10), {w: 2.0, bg: '#fbf6ea'});
    label(g, L.snowball, 0.6, 0.45, -3.0, E('bolaSalju') - 0.1, cut(10), {w: 1.8, h: 0.36, bg: '#bfe4ff'});
    const sci = ch('ilmuwan', {seed: 30}, g, -1.0, -3.0, 0.35);
    sci.act([{t: cut(9), pose: 'idle', expr: 'thinking'}, {t: E('khayalan') + 0.05, pose: 'pointUp', expr: 'determined'}, {t: E('ilmuwan') + 0.1, pose: 'present', expr: 'proud'},
      {t: E('bolaSalju') + 0.05, pose: 'presentBoth', expr: 'excited'}, {t: cut(10), pose: 'present', expr: 'thinking'}, {t: E('enam') + 0.1, pose: 'point', expr: 'worried'},
      {t: E('tigaPuluh2') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('bencana'), pose: 'headHold', expr: 'scream'}]);
    sci.act([{t: E('bencana'), action: 'jump', dur: 0.5}]);
    // two thermometers: the last ice age (−6) and today's what-if (−30)
    const CX = 6;
    const room2 = P.room(7, 3.2, 6, {wall: '#dfe6ea', floor: '#9aa4ac', wain: '#5a7a8a', tiles: true}); room2.position.x = CX; g.add(room2);
    const t1 = P.thermometer(2.0), t2 = P.thermometer(2.0); at(t1.group, CX - 0.6, 0.3, -3.4); at(t2.group, CX + 0.6, 0.3, -3.4); g.add(t1.group, t2.group);
    updaters.push((t) => { t1.set(lerpT(t, E('zamanEs'), E('enam') + 0.4, 15, 9)); t2.set(lerpT(t, E('tigaPuluh2') - 0.2, E('tigaPuluh2') + 1.0, 15, -15)); });
    label(g, L.iceAge, CX - 0.6, 2.75, -3.3, E('zamanEs') - 0.1, 1e9, {w: 1.1, h: 0.4, sub: L.d6});
    label(g, 'TURUN 30°', CX + 0.6, 2.75, -3.3, E('tigaPuluh2') - 0.1, 1e9, {w: 1.1, h: 0.4, sub: L.d30, bg: '#bfe4ff'});
    label(g, L.disaster, CX, 0.45, -2.9, E('bencana') - 0.05, 1e9, {w: 1.8, h: 0.36, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const sci2 = ch('ilmuwan', {seed: 31}, g, CX - 1.6, -3.0, 0.4);
    sci2.act([{t: 0, pose: 'point', expr: 'thinking'}, {t: E('enam') + 0.1, pose: 'point', expr: 'worried'}, {t: E('tigaPuluh2') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('bencana'), pose: 'headHold', expr: 'scream'}]);
    sci2.act([{t: E('bencana'), action: 'jump', dur: 0.5}]);
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
