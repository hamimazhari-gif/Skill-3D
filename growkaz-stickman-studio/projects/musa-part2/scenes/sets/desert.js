// sets/desert.js — open desert (golden / dusk / night) with layered dunes, and a parchment route map.
import { E, V, S, mood, layer, backdrop, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, text, ease, prog, lerp, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const ground = () => E.H * V(0.8, 0.68);
function dune(g, y, amp, color, seed, freq = 0.003) {
  g.fillStyle = color; g.beginPath(); g.moveTo(-E.W, E.H * 3);
  for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, y - Math.sin(x * freq + seed) * amp - Math.sin(x * freq * 2.3 + seed * 3) * amp * 0.35);
  g.lineTo(E.W * 2, E.H * 3); g.closePath(); g.fill();
}
// desert(g, t, cam, { mood, sunX, night, wind })
export function desert(g, t, cam, o = {}) {
  const night = o.mood === 'night', M = mood(o.mood || 'golden'), GY = ground(), CX = E.W / 2;
  const sand = night ? shade(M.floor, 0.05) : mix(M.key, M.floor, 0.55);
  layer(g, cam, 0.08, (g) => {
    backdrop(g, M.sky);
    if (night) { FX.stars(g, t, { count: 220, area: [-E.W * 0.3, 0, E.W * 1.6, GY * 0.8] }); FX.moon(g, CX + (o.sunX ?? V(380, 260)), GY - V(700, 1100), V(42, 48)); }
    else { FX.sun(g, CX + (o.sunX ?? V(380, 180)), GY - V(330, 520), V(80, 90), '#fff3dc', M.key, 5); FX.godRays(g, CX + (o.sunX ?? V(380, 180)), GY - V(330, 520), { count: 9, len: V(1400, 1700), spread: 2.6, color: M.key, a: 0.05 }); }
  });
  layer(g, cam, 0.25, (g) => dune(g, GY - V(180, 260), 50, mix(sand, M.sky[0], night ? 0.5 : 0.55), 1.3, 0.0022));
  layer(g, cam, 0.45, (g) => { dune(g, GY - V(90, 130), 60, mix(sand, M.dark, 0.35), 4.1, 0.0028); FX.fog(g, GY - V(160, 240), 200, M.fog, night ? 0.12 : 0.18); });
  layer(g, cam, 0.85, (g) => {
    dune(g, GY + 10, 22, shade(sand, -0.25), 7.7, 0.004);
    g.fillStyle = linGrad(g, 0, GY + 40, 0, GY + 600, [alpha('#000', 0), alpha(M.dark, 0.7)]); g.fillRect(-E.W, GY + 40, E.W * 3, E.H * 2);
    if (!night) FX.pool(g, CX + (o.sunX ?? 0) * 0.4, GY + 30, 600, 60, M.key, 0.12);
    // rocks & dry shrubs
    const r = rng(o.seed || 5);
    for (let i = 0; i < 7; i++) { const x = -E.W * 0.3 + r() * E.W * 1.6, y = GY + 20 + r() * 220; g.fillStyle = shade(M.dark, -0.2); g.beginPath(); g.ellipse(x, y, 30 + r() * 40, 12 + r() * 10, 0, Math.PI, Math.PI * 2); g.fill(); }
  });
  if (o.wind !== false) blowingSand(g, t, sand, GY);
  return { GY, CX, M, sand };
}
export function blowingSand(g, t, color, GY, a = 0.35) {
  const r = rng(21);
  for (let i = 0; i < 90; i++) {
    const sp = 120 + r() * 260, x = ((r() * E.W * 1.4 + t * sp) % (E.W * 1.4)) - E.W * 0.2, y = GY - 200 + r() * 520 + Math.sin(t * 2 + i) * 8;
    seg(g, [[x, y], [x - 18 - sp * 0.06, y + 2]], 2, alpha(shade(color, 0.3), a * (0.4 + r() * 0.6)));
  }
}
// parchment map: Egypt -> Madyan, route draws on with p (0..1)
export function routeMap(g, t, p, o = {}) {
  const W = E.W, H = E.H;
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#3a2a1a', '#2a1c10']); g.fillRect(-W, -H, W * 3, H * 3);
  const mx = V(260, 90), my = V(120, 380), mw = W - mx * 2, mh = H - my * 2;
  g.fillStyle = linGrad(g, 0, my, 0, my + mh, ['#e6d2a6', '#d8bf8c', '#c9ab74']); g.fillRect(mx, my, mw, mh);
  g.fillStyle = alpha('#7a5a30', 0.18); for (let i = 0; i < 14; i++) g.fillRect(mx, my + i * mh / 14, mw, 2);
  const X = (u) => mx + u * mw, Y = (v) => my + v * mh, ink = '#4a3218', sea = alpha('#2c6f9e', 0.55);
  // Mediterranean (top), Red Sea gulfs (Sinai between)
  g.fillStyle = sea; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(1), Y(0)); g.lineTo(X(1), Y(0.12)); g.quadraticCurveTo(X(0.6), Y(0.2), X(0.3), Y(0.14)); g.quadraticCurveTo(X(0.1), Y(0.1), X(0), Y(0.16)); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(X(0.42), Y(0.42)); g.lineTo(X(0.58), Y(1)); g.lineTo(X(0.7), Y(1)); g.lineTo(X(0.6), Y(0.75)); g.closePath(); g.fill();      // Gulf of Suez / Red Sea
  g.beginPath(); g.moveTo(X(0.74), Y(0.5)); g.lineTo(X(0.7), Y(1)); g.lineTo(X(0.78), Y(1)); g.lineTo(X(0.78), Y(0.52)); g.closePath(); g.fill();       // Gulf of Aqaba
  // Nile
  g.strokeStyle = sea; g.lineWidth = 6; g.beginPath(); g.moveTo(X(0.2), Y(1)); g.quadraticCurveTo(X(0.26), Y(0.6), X(0.22), Y(0.3)); g.quadraticCurveTo(X(0.2), Y(0.2), X(0.18), Y(0.15)); g.stroke();
  // pyramids icon + labels
  for (const [u, s] of [[0.12, 1], [0.16, 0.7]]) poly(g, [[X(u) - 26 * s, Y(0.38)], [X(u), Y(0.38) - 34 * s], [X(u) + 26 * s, Y(0.38)]], ink);
  const ui = S().ui;
  text(g, 'MESIR', X(0.15), Y(0.46), { size: V(44, 50), color: ink, font: FONTS.title });
  text(g, 'SINAI', X(0.56), Y(0.36), { size: V(30, 34), color: alpha(ink, 0.6), font: FONTS.title, spacing: 4 });
  // route
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([X(lerp(0.2, 0.86, u)), Y(0.33 + Math.sin(u * Math.PI) * -0.06 + u * 0.12)]); }
  const n = Math.max(2, Math.floor(p * pts.length));
  g.setLineDash([14, 12]); seg(g, pts.slice(0, n), 5, '#a8321e'); g.setLineDash([]);
  const hd = pts[n - 1]; circle(g, hd[0], hd[1], 12, '#a8321e'); glow(g, hd[0], hd[1], 60, '#ff7a3a', 0.4);
  const ma = ease.outBack(prog(p, 0.85, 1));
  if (ma > 0) { g.save(); g.translate(X(0.86), Y(0.45)); g.scale(ma, ma); circle(g, 0, 0, 18, ink); circle(g, 0, 0, 8, '#e6d2a6'); g.restore(); text(g, 'MADYAN', X(0.84), Y(0.53), { size: V(44, 50), color: ink, font: FONTS.title, alpha: ma }); }
  g.fillStyle = alpha('#000', 0.35); g.fillRect(mx, my + mh - 6, mw, 6);
}
