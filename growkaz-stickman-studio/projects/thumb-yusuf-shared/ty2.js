// ty2.js — Yusuf Part 2 thumbnails (no part badge): m1 torn from behind, m2 prison over sin, m3 the king's dream of cows.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, text, FONTS, seg, circle, ring } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { qamisTorn, doorsCorridor, prison, cow, grabHand } from '../lib6/_y2.js';
import { YUSUF, ISTRI_AZIZ, RAJA } from '../cast.js';

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

// m1 — ROBEK DARI BELAKANG!
registerShot('m1', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  blurLayer(g, 10, (g) => doorsCorridor(g, 1, { z: 1.4 }, { closed: () => 1 })); veil(g, '#0a0006', 0.45);
  const sx = vert ? W / 2 : W * 0.64, sy = vert ? H * 0.55 : H * 0.52, ss = vert ? 2.3 : 2.0;
  FX.godRays(g, sx, sy, { count: 16, angle: 0, spread: Math.PI * 2, len: Math.max(W, H), color: '#ffe6b0', a: 0.12 });
  qamisTorn(g, sx, sy, ss, { tear: 1, glowC: GOLD() });
  grabHand(g, sx - 40, sy + ss * 130, vert ? 2.6 : 2.3, true, ISTRI_AZIZ.headColor);
  ring(g, sx, sy + 20, vert ? 220 : 190, 12, '#ff3a2a');
  if (vert) title(g, [['ROBEK DARI', '#ffffff', 1], ['BELAKANG!', '#ffd040', 1.1]], W / 2, H * 0.08, 150, -0.04);
  else title(g, [['ROBEK DARI', '#ffffff', 0.9], ['BELAKANG!', '#ffd040', 1]], W * 0.25, H * 0.2, 140, -0.05);
  if (vert) title(g, [['BAJU INI JADI SAKSI…', '#ff8a6a', 0.42]], W / 2, H * 0.88, 130, -0.02);
  else title(g, [['BAJU INI JADI SAKSI…', '#ff8a6a', 0.4]], W * 0.25, H * 0.6, 130, -0.04);
} });

// m2 — PENJARA LEBIH AKU SUKAI
registerShot('m2', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  const { GY, CX } = prison(g, 1, { z: vert ? 1.15 : 1.0, y: vert ? 0 : 60 }, { winX: vert ? V(260, 200) : W * 0.2 });
  const px = vert ? CX - 40 : W * 0.66;
  glow(g, px, GY - 200, 480, '#fff0c0', 0.5);
  FX.godRays(g, px, -100, { count: 9, angle: Math.PI / 2, spread: 0.4, len: H * 1.3, color: '#fff0c0', a: 0.12 });
  person(g, { x: px, y: GY + 50, s: vert ? 2.3 : 1.9, facing: 1, outfit: YUSUF, pose: { ...POSES.kneel, eF: [26, -150], hF: [40, -180], eB: [18, -148], hB: [32, -178] }, expr: 'sleepy', rim: { color: '#fff0c0', dir: [1, -0.6], w: 7 } });
  for (let i = 0; i < 6; i++) seg(g, [[(vert ? W * 0.05 : W * 0.48) + i * (vert ? 200 : 150), -50], [(vert ? W * 0.05 : W * 0.48) + i * (vert ? 200 : 150), H + 50]], vert ? 26 : 22, alpha('#05050a', 0.85));
  if (vert) title(g, [['"PENJARA', '#ffffff', 1], ['LEBIH AKU SUKAI"', '#9ad8ff', 0.85]], W / 2, H * 0.08, 150, -0.03);
  else title(g, [['"PENJARA LEBIH', '#ffffff', 0.85], ['AKU SUKAI"', '#9ad8ff', 1]], W * 0.24, H * 0.24, 130, -0.04);
} });

// m3 — 7 SAPI KURUS MEMAKAN 7 SAPI GEMUK?!
registerShot('m3', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#0a0420', '#2a1050', '#4a2060']); g.fillRect(0, 0, W, H);
  FX.stars(g, 1, { count: 140, area: [0, 0, W, H * 0.6] });
  bigPerson(g, vert ? W / 2 : W * 0.78, vert ? H * 0.45 : H * 0.42, vert ? 230 : 200, { outfit: RAJA, expr: 'shocked', face: { brows: null }, look: [0, 0.5], rimColor: '#c8a0ff', rimSide: -1 });
  const y1 = vert ? H * 0.95 : H * 1.02, cs = vert ? 1.35 : 1.15, step = vert ? 150 : 190;
  for (let i = 0; i < 3; i++) cow(g, (vert ? W * 0.12 : W * 0.06) + i * step * 0.8, y1 - (2 - i) * 40, cs, 1, 1 + i, 1, { rim: '#ffe6c0' });
  for (let i = 0; i < 3; i++) { const x = (vert ? W * 0.88 : W * 0.58) - i * step * 0.8, y = y1 - (2 - i) * 40; cow(g, x, y, cs, -1, 2 + i, 0, { rim: '#ff4a3a' }); const ex = x - (60 + 30) * cs, ey = y - 132 * cs; glow(g, ex, ey, 40 * cs, '#ff2a1a', 0.9); }
  if (vert) title(g, [['7 SAPI KURUS', '#ff6a4a', 1], ['MEMAKAN', '#ffffff', 0.75], ['7 SAPI GEMUK?!', '#ffe6a0', 1]], W / 2, H * 0.07, 130, -0.03);
  else title(g, [['7 SAPI KURUS', '#ff6a4a', 0.9], ['MEMAKAN 7 SAPI GEMUK?!', '#ffe6a0', 0.75]], W * 0.34, H * 0.13, 130, -0.04);
} });
