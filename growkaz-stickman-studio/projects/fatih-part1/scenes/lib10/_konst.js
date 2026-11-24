// lib10/_konst.js — Constantinople sets + Ottoman/Byzantine headwear.
import { E, V, alpha, circle, seg, poly, rr, linGrad, glow, clamp } from '/engine/core.js';
import { headPos } from '/engine/rig2d.js';
import { person, bigPerson } from '../lib/_costume.js';
// headwear: 'turban' (white), 'sultan' (tall turban + plume), 'helmet' (Byzantine), 'guru' (green-banded turban)
export function hat(g, x, y, r, kind) {
  if (kind === 'yeniseri') { g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(x - r * 0.95, y - r * 0.4); g.lineTo(x - r * 0.7, y - r * 1.9); g.quadraticCurveTo(x - r * 0.2, y - r * 2.2, x + r * 0.3, y - r * 1.8); g.quadraticCurveTo(x + r * 1.6, y - r * 1.2, x + r * 1.4, y + r * 0.6); g.quadraticCurveTo(x + r * 1.0, y - r * 0.6, x + r * 0.95, y - r * 0.4); g.closePath(); g.fill(); g.fillStyle = '#c8a040'; g.fillRect(x - r * 1.0, y - r * 0.55, r * 2.0, r * 0.25); seg(g, [[x - r * 0.1, y - r * 0.55], [x - r * 0.1, y - r * 1.2]], r * 0.18, '#c8a040'); return; }
  if (kind === 'helmet') { g.fillStyle = '#8a8a96'; g.beginPath(); g.arc(x, y - r * 0.1, r * 1.08, Math.PI, 0); g.fill(); g.fillRect(x - r * 1.12, y - r * 0.15, r * 2.24, r * 0.22); seg(g, [[x, y - r * 1.15], [x, y - r * 1.6]], r * 0.18, '#a82a2a'); circle(g, x, y - r * 1.65, r * 0.22, '#c83a3a'); return; }
  const tall = kind === 'sultan' ? 1.5 : 1, band = kind === 'guru' ? '#3a7a3a' : kind === 'sultan' ? '#c8a040' : '#d8d0c0';
  g.fillStyle = '#f4efe2'; g.beginPath(); g.ellipse(x, y - r * 0.75 * tall, r * 1.12, r * 0.72 * tall, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = alpha('#b8b0a0', 0.9); g.lineWidth = Math.max(2, r * 0.08); for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x, y - r * (0.45 + i * 0.3) * tall, r * 1.05, r * 0.25, -0.15, 0, Math.PI); g.stroke(); }
  g.fillStyle = band; g.beginPath(); g.ellipse(x, y - r * 0.3, r * 1.08, r * 0.2, 0, 0, Math.PI * 2); g.fill();
  if (kind === 'sultan') { circle(g, x, y - r * 0.95 * tall, r * 0.16, '#c8303a'); seg(g, [[x, y - r * 1.0 * tall], [x + r * 0.25, y - r * 1.75 * tall]], r * 0.12, '#f8f0e0'); circle(g, x, y - r * 0.95 * tall, r * 0.09, '#ffe08a'); }
}
export function personH(g, o, kind) { person(g, o); if (kind) { const [hx, hy, r] = headPos(o); hat(g, hx, hy, r, kind); } }
export function bigPersonH(g, cx, cy, r, o, kind) { bigPerson(g, cx, cy, r, o); if (kind) hat(g, cx, cy - r * 0.5, r * 0.95, kind); }
// skyline: domes + minaret-less churches + towers. y = base line
export function skyline(g, y, s, c, o = {}) {
  g.fillStyle = c;
  const blocks = [[-0.45, 0.25, 0.18], [-0.25, 0.4, 0.14], [0.05, 0.3, 0.22], [0.32, 0.22, 0.16], [0.5, 0.35, 0.12]];
  for (const [dx, h, w] of blocks) g.fillRect(E.W * (0.5 + dx) - E.W * w / 2, y - E.H * h * 0.35 * s, E.W * w, E.H * h * 0.35 * s + 4);
  // the great dome (Hagia Sophia–like silhouette)
  const hx = E.W * (0.5 + (o.domeX ?? 0)), hw = V(260, 220) * s, hb = y - V(170, 210) * s;
  g.fillRect(hx - hw, hb, hw * 2, y - hb + 4); g.beginPath(); g.arc(hx, hb, hw * 0.75, Math.PI, 0); g.fill(); g.beginPath(); g.arc(hx - hw * 0.7, hb + 10, hw * 0.4, Math.PI, 0); g.fill(); g.beginPath(); g.arc(hx + hw * 0.7, hb + 10, hw * 0.4, Math.PI, 0); g.fill();
  if (o.cross !== false) { seg(g, [[hx, hb - hw * 0.75], [hx, hb - hw * 0.95]], 6 * s, c); seg(g, [[hx - 14 * s, hb - hw * 0.88], [hx + 14 * s, hb - hw * 0.88]], 5 * s, c); }
  for (const dx of [-0.38, 0.4]) { const x = E.W * (0.5 + dx); g.fillRect(x - 30 * s, y - V(260, 320) * s, 60 * s, V(260, 320) * s); g.beginPath(); g.arc(x, y - V(260, 320) * s, 36 * s, Math.PI, 0); g.fill(); }
  if (o.lights) for (let i = 0; i < 40; i++) { const x = ((i * 137) % 1000) / 1000 * E.W, yy = y - ((i * 61) % 100) / 100 * V(120, 160) * s; circle(g, x, yy, 3 * s, alpha('#ffd27a', 0.7)); }
}
// layered walls with towers. k = rise 0..1 for each layer; y = base, c = stone colour
export function walls(g, y, s, c, k = [1, 1, 1], o = {}) {
  const layers = [{ h: 0.5, dy: -V(120, 160), tw: 220, sh: -0.35 }, { h: 0.72, dy: -V(60, 80), tw: 260, sh: -0.2 }, { h: 0.42, dy: 0, tw: 200, sh: -0.05 }];
  layers.forEach((L, i) => {
    const kk = clamp(k[i] ?? 1, 0, 1); if (kk <= 0) return;
    const base = y + L.dy * s, h = V(260, 320) * L.h * s * kk / 0.5, col = shadeHex(c, L.sh);
    g.fillStyle = col; g.fillRect(-E.W, base - h, E.W * 3, h + 6);
    for (let x = -40; x < E.W + 80; x += 46 * s) g.fillRect(x, base - h - 22 * s, 26 * s, 24 * s);
    for (let x = (i * 70) % (L.tw * s); x < E.W + 200; x += L.tw * s) { const tw = 90 * s, th = h + 90 * s; g.fillStyle = shadeHex(col, -0.12); g.fillRect(x - tw / 2, base - th, tw, th + 6); g.fillStyle = shadeHex(col, -0.12); for (let j = 0; j < 3; j++) g.fillRect(x - tw / 2 + j * tw / 2.5, base - th - 18 * s, tw / 5, 20 * s); g.fillStyle = alpha('#000', 0.5); rr(g, x - 8 * s, base - th + 30 * s, 16 * s, 30 * s, 8 * s); g.fill(); g.fillStyle = col; }
    g.strokeStyle = alpha('#000', 0.15); g.lineWidth = 2; for (let yy = base - h + 30; yy < base; yy += 34 * s) { g.beginPath(); g.moveTo(-E.W, yy); g.lineTo(E.W * 2, yy); g.stroke(); }
  });
}
export function shadeHex(a, k) { const m = a.startsWith('rgb') ? a.match(/\d+/g).map(Number) : [16, 8, 0].map((s) => (parseInt(a.slice(1), 16) >> s) & 255); const c = m.map((v) => Math.round(clamp(v * (1 + k), 0, 255))); return `rgb(${c.join(',')})`; }
// galley / sailing ship side view
export function galley(g, x, y, s, f = 1, t = 0, c = '#3a2418', flag = null) {
  g.save(); g.translate(x, y + Math.sin(t * 2 + x) * 4 * s); g.scale(f * s, s);
  g.fillStyle = c; g.beginPath(); g.moveTo(-200, -40); g.lineTo(200, -40); g.quadraticCurveTo(190, 20, 140, 30); g.lineTo(-150, 30); g.quadraticCurveTo(-210, 0, -200, -40); g.fill();
  seg(g, [[0, -40], [0, -260]], 8, '#2a1a10'); g.fillStyle = '#e8dcc0'; g.beginPath(); g.moveTo(6, -250); g.quadraticCurveTo(110, -170, 6, -70); g.closePath(); g.fill();
  for (let i = -150; i < 150; i += 30) seg(g, [[i, 10], [i - 20, 50]], 3, '#2a1a10');
  if (flag) { g.fillStyle = flag; g.fillRect(0, -290, 60, 36); }
  g.restore();
}
// Ottoman palace interior: tiled walls, pointed-arch opening onto domes + minarets, carpet floor, optional divan throne
function minaretSky(g, x, y, s, c) { // Ottoman skyline (domes with slim pencil minarets)
  g.fillStyle = c; g.fillRect(x - 160 * s, y - 120 * s, 320 * s, 124 * s); g.beginPath(); g.arc(x, y - 120 * s, 120 * s, Math.PI, 0); g.fill();
  for (const dx of [-120, 120]) { g.beginPath(); g.arc(x + dx * s, y - 110 * s, 50 * s, Math.PI, 0); g.fill(); }
  for (const dx of [-230, 230]) { g.fillRect(x + dx * s - 9 * s, y - 380 * s, 18 * s, 384 * s); g.beginPath(); g.moveTo(x + dx * s - 11 * s, y - 380 * s); g.lineTo(x + dx * s, y - 440 * s); g.lineTo(x + dx * s + 11 * s, y - 380 * s); g.fill(); g.fillRect(x + dx * s - 15 * s, y - 300 * s, 30 * s, 8 * s); }
  seg(g, [[x, y - 240 * s], [x, y - 270 * s]], 4 * s, c);
}
export function ottoPalace(g, t, o = {}) {
  const W = E.W, H = E.H, GY = H * V(0.8, 0.7), CX = W / 2, P = o.pal || { sky: ['#3a2050', '#d86a4a', '#f8c890'], wall: '#5a2a2a', floor: '#3a1a14', rim: '#ffcf8f' };
  g.fillStyle = linGrad(g, 0, 0, 0, GY, [shadeHex(P.wall, -0.5), P.wall]); g.fillRect(-W, -H, W * 3, H * 3);
  for (let y = 40; y < GY; y += 90) for (let x = (y / 90 % 2) * 45; x < W; x += 90) { g.fillStyle = alpha('#3a8aa8', 0.12); g.beginPath(); g.moveTo(x, y - 20); g.lineTo(x + 20, y); g.lineTo(x, y + 20); g.lineTo(x - 20, y); g.fill(); }
  const ow = V(760, 600), oh = V(560, 900), ox = CX - ow / 2, oy = GY - oh - V(60, 80);
  const arch = (g) => { g.beginPath(); g.moveTo(ox, GY - V(60, 80)); g.lineTo(ox, oy + ow * 0.4); g.quadraticCurveTo(ox, oy, CX, oy - ow * 0.25); g.quadraticCurveTo(ox + ow, oy, ox + ow, oy + ow * 0.4); g.lineTo(ox + ow, GY - V(60, 80)); g.closePath(); };
  g.save(); arch(g); g.clip(); g.fillStyle = linGrad(g, 0, oy - ow * 0.25, 0, GY, P.sky); g.fillRect(ox, oy - ow * 0.3, ow, oh + ow);
  if (o.sun !== false) FX_sun(g, CX + ow * 0.2, GY - oh * 0.45, 50);
  minaretSky(g, CX, GY - V(80, 100), V(0.9, 0.8), shadeHex(P.wall, -0.55)); g.restore();
  g.strokeStyle = '#c8a040'; g.lineWidth = 10; arch(g); g.stroke();
  g.fillStyle = P.floor; g.fillRect(-W, GY, W * 3, H); g.fillStyle = '#8a1e22'; g.beginPath(); g.moveTo(CX - V(360, 300), GY + 20); g.lineTo(CX + V(360, 300), GY + 20); g.lineTo(CX + V(520, 440), H); g.lineTo(CX - V(520, 440), H); g.fill();
  g.strokeStyle = '#c8a040'; g.lineWidth = 6; g.beginPath(); g.moveTo(CX - V(330, 270), GY + 40); g.lineTo(CX + V(330, 270), GY + 40); g.lineTo(CX + V(480, 400), H); g.moveTo(CX - V(330, 270), GY + 40); g.lineTo(CX - V(480, 400), H); g.stroke();
  for (const sx of [-1, 1]) { g.fillStyle = shadeHex(P.wall, -0.3); g.fillRect(CX + sx * V(470, 380) - 30, GY - oh - V(120, 160), 60, oh + V(140, 180)); g.fillStyle = '#c8a040'; g.fillRect(CX + sx * V(470, 380) - 38, GY - oh - V(140, 180), 76, 24); }
  if (o.divan) { g.fillStyle = '#6a1418'; rr(g, CX - 180, GY - 90, 360, 110, 14); g.fill(); g.fillStyle = '#c8a040'; g.fillRect(CX - 180, GY - 30, 360, 10); g.fillStyle = '#8a2a2a'; rr(g, CX - 200, GY - 200, 400, 120, 30); g.fill(); g.strokeStyle = '#c8a040'; g.lineWidth = 5; g.stroke(); }
  glow(g, CX, GY - oh * 0.4, ow * 0.8, '#ffc070', 0.15);
  return { GY, CX, M: { rim: P.rim } };
}
function FX_sun(g, x, y, r) { glow(g, x, y, r * 4, '#ffb070', 0.5); circle(g, x, y, r, '#fff3dc'); }
