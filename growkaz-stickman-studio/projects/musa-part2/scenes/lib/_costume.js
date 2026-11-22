// lib/_costume.js — ancient-Egypt costume pieces drawn on top of the engine rig + a few story props.
// person(g, o) = drawFigure(o) + accessories from o.outfit.acc and o.staff. bigPerson(...) = bigFace + headgear.
import { E, S, V, seg, circle, ring, poly, rr, glow, alpha, shade, mix, lerp, linGrad, radGrad, clamp } from '/engine/core.js';
import { drawFigure, bigFace, headPos, POSES } from '/engine/rig2d.js';

export const GOLD = () => S().ui.gold;
export const NEMES_BLUE = '#2c4f9e';
export const WOOD = '#5a3e26';

// world position of a rig point (no rot support needed for our uses)
export function pt(o, name) {
  const p = o.pose || POSES.stand, s = (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1), f = o.facing ?? 1;
  return [o.x + p[name][0] * f * s, o.y + p[name][1] * s];
}
const scaleOf = (o) => (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1);

// draw fn twice: once offset in the rim colour, once normal
function rimmed(g, rim, w, fn) {
  if (rim) { g.save(); g.translate(rim.dir[0] * w, rim.dir[1] * w); fn(rim.color); g.restore(); }
  fn(null);
}

// ---- nemes headdress (side / 3-4 view) ----
export function nemes(g, hx, hy, r, f, rim, o = {}) {
  const gold = o.gold || GOLD(), blue = o.blue || NEMES_BLUE;
  rimmed(g, rim, r * 0.12, (rc) => {
    const shape = () => {
      g.beginPath();
      g.moveTo(hx + f * r * 0.62, hy - r * 0.55);                 // forehead band front
      g.quadraticCurveTo(hx + f * r * 0.2, hy - r * 1.55, hx - f * r * 0.75, hy - r * 1.05);
      g.lineTo(hx - f * r * 1.35, hy + r * 1.9);                  // back flap to shoulder
      g.lineTo(hx - f * r * 0.5, hy + r * 1.9);
      g.lineTo(hx - f * r * 0.35, hy - r * 0.1);
      g.quadraticCurveTo(hx + f * r * 0.1, hy - r * 0.55, hx + f * r * 0.62, hy - r * 0.55);
      g.closePath();
    };
    if (rc) { shape(); g.fillStyle = rc; g.fill(); return; }
    g.save(); shape(); g.fillStyle = gold; g.fill(); g.clip();
    for (let i = -4; i < 12; i++) { g.fillStyle = blue; g.fillRect(hx - r * 2, hy - r * 1.6 + i * r * 0.34, r * 4, r * 0.15); }
    g.restore();
    seg(g, [[hx + f * r * 0.64, hy - r * 0.56], [hx - f * r * 0.3, hy - r * 0.2]], r * 0.14, shade(gold, -0.15));
    // uraeus (cobra) on the brow
    seg(g, [[hx + f * r * 0.58, hy - r * 0.6], [hx + f * r * 0.72, hy - r * 0.95], [hx + f * r * 0.6, hy - r * 1.12]], r * 0.12, gold);
    circle(g, hx + f * r * 0.62, hy - r * 1.14, r * 0.1, gold);
  });
}
// front view nemes for bigFace (centre cx, cy, head radius r)
export function nemesFront(g, cx, cy, r, rimColor, side = -1, stripe = NEMES_BLUE) {
  const gold = GOLD(), blue = stripe;
  const shape = (grow = 0) => {
    g.beginPath();
    g.moveTo(-r * 0.95 - grow, -r * 0.35);
    g.quadraticCurveTo(0, -r * 1.75 - grow * 1.5, r * 0.95 + grow, -r * 0.35);
    g.lineTo(r * 1.45 + grow, r * 1.25); g.lineTo(r * 0.95, r * 1.25); g.lineTo(r * 0.82, -r * 0.15);
    g.quadraticCurveTo(0, -r * 0.62, -r * 0.82, -r * 0.15);
    g.lineTo(-r * 0.95, r * 1.25); g.lineTo(-r * 1.45 - grow, r * 1.25); g.closePath();
  };
  g.save(); g.translate(cx, cy);
  g.save(); g.translate(side * r * 0.06, -r * 0.03); shape(r * 0.04); g.fillStyle = rimColor; g.fill(); g.restore();
  g.save(); shape(); g.fillStyle = gold; g.fill(); g.clip();
  for (let i = -6; i < 14; i++) { g.fillStyle = blue; g.fillRect(-r * 2, -r * 1.8 + i * r * 0.26, r * 4, r * 0.12); }
  g.restore();
  seg(g, [[-r * 0.82, -r * 0.2], [0, -r * 0.6], [r * 0.82, -r * 0.2]], r * 0.07, shade(gold, -0.2));
  seg(g, [[0, -r * 0.62], [0, -r * 0.95], [r * 0.08, -r * 1.08]], r * 0.08, gold); circle(g, r * 0.08, -r * 1.1, r * 0.07, gold);
  g.restore();
}
// broad gold collar at the shoulders (side view)
function collar(g, o, rim) {
  const [sx, sy] = pt(o, 'sh'), s = scaleOf(o);
  rimmed(g, rim, 3 * s, (rc) => {
    g.fillStyle = rc || GOLD(); g.beginPath(); g.ellipse(sx, sy + 4 * s, 19 * s, 11 * s, 0, 0, Math.PI); g.fill();
    if (!rc) { g.strokeStyle = NEMES_BLUE; g.lineWidth = 2.4 * s; g.beginPath(); g.ellipse(sx, sy + 4 * s, 14 * s, 7 * s, 0, 0.2, Math.PI - 0.2); g.stroke(); }
  });
}
// magician's tall hat
function hat(g, hx, hy, r, f, rim) {
  rimmed(g, rim, r * 0.12, (rc) => {
    poly(g, [[hx - r * 0.95, hy - r * 0.55], [hx + r * 0.95, hy - r * 0.55], [hx - f * r * 0.35, hy - r * 3.1]], rc || '#2a1638');
    if (!rc) { seg(g, [[hx - r * 0.95, hy - r * 0.6], [hx + r * 0.95, hy - r * 0.6]], r * 0.16, '#b06ad8'); circle(g, hx - f * r * 0.35, hy - r * 3.1, r * 0.12, '#d8a0ff'); }
  });
}
// guard: striped plain head cloth + spear
function guardcloth(g, hx, hy, r, f, rim) { nemes(g, hx, hy, r, f, rim, { gold: '#cfc2a0', blue: '#3a3028' }); }

// ---- staff (tongkat) ----
export function staff(g, x0, y0, x1, y1, w, rim, glowC) {
  if (glowC) glow(g, (x0 + x1) / 2, (y0 + y1) / 2, Math.hypot(x1 - x0, y1 - y0) * 0.7, glowC, 0.35);
  rimmed(g, rim, w * 0.35, (rc) => {
    seg(g, [[x0, y0], [x1, y1]], w, rc || WOOD);
    const a = Math.atan2(y1 - y0, x1 - x0), cx = x1 + Math.cos(a) * w * 0.2, cy = y1 + Math.sin(a) * w * 0.2;
    g.strokeStyle = rc || WOOD; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.arc(cx + Math.cos(a + Math.PI / 2) * w * 1.4, cy + Math.sin(a + Math.PI / 2) * w * 1.4, w * 1.4, a - Math.PI / 2, a + Math.PI * 0.75, false); g.stroke();
  });
}
// staff held upright in the near hand
function heldStaff(g, o, rim) {
  const [hx, hy] = pt(o, o.staffHand === 'B' ? 'hB' : 'hF'), s = scaleOf(o);
  staff(g, hx + 2 * s * (o.facing ?? 1), o.y - 2, hx + 2 * s * (o.facing ?? 1), hy - 95 * s, 7 * s, rim, o.staffGlow);
}

// ---- main wrappers ----
export function person(g, o) {
  const of = o.outfit || {}, acc = of.acc || [], rim = o.rim ? { dir: [-0.8, -0.5], ...o.rim } : null;
  if (o.staff && o.staffBehind) heldStaff(g, o, rim);
  drawFigure(g, o);
  const [hx, hy, r] = headPos(o), f = o.facing ?? 1;
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (acc.includes('collar')) collar(g, o, rim);
  if (acc.includes('nemes')) nemes(g, hx, hy, r, f, rim);
  if (acc.includes('nemesRed')) nemes(g, hx, hy, r, f, rim, { blue: '#a8321e' });
  if (acc.includes('guardcloth')) guardcloth(g, hx, hy, r, f, rim);
  if (acc.includes('hat')) hat(g, hx, hy, r, f, rim);
  if (o.staff && !o.staffBehind) heldStaff(g, o, rim);
  if (o.spear) { const [px, py] = pt(o, 'hF'), s = scaleOf(o); rimmed(g, rim, 3 * s, (rc) => { seg(g, [[px, o.y], [px, py - 150 * s]], 5 * s, rc || '#3a2a1c'); poly(g, [[px - 8 * s, py - 150 * s], [px + 8 * s, py - 150 * s], [px, py - 185 * s]], rc || '#c8c0b0'); }); }
  g.restore();
}
export function bigPerson(g, cx, cy, r, o = {}) {
  const of = o.outfit || {}, acc = of.acc || [];
  if (acc.includes('nemes') || acc.includes('nemesRed')) {
    // shoulders + collar first, then the head and the nemes
    bigFace(g, cx, cy, r, { ...o, outfit: { ...of, head: 'none' } });
    g.save(); g.translate(cx, cy); g.fillStyle = GOLD(); g.beginPath(); g.ellipse(0, r * 1.25, r * 1.05, r * 0.38, 0, 0, Math.PI); g.fill();
    g.strokeStyle = NEMES_BLUE; g.lineWidth = r * 0.06; g.beginPath(); g.ellipse(0, r * 1.25, r * 0.8, r * 0.22, 0, 0.2, Math.PI - 0.2); g.stroke(); g.restore();
    nemesFront(g, cx, cy, r, o.rimColor || '#ffc68a', o.rimSide ?? -1, acc.includes('nemesRed') ? '#a8321e' : NEMES_BLUE);
    return;
  }
  bigFace(g, cx, cy, r, o);
  if (acc.includes('hat')) { g.save(); g.translate(cx, cy); poly(g, [[-r * 1.05, -r * 0.5], [r * 1.05, -r * 0.5], [r * 0.1, -r * 2.6]], '#2a1638'); seg(g, [[-r, -r * 0.55], [r, -r * 0.55]], r * 0.12, '#b06ad8'); g.restore(); }
}

// ---- animals & story props ----
export function sheep(g, x, y, s = 1, f = 1, t = 0, seed = 0, rimC = null, wool = '#e6dccb') {
  const bob = Math.sin(t * 3 + seed) * 2 * s;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  for (const lx of [-22, -10, 12, 24]) seg(g, [[lx, -30], [lx + Math.sin(t * 4 + seed + lx) * 1.5, 0]], 6, '#1a1412');
  const body = (c, dx = 0, dy = 0) => { for (const [bx, by, br] of [[-22, -44, 20], [-4, -50, 23], [16, -46, 21], [2, -36, 20], [-14, -34, 17]]) circle(g, bx + dx, by + dy + bob, br, c); };
  if (rimC) body(rimC, -3, -3);
  body(wool); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, -30 + bob, 34, 9, 0, 0, Math.PI * 2); g.fill();
  const hb = Math.sin(t * 1.3 + seed) * 4;
  g.fillStyle = '#1a1412'; g.beginPath(); g.ellipse(40, -50 + hb + bob, 12, 9, 0.5, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(33, -56 + hb + bob, 7, 4, -0.6, 0, Math.PI * 2); g.fill();
  g.restore();
}
export function palm(g, x, y, s = 1, color = '#1a1220', t = 0, seed = 0) {
  const sway = Math.sin(t * 0.8 + seed) * 4 * s;
  g.strokeStyle = color; g.lineWidth = 14 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 30 * s, y - 160 * s, x + 14 * s + sway, y - 300 * s); g.stroke();
  const tx = x + 14 * s + sway, ty = y - 300 * s;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.55, L = (120 + (i % 2) * 30) * s;
    g.fillStyle = color; g.beginPath(); g.moveTo(tx, ty);
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.45 + L * 0.45;
    g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - 30 * s, ex, ey);
    g.quadraticCurveTo(tx + Math.cos(a) * L * 0.5, ty + Math.sin(a) * L * 0.5 - 6 * s, tx, ty + 8 * s); g.fill();
  }
}
// flame (deterministic flicker)
export function flame(g, x, y, s = 1, t = 0, seed = 0, core = '#fff3c4', outer = '#ff8a2a') {
  glow(g, x, y - 30 * s, 160 * s, outer, 0.45);
  for (const [c, k] of [[outer, 1], ['#ffc04a', 0.7], [core, 0.4]]) {
    const h = (90 + Math.sin(t * 13 + seed) * 12 + Math.sin(t * 21 + seed * 2) * 6) * s * k, w = 34 * s * k;
    const lean = Math.sin(t * 7 + seed) * 8 * s;
    g.fillStyle = c; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w * 1.1, y - h * 0.45, x + lean, y - h); g.quadraticCurveTo(x + w * 1.1, y - h * 0.45, x + w, y); g.closePath(); g.fill();
  }
}
// sinuous serpent; head at (x, y), body trails along -dir with time-based wave
export function serpent(g, x, y, s, t, f = 1, rimC = null) {
  const n = 26, pts = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1); pts.push([x - f * u * 520 * s, y + Math.sin(u * 7 - t * 9) * 46 * s * (0.3 + u) - u * 10 * s]); }
  const body = (c, w, dx = 0, dy = 0) => { for (let i = n - 1; i > 0; i--) { const u = i / (n - 1); seg(g, [[pts[i][0] + dx, pts[i][1] + dy], [pts[i - 1][0] + dx, pts[i - 1][1] + dy]], w * (1 - u * 0.75), c); } };
  if (rimC) body(rimC, 66 * s, -5, -5);
  body('#1d2a18', 60 * s);
  g.save(); g.globalAlpha *= 0.5; body('#3e5a2a', 22 * s, 0, -12 * s); g.restore();
  const [hx, hy] = pts[0];
  g.fillStyle = '#1d2a18'; g.beginPath(); g.ellipse(hx + f * 22 * s, hy - 6 * s, 52 * s, 34 * s, f * -0.15, 0, Math.PI * 2); g.fill();
  if (rimC) { g.strokeStyle = rimC; g.lineWidth = 4; g.beginPath(); g.ellipse(hx + f * 22 * s, hy - 6 * s, 52 * s, 34 * s, f * -0.15, Math.PI * 1.1, Math.PI * 1.8); g.stroke(); }
  circle(g, hx + f * 44 * s, hy - 18 * s, 8 * s, '#ffd45a'); circle(g, hx + f * 46 * s, hy - 18 * s, 3 * s, '#000');
  const tk = Math.sin(t * 18) > 0 ? 1 : 0.6; seg(g, [[hx + f * 72 * s, hy], [hx + f * (100 * tk) * s, hy + 4 * s], [hx + f * (112 * tk) * s, hy - 6 * s]], 4 * s, '#e0443a');
}
