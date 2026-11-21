// shots/b_sea.js — p24–p51: the exodus, the chase, cornered at the sea, the parting, Pharaoh's end, the lesson.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, seg, circle, text, FONTS, wordTime } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { shore, corridor, crash, waterSurface } from '../sets/sea.js';
import { desert } from '../sets/desert.js';
import { city } from '../sets/egypt.js';
import { holyLight } from '../sets/tur.js';
import { person, bigPerson, staff, nemesFront, GOLD } from '../lib/_costume.js';
import { crowdBani, bani, chariot } from '../lib3/_army.js';
import { MUSA, HARUN, FIRAUN, PENJAGA } from '../cast.js';

const HOLY = '#fff0c0';
const wt = (w, after, info) => wordTime(w, after) - info.shot.start;
const RAISE = { ...POSES.stand, eF: [26, -206], hF: [36, -250], head: [6, -210] };

// p24 — "Maka Allah memerintahkan Musa membawa Bani Israil keluar dari Mesir,"  night, through the city gate
registerShot('p24', { draw(g, t, info) {
  const s = V(1.2, 1.25), cam = { z: 1.05, x: t * 50 };
  const { GY, CX, M } = city(g, t, cam, { mood: 'night', gateX: -V(200, 160) });
  const rim = { color: M.rim, dir: [-0.6, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    const x = CX - V(60, 40) + t * 90;
    person(g, { x, y: GY + 40, s, facing: 1, outfit: MUSA, pose: walkPose(t * Math.PI * 2 * 0.8), expr: 'determined', staff: true, rim });
    person(g, { x: x - V(130, 110), y: GY + 44, s: s * 0.97, facing: 1, outfit: HARUN, pose: walkPose(t * Math.PI * 2 * 0.8 + 1), expr: 'determined', rim });
    crowdBani(g, { x0: x - V(700, 560), x1: x - V(200, 170), y: GY + 46, s, n: 5, t, walk: true, depth: 30, rim, seed: 11 });
  });
} });
// p25 — "di tengah malam."  a long line under the moon
registerShot('p25', { draw(g, t, info) {
  const cam = { z: 1.0, x: t * 30 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'night', sunX: V(300, 200) });
  layer(g, cam, 1, (g) => crowdBani(g, { x0: CX - V(900, 700), x1: CX + V(500, 400), y: GY - V(30, 50), s: V(0.55, 0.6), n: 22, t, walk: true, depth: 20, rim: { color: M.rim, dir: [0, -1], w: 3 }, seed: 2 }));
} });
// p26 — "Saat fajar menyingsing, Firaun mengerahkan seluruh pasukannya…"
registerShot('p26', { draw(g, t, info) {
  const cam = { z: 1.08, x: -20 * t };
  const { GY, CX, M } = city(g, t, cam, { mood: 'pharaoh' });
  const rim = { color: M.rim, dir: [-1, -0.5], w: 4 };
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 6; i++) person(g, { x: CX - V(500, 400) + i * V(130, 110), y: GY + 40 + (i % 2) * 14, s: V(1.05, 1.1), facing: -1, outfit: PENJAGA, pose: breathe(POSES.stand, t, 1, i), expr: 'angry', spear: true, rim });
    person(g, { x: CX + V(360, 300), y: GY + 60, s: V(1.6, 1.65), facing: -1, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'crossArms'], [1.4, 'point']]), t), expr: 'angry', rim });
  });
} });
// p27 — "dan mengejar mereka!"  chariots race across the desert
registerShot('p27', { draw(g, t, info) {
  const cam = { z: 1.05, x: -t * 300 };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'pharaoh', sunX: V(300, 200) });
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 3; i++) chariot(g, CX + V(200, 150) - t * 360 + i * V(380, 300), GY + 40 + i * 30, V(0.85, 0.8), -1, t + i, i === 0 ? FIRAUN : PENJAGA, M.rim);
  });
  FX.speedLines(g, t, { count: 40, a: 0.18 });
  FX.dust(g, t, { count: 100, color: M.fog, a: 0.6, speed: -40 });
} });
// p28 — "Kini, Bani Israil terpojok di tepi laut."
registerShot('p28', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.12 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn' });
  layer(g, cam, 1, (g) => crowdBani(g, { x0: CX - V(800, 560), x1: CX + V(800, 560), y: GY + V(60, 80), s: V(0.9, 1.0), n: 16, t, facing: -1, pose: POSES.stand, expr: 'worried', depth: 90, rim: { color: M.rim, dir: [0, -1], w: 3 }, seed: 5 }));
} });
// p29 — "Kita pasti akan tersusul!"
registerShot('p29', { draw(g, t, info) {
  const M = mood('dawn'), [qx, qy] = shake(t, 4, 14);
  blurLayer(g, 14, (g) => shore(g, t, { z: 1.5, y: -100 }, { mood: 'dawn' })); veil(g, '#0a0614', 0.35);
  bigPerson(g, E.W / 2 + qx, E.H * V(0.6, 0.56) + qy, V(300, 330), { outfit: bani(2), expr: 'scared', talk: Math.max(0, 0.5 + 0.5 * Math.sin(t * 14)), look: [-0.5, 0], rimColor: M.rim, rimSide: 1 });
} });
// p30 — "teriak mereka ketakutan."  panic, looking back at the dust
registerShot('p30', { draw(g, t, info) {
  const cam = { z: 1.1, x: -30 * t };
  const { GY, CX, M } = desert(g, t, cam, { mood: 'dawn', sunX: -V(400, 300) });
  layer(g, cam, 0.5, (g) => { g.fillStyle = alpha(M.fog, 0.6); g.beginPath(); g.ellipse(CX + V(300, 200), GY - V(100, 140), E.W * 0.8, 120, 0, Math.PI, Math.PI * 2); g.fill(); });
  layer(g, cam, 1, (g) => crowdBani(g, { x0: CX - V(600, 480), x1: CX + V(400, 300), y: GY + V(80, 100), s: V(1.5, 1.6), n: 6, t, facing: 1, pose: POSES.fall, expr: 'shocked', depth: 60, rim: { color: M.rim, dir: [1, -0.5], w: 4 }, seed: 8 }));
} });
// p31 — "Tapi Musa menjawab dengan tenang:"
registerShot('p31', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.06 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn' });
  layer(g, cam, 1, (g) => {
    crowdBani(g, { x0: CX + V(80, 60), x1: CX + V(600, 480), y: GY + V(110, 130), s: V(1.35, 1.4), n: 4, t, facing: -1, pose: POSES.sad, expr: 'worried', depth: 40, rim: { color: M.rim, dir: [0, -1], w: 4 }, seed: 9 });
    person(g, { x: CX - V(200, 170), y: GY + V(110, 130), s: V(1.6, 1.7), facing: 1, outfit: MUSA, pose: breathe(posesAt(t, [[0, 'stand'], [0.8, 'explain']]), t), expr: 'smile', staff: true, staffHand: 'B', rim: { color: HOLY, dir: [0, -1], w: 5 } });
  });
} });
// p32 — "Sekali-kali tidak! Sesungguhnya Tuhanku bersamaku."
registerShot('p32', { draw(g, t, info) {
  blurLayer(g, 14, (g) => shore(g, t, { z: 1.5, y: -100 }, { mood: 'dawn' })); veil(g, '#08061a', 0.35);
  const up = ease.out(prog(t, wt('Tuhanku', 86, info) - 0.2, wt('Tuhanku', 86, info) + 0.6));
  holyLight(g, t, [E.W / 2, E.H * 0.25], 0.3 + 0.5 * up);
  bigPerson(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.03 * t), { outfit: MUSA, expr: 'determined', face: { brows: null }, talk: Math.max(0, 0.35 * Math.sin(t * 11)), look: [0, 0], rimColor: HOLY, rimSide: -1 });
} });
// p33 — "Dia akan memberi petunjuk kepadaku."  looking up, light descends
registerShot('p33', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.06 * k, y: -40 };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn' });
  layer(g, cam, 1, (g) => { holyLight(g, t, [CX, GY - V(200, 260)], 0.4 + 0.5 * k); person(g, { x: CX, y: GY + V(110, 130), s: V(1.8, 1.9), facing: 1, outfit: MUSA, pose: breathe(POSES.stand, t), expr: 'awe', look: [0, -1], staff: true, rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
} });
// p34 — "Allah memerintahkan: Pukullah laut itu dengan tongkatmu!"  at the water's edge, staff raised
registerShot('p34', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.1 * k, y: -30 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn' });
  const lift = wt('Pukullah', 93, info);
  layer(g, cam, 1, (g) => { person(g, { x: CX - V(40, 30), y: GY + V(60, 80), s: V(1.7, 1.8), facing: 1, outfit: MUSA, pose: breathe(posesAt(t, [[0, 'stand'], [lift, RAISE]], 0.5), t), expr: 'determined', staff: true, staffGlow: t > lift ? GOLD() : null, rim: { color: HOLY, dir: [0, -1], w: 6 } }); });
  holyLight(g, t, [E.W / 2, E.H * 0.2], 0.4 * ease.out(prog(t, lift, lift + 1)));
  FX.dust(g, t, { count: 50, color: HOLY, a: 0.4, speed: -20 });
} });
// p35 — "Musa memukulkan tongkatnya…"  insert: the staff strikes the water
registerShot('p35', { draw(g, t, info) {
  const hit = 0.6, after = t > hit, [qx, qy] = shake(t, after ? (1 - prog(t, hit, hit + 1)) * 18 : 0, 30); g.translate(qx, qy);
  const M = mood('dawn'); blurLayer(g, 10, (g) => shore(g, t, { z: 1.7, y: 160 }, { mood: 'dawn' }));
  const wy = E.H * 0.62; waterSurface(g, t, wy, 1);
  const u = ease.in(prog(t, 0, hit)), sx = E.W * 0.5, sy = lerp(E.H * 0.1, wy - 10, u);
  staff(g, sx + 60, sy - V(700, 800), sx, sy, 26, { color: HOLY, dir: [0, -1] }, GOLD());
  if (after) { const p = t - hit; FX.rings(g, sx, wy, p, { count: 4, r0: 30, r1: V(900, 800), speed: 1.2, color: '#e8f6ff', a: 0.8 * (1 - prog(p, 0, 1.6)), w: 6 }); glow(g, sx, wy, V(600, 600) * ease.out(prog(p, 0, 0.6)), HOLY, 0.6 * (1 - prog(p, 0.4, 1.6))); for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 18), d = p * 900; circle(g, sx + Math.cos(a) * d, wy + Math.sin(a) * d * 0.6 + p * p * 600, 10, alpha('#e8f6ff', 0.8 * (1 - prog(p, 0, 1.2)))); } }
} });
// p36 — "Dan laut pun terbelah menjadi dua!"
registerShot('p36', { draw(g, t, info) {
  const split = ease.inOut(prog(t, 0.1, 2.4)), [qx, qy] = shake(t, 6 * (1 - prog(t, 0, 2.6)), 20); g.translate(qx, qy);
  const cam = { z: 1.12 - 0.08 * split, y: -20 };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'dawn', split });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(30, 20), y: GY + V(120, 150), s: V(1.4, 1.5), facing: 1, outfit: MUSA, pose: breathe(RAISE, t), expr: 'awe', staff: true, staffGlow: GOLD(), rim: { color: HOLY, dir: [0, -1], w: 5 } }));
  FX.dust(g, t, { count: 70, color: '#e8f6ff', a: 0.5, speed: -40 });
} });
// p37 — "Setiap belahannya menjulang seperti gunung yang besar!"  3D: towering walls of water, camera flies down the path
registerShot('p37', {
  kind: '3d',
  init(T) {
    const M = mood('dawn'), { THREE } = T;
    const st = T.stage({ mood: 'dawn', fov: V(50, 64), fog: [30, 140], keyPos: [0, 30, -60], keyIntensity: 2.2, ambient: 1.2, bloom: 1.0 });
    st.add(T.ground(60, 400, '#6a5a44'));
    const water = new THREE.MeshStandardMaterial({ color: 0x1a5ab0, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.88, emissive: 0x0a2a60, emissiveIntensity: 0.6 });
    const foam = T.basic('#e8f6ff');
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 12; i++) { const h = 26 + Math.sin(i * 1.7) * 4, z = 20 - i * 25; const w = T.box(30, h, 25.5, water, sx * (5 + 15), h / 2, z); st.add(w); const f = T.box(30.4, 0.8, 25.6, foam, sx * 20, h + 0.2, z); st.add(f); }
    }
    for (let i = 0; i < 10; i++) { const p = T.sphere(0.25, T.basic('#7ab0e0'), (i % 3 - 1) * 2.5, 0.05, 10 - i * 18); p.scale.y = 0.1; st.add(p); }
    const people = []; for (let i = 0; i < 8; i++) { const f = T.figure3D(i === 0 ? MUSA : bani(i), { rim: M.rim, pose: POSES.stand }); f.position.set((i % 3 - 1) * 1.6, 0, -20 - i * 2.2); f.rotation.y = -Math.PI / 2; st.add(f); people.push(f); }
    return { stage: st, people };
  },
  draw(s, t, info, T) {
    for (const [i, f] of s.people.entries()) { f.setPose(walkPose(t * Math.PI * 2 * 0.8 + i)); f.position.z = -20 - i * 2.2 - t * 1.2; }
    T.dolly(s.stage.camera, t, [[0, { pos: [0, 2.2, 14], look: [0, 6, -40], fov: V(50, 64) }], [info.dur, { pos: [0, 4.5, -2], look: [0, 3, -60], fov: V(46, 60) }]]);
  },
});
// p38 — "Dasar laut menjadi jalan yang kering."
registerShot('p38', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.1 * k, y: 20 * k };
  corridor(g, t, cam, { mood: 'dawn' });
  FX.dust(g, t, { count: 50, color: HOLY, a: 0.4 });
} });
// p39 — "Musa dan Bani Israil menyeberang dengan selamat."
registerShot('p39', { draw(g, t, info) {
  const cam = { z: 1.03 };
  const { CX, hy } = corridor(g, t, cam, { mood: 'dawn' });
  // figures walking away down the path, scaled by depth
  const walkers = [{ of: MUSA, d: 0.35 }, { of: HARUN, d: 0.42 }]; for (let i = 0; i < 9; i++) walkers.push({ of: bani(i), d: 0.5 + i * 0.06, x: (i % 3 - 1) * 0.6 });
  walkers.sort((a, b) => a.d - b.d);
  for (const w of walkers) { const d = w.d - t * 0.03, y = lerp(hy, E.H * 1.05, d * d), s = lerp(0.1, 2.0, d * d); person(g, { x: CX + (w.x || 0) * 300 * d * d + (w.of === HARUN ? -40 : 0) * s, y, s, facing: 1, outfit: w.of, pose: walkPose(t * Math.PI * 2 * 0.8 + w.d * 10), expr: 'neutral', staff: w.of === MUSA, rim: { color: HOLY, dir: [0, -1], w: 3 } }); }
} });
// p40 — "Firaun tak mau kalah."  Pharaoh in his chariot at the shore
registerShot('p40', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.04 * t, x: 20 * t };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'pharaoh', split: 1 });
  layer(g, cam, 1, (g) => chariot(g, CX - V(200, 160), GY + V(160, 200), V(1.25, 1.3), 1, t * 0.4, FIRAUN, M.rim, 'angry', POSES.point));
} });
// p41 — "Ia memacu pasukannya masuk ke tengah laut…"
registerShot('p41', { draw(g, t, info) {
  const { CX, hy } = corridor(g, t, { z: 1.05 }, { mood: 'pharaoh' });
  const rows = []; for (let i = 0; i < 10; i++) rows.push({ d: 1.1 - i * 0.07 + t * 0.12, x: (i % 3 - 1) * 0.7, i });
  rows.sort((a, b) => a.d - b.d);
  for (const r of rows) { if (r.d <= 0.12) continue; const y = lerp(hy, E.H * 1.05, r.d * r.d), s = lerp(0.1, 2.0, r.d * r.d), x = CX + r.x * 300 * r.d * r.d; if (r.i === 4) chariot(g, x, y, s * 0.7, -1, t, FIRAUN, '#ff7a4a', 'angry'); else person(g, { x, y, s, facing: -1, outfit: PENJAGA, pose: walkPose(t * 9 + r.i, { run: true }), expr: 'angry', spear: true, rim: { color: '#ff7a4a', dir: [0, -1], w: 3 } }); }
  FX.dust(g, t, { count: 60, color: '#ffb080', a: 0.4, speed: 30 });
} });
// p42 — "Dan saat mereka semua berada di tengah…"  the walls tremble
registerShot('p42', { draw(g, t, info) {
  const [qx, qy] = shake(t, 2 + t * 3, 10); g.translate(qx, qy);
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.08 * k, y: -60 * k };
  const { CX, hy } = corridor(g, t, cam, { mood: 'storm', k: 1 + 0.05 * Math.sin(t * 6) });
  for (let i = 0; i < 12; i++) { const d = 0.35 + (i % 4) * 0.05, y = lerp(hy, E.H, d * d), s = lerp(0.1, 2, d * d); person(g, { x: CX + ((i % 3) - 1) * 200 * d + Math.floor(i / 4) * 30, y, s, facing: 1, outfit: PENJAGA, pose: walkPose(t * 8 + i, { run: true }), expr: 'angry', spear: true }); }
  veil(g, '#000818', 0.25 * k);
} });
// p43 — "Laut kembali menyatu!"
registerShot('p43', { draw(g, t, info) {
  const p = ease.in(prog(t, 0, 1.6)), [qx, qy] = shake(t, 20 * (1 - prog(t, 1.4, 2.2)), 30); g.translate(qx, qy);
  corridor(g, t, { z: 1.0 + 0.2 * p }, { mood: 'storm', collapse: p });
  crash(g, t, p);
  FX.speedLines(g, t, { count: 60, a: 0.3 * p });
  if (p > 0.95) veil(g, '#e8f6ff', 0.4 * (1 - prog(t, 1.6, 2.2)), 'lighter');
} });
// p44 — "Ketika air menenggelamkannya, Firaun berteriak, Aku beriman!"
registerShot('p44', { draw(g, t, info) {
  const M = mood('storm'), cry = wt('"Aku', 125, info);
  g.fillStyle = '#0a1430'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.rain(g, t, { count: 120, a: 0.3 });
  const sink = ease.in(prog(t, cry + 1.0, info.dur)), y = E.H * V(0.75, 0.7) + sink * 300;
  person(g, { x: E.W / 2, y: y + 150, s: V(2.2, 2.4), facing: 1, outfit: FIRAUN, pose: breathe(posesAt(t, [[0, 'fall'], [cry, POSES.cheer]]), t, 3), expr: t < cry ? 'scared' : 'shocked', talk: t > cry && t < cry + 1 ? 0.8 : 0, look: [0, -1], rim: { color: M.rim, dir: [0, -1], w: 5 } });
  waterSurface(g, t, E.H * V(0.62, 0.6), 0.96);
  for (let i = 0; i < 8; i++) circle(g, E.W / 2 + Math.sin(t * 9 + i) * 200, E.H * 0.6 - Math.abs(Math.sin(t * 6 + i)) * 60, 12, alpha('#e8f6ff', 0.7));
  if (t > cry && t < cry + 1.2) FX.rings(g, E.W / 2, E.H * 0.35, t - cry, { count: 2, r0: 40, r1: 260, speed: 1.4, color: '#ffe0c0', a: 0.4 });
} });
// p45 — "Tapi semuanya sudah terlambat."  the last bubbles
registerShot('p45', { draw(g, t, info) {
  g.fillStyle = '#0a1430'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const sy = E.H * 0.55; waterSurface(g, t, sy, 1);
  const hand = clamp(1 - t / 1.4);
  if (hand > 0) { const hx = E.W * 0.52, hy = sy - 80 * hand + 40; seg(g, [[hx, hy + 200], [hx, hy]], 22, S().ink); circle(g, hx, hy, 18, S().ink); for (let i = 0; i < 4; i++) seg(g, [[hx, hy], [hx - 18 + i * 12, hy - 34]], 8, S().ink); }
  waterSurface(g, t, sy + 4, 0.7);
  for (let i = 0; i < 10; i++) { const b = (t * 0.8 + i * 0.13) % 1; circle(g, E.W * 0.52 + Math.sin(i * 3) * 50, sy + 300 - b * 300, 6 + (i % 3) * 4, alpha('#e8f6ff', 0.6 * (1 - b))); }
} });
// p46 — "Raja yang mengaku tuhan itu… binasa ditelan lautan."  calm sea at sunrise, the nemes floating
registerShot('p46', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.12 * k };
  const { GY, CX, M, hy } = shore(g, t, cam, { mood: 'golden', calm: 1 });
  layer(g, cam, 0.4, (g) => { const fx = CX + V(80, 60), fy = lerp(hy, GY, 0.5) + Math.sin(t * 1.2) * 6; g.save(); g.translate(fx, fy); g.rotate(0.4 + Math.sin(t) * 0.05); g.scale(1, 0.7); nemesFront(g, 0, 0, V(110, 120), '#ffc890'); g.restore(); });
  FX.dust(g, t, { count: 30, color: M.key, a: 0.3 });
} });
// p47 — "Dari kisah Nabi Musa, kita belajar:"  safe on the far shore at sunrise
registerShot('p47', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.05 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'golden', calm: 1 });
  layer(g, cam, 1, (g) => {
    crowdBani(g, { x0: CX - V(700, 520), x1: CX + V(300, 200), y: GY + V(150, 180), s: V(1.3, 1.4), n: 6, t, facing: 1, pose: POSES.relaxed, expr: 'happy', depth: 60, rim: { color: M.rim, dir: [0, -1], w: 4 }, seed: 13 });
    person(g, { x: CX + V(280, 220), y: GY + V(160, 190), s: V(1.55, 1.6), facing: 1, outfit: MUSA, pose: breathe(POSES.relaxed, t), expr: 'smile', staff: true, rim: { color: M.rim, dir: [0, -1], w: 5 } });
    person(g, { x: CX + V(430, 360), y: GY + V(170, 200), s: V(1.5, 1.55), facing: 1, outfit: HARUN, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'smile', rim: { color: M.rim, dir: [0, -1], w: 5 } });
  });
} });
// p48 — "pertolongan Allah selalu datang kepada hamba-Nya yang beriman."  golden rays, gratitude
registerShot('p48', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 - 0.08 * k, y: -20 };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'golden', calm: 1 });
  FX.godRays(g, CX, GY - V(300, 420), { count: 12, angle: Math.PI / 2, spread: 2.6, len: E.H, color: '#ffe6b0', a: 0.1, t });
  layer(g, cam, 1, (g) => crowdBani(g, { x0: CX - V(600, 480), x1: CX + V(600, 480), y: GY + V(150, 180), s: V(1.4, 1.5), n: 7, t, facing: 1, pose: { ...POSES.cheer, eF: [24, -180], hF: [36, -210], eB: [-18, -180], hB: [-30, -210] }, expr: 'sleepy', depth: 60, rim: { color: '#ffe6b0', dir: [0, -1], w: 5 }, seed: 14 }));
} });
// p49 — "Jangan pernah takut menghadapi kesulitan, selama kita bertawakal kepada Allah."
registerShot('p49', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.06 * k, x: 20 * k, y: -60 };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'golden', calm: 1 });
  layer(g, cam, 1, (g) => person(g, { x: CX - V(60, 40), y: GY + V(160, 190), s: V(2.1, 2.2), facing: 1, outfit: MUSA, pose: breathe(POSES.relaxed, t), expr: 'smile', look: [0.6, -0.3], staff: true, rim: { color: M.rim, dir: [1, -0.6], w: 6 } }));
  FX.dust(g, t, { count: 40, color: M.key, a: 0.35 });
} });
// p50 — "Karena ketika semua jalan tampak tertutup…"  night, a lone figure facing the sea
registerShot('p50', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.08 * k };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'night' });
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + V(140, 170), s: V(1.6, 1.7), facing: 1, outfit: bani(4), pose: breathe(POSES.sad, t), expr: 'sad', rim: { color: M.rim, dir: [0, -1], w: 4 } }));
  veil(g, '#000', 0.2);
} });
// p51 — "Allah mampu membelah lautan untukmu."  light parts the sea; closing line
registerShot('p51', { draw(g, t, info) {
  const split = ease.inOut(prog(t, 0.1, 1.8)), cam = { z: 1.08 - 0.06 * split };
  const { GY, CX, M } = shore(g, t, cam, { mood: 'night', split });
  holyLight(g, t, [CX, GY - V(300, 420)], split);
  layer(g, cam, 1, (g) => person(g, { x: CX, y: GY + V(140, 170), s: V(1.6, 1.7), facing: 1, outfit: bani(4), pose: breathe(posesAt(t, [[0, 'sad'], [0.8, 'stand']]), t), expr: 'awe', look: [0, -0.5], rim: { color: HOLY, dir: [0, -1], w: 5 } }));
  const a = ease.out(prog(t, 2.2, 2.9));
  text(g, 'ALLAH MAMPU', E.W / 2, E.H * V(0.14, 0.14), { size: V(80, 80), color: '#ffffff', font: FONTS.title, stroke: 12, strokeColor: '#000', glow: 26, glowColor: 'rgba(255,240,190,.8)', spacing: 3, alpha: a });
  text(g, 'MEMBELAH LAUTAN UNTUKMU', E.W / 2, E.H * V(0.14, 0.14) + V(90, 92), { size: V(64, 62), color: S().ui.gold, font: FONTS.title, stroke: 10, strokeColor: '#000', glow: 26, glowColor: 'rgba(255,190,80,.8)', spacing: 2, alpha: a });
} });
