// shots/yusuf2.js — Kisah Nabi Yusuf, Part 2 (z01–z30). The wife of the official is always shown modestly.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { palace, city } from '../sets/egypt.js';
import { person, bigPerson, flame, GOLD } from '../lib/_costume.js';
import { qamis, commentPrompt } from '../lib5/_yusuf.js';
import { qamisTorn, doorsCorridor, prison, cow, grabHand } from '../lib6/_y2.js';
import { YUSUF_KID, YUSUF, AZIZ, ISTRI_AZIZ, SAKSI, WANITA, PEMUDA, RAJA } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (txt, y, color, a, size = V(96, 100)) => text(g_, txt, E.W / 2, y, { size, color, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(color, 0.7), alpha: a });
let g_ = null;

// z01 — "Ingat baju Yusuf yang tidak robek itu?"
registerShot('z01', { draw(g, t, info) {
  g.fillStyle = '#060406'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.lightCone(g, E.W / 2, -50, { angle: Math.PI / 2, spread: 0.55, len: E.H * 1.1, color: '#ffe0b0', a: 0.22 });
  qamis(g, E.W / 2, E.H * 0.52, V(1.6, 1.8) * (1 + 0.04 * t), { blood: 1 });
  veil(g, '#2a1a10', 0.25);  // sepia memory
} });
// z02 — "Hari ini… sebuah baju kembali menjadi saksi."
registerShot('z02', { draw(g, t, info) {
  g.fillStyle = '#0a0806'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.godRays(g, E.W / 2, E.H * 0.45, { count: 14, angle: 0, spread: Math.PI * 2, len: E.H, color: '#ffe6b0', a: 0.08, t });
  qamisTorn(g, E.W / 2, E.H * 0.5, V(1.7, 1.9) * (1 + 0.03 * t), { tear: ease.out(prog(t, 0.5, 2.0)), glowC: GOLD() });
} });
// z03 — title card
registerShot('z03', { draw(g, t, info) {
  blurBg(g, (g) => palace(g, t, { z: 1.25 }, {}), 12, 0.45, '#0a0604');
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI YUSUF', 'PART 2'], dur: info.dur + 0.5, y: E.H * 0.46 });
} });
// z04 — "Yusuf dibawa ke Mesir dan dibeli oleh seorang pejabat tinggi kerajaan."
registerShot('z04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.05 * k, x: 20 * k };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  const rim = { color: M.rim, dir: [-1, -0.4], w: 4 }, s = V(1.5, 1.55), pay = wt('dibeli', 8, info);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX + V(250, 210), y: GY + 50, s, facing: -1, outfit: AZIZ, pose: breathe(posesAt(t, [[0, 'crossArms'], [pay, POSES.holdFront]]), t), expr: 'smile', rim });
    person(g, { x: CX - V(260, 220), y: GY + 50, s, facing: 1, outfit: { top: 'dress', color: '#5a4a34', head: 'hood', headColor: '#d8b878' }, pose: breathe(POSES.holdFront, t, 1, 2), expr: 'smirk', rim });
    person(g, { x: CX - V(20, 10), y: GY + 56, s: s * 0.95, facing: 1, outfit: YUSUF_KID, pose: breathe(POSES.sad, t, 1, 3), expr: 'worried', look: [1, -0.3], rim });
    for (let i = 0; i < 3; i++) { const u = clamp((t - pay - 0.3 - i * 0.3) / 0.5); if (u <= 0 || u >= 1) continue; const x = lerp(CX + V(200, 170), CX - V(190, 160), u); circle(g, x, GY - 150 * s - Math.sin(u * Math.PI) * 60, 12, GOLD()); }
  });
} });
// z05 — "Bertahun-tahun berlalu."  the boy grows into a young man
registerShot('z05', { draw(g, t, info) {
  const grow = ease.inOut(prog(t, 0.2, 1.6)), cam = { z: 1.1 };
  const { GY, CX, M } = palace(g, t * 6, cam, {});
  veil(g, '#000010', 0.4 * Math.abs(Math.sin(t * 4)));
  layer(g, cam, 1, (g) => {
    if (grow < 1) person(g, { x: CX, y: GY + 40, s: V(1.8, 1.9), facing: 1, outfit: YUSUF_KID, pose: breathe(POSES.stand, t), expr: 'neutral', alpha: 1 - grow, rim: { color: M.rim, dir: [0, -1], w: 5 } });
    if (grow > 0) person(g, { x: CX, y: GY + 40, s: V(1.8, 1.9), facing: 1, outfit: YUSUF, pose: breathe(POSES.stand, t), expr: 'smile', alpha: grow, rim: { color: M.rim, dir: [0, -1], w: 5 } });
  });
  FX.sun(g, E.W - V(110, 110) + Math.cos(t * 9) * 30, V(110, 200) + Math.sin(t * 9) * 30, 10, '#fff3dc', '#ffc47a', 3);
} });
// z06 — "Yusuf tumbuh menjadi pemuda yang tampan dan bijaksana."
registerShot('z06', { draw(g, t, info) {
  const M = mood('interiorWarm');
  blurBg(g, (g) => palace(g, t, { z: 1.5, y: -100 }, {}), 14, 0.3);
  glow(g, E.W / 2, E.H * 0.45, V(600, 600), GOLD(), 0.2);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.03 * t), { outfit: YUSUF, expr: 'smile', look: [0.2, -0.1], rimColor: HOLY, rimSide: -1, blink: (t % 3.2) > 3.1 });
  for (let i = 0; i < 8; i++) FX.sparkle(g, E.W / 2 + Math.sin(i * 2.3) * 380, E.H * 0.5 + Math.cos(i * 1.7) * 380, 18, '#fff4c0', 0.6 * Math.abs(Math.sin(t * 3 + i)));
} });
// z07 — "Tapi di sinilah ujian berikutnya datang."
registerShot('z07', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.08 * k };
  const { GY, CX, M } = doorsCorridor(g, t, cam, {});
  veil(g, '#1a0010', 0.25 * k);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(200, 180), y: GY + 40, s: V(1.6, 1.65), facing: 1, outfit: YUSUF, pose: breathe(POSES.stand, t), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.3], w: 5 } });
    person(g, { x: CX + V(340, 300), y: GY + 20, s: V(1.4, 1.45), facing: -1, outfit: ISTRI_AZIZ, pose: breathe(POSES.crossArms, t), expr: 'smirk', dim: true, alpha: 0.85, rim: { color: '#c0306a', dir: [-1, -0.3], w: 4 } });
  });
} });
// z08 — "Istri pejabat itu tergoda, dan mengajak Yusuf berbuat maksiat."  doors close one by one; Yusuf backs away
registerShot('z08', { draw(g, t, info) {
  const cam = { z: 1.08, x: -20 * t };
  const { GY, CX, M } = doorsCorridor(g, t, cam, { closed: (i) => ease.inOut(clamp((t - 0.3 - (i + 3) * 0.35) / 0.4)) });
  veil(g, '#1a0010', 0.3);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(160, 140) - t * 30, y: GY + 40, s: V(1.6, 1.65), facing: 1, outfit: YUSUF, pose: breathe(posesAt(t, [[0, 'stand'], [1.4, { ...POSES.crossArms }]]), t), expr: 'worried', rim: { color: M.rim, dir: [1, -0.3], w: 5 } });
    person(g, { x: CX + V(260, 220), y: GY + 40, s: V(1.55, 1.6), facing: -1, outfit: ISTRI_AZIZ, pose: breathe(POSES.wave, t), expr: 'smile', rim: { color: '#c0306a', dir: [-1, -0.3], w: 4 } });
  });
} });
// z09 — "Yusuf menolak tegas: Aku berlindung kepada Allah!"
registerShot('z09', { draw(g, t, info) {
  blurBg(g, (g) => doorsCorridor(g, t, { z: 1.5, y: -80 }, { closed: () => 1 }), 14, 0.4, '#0a0006');
  const up = ease.out(prog(t, wt('"Aku', 26, info) - 0.2, wt('"Aku', 26, info) + 0.6));
  FX.godRays(g, E.W / 2, -E.H * 0.1, { count: 9, angle: Math.PI / 2, spread: 0.6, len: E.H * 1.3, color: HOLY, a: 0.1 * up, t });
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: YUSUF, expr: 'determined', face: { brows: null }, talk: t > wt('"Aku', 26, info) ? Math.max(0, 0.4 * Math.sin(t * 12)) : 0, rimColor: up > 0.3 ? HOLY : '#c0306a', rimSide: -1 });
} });
// z10 — "lalu berlari ke pintu."
registerShot('z10', { draw(g, t, info) {
  const s = V(1.6, 1.65), cam = { z: 1.08, x: t * 380 };
  const { GY, CX, M } = doorsCorridor(g, t, cam, { closed: () => 1 });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(100, 80) + t * 420, y: GY + 40, s, facing: 1, outfit: YUSUF, pose: walkPose(t * Math.PI * 2 * 1.6, { run: true }), expr: 'determined', trail: { count: 3, dx: -36, a: 0.15 }, rim: { color: M.rim, dir: [1, -0.3], w: 5 } }));
  FX.speedLines(g, t, { count: 40, a: 0.2 });
} });
// z11 — "Perempuan itu menarik bajunya… hingga robek dari belakang."  insert, slow motion
registerShot('z11', { draw(g, t, info) {
  blurBg(g, (g) => doorsCorridor(g, t, { z: 1.6 }, { closed: () => 1 }), 16, 0.5, '#0a0006');
  const rip = ease.out(prog(t, wt('robek', 32, info) - 0.3, wt('robek', 32, info) + 0.6));
  const pull = ease.inOut(prog(t, 0.2, 1.2));
  g.save(); g.translate(lerp(0, 40, pull), 0); qamisTorn(g, E.W * 0.58, E.H * 0.48, V(1.9, 2.1), { tear: rip, rot: 0.04 }); g.restore();
  grabHand(g, E.W * 0.5 - (1 - pull) * 120 + lerp(0, 40, pull), E.H * 0.48 + V(1.9, 2.1) * 130, V(2.4, 2.6), pull > 0.4, ISTRI_AZIZ.headColor);
  if (rip > 0 && rip < 1) for (let i = 0; i < 10; i++) circle(g, E.W * 0.58 + Math.sin(i * 3) * 60, E.H * 0.62 - i * 30, 4, alpha('#f2ecdc', 0.8 * (1 - rip)));
  FX.speedLines(g, t, { cx: E.W * 0.58, cy: E.H * 0.5, count: 30, a: 0.15 * rip });
} });
// z12 — "Tepat saat itu, sang suami muncul."
registerShot('z12', { draw(g, t, info) {
  const k = ease.out(prog(t, 0.1, 0.9)), cam = { z: 1.12 };
  const { GY, CX, M } = doorsCorridor(g, t, cam, { closed: (i) => (i === 0 ? 1 - k : 1) });
  layer(g, cam, 1, (g) => {
    glow(g, CX, GY - 250, 360 * k, '#ffe0a0', 0.5);
    person(g, { x: CX, y: GY - 10, s: V(1.7, 1.8), facing: 1, outfit: AZIZ, pose: breathe(POSES.crossArms, t), expr: 'shocked', alpha: k, rim: { color: '#ffe0a0', dir: [0, -1], w: 6 } });
    person(g, { x: CX - V(330, 280), y: GY + 60, s: V(1.6, 1.65), facing: 1, outfit: YUSUF, pose: POSES.stand, expr: 'surprised', rim: { color: M.rim, dir: [1, -0.3], w: 5 } });
    person(g, { x: CX + V(330, 280), y: GY + 60, s: V(1.55, 1.6), facing: -1, outfit: ISTRI_AZIZ, pose: POSES.handsOnHead, expr: 'scared', rim: { color: '#c0306a', dir: [-1, -0.3], w: 4 } });
  });
} });
// z13 — "Dan Yusuf langsung difitnah!"
registerShot('z13', { draw(g, t, info) {
  const cam = { z: 1.18, x: -30 * t };
  const { GY, CX, M } = doorsCorridor(g, t, cam, { mood: 'pharaoh', closed: () => 1 });
  veil(g, '#300000', 0.3);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(280, 240), y: GY + 60, s: V(1.6, 1.65), facing: 1, outfit: YUSUF, pose: breathe(POSES.shrug, t), expr: 'shocked', rim: { color: '#ff6a4a', dir: [1, -0.3], w: 5 } });
    person(g, { x: CX + V(60, 40), y: GY + 50, s: V(1.6, 1.65), facing: -1, outfit: AZIZ, pose: breathe(POSES.crossArms, t), expr: 'angry', rim: { color: '#ff6a4a', dir: [-1, -0.3], w: 5 } });
    person(g, { x: CX + V(330, 280), y: GY + 60, s: V(1.55, 1.6), facing: -1, outfit: ISTRI_AZIZ, pose: breathe(POSES.point, t), expr: 'angry', rim: { color: '#ff6a4a', dir: [-1, -0.3], w: 4 } });
  });
} });
// z14/z15 — the witness's test, as a blueprint diagram
function witness(g, t, info, side) {
  UI.blueprint(g, {});
  const ui = S().ui, bp = ui.blueprint, front = side === 'front';
  person(g, { x: E.W * 0.2, y: E.H * V(0.92, 0.9), s: V(1.2, 1.3), facing: 1, outfit: SAKSI, pose: breathe(POSES.explain, t), expr: 'thinking', talk: Math.max(0, 0.35 * Math.sin(t * 11)), rim: { color: bp, dir: [1, -0.4], w: 4 } });
  const a = ease.out(prog(t, 0.2, 0.8));
  g.save(); g.globalAlpha = a; qamisTorn(g, E.W * 0.55, E.H * 0.42, V(1.5, 1.7), { line: bp, front, tear: ease.out(prog(t, 0.4, 1.4)) }); g.restore();
  text(g, front ? 'ROBEK DI DEPAN' : 'ROBEK DI BELAKANG', E.W * 0.55, E.H * V(0.13, 0.17), { size: V(54, 60), color: ui.cream, font: FONTS.title, spacing: 3, alpha: a });
  const v = ease.outBack(prog(t, front ? wt('bersalah.', 43, info) - 0.2 : wt('berdusta."', 47, info) - 0.3, (front ? wt('bersalah.', 43, info) : wt('berdusta."', 47, info)) + 0.3));
  if (v > 0) text(g, front ? '= YUSUF BERSALAH' : '= DIA BERDUSTA', E.W * 0.55, E.H * V(0.75, 0.7), { size: V(66, 72) * v, color: front ? ui.accent : ui.good, font: FONTS.title, glow: 20, glowColor: alpha(front ? ui.accent : ui.good, 0.6), spacing: 2 });
}
registerShot('z14', { draw(g, t, info) { witness(g, t, info, 'front'); } });
registerShot('z15', { draw(g, t, info) { witness(g, t, info, 'back'); } });
// z16 — "Dan bajunya… robek dari belakang."
registerShot('z16', { draw(g, t, info) {
  const M = mood('interiorWarm');
  blurBg(g, (g) => doorsCorridor(g, t, { z: 1.4 }, { closed: () => 1 }), 12, 0.45, '#0a0604');
  const rev = ease.out(prog(t, wt('robek', 49, info) - 0.2, wt('robek', 49, info) + 0.4));
  FX.godRays(g, E.W / 2, E.H * 0.45, { count: 14, angle: 0, spread: Math.PI * 2, len: E.H, color: '#ffe6b0', a: 0.1 * rev, t });
  qamisTorn(g, E.W / 2, E.H * 0.46, V(1.8, 2.0) * (1 + 0.04 * t), { tear: 1, glowC: rev > 0 ? GOLD() : null });
  for (const sx of [-1, 1]) seg(g, [[E.W / 2 + sx * V(250, 280), E.H * 1.1], [E.W / 2 + sx * V(240, 270), E.H * 0.36]], 26, S().ink);
  if (rev > 0) { g_ = g; big('ROBEK DARI', E.H * V(0.8, 0.78), '#ffffff', rev, V(80, 84)); big('BELAKANG!', E.H * V(0.8, 0.78) + V(90, 96), GOLD(), rev); }
} });
// z17 — "Kabar itu menyebar."  whispers
registerShot('z17', { draw(g, t, info) {
  const cam = { z: 1.12, x: 20 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 4; i++) { const x = CX - V(420, 360) + i * V(280, 240); person(g, { x, y: GY + 60 + (i % 2) * 14, s: V(1.4, 1.45), facing: i % 2 ? -1 : 1, outfit: WANITA[i], pose: breathe(i % 2 ? POSES.talk : POSES.think, t, 1, i), expr: i % 2 ? 'smirk' : 'surprised', talk: i % 2 ? Math.max(0, 0.4 * Math.sin(t * 12 + i)) : 0, rim: { color: M.rim, dir: [0, -1], w: 4 } }); if (i % 2) FX.rings(g, x - 20, GY + 60 - 230, t, { count: 2, r0: 20, r1: 120, speed: 1.5, color: '#ffe6c0', a: 0.4 }); } });
} });
// banquet table + seated women (shared by z18/z19)
function banquet(g, t, cam, info, stun) {
  const { GY, CX, M } = palace(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 4; i++) { const x = CX - V(450, 380) + i * V(300, 250); person(g, { x, y: GY + 20, s: V(1.25, 1.3), facing: 1, outfit: WANITA[i], pose: breathe(stun > 0.5 ? { ...POSES.sit, eF: [30, -140], hF: [50, -150] } : POSES.sit, t, 1, i), expr: stun > 0.5 ? 'awe' : 'smile', look: stun > 0.5 ? [1, -0.4] : [0, 0], rim: { color: M.rim, dir: [0, -1], w: 4 } }); }
    rr(g, -E.W * 0.2, GY - 40, E.W * 1.4, 26, 8); g.fillStyle = '#3a2416'; g.fill(); g.fillStyle = '#2a180e'; g.fillRect(-E.W * 0.2, GY - 14, E.W * 1.4, 160);
    for (let i = 0; i < 6; i++) { const x = CX - V(520, 440) + i * V(210, 175); circle(g, x, GY - 58, 22, i % 2 ? '#f0a030' : '#e8c040'); const k = stun > 0.5 && i % 2 === 0 ? 0.6 : 0; seg(g, [[x + 30, GY - 46], [x + 80, GY - 70 + k * 40]], 6, '#d8e0f0'); FX.sparkle(g, x + 80, GY - 70, 12, '#ffffff', 0.7 * Math.abs(Math.sin(t * 4 + i))); }
  });
  return { GY, CX, M };
}
// z18 — "Para perempuan Mesir diundang ke jamuan, dan diberi pisau."
registerShot('z18', { draw(g, t, info) { const k = ease.inOut(t / info.dur); banquet(g, t, { z: 1.04 + 0.06 * k, y: 20 }, info, 0); } });
// z19 — "Saat Yusuf muncul, mereka begitu terpukau hingga melukai tangan sendiri."
registerShot('z19', { draw(g, t, info) {
  const enter = ease.out(prog(t, 0, 1.0)), cam = { z: 1.06, x: V(120, 100) };
  const { GY, CX } = banquet(g, t, cam, info, t > 0.8 ? 1 : 0);
  layer(g, cam, 0.95, (g) => { glow(g, CX + V(420, 350), GY - 250, 420, HOLY, 0.5 * enter); person(g, { x: CX + V(420, 350), y: GY - 30, s: V(1.5, 1.55), facing: -1, outfit: YUSUF, pose: breathe(POSES.stand, t), expr: 'neutral', alpha: enter, rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
  const cut = wt('melukai', 60, info); if (t > cut) for (let i = 0; i < 3; i++) circle(g, E.W * (0.25 + i * 0.22), E.H * V(0.76, 0.66) + (t - cut) * 40, 5, '#c81e1e');
} });
// z20 — "Tekanan terus datang."  pointing hands close in
registerShot('z20', { draw(g, t, info) {
  g.fillStyle = '#0a0408'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const k = ease.inOut(t / info.dur), cx = E.W / 2, cy = E.H * 0.55;
  glow(g, cx, cy - 120, 300, '#c0306a', 0.25);
  person(g, { x: cx, y: cy + 160, s: V(1.6, 1.7), facing: 1, outfit: YUSUF, pose: breathe(POSES.sad, t), expr: 'worried', rim: { color: '#c0306a', dir: [0, -1], w: 5 } });
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = Math.max(E.W, E.H), r1 = lerp(r0 * 0.75, r0 * 0.42, k), x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1; seg(g, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [x1, y1]], 40, S().ink); seg(g, [[x1, y1], [x1 - Math.cos(a) * 70, y1 - Math.sin(a) * 70]], 14, S().ink); circle(g, x1, y1, 26, S().ink); }
} });
// z21 — "Yusuf pun berdoa: Ya Tuhanku, penjara lebih aku sukai."
registerShot('z21', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.06 * k };
  const { GY, CX } = prison(g, t, cam, {});
  layer(g, cam, 1, (g) => { glow(g, CX - V(40, 30), GY - 180, 360 * k, HOLY, 0.4); person(g, { x: CX - V(40, 30), y: GY + 40, s: V(1.8, 1.9), facing: 1, outfit: YUSUF, pose: breathe({ ...POSES.kneel, eF: [26, -150], hF: [40, -180], eB: [18, -148], hB: [32, -178] }, t), expr: 'sleepy', rim: { color: HOLY, dir: [1, -0.6], w: 5 } }); });
} });
// z22 — "Kalau kamu di posisi Yusuf, sanggupkah kamu memilih hal yang sama? Tulis di komentar."
registerShot('z22', { draw(g, t, info) {
  blurBg(g, (g) => prison(g, t, { z: 1.4 }, {}), 16, 0.55, '#02030a');
  commentPrompt(g, t, ['KALAU KAMU JADI YUSUF…', 'SANGGUPKAH KAMU', 'MEMILIH HAL YANG SAMA?'], { y: E.H * V(0.3, 0.33) });
} });
// z23 — "Di penjara, Yusuf menafsirkan mimpi dua pemuda."  dream bubbles: wine cup / bread & birds
registerShot('z23', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.05 * k };
  const { GY, CX } = prison(g, t, cam, {});
  const rim = { color: '#9ab8ff', dir: [1, -0.6], w: 4 }, s = V(1.4, 1.45);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(260, 230), y: GY + 40, s, facing: 1, outfit: YUSUF, pose: breathe(posesAt(t, [[0, 'sit'], [1.2, { ...POSES.sit, eF: [30, -130], hF: [56, -150] }]]), t), expr: 'smile', talk: t > 1.2 ? Math.max(0, 0.3 * Math.sin(t * 11)) : 0, rim });
    for (let i = 0; i < 2; i++) person(g, { x: CX + V(110, 90) + i * V(230, 200), y: GY + 46, s, facing: -1, outfit: PEMUDA[i], pose: breathe(POSES.sit, t, 1, i + 2), expr: 'thinking', rim });
    const a = ease.outBack(prog(t, 0.3, 0.9));
    for (let i = 0; i < 2; i++) { const bx = CX + V(110, 90) + i * V(230, 200), by = GY - V(420, 450); g.save(); g.translate(bx, by); g.scale(a, a); circle(g, 0, 0, 80, alpha('#ffffff', 0.9)); circle(g, -40, 100, 14, alpha('#ffffff', 0.9)); circle(g, -55, 135, 8, alpha('#ffffff', 0.9));
      if (i === 0) { for (let k2 = 0; k2 < 6; k2++) circle(g, -12 + (k2 % 3) * 12, -20 + Math.floor(k2 / 3) * 14, 8, '#6a2a8a'); rr(g, -14, 12, 28, 30, 6); g.fillStyle = '#c8a040'; g.fill(); }
      else { rr(g, -40, 0, 80, 34, 10); g.fillStyle = '#c8904a'; g.fill(); for (let k2 = 0; k2 < 2; k2++) { const bxx = -20 + k2 * 40, byy = -30 + Math.sin(t * 8 + k2) * 6; seg(g, [[bxx - 14, byy], [bxx, byy + 6], [bxx + 14, byy]], 5, '#222'); } }
      g.restore(); }
  });
} });
// z24 — "Dan semuanya terjadi persis seperti katanya."  one is released into the light
registerShot('z24', { draw(g, t, info) {
  const cam = { z: 1.08 };
  const { GY, CX } = prison(g, t, cam, { winX: -V(300, 260) });
  const open = ease.out(prog(t, 0.2, 1.0)), walk = clamp((t - 0.8) / 2);
  layer(g, cam, 1, (g) => {
    const dx = CX + V(300, 260); g.fillStyle = linGrad(g, 0, GY - 420, 0, GY, ['#fff0c0', '#ffd08a']); g.globalAlpha = open; g.fillRect(dx - 110, GY - 420, 220, 420); g.globalAlpha = 1; glow(g, dx, GY - 200, 400 * open, '#fff0c0', 0.5);
    person(g, { x: lerp(CX, dx, walk), y: GY + 40, s: V(1.45, 1.5), facing: 1, outfit: PEMUDA[0], pose: walk > 0 && walk < 1 ? walkPose(t * 5) : POSES.cheer, expr: 'happy', rim: { color: '#fff0c0', dir: [1, -0.3], w: 5 } });
    person(g, { x: CX - V(300, 260), y: GY + 40, s: V(1.45, 1.5), facing: 1, outfit: YUSUF, pose: breathe(POSES.relaxed, t), expr: 'smile', rim: { color: '#9ab8ff', dir: [0, -1], w: 4 } });
  });
} });
// z25 — "Ingatlah aku di hadapan rajamu," pesannya kepada yang dibebaskan.
registerShot('z25', { draw(g, t, info) {
  const cam = { z: 1.2, x: -V(80, 60) };
  const { GY, CX } = prison(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(60, 40), y: GY + 40, s: V(1.9, 2.0), facing: 1, outfit: YUSUF, pose: breathe(POSES.reach, t), expr: 'smile', talk: t < 2 ? Math.max(0, 0.4 * Math.sin(t * 12)) : 0, rim: { color: '#9ab8ff', dir: [1, -0.4], w: 5 } });
    for (let i = 0; i < 6; i++) seg(g, [[CX + V(80, 70) + i * 60, GY - 700], [CX + V(80, 70) + i * 60, GY + 60]], 14, '#0a0a12');
    seg(g, [[CX + V(60, 50), GY - 640], [CX + V(440, 400), GY - 640]], 16, '#0a0a12');
  });
  FX.rings(g, E.W / 2 - V(40, 30), E.H * 0.42, t, { count: 2, r0: 30, r1: 200, speed: 1.4, color: '#e8f0ff', a: 0.4 });
} });
// z26 — "Tapi orang itu lupa…"
registerShot('z26', { draw(g, t, info) {
  const cam = { z: 1.15 };
  const { GY, CX, M } = palace(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(60, 40), y: GY + 40, s: V(1.7, 1.8), facing: 1, outfit: PEMUDA[0], pose: breathe(POSES.holdFront, t), expr: 'smile', rim: { color: M.rim, dir: [0, -1], w: 5 } });
    const bub = 1 - ease.in(prog(t, 0.4, 1.2)); if (bub > 0) { const bx = CX + V(160, 140), by = GY - V(520, 560); g.save(); g.globalAlpha = bub; circle(g, bx, by, 90 * (1 + (1 - bub) * 0.6), alpha('#ffffff', 0.85)); person(g, { x: bx, y: by + 60, s: 0.45, facing: 1, outfit: YUSUF, pose: POSES.stand, expr: 'smile', shadow: false }); g.restore(); }
  });
} });
// z27 — "dan Yusuf tetap di penjara, bertahun-tahun lamanya."  time lapse with tally marks
registerShot('z27', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 - 0.06 * k };
  const { GY, CX } = prison(g, t, cam, { beam: Math.sin(t * 4) * 0.5, tally: Math.floor(k * 30) });
  layer(g, cam, 1, (g) => person(g, { x: CX + V(60, 40), y: GY + 40, s: V(1.6, 1.7), facing: -1, outfit: YUSUF, pose: breathe({ ...POSES.sit, eF: [30, -110], hF: [40, -86], head: [10, -172] }, t), expr: 'sad', rim: { color: '#9ab8ff', dir: [0, -1], w: 4 } }));
  veil(g, '#000010', 0.3 * Math.abs(Math.sin(t * 4)));
} });
// z28 — "Sampai suatu malam, Raja Mesir bermimpi aneh:"
registerShot('z28', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.08 * k };
  const { GY, CX } = palace(g, t, cam, { mood: 'night' });
  veil(g, '#00041a', 0.35);
  layer(g, cam, 1, (g) => { FX.bed(g, { x: CX - V(260, 230), y: GY + 30, w: V(520, 460), color: '#2c4f9e', frame: '#3a2416' }); person(g, { x: CX - V(20, 10), y: GY - 40, s: V(1.4, 1.45), rot: -Math.PI / 2, facing: 1, outfit: RAJA, pose: POSES.lie, expr: t % 1 < 0.5 ? 'worried' : 'scared', rim: { color: '#9ab8ff', dir: [0, -1], w: 4 }, shadow: false }); });
  const d = ease.out(prog(t, 1.0, 2.6)); glow(g, E.W / 2, E.H * 0.35, V(500, 520) * d, '#c8a0ff', 0.4 * d);
} });
// z29 — "tujuh sapi gemuk dimakan oleh tujuh sapi kurus."
registerShot('z29', { draw(g, t, info) {
  const W = E.W, H = E.H; g.fillStyle = linGrad(g, 0, 0, 0, H, ['#0a0420', '#2a1050', '#4a2060']); g.fillRect(-W, -H, W * 3, H * 3);
  FX.stars(g, t, { count: 120, area: [0, 0, W, H * 0.5] });
  g.fillStyle = alpha('#2a6aa0', 0.5); g.fillRect(-W, H * 0.78, W * 3, 40);   // the Nile
  const thinIn = wt('kurus.', 98, info), eat = ease.inOut(prog(t, wt('dimakan', 97, info), thinIn + 0.6));
  for (let i = 0; i < 7; i++) { const x = W * 0.08 + i * W * 0.14 + (i % 2) * 20, y = H * V(0.62, 0.58) + (i % 2) * 40; if (t > wt('tujuh', 96, info) + i * 0.12) cow(g, x - eat * 60, y, V(0.55, 0.6) * (1 - eat * 0.9), 1, t, 1, { rim: '#ffe6c0' }); }
  for (let i = 0; i < 7; i++) { const x = W * 1.2 - (t - wt('dimakan', 97, info)) * W * 0.45 + i * W * 0.14, y = H * V(0.66, 0.62) + (i % 2) * 40; if (x < W * 1.1) cow(g, x, y, V(0.6, 0.65), -1, t * 1.5, 0, { rim: '#ff6a4a' }); }
  const c = Math.min(7, Math.floor((t - wt('tujuh', 96, info)) / 0.12) + 1); if (t > wt('tujuh', 96, info) && t < thinIn) UI.badge(g, { str: String(c), x: W - V(90, 90), y: V(110, 170), size: V(70, 80) });
} });
// z30 — "Menurutmu, apa artinya? Tulis tebakanmu di komentar!"
registerShot('z30', { draw(g, t, info) {
  blurBg(g, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0420', '#2a1050']); g.fillRect(0, 0, E.W, E.H); for (let i = 0; i < 4; i++) cow(g, E.W * (0.15 + i * 0.24), E.H * 0.8, 0.7, i % 2 ? -1 : 1, t, i % 2 ? 0 : 1); }, 12, 0.4, '#04020a');
  commentPrompt(g, t, ['7 SAPI GEMUK…', '7 SAPI KURUS…', 'APA ARTINYA?'], { y: E.H * V(0.24, 0.27) });
  const a = ease.out(prog(t, 1.4, 2.0));
  text(g, 'BERSAMBUNG KE PART 3', E.W / 2, E.H * V(0.86, 0.86), { size: V(56, 58), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', spacing: 3, alpha: a });
} });
