// shots/yunus3.js — Kisah Nabi Yunus, Part 3 (w01–w21).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, ring, rr, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { city as egyptCity } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { shore, waterSurface } from '../sets/sea.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { underwater, bigFish, fishInside } from '../lib8/_sea.js';
import { SUJUD, KNEEL_UP } from '../lib3/_army.js';
import { YUNUS, NINAWA } from '../cast.js';

const city = (g, t, cam, o = {}) => egyptCity(g, t, cam, { ...o, noEgypt: true });
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const crowd = (g, x0, dx, y, s, t, o = {}) => { const n = o.n || 6; for (let i = 0; i < n; i++) person(g, { x: x0 + i * dx + (i % 2) * 14, y: y + (i % 2) * 18, s, facing: o.facing ? o.facing(i) : -1, outfit: NINAWA[i % NINAWA.length], pose: breathe(o.pose ? o.pose(i) : POSES.stand, t, 1.5, i), expr: o.expr ? o.expr(i) : 'neutral', talk: o.talk ? Math.max(0, 0.5 * Math.sin(t * 12 + i)) : 0, rim: o.rim }); };
const SITHUG = { ...POSES.sit, head: [12, -168] };
// pumpkin vine: k = growth 0..1
function labu(g, x, y, s, k, t) {
  const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([x - 260 * s + u * 520 * s * Math.min(1, k * 1.3), y - Math.sin(u * Math.PI) * 420 * s * Math.min(1, k * 1.5)]); }
  seg(g, [[x - 260 * s, y], [x - 260 * s, y - 40 * s]], 10 * s, '#3a6a2a'); seg(g, pts, 9 * s, '#3a6a2a');
  const n = Math.floor(14 * k); for (let i = 0; i < n; i++) { const p = pts[Math.min(30, 2 + i * 2)], r = 70 * s * ease.outBack(clamp(k * 14 - i, 0, 1)), sw = Math.sin(t * 1.5 + i) * 0.1; g.save(); g.translate(p[0], p[1]); g.rotate(sw + (i % 2 ? 0.5 : -0.5)); g.fillStyle = i % 3 ? '#4a8a32' : '#3a7a2a'; g.beginPath(); g.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2); g.fill(); seg(g, [[0, 0], [r * 0.7, 0]], 3, alpha('#2a5a1a', 0.8)); g.restore(); }
  if (k > 0.8) for (let i = 0; i < 2; i++) { const p = pts[10 + i * 10], a = ease.outBack(prog(k, 0.8, 1)); g.fillStyle = '#e8a030'; g.beginPath(); g.ellipse(p[0], p[1] + 50 * s, 34 * s * a, 28 * s * a, 0, 0, Math.PI * 2); g.fill(); }
}
function nightSea(g, t) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#02030a', '#0a1020', '#04101e']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.stars(g, t, { count: 160, area: [0, 0, E.W, E.H * 0.5] }); FX.moon(g, E.W * 0.7, E.H * 0.2, V(40, 46)); g.fillStyle = '#030a16'; g.fillRect(-E.W, E.H * 0.55, E.W * 3, E.H); waterSurface(g, t, E.H * 0.55, 0.4); }
function darkCard(g, t, info, n, label) { const a = fadeIn(t, 0.05, 0.3); text(g, String(n), E.W / 2, E.H * V(0.2, 0.2), { size: V(220, 240), color: alpha('#ffffff', 0.18), font: FONTS.title, alpha: a }); big(g, label, E.H * V(0.3, 0.3), '#e8eef8', a, V(80, 84)); }

// w01 — title
registerShot('w01', { draw(g, t, info) {
  fishInside(g, t, 0.4); veil(g, '#000', 0.3);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI YUNUS', 'PART 3'], dur: info.dur + 0.5, y: E.H * 0.42 });
  const a = fadeIn(t, 0.6, 0.5) * (1 - prog(t, info.dur - 0.3, info.dur)); text(g, 'DOA DARI TIGA KEGELAPAN', E.W / 2, E.H * 0.42 + V(130, 150), { size: V(52, 48), color: HOLY, font: FONTS.title, glow: 22, glowColor: 'rgba(255,220,140,.7)', spacing: 3, alpha: a });
} });
// w02 — "Nabi Yunus tidak mati… ia hidup… di dalam perut ikan."
registerShot('w02', { draw(g, t, info) {
  fishInside(g, t, 0.5 + 0.3 * Math.sin(t * 2));
  const wake = ease.out(prog(t, 0.6, 2.0));
  person(g, { x: E.W / 2 + (wake > 0.5 ? 0 : 150), y: E.H * 0.84, s: V(1.2, 1.3), facing: 1, outfit: YUNUS, rot: wake > 0.5 ? 0 : -Math.PI / 2, pose: wake > 0.5 ? breathe(SITHUG, t) : POSES.lie, expr: wake > 0.5 ? 'surprised' : 'sleepy', rim: { color: '#ff9a6a', dir: [0, -1], w: 4 } });
  big(g, 'MASIH HIDUP', E.H * V(0.22, 0.22), HOLY, fadeIn(t, wt('hidup…', 6, info) - 0.2), V(90, 96));
} });
// w03–w05 — three darknesses
registerShot('w03', { draw(g, t, info) { nightSea(g, t); darkCard(g, t, info, 1, 'GELAPNYA MALAM'); } });
registerShot('w04', { draw(g, t, info) { underwater(g, t, 0.9); bigFish(g, E.W * 0.55 + t * 30, E.H * 0.6, V(1.1, 1.0), -1, t, { color: '#0c1a2c', belly: '#1a2a3a', eye: '#ffd040', rim: '#4a7aaa' }); darkCard(g, t, info, 2, 'GELAPNYA LAUTAN'); } });
registerShot('w05', { draw(g, t, info) { fishInside(g, t, 0.15); veil(g, '#000', 0.25); person(g, { x: E.W / 2, y: E.H * 0.84, s: V(1.0, 1.1), facing: 1, outfit: YUNUS, pose: breathe(SITHUG, t), expr: 'sad', dim: true }); darkCard(g, t, info, 3, 'GELAPNYA PERUT IKAN'); } });
// w06 — "Tiga kegelapan… dan ia sendirian." nested darkness rings closing in on a tiny figure
registerShot('w06', { draw(g, t, info) {
  g.fillStyle = '#000'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const cx = E.W / 2, cy = E.H * 0.55, k = ease.inOut(prog(t, 0, 2.2));
  [['#0a1020', 1], ['#04101e', 0.68], ['#1a0a10', 0.4]].forEach(([c, r], i) => { const R = E.W * r * lerp(1.4, 0.9, k); g.fillStyle = c; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill(); ring(g, cx, cy, R, alpha('#ffffff', 0.12), 3); });
  person(g, { x: cx, y: cy + 70, s: 0.55, facing: 1, outfit: YUNUS, pose: breathe(SITHUG, t), expr: 'sad', rim: { color: '#ff9a6a', dir: [0, -1], w: 3 }, shadow: false });
  big(g, 'TIGA KEGELAPAN', E.H * V(0.14, 0.14), '#e8eef8', fadeIn(t, 0.1), V(80, 84));
  small(g, 'SENDIRIAN', E.H * V(0.88, 0.88), alpha('#c8d0e0', 1), fadeIn(t, wt('sendirian.', 15.5, info) - 0.1));
} });
// w07 — "menyadari kesalahannya… hati yang hancur, ia berdoa"
registerShot('w07', { draw(g, t, info) {
  fishInside(g, t, 0.3); veil(g, '#000', 0.2);
  const pray = wt('berdoa:', 21.5, info);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.02 * t), { outfit: YUNUS, expr: t > pray - 0.3 ? 'cry' : 'sad', look: t > pray - 0.3 ? [0, -0.5] : [0, 0.3], rimColor: '#ff9a6a', rimSide: -1 });
  small(g, 'MENYADARI KESALAHANNYA', E.H * V(0.15, 0.15), '#ffffff', fadeIn(t, 0.6) * (1 - prog(t, pray - 0.5, pray - 0.1)));
} });
// w08 — the du'a (Arabic): sujud in the dark, light begins
registerShot('w08', { draw(g, t, info) {
  fishInside(g, t, 0.3 + 0.4 * prog(t, 0, info.dur)); const k = prog(t, 0, info.dur);
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 9, angle: Math.PI / 2, spread: 0.5, len: E.H * 1.2, color: HOLY, a: 0.08 * k, t });
  person(g, { x: E.W / 2 - 40, y: E.H * 0.84, s: V(1.3, 1.4), facing: 1, outfit: YUNUS, pose: SUJUD, expr: 'sad', rim: { color: HOLY, dir: [0, -1], w: 4 * (0.4 + k) } });
  for (let i = 0; i < 10; i++) { const p = ((t * 0.3 + i / 10) % 1); FX.sparkle(g, E.W / 2 + Math.sin(i * 2.3) * 200, E.H * 0.75 - p * E.H * 0.6, 10, HOLY, 0.6 * (1 - p) * k); }
  small(g, 'DOA NABI YUNUS', E.H * V(0.15, 0.15), HOLY, fadeIn(t, 0.2)); small(g, 'QS. AL-ANBIYA: 87', E.H * V(0.2, 0.2), alpha('#ffffff', 0.7), fadeIn(t, 0.5), V(38, 40));
} });
// w09 — translation: "Tidak ada Tuhan selain Engkau…" light fills
registerShot('w09', { draw(g, t, info) {
  fishInside(g, t, 0.8); const k = prog(t, 0, info.dur);
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 11, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.3, color: HOLY, a: 0.08 + 0.08 * k, t });
  person(g, { x: E.W / 2, y: E.H * 0.84, s: V(1.3, 1.4), facing: 1, outfit: YUNUS, pose: t < wt('Sungguh,', 31, info) ? breathe(KNEEL_UP, t) : SUJUD, expr: 'sad', look: [0, -0.6], rim: { color: HOLY, dir: [0, -1], w: 6 } });
  const lines = [['TIDAK ADA TUHAN', 'Tidak', 28], ['SELAIN ENGKAU', 'Tidak', 28], ['MAHASUCI ENGKAU', 'Mahasuci', 30], ['AKU TERMASUK', 'Sungguh,', 31], ['ORANG YANG ZALIM', 'Sungguh,', 31]];
  lines.forEach(([s, w, af], i) => { const at = wt(w, af, info) + (i % 2 && i !== 2 ? 0.5 : 0); text(g, s, E.W / 2, E.H * V(0.12, 0.12) + i * V(78, 80), { size: V(58, 60), color: i === 4 ? '#ffd9a0' : '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', glow: 14, glowColor: alpha(HOLY, 0.6), alpha: fadeIn(t, at - 0.1) }); });
} });
// w10 — "Allah mendengar doanya." light pierces down through the sea onto the fish (light only)
registerShot('w10', { draw(g, t, info) {
  underwater(g, t, 0.5); const k = ease.out(prog(t, 0, 1.2));
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, 0, 0, E.H, [alpha(HOLY, 0.6 * k), alpha(HOLY, 0.05)]); g.beginPath(); g.moveTo(E.W * 0.4, 0); g.lineTo(E.W * 0.6, 0); g.lineTo(E.W * 0.85, E.H); g.lineTo(E.W * 0.15, E.H); g.closePath(); g.fill(); g.restore();
  bigFish(g, E.W * 0.5, E.H * 0.62, V(1.0, 0.95), -1, t, { color: '#1a3048', belly: '#3a5068', eye: '#ffd040', rim: HOLY });
  glow(g, E.W / 2, E.H * 0.1, E.W * 0.5, HOLY, 0.5 * k);
} });
// w11 — "Ikan itu memuntahkannya ke daratan yang tandus."
registerShot('w11', { draw(g, t, info) {
  const { GY, CX, M } = shore(g, t, { z: 1.05 }, { mood: 'dawn', calm: 1 });
  bigFish(g, CX + V(330, 260), GY - V(30, 40), V(0.8, 0.7), -1, t, { color: '#1a3048', belly: '#4a6078', eye: '#ffd040', rim: M.rim });
  const p = ease.out(prog(t, 0.6, 1.6)), x = lerp(CX + V(80, 60), CX - V(220, 180), p), y = lerp(GY - 20, GY + V(150, 180), p) - Math.sin(p * Math.PI) * 220;
  if (t > 0.6) person(g, { x, y, s: V(1.2, 1.25), rot: p < 1 ? -p * 3 : Math.PI / 2, facing: -1, outfit: YUNUS, pose: p < 1 ? POSES.fall : POSES.lie, expr: 'sleepy', rim: { color: M.rim, dir: [1, -0.4], w: 4 } });
  if (p > 0.95) FX.dust(g, CX - V(220, 180), GY + V(160, 190), t - 1.6, { count: 14, color: '#d8b890' });
} });
// w12 — "Tubuhnya lemah… sakit… tak berdaya." lying on barren sand under harsh sun
registerShot('w12', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.1 + 0.03 * t }, { mood: 'golden', sunX: V(200, 100) });
  person(g, { x: CX + 160, y: GY + V(120, 150), s: V(1.5, 1.6), rot: -Math.PI / 2, facing: 1, outfit: YUNUS, pose: breathe(POSES.lie, t, 0.6), expr: 'sleepy', rim: { color: M.rim, dir: [0, -1], w: 4 } });
  ['LEMAH', 'SAKIT', 'TAK BERDAYA'].forEach((s, i) => small(g, s, E.H * V(0.2 + i * 0.06, 0.2 + i * 0.06), i === 2 ? '#ffb070' : '#ffffff', fadeIn(t, wt(['lemah…', 'sakit…', 'tak'][i], 40, info) - 0.1)));
} });
// w13 — the pumpkin plant grows and shades him until he recovers
registerShot('w13', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.1 }, { mood: 'golden', sunX: V(200, 100) });
  const k = ease.inOut(prog(t, 0.3, 2.4)), heal = ease.out(prog(t, wt('pulih.', 46, info) - 0.6, wt('pulih.', 46, info) + 0.6));
  g.fillStyle = alpha('#1a1008', 0.35 * k); g.beginPath(); g.ellipse(CX, GY + V(150, 180), 300, 50, 0, 0, Math.PI * 2); g.fill();
  person(g, { x: CX + (heal > 0.5 ? 0 : 160), y: GY + V(120, 150), s: V(1.5, 1.6), rot: heal > 0.5 ? 0 : -Math.PI / 2, facing: 1, outfit: YUNUS, pose: heal > 0.5 ? breathe(POSES.sit, t) : breathe(POSES.lie, t, 0.6), expr: heal > 0.5 ? 'smile' : 'sleepy', rim: { color: M.rim, dir: [0, -1], w: 4 } });
  labu(g, CX, GY + V(160, 190), V(1.25, 1.3), k, t);
  small(g, 'POHON LABU', E.H * V(0.16, 0.16), '#c8f0a0', fadeIn(t, wt('labu', 44.5, info) - 0.1) * (1 - prog(t, info.dur - 0.3, info.dur)));
} });
// w14 — "Dan inilah kejutannya…"
registerShot('w14', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a0a20', '#05030a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.rings(g, E.W / 2, E.H * 0.45, t, { count: 4, r0: 60, r1: 500, color: GOLD(), a: 0.3 });
  const a = ease.outBack(prog(t, 0.15, 0.5)); big(g, 'KEJUTANNYA…', E.H * 0.45, GOLD(), a, V(110, 120) * (0.9 + 0.1 * a));
} });
// w15 — "kaumnya melihat tanda-tanda azab mendekat."
registerShot('w15', { draw(g, t, info) {
  const { GY, CX } = city(g, t, { z: 1.15 }, { mood: 'pharaoh' });
  FX.clouds(g, { seed: 4, count: 9, y: E.H * 0.02, h: 260, color: '#200004', a: 0.6 }); if (t > 1.5) FX.lightning(g, { x1: E.W * 0.7, y1: 0, x2: E.W * 0.6, y2: E.H * 0.3, seed: Math.floor(t * 3), color: '#ffb0a0' });
  veil(g, '#200004', 0.2);
  crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.4, 1.45), t, { facing: () => 1, pose: () => POSES.handsOnHead, expr: () => 'scared', rim: { color: '#ff4a3a', dir: [0, -1], w: 4 } });
  small(g, 'TANDA AZAB', E.H * V(0.13, 0.13), '#ff6a4a', fadeIn(t, wt('azab', 52, info) - 0.2), V(64, 66));
} });
// w16 — "ketakutan… lalu bertobat beramai-ramai."
registerShot('w16', { draw(g, t, info) {
  const { GY, CX } = city(g, t, { z: 1.15 }, { mood: 'dusk' }); FX.clouds(g, { seed: 4, count: 9, y: E.H * 0.02, h: 260, color: '#200004', a: 0.4 });
  const sj = t > wt('bertobat', 54.5, info) - 0.2;
  crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.3, 1.35), t, { facing: () => 1, pose: () => (sj ? SUJUD : KNEEL_UP), expr: () => (sj ? 'sad' : 'scared') , n: 6, rim: { color: '#ffc890', dir: [0, -1], w: 4 } });
  big(g, 'BERTOBAT', E.H * V(0.15, 0.14), '#ffffff', fadeIn(t, wt('bertobat', 54.5, info) - 0.1), V(90, 96));
} });
// w17 — "Dan Allah… mengangkat azab itu dari mereka." clouds part, light (Allah not depicted)
registerShot('w17', { draw(g, t, info) {
  const { GY, CX } = city(g, t, { z: 1.15 }, { mood: 'golden' }); const k = ease.inOut(prog(t, 0.6, 2.4));
  FX.clouds(g, { seed: 4, count: 9, y: E.H * 0.02 - k * 500, h: 260, color: '#200004', a: 0.4 * (1 - k) });
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 11, angle: Math.PI / 2, spread: 0.8, len: E.H * 1.2, color: HOLY, a: 0.12 * k, t });
  crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.3, 1.35), t, { facing: () => 1, pose: () => (k > 0.5 ? KNEEL_UP : SUJUD), expr: () => (k > 0.5 ? 'happy' : 'sad'), rim: { color: HOLY, dir: [0, -1], w: 4 } });
  small(g, 'AZAB DIANGKAT', E.H * V(0.14, 0.13), HOLY, fadeIn(t, wt('mengangkat', 58, info) - 0.1), V(64, 66));
} });
// w18 — "Saat Nabi Yunus kembali… seratus ribu orang lebih menyambutnya… dalam keadaan beriman."
registerShot('w18', { draw(g, t, info) {
  const { GY, CX, M } = city(g, t, { z: 1.12, x: -10 * t }, { mood: 'golden' });
  person(g, { x: CX - V(380, 330) + Math.min(t, 2.2) * 70, y: GY + V(150, 180), s: V(1.45, 1.5), facing: 1, outfit: YUNUS, pose: t < 2.2 ? walkPose(t * 5) : breathe(POSES.wave, t), expr: 'happy', staff: true, rim: { color: M.rim, dir: [1, -0.4], w: 4 } });
  crowd(g, CX - V(40, 60), V(150, 110), GY + 60, V(1.15, 1.2), t, { n: 4, facing: () => -1, pose: (i) => (i % 2 ? POSES.cheer : POSES.wave), expr: () => 'happy', rim: { color: M.rim, dir: [-1, -0.4], w: 4 } });
  const c = Math.round(100000 * ease.out(prog(t, wt('seratus', 61.5, info) - 0.1, wt('menyambutnya…', 63, info)))).toLocaleString('id-ID');
  if (t > wt('seratus', 61.5, info) - 0.2) big(g, c + '+', E.H * V(0.15, 0.14), GOLD(), 1, V(110, 116));
  small(g, 'ORANG BERIMAN', E.H * V(0.21, 0.2), '#ffffff', fadeIn(t, wt('beriman.', 65, info) - 0.2));
} });
// w19 — "Hikmahnya… sedalam apa pun kegelapan… pintu tobat selalu terbuka."
registerShot('w19', { draw(g, t, info) {
  g.fillStyle = '#030306'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const open = ease.inOut(prog(t, wt('pintu', 70.5, info) - 0.3, wt('terbuka.', 71.8, info) + 0.3)), dx = E.W / 2, dy = E.H * 0.6, dw = V(260, 280), dh = V(520, 560);
  glow(g, dx, dy - dh / 2, dw * 2.5, HOLY, 0.35 * open); g.fillStyle = alpha(HOLY, 0.15 + 0.85 * open); g.fillRect(dx - dw / 2, dy - dh, dw, dh);
  g.fillStyle = '#2a1a10'; g.save(); g.translate(dx - dw / 2, dy - dh); g.scale(1 - 0.85 * open, 1); g.fillRect(0, 0, dw, dh); g.restore();
  g.fillStyle = alpha(HOLY, 0.3 * open); g.beginPath(); g.moveTo(dx - dw / 2, dy); g.lineTo(dx + dw / 2, dy); g.lineTo(dx + dw * 1.4, E.H); g.lineTo(dx - dw * 1.4, E.H); g.closePath(); g.fill();
  person(g, { x: dx, y: E.H * 0.92, s: V(1.0, 1.1), facing: 1, outfit: YUNUS, pose: breathe(POSES.stand, t), expr: 'neutral', dim: true, rim: { color: HOLY, dir: [0, -1], w: 4 * open } });
  small(g, 'HIKMAH', E.H * V(0.12, 0.12), GOLD(), fadeIn(t, 0.1));
  big(g, 'PINTU TOBAT', E.H * V(0.19, 0.19), '#ffffff', fadeIn(t, wt('pintu', 70.5, info) - 0.1), V(84, 88)); big(g, 'SELALU TERBUKA', E.H * V(0.25, 0.25), HOLY, fadeIn(t, wt('terbuka.', 71.8, info) - 0.1), V(84, 88));
} });
// w20 — "jangan pernah putus asa berdakwah… hidayah adalah milik Allah."
registerShot('w20', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.08 }, { mood: 'golden', sunX: V(-200, -120) });
  labu(g, CX + V(260, 200), GY + V(60, 80), V(0.7, 0.75), 1, t);
  person(g, { x: CX - V(120, 80), y: GY + V(150, 180), s: V(1.5, 1.55), facing: 1, outfit: YUNUS, pose: breathe(POSES.pointUp, t), expr: 'smile', staff: true, rim: { color: M.rim, dir: [-1, -0.4], w: 4 } });
  small(g, 'JANGAN PUTUS ASA BERDAKWAH', E.H * V(0.13, 0.13), '#ffffff', fadeIn(t, wt('putus', 73.5, info) - 0.2), V(48, 50));
  big(g, 'HIDAYAH MILIK ALLAH', E.H * V(0.2, 0.2), GOLD(), fadeIn(t, wt('hidayah', 75, info) - 0.1), V(70, 72));
} });
// w21 — "Ikuti terus kisah para nabi selanjutnya!"
registerShot('w21', { draw(g, t, info) {
  fishInside(g, t, 0); g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a1408', '#05030a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 9, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.2, color: HOLY, a: 0.08, t });
  big(g, 'IKUTI TERUS', E.H * V(0.3, 0.3), '#ffffff', ease.outBack(prog(t, 0.1, 0.5)), V(96, 100));
  big(g, 'KISAH PARA NABI', E.H * V(0.37, 0.37), GOLD(), ease.outBack(prog(t, 0.4, 0.8)), V(84, 88));
  commentPrompt(g, Math.max(0, t - 0.9), ['NABI SIAPA', 'SELANJUTNYA?'], { y: E.H * V(0.56, 0.54) });
  text(g, 'E-DAYzz', E.W / 2, E.H * 0.92, { size: V(48, 50), color: alpha('#ffffff', 0.8), font: FONTS.title, spacing: 4, alpha: fadeIn(t, 1.4) });
} });
