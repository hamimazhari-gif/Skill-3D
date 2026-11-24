// shots/hud1.js — Kisah Nabi Hud, Part 1 (h01–h13).
import { E, V, S, registerShot, mood, layer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, poly } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson, palm, sheep, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { idol } from '../lib8/_sea.js';
import { HUD, AD } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff4a3a';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const STONE = '#c8a070';
// a tall column with fluting and a capital; h = height, k = rise 0..1
function column(g, x, y, h, w, c, k = 1) {
  const hh = h * k; g.fillStyle = c; g.fillRect(x - w / 2, y - hh, w, hh);
  g.fillStyle = alpha('#000', 0.18); for (let i = 1; i < 4; i++) g.fillRect(x - w / 2 + i * w / 4 - 2, y - hh + 30, 4, hh - 50);
  g.fillStyle = alpha('#000', 0.25); g.fillRect(x - w / 2, y - hh, w * 0.3, hh);
  if (k > 0.98) { g.fillStyle = c; g.fillRect(x - w * 0.8, y - hh - 30, w * 1.6, 34); g.fillRect(x - w * 0.65, y - hh - 54, w * 1.3, 26); }
  g.fillStyle = c; g.fillRect(x - w * 0.75, y - 26, w * 1.5, 26);
}
// Iram: desert, hills with palaces, tall columns
function iram(g, t, cam, o = {}) {
  const r = desert(g, t, cam, { mood: o.mood || 'golden', sunX: o.sunX ?? V(260, 150) }), { GY, CX, M } = r;
  const c1 = o.stone || STONE;
  layer(g, cam, 0.35, (g) => { for (let i = 0; i < 4; i++) { const x = CX - V(700, 560) + i * V(470, 380), y = GY - V(150, 240), k = o.hillK ? o.hillK(i) : 1; if (k <= 0) continue; g.fillStyle = alpha(mix2(c1, M.sky[0]), 1); g.fillRect(x - 70, y - 120 * k, 140, 120 * k); poly(g, [[x - 90, y - 120 * k], [x + 90, y - 120 * k], [x, y - 200 * k]], mix2(c1, M.sky[0])); } });
  layer(g, cam, 0.6, (g) => { const n = o.cols ?? 7; for (let i = 0; i < n; i++) { const x = CX - V(760, 600) + i * V(255, 200), h = V(760, 1050) * (0.8 + 0.25 * ((i * 37) % 5) / 4); column(g, x, GY + 30, h, V(70, 62), shadeC(c1, -0.12 - (i % 2) * 0.06), o.colK ? o.colK(i) : 1); } });
  return r;
}
const mix2 = (a, b) => { const pa = parseInt(a.slice(1), 16), pb = parseInt((b.startsWith('#') ? b : '#806060').slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * 0.55 + ((pb >> s) & 255) * 0.45)); return `rgb(${c.join(',')})`; };
const shadeC = (a, k) => { const p = parseInt(a.slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(clamp(((p >> s) & 255) * (1 + k), 0, 255))); return `rgb(${c.join(',')})`; };
const adCrowd = (g, x0, dx, y, s, t, o = {}) => { for (let i = 0; i < (o.n || 4); i++) person(g, { x: x0 + i * dx, y: y + (i % 2) * 16, s, facing: o.facing ? o.facing(i) : 1, outfit: AD[i % AD.length], pose: o.walk ? walkPose(t * 3 + i) : breathe(o.pose ? o.pose(i) : POSES.stand, t, 1.5, i), expr: o.expr ? o.expr(i) : 'neutral', rim: o.rim }); };

// h01 — "Ada satu bangsa… belum pernah diciptakan yang seperti mereka…" giants walking over the dunes + title
registerShot('h01', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.05 + 0.02 * t }, { mood: 'dusk', sunX: V(0, 0) });
  adCrowd(g, CX - V(500, 420) + t * 40, V(260, 220), GY + V(140, 170), V(2.1, 2.2), t, { walk: true, n: 4, rim: { color: M.rim, dir: [0, -1], w: 5 } });
  palm(g, CX + V(420, 330), GY + V(190, 220), 0.45, '#1a1220', t);
  veil(g, '#05030a', 0.3 * (1 - prog(t, 4.4, 5.2)));
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI HUD', 'PART 1'], dur: 4.6, y: E.H * 0.3 });
  small(g, 'QS. AL-FAJR: 8', E.H * V(0.13, 0.13), alpha('#ffffff', 0.85), fadeIn(t, wt('Allah', 1.5, info) + 1.2) , V(40, 42));
} });
// h02 — "Mereka adalah kaum 'Ad."
registerShot('h02', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.12 }, { mood: 'golden' });
  adCrowd(g, CX - V(390, 320), V(260, 210), GY + V(150, 180), V(1.9, 2.0), t, { n: 4, facing: (i) => (i < 2 ? 1 : -1), pose: (i) => (i % 2 ? POSES.crossArms : POSES.stand), expr: () => 'smirk', rim: { color: M.rim, dir: [1, -0.4], w: 5 } });
  big(g, "KAUM 'AD", E.H * V(0.2, 0.2), GOLD(), ease.outBack(prog(t, wt("'Ad.", 7, info) - 0.15, wt("'Ad.", 7, info) + 0.25)), V(130, 140));
} });
// h03 — "Tubuh mereka besar dan sangat kuat." a giant beside a normal palm, lifting a boulder
registerShot('h03', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.08 }, { mood: 'golden' });
  palm(g, CX - V(330, 280), GY + V(190, 220), 0.5, '#2a1a14', t);
  const lift = ease.inOut(prog(t, wt('kuat.', 10, info) - 0.6, wt('kuat.', 10, info) + 0.2));
  const gx = CX + V(80, 60), gy = GY + V(200, 230), s = V(3.0, 3.1);
  const rockY = lerp(gy - 40, gy - 230 * s, lift);
  person(g, { x: gx, y: gy, s, facing: -1, outfit: AD[0], pose: lift > 0.5 ? { ...POSES.cheer, hF: [20, -230], hB: [-20, -230], eF: [40, -190], eB: [-40, -190] } : POSES.crouch, expr: 'angry', rim: { color: M.rim, dir: [1, -0.4], w: 6 } });
  g.fillStyle = '#6a5040'; g.beginPath(); g.ellipse(gx, rockY - 90, V(170, 160), V(110, 105), 0.1, 0, Math.PI * 2); g.fill(); g.fillStyle = alpha('#000', 0.25); g.beginPath(); g.ellipse(gx + 40, rockY - 70, V(120, 110), V(80, 75), 0.1, 0, Math.PI * 2); g.fill();
  if (lift > 0.9) FX.dust(g, gx, gy, t - 2, { count: 10, color: '#d8b890' });
  big(g, 'BESAR & KUAT', E.H * V(0.15, 0.13), '#ffffff', fadeIn(t, wt('besar', 9, info) - 0.1), V(90, 96));
} });
// h04 — "Kota mereka bernama Iram… kota dengan tiang-tiang yang menjulang tinggi."  tilt up the columns
registerShot('h04', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0.5, info.dur)), cam = { z: 1.15 - 0.1 * k, y: -V(120, 200) * k };
  iram(g, t, cam, { mood: 'golden' });
  big(g, 'IRAM', E.H * V(0.82, 0.84), GOLD(), ease.outBack(prog(t, wt('Iram…', 12, info) - 0.15, wt('Iram…', 12, info) + 0.25)), V(150, 160));
  small(g, 'KOTA BERTIANG TINGGI', E.H * V(0.89, 0.9), '#ffffff', fadeIn(t, wt('tiang-tiang', 13.5, info) - 0.1));
} });
// h05 — "Di setiap bukit, mereka membangun bangunan megah… hanya untuk bermegah-megahan."
registerShot('h05', { draw(g, t, info) {
  const { GY, CX, M } = iram(g, t, { z: 1.0 }, { mood: 'golden', cols: 0, hillK: (i) => ease.outBack(prog(t, 0.3 + i * 0.45, 0.8 + i * 0.45)) });
  adCrowd(g, CX - V(250, 200), V(170, 140), GY + V(170, 200), V(1.5, 1.6), t, { n: 3, pose: () => POSES.cheer, expr: () => 'grin', rim: { color: M.rim, dir: [1, -0.4], w: 4 } });
  small(g, 'HANYA UNTUK BERMEGAH-MEGAHAN', E.H * V(0.13, 0.13), '#ffd9a0', fadeIn(t, wt('hanya', 18.5, info) - 0.1), V(44, 46));
} });
// h06 — "benteng-benteng kokoh… seolah-olah mereka akan hidup selamanya."
registerShot('h06', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.05 }, { mood: 'dusk' });
  const rise = ease.out(prog(t, 0.2, 1.6)), wy = GY + V(60, 80), wh = V(520, 700) * rise;
  g.fillStyle = shadeC(STONE, -0.3); g.fillRect(-E.W, wy - wh, E.W * 3, wh + 400);
  g.fillStyle = shadeC(STONE, -0.4); for (let x = -40; x < E.W + 80; x += 120) g.fillRect(x, wy - wh - 60, 70, 62);
  g.strokeStyle = alpha('#000', 0.18); g.lineWidth = 3; for (let y = wy - wh + 70; y < wy; y += 70) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  g.fillStyle = shadeC(STONE, -0.2); g.fillRect(CX - V(260, 200), wy - wh - V(240, 300) * rise, V(220, 180), V(240, 300) * rise + 10); g.fillRect(CX + V(60, 40), wy - wh - V(320, 400) * rise, V(220, 180), V(320, 400) * rise + 10);
  person(g, { x: CX, y: GY + V(260, 300), s: V(2.0, 2.1), facing: 1, outfit: AD[2], pose: breathe(POSES.crossArms, t), expr: 'smirk', rim: { color: M.rim, dir: [0, -1], w: 5 } });
  big(g, 'SELAMANYA?', E.H * V(0.14, 0.12), '#ffffff', fadeIn(t, wt('selamanya.', 23.5, info) - 0.1), V(110, 116));
} });
// h07 — "Kebun-kebun subur. Ternak melimpah. Mata air mengalir."
registerShot('h07', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.08 }, { mood: 'golden' });
  const a1 = fadeIn(t, 0), a2 = fadeIn(t, wt('Ternak', 26.8, info) - 0.2), a3 = fadeIn(t, wt('Mata', 28.3, info) - 0.2);
  g.fillStyle = alpha('#4a7a2a', 0.85 * a1); g.beginPath(); g.ellipse(CX, GY + V(170, 220), E.W * 0.9, V(140, 180), 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 6; i++) { const k = ease.outBack(prog(t, i * 0.15, 0.5 + i * 0.15)); if (k > 0) palm(g, CX - V(560, 440) + i * V(220, 175), GY + V(100, 140) + (i % 2) * 30, 0.55 * k, '#1e3a18', t, i); }
  if (a3 > 0) { g.fillStyle = alpha('#4aa8e0', 0.85 * a3); g.beginPath(); g.ellipse(CX + V(280, 200), GY + V(260, 320), V(220, 180), V(50, 60), 0, 0, Math.PI * 2); g.fill(); for (let i = 0; i < 6; i++) FX.sparkle(g, CX + V(200, 140) + i * 30, GY + V(250, 310) + Math.sin(t * 3 + i) * 8, 10, '#e8f6ff', 0.6 * a3); }
  for (let i = 0; i < 5; i++) { const k = clamp(a2 * 5 - i, 0, 1); if (k > 0) sheep(g, CX - V(440, 360) + i * V(110, 90) + (1 - k) * -60, GY + V(280, 340) + (i % 2) * 30, V(1.1, 1.0), 1, t, i, null); }
  [['KEBUN SUBUR', a1], ['TERNAK MELIMPAH', a2], ['MATA AIR MENGALIR', a3]].forEach(([s, a], i) => small(g, s, E.H * V(0.12, 0.12) + i * V(70, 74), i === 0 ? '#c8f0a0' : i === 1 ? '#ffffff' : '#a8e0ff', a));
} });
// h08 — "Semua kenikmatan ada pada mereka."
registerShot('h08', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)); const { GY, CX } = iram(g, t, { z: 1.2 - 0.15 * k }, { mood: 'golden' });
  for (let i = 0; i < 24; i++) { const p = (t * 0.4 + i / 24) % 1; FX.sparkle(g, (i * 211) % E.W, E.H * (0.9 - p * 0.8), 12, GOLD(), 0.7 * Math.sin(p * Math.PI)); }
  big(g, 'SEMUA KENIKMATAN', E.H * V(0.14, 0.13), GOLD(), fadeIn(t, 0.1), V(84, 88));
} });
// h09 — "Tapi… mereka menyembah berhala."
registerShot('h09', { draw(g, t, info) {
  const dark = ease.inOut(prog(t, 0, 0.9)); const { GY, CX } = desert(g, t, { z: 1.1 }, { mood: 'dusk' }); veil(g, '#1a0004', 0.45 * dark);
  idol(g, CX, GY + V(90, 110), V(1.3, 1.4), '#5a4a3a'); idol(g, CX - V(360, 290), GY + V(60, 80), V(0.8, 0.85), '#4a3a2a'); idol(g, CX + V(360, 290), GY + V(60, 80), V(0.8, 0.85), '#4a3a2a');
  if (t > wt('menyembah', 34.5, info) - 0.3) adCrowd(g, CX - V(380, 300), V(250, 200), GY + V(290, 340), V(1.5, 1.6), t, { n: 4, pose: () => ({ ...POSES.kneel, eF: [26, -150], hF: [34, -186], eB: [18, -150], hB: [26, -184] }), expr: () => 'neutral', facing: () => 1, rim: { color: RED, dir: [0, -1], w: 4 } });
  big(g, 'TAPI…', E.H * V(0.14, 0.13), '#ffffff', fadeIn(t, 0.05) * (1 - prog(t, 1.0, 1.3)), V(110, 116)); small(g, 'MENYEMBAH BERHALA', E.H * V(0.14, 0.13), '#ff8a6a', fadeIn(t, wt('berhala.', 35, info) - 0.1), V(60, 62));
} });
// h10 — "ketika menyiksa, mereka menyiksa dengan kejam." symbolic silhouette, no gore
registerShot('h10', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a0806', '#1a0204', '#050002']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.5, E.W * 0.8, RED, 0.25);
  const GY = E.H * 0.72; g.fillStyle = '#0a0204'; g.fillRect(-E.W, GY, E.W * 3, E.H);
  const swing = Math.max(0, Math.sin(t * 3)), [qx, qy] = shake(t, swing > 0.95 ? 6 : 0, 30);
  g.save(); g.translate(qx, qy);
  person(g, { x: E.W * 0.4, y: GY, s: V(2.6, 2.7), facing: 1, outfit: { ...AD[4], color: '#000' }, pose: { ...POSES.point, hF: [lerp(-30, 80, swing), lerp(-280, -200, swing)], eF: [lerp(-20, 50, swing), lerp(-220, -190, swing)] }, expr: 'angry', dim: true, rim: { color: RED, dir: [1, -0.4], w: 5 } });
  person(g, { x: E.W * 0.72, y: GY, s: V(1.0, 1.05), facing: -1, outfit: { top: 'dress', color: '#000', head: 'none' }, pose: POSES.crouch, expr: 'scared', dim: true, rim: { color: '#ff9a7a', dir: [-1, -0.4], w: 3 } });
  g.restore();
  big(g, 'KEJAM', E.H * V(0.16, 0.15), RED, fadeIn(t, wt('kejam.', 38.5, info) - 0.1), V(130, 140));
} });
// h11 — "Siapa yang lebih kuat dari kami?"
registerShot('h11', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a1a08', '#120804']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const shout = t > wt('Siapa', 42, info) - 0.1, [qx, qy] = shout ? shake(t, 4, 20) : [0, 0];
  bigPerson(g, E.W / 2 + qx, E.H * V(0.62, 0.58) + qy, V(320, 350), { outfit: AD[0], expr: shout ? 'angry' : 'smirk', talk: shout ? Math.max(0, 0.7 * Math.sin(t * 13)) : 0, rimColor: '#ffb070', rimSide: -1 });
  const a = ease.outBack(prog(t, wt('Siapa', 42, info) - 0.1, wt('Siapa', 42, info) + 0.3));
  big(g, 'SIAPA YANG', E.H * V(0.12, 0.12), '#ffffff', a, V(80, 84)); big(g, 'LEBIH KUAT', E.H * V(0.18, 0.18), '#ff8a4a', a, V(96, 100)); big(g, 'DARI KAMI?', E.H * V(0.24, 0.24), '#ffffff', fadeIn(t, wt('kami?', 43, info) - 0.15), V(80, 84));
} });
// h12 — "Mereka lupa… Allah yang menciptakan mereka… jauh lebih kuat dari mereka."  pull back: tiny city, vast sky, light (Allah not depicted)
registerShot('h12', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0.2, 3.0)); iram(g, t, { z: lerp(1.0, 0.42, k), y: V(200, 300) * k }, { mood: 'dusk' });
  const L = ease.out(prog(t, wt('Allah', 45.8, info) - 0.2, wt('Allah', 45.8, info) + 1.2));
  FX.godRays(g, E.W / 2, -E.H * 0.05, { count: 13, angle: Math.PI / 2, spread: 0.9, len: E.H * 1.3, color: HOLY, a: 0.12 * L, t }); glow(g, E.W / 2, 0, E.W * 0.7, HOLY, 0.35 * L);
  small(g, 'MEREKA LUPA…', E.H * V(0.2, 0.2), '#ffffff', fadeIn(t, 0.2) * (1 - prog(t, wt('jauh', 47, info) - 0.4, wt('jauh', 47, info) - 0.1)), V(62, 64));
  big(g, 'ALLAH', E.H * V(0.17, 0.17), HOLY, fadeIn(t, wt('jauh', 47, info) - 0.1), V(110, 116)); big(g, 'JAUH LEBIH KUAT', E.H * V(0.23, 0.23), '#ffffff', fadeIn(t, wt('kuat', 47.9, info) - 0.1), V(80, 84));
} });
// h13 — "Lalu Allah mengutus seorang nabi… Namanya… Hud."
registerShot('h13', { draw(g, t, info) {
  const { GY, CX, M } = desert(g, t, { z: 1.1 + 0.03 * t }, { mood: 'dawn', sunX: V(0, 0) });
  const nm = wt('Hud.', 54.5, info), a = ease.out(prog(t, 0.2, 1.4));
  FX.godRays(g, CX, GY - V(330, 520), { count: 11, len: V(1400, 1700), spread: 2.6, color: HOLY, a: 0.08 * a, t });
  person(g, { x: CX, y: GY + V(170, 200), s: V(1.9, 2.0), facing: 1, outfit: HUD, pose: breathe(POSES.stand, t), expr: 'neutral', dim: t < nm - 0.3, rim: { color: HOLY, dir: [0, -1], w: 6 * a } });
  const r = ease.outBack(prog(t, nm - 0.1, nm + 0.35)); big(g, 'HUD', E.H * V(0.2, 0.2), GOLD(), r, V(190, 200)); small(g, "NABI UNTUK KAUM 'AD", E.H * V(0.27, 0.27), '#ffffff', fadeIn(t, nm + 0.4));
  small(g, 'BERSAMBUNG KE PART 2', E.H * V(0.93, 0.93), '#ffffff', fadeIn(t, nm + 1.0), V(46, 48));
} });
