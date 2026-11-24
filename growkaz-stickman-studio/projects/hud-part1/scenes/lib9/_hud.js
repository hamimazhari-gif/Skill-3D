// lib9/_hud.js — shared sets/props for the Nabi Hud series.
import { E, V, layer, clamp, alpha, poly } from '/engine/core.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import { desert } from '../sets/desert.js';
import { person } from '../lib/_costume.js';
import { AD } from '../cast.js';
export const STONE = '#c8a070';
export const shadeC = (a, k) => { const p = parseInt(a.slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(clamp(((p >> s) & 255) * (1 + k), 0, 255))); return `rgb(${c.join(',')})`; };
const mix2 = (a, b) => { const pa = parseInt(a.slice(1), 16), pb = parseInt((b.startsWith('#') ? b : '#806060').slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * 0.55 + ((pb >> s) & 255) * 0.45)); return `rgb(${c.join(',')})`; };
export function column(g, x, y, h, w, c, k = 1) {
  const hh = h * k; g.fillStyle = c; g.fillRect(x - w / 2, y - hh, w, hh);
  g.fillStyle = alpha('#000', 0.18); for (let i = 1; i < 4; i++) g.fillRect(x - w / 2 + i * w / 4 - 2, y - hh + 30, 4, hh - 50);
  g.fillStyle = alpha('#000', 0.25); g.fillRect(x - w / 2, y - hh, w * 0.3, hh);
  if (k > 0.98) { g.fillStyle = c; g.fillRect(x - w * 0.8, y - hh - 30, w * 1.6, 34); g.fillRect(x - w * 0.65, y - hh - 54, w * 1.3, 26); }
  g.fillStyle = c; g.fillRect(x - w * 0.75, y - 26, w * 1.5, 26);
}
export function iram(g, t, cam, o = {}) {
  const r = desert(g, t, cam, { mood: o.mood || 'golden', sunX: o.sunX ?? V(260, 150) }), { GY, CX, M } = r;
  const c1 = o.stone || STONE;
  layer(g, cam, 0.35, (g) => { for (let i = 0; i < 4; i++) { const x = CX - V(700, 560) + i * V(470, 380), y = GY - V(150, 240), k = o.hillK ? o.hillK(i) : 1; if (k <= 0) continue; g.fillStyle = mix2(c1, M.sky[0]); g.fillRect(x - 70, y - 120 * k, 140, 120 * k); poly(g, [[x - 90, y - 120 * k], [x + 90, y - 120 * k], [x, y - 200 * k]], mix2(c1, M.sky[0])); } });
  layer(g, cam, 0.6, (g) => { const n = o.cols ?? 7; for (let i = 0; i < n; i++) { const x = CX - V(760, 600) + i * V(255, 200), h = V(760, 1050) * (0.8 + 0.25 * ((i * 37) % 5) / 4); column(g, x, GY + 30, h, V(70, 62), shadeC(c1, -0.12 - (i % 2) * 0.06), o.colK ? o.colK(i) : 1); } });
  return r;
}
export const adCrowd = (g, x0, dx, y, s, t, o = {}) => { for (let i = 0; i < (o.n || 4); i++) person(g, { x: x0 + i * dx, y: y + (i % 2) * 16, s, facing: o.facing ? o.facing(i) : 1, outfit: AD[(i + (o.off || 0)) % AD.length], pose: o.walk ? walkPose(t * 3 + i) : breathe(o.pose ? o.pose(i) : POSES.stand, t, 1.5, i), expr: o.expr ? o.expr(i) : 'neutral', talk: o.talk ? Math.max(0, 0.6 * Math.sin(t * 12 + i * 1.7)) : 0, dim: o.dim, rim: o.rim }); };
