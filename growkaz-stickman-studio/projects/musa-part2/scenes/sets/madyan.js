// sets/madyan.js — the well of Madyan (golden hour) and the Madyan tent camp (dusk).
import { E, V, S, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { palm, flame } from '../lib/_costume.js';
import { blowingSand } from './desert.js';

export const ground = () => E.H * V(0.8, 0.68);
function farDunes(g, GY, M, sand) {
  g.fillStyle = mix(sand, M.sky[0], 0.5); g.beginPath(); g.moveTo(-E.W, GY); for (let x = -E.W; x <= E.W * 2; x += 30) g.lineTo(x, GY - V(140, 200) - Math.sin(x * 0.0024 + 1) * 40); g.lineTo(E.W * 2, GY); g.fill();
}
// the stone well; returns rope / bucket anchor
export function wellProp(g, x, GY, M, o = {}) {
  const st = shade(M.wall, 0.1), dk = shade(M.wall, -0.45), w = V(300, 280), h = 130;
  g.fillStyle = linGrad(g, x - w / 2, 0, x + w / 2, 0, [dk, st, shade(st, 0.12), dk]); g.fillRect(x - w / 2, GY - h, w, h);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { g.fillStyle = alpha('#000', 0.16); g.fillRect(x - w / 2 + c * w / 6 + (r % 2) * 20, GY - h + r * 33, 3, 30); g.fillRect(x - w / 2, GY - h + r * 33, w, 3); }
  g.fillStyle = shade(st, 0.15); g.beginPath(); g.ellipse(x, GY - h, w / 2, 22, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0c0a10'; g.beginPath(); g.ellipse(x, GY - h, w / 2 - 18, 14, 0, 0, Math.PI * 2); g.fill();
  if (o.water) { g.fillStyle = alpha('#7ac0e0', 0.5); g.beginPath(); g.ellipse(x, GY - h + 2, w / 2 - 30, 8, 0, 0, Math.PI * 2); g.fill(); }
  // wooden frame + pulley
  const fh = 260; for (const sx of [-1, 1]) seg(g, [[x + sx * (w / 2 - 14), GY - h], [x + sx * (w / 2 - 40), GY - h - fh]], 12, '#2a1c12');
  seg(g, [[x - w / 2 + 20, GY - h - fh], [x + w / 2 - 20, GY - h - fh]], 14, '#2a1c12'); circle(g, x, GY - h - fh + 12, 18, '#3a2818');
  return { top: GY - h, pulley: [x, GY - h - fh + 12] };
}
export function trough(g, x, GY, M, water = 0) {
  const w = 240; g.fillStyle = shade(M.wall, -0.3); g.fillRect(x - w / 2, GY - 52, w, 52); g.fillStyle = shade(M.wall, -0.05); g.fillRect(x - w / 2 - 8, GY - 58, w + 16, 10);
  if (water > 0) { g.fillStyle = alpha('#8fd0f0', 0.75); g.fillRect(x - w / 2 + 6, GY - 48, w - 12, 10 * water); glow(g, x, GY - 44, 120, '#bfe8ff', 0.15 * water); }
}
export function well(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = ground(), CX = E.W / 2, sand = mix(M.key, M.floor, 0.55);
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX - V(520, 260), GY - V(380, 560), V(70, 80), '#fff3dc', M.key, 5); FX.clouds(g, { y: GY - V(700, 1200), h: 160, color: '#ffe7c7', a: 0.12, seed: 2 }); });
  layer(g, cam, 0.3, (g) => { farDunes(g, GY, M, sand); for (const [x, s] of [[-700, 0.8], [-420, 0.6], [900, 0.9], [1250, 0.7]]) palm(g, CX + x, GY - V(120, 170), s, mix(M.dark, M.sky[1], 0.25), t, x); });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 500, [shade(sand, -0.15), shade(M.dark, -0.1)]); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2);
    FX.pool(g, CX - V(300, 150), GY + 30, 700, 70, M.key, 0.15);
    for (const [x, s] of [[-560, 1.15], [620, 1.25]]) palm(g, CX + x, GY + 10, s, shade(M.dark, -0.35), t, x * 2);
  });
  const wx = CX + (o.wellX ?? 0);
  let W = null; layer(g, cam, 1, (g) => { W = wellProp(g, wx, GY, M, o); trough(g, wx + V(330, 250), GY, M, o.water || 0); });
  return { GY, CX, M, W, wx, sand };
}
// tent camp at dusk
export function tent(g, x, GY, w, h, M, f = 1, lit = 1, t = 0) {
  const c = shade(M.wall, 0.12), d = shade(M.wall, -0.4);
  poly(g, [[x - w / 2, GY], [x - w * 0.42, GY - h * 0.75], [x, GY - h], [x + w * 0.42, GY - h * 0.75], [x + w / 2, GY]], c);
  poly(g, [[x, GY - h], [x + w * 0.42, GY - h * 0.75], [x + w / 2, GY], [x + w * 0.1, GY]], alpha('#000', 0.25));
  for (let i = 0; i < 3; i++) { g.fillStyle = alpha('#a8321e', 0.6); g.fillRect(x - w * 0.42, GY - h * 0.55 + i * 18, w * 0.84, 6); }
  const dw = w * 0.22; g.fillStyle = lit ? linGrad(g, 0, GY - h * 0.55, 0, GY, [M.practical, shade(M.practical, -0.4)]) : d; poly(g, [[x - dw, GY], [x, GY - h * 0.6], [x + dw, GY]], lit ? M.practical : d);
  if (lit) { glow(g, x, GY - h * 0.25, w * 0.7, M.practical, 0.25 * lit); FX.pool(g, x, GY + 20, w * 0.7, 40, M.practical, 0.22 * lit); }
  seg(g, [[x, GY - h], [x, GY - h - 30]], 5, d);
}
export function camp(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = ground(), CX = E.W / 2, sand = mix(M.key, M.floor, 0.5);
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX + V(420, 260), GY - V(220, 330), V(60, 70), '#fff3dc', M.key, 4); if (o.stars) FX.stars(g, t, { count: 90, area: [-E.W * 0.2, 0, E.W * 1.4, GY * 0.45] }); });
  layer(g, cam, 0.3, (g) => { farDunes(g, GY, M, sand); for (const [x, s] of [[-620, 0.7], [760, 0.8]]) palm(g, CX + x, GY - V(120, 170), s, mix(M.dark, M.sky[1], 0.3), t, x); });
  layer(g, cam, 0.6, (g) => { for (const [x, w, h] of [[-560, 360, 260], [520, 420, 300], [1100, 360, 240], [-1100, 380, 250]]) tent(g, CX + x * V(1, 0.8), GY - V(60, 80), w, h, M, 1, 0.8, t); });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 500, [shade(sand, -0.25), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    if (o.fire !== false) { const fx = CX + (o.fireX ?? V(-40, 0)); for (let i = 0; i < 5; i++) seg(g, [[fx - 40 + i * 20, GY + 6], [fx - 10 + i * 5, GY - 16]], 7, '#2a1a10'); flame(g, fx, GY + 2, 0.55, t, 3); FX.pool(g, fx, GY + 20, 420, 60, M.practical, 0.35); }
  });
  return { GY, CX, M, sand };
}
