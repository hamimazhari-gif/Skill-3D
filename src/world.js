// All locations in one scene at different x offsets. Story: "Pak Darto dan bonggol pisang" (Indonesian).
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, signTex, decal, paintTex, pop, smooth, clamp01, gradientMap, rng} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {kebun: 0, tepi: 40, teras: 80, pagi: 120};

export {LOOK_PRESETS, MOODS} from './lighting';

// Character design for this story: 'bean' (never used before) — round head, tuft hair, thicker limbs.
export const CHAR_DESIGN = 'bean';
const CAST = {
  darto: {},
  kakek: {},
  kakekNight: {hat: 'none'},
};

// Lighting plan (camera_plan.md): a dull, overcast and sad garden while it fails (shots 1-2); the garden edge at
// sunset ("suatu sore"), sad until "emasnya", then warmer; Kakek's porch at night lit by an oil lamp and a wall lamp
// (moon on); Darto's yard at dawn two weeks later, sun coming up on "asam"; the garden on a fresh morning for the
// watering, joyful when the leaves turn green, golden hour for the closing lines.
const sad = {...LOOK_PRESETS.overcast, ...MOODS.sad, keyPos: [-5, 11, 5]};
const fresh = {...LOOK_PRESETS.day, keyPos: [-6, 9, 7]};
const freshJoy = {...fresh, ...MOODS.joyful};
const golden = {...LOOK_PRESETS.goldenHour, keyPos: [-9, 5, 6], grade: {...LOOK_PRESETS.goldenHour.grade, sat: 1.14, vignette: 0.26}};
const sunsetSad = {...LOOK_PRESETS.sunset, keyPos: [-9, 5, 5], grade: {...LOOK_PRESETS.sunset.grade, sat: 0.85, vignette: 0.45}};
const sunsetWarm = {...LOOK_PRESETS.sunset, keyPos: [-9, 5, 5], grade: {...LOOK_PRESETS.sunset.grade, sat: 1.12, vignette: 0.3}};
const porch = {...LOOK_PRESETS.night, keyI: 1.5, hemiI: 1.0, keyPos: [-6, 10, 5], hemiSky: '#8a9ac8', hemiGround: '#4a3a3a',
  grade: {sat: 0.98, contrast: 1.06, tint: '#ffb070', tintAmt: 0.07, vignette: 0.45}};
const porchJoy = {...porch, grade: {...porch.grade, sat: 1.08, tintAmt: 0.1, vignette: 0.38}};

export const LOOK = {
  kebun: {keys: [{at: 0, ...sad}, {at: 'kecewa', ...sad}, {at: 'cut12', ...fresh}, {at: 'minggu', ...fresh}, {at: 'menghijau', ...freshJoy},
    {at: 86.95, ...freshJoy}, {at: 'cut15', ...golden}]},
  tepi: {keys: [{at: 0, ...sunsetSad}, {at: 'padahal', ...sunsetSad}, {at: 'emas', ...sunsetWarm}]},
  teras: {keys: [{at: 0, ...porch}, {at: 'tape', ...porch}, {at: 'jadi', ...porchJoy}]},
  pagi: {keys: [{at: 0, ...LOOK_PRESETS.dawn, keyPos: [-9, 4, 5]}, {at: 'membuka', ...LOOK_PRESETS.dawn, keyPos: [-9, 4, 5]},
    {at: 'asam', ...LOOK_PRESETS.day, ...MOODS.joyful, keyPos: [-7, 8, 6]}]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
const strip = (g, w, d, x, z, color, y, paint) => { const s = ground(w, d, color, paint); s.position.set(x, y, z); g.add(s); return s; };

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.emas + 0.05, dur: 0.4, color: '#ffd36a', strength: 0.45},
      {t: EVt.menjual2 + 0.55, dur: 0.25, color: '#fff4d6', strength: 0.25},
      {t: EVt.menghijau + 0.1, dur: 0.35, color: '#e8ffd0', strength: 0.3},
      {t: EVt.penyelamat + 0.05, dur: 0.4, color: '#ffe9b0', strength: 0.4},
      {t: EVt.bagikan, dur: 0.35, color: '#fff4d6', strength: 0.3},
    ],
    shakes: [{t: EVt.emas + 0.6, dur: 0.3, amp: 0.02}, {t: EVt.cacah + 0.3, dur: 0.25, amp: 0.012}, {t: EVt.membuka + 0.2, dur: 0.3, amp: 0.015},
      {t: EVt.menjual2 + 0.55, dur: 0.35, amp: 0.03}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const post = []; // run after the characters are posed (things that follow a hand)
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => {
    const base = name === 'kakekNight' ? 'kakek' : name;
    const c = makeChar(base, {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c;
  };
  const E = (k) => { if (EVt[k] === undefined) throw new Error('no EV ' + k); return EVt[k]; };
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  const lerp = (a, b, u) => a + (b - a) * u;
  const ramp = (t, t0, t1) => smooth((t - t0) / (t1 - t0));
  const bananaRow = (g, list) => list.forEach(([x, z, h, b], i) => { const tr = P.bananaTree({seed: 11 + i, h: h || 2.6, bunch: !!b}); at(tr, x, 0, z, i * 1.3); g.add(tr); });
  // A small standing tag (price-tag style board on a short stick) for in-world labels on tables.
  const tag = (text, w, h, o = {}) => { const g = new THREE.Group(); const s = sign(text, w, h, {bg: o.bg || '#f3e7d3', frame: o.frame || '#8a5a2a', depth: 0.02}); at(s, 0, h / 2 + 0.08, 0); g.add(s); g.add(cyl(0.008, 0.008, 0.1, '#7a5236', {hull: 0.003})); return g; };
  // Smell / gas lines: wavy translucent tubes that rise and fade, looping, between t0 and t1.
  const smell = (g, p, t0, t1, color = '#f2c86a') => {
    const grp = new THREE.Group(); at(grp, ...p); g.add(grp);
    const items = [];
    for (let i = 0; i < 3; i++) {
      const pts = []; for (let k = 0; k <= 16; k++) pts.push(new THREE.Vector3(Math.sin(k / 16 * Math.PI * 3) * 0.04, k / 16 * 0.32, 0));
      const mat = new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.8, depthWrite: false});
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.012, 5), mat);
      m.position.x = (i - 1) * 0.08; grp.add(m); items.push({m, mat, ph: i * 0.33});
    }
    updaters.push((t) => {
      grp.visible = t > t0 && t < t1;
      for (const q of items) { const u = ((t - t0) * 0.9 + q.ph) % 1; q.m.position.y = u * 0.25; q.mat.opacity = Math.sin(u * Math.PI) * 0.85; q.m.scale.setScalar(0.8 + u * 0.4); }
    });
    return grp;
  };

  // =====================================================================================================
  // ---------- kebun: Pak Darto's vegetable garden (shots 1, 2, 12, 13, 14, 15) ----------
  {
    const g = addLoc('kebun');
    g.add(ground(140, 140, '#8fb36a'));
    strip(g, 8, 6.4, 0, -3.4, '#7a5a3a', 0.008, {stains: 30});
    strip(g, 3, 40, 0, 2, '#b89a6a', 0.006, {stains: 30});
    const hills = P.hills('#7fa35a'); g.add(hills);
    // raised beds with seedlings in polybags; one shared leaf material turns yellow / green
    const leafMat = new THREE.MeshToonMaterial({color: '#b5b84a', gradientMap: gradientMap()});
    const plants = [];
    const bedZ = [-1.4, -2.8, -4.2, -5.6];
    const rr = rng(4);
    bedZ.forEach((z, bi) => {
      const bed = box(6.4, 0.22, 0.9, toon('#6a4a32', {paint: {seed: 61 + bi, grain: 200, stains: 24, chips: 0, scratches: 0}})); at(bed, 0, 0, z); g.add(bed);
      for (let i = 0; i < 7; i++) {
        const s = P.seedling(leafMat, {seed: bi * 10 + i}); at(s.group, -2.7 + i * 0.9 + (rr() - 0.5) * 0.12, 0.22, z + (rr() - 0.5) * 0.18, rr() * 6); g.add(s.group); plants.push(s);
      }
    });
    const heroPlant = P.seedling(leafMat, {seed: 99, leaves: 6}); at(heroPlant.group, 0.85, 0, 0.55, 0.4); heroPlant.group.scale.setScalar(1.6); g.add(heroPlant.group); plants.push(heroPlant);
    // the plant under the watering can (shot 12) is moved under the stream each frame
    const wetPlant = P.seedling(leafMat, {seed: 98}); g.add(wetPlant.group); plants.push(wetPlant);
    // background: banana trees, a hut, a few trees
    bananaRow(g, [[-5.2, -8.2, 2.8, 1], [-3.1, -9.6, 2.5], [-1.0, -8.6, 2.9, 1], [1.4, -9.3, 2.6], [3.4, -8.3, 2.8, 1], [5.6, -9.6, 2.6], [-6.6, -5.8, 2.6], [6.7, -6.2, 2.7, 1]]);
    const hut = P.house(2.6, 2.1, 2.2, {color: '#c9a06a', roof: '#9a7a4a', windows: 1, doorColor: '#7a4a32', seed: 7}); at(hut, -4.9, 0, -3.6, 0.55); g.add(hut);
    for (const [x, z, s] of [[7.5, -11, 7], [-8.5, -12, 9], [9, -4, 3]]) { const tr = P.tree({seed: s, h: 2.6}); at(tr, x, 0, z); g.add(tr); }
    // "DIJUAL - KEBUN INI" sign on a post; it falls over on "menjual" (shot 14)
    const sale = new THREE.Group(); at(sale, 0.5, 0, -0.6); g.add(sale);
    sale.add(cyl(0.05, 0.06, 1.65, '#7a5236'));
    const saleB = sign(L.sale, 1.05, 0.62, {bg: '#c75b5b', fg: '#fff3df', frame: '#6a2f2a', sub: L.saleSub}); at(saleB, 0, 1.45, 0.06); sale.add(saleB);
    // fertiliser sacks (pop on "pupuk")
    const sacks = [[1.55, -0.55, 0.2], [2.0, -0.35, -0.3], [1.8, -0.95, 0.1]].map(([x, z, ry], i) => { const s = P.sack(L.pupuk, {color: '#ece4cc'}); at(s, x, 0, z, ry); g.add(s); return s; });
    // shot 12: bucket of diluted MOL (1 : 10) + a jerrycan; watering can in Darto's hand
    const bk = P.bucket('#4f7fa6', '#d8c89a', L.ratio); at(bk.group, -0.42, 0, -2.08, 0.25); g.add(bk.group);
    const jcan12 = P.jerrycan('#3f7fc8', L.mol); at(jcan12.group, -0.95, 0, -2.15, 0.3); g.add(jcan12.group);
    // root jar on a crate (shot 13)
    const crate = P.crate(0.5, 0.45, 0.45, null, '#a8784a'); at(crate, -1.45, 0, 0.35, 0.2); g.add(crate);
    const jar = P.rootJar(); at(jar.group, -1.45, 0.45, 0.35); g.add(jar.group);
    const jarPlant = P.seedling(leafMat, {seed: 97}); at(jarPlant.group, -1.45, 0.45 + 0.09, 0.35); g.add(jarPlant.group); plants.push(jarPlant);
    // shot 14: a row of MOL jerrycans + a basket of bonggol kept for the next batch
    const mols = [1.55, 1.95, 2.35].map((x, i) => { const j = P.jerrycan(['#3f7fc8', '#e8a83a', '#5a9a8a'][i], L.mol); at(j.group, x, 0, -0.55 - (i % 2) * 0.1, -0.2); g.add(j.group); return j; });
    const basket = new THREE.Group(); at(basket, 1.15, 0, -0.05); g.add(basket);
    basket.add(cyl(0.3, 0.24, 0.3, toon('#b8925a', {paint: {stripes: {n: 14, color: '#9a7a4a'}, seed: 21}})));
    for (const [x, z, s] of [[-0.1, 0.02, 0.6], [0.11, -0.06, 0.55], [0.0, 0.12, 0.5]]) { const b = P.bonggol(s, {seed: x * 100}); at(b, x, 0.2, z); basket.add(b); }
    // closing banner (shot 15)
    const save = P.banner(L.save, 2.4, 0.55, {poleH: 2.55, bg: '#5a9a5a', frame: '#2f5a2f'}); at(save, 0.05, 0, -0.85); g.add(save);

    const darto = ch('darto', {seed: 61}, g, -0.5, -0.3, 0);
    const can = P.wateringCan('#5a9a8a'); held(darto, can.group, {x: 0.04, y: -0.08, z: 0.06, rz: 0});
    const kakek = ch('kakek', {seed: 62}, g, 0.6, -0.3, 0);
    darto.act([
      {t: 0, pose: 'idle', expr: 'sad', action: 'slump', dur: 1.6},
      {t: E('menjual') + 0.1, pose: 'point', expr: 'worried'},
      {t: cut(2), pose: 'idle', expr: 'worried'},
      {t: E('uang') + 0.1, pose: 'shrug', expr: 'sad', action: 'shake', dur: 0.7},
      {t: E('pupuk') + 0.1, pose: 'present', expr: 'nervous'},
      {t: E('kecewa') + 0.1, pose: 'facepalm', expr: 'cry', action: 'slump', dur: 1.3},
      {t: cut(12), pose: 'hold', expr: 'determined'},
      {t: E('sepuluh') + 0.1, expr: 'happy', action: 'nod', dur: 0.6},
      {t: E('menyiram') - 0.1, pose: 'give', expr: 'cheesy'},
      {t: cut(13), pose: 'idle', expr: 'surprised'},
      {t: E('menghijau') + 0.1, pose: 'cheer', expr: 'toothy', action: 'jump', dur: 0.6},
      {t: cut(14), pose: 'hips', expr: 'determined'},
      {t: E('tidakjadi') + 0.1, pose: 'stop', expr: 'smug', action: 'shake', dur: 0.7},
      {t: E('menjual2') + 0.1, pose: 'point', expr: 'toothy'},
      {t: E('sejak') - 0.1, pose: 'present', expr: 'proud'},
      {t: E('membuang') + 0.05, pose: 'hips', expr: 'smug', action: 'shake', dur: 0.7},
      {t: E('bonggol2') + 0.1, pose: 'presentBoth', expr: 'cheesy'},
      {t: cut(15), pose: 'wave', expr: 'happy'},
      {t: E('sampah') + 0.1, pose: 'chin', expr: 'thinking'},
      {t: E('penyelamat') + 0.1, pose: 'cheer', expr: 'toothy', action: 'jump', dur: 0.6},
      {t: E('simpan') + 0.1, pose: 'point', expr: 'cheesy'},
      {t: E('bagikan') + 0.05, pose: 'armsUp', expr: 'laugh', action: 'jump', dur: 0.6},
    ]);
    kakek.act([
      {t: 0, pose: 'wave', expr: 'happy'},
      {t: E('sampah') + 0.2, pose: 'present', expr: 'proud', action: 'nod', dur: 0.6},
      {t: E('penyelamat') + 0.2, pose: 'pointUp', expr: 'cheesy'},
      {t: E('bagikan') + 0.15, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.8},
    ]);
    // effects
    fx(g, FX.dust([0.5, 0.05, -1.9], E('menjual2') + 0.55, {n: 10, size: 0.5}), (t) => inShots(t, 14));
    fx(g, FX.glints([0, 0.7, -2.5], E('menghijau'), {n: 40, spread: 3, color: '#eaffb0'}), (t) => inShots(t, 13));
    fx(g, FX.glints([-1.45, 0.75, 0.35], E('kuat') - 0.2, {n: 16, spread: 0.4}), (t) => inShots(t, 13));
    fx(g, FX.glints([1.15, 0.6, -0.05], E('penyelamat'), {n: 22, spread: 0.6}), (t) => inShots(t, 15));
    fx(g, FX.glints([1.15, 0.6, -0.05], E('bonggol2'), {n: 16, spread: 0.5}), (t) => inShots(t, 14));
    fx(g, FX.confetti([0, 2.6, -0.4], E('bagikan') + 0.05, {colors: ['#e8a83a', '#7fb35a', '#f2d24a', '#c75b5b', '#f3e7d3']}), (t) => inShots(t, 15));
    // water stream from the can (shot 12)
    const NDROP = 40;
    const dropGeo = new THREE.BufferGeometry(); const dropPos = new Float32Array(NDROP * 3); dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
    const drops = new THREE.Points(dropGeo, new THREE.PointsMaterial({color: '#cfeaff', size: 0.035, transparent: true, opacity: 0.9, depthWrite: false})); drops.frustumCulled = false; g.add(drops);
    const splashF = fx(g, FX.splash([0, 0, 0], E('menyiram') + 0.25, {n: 50, speed: 1.0, size: 0.05, repeat: 0}), (t) => inShots(t, 12));
    const tipW = new THREE.Vector3(), tmpV = new THREE.Vector3();
    const darkGreen = new THREE.Color('#5fae3a'), sick0 = new THREE.Color('#b5b84a'), sick1 = new THREE.Color('#d9bf45'), tmpC = new THREE.Color();

    updaters.push((t) => {
      const s1 = inShots(t, 1, 2), s12 = inShots(t, 12), s13 = inShots(t, 13), s14 = inShots(t, 14), s15 = inShots(t, 15);
      // --- plant health: kerdil + menguning, then menghijau and growing ---
      let col, droop, grow;
      if (t < cut(13)) {
        const y = t < cut(3) ? ramp(t, E('menguning') - 0.1, E('menguning') + 0.8) : 1;
        col = tmpC.copy(sick0).lerp(sick1, y); droop = -0.35 - 0.25 * y; grow = 0.75;
      } else {
        const gk = ramp(t, E('minggu'), E('akar') + 0.4), ck = ramp(t, E('menghijau') - 0.9, E('menghijau') + 0.6);
        col = tmpC.copy(sick1).lerp(darkGreen, ck); droop = lerp(-0.6, 0.18, ck); grow = lerp(0.75, 1.7, gk);
        if (t >= cut(14)) { col = darkGreen; droop = 0.18; grow = 1.75; }
      }
      leafMat.color.copy(col);
      for (const p of plants) { p.top.scale.setScalar(grow); p.leaves.forEach((l, i) => { l.rotation.z = droop + Math.sin(t * 1.7 + i) * 0.04; }); }
      heroPlant.group.visible = (s1 && t < E('uang') - 0.2) || s13;
      // --- props by shot ---
      sale.visible = !s13 && !s15;
      const fall = t < E('menjual2') + 0.15 ? 0 : clamp01((t - E('menjual2') - 0.15) / 0.42);
      sale.rotation.x = t >= cut(14) ? -1.5 * fall * fall : 0;
      sacks.forEach((s, i) => { s.visible = s1 || s12; s.scale.setScalar(t < cut(3) ? pop(t, E('pupuk') - 0.1 + i * 0.1, 0.35) : 1); });
      bk.group.visible = jcan12.group.visible = s12;
      crate.visible = jar.group.visible = jarPlant.group.visible = s13;
      jar.roots.scale.set(lerp(0.4, 1, ramp(t, E('akar'), E('kuat') + 0.3)), lerp(0.25, 1.05, ramp(t, E('akar') - 0.1, E('kuat') + 0.3)), lerp(0.4, 1, ramp(t, E('akar'), E('kuat') + 0.3)));
      mols.forEach((j, i) => { j.group.visible = s14 || s15; j.group.scale.setScalar(s14 ? pop(t, E('sejak') + 0.15 + i * 0.2, 0.35) : 1); });
      basket.visible = s14 || s15; basket.scale.setScalar(s14 ? pop(t, E('bonggol2') - 0.15, 0.35) : 1);
      save.visible = s15; save.scale.setScalar(pop(t, E('simpan') - 0.1, 0.4));
      // --- characters ---
      darto.group.visible = s1 || s12 || s13 || s14 || s15;
      kakek.group.visible = s15;
      can.group.visible = s12;
      if (s1) darto.group.position.set(-0.5, 0, -0.3);
      else if (s12) darto.group.position.set(0.15, 0, -2.12);
      else if (s13) darto.group.position.set(-2.25, 0, -2.12);
      else if (s14) darto.group.position.set(t < E('sejak') - 0.15 ? -0.35 : 0.65, 0, -0.3);
      else darto.group.position.set(-0.5, 0, -0.3);
      // pouring: tilt the can, droplets fall from the spout, the wet plant sits under the stream
      const pour = s12 ? ramp(t, E('menyiram') - 0.1, E('menyiram') + 0.25) : 0;
      can.group.rotation.z = -0.75 * pour;
      drops.visible = pour > 0.5;
      wetPlant.group.visible = s12;
    });
    post.push((t) => {
      const s12 = inShots(t, 12);
      if (s12) {
        g.updateMatrixWorld(true);
        tipW.copy(can.tip); can.group.localToWorld(tipW); g.worldToLocal(tipW);
        wetPlant.group.position.set(tipW.x + 0.08, 0.22, Math.max(-1.75, Math.min(-1.05, tipW.z)));
        splashF.obj.position.set(wetPlant.group.position.x, 0.42, wetPlant.group.position.z);
        for (let i = 0; i < NDROP; i++) {
          const u = ((t * 1.6 + i / NDROP) % 1);
          tmpV.set(lerp(tipW.x, wetPlant.group.position.x, u) + Math.sin(i * 7.1) * 0.02, lerp(tipW.y, 0.42, u * u), lerp(tipW.z, wetPlant.group.position.z, u) + Math.cos(i * 5.3) * 0.02);
          dropPos[i * 3] = tmpV.x; dropPos[i * 3 + 1] = tmpV.y; dropPos[i * 3 + 2] = tmpV.z;
        }
        dropGeo.attributes.position.needsUpdate = true;
      }
    });
  }

  // =====================================================================================================
  // ---------- tepi: the edge of the garden at sunset, a pile of cut banana trunks (shots 3, 4, 5) ----------
  {
    const g = addLoc('tepi');
    g.add(ground(140, 140, '#8fae62'));
    strip(g, 40, 1.1, 0, -0.55, '#b89a6a', 0.006, {stains: 30});
    g.add(P.hills('#7a9a5a'));
    const sun = P.sunBall(2.6, '#ffb060'); sun.position.set(-16, 4.5, -45); g.add(sun);
    bananaRow(g, [[-3.6, -4.6, 2.7, 1], [-1.4, -5.6, 2.5], [2.2, -4.8, 2.8, 1], [4.4, -6.0, 2.6], [-6.0, -7.0, 2.6], [6.6, -3.8, 2.7, 1], [0.6, -8.4, 2.6, 1]]);
    // fresh stumps where the trees were cut
    for (const [x, z] of [[0.9, -2.6], [-1.6, -3.0], [3.4, -2.4]]) { const s = P.bananaLog(0.28, 0.17); s.rotation.z = Math.PI / 2; at(s, x, 0.14, z, 0, 0, Math.PI / 2); g.add(s); }
    // bamboo fence along the back
    for (let i = 0; i < 16; i++) { const p = cyl(0.04, 0.045, 1.0, '#c9a45a', {hull: 0.008}); at(p, -6 + i * 0.8, 0, -2.0); g.add(p); }
    for (const y of [0.45, 0.85]) { const r = cyl(0.03, 0.03, 12.4, '#b8924a', {hull: 0.006, center: true}); at(r, 0, y, -2.0, 0, 0, Math.PI / 2); g.add(r); }
    const bench = P.bale(1.6, 0.55, 0.42); at(bench, 0, 0, -1.25); g.add(bench);
    // the pile of cut banana trunks right in front of Darto (hides his legs while he sits)
    const pile = new THREE.Group(); at(pile, 0, 0, -0.02); g.add(pile);
    const logs = [[0, -0.62, 1.9], [0.06, -0.3, 1.8], [-0.05, 0.02, 1.95], [0.03, -0.46, 1.7, 1], [-0.04, -0.14, 1.75, 1], [0.02, -0.3, 1.55, 2]];
    for (const [x, z, len, layer = 0] of logs) { const l = P.bananaLog(len, 0.16); at(l, x, layer * 0.27, z, (x - 0.01) * 2); pile.add(l); }
    // bonggol pile (the "gold") on the right
    const goldMat = toon('#a8865a', {noCache: true, paint: {seed: 33, stains: 30, chips: 20, scratches: 14}});
    goldMat.emissive = new THREE.Color('#ffb020'); goldMat.emissiveIntensity = 0;
    const corms = [[1.55, 0.25, 1.0], [2.05, 0.05, 0.9], [1.8, -0.35, 1.05], [2.35, -0.25, 0.85], [1.35, -0.2, 0.8]].map(([x, z, s], i) => { const b = P.bonggol(s, {seed: i + 3, mat: goldMat}); at(b, x, 0, z, i * 1.1); g.add(b); return b; });
    fx(g, FX.glints([1.85, 0.45, -0.05], E('emas') + 0.05, {n: 36, spread: 0.9, color: '#ffe07a'}), (t) => inShots(t, 5));
    fx(g, FX.glints([1.85, 0.45, -0.05], E('bonggol') + 0.05, {n: 24, spread: 0.7, color: '#ffe07a'}), (t) => inShots(t, 5));
    const darto = ch('darto', {seed: 63}, g, 0, -1.05, 0);
    darto.setSit(1);
    const kakek = ch('kakek', {seed: 64}, g, -4.6, -0.55, 0);
    const walkEnd = E('lewat') + 0.9;
    darto.act([
      {t: 0, pose: 'limp', expr: 'sad'},
      {t: E('duduk') + 0.1, action: 'slump', dur: 4.5},
      {t: E('menatap') + 0.1, expr: 'tired'},
      {t: E('ditebang') + 0.1, expr: 'sad'},
      {t: E('kakek') + 0.15, pose: 'idle', expr: 'surprised'},
      {t: E('empat') + 0.1, expr: 'neutral'},
      {t: E('tertawa') + 0.2, pose: 'shrug', expr: 'confused'},
      {t: E('mahal') + 0.1, pose: 'idle', expr: 'nervous', action: 'tremble', dur: 0.7},
      {t: E('padahal') + 0.25, pose: 'idle', expr: 'surprised'},
      {t: E('emas') + 0.1, pose: 'armsUp', expr: 'shocked', action: 'jump', dur: 0.6},
      {t: E('menunjuk') + 0.25, pose: 'idle', expr: 'surprised'},
      {t: E('bonggol') + 0.2, pose: 'chin', expr: 'thinking'},
    ]);
    kakek.act([
      {t: 0, pose: 'idle', expr: 'happy', action: 'walk', dur: 0},
      {t: cut(4), pose: 'idle', expr: 'happy', action: 'walk', dur: walkEnd - cut(4)},
      {t: E('empat') + 0.1, pose: 'hips', expr: 'proud', action: 'nod', dur: 0.6},
      {t: E('tertawa') + 0.05, pose: 'hips', expr: 'laugh', action: 'hop', dur: 0.8},
      {t: cut(5), pose: 'hips', expr: 'smug', action: 'talk', dur: E('situ') + 0.4 - cut(5)},
      {t: E('mahal') + 0.1, pose: 'shrug', expr: 'scheming'},
      {t: E('emas') + 0.1, pose: 'pointUp', expr: 'cheesy'},
      {t: E('menunjuk') + 0.05, pose: 'point', expr: 'smug'},
    ]);
    fx(g, FX.dust([0, 0.05, -0.9], E('emas') + 0.6, {n: 8, size: 0.5}), (t) => inShots(t, 5));
    updaters.push((t) => {
      darto.setSit(t < E('padahal') + 0.25 ? 1 : 0);
      const u = ramp(t, cut(4), walkEnd);
      kakek.group.position.x = lerp(-4.6, -1.35, u);
      kakek.group.visible = t >= cut(4);
      goldMat.emissiveIntensity = t < E('emas') ? 0 : 0.25 + 0.55 * Math.exp(-(t - E('emas')) * 2.5) + 0.12 * Math.sin(t * 6);
      corms.forEach((c, i) => { c.position.y = t > E('emas') ? Math.max(0, Math.sin((t - E('emas')) * 9 - i) * 0.04 * Math.exp(-(t - E('emas')) * 2)) : 0; });
    });
  }

  // =====================================================================================================
  // ---------- teras: Kakek Rahmat's porch at night, the old recipe (shots 6-10) ----------
  {
    const g = addLoc('teras');
    g.add(ground(140, 140, '#5a7a4a'));
    const floor = box(7, 0.1, 3.4, toon('#8a6a4a', {paint: {planks: 14, seed: 77}}), {edges: false}); at(floor, 0, -0.1, -1.5); g.add(floor);
    const house = P.house(7, 2.9, 3, {color: '#b08454', roof: '#6a3a2a', windows: 2, doorX: -3.0, shutter: '#4f6a4f', doorColor: '#6a3a26', seed: 12}); at(house, 0, 0, -3.0); g.add(house);
    for (const x of [-3.3, 3.3]) { const p = cyl(0.07, 0.08, 2.9, '#6a4a32'); at(p, x, 0, -0.2); g.add(p); }
    const beam = box(7.2, 0.14, 0.16, '#6a4a32'); at(beam, 0, 2.9, -0.2); g.add(beam);
    bananaRow(g, [[-5.5, -1.0, 2.6, 1], [5.6, -0.6, 2.7], [-6.5, 2.5, 2.5]]);
    // table
    const table = box(2.5, 0.8, 0.75, toon('#7a5236', {paint: {planks: 6, seed: 18}})); at(table, 0, 0, -1.3); g.add(table);
    const TT = 0.8;
    // oil lamp on the table + a wall lamp: the practical lights that light the faces
    const lampB = new THREE.Group(); at(lampB, -1.0, TT, -1.5); g.add(lampB);
    lampB.add(cyl(0.07, 0.09, 0.1, '#8a6a3a', {hull: 0.006}));
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 14, 1, true), new THREE.MeshBasicMaterial({color: '#ffe0a0', transparent: true, opacity: 0.35, depthWrite: false})); glass.position.y = 0.2; lampB.add(glass);
    fx(g, FX.flame([-1.0, TT + 0.18, -1.5], {size: 0.16}));
    fx(g, FX.fireLight([-0.8, TT + 0.45, -1.1], {intensity: 5, dist: 6, color: '#ffb060'}));
    const wl = new THREE.Group(); at(wl, 2.75, 1.95, -2.9); g.add(wl);
    wl.add(box(0.12, 0.05, 0.14, '#4a3a30')); const wlg = cyl(0.04, 0.05, 0.12, new THREE.MeshBasicMaterial({color: '#ffd98a'}), {hull: 0.006}); at(wlg, 0, 0.05, 0.03); wl.add(wlg);
    fx(g, FX.flame([2.75, 2.12, -2.85], {size: 0.12, seed: 9}));
    fx(g, FX.fireLight([2.3, 2.1, -2.2], {intensity: 3.5, dist: 5.5, color: '#ffb060', seed: 5}));
    // recipe chalkboard on the wall: lines appear step by step
    const boards = [0, 1, 2, 3, 4].map((n) => {
      const b = P.chalkboard(1.45, 1.15, {text: L.resep, textY: 0.16, draw: (x, W, H) => {
        x.fillStyle = '#f4efe2'; x.textAlign = 'left'; x.textBaseline = 'middle';
        x.font = `800 ${H * 0.085}px "Inter Display"`;
        for (let i = 0; i < n; i++) { let fs = H * 0.085; while (x.measureText(L.steps[i]).width > W * 0.9 && fs > 10) { fs -= 2; x.font = `800 ${fs}px "Inter Display"`; } x.fillText(L.steps[i], W * 0.05, H * (0.38 + i * 0.16)); x.font = `800 ${H * 0.085}px "Inter Display"`; }
        x.strokeStyle = '#f4efe2'; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.2, H * 0.27); x.lineTo(W * 0.8, H * 0.27); x.stroke();
      }});
      at(b, -1.85, 1.75, -2.9); g.add(b); return b;
    });
    // calendar on the wall: "HARI KE" + day number
    const cal = new THREE.Group(); at(cal, 1.95, 1.72, -2.92); g.add(cal);
    const calB = box(0.62, 0.72, 0.03, '#f3e7d3', {center: true, hull: 0.012}); cal.add(calB);
    const calHead = sign(L.day, 0.62, 0.2, {bg: '#c75b5b', fg: '#fff3df', frame: '#6a2f2a', depth: 0.035, border: false}); at(calHead, 0, 0.27, 0.01); cal.add(calHead);
    const dayTex = []; for (let n = 1; n <= 14; n++) dayTex.push(signTex(String(n), {w: 512, h: 420, bg: '#f3e7d3', border: false, sub: n === 14 ? L.weeks2 : null}));
    const dayD = decal(dayTex[0], 0.56, 0.46); dayD.position.set(0, -0.07, 0.02); cal.add(dayD);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 6, 30), new THREE.MeshBasicMaterial({color: '#d8413a'})); ring.position.set(0, -0.02, 0.04); ring.scale.set(1.25, 1, 1); cal.add(ring);
    // chopping board + the bonggol + chopped pieces + machete
    const board = box(0.52, 0.04, 0.34, toon('#c9a06a', {paint: {planks: 3, seed: 29}})); at(board, -0.55, TT, -1.18); g.add(board);
    const corm = P.bonggol(0.75, {seed: 5}); at(corm, -0.55, TT + 0.04, -1.2, 0.4); g.add(corm);
    const pr = rng(31);
    const pieces = []; for (let i = 0; i < 16; i++) { const p = box(0.055, 0.04, 0.05, i % 3 ? '#efe4c0' : '#c9a87a', {hull: 0.004}); at(p, -0.55 + (pr() - 0.5) * 0.36, TT + 0.04, -1.18 + (pr() - 0.5) * 0.22, pr() * 3); g.add(p); pieces.push(p); }
    const kg1 = tag(L.kg1, 0.3, 0.15); at(kg1, -0.92, TT, -1.05, 0.2); g.add(kg1);
    // palm sugar + tag, bucket of rice-washing water + tag
    const sugars = [[0.25, -1.02], [0.36, -1.1]].map(([x, z]) => { const s = P.palmSugar(); at(s, x, TT, z); g.add(s); return s; });
    const kg14 = tag(L.kg14, 0.34, 0.15); at(kg14, 0.2, TT, -0.98, -0.1); g.add(kg14);
    const bk = P.bucket('#4f9a8a', '#ece8dc', L.airBeras); at(bk.group, 0.82, TT, -1.2, -0.2); g.add(bk.group);
    const l5 = tag(L.liter5, 0.36, 0.15, {bg: '#f2d24a'}); at(l5, 1.15, TT, -0.98, -0.25); g.add(l5);
    // jerrycan in the middle
    const jc = P.jerrycan('#3f7fc8'); at(jc.group, 0.2, TT, -1.38, 0.15); g.add(jc.group);
    const tape = P.tapePlate(); at(tape, 0.7, TT, -1.1); g.add(tape);
    const kakek = ch('kakekNight', {seed: 65}, g, -0.05, -1.85, 0);
    const darto = ch('darto', {seed: 66}, g, 0.98, -1.85, 0);
    const knife = P.golok(); held(kakek, knife, {hand: 0, x: -0.01, y: -0.02, z: 0.06, rz: 0.4});
    // chop rhythm on "cacah"
    const chop0 = E('cacah') - 0.1, chop1 = cut(8) - 0.15;
    const chops = []; for (let tt = chop0; tt < chop1; tt += 0.3) chops.push(tt);
    const kCues = [
      {t: 0, pose: 'present', expr: 'smug'},
      {t: E('malam') + 0.2, action: 'talk', dur: 2.6},
      {t: E('resep') + 0.1, pose: 'pointUp', expr: 'proud'},
      {t: cut(7), pose: 'hammerDown', expr: 'happy', action: 'talk', dur: 2.2},
      {t: E('satukilo') + 0.1, expr: 'proud', action: 'nod', dur: 0.6},
    ];
    chops.forEach((tt, i) => kCues.push({t: tt, pose: i % 2 ? 'hammerDown' : 'hammerUp', expr: 'excited'}));
    kCues.push(
      {t: cut(8), pose: 'present', expr: 'happy', action: 'talk', dur: 2.0},
      {t: E('gula') + 0.1, pose: 'give', expr: 'smug'},
      {t: E('air') + 0.1, pose: 'presentBoth', expr: 'proud'},
      {t: cut(9), pose: 'present', expr: 'happy', action: 'talk', dur: 2.0},
      {t: E('jeriken') + 0.1, pose: 'presentBoth', expr: 'proud'},
      {t: E('tutup') + 0.1, pose: 'hips', expr: 'smug', action: 'nod', dur: 0.6},
      {t: E('keempat') + 0.05, pose: 'pointUp', expr: 'thinking'},
      {t: E('buka') + 0.1, pose: 'tap', expr: 'happy'},
      {t: E('gas') + 0.05, pose: 'idle', expr: 'grimace'},
      {t: cut(10), pose: 'stop', expr: 'smug', action: 'talk', dur: 1.8},
      {t: E('duaminggu') + 0.05, pose: 'pointUp', expr: 'proud'},
      {t: E('bau') - 0.3, pose: 'chin', expr: 'thinking', action: 'talk', dur: 1.3},
      {t: E('tape') + 0.1, pose: 'present', expr: 'cheesy'},
      {t: E('jadi') + 0.05, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.6},
    );
    kakek.act(kCues);
    darto.act([
      {t: 0, pose: 'idle', expr: 'surprised'},
      {t: E('resep') + 0.25, pose: 'chin', expr: 'thinking'},
      {t: cut(7), pose: 'idle', expr: 'happy'},
      {t: E('cacah') + 0.25, pose: 'idle', expr: 'surprised', action: 'hop', dur: 0.5},
      {t: cut(8), pose: 'think', expr: 'thinking'},
      {t: E('air') + 0.2, pose: 'idle', expr: 'happy', action: 'nod', dur: 0.6},
      {t: cut(9), pose: 'carryBoth', expr: 'determined'},
      {t: E('jeriken') + 0.15, pose: 'idle', expr: 'excited'},
      {t: E('tutup') + 0.15, action: 'nod', dur: 0.5},
      {t: E('keempat') + 0.1, pose: 'idle', expr: 'confused'},
      {t: E('gas') + 0.05, pose: 'headHold', expr: 'disgusted', action: 'tremble', dur: 0.6},
      {t: cut(10), pose: 'idle', expr: 'worried'},
      {t: E('duaminggu') + 0.15, pose: 'armsUp', expr: 'shocked', action: 'jump', dur: 0.6},
      {t: E('bau') + 0.1, pose: 'chin', expr: 'thinking'},
      {t: E('tape') + 0.2, pose: 'idle', expr: 'cheesy'},
      {t: E('jadi') + 0.1, pose: 'cheer', expr: 'excited', action: 'jump', dur: 0.6},
    ]);
    // effects: chips fly on every chop, a splash when the sugar drops in, gas puffs when the cap opens
    chops.filter((_, i) => i % 2).forEach((tt, i) => fx(g, FX.debris([-0.55, TT + 0.1, -1.15], tt + 0.08, {n: 8, color: '#efe4c0', speed: 1.2, seed: 40 + i}), (t) => inShots(t, 7)));
    fx(g, FX.splash([0.82, TT + 0.28, -1.2], E('air') + 0.35, {n: 40, speed: 0.9, size: 0.05}), (t) => inShots(t, 8));
    fx(g, FX.splash([0.2, TT + 0.5, -1.38], E('jeriken') - 0.3, {n: 30, speed: 0.7, size: 0.04, color: '#e8dcb0'}), (t) => inShots(t, 9));
    const opens = [E('buka') + 0.1, E('buka') + 1.0, E('buka') + 1.9];
    opens.forEach((tt, i) => fx(g, FX.smoke([0.11, TT + 0.55, -1.38], tt + 0.15, {n: 5, size: 0.18, grow: 2.2, rise: 0.5, life: 0.9, color: '#e8f0d8', opacity: 0.6, seed: 60 + i}), (t) => inShots(t, 9)));
    fx(g, FX.glints([0.7, TT + 0.15, -1.1], E('tape') + 0.05, {n: 18, spread: 0.3}), (t) => inShots(t, 10));
    smell(g, [0.7, TT + 0.1, -1.1], E('tape') + 0.1, cut(11), '#f2c86a');
    const sugarP = sugars.map((s) => s.position.clone());
    updaters.push((t) => {
      const s7 = inShots(t, 7), s8 = inShots(t, 8), s9 = inShots(t, 9), s10 = inShots(t, 10);
      // chalkboard: step lines appear with the narration
      const step = t < E('pertama') ? 0 : t < E('kedua') ? 1 : t < E('ketiga') ? 2 : t < E('keempat') ? 3 : 4;
      boards.forEach((b, i) => { b.visible = i === step; b.scale.setScalar(pop(t, E('resep') - 0.1, 0.4)); });
      // bonggol: pops on "pertama", chopped into pieces on "cacah"
      const chopU = ramp(t, chop0, chop1);
      corm.visible = t < chop1 + 0.05; corm.scale.setScalar(t < cut(7) ? 0.0001 : 0.75 * pop(t, E('pertama'), 0.35) * (1 - 0.85 * chopU));
      pieces.forEach((p, i) => { p.visible = t >= chop0 + (i / pieces.length) * (chop1 - chop0) && t < E('jeriken'); p.scale.setScalar(1 - ramp(t, E('ketiga') + 0.2, E('jeriken') - 0.1)); });
      board.visible = t < cut(10);
      kg1.visible = s7; kg1.scale.setScalar(pop(t, E('satukilo') - 0.1, 0.35));
      knife.visible = s7;
      // sugar pops on "gula", drops into the bucket on "air"
      const drop = ramp(t, E('air') + 0.05, E('air') + 0.35);
      sugars.forEach((s, i) => {
        s.visible = t >= cut(8) && t < E('air') + 0.4; s.scale.setScalar(pop(t, E('gula') - 0.05 + i * 0.08, 0.35));
        s.position.set(lerp(sugarP[i].x, 0.82, drop), TT + Math.sin(drop * Math.PI) * 0.25 + drop * 0.15, lerp(sugarP[i].z, -1.2, drop));
      });
      kg14.visible = s8; kg14.scale.setScalar(pop(t, E('gula') + 0.05, 0.35));
      bk.group.visible = t >= cut(8) && t < cut(10); bk.group.scale.setScalar(pop(t, E('lima') - 0.15, 0.35));
      bk.liquid.material.color.set(t > E('air') + 0.4 ? '#d8c08a' : '#ece8dc');
      l5.visible = s8; l5.scale.setScalar(pop(t, E('lima') - 0.05, 0.35));
      // pour the bucket toward the jerrycan
      const tilt = s9 ? Math.sin(Math.PI * ramp(t, E('ketiga') + 0.2, E('tutup') - 0.2)) : 0;
      bk.group.rotation.z = 1.0 * tilt; bk.group.position.set(0.82 - 0.25 * tilt, TT + 0.12 * tilt, -1.2);
      // jerrycan + cap
      jc.group.visible = t >= cut(9); jc.group.scale.setScalar(pop(t, E('jeriken') - 0.4, 0.35));
      let capUp = t < E('tutup') ? 0.16 : 0.16 * (1 - ramp(t, E('tutup'), E('tutup') + 0.2));
      for (const o of opens) if (t > o && t < o + 0.55) capUp = Math.max(capUp, 0.12 * Math.sin(Math.PI * (t - o) / 0.55));
      jc.cap.position.y = 0.48 + capUp; jc.cap.rotation.y = t * (capUp > 0.01 ? 6 : 0);
      // calendar days flip "setiap hari", circle 14 on "dua minggu"
      const day = t < E('setiap') ? 1 : 1 + Math.floor(13 * clamp01((t - E('setiap')) / (E('duaminggu') + 0.25 - E('setiap'))));
      dayD.material.map = dayTex[day - 1];
      ring.visible = t > E('duaminggu') + 0.25; ring.scale.set(1.25 * pop(t, E('duaminggu') + 0.25, 0.35), pop(t, E('duaminggu') + 0.25, 0.35), 1);
      cal.rotation.z = t > E('setiap') && t < E('duaminggu') + 0.3 ? Math.sin(t * 20) * 0.02 : 0;
      tape.visible = s10; tape.scale.setScalar(pop(t, E('tape') - 0.1, 0.35));
    });
  }

  // =====================================================================================================
  // ---------- pagi: Darto's yard at dawn, two weeks later (shot 11) ----------
  {
    const g = addLoc('pagi');
    g.add(ground(140, 140, '#8fb36a'));
    strip(g, 12, 4, 0, -1.2, '#b89a6a', 0.006, {stains: 30});
    g.add(P.hills('#86a862'));
    const sun = P.sunBall(2.4, '#ffd08a'); sun.position.set(-14, 3, -42); g.add(sun);
    const shed = P.house(3.4, 2.4, 2.4, {color: '#c9a06a', roof: '#8a6a3a', windows: 0, doorX: -0.9, doorColor: '#7a4a32', seed: 21}); at(shed, 0, 0, -2.85); g.add(shed);
    bananaRow(g, [[-3.6, -3.4, 2.7, 1], [3.8, -3.8, 2.6], [-5.8, -6.0, 2.8], [5.9, -6.4, 2.6, 1]]);
    const cal = new THREE.Group(); at(cal, 1.0, 1.55, -2.78); g.add(cal);
    cal.add(box(0.5, 0.58, 0.03, '#f3e7d3', {center: true, hull: 0.012}));
    const ch1 = sign(L.day, 0.5, 0.16, {bg: '#c75b5b', fg: '#fff3df', frame: '#6a2f2a', depth: 0.035, border: false}); at(ch1, 0, 0.22, 0.01); cal.add(ch1);
    const d14 = decal(signTex('14', {w: 512, h: 420, bg: '#f3e7d3', border: false, sub: L.weeks2}), 0.46, 0.38); d14.position.set(0, -0.06, 0.02); cal.add(d14);
    const r14 = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.014, 6, 30), new THREE.MeshBasicMaterial({color: '#d8413a'})); r14.position.set(0, -0.02, 0.04); r14.scale.set(1.25, 1, 1); cal.add(r14);
    const bench = P.bale(1.3, 0.5, 0.45); at(bench, 0.25, 0, -0.85); g.add(bench);
    const jc = P.jerrycan('#3f7fc8'); at(jc.group, 0.45, 0.45, -0.85, 0.15); g.add(jc.group);
    const tape = P.tapePlate(); at(tape, -0.05, 0.45, -0.78); g.add(tape);
    const hens = [[-1.9, -0.4, 0.6], [2.1, -1.4, 2.5], [-2.5, -1.6, -0.4]].map(([x, z, ry]) => { const c = P.chicken(); at(c, x, 0, z, ry); g.add(c); return c; });
    const darto = ch('darto', {seed: 67}, g, -0.15, -1.35, 0);
    darto.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: E('kemudian') + 0.1, pose: 'chin', expr: 'nervous', action: 'nod', dur: 0.5},
      {t: E('membuka') - 0.05, pose: 'give', expr: 'determined'},
      {t: E('membuka') + 0.35, pose: 'armsUp', expr: 'surprised', action: 'jump', dur: 0.6},
      {t: E('asam') + 0.1, pose: 'presentBoth', expr: 'cheesy'},
      {t: E('tape2') + 0.1, pose: 'cheer', expr: 'toothy', action: 'hop', dur: 0.6},
    ]);
    fx(g, FX.smoke([0.36, 1.0, -0.85], E('membuka') + 0.2, {n: 6, size: 0.22, grow: 2.2, rise: 0.6, life: 1.0, color: '#f2e6c0', opacity: 0.6}), (t) => inShots(t, 11));
    fx(g, FX.glints([-0.05, 0.6, -0.75], E('tape2') - 0.05, {n: 16, spread: 0.3}), (t) => inShots(t, 11));
    smell(g, [0.36, 0.97, -0.85], E('membuka') + 0.35, cut(12), '#f2c86a');
    updaters.push((t) => {
      const u = ramp(t, E('membuka') + 0.15, E('membuka') + 0.7);
      jc.cap.position.set(-0.09 + 0.35 * u, 0.48 + Math.sin(u * Math.PI) * 0.35 - 0.48 * u * 0.0, 0.02 * u);
      jc.cap.rotation.z = u * 4;
      tape.scale.setScalar(pop(t, E('tape2') - 0.15, 0.35));
      hens.forEach((h, i) => { h.rotation.z = Math.max(0, Math.sin(t * 5 + i * 2)) * 0.35; h.position.x += 0; });
    });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); for (const u of post) u(t); }};
}
