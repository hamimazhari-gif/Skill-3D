// lib8/_sea.js — Yunus props: the great fish (outside & inside), idols, a ship, underwater background.
import { E, V, S, seg, circle, ring, poly, glow, alpha, shade, mix, rng, linGrad, radGrad, rr, lerp, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function underwater(g, t, depth = 0.5) {
  const W = E.W, H = E.H; g.fillStyle = linGrad(g, 0, 0, 0, H, [mix('#0a4a7a', '#02081a', depth), mix('#06284a', '#010410', depth), '#01020a']); g.fillRect(-W, -H, W * 3, H * 3);
  FX.godRays(g, W * 0.6, -100, { count: 9, angle: Math.PI / 2 + 0.1, spread: 0.8, len: H * 1.2, color: '#8ac8ff', a: 0.06 * (1 - depth), t });
  const r = rng(6); for (let i = 0; i < 40; i++) { const x = r() * W, y = H - ((t * (20 + r() * 40) + r() * H) % H); circle(g, x + Math.sin(t + i) * 6, y, 2 + r() * 5, alpha('#cfe8ff', 0.35)); }
}
// the great fish (side view), mouth to the right when f = 1
export function bigFish(g, x, y, s, f, t, o = {}) {
  const c = o.color || '#0e1a2a', belly = o.belly || '#2a3a4a';
  g.save(); g.translate(x, y); g.scale(f * s, s);
  const sw = Math.sin(t * 1.5) * 0.08;
  g.fillStyle = c; g.beginPath(); g.moveTo(420, 0); g.quadraticCurveTo(380, -200, 0, -210); g.quadraticCurveTo(-380, -200, -560, -40); g.lineTo(-760, -180 + sw * 300); g.lineTo(-720, 0); g.lineTo(-760, 180 + sw * 300); g.lineTo(-560, 40); g.quadraticCurveTo(-380, 200, 0, 210); g.quadraticCurveTo(380, 200, 420, 0); g.closePath(); g.fill();
  g.fillStyle = belly; g.beginPath(); g.moveTo(400, 30); g.quadraticCurveTo(300, 190, 0, 200); g.quadraticCurveTo(-300, 190, -500, 60); g.quadraticCurveTo(-200, 120, 0, 110); g.quadraticCurveTo(250, 100, 400, 30); g.fill();
  for (let i = 0; i < 6; i++) seg(g, [[300 - i * 40, 60 + i * 6], [-200 - i * 10, 130 + i * 8]], 3, alpha('#000', 0.25));
  poly(g, [[0, -200], [-120, -320 - sw * 60], [-160, -200]], c);
  seg(g, [[420, 0], [300, 40]], 6, '#05080e');
  circle(g, 300, -70, 22, '#05080e'); circle(g, 306, -76, 7, o.eye || '#cfe8ff');
  if (o.rim) { g.strokeStyle = o.rim; g.lineWidth = 6; g.beginPath(); g.moveTo(420, 0); g.quadraticCurveTo(380, -200, 0, -210); g.quadraticCurveTo(-380, -200, -560, -40); g.stroke(); }
  g.restore();
}
// inside the fish: dark, ribs arching overhead, a faint glow
export function fishInside(g, t, glowK = 0.3) {
  const W = E.W, H = E.H; g.fillStyle = radGrad(g, W / 2, H * 0.6, 0, Math.max(W, H), ['#1a0a10', '#0a0408', '#020102']); g.fillRect(-W, -H, W * 3, H * 3);
  const pulse = 1 + Math.sin(t * 1.2) * 0.02;
  for (let i = 0; i < 9; i++) { const y = H * 0.12 + i * H * 0.09; g.strokeStyle = alpha('#3a1a20', 0.9 - i * 0.05); g.lineWidth = 26 - i; g.beginPath(); g.ellipse(W / 2, y + H * 0.5, W * (0.75 - i * 0.03) * pulse, H * 0.5, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
  g.fillStyle = alpha('#2a1010', 0.8); g.beginPath(); g.ellipse(W / 2, H * 0.98, W * 0.7, H * 0.12, 0, 0, Math.PI * 2); g.fill();
  glow(g, W / 2, H * 0.72, W * 0.5, '#ff9a6a', 0.08 * glowK);
}
export function idol(g, x, y, s, c = '#6a5a4a') {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = shade(c, -0.3); g.fillRect(-70, -40, 140, 40);
  g.fillStyle = c; g.beginPath(); g.moveTo(-50, -40); g.lineTo(-40, -220); g.lineTo(40, -220); g.lineTo(50, -40); g.closePath(); g.fill();
  circle(g, 0, -270, 55, c); poly(g, [[-55, -290], [-30, -360], [-10, -300]], c); poly(g, [[55, -290], [30, -360], [10, -300]], c);
  circle(g, -20, -275, 8, '#ff4a2a'); circle(g, 20, -275, 8, '#ff4a2a'); glow(g, 0, -275, 60, '#ff4a2a', 0.3);
  g.restore();
}
export function ship(g, x, y, s, t, roll = 0) {
  g.save(); g.translate(x, y); g.rotate(roll); g.scale(s, s);
  g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(-260, -40); g.lineTo(260, -40); g.lineTo(200, 40); g.lineTo(-200, 40); g.closePath(); g.fill();
  seg(g, [[0, -40], [0, -360]], 10, '#3a2418'); poly(g, [[6, -340], [180, -120], [6, -100]], '#d8cfb8'); poly(g, [[-6, -320], [-140, -130], [-6, -110]], '#c8bfa8');
  g.restore();
}
