// shots/luth3.js — Kisah Nabi Luth, Part 3 (n01–n20). The punishment is shown through the city and the elements; the wife's end is symbolic (she turns to dust).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, poly, rng, backdrop } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { city as egyptCity } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { shore } from '../sets/sea.js';
import { person, bigPerson, flame, staff, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { LUTH, ISTRI_LUTH, PUTRI, MUKMIN, KAUM, MUSA, YUSUF } from '../cast.js';

const city = (g, t, cam, o = {}) => egyptCity(g, t, cam, { ...o, noEgypt: true });
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff3a2a';
const TAMU = { top: 'dress', color: '#f8f4ea', head: 'hood', headColor: '#ffffff' };
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
function tamu(g, o, k = 1) { person(g, { ...o, outfit: TAMU, expr: 'neutral', rim: { color: HOLY, dir: [0, -1], w: 5 } }); const [hx, hy, r] = headPos(o); glow(g, hx, hy, r * 4 * k, '#ffffff', 0.9); circle(g, hx, hy, r * 1.05, alpha('#fffbe8', 0.95)); }
// Sodom as a slab of earth (for the lifting / overturning)
function slab(g, x, y, w, t, o = {}) {
  const r = rng(7), h = w * 0.35;
  g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(x - w / 2, y); for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(x - w / 2 + u * w, y + h * (0.5 + 0.5 * Math.sin(u * Math.PI)) + (r() - 0.5) * 40); } g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  g.fillStyle = '#5a3a24'; g.fillRect(x - w / 2, y - 18, w, 22);
  for (let i = 0; i < 9; i++) { const bx = x - w / 2 + 30 + i * (w - 60) / 9, bw = (w - 60) / 9 - 10, bh = 60 + (i * 37) % 90; g.fillStyle = i % 2 ? '#5a4030' : '#6a4a38'; g.fillRect(bx, y - 18 - bh, bw, bh); if (i % 3 === 0) { g.fillStyle = o.lit ? '#ffb860' : '#2a1a10'; g.fillRect(bx + bw * 0.35, y - 18 - bh + 20, bw * 0.3, 22); } }
  g.fillStyle = '#4a3020'; g.fillRect(x - w / 2, y - 120, 30, 102); g.fillRect(x + w / 2 - 30, y - 120, 30, 102);
}
function fireStones(g, t, n = 40, seed = 3, area = [0, 0, E.W, E.H]) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const sp = 700 + r() * 600, x0 = area[0] + r() * area[2] * 1.3, ph = r(), y = ((t * sp + ph * area[3] * 2) % (area[3] * 1.4)) - area[3] * 0.2, x = x0 - y * 0.35, s = 8 + r() * 14;
    const tail = [[x + 60, y - 150], [x, y]]; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = g.createLinearGradient(tail[0][0], tail[0][1], x, y); g.strokeStyle = alpha('#ff7a2a', 0.5); g.lineWidth = s; g.lineCap = 'round'; g.beginPath(); g.moveTo(tail[0][0], tail[0][1]); g.lineTo(x, y); g.stroke(); g.restore();
    circle(g, x, y, s, '#2a1408'); glow(g, x, y, s * 3, '#ff8a2a', 0.7); circle(g, x, y, s * 0.55, '#ffc060'); }
}
function hourglass(g, x, y, s, k) {
  g.save(); g.translate(x, y); g.scale(s, s);
  seg(g, [[-120, -200], [120, -200]], 18, '#6a4a2a'); seg(g, [[-120, 200], [120, 200]], 18, '#6a4a2a'); seg(g, [[-110, -200], [-110, 200]], 10, '#6a4a2a'); seg(g, [[110, -200], [110, 200]], 10, '#6a4a2a');
  g.fillStyle = alpha('#cfe0ff', 0.25); g.beginPath(); g.moveTo(-90, -190); g.lineTo(90, -190); g.lineTo(10, 0); g.lineTo(90, 190); g.lineTo(-90, 190); g.lineTo(-10, 0); g.closePath(); g.fill();
  g.fillStyle = '#e0b060'; const top = 1 - k; g.beginPath(); g.moveTo(-90 * top, -10 - 170 * top); g.lineTo(90 * top, -10 - 170 * top); g.lineTo(0, -10); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-90 * Math.sqrt(k), 190); g.lineTo(90 * Math.sqrt(k), 190); g.lineTo(0, 190 - 160 * k); g.closePath(); g.fill();
  if (k < 0.99) seg(g, [[0, -6], [0, 190 - 160 * k]], 4, '#e0b060');
  g.restore();
}

// n01 — "Part tiga. Subuh Terakhir Negeri Sodom."
registerShot('n01', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.2 }, { mood: 'night' }), 12, 0.45, '#04020a');
  glow(g, E.W / 2, E.H, E.W, '#ff6a2a', 0.25);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI LUTH', 'PART 3'], sub: 'SUBUH TERAKHIR NEGERI SODOM', dur: info.dur + 0.5, y: E.H * 0.44 });
} });
// n02 — "Malaikat memberi perintah yang tegas: Pergilah di akhir malam bersama keluargamu."
registerShot('n02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.08 * k };
  const M = mood('interiorWarm'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#1a120c', '#3a2618', '#2a1a10']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, ['#3a2416', '#120804']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); });
  FX.godRays(g, CX - V(200, 160), GY - 250, { count: 16, angle: 0, spread: Math.PI * 2, len: E.H, color: HOLY, a: 0.1, t });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 3; i++) tamu(g, { x: CX - V(380, 320) + i * V(150, 130), y: GY + 30, s: V(1.45, 1.5), facing: 1, pose: breathe(i === 1 ? POSES.point : POSES.stand, t, 1, i) }, 1); person(g, { x: CX + V(260, 220), y: GY + 40, s: V(1.5, 1.55), facing: -1, outfit: LUTH, pose: breathe(POSES.stand, t), expr: 'determined', face: { brows: null }, look: [-1, 0], rim: { color: HOLY, dir: [-1, -0.3], w: 5 } }); });
} });
// n03 — "Jangan ada yang menoleh ke belakang…"
registerShot('n03', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.4 }, { mood: 'night' }), 14, 0.5, '#04020a');
  const a = ease.outBack(prog(t, 0.2, 0.7));
  g.save(); g.translate(E.W / 2, E.H * 0.45); g.scale(a, a); seg(g, [[160, 0], [-140, 0]], 40, '#ffffff'); poly(g, [[-200, 0], [-110, -70], [-110, 70]], '#ffffff'); g.restore();
  const x = ease.out(prog(t, 0.6, 1.0)); if (x > 0) { seg(g, [[E.W / 2 - 260, E.H * 0.45 - 260], [E.W / 2 - 260 + 520 * x, E.H * 0.45 - 260 + 520 * x]], 34, RED); }
  big(g, 'JANGAN MENOLEH', E.H * V(0.78, 0.74), '#ffffff', a, V(90, 92));
} });
// n04 — "kecuali istrimu."
registerShot('n04', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.5, y: -60 }, { mood: 'pharaoh' }), 14, 0.45, '#100004');
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(290, 320) * (1 + 0.04 * t), { outfit: ISTRI_LUTH, expr: 'smirk', look: [-0.7, 0], rimColor: RED, rimSide: 1 });
} });
// n05 — "Azab mereka datang saat subuh. Bukankah subuh itu sudah dekat?"
registerShot('n05', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.05 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'night', sunX: V(380, 260), wind: false });
  layer(g, cam, 0.5, (g) => { const glowY = GY - V(80, 120); g.fillStyle = linGrad(g, 0, glowY - 80, 0, glowY + 20, [alpha('#ff8a4a', 0), alpha('#ff8a4a', 0.35 * k)]); g.fillRect(-E.W, glowY - 80, E.W * 3, 100); });
  const a = ease.out(prog(t, wt('subuh.', 16, info) - 0.2, wt('subuh.', 16, info) + 0.4)); big(g, 'SAAT SUBUH', E.H * V(0.25, 0.28), '#ffb080', a, V(90, 96));
} });
// n06 — "Malam itu sunyi."
registerShot('n06', { draw(g, t, info) { const cam = { z: 1.05 + 0.02 * t }; city(g, 0.2, cam, { mood: 'night' }); veil(g, '#000010', 0.3); } });
// n07 — "Nabi Luth dan orang-orang beriman melangkah pergi."
registerShot('n07', { draw(g, t, info) {
  const s = V(1.2, 1.25), cam = { z: 1.05, x: t * 60 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'night', sunX: -V(300, 200) });
  layer(g, cam, 0.4, (g) => { g.fillStyle = '#140c14'; for (let i = 0; i < 10; i++) g.fillRect(CX - V(900, 700) + i * 50, GY - V(160, 230) - (i * 37) % 60, 44, 120); });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => { const x = CX - V(40, 30) + t * 80; person(g, { x, y: GY + 40, s, facing: 1, outfit: LUTH, pose: walkPose(t * 5), expr: 'determined', staff: true, rim }); [PUTRI[0], PUTRI[1], ...MUKMIN].forEach((of, i) => person(g, { x: x - V(130, 110) * (i + 1), y: GY + 46 + (i % 2) * 10, s: s * 0.96, facing: 1, outfit: of, pose: walkPose(t * 5 + i + 1), expr: 'neutral', rim })); });
} });
// n08 — "Tanpa menoleh. Tanpa ragu."
registerShot('n08', { draw(g, t, info) {
  const M = mood('night');
  blurBg(g, (g) => desert(g, t, { z: 1.5, y: -80 }, { mood: 'night', wind: false }), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: LUTH, expr: 'determined', face: { brows: null }, look: [0.6, 0], rimColor: M.rim, rimSide: 1 });
} });
// n09 — "Lalu fajar menyingsing…"
registerShot('n09', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.05 * k };
  city(g, t, cam, { mood: 'dusk' }); veil(g, '#3a1000', 0.2 + 0.2 * k);
  glow(g, E.W / 2, E.H * V(0.55, 0.5), E.W * 0.8, '#ff6a2a', 0.3 * k);
} });
// n10 — "Terdengar suara yang menggelegar!"
registerShot('n10', { draw(g, t, info) {
  const boom = prog(t, wt('menggelegar!', 33, info) - 0.3, wt('menggelegar!', 33, info)), [qx, qy] = shake(t, 4 + 22 * boom * (1 - prog(t, 1.6, 2.3)), 30);
  g.translate(qx, qy); city(g, t, { z: 1.08 }, { mood: 'dusk' }); veil(g, '#3a0a00', 0.35);
  if (boom > 0) { FX.rings(g, E.W / 2, E.H * 0.5, t - 1, { count: 4, r0: 40, r1: E.H, speed: 1.2, color: '#ffd0a0', a: 0.6 }); veil(g, '#ffffff', 0.5 * (1 - prog(t, 1.4, 1.9)) * boom, 'lighter'); }
} });
// n11 — "Bumi Sodom terangkat ke langit…"
registerShot('n11', { draw(g, t, info) {
  const lift = ease.inOut(prog(t, 0.1, info.dur)), [qx, qy] = shake(t, 6, 25);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a0408', '#5a1408', '#c84a1a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.lightning(g, { x1: E.W * 0.8, y1: 0, x2: E.W * 0.7, y2: E.H * 0.3, seed: Math.floor(t * 3) });
  const y = lerp(E.H * 0.75, E.H * 0.35, lift) + qy; slab(g, E.W / 2 + qx, y, V(1100, 900), t, { lit: true });
  for (let i = 0; i < 14; i++) circle(g, E.W * (0.2 + (i % 7) * 0.1), y + 250 + ((t * 300 + i * 60) % 600), 8 + (i % 3) * 5, '#3a2418');
  g.fillStyle = '#2a1408'; g.fillRect(-E.W, E.H * 0.85, E.W * 3, E.H);
} });
// n12 — "lalu dijungkirbalikkan."
registerShot('n12', { draw(g, t, info) {
  const flip = ease.inOut(prog(t, 0.1, 1.4)), fall = ease.in(prog(t, 1.2, 2.1)), [qx, qy] = shake(t, fall > 0.9 ? 24 : 6, 30);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a0408', '#5a1408', '#c84a1a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.save(); g.translate(E.W / 2 + qx, lerp(E.H * 0.35, E.H * 0.85, fall) + qy); g.rotate(Math.PI * flip); slab(g, 0, 0, V(1100, 900), t, { lit: flip < 0.5 }); g.restore();
  g.fillStyle = '#2a1408'; g.fillRect(-E.W, E.H * 0.85, E.W * 3, E.H);
  if (fall > 0.95) { FX.rings(g, E.W / 2, E.H * 0.85, t - 2.1, { count: 3, r0: 40, r1: E.W, speed: 1.5, color: '#ffb080', a: 0.6 }); FX.dust(g, t, { count: 80, color: '#c8905a', a: 0.6, speed: -60 }); }
} });
// n13 — "Yang di atas… menjadi di bawah."
registerShot('n13', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a0408', '#4a1008', '#7a2a10']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.save(); g.translate(E.W / 2, E.H * 0.6); g.rotate(Math.PI); slab(g, 0, 0, V(1100, 900), t); g.restore();
  const a1 = ease.out(prog(t, 0.1, 0.5)), a2 = ease.out(prog(t, wt('menjadi', 40, info) - 0.2, wt('menjadi', 40, info) + 0.3));
  text(g, 'ATAS', E.W * 0.2, E.H * 0.25, { size: V(60, 64), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: a1 }); text(g, 'BAWAH', E.W * 0.8, E.H * 0.85, { size: V(60, 64), color: GOLD(), font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: a2 });
  if (a2 > 0) { g.strokeStyle = alpha('#ffffff', a2); g.lineWidth = 10; g.beginPath(); g.arc(E.W / 2, E.H * 0.55, E.W * 0.36, Math.PI * 1.15, Math.PI * 0.15 + Math.PI * 2 * 0.0); g.stroke(); }
  FX.dust(g, t, { count: 60, color: '#c8905a', a: 0.5 });
} });
// n14 — "Belum berhenti. Hujan batu dari tanah yang terbakar turun bertubi-tubi."
registerShot('n14', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), [qx, qy] = shake(t, 5, 25);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0204', '#3a0806', '#6a1a08']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.translate(qx, qy);
  g.fillStyle = '#1a0a06'; g.beginPath(); g.moveTo(-E.W, E.H); for (let x = -E.W; x <= E.W * 2; x += 40) g.lineTo(x, E.H * 0.72 + Math.sin(x * 0.02) * 30 + ((x * 7) % 50)); g.lineTo(E.W * 2, E.H); g.fill();
  fireStones(g, t, Math.floor(20 + 40 * k), 3);
  for (let i = 0; i < 6; i++) flame(g, E.W * (0.1 + i * 0.17), E.H * 0.76, 0.5, t, i);
} });
// n15 — "Tak ada yang tersisa."
registerShot('n15', { draw(g, t, info) {
  const cam = { z: 1.15 - 0.08 * t / info.dur };
  const { GY } = desert(g, t, cam, { mood: 'pharaoh', sunX: 0, wind: false }); veil(g, '#1a0a06', 0.45);
  for (let i = 0; i < 6; i++) { const x = E.W * (0.1 + i * 0.16); for (let k = 0; k < 4; k++) circle(g, x + Math.sin(t + k) * 20, GY - 60 - k * 70 - (t * 40) % 70, 40 + k * 12, alpha('#2a2020', 0.4 - k * 0.08)); }
} });
// n16 — "Termasuk… istri Nabi Luth."  she turns to dust
registerShot('n16', { draw(g, t, info) {
  const dust = ease.in(prog(t, wt('istri', 50, info) - 0.2, info.dur));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0204', '#2a0606', '#4a1008']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const x = E.W / 2, y = E.H * V(0.82, 0.74), s = V(2.0, 2.2);
  if (dust < 1) person(g, { x, y, s, facing: -1, outfit: ISTRI_LUTH, pose: { ...POSES.stand, head: [-10, -206] }, expr: 'shocked', alpha: 1 - dust, rim: { color: RED, dir: [0, -1], w: 5 } });
  const r = rng(4); for (let i = 0; i < 120; i++) { const px = x + (r() - 0.5) * 80 * s, py = y - r() * 230 * s, d = dust * (0.5 + r()); circle(g, px - d * 300 * r(), py - d * 200 * r(), 4 + r() * 4, alpha('#8a6a5a', dust * (1 - d * 0.6))); }
  fireStones(g, t, 10, 9);
} });
// n17 — "Negeri yang dulu sombong itu… kini hanya tinggal pelajaran."  the calm sea at sunrise
registerShot('n17', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 - 0.08 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'golden', calm: 1 });
  layer(g, cam, 1, (g) => { const rim = { color: M.rim, dir: [0, -1], w: 4 }; person(g, { x: CX + V(200, 230), y: GY + V(150, 180), s: V(1.4, 1.45), facing: 1, outfit: LUTH, pose: breathe(POSES.stand, t), expr: 'sad', staff: true, rim }); [PUTRI[0], PUTRI[1], MUKMIN[0]].forEach((of, i) => person(g, { x: CX + V(40, 70) - i * V(140, 130), y: GY + V(160, 190), s: V(1.3, 1.35), facing: 1, outfit: of, pose: breathe(POSES.stand, t, 1, i), expr: 'neutral', rim })); });
} });
// n18 — "Hikmahnya: Menjadi istri seorang nabi pun tidak menyelamatkan… tanpa iman."
registerShot('n18', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0810', '#1a1424', '#0a0810']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const a = ease.out(prog(t, 0.1, 0.6)); big(g, 'HIKMAH', E.H * V(0.14, 0.14), GOLD(), a, V(100, 110));
  const split = ease.inOut(prog(t, 1.0, 2.5)), y = E.H * V(0.7, 0.64);
  glow(g, E.W * 0.3 - split * 60, y - 200, 300, HOLY, 0.35); person(g, { x: E.W * 0.32 - split * 80, y, s: V(1.6, 1.7), facing: 1, outfit: LUTH, pose: breathe(POSES.stand, t), expr: 'sad', rim: { color: HOLY, dir: [0, -1], w: 5 } });
  person(g, { x: E.W * 0.68 + split * 80, y, s: V(1.55, 1.6), facing: -1, outfit: ISTRI_LUTH, pose: breathe(POSES.crossArms, t, 1, 2), expr: 'smirk', dim: true, alpha: 1 - split * 0.5, rim: { color: RED, dir: [0, -1], w: 4 } });
  if (split > 0) { g.setLineDash([18, 14]); seg(g, [[E.W / 2, y - 420], [E.W / 2, y + 40]], 6, alpha('#ffffff', 0.5 * split)); g.setLineDash([]); }
  const b = ease.out(prog(t, wt('tanpa', 61, info) - 0.2, wt('tanpa', 61, info) + 0.4)); big(g, 'TANPA IMAN?', E.H * V(0.88, 0.86), RED, b, V(84, 88));
} });
// n19 — "Dan dosa yang dibanggakan… hanya menunggu waktu."
registerShot('n19', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.3 }, { mood: 'pharaoh' }), 12, 0.55, '#0a0204');
  hourglass(g, E.W / 2, E.H * 0.48, V(1.3, 1.5), ease.inOut(prog(t, 0.1, info.dur - 0.2)));
  const a = ease.out(prog(t, wt('menunggu', 65, info) - 0.2, wt('menunggu', 65, info) + 0.4)); big(g, 'HANYA MENUNGGU WAKTU', E.H * V(0.86, 0.85), '#ffffff', a, V(70, 66));
} });
// n20 — "Ikuti terus kisah para nabi selanjutnya!"
registerShot('n20', { draw(g, t, info) {
  const ui = S().ui; g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#060a24', '#101a40', '#1a1030']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.stars(g, t, { count: 140 }); glow(g, E.W / 2, E.H * 0.8, E.W * 0.6, '#ffd890', 0.25);
  const a = ease.out(prog(t, 0.1, 0.6)); big(g, 'IKUTI TERUS', E.H * V(0.2, 0.22), '#ffffff', a, V(90, 96)); big(g, 'KISAH PARA NABI', E.H * V(0.2, 0.22) + V(110, 116), GOLD(), a, V(96, 100));
  const cast = [MUSA, YUSUF, LUTH], y0 = E.H * V(0.86, 0.72);
  cast.forEach((of, i) => { const k = ease.out(prog(t, 0.4 + i * 0.15, 0.9 + i * 0.15)); person(g, { x: E.W / 2 + (i - 1) * V(260, 280), y: y0 + (1 - k) * 40, s: V(1.4, 1.6), facing: 1, outfit: of, pose: breathe(i === 0 ? { ...POSES.stand, eF: [26, -206], hF: [36, -250] } : POSES.relaxed, t, 1, i), expr: 'smile', staff: i !== 1, staffGlow: i === 0 ? GOLD() : null, alpha: k, rim: { color: HOLY, dir: [0, -1], w: 5 } }); });
  const sp = ease.outBack(prog(t, 1.4, 1.9)); g.save(); g.translate(E.W / 2, E.H * V(0.42, 0.42)); g.scale(sp, sp); rr(g, -200, -50, 400, 100, 50); g.fillStyle = '#e0302a'; g.fill(); text(g, 'Subscribe', 0, 2, { size: 48, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore();
} });
