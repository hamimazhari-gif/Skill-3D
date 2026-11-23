// shots/idris1.js — Kisah Nabi Idris, Part 1 (d01–d17).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, ring, rr, text, FONTS, wordTime, linGrad, poly, rng, backdrop } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert } from '../sets/desert.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, flame, GOLD } from '../lib/_costume.js';
import { IDRIS, ADAM, NUH, PURBA, MURID } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', INK = '#2a1a3a';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const SIT_WRITE = { ...POSES.sit, eF: [30, -110], hF: [56, -96], eB: [22, -112], hB: [44, -98], head: [12, -174] };

// cave with a campfire
function cave(g, t, cam, o = {}) {
  const M = mood('night'), GY = E.H * V(0.8, 0.7), CX = E.W / 2;
  layer(g, cam, 0.2, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 120, area: [0, 0, E.W, GY * 0.6] }); });
  layer(g, cam, 0.5, (g) => { g.fillStyle = '#1a1210'; g.beginPath(); g.moveTo(-E.W, -E.H); g.lineTo(E.W * 2, -E.H); g.lineTo(E.W * 2, GY); g.lineTo(CX + V(600, 420), GY); g.quadraticCurveTo(CX + V(560, 400), GY - V(700, 900), CX, GY - V(780, 1000)); g.quadraticCurveTo(CX - V(560, 400), GY - V(700, 900), CX - V(600, 420), GY); g.lineTo(-E.W, GY); g.closePath(); g.fill(); const r = rng(3); for (let i = 0; i < 30; i++) { g.fillStyle = alpha('#3a2a20', 0.5); g.beginPath(); g.ellipse(r() * E.W, r() * GY, 40 + r() * 80, 20 + r() * 40, r() * 3, 0, Math.PI * 2); g.fill(); } });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, ['#2a1c14', '#0a0604']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); });
  const fx = CX + (o.fireX ?? 0); layer(g, cam, 0.95, (g) => { for (let i = 0; i < 5; i++) seg(g, [[fx - 40 + i * 20, GY + 26], [fx - 10 + i * 5, GY + 4]], 7, '#2a1a10'); flame(g, fx, GY + 22, 0.6, t, 3); FX.pool(g, fx, GY + 40, 520, 80, '#ffa040', 0.35); glow(g, fx, GY - 100, 600, '#ff9a3a', 0.25); });
  return { GY, CX, M, fx };
}
// a reed pen & scroll
function scroll(g, x, y, w, k, t) {
  g.fillStyle = '#e8dcb8'; g.fillRect(x - w / 2, y - 18, w, 36 + 0); rr(g, x - w / 2 - 14, y - 26, 28, 52, 12); g.fillStyle = '#b8a070'; g.fill(); rr(g, x + w / 2 - 14, y - 26, 28, 52, 12); g.fill();
  g.fillStyle = '#e8dcb8'; g.fillRect(x - w / 2, y - 18, w, 36);
}
function writingLines(g, x0, y0, w, rows, k, t) { for (let r = 0; r < rows; r++) { const len = clamp(k * rows - r) * w; if (len <= 0) continue; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= len; i += 8) g.lineTo(x0 + i, y0 + r * 40 + Math.sin(i * 0.25 + r) * 5 + (i % 32 < 6 ? -8 : 0)); g.stroke(); } }

// d01 — "Sebelum ada buku…"
registerShot('d01', { draw(g, t, info) {
  g.fillStyle = '#05040a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const a = 1 - ease.in(prog(t, 0.4, info.dur));
  g.save(); g.globalAlpha = a; g.translate(E.W / 2, E.H * 0.48); poly(g, [[-260, -150], [0, -120], [0, 170], [-260, 140]], '#c8b890'); poly(g, [[260, -150], [0, -120], [0, 170], [260, 140]], '#d8c8a0'); for (let i = 0; i < 6; i++) { seg(g, [[-230, -100 + i * 40], [-30, -80 + i * 40]], 4, '#8a7a5a'); seg(g, [[30, -80 + i * 40], [230, -100 + i * 40]], 4, '#8a7a5a'); } g.restore();
  for (let i = 0; i < 30; i++) circle(g, E.W / 2 + Math.sin(i * 3) * 300 * (1 - a), E.H * 0.48 + Math.cos(i * 2) * 200 * (1 - a) - (1 - a) * 200, 4, alpha('#d8c8a0', 1 - a));
  big(g, 'SEBELUM ADA BUKU…', E.H * V(0.8, 0.78), '#ffffff', ease.out(prog(t, 0.1, 0.5)), V(70, 72));
} });
// d02 — "sebelum ada tulisan…"
registerShot('d02', { draw(g, t, info) {
  g.fillStyle = '#05040a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const r = rng(5), a = ease.in(prog(t, 0.3, info.dur));
  for (let i = 0; i < 40; i++) { const x = E.W * (0.15 + r() * 0.7), y = E.H * (0.3 + r() * 0.35) - a * 300 * r(); g.save(); g.globalAlpha = 1 - a; g.translate(x, y); g.rotate(a * 3 * (r() - 0.5)); seg(g, [[0, 0], [20 + r() * 20, -20 + r() * 40]], 5, '#c8b890'); if (r() > 0.5) circle(g, 10, 10, 8, '#c8b890'); g.restore(); }
  big(g, 'SEBELUM ADA TULISAN…', E.H * V(0.8, 0.78), '#ffffff', ease.out(prog(t, 0.1, 0.5)), V(70, 72));
} });
// d03 — "manusia hanya mengandalkan ingatan."  people in skins around a fire
registerShot('d03', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k };
  const { GY, CX } = cave(g, t, cam, {});
  const rim = { color: '#ffa040', dir: [0, 1], w: 4 };
  layer(g, cam, 1, (g) => { PURBA.forEach((of, i) => person(g, { x: CX + (i < 2 ? -1 : 1) * V(200 + (i % 2) * 150, 170 + (i % 2) * 120), y: GY + 40 + (i % 2) * 20, s: V(1.4, 1.45), facing: i < 2 ? 1 : -1, outfit: of, pose: breathe(i === 0 ? { ...POSES.think, hF: [20, -200] } : POSES.crouch, t, 1, i), expr: i === 0 ? 'thinking' : 'neutral', rim })); });
  const a = ease.out(prog(t, wt('ingatan.', 5, info) - 0.2, wt('ingatan.', 5, info) + 0.4)); if (a > 0) { const bx = CX - V(200, 170), by = GY - V(330, 370); g.save(); g.translate(bx, by); g.scale(a, a); circle(g, 0, 0, 70, alpha('#ffffff', 0.85)); for (let i = 0; i < 3; i++) circle(g, -20 + i * 20, 0, 8, '#555'); g.restore(); }
} });
// d04 — "Lalu lahirlah seorang lelaki yang mengubah segalanya."
registerShot('d04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 - 0.08 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: 0, wind: false });
  FX.godRays(g, E.W / 2, GY - V(330, 520), { count: 12, angle: Math.PI / 2, spread: 2.6, len: E.H, color: '#ffe6b0', a: 0.1, t });
  layer(g, cam, 1, (g) => { g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(CX, GY + 60, 220, 70, 0, Math.PI, Math.PI * 2); g.fill(); person(g, { x: CX, y: GY + 10, s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe(POSES.stand, t), expr: 'smile', look: [0.3, -0.3], rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
} });
// d05 — "Namanya… Idris."
registerShot('d05', { draw(g, t, info) {
  blurBg(g, (g) => desert(g, t, { z: 1.3 }, { mood: 'golden', sunX: 0, wind: false }), 12, 0.45, '#0a0604');
  const a = ease.outBack(prog(t, wt('Idris.', 13, info) - 0.2, wt('Idris.', 13, info) + 0.3));
  big(g, 'IDRIS', E.H * 0.44, GOLD(), a, V(190, 200));
  text(g, 'KISAH NABI IDRIS • PART 1', E.W / 2, E.H * 0.44 + V(140, 150), { size: V(44, 48), color: '#ffffff', font: FONTS.title, stroke: 8, strokeColor: '#000', spacing: 4, alpha: ease.out(prog(t, 1.6, 2.2)) });
} });
// d06 — "Ia keturunan Nabi Adam AS. Dan kelak… menjadi kakek buyut Nabi Nuh AS."  lineage
registerShot('d06', { draw(g, t, info) {
  UI.blueprint(g, {}); const ui = S().ui, bp = ui.blueprint;
  const ys = V([0.3, 0.55, 0.8], [0.26, 0.55, 0.84]).map((k) => E.H * k), x = E.W / 2;
  const a0 = ease.out(prog(t, 0.2, 0.7)), a1 = ease.out(prog(t, 0, 0.4)), a2 = ease.out(prog(t, wt('Nuh', 21, info) - 0.4, wt('Nuh', 21, info) + 0.2));
  const node = (of, y, label, a, hi) => { if (a <= 0) return; person(g, { x, y, s: V(0.95, 1.05), facing: 1, outfit: of, pose: breathe(POSES.stand, t, 1, y), expr: 'smile', alpha: a, rim: { color: hi ? GOLD() : bp, dir: [0, -1], w: 4 } }); text(g, label, x + V(170, 200), y - 100, { size: V(46, 50), color: hi ? ui.gold : ui.cream, font: FONTS.title, alpha: a, align: 'left' }); };
  node(ADAM, ys[0], 'NABI ADAM', a0); node(IDRIS, ys[1], 'NABI IDRIS', a1, true); node(NUH, ys[2], 'NABI NUH', a2);
  g.setLineDash([14, 12]); if (a0 > 0) seg(g, [[x, ys[0] + 30], [x, ys[1] - V(230, 260)]], 5, alpha(bp, a0)); if (a2 > 0) seg(g, [[x, ys[1] + 30], [x, ys[2] - V(230, 260)]], 5, alpha(bp, a2)); g.setLineDash([]);
  if (a0 > 0) text(g, 'KETURUNAN', x - V(170, 200), (ys[0] + ys[1]) / 2 - 80, { size: V(34, 38), color: ui.gold, font: FONTS.title, alpha: a0, align: 'right' });
  if (a2 > 0) text(g, 'KAKEK BUYUT', x - V(170, 200), (ys[1] + ys[2]) / 2 - 80, { size: V(34, 38), color: ui.gold, font: FONTS.title, alpha: a2, align: 'right' });
} });
// d07 — "Dikisahkan, Nabi Idris adalah manusia pertama yang menulis dengan pena."
registerShot('d07', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.08 * k };
  const { GY, CX } = cave(g, t, cam, { fireX: V(380, 300) });
  layer(g, cam, 1, (g) => { const x = CX - V(140, 120), s = V(1.7, 1.8); person(g, { x, y: GY + 40, s, facing: 1, outfit: IDRIS, pose: breathe(SIT_WRITE, t, 0.6), expr: 'thinking', look: [0.6, 0.8], rim: { color: '#ffa040', dir: [1, -0.3], w: 5 } }); scroll(g, x + 120 * s, GY + 40 - 80 * s, 220, 1, t); writingLines(g, x + 120 * s - 100, GY + 40 - 80 * s - 8, 200, 1, k, t); });
} });
// d08 — "pertama yang menulis dengan pena."  insert: the pen writes
registerShot('d08', { draw(g, t, info) {
  blurBg(g, (g) => cave(g, t, { z: 1.6, y: 100 }, {}), 14, 0.4, '#0a0604');
  const k = ease.inOut(t / info.dur);
  rr(g, E.W * 0.1, E.H * 0.35, E.W * 0.8, E.H * 0.32, 20); g.fillStyle = '#e8dcb8'; g.fill();
  writingLines(g, E.W * 0.15, E.H * 0.42, E.W * 0.7, 5, k, t);
  const row = Math.min(4, Math.floor(k * 5)), px = E.W * 0.15 + clamp(k * 5 - row) * E.W * 0.7, py = E.H * 0.42 + row * 40;
  seg(g, [[px, py], [px + 160, py - 260]], 16, '#8a6a3a'); poly(g, [[px - 6, py + 4], [px + 10, py - 20], [px + 4, py - 24]], '#2a1a10'); seg(g, [[px + 160, py - 260], [px + 320, py - 420]], 50, S().ink);
  FX.sparkle(g, px, py, 30, GOLD(), 0.9);
} });
// d09 — "Ia juga yang pertama menjahit pakaian dari kain."
registerShot('d09', { draw(g, t, info) {
  blurBg(g, (g) => cave(g, t, { z: 1.6, y: 80 }, {}), 14, 0.4, '#0a0604');
  const k = t / info.dur;
  rr(g, E.W * 0.12, E.H * 0.38, E.W * 0.38, E.H * 0.26, 10); g.fillStyle = '#d8cfb8'; g.fill(); rr(g, E.W * 0.5, E.H * 0.38, E.W * 0.38, E.H * 0.26, 10); g.fillStyle = '#c8bfa8'; g.fill();
  const n = Math.floor(k * 14); for (let i = 0; i < n; i++) { const y = E.H * 0.4 + i * E.H * 0.017; seg(g, [[E.W * 0.47, y], [E.W * 0.53, y + 10]], 6, '#6a4ad6'); }
  const ny = E.H * 0.4 + n * E.H * 0.017, nx = E.W / 2 + Math.sin(t * 10) * 40;
  seg(g, [[nx - 10, ny + 40], [nx + 30, ny - 120]], 6, '#d8d8e0'); ring(g, nx + 28, ny - 112, 6, 2, '#d8d8e0'); seg(g, [[nx + 28, ny - 112], [nx + 120, ny - 220], [E.W * 0.53, ny]], 3, '#6a4ad6');
  big(g, 'PAKAIAN DARI KAIN', E.H * V(0.82, 0.8), GOLD(), ease.out(prog(t, 0.6, 1.1)), V(70, 72));
} });
// d10 — "Sebelumnya, manusia hanya berbalut kulit hewan."
registerShot('d10', { draw(g, t, info) {
  const cam = { z: 1.12 }, k = ease.inOut(prog(t, 1.4, 2.4));
  const { GY, CX } = cave(g, t, cam, { fireX: V(-420, -360) });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) { const x = CX - V(240, 200) + i * V(240, 200), o = { x, y: GY + 40, s: V(1.55, 1.6), facing: 1, pose: breathe(POSES.stand, t, 1, i), expr: k > 0.5 ? 'happy' : 'neutral', rim: { color: '#ffa040', dir: [-1, -0.3], w: 4 } }; person(g, { ...o, outfit: PURBA[i], alpha: 1 - k }); if (k > 0) person(g, { ...o, outfit: { top: 'dress', color: ['#d8cfb8', '#c8b898', '#d0c4a8'][i], head: 'curly' }, alpha: k }); } });
} });
// d11 — "Ia mempelajari bintang-bintang…"  constellations
registerShot('d11', { draw(g, t, info) {
  const W = E.W, H = E.H; g.fillStyle = linGrad(g, 0, 0, 0, H, ['#02030e', '#0a1240', '#1a1a50']); g.fillRect(-W, -H, W * 3, H * 3);
  FX.stars(g, t, { count: 220, area: [0, 0, W, H * 0.75] });
  const pts = [[0.2, 0.2], [0.32, 0.3], [0.45, 0.22], [0.58, 0.32], [0.72, 0.25], [0.6, 0.45], [0.42, 0.48]].map(([x, y]) => [x * W, y * H]);
  const k = ease.inOut(prog(t, 0.2, info.dur)); for (let i = 0; i < pts.length - 1; i++) { const u = clamp(k * (pts.length - 1) - i); if (u > 0) seg(g, [pts[i], [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]], 3, alpha('#9ab8ff', 0.8)); }
  pts.forEach(([x, y]) => { glow(g, x, y, 40, '#fff4c0', 0.6); FX.sparkle(g, x, y, 22, '#fffbe8', 1); });
  g.fillStyle = '#0a0a14'; g.fillRect(-W, H * 0.82, W * 3, H);
  person(g, { x: W * 0.3, y: H * 0.84, s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe(POSES.pointUp, t), expr: 'awe', look: [0.4, -1], rim: { color: '#9ab8ff', dir: [0, -1], w: 5 } });
} });
// d12 — "perhitungan… dan ilmu pengetahuan."  blueprint calculations
registerShot('d12', { draw(g, t, info) {
  UI.blueprint(g, {}); const ui = S().ui, bp = ui.blueprint, k = ease.inOut(prog(t, 0.1, info.dur)), cx = E.W / 2, cy = E.H * 0.42;
  g.strokeStyle = bp; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, V(260, 300), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = V(260, 300); if (i / 12 < k) seg(g, [[cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 4, bp); }
  seg(g, [[cx, cy], [cx + Math.cos(t) * V(240, 280), cy + Math.sin(t) * V(240, 280)]], 4, ui.gold); circle(g, cx, cy, 10, ui.gold);
  ['1', '2', '3', '7', '12', '30', '365'].forEach((n, i) => { const a = ease.outBack(prog(t, 0.3 + i * 0.25, 0.6 + i * 0.25)); if (a > 0) text(g, n, E.W * (0.15 + (i % 4) * 0.23), E.H * (0.75 + Math.floor(i / 4) * 0.08), { size: V(56, 60) * a, color: i % 2 ? ui.cream : ui.gold, font: FONTS.ui, weight: 900 }); });
} });
// d13 — "Karena itu, namanya dikaitkan dengan kata darasa… yang berarti belajar."
registerShot('d13', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0604', '#1a120a', '#0a0604']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  rr(g, E.W * 0.08, E.H * 0.3, E.W * 0.84, E.H * 0.36, 24); g.fillStyle = '#e8dcb8'; g.fill();
  const a1 = ease.outBack(prog(t, wt('darasa…', 46, info) - 0.3, wt('darasa…', 46, info) + 0.2)), a2 = ease.out(prog(t, wt('belajar.', 48, info) - 0.3, wt('belajar.', 48, info) + 0.3)), a0 = ease.out(prog(t, 0.2, 0.7));
  text(g, 'IDRIS', E.W / 2, E.H * 0.38, { size: V(80, 84), color: '#6a4ad6', font: FONTS.title, alpha: a0 });
  if (a1 > 0) text(g, '"DARASA"', E.W / 2, E.H * 0.48, { size: V(110, 116) * a1, color: '#2a1a10', font: FONTS.title });
  if (a2 > 0) text(g, '= BELAJAR', E.W / 2, E.H * 0.585, { size: V(80, 84), color: '#a8321e', font: FONTS.title, alpha: a2 });
} });
// d14 — "Ia dikenal sebagai orang yang sangat tekun belajar dan mengajar."
registerShot('d14', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k };
  const { GY, CX } = cave(g, t, cam, { fireX: V(0, 0) });
  const rim = { color: '#ffa040', dir: [0, 1], w: 4 };
  layer(g, cam, 1, (g) => { person(g, { x: CX + V(330, 280), y: GY + 30, s: V(1.6, 1.65), facing: -1, outfit: IDRIS, pose: breathe(posesAt(t, [[0, 'explain'], [1.6, 'pointUp'], [3, 'explain']]), t), expr: 'smile', talk: Math.max(0, 0.35 * Math.sin(t * 11)), rim }); MURID.forEach((of, i) => person(g, { x: CX - V(470, 400) + i * V(150, 125), y: GY + 60 + (i % 2) * 18, s: V(1.3, 1.35), facing: 1, outfit: of, pose: breathe(SIT_WRITE, t, 1, i), expr: 'thinking', look: [1, -0.2], rim })); });
} });
// d15 — "Tapi Allah memilihnya bukan hanya karena kecerdasannya…"
registerShot('d15', { draw(g, t, info) {
  blurBg(g, (g) => cave(g, t, { z: 1.5, y: -60 }, {}), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: IDRIS, expr: 'thinking', look: [0.4, -0.6], rimColor: '#ffc890', rimSide: -1 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.4, r = V(460, 480); text(g, ['✦', '7', '∞', '☆', '12', '✧'][i], E.W / 2 + Math.cos(a) * r, E.H * V(0.6, 0.56) + Math.sin(a) * r * 0.6, { size: 54, color: alpha('#ffe6b0', 0.7), font: FONTS.ui, weight: 900 }); }
} });
// d16 — "Allah mengangkatnya menjadi nabi."
registerShot('d16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'night', sunX: V(300, 200), wind: false });
  layer(g, cam, 1, (g) => { holyLight(g, t, [CX, GY - V(180, 220)], 0.5 + 0.5 * k); person(g, { x: CX, y: GY + 30, s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe({ ...POSES.kneel, head: [16, -160], sh: [8, -128] }, t, 0.6), expr: 'sleepy', rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
} });
// d17 — "Dan tugas yang menantinya… tidak mudah sama sekali."
registerShot('d17', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.08 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'night', sunX: V(2000, 2000) }); veil(g, '#0a0a20', 0.3);
  FX.lightning(g, { x1: E.W * 0.7, y1: 0, x2: E.W * 0.6, y2: E.H * 0.35, seed: Math.floor(t * 2) });
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(280, 240), y: GY + 40, s: V(1.4, 1.45), facing: 1, outfit: IDRIS, pose: breathe(POSES.stand, t), expr: 'determined', face: { brows: null }, rim: { color: '#bcd0ff', dir: [1, -0.4], w: 4 } }); for (let i = 0; i < 5; i++) person(g, { x: CX + V(60, 40) + i * V(110, 90), y: GY + 46 + (i % 2) * 12, s: V(1.25, 1.3), facing: i % 2 ? 1 : -1, outfit: { top: 'dress', color: '#1a1414', head: 'hood', headColor: '#3a2a2a' }, pose: breathe(i % 2 ? POSES.crossArms : POSES.stand, t, 1, i), expr: 'smirk', dim: true, rim: { color: '#ff5a3a', dir: [-1, -0.4], w: 3 } }); });
  text(g, 'BERSAMBUNG KE PART 2', E.W / 2, E.H * V(0.86, 0.88), { size: V(56, 58), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', spacing: 3, alpha: ease.out(prog(t, 2.0, 2.6)) });
} });
