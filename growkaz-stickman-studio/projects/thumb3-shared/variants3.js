// variants3.js — Part 3 thumbnails: t1 the sea parts, t2 the cobra swallows the sorcery, t3 Pharaoh drowns.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, radGrad, text, FONTS, seg, poly, circle, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { shore, crash, waterSurface } from '../sets/sea.js';
import { city } from '../sets/egypt.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { cobra, smallSnake, crowdBani } from '../lib3/_army.js';
import { MUSA, FIRAUN, PENYIHIR } from '../cast.js';

function measureW(g, s, size) { g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(s).width; g.restore(); return w; }
function title(g, lines, x, y, size, rot = -0.04) {
  g.save(); g.translate(x, y); g.rotate(rot); let yy = 0;
  for (const [str, color, k = 1] of lines) {
    const sz = Math.min(size * k, (E.W * 0.92) / Math.max(1, measureW(g, str, size * k) / (size * k)));
    text(g, str, 10, yy + 12, { size: sz, color: '#000', font: FONTS.title, weight: 700, stroke: sz * 0.2, strokeColor: '#000' });
    text(g, str, 0, yy, { size: sz, color, font: FONTS.title, weight: 700, stroke: sz * 0.16, strokeColor: '#0a0505', glow: 20, glowColor: alpha(color, 0.6) });
    yy += sz * 0.95;
  }
  g.restore();
}
const badge = (g, str) => { const vert = E.vertical, bx = E.W - (vert ? 170 : 180), by = vert ? E.H - 120 : E.H - 90; g.save(); g.translate(bx, by); g.rotate(0.08); g.fillStyle = '#e0302a'; g.beginPath(); g.roundRect(-140, -46, 280, 92, 18); g.fill(); text(g, str, 0, 2, { size: 58, color: '#fff', font: FONTS.title, weight: 700 }); g.restore(); };

// t1 — LAUTAN TERBELAH!
registerShot('t1', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  const { GY, CX } = shore(g, 1.2, { z: vert ? 1.05 : 1.0, y: vert ? -40 : 30 }, { mood: 'dawn', split: 1 });
  holyLight(g, 1, [CX, GY - V(260, 380)], 1);
  crowdBani(g, { x0: CX - V(520, 380), x1: CX + V(520, 380), y: GY + V(170, 220), s: V(1.3, 1.4), n: 7, t: 0, facing: 1, pose: POSES.handsOnHead, expr: 'awe', depth: 50, rim: { color: '#fff0c0', dir: [0, -1], w: 5 }, seed: 3 });
  glow(g, CX, GY - 60, 380, GOLD(), 0.6);
  person(g, { x: CX, y: GY + V(110, 140), s: V(1.7, 1.9), facing: 1, outfit: MUSA, pose: { ...POSES.stand, eF: [26, -206], hF: [36, -250] }, expr: 'determined', staff: true, staffGlow: GOLD(), rim: { color: '#fff0c0', dir: [0, -1], w: 7 } });
  title(g, [['LAUTAN', '#ffffff', 1], ['TERBELAH!', '#7de8ff', 1.1]], W / 2, vert ? H * 0.09 : H * 0.12, vert ? 150 : 140, -0.03);
  badge(g, 'PART 3');
} });

// t2 — ULAR MENELAN SIHIR!
registerShot('t2', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  const { GY, CX } = city(g, 1, { z: 1.1, y: vert ? 60 : 80 }, { mood: 'sorcery' });
  veil(g, '#000', 0.3);
  FX.godRays(g, vert ? W * 0.55 : W * 0.62, -50, { count: 12, spread: 0.9, len: H * 1.4, color: '#d8ffd0', a: 0.08 });
  g.save(); g.translate(vert ? W * 0.55 : W * 0.66, vert ? H * 0.88 : H * 1.05); g.rotate(-0.12); cobra(g, 0, 0, vert ? 1.05 : 1.05, -1); g.restore();
  // purple snakes flying into the jaws
  const jx = vert ? W * 0.32 : W * 0.48, jy = vert ? H * 0.43 : H * 0.28;
  for (let i = 0; i < 5; i++) { const u = i / 5; smallSnake(g, lerp(jx - 40, vert ? W * 0.05 : W * 0.12, u), lerp(jy + 30, vert ? H * 0.7 : H * 0.85, u), 1.4 - u * 0.4, i * 0.7, 1, i); glow(g, lerp(jx - 40, W * 0.1, u), lerp(jy + 30, H * 0.8, u), 120, '#c07aff', 0.25); }
  for (let i = 0; i < 2; i++) person(g, { x: vert ? W * (0.12 + i * 0.2) : W * (0.06 + i * 0.12), y: H + 20, s: vert ? 2.0 : 1.7, facing: 1, outfit: PENYIHIR, pose: POSES.handsOnHead, expr: 'shocked', look: [1, -0.5], rim: { color: '#c0ff9a', dir: [1, -0.4], w: 6 } });
  title(g, [['ULAR RAKSASA', '#ffffff', 0.85], ['MENELAN SIHIR!', '#b8ff5a', 1]], vert ? W / 2 : W * 0.3, vert ? H * 0.08 : H * 0.11, vert ? 130 : 120, -0.04);
  badge(g, 'PART 3');
} });

// t3 — FIRAUN TENGGELAM!
registerShot('t3', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#02040e', '#0a1838', '#123060']); g.fillRect(0, 0, W, H);
  FX.lightning(g, { x1: W * 0.2, y1: 0, x2: W * 0.32, y2: H * 0.45, seed: 5, w: 4 });
  FX.lightning(g, { x1: W * 0.85, y1: 0, x2: W * 0.72, y2: H * 0.4, seed: 8, w: 3 });
  FX.rain(g, 1, { count: 160, a: 0.35 });
  const fx = vert ? W * 0.5 : W * 0.66, fy = vert ? H * 0.46 : H * 0.5, fr = vert ? 270 : 230;
  glow(g, fx, fy, fr * 2.4, '#ff6a2a', 0.35);
  bigPerson(g, fx, fy, fr, { outfit: FIRAUN, expr: 'scared', face: { brows: null, mouth: 'oBig' }, look: [0, -0.6], rimColor: '#ff8a4a', rimSide: 1 });
  for (const sx of [-1, 1]) seg(g, [[fx + sx * fr * 0.55, fy - fr * 0.3], [fx + sx * fr * 0.15, fy - fr * 0.46]], fr * 0.09, '#fff6e8');
  // reaching hand
  const hx = fx + (vert ? -fr * 1.25 : fr * 1.6), hy = fy - fr * 0.7;
  seg(g, [[hx + 40, fy + fr * 1.4], [hx, hy]], 46, S().ink); circle(g, hx, hy, 34, S().ink); for (let i = 0; i < 4; i++) seg(g, [[hx, hy], [hx - 34 + i * 22, hy - 60]], 15, S().ink);
  waterSurface(g, 1.3, fy + fr * 0.62, 0.97);
  g.save(); g.globalAlpha = 0.9; crash(g, 1.0, 0.35); g.restore();
  for (let i = 0; i < 24; i++) circle(g, fx + Math.sin(i * 2.7) * fr * 1.8, fy + fr * 0.6 - Math.abs(Math.sin(i * 1.3)) * 120, 8 + (i % 3) * 6, alpha('#e8f6ff', 0.75));
  // foreground rolling waves
  for (let k = 0; k < 3; k++) {
    const y0 = fy + fr * (vert ? 1.0 : 0.95) + k * (vert ? 230 : 110), amp = vert ? 70 : 45;
    g.fillStyle = linGrad(g, 0, y0 - amp, 0, H, [['0', k === 2 ? '#2a7ad0' : '#1a5ab0'], ['1', '#06183a']]);
    g.beginPath(); g.moveTo(-50, H + 50); for (let x = -50; x <= W + 50; x += 20) g.lineTo(x, y0 + Math.sin(x * 0.009 + k * 2) * amp); g.lineTo(W + 50, H + 50); g.closePath(); g.fill();
    for (let x = -50; x <= W + 50; x += 26) { const y = y0 + Math.sin(x * 0.009 + k * 2) * amp; if (Math.cos(x * 0.009 + k * 2) > 0.2) circle(g, x, y - 6, 10 + (x % 3) * 4, alpha('#e8f6ff', 0.8)); }
  }
  title(g, [['FIRAUN', '#ff4a2a', 1.1], ['TENGGELAM!', '#ffffff', 0.9]], vert ? W / 2 : W * 0.26, vert ? H * 0.08 : H * 0.14, vert ? 160 : 150, -0.04);
  badge(g, 'PART 3');
} });
