// shots/hud2.js — Kisah Nabi Hud, Part 2 (j01–j13).
import { E, V, S, registerShot, layer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson, palm, GOLD } from '../lib/_costume.js';
import { idol } from '../lib8/_sea.js';
import { iram, adCrowd } from '../lib9/_hud.js';
import { HUD, AD } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff4a3a';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const pop = (t, a) => ease.outBack(prog(t, a - 0.1, a + 0.3));
const hud = (g, t, x, y, s, o = {}) => person(g, { x, y, s, facing: o.f ?? 1, outfit: HUD, pose: o.pose || breathe(POSES.stand, t), expr: o.expr || 'neutral', talk: o.talk ? Math.max(0, 0.5 * Math.sin(t * 12)) : 0, staff: o.staff, rim: { color: o.rim || HOLY, dir: [0, -1], w: 5 } });

// j01 — title
registerShot('j01', { draw(g, t, info) {
  iram(g, t, { z: 1.1 + 0.02 * t }, { mood: 'dusk' }); veil(g, '#05030a', 0.6);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI HUD', 'PART 2'], dur: info.dur + 0.5, y: E.H * 0.36 });
  const a = fadeIn(t, 1.0, 0.5) * (1 - prog(t, info.dur - 0.3, info.dur));
  text(g, '"SILAKAN LAKUKAN', E.W / 2, E.H * 0.36 + V(130, 150), { size: V(52, 50), color: S().ui.accent, font: FONTS.title, glow: 22, glowColor: 'rgba(255,120,60,.7)', spacing: 3, alpha: a });
  text(g, 'TIPU DAYA KALIAN!"', E.W / 2, E.H * 0.36 + V(195, 215), { size: V(52, 50), color: S().ui.accent, font: FONTS.title, glow: 22, glowColor: 'rgba(255,120,60,.7)', spacing: 3, alpha: a });
} });
// j02 — "Nabi Hud berdiri di hadapan kaumnya."
registerShot('j02', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.08 }, { mood: 'golden' });
  adCrowd(g, CX - V(700, 560), V(230, 180), GY + V(140, 160), V(2.3, 2.4), t, { n: 2, facing: () => 1, pose: () => POSES.crossArms, expr: () => 'smirk', rim: { color: M.rim, dir: [1, -0.4], w: 5 } });
  adCrowd(g, CX + V(470, 380), V(230, 180), GY + V(140, 160), V(2.3, 2.4), t, { n: 2, off: 2, facing: () => -1, pose: () => POSES.crossArms, expr: () => 'smirk', rim: { color: M.rim, dir: [-1, -0.4], w: 5 } });
  hud(g, t, CX, GY + V(230, 260), V(1.4, 1.5), { staff: true });
} });
// j03 — "Wahai kaumku… sembahlah Allah. Tidak ada Tuhan bagi kalian selain Dia."
registerShot('j03', { draw(g, t, info) {
  desert(g, t, { z: 1.2 }, { mood: 'golden' }); veil(g, '#1a0c04', 0.35);
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 9, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.2, color: HOLY, a: 0.06, t });
  bigPerson(g, E.W / 2, E.H * V(0.62, 0.58), V(300, 330), { outfit: HUD, expr: 'neutral', talk: Math.max(0, 0.5 * Math.sin(t * 12)), rimColor: HOLY, rimSide: -1 });
  big(g, 'SEMBAHLAH ALLAH', E.H * V(0.14, 0.14), HOLY, fadeIn(t, wt('sembahlah', 8, info) - 0.1), V(80, 84));
  small(g, 'TIADA TUHAN SELAIN DIA', E.H * V(0.2, 0.2), '#ffffff', fadeIn(t, wt('Tidak', 9.8, info) - 0.1));
} });
// j04 — "Mohonlah ampunan… hujan yang lebat… menambah kekuatan kalian."
registerShot('j04', { draw(g, t, info) {
  const rainK = ease.inOut(prog(t, wt('hujan', 15.8, info) - 0.5, wt('hujan', 15.8, info) + 0.8));
  const { GY, CX, M } = desert(g, t, { z: 1.08 }, { mood: 'golden' });
  FX.clouds(g, { seed: 7, count: 8, y: E.H * 0.04, h: 220, color: '#3a4a5a', a: 0.75 * rainK }); veil(g, '#0a1420', 0.25 * rainK);
  if (rainK > 0.1) FX.rain(g, t, { count: Math.floor(220 * rainK), a: 0.35 });
  g.fillStyle = alpha('#4a7a2a', 0.8 * rainK); g.beginPath(); g.ellipse(CX, GY + V(200, 240), E.W * 0.9, V(120, 150), 0, 0, Math.PI * 2); g.fill();
  hud(g, t, CX - V(220, 170), GY + V(220, 250), V(1.5, 1.6), { pose: breathe(POSES.pointUp, t), talk: true });
  adCrowd(g, CX + V(140, 110), V(230, 170), GY + V(160, 190), V(1.9, 2.0), t, { n: 2, facing: () => -1, pose: () => POSES.crossArms, expr: () => 'neutral', rim: { color: M.rim, dir: [-1, -0.4], w: 4 } });
  [['AMPUNAN', 'Mohonlah', 12.5, HOLY], ['HUJAN LEBAT', 'hujan', 15.8, '#a8e0ff'], ['KEKUATAN', 'kekuatan', 17.8, GOLD()]].forEach(([s, w, af, c], i) => small(g, s, E.H * V(0.12, 0.12) + i * V(72, 76), c, fadeIn(t, wt(w, af, info) - 0.1), V(58, 60)));
} });
// j05 — "Tapi mereka tertawa."
registerShot('j05', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.15 }, { mood: 'golden' }); const [qx, qy] = shake(t, 3, 14); g.translate(qx, qy);
  adCrowd(g, CX - V(480, 400), V(320, 265), GY + V(170, 200), V(2.0, 2.1), t, { n: 4, pose: (i) => (i % 2 ? POSES.handsOnHead : { ...POSES.crossArms, head: [8, -200] }), expr: () => 'grin', talk: true, rim: { color: M.rim, dir: [0, -1], w: 5 } });
  for (let i = 0; i < 4; i++) { const p = (t * 1.2 + i * 0.25) % 1; text(g, 'HA', E.W * (0.18 + i * 0.22), E.H * (0.32 - p * 0.1), { size: V(64, 68), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000', alpha: Math.sin(p * Math.PI) * fadeIn(t, 0.3) }); }
} });
// j06 — "Hai Hud, kamu tidak membawa bukti apa pun! Kami tidak akan meninggalkan tuhan-tuhan kami…"
registerShot('j06', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.1 }, { mood: 'dusk' }); veil(g, '#1a0004', 0.35);
  idol(g, CX - V(300, 240), GY + V(60, 80), V(1.0, 1.1), '#5a4a3a'); idol(g, CX + V(300, 240), GY + V(60, 80), V(1.0, 1.1), '#5a4a3a');
  bigPerson(g, E.W / 2, E.H * V(0.66, 0.62), V(300, 330), { outfit: AD[0], expr: 'angry', talk: Math.max(0, 0.7 * Math.sin(t * 13)), rimColor: '#ff9a6a', rimSide: 1 });
  big(g, 'MANA BUKTINYA?', E.H * V(0.14, 0.13), '#ffffff', pop(t, wt('bukti', 23.3, info)), V(90, 96));
  small(g, 'TUHAN-TUHAN KAMI!', E.H * V(0.2, 0.19), '#ff8a6a', fadeIn(t, wt('tuhan-tuhan', 25.8, info) - 0.1));
} });
// j07 — "menghina: Kami rasa… sebagian tuhan kami telah membuatmu gila!"
registerShot('j07', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.08 }, { mood: 'dusk' });
  adCrowd(g, CX - V(620, 500), V(260, 200), GY + V(140, 160), V(2.2, 2.3), t, { n: 2, facing: () => 1, pose: () => POSES.point, expr: () => 'grin', talk: true, rim: { color: M.rim, dir: [1, -0.4], w: 5 } });
  adCrowd(g, CX + V(360, 300), V(260, 200), GY + V(140, 160), V(2.2, 2.3), t, { n: 2, off: 3, facing: () => -1, pose: () => POSES.point, expr: () => 'grin', talk: true, rim: { color: M.rim, dir: [-1, -0.4], w: 5 } });
  hud(g, t, CX, GY + V(240, 270), V(1.35, 1.45), { staff: true });
  const a = pop(t, wt('gila!', 33.3, info)); if (a > 0) { const [qx] = shake(t, 4, 30); text(g, 'GILA!', E.W / 2 + qx, E.H * V(0.2, 0.18), { size: V(170, 180), color: RED, font: FONTS.title, stroke: 16, strokeColor: '#000', glow: 26, glowColor: alpha(RED, 0.7), alpha: a }); }
} });
// j08 — "Nabi Hud tidak gentar… sendirian… di hadapan bangsa raksasa." low angle, giants towering
registerShot('j08', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a1a2a', '#c86a40', '#2a1410']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const GY = E.H * 0.86, k = ease.inOut(prog(t, 0, info.dur));
  for (let i = 0; i < 4; i++) person(g, { x: E.W * [0.08, 0.3, 0.7, 0.92][i], y: GY - 40 - (i % 2) * 30, s: V(3.6, 3.8) * (1 + 0.05 * k), facing: i < 2 ? 1 : -1, outfit: { ...AD[i], color: '#000' }, pose: POSES.crossArms, expr: 'angry', dim: true, rim: { color: '#ff9a6a', dir: [0, -1], w: 5 } });
  veil(g, '#000', 0.25);
  hud(g, t, E.W / 2, GY + 60, V(1.2, 1.3), { staff: true });
  glow(g, E.W / 2, GY - 100, 260, HOLY, 0.25);
  big(g, 'TIDAK GENTAR', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('gentar', 35.4, info) - 0.1), V(90, 96));
  small(g, 'SENDIRIAN', E.H * V(0.16, 0.16), HOLY, fadeIn(t, wt('sendirian…', 37, info) - 0.1));
} });
// j09 — "Tapi suaranya tegas: Aku berlepas diri dari apa yang kalian sembah!"
registerShot('j09', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.15 }, { mood: 'dusk' }); veil(g, '#0a0604', 0.4);
  const crack = prog(t, wt('berlepas', 42, info) - 0.2, wt('sembah!', 43.8, info) + 0.4);
  idol(g, CX - V(320, 250), GY + V(30, 50) + crack * 20, V(0.9, 1.0), '#5a4a3a'); idol(g, CX + V(320, 250), GY + V(30, 50) + crack * 20, V(0.9, 1.0), '#5a4a3a');
  if (crack > 0) for (const sx of [-1, 1]) seg(g, [[CX + sx * V(320, 250) - 20, GY - 200], [CX + sx * V(320, 250) + 10, GY - 140], [CX + sx * V(320, 250) - 15, GY - 80]].slice(0, 1 + Math.ceil(crack * 2)), 5, '#1a0a04');
  const st = t > wt('Aku', 41.8, info) - 0.2;
  bigPerson(g, E.W / 2, E.H * V(0.62, 0.6), V(290, 320), { outfit: HUD, expr: st ? 'angry' : 'neutral', talk: st ? Math.max(0, 0.6 * Math.sin(t * 12)) : 0, rimColor: HOLY, rimSide: -1 });
  small(g, 'AKU BERLEPAS DIRI', E.H * V(0.14, 0.14), HOLY, fadeIn(t, wt('berlepas', 42, info) - 0.1), V(64, 66));
} });
// j10 — "Silakan… lakukan tipu daya kalian semua terhadapku… jangan beri aku tangguh!"
registerShot('j10', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.05 }, { mood: 'pharaoh' }); veil(g, '#1a0004', 0.25);
  const close = ease.inOut(prog(t, 0.5, info.dur));
  adCrowd(g, CX - V(720, 580) + close * 120, V(230, 180), GY + V(140, 160), V(2.4, 2.5), t, { n: 2, facing: () => 1, pose: () => POSES.ready, expr: () => 'angry', rim: { color: RED, dir: [1, -0.4], w: 5 } });
  adCrowd(g, CX + V(490, 400) - close * 120, V(230, 180), GY + V(140, 160), V(2.4, 2.5), t, { n: 2, off: 2, facing: () => -1, pose: () => POSES.ready, expr: () => 'angry', rim: { color: RED, dir: [-1, -0.4], w: 5 } });
  hud(g, t, CX, GY + V(240, 270), V(1.45, 1.55), { pose: breathe({ ...POSES.shrug, hF: [70, -170], hB: [-70, -170] }, t), talk: true });
  glow(g, CX, GY + V(100, 120), 240, HOLY, 0.3);
  big(g, 'SILAKAN!', E.H * V(0.14, 0.13), GOLD(), pop(t, wt('Silakan…', 45, info)), V(140, 150));
  small(g, 'LAKUKAN TIPU DAYA KALIAN', E.H * V(0.21, 0.2), '#ffffff', fadeIn(t, wt('tipu', 46.3, info) - 0.1), V(48, 50));
} });
// j11 — "Aku bertawakal kepada Allah… Tuhanku dan Tuhan kalian!"
registerShot('j11', { draw(g, t, info) {
  const { GY, CX } = desert(g, t, { z: 1.1 + 0.03 * t }, { mood: 'dawn', sunX: V(0, 0) });
  FX.godRays(g, CX, -E.H * 0.05, { count: 11, angle: Math.PI / 2, spread: 0.7, len: E.H * 1.3, color: HOLY, a: 0.12, t });
  hud(g, t, CX, GY + V(200, 230), V(1.9, 2.0), { pose: breathe(POSES.pointUp, t), talk: true, staff: false });
  big(g, 'TAWAKAL', E.H * V(0.14, 0.14), HOLY, fadeIn(t, wt('bertawakal', 51.3, info) - 0.1), V(110, 116));
  small(g, 'KEPADA ALLAH', E.H * V(0.21, 0.21), '#ffffff', fadeIn(t, wt('Allah…', 52.5, info) - 0.1), V(60, 62));
} });
// j12 — "Datangkan saja azab yang kamu ancamkan itu… jika kamu benar!"
registerShot('j12', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.12 }, { mood: 'pharaoh' }); const [qx, qy] = shake(t, 3, 16); g.translate(qx, qy);
  adCrowd(g, CX - V(480, 400), V(320, 265), GY + V(170, 200), V(2.0, 2.1), t, { n: 4, pose: () => ({ ...POSES.cheer, hF: [30, -250], hB: [-30, -250] }), expr: () => 'angry', talk: true, rim: { color: RED, dir: [0, -1], w: 5 } });
  big(g, 'DATANGKAN', E.H * V(0.12, 0.12), '#ffffff', pop(t, wt('Datangkan', 58, info)), V(100, 106)); big(g, 'AZABNYA!', E.H * V(0.19, 0.19), RED, pop(t, wt('azab', 58.7, info)), V(120, 126));
} });
// j13 — "Dan Allah… mengabulkan tantangan mereka."  a dark cloud rises on the horizon (Allah not depicted)
registerShot('j13', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0.6, info.dur - 0.8));
  const { GY, CX } = desert(g, t, { z: 1.05 }, { mood: 'dusk', sunX: V(-300, -200) });
  g.fillStyle = alpha('#0a0608', 0.95); g.beginPath(); g.moveTo(-E.W, GY - V(150, 240)); for (let x = -E.W; x <= E.W * 2; x += 60) g.lineTo(x, GY - V(150, 240) - k * V(500, 700) - Math.sin(x * 0.006 + t) * 60 * k - Math.sin(x * 0.017) * 40 * k); g.lineTo(E.W * 2, GY - V(150, 240)); g.closePath(); g.fill();
  veil(g, '#000', 0.25 * k);
  if (k > 0.6 && Math.sin(t * 7) > 0.85) FX.lightning(g, { x1: E.W * 0.6, y1: E.H * 0.2, x2: E.W * 0.5, y2: E.H * 0.4, seed: Math.floor(t * 3), a: 0.8 });
  hud(g, t, CX - V(250, 180), GY + V(200, 230), V(1.4, 1.5), { staff: true, f: 1 });
  small(g, 'TANTANGAN DIKABULKAN', E.H * V(0.86, 0.86), '#ffb070', fadeIn(t, wt('mengabulkan', 63.5, info) - 0.1), V(52, 54));
  small(g, 'BERSAMBUNG KE PART 3', E.H * V(0.93, 0.93), '#ffffff', fadeIn(t, info.dur - 1.6), V(44, 46));
} });
