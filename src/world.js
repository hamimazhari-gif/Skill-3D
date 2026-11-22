// All locations in one scene at different x offsets. Story: "Apa yang terjadi kalau kamu tidak tidur 7 hari?".
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, pop, smooth, clamp01, INK, canvas, texFrom, rng} from './kit';
import {makeChar} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {bedroom: 0, office: 40, road: 80, living: 120, retro: 160, field: 200};

export {LOOK_PRESETS, MOODS} from './lighting';

// Lighting plan (camera_plan.md): bedroom at 3 a.m. (dark blue night, warm bedside lamp) -> night again for the advice
// -> morning for the closing question; office by day (cool) turning to a drowsy dusk on day 2; night road turning to
// danger on "berbahaya"; living room at night with TV glow going purple on "Halusinasi!" and tense for days 5-7;
// 1964 room in warm nostalgic light; dreamy golden-hour stadium turning joyful on "terkenal".
const nightRoom = {...LOOK_PRESETS.night, fog: '#141a2a', near: 8, far: 30, keyI: 1.0, hemiI: 0.95, keyPos: [-3, 7, 6],
  hemiSky: '#8a9ad0', hemiGround: '#3a3550', grade: {sat: 0.92, contrast: 1.06, tint: '#8aa0e0', tintAmt: 0.1, vignette: 0.48}};
const morningRoom = {...LOOK_PRESETS.interiorWarm, keyPos: [-4, 7, 7], ...MOODS.joyful};
const officeDay = {...LOOK_PRESETS.interiorCool, keyPos: [-4, 8, 8]};
const officeDusk = {...LOOK_PRESETS.interiorWarm, key: '#ffb878', keyI: 1.9, hemiI: 1.1, keyPos: [-6, 4, 6],
  grade: {sat: 0.85, contrast: 1.04, tint: '#e8a070', tintAmt: 0.1, vignette: 0.5}};
const livingNight = {...nightRoom, grade: {sat: 0.95, contrast: 1.06, tint: '#9a8ae0', tintAmt: 0.1, vignette: 0.5}};
const roadNight = {...LOOK_PRESETS.night, keyI: 1.2, hemiI: 0.8, keyPos: [-6, 10, 4]};

export const LOOK = {
  bedroom: {keys: [{at: 0, ...nightRoom}, {at: 'tujuh', ...nightRoom}, {at: 'cut9', ...nightRoom}, {at: 'tidurlah', ...nightRoom, ...MOODS.nostalgic, grade: {...nightRoom.grade, tint: '#a8b8f0'}},
    {at: 'cut10', ...morningRoom}]},
  office: {keys: [{at: 0, ...officeDay}, {at: 'mabuk', ...officeDay, grade: {sat: 1.0, contrast: 1.02, tint: '#e0d0ff', tintAmt: 0.08, vignette: 0.42}},
    {at: 'cut3', ...officeDusk}, {at: 'micro', ...officeDusk, ...MOODS.tense}]},
  road: {keys: [{at: 0, ...roadNight}, {at: 'bahaya', ...roadNight}, {at: 'kendara', ...roadNight, ...MOODS.danger}]},
  living: {keys: [{at: 0, ...livingNight}, {at: 'kacau', ...livingNight}, {at: 'halu', ...livingNight, ...MOODS.mystery},
    {at: 'cut6', ...livingNight, ...MOODS.tense}, {at: 'curiga', ...livingNight, ...MOODS.mystery}]},
  retro: {...LOOK_PRESETS.interiorWarm, keyPos: [-4, 8, 8], ...MOODS.nostalgic},
  field: {keys: [{at: 0, ...LOOK_PRESETS.goldenHour, keyPos: [-8, 6, 6], ...MOODS.mystery}, {at: 'pemain', ...LOOK_PRESETS.goldenHour, keyPos: [-8, 6, 6]},
    {at: 'terkenal', ...LOOK_PRESETS.goldenHour, keyPos: [-8, 6, 6], ...MOODS.joyful}]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
// Ground under an indoor room sits below the room floor (no z-fighting).
const under = (g, color) => { const gr = ground(40, 40, color); gr.position.y = -0.05; g.add(gr); };

// A painted window on a back wall: returns the pane so its colour can change with the time of day.
function windowOn(g, x, y, z, color) {
  const win = new THREE.Group(); at(win, x, 0, z); g.add(win);
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), new THREE.MeshBasicMaterial({color})); pane.position.set(0, y, 0.02); win.add(pane);
  for (const s of [-1, 1]) { const f = box(0.08, 1.1, 0.12, '#f6ead6', {center: true}); at(f, s * 0.68, y, 0.05); win.add(f); }
  for (const yy of [y - 0.53, y + 0.53]) { const f = box(1.44, 0.08, 0.14, '#f6ead6', {center: true}); at(f, 0, yy, 0.06); win.add(f); }
  const mull = box(0.05, 1.0, 0.06, '#f6ead6', {center: true}); at(mull, 0, y, 0.05); win.add(mull);
  return pane;
}

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.kendara + 0.05, dur: 0.35, color: '#ff8a6a', strength: 0.5},
      {t: EVt.halu + 0.05, dur: 0.4, color: '#c8a8ff', strength: 0.55},
      {t: EVt.terkenal + 0.05, dur: 0.35, color: '#ffe9b0', strength: 0.45},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.lambat + 0.35, dur: 0.3, amp: 0.015}, {t: EVt.kendara + 0.05, dur: 0.55, amp: 0.04}, {t: EVt.halu + 0.05, dur: 0.45, amp: 0.03}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar(name, {yaw, ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, 0, 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  // Rising "Z z z" over a sleeper while vis(t) is true.
  const zzz = (g, base, vis) => {
    const zs = [0, 1, 2].map((i) => { const s = P.glyph('Z', 0.22 - i * 0.04, '#dfe8ff'); g.add(s); return s; });
    updaters.push((t) => zs.forEach((s, i) => {
      const u = ((t * 0.55 + i / 3) % 1); s.visible = vis(t);
      s.position.set(base[0] + 0.12 + u * 0.35 + Math.sin(u * 6 + i) * 0.04, base[1] + u * 0.6, base[2]);
      s.material.opacity = Math.sin(u * Math.PI);
    }));
  };
  // Paper calendar on a wall whose page changes: pages[i] = {text, from(t) -> bool}.
  const calendar = (g, x, y, z, texts, pick) => {
    const pages = texts.map((tx) => { const s = sign(tx, 0.82, 0.62, {bg: '#fbf6ea', fg: INK, frame: '#c75b5b', sub: null}); at(s, x, y, z); g.add(s); return s; });
    const ring = box(0.86, 0.1, 0.08, '#c75b5b', {center: true}); at(ring, x, y + 0.34, z + 0.01); g.add(ring);
    updaters.push((t) => { const k = pick(t); pages.forEach((p, i) => { p.visible = i === k; }); });
    return pages;
  };

  // ---------- bedroom (shots 1, 9, 10) ----------
  {
    const g = addLoc('bedroom');
    under(g, '#3a3036');
    g.add(P.room(6.5, 3.4, 6, {wall: '#c9d4e8', floor: '#a7845e', wain: '#6a7fb0'}));
    const pane = windowOn(g, 2.25, 1.95, -4.9, '#1f2d55');
    const mn = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), new THREE.MeshBasicMaterial({color: '#fff3c8'})); mn.position.set(2.5, 2.2, -4.86); g.add(mn);
    const bd = P.bed(); at(bd, -0.6, 0, -3.3); g.add(bd);
    const stand = box(0.5, 0.55, 0.45, toon('#8a5a3a', {paint: {planks: 2, seed: 95}})); at(stand, 0.45, 0, -4.15); g.add(stand);
    const lb = cyl(0.07, 0.09, 0.32, '#e8c35a'); at(lb, 0.45, 0.55, -4.2); g.add(lb);
    const shade = cone(0.2, 0.22, '#f3e7d3'); at(shade, 0.45, 0.82, -4.2); shade.scale.y = 0.9; g.add(shade);
    const lamp = new THREE.PointLight('#ffcf8a', 3.0, 5, 1.6); lamp.position.set(0.45, 1.0, -3.9); g.add(lamp);
    const mugs = [];
    for (let i = 0; i < 4; i++) { const m = P.mug(['#f3e7d3', '#c75b5b', '#4f7fa6', '#e8c35a'][i]); at(m, 0.32 + (i % 2) * 0.2, 0.55, -3.98 + Math.floor(i / 2) * 0.14, i); g.add(m); mugs.push(m); }
    const clk = P.wallClock(0.3); at(clk.group, -0.6, 2.55, -4.88); g.add(clk.group);
    const cal = calendar(g, 0.75, 1.7, -4.86, [1, 2, 3, 4, 5, 6, 7].map((n) => `HARI ${n}`), (t) => {
      const t0 = E('tujuh') - 0.1; return t < t0 ? 0 : Math.min(6, Math.floor((t - t0) / 0.1));
    });
    const slp = sign(L.sleep, 1.3, 0.75, {bg: '#e0b84f', sub: L.sleepSub, frame: '#8a6a2a'}); at(slp, -2.2, 1.95, -4.84); g.add(slp);
    const cmt = sign(L.comment, 1.7, 0.55, {bg: '#c75b5b', fg: '#fff3df', frame: '#8a3f2a'}); at(cmt, -1.75, 2.68, -4.84); g.add(cmt);
    // hero sitting up in bed (legs hidden under the blanket)
    const hero = ch('hero', {}, g, -0.6, -3.85, 0, -0.3);
    const cup = held(hero, P.mug('#c75b5b'), {y: -0.02});
    hero.act([
      {t: 0, pose: 'hold', expr: 'tired'},
      {t: E('tidak') + 0.1, expr: 'drowsy', action: 'slump', dur: 0.9},
      {t: E('tujuh') + 0.12, expr: 'shocked', pose: 'headHold', action: 'jump', dur: 0.6},
      {t: E('tidurlah') + 0.05, expr: 'sleep', pose: 'limp', action: 'slump', dur: cut(10) - E('tidurlah') - 0.1},
      {t: cut(10), expr: 'happy', pose: 'cheer', action: 'hop', dur: 0.5},
      {t: E('begadang') + 0.1, expr: 'confused', pose: 'shrug'},
      {t: E('komentar') - 0.05, expr: 'excited', pose: 'point', action: 'jump', dur: 0.6},
    ]);
    // hero standing beside the bed for "Jadi... jangan pernah dicoba!"
    const hero2 = ch('hero', {seed: 61}, g, 0.75, -2.45, -0.2);
    hero2.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('jadi') + 0.05, pose: 'hips', expr: 'thinking'},
      {t: E('jangan') + 0.1, pose: 'stop', expr: 'angry', action: 'shake', dur: 0.9}]);
    zzz(g, [-0.6, 1.45, -3.75], (t) => t > E('tidurlah') && inShots(t, 9));
    fx(g, FX.confetti([0.4, 2.6, -2.6], E('komentar')), (t) => inShots(t, 10));
    fx(g, FX.confetti([-0.8, 2.4, -2.9], E('komentar') + 0.15, {seed: 31}), (t) => inShots(t, 10));
    fx(g, FX.glints([-1.75, 2.68, -4.7], E('komentar'), {n: 18}), (t) => inShots(t, 10));
    const night = new THREE.Color('#1f2d55'), day = new THREE.Color('#bfe0f2');
    updaters.push((t) => {
      const s1 = inShots(t, 1), s9 = inShots(t, 9), s10 = inShots(t, 10);
      // clock: 3 a.m. racing on "tujuh hari", 10 p.m. for the advice, 7 a.m. in the morning
      if (s1) { const u = clamp01((t - E('tujuh')) / 1.0); clk.set(3 + u * 4, (t * 40 + u * 600) % 60); }
      else if (s9) clk.set(22, 5 + (t - cut(9)) * 2); else clk.set(7, (t - cut(10)) * 2);
      pane.material.color.copy(s10 ? day : night); mn.visible = !s10;
      lamp.intensity = s10 ? 0.6 : 3.0;
      if (!s1) cal.forEach((p) => { p.visible = false; });
      hero.group.visible = s1 || s10 || (s9 && t > E('tidurlah') - 0.15);
      hero.group.position.y = s9 ? -0.3 : -0.08;
      hero2.group.visible = s9 && t <= E('tidurlah') - 0.15;
      cup.visible = s1; mugs.forEach((m) => { m.visible = s1 || s9; });
      slp.visible = s9 || s10; slp.scale.setScalar(s9 ? pop(t, E('tujuh2') - 0.1, 0.4) : 1);
      cmt.visible = s10; cmt.scale.setScalar(pop(t, E('komentar') - 0.1, 0.4));
    });
  }

  // ---------- office (shots 2 and 3) ----------
  {
    const g = addLoc('office');
    under(g, '#4a525a');
    g.add(P.room(8, 3.5, 6.5, {wall: '#e6e2d6', floor: '#9aa6ae', wain: '#5a7a8a', floorPaint: {bricks: true}}));
    windowOn(g, -1.9, 2.0, -5.4, '#bfe0f2');
    const dk = P.desk(); at(dk, -0.1, 0, -2.4); g.add(dk);
    const chair = box(0.6, 1.1, 0.1, '#3a3a40'); at(chair, -0.1, 0, -3.45); g.add(chair);
    const mon = P.monitor(); at(mon, 0.55, 0.77, -2.55, -2.45); g.add(mon);
    for (let i = 0; i < 3; i++) { const pp = box(0.3, 0.02, 0.22, '#fbf6ea', {hull: 0.006}); at(pp, -0.55, 0.77 + i * 0.02, -2.6, i * 0.15); g.add(pp); }
    const mg = P.mug('#4f7fa6'); g.add(mg);
    const clk = P.wallClock(0.28, {rim: '#4f7fa6'}); at(clk.group, 0.9, 2.55, -5.38); g.add(clk.group);
    const cal = calendar(g, 2.4, 1.85, -5.36, [L.day1, L.day2], (t) => (inShots(t, 2) ? 0 : 1));
    const plant = new THREE.Group(); at(plant, -3.2, 0, -4.8); g.add(plant);
    plant.add(cyl(0.22, 0.17, 0.4, '#c75b5b')); const lf = ball(0.4, '#5f9a5a', {sy: 1.3}); at(lf, 0, 0.85, 0); plant.add(lf);
    const hero = ch('hero', {seed: 62}, g, -0.1, -3.0, 0, -0.3);
    const cw = ch('coworker', {}, g, 1.55, -2.3, -0.35);
    const paper = held(cw, box(0.22, 0.3, 0.01, '#fbf6ea', {center: true, hull: 0.006}), {y: -0.08});
    hero.act([
      {t: 0, pose: 'idle', expr: 'tired'},
      {t: E('jam24') + 0.1, expr: 'drowsy'},
      {t: E('mabuk') + 0.1, expr: 'confused', pose: 'shrug', action: 'lean', dur: 2.2},
      {t: E('fokus') + 0.1, expr: 'tired', pose: 'chin'},
      {t: E('marah') + 0.12, expr: 'furious', pose: 'stop', action: 'shake', dur: 0.6},
      {t: E('lambat') + 0.55, expr: 'surprised', pose: 'give'},
      {t: cut(3), expr: 'drowsy', pose: 'idle'},
      {t: E('paksa') + 0.1, action: 'slump', dur: 1.2},
      {t: E('tertidur') + 0.05, expr: 'sleep', pose: 'limp', action: 'slump', dur: 2.6},
      {t: E('micro') + 0.05, expr: 'shocked', pose: 'armsUp', action: 'jump', dur: 0.6},
      {t: E('micro') + 1.0, expr: 'worried', pose: 'idle', action: 'tremble', dur: 0.8},
    ]);
    cw.act([
      {t: 0, pose: 'give', expr: 'happy', action: 'talk', dur: 1.5},
      {t: E('fokus') + 0.05, pose: 'give', expr: 'neutral', action: 'talk', dur: 1.0},
      {t: E('marah') + 0.3, expr: 'shocked', pose: 'hold', action: 'jump', dur: 0.6},
      {t: E('lambat') + 0.4, expr: 'worried', pose: 'facepalm'},
    ]);
    // dizzy stars around the head on "mabuk"
    const stars = [0, 1, 2].map((i) => { const s = P.glyph('*', 0.22, ['#f2d24a', '#fff3df', '#9adfff'][i]); g.add(s); return s; });
    // mug tipping off the desk on "melambat": falls at lambat - 0.15, lands 0.4 s later
    const mx = -0.55, mz0 = -2.15, landT = () => E('lambat') + 0.25;
    fx(g, FX.debris([mx, 0.05, -1.6], landT(), {n: 9, color: '#4f7fa6', speed: 1.6}), (t) => inShots(t, 2));
    fx(g, FX.dust([mx, 0.05, -1.6], landT(), {n: 6, size: 0.3}), (t) => inShots(t, 2));
    zzz(g, [-0.1, 1.3, -2.9], (t) => inShots(t, 3) && t > E('tertidur') + 0.2 && t < E('micro'));
    updaters.push((t) => {
      const s2 = inShots(t, 2);
      stars.forEach((s, i) => {
        const a = t * 4 + i * 2.1; s.visible = s2 && t > E('mabuk') && t < E('mabuk') + 2.4;
        s.position.set(-0.1 + Math.cos(a) * 0.32, 1.55 + Math.sin(a * 2) * 0.04, -3.0 + Math.sin(a) * 0.2);
      });
      paper.visible = true;
      const t0 = E('lambat') - 0.15, u = clamp01((t - t0) / 0.4);
      mg.visible = s2 ? t < landT() : true;
      if (s2) at(mg, mx, 0.77 - 0.77 * u * u, mz0 + 0.55 * u, 0, u * 1.6);
      else at(mg, mx + 0.2, 0.77, mz0 - 0.2);
      const h = s2 ? 9 + (t - cut(2)) * 0.3 : 17 + (t - cut(3)) * 0.1;
      clk.set(h, (h % 1) * 60);
      if (!s2 && t > E('tertidur') && t < E('micro')) clk.set(17, 20 + (t - E('tertidur')) * 15);
    });
  }

  // ---------- night road (shot 4) ----------
  {
    const g = addLoc('road');
    g.add(ground(90, 90, '#2f4a34'));
    const road = box(7, 0.02, 90, toon('#3a3e46', {paint: {grain: 220, seed: 96}}), {edges: false, hull: 0}); at(road, 0, 0, -30); g.add(road);
    const stripes = [];
    for (let i = 0; i < 14; i++) { const s = box(0.16, 0.012, 1.6, '#f2e6c8', {edges: false, hull: 0}); g.add(s); stripes.push(s); }
    for (const sx of [-1, 1]) { const e = box(0.12, 0.012, 90, '#f2e6c8', {edges: false, hull: 0}); at(e, sx * 3.2, 0.02, -30); g.add(e); }
    const side = [];
    for (let i = 0; i < 6; i++) { const l = P.streetLamp(); l.rotation.y = i % 2 ? Math.PI : 0; g.add(l); side.push({o: l, x: i % 2 ? -4.2 : 4.2, ph: i * 8}); }
    for (let i = 0; i < 8; i++) { const tr = P.tree({seed: 70 + i, h: 2.6}); g.add(tr); side.push({o: tr, x: (i % 2 ? -1 : 1) * (6.5 + (i % 3)), ph: i * 6 + 3}); }
    g.add(P.hills('#2a4030'));
    const cr = P.car('#c75b5b'); at(cr, 0, 0, -3.0); g.add(cr);
    const hero = ch('hero', {seed: 63}, cr, 0.3, -0.15, 0, -0.32);
    hero.act([{t: 0, expr: 'sleep', pose: 'tap', action: 'slump', dur: 1.0},
      {t: E('kendara') + 0.08, expr: 'shocked', pose: 'armsUp', action: 'jump', dur: 0.6},
      {t: E('kendara') + 0.8, expr: 'worried', pose: 'tap', action: 'tremble', dur: 1.2}]);
    zzz(cr, [0.3, 1.3, -0.1], (t) => inShots(t, 4) && t < E('kendara'));
    fx(g, FX.sparks([1.0, 0.1, -1.9], E('kendara') + 0.05, {n: 40, color: '#ffcf5a', speed: 2.0, size: 0.05, up: 0.6}), (t) => inShots(t, 4));
    fx(g, FX.dust([1.2, 0.1, -2.0], E('kendara') + 0.1, {n: 8, size: 0.5, color: '#9a9aa0'}), (t) => inShots(t, 4));
    updaters.push((t) => {
      const v = 11; const d = t * v;
      stripes.forEach((s, i) => at(s, 0, 0.02, ((i * 4 + d) % 56) - 46));
      side.forEach((q) => { q.o.position.set(q.x, 0, ((q.ph + d) % 48) - 40); });
      // drift toward the shoulder while asleep, jerk back on "berbahaya"
      const ts = cut(4), tb = E('kendara');
      const drift = smooth((t - ts) / Math.max(0.3, tb - ts)) * 1.1;
      const back = smooth((t - tb - 0.05) / 0.5);
      const x = drift * (1 - back);
      cr.position.x = x; cr.rotation.y = (t < tb ? 0.12 * drift : 0.12 * (1 - back) * 1.1 - 0.18 * Math.sin(back * Math.PI));
      cr.userData.wheels.forEach((w) => { w.rotation.x = t * 30; });
    });
  }

  // ---------- living room at night (shots 5 and 6) ----------
  {
    const g = addLoc('living');
    under(g, '#3a3036');
    g.add(P.room(8, 3.4, 6.5, {wall: '#d9c7e0', floor: '#8a6a4a', wain: '#6a5a8a'}));
    const pane = windowOn(g, -2.3, 2.0, -5.4, '#1f2d55');
    const sf = P.sofa(); at(sf, 0, 0, -3.75); g.add(sf);
    const tvs = P.tv(); at(tvs.group, 2.7, 0, -2.6, -1.15); g.add(tvs.group); updaters.push(tvs.update);
    const tvLight = new THREE.PointLight('#9ad0ff', 2.2, 6, 1.5); tvLight.position.set(2.2, 1.2, -2.6); g.add(tvLight);
    const tbl = box(1.0, 0.35, 0.55, toon('#7a5236', {paint: {planks: 3, seed: 97}})); at(tbl, 0.1, 0, -2.45); g.add(tbl);
    for (let i = 0; i < 5; i++) { const m = P.mug(['#f3e7d3', '#c75b5b', '#4f7fa6', '#e8c35a', '#9a6fb0'][i]); at(m, -0.25 + i * 0.17, 0.35, -2.45 + (i % 2) * 0.12, i); g.add(m); }
    const cal = calendar(g, 1.3, 1.95, -5.36, [L.day34, L.day57], (t) => (inShots(t, 5) ? 0 : 1));
    const hero = ch('hero', {seed: 64}, g, -0.45, -3.8, 0.1, -0.3);
    hero.act([
      {t: 0, expr: 'drowsy', pose: 'limp'},
      {t: E('kacau') + 0.1, expr: 'confused', pose: 'think', action: 'shake', dur: 0.6},
      {t: E('melihat') + 0.3, expr: 'surprised', pose: 'point'},
      {t: E('mendengar') + 0.1, expr: 'worried', pose: 'headHold', action: 'tremble', dur: 1.0},
      {t: E('halu') + 0.08, expr: 'shocked', pose: 'armsUp', action: 'jump', dur: 0.7},
      {t: cut(6), expr: 'tired', pose: 'limp'},
      {t: E('nyata') + 0.1, expr: 'confused', pose: 'point'},
      {t: E('tidak2') + 0.15, expr: 'shocked', pose: 'headHold', action: 'jump', dur: 0.5},
      {t: E('curiga') + 0.1, expr: 'paranoid', pose: 'cross', action: 'lean', dur: 1.0},
      {t: E('ingatan') + 0.1, expr: 'confused', pose: 'think', action: 'shake', dur: 0.8},
    ]);
    // hallucinations: a goat on the sofa, fish swimming through the air, music notes from nowhere
    const gt = P.goat(); at(gt, 0.6, 0.38, -3.6, -0.4); gt.scale.setScalar(0.85); g.add(gt);
    const fishes = [0, 1, 2].map((i) => { const f = P.fish(['#e8a83a', '#7aa3b8', '#c75b5b'][i]); f.scale.setScalar(1.6); g.add(f); return f; });
    const notes = [0, 1, 2, 3].map((i) => { const s = P.glyph(i % 2 ? '♪' : '♫', 0.3, '#f2d24a'); g.add(s); return s; });
    fx(g, FX.glints([0.6, 1.0, -3.6], E('melihat'), {n: 20, color: '#e0c8ff'}), (t) => inShots(t, 5));
    fx(g, FX.sparks([0, 1.6, -3.0], E('halu') + 0.05, {n: 60, color: '#c8a8ff', speed: 1.6, size: 0.06, up: 0.5}), (t) => inShots(t, 5));
    // days 5-7: friend + a fake copy of the friend that pops away on "tidak"
    const fr = ch('friend', {}, g, 1.35, -2.55, -0.35);
    const fake = ch('friend', {seed: 9}, g, 0.75, -3.15, -0.2);
    fr.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('nyata') + 0.2, pose: 'idle', expr: 'neutral'},
      {t: E('curiga') + 0.25, pose: 'shrug', expr: 'confused'}, {t: E('ingatan') + 0.2, pose: 'facepalm', expr: 'worried'}]);
    fake.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('nyata'), pose: 'hips', expr: 'smug'}]);
    fx(g, FX.glints([0.75, 1.2, -3.15], E('tidak2') + 0.1, {n: 26, color: '#e0c8ff'}), (t) => inShots(t, 6));
    const qm = P.glyph('?', 0.4, '#fff3df'); g.add(qm);
    updaters.push((t) => {
      const s5 = inShots(t, 5), s6 = inShots(t, 6);
      tvLight.intensity = 1.8 + 0.6 * Math.sin(t * 23) * Math.sin(t * 7);
      const hb = t > E('halu') ? 1 + 0.12 * Math.abs(Math.sin((t - E('halu')) * 9)) * Math.max(0, 1 - (t - E('halu')) / 1.2) : 1;
      gt.visible = s5; gt.scale.setScalar(0.85 * pop(t, E('melihat') + 0.05, 0.4) * hb);
      fishes.forEach((f, i) => {
        const a = t * 1.3 + i * 2.1; f.visible = s5 || (s6 && i === 0 && t < E('pikiran'));
        f.position.set(0.4 + Math.cos(a) * (1.0 + i * 0.25), 1.85 + i * 0.2 + Math.sin(a * 2) * 0.1, -3.4 + Math.sin(a) * 0.45);
        f.rotation.y = -a + Math.PI; f.scale.setScalar(1.6 * pop(t, E('melihat') + 0.5 + i * 0.25, 0.4) * hb);
      });
      notes.forEach((s, i) => {
        const u = ((t - E('mendengar')) * 0.6 + i * 0.25) % 1; s.visible = s5 && t > E('mendengar');
        s.position.set(-1.6 + i * 0.35 + Math.sin(u * 6) * 0.1, 1.2 + u * 1.4, -3.2); s.material.opacity = Math.sin(u * Math.PI);
      });
      fr.group.visible = s6; fake.group.visible = s6;
      fake.group.scale.setScalar(t < E('tidak2') + 0.1 ? 1 : Math.max(0.0001, 1 - smooth((t - E('tidak2') - 0.1) / 0.3)));
      qm.visible = s6 && t > E('ingatan') + 0.1; qm.position.set(-0.45, 1.75 + 0.05 * Math.sin(t * 5), -3.75); qm.scale.setScalar(0.4 * pop(t, E('ingatan') + 0.1, 0.3));
      pane.material.color.set('#1f2d55');
    });
  }

  // ---------- 1964 (shot 7) ----------
  {
    const g = addLoc('retro');
    under(g, '#3a3036');
    g.add(P.room(8, 3.4, 6.5, {wall: '#e8d2a8', floor: '#9a6a4a', wain: '#7a4a32'}));
    const board = P.chalkboard(2.2, 1.2, {seed: 7, text: L.year, textY: 0.45}); at(board, -1.35, 2.15, -5.35); g.add(board);
    const rec = sign(L.record, 1.8, 0.85, {bg: '#e0b84f', sub: L.recordSub, frame: '#8a6a2a'}); at(rec, 1.45, 2.35, -5.32); g.add(rec);
    const radio = new THREE.Group(); at(radio, 2.8, 0, -4.4, -0.4); g.add(radio);
    radio.add(box(0.9, 0.75, 0.5, toon('#7a5236', {paint: {planks: 3, seed: 98}})));
    const rb = box(0.7, 0.35, 0.42, '#c9a462'); at(rb, 0, 0.75, 0); radio.add(rb);
    const sp = cyl(0.12, 0.12, 0.02, '#5a3a2a', {center: true}); at(sp, -0.15, 0.93, 0.22, 0, Math.PI / 2); radio.add(sp);
    const clk = P.wallClock(0.26, {rim: '#7a5236'}); at(clk.group, 0.0, 2.75, -5.38); g.add(clk.group); clk.set(4, 10);
    const randy = ch('randy', {}, g, 0.0, -2.65, 0);
    const p1 = ch('pal1', {}, g, -1.15, -3.05, 0.3);
    const p2 = ch('pal2', {}, g, 1.2, -3.1, -0.3);
    const sci = ch('scientist', {seed: 15}, g, 2.15, -2.5, -0.4);
    held(sci, box(0.2, 0.28, 0.02, '#fbf6ea', {center: true, hull: 0.006}), {y: -0.06});
    randy.act([{t: 0, pose: 'idle', expr: 'tired'}, {t: E('remaja') + 0.1, pose: 'wave', expr: 'happy'},
      {t: E('randy') + 0.15, pose: 'hips', expr: 'proud', action: 'hop', dur: 0.5}, {t: E('sebelas') + 0.15, pose: 'cheer', expr: 'excited', action: 'jump', dur: 0.7}]);
    p1.act([{t: 0, pose: 'present', expr: 'happy', action: 'talk', dur: 1.2}, {t: E('randy'), pose: 'present', expr: 'excited'}, {t: E('sebelas') + 0.2, pose: 'armsUp', expr: 'laugh', action: 'hop', dur: 0.5}]);
    p2.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('randy') + 0.1, pose: 'point', expr: 'happy'}, {t: E('sebelas') + 0.25, pose: 'cheer', expr: 'laugh', action: 'hop', dur: 0.5}]);
    sci.act([{t: 0, pose: 'hold', expr: 'thinking'}, {t: E('sebelas') + 0.1, pose: 'hold', expr: 'surprised', action: 'nod', dur: 0.8}]);
    fx(g, FX.glints([1.45, 2.3, -5.1], E('sebelas'), {n: 26}), (t) => inShots(t, 7));
    updaters.push((t) => { rec.scale.setScalar(pop(t, E('sebelas') - 0.05, 0.4)); });
  }

  // ---------- dream stadium (shot 8) ----------
  {
    const g = addLoc('field');
    g.add(ground(120, 120, '#5f9a4a'));
    for (let i = 0; i < 9; i++) { const l = box(14, 0.012, 0.12, '#f6f1e6', {edges: false, hull: 0}); at(l, 0, 0.0, 4 - i * 3); g.add(l); }
    const gp = P.goalPost(); at(gp, 0, 0, -16); g.add(gp);
    const bl = P.bleachers(26, 5); at(bl, 0, 0, -22); g.add(bl);
    for (const sx of [-1, 1]) {
      const tw = cyl(0.15, 0.2, 9, '#7a8a90'); at(tw, sx * 11, 0, -21); g.add(tw);
      const lt = box(2.2, 1.0, 0.3, '#3a3a40'); at(lt, sx * 11, 9, -21); g.add(lt);
      const glow = box(2.0, 0.8, 0.05, new THREE.MeshBasicMaterial({color: '#fff6d0'}), {hull: 0}); at(glow, sx * 11, 9.1, -20.82); g.add(glow);
    }
    const crowd = [];
    for (let i = 0; i < 18; i++) {
      const row = i % 3, x = -9 + (i * 1.05) + row * 0.3;
      const c = ch(i % 2 ? 'fanA' : 'fanB', {seed: 80 + i}, g, x, -22.2 - row * 0.8, 0, 0.45 * (row + 1));
      c.act([{t: 0, pose: i % 3 ? 'cheer' : 'armsUp', expr: 'happy'}, {t: E('terkenal') + 0.05 + (i % 5) * 0.05, pose: 'cheer', expr: 'excited', action: 'jump', dur: 0.7}]);
      crowd.push(c);
    }
    const sb = new THREE.Group(); at(sb, 0, 0, -24.5); g.add(sb);
    for (const s of [-1, 1]) { const p = cyl(0.12, 0.14, 6.5, '#5a6066'); at(p, s * 2.6, 0, 0); sb.add(p); }
    const td = sign('TOUCHDOWN!', 5.0, 1.4, {bg: '#2f5fa8', fg: '#f2d24a', frame: '#1f2a40'}); at(td, 0, 5.8, 0.05); sb.add(td);
    const randy = ch('randy', {seed: 3}, g, 0, -1.7, 0);
    const player = ch('player', {seed: 3}, g, 0, -1.7, 0);
    held(player, P.footballBall(), {y: -0.06, rz: 0.4});
    const fans = [ch('fanA', {seed: 21}, g, -1.7, -2.6, 0.3), ch('fanB', {seed: 22}, g, 1.75, -2.7, -0.3)];
    randy.act([{t: 0, pose: 'limp', expr: 'tired'}, {t: E('ia') + 0.1, pose: 'think', expr: 'thinking'}]);
    player.act([{t: 0, pose: 'carry', expr: 'proud'}, {t: E('mengira') + 0.1, pose: 'carry', expr: 'proud', action: 'spinIn', dur: 0.5},
      {t: E('terkenal') + 0.08, pose: 'carry', expr: 'excited', action: 'jump', dur: 0.7}]);
    fans.forEach((f, i) => f.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('pemain') + 0.1 + i * 0.1, pose: 'cheer', expr: 'excited', action: 'hop', dur: 0.5},
      {t: E('terkenal') + 0.1 + i * 0.08, pose: 'armsUp', expr: 'laugh', action: 'jump', dur: 0.7}]));
    fx(g, FX.glints([0, 1.2, -1.7], E('mengira') + 0.05, {n: 30, color: '#e0c8ff'}), (t) => inShots(t, 8));
    fx(g, FX.confetti([0, 3.0, -1.6], E('terkenal')), (t) => inShots(t, 8));
    fx(g, FX.confetti([-1.5, 2.8, -2.4], E('terkenal') + 0.15, {seed: 41}), (t) => inShots(t, 8));
    fx(g, FX.confetti([1.5, 2.8, -2.4], E('terkenal') + 0.25, {seed: 51}), (t) => inShots(t, 8));
    updaters.push((t) => {
      const sw = E('mengira') + 0.1;
      randy.group.visible = t < sw; player.group.visible = t >= sw;
      td.scale.setScalar(pop(t, E('terkenal') - 0.05, 0.4));
      fans.forEach((f) => { f.group.visible = t > E('pemain') - 0.2; f.group.scale.setScalar(pop(t, E('pemain') - 0.2, 0.35)); });
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
