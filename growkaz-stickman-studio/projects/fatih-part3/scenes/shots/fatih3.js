// shots/fatih3.js — Muhammad Al-Fatih, Part 3 (m01–m13).
import { E, V, S, registerShot, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, poly } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { waterSurface } from '../sets/sea.js';
import { GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { SUJUD } from '../lib3/_army.js';
import { skyline, walls, galley, personH, bigPersonH, shadeHex } from '../lib10/_konst.js';
import { FATIH, OTTO, ROMAN } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const RED = '#ff4a3a', OTRED = '#c8303a', HOLY = '#fff0c0';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const pop = (t, a) => ease.outBack(prog(t, a - 0.1, a + 0.3));
const PAL = {
  night: { sky: ['#03050f', '#141a38', '#2a2a4a'], sea: ['#0e1a30', '#040810'], city: '#0a0c18', wall: '#5a5868', ground: ['#141420', '#06060c'] },
  predawn: { sky: ['#0a1030', '#2a3a6a', '#6a6a9a'], sea: ['#1a2a4a', '#060c18'], city: '#10142a', wall: '#6a6a7a', ground: ['#1a1a28', '#08080e'] },
  dawn: { sky: ['#2a3a6a', '#c88aa0', '#ffd8b0'], sea: ['#4a6a8a', '#14243a'], city: '#2a2438', wall: '#a89088', ground: ['#4a3a3a', '#1a1214'] },
  golden: { sky: ['#5a3a6a', '#e88a50', '#f8c890'], sea: ['#3a5a7a', '#102030'], city: '#3a2430', wall: '#b89070', ground: ['#5a3a2a', '#1a100c'] },
};
const sky = (g, P, hy) => { g.fillStyle = linGrad(g, 0, 0, 0, hy, P.sky); g.fillRect(-E.W, -E.H, E.W * 3, hy + E.H); };
const ground = (g, P, hy) => { g.fillStyle = linGrad(g, 0, hy, 0, E.H, P.ground); g.fillRect(-E.W, hy, E.W * 3, E.H); };
const otto = (g, t, x, y, s, f, i, o = {}) => personH(g, { x, y, s, facing: f, outfit: o.of || OTTO[i % OTTO.length], pose: o.pose || (o.walk ? walkPose(t * (o.run ? 7 : 4) + i, { run: o.run }) : breathe(POSES.stand, t, 1, i)), expr: o.expr || 'neutral', spear: o.spear, rot: o.rot, rim: o.rim, dim: o.dim }, o.hat || 'turban');
const roman = (g, t, x, y, s, f, i, o = {}) => personH(g, { x, y, s, facing: f, outfit: ROMAN[i % ROMAN.length], pose: o.pose || breathe(POSES.stand, t, 1, i), expr: o.expr || 'neutral', spear: o.spear, rim: o.rim, dim: o.dim }, 'helmet');
const YEN = { top: 'dress', color: '#2a3a6a', head: 'none' };
function tent(g, x, y, s, c) { poly(g, [[x - 90 * s, y], [x, y - 120 * s], [x + 90 * s, y]], c); seg(g, [[x, y - 120 * s], [x, y - 160 * s]], 3 * s, '#2a1a10'); g.fillStyle = OTRED; g.fillRect(x, y - 160 * s, 30 * s, 18 * s); }
function flag(g, x, y, s, t, k = 1) { seg(g, [[x, y], [x, y - 260 * s]], 7 * s, '#3a2a1a'); g.fillStyle = OTRED; g.beginPath(); g.moveTo(x, y - 260 * s); for (let i = 0; i <= 10; i++) { const u = i / 10; g.lineTo(x + u * 170 * s * k, y - 260 * s + Math.sin(u * 5 - t * 8) * 10 * s * u); } for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(x + u * 170 * s * k, y - 160 * s + Math.sin(u * 5 - t * 8) * 10 * s * u); } g.fill(); if (k > 0.6) { circle(g, x + 75 * s, y - 210 * s, 26 * s, '#f4efe2'); circle(g, x + 85 * s, y - 210 * s, 21 * s, OTRED); } }
function arrows(g, t, n, a = 1) { for (let i = 0; i < n; i++) { const p = (t * 1.6 + i * 0.137) % 1, x = ((i * 211) % 1000) / 1000 * E.W * 1.2 - E.W * 0.1 + p * 300, y = -100 + p * E.H * 0.9; seg(g, [[x, y], [x - 40, y - 70]], 3, alpha('#2a1a10', a)); poly(g, [[x, y], [x - 6, y - 14], [x + 6, y - 10]], alpha('#2a1a10', a)); } }
function arrowTo(g, x0, y0, x1, y1, k, c) { const x = lerp(x0, x1, k), y = lerp(y0, y1, k), an = Math.atan2(y1 - y0, x1 - x0); seg(g, [[x0, y0], [x, y]], 18, c); poly(g, [[x + Math.cos(an) * 40, y + Math.sin(an) * 40], [x + Math.cos(an + 2.4) * 40, y + Math.sin(an + 2.4) * 40], [x + Math.cos(an - 2.4) * 40, y + Math.sin(an - 2.4) * 40]], c); }

// m01 — title
registerShot('m01', { draw(g, t, info) {
  const P = PAL.predawn, hy = E.H * 0.45; sky(g, P, hy); FX.stars(g, t, { count: 120, area: [0, 0, E.W, hy * 0.7] }); skyline(g, hy, 1, P.city); ground(g, P, hy); walls(g, hy + V(220, 300), 1, P.wall);
  veil(g, '#02030a', 0.4);
  UI.titleCard(g, t + 0.25, { lines: ['MUHAMMAD AL-FATIH', 'PART 3'], dur: info.dur + 0.5, y: E.H * 0.26 });
  const a = fadeIn(t, 0.8, 0.5) * (1 - prog(t, info.dur - 0.3, info.dur));
  text(g, 'FAJAR 29 MEI 1453', E.W / 2, E.H * 0.26 + V(130, 150), { size: V(56, 54), color: GOLD(), font: FONTS.title, glow: 22, glowColor: 'rgba(255,200,80,.6)', spacing: 3, alpha: a });
} });
// m02 — "Kini kota terkepung dari segala arah."  diagram
registerShot('m02', { draw(g, t, info) {
  g.fillStyle = '#16324a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const cx = E.W * 0.5, cy = E.H * 0.5; g.fillStyle = '#c8a878'; g.beginPath(); g.moveTo(-50, cy - 200); g.lineTo(cx + 260, cy - 180); g.quadraticCurveTo(cx + 380, cy, cx + 260, cy + 180); g.lineTo(-50, cy + 200); g.fill();
  g.fillStyle = '#a88858'; g.fillRect(-E.W, -E.H, E.W * 3, cy - 380 + E.H); g.fillRect(cx + 440, -E.H, E.W, E.H * 3);
  seg(g, [[cx - 120, cy - 200], [cx - 120, cy + 200]], 16, '#6a5040'); circle(g, cx + 80, cy, 60, '#8a6a4a'); text(g, 'KONSTANTINOPEL', cx + 60, cy + 120, { size: V(34, 36), color: '#2a1a0a', font: FONTS.title });
  const k = (d) => ease.out(prog(t, 0.2 + d, 0.9 + d));
  arrowTo(g, -40, cy, cx - 160, cy, k(0), OTRED); arrowTo(g, cx + 120, cy - 520, cx + 100, cy - 240, k(0.2), OTRED); arrowTo(g, cx + 120, cy + 560, cx + 100, cy + 240, k(0.4), OTRED); arrowTo(g, E.W + 40, cy, cx + 360, cy, k(0.3), OTRED);
  for (let i = 0; i < 3; i++) galley(g, cx + 60 + i * 90, cy - 300, 0.25, -1, t, '#2a1a10', OTRED);
  big(g, 'TERKEPUNG', E.H * V(0.12, 0.12), '#ffffff', pop(t, wt('terkepung', 4.9, info)), V(110, 116)); small(g, 'DARI SEGALA ARAH', E.H * V(0.88, 0.88), GOLD(), fadeIn(t, wt('segala', 5.7, info) - 0.1), V(58, 60));
} });
// m03 — "memerintahkan pasukannya berpuasa, berdoa, dan bersiap."
registerShot('m03', { draw(g, t, info) {
  const P = PAL.night, hy = E.H * 0.5; sky(g, P, hy); FX.stars(g, t, { count: 160, area: [0, 0, E.W, hy] }); FX.moon(g, E.W * 0.8, E.H * 0.25, V(34, 40)); ground(g, P, hy);
  tent(g, E.W * 0.15, hy + 80, V(0.9, 0.85), '#8a7a60'); tent(g, E.W * 0.85, hy + 90, V(0.9, 0.85), '#8a7a60');
  const ready = t > wt('bersiap.', 11.1, info) - 0.2, pray = t > wt('berdoa,', 10.2, info) - 0.2;
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) otto(g, t, E.W * (0.12 + i * 0.19) + r * 40, E.H * (0.75 + r * 0.12), V(1.0, 1.05) + r * 0.15, 1, i + r, { pose: ready ? breathe(POSES.ready, t, 1, i) : pray ? SUJUD : breathe({ ...POSES.sit, head: [12, -168] }, t, 1, i), spear: ready, rim: { color: '#ffb070', dir: [0, -1], w: 3 } });
  glow(g, E.W / 2, E.H * 0.82, 400, '#ffb070', 0.15);
  [['PUASA', 'berpuasa,', 9.5], ['DOA', 'berdoa,', 10.2], ['BERSIAP', 'bersiap.', 11.1]].forEach(([s, w, af], i) => small(g, s, E.H * V(0.1, 0.1) + i * V(70, 74), [HOLY, '#bfe0ff', GOLD()][i], fadeIn(t, wt(w, af, info) - 0.1), V(60, 62)));
} });
// m04 — "Lalu… di pagi buta 29 Mei 1453… serangan terakhir dimulai!"
registerShot('m04', { draw(g, t, info) {
  const go = wt('serangan', 17, info), [qx, qy] = t > go ? shake(t, 5, 20) : [0, 0]; g.translate(qx, qy);
  const P = PAL.predawn, hy = E.H * 0.42; sky(g, P, hy); skyline(g, hy, 0.8, P.city); ground(g, P, hy); walls(g, hy + V(180, 240), 0.9, P.wall);
  if (t > go) { for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) otto(g, t, -E.W * 0.3 + i * V(150, 130) + (t - go) * 300 + r * 60, E.H * (0.72 + r * 0.09), V(0.95, 1.0) + r * 0.12, 1, i + r, { walk: true, run: true, spear: true, expr: 'angry', rim: { color: '#bfd0ff', dir: [0, -1], w: 3 } }); }
  big(g, '29 MEI 1453', E.H * V(0.14, 0.14), GOLD(), pop(t, wt('dua', 14.2, info)), V(110, 116));
  big(g, 'SERANGAN TERAKHIR!', E.H * V(0.21, 0.21), RED, pop(t, go), V(74, 78));
} });
// m05 — waves 1 and 2 held back
registerShot('m05', { draw(g, t, info) {
  const P = PAL.predawn, hy = E.H * 0.3; sky(g, P, hy); ground(g, P, hy); walls(g, E.H * 0.66, 1.4, P.wall);
  const w2 = wt('Gelombang', 22, info), wave = t < w2 - 0.2 ? 1 : 2, tl = t - (wave === 1 ? 0 : w2 - 0.2), ph = clamp(tl / 2.2, 0, 1), fwd = ph < 0.55 ? ph / 0.55 : 1 - (ph - 0.55) / 0.45 * 0.7;
  arrows(g, t, 20, 0.7);
  for (let i = 0; i < 7; i++) otto(g, t, E.W * (0.05 + i * 0.15), lerp(E.H * 1.05, E.H * 0.78, fwd) + (i % 2) * 24, V(1.2, 1.25), 1, i + wave, { pose: ph < 0.55 ? walkPose(t * 7 + i, { run: true }) : POSES.fall, expr: ph < 0.55 ? 'angry' : 'scared', spear: ph < 0.55, rim: { color: '#bfd0ff', dir: [0, -1], w: 3 } });
  for (let i = 0; i < 5; i++) roman(g, t, E.W * (0.1 + i * 0.2), E.H * 0.66 - V(300, 390), V(0.8, 0.85), -1, i, { spear: true, expr: 'angry', dim: true });
  big(g, 'GELOMBANG ' + wave, E.H * V(0.1, 0.1), '#ffffff', 1, V(84, 88)); small(g, wave === 1 ? 'TERTAHAN' : 'MASIH TERTAHAN', E.H * V(0.16, 0.16), RED, fadeIn(t, wt('tertahan.', wave === 1 ? 20.5 : 23.4, info) - 0.1), V(58, 60));
} });
// m06 — "Lalu pasukan terbaik, Yeniseri, maju."
registerShot('m06', { draw(g, t, info) {
  const P = PAL.predawn, hy = E.H * 0.55; sky(g, P, hy); walls(g, hy, 1.0, P.wall); ground(g, P, hy + 10);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) otto(g, t, E.W * (0.1 + i * 0.2) + r * 50, E.H * (0.8 + r * 0.12) - t * 20, V(1.4, 1.45) + r * 0.2, 1, i, { of: YEN, hat: 'yeniseri', walk: true, spear: true, expr: 'angry', rim: { color: GOLD(), dir: [0, -1], w: 4 } });
  big(g, 'YENISERI', E.H * V(0.13, 0.13), GOLD(), pop(t, wt('Yeniseri,', 26.1, info)), V(130, 140)); small(g, 'PASUKAN TERBAIK', E.H * V(0.2, 0.2), '#ffffff', fadeIn(t, wt('terbaik,', 25.5, info) - 0.1));
} });
// m07 — Hasan climbs under arrows, plants the flag, falls as a martyr (non-graphic)
registerShot('m07', { draw(g, t, info) {
  const P = PAL.predawn, hy = E.H * 0.45; sky(g, P, hy); ground(g, P, hy);
  const wx = E.W * 0.62, top = E.H * 0.48; g.fillStyle = P.wall; g.fillRect(wx, top, E.W, E.H); for (let y = top + 20; y < E.H; y += 50) { g.fillStyle = alpha('#000', 0.15); g.fillRect(wx, y, E.W, 3); } for (let x = wx; x < E.W + 40; x += 80) { g.fillStyle = P.wall; g.fillRect(x, top - 40, 46, 44); }
  seg(g, [[wx - 120, E.H], [wx - 10, top - 20]], 10, '#6a4a2a'); seg(g, [[wx - 60, E.H], [wx + 40, top - 20]], 10, '#6a4a2a'); for (let i = 1; i < 14; i++) { const u = i / 14; seg(g, [[lerp(wx - 120, wx - 10, u), lerp(E.H, top - 20, u)], [lerp(wx - 60, wx + 40, u), lerp(E.H, top - 20, u)]], 6, '#6a4a2a'); }
  arrows(g, t, 26, 0.75);
  const plant = wt('menancapkan', 32.8, info), fall = wt('gugur', 35.3, info), cl = ease.inOut(prog(t, 0.6, plant - 0.3));
  const hx = lerp(wx - 90, wx + 10, cl), hyy = lerp(E.H * 1.0, top - 30, cl);
  if (t > plant) flag(g, wx + 90, top - 40, V(1.1, 1.0), t, ease.out(prog(t, plant, plant + 0.5)));
  const fk = ease.inOut(prog(t, fall - 0.2, fall + 0.8));
  otto(g, t, t > plant ? wx + 30 : hx, t > plant ? top - 40 : hyy, V(1.2, 1.25), 1, 0, { of: YEN, hat: 'yeniseri', pose: t > plant ? (fk > 0.5 ? POSES.kneel : POSES.pointUp) : walkPose(t * 6), rot: 0, expr: fk > 0.5 ? 'sleepy' : 'angry', rim: { color: fk > 0 ? HOLY : GOLD(), dir: [0, -1], w: 4 } });
  if (fk > 0) { glow(g, wx + 30, top - 160, 260, HOLY, 0.4 * fk); FX.godRays(g, wx + 30, -E.H * 0.1, { count: 7, angle: Math.PI / 2, spread: 0.4, len: E.H * 0.6, color: HOLY, a: 0.12 * fk, t }); }
  big(g, 'HASAN', E.H * V(0.1, 0.1), GOLD(), pop(t, wt('Hasan', 29.5, info)), V(110, 116));
  small(g, 'MENANCAPKAN BENDERA', E.H * V(0.17, 0.17), '#ffffff', fadeIn(t, plant - 0.1) * (1 - prog(t, fall - 0.4, fall - 0.1)), V(48, 50));
  big(g, 'SYAHID', E.H * V(0.18, 0.18), HOLY, fadeIn(t, wt('syahid.', 36, info) - 0.1), V(90, 96));
} });
// m08 — "Melihat bendera itu berkibar… semangat pasukan Utsmani meledak!"
registerShot('m08', { draw(g, t, info) {
  const P = PAL.dawn, hy = E.H * 0.5; sky(g, P, hy); FX.sun(g, E.W * 0.3, hy - 60, 60, '#fff3dc', '#ffc090', 4); walls(g, hy + V(60, 80), 1.0, P.wall); ground(g, P, hy + V(80, 100));
  flag(g, E.W * 0.5, hy - V(140, 180), V(1.5, 1.4), t, 1);
  const boom = t > wt('meledak!', 40, info) - 0.2, [qx, qy] = boom ? shake(t, 4, 20) : [0, 0]; g.translate(qx, qy);
  for (let i = 0; i < 6; i++) otto(g, t, E.W * (0.08 + i * 0.17), E.H * 0.92 + (i % 2) * 20, V(1.4, 1.45), 1, i, { of: i % 2 ? YEN : OTTO[i % 4], hat: i % 2 ? 'yeniseri' : 'turban', pose: boom ? { ...POSES.cheer, hF: [30, -250], hB: [-30, -250] } : breathe(POSES.point, t, 1, i), expr: boom ? 'grin' : 'surprised', rim: { color: '#ffc090', dir: [0, -1], w: 4 } });
  small(g, 'BENDERA BERKIBAR!', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('berkibar…', 38.2, info) - 0.2), V(56, 58));
  big(g, 'SEMANGAT MELEDAK!', E.H * V(0.17, 0.17), GOLD(), pop(t, wt('meledak!', 40, info)), V(80, 84));
} });
// m09 — "Tembok pun jebol. Konstantinopel… akhirnya takluk."
registerShot('m09', { draw(g, t, info) {
  const br = wt('jebol.', 41.5, info), p = ease.out(prog(t, br - 0.2, br + 0.6)), [qx, qy] = t > br - 0.2 ? shake(t, 10 * (1 - prog(t, br, br + 1.5)), 26) : [0, 0]; g.translate(qx, qy);
  const P = PAL.dawn, hy = E.H * 0.4; sky(g, P, hy); skyline(g, hy, 0.8, P.city); ground(g, P, hy); walls(g, E.H * 0.75, 1.3, P.wall);
  if (p > 0) { g.fillStyle = linGrad(g, 0, E.H * 0.3, 0, E.H * 0.75, P.sky); g.beginPath(); g.moveTo(E.W * 0.5 - 200 * p, E.H * 0.76); g.lineTo(E.W * 0.5 - 140 * p, E.H * 0.38); g.lineTo(E.W * 0.5, E.H * 0.34); g.lineTo(E.W * 0.5 + 160 * p, E.H * 0.4); g.lineTo(E.W * 0.5 + 210 * p, E.H * 0.76); g.fill(); for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 14), d = p * 500; rr(g, E.W / 2 + Math.cos(a) * d - 15, E.H * 0.6 + Math.sin(a) * d * 0.6 + p * p * 300, 30, 24, 4); g.fillStyle = shadeHex(P.wall, -0.2); g.fill(); } FX.dust(g, E.W / 2, E.H * 0.75, t - br, { count: 20, color: '#d8c8b0' }); }
  big(g, 'JEBOL!', E.H * V(0.12, 0.12), '#ffffff', pop(t, br) * (1 - prog(t, wt('Konstantinopel…', 42.3, info) - 0.2, wt('Konstantinopel…', 42.3, info))), V(120, 126));
  small(g, 'KONSTANTINOPEL…', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('Konstantinopel…', 42.3, info) - 0.1), V(56, 58));
  big(g, 'TAKLUK', E.H * V(0.17, 0.17), GOLD(), pop(t, wt('takluk.', 44, info)), V(150, 160));
} });
// m10 — "lebih dari 50 hari pengepungan, pemuda berusia 21 tahun itu masuk ke kota…"
registerShot('m10', { draw(g, t, info) {
  const P = PAL.golden, hy = E.H * 0.5; sky(g, P, hy); FX.sun(g, E.W * 0.5, hy - V(220, 300), 70, '#fff3dc', '#ffc070', 4); skyline(g, hy, 1.1, P.city, { cross: false }); ground(g, P, hy);
  g.fillStyle = shadeHex(P.wall, -0.2); g.fillRect(-E.W, hy + 40, E.W * 1.0 + E.W * 0.35, E.H * 0.22); g.fillRect(E.W * 0.65, hy + 40, E.W, E.H * 0.22); g.fillStyle = '#1a1010'; g.beginPath(); g.moveTo(E.W * 0.35, hy + 40 + E.H * 0.22); g.lineTo(E.W * 0.35, hy + 140); g.quadraticCurveTo(E.W * 0.5, hy + 40, E.W * 0.65, hy + 140); g.lineTo(E.W * 0.65, hy + 40 + E.H * 0.22); g.fill();
  const k = ease.inOut(prog(t, 0.3, info.dur));
  personH(g, { x: E.W * 0.5, y: lerp(E.H * 1.02, E.H * 0.86, k), s: V(1.7, 1.8) * (1 - 0.2 * k), facing: 1, outfit: FATIH, pose: walkPose(t * 4), expr: 'smile', rim: { color: '#ffd08a', dir: [0, -1], w: 5 } }, 'sultan');
  for (let i = 0; i < 4; i++) otto(g, t, E.W * (0.15 + i * 0.23 + (i > 1 ? 0.08 : -0.08)), E.H * 0.98 + (i % 2) * 20, V(1.4, 1.45), 1, i, { walk: true, spear: true, rim: { color: '#ffd08a', dir: [0, -1], w: 3 } });
  big(g, '50+ HARI', E.H * V(0.1, 0.1), '#ffffff', pop(t, wt('lima', 46.3, info)), V(90, 96));
  small(g, 'PEMUDA 21 TAHUN', E.H * V(0.16, 0.16), GOLD(), fadeIn(t, wt('dua', 48.7, info) - 0.1), V(58, 60));
  small(g, 'MASUK KE KOTA', E.H * V(0.21, 0.21), '#ffffff', fadeIn(t, wt('masuk', 50, info) - 0.1), V(50, 52));
} });
// m11 — "dunia mengenalnya dengan satu nama… Muhammad Al-Fatih. Sang Penakluk."
registerShot('m11', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1a08', '#0a0604']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, E.H * 0.55, { count: 16, spread: Math.PI * 2, len: E.H, color: GOLD(), a: 0.07, t });
  bigPersonH(g, E.W / 2, E.H * V(0.62, 0.6), V(270, 300), { outfit: FATIH, expr: 'smile', rimColor: GOLD(), rimSide: -1 }, 'sultan');
  small(g, 'DUNIA MENGENALNYA…', E.H * V(0.08, 0.08), '#ffffff', fadeIn(t, 0.2) * (1 - prog(t, wt('Muhammad', 57.3, info) - 0.4, wt('Muhammad', 57.3, info) - 0.1)), V(48, 50));
  big(g, 'MUHAMMAD AL-FATIH', E.H * V(0.1, 0.1), GOLD(), pop(t, wt('Muhammad', 57.3, info)), V(80, 84));
  big(g, 'SANG PENAKLUK', E.H * V(0.92, 0.92), '#ffffff', pop(t, wt('Sang', 59, info)), V(90, 96));
} });
// m12 — Hikmah
registerShot('m12', { draw(g, t, info) {
  const P = PAL.dawn, hy = E.H * 0.66; sky(g, P, hy); FX.sun(g, E.W * 0.7, hy - 140, 60, '#fff3dc', '#ffc090', 4);
  g.fillStyle = '#2a2030'; g.beginPath(); g.moveTo(-E.W, E.H); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, hy + 120 - V(260, 360) * Math.exp(-(((x - E.W * 0.5) / (E.W * 0.3)) ** 2))); g.lineTo(E.W * 2, E.H); g.fill();
  galley(g, E.W * 0.5, hy + 120 - V(260, 360) - 10, V(0.7, 0.65), 1, 0, '#1a1214', OTRED);
  small(g, 'HIKMAH', E.H * V(0.08, 0.08), GOLD(), fadeIn(t, 0.1));
  big(g, 'USIA MUDA', E.H * V(0.14, 0.14), '#ffffff', fadeIn(t, wt('Usia', 62, info) - 0.1), V(84, 88)); small(g, 'BUKAN PENGHALANG', E.H * V(0.2, 0.2), '#ffd9a0', fadeIn(t, wt('bukan', 62.5, info) - 0.1), V(54, 56));
  ['IMAN', 'ILMU', 'KEBERANIAN'].forEach((s, i) => small(g, s, E.H * V(0.28 + i * 0.055, 0.28 + i * 0.055), [HOLY, '#bfe0ff', GOLD()][i], fadeIn(t, wt(['iman,', 'ilmu,', 'keberanian'][i], 67 + i * 0.5, info) - 0.1), V(60, 62)));
  small(g, 'AKAN MENEMUKAN JALAN LAIN', E.H * V(0.92, 0.92), '#ffffff', fadeIn(t, wt('menemukan', 69.2, info) - 0.1), V(44, 46));
} });
// m13 — end card
registerShot('m13', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a1408', '#05030a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 9, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.2, color: HOLY, a: 0.08, t });
  big(g, 'IKUTI TERUS', E.H * V(0.26, 0.26), '#ffffff', ease.outBack(prog(t, 0.1, 0.5)), V(96, 100));
  big(g, 'KISAH HEBAT', E.H * V(0.33, 0.33), GOLD(), ease.outBack(prog(t, 0.4, 0.8)), V(84, 88)); big(g, 'SEJARAH ISLAM', E.H * V(0.39, 0.39), GOLD(), ease.outBack(prog(t, 0.6, 1.0)), V(84, 88));
  commentPrompt(g, Math.max(0, t - 1.0), ['SIAPA TOKOH', 'SELANJUTNYA?'], { y: E.H * V(0.58, 0.56) });
  text(g, 'E-DAYzz', E.W / 2, E.H * 0.92, { size: V(48, 50), color: alpha('#ffffff', 0.8), font: FONTS.title, spacing: 4, alpha: fadeIn(t, 1.4) });
} });
