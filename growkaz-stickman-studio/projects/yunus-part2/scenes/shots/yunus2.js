// shots/yunus2.js — Kisah Nabi Yunus, Part 2 (v01–v16).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, ring, rr, text, FONTS, wordTime, linGrad, poly } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { shore, waterSurface, crash } from '../sets/sea.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { underwater, bigFish, fishInside, ship } from '../lib8/_sea.js';
import { YUNUS } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const SAILOR = [{ top: 'tshirt', color: '#3a5a7a', head: 'beanie', headColor: '#a8321e' }, { top: 'tshirt', color: '#5a4a3a', head: 'none' }, { top: 'tshirt', color: '#4a3a4a', head: 'capBack', headColor: '#6a6a3a' }];
// sea + sky; storm 0..1
function seaScene(g, t, storm, o = {}) {
  const W = E.W, H = E.H, wy = H * (o.wy ?? 0.55);
  g.fillStyle = linGrad(g, 0, 0, 0, wy, [lerpC('#3a5a9a', '#05060e', storm), lerpC('#e8a070', '#141a30', storm), lerpC('#f8d0a0', '#2a3048', storm)]); g.fillRect(-W, -H, W * 3, wy + H);
  if (storm < 0.5) FX.sun(g, W * 0.7, wy - 140, 60, '#fff3dc', '#ffc070', 4);
  if (storm > 0.5) { FX.lightning(g, { x1: W * 0.25, y1: 0, x2: W * 0.35, y2: wy - 100, seed: Math.floor(t * 2) }); FX.rain(g, t, { count: Math.floor(160 * storm), a: 0.3 }); }
  const roll = Math.sin(t * (1 + storm * 1.4)) * (0.03 + 0.2 * storm) + (o.tilt || 0), bob = Math.sin(t * 2) * (8 + 30 * storm);
  g.fillStyle = linGrad(g, 0, wy, 0, H, [lerpC('#2a6aa8', '#0e2a4a', storm), '#04101e']); g.fillRect(-W, wy, W * 3, H);
  return { wy, roll, bob };
}
function lerpC(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, k))); return `rgb(${c.join(',')})`; }
function boat(g, t, x, y, s, roll, crew, o = {}) {
  ship(g, x, y, s, t, roll);
  g.save(); g.translate(x, y); g.rotate(roll); for (let i = 0; i < 6; i++) { rr(g, (-200 + i * 50) * s, -80 * s, 44 * s, 40 * s, 6); g.fillStyle = i % 2 ? '#8a6a3a' : '#a07a44'; g.fill(); }
  crew.forEach((c, i) => person(g, { x: c.x * s, y: -40 * s, s: s * (c.s || 0.9), facing: c.f || 1, outfit: c.of, pose: c.pose || breathe(POSES.stand, t, 1, i), expr: c.expr || 'neutral', rim: o.rim, shadow: false }));
  g.restore();
}
// lots: a jar and drawn sticks; n = which draw (1..3)
function lots(g, t, info, n, wordAt) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0c18', '#141a30', '#0a0c18']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.rain(g, t, { count: 80, a: 0.2 });
  const jx = E.W / 2, jy = E.H * 0.62; g.fillStyle = '#8a5a30'; g.beginPath(); g.ellipse(jx, jy, 170, 210, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6a4220'; g.fillRect(jx - 90, jy - 250, 180, 70); for (let i = 0; i < 7; i++) seg(g, [[jx - 70 + i * 23, jy - 250], [jx - 60 + i * 20, jy - 360 - (i % 3) * 20]], 10, '#d8c8a0');
  const pull = ease.out(prog(t, wordAt - 0.6, wordAt)), sx = jx + 40, sy = lerp(jy - 360, E.H * 0.2, pull);
  seg(g, [[sx, sy], [sx, sy + 260]], 18, '#e8dcb8'); seg(g, [[sx - 20, sy + 260], [E.W + 100, E.H * 0.6]], 50, S().ink);
  const a = ease.outBack(prog(t, wordAt - 0.05, wordAt + 0.3)); if (a > 0) { big(g, 'YUNUS', E.H * V(0.16, 0.14), '#ff6a4a', a, V(120, 130)); }
  for (let i = 0; i < n; i++) { const on = i < n - 1 || a > 0; text(g, '×' + (i + 1), E.W * (0.3 + i * 0.2), E.H * V(0.9, 0.92), { size: V(70, 76), color: on ? GOLD() : alpha('#ffffff', 0.2), font: FONTS.title, stroke: 10, strokeColor: '#000' }); }
}

// v01 — title
registerShot('v01', { draw(g, t, info) {
  const { wy, roll, bob } = seaScene(g, t, 0.8); boat(g, t, E.W / 2, wy - 10 + bob, V(0.8, 0.7), roll, []); waterSurface(g, t, wy, 0.6); veil(g, '#02030a', 0.4);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI YUNUS', 'PART 2'], dur: info.dur + 0.5, y: E.H * 0.42 });
  const a = ease.out(prog(t, 0.6, 1.1)) * (1 - prog(t, info.dur - 0.3, info.dur)); text(g, 'UNDIAN DI TENGAH BADAI', E.W / 2, E.H * 0.42 + V(130, 150), { size: V(52, 50), color: S().ui.accent, font: FONTS.title, glow: 22, glowColor: 'rgba(255,80,60,.7)', spacing: 3, alpha: a });
} });
// v02 — "Nabi Yunus tiba di tepi laut. Ia menumpang sebuah kapal yang penuh muatan."
registerShot('v02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.05 * k };
  const { GY, CX, M, hy } = shore(g, t, cam, { mood: 'golden', calm: 1 });
  layer(g, cam, 0.6, (g) => ship(g, CX + V(260, 200), GY - 10 + Math.sin(t * 2) * 6, V(0.9, 0.8), t, Math.sin(t) * 0.02));
  layer(g, cam, 1, (g) => person(g, { x: CX - V(380, 330) + t * 90, y: GY + V(150, 180), s: V(1.4, 1.45), facing: 1, outfit: YUNUS, pose: walkPose(t * 5), expr: 'neutral', staff: true, rim: { color: M.rim, dir: [1, -0.4], w: 4 } }));
} });
// v03 — "Awalnya, laut tenang."
registerShot('v03', { draw(g, t, info) { const { wy, roll, bob } = seaScene(g, t, 0); boat(g, t, E.W / 2 + Math.sin(t * 0.5) * 20, wy - 10 + bob, V(1.0, 0.85), roll, [{ x: -60, of: YUNUS, expr: 'neutral' }, { x: 90, of: SAILOR[0], f: -1 }]); waterSurface(g, t, wy, 0.5); } });
// v04 — "Lalu… langit menghitam. Angin mengamuk."
registerShot('v04', { draw(g, t, info) {
  const st = ease.inOut(prog(t, 0.3, info.dur)), { wy, roll, bob } = seaScene(g, t, st);
  boat(g, t, E.W / 2, wy - 10 + bob, V(1.0, 0.85), roll, [{ x: -60, of: YUNUS, expr: 'worried' }, { x: 90, of: SAILOR[0], f: -1, expr: 'worried' }]); waterSurface(g, t, wy, 0.6);
  for (let i = 0; i < 30 * st; i++) { const y = (i * 61) % E.H, x = ((t * 900 + i * 131) % (E.W * 1.4)) - E.W * 0.2; seg(g, [[x, y], [x - 120, y + 6]], 3, alpha('#cfe0ff', 0.35)); }
} });
// v05 — "Ombak setinggi bukit menghantam kapal!"
registerShot('v05', { draw(g, t, info) {
  const [qx, qy] = shake(t, 10, 25); g.translate(qx, qy);
  const { wy, roll, bob } = seaScene(g, t, 1); boat(g, t, E.W / 2, wy - 10 + bob, V(1.0, 0.85), roll * 1.4, [{ x: -60, of: YUNUS, pose: POSES.fall, expr: 'scared' }, { x: 90, of: SAILOR[0], f: -1, pose: POSES.handsOnHead, expr: 'scared' }]);
  const p = ease.inOut(prog(t, 0.2, 2.2)); g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#4a8ac8', '#12408a', '#04101e']); g.beginPath(); const cx = lerp(-E.W * 0.6, E.W * 0.4, p); g.moveTo(-E.W, E.H * 1.2); g.lineTo(-E.W, E.H * 0.6); g.quadraticCurveTo(cx - 200, E.H * 0.05, cx + 260, E.H * 0.2); g.quadraticCurveTo(cx + 420, E.H * 0.32, cx + 300, E.H * 0.42); g.quadraticCurveTo(cx + 120, E.H * 0.32, cx + 80, E.H * 0.5); g.lineTo(cx + 120, E.H * 1.2); g.closePath(); g.fill();
  for (let i = 0; i < 20; i++) circle(g, cx + 200 + Math.sin(i * 2) * 120, E.H * 0.22 + Math.cos(i * 1.3) * 80, 10 + (i % 3) * 6, alpha('#e8f6ff', 0.75));
  waterSurface(g, t, wy, 0.6);
} });
// v06 — "Kapal mulai oleng… hampir tenggelam!"
registerShot('v06', { draw(g, t, info) {
  const tilt = 0.25 + 0.1 * Math.sin(t * 2), { wy, bob } = seaScene(g, t, 1, { wy: 0.5 }); const [qx, qy] = shake(t, 5, 20); g.translate(qx, qy);
  boat(g, t, E.W / 2, wy + 30 + bob, V(1.25, 1.05), tilt, [{ x: -120, of: YUNUS, pose: POSES.ready, expr: 'scared' }, { x: 20, of: SAILOR[0], pose: POSES.handsOnHead, expr: 'scared' }, { x: 140, of: SAILOR[1], f: -1, pose: POSES.reach, expr: 'shocked' }]);
  waterSurface(g, t, wy + 20, 0.7);
} });
// v07 — "Kapal terlalu berat! Salah satu dari kita harus turun ke laut!"
registerShot('v07', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#05060e', '#141a30']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.rain(g, t, { count: 160, a: 0.35 });
  const [qx, qy] = shake(t, 4, 20);
  bigPerson(g, E.W / 2 + qx, E.H * V(0.6, 0.56) + qy, V(300, 330), { outfit: SAILOR[0], expr: 'scared', talk: Math.max(0, 0.6 * Math.sin(t * 13)), rimColor: '#bcd0ff', rimSide: -1 });
} });
// v08–v10 — the lots
registerShot('v08', { draw(g, t, info) { lots(g, t, info, 1, wt('Yunus.', 32, info)); text(g, 'UNDIAN', E.W / 2, E.H * V(0.32, 0.3), { size: V(60, 64), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.4)) * (1 - prog(t, wt('Yunus.', 32, info) - 0.3, wt('Yunus.', 32, info))) }); } });
registerShot('v09', { draw(g, t, info) { lots(g, t, info, 2, wt('Yunus.', 35, info)); } });
registerShot('v10', { draw(g, t, info) { lots(g, t, info, 3, wt('Yunus.', 38.5, info)); } });
// v11 — "Nabi Yunus sadar. Ini bukan kebetulan. Ini teguran dari Allah."
registerShot('v11', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#05060e', '#141a30']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.rain(g, t, { count: 120, a: 0.3 });
  const up = ease.out(prog(t, wt('teguran', 44, info) - 0.3, wt('teguran', 44, info) + 0.6));
  FX.godRays(g, E.W / 2, -E.H * 0.1, { count: 9, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.3, color: HOLY, a: 0.1 * up, t });
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.03 * t), { outfit: YUNUS, expr: up > 0.3 ? 'sad' : 'surprised', look: [0, -0.4], rimColor: up > 0.3 ? HOLY : '#bcd0ff', rimSide: -1 });
  const a = ease.out(prog(t, wt('bukan', 42, info) - 0.2, wt('bukan', 42, info) + 0.3)); big(g, 'BUKAN KEBETULAN', E.H * V(0.15, 0.15), '#ffffff', a, V(70, 72));
} });
// v12 — "Ia pun terjun ke laut yang mengamuk."
registerShot('v12', { draw(g, t, info) {
  const jump = ease.in(prog(t, 0.6, 1.6)), { wy, roll, bob } = seaScene(g, t, 1, { wy: 0.58 });
  ship(g, E.W * 0.32, wy - 10 + bob, V(1.0, 0.85), t, roll);
  const x = lerp(E.W * 0.5, E.W * 0.72, jump), y = lerp(wy - 140, wy + 160, jump) - Math.sin(jump * Math.PI) * 120;
  if (jump < 0.95) person(g, { x, y, s: V(1.1, 1.0), rot: Math.PI * 0.5 * jump, facing: 1, outfit: YUNUS, pose: jump > 0.1 ? POSES.dive : POSES.stand, expr: 'sleepy', rim: { color: '#bcd0ff', dir: [0, -1], w: 4 }, shadow: false });
  if (jump > 0.9) { const p = t - 1.55; for (let i = 0; i < 16; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 16), d = p * 600; circle(g, E.W * 0.72 + Math.cos(a) * d, wy + Math.sin(a) * d * 0.8 + p * p * 500, 9, alpha('#e8f6ff', 0.8 * (1 - prog(p, 0, 1.2)))); } }
  waterSurface(g, t, wy, 0.6);
} });
// v13 — "Di dalam gelapnya air…"
registerShot('v13', { draw(g, t, info) {
  underwater(g, t, 0.85);
  const y = lerp(E.H * 0.25, E.H * 0.55, ease.out(t / info.dur));
  person(g, { x: E.W / 2, y, s: V(1.2, 1.3), rot: 0.4 + Math.sin(t) * 0.1, facing: 1, outfit: YUNUS, pose: POSES.fall, expr: 'sleepy', rim: { color: '#6a9ac8', dir: [0, -1], w: 3 }, shadow: false });
  for (let i = 0; i < 12; i++) circle(g, E.W / 2 + Math.sin(i * 3) * 40, y - 250 - ((t * 200 + i * 40) % 400), 5 + (i % 3) * 3, alpha('#cfe8ff', 0.5));
} });
// v14 — "sesuatu yang sangat besar mendekat…"
registerShot('v14', { draw(g, t, info) {
  underwater(g, t, 0.95); const k = ease.inOut(t / info.dur);
  bigFish(g, lerp(E.W * 1.5, E.W * 0.75, k), E.H * 0.5, V(1.4, 1.3) * (1 + 0.3 * k), -1, t, { color: '#0c1a2c', belly: '#1a2a3a', eye: '#ffd040', rim: '#4a7aaa' });
  person(g, { x: E.W * 0.22, y: E.H * 0.55, s: V(0.7, 0.75), rot: 0.4, facing: 1, outfit: YUNUS, pose: POSES.fall, expr: 'sleepy', shadow: false });
} });
// v15 — "membuka mulutnya… dan menelan Nabi Yunus bulat-bulat!"  the mouth, head-on
registerShot('v15', { draw(g, t, info) {
  underwater(g, t, 1); const open = ease.inOut(prog(t, 0.1, 1.2)), gulp = ease.in(prog(t, wt('menelan', 55, info) - 0.3, wt('menelan', 55, info) + 0.6));
  const cx = E.W / 2, cy = E.H * 0.52, R = V(700, 620) * (1 + 0.3 * gulp);
  g.fillStyle = '#020610'; g.beginPath(); g.ellipse(cx, cy, R, R * 0.8, 0, 0, Math.PI * 2); g.fill();
  for (const sx of [-1, 1]) { circle(g, cx + sx * R * 0.6, cy - R * 0.45, R * 0.07, '#05080e'); circle(g, cx + sx * R * 0.6, cy - R * 0.45, R * 0.03, '#ffd040'); glow(g, cx + sx * R * 0.6, cy - R * 0.45, R * 0.12, '#ffd040', 0.5); }
  const mh = R * 0.45 * open * (1 - gulp); g.fillStyle = '#1a0408'; g.beginPath(); g.ellipse(cx, cy + R * 0.12, R * 0.6, Math.max(2, mh), 0, 0, Math.PI * 2); g.fill();
  if (mh > 20) { g.fillStyle = alpha('#3a0a10', 0.8); g.beginPath(); g.ellipse(cx, cy + R * 0.12 + mh * 0.3, R * 0.4, mh * 0.5, 0, 0, Math.PI * 2); g.fill(); }
  const fy = lerp(E.H * 0.9, cy + R * 0.12, gulp), fs = lerp(0.9, 0.15, gulp); if (gulp < 0.98) person(g, { x: cx, y: fy, s: fs, rot: 0.5, facing: 1, outfit: YUNUS, pose: POSES.fall, expr: 'sleepy', shadow: false });
  if (gulp > 0.95) veil(g, '#000', ease.in(prog(t, wt('menelan', 55, info) + 0.6, info.dur)));
} });
// v16 — "Apakah ini akhir hidupnya?"
registerShot('v16', { draw(g, t, info) {
  fishInside(g, t, 0.2); veil(g, '#000', 0.3);
  person(g, { x: E.W / 2, y: E.H * 0.86, s: V(1.0, 1.1), facing: 1, outfit: YUNUS, pose: breathe({ ...POSES.sit, head: [12, -168] }, t), expr: 'sad', dim: true, rim: { color: '#6a3a3a', dir: [0, -1], w: 3 } });
  big(g, '?', E.H * V(0.2, 0.2), GOLD(), ease.outBack(prog(t, 0.1, 0.5)), V(200, 220));
  commentPrompt(g, Math.max(0, t - 0.4), ['AKHIR HIDUPNYA?'], { y: E.H * V(0.44, 0.42) });
  text(g, 'BERSAMBUNG KE PART 3', E.W / 2, E.H * V(0.94, 0.94), { size: V(48, 50), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: ease.out(prog(t, 1.4, 2.0)) });
} });
