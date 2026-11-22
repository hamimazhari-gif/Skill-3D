// shots/yusuf1.js — Kisah Nabi Yusuf, Part 1 (y01–y34).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, rr, text, FONTS, wordTime, linGrad, backdrop } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { palace, city } from '../sets/egypt.js';
import { desert } from '../sets/desert.js';
import { well, camp, tent } from '../sets/madyan.js';
import { person, bigPerson, sheep, palm, flame, staff, GOLD } from '../lib/_costume.js';
import { qamis, wolf, camel, wellInside, wellTop, dreamSky, commentPrompt } from '../lib5/_yusuf.js';
import { YUSUF_KID, YUSUF, YAQUB, BROTHERS, MUSAFIR } from '../cast.js';

const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const HOLY = '#fff0c0';
const brothers = (g, x0, dx, y, s, t, o = {}) => BROTHERS.forEach((of, i) => person(g, { x: x0 + i * dx, y: y + (i % 2) * 10, s: s * (i === 0 ? 1.04 : 1), facing: o.facing ?? 1, outfit: of, pose: o.walk ? walkPose(t * Math.PI * 2 * 0.8 + i) : breathe(o.pose?.(i) || POSES.stand, t, 1, i), expr: o.expr?.(i) || 'neutral', look: o.look, rim: o.rim }));

// tent interior at night (warm oil lamp)
function tentInside(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#1a0e08', '#3a2416', '#2a180e']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let i = -8; i < 12; i++) { g.fillStyle = alpha(i % 2 ? '#8a2e22' : '#c8a060', 0.18); g.fillRect(CX + i * 120, -E.H, 60, E.H * 3); }
    poly3(g, CX, GY);
  });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#3a2416', '#120804']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); g.fillStyle = alpha('#8a2e22', 0.45); g.fillRect(CX - 420, GY + 10, 840, 120); });
  const lx = CX + (o.lampX ?? V(320, 260)), ly = GY - 20;
  layer(g, cam, 1, (g) => { rr(g, lx - 30, ly - 14, 60, 20, 8); g.fillStyle = '#8a6a30'; g.fill(); flame(g, lx + 20, ly - 12, 0.25, t, 2); FX.pool(g, lx, GY + 20, 520, 80, M.practical, 0.3); });
  return { GY, CX, M };
}
function poly3(g, CX, GY) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(-E.W, -E.H); g.lineTo(CX, GY - V(900, 1150)); g.lineTo(E.W * 2, -E.H); g.closePath(); g.fill(); }
const blurBg = (g, fn, k = 14, v = 0.35, c = '#0a0608') => { blurLayer(g, k, fn); veil(g, c, v); };

// y01 — "Bagaimana mungkin… anak yang dibuang ke sumur oleh saudaranya sendiri,"  looking down into the well
registerShot('y01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1.25 - 0.2 * k, 1.25 - 0.2 * k); g.rotate(0.05 * t); g.translate(-E.W / 2, -E.H / 2);
  wellTop(g, t, (g, cx, cy, R) => { glow(g, cx, cy, R * 0.5, '#9ab8ff', 0.18); person(g, { x: cx, y: cy + 90, s: 0.85, facing: 1, outfit: YUSUF_KID, pose: POSES.cheer, expr: 'scared', look: [0, -1], rim: { color: '#9ab8ff', dir: [0, -1], w: 3 } }); });
  g.restore();
} });
// y02 — "kelak menjadi orang paling berpengaruh di Mesir?"  flash-forward: adult Yusuf in the palace
registerShot('y02', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.08 * k, y: -60 - 40 * k };
  const { GY, CX, M } = palace(g, t, cam, {});
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + 30, s: V(2.1, 2.2), facing: 1, outfit: YUSUF, pose: breathe(POSES.relaxed, t), expr: 'smile', look: [0.3, -0.2], rim: { color: M.rim, dir: [0, -1], w: 6 } }));
  glow(g, E.W / 2, E.H * 0.4, V(700, 700), GOLD(), 0.15);
  FX.dust(g, t, { count: 40, color: M.practical, a: 0.4 });
} });
// y03 — "Tonton sampai akhir. Ada satu detail kecil yang membongkar sebuah kebohongan besar."
registerShot('y03', { draw(g, t, info) {
  g.fillStyle = '#060406'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.lightCone(g, E.W / 2, -50, { angle: Math.PI / 2, spread: 0.55, len: E.H * 1.1, color: '#ffe0b0', a: 0.25 });
  qamis(g, E.W / 2, E.H * 0.55, V(1.6, 1.8) * (1 + 0.04 * t), { blood: 1, rot: Math.sin(t) * 0.02 });
  const a = ease.out(prog(t, wt('kebohongan', 11, info) - 0.2, wt('kebohongan', 11, info) + 0.4));
  text(g, '?', E.W * 0.78, E.H * 0.3, { size: V(220, 240), color: GOLD(), font: FONTS.title, glow: 30, glowColor: 'rgba(255,190,80,.8)', alpha: a });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.35 });
} });
// y04 — title card
registerShot('y04', { draw(g, t, info) {
  blurBg(g, (g) => desert(g, t, { z: 1.2 }, { mood: 'night' }), 12, 0.45, '#04040e');
  UI.titleCard(g, t + 0.25, { lines: ['KISAH NABI YUSUF', 'PART 1'], dur: info.dur + 0.5, y: E.H * 0.46 });
} });
// y05 — "Yusuf kecil sangat disayangi ayahnya, Nabi Yaqub."
registerShot('y05', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.06 * k, x: 20 * k };
  const { GY, CX, M } = camp(g, t, cam, { fireX: V(-420, -380) });
  const rim = { color: M.practical, dir: [0, -1], w: 5 }, s = V(1.8, 1.9);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(90, 80), y: GY + 40, s, facing: 1, outfit: YAQUB, pose: breathe({ ...POSES.reach, eF: [30, -150], hF: [56, -170] }, t), expr: 'happy', look: [0.6, 0.5], staff: true, staffHand: 'B', rim });
    person(g, { x: CX + V(70, 60), y: GY + 44, s, facing: -1, outfit: YUSUF_KID, pose: breathe(POSES.cheer, t, 1, 2), expr: 'joy', look: [-0.4, -0.6], rim });
  });
  for (let i = 0; i < 6; i++) FX.sparkle(g, E.W / 2 + Math.sin(i * 2) * 240, E.H * 0.4 + Math.cos(i * 1.6) * 120 - t * 20, 12, M.practical, 0.5 * Math.abs(Math.sin(t * 3 + i)));
} });
// y06 — "Suatu malam, ia bermimpi:"  Yusuf asleep, dream light
registerShot('y06', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.08 * k };
  const { GY, CX } = tentInside(g, t, cam, { lampX: V(420, 330) });
  veil(g, '#00041a', 0.3);
  layer(g, cam, 1, (g) => person(g, { x: CX - V(40, 20), y: GY + 40, s: V(1.6, 1.7), rot: -Math.PI / 2, facing: 1, outfit: YUSUF_KID, pose: POSES.lie, expr: 'sleepy', rim: { color: '#ffd08a', dir: [0, -1], w: 4 } }));
  const d = ease.out(prog(t, 0.6, 1.8)); glow(g, E.W / 2, E.H * 0.45, V(500, 520) * d, '#c8d0ff', 0.4 * d);
  for (let i = 0; i < 8; i++) FX.sparkle(g, E.W / 2 + Math.sin(i * 2.4) * 260, E.H * 0.42 + Math.cos(i * 1.9) * 160, 14, '#e8ecff', d * Math.abs(Math.sin(t * 3 + i)));
} });
// y07 — "sebelas bintang, matahari, dan bulan"
registerShot('y07', { draw(g, t, info) {
  const st = wt('sebelas', 18, info), su = wt('matahari,', 19, info), mo = wt('bulan', 20, info);
  dreamSky(g, t, [clamp((t - st + 0.1) / 0.9) * 11, ease.out(prog(t, su - 0.1, su + 0.5)), ease.out(prog(t, mo - 0.1, mo + 0.5))]);
  const n = Math.min(11, Math.floor(clamp((t - st + 0.1) / 0.9) * 11 + 0.0001));
  if (n > 0 && t < su) UI.badge(g, { str: String(n), x: E.W - V(90, 90), y: V(110, 170), size: V(70, 80) });
} });
// y08 — "bersujud kepadanya!"  the heavenly bodies bow toward the glowing boy
registerShot('y08', { draw(g, t, info) {
  const bow = ease.inOut(prog(t, 0.1, 1.4)), bx = E.W / 2, by = E.H * V(0.86, 0.82);
  dreamSky(g, t, [11, 1, 1], bow, bx, by);
  glow(g, bx, by - 150, V(380, 420), HOLY, 0.5 * bow);
  person(g, { x: bx, y: by, s: V(1.3, 1.4), facing: 1, outfit: YUSUF_KID, pose: breathe(POSES.stand, t), expr: 'awe', look: [0, -1], rim: { color: HOLY, dir: [0, -1], w: 5 } });
} });
// y09 — "Nabi Yaqub berpesan:"
registerShot('y09', { draw(g, t, info) {
  const cam = { z: 1.12, x: 15 * t };
  const { GY, CX, M } = tentInside(g, t, cam, {});
  const rim = { color: '#ffd08a', dir: [1, -0.4], w: 5 }, s = V(1.7, 1.8);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(170, 150), y: GY + 40, s, facing: 1, outfit: YAQUB, pose: breathe(POSES.sit, t), expr: 'thinking', look: [0.6, 0.2], rim });
    person(g, { x: CX + V(130, 110), y: GY + 44, s, facing: -1, outfit: YUSUF_KID, pose: breathe(posesAt(t, [[0, 'explain'], [0.9, 'talk']]), t, 1, 2), expr: 'happy', talk: 0.3 + 0.3 * Math.sin(t * 12), rim });
  });
} });
// y10 — "Wahai anakku, jangan ceritakan mimpimu kepada saudara-saudaramu."
registerShot('y10', { draw(g, t, info) {
  const M = mood('interiorWarm');
  blurBg(g, (g) => tentInside(g, t, { z: 1.5, y: -80 }, {}), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.03 * t), { outfit: YAQUB, expr: t < 1.4 ? 'worried' : 'sad', talk: Math.max(0, 0.35 * Math.sin(t * 11)), look: [0.2, 0.3], rimColor: M.rim, rimSide: 1, blink: (t % 3.3) > 3.2 });
} });
// y11 — "Tapi kecemburuan sudah tumbuh."  brothers watching from behind a tent
registerShot('y11', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.06 * k, x: -30 * k };
  const { GY, CX, M } = camp(g, t, cam, { mood: 'dusk', fireX: V(260, 220) });
  layer(g, cam, 0.95, (g) => { person(g, { x: CX + V(330, 260), y: GY + 20, s: 1.0, facing: -1, outfit: YAQUB, pose: { ...POSES.reach, hF: [40, -120] }, expr: 'smile', rim: { color: M.practical, dir: [1, -0.3], w: 4 } }); person(g, { x: CX + V(420, 340), y: GY + 24, s: 1.0, facing: -1, outfit: YUSUF_KID, pose: POSES.cheer, expr: 'joy' }); });
  layer(g, cam, 1, (g) => {
    tent(g, CX - V(260, 220), GY + 60, V(520, 460), V(420, 460), M, 1, 0, t);
    brothers(g, CX - V(40, 60), V(110, 90), GY + 70, V(1.6, 1.6), t, { facing: 1, expr: (i) => i === 0 ? 'angry' : 'smirk', look: [1, 0], rim: { color: M.rim, dir: [1, -0.3], w: 4 } });
  });
  veil(g, '#0a1a08', 0.2);
} });
// y12 — "Ayah lebih mencintai Yusuf daripada kita!"
registerShot('y12', { draw(g, t, info) {
  const M = mood('dusk');
  blurBg(g, (g) => camp(g, t, { z: 1.5, y: -80 }, { fire: false }), 14, 0.4, '#0a0606');
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330), { outfit: BROTHERS[0], expr: 'angry', talk: Math.max(0, 0.5 * Math.sin(t * 13)), look: [-0.3, 0], rimColor: M.rim, rimSide: -1 });
} });
// y13 — "Mereka pun menyusun rencana."  whispering around the fire at night
registerShot('y13', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.08 * k, y: 40 };
  const { GY, CX, M } = camp(g, t, cam, { mood: 'night', stars: true, fireX: 0 });
  veil(g, '#000', 0.25);
  layer(g, cam, 1, (g) => { const r = { color: '#ff9a4a', dir: [0, 1], w: 4 }; [[-1, 0], [1, 1], [-1, 2], [1, 3]].forEach(([sd, i], j) => person(g, { x: CX + sd * V(150 + (j > 1 ? 120 : 0), 130 + (j > 1 ? 100 : 0)), y: GY + (j > 1 ? 10 : 50), s: V(1.4, 1.45) * (j > 1 ? 0.9 : 1), facing: -sd, outfit: BROTHERS[i], pose: breathe(POSES.crouch, t, 1, i), expr: 'smirk', look: [0.5, 0.5], rim: r })); });
  glow(g, E.W / 2, E.H * V(0.75, 0.66), 300, '#ff8a3a', 0.35);
} });
// y14 — "Ayah, izinkan Yusuf bermain bersama kami."
registerShot('y14', { draw(g, t, info) {
  const cam = { z: 1.08, x: 20 * t };
  const { GY, CX, M } = camp(g, t, cam, { fireX: V(-500, -420) });
  const rim = { color: M.practical, dir: [0, -1], w: 4 }, s = V(1.35, 1.4);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX + V(320, 280), y: GY + 40, s, facing: -1, outfit: YAQUB, pose: breathe(POSES.stand, t), expr: 'thinking', staff: true, rim });
    person(g, { x: CX + V(190, 170), y: GY + 46, s, facing: -1, outfit: YUSUF_KID, pose: breathe(POSES.stand, t, 1, 2), expr: 'happy', rim });
    brothers(g, CX - V(420, 380), V(120, 100), GY + 46, s, t, { facing: 1, pose: (i) => i === 0 ? POSES.explain : POSES.relaxed, expr: () => 'happy', rim });
  });
} });
// y15 — "Nabi Yaqub khawatir."
registerShot('y15', { draw(g, t, info) {
  const M = mood('dusk');
  blurBg(g, (g) => camp(g, t, { z: 1.5, x: 200, y: -80 }, {}), 14, 0.35);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.04 * t), { outfit: YAQUB, expr: 'worried', look: [-0.6, 0], rimColor: M.rim, rimSide: 1 });
} });
// y16 — "Aku takut dia dimakan serigala."  imagined wolf howling under the moon
registerShot('y16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'night', sunX: V(140, 80) });
  layer(g, cam, 0.6, (g) => wolf(g, CX - V(60, 40), GY - V(80, 120), V(1.6, 1.5), 1, { howl: t > 0.5, eyes: '#ffd040', rim: M.rim }));
  veil(g, '#200010', 0.15);
} });
// y17 — "Ingat kalimat ini…"  freeze
registerShot('y17', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.02 * t, r: 0.01 * t };
  const { GY, CX, M } = desert(g, 1.0, cam, { mood: 'night', sunX: V(140, 80), wind: false });
  layer(g, cam, 0.6, (g) => wolf(g, CX - V(60, 40), GY - V(80, 120), V(1.6, 1.5), 1, { howl: true, eyes: '#ffd040', rim: M.rim }));
  veil(g, '#0a1a40', 0.35);
  FX.drops(g, 0.2, { count: 30, color: '#e0e8ff', rMin: 2, rMax: 6 });
  UI.bigLine(g, t, { str: '"DIMAKAN SERIGALA"', dur: info.dur + 0.3, y: E.H * V(0.2, 0.22), size: V(80, 74) });
} });
// y18 — "karena sebentar lagi, mereka akan memakainya sendiri."  leading Yusuf into the desert
registerShot('y18', { draw(g, t, info) {
  const s = V(1.25, 1.3), cam = { z: 1.05, x: t * 60 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(300, 200) });
  const rim = { color: M.rim, dir: [1, -0.5], w: 4 };
  layer(g, cam, 1, (g) => { const x = CX - V(160, 150) + t * 100; brothers(g, x - V(420, 380), V(110, 90), GY + 40, s, t, { walk: true, expr: () => 'smirk', rim }); person(g, { x, y: GY + 46, s, facing: 1, outfit: YUSUF_KID, pose: walkPose(t * Math.PI * 2 * 0.9), expr: 'happy', rim }); });
} });
// y19 — "Di tengah perjalanan,"  at the well, they seize him
registerShot('y19', { draw(g, t, info) {
  const cam = { z: 1.1, x: 20 };
  const { GY, CX, M, wx } = well(g, t, cam, { wellX: V(260, 220), mood: 'golden' });
  const rim = { color: M.rim, dir: [-1, -0.4], w: 4 }, s = V(1.3, 1.35);
  layer(g, cam, 1, (g) => { person(g, { x: wx - V(170, 150), y: GY + 50, s, facing: -1, outfit: YUSUF_KID, pose: POSES.handsOnHead, expr: 'scared', rim }); brothers(g, CX - V(480, 420), V(100, 80), GY + 50, s, t, { facing: 1, pose: (i) => i < 2 ? POSES.reach : POSES.crossArms, expr: (i) => i === 0 ? 'angry' : 'smirk', rim }); });
} });
// y20 — "Yusuf dilemparkan ke dalam sumur yang gelap dan dalam."  falling, seen from above
registerShot('y20', { draw(g, t, info) {
  const fall = ease.in(prog(t, 0.1, 1.2)), [qx, qy] = shake(t, t > 1.1 && t < 1.6 ? 8 : 0, 30); g.translate(qx, qy);
  wellTop(g, t, (g, cx, cy, R) => { const s = lerp(1.4, 0.4, fall); person(g, { x: cx + Math.sin(t * 3) * 20 * (1 - fall), y: cy + 180 * s, s, rot: t * 2 * (1 - fall), facing: 1, outfit: YUSUF_KID, pose: POSES.fall, expr: 'scared', look: [0, -1], shadow: false }); });
  // brothers peering over the rim (heads only, seen from above)
  const R = V(330, 380); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5, hx = E.W / 2 + Math.cos(a) * R * 1.32, hy = E.H / 2 + Math.sin(a) * R * 1.32; circle(g, hx, hy, 58, BROTHERS[i].headColor); circle(g, hx, hy + 10, 46, S().ink); for (const dx of [-14, 14]) circle(g, hx + dx, hy + 22, 6, S().feature); }
} });
// y21 — "Seorang anak kecil, sendirian… dalam kegelapan."
registerShot('y21', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1 + 0.08 * k, 1 + 0.08 * k); g.translate(-E.W / 2, -E.H / 2);
  wellInside(g, t, { sky: '#ffcf8a', light: 0.45 });
  person(g, { x: E.W / 2, y: E.H * 0.9, s: V(2.0, 2.2), facing: 1, outfit: YUSUF_KID, pose: breathe({ ...POSES.sit, eF: [30, -110], hF: [40, -86], eB: [26, -110], hB: [36, -88], head: [10, -170] }, t, 0.7), expr: t > 2 ? 'cry' : 'sad', look: [0, -0.4], rim: { color: '#ffcf8a', dir: [0, -1], w: 5 } });
  g.restore();
} });
// y22 — "Malamnya, mereka pulang sambil menangis."
registerShot('y22', { draw(g, t, info) {
  const s = V(1.3, 1.35), cam = { z: 1.06, x: -t * 50 };
  const { GY, CX, M } = camp(g, t, cam, { mood: 'night', stars: true, fireX: V(-480, -400) });
  layer(g, cam, 1, (g) => { const x = CX + V(400, 330) - t * 90; brothers(g, x, V(120, 100), GY + 46, s, t, { facing: -1, walk: true, expr: () => 'sad', rim: { color: M.rim, dir: [-0.5, -1], w: 4 } }); });
} });
// y23 — "Ayah… Yusuf dimakan serigala!"
registerShot('y23', { draw(g, t, info) {
  const M = mood('night');
  blurBg(g, (g) => camp(g, t, { z: 1.5, y: -80 }, { mood: 'night', stars: true }), 14, 0.35, '#02030c');
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330), { outfit: BROTHERS[0], expr: 'cry', talk: Math.max(0, 0.5 * Math.sin(t * 12)), look: [0.3, 0], rimColor: '#ff9a4a', rimSide: 1 });
} });
// y24 — "Mereka membawa bajunya yang berlumuran darah."
registerShot('y24', { draw(g, t, info) {
  const M = mood('night');
  blurBg(g, (g) => camp(g, t, { z: 1.4 }, { mood: 'night', stars: true }), 12, 0.45, '#02030c');
  const up = ease.out(prog(t, 0, 0.8));
  qamis(g, E.W / 2, lerp(E.H * 0.9, E.H * 0.48, up), V(1.5, 1.7), { blood: 1, rot: -0.05 + Math.sin(t * 2) * 0.03, glowC: '#ff9a4a' });
  for (const sx of [-1, 1]) { seg(g, [[E.W / 2 + sx * V(200, 220), E.H * 1.1], [E.W / 2 + sx * V(190, 210), lerp(E.H * 0.95, E.H * 0.38, up)]], 26, S().ink); }
  flame(g, E.W * 0.82, E.H * 0.7, 0.5, t, 4);
} });
// y25 — "Tapi perhatikan… bajunya sama sekali tidak robek."
registerShot('y25', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, 1.2)); g.fillStyle = '#06040a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1 + 0.3 * k, 1 + 0.3 * k); g.translate(-E.W / 2, -E.H / 2);
  qamis(g, E.W / 2, E.H * 0.5, V(1.6, 1.8), { blood: 1 });
  g.restore();
  veil(g, '#000', 0.15);
  const a1 = ease.outBack(prog(t, wt('sama', 67, info) - 0.2, wt('sama', 67, info) + 0.3)), a2 = ease.out(prog(t, wt('robek.', 68, info) - 0.1, wt('robek.', 68, info) + 0.4));
  for (const [x, y] of [[0.5, 0.38], [0.36, 0.58], [0.62, 0.66]]) if (a1 > 0) { g.strokeStyle = alpha(GOLD(), 0.9); g.lineWidth = 6; g.setLineDash([16, 10]); g.beginPath(); g.arc(E.W * x, E.H * y, 90 * a1, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
  text(g, 'TIDAK ROBEK!', E.W / 2, E.H * V(0.86, 0.84), { size: V(100, 104), color: GOLD(), font: FONTS.title, stroke: 14, strokeColor: '#000', glow: 26, glowColor: 'rgba(255,190,80,.8)', alpha: a2 });
} });
// y26 — "Hati Nabi Yaqub hancur."
registerShot('y26', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.08 * k };
  const { GY, CX } = tentInside(g, t, cam, { lampX: V(360, 300) });
  veil(g, '#00041a', 0.3);
  layer(g, cam, 1, (g) => { const s = V(1.8, 1.9), x = CX - V(80, 60); person(g, { x, y: GY + 40, s, facing: 1, outfit: YAQUB, pose: breathe({ ...POSES.kneel, eF: [34, -90], hF: [60, -70], eB: [26, -92], hB: [52, -72], head: [18, -150] }, t, 1.5), expr: 'cry', rim: { color: '#ffd08a', dir: [1, -0.3], w: 5 } }); qamis(g, x + 70 * s, GY + 40 - 60 * s, 0.3 * s, { blood: 1, rot: 0.15 }); });
} });
// y27 — "Namun ia hanya berkata: Kesabaran yang baik itulah kesabaranku."
registerShot('y27', { draw(g, t, info) {
  const M = mood('interiorWarm'), calm = ease.out(prog(t, 1.0, 2.5));
  blurBg(g, (g) => tentInside(g, t, { z: 1.5, y: -80 }, {}), 14, 0.4);
  glow(g, E.W / 2, E.H * 0.35, V(600, 600), HOLY, 0.3 * calm);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.03 * t), { outfit: YAQUB, expr: calm > 0.5 ? 'sleepy' : 'sad', talk: t > 1.5 ? Math.max(0, 0.3 * Math.sin(t * 10)) : 0, rimColor: HOLY, rimSide: -1 });
  if (calm > 0) { g.fillStyle = '#8fd0ff'; g.globalAlpha = calm; g.beginPath(); g.ellipse(E.W / 2 - V(100, 110), E.H * V(0.6, 0.56) + 40, 10, 18, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
} });
// y28 — "Kalau kamu di posisi Nabi Yaqub, apa yang kamu rasakan? Tulis di komentar."
registerShot('y28', { draw(g, t, info) {
  blurBg(g, (g) => tentInside(g, t, { z: 1.4 }, {}), 16, 0.6, '#04020a');
  commentPrompt(g, t, ['KALAU KAMU', 'JADI NABI YAQUB…', 'APA YANG KAMU RASAKAN?'], { y: E.H * V(0.3, 0.33) });
} });
// y29 — "Sementara itu, sebuah timba turun ke dalam sumur."
registerShot('y29', { draw(g, t, info) {
  wellInside(g, t, { sky: '#fff0c0', light: 0.9, bucket: ease.inOut(prog(t, 0.6, info.dur)) });
  person(g, { x: E.W / 2 + V(80, 60), y: E.H * 0.92, s: V(1.9, 2.1), facing: -1, outfit: YUSUF_KID, pose: breathe(posesAt(t, [[0, 'sad'], [1.6, 'reach']]), t), expr: t > 1.6 ? 'awe' : 'sad', look: [-0.3, -1], rim: { color: '#fff0c0', dir: [0, -1], w: 5 } });
} });
// y30 — "Kabar gembira! Ada seorang anak di sini!"  the caravan finds him
registerShot('y30', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.06 + 0.05 * k };
  const { GY, CX, M, W, wx } = well(g, t, cam, { wellX: V(80, 60), mood: 'golden' });
  const rim = { color: M.rim, dir: [-1, -0.4], w: 4 };
  layer(g, cam, 0.92, (g) => { for (let i = 0; i < 2; i++) camel(g, CX + V(380, 300) + i * 260, GY + 20, V(1.0, 0.9), -1, t * 0.4 + i, { rim: M.rim, load: '#8a2e22' }); });
  layer(g, cam, 1, (g) => {
    person(g, { x: wx - V(220, 200), y: GY + 50, s: V(1.4, 1.45), facing: 1, outfit: MUSAFIR, pose: breathe(posesAt(t, [[0, 'reach'], [0.4, 'cheer']]), t), expr: 'shocked', rim });
    const up = ease.out(prog(t, 0.3, 1.5)); person(g, { x: wx, y: lerp(W.top + 150, W.top + 40, up), s: V(1.2, 1.25), facing: -1, outfit: YUSUF_KID, pose: POSES.cheer, expr: 'surprised', rim, shadow: false });
  });
} });
// y31 — "Yusuf diangkat…"
registerShot('y31', { draw(g, t, info) {
  const cam = { z: 1.2, y: -40 };
  const { GY, CX, M, W, wx } = well(g, t, cam, { wellX: V(40, 30), mood: 'golden' });
  const rim = { color: M.rim, dir: [-1, -0.4], w: 5 }, up = ease.out(prog(t, 0, 1.0));
  layer(g, cam, 1, (g) => {
    person(g, { x: wx - V(200, 180), y: GY + 50, s: V(1.5, 1.55), facing: 1, outfit: MUSAFIR, pose: { ...POSES.reach, hF: [70, -200] }, expr: 'happy', rim });
    person(g, { x: lerp(wx, wx - V(80, 70), up), y: lerp(W.top + 60, GY + 40, up), s: V(1.25, 1.3), facing: -1, outfit: YUSUF_KID, pose: posesAt(up, [[0, 'cheer'], [0.8, 'stand']]), expr: 'worried', rim, shadow: up > 0.9 });
  });
} });
// y32 — "lalu dijual sebagai budak dengan harga murah."  market: a few coins change hands
registerShot('y32', { draw(g, t, info) {
  const cam = { z: 1.12, x: 15 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'golden' });
  layer(g, cam, 0.9, (g) => { for (let i = -2; i <= 2; i++) { const x = CX + i * V(330, 260); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#c8a060' : '#8a2e22'; g.fillRect(x - 120 + k * 40, GY - 230, 40, 40); } seg(g, [[x - 110, GY - 190], [x - 110, GY]], 8, '#2a1a10'); seg(g, [[x + 110, GY - 190], [x + 110, GY]], 8, '#2a1a10'); } });
  const rim = { color: M.rim, dir: [-1, -0.4], w: 4 }, s = V(1.45, 1.5);
  layer(g, cam, 1, (g) => {
    person(g, { x: CX - V(260, 230), y: GY + 50, s, facing: 1, outfit: MUSAFIR, pose: breathe(POSES.holdFront, t), expr: 'smirk', rim });
    person(g, { x: CX + V(270, 230), y: GY + 50, s, facing: -1, outfit: { top: 'dress', color: '#3a2a46', head: 'hood', headColor: '#6a4a8a' }, pose: breathe(POSES.holdFront, t, 1, 2), expr: 'neutral', rim });
    person(g, { x: CX, y: GY + 56, s: s * 0.95, facing: 1, outfit: YUSUF_KID, pose: breathe(POSES.sad, t, 1, 3), expr: 'sad', look: [0, 0.6], rim });
    for (let i = 0; i < 3; i++) { const u = clamp((t - 0.5 - i * 0.4) / 0.5); if (u <= 0) continue; const x = lerp(CX + V(200, 170), CX - V(190, 160), u), y = GY - 150 * s - Math.sin(u * Math.PI) * 60; circle(g, x, y, 12, GOLD()); FX.sparkle(g, x, y, 16, '#fff4c0', 0.8); }
  });
} });
// y33 — "Tapi rencana Allah baru saja dimulai."  the caravan heads toward Egypt at sunrise
registerShot('y33', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.06 * k, x: t * 30 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'golden', sunX: V(260, 160) });
  layer(g, cam, 0.35, (g) => { for (const [x, w, h] of [[200, 260, 160], [420, 200, 120]]) { g.fillStyle = alpha('#2a160e', 0.6); g.beginPath(); g.moveTo(CX + x - w / 2, GY - V(170, 240)); g.lineTo(CX + x, GY - V(170, 240) - h); g.lineTo(CX + x + w / 2, GY - V(170, 240)); g.fill(); } });
  FX.godRays(g, E.W / 2 + V(260, 160), GY - V(330, 520), { count: 10, angle: Math.PI / 2, spread: 2.6, len: E.H, color: '#ffe0a0', a: 0.08, t });
  layer(g, cam, 1, (g) => { const x = CX - V(300, 260) + t * 70; for (let i = 0; i < 3; i++) camel(g, x + i * V(330, 260), GY + 30, V(0.9, 0.85), 1, t + i, { rim: M.rim, load: '#8a2e22' }); person(g, { x: x + V(170, 140), y: GY + 30, s: 0.9, facing: 1, outfit: YUSUF_KID, pose: walkPose(t * 5), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.5], w: 3 } }); });
} });
// y34 — "Menurutmu, ujian apa yang menunggu Yusuf di Mesir? Tulis di komentar!"
registerShot('y34', { draw(g, t, info) {
  blurBg(g, (g) => palace(g, t, { z: 1.25 }, { mood: 'pharaoh' }), 12, 0.45, '#0a0204');
  commentPrompt(g, t, ['UJIAN APA YANG', 'MENUNGGU YUSUF', 'DI MESIR?'], { y: E.H * V(0.22, 0.26) });
  const a = ease.out(prog(t, 1.4, 2.0));
  text(g, 'BERSAMBUNG KE PART 2', E.W / 2, E.H * V(0.86, 0.86), { size: V(56, 58), color: '#ffffff', font: FONTS.title, stroke: 10, strokeColor: '#000', spacing: 3, alpha: a });
} });
