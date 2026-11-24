// All locations in one scene at different x offsets. Story: "Knocker-upper / si pembangun orang".
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {street: 0, factory: 40, bedroom: 80, london: 120, shop: 160, modern: 200};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look for this story (palette overrides on top of char.js PALETTES). Design: 'stout' (new for this video;
// round no-sleep face, tuft hair, thick brows, sturdier limbs, a longer torso, short legs). Victorian flat caps,
// bowler hats and nightcaps.
export const CHAR_DESIGN = 'stout';
const CAST = {
  knocker: {jacket: '#6a5a8a', lower: '#3a3442', tie: '#e8c35a', hair: '#3a2a26', hat: 'cap', hatColor: '#5a4a3a', hatColor2: '#46382c', pocket: '#574a72'},
  custA: {jacket: '#e8e0d0', lower: '#7fa6c9', tie: '#7fa6c9', hair: '#5a3a2a', hat: 'nightcap', hatColor: '#7fa6c9', hatColor2: '#f3ece0', hairStyle: 'tuft', pocket: '#d8d0c0'},
  custB: {jacket: '#f0dcc8', lower: '#c75b5b', tie: '#c75b5b', hair: '#2b2326', hat: 'nightcap', hatColor: '#c75b5b', hatColor2: '#f3ece0', pocket: '#e0c8b0'},
  custC: {jacket: '#e6e8d8', lower: '#7fa35a', tie: '#7fa35a', hair: '#8a5a3a', hat: 'nightcap', hatColor: '#7fa35a', hatColor2: '#f3ece0', glasses: true, pocket: '#d0d4c0'},
  mary: {jacket: '#5a7a6a', lower: '#3a4a42', tie: '#e8dcc0', hair: '#4a3026', hat: 'none', hairStyle: 'bun', pocket: '#4a6a5a'},
  worker: {jacket: '#8a6a4a', lower: '#4a4a52', tie: '#c75b5b', hair: '#3a2a26', hat: 'cap', hatColor: '#4a5a6a', hatColor2: '#3a4a5a', pocket: '#7a5a3a'},
  seller: {jacket: '#3a3a48', lower: '#2a2a32', tie: '#d8413a', hair: '#2b2326', hat: 'bowler', hatColor: '#2f2a30', glasses: true, pocket: '#2a2a36'},
  modern: {jacket: '#7fa6c9', lower: '#5a7aa0', tie: '#f3ece0', hair: '#2b2326', hat: 'none', hairStyle: 'fringe', pocket: '#6a90b8'},
};
// palettes for the walking mill workers and the clock buyers
const CROWD = [
  {jacket: '#7a6a5a', lower: '#3a3a42', tie: '#d8b43a', hair: '#2b2326', hat: 'cap', hatColor: '#5a5a62'},
  {jacket: '#5a7a8a', lower: '#3d4a52', tie: '#d9774a', hair: '#6a3a2a', hat: 'cap', hatColor: '#6a4a3a'},
  {jacket: '#9a5a4a', lower: '#3a3a4a', tie: '#e8c35a', hair: '#3a2a26', hat: 'bowler', hatColor: '#3a3036'},
  {jacket: '#6a8a5a', lower: '#4a4a3a', tie: '#c75b5b', hair: '#2b2326', hat: 'cap', hatColor: '#4a4a52'},
  {jacket: '#c99a4a', lower: '#5a4a3a', tie: '#4f7fa6', hair: '#5a3a2a', hat: 'cap', hatColor: '#7a5a3a'},
].map((p) => ({pocket: p.jacket, ...p}));

// Lighting plan (camera_plan.md): a blue pre-dawn street with the moon (shots 1, 3, 4, 6), a pink-orange dawn at the
// smoking mill, a dark bedroom lit by a candle, a London street before sunrise, the knocker's night walk turning
// into sunrise (shot 10), a daylit clock shop going sad, a cool modern bedroom turning bright for the question.
const predawn = {...LOOK_PRESETS.night, fog: '#2a3050', skyTop: '#16203a', skyBottom: '#5a5a80', keyI: 1.9, hemiI: 1.05, near: 12, far: 50, keyPos: [-6, 12, 6]};
const deepNight = {...LOOK_PRESETS.night, keyI: 1.5, hemiI: 0.85, keyPos: [-6, 12, 6]};
const sunrise = {...LOOK_PRESETS.dawn, keyPos: [9, 4, 6], moon: false};
const bedNight = {...LOOK_PRESETS.candle, key: '#ffd0a0', keyI: 1.5, hemiI: 0.9, hemiSky: '#8a90b0', grade: {sat: 0.9, contrast: 1.06, tint: '#ffc890', tintAmt: 0.06, vignette: 0.5}};
const london = {...LOOK_PRESETS.dusk, skyTop: '#3a4270', keyPos: [-8, 5, 6]};

export const LOOK = {
  street: {keys: [{at: 0, ...predawn}, {at: 'nyata', ...predawn, ...MOODS.joyful}, {at: 'cut3', ...predawn},
    {at: 'jangan', ...predawn, ...MOODS.tense}, {at: 'yakin', ...predawn},
    {at: 'cut10', ...deepNight}, {at: 'belum', ...deepNight}, {at: 'semua', ...sunrise, ...MOODS.joyful}]},
  factory: {keys: [{at: 0, ...LOOK_PRESETS.dawn, keyPos: [8, 5, 6]}, {at: 'mahal', ...LOOK_PRESETS.dawn, keyPos: [8, 5, 6], ...MOODS.tense}]},
  bedroom: {keys: [{at: 0, ...bedNight}, {at: 'iya', ...bedNight, keyI: 1.9}, {at: 'cut9', ...bedNight},
    {at: 'siapa', ...bedNight, ...MOODS.mystery}]},
  london: {keys: [{at: 0, ...london}, {at: 'tik3', ...london, ...MOODS.joyful}, {at: 'minggu', ...london, ...MOODS.sad}]},
  shop: {keys: [{at: 0, ...LOOK_PRESETS.day}, {at: 'hilang', ...LOOK_PRESETS.overcast, ...MOODS.sad}, {at: 'murah', ...LOOK_PRESETS.overcast, ...MOODS.nostalgic}]},
  modern: {keys: [{at: 0, ...LOOK_PRESETS.interiorCool}, {at: 'langsung', ...LOOK_PRESETS.interiorWarm, ...MOODS.joyful}]},
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
      {t: EVt.nyata, dur: 0.35, color: '#ffe9a0', strength: 0.4},
      {t: EVt.knocker, dur: 0.35, color: '#ffe9b0', strength: 0.4},
      {t: EVt.iya, dur: 0.3, color: '#ffd0a0', strength: 0.3},
      {t: EVt.tik3, dur: 0.3, color: '#d8ffb0', strength: 0.3},
      {t: EVt.semua, dur: 0.5, color: '#ffd9a0', strength: 0.4},
      {t: EVt.murah, dur: 0.3, color: '#fff4d6', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.nyata, dur: 0.25, amp: 0.02}, {t: EVt.mahal, dur: 0.3, amp: 0.02}, {t: EVt.iya, dur: 0.35, amp: 0.03},
      {t: EVt.pergi, dur: 0.3, amp: 0.015}, {t: EVt.tunggu, dur: 0.3, amp: 0.015}, {t: EVt.lima, dur: 0.3, amp: 0.02}],
  };
}

// taps: a 0..1 pulse 0.16 s long at each time in the list
const pulse = (t, times, d = 0.16) => { let v = 0; for (const ti of times) { const u = (t - ti) / d; if (u > 0 && u < 1) v = Math.max(v, Math.sin(Math.PI * u)); } return v; };
const every = (a, b, step) => { const o = []; for (let t = a; t < b; t += step) o.push(t); return o; };

export function buildWorld(lang, T, EVt, L) {
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const post = []; // run after characters have moved (things attached to hands in world space)
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar('hero', {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  // Dialogue: the speaker's mouth moves only while the voice is audible (voiced segments from the audio) and the
  // face changes through the line: exprs = [[fraction of the sentence, expression, pose?], ...].
  const speak = (c, si, exprs = [], from = -1) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).map(([a, b]) => [Math.max(a, from), b]).filter(([a, b]) => b - a > 0.05);
    c.act([...segs.map(([a, b]) => ({t: a, action: 'talk', dur: b - a})),
      ...exprs.map(([f, e, p]) => ({t: at0(f), expr: e, ...(p ? {pose: p} : {})}))]);
  };
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  // Walk a character along [[t, x, z], ...] (location-local). Moving segments play the walk (or run) cycle and turn
  // the body toward the walking direction; a segment shorter than 0.05 s is a jump cut (teleport, no walk).
  const walkPath = (c, keys, o = {}) => {
    const rest = c.state.yaw0;
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, x0, z0] = keys[i], [b, x1, z1] = keys[i + 1];
      if (b - a > 0.05 && Math.hypot(x1 - x0, z1 - z0) > 0.2) c.act([{t: a, action: o.run ? 'run' : 'walk', dur: b - a}]);
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
  // A long pole (or a short tube) held in a hand, aimed in world space every frame. aim(t) returns
  // {target: [x, y, z] location-local, w: 0..1 blend from 'carried upright' to 'aimed', len}.
  const V = new THREE.Vector3(), V2 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  const rod = (g, c, aim, o = {}) => {
    const r = o.r || 0.022;
    const m = cyl(r, r * 1.15, 1, o.color || '#7a5236', {hull: 0.012}); m.traverse((k) => { k.castShadow = false; }); g.add(m);
    const tip = ball(r * 1.8, o.tip || '#4a4048', {hull: 0.008}); g.add(tip);
    const out = {tip: new THREE.Vector3()};
    post.push((t) => {
      const a = aim(t);
      m.visible = tip.visible = !!a && c.group.visible;
      if (!m.visible) return;
      c.hand(o.hand ?? 1).getWorldPosition(V); g.worldToLocal(V);
      const len = a.len || 3.0;
      const carry = V2.set(V.x + (o.lean ?? 1.1), V.y + len, V.z + 0.3).sub(V).normalize();
      const aimD = new THREE.Vector3(...a.target).sub(V); const dist = aimD.length(); aimD.normalize();
      const d = carry.clone().lerp(aimD, a.w).normalize();
      const L2 = a.w > 0.5 && a.reach ? dist : len;
      m.position.copy(V); m.quaternion.setFromUnitVectors(UP, d); m.scale.set(1, L2, 1);
      out.tip.copy(V).addScaledVector(d, L2); tip.position.copy(out.tip);
    });
    return out;
  };
  // A sleepy customer who pops up in an upper window (location-local window centre [x, y], wall front at zWall).
  const windowCust = (g, name, wx, wy, zWall, seed) => {
    const c = ch(name, {seed}, g, wx, zWall - 0.3, 0, wy - 1.72);
    return c;
  };
  const zzz = (g, x, y, z, vis) => {
    const zs = [0, 1, 2].map((i) => { const s = P.glyph('Z', 0.32 - i * 0.06, '#fff3df'); g.add(s); return s; });
    updaters.push((t) => zs.forEach((s, i) => {
      const u = ((t * 0.55 + i / 3) % 1);
      s.visible = vis(t); s.position.set(x + u * 0.35 + Math.sin(u * 6 + i) * 0.05, y + u * 0.7, z); s.material.opacity = Math.sin(Math.PI * u); s.material.transparent = true;
    }));
  };
  const lightUp = (plane, t0, t) => { plane.material.color.set(t > t0 ? '#ffcf7a' : '#2a2436'); };
  const terraceRow = (g, xs, colors, seed0) => xs.map((x, i) => { const h = P.terrace(3.2, {color: colors[i % colors.length], seed: seed0 + i, roof: '#4a4252'}); at(h.group, x, 0, -4.0); g.add(h.group); return {...h, x}; });

  // ---------- street: the knocker-upper's rounds (shots 1, 3, 4, 6, 10) ----------
  {
    const g = addLoc('street');
    g.add(ground(70, 60, '#7a7480', {cobbles: true}));
    const walk = box(30, 0.08, 1.0, toon('#9a94a0', {paint: {bricks: true, seed: 4}}), {edges: false}); at(walk, 0, 0, -3.5); g.add(walk);
    const row = terraceRow(g, [-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6], ['#b5654a', '#9a5a4a', '#c27a5a', '#a86a54'], 10);
    const win = (hi, side) => { const h = row[hi]; return [h.x + h.upper[side][0], h.upper[side][1]]; };
    for (const x of [-7.4, 7.2]) { const lamp = P.streetLamp(); at(lamp, x, 0, -3.25, x < 0 ? Math.PI : 0); g.add(lamp); }
    const WA = win(2, 0), W4 = win(3, 1), WB = win(4, 0); // shot 1 / 4 / 6 windows
    const custA = windowCust(g, 'custA', WA[0], WA[1], -4.0, 11);
    const custB = windowCust(g, 'custB', WB[0], WB[1], -4.0, 12);
    const cust4 = windowCust(g, 'custC', W4[0], W4[1], -4.0, 13);
    const hero = ch('knocker', {seed: 1}, g, -3.4, -2.6, 0.15);
    const k4 = E('ketuk') - 0.1;
    walkPath(hero, [[0, -3.4, -2.6], [cut(3) - 0.01, -3.4, -2.6], [cut(3), 3.9, -2.3], [cut(3) + 2.4, 1.0, -2.6], [cut(4) - 0.01, 1.0, -2.6],
      [cut(4), -6.5, -2.3], [E('tongkat'), -2.2, -2.45], [k4, 0.2, -2.6], [cut(6) - 0.01, 0.2, -2.6], [cut(6), 2.95, -2.6], [cut(10) - 0.01, 2.95, -2.6],
      [cut(10), -6.8, -2.4], [E('belum') + 0.2, -1.6, -2.5], [E('pulang') - 0.1, -1.6, -2.5], [cut(11), 3.4, -3.0]]);
    // the pole: tapping (aimed at a window) or carried upright
    const tapsA = every(0.3, E('bangunkan') + 0.4, 0.42), taps4 = every(k4 + 0.35, cut(5), 0.42);
    const taps6 = [...every(cut(6) + 0.2, E('jangan') - 0.1, 0.42), ...every(E('pergi') - 0.1, E('yakin') + 0.2, 0.26)];
    const seg = (t) => (t < cut(3) ? {w: WA, taps: tapsA, a: -1, b: E('nyata') + 0.2} : t < cut(4) ? null : t < cut(6) ? {w: W4, taps: taps4, a: k4 + 0.05, b: 1e9}
      : t < cut(10) ? {w: WB, taps: taps6, a: cut(6) + 0.05, b: E('jangan') + 0.25, a2: E('pergi') - 0.3, b2: E('yakin') + 0.4} : null);
    rod(g, hero, (t) => {
      const s = seg(t); if (!s) return {target: [0, 0, 0], w: 0};
      const on = (a, b) => (a === undefined ? 0 : Math.min(smooth((t - a) / 0.3), 1 - smooth((t - b) / 0.3)));
      const w = Math.max(on(s.a, s.b), on(s.a2, s.b2));
      const p = pulse(t, s.taps);
      return {target: [s.w[0] + 0.33, s.w[1] - 0.42, -4.0 + 0.35 - 0.38 * p], w, reach: true};
    });
    hero.act([
      {t: 0, pose: 'pointUp', expr: 'determined'},
      {t: E('dibayar') + 0.1, pose: 'pointUp', expr: 'scheming'},
      {t: E('nyata') + 0.05, pose: 'present', expr: 'cheesy', action: 'hop', dur: 0.5},
      {t: cut(3), pose: 'hold', expr: 'happy'},
      {t: E('knocker') + 0.1, pose: 'hips', expr: 'proud', action: 'jump', dur: 0.6},
      {t: cut(4), pose: 'hold', expr: 'drowsy'},
      {t: E('tongkat') + 0.1, pose: 'hold', expr: 'smug', action: 'nod', dur: 0.6},
      {t: k4, pose: 'pointUp', expr: 'determined'},
      {t: E('pelanggan') + 0.1, pose: 'pointUp', expr: 'happy'},
      {t: cut(6), pose: 'pointUp', expr: 'neutral'},
      {t: E('jangan') + 0.2, pose: 'hips', expr: 'smug'},
      {t: E('pura') + 0.15, pose: 'cross', expr: 'annoyed', action: 'shake', dur: 0.6},
      {t: E('pergi') - 0.3, pose: 'pointUp', expr: 'gritted'},
      {t: E('yakin') + 0.4, pose: 'hips', expr: 'proud', action: 'nod', dur: 0.6},
      {t: cut(10), pose: 'hold', expr: 'drowsy'},
      {t: E('malam') + 0.1, pose: 'hold', expr: 'tired', action: 'slump', dur: 0.8},
      {t: E('belum') + 0.3, pose: 'armsUp', expr: 'drowsy'},
      {t: E('semua') - 0.2, pose: 'cheer', expr: 'happy', action: 'hop', dur: 0.5},
      {t: E('semua') + 0.6, pose: 'hold', expr: 'sleep'},
    ]);
    // customers popping up at the windows
    custA.act([{t: 0, pose: 'idle', expr: 'sleep'}, {t: E('bangunkan') + 0.1, pose: 'stop', expr: 'irritated', action: 'shake', dur: 0.6}, {t: E('nyata') + 0.2, pose: 'facepalm', expr: 'tired'}]);
    cust4.act([{t: 0, pose: 'idle', expr: 'drowsy'}, {t: E('pelanggan') + 0.2, pose: 'wave', expr: 'tired'}]);
    custB.act([{t: 0, pose: 'idle', expr: 'drowsy'}, {t: E('jangan') - 0.2, pose: 'wave', expr: 'nervous'}, {t: E('pura') + 0.05, pose: 'wave', expr: 'scheming'},
      {t: E('yakin') - 0.1, pose: 'armsUp', expr: 'grimace', action: 'tremble', dur: 0.5}, {t: E('bangun2') + 0.05, pose: 'stop', expr: 'irritated'}]);
    const rise = (c, wy, t0, t1 = 1e9, t2 = 1e9, t3 = 1e9) => updaters.push((t) => {
      const up = Math.min(smooth((t - t0) / 0.35), 1 - smooth((t - t1) / 0.35)) + Math.min(smooth((t - t2) / 0.3), 1 - smooth((t - t3) / 0.3));
      c.group.position.y = wy - 1.72 - 1.0 * (1 - Math.min(1, up));
    });
    rise(custA, WA[1], E('bangunkan') - 0.2, cut(3) - 0.2);
    rise(cust4, W4[1], E('pelanggan') - 0.1);
    rise(custB, WB[1], E('jangan') - 0.35, E('pura') + 0.35, E('yakin') - 0.25);
    // lit windows: customers waking up (shot 4), all the customers up at sunrise (shot 10)
    const litWins = row.flatMap((h) => h.lit);
    const coin = P.coin(0.13); g.add(coin);
    const stamp = sign(L.true, 2.4, 0.62, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'}); at(stamp, -1.4, 2.5, -2.9, -0.12, 0, 0.08); g.add(stamp);
    const ban = P.banner(L.title, 3.0, 0.75, {poleH: 3.7, bg: '#e8a83a', fg: '#351f22', frame: '#8a5a2a'}); at(ban, -0.6, 0, -3.35); g.add(ban);
    const sub = sign(L.titleSub, 2.6, 0.38, {bg: '#fff3df', frame: '#8a5a2a'}); at(sub, -0.6, 2.6, -3.3); g.add(sub);
    zzz(g, WA[0] + 0.2, WA[1] + 0.3, -3.9, (t) => t < E('bangunkan') && inShots(t, 1));
    fx(g, FX.glints([-2.6, 2.4, -2.4], E('dibayar'), {n: 16}), (t) => inShots(t, 1));
    fx(g, FX.confetti([0.2, 3.6, -3.0], E('knocker') + 0.05), (t) => inShots(t, 3));
    fx(g, FX.glints([0, 4.0, -3.6], E('semua'), {n: 30}), (t) => inShots(t, 10));
    updaters.push((t) => {
      const s1 = inShots(t, 1), s3 = inShots(t, 3), s4 = inShots(t, 4), s6 = inShots(t, 6), s10 = inShots(t, 10);
      hero.group.visible = s1 || s3 || s4 || s6 || s10;
      custA.group.visible = s1; cust4.group.visible = s4; custB.group.visible = s6;
      coin.visible = s1 && t > E('dibayar') - 0.1; coin.scale.setScalar(pop(t, E('dibayar') - 0.1, 0.35)); coin.position.set(-2.55, 2.35 + Math.sin(t * 3) * 0.05, -2.4); coin.rotation.set(Math.PI / 2, 0, t * 4);
      stamp.visible = s1 && t > E('nyata') - 0.05; stamp.scale.setScalar(t < E('nyata') + 0.15 ? 1.6 - 0.6 * smooth((t - E('nyata') + 0.05) / 0.2) : 1);
      ban.visible = sub.visible = s3; ban.scale.setScalar(pop(t, E('knocker') - 0.1, 0.4)); sub.scale.setScalar(pop(t, E('knocker') + 0.5, 0.35));
      litWins.forEach((p, i) => {
        const t4 = E('pelanggan') - 0.1 + (i % 5) * 0.12, t10 = E('belum') + 0.4 + ((i * 7) % 14) / 14 * (E('semua') - E('belum') - 0.2);
        const on = (s4 && (i % 3 === 0) && t > t4) || (s4 && p === row[3].lit[1] && t > E('pelanggan') - 0.1) || (s1 && p === row[2].lit[0] && t > E('bangunkan') - 0.2)
          || (s6 && p === row[4].lit[0] && t > E('jangan') - 0.35) || (s10 && t > t10);
        p.material.color.set(on ? '#ffcf7a' : '#2a2436');
      });
    });
  }

  // ---------- the mill at dawn: workers walk in; alarm clocks are expensive (shot 2) ----------
  {
    const g = addLoc('factory');
    g.add(ground(70, 60, '#8a7a6a', {cobbles: true}));
    g.add(P.hills('#7a8a6a'));
    const f = P.factory(10, 4.4); at(f.group, 0, 0, -7.5); g.add(f.group);
    const ms = sign(L.mill, 3.2, 0.6, {bg: '#e8dcc0', frame: '#5a3a2a'}); at(ms, 0, 4.0, -7.35); g.add(ms);
    f.tops.forEach(([x, y, z], i) => fx(g, FX.smoke([x, y, z - 7.5], 0, {every: 0.3, color: '#6a6070', size: 1.0}), (t) => inShots(t, 2)));
    const lamp = P.streetLamp(); at(lamp, 3.8, 0, -4.2, Math.PI); g.add(lamp);
    // a shop display with the one alarm clock nobody can afford
    const ped = box(0.7, 1.0, 0.6, toon('#7a5236', {paint: {planks: 3, seed: 18}})); at(ped, -2.6, 0, -3.4); g.add(ped);
    const ac = P.alarmClock(0.2); at(ac.group, -2.6, 1.0, -3.3); g.add(ac.group);
    const tag = sign(L.price, 1.1, 0.42, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'}); at(tag, -2.2, 1.85, -3.1, -0.2, 0, -0.12); g.add(tag);
    const rare = sign(L.rare, 0.9, 0.34, {bg: '#f2d24a', frame: '#8a6a2a'}); at(rare, -3.2, 2.25, -3.2, 0.15, 0, 0.1); g.add(rare);
    const w0 = ch('worker', {seed: 21}, g, -1.4, -2.7, -0.25);
    const crew = [[5.5, -1.6, 0.9, -5.6], [6.4, -2.6, 0.2, -5.9], [-6.0, -2.0, -0.6, -5.7]].map(([x0, z0, x1, z1], i) => {
      const c = ch('hero', {...CROWD[i], seed: 22 + i}, g, x0, z0, 0);
      walkPath(c, [[cut(2) + 0.1 * i, x0, z0], [E('masalah') + 0.5, x1, z1]]);
      c.act([{t: 0, pose: 'limp', expr: ['drowsy', 'tired', 'sleep'][i]}, {t: E('subuh') + 0.1 * i, pose: 'armsUp', expr: 'drowsy'}, {t: E('subuh') + 0.9, pose: 'limp', expr: 'tired'}]);
      return c;
    });
    walkPath(w0, [[cut(2), 4.0, -1.6], [E('subuh') + 0.2, -1.4, -2.7]]);
    w0.act([
      {t: 0, pose: 'limp', expr: 'drowsy'},
      {t: E('subuh') + 0.1, pose: 'armsUp', expr: 'drowsy', action: 'slump', dur: 0.8},
      {t: E('masalah') + 0.1, pose: 'point', expr: 'surprised'},
      {t: E('mahal') + 0.1, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('langka') + 0.1, pose: 'shrug', expr: 'cry'},
    ]);
    fx(g, FX.glints([-2.6, 1.5, -3.2], E('masalah'), {n: 18}), (t) => inShots(t, 2));
    updaters.push((t) => {
      tag.visible = t > E('mahal') - 0.1; tag.scale.setScalar(pop(t, E('mahal') - 0.1, 0.35));
      rare.visible = t > E('langka') - 0.1; rare.scale.setScalar(pop(t, E('langka') - 0.1, 0.35));
      ac.ring(t, t > E('masalah') && t < E('masalah') + 1.2 ? 1 : 0);
      crew.forEach((c) => { c.group.visible = t < E('masalah') + 0.5; });
    });
  }

  // ---------- bedrooms: A = the customer woken by the pole (shot 5); B = the knocker asleep (shot 9) ----------
  {
    const g = addLoc('bedroom');
    under(g, '#2a2228');
    const room = (ox, o) => {
      const r = P.room(6, 3.2, 6, o); at(r, ox, 0, 0); g.add(r);
      const W = new THREE.Group(); at(W, ox + 1.3, 1.45, -4.88); g.add(W);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.0), new THREE.MeshBasicMaterial({color: '#283250'})); pane.position.set(0, 0.5, -0.015); W.add(pane);
      for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.012, 6), new THREE.MeshBasicMaterial({color: '#fff6dc'})); s.position.set(-0.4 + ((i * 37) % 80) / 100, 0.1 + ((i * 53) % 85) / 100, -0.01); W.add(s); }
      for (const [x, y, w, h] of [[0, -0.02, 1.1, 0.08], [0, 1.0, 1.1, 0.08], [-0.5, 0.5, 0.07, 1.08], [0.5, 0.5, 0.07, 1.08], [0, 0.5, 0.05, 1.0], [0, 0.5, 1.0, 0.05]]) {
        const b = box(w, h, 0.06, '#e8dcc0', {center: true}); at(b, x, y, 0.02); W.add(b);
      }
      const sill = box(1.25, 0.06, 0.2, '#e8dcc0'); at(sill, 0, -0.08, 0.08); W.add(sill);
      const bed = P.bed({color: o.bedColor, sheet: o.sheet}); at(bed, ox - 0.6, 0, -3.3); g.add(bed);
      const nt = box(0.5, 0.6, 0.45, toon('#7a5236', {paint: {planks: 2, seed: 33}})); at(nt, ox + 0.45, 0, -4.1); g.add(nt);
      const cd = new THREE.Group(); at(cd, ox + 0.45, 0.6, -4.1); g.add(cd);
      cd.add(cyl(0.05, 0.05, 0.18, '#f3ece0', {hull: 0.008})); const fl = FX.flame([0, 0.22, 0], {size: 0.12}); cd.add(fl.obj); updaters.push((t) => fl.update(t));
      const fl2 = FX.fireLight([ox + 0.45, 1.2, -3.8], {intensity: 1.2, dist: 5}); g.add(fl2.obj); updaters.push((t) => fl2.update(t));
      return {W, pane};
    };
    const A = room(0, {wall: '#c9b8a0', floor: '#7a5a42', wain: '#6a4a3a', sheet: '#7fa6c9'});
    const B = room(12, {wall: '#b8a8b8', floor: '#6a4a3a', wain: '#5a4a5a', sheet: '#a86a5a', bedColor: '#5a4a3a'});
    // the pole tip tapping on room A's window from outside
    const tipA = cyl(0.018, 0.02, 0.75, '#7a5236', {hull: 0.008}); A.W.add(tipA);
    const tokT = [E('tok1'), E('tok2'), E('tok3')];
    const sl = ch('custA', {seed: 31}, g, -0.6, -3.95, 0);
    sl.act([
      {t: 0, pose: 'limp', expr: 'sleep'},
      {t: E('tok1') + 0.05, pose: 'limp', expr: 'sleep', action: 'tremble', dur: 0.3},
      {t: E('tok3') + 0.05, pose: 'headHold', expr: 'tired'},
    ]);
    speak(sl, 7, [[0, 'furious', 'stop'], [0.35, 'irritated', 'armsUp'], [0.65, 'gritted', 'stop'], [0.9, 'tired', 'facepalm']]);
    sl.act([{t: E('iya'), action: 'jump', dur: 0.45}]);
    zzz(g, -0.4, 2.0, -3.9, (t) => t < E('iya') - 0.1 && inShots(t, 5));
    // room B: the knocker himself asleep, his pole against the wall and his cap on a hook
    const kn = ch('knocker', {seed: 32, hat: 'nightcap', hatColor: '#6a5a8a', hatColor2: '#e8dcc0'}, g, 11.4, -3.95, 0);
    const pole = cyl(0.025, 0.03, 3.0, '#7a5236', {hull: 0.01}); at(pole, 14.0, 0, -4.7, 0, 0, 0.12); g.add(pole);
    const hook = box(0.06, 0.06, 0.12, INK); at(hook, 13.3, 2.0, -4.85); g.add(hook);
    const cap = ball(0.2, '#5a4a3a', {sy: 0.45, hull: 0.012}); at(cap, 13.3, 1.88, -4.72); g.add(cap);
    kn.act([
      {t: 0, pose: 'limp', expr: 'sleep'},
      {t: E('siapa') + 0.05, pose: 'think', expr: 'confused', action: 'jump', dur: 0.4},
      {t: E('pembangun') + 0.1, pose: 'shrug', expr: 'worried'},
    ]);
    zzz(g, 11.6, 2.0, -3.9, (t) => t < E('siapa') && inShots(t, 9));
    const qs = [0, 1, 2].map((i) => { const q = P.glyph('?', 0.45 - i * 0.08, '#f2d24a'); g.add(q); return q; });
    updaters.push((t) => {
      const p = pulse(t, tokT, 0.2);
      tipA.position.set(0.42 - 0.15 * p, 0.02 + 0.12 * p, 0.012); tipA.rotation.set(0, 0, 0.75);
      tipA.visible = inShots(t, 5) && t > cut(5) && t < E('iya') + 0.6;
      // asleep: slumped to the side; awake: upright
      sl.group.rotation.z = 0.32 * (1 - smooth((t - E('iya') + 0.15) / 0.25)) + 0.06 * p;
      kn.group.rotation.z = -0.3 * (1 - smooth((t - E('siapa')) / 0.3));
      qs.forEach((q, i) => { const t0 = E('pembangun') + i * 0.18; q.visible = inShots(t, 9) && t > t0; q.scale.setScalar((0.45 - i * 0.08) * pop(t, t0, 0.35)); q.position.set(11.0 + i * 0.55, 2.45 + (i % 2) * 0.25 + Math.sin(t * 3 + i) * 0.04, -3.6); });
    });
  }

  // ---------- London: the woman with the pea shooter; the pay (shots 7, 8) ----------
  {
    const g = addLoc('london');
    g.add(ground(70, 60, '#6e6a74', {cobbles: true}));
    const walk = box(30, 0.08, 1.0, toon('#8e8a96', {paint: {bricks: true, seed: 5}}), {edges: false}); at(walk, 0, 0, -3.5); g.add(walk);
    const row = terraceRow(g, [-6.4, -3.2, 0, 3.2, 6.4], ['#c9b48a', '#8a9aa8', '#b8a07a', '#9a8a9a'], 40);
    const post0 = P.signpost([{text: L.london, angle: 0.2, dir: 1}]); at(post0, -3.4, 0, -3.25); g.add(post0);
    const lamp = P.streetLamp(); at(lamp, 3.9, 0, -3.25, Math.PI); g.add(lamp);
    const W = [row[2].x + row[2].upper[1][0], row[2].upper[1][1]];
    const mary = ch('mary', {seed: 41}, g, -0.45, -2.5, 0.2);
    const custC = windowCust(g, 'custC', W[0], W[1], -4.0, 42);
    const payer = ch('custC', {seed: 43}, g, 0.85, -3.55, -0.3);
    walkPath(mary, [[cut(7), -2.6, -2.3], [cut(7) + 2.6, -0.45, -2.5], [cut(8) - 0.01, -0.45, -2.5], [cut(8), -0.15, -2.75]]);
    const shotT = [E('kacang') + 0.1, E('tik1') - 0.3, E('tik2') - 0.3, E('tik3') - 0.3];
    const hitT = shotT.map((x) => x + 0.3);
    const tube = rod(g, mary, (t) => (inShots(t, 7) && t > E('sumpit') - 0.15 ? {target: [W[0], W[1], -4.0], w: 1, len: 0.42} : null), {r: 0.018, color: '#c9a462', tip: '#a8844a', hand: 1});
    const peas = shotT.map(() => { const p = ball(0.045, '#8ab84a', {hull: 0.008}); g.add(p); return p; });
    hitT.forEach((h) => fx(g, FX.sparks([W[0], W[1], -3.95], h, {n: 10, speed: 1.2, color: '#d8ffb0'}), (t) => inShots(t, 7)));
    mary.act([
      {t: 0, pose: 'idle', expr: 'neutral'},
      {t: E('kreatif') + 0.1, pose: 'hips', expr: 'scheming'},
      {t: E('sumpit') - 0.15, pose: 'chin', expr: 'smug'},
      {t: E('tik3') + 0.25, pose: 'hips', expr: 'proud', action: 'hop', dur: 0.5},
      {t: cut(8), pose: 'present', expr: 'happy'},
      {t: E('sen') + 0.1, pose: 'present', expr: 'surprised'},
      {t: E('minggu') + 0.1, pose: 'shrug', expr: 'tired', action: 'slump', dur: 0.8},
    ]);
    custC.act([{t: 0, pose: 'idle', expr: 'grimace'}, {t: E('tik3') + 0.3, pose: 'stop', expr: 'irritated', action: 'shake', dur: 0.5}]);
    payer.act([{t: 0, pose: 'give', expr: 'drowsy'}, {t: E('minggu') + 0.15, pose: 'hips', expr: 'smug'}]);
    const coins = [0, 1, 2].map(() => { const c = P.coin(0.07); g.add(c); return c; });
    const pay = sign(L.pay, 1.9, 0.5, {bg: '#f2d24a', frame: '#8a6a2a', sub: L.paySub}); at(pay, -0.35, 2.85, -3.3, 0.05); g.add(pay);
    fx(g, FX.glints([-0.1, 1.6, -2.6], E('sen'), {n: 14}), (t) => inShots(t, 8));
    updaters.push((t) => {
      const s7 = inShots(t, 7), s8 = inShots(t, 8);
      custC.group.visible = s7; payer.group.visible = s8;
      custC.group.position.y = W[1] - 1.72 - 1.0 * (1 - smooth((t - E('tik3') - 0.05) / 0.3));
      peas.forEach((p, i) => {
        const u = (t - shotT[i]) / 0.3; p.visible = s7 && u > 0 && u < 1;
        if (p.visible) p.position.copy(tube.tip).lerp(new THREE.Vector3(W[0], W[1], -3.95), u).add(new THREE.Vector3(0, Math.sin(Math.PI * u) * 0.25, 0));
      });
      coins.forEach((c, i) => { const t0 = E('sen') + i * 0.18; c.visible = s8 && t > t0; c.scale.setScalar(pop(t, t0, 0.3)); c.position.set(0.3 + (i - 1) * 0.14, 1.3 + i * 0.07 + Math.sin(t * 3 + i) * 0.03, -2.45); c.rotation.set(Math.PI / 2 - 0.3, 0, t * 3 + i); });
      pay.visible = s8 && t > E('minggu') - 0.35; pay.scale.setScalar(pop(t, E('minggu') - 0.35, 0.4));
    });
  }

  // ---------- clock shop: cheap alarm clocks end the job (shot 11) ----------
  {
    const g = addLoc('shop');
    g.add(ground(70, 60, '#8a8478', {cobbles: true}));
    const row = terraceRow(g, [-6.4, -3.2, 3.2, 6.4], ['#c27a5a', '#b8a07a', '#9a8a9a', '#a86a54'], 60);
    const st = P.stall(L.shop, {awning: '#4f8fc8', signBg: '#f3efe6', w: 2.6}); at(st, 0.4, 0, -4.0); g.add(st);
    const clocks = [];
    for (let i = 0; i < 7; i++) { const c = P.alarmClock(0.13, {color: ['#d8413a', '#4f8fc8', '#e8a83a', '#7fa35a'][i % 4]}); at(c.group, -0.6 + i * 0.33, 0.85, -3.85 + (i % 2) * 0.12, (i - 3) * 0.12); g.add(c.group); clocks.push(c); }
    const cheap = sign(L.cheap, 1.2, 0.48, {bg: '#7fa35a', fg: '#fff3df', frame: '#3f5a2a'}); at(cheap, 1.6, 1.55, -3.35, -0.15, 0, -0.1); g.add(cheap);
    const seller = ch('seller', {seed: 51}, g, 0.4, -4.7, 0);
    const buyers = [[1.75, -2.75, -0.3], [-1.0, -2.9, 0.25]].map(([x, z, y], i) => ch('hero', {...CROWD[3 + i], seed: 52 + i}, g, x, z, y));
    const bc = buyers.map((b) => { const c = P.alarmClock(0.11); held(b, c.group, {y: 0.0, z: 0.08}); return c; });
    const hero = ch('knocker', {seed: 55}, g, -2.4, -2.5, 0.35);
    walkPath(hero, [[0, -2.4, -2.5], [E('hilang') + 0.4, -2.4, -2.5], [cut(12) + 0.2, -5.2, -2.1]]);
    rod(g, hero, () => ({target: [0, 0, 0], w: 0}), {lean: 0.9});
    hero.act([
      {t: 0, pose: 'hold', expr: 'worried'},
      {t: E('hilang') + 0.05, pose: 'hold', expr: 'sad', action: 'slump', dur: 1.2},
      {t: E('murah') + 0.1, pose: 'hold', expr: 'cry'},
    ]);
    seller.act([{t: 0, pose: 'presentBoth', expr: 'cheesy'}, {t: E('murah') + 0.1, pose: 'armsUp', expr: 'excited', action: 'hop', dur: 0.5}]);
    buyers.forEach((b, i) => b.act([{t: 0, pose: 'carry', expr: 'happy'}, {t: E('murah') + 0.1 + i * 0.15, pose: 'carryBoth', expr: ['toothy', 'cheesy'][i], action: 'jump', dur: 0.5}]));
    fx(g, FX.glints([1.6, 1.6, -3.3], E('murah'), {n: 20}), (t) => inShots(t, 11));
    updaters.push((t) => {
      cheap.visible = t > E('murah') - 0.1; cheap.scale.setScalar(pop(t, E('murah') - 0.1, 0.4));
      clocks.forEach((c, i) => c.ring(t + i, t > cut(11) + 0.2 && t < E('hilang') ? 1 : 0));
      bc.forEach((c, i) => c.ring(t + i, t > E('murah') && t < E('murah') + 1 ? 1 : 0));
    });
  }

  // ---------- today: phone alarm, snooze five times, the question (shot 12) ----------
  {
    const g = addLoc('modern');
    under(g, '#2a2a30');
    g.add(P.room(6.5, 3.2, 6, {wall: '#cfe0e6', floor: '#b89a7a', wain: '#8fb0c0'}));
    const bed = P.bed({color: '#e8dcc8', sheet: '#e8a83a'}); at(bed, -0.6, 0, -3.3); g.add(bed);
    const nt = box(0.5, 0.55, 0.45, '#f3efe6'); at(nt, 0.45, 0, -4.1); g.add(nt);
    const lampM = cyl(0.12, 0.16, 0.25, '#f2d24a', {hull: 0.01}); at(lampM, 0.45, 0.55, -4.15); g.add(lampM);
    const poster = sign('Zzz', 0.9, 0.6, {bg: '#4f8fc8', fg: '#fff3df', frame: '#2a4a6a'}); at(poster, -2.0, 2.0, -4.85); g.add(poster);
    const hero = ch('modern', {seed: 61}, g, -0.6, -3.95, 0);
    walkPath(hero, [[0, -0.6, -3.95], [E('langsung') - 0.12, -0.6, -3.95], [E('langsung') - 0.1, 0.25, -2.6]]);
    const ph = P.phone(); ph.scale.setScalar(2.4); held(hero, ph, {y: 0.08, z: 0.1});
    const sz = sign(L.snooze, 0.17, 0.08, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a', depth: 0.01}); at(sz, 0, -0.01, 0.012); ph.add(sz);
    const pressT = [0, 1, 2, 3, 4].map((i) => E('snooze') + i * (E('lima') + 0.5 - E('snooze')) / 4);
    const counts = pressT.map((t0, i) => { const s = sign(`${L.snooze} x${i + 1}`, 1.15, 0.38, {bg: '#fff3df', fg: '#d8413a', frame: '#8a2a2a'}); at(s, 0.35, 2.3, -3.7, -0.1); g.add(s); return s; });
    hero.act([
      {t: 0, pose: 'limp', expr: 'sleep'},
      {t: E('alarm') + 0.05, pose: 'hold', expr: 'tired', action: 'tremble', dur: 0.4},
      ...pressT.map((t0, i) => ({t: t0, pose: 'hold', expr: ['drowsy', 'tired', 'drowsy', 'sleep', 'scheming'][i], action: 'nod', dur: 0.3})),
      {t: E('langsung') - 0.1, pose: 'shrug', expr: 'confused'},
      {t: E('tim') + 0.1, pose: 'chin', expr: 'scheming'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy', action: 'jump', dur: 0.6},
    ]);
    const riser = sign(L.riser, 1.2, 0.4, {bg: '#7fa35a', fg: '#fff3df', frame: '#3f5a2a'}); at(riser, -0.62, 2.55, -2.8, 0); g.add(riser);
    const team = sign(L.team, 1.2, 0.4, {bg: '#9a6fb0', fg: '#fff3df', frame: '#5a3a6a'}); at(team, 1.12, 2.55, -2.8, 0); g.add(team);
    const cmt = sign(L.comment, 1.5, 0.48, {bg: '#c75b5b', fg: '#fff3df', frame: '#8a3f2a'}); at(cmt, 0.25, 3.1, -2.8); g.add(cmt);
    fx(g, FX.confetti([0.25, 3.0, -2.8], E('komentar') + 0.05), (t) => inShots(t, 12));
    zzz(g, -0.4, 2.0, -3.9, (t) => t < E('alarm') && inShots(t, 12));
    updaters.push((t) => {
      const asleep = t < E('langsung') - 0.1;
      hero.group.rotation.z = asleep ? 0.3 * (1 - smooth((t - E('alarm')) / 0.3)) + 0.25 * smooth((t - pressT[3]) / 0.4) * (1 - smooth((t - pressT[4]) / 0.3)) : 0;
      ph.visible = asleep && t > E('alarm') - 0.2;
      let k = -1; pressT.forEach((t0, i) => { if (t > t0) k = i; });
      counts.forEach((s, i) => { s.visible = asleep && i === k; s.scale.setScalar(pop(t, pressT[i], 0.25)); });
      riser.visible = t > E('langsung') - 0.1; riser.scale.setScalar(pop(t, E('langsung') - 0.1, 0.4));
      team.visible = t > E('tim') - 0.1; team.scale.setScalar(pop(t, E('tim') - 0.1, 0.4));
      cmt.visible = t > E('komentar') - 0.1; cmt.scale.setScalar(pop(t, E('komentar') - 0.1, 0.4));
    });
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
    for (const u of post) u(t);
  }};
}
