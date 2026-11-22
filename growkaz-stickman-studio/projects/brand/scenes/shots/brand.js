// shots/brand.js — E-DAYzz channel art. Rendered at 16:9 (1920×1080 logical) and cropped:
//  b1 YouTube banner (full frame → 2560×1440; text inside the centre safe band 1160×317 logical)
//  b2 profile picture (centre square 1080×1080 → 800×800, circle-safe)
//  b3 Facebook cover (centre band 1920×730 → 1640×624)
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, radGrad, text, FONTS, seg, circle, ring, poly } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { shore } from '../sets/sea.js';
import { person, staff, GOLD } from '../lib/_costume.js';
import { qamis } from '../lib5/_yusuf.js';
import { MUSA, YUSUF } from '../cast.js';

const NAME = 'E-DAYzz', HOLY = '#fff0c0';
const RAISE = { ...POSES.stand, eF: [26, -206], hF: [36, -250], head: [6, -210] };
function logoText(g, x, y, size) {
  text(g, NAME, x + 8, y + 10, { size, color: '#000', font: FONTS.title, weight: 700, stroke: size * 0.2, strokeColor: '#000' });
  g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(NAME).width; g.restore();
  const gr = g.createLinearGradient(0, y - size / 2, 0, y + size / 2); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(0.55, '#ffd040'); gr.addColorStop(1, '#e08a20');
  text(g, NAME, x, y, { size, color: gr, font: FONTS.title, weight: 700, stroke: size * 0.14, strokeColor: '#1a0c04', glow: 30, glowColor: 'rgba(255,190,60,.8)', spacing: 4 });
  return w;
}
function starsArc(g, cx, cy, r, n = 11, s = 22) { for (let i = 0; i < n; i++) { const a = Math.PI * (1.12 + 0.76 * i / (n - 1)); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.55; glow(g, x, y, s * 2.5, '#fff4c0', 0.5); FX.sparkle(g, x, y, s, '#fffbe8', 1); } }
function crescent(g, x, y, r, bg) { glow(g, x, y, r * 3, '#ffe6a0', 0.35); circle(g, x, y, r, '#ffe6a0'); circle(g, x + r * 0.38, y - r * 0.18, r * 0.86, bg); }

// shared night background: parted sea centre, desert, stars
function world(g, t) {
  const W = E.W, H = E.H;
  shore(g, 0.8, { z: 1.0, y: 40 }, { mood: 'night', split: 0.85 });
  veil(g, '#02030e', 0.35);
  FX.godRays(g, W / 2, -80, { count: 12, angle: Math.PI / 2, spread: 0.5, len: H * 1.3, color: HOLY, a: 0.08 });
}

// b1 — YouTube banner
registerShot('b1', { draw(g, t) {
  const W = E.W, H = E.H, band = [H * 0.353, H * 0.647];   // safe band (desktop shows this strip)
  world(g, t);
  const vg = g.createLinearGradient(0, 0, 0, H); vg.addColorStop(0, 'rgba(2,3,14,.65)'); vg.addColorStop(0.35, 'rgba(2,3,14,.0)'); vg.addColorStop(0.65, 'rgba(2,3,14,.0)'); vg.addColorStop(1, 'rgba(2,3,14,.7)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  starsArc(g, W / 2, band[0] + 40, 430, 11, 16);
  crescent(g, W * 0.86, band[0] + 50, 46, '#060a24');
  // characters at the sides, inside the visible band
  glow(g, W * 0.14, band[1] - 120, 260, GOLD(), 0.35);
  person(g, { x: W * 0.14, y: band[1] + 30, s: 1.25, facing: 1, outfit: MUSA, pose: RAISE, expr: 'determined', staff: true, staffGlow: GOLD(), rim: { color: HOLY, dir: [1, -0.6], w: 5 } });
  qamis(g, W * 0.86, band[1] - 120, 0.55, { glowC: HOLY, rim: HOLY });
  person(g, { x: W * 0.78, y: band[1] + 30, s: 1.2, facing: 1, outfit: YUSUF, pose: POSES.stand, expr: 'smile', look: [1, -0.3], rim: { color: HOLY, dir: [0, -1], w: 5 } });
  logoText(g, W / 2, H * 0.47, 150);
  text(g, 'KISAH PARA NABI DALAM ANIMASI', W / 2, H * 0.585, { size: 42, color: '#ffffff', font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#000', spacing: 6 });
} });

// b2 — profile picture (centre 1080×1080, circle-safe)
registerShot('b2', { draw(g, t) {
  const W = E.W, H = E.H, cx = W / 2, cy = H / 2, R = 540;
  g.fillStyle = radGrad(g, cx, cy - 80, 0, R * 1.2, ['#1a2a6a', '#0a1240', '#04061a']); g.fillRect(0, 0, W, H);
  FX.stars(g, 0, { count: 120, area: [cx - R, cy - R, R * 2, R * 2] });
  FX.godRays(g, cx, cy - 150, { count: 16, angle: 0, spread: Math.PI * 2, len: R * 1.4, color: '#ffe6a0', a: 0.08 });
  crescent(g, cx, cy - 70, 300, '#0c1650');
  starsArc(g, cx, cy - 90, 380, 11, 20);
  // a storyteller figure with the glowing staff standing on the crescent
  glow(g, cx + 30, cy - 150, 260, GOLD(), 0.4);
  person(g, { x: cx + 10, y: cy + 150, s: 1.45, facing: 1, outfit: MUSA, pose: RAISE, expr: 'smile', staff: true, staffGlow: GOLD(), rim: { color: HOLY, dir: [1, -0.6], w: 6 } });
  // name plate
  g.fillStyle = 'rgba(4,6,26,.8)'; g.beginPath(); g.roundRect(cx - 330, cy + 190, 660, 150, 75); g.fill(); g.strokeStyle = GOLD(); g.lineWidth = 6; g.stroke();
  logoText(g, cx, cy + 268, 118);
  ring(g, cx, cy, R - 6, 12, alpha(GOLD(), 0.9));
} });

// b3 — Facebook cover (centre band 1920×730)
registerShot('b3', { draw(g, t) {
  const W = E.W, H = E.H, top = (H - 730) / 2, bot = top + 730;
  world(g, t);
  starsArc(g, W / 2, top + 150, 480, 11, 18);
  crescent(g, W * 0.88, top + 120, 52, '#060a24');
  glow(g, W * 0.15, bot - 200, 300, GOLD(), 0.35);
  person(g, { x: W * 0.15, y: bot - 30, s: 1.6, facing: 1, outfit: MUSA, pose: RAISE, expr: 'determined', staff: true, staffGlow: GOLD(), rim: { color: HOLY, dir: [1, -0.6], w: 6 } });
  qamis(g, W * 0.88, bot - 220, 0.7, { glowC: HOLY, rim: HOLY });
  person(g, { x: W * 0.8, y: bot - 30, s: 1.55, facing: 1, outfit: YUSUF, pose: POSES.stand, expr: 'smile', look: [1, -0.3], rim: { color: HOLY, dir: [0, -1], w: 5 } });
  logoText(g, W / 2, top + 330, 170);
  text(g, 'KISAH PARA NABI DALAM ANIMASI', W / 2, top + 470, { size: 50, color: '#ffffff', font: FONTS.title, weight: 700, stroke: 9, strokeColor: '#000', spacing: 6 });
} });

// b4 — profile picture v2: a front-facing face wearing a kopiah (peci), nothing else
import { bigFace } from '/engine/rig2d.js';
function kopiah(g, cx, cy, r) {
  const shape = (grow = 0) => {
    g.beginPath();
    g.moveTo(cx - r * 0.95 - grow, cy - r * 0.38);
    g.lineTo(cx - r * 0.84 - grow, cy - r * 1.02 - grow);
    g.quadraticCurveTo(cx - r * 0.82, cy - r * 1.1 - grow, cx - r * 0.7, cy - r * 1.1 - grow);
    g.lineTo(cx + r * 0.7, cy - r * 1.1 - grow);
    g.quadraticCurveTo(cx + r * 0.82, cy - r * 1.1 - grow, cx + r * 0.84 + grow, cy - r * 1.02 - grow);
    g.lineTo(cx + r * 0.95 + grow, cy - r * 0.38);
    g.quadraticCurveTo(cx, cy - r * 0.5, cx - r * 0.95 - grow, cy - r * 0.38);
    g.closePath();
  };
  shape(r * 0.04); g.fillStyle = '#ffe2a0'; g.fill();                       // rim light around the cap
  shape(); g.fillStyle = linGrad(g, cx - r, 0, cx + r, 0, ['#1c1a22', '#2e2c38', '#16141c']); g.fill();
  g.save(); shape(); g.clip();
  g.fillStyle = linGrad(g, 0, cy - r * 1.1, 0, cy - r * 0.6, [alpha('#ffffff', 0.16), alpha('#ffffff', 0)]); g.fillRect(cx - r, cy - r * 1.2, r * 2, r * 0.6);   // velvet sheen on top
  for (let i = -6; i <= 6; i++) seg(g, [[cx + i * r * 0.13, cy - r * 1.08], [cx + i * r * 0.14, cy - r * 0.45]], r * 0.012, alpha('#ffffff', 0.05));
  g.restore();
  g.strokeStyle = GOLD(); g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(cx - r * 0.93, cy - r * 0.46); g.quadraticCurveTo(cx, cy - r * 0.58, cx + r * 0.93, cy - r * 0.46); g.stroke();   // gold trim
}
registerShot('b4', { draw(g, t) {
  const W = E.W, H = E.H, cx = W / 2, cy = H / 2, R = 540;
  g.fillStyle = radGrad(g, cx, cy - 60, 0, R * 1.1, ['#1e3a7a', '#0c1a4a', '#04081e']); g.fillRect(0, 0, W, H);
  FX.godRays(g, cx, cy - 40, { count: 18, angle: 0, spread: Math.PI * 2, len: R * 1.3, color: '#ffe6a0', a: 0.07 });
  glow(g, cx, cy - 40, R * 0.95, '#ffd890', 0.25);
  const fr = 300, fy = cy + 30;
  bigFace(g, cx, fy, fr, { outfit: { top: 'dress', color: '#f4efe2' }, expr: 'smile', look: [0, 0], rimColor: '#ffe2a0', rimSide: -1 });
  // baju koko collar
  seg(g, [[cx - fr * 0.18, fy + fr * 0.98], [cx, fy + fr * 1.2], [cx + fr * 0.18, fy + fr * 0.98]], fr * 0.05, '#c8c0aa');
  for (const dy of [1.3, 1.45]) circle(g, cx, fy + fr * dy, fr * 0.03, '#c8c0aa');
  kopiah(g, cx, fy, fr);
  ring(g, cx, cy, R - 8, 14, alpha(GOLD(), 0.9));
} });
