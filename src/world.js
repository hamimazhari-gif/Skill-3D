// All locations in one scene at different x offsets. Story: "Bibit sawit palsu" (Indonesian).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, signTex, decal, paintTex, pop, smooth, clamp01, gradientMap, rng} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {kebun: 0, pengepul: 40, jalan: 80, teras: 120, penangkar: 160};

export {LOOK_PRESETS, MOODS} from './lighting';

// Character design for this story: 'reed' (new) — round head, side-swept hair, long body, thin limbs, warmer skin.
export const CHAR_DESIGN = 'reed';
const CAST = {joko: {}, kakek: {}, kakekNight: {hat: 'none'}, pengepul: {}, tetangga: {}, penjual: {}};

// Lighting plan (camera_plan.md): the plantation in a time-lapse of days (dawn -> noon -> golden -> dawn) while Joko waits;
// a bright harvest morning; the collector's yard at midday turning tense on "murah" and sad on "terdiam", lighter on
// "Tenera"; the roadside flashback in a faded nostalgic grade; Kakek's porch at night (oil lamp); the official nursery
// bright and clear; the plantation flat and grey while the palms are felled, hopeful on "memulai", golden hour to close.
const day = {...LOOK_PRESETS.day, keyPos: [-6, 10, 7]};
const dayJoy = {...day, ...MOODS.joyful};
const noonL = {...LOOK_PRESETS.noon, keyPos: [-4, 13, 5]};
const golden = {...LOOK_PRESETS.goldenHour, keyPos: [-9, 5, 6]};
const dawnL = {...LOOK_PRESETS.dawn, keyPos: [-9, 4, 5]};
const grey = {...LOOK_PRESETS.overcast, ...MOODS.sad, keyPos: [-5, 11, 5]};
const porch = {...LOOK_PRESETS.night, keyI: 1.0, hemiI: 0.62, keyPos: [-6, 10, 5], hemiSky: '#7a8ac0', hemiGround: '#3a3038',
  grade: {sat: 0.95, contrast: 1.08, tint: '#8aa0e0', tintAmt: 0.06, vignette: 0.5}};

export const LOOK = {
  kebun: {keys: [{at: 0, ...dawnL}, {at: 'merawat', ...noonL}, {at: 'memupuk', ...golden}, {at: 'berharap', ...dawnL}, {at: 'cut2', ...dayJoy},
    {at: 'merah', ...dayJoy}, {at: 'cut11', ...day}, {at: 'salah', ...day, ...MOODS.tense}, {at: 'cut12', ...grey}, {at: 'memulai', ...grey},
    {at: 'keputusan', ...day}, {at: 'cut13', ...golden}]},
  pengepul: {keys: [{at: 0, ...noonL}, {at: 'harga', ...noonL}, {at: 'murah', ...noonL, ...MOODS.tense}, {at: 'cut4', ...noonL},
    {at: 'dura', ...noonL}, {at: 'terdiam', ...noonL, ...MOODS.sad}, {at: 'cut5', ...noonL}, {at: 'tenera', ...noonL, ...MOODS.joyful},
    {at: 'cut6', ...noonL, ...MOODS.sad}]},
  jalan: {...LOOK_PRESETS.day, ...MOODS.nostalgic, keyPos: [-6, 9, 6]},
  teras: porch,
  penangkar: {keys: [{at: 0, ...day}, {at: 'cut8', ...dayJoy}]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
const strip = (g, w, d, x, z, color, y, paint) => { const s = ground(w, d, color, paint); s.position.set(x, y, z); g.add(s); return s; };

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.panen + 0.5, dur: 0.25, color: '#fff4d6', strength: 0.25},
      {t: EVt.murah, dur: 0.3, color: '#ff8a6a', strength: 0.25},
      {t: EVt.membelah + 0.45, dur: 0.25, color: '#ffffff', strength: 0.3},
      {t: EVt.sebelah - 0.05, dur: 0.25, color: '#ffffff', strength: 0.3},
      {t: EVt.tenera, dur: 0.35, color: '#ffe9b0', strength: 0.35},
      {t: EVt.bertahun + 0.2, dur: 0.3, color: '#fff4d6', strength: 0.3},
      {t: EVt.salah, dur: 0.3, color: '#ff6a50', strength: 0.3},
      {t: EVt.keputusan, dur: 0.3, color: '#fff4d6', strength: 0.25},
    ],
    shakes: [{t: EVt.panen + 0.5, dur: 0.3, amp: 0.025}, {t: EVt.membelah + 0.45, dur: 0.25, amp: 0.015}, {t: EVt.sebelah - 0.05, dur: 0.25, amp: 0.015},
      {t: EVt.belah + 0.3, dur: 0.25, amp: 0.015}, {t: EVt.menebang + 0.9, dur: 0.4, amp: 0.035}, {t: EVt.menebang + 1.5, dur: 0.4, amp: 0.03}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const post = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => {
    const base = name === 'kakekNight' ? 'kakek' : name;
    const c = makeChar(base, {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c;
  };
  const E = (k) => { if (EVt[k] === undefined) throw new Error('no EV ' + k); return EVt[k]; };
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const lerp = (a, b, u) => a + (b - a) * u;
  const ramp = (t, t0, t1) => smooth((t - t0) / (t1 - t0));
  const tag = (text, w, h, o = {}) => { const g = new THREE.Group(); const stick = o.stick ?? 0.08; const s = sign(text, w, h, {bg: o.bg || '#f3e7d3', fg: o.fg, frame: o.frame || '#8a5a2a', depth: 0.02}); at(s, 0, h / 2 + stick, 0); g.add(s); if (stick > 0) g.add(cyl(0.008, 0.008, stick + 0.02, '#7a5236', {hull: 0.003})); return g; };
  const tufts = (g, list) => list.map(([x, z, s]) => { const t = new THREE.Group(); at(t, x, 0, z); g.add(t); for (let i = 0; i < 4; i++) { const c = cyl(0.004, 0.03, 0.35 * s, '#6f9a3a', {hull: 0.006}); at(c, (i - 1.5) * 0.05, 0, (i % 2) * 0.04, 0, 0, (i - 1.5) * 0.25); t.add(c); } return t; });
  // chop rhythm helper: alternate hammerUp / hammerDown cues on the left arm
  const chopCues = (t0, t1, step, expr) => { const out = []; let i = 0; for (let tt = t0; tt < t1; tt += step, i++) out.push({t: tt, pose: i % 2 ? 'hammerDown' : 'hammerUp', expr}); return out; };
  // A cutting block (tree stump) where oil palm fruits are split.
  const cutStation = (g, x, z, h = 0.55) => {
    const blk = new THREE.Group(); at(blk, x, 0, z); g.add(blk);
    blk.add(cyl(0.33, 0.36, h, toon('#9a7048', {paint: {seed: 88, stains: 20, chips: 20}}), {hull: 0.014}));
    const top = cyl(0.33, 0.33, 0.012, '#e0c08a', {hull: 0}); at(top, 0, h, 0); blk.add(top);
    return {blk, top: h};
  };
  // A whole fruit that pops onto the block and splits into two face-up halves.
  const fruitPair = (blk, type, y, x0, tPop, tSplit) => {
    const whole = P.fruitWhole(0.085); blk.add(whole);
    const a = P.fruitHalf(type, 0.085), b = P.fruitHalf(type, 0.085); blk.add(a); blk.add(b);
    return (t, cx = x0) => {
      whole.visible = t >= tPop && t < tSplit; whole.scale.setScalar(pop(t, tPop, 0.3)); whole.position.set(cx, y + 0.085, 0);
      const u = ramp(t, tSplit, tSplit + 0.3);
      a.visible = b.visible = t >= tSplit;
      a.position.set(cx - 0.02 - 0.06 * u, y, 0.0); b.position.set(cx + 0.02 + 0.06 * u, y, 0.02);
      a.rotation.set(0, 0.3, 0); b.rotation.set(0, -0.2, 0);
    };
  };

  // =====================================================================================================
  // ---------- kebun: Joko's oil palm plantation (shots 1, 2, 11, 12, 13) ----------
  {
    const g = addLoc('kebun');
    g.add(ground(160, 160, '#8fae62'));
    g.add(P.hills('#7a9a5a'));
    const sign1 = sign(L.kebun, 1.2, 0.36, {bg: '#efd9a8'}); const sp = new THREE.Group(); at(sp, -2.6, 0, -0.9, 0.25); g.add(sp);
    sp.add(cyl(0.04, 0.05, 1.3, '#7a5236')); at(sign1, 0, 1.2, 0.04); sp.add(sign1);
    const grid = [];
    for (let row = 0; row < 4; row++) {
      const z = -3.0 - row * 4.2, xs = row % 2 ? [-8.2, -3.8, 0.6, 5.0, 9.4] : [-6.0, -1.6, 2.8, 7.2];
      for (const x of xs) grid.push([x, z]);
    }
    const palms = grid.map(([x, z], i) => {
      const p = P.oilPalm({seed: 30 + i, h: 1.2 + (i % 3) * 0.1, len: 2.5, bunches: 3});
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), toon('#9a7a52', {paint: {seed: 5, stains: 20}})); disc.rotation.x = -Math.PI / 2; disc.position.set(x, 0.006, z); disc.receiveShadow = true; g.add(disc);
      at(p.group, x, 0, z, i * 0.7);
      const stump = cyl(0.27, 0.34, 0.35, toon('#7a6a4a', {paint: {seed: 9, stains: 20}}), {hull: 0.014}); at(stump, x, 0, z); g.add(stump);
      const topR = cyl(0.27, 0.27, 0.01, '#e8d8a8', {hull: 0}); at(topR, x, 0.35, z); g.add(topR);
      return {...p, x, z, stump, topR, fallDir: i % 2 ? 1 : -1, delay: (i % 5) * 0.18 + Math.floor(i / 5) * 0.05};
    });
    const hero = palms[2]; // (2.8, -3.0): the harvest palm
    // the bunch that drops on "panen": starts where a crown bunch hangs (computed before the palm joins the scene)
    hero.group.updateMatrixWorld(true);
    const p0 = new THREE.Vector3(); hero.bunches[0].getWorldPosition(p0);
    palms.forEach((p) => g.add(p.group));
    const dropB = P.fruitBunch(1.0); g.add(dropB);
    // weeds around the young palms (cleared on "menyiangi")
    const rw = rng(9);
    const weeds = tufts(g, Array.from({length: 26}, () => [(rw() - 0.5) * 9, -1.2 - rw() * 6, 0.8 + rw() * 0.8]));
    const sack = P.sack('PUPUK', {color: '#ece4cc'}); at(sack, -0.4, 0, -1.4, 0.3); g.add(sack);
    // new certified seedlings (shots 12-13), each with a small white label
    const seedPos = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) seedPos.push([-5.5 + c * 2.2 + (r % 2) * 1.1, -2.0 - r * 2.6]);
    const seeds = seedPos.map(([x, z], i) => {
      const s = P.palmSeedling({seed: 50 + i}); at(s.group, x, 0, z, i * 0.4); g.add(s.group);
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshBasicMaterial({color: '#fbf5e6'})); lb.position.set(0, 0.2, 0.172); s.group.add(lb);
      return s;
    });
    // cutting block for shot 11 (Joko splits a fruit: thick shell -> wrong)
    const st = cutStation(g, 0.0, -0.75, 0.5);
    const pair11 = fruitPair(st.blk, 'dura', st.top, 0, E('belah') - 0.6, E('belah') + 0.3);
    const x11 = P.redX(0.4); at(x11, 0, st.top + 0.3, 0.1); st.blk.add(x11);

    const joko = ch('joko', {seed: 81}, g, 0.3, -1.6, 0);
    const hoe = new THREE.Group(); const hh = cyl(0.018, 0.02, 0.9, '#8a5a3a', {hull: 0.005, center: true}); hh.position.y = -0.35; hoe.add(hh);
    const hb = box(0.2, 0.14, 0.02, toon('#9aa0a6', {wear: false}), {hull: 0.006, center: true}); hb.position.set(0, -0.82, 0.06); hb.rotation.x = 1.1; hoe.add(hb);
    held(joko, hoe, {hand: 0, x: 0, y: 0, z: 0.05});
    const dds = P.dodos(1.15); held(joko, dds, {hand: 1, x: 0, y: 0, z: 0.05});
    const axe = P.axe(); held(joko, axe, {hand: 0, x: 0, y: 0, z: 0.05});
    const parang = P.golok(); held(joko, parang, {hand: 0, x: -0.01, y: -0.02, z: 0.06, rz: 0.4}); parang.scale.setScalar(1.3);
    const kakek = ch('kakek', {seed: 82}, g, 0.7, -1.0, 0);
    joko.act([
      {t: 0, pose: 'idle', expr: 'thinking'},
      {t: E('menunggu'), action: 'nod', dur: 0.5},
      ...chopCues(E('menyiangi') - 0.1, E('memupuk') - 0.2, 0.3, 'determined'),
      {t: E('memupuk') - 0.1, pose: 'give', expr: 'happy'},
      {t: E('berharap') + 0.05, pose: 'chin', expr: 'thinking'},
      {t: cut(2), pose: 'give', expr: 'determined'},
      {t: E('panen') + 0.45, pose: 'armsUp', expr: 'cheesy', action: 'jump', dur: 0.6},
      {t: E('merah') + 0.1, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.7},
      {t: cut(11), pose: 'idle', expr: 'thinking'},
      ...chopCues(E('belah') - 0.3, E('belah') + 0.35, 0.3, 'determined'),
      {t: E('belah') + 0.5, pose: 'idle', expr: 'surprised'},
      {t: E('salah') + 0.05, pose: 'facepalm', expr: 'grimace', action: 'shake', dur: 0.7},
      {t: cut(12), pose: 'idle', expr: 'sad'},
      ...chopCues(E('menebang') - 0.2, E('menebang') + 1.4, 0.32, 'gritted'),
      {t: E('menebang') + 1.5, pose: 'idle', expr: 'sad', action: 'slump', dur: 1.0},
      {t: E('memulai') + 0.1, pose: 'give', expr: 'determined'},
      {t: E('hilang') + 0.1, pose: 'idle', expr: 'tired', action: 'slump', dur: 1.2},
      {t: E('keputusan') + 0.1, pose: 'chin', expr: 'thinking'},
      {t: cut(13), pose: 'present', expr: 'proud'},
      {t: E('memilih') + 0.05, pose: 'point', expr: 'determined', action: 'nod', dur: 0.6},
    ]);
    kakek.act([{t: 0, pose: 'hips', expr: 'smug'}, {t: E('kesalahan') + 0.1, pose: 'pointUp', expr: 'proud', action: 'nod', dur: 0.6},
      {t: E('memilih') + 0.1, pose: 'present', expr: 'happy'}]);
    // effects
    fx(g, FX.sparks([0.75, 0.55, -1.4], E('memupuk') + 0.2, {n: 40, color: '#f4f0e0', size: 0.05, speed: 0.9, life: 1.0, up: 0.6, spread: 1}), (t) => inShots(t, 1));
    fx(g, FX.dust([p0.x + 0.15, 0.05, p0.z + 0.35], E('panen') + 0.5, {n: 10, size: 0.5}), (t) => inShots(t, 2));
    fx(g, FX.glints([p0.x + 0.15, 0.35, p0.z + 0.4], E('merah'), {n: 26, spread: 0.5, color: '#ffd07a'}), (t) => inShots(t, 2));
    fx(g, FX.dust([-0.2, 0.05, -1.3], E('menyiangi') + 0.2, {n: 8, size: 0.4}), (t) => inShots(t, 1));
    palms.forEach((p, i) => { if (i < 9) fx(g, FX.dust([p.x + p.fallDir * 1.6, 0.05, p.z], E('menebang') + 0.75 + p.delay, {n: 8, size: 0.7, seed: 20 + i}), (t) => inShots(t, 12)); });
    fx(g, FX.glints([0, 0.6, -2.5], E('memulai') + 0.1, {n: 40, spread: 4, color: '#eaffb0'}), (t) => inShots(t, 12));
    fx(g, FX.glints([0.0, 0.9, -1.4], E('memilih'), {n: 24, spread: 1.2}), (t) => inShots(t, 13));
    updaters.push((t) => {
      const s1 = inShots(t, 1), s2 = inShots(t, 2), s11 = inShots(t, 11), s12 = inShots(t, 12), s13 = inShots(t, 13);
      // palms: time-lapse growth in shot 1, full grown with fruit in 2 and 11, felled in 12, gone in 13
      const grow = s1 ? lerp(0.22, 1, ramp(t, 0.3, E('berharap') + 0.3)) : 1;
      const cleared = (s12 && t > E('memulai') - 0.1) || s13;
      palms.forEach((p) => {
        p.group.visible = !cleared;
        p.group.scale.setScalar(grow);
        p.bunches.forEach((b) => { b.visible = !s1 || t > E('berharap'); });
        const fall = s12 ? clamp01((t - E('menebang') - 0.35 - p.delay) / 0.6) : 0;
        p.group.rotation.z = p.fallDir * 1.5 * fall * fall;
        p.stump.visible = p.topR.visible = cleared;
      });
      if (s2 && t > E('panen') + 0.1) hero.bunches[0].visible = false;
      // the cut bunch drops on "panen"
      dropB.visible = s2 && t > E('panen') + 0.1;
      const fu = clamp01((t - E('panen') - 0.1) / 0.4);
      const bounce = fu >= 1 ? Math.max(0, Math.sin((t - E('panen') - 0.5) * 12) * 0.06 * Math.exp(-(t - E('panen') - 0.5) * 6)) : 0;
      dropB.position.set(p0.x + 0.15 * fu, Math.max(0, lerp(p0.y, 0, fu * fu)) + bounce, p0.z + 0.35 * fu);
      dropB.rotation.z = 0.6 * fu;
      weeds.forEach((w, i) => { w.visible = s1; w.scale.setScalar(Math.max(0.0001, 1 - ramp(t, E('menyiangi') + i * 0.02, E('menyiangi') + 0.6 + i * 0.02))); });
      sack.visible = s1;
      seeds.forEach((s, i) => { s.group.visible = cleared; s.group.scale.setScalar(s12 ? pop(t, E('memulai') + i * 0.05, 0.35) : 1.15); });
      st.blk.visible = s11;
      pair11(t);
      x11.visible = s11 && t > E('salah') - 0.1; x11.scale.setScalar(pop(t, E('salah') - 0.1, 0.3));
      // characters + tools by shot
      joko.group.visible = s1 || s2 || s11 || s12 || s13;
      kakek.group.visible = s13;
      hoe.visible = s1 && t < E('memupuk') - 0.15; dds.visible = s2; axe.visible = s12 && t < E('menebang') + 1.5; parang.visible = s11;
      if (s1) joko.group.position.set(0.3, 0, -1.55);
      else if (s2) joko.group.position.set(1.55, 0, -2.25);
      else if (s11) joko.group.position.set(0.45, 0, -1.2);
      else if (s12) { const early = t < E('memulai') - 0.12; joko.group.position.set(early ? -0.95 : 0.2, 0, early ? -2.35 : -1.3); }
      else joko.group.position.set(-0.5, 0, -0.9);
      kakek.group.position.set(0.65, 0, -0.9);
    });
  }

  // =====================================================================================================
  // ---------- pengepul: the collector's yard (shots 3, 4, 5, 6) ----------
  {
    const g = addLoc('pengepul');
    g.add(ground(160, 160, '#8fae62'));
    strip(g, 14, 7, 0, -2.4, '#c9a87a', 0.006, {stains: 40});
    g.add(P.hills('#7a9a5a'));
    for (const [x, z] of [[-2.6, -1.4], [2.6, -1.4], [-2.6, -4.6], [2.6, -4.6]]) { const p = cyl(0.08, 0.09, 2.7, '#7a5236'); at(p, x, 0, z); g.add(p); }
    const roof = box(5.8, 0.12, 3.8, toon('#8a5a3a', {paint: {planks: 10, seed: 41}})); at(roof, 0, 2.7, -3.0, 0, 0.1); g.add(roof);
    const back = box(5.4, 2.6, 0.12, toon('#c9a06a', {paint: {planks: 12, seed: 42}})); at(back, 0, 0, -4.7); back.traverse((m) => { m.castShadow = false; }); g.add(back);
    const shedSign = sign(L.pengepul, 2.0, 0.42, {bg: '#e8a83a', frame: '#8a5a2a'}); at(shedSign, 0, 2.45, -1.32); g.add(shedSign);
    const board = P.chalkboard(1.5, 1.05, {text: L.harga, textY: 0.15, draw: (x, W, H) => {
      x.fillStyle = '#f4efe2'; x.textAlign = 'center'; x.font = `800 ${H * 0.1}px "Inter Display"`;
      x.fillText(L.joko, W * 0.3, H * 0.92); x.fillText(L.tetangga, W * 0.72, H * 0.92);
      x.strokeStyle = '#f4efe2'; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.1, H * 0.82); x.lineTo(W * 0.92, H * 0.82); x.stroke();
    }}); at(board, -1.5, 1.6, -4.6); g.add(board);
    const barJ = box(0.28, 0.16, 0.03, toon('#d8413a', {wear: false}), {hull: 0.008}); at(barJ, -1.5 - 0.3, 1.21, -4.55); g.add(barJ);
    const barT = box(0.28, 0.62, 0.03, toon('#5fae3a', {wear: false}), {hull: 0.008}); at(barT, -1.5 + 0.33, 1.21, -4.55); g.add(barT);
    // platform scale with Joko's few bunches; the neighbour's big pile; a pickup truck
    const scale = new THREE.Group(); at(scale, 0.75, 0, -2.0); g.add(scale);
    scale.add(box(1.0, 0.14, 0.8, '#5a6068'));
    const dialPost = cyl(0.03, 0.03, 1.0, '#4a4a50'); at(dialPost, 0.42, 0, -0.38); scale.add(dialPost);
    const dial = cyl(0.13, 0.13, 0.05, '#f3e7d3', {hull: 0.008, center: true}); at(dial, 0.42, 1.05, -0.36, 0, Math.PI / 2); scale.add(dial);
    const needle = box(0.012, 0.11, 0.01, '#d8413a', {center: true, hull: 0.003}); needle.position.set(0.42, 1.05, -0.33); scale.add(needle);
    for (const [x, z, r] of [[-0.2, 0.05, 0], [0.15, -0.1, 1.2], [0.0, 0.2, 2.3]]) { const b = P.fruitBunch(0.85); at(b, x, 0.14, z, r); scale.add(b); }
    for (const [x, z, y, r] of [[2.3, -2.1, 0, 0], [2.75, -2.3, 0, 1], [2.5, -1.75, 0, 2], [2.1, -2.5, 0, 3], [2.55, -2.05, 0.38, 4], [2.85, -1.85, 0, 5]]) { const b = P.fruitBunch(1.05); at(b, x, y, z, r); g.add(b); }
    const truck = P.car('#e8a83a'); at(truck, -4.4, 0, -2.6, Math.PI / 2 + 0.2); g.add(truck);
    // coins: a few for Joko (on the scale), a pile for the neighbour (on a crate)
    const coinsJ = P.coinPile(4, 3); at(coinsJ, 0.35, 0.14, -1.72); g.add(coinsJ);
    const crateT = P.crate(0.6, 0.45, 0.5, null, '#a8784a'); at(crateT, 1.95, 0, -1.25); g.add(crateT);
    const coinsT = P.coinPile(22, 5); at(coinsT, 1.95, 0.45, -1.25); g.add(coinsT);
    // the cutting block (shots 4-5): Dura on the left, Tenera on the right
    const st = cutStation(g, -0.15, -0.45, 0.55);
    const dura = fruitPair(st.blk, 'dura', st.top, 0, E('mengambil') + 0.1, E('membelah') + 0.4);
    const tenera = fruitPair(st.blk, 'tenera', st.top, 0.18, E('sebelah') - 0.6, E('sebelah') - 0.05);
    const tagD = tag(L.dura, 0.28, 0.11, {bg: '#d8413a', fg: '#fff3df', frame: '#6a2f2a', stick: 0.0}); at(tagD, -0.18, st.top, 0.25, 0.1, -0.5); st.blk.add(tagD);
    const tagT = tag(L.tenera, 0.32, 0.11, {bg: '#5fae3a', fg: '#fff3df', frame: '#2f5a2f', stick: 0.0}); at(tagT, 0.18, st.top, 0.25, -0.1, -0.5); st.blk.add(tagT);
    const joko = ch('joko', {seed: 83}, g, -1.0, -0.85, 0);
    const pengepul = ch('pengepul', {seed: 84}, g, 0.85, -2.85, 0);
    const tetangga = ch('tetangga', {seed: 85}, g, 2.0, -2.7, -0.2);
    const kakek = ch('kakek', {seed: 86}, g, 0.32, -0.95, 0);
    const parang = P.golok(); held(kakek, parang, {hand: 0, x: -0.01, y: -0.02, z: 0.06, rz: 0.4}); parang.scale.setScalar(1.3);
    joko.act([
      {t: 0, pose: 'present', expr: 'excited'},
      {t: E('harga') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('tetangga') + 0.1, pose: 'idle', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('kenapa') - 0.05, pose: 'shrug', expr: 'cry', action: 'talk', dur: 1.2},
      {t: cut(4), pose: 'idle', expr: 'worried'},
      {t: E('membelah') + 0.5, pose: 'idle', expr: 'surprised'},
      {t: E('tebal') + 0.1, pose: 'headHold', expr: 'grimace'},
      {t: E('dura') + 0.1, pose: 'idle', expr: 'shocked', action: 'tremble', dur: 0.6},
      {t: E('terdiam') - 0.1, pose: 'limp', expr: 'tired', action: 'slump', dur: 1.2},
      {t: cut(5), pose: 'idle', expr: 'sad'},
      {t: E('tipis2') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('tenera') + 0.1, pose: 'idle', expr: 'confused'},
      {t: E('banyak') + 0.1, pose: 'headHold', expr: 'cry'},
      {t: cut(6), pose: 'idle', expr: 'nervous'},
      {t: E('menunduk') - 0.05, pose: 'limp', expr: 'sad', action: 'slump', dur: 2.5},
      {t: E('murah2') - 0.1, pose: 'shrug', expr: 'nervous', action: 'talk', dur: 0.8},
      {t: E('palsu'), pose: 'limp', expr: 'cry'},
    ]);
    pengepul.act([
      {t: 0, pose: 'hips', expr: 'neutral'},
      {t: E('harga') - 0.05, pose: 'stop', expr: 'annoyed', action: 'shake', dur: 0.8},
      {t: E('tetangga') + 0.1, pose: 'present', expr: 'happy'},
      {t: E('murah') + 0.1, pose: 'shrug', expr: 'smug'},
    ]);
    tetangga.act([{t: 0, pose: 'hips', expr: 'smug'}, {t: E('tetangga') + 0.15, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.6},
      {t: E('kenapa') + 0.2, pose: 'hips', expr: 'smug'}, {t: E('tenera') + 0.2, pose: 'present', expr: 'proud', action: 'nod', dur: 0.6}]);
    kakek.act([
      {t: 0, pose: 'idle', expr: 'thinking'},
      {t: E('mengambil') - 0.05, pose: 'hammerDown', expr: 'determined'},
      ...chopCues(E('membelah') - 0.2, E('membelah') + 0.45, 0.3, 'determined'),
      {t: E('lihat') - 0.1, pose: 'present', expr: 'smug', action: 'talk', dur: 3.8},
      {t: E('dura') + 0.05, pose: 'point', expr: 'annoyed', action: 'talk', dur: 1.8},
      {t: E('terdiam'), pose: 'idle', expr: 'sad'},
      ...chopCues(E('sebelah') - 0.5, E('sebelah') + 0.05, 0.28, 'determined'),
      {t: E('tipis2') - 0.1, pose: 'present', expr: 'happy', action: 'talk', dur: 3.0},
      {t: E('tenera') + 0.05, pose: 'pointUp', expr: 'proud', action: 'talk', dur: 2.6},
      {t: E('banyak') + 0.05, pose: 'presentBoth', expr: 'cheesy'},
      {t: cut(6), pose: 'hips', expr: 'thinking', action: 'talk', dur: 1.0},
      {t: E('menunduk'), pose: 'hips', expr: 'confused'},
      {t: E('menghela') - 0.1, pose: 'limp', expr: 'tired', action: 'slump', dur: 1.2},
      {t: E('palsu') - 0.2, pose: 'present', expr: 'worried', action: 'talk', dur: 5.5},
    ]);
    fx(g, FX.sparks([-0.15, 0.62, -0.45], E('membelah') + 0.42, {n: 18, color: '#f2a33a', size: 0.04, speed: 0.8, life: 0.5, seed: 31}), (t) => inShots(t, 4));
    fx(g, FX.sparks([-0.01, 0.62, -0.45], E('sebelah') - 0.05, {n: 18, color: '#f2a33a', size: 0.04, speed: 0.8, life: 0.5, seed: 32}), (t) => inShots(t, 5));
    fx(g, FX.glints([0.0, 0.7, -0.4], E('banyak'), {n: 26, spread: 0.3, color: '#ffd84a'}), (t) => inShots(t, 5));
    fx(g, FX.glints([1.95, 0.7, -1.25], E('tetangga') + 0.05, {n: 20, spread: 0.4, color: '#ffe07a'}), (t) => inShots(t, 3));
    updaters.push((t) => {
      const s45 = inShots(t, 4, 5);
      kakek.group.visible = t >= cut(4);
      barJ.scale.set(1, pop(t, E('harga') - 0.1, 0.4), 1); barT.scale.set(1, pop(t, E('tetangga') - 0.05, 0.4), 1);
      coinsJ.scale.setScalar(pop(t, E('harga') + 0.05, 0.35)); coinsT.scale.setScalar(pop(t, E('tetangga'), 0.35));
      needle.rotation.z = -0.4 + 0.25 * ramp(t, 0.5, 1.5) + Math.sin(t * 12) * 0.03 * (t < 2.5 ? 1 : 0);
      st.blk.visible = t >= cut(4) - 0.05;
      // Dura halves slide left when the Tenera fruit arrives
      dura(t, t < cut(5) ? 0 : -0.18 * ramp(t, cut(5), cut(5) + 0.4));
      tenera(t, 0.18);
      tagD.visible = t > E('dura') - 0.15; tagD.scale.setScalar(pop(t, E('dura') - 0.15, 0.3));
      tagT.visible = t > E('tenera') - 0.15; tagT.scale.setScalar(pop(t, E('tenera') - 0.15, 0.3));
      parang.visible = s45;
    });
  }

  // =====================================================================================================
  // ---------- jalan: roadside stall, flashback (shot 6) ----------
  {
    const g = addLoc('jalan');
    g.add(ground(160, 160, '#9ab06a'));
    strip(g, 60, 2.2, 0, 1.4, '#5a5f66', 0.01, {stains: 30});
    for (let i = 0; i < 14; i++) { const d = box(0.9, 0.012, 0.12, '#f3e7d3', {edges: false, hull: 0}); at(d, -13 + i * 2, 0.014, 1.4); g.add(d); }
    strip(g, 60, 1.2, 0, -0.1, '#c9a87a', 0.008, {stains: 30});
    g.add(P.hills('#86a862'));
    [[-5.5, -6], [-1.5, -8], [3.5, -6.5], [7.0, -8.5]].forEach(([x, z], i) => { const p = P.oilPalm({seed: 60 + i, h: 1.6, fruit: false}); at(p.group, x, 0, z); g.add(p.group); });
    const table = box(1.9, 0.7, 0.65, toon('#a8784a', {paint: {planks: 5, seed: 17}})); at(table, 0, 0, -1.15); g.add(table);
    const umb = new THREE.Group(); at(umb, 1.2, 0, -1.6); g.add(umb);
    umb.add(cyl(0.03, 0.03, 2.4, '#e8e4dc'));
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 10, 1, true), toon('#d8413a', {paint: {stripes: {n: 10, color: '#f3e7d3'}, seed: 3}, side: THREE.DoubleSide})); canopy.position.y = 2.45; umb.add(canopy);
    const cheap = sign(L.murahSign, 1.3, 0.46, {bg: '#f6efe0', fg: '#d8413a', frame: '#8a6a4a'}); const cp = new THREE.Group(); at(cp, -1.5, 0, -0.75, 0.25); g.add(cp);
    cp.add(cyl(0.03, 0.03, 1.4, '#8a6a4a')); at(cheap, 0, 1.25, 0.03); cp.add(cheap);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { const s = P.palmSeedling({seed: 70 + r * 6 + c}); s.group.scale.setScalar(0.8); at(s.group, -2.6 + c * 0.75 + (r ? 0.35 : 0), 0, -2.1 - r * 0.6, c); g.add(s.group); }
    // the two identical seedlings on the table (shot 6, "palsu"): tags "?" then DURA / TENERA
    [-0.3, 0.3].forEach((x, i) => { const s = P.palmSeedling({seed: 90}); s.group.scale.setScalar(0.62); at(s.group, x, 0.7, -0.95, i * 0.2); g.add(s.group); });
    const q = [-0.3, 0.3].map((x) => { const tq = tag('?', 0.16, 0.16, {bg: '#f2d24a', stick: 0}); at(tq, x, 0.72, -0.72); g.add(tq); return tq; });
    const tD = tag(L.dura, 0.26, 0.12, {bg: '#d8413a', fg: '#fff3df', frame: '#6a2f2a', stick: 0}); at(tD, -0.3, 0.72, -0.72); g.add(tD);
    const tT = tag(L.tenera, 0.3, 0.12, {bg: '#5fae3a', fg: '#fff3df', frame: '#2f5a2f', stick: 0}); at(tT, 0.3, 0.72, -0.72); g.add(tT);
    const penjual = ch('penjual', {seed: 87}, g, 0.55, -1.75, 0);
    const joko = ch('joko', {seed: 88}, g, -0.75, -0.6, 0.2);
    penjual.act([{t: 0, pose: 'presentBoth', expr: 'scheming', action: 'talk', dur: 2.0}, {t: E('murah2'), pose: 'present', expr: 'cheesy'}]);
    joko.act([{t: 0, pose: 'give', expr: 'happy'}, {t: E('murah2') + 0.1, pose: 'give', expr: 'cheesy', action: 'nod', dur: 0.6}]);
    fx(g, FX.glints([0, 1.0, -0.8], E('bertahun') + 0.2, {n: 24, spread: 0.6}), (t) => inShots(t, 6));
    updaters.push((t) => {
      const reveal = t > E('bertahun') + 0.2;
      q.forEach((x) => { x.visible = !reveal; x.scale.setScalar(pop(t, E('palsu') - 0.1, 0.3)); });
      tD.visible = tT.visible = reveal; tD.scale.setScalar(pop(t, E('bertahun') + 0.2, 0.3)); tT.scale.setScalar(pop(t, E('bertahun') + 0.3, 0.3));
      const later = t > E('palsu') - 0.2;
      penjual.group.visible = joko.group.visible = !later;
    });
  }

  // =====================================================================================================
  // ---------- teras: Kakek's porch at night (shot 7) ----------
  {
    const g = addLoc('teras');
    g.add(ground(140, 140, '#5a7a4a'));
    const floor = box(7, 0.1, 3.4, toon('#8a6a4a', {paint: {planks: 14, seed: 77}}), {edges: false}); at(floor, 0, -0.1, -1.5); g.add(floor);
    const house = P.house(7, 2.9, 3, {color: '#b08454', roof: '#6a3a2a', windows: 2, doorX: -3.0, shutter: '#4f6a4f', doorColor: '#6a3a26', seed: 12}); at(house, 0, 0, -3.0); g.add(house);
    for (const x of [-3.3, 3.3]) { const p = cyl(0.07, 0.08, 2.9, '#6a4a32'); at(p, x, 0, -0.2); g.add(p); }
    const beam = box(7.2, 0.14, 0.16, '#6a4a32'); at(beam, 0, 2.9, -0.2); g.add(beam);
    [[-5.5, -1.0], [5.8, -0.4]].forEach(([x, z], i) => { const p = P.oilPalm({seed: 70 + i, h: 1.8, fruit: false}); at(p.group, x, 0, z); g.add(p.group); });
    const table = box(2.5, 0.6, 0.75, toon('#7a5236', {paint: {planks: 6, seed: 18}})); at(table, 0, 0, -1.3); g.add(table);
    const bench = P.bale(2.6, 0.45, 0.4); at(bench, 0.4, 0, -2.15); g.add(bench);
    const TT = 0.6;
    const lampB = new THREE.Group(); at(lampB, -1.0, TT, -1.5); g.add(lampB);
    lampB.add(cyl(0.07, 0.09, 0.1, '#8a6a3a', {hull: 0.006}));
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 14, 1, true), new THREE.MeshBasicMaterial({color: '#ffe0a0', transparent: true, opacity: 0.35, depthWrite: false})); glass.position.y = 0.2; lampB.add(glass);
    fx(g, FX.flame([-1.0, TT + 0.18, -1.5], {size: 0.16}));
    fx(g, FX.fireLight([-0.8, TT + 0.45, -1.1], {intensity: 5, dist: 6, color: '#ffb060'}));
    fx(g, FX.flame([2.75, 2.12, -2.85], {size: 0.12, seed: 9}));
    fx(g, FX.fireLight([2.3, 2.1, -2.2], {intensity: 3.5, dist: 5.5, color: '#ffb060', seed: 5}));
    const wl = new THREE.Group(); at(wl, 2.75, 1.95, -2.9); g.add(wl);
    wl.add(box(0.12, 0.05, 0.14, '#4a3a30')); const wlg = cyl(0.04, 0.05, 0.12, new THREE.MeshBasicMaterial({color: '#ffd98a'}), {hull: 0.006}); at(wlg, 0, 0.05, 0.03); wl.add(wlg);
    const lessons = P.chalkboard(1.55, 1.2, {text: L.pelajaran, textY: 0.14, draw: (x, W, H) => {
      x.fillStyle = '#f4efe2'; x.textAlign = 'left'; x.textBaseline = 'middle';
      L.lessons.forEach((s, i) => { let fs = H * 0.085; x.font = `800 ${fs}px "Inter Display"`; while (x.measureText(s).width > W * 0.9 && fs > 10) { fs -= 2; x.font = `800 ${fs}px "Inter Display"`; } x.fillText(s, W * 0.06, H * (0.34 + i * 0.13)); });
      x.strokeStyle = '#f4efe2'; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.15, H * 0.24); x.lineTo(W * 0.85, H * 0.24); x.stroke();
    }}); at(lessons, -1.85, 1.75, -2.9); g.add(lessons);
    const fruitD = P.fruitHalf('dura', 0.085); at(fruitD, 0.25, TT, -1.2); g.add(fruitD);
    const sdl = P.palmSeedling({seed: 91}); sdl.group.scale.setScalar(0.55); at(sdl.group, 0.75, TT, -1.25); g.add(sdl.group);
    const kakek = ch('kakekNight', {seed: 89}, g, -0.05, -1.9, 0);
    const joko = ch('joko', {seed: 90}, g, 0.98, -1.9, 0);
    kakek.setSit(1); joko.setSit(1);
    kakek.act([{t: 0, pose: 'present', expr: 'thinking', action: 'talk', dur: 1.6}, {t: E('pelajaran') - 0.1, pose: 'pointUp', expr: 'proud', action: 'talk', dur: 1.2}]);
    joko.act([{t: 0, pose: 'limp', expr: 'sad'}, {t: E('pelajaran') + 0.2, pose: 'chin', expr: 'determined', action: 'nod', dur: 0.6}]);
    updaters.push((t) => { lessons.scale.setScalar(pop(t, E('pelajaran') - 0.15, 0.4)); });
  }

  // =====================================================================================================
  // ---------- penangkar: the official seed nursery (shots 8, 9, 10) ----------
  {
    const g = addLoc('penangkar');
    g.add(ground(160, 160, '#8fb36a'));
    strip(g, 9, 6, 0, -3.6, '#a88a5a', 0.008, {stains: 30});
    g.add(P.hills('#7fa35a'));
    for (const [x, z] of [[-4, -0.9], [4, -0.9], [-4, -6.4], [4, -6.4], [0, -6.4], [0, -0.9]]) { const p = cyl(0.05, 0.06, 2.4, '#8a8a90'); at(p, x, 0, z); g.add(p); }
    const net = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 5.7), new THREE.MeshBasicMaterial({color: '#2f5a2f', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false}));
    net.rotation.x = -Math.PI / 2; net.position.set(0, 2.4, -3.65); g.add(net);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const s = P.palmSeedling({seed: 100 + r * 7 + c}); s.group.scale.setScalar(1.0 + (r % 2) * 0.05); at(s.group, -3.3 + c * 1.1 + (r % 2) * 0.55, 0, -2.4 - r * 1.1, c * 0.8); g.add(s.group); }
    const ban = P.banner(L.penangkar, 2.8, 0.5, {poleH: 2.25, bg: '#3f7a3f', frame: '#1f4a1f'}); at(ban, -1.6, 0, -1.55); g.add(ban);
    const izin = sign(L.berizin, 0.9, 0.28, {bg: '#f2d24a', frame: '#8a6a2a'}); at(izin, -1.6, 1.45, -1.5); g.add(izin);
    // table with the certificate, the good and the bad seedling, price tags
    const table = box(2.4, 0.75, 0.7, toon('#a8784a', {paint: {planks: 5, seed: 27}})); at(table, 0.25, 0, -0.55); g.add(table);
    const TT = 0.75;
    const cert = P.certificate(L.sertifikat, L.sertifikatSub, 0.46, 0.32); at(cert, 0.25, TT + 0.2, -0.75, 0, -0.25); g.add(cert);
    const easel = box(0.04, 0.3, 0.04, '#7a5236', {hull: 0.004}); at(easel, 0.25, TT, -0.85, 0, -0.3); g.add(easel);
    const good = P.palmSeedling({seed: 120}); good.group.scale.setScalar(0.62); at(good.group, 0.85, TT, -0.45); g.add(good.group);
    const lbl = tag(L.label, 0.34, 0.1, {bg: '#fbf5e6', stick: 0.1}); at(lbl, 1.2, TT, -0.35, -0.3); g.add(lbl);
    const bad = P.palmSeedling({seed: 121, bad: true}); bad.group.scale.setScalar(0.62); at(bad.group, -0.45, TT, -0.45); g.add(bad.group);
    const tagM = tag(L.murah, 0.28, 0.12, {bg: '#d8413a', fg: '#fff3df', frame: '#6a2f2a'}); at(tagM, -0.45, TT, -0.2, 0.15); g.add(tagM);
    const xM = P.redX(0.3); at(xM, -0.45, TT + 0.32, -0.12); g.add(xM);
    const tagU = tag(L.unggul, 0.3, 0.12, {bg: '#5fae3a', fg: '#fff3df', frame: '#2f5a2f'}); at(tagU, 1.18, TT, -0.25, -0.15); g.add(tagU);
    const coinsU = P.coinPile(12, 7); at(coinsU, 1.3, TT, -0.6); g.add(coinsU);
    const coinsM = P.coinPile(3, 8); at(coinsM, -0.8, TT, -0.6); g.add(coinsM);
    const basket = new THREE.Group(); at(basket, -1.55, 0, -0.35); g.add(basket);
    basket.add(cyl(0.3, 0.24, 0.32, toon('#b8925a', {paint: {stripes: {n: 14, color: '#9a7a4a'}, seed: 21}})));
    const afkir = sign(L.afkir, 0.4, 0.14, {bg: '#d8413a', fg: '#fff3df', frame: '#6a2f2a', depth: 0.02}); at(afkir, 0, 0.18, 0.3); basket.add(afkir);
    const kakek = ch('kakek', {seed: 91}, g, -0.2, -1.25, 0);
    const joko = ch('joko', {seed: 92}, g, 1.05, -1.3, 0);
    kakek.act([
      {t: 0, pose: 'present', expr: 'happy', action: 'talk', dur: 2.0},
      {t: E('penangkar') + 0.05, pose: 'point', expr: 'proud'},
      {t: E('izin') + 0.05, pose: 'pointUp', expr: 'smug', action: 'nod', dur: 0.6},
      {t: E('kedua') - 0.05, pose: 'present', expr: 'happy', action: 'talk', dur: 1.4},
      {t: E('sertifikat') + 0.05, pose: 'presentBoth', expr: 'proud'},
      {t: cut(9), pose: 'stop', expr: 'annoyed', action: 'shake', dur: 0.8},
      {t: E('unggul') + 0.05, pose: 'present', expr: 'proud', action: 'nod', dur: 0.6},
      {t: cut(10), pose: 'present', expr: 'thinking', action: 'talk', dur: 2.0},
      {t: E('kokoh') + 0.05, pose: 'presentBoth', expr: 'happy'},
      {t: E('singkirkan') - 0.1, pose: 'carry', expr: 'disgusted'},
      {t: E('singkirkan') + 0.5, pose: 'hips', expr: 'smug', action: 'nod', dur: 0.6},
    ]);
    joko.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: E('izin') + 0.2, pose: 'idle', expr: 'happy', action: 'nod', dur: 0.6},
      {t: E('label') + 0.1, pose: 'point', expr: 'excited'},
      {t: E('tergiur') + 0.1, pose: 'idle', expr: 'nervous'},
      {t: E('mahal') + 0.1, pose: 'shrug', expr: 'grimace'},
      {t: E('segar') + 0.1, pose: 'chin', expr: 'thinking'},
      {t: E('kerdil') + 0.1, pose: 'idle', expr: 'surprised', action: 'hop', dur: 0.5},
    ]);
    fx(g, FX.glints([-1.6, 1.6, -1.4], E('izin'), {n: 24, spread: 0.6}), (t) => inShots(t, 8));
    fx(g, FX.glints([0.25, TT + 0.25, -0.7], E('sertifikat') + 0.05, {n: 22, spread: 0.4}), (t) => inShots(t, 8));
    fx(g, FX.glints([0.85, TT + 0.45, -0.45], E('kokoh'), {n: 20, spread: 0.3, color: '#eaffb0'}), (t) => inShots(t, 10));
    fx(g, FX.glints([0.85, TT + 0.45, -0.45], E('segar'), {n: 20, spread: 0.3, color: '#eaffb0'}), (t) => inShots(t, 10));
    fx(g, FX.dust([-1.55, 0.3, -0.35], E('singkirkan') + 0.75, {n: 8, size: 0.4}), (t) => inShots(t, 10));
    const badP = bad.group.position.clone();
    updaters.push((t) => {
      ban.scale.setScalar(pop(t, E('penangkar') - 0.15, 0.4));
      izin.scale.setScalar(pop(t, E('izin') - 0.1, 0.35));
      cert.visible = easel.visible = t >= cut(8); cert.scale.setScalar(pop(t, E('sertifikat') - 0.1, 0.35));
      lbl.scale.setScalar(pop(t, E('label') - 0.1, 0.35));
      tagM.visible = coinsM.visible = inShots(t, 9); tagM.scale.setScalar(pop(t, E('tergiur') - 0.1, 0.35)); coinsM.scale.setScalar(pop(t, E('tergiur'), 0.35));
      xM.visible = inShots(t, 9) && t > E('tergiur') + 0.5; xM.scale.setScalar(pop(t, E('tergiur') + 0.5, 0.3));
      tagU.visible = coinsU.visible = inShots(t, 9); tagU.scale.setScalar(pop(t, E('unggul') - 0.1, 0.35)); coinsU.scale.setScalar(pop(t, E('mahal') - 0.1, 0.35));
      // the stunted seedling is tossed into the AFKIR basket on "singkirkan"
      const u = ramp(t, E('singkirkan') + 0.1, E('singkirkan') + 0.75);
      bad.group.visible = t >= cut(9) && !(t > E('singkirkan') + 0.8);
      bad.group.position.set(lerp(badP.x, -1.55, u), lerp(badP.y, 0.3, u) + Math.sin(u * Math.PI) * 0.6, lerp(badP.z, -0.35, u));
      bad.group.rotation.z = u * 3;
      basket.visible = inShots(t, 10);
      good.group.visible = t >= cut(8);
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); for (const u of post) u(t); }};
}
