// lib5/_yusuf.js — props & special views for the Yusuf story: qamis, wolf, camel, the well from inside/above, the dream sky, comment prompt.
import { E, V, S, seg, circle, ring, poly, glow, alpha, shade, mix, rng, linGrad, radGrad, text, FONTS, ease, prog, lerp, clamp, rr } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { QAMIS } from '../cast.js';

// Yusuf's shirt laid flat / held up. o: { blood: 0..1, glowC, rot }
export function qamis(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
  const body = () => { g.beginPath(); g.moveTo(-60, -120); g.lineTo(-150, -70); g.lineTo(-120, -20); g.lineTo(-70, -50); g.lineTo(-80, 150); g.lineTo(80, 150); g.lineTo(70, -50); g.lineTo(120, -20); g.lineTo(150, -70); g.lineTo(60, -120); g.quadraticCurveTo(0, -95, -60, -120); g.closePath(); };
  if (o.glowC) glow(g, 0, 0, 320, o.glowC, 0.35);
  g.save(); g.translate(-6, -6); body(); g.fillStyle = o.rim || '#ffe0b0'; g.fill(); g.restore();
  body(); g.fillStyle = QAMIS; g.fill();
  g.save(); body(); g.clip();
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-80, 60, 160, 90);
  seg(g, [[0, -105], [0, -40]], 4, 'rgba(0,0,0,.18)');
  if (o.blood) { const r = rng(3); g.globalAlpha = o.blood; for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#8a1010' : '#a81a14'; g.beginPath(); g.ellipse(-60 + r() * 120, -60 + r() * 190, 8 + r() * 16, 6 + r() * 12, r() * 3, 0, Math.PI * 2); g.fill(); } }
  g.restore();
  g.restore();
}
// wolf silhouette (side), howling optional
export function wolf(g, x, y, s, f = 1, o = {}) {
  const c = o.color || S().ink;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  if (o.rim) { g.save(); g.translate(-4, -4); wolfShape(g, o.rim, o.howl); g.restore(); }
  wolfShape(g, c, o.howl);
  if (o.eyes) { const ex = o.howl ? 92 : 108, ey = o.howl ? -178 : -142; glow(g, ex, ey, 30, o.eyes, 0.9); circle(g, ex, ey, 5, o.eyes); }
  g.restore();
}
function wolfShape(g, c, howl) {
  g.fillStyle = c; g.strokeStyle = c; g.lineCap = 'round';
  g.beginPath(); g.ellipse(-10, -85, 95, 38, -0.05, 0, Math.PI * 2); g.fill();            // body
  g.beginPath(); g.ellipse(55, -100, 45, 44, 0, 0, Math.PI * 2); g.fill();                 // chest / shoulders
  for (const [lx, k] of [[-70, 0], [-48, 1], [50, 0], [72, 1]]) seg(g, [[lx, -75], [lx + 6 * k, -38], [lx + 2, 0]], 13, c);
  g.beginPath(); g.moveTo(-95, -100); g.quadraticCurveTo(-170, -90, -185, -40); g.quadraticCurveTo(-150, -70, -95, -70); g.closePath(); g.fill();  // bushy tail
  const hx = howl ? 80 : 100, hy = howl ? -165 : -135, ang = howl ? -1.1 : -0.15;
  seg(g, [[55, -110], [hx - 10, hy + 20]], 40, c);                                           // neck
  g.save(); g.translate(hx, hy); g.rotate(ang);
  g.beginPath(); g.ellipse(0, 0, 34, 27, 0, 0, Math.PI * 2); g.fill();                     // head
  poly(g, [[20, -14], [72, -4], [72, 8], [20, 16]], c);                                     // snout
  poly(g, [[-18, -18], [-10, -52], [4, -22]], c); poly(g, [[-2, -20], [8, -50], [18, -18]], c);  // ears
  g.restore();
}
// camel (side), walking
export function camel(g, x, y, s, f, t, o = {}) {
  const c = o.color || S().ink, ph = t * 4;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  const draw = (col, dx = 0, dy = 0) => {
    for (const [lx, k] of [[-60, 0], [-40, 1.6], [50, 3.2], [70, 4.8]]) { const a = Math.sin(ph + k) * 0.35; seg(g, [[lx + dx, -130 + dy], [lx + Math.sin(a) * 22 + dx, -65 + dy], [lx + Math.sin(a) * 30 + dx, dy]], 11, col); }
    g.fillStyle = col; g.beginPath(); g.ellipse(dx, -150 + dy, 95, 40, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(-10 + dx, -190 + dy, 50, 38, 0, Math.PI, Math.PI * 2); g.fill();
    seg(g, [[75 + dx, -150 + dy], [120 + dx, -200 + dy], [125 + dx, -250 + dy]], 26, col);
    g.beginPath(); g.ellipse(145 + dx, -255 + dy, 30, 15, 0.2, 0, Math.PI * 2); g.fill();
  };
  if (o.rim) draw(o.rim, -4, -4);
  draw(c);
  if (o.load) { rr(g, -60, -250, 90, 40, 8); g.fillStyle = o.load; g.fill(); }
  circle(g, 152, -262, 3.5, S().feature);
  g.restore();
}
// inside the well, looking up: stone walls converge to a disc of sky. o: { sky (colour), light 0..1, bucket: y 0..1 }
export function wellInside(g, t, o = {}) {
  const W = E.W, H = E.H, cx = W / 2, cy = H * 0.22, R = V(150, 150);
  g.fillStyle = '#05040a'; g.fillRect(-W, -H, W * 3, H * 3);
  // stone tunnel: filled ellipses from the bottom (dark, wide) up to the opening (lighter, narrow)
  const n = 22;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), r = lerp(W * 1.3, R * 1.12, Math.pow(u, 0.55)), y = lerp(H * 1.15, cy, Math.pow(u, 0.65));
    g.fillStyle = mix('#0a0806', '#6a5a46', Math.pow(u, 1.6) * (0.4 + 0.6 * (o.light ?? 0.6)));
    g.beginPath(); g.ellipse(cx, y, r, r * 0.34, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = lerp(5, 1.5, u); g.stroke();
    if (i % 2 === 0) for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + i; seg(g, [[cx + Math.cos(a) * r, y + Math.sin(a) * r * 0.34], [cx + Math.cos(a) * r * 0.97, y + Math.sin(a) * r * 0.33 + lerp(30, 4, u)]], lerp(4, 1, u), 'rgba(0,0,0,.25)'); }
  }
  // sky disc
  g.fillStyle = o.sky || '#9ab8ff'; g.beginPath(); g.ellipse(cx, cy, R, R * 0.36, 0, 0, Math.PI * 2); g.fill();
  glow(g, cx, cy, R * 3, o.sky || '#9ab8ff', 0.35 * (o.light ?? 0.6));
  FX.godRays(g, cx, cy, { count: 7, angle: Math.PI / 2, spread: 0.35, len: H * 1.1, color: o.sky || '#cfe0ff', a: 0.07 * (o.light ?? 0.6), t });
  if (o.bucket != null) { const by = lerp(cy, H * 0.55, o.bucket); seg(g, [[cx, cy], [cx, by]], 3, '#c8b08a'); rr(g, cx - 34, by, 68, 56, 8); g.fillStyle = '#4a3020'; g.fill(); seg(g, [[cx - 30, by], [cx, by - 30], [cx + 30, by]], 4, '#2a1a10'); }
  // water at the bottom
  g.fillStyle = alpha('#1a3a5a', 0.6); g.beginPath(); g.ellipse(cx, H * 1.0, W * 0.9, H * 0.08, 0, 0, Math.PI * 2); g.fill();
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.25 * (o.light ?? 0.6) });
}
// looking down into the well from above: tiny figure drawn by caller inside `inner`
export function wellTop(g, t, inner, o = {}) {
  const W = E.W, H = E.H, cx = W / 2, cy = H * 0.5;
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#6a5a48', '#4a3a2a']); g.fillRect(-W, -H, W * 3, H * 3);
  const R = V(330, 380);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; g.save(); g.translate(cx + Math.cos(a) * R * 1.15, cy + Math.sin(a) * R * 1.15); g.rotate(a); rr(g, -50, -36, 100, 72, 12); g.fillStyle = i % 2 ? '#8a7a64' : '#7a6a54'; g.fill(); g.restore(); }
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  g.fillStyle = radGrad(g, cx, cy, 0, R, ['#0a1220', '#05070c', '#020204']); g.fillRect(cx - R, cy - R, R * 2, R * 2);
  for (let i = 0; i < 8; i++) ring(g, cx, cy, R * (1 - i * 0.1), 10, alpha('#000', 0.3));
  inner?.(g, cx, cy, R);
  g.restore();
  // the boy's shadow of light from above
  if (o.shadowOf) for (const [x, y, s] of o.shadowOf) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y, 60 * s, 30 * s, 0, 0, Math.PI * 2); g.fill(); }
}
// the dream sky: 11 stars, sun and moon (appear with a = [stars 0..11, sun 0..1, moon 0..1]); bow 0..1 lowers them toward (bx, by)
export function dreamSky(g, t, a, bow = 0, bx = E.W / 2, by = E.H * 0.85) {
  const W = E.W, H = E.H;
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#02030e', '#0e1240', '#2a1a50']); g.fillRect(-W, -H, W * 3, H * 3);
  FX.stars(g, t, { count: 180, area: [-W * 0.1, 0, W * 1.2, H] });
  const ring11 = [];
  for (let i = 0; i < 11; i++) { const ang = Math.PI * (1.08 + 0.84 * i / 10), r = V(620, 440); ring11.push([W / 2 + Math.cos(ang) * r, H * V(0.62, 0.55) + Math.sin(ang) * r * V(0.9, 1.1)]); }
  const lower = (p, k) => [lerp(p[0], lerp(p[0], bx, 0.35), bow), lerp(p[1], lerp(p[1], by - 220, 0.5), bow) + k];
  for (let i = 0; i < 11; i++) { const s = clamp(a[0] - i); if (s <= 0) continue; const [x, y] = lower(ring11[i], 0); glow(g, x, y, 90 * s, '#fff4c0', 0.6); FX.sparkle(g, x, y, 34 * ease.outBack(s), '#fffbe8', 1); }
  if (a[1] > 0) { const [x, y] = lower([W * 0.3, H * V(0.2, 0.18)], 0); FX.sun(g, x, y, V(70, 80) * ease.outBack(a[1]), '#fff3dc', '#ffc060', 4); }
  if (a[2] > 0) { const [x, y] = lower([W * 0.72, H * V(0.2, 0.18)], 0); FX.moon(g, x, y, V(56, 64) * ease.outBack(a[2]), '#e8ecff'); g.fillStyle = '#0e1240'; g.beginPath(); g.arc(x + 22, y - 10, V(50, 58) * ease.outBack(a[2]), 0, Math.PI * 2); g.fill(); }
}
// "write in the comments" prompt
export function commentPrompt(g, t, lines, o = {}) {
  const a = ease.out(prog(t, 0.1, 0.5)), ui = S().ui, y0 = o.y ?? E.H * 0.38;
  lines.forEach((ln, i) => text(g, ln, E.W / 2, y0 + i * V(84, 92), { size: V(66, 72), color: i === lines.length - 1 ? ui.gold : '#ffffff', font: FONTS.title, stroke: 12, strokeColor: '#000', glow: 20, glowColor: 'rgba(255,190,90,.6)', alpha: a }));
  const bp = ease.outBack(prog(t, 0.5, 1.0)), by = y0 + lines.length * V(84, 92) + V(60, 90);
  g.save(); g.translate(E.W / 2, by); g.scale(bp, bp);
  rr(g, -260, -54, 520, 108, 54); g.fillStyle = '#ffffff'; g.fill(); poly(g, [[-140, 50], [-100, 50], [-150, 90]], '#ffffff');
  for (let i = 0; i < 3; i++) circle(g, -200 + i * 30, 0, 10 + 3 * Math.max(0, Math.sin(t * 6 - i)), '#555');
  text(g, 'Tulis di komentar', 40, 2, { size: 38, color: '#222', font: FONTS.ui, weight: 900 });
  g.restore();
}
