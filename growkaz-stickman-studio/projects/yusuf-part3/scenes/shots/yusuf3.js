// shots/yusuf3.js — Kisah Nabi Yusuf, Part 3 (w01–w32).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { palace, city, throne } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { qamis, camel, wellInside, dreamSky, commentPrompt } from '../lib5/_yusuf.js';
import { qamisTorn, prison, cow } from '../lib6/_y2.js';
import { wheat, sack, drought, choicePrompt, blindEyes } from '../lib7/_y3.js';
import { YUSUF_KID, YUSUF, YUSUF_GOLD, YAQUB, IBU, BUNYAMIN, BROTHERS, RAJA, PEMUDA } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const bigText = (g, str, y, color, a, size = V(96, 100)) => text(g, str, E.W / 2, y, { size, color, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(color, 0.7), alpha: a });
const SUJUD = { head: [56, -24], sh: [30, -52], hip: [0, -64], eF: [46, -30], hF: [62, -4], eB: [40, -32], hB: [56, -4], kF: [30, -6], fF: [-28, 0], kB: [24, -6], fB: [-34, 0] };

// w01 — "Dua kali baju Yusuf menjadi saksi."
registerShot('w01', { draw(g, t, info) {
  g.fillStyle = '#060406'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const a1 = ease.outBack(prog(t, 0.3, 0.8)), a2 = ease.outBack(prog(t, 1.2, 1.7)), s = V(1.0, 1.1);
  const p1 = V([E.W * 0.3, E.H * 0.5], [E.W * 0.5, E.H * 0.3]), p2 = V([E.W * 0.7, E.H * 0.5], [E.W * 0.5, E.H * 0.68]);
  if (a1 > 0) { qamis(g, p1[0], p1[1], s * a1, { blood: 1 }); bigText(g, '1', p1[1] - 230 * s, GOLD(), a1, V(90, 96)); }
  if (a2 > 0) { qamisTorn(g, p2[0], p2[1], s * a2, { tear: 1 }); bigText(g, '2', p2[1] - 230 * s, GOLD(), a2, V(90, 96)); }
} });
// w02 — "Tapi yang ketiga… akan membuatmu terharu."
registerShot('w02', { draw(g, t, info) {
  g.fillStyle = '#060406'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const a = ease.out(prog(t, 0.2, 1.0));
  FX.godRays(g, E.W / 2, E.H * 0.48, { count: 16, angle: 0, spread: Math.PI * 2, len: E.H, color: '#fff0c0', a: 0.1 * a, t });
  g.save(); g.globalAlpha = a; qamis(g, E.W / 2, E.H * 0.48, V(1.6, 1.8), { glowC: HOLY, rim: HOLY }); g.restore();
  bigText(g, '3 ?', E.H * 0.2, GOLD(), ease.outBack(prog(t, 0.6, 1.1)), V(120, 130));
} });
// w03 — title card
registerShot('w03', { draw(g, t, info) {
  blurBg(g, (g) => palace(g, t, { z: 1.25 }, {}), 12, 0.45, '#0a0604');
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI YUSUF', 'PART 3'], dur: info.dur + 0.5, y: E.H * 0.46 });
} });
// w04 — "Di penjara, Yusuf masih menunggu."
registerShot('w04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 - 0.06 * k };
  const { GY, CX } = prison(g, t, cam, { tally: 40 });
  layer(g, cam, 1, (g) => person(g, { x: CX + V(60, 40), y: GY + 40, s: V(1.6, 1.7), facing: -1, outfit: YUSUF, pose: breathe({ ...POSES.sit, eF: [30, -110], hF: [40, -86], head: [10, -172] }, t), expr: 'thinking', look: [-0.5, -0.6], rim: { color: '#9ab8ff', dir: [0, -1], w: 4 } }));
} });
// dream background
function dreamBg(g, t) { const W = E.W, H = E.H; g.fillStyle = linGrad(g, 0, 0, 0, H, ['#0a0420', '#2a1050', '#4a2060']); g.fillRect(-W, -H, W * 3, H * 3); FX.stars(g, t, { count: 120, area: [0, 0, W, H * 0.5] }); }
// w05 — "Sampai Raja Mesir bermimpi aneh: tujuh sapi gemuk dimakan tujuh sapi kurus."
registerShot('w05', { draw(g, t, info) {
  dreamBg(g, t); const W = E.W, H = E.H;
  bigPerson(g, W / 2, H * V(0.3, 0.28), V(170, 190), { outfit: RAJA, expr: 'worried', face: { brows: null }, look: [0, 0.6], rimColor: '#c8a0ff', rimSide: -1 });
  const eat = ease.inOut(prog(t, wt('dimakan', 12, info), wt('kurus.', 13, info) + 0.4));
  for (let i = 0; i < 7; i++) if (t > wt('tujuh', 11, info) + i * 0.1) cow(g, W * 0.08 + i * W * 0.14 - eat * 60, H * V(0.72, 0.68) + (i % 2) * 40, V(0.55, 0.6) * (1 - eat * 0.9), 1, t, 1, { rim: '#ffe6c0' });
  for (let i = 0; i < 7; i++) { const x = W * 1.2 - Math.max(0, t - wt('dimakan', 12, info)) * W * 0.5 + i * W * 0.14; if (x < W * 1.1) cow(g, x, H * V(0.76, 0.72) + (i % 2) * 40, V(0.6, 0.65), -1, t * 1.5, 0, { rim: '#ff6a4a' }); }
} });
// w06 — "Tujuh bulir gandum hijau, dan tujuh yang kering."
registerShot('w06', { draw(g, t, info) {
  dreamBg(g, t); const W = E.W, H = E.H, dry = wt('tujuh', 16, info);
  for (let i = 0; i < 7; i++) { const a = ease.outBack(prog(t, 0.2 + i * 0.1, 0.6 + i * 0.1)); if (a > 0) wheat(g, W * (0.1 + i * 0.13), H * V(0.55, 0.5), V(0.9, 1.0) * a, true, t, i); }
  for (let i = 0; i < 7; i++) { const a = ease.outBack(prog(t, dry + i * 0.1, dry + 0.4 + i * 0.1)); if (a > 0) wheat(g, W * (0.1 + i * 0.13), H * V(0.92, 0.88), V(0.9, 1.0) * a, false, t, i + 9); }
  if (t > dry) glow(g, W / 2, H * 0.8, W * 0.6, '#ff4a2a', 0.15);
} });
// w07 — "Tak seorang pun mampu menjelaskannya…"
registerShot('w07', { draw(g, t, info) {
  const fs = V(1.3, 1.35), tx = E.W / 2 + V(330, 250), cam = { z: 1.05 + 0.04 * t };
  const { GY, CX, M } = palace(g, t, cam, { throne: tx, throneK: fs });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    person(g, { x: tx - 6 * fs, y: GY - 78 * fs, s: fs, facing: -1, outfit: RAJA, pose: breathe(POSES.sit, t), expr: 'worried', rim, shadow: false });
    for (let i = 0; i < 3; i++) person(g, { x: CX - V(420, 360) + i * V(170, 140), y: GY + 40 + (i % 2) * 12, s: V(1.3, 1.35), facing: 1, outfit: { top: 'dress', color: '#3a3040', head: 'none', acc: ['collar'] }, pose: breathe(POSES.shrug, t, 1, i), expr: 'confused', rim });
  });
} });
// w08 — "sampai seorang mantan tahanan teringat: Yusuf!"
registerShot('w08', { draw(g, t, info) {
  const M = mood('interiorWarm'), ah = ease.outBack(prog(t, wt('Yusuf!', 22, info) - 0.3, wt('Yusuf!', 22, info) + 0.2));
  blurBg(g, (g) => palace(g, t, { z: 1.5, y: -80 }, {}), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.62, 0.6), V(280, 300), { outfit: PEMUDA[0], expr: ah > 0.3 ? 'surprised' : 'thinking', look: [0.5, -0.6], rimColor: M.rim, rimSide: -1 });
  if (ah > 0) { const bx = E.W * 0.72, by = E.H * V(0.25, 0.25); g.save(); g.translate(bx, by); g.scale(ah, ah); circle(g, 0, 0, 130, alpha('#ffffff', 0.92)); circle(g, -90, 140, 20, alpha('#ffffff', 0.92)); person(g, { x: 0, y: 90, s: 0.65, facing: 1, outfit: YUSUF, pose: POSES.stand, expr: 'smile', shadow: false }); g.restore(); FX.sparkle(g, bx + 120, by - 120, 40, '#fff4c0', ah); }
} });
// w09 — "Yusuf menjelaskan: akan datang tujuh tahun panen melimpah, lalu tujuh tahun kelaparan."
registerShot('w09', { draw(g, t, info) {
  const cam = { z: 1.06 };
  const { GY, CX } = prison(g, t, cam, {});
  veil(g, '#000', 0.25);
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(320, 280), y: GY + 40, s: V(1.4, 1.45), facing: 1, outfit: YUSUF, pose: breathe(POSES.explain, t), expr: 'smile', talk: Math.max(0, 0.3 * Math.sin(t * 11)), rim: { color: '#9ab8ff', dir: [1, -0.4], w: 4 } }); person(g, { x: CX + V(330, 280), y: GY + 46, s: V(1.4, 1.45), facing: -1, outfit: PEMUDA[0], pose: breathe(POSES.think, t, 1, 2), expr: 'awe', rim: { color: '#9ab8ff', dir: [-1, -0.4], w: 4 } }); });
  const ui = S().ui, y0 = E.H * V(0.22, 0.24), x0 = E.W * 0.08, w = E.W * 0.84, cell = w / 14, good = wt('panen', 27, info), bad = wt('kelaparan.', 29, info);
  for (let i = 0; i < 14; i++) { const a = ease.outBack(prog(t, (i < 7 ? good - 0.3 : bad - 0.4) + (i % 7) * 0.08, (i < 7 ? good : bad) + (i % 7) * 0.08)); if (a <= 0) continue; const x = x0 + cell * (i + 0.5); rr(g, x - cell * 0.42, y0 - 60 * a, cell * 0.84, 120 * a, 10); g.fillStyle = i < 7 ? alpha('#3a7a2a', 0.9) : alpha('#7a2a1a', 0.9); g.fill(); wheat(g, x, y0 + 50, 0.32 * a, i < 7, t, i); }
  if (t > good) text(g, '7 TAHUN PANEN', x0 + cell * 3.5, y0 - V(100, 110), { size: V(40, 40), color: '#8aff6a', font: FONTS.title, alpha: ease.out(prog(t, good, good + 0.3)) });
  if (t > bad) text(g, '7 TAHUN KELAPARAN', x0 + cell * 10.5, y0 - V(100, 110), { size: V(40, 40), color: ui.accent, font: FONTS.title, alpha: ease.out(prog(t, bad, bad + 0.3)) });
} });
// granary
function granary(g, t, cam, n) {
  const { GY, CX, M } = palace(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => { for (let i = 0; i < n; i++) { const row = Math.floor(i / 6), col = i % 6; sack(g, CX - V(500, 420) + col * V(200, 170) + row * 40, GY + 40 - row * 70, V(1.2, 1.1)); } });
  return { GY, CX, M };
}
// w10 — "Simpanlah sebagian besar hasil panen kalian."
registerShot('w10', { draw(g, t, info) {
  const { GY, CX, M } = granary(g, t, { z: 1.08 + 0.03 * t }, Math.min(18, Math.floor(t * 6)));
  for (let i = 0; i < 20; i++) { const y = ((t * 300 + i * 70) % 400); circle(g, E.W * 0.85 + Math.sin(i) * 20, GY - 500 + y, 5, '#e0c060'); }
  FX.dust(g, t, { count: 50, color: M.key, a: 0.4 });
} });
// w11 — "Raja kagum dan memerintahkan Yusuf dibebaskan."
registerShot('w11', { draw(g, t, info) {
  const M = mood('interiorWarm');
  blurBg(g, (g) => palace(g, t, { z: 1.5, y: -120 }, {}), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(290, 320) * (1 + 0.03 * t), { outfit: RAJA, expr: t < 1.2 ? 'awe' : 'happy', look: [0, 0], rimColor: M.rim, rimSide: -1 });
} });
// w12 — "Tapi Yusuf menolak keluar… sebelum namanya dibersihkan."
registerShot('w12', { draw(g, t, info) {
  const cam = { z: 1.1 };
  const { GY, CX } = prison(g, t, cam, { winX: -V(300, 260) });
  layer(g, cam, 1, (g) => {
    const dx = CX + V(300, 260); g.fillStyle = linGrad(g, 0, GY - 420, 0, GY, ['#fff0c0', '#ffd08a']); g.fillRect(dx - 110, GY - 420, 220, 420); glow(g, dx, GY - 200, 380, '#fff0c0', 0.45);
    person(g, { x: dx + 40, y: GY + 40, s: V(1.3, 1.35), facing: -1, outfit: { top: 'dress', color: '#3a3040', head: 'none', acc: ['collar'] }, pose: breathe(POSES.wave, t), expr: 'happy', rim: { color: '#fff0c0', dir: [-1, -0.3], w: 4 } });
    person(g, { x: CX - V(160, 140), y: GY + 40, s: V(1.6, 1.65), facing: 1, outfit: YUSUF, pose: breathe(posesAt(t, [[0, 'stand'], [0.6, 'crossArms']]), t), expr: 'determined', face: { brows: null }, rim: { color: '#9ab8ff', dir: [1, -0.3], w: 5 } });
  });
} });
// w13 — "Kebenaran pun terungkap."
registerShot('w13', { draw(g, t, info) {
  g.fillStyle = '#0a0806'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, E.H * 0.45, { count: 14, angle: 0, spread: Math.PI * 2, len: E.H, color: '#ffe6b0', a: 0.1, t });
  qamisTorn(g, E.W / 2, E.H * 0.45, V(1.6, 1.8), { tear: 1, glowC: GOLD() });
  const a = ease.outBack(prog(t, 0.2, 0.6));
  g.save(); g.translate(E.W / 2, E.H * V(0.78, 0.74)); g.rotate(-0.08); g.scale(a, a); rr(g, -V(360, 380), -70, V(720, 760), 140, 20); g.strokeStyle = '#2aa860'; g.lineWidth = 12; g.stroke(); text(g, 'TIDAK BERSALAH', 0, 4, { size: V(76, 80), color: '#2aa860', font: FONTS.title, weight: 700 }); g.restore();
} });
// w14 — "Dan Raja mengangkatnya menjadi pengurus perbendaharaan Mesir."
registerShot('w14', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.06 * k, y: -40 };
  const { GY, CX, M } = palace(g, t, cam, {});
  const rim = { color: M.rim, dir: [0, -1], w: 5 }, gold = ease.out(prog(t, wt('mengangkatnya', 44, info), wt('mengangkatnya', 44, info) + 0.8));
  layer(g, cam, 1, (g) => {
    person(g, { x: CX + V(200, 170), y: GY + 40, s: V(1.7, 1.75), facing: -1, outfit: RAJA, pose: breathe(POSES.holdFront, t), expr: 'happy', rim });
    person(g, { x: CX - V(160, 140), y: GY + 40, s: V(1.7, 1.75), facing: 1, outfit: gold > 0.5 ? YUSUF_GOLD : YUSUF, pose: breathe(POSES.stand, t), expr: 'smile', rim });
    if (gold > 0) { glow(g, CX - V(160, 140), GY + 40 - 175 * 1.7, 200 * gold, GOLD(), 0.5); FX.sparkle(g, CX - V(160, 140), GY + 40 - 170 * 1.7, 40 * gold, '#fff4c0', gold); }
    for (let i = 0; i < 5; i++) sack(g, CX - V(460, 420) + i * 50, GY + 60 - (i % 2) * 40, 0.8);
  });
} });
// w15 — "Bertahun-tahun kemudian, kelaparan melanda."
registerShot('w15', { draw(g, t, info) {
  const W = E.W, H = E.H, k = ease.inOut(t / info.dur);
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#e8a050', '#f0c070', '#f8e0a0']); g.fillRect(-W, -H, W * 3, H * 3);
  FX.sun(g, W * 0.7, H * 0.2, V(110, 120), '#fffbe8', '#ffb040', 5);
  drought(g, t, H * V(0.6, 0.58));
  const tx = W * 0.25, ty = H * V(0.66, 0.64); seg(g, [[tx, ty], [tx + 10, ty - 260]], 22, '#3a2416'); for (const [dx, dy] of [[-80, -330], [90, -360], [30, -400], [-40, -290]]) seg(g, [[tx + 10, ty - 220], [tx + dx, ty + dy]], 9, '#3a2416');
  cow(g, W * 0.7, H * V(0.8, 0.78), V(0.9, 1.0), -1, t * 0.3, 0, {});
  g.save(); g.globalAlpha = 0.15 + 0.1 * Math.sin(t * 6); g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) g.fillRect(0, H * 0.5 + i * 40 + Math.sin(t * 4 + i) * 6, W, 3); g.restore();
  veil(g, '#3a1a00', 0.15 * k);
} });
// w16 — "Saudara-saudara Yusuf datang dari jauh meminta makanan."
registerShot('w16', { draw(g, t, info) {
  const cam = { z: 1.05, x: t * 40 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(300, 200) });
  layer(g, cam, 0.35, (g) => { for (const [x, w, h] of [[300, 300, 180], [520, 220, 130]]) { g.fillStyle = alpha('#2a160e', 0.55); g.beginPath(); g.moveTo(CX + x - w / 2, GY - V(170, 240)); g.lineTo(CX + x, GY - V(170, 240) - h); g.lineTo(CX + x + w / 2, GY - V(170, 240)); g.fill(); } });
  layer(g, cam, 1, (g) => { const x = CX - V(300, 260) + t * 60; camel(g, x + V(420, 360), GY + 30, V(0.85, 0.8), 1, t, { rim: M.rim, load: '#8a6a3a' }); for (let i = 0; i < 5; i++) person(g, { x: x + i * V(110, 90) - V(200, 160), y: GY + 40 + (i % 2) * 10, s: V(1.15, 1.2), facing: 1, outfit: BROTHERS[i], pose: walkPose(t * 4 + i), expr: 'sad', rim: { color: M.rim, dir: [1, -0.5], w: 4 } }); });
} });
// w17 — "Yusuf langsung mengenali mereka."
registerShot('w17', { draw(g, t, info) {
  const M = mood('interiorWarm');
  blurBg(g, (g) => palace(g, t, { z: 1.5, y: -80 }, {}), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: YUSUF_GOLD, expr: t < 0.5 ? 'neutral' : 'surprised', look: [0.3, 0.3], rimColor: M.rim, rimSide: 1 });
  const fl = ease.out(prog(t, 0.6, 1.2)) * (1 - prog(t, 1.6, 2.1)); if (fl > 0) { g.save(); g.globalAlpha = fl * 0.6; for (let i = 0; i < 3; i++) person(g, { x: E.W * (0.2 + i * 0.3), y: E.H * 0.22, s: 0.5, facing: 1, outfit: BROTHERS[i], pose: POSES.crossArms, expr: 'smirk', shadow: false }); g.restore(); }
} });
// w18 — "Tapi mereka sama sekali tidak mengenalinya."
registerShot('w18', { draw(g, t, info) {
  const fs = V(1.2, 1.25), tx = E.W / 2 + V(330, 260), cam = { z: 1.05 };
  const { GY, CX, M } = palace(g, t, cam, { throne: tx, throneK: fs });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    person(g, { x: tx - 6 * fs, y: GY - 78 * fs, s: fs, facing: -1, outfit: YUSUF_GOLD, pose: breathe(POSES.sit, t), expr: 'neutral', look: [-1, 0.3], rim, shadow: false });
    for (let i = 0; i < 5; i++) { const x = CX - V(480, 400) + i * V(130, 110); person(g, { x, y: GY + 50 + (i % 2) * 12, s: V(1.15, 1.2), facing: 1, outfit: BROTHERS[i], pose: breathe(POSES.kneel, t, 1, i), expr: 'confused', look: [1, -0.4], rim }); if (i % 2 === 0) text(g, '?', x + 10, GY + 50 - 230, { size: 60, color: '#ffffff', font: FONTS.title, alpha: ease.out(prog(t, 0.6 + i * 0.15, 1.0 + i * 0.15)) }); }
  });
} });
// w19 — "Kalau kamu jadi Yusuf, apa yang akan kamu lakukan? Membalas… atau memaafkan? Tulis di komentar."
registerShot('w19', { draw(g, t, info) {
  blurBg(g, (g) => palace(g, t, { z: 1.4 }, {}), 16, 0.6, '#04020a');
  choicePrompt(g, t, ['KALAU KAMU JADI YUSUF…', 'APA YANG KAMU LAKUKAN?'], 'MEMBALAS', 'MEMAAFKAN');
} });
// w20 — "Hingga akhirnya Yusuf berkata: Akulah Yusuf."
registerShot('w20', { draw(g, t, info) {
  const say = wt('"Akulah', 70, info), up = ease.out(prog(t, say - 0.1, say + 0.4));
  blurBg(g, (g) => palace(g, t, { z: 1.5, y: -80 }, {}), 14, 0.4);
  FX.godRays(g, E.W / 2, E.H * 0.5, { count: 14, angle: 0, spread: Math.PI * 2, len: E.H, color: HOLY, a: 0.12 * up, t });
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: YUSUF_GOLD, expr: 'smile', talk: t > say && t < say + 1.2 ? Math.max(0, 0.45 * Math.sin(t * 12)) : 0, rimColor: up > 0.3 ? HOLY : '#ffc890', rimSide: -1 });
  if (up > 0) bigText(g, '"AKULAH YUSUF"', E.H * V(0.16, 0.18), GOLD(), up);
} });
// brothers kneeling around Yusuf (w21–w23)
function confession(g, t, info, o) {
  const cam = { z: 1.08, x: o.x || 0 };
  const { GY, CX, M } = palace(g, t, cam, {});
  if (o.light) glow(g, CX + V(300, 240), GY - 250, 600 * o.light, HOLY, 0.4);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX + V(300, 240), y: GY + 40, s: V(1.6, 1.65), facing: -1, outfit: YUSUF_GOLD, pose: breathe(o.yPose || POSES.stand, t), expr: 'smile', rim: { color: o.light ? HOLY : M.rim, dir: [0, -1], w: 5 } });
    for (let i = 0; i < 5; i++) { const [sx, sy] = o.shake ? [Math.sin(t * 40 + i) * 3, 0] : [0, 0]; person(g, { x: CX - V(500, 420) + i * V(140, 115) + sx, y: GY + 50 + (i % 2) * 12 + sy, s: V(1.15, 1.2), facing: 1, outfit: BROTHERS[i], pose: breathe(o.bPose || POSES.kneel, t, 1, i), expr: o.expr, rim: { color: o.light ? HOLY : M.rim, dir: [1, -0.4], w: 4 } }); }
  });
}
// w21 — "Mereka gemetar ketakutan."
registerShot('w21', { draw(g, t, info) { confession(g, t, info, { expr: 'scared', shake: true, bPose: { ...POSES.kneel, eF: [30, -150], hF: [12, -190], eB: [-20, -150], hB: [-6, -190] } }); veil(g, '#200000', 0.2); } });
// w22 — "Tapi Yusuf menjawab: Pada hari ini tidak ada cercaan atas kalian."
registerShot('w22', { draw(g, t, info) { confession(g, t, info, { expr: 'surprised', light: ease.out(prog(t, 0.3, 2.0)), yPose: posesAt(t, [[0, 'stand'], [0.8, { ...POSES.cheer, eF: [30, -170], hF: [56, -160], eB: [-24, -170], hB: [-50, -160] }]], 0.5) }); } });
// w23 — "Semoga Allah mengampuni kalian."
registerShot('w23', { draw(g, t, info) { confession(g, t, info, { expr: 'cry', light: 1, x: -V(40, 30) * t, yPose: { ...POSES.cheer, eF: [30, -170], hF: [56, -160], eB: [-24, -170], hB: [-50, -160] } }); for (let i = 0; i < 10; i++) FX.sparkle(g, E.W * (0.1 + i * 0.09), E.H * 0.45 - ((t * 60 + i * 40) % 300), 14, HOLY, 0.7); } });
// w24 — "Lalu ia memberikan bajunya. Usapkan ke wajah ayahku."
registerShot('w24', { draw(g, t, info) {
  blurBg(g, (g) => palace(g, t, { z: 1.4 }, {}), 12, 0.45, '#0a0604');
  const give = ease.inOut(prog(t, 0.3, 1.6)), x = lerp(E.W * 0.62, E.W * 0.38, give);
  FX.godRays(g, x, E.H * 0.45, { count: 12, angle: 0, spread: Math.PI * 2, len: E.H * 0.8, color: HOLY, a: 0.1, t });
  qamis(g, x, E.H * 0.45, V(1.4, 1.6), { glowC: HOLY, rot: (give - 0.5) * 0.2 });
  seg(g, [[E.W * 1.1, E.H * 0.7], [x + V(170, 190), E.H * 0.4]], 28, S().ink); seg(g, [[-E.W * 0.1, E.H * 0.75], [x - V(170, 190), E.H * 0.42 + (1 - give) * 200]], 28, S().ink);
} });
// w25 — "Nabi Yaqub, yang matanya memutih karena bertahun-tahun bersedih…"
registerShot('w25', { draw(g, t, info) {
  const M = mood('dusk'), r = V(300, 330) * (1 + 0.03 * t), cx = E.W / 2, cy = E.H * V(0.6, 0.56);
  blurBg(g, (g) => desert(g, t, { z: 1.4 }, { mood: 'dusk', wind: false }), 14, 0.4);
  bigPerson(g, cx, cy, r, { outfit: YAQUB, expr: 'sad', rimColor: M.rim, rimSide: -1 });
  blindEyes(g, cx, cy, r, 0);
  if (t > 1.5) { g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(cx - r * 0.36, cy + 0.12 * r + (t - 1.5) * 40, 10, 18, 0, 0, Math.PI * 2); g.fill(); }
} });
// w26 — "kembali bisa melihat."
registerShot('w26', { draw(g, t, info) {
  const M = mood('golden'), r = V(300, 330), cx = E.W / 2, cy = E.H * V(0.6, 0.56), see = ease.out(prog(t, 0.3, 1.2));
  blurBg(g, (g) => desert(g, t, { z: 1.4 }, { mood: 'golden', wind: false }), 14, 0.3);
  FX.godRays(g, cx, cy, { count: 16, angle: 0, spread: Math.PI * 2, len: E.H, color: HOLY, a: 0.12 * see, t });
  bigPerson(g, cx, cy, r, { outfit: YAQUB, expr: see > 0.6 ? 'joy' : 'awe', rimColor: HOLY, rimSide: -1 });
  if (see < 1) blindEyes(g, cx, cy, r, see);
  const sh = 1 - ease.in(prog(t, 0, 0.6)); if (sh > 0) { g.save(); g.globalAlpha = sh; qamis(g, cx, cy, V(1.2, 1.3), { glowC: HOLY }); g.restore(); }
} });
// w27 — "Keluarga itu akhirnya bersatu di Mesir."
registerShot('w27', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  const meet = ease.out(prog(t, 0, 1.4)), rim = { color: M.rim, dir: [0, -1], w: 5 };
  layer(g, cam, 1, (g) => {
    person(g, { x: lerp(CX - V(420, 360), CX - V(70, 60), meet), y: GY + 50, s: V(1.6, 1.65), facing: 1, outfit: YUSUF_GOLD, pose: meet < 1 ? walkPose(t * 9, { run: true }) : { ...POSES.cheer, eF: [30, -160], hF: [56, -150], eB: [-20, -160], hB: [-6, -150] }, expr: 'joy', rim });
    person(g, { x: CX + V(80, 70), y: GY + 50, s: V(1.6, 1.65), facing: -1, outfit: YAQUB, pose: breathe({ ...POSES.cheer, eF: [30, -160], hF: [56, -150], eB: [-20, -160], hB: [-6, -150] }, t), expr: 'cry', staff: true, staffHand: 'B', rim });
    person(g, { x: CX + V(240, 210), y: GY + 46, s: V(1.5, 1.55), facing: -1, outfit: IBU, pose: breathe(POSES.holdFront, t, 1, 2), expr: 'happy', rim });
  });
  for (let i = 0; i < 8; i++) FX.sparkle(g, E.W / 2 + Math.sin(i * 2) * 300, E.H * 0.4 + Math.cos(i * 1.6) * 150 - t * 20, 14, M.key, 0.6 * Math.abs(Math.sin(t * 3 + i)));
} });
// family bowing in the throne hall (w28/w29)
function bowing(g, t, cam, bow) {
  const fs = V(1.15, 1.2), tx = E.W / 2 + V(330, 300);
  const { GY, CX, M } = palace(g, t, cam, { throne: tx, throneK: fs });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    person(g, { x: tx - 6 * fs, y: GY - 78 * fs, s: fs, facing: -1, outfit: YUSUF_GOLD, pose: breathe(POSES.sit, t), expr: 'happy', rim, shadow: false });
    const fam = [YAQUB, IBU, ...BROTHERS, BUNYAMIN];
    fam.forEach((of, i) => { const row = i < 2 ? 0 : 1 + Math.floor((i - 2) / 6), col = i < 2 ? i : (i - 2) % 6; const x = CX - V(140, 160) + col * V(110, 85) - row * V(70, 60) + (row === 0 ? V(60, 40) : -V(360, 300)), y = GY + 30 + row * V(60, 70); const b = clamp(bow * 1.4 - i * 0.03); person(g, { x, y, s: V(0.95, 0.95) * (row === 0 ? 1.08 : 1), facing: 1, outfit: of, pose: posesAt(b, [[0, 'stand'], [0.4, 'kneel'], [0.85, SUJUD]], 0.3), expr: 'sleepy', rim }); });
  });
  return { GY, CX, M };
}
// w28 — "Ayah, ibu, dan sebelas saudaranya tunduk memberi hormat."
registerShot('w28', { draw(g, t, info) { const k = ease.inOut(t / info.dur); bowing(g, t, { z: 1.0 + 0.05 * k, y: -20 }, ease.inOut(prog(t, wt('tunduk', 98, info) - 1.0, wt('tunduk', 98, info) + 1.0))); } });
// w29 — "Wahai ayahku… inilah takwil mimpiku dahulu."  the dream returns over the family
registerShot('w29', { draw(g, t, info) {
  const show = ease.out(prog(t, 0.3, 1.6));
  bowing(g, t, { z: 1.05 }, 1);
  veil(g, '#060820', 0.5 * show);
  g.save(); g.globalAlpha = show; g.globalCompositeOperation = 'lighter';
  const W = E.W, H = E.H; for (let i = 0; i < 11; i++) { const ang = Math.PI * (1.08 + 0.84 * i / 10), r = V(560, 420), x = W / 2 + Math.cos(ang) * r, y = H * V(0.5, 0.46) + Math.sin(ang) * r * V(0.7, 0.9); glow(g, x, y, 80, '#fff4c0', 0.6); FX.sparkle(g, x, y, 30, '#fffbe8', 1); }
  FX.sun(g, W * 0.3, H * V(0.12, 0.1), V(60, 70), '#fff3dc', '#ffc060', 4); FX.moon(g, W * 0.7, H * V(0.12, 0.1), V(48, 56), '#e8ecff');
  g.restore();
  if (show > 0.8) bigText(g, 'MIMPI ITU MENJADI NYATA', E.H * V(0.92, 0.9), GOLD(), ease.out(prog(t, 1.6, 2.2)), V(60, 62));
} });
// w30 — "Dari sumur yang gelap, Allah mengangkat Yusuf ke kedudukan yang mulia."  rising out of the well into the palace
registerShot('w30', { draw(g, t, info) {
  const rise = ease.inOut(prog(t, 0.3, 3.2)), hit = prog(t, 3.2, 3.6);
  if (hit <= 0) {
    g.save(); g.translate(E.W / 2, E.H * 0.22); g.scale(1 + rise * 3, 1 + rise * 3); g.translate(-E.W / 2, -E.H * 0.22);
    wellInside(g, t, { sky: '#fff0c0', light: 0.5 + 0.5 * rise });
    person(g, { x: E.W / 2, y: E.H * 0.92, s: V(1.6, 1.8), facing: 1, outfit: YUSUF_KID, pose: POSES.cheer, expr: 'awe', look: [0, -1], rim: { color: '#fff0c0', dir: [0, -1], w: 5 } });
    g.restore();
  } else {
    const cam = { z: 1.15 - 0.08 * prog(t, 3.2, info.dur), y: -60 };
    const { GY, CX, M } = palace(g, t, cam, {});
    layer(g, cam, 1, (g) => { glow(g, CX, GY - 250, 500, GOLD(), 0.35); person(g, { x: CX, y: GY + 30, s: V(2.1, 2.2), facing: 1, outfit: YUSUF_GOLD, pose: breathe(POSES.relaxed, t), expr: 'smile', rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
  }
  if (hit > 0 && hit < 1) veil(g, '#ffffff', 0.8 * (1 - hit), 'lighter');
} });
// w31 — "Apa pun ujianmu hari ini… jangan pernah putus asa dari rahmat Allah."
registerShot('w31', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.06 * k, y: 30 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'golden', sunX: 0, wind: false });
  FX.godRays(g, E.W / 2, GY - V(330, 520), { count: 12, angle: Math.PI / 2, spread: 2.6, len: E.H, color: '#ffe6b0', a: 0.1, t });
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + 40, s: V(1.7, 1.8), facing: 1, outfit: YUSUF_GOLD, pose: breathe(POSES.relaxed, t), expr: 'smile', rim: { color: HOLY, dir: [0, -1], w: 6 } }));
  const a = ease.out(prog(t, wt('jangan', 111, info) - 0.2, wt('jangan', 111, info) + 0.5));
  bigText(g, 'JANGAN PUTUS ASA', E.H * V(0.14, 0.16), '#ffffff', a, V(76, 80)); bigText(g, 'DARI RAHMAT ALLAH', E.H * V(0.14, 0.16) + V(90, 96), GOLD(), a, V(76, 80));
} });
// w32 — "Pelajaran mana yang paling menyentuh hatimu? Tulis di komentar."
registerShot('w32', { draw(g, t, info) {
  blurBg(g, (g) => desert(g, t, { z: 1.2 }, { mood: 'golden', wind: false }), 14, 0.5, '#0a0604');
  commentPrompt(g, t, ['PELAJARAN MANA', 'YANG PALING', 'MENYENTUH HATIMU?'], { y: E.H * V(0.2, 0.22) });
  const a = ease.out(prog(t, 1.2, 1.8)), y = E.H * V(0.8, 0.78);
  qamis(g, E.W * 0.25, y, 0.45, { blood: 1 }); qamisTorn(g, E.W * 0.5, y, 0.45, { tear: 1 }); qamis(g, E.W * 0.75, y, 0.45, { glowC: HOLY });
  text(g, 'TAMAT', E.W / 2, E.H * V(0.94, 0.93), { size: V(64, 68), color: GOLD(), font: FONTS.title, stroke: 10, strokeColor: '#000', spacing: 8, alpha: a });
} });
