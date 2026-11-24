// All locations in one scene at different x offsets. Story: "Gaji lima juta di lima tempat".
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {lineup: 0, jakarta: 40, bali: 80, jogja: 120, town: 160, desa: 200};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look. Design: 'brisk' (new for this video; round no-sleep face, side-swept hair, thick brows, sturdy limbs,
// torso +0.12 m, legs +0.03 m). Five people, one per place, each with their own colours.
export const CHAR_DESIGN = 'brisk';
const CAST = {
  p1: {jacket: '#9aa8b8', lower: '#2f3a4a', tie: '#4f7fa6', hair: '#2b2326', hat: 'none', pocket: '#8494a6'},
  p2: {jacket: '#f0a07a', lower: '#f3e7d3', tie: '#5ab8b0', hair: '#4a3026', hairStyle: 'bun', hat: 'none', pocket: '#e08a6a'},
  p3: {jacket: '#9a6a3a', lower: '#3a2a26', tie: '#e8c35a', hair: '#2b2326', hat: 'none', pocket: '#7a5230'},
  p4: {jacket: '#4f9a8a', lower: '#3a4a52', tie: '#e8c35a', hair: '#3a2a26', hat: 'none', glasses: true, pocket: '#3f8474'},
  p5: {jacket: '#7fa35a', lower: '#6b4a3a', tie: '#d8413a', hair: '#3a2a26', hat: 'caping', hatColor: '#d9b45a', pocket: '#6a8a4a'},
  driver: {jacket: '#3fa05a', lower: '#2a3a2a', tie: '#f3e7d3', hair: '#2b2326', hat: 'cap', hatColor: '#3fa05a', hatColor2: '#2a7a42', pocket: '#2f8a4a'},
  friend: {jacket: '#5a7a9a', lower: '#2a2a32', tie: '#d9774a', hair: '#3a2a26', hat: 'none', pocket: '#4a6a8a'},
  seller: {jacket: '#c9b48a', lower: '#5a4a3a', tie: '#8a3a3a', hair: '#d8d4cc', hairStyle: 'bald', hat: 'none', pocket: '#b09a72'},
  nb1: {jacket: '#c75b8a', lower: '#5a3a4a', tie: '#f2d24a', hair: '#2b2326', hairStyle: 'bun', hat: 'none', pocket: '#a84a72'},
  nb2: {jacket: '#e0b84f', lower: '#55606e', tie: '#4f7fa6', hair: '#2b2326', hat: 'cap', hatColor: '#3a3a40', hatColor2: '#2a2a30', pocket: '#c9a03a'},
};

// Lighting plan (camera_plan.md): a bright square for the line-up, hazy Jakarta day turning grey on "thin", a dim
// boarding room, a Bali sunset, warm night at the angkringan, a sunny small town, a fresh village morning.
const haze = {...LOOK_PRESETS.day, fog: '#d8d0c4', near: 12, far: 45, skyTop: '#a8b8c8', skyBottom: '#e8e0d0'};
const kosDim = {...LOOK_PRESETS.interiorCool, keyI: 1.7, hemiI: 1.0, grade: {sat: 0.85, contrast: 1.04, tint: '#b8c0d8', tintAmt: 0.08, vignette: 0.5}};
const jogjaNight = {...LOOK_PRESETS.night, keyI: 1.3, hemiI: 0.85, keyPos: [-6, 10, 6], grade: {sat: 0.95, contrast: 1.06, tint: '#ffb070', tintAmt: 0.06, vignette: 0.45}};
const shackDay = {...LOOK_PRESETS.dusk, keyI: 1.8, hemiI: 1.05};

export const LOOK = {
  lineup: {keys: [{at: 0, ...LOOK_PRESETS.day}, {at: 'beda', ...LOOK_PRESETS.day, ...MOODS.joyful}, {at: 'cut11', ...LOOK_PRESETS.day}, {at: 'cut12', ...LOOK_PRESETS.day, ...MOODS.joyful}]},
  jakarta: {keys: [{at: 0, ...haze}, {at: 'kurus', ...haze, ...MOODS.sad}, {at: 'cut3', ...kosDim}, {at: 'sabar', ...kosDim, ...MOODS.sad}]},
  bali: {keys: [{at: 0, ...LOOK_PRESETS.sunset}, {at: 'mewah', ...LOOK_PRESETS.sunset, ...MOODS.joyful}, {at: 'balik', ...LOOK_PRESETS.sunset, ...MOODS.nostalgic}, {at: 'cut5', ...shackDay}]},
  jogja: {keys: [{at: 0, ...jogjaNight}]},
  town: {keys: [{at: 0, ...LOOK_PRESETS.goldenHour}, {at: 'bos', ...LOOK_PRESETS.goldenHour, ...MOODS.joyful}]},
  desa: {keys: [{at: 0, ...LOOK_PRESETS.day}, {at: 'sultan', ...LOOK_PRESETS.day, ...MOODS.joyful}, {at: 'masalah', ...LOOK_PRESETS.day}]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
const under = (g, color) => { const gr = ground(40, 40, color); gr.position.y = -0.05; g.add(gr); };

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.juta, dur: 0.35, color: '#ffe9b0', strength: 0.3},
      {t: EVt.beda, dur: 0.35, color: '#fff4d6', strength: 0.35},
      {t: EVt.mewah, dur: 0.35, color: '#ffe0c0', strength: 0.35},
      {t: EVt.bos, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.sultan, dur: 0.4, color: '#ffe9a0', strength: 0.4},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.tgl20, dur: 0.25, amp: 0.012}, {t: EVt.masalah, dur: 0.25, amp: 0.012}],
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
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar('hero', {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const speak = (c, si, exprs = [], from = -1) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).map(([a, b]) => [Math.max(a, from), b]).filter(([a, b]) => b - a > 0.05);
    c.act([...segs.map(([a, b]) => ({t: a, action: 'talk', dur: b - a})),
      ...exprs.map(([f, e, p]) => ({t: at0(f), expr: e, ...(p ? {pose: p} : {})}))]);
  };
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const walkPath = (c, keys) => {
    const rest = c.state.yaw0;
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, x0, z0] = keys[i], [b, x1, z1] = keys[i + 1];
      if (b - a > 0.05 && Math.hypot(x1 - x0, z1 - z0) > 0.2) c.act([{t: a, action: 'walk', dur: b - a}]);
    }
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
  // a sign that pops in at t0 (and optionally out at t1), bobbing gently
  const popSign = (g, s, x, y, z, t0, t1 = 1e9, vis = () => true) => { at(s, x, y, z); g.add(s); updaters.push((t) => { s.visible = vis(t) && t > t0 && t < t1; s.scale.setScalar(pop(t, t0, 0.35)); s.position.y = y + Math.sin(t * 2.4 + x) * 0.02; }); return s; };

  // ---------- the line-up: five people, the same salary (shots 1, 11, 12) ----------
  {
    const g = addLoc('lineup');
    g.add(ground(70, 60, '#c9c0b0', {}));
    [[-6.2, '#e8c99a', '#b5543c'], [-2.4, '#9ac4c0', '#5a6a7a'], [1.4, '#e6a88a', '#7a4a3a'], [5.2, '#d8d0e8', '#5a5a7a']].forEach(([x, col, roof], i) => {
      const h = P.house(3.6, 3.2, 3, {color: col, roof, seed: 20 + i, windows: 2, doorX: i % 2 ? 0.9 : -0.9}); at(h, x, 0, -6.5); g.add(h);
    });
    const ban = P.banner(L.salary, 3.4, 0.75, {poleH: 3.6, bg: '#7fb35a', fg: '#fff3df', frame: '#3f5a2a'}); at(ban, 0, 0, -3.6); g.add(ban);
    const sub = sign(L.salarySub, 1.6, 0.36, {bg: '#fff3df', frame: '#3f5a2a'}); at(sub, 0, 2.55, -3.55); g.add(sub);
    const xs = [-1.9, -0.95, 0, 0.95, 1.9];
    const people = ['p1', 'p2', 'p3', 'p4', 'p5'].map((n, i) => ch(n, {seed: 3 + i}, g, xs[i], -2.2, (2 - i) * -0.08));
    const cities = [L.jakarta, L.bali, L.jogja, L.town, L.desa].map((c, i) => sign(c, 0.8, 0.24, {bg: ['#9aa8b8', '#f0a07a', '#c9935a', '#4f9a8a', '#7fa35a'][i], fg: '#fff3df', frame: '#351f22', depth: 0.03}));
    cities.forEach((s, i) => popSign(g, s, xs[i], 2.42, -2.25, E('tempat') - 0.1 + i * 0.12, 1e9, (t) => t < cut(2) || t > cut(11)));
    // savings at the end of the month: stacks of notes at their feet (none, none, a little, more, a lot)
    const stacks = [0, 0, 3, 6, 12].map((n, i) => { const s = n ? P.noteStack(n, {value: '100', color: '#e0626e', dark: '#8a2a36', w: 0.34}) : null; if (s) { s.scale.setScalar(1.6); at(s, xs[i], 0, -1.7); g.add(s); } return s; });
    const zero = [0, 1].map((i) => { const z = P.glyph('0', 0.32, '#d8413a'); g.add(z); return z; });
    const biaya = sign(L.biaya, 1.3, 0.36, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'});
    const gaya = sign(L.gaya, 1.3, 0.36, {bg: '#4f7fa6', fg: '#fff3df', frame: '#24488a'});
    popSign(g, biaya, -0.8, 3.25, -2.6, E('biaya') - 0.1, cut(12), (t) => inShots(t, 11));
    popSign(g, gaya, 0.8, 3.25, -2.6, E('gaya') - 0.1, cut(12), (t) => inShots(t, 11));
    const q = sign(L.question, 1.5, 0.42, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'});
    const cm = sign(L.comment, 1.3, 0.42, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'});
    popSign(g, q, 0, 3.15, -2.6, E('kotamana') - 0.2, 1e9, (t) => inShots(t, 12));
    popSign(g, cm, 0, 3.7, -2.65, E('komentar') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.glints([0, 3.0, -3.5], E('juta'), {n: 26}), (t) => inShots(t, 1));
    fx(g, FX.confetti([0, 3.4, -2.6], E('komentar') + 0.05), (t) => inShots(t, 12));
    const firstE = ['cry', 'smug', 'happy', 'proud', 'cheesy'], endE = ['cry', 'nervous', 'happy', 'proud', 'toothy'];
    people.forEach((c, i) => c.act([
      {t: 0, pose: 'idle', expr: 'neutral'},
      {t: E('gaji') + 0.1 + i * 0.08, pose: i % 2 ? 'present' : 'presentBoth', expr: 'happy'},
      {t: E('tempat') + i * 0.12, pose: 'pointUp', expr: 'thinking'},
      {t: E('beda') + 0.1 + i * 0.06, pose: ['headHold', 'hips', 'shrug', 'hips', 'cheer'][i], expr: firstE[i]},
      {t: cut(11), pose: 'idle', expr: 'neutral'},
      {t: E('gajibesar') - 0.2 + i * 0.05, pose: ['shrug', 'shrug', 'present', 'present', 'presentBoth'][i], expr: endE[i]},
      {t: E('gaya') + 0.1, pose: ['headHold', 'facepalm', 'think', 'hips', 'cheer'][i], expr: endE[i]},
      {t: cut(12), pose: 'think', expr: 'thinking'},
      {t: E('komentar') - 0.05 + i * 0.05, pose: i % 2 ? 'wave' : 'point', expr: 'cheesy'},
    ]));
    updaters.push((t) => {
      const s11 = inShots(t, 11, 12);
      stacks.forEach((s, i) => { if (!s) return; s.visible = s11 && t > E('biaya') - 0.2 + i * 0.1; s.scale.set(1.6, 1.6 * smooth((t - E('biaya') + 0.2 - i * 0.1) / 0.6), 1.6); });
      zero.forEach((z, i) => { z.visible = s11 && t > E('biaya'); z.position.set(xs[i], 0.35 + Math.sin(t * 3 + i) * 0.03, -1.6); z.scale.setScalar(0.32 * pop(t, E('biaya') + i * 0.1, 0.3)); });
      ban.visible = sub.visible = !s11 || t < E('biaya') - 0.1;
    });
  }

  // ---------- Jakarta: expenses fly out of the wallet (shot 2); instant noodles in the boarding room (shot 3) ----------
  {
    const g = addLoc('jakarta');
    g.add(ground(70, 60, '#9a968e'));
    const road = box(70, 0.02, 10, toon('#55555c', {paint: {seed: 6, stains: 30}}), {edges: false}); at(road, 0, -0.01, 6.5); g.add(road);
    [[-6, 3.4, 15, '#6a8aa8'], [-2.2, 3.0, 19, '#8a9ab0'], [1.8, 3.6, 13, '#5a7a96'], [5.6, 3.2, 17, '#7a8aa0'], [-9.6, 3, 11, '#9aa8b8']].forEach(([x, w, h, col], i) => {
      const tw = P.tower(w, h, 3, {color: col, seed: 30 + i}); at(tw, x, 0, -8.5); g.add(tw);
    });
    const lamp = P.streetLamp(); at(lamp, -2.6, 0, -2.6, Math.PI); g.add(lamp);
    const p1 = ch('p1', {seed: 3}, g, -0.2, -2.0, 0.1);
    const sc = P.scooter('#3fa05a'); at(sc, 1.9, 0, -2.6, -0.3); g.add(sc);
    const drv = ch('driver', {seed: 40}, g, 2.3, -3.1, -0.2);
    const wal = P.wallet('#6a4a3a'); held(p1, wal.group, {hand: 0, y: 0.03, z: 0.12}); wal.open(1);
    const cup = P.fancyCup(); held(p1, cup, {y: 0.0, z: 0.08});
    // expense tags pop above the wallet and float away
    const tags = [['kos', L.kos], ['ojol', L.ojol], ['makan', L.makan], ['kopi', L.kopi]].map(([k, txt], i) => {
      const s = sign('-' + txt, 0.95, 0.26, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', depth: 0.03}); g.add(s); return {s, t0: E(k) - 0.05, i};
    });
    const cal15 = sign(L.tgl15, 0.8, 0.5, {bg: '#fff3df', fg: '#d8413a', frame: '#8a2a36'});
    const cal20 = sign(L.tgl20, 0.8, 0.5, {bg: '#fff3df', fg: '#d8413a', frame: '#8a2a36'});
    popSign(g, cal15, -1.3, 2.3, -2.4, E('tgl15') - 0.1, E('tgl20') - 0.05, (t) => inShots(t, 2));
    popSign(g, cal20, -1.3, 2.3, -2.4, E('tgl20') - 0.05, 1e9, (t) => inShots(t, 2));
    p1.act([
      {t: 0, pose: 'idle', expr: 'neutral'},
      {t: E('kos') - 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('ojol') + 0.05, pose: 'idle', expr: 'worried'},
      {t: E('kopi') + 0.05, pose: 'drink', expr: 'tired'},
      {t: E('lembur') + 0.1, pose: 'idle', expr: 'drowsy'},
      {t: E('tgl15') + 0.1, pose: 'idle', expr: 'worried'},
      {t: E('kurus') + 0.05, pose: 'idle', expr: 'grimace'},
      {t: E('tgl20') + 0.05, pose: 'headHold', expr: 'shocked'},
    ]);
    drv.act([{t: 0, pose: 'wave', expr: 'cheesy'}, {t: E('ojol') + 0.05, pose: 'give', expr: 'toothy'}, {t: E('makan'), pose: 'idle', expr: 'happy'}]);
    fx(g, FX.smoke([-0.2, 2.2, -1.9], E('lembur') + 0.2, {n: 5, life: 1.4, size: 0.3, color: '#a8a8b8', opacity: 0.6}), (t) => inShots(t, 2));
    updaters.push((t) => {
      const s2 = inShots(t, 2);
      p1.group.visible = s2;
      wal.group.scale.set(1, 1, 1 - 0.85 * smooth((t - E('kurus') + 0.1) / 0.4));
      wal.group.scale.y = 1 - 0.45 * smooth((t - E('kurus') + 0.1) / 0.4);
      cup.visible = t > E('kopi') - 0.1;
      const hp = new THREE.Vector3(); p1.hand(0).getWorldPosition(hp); g.worldToLocal(hp);
      tags.forEach(({s, t0, i}) => {
        const u = (t - t0) / 1.6; s.visible = s2 && u > 0 && u < 1;
        s.position.set(0.45 + (i % 2 ? 0.35 : 0) + 0.1 * Math.min(1, u * 2), hp.y + 0.3 + u * 1.1, hp.z + 0.1);
        s.scale.setScalar(pop(t, t0, 0.25) * (u > 0.8 ? (1 - u) * 5 : 1));
      });
    });
    // the boarding room (kos) behind: shot 3
    const K = new THREE.Group(); K.position.x = 12; g.add(K);
    K.add(P.room(4.2, 2.8, 4.5, {wall: '#c8ccbe', floor: '#8a7a6a', wain: '#7a8a7a'}));
    const mat = box(1.0, 0.18, 1.9, '#d8d0c0'); at(mat, -1.4, 0, -2.4); K.add(mat);
    const pil = ball(0.2, '#f3efe6', {sx: 1.6, sy: 0.4}); at(pil, -1.4, 0.24, -3.1); K.add(pil);
    const tbl = box(0.6, 0.5, 0.45, toon('#8a6a4a', {paint: {planks: 2, seed: 44}})); at(tbl, 0.85, 0, -2.6); K.add(tbl);
    for (let i = 0; i < 3; i++) { const pk = box(0.16, 0.22, 0.04, ['#e8c35a', '#d8413a', '#e8c35a'][i], {hull: 0.004}); at(pk, 0.7 + i * 0.12, 0.5, -2.7, 0.2 * i); K.add(pk); }
    const wcal = sign(L.tgl20, 0.6, 0.4, {bg: '#fff3df', fg: '#d8413a', frame: '#8a2a36'}); at(wcal, 0.9, 1.9, -3.45); K.add(wcal);
    const bulb = ball(0.07, new THREE.MeshBasicMaterial({color: '#fff3c0'}), {hull: 0}); at(bulb, 0, 2.45, -2.2); K.add(bulb);
    const cord = cyl(0.006, 0.006, 0.3, '#2b2b33'); at(cord, 0, 2.5, -2.2); K.add(cord);
    const kp1 = ch('p1', {seed: 3}, K, -0.05, -2.3, 0);
    const bowl = P.noodleBowl(); held(kp1, bowl, {y: 0.05, z: 0.1});
    speak(kp1, 8, [[0, 'tired', 'eat'], [0.4, 'sad', 'hold'], [0.75, 'cry', 'hold']]);
    fx(K, FX.smoke([-0.05, 1.35, -2.0], cut(3), {n: 6, life: 1.6, size: 0.18, rise: 0.5, color: '#fbf6ea', opacity: 0.6}), (t) => inShots(t, 3));
  }

  // ---------- Bali: sunset selfie (shot 4); behind the camera, nasi bungkus (shot 5) ----------
  {
    const g = addLoc('bali');
    g.add(ground(70, 60, '#e8d4a0', {}));
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), toon('#4f9ac0', {wear: false})); sea.rotation.x = -Math.PI / 2; at(sea, 0, 0.02, -36); sea.rotation.x = -Math.PI / 2; g.add(sea);
    const foam = box(120, 0.02, 0.3, '#f3efe6', {edges: false, hull: 0}); at(foam, 0, 0.02, -6.2); g.add(foam);
    const sun = P.sunBall ? P.sunBall(3, '#ffb070') : null; if (sun) { at(sun, -4, 4.5, -40); g.add(sun); }
    [[-3.4, -3.6, 4.5, 0.5], [3.2, -4.2, 5.2, -0.6], [-5.6, -5, 5.6, 0.7]].forEach(([x, z, h, ln], i) => { const pt = P.coconutPalm({h, lean: ln, seed: 50 + i}); at(pt.group, x, 0, z); g.add(pt.group); });
    const p2 = ch('p2', {seed: 4}, g, 0, -2.0, 0);
    const ph = P.phone(); ph.scale.setScalar(2.2); held(p2, ph, {y: 0.08, z: 0.1});
    const like = sign(L.like, 1.1, 0.32, {bg: '#fff3df', fg: '#d8413a', frame: '#d8413a', depth: 0.03});
    popSign(g, like, 0.85, 2.4, -2.0, E('insta') + 0.2, 1e9, (t) => inShots(t, 4));
    const hearts = [0, 1, 2, 3].map(() => { const h = P.heart(); g.add(h); return h; });
    fx(g, FX.glints([0, 2.0, -1.9], E('mewah'), {n: 24}), (t) => inShots(t, 4));
    p2.act([
      {t: 0, pose: 'idle', expr: 'happy'},
      {t: E('insta') - 0.05, pose: 'carry', expr: 'cheesy'},
      {t: E('sunset') + 0.1, pose: 'carry', expr: 'smug'},
      {t: E('mewah') + 0.05, pose: 'carry', expr: 'proud'},
      {t: E('balik') + 0.1, pose: 'idle', expr: 'tired'},
    ]);
    // the shack behind the camera (shot 5)
    const S = new THREE.Group(); S.position.x = 9; g.add(S);
    const hut = P.villageHouse({color: '#9a8a7a', roof: '#6a5a4a'}); at(hut, 0.2, 0, -2.6); S.add(hut);
    const crate = P.crate ? P.crate(0.6, 0.45, 0.5, null, '#a8784a') : box(0.6, 0.45, 0.5, '#a8784a'); at(crate, 0.85, 0, -1.9); S.add(crate);
    const nb2 = P.nasiBungkus(); at(nb2, 0.85, 0.47, -1.85); S.add(nb2);
    const sp2 = ch('p2', {seed: 4}, S, -0.15, -1.9, 0.1);
    const nb = P.nasiBungkus(); held(sp2, nb, {y: 0.02, z: 0.1});
    const ph2 = P.phone(); ph2.scale.setScalar(2.2); held(sp2, ph2, {hand: 0, y: 0.06, z: 0.1});
    speak(sp2, 13, [[0, 'tired', 'eat'], [0.5, 'nervous', 'hold'], [0.8, 'cheesy', 'hold']]);
    updaters.push((t) => {
      const hp = new THREE.Vector3(); p2.hand(1).getWorldPosition(hp); g.worldToLocal(hp);
      hearts.forEach((h, i) => { const t0 = E('insta') + 0.3 + i * 0.3, u = ((t - t0) % 1.6) / 1.6; h.visible = inShots(t, 4) && t > t0 && t < E('balik'); h.position.set(hp.x + 0.3 + i * 0.12, hp.y + 0.2 + u * 0.9, hp.z); h.scale.setScalar(0.12 * Math.sin(Math.PI * u)); });
    });
  }

  // ---------- Jogja: the angkringan at night (shots 6, 7) ----------
  {
    const g = addLoc('jogja');
    g.add(ground(70, 60, '#7a7068'));
    [[-4.4, '#d8c0a0', '#7a4a3a'], [-0.6, '#b8c8b0', '#5a4a3a'], [3.2, '#e0c8a0', '#6a3a2a']].forEach(([x, col, roof], i) => {
      const h = P.house(3.4, 3.0, 3, {color: col, roof, seed: 70 + i, windows: 2, doorX: i % 2 ? 0.8 : -0.8, shutter: '#5a6a4a'}); at(h, x, 0, -6.2); g.add(h);
    });
    const ang = P.angkringan(L.angkringan); at(ang.group, 0, 0, -2.7); g.add(ang.group);
    ang.lamps.forEach(([x, y, z]) => { const f = FX.flame([x, y, z - 2.7], {size: 0.12}); g.add(f.obj); updaters.push((t) => f.update(t)); });
    const fl = FX.fireLight([0, 1.9, -1.8], {intensity: 1.8, dist: 7}); g.add(fl.obj); updaters.push((t) => fl.update(t));
    const lamp = P.streetLamp(); at(lamp, 3.4, 0, -2.4, Math.PI); g.add(lamp);
    const seller = ch('seller', {seed: 41}, g, 0.2, -3.4, 0);
    const p3 = ch('p3', {seed: 5}, g, -0.75, -1.25, 0.15);
    const fr = ch('friend', {seed: 42}, g, 0.8, -1.25, -0.15);
    const g1 = P.mug('#f3efe6'); held(p3, g1, {y: 0.0, z: 0.08}); const g2 = P.mug('#f3efe6'); held(fr, g2, {hand: 0, y: 0.0, z: 0.08});
    const coins = P.coinPile(5, 6); g.add(coins);
    const nab = sign(L.nabung, 0.9, 0.26, {bg: '#7fb35a', fg: '#fff3df', frame: '#3f5a2a', depth: 0.03});
    popSign(g, nab, -1.55, 1.15, -1.5, E('nabung') - 0.1, 1e9, (t) => inShots(t, 6));
    p3.act([
      {t: 0, pose: 'idle', expr: 'happy'},
      {t: E('angkringan') + 0.1, pose: 'eat', expr: 'happy'},
      {t: E('ngopi') + 0.1, pose: 'drink', expr: 'proud'},
      {t: E('malam') + 0.1, pose: 'idle', expr: 'laugh'},
      {t: E('nabung') + 0.1, pose: 'present', expr: 'cheesy'},
    ]);
    speak(p3, 16, [[0, 'smug', 'present'], [0.5, 'scheming', 'idle'], [0.75, 'toothy', 'shrug']]);
    fr.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('ngopi') + 0.2, pose: 'drink', expr: 'happy'}, {t: E('malam') + 0.15, pose: 'idle', expr: 'toothy'},
      {t: cut(7), pose: 'idle', expr: 'neutral'}, {t: E('mantan') + 0.2, pose: 'facepalm', expr: 'laugh'}]);
    seller.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('angkringan') + 0.2, pose: 'presentBoth', expr: 'cheesy'}, {t: E('malam'), pose: 'idle', expr: 'happy'}]);
    updaters.push((t) => {
      coins.visible = t > E('nabung') - 0.1; coins.scale.setScalar(pop(t, E('nabung') - 0.1, 0.35)); coins.position.set(-1.55, 0.42, -1.55);
    });
  }

  // ---------- the small town: "Bos!" (shot 8) ----------
  {
    const g = addLoc('town');
    g.add(ground(70, 60, '#b0a690'));
    const road = box(70, 0.02, 3, toon('#6a6670', {paint: {seed: 8, stains: 30}}), {edges: false}); at(road, 0, -0.01, -0.3); g.add(road);
    [[-4.4, '#f0d0a0', '#b5543c'], [-0.6, '#a8c8d8', '#7a4a3a'], [3.2, '#e8b8b8', '#5a6a7a']].forEach(([x, col, roof], i) => {
      const h = P.house(3.4, 3.0, 3, {color: col, roof, seed: 80 + i, windows: 2, doorX: i % 2 ? 0.8 : -0.8}); at(h, x, 0, -5.2); g.add(h);
    });
    const tr = P.tree({}); at(tr, -3.0, 0, -3.4); g.add(tr);
    const fence = box(9, 0.6, 0.06, toon('#f3efe6', {paint: {planks: 20, seed: 81}})); at(fence, 0, 0, -3.3); g.add(fence);
    const p4 = ch('p4', {seed: 6}, g, -2.8, -1.8, 0);
    walkPath(p4, [[cut(8), -2.8, -1.8], [E('kota') + 1.3, -0.2, -1.8]]);
    const nb1 = ch('nb1', {seed: 43}, g, 0.95, -2.3, -0.2);
    const nb2 = ch('nb2', {seed: 44}, g, 1.9, -2.5, -0.3);
    const bos = sign(L.bos, 0.9, 0.38, {bg: '#e8c04a', fg: '#351f22', frame: '#8a6a2a'});
    popSign(g, bos, -0.2, 2.45, -1.8, E('bos') - 0.05, 1e9, (t) => inShots(t, 8));
    fx(g, FX.glints([-0.2, 2.0, -1.7], E('bos'), {n: 20}), (t) => inShots(t, 8));
    p4.act([
      {t: 0, pose: 'idle', expr: 'happy'},
      {t: E('dipanggil') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('bos') + 0.1, pose: 'hips', expr: 'proud'},
      {t: E('traktir') + 0.2, pose: 'shrug', expr: 'nervous'},
    ]);
    nb1.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('dipanggil'), pose: 'wave', expr: 'cheesy'}, {t: E('bos') + 0.1, pose: 'beg', expr: 'toothy'}]);
    nb2.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('dipanggil') + 0.1, pose: 'wave', expr: 'happy'}, {t: E('bos') + 0.2, pose: 'presentBoth', expr: 'cheesy'}]);
    speak(nb2, 19, [[0, 'scheming', 'point'], [0.5, 'cheesy', 'wave']]);
  }

  // ---------- the village: garden, savings, sultan, no signal (shot 9); up the coconut palm (shot 10) ----------
  {
    const g = addLoc('desa');
    g.add(ground(70, 60, '#8ab062', {}));
    g.add(P.hills('#7aa05a'));
    const vh = P.villageHouse({}); at(vh, -2.6, 0, -3.6); g.add(vh);
    const rows = P.gardenRows(3, 3.2, 11); at(rows, 0.2, 0, -4.4); g.add(rows);
    const palm = P.coconutPalm({h: 6.2, lean: 0.7, seed: 61, open: true}); at(palm.group, 2.4, 0, -2.9); g.add(palm.group);
    const p5 = ch('p5', {seed: 7}, g, -0.2, -2.0, 0);
    const basket = P.basket ? P.basket('#b8925a', 0) : null; if (basket) { at(basket, 0.55, 0, -1.8); g.add(basket); }
    const veg = ball(0.1, '#6fae4a', {hull: 0.008}); held(p5, veg, {y: 0.0, z: 0.08});
    const stool = box(0.5, 0.5, 0.5, toon('#8a6a4a', {paint: {planks: 2, seed: 91}})); at(stool, -1.35, 0, -1.9); g.add(stool);
    const save = P.noteStack(12, {value: '100', color: '#e0626e', dark: '#8a2a36', w: 0.34}); save.scale.setScalar(1.3); at(save, -1.35, 0.5, -1.9); g.add(save);
    const tab = sign(L.nabung, 0.9, 0.26, {bg: '#7fb35a', fg: '#fff3df', frame: '#3f5a2a', depth: 0.03});
    popSign(g, tab, -1.35, 1.45, -1.9, E('tabungan') - 0.1, 1e9, (t) => inShots(t, 9));
    const sul = sign(L.sultan, 1.0, 0.34, {bg: '#e8c04a', fg: '#351f22', frame: '#8a6a2a'});
    popSign(g, sul, -0.2, 2.62, -2.0, E('sultan') - 0.05, E('masalah') - 0.1, (t) => inShots(t, 9));
    const nos = sign(L.signal, 1.4, 0.32, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'});
    popSign(g, nos, -0.2, 2.62, -2.0, E('masalah') + 0.05, 1e9, (t) => inShots(t, 9));
    const ph = P.phone(); ph.scale.setScalar(2.2); held(p5, ph, {hand: 0, y: 0.06, z: 0.1});
    fx(g, FX.glints([-0.2, 2.3, -1.9], E('sultan'), {n: 26}), (t) => inShots(t, 9));
    p5.act([
      {t: 0, pose: 'idle', expr: 'happy'},
      {t: E('kebun') + 0.05, pose: 'present', expr: 'cheesy'},
      {t: E('biayakos') + 0.1, pose: 'shrug', expr: 'smug'},
      {t: E('tabungan') + 0.1, pose: 'presentBoth', expr: 'toothy'},
      {t: E('sultan') + 0.05, pose: 'cheer', expr: 'proud'},
      {t: E('masalah') - 0.1, pose: 'idle', expr: 'worried'},
    ]);
    // up in the palm tree with the phone held high (shot 10)
    const [tx, ty] = palm.top;
    const hx = 2.4 + tx * (3.7 / 6.2) ** 2, up = ch('p5', {seed: 7}, g, hx, -2.55, 0.2, 3.7);
    const ph2 = P.phone(); ph2.scale.setScalar(2.2); held(up, ph2, {y: 0.06, z: 0.1});
    speak(up, 24, [[0, 'worried', 'carry'], [0.3, 'scream', 'carry'], [0.6, 'cheesy', 'carry']]);
    const sig = sign('SINYAL', 0.8, 0.26, {bg: '#7fb35a', fg: '#fff3df', frame: '#3f5a2a', depth: 0.03});
    popSign(g, sig, hx + 0.7, 6.2, -2.45, E('halo') + 1.0, 1e9, (t) => inShots(t, 10));
    updaters.push((t) => {
      const s9 = inShots(t, 9);
      p5.group.visible = s9; up.group.visible = inShots(t, 10);
      save.visible = s9 && t > E('tabungan') - 0.2; save.scale.set(1.3, 1.3 * smooth((t - E('tabungan') + 0.2) / 1.2), 1.3);
      veg.visible = t < E('masalah') - 0.1; ph.visible = t > E('masalah') - 0.15;
    });
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
    for (const u of post) u(t);
  }};
}
