// shots/idris3.js — Kisah Nabi Idris, Part 3 (f01–f15). The Mi'raj is shown only as a column of light; Rasulullah SAW is never depicted.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, alpha, seg, circle, ring, rr, text, FONTS, wordTime, linGrad, poly, rng } from '/engine/core.js';
import { POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert } from '../sets/desert.js';
import { camp } from '../sets/madyan.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { IDRIS, MURID, MUSA, YUSUF, LUTH } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
// heavenly space with stacked luminous layers; scroll moves the layers downward (ascending)
function heavens(g, t, scroll = 0, o = {}) {
  const W = E.W, H = E.H; g.fillStyle = linGrad(g, 0, 0, 0, H, ['#0a0c2a', '#1a1a4a', '#2a1a4a']); g.fillRect(-W, -H, W * 3, H * 3);
  FX.stars(g, t, { count: 200, area: [0, 0, W, H] });
  const gap = H * 0.42;
  for (let i = 0; i < 8; i++) { const y = H * 0.85 - i * gap + scroll * gap; if (y < -gap || y > H + gap) continue; g.fillStyle = linGrad(g, 0, y - 40, 0, y + 40, [alpha('#c8d8ff', 0), alpha('#c8d8ff', 0.18), alpha('#c8d8ff', 0)]); g.fillRect(-W, y - 40, W * 3, 80); for (let k = 0; k < 6; k++) { g.fillStyle = alpha('#e8f0ff', 0.08); g.beginPath(); g.ellipse((k * 260 + i * 90) % (W + 200) - 100, y, 160, 30, 0, 0, Math.PI * 2); g.fill(); } if (o.labels && i >= 1 && i <= 7) text(g, 'LANGIT KE-' + i, W * 0.06, y - 50, { size: V(34, 38), color: alpha('#e8f0ff', 0.8), font: FONTS.title, align: 'left' }); }
}
function lightColumn(g, t, x, k) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, x - 160, 0, x + 160, 0, [alpha(HOLY, 0), alpha(HOLY, 0.45 * k), alpha(HOLY, 0)]); g.fillRect(x - 160, -E.H, 320, E.H * 3); g.restore(); glow(g, x, E.H * 0.45, 400 * k, HOLY, 0.4); for (let i = 0; i < 26; i++) FX.sparkle(g, x + Math.sin(i * 2.3) * 120, E.H - ((t * 500 + i * 90) % (E.H * 1.2)), 16, '#ffffff', 0.8 * k); }
function ayatCard(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a1a12', '#123020', '#0a1a12']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, E.H * 0.42, { count: 16, angle: 0, spread: Math.PI * 2, len: E.H, color: '#ffe6a0', a: 0.06, t });
  [['"DAN KAMI TELAH', '"Dan', 5], ['MENGANGKATNYA', 'mengangkatnya', 6], ['KE TEMPAT', 'tempat', 7], ['YANG TINGGI"', 'tinggi."', 8]].forEach(([s, w, af], i) => { const a = ease.out(prog(t, wt(w, af, info) - 0.2, wt(w, af, info) + 0.4)); text(g, s, E.W / 2, E.H * V(0.26, 0.28) + i * V(90, 100), { size: V(70, 72), color: i === 3 ? GOLD() : '#ffffff', font: FONTS.title, stroke: 12, strokeColor: '#000', glow: 18, glowColor: 'rgba(255,220,150,.5)', alpha: a }); });
  const ra = ease.outBack(prog(t, wt('Q', 9, info) - 0.2, wt('Q', 9, info) + 0.3)); if (ra > 0) { g.save(); g.translate(E.W / 2, E.H * V(0.74, 0.72)); g.scale(ra, ra); rr(g, -V(300, 320), -55, V(600, 640), 110, 55); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill(); g.strokeStyle = GOLD(); g.lineWidth = 5; g.stroke(); text(g, 'QS. MARYAM: 57', 0, 4, { size: V(52, 56), color: GOLD(), font: FONTS.title }); g.restore(); }
}

// f01 — title
registerShot('f01', { draw(g, t, info) {
  heavens(g, t, t * 0.1); veil(g, '#04020a', 0.3);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI IDRIS', 'PART 3'], dur: info.dur + 0.5, y: E.H * 0.42 });
  const a = ease.out(prog(t, 0.6, 1.1)) * (1 - prog(t, info.dur - 0.3, info.dur));
  ['DIANGKAT KE', 'TEMPAT YANG TINGGI'].forEach((s, i) => text(g, s, E.W / 2, E.H * 0.42 + V(130, 150) + i * V(64, 70), { size: V(52, 56), color: '#9ad0ff', font: FONTS.title, glow: 22, glowColor: 'rgba(120,180,255,.7)', spacing: 3, alpha: a }));
} });
// f02 — the verse (QS. Maryam: 57)
registerShot('f02', { draw(g, t, info) { ayatCard(g, t, info); } });
// f03 — "Tempat yang tinggi… Apa maksudnya?"
registerShot('f03', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur); heavens(g, t, k * 0.6);
  person(g, { x: E.W / 2, y: E.H * 0.97, s: V(1.6, 1.8), facing: 1, outfit: IDRIS, pose: breathe(POSES.stand, t), expr: 'thinking', look: [0, -1], rim: { color: '#c8d8ff', dir: [0, -1], w: 5 } });
  big(g, '?', E.H * 0.3, GOLD(), ease.outBack(prog(t, wt('Apa', 15, info) - 0.2, wt('Apa', 15, info) + 0.3)), V(220, 240));
} });
// f04 — "Ribuan tahun kemudian, jawabannya terungkap dalam satu malam yang menakjubkan… Isra Mi'raj."
registerShot('f04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.08 * k, y: -60 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'night', sunX: V(300, 200), wind: false });
  FX.stars(g, t, { count: 160, seed: 11 });
  const a = ease.outBack(prog(t, wt('Isra', 22, info) - 0.3, wt('Isra', 22, info) + 0.3)); if (a > 0) { lightColumn(g, t, E.W / 2, a * 0.6); big(g, "ISRA MI'RAJ", E.H * 0.35, GOLD(), a, V(120, 124)); }
  const y = ease.out(prog(t, 0.2, 1.2)); text(g, 'RIBUAN TAHUN KEMUDIAN…', E.W / 2, E.H * V(0.15, 0.16), { size: V(50, 52), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000', alpha: y * (1 - a) });
} });
// f05 — "Saat Rasulullah SAW naik menembus langit, di langit keempat…"  a column of light rising through the heavens
registerShot('f05', { draw(g, t, info) {
  const up = ease.inOut(prog(t, 0.1, wt('keempat…', 26, info) + 0.2)); heavens(g, t, up * 3.0, { labels: true });
  lightColumn(g, t, E.W / 2, 1);
  const lvl = Math.min(4, 1 + Math.floor(up * 3 + 0.0001)); UI.badge(g, { str: 'LANGIT KE-' + lvl, x: E.W - V(90, 70), y: V(110, 170), size: V(50, 56) });
} });
// f06 — "beliau bertemu seseorang."  the fourth heaven: a figure in the light
registerShot('f06', { draw(g, t, info) {
  heavens(g, t, 3.0); lightColumn(g, t, E.W * 0.78, 0.8);
  const a = ease.out(prog(t, 0.2, 1.2)); glow(g, E.W * 0.32, E.H * 0.55, V(500, 520), '#ffe6b0', 0.4 * a);
  person(g, { x: E.W * 0.32, y: E.H * V(0.8, 0.72), s: V(1.7, 1.8), facing: 1, outfit: { top: 'dress', color: '#1a1a2a' }, pose: POSES.stand, expr: 'neutral', alpha: a, dim: true, rim: { color: HOLY, dir: [1, -0.3], w: 6 } });
  text(g, 'LANGIT KE-4', E.W / 2, E.H * V(0.12, 0.12), { size: V(56, 60), color: '#e8f0ff', font: FONTS.title, stroke: 9, strokeColor: '#000' });
} });
// f07 — "Orang itu menyambut dengan hangat: Selamat datang, wahai saudara yang saleh… dan nabi yang saleh."
registerShot('f07', { draw(g, t, info) {
  heavens(g, t, 3.0); lightColumn(g, t, E.W * 0.85, 0.9);
  const say = wt('"Selamat', 30, info);
  person(g, { x: E.W * 0.38, y: E.H * V(0.82, 0.74), s: V(1.9, 2.0), facing: 1, outfit: { top: 'dress', color: '#1a1a2a' }, pose: breathe(posesAt(t, [[0, 'stand'], [1.0, { ...POSES.cheer, eF: [30, -170], hF: [56, -160], eB: [-24, -170], hB: [-50, -160] }]]), t), expr: 'happy', dim: true, talk: t > say ? Math.max(0, 0.4 * Math.sin(t * 11)) : 0, rim: { color: HOLY, dir: [1, -0.3], w: 6 } });
  const a = ease.out(prog(t, say - 0.1, say + 0.4)); if (a > 0) { text(g, '"SELAMAT DATANG,', E.W / 2, E.H * V(0.14, 0.14), { size: V(54, 58), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: a }); text(g, 'SAUDARA YANG SALEH…', E.W / 2, E.H * V(0.14, 0.14) + V(72, 78), { size: V(50, 54), color: GOLD(), font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: a }); }
  const b = ease.out(prog(t, wt('nabi', 33, info) - 0.1, wt('nabi', 33, info) + 0.4)); if (b > 0) text(g, 'DAN NABI YANG SALEH"', E.W / 2, E.H * V(0.14, 0.14) + V(144, 156), { size: V(50, 54), color: GOLD(), font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: b });
} });
// f08 — "Siapakah dia?"
registerShot('f08', { draw(g, t, info) {
  heavens(g, t, 3.0); veil(g, '#000', 0.3);
  person(g, { x: E.W / 2, y: E.H * V(0.82, 0.76), s: V(2.1, 2.3), facing: 1, outfit: { top: 'dress', color: '#0a0a14' }, pose: breathe(POSES.stand, t), expr: 'neutral', dim: true, rim: { color: HOLY, dir: [0, -1], w: 6 } });
  big(g, '?', E.H * 0.24, GOLD(), ease.outBack(prog(t, 0.2, 0.6)), V(220, 240));
} });
// f09 — "Dialah… Nabi Idris AS."
registerShot('f09', { draw(g, t, info) {
  heavens(g, t, 3.0); const a = ease.out(prog(t, wt('Nabi', 37, info) - 0.3, wt('Nabi', 37, info) + 0.3));
  FX.godRays(g, E.W / 2, E.H * 0.5, { count: 16, angle: 0, spread: Math.PI * 2, len: E.H, color: HOLY, a: 0.12 * a, t });
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330), { outfit: IDRIS, expr: 'smile', rimColor: HOLY, rimSide: -1 });
  veil(g, '#000', 0.8 * (1 - a));
  big(g, 'NABI IDRIS', E.H * V(0.18, 0.18), GOLD(), a, V(110, 116));
} });
// f10–f12 — flashbacks: learning, preaching, devotion
registerShot('f10', { draw(g, t, info) {
  const { GY, CX } = camp(g, t, { z: 1.12 }, { mood: 'dusk', fireX: V(320, 260) }); veil(g, '#2a1a0a', 0.2);
  const x = CX - V(120, 100), s = V(1.7, 1.8); person(g, { x, y: GY + 40, s, facing: 1, outfit: IDRIS, pose: breathe({ ...POSES.sit, eF: [30, -110], hF: [56, -96], eB: [22, -112], hB: [44, -98], head: [12, -174] }, t, 0.6), expr: 'thinking', look: [0.6, 0.8], rim: { color: '#ffa040', dir: [1, -0.3], w: 5 } });
  g.fillStyle = '#e8dcb8'; g.fillRect(x + 70 * s, GY + 40 - 98 * s, 200, 36);
  text(g, 'TEKUN BELAJAR', E.W / 2, E.H * V(0.15, 0.15), { size: V(70, 74), color: GOLD(), font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.4)) });
} });
registerShot('f11', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.08 }, { mood: 'golden', sunX: -V(200, 150), wind: false });
  person(g, { x: CX + V(280, 240), y: GY + 30, s: V(1.6, 1.65), facing: -1, outfit: IDRIS, pose: breathe(POSES.explain, t), expr: 'smile', talk: Math.max(0, 0.35 * Math.sin(t * 11)), rim: { color: HOLY, dir: [0, -1], w: 5 } });
  MURID.forEach((of, i) => person(g, { x: CX - V(360, 300) + i * V(170, 140), y: GY + 50, s: V(1.35, 1.4), facing: 1, outfit: of, pose: breathe(POSES.stand, t, 1, i), expr: 'smile' }));
  text(g, 'SABAR BERDAKWAH', E.W / 2, E.H * V(0.15, 0.15), { size: V(70, 74), color: GOLD(), font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.4)) });
} });
registerShot('f12', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.08 }, { mood: 'night', sunX: V(300, 200), wind: false });
  holyLight(g, t, [CX, GY - V(180, 220)], 0.6); person(g, { x: CX, y: GY + 30, s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe({ ...POSES.kneel, eF: [26, -150], hF: [40, -180], eB: [18, -148], hB: [32, -178] }, t, 0.6), expr: 'sleepy', rim: { color: HOLY, dir: [0, -1], w: 5 } });
  text(g, 'JUJUR KEPADA ALLAH', E.W / 2, E.H * V(0.15, 0.15), { size: V(66, 70), color: GOLD(), font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.4)) });
} });
// f13 — "dimuliakan hingga ke langit."
registerShot('f13', { draw(g, t, info) {
  const up = ease.inOut(prog(t, 0.1, info.dur)); heavens(g, t, up * 2.5); lightColumn(g, t, E.W / 2, 0.8);
  person(g, { x: E.W / 2, y: lerp(E.H * 0.95, E.H * 0.6, up), s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe(POSES.cheer, t), expr: 'joy', look: [0, -1], rim: { color: HOLY, dir: [0, -1], w: 6 }, shadow: false });
} });
// f14 — "Hikmahnya: Ilmu yang diiringi iman… dan kesabaran dalam kebaikan… akan mengangkat derajat seseorang, di dunia dan di akhirat."
registerShot('f14', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0c2a', '#14183a', '#0a0c2a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  big(g, 'HIKMAH', E.H * V(0.12, 0.12), GOLD(), ease.out(prog(t, 0.1, 0.5)), V(100, 110));
  const items = [['ILMU', 'Ilmu', 48, '#9ad0ff'], ['IMAN', 'iman…', 49, '#fff0c0'], ['SABAR', 'kesabaran', 50, '#8aff9a']];
  items.forEach(([s, w, af, c], i) => { const a = ease.outBack(prog(t, wt(w, af, info) - 0.2, wt(w, af, info) + 0.3)); if (a <= 0) return; const x = E.W * (0.2 + i * 0.3), y = E.H * V(0.62, 0.58); g.save(); g.translate(x, y); g.scale(a, a); circle(g, 0, 0, V(110, 120), alpha(c, 0.18)); ring(g, 0, 0, V(110, 120), 6, c); text(g, s, 0, 4, { size: V(48, 52), color: c, font: FONTS.title }); g.restore(); });
  const up = ease.out(prog(t, wt('mengangkat', 52, info) - 0.2, wt('mengangkat', 52, info) + 0.6)); if (up > 0) { const y0 = E.H * V(0.45, 0.42), y1 = lerp(y0, E.H * V(0.24, 0.24), up); seg(g, [[E.W / 2, y0], [E.W / 2, y1]], 16, GOLD()); poly(g, [[E.W / 2 - 50, y1 + 20], [E.W / 2 + 50, y1 + 20], [E.W / 2, y1 - 50]], GOLD()); text(g, 'DERAJAT', E.W / 2, E.H * V(0.86, 0.84), { size: V(80, 84), color: GOLD(), font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: up }); }
} });
// f15 — "Ikuti terus kisah para nabi selanjutnya!"
registerShot('f15', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#060a24', '#101a40', '#1a1030']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.stars(g, t, { count: 140 }); glow(g, E.W / 2, E.H * 0.8, E.W * 0.6, '#ffd890', 0.25);
  const a = ease.out(prog(t, 0.1, 0.6)); big(g, 'IKUTI TERUS', E.H * V(0.2, 0.22), '#ffffff', a, V(90, 96)); big(g, 'KISAH PARA NABI', E.H * V(0.2, 0.22) + V(110, 116), GOLD(), a, V(96, 100));
  const cast = [MUSA, YUSUF, LUTH, IDRIS], y0 = E.H * V(0.86, 0.72), gap = V(230, 230);
  cast.forEach((of, i) => { const k = ease.out(prog(t, 0.4 + i * 0.12, 0.9 + i * 0.12)); person(g, { x: E.W / 2 + (i - 1.5) * gap, y: y0 + (1 - k) * 40, s: V(1.3, 1.4), facing: 1, outfit: of, pose: breathe(POSES.relaxed, t, 1, i), expr: 'smile', staff: i === 0 || i === 2, alpha: k, rim: { color: HOLY, dir: [0, -1], w: 5 } }); });
  const sp = ease.outBack(prog(t, 1.4, 1.9)); g.save(); g.translate(E.W / 2, E.H * V(0.42, 0.42)); g.scale(sp, sp); rr(g, -200, -50, 400, 100, 50); g.fillStyle = '#e0302a'; g.fill(); text(g, 'Subscribe', 0, 2, { size: 48, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore();
} });
