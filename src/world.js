// All locations in one scene at different x offsets. Story: "Menjual Menara Eiffel" (Victor Lustig, Paris 1925).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {tower: 0, cafe: 40, office: 80, hotel: 120, home: 160, station: 200, police: 240};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'dapper' (new for this video; round no-sleep face, side-swept hair, thin brows, long legs).
export const CHAR_DESIGN = 'dapper';
const suit = (jacket, lapel, lower, tie, o = {}) => ({outfit: 'suit', jacket, lapel, lower, tie, pocket: jacket, ...o});
const CAST = {
  lustig: suit('#3a3a4a', '#24222c', '#2e2e3a', '#b8323a', {hair: '#2b2326', hairStyle: 'side', hat: 'bowler', hatColor: '#26262e', mustache: 'thin'}),
  poisson: suit('#8a6a4a', '#5e4430', '#5a4636', '#e8c35a', {hair: '#5a3a2a', hairStyle: 'tuft', hat: 'bowler', hatColor: '#5a4a3a', mustache: 'thick', glasses: true}),
  wife: {outfit: 'farmer', jacket: '#9a5a7a', lower: '#5a3a52', tie: '#9a5a7a', pocket: '#8a4a6a', hair: '#6a3a2a', hairStyle: 'bun', hat: 'none'},
  d1: suit('#7a7f88', '#5a5f68', '#4a4f58', '#d8413a', {hair: '#3a2a26', hairStyle: 'fringe', hat: 'cap', hatColor: '#5a5f68', hatColor2: '#4a4f58'}),
  d2: suit('#5a7a5a', '#3f5a3f', '#3a4a3a', '#e8c35a', {hair: '#2b2326', hairStyle: 'side', hat: 'bowler', hatColor: '#34402f'}),
  d3: suit('#a8885a', '#86683e', '#6a5a46', '#4f7fa6', {hair: '#d8d0c8', hairStyle: 'bald', hat: 'none', mustache: 'thick'}),
  d4: suit('#3f4f6a', '#2c3a52', '#2a3448', '#f2d24a', {hair: '#3a2a26', hairStyle: 'tuft', hat: 'cap', hatColor: '#2f3f5a', hatColor2: '#26324a', glasses: true}),
  victim: suit('#6a4a6a', '#4e344e', '#3a2a3a', '#e8c35a', {hair: '#3a2a26', hairStyle: 'side', hat: 'bowler', hatColor: '#3a2a3a', mustache: 'thick'}),
  police: {outfit: 'farmer', jacket: '#2f4a7a', lower: '#22304a', tie: '#2f4a7a', pocket: '#263e6a', hair: '#2b2326', hat: 'cap', hatColor: '#22304a', hatColor2: '#d8413a', mustache: 'thick'},
};
const OFFICIAL = {hat: 'top', hatColor: '#1f1f26', sash: true}; // his disguise: top hat + tricolour sash

// Lighting: golden Paris at the tower, a bright street for the newspaper, a lamp-lit night room for the forgery,
// a warm grand hotel (tense when the plan wobbles), Poisson's home, a grey station, red danger when the police come.
const hotelL = {...LOOK_PRESETS.interiorWarm, keyI: 2.5, hemiI: 1.3};
const homeL = {...LOOK_PRESETS.interiorWarm, keyI: 2.3, hemiI: 1.25};
const gold = {...LOOK_PRESETS.goldenHour, near: 24, far: 110};
export const LOOK = {
  tower: {keys: [{at: 0, ...gold}, {at: 'cut11', ...gold},
    {at: 'polisi2', ...gold, ...MOODS.danger}, {at: 'cut12', ...LOOK_PRESETS.sunset, near: 24, far: 110, ...MOODS.joyful}]},
  cafe: {keys: [{at: 0, ...LOOK_PRESETS.day, near: 30, far: 150}, {at: 'berbinar', ...LOOK_PRESETS.day, near: 30, far: 150, ...MOODS.joyful}]},
  office: {...LOOK_PRESETS.candle, keyI: 1.7, hemiI: 0.85},
  hotel: {keys: [{at: 0, ...hotelL}, {at: 'mundur', ...hotelL, ...MOODS.nostalgic}, {at: 'cut3', ...hotelL}, {at: 'rencana', ...hotelL, ...MOODS.tense},
    {at: 'cut9', ...hotelL}, {at: 'lega', ...hotelL, ...MOODS.joyful}, {at: 'cut10', ...hotelL}]},
  home: {keys: [{at: 0, ...homeL}, {at: 'curiga', ...homeL, ...MOODS.tense}]},
  station: {...LOOK_PRESETS.overcast, keyI: 1.8},
  police: {keys: [{at: 0, ...LOOK_PRESETS.overcast, keyI: 1.8}, {at: 'malu', ...LOOK_PRESETS.overcast, keyI: 1.8, ...MOODS.sad}]},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

// Screen-level effects: flashes and shakes.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.menjual, dur: 0.35, color: '#ffe9b0', strength: 0.35},
      {t: EVt.mundur, dur: 0.3, color: '#ffffff', strength: 0.35},
      {t: EVt.berbinar, dur: 0.3, color: '#fff4c0', strength: 0.3},
      {t: EVt.rahasia, dur: 0.3, color: '#ffc0b0', strength: 0.3},
      {t: EVt.asli, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.lagi, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.hancur, dur: 0.35, amp: 0.02}, {t: EVt.polisi2, dur: 0.3, amp: 0.015}, {t: EVt.tertangkap, dur: 0.3, amp: 0.02}],
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
  const walkPath = (c, keys, action = 'walk') => {
    const rest = c.state.yaw0;
    for (let i = 0; i < keys.length - 1; i++) { const [a, x0, z0] = keys[i], [b, x1, z1] = keys[i + 1]; if (b - a > 0.05 && Math.hypot(x1 - x0, z1 - z0) > 0.2) c.act([{t: a, action, dur: b - a}]); }
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
  const lamp = (g, x, z, ry = 0) => { const l = P.streetLamp(); at(l, x, 0, z, ry); g.add(l); return l; };
  const parisRow = (g, xs, z, seed) => xs.forEach((x, i) => { const tr = P.terrace(3.2, {color: ['#e8dcc0', '#ded0b0', '#efe3c8', '#d9c9a6'][(i + seed) % 4], roof: '#5a6a7a', trim: '#fbf6ea', shutter: '#4f6a7a', door: '#3a4a5a', seed: seed + i}).group; at(tr, x, 0, z); g.add(tr); });

  // ---------- the Eiffel Tower: hook (1-2), the payment (10), the second sale (11), the question (12) ----------
  {
    const g = addLoc('tower');
    under(g, '#cdbb92', 260);
    const path = box(9, 0.02, 120, toon('#dccb9e', {paint: {seed: 21, stains: 20}}), {edges: false}); at(path, 0, -0.03, -40); g.add(path);
    for (const s of [-1, 1]) {
      const grass = box(30, 0.03, 120, toon('#8fae6a', {paint: {seed: 22 + s, stains: 18}}), {edges: false}); at(grass, s * 19.5, -0.03, -40); g.add(grass);
      for (let i = 0; i < 7; i++) { const tr = P.tree({seed: 30 + i + (s > 0 ? 10 : 0), h: 2.6, leaf: '#6f9a4f'}); at(tr, s * 5.6, 0, -3 - i * 4.2); g.add(tr); }
      for (let i = 0; i < 3; i++) lamp(g, s * 3.6, -1.5 - i * 6, s > 0 ? Math.PI : 0);
    }
    const tower = P.eiffelTower(32); at(tower, 0, 0, -38); g.add(tower);
    // the second sale (11): a new buyer, then the police
    const l2 = ch('lustig', {seed: 4, ...OFFICIAL}, g, 0.45, -2.2, -0.45);
    const victim = ch('victim', {seed: 5}, g, -0.55, -2.2, 0.45);
    const cop = ch('police', {seed: 6}, g, 4.5, -1.9, -0.6);
    [l2, victim, cop].forEach((c) => showWhen(c.group, (t) => inShots(t, 11)));
    const whistle = cyl(0.02, 0.03, 0.1, '#c9982f', {hull: 0.005, center: true}); held(cop, whistle, {y: 0.02, z: 0.08, rz: Math.PI / 2});
    walkPath(cop, [[E('polisi2') - 0.3, 4.5, -1.9], [E('nyaris') + 0.6, 1.5, -1.9], [E('tertangkap') + 0.2, 0.9, -1.8], [cut(12), 0.9, -1.8]], 'run');
    walkPath(l2, [[cut(11), 0.45, -2.2], [E('nyaris') - 0.05, 0.45, -2.2], [E('nyaris') + 0.45, -0.2, -1.5], [E('tertangkap') + 1.0, -4.8, -1.6]], 'run');
    l2.act([{t: cut(11), pose: 'cross', expr: 'scheming'}, {t: E('belum') + 0.1, pose: 'chin', expr: 'scheming'}, {t: E('kembali') + 0.1, pose: 'presentBoth', expr: 'cheesy'},
      {t: E('lagi') + 0.05, pose: 'present', expr: 'toothy'}, {t: E('polisi2') + 0.1, pose: 'armsUp', expr: 'shocked'}, {t: E('nyaris') + 0.05, pose: 'idle', expr: 'scream'}]);
    l2.act([{t: E('polisi2') + 0.1, action: 'jump', dur: 0.5}]);
    victim.act([{t: cut(11), pose: 'idle', expr: 'cheesy'}, {t: E('lagi') + 0.1, pose: 'cheer', expr: 'excited'}, {t: E('korban') + 0.05, pose: 'point', expr: 'angry'}]);
    cop.act([{t: cut(11), pose: 'idle', expr: 'neutral'}, {t: E('polisi2') - 0.2, pose: 'point', expr: 'furious'}, {t: E('tertangkap') + 0.1, pose: 'stop', expr: 'gritted'}]);
    fx(g, FX.dust([0.2, 0.1, -1.6], E('nyaris') + 0.3), (t) => inShots(t, 11));
    // the question (12)
    const l3 = ch('lustig', {seed: 7}, g, 0, -2.2, 0);
    showWhen(l3.group, (t) => inShots(t, 12));
    l3.act([{t: cut(12), pose: 'shrug', expr: 'smug'}, {t: E('target') + 0.05, pose: 'chin', expr: 'scheming'}, {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy'}]);
    popSign(g, sign(L.question, 1.6, 0.4, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}), 0, 3.0, -2.5, E('target') - 0.3, 1e9, (t) => inShots(t, 12));
    popSign(g, sign(L.comment, 1.5, 0.38, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}), 0, 2.52, -2.45, E('komentar') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.confetti([0, 2.9, -2.3], E('komentar') + 0.05), (t) => inShots(t, 12));
  }

  // ---------- Paris street: the newspaper (3) and the idea (4) ----------
  {
    const g = addLoc('cafe');
    under(g, '#a89a86', 300);
    const street = box(30, 0.02, 200, toon('#b8aa94', {paint: {cobbles: true, seed: 33}}), {edges: false}); at(street, 0, -0.03, -90); g.add(street);
    parisRow(g, [-7.2, -4.0], -6.2, 1); parisRow(g, [3.3, 6.5], -6.2, 3);
    parisRow(g, [-9.4, -6.2], -14, 5); parisRow(g, [5.6, 8.8], -14, 2);
    const far = P.eiffelTower(32); at(far, 0.4, 0, -78); g.add(far);
    const park = box(40, 0.03, 40, toon('#8fae6a', {paint: {seed: 34}}), {edges: false}); at(park, 0, -0.02, -78); g.add(park);
    const aw = P.awning(3.0, {color: '#b8323a'}); at(aw, 4.9, 2.55, -6.15); g.add(aw);
    const cs = sign('CAFÉ', 1.2, 0.34, {bg: '#2f3a30', fg: '#f2d24a', frame: '#2f3a30'}); at(cs, 4.9, 3.05, -6.0); g.add(cs);
    [[3.9, -4.7], [5.6, -4.9]].forEach(([x, z], i) => { const tb = P.cafeTable({cup: true}); at(tb, x, 0, z, 0.3 * i); g.add(tb); });
    const kq = P.kiosk(L.kiosk); at(kq, -2.6, 0, -4.2, 0.35); g.add(kq);
    lamp(g, 1.7, -3.3, Math.PI);
    const lustig = ch('lustig', {seed: 1}, g, -0.4, -2.45, 0.1);
    const paper = P.newspaper(L.head, L.sub, {w: 0.62}); at(paper, -0.42, 1.2, -2.08, 0, -0.12); g.add(paper);
    updaters.push((t) => { const k = smooth((t - E('berbinar') + 0.1) / 0.35); paper.position.y = 1.2 - 0.45 * k; paper.rotation.x = -0.12 - 0.9 * k; });
    lustig.act([
      {t: 0, pose: 'read', expr: 'thinking'},
      {t: E('koran') + 0.1, pose: 'read', expr: 'surprised'},
      {t: E('mahal') + 0.1, pose: 'read', expr: 'thinking'},
      {t: E('berbinar') - 0.05, pose: 'hold', expr: 'excited'},
      {t: E('kujual') + 0.05, pose: 'chin', expr: 'scheming'},
    ]);
    speak(lustig, 7, [[0, 'thinking', 'chin'], [0.45, 'scheming', 'pointUp']]);
    fx(g, FX.glints([-0.4, 1.75, -2.2], E('berbinar'), {n: 26}), (t) => inShots(t, 4));
    const idea = P.bulb(0.55); g.add(idea.group); const tB = E('kalau') - 0.1;
    updaters.push((t) => { idea.group.visible = inShots(t, 4) && t > tB; idea.group.scale.setScalar(pop(t, tB, 0.35)); idea.group.position.set(-0.4, 2.2 + Math.sin(t * 3) * 0.02, -2.4); idea.set(t > tB + 0.25 ? 1 : 0); });
  }

  // ---------- Lustig's room at night: the forged letter and the disguise (5) ----------
  {
    const g = addLoc('office');
    under(g, '#1e1618');
    g.add(P.room(6, 3, 5, {wall: '#a8906c', floor: '#7a5236', wain: '#6a4a32'}));
    const win = box(1.3, 1.1, 0.06, new THREE.MeshBasicMaterial({color: '#24345a'}), {hull: 0.02}); at(win, -1.6, 1.3, -3.85); g.add(win);
    const mo = ball(0.14, new THREE.MeshBasicMaterial({color: '#fff3c8'}), {hull: 0}); at(mo, -1.3, 2.05, -3.8); g.add(mo);
    for (const s of [-1, 1]) { const dr = box(0.3, 1.5, 0.08, '#7a2a2a'); at(dr, -1.6 + s * 0.78, 0.95, -3.8); g.add(dr); }
    const desk = P.desk({color: '#8a5a3a'}); at(desk, 0.5, 0, -2.9); g.add(desk);
    const lampB = cyl(0.03, 0.08, 0.45, '#3a3a40', {hull: 0.008}); at(lampB, 1.1, 0.77, -3.1); g.add(lampB);
    const shadeL = cyl(0.08, 0.18, 0.16, '#2f6a4a', {hull: 0.008}); at(shadeL, 1.1, 1.18, -3.1); g.add(shadeL);
    const lg = P.glowSprite('#ffd08a', 1.4); at(lg, 1.1, 1.1, -3.05); g.add(lg);
    const fl = FX.fireLight([1.0, 1.4, -2.6], {intensity: 2.2, dist: 6}); g.add(fl.obj); updaters.push((t) => fl.update(t));
    const letter = sign(L.letter, 0.6, 0.42, {bg: '#fbf6ea', fg: '#351f22', frame: '#e8e0d0', depth: 0.006}); at(letter, 0.33, 0.95, -2.78, 0, -0.95); g.add(letter);
    const seal = sign(L.seal, 0.13, 0.13, {bg: '#d8413a', fg: '#fff3df', frame: '#d8413a', depth: 0.004, border: false}); at(seal, 0.6, 0.868, -2.655, 0, -0.95); g.add(seal);
    const stamp = P.rubberStamp(); g.add(stamp);
    const tS = E('palsu') + 0.35;
    updaters.push((t) => {
      const u = t - tS, down = u > 0 && u < 0.25 ? Math.sin(u / 0.25 * Math.PI) : 0;
      stamp.position.set(u > 0.25 ? 0.8 : 0.6, 1.1 - 0.19 * down, u > 0.25 ? -2.95 : -2.64);
      seal.visible = u > 0.12; seal.scale.setScalar(u > 0.12 ? pop(t, tS + 0.12, 0.25) : 0.001);
    });
    const ink = cyl(0.05, 0.05, 0.08, '#2b2b33', {hull: 0.006}); at(ink, -0.05, 0.77, -3.05); g.add(ink);
    const quill = box(0.01, 0.3, 0.01, '#fbf6ea', {hull: 0.004}); at(quill, -0.05, 0.84, -3.05, 0, 0, 0.3); g.add(quill);
    const wr = P.wardrobe('#6a4a32'); at(wr, -2.3, 0, -3.4); g.add(wr);
    const me = ch('lustig', {seed: 1}, g, -0.45, -2.4, 0.35);
    const off = ch('lustig', {seed: 1, ...OFFICIAL}, g, -0.45, -2.4, 0.1);
    const tSwap = E('menyamar') + 0.15;
    showWhen(me.group, (t) => t < tSwap); showWhen(off.group, (t) => t >= tSwap);
    fx(g, FX.smoke([-0.45, 1.2, -2.2], E('menyamar') - 0.05, {n: 12, every: 0.015, life: 0.8, size: 0.55, grow: 1.8, rise: 0.4, drift: 0.2, color: '#f3ece0', opacity: 0.9}));
    me.act([{t: cut(5), pose: 'tap', expr: 'scheming'}, {t: tS, pose: 'hammerDown', expr: 'toothy'}, {t: tS + 0.4, pose: 'present', expr: 'smug'}]);
    off.act([{t: tSwap, pose: 'hips', expr: 'proud'}, {t: tSwap + 0.6, pose: 'present', expr: 'scheming'}]);
  }

  // ---------- the grand hotel: the meeting (5-7), the doubt (8), the bribe (9) ----------
  {
    const g = addLoc('hotel');
    under(g, '#2a1e1c');
    g.add(P.room(10, 3.8, 6, {wall: '#eedcbc', floor: '#8a3a36', wain: '#b8904a', floorPaint: {planks: 0}}));
    for (const x of [-3.2, 3.0]) {
      const w = box(1.3, 2.0, 0.06, new THREE.MeshBasicMaterial({color: '#bfe0f0'}), {hull: 0.02}); at(w, x, 0.9, -4.86); g.add(w);
      for (const s of [-1, 1]) { const dr = box(0.4, 2.7, 0.1, toon('#a82a36', {paint: {stripes: {n: 8, color: '#962230'}}})); at(dr, x + s * 0.85, 0.6, -4.8); g.add(dr); }
    }
    const chand = P.chandelier(); at(chand, 0.3, 4.15, -2.6); g.add(chand);
    const plaque = sign(L.hotel, 1.9, 0.42, {bg: '#2a2a32', fg: '#e8c04a', frame: '#c9982f'}); at(plaque, 0.0, 2.95, -4.85); g.add(plaque);
    const table = box(3.6, 0.76, 0.9, toon('#f6efe0', {paint: {seed: 41}})); at(table, 1.0, 0, -3.2); g.add(table);
    for (let i = 0; i < 5; i++) { const gl = cyl(0.04, 0.03, 0.12, '#dff0fa', {hull: 0.005}); at(gl, -0.4 + i * 0.75, 0.76, -2.95); g.add(gl); }
    const plan = P.easel(P.towerPlan(L.plan, L.planSub)); at(plan, -2.3, 0, -3.0, 0.45); g.add(plan);
    const lustig = ch('lustig', {seed: 1, ...OFFICIAL}, g, -1.45, -2.55, 0.55);
    const D = ['d1', 'd2', 'poisson', 'd3', 'd4'].map((k, i) => ch(k, {seed: 20 + i}, g, -0.3 + i * 0.75, -3.95, -0.1 + i * 0.05));
    const poisson = D[2];
    const meet = (t) => t >= E('mengundang') - 0.2 && t < E('istri');
    D.forEach((d, i) => {
      showWhen(d.group, meet);
      const x = -0.3 + i * 0.75, t0 = E('mengundang') + i * 0.22;
      walkPath(d, [[t0 - 0.1, 4.4, -2.3], [t0 + 1.3, x + 0.25, -2.3], [t0 + 1.9, x, -3.95]]);
      // sit down: the table hides the legs, so lowering the body reads as sitting on a chair
      updaters.push((t) => { d.group.position.y = -0.4 * smooth((t - t0 - 1.95) / 0.3); });
      const chair = box(0.5, 1.15, 0.08, toon('#7a2a2a', {paint: {seed: 44 + i}})); at(chair, x, 0, -4.3); g.add(chair); showWhen(chair, (t) => t > E('mengundang') - 0.3);
    });
    showWhen(lustig.group, (t) => t >= E('mengundang') - 0.2 && t < E('istri'));
    lustig.act([{t: 0, pose: 'presentBoth', expr: 'cheesy'}, {t: cut(6), pose: 'presentBoth', expr: 'smug'}, {t: E('dibongkar') + 0.05, pose: 'present', expr: 'proud'},
      {t: E('ingat') + 0.05, pose: 'pointUp', expr: 'scheming'}, {t: E('jangan') + 0.05, pose: 'shh', expr: 'scheming'}, {t: cut(7), pose: 'idle', expr: 'scheming'}]);
    speak(lustig, 9, [[0, 'cheesy', 'presentBoth'], [0.6, 'proud', 'present']]);
    speak(lustig, 10, [[0, 'scheming', 'pointUp']]);
    speak(lustig, 11, [[0, 'scheming', 'shh']]);
    const reac = [['surprised', 'excited'], ['thinking', 'cheesy'], ['excited', 'cheesy'], ['confused', 'thinking'], ['surprised', 'nervous']];
    popSign(g, sign('SSST...', 0.7, 0.26, {bg: '#fff3df', fg: '#351f22', frame: '#351f22', depth: 0.03}), -1.05, 2.35, -2.4, E('jangan') - 0.05, cut(7), (t) => inShots(t, 6));
    D.forEach((d, i) => d.act([{t: E('mengundang') + 2.2, pose: 'idle', expr: 'neutral'}, {t: E('dibongkar') + 0.1 + i * 0.07, pose: i % 2 ? 'chin' : 'idle', expr: reac[i][0]},
      {t: E('rahasia') + 0.1 + i * 0.05, pose: 'idle', expr: reac[i][1]}]));
    poisson.act([{t: E('termakan') - 0.05, pose: 'cheer', expr: 'excited'}, {t: E('poisson') + 0.1, pose: 'presentBoth', expr: 'toothy'}]);
    poisson.act([{t: E('termakan'), action: 'jump', dur: 0.5}]);
    popSign(g, sign(L.poisson, 1.4, 0.36, {bg: '#fff3df', fg: '#351f22', frame: '#351f22'}), 1.2, 2.6, -3.8, E('poisson') - 0.05, E('istri'), (t) => inShots(t, 7));
    fx(g, FX.glints([1.2, 1.9, -3.8], E('termakan'), {n: 20}), (t) => inShots(t, 7));
    // the corner by the window: the plan wobbles (8), the bribe (9)
    const arm = P.sofa('#a82a36'); at(arm, 3.9, 0, -4.3); g.add(arm);
    const l2 = ch('lustig', {seed: 3, ...OFFICIAL}, g, 3.25, -2.4, 0.35);
    const p2 = ch('poisson', {seed: 8}, g, 4.25, -2.4, -0.35);
    const hookVis = (t) => inShots(t, 1, 2) || (inShots(t, 10) && t < E('kabur'));
    showWhen(l2.group, (t) => hookVis(t) || (t >= E('rencana') - 0.3 && t < cut(10)));
    showWhen(p2.group, (t) => hookVis(t) || (t >= cut(9) && t < cut(10)));
    const moneyCase = () => { const c = P.suitcase('#6a3a2a'); for (let i = 0; i < 4; i++) { const n = P.banknote('1000 F', {w: 0.2, color: '#9ac08a', dark: '#3a6a3a'}); at(n, -0.13 + i * 0.085, 0.6, 0, 0, 0, (i - 1.5) * 0.25); c.add(n); } return c; };
    const caseP = held(p2, moneyCase(), {hand: 1, y: -0.5, z: 0.06}), caseL = held(l2, moneyCase(), {hand: 0, y: -0.5, z: 0.06});
    const pass = (t) => { // 0 = Poisson holds it, 1 = Lustig, -1 = nobody (the middle of the story)
      if (inShots(t, 10)) return t > E('dibayar') + 0.15 ? 1 : 0;
      if (t >= cut(3)) return -1;
      if (t < E('koper') + 0.35 || t >= E('mundur') + 0.3) return 0;
      return 1;
    };
    updaters.push((t) => { const k = pass(t); caseP.visible = k === 0; caseL.visible = k === 1; });
    fx(g, FX.glints([3.75, 1.3, -2.1], E('tangan'), {n: 18}), (t) => inShots(t, 1));
    l2.act([
      {t: 0, pose: 'idle', expr: 'smug'}, {t: E('koper') + 0.1, pose: 'give', expr: 'scheming'}, {t: E('koper') + 0.7, pose: 'idle', expr: 'smug'},
      {t: E('pria') + 0.05, pose: 'idle', expr: 'scheming'}, {t: E('bagaimana') + 0.05, pose: 'chin', expr: 'smug'},
      {t: E('mundur') + 0.05, pose: 'give', expr: 'surprised'}, {t: E('mundur') + 0.6, pose: 'idle', expr: 'neutral'},
      {t: cut(8), pose: 'headHold', expr: 'worried'},
      {t: cut(10), pose: 'idle', expr: 'smug'}, {t: E('dibayar') - 0.1, pose: 'give', expr: 'cheesy'}, {t: E('dibayar') + 0.6, pose: 'idle', expr: 'scheming'}]);
    p2.act([{t: 0, pose: 'give', expr: 'cheesy'}, {t: E('koper') + 0.6, pose: 'presentBoth', expr: 'proud'}, {t: E('mundur') + 0.05, pose: 'give', expr: 'surprised'},
      {t: cut(10), pose: 'give', expr: 'cheesy'}, {t: E('dibayar') + 0.4, pose: 'presentBoth', expr: 'proud'}]);
    // a sweat drop runs down his temple when the plan wobbles
    const drop = ball(0.035, '#8fd0ef', {sy: 1.5, hull: 0.008}); g.add(drop);
    updaters.push((t) => { const u = ((t - E('rencana')) % 0.9) / 0.9; drop.visible = inShots(t, 8) && t > E('rencana'); drop.position.set(3.47, 2.0 - u * 0.3, -2.12); });
    l2.act([{t: cut(8) + 0.01, pose: 'headHold', expr: 'worried'}, {t: E('hancur') + 0.05, pose: 'headHold', expr: 'grimace'},
      {t: cut(9), pose: 'chin', expr: 'thinking'}, {t: E('jenius') + 0.05, pose: 'pointUp', expr: 'scheming'}, {t: E('diam') + 0.05, pose: 'chin', expr: 'scheming'},
      {t: E('lega') + 0.05, pose: 'cross', expr: 'smug'}, {t: E('asli') + 0.1, pose: 'hips', expr: 'toothy'}]);
    l2.act([{t: E('hancur'), action: 'tremble', dur: 0.8}, {t: E('diam'), action: 'lean', dur: 1.6, amount: -0.15}]);
    p2.act([{t: cut(9), pose: 'idle', expr: 'confused'}, {t: E('sogokan') + 0.05, pose: 'idle', expr: 'surprised'}, {t: E('lega') + 0.05, pose: 'idle', expr: 'happy'}]);
    speak(p2, 19, [[0, 'laugh', 'cheer'], [0.4, 'toothy', 'presentBoth']]);
    p2.act([{t: E('lega'), action: 'slump', dur: 0.6}]);
    const env = P.banknote('SOGOK', {w: 0.3, color: '#e8c35a', dark: '#8a6a1a'}); held(l2, env, {y: 0.02, z: 0.1}); showWhen(env, (t) => t > E('diam') && t < E('lega'));
    popSign(g, sign(L.bribe, 1.2, 0.36, {bg: '#e8c35a', fg: '#351f22', frame: '#8a6a1a'}), 3.75, 2.55, -2.6, E('sogokan') - 0.05, E('oh'), (t) => inShots(t, 9));
    fx(g, FX.glints([3.25, 1.9, -2.2], E('jenius'), {n: 18}), (t) => inShots(t, 9));
  }

  // ---------- Poisson's home: the wife is suspicious (7-8) ----------
  {
    const g = addLoc('home');
    under(g, '#2a2228');
    g.add(P.room(7, 3.2, 6, {wall: '#d9c7a0', floor: '#9a6a46', wain: '#7a5a8a'}));
    const sofa = P.sofa('#7a5a8a'); at(sofa, -2.2, 0, -4.1); g.add(sofa);
    const clock = P.wallClock(0.28, {rim: '#c9982f'}); at(clock.group, 0.1, 2.45, -4.85); g.add(clock.group); clock.set(8, 30);
    const pic = sign('', 0.8, 0.6, {bg: '#8fae6a', frame: '#c9982f', depth: 0.04}); at(pic, 2.0, 1.7, -4.85); g.add(pic);
    const tb = box(1.0, 0.75, 0.6, toon('#8a5a3a', {paint: {planks: 3, seed: 12}})); at(tb, 2.1, 0, -3.6); g.add(tb);
    const lmp = P.glowSprite('#ffd08a', 0.9); at(lmp, 2.1, 1.25, -3.6); g.add(lmp);
    const lb = cyl(0.12, 0.2, 0.3, '#e8c35a', {hull: 0.008}); at(lb, 2.1, 1.05, -3.6); g.add(lb);
    const poisson = ch('poisson', {seed: 2}, g, -0.45, -2.4, 0.3);
    const wife = ch('wife', {seed: 9}, g, 0.65, -2.5, -0.3);
    const contract = sign(L.contract, 0.32, 0.22, {bg: '#fbf6ea', fg: '#351f22', frame: '#e8e0d0', depth: 0.006}); held(poisson, contract, {y: 0.02, z: 0.1});
    poisson.act([{t: 0, pose: 'present', expr: 'cheesy'}, {t: E('curiga') + 0.1, pose: 'present', expr: 'nervous'}, {t: E('kenapa') + 0.05, pose: 'idle', expr: 'grimace'}]);
    poisson.act([{t: E('kenapa'), action: 'tremble', dur: 0.8}]);
    wife.act([{t: 0, pose: 'cross', expr: 'thinking'}, {t: E('curiga') + 0.05, pose: 'cross', expr: 'disgusted'}]);
    speak(wife, 15, [[0, 'annoyed', 'hips'], [0.45, 'irritated', 'point']]);
  }

  // ---------- the station: he flees abroad (10) ----------
  {
    const g = addLoc('station');
    under(g, '#5a5450', 120);
    const plat = box(40, 0.02, 10, toon('#b8aa94', {paint: {seed: 51, stains: 16}}), {edges: false}); at(plat, 0, -0.03, -1); g.add(plat);
    const edge = box(40, 0.04, 0.3, '#e8c35a', {edges: false}); at(edge, 0, -0.02, -3.0); g.add(edge);
    const pit = box(40, 0.02, 6, '#4a4440', {edges: false}); at(pit, 0, -0.04, -6); g.add(pit);
    const train = P.trainCar(L.train, {color: '#3f5a4a'}); at(train, 0, 0, -4.4); g.add(train);
    const car2 = P.trainCar(null, {color: '#4a5f4f'}); at(car2, -6.3, 0, -4.4); g.add(car2);
    const car3 = P.trainCar(null, {color: '#4a5f4f'}); at(car3, 6.3, 0, -4.4); g.add(car3);
    for (const x of [-3.2, 3.2]) { const p = cyl(0.1, 0.12, 3.8, '#4a5058'); at(p, x, 0, -2.2); g.add(p); }
    const roof = box(12, 0.15, 3.0, toon('#5a6068', {paint: {seed: 52}})); at(roof, 0, 3.8, -2.6); g.add(roof);
    const clk = P.wallClock(0.3, {rim: '#2b2b33'}); at(clk.group, 0, 3.4, -1.15); clk.group.rotation.y = 0; g.add(clk.group); clk.set(9, 10);
    updaters.push((t) => { const k = Math.max(0, t - E('luar') - 0.4); const dx = 0.6 * k * k; [train, car2, car3].forEach((c, i) => { c.position.x = [0, -6.3, 6.3][i] + dx; }); });
    fx(g, FX.smoke([2.6, 3.2, -4.4], cut(10), {n: 40, every: 0.14, life: 1.8, size: 0.5, grow: 2.2, rise: 1.2, drift: -0.6, color: '#f3ece0', opacity: 0.6}), (t) => inShots(t, 10));
    const lustig = ch('lustig', {seed: 1}, g, -3.8, -2.2, 0.6);
    const bag = P.suitcase('#7a4a32'); held(lustig, bag, {y: -0.5, z: 0.06});
    walkPath(lustig, [[E('kabur') - 0.25, -3.8, -2.2], [E('kabur') + 0.9, -0.1, -2.75], [E('luar') + 0.6, 0.0, -3.1]], 'run');
    showWhen(lustig.group, (t) => t < E('luar') + 0.45);
    lustig.act([{t: 0, pose: 'idle', expr: 'scheming'}, {t: E('kabur'), pose: 'idle', expr: 'toothy'}, {t: E('luar') - 0.1, pose: 'wave', expr: 'cheesy'}]);
    fx(g, FX.dust([-2.2, 0.1, -2.4], E('kabur') + 0.3), (t) => inShots(t, 10));
  }

  // ---------- the police station: Poisson is too ashamed (10) ----------
  {
    const g = addLoc('police');
    under(g, '#a89a86', 120);
    const street = box(30, 0.02, 30, toon('#b8aa94', {paint: {cobbles: true, seed: 63}}), {edges: false}); at(street, 0, -0.03, -6); g.add(street);
    const fac = P.facade(6, 3.4, {color: '#d8cbb0', windows: 2, doorX: 0, seed: 7, trim: '#8a7a5a'}); at(fac, 0, 0, -4.2); g.add(fac);
    const upper = P.facade(6, 2.4, {color: '#d8cbb0', windows: 3, door: false, seed: 9, trim: '#8a7a5a'}); at(upper, 0, 3.4, -4.2); g.add(upper);
    parisRow(g, [-6.4], -4.2, 4); parisRow(g, [6.4], -4.2, 6);
    const ps = sign(L.police, 1.5, 0.4, {bg: '#2f4a7a', fg: '#fff3df', frame: '#fff3df'}); at(ps, 0, 2.3, -3.85); g.add(ps);
    const lantern = P.glowSprite('#8ab0ff', 0.6); at(lantern, 0.9, 2.3, -3.8); g.add(lantern);
    lamp(g, -2.4, -3.0);
    const cop = ch('police', {seed: 12}, g, 1.05, -3.55, -0.2);
    const poisson = ch('poisson', {seed: 2}, g, -2.6, -2.4, 0.4);
    walkPath(poisson, [[E('danPoisson') - 0.3, -2.6, -2.4], [E('malu') - 0.1, -0.5, -3.0], [E('polisi1') + 0.25, -0.5, -3.0], [cut(11), -2.8, -2.2]]);
    poisson.act([{t: cut(10), pose: 'idle', expr: 'determined'}, {t: E('malu') - 0.05, pose: 'facepalm', expr: 'nervous'}, {t: E('polisi1') + 0.1, pose: 'facepalm', expr: 'cry'}]);
    cop.act([{t: 0, pose: 'cross', expr: 'neutral'}, {t: E('malu') + 0.1, pose: 'cross', expr: 'confused'}]);
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
