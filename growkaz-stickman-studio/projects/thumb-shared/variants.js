// variants.js — three high-impact thumbnail concepts (v1 serpent, v2 shining hand, v3 Pharaoh's rage).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, radGrad, text, FONTS, seg, poly, circle, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { tur } from '../sets/tur.js';
import { palace } from '../sets/egypt.js';
import { person, bigPerson, staff } from '../lib/_costume.js';
import { MUSA, FIRAUN, PENYIHIR } from '../cast.js';

// punchy title: thick black stroke, hard drop shadow, slight tilt
function title(g, lines, x, y, size, rot = -0.04) {
  g.save(); g.translate(x, y); g.rotate(rot);
  let yy = 0;
  for (const [str, color, k = 1] of lines) {
    const sz = Math.min(size * k, (E.W * 0.94) / Math.max(1, measureW(g, str, size * k) / (size * k)));
    text(g, str, 10, yy + 12, { size: sz, color: '#000', font: FONTS.title, weight: 700, stroke: sz * 0.2, strokeColor: '#000', align: 'center' });
    text(g, str, 0, yy, { size: sz, color, font: FONTS.title, weight: 700, stroke: sz * 0.16, strokeColor: '#0a0505', align: 'center', glow: 20, glowColor: alpha(color, 0.6) });
    yy += sz * 0.95;
  }
  g.restore();
}
function measureW(g, s, size) { g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(s).width; g.restore(); return w; }

// giant rearing cobra
function cobra(g, x, y, s, f = -1) {
  const dark = '#0e2a12', mid = '#1f5a24', belly = '#c8d070', glowC = '#7dff6a';
  glow(g, x + f * 100 * s, y - 420 * s, 700 * s, glowC, 0.25);
  // coils
  for (let i = 0; i < 3; i++) { g.strokeStyle = i % 2 ? mid : dark; g.lineWidth = 80 * s; g.beginPath(); g.ellipse(x, y - i * 55 * s, (230 - i * 40) * s, (60 - i * 8) * s, 0, 0, Math.PI * 2); g.stroke(); }
  // neck: cubic from coil to head
  const P = (u) => { const p0 = [x, y - 150 * s], p1 = [x - f * 160 * s, y - 330 * s], p2 = [x + f * 220 * s, y - 520 * s], p3 = [x + f * 120 * s, y - 700 * s]; const a = 1 - u; return [a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]; };
  const n = 40;
  for (let i = 0; i < n; i++) { const a = P(i / n), b = P((i + 1) / n); seg(g, [a, b], (95 - i * 0.8) * s + 10, '#c0ff9a'); }
  for (let i = 0; i < n; i++) { const a = P(i / n), b = P((i + 1) / n); seg(g, [a, b], (95 - i * 0.8) * s, i % 6 < 3 ? mid : dark); }
  for (let i = 4; i < n; i += 2) { const a = P(i / n); seg(g, [[a[0] + f * 22 * s, a[1]], [a[0] + f * 40 * s, a[1] + 4 * s]], 10 * s, alpha(belly, 0.7)); }
  const [hx, hy] = P(1);
  // hood
  g.fillStyle = '#c0ff9a'; g.beginPath(); g.ellipse(hx, hy + 40 * s, 175 * s, 215 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = dark; g.beginPath(); g.ellipse(hx, hy + 40 * s, 168 * s, 208 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = mid; g.beginPath(); g.ellipse(hx, hy + 60 * s, 110 * s, 160 * s, 0, 0, Math.PI * 2); g.fill();
  for (const sx of [-1, 1]) { ring(g, hx + sx * 70 * s, hy + 20 * s, 26 * s, 8 * s, belly); }
  // head with open jaws
  g.fillStyle = dark; g.beginPath(); g.ellipse(hx + f * 20 * s, hy - 30 * s, 100 * s, 70 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a0608'; g.beginPath(); g.moveTo(hx + f * 40 * s, hy - 20 * s); g.lineTo(hx + f * 190 * s, hy - 70 * s); g.lineTo(hx + f * 180 * s, hy + 50 * s); g.closePath(); g.fill();
  for (const [dy, d] of [[-55, 1], [40, -1]]) poly(g, [[hx + f * 150 * s, hy + dy * s], [hx + f * 165 * s, hy + dy * s], [hx + f * 156 * s, hy + (dy + d * 50) * s]], '#ffffff');
  seg(g, [[hx + f * 120 * s, hy - 10 * s], [hx + f * 240 * s, hy + 10 * s], [hx + f * 270 * s, hy - 12 * s]], 8 * s, '#ff3a3a'); seg(g, [[hx + f * 240 * s, hy + 10 * s], [hx + f * 270 * s, hy + 30 * s]], 8 * s, '#ff3a3a');
  for (const ex of [-20, 40]) { glow(g, hx + f * ex * s, hy - 62 * s, 70 * s, '#ffe040', 0.9); circle(g, hx + f * ex * s, hy - 62 * s, 18 * s, '#ffe040'); circle(g, hx + f * ex * s, hy - 62 * s, 6 * s, '#000'); }
}
function ring(g, x, y, r, w, c) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); }

// v1 — "TONGKAT JADI ULAR!"
registerShot('v1', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  tur(g, 1, { z: 1.1, y: 60 }, { fire: 0 });
  veil(g, '#000010', 0.25);
  FX.godRays(g, vert ? W * 0.62 : W * 0.66, -60, { count: 12, spread: 0.9, len: H * 1.4, color: '#d8ffd0', a: 0.08 });
  cobra(g, vert ? W * 0.6 : W * 0.68, vert ? H * 0.86 : H * 1.02, vert ? 1.05 : 1.15, -1);
  person(g, { x: vert ? W * 0.2 : W * 0.15, y: vert ? H * 0.98 : H * 1.0, s: vert ? 2.1 : 2.0, facing: 1, outfit: MUSA, pose: POSES.fall, expr: 'shocked', look: [1, -0.6], rim: { color: '#c0ff9a', dir: [1, -0.4], w: 7 } });
  FX.speedLines(g, 0, { cx: vert ? W * 0.6 : W * 0.68, cy: H * 0.45, count: 60, a: 0.15 });
  if (vert) title(g, [['TONGKAT', '#ffffff', 1], ['JADI ULAR!', '#ffe030', 1.05]], W / 2, H * 0.1, 150, -0.05);
  else title(g, [['TONGKAT', '#ffffff', 0.9], ['JADI ULAR!', '#ffe030', 1]], W * 0.3, H * 0.16, 150, -0.05);
} });

// v2 — "TANGANNYA BERSINAR!"
registerShot('v2', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  g.fillStyle = '#02030a'; g.fillRect(-W, -H, W * 3, H * 3);
  blurLayer(g, 12, (g) => tur(g, 1, { z: 1.4, y: -60 }, { fire: 0 })); veil(g, '#000', 0.45);
  const hx = vert ? W * 0.55 : W * 0.66, hy = vert ? H * 0.5 : H * 0.48, s = vert ? 2.4 : 2.3;
  FX.godRays(g, hx, hy, { count: 22, angle: 0, spread: Math.PI * 2, len: Math.max(W, H) * 1.3, color: '#ffffff', a: 0.16 });
  glow(g, hx, hy, 900, '#ffffff', 0.7); glow(g, hx, hy, 300, '#ffffff', 1);
  seg(g, [[hx + 40 * s, hy + 90 * s], [hx + 200 * s, H + 300]], 130 * s, MUSA.color);
  circle(g, hx, hy, 50 * s, '#ffffff');
  for (let i = 0; i < 4; i++) { const a = -2.0 + i * 0.3; seg(g, [[hx, hy - 10 * s], [hx + Math.cos(a) * 100 * s, hy - 10 * s + Math.sin(a) * 100 * s]], 20 * s, '#ffffff'); }
  seg(g, [[hx + 22 * s, hy + 10 * s], [hx + 90 * s, hy - 46 * s]], 21 * s, '#ffffff');
  for (let i = 0; i < 16; i++) FX.sparkle(g, hx + Math.sin(i * 2.3) * 380, hy + Math.cos(i * 1.7) * 380, 26, '#ffffff', 0.9);
  bigPerson(g, vert ? W * 0.3 : W * 0.2, vert ? H * 0.86 : H * 0.82, vert ? 230 : 240, { outfit: MUSA, expr: 'awe', look: [0.7, -0.7], rimColor: '#ffffff', rimSide: 1 });
  if (vert) title(g, [['TANGANNYA', '#ffffff', 1], ['BERSINAR!', '#7de8ff', 1.1]], W / 2, H * 0.1, 140, -0.04);
  else title(g, [['TANGANNYA', '#ffffff', 0.9], ['BERSINAR!', '#7de8ff', 1]], W * 0.27, H * 0.17, 140, -0.04);
} });

// v3 — "FIRAUN MURKA!"
registerShot('v3', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  palace(g, 1, { z: 1.2, y: -40 }, { mood: 'pharaoh' }); veil(g, '#2a0000', 0.35);
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, W / 2, H * 0.4, 0, Math.max(W, H), [alpha('#ff3a10', 0.45), alpha('#ff3a10', 0)]); g.fillRect(0, 0, W, H); g.restore();
  const fx = vert ? W * 0.5 : W * 0.66, fy = vert ? H * 0.42 : H * 0.6, fr = vert ? 330 : 330;
  bigPerson(g, fx, fy, fr, { outfit: FIRAUN, expr: 'angry', face: { brows: null, mouth: 'oBig' }, look: [-0.3, 0.2], rimColor: '#ffb040', rimSide: -1 });
  for (const sx of [-1, 1]) seg(g, [[fx + sx * fr * 0.58, fy - fr * 0.46], [fx + sx * fr * 0.12, fy - fr * 0.28]], fr * 0.11, '#ffffff');
  // cracks of lightning behind
  FX.lightning(g, { x1: vert ? W * 0.1 : W * 0.4, y1: 0, x2: vert ? W * 0.25 : W * 0.48, y2: H * 0.5, seed: 3 });
  // Musa small but defiant, staff glowing
  const mx = vert ? W * 0.22 : W * 0.17, my = H + 10, ms = vert ? 1.9 : 1.8;
  glow(g, mx + 20 * ms, my - 300 * ms, 360, '#ffe080', 0.6);
  person(g, { x: mx, y: my, s: ms, facing: 1, outfit: MUSA, pose: { ...POSES.stand, eF: [26, -206], hF: [36, -250] }, expr: 'determined', look: [1, -0.4], staff: true, staffGlow: '#ffe080', rim: { color: '#fff0c0', dir: [1, -0.5], w: 7 } });
  if (vert) title(g, [['FIRAUN', '#ff4a2a', 1.1], ['MENGAKU TUHAN?!', '#ffffff', 0.62]], W / 2, H * 0.08, 160, -0.04);
  else title(g, [['FIRAUN', '#ff4a2a', 1], ['MENGAKU TUHAN?!', '#ffffff', 0.55]], W * 0.27, H * 0.15, 170, -0.05);
} });
