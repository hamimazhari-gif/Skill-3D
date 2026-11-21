// thumb.js — YouTube / Shorts thumbnail: Musa with the shining staff vs Pharaoh, serpent, big title.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, glow, alpha, linGrad, text, FONTS, seg, poly, circle } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { palace } from '../sets/egypt.js';
import { person, bigPerson, serpent } from '../lib/_costume.js';
import { MUSA, FIRAUN, PENYIHIR } from '../cast.js';

registerShot('thumb', { draw(g, t) {
  const W = E.W, H = E.H, vert = E.vertical, gold = S().ui.gold, MP = mood('pharaoh');
  // background: red palace on Pharaoh's side, deep night-blue on Musa's side
  blurLayer(g, 10, (g) => palace(g, 1, { z: 1.3, x: V(300, 0), y: -100 }, { mood: 'pharaoh' }));
  veil(g, '#120202', 0.35);
  g.save(); g.beginPath();
  if (vert) { g.moveTo(0, H * 0.5); g.lineTo(W, H * 0.42); g.lineTo(W, H); g.lineTo(0, H); }
  else { g.moveTo(0, 0); g.lineTo(W * 0.5, 0); g.lineTo(W * 0.42, H); g.lineTo(0, H); }
  g.closePath(); g.clip();
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#050a24', '#0e1a48', '#1a1030']); g.fillRect(0, 0, W, H);
  FX.stars(g, 0, { count: 120, area: [0, 0, W, H] });
  g.restore();
  // divider light
  g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#fff4d0', 0.9); g.lineWidth = 6; g.shadowColor = gold; g.shadowBlur = 40; g.beginPath();
  if (vert) { g.moveTo(0, H * 0.5); g.lineTo(W, H * 0.42); } else { g.moveTo(W * 0.5, 0); g.lineTo(W * 0.42, H); } g.stroke(); g.restore();

  // Pharaoh giant face (red side) — angry brows drawn on top so the nemes band doesn't hide them
  const fx = vert ? W * 0.5 : W * 0.73, fy = vert ? H * 0.2 : H * 0.62, fr = vert ? 245 : 270;
  glow(g, fx, fy, fr * 2.2, '#ff3a1a', 0.45);
  bigPerson(g, fx, fy, fr, { outfit: FIRAUN, expr: 'angry', face: { brows: null, mouth: 'frown' }, look: vert ? [0, 0.4] : [-0.5, 0.1], rimColor: MP.rim, rimSide: 1 });
  for (const sx of [-1, 1]) seg(g, [[fx + sx * fr * 0.56, fy - fr * 0.44], [fx + sx * fr * 0.14, fy - fr * 0.3]], fr * 0.1, S().feature);

  // Musa holding the shining staff high (blue side)
  const mx = vert ? W * 0.3 : W * 0.2, my = vert ? H + 10 : H + 20, ms = vert ? 2.0 : 1.9;
  const pose = { ...POSES.stand, eF: [26, -206], hF: [36, -250], head: [6, -208] };
  glow(g, mx + 38 * ms, my - 345 * ms, 380, gold, 0.55);
  FX.godRays(g, mx + 38 * ms, my - 345 * ms, { count: 14, angle: -Math.PI / 2, spread: Math.PI * 2, len: V(800, 900), color: '#fff0c0', a: 0.1 });
  person(g, { x: mx, y: my, s: ms, facing: 1, outfit: MUSA, pose, expr: 'determined', look: [1, -0.3], staff: true, staffGlow: gold, rim: { color: '#fff0c0', dir: [1, -0.6], w: 7 } });

  // serpent at the bottom, heading toward Pharaoh
  serpent(g, vert ? W * 0.62 : W * 0.5, vert ? H * 0.95 : H * 0.94, vert ? 0.75 : 0.65, 0.7, 1, '#c0ff9a');

  // title
  const T = (str, x, y, size, color, glowC, al = 'center') => text(g, str, x, y, { size, color, font: FONTS.title, weight: 700, stroke: size * 0.14, strokeColor: '#0a0404', glow: 30, glowColor: glowC, spacing: 2, align: al });
  if (vert) {
    const cx = W / 2, big = 150;
    T('MUSA', cx, H * 0.43, big, gold, 'rgba(255,170,60,.9)');
    T('VS', cx, H * 0.43 + big * 0.62, big * 0.55, '#ffffff', 'rgba(255,255,255,.7)');
    T('FIRAUN', cx, H * 0.43 + big * 1.25, big, '#ff5a3a', 'rgba(255,60,30,.9)');
    T('SIAPA YANG MENANG?', cx, H * 0.43 + big * 1.95, 56, '#ffffff', 'rgba(0,0,0,.9)');
  } else {
    const size = 140, y = H * 0.13, wM = 0, gap = 26;
    g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w1 = g.measureText('MUSA').width, w2 = g.measureText('VS').width * 0.6, w3 = g.measureText('FIRAUN').width; g.restore();
    const total = w1 + w2 + w3 + gap * 2; let x = W / 2 - total / 2;
    T('MUSA', x, y, size, gold, 'rgba(255,170,60,.9)', 'left'); x += w1 + gap;
    T('VS', x, y + 8, size * 0.6, '#ffffff', 'rgba(255,255,255,.7)', 'left'); x += w2 + gap;
    T('FIRAUN', x, y, size, '#ff5a3a', 'rgba(255,60,30,.9)', 'left');
    T('SIAPA YANG MENANG?', W * 0.23, H * 0.3, 54, '#ffffff', 'rgba(0,0,0,.9)');
  }
  // PART 2 badge
  const bx = vert ? W - 170 : W - 180, by = vert ? 110 : H - 90;
  g.save(); g.translate(bx, by); g.rotate(0.08); g.fillStyle = '#e0302a'; g.beginPath(); g.roundRect(-140, -46, 280, 92, 18); g.fill();
  text(g, 'PART 2', 0, 2, { size: 58, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 2 }); g.restore();
} });
