// shots/06_pharaoh.js — s39–s47: before Pharaoh, his arrogance, the magicians, the cliffhanger and the end screen.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, text, FONTS, wordTime, linGrad, rr } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { palace, city } from '../sets/egypt.js';
import { person, bigPerson, staff } from '../lib/_costume.js';
import { MUSA, HARUN, FIRAUN, PENYIHIR, PENJAGA } from '../cast.js';

const PURPLE = '#c07aff';
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;

// s39 — "Kini, Musa berdiri di hadapan Firaun."  the throne room
registerShot('s39', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), fs = V(1.25, 1.3), tx = E.W / 2 + V(330, 250);
  const cam = { z: 1.0 + 0.06 * k, x: -20 + 30 * k };
  const { GY, CX, M } = palace(g, t, cam, { throne: tx, throneK: fs, openX: -V(120, 80) });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 0.95, (g) => { for (const x of [tx + V(240, 190), tx - V(200, 170)]) person(g, { x, y: GY - 4, s: 1.0, facing: -1, outfit: PENJAGA, pose: breathe(POSES.stand, t, 1, x), expr: 'neutral', spear: true, rim }); });
  layer(g, cam, 1, (g) => {
    person(g, { x: tx - 6 * fs, y: GY - 78 * fs, s: fs, facing: -1, outfit: FIRAUN, pose: breathe(POSES.sit, t), expr: 'smirk', look: [-1, 0], rim, shadow: false });
    person(g, { x: CX - V(300, 260), y: GY + 30, s: V(1.3, 1.35), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'determined', staff: true, rim });
    person(g, { x: CX - V(430, 380), y: GY + 36, s: V(1.27, 1.32), facing: 1, outfit: HARUN, pose: breathe(POSES.stand, t, 1, 3), expr: 'determined', rim });
  });
  FX.dust(g, t, { count: 40, color: M.practical, a: 0.35 });
} });

// s40 — "Penguasa yang menyebut dirinya tuhan."  low angle, arms wide, giant statues behind
registerShot('s40', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.08 * k, y: -80 - 40 * k };
  const { GY, CX, M } = palace(g, t, cam, { mood: 'pharaoh' });
  layer(g, cam, 0.5, (g) => { for (const sx of [-1, 1]) person(g, { x: CX + sx * V(380, 300), y: GY - 10, s: V(5.2, 5.4), facing: -sx, outfit: FIRAUN, pose: POSES.stand, expr: 'neutral', dim: true, alpha: 0.55, rim: false, shadow: false }); veil(g, M.dark, 0.25); });
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + 30, s: V(2.2, 2.3), facing: 1, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'cheer']], 0.5), t), expr: 'smirk', look: [0.2, -0.3], rim: { color: M.rim, dir: [0, -1], w: 6 } }));
  glow(g, E.W / 2, E.H * 0.35, V(700, 700), S().ui.gold, 0.18);
  FX.dust(g, t, { count: 50, color: M.practical, a: 0.4 });
} });

// s41 — "Tapi Firaun menolak kebenaran."  he crosses his arms and turns away; Musa blurred in the foreground
registerShot('s41', { draw(g, t, info) {
  const cam = { z: 1.12, x: 20 * t };
  const { GY, CX, M } = palace(g, t, cam, { mood: 'pharaoh' });
  const turn = t > 0.9 ? 1 : -1;
  layer(g, cam, 1, (g) => person(g, { x: CX + V(170, 140), y: GY + 30, s: V(1.9, 2.0), facing: turn, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'shrug'], [0.6, 'crossArms']]), t), expr: 'angry', rim: { color: M.rim, dir: [-1, -0.4], w: 5 } }));
  blurLayer(g, 10, (g) => person(g, { x: CX - V(430, 330), y: E.H + V(100, 60), s: V(3.4, 3.2), facing: 1, outfit: MUSA, pose: POSES.stand, expr: 'determined', staff: true, rim: { color: '#ffd8a0', dir: [1, -0.3], w: 6 } }), { z: 1 }, 1.6);
} });

// s42 — "Dengan angkuh, ia mengumpulkan para penyihir terbaik"  Pharaoh points; the magicians enter
registerShot('s42', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.05 * k, x: -30 * k };
  const { GY, CX, M } = palace(g, t, cam, { mood: 'sorcery' });
  const rim = { color: M.rim, dir: [0, -1], w: 4 }, enter = wt('mengumpulkan', 97, info);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX + V(330, 290), y: GY + 30, s: V(1.6, 1.65), facing: -1, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'crossArms'], [enter, 'point']]), t), expr: 'smirk', rim: { color: '#ffb070', dir: [-1, -0.3], w: 5 } });
    for (let i = 0; i < 4; i++) {
      const tt = t - enter - i * 0.25; if (tt < -0.2) continue;
      const x = CX - V(700, 560) + Math.max(0, tt) * 170 + (3 - i) * V(150, 120);
      glow(g, x, GY - 120, 200, PURPLE, 0.25);
      person(g, { x, y: GY + 40 + (i % 2) * 10, s: V(1.35, 1.4), facing: 1, outfit: PENYIHIR, pose: walkPose(Math.max(0, tt) * Math.PI * 2 * 0.8 + i), expr: 'smirk', rim });
    }
  });
  FX.dust(g, t, { count: 60, color: PURPLE, a: 0.4, speed: -15 });
} });

// s43 — "di seluruh Mesir untuk mempermalukan Musa di depan rakyatnya!"  the arena before the people
registerShot('s43', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.07 * k };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  const rim = { color: M.rim, dir: [-1, -0.5], w: 4 };
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 4; i++) person(g, { x: CX + V(120, 80) + i * V(110, 90), y: GY + 70 + (i % 2) * 12, s: V(1.0, 1.05), facing: -1, outfit: PENYIHIR, pose: breathe(i % 2 ? POSES.crossArms : POSES.point, t, 1, i), expr: 'smirk', rim });
    person(g, { x: CX - V(260, 220), y: GY + 80, s: V(1.05, 1.1), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'determined', staff: true, rim });
    person(g, { x: CX - V(380, 330), y: GY + 86, s: V(1.02, 1.07), facing: 1, outfit: HARUN, pose: breathe(POSES.stand, t, 1, 2), expr: 'determined', rim });
  });
  FX.crowd(g, t, { y: E.H * V(0.86, 0.8), w: E.W, x: 0, rows: 7, rowH: V(26, 30), size: V(2.2, 2.4), color: '#1a1012', wave: 1, cheer: 0.4 });
  FX.dust(g, t, { count: 50, color: M.key, a: 0.35 });
} });

// s44 — "Tongkat melawan sihir."  split screen: glowing staff vs writhing sorcery ropes
registerShot('s44', { draw(g, t, info) {
  const W = E.W, H = E.H, vert = E.vertical, k = ease.inOut(t / info.dur);
  const gold = S().ui.gold;
  // half A (staff): left or top
  g.save(); g.beginPath(); vert ? g.rect(0, 0, W, H / 2) : g.rect(0, 0, W / 2, H); g.clip();
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#1a1206', '#3a2410', '#120a04']); g.fillRect(0, 0, W, H);
  const ax = vert ? W / 2 : W / 4, ay = vert ? H / 4 : H / 2;
  glow(g, ax, ay, V(500, 460), gold, 0.45); FX.godRays(g, ax, ay, { count: 12, angle: -Math.PI / 2, spread: Math.PI * 2, len: V(800, 700), color: gold, a: 0.08, t });
  g.save(); g.translate(ax, ay); g.rotate(-0.25 + 0.05 * Math.sin(t * 2)); staff(g, 0, V(300, 280), 0, -V(300, 280), V(22, 20), { color: '#fff0c0', dir: [0, -1] }, null); g.restore();
  text(g, 'TONGKAT', ax, ay + (vert ? H * 0.19 : H * 0.36), { size: V(60, 64), color: gold, glow: 24, glowColor: 'rgba(255,170,60,.8)', spacing: 6, alpha: ease.out(prog(t, 0.05, 0.4)) });
  g.restore();
  // half B (sorcery)
  g.save(); g.beginPath(); vert ? g.rect(0, H / 2, W, H / 2) : g.rect(W / 2, 0, W / 2, H); g.clip();
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#0c0418', '#2a0e46', '#0a0412']); g.fillRect(0, 0, W, H);
  const bx = vert ? W / 2 : W * 0.75, by = vert ? H * 0.75 : H / 2;
  glow(g, bx, by, V(500, 460), PURPLE, 0.4);
  for (let r = 0; r < 6; r++) { g.strokeStyle = r % 2 ? '#8a4ac0' : '#d8a0ff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 30, x = bx - V(260, 380) + u * V(520, 760), y = by - V(220, 200) + r * V(80, 70) + Math.sin(u * 9 + t * 7 + r) * 26; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  const sa = ease.out(prog(t, wt('sihir', 103, info) - 0.1, wt('sihir', 103, info) + 0.3));
  text(g, 'SIHIR', bx, by + (vert ? H * 0.19 : H * 0.36), { size: V(60, 64), color: '#e0b0ff', glow: 24, glowColor: 'rgba(190,100,255,.8)', spacing: 6, alpha: sa });
  g.restore();
  // divider flash
  g.save(); g.globalCompositeOperation = 'lighter'; if (vert) { g.fillStyle = linGrad(g, 0, H / 2 - 30, 0, H / 2 + 30, [alpha('#fff', 0), alpha('#fff', 0.7), alpha('#fff', 0)]); g.fillRect(0, H / 2 - 30, W, 60); } else { g.fillStyle = linGrad(g, W / 2 - 30, 0, W / 2 + 30, 0, [alpha('#fff', 0), alpha('#fff', 0.7), alpha('#fff', 0)]); g.fillRect(W / 2 - 30, 0, 60, H); } g.restore();
  g.translate(0, 0); veil(g, '#000', 0.0);
} });

// s45 — "Kebenaran melawan kesombongan."  face-off: Musa (white light) vs Pharaoh (red)
registerShot('s45', { draw(g, t, info) {
  const W = E.W, H = E.H, vert = E.vertical, push = 1 + 0.05 * t;
  const MP = mood('pharaoh');
  g.fillStyle = linGrad(g, 0, 0, 0, H, ['#2a0806', '#0a0408', '#0a1430']); g.fillRect(-W, -H, W * 3, H * 3);
  glow(g, vert ? W / 2 : W * 0.75, vert ? H * 0.27 : H / 2, V(700, 700), '#ff3a1a', 0.3);
  glow(g, vert ? W / 2 : W * 0.25, vert ? H * 0.73 : H / 2, V(700, 700), '#e8f0ff', 0.25);
  const r = V(250, 260) * push;
  bigPerson(g, vert ? W / 2 + 40 : W * 0.72, vert ? H * 0.28 : H * 0.55, r, { outfit: FIRAUN, expr: 'angry', look: vert ? [0, 0.6] : [-0.7, 0], rimColor: MP.rim, rimSide: 1 });
  bigPerson(g, vert ? W / 2 - 40 : W * 0.28, vert ? H * 0.76 : H * 0.55, r, { outfit: MUSA, expr: 'determined', look: vert ? [0, -0.6] : [0.7, 0], rimColor: '#e8f0ff', rimSide: -1 });
  const a1 = ease.out(prog(t, wt('Kebenaran', 105, info) - 0.1, wt('Kebenaran', 105, info) + 0.3)), a2 = ease.out(prog(t, wt('kesombongan', 106, info) - 0.1, wt('kesombongan', 106, info) + 0.3));
  text(g, 'KEBENARAN', W / 2, vert ? H * 0.95 : H * 0.88, { size: V(54, 58), color: '#e8f0ff', glow: 22, glowColor: 'rgba(160,200,255,.8)', spacing: 5, alpha: a1 });
  text(g, 'KESOMBONGAN', W / 2, vert ? H * 0.06 : H * 0.12, { size: V(54, 58), color: '#ff8a6a', glow: 22, glowColor: 'rgba(255,80,40,.8)', spacing: 5, alpha: a2 });
} });

// s46 — "Siapa yang akan menang?"  FREEZE: magicians' ropes hang mid-air
registerShot('s46', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.03 * t, r: 0.012 * t };
  const { GY, CX, M } = city(g, 0.5, cam, { mood: 'sorcery' });
  const rim = { color: '#bfe0ff', dir: [-1, -0.5], w: 4 };
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 3; i++) person(g, { x: CX + V(170, 130) + i * V(130, 100), y: GY + 70 + (i % 2) * 12, s: V(1.15, 1.2), facing: -1, outfit: PENYIHIR, pose: POSES.point, expr: 'smirk', rim });
    person(g, { x: CX - V(260, 230), y: GY + 80, s: V(1.2, 1.25), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t, 0.6), expr: 'determined', staff: true, staffGlow: S().ui.gold, rim: { color: '#fff0c0', dir: [1, -0.4], w: 5 } });
    for (let r = 0; r < 5; r++) { g.strokeStyle = r % 2 ? '#8a4ac0' : '#d8a0ff'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, x = CX + V(60, 40) - u * V(200, 160) + r * 30, y = GY - V(420, 520) + r * 60 + Math.sin(u * 8 + r) * 30 - Math.sin(u * Math.PI) * 60; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  });
  veil(g, '#0a1a40', 0.25);
  FX.drops(g, t * 0.1, { count: 40, color: '#cfe0ff', rMin: 3, rMax: 9 });
  FX.rings(g, E.W / 2, E.H * 0.45, t, { count: 3, r0: 60, r1: V(800, 700), speed: 0.3, color: '#cfe0ff', a: 0.3 });
  UI.bigLine(g, t, { str: 'SIAPA YANG AKAN MENANG?', dur: info.dur, y: E.H * V(0.16, 0.2), size: V(74, 70) });
} });

// s47 — "Saksikan di part berikutnya!"  end screen
registerShot('s47', { draw(g, t, info) {
  const ui = S().ui;
  UI.endScreen(g, t, { question: 'Bersambung…', cast: [], moodColors: ['#140a10', '#2a1418', '#4a2416'] });
  const a = ease.out(prog(t, 0.3, 0.9));
  text(g, 'PART 3', E.W / 2, V(460, 820), { size: V(110, 120), color: ui.gold, glow: 30, glowColor: 'rgba(255,140,40,.85)', spacing: 6, alpha: a });
  text(g, 'MUSA vs PARA PENYIHIR', E.W / 2, V(560, 940), { size: V(40, 44), color: ui.cream, spacing: 4, alpha: ease.out(prog(t, 0.6, 1.2)) });
  const n = 3, gap = V(220, 260), y0 = E.H - V(150, 400), cast = [HARUN, MUSA, FIRAUN];
  cast.forEach((of, i) => { const k = ease.out(prog(t, 0.4 + i * 0.12, 0.9 + i * 0.12)); person(g, { x: E.W / 2 + (i - 1) * gap, y: y0 + (1 - k) * 40, s: V(1.0, 1.25), facing: i === 2 ? -1 : 1, outfit: of, pose: breathe(i === 2 ? POSES.crossArms : POSES.relaxed, t, 1, i), expr: i === 2 ? 'smirk' : 'smile', staff: i === 1, alpha: k, rim: { color: '#ffb070', dir: [0, -1], w: 4 } }); });
} });
