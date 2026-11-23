// All locations in one scene at different x offsets. Story: "Raja yang mencetak uang / The king who printed money".
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, pop, smooth, clamp01, INK, rng} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {square: 0, throne: 40, market: 80, country: 120, collector: 160};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look for this story (palette overrides on top of char.js PALETTES). Design: 'bean' (new for this video;
// round no-sleep face, tuft hair, thick brows, thicker limbs).
export const CHAR_DESIGN = 'bean';
const CAST = {
  king: {jacket: '#7a4fa0', lower: '#4a2f6a', tie: '#e8c04a', hair: '#5a3a2a', hat: 'crown', hatColor: '#e8c04a', hatColor2: '#c9982f', pocket: '#5a3a80'},
  poorA: {jacket: '#8a9a7a', lower: '#6a5a4a', tie: '#a8784a', hair: '#3a2a26', hat: 'none', hairStyle: 'tuft', pocket: '#6a7a5a'},
  poorB: {jacket: '#b08a6a', lower: '#5a4a3a', tie: '#7a5a3a', hair: '#2b2326', hat: 'none', hairStyle: 'side', pocket: '#8a6a4a'},
  poorC: {jacket: '#7a8aa0', lower: '#4a4a5a', tie: '#c2463a', hair: '#4a3026', hat: 'cap', hatColor: '#a8925a', hatColor2: '#8a7a4a'},
  baker: {jacket: '#f3efe6', lower: '#5a6a7a', tie: '#d8413a', hair: '#3a2a26', hat: 'none', hairStyle: 'tuft', pocket: '#d9d2c2'},
  local: {jacket: '#d9774a', lower: '#3a4a5a', tie: '#2f5f5a', hair: '#2b2326', hat: 'none', hairStyle: 'fringe', pocket: '#b85a3a'},
  collector: {jacket: '#4a6a5a', lower: '#3a3a42', tie: '#e8c04a', hair: '#8a8a8a', hat: 'none', hairStyle: 'side', glasses: true, pocket: '#3a5a4a'},
};

// Lighting plan (camera_plan.md): a grey, sad village that turns joyful in the money rain and golden for the
// closing question; a warm palace hall; a sunny market going tense as prices climb and sad on the goat line;
// a hot afternoon street in the real country turning to danger on "skyrocketed"; a warm collector's shop.
const villageDay = {...LOOK_PRESETS.day, keyPos: [-8, 12, 10]};
const palace = {...LOOK_PRESETS.interiorWarm, keyPos: [-4, 8, 8]};
const marketDay = {...LOOK_PRESETS.day, keyPos: [-8, 12, 10]};
const hotStreet = {...LOOK_PRESETS.goldenHour, keyPos: [-10, 9, 8]};
const shop = {...LOOK_PRESETS.interiorWarm, keyI: 2.2, keyPos: [-4, 8, 8]};

export const LOOK = {
  square: {keys: [{at: 0, ...villageDay, ...MOODS.sad}, {at: 'cut3', ...villageDay, ...MOODS.joyful}, {at: 'cut11', ...LOOK_PRESETS.goldenHour, keyPos: [-8, 10, 10]}]},
  throne: {keys: [{at: 0, ...palace}, {at: 'cetak', ...palace, ...MOODS.joyful}, {at: 'cut6', ...palace, ...MOODS.mystery}]},
  market: {keys: [{at: 0, ...marketDay}, {at: 'sama', ...marketDay, ...MOODS.sad}, {at: 'cut5', ...marketDay}, {at: 'naik3', ...marketDay, ...MOODS.tense}, {at: 'cut6', ...marketDay, ...MOODS.sad}]},
  country: {keys: [{at: 0, ...hotStreet}, {at: 'meroket', ...hotStreet, ...MOODS.danger}, {at: 'cut9', ...hotStreet, ...MOODS.sad}, {at: 'asing', ...hotStreet}]},
  collector: {keys: [{at: 0, ...shop}, {at: 'mahal', ...shop, ...MOODS.joyful}]},
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
      {t: EVt.ide + 0.05, dur: 0.35, color: '#ffe9a0', strength: 0.45},
      {t: EVt.cetak + 0.05, dur: 0.35, color: '#d8ffb0', strength: 0.35},
      {t: EVt.mobil + 0.05, dur: 0.3, color: '#ffe9a0', strength: 0.35},
      {t: EVt.meroket, dur: 0.35, color: '#ffb080', strength: 0.4},
      {t: EVt.triliun + 0.05, dur: 0.45, color: '#ffffff', strength: 0.55},
      {t: EVt.mahal, dur: 0.35, color: '#ffe9a0', strength: 0.4},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.cetak + 0.05, dur: 0.6, amp: 0.02}, {t: EVt.naik3, dur: 0.3, amp: 0.02}, {t: EVt.meroket, dur: 0.4, amp: 0.03}, {t: EVt.triliun + 0.05, dur: 0.45, amp: 0.04}],
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
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const noteTex = P.noteTex(L.noteVal, {seed: 5});
  // Banknotes fluttering down over an area while vis(t).
  const noteRain = (g, cx, cz, o = {}) => {
    const {n = 40, w = 6, d = 4, h = 4.5, vis, seed = 21} = o; const r = rng(seed);
    const notes = []; for (let i = 0; i < n; i++) { const b = P.banknote(L.noteVal, {tex: noteTex, w: 0.3}); g.add(b); notes.push({b, x: cx + (r() - 0.5) * w, z: cz + (r() - 0.5) * d, ph: r(), sp: 0.22 + r() * 0.15, rs: 1 + r() * 2}); }
    updaters.push((t) => notes.forEach((q) => {
      q.b.visible = vis(t); if (!q.b.visible) return;
      const u = (t * q.sp + q.ph) % 1;
      q.b.position.set(q.x + Math.sin(t * 2 + q.ph * 9) * 0.3, 0.05 + h * (1 - u), q.z + Math.cos(t * 1.7 + q.ph * 7) * 0.2);
      q.b.rotation.set(Math.sin(t * q.rs) * 1.2, t * q.rs, Math.cos(t * q.rs * 0.7) * 0.8);
    }));
  };

  // ---------- village square (shots 1, 3, 11) ----------
  {
    const g = addLoc('square');
    g.add(ground(60, 60, '#c8ad86', {cobbles: true}));
    g.add(P.hills('#9cb46a'));
    for (const [x, z, s, c] of [[-6.5, -8, 4, '#d8c4a0'], [6.5, -8.5, 6, '#cbb490'], [-11, -3, 7, '#d6bd94'], [12, -4, 8, '#c9b08a']]) { const h = P.house(4, 2.8, 3, {seed: s, color: c, roof: '#7a5a3a'}); at(h, x, 0, z, x < 0 ? 0.45 : -0.45); g.add(h); }
    for (const [x, z, s] of [[-3, -12, 1], [2, -13, 2], [9, -12, 3], [-9, -11, 5]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    const ban = P.banner(L.kingdom, 2.6, 0.7, {poleH: 3.2, bg: '#7a4fa0'}); at(ban, 0, 0, -6.5); g.add(ban);
    // a distant castle on the hill
    const castle = new THREE.Group(); at(castle, 3, 0, -24); g.add(castle);
    castle.add(box(5, 4, 2.5, toon('#cfc3ae', {paint: {bricks: true, seed: 31}})));
    for (const s of [-1, 1]) { const tw = cyl(0.9, 0.9, 6, toon('#d6cab6', {paint: {bricks: true, seed: 32}})); at(tw, s * 2.6, 0, 0); castle.add(tw); const rf = cone(1.1, 1.6, '#7a4fa0'); at(rf, s * 2.6, 6, 0); castle.add(rf); }
    for (const [x, z] of [[-4.4, -1.2], [4.6, -1.8]]) { const b = P.barrel(); at(b, x, 0, z); g.add(b); }
    const sk = P.sack(null, {scale: 0.7, color: '#cdb48a'}); at(sk, -3.6, 0, -2.2); g.add(sk);
    const A = ch('poorA', {}, g, -0.2, -2.3, 0);
    const B = ch('poorB', {seed: 12}, g, -1.6, -3.0, 0.3);
    const C = ch('poorC', {seed: 13}, g, 1.4, -3.1, -0.3);
    const stack = held(A, P.noteStack(5, {value: L.noteVal}), {y: -0.02});
    const bigNote = P.banknote(L.note, {w: 0.9, tex: P.noteTex(L.note, {seed: 9, color: '#c9a8e0', dark: '#5a3a80'})}); g.add(bigNote);
    const car = P.car('#d8413a'); car.rotation.y = Math.PI / 2; at(car, 2.6, 0, -4.6, Math.PI / 2); g.add(car);
    const q = P.glyph('?', 0.7, '#f2d24a'); q.position.set(0.9, 2.55, -2.2); g.add(q);
    const wish = [P.car('#4f7fa6'), P.goat(), P.loaf(2)]; const WP = [[1.35, 2.45, -2.8], [-1.35, 2.3, -2.7], [1.0, 1.6, -2.5]];
    wish.forEach((o, i) => { at(o, ...WP[i]); g.add(o); });
    const cmt = sign(L.comment, 1.8, 0.55, {bg: '#c75b5b', fg: '#fff3df', frame: '#8a3f2a'}); at(cmt, 0, 2.85, -3.4); g.add(cmt);
    A.act([
      {t: 0, pose: 'limp', expr: 'sad', action: 'slump', dur: 2},
      {t: cut(3), pose: 'armsUp', expr: 'toothy', action: 'jump', dur: 0.6},
      {t: E('kaya') + 0.1, pose: 'cheer', expr: 'cheesy', action: 'hop', dur: 0.8},
      {t: E('mobil') + 0.1, pose: 'point', expr: 'excited', action: 'jump', dur: 0.6},
      {t: cut(11), pose: 'present', expr: 'smug'},
      {t: E('tebak') + 0.1, pose: 'shrug', expr: 'confused'},
      {t: E('beli') + 0.1, pose: 'chin', expr: 'scheming'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy', action: 'jump', dur: 0.6},
    ]);
    B.act([
      {t: 0, pose: 'limp', expr: 'tired', action: 'slump', dur: 2.5},
      {t: E('miskin') + 0.15, expr: 'cry'},
      {t: cut(3), pose: 'cheer', expr: 'laugh', action: 'hop', dur: 1.2},
      {t: E('mobil') + 0.2, pose: 'presentBoth', expr: 'surprised'},
    ]);
    C.act([
      {t: 0, pose: 'cross', expr: 'worried'},
      {t: E('miskin') + 0.2, pose: 'headHold', expr: 'sad'},
      {t: cut(3) + 0.2, pose: 'armsUp', expr: 'toothy', action: 'jump', dur: 0.6},
      {t: E('kaya') + 0.3, pose: 'carryBoth', expr: 'cheesy'},
    ]);
    noteRain(g, 0, -3.2, {d: 2.4, vis: (t) => inShots(t, 3)});
    fx(g, FX.glints([2.6, 1.0, -4.0], E('mobil'), {n: 24}), (t) => inShots(t, 3));
    fx(g, FX.glints([0, 2.7, -3.3], E('komentar'), {n: 24}), (t) => inShots(t, 11));
    fx(g, FX.confetti([-0.2, 3.0, -2.3], E('komentar') + 0.05), (t) => inShots(t, 11));
    updaters.push((t) => {
      const s3 = inShots(t, 3), s11 = inShots(t, 11);
      stack.visible = s3; bigNote.visible = s11; bigNote.position.set(0.55, 1.25 + Math.sin(t * 2.5) * 0.03, -2.0); bigNote.rotation.set(0, -0.15, 0.12);
      B.group.visible = C.group.visible = !s11;
      car.visible = s3; car.scale.setScalar(pop(t, E('mobil') - 0.1, 0.45));
      q.visible = s11; q.scale.setScalar(0.7 * pop(t, E('tebak'), 0.4)); q.position.y = 2.55 + Math.sin(t * 3) * 0.05;
      wish.forEach((o, i) => { o.visible = s11; const k = pop(t, E('beli') + i * 0.22, 0.4) * (i === 0 ? 0.22 : i === 1 ? 0.42 : 0.8); o.scale.setScalar(k); o.position.y = WP[i][1] + Math.sin(t * 2 + i) * 0.05; o.rotation.y = 0.6 + Math.sin(t + i) * 0.3; });
      cmt.visible = s11; cmt.scale.setScalar(pop(t, E('komentar') - 0.1, 0.4));
      ban.visible = !s11 || t < E('komentar') - 0.1;
    });
  }

  // ---------- palace hall: the king's idea, the printing press (shots 1b, 2, 6b) ----------
  {
    const g = addLoc('throne');
    under(g, '#3a3036');
    g.add(P.room(9, 4.0, 7, {wall: '#c9a8c8', floor: '#8a5a4a', wain: '#7a4fa0', floorPaint: {bricks: true}}));
    const carpet = box(1.8, 0.02, 6, toon('#b8323a', {paint: {stripes: {n: 2, color: '#e8c04a'}, seed: 44}}), {hull: 0, edges: false}); at(carpet, 0, 0, -2.6); g.add(carpet);
    const th = P.throne(); at(th, 0, 0, -5.0); g.add(th);
    for (const s of [-1, 1]) { const bn = box(0.9, 2.2, 0.04, toon('#b8323a', {paint: {stripes: {n: 3, color: '#e8c04a'}, seed: 45}})); at(bn, s * 2.4, 1.2, -5.88); g.add(bn); const cr = ball(0.16, '#e8c04a'); at(cr, s * 2.4, 2.5, -5.8); g.add(cr); }
    const press = P.printingPress(L.money); at(press.group, 2.6, 0, -3.6, -0.5); g.add(press.group);
    const king = ch('king', {seed: 31}, g, -0.2, -3.6, 0.15);
    const idea = P.bulb(0.6); g.add(idea.group);
    king.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: E('ide') + 0.1, pose: 'pointUp', expr: 'excited', action: 'jump', dur: 0.6},
      {t: E('jenius') + 0.1, pose: 'hips', expr: 'scheming'},
      {t: cut(2), pose: 'shrug', expr: 'smug', action: 'talk', dur: 1.4},
      {t: E('gampang') + 0.1, pose: 'presentBoth', expr: 'cheesy'},
      {t: E('cetak') + 0.1, pose: 'point', expr: 'excited'},
      {t: E('bagikan') + 0.1, pose: 'armsUp', expr: 'toothy'},
      {t: E('haha') + 0.05, pose: 'hips', expr: 'laugh', action: 'hop', dur: 1.0},
      {t: E('ehem') - 0.1, pose: 'facepalm', expr: 'nervous', action: 'tremble', dur: 0.8},
      {t: E('matikan') + 0.1, pose: 'tap', expr: 'grimace'},
    ]);
    // notes flying out of the chute
    const flying = []; const r = rng(33);
    for (let i = 0; i < 26; i++) { const b = P.banknote(L.noteVal, {tex: noteTex, w: 0.3}); g.add(b); flying.push({b, ph: r(), vx: (r() - 0.5) * 1.6, vy: 2.2 + r() * 1.4, rs: 2 + r() * 3}); }
    const origin = new THREE.Vector3(2.6 - 0.37, 0.8, -3.6 + 0.66);
    fx(g, FX.sparks([2.3, 1.7, -3.3], E('cetak'), {n: 30, color: '#d8ffb0'}), (t) => inShots(t, 2));
    fx(g, FX.smoke([3.1, 1.9, -3.8], E('cetak'), {every: 0.35}), (t) => inShots(t, 2) && t > E('cetak'));
    updaters.push((t) => {
      const s1 = inShots(t, 1), s2 = inShots(t, 2), s6 = inShots(t, 6);
      idea.group.visible = s1 && t > E('ide') - 0.1;
      idea.group.position.set(-0.05, 2.45 + Math.sin(t * 3) * 0.04, -3.5); idea.group.scale.setScalar(pop(t, E('ide') - 0.1, 0.4));
      idea.set(t > E('ide') ? 1 : 0);
      const running = (s2 && t > E('cetak')) || (s6 && t < E('matikan') + 0.2);
      if (s6) king.group.position.set(1.55, 0, -2.75); else king.group.position.set(-0.2, 0, -3.6);
      press.gear.rotation.y = running ? t * 6 : 0;
      press.lamp.material.color.set(running ? '#6fd06a' : '#d8413a');
      press.lever.rotation.z = s6 && t > E('matikan') ? -0.9 * smooth((t - E('matikan')) / 0.3) : 0;
      press.group.position.y = running ? Math.abs(Math.sin(t * 18)) * 0.02 : 0;
      flying.forEach((f) => {
        f.b.visible = running; if (!running) return;
        const u = (t * 0.9 + f.ph) % 1, tt = u * 1.4;
        f.b.position.set(origin.x + f.vx * tt * 0.6 - 0.4 * tt, origin.y + f.vy * tt - 2.4 * tt * tt, origin.z + 0.9 * tt);
        if (f.b.position.y < 0.03) f.b.position.y = 0.03;
        f.b.rotation.set(t * f.rs, t * f.rs * 0.7, 0);
      });
    });
    // a pile of printed money on the floor in front of the press
    const pile = new THREE.Group(); at(pile, 1.9, 0, -2.6); g.add(pile);
    for (let i = 0; i < 4; i++) { const s = P.noteStack(4 + i, {value: L.noteVal}); at(s, (i % 2) * 0.4 - 0.2, 0, Math.floor(i / 2) * 0.3, i * 0.5); pile.add(s); }
    updaters.push((t) => { pile.visible = inShots(t, 6) || (inShots(t, 2) && t > E('bagikan')); });
  }

  // ---------- bakery market: bread and rice stay the same, prices climb (shots 4, 5, 6a) ----------
  {
    const g = addLoc('market');
    g.add(ground(60, 60, '#c8ad86', {cobbles: true}));
    g.add(P.hills('#9cb46a'));
    for (const [x, z, s] of [[-8, -9, 21], [8, -10, 22], [-12, -4, 23], [13, -6, 24]]) { const h = P.house(4, 3, 3, {seed: s, color: x < 0 ? '#e6c99a' : '#d8b48a'}); at(h, x, 0, z, x < 0 ? 0.5 : -0.5); g.add(h); }
    for (const [x, z, s] of [[-5, -14, 3], [5, -15, 8]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    const st = P.stall(null, {awning: '#d9774a'}); at(st, 0, 0, -3.8); g.add(st);
    const bsign = sign(L.bakery, 1.5, 0.42, {bg: '#f1dcae'}); at(bsign, 0, 2.85, -3.3); g.add(bsign);
    for (let i = 0; i < 5; i++) { const lf = P.loaf(1); at(lf, -0.8 + i * 0.4, 0.85, -3.75 + (i % 2) * 0.12, (i % 3) * 0.3); g.add(lf); }
    const rice = [0, 1].map((i) => { const s = P.sack(L.rice, {scale: 0.72, color: '#efe6d6'}); at(s, 1.45 + i * 0.65, 0, -2.95 - i * 0.25); g.add(s); return s; });
    const breadSign = sign(L.bread, 0.8, 0.3, {bg: '#f2d24a', frame: '#8a6a2a'}); at(breadSign, -0.85, 1.12, -3.22); g.add(breadSign);
    // price board: one sign per price, swapped on each "up"
    const prices = L.prices.map((p, i) => { const s = sign(p, 0.7, 0.46, {bg: i === 3 ? '#d8413a' : '#fff3df', fg: i === 3 ? '#fff3df' : INK, frame: '#7a5236', sub: L.price}); at(s, 0.95, 1.6, -3.2); g.add(s); return s; });
    const baker = ch('baker', {seed: 41}, g, -0.1, -4.35, 0);
    const c1 = ch('poorA', {seed: 42}, g, -1.5, -2.2, 0.35);
    const c2 = ch('poorC', {seed: 43}, g, 1.4, -2.0, -0.35);
    const c3 = ch('poorB', {seed: 44}, g, 2.8, -2.5, -0.4);
    const s1 = held(c1, P.noteStack(7, {value: L.noteVal}), {y: -0.02});
    held(c2, P.noteStack(6, {value: L.noteVal}), {y: -0.02});
    held(c3, P.noteStack(8, {value: L.noteVal}), {y: -0.02});
    const loafHand = held(c1, P.loaf(0.8), {y: 0.0, z: 0.1});
    const goat = P.goat(); at(goat, -2.3, 2.2, -2.7, 0.6); g.add(goat);
    const bubble = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshBasicMaterial({color: '#fff3df'})); at(bubble, -2.15, 2.45, -2.75); g.add(bubble);
    const bubbleRim = new THREE.Mesh(new THREE.CircleGeometry(0.54, 32), new THREE.MeshBasicMaterial({color: INK})); at(bubbleRim, -2.15, 2.45, -2.77); g.add(bubbleRim);
    baker.act([
      {t: 0, pose: 'hips', expr: 'happy'},
      {t: E('sama') + 0.1, pose: 'shrug', expr: 'worried'},
      {t: cut(5), pose: 'beg', expr: 'nervous', action: 'talk', dur: 1.0},
      {t: E('naik1') + 0.1, pose: 'point', expr: 'grimace'},
      {t: E('naik2') + 0.1, pose: 'headHold', expr: 'nervous', action: 'tremble', dur: 0.6},
      {t: E('naik3') + 0.1, pose: 'armsUp', expr: 'scream', action: 'jump', dur: 0.6},
      {t: cut(6), pose: 'shrug', expr: 'nervous'},
    ]);
    c1.act([
      {t: 0, pose: 'carry', expr: 'cheesy'},
      {t: E('sama') + 0.15, expr: 'confused'},
      {t: E('naik1') + 0.2, expr: 'shocked', action: 'jump', dur: 0.5},
      {t: E('naik3') + 0.2, pose: 'headHold', expr: 'grimace'},
      {t: cut(6), pose: 'carry', expr: 'sad'},
      {t: E('kambing') + 0.1, pose: 'present', expr: 'worried'},
      {t: E('sekarang7') + 0.1, pose: 'carry', expr: 'cry', action: 'slump', dur: 1.5},
      {t: E('huhu'), expr: 'cry', action: 'tremble', dur: 1.2},
    ]);
    c2.act([{t: 0, pose: 'carry', expr: 'toothy'}, {t: E('sama') + 0.2, expr: 'worried', action: 'shake', dur: 0.6}, {t: E('naik2') + 0.2, pose: 'headHold', expr: 'shocked'}]);
    c3.act([{t: 0, pose: 'carry', expr: 'happy'}, {t: E('roti5') + 0.2, expr: 'confused'}, {t: E('naik3') + 0.2, expr: 'furious', action: 'shake', dur: 0.6}]);
    fx(g, FX.sparks([0.55, 1.6, -3.1], E('naik3'), {n: 24}), (t) => inShots(t, 5));
    updaters.push((t) => {
      const sh5 = inShots(t, 5), sh6 = inShots(t, 6);
      const step = !sh5 && !sh6 ? 0 : sh6 ? 3 : t > E('naik3') ? 3 : t > E('naik2') ? 2 : t > E('naik1') ? 1 : 0;
      prices.forEach((s, i) => { s.visible = i === step; });
      const last = step === 0 ? 0 : E(['naik1', 'naik1', 'naik2', 'naik3'][step]);
      prices[step].scale.setScalar(sh5 && step ? pop(t, last, 0.3) : 1);
      const sold = sh6 && t > E('sekarang7') - 0.1;
      loafHand.visible = sold; s1.visible = true;
      const thought = sh6 && t > E('pagi') && t < E('sekarang7') - 0.1;
      goat.visible = thought; bubble.visible = bubbleRim.visible = thought;
      goat.scale.setScalar(0.4 * pop(t, E('kambing') - 0.2, 0.35)); goat.position.y = 2.18 + Math.sin(t * 4) * 0.02;
      bubble.scale.setScalar(pop(t, E('pagi'), 0.3)); bubbleRim.scale.copy(bubble.scale);
      c2.group.visible = c3.group.visible = !sh6;
    });
  }

  // ---------- a real country: hot street, prices double daily, the 100 trillion note (shots 7, 8, 9) ----------
  {
    const g = addLoc('country');
    g.add(ground(60, 60, '#d8b47a', {grain: 260}));
    g.add(P.hills('#c9a86a'));
    const road = box(26, 0.03, 2.4, toon('#b89a6a', {paint: {grain: 200, seed: 8}}), {edges: false, hull: 0}); at(road, 0, 0, 0.6); g.add(road);
    for (const [x, z, s, c] of [[-4.5, -6.5, 51, '#e8d4a8'], [0.2, -7.2, 52, '#d9a87a'], [4.8, -6.6, 53, '#c9d8c0'], [-10, -4, 54, '#e3c49a'], [10.5, -4.5, 55, '#d6b89a']]) { const h = P.house(4, 3, 3, {seed: s, color: c, roof: '#8a6a4a'}); at(h, x, 0, z, x < -6 ? 0.5 : x > 6 ? -0.5 : 0); g.add(h); }
    for (const [x, z, s] of [[-7, -10, 9], [7.5, -11, 10], [2.5, -12, 11]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    const signQ = P.signpost([L.country]); at(signQ, -3.0, 0, -2.4); g.add(signQ);
    // price chart on a board: a line that rockets up
    const board = P.chalkboard(1.7, 1.2); at(board, 2.2, 1.5, -3.4, -0.25); g.add(board);
    for (const sx of [-1, 1]) { const leg = cyl(0.03, 0.04, 1.0, '#7a5236'); at(leg, 2.2 + sx * 0.7 * Math.cos(0.25), 0, -3.4 + sx * 0.7 * Math.sin(0.25) - 0.05); g.add(leg); }
    const chartC = document.createElement('canvas'); chartC.width = 512; chartC.height = 360;
    const chartTex = new THREE.CanvasTexture(chartC); chartTex.colorSpace = THREE.SRGBColorSpace;
    const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.05), new THREE.MeshBasicMaterial({map: chartTex, transparent: true})); g.add(chart);
    chart.position.set(2.2 - Math.sin(0.25) * 0.04, 1.5, -3.4 + Math.cos(0.25) * 0.04); chart.rotation.y = -0.25;
    let lastU = -1;
    const drawChart = (u) => {
      if (Math.abs(u - lastU) < 0.004) return; lastU = u;
      const x = chartC.getContext('2d'); x.clearRect(0, 0, 512, 360);
      x.strokeStyle = '#f3efe6'; x.lineWidth = 6; x.beginPath(); x.moveTo(40, 20); x.lineTo(40, 330); x.lineTo(500, 330); x.stroke();
      x.font = '900 46px "Inter Display"'; x.fillStyle = '#f3efe6'; x.fillText(L.chart, 60, 64);
      x.strokeStyle = '#ff8a5a'; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath();
      const N = 60; let px = 0, py = 0;
      for (let i = 0; i <= N * u; i++) { const k = i / N; px = 50 + k * 430; py = 320 - 280 * Math.pow(k, 4.5); i ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
      if (u > 0.05) { x.fillStyle = '#ff8a5a'; x.beginPath(); x.moveTo(px, py - 26); x.lineTo(px - 18, py + 8); x.lineTo(px + 18, py + 8); x.closePath(); x.fill(); }
      chartTex.needsUpdate = true;
    };
    const clk = P.wallClock(0.36); at(clk.group, -1.6, 2.2, -5.1); g.add(clk.group);
    const tagA = sign(L.tagA, 0.9, 0.5, {bg: '#fff3df', frame: '#7a5236', sub: L.price}); at(tagA, -0.3, 1.9, -5.05); g.add(tagA);
    const tagB = sign(L.tagB, 0.9, 0.5, {bg: '#d8413a', fg: '#fff3df', frame: '#7a5236', sub: L.price}); at(tagB, -0.3, 1.9, -5.05); g.add(tagB);
    const x2 = P.glyph(L.x2, 0.8, '#f2d24a'); x2.position.set(0.75, 2.3, -4.9); g.add(x2);
    const dayS = sign(L.day, 1.0, 0.34, {bg: '#f2d24a', frame: '#8a6a2a'}); at(dayS, -1.6, 2.8, -5.05); g.add(dayS);
    const local = ch('local', {seed: 61}, g, 0.0, -2.6, 0);
    const giant = P.banknote(L.note, {w: 1.1, tex: P.noteTex(L.note, {seed: 9, color: '#c9a8e0', dark: '#5a3a80'})}); g.add(giant);
    const fNotes = held(local, P.noteStack(3, {value: L.foreignVal, color: '#a8c8e0', dark: '#3a5a7a', seed: 7}), {y: -0.02});
    const barrow = P.wheelbarrow(); at(barrow, -1.15, 0, -2.2, 0.4); g.add(barrow);
    const heap = new THREE.Group(); at(heap, -1.15, 0.5, -2.2); g.add(heap);
    for (let i = 0; i < 6; i++) { const s = P.noteStack(4, {value: L.noteVal}); at(s, (i % 3) * 0.2 - 0.2, Math.floor(i / 3) * 0.1, (i % 2) * 0.15 - 0.07, i * 0.7); heap.add(s); }
    const bin = cyl(0.3, 0.26, 0.75, toon('#5a6a5a', {paint: {seed: 64, stains: 12}})); at(bin, 1.15, 0, -2.0); g.add(bin);
    const binNotes = new THREE.Group(); at(binNotes, 1.15, 0.8, -2.0); g.add(binNotes);
    for (let i = 0; i < 5; i++) { const b = P.banknote(L.noteVal, {tex: noteTex, w: 0.3}); at(b, (i - 2) * 0.07, 0.02 * i, 0, i * 0.6, -1.2 + i * 0.2); binNotes.add(b); }
    local.act([
      {t: 0, pose: 'present', expr: 'smug', action: 'talk', dur: 1.0},
      {t: E('negara') + 0.1, pose: 'point', expr: 'surprised'},
      {t: E('barang') + 0.1, pose: 'shrug', expr: 'worried'},
      {t: E('meroket') + 0.1, pose: 'armsUp', expr: 'scream', action: 'jump', dur: 0.6},
      {t: cut(8), pose: 'pointUp', expr: 'grimace'},
      {t: E('hari') + 0.1, pose: 'headHold', expr: 'shocked', action: 'tremble', dur: 0.7},
      {t: E('triliun') + 0.05, pose: 'present', expr: 'cheesy', action: 'jump', dur: 0.6},
      {t: cut(9), pose: 'limp', expr: 'sad', action: 'slump', dur: 1.5},
      {t: E('dipakai') + 0.1, pose: 'facepalm', expr: 'irritated', action: 'shake', dur: 0.6},
      {t: E('asing') + 0.1, pose: 'present', expr: 'toothy', action: 'hop', dur: 0.6},
    ]);
    fx(g, FX.sparks([2.4, 2.0, -3.2], E('meroket'), {n: 40, color: '#ff9a5a'}), (t) => inShots(t, 7));
    fx(g, FX.glints([1.0, 1.5, -2.6], E('triliun'), {n: 30, color: '#e8d0ff'}), (t) => inShots(t, 8));
    fx(g, FX.dust([-1.15, 0.2, -2.2], E('dipakai')), (t) => inShots(t, 9));
    updaters.push((t) => {
      const s7 = inShots(t, 7), s8 = inShots(t, 8), s9 = inShots(t, 9);
      drawChart(s7 ? smooth((t - E('barang') + 0.3) / (E('meroket') - E('barang') + 0.6)) : 1);
      board.visible = chart.visible = s7;
      signQ.visible = s7; signQ.scale.setScalar(pop(t, E('negara') - 0.1, 0.4));
      const doubled = s8 && Math.floor((t - E('dua')) / 0.5) % 2 === 1 && t > E('dua');
      tagA.visible = s8 && !doubled; tagB.visible = s8 && doubled;
      x2.visible = s8 && t > E('dua'); x2.scale.setScalar(0.8 * pop(t, E('dua'), 0.35));
      dayS.visible = clk.group.visible = s8; dayS.scale.setScalar(pop(t, E('hari') - 0.1, 0.35));
      clk.set(s8 ? 8 + Math.max(0, t - E('dua')) * 6 : 8, s8 ? (Math.max(0, t - E('dua')) * 360) % 60 : 0);
      giant.visible = s8 && t > E('triliun') - 0.1; giant.scale.setScalar(pop(t, E('triliun') - 0.1, 0.4)); giant.position.set(0.95, 1.45 + Math.sin(t * 2.5) * 0.03, -2.5); giant.rotation.set(0, -0.3, 0.1);
      fNotes.visible = s9 && t > E('asing'); fNotes.scale.setScalar(pop(t, E('asing'), 0.35));
      barrow.visible = heap.visible = bin.visible = binNotes.visible = s9;
    });
  }

  // ---------- collector's shop: the note is worth more today (shot 10) ----------
  {
    const g = addLoc('collector');
    under(g, '#3a3036');
    g.add(P.room(8, 3.6, 6.5, {wall: '#e8d8b8', floor: '#8a6a4a', wain: '#4a6a5a'}));
    const shopSign = sign(L.collectorShop, 1.8, 0.45, {bg: '#4a6a5a', fg: '#fff3df', frame: '#2a3a32'}); at(shopSign, -1.4, 3.0, -5.45); g.add(shopSign);
    const frame = P.noteFrame(L.note, {w: 1.8, seed: 9, color: '#c9a8e0', dark: '#5a3a80'}); at(frame, 0.6, 2.2, -5.4); g.add(frame);
    const spot = new THREE.PointLight('#fff1c0', 0, 4, 1.4); spot.position.set(0.6, 2.8, -4.6); g.add(spot);
    const tag = sign(L.forSale, 1.0, 0.42, {bg: '#6fd06a', frame: '#2a6a3a'}); at(tag, 0.6, 1.4, -5.4); g.add(tag);
    const counter = box(2.6, 0.95, 0.7, toon('#7a5236', {paint: {planks: 3, seed: 75}})); at(counter, 0.4, 0, -3.9); g.add(counter);
    for (let i = 0; i < 3; i++) { const c = P.coinPile(8, 40 + i); at(c, -0.4 + i * 0.5, 0.95, -3.85); g.add(c); }
    const glass = box(0.8, 0.3, 0.5, new THREE.MeshBasicMaterial({color: '#cfe8ff', transparent: true, opacity: 0.35})); at(glass, 1.3, 0.95, -3.9); g.add(glass);
    const coll = ch('collector', {seed: 71}, g, -0.9, -3.0, 0.3);
    held(coll, P.magnifier(), {y: 0.05, z: 0.1});
    coll.act([
      {t: 0, pose: 'hold', expr: 'thinking'},
      {t: E('kolektor') + 0.1, pose: 'present', expr: 'smug'},
      {t: E('mahal') + 0.1, pose: 'cheer', expr: 'toothy', action: 'jump', dur: 0.6},
    ]);
    fx(g, FX.glints([0.6, 2.2, -5.2], E('kolektor'), {n: 28}), (t) => inShots(t, 10));
    updaters.push((t) => {
      tag.scale.setScalar(pop(t, E('mahal') - 0.1, 0.4));
      spot.intensity = 3 * smooth((t - E('kolektor') + 0.2) / 0.4);
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
