// All locations in one scene at different x offsets. Story: "Hidup 500 tahun / Living to 500".
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, pop, smooth, INK, rng} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {street: 0, party: 40, campus: 80, house: 120, reunion: 160, office: 200, earth: 240, warung: 280, park: 320};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look for this story (palette overrides on top of char.js PALETTES). Design: 'lanky' (new for this video;
// round no-sleep face, side-swept hair, thin brows, longer legs, slimmer limbs).
export const CHAR_DESIGN = 'lanky';
const CAST = {
  hero: {jacket: '#4f8fc8', lower: '#34495e', tie: '#f2d24a', hair: '#3a2a26', hat: 'none', hairStyle: 'side', pocket: '#3f78ad'},
  guestA: {jacket: '#d9774a', lower: '#4a4a5a', tie: '#2f5f5a', hair: '#2b2326', hat: 'none', hairStyle: 'fringe', pocket: '#b85a3a'},
  guestB: {jacket: '#7fa35a', lower: '#5a4a3a', tie: '#e8c35a', hair: '#6a3a2a', hat: 'none', hairStyle: 'tuft', pocket: '#6a8a4a'},
  prof: {jacket: '#8a6a8a', lower: '#3a3a42', tie: '#e8c35a', hair: '#e8e4dc', hat: 'none', hairStyle: 'bald', glasses: true, pocket: '#6a4a6a'},
  sales: {jacket: '#d9a441', lower: '#4a3a2a', tie: '#d8413a', hair: '#2b2326', hat: 'none', hairStyle: 'fringe', pocket: '#b8862a'},
  boss: {jacket: '#3a3a48', lower: '#2a2a32', tie: '#d8413a', hair: '#2b2326', hat: 'none', hairStyle: 'tuft', glasses: true, pocket: '#2a2a36'},
  grandpa: {jacket: '#a8784a', lower: '#5a5a62', tie: '#5a8a6a', hair: '#f1eee8', hat: 'none', hairStyle: 'bald', glasses: true, pocket: '#8a5a3a'},
  seller: {jacket: '#f3efe6', lower: '#c75b5b', tie: '#d9774a', hair: '#3a2a26', hat: 'none', hairStyle: 'tuft', pocket: '#e0d8c8'},
  kid: {jacket: '#f2d24a', lower: '#4f7fa6', tie: '#d8413a', hair: '#3a2a26', hat: 'none', hairStyle: 'fringe', pocket: '#d8b43a'},
};
// palettes for the crowds (reunion descendants, the fight over food)
const CROWD = [
  {jacket: '#c75b5b', lower: '#4a3a3a', tie: '#f2d24a', hair: '#2b2326', hairStyle: 'fringe'},
  {jacket: '#5a9a8a', lower: '#3d5a52', tie: '#d9774a', hair: '#6a3a2a', hairStyle: 'side'},
  {jacket: '#9a6fb0', lower: '#3a3a4a', tie: '#e8c35a', hair: '#3a2a26', hairStyle: 'tuft'},
  {jacket: '#e8a83a', lower: '#5a4a3a', tie: '#4f7fa6', hair: '#2b2326', hairStyle: 'side'},
  {jacket: '#6a8ac8', lower: '#2f3a4a', tie: '#d8413a', hair: '#5a3a2a', hairStyle: 'fringe'},
  {jacket: '#8aa36a', lower: '#5a5a42', tie: '#c75b5b', hair: '#3a2a26', hairStyle: 'tuft'},
  {jacket: '#d98aa0', lower: '#4a3a4a', tie: '#5a9a8a', hair: '#2b2326', hairStyle: 'side'},
  {jacket: '#b0906a', lower: '#3a3a3a', tie: '#4f7fa6', hair: '#d8d4cc', hairStyle: 'bald', glasses: true},
].map((p) => ({hat: 'none', pocket: p.jacket, ...p}));

// Lighting plan (camera_plan.md): a bright street day that turns tense on "wait"; a warm party room; a cool classroom;
// a sunny house with a joyful sales pitch; a golden schoolyard reunion; a cool office going tense; Earth in space
// turning dangerous; a hot street crowd; a dusty warung at sunset-ish; a golden park for the lesson and the question.
const street = {...LOOK_PRESETS.day, keyPos: [-8, 12, 10]};
const party = {...LOOK_PRESETS.interiorWarm, keyPos: [-4, 8, 8]};
const classroom = {...LOOK_PRESETS.interiorCool, keyPos: [-4, 8, 8]};
const office = {...LOOK_PRESETS.interiorCool, keyI: 2.2, keyPos: [-4, 8, 8]};
const space = {...LOOK_PRESETS.night, moon: false, fog: '#0b1020', near: 30, far: 90, skyTop: '#05070f', skyBottom: '#141c34', key: '#fff2dc', keyI: 2.4, hemiI: 0.8, keyPos: [-8, 6, 8]};
const golden = {...LOOK_PRESETS.goldenHour, keyPos: [-9, 6, 8]};

export const LOOK = {
  street: {keys: [{at: 0, ...street, ...MOODS.joyful}, {at: 'tunggu', ...street, ...MOODS.tense}, {at: 'cut7', ...LOOK_PRESETS.desert, ...MOODS.danger}]},
  party: {keys: [{at: 0, ...party, ...MOODS.joyful}]},
  campus: {keys: [{at: 0, ...classroom}, {at: 'skripsi', ...classroom, ...MOODS.tense}]},
  house: {keys: [{at: 0, ...street}, {at: 'cicilan', ...street, ...MOODS.joyful}]},
  reunion: {keys: [{at: 0, ...golden}, {at: 'generasi', ...golden, ...MOODS.joyful}]},
  office: {keys: [{at: 0, ...office}, {at: 'kakek', ...office, ...MOODS.tense}]},
  earth: {keys: [{at: 0, ...space}, {at: 'penuh', ...space, ...MOODS.danger}]},
  warung: {keys: [{at: 0, ...LOOK_PRESETS.sunset, keyPos: [-8, 7, 8]}]},
  park: {keys: [{at: 0, ...golden}, {at: 'manfaat', ...golden, ...MOODS.joyful}]},
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
      {t: EVt.lima + 0.05, dur: 0.35, color: '#ffe9a0', strength: 0.4},
      {t: EVt.setengah, dur: 0.3, color: '#d8ffb0', strength: 0.3},
      {t: EVt.cicilan, dur: 0.35, color: '#ffe9a0', strength: 0.35},
      {t: EVt.generasi, dur: 0.35, color: '#ffe9b0', strength: 0.4},
      {t: EVt.penuh, dur: 0.4, color: '#ff8a6a', strength: 0.45},
      {t: EVt.manfaat, dur: 0.35, color: '#ffe9a0', strength: 0.35},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.tunggu, dur: 0.3, amp: 0.015}, {t: EVt.skripsi + 0.1, dur: 0.45, amp: 0.035}, {t: EVt.telat, dur: 0.3, amp: 0.02},
      {t: EVt.penuh, dur: 0.5, amp: 0.035}, {t: EVt.rebutan, dur: 0.4, amp: 0.025}],
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
  // Dialogue: the speaker's mouth moves only while the voice is audible (voiced segments from the audio) and the
  // face changes through the line: exprs = [[fraction of the sentence, expression, pose?], ...]. from: only talk after t.
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
  const bubble = (g, x, y, z, r = 0.5) => {
    const grp = new THREE.Group(); at(grp, x, y, z); g.add(grp);
    const b = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({color: '#fff3df'})); grp.add(b);
    const rim = new THREE.Mesh(new THREE.CircleGeometry(r + 0.04, 32), new THREE.MeshBasicMaterial({color: INK})); rim.position.z = -0.02; grp.add(rim);
    for (const [dx, dy, rr] of [[-r * 0.55, -r * 1.05, 0.09], [-r * 0.8, -r * 1.4, 0.06]]) {
      const d = new THREE.Mesh(new THREE.CircleGeometry(rr, 16), new THREE.MeshBasicMaterial({color: '#fff3df'})); d.position.set(dx, dy, 0); grp.add(d);
      const dr = new THREE.Mesh(new THREE.CircleGeometry(rr + 0.03, 16), new THREE.MeshBasicMaterial({color: INK})); dr.position.set(dx, dy, -0.02); grp.add(dr);
    }
    return grp;
  };
  const town = (g, seed0 = 0, ground0 = '#c8ad86', paint = {cobbles: true}) => {
    g.add(ground(60, 60, ground0, paint));
    g.add(P.hills('#9cb46a'));
    for (const [x, z, s, c] of [[-6.5, -8, 4, '#e6c99a'], [6.5, -8.5, 6, '#cbb490'], [-11, -3, 7, '#d6bd94'], [12, -4, 8, '#c9d8c0']]) { const h = P.house(4, 2.8, 3, {seed: s + seed0, color: c, roof: '#8a5a3a'}); at(h, x, 0, z, x < 0 ? 0.45 : -0.45); g.add(h); }
    for (const [x, z, s] of [[-3, -12, 1], [2, -13, 2], [9, -12, 3], [-9, -11, 5]]) { const tr = P.tree({seed: s + seed0}); at(tr, x, 0, z); g.add(tr); }
  };

  // ---------- street: imagine 500 years (shot 1); the fight for food, water and housing (shot 7b) ----------
  {
    const g = addLoc('street');
    town(g);
    const lamp = P.streetLamp(); at(lamp, -2.6, 0, -3.6); g.add(lamp);
    const ban = P.banner(L.big500, 2.6, 0.8, {poleH: 3.3, bg: '#4f8fc8', frame: '#2a4a6a'}); at(ban, 0.2, 0, -5.6); g.add(ban);
    const hero = ch('hero', {seed: 1}, g, 0, -2.6, 0);
    walkPath(hero, [[0, -2.6, -2.3], [E('lima') - 0.2, 0, -2.6]]);
    hero.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: E('lima') + 0.1, pose: 'armsUp', expr: 'excited', action: 'jump', dur: 0.6},
      {t: E('enak') + 0.1, pose: 'cheer', expr: 'cheesy', action: 'hop', dur: 0.8},
      {t: E('tunggu') + 0.05, pose: 'stop', expr: 'grimace', action: 'tremble', dur: 0.6},
    ]);
    fx(g, FX.confetti([0.2, 3.2, -5.2], E('lima') + 0.05), (t) => inShots(t, 1));
    // shot 7b: a crowd fighting over food, water and housing
    const st = P.stall(L.food, {awning: '#c75b5b', signBg: '#f2d24a'}); at(st, -0.4, 0, -4.4); g.add(st);
    const sacks = []; for (let i = 0; i < 3; i++) { const s = P.sack(null, {scale: 0.6, color: '#d8c49a'}); at(s, -1.0 + i * 0.55, 0.85, -4.45); g.add(s); sacks.push(s); }
    const water = P.barrel({}); at(water, 1.7, 0, -3.6); g.add(water);
    const wsign = sign(L.water, 0.8, 0.32, {bg: '#8fd0ef', frame: '#3a6a8a'}); at(wsign, 1.7, 1.15, -3.25); g.add(wsign);
    const fullS = sign(L.full, 1.1, 0.42, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'}); at(fullS, -6.0, 2.1, -6.2, 0.45); g.add(fullS);
    const crowd = [[-1.6, -2.8, 0.35], [-0.5, -3.3, 0.1], [0.6, -2.7, -0.15], [1.2, -3.9, -0.3], [-1.1, -3.9, 0.2], [2.3, -2.9, -0.4]].map(([x, z, y], i) => ch('hero', {...CROWD[i], seed: 70 + i}, g, x, z, y));
    const grab = [
      [{t: 0, pose: 'carry', expr: 'angry'}, {t: E('makanan') + 0.1, pose: 'point', expr: 'furious', action: 'shake', dur: 0.6}, {t: E('rebutan') + 0.1, pose: 'armsUp', expr: 'scream', action: 'jump', dur: 0.6}],
      [{t: 0, pose: 'carryBoth', expr: 'gritted'}, {t: E('makanan') + 0.2, pose: 'hold', expr: 'angry', action: 'tremble', dur: 0.8}, {t: E('rebutan') + 0.15, pose: 'carryBoth', expr: 'furious', action: 'shake', dur: 0.6}],
      [{t: 0, pose: 'point', expr: 'irritated'}, {t: E('air') + 0.1, pose: 'carry', expr: 'angry', action: 'hop', dur: 0.5}, {t: E('rebutan') + 0.2, pose: 'headHold', expr: 'grimace'}],
      [{t: 0, pose: 'armsUp', expr: 'scream'}, {t: E('tinggal') + 0.1, pose: 'point', expr: 'furious', action: 'jump', dur: 0.5}],
      [{t: 0, pose: 'hips', expr: 'annoyed'}, {t: E('air') + 0.2, pose: 'cross', expr: 'gritted', action: 'shake', dur: 0.6}, {t: E('rebutan') + 0.1, pose: 'armsUp', expr: 'angry'}],
      [{t: 0, pose: 'carry', expr: 'worried'}, {t: E('air') + 0.15, pose: 'carryBoth', expr: 'grimace', action: 'tremble', dur: 0.8}, {t: E('rebutan') + 0.15, pose: 'headHold', expr: 'scream', action: 'jump', dur: 0.5}],
    ];
    crowd.forEach((c, i) => c.act(grab[i]));
    [[0, -4.4], [3, 4.6], [5, 5.0]].forEach(([i, x0]) => { const [x, z] = [[-1.6, -2.8], 0, 0, [1.2, -3.9], 0, [2.3, -2.9]][i]; walkPath(crowd[i], [[E('makanan') - 0.3, x0, z + 0.3], [E('makanan') + 0.7, x, z]], {run: true}); });
    held(crowd[1], P.loaf(1.2), {y: -0.02});
    held(crowd[5], P.waterGlass(), {y: 0.02});
    fx(g, FX.dust([0, 0.2, -3.2], E('rebutan')), (t) => inShots(t, 7));
    updaters.push((t) => {
      const s1 = inShots(t, 1), s7 = inShots(t, 7);
      hero.group.visible = s1; ban.visible = s1; ban.scale.setScalar(s1 ? pop(t, E('lima') - 0.1, 0.4) : 1);
      st.visible = water.visible = wsign.visible = fullS.visible = s7; sacks.forEach((k) => { k.visible = s7; });
      crowd.forEach((c) => { c.group.visible = s7; });
      wsign.scale.setScalar(pop(t, E('air') - 0.05, 0.35)); fullS.scale.setScalar(pop(t, E('tinggal') - 0.05, 0.35));
    });
  }

  // ---------- party room: the 250th birthday (shot 2) ----------
  {
    const g = addLoc('party');
    under(g, '#3a3036');
    g.add(P.room(8, 3.6, 7, {wall: '#f3d2c2', floor: '#a8784a', wain: '#c97aa8'}));
    const table = box(1.3, 0.72, 0.8, toon('#f3efe6', {paint: {stripes: {n: 6, color: '#f3c8d8'}, seed: 21}})); at(table, 0.55, 0, -3.2); g.add(table);
    const ck = P.cake(L.cake); at(ck.group, 0.55, 0.72, -3.2); ck.group.scale.setScalar(0.85); g.add(ck.group);
    const bannerS = sign(L.party, 2.4, 0.55, {bg: '#c97aa8', fg: '#fff3df', frame: '#7a3a5a'}); at(bannerS, -0.9, 2.8, -5.82); g.add(bannerS);
    const bar = P.lifeBar(L.life, 1.5, 0.5); at(bar.group, 1.9, 2.15, -5.8); g.add(bar.group);
    for (const [x, y, c] of [[-3.2, 2.5, '#d8413a'], [-2.7, 2.8, '#4f8fc8'], [3.1, 2.6, '#f2d24a'], [2.6, 2.95, '#7fa35a'], [-3.4, 3.0, '#c97aa8']]) {
      const b = ball(0.22, toon(c, {wear: false}), {sy: 1.2, hull: 0.01}); at(b, x, y, -5.4); g.add(b);
      const s = cyl(0.006, 0.006, y - 1.2, INK, {hull: 0}); at(s, x, 1.0, -5.4); g.add(s);
    }
    const hero = ch('hero', {seed: 2}, g, -0.55, -3.0, 0.15);
    const gA = ch('guestA', {seed: 22}, g, -2.0, -3.9, 0.35);
    const gB = ch('guestB', {seed: 23}, g, 2.1, -4.0, -0.35);
    hero.act([{t: 0, pose: 'presentBoth', expr: 'happy'}, {t: E('dua') + 0.1, pose: 'cheer', expr: 'cheesy', action: 'hop', dur: 0.6}, {t: E('muda') + 0.1, pose: 'hips', expr: 'proud'}]);
    speak(hero, 4, [[0, 'smug', 'hips'], [0.22, 'happy', 'shrug'], [0.5, 'cheesy', 'point'], [0.78, 'toothy', 'cheer']]);
    gA.act([{t: 0, pose: 'cheer', expr: 'laugh'}, {t: E('muda') + 0.15, pose: 'point', expr: 'surprised'}, {t: E('setengah') + 0.2, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.5}]);
    gB.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('dua') + 0.2, pose: 'armsUp', expr: 'toothy', action: 'hop', dur: 0.6}, {t: E('setengah') + 0.15, pose: 'facepalm', expr: 'confused'}]);
    fx(g, FX.confetti([0.4, 3.0, -3.4], E('dua') + 0.05), (t) => inShots(t, 2));
    fx(g, FX.glints([1.9, 2.15, -5.6], E('setengah'), {n: 20, color: '#d8ffb0'}), (t) => inShots(t, 2));
    updaters.push((t) => {
      ck.flames.forEach((f, i) => { f.scale.set(1, 1 + 0.25 * Math.sin(t * 14 + i * 2), 1); });
      bar.group.scale.setScalar(pop(t, E('setengah') - 0.1, 0.35));
      bar.set(0.5 * smooth((t - E('setengah') + 0.05) / 0.6));
      bannerS.scale.setScalar(pop(t, E('dua') - 0.1, 0.35));
    });
  }

  // ---------- classroom: decades of college, the wardrobe-thick thesis (shot 3) ----------
  {
    const g = addLoc('campus');
    under(g, '#3a3036');
    g.add(P.room(9, 3.8, 7, {wall: '#d6e2d4', floor: '#9a7a5a', wain: '#6a8a7a'}));
    const board = P.chalkboard(2.6, 1.3); at(board, -0.9, 1.9, -5.85); g.add(board);
    const bt = sign(L.campus, 2.0, 0.45, {bg: '#2f4a3a', fg: '#f3efe6', frame: '#2f4a3a', border: false}); at(bt, -0.9, 2.05, -5.8); g.add(bt);
    const dk = P.desk(); at(dk, -0.3, 0, -3.3); g.add(dk);
    const stacks = []; for (let i = 0; i < 6; i++) { const s = P.bookStack(6, 30 + i); at(s, -0.9 + (i % 3) * 0.42, 0.77 + Math.floor(i / 3) * 0.42, -3.3 + (i % 2) * 0.05); g.add(s); stacks.push(s); }
    const hero = ch('hero', {seed: 3}, g, -0.3, -2.55, 0.05);
    const prof = ch('prof', {seed: 31}, g, -2.4, -4.6, 0.4);
    walkPath(hero, [[cut(3), -2.4, -2.3], [cut(3) + 2.0, -0.3, -2.55], [E('skripsi') - 0.14, -0.3, -2.55], [E('skripsi') - 0.13, 0.5, -2.6]]);
    const carried = held(hero, P.bookStack(4, 37), {y: 0.05, z: 0.12});
    const book = P.bigBook(L.thesis, 0.95, 1.9, 1.0); at(book, 1.45, 0, -3.7, -0.25); g.add(book);
    const ward = P.wardrobe('#9a6a4a', 1.0, 1.9, 0.6); at(ward, 2.75, 0, -4.0, -0.25); g.add(ward);
    hero.act([
      {t: 0, pose: 'hold', expr: 'tired', action: 'slump', dur: 1.5},
      {t: cut(3) + 2.1, pose: 'carryBoth', expr: 'tired'},
      {t: E('ilmu') + 0.1, pose: 'headHold', expr: 'grimace', action: 'tremble', dur: 0.6},
      {t: E('skripsi') + 0.15, pose: 'armsUp', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('lemari') + 0.1, pose: 'present', expr: 'nervous'},
    ]);
    prof.act([{t: 0, pose: 'point', expr: 'smug'}, {t: E('ilmu') + 0.15, pose: 'pointUp', expr: 'excited', action: 'talk', dur: 1.0}, {t: E('lemari') + 0.15, pose: 'present', expr: 'proud'}]);
    fx(g, FX.dust([1.45, 0.15, -3.5], E('skripsi') + 0.1), (t) => inShots(t, 3));
    updaters.push((t) => {
      carried.visible = t < cut(3) + 2.1;
      stacks.forEach((s, i) => s.scale.setScalar(i < 3 ? 1 : pop(t, E('ilmu') + (i - 3) * 0.18, 0.3)));
      const u = smooth((t - E('skripsi') + 0.05) / 0.25);
      book.position.y = 2.6 * (1 - u); book.visible = t > E('skripsi') - 0.1;
    });
  }

  // ---------- house for sale: the 300-year loan (shot 4) ----------
  {
    const g = addLoc('house');
    g.add(ground(60, 60, '#9cb46a', {grain: 200}));
    g.add(P.hills('#8fb36a'));
    const path = box(1.4, 0.02, 6, toon('#d8c49a', {paint: {cobbles: true, seed: 12}}), {edges: false, hull: 0}); at(path, 0.5, 0, -3.5); g.add(path);
    const h = P.house(4.2, 3, 3, {seed: 41, color: '#f1dcae', roof: '#b5543c'}); at(h, 0.5, 0, -6.6); g.add(h);
    for (const [x, z, s] of [[-4, -8, 12], [5, -9, 13], [-6.5, -5, 14]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    const sale = P.signpost([L.forSale]); at(sale, -1.6, 0, -4.1); g.add(sale);
    const bill = new THREE.Group(); at(bill, 1.6, 0, -4.6, -0.2); g.add(bill);
    for (const s of [-1, 1]) { const p = cyl(0.06, 0.07, 2.3, '#7a5236'); at(p, s * 1.0, 0, 0); bill.add(p); }
    const billS = sign(L.loan, 2.3, 0.85, {bg: '#f2d24a', frame: '#8a6a2a', sub: L.loanSub}); at(billS, 0, 2.3, 0.05); bill.add(billS);
    const sales = ch('sales', {seed: 42}, g, 0.55, -3.1, -0.15);
    const hero = ch('hero', {seed: 4}, g, -0.85, -2.8, 0.3);
    walkPath(hero, [[cut(4), -2.7, -2.3], [E('rumah') - 0.05, -0.85, -2.8]]);
    const broch = held(sales, sign(L.loan, 0.5, 0.3, {bg: '#f2d24a', frame: '#8a6a2a', sub: L.loanSub}), {y: 0.08, z: 0.06});
    hero.act([
      {t: 0, pose: 'idle', expr: 'happy'},
      {t: E('rumah') + 0.1, pose: 'point', expr: 'excited', action: 'hop', dur: 0.5},
      {t: E('cicilan') + 0.15, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('dp') + 0.1, pose: 'limp', expr: 'grimace', action: 'tremble', dur: 0.8},
    ]);
    sales.act([{t: 0, pose: 'wave', expr: 'cheesy'}, {t: E('brosur') + 0.05, pose: 'hold', expr: 'scheming'}]);
    speak(sales, 8, [[0, 'cheesy', 'presentBoth'], [0.3, 'toothy', 'hold'], [0.55, 'excited', 'armsUp'], [0.82, 'scheming', 'hold']]);
    fx(g, FX.glints([1.6, 2.6, -4.4], E('cicilan'), {n: 26}), (t) => inShots(t, 4));
    updaters.push((t) => {
      bill.scale.setScalar(pop(t, E('cicilan') - 0.15, 0.4));
      broch.visible = t > E('brosur') - 0.05; broch.scale.setScalar(pop(t, E('brosur') - 0.05, 0.3));
    });
  }

  // ---------- schoolyard reunion: twelve generations (shot 5) ----------
  {
    const g = addLoc('reunion');
    town(g, 20);
    const school = P.house(9, 3.2, 3, {seed: 51, color: '#e8d4a8', roof: '#7a4a3a'}); at(school, 0, 0, -11); g.add(school);
    const ban = P.banner(L.reunion, 3.2, 0.8, {poleH: 3.9, bg: '#4f8fc8', frame: '#2a4a6a'}); at(ban, 0, 0, -8.2); g.add(ban);
    const gens = sign(L.gens, 2.0, 0.5, {bg: '#f2d24a', frame: '#8a6a2a'}); at(gens, -1.55, 2.55, -4.3, 0.25); g.add(gens);
    const front = [[-1.65, -2.7], [-0.55, -2.55], [0.55, -2.6], [1.65, -2.75]];
    const hero = ch('hero', {seed: 5}, g, front[1][0], front[1][1], 0.05);
    const mates = [0, 2, 3].map((k, i) => ch('hero', {...CROWD[i + 3], seed: 50 + i}, g, front[k][0], front[k][1], front[k][0] < 0 ? 0.25 : -0.25));
    const rows = []; const r = rng(55);
    [['anak', -3.6, 4], ['cucu', -4.5, 5], ['cicit', -5.4, 5], ['generasi', -6.3, 6]].forEach(([ev, z, n], ri) => {
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * 1.0 + (r() - 0.5) * 0.3;
        const c = ch('hero', {...CROWD[(i + ri * 3) % CROWD.length], seed: 100 + ri * 10 + i, scale: 0.72 + r() * 0.3}, g, x, z, -x * 0.08);
        const t0 = E(ev) + i * 0.06;
        c.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: t0, pose: ['wave', 'cheer', 'armsUp', 'hips'][(i + ri) % 4], expr: ['happy', 'laugh', 'cheesy', 'excited'][(i + ri) % 4], action: 'popIn', dur: 0.45}]);
        rows.push({c, t0});
      }
    });
    hero.act([
      {t: 0, pose: 'wave', expr: 'happy'},
      {t: E('terbesar') + 0.1, pose: 'cheer', expr: 'laugh', action: 'hop', dur: 0.6},
      {t: E('anak') + 0.15, pose: 'present', expr: 'surprised'},
      {t: E('cicit') + 0.1, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('generasi') + 0.2, pose: 'limp', expr: 'grimace', action: 'tremble', dur: 0.8},
    ]);
    const mateA = [
      [{t: 0, pose: 'cheer', expr: 'laugh'}, {t: E('teman') + 0.1, pose: 'wave', expr: 'cheesy', action: 'hop', dur: 0.5}, {t: E('generasi') + 0.15, pose: 'presentBoth', expr: 'proud'}],
      [{t: 0, pose: 'wave', expr: 'toothy'}, {t: E('teman') + 0.2, pose: 'armsUp', expr: 'excited', action: 'jump', dur: 0.5}, {t: E('cucu') + 0.15, pose: 'present', expr: 'smug'}],
      [{t: 0, pose: 'hips', expr: 'happy'}, {t: E('teman') + 0.15, pose: 'cheer', expr: 'laugh'}, {t: E('cicit') + 0.2, pose: 'point', expr: 'cheesy'}],
    ];
    mates.forEach((c, i) => c.act([{t: 0, pose: 'idle', expr: 'excited'}, {...mateA[i][0], t: E('terbesar') + 0.05 * i}, ...mateA[i].slice(1)]));
    [-4.6, 4.2, 5.0].forEach((x0, i) => { const k = [0, 2, 3][i]; walkPath(mates[i], [[cut(5) + 0.2 + 0.15 * i, x0, front[k][1] + 0.4], [E('terbesar') - 0.1, front[k][0], front[k][1]]], {run: true}); });
    fx(g, FX.confetti([0, 3.4, -4.5], E('generasi') + 0.05), (t) => inShots(t, 5));
    fx(g, FX.confetti([0, 3.4, -3.2], E('reuni') + 0.1), (t) => inShots(t, 5));
    updaters.push((t) => {
      rows.forEach(({c, t0}) => { c.group.visible = t > t0; });
      gens.visible = t > E('generasi') - 0.1; gens.scale.setScalar(pop(t, E('generasi') - 0.1, 0.4));
    });
  }

  // ---------- office: retire at 400, the late grandpa (shot 6) ----------
  {
    const g = addLoc('office');
    under(g, '#3a3036');
    g.add(P.room(9, 3.6, 7, {wall: '#dfe4ea', floor: '#8a8a92', wain: '#5a6a7a', floorPaint: {bricks: true}}));
    for (const x of [-2.6, 2.7]) { const d = P.desk({color: '#d9d2c2'}); at(d, x, 0, -4.9); g.add(d); const m = P.monitor(); at(m, x, 0.77, -5.05); g.add(m); }
    const poster = sign(L.retire, 1.7, 0.6, {bg: '#f2d24a', frame: '#8a6a2a'}); at(poster, -1.3, 2.35, -5.85); g.add(poster);
    const clk = P.wallClock(0.32); at(clk.group, 1.1, 2.6, -5.85); clk.set(9, 25); g.add(clk.group);
    const tc = P.timeClock(L.clockIn); at(tc.group, 1.75, 0, -3.5, -0.3); g.add(tc.group);
    const late = sign(L.late, 0.7, 0.3, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'}); at(late, 0.45, 2.3, -3.7, -0.1); g.add(late);
    const boss = ch('boss', {seed: 61}, g, 0.75, -3.4, -0.2);
    const gp = ch('grandpa', {seed: 62}, g, -0.6, -2.7, 0.25);
    const cane = cyl(0.025, 0.025, 0.9, '#6b3f2a'); held(gp, cane, {y: -0.85, x: 0.02, z: 0.05});
    gp.act([
      {t: 0, pose: 'limp', expr: 'tired'},
      {t: E('empat') + 0.1, pose: 'limp', expr: 'sad', action: 'slump', dur: 1.0},
    ]);
    speak(gp, 13, [[0, 'nervous', 'beg'], [0.25, 'grimace'], [0.45, 'worried', 'hammerDown'], [0.7, 'tired', 'limp'], [0.88, 'nervous', 'shrug']]);
    gp.act([{t: E('lutut') + 0.1, action: 'tremble', dur: 1.4}]);
    walkPath(gp, [[cut(6), -2.4, -2.9], [cut(6) + 2.6, -0.6, -2.7]]);
    boss.act([{t: 0, pose: 'cross', expr: 'annoyed'}, {t: E('pensiun') + 0.1, pose: 'tap', expr: 'smug'}, {t: E('maaf') + 0.1, pose: 'facepalm', expr: 'irritated'}, {t: E('lutut') + 0.3, pose: 'cross', expr: 'disgusted'}]);
    speak(boss, 12, [[0, 'annoyed', 'cross'], [0.35, 'angry', 'point'], [0.75, 'irritated', 'hips']]);
    fx(g, FX.glints([-1.3, 2.4, -5.6], E('empat'), {n: 22}), (t) => inShots(t, 6));
    updaters.push((t) => {
      poster.scale.setScalar(t < E('empat') - 0.1 ? 1 : 1 + 0.12 * Math.max(0, 1 - (t - E('empat')) / 0.4));
      late.visible = t > E('telat') - 0.05; late.scale.setScalar(pop(t, E('telat') - 0.05, 0.3));
      clk.set(9, 25 + Math.max(0, t - cut(6)) * 2);
    });
  }

  // ---------- Earth in space getting overcrowded (shot 7a) ----------
  {
    const g = addLoc('earth');
    const st = P.stars(500, 60, 7); at(st, 0, 1.5, -6); g.add(st);
    const G = P.globe(2.3, {seed: 44}); at(G.group, 0, 1.6, -6); g.add(G.group);
    const r = rng(77); const pins = [];
    for (let i = 0; i < 90; i++) {
      // points on the camera-facing half
      const a = (r() - 0.5) * 2.4, la = (r() - 0.5) * 2.2;
      const n = new THREE.Vector3(Math.sin(a) * Math.cos(la), Math.sin(la), Math.cos(a) * Math.cos(la));
      const o = i % 4 === 0 ? (() => { const h = new THREE.Group(); const b = box(0.26, 0.2, 0.22, ['#e6c99a', '#d8b48a', '#c9d8c0'][i % 3], {hull: 0.006}); h.add(b); const rf = cone(0.21, 0.16, '#b5543c', {seg: 4}); at(rf, 0, 0.2, 0, Math.PI / 4); h.add(rf); return h; })()
        : P.tinyPerson(CROWD[i % CROWD.length].jacket, 0.2);
      o.position.copy(n.clone().multiplyScalar(2.3)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      G.spin.add(o); pins.push({o, t0: i < 18 ? 0 : E('semua') + (i - 18) / 72 * (E('penuh') - E('semua') + 0.4)});
    }
    fx(g, FX.sparks([0, 3.4, -4.4], E('penuh'), {n: 30, color: '#ff9a5a'}), (t) => inShots(t, 7));
    updaters.push((t) => {
      st.visible = inShots(t, 7);
      G.spin.rotation.y = -0.15 + Math.max(0, t - cut(7)) * 0.04;
      pins.forEach(({o, t0}) => { o.visible = t > t0; o.scale.setScalar(pop(t, t0, 0.3)); });
      const w = t > E('penuh') ? Math.sin((t - E('penuh')) * 18) * 0.04 * Math.max(0, 1 - (t - E('penuh')) / 1.2) : 0;
      G.group.rotation.z = w; G.group.scale.setScalar(1 + (t > E('penuh') ? 0.03 * Math.abs(Math.sin(t * 6)) : 0));
    });
  }

  // ---------- warung: grandpa complains about snack prices (shot 8) ----------
  {
    const g = addLoc('warung');
    town(g, 40);
    const st = P.stall(L.snacks, {awning: '#e8a83a', signBg: '#f2d24a'}); at(st, 0.3, 0, -4.0); g.add(st);
    for (const [x, s] of [[-0.3, 5], [0.55, 6]]) { const tr = P.snackTray(8, s); at(tr, x, 0.86, -3.85); g.add(tr); }
    const price = sign(L.price, 0.75, 0.42, {bg: '#fff3df', frame: '#7a5236'}); at(price, 1.15, 1.22, -3.5); g.add(price);
    const seller = ch('seller', {seed: 81}, g, 0.3, -4.75, 0);
    const gp = ch('grandpa', {seed: 82}, g, -0.95, -2.75, 0.35);
    const cust = ch('hero', {...CROWD[1], seed: 83}, g, 1.55, -2.85, -0.35);
    const cane = cyl(0.025, 0.025, 0.9, '#6b3f2a'); held(gp, cane, {y: -0.85, x: 0.02, z: 0.05, hand: 0});
    const bub = bubble(g, -1.75, 2.75, -2.9, 0.48);
    const old = sign(L.oldPrice, 0.6, 0.42, {bg: '#e8dcc0', frame: '#7a5236', sub: L.oldSub}); at(old, 0, 0, 0.03); bub.add(old);
    walkPath(gp, [[cut(8), -3.2, -2.35], [cut(8) + 2.2, -0.95, -2.75]]);
    gp.act([{t: 0, pose: 'limp', expr: 'tired'}, {t: cut(8) + 2.2, pose: 'point', expr: 'irritated'}, {t: E('gorengan') + 0.05, pose: 'point', expr: 'angry'}, {t: E('lalu') + 0.05, pose: 'pointUp', expr: 'furious', action: 'shake', dur: 0.6}]);
    speak(gp, 17, [[0.3, 'annoyed', 'tap'], [0.5, 'irritated', 'point'], [0.75, 'angry', 'pointUp'], [0.92, 'furious']], E('kakek2') - 0.2);
    seller.act([{t: 0, pose: 'hips', expr: 'tired'}, {t: E('gorengan') + 0.2, pose: 'shrug', expr: 'annoyed'}, {t: E('lalu') + 0.2, pose: 'facepalm', expr: 'tired', action: 'slump', dur: 1.0}]);
    cust.act([{t: 0, pose: 'carry', expr: 'neutral'}, {t: E('sebal') + 0.1, pose: 'cross', expr: 'tired'}, {t: E('gorengan') + 0.3, pose: 'facepalm', expr: 'irritated', action: 'shake', dur: 0.6}]);
    updaters.push((t) => {
      bub.visible = t > E('lalu') - 0.4; bub.scale.setScalar(pop(t, E('lalu') - 0.4, 0.35));
      price.scale.setScalar(t > E('gorengan') ? 1 + 0.12 * Math.max(0, 1 - (t - E('gorengan')) / 0.35) : 1);
    });
  }

  // ---------- park at golden hour: the lesson and the question (shots 9, 10) ----------
  {
    const g = addLoc('park');
    g.add(ground(60, 60, '#9cb46a', {grain: 220}));
    g.add(P.hills('#8fb36a'));
    for (const [x, z, s] of [[-3.4, -5.5, 61], [3.6, -6, 62], [-7, -9, 63], [6.5, -10, 64], [0.5, -12, 65]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    const bench = new THREE.Group(); at(bench, -1.9, 0, -3.9, 0.3); g.add(bench);
    bench.add(box(1.4, 0.08, 0.45, toon('#a8784a', {paint: {planks: 3, seed: 66}}))); bench.children[0].position.y = 0.42;
    for (const sx of [-0.6, 0.6]) { const l = box(0.06, 0.42, 0.4, '#5a4a42'); at(l, sx, 0, 0); bench.add(l); }
    const back = box(1.4, 0.4, 0.06, toon('#a8784a', {paint: {planks: 2, seed: 67}})); at(back, 0, 0.62, -0.2); bench.add(back);
    const hero = ch('hero', {seed: 9}, g, -0.2, -2.7, 0.1);
    const kid = ch('kid', {seed: 91, scale: 0.68}, g, 0.85, -2.85, -0.4);
    const loafH = held(hero, P.loaf(0.9), {y: -0.02, z: 0.08});
    walkPath(hero, [[cut(9), -2.9, -2.1], [cut(9) + 2.4, -0.45, -2.7], [E('manfaat') - 1.0, -0.45, -2.7], [E('manfaat') - 0.35, 0.0, -2.75], [cut(10), 0.0, -2.75], [cut(10) + 0.01, -0.2, -2.7]]);
    const loafK = held(kid, P.loaf(0.9), {y: -0.02, z: 0.08});
    const hearts = [0, 1, 2].map((i) => { const h = P.heart(['#d8413a', '#e86a8a', '#d8413a'][i]); h.scale.setScalar(0.5); g.add(h); return h; });
    const wish = [P.plane(), P.bookStack(5, 9), P.footballBall(), P.cake('500').group];
    const WP = [[-0.95, 2.25, -2.5], [0.95, 2.3, -2.6], [-0.9, 1.55, -2.3], [0.9, 1.5, -2.3]];
    wish.forEach((o, i) => { o.traverse((m) => { m.castShadow = false; }); g.add(o); });
    const q = P.glyph('?', 0.6, '#f2d24a'); g.add(q);
    const cmt = sign(L.comment, 1.8, 0.55, {bg: '#c75b5b', fg: '#fff3df', frame: '#8a3f2a'}); at(cmt, -0.1, 3.05, -3.3); g.add(cmt);
    hero.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: E('pas') + 0.1, pose: 'hips', expr: 'happy', action: 'nod', dur: 0.8},
      {t: E('penting') + 0.1, pose: 'think', expr: 'neutral'},
      {t: E('manfaat') - 0.3, pose: 'give', expr: 'happy'},
      {t: E('manfaat') + 0.6, pose: 'presentBoth', expr: 'laugh'},
      {t: cut(10), pose: 'shrug', expr: 'confused'},
      {t: E('ngapain') + 0.1, pose: 'chin', expr: 'scheming'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy', action: 'jump', dur: 0.6},
    ]);
    kid.act([{t: 0, pose: 'idle', expr: 'sad'}, {t: E('manfaat') + 0.15, pose: 'carry', expr: 'cheesy', action: 'hop', dur: 0.6}]);
    fx(g, FX.glints([0.4, 1.4, -2.7], E('manfaat'), {n: 24}), (t) => inShots(t, 9));
    fx(g, FX.confetti([-0.1, 3.2, -2.6], E('komentar') + 0.05), (t) => inShots(t, 10));
    updaters.push((t) => {
      const s9 = inShots(t, 9), s10 = inShots(t, 10), given = t > E('manfaat') + 0.1;
      kid.group.visible = s9; loafH.visible = s9 && !given && t > E('penting'); loafK.visible = s9 && given;
      hearts.forEach((h, i) => { const t0 = E('manfaat') + 0.2 + i * 0.15; h.visible = s9 && t > t0; h.scale.setScalar(0.45 * pop(t, t0, 0.35)); h.position.set(0.5 + (i - 1) * 0.35, 2.1 + i % 2 * 0.2 + (t - t0) * 0.12, -2.7); h.rotation.y = Math.sin(t * 2 + i) * 0.4; });
      wish.forEach((o, i) => { o.visible = s10; const k = pop(t, E('ngapain') + i * 0.2, 0.4) * [0.11, 1.0, 1.6, 0.42][i]; o.scale.setScalar(k); o.position.set(WP[i][0], WP[i][1] + Math.sin(t * 2 + i) * 0.05, WP[i][2]); o.rotation.y = 0.5 + Math.sin(t + i) * 0.3; });
      q.visible = s10 && t < E('komentar') - 0.1; q.scale.setScalar(0.6 * pop(t, cut(10) + 0.2, 0.35)); q.position.set(0.15, 2.95 + Math.sin(t * 3) * 0.05, -2.6);
      cmt.visible = s10; cmt.scale.setScalar(pop(t, E('komentar') - 0.1, 0.4));
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
