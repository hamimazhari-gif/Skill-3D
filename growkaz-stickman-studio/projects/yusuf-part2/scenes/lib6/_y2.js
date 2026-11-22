// lib6/_y2.js — Part 2 props & sets: torn qamis (back view), doors corridor, prison cell, cows, tally marks, grabbing hand.
import { E, V, S, mood, layer, backdrop, seg, circle, ring, poly, glow, alpha, shade, mix, rng, linGrad, radGrad, rr, lerp, clamp, ease, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { flame } from '../lib/_costume.js';
import { QAMIS } from '../cast.js';

// shirt seen from the back with a vertical tear; tear 0..1 grows the rip; front: true draws the tear on the front (for the witness diagram)
export function qamisTorn(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot || 0);
  const body = () => { g.beginPath(); g.moveTo(-60, -120); g.lineTo(-150, -70); g.lineTo(-120, -20); g.lineTo(-70, -50); g.lineTo(-80, 150); g.lineTo(80, 150); g.lineTo(70, -50); g.lineTo(120, -20); g.lineTo(150, -70); g.lineTo(60, -120); g.quadraticCurveTo(0, o.front ? -95 : -110, -60, -120); g.closePath(); };
  if (o.glowC) glow(g, 0, 0, 320, o.glowC, 0.35);
  if (o.line) { body(); g.strokeStyle = o.line; g.lineWidth = 6; g.stroke(); }
  else { g.save(); g.translate(-6, -6); body(); g.fillStyle = o.rim || '#ffe0b0'; g.fill(); g.restore(); body(); g.fillStyle = QAMIS; g.fill(); g.save(); body(); g.clip(); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(-80, 70, 160, 80); g.restore(); }
  const k = o.tear ?? 1;
  if (k > 0) { const pts = []; const top = lerp(150, -60, k); for (let i = 0; i <= 10; i++) { const u = i / 10, yy = lerp(150, top, u); pts.push([(i % 2 ? 12 : -12) * (1 - u * 0.5), yy]); }
    g.fillStyle = o.line ? alpha(o.line, 0.2) : '#1a0e08'; g.beginPath(); g.moveTo(-22, 150); pts.forEach(([px, py]) => g.lineTo(px, py)); g.lineTo(22, 150); g.closePath(); g.fill(); seg(g, pts, 5, o.line || '#3a2418'); }
  g.restore();
}
// corridor of doors (palace interior); closed: 0..1 per door via fn(i)
export function doorsCorridor(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [shade(M.wall, -0.55), shade(M.wall, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let i = -3; i <= 3; i++) { const x = CX + i * V(340, 300), dw = V(200, 190), dh = V(420, 520); const k = o.closed ? o.closed(i) : 0;
      g.fillStyle = shade(M.wall, -0.6); g.fillRect(x - dw / 2 - 20, GY - dh - 30, dw + 40, dh + 30);
      g.fillStyle = linGrad(g, 0, GY - dh, 0, GY, [M.practical, shade(M.practical, -0.5)]); g.fillRect(x - dw / 2, GY - dh, dw, dh);
      glow(g, x, GY - dh * 0.4, dw, M.practical, 0.2 * (1 - k));
      g.fillStyle = shade(M.wall, -0.35); g.fillRect(x - dw / 2, GY - dh, dw / 2 * k, dh); g.fillRect(x + dw / 2 - dw / 2 * k, GY - dh, dw / 2 * k, dh);
      if (k > 0.95) { seg(g, [[x - 26, GY - dh * 0.5], [x + 26, GY - dh * 0.5]], 10, '#8a6a30'); }
      for (const sx of [-1, 1]) { seg(g, [[x + sx * (dw / 2 + 50), GY - dh * 0.6 + 30], [x + sx * (dw / 2 + 50), GY - dh * 0.6]], 6, '#1a1210'); flame(g, x + sx * (dw / 2 + 50), GY - dh * 0.6, 0.22, t, i * 3 + sx); }
    }
  });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.floor, 0.05), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 700, 'rgba(0,0,0,.25)', 0.07); });
  return { GY, CX, M };
}
// prison cell at night: stone walls, barred window with a moonbeam; o.beam: angle shift (time lapse), o.tally: count
export function prison(g, t, cam, o = {}) {
  const M = mood('night'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  const wx = CX + (o.winX ?? V(260, 200)), wy = GY - V(620, 820), ww = V(180, 170), wh = V(220, 220);
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#0e1020', '#1c1e30', '#14162a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    const r = rng(5); for (let row = 0; row < 30; row++) for (let c = 0; c < 14; c++) { const x = -E.W * 0.3 + c * 160 + (row % 2) * 80, y = GY - row * 70; g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(x, y - 70, 160, 70); if (r() < 0.2) { g.fillStyle = 'rgba(255,255,255,.03)'; g.fillRect(x, y - 70, 160, 70); } }
    g.fillStyle = '#9ab8ff'; g.fillRect(wx - ww / 2, wy, ww, wh); glow(g, wx, wy + wh / 2, 300, '#9ab8ff', 0.3);
    for (let i = 1; i < 4; i++) seg(g, [[wx - ww / 2 + i * ww / 4, wy], [wx - ww / 2 + i * ww / 4, wy + wh]], 10, '#0a0a12');
    if (o.tally) { for (let i = 0; i < o.tally; i++) { const gx = CX - V(380, 330) + Math.floor(i / 5) * 70, gy = GY - V(420, 520); if (i % 5 === 4) seg(g, [[gx - 8, gy + 50], [gx + 52, gy + 10]], 4, alpha('#d8d0c0', 0.6)); else seg(g, [[gx + (i % 5) * 12, gy], [gx + (i % 5) * 12, gy + 60]], 4, alpha('#d8d0c0', 0.6)); } }
  });
  const ang = Math.PI / 2 + 0.5 + (o.beam || 0);
  g.save(); g.globalCompositeOperation = 'lighter'; layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, wx, wy, wx - Math.cos(ang) * -900, wy + 1200, [alpha('#9ab8ff', 0.22), alpha('#9ab8ff', 0)]); g.beginPath(); g.moveTo(wx - ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.lineTo(wx + ww / 2 + Math.cos(ang) * 1400, wy + wh + Math.sin(ang) * 1400); g.lineTo(wx - ww / 2 + Math.cos(ang) * 1400, wy + Math.sin(ang) * 1400); g.closePath(); g.fill(); }); g.restore();
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, ['#1a1a24', '#06060c']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.35)', 0.08); });
  FX.dust(g, t, { count: 30, color: '#bcd0ff', a: 0.25 });
  return { GY, CX, M, wx, wy };
}
// cow (side view); fat 0..1 (1 = fat, 0 = skeletal)
export function cow(g, x, y, s, f, t, fat = 1, o = {}) {
  const ph = t * 5, bw = lerp(60, 110, fat), bh = lerp(26, 58, fat), col = o.color || (fat > 0.5 ? '#e8dcc4' : '#6a5a48'), ink = S().ink;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  if (o.rim) { g.fillStyle = o.rim; g.beginPath(); g.ellipse(-3, -110 - 3, bw + 4, bh + 4, 0, 0, Math.PI * 2); g.fill(); }
  for (const [lx, k] of [[-bw * 0.6, 0], [-bw * 0.4, 1.6], [bw * 0.5, 3.2], [bw * 0.7, 4.8]]) seg(g, [[lx, -100], [lx + Math.sin(ph + k) * 10, 0]], lerp(8, 13, fat), ink);
  g.fillStyle = col; g.beginPath(); g.ellipse(0, -110, bw, bh, 0, 0, Math.PI * 2); g.fill();
  if (fat > 0.5) { g.fillStyle = '#2a201a'; for (const [sx, sy, r] of [[-30, -120, 18], [20, -100, 14], [45, -125, 12]]) { g.beginPath(); g.ellipse(sx, sy, r, r * 0.7, 0.4, 0, Math.PI * 2); g.fill(); } }
  else { g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.arc(i * 14, -110, bh * 0.9, Math.PI * 0.3, Math.PI * 0.7); g.stroke(); } }
  g.fillStyle = col; g.beginPath(); g.ellipse(bw + 20, -128, 32, 22, 0.3, 0, Math.PI * 2); g.fill();
  seg(g, [[bw + 14, -150], [bw + 4, -170]], 6, '#d8d0c0'); seg(g, [[bw + 30, -150], [bw + 40, -170]], 6, '#d8d0c0');
  circle(g, bw + 30, -132, 4, fat > 0.5 ? ink : '#ff3a2a');
  seg(g, [[-bw, -110], [-bw - 30, -80 + Math.sin(ph) * 6]], 4, ink);
  g.restore();
}
// a hand reaching / grabbing from the left edge
export function grabHand(g, x, y, s, closed, sleeve = '#4a1e3a') {
  const ink = S().ink;
  seg(g, [[x - 30 * s, y + 10 * s], [-E.W * 0.2, y + 120 * s]], 60 * s, ink);
  seg(g, [[x - 120 * s, y + 50 * s], [-E.W * 0.2, y + 140 * s]], 90 * s, sleeve);
  circle(g, x, y, 40 * s, ink);
  for (let i = 0; i < 4; i++) { const a = (closed ? 1.6 : -0.4) + i * 0.25; seg(g, [[x, y - 10 * s], [x + Math.cos(a) * (closed ? 45 : 80) * s, y - 10 * s + Math.sin(a) * (closed ? 45 : 80) * s]], 16 * s, ink); }
}
