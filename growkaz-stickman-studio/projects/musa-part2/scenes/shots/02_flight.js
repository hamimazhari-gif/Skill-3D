// shots/02_flight.js — s06–s10: Egypt shaken, the flight, alone in the desert, the route to Madyan.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { city } from '../sets/egypt.js';
import { desert, blowingSand, routeMap } from '../sets/desert.js';
import { person } from '../lib/_costume.js';
import { MUSA, PENJAGA } from '../cast.js';

// s06 — "Setelah sebuah peristiwa yang mengguncang Mesir,"  guards rush through the night city
registerShot('s06', { draw(g, t, info) {
  const quake = t > 1.5 ? (1 - prog(t, 1.5, 2.8)) * 14 : 0, [qx, qy] = shake(t, quake, 25);
  g.translate(qx, qy);
  const cam = { z: 1.04 + 0.04 * t / info.dur, x: 20 * t };
  const { GY, CX, M } = city(g, t, cam, {});
  const rim = { color: M.practical, dir: [0.3, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 3; i++) {
      const s = V(1.25, 1.35), x = CX - V(700, 600) + i * V(170, 150) + t * 420 * s * 0.55;
      person(g, { x, y: GY + 30 + i * 8, s, facing: 1, outfit: PENJAGA, pose: walkPose(t * Math.PI * 2 * 1.6 + i, { run: true }), expr: 'angry', spear: true, rim });
    }
  });
  FX.dust(g, t, { count: 60, color: M.practical, a: 0.35, speed: 30 });
} });

// s07 — "Musa terpaksa melarikan diri."  Musa runs out of the gate, camera follows
registerShot('s07', { draw(g, t, info) {
  const s = V(1.45, 1.6), run = 420 * s * 0.6;
  const cam = { z: 1.05, x: t * run * 0.85 - V(80, 60) };
  const { GY, CX, M } = city(g, t, cam, { gateX: -V(140, 120) });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(260, 200) + t * run, y: GY + 30, s, facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 1.6, { run: true }), expr: 'scared', look: [-1, 0], trail: { count: 3, dx: -36, a: 0.18 }, rim: { color: M.practical, dir: [-1, -0.4], w: 4 } }));
  FX.speedLines(g, t, { count: 30, a: 0.12 });
} });

// s08 — "Sendirian."  vast desert, tiny figure
registerShot('s08', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.18 - 0.12 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dusk', sunX: -V(300, 220) });
  layer(g, cam, 1, (g) => person(g, { x: CX + V(60, 40) + t * 40, y: GY - V(60, 90), s: V(0.45, 0.5), facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 0.7), expr: 'sad', rim: { color: M.rim, dir: [-1, -0.5], w: 3 } }));
} });

// s09 — "Tanpa bekal."  kneeling, exhausted, empty waterskin
registerShot('s09', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.06 * k, x: -20 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(300, 200) });
  layer(g, cam, 1, (g) => {
    const s = V(1.7, 1.85), x = CX - V(60, 40);
    person(g, { x, y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(POSES.kneel, t, 2.2), expr: 'sad', look: [0.4, 0.8], rim: { color: M.rim, dir: [0.8, -0.6], w: 5 } });
    // empty waterskin on the sand
    const bx = x + 130 * s, by = GY + 34;
    g.fillStyle = '#4a3020'; g.beginPath(); g.ellipse(bx, by - 10, 46, 14, 0.1, 0, Math.PI * 2); g.fill(); seg(g, [[bx + 40, by - 14], [bx + 62, by - 22]], 8, '#3a2418');
  });
  // heat shimmer
  g.save(); g.globalAlpha = 0.12; for (let i = 0; i < 6; i++) { const y = E.H * 0.55 + i * 40; seg(g, [[0, y + Math.sin(t * 5 + i) * 4], [E.W, y + Math.sin(t * 5 + i + 2) * 4]], 2, '#fff2d0'); } g.restore();
  blowingSand(g, t, '#ffd9a0', E.H * 0.62, 0.3);
} });

// s10 — "Menembus padang pasir menuju negeri Madyan."  parchment route map
registerShot('s10', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1.02 + 0.06 * k, 1.02 + 0.06 * k); g.translate(-E.W / 2 - 20 * k, -E.H / 2);
  routeMap(g, t, ease.inOut(prog(t, 0.3, info.dur - 0.3)));
  g.restore();
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
} });
