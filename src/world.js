// All locations in one scene at different x offsets. Story: "Misi beli telur" (shopping as a video game).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {home: 0, bakery: 40, aisle: 80, price: 140, spg: 180, kasir: 220};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'gamer' (new for this video; round no-sleep face, fringe hair, thick brows, medium torso, longer legs).
export const CHAR_DESIGN = 'gamer';
const CAST = {
  papa: {outfit: 'tshirt', jacket: '#4f7fa6', print: '#f2d24a', print2: '#d8413a', lower: '#c9a272', tie: '#4f7fa6', hair: '#2b2326', hat: 'none'},
  mama: {outfit: 'tshirt', jacket: '#e0809a', print: '#fff3df', print2: '#e0809a', lower: '#5a4a66', tie: '#e0809a', hair: '#3a2a26', hairStyle: 'bun', hat: 'none'},
  kid: {outfit: 'tshirt', jacket: '#7fb35a', print: '#f2d24a', print2: '#4f7fa6', lower: '#3f5f8a', tie: '#7fb35a', hair: '#3a2a26', hairStyle: 'tuft', hat: 'none'},
  baker: {jacket: '#f3efe6', lower: '#5a5a62', tie: '#d8413a', hair: '#3a2a26', hat: 'top', hatColor: '#fbf6ea', pocket: '#e8e4dc'},
  spg: {jacket: '#d8413a', lower: '#2b2b33', tie: '#f2d24a', hair: '#2b2326', hairStyle: 'bun', hat: 'cap', hatColor: '#d8413a', hatColor2: '#a82a2a', pocket: '#b83a32'},
  cashier: {jacket: '#3fa05a', lower: '#2b2b33', tie: '#f3efe6', hair: '#2b2326', hat: 'cap', hatColor: '#3fa05a', hatColor2: '#2a7a42', pocket: '#2f8a4a'},
};

// Lighting: a warm morning home, a bright cool supermarket (warm at the bakery), tense on the price trap,
// red-tinted final boss, sad on game over, joyful for the tips.
const store = {...LOOK_PRESETS.interiorCool, keyI: 2.6, hemiI: 1.5};
const homeDay = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
export const LOOK = {
  home: {keys: [{at: 0, ...homeDay}, {at: 'mustahil', ...homeDay, ...MOODS.tense}, {at: 'cut2', ...homeDay}, {at: 'cut9', ...homeDay},
    {at: 'mana', ...homeDay, ...MOODS.tense}, {at: 'gameover', ...homeDay, ...MOODS.sad}, {at: 'cut11', ...homeDay, ...MOODS.joyful}]},
  bakery: {keys: [{at: 0, ...LOOK_PRESETS.interiorWarm}, {at: 'wangi', ...LOOK_PRESETS.interiorWarm, ...MOODS.joyful}]},
  aisle: {...store},
  price: {keys: [{at: 0, ...store}, {at: 'padahal', ...store, ...MOODS.tense}]},
  spg: {keys: [{at: 0, ...store}, {at: 'senyum', ...store, ...MOODS.joyful}]},
  kasir: {keys: [{at: 0, ...store, ...MOODS.danger}, {at: 'permen', ...store}, {at: 'nyawa', ...store, ...MOODS.sad}]},
};

const under = (g, color) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

// Screen-level effects: flashes and shakes.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.misi, dur: 0.35, color: '#fff4d6', strength: 0.3},
      {t: EVt.lv1, dur: 0.3, color: '#ffe9b0', strength: 0.3}, {t: EVt.lv2, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.lv3, dur: 0.3, color: '#ffe9b0', strength: 0.3}, {t: EVt.lv4, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.final, dur: 0.4, color: '#ffb0a0', strength: 0.4},
      {t: EVt.hampir, dur: 0.3, color: '#ffd0c0', strength: 0.35},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.mustahil, dur: 0.3, amp: 0.015}, {t: EVt.final, dur: 0.35, amp: 0.02}, {t: EVt.nyawa, dur: 0.3, amp: 0.015}, {t: EVt.gameover, dur: 0.35, amp: 0.02}],
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
  const speak = (c, si, exprs = []) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).filter(([a, b]) => b - a > 0.05);
    c.act([...segs.map(([a, b]) => ({t: a, action: 'talk', dur: b - a})), ...exprs.map(([f, e, p]) => ({t: at0(f), expr: e, ...(p ? {pose: p} : {})}))]);
  };
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const walkPath = (c, keys) => {
    const rest = c.state.yaw0;
    for (let i = 0; i < keys.length - 1; i++) { const [a, x0, z0] = keys[i], [b, x1, z1] = keys[i + 1]; if (b - a > 0.05 && Math.hypot(x1 - x0, z1 - z0) > 0.2) c.act([{t: a, action: 'walk', dur: b - a}]); }
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
  const storeRoom = (g, w = 8, d = 7) => {
    under(g, '#2a2a30'); g.add(P.room(w, 3.4, d, {wall: '#eef0ee', floor: '#d8d4cc', wain: '#8fb0c0', tiles: true}));
    for (let i = -1; i <= 1; i++) { const l = box(1.6, 0.06, 0.3, new THREE.MeshBasicMaterial({color: '#fffbe8'}), {hull: 0}); at(l, i * 2.4, 3.2, -2.5); g.add(l); }
  };

  // ---------- home: the mission (shots 1-2), back with five bags (9-10), tips (11), question (12) ----------
  {
    const g = addLoc('home');
    under(g, '#2a2228');
    g.add(P.room(7, 3.2, 6, {wall: '#f0dcb8', floor: '#a87a52', wain: '#c98a5a'}));
    const door = box(1.0, 2.1, 0.08, toon('#7a4a32', {paint: {planks: 3, seed: 5}})); at(door, -2.4, 0, -4.85); g.add(door);
    const sofa = P.sofa('#6a8ab0'); at(sofa, -2.2, 0, -4.1); g.add(sofa);
    const clock = P.wallClock(0.28, {rim: '#d8413a'}); at(clock.group, 0.2, 2.45, -4.85); g.add(clock.group);
    const papa = ch('papa', {seed: 1}, g, -0.45, -2.3, 0.1);
    const mama = ch('mama', {seed: 2}, g, 0.75, -2.5, -0.15);
    const kid = ch('kid', {seed: 3, scale: 0.62}, g, -1.35, -2.4, 0.2);
    const note = P.banknote('50.000', {w: 0.3, color: '#6a96d6', dark: '#24488a'}); held(papa, note, {y: 0.02, z: 0.1});
    const noteM = P.banknote('50.000', {w: 0.3, color: '#6a96d6', dark: '#24488a'}); held(mama, noteM, {y: 0.02, z: 0.1});
    const paper = sign(L.eggs, 0.24, 0.16, {bg: '#fffaf0', fg: '#351f22', frame: '#e8e0d0', depth: 0.006, border: false}); held(mama, paper, {hand: 0, y: 0.0, z: 0.1});
    const paperP = sign(L.eggs, 0.24, 0.16, {bg: '#fffaf0', fg: '#351f22', frame: '#e8e0d0', depth: 0.006, border: false}); held(papa, paperP, {hand: 0, y: 0.0, z: 0.1});
    const tGive = E('modal') + 0.15;
    const mission = sign(L.mission, 1.7, 0.42, {bg: '#2b2b33', fg: '#f2d24a', frame: '#f2d24a'});
    const money = sign(L.money, 1.4, 0.34, {bg: '#6a96d6', fg: '#fff3df', frame: '#24488a'});
    const hard = sign(L.hard, 1.7, 0.36, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'});
    popSign(g, mission, 0, 2.95, -2.6, E('misi') - 0.1, cut(2), (t) => inShots(t, 1));
    popSign(g, money, -0.6, 2.5, -2.55, E('modal') - 0.1, cut(2), (t) => inShots(t, 1));
    popSign(g, hard, 0.35, 2.08, -2.5, E('sulit') - 0.1, cut(2), (t) => inShots(t, 1));
    // five bags when he comes home
    const bags = [0, 1, 2, 3, 4].map((i) => { const b = P.shopBag(['#f3efe6', '#e8c35a', '#e0626e', '#7fc4e8', '#f3efe6'][i]); g.add(b); return b; });
    held(papa, bags[0], {hand: 0, y: -0.38, z: 0.08}); held(papa, bags[1], {hand: 1, y: -0.38, z: 0.08});
    [[0.35, -1.85], [1.1, -1.95], [0.75, -1.55]].forEach(([x, z], i) => at(bags[i + 2], x, 0, z, 0.3 * i));
    // mama opens the bags: bread, snacks, sausages, chocolate, the 49.900 box... no eggs
    const loot = [P.loaf(0.5), ball(0.12, '#e8823a', {sy: 1.4, sz: 0.5, hull: 0.006}), box(0.26, 0.16, 0.08, '#c85a3a', {hull: 0.006}), box(0.12, 0.22, 0.04, '#6a3a2a', {hull: 0.004}), box(0.3, 0.26, 0.2, '#f2d24a', {hull: 0.006}), ball(0.12, '#d8413a', {sy: 1.4, sz: 0.5, hull: 0.006})];
    loot.forEach((o) => g.add(o));
    const tLoot = (i) => E('kantong') + 0.3 + i * 0.28;
    // tips: the shopping list on the table
    const table = box(1.4, 0.75, 0.8, toon('#b08454', {paint: {planks: 4, seed: 12}})); at(table, 2.1, 0, -2.4); g.add(table);
    const nb = P.notebook(L.list, {lines: L.listLines, cover: '#d8413a'}); at(nb, 2.15, 0.75, -2.3, -0.1); g.add(nb);
    const tray = P.eggTray(10); at(tray, 1.7, 0.75, -2.65); g.add(tray);
    [[L.tip1, 'daftar', '#4f7fa6'], [L.tip2, 'lapar2', '#e8823a'], [L.tip3, 'rak', '#3fa05a']].forEach(([txt, k, c], i) =>
      popSign(g, sign('✓ ' + txt, 1.25, 0.26, {bg: c, fg: '#fff3df', frame: '#351f22', depth: 0.03}), 2.1, 2.0 - i * 0.33, -2.6, E(k) - 0.05, cut(12), (t) => inShots(t, 11)));
    const q = sign(L.question, 1.5, 0.4, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'});
    const cm = sign(L.comment, 1.3, 0.4, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'});
    popSign(g, q, 0.1, 2.55, -2.6, E('levelBerapa') - 0.4, 1e9, (t) => inShots(t, 12));
    popSign(g, cm, 0.1, 3.0, -2.65, E('komentar') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.confetti([0.1, 2.9, -2.4], E('komentar') + 0.05), (t) => inShots(t, 12));
    fx(g, FX.glints([-0.45, 1.6, -2.2], E('misi'), {n: 22}), (t) => inShots(t, 1));
    papa.act([
      {t: 0, pose: 'hips', expr: 'determined'},
      {t: E('modal') + 0.05, pose: 'present', expr: 'smug'},
      {t: E('mustahil') + 0.05, pose: 'present', expr: 'grimace'},
      {t: cut(2), pose: 'hold', expr: 'neutral'},
      {t: cut(9), pose: 'idle', expr: 'cheesy'},
      {t: E('mana') - 0.1, pose: 'idle', expr: 'nervous'},
      {t: E('gameover') - 0.05, pose: 'limp', expr: 'cry'},
      {t: cut(11), pose: 'idle', expr: 'neutral'},
      {t: cut(12), pose: 'shrug', expr: 'confused'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy'},
    ]);
    speak(papa, 4, [[0, 'smug', 'hips'], [0.5, 'cheesy', 'point']]);
    mama.act([{t: 0, pose: 'present', expr: 'determined'}, {t: tGive - 0.1, pose: 'give', expr: 'smug'}, {t: tGive + 0.5, pose: 'idle', expr: 'neutral'}, {t: E('tenang') + 0.1, pose: 'hips', expr: 'thinking'}, {t: cut(9), pose: 'idle', expr: 'surprised'}, {t: E('kantong') + 0.2, pose: 'hold', expr: 'confused'},
      {t: E('gameover'), pose: 'facepalm', expr: 'annoyed'}, {t: cut(11), pose: 'idle', expr: 'happy'}, {t: cut(12), pose: 'wave', expr: 'happy'}]);
    speak(mama, 3, [[0, 'neutral', 'point'], [0.45, 'annoyed', 'stop']]);
    speak(mama, 25, [[0, 'annoyed', 'hips'], [0.4, 'irritated', 'hips']]);
    kid.act([{t: 0, pose: 'cheer', expr: 'excited'}, {t: cut(9), pose: 'carry', expr: 'cheesy'}, {t: cut(11), pose: 'idle', expr: 'happy'}, {t: cut(12), pose: 'wave', expr: 'toothy'}]);
    const kc = box(0.12, 0.22, 0.04, '#6a3a2a', {hull: 0.004}); held(kid, kc, {y: 0.0, z: 0.08});
    // the silent "..." beat
    const dots = P.glyph('...', 0.6, '#fff3df'); g.add(dots);
    updaters.push((t) => {
      const back = t >= cut(9);
      note.visible = paperP.visible = !back && t > tGive; noteM.visible = paper.visible = t < tGive;
      bags.forEach((b) => { b.visible = back && t < cut(11); });
      kc.visible = back && t < cut(11);
      loot.forEach((o, i) => { const u = (t - tLoot(i)) / 0.5, src = bags[2 + (i % 3)].position; o.visible = back && t < cut(11) && u > 0; const k = Math.min(1, Math.max(0, u)); o.position.set(src.x + (i % 3 - 1) * 0.25 * k, 0.4 + Math.sin(Math.PI * k) * 0.9 + (1 - k) * 0.0 - k * 0.3, src.z + 0.25 * k); o.rotation.z = k * 3; });
      dots.visible = inShots(t, 9) && t > T.S[25].end + 0.1; dots.position.set(-0.3, 2.35, -2.2);
      clock.set(back ? 11 : 8, back ? 45 : 0);
    });
  }

  // ---------- level 1: the bread trap by the entrance ----------
  {
    const g = addLoc('bakery');
    storeRoom(g);
    const frame = box(2.2, 2.4, 0.1, '#c9ccd0'); at(frame, -2.6, 0, -4.8); g.add(frame);
    const doors = [-1, 1].map((sd) => { const d = box(0.98, 2.2, 0.04, new THREE.MeshBasicMaterial({color: '#cfe8f6', transparent: true, opacity: 0.6}), {hull: 0.01}); at(d, -2.6 + sd * 0.5, 0.02, -4.7); g.add(d); return {d, sd}; });
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.2), new THREE.MeshBasicMaterial({color: '#bfe2f6'})); at(outside, -2.6, 1.1, -4.78); g.add(outside);
    updaters.push((t) => doors.forEach(({d, sd}) => { const k = smooth((t - cut(3) - 0.05) / 0.5) * (1 - smooth((t - E('roti') - 0.6) / 0.6)); d.position.x = -2.6 + sd * (0.5 + 0.9 * k); }));
    const counter = box(2.6, 1.0, 0.8, toon('#c9935a', {paint: {planks: 5, seed: 31}})); at(counter, 0.9, 0, -2.9); g.add(counter);
    for (let i = 0; i < 6; i++) { const lf = P.loaf(0.9); at(lf, 0.3 + (i % 3) * 0.45, 1.02, -3.05 + Math.floor(i / 3) * 0.3, 0.3 * i); g.add(lf); }
    const oven = box(1.4, 1.6, 0.8, toon('#5a5a62', {wear: false})); at(oven, 1.0, 0, -4.4); g.add(oven);
    const ovenGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshBasicMaterial({color: '#ffa84a'})); at(ovenGlow, 1.0, 0.9, -3.98); g.add(ovenGlow);
    const bs = sign(L.bakery, 1.6, 0.4, {bg: '#e8a83a', fg: '#351f22', frame: '#8a5a2a'}); at(bs, 0.9, 2.6, -4.0); g.add(bs);
    const fl = FX.fireLight([1.0, 1.2, -3.6], {intensity: 1.6, dist: 6}); g.add(fl.obj); updaters.push((t) => fl.update(t));
    const baker = ch('baker', {seed: 11}, g, 1.1, -3.65, 0);
    const papa = ch('papa', {seed: 1}, g, -2.6, -2.2, 0);
    walkPath(papa, [[cut(3), -2.4, -3.4], [E('roti') + 0.4, -1.0, -2.1], [E('wangi') - 0.1, -1.0, -2.1], [E('lapar') + 0.2, -0.45, -2.0]]);
    // the aroma: golden wisps drifting from the counter to his nose
    fx(g, FX.smoke([0.5, 1.4, -2.6], E('wangi') - 0.2, {n: 14, every: 0.18, life: 1.6, size: 0.28, rise: 0.3, drift: -0.9, color: '#ffd890', opacity: 0.55}), (t) => inShots(t, 3));
    const bread = P.loaf(0.5); held(papa, bread, {y: 0.02, z: 0.1}); showWhen(bread, (t) => t > E('satuRoti') + 0.1);
    papa.act([
      {t: cut(3), pose: 'idle', expr: 'determined'},
      {t: E('panggang') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('wangi') + 0.1, pose: 'idle', expr: 'drowsy'},
      {t: E('lapar') + 0.1, pose: 'idle', expr: 'cheesy'},
    ]);
    speak(papa, 8, [[0, 'scheming', 'hold'], [0.55, 'toothy', 'eat']]);
    baker.act([{t: 0, pose: 'presentBoth', expr: 'cheesy'}, {t: E('lapar'), pose: 'present', expr: 'scheming'}]);
  }

  // ---------- level 2: the snack aisle, as long as a toll road ----------
  {
    const g = addLoc('aisle');
    under(g, '#d8d4cc');
    const floor = box(70, 0.02, 8, toon('#d8d4cc', {paint: {seed: 41}}), {edges: false}); at(floor, 25, -0.02, -1.5); g.add(floor);
    const row = P.shelfRow(48, {seed: 23, bags: true}); at(row, -4, 0, -3.0); g.add(row);
    const wallB = box(70, 3.4, 0.2, '#eef0ee', {edges: false}); at(wallB, 25, 0, -3.6); g.add(wallB);
    const ceil = box(70, 0.1, 6, '#e8e8ea', {edges: false}); at(ceil, 25, 3.4, -1); g.add(ceil);
    for (let i = 0; i < 12; i++) { const l = box(1.4, 0.05, 0.3, new THREE.MeshBasicMaterial({color: '#fffbe8'}), {hull: 0}); at(l, i * 4, 3.3, -1.4); g.add(l); }
    const tol = sign(L.tol, 1.8, 0.5, {bg: '#2f7a42', fg: '#fff3df', frame: '#fff3df'}); at(tol, 2.4, 2.8, -1.6, -0.5); g.add(tol);
    const km = sign(L.km + ' →', 1.6, 0.34, {bg: '#2f7a42', fg: '#fff3df', frame: '#fff3df'}); at(km, 2.4, 2.35, -1.6, -0.5); g.add(km);
    const eggSign = sign(L.eggs, 1.4, 0.5, {bg: '#f2d24a', fg: '#351f22', frame: '#8a6a2a'}); at(eggSign, 36, 2.5, -2.0, -0.6); g.add(eggSign);
    const chips = [0, 1, 2, 3, 4, 5, 6].map((i) => { const b = new THREE.Group(); const body = ball(0.22, ['#d8413a', '#f2d24a', '#4f8fc8', '#e8823a', '#7fa35a', '#9a6fb0', '#e0626e'][i], {sy: 1.35, sz: 0.45, hull: 0.01}); body.position.y = 0.3; b.add(body);
      const lab = sign('KRIPIK', 0.3, 0.1, {bg: '#fff3df', fg: '#d8413a', frame: '#fff3df', depth: 0.005, border: false}); at(lab, 0, 0.32, 0.1); b.add(lab); at(b, 1.0 + i * 1.3, 0.62 + (i % 2) * 0.55, -2.45); g.add(b); return b; });
    updaters.push((t) => chips.forEach((b, i) => { b.rotation.z = Math.sin(t * 5 + i * 1.3) * 0.35; b.position.y = 0.62 + (i % 2) * 0.55 + Math.abs(Math.sin(t * 5 + i * 1.3)) * 0.04; }));
    const papa = ch('papa', {seed: 1}, g, 0.2, -1.6, 0.3);
    walkPath(papa, [[cut(4), 0.2, -1.6], [E('lorong'), 1.4, -1.6], [cut(5), 3.0, -1.6]]);
    const bag = P.shopBag('#f3efe6'); held(papa, bag, {hand: 0, y: -0.38, z: 0.08});
    papa.act([{t: cut(4), pose: 'idle', expr: 'determined'}, {t: E('ujung') + 0.1, pose: 'point', expr: 'surprised'}, {t: E('lorong') + 0.1, pose: 'idle', expr: 'tired'},
      {t: E('tol') + 0.05, pose: 'headHold', expr: 'shocked'}]);
  }

  // ---------- level 3: the price illusion ----------
  {
    const g = addLoc('price');
    storeRoom(g);
    const sh = P.shelfRow(5, {seed: 25}); at(sh, -2.5, 0, -3.4); g.add(sh);
    const tag = P.priceTag('Rp49', '.900'); at(tag, 0.6, 1.65, -2.6); g.add(tag);
    const glow = P.glowSprite('#ffe08a', 2.0); at(glow, 0.6, 1.65, -2.7); g.add(glow);
    updaters.push((t) => { glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 6); glow.scale.setScalar(1.8 + 0.2 * Math.sin(t * 6)); });
    const err = sign('ERROR!', 0.7, 0.24, {bg: '#d8413a', fg: '#fff3df', frame: '#351f22', depth: 0.03});
    popSign(g, err, -1.05, 2.0, -1.85, E('ribuan') - 0.1, E('padahal') - 0.05);
    const papa = ch('papa', {seed: 1}, g, -0.6, -2.0, 0.2);
    const brain = sign(L.brain, 0.9, 0.36, {bg: '#fff3df', fg: '#4f7fa6', frame: '#4f7fa6'});
    const real = sign(L.real, 1.5, 0.4, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'});
    popSign(g, brain, -0.6, 2.45, -1.9, E('otak') + 0.1, E('padahal') - 0.05);
    updaters.push((t) => { if (t > E('ribuan') - 0.1 && t < E('padahal')) { const j = Math.sin(t * 47) > 0.6; brain.position.x = -0.6 + (j ? 0.03 : 0); } });
    popSign(g, real, -0.25, 2.5, -1.9, E('padahal') + 0.1);
    const bubbles = [0, 1].map((i) => { const b = ball(0.05 + i * 0.03, '#fff3df', {hull: 0.006}); at(b, -0.45 + i * 0.08, 2.05 + i * 0.13, -1.9); g.add(b); return b; });
    updaters.push((t) => bubbles.forEach((b) => { b.visible = t > E('otak') && t < E('padahal') - 0.05; }));
    const item = box(0.34, 0.3, 0.22, '#f2d24a', {hull: 0.006}); held(papa, item, {y: 0.0, z: 0.1}); showWhen(item, (t) => t > E('hampir') + 0.3);
    papa.act([{t: cut(5), pose: 'point', expr: 'thinking'}, {t: E('label') + 0.1, pose: 'point', expr: 'happy'}, {t: E('otak') + 0.1, pose: 'chin', expr: 'smug'},
      {t: E('padahal') + 0.05, pose: 'headHold', expr: 'shocked'}, {t: E('hampir') + 0.3, pose: 'hold', expr: 'nervous'}]);
    fx(g, FX.glints([0.6, 1.65, -2.5], E('label'), {n: 18}), (t) => inShots(t, 5));
  }

  // ---------- level 4: the sausage-sample boss ----------
  {
    const g = addLoc('spg');
    storeRoom(g);
    const sh = P.shelfRow(6, {seed: 26}); at(sh, -3, 0, -4.2); g.add(sh);
    const booth = box(1.3, 0.95, 0.6, toon('#d8413a', {paint: {seed: 51}})); at(booth, 0.7, 0, -2.6); g.add(booth);
    const bs = sign(L.spg, 1.1, 0.34, {bg: '#f2d24a', fg: '#d8413a', frame: '#8a2a2a'}); at(bs, 0.7, 0.55, -2.28); g.add(bs);
    const plate = P.sausagePlate(); at(plate, 0.45, 0.95, -2.6); g.add(plate);
    const packs = [0, 1].map((i) => { const p = box(0.26, 0.16, 0.08, '#c85a3a', {hull: 0.006}); at(p, 0.95 + i * 0.05, 0.95, -2.7 + i * 0.1); g.add(p); return p; });
    const spg = ch('spg', {seed: 12}, g, 0.85, -3.25, -0.1);
    const papa = ch('papa', {seed: 1}, g, -0.65, -2.1, 0.2);
    const stick = cyl(0.025, 0.025, 0.07, '#c85a3a', {hull: 0.004, center: true}); held(papa, stick, {y: 0.0, z: 0.1, rz: Math.PI / 2}); showWhen(stick, (t) => t > E('tester') + 0.3 && t < E('yaudah'));
    [0, 1].forEach((i) => { const p = box(0.26, 0.16, 0.08, '#c85a3a', {hull: 0.006}); held(papa, p, {hand: i, y: -0.02, z: 0.1}); showWhen(p, (t) => t > E('dua') + 0.15); });
    spg.act([{t: cut(6), pose: 'present', expr: 'cheesy'}, {t: E('tester') + 0.1, pose: 'give', expr: 'toothy'}, {t: E('senyum'), pose: 'present', expr: 'cheesy'},
      {t: E('nggakEnak'), pose: 'hips', expr: 'scheming'}, {t: E('dua') + 0.1, pose: 'cheer', expr: 'excited'}]);
    papa.act([{t: cut(6), pose: 'idle', expr: 'determined'}, {t: E('tester') + 0.3, pose: 'eat', expr: 'happy'}, {t: E('senyum') + 0.1, pose: 'eat', expr: 'cheesy'},
      {t: E('nggakEnak') + 0.05, pose: 'idle', expr: 'nervous'}]);
    speak(papa, 18, [[0, 'nervous', 'shrug'], [0.6, 'grimace', 'hold']]);
    updaters.push((t) => packs.forEach((p) => { p.visible = t < E('dua') + 0.1; }));
  }

  // ---------- final boss: the checkout candy rack ----------
  {
    const g = addLoc('kasir');
    storeRoom(g);
    const counter = box(2.4, 0.9, 0.7, toon('#3a4048', {wear: false})); at(counter, 0.9, 0, -3.1); g.add(counter);
    const belt = box(1.8, 0.04, 0.5, '#2b2b33'); at(belt, 0.7, 0.9, -3.1); g.add(belt);
    const ks = sign(L.kasir, 1.2, 0.36, {bg: '#3fa05a', fg: '#fff3df', frame: '#2a7a42'}); at(ks, 0.9, 2.6, -3.4); g.add(ks);
    const rack = P.candyRack(); at(rack, -1.45, 0, -2.4, 0.4); g.add(rack);
    const cashier = ch('cashier', {seed: 13}, g, 1.3, -3.85, -0.1);
    const papa = ch('papa', {seed: 1}, g, -0.35, -2.0, 0.1);
    const kid = ch('kid', {seed: 3, scale: 0.62}, g, -0.95, -1.75, 0.3);
    const choco = box(0.12, 0.22, 0.04, '#6a3a2a', {hull: 0.004}); held(kid, choco, {y: 0.0, z: 0.08}); showWhen(choco, (t) => t > E('coklat2') + 0.2);
    const bag = P.shopBag('#e8c35a'); held(papa, bag, {hand: 0, y: -0.38, z: 0.08});
    papa.act([{t: cut(7), pose: 'idle', expr: 'tired'}, {t: E('anak') + 0.1, pose: 'idle', expr: 'worried'}, {t: E('coklat2'), pose: 'facepalm', expr: 'cry'},
      {t: E('nyawa') - 0.05, pose: 'limp', expr: 'tired'}]);
    cashier.act([{t: 0, pose: 'idle', expr: 'smug'}, {t: E('permen'), pose: 'present', expr: 'scheming'}]);
    kid.act([{t: cut(7), pose: 'idle', expr: 'neutral'}, {t: E('anak') + 0.05, pose: 'point', expr: 'scheming'}]);
    speak(kid, 22, [[0, 'cheesy', 'beg'], [0.5, 'excited', 'point'], [0.85, 'toothy', 'beg']]);
    fx(g, FX.glints([-1.45, 1.3, -2.2], E('permen'), {n: 22}), (t) => inShots(t, 7));
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
