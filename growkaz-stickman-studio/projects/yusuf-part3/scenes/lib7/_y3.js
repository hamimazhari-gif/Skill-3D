// lib7/_y3.js — Part 3 props: wheat ears, grain sacks & granary, cracked drought earth, choice prompt, blind eyes.
import { E, V, S, seg, circle, ring, poly, glow, alpha, shade, mix, rng, linGrad, rr, lerp, clamp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

// one ear of wheat; green: true = fresh, false = dry & withered; sway
export function wheat(g, x, y, s, green, t = 0, seed = 0) {
  const c = green ? '#7ac84a' : '#9a7a4a', d = green ? '#4a8a2a' : '#6a4a2a', sway = Math.sin(t * 1.5 + seed) * (green ? 0.06 : 0.02), droop = green ? 0 : 0.5;
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(sway);
  g.strokeStyle = d; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, -120, droop * 60, -220 + droop * 40); g.stroke();
  const tx = droop * 60, ty = -220 + droop * 40;
  for (let i = 0; i < 8; i++) { const k = i / 8; for (const sd of [-1, 1]) { g.fillStyle = i % 2 ? c : shade(c, 0.15); g.beginPath(); g.ellipse(tx + sd * 10 - droop * k * 20, ty - k * 90 + droop * k * 50, green ? 11 : 7, green ? 20 : 14, sd * 0.5 + droop, 0, Math.PI * 2); g.fill(); } }
  for (let i = 0; i < 3; i++) seg(g, [[tx, ty - 90], [tx + (i - 1) * 16, ty - 140]], 2, alpha(c, 0.8));
  if (!green) { g.strokeStyle = alpha('#3a2a1a', 0.5); g.lineWidth = 3; g.beginPath(); g.moveTo(0, -60); g.lineTo(20, -100); g.stroke(); }
  g.restore();
}
export function sack(g, x, y, s, fill = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#c8a870'; g.beginPath(); g.moveTo(-50, 0); g.quadraticCurveTo(-62, -60 * fill - 20, -30, -90 * fill - 10); g.lineTo(30, -90 * fill - 10); g.quadraticCurveTo(62, -60 * fill - 20, 50, 0); g.closePath(); g.fill();
  seg(g, [[-28, -90 * fill - 6], [28, -90 * fill - 6]], 8, '#8a6a3a'); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-50, -20, 100, 20);
  g.restore();
}
// cracked dry earth band from y to the bottom
export function drought(g, t, y) {
  g.fillStyle = linGrad(g, 0, y, 0, E.H, ['#a8784a', '#6a4426']); g.fillRect(-E.W, y, E.W * 3, E.H * 2);
  const r = rng(12); g.strokeStyle = 'rgba(40,20,10,.55)'; g.lineWidth = 3;
  for (let i = 0; i < 40; i++) { let x = r() * E.W, yy = y + r() * (E.H - y); g.beginPath(); g.moveTo(x, yy); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 120; yy += (r() - 0.3) * 60; g.lineTo(x, yy); } g.stroke(); }
}
// two-choice comment prompt (e.g. MEMBALAS vs MEMAAFKAN)
export function choicePrompt(g, t, q, a, b) {
  const ui = S().ui, k = ease.out(prog(t, 0.1, 0.5));
  q.forEach((ln, i) => text(g, ln, E.W / 2, E.H * V(0.25, 0.27) + i * V(84, 92), { size: V(66, 72), color: '#ffffff', font: FONTS.title, stroke: 12, strokeColor: '#000', glow: 20, glowColor: 'rgba(255,190,90,.6)', alpha: k }));
  const by = E.H * V(0.25, 0.27) + q.length * V(84, 92) + V(90, 120);
  [[a, '#d83a2a', -1], [b, '#2aa860', 1]].forEach(([str, col, sd], i) => { const p = ease.outBack(prog(t, 0.6 + i * 0.25, 1.0 + i * 0.25)); g.save(); g.translate(E.W / 2 + sd * V(300, 290), by); g.scale(p, p); rr(g, -170, -56, 340, 112, 56); g.fillStyle = col; g.fill(); text(g, str, 0, 4, { size: V(46, 46), color: '#fff', font: FONTS.title, weight: 700 }); g.restore(); });
  text(g, 'ATAU', E.W / 2, by + 4, { size: V(40, 44), color: ui.gold, font: FONTS.title, alpha: ease.out(prog(t, 1.0, 1.3)) });
  const cy = by + V(150, 180), cp = ease.outBack(prog(t, 1.3, 1.7));
  g.save(); g.translate(E.W / 2, cy); g.scale(cp, cp); rr(g, -260, -54, 520, 108, 54); g.fillStyle = '#ffffff'; g.fill(); poly(g, [[-140, 50], [-100, 50], [-150, 90]], '#ffffff');
  for (let i = 0; i < 3; i++) circle(g, -200 + i * 30, 0, 10 + 3 * Math.max(0, Math.sin(t * 6 - i)), '#555'); text(g, 'Tulis di komentar', 40, 2, { size: 38, color: '#222', font: FONTS.ui, weight: 900 }); g.restore();
}
// paint blind (milky white) eyes over a bigFace at (cx, cy, r); sight 0..1 restores the pupils
export function blindEyes(g, cx, cy, r, sight = 0) {
  for (const sx of [-1, 1]) { const ex = cx + sx * r * 0.34, ey = cy - r * 0.16; circle(g, ex, ey, r * 0.2, S().ink); circle(g, ex, ey, r * 0.16, mix('#dfe6ea', '#ffffff', sight)); if (sight > 0) circle(g, ex, ey, r * 0.085 * sight, S().ink); }
}
