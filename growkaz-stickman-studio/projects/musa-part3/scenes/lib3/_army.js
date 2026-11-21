// lib3/_army.js — Part 3 extras: Israelite crowd outfits, prostration pose, horse + chariot, small serpents.
import { E, V, S, seg, circle, ring, poly, glow, alpha, shade, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { person, GOLD } from '../lib/_costume.js';

const HOODS = ['#7a6a58', '#5a6a7a', '#8a7a5a', '#6a5a6a', '#5a7a6a', '#9a8a70'];
export const bani = (i) => ({ top: 'dress', color: shade(HOODS[i % HOODS.length], -0.35), head: 'hood', headColor: HOODS[(i * 3 + 1) % HOODS.length], kid: i % 5 === 3 });
export const SUJUD = { head: [56, -24], sh: [30, -52], hip: [0, -64], eF: [46, -30], hF: [62, -4], eB: [40, -32], hB: [56, -4], kF: [30, -6], fF: [-28, 0], kB: [24, -6], fB: [-34, 0] };
export const KNEEL_UP = { ...POSES.kneel, eF: [26, -150], hF: [34, -186], eB: [18, -150], hB: [26, -184] };

// a crowd of Israelites walking/standing; o: { x0, x1, y, s, n, t, walk, facing, rim, expr, seed, look }
export function crowdBani(g, o) {
  const r = rng(o.seed || 3), n = o.n || 8;
  const list = [];
  for (let i = 0; i < n; i++) list.push({ i, x: o.x0 + (o.x1 - o.x0) * (i + r() * 0.6) / n, dy: r() * (o.depth || 40), ph: r() * 6 });
  list.sort((a, b) => a.dy - b.dy);
  for (const p of list) {
    const pose = o.walk ? walkPoseLite(o.t * Math.PI * 2 * (o.run ? 1.5 : 0.8) + p.ph, o.run) : (o.pose || POSES.stand);
    person(g, { x: p.x, y: o.y + p.dy, s: (o.s || 1) * (1 - p.dy / 600), facing: o.facing ?? 1, outfit: bani(p.i + (o.seed || 0)), pose, expr: o.expr || 'neutral', look: o.look, rim: o.rim, blink: ((o.t + p.ph) % 3.3) > 3.2 });
  }
}
import { walkPose } from '/engine/rig2d.js';
const walkPoseLite = (ph, run) => walkPose(ph, { run });

// galloping horse (side view), facing f; feet on y
export function horse(g, x, y, s, f, t, rim) {
  const ink = S().ink, ph = t * 11;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  const legs = [[-60, 0], [-40, 1.2], [50, 2.4], [70, 3.6]];
  const draw = (c, dx = 0, dy = 0) => {
    for (const [lx, o] of legs) { const a = Math.sin(ph + o) * 0.6; seg(g, [[lx + dx, -110 + dy], [lx + Math.sin(a) * 30 + dx, -55 + dy], [lx + Math.sin(a + 0.6) * 46 + dx, -Math.max(0, Math.cos(ph + o)) * 16 + dy]], 12, c); }
    g.fillStyle = c; g.beginPath(); g.ellipse(dx, -130 + dy, 95, 42, 0, 0, Math.PI * 2); g.fill();
    seg(g, [[70 + dx, -150 + dy], [110 + dx, -215 + dy]], 34, c);
    g.beginPath(); g.ellipse(132 + dx, -222 + dy, 38, 20, 0.5, 0, Math.PI * 2); g.fill();
    seg(g, [[-90 + dx, -140 + dy], [-130 + dx, -110 + dy + Math.sin(ph) * 8]], 12, c);
  };
  if (rim) draw(rim, -4, -4);
  draw(ink);
  seg(g, [[78, -200], [100, -240], [84, -170]], 6, '#3a2418');                       // mane
  circle(g, 140, -230, 4, S().feature);
  g.restore();
}
// chariot with a rider (outfit) pulled by a horse; f = facing
export function chariot(g, x, y, s, f, t, rider, rim, riderExpr = 'angry', riderPose = POSES.point) {
  horse(g, x + f * 230 * s, y, s, f, t, rim);
  seg(g, [[x + f * 60 * s, y - 80 * s], [x + f * 150 * s, y - 110 * s]], 6 * s, '#3a2418');
  person(g, { x: x - f * 10 * s, y: y - 50 * s, s: s * 1.05, facing: f, outfit: rider, pose: riderPose, expr: riderExpr, rim: rim ? { color: rim, dir: [f, -0.5], w: 4 } : null, shadow: false });
  poly(g, [[x - 70 * s, y - 50 * s], [x + 70 * s, y - 50 * s], [x + 60 * s, y - 130 * s], [x - 60 * s, y - 110 * s]], shade(GOLD(), -0.25));
  g.fillStyle = alpha('#000', 0.25); g.fillRect(x - 70 * s, y - 70 * s, 140 * s, 20 * s);
  const wr = 52 * s, wx = x, wy = y - wr; ring(g, wx, wy, wr, 8 * s, GOLD()); circle(g, wx, wy, 9 * s, GOLD());
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + t * 9 * f; seg(g, [[wx, wy], [wx + Math.cos(a) * wr, wy + Math.sin(a) * wr]], 4 * s, GOLD()); }
}
// small wriggling magic serpent (ropes/sticks under sorcery)
export function smallSnake(g, x, y, s, t, f = 1, seed = 0, color = '#7a3ab0') {
  const n = 12, pts = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1); pts.push([x - f * u * 150 * s, y + Math.sin(u * 8 - t * 10 + seed) * 12 * s]); }
  for (let i = n - 1; i > 0; i--) seg(g, [pts[i], pts[i - 1]], (16 - i) * s, i % 2 ? color : shade(color, 0.25));
  circle(g, pts[0][0] + f * 6 * s, pts[0][1] - 2 * s, 12 * s, shade(color, -0.2));
  circle(g, pts[0][0] + f * 10 * s, pts[0][1] - 6 * s, 3 * s, '#ffe040');
}

// giant rearing cobra
export function cobra(g, x, y, s, f = -1) {
  const dark = '#0e2a12', mid = '#1f5a24', belly = '#c8d070', glowC = '#7dff6a';
  glow(g, x + f * 100 * s, y - 420 * s, 700 * s, glowC, 0.25);
  // coils
  for (let i = 0; i < 3; i++) { g.strokeStyle = i % 2 ? mid : dark; g.lineWidth = 80 * s; g.beginPath(); g.ellipse(x, y - i * 55 * s, (230 - i * 40) * s, (60 - i * 8) * s, 0, 0, Math.PI * 2); g.stroke(); }
  // neck: cubic from coil to head
  const P = (u) => { const p0 = [x, y - 150 * s], p1 = [x - f * 160 * s, y - 330 * s], p2 = [x + f * 220 * s, y - 520 * s], p3 = [x + f * 120 * s, y - 700 * s]; const a = 1 - u; return [a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]; };
  const n = 40;
  for (let i = 0; i < n; i++) { const a = P(i / n), b = P((i + 1) / n); seg(g, [a, b], (95 - i * 0.8) * s + 10, '#c0ff9a'); }
  for (let i = 0; i < n; i++) { const a = P(i / n), b = P((i + 1) / n); seg(g, [a, b], (95 - i * 0.8) * s, i % 6 < 3 ? mid : dark); }
  for (let i = 4; i < n; i += 2) { const a = P(i / n); seg(g, [[a[0] + f * 22 * s, a[1]], [a[0] + f * 40 * s, a[1] + 4 * s]], 10 * s, alpha(belly, 0.7)); }
  const [hx, hy] = P(1);
  // hood
  g.fillStyle = '#c0ff9a'; g.beginPath(); g.ellipse(hx, hy + 40 * s, 175 * s, 215 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = dark; g.beginPath(); g.ellipse(hx, hy + 40 * s, 168 * s, 208 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = mid; g.beginPath(); g.ellipse(hx, hy + 60 * s, 110 * s, 160 * s, 0, 0, Math.PI * 2); g.fill();
  for (const sx of [-1, 1]) { ring2(g, hx + sx * 70 * s, hy + 20 * s, 26 * s, 8 * s, belly); }
  // head with open jaws
  g.fillStyle = dark; g.beginPath(); g.ellipse(hx + f * 20 * s, hy - 30 * s, 100 * s, 70 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a0608'; g.beginPath(); g.moveTo(hx + f * 40 * s, hy - 20 * s); g.lineTo(hx + f * 190 * s, hy - 70 * s); g.lineTo(hx + f * 180 * s, hy + 50 * s); g.closePath(); g.fill();
  for (const [dy, d] of [[-55, 1], [40, -1]]) poly(g, [[hx + f * 150 * s, hy + dy * s], [hx + f * 165 * s, hy + dy * s], [hx + f * 156 * s, hy + (dy + d * 50) * s]], '#ffffff');
  seg(g, [[hx + f * 120 * s, hy - 10 * s], [hx + f * 240 * s, hy + 10 * s], [hx + f * 270 * s, hy - 12 * s]], 8 * s, '#ff3a3a'); seg(g, [[hx + f * 240 * s, hy + 10 * s], [hx + f * 270 * s, hy + 30 * s]], 8 * s, '#ff3a3a');
  for (const ex of [-20, 40]) { glow(g, hx + f * ex * s, hy - 62 * s, 70 * s, '#ffe040', 0.9); circle(g, hx + f * ex * s, hy - 62 * s, 18 * s, '#ffe040'); circle(g, hx + f * ex * s, hy - 62 * s, 6 * s, '#000'); }
}
function ring2(g, x, y, r, w, c) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); }

