// shots/idris2.js — Kisah Nabi Idris, Part 2 (e01–e16).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, ring, rr, text, FONTS, wordTime, linGrad, poly, rng, backdrop } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert } from '../sets/desert.js';
import { camp } from '../sets/madyan.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, flame, GOLD } from '../lib/_costume.js';
import { commentPrompt } from '../lib5/_yusuf.js';
import { IDRIS, PURBA, MURID } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0', RED = '#ff4a3a';
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };
const big = (g, s, y, c, a, size = V(96, 100)) => text(g, s, E.W / 2, y, { size, color: c, font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 24, glowColor: alpha(c, 0.7), alpha: a });
const QABIL = ['#8a2a24', '#6a3a2a', '#7a4a2a', '#5a2a3a', '#4a3a2a', '#7a2a3a'].map((c, i) => ({ top: 'tshirt', color: ['#4a2a1a', '#3a2418', '#4a3020'][i % 3], head: i % 2 ? 'curly' : 'spiky', headColor: c }));
const people = (g, list, x0, dx, y, s, t, o = {}) => list.forEach((of, i) => person(g, { x: x0 + i * dx + (i % 2) * 12, y: y + (i % 2) * 14, s, facing: o.facing ? o.facing(i) : 1, outfit: of, pose: breathe(o.pose ? o.pose(i) : POSES.stand, t, 1.5, i), expr: o.expr ? o.expr(i) : 'neutral', talk: o.talk ? Math.max(0, 0.5 * Math.sin(t * 12 + i)) : 0, look: o.look, rim: o.rim }));
function revel(g, t, cam) { const { GY, CX } = camp(g, t, cam, { mood: 'night', stars: true, fireX: 0 }); veil(g, '#200004', 0.3); return { GY, CX }; }
function mushaf(g, x, y, s, t) { glow(g, x, y, 420 * s, '#ffe6a0', 0.45); FX.godRays(g, x, y, { count: 16, angle: -Math.PI / 2, spread: Math.PI * 1.2, len: 700 * s, color: '#ffe6a0', a: 0.12, t }); g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-240, -140], [0, -110], [0, 160], [-240, 130]], '#1a5a3a'); poly(g, [[240, -140], [0, -110], [0, 160], [240, 130]], '#1e6a44'); poly(g, [[-220, -120], [-10, -95], [-10, 140], [-220, 115]], '#f4ecd4'); poly(g, [[220, -120], [10, -95], [10, 140], [220, 115]], '#f8f0dc'); for (let i = 0; i < 6; i++) { seg(g, [[-200, -80 + i * 36], [-30, -64 + i * 36]], 4, '#8a7a5a'); seg(g, [[30, -64 + i * 36], [200, -80 + i * 36]], 4, '#8a7a5a'); } g.restore(); }
function ayatCard(g, t, info, lines, ref, refWord, refAfter) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a1a12', '#123020', '#0a1a12']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 0.1; ring(g, E.W / 2, E.H * 0.45, V(300, 360) + i * 6, 2, alpha('#ffd890', 0.08)); }
  lines.forEach(([str, at, c], i) => { const a = ease.out(prog(t, at - 0.2, at + 0.4)); text(g, str, E.W / 2, E.H * V(0.36, 0.38) + i * V(100, 110), { size: V(74, 70), color: c || '#ffffff', font: FONTS.title, stroke: 12, strokeColor: '#000', glow: 20, glowColor: alpha(c || '#ffffff', 0.5), alpha: a }); });
  const ra = ease.outBack(prog(t, wt(refWord, refAfter, info) - 0.2, wt(refWord, refAfter, info) + 0.3));
  if (ra > 0) { g.save(); g.translate(E.W / 2, E.H * V(0.72, 0.7)); g.scale(ra, ra); rr(g, -V(300, 320), -55, V(600, 640), 110, 55); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill(); g.strokeStyle = GOLD(); g.lineWidth = 5; g.stroke(); text(g, ref, 0, 4, { size: V(52, 56), color: GOLD(), font: FONTS.title }); g.restore(); }
}

// e01 — title
registerShot('e01', { draw(g, t, info) {
  blurBg(g, (g) => revel(g, t, { z: 1.2 }), 12, 0.45, '#04020a');
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI IDRIS', 'PART 2'], dur: info.dur + 0.5, y: E.H * 0.42 });
  const a = ease.out(prog(t, 0.6, 1.1)) * (1 - prog(t, info.dur - 0.3, info.dur));
  ['DAKWAH DI TENGAH', 'KAUM YANG TERSESAT'].forEach((s, i) => text(g, s, E.W / 2, E.H * 0.42 + V(130, 150) + i * V(64, 70), { size: V(52, 56), color: S().ui.accent, font: FONTS.title, glow: 22, glowColor: 'rgba(255,80,60,.7)', spacing: 3, alpha: a }));
} });
// e02 — "Zaman itu, manusia mulai terpecah."  one group walks into light, the other into darkness
registerShot('e02', { draw(g, t, info) {
  const sp = ease.inOut(prog(t, 0.3, info.dur)), cam = { z: 1.05 };
  const { GY, CX } = desert(g, t, cam, { mood: 'dusk', sunX: -V(380, 260), wind: false });
  g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = alpha('#100004', 0.55 * sp); g.fillRect(E.W / 2, -E.H, E.W * 2, E.H * 3); g.restore();
  layer(g, cam, 1, (g) => { seg(g, [[CX, GY - 10], [CX + 20, GY + 80], [CX - 10, GY + 200], [CX + 15, E.H]], 10 * sp, '#0a0402'); for (let i = 0; i < 4; i++) person(g, { x: CX - V(80, 70) - i * V(110, 90) - sp * V(160, 120), y: GY + 50 + (i % 2) * 12, s: V(1.2, 1.25), facing: -1, outfit: MURID[i], pose: walkPose(t * 4 + i), expr: 'neutral', rim: { color: '#ffc890', dir: [-1, -0.4], w: 4 } }); for (let i = 0; i < 4; i++) person(g, { x: CX + V(80, 70) + i * V(110, 90) + sp * V(160, 120), y: GY + 50 + (i % 2) * 12, s: V(1.2, 1.25), facing: 1, outfit: QABIL[i], pose: walkPose(t * 4 + i), expr: 'smirk', rim: { color: RED, dir: [1, -0.4], w: 4 } }); });
} });
// e03 — "Dikisahkan, sebagian keturunan Qabil hidup dalam kemaksiatan."
registerShot('e03', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.1 * k };
  const { GY, CX } = revel(g, t, cam);
  layer(g, cam, 1, (g) => people(g, QABIL, CX - V(480, 400), V(190, 160), GY + 60, V(1.25, 1.3), t, { facing: (i) => (i % 2 ? -1 : 1), pose: (i) => (i % 3 === 0 ? POSES.cheer : POSES.relaxed), expr: () => 'happy', rim: { color: RED, dir: [0, -1], w: 4 } }));
} });
// e04 — "Mereka lalai… bersenang-senang… dan melupakan Allah."
registerShot('e04', { draw(g, t, info) {
  const cam = { z: 1.2, x: 20 * t };
  const { GY, CX } = revel(g, t, cam);
  layer(g, cam, 1, (g) => { people(g, QABIL, CX - V(500, 420), V(190, 160), GY + 60, V(1.35, 1.4), t, { facing: (i) => (i % 2 ? -1 : 1), pose: (i) => (Math.sin(t * 4 + i) > 0 ? POSES.cheer : POSES.jump), expr: () => 'joy', talk: true, rim: { color: RED, dir: [0, -1], w: 4 } }); for (let i = 0; i < 6; i++) FX.rings(g, CX - V(500, 420) + i * V(190, 160), GY + 60 - 250, t + i * 0.2, { count: 2, r0: 20, r1: 100, speed: 1.8, color: '#ffb0a0', a: 0.3 }); });
  veil(g, '#000', 0.35 * ease.in(prog(t, wt('melupakan', 15, info), info.dur)));
} });
// e05 — "Nabi Idris bangkit menyeru mereka: Sembahlah Allah… tinggalkan kemungkaran… dan berbuat adillah!"
registerShot('e05', { draw(g, t, info) {
  const cam = { z: 1.08, x: -15 * t };
  const { GY, CX } = desert(g, t, cam, { mood: 'golden', sunX: V(-200, -150), wind: false });
  layer(g, cam, 1, (g) => { g.fillStyle = '#3a2418'; g.beginPath(); g.ellipse(CX - V(300, 260), GY + 60, 160, 60, 0, Math.PI, Math.PI * 2); g.fill(); person(g, { x: CX - V(300, 260), y: GY + 10, s: V(1.6, 1.65), facing: 1, outfit: IDRIS, pose: breathe(posesAt(t, [[0, 'explain'], [wt('"Sembahlah', 19, info), 'pointUp'], [wt('tinggalkan', 21, info), 'point'], [wt('berbuat', 23, info), 'explain']]), t), expr: 'determined', face: { brows: null }, talk: t > wt('"Sembahlah', 19, info) ? Math.max(0, 0.45 * Math.sin(t * 12)) : 0, rim: { color: HOLY, dir: [0, -1], w: 5 } }); people(g, QABIL.slice(0, 4), CX - V(40, 30), V(140, 120), GY + 70, V(1.3, 1.35), t, { facing: () => -1, pose: () => POSES.crossArms, expr: () => 'neutral' }); });
  [['SEMBAHLAH ALLAH', '"Sembahlah', 19], ['TINGGALKAN KEMUNGKARAN', 'tinggalkan', 21], ['BERBUAT ADILLAH', 'berbuat', 23]].forEach(([s, w, af], i) => { const a = ease.outBack(prog(t, wt(w, af, info) - 0.1, wt(w, af, info) + 0.3)); if (a > 0) text(g, s, E.W / 2, E.H * V(0.14, 0.12) + i * V(80, 90), { size: V(54, 58) * a, color: i === 0 ? GOLD() : '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000' }); });
} });
// e06 — "Sebagian mendengar."
registerShot('e06', { draw(g, t, info) {
  const cam = { z: 1.15 };
  const { GY, CX } = desert(g, t, cam, { mood: 'golden', sunX: V(-200, -150), wind: false });
  glow(g, E.W * 0.4, E.H * 0.6, V(500, 520), '#ffe6b0', 0.3);
  layer(g, cam, 1, (g) => people(g, MURID.slice(0, 3), CX - V(300, 260), V(220, 190), GY + 60, V(1.5, 1.55), t, { facing: () => -1, pose: () => POSES.holdFront, expr: () => 'smile', rim: { color: HOLY, dir: [-1, -0.4], w: 5 } }));
} });
// e07 — "Tapi banyak yang menolak."
registerShot('e07', { draw(g, t, info) {
  const cam = { z: 1.1, x: 20 * t };
  const { GY, CX } = revel(g, t, cam);
  const turn = t > 0.6;
  layer(g, cam, 1, (g) => people(g, QABIL, CX - V(500, 420), V(190, 160), GY + 60, V(1.35, 1.4), t, { facing: () => (turn ? 1 : -1), pose: () => POSES.crossArms, expr: () => 'angry', rim: { color: RED, dir: [0, -1], w: 4 } }));
} });
// e08 — "Namun Nabi Idris tidak menyerah."
registerShot('e08', { draw(g, t, info) {
  blurBg(g, (g) => desert(g, t, { z: 1.5, y: -80 }, { mood: 'golden', wind: false }), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: IDRIS, expr: 'determined', face: { brows: null }, look: [0.3, -0.2], rimColor: HOLY, rimSide: -1 });
} });
// e09 — "Siang ia berdakwah."
registerShot('e09', { draw(g, t, info) {
  const cam = { z: 1.08 };
  const { GY, CX } = desert(g, t, cam, { mood: 'day', sunX: V(300, 200), wind: false });
  layer(g, cam, 1, (g) => { person(g, { x: CX + V(300, 260), y: GY + 40, s: V(1.5, 1.55), facing: -1, outfit: IDRIS, pose: breathe(POSES.explain, t), expr: 'smile', talk: Math.max(0, 0.35 * Math.sin(t * 11)), rim: { color: '#fff4d8', dir: [0, -1], w: 4 } }); people(g, MURID, CX - V(480, 400), V(150, 125), GY + 60, V(1.25, 1.3), t, { pose: () => POSES.sit, expr: () => 'thinking', look: [1, -0.2] }); });
  text(g, 'SIANG', E.W / 2, E.H * V(0.15, 0.15), { size: V(80, 84), color: '#ffe6a0', font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.4)) });
} });
// e10 — "Malam ia beribadah."
registerShot('e10', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.05 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'night', sunX: V(300, 200), wind: false });
  layer(g, cam, 1, (g) => { holyLight(g, t, [CX, GY - V(180, 220)], 0.45); person(g, { x: CX, y: GY + 30, s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe({ ...POSES.kneel, eF: [26, -150], hF: [40, -180], eB: [18, -148], hB: [32, -178] }, t, 0.6), expr: 'sleepy', rim: { color: HOLY, dir: [0, -1], w: 5 } }); });
  text(g, 'MALAM', E.W / 2, E.H * V(0.15, 0.15), { size: V(80, 84), color: '#bcd0ff', font: FONTS.title, stroke: 12, strokeColor: '#000', alpha: ease.out(prog(t, 0.1, 0.4)) });
} });
// e11 — "Dan di sela-selanya… ia terus bekerja dengan tangannya sendiri."
registerShot('e11', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.06 * k };
  const { GY, CX } = camp(g, t, cam, { mood: 'dusk', fireX: V(320, 260) });
  layer(g, cam, 1, (g) => { const x = CX - V(120, 100), s = V(1.7, 1.8); person(g, { x, y: GY + 40, s, facing: 1, outfit: IDRIS, pose: breathe({ ...POSES.sit, eF: [30, -110], hF: [56, -100 + Math.sin(t * 8) * 10], eB: [22, -112], hB: [44, -98] }, t, 0.6), expr: 'smile', look: [0.6, 0.8], rim: { color: '#ffa040', dir: [1, -0.3], w: 5 } }); rr(g, x + 40 * s, GY + 40 - 100 * s, 120 * s, 50 * s, 10); g.fillStyle = '#d8cfb8'; g.fill(); seg(g, [[x + 56 * s, GY + 40 - (100 + Math.sin(t * 8) * 10) * s], [x + 90 * s, GY + 40 - 130 * s]], 3, '#6a4ad6'); });
} });
// e12 — "Allah memujinya dalam Al-Qur'an."
registerShot('e12', { draw(g, t, info) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a1a12', '#123020', '#0a1a12']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); mushaf(g, E.W / 2, E.H * 0.5, V(1.3, 1.5) * (1 + 0.04 * t), t); } });
// e13 — "Ia termasuk golongan… orang-orang yang sabar. (QS. Al-Anbiya: 85)"
registerShot('e13', { draw(g, t, info) { ayatCard(g, t, info, [['ORANG-ORANG', wt('orang-orang', 44, info), '#ffffff'], ['YANG SABAR', wt('sabar.', 45, info), GOLD()]], 'QS. AL-ANBIYA: 85', 'Q', 46); } });
// e14 — "Ia juga disebut… seorang yang sangat membenarkan dan seorang nabi. (QS. Maryam: 56)"
registerShot('e14', { draw(g, t, info) { ayatCard(g, t, info, [['SANGAT', wt('sangat', 52, info), '#ffffff'], ['MEMBENARKAN', wt('membenarkan', 52, info), '#ffffff'], ['& SEORANG NABI', wt('nabi.', 54, info), GOLD()]], 'QS. MARYAM: 56', 'Q', 55); } });
// e15 — "Lalu Allah memberinya kemuliaan yang luar biasa… yang tidak diberikan kepada banyak manusia."  a column of light rising
registerShot('e15', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k, y: -60 * k };
  const { GY, CX } = desert(g, t, cam, { mood: 'night', sunX: V(300, 200), wind: false });
  layer(g, cam, 1, (g) => { holyLight(g, t, [CX, GY - V(240, 300)], 0.6 + 0.4 * k); for (let i = 0; i < 30; i++) { const y = GY - ((t * 260 + i * 70) % (E.H * 1.2)); FX.sparkle(g, CX + Math.sin(i * 2.3) * 120, y, 16, HOLY, 0.8); } person(g, { x: CX, y: GY + 30, s: V(1.6, 1.7), facing: 1, outfit: IDRIS, pose: breathe(POSES.stand, t), expr: 'awe', look: [0, -1], rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
} });
// e16 — "Apa itu?"
registerShot('e16', { draw(g, t, info) {
  blurBg(g, (g) => desert(g, t, { z: 1.3 }, { mood: 'night', wind: false }), 14, 0.5, '#02030a');
  holyLight(g, t, [E.W / 2, E.H * 0.2], 0.4);
  big(g, '?', E.H * V(0.22, 0.24), GOLD(), ease.outBack(prog(t, 0.05, 0.4)), V(220, 240));
  commentPrompt(g, Math.max(0, t - 0.3), ['KEMULIAAN APA ITU?'], { y: E.H * V(0.5, 0.5) });
  text(g, 'BERSAMBUNG KE PART 3', E.W / 2, E.H * V(0.86, 0.86), { size: V(52, 54), color: '#ffffff', font: FONTS.title, stroke: 9, strokeColor: '#000', spacing: 3, alpha: ease.out(prog(t, 1.0, 1.6)) });
} });
