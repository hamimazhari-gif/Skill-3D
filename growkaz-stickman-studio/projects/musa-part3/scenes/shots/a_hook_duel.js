// shots/a_hook_duel.js — p01–p23: cold open at the sea, title, the duel in the arena, the magicians believe.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, text, FONTS, wordTime } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { shore } from '../sets/sea.js';
import { desert } from '../sets/desert.js';
import { city, palace, throne } from '../sets/egypt.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, staff } from '../lib/_costume.js';
import { crowdBani, bani, SUJUD, KNEEL_UP, chariot, horse, smallSnake, cobra } from '../lib3/_army.js';
import { MUSA, HARUN, FIRAUN, PENYIHIR, PENJAGA } from '../cast.js';

const HOLY = '#fff0c0', PURPLE = '#c07aff';
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
// the arena: golden city square + big crowd in the foreground
function arena(g, t, cam, o = {}) {
  const r = city(g, t, cam, { mood: o.mood || 'golden' });
  if (o.crowd !== false) layer(g, cam, 1.15, (g) => FX.crowd(g, t, { y: E.H * V(0.86, 0.8), w: E.W * 1.4, x: -E.W * 0.2, rows: 7, rowH: V(26, 30), size: V(2.2, 2.4), color: '#1a1012', wave: o.wave ?? 0.5, cheer: o.cheer ?? 0.3 }));
  return r;
}
const MAGI_X = (CX, i) => CX + V(120, 90) + i * V(110, 90);

// p01 — "Di depan mereka… lautan luas."  from behind the crowd, the sea ahead
registerShot('p01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.08 * k, y: -20 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn' });
  layer(g, cam, 1, (g) => crowdBani(g, { x0: CX - V(700, 520), x1: CX + V(700, 520), y: GY + V(160, 200), s: V(1.5, 1.6), n: 9, t, facing: 1, pose: POSES.stand, depth: 60, rim: { color: M.rim, dir: [0, -1], w: 4 }, seed: 1 }));
  FX.dust(g, t, { count: 40, color: M.key, a: 0.35 });
} });
// p02 — "Di belakang mereka… pasukan Firaun yang tak terhitung jumlahnya."  dust on the horizon, the army approaches
registerShot('p02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.12 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dawn', sunX: -V(500, 300) });
  layer(g, cam, 0.6, (g) => {
    const y = GY - V(60, 90);
    g.fillStyle = alpha(M.fog, 0.55); g.beginPath(); g.ellipse(CX, y - 60, E.W * 0.9, 90, 0, Math.PI, Math.PI * 2); g.fill();
    for (let i = 0; i < 26; i++) { const x = CX - E.W * 0.7 + i * E.W * 1.4 / 26 + Math.sin(i) * 20; person(g, { x, y: y + (i % 3) * 8, s: 0.35, facing: -1, outfit: PENJAGA, pose: walkPose(t * 8 + i, { run: true }), expr: 'angry', spear: true }); }
    for (let i = 0; i < 4; i++) chariot(g, CX - V(500, 350) + i * V(330, 230), y + 30, 0.32, -1, t + i, i === 1 ? FIRAUN : PENJAGA, M.rim);
  });
  FX.dust(g, t, { count: 80, color: M.fog, a: 0.5, speed: -20 });
} });
// p03 — "Tidak ada jalan keluar."  trapped: frightened faces look back
registerShot('p03', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.03 * t, x: 20 * t };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn' });
  layer(g, cam, 1, (g) => crowdBani(g, { x0: CX - V(500, 420), x1: CX + V(500, 420), y: GY + V(140, 160), s: V(1.8, 1.9), n: 5, t, facing: -1, pose: POSES.handsOnHead, expr: 'scared', depth: 50, rim: { color: M.rim, dir: [1, -0.5], w: 5 }, seed: 4 }));
  const [qx, qy] = shake(t, 3, 12); g.translate(qx, qy);
} });
// p04 — "Atau… benarkah begitu?"  Musa calm, staff glowing
registerShot('p04', { draw(g, t, info) {
  const M = mood('dawn');
  blurLayer(g, 12, (g) => shore(g, t, { z: 1.4, y: -100 }, { mood: 'dawn' })); veil(g, '#08061a', 0.3);
  bigPerson(g, E.W / 2, E.H * V(0.58, 0.55), V(300, 330) * (1 + 0.04 * t), { outfit: MUSA, expr: t > 0.5 ? 'smirk' : 'determined', look: [0.2, -0.2], rimColor: HOLY, rimSide: 1 });
  glow(g, E.W * 0.85, E.H * 0.7, 300, S().ui.gold, 0.5 * ease.out(prog(t, 0.3, 1.2)));
  staff(g, E.W * 0.85, E.H * 1.05, E.W * 0.85, E.H * 0.45, 22, { color: HOLY, dir: [-1, -0.3] }, S().ui.gold);
} });
// p05 — title card
registerShot('p05', { draw(g, t, info) {
  blurLayer(g, 12, (g) => shore(g, t, { z: 1.2 }, { mood: 'dawn', split: 0.5 })); veil(g, '#04040e', 0.5);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI MUSA', 'LAUTAN TERBELAH'], sub: 'PART 3', dur: info.dur + 0.5, y: E.H * 0.46 });
} });

// p06 — "Hari itu, seluruh rakyat Mesir berkumpul."
registerShot('p06', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.06 * k, y: -30 * k };
  const { GY, CX, M } = arena(g, t, cam, { cheer: 0.8, wave: 1 });
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 4; i++) person(g, { x: MAGI_X(CX, i), y: GY + 70 + (i % 2) * 12, s: V(1.0, 1.05), facing: -1, outfit: PENYIHIR, pose: breathe(POSES.crossArms, t, 1, i), expr: 'smirk', rim: { color: M.rim, dir: [-1, -0.5], w: 4 } });
    person(g, { x: CX - V(260, 220), y: GY + 80, s: V(1.05, 1.1), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'determined', staff: true, rim: { color: M.rim, dir: [-1, -0.5], w: 4 } });
    person(g, { x: CX - V(380, 330), y: GY + 86, s: V(1.02, 1.07), facing: 1, outfit: HARUN, pose: breathe(POSES.stand, t, 1, 2), expr: 'determined', rim: { color: M.rim, dir: [-1, -0.5], w: 4 } });
  });
} });
// p07 — "Firaun yakin, Musa akan dipermalukan."  Pharaoh enthroned at the arena, smirking
registerShot('p07', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), fs = V(1.8, 2.0), tx = E.W / 2 + V(60, 40);
  const cam = { z: 1.08 + 0.06 * k, y: -60 };
  const { GY, M } = city(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => { throne(g, tx, GY + 40, M, fs); person(g, { x: tx - 6 * fs, y: GY + 40 - 78 * fs, s: fs, facing: -1, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'sit'], [1.6, { ...POSES.sit, eF: [22, -140], hF: [10, -176] }]]), t), expr: 'smirk', look: [-0.6, 0.1], rim: { color: M.rim, dir: [-1, -0.4], w: 5 }, shadow: false }); });
  FX.dust(g, t, { count: 40, color: M.key, a: 0.35 });
} });
// p08 — "Para penyihir melemparkan tali dan tongkat mereka…"
registerShot('p08', { draw(g, t, info) {
  const cam = { z: 1.15, x: V(120, 100) };
  const { GY, CX, M } = arena(g, t, cam, {});
  const rim = { color: M.rim, dir: [-1, -0.5], w: 4 };
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 4; i++) {
      const th = 0.3 + i * 0.25, x = MAGI_X(CX, i), y = GY + 70 + (i % 2) * 12;
      person(g, { x, y, s: V(1.3, 1.35), facing: -1, outfit: PENYIHIR, pose: posesAt(t, [[0, 'ready'], [th, 'point']], 0.2), expr: 'smirk', rim });
      if (t > th) { const u = clamp((t - th) / 0.7), px = lerp(x - 80, x - 260 - i * 30, u), py = lerp(y - 220, y + 10, u) - Math.sin(u * Math.PI) * 120; seg(g, [[px, py], [px - 30, py + 20 * Math.sin(t * 20 + i)], [px - 60, py]], 6, '#a8865a'); }
    }
  });
} });
// p09 — "Seketika, semuanya tampak seperti ular yang merayap!"
registerShot('p09', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.08 * k, y: 80 };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false, mood: 'golden' });
  veil(g, '#1a0030', 0.25);
  layer(g, cam, 1, (g) => { for (let i = 0; i < 9; i++) { const x = CX - V(500, 350) + (i % 5) * V(220, 170) + Math.sin(i * 3) * 40 - t * 30, y = GY + 40 + Math.floor(i / 5) * 90 + (i % 2) * 20; glow(g, x - 40, y, 140, PURPLE, 0.25); smallSnake(g, x, y, V(1.1, 1.0), t + i, i % 2 ? 1 : -1, i); } });
  FX.dust(g, t, { count: 60, color: PURPLE, a: 0.45, speed: -10 });
} });
// p10 — "Rakyat terperangah."
registerShot('p10', { draw(g, t, info) {
  const M = mood('golden'), cam = { z: 1.0 + 0.04 * t };
  blurLayer(g, 10, (g) => city(g, t, { z: 1.3 }, { mood: 'golden' }));
  layer(g, cam, 1, (g) => crowdBani(g, { x0: -E.W * 0.1, x1: E.W * 1.1, y: E.H * V(0.95, 0.9), s: V(2.2, 2.4), n: 6, t, facing: 1, pose: POSES.handsOnHead, expr: 'shocked', look: [1, 0.4], depth: 80, rim: { color: M.rim, dir: [0, -1], w: 5 }, seed: 7 }));
} });
// p11 — "Lalu Allah berfirman kepada Musa:"  light descends on Musa (no figure depicted)
registerShot('p11', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.08 * k, x: -V(120, 100) };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false });
  veil(g, '#000010', 0.3 * k);
  layer(g, cam, 1, (g) => {
    holyLight(g, t, [CX - V(160, 120), GY - V(160, 200)], ease.out(prog(t, 0.3, 1.5)));
    person(g, { x: CX - V(160, 120), y: GY + 60, s: V(1.5, 1.6), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: t < 1 ? 'worried' : 'awe', look: [0.2, -0.8], staff: true, rim: { color: HOLY, dir: [0, -1], w: 5 } });
    for (let i = 0; i < 4; i++) smallSnake(g, CX + V(140, 100) + i * 80, GY + 60 + (i % 2) * 20, 0.8, t + i, -1, i);
  });
} });
// p12 — "Jangan takut!"
registerShot('p12', { draw(g, t, info) {
  blurLayer(g, 14, (g) => city(g, t, { z: 1.5, y: -100 }, { mood: 'golden' })); veil(g, '#08040a', 0.45);
  holyLight(g, t, [E.W / 2, E.H * 0.25], 0.6);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.05 * t), { outfit: MUSA, expr: t < 0.4 ? 'worried' : 'determined', look: [0, -0.3], rimColor: HOLY, rimSide: -1 });
} });
// p13 — "Lemparkan tongkatmu!"
registerShot('p13', { draw(g, t, info) {
  const cam = { z: 1.12, x: 30 * t };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false });
  const rel = 0.5, s = V(1.6, 1.7), mx = CX - V(260, 230);
  layer(g, cam, 1, (g) => {
    person(g, { x: mx, y: GY + 60, s, facing: 1, outfit: MUSA, pose: posesAt(t, [[0, 'stand'], [0.15, { ...POSES.ready, hF: [10, -230], eF: [10, -196] }], [rel, 'point']], 0.25), expr: 'determined', staff: t < rel, rim: { color: HOLY, dir: [1, -0.6], w: 5 } });
    if (t >= rel) { const u = clamp((t - rel) / 0.8), x = lerp(mx + 80 * s, CX + V(150, 100), u), y = lerp(GY - 220 * s, GY + 40, u) - Math.sin(u * Math.PI) * 160, a = u * 8, L = 90 * s; staff(g, x - Math.cos(a) * L, y - Math.sin(a) * L, x + Math.cos(a) * L, y + Math.sin(a) * L, 7 * s, { color: HOLY, dir: [0, -1] }); }
    for (let i = 0; i < 4; i++) smallSnake(g, CX + V(200, 150) + i * 80, GY + 70 + (i % 2) * 20, 0.8, t + i, -1, i);
  });
} });
// p14 — "Tongkat itu berubah menjadi ular raksasa…"
registerShot('p14', { draw(g, t, info) {
  const [qx, qy] = shake(t, (1 - prog(t, 0, 1)) * 14, 25); g.translate(qx, qy);
  const rise = ease.outBack(prog(t, 0, 1.2)), cam = { z: 1.05, y: -40 };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false });
  veil(g, '#001008', 0.25);
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(CX + V(40, 60), GY + 60); g.scale(rise, rise); g.rotate(Math.sin(t * 2) * 0.03); cobra(g, 0, 0, V(0.9, 0.95), -1); g.restore();
    person(g, { x: CX - V(380, 330), y: GY + 70, s: V(1.2, 1.25), facing: 1, outfit: MUSA, pose: breathe(POSES.point, t), expr: 'determined', rim: { color: '#c0ff9a', dir: [1, -0.5], w: 4 } });
  });
  FX.rings(g, E.W / 2, E.H * 0.5, t, { count: 3, r0: 60, r1: V(800, 700), speed: 1.2, color: '#c0ff9a', a: 0.4 * (1 - prog(t, 0, 1.5)) });
} });
// p15 — "dan menelan semua tipu daya mereka."
registerShot('p15', { draw(g, t, info) {
  const cam = { z: 1.1, x: -20 * t };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false });
  veil(g, '#001008', 0.2);
  layer(g, cam, 1, (g) => {
    const lunge = Math.sin(t * 3.2) * 0.5 + 0.5;
    g.save(); g.translate(CX - V(80, 60), GY + 60); g.rotate(-0.15 * lunge); cobra(g, 0, 0, V(0.85, 0.9), 1); g.restore();
    for (let i = 0; i < 6; i++) { const gone = t > 0.4 + i * 0.35; if (gone) continue; const x = CX + V(260, 200) + i * 60 - (t - i * 0.35) * 80, y = GY + 70 + (i % 2) * 25; smallSnake(g, x, y, 0.9, t + i, -1, i); }
    if (Math.floor(t / 0.35) % 2 === 0) FX.sparkle(g, CX + V(160, 120), GY - V(480, 520), 40, '#c0ff9a', 0.8);
  });
} });
// p16 — "Hingga tak tersisa."  empty ground, the staff back in Musa's hand
registerShot('p16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 - 0.05 * k };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(60, 40), y: GY + 60, s: V(1.6, 1.7), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'neutral', staff: true, staffGlow: S().ui.gold, rim: { color: M.rim, dir: [-1, -0.5], w: 5 } }));
  FX.dust(g, t, { count: 80, color: M.key, a: 0.5, speed: 6 });
} });
// p17 — "Hening."  the crowd frozen
registerShot('p17', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.03 * t, r: 0.006 * t };
  arena(g, 0.3, cam, { cheer: 0, wave: 0 });
  veil(g, '#0a1020', 0.45);
  FX.drops(g, 0.3, { count: 30, color: '#e0e8ff', rMin: 2, rMax: 6 });
} });
// p18 — "Para penyihir tahu betul… ini bukan sihir."  a magician's realisation
registerShot('p18', { draw(g, t, info) {
  const M = mood('golden');
  blurLayer(g, 14, (g) => city(g, t, { z: 1.5, x: 120, y: -100 }, { mood: 'golden' })); veil(g, '#0a0410', 0.4);
  bigPerson(g, E.W / 2, E.H * V(0.62, 0.58), V(290, 310) * (1 + 0.04 * t), { outfit: PENYIHIR, expr: t < 1.4 ? 'shocked' : 'awe', look: [-0.4, 0], rimColor: t < 1.4 ? PURPLE : HOLY, rimSide: -1 });
} });
// p19 — "Mereka langsung bersujud."
registerShot('p19', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k, y: 40 };
  const { GY, CX, M } = arena(g, t, cam, { cheer: 0 });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 5; i++) { const d = ease.inOut(prog(t, 0.05 + i * 0.08, 0.6 + i * 0.08)); person(g, { x: CX - V(380, 300) + i * V(190, 150), y: GY + 70 + (i % 2) * 14, s: V(1.2, 1.2), facing: 1, outfit: PENYIHIR, pose: posesAt(d, [[0, 'stand'], [0.4, 'kneel'], [0.9, SUJUD]], 0.3), expr: 'sleepy', rim: { color: HOLY, dir: [0, -1], w: 4 } }); } });
  glow(g, E.W / 2, E.H * 0.6, V(700, 600), HOLY, 0.2 * k);
} });
// p20 — "Kami beriman kepada Tuhan Musa dan Harun!"
registerShot('p20', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.04 * t, x: -V(80, 60) };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false });
  holyLight(g, t, [E.W / 2, E.H * 0.35], 0.5);
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) person(g, { x: CX - V(220, 200) + i * V(220, 200), y: GY + 70 + (i % 2) * 12, s: V(1.45, 1.5), facing: 1, outfit: PENYIHIR, pose: breathe(KNEEL_UP, t, 1, i), expr: 'happy', talk: i === 1 ? Math.max(0, 0.4 + 0.4 * Math.sin(t * 12)) : 0, look: [0.3, -0.8], rim: { color: HOLY, dir: [0, -1], w: 5 } }); });
} });
// p21 — "Firaun murka dan mengancam akan menyiksa mereka."
registerShot('p21', { draw(g, t, info) {
  const M = mood('pharaoh');
  blurLayer(g, 14, (g) => palace(g, t, { z: 1.5, x: 100, y: -150 }, { mood: 'pharaoh' })); veil(g, '#1a0000', 0.4);
  const [qx, qy] = shake(t, t < 0.6 ? 7 : 2, 22);
  bigPerson(g, E.W / 2 + qx, E.H * V(0.6, 0.56) + qy, V(290, 320) * (1 + 0.05 * t), { outfit: FIRAUN, expr: 'angry', face: { brows: null, mouth: t % 1 < 0.6 ? 'oBig' : 'frown' }, rimColor: M.rim, rimSide: 1 });
  const r = V(290, 320) * (1 + 0.05 * t), fx = E.W / 2 + qx, fy = E.H * V(0.6, 0.56) + qy;
  for (const sx of [-1, 1]) seg(g, [[fx + sx * r * 0.56, fy - r * 0.44], [fx + sx * r * 0.14, fy - r * 0.3]], r * 0.1, S().feature);
  FX.dust(g, t, { count: 50, color: M.practical, a: 0.4, speed: 20 });
} });
// p22 — "Tapi mereka tidak gentar. Iman telah masuk ke dalam hati mereka."
registerShot('p22', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.06 * k };
  const { GY, CX, M } = arena(g, t, cam, { crowd: false, mood: 'dusk' });
  veil(g, '#0a0410', 0.2);
  const heart = ease.out(prog(info.globalT, wordTime('Iman', 57) - 0.2, wordTime('Iman', 57) + 1.0));
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) { const x = CX - V(240, 220) + i * V(240, 220), y = GY + 70; person(g, { x, y, s: V(1.45, 1.5), facing: 1, outfit: PENYIHIR, pose: breathe(POSES.kneel, t, 1, i), expr: 'smile', rim: { color: HOLY, dir: [0, -1], w: 5 } }); if (heart > 0) { glow(g, x + 8, y - 110 * 1.5, 120 * heart, '#ffe08a', 0.8); FX.sparkle(g, x + 8, y - 110 * 1.5, 26 * heart, '#ffffff', heart); } } });
} });
// p23 — "Firaun tetap sombong."
registerShot('p23', { draw(g, t, info) {
  const cam = { z: 1.12, x: 20 * t };
  const { GY, CX, M } = palace(g, t, cam, { mood: 'pharaoh' });
  layer(g, cam, 1, (g) => person(g, { x: CX + V(60, 40), y: GY + 30, s: V(1.9, 2.0), facing: t > 0.7 ? 1 : -1, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'shrug'], [0.5, 'crossArms']]), t), expr: 'smirk', rim: { color: M.rim, dir: [-1, -0.4], w: 5 } }));
} });
