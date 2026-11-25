// All locations in one scene at different x offsets. Story: "Kalau HP bisa ngomong jujur" (a phone complains, then reminds him of his mother).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {kamar: 0, dapur: 40};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'calm' (new for this video; round no-sleep face, side hair, thick brows).
export const CHAR_DESIGN = 'calm';
const CAST = {
  pemuda: {outfit: 'hoodie', jacket: '#5a6a8a', hood: '#4a5a7a', lower: '#3a3a48', tie: '#5a6a8a', hair: '#2b2326', hairStyle: 'side', hat: 'none'},
  ibu: {hairStyle: 'hijab', hijab: '#c9a25a', brooch: '#e8737a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#7a5aa8', print: '#f2d24a', print2: '#3a2a4a', lower: '#7a5aa8', tie: '#7a5aa8', round: true},
};

// Lighting: a blue-lit bedroom at night (phone glow), sadder when he goes quiet, warm when he calls; a warm kitchen for Ibu.
const nightL = {...LOOK_PRESETS.interiorCool, keyI: 1.5, hemiI: 0.9, key: '#a9c4ff', grade: {sat: 0.95, contrast: 1.05, tint: '#8aa8e8', tintAmt: 0.1, vignette: 0.55}};
export const LOOK = {
  kamar: {keys: [{at: 0, ...nightL}, {at: 'terdiam', ...nightL, ...MOODS.sad}, {at: 'cut10', ...LOOK_PRESETS.interiorWarm, keyI: 2.2, hemiI: 1.2}, {at: 'cut12', ...LOOK_PRESETS.interiorWarm, keyI: 2.2, hemiI: 1.2, ...MOODS.joyful}]},
  dapur: {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3, ...MOODS.joyful},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.halo, dur: 0.3, color: '#bfe4ff', strength: 0.35}, {t: EVt.empat, dur: 0.3, color: '#ffffff', strength: 0.25}, {t: EVt.penuh, dur: 0.3, color: '#ff8a7a', strength: 0.3},
      {t: EVt.ribu, dur: 0.3, color: '#ffe9b0', strength: 0.25}, {t: EVt.sekarat, dur: 0.35, color: '#ff8a7a', strength: 0.35}, {t: EVt.haloBu, dur: 0.35, color: '#ffe9b0', strength: 0.3},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.protes, dur: 0.3, amp: 0.012}, {t: EVt.penuh, dur: 0.3, amp: 0.015}, {t: EVt.sekarat, dur: 0.35, amp: 0.015}],
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


  const label = (g, txt, x, y, z, t0, t1, o = {}) => popSign(g, sign(txt, o.w || 1.3, o.h || 0.32, {bg: o.bg || '#fff3df', fg: o.fg || '#351f22', frame: o.frame || '#351f22', ...(o.sub ? {sub: o.sub} : {})}), x, y, z, t0, t1, o.vis);
  const PHONE_LINES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23, 24, 25];
  const talking = (t) => PHONE_LINES.some((si) => (T.S[si].voiced || [[T.S[si].start, T.S[si].end]]).some(([a, b]) => t > a && t < b)) && Math.sin(t * 22) > -0.2;

  // ---------- the bedroom: the phone complains (1-9), he calls his mother (10), people (11), the question (12) ----------
  {
    const g = addLoc('kamar');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#5a6a8a', floor: '#8a6a4a', wain: '#3a4a6a'}));
    const bed = P.bed({color: '#6a4a3a', sheet: '#7a8ac8'}); at(bed, -2.3, 0, -3.8, Math.PI / 2); g.add(bed); showWhen(bed, (t) => !(inShots(t, 1) && t < E('halo') - 0.12));
    const lamp = P.glowSprite('#ffe2a0', 0.8); at(lamp, 2.4, 1.6, -4.6); g.add(lamp);
    const ph = P.talkPhone({w: 0.85}); at(ph.group, 0.75, 1.0, -3.4, -0.15); g.add(ph.group);
    const legs = [-1, 1].map((s) => { const l = cyl(0.02, 0.02, 0.18, '#2b2b33', {hull: 0.004}); at(l, 0.75 + s * 0.2, 0, -3.4); g.add(l); return l; });
    const glow = FX.fireLight([0.75, 1.2, -2.8], {intensity: 1.4, dist: 4}); g.add(glow.obj); updaters.push((t) => glow.update(t));
    updaters.push((t) => {
      let mood = 'neutral';
      if (t > E('protes')) mood = 'angry'; if (t > E('hariIni') && t < cut(3)) mood = 'sad'; if (t > E('baterai')) mood = 'dying'; if (t > E('terdiam') - 0.2) mood = 'sad'; if (t > E('satuLagi') - 0.2) mood = 'soft'; if (t > cut(10)) mood = 'neutral'; if (t > E('kadang')) mood = 'soft';
      ph.set(mood, talking(t)); ph.group.visible = (!inShots(t, 10) || t < E('meletakkan')) && !(inShots(t, 1) && t < E('halo') - 0.12);
      ph.group.position.y = 1.0 + Math.abs(Math.sin(t * 3)) * 0.02 + (t > E('protes') && t < E('baterai') && talking(t) ? Math.sin(t * 30) * 0.01 : 0);
      ph.group.rotation.z = t > E('sekarat') && t < E('terdiam') ? -0.15 : 0; });
    const bedTop = P.bed({color: '#6a4a3a', noBlanket: true}); at(bedTop, -1.0, 0, -3.7); g.add(bedTop); showWhen(bedTop, (t) => inShots(t, 1) && t < E('halo') - 0.12);
    const lyer = ch('pemuda', {seed: 9, noFace: true, scale: 0.85}, g, -1.0, -2.8, 0); showWhen(lyer.group, (t) => inShots(t, 1) && t < E('halo') - 0.12);
    updaters.push(() => { lyer.group.rotation.set(-Math.PI / 2, 0, 0); lyer.group.position.y = 0.74; });
    lyer.act([{t: 0, pose: 'carryBoth', expr: 'tired'}, {t: E('jujur') - 0.4, pose: 'carryBoth', expr: 'shocked'}]);
    const mini = P.talkPhone({w: 0.2}); g.add(mini.group); updaters.push((t) => { mini.group.visible = inShots(t, 1) && t < E('halo') - 0.12; at(mini.group, -1.0, 1.2, -3.35, 0, -Math.PI / 2 + 0.35); mini.set(t > E('jujur') - 0.6 ? 'angry' : 'neutral', false); });
    const pm = ch('pemuda', {seed: 1}, g, -0.6, -3.1, 0.25); showWhen(pm.group, (t) => !(inShots(t, 1) && t < E('halo') - 0.12));
    const small = P.phone(); held(pm, small, {y: 0.03, z: 0.06});
    pm.act([{t: 0, pose: 'tap', expr: 'tired'}, {t: E('halo') + 0.1, pose: 'tap', expr: 'shocked'}, {t: E('protes') + 0.1, pose: 'idle', expr: 'surprised'}, {t: cut(2), pose: 'tap', expr: 'tired'}, {t: E('aplikasi'), pose: 'drink', expr: 'tired'}, {t: E('empat'), pose: 'tap', expr: 'tired'}, {t: E('isinya'), pose: 'drink', expr: 'thinking'},
      {t: E('cari') + 0.05, pose: 'shrug', expr: 'nervous'}, {t: E('kantoran') - 0.3, pose: 'give', expr: 'grimace'}, {t: E('digaji') + 0.1, pose: 'give', expr: 'nervous'}, {t: E('derajat') + 0.1, pose: 'tap', expr: 'cheesy'}, {t: E('hapus'), pose: 'cross', expr: 'annoyed'},
      {t: E('saldo') + 0.1, pose: 'idle', expr: 'nervous'}, {t: E('doa') - 0.1, pose: 'beg', expr: 'cheesy'},
      {t: E('baterai'), pose: 'tap', expr: 'excited'}, {t: E('sayang') + 0.1, pose: 'tap', expr: 'nervous'},
      {t: E('terdiam'), pose: 'idle', expr: 'sad'}, {t: E('ibumu') + 0.1, pose: 'idle', expr: 'worried'}, {t: E('geser') + 0.1, pose: 'facepalm', expr: 'sad'},
      {t: E('dia'), pose: 'idle', expr: 'cry'}, {t: cut(10), pose: 'hold', expr: 'sad'}, {t: E('menelepon') - 0.2, pose: 'drink', expr: 'worried'}, {t: E('maaf'), pose: 'drink', expr: 'happy'},
      {t: cut(11), pose: 'idle', expr: 'happy'}, {t: cut(12), pose: 'shrug', expr: 'cheesy'}, {t: E('komentar') - 0.15, pose: 'point', expr: 'cheesy'}]);
    pm.act([{t: E('halo'), action: 'jump', dur: 0.5}, {t: E('game'), action: 'tremble', dur: 0.8}]);
    speak(pm, 28, [[0, 'worried', 'drink'], [0.4, 'happy', 'drink']]);
    // the complaints
    ['44x', '45x', '46x', '47x'].forEach((n, i) => { const t0 = E('aplikasi') - 0.4 + i * ((E('empat') + 0.3 - E('aplikasi')) / 4); const t1 = i < 3 ? t0 + ((E('empat') + 0.3 - E('aplikasi')) / 4) : cut(3); label(g, n, 0.75, 2.35, -3.1, t0, t1, {w: 0.8, h: 0.36, bg: '#e8737a', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 2)}); });
    const app = box(0.4, 0.4, 0.06, toon('#e8737a', {wear: false}), {hull: 0.01}); g.add(app); updaters.push((t) => { app.visible = inShots(t, 2) && t > E('aplikasi') - 0.1; app.scale.setScalar(pop(t, E('aplikasi') - 0.1, 0.3) * (1 + 0.08 * Math.sin(t * 9))); at(app, 1.65, 1.7, -3.2); });
        const wc = P.wallClock(0.3); wc.set(9, 0); at(wc.group, 2.3, 2.2, -4.85); g.add(wc.group);
    label(g, 'SCREEN TIME: 9 JAM', 0.75, 2.35, -3.1, E('sembilan') - 0.1, cut(4), {w: 1.6, bg: '#f2d24a'});
    const pil = ball(0.36, toon('#f6f1e6', {wear: false}), {sx: 1.3, sy: 0.9, sz: 0.35, hull: 0.01}); g.add(pil);
    updaters.push((t) => { const u = smooth((t - E('kantoran') + 0.2) / 0.5); pil.visible = inShots(t, 3) && u > 0.01; at(pil, 0.0 + u * 0.72, 1.3, -3.2); });
    label(g, L.office, 0.75, 2.0, -3.0, E('kantoran') - 0.1, cut(4), {w: 1.3, bg: '#fbf6ea'});
    label(g, L.unpaid, 0.75, 1.68, -2.95, E('digaji') - 0.1, cut(4), {w: 1.0, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const sg = P.selfieGrid(); g.add(sg); updaters.push((t) => { sg.visible = inShots(t, 4) && t > E('galeri') - 0.1; sg.scale.setScalar(pop(t, E('galeri') - 0.1, 0.35)); at(sg, 1.75, 1.2, -3.6, -0.3); });
    label(g, L.full, 0.75, 2.35, -3.1, E('penuh') - 0.05, cut(5), {w: 1.3, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const ct = P.cart(); g.add(ct); updaters.push((t) => { ct.visible = inShots(t, 5) && t > E('keranjang') - 0.1; ct.scale.setScalar(1.2 * pop(t, E('keranjang') - 0.1, 0.35)); at(ct, 1.6, 0, -3.3, -0.4); });
    label(g, L.balance, 0.75, 2.35, -3.0, E('saldo') - 0.1, cut(6), {w: 1.4, bg: '#fbf6ea', fg: '#d8312a'});
    label(g, L.battery, 0.75, 2.35, -3.1, E('persen') - 0.1, cut(7), {w: 0.7, h: 0.4, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    const gm = sign('GAME', 0.35, 0.18, {bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'}); g.add(gm); updaters.push((t) => { gm.visible = inShots(t, 6) && t > E('game') - 0.2; at(gm, -0.35, 1.7 + Math.sin(t * 8) * 0.03, -2.8); });
    // the soft part
    const notif = sign(L.missed, 1.6, 0.36, {bg: '#fbfbf8', fg: '#351f22', frame: '#3fb06a'}); g.add(notif);
    updaters.push((t) => { const on = inShots(t, 8) && t > E('ibumu') - 0.1; const sw = smooth((t - E('geser') - 0.2) / 0.5); notif.visible = on && sw < 0.98; notif.scale.setScalar(pop(t, E('ibumu') - 0.1, 0.35)); at(notif, 0.1 + sw * 3, 2.3, -3.0); });
    label(g, L.nine, -0.3, 2.35, -3.0, E('waktu') - 0.1, cut(10), {w: 1.2, h: 0.5, bg: '#7fc4e8'});
    label(g, L.three, 1.2, 2.35, -3.0, E('tigaMenit') - 0.1, cut(10), {w: 0.9, h: 0.3, bg: '#e0809a'});
    // people inside the phone (11)
    ['IBU', 'AYAH', 'ADIK', 'SAHABAT'].forEach((nm, i) => label(g, nm, -0.15 + (i % 2) * 1.8, 2.3 - Math.floor(i / 2) * 0.7, -3.1, E('orang') - 0.2 + i * 0.12, cut(12), {w: 0.7, h: 0.55, bg: '#fff0d0', fg: '#7a5aa8', frame: '#c9a25a', vis: (t) => inShots(t, 11)}));
    fx(g, FX.glints([0.75, 1.5, -3.0], E('orang'), {n: 26}));
    label(g, L.question, 0.1, 2.6, -2.9, E('kalau') - 0.1, 1e9, {w: 2.3, h: 0.38, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, 0.1, 2.18, -2.85, E('komentar') - 0.1, 1e9, {w: 1.7, h: 0.32, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([0.1, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- Ibu's kitchen: she answers (10) ----------
  {
    const g = addLoc('dapur');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#f0dcc0', floor: '#a8784a', wain: '#c9a25a'}));
    const sc = P.stoveCounter ? P.stoveCounter() : null; if (sc) { at(sc.group || sc, 1.6, 0, -4.4); g.add(sc.group || sc); }
    const ibu = ch('ibu', {seed: 2}, g, -0.2, -3.2, 0.1);
    const ph2 = P.phone(); held(ibu, ph2, {y: 0.03, z: 0.06});
    ibu.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('menelepon') + 0.3, pose: 'drink', expr: 'surprised'}, {t: E('haloBu') + 0.2, pose: 'drink', expr: 'happy'}, {t: E('maaf') + 0.4, pose: 'drink', expr: 'cry'}]);
    fx(g, FX.glints([-0.2, 2.0, -3.0], E('maaf'), {n: 20}));
    const hrt = P.heart('#e0626e'); g.add(hrt); updaters.push((t) => { hrt.visible = t > E('maaf') + 0.2; hrt.scale.setScalar(0.35 * pop(t, E('maaf') + 0.2, 0.35)); at(hrt, 0.4, 2.2 + Math.sin(t * 3) * 0.04, -3.0); });
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
