// ty1.js — Yusuf Part 1 thumbnails: k1 thrown into the well, k2 the untorn shirt, k3 the dream of 11 stars.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, text, FONTS, seg, circle, ring } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { qamis, wolf, wellTop, dreamSky } from '../lib5/_yusuf.js';
import { YUSUF_KID, BROTHERS } from '../cast.js';

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

// k1 — DIBUANG KE SUMUR!
registerShot('k1', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  g.save(); if (!vert) { g.translate(W * 0.18, 0); }
  wellTop(g, 1, (g, cx, cy, R) => {
    glow(g, cx, cy + 60, R * 0.7, '#9ab8ff', 0.35);
    person(g, { x: cx, y: cy + (vert ? 170 : 150), s: vert ? 1.5 : 1.25, facing: 1, outfit: YUSUF_KID, pose: POSES.cheer, expr: 'cry', look: [0, -1], rim: { color: '#bcd0ff', dir: [0, -1], w: 5 } });
  });
  const R = V(330, 380);
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.55, hx = E.W / 2 + Math.cos(a) * R * 1.3, hy = E.H / 2 + Math.sin(a) * R * 1.3; circle(g, hx, hy, 70, BROTHERS[i].headColor); circle(g, hx, hy + 12, 56, S().ink); for (const dx of [-18, 18]) circle(g, hx + dx, hy + 26, 8, S().feature); g.strokeStyle = S().feature; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy + 36, 18, 0.2, Math.PI - 0.2); g.stroke(); }
  g.restore();
  if (vert) title(g, [['DIBUANG', '#ffffff', 1], ['KE SUMUR!', '#ffd040', 1.05]], W / 2, H * 0.08, 150, -0.04);
  else title(g, [['DIBUANG', '#ffffff', 0.9], ['KE SUMUR!', '#ffd040', 1]], W * 0.2, H * 0.2, 130, -0.05);
  if (!vert) title(g, [['OLEH SAUDARANYA', '#ff6a4a', 0.4]], W * 0.2, H * 0.55, 130, -0.05);
  else title(g, [['OLEH SAUDARANYA SENDIRI', '#ff6a4a', 0.42]], W / 2, H * 0.83, 130, -0.02);
  badge(g, 'PART 1');
} });

// k2 — BAJUNYA TIDAK ROBEK?!
registerShot('k2', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  const { GY, CX } = desert(g, 1, { z: 1.1 }, { mood: 'night', sunX: V(-300, -200), wind: false });
  veil(g, '#100008', 0.45);
  wolf(g, vert ? W * 0.5 : W * 0.25, vert ? H * 0.95 : H * 0.98, vert ? 2.6 : 2.2, 1, { howl: true, eyes: '#ffd040', color: '#000', rim: '#6a2030' });
  FX.lightCone(g, vert ? W / 2 : W * 0.66, -60, { angle: Math.PI / 2, spread: 0.6, len: H * 1.1, color: '#ffe0b0', a: 0.3 });
  const sx = vert ? W / 2 : W * 0.66, sy = vert ? H * 0.55 : H * 0.56;
  qamis(g, sx, sy, vert ? 2.2 : 2.1, { blood: 1, rot: -0.06, glowC: '#ff6a3a' });
  g.strokeStyle = GOLD(); g.lineWidth = 12; ring(g, sx + 60, sy - 40, vert ? 170 : 150, 12, GOLD()); seg(g, [[sx + 60 + 120, sy - 40 + 120], [sx + 60 + 240, sy - 40 + 240]], 30, GOLD());
  if (vert) title(g, [['BAJUNYA', '#ffffff', 1], ['TIDAK ROBEK?!', '#ffd040', 1]], W / 2, H * 0.08, 150, -0.04);
  else title(g, [['BAJUNYA', '#ffffff', 0.9], ['TIDAK ROBEK?!', '#ffd040', 1]], W * 0.26, H * 0.16, 130, -0.05);
  badge(g, 'PART 1');
} });

// k3 — 11 BINTANG BERSUJUD
registerShot('k3', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical, bx = W / 2, by = H * (vert ? 0.9 : 0.97);
  dreamSky(g, 1, [11, 1, 1], 0.35, bx, by);
  glow(g, bx, by - 200, V(500, 560), '#fff0c0', 0.6);
  person(g, { x: bx, y: by, s: vert ? 1.6 : 1.6, facing: 1, outfit: YUSUF_KID, pose: POSES.stand, expr: 'awe', look: [0, -1], rim: { color: '#fff0c0', dir: [0, -1], w: 6 } });
  if (vert) title(g, [['11 BINTANG BERSUJUD', '#fff4c0', 0.62], ['KEPADANYA?!', '#7de8ff', 0.85]], W / 2, H * 0.6, 140, -0.03);
  else title(g, [['11 BINTANG BERSUJUD', '#fff4c0', 0.75], ['KEPADANYA?!', '#7de8ff', 0.85]], W / 2, H * 0.4, 140, -0.03);
} });
