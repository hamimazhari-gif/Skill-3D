// shots/fatih1.js — Muhammad Al-Fatih, Part 1 (f01–f10).
import { E, V, S, registerShot, layer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { palace, throne } from '../sets/egypt.js';
import { waterSurface } from '../sets/sea.js';
import { horse } from '../lib3/_army.js';
import { GOLD } from '../lib/_costume.js';
import { skyline, walls, galley, personH, bigPersonH, hat, shadeHex, ottoPalace } from '../lib10/_konst.js';
import { FATIH, FATIH_KID, GURU, OTTO, ROMAN } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff4a3a', OTRED = '#c8303a';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const pop = (t, a) => ease.outBack(prog(t, a - 0.1, a + 0.3));
const PAL = {
  night: { sky: ['#03050f', '#141a38', '#2a2a4a'], sea: ['#0e1a30', '#040810'], city: '#0a0c18', wall: '#5a5868', rim: '#9ab0e0' },
  golden: { sky: ['#5a3a6a', '#e88a50', '#f8c890'], sea: ['#3a5a7a', '#102030'], city: '#3a2430', wall: '#b89070', rim: '#ffd08a' },
  dusk: { sky: ['#1a1030', '#6a2a4a', '#d86a4a'], sea: ['#2a2a4a', '#0a0a18'], city: '#1a1020', wall: '#8a6a6a', rim: '#ff9a6a' },
};
function sky(g, P, hy) { g.fillStyle = linGrad(g, 0, 0, 0, hy, P.sky); g.fillRect(-E.W, -E.H, E.W * 3, hy + E.H); }
function city(g, t, P, o = {}) {
  const hy = E.H * (o.hy ?? 0.5); sky(g, P, hy);
  if (o.stars) { FX.stars(g, t, { count: 180, area: [0, 0, E.W, hy * 0.8] }); FX.moon(g, E.W * 0.78, E.H * 0.12, V(40, 46)); }
  if (o.sun) FX.sun(g, E.W * 0.25, hy - V(140, 200), V(70, 80), '#fff3dc', '#ffb070', 4);
  skyline(g, hy, o.s ?? 1, P.city, { lights: o.stars });
  g.fillStyle = linGrad(g, 0, hy, 0, E.H, ['#2a2030', '#120c14']); g.fillRect(-E.W, hy, E.W * 3, E.H);
  if (o.walls !== false) walls(g, hy + V(220, 300) * (o.ws ?? 1), o.ws ?? 1, P.wall, o.k);
  return hy;
}
const soldier = (g, t, x, y, s, f, of, kind, o = {}) => personH(g, { x, y, s, facing: f, outfit: of, pose: o.pose || (o.walk ? walkPose(t * 4 + x * 0.01) : breathe(POSES.stand, t, 1, x)), expr: o.expr || 'neutral', spear: o.spear, rim: o.rim, dim: o.dim }, kind);

// f01 — "Selama lebih dari seribu tahun… satu kota yang tak pernah berhasil ditaklukkan." + title
registerShot('f01', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1.1 - 0.06 * k, 1.1 - 0.06 * k); g.translate(-E.W / 2, -E.H / 2);
  city(g, t, PAL.night, { stars: true }); g.restore(); veil(g, '#02030a', 0.35);
  UI.titleCard(g, t + 0.25, { lines: ['MUHAMMAD AL-FATIH', 'PART 1'], dur: 3.2, y: E.H * 0.3 });
  const yrs = Math.round(1000 * ease.out(prog(t, 0.6, wt('tahun…', 1.3, info) + 0.3)));
  if (t > 3.3) { big(g, '1.000+', E.H * V(0.22, 0.22), GOLD(), fadeIn(t, 3.3), V(130, 140)); small(g, 'TAHUN TAK TERTAKLUKKAN', E.H * V(0.29, 0.29), '#ffffff', fadeIn(t, wt('ditaklukkan.', 4.4, info) - 0.3), V(46, 48)); }
} });
// f02 — "Banyak pasukan datang. Semuanya pulang… dengan kekalahan."
registerShot('f02', { draw(g, t, info) {
  const hy = city(g, t, PAL.dusk, { hy: 0.42, ws: 1.1 });
  const back = t > wt('Semuanya', 7.4, info) - 0.2, ph = back ? ease.inOut(prog(t, wt('Semuanya', 7.4, info) - 0.2, info.dur)) : 0;
  for (let i = 0; i < 7; i++) { const x = (back ? E.W * 0.6 - ph * E.W * 0.9 : -E.W * 0.3 + t * 260) + i * V(120, 100) - (i % 2) * 30, y = E.H * 0.9 + (i % 3) * 22; personH(g, { x, y, s: V(1.0, 1.05), facing: back ? -1 : 1, outfit: { top: 'dress', color: '#000', head: 'none' }, pose: walkPose(t * (back ? 2.5 : 4) + i), expr: back ? 'sad' : 'angry', dim: true, spear: !back, rim: { color: '#ff9a6a', dir: [0, -1], w: 3 } }, 'helmet'); }
  if (back) big(g, 'KALAH', E.H * V(0.13, 0.13), RED, fadeIn(t, wt('kekalahan.', 9, info) - 0.1), V(120, 126));
} });
// f03 — "Kota itu bernama Konstantinopel. Ibu kota Kekaisaran Romawi Timur."
registerShot('f03', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)); g.save(); g.translate(E.W / 2, E.H * 0.5); g.scale(1.0 + 0.08 * k, 1.0 + 0.08 * k); g.translate(-E.W / 2, -E.H * 0.5);
  const hy = city(g, t, PAL.golden, { sun: true, s: 1.25, walls: false, hy: 0.55 }); g.fillStyle = linGrad(g, 0, hy, 0, E.H, PAL.golden.sea); g.fillRect(-E.W, hy, E.W * 3, E.H); waterSurface(g, t, hy, 0.5); g.restore();
  big(g, 'KONSTANTINOPEL', E.H * V(0.14, 0.14), GOLD(), pop(t, wt('Konstantinopel.', 11.5, info)), V(88, 92));
  small(g, 'IBU KOTA ROMAWI TIMUR', E.H * V(0.2, 0.2), '#ffffff', fadeIn(t, wt('Ibu', 13.3, info) - 0.1));
} });
// f04 — "dilindungi tembok berlapis yang tebal dan menjulang."
registerShot('f04', { draw(g, t, info) {
  const P = PAL.golden, k = (i) => ease.outBack(prog(t, 0.3 + i * 0.5, 1.0 + i * 0.5));
  const hy = E.H * 0.3; sky(g, P, hy + 200); skyline(g, hy, 0.7, P.city);
  g.fillStyle = linGrad(g, 0, hy, 0, E.H, ['#6a4a3a', '#2a1a14']); g.fillRect(-E.W, hy, E.W * 3, E.H);
  walls(g, E.H * 0.8, 1.6, P.wall, [k(0), k(1), k(2)]);
  g.fillStyle = alpha('#4a7aa8', 0.8); g.fillRect(-E.W, E.H * 0.82, E.W * 3, E.H * 0.04);
  ['TEMBOK BERLAPIS', 'TEBAL', 'MENJULANG'].forEach((s, i) => small(g, s, E.H * V(0.08 + i * 0.055, 0.08 + i * 0.055), i ? '#ffffff' : GOLD(), fadeIn(t, wt(['tembok', 'tebal', 'menjulang.'][i], 16.7 + i, info) - 0.1), V(56, 58)));
} });
// f05 — "Di sisi lain, laut. Di teluknya, Tanduk Emas, rantai raksasa yang menghalangi kapal mana pun untuk masuk."
registerShot('f05', { draw(g, t, info) {
  const P = PAL.golden, hy = E.H * 0.38; sky(g, P, hy); skyline(g, hy, 0.85, P.city);
  g.fillStyle = linGrad(g, 0, hy, 0, E.H, P.sea); g.fillRect(-E.W, hy, E.W * 3, E.H); waterSurface(g, t, hy, 0.5);
  const ch = ease.inOut(prog(t, wt('rantai', 23.5, info) - 0.5, wt('rantai', 23.5, info) + 0.6)), cy = E.H * 0.6;
  g.fillStyle = shadeHex(P.wall, -0.3); g.fillRect(-20, cy - 260, 120, 300); g.fillRect(E.W - 100, cy - 260, 120, 300);
  if (ch > 0) { const x1 = lerp(80, E.W - 80, ch); for (let x = 80; x < x1; x += 34) { const y = cy + Math.sin(((x - 80) / (E.W - 160)) * Math.PI) * 60; g.strokeStyle = '#2a2420'; g.lineWidth = 9; g.beginPath(); g.ellipse(x, y, 18, 11, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = alpha('#c8a060', 0.6); g.lineWidth = 2; g.stroke(); } }
  const sx = lerp(E.W * 0.5, E.W * 0.5, 0), stop = wt('menghalangi', 24.6, info), bump = t > stop ? Math.sin((t - stop) * 10) * Math.exp(-(t - stop) * 3) * 20 : 0;
  galley(g, E.W * 0.5 + bump, E.H * 0.82 - Math.min(t, stop) * 30, V(0.9, 0.85), 1, t, '#2a1a10', OTRED);
  small(g, 'LAUT', E.H * V(0.1, 0.1), '#a8e0ff', fadeIn(t, 0.2)); big(g, 'TANDUK EMAS', E.H * V(0.16, 0.16), GOLD(), fadeIn(t, wt('Tanduk', 22.4, info) - 0.1), V(84, 88));
  small(g, 'RANTAI RAKSASA', E.H * V(0.92, 0.92), '#ffffff', fadeIn(t, wt('rantai', 23.5, info) - 0.1), V(56, 58));
} });
// f06 — the hadith (Rasulullah ﷺ not depicted; text only)
registerShot('f06', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a1208', '#0a0604']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.45, E.W * 0.7, '#ffd27a', 0.2);
  const pw = V(900, 920), ph = V(900, 1100), px = E.W / 2 - pw / 2, py = E.H * 0.47 - ph / 2, a = fadeIn(t, 0.1, 0.6);
  g.globalAlpha = a; rr(g, px, py, pw, ph, 30); g.fillStyle = '#e8d8b0'; g.fill(); g.strokeStyle = '#a8884a'; g.lineWidth = 8; g.stroke(); g.globalAlpha = 1;
  const L = [['"KONSTANTINOPEL', 'Konstantinopel', 31.5, 0], ['PASTI AKAN', 'pasti', 32.4, 0], ['DITAKLUKKAN.', 'ditaklukkan.', 33.3, 1], ['SEBAIK-BAIK PEMIMPIN', 'Sebaik-baik', 34.7, 0], ['ADALAH PEMIMPINNYA,', 'pemimpinnya,', 35.9, 0], ['SEBAIK-BAIK PASUKAN', 'sebaik-baik', 37.4, 0], ['ADALAH PASUKANNYA."', 'pasukannya.', 38.7, 0]];
  L.forEach(([s, w, af, hl], i) => text(g, s, E.W / 2, py + V(110, 140) + i * V(105, 125), { size: V(58, 60), color: hl ? '#8a1e1e' : '#2a1a0a', font: FONTS.title, alpha: fadeIn(t, wt(w, af, info) - 0.15) }));
  small(g, 'HR. AHMAD', py + ph + V(70, 80), GOLD(), fadeIn(t, 3.0), V(40, 42));
  small(g, 'DIINGAT UMAT ISLAM', E.H * V(0.08, 0.08), '#ffffff', fadeIn(t, 0.2) * (1 - prog(t, 3, 3.4)), V(46, 48));
} });
// f07 — "Ratusan tahun berlalu… lalu lahirlah seorang anak bernama Muhammad."
registerShot('f07', { draw(g, t, info) {
  const born = wt('lahirlah', 42.8, info);
  if (t < born - 0.2) { g.fillStyle = '#05040a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); const yr = Math.round(lerp(650, 1432, ease.inOut(prog(t, 0, born - 0.3)))); big(g, String(yr), E.H * 0.45, GOLD(), 1, V(170, 180)); small(g, 'RATUSAN TAHUN BERLALU…', E.H * 0.55, '#ffffff', fadeIn(t, 0.2), V(46, 48)); return; }
  const { GY, CX, M } = ottoPalace(g, t);
  personH(g, { x: CX, y: GY + V(170, 200), s: V(1.6, 1.7), facing: 1, outfit: FATIH_KID, pose: breathe(POSES.stand, t), expr: 'smile', rim: { color: M.rim, dir: [0, -1], w: 4 } }, 'turban');
  big(g, 'MUHAMMAD', E.H * V(0.15, 0.15), GOLD(), pop(t, wt('Muhammad.', 43.8, info)), V(120, 126));
} });
// f08 — "Sejak kecil, gurunya terus berbisik: Engkaulah yang akan menaklukkan kota itu."
registerShot('f08', { draw(g, t, info) {
  const { GY, CX, M } = ottoPalace(g, t, { sun: false, pal: { sky: ['#1a1030', '#5a2a4a', '#c86a4a'], wall: '#3a2a3a', floor: '#2a1a1a', rim: '#ffb070' } });
  const cityA = fadeIn(t, wt('Engkaulah', 48.2, info) - 0.2, 0.8);
  if (cityA > 0) { g.globalAlpha = cityA; glow(g, CX, GY - V(450, 640), 300, '#ffd27a', 0.3); g.globalAlpha = 1; }
  personH(g, { x: CX - V(170, 130), y: GY + V(190, 220), s: V(1.6, 1.7), facing: 1, outfit: GURU, pose: breathe({ ...POSES.point, hF: [80, -230] }, t), expr: 'smile', talk: Math.max(0, 0.4 * Math.sin(t * 10)), rim: { color: M.rim, dir: [1, -0.4], w: 4 } }, 'guru');
  personH(g, { x: CX + V(120, 100), y: GY + V(200, 230), s: V(1.6, 1.7), facing: -1, outfit: FATIH_KID, pose: breathe(POSES.stand, t), expr: 'surprised', look: [0.6, -0.4], rim: { color: M.rim, dir: [-1, -0.4], w: 4 } }, 'turban');
  small(g, '"ENGKAULAH', E.H * V(0.12, 0.12), '#ffffff', fadeIn(t, wt('Engkaulah', 48.2, info) - 0.1), V(60, 62));
  small(g, 'YANG AKAN MENAKLUKKANNYA"', E.H * V(0.18, 0.18), GOLD(), fadeIn(t, wt('menaklukkan', 49.6, info) - 0.1), V(48, 50));
} });
// f09 — "Di usia 19 tahun… ia menjadi Sultan Utsmani."
registerShot('f09', { draw(g, t, info) {
  const { GY, CX, M } = ottoPalace(g, t, { divan: true });
  for (const sx of [-1, 1]) { g.fillStyle = OTRED; g.fillRect(CX + sx * V(380, 300) - 50, GY - V(560, 700), 100, V(380, 480)); circle(g, CX + sx * V(380, 300) + 8, GY - V(420, 530), 26, '#f4efe2'); circle(g, CX + sx * V(380, 300) + 16, GY - V(420, 530), 22, OTRED); }
  personH(g, { x: CX, y: GY - 40, s: V(1.6, 1.7), facing: 1, outfit: FATIH, pose: breathe(POSES.sit, t), expr: 'neutral', rim: { color: M.rim, dir: [0, -1], w: 4 } }, 'sultan');
  big(g, '19 TAHUN', E.H * V(0.13, 0.13), '#ffffff', pop(t, wt('sembilan', 52.2, info)), V(110, 116));
  small(g, 'SULTAN UTSMANI', E.H * V(0.2, 0.2), GOLD(), fadeIn(t, wt('Sultan', 54, info) - 0.1), V(64, 66));
} });
// f10 — the oath
registerShot('f10', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a0606', '#0a0204']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  skyline(g, E.H * 0.97, 1.0, '#2a0c0c'); glow(g, E.W / 2, E.H * 0.9, E.W * 0.6, '#ff6a3a', 0.2);
  const sp = t > wt('Aku', 57.6, info) - 0.2;
  bigPersonH(g, E.W / 2, E.H * V(0.62, 0.58), V(290, 320), { outfit: FATIH, expr: sp ? 'angry' : 'neutral', talk: sp && t < info.dur - 1.2 ? Math.max(0, 0.6 * Math.sin(t * 12)) : 0, rimColor: '#ffb070', rimSide: -1 }, 'sultan');
  small(g, '"AKU YANG AKAN MENGAMBIL', E.H * V(0.065, 0.065), '#ffffff', fadeIn(t, wt('mengambil', 58.3, info) - 0.2), V(44, 46));
  big(g, 'KONSTANTINOPEL…', E.H * V(0.115, 0.115), GOLD(), fadeIn(t, wt('Konstantinopel…', 58.6, info) - 0.1), V(70, 72));
  small(g, 'ATAU KONSTANTINOPEL', E.H * V(0.86, 0.86), '#ffffff', fadeIn(t, wt('atau', 60, info) - 0.1), V(48, 50)); big(g, 'YANG MENGAMBILKU!"', E.H * V(0.915, 0.915), RED, fadeIn(t, wt('mengambilku!', 61.1, info) - 0.1), V(66, 68));
} });
