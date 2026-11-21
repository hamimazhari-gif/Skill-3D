// shots/05_mission.js — s34–s38: "go to Pharaoh", Pharaoh's rage, the prayer for Harun.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, wordTime, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { city, palace } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson } from '../lib/_costume.js';
import { MUSA, HARUN, FIRAUN } from '../cast.js';

const PRAY = { ...POSES.holdFront, eF: [22, -158], hF: [34, -192], eB: [14, -156], hB: [26, -190], head: [8, -204] };

// s34 — "Pergilah kepada Firaun."  the palace city far away, ominous red sky
registerShot('s34', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k, y: -20 * k };
  city(g, t, cam, { mood: 'pharaoh' });
  veil(g, '#200000', 0.15);
  FX.dust(g, t, { count: 40, color: '#ff9a6a', a: 0.3, speed: 10 });
} });

// s35 — "Sesungguhnya dia telah melampaui batas."  Pharaoh's face, red light
registerShot('s35', { draw(g, t, info) {
  const M = mood('pharaoh');
  blurLayer(g, 14, (g) => palace(g, t, { z: 1.5, x: 100, y: -150 }, { mood: 'pharaoh' })); veil(g, '#1a0000', 0.4);
  const [qx, qy] = shake(t, t < 0.5 ? 6 : 1.5, 20);
  bigPerson(g, E.W / 2 + qx, E.H * V(0.6, 0.56) + qy, V(290, 320) * (1 + 0.05 * t), { outfit: FIRAUN, expr: 'angry', look: [0, 0.1], rimColor: M.rim, rimSide: 1 });
  FX.dust(g, t, { count: 50, color: M.practical, a: 0.4, speed: 20 });
} });

// s36 — "Musa berdoa agar saudaranya, Harun, menemaninya,"  prayer at dawn; Harun appears
registerShot('s36', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.04 + 0.05 * k, x: 20 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dawn', sunX: V(260, 200), wind: false });
  const rim = { color: M.rim, dir: [1, -0.5], w: 5 }, s = V(1.6, 1.7);
  const hT = wordTime('Harun', 82) - info.shot.start, ha = ease.out(prog(t, hT - 0.2, hT + 0.6));
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(160, 140), y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(PRAY, t), expr: 'sleepy', staff: true, staffHand: 'B', staffBehind: true, rim });
    if (ha > 0) { person(g, { x: CX + V(170, 150), y: GY + 44, s: s * 0.97, facing: -1, outfit: HARUN, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'smile', alpha: ha, rim }); FX.rings(g, CX + V(170, 150), GY - 120 * s, t, { count: 2, r0: 40, r1: 260, speed: 0.7, color: '#ffe6c0', a: 0.4 * ha }); }
  });
  for (let i = 0; i < 6; i++) FX.sparkle(g, E.W / 2 + Math.sin(i * 2.2) * 300, E.H * V(0.3, 0.38) + Math.cos(i * 1.4) * 100 - t * 20, 14, '#ffe6c0', 0.6 * Math.abs(Math.sin(t * 3 + i)));
} });

// s37 — "karena lisannya lebih fasih."  Harun speaks eloquently, Musa listens
registerShot('s37', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.05 * k, x: V(80, 70), y: -40 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dawn', sunX: V(260, 200), wind: false });
  const rim = { color: M.rim, dir: [1, -0.5], w: 5 }, s = V(1.9, 2.0);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(170, 150), y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(POSES.relaxed, t), expr: t % 1.4 < 0.3 ? 'happy' : 'smile', look: [1, 0], staff: true, staffHand: 'B', rim });
    const hx = CX + V(160, 140), talk = 0.35 + 0.35 * Math.sin(t * 13) * Math.sin(t * 3.1);
    person(g, { x: hx, y: GY + 44, s: s * 0.97, facing: -1, outfit: HARUN, pose: breathe(posesAt(t, [[0, 'talk'], [1.0, 'explain'], [2.2, 'talk']]), t, 1, 2), expr: 'happy', talk: Math.max(0, talk), rim });
    FX.rings(g, hx - 10 * s, GY + 44 - 210 * s, t, { count: 3, r0: 40, r1: 200, speed: 1.2, color: '#ffe6c0', a: 0.45 });
  });
} });

// s38 — "Doa itu dikabulkan."  together at sunrise, Harun's hand on Musa's shoulder
registerShot('s38', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 - 0.04 * k, y: 30 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(40, 20), wind: false });
  const rim = { color: M.rim, dir: [0, -1], w: 5 }, s = V(1.6, 1.7);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(60, 50), y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(POSES.relaxed, t), expr: 'happy', staff: true, rim });
    person(g, { x: CX - V(210, 190), y: GY + 44, s: s * 0.97, facing: 1, outfit: HARUN, pose: breathe({ ...POSES.reach, eF: [40, -170], hF: [74, -174] }, t, 1, 2), expr: 'smile', rim });
  });
  const a = ease.out(prog(t, 0.1, 0.6)); glow(g, E.W / 2, E.H * 0.45, V(700, 700), '#ffe6b0', 0.25 * a);
  FX.godRays(g, E.W / 2, E.H * V(0.5, 0.52), { count: 9, angle: -Math.PI / 2, spread: 2.2, len: E.H, color: '#ffe6b0', a: 0.08 * a, t });
} });
