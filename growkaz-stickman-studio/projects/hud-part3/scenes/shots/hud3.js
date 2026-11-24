// shots/hud3.js — Kisah Nabi Hud, Part 3 (k01–k16).
import { E, V, S, registerShot, layer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert, blowingSand } from '../sets/desert.js';
import { person, bigPerson, palm, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { iram, adCrowd, column, STONE, shadeC } from '../lib9/_hud.js';
import { HUD, AD } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff4a3a', HEAT = '#ff9a3a';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const pop = (t, a) => ease.outBack(prog(t, a - 0.1, a + 0.3));
const BELIEVER = ['#e8e0cc', '#d8d0b8', '#ece4d0'].map((c, i) => ({ top: 'dress', color: c, head: i === 1 ? 'none' : 'hood', headColor: '#f4efe2' }));
function cracks(g, GY, k, seed = 3) { let s = seed; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); g.strokeStyle = alpha('#2a1408', 0.8); g.lineWidth = 4; for (let i = 0; i < 14; i++) { let x = r() * E.W, y = GY + 40 + r() * (E.H - GY - 60); g.beginPath(); g.moveTo(x, y); const n = Math.floor(6 * k); for (let j = 0; j < n; j++) { x += (r() - 0.5) * 140; y += (r() - 0.3) * 50; g.lineTo(x, y); } g.stroke(); } }
function deadPalm(g, x, y, s) { g.strokeStyle = '#3a2a1a'; g.lineWidth = 12 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20 * s, y - 150 * s, x + 10 * s, y - 280 * s); g.stroke(); for (let i = 0; i < 5; i++) { const a = Math.PI * (0.15 + i * 0.17); seg(g, [[x + 10 * s, y - 280 * s], [x + 10 * s + Math.cos(a) * 110 * s, y - 280 * s + 40 * s + Math.sin(a) * 60 * s]], 5 * s, '#5a4026'); } }
// the storm cloud wall: k = how far it has advanced (0 = off left, 1 = covers sky)
function cloudWall(g, t, k, GY) {
  const edge = lerp(-E.W * 0.6, E.W * 1.5, k);
  g.fillStyle = '#0a0608'; g.beginPath(); g.moveTo(-E.W, -E.H); g.lineTo(edge, -E.H); for (let y = -E.H; y <= GY; y += 40) g.lineTo(edge + Math.sin(y * 0.01 + t * 1.5) * 70 + Math.sin(y * 0.031) * 40 - (y / GY) * 120, y); g.lineTo(-E.W, GY); g.closePath(); g.fill();
  for (let i = 0; i < 6; i++) circle(g, edge - 60 + Math.sin(i * 1.7 + t) * 30, GY * (0.1 + i * 0.15), 90 + (i % 3) * 30, '#140c10');
}
function wind(g, t, n = 50, a = 0.35) { for (let i = 0; i < n; i++) { const y = (i * 67) % E.H, x = ((t * 1600 + i * 173) % (E.W * 1.6)) - E.W * 0.3; seg(g, [[x, y], [x - 160 - (i % 4) * 40, y + 10]], 3, alpha('#e8d8c0', a)); } }

// k01 — title
registerShot('k01', { draw(g, t, info) {
  const { GY } = desert(g, t, { z: 1.05 }, { mood: 'dusk' }); cloudWall(g, t, 0.55 + 0.03 * t, GY); veil(g, '#05030a', 0.45);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI HUD', 'PART 3'], dur: info.dur + 0.5, y: E.H * 0.4 });
  const a = fadeIn(t, 1.0, 0.5) * (1 - prog(t, info.dur - 0.3, info.dur));
  text(g, 'AWAN YANG TERNYATA', E.W / 2, E.H * 0.4 + V(130, 150), { size: V(50, 48), color: S().ui.accent, font: FONTS.title, glow: 22, glowColor: 'rgba(255,120,60,.7)', spacing: 3, alpha: a });
  text(g, 'BUKAN HUJAN', E.W / 2, E.H * 0.4 + V(195, 212), { size: V(50, 48), color: S().ui.accent, font: FONTS.title, glow: 22, glowColor: 'rgba(255,120,60,.7)', spacing: 3, alpha: a });
} });
// k02 — "kemarau panjang melanda negeri 'Ad."
registerShot('k02', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.08 + 0.02 * t }, { mood: 'golden', sunX: V(0, 0) }); veil(g, '#ff6a1a', 0.12);
  for (let i = 0; i < 8; i++) { const y = GY - 40 - i * 30; g.strokeStyle = alpha('#fff0d0', 0.06); g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= E.W; x += 20) g.lineTo(x, y + Math.sin(x * 0.02 + t * 4 + i) * 6); g.stroke(); }
  cracks(g, GY, prog(t, 0, info.dur));
  big(g, 'KEMARAU PANJANG', E.H * V(0.14, 0.14), HEAT, fadeIn(t, wt('kemarau', 5.5, info) - 0.1), V(84, 88));
} });
// k03 — "Tanah retak. Kebun mengering."
registerShot('k03', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.1 }, { mood: 'golden' }); veil(g, '#ff6a1a', 0.12);
  const dry = ease.inOut(prog(t, wt('Kebun', 9.5, info) - 0.2, info.dur));
  for (let i = 0; i < 5; i++) { const x = CX - V(480, 380) + i * V(240, 190), y = GY + V(150, 190) + (i % 2) * 30; if (dry < 0.5) palm(g, x, y, 0.55, '#1e3a18', t, i); else deadPalm(g, x, y, 0.55); }
  cracks(g, GY, 1);
  small(g, 'TANAH RETAK', E.H * V(0.12, 0.12), '#ffffff', fadeIn(t, 0.05)); small(g, 'KEBUN MENGERING', E.H * V(0.18, 0.18), HEAT, fadeIn(t, wt('Kebun', 9.5, info) - 0.1));
} });
// k04 — "Mereka menunggu hujan… berhari-hari." day counter, sun racing across
registerShot('k04', { draw(g, t, info) {
  const day = Math.floor(t * 1.6) + 1, ph = (t * 1.6) % 1;
  const { GY, CX, M } = desert(g, t, { z: 1.1 }, { mood: ph > 0.85 ? 'dusk' : 'golden', sunX: lerp(-V(500, 400), V(500, 400), ph) }); veil(g, '#ff6a1a', 0.1);
  cracks(g, GY, 1, 5);
  adCrowd(g, CX - V(420, 340), V(280, 230), GY + V(170, 200), V(1.8, 1.9), t, { n: 4, pose: () => POSES.stand, expr: () => 'sad', rim: { color: M.rim, dir: [0, -1], w: 4 } });
  small(g, 'MENUNGGU HUJAN…', E.H * V(0.12, 0.12), '#ffffff', fadeIn(t, 0.1)); big(g, 'HARI KE-' + day, E.H * V(0.19, 0.19), HEAT, fadeIn(t, 0.6), V(80, 84));
} });
// k05 — "terlihat awan hitam besar bergerak ke arah lembah mereka."
registerShot('k05', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.0 }, { mood: 'golden', sunX: V(300, 200) });
  cloudWall(g, t, 0.2 + ease.inOut(prog(t, 0, info.dur + 1)) * 0.55, GY);
  adCrowd(g, CX + V(80, 60), V(180, 140), GY + V(220, 260), V(1.2, 1.3), t, { n: 3, facing: () => -1, pose: () => ({ ...POSES.point, hF: [70, -230] }), expr: () => 'surprised', rim: { color: M.rim, dir: [1, -0.4], w: 4 } });
  small(g, 'AWAN HITAM BESAR', E.H * V(0.86, 0.86), '#ffffff', fadeIn(t, wt('awan', 17.2, info) - 0.1), V(58, 60));
} });
// k06 — "Mereka bersorak gembira! Inilah awan yang akan menurunkan hujan untuk kita!"
registerShot('k06', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.12 }, { mood: 'dusk' }); cloudWall(g, t, 0.85, GY); veil(g, '#000', 0.15);
  adCrowd(g, CX - V(480, 400), V(320, 265), GY + V(170, 200), V(2.0, 2.1), t, { n: 4, pose: () => ({ ...POSES.cheer, hF: [30, -250 + Math.sin(t * 8) * 10], hB: [-30, -250] }), expr: () => 'grin', talk: true, rim: { color: M.rim, dir: [0, -1], w: 5 } });
  big(g, 'HUJAN!', E.H * V(0.15, 0.14), '#a8e0ff', pop(t, wt('hujan', 24.1, info)), V(140, 150));
} });
// k07 — "Tapi Nabi Hud berkata: Bukan… itulah azab yang kalian minta untuk disegerakan!"
registerShot('k07', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0608', '#2a1a20']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const sp = t > wt('Bukan…', 28.4, info) - 0.2;
  bigPerson(g, E.W / 2, E.H * V(0.64, 0.6), V(300, 330), { outfit: HUD, expr: sp ? 'angry' : 'worried', talk: sp ? Math.max(0, 0.6 * Math.sin(t * 12)) : 0, rimColor: HOLY, rimSide: -1 });
  big(g, 'BUKAN!', E.H * V(0.13, 0.13), '#ffffff', pop(t, wt('Bukan…', 28.4, info)), V(130, 140));
  big(g, 'ITULAH AZAB', E.H * V(0.2, 0.2), RED, pop(t, wt('azab', 29.6, info)), V(90, 96));
} });
// k08 — "Angin datang… Dingin. Kencang. Menderu."
registerShot('k08', { draw(g, t, info) {
  const [qx, qy] = shake(t, 4, 18); g.translate(qx, qy);
  const { GY, CX } = iram(g, t, { z: 1.08 }, { mood: 'night' }); veil(g, '#0a1020', 0.4);
  blowingSand(g, t, '#c8a880', GY, 0.5); wind(g, t, 70, 0.4);
  ['DINGIN', 'KENCANG', 'MENDERU'].forEach((s, i) => big(g, s, E.H * V(0.14 + i * 0.07, 0.14 + i * 0.07), ['#bfe0ff', '#ffffff', '#ffb070'][i], pop(t, wt(['Dingin.', 'Kencang.', 'Menderu.'][i], 34 + i, info)), V(90, 96)));
} });
// k09 — "Selama tujuh malam… delapan hari… tanpa henti!"  day/night flicker with counters
registerShot('k09', { draw(g, t, info) {
  const night = Math.sin(t * 5) > 0; const [qx, qy] = shake(t, 4, 18); g.translate(qx, qy);
  const { GY } = desert(g, t, { z: 1.08 }, { mood: night ? 'night' : 'dusk' }); veil(g, night ? '#05081a' : '#2a1408', 0.4);
  blowingSand(g, t, '#c8a880', GY, 0.6); wind(g, t, 80, 0.45);
  const n7 = Math.min(7, Math.floor(prog(t, wt('tujuh', 38.4, info) - 0.2, wt('tanpa', 41, info)) * 7 + (t > wt('tujuh', 38.4, info) - 0.2 ? 1 : 0))), n8 = Math.min(8, Math.floor(prog(t, wt('delapan', 39.3, info) - 0.2, wt('tanpa', 41, info)) * 8 + (t > wt('delapan', 39.3, info) - 0.2 ? 1 : 0)));
  if (n7) big(g, n7 + ' MALAM', E.H * V(0.15, 0.15), '#bfe0ff', 1, V(100, 106)); if (n8) big(g, n8 + ' HARI', E.H * V(0.23, 0.23), '#ffb070', 1, V(100, 106));
  small(g, 'TANPA HENTI!', E.H * V(0.86, 0.86), '#ffffff', fadeIn(t, wt('tanpa', 41, info) - 0.1), V(64, 66));
} });
// k10 — "Angin itu menghancurkan segala sesuatu yang dilaluinya." columns topple
registerShot('k10', { draw(g, t, info) {
  const [qx, qy] = shake(t, 6, 22); g.translate(qx, qy);
  const { GY, CX } = desert(g, t, { z: 1.0 }, { mood: 'night' }); veil(g, '#0a1020', 0.35);
  for (let i = 0; i < 6; i++) { const x = CX - V(640, 520) + i * V(255, 205), h = V(760, 1000) * (0.8 + 0.25 * ((i * 37) % 5) / 4), f = ease.in(prog(t, 0.4 + i * 0.35, 1.3 + i * 0.35)); g.save(); g.translate(x, GY + 60); g.rotate(f * 1.45); column(g, 0, 0, h, V(70, 62), shadeC(STONE, -0.35 - (i % 2) * 0.06), 1); g.restore(); if (f > 0.97) FX.dust(g, x + h * 0.6, GY + 50, t - 1.3 - i * 0.35, { count: 12, color: '#c8a880' }); }
  blowingSand(g, t, '#c8a880', GY, 0.6); wind(g, t, 80, 0.45);
  small(g, 'MENGHANCURKAN SEGALANYA', E.H * V(0.12, 0.12), '#ffffff', fadeIn(t, wt('menghancurkan', 43.7, info) - 0.1), V(50, 52));
} });
// k11 — "Tubuh-tubuh raksasa itu terangkat… terhempas… seperti batang-batang pohon kurma yang lapuk." distant silhouettes, then fallen hollow palm trunks (symbolic, no gore)
registerShot('k11', { draw(g, t, info) {
  const lift = wt('terangkat…', 48.3, info), drop = wt('terhempas', 49.6, info), logs = wt('seperti', 52.4, info);
  const [qx, qy] = shake(t, 5, 20); g.translate(qx, qy);
  const { GY, CX } = desert(g, t, { z: 1.0 }, { mood: 'night' }); veil(g, '#0a1020', 0.4);
  if (t < logs - 0.2) { for (let i = 0; i < 4; i++) { const up = ease.out(prog(t, lift - 0.3 + i * 0.12, drop)), down = ease.in(prog(t, drop + i * 0.1, drop + 0.6 + i * 0.1)); const x = CX - V(360, 290) + i * V(240, 190) + up * 120 + down * 160, y = GY + V(150, 180) - up * V(500, 650) * (1 - down); person(g, { x, y, s: V(1.4, 1.5), rot: up * 1.2 + down * 0.4, facing: 1, outfit: { ...AD[i], color: '#000' }, pose: up > 0.1 ? POSES.fall : POSES.handsOnHead, expr: 'scared', dim: true, shadow: false, rim: { color: '#8aa0c0', dir: [0, -1], w: 3 } }); } }
  else { const a = fadeIn(t, logs - 0.2, 0.5); g.globalAlpha = a; for (let i = 0; i < 6; i++) { const x = CX - V(460, 380) + i * V(185, 150), y = GY + V(170, 210) + (i % 3) * 40; g.save(); g.translate(x, y); g.rotate(-0.25 + (i % 3) * 0.2); rr(g, -110, -20, 220, 40, 18); g.fillStyle = '#3a2a1c'; g.fill(); g.fillStyle = '#1a120a'; g.beginPath(); g.ellipse(110, 0, 12, 20, 0, 0, Math.PI * 2); g.fill(); for (let j = -80; j < 100; j += 30) seg(g, [[j, -18], [j + 10, 18]], 3, alpha('#000', 0.3)); g.restore(); } g.globalAlpha = 1; small(g, 'SEPERTI BATANG KURMA LAPUK', E.H * V(0.12, 0.12), '#d8c8a8', a, V(46, 48)); }
  blowingSand(g, t, '#c8a880', GY, 0.5); wind(g, t, 60, 0.4);
} });
// k12 — "Bangsa terkuat itu… lenyap. Yang tersisa hanya bekas rumah-rumah mereka."
registerShot('k12', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.12 - 0.04 * t / info.dur }, { mood: 'dawn', sunX: V(-200, -120) });
  for (let i = 0; i < 6; i++) { const x = CX - V(620, 500) + i * V(250, 200); column(g, x, GY + 40 + (i % 2) * 20, V(120, 150) + (i * 53) % 140, V(70, 62), shadeC(STONE, -0.25), 0.97); }
  for (let i = 0; i < 3; i++) { g.save(); g.translate(CX - V(300, 240) + i * V(300, 240), GY + V(160, 200)); g.rotate(1.5); column(g, 0, 0, V(300, 380), V(60, 54), shadeC(STONE, -0.3), 0.97); g.restore(); }
  big(g, 'LENYAP', E.H * V(0.16, 0.16), '#ffffff', fadeIn(t, wt('lenyap.', 57.6, info) - 0.15, 0.8), V(140, 150));
  small(g, 'HANYA TERSISA PUING', E.H * V(0.23, 0.23), '#d8c8a8', fadeIn(t, wt('tersisa', 59.3, info) - 0.1));
} });
// k13 — "Nabi Hud dan orang-orang beriman… diselamatkan oleh Allah."
registerShot('k13', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.1 }, { mood: 'golden', sunX: V(0, 0) });
  FX.godRays(g, CX, -E.H * 0.05, { count: 11, angle: Math.PI / 2, spread: 0.8, len: E.H * 1.3, color: HOLY, a: 0.1, t });
  const x0 = CX - V(380, 300) + t * 40;
  person(g, { x: x0 + V(330, 270), y: GY + V(200, 230), s: V(1.6, 1.7), facing: 1, outfit: HUD, pose: walkPose(t * 4), expr: 'smile', staff: true, rim: { color: HOLY, dir: [0, -1], w: 5 } });
  for (let i = 0; i < 3; i++) person(g, { x: x0 + i * V(110, 90), y: GY + V(180, 210) + (i % 2) * 20, s: V(1.4, 1.45), facing: 1, outfit: BELIEVER[i], pose: walkPose(t * 4 + i), expr: 'smile', rim: { color: HOLY, dir: [0, -1], w: 4 } });
  big(g, 'DISELAMATKAN', E.H * V(0.15, 0.15), HOLY, fadeIn(t, wt('diselamatkan', 64.5, info) - 0.1), V(96, 100));
  small(g, 'NABI HUD & ORANG BERIMAN', E.H * V(0.21, 0.21), '#ffffff', fadeIn(t, 0.4), V(46, 48));
} });
// k14 — Hikmah
registerShot('k14', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.05 }, { mood: 'dusk' }); veil(g, '#05030a', 0.4);
  for (let i = 0; i < 5; i++) column(g, CX - V(560, 440) + i * V(280, 220), GY + 40, V(140, 170) + (i * 53) % 120, V(70, 62), shadeC(STONE, -0.4), 0.97);
  small(g, 'HIKMAH', E.H * V(0.12, 0.12), GOLD(), fadeIn(t, 0.1));
  small(g, 'SEKUAT APA PUN MANUSIA…', E.H * V(0.19, 0.19), '#ffffff', fadeIn(t, wt('Sekuat', 67.8, info) - 0.1), V(48, 50));
  big(g, 'TAK BISA MELAWAN', E.H * V(0.26, 0.26), '#ffffff', fadeIn(t, wt('melawan', 70.4, info) - 0.2), V(72, 76)); big(g, 'KEHENDAK ALLAH', E.H * V(0.32, 0.32), HOLY, fadeIn(t, wt('kehendak', 70.8, info) - 0.1), V(72, 76));
  small(g, 'JANGAN MENANTANG AZAB-NYA', E.H * V(0.86, 0.86), '#ff8a6a', fadeIn(t, wt('menantang', 73, info) - 0.1), V(46, 48));
} });
// k15 — "Tahukah kamu? Setiap kali melihat awan mendung, Rasulullah SAW terlihat gelisah… teringat kisah kaum 'Ad."  sky only, no figure
registerShot('k15', { draw(g, t, info) {
  const { GY } = desert(g, t, { z: 1.0 + 0.02 * t }, { mood: 'dusk' }); FX.clouds(g, { seed: 11, count: 10, y: E.H * 0.05, h: 320, color: '#1a1420', a: 0.7 }); veil(g, '#05030a', 0.3);
  big(g, 'TAHUKAH KAMU?', E.H * V(0.14, 0.14), GOLD(), pop(t, 0.2), V(96, 100));
  small(g, 'SAAT MELIHAT AWAN MENDUNG', E.H * V(0.24, 0.24), '#ffffff', fadeIn(t, wt('awan', 77.9, info) - 0.2), V(46, 48));
  small(g, 'RASULULLAH SAW GELISAH', E.H * V(0.3, 0.3), HOLY, fadeIn(t, wt('Rasulullah', 79, info) - 0.1), V(56, 58));
  small(g, "TERINGAT KAUM 'AD", E.H * V(0.36, 0.36), '#ffb070', fadeIn(t, wt('teringat', 81.9, info) - 0.1), V(56, 58));
  small(g, 'HR. BUKHARI & MUSLIM', E.H * V(0.9, 0.9), alpha('#ffffff', 0.7), fadeIn(t, 1.5), V(36, 38));
} });
// k16 — end card
registerShot('k16', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a1408', '#05030a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 9, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.2, color: HOLY, a: 0.08, t });
  big(g, 'IKUTI TERUS', E.H * V(0.3, 0.3), '#ffffff', ease.outBack(prog(t, 0.1, 0.5)), V(96, 100));
  big(g, 'KISAH PARA NABI', E.H * V(0.37, 0.37), GOLD(), ease.outBack(prog(t, 0.4, 0.8)), V(84, 88));
  commentPrompt(g, Math.max(0, t - 0.9), ['NABI SIAPA', 'SELANJUTNYA?'], { y: E.H * V(0.56, 0.54) });
  text(g, 'E-DAYzz', E.W / 2, E.H * 0.92, { size: V(48, 50), color: alpha('#ffffff', 0.8), font: FONTS.title, spacing: 4, alpha: fadeIn(t, 1.4) });
} });
