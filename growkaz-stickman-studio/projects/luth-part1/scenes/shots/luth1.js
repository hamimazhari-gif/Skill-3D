// shots/luth1.js — Kisah Nabi Luth, Part 1 (l01–l23). The sins of Sodom are shown only symbolically (shadows, red light, mockery).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, poly, backdrop } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { city as egyptCity } from '../sets/egypt.js';
const city = (g, t, cam, o = {}) => egyptCity(g, t, cam, { ...o, noEgypt: true });   // Sodom: no pyramids or obelisks
import { desert } from '../sets/desert.js';
import { camp } from '../sets/madyan.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, palm, flame, GOLD } from '../lib/_costume.js';
import { camel, commentPrompt } from '../lib5/_yusuf.js';
import { wheat, sack as grainSack } from '../lib7/_y3.js';
import { LUTH, IBRAHIM, ISTRI_LUTH, KAUM, MUSAFIR } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff3a2a';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const crowd = (g, x0, dx, y, s, t, o = {}) => KAUM.slice(0, o.n || 6).forEach((of, i) => person(g, { x: x0 + i * dx + (i % 2) * 14, y: y + (i % 2) * 14, s, facing: o.facing ?? 1, outfit: of, pose: breathe(o.pose ? o.pose(i) : POSES.stand, t, 1, i), expr: o.expr ? o.expr(i) : 'smirk', talk: o.talk ? Math.max(0, 0.5 * Math.sin(t * 12 + i)) : 0, look: o.look, rim: o.rim }));

// l01 — "Ada satu negeri… yang Allah hapus dari muka bumi."
registerShot('l01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.12 * k };
  city(g, t, cam, { mood: 'dusk' });
  veil(g, '#000', 0.6 * ease.in(prog(t, wt('hapus', 1, info), info.dur)));
} });
// l02/l03 — "Bukan dengan banjir." / "Bukan dengan gempa."  crossed-out icons
function notThis(g, t, kind) {
  blurBg(g, (g) => city(g, 2, { z: 1.2 }, { mood: 'night' }), 14, 0.55, '#02030a');
  const cx = E.W / 2, cy = E.H * 0.48, a = ease.outBack(prog(t, 0.05, 0.4));
  g.save(); g.translate(cx, cy); g.scale(a, a);
  if (kind === 'flood') { for (let i = 0; i < 3; i++) { g.strokeStyle = '#4aa0e0'; g.lineWidth = 26; g.beginPath(); for (let x = -260; x <= 260; x += 10) g.lineTo(x, -80 + i * 90 + Math.sin(x * 0.03 + t * 5) * 30); g.stroke(); } }
  else { g.fillStyle = '#8a5a30'; g.fillRect(-280, -40, 560, 200); g.strokeStyle = '#1a0a04'; g.lineWidth = 16; g.beginPath(); g.moveTo(-40, -40); g.lineTo(20, 30); g.lineTo(-30, 90); g.lineTo(30, 160); g.stroke(); const [sx, sy] = shake(t, 10, 30); g.translate(sx, sy); }
  g.restore();
  const x = ease.out(prog(t, 0.35, 0.7)); if (x > 0) { seg(g, [[cx - 300, cy - 300], [cx - 300 + 600 * x, cy - 300 + 600 * x]], 34, RED); if (x > 0.5) seg(g, [[cx + 300, cy - 300], [cx + 300 - 600 * (x - 0.5) * 2, cy - 300 + 600 * (x - 0.5) * 2]], 34, RED); }
  big(g, kind === 'flood' ? 'BUKAN BANJIR' : 'BUKAN GEMPA', E.H * V(0.82, 0.8), '#ffffff', a, V(80, 84));
}
registerShot('l02', { draw(g, t) { notThis(g, t, 'flood'); } });
registerShot('l03', { draw(g, t) { notThis(g, t, 'quake'); } });
// l04 — "Tapi dengan cara… dibalikkan."
registerShot('l04', { draw(g, t, info) {
  const flip = ease.inOut(prog(t, wt('dibalikkan.', 8, info) - 0.5, wt('dibalikkan.', 8, info) + 0.6)), [qx, qy] = shake(t, 4 + 12 * flip, 30);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#05020a', '#200610', '#3a0a10']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.lightning(g, { x1: E.W * 0.2, y1: 0, x2: E.W * 0.35, y2: E.H * 0.4, seed: Math.floor(t * 3) });
  g.save(); g.translate(E.W / 2 + qx, E.H * 0.55 + qy); g.rotate(Math.PI * flip); g.scale(0.8, 0.8); g.translate(-E.W / 2, -E.H * 0.55);
  g.beginPath(); g.rect(-E.W * 0.2, E.H * 0.1, E.W * 1.4, E.H * 0.8); g.clip(); city(g, t, { z: 1 }, { mood: 'pharaoh' }); g.restore();
  if (flip > 0.95) veil(g, '#ffffff', 0.5 * (1 - prog(t, wt('dibalikkan.', 8, info) + 0.6, info.dur)), 'lighter');
} });
// l05 — "Namanya Sodom."
registerShot('l05', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.06 * k };
  city(g, t, cam, { mood: 'golden' }); veil(g, '#1a0804', 0.35);
  big(g, 'SODOM', E.H * 0.42, GOLD(), ease.outBack(prog(t, 0.6, 1.1)), V(170, 180));
  text(g, 'KISAH NABI LUTH • PART 1', E.W / 2, E.H * 0.42 + V(130, 140), { size: V(42, 46), color: '#ffffff', font: FONTS.title, stroke: 8, strokeColor: '#000', spacing: 4, alpha: ease.out(prog(t, 0.9, 1.4)) });
} });
// l06 — "Tanahnya subur."  lush fields
registerShot('l06', { draw(g, t, info) {
  const cam = { z: 1.05, x: 30 * t };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(300, 200), wind: false });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 40, 0, E.H, ['#4a8a3a', '#2a5a2a']); g.fillRect(-E.W, GY - 40, E.W * 3, E.H); for (const [x, s] of [[-420, 1.2], [380, 1.3], [700, 1.0]]) palm(g, CX + x, GY, s, '#1a2a14', t, x); });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 16; i++) wheat(g, CX - V(600, 520) + i * V(80, 70), GY + 140 + (i % 2) * 20, V(0.9, 0.95), true, t, i); });
} });
// l07 — "Hartanya melimpah."  gold & goods
registerShot('l07', { draw(g, t, info) {
  const cam = { z: 1.12, x: -20 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 5; i++) grainSack(g, CX - V(480, 400) + i * V(120, 100), GY + 60, 1.0); for (let i = 0; i < 40; i++) { const x = CX + V(150, 120) + (i % 8) * 34 - Math.floor(i / 8) * 17, y = GY + 60 - Math.floor(i / 8) * 26; circle(g, x, y, 16, GOLD()); circle(g, x - 4, y - 4, 5, '#fff4c0'); } FX.sparkle(g, CX + V(260, 200), GY - 80, 40, '#fff4c0', Math.abs(Math.sin(t * 4))); });
} });
// l08 — "Hidupnya nyaman."  feasting under awnings
registerShot('l08', { draw(g, t, info) {
  const cam = { z: 1.1 };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => { for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#c8a060' : '#8a2e22'; g.fillRect(CX - 360 + k * 120, GY - 320, 120, 50); } rr(g, CX - 380, GY - 10, 760, 60, 20); g.fillStyle = '#8a2e22'; g.fill(); for (let i = 0; i < 3; i++) person(g, { x: CX - 240 + i * 240, y: GY + 10, s: V(1.3, 1.35), facing: i === 2 ? -1 : 1, outfit: KAUM[i], pose: breathe(POSES.sitBack, t, 1, i), expr: 'happy', rim: { color: M.rim, dir: [0, -1], w: 4 } }); for (let i = 0; i < 4; i++) circle(g, CX - 200 + i * 130, GY + 30, 16, ['#e8c040', '#f0a030', '#8a2a6a', '#e8c040'][i]); });
} });
// l09 — "Tapi penduduknya… sudah kehilangan rasa malu."
registerShot('l09', { draw(g, t, info) {
  const shift = ease.inOut(prog(t, 0.2, 1.4)), cam = { z: 1.15 };
  const { GY, CX, M } = city(g, t, cam, { mood: shift > 0.5 ? 'pharaoh' : 'golden' });
  veil(g, '#300000', 0.35 * shift);
  layer(g, cam, 1, (g) => crowd(g, CX - V(450, 380), V(180, 150), GY + 60, V(1.4, 1.4), t, { expr: () => (shift > 0.5 ? 'smirk' : 'happy'), rim: { color: shift > 0.5 ? RED : M.rim, dir: [0, -1], w: 4 } }));
} });
// l10 — "Mereka melakukan perbuatan keji yang belum pernah dilakukan siapa pun sebelumnya."  symbolic: shadows & red eyes
registerShot('l10', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#05020a', '#1a0408', '#2a0608']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const k = ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1 + 0.1 * k, 1 + 0.1 * k); g.translate(-E.W / 2, -E.H / 2);
  for (let i = 0; i < 9; i++) { const x = E.W * (0.08 + (i % 5) * 0.21) + Math.floor(i / 5) * 90, y = E.H * (0.55 + Math.floor(i / 5) * 0.16); person(g, { x, y, s: V(1.2, 1.3) * (1 + Math.floor(i / 5) * 0.2), facing: i % 2 ? -1 : 1, outfit: { top: 'dress', color: '#0a0406' }, pose: breathe(POSES.stand, t, 1, i), expr: 'smirk', rim: { color: '#8a1a1a', dir: [0, -1], w: 3 }, dim: true }); }
  g.restore();
  for (let i = 0; i < 9; i++) { const x = E.W * (0.08 + (i % 5) * 0.21) + Math.floor(i / 5) * 90 + 8, y = E.H * (0.55 + Math.floor(i / 5) * 0.16) - V(250, 270); glow(g, x, y, 22, RED, 0.8 * Math.abs(Math.sin(t * 2 + i))); }
  FX.fog(g, E.H * 0.7, 300, '#3a0a10', 0.5);
} });
// l11 — "Mereka merampok para musafir."
registerShot('l11', { draw(g, t, info) {
  const cam = { z: 1.08, x: 20 * t };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dusk', sunX: -V(300, 200) });
  const grab = ease.out(prog(t, 0.6, 1.2)), rim = { color: M.rim, dir: [-1, -0.4], w: 4 };
  layer(g, cam, 1, (g) => {
    camel(g, CX + V(360, 300), GY + 30, V(0.85, 0.8), -1, 0, { rim: M.rim, load: '#8a6a3a' });
    person(g, { x: CX + V(120, 100), y: GY + 50, s: V(1.4, 1.45), facing: -1, outfit: MUSAFIR, pose: breathe(grab > 0.5 ? POSES.handsOnHead : POSES.stand, t), expr: grab > 0.5 ? 'scared' : 'neutral', rim });
    person(g, { x: CX - V(160, 140), y: GY + 50, s: V(1.4, 1.45), facing: 1, outfit: KAUM[0], pose: breathe(grab > 0.3 ? POSES.reach : POSES.ready, t), expr: 'angry', rim });
    person(g, { x: CX - V(330, 290), y: GY + 56, s: V(1.35, 1.4), facing: 1, outfit: KAUM[1], pose: breathe(POSES.crossArms, t), expr: 'smirk', rim });
    const bx = lerp(CX + V(60, 50), CX - V(200, 170), grab); rr(g, bx - 30, GY - 140, 60, 50, 10); g.fillStyle = '#8a6a3a'; g.fill(); if (grab > 0.3) for (let i = 0; i < 4; i++) circle(g, bx + Math.sin(i * 2) * 50, GY - 160 - i * 20 + (t - 0.6) * 100 * i, 10, GOLD());
  });
} });
// l12 — "Dan mereka berbuat mungkar terang-terangan, sambil tertawa."
registerShot('l12', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.04 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'pharaoh' });
  veil(g, '#200000', 0.25);
  layer(g, cam, 1, (g) => { crowd(g, CX - V(450, 380), V(180, 150), GY + 60, V(1.45, 1.45), t, { pose: (i) => (i % 2 ? POSES.cheer : POSES.point), expr: () => 'happy', talk: true, rim: { color: RED, dir: [0, -1], w: 4 } }); for (let i = 0; i < 6; i++) FX.rings(g, CX - V(450, 380) + i * V(180, 150), GY + 60 - 260, t + i * 0.2, { count: 2, r0: 20, r1: 110, speed: 1.8, color: '#ffb0a0', a: 0.35 }); });
} });
// l13 — "Lalu Allah mengutus seorang nabi."
registerShot('l13', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.08 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'night', sunX: V(300, 200), wind: false });
  layer(g, cam, 1, (g) => { holyLight(g, t, [CX, GY - V(180, 220)], 0.4 + 0.6 * k); person(g, { x: CX, y: GY + 30, s: V(1.5, 1.6), facing: 1, outfit: LUTH, pose: breathe(POSES.stand, t), expr: 'awe', look: [0, -1], rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
} });
// l14 — "Nabi Luth AS, keponakan Nabi Ibrahim."  family link card
registerShot('l14', { draw(g, t, info) {
  UI.blueprint(g, {}); const ui = S().ui, bp = ui.blueprint;
  const a1 = ease.out(prog(t, 0.1, 0.5)), a2 = ease.out(prog(t, wt('keponakan', 37, info) - 0.2, wt('keponakan', 37, info) + 0.4));
  const ix = E.W / 2, iy = E.H * V(0.42, 0.36), lx = E.W / 2, ly = E.H * V(0.86, 0.78);
  if (a2 > 0) { person(g, { x: ix, y: iy, s: V(1.2, 1.3), facing: 1, outfit: IBRAHIM, pose: breathe(POSES.stand, t), expr: 'smile', alpha: a2, rim: { color: bp, dir: [0, -1], w: 4 } }); text(g, 'NABI IBRAHIM', ix, iy + 50, { size: V(44, 48), color: ui.cream, font: FONTS.title, alpha: a2 }); g.setLineDash([16, 12]); seg(g, [[ix, iy + 90], [lx, ly - V(330, 360)]], 5, alpha(bp, a2)); g.setLineDash([]); text(g, 'PAMAN', ix + 140, (iy + ly) / 2 - 60, { size: V(36, 40), color: ui.gold, font: FONTS.title, alpha: a2 }); }
  person(g, { x: lx, y: ly, s: V(1.3, 1.4), facing: 1, outfit: LUTH, pose: breathe(POSES.stand, t, 1, 2), expr: 'smile', alpha: a1, rim: { color: bp, dir: [0, -1], w: 4 } });
  text(g, 'NABI LUTH', lx, ly + 55, { size: V(54, 58), color: ui.gold, font: FONTS.title, alpha: a1 });
} });
// l15 — "Wahai kaumku… bertakwalah kepada Allah."
registerShot('l15', { draw(g, t, info) {
  const cam = { z: 1.08, x: -20 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'dusk' });
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(330, 290), y: GY + 50, s: V(1.6, 1.65), facing: 1, outfit: LUTH, pose: breathe(posesAt(t, [[0, 'explain'], [1.4, 'pointUp']]), t), expr: 'determined', face: { brows: null }, talk: Math.max(0, 0.4 * Math.sin(t * 11)), rim: { color: HOLY, dir: [1, -0.4], w: 5 } }); crowd(g, CX - V(40, 40), V(130, 110), GY + 60, V(1.3, 1.35), t, { n: 4, facing: -1, pose: () => POSES.crossArms, expr: () => 'smirk', rim: { color: M.rim, dir: [-1, -0.4], w: 4 } }); });
  FX.rings(g, E.W / 2 - V(330, 290), E.H * 0.4, t, { count: 2, r0: 30, r1: 200, speed: 1.4, color: HOLY, a: 0.35 });
} });
// l16 — "Tinggalkan perbuatan itu!"
registerShot('l16', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.5, y: -80 }, { mood: 'dusk' }), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: LUTH, expr: 'determined', face: { brows: null }, talk: Math.max(0, 0.45 * Math.sin(t * 12)), rimColor: HOLY, rimSide: -1 });
} });
// l17 — "Jawaban mereka?"
registerShot('l17', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.05 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'pharaoh' }); veil(g, '#200000', 0.3);
  layer(g, cam, 1, (g) => crowd(g, CX - V(450, 380), V(180, 150), GY + 60, V(1.45, 1.45), t, { expr: () => 'smirk', look: [0, 0.2], rim: { color: RED, dir: [0, -1], w: 4 } }));
} });
// l18 — "Usir Luth dari kampung kita!"
registerShot('l18', { draw(g, t, info) {
  blurBg(g, (g) => city(g, t, { z: 1.5, y: -80 }, { mood: 'pharaoh' }), 14, 0.4, '#1a0000');
  const [qx, qy] = shake(t, 5, 20);
  bigPerson(g, E.W / 2 + qx, E.H * V(0.6, 0.56) + qy, V(300, 330), { outfit: KAUM[0], expr: 'angry', talk: Math.max(0, 0.6 * Math.sin(t * 14)), rimColor: RED, rimSide: 1 });
} });
// l19 — "Mereka itu orang-orang yang sok suci!"  the mob points at Luth
registerShot('l19', { draw(g, t, info) {
  const cam = { z: 1.1, x: 20 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'pharaoh' }); veil(g, '#200000', 0.25);
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(360, 320), y: GY + 50, s: V(1.5, 1.55), facing: 1, outfit: LUTH, pose: breathe(POSES.sad, t), expr: 'sad', rim: { color: HOLY, dir: [0, -1], w: 5 } }); crowd(g, CX - V(100, 80), V(110, 95), GY + 60, V(1.35, 1.4), t, { n: 6, facing: -1, pose: () => POSES.point, expr: () => 'happy', talk: true, rim: { color: RED, dir: [-1, -0.4], w: 4 } }); for (let i = 0; i < 3; i++) { const x = CX + V(40, 30) + i * V(220, 190); seg(g, [[x + 30, GY - 160], [x + 30, GY - 250]], 7, '#2a1a10'); flame(g, x + 30, GY - 252, 0.3, t, i); } });
} });
// l20 — "Bayangkan… Menyeru kebaikan, tapi justru dianggap salah."  alone; everyone turns their backs
registerShot('l20', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 - 0.08 * k };
  const { GY, CX } = city(g, t, cam, { mood: 'night' });
  FX.rain(g, t, { count: 140, a: 0.3 });
  layer(g, cam, 1, (g) => { person(g, { x: CX, y: GY + 50, s: V(1.6, 1.7), facing: 1, outfit: LUTH, pose: breathe(POSES.sad, t), expr: 'sad', rim: { color: '#9ab8ff', dir: [0, -1], w: 5 } }); for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1, x = CX + sd * V(260 + Math.floor(i / 2) * 160, 220 + Math.floor(i / 2) * 120); person(g, { x, y: GY + 40, s: V(1.2, 1.25), facing: sd, outfit: KAUM[i], pose: walkPose(t * 4 + i), expr: 'smirk', dim: true, alpha: 0.85 }); } });
} });
// house of Luth at night
function house(g, t, cam, o = {}) {
  const { GY, CX, M } = camp(g, t, cam, { mood: 'night', stars: true, fire: false });
  layer(g, cam, 0.9, (g) => { const w = V(520, 480), h = V(380, 420); g.fillStyle = '#2a2236'; g.fillRect(CX - w / 2, GY - h, w, h); poly(g, [[CX - w / 2 - 30, GY - h], [CX, GY - h - 120], [CX + w / 2 + 30, GY - h]], '#1a1626'); g.fillStyle = M.practical; g.fillRect(CX - 60, GY - 200, 120, 200); glow(g, CX, GY - 100, 260, M.practical, 0.4); g.fillStyle = M.practical; g.fillRect(CX + w / 2 - 140, GY - h + 80, 80, 90); glow(g, CX + w / 2 - 100, GY - h + 125, 140, M.practical, 0.35); });
  return { GY, CX, M };
}
// l21 — "Dan yang paling menyakitkan…"
registerShot('l21', { draw(g, t, info) { const k = ease.inOut(t / info.dur); house(g, t, { z: 1.0 + 0.1 * k }); } });
// l22 — "Musuh terbesar Nabi Luth ternyata ada di dalam rumahnya sendiri."  a veiled silhouette in the doorway
registerShot('l22', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.25 + 0.15 * k };
  const { GY, CX, M } = house(g, t, cam);
  veil(g, '#000010', 0.3);
  layer(g, cam, 0.9, (g) => { const show = ease.out(prog(t, wt('rumahnya', 61, info) - 0.6, wt('rumahnya', 61, info) + 0.4)); person(g, { x: CX, y: GY, s: V(1.0, 1.05), facing: -1, outfit: ISTRI_LUTH, pose: breathe(POSES.crossArms, t), expr: 'smirk', dim: true, alpha: show, rim: { color: RED, dir: [0, -1], w: 3 } }); if (show > 0) glow(g, CX - 6, GY - 205, 26, RED, 0.8 * show); });
} });
// l23 — "Siapa dia?"
registerShot('l23', { draw(g, t, info) {
  g.fillStyle = '#05020a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.42, V(500, 520), '#4a0a14', 0.6);
  person(g, { x: E.W / 2, y: E.H * V(0.62, 0.58), s: V(2.0, 2.2), facing: 1, outfit: { ...ISTRI_LUTH }, pose: breathe(POSES.crossArms, t), expr: 'smirk', dim: true, rim: { color: RED, dir: [0, -1], w: 5 } });
  big(g, '?', E.H * V(0.2, 0.2), RED, ease.outBack(prog(t, 0.1, 0.5)), V(220, 240));
  commentPrompt(g, Math.max(0, t - 0.6), ['SIAPA DIA?'], { y: E.H * V(0.72, 0.68) });
  text(g, 'BERSAMBUNG KE PART 2', E.W / 2, E.H * V(0.93, 0.92), { size: V(50, 52), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: ease.out(prog(t, 1.2, 1.8)) });
} });
