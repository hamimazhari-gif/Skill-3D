// sets/egypt.js — Pharaoh's palace hall (interiorWarm, torch-lit, big opening onto pyramids at dusk) and the city at night.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { flame } from '../lib/_costume.js';

export const ground = () => E.H * V(0.8, 0.68);

export function pyramids(g, GY, M, cols, k = 1) {
  const c1 = cols?.[0] || mix(M.sky[1], M.dark, 0.55), c2 = cols?.[1] || mix(M.sky[1], M.dark, 0.7);
  const CX = E.W / 2;
  for (const [x, w, h, c] of [[-520, 520, 330, c2], [-60, 760, 470, c1], [520, 440, 280, c2], [980, 380, 230, c2]]) {
    const bx = CX + x * k;
    poly(g, [[bx - w / 2, GY], [bx, GY - h], [bx + w / 2, GY]], c);
    poly(g, [[bx, GY - h], [bx + w / 2, GY], [bx + w * 0.1, GY]], alpha('#000', 0.22));
  }
}

function column(g, x, top, GY, w, M, wall) {
  const c = shade(wall, 0.08), d = shade(wall, -0.35);
  g.fillStyle = linGrad(g, x - w / 2, 0, x + w / 2, 0, [d, c, shade(c, 0.1), d]); g.fillRect(x - w / 2, top + 70, w, GY - top - 70);
  // lotus capital
  poly(g, [[x - w * 0.5, top + 72], [x + w * 0.5, top + 72], [x + w * 0.85, top], [x - w * 0.85, top]], shade(wall, -0.1));
  g.fillStyle = shade(wall, -0.45); g.fillRect(x - w * 0.95, top - 20, w * 1.9, 22);
  // painted bands (gold + blue)
  for (const yy of [top + 110, top + 140]) { g.fillStyle = alpha(S().ui.gold, 0.55); g.fillRect(x - w / 2, yy, w, 8); }
  g.fillStyle = alpha('#2c4f9e', 0.5); g.fillRect(x - w / 2, top + 122, w, 10);
  // carved glyph blocks
  const r = rng(Math.round(x));
  for (let i = 0; i < 6; i++) { g.fillStyle = alpha('#000', 0.18); g.fillRect(x - w * 0.25, top + 190 + i * 64, w * (0.2 + r() * 0.3), 30); }
  g.fillStyle = shade(wall, -0.5); g.fillRect(x - w * 0.62, GY - 30, w * 1.24, 30);
}

// palace(g, t, cam, { mood, throne: x | null, opening: true })
export function palace(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = ground(), CX = E.W / 2;
  const wall = shade(M.wall, -0.15), wallDark = shade(M.wall, -0.55);
  layer(g, cam, 0.15, (g) => {                       // back wall with a great opening onto the pyramids at dusk
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wallDark, shade(wall, -0.3)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    const ow = V(900, 640), oh = V(560, 900), ox = CX - ow / 2 + (o.openX || 0), oy = GY - oh - V(40, 60);
    g.save(); g.beginPath(); g.rect(ox, oy, ow, oh); g.clip();
    const D = mood('dusk'); backdrop(g, D.sky, [ox, oy, ow, oh + 60]);
    FX.sun(g, ox + ow * 0.62, oy + oh * 0.62, V(46, 52), '#fff3dc', D.key, 5);
    pyramids(g, oy + oh, D, null, V(0.75, 0.6));
    g.restore();
    g.fillStyle = shade(wallDark, -0.2); g.fillRect(ox - 40, oy - 50, ow + 80, 50);
    glow(g, ox + ow / 2, oy + oh * 0.6, ow * 0.8, M.practical, 0.18);
    FX.godRays(g, ox + ow * 0.62, oy + oh * 0.62, { count: 7, len: V(1300, 1500), spread: 0.9, angle: Math.PI / 2 + 0.25, color: M.practical, a: 0.06 });
  });
  layer(g, cam, 0.55, (g) => {                       // colonnade with torches
    const top = GY - V(760, 1080), w = V(110, 120);
    for (const i of [-5, -4, -3, -2, 2, 3, 4, 5]) {
      const x = CX + i * V(300, 260) + (i > 0 ? -V(140, 120) : V(140, 120));
      column(g, x, top, GY, w, M, wall);
      if (Math.abs(i) % 2 === 0) { const ty = GY - V(420, 560); seg(g, [[x + w / 2, ty + 30], [x + w / 2 + 34, ty]], 8, '#2a1a12'); flame(g, x + w / 2 + 36, ty - 2, 0.42, t, i); FX.lightCone(g, x + w / 2 + 36, ty, { angle: Math.PI / 2, spread: 0.9, len: 520, color: M.practical, a: 0.07 }); }
    }
  });
  layer(g, cam, 0.85, (g) => {                       // polished stone floor
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.floor, 0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 800, 'rgba(0,0,0,.25)', 0.07);
    g.fillStyle = alpha(S().ui.gold, 0.08); g.fillRect(-E.W, GY + 4, E.W * 3, 4);
    FX.pool(g, CX + (o.openX || 0), GY + 40, V(560, 420), 70, M.practical, 0.22);
    if (o.throne != null) throne(g, o.throne, GY, M, o.throneK || 1);
  });
  return { GY, CX, M };
}
export function throne(g, x, GY, M, k = 1) {
  // k = figure scale; a seated figure with that scale sits with feet at y = GY - 78 * k
  const gold = S().ui.gold, dk = shade(M.dark, -0.2);
  for (let i = 0; i < 3; i++) { g.fillStyle = shade(M.floor, -0.25 + i * 0.08); g.fillRect(x - (230 - i * 40) * k, GY - 26 * (i + 1) * k, (460 - i * 80) * k, 26 * k + 1); }
  const fy = GY - 78 * k, seat = fy - 66 * k;
  g.fillStyle = dk; g.fillRect(x - 70 * k, seat - 230 * k, 120 * k, 230 * k);
  g.fillStyle = alpha(gold, 0.75); g.fillRect(x - 70 * k, seat - 230 * k, 120 * k, 12 * k); g.fillRect(x - 70 * k, seat - 110 * k, 120 * k, 6 * k);
  g.fillStyle = shade(dk, 0.1); g.fillRect(x - 60 * k, seat, 130 * k, fy - seat);
  g.fillStyle = gold; g.fillRect(x - 64 * k, seat - 6 * k, 138 * k, 10 * k);
  glow(g, x, seat - 120 * k, 260 * k, gold, 0.12);
  return fy;
}

// Egyptian city at night: walls, obelisks, pyramids, torches
export function city(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); if (['night', 'pharaoh', 'sorcery'].includes(o.mood || 'night')) FX.stars(g, t, { count: 160, area: [-E.W * 0.2, 0, E.W * 1.4, GY * 0.7] }); if (['night', 'pharaoh', 'sorcery'].includes(o.mood || 'night')) FX.moon(g, CX + V(520, 280), GY - V(760, 1150), V(40, 46)); });
  if (!o.noEgypt) layer(g, cam, 0.3, (g) => pyramids(g, GY - V(140, 220), M, [shade(M.wall, -0.15), shade(M.wall, -0.3)], 1));
  else layer(g, cam, 0.3, (g) => { g.fillStyle = shade(M.wall, -0.3); g.beginPath(); g.moveTo(-E.W, GY - V(140, 220)); for (let x = -E.W; x <= E.W * 2; x += 40) g.lineTo(x, GY - V(200, 300) - Math.sin(x * 0.003 + 1) * 60); g.lineTo(E.W * 2, GY); g.lineTo(-E.W, GY); g.fill(); });
  layer(g, cam, 0.55, (g) => {
    const wall = shade(M.wall, -0.1), top = GY - V(380, 520);
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(wall, 0.05), shade(wall, -0.45)]); g.fillRect(-E.W, top, E.W * 3, GY - top);
    for (let x = -E.W; x < E.W * 2; x += 90) { g.fillStyle = shade(wall, -0.3); g.fillRect(x, top - 34, 50, 34); }       // crenellations
    // gate
    const gw = V(300, 280), gh = V(300, 380);
    g.fillStyle = shade(M.dark, -0.4); g.fillRect(CX - gw / 2 + (o.gateX || 0), GY - gh, gw, gh);
    glow(g, CX + (o.gateX || 0), GY - gh * 0.4, gw, M.practical, 0.2);
    if (!o.noEgypt) for (const sx of [-1, 1]) { const ox = CX + (o.gateX || 0) + sx * (gw / 2 + 120); poly(g, [[ox - 34, GY], [ox + 34, GY], [ox + 10, GY - V(620, 760)], [ox - 10, GY - V(620, 760)]], shade(wall, -0.2)); poly(g, [[ox - 10, GY - V(620, 760)], [ox + 10, GY - V(620, 760)], [ox, GY - V(660, 800)]], S().ui.gold); }
    for (const i of [-3, -1, 1, 3]) { const tx = CX + i * V(260, 210), ty = GY - V(250, 300); seg(g, [[tx, ty + 30], [tx, ty]], 8, '#1a1210'); flame(g, tx, ty, 0.35, t, i * 3); FX.pool(g, tx, GY + 20, 220, 30, M.practical, 0.2); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.road, -0.1), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 700, 'rgba(0,0,0,.3)', 0.08); });
  return { GY, CX, M };
}
