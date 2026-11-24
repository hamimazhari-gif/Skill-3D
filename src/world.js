// All locations in one scene at different x offsets. Story: "Uang seratus ribu / a banknote's day".
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {atm: 0, cafe: 40, parking: 80, room: 120, kampung: 160, kidroom: 200, desk: 240};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look for this story. Design: 'tidy' (new for this video; round no-sleep face, fringe hair, thin brows,
// slimmer limbs, medium torso and slightly longer legs). The narrator is a banknote with the same round face.
export const CHAR_DESIGN = 'tidy';
const CAST = {
  owner: {jacket: '#7fb0d8', lower: '#3a4a6a', tie: '#d8413a', hair: '#2b2326', hat: 'none', pocket: '#6a9ac8'},
  barista: {jacket: '#4a4a52', lower: '#5a4a3a', tie: '#c9935a', hair: '#4a3026', hat: 'cap', hatColor: '#2b2b33', hatColor2: '#1f1f24', pocket: '#c9935a'},
  attendant: {jacket: '#f08a2a', lower: '#3a3a42', tie: '#f2d24a', hair: '#2b2326', hat: 'cap', hatColor: '#2f5fa8', hatColor2: '#24488a', pocket: '#f2d24a'},
  veg: {jacket: '#7fa35a', lower: '#5a4a3a', tie: '#e8c35a', hair: '#3a2a26', hat: 'cap', hatColor: '#d9b45a', hatColor2: '#c49a3e', pocket: '#6a8a4a'},
  driver: {jacket: '#5a6a7a', lower: '#2a2a32', tie: '#d9774a', hair: '#2b2326', hat: 'none', glasses: true, pocket: '#4a5a6a'},
  ibu: {jacket: '#c75b8a', lower: '#5a3a4a', tie: '#f2d24a', hair: '#2b2326', hairStyle: 'bun', hat: 'none', pocket: '#a84a72'},
  nenek: {jacket: '#9a7ab8', lower: '#5a4a66', tie: '#e8dcc0', hair: '#d8d4cc', hairStyle: 'bun', hat: 'none', glasses: true, pocket: '#86669e'},
  kid: {jacket: '#f2d24a', lower: '#4f7fa6', tie: '#d8413a', hair: '#3a2a26', hairStyle: 'tuft', hat: 'none', pocket: '#e0b83a'},
};
// Banknotes (our own designs): the narrator and its change.
const BILLS = {
  red: {color: '#e0626e', dark: '#8a2a36', value: '100.000', short: '100'},
  blue: {color: '#6a96d6', dark: '#24488a', value: '50.000', short: '50'},
  green: {color: '#86be72', dark: '#3a6a3a', value: '20.000', short: '20'},
  grey: {color: '#b4bac2', dark: '#5a6068', value: '2.000', short: '2'},
};

// Lighting plan (camera_plan.md): blue first light at the ATM turning into dawn at six and day at seven, a warm café,
// a sunny parking lot, a bright room at noon that turns night for the empty wallet, a golden afternoon kampung,
// a warm evening kid's room and a soft morning desk for the closing.
const firstLight = {...LOOK_PRESETS.dawn, skyTop: '#5a6a9a', skyBottom: '#e8b8a8', key: '#d8c0d0', keyI: 1.7, hemiI: 1.05, keyPos: [-8, 4, 6]};
const roomNight = {...LOOK_PRESETS.night, fog: '#1a1e2a', key: '#ffd8a8', keyI: 1.5, hemiI: 0.95, hemiSky: '#8a90b8', keyPos: [3, 6, 5], moon: false,
  grade: {sat: 0.9, contrast: 1.06, tint: '#8a9ad8', tintAmt: 0.06, vignette: 0.5}};
const kidEvening = {...LOOK_PRESETS.interiorWarm, key: '#ffd0a0', keyI: 2.0, hemiI: 1.1, grade: {sat: 1.0, contrast: 1.03, tint: '#ffc890', tintAmt: 0.08, vignette: 0.42}};
const deskDay = {...LOOK_PRESETS.interiorWarm, keyI: 2.5, hemiI: 1.35};

export const LOOK = {
  atm: {keys: [{at: 0, ...firstLight}, {at: 'jam6', ...LOOK_PRESETS.dawn, keyPos: [-8, 5, 6]}, {at: 'gajian', ...LOOK_PRESETS.dawn, keyPos: [-8, 5, 6], ...MOODS.joyful},
    {at: 'cut3', ...LOOK_PRESETS.day}, {at: 'sejam', ...LOOK_PRESETS.day, ...MOODS.sad}]},
  cafe: {...LOOK_PRESETS.interiorWarm},
  parking: {keys: [{at: 0, ...LOOK_PRESETS.day}, {at: 'tadi', ...LOOK_PRESETS.day, ...MOODS.tense}, {at: 'prit', ...LOOK_PRESETS.day}]},
  room: {keys: [{at: 0, ...LOOK_PRESETS.interiorCool}, {at: 'flash', ...LOOK_PRESETS.interiorCool, ...MOODS.joyful}, {at: 'jangan', ...LOOK_PRESETS.interiorCool, ...MOODS.tense},
    {at: 'checkout', ...LOOK_PRESETS.interiorCool, ...MOODS.sad}, {at: 'cut10', ...roomNight}, {at: 'beli', ...roomNight, ...MOODS.sad}]},
  kampung: {keys: [{at: 0, ...LOOK_PRESETS.goldenHour}, {at: 'jajan', ...LOOK_PRESETS.goldenHour, ...MOODS.joyful}]},
  kidroom: {keys: [{at: 0, ...kidEvening}, {at: 'istirahat', ...kidEvening, ...MOODS.nostalgic}]},
  desk: {keys: [{at: 0, ...deskDay}, {at: 'hilang', ...deskDay, ...MOODS.mystery}, {at: 'cut12', ...deskDay, ...MOODS.joyful}]},
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
      {t: EVt.seratus, dur: 0.35, color: '#ffe9b0', strength: 0.3},
      {t: EVt.gajian, dur: 0.35, color: '#ffe0d0', strength: 0.35},
      {t: EVt.pecah, dur: 0.3, color: '#fff4d6', strength: 0.35},
      {t: EVt.flash, dur: 0.4, color: '#ffd0c0', strength: 0.4},
      {t: EVt.jajan, dur: 0.35, color: '#ffe9b0', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.pecah, dur: 0.3, amp: 0.02}, {t: EVt.jangan, dur: 0.3, amp: 0.015}, {t: EVt.kemana, dur: 0.3, amp: 0.015}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const post = []; // run after characters have moved (things that follow hands in world space)
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar('hero', {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const billChar = (kind, parent, s, x, y, z, o = {}) => { const b = BILLS[kind]; const c = makeChar('hero', {bill: b, lower: b.dark, jacket: b.dark, seed: o.seed || 5, scale: s, ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); c.s = s; return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  // Dialogue: mouth moves only while the voice is audible; exprs = [[fraction of the sentence, expression, pose?], ...].
  const speak = (c, si, exprs = [], from = -1) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).map(([a, b]) => [Math.max(a, from), b]).filter(([a, b]) => b - a > 0.05);
    c.act([...segs.map(([a, b]) => ({t: a, action: 'talk', dur: b - a})),
      ...exprs.map(([f, e, p]) => ({t: at0(f), expr: e, ...(p ? {pose: p} : {})}))]);
  };
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
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
      if (!o.backwards) c.state.yaw0 = rest + (dir - rest) * ramp;
    });
  };
  const zzz = (g, x, y, z, vis, size = 0.32) => {
    const zs = [0, 1, 2].map((i) => { const s = P.glyph('Z', size - i * 0.06 * size / 0.32, '#fff3df'); g.add(s); return s; });
    updaters.push((t) => zs.forEach((s, i) => {
      const u = ((t * 0.55 + i / 3) % 1);
      s.visible = vis(t); s.position.set(x + u * 0.35 * size / 0.32 + Math.sin(u * 6 + i) * 0.05, y + u * 0.7 * size / 0.32, z); s.material.opacity = Math.sin(Math.PI * u); s.material.transparent = true;
    }));
  };
  // A route for a banknote: keys [{t, to: fn(V) -> sets V (location-local) | 'hand', c, i}]: the note flies on a short arc
  // (dur s) from where it was to each new target, then stays there (following a hand while held).
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  const handPos = (g, c, i, out) => { c.hand(i).getWorldPosition(out); g.worldToLocal(out); return out; };
  const route = (g, bill, keys, o = {}) => {
    const target = (k, out) => (k.c ? handPos(g, k.c, k.i ?? 1, out).add(new THREE.Vector3(k.dx || 0, -(0.38 * bill.s - 0.02) + (k.dy || 0), 0.04)) : out.set(...k.p));
    post.push((t) => {
      let i = 0; while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
      const k = keys[i]; target(k, V);
      const dur = k.dur ?? 0.45;
      if (i > 0 && t < k.t + dur) {
        target(keys[i - 1], V2); const u = smooth((t - k.t) / dur);
        V.lerpVectors(V2, V, u); V.y += Math.sin(Math.PI * u) * (k.arc ?? 0.35);
      }
      bill.group.position.copy(V);
      if (o.vis) bill.group.visible = o.vis(t);
    });
  };
  // give an object its own copies of its (cached, shared) materials so they can be recoloured or faded
  const ownMats = (obj) => { obj.traverse((m) => { if (m.material && !m.isLineSegments) m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.side === THREE.BackSide ? m.material : m.material.clone(); }); return obj; };
  const poof = (g, p, t0, vis) => fx(g, FX.smoke(p, t0, {n: 9, life: 0.7, size: 0.32, grow: 1.8, rise: 0.25, drift: 0.6, color: '#f6efe2', opacity: 0.9}), vis);

  // ---------- the ATM at first light: intro, withdrawal and the kiss, an hour later (shots 1-3) ----------
  {
    const g = addLoc('atm');
    g.add(ground(70, 60, '#9a968e', {cobbles: false}));
    const road = box(70, 0.02, 12, toon('#5a5a62', {paint: {seed: 6, stains: 30}}), {edges: false}); at(road, 0, -0.01, 7.0); g.add(road);
    const curb = box(70, 0.14, 0.25, '#c9c4b8', {edges: false}); at(curb, 0, 0, 1.0); g.add(curb);
    const fac = [[-5.6, '#e8c99a', '#b5543c'], [-1.9, '#9ac4c0', '#5a6a7a'], [1.9, '#e6a88a', '#7a4a3a'], [5.6, '#d8d0e8', '#5a5a7a']];
    fac.forEach(([x, col, roof], i) => { const h = P.house(3.6, 3.4, 3, {color: col, roof, seed: 20 + i, windows: 2, doorX: i % 2 ? 0.9 : -0.9, shutter: '#5a7a8a'}); at(h, x, 0, -3.6); g.add(h); });
    const bankS = sign(L.bank, 1.6, 0.45, {bg: '#3f6fa8', fg: '#fff3df', frame: '#24488a'}); at(bankS, 0, 3.0, -3.45); g.add(bankS);
    const atm = P.atmBooth('ATM'); at(atm.group, 0, 0, -2.2); g.add(atm.group);
    const slot = [atm.slot[0], atm.slot[1], -2.2 + atm.slot[2]];
    // street clock on a post (left) and a lamp (right)
    const post0 = cyl(0.06, 0.07, 2.6, '#3a4048'); at(post0, -2.3, 0, -1.6); g.add(post0);
    const clk = P.wallClock(0.36, {rim: '#3a4048'}); at(clk.group, -2.3, 2.85, -1.55); g.add(clk.group);
    const lamp = P.streetLamp(); at(lamp, 2.7, 0, -1.6); g.add(lamp);
    const tree = P.tree ? P.tree({}) : null; if (tree) { at(tree, -4.2, 0, -2.2); g.add(tree); }
    const day = sign(L.day, 0.72, 0.2, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36', depth: 0.03}); at(day, -0.25, 1.4, -2.08); g.add(day);
    const pay = sign(L.payday, 1.2, 0.42, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}); at(pay, -0.35, 2.55, -1.75, 0.08); g.add(pay);

    const bill = billChar('red', g, 0.5, -0.25, 0.76, -2.0);
    const owner = ch('owner', {seed: 2}, g, -2.8, -1.5, 0.2);
    walkPath(owner, [[cut(2), -2.8, -1.5], [E('jam6') + 1.0, -0.35, -1.55], [cut(3) - 0.01, -0.35, -1.55], [cut(3), -0.6, -1.45], [cut(4), -3.6, -1.25]]);
    const grab = E('atm') + 0.45;
    // shot 1: the note on the ATM ledge; shot 2: back in the machine, out of the slot, into the owner's hand
    route(g, bill, [
      {t: 0, p: [-0.25, 0.76, -2.0]},
      {t: cut(2) - 0.01, p: [slot[0], slot[1] - 0.1, slot[2] - 0.35], dur: 0},
      {t: E('atm') - 0.1, p: [slot[0], slot[1] - 0.05, slot[2] + 0.05], dur: 0.35, arc: 0},
      {t: grab, c: owner, i: 1, dur: 0.3, arc: 0.1},
      {t: E('cium') - 0.25, p: [-0.3, 1.34, -1.3], dur: 0.3, arc: 0},
      {t: E('cium') + 0.55, c: owner, i: 1, dur: 0.3, arc: 0},
    ]);
    // the note's size: big for its intro, small once it is in the owner's hand
    updaters.push((t) => { const s = t < cut(2) ? 0.5 : 0.26; bill.group.scale.setScalar(s); bill.s = s; });
    bill.act([
      {t: 0, pose: 'wave', expr: 'cheesy'},
      {t: E('seratus') + 0.1, pose: 'presentBoth', expr: 'proud'},
      {t: E('hari') + 0.1, pose: 'point', expr: 'happy'},
      {t: E('satuhari') + 0.05, pose: 'armsUp', expr: 'excited'},
      {t: cut(2), pose: 'idle', expr: 'neutral'},
      {t: E('atm'), pose: 'armsUp', expr: 'cheesy'},
      {t: E('cium') + 0.05, pose: 'idle', expr: 'surprised'},
      {t: E('cium') + 0.5, pose: 'present', expr: 'toothy'},
      {t: E('sayang') + 0.2, pose: 'cheer', expr: 'happy'},
      {t: cut(3), pose: 'idle', expr: 'happy'},
      {t: E('sejam') - 0.1, pose: 'limp', expr: 'worried'},
    ]);
    owner.act([
      {t: 0, pose: 'idle', expr: 'tired'},
      {t: E('jam6') + 1.0, pose: 'tap', expr: 'thinking'},
      {t: E('atm') - 0.3, pose: 'tap', expr: 'surprised'},
      {t: grab, pose: 'hold', expr: 'excited'},
      {t: E('cium') - 0.25, pose: 'eat', expr: 'happy'},
    ]);
    speak(owner, 4, [[0, 'cheesy', 'carry'], [0.55, 'toothy', 'hold']]);
    owner.act([{t: cut(3), pose: 'hold', expr: 'happy'}, {t: E('sejam') - 0.1, pose: 'hold', expr: 'smug'}]);
    const hearts = [0, 1, 2].map((i) => { const h = P.heart(); h.scale.setScalar(0.22 - i * 0.04); g.add(h); return h; });
    const bigHeart = ownMats(P.heart()); g.add(bigHeart);
    fx(g, FX.glints([-0.25, 1.1, -1.9], E('seratus'), {n: 18}), (t) => inShots(t, 1));
    fx(g, FX.glints([slot[0], slot[1] + 0.1, slot[2] + 0.1], E('atm'), {n: 12}), (t) => inShots(t, 2));
    updaters.push((t) => {
      const s1 = inShots(t, 1), s2 = inShots(t, 2), s3 = inShots(t, 3);
      owner.group.visible = s2 || s3;
      bill.group.visible = s1 || (s2 && t > E('atm') - 0.12) || s3;
      day.visible = s1 && t > E('perjalanan') - 0.1; day.scale.setScalar(pop(t, E('perjalanan') - 0.1, 0.4));
      pay.visible = s2 && t > E('gajian') - 0.05; pay.scale.setScalar(pop(t, E('gajian') - 0.05, 0.4));
      // the clock: 5:58 -> 6:00 on "six"; shot 3: spins from 6 to 7
      const m = s3 ? 60 * smooth((t - E('tapi')) / (E('sejam') + 0.4 - E('tapi'))) : t < E('jam6') ? 58 : 60;
      clk.set(5, m);
      // kiss hearts float up from the note
      bill.group.getWorldPosition(V); g.worldToLocal(V);
      hearts.forEach((h, i) => { const t0 = E('cium') + 0.1 + i * 0.25, u = (t - t0) / 1.4; h.visible = s2 && u > 0 && u < 1; h.position.set(V.x + (i - 1) * 0.18 + Math.sin(u * 6 + i) * 0.04, V.y + 0.3 + u * 0.7, V.z + 0.1); h.scale.setScalar((0.2 - i * 0.03) * Math.sin(Math.PI * Math.min(1, u * 1.5))); });
      // shot 3: the big love heart above the note shrinks and greys
      const k = smooth((t - E('tapi')) / (E('sejam') + 0.3 - E('tapi')));
      bigHeart.visible = s3 && k < 0.98; bigHeart.position.set(V.x, V.y + 0.42, V.z); bigHeart.scale.setScalar(0.28 * (1 - k) + 0.02);
      bigHeart.traverse((m) => { if (m.material && m.material.color && m.material.side !== THREE.BackSide) m.material.color.set(k > 0.5 ? '#8a8a92' : '#d8413a'); });
    });
  }

  // ---------- the trendy café: the note is broken (shot 4) ----------
  {
    const g = addLoc('cafe');
    under(g, '#2a2228');
    g.add(P.room(7, 3.2, 6, {wall: '#e8d4b8', floor: '#9a6a4a', wain: '#5a4a42'}));
    const counter = box(3.2, 1.05, 0.8, toon('#3a4a52', {paint: {planks: 6, seed: 41}})); at(counter, 0, 0, -2.75); g.add(counter);
    const ctop = box(3.3, 0.06, 0.9, '#d8c8b0'); at(ctop, 0, 1.05, -2.75); g.add(ctop);
    const em = P.espressoMachine(); at(em, 1.3, 1.1, -2.95); g.add(em);
    const menu = sign(L.cafe, 2.4, 0.5, {bg: '#2b2b33', fg: '#f3e7d3', frame: '#5a4a42'}); at(menu, 0, 2.5, -4.85); g.add(menu);
    const price = sign(L.price, 1.1, 0.4, {bg: '#f3e7d3', fg: '#8a2a36', frame: '#5a4a42'}); at(price, 1.5, 1.95, -4.85); g.add(price);
    for (const x of [-1.6, 0, 1.6]) { const wire = cyl(0.01, 0.01, 0.6, '#2b2b33'); at(wire, x, 2.6, -2.6); g.add(wire); const sh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.22, 16, 1, true), new THREE.MeshBasicMaterial({color: '#e8a83a', side: THREE.DoubleSide})); at(sh, x, 2.55, -2.6); g.add(sh); const b = ball(0.07, new THREE.MeshBasicMaterial({color: '#fff3c0'}), {hull: 0}); at(b, x, 2.45, -2.6); g.add(b); }
    const plant = P.tree ? null : null;
    const barista = ch('barista', {seed: 11}, g, 0.55, -3.45, -0.1);
    const owner = ch('owner', {seed: 2}, g, -0.75, -1.9, 0.25);
    const red = billChar('red', g, 0.3, 0, 0, 0);
    route(g, red, [{t: 0, c: owner, i: 1}, {t: E('pecah') - 0.35, p: [-0.1, 1.12, -2.45], dur: 0.3, arc: 0.1}]);
    poof(g, [-0.05, 1.3, -2.4], E('pecah'), (t) => inShots(t, 4));
    // the change: 50k, 20k and 2k notes hop out onto the counter
    const change = [['blue', -0.45], ['green', -0.05], ['grey', 0.33]].map(([k, x], i) => {
      const b = billChar(k, g, 0.27, x, 1.11, -2.5, {seed: 30 + i});
      b.act([{t: 0, pose: 'armsUp', expr: ['cheesy', 'surprised', 'nervous'][i]}, {t: E('kopi') + 0.2, pose: ['wave', 'present', 'idle'][i], expr: ['happy', 'happy', 'worried'][i]}]);
      return {b, t0: E('pecah') + 0.05 + i * 0.12};
    });
    const cup = P.fancyCup(); held(barista, cup, {y: 0.0, z: 0.08});
    red.act([{t: 0, pose: 'armsUp', expr: 'happy'}, {t: E('pecah') - 0.4, pose: 'headHold', expr: 'scream'}]);
    owner.act([{t: 0, pose: 'hold', expr: 'happy'}, {t: E('pecah') - 0.4, pose: 'give', expr: 'cheesy'}, {t: E('kopi') + 0.1, pose: 'idle', expr: 'excited'}]);
    barista.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('pecah') + 0.1, pose: 'present', expr: 'cheesy'}, {t: E('kopi') + 0.05, pose: 'give', expr: 'toothy'}]);
    fx(g, FX.smoke([1.45, 1.65, -2.95], E('kopi') - 0.2, {n: 5, life: 0.9, size: 0.14, rise: 0.4, drift: 0.2, color: '#fbf6ea', opacity: 0.6}), (t) => inShots(t, 4));
    updaters.push((t) => {
      red.group.visible = t < E('pecah') + 0.05;
      change.forEach(({b, t0}) => { b.group.visible = t > t0; b.group.scale.setScalar(0.27 * pop(t, t0, 0.3)); });
      cup.visible = t > E('kopi') - 0.2; cup.scale.setScalar(pop(t, E('kopi') - 0.2, 0.3));
    });
  }

  // ---------- the parking attendant who came from nowhere (shot 5) ----------
  {
    const g = addLoc('parking');
    g.add(ground(70, 60, '#8e8a82'));
    const road = box(70, 0.02, 12, toon('#5a5a62', {paint: {seed: 7, stains: 30}}), {edges: false}); at(road, 0, -0.01, 6.5); g.add(road);
    for (let i = -3; i <= 3; i++) { const ln = box(0.08, 0.012, 1.6, '#f3efe6', {edges: false, hull: 0}); at(ln, i * 1.6 + 0.8, 0, -1.6); g.add(ln); }
    const cafe = P.house(5.0, 3.4, 3, {color: '#c9935a', roof: '#5a3a2a', seed: 51, windows: 2, doorX: 0.8, shutter: '#3a4a52'}); at(cafe, 0.5, 0, -4.2); g.add(cafe);
    const cs = sign(L.cafe, 2.2, 0.45, {bg: '#2b2b33', fg: '#f3e7d3', frame: '#5a4a42'}); at(cs, 0.5, 2.85, -4.05); g.add(cs);
    const ps = sign('P', 0.5, 0.5, {bg: '#2f5fa8', fg: '#fff3df', frame: '#24488a'}); const pp = cyl(0.04, 0.04, 2.2, '#5a5a62'); at(pp, -3.2, 0, -2.6); g.add(pp); at(ps, -3.2, 2.3, -2.55); g.add(ps);
    const tr = P.tree ? P.tree({}) : null; if (tr) { at(tr, 3.6, 0, -2.6); g.add(tr); }
    const sc = P.scooter('#d8413a'); at(sc, 0.4, 0, -2.3); g.add(sc);
    const owner = ch('owner', {seed: 2}, g, 1.25, -1.75, -0.2);
    const cup = P.fancyCup(); held(owner, cup, {hand: 0, y: 0.0, z: 0.08});
    const att = ch('attendant', {seed: 12}, g, -1.35, -1.8, 0.3);
    const grey = billChar('grey', g, 0.24, 0, 0, 0, {seed: 33});
    route(g, grey, [{t: 0, c: owner, i: 1}, {t: E('parkir') + 0.35, c: att, i: 0, dur: 0.55, arc: 0.45}]);
    grey.act([{t: 0, pose: 'idle', expr: 'nervous'}, {t: E('duaribu') + 0.1, pose: 'headHold', expr: 'grimace'}, {t: E('parkir') + 0.9, pose: 'limp', expr: 'cry'}]);
    owner.act([
      {t: 0, pose: 'hold', expr: 'happy'},
      {t: E('parkir') + 0.1, pose: 'give', expr: 'confused'},
      {t: E('tadi') + 0.05, pose: 'point', expr: 'annoyed'},
      {t: E('prit') - 0.1, pose: 'hold', expr: 'nervous'},
    ]);
    att.act([{t: 0, pose: 'idle', expr: 'scheming'}, {t: E('muncul'), action: 'popIn', dur: 0.45}, {t: E('parkir') + 0.3, pose: 'hold', expr: 'smug'}]);
    speak(att, 9, [[0, 'determined', 'wave'], [0.45, 'cheesy', 'wave'], [0.85, 'smug', 'present']]);
    // "Okay, okay, back up, boss!": the owner and his scooter roll back
    const back0 = E('terus') - 0.05, back1 = cut(6);
    walkPath(owner, [[0, 1.25, -1.75], [back0, 1.25, -1.75], [back1, 0.5, -1.55]], {backwards: true});
    poof(g, [-1.35, 0.4, -1.75], E('muncul') - 0.05, (t) => inShots(t, 5));
    const q = P.glyph('?', 0.4, '#f2d24a'); g.add(q);
    const prit = [0, 1].map(() => { const s = P.glyph('!', 0.3, '#fff3df'); g.add(s); return s; });
    updaters.push((t) => {
      att.group.visible = t > E('muncul') - 0.05;
      const k = smooth((t - back0) / (back1 - back0)); sc.position.x = 0.4 - 0.75 * k;
      q.visible = inShots(t, 5) && t > E('tadi') && t < E('prit'); q.scale.setScalar(0.4 * pop(t, E('tadi'), 0.3)); q.position.set(1.4, 2.35 + Math.sin(t * 3) * 0.04, -1.6);
      prit.forEach((s, i) => { const t0 = E('prit') + i * 0.3, u = (t - t0) / 0.5; s.visible = u > 0 && u < 1; s.position.set(-1.0 + i * 0.25, 2.2 + u * 0.3, -1.6); s.material.opacity = 1 - u; s.material.transparent = true; });
    });
  }

  // ---------- the owner's room: flash sale at noon (shots 6, 7) and the empty wallet at night (shot 10) ----------
  {
    const g = addLoc('room');
    under(g, '#2a2a30');
    g.add(P.room(6.5, 3.2, 6, {wall: '#cfe0e6', floor: '#b89a7a', wain: '#8fb0c0'}));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.1), new THREE.MeshBasicMaterial({color: '#bfe2f6'})); at(win, -1.9, 1.85, -4.88); g.add(win);
    for (const [x, y, w, h] of [[0, -0.55, 1.45, 0.08], [0, 0.55, 1.45, 0.08], [-0.68, 0, 0.08, 1.18], [0.68, 0, 0.08, 1.18], [0, 0, 0.05, 1.1]]) { const b = box(w, h, 0.06, '#f3efe6', {center: true}); at(b, -1.9 + x, 1.85 + y, -4.84); g.add(b); }
    const stars = [0, 1, 2, 3, 4].map((i) => { const s = new THREE.Mesh(new THREE.CircleGeometry(0.015, 6), new THREE.MeshBasicMaterial({color: '#fff6dc'})); at(s, -2.4 + i * 0.24, 1.55 + ((i * 37) % 70) / 100, -4.86); g.add(s); return s; });
    const wclk = P.wallClock(0.28, {rim: '#4f7fa6'}); at(wclk.group, 0.6, 2.5, -4.85); g.add(wclk.group);
    const desk = P.desk({color: '#c9a27a'}); at(desk, 0.4, 0, -3.35); g.add(desk);
    const mon = P.monitor('#8fd0e0'); at(mon, 0.2, 0.77, -3.55); g.add(mon);
    const lampN = cyl(0.12, 0.16, 0.25, '#f2d24a', {hull: 0.01}); at(lampN, 1.05, 0.77, -3.45); g.add(lampN);
    const glow = FX.fireLight([1.05, 1.3, -3.2], {intensity: 1.4, dist: 6}); g.add(glow.obj);
    // shoe boxes: four on a stack, the fifth arrives at checkout
    const boxes = ['#e8a83a', '#4f8fc8', '#7fa35a', '#c75b8a', '#d8413a'].map((c, i) => { const b = P.shoeBox(c, i === 4 ? L.shoe : ''); at(b, 1.85, i * 0.29, -3.75, -0.3); g.add(b); return b; });
    const owner = ch('owner', {seed: 2}, g, -0.55, -2.55, 0.15);
    const ph = P.phone(); ph.scale.setScalar(2.4); held(owner, ph, {y: 0.08, z: 0.1});
    const screen = ph.children[1];
    const wal = P.wallet(); held(owner, wal.group, {y: 0.03, z: 0.12});
    const blue = billChar('blue', g, 0.45, 0.75, 0.77, -3.05, {seed: 34});
    const flash = sign(L.flash, 1.7, 0.6, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a', sub: L.flashSub}); at(flash, -0.7, 2.45, -2.9, 0.06); g.add(flash);
    const chk = sign(L.checkout, 1.4, 0.42, {bg: '#4fae5a', fg: '#fff3df', frame: '#2a6a32'}); at(chk, -0.7, 2.45, -2.85, -0.04); g.add(chk);
    const empty = sign(L.empty, 0.8, 0.36, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}); at(empty, -0.25, 2.3, -2.4, 0.05); g.add(empty);
    const ghost = ownMats(P.shoeBox('#ffffff', '')); ghost.traverse((m) => { if (m.material && !Array.isArray(m.material) && m.material.side !== THREE.BackSide && !m.isLineSegments) { m.material.transparent = true; m.material.opacity = 0.5; } }); at(ghost, 1.85, 4 * 0.29, -3.75, -0.3); g.add(ghost);
    const cupN = P.fancyCup(); at(cupN, -0.1, 0.77, -3.2); g.add(cupN);
    // a fly buzzing out of the empty wallet
    const fly = new THREE.Group(); fly.add(ball(0.03, '#2b2b33', {hull: 0.006})); for (const s of [-1, 1]) { const w = ball(0.03, '#e8f4ff', {sx: 1.4, sy: 0.5, hull: 0.004}); at(w, s * 0.035, 0.03, 0); fly.add(w); } g.add(fly);
    owner.act([
      {t: cut(6), pose: 'hold', expr: 'neutral'},
      {t: E('aplikasi') + 0.1, pose: 'hold', expr: 'happy'},
      {t: E('flash') + 0.05, pose: 'hold', expr: 'cheesy', action: 'jump', dur: 0.5},
      {t: cut(7), pose: 'hold', expr: 'scheming'},
      {t: E('jangan') + 0.3, pose: 'hold', expr: 'smug'},
      {t: E('checkout') - 0.2, pose: 'tap', expr: 'toothy'},
      {t: cut(10), pose: 'hold', expr: 'tired'},
      {t: E('dompet') - 0.2, pose: 'hold', expr: 'neutral'},
    ]);
    speak(owner, 19, [[0, 'confused', 'hold'], [0.3, 'shocked', 'hold'], [0.62, 'cry', 'headHold']]);
    speak(blue, 12, [[0, 'scream', 'stop'], [0.35, 'furious', 'headHold'], [0.7, 'gritted', 'stop']]);
    blue.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('flash') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('checkout') - 0.2, pose: 'armsUp', expr: 'scream'}]);
    // the 50k note is sucked into the phone at checkout
    const tCh = E('checkout') + 0.1;
    route(g, blue, [{t: 0, p: [0.75, 0.77, -3.05]}, {t: tCh, c: owner, i: 1, dy: 0.25, dur: 0.4, arc: 0.3}]);
    fx(g, FX.glints([-0.7, 2.45, -2.8], E('flash'), {n: 26}), (t) => inShots(t, 6));
    fx(g, FX.glints([-0.7, 2.45, -2.8], E('checkout') + 0.05, {n: 16, color: '#c8ffb0'}), (t) => inShots(t, 7));
    updaters.push((t) => {
      const day = t < cut(10);
      win.material.color.set(day ? '#bfe2f6' : '#1e2a48'); stars.forEach((s) => { s.visible = !day; });
      glow.update(t); glow.obj.visible = !day;
      wclk.set(day ? 12 : 21, day ? 0 : 30);
      owner.group.visible = true;
      ph.visible = day; wal.group.visible = !day; wal.open(smooth((t - E('dompet') + 0.1) / 0.35));
      screen.material.color.set(t > E('flash') - 0.05 && t < E('checkout') ? '#ff8a7a' : t > E('checkout') ? '#9ae0a0' : '#8fd0e0');
      blue.group.visible = inShots(t, 6, 7) && t < tCh + 0.38; blue.group.scale.setScalar(0.45 * (1 - smooth((t - tCh - 0.1) / 0.3) * 0.9)); blue.s = 0.45;
      flash.visible = inShots(t, 6, 7) && t > E('flash') - 0.05 && t < E('checkout') - 0.1; flash.scale.setScalar(pop(t, E('flash') - 0.05, 0.4) * (1 + 0.04 * Math.sin(t * 8)));
      chk.visible = inShots(t, 7) && t > E('checkout') - 0.05; chk.scale.setScalar(pop(t, E('checkout') - 0.05, 0.35));
      boxes[4].visible = t > E('checkout') + 0.35; boxes[4].scale.setScalar(t < cut(10) ? pop(t, E('checkout') + 0.35, 0.35) : 1);
      ghost.visible = inShots(t, 7) && t > E('kelima') - 0.1 && t < E('checkout') + 0.35; ghost.scale.setScalar(pop(t, E('kelima') - 0.1, 0.3));
      cupN.visible = !day;
      empty.visible = !day && t > E('kemana') - 0.1; empty.scale.setScalar(pop(t, E('kemana') - 0.1, 0.35));
      const fu = (t - E('dompet') - 0.25) / 2.2; fly.visible = !day && fu > 0 && fu < 1;
      handPos(g, owner, 1, V); fly.position.set(V.x + fu * 1.4 + Math.sin(fu * 18) * 0.12, V.y + 0.1 + fu * 0.9 + Math.sin(fu * 25) * 0.06, V.z + 0.1);
    });
  }

  // ---------- the kampung: the 20k note travels from hand to hand (shot 8) ----------
  {
    const g = addLoc('kampung');
    g.add(ground(70, 60, '#a89a82'));
    const road = box(70, 0.02, 3.2, toon('#6a6670', {paint: {seed: 8, stains: 30}}), {edges: false}); at(road, 0, -0.01, -0.2); g.add(road);
    [[-4.6, '#e8c99a', '#b5543c'], [-1.0, '#a8c8a0', '#7a4a3a'], [2.6, '#f0d0a0', '#5a6a7a'], [6.0, '#d8b8d8', '#b5543c']].forEach(([x, col, roof], i) => {
      const h = P.house(3.4, 3.0, 3, {color: col, roof, seed: 60 + i, windows: 2, doorX: i % 2 ? 0.8 : -0.8, shutter: '#6a8a5a'}); at(h, x, 0, -5.4); g.add(h);
    });
    const veg = P.stall(L.sayur, {awning: '#7fa35a', signBg: '#f3efe6', w: 2.0}); at(veg, -2.3, 0, -2.9); g.add(veg);
    const vp = P.vegPile(4); at(vp, -2.3, 0, -2.9); g.add(vp);
    const bus = P.minibus('#5aa8a0', L.angkot); at(bus, 0.3, 0, -4.0); g.add(bus);
    const war = P.stall(L.warung, {awning: '#d8413a', signBg: '#fff3df', w: 2.0}); at(war, 2.6, 0, -2.9); g.add(war);
    for (let i = 0; i < 7; i++) { const s = box(0.1, 0.32, 0.02, ['#f2d24a', '#4f8fc8', '#d8413a', '#7fa35a'][i % 4], {hull: 0.004}); at(s, 1.85 + i * 0.25, 1.75, -2.45); g.add(s); }
    const jars = [0, 1, 2].map((i) => { const j = cyl(0.1, 0.1, 0.24, '#e8f0f0', {hull: 0.006}); at(j, 2.1 + i * 0.5, 0.85, -2.75); g.add(j); return j; });
    const porch = box(2.2, 0.15, 1.2, toon('#b8a088', {paint: {planks: 5, seed: 66}})); at(porch, 5.3, 0, -3.2); g.add(porch);
    const seller = ch('veg', {seed: 21}, g, -2.3, -3.55, 0);
    const driver = ch('driver', {seed: 22}, g, 0.2, -2.65, 0);
    const ibu = ch('ibu', {seed: 23}, g, 2.6, -3.55, 0);
    const nenek = ch('nenek', {seed: 24}, g, 4.75, -2.6, 0.15);
    const kid = ch('kid', {seed: 25, scale: 0.62}, g, 5.55, -2.35, -0.15);
    const green = billChar('green', g, 0.32, -4.3, 1.4, -1.9, {seed: 35});
    const tS = E('sayur') + 0.15, tA = E('angkot') + 0.1, tW = E('warung') + 0.1, tN = E('nenek') + 0.1, tC = E('cucu') + 0.1;
    route(g, green, [
      {t: 0, p: [-4.3, 1.45, -1.9]},
      {t: tS, c: seller, i: 1, dur: 0.5, arc: 0.4},
      {t: tA, c: driver, i: 0, dur: 0.55, arc: 0.5},
      {t: tW, c: ibu, i: 0, dur: 0.55, arc: 0.5},
      {t: tN, c: nenek, i: 0, dur: 0.6, arc: 0.5},
      {t: tC, c: kid, i: 1, dur: 0.5, arc: 0.35},
    ]);
    green.act([
      {t: 0, pose: 'armsUp', expr: 'happy'},
      {t: E('beruntung') + 0.05, pose: 'cheer', expr: 'excited'},
      {t: tS, pose: 'wave', expr: 'cheesy'},
      {t: tW, pose: 'armsUp', expr: 'toothy'},
      {t: tN, pose: 'present', expr: 'happy'},
      {t: E('jajan'), pose: 'cheer', expr: 'excited'},
    ]);
    seller.act([{t: 0, pose: 'presentBoth', expr: 'happy'}, {t: tS - 0.2, pose: 'give', expr: 'cheesy'}, {t: tA - 0.1, pose: 'wave', expr: 'happy'}]);
    driver.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: tA - 0.25, pose: 'hold', expr: 'happy'}, {t: tW - 0.1, pose: 'wave', expr: 'happy'}]);
    ibu.act([{t: 0, pose: 'hips', expr: 'neutral'}, {t: tW - 0.25, pose: 'hold', expr: 'cheesy'}, {t: tN - 0.1, pose: 'present', expr: 'happy'}]);
    nenek.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: tN - 0.25, pose: 'hold', expr: 'proud'}, {t: tC - 0.15, pose: 'give', expr: 'happy'}]);
    kid.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: tC - 0.2, pose: 'hold', expr: 'cheesy'}, {t: E('jajan') + 0.05, pose: 'carry', expr: 'excited', action: 'jump', dur: 0.5}]);
    fx(g, FX.glints([-4.3, 1.6, -1.9], E('beruntung'), {n: 18}), (t) => inShots(t, 8));
    fx(g, FX.confetti([5.5, 2.0, -2.3], E('jajan') + 0.05, {n: 40}), (t) => inShots(t, 8));
    const jaj = sign(L.jajan, 1.3, 0.38, {bg: '#86be72', fg: '#fff3df', frame: '#3a6a3a'}); at(jaj, 5.2, 2.3, -2.5); g.add(jaj);
    updaters.push((t) => { jaj.visible = t > E('jajan') - 0.1; jaj.scale.setScalar(pop(t, E('jajan') - 0.1, 0.35)); });
  }

  // ---------- the kid's room: into the chicken piggy bank (shot 9) ----------
  {
    const g = addLoc('kidroom');
    under(g, '#2a2228');
    g.add(P.room(6, 3.0, 6, {wall: '#f2dca8', floor: '#a87a52', wain: '#d89a5a'}));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), new THREE.MeshBasicMaterial({color: '#e8a07a'})); at(win, -1.6, 1.8, -4.88); g.add(win);
    for (const [x, y, w, h] of [[0, -0.5, 1.25, 0.08], [0, 0.5, 1.25, 0.08], [-0.6, 0, 0.08, 1.08], [0.6, 0, 0.08, 1.08], [0, 0, 0.05, 1.0]]) { const b = box(w, h, 0.06, '#f3efe6', {center: true}); at(b, -1.6 + x, 1.8 + y, -4.84); g.add(b); }
    const bed = P.bed({color: '#7fa6c9', sheet: '#e8a83a'}); at(bed, -2.0, 0, -3.4); g.add(bed);
    const table = box(0.8, 0.55, 0.6, toon('#c9935a', {paint: {planks: 2, seed: 71}})); at(table, 0.4, 0, -3.0); g.add(table);
    const pig = P.piggyChicken(1.0); at(pig.group, 0.4, 0.55, -3.0, -0.8); g.add(pig.group);
    const slot = [0.4, 0.55 + pig.slot[1], -3.0];
    if (P.toyBlock) ['A', 'B', 'C'].forEach((l, i) => { const b = P.toyBlock(l, ['#d8413a', '#4f8fc8', '#7fa35a'][i], 0.22); at(b, 1.6 + i * 0.26, 0, -2.6, 0.3 * i); g.add(b); });
    const lampK = FX.fireLight([0.4, 1.6, -2.5], {intensity: 1.0, dist: 5}); g.add(lampK.obj); updaters.push((t) => lampK.update(t));
    const kid = ch('kid', {seed: 25, scale: 0.62}, g, -0.45, -2.55, 0.2);
    const green = billChar('green', g, 0.26, 0, 0, 0, {seed: 35});
    const tIn = E('celengan') + 0.05;
    route(g, green, [{t: 0, c: kid, i: 1}, {t: tIn - 0.45, p: [slot[0], slot[1] + 0.25, slot[2] + 0.05], dur: 0.4, arc: 0.25}, {t: tIn, p: [slot[0], slot[1] - 0.25, slot[2]], dur: 0.4, arc: 0}]);
    green.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('anak') + 0.1, pose: 'idle', expr: 'surprised'}, {t: tIn - 0.5, pose: 'armsUp', expr: 'cheesy'}]);
    kid.act([{t: 0, pose: 'hold', expr: 'happy'}, {t: E('anak') + 0.05, pose: 'hold', expr: 'scheming'}, {t: tIn - 0.5, pose: 'give', expr: 'toothy'}, {t: E('istirahat'), pose: 'hips', expr: 'proud'}]);
    zzz(g, slot[0] + 0.1, slot[1] + 0.15, slot[2] + 0.1, (t) => inShots(t, 9) && t > E('istirahat') - 0.2, 0.2);
    fx(g, FX.glints([slot[0], slot[1] + 0.1, slot[2] + 0.1], tIn + 0.2, {n: 14}), (t) => inShots(t, 9));
    updaters.push((t) => {
      green.group.visible = t < tIn + 0.4;
      pig.group.rotation.z = t > tIn + 0.35 && t < tIn + 0.9 ? Math.sin((t - tIn) * 40) * 0.04 : 0;
    });
  }

  // ---------- the desk: "that's me" — keep a money log, or I disappear; the question (shots 11, 12) ----------
  {
    const g = addLoc('desk');
    under(g, '#2a2228');
    g.add(P.room(6.5, 3.2, 6, {wall: '#e6dccb', floor: '#a88a6a', wain: '#9ab8a8'}));
    const top = box(3.2, 0.75, 1.5, toon('#c9a27a', {paint: {planks: 6, seed: 81}})); at(top, 0, 0, -2.75); g.add(top);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshBasicMaterial({color: '#cfe8f6'})); at(win, 1.4, 1.9, -4.88); g.add(win);
    for (const [x, y, w, h] of [[0, -0.55, 1.55, 0.08], [0, 0.55, 1.55, 0.08], [-0.73, 0, 0.08, 1.18], [0.73, 0, 0.08, 1.18], [0, 0, 0.05, 1.1]]) { const b = box(w, h, 0.06, '#f3efe6', {center: true}); at(b, 1.4 + x, 1.9 + y, -4.84); g.add(b); }
    const nb = P.notebook(L.log, {lines: L.logLines}); at(nb, 0.45, 0.75, -2.45, -0.15); g.add(nb);
    const cup = P.fancyCup(); at(cup, -0.95, 0.75, -2.9); g.add(cup);
    const coins = P.coinPile ? P.coinPile(6, 4) : null; if (coins) { at(coins, -0.7, 0.75, -2.3); g.add(coins); }
    const red = billChar('red', g, 0.7, -0.3, 0.75, -2.55, {seed: 36});
    red.act([
      {t: cut(11), pose: 'presentBoth', expr: 'smug'},
      {t: E('catat') + 0.05, pose: 'point', expr: 'determined'},
      {t: E('hilang') - 0.1, pose: 'headHold', expr: 'grimace'},
      {t: cut(12), pose: 'shrug', expr: 'confused'},
      {t: E('apa') + 0.05, pose: 'shrug', expr: 'thinking'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'cheesy', action: 'jump', dur: 0.6},
    ]);
    const qs = sign(L.question, 1.2, 0.32, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}); at(qs, -0.3, 1.74, -2.7); g.add(qs);
    const cmt = sign(L.comment, 1.0, 0.34, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}); at(cmt, -0.3, 2.1, -2.75); g.add(cmt);
    fx(g, FX.glints([-0.3, 1.2, -2.5], E('hilang'), {n: 26}), (t) => inShots(t, 11));
    poof(g, [-0.3, 1.1, -2.45], E('sadar') - 0.1, (t) => inShots(t, 11));
    fx(g, FX.confetti([-0.3, 2.2, -2.7], E('komentar') + 0.05), (t) => inShots(t, 12));
    updaters.push((t) => {
      // fading away on "disappear": flicker and shrink, gone on "noticing", back for the question
      const gone = t > E('sadar') - 0.05 && t < cut(12);
      const fl = t > E('hilang') && t < E('sadar') ? (Math.sin(t * 30) > 0 ? 1 : 0.92) * (1 - 0.35 * smooth((t - E('hilang')) / (E('sadar') - E('hilang')))) : 1;
      red.group.visible = !gone; red.group.scale.setScalar(0.7 * fl * (t >= cut(12) ? pop(t, cut(12) + 0.05, 0.35) : 1));
      qs.visible = t > E('tanya') + 0.2; qs.scale.setScalar(pop(t, E('tanya') + 0.2, 0.4));
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
