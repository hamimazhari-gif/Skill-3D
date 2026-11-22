// All locations in one scene at different x offsets. Story: "Pisang radioaktif / The radioactive banana".
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, clamp01, INK, decal, canvas, texFrom, rng} from './kit';
import {makeChar} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {kitchen: 0, farm: 40, lab: 80, airport: 120, hospital: 160, mountain: 200};

export {LOOK_PRESETS, MOODS} from './lighting';

const GREEN = {grade: {sat: 1.05, contrast: 1.06, tint: '#a8ffa0', tintAmt: 0.12, vignette: 0.5}};
const kitchenLook = {...LOOK_PRESETS.interiorWarm, keyPos: [-4, 7, 8]};
const labLook = {...LOOK_PRESETS.interiorCool, keyPos: [-4, 8, 8]};
const hospLook = {...LOOK_PRESETS.interiorCool, keyPos: [-3, 8, 8], key: '#f6fbff'};

// Lighting plan (camera_plan.md): morning kitchen; noon banana farm turning golden for the finale; cool lab;
// bright airport day; clinical hospital going tense on "tens of thousands"; golden-hour banana mountain turning joyful.
export const LOOK = {
  kitchen: {keys: [{at: 0, ...kitchenLook}, {at: 'radio', ...kitchenLook, ...GREEN}, {at: 'cut2', ...kitchenLook},
    {at: 'cut8', ...kitchenLook}, {at: 'remove', ...kitchenLook, ...MOODS.joyful}]},
  farm: {keys: [{at: 0, ...LOOK_PRESETS.noon, keyPos: [-5, 12, 6]}, {at: 'cut3', ...LOOK_PRESETS.noon, keyPos: [-5, 12, 6]},
    {at: 'cut10', ...LOOK_PRESETS.goldenHour, ...MOODS.joyful, keyPos: [-8, 6, 7]}]},
  lab: {keys: [{at: 0, ...labLook}, {at: 'radiasi', ...labLook, ...GREEN}, {at: 'cut4', ...labLook}, {at: 'cut5', ...labLook},
    {at: 'cut9', ...labLook, ...MOODS.mystery}, {at: 'yourself', ...labLook, ...GREEN}, {at: 'samek', ...labLook, ...MOODS.joyful}]},
  airport: {...LOOK_PRESETS.day, keyPos: [-7, 11, 7]},
  hospital: {keys: [{at: 0, ...hospLook}, {at: 'cut6', ...hospLook}, {at: 'tens', ...hospLook, ...MOODS.tense}]},
  mountain: {keys: [{at: 0, ...LOOK_PRESETS.goldenHour, keyPos: [-9, 6, 7]}, {at: 'millions', ...LOOK_PRESETS.goldenHour, keyPos: [-9, 6, 7]},
    {at: 'impossible', ...LOOK_PRESETS.goldenHour, ...MOODS.joyful, keyPos: [-9, 6, 7]}]},
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
      {t: EVt.radio + 0.05, dur: 0.3, color: '#c8ffb8', strength: 0.45},
      {t: EVt.tens + 0.3, dur: 0.35, color: '#ffffff', strength: 0.55},
      {t: EVt.yourself + 0.05, dur: 0.3, color: '#c8ffb8', strength: 0.35},
      {t: EVt.follow, dur: 0.35, color: '#ffe9b0', strength: 0.45},
    ],
    shakes: [{t: EVt.radio + 0.05, dur: 0.35, amp: 0.02}, {t: EVt.tens + 0.3, dur: 0.6, amp: 0.045}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0) => { const c = makeChar(name, {yaw, ...o}); at(c.group, x, 0, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const holdBanana = (c, o = {}) => { const b = P.banana({len: 0.24, cast: false}); at(b, 0.02, -0.02, 0.05, 0, 0, o.rz ?? 1.9); c.hand(1).add(b); return b; };

  // ---------- kitchen (shots 1 and 8) ----------
  {
    const g = addLoc('kitchen');
    { const gr = ground(40, 40, '#8a6a4a'); gr.position.y = -0.05; g.add(gr); }
    g.add(P.room(7.5, 3.6, 6.5, {wall: '#f1dcb8', floor: '#c9a27a', wain: '#b0694a'}));
    // window with a morning sky
    const win = new THREE.Group(); at(win, 0.6, 0, -5.38); g.add(win);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), new THREE.MeshBasicMaterial({color: '#bfe0f2'})); pane.position.set(0, 2.05, 0.02); win.add(pane);
    for (const s of [-1, 1]) { const f = box(0.08, 1.1, 0.12, '#f6ead6', {center: true}); at(f, s * 0.68, 2.05, 0.05); win.add(f); }
    for (const y of [1.52, 2.58]) { const f = box(1.44, 0.08, 0.14, '#f6ead6', {center: true}); at(f, 0, y, 0.06); win.add(f); }
    const mull = box(0.05, 1.0, 0.06, '#f6ead6', {center: true}); at(mull, 0, 2.05, 0.05); win.add(mull);
    const counter = box(4.6, 0.9, 0.7, toon('#9a6a4a', {paint: {planks: 6, seed: 21}})); at(counter, 0.3, 0, -5.0); g.add(counter);
    const top = box(4.7, 0.06, 0.76, '#eae3d6'); at(top, 0.3, 0.9, -5.0); g.add(top);
    for (const x of [-1.5, 2.6]) { const cb = box(1.4, 0.8, 0.4, toon('#b0694a', {paint: {planks: 3, seed: 22}})); at(cb, x, 2.4, -5.18); g.add(cb); }
    const fridge = box(0.85, 2.05, 0.72, toon('#e8eef0', {paint: {seed: 23, stains: 6}})); at(fridge, -3.0, 0, -4.9); g.add(fridge);
    const fh = box(0.04, 0.5, 0.05, '#9aa4a8'); at(fh, -2.7, 1.1, -4.52); g.add(fh);
    const kettle = cyl(0.12, 0.15, 0.22, '#c75b5b'); at(kettle, 1.9, 0.96, -5.0); g.add(kettle);
    for (const [x, c] of [[-0.6, '#5a9a8a'], [-0.35, '#e0b84f']]) { const j = cyl(0.08, 0.08, 0.22, c); at(j, x, 0.96, -5.1); g.add(j); }
    const table = box(1.8, 0.78, 0.9, toon('#b08454', {paint: {planks: 4, seed: 24}})); at(table, 0.3, 0, -1.6); g.add(table);
    const bowl = cyl(0.24, 0.14, 0.12, '#4f7fa6'); at(bowl, -0.3, 0.78, -1.55); g.add(bowl);
    const bn = P.bunch(6); at(bn, -0.3, 0.88, -1.55, 0.4); g.add(bn);
    const mug = cyl(0.06, 0.055, 0.12, '#f3e7d3'); at(mug, 0.15, 0.78, -1.3); g.add(mug);
    const gc = P.geiger(); at(gc.group, 0.8, 0.78, -1.45, -0.45); g.add(gc.group);
    const rs = P.radSign(L.radio, 0.62, 0.8); at(rs, -1.5, 1.52, -5.32); g.add(rs);
    const hero = ch('hero', {}, g, 0.05, -2.45, 0.1);
    holdBanana(hero);
    hero.act([
      {t: 0, pose: 'present', expr: 'happy'},
      {t: E('eat') + 0.1, expr: 'excited', action: 'hop', dur: 0.5},
      {t: E('radio') + 0.12, expr: 'shocked', action: 'jump', dur: 0.7},
      {t: E('radio') + 0.85, expr: 'worried', pose: 'hold', action: 'tremble', dur: 1.0},
      {t: cut(8), pose: 'eat', expr: 'happy', action: 'talk', dur: 1.0},
      {t: E('body') + 0.1, expr: 'laugh', pose: 'present'},
      {t: E('remove') + 0.15, expr: 'proud', pose: 'hips', action: 'hop', dur: 0.5},
    ]);
    const tokens = [];
    for (let i = 0; i < 6; i++) { const s = P.kToken('K'); s.scale.setScalar(0.0001); g.add(s); tokens.push(s); }
    fx(g, FX.glints([0.35, 1.6, -2.2], E('radio') + 0.05, {color: '#9dff7a', n: 36, speed: 0.9, size: 0.1}), (t) => inShots(t, 1));
    fx(g, FX.sparks([0.35, 1.6, -2.2], E('radio') + 0.05, {color: '#b8ff8a', n: 30, speed: 1.1, size: 0.05, up: 0.6, repeat: 0.7}), (t) => inShots(t, 1));
    updaters.push((t) => {
      const lvl = t < E('radio') ? -0.95 + 0.04 * Math.sin(t * 11) : t < cut(2) ? 0.85 + 0.15 * Math.sin(t * 23) + 0.08 * Math.sin(t * 41) : -0.9 + 0.05 * Math.sin(t * 9);
      const rise = smooth((t - E('radio')) / 0.25);
      gc.needle.rotation.z = -(t < cut(2) ? -0.95 + (lvl + 0.95) * rise : lvl);
      rs.visible = inShots(t, 1); rs.scale.setScalar(pop(t, E('radio') + 0.05));
      const tr = E('remove');
      tokens.forEach((s, i) => {
        const t0 = tr + i * 0.12, u = clamp01((t - t0) / 1.6);
        s.visible = inShots(t, 8) && t > t0;
        s.position.set(0.05 + (i % 3 - 1) * 0.15 + u * (0.6 - i * 0.12), 1.15 + u * 1.5 + Math.sin(u * 6 + i) * 0.05, -2.3 + u * (-2.0 + i * 0.1));
        s.scale.setScalar(0.3 * pop(t, t0, 0.3) * (1 - 0.4 * u));
      });
    });
  }

  // ---------- banana farm (shots 2 and 10) ----------
  {
    const g = addLoc('farm');
    g.add(ground(80, 80, '#8fb36a'));
    const path = box(2.4, 0.02, 30, toon('#c9a77a', {paint: {grain: 200, seed: 8}}), {edges: false, hull: 0}); at(path, 0, 0, -4); g.add(path);
    for (const [x, z, s, h] of [[-2.6, -3.2, 1, 2.7], [2.9, -3.6, 2, 2.9], [-4.6, -6.5, 3, 3.0], [4.8, -7.2, 4, 2.8], [-1.8, -9.5, 5, 3.1], [1.9, -11, 6, 2.9], [-6.5, -11, 7, 3.0], [6.8, -12, 8, 3.1], [-3.5, -14, 9, 2.8], [4, -16, 10, 3]]) {
      const tr = P.bananaTree({seed: s, h}); at(tr, x, 0, z, s * 0.7); g.add(tr);
    }
    g.add(P.hills('#9cbf6a'));
    const crate = P.crate(0.9, 0.55, 0.65, L.potassium, '#b08454'); at(crate, 1.15, 0, -1.7, -0.25); g.add(crate);
    for (const [x, r] of [[0.95, 0.3], [1.35, -0.5]]) { const b = P.bunch(6); at(b, x, 0.6, -1.7, r); g.add(b); }
    const hero = ch('hero', {seed: 41}, g, -0.25, -1.8, 0.15);
    holdBanana(hero);
    hero.act([{t: 0, pose: 'present', expr: 'happy'}, {t: E('kalium'), pose: 'point', expr: 'excited', action: 'hop', dur: 0.4},
      {t: E('otot') - 0.05, pose: 'flex', expr: 'proud', action: 'hop', dur: 0.5}, {t: E('jantung') + 0.1, expr: 'laugh'}]);
    const ht = P.heart(); at(ht, 0.45, 2.15, -1.75); g.add(ht);
    // finale crowd
    const crowd = new THREE.Group(); g.add(crowd);
    const fh = ch('hero', {seed: 42}, crowd, 0, -1.6, 0); holdBanana(fh);
    const cs = [['scientist', -1.0, -1.9], ['doctor', 1.0, -1.9], ['pilot', -1.85, -2.6], ['farmer', 1.85, -2.6]].map(([n, x, z], i) => ch(n, {seed: 50 + i}, crowd, x, z, -x * 0.1));
    fh.act([{t: 0, pose: 'cheer', expr: 'excited'}, {t: E('follow') - 0.05, pose: 'point', expr: 'laugh', action: 'jump', dur: 0.7}]);
    cs.forEach((c, i) => c.act([{t: 0, pose: i % 2 ? 'cheer' : 'armsUp', expr: i % 2 ? 'laugh' : 'happy'}, {t: E('follow') + 0.1 + i * 0.07, action: 'jump', dur: 0.7, expr: 'excited'}]));
    const bnr = P.banner(L.follow, 2.6, 0.75, {poleH: 3.3, bg: '#e0b84f', fg: '#351f22', frame: '#8a6a2a'}); at(bnr, 0, 0, -4.6); g.add(bnr);
    fx(g, FX.confetti([0, 2.4, -1.4], E('follow')), (t) => inShots(t, 10));
    fx(g, FX.confetti([0.8, 2.2, -1.8], E('follow') + 0.2, {seed: 21}), (t) => inShots(t, 10));
    updaters.push((t) => {
      const s2 = inShots(t, 2);
      hero.group.visible = s2; crowd.visible = !s2;
      ht.visible = s2; ht.scale.setScalar(pop(t, E('jantung'), 0.4) * (1 + 0.08 * Math.max(0, Math.sin(t * 9))));
      ht.rotation.y = Math.sin(t * 2) * 0.3;
      bnr.visible = !s2;
    });
  }

  // ---------- lab (shots 3, 4 and 9) ----------
  {
    const g = addLoc('lab');
    { const gr = ground(40, 40, '#4a525a'); gr.position.y = -0.05; g.add(gr); }
    g.add(P.room(9, 4, 6.8, {wall: '#dfe8e6', floor: '#b9c4c4', wain: '#5a8a96', floorPaint: {bricks: true}}));
    const ls = sign(L.lab, 1.2, 0.42, {bg: '#5a8a96', fg: '#f6ead6', frame: '#3f5f6a'}); at(ls, 2.6, 3.25, -5.7); g.add(ls);
    for (const [x, c] of [[2.0, '#e8c35a'], [3.3, '#c75b5b']]) { const fr = box(0.8, 1.0, 0.05, '#7a8a90'); at(fr, x, 1.7, -5.72); g.add(fr); const pic = box(0.66, 0.84, 0.06, c, {edges: false}); at(pic, x, 1.78, -5.71); g.add(pic); }
    const shelf = box(1.6, 0.06, 0.35, '#7a8a90'); at(shelf, -3.4, 1.6, -5.55); g.add(shelf);
    for (let i = 0; i < 4; i++) { const f = P.flask(['#7ad66a', '#4f9fe0', '#e8c35a', '#c75b5b'][i], 0.22); at(f, -4.0 + i * 0.38, 1.66, -5.55); g.add(f); }
    // shot 3: bench with banana, magnifier, atom, K-40 tag
    const bench = box(2.6, 0.9, 0.9, toon('#5a6a72', {paint: {seed: 31}})); at(bench, 1.1, 0, -2.6); g.add(bench);
    const btop = box(2.7, 0.06, 1.0, '#e9eef0'); at(btop, 1.1, 0.9, -2.6); g.add(btop);
    const bb = P.banana({len: 0.3}); at(bb, 0.9, 1.0, -2.55, 0.2); g.add(bb);
    const mg = P.magnifier(); at(mg, 0.55, 1.15, -2.35, 0.7, -0.2); g.add(mg);
    for (const [x, c] of [[1.85, '#7ad66a'], [2.15, '#4f9fe0']]) { const f = P.flask(c); at(f, x, 0.96, -2.75); g.add(f); }
    const at3 = P.atom({r: 0.2}); at(at3.group, 0.9, 1.45, -2.6); g.add(at3.group); updaters.push(at3.update);
    const kt = new THREE.Group(); at(kt, 1.22, 0.96, -2.3, -0.35); g.add(kt);
    const ktp = cyl(0.015, 0.015, 0.12, '#7a8a90', {hull: 0.005}); kt.add(ktp);
    const kts = sign(L.k40, 0.34, 0.17, {bg: '#7ad66a'}); at(kts, 0, 0.2, 0); kt.add(kts);
    const sci = ch('scientist', {}, g, 1.6, -3.45, 0);
    sci.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('k40') + 0.1, pose: 'present', expr: 'smug'},
      {t: E('radiasi') + 0.1, pose: 'pointUp', expr: 'excited', action: 'hop', dur: 0.5}]);
    fx(g, FX.sparks([0.9, 1.45, -2.6], E('radiasi'), {color: '#9dff7a', n: 40, speed: 1.0, size: 0.05, up: 0.4, repeat: 0.6, seed: 31}), (t) => inShots(t, 3));
    fx(g, FX.glints([0.9, 1.45, -2.6], E('k40') + 0.1, {color: '#c8ffb0', n: 20}), (t) => inShots(t, 3));
    // shot 4: chalkboard
    const board = P.chalkboard(2.2, 1.2, {seed: 4}); at(board, -1.35, 2.35, -5.65); g.add(board);
    const bc = canvas(1024, 560), bx = bc.getContext('2d');
    bx.fillStyle = '#f4efe2'; bx.textAlign = 'center'; bx.textBaseline = 'middle';
    let fs = 96; bx.font = `900 ${fs}px "Inter Display"`; while (bx.measureText(L.bed).width > 900) { fs -= 4; bx.font = `900 ${fs}px "Inter Display"`; }
    bx.fillText(L.bed, 512, 110);
    bx.strokeStyle = '#f4efe2'; bx.lineWidth = 12; bx.lineCap = 'round';
    bx.beginPath(); bx.moveTo(110, 220); bx.lineTo(920, 220); bx.stroke();
    // chalk banana doodle
    bx.strokeStyle = '#f2d84a'; bx.lineWidth = 14;
    bx.beginPath(); bx.arc(260, 160, 210, 0.35 * Math.PI, 0.72 * Math.PI); bx.stroke();
    bx.beginPath(); bx.arc(260, 205, 160, 0.33 * Math.PI, 0.7 * Math.PI); bx.stroke();
    bx.fillStyle = '#f4efe2'; bx.font = '800 110px "Inter Display"'; bx.fillText(lang === 'en' ? '≈ 0.1 µSv' : '≈ 0,1 µSv', 660, 400);
    const bov = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.15), new THREE.MeshBasicMaterial({map: texFrom(bc), transparent: true, depthWrite: false}));
    bov.position.set(-1.35, 2.35, -5.6); g.add(bov);
    const sci2 = ch('scientist', {seed: 12}, g, -2.95, -4.9, 0.2);
    sci2.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('scientists') + 0.1, pose: 'chin', expr: 'thinking'},
      {t: E('dose') + 0.1, pose: 'point', expr: 'proud', action: 'hop', dur: 0.4}, {t: E('easy') + 0.1, pose: 'presentBoth', expr: 'happy'}]);
    const hero2 = ch('hero', {seed: 43}, g, -0.6, -3.8, -0.35);
    hero2.act([{t: 0, pose: 'chin', expr: 'confused'}, {t: E('dose') + 0.3, expr: 'surprised'},
      {t: E('easy') + 0.15, pose: 'cheer', expr: 'laugh', action: 'nod', dur: 0.9}]);
    // shot 9 corner: geiger on a stool
    const stool = box(0.55, 0.8, 0.45, toon('#7a8a90', {paint: {seed: 33}})); at(stool, 3.8, 0, -1.9); g.add(stool);
    const gc = P.geiger(); at(gc.group, 3.75, 0.8, -1.85, -0.2); g.add(gc.group);
    const hero3 = ch('hero', {seed: 44}, g, 3.15, -2.55, 0.15);
    const sci3 = ch('scientist', {seed: 13}, g, 4.15, -2.95, -0.25);
    hero3.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('bonus'), pose: 'chin', expr: 'thinking'},
      {t: E('yourself') + 0.12, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.7}, {t: E('samek') + 0.1, pose: 'cheer', expr: 'laugh', action: 'hop', dur: 0.6}]);
    sci3.act([{t: 0, pose: 'idle', expr: 'smug'}, {t: E('bonus'), pose: 'pointUp', expr: 'excited'},
      {t: E('yourself'), pose: 'point', expr: 'smug', action: 'hop', dur: 0.4}, {t: E('samek') + 0.2, pose: 'hips', expr: 'laugh'}]);
    fx(g, FX.glints([3.15, 1.2, -2.3], E('yourself') + 0.05, {color: '#9dff7a', n: 40, speed: 0.9, size: 0.1, seed: 41}), (t) => inShots(t, 9));
    fx(g, FX.sparks([3.15, 1.1, -2.3], E('yourself') + 0.05, {color: '#b8ff8a', n: 30, speed: 0.8, size: 0.04, up: 0.6, repeat: 0.8, spread: 0.8}), (t) => inShots(t, 9));
    updaters.push((t) => {
      const s3 = inShots(t, 3), s4 = inShots(t, 4), s9 = inShots(t, 9);
      at3.group.visible = s3; at3.group.scale.setScalar(pop(t, E('k40'), 0.4) * (1 + 0.05 * Math.sin(t * 7)));
      kt.visible = s3; kt.scale.setScalar(pop(t, E('k40') + 0.15));
      sci.group.visible = s3;
      bov.scale.setScalar(t < cut(4) ? 0.0001 : pop(t, E('dose') - 0.05, 0.4));
      sci2.group.visible = s4; hero2.group.visible = s4;
      hero3.group.visible = s9; sci3.group.visible = s9;
      const y = E('yourself');
      gc.needle.rotation.z = -(t < y ? -0.9 + 0.05 * Math.sin(t * 9) : -0.9 + (0.35 + 0.12 * Math.sin(t * 19)) * smooth((t - y) / 0.3));
    });
  }

  // ---------- airport (shot 5) ----------
  {
    const g = addLoc('airport');
    g.add(ground(90, 90, '#9a9ea2', {grain: 160}));
    const grass = ground(90, 40, '#9dbb6a'); grass.position.set(0, 0.02, -40); g.add(grass);
    for (let i = 0; i < 12; i++) { const m = box(1.6, 0.012, 0.18, '#f4f1ea', {edges: false, hull: 0}); at(m, -16 + i * 3, 0, -11); g.add(m); }
    for (let i = 0; i < 6; i++) { const m = box(0.14, 0.012, 1.4, '#e8c35a', {edges: false, hull: 0}); at(m, 0.2, 0, 1.5 - i * 2.2); g.add(m); }
    const term = P.facade(12, 4.2, {color: '#dfe4e8', windows: 6, door: true, seed: 7, trim: '#5a6a72', shutter: '#4f7fa6'}); at(term, -7.5, 0, -15, 0.25); g.add(term);
    const tb = box(12, 4.2, 4, '#dfe4e8'); at(tb, -7.5 + Math.sin(0.25) * -2, 0, -17, 0.25); g.add(tb);
    const as = sign(L.airport, 3.6, 0.8, {bg: '#4f7fa6', fg: '#f6ead6', frame: '#2a3a56'}); at(as, -7.5 + 0.3, 4.75, -14.9, 0.25); g.add(as);
    const tower = cyl(0.5, 0.7, 7, '#dfe4e8'); at(tower, 6, 0, -20); g.add(tower);
    const cab = cyl(1.2, 0.9, 1.0, '#4f7fa6'); at(cab, 6, 7, -20); g.add(cab);
    const pl = P.plane(); at(pl, 2.6, 0, -8.2, 0.32); g.add(pl);
    const pilot = ch('pilot', {}, g, 2.1, -2.7, -0.2);
    const hero = ch('hero', {seed: 45}, g, -0.7, -1.5, 0.3);
    const sc = P.suitcase(); at(sc, -1.12, 0, -1.25, 0.3); g.add(sc);
    hero.act([{t: 0, pose: 'idle', expr: 'happy', action: 'walk', dur: 1.2}, {t: E('plane') + 0.1, pose: 'point', expr: 'excited'},
      {t: E('hundreds') + 0.12, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.7}]);
    pilot.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('hundreds'), pose: 'presentBoth', expr: 'smug', action: 'hop', dur: 0.4}]);
    // pile of banana crates popping in on "hundreds"
    const crates = [];
    const pile = new THREE.Group(); at(pile, 0.75, 0, -2.0, -0.2); g.add(pile);
    const slots = [[-0.45, 0, 0], [0.45, 0, 0], [-0.45, 0, -0.7], [0.45, 0, -0.7], [0, 0.55, -0.35], [-0.45, 0.55, 0.0], [0.45, 0.55, -0.7], [0, 1.1, -0.35]];
    slots.forEach(([x, y, z], i) => {
      const c = new THREE.Group(); at(c, x, y, z, (i % 3 - 1) * 0.1); pile.add(c);
      c.add(P.crate(0.85, 0.55, 0.65, L.bananas, '#c99a5a'));
      const b = P.bunch(5); at(b, 0, 0.55, 0, i); c.add(b);
      crates.push(c);
    });
    updaters.push((t) => {
      const wu = clamp01((t - cut(5)) / 1.2); hero.group.position.x = -1.2 + 0.5 * smooth(wu); sc.position.x = hero.group.position.x - 0.42;
      crates.forEach((c, i) => c.scale.setScalar(pop(t, E('hundreds') - 0.1 + i * 0.07, 0.3)));
    });
  }

  // ---------- hospital CT room (shot 6) ----------
  {
    const g = addLoc('hospital');
    { const gr = ground(40, 40, '#5a6466'); gr.position.y = -0.05; g.add(gr); }
    g.add(P.room(8, 3.8, 7, {wall: '#e4f0ee', floor: '#cfd8d6', wain: '#7fb0a8', floorPaint: {bricks: true}}));
    const cs = sign(L.ct, 1.7, 0.48, {bg: '#4f9fb0', fg: '#f6ead6', frame: '#2f6f7a'}); at(cs, 0.9, 3.0, -5.85); g.add(cs);
    const ct = P.ctScanner('CT'); at(ct, 0.9, 0, -4.0, 0.42); g.add(ct);
    const cab = box(0.9, 1.6, 0.5, toon('#dfe8e6', {paint: {seed: 61}})); at(cab, -3.0, 0, -5.4); g.add(cab);
    const scr = box(0.9, 0.55, 0.06, '#2b2b33'); at(scr, 3.0, 1.6, -5.85); g.add(scr);
    const scrIn = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.45), new THREE.MeshBasicMaterial({color: '#7fb8d0'})); scrIn.position.set(3.0, 1.875, -5.81); g.add(scrIn);
    const doc = ch('doctor', {}, g, 2.35, -2.6, -0.3);
    const hero = ch('hero', {seed: 46}, g, -0.75, -2.0, 0.25);
    hero.act([{t: 0, pose: 'hold', expr: 'worried', action: 'tremble', dur: 0.8}, {t: E('ct') + 0.1, pose: 'point', expr: 'confused'},
      {t: E('tens') + 0.35, pose: 'armsUp', expr: 'shocked', action: 'tremble', dur: 1.5}]);
    doc.act([{t: 0, pose: 'present', expr: 'neutral'}, {t: E('ct') + 0.05, pose: 'present', expr: 'smug'},
      {t: E('tens') + 0.4, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.7}]);
    // banana avalanche
    const N = 560, r = rng(61), cx = -0.7, cz = -2.1, R = 1.45, H = 1.45;
    const av = P.bananaInstances(N); g.add(av.obj);
    const B = [];
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R;
      const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d * 0.8;
      const y = H * Math.pow(1 - (d / R) * (d / R), 0.75) + 0.05 + r() * 0.1;
      B.push({x, y, z, y0: y + 2.2 + r() * 1.6, t0: r() * 0.3, rot: [r() * 6, r() * 6, r() * 6], spin: (r() - 0.5) * 8});
    }
    fx(g, FX.dust([cx, 0.1, cz + 0.6], E('tens') + 0.45, {n: 10, size: 0.5, color: '#efe2a0'}), (t) => inShots(t, 6));
    fx(g, FX.dust([cx + 0.8, 0.1, cz + 0.2], E('tens') + 0.6, {n: 8, size: 0.45, color: '#efe2a0', seed: 9}), (t) => inShots(t, 6));
    updaters.push((t) => {
      const t0 = E('tens') + 0.05;
      for (let i = 0; i < N; i++) {
        const b = B[i], dt = t - t0 - b.t0;
        if (dt < 0) { av.set(i, [b.x, -5, b.z], b.rot, 0.0001); continue; }
        const y = Math.max(b.y, b.y0 - 0.5 * 22 * dt * dt);
        const landed = y <= b.y;
        av.set(i, [b.x, y, b.z], landed ? b.rot : [b.rot[0] + dt * b.spin, b.rot[1], b.rot[2] + dt * b.spin], 1.15);
      }
      av.done();
    });
  }

  // ---------- banana mountain (shot 7) ----------
  {
    const g = addLoc('mountain');
    g.add(ground(140, 140, '#b9b86a'));
    g.add(P.hills('#a8b060'));
    const MX = 0, MZ = -19, MR = 10.5, MH = 9.5;
    const core = new THREE.Mesh(new THREE.ConeGeometry(MR * 0.97, MH * 0.97, 48), toon('#d9b23a', {wear: false})); core.position.set(MX, MH * 0.97 / 2, MZ); g.add(core);
    const N = 3200, r = rng(71);
    const mt = P.bananaInstances(N, {hull: 0.08}); g.add(mt.obj);
    for (let i = 0; i < N; i++) {
      const y = MH * (1 - Math.sqrt(r())) * 0.98, a = r() * Math.PI * 2, rr = MR * (1 - y / MH) + 0.15;
      mt.set(i, [MX + Math.cos(a) * rr, y + 0.2, MZ + Math.sin(a) * rr], [r() * 6, r() * 6, r() * 6], 2.4 + r() * 1.2);
    }
    // smaller bananas spilling toward the camera
    const N2 = 260;
    mt.done();
    const sp = P.bananaInstances(N2); g.add(sp.obj);
    for (let i = 0; i < N2; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.6, d = MR + r() * 5.5; sp.set(i, [MX + Math.cos(a) * d * 1.1, 0.06 + r() * 0.15 * (1 - (d - MR) / 5.5), MZ - Math.sin(a) * d], [r() * 6, r() * 6, 0], 1.2 + r() * 0.8); }
    sp.done();
    for (const [x, z, s] of [[-6.5, -5, 11], [7, -6, 12], [-10, -10, 13], [11, -11, 14]]) { const tr = P.bananaTree({seed: s, h: 3}); at(tr, x, 0, z); g.add(tr); }
    const bs = new THREE.Group(); at(bs, 2.7, 0, -5.2, -0.2); g.add(bs);
    for (const s of [-1, 1]) { const p = cyl(0.08, 0.1, 2.6, '#7a5236'); at(p, s * 1.45, 0, 0); bs.add(p); }
    const msg = sign(L.millions, 2.7, 0.95, {bg: '#e0b84f', sub: L.millionsSub, frame: '#8a6a2a'}); at(msg, 0, 2.05, 0.05); bs.add(msg);
    const hero = ch('hero', {seed: 47}, g, -0.5, -1.25, 0.15);
    const sci = ch('scientist', {seed: 14}, g, 0.9, -1.45, -0.2);
    hero.act([{t: 0, pose: 'beg', expr: 'worried', action: 'tremble', dur: 1.2}, {t: E('relax') + 0.4, pose: 'idle', expr: 'neutral'},
      {t: E('dangerous') + 0.1, expr: 'worried', pose: 'hold'}, {t: E('millions') + 0.15, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.7},
      {t: E('impossible') + 0.12, pose: 'shrug', expr: 'laugh', action: 'shake', dur: 1.0}]);
    sci.act([{t: 0, pose: 'stop', expr: 'happy'}, {t: E('relax'), pose: 'stop', expr: 'happy', action: 'nod', dur: 0.8},
      {t: E('dangerous'), pose: 'pointUp', expr: 'smug'}, {t: E('millions') + 0.2, pose: 'presentBoth', expr: 'excited'},
      {t: E('impossible') + 0.1, pose: 'cross', expr: 'laugh', action: 'shake', dur: 0.8}]);
    updaters.push((t) => { bs.scale.setScalar(t < E('millions') ? 0.0001 : pop(t, E('millions') + 0.3, 0.4)); });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
