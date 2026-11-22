// shots/luth2.js — Kisah Nabi Luth, Part 2 (m01–m25). The angels appear as men in white whose faces are hidden by light.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, poly } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { city as egyptCity } from '../sets/egypt.js';
import { camp } from '../sets/madyan.js';
import { person, bigPerson, flame, pt, GOLD } from '../lib/_costume.js';
import { blindEyes } from '../lib7/_y3.js';
import { LUTH, ISTRI_LUTH, KAUM } from '../cast.js';

const city = (g, t, cam, o = {}) => egyptCity(g, t, cam, { ...o, noEgypt: true });
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff3a2a';
const TAMU = { top: 'dress', color: '#f8f4ea', head: 'hood', headColor: '#ffffff' };
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
// a guest (angel in human form): white robe; face hidden by light
function tamu(g, o, k = 1) { person(g, { ...o, outfit: TAMU, expr: 'neutral', rim: { color: HOLY, dir: [0, -1], w: 5 } }); const [hx, hy, r] = headPos(o); glow(g, hx, hy, r * 4 * k, '#ffffff', 0.9); circle(g, hx, hy, r * 1.05, alpha('#fffbe8', 0.95 * Math.min(1, k))); }
// villager with a torch
function torchMan(g, o, t, i) { person(g, o); const [hx, hy] = pt(o, 'hF'), s = o.s || 1; seg(g, [[hx, hy + 10 * s], [hx + 4 * s, hy - 70 * s]], 7 * s, '#2a1a10'); flame(g, hx + 4 * s, hy - 72 * s, 0.28 * s, t, i); }
function mob(g, t, x0, dx, y, s, n, o = {}) { for (let i = 0; i < n; i++) { const of = KAUM[i % KAUM.length]; const op = { x: x0 + i * dx + (i % 2) * 18, y: y + (i % 3) * 14, s: s * (1 - (i % 3) * 0.06), facing: o.facing ?? 1, outfit: of, pose: o.pose ? o.pose(i) : (i % 2 ? POSES.point : POSES.holdFront), expr: o.expr ? o.expr(i) : 'angry', talk: o.talk ? Math.max(0, 0.5 * Math.sin(t * 12 + i)) : 0, rim: { color: RED, dir: [0, -1], w: 4 }, dim: o.dim }; if (o.walk) op.pose = walkPose(t * 7 + i); if (i % 2 === 0 && o.torches !== false) torchMan(g, op, t, i); else person(g, op); } }
function house(g, t, cam, o = {}) {
  const { GY, CX, M } = camp(g, t, cam, { mood: o.mood || 'night', stars: true, fire: false });
  layer(g, cam, 0.9, (g) => { const w = V(520, 480), h = V(380, 420); g.fillStyle = '#2a2236'; g.fillRect(CX - w / 2, GY - h, w, h); poly(g, [[CX - w / 2 - 30, GY - h], [CX, GY - h - 120], [CX + w / 2 + 30, GY - h]], '#1a1626'); g.fillStyle = M.practical; g.fillRect(CX - 60, GY - 200, 120, 200); glow(g, CX, GY - 100, 260, M.practical, 0.4); g.fillStyle = M.practical; g.fillRect(CX + w / 2 - 140, GY - h + 80, 80, 90); glow(g, CX + w / 2 - 100, GY - h + 125, 140, M.practical, 0.35); });
  return { GY, CX, M };
}
// inside Luth's house: mud-brick room, oil lamp, door on the right (o.push shakes it)
function room(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = E.H * V(0.8, 0.68), CX = E.W / 2, dx = CX + V(380, 300);
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#1a120c', '#3a2618', '#2a1a10']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let r = 0; r < 24; r++) for (let c = 0; c < 12; c++) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(-E.W * 0.3 + c * 180 + (r % 2) * 90, GY - r * 60 - 60, 180, 60); } });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, ['#3a2416', '#120804']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); });
  layer(g, cam, 0.95, (g) => { const [sx, sy] = o.push ? shake(t, o.push * 8, 25) : [0, 0]; g.fillStyle = '#4a3020'; g.fillRect(dx - 110 + sx, GY - 420, 220, 420); for (let k = 0; k < 4; k++) seg(g, [[dx - 110 + sx + k * 55, GY - 420], [dx - 110 + sx + k * 55, GY]], 4, '#2a1a10'); seg(g, [[dx - 120, GY - 240], [dx + 120, GY - 240]], 12, '#1a1008'); if (o.light) { g.fillStyle = alpha('#ff8a3a', 0.6 * o.light); g.fillRect(dx - 114, GY - 424, 6, 424); glow(g, dx - 110, GY - 210, 200, '#ff6a2a', 0.4 * o.light); } });
  const lx = CX - V(380, 300); layer(g, cam, 1, (g) => { rr(g, lx - 30, GY - 130, 60, 20, 8); g.fillStyle = '#8a6a30'; g.fill(); seg(g, [[lx, GY - 110], [lx, GY]], 8, '#2a1a10'); flame(g, lx + 20, GY - 140, 0.25, t, 2); FX.pool(g, lx, GY + 20, 480, 70, M.practical, 0.3); });
  return { GY, CX, M, dx };
}

// m01 — "Part dua. Tamu yang Bukan Manusia."
registerShot('m01', { draw(g, t, info) {
  blurBg(g, (g) => house(g, t, { z: 1.2 }), 12, 0.45, '#04020a');
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI LUTH', 'PART 2'], sub: 'TAMU YANG BUKAN MANUSIA', dur: info.dur + 0.5, y: E.H * 0.44 });
} });
// m02 — "Musuh itu…"
registerShot('m02', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.1 * t };
  const { GY, CX } = house(g, t, cam); veil(g, '#000010', 0.3);
  layer(g, cam, 0.9, (g) => { person(g, { x: CX, y: GY, s: V(1.0, 1.05), facing: -1, outfit: ISTRI_LUTH, pose: breathe(POSES.crossArms, t), expr: 'smirk', dim: true, rim: { color: RED, dir: [0, -1], w: 3 } }); glow(g, CX - 6, GY - 205, 26, RED, 0.8); });
} });
// m03 — "adalah istrinya sendiri."  revealed
registerShot('m03', { draw(g, t, info) {
  const M = mood('night');
  blurBg(g, (g) => house(g, t, { z: 1.6, y: -60 }), 14, 0.45, '#05020a');
  const k = ease.out(prog(t, 0.1, 0.9));
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(290, 320) * (1 + 0.04 * t), { outfit: ISTRI_LUTH, expr: 'smirk', look: [0.4, 0], rimColor: RED, rimSide: 1 });
  veil(g, '#000', 0.6 * (1 - k));
} });
// m04 — "Diam-diam, ia memihak kaum yang durhaka."  at the window, watching the city
registerShot('m04', { draw(g, t, info) {
  const cam = { z: 1.15, x: 15 * t };
  const { GY, CX } = city(g, t, cam, { mood: 'pharaoh' }); veil(g, '#1a0006', 0.3);
  layer(g, cam, 1, (g) => mob(g, t, CX - V(120, 100), V(120, 100), GY + 60, V(1.2, 1.25), 5, { facing: -1, expr: () => 'smirk', torches: false }));
  // foreground: the wife at a window frame, back to us
  g.fillStyle = '#0a0608'; g.fillRect(0, 0, E.W, E.H * 0.08); g.fillRect(0, 0, E.W * 0.08, E.H); g.fillRect(E.W * 0.92, 0, E.W * 0.08, E.H);
  person(g, { x: E.W * 0.26, y: E.H * 1.05, s: V(2.6, 2.8), facing: 1, outfit: ISTRI_LUTH, pose: breathe({ ...POSES.talk, hF: [30, -200] }, t), expr: 'smirk', rim: { color: RED, dir: [1, -0.3], w: 6 } });
  FX.rings(g, E.W * 0.4, E.H * 0.5, t, { count: 2, r0: 20, r1: 160, speed: 1.4, color: '#ffb0a0', a: 0.35 });
} });
// m05 — "Suatu sore, datang beberapa pemuda ke rumah Nabi Luth."
registerShot('m05', { draw(g, t, info) {
  const cam = { z: 1.05, x: t * 30 };
  const { GY, CX } = house(g, t, cam, { mood: 'dusk' });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) tamu(g, { x: CX - V(560, 460) + t * 80 + i * V(130, 110), y: GY + 60 + (i % 2) * 10, s: V(1.35, 1.4), facing: 1, pose: walkPose(t * 4.5 + i) }, 0.7); person(g, { x: CX + V(130, 110), y: GY + 40, s: V(1.35, 1.4), facing: -1, outfit: LUTH, pose: breathe(POSES.wave, t), expr: 'smile', rim: { color: '#ffc890', dir: [0, -1], w: 4 } }); });
} });
// m06 — "Wajah mereka sangat tampan."
registerShot('m06', { draw(g, t, info) {
  const cam = { z: 1.25 + 0.05 * t };
  const { GY, CX } = house(g, t, cam, { mood: 'dusk' });
  veil(g, '#000', 0.25);
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) tamu(g, { x: CX - V(260, 220) + i * V(260, 220), y: GY + 70, s: V(1.6, 1.65), facing: 1, pose: breathe(POSES.stand, t, 1, i) }, 1.0); });
  for (let i = 0; i < 10; i++) FX.sparkle(g, E.W * (0.1 + i * 0.09), E.H * 0.35 + Math.sin(i * 2 + t) * 80, 16, '#ffffff', 0.7 * Math.abs(Math.sin(t * 3 + i)));
} });
// m07 — "Tapi Nabi Luth justru gelisah. Dadanya sesak."
registerShot('m07', { draw(g, t, info) {
  blurBg(g, (g) => house(g, t, { z: 1.5, y: -60 }, { mood: 'dusk' }), 14, 0.4);
  const [qx, qy] = shake(t, 1.5 + Math.max(0, Math.sin(t * 7)) * 3, 10);
  bigPerson(g, E.W / 2 + qx, E.H * V(0.6, 0.56) + qy, V(300, 330), { outfit: LUTH, expr: t < 2 ? 'worried' : 'scared', look: [-0.4, 0.2], rimColor: '#ffc890', rimSide: -1 });
  const beat = Math.max(0, Math.sin(t * 7)); glow(g, E.W / 2, E.H * 0.85, 300 * beat, '#ff4a3a', 0.25);
} });
// m08 — "Ini hari yang sangat sulit," katanya.
registerShot('m08', { draw(g, t, info) {
  const cam = { z: 1.12 };
  const { GY, CX, dx } = room(g, t, cam, {});
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(60, 40), y: GY + 40, s: V(1.7, 1.8), facing: 1, outfit: LUTH, pose: breathe({ ...POSES.sad, eF: [22, -140], hF: [8, -150] }, t), expr: 'sad', talk: Math.max(0, 0.3 * Math.sin(t * 10)), rim: { color: '#ffc890', dir: [-1, -0.4], w: 5 } }); for (let i = 0; i < 2; i++) tamu(g, { x: CX - V(420, 360) - i * 120, y: GY + 30, s: V(1.4, 1.45), facing: 1, pose: breathe(POSES.stand, t, 1, i) }, 0.6); });
} });
// m09 — "Karena beliau tahu… apa yang akan dilakukan kaumnya."
registerShot('m09', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'pharaoh' }); veil(g, '#100004', 0.45);
  layer(g, cam, 0.7, (g) => { for (let i = 0; i < 12; i++) { const x = CX - V(600, 480) + i * V(110, 85), y = GY - 20 + (i % 3) * 20; person(g, { x, y, s: 0.8, facing: 1, outfit: { top: 'dress', color: '#0a0406' }, pose: POSES.stand, expr: 'smirk', dim: true }); glow(g, x + 6, y - 165, 16, RED, 0.8 * Math.abs(Math.sin(t * 2 + i))); } });
} });
// m10 — "Dan benar saja. Istrinya membocorkan kabar itu."
registerShot('m10', { draw(g, t, info) {
  const cam = { z: 1.15, x: -20 * t };
  const { GY, CX } = house(g, t, cam);
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(200, 170), y: GY + 60, s: V(1.45, 1.5), facing: 1, outfit: ISTRI_LUTH, pose: breathe(POSES.talk, t), expr: 'smirk', talk: Math.max(0, 0.4 * Math.sin(t * 12)), rim: { color: RED, dir: [1, -0.3], w: 4 } }); mob(g, t, CX + V(60, 50), V(140, 120), GY + 66, V(1.4, 1.45), 3, { facing: -1, expr: () => 'smirk', pose: () => POSES.crossArms, torches: false }); });
  FX.rings(g, E.W / 2 - V(140, 120), E.H * 0.42, t, { count: 2, r0: 20, r1: 160, speed: 1.4, color: '#ffb0a0', a: 0.35 });
} });
// m11 — "Tak lama… terdengar langkah kaki."  feet close-up
registerShot('m11', { draw(g, t, info) {
  const cam = { z: 1.0 };
  const GY = E.H * 0.85; g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0408', '#1a0a0a', '#2a1410']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.fillStyle = '#3a2418'; g.fillRect(-E.W, GY, E.W * 3, E.H);
  for (let i = 0; i < 4; i++) { const x = E.W * (1.3 - ((t * 0.25 + i * 0.45) % 1.8)), step = Math.sin(t * 8 + i * 2); person(g, { x, y: GY + 20, s: 9, facing: -1, outfit: KAUM[i], pose: walkPose(t * 7 + i), expr: 'angry', shadow: false }); if (step > 0.9) for (let k = 0; k < 4; k++) circle(g, x - 60 + k * 30, GY - 10 - k * 6, 8, alpha('#8a6a4a', 0.6)); }
  const [qx, qy] = shake(t, 3, 20); g.translate(qx, qy);
} });
// m12 — "Semakin banyak. Semakin dekat."  torches multiply and approach
registerShot('m12', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.2 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'night' }); veil(g, '#000', 0.35);
  layer(g, cam, 0.8 + 0.2 * k, (g) => { const n = 6 + Math.floor(k * 12); for (let i = 0; i < n; i++) { const x = CX - V(700, 520) + (i % 9) * V(170, 130), y = GY + Math.floor(i / 9) * 60; seg(g, [[x, y - 60], [x, y - 140]], 6, '#2a1a10'); flame(g, x, y - 142, 0.3, t, i); } });
} });
// m13 — "Rumah Nabi Luth dikepung!"
registerShot('m13', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.04 * t };
  const { GY, CX } = house(g, t, cam); veil(g, '#200000', 0.25);
  layer(g, cam, 1, (g) => { mob(g, t, CX - V(640, 520), V(110, 90), GY + 90, V(1.15, 1.2), 6, { facing: 1, expr: () => 'angry', talk: true }); mob(g, t, CX + V(100, 90), V(110, 90), GY + 90, V(1.15, 1.2), 6, { facing: -1, expr: () => 'angry', talk: true }); });
  const [qx, qy] = shake(t, 2, 15); g.translate(qx, qy);
} });
// m14 — "Wahai kaumku, takutlah kepada Allah!"
registerShot('m14', { draw(g, t, info) {
  const cam = { z: 1.15 };
  const { GY, CX } = house(g, t, cam); veil(g, '#200000', 0.2);
  layer(g, cam, 1, (g) => { person(g, { x: CX, y: GY + 20, s: V(1.6, 1.65), facing: -1, outfit: LUTH, pose: breathe({ ...POSES.cheer, eF: [26, -160], hF: [52, -150], eB: [-20, -160], hB: [-46, -150] }, t), expr: 'determined', face: { brows: null }, talk: Math.max(0, 0.45 * Math.sin(t * 12)), rim: { color: '#ffc890', dir: [0, -1], w: 5 } }); mob(g, t, CX - V(640, 540), V(130, 110), GY + 110, V(1.3, 1.35), 4, { facing: 1, expr: () => 'angry' }); });
} });
// m15 — "Jangan permalukan aku di depan tamuku!"
registerShot('m15', { draw(g, t, info) {
  blurBg(g, (g) => house(g, t, { z: 1.5, y: -60 }), 14, 0.35, '#1a0000');
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: LUTH, expr: 'worried', talk: Math.max(0, 0.45 * Math.sin(t * 12)), rimColor: '#ffc890', rimSide: -1 });
} });
// m16 — "Tidak adakah satu pun orang berakal di antara kalian?"  pan across faces
registerShot('m16', { draw(g, t, info) {
  const cam = { z: 1.3, x: -V(500, 400) + t * V(320, 260) };
  const { GY, CX } = house(g, t, cam); veil(g, '#200000', 0.3);
  layer(g, cam, 1, (g) => mob(g, t, CX - V(800, 600), V(150, 120), GY + 110, V(1.5, 1.55), 12, { facing: -1, expr: (i) => (i % 2 ? 'smirk' : 'angry') }));
} });
// m17 — "Mereka tidak peduli. Pintu terus didesak."
registerShot('m17', { draw(g, t, info) {
  const cam = { z: 1.15 };
  const { GY, CX, dx } = room(g, t, cam, { push: 1 + Math.sin(t * 9), light: 0.6 + 0.4 * Math.sin(t * 5) });
  layer(g, cam, 1, (g) => person(g, { x: dx - V(200, 170), y: GY + 40, s: V(1.6, 1.65), facing: 1, outfit: LUTH, pose: breathe({ ...POSES.reach, hF: [70, -160] }, t), expr: 'scared', rim: { color: '#ff8a4a', dir: [1, -0.3], w: 5 } }));
  const [qx, qy] = shake(t, 4, 30); g.translate(qx, qy);
} });
// m18 — "Nabi Luth berbisik pilu…"
registerShot('m18', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.08 * k };
  const { GY, CX, dx } = room(g, t, cam, { push: 0.6, light: 0.5 });
  veil(g, '#000010', 0.25);
  layer(g, cam, 1, (g) => person(g, { x: dx - V(150, 130), y: GY + 40, s: V(1.6, 1.65), facing: -1, outfit: LUTH, pose: breathe({ ...POSES.sit, head: [10, -168] }, t), expr: 'sad', rim: { color: '#ffc890', dir: [-1, -0.4], w: 5 } }));
} });
// m19 — "Andai aku punya kekuatan… atau tempat berlindung yang kuat…"
registerShot('m19', { draw(g, t, info) {
  blurBg(g, (g) => room(g, t, { z: 1.6, y: -60 }, { light: 0.5 }), 14, 0.45, '#050208');
  const r = V(300, 330), cx = E.W / 2, cy = E.H * V(0.6, 0.56);
  bigPerson(g, cx, cy, r * (1 + 0.03 * t), { outfit: LUTH, expr: 'cry', talk: Math.max(0, 0.25 * Math.sin(t * 9)), rimColor: '#ffc890', rimSide: -1 });
} });
// m20 — "Saat itulah para tamu berkata,"  the guests start to glow
registerShot('m20', { draw(g, t, info) {
  const cam = { z: 1.1 }, k = ease.inOut(t / info.dur);
  const { GY, CX, dx } = room(g, t, cam, { push: 0.4, light: 0.5 });
  layer(g, cam, 1, (g) => { person(g, { x: dx - V(150, 130), y: GY + 40, s: V(1.5, 1.55), facing: -1, outfit: LUTH, pose: breathe({ ...POSES.sit, head: [10, -168] }, t), expr: 'surprised', look: [-1, -0.3], rim: { color: HOLY, dir: [-1, -0.3], w: 5 } }); for (let i = 0; i < 3; i++) tamu(g, { x: CX - V(380, 330) + i * V(150, 130), y: GY + 30, s: V(1.45, 1.5), facing: 1, pose: breathe(POSES.stand, t, 1, i) }, 0.6 + 0.6 * k); });
  glow(g, E.W * 0.3, E.H * 0.5, V(600, 600) * k, HOLY, 0.3);
} });
// m21 — "Wahai Luth… kami adalah utusan Tuhanmu."
registerShot('m21', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.05 * t };
  const { GY, CX } = room(g, t, cam, {});
  FX.godRays(g, CX - V(200, 160), GY - 250, { count: 16, angle: 0, spread: Math.PI * 2, len: E.H, color: HOLY, a: 0.12, t });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) tamu(g, { x: CX - V(360, 300) + i * V(150, 130), y: GY + 30, s: V(1.5, 1.55), facing: 1, pose: breathe(i === 1 ? POSES.explain : POSES.stand, t, 1, i) }, 1.3); person(g, { x: CX + V(260, 220), y: GY + 40, s: V(1.5, 1.55), facing: -1, outfit: LUTH, pose: breathe(POSES.kneel, t), expr: 'awe', look: [-1, -0.4], rim: { color: HOLY, dir: [-1, -0.3], w: 5 } }); });
  FX.rings(g, E.W * 0.38, E.H * 0.45, t, { count: 3, r0: 40, r1: 300, speed: 1, color: HOLY, a: 0.4 });
} });
// m22 — "Ternyata mereka… malaikat."
registerShot('m22', { draw(g, t, info) {
  const k = ease.out(prog(t, wt('malaikat.', 72, info) - 0.3, wt('malaikat.', 72, info) + 0.3));
  g.fillStyle = '#0a0604'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, E.H * 0.5, { count: 22, angle: 0, spread: Math.PI * 2, len: E.H * 1.2, color: HOLY, a: 0.1 + 0.15 * k, t });
  for (let i = 0; i < 3; i++) tamu(g, { x: E.W * (0.25 + i * 0.25), y: E.H * V(0.72, 0.66), s: V(1.8, 1.9), facing: 1, pose: POSES.stand }, 1.5 + k);
  veil(g, '#fffbe8', 0.55 * k, 'lighter');
  big(g, 'MALAIKAT', E.H * V(0.2, 0.22), GOLD(), k, V(130, 140));
} });
// m23 — "Seketika, mata para pengepung itu dibutakan."
registerShot('m23', { draw(g, t, info) {
  const flash = 1 - prog(t, 0, 0.8), blind = ease.out(prog(t, wt('dibutakan.', 76, info) - 0.4, wt('dibutakan.', 76, info) + 0.3));
  blurBg(g, (g) => house(g, t, { z: 1.5 }), 12, 0.4, '#05020a');
  const r = V(220, 240);
  for (let i = 0; i < 2; i++) { const cx = E.W * (i ? 0.68 : 0.32), cy = E.H * V(0.55, i ? 0.7 : 0.33); bigPerson(g, cx, cy, r, { outfit: KAUM[i], expr: blind > 0.5 ? 'scared' : 'angry', rimColor: '#ffffff', rimSide: i ? 1 : -1 }); if (blind > 0) blindEyes(g, cx, cy, r, 0); }
  veil(g, '#ffffff', 0.8 * flash, 'lighter');
} });
// m24 — "Mereka meraba-raba dalam gelap."
registerShot('m24', { draw(g, t, info) {
  const cam = { z: 1.1 };
  const { GY, CX } = house(g, t, cam); veil(g, '#000', 0.55);
  layer(g, cam, 1, (g) => { for (let i = 0; i < 6; i++) { const x = CX - V(560, 460) + i * V(220, 180) + Math.sin(t * 1.5 + i) * 40; person(g, { x, y: GY + 90 + (i % 2) * 14, s: V(1.3, 1.35), facing: i % 2 ? -1 : 1, outfit: KAUM[i], pose: breathe({ ...POSES.reach, hF: [70, -150 + Math.sin(t * 3 + i) * 20] }, t, 2, i), expr: 'scared', look: [0, 0], rim: { color: '#6a6a8a', dir: [0, -1], w: 3 } }); } });
  for (let i = 0; i < 3; i++) { const x = E.W * (0.2 + i * 0.3); seg(g, [[x - 40, E.H * 0.8], [x + 40, E.H * 0.82]], 7, '#2a1a10'); glow(g, x + 40, E.H * 0.82, 30, '#ff6a2a', 0.3); }
} });
// m25 — "Tapi itu… baru permulaan."
registerShot('m25', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.12 * k };
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#05020a', '#200610', '#3a0a10']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  city(g, t, cam, { mood: 'pharaoh' }); veil(g, '#100004', 0.35);
  FX.lightning(g, { x1: E.W * 0.6, y1: 0, x2: E.W * 0.45, y2: E.H * 0.4, seed: Math.floor(t * 2) + 3 });
  text(g, 'BERSAMBUNG KE PART 3', E.W / 2, E.H * V(0.86, 0.86), { size: V(56, 58), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', spacing: 3, alpha: ease.out(prog(t, 1.2, 1.8)) });
} });
