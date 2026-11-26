// All locations in one scene at different x offsets. Story: "Ganoderma, jamur pembunuh sawit" (Indonesian).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, signTex, decal, paintTex, pop, smooth, clamp01, gradientMap, rng, canvas, texFrom} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {kebun: 0, akar: 40};

export {LOOK_PRESETS, MOODS} from './lighting';

// Character design for this story: 'stout' (new) — round head, tuft hair, sturdier limbs, short legs.
export const CHAR_DESIGN = 'stout';
const CAST = {hasan: {}, kakek: {}};

// Lighting plan (camera_plan.md): a still, moonlit night when the palm falls (no wind, no rain); dawn when Hasan finds
// the rotten base; flat overcast "months later" while the disease spreads, danger tint on "Ganoderma" and "sarangnya";
// clear day for the five steps; golden hour once the garden is saved. The underground cutaway is a cool, mysterious grade.
const night = {...LOOK_PRESETS.night, keyI: 1.7, hemiI: 1.05, keyPos: [-6, 12, 4], grade: {...LOOK_PRESETS.night.grade, vignette: 0.5}};
const dawnL = {...LOOK_PRESETS.dawn, keyPos: [-9, 4, 5]};
const day = {...LOOK_PRESETS.day, keyPos: [-6, 10, 7]};
const grey = {...LOOK_PRESETS.overcast, keyPos: [-5, 11, 5]};
const golden = {...LOOK_PRESETS.goldenHour, keyPos: [-9, 5, 6]};

export const LOOK = {
  kebun: {keys: [{at: 0, ...night}, {at: 8.6, ...night}, {at: 'cut2', ...dawnL}, {at: 'pangkal', ...dawnL}, {at: 'busuk', ...dawnL, ...MOODS.tense},
    {at: 'cut3', ...day}, {at: 'biasa', ...day}, {at: 'bulan', ...grey}, {at: 'sakit', ...grey, ...MOODS.tense}, {at: 'cut5', ...day},
    {at: 'kipas', ...day}, {at: 'ganoderma', ...day, ...MOODS.danger}, {at: 'cut7', ...day}, {at: 'tunggul', ...day}, {at: 'sarang', ...day, ...MOODS.danger},
    {at: 'cut8', ...day}, {at: 'kehilangan', ...day}, {at: 'cut14', ...golden}, {at: 'selamat', ...golden, ...MOODS.joyful},
    {at: 'cut15', ...golden}, {at: 'terlambat', ...golden, ...MOODS.tense}, {at: 'bagikan', ...golden, ...MOODS.joyful}]},
  akar: {keys: [{at: 0, ...day, ...MOODS.mystery}, {at: 'cut15', ...day, ...MOODS.mystery}, {at: 'terlambat', ...day, ...MOODS.danger}]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.keras + 0.8, dur: 0.3, color: '#cfe0ff', strength: 0.3},
      {t: EVt.busuk, dur: 0.3, color: '#ffb080', strength: 0.2},
      {t: EVt.ganoderma, dur: 0.35, color: '#ff6a50', strength: 0.3},
      {t: EVt.bersentuhan, dur: 0.3, color: '#ff6a50', strength: 0.25},
      {t: EVt.sarang, dur: 0.35, color: '#ff6a50', strength: 0.3},
      {t: EVt.selamat, dur: 0.35, color: '#ffe9b0', strength: 0.35},
      {t: EVt.bagikan, dur: 0.3, color: '#fff4d6', strength: 0.3},
    ],
    shakes: [{t: EVt.keras + 0.8, dur: 0.5, amp: 0.04}, {t: EVt.dibongkar + 0.2, dur: 0.6, amp: 0.02}, {t: EVt.memutus, dur: 0.3, amp: 0.015},
      {t: EVt.bersihkan + 0.3, dur: 0.4, amp: 0.02}],
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
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar(name, {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => { if (EVt[k] === undefined) throw new Error('no EV ' + k); return EVt[k]; };
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const lerp = (a, b, u) => a + (b - a) * u;
  const ramp = (t, t0, t1) => smooth((t - t0) / (t1 - t0));
  const tag = (text, w, h, o = {}) => { const g = new THREE.Group(); const stick = o.stick ?? 0.5; const s = sign(text, w, h, {bg: o.bg || '#f3e7d3', fg: o.fg, frame: o.frame || '#8a5a2a', depth: 0.02}); at(s, 0, h / 2 + stick, 0); g.add(s); if (stick > 0) g.add(cyl(0.012, 0.012, stick + 0.02, '#7a5236', {hull: 0.003})); return g; };
  const chopCues = (t0, t1, step, expr) => { const out = []; let i = 0; for (let tt = t0; tt < t1; tt += step, i++) out.push({t: tt, pose: i % 2 ? 'hammerDown' : 'hammerUp', expr}); return out; };
  const fern = (s = 1, seed = 1) => { const g = new THREE.Group(); const r = rng(seed); for (let i = 0; i < 8; i++) { const piv = new THREE.Group(); piv.rotation.y = i * 0.8 + r() * 0.3; g.add(piv); const f = P.frond(0.75 * s, {lift: 1.1, arch: 0.9, color: i % 2 ? '#5f9e42' : '#4f8f3a'}); piv.add(f); } return g; };

  // =====================================================================================================
  // ---------- kebun: Pak Hasan's plantation (every shot except the underground cutaways) ----------
  {
    const g = addLoc('kebun');
    g.add(ground(160, 160, '#8fae62'));
    g.add(P.hills('#7a9a5a'));
    const grid = [];
    for (let row = 0; row < 4; row++) {
      const z = -3.0 - row * 4.2, xs = row % 2 ? [-8.2, -3.8, 0.6, 5.0, 9.4] : [-6.0, -1.6, 2.8, 7.2];
      for (const x of xs) grid.push([x, z]);
    }
    const palms = grid.map(([x, z], i) => {
      const p = P.oilPalm({seed: 30 + i, h: 1.7 + (i % 3) * 0.15, len: 2.6, bunches: 2});
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), toon('#9a7a52', {paint: {seed: 5, stains: 20}})); disc.rotation.x = -Math.PI / 2; disc.position.set(x, 0.006, z); disc.receiveShadow = true; g.add(disc);
      at(p.group, x, 0, z, i * 0.7); g.add(p.group);
      return {...p, x, z};
    });
    const F = palms[1], S1 = palms[2], S2 = palms[6];
    // F: the palm that falls at night; a rotten dark base travels with it, a broken rotten stump stays in the ground
    const rotBase = cyl(0.33, 0.36, 0.4, toon('#4a3024', {paint: {seed: 79, stains: 40, chips: 30}}), {hull: 0.016}); F.group.add(rotBase);
    const stumpF = P.rottenStump(0.32, 0.42); at(stumpF, F.x, 0, F.z); g.add(stumpF);
    const holeMat = toon('#3a2418', {paint: {seed: 81, stains: 30}});
    const mkHole = (x, z) => { const h = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), holeMat); h.rotation.x = -Math.PI / 2; h.position.set(x, 0.012, z); g.add(h); return h; };
    const holeF = mkHole(F.x, F.z), holeS1 = mkHole(S1.x, S1.z);
    // S1 / S2: the sick neighbours (pale fronds, broken hanging fronds, unopened spear leaves)
    const spears = P.spearLeaves(4, 1.2); S1.crown.add(spears);
    const hang = [...S1.fronds].sort((a, b) => a.position.y - b.position.y).slice(0, 5);
    const gano = P.ganoCluster(0.36, 4, {angle: 0, spread: 1.6, size: 0.16, seed: 5}); at(gano.group, S1.x, 0, S1.z); g.add(gano.group);
    const ganoP = gano.items.map((b) => b.position.clone());
    const rootB = P.rootBall(0.5); rootB.position.y = -0.1; S1.group.add(rootB);
    // tags for the symptoms (step 1) and the GANODERMA tag
    const tagG = tag(L.gano, 0.6, 0.18, {bg: '#d8413a', fg: '#fff3df', frame: '#6a2f2a', stick: 0.45}); at(tagG, S1.x - 0.55, 0, S1.z + 0.55, 0.2); g.add(tagG);
    const tagJ = tag(L.jamur, 0.4, 0.16, {bg: '#f2d24a', stick: 0.35}); at(tagJ, S1.x + 0.5, 0, S1.z + 0.55, -0.2); g.add(tagJ);
    const tagT = tag(L.tombak, 0.7, 0.2, {bg: '#f2d24a', stick: 0}); at(tagT, S1.x + 0.75, 3.05, S1.z + 0.35); g.add(tagT);
    const tagP = tag(L.pucat, 0.6, 0.2, {bg: '#f2d24a', stick: 0}); at(tagP, S1.x - 1.0, 2.3, S1.z + 0.9); g.add(tagP);
    // trench around S2 (step 3): 24 dark segments appear in turn + a dirt mound
    const trenchMat = new THREE.MeshBasicMaterial({color: '#24150e'});
    const trench = []; for (let i = 0; i < 24; i++) { const seg = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.55, 3, 1, i / 24 * Math.PI * 2, Math.PI * 2 / 24 + 0.01), trenchMat); seg.rotation.x = -Math.PI / 2; seg.position.set(S2.x, 0.014, S2.z); g.add(seg); trench.push(seg); }
    const mound = []; for (let i = 0; i < 24; i++) { const a = (i + 0.5) / 24 * Math.PI * 2; const m = ball(0.16, '#8a6a4a', {sy: 0.5, seg: 8, hull: 0.008}); at(m, S2.x + Math.cos(a) * 1.68, 0.02, S2.z - Math.sin(a) * 1.68); g.add(m); mound.push(m); }
    const tagParit = tag(L.parit, 0.75, 0.2, {bg: '#f2d24a', stick: 0.45}); at(tagParit, S2.x + 1.45, 0, S2.z + 1.1, -0.3); g.add(tagParit);
    // the corner pile of old trunks and stumps (the nest), with brackets
    const pile = new THREE.Group(); at(pile, -6.2, 0, -1.2, 0.3); g.add(pile);
    for (const [x, z, y, ry] of [[0, 0, 0, 0.2], [0.1, 0.6, 0, -0.1], [-0.1, 0.3, 0.55, 0.15]]) { const l = new THREE.Group(); at(l, x, y, z, ry); pile.add(l); const tr = cyl(0.28, 0.3, 2.0, toon('#5a4a36', {paint: {seed: 90, stains: 40, chips: 30}}), {hull: 0.014, center: true}); tr.rotation.z = Math.PI / 2; tr.position.y = 0.28; l.add(tr); }
    for (const [x, z] of [[1.3, -0.4], [-1.3, 0.9], [1.1, 1.0]]) { const s = P.rottenStump(0.28, 0.4); at(s, x, 0, z); pile.add(s); const c = P.ganoCluster(0.28, 3, {seed: x * 10 + 3, size: 0.12}); at(c.group, x, 0, z); pile.add(c.group); }
    for (const [x, y, z] of [[0.3, 0.55, 0.3], [-0.5, 0.6, 0.62], [0.6, 0.9, 0.35]]) { const b = P.ganoBracket(0.14); at(b, x, y, z); pile.add(b); }
    const tagS = tag(L.sarang, 0.7, 0.2, {bg: '#d8413a', fg: '#fff3df', frame: '#6a2f2a', stick: 0.9}); at(tagS, -5.0, 0, -0.6, 0.3); g.add(tagS);
    // sack for the removed brackets (step 2)
    const sack = P.sack(L.karung, {color: '#ece4cc'}); at(sack, S1.x - 0.75, 0, S1.z + 0.65, 0.2); g.add(sack);
    // new seedlings where the sick palms and the pile were (step 5, shot 14-15)
    const seedPos = [[F.x, F.z], [S1.x, S1.z], [-6.2, -1.2], [-5.0, -2.2], [-7.2, -0.4]];
    const seeds = seedPos.map(([x, z], i) => { const s = P.palmSeedling({seed: 40 + i}); at(s.group, x, 0, z, i); g.add(s.group); return s; });
    // ferns around S1 base hide Kakek's legs while he crouches
    const ferns = [[S1.x - 0.75, S1.z + 0.95, 1.0], [S1.x - 0.25, S1.z + 1.15, 0.8], [S1.x - 1.25, S1.z + 0.85, 0.9]].map(([x, z, s], i) => { const f = fern(s, 3 + i); at(f, x, 0, z); g.add(f); return f; });
    // Hasan's hut, window light at night
    const hut = P.house(2.8, 2.2, 2.4, {color: '#c9a06a', roof: '#8a6a3a', windows: 1, doorColor: '#7a4a32', seed: 21}); at(hut, 6.0, 0, 0.4, -0.75); g.add(hut);
    const winL = new THREE.PointLight('#ffc070', 0, 7, 1.6); winL.position.set(5.2, 1.6, 1.4); g.add(winL);

    const hasan = ch('hasan', {seed: 51}, g, 5.4, 1.2, 0);
    const kakek = ch('kakek', {seed: 52}, g, 6.0, -2.2, 0);
    const lantern = new THREE.Group(); lantern.add(cyl(0.06, 0.07, 0.04, '#5a4a3a', {hull: 0.005})); const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.14, 12, 1, true), new THREE.MeshBasicMaterial({color: '#ffe0a0', transparent: true, opacity: 0.4, depthWrite: false})); lg.position.y = 0.11; lantern.add(lg);
    const lfl = FX.flame([0, 0.1, 0], {size: 0.12}); lantern.add(lfl.obj); updaters.push(lfl.update);
    const lpl = new THREE.PointLight('#ffb060', 2.5, 4, 1.5); lpl.position.y = 0.15; lantern.add(lpl);
    held(hasan, lantern, {hand: 1, x: 0, y: -0.12, z: 0.06}); lantern.rotation.z = Math.PI;
    const parang = P.golok(); held(hasan, parang, {hand: 0, x: -0.01, y: -0.02, z: 0.06, rz: 0.4}); parang.scale.setScalar(1.3);
    const hoe = new THREE.Group(); const hh = cyl(0.018, 0.02, 0.9, '#8a5a3a', {hull: 0.005, center: true}); hh.position.y = -0.35; hoe.add(hh);
    const hb = box(0.2, 0.14, 0.02, toon('#9aa0a6', {wear: false}), {hull: 0.006, center: true}); hb.position.set(0, -0.82, 0.06); hb.rotation.x = 1.1; hoe.add(hb);
    held(hasan, hoe, {hand: 0, x: 0, y: 0, z: 0.05});
    hasan.act([
      {t: 0, pose: 'hold', expr: 'shocked'},
      {t: E('hasan') - 0.1, pose: 'hold', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('tumbang') + 0.1, expr: 'grimace', action: 'tremble', dur: 0.8},
      {t: E('angin') - 0.1, pose: 'hold', expr: 'confused'},
      {t: cut(2), pose: 'idle', expr: 'worried'},
      {t: E('busuk') + 0.1, pose: 'headHold', expr: 'grimace'},
      {t: cut(3), pose: 'idle', expr: 'thinking'},
      {t: E('biasa') - 0.1, pose: 'shrug', expr: 'neutral'},
      {t: E('sakit') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('berikutnya') + 0.1, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: cut(4), pose: 'idle', expr: 'worried'},
      {t: cut(5), pose: 'idle', expr: 'confused'},
      {t: E('ganoderma') + 0.1, pose: 'headHold', expr: 'scream', action: 'tremble', dur: 0.8},
      {t: cut(7), pose: 'shrug', expr: 'confused', action: 'talk', dur: 1.8},
      {t: E('tumpukan') + 0.2, pose: 'idle', expr: 'surprised'},
      {t: E('sarang') + 0.1, pose: 'idle', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('melawan') - 0.1, pose: 'flex', expr: 'determined', action: 'nod', dur: 0.6},
      {t: cut(9), pose: 'chin', expr: 'thinking'},
      {t: E('membuka') + 0.1, pose: 'idle', expr: 'surprised', action: 'nod', dur: 0.5},
      {t: cut(10), pose: 'hammerDown', expr: 'determined'},
      ...chopCues(E('buang') - 0.2, E('buang') + 1.3, 0.3, 'determined'),
      {t: E('spora') + 0.1, pose: 'idle', expr: 'happy'},
      {t: cut(11), pose: 'hammerDown', expr: 'determined'},
      ...chopCues(E('parit') - 0.2, E('memutus') - 0.3, 0.32, 'gritted'),
      {t: E('sehat') + 0.05, pose: 'hips', expr: 'proud'},
      {t: cut(12), pose: 'idle', expr: 'determined'},
      {t: E('dibongkar') + 0.3, pose: 'armsUp', expr: 'excited', action: 'hop', dur: 0.6},
      {t: E('tinggalkan') - 0.1, pose: 'pointL', expr: 'annoyed'},
      {t: cut(13), pose: 'hammerDown', expr: 'determined'},
      ...chopCues(E('bersihkan') - 0.2, E('bersihkan') + 1.4, 0.3, 'determined'),
      {t: E('biarkan') + 0.2, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.6},
      {t: cut(14), pose: 'limp', expr: 'sad'},
      {t: E('selamat') + 0.05, pose: 'cheer', expr: 'toothy', action: 'jump', dur: 0.6},
      {t: cut(15), pose: 'idle', expr: 'thinking'},
      {t: E('terlambat') + 0.05, pose: 'idle', expr: 'worried'},
      {t: E('bagikan') + 0.05, pose: 'point', expr: 'cheesy', action: 'nod', dur: 0.6},
    ]);
    const walk5 = E('berjongkok') - 0.1;
    kakek.act([
      {t: 0, pose: 'idle', expr: 'thinking'},
      {t: cut(5), pose: 'idle', expr: 'thinking', action: 'walk', dur: walk5 - cut(5)},
      {t: E('berjongkok') + 0.1, pose: 'idle', expr: 'thinking'},
      {t: E('menunjuk') + 0.05, pose: 'point', expr: 'determined'},
      {t: E('ganoderma') + 0.05, pose: 'point', expr: 'angry', action: 'talk', dur: 2.6},
      {t: cut(7), pose: 'hips', expr: 'thinking'},
      {t: E('tumpukan') - 0.1, pose: 'pointL', expr: 'annoyed', action: 'talk', dur: 4.5},
      {t: E('sarang') + 0.05, pose: 'pointL', expr: 'furious'},
      {t: E('melawan') - 0.05, pose: 'flex', expr: 'proud', action: 'nod', dur: 0.6},
      {t: cut(9), pose: 'present', expr: 'happy', action: 'talk', dur: 2.0},
      {t: E('membuka') + 0.05, pose: 'pointUp', expr: 'determined'},
      {t: cut(10), pose: 'hips', expr: 'smug', action: 'nod', dur: 0.6},
      {t: cut(11), pose: 'present', expr: 'thinking', action: 'talk', dur: 2.0},
      {t: cut(12), pose: 'present', expr: 'determined', action: 'talk', dur: 1.8},
      {t: E('tinggalkan') + 0.05, pose: 'stop', expr: 'annoyed', action: 'shake', dur: 0.8},
      {t: cut(13), pose: 'hips', expr: 'proud', action: 'nod', dur: 0.6},
      {t: E('biarkan') + 0.25, pose: 'cheer', expr: 'happy'},
      {t: cut(14), pose: 'idle', expr: 'sad'},
      {t: E('selamat') + 0.1, pose: 'cheer', expr: 'cheesy', action: 'hop', dur: 0.6},
      {t: cut(15), pose: 'present', expr: 'thinking', action: 'talk', dur: 2.0},
      {t: E('bagikan') + 0.1, pose: 'wave', expr: 'cheesy'},
    ]);
    // effects
    fx(g, FX.dust([F.x - 1.8, 0.05, F.z], E('keras') + 0.8, {n: 12, size: 0.8}), (t) => inShots(t, 1));
    fx(g, FX.debris([F.x, 0.3, F.z + 0.2], E('busuk') + 0.05, {n: 12, color: '#5a4030', speed: 1.0}), (t) => inShots(t, 2));
    fx(g, FX.glints([S1.x, 0.3, S1.z + 0.4], E('cokelat'), {n: 20, spread: 0.4, color: '#ffd07a'}), (t) => inShots(t, 5));
    fx(g, FX.smoke([-6.2, 0.6, -1.0], E('sarang') - 0.1, {n: 8, size: 0.5, rise: 0.8, life: 1.6, color: '#8a5a3a', opacity: 0.55, every: 0.15}), (t) => inShots(t, 7));
    fx(g, FX.smoke([S1.x, 0.3, S1.z + 0.4], E('buang') + 0.3, {n: 6, size: 0.3, rise: 0.4, life: 1.0, color: '#8a5a3a', opacity: 0.5, every: 0.25}), (t) => inShots(t, 10));
    fx(g, FX.dust([S2.x + 1.4, 0.05, S2.z], E('parit') + 0.2, {n: 10, size: 0.5}), (t) => inShots(t, 11));
    fx(g, FX.dust([S1.x, 0.05, S1.z], E('dibongkar') + 0.2, {n: 12, size: 0.8}), (t) => inShots(t, 12));
    fx(g, FX.dust([-6.2, 0.1, -1.2], E('bersihkan') + 0.3, {n: 12, size: 0.9}), (t) => inShots(t, 13));
    fx(g, FX.sparks([-6.0, 0.6, -1.0], E('bersihkan') + 0.2, {n: 30, color: '#8a6a4a', size: 0.05, speed: 1.0, life: 0.7}), (t) => inShots(t, 13));
    fx(g, FX.glints([-6.0, 0.6, -1.4], E('biarkan') + 0.1, {n: 28, spread: 1.4, color: '#eaffb0'}), (t) => inShots(t, 13));
    fx(g, FX.glints([0, 1.2, -3.0], E('selamat'), {n: 40, spread: 3, color: '#ffe07a'}), (t) => inShots(t, 14));
    const xF = P.redX(0.45); at(xF, F.x, 0.95, F.z + 0.2); g.add(xF);
    updaters.push((t) => {
      const s1 = inShots(t, 1), s2 = inShots(t, 2), s5 = inShots(t, 5), s7 = inShots(t, 7, 8), s9 = inShots(t, 9), s10 = inShots(t, 10), s11 = inShots(t, 11), s12 = inShots(t, 12), s13 = inShots(t, 13), late = t >= cut(14);
      // F falls at night with no wind (the others stay still); afterwards it lies there until step 5 clears it
      const fall = clamp01((t - E('keras') - 0.1) / 0.75);
      F.group.rotation.z = 1.52 * fall * fall;
      F.group.position.x = F.x - 0.15 * fall;
      F.group.visible = !(t > E('bersihkan') + 1.0);
      F.group.scale.setScalar(s13 ? Math.max(0.0001, 1 - ramp(t, E('bersihkan') + 0.2, E('bersihkan') + 1.0)) : 1);
      rotBase.visible = fall > 0.5;
      stumpF.visible = fall > 0.5 && !(t > E('tinggalkan') + 0.7);
      stumpF.scale.setScalar(s12 ? Math.max(0.0001, 1 - ramp(t, E('tinggalkan') + 0.4, E('tinggalkan') + 0.7)) : 1);
      xF.visible = s12 && t > E('tinggalkan') - 0.1; xF.scale.setScalar(pop(t, E('tinggalkan') - 0.1, 0.3));
      holeF.visible = t > E('tinggalkan') + 0.6 && !(t > E('biarkan'));
      // S1 sick from "sakit": pale fronds, hanging old fronds, spear leaves; uprooted in step 4
      const pale1 = t < cut(3) ? 0 : ramp(t, E('sakit') - 0.3, E('sakit') + 1.5);
      const pale2 = t < cut(3) ? 0 : ramp(t, E('berikutnya') - 0.2, E('berikutnya') + 1.5) * (late ? 0.5 : 1);
      // pale = yellowed fronds (emissive yellow on top of the green), the broken ones also go brown
      S1.fronds.forEach((f) => { f.material.color.setRGB(1, 1, lerp(1, 0.55, pale1)); f.material.emissive.setRGB(0.5 * pale1, 0.42 * pale1, 0.02 * pale1); });
      S2.fronds.forEach((f) => { f.material.color.setRGB(1, 1, lerp(1, 0.7, pale2)); f.material.emissive.setRGB(0.32 * pale2, 0.27 * pale2, 0.01 * pale2); });
      const hk = t < cut(3) ? 0 : ramp(t, E('menggantung') - 0.4, E('menggantung') + 0.4);
      hang.forEach((f, i) => { f.rotation.z = -1.5 * hk * (0.85 + 0.06 * i); f.material.color.setRGB(lerp(1, 0.75, hk), lerp(1, 0.55, hk), lerp(0.55, 0.3, hk)); });
      spears.scale.set(1, t < cut(3) ? 0.0001 : Math.max(0.0001, ramp(t, E('pucuk') - 0.4, E('pucuk') + 0.4)), 1);
      const up = s12 ? ramp(t, E('dibongkar') - 0.2, E('dibongkar') + 1.0) : (t >= cut(13) ? 1 : 0);
      S1.group.position.y = 1.3 * up; S1.group.rotation.z = -0.35 * up;
      S1.group.visible = !(t > E('tinggalkan') - 0.3);
      rootB.visible = up > 0.02;
      holeS1.visible = t > E('dibongkar') && !(t > E('biarkan'));
      // brackets: appear when Kakek points them out, scraped into the sack in step 2
      const flyU = s10 || t >= cut(11) ? ramp(t, E('buang') + 0.1, E('buang') + 1.1) : 0;
      gano.items.forEach((b, i) => {
        const k = t < cut(5) ? 0 : pop(t, E('cokelat') - 0.3 + i * 0.12, 0.35);
        const u = clamp01(flyU * 1.6 - i * 0.2);
        b.visible = k > 0.01 && u < 0.98 && !(t > E('tinggalkan') - 0.3);
        b.scale.setScalar(k * (1 - u * 0.5));
        b.position.set(ganoP[i].x, ganoP[i].y + Math.sin(u * Math.PI) * 0.4 + u * 0.4, ganoP[i].z);
      });
      // the whole cluster drifts over to the sack while the brackets are scraped off
      gano.group.position.z = S1.z + lerp(0, 0.5, flyU);
      gano.group.position.x = S1.x - lerp(0, 0.7, flyU);
      tagG.visible = s5 || inShots(t, 6); tagG.scale.setScalar(pop(t, E('ganoderma') - 0.15, 0.35));
      tagJ.visible = s9; tagJ.scale.setScalar(pop(t, E('jamur1') - 0.15, 0.35));
      tagT.visible = s9; tagT.scale.setScalar(pop(t, E('membuka') - 0.15, 0.35));
      tagP.visible = s9; tagP.scale.setScalar(pop(t, E('pucat2') - 0.15, 0.35));
      sack.visible = s10;
      const tu = s11 ? ramp(t, E('parit') - 0.1, E('memutus') - 0.4) : (t >= cut(12) ? 1 : 0);
      trench.forEach((s, i) => { s.visible = tu * 24 > i; });
      mound.forEach((m, i) => { m.visible = tu * 24 > i; });
      tagParit.visible = s11; tagParit.scale.setScalar(pop(t, E('parit') + 0.2, 0.35));
      tagS.visible = s7; tagS.scale.setScalar(pop(t, E('sarang') - 0.15, 0.35));
      pile.visible = !(t > E('bersihkan') + 1.2);
      pile.scale.set(1, s13 ? Math.max(0.0001, 1 - ramp(t, E('bersihkan') + 0.2, E('bersihkan') + 1.2)) : 1, 1);
      seeds.forEach((s, i) => { s.group.visible = t > E('biarkan') - 0.1; s.group.scale.setScalar(s13 ? pop(t, E('biarkan') - 0.1 + i * 0.1, 0.35) : 1.1); });
      ferns.forEach((f) => { f.visible = t < cut(12); });
      winL.intensity = s1 ? 3.0 : 0;
      // characters by shot
      hasan.group.visible = (s1 && t > E('hasan') - 0.2) || (t >= cut(2) && !inShots(t, 4) && !inShots(t, 6));
      lantern.visible = s1; parang.visible = s10; hoe.visible = s11 || s13;
      if (s1) hasan.group.position.set(5.1, 0, 1.3);
      else if (s2) hasan.group.position.set(-0.55, 0, -2.0);
      else if (inShots(t, 3)) hasan.group.position.set(0.9, 0, -1.7);
      else if (s10) hasan.group.position.set(S1.x + 0.6, 0, S1.z + 0.65);
      else if (s11) hasan.group.position.set(S2.x + 1.75, 0, S2.z + 0.9);
      else if (s12) hasan.group.position.set(1.4, 0, -1.6);
      else if (s13) hasan.group.position.set(-4.85, 0, -1.75);
      else if (late) hasan.group.position.set(-0.45, 0, -0.6);
      else if (s7 || s9) hasan.group.position.set(-0.3, 0, -0.8);
      else hasan.group.position.set(1.1, 0, -1.8);
      kakek.group.visible = (s5 || s7 || s9 || s10 || s11 || s12 || s13 || late);
      const wk = ramp(t, cut(5), walk5);
      if (s5) kakek.group.position.set(lerp(6.0, S1.x - 0.75, wk), 0, lerp(-2.0, S1.z + 0.7, wk));
      else if (s7 || s9) kakek.group.position.set(0.75, 0, -0.8);
      else if (s10) kakek.group.position.set(1.7, 0, -1.9);
      else if (s11) kakek.group.position.set(S2.x + 2.4, 0, S2.z + 0.2);
      else if (s12) kakek.group.position.set(0.2, 0, -1.6);
      else if (s13) kakek.group.position.set(-3.7, 0, -1.5);
      else kakek.group.position.set(0.6, 0, -0.6);
      kakek.setSit(s5 && t > E('berjongkok') + 0.05 ? 2 : 0);
    });
  }

  // =====================================================================================================
  // ---------- akar: underground cutaway — infected roots touching healthy ones (shots 6, 11, 15) ----------
  {
    const g = addLoc('akar');
    // soil block with a painted cut face (front face at z = 0), grass on top
    const c = canvas(1024, 384), x = c.getContext('2d'); const r = rng(13);
    const bands = ['#6a4a32', '#7a5636', '#5e422e', '#6e4e34', '#4e3626'];
    bands.forEach((b, i) => { x.fillStyle = b; x.fillRect(0, i * 384 / bands.length, 1024, 384 / bands.length + 2); });
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '200,170,130' : '40,25,18'},${0.25 + r() * 0.3})`; x.beginPath(); x.ellipse(r() * 1024, r() * 384, 3 + r() * 8, 2 + r() * 6, r() * 3, 0, 7); x.fill(); }
    const soilMat = toon(texFrom(c));
    const block = new THREE.Mesh(new THREE.BoxGeometry(9, 3, 2), [soilMat, soilMat, toon('#7fa35a'), soilMat, soilMat, soilMat]); block.position.set(0, -1.5, -1); block.receiveShadow = true; g.add(block);
    const edge = box(9.02, 0.06, 0.06, '#5f8f3a', {center: true, hull: 0.01}); edge.position.set(0, -0.01, 0.0); g.add(edge);
    const bg = ground(80, 80, '#8fae62'); bg.position.set(0, 0, -21); g.add(bg);
    g.add(P.hills('#7a9a5a'));
    const PX = [-1.25, 1.25];
    const pls = PX.map((px, i) => { const p = P.oilPalm({seed: 70 + i, h: 1.8, len: 2.4, fruit: false}); at(p.group, px, 0, -0.42); g.add(p.group); return p; });
    // rot inside the left trunk (grows on "menggerogoti")
    const rc = canvas(256, 512), rx = rc.getContext('2d'); rx.fillStyle = 'rgba(0,0,0,0)'; rx.clearRect(0, 0, 256, 512);
    rx.fillStyle = '#4a2418'; rx.beginPath(); rx.moveTo(40, 512); for (let i = 0; i <= 10; i++) rx.lineTo(40 + i * 17.6, 60 + Math.sin(i * 1.7) * 50 + (i % 2) * 30); rx.lineTo(216, 512); rx.closePath(); rx.fill();
    rx.strokeStyle = '#351f22'; rx.lineWidth = 8; rx.stroke();
    const rot = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.3), new THREE.MeshBasicMaterial({map: texFrom(rc), transparent: true, depthWrite: false}));
    rot.geometry.translate(0, 0.65, 0); rot.position.set(PX[0], 0.0, -0.05); g.add(rot);
    // roots drawn just in front of the cut face
    const healthy = new THREE.Color('#efe2bc'), sick = new THREE.Color('#8a2a1a');
    const roots = [];
    PX.forEach((px, pi) => {
      const dirMain = pi === 0 ? 1 : -1;
      for (let i = 0; i < 13; i++) {
        const toward = i < 8, d = toward ? dirMain : -dirMain;
        const a = 0.25 + (i % 8) / 8 * 1.1, len = toward ? 1.4 + (i % 3) * 0.25 : 0.9 + (i % 3) * 0.2;
        const pts = []; let xx = px + d * 0.12, yy = -0.05;
        for (let k = 0; k < 7; k++) { pts.push(new THREE.Vector3(xx, yy, 0.03)); xx += d * Math.cos(a) * len / 6 + (r() - 0.5) * 0.06; yy -= Math.sin(a) * len / 6 * 0.9 + (r() - 0.5) * 0.04; }
        const mat = new THREE.MeshBasicMaterial({color: '#efe2bc'});
        const curve = new THREE.CatmullRomCurve3(pts), rad = 0.026 - (i % 3) * 0.004;
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, rad, 6), mat); g.add(tube);
        const inkT = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, rad + 0.012, 6), new THREE.MeshBasicMaterial({color: '#351f22', side: THREE.BackSide})); g.add(inkT);
        roots.push({mat, pi, i, toward, endX: xx});
      }
    });
    // the isolation trench (shot 11): a dark slot dropping in between the palms, cutting the crossing roots
    const slot = box(0.38, 1.6, 0.1, toon('#2a1a12', {wear: false}), {center: true, hull: 0.01}); slot.position.set(0.15, -0.8, 0.06); g.add(slot);
    const tagParit = tag(L.parit, 0.8, 0.2, {bg: '#f2d24a', stick: 0}); at(tagParit, 0.15, 0.25, 0.1); g.add(tagParit);
    fx(g, FX.glints([0, -0.9, 0.1], E('bersentuhan') - 0.1, {n: 26, spread: 0.6, color: '#ff8a6a'}), (t) => inShots(t, 6));
    fx(g, FX.sparks([0.15, -0.4, 0.15], E('memutus') + 0.05, {n: 30, color: '#c9a06a', size: 0.05, speed: 1.2}), (t) => inShots(t, 11));
    updaters.push((t) => {
      const s6 = inShots(t, 6), s11 = inShots(t, 11), s15 = inShots(t, 15);
      roots.forEach((q) => {
        let inf = 0;
        if (q.pi === 0) inf = s6 ? ramp(t, E('akar') + q.i * 0.1, E('akar') + q.i * 0.1 + 0.5) : 1;
        else if (s6) inf = ramp(t, E('bersentuhan') + (q.toward ? 0 : 0.4) + q.i * 0.06, E('bersentuhan') + 0.6 + q.i * 0.06);
        q.mat.color.copy(healthy).lerp(sick, inf);
        if (s15 && q.pi === 0) q.mat.color.offsetHSL(0, 0, 0.08 * Math.sin(t * 8));
      });
      rot.scale.set(1, s6 ? Math.max(0.0001, ramp(t, E('menggerogoti') - 0.1, E('menular'))) : 1, 1);
      const su = s11 ? ramp(t, E('memutus') - 0.35, E('memutus') + 0.15) : 0;
      slot.visible = su > 0.01; slot.position.y = lerp(0.9, -0.8, su);
      tagParit.visible = s11; tagParit.scale.setScalar(pop(t, E('memutus') + 0.1, 0.35));
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); for (const u of post) u(t); }};
}
