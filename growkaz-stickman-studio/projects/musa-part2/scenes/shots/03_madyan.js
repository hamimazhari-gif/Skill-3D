// shots/03_madyan.js — s11–s19: the well of Madyan, helping the two women, life in Madyan.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, mix } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { well, camp, tent } from '../sets/madyan.js';
import { desert } from '../sets/desert.js';
import { person, bigPerson, sheep, palm, staff } from '../lib/_costume.js';
import { MUSA, ISTRI, ADIK, AYAH, GEMBALA } from '../cast.js';

const rimOf = (M, dir = [-1, -0.4], w = 4) => ({ color: M.rim, dir, w });

// s11 — "Di sebuah sumur, ia melihat"  establishing the well, shepherds crowd it
registerShot('s11', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.08 * k, x: V(60, 80) * k };
  const { GY, CX, M, wx } = well(g, t, cam, { wellX: V(160, 170) });
  const rim = rimOf(M);
  layer(g, cam, 1, (g) => {
    const s = V(0.95, 1.0);
    for (let i = 0; i < 4; i++) person(g, { x: wx - V(120, 120) + i * V(85, 75), y: GY + 30 + (i % 2) * 14, s, facing: i % 2 ? -1 : 1, outfit: GEMBALA, pose: breathe(i % 2 ? POSES.relaxed : POSES.reach, t, 1, i), expr: 'neutral', rim });
    for (let i = 0; i < 3; i++) sheep(g, wx - V(40, 40) + i * V(90, 70), GY + 90 + (i % 2) * 18, V(0.9, 0.85), i % 2 ? 1 : -1, t, i, M.rim);
    for (let i = 0; i < 2; i++) sheep(g, CX - V(420, 280) + i * 70, GY + 70, 0.8, 1, t, 7 + i, M.rim);
    person(g, { x: CX - V(330, 240), y: GY + 50, s, facing: 1, outfit: ISTRI, pose: breathe(POSES.stand, t), expr: 'worried', rim });
    person(g, { x: CX - V(250, 170), y: GY + 56, s, facing: 1, outfit: ADIK, pose: breathe(POSES.crossArms, t, 1, 2), expr: 'worried', rim });
  });
  FX.dust(g, t, { count: 40, color: M.key, a: 0.35 });
} });

// s12 — "dua perempuan yang tak mampu memberi minum ternaknya,"  the two sisters with their sheep, waiting
registerShot('s12', { draw(g, t, info) {
  const M = mood('golden'), k = ease.inOut(t / info.dur);
  blurLayer(g, 8, (g) => well(g, t, { z: 1.35, x: V(260, 220), y: -60 }, { wellX: V(160, 170) }));
  veil(g, '#1a0c06', 0.18);
  const cam = { z: 1.0 + 0.05 * k, x: -20 * k }, GY = E.H * V(0.8, 0.68), CX = E.W / 2, s = V(1.6, 1.7), rim = rimOf(M, [-1, -0.3], 5);
  layer(g, cam, 1, (g) => {
    g.fillStyle = alpha(M.dark, 0.5); g.fillRect(-E.W, GY + 10, E.W * 3, E.H);
    person(g, { x: CX - V(160, 140), y: GY, s, facing: 1, outfit: ISTRI, pose: breathe(posesAt(t, [[0, 'stand'], [1.2, 'holdFront']]), t), expr: t < 1.4 ? 'worried' : 'sad', look: [1, 0], rim, blink: (t % 3.1) > 3.0 });
    person(g, { x: CX + V(60, 50), y: GY + 14, s: s * 0.95, facing: 1, outfit: ADIK, pose: breathe(POSES.crossArms, t, 1, 3), expr: 'worried', look: [1, -0.1], rim, blink: (t % 2.7) > 2.6 });
    for (let i = 0; i < 3; i++) sheep(g, CX - V(260, 220) + i * V(150, 130), GY + V(140, 120) + (i % 2) * 20, V(1.4, 1.3), 1, t, i * 3, M.rim);
  });
  FX.dust(g, t, { count: 40, color: M.key, a: 0.35 });
} });

// s13 — "terdesak di antara para penggembala."  shepherds shove in, the sisters step back
registerShot('s13', { draw(g, t, info) {
  const push = ease.out(prog(t, 0.3, 1.2)), [qx, qy] = shake(t, t > 0.35 && t < 0.9 ? 5 : 0, 30); g.translate(qx, qy);
  const cam = { z: 1.08, x: 30 - 30 * push };
  const { GY, CX, M, wx } = well(g, t, cam, { wellX: V(360, 320) });
  const s = V(1.3, 1.35), rim = rimOf(M, [-1, -0.3], 4);
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 3; i++) person(g, { x: CX + V(140, 110) + i * V(110, 90) - push * 60, y: GY + 40 + i * 10, s, facing: -1, outfit: GEMBALA, pose: posesAt(t, [[0, 'relaxed'], [0.3, 'reach'], [1.4, 'crossArms']]), expr: i === 1 ? 'angry' : 'smirk', rim });
    person(g, { x: CX - V(130, 110) - push * 90, y: GY + 50, s, facing: 1, outfit: ISTRI, pose: posesAt(t, [[0, 'stand'], [0.4, 'fall'], [1.0, 'sad']]), expr: 'scared', rim });
    person(g, { x: CX - V(260, 220) - push * 70, y: GY + 60, s: s * 0.95, facing: 1, outfit: ADIK, pose: posesAt(t, [[0, 'stand'], [0.45, 'handsOnHead'], [1.2, 'sad']]), expr: 'worried', rim });
    sheep(g, CX - V(40, 30) - push * 60, GY + 120, 1.1, -1, t, 2, M.rim);
  });
  FX.dust(g, t, { count: 60, color: M.key, a: 0.4, speed: 30 });
} });

// s14 — "Tanpa ragu,"  Musa's determined face
registerShot('s14', { draw(g, t, info) {
  const M = mood('golden');
  blurLayer(g, 14, (g) => well(g, t, { z: 1.5, x: -200, y: -150 }, { wellX: V(160, 170) })); veil(g, '#1a0c06', 0.35);
  bigPerson(g, E.W / 2 + 20 * t, E.H * V(0.58, 0.55), V(300, 330) * (1 + 0.05 * t), { outfit: MUSA, expr: 'determined', look: [0.6, 0], rimColor: M.rim, rimSide: -1 });
  FX.lensStreak(g, E.W * 0.2, E.H * 0.3, E.W, M.key, 0.25);
} });

// s15 — "Musa menolong mereka."  pulling the bucket, water fills the trough, sheep drink
registerShot('s15', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.04 * k, x: V(60, 80) };
  const water = ease.out(prog(t, 0.8, 2.0));
  const { GY, CX, M, W, wx } = well(g, t, cam, { wellX: V(40, 20), water: water });
  const rim = rimOf(M, [-1, -0.4], 5), s = V(1.45, 1.5);
  layer(g, cam, 1, (g) => {
    const pull = Math.sin(t * 5.5), mx = wx - V(250, 220);
    const pose = { ...POSES.reach, hF: [60 + pull * 6, -180 + pull * 30], eF: [36, -160 + pull * 14], hB: [52 + pull * 6, -160 + pull * 30], eB: [26, -146 + pull * 14] };
    person(g, { x: mx, y: GY + 30, s, facing: 1, outfit: MUSA, pose, expr: 'determined', rim });
    const hand = [mx + 60 * s, GY + 30 + (-180 + pull * 30) * s];
    seg(g, [hand, W.pulley, [W.pulley[0], W.top - 40 + (1 - prog(t, 0, 1.6)) * 120]], 3, '#c8b08a');
    const by = W.pulley[1] + 40 + (1 - ease.out(prog(t, 0, 1.0))) * 160; g.fillStyle = '#4a3020'; g.fillRect(W.pulley[0] - 24, by, 48, 40);
    if (water > 0 && water < 1) for (let i = 0; i < 8; i++) circle(g, wx + V(250, 190) + Math.sin(i * 3 + t * 8) * 30, GY - 70 - ((t * 300 + i * 30) % 60), 5, alpha('#bfe8ff', 0.7));
    for (let i = 0; i < 3; i++) sheep(g, wx + V(170, 150) + i * V(80, 60), GY + 70 + i * 12, V(1.0, 0.9), -1, t * (water > 0.3 ? 2 : 1), i, M.rim);
  });
  FX.dust(g, t, { count: 40, color: M.key, a: 0.35 });
} });

// s16 — "Kebaikan kecil itu mengubah hidupnya."  resting under a palm; one sister approaches shyly
registerShot('s16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.04 + 0.05 * k, x: -20 };
  const { GY, CX, M } = well(g, t, cam, { wellX: V(700, 600), mood: 'golden' });
  const rim = rimOf(M, [1, -0.5], 5), s = V(1.5, 1.55);
  layer(g, cam, 1, (g) => {
    palm(g, CX - V(380, 330), GY + 30, V(1.4, 1.3), '#140c10', t, 3);
    FX.pool(g, CX - V(200, 160), GY + 40, 300, 40, '#000', 0.0);
    person(g, { x: CX - V(240, 200), y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(POSES.sitBack, t), expr: t > 1.4 ? 'surprised' : 'sleepy', rim, shadow: true });
    const walk = clamp(t / 1.6), x = lerp(CX + V(420, 340), CX + V(120, 110), ease.out(walk));
    person(g, { x, y: GY + 44, s, facing: -1, outfit: ISTRI, pose: walk < 1 ? walkPose(t * Math.PI * 2 * 0.8) : breathe(POSES.holdFront, t), expr: 'smile', look: [-0.6, 0.5], rim });
  });
  const a = prog(t, 0.8, 2.0);
  for (let i = 0; i < 6; i++) FX.sparkle(g, E.W * (0.3 + 0.08 * i), E.H * V(0.4, 0.45) + Math.sin(t * 2 + i) * 30, 16, '#fff0c8', 0.5 * a * (0.5 + 0.5 * Math.sin(t * 4 + i)));
  FX.dust(g, t, { count: 50, color: M.key, a: 0.45 });
} });

// s17 — "Musa diterima tinggal di Madyan,"  the old man welcomes Musa at the camp
registerShot('s17', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.03 + 0.05 * k, x: 30 * k };
  const { GY, CX, M } = camp(g, t, cam, { fireX: V(0, 10) });
  const rim = { color: M.practical, dir: [0, -1], w: 4 }, s = V(1.4, 1.45);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(260, 210), y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(posesAt(t, [[0, 'relaxed'], [1.0, 'holdFront']]), t), expr: 'smile', staff: true, staffHand: 'B', rim });
    person(g, { x: CX + V(250, 200), y: GY + 46, s: s * 0.96, facing: -1, outfit: AYAH, pose: breathe(posesAt(t, [[0, 'wave'], [0.9, 'explain']]), t, 1, 2), expr: 'happy', rim });
    person(g, { x: CX + V(400, 330), y: GY + 30, s: s * 0.9, facing: -1, outfit: ADIK, pose: breathe(POSES.stand, t, 1, 4), expr: 'smile', rim });
  });
  FX.dust(g, t, { count: 40, color: M.practical, a: 0.4, speed: -10 });
} });

// s18 — "menikah,"  Musa and his wife side by side before their tent
registerShot('s18', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.04 * t, x: 0 };
  const { GY, CX, M } = camp(g, t, cam, { fireX: V(-500, -400) });
  const rim = { color: M.practical, dir: [0, -1], w: 5 }, s = V(1.7, 1.8);
  layer(g, cam, 0.95, (g) => tent(g, CX, GY - 10, V(620, 560), V(420, 480), M, 1, 1, t));
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(100, 95), y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(POSES.relaxed, t), expr: 'happy', look: [0.6, 0], rim });
    person(g, { x: CX + V(100, 95), y: GY + 44, s: s * 0.94, facing: -1, outfit: ISTRI, pose: breathe(POSES.holdFront, t, 1, 2), expr: 'smile', look: [-0.6, 0.3], rim });
  });
  for (let i = 0; i < 8; i++) FX.sparkle(g, E.W / 2 + Math.sin(i * 2.1) * 260, E.H * V(0.35, 0.42) + Math.cos(i * 1.7) * 120 - t * 30, 12, M.practical, 0.6 * Math.abs(Math.sin(t * 3 + i)));
} });

// s19 — "dan menetap di sana selama bertahun-tahun."  time-lapse: herding sheep while suns and moons race
registerShot('s19', { draw(g, t, info) {
  const cyc = t * 1.1, night = 0.5 - 0.5 * Math.cos(cyc * Math.PI * 2);
  const cam = { z: 1.04, x: t * 40 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(-500, -300) + ((cyc % 1) * V(1000, 600)), wind: false });
  veil(g, '#060a20', 0.6 * night);
  if (night > 0.4) FX.stars(g, t, { count: 120, area: [0, 0, E.W, E.H * 0.45] });
  const rim = { color: night > 0.5 ? '#9ab8ff' : M.rim, dir: [-1, -0.4], w: 4 }, s = V(1.2, 1.25);
  layer(g, cam, 1, (g) => {
    const x = CX - V(200, 150) + t * 60;
    person(g, { x, y: GY + 40, s, facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 0.8), expr: 'smile', staff: true, rim });
    for (let i = 0; i < 4; i++) sheep(g, x + V(150, 130) + i * V(95, 75), GY + 60 + (i % 2) * 16, 0.95, 1, t * 1.5, i, rim.color);
  });
  // tiny sun/moon cycle indicator
  const ix = E.W - V(110, 110), iy = V(110, 200);
  FX.sun(g, ix + Math.cos(cyc * Math.PI * 2) * 30, iy + Math.sin(cyc * Math.PI * 2) * 30, 10, '#fff3dc', '#ffc47a', 3);
} });
