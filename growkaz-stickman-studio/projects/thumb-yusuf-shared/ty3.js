// ty3.js — Yusuf Part 3 thumbnails (no badge): n1 "Akulah Yusuf", n2 sight restored, n3 the third shirt.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, text, FONTS, seg, circle } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { palace } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson, GOLD } from '../lib/_costume.js';
import { qamis } from '../lib5/_yusuf.js';
import { qamisTorn } from '../lib6/_y2.js';
import { blindEyes } from '../lib7/_y3.js';
import { YUSUF_GOLD, YAQUB, BROTHERS } from '../cast.js';

const HOLY = '#fff0c0';
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

// n1 — "AKULAH YUSUF!"
registerShot('n1', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  blurLayer(g, 10, (g) => palace(g, 1, { z: 1.4, y: -60 }, {})); veil(g, '#0a0604', 0.4);
  const fx = vert ? W / 2 : W * 0.68, fy = vert ? H * 0.45 : H * 0.5, fr = vert ? 290 : 260;
  FX.godRays(g, fx, fy, { count: 18, angle: 0, spread: Math.PI * 2, len: Math.max(W, H), color: HOLY, a: 0.14 });
  glow(g, fx, fy, fr * 2.4, GOLD(), 0.35);
  bigPerson(g, fx, fy, fr, { outfit: YUSUF_GOLD, expr: 'smile', talk: 0.5, rimColor: HOLY, rimSide: -1 });
  for (let i = 0; i < (vert ? 5 : 4); i++) person(g, { x: (vert ? W * 0.1 : W * 0.05) + i * (vert ? 210 : 170), y: H + 40, s: vert ? 1.9 : 1.6, facing: 1, outfit: BROTHERS[i], pose: { ...POSES.kneel, eF: [30, -150], hF: [12, -190], eB: [-20, -150], hB: [-6, -190] }, expr: 'shocked', look: [0.6, -0.8], rim: { color: HOLY, dir: [0.5, -1], w: 5 } });
  if (vert) title(g, [['"AKULAH', '#ffffff', 1], ['YUSUF!"', '#ffd040', 1.15]], W / 2, H * 0.06, 160, -0.03);
  else title(g, [['"AKULAH', '#ffffff', 0.9], ['YUSUF!"', '#ffd040', 1.1]], W * 0.25, H * 0.18, 150, -0.05);
} });

// n2 — MATANYA KEMBALI MELIHAT!
registerShot('n2', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  blurLayer(g, 12, (g) => desert(g, 1, { z: 1.4 }, { mood: 'golden', wind: false })); veil(g, '#0a0604', 0.3);
  const cx = vert ? W / 2 : W * 0.66, cy = vert ? H * 0.55 : H * 0.55, r = vert ? 300 : 260;
  FX.godRays(g, cx, cy, { count: 18, angle: 0, spread: Math.PI * 2, len: Math.max(W, H), color: HOLY, a: 0.14 });
  bigPerson(g, cx, cy, r, { outfit: YAQUB, expr: 'joy', rimColor: HOLY, rimSide: -1 });
  blindEyes(g, cx, cy, r, 0.85);
  for (const sx of [-1, 1]) { g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(cx + sx * r * 0.36, cy + r * 0.1, 12, 22, 0, 0, Math.PI * 2); g.fill(); }
  qamis(g, vert ? W * 0.82 : W * 0.9, vert ? H * 0.82 : H * 0.8, vert ? 0.9 : 0.75, { glowC: HOLY, rot: -0.3 });
  for (let i = 0; i < 12; i++) FX.sparkle(g, cx + Math.sin(i * 2.3) * r * 1.5, cy + Math.cos(i * 1.7) * r * 1.4, 24, '#ffffff', 0.9);
  if (vert) title(g, [['MATANYA', '#ffffff', 1], ['KEMBALI MELIHAT!', '#7de8ff', 0.8]], W / 2, H * 0.07, 150, -0.03);
  else title(g, [['MATANYA KEMBALI', '#ffffff', 0.75], ['MELIHAT!', '#7de8ff', 1]], W * 0.26, H * 0.2, 140, -0.05);
} });

// n3 — BAJU KETIGA…
registerShot('n3', { draw(g) {
  const W = E.W, H = E.H, vert = E.vertical;
  g.fillStyle = '#070508'; g.fillRect(0, 0, W, H);
  const pos = vert ? [[W * 0.3, H * 0.36], [W * 0.72, H * 0.36], [W * 0.5, H * 0.68]] : [[W * 0.18, H * 0.62], [W * 0.5, H * 0.62], [W * 0.82, H * 0.62]];
  const s = vert ? 1.0 : 0.95;
  FX.godRays(g, pos[2][0], pos[2][1], { count: 18, angle: 0, spread: Math.PI * 2, len: Math.max(W, H), color: HOLY, a: 0.12 });
  g.save(); g.globalAlpha = 0.75; qamis(g, pos[0][0], pos[0][1], s * 0.85, { blood: 1 }); qamisTorn(g, pos[1][0], pos[1][1], s * 0.85, { tear: 1 }); g.restore();
  qamis(g, pos[2][0], pos[2][1], s * (vert ? 1.5 : 1.2), { glowC: HOLY, rim: HOLY });
  ['1', '2', '3'].forEach((n, i) => text(g, n, pos[i][0], pos[i][1] - (i === 2 ? (vert ? 260 : 210) : 170), { size: i === 2 ? 110 : 70, color: i === 2 ? GOLD() : '#bbbbbb', font: FONTS.title, stroke: 10, strokeColor: '#000' }));
  if (vert) title(g, [['BAJU KETIGA…', '#ffd040', 1], ['MEMBUAT AYAHNYA', '#ffffff', 0.55], ['MELIHAT LAGI!', '#7de8ff', 0.7]], W / 2, H * 0.04, 150, -0.02);
  else title(g, [['BAJU KETIGA…', '#ffd040', 1], ['MEMBUAT AYAHNYA MELIHAT LAGI!', '#ffffff', 0.45]], W / 2, H * 0.12, 140, -0.02);
} });
