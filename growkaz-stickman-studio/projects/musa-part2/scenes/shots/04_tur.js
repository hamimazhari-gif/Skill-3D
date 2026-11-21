// shots/04_tur.js — s20–s33: the night journey, the fire on Mount Thur, the call, the staff and the shining hand.
// Allah is never depicted: the call is shown only as light.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, text, FONTS, S, wordTime } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { desert } from '../sets/desert.js';
import { tur, burningTree, holyLight } from '../sets/tur.js';
import { person, bigPerson, sheep, staff, serpent, flame } from '../lib/_costume.js';
import { MUSA, ISTRI } from '../cast.js';

const HOLY = '#fff0c0';
const fireRim = (M, dir = [1, -0.3], w = 5) => ({ color: M.practical, dir, w });

// s20 — "Hingga suatu malam, dalam perjalanan bersama keluarganya,"
registerShot('s20', { draw(g, t, info) {
  const s = V(1.25, 1.3), cam = { z: 1.04, x: t * 70 * s * 0.6 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'night', sunX: -V(300, 200) });
  const rim = { color: M.rim, dir: [-0.6, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    const x = CX - V(60, 40) + t * 70 * s;
    person(g, { x, y: GY + 40, s, facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 0.7), expr: 'neutral', staff: true, rim });
    person(g, { x: x - V(150, 130), y: GY + 46, s: s * 0.94, facing: 1, outfit: ISTRI, pose: walkPose(t * Math.PI * 2 * 0.7 + 1.5), expr: 'neutral', rim });
    for (let i = 0; i < 3; i++) sheep(g, x - V(300, 260) - i * V(90, 75), GY + 60 + (i % 2) * 14, 0.9, 1, t * 1.5, i, M.rim);
  });
  FX.dust(g, t, { count: 50, color: '#cfe0ff', a: 0.25, speed: 8 });
} });

// s21 — "Musa melihat cahaya api di kejauhan…"  over-the-shoulder toward the distant fire
registerShot('s21', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), fireUp = 0.4 + 0.6 * ease.out(prog(t, 0.6, 1.6));
  const cam = { z: 1.0 + 0.1 * k, x: V(40, 30) * k };
  const { GY, CX, M } = tur(g, t, cam, { fire: fireUp, fireAt: [V(200, 140), -V(380, 560)] });
  blurLayer(g, 10, (g) => person(g, { x: CX - V(470, 320), y: E.H + V(160, 120), s: V(3.6, 3.4), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'awe', rim: { color: M.practical, dir: [1, -0.2], w: 6 } }), { z: 1 }, 1.6);
  FX.dust(g, t, { count: 40, color: '#cfe0ff', a: 0.2 });
} });

// s22 — "dari arah Gunung Thur."  3D low-poly mountain at night with a fire on the slope
registerShot('s22', {
  kind: '3d',
  init(T) {
    const M = mood('night');
    const st = T.stage({ mood: 'night', fov: V(40, 58), fog: [18, 70], keyPos: [-10, 14, 6], keyIntensity: 0.8, ambient: 0.6, bloom: 1.2 });
    const { THREE } = T;
    st.add(T.ground(200, 200, M.floor));
    const rock = T.mat(M.wall, { flat: true });
    const main = T.cone(9, 14, rock, 0, 7, -12, 9); main.rotation.y = 0.4; st.add(main);
    for (const [x, z, r, h] of [[-12, -6, 6, 7], [13, -8, 7, 9], [-20, -20, 9, 12], [22, -22, 10, 13], [6, 4, 2.2, 2.4], [-7, 6, 1.6, 1.6]]) { const c = T.cone(r, h, rock, x, h / 2, z, 7); c.rotation.y = x; st.add(c); }
    const fire = T.sphere(0.45, T.basic('#ffb040'), 2.2, 6.2, -8.2); st.add(fire);
    const light = new THREE.PointLight(0xffa040, 40, 30, 1.6); light.position.set(2.2, 6.6, -7.6); st.add(light);
    const musa = T.figure3D(MUSA, { rim: M.rim, pose: POSES.stand }); musa.position.set(-1.5, 0, 6); musa.rotation.y = -0.9; st.add(musa);
    return { stage: st, fire, light };
  },
  draw(s, t, info, T) {
    const f = 1 + Math.sin(t * 13) * 0.12 + Math.sin(t * 21) * 0.06; s.fire.scale.setScalar(f); s.light.intensity = 36 * f;
    T.orbit(s.stage.camera, t, { target: [0, 4, -6], radius: V(20, 24), height: [3, 5], from: -0.35, to: 0.25, dur: info.dur });
  },
  overlay(g, t, info) {
    const a = ease.out(prog(info.globalT, wordTime('Gunung', 47) - 0.1, wordTime('Gunung', 47) + 0.4)) * (1 - prog(t, info.dur - 0.4, info.dur));
    text(g, 'GUNUNG THUR', E.W / 2, E.H * V(0.82, 0.8), { size: V(64, 72), color: S().ui.gold, glow: 26, glowColor: 'rgba(255,150,60,.8)', spacing: 6, alpha: a });
  },
});

// s23 — "Ia mendekat."  walking toward the fire, lit from the right
registerShot('s23', { draw(g, t, info) {
  const s = V(1.6, 1.7), cam = { z: 1.06 + 0.05 * t, x: t * 40 };
  const { GY, CX, M } = tur(g, t, cam, { fire: 1, fireAt: [V(380, 260), -V(150, 230)] });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(260, 220) + t * 100, y: GY + 40, s, facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 0.7), expr: 'awe', look: [1, -0.3], staff: true, rim: fireRim(M) }));
  glow(g, E.W * 0.85, E.H * 0.45, V(500, 520), M.practical, 0.2);
} });

// s24 — "Dan di lembah suci itu, sebuah seruan memanggilnya."  the burning tree; the call as rings of light
registerShot('s24', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.08 * k, x: 20 * k };
  const call = prog(info.globalT, wordTime('seruan', 53) - 0.2, wordTime('seruan', 53) + 0.6);
  const { GY, CX, M } = tur(g, t, cam, { fire: 0 });
  layer(g, cam, 1, (g) => {
    burningTree(g, CX + V(260, 220), GY + 30, V(1.6, 1.5), t, M);
    person(g, { x: CX - V(230, 220), y: GY + 50, s: V(1.6, 1.65), facing: 1, outfit: MUSA, pose: breathe(posesAt(t, [[0, 'stand'], [2.2, 'handsOnHead']]), t), expr: call > 0 ? 'shocked' : 'awe', look: [1, -0.5], staff: t < 2.2, rim: fireRim(M) });
  });
  if (call > 0) FX.rings(g, CX + V(260, 220), GY - V(300, 300), t, { count: 4, r0: 60, r1: V(900, 800), speed: 0.6, color: HOLY, a: 0.55 * call, w: 3 });
  FX.dust(g, t, { count: 50, color: M.practical, a: 0.4, speed: -20 });
} });

// s25 — "Allah memanggil Musa,"  Musa kneels in a pillar of light (no figure is shown)
registerShot('s25', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k, y: -20 * k };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0 });
  veil(g, '#000010', 0.25);
  layer(g, cam, 1, (g) => {
    holyLight(g, t, [CX, GY - V(160, 180)], 0.7 + 0.3 * k);
    person(g, { x: CX - V(20, 10), y: GY + 40, s: V(1.6, 1.7), facing: 1, outfit: MUSA, pose: breathe({ ...POSES.kneel, head: [16, -160], sh: [8, -128] }, t, 0.6), expr: 'sleepy', rim: { color: HOLY, dir: [0, -1], w: 6 } });
  });
} });

// s26 — "dan mengangkatnya menjadi seorang rasul!"  giant face in rising golden light
registerShot('s26', { draw(g, t, info) {
  const M = mood('holy'), up = ease.out(prog(info.globalT, wordTime('rasul', 58) - 0.2, wordTime('rasul', 58) + 0.5));
  blurLayer(g, 14, (g) => tur(g, t, { z: 1.4, x: 0, y: -120 }, { fire: 0 })); veil(g, '#02030c', 0.35);
  holyLight(g, t, [E.W / 2, E.H * 0.3], 0.5 + 0.5 * up);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: MUSA, expr: up > 0.3 ? 'awe' : 'surprised', look: [0, -0.7], rimColor: HOLY, rimSide: -1 });
  for (let i = 0; i < 14; i++) FX.sparkle(g, E.W * (0.1 + 0.06 * i), E.H * (0.75 - ((t * 0.12 + i * 0.07) % 0.6)), 14, '#ffe8a0', 0.7 * Math.abs(Math.sin(t * 3 + i)));
  if (up > 0 && up < 1) veil(g, '#fff6e0', 0.35 * (1 - up), 'lighter');
} });

// s27 — "Lemparkan tongkatmu!"  the throw
registerShot('s27', { draw(g, t, info) {
  const cam = { z: 1.08, x: 30 * t };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0, holy: 0.35, holyAt: [E.W / 2 + V(300, 240), GY0()] });
  const rel = 0.45, s = V(1.65, 1.75), mx = CX - V(220, 200);
  layer(g, cam, 1, (g) => {
    person(g, { x: mx, y: GY + 40, s, facing: 1, outfit: MUSA, pose: posesAt(t, [[0, 'stand'], [0.15, { ...POSES.ready, hF: [10, -230], eF: [10, -196] }], [rel, 'point']], 0.25), expr: 'determined', staff: t < rel, rim: { color: HOLY, dir: [1, -0.6], w: 5 } });
    if (t >= rel) {
      const u = clamp((t - rel) / 0.9), x = lerp(mx + 80 * s, CX + V(250, 200), u), y = lerp(GY - 220 * s, GY + 20, u) - Math.sin(u * Math.PI) * 160, a = u * 8;
      const L = 90 * s; staff(g, x - Math.cos(a) * L, y - Math.sin(a) * L, x + Math.cos(a) * L, y + Math.sin(a) * L, 7 * s, { color: HOLY, dir: [0, -1] });
    }
  });
} });
function GY0() { return E.H * V(0.8, 0.68) - 200; }

// s28 — "Seketika, tongkat itu berubah menjadi"  flash: the staff hits the ground and transforms
registerShot('s28', { draw(g, t, info) {
  const [qx, qy] = shake(t, (1 - prog(t, 0, 0.8)) * 16, 30); g.translate(qx, qy);
  const cam = { z: 1.3, y: 120 };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0 });
  const grow = ease.out(prog(t, 0.3, 1.9));
  layer(g, cam, 1, (g) => {
    const s = V(1.6, 1.7);
    if (grow < 0.4) { const a = 1 - grow / 0.4; g.save(); g.globalAlpha = a; staff(g, CX - 120 * s, GY + 26, CX + 120 * s, GY + 6, 7 * s, null, HOLY); g.restore(); }
    if (grow > 0) serpent(g, CX + V(160, 120) * grow, GY - 10, V(0.6, 0.55) + V(1.0, 0.9) * grow, t, 1, '#c0ff9a');
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = 60 + t * 260; circle(g, CX + Math.cos(a) * r, GY - 30 + Math.sin(a) * r * 0.35, 40 * (1 - prog(t, 0, 1.5)), alpha('#d0d8f0', 0.25)); }
  });
  FX.rings(g, E.W / 2, E.H * V(0.7, 0.62), t, { count: 3, r0: 30, r1: V(700, 600), speed: 1.5, color: HOLY, a: 0.6 * (1 - prog(t, 0, 1.2)) });
  FX.speedLines(g, t, { cx: E.W / 2, cy: E.H * 0.62, count: 40, a: 0.3 * (1 - prog(t, 0, 0.8)) });
} });

// s29 — "ular besar yang bergerak cepat!"  the serpent writhes forward, Musa recoils
registerShot('s29', { draw(g, t, info) {
  const [qx, qy] = shake(t, 4, 18); g.translate(qx, qy);
  const cam = { z: 1.05, x: -40 * t };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0, holy: 0.3, holyAt: [E.W / 2, GY0()] });
  layer(g, cam, 1, (g) => {
    const back = ease.out(prog(t, 0.2, 1.0));
    person(g, { x: CX - V(260, 250) - back * 90, y: GY + 40, s: V(1.45, 1.5), facing: 1, outfit: MUSA, pose: posesAt(t, [[0, 'stand'], [0.25, 'fall'], [1.1, 'ready']]), expr: 'shocked', look: [1, 0.3], rim: { color: HOLY, dir: [1, -0.6], w: 5 } });
    serpent(g, CX + V(80, 60) - t * 60, GY + 40, V(1.7, 1.5), t * 1.6, -1, '#c0ff9a');
  });
  FX.dust(g, t, { count: 50, color: '#d8e0ff', a: 0.3, speed: 30 });
} });

// s30 — "Masukkan tanganmu ke dalam bajumu!"  hand into the robe
registerShot('s30', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.08 * k, x: -20, y: -60 };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0, holy: 0.45, holyAt: [E.W / 2 + V(360, 300), GY0()] });
  const into = { ...POSES.stand, eF: [22, -146], hF: [6, -150], head: [6, -206] };
  layer(g, cam, 1, (g) => person(g, { x: CX - V(40, 30), y: GY + 40, s: V(2.0, 2.1), facing: 1, outfit: MUSA, pose: breathe(posesAt(t, [[0, 'stand'], [0.9, into]], 0.5), t), expr: 'determined', look: [0.2, 0.5], rim: { color: HOLY, dir: [1, -0.5], w: 6 } }));
} });

// s31 — "Dan tangan itu keluar bersinar putih,"  insert: the shining hand
registerShot('s31', { draw(g, t, info) {
  blurLayer(g, 16, (g) => tur(g, t, { z: 1.6, x: 0, y: -100 }, { fire: 0 })); veil(g, '#02030c', 0.45);
  const out = ease.out(prog(t, 0.2, 1.0)), shine = ease.out(prog(info.globalT, wordTime('bersinar', 70) - 0.2, wordTime('bersinar', 70) + 0.5));
  const hx = E.W * 0.52, hy = lerp(E.H * 1.05, E.H * 0.48, out), s = V(1.5, 1.6);
  // sleeve + arm from the bottom
  seg(g, [[hx + 30 * s, hy + 60 * s], [hx + 120 * s, E.H + 200]], 120 * s, MUSA.color);
  seg(g, [[hx, hy], [hx + 30 * s, hy + 80 * s]], 70 * s, '#0a0708');
  const handC = `rgb(${Math.round(lerp(10, 255, shine))},${Math.round(lerp(7, 252, shine))},${Math.round(lerp(8, 240, shine))})`;
  if (shine > 0) { glow(g, hx, hy - 40 * s, 520 * shine, '#ffffff', 0.55); FX.godRays(g, hx, hy - 40 * s, { count: 16, angle: -Math.PI / 2, spread: Math.PI * 2, len: V(900, 1000), color: '#ffffff', a: 0.12 * shine, t }); }
  circle(g, hx, hy - 10 * s, 46 * s, handC);
  for (let i = 0; i < 4; i++) { const a = -2.0 + i * 0.28; seg(g, [[hx, hy - 20 * s], [hx + Math.cos(a) * 95 * s, hy - 20 * s + Math.sin(a) * 95 * s]], 18 * s, handC); }
  seg(g, [[hx + 20 * s, hy], [hx + 80 * s, hy - 50 * s]], 19 * s, handC);
  if (shine > 0) for (let i = 0; i < 10; i++) FX.sparkle(g, hx + Math.sin(i * 2.3) * 220, hy - 60 + Math.cos(i * 1.9) * 200, 18, '#ffffff', shine * Math.abs(Math.sin(t * 4 + i)));
} });

// s32 — "bukan karena penyakit."  calm, looking at the shining hand
registerShot('s32', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.05 * k, x: 20 * k, y: -50 };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0, holy: 0.35, holyAt: [E.W / 2 - V(320, 260), GY0()] });
  const s = V(2.0, 2.1), x = CX - V(30, 20), pose = { ...POSES.think, hF: [44, -200], eF: [34, -160] };
  layer(g, cam, 1, (g) => {
    person(g, { x, y: GY + 40, s, facing: 1, outfit: MUSA, pose: breathe(pose, t), expr: t > 0.6 ? 'smile' : 'awe', look: [0.6, -0.1], rim: { color: '#ffffff', dir: [1, -0.4], w: 6 } });
    const hx = x + 44 * s, hy = GY + 40 - 200 * s; glow(g, hx, hy, 220, '#ffffff', 0.5); circle(g, hx, hy, 11 * s, '#fffdf4'); FX.sparkle(g, hx, hy, 40, '#ffffff', 0.9);
  });
} });

// s33 — "Lalu datanglah perintah yang paling berat:"  alone in the valley, camera pulls out
registerShot('s33', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.3 - 0.28 * k, y: -40 * k };
  const { GY, CX, M } = tur(g, t, cam, { fire: 0, holy: 0.5, holyAt: [E.W / 2, E.H * V(0.8, 0.68) - 120] });
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + 20, s: V(0.6, 0.65), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'neutral', staff: true, rim: { color: HOLY, dir: [0, -1], w: 3 } }));
} });
