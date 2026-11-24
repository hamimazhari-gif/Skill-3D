// shots/fatih2.js — Muhammad Al-Fatih, Part 2 (g01–g14).
import { E, V, S, registerShot, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, poly } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { waterSurface } from '../sets/sea.js';
import { GOLD } from '../lib/_costume.js';
import { skyline, walls, galley, personH, bigPersonH, shadeHex } from '../lib10/_konst.js';
import { FATIH, OTTO, ROMAN } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const RED = '#ff4a3a', OTRED = '#c8303a';
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const small = (g, s, y, c, a, size = V(52, 54)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: a });
const fadeIn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
const pop = (t, a) => ease.outBack(prog(t, a - 0.1, a + 0.3));
const PAL = {
  night: { sky: ['#03050f', '#141a38', '#2a2a4a'], sea: ['#0e1a30', '#040810'], city: '#0a0c18', wall: '#5a5868', ground: ['#141420', '#06060c'] },
  golden: { sky: ['#5a3a6a', '#e88a50', '#f8c890'], sea: ['#3a5a7a', '#102030'], city: '#3a2430', wall: '#b89070', ground: ['#5a3a2a', '#1a100c'] },
  dawn: { sky: ['#2a3a6a', '#c88aa0', '#ffd8b0'], sea: ['#4a6a8a', '#14243a'], city: '#2a2438', wall: '#a89088', ground: ['#4a3a3a', '#1a1214'] },
  dusk: { sky: ['#1a1030', '#6a2a4a', '#d86a4a'], sea: ['#2a2a4a', '#0a0a18'], city: '#1a1020', wall: '#8a6a6a', ground: ['#3a2020', '#100808'] },
};
const sky = (g, P, hy) => { g.fillStyle = linGrad(g, 0, 0, 0, hy, P.sky); g.fillRect(-E.W, -E.H, E.W * 3, hy + E.H); };
const ground = (g, P, hy) => { g.fillStyle = linGrad(g, 0, hy, 0, E.H, P.ground); g.fillRect(-E.W, hy, E.W * 3, E.H); };
const sea = (g, t, P, hy) => { g.fillStyle = linGrad(g, 0, hy, 0, E.H, P.sea); g.fillRect(-E.W, hy, E.W * 3, E.H); waterSurface(g, t, hy, 0.5); };
const otto = (g, t, x, y, s, f, i, o = {}) => personH(g, { x, y, s, facing: f, outfit: OTTO[i % OTTO.length], pose: o.pose || (o.walk ? walkPose(t * 4 + i) : breathe(POSES.stand, t, 1, i)), expr: o.expr || 'neutral', spear: o.spear, rim: o.rim, dim: o.dim }, 'turban');
const roman = (g, t, x, y, s, f, i, o = {}) => personH(g, { x, y, s, facing: f, outfit: ROMAN[i % ROMAN.length], pose: o.pose || breathe(POSES.stand, t, 1, i), expr: o.expr || 'neutral', look: o.look, rim: o.rim, dim: o.dim }, 'helmet');
function tent(g, x, y, s, c) { poly(g, [[x - 90 * s, y], [x, y - 120 * s], [x + 90 * s, y]], c); poly(g, [[x - 14 * s, y], [x, y - 60 * s], [x + 14 * s, y]], alpha('#000', 0.4)); seg(g, [[x, y - 120 * s], [x, y - 160 * s]], 3 * s, '#2a1a10'); g.fillStyle = OTRED; g.fillRect(x, y - 160 * s, 30 * s, 18 * s); }
function cannon(g, x, y, s, f, recoil = 0) { g.save(); g.translate(x - recoil * 40 * s * f, y); g.scale(f * s, s);
  g.fillStyle = '#4a2a14'; g.fillRect(-160, -40, 300, 40); circle(g, -110, 0, 34, '#3a2010'); circle(g, 90, 0, 34, '#3a2010');
  g.save(); g.rotate(-0.12); g.fillStyle = '#6a6a5a'; rr(g, -200, -120, 420, 90, 30); g.fill(); g.fillStyle = '#5a5a4a'; for (const xx of [-150, -40, 80, 180]) g.fillRect(xx, -126, 18, 102); circle(g, 220, -75, 40, '#2a2a22'); circle(g, 220, -75, 26, '#0a0a08'); g.restore(); g.restore(); }
function smoke(g, x, y, p, s = 1) { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = p * 160 * s; circle(g, x + Math.cos(a) * d + p * 80 * s, y + Math.sin(a) * d * 0.6 - p * 60 * s, (40 + p * 60) * s, alpha('#c8c0b0', 0.6 * (1 - p))); } }
// hill profile for the overland route
const HILL = (x, base, h) => base - h * Math.exp(-(((x - E.W * 0.5) / (E.W * 0.3)) ** 2));

// g01 — title
registerShot('g01', { draw(g, t, info) {
  const P = PAL.night, hy = E.H * 0.62; sky(g, P, hy); FX.stars(g, t, { count: 160, area: [0, 0, E.W, hy] }); FX.moon(g, E.W * 0.78, E.H * 0.1, V(38, 44));
  g.fillStyle = '#0a0a14'; g.beginPath(); g.moveTo(-E.W, E.H); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, HILL(x, hy + 120, V(260, 380))); g.lineTo(E.W * 2, E.H); g.fill();
  const x = E.W * 0.5, y = HILL(x, hy + 120, V(260, 380)); galley(g, x, y - 20, V(0.8, 0.75), 1, 0, '#05050a', OTRED);
  veil(g, '#02030a', 0.25);
  UI.titleCard(g, t + 0.25, { lines: ['MUHAMMAD AL-FATIH', 'PART 2'], dur: info.dur + 0.5, y: E.H * 0.24 });
  const a = fadeIn(t, 0.8, 0.5) * (1 - prog(t, info.dur - 0.3, info.dur));
  text(g, 'KAPAL YANG BERLAYAR', E.W / 2, E.H * 0.24 + V(130, 150), { size: V(52, 48), color: GOLD(), font: FONTS.title, glow: 22, glowColor: 'rgba(255,200,80,.6)', spacing: 3, alpha: a });
  text(g, 'DI ATAS BUKIT', E.W / 2, E.H * 0.24 + V(195, 212), { size: V(52, 48), color: GOLD(), font: FONTS.title, glow: 22, glowColor: 'rgba(255,200,80,.6)', spacing: 3, alpha: a });
} });
// g02 — "April 1453."
registerShot('g02', { draw(g, t, info) {
  const P = PAL.dusk, hy = E.H * 0.46; sky(g, P, hy); skyline(g, hy - V(60, 100), 0.7, P.city); ground(g, P, hy); walls(g, hy + V(40, 60), 0.8, P.wall);
  for (let i = 0; i < 7; i++) tent(g, E.W * (0.05 + i * 0.15), E.H * 0.75 + (i % 2) * 60, V(1.1, 1.0), ['#e8dcc0', '#d8c8a8', '#c8b898'][i % 3]);
  veil(g, '#05030a', 0.2);
  big(g, 'APRIL 1453', E.H * V(0.14, 0.14), GOLD(), pop(t, 0.3), V(120, 126));
} });
// g03 — "Sultan Muhammad datang dengan pasukan besar…"
registerShot('g03', { draw(g, t, info) {
  const P = PAL.golden, hy = E.H * 0.45; sky(g, P, hy); FX.sun(g, E.W * 0.7, hy - 120, 60, '#fff3dc', '#ffb070', 4); skyline(g, hy - V(30, 60), 0.5, P.city); ground(g, P, hy);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) otto(g, t, -E.W * 0.2 + (t * 60) + i * V(150, 120) + r * 50, E.H * (0.66 + r * 0.08), V(0.8, 0.85) + r * 0.15, 1, i + r, { walk: true, spear: true, rim: { color: '#ffd08a', dir: [0, -1], w: 3 } });
  personH(g, { x: E.W * 0.55 + t * 60, y: E.H * 0.96, s: V(1.6, 1.7), facing: 1, outfit: FATIH, pose: walkPose(t * 4), expr: 'neutral', rim: { color: '#ffd08a', dir: [1, -0.4], w: 4 } }, 'sultan');
  small(g, 'PASUKAN BESAR', E.H * V(0.12, 0.12), '#ffffff', fadeIn(t, wt('pasukan', 8.3, info) - 0.1), V(60, 62));
} });
// g04 — "meriam raksasa yang dentumannya mengguncang tanah."
registerShot('g04', { draw(g, t, info) {
  const fire = wt('dentumannya', 10.8, info), p = clamp((t - fire) / 1.2, 0, 1), [qx, qy] = t > fire ? shake(t, 14 * (1 - p), 30) : [0, 0]; g.translate(qx, qy);
  const P = PAL.dusk, hy = E.H * 0.5; sky(g, P, hy); ground(g, P, hy);
  cannon(g, E.W * 0.42, E.H * 0.7, V(1.4, 1.3), 1, t > fire ? ease.out(prog(t, fire, fire + 0.2)) * (1 - prog(t, fire + 0.3, fire + 1)) : 0);
  for (let i = 0; i < 2; i++) otto(g, t, E.W * (0.08 + i * 0.12), E.H * 0.74, V(1.1, 1.15), 1, i, { pose: POSES.handsOnHead, expr: t > fire ? 'scared' : 'neutral', rim: { color: '#ff9a6a', dir: [0, -1], w: 3 } });
  if (t > fire) { const fx = E.W * 0.42 + V(300, 280), fy = E.H * 0.7 - V(150, 140); glow(g, fx, fy, 300 * (1 - p), '#ffd27a', 0.9 * (1 - p)); circle(g, fx, fy, 90 * (1 - p), alpha('#fff0c0', 1 - p)); smoke(g, fx, fy, p, V(1.2, 1.1)); }
  big(g, 'MERIAM RAKSASA', E.H * V(0.14, 0.14), '#ffb070', pop(t, wt('meriam', 9.9, info)), V(90, 96));
} });
// g05 — "Tembok kota digempur siang dan malam."
registerShot('g05', { draw(g, t, info) {
  const night = t > wt('malam.', 15.2, info) - 0.2, P = night ? PAL.night : PAL.golden, hy = E.H * 0.38;
  sky(g, P, hy); if (night) FX.stars(g, t, { count: 120, area: [0, 0, E.W, hy] }); skyline(g, hy, 0.7, P.city); ground(g, P, hy); walls(g, E.H * 0.78, 1.3, P.wall);
  for (let i = 0; i < 4; i++) { const ph = (t * 1.3 + i * 0.27) % 1, x = E.W * (0.15 + i * 0.23), y = E.H * (0.55 + (i % 2) * 0.08); if (ph > 0.75) { const q = (ph - 0.75) / 0.25; glow(g, x, y, 160 * (1 - q), '#ffd27a', 0.8 * (1 - q)); smoke(g, x, y, q, 0.9); } else circle(g, x - (0.75 - ph) * 900, y + (0.75 - ph) * 300, 12, '#1a1a1a'); }
  const [qx, qy] = shake(t, 3, 20); g.translate(qx, qy);
  small(g, 'SIANG', E.H * V(0.1, 0.1), GOLD(), fadeIn(t, wt('siang', 14.6, info) - 0.1), V(60, 62)); small(g, '& MALAM', E.H * V(0.16, 0.16), '#bfd0ff', fadeIn(t, wt('malam.', 15.2, info) - 0.1), V(60, 62));
} });
// g06 — "Tapi setiap kali hancur… para penjaga menambalnya kembali."
registerShot('g06', { draw(g, t, info) {
  const P = PAL.night, hy = E.H * 0.36; sky(g, P, hy); FX.stars(g, t, { count: 120, area: [0, 0, E.W, hy] }); ground(g, P, hy);
  walls(g, E.H * 0.78, 1.4, P.wall);
  const fix = ease.inOut(prog(t, wt('menambalnya', 18.7, info) - 0.4, info.dur)), bx = E.W * 0.5, by = E.H * 0.5, bw = V(360, 320), bh = V(420, 520) * (1 - fix);
  g.fillStyle = '#05060c'; g.beginPath(); g.moveTo(bx - bw / 2, by + V(260, 300)); g.lineTo(bx - bw / 2 + 40, by + V(260, 300) - bh); g.lineTo(bx - 20, by + V(260, 300) - bh * 1.1); g.lineTo(bx + bw / 2 - 30, by + V(260, 300) - bh * 0.9); g.lineTo(bx + bw / 2, by + V(260, 300)); g.fill();
  for (let i = 0; i < Math.floor(fix * 10); i++) { rr(g, bx - bw / 2 + (i % 4) * bw / 4, by + V(260, 300) - 40 - Math.floor(i / 4) * 42, bw / 4 - 6, 36, 4); g.fillStyle = '#7a6a50'; g.fill(); }
  for (let i = 0; i < 3; i++) roman(g, t, bx - V(260, 220) + i * V(260, 220), E.H * 0.92, V(1.3, 1.35), i === 2 ? -1 : 1, i, { pose: breathe(POSES.holdFront, t, 1, i), expr: 'worried', rim: { color: '#ffb070', dir: [0, -1], w: 4 } });
  glow(g, bx, E.H * 0.85, 300, '#ffb070', 0.25);
  small(g, 'HANCUR…', E.H * V(0.1, 0.1), RED, fadeIn(t, wt('hancur…', 17.2, info) - 0.1), V(60, 62)); small(g, 'DITAMBAL KEMBALI', E.H * V(0.16, 0.16), '#ffffff', fadeIn(t, wt('menambalnya', 18.7, info) - 0.1), V(56, 58));
} });
// g07 — "Di laut, kapal-kapal Utsmani tertahan oleh rantai raksasa… tak bisa masuk ke teluk Tanduk Emas."
registerShot('g07', { draw(g, t, info) {
  const P = PAL.golden, hy = E.H * 0.36; sky(g, P, hy); skyline(g, hy, 0.85, P.city); sea(g, t, P, hy);
  const cy = E.H * 0.56; g.fillStyle = shadeHex(P.wall, -0.3); g.fillRect(-20, cy - 240, 110, 280); g.fillRect(E.W - 90, cy - 240, 110, 280);
  for (let x = 80; x < E.W - 80; x += 34) { const y = cy + Math.sin(((x - 80) / (E.W - 160)) * Math.PI) * 60; g.strokeStyle = '#2a2420'; g.lineWidth = 9; g.beginPath(); g.ellipse(x, y, 18, 11, 0, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 3; i++) { const bump = Math.sin(t * 2 + i) * 6; galley(g, E.W * (0.2 + i * 0.3) + bump, E.H * (0.75 + (i % 2) * 0.08), V(0.75, 0.7), 1, t, '#2a1a10', OTRED); }
  small(g, 'TERTAHAN RANTAI', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('tertahan', 22.8, info) - 0.1), V(60, 62));
  big(g, 'TAK BISA MASUK', E.H * V(0.94, 0.94), RED, fadeIn(t, wt('masuk', 26.1, info) - 0.1), V(70, 72));
} });
// g08 — "Minggu demi minggu… pengepungan seakan tak ada hasil. Banyak yang mulai putus asa."
registerShot('g08', { draw(g, t, info) {
  const P = PAL.dusk, hy = E.H * 0.46; sky(g, P, hy); skyline(g, hy - V(60, 100), 0.7, P.city); ground(g, P, hy); walls(g, hy + V(40, 60), 0.8, P.wall);
  tent(g, E.W * 0.15, E.H * 0.74, V(1.1, 1.0), '#c8b898'); tent(g, E.W * 0.85, E.H * 0.76, V(1.1, 1.0), '#d8c8a8');
  for (let i = 0; i < 4; i++) otto(g, t, E.W * (0.2 + i * 0.2), E.H * 0.9 + (i % 2) * 20, V(1.3, 1.35), i % 2 ? -1 : 1, i, { pose: breathe({ ...POSES.sit, head: [12, -168] }, t, 1, i), expr: 'sad', rim: { color: '#ff9a6a', dir: [0, -1], w: 3 } });
  const wk = Math.min(7, 1 + Math.floor(t * 1.5)); big(g, 'MINGGU KE-' + wk, E.H * V(0.12, 0.12), '#ffffff', fadeIn(t, 0.1), V(90, 96));
  small(g, 'PUTUS ASA', E.H * V(0.19, 0.19), '#ff9a7a', fadeIn(t, wt('putus', 33.4, info) - 0.1), V(60, 62));
} });
// g09 — "Lalu Sultan muda itu memandang sebuah bukit… dan mendapat ide yang terdengar gila."
registerShot('g09', { draw(g, t, info) {
  const P = PAL.dusk, hy = E.H * 0.6; sky(g, P, hy);
  g.fillStyle = '#1a1018'; g.beginPath(); g.moveTo(-E.W, E.H); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, HILL(x, hy + 100, V(300, 420))); g.lineTo(E.W * 2, E.H); g.fill();
  g.fillStyle = '#0a0608'; g.fillRect(-E.W, E.H * 0.84, E.W * 3, E.H);
  const p = { x: E.W * 0.28, y: E.H * 0.97, s: V(1.9, 2.0), facing: 1, outfit: FATIH, pose: breathe({ ...POSES.think }, t), expr: t > wt('ide', 39, info) - 0.2 ? 'grin' : 'thinking', rim: { color: '#ff9a6a', dir: [1, -0.4], w: 5 } }; personH(g, p, 'sultan');
  const ia = pop(t, wt('ide', 39, info)); if (ia > 0) { FX.sparkle(g, E.W * 0.42, E.H * 0.58, 40 * ia, GOLD(), 1); glow(g, E.W * 0.42, E.H * 0.58, 120, GOLD(), 0.4 * ia); }
  small(g, 'SEBUAH BUKIT…', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('bukit…', 37.2, info) - 0.1), V(56, 58));
  big(g, 'IDE GILA', E.H * V(0.17, 0.17), GOLD(), pop(t, wt('gila.', 40, info)), V(120, 126));
} });
// g10 — "Kalau kapal tidak bisa lewat laut… maka kapal akan lewat darat!"
registerShot('g10', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a0c06', '#0a0402']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.6, E.W * 0.6, '#ff9a3a', 0.15);
  bigPersonH(g, E.W / 2, E.H * V(0.66, 0.64), V(270, 300), { outfit: FATIH, expr: t > wt('darat!', 45.3, info) - 0.2 ? 'grin' : 'neutral', talk: Math.max(0, 0.5 * Math.sin(t * 12)), rimColor: '#ffb070', rimSide: -1 }, 'sultan');
  const a1 = fadeIn(t, wt('laut…', 43, info) - 0.2), x1 = wt('maka', 44, info);
  text(g, 'LEWAT LAUT?', E.W / 2, E.H * V(0.08, 0.08), { size: V(64, 66), color: '#a8e0ff', font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: a1 });
  if (t > x1) seg(g, [[E.W * 0.22, E.H * 0.08 - 4], [E.W * 0.22 + E.W * 0.56 * ease.out(prog(t, x1, x1 + 0.3)), E.H * 0.08 - 4]], 10, RED);
  big(g, 'LEWAT DARAT!', E.H * V(0.15, 0.15), GOLD(), pop(t, wt('darat!', 45.3, info)), V(110, 116));
} });
// g11 — "Di bawah gelapnya malam, ribuan prajurit bekerja. Batang kayu dibentangkan di atas bukit, dilumuri minyak dan lemak."
registerShot('g11', { draw(g, t, info) {
  const P = PAL.night, hy = E.H * 0.6; sky(g, P, hy); FX.stars(g, t, { count: 180, area: [0, 0, E.W, hy] }); FX.moon(g, E.W * 0.82, E.H * 0.27, V(34, 40));
  const base = hy + 160, h = V(320, 440); g.fillStyle = '#10101c'; g.beginPath(); g.moveTo(-E.W, E.H); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, HILL(x, base, h)); g.lineTo(E.W * 2, E.H); g.fill();
  const lay = prog(t, wt('Batang-batang', 50.5, info) - 0.3, wt('Kayu-kayu', 53.5, info)), oil = prog(t, wt('dilumuri', 54.1, info) - 0.2, info.dur);
  for (let x = 30; x < E.W * lay; x += 48) { const y = HILL(x, base, h), dy = HILL(x + 2, base, h) - y; g.save(); g.translate(x, y - 6); g.rotate(Math.atan2(dy, 2) + Math.PI / 2); g.fillStyle = '#8a6a3a'; rr(g, -6, -40, 12, 80, 5); g.fill(); g.restore(); if (x < E.W * oil) { g.fillStyle = alpha('#ffd27a', 0.5); circle(g, x, y - 8, 6, alpha('#ffe9a0', 0.6)); } }
  for (let i = 0; i < 6; i++) { const x = E.W * (0.1 + i * 0.16), y = HILL(x, base, h); otto(g, t, x, y + 10, V(0.8, 0.85), i % 2 ? -1 : 1, i, { pose: breathe(i % 2 ? POSES.crouch : POSES.holdFront, t, 1, i), dim: true, rim: { color: '#ffb070', dir: [0, -1], w: 3 } }); circle(g, x + 30, y - 70, 8, '#ffb040'); glow(g, x + 30, y - 70, 70, '#ffb040', 0.35); }
  small(g, 'RIBUAN PRAJURIT', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('ribuan', 48.5, info) - 0.1), V(56, 58));
  small(g, 'BATANG KAYU', E.H * V(0.16, 0.16), '#d8b080', fadeIn(t, wt('Batang-batang', 50.5, info) - 0.1), V(52, 54)); small(g, '+ MINYAK & LEMAK', E.H * V(0.21, 0.21), GOLD(), fadeIn(t, wt('minyak', 54.5, info) - 0.1), V(52, 54));
} });
// g12 — "puluhan kapal perang ditarik… naik ke atas bukit… dan meluncur turun ke sisi lain!"
registerShot('g12', { draw(g, t, info) {
  const P = PAL.night, hy = E.H * 0.6; sky(g, P, hy); FX.stars(g, t, { count: 180, area: [0, 0, E.W, hy] }); FX.moon(g, E.W * 0.82, E.H * 0.27, V(34, 40));
  const base = hy + 160, h = V(320, 440); g.fillStyle = '#10101c'; g.beginPath(); g.moveTo(-E.W, E.H); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, HILL(x, base, h)); g.lineTo(E.W * 2, E.H); g.fill();
  for (let x = 30; x < E.W; x += 48) { const y = HILL(x, base, h); circle(g, x, y - 4, 7, '#6a4a2a'); }
  const up = wt('naik', 59.5, info), down = wt('meluncur', 61.3, info);
  const p = t < down ? 0.5 * ease.inOut(prog(t, 0.2, down)) : 0.5 + 0.5 * ease.in(prog(t, down, down + 1.2));
  for (let k = 0; k < 3; k++) { const pk = clamp(p - k * 0.22, -0.3, 1.2), x = lerp(-E.W * 0.1, E.W * 1.1, pk), y = HILL(x, base, h), dy = HILL(x + 4, base, h) - y; g.save(); g.translate(x, y - 10); g.rotate(Math.atan2(dy, 4)); galley(g, 0, 0, V(0.55, 0.5), 1, 0, '#1a1210', OTRED); g.restore();
    if (t < down + 0.2) for (let i = 0; i < 3; i++) { const px = x + V(130, 110) + i * V(50, 44), py = HILL(px, base, h); seg(g, [[x + 80, y - 30], [px, py - 60]], 2, alpha('#d8c8a0', 0.6)); otto(g, t, px, py + 6, V(0.6, 0.65), 1, i + k, { pose: { ...POSES.reach, hF: [-60, -150], hB: [-50, -140] }, dim: true, rim: { color: '#ffb070', dir: [0, -1], w: 2 } }); } }
  small(g, 'PULUHAN KAPAL PERANG', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, wt('puluhan', 57.3, info) - 0.1), V(52, 54));
  big(g, 'NAIK BUKIT…', E.H * V(0.17, 0.17), GOLD(), fadeIn(t, up - 0.1) * (1 - prog(t, down - 0.2, down)), V(90, 96));
  big(g, 'MELUNCUR TURUN!', E.H * V(0.17, 0.17), '#ffb070', pop(t, down), V(90, 96));
} });
// g13 — "Pagi harinya… penduduk Konstantinopel terbangun… melihat ke arah teluk… tak percaya."
registerShot('g13', { draw(g, t, info) {
  const P = PAL.dawn, hy = E.H * 0.5; sky(g, P, hy); FX.sun(g, E.W * 0.3, hy - 80, 60, '#fff3dc', '#ffc090', 4); sea(g, t, P, hy);
  for (let i = 0; i < 5; i++) galley(g, E.W * (0.1 + i * 0.2), hy + V(60, 80) + (i % 2) * 30, V(0.35, 0.32), -1, t, '#1a1210', OTRED);
  g.fillStyle = shadeHex(P.wall, -0.2); g.fillRect(-E.W, E.H * 0.8, E.W * 3, E.H); for (let x = -20; x < E.W + 40; x += 70) g.fillRect(x, E.H * 0.8 - 30, 40, 32);
  const sh = t > wt('tak', 69.6, info) - 0.2;
  for (let i = 0; i < 4; i++) roman(g, t, E.W * (0.14 + i * 0.24), E.H * 0.8 + 6, V(1.4, 1.45), 1, i, { pose: sh ? (i % 2 ? POSES.handsOnHead : POSES.point) : breathe(POSES.stand, t, 1, i), expr: sh ? 'shocked' : 'sleepy', look: [0, -0.3], rim: { color: '#ffc090', dir: [0, -1], w: 4 } });
  small(g, 'PAGI HARINYA…', E.H * V(0.1, 0.1), '#ffffff', fadeIn(t, 0.2), V(56, 58));
  big(g, 'TAK PERCAYA!', E.H * V(0.17, 0.17), '#ffffff', pop(t, wt('percaya', 69.9, info)), V(100, 106));
} });
// g14 — "Kapal-kapal Utsmani… sudah berada di dalam teluk!"
registerShot('g14', { draw(g, t, info) {
  const P = PAL.dawn, hy = E.H * 0.34; sky(g, P, hy); skyline(g, hy, 0.8, P.city); sea(g, t, P, hy);
  const cy = E.H * 0.88; for (let x = 80; x < E.W - 80; x += 34) { const y = cy + Math.sin(((x - 80) / (E.W - 160)) * Math.PI) * 30; g.strokeStyle = '#2a2420'; g.lineWidth = 8; g.beginPath(); g.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2); g.stroke(); }
  const k = ease.out(prog(t, 0, 1.4));
  for (let i = 0; i < 6; i++) galley(g, E.W * (0.12 + (i % 3) * 0.36) + Math.sin(t + i) * 10, E.H * (0.5 + Math.floor(i / 3) * 0.17) + (1 - k) * 200, V(0.6, 0.55) * (0.85 + 0.15 * (i % 2)), i % 2 ? 1 : -1, t, '#2a1a10', OTRED);
  small(g, 'KAPAL UTSMANI', E.H * V(0.08, 0.08), GOLD(), fadeIn(t, 0.1), V(56, 58));
  big(g, 'SUDAH DI DALAM', E.H * V(0.14, 0.14), '#ffffff', pop(t, wt('sudah', 73.7, info)), V(84, 88)); big(g, 'TELUK!', E.H * V(0.2, 0.2), GOLD(), pop(t, wt('teluk!', 74.7, info)), V(110, 116));
  small(g, 'BERSAMBUNG KE PART 3', E.H * V(0.95, 0.95), '#ffffff', fadeIn(t, info.dur - 1.6), V(42, 44));
} });
