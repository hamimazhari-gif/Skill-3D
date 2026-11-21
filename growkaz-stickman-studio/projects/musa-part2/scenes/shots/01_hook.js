// shots/01_hook.js — s01–s05: the palace, the return, Pharaoh, the title card.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { palace, throne } from '../sets/egypt.js';
import { desert, blowingSand } from '../sets/desert.js';
import { person, bigPerson } from '../lib/_costume.js';
import { MUSA, MUSA_KID, FIRAUN, PENJAGA } from '../cast.js';

// s01 — "Dia dibesarkan di dalam istana Firaun…"
registerShot('s01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.07 * k, x: -30 + 50 * k };
  const { GY, CX, M } = palace(g, t, cam);
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 0.95, (g) => { for (const sx of [-1, 1]) person(g, { x: CX + sx * V(560, 400), y: GY - 6, s: V(1.0, 1.05), facing: -sx, outfit: PENJAGA, pose: breathe(POSES.stand, t, 1, sx), expr: 'neutral', spear: true, rim }); });
  layer(g, cam, 1, (g) => {
    const s = V(1.6, 1.75), x = CX - V(300, 230) + t * 150 * s * 0.72;
    person(g, { x, y: GY + 10, s, facing: 1, outfit: MUSA_KID, pose: walkPose(t * Math.PI * 2 * 0.9), expr: 'awe', look: [0.3, -0.6], rim });
  });
  FX.dust(g, t, { count: 50, color: M.practical, a: 0.4 });
} });

// s02 — "Dan kini, dia kembali."  adult Musa walks along a dune crest, backlit
registerShot('s02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 - 0.05 * k, x: 20 - 40 * k, y: V(0, 60) };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(80, 40) });
  layer(g, cam, 1, (g) => {
    const s = V(1.5, 1.7), x = CX - V(240, 200) + t * 160 * s * 0.6;
    person(g, { x, y: GY + 20, s, facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 0.8), expr: 'determined', staff: true, rim: { color: M.rim, dir: [0.2, -1], w: 5 } });
  });
  FX.lensStreak(g, E.W / 2, E.H * 0.42, E.W * 1.4, M.key, 0.25);
} });

// s03 — "Bukan sebagai pangeran,"  giant face
registerShot('s03', { draw(g, t, info) {
  const M = mood('golden');
  blurLayer(g, 14, (g) => desert(g, t, { z: 1.4, x: -120, y: -200 }, { mood: 'golden', wind: false })); veil(g, '#1a0e08', 0.35);
  const r = V(300, 330) * (1 + 0.04 * t);
  bigPerson(g, E.W / 2, E.H * V(0.58, 0.55), r, { outfit: MUSA, expr: 'determined', look: [0.1, 0], blink: (t % 2.9) > 2.8, rimColor: M.rim, rimSide: 1 });
  blowingSand(g, t, '#ffd9a0', E.H * 0.6, 0.5);
} });

// s04 — "tapi untuk menantang raja paling sombong di muka bumi!"  low-angle Pharaoh on the throne
registerShot('s04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), fs = V(1.7, 1.9), tx = E.W / 2 + V(40, 30);
  const cam = { z: 1.05 + 0.1 * k, x: 20, y: V(-60, -120) - 60 * k, r: -0.015 };
  const { GY, M } = palace(g, t, cam, { throne: tx, throneK: fs, openX: -V(320, 200) });
  layer(g, cam, 1, (g) => {
    const fy = GY - 78 * fs;
    person(g, { x: tx - 6 * fs, y: fy, s: fs, facing: -1, outfit: FIRAUN, pose: breathe(POSES.sit, t), expr: t > 1.2 ? 'smirk' : 'neutral', look: [-0.5, 0.2], rim: { color: M.rim, dir: [-1, -0.3], w: 5 }, shadow: false });
  });
  const [sx, sy] = shake(t, t > 1.0 && t < 1.4 ? 6 : 0, 30); g.translate(sx, sy);
  FX.dust(g, t, { count: 40, color: M.practical, a: 0.4 });
} });

// s05 — title card
registerShot('s05', { draw(g, t, info) {
  blurLayer(g, 12, (g) => palace(g, t + 3, { z: 1.25, x: 0 })); veil(g, '#0e0604', 0.5);
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI MUSA', 'PART 2'], dur: info.dur + 0.5, y: E.H * 0.46 });
} });
