// sets/tur.js — Mount Thur at night: starry sky, the mountain, a fire on its slope; the holy valley (Tuwa) close up.
import { E, V, S, mood, layer, backdrop, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { flame } from '../lib/_costume.js';

export const ground = () => E.H * V(0.8, 0.68);
function mountain(g, cx, base, w, h, c, seed) {
  const r = rng(seed); g.fillStyle = c; g.beginPath(); g.moveTo(cx - w, base);
  const n = 14; for (let i = 0; i <= n; i++) { const u = i / n, x = cx - w + u * 2 * w, peak = 1 - Math.abs(u - 0.5) * 2; g.lineTo(x, base - h * Math.pow(peak, 0.8) - (r() - 0.5) * h * 0.12 * peak); }
  g.lineTo(cx + w, base); g.closePath(); g.fill();
}
// tur(g, t, cam, { fire: 0..1 (fire glow strength), fireAt: [x,y] relative to CX/GY, holy: 0..1 (divine light) })
export function tur(g, t, cam, o = {}) {
  const M = mood('night'), GY = ground(), CX = E.W / 2, fire = o.fire ?? 1;
  const fx = CX + (o.fireAt?.[0] ?? V(120, 60)), fy = GY + (o.fireAt?.[1] ?? -V(330, 520));
  layer(g, cam, 0.05, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 260, area: [-E.W * 0.4, -E.H * 0.2, E.W * 1.8, GY], seed: 9 }); });
  layer(g, cam, 0.25, (g) => {
    mountain(g, CX + V(80, 40), GY - V(40, 60), V(900, 760), V(640, 1000), shade(M.wall, -0.35), 3);
    if (fire > 0) { glow(g, fx, fy, V(260, 300), M.practical, 0.35 * fire); flame(g, fx, fy, 0.22, t, 1); }
    FX.fog(g, GY - V(260, 400), 220, M.fog, 0.18);
  });
  layer(g, cam, 0.55, (g) => { mountain(g, CX - V(900, 600), GY, V(700, 500), V(260, 380), shade(M.wall, -0.5), 7); mountain(g, CX + V(980, 700), GY, V(700, 500), V(300, 420), shade(M.wall, -0.55), 11); });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 500, [shade(M.floor, 0.05), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2);
    const r = rng(4); for (let i = 0; i < 12; i++) { const x = -E.W * 0.3 + r() * E.W * 1.6, y = GY + r() * 300; g.fillStyle = shade(M.dark, -0.3); g.beginPath(); g.ellipse(x, y, 30 + r() * 60, 14 + r() * 14, 0, Math.PI, Math.PI * 2); g.fill(); }
    if (fire > 0) FX.pool(g, fx, GY + 40, 500, 60, M.practical, 0.12 * fire);
  });
  if (o.holy) holyLight(g, t, o.holyAt || [CX, GY - V(200, 300)], o.holy);
  return { GY, CX, M, fx, fy };
}
// the burning tree in the valley (fire that does not consume)
export function burningTree(g, x, GY, s, t, M) {
  seg(g, [[x, GY], [x + 6 * s, GY - 160 * s]], 18 * s, '#1a1210');
  for (const [dx, dy, a] of [[-50, -150, -0.8], [60, -170, 0.7], [-20, -220, -0.2], [30, -210, 0.3]]) seg(g, [[x + 6 * s, GY - 140 * s], [x + dx * s, GY + dy * s]], 9 * s, '#1a1210');
  glow(g, x, GY - 200 * s, 460 * s, M.practical, 0.5);
  for (const [dx, dy, k, sd] of [[-50, -150, 0.45, 1], [60, -170, 0.5, 2], [-20, -222, 0.55, 3], [30, -212, 0.5, 4], [5, -160, 0.6, 5]]) flame(g, x + dx * s, GY + dy * s + 20 * s, k * s, t, sd, '#fffbe8', '#ffb43a');
}
// divine light: pillar of soft light + rings (Allah is never depicted)
export function holyLight(g, t, at, k = 1) {
  const [x, y] = at;
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = linGrad(g, x - 220, 0, x + 220, 0, [alpha('#fff4d0', 0), alpha('#fff4d0', 0.16 * k), alpha('#fff4d0', 0)]); g.fillRect(x - 220, -E.H, 440, y + E.H + 200);
  g.restore();
  FX.godRays(g, x, -E.H * 0.2, { count: 11, angle: Math.PI / 2, spread: 0.5, len: E.H * 1.6, color: '#fff0c0', a: 0.08 * k, t });
  glow(g, x, y, V(520, 560), '#fff0c0', 0.3 * k);
  FX.rings(g, x, y, t, { count: 3, r0: 80, r1: V(620, 560), speed: 0.35, color: '#fff3d6', a: 0.35 * k, w: 3 });
  FX.dust(g, t, { count: 50, color: '#fff3d6', a: 0.6 * k, area: [x - 400, y - 800, 800, 1400], speed: -20 });
}
