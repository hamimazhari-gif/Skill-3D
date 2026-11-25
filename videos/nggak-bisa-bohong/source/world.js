// All locations in one scene at different x offsets. Story: "Tidak bisa bohong 24 jam" (a day when nobody can lie).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {stage: 0, home: 40, office: 80, market: 120, porch: 160, arisan: 200, wedding: 240};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'breezy' (new for this video; round no-sleep face, fringe hair, thick brows, long legs).
export const CHAR_DESIGN = 'breezy';
const CAST = {
  suami: {outfit: 'shirt', jacket: '#7fb0d8', tie: '#d8413a', lower: '#3a4050', pocket: '#6a9ac4', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
  istri: {outfit: 'tshirt', jacket: '#fbf6ea', lower: '#fbf6ea', check: '#d8413a', tie: '#fbf6ea', hair: '#3a2a26', hairStyle: 'bun', hat: 'none'},
  bos: {outfit: 'suit', jacket: '#3a3a48', lapel: '#26262f', tie: '#d8413a', lower: '#2a2a33', hair: '#2b2326', hairStyle: 'side', hat: 'none', mustache: 'thick'},
  karyawan: {outfit: 'shirt', jacket: '#fbf6ea', tie: '#2f6a8a', lower: '#2a3448', pocket: '#e8e0d0', hair: '#3a2a26', hairStyle: 'tuft', hat: 'none', lanyard: '#2f6a8a'},
  staf1: {hairStyle: 'hijab', hijab: '#c95a7a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'shirt', jacket: '#f3efe6', tie: '#c95a7a', lower: '#3a3a48', pocket: '#e8e0d0', lanyard: '#2f6a8a'},
  staf2: {outfit: 'shirt', jacket: '#bfd8b0', tie: '#3a5a3a', lower: '#3a3a48', pocket: '#a8c49a', hair: '#2b2326', hairStyle: 'side', hat: 'none', glasses: true, lanyard: '#2f6a8a'},
  abang: {outfit: 'farmer', jacket: '#e8a83a', lower: '#4a4a52', pocket: '#d8982a', tie: '#e8a83a', hair: '#2b2326', hairStyle: 'tuft', hat: 'none', towel: '#fbf6ea', mustache: 'thin'},
  mbak: {hairStyle: 'hijab', hijab: '#4f8a6a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'tshirt', jacket: '#f2d24a', lower: '#5a8ab0', tie: '#f2d24a'},
  teman: {outfit: 'hoodie', jacket: '#d8413a', lower: '#2a3448', tie: '#d8413a', hair: '#2b2326', hairStyle: 'side', hat: 'none'},
  debtor: {outfit: 'tshirt', jacket: '#3fb06a', print: '#fff3df', print2: '#f2d24a', lower: '#5a4a3a', tie: '#3fb06a', hair: '#3a2a26', hairStyle: 'fringe', hat: 'none', glasses: true},
  ibu: {hairStyle: 'hijab', hijab: '#7a5aa8', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#e8a0b8', print: '#fff3df', print2: '#7a5aa8', lower: '#5a4a6a', tie: '#e8a0b8', round: true},
  tamu: {outfit: 'batik', jacket: '#4f7fa6', print: '#f2d24a', print2: '#2a3448', lower: '#2a2a33', tie: '#4f7fa6', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
  host: {outfit: 'batik', jacket: '#8a4a2a', print: '#e8c35a', print2: '#3a2420', lower: '#2a2a33', tie: '#8a4a2a', hair: '#2b2326', hat: 'peci', hatColor: '#1f1d24', mustache: 'thick'},
  groom: {outfit: 'suit', jacket: '#fbf6ea', lapel: '#d8a83a', tie: '#d8a83a', lower: '#fbf6ea', hair: '#2b2326', hat: 'peci', hatColor: '#1f1d24', pocketSquare: '#d8a83a'},
  p1: {outfit: 'tshirt', jacket: '#7fc4e8', print: '#fff3df', print2: '#4f7fa6', lower: '#4a4a52', tie: '#7fc4e8', hair: '#2b2326', hairStyle: 'side', hat: 'none'},
  p2: {hairStyle: 'hijab', hijab: '#e8a83a', brooch: '#d8413a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#6a9a7a', print: '#f2d24a', print2: '#2a4a3a', lower: '#3a3a48', tie: '#6a9a7a', round: true},
  p3: {outfit: 'farmer', jacket: '#c95a7a', lower: '#3a4050', pocket: '#b04a6a', tie: '#c95a7a', hair: '#9a9a9a', hairStyle: 'bald', hat: 'none', mustache: 'thin'},
  anchor: {hairStyle: 'hijab', hijab: '#2f4f8a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'suit', jacket: '#d8413a', lapel: '#a82a2a', tie: '#fbf6ea', lower: '#2a2a33', pocketSquare: false},
  bride: {outfit: 'batik', jacket: '#fbf6ea', print: '#e8c35a', print2: '#c9a25a', lower: '#d8a83a', tie: '#fbf6ea', round: true, hairStyle: 'hijab', hijab: '#fbf6ea', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26'},
};

// Lighting: a dark studio for the global countdown, a warm home (cool blue night for the sofa), a bright office,
// a sunny market, a golden-hour porch, a sunset living room for the arisan chat, a warm wedding hall at night.
const homeL = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
const nightL = {...LOOK_PRESETS.interiorCool, keyI: 1.2, hemiI: 0.7, key: '#a9c4ff', grade: {sat: 0.75, contrast: 1.05, tint: '#8aa0d8', tintAmt: 0.14, vignette: 0.6}};
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
export const LOOK = {
  stage: {keys: [{at: 0, ...studio}, {at: 'cut10', ...studio}, {at: 'lega', ...studio, ...MOODS.joyful}]},
  home: {keys: [{at: 0, ...homeL}, {at: 'taplak', ...homeL, ...MOODS.danger}, {at: 'cut4', ...nightL}, {at: 'cut11', ...homeL, ...MOODS.joyful}, {at: 'cut12', ...homeL}]},
  office: {keys: [{at: 0, ...LOOK_PRESETS.interiorCool, keyI: 2.3, hemiI: 1.2}, {at: 'seisi', ...LOOK_PRESETS.interiorCool, keyI: 2.3, hemiI: 1.2, ...MOODS.tense}]},
  market: {...LOOK_PRESETS.noon, near: 20, far: 80},
  porch: {...LOOK_PRESETS.goldenHour, near: 20, far: 80},
  arisan: {...LOOK_PRESETS.interiorWarm, keyI: 2.2, hemiI: 1.2, key: '#ffc890'},
  wedding: {keys: [{at: 0, ...LOOK_PRESETS.interiorWarm, keyI: 2.3, hemiI: 1.3, ...MOODS.joyful}, {at: 'nggakKenal', ...LOOK_PRESETS.interiorWarm, keyI: 2.3, hemiI: 1.3, ...MOODS.tense}]},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

// Screen-level effects: flashes and shakes.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.bohong0, dur: 0.35, color: '#ffe9b0', strength: 0.35},
      {t: EVt.taplak, dur: 0.3, color: '#ff8a7a', strength: 0.3},
      {t: EVt.whatsapp, dur: 0.3, color: '#c8f0b0', strength: 0.3},
      {t: EVt.manis, dur: 0.3, color: '#ffe9b0', strength: 0.3},
      {t: EVt.kamu, dur: 0.3, color: '#ff8a7a', strength: 0.25},
      {t: EVt.malas, dur: 0.3, color: '#ffe9b0', strength: 0.25},
      {t: EVt.nggakKenal, dur: 0.3, color: '#ffffff', strength: 0.3},
      {t: EVt.berlalu, dur: 0.4, color: '#fff4d6', strength: 0.4},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.taplak, dur: 0.3, amp: 0.015}, {t: EVt.whatsapp, dur: 0.3, amp: 0.015}, {t: EVt.kamu, dur: 0.3, amp: 0.015}, {t: EVt.nggakKenal, dur: 0.3, amp: 0.015}],
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
  const speak = (c, si, exprs = [], from = -1) => {
    const S = T.S[si]; const at0 = (f) => S.start + f * (S.end - S.start);
    const segs = (S.voiced || [[S.start, S.end]]).map(([a, b]) => [Math.max(a, from - 0.05), b]).filter(([a, b]) => b - a > 0.05);
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
  const seat = (c, y0) => updaters.push(() => { c.group.position.y = y0; }); // seated behind a table: body lowered
  // the clock motif: a small digital board with the hour, popping in on its word
  const clock = (g, txt, x, y, z, word, vis = () => true) => popSign(g, P.digitalBoard(txt, 0.9, 0.32, {color: '#ffcf4a'}), x, y, z, E(word) - 0.1, 1e9, vis);



  // ---------- the studio: the whole world cannot lie for 24 hours (1), the 24 hours are over (10) ----------
  {
    const g = addLoc('stage');
    under(g, '#14161c');
    const fl0 = box(30, 0.04, 14, toon('#262a36', {paint: {seed: 221}}), {edges: false}); at(fl0, 0, -0.03, -3); g.add(fl0);
    const wall = box(30, 9, 0.2, toon('#1e2840', {paint: {seed: 222}}), {edges: false}); at(wall, 0, 0, -6.4); g.add(wall);
    const gl = P.globe(0.95); at(gl.group, 0, 2.15, -5.0); g.add(gl.group); updaters.push((t) => { gl.group.rotation.y = t * 0.35; });
    const gfl = FX.fireLight([0, 2.6, -3.2], {intensity: 2.0, dist: 6}); g.add(gfl.obj); updaters.push((t) => gfl.update(t));
    const boards = [[L.start, 0, (t) => t < cut(10) || (t < E('berlalu'))], ['00:00:01', 0, () => false], [L.end, 0, (t) => t >= E('berlalu')]].map(([txt, , vis]) => {
      const b = P.digitalBoard(txt, 2.2, 0.62, {color: txt === L.end ? '#5aff8a' : '#ff5a4a'}); at(b, 0, 4.25, -5.6); g.add(b); showWhen(b, vis); return b; });
    popSign(g, sign(L.relief, 1.6, 0.4, {bg: '#fff3df', fg: '#2f6a8a', frame: '#351f22'}), -0.7, 2.55, -2.5, E('lega') - 0.05, E('kembali'), (t) => inShots(t, 10));
    // the newsroom (1): an emergency news broadcast, framed like a TV
    {
      const NX = -12;
      const back = box(5, 3.6, 0.15, toon('#1f3a6a', {paint: {seed: 223}})); at(back, NX, 0, -4.2); g.add(back);
      for (let i = 0; i < 6; i++) { const st = box(0.06, 3.6, 0.02, '#3a5a9a', {hull: 0}); at(st, NX - 2.2 + i * 0.88, 0, -4.1); g.add(st); }
      const head = sign(L.news, 2.6, 0.5, {bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a', wear: false}); at(head, NX, 2.55, -4.05); g.add(head);
      updaters.push((t) => { head.visible = Math.floor(t * 3) % 2 === 0 || t > 1.2; });
      const live = sign(L.live, 0.6, 0.26, {bg: '#d8312a', fg: '#fff3df', frame: '#fff3df', wear: false}); at(live, NX - 1.6, 1.95, -4.05); g.add(live);
      const brd = P.digitalBoard(L.start, 1.3, 0.38); at(brd, NX + 1.25, 1.95, -4.05); g.add(brd);
      const dsk = box(1.8, 0.85, 0.7, toon('#e8e0d0', {paint: {seed: 224}})); at(dsk, NX, 0, -2.6); g.add(dsk);
      const stripe = box(1.82, 0.12, 0.02, '#d8312a', {hull: 0}); at(stripe, NX, 0.72, -2.24); g.add(stripe);
      const anchor = ch('anchor', {seed: 60}, g, NX, -3.05, 0); seat(anchor, -0.12);
      anchor.act([{t: 0, pose: 'present', expr: 'surprised'}, {t: 1.5, pose: 'stop', expr: 'shocked'}]);
      anchor.act([{t: 0.15, action: 'talk', dur: 2.2}]);
      const paper = box(0.25, 0.01, 0.18, '#fbf6ea', {hull: 0.004}); at(paper, NX + 0.3, 0.86, -2.5); g.add(paper);
      const tick = sign(L.ticker, 3.0, 0.26, {bg: '#f2d24a', fg: '#351f22', frame: '#351f22', wear: false}); at(tick, NX, 0.45, -2.2); g.add(tick);
    }
    // the lineup: people from the day's stories, all over the world
    const line = [['suami', -1.6, 0.25], ['istri', -0.8, 0.12], ['bos', 0, 0], ['abang', 0.8, -0.12], ['mbak', 1.6, -0.25]].map(([k, x, y], i) => {
      const c = ch(k, {seed: 40 + i}, g, x, -2.8, y); showWhen(c.group, (t) => inShots(t, 1) || inShots(t, 10));
      c.act([{t: 0, pose: 'idle', expr: ['neutral', 'smug', 'neutral', 'happy', 'neutral'][i]}, {t: E('bohong0') + 0.05 + i * 0.06, pose: 'shh', expr: ['shocked', 'grimace', 'shocked', 'scream', 'grimace'][i]},
        {t: cut(10), pose: 'shh', expr: 'tired'}, {t: E('berlalu') + 0.1 + i * 0.05, pose: 'armsUp', expr: 'excited'}, {t: E('lega') + 0.05, pose: 'limp', expr: 'happy'},
        {t: E('kembali') + 0.05 + i * 0.05, pose: ['hips', 'cross', 'hips', 'chin', 'cross'][i], expr: ['scheming', 'smug', 'scheming', 'smug', 'scheming'][i]}]);
      c.act([{t: E('bohong0') + i * 0.06, action: 'jump', dur: 0.5}, {t: E('berlalu') + i * 0.05, action: 'hop', dur: 0.4}, {t: E('lega'), action: 'slump', dur: 0.8}]);
      return c; });
    fx(g, FX.glints([0, 4.25, -5.3], E('berlalu'), {n: 26}), (t) => inShots(t, 10));
    fx(g, FX.confetti([0, 3.6, -3.0], E('berlalu') + 0.05), (t) => inShots(t, 10));
  }

  // ---------- home: the dangerous question (2-3), the sofa (4), the lie comes back (11), the question (12) ----------
  {
    const g = addLoc('home');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#e8d8b8', floor: '#a8784a', wain: '#7a9a8a'}));
    const doorF = box(1.1, 2.2, 0.06, '#3a2a26'); at(doorF, -0.2, 0, -4.92); g.add(doorF);
    const door = box(1.0, 2.1, 0.06, toon('#8a5a3a', {paint: {planks: 3, seed: 8}})); const dp = new THREE.Group(); at(dp, -0.7, 0, -4.86); at(door, 0.5, 0, 0); dp.add(door); g.add(dp);
    updaters.push((t) => { const o1 = smooth((t - E('istri') + 0.6) / 0.4) * (1 - smooth((t - E('bertanya')) / 0.4)), o2 = smooth((t - E('hariPertama') + 0.9) / 0.25) * (1 - smooth((t - E('hariPertama') + 0.25) / 0.15)); dp.rotation.y = 1.3 * Math.max(o1, o2); });
    const tbl = P.clothTable({w: 1.2, d: 0.8}); at(tbl, -2.2, 0, -3.7); g.add(tbl);
    const vase = cyl(0.07, 0.09, 0.3, '#4f7fa6', {hull: 0.008}); at(vase, -2.2, 0.76, -3.7); g.add(vase);
    const fl = ball(0.1, '#f2d24a', {hull: 0.008}); at(fl, -2.2, 1.1, -3.7); g.add(fl);
    const sofa = P.sofa('#6a8a7a'); at(sofa, 1.9, 0, -4.3); g.add(sofa);
    const wc = P.wallClock(0.28); wc.set(7, 0); at(wc.group, 1.9, 2.3, -4.86); g.add(wc.group);
    const ntv = new THREE.Group(); ntv.add(box(1.25, 0.75, 0.06, '#2b2b33', {center: true, hull: 0.01}));
    { const c = canvas(640, 380), x = c.getContext('2d'); x.fillStyle = '#1f3a6a'; x.fillRect(0, 0, 640, 380); x.fillStyle = '#d8312a'; x.fillRect(0, 30, 640, 70);
      x.fillStyle = '#fff'; x.font = '900 44px "Inter Display"'; x.textAlign = 'center'; x.fillText(L.news, 320, 80);
      x.fillStyle = '#f2d24a'; x.fillRect(0, 250, 640, 100); x.fillStyle = '#351f22'; x.font = '900 30px "Inter Display"'; x.fillText(L.tv1, 320, 290); x.fillText(L.tv2, 320, 330);
      x.fillStyle = '#e8c4a8'; x.beginPath(); x.arc(320, 175, 50, 0, 7); x.fill(); x.fillStyle = '#2f4f8a'; x.beginPath(); x.arc(320, 165, 56, Math.PI, 0); x.fill(); x.fillStyle = '#d8413a'; x.fillRect(262, 220, 116, 30);
      const scrn = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.68), new THREE.MeshBasicMaterial({map: texFrom(c)})); scrn.position.z = 0.035; ntv.add(scrn); }
    at(ntv, -2.2, 1.85, -4.85); g.add(ntv);
    const panic = ch('suami', {seed: 5}, g, -1.35, -3.3, 0.35); showWhen(panic.group, (t) => inShots(t, 1));
    panic.act([{t: 0, pose: 'idle', expr: 'surprised'}, {t: E('bohong0') - 0.05, pose: 'shh', expr: 'scream'}, {t: E('duaPuluh0'), pose: 'headHold', expr: 'grimace'}]);
    panic.act([{t: E('bohong0') - 0.05, action: 'jump', dur: 0.5}, {t: E('duaPuluh0'), action: 'tremble', dur: 1.5}]);
    const suami = ch('suami', {seed: 1}, g, 0.55, -3.0, -0.15);
    const istri = ch('istri', {seed: 2}, g, -0.2, -4.7, 0.1);
    showWhen(suami.group, (t) => !inShots(t, 4) && !inShots(t, 1));
    showWhen(istri.group, (t) => (t > E('istri') - 0.6 && t < cut(4)) || t >= cut(11));
    walkPath(istri, [[E('istri') - 0.4, -0.2, -4.7], [E('bertanya') - 0.1, -0.65, -3.0], [cut(4), -0.65, -3.0], [cut(11), -0.65, -3.0], [cut(12), -0.65, -3.2], [cut(12) + 0.02, -1.6, -3.9]]);
    const bag = P.shopBag('#e0626e'); held(istri, bag, {hand: 1, y: -0.02, z: 0.08}); showWhen(bag, (t) => t < E('bertanya') + 0.1);
    const bag2 = P.shopBag('#e0626e'); at(bag2, -1.2, 0, -3.3, 0.4); g.add(bag2); showWhen(bag2, (t) => t > E('bertanya') + 0.1 && t < cut(4));
    popSign(g, sign(L.nenek, 1.6, 0.34, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), -2.2, 1.6, -3.3, E('taplak') - 0.05, cut(4), (t) => inShots(t, 3));
    istri.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('baju') + 0.05, pose: 'idle', expr: 'cheesy'}, {t: E('bertanya') + 0.05, pose: 'presentBoth', expr: 'proud'},
      {t: E('pa') - 0.05, pose: 'hips', expr: 'cheesy'}, {t: E('cantik') + 0.05, pose: 'presentBoth', expr: 'excited'},
      {t: E('suami'), pose: 'hips', expr: 'smug'}, {t: E('bagus') + 0.05, pose: 'presentBoth', expr: 'cheesy'}, {t: E('taplak') + 0.05, pose: 'hips', expr: 'furious'},
      {t: cut(11), pose: 'presentBoth', expr: 'cheesy'}, {t: E('banget') + 0.05, pose: 'cheer', expr: 'toothy'}, {t: cut(12), pose: 'cheer', expr: 'laugh'}]);
    istri.act([{t: E('cantik'), action: 'spinIn', dur: 0.6}, {t: E('taplak'), action: 'jump', dur: 0.5}, {t: E('sedunia') - 0.1, action: 'hop', dur: 0.4}]);
    speak(istri, 3, [[0, 'cheesy', 'hips'], [0.35, 'excited', 'presentBoth']]);
    speak(istri, 24, [[0, 'cheesy', 'presentBoth']]);
    suami.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('istri') + 0.1, pose: 'wave', expr: 'happy'}, {t: E('bahaya') + 0.05, pose: 'idle', expr: 'worried'},
      {t: E('cantik') + 0.1, pose: 'idle', expr: 'grimace'}, {t: E('diam') - 0.05, pose: 'shh', expr: 'chatter'}, {t: E('mulut') + 0.05, pose: 'headHold', expr: 'scream'},
      {t: E('bagus') - 0.1, pose: 'present', expr: 'nervous'}, {t: E('taplak') - 0.05, pose: 'point', expr: 'cheesy'}, {t: E('nenek') + 0.1, pose: 'headHold', expr: 'grimace'},
      {t: cut(11), pose: 'idle', expr: 'nervous'}, {t: E('banget') - 0.15, pose: 'cheer', expr: 'cheesy'}, {t: E('sedunia'), pose: 'present', expr: 'nervous'},
      {t: cut(12), pose: 'shrug', expr: 'scheming'}, {t: E('siapa') + 0.05, pose: 'shrug', expr: 'confused'}, {t: E('tulis') - 0.05, pose: 'point', expr: 'cheesy'}]);
    suami.act([{t: E('diam'), action: 'tremble', dur: 1.2}, {t: E('nenek') + 0.1, action: 'tremble', dur: 0.8}, {t: E('sedunia') + 0.1, action: 'tremble', dur: 0.6}]);
    speak(suami, 5, [[0, 'nervous', 'present'], [0.5, 'cheesy', 'point']]);
    speak(suami, 25, [[0, 'cheesy', 'cheer'], [0.55, 'nervous', 'present']]);
    speak(suami, 26, [[0, 'scheming', 'shrug'], [0.55, 'confused', 'shrug']]);
    speak(suami, 27, [[0, 'cheesy', 'point']]);
    // hearts around the wife when the lie lands
    const hearts = [[-1.1, 2.1], [-0.2, 2.35], [-0.9, 2.55]].map(([x, y], i) => { const h = P.heart('#e0626e'); h.scale.setScalar(0.4); g.add(h); updaters.push((t) => { const t0 = E('sedunia') - 0.1 + i * 0.12; h.visible = inShots(t, 11) && t > t0; h.scale.setScalar(0.4 * pop(t, t0, 0.35)); at(h, x, y + Math.sin(t * 3 + i) * 0.04, -3.1); }); return h; });
    // the sofa at night: the husband sleeps alone
    const sleeper = ch('suami', {seed: 3}, g, 2.75, -4.2, 0); showWhen(sleeper.group, (t) => inShots(t, 4));
    updaters.push(() => { sleeper.group.rotation.z = Math.PI / 2; sleeper.group.position.y = 0.72; });
    sleeper.act([{t: cut(4), pose: 'limp', expr: 'sad'}, {t: E('sofa') - 0.1, pose: 'limp', expr: 'cry'}]);
    const pil = ball(0.2, '#f6f1e6', {sx: 1.2, sy: 0.6, sz: 0.8}); at(pil, 0.95, 0.62, -4.2); g.add(pil); showWhen(pil, (t) => inShots(t, 4));
    const blanket = box(1.15, 0.12, 0.6, toon('#7a8ac8', {paint: {seed: 31}}), {hull: 0.01}); at(blanket, 2.0, 0.55, -4.05); g.add(blanket); showWhen(blanket, (t) => inShots(t, 4));
    popSign(g, sign(L.day1, 1.4, 0.34, {bg: '#2b2b33', fg: '#f2d24a', frame: '#f2d24a'}), 1.9, 1.75, -4.75, E('hariPertama') - 0.05, cut(5), (t) => inShots(t, 4));
        popSign(g, sign(L.question, 1.8, 0.4, {bg: '#fff3df', fg: '#8a2a36', frame: '#8a2a36'}), 0.55, 2.6, -2.9, E('siapa') - 0.15, 1e9, (t) => inShots(t, 12));
    popSign(g, sign(L.comment, 1.6, 0.36, {bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36'}), 0.55, 2.17, -2.85, E('tulis') - 0.1, 1e9, (t) => inShots(t, 12));
    fx(g, FX.confetti([0.5, 2.8, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the office meeting (5) ----------
  {
    const g = addLoc('office');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#dfe6ea', floor: '#9aa4ac', wain: '#5a7a8a', tiles: true}));
    const scr = sign('', 1.9, 1.15, {bg: '#fbfbf6', frame: '#2b2b33', wear: false}); at(scr, -1.5, 1.05, -4.85); g.add(scr);
    const slide = sign(L.slide.join(' '), 1.6, 0.5, {bg: '#4f7fa6', fg: '#fff3df', frame: '#4f7fa6', wear: false, depth: 0.01}); at(slide, -1.5, 1.6, -4.8); g.add(slide);
    const plant = cyl(0.18, 0.14, 0.4, '#c8822a'); at(plant, 3.0, 0, -4.4); g.add(plant); const lv = ball(0.35, '#5a9a5a', {sy: 1.3}); at(lv, 3.0, 0.75, -4.4); g.add(lv);
    const table = box(3.2, 0.12, 1.0, toon('#8a6a4a', {paint: {planks: 4, seed: 121}})); at(table, 0.4, 0.64, -2.5); g.add(table);
    const front = box(3.0, 0.55, 0.05, toon('#6a4a32', {paint: {seed: 122}})); at(front, 0.4, 0.1, -2.05); g.add(front);
    const staff = [['staf1', -0.55, 0.12], ['karyawan', 0.4, 0], ['staf2', 1.35, -0.12]].map(([k, x, y], i) => {
      const chr = P.chair('#4f6a7a'); at(chr, x, 0, -3.45); g.add(chr);
      const c = ch(k, {seed: 10 + i}, g, x, -3.15, y); seat(c, -0.32); return c; });
    for (const [x, z] of [[-0.55, -2.4], [0.4, -2.4], [1.35, -2.4]]) { const m = P.mug ? P.mug() : null; if (m) { at(m, x + 0.25, 0.76, z); g.add(m); } const pad = box(0.3, 0.015, 0.22, '#fbf6ea', {hull: 0.004}); at(pad, x - 0.05, 0.76, z); g.add(pad); }
    const bos = ch('bos', {seed: 13}, g, -1.55, -3.0, 0.35);
    const [s1, kar, s2] = staff;
    popSign(g, sign(L.wa, 1.5, 0.34, {bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'}), 0.4, 2.0, -2.9, E('whatsapp') - 0.05, cut(6));
    const ph = P.phone(); held(kar, ph, {y: 0.02, z: 0.06}); showWhen(ph, (t) => t > E('diganti') && t < E('seisi'));
    bos.act([{t: 0, pose: 'present', expr: 'proud'}, {t: E('adaQ') - 0.1, pose: 'shrug', expr: 'smug'}, {t: E('rapatIni') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('whatsapp') + 0.1, pose: 'idle', expr: 'furious'}, {t: E('menahan'), pose: 'cross', expr: 'gritted'}]);
    bos.act([{t: E('whatsapp') + 0.05, action: 'tremble', dur: 1.5}]);
    speak(bos, 8, [[0.4, 'smug', 'shrug']], E('adaQ'));
    kar.act([{t: 0, pose: 'idle', expr: 'tired'}, {t: E('adaQ') + 0.3, pose: 'pointUp', expr: 'neutral'}, {t: E('diganti') + 0.05, pose: 'tap', expr: 'smug'},
      {t: E('seisi') + 0.1, pose: 'idle', expr: 'grimace'}, {t: E('menahan') + 0.2, pose: 'shh', expr: 'nervous'}]);
    speak(kar, 9, [[0, 'neutral', 'pointUp'], [0.55, 'smug', 'tap']]);
    s1.act([{t: 0, pose: 'idle', expr: 'tired'}, {t: E('whatsapp') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('menahan'), pose: 'shh', expr: 'grimace'}]);
    s2.act([{t: 0, pose: 'idle', expr: 'drowsy'}, {t: E('whatsapp') + 0.15, pose: 'headHold', expr: 'scream'}, {t: E('menahan') + 0.1, pose: 'shh', expr: 'grimace'}]);
    s1.act([{t: E('whatsapp') + 0.1, action: 'jump', dur: 0.5}]); s2.act([{t: E('whatsapp') + 0.15, action: 'jump', dur: 0.5}]);
  }

  // ---------- the market: is the watermelon sweet? (6) ----------
  {
    const g = addLoc('market');
    under(g, '#c9b48a', 120);
    const ground = box(40, 0.03, 30, toon('#c9b48a', {paint: {seed: 131, stains: 30}}), {edges: false}); at(ground, 0, -0.03, -8); g.add(ground);
    for (const [x, z, lab, sd] of [[-3.6, -6.5, 'SAYUR', 5], [3.8, -6.8, 'BUAH', 7], [-0.2, -9.5, 'IKAN', 9]]) { const s = P.stall(lab, {w: 2.0}); at(s, x, 0, z); g.add(s); const v = P.vegPile(sd); at(v, x, 0.85, z); g.add(v); }
    const st = P.stall(L.melon, {w: 2.2}); at(st, 0.3, 0, -3.0); g.add(st);
    [[-0.5, -3.1], [-0.1, -2.85], [0.3, -3.2], [0.7, -2.9], [1.0, -3.2], [-0.3, -3.35]].forEach(([x, z], i) => { const m = P.watermelon(0.2); at(m, x, 0.85, z, i); g.add(m); });
    const cutm = P.watermelon(0.2, {cut: true}); at(cutm, 0.25, 0.85, -2.65); g.add(cutm);
    const post = cyl(0.04, 0.05, 2.2, '#7a5236'); at(post, -1.75, 0, -3.4); g.add(post);
    const abang = ch('abang', {seed: 20}, g, 0.35, -3.75, -0.05);
    const mbak = ch('mbak', {seed: 21}, g, -1.1, -2.3, 0.55);
    const flee = E('saya') - 0.15;
    const buyers = [['p1', 1.6, -2.1, -0.5], ['p2', -2.2, -2.6, 0.5], ['p3', 1.15, -1.5, -0.4]].map(([k, x, z, y], i) => {
      const c = ch(k, {seed: 24 + i}, g, x, z, y);
      c.act([{t: 0, pose: ['idle', 'hold', 'idle'][i], expr: ['happy', 'neutral', 'thinking'][i]}, {t: E('manis') + 0.1, pose: 'idle', expr: ['disgusted', 'grimace', 'shocked'][i]},
        {t: flee, pose: 'armsUp', expr: ['scream', 'grimace', 'scream'][i]}]);
      walkPath(c, [[flee + i * 0.05, x, z], [flee + 1.1 + i * 0.05, x + (x > 0 ? 2.0 : -2.0), z + 0.9]], 'run');
      return c; });
    walkPath(mbak, [[flee, -1.1, -2.3], [flee + 1.1, -3.1, -1.5]], 'run');
    fx(g, FX.dust([0, 0.1, -2.2], flee + 0.1, {n: 10}));
    popSign(g, sign(L.sweet, 0.9, 0.3, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), -1.1, 2.3, -2.3, E('manisQ') - 0.05, E('jujur'));
    mbak.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('bang') - 0.05, pose: 'point', expr: 'thinking'}, {t: E('manisQ') + 0.05, pose: 'tap', expr: 'confused'},
      {t: E('manis') + 0.2, pose: 'cross', expr: 'disgusted'}, {t: E('saya') + 0.05, pose: 'armsUp', expr: 'scream'}]);
    speak(mbak, 12, [[0, 'thinking', 'point'], [0.5, 'confused', 'tap']]);
    abang.act([{t: 0, pose: 'presentBoth', expr: 'happy'}, {t: E('jujur') - 0.05, pose: 'hips', expr: 'smug'}, {t: E('manis') - 0.05, pose: 'chin', expr: 'scheming'}, {t: E('saya'), pose: 'chin', expr: 'proud'}]);
    speak(abang, 13, [[0, 'smug', 'hips'], [0.55, 'scheming', 'chin']]);
    fx(g, FX.glints([0.9, 2.15, -3.6], E('manis'), {n: 22}));
  }

  // ---------- the porch: paying back a debt (7) ----------
  {
    const g = addLoc('porch');
    under(g, '#8fae6a', 120);
    const grass = box(40, 0.03, 30, toon('#8fae6a', {paint: {seed: 141, stains: 20}}), {edges: false}); at(grass, 0, -0.03, -8); g.add(grass);
    const house = P.house(5.5, 3.0, 4, {color: '#e8dcc0', roof: '#b5543c', windows: 2, doorX: -0.4, seed: 14}); at(house, 0, 0, -4.2); g.add(house);
    const terrace = box(5.8, 0.12, 1.6, toon('#c9a27a', {paint: {seed: 142}})); at(terrace, 0, 0, -3.6); g.add(terrace);
    for (let i = 0; i < 3; i++) { const tr = P.tree({seed: 60 + i, h: 2.6}); at(tr, -4.6 + i * 9.5 * (i % 2 ? 1 : 0.4), 0, -5.5 - i); g.add(tr); }
    const wc = P.wallClock(0.24, {rim: '#4f7fa6'}); wc.set(3, 0); at(wc.group, 1.4, 2.4, -4.15); g.add(wc.group);
    const debtor = ch('debtor', {seed: 30}, g, -0.45, -3.55, 0.05); seat(debtor, 0.12);
    const teman = ch('teman', {seed: 31}, g, 1.5, -1.5, -0.5);
    walkPath(teman, [[E('teman') - 0.3, 1.5, -1.5], [E('utang') + 0.1, 0.75, -2.55]]);
    const nb = P.notebook ? P.notebook('UTANG', {cover: '#d8413a'}) : null; if (nb) { nb.scale.setScalar(0.4); held(teman, nb, {y: 0.0, z: 0.08, rx: 1.3}); }
    const wl = P.wallet('#6a4a3a'); wl.open(0); const w = wl.group; held(debtor, w, {y: 0.02, z: 0.1}); showWhen(w, (t) => t > E('sebenarnya') - 0.1);
    popSign(g, sign(L.debt, 1.6, 0.34, {bg: '#fff3df', fg: '#d8413a', frame: '#351f22'}), 0.6, 2.75, -2.6, E('utang') - 0.05, E('sebenarnya'));
    const hrt = P.heart('#e0626e'); hrt.scale.setScalar(0.35); g.add(hrt); updaters.push((t) => { hrt.visible = t > E('sayang') - 0.05; hrt.scale.setScalar(0.35 * pop(t, E('sayang') - 0.05, 0.35)); at(hrt, -0.45, 2.25 + Math.sin(t * 3) * 0.04, -3.4); });
    teman.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('teman'), pose: 'idle', expr: 'determined'}, {t: E('utang') + 0.2, pose: 'hips', expr: 'annoyed'}, {t: E('kapan') - 0.1, pose: 'point', expr: 'angry'},
      {t: E('tapi3') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('kamu') + 0.05, pose: 'headHold', expr: 'shocked'}]);
    teman.act([{t: E('kamu'), action: 'jump', dur: 0.5}]);
    speak(teman, 15, [[0, 'angry', 'point']]);
    debtor.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('utang') + 0.1, pose: 'idle', expr: 'nervous'}, {t: E('sebenarnya') - 0.05, pose: 'present', expr: 'nervous'},
      {t: E('tapi3') + 0.05, pose: 'read', expr: 'cheesy'}, {t: E('kamu'), pose: 'read', expr: 'proud'}]);
    debtor.act([{t: E('utang'), action: 'tremble', dur: 0.8}]);
    speak(debtor, 16, [[0, 'nervous', 'present'], [0.45, 'cheesy', 'read']]);
  }

  // ---------- the arisan group chat (8) ----------
  {
    const g = addLoc('arisan');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#f0d0c8', floor: '#b08454', wain: '#a86a7a'}));
    const sofa = P.sofa('#a86a7a'); at(sofa, -1.0, 0, -4.3); g.add(sofa);
    const tvs = P.tv(); at(tvs.group, 2.2, 0, -4.5); g.add(tvs.group); updaters.push((t) => tvs.update(t));
    const ibu = ch('ibu', {seed: 40}, g, -0.95, -3.1, 0.25);
    const small = P.phone(); held(ibu, small, {y: 0.02, z: 0.06}); updaters.push((t) => { const buzz = t > E('arisan') - 0.2 && t < E('maaf'); small.rotation.z = buzz ? Math.sin(t * 70) * 0.12 : 0; });
    const steps = [[0, cut(8)], [1, E('arisan') + 0.05], [2, E('arisan') + 0.4], [3, E('ramai') - 0.05], [4, E('maaf')], [5, E('malas') - 0.05], [6, E('malas') + 0.3], [7, E('malas') + 0.55]];
    steps.forEach(([n, t0], i) => { const pp = P.chatPhone(L.group, L.chat.slice(0, n), {w: 0.82, badge: '99+'}); at(pp, 0.3, 1.45, -2.3, -0.25); g.add(pp);
      const t1 = i + 1 < steps.length ? steps[i + 1][1] : 1e9; updaters.push((t) => { pp.visible = t >= t0 && t < t1 && inShots(t, 8); pp.scale.setScalar(1); }); });
    fx(g, FX.glints([0.75, 2.2, -3.0], E('ramai'), {n: 16}));
    ibu.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('arisan') + 0.1, pose: 'tap', expr: 'surprised'}, {t: E('ramai') + 0.1, pose: 'tap', expr: 'tired'},
      {t: E('maaf') - 0.05, pose: 'tap', expr: 'nervous'}, {t: E('baca') + 0.05, pose: 'tap', expr: 'smug'}, {t: E('malas'), pose: 'shrug', expr: 'tired'}]);
    speak(ibu, 18, [[0, 'nervous', 'tap'], [0.4, 'smug', 'tap'], [0.75, 'tired', 'shrug']]);
  }

  // ---------- the wedding (9) ----------
  {
    const g = addLoc('wedding');
    under(g, '#2a2228');
    g.add(P.room(9, 3.4, 7, {wall: '#f3e3c8', floor: '#c9a27a', wain: '#8a2a36', tiles: true}));
    const pel = P.pelaminan({w: 4.4}); at(pel, 0, 0, -5.0); g.add(pel);
    popSign(g, sign(L.wedding, 3.4, 0.36, {bg: '#8a2a36', fg: '#f2d24a', frame: '#d8a83a'}), 0, 2.95, -5.8, -1);
    for (let i = 0; i < 7; i++) { const l = P.glowSprite('#ffe2a0', 0.5); at(l, -3.6 + i * 1.2, 3.2, -5.6 + (i % 2) * 0.3); g.add(l); }
    const groom = ch('groom', {seed: 50}, g, 0.42, -5.45, -0.05, 0.3);
    const bride = ch('bride', {seed: 51}, g, -0.42, -5.45, 0.05, 0.3);
    const buf = box(1.8, 0.78, 0.7, toon('#fbf6ea', {wear: false})); at(buf, -2.3, 0, -2.9); g.add(buf);
    const pot = P.cookPot('#c9a25a'); at(pot, -2.6, 0.78, -2.9); g.add(pot); const pot2 = P.cookPot('#8a9aa8'); at(pot2, -1.95, 0.78, -2.9); g.add(pot2);
    const rs = sign(L.rendang, 0.6, 0.2, {bg: '#8a3a2a', fg: '#fff3df', frame: '#5a1a1a', depth: 0.02}); at(rs, -2.6, 1.15, -2.6); g.add(rs);
    const tamu = ch('tamu', {seed: 52}, g, -0.45, -2.35, 0.25);
    const host = ch('host', {seed: 53}, g, 0.75, -2.6, -0.45);
    const plate = P.plate(); plate.scale.setScalar(0.8); held(tamu, plate, {hand: 0, y: 0.02, z: 0.1});
    const rd = ball(0.07, '#6a2a1a', {sy: 0.6}); at(rd, 0.05, 0.05, 0.05); plate.add(rd);
        host.act([{t: 0, pose: 'present', expr: 'happy'}, {t: E('gimana') - 0.05, pose: 'present', expr: 'cheesy'}, {t: E('makan') + 0.1, pose: 'idle', expr: 'confused'}, {t: E('nggakKenal') + 0.05, pose: 'headHold', expr: 'shocked'}]);
    host.act([{t: E('nggakKenal'), action: 'jump', dur: 0.5}]);
    speak(host, 20, [[0, 'cheesy', 'present']]);
    tamu.act([{t: 0, pose: 'eat', expr: 'happy'}, {t: E('rendang') - 0.05, pose: 'eat', expr: 'cheesy'}, {t: E('tapi4'), pose: 'shrug', expr: 'smug'}, {t: E('nggakKenal'), pose: 'shrug', expr: 'cheesy'}]);
    speak(tamu, 21, [[0, 'cheesy', 'eat'], [0.3, 'smug', 'shrug']]);
    groom.act([{t: 0, pose: 'wave', expr: 'happy'}, {t: E('nggakKenal') + 0.1, pose: 'idle', expr: 'confused'}, {t: E('pengantin') + 0.05, pose: 'shrug', expr: 'shocked'}]);
    bride.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('nggakKenal') + 0.15, pose: 'headHold', expr: 'shocked'}]);
    groom.act([{t: E('pengantin'), action: 'jump', dur: 0.5}]); bride.act([{t: E('nggakKenal') + 0.15, action: 'tremble', dur: 1.0}]);
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
