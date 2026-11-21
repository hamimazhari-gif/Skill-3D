// sets/sea.js — the Red Sea: shoreline (dawn / night / golden), the parting (walls of water) and the corridor between them.
import { E, V, S, mood, layer, backdrop, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, lerp, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const ground = () => E.H * V(0.8, 0.72);
const WATER = { deep: '#08204a', mid: '#12408a', light: '#3a8ad0', foam: '#e8f6ff' };

// horizon & waves
function seaBand(g, t, hy, GY, M, calm = 0) {
  g.fillStyle = linGrad(g, 0, hy, 0, GY, [mix(WATER.mid, M.sky[M.sky.length - 1], 0.45), WATER.mid, WATER.deep]); g.fillRect(-E.W, hy, E.W * 3, GY - hy + 2);
  const r = rng(7);
  for (let i = 0; i < 70; i++) { const u = r(), y = lerp(hy + 6, GY - 10, u * u), w = lerp(20, 140, u * u), x = ((r() * E.W * 1.6 + t * (20 + 40 * u) * (r() > 0.5 ? 1 : -1)) % (E.W * 1.6)) - E.W * 0.3; seg(g, [[x, y], [x + w, y]], lerp(1, 4, u), alpha(WATER.foam, (0.12 + 0.2 * u) * (1 - calm * 0.6))); }
  // sun glint path
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, hy, 0, GY, [alpha(M.key, 0.35), alpha(M.key, 0)]); g.beginPath(); g.moveTo(E.W / 2 - 30, hy); g.lineTo(E.W / 2 + 30, hy); g.lineTo(E.W / 2 + 260, GY); g.lineTo(E.W / 2 - 260, GY); g.closePath(); g.fill(); g.restore();
}
// one perspective water wall (side = -1 left, 1 right). k = how far it has risen (0..1)
function wall(g, t, side, hy, GY, gapNear, gapFar, hNear, hFar, k, collapse = 0) {
  const CX = E.W / 2, xn = CX + side * gapNear, xf = CX + side * gapFar;
  const tn = GY - hNear * k * (1 - collapse * 0.7), tf = hy - hFar * k * (1 - collapse * 0.7);
  const lean = collapse * side * -gapNear * 0.9;                                          // tops curl inward when collapsing
  const out = side * E.W * 1.5;
  // body
  g.fillStyle = linGrad(g, 0, Math.min(tn, tf), 0, GY, [WATER.light, WATER.mid, WATER.deep]);
  g.beginPath(); g.moveTo(xn, GY + 40); g.lineTo(xf, hy); g.lineTo(xf + lean * 0.3, tf); g.lineTo(xn + lean, tn); g.lineTo(CX + out, tn - 200); g.lineTo(CX + out, GY + 40); g.closePath(); g.fill();
  // inner face highlight & ripples
  g.save(); g.beginPath(); g.moveTo(xn, GY + 40); g.lineTo(xf, hy); g.lineTo(xf + lean * 0.3, tf); g.lineTo(xn + lean, tn); g.closePath(); g.clip();
  g.fillStyle = linGrad(g, xn, 0, xf, 0, [alpha('#7ac0ff', 0.55), alpha('#2a6ab0', 0.25)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (let i = 0; i < 18; i++) { const u = i / 18, y = lerp(tn, GY, u) + Math.sin(t * 3 + i) * 6; seg(g, [[xn - side * 400, y], [xn + side * 40, y + Math.sin(t * 2 + i) * 10]], 3, alpha(WATER.foam, 0.12)); }
  for (let i = 0; i < 14; i++) { const fx = lerp(xn, xf, (i + 0.5) / 14), fy = lerp(tn, tf, (i + 0.5) / 14) + ((t * 120 + i * 47) % 300); circle(g, fx, fy, 4, alpha(WATER.foam, 0.35)); }
  g.restore();
  // foam crest
  const crest = []; for (let i = 0; i <= 24; i++) { const u = i / 24; crest.push([lerp(xn + lean, xf + lean * 0.3, u) + side * Math.sin(u * 20 + t * 4) * 6, lerp(tn, tf, u) + Math.sin(u * 30 + t * 6) * 5]); }
  seg(g, crest, lerp(26, 6, 0.3), alpha(WATER.foam, 0.85));
  seg(g, [[xn + lean, tn], [CX + out, tn - 200]], 18, alpha(WATER.foam, 0.6));
  for (let i = 0; i < 10; i++) circle(g, lerp(xn + lean, xf, i / 10) + Math.sin(t * 5 + i) * 10, lerp(tn, tf, i / 10) - 10 - Math.abs(Math.sin(t * 7 + i)) * 20, 6 + (i % 3) * 3, alpha(WATER.foam, 0.6));
}
// shore(g, t, cam, { mood, split: 0..1, collapse: 0..1, calm })
export function shore(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dawn'), GY = ground(), CX = E.W / 2, hy = GY - V(260, 420), split = o.split || 0;
  layer(g, cam, 0.1, (g) => {
    backdrop(g, M.sky);
    if (o.mood === 'night') { FX.stars(g, t, { count: 200, area: [-E.W * 0.2, 0, E.W * 1.4, hy] }); FX.moon(g, CX + V(380, 250), hy - V(380, 600), V(40, 46)); }
    else { FX.sun(g, CX + (o.sunX ?? 0), hy - V(40, 60), V(70, 80), '#fff3dc', M.key, 5); }
    // far cliffs
    g.fillStyle = shade(M.wall, -0.2); g.beginPath(); g.moveTo(-E.W, hy); for (let x = -E.W; x <= E.W * 2; x += 60) g.lineTo(x, hy - 30 - Math.abs(Math.sin(x * 0.004)) * V(60, 90) * (Math.abs(x - CX) > 300 ? 1 : 0.2)); g.lineTo(E.W * 2, hy); g.fill();
  });
  layer(g, cam, 0.4, (g) => {
    seaBand(g, t, hy, GY, M, o.calm || 0);
    if (split > 0) {
      // the dry path between the walls
      const gapN = V(260, 220) * split, gapF = 14 * split;
      poly(g, [[CX - gapN, GY + 40], [CX - gapF, hy], [CX + gapF, hy], [CX + gapN, GY + 40]], linGrad(g, 0, hy, 0, GY, ['#6a5a48', '#4a3a2a']));
      glow(g, CX, hy, 260 * split, '#fff0c0', 0.5 * split);
      for (const side of [-1, 1]) wall(g, t, side, hy, GY, gapN, gapF, V(900, 1100), V(160, 220), split, o.collapse || 0);
    }
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [mix(M.key, M.floor, 0.6), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    // wet edge + foam line
    const fy = GY + 6 + Math.sin(t * 1.5) * 6; g.fillStyle = alpha('#203a5a', 0.4); g.fillRect(-E.W, GY, E.W * 3, 22); seg(g, [[-E.W, fy], [E.W * 2, fy + 4]], 5, alpha(WATER.foam, 0.6));
    const r = rng(9); for (let i = 0; i < 10; i++) { const x = -E.W * 0.3 + r() * E.W * 1.6, y = GY + 40 + r() * 260; g.fillStyle = shade(M.dark, -0.1); g.beginPath(); g.ellipse(x, y, 20 + r() * 40, 8 + r() * 10, 0, Math.PI, Math.PI * 2); g.fill(); }
  });
  return { GY, CX, M, hy };
}
// corridor(g, t, cam, { k: wall height 0..1, collapse: 0..1, mood }) — inside the parted sea, looking down the path
export function corridor(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dawn'), GY = ground(), CX = E.W / 2, hy = E.H * V(0.42, 0.42), col = o.collapse || 0;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.sun(g, CX, hy - 30, V(60, 70), '#fff3dc', M.key, 5); });
  layer(g, cam, 0.6, (g) => {
    poly(g, [[CX - V(900, 700), E.H * 1.4], [CX - 30, hy], [CX + 30, hy], [CX + V(900, 700), E.H * 1.4]], linGrad(g, 0, hy, 0, E.H, ['#8a7a5c', '#5a4a36', '#3a2e22']));
    // sea-bed details: ripples of sand, shells, puddles
    const r = rng(4); for (let i = 0; i < 40; i++) { const u = r(), y = lerp(hy + 10, E.H * 1.2, u * u), w = lerp(10, 140, u * u), x = CX + (r() - 0.5) * lerp(40, V(1400, 1100), u * u); seg(g, [[x - w / 2, y], [x + w / 2, y]], lerp(1, 5, u), alpha('#000', 0.15)); }
    for (let i = 0; i < 8; i++) { const u = 0.3 + r() * 0.7, y = lerp(hy, E.H, u * u), x = CX + (r() - 0.5) * lerp(40, 900, u * u); g.fillStyle = alpha('#7ab0e0', 0.25); g.beginPath(); g.ellipse(x, y, 40 * u * u + 6, 8 * u * u + 2, 0, 0, Math.PI * 2); g.fill(); }
    glow(g, CX, hy, V(400, 360), '#fff0c0', 0.5);
    for (const side of [-1, 1]) wall(g, t, side, hy, E.H * 1.4, V(900, 700) * (1 - col * 0.9), 30 * (1 - col), E.H * 1.6 * (o.k ?? 1), V(500, 700) * (o.k ?? 1), 1, col);
  });
  return { GY, CX, M, hy };
}
// big crashing wave fill (for the sea closing), p 0..1
export function crash(g, t, p) {
  for (const side of [-1, 1]) {
    const x0 = E.W / 2 + side * E.W * lerp(0.9, -0.1, p);
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [WATER.light, WATER.mid, WATER.deep]);
    g.beginPath(); g.moveTo(E.W / 2 + side * E.W, -E.H); g.lineTo(x0, -E.H);
    for (let i = 0; i <= 20; i++) { const u = i / 20; g.lineTo(x0 + side * Math.sin(u * 9 + t * 8) * 40 - side * Math.sin(u * Math.PI) * 120 * p, -E.H + u * E.H * 3); }
    g.lineTo(E.W / 2 + side * E.W, E.H * 2); g.closePath(); g.fill();
    for (let i = 0; i < 30; i++) circle(g, x0 + side * (Math.sin(i * 3) * 30), (i / 30) * E.H + Math.sin(t * 6 + i) * 20, 10 + (i % 4) * 6, alpha(WATER.foam, 0.7));
  }
}
export function waterSurface(g, t, y, a = 1) {
  g.fillStyle = linGrad(g, 0, y, 0, E.H, [alpha(WATER.light, 0.95 * a), alpha(WATER.deep, a)]);
  g.beginPath(); g.moveTo(-E.W, E.H * 2); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, y + Math.sin(x * 0.012 + t * 3) * 14 + Math.sin(x * 0.03 - t * 5) * 6); g.lineTo(E.W * 2, E.H * 2); g.closePath(); g.fill();
  for (let i = 0; i < 20; i++) { const x = ((i * 137 + t * 60) % (E.W + 200)) - 100; seg(g, [[x, y + 20 + (i % 5) * 30], [x + 60, y + 22 + (i % 5) * 30]], 3, alpha(WATER.foam, 0.35 * a)); }
}
