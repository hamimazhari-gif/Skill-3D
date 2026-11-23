// shots/yunus1.js — Kisah Nabi Yunus, Part 1 (u01–u17).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { city as egyptCity } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { shore, waterSurface } from '../sets/sea.js';
import { person, bigPerson, flame, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { underwater, bigFish, fishInside, idol, ship } from '../lib8/_sea.js';
import { YUNUS, NINAWA } from '../cast.js';

const city = (g, t, cam, o = {}) => egyptCity(g, t, cam, { ...o, noEgypt: true });
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff4a3a';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const crowd = (g, x0, dx, y, s, t, o = {}) => NINAWA.slice(0, o.n || 6).forEach((of, i) => person(g, { x: x0 + i * dx + (i % 2) * 14, y: y + (i % 2) * 14, s, facing: o.facing ? o.facing(i) : -1, outfit: of, pose: breathe(o.pose ? o.pose(i) : POSES.stand, t, 1.5, i), expr: o.expr ? o.expr(i) : 'neutral', talk: o.talk ? Math.max(0, 0.5 * Math.sin(t * 12 + i)) : 0, rim: o.rim }));

// u01 — "Pernahkah kamu membayangkan… hidup di dalam perut ikan raksasa?"
registerShot('u01', { draw(g, t, info) {
  underwater(g, t, 0.3 + 0.1 * t / info.dur);
  bigFish(g, lerp(E.W * 1.6, -E.W * 0.6, t / info.dur), E.H * 0.5, V(1.3, 1.2), -1, t, { rim: '#4a8ac8' });
} });
// u02 — "Gelap. Sempit. Di dasar lautan."
registerShot('u02', { draw(g, t, info) {
  fishInside(g, t, 0.4);
  person(g, { x: E.W / 2, y: E.H * 0.86, s: V(1.1, 1.2), facing: 1, outfit: { top: 'dress', color: '#120a0a' }, pose: breathe(POSES.sad, t), expr: 'sad', dim: true, rim: { color: '#6a3a3a', dir: [0, -1], w: 3 } });
  [['GELAP.', 'Gelap.', 5], ['SEMPIT.', 'Sempit.', 6], ['DI DASAR LAUTAN.', 'lautan.', 7]].forEach(([s, w, af], i) => { const a = ease.out(prog(t, wt(w, af, info) - 0.2, wt(w, af, info) + 0.2)); text(g, s, E.W / 2, E.H * V(0.22, 0.22) + i * V(90, 100), { size: V(80, 84), color: i === 2 ? '#9ad0ff' : '#ffffff', font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: a }); });
} });
// u03 — "Ini kisah nyata. Kisah seorang nabi… Yunus bin Matta AS."
registerShot('u03', { draw(g, t, info) {
  blurBg(g, (g) => shore(g, t, { z: 1.2 }, { mood: 'dusk' }), 12, 0.4, '#04020a');
  const a = ease.outBack(prog(t, wt('Yunus', 12, info) - 0.2, wt('Yunus', 12, info) + 0.3));
  text(g, 'INI KISAH NYATA', E.W / 2, E.H * 0.3, { size: V(56, 60), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.5)) * (1 - a) });
  big(g, 'YUNUS', E.H * 0.44, GOLD(), a, V(190, 200));
  text(g, 'KISAH NABI YUNUS • PART 1', E.W / 2, E.H * 0.44 + V(140, 150), { size: V(44, 48), color: '#ffffff', font: FONTS.title, stroke: 8, strokeColor: '#000', spacing: 4, alpha: a });
} });
// u04 — "Allah mengutusnya ke negeri Ninawa."
registerShot('u04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.08 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(380, 330) + t * 80, y: GY + 50, s: V(1.4, 1.45), facing: 1, outfit: YUNUS, pose: walkPose(t * 5), expr: 'determined', staff: true, rim: { color: '#ffc890', dir: [-1, -0.4], w: 4 } }));
  big(g, 'NINAWA', E.H * V(0.2, 0.22), GOLD(), ease.out(prog(t, 0.3, 0.9)), V(110, 116));
} });
// u05 — "Penduduknya lebih dari seratus ribu orang."
registerShot('u05', { draw(g, t, info) {
  const cam = { z: 1.08 };
  const { GY } = city(g, t, cam, { mood: 'golden' });
  for (let r = 0; r < 3; r++) FX.crowd(g, t, { y: GY + 40 + r * V(110, 130), w: E.W * 1.2, x: -E.W * 0.1, rows: 5, rowH: V(24, 28), size: V(2.0, 2.2) + r * 0.3, color: '#1a1214', wave: 0.6, cheer: 0.3, seed: 12 + r });
  const n = Math.floor(ease.out(prog(t, 0.3, info.dur - 0.3)) * 100000);
  big(g, n.toLocaleString('id-ID') + '+', E.H * V(0.2, 0.22), GOLD(), 1, V(110, 116));
  text(g, 'ORANG', E.W / 2, E.H * V(0.2, 0.22) + V(90, 100), { size: V(50, 54), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000' });
} });
// u06 — "Dan semuanya… menyembah berhala."
registerShot('u06', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.05 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'pharaoh' }); veil(g, '#200004', 0.3);
  layer(g, cam, 0.95, (g) => { for (const [x, s] of [[-280, 1.3], [0, 1.6], [280, 1.3]]) idol(g, CX + x * V(1, 0.85), GY + 10, V(s, s * 0.95), '#5a4a3a'); for (const sx of [-1, 1]) { seg(g, [[CX + sx * V(420, 380), GY + 10], [CX + sx * V(420, 380), GY - 120]], 10, '#2a1a10'); flame(g, CX + sx * V(420, 380), GY - 122, 0.4, t, sx + 2); } });
  layer(g, cam, 1, (g) => crowd(g, CX - V(500, 420), V(190, 160), GY + 120, V(1.3, 1.35), t, { facing: () => 1, pose: () => ({ head: [56, -24], sh: [30, -52], hip: [0, -64], eF: [46, -30], hF: [62, -4], eB: [40, -32], hB: [56, -4], kF: [30, -6], fF: [-28, 0], kB: [24, -6], fB: [-34, 0] }), rim: { color: RED, dir: [0, -1], w: 3 } }));
} });
// u07 — "Tahun demi tahun, Nabi Yunus berdakwah."
registerShot('u07', { draw(g, t, info) {
  const cyc = t * 1.2, night = 0.5 - 0.5 * Math.cos(cyc * Math.PI * 2), cam = { z: 1.08 };
  const { GY, CX } = city(g, t, cam, { mood: 'golden' }); veil(g, '#060a20', 0.55 * night);
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(260, 220), y: GY + 50, s: V(1.5, 1.55), facing: 1, outfit: YUNUS, pose: breathe(posesAt(t % 1.2, [[0, 'explain'], [0.6, 'pointUp']]), t), expr: 'determined', face: { brows: null }, talk: Math.max(0, 0.4 * Math.sin(t * 11)), rim: { color: '#ffc890', dir: [1, -0.4], w: 4 } }); crowd(g, CX + V(20, 10), V(130, 110), GY + 60, V(1.3, 1.35), t, { n: 4, pose: () => POSES.crossArms }); });
  FX.sun(g, E.W - V(110, 110) + Math.cos(cyc * Math.PI * 2) * 30, V(110, 200) + Math.sin(cyc * Math.PI * 2) * 30, 10, '#fff3dc', '#ffc47a', 3);
} });
// u08 — "Sembahlah Allah… tinggalkan berhala-berhala itu!"
registerShot('u08', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.5, y: -80 }, { mood: 'golden' }), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: YUNUS, expr: 'determined', face: { brows: null }, talk: Math.max(0, 0.45 * Math.sin(t * 12)), rimColor: '#ffc890', rimSide: -1 });
} });
// u09 — "Tapi mereka menutup telinga."
registerShot('u09', { draw(g, t, info) { const { GY, CX } = city(g, t, { z: 1.15 }, { mood: 'dusk' }); crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.4, 1.45), t, { facing: (i) => (i % 2 ? -1 : 1), pose: () => ({ ...POSES.handsOnHead, hF: [20, -200], hB: [-14, -200] }), expr: () => 'angry', rim: { color: '#ffc890', dir: [0, -1], w: 4 } }); } });
// u10 — "Mereka mengejek."
registerShot('u10', { draw(g, t, info) { const { GY, CX } = city(g, t, { z: 1.15, x: 20 * t }, { mood: 'dusk' }); crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.4, 1.45), t, { pose: () => POSES.point, expr: () => 'happy', talk: true, rim: { color: '#ffc890', dir: [0, -1], w: 4 } }); for (let i = 0; i < 6; i++) FX.rings(g, E.W / 2 - V(480, 400) + i * V(190, 160), E.H * V(0.48, 0.44), t + i * 0.2, { count: 2, r0: 20, r1: 100, speed: 1.8, color: '#ffe0c0', a: 0.3 }); } });
// u11 — "Mereka menolak."
registerShot('u11', { draw(g, t, info) { const { GY, CX } = city(g, t, { z: 1.15 }, { mood: 'pharaoh' }); veil(g, '#200004', 0.25); crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.4, 1.45), t, { facing: () => (t > 0.5 ? 1 : -1), pose: () => POSES.crossArms, expr: () => 'angry', rim: { color: RED, dir: [0, -1], w: 4 } }); } });
// u12 — "Hati Nabi Yunus pun lelah… dan kecewa."
registerShot('u12', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.06 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'dusk', sunX: V(300, 200), wind: false });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(40, 30), y: GY + 40, s: V(1.7, 1.8), facing: 1, outfit: YUNUS, pose: breathe({ ...POSES.sit, eF: [30, -110], hF: [40, -86], head: [12, -168] }, t), expr: 'sad', staff: true, staffHand: 'B', staffBehind: true, rim: { color: '#ffc890', dir: [1, -0.4], w: 5 } }));
} });
// u13 — "Ia memperingatkan, Azab Allah akan datang kepada kalian!"
registerShot('u13', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'night' }); veil(g, '#1a0006', 0.25 + 0.25 * k);
  FX.lightning(g, { x1: E.W * 0.7, y1: 0, x2: E.W * 0.6, y2: E.H * 0.35, seed: Math.floor(t * 2) });
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(300, 260), y: GY + 50, s: V(1.55, 1.6), facing: 1, outfit: YUNUS, pose: breathe(POSES.pointUp, t), expr: 'angry', talk: Math.max(0, 0.5 * Math.sin(t * 12)), staff: true, staffHand: 'B', rim: { color: '#bcd0ff', dir: [1, -0.4], w: 5 } }); crowd(g, CX - V(20, 10), V(130, 110), GY + 60, V(1.3, 1.35), t, { n: 4, pose: () => POSES.crossArms, expr: () => 'smirk' }); });
  const a = ease.out(prog(t, wt('"Azab', 39, info) - 0.1, wt('"Azab', 39, info) + 0.4)); big(g, 'AZAB AKAN DATANG!', E.H * V(0.16, 0.16), RED, a, V(80, 76));
} });
// u14 — "Lalu… Nabi Yunus pergi meninggalkan kaumnya dalam keadaan marah."
registerShot('u14', { draw(g, t, info) {
  const s = V(1.45, 1.5), cam = { z: 1.05, x: t * 50 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dusk', sunX: -V(300, 200) });
  layer(g, cam, 0.4, (g) => { g.fillStyle = '#1a1018'; for (let i = 0; i < 10; i++) g.fillRect(CX - V(900, 700) + i * 50, GY - V(160, 230) - (i * 37) % 60, 44, 120); });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(100, 80) + t * 90, y: GY + 40, s, facing: 1, outfit: YUNUS, pose: walkPose(t * 5.5), expr: 'angry', staff: true, rim: { color: M.rim, dir: [-1, -0.4], w: 4 } }));
} });
// u15 — "Padahal… Allah belum mengizinkannya pergi."  freeze
registerShot('u15', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.02 * t, r: 0.008 * t };
  const { GY, CX } = desert(g, 0.5, cam, { mood: 'dusk', sunX: -V(300, 200), wind: false });
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + 40, s: V(1.6, 1.7), facing: 1, outfit: YUNUS, pose: walkPose(1.2), expr: 'angry', staff: true, rim: { color: '#bcd0ff', dir: [-1, -0.4], w: 5 } }));
  veil(g, '#0a1a40', 0.4);
  FX.drops(g, 0.2, { count: 30, color: '#e0e8ff', rMin: 2, rMax: 6 });
  const a = ease.out(prog(t, wt('belum', 48, info) - 0.2, wt('belum', 48, info) + 0.4)); big(g, 'BELUM DIIZINKAN', E.H * V(0.18, 0.2), '#ffffff', a, V(80, 84));
} });
// u16 — "Ia tidak tahu… keputusan itu akan membawanya ke ujian paling gelap dalam hidupnya."  a ship in a gathering storm, a shadow beneath
registerShot('u16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), W = E.W, H = E.H, wy = H * 0.5;
  g.fillStyle = linGrad(g, 0, 0, 0, wy, ['#05060e', '#141a30', '#2a3048']); g.fillRect(-W, -H, W * 3, wy + H);
  FX.lightning(g, { x1: W * 0.3, y1: 0, x2: W * 0.4, y2: wy - 100, seed: Math.floor(t * 2) + 4 }); FX.rain(g, t, { count: 140, a: 0.3 });
  ship(g, W / 2, wy - 10 + Math.sin(t * 2) * 14, V(0.9, 0.8), t, Math.sin(t * 1.6) * 0.18 * (0.4 + k));
  g.fillStyle = linGrad(g, 0, wy, 0, H, ['#0e2a4a', '#04101e', '#010308']); g.fillRect(-W, wy, W * 3, H);
  g.save(); g.globalAlpha = 0.5 + 0.3 * k; bigFish(g, lerp(W * 1.3, W * 0.4, k), H * 0.78, V(0.9, 0.8), -1, t, { color: '#020610', belly: '#060c16', eye: '#ffd040' }); g.restore();
  waterSurface(g, t, wy, 0.55);
} });
// u17 — "Dan ia juga tidak tahu… apa yang terjadi pada kaumnya… setelah ia pergi."
registerShot('u17', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 - 0.08 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'night' }); veil(g, '#1a0006', 0.35);
  layer(g, cam, 1, (g) => crowd(g, CX - V(480, 400), V(190, 160), GY + 60, V(1.3, 1.35), t, { facing: () => 1, pose: () => POSES.stand, expr: () => 'worried', look: [0, -1] }));
  big(g, '?', E.H * V(0.22, 0.24), GOLD(), ease.outBack(prog(t, 1.4, 1.9)), V(200, 220));
  text(g, 'BERSAMBUNG KE PART 2', E.W / 2, E.H * V(0.88, 0.88), { size: V(52, 54), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: ease.out(prog(t, 3.5, 4.2)) });
} });
