// All locations in one scene at different x offsets. Story: "Permen karet tertelan" (the 7-year gum myth).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, canvas, texFrom, INK} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {home: 0, studio: 40, gut: 80};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast. Design: 'perky' (new for this video; round no-sleep face, fringe hair, thick brows).
export const CHAR_DESIGN = 'perky';
const CAST = {
  anak: {outfit: 'shirt', jacket: '#fbf6ea', tie: '#d8413a', lower: '#c9353a', pocket: '#ece4d4', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
  anakSmp: {outfit: 'shirt', jacket: '#fbf6ea', tie: '#2a3a6a', lower: '#2a3a6a', pocket: '#ece4d4', hair: '#2b2326', hairStyle: 'fringe', hat: 'none'},
  emak: {hairStyle: 'hijab', hijab: '#c95a7a', brooch: '#e8c35a', hat: 'none', hair: '#3a2a26', outfit: 'batik', jacket: '#7a5aa8', print: '#f2d24a', print2: '#3a2a4a', lower: '#7a5aa8', tie: '#7a5aa8', round: true},
};

// Lighting: a warm home (a cold scared tint on "ketakutan"), a bright studio, the pink-red gut lit warm (red tint on the blockage).
const roomL = {...LOOK_PRESETS.interiorWarm, keyI: 2.4, hemiI: 1.3};
const studio = {...LOOK_PRESETS.interiorCool, keyI: 1.9, hemiI: 0.95, fog: '#141824', grade: {sat: 1.05, contrast: 1.08, tintAmt: 0, vignette: 0.5}};
const gutL = {...LOOK_PRESETS.interiorWarm, keyI: 2.2, hemiI: 1.3, fog: '#5a1a2a', key: '#ffd0c0'};
export const LOOK = {
  home: {keys: [{at: 0, ...roomL}, {at: 'kalimat', ...roomL, ...MOODS.mystery}, {at: 'bayangkan', ...roomL}, {at: 'cut9', ...roomL}, {at: 'sampai', ...roomL, ...MOODS.tense}, {at: 'cut12', ...roomL}]},
  studio: {...studio},
  gut: {keys: [{at: 0, ...gutL}, {at: 'cut9', ...gutL, ...MOODS.danger}]},
};

const under = (g, color, size = 40) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon(paintTex(color, {seed: 3}))); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; g.add(m); };

export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.ketelan, dur: 0.3, color: '#ffffff', strength: 0.3}, {t: EVt.hah, dur: 0.3, color: '#ff8a7a', strength: 0.3}, {t: EVt.smp, dur: 0.3, color: '#ffe9b0', strength: 0.35},
      {t: EVt.fakta, dur: 0.3, color: '#ffe9b0', strength: 0.3}, {t: EVt.dadah, dur: 0.3, color: '#ffe9b0', strength: 0.3}, {t: EVt.sumbatan, dur: 0.35, color: '#ff8a7a', strength: 0.35},
      {t: EVt.pohon, dur: 0.3, color: '#b8e07a', strength: 0.3}, {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4}],
    shakes: [{t: EVt.hah, dur: 0.3, amp: 0.015}, {t: EVt.sumbatan, dur: 0.4, amp: 0.02}, {t: EVt.jangan, dur: 0.3, amp: 0.015}],
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
  const gumChar = (g, s, pos, vis, o = {}) => { const gm = P.gum(o); gm.group.scale.setScalar(s); g.add(gm.group);
    updaters.push((t) => { const p = pos(t); gm.group.visible = vis(t); if (p) { gm.group.position.set(p[0], p[1], p[2]); gm.group.rotation.y = p[3] || 0; } const sq = p && p[4] ? p[4] : 0; gm.group.scale.set(s * (1 + sq), s * (1 - sq), s * (1 + sq));
      const talk = o.talk ? o.talk(t) : 0; gm.mouth.scale.y = 1 + talk * 1.4; }); return gm; };
  const talkOf = (si) => (t) => { const S = T.S[si]; const segs = S.voiced || [[S.start, S.end]]; return segs.some(([a, b]) => t > a && t < b) ? Math.abs(Math.sin(t * 18)) : 0; };

  // ---------- home: swallowed (1), mum's warning (2), seven years (3), relief and the next threat (10-11), the question (12) ----------
  {
    const g = addLoc('home');
    under(g, '#2a2228');
    g.add(P.room(7, 3, 6, {wall: '#f0dcc0', floor: '#a8784a', wain: '#c95a5a'}));
    const tbl = P.cafeTable({top: '#e8e0cc'}); at(tbl.group || tbl, 2.2, 0, -4.0); g.add(tbl.group || tbl);
    const cal = sign('2016', 0.6, 0.5, {bg: '#fbf6ea', fg: '#d8312a', frame: '#d8312a'}); at(cal, -1.9, 2.0, -4.86); g.add(cal);
    const cal2 = sign('2023', 0.6, 0.5, {bg: '#fbf6ea', fg: '#2a3a6a', frame: '#2a3a6a'}); at(cal2, -1.9, 2.0, -4.85); g.add(cal2);
    updaters.push((t) => { const flip = t > E('smp') - 0.6 && t < cut(4); cal.visible = !flip; cal2.visible = flip; });
    const anak = ch('anak', {seed: 1, scale: 0.78}, g, -0.6, -3.0, 0.2);
    const smp = ch('anakSmp', {seed: 2, scale: 0.95}, g, -0.6, -3.0, 0.2);
    const SMP = (t) => t > E('smp') - 0.3 && t < cut(4);
    showWhen(anak.group, (t) => !SMP(t)); showWhen(smp.group, SMP);
    const emak = ch('emak', {seed: 3}, g, 0.75, -3.2, -0.2);
    // the gum in his mouth, then gone
    const g1 = P.gum(); g1.group.scale.setScalar(0.18); g.add(g1.group);
    updaters.push((t) => { const u = smooth((t - E('ketelan') + 0.6) / 0.4); g1.group.visible = t < E('ketelan') + 0.1 || (t > E('dikunyah') - 0.3 && inShots(t, 9)); at(g1.group, -0.6, 1.17 - u * 0.2, -2.75); g1.group.scale.setScalar(0.16 * (1 - u * 0.6)); if (inShots(t, 9)) { at(g1.group, -0.6, 1.17, -2.75); g1.group.scale.setScalar(0.15 * (1 + 0.15 * Math.sin(t * 9))); } });
    // the gum pops out in SMP
    const g2 = P.gum(); g.add(g2.group);
    updaters.push((t) => { const u = t - E('keluar'); g2.group.visible = inShots(t, 3) && u > 0; const k = Math.min(u, 1.5); at(g2.group, -0.6 + k * 0.5, 0.8 + k * 1.2 - k * k * 0.6, -2.7); g2.group.scale.setScalar(0.25 * pop(t, E('keluar'), 0.3)); g2.group.rotation.z = k * 4; });
    fx(g, FX.glints([-0.6, 1.0, -2.7], E('keluar') + 0.05, {n: 16}), (t) => inShots(t, 3));
    label(g, L.seven, 0.75, 2.45, -3.0, E('tujuhTahun') - 0.05, cut(3), {w: 1.2, h: 0.36, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    label(g, L.sd, -1.2, 2.2, -3.0, E('sd') - 0.1, E('smp') - 0.3, {w: 1.1, bg: '#fbf6ea', fg: '#c9353a', vis: (t) => inShots(t, 3)});
    label(g, L.smp, -1.2, 2.2, -3.0, E('smp') - 0.15, cut(4), {w: 0.7, bg: '#fbf6ea', fg: '#2a3a6a', vis: (t) => inShots(t, 3)});
    anak.act([{t: 0, pose: 'idle', expr: 'happy'}, {t: E('ketelan') - 0.3, pose: 'headHold', expr: 'shocked'}, {t: cut(2), pose: 'headHold', expr: 'grimace'}, {t: E('tujuhTahun'), pose: 'headHold', expr: 'scream'},
      {t: E('kalimat'), pose: 'beg', expr: 'worried'}, {t: E('ketakutan'), pose: 'headHold', expr: 'cry'}, {t: E('bayangkan'), pose: 'idle', expr: 'nervous'},
      {t: cut(9), pose: 'idle', expr: 'happy'}, {t: E('dikunyah'), pose: 'hips', expr: 'cheesy'},
      {t: cut(10), pose: 'idle', expr: 'happy'}, {t: E('lega') + 0.05, pose: 'cheer', expr: 'laugh'}, {t: E('sampai') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('ancaman') + 0.05, pose: 'idle', expr: 'worried'},
      {t: E('jangan') + 0.1, pose: 'headHold', expr: 'shocked'}, {t: E('pohon') + 0.05, pose: 'headHold', expr: 'scream'}, {t: cut(12), pose: 'shrug', expr: 'nervous'}, {t: E('komentar') - 0.15, pose: 'point', expr: 'cheesy'}]);
    anak.act([{t: E('ketelan') - 0.2, action: 'jump', dur: 0.5}, {t: E('tujuhTahun'), action: 'tremble', dur: 1.2}, {t: E('ketakutan'), action: 'tremble', dur: 1.0}, {t: E('lega'), action: 'hop', dur: 0.4}, {t: E('pohon'), action: 'jump', dur: 0.5}]);
    speak(anak, 0, [[0, 'worried', 'idle'], [0.5, 'shocked', 'headHold']]);
    smp.act([{t: 0, pose: 'idle', expr: 'tired'}, {t: E('keluar') + 0.05, pose: 'cheer', expr: 'cheesy'}]);
    emak.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('ketelan') + 0.1, pose: 'idle', expr: 'surprised'}, {t: E('hah') - 0.05, pose: 'headHold', expr: 'shocked'}, {t: E('nempel') + 0.05, pose: 'point', expr: 'angry'},
      {t: cut(3), pose: 'cross', expr: 'smug'}, {t: cut(10), pose: 'cross', expr: 'smug'}, {t: E('ancaman') - 0.1, pose: 'hold', expr: 'scheming'}, {t: E('jangan') - 0.05, pose: 'point', expr: 'angry'}, {t: E('pohon'), pose: 'stop', expr: 'furious'},
      {t: cut(12), pose: 'cross', expr: 'smug'}]);
    emak.act([{t: E('hah'), action: 'jump', dur: 0.5}]);
    speak(emak, 1, [[0, 'shocked', 'headHold'], [0.35, 'angry', 'point']]);
    speak(emak, 16, [[0, 'angry', 'point'], [0.55, 'furious', 'stop']]);
    showWhen(emak.group, (t) => !inShots(t, 9) && !(inShots(t, 10) && t < E('sampai') - 0.3));
    walkPath(emak, [[0, 0.75, -3.2], [cut(10) - 0.02, 0.75, -3.2], [cut(10), 2.6, -3.6], [E('ancaman') - 0.2, 0.75, -3.2]]);
    const ws = P.watermelon(0.16, {cut: true}); held(emak, ws, {hand: 0, y: 0.0, z: 0.1, rx: 1.2}); showWhen(ws, (t) => t > E('sampai') - 0.4 && t < cut(12));
    // a tree grows out of a thought above his head
    const tr = P.tree({seed: 711, h: 1.0}); tr.scale.setScalar(0.5); g.add(tr);
    updaters.push((t) => { tr.visible = inShots(t, 11) && t > E('pohon') - 0.1; tr.scale.setScalar(0.5 * pop(t, E('pohon') - 0.1, 0.6)); at(tr, -0.6, 1.85, -3.0); });
    label(g, L.chew, -0.6, 2.35, -2.9, E('dikunyah') - 0.1, cut(10), {w: 2.2, h: 0.34, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a', vis: (t) => inShots(t, 9)});
    label(g, L.question, 0.1, 2.7, -2.9, E('ancaman2') - 0.1, 1e9, {w: 2.3, h: 0.38, fg: '#8a2a36', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    label(g, L.comment, 0.1, 2.28, -2.85, E('komentar') - 0.12, 1e9, {w: 1.7, h: 0.34, bg: '#e0626e', fg: '#fff3df', frame: '#8a2a36', vis: (t) => inShots(t, 12)});
    fx(g, FX.confetti([0, 2.9, -2.6], E('komentar') + 0.05, {seed: 21}), (t) => inShots(t, 12));
  }

  // ---------- the studio: myth or fact? (4) ----------
  {
    const g = addLoc('studio');
    under(g, '#14161c');
    const fl0 = box(30, 0.04, 14, toon('#262a36', {paint: {seed: 721}}), {edges: false}); at(fl0, 0, -0.03, -3); g.add(fl0);
    const wall = box(30, 9, 0.2, toon('#1e2840', {paint: {seed: 722}}), {edges: false}); at(wall, 0, 0, -6.2); g.add(wall);
    label(g, L.myth, -1.1, 2.0, -3.6, E('mitos') - 0.1, 1e9, {w: 1.4, h: 0.6, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
    label(g, L.fact, 1.1, 2.0, -3.6, E('fakta') - 0.1, 1e9, {w: 1.4, h: 0.6, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'});
    const ped = cyl(0.5, 0.6, 0.6, '#c9a25a'); at(ped, 0, 0, -3.4); g.add(ped);
    gumChar(g, 0.9, (t) => [Math.sin(t * 2) * 0.05, 0.6 + Math.abs(Math.sin(t * 4)) * 0.08, -3.3, Math.sin(t * 1.5) * 0.4], () => true);
    const q = sign('?', 0.4, 0.5, {bg: '#f2d24a', fg: '#351f22', frame: '#351f22'}); popSign(g, q, 0, 1.6, -3.2, cut(4) + 0.2);
    for (const x of [-1.1, 1.1]) { const sp = P.glowSprite('#fff2c8', 0.8); at(sp, x, 2.0, -3.8); g.add(sp); }
  }

  // ---------- the gut: the stomach (5-6), the tube (7-9) ----------
  {
    const g = addLoc('gut');
    under(g, '#5a1a2a');
    const st = P.stomachSet(4); at(st, 0, 0, -3.6); g.add(st);
    fx(g, FX.smoke([0, 0.1, -3.4], cut(5), {n: 24, every: 0.12, life: 1.4, size: 0.2, grow: 1.5, rise: 0.6, drift: 1.2, color: '#c8f07a', opacity: 0.5}));
    gumChar(g, 1.0, (t) => { const b = Math.abs(Math.sin(t * 3)); const s = t > E('kenyal') && t < E('kenyal') + 1.4 ? Math.sin(t * 14) * 0.15 : 0; return [Math.sin(t * 1.2) * 0.3, 0.06 + b * 0.25, -3.0, Math.sin(t) * 0.3, s]; }, (t) => inShots(t, 5));
    label(g, L.hard, 0, 1.45, -3.1, E('sulit') - 0.1, E('kenyal'), {w: 1.6, bg: '#fbf6ea', fg: '#d8312a'});
    label(g, L.chewy, -0.7, 1.45, -3.1, E('kenyal') - 0.1, E('cairan'), {w: 1.0, bg: '#f28ab0'});
    label(g, L.acid, 0.6, 1.45, -3.1, E('cairan') - 0.1, cut(6), {w: 1.5, bg: '#9ad04a'});
    // the gum tries the wall and slides off: it does not stick
    gumChar(g, 1.0, (t) => { const u = smooth((t - E('bukan')) / 0.5), d = smooth((t - E('menempel') - 0.1) / 0.8); return [1.6 - u * 0.2, 1.4 * u * (1 - d) + 0.06, -3.8 + u * 0.2, -0.6, d > 0 && d < 1 ? 0.1 : 0]; }, (t) => inShots(t, 6));
    label(g, L.noStick, 0.6, 2.0, -3.1, E('menempel') + 0.1, cut(7), {w: 1.7, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'});
    // the tube: pushed along, out in a few days, a tourist waves goodbye
    const TX = 14;
    const tube = P.gutTube(16, 1.3); at(tube.group, TX, 0, -3.4); g.add(tube.group); updaters.push((t) => tube.update(t));
    const gx = (t) => (t < cut(8) ? TX - 4.6 + 3.2 * smooth((t - cut(7)) / (cut(8) - cut(7))) : TX - 0.6 + 4.6 * smooth((t - cut(8)) / (cut(9) - cut(8)))); // follows the camera
    const tg = gumChar(g, 1.0, (t) => [gx(t), 0.07 + Math.abs(Math.sin(t * 5)) * 0.12, -3.3, 0.3], (t) => inShots(t, 7) || inShots(t, 8), {talk: talkOf(11)});
    const hat = cyl(0.3, 0.36, 0.14, '#e8c35a', {hull: 0.01}); const hatTop = cyl(0.18, 0.18, 0.14, '#e8c35a', {hull: 0.008}); at(hatTop, 0, 0.12, 0); hat.add(hatTop); const band = cyl(0.185, 0.185, 0.04, '#d8413a', {hull: 0}); at(band, 0, 0.13, 0); hat.add(band);
    at(hat, 0, 0.55, 0); tg.group.add(hat);
    const shades = [-1, 1].map((sd) => { const gl = box(0.12, 0.07, 0.02, '#1f1d24', {hull: 0}); at(gl, sd * 0.11, 0.36, 0.33); tg.group.add(gl); return gl; });
    const camB = box(0.16, 0.11, 0.08, '#2b2b33', {hull: 0.006}); at(camB, 0.12, 0.12, 0.3); tg.group.add(camB);
    const suit = P.suitcase ? P.suitcase() : null; if (suit) { const sg = suit.group || suit; sg.scale.setScalar(0.35); at(sg, -0.45, 0.0, 0); tg.group.add(sg); }
    updaters.push((t) => { const on = inShots(t, 8); hat.visible = on; camB.visible = on; shades.forEach((x) => { x.visible = on; }); if (suit) (suit.group || suit).visible = on; });
    label(g, L.push, TX - 3.9, 1.55, -2.9, E('mendorong') - 0.1, E('terdorong'), {w: 1.7, bg: '#fbf6ea'});
    label(g, L.days, TX - 1.9, 1.55, -2.9, E('hari') - 0.1, cut(8), {w: 1.6, bg: '#f2d24a'});
    label(g, L.exit, TX + 4.4, 1.55, -3.0, cut(8), cut(9), {w: 1.4, bg: '#3fb06a', fg: '#fff3df', frame: '#1f6a3a'});
    label(g, L.tour, TX + 1.0, 1.55, -2.9, E('numpang') - 0.1, E('dadah') - 0.3, {w: 1.6, bg: '#7fc4e8'});
    fx(g, FX.confetti([TX + 4.8, 2.0, -3.0], E('dadah'), {seed: 5}));
    // too many: a blockage
    const BX = 30;
    const tube2 = P.gutTube(10, 1.3); at(tube2.group, BX, 0, -3.4); g.add(tube2.group); updaters.push((t) => tube2.update(t * 0.3));
    for (let i = 0; i < 14; i++) { const gm = P.gum({color: ['#f28ab0', '#e8737a', '#f6b0c8'][i % 3]}); gm.group.scale.setScalar(0.7); g.add(gm.group);
      const t0 = E('banyak') + i * 0.12, px = BX + 0.6 - (i % 5) * 0.45, py = 0.05 + Math.floor(i / 5) * 0.45, pz = -3.4 + ((i % 3) - 1) * 0.4;
      updaters.push((t) => { gm.group.visible = inShots(t, 9) && t > t0; const k = smooth((t - t0) / 0.6); at(gm.group, px - 4 * (1 - k), py, pz, (i % 4) * 0.5); }); }
    label(g, L.careful, BX, 2.6, -3.0, E('hatiHati') - 0.1, E('sumbatan'), {w: 1.4, h: 0.36, bg: '#f2d24a'});
    label(g, L.block, BX, 2.6, -3.0, E('sumbatan') - 0.05, cut(10), {w: 1.4, h: 0.38, bg: '#d8312a', fg: '#fff3df', frame: '#8a1a1a'});
  }

  return {world, chars, locGroups, update(t, camPos) {
    for (const u of updaters) u(t);
    for (const c of chars) c.update(t, camPos);
    world.updateMatrixWorld(true);
  }};
}
