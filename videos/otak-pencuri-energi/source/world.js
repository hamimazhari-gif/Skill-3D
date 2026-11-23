// All locations in one scene at different x offsets. Story: "Otak, si pencuri energi / Your brain, the energy thief".
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, patternMat, pop, smooth, clamp01, INK, rng} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {home: 0, lab: 40, power: 80, neuro: 120, study: 160, kids: 200};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look for this story (palette overrides on top of char.js PALETTES). Design: 'pill' (new for this video).
export const CHAR_DESIGN = 'pill';
const CAST = {
  hero: {jacket: '#3f8fbf', lower: '#2f3a4a', tie: '#f2d24a', hair: '#3a2a26', hat: 'none', hairStyle: 'fringe', pocket: '#2f6f9a'},
  kid: {jacket: '#f2c84a', lower: '#5a7fb0', tie: '#c75b5b', hair: '#3a2a26', hat: 'none', hairStyle: 'tuft', pocket: '#d9a83a', scale: 0.62},
};

// Lighting plan (camera_plan.md): a warm home that turns mysterious while the energy is stolen, joyful for the advice;
// a cool lab turning joyful when the brain is revealed; a dark room lit only when the bulb switches on; a purple
// neuron space; an evening study desk going tense on the plot twist; a bright joyful playroom.
const homeWarm = {...LOOK_PRESETS.interiorWarm, keyI: 2.1, hemiI: 0.95, keyPos: [-4, 8, 8], grade: {sat: 1.05, contrast: 1.08, tint: '#ffc890', tintAmt: 0.08, vignette: 0.45}};
const labCool = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, keyPos: [-4, 8, 8], grade: {sat: 1.0, contrast: 1.08, tint: '#d8e6ff', tintAmt: 0.05, vignette: 0.42}};
const darkRoom = {...LOOK_PRESETS.night, fog: '#141824', near: 8, far: 30, keyI: 0.9, hemiI: 0.95, keyPos: [-4, 8, 6], moon: false, hemiSky: '#7a88b8', hemiGround: '#3a3550',
  grade: {sat: 0.9, contrast: 1.06, tint: '#8a9ad8', tintAmt: 0.1, vignette: 0.5}};
const litRoom = {...LOOK_PRESETS.interiorWarm, keyI: 2.0, hemiI: 1.2, keyPos: [4, 7, 6], grade: {sat: 1.05, contrast: 1.04, tint: '#ffd890', tintAmt: 0.12, vignette: 0.4}};
const neuroSpace = {fog: '#1a1030', near: 14, far: 60, skyTop: '#0c0620', skyBottom: '#2e1a58', key: '#d8c0ff', keyI: 1.6, hemiI: 1.15, keyPos: [-5, 9, 6],
  hemiSky: '#b89aff', hemiGround: '#3a2a5a', grade: {sat: 1.05, contrast: 1.06, tint: '#b090ff', tintAmt: 0.1, vignette: 0.5}};
const studyEve = {...LOOK_PRESETS.interiorWarm, keyI: 1.7, hemiI: 0.9, keyPos: [4, 6, 6], grade: {sat: 1.0, contrast: 1.04, tint: '#ffc080', tintAmt: 0.1, vignette: 0.42}};
const kidsDay = {...LOOK_PRESETS.interiorWarm, keyI: 1.9, hemiI: 0.95, keyPos: [-4, 8, 8], grade: {sat: 1.12, contrast: 1.07, tint: '#ffe0a0', tintAmt: 0.06, vignette: 0.4}};

export const LOOK = {
  home: {keys: [{at: 0, ...homeWarm}, {at: 'mencuri', ...homeWarm, ...MOODS.mystery}, {at: 'cut8', ...homeWarm, ...MOODS.joyful}, {at: 'cut9', ...homeWarm}]},
  lab: {keys: [{at: 0, ...labCool}, {at: 'otakmu', ...labCool, ...MOODS.joyful}, {at: 'cut6', ...labCool}]},
  power: {keys: [{at: 0, ...darkRoom}, {at: 'lampu', ...darkRoom}, {at: 'lampu', ...litRoom}]},
  neuro: neuroSpace,
  study: {keys: [{at: 0, ...studyEve}, {at: 'twist', ...studyEve, ...MOODS.tense}, {at: 'kurus', ...studyEve, ...MOODS.sad}]},
  kids: kidsDay,
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
const patMat = (kind, base) => patternMat(kind, {base, planks: 3, seed: 5});
const under = (g, color) => { const gr = ground(40, 40, color); gr.position.y = -0.05; g.add(gr); };

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.otakmu + 0.05, dur: 0.4, color: '#ffc0d0', strength: 0.5},
      {t: EVt.lampu + 0.05, dur: 0.4, color: '#ffe9a0', strength: 0.55},
      {t: EVt.twist + 0.05, dur: 0.35, color: '#ffffff', strength: 0.45},
      {t: EVt.separuh + 0.05, dur: 0.35, color: '#ffe9a0', strength: 0.4},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.otakmu + 0.05, dur: 0.35, amp: 0.02}, {t: EVt.twist + 0.05, dur: 0.4, amp: 0.03}, {t: EVt.kurus + 0.2, dur: 0.3, amp: 0.02}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar(name === 'kid' ? 'hero' : name, {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, 0, 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const zzz = (g, base, vis) => {
    const zs = [0, 1, 2].map((i) => { const s = P.glyph('Z', 0.22 - i * 0.04, '#dfe8ff'); g.add(s); return s; });
    updaters.push((t) => zs.forEach((s, i) => {
      const u = ((t * 0.55 + i / 3) % 1); s.visible = vis(t);
      s.position.set(base[0] + 0.12 + u * 0.35 + Math.sin(u * 6 + i) * 0.04, base[1] + u * 0.6, base[2]);
      s.material.opacity = Math.sin(u * Math.PI);
    }));
  };
  // Glowing energy orbs flowing along an arc from a to b while vis(t).
  const orbFlow = (g, a, b, o = {}) => {
    const {n = 14, color = '#ffe08a', size = 0.2, speed = 0.7, lift = 0.8, vis} = o;
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), M = A.clone().lerp(B, 0.5); M.y += lift;
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const orbs = []; for (let i = 0; i < n; i++) { const s = P.glowSprite(color, size); g.add(s); orbs.push(s); }
    updaters.push((t) => orbs.forEach((s, i) => {
      s.visible = vis(t); if (!s.visible) return;
      const u = (t * speed + i / n) % 1; s.position.copy(curve.getPoint(u)); s.material.opacity = Math.sin(u * Math.PI);
    }));
  };

  // ---------- home: living room + kitchen corner + bed (shots 1, 8, 9) ----------
  {
    const g = addLoc('home');
    under(g, '#3a3036');
    g.add(P.room(8, 3.6, 7, {wall: '#efdcbc', floor: '#b08a5e', wain: '#7a9a6a'}));
    const sofa = P.sofa('#c75b5b'); at(sofa, -2.4, 0, -5.0); g.add(sofa);
    const bd = P.bed({color: '#8a5a3a', sheet: '#7fa6c9'}); at(bd, 2.55, 0, -4.7); g.add(bd);
    // set dressing: rug, shelf, framed picture, plants, curtains, floor lamp, jars
    const rg = P.rug(3.2, 2.2, {seed: 4}); rg.position.set(-0.4, 0, -3.0); g.add(rg);
    const sh = P.shelf(1.3, 1.9, {seed: 11}); at(sh, -3.55, 0, -3.2, Math.PI / 2); g.add(sh);
    const pic = P.pictureFrame(1.0, 0.7); at(pic, 2.6, 2.3, -5.85); g.add(pic);
    const pl1 = P.pottedPlant(1.1, 3); at(pl1, -3.4, 0, -5.5); g.add(pl1);
    const pl2 = P.pottedPlant(0.9, 8); at(pl2, 1.45, 0, -5.55); g.add(pl2);
    for (const cx2 of [-1.75, 0.25]) { const ct = P.curtain(0.55, 2.1, '#8a3f4a'); at(ct, cx2 + (cx2 < 0 ? 0 : 0.9), 0.9, -5.8); g.add(ct); }
    const fl = P.lantern({intensity: 3}); at(fl.group, 3.55, 0.9, -5.3); g.add(fl.group); updaters.push(fl.update);
    const lampPole = cyl(0.03, 0.05, 0.9, toon('#3a3430', {rough: 0.4, metal: 0.7})); at(lampPole, 3.55, 0, -5.3); g.add(lampPole);
    const j1 = P.jar(0.12, 0.34, '#4f7fa6'); at(j1, -1.4, 0.75, -4.05); g.add(j1);
    const tbl = box(1.1, 0.75, 0.7, toon('#9a6a42', {paint: {planks: 3, seed: 97}})); at(tbl, -1.0, 0, -3.9); g.add(tbl);
    const pl = P.plate(); at(pl, -1.2, 0.75, -3.85); g.add(pl);
    const gls = P.waterGlass(); at(gls, -0.65, 0.75, -3.8); g.add(gls);
    // energy battery on the wall
    const bat = new THREE.Group(); at(bat, 0.55, 2.35, -5.86); g.add(bat);
    bat.add(box(1.7, 0.72, 0.08, '#3a3a40', {center: true}));
    const cap = box(0.12, 0.3, 0.08, '#3a3a40', {center: true}); at(cap, 0.92, 0, 0); bat.add(cap);
    const fillMat = new THREE.MeshBasicMaterial({color: '#6fd06a'});
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.52), fillMat); fill.position.z = 0.05; bat.add(fill);
    const bl = sign(L.energy, 1.1, 0.34, {bg: '#f2d24a', frame: '#8a6a2a'}); at(bl, 0.55, 2.95, -5.85); g.add(bl);
    const cmt = sign(L.comment, 1.7, 0.55, {bg: '#c75b5b', fg: '#fff3df', frame: '#8a3f2a'}); at(cmt, 1.0, 3.05, -5.8); g.add(cmt);
    // the thief: a sly brain peeking from behind the sofa
    const thief = P.brainMascot(); at(thief.group, -2.35, 0.75, -5.55); thief.group.scale.setScalar(0.75); g.add(thief.group);
    // organs for the closing question
    const organs = [P.heart('#d8413a'), P.lungs(), P.eyeball(), P.brainMascot({seed: 5}).group];
    const OP = [[-1.15, 2.3, -3.1], [1.15, 1.95, -3.1], [-1.15, 1.5, -2.9], [0.65, 1.5, -2.9]];
    organs.forEach((o, i) => { at(o, ...OP[i]); if (i === 3) o.scale.setScalar(0.32); else o.scale.setScalar(i === 0 ? 1.0 : 0.8); g.add(o); });
    const hero = ch('hero', {}, g, -0.3, -2.6, 0);
    const hPlate = held(hero, P.plate(), {y: -0.02});
    const hGlass = held(hero, P.waterGlass(), {y: 0.02, hand: 1});
    hero.act([
      {t: 0, pose: 'idle', expr: 'neutral'},
      {t: E('organ') + 0.1, expr: 'tired', action: 'slump', dur: 1.2},
      {t: E('mencuri') + 0.15, expr: 'drowsy', pose: 'limp'},
      {t: E('detik') + 0.05, expr: 'worried', pose: 'headHold', action: 'tremble', dur: 0.8},
      {t: cut(8), pose: 'hips', expr: 'happy'},
      {t: cut(8) + 0.05, move: [-0.55, -3.05], dur: 0.9},
      {t: cut(8) + 1.0, face: 'camera'},
      {t: E('rawat') + 0.1, pose: 'point', expr: 'cheesy'},
      {t: E('makan') + 0.05, pose: 'eat', expr: 'toothy'},
      {t: E('minum') + 0.05, pose: 'drink', expr: 'happy'},
      {t: cut(9), pose: 'chin', expr: 'thinking'},
      {t: cut(9) + 0.05, move: [-0.3, -2.4], dur: 0.8},
      {t: cut(9) + 0.9, face: 'camera'},
      {t: E('organ2') + 0.1, pose: 'shrug', expr: 'confused'},
      {t: E('hebat') + 0.1, pose: 'presentBoth', expr: 'excited'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy', action: 'jump', dur: 0.6},
    ]);
    const sleeper = ch('hero', {seed: 41}, g, 2.55, -5.2, 0, -0.3);
    sleeper.act([{t: 0, pose: 'limp', expr: 'sleep'}]);
    zzz(g, [2.55, 1.85, -5.0], (t) => inShots(t, 8) && t > E('tidur2') - 0.2);
    orbFlow(g, [-0.3, 1.25, -2.5], [-2.35, 1.0, -5.4], {n: 16, vis: (t) => inShots(t, 1) && t > E('organ') - 0.2});
    fx(g, FX.glints([-1.0, 1.0, -3.8], E('makan'), {n: 16}), (t) => inShots(t, 8));
    fx(g, FX.glints([-0.2, 2.6, -5.6], E('komentar'), {n: 24}), (t) => inShots(t, 9));
    fx(g, FX.confetti([-0.3, 2.9, -2.6], E('komentar') + 0.05), (t) => inShots(t, 9));
    updaters.push((t) => {
      const s1 = inShots(t, 1), s8 = inShots(t, 8), s9 = inShots(t, 9);
      // battery drains during the hook, full again for the advice
      const lvl = s1 ? 1 - 0.75 * smooth((t - E('organ')) / (cut(2) - E('organ'))) : s8 ? 0.35 + 0.65 * smooth((t - E('makan')) / 2.5) : 0.95;
      fill.scale.x = Math.max(0.02, lvl); fill.position.x = -0.75 * (1 - lvl);
      fillMat.color.set(lvl > 0.6 ? '#6fd06a' : lvl > 0.3 ? '#f2c84a' : '#e0503a');
      thief.group.visible = s1;
      thief.group.position.y = 0.75 + 0.3 * smooth((t - E('mencuri') + 0.3) / 0.5) + Math.sin(t * 3) * 0.03;
      thief.setFace(t > E('detik') ? 'happy' : 'sly');
      hero.group.visible = s1 || s9 || (s8 && t < E('tidur2') - 0.15);
      sleeper.group.visible = s8 && t >= E('tidur2') - 0.15;
      hPlate.visible = s8 && t > E('makan') - 0.3 && t < E('minum') - 0.1;
      hGlass.visible = s8 && t >= E('minum') - 0.1;
      pl.visible = !(s8 && t > E('makan') - 0.3); gls.visible = !(s8 && t >= E('minum') - 0.1);
      organs.forEach((o, i) => { o.visible = s9; const k = pop(t, E('organ2') + i * 0.25, 0.4); o.scale.setScalar((i === 3 ? 0.32 : i === 0 ? 1.0 : 0.8) * k); o.position.y = OP[i][1] + Math.sin(t * 2 + i) * 0.05; o.rotation.y = Math.sin(t + i) * 0.3; });
      cmt.visible = s9; bat.visible = bl.visible = !s9; cmt.scale.setScalar(pop(t, E('komentar') - 0.1, 0.4));
    });
  }

  // ---------- lab: 2% vs 20%, the reveal, and where the energy goes (shots 2, 6) ----------
  {
    const g = addLoc('lab');
    under(g, '#4a525a');
    g.add(P.room(8, 3.6, 7, {wall: '#e6e8e2', floor: '#9aa6ae', wain: '#5a7a8a', floorPaint: {bricks: true}}));
    const wsign = sign(L.weight, 1.3, 0.85, {bg: '#4f8fc8', fg: '#fff3df', frame: '#2a4f7a', sub: L.weightSub}); at(wsign, -1.7, 2.2, -5.84); g.add(wsign);
    const easel = new THREE.Group(); at(easel, 1.45, 0, -4.4); g.add(easel);
    for (const s of [-1, 1]) { const leg = cyl(0.03, 0.04, 1.7, '#7a5236'); at(leg, s * 0.5, 0, 0.1, 0, -0.08); easel.add(leg); }
    const pie = P.pieChart(0.85); at(pie.group, 1.45, 1.75, -4.35); g.add(pie.group);
    const esign = sign(L.energySub, 1.5, 0.36, {bg: '#f2a3b3', frame: '#8a3f5a'}); at(esign, 1.45, 0.7, -4.3); g.add(esign);
    const think = sign(L.think, 0.95, 0.34, {bg: '#e8a83a', frame: '#8a5a2a'}); at(think, 2.3, 2.55, -4.3); g.add(think);
    const bench = box(1.4, 0.9, 0.7, toon('#e8e2d6', {paint: {seed: 98, stains: 8}})); at(bench, 0.1, 0, -3.9); g.add(bench);
    const brain = P.brainMascot(); at(brain.group, 0.1, 1.33, -3.9); brain.group.scale.setScalar(0.55); g.add(brain.group);
    const spot = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.6, 24, 1, true), new THREE.MeshBasicMaterial({color: '#fff1c0', transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending}));
    spot.position.set(0.1, 2.2, -3.9); g.add(spot);
    const lsh = P.shelf(1.4, 1.9, {seed: 14}); at(lsh, -3.55, 0, -3.6, Math.PI / 2); g.add(lsh);
    const lpl = P.pottedPlant(1.1, 6); at(lpl, 3.35, 0, -5.4); g.add(lpl);
    const lch = P.chest(0.8, 0.45, 0.5); at(lch, -2.8, 0, -5.2); g.add(lch);
    for (const [jx, c] of [[-0.35, '#4f7fa6'], [0.55, '#c75b5b']]) { const j = P.jar(0.08, 0.22, c); at(j, jx, 0.9, -4.05); g.add(j); }
    const lpic = P.pictureFrame(0.9, 0.62); at(lpic, -0.3, 2.65, -5.85); g.add(lpic);
    const lrug = P.rug(2.6, 1.8, {base: '#2f5f7a', accent: '#e8c35a', accent2: '#c75b5b', dark: '#1f2a3a', seed: 9}); lrug.position.set(-0.6, 0, -2.8); g.add(lrug);
    const hero = ch('hero', {seed: 51}, g, -2.6, -2.9, 0.25);
    hero.act([
      {t: 0, pose: 'present', expr: 'smug', action: 'talk', dur: 1.2},
      {t: cut(2) + 0.05, move: [-0.95, -2.9], dur: 1.3},
      {t: cut(2) + 1.4, face: 0.25},
      {t: E('dua') + 0.1, pose: 'pointUp', expr: 'thinking'},
      {t: E('puluh') + 0.1, pose: 'point', expr: 'shocked', action: 'jump', dur: 0.6},
      {t: E('otakmu') + 0.1, pose: 'presentBoth', expr: 'cheesy', action: 'hop', dur: 0.5},
      {t: cut(6), pose: 'think', expr: 'thinking'},
      {t: E('sedikit') + 0.1, pose: 'shrug', expr: 'nervous'},
      {t: E('sebagian') + 0.1, pose: 'point', expr: 'surprised'},
      {t: E('hidup') + 0.1, pose: 'present', expr: 'proud', action: 'nod', dur: 0.6},
    ]);
    fx(g, FX.glints([0.1, 1.6, -3.8], E('otakmu'), {n: 30, color: '#ffd0e0'}), (t) => inShots(t, 2));
    fx(g, FX.glints([2.2, 2.4, -4.2], E('sedikit') + 0.1, {n: 14}), (t) => inShots(t, 6));
    updaters.push((t) => {
      const s2 = inShots(t, 2), s6 = inShots(t, 6);
      if (s2) pie.draw([{frac: 0.2, color: '#f2a3b3', label: L.energy20, size: 70}, {frac: 0.8, color: '#dfe6ee', label: L.rest, fg: INK, size: 58}], smooth((t - E('puluh') + 0.1) / 0.6));
      else pie.draw([{frac: 0.06, color: '#e8a83a'}, {frac: 0.94, color: '#f2a3b3', label: L.alive, size: 56}], smooth((t - E('sedikit') + 0.1) / 0.5));
      wsign.visible = s2; wsign.scale.setScalar(pop(t, E('dua') - 0.1, 0.4));
      esign.visible = s2; esign.scale.setScalar(pop(t, E('energi') - 0.1, 0.4));
      think.visible = s6; think.scale.setScalar(pop(t, E('sedikit'), 0.4));
      const show = s6 || t > E('otakmu') - 0.15;
      brain.group.visible = show; brain.group.scale.setScalar(0.55 * (s6 ? 1 : pop(t, E('otakmu') - 0.15, 0.45)));
      brain.group.position.y = 1.33 + Math.sin(t * 3) * 0.03; brain.group.rotation.y = Math.sin(t * 1.4) * 0.25;
      brain.setFace(s6 ? (t > E('hidup') ? 'happy' : 'sleep') : 'happy');
      spot.visible = s2 && t > E('otakmu') - 0.15;
    });
  }

  // ---------- power room: the brain lights a 20 W bulb (shot 3) ----------
  {
    const g = addLoc('power');
    under(g, '#2a2830');
    g.add(P.room(7, 3.4, 6, {wall: '#6a6a7a', floor: '#5a4a3e', wain: '#3f4a5a'}));
    const ped = box(0.7, 1.0, 0.7, toon('#c9ccd0', {paint: {seed: 99, stains: 8}})); at(ped, -1.3, 0, -3.7); g.add(ped);
    const brain = P.brainMascot(); at(brain.group, -1.3, 1.42, -3.7); brain.group.scale.setScalar(0.6); g.add(brain.group);
    const stand = cyl(0.05, 0.25, 0.9, '#4a4a50'); at(stand, 1.35, 0, -3.7); g.add(stand);
    const bl = P.bulb(1.6); at(bl.group, 1.35, 0.9, -3.7); g.add(bl.group);
    const cablePts = [[-1.25, 1.05, -3.6], [-0.6, 0.15, -3.3], [0.4, 0.1, -3.4], [1.3, 0.55, -3.65]].map((p) => new THREE.Vector3(...p));
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 40, 0.035, 8), toon('#2b2b33')); g.add(cable);
    const wsign = sign(L.watt, 1.4, 0.5, {bg: '#f2d24a', frame: '#8a6a2a'}); at(wsign, 1.35, 2.75, -4.84); g.add(wsign);
    // window: day -> night -> day cycle for "all day long"
    const winPane = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), new THREE.MeshBasicMaterial({color: '#1f2d55'})); winPane.position.set(-1.0, 2.25, -4.88); g.add(winPane);
    for (const s of [-1, 1]) { const f = box(0.08, 1.1, 0.12, '#d6cab6', {center: true}); at(f, -1.0 + s * 0.68, 2.25, -4.83); g.add(f); }
    for (const yy of [1.72, 2.78]) { const f = box(1.44, 0.08, 0.14, '#d6cab6', {center: true}); at(f, -1.0, yy, -4.82); g.add(f); }
    const sunDot = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), new THREE.MeshBasicMaterial({color: '#fff3c8'})); g.add(sunDot);
    const clk = P.wallClock(0.3); at(clk.group, 0.2, 2.6, -4.86); g.add(clk.group);
    const psh = P.shelf(1.2, 1.8, {seed: 22}); at(psh, 3.3, 0, -3.2, -Math.PI / 2); g.add(psh);
    const pch = P.chest(0.8, 0.45, 0.5); at(pch, -2.6, 0, -4.4); g.add(pch);
    const prug = P.rug(2.6, 1.8, {base: '#5a2a3a', accent: '#d8a84a', accent2: '#2a4a6a', dark: '#1a1a2a', seed: 12}); prug.position.set(0, 0, -2.8); g.add(prug);
    const ppl = P.pottedPlant(0.9, 9); at(ppl, -2.9, 0, -2.2); g.add(ppl);
    for (const cx2 of [-1.95, -0.05]) { const ct = P.curtain(0.45, 1.6, '#3f4a7a'); at(ct, cx2, 1.4, -4.8); g.add(ct); }
    const hero = ch('hero', {seed: 52}, g, 1.9, -2.35, 0);
    hero.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: cut(3) + 0.05, move: [0.05, -2.35], dur: 1.4},
      {t: cut(3) + 1.5, face: 'camera'},
      {t: E('watt') + 0.1, pose: 'pointUp', expr: 'scheming'},
      {t: E('lampu') + 0.1, pose: 'armsUp', expr: 'cheesy', action: 'jump', dur: 0.6},
      {t: E('sepanjang') + 0.1, pose: 'present', expr: 'surprised'},
      {t: E('mati') + 0.1, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.5},
    ]);
    orbFlow(g, [-1.25, 1.1, -3.6], [1.35, 1.6, -3.7], {n: 12, size: 0.16, speed: 1.3, lift: -0.9, vis: (t) => t > E('listrik') - 0.1});
    fx(g, FX.sparks([1.35, 1.6, -3.6], E('lampu'), {n: 30}), (t) => inShots(t, 3));
    const day = new THREE.Color('#bfe0f2'), night = new THREE.Color('#1f2d55'), tmp = new THREE.Color();
    updaters.push((t) => {
      const on = smooth((t - E('lampu') + 0.05) / 0.15);
      bl.set(on * (0.92 + 0.08 * Math.sin(t * 20)));
      wsign.scale.setScalar(pop(t, E('watt') - 0.1, 0.4));
      brain.setFace(t > E('lampu') ? 'happy' : 'sly');
      brain.group.position.y = 1.42 + Math.sin(t * 3) * 0.03;
      // a whole day passes outside on "Sepanjang hari"
      const u = clamp01((t - E('sepanjang')) / (cut(4) - E('sepanjang')));
      const sun = Math.cos(u * Math.PI * 2);
      winPane.material.color.copy(tmp.copy(night).lerp(day, t < E('sepanjang') ? 0 : (1 - sun) / 2));
      sunDot.position.set(-1.0 + Math.sin(u * Math.PI * 2) * 0.4, 2.25 - Math.cos(u * Math.PI * 2) * 0.3, -4.87);
      sunDot.material.color.set((1 - sun) / 2 > 0.5 ? '#ffe070' : '#fff3c8');
      clk.set(t < E('sepanjang') ? 21 : 21 + u * 24, t < E('sepanjang') ? 10 : (u * 24 * 60) % 60);
    });
  }

  // ---------- neuron space: 86 billion cells firing, even in sleep (shot 4) ----------
  {
    const g = addLoc('neuro');
    const fl = ground(80, 80, '#2a1f44', {stains: 10}); g.add(fl);
    const r = rng(77); const N = 70; const nodes = [];
    for (let i = 0; i < N; i++) nodes.push(new THREE.Vector3((r() - 0.5) * 9, 1.4 + r() * 4.2, -3.5 - r() * 7));
    const edges = [];
    nodes.forEach((a, i) => {
      const near = nodes.map((b, j) => [a.distanceTo(b), j]).filter((x) => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, 3);
      for (const [, j] of near) if (i < j) edges.push([i, j]);
    });
    const pos = new Float32Array(edges.length * 6);
    edges.forEach(([i, j], k) => { pos.set([nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z], k * 6); });
    const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const lineMat = new THREE.LineBasicMaterial({color: '#b48cff', transparent: true, opacity: 0.55});
    g.add(new THREE.LineSegments(eg, lineMat));
    const cells = nodes.map((p, i) => { const b = ball(0.09 + (i % 3) * 0.03, new THREE.MeshBasicMaterial({color: '#e8d0ff'}), {hull: 0.015}); b.position.copy(p); g.add(b); const s = P.glowSprite('#c8a0ff', 0.45); s.position.copy(p); g.add(s); return s; });
    const pulses = []; for (let i = 0; i < 46; i++) { const s = P.glowSprite('#fff0a0', 0.22); g.add(s); pulses.push({s, e: edges[(i * 7) % edges.length], ph: r(), sp: 0.8 + r() * 1.2}); }
    const ns = sign(L.neurons, 2.4, 0.9, {bg: '#9a6fb0', fg: '#fff3df', frame: '#4a2a5a', sub: L.neuronsSub}); at(ns, 0, 2.75, -1.6); g.add(ns);
    const bd = P.bed({color: '#5a4a7a', sheet: '#7f8ac9'}); at(bd, 1.1, 0, -3.2); g.add(bd);
    const sleeper = ch('hero', {seed: 53}, g, 1.1, -3.7, 0, -0.3);
    sleeper.act([{t: 0, pose: 'limp', expr: 'sleep'}]);
    const brainS = P.brainMascot(); brainS.group.scale.setScalar(0.32); at(brainS.group, 1.1, 2.1, -3.6); g.add(brainS.group);
    const hero = ch('hero', {seed: 54}, g, -1.1, -2.3, 0.2);
    hero.act([
      {t: 0, pose: 'shrug', expr: 'confused'},
      {t: E('serakus') + 0.1, pose: 'headHold', expr: 'grimace'},
      {t: E('miliar') + 0.1, pose: 'armsUp', expr: 'scream', action: 'jump', dur: 0.6},
      {t: E('sinyal') + 0.1, pose: 'point', expr: 'cheesy'},
    ]);
    zzz(g, [1.1, 1.9, -3.5], (t) => t > E('tidur') - 0.3);
    updaters.push((t) => {
      const busy = t > E('sinyal') - 0.2 ? 1 : 0.45;
      pulses.forEach((p) => {
        const [i, j] = p.e; const u = (t * p.sp * busy + p.ph) % 1;
        p.s.position.copy(nodes[i]).lerp(nodes[j], u); p.s.material.opacity = Math.sin(u * Math.PI);
      });
      cells.forEach((s, i) => { s.material.opacity = 0.45 + 0.4 * Math.max(0, Math.sin(t * 5 * busy + i * 1.7)); });
      ns.scale.setScalar(pop(t, E('miliar') - 0.1, 0.4));
      const sl = t > E('tidur') - 0.25;
      sleeper.group.visible = sl; bd.visible = sl; brainS.group.visible = sl; hero.group.visible = !sl;
      brainS.setFace('happy'); brainS.group.position.y = 2.1 + Math.sin(t * 3) * 0.05;
    });
  }

  // ---------- study: plot twist, thinking hard does not make you thin (shot 5) ----------
  {
    const g = addLoc('study');
    under(g, '#3a3036');
    g.add(P.room(7, 3.4, 6, {wall: '#d8c8a8', floor: '#8a6a4a', wain: '#6a5a8a'}));
    const dk = P.desk(); at(dk, -0.4, 0, -2.6); g.add(dk);
    const bs1 = P.bookStack(5, 4); at(bs1, -0.95, 0.77, -2.6); g.add(bs1);
    const bs2 = P.bookStack(3, 9); at(bs2, 0.25, 0.77, -2.7); g.add(bs2);
    const lampP = new THREE.PointLight('#ffcf8a', 2.4, 5, 1.6); lampP.position.set(0.2, 1.4, -2.6); g.add(lampP);
    const lampB = cyl(0.03, 0.03, 0.45, '#3a3a40'); at(lampB, 0.35, 0.77, -2.85); g.add(lampB);
    const lampS = cone(0.15, 0.2, '#e8a83a'); at(lampS, 0.35, 1.25, -2.85); lampS.rotation.z = Math.PI; g.add(lampS);
    const tw = sign(L.twist, 1.9, 0.6, {bg: '#d8413a', fg: '#fff3df', frame: '#7a2a2a'}); at(tw, -0.3, 2.6, -4.84); g.add(tw);
    const scale = P.bathScale(L.kg); at(scale.group, 1.45, 0, -2.3); g.add(scale.group);
    const ssh = P.shelf(1.3, 1.9, {seed: 31}); at(ssh, 2.3, 0, -4.55); g.add(ssh);
    const spic = P.pictureFrame(0.8, 0.56); at(spic, -2.2, 2.2, -4.85); g.add(spic);
    const srug = P.rug(2.4, 1.6, {base: '#6a3a2a', accent: '#e0b060', accent2: '#3a5a4a', dark: '#2a1a1a', seed: 17}); srug.position.set(0.2, 0, -2.4); g.add(srug);
    const spl = P.pottedPlant(1.0, 12); at(spl, -2.9, 0, -4.3); g.add(spl);
    const sln = P.lantern({intensity: 2.5}); at(sln.group, -2.3, 0.77, -3.6); g.add(sln.group); updaters.push(sln.update);
    const sst = box(0.5, 0.77, 0.5, patMat('woodfloor', '#7a4a2a')); at(sst, -2.3, 0, -3.6); g.add(sst);
    const hero = ch('hero', {seed: 55}, g, -0.4, -3.2, 0);
    hero.act([
      {t: 0, pose: 'think', expr: 'thinking'},
      {t: E('twist') + 0.1, pose: 'armsUp', expr: 'shocked', action: 'jump', dur: 0.6},
      {t: E('belajar') + 0.1, pose: 'headHold', expr: 'grimace', action: 'tremble', dur: 1.6},
    ]);
    const hero2 = ch('hero', {seed: 56}, g, 1.45, -2.3, -0.2, 0.12);
    hero2.act([
      {t: 0, pose: 'hips', expr: 'smug'},
      {t: E('kurus') + 0.25, pose: 'facepalm', expr: 'irritated', action: 'shake', dur: 0.7},
    ]);
    fx(g, FX.sparks([-0.4, 1.9, -3.1], E('belajar') + 0.4, {n: 20, repeat: 0.5}), (t) => inShots(t, 5) && t < E('kurus') - 0.2);
    updaters.push((t) => {
      tw.scale.setScalar(pop(t, E('twist') - 0.05, 0.4));
      const k = t > E('kurus') - 0.15;
      hero2.group.visible = k; hero.group.visible = !k;
      // the reading wobbles and settles on the same weight
      scale.set(t > E('kurus') - 0.15 ? 70 + Math.max(0, 0.6 - (t - E('kurus'))) * Math.sin(t * 30) * 0.5 : 70);
    });
  }

  // ---------- playroom: a 5-year-old's brain uses over half the resting energy (shot 7) ----------
  {
    const g = addLoc('kids');
    under(g, '#3a3036');
    g.add(P.room(7, 3.4, 6, {wall: '#f6e2b8', floor: '#c9a86a', wain: '#8fc7c0'}));
    const rug = P.rug(3.2, 2.4, {base: '#4f8fc8', accent: '#f2d24a', accent2: '#e07a3a', dark: '#2a3a6a', seed: 21}); rug.position.set(0, 0, -2.8); g.add(rug);
    const ksh = P.shelf(1.3, 1.6, {seed: 41}); at(ksh, 3.25, 0, -3.3, -Math.PI / 2); g.add(ksh);
    const kpl = P.pottedPlant(1.0, 15); at(kpl, -3.0, 0, -4.5); g.add(kpl);
    for (const cx2 of [-0.75, 0.55]) { const ct = P.curtain(0.5, 1.8, '#e07a8a'); at(ct, cx2, 1.0, -4.82); g.add(ct); }
    const kpic = P.pictureFrame(0.7, 0.5); at(kpic, -0.1, 2.55, -4.85); g.add(kpic);
    'ABC123'.split('').forEach((ch2, i) => { const b = P.toyBlock(ch2, ['#c75b5b', '#4f7fa6', '#e8a83a', '#5a9a8a', '#9a6fb0', '#e07a3a'][i]); at(b, -0.9 + (i % 3) * 0.36, Math.floor(i / 3) * 0.32, -2.2 - (i % 2) * 0.2, i * 0.3); g.add(b); });
    const pie = P.pieChart(0.75); at(pie.group, 1.6, 1.95, -4.85); g.add(pie.group);
    const hs = sign(L.halfSub, 1.5, 0.34, {bg: '#f2d24a', frame: '#8a6a2a'}); at(hs, 1.6, 0.98, -4.84); g.add(hs);
    const age = P.banner(L.age, 1.3, 0.45, {poleH: 1.4, bg: '#5a9a8a'}); at(age, -1.7, 0, -4.4); g.add(age);
    // growth ruler
    const ruler = box(0.18, 1.8, 0.04, '#fbf6ea'); at(ruler, -2.9, 0.2, -4.86); g.add(ruler);
    for (let i = 0; i < 9; i++) { const tk = box(0.08, 0.015, 0.02, INK, {hull: 0, edges: false}); at(tk, -2.86, 0.3 + i * 0.2, -4.83); g.add(tk); }
    const kid = ch('kid', {seed: 57}, g, 0.9, -2.3, 0);
    kid.act([
      {t: 0, pose: 'cheer', expr: 'toothy'},
      {t: cut(7) + 0.05, move: [-0.5, -2.2], dur: 0.8, gait: 'run'},
      {t: cut(7) + 0.9, move: [0.1, -2.6], dur: 0.6, gait: 'run'},
      {t: cut(7) + 1.6, face: 'camera'},
      {t: E('lima') + 0.1, pose: 'armsUp', expr: 'cheesy', action: 'jump', dur: 0.6},
      {t: E('separuh') + 0.1, pose: 'present', expr: 'excited'},
      {t: E('tumbuh') + 0.1, pose: 'cheer', expr: 'laugh', action: 'jump', dur: 0.7},
    ]);
    const adult = ch('hero', {seed: 58}, g, -2.4, -3.3, 0.2);
    adult.act([{t: 0, pose: 'hips', expr: 'happy'}, {t: cut(7) + 0.1, move: [-1.0, -3.3], dur: 1.4}, {t: cut(7) + 1.6, face: 0.3}, {t: E('separuh') + 0.15, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.6}, {t: E('tumbuh') + 0.2, pose: 'present', expr: 'cheesy'}]);
    const kb = P.brainMascot(); kb.group.scale.setScalar(0.3); at(kb.group, 0.1, 1.85, -2.55); g.add(kb.group);
    const glow = P.glowSprite('#ffe08a', 1.1); glow.position.set(0.1, 1.85, -2.6); g.add(glow);
    orbFlow(g, [-0.2, 0.7, -2.5], [0.1, 1.8, -2.55], {n: 10, size: 0.14, speed: 1.1, lift: 0.3, vis: (t) => inShots(t, 7)});
    fx(g, FX.glints([0.1, 1.6, -2.5], E('tumbuh'), {n: 24}), (t) => inShots(t, 7));
    updaters.push((t) => {
      pie.draw([{frac: 0.6, color: '#f2c84a', label: L.half, size: 44}, {frac: 0.4, color: '#dfe6ee'}], smooth((t - E('separuh') + 0.1) / 0.6));
      hs.scale.setScalar(pop(t, E('separuh'), 0.4));
      age.scale.setScalar(pop(t, E('lima') - 0.1, 0.4));
      const grow = 1 + 0.25 * smooth((t - E('tumbuh')) / 0.8);
      kb.group.scale.setScalar(0.3 * grow); kb.group.position.y = 1.85 + Math.sin(t * 4) * 0.04; kb.setFace('happy');
      glow.material.opacity = 0.5 + 0.3 * Math.sin(t * 6); glow.scale.setScalar(1.1 * grow);
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
