// All locations in one scene at different x offsets. Story: "Apa yang terjadi kalau Bumi tiba-tiba berhenti berputar?".
import * as THREE from 'three';
import {toon, box, cyl, ball, cone, at, sign, paintTex, pop, smooth, clamp01, INK, rng} from './kit';
import {makeChar, setCharDesign} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {planet: 0, town: 40, beach: 80, room: 120, desert: 160, frozen: 200, lab: 240};

export {LOOK_PRESETS, MOODS} from './lighting';

// Cast look for this story (palette overrides on top of char.js PALETTES).
export const CHAR_DESIGN = 'egg';
const CAST = {
  hero: {jacket: '#e07a3a', lower: '#34445e', tie: '#f3e7d3', hair: '#2b2326', hat: 'none', hairStyle: 'side', pocket: '#c9622a'},
  pal1: {hairStyle: 'tuft'},
  pal2: {hat: 'bowler', hatColor: '#4a3a56'},
  scientist: {hairStyle: 'tuft', hair: '#8a8a8a'},
};

// Lighting plan (camera_plan.md): space around the globe (dark navy, sun key from the left); a sunny town that turns to
// danger when the Earth stops and to a storm for the winds; a bright noon beach going tense as the sea drains; a warm
// room for the 24-hour clock; a scorching desert for six months of day and a frozen moonlit night for six months of
// dark; a cool lab turning joyful on "tenang"; back to space, joyful, for the closing question.
const space = {fog: '#0b1030', near: 60, far: 250, skyTop: '#060a1c', skyBottom: '#1b2352', key: '#fff2d8', keyI: 2.7, hemiI: 1.0, keyPos: [-10, 6, 6],
  hemiSky: '#9ab0f0', hemiGround: '#2a2a4a', grade: {sat: 1.05, contrast: 1.04, tint: '#a8b8ff', tintAmt: 0.04, vignette: 0.42}};
const townDay = {...LOOK_PRESETS.day, keyPos: [-6, 10, 7]};
const townStorm = {...LOOK_PRESETS.storm, keyI: 1.3, hemiI: 1.3, keyPos: [-6, 10, 6]};
const desertHot = {...LOOK_PRESETS.desert, keyPos: [-5, 12, -6], grade: {sat: 1.12, contrast: 1.08, tint: '#ffb060', tintAmt: 0.14, vignette: 0.38}};
const frozenNight = {...LOOK_PRESETS.night, keyI: 1.4, hemiI: 1.15, keyPos: [-6, 12, -4], hemiSky: '#a0b8f0', hemiGround: '#4a5a7a',
  grade: {sat: 0.85, contrast: 1.06, tint: '#9ac0ff', tintAmt: 0.14, vignette: 0.45}};

export const LOOK = {
  planet: {keys: [{at: 0, ...space}, {at: 'cut11', ...space}, {at: 'seram', ...space, ...MOODS.joyful, grade: {...MOODS.joyful.grade, vignette: 0.4}}]},
  town: {keys: [{at: 0, ...townDay}, {at: 'cut4', ...townDay}, {at: 'mendadak', ...townDay, ...MOODS.danger}, {at: 'cut5', ...townStorm},
    {at: 'badai', ...townStorm, ...MOODS.tense}]},
  beach: {keys: [{at: 0, ...LOOK_PRESETS.noon, keyPos: [-5, 12, 5]}, {at: 'mengalir', ...LOOK_PRESETS.noon, keyPos: [-5, 12, 5]},
    {at: 'kutub', ...LOOK_PRESETS.noon, keyPos: [-5, 12, 5], ...MOODS.tense}]},
  room: {...LOOK_PRESETS.interiorWarm, keyPos: [-4, 8, 8]},
  desert: desertHot,
  frozen: frozenNight,
  lab: {keys: [{at: 0, ...LOOK_PRESETS.interiorCool, keyPos: [-4, 8, 8]}, {at: 'tenang', ...LOOK_PRESETS.interiorCool, keyPos: [-4, 8, 8], ...MOODS.joyful}]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
const under = (g, color) => { const gr = ground(40, 40, color); gr.position.y = -0.05; g.add(gr); };
const strip = (g, w, d, z, color, y, paint) => { const s = ground(w, d, color, paint); s.position.set(0, y, z); g.add(s); return s; };

// Screen-level effects: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [
      {t: EVt.berhenti + 0.1, dur: 0.3, color: '#fff4d6', strength: 0.45},
      {t: EVt.mendadak + 0.05, dur: 0.4, color: '#ffffff', strength: 0.6},
      {t: EVt.badai + 0.05, dur: 0.35, color: '#e8f0ff', strength: 0.6},
      {t: EVt.siang + 0.05, dur: 0.35, color: '#ffd890', strength: 0.4},
      {t: EVt.membeku + 0.05, dur: 0.35, color: '#cfe8ff', strength: 0.5},
      {t: EVt.komentar, dur: 0.35, color: '#ffe9b0', strength: 0.4},
    ],
    shakes: [{t: EVt.berhenti + 0.1, dur: 0.4, amp: 0.03}, {t: EVt.mendadak + 0.05, dur: 0.7, amp: 0.05}, {t: EVt.rumah + 0.1, dur: 0.35, amp: 0.025},
      {t: EVt.badai + 0.05, dur: 0.45, amp: 0.035}, {t: EVt.membeku + 0.05, dur: 0.3, amp: 0.02}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  // Character design for this story (each video has its own): egg heads, side-swept hair, painted shading, cast shadows.
  setCharDesign(CHAR_DESIGN);
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0, y = 0) => { const c = makeChar(name, {yaw, ...(CAST[name] || {}), ...o}); at(c.group, x, y, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];
  const inShots = (t, a, b = a) => t >= cut(a) && t < cut(b + 1);
  const fx = (g, f, vis) => { g.add(f.obj); updaters.push((t) => { f.update(t); if (vis && !vis(t)) f.obj.visible = false; }); return f; };
  const held = (c, obj, o = {}) => { at(obj, o.x ?? 0.02, o.y ?? -0.04, o.z ?? 0.05, 0, 0, o.rz ?? 0); obj.traverse((m) => { m.castShadow = false; }); c.hand(o.hand ?? 1).add(obj); return obj; };
  // Horizontal motion streaks (speed lines / wind): instanced thin bars moving along x.
  const streaks = (g, o) => {
    const {n = 60, x0 = -6, x1 = 6, y0 = 0.3, y1 = 3, z0 = -3, z1 = 1, dir = -1, speed = 14, len = 1.2, color = '#ffffff', opacity = 0.55, vis, seed = 5} = o;
    const r = rng(seed);
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(len, 0.025, 0.025), new THREE.MeshBasicMaterial({color, transparent: true, opacity, depthWrite: false}), n);
    mesh.frustumCulled = false; g.add(mesh);
    const Pp = []; for (let i = 0; i < n; i++) Pp.push([r(), y0 + r() * (y1 - y0), z0 + r() * (z1 - z0), 0.6 + r() * 0.8]);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    updaters.push((t) => {
      mesh.visible = vis(t); if (!mesh.visible) return;
      const W = x1 - x0;
      for (let i = 0; i < n; i++) {
        const [u, y, z, k] = Pp[i];
        const x = x0 + ((((u * W + dir * speed * k * t) % W) + W) % W);
        v.set(x, y, z); sc.set(k, 1, 1); m4.compose(v, q, sc); mesh.setMatrixAt(i, m4);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
    return mesh;
  };
  // Something thrown sideways at time t0 (keeps moving east = screen right, tumbling, rising a little).
  const flyer = (obj, t0, o = {}) => {
    const {vx = 6, vy = 1.5, vz = 0, spin = [0, 0, -3], acc = 4, ay = 0.8} = o;
    const p0 = obj.position.clone(), r0 = obj.rotation.clone();
    return (t) => {
      const dt = Math.max(0, t - t0);
      obj.position.set(p0.x + vx * dt + acc * dt * dt, p0.y + vy * dt + ay * dt * dt, p0.z + vz * dt);
      obj.rotation.set(r0.x + spin[0] * dt, r0.y + spin[1] * dt, r0.z + spin[2] * dt);
    };
  };

  // ---------- planet: the globe in space (shots 1, 3, 7, 11) ----------
  {
    const g = addLoc('planet');
    const R = 3, GZ = -6;
    const st = P.stars(700, 80); st.position.set(0, 0, GZ); g.add(st);
    const sun = P.sunBall(4); sun.position.set(-34, 12, -60); g.add(sun);
    const gl = P.globe(R); at(gl.group, 0, 0, GZ); g.add(gl.group);
    // equator ring + labels (shot 3)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.04, 0.035, 8, 96), new THREE.MeshBasicMaterial({color: '#e0503a'}));
    ring.rotation.x = Math.PI / 2; ring.position.set(0, 0, GZ); g.add(ring);
    const eq = sign(L.equator, 1.6, 0.42, {bg: '#e0503a', fg: '#fff3df', frame: '#8a2f2a'}); at(eq, 0, 0.55, GZ + R + 0.45); g.add(eq);
    const spd = sign(L.speed, 1.8, 0.6, {bg: '#f2d24a', frame: '#8a6a2a'}); at(spd, 0, -0.1, GZ + R + 0.55); g.add(spd);
    // speed arcs whirling around the globe
    const arcs = [];
    for (let i = 0; i < 4; i++) {
      const a = new THREE.Mesh(new THREE.TorusGeometry(R + 0.35 + i * 0.12, 0.025, 6, 40, 1.1), new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.6, depthWrite: false}));
      a.rotation.x = Math.PI / 2; a.position.set(0, -1.2 + i * 0.8, GZ); g.add(a); arcs.push(a);
    }
    // pole flags (shot 7)
    const mkFlag = (text, up) => {
      const f = new THREE.Group(); at(f, 0, up ? R - 0.05 : -R + 0.05, GZ); g.add(f);
      const pole = cyl(0.04, 0.05, 1.3, '#7a5236'); if (!up) pole.rotation.x = Math.PI; f.add(pole);
      const s = sign(text, 1.3, 0.42, {bg: '#4f8fc8', fg: '#fff3df', frame: '#2a4f7a'}); at(s, 0.7, up ? 1.05 : -1.05, 0); f.add(s);
      return f;
    };
    const fN = mkFlag(L.north, true), fS = mkFlag(L.south, false);
    // hero standing on the top of the world
    const hero = ch('hero', {}, g, 0, GZ, 0, R - 0.02);
    hero.act([
      {t: 0, pose: 'wave', expr: 'happy'},
      {t: E('bumi') + 0.1, pose: 'idle', expr: 'neutral'},
      {t: E('berhenti') + 0.12, expr: 'shocked', pose: 'armsUp', action: 'jump', dur: 0.6},
      {t: E('berhenti') + 0.9, expr: 'worried', pose: 'headHold', action: 'tremble', dur: 1.0},
      {t: cut(3), pose: 'wave', expr: 'happy'},
      {t: E('seribu') + 0.1, pose: 'cheer', expr: 'excited', action: 'hop', dur: 0.5},
      {t: cut(11), pose: 'idle', expr: 'thinking'},
      {t: E('seram') + 0.1, pose: 'shrug', expr: 'confused'},
      {t: E('komentar') - 0.05, pose: 'point', expr: 'excited', action: 'jump', dur: 0.6},
    ]);
    const cmt = P.banner(L.comment, 1.7, 0.5, {poleH: 2.35, bg: '#c75b5b'}); at(cmt, 0, R - 0.08, GZ - 0.55); g.add(cmt);
    fx(g, FX.glints([0, R + 2.0, GZ - 0.4], E('komentar'), {n: 28}), (t) => inShots(t, 11));
    fx(g, FX.confetti([0, R + 2.4, GZ], E('komentar') + 0.05), (t) => inShots(t, 11));
    fx(g, FX.glints([0, -0.1, GZ + R + 0.6], E('seribu'), {n: 22}), (t) => inShots(t, 3));
    fx(g, FX.glints([0, 0, GZ + R], E('daratan') + 0.1, {n: 30, spread: 2.5}), (t) => inShots(t, 7));
    const w = 0.9;
    const stopT = E('berhenti') + 0.1;
    updaters.push((t) => {
      const s1 = inShots(t, 1), s3 = inShots(t, 3), s7 = inShots(t, 7), s11 = inShots(t, 11);
      let ang;
      if (s1) { ang = t < stopT ? w * t : w * stopT + w * 0.15 * (1 - Math.exp(-(t - stopT) * 6)); }
      else if (s3) ang = 1.7 * t;
      else if (s7) ang = 2.2;
      else ang = 0.35 * t;
      gl.spin.rotation.y = ang;
      gl.setStop(s7 ? smooth((t - cut(7) - 0.3) / (E('daratan') + 0.3 - cut(7) - 0.3)) : 0);
      gl.clouds.visible = !s7;
      hero.group.visible = !s7;
      // lurch forward when the planet halts
      hero.group.rotation.z = s1 && t > stopT ? -0.35 * Math.exp(-(t - stopT) * 3) * Math.sin((t - stopT) * 9) : 0;
      ring.visible = eq.visible = s3; spd.visible = s3;
      eq.scale.setScalar(pop(t, E('khatulistiwa') - 0.05, 0.4)); spd.scale.setScalar(pop(t, E('seribu') - 0.1, 0.4));
      arcs.forEach((a, i) => { a.visible = s3 || (s1 && t < stopT); a.rotation.z = (s3 ? 3.4 : 1.8) * t + i * 1.7; });
      fN.visible = fS.visible = s7;
      fN.scale.setScalar(pop(t, E('utara') - 0.05, 0.4)); fS.scale.setScalar(pop(t, E('selatan') - 0.05, 0.4));
      cmt.visible = s11; cmt.scale.setScalar(pop(t, E('komentar') - 0.1, 0.4));
    });
  }

  // ---------- town street (shots 2, 4, 5) ----------
  {
    const g = addLoc('town');
    g.add(ground(120, 120, '#8fb36a'));
    strip(g, 60, 3.6, -3.7, '#5a5f66', 0.01, {stains: 30});
    for (let i = 0; i < 14; i++) { const d = box(0.9, 0.012, 0.12, '#f3e7d3', {edges: false, hull: 0}); at(d, -13 + i * 2, 0.012, -3.7); g.add(d); }
    strip(g, 60, 1.6, -1.1, '#cfc4b0', 0.02, {bricks: true});
    strip(g, 60, 1.6, -6.3, '#cfc4b0', 0.02, {bricks: true});
    const houses = [];
    [[-5.2, '#e6c99a', '#b5543c'], [-1.6, '#c9d4e8', '#4f7fa6'], [2.0, '#f0d8b0', '#c75b5b'], [5.6, '#d8e4c0', '#7a5236']].forEach(([x, c, rf], i) => {
      const h = P.house(3.0, 2.8, 3.0, {color: c, roof: rf, seed: 30 + i}); at(h, x, 0, -7.2); g.add(h); houses.push(h);
    });
    const shop = sign(L.shop, 1.8, 0.45, {bg: '#e8a83a', frame: '#8a5a2a'}); at(shop, 0, 2.55, 0.05); houses[2].add(shop);
    const trees = [[-3.4, -6.4], [3.8, -6.3], [-7.4, -6.2], [7.6, -6.5]].map(([x, z], i) => { const tr = P.tree({seed: 7 + i, h: 2.2}); at(tr, x, 0, z); g.add(tr); return tr; });
    const lamp = P.streetLamp(); at(lamp, 2.3, 0, -0.75, Math.PI); g.add(lamp);
    const car = P.car('#4f7fa6'); at(car, -1.2, 0, -3.9, Math.PI / 2); g.add(car);
    const car2 = P.car('#e8a83a'); at(car2, -7.5, 0, -3.3, -Math.PI / 2); g.add(car2);
    // shot 2: hero calm with a drink; shot 4: hero + neighbours get thrown
    const hero = ch('hero', {seed: 63}, g, 0, -1.2, 0);
    held(hero, P.mug('#c75b5b'), {y: -0.02});
    const n1 = ch('pal1', {seed: 64}, g, -1.7, -1.5, 0.3);
    const n2 = ch('pal2', {seed: 65}, g, 2.5, -1.6, -0.3);
    hero.act([
      {t: 0, pose: 'hold', expr: 'happy'},
      {t: E('sadari') + 0.1, pose: 'hold', expr: 'smug', action: 'nod', dur: 0.6},
      {t: E('cepat') + 0.1, pose: 'armsUp', expr: 'shocked', action: 'jump', dur: 0.6},
      {t: cut(4), pose: 'hold', expr: 'neutral'},
      {t: E('mendadak') + 0.12, pose: 'armsUp', expr: 'shocked', action: 'tremble', dur: 0.8},
      {t: E('manusia') + 0.1, pose: 'headHold', expr: 'worried'},
      {t: E('terlempar') + 0.05, pose: 'armsUp', expr: 'shocked'},
    ]);
    [n1, n2].forEach((n, i) => n.act([
      {t: 0, pose: i ? 'hips' : 'wave', expr: 'happy'},
      {t: E('mendadak') + 0.15 + i * 0.08, pose: 'armsUp', expr: 'shocked', action: 'jump', dur: 0.5},
    ]));
    // hero clinging to the lamp post in the wind (shot 5): pivot at the post, body streaming downwind (screen right)
    const pivot = new THREE.Group(); at(pivot, 2.3, 1.75, -0.7); g.add(pivot);
    const hero2 = ch('hero', {seed: 66}, pivot, 0, 0, 0);
    hero2.group.position.set(1.85, 0, 0); hero2.group.rotation.z = Math.PI / 2;
    hero2.act([{t: 0, pose: 'armsUp', expr: 'shocked'}, {t: E('angin') + 0.1, expr: 'worried', action: 'tremble', dur: 1.6},
      {t: E('badai') + 0.1, expr: 'cry'}]);
    const spd = streaks(g, {n: 70, x0: -7, x1: 7, y0: 0.4, y1: 3.2, z0: -2.6, z1: 0.6, dir: -1, speed: 16, vis: (t) => inShots(t, 2) && t > E('cepat') - 0.1});
    const wind = streaks(g, {n: 120, x0: -8, x1: 9, y0: 0.2, y1: 4.5, z0: -6, z1: 1.5, dir: 1, speed: 18, len: 1.6, color: '#dfe8f0', opacity: 0.5, seed: 9, vis: (t) => inShots(t, 5)});
    fx(g, FX.rain([0, -2, 18, 10], {n: 700, slant: 1.1, speed: 14, opacity: 0.45}), (t) => inShots(t, 5));
    fx(g, FX.lightning([-3, 9, -9], [-1.5, 2.5, -9], E('badai'), {dur: 0.4}), (t) => inShots(t, 5));
    // flying litter in the wind
    const litter = [];
    for (let i = 0; i < 16; i++) { const m = box(0.25, 0.02, 0.18, ['#f3e7d3', '#c75b5b', '#e8c35a', '#7fa35a'][i % 4], {center: true, hull: 0.006}); g.add(m); litter.push(m); }
    // lift-off dust and debris
    fx(g, FX.dust([2.0, 0.1, -6.0], E('rumah') + 0.05, {n: 10, size: 0.6}), (t) => inShots(t, 4));
    fx(g, FX.debris([2.0, 0.4, -6.0], E('rumah') + 0.05, {n: 14, color: '#c75b5b', speed: 2.5}), (t) => inShots(t, 4));
    fx(g, FX.dust([-1.2, 0.1, -3.9], E('mobil') + 0.05, {n: 8}), (t) => inShots(t, 4));
    fx(g, FX.dust([0, 0.1, -1.2], E('terlempar') + 0.05, {n: 8}), (t) => inShots(t, 4));
    const flyN1 = flyer(n1.group, E('manusia') + 0.05, {vx: 2.6, vy: 1.6, spin: [0, 0, -3], acc: 2});
    const flyN2 = flyer(n2.group, E('manusia') + 0.15, {vx: 2.8, vy: 1.4, spin: [0, 0, -3.5], acc: 2});
    const flyCar = flyer(car, E('mobil') + 0.05, {vx: 6, vy: 1.8, spin: [0.8, 0, -2.5]});
    const flyHouse = flyer(houses[2], E('rumah') + 0.1, {vx: 4, vy: 2.2, spin: [0, 0, -1.4], acc: 3});
    const flyHero = flyer(hero.group, E('terlempar') + 0.1, {vx: 1.2, vy: 1.8, spin: [0, 0, -1.6], acc: 0.6, ay: 0.1});
    const litR = rng(12);
    const LP = litter.map(() => [litR() * 17, 0.3 + litR() * 3.5, -5 + litR() * 6, litR() * 6]);
    updaters.push((t) => {
      const s2 = inShots(t, 2), s4 = inShots(t, 4), s5 = inShots(t, 5);
      if (s4) { flyN1(t); flyN2(t); flyCar(t); flyHouse(t); flyHero(t); }
      else { flyN1(0); flyN2(0); flyCar(0); flyHouse(0); flyHero(0); }
      hero.group.visible = s2 || s4;
      n1.group.visible = n2.group.visible = s4;
      car.visible = !s5; houses[2].visible = !s5;
      pivot.visible = s5;
      hero2.group.rotation.z = Math.PI / 2 + Math.sin(t * 11) * 0.07;
      hero2.group.position.y = Math.sin(t * 13) * 0.06;
      trees.forEach((tr, i) => { tr.rotation.z = s5 ? -0.22 + Math.sin(t * 7 + i) * 0.07 : 0; });
      lamp.rotation.z = s5 ? Math.sin(t * 9) * 0.015 : 0;
      litter.forEach((m, i) => {
        m.visible = s5; const [u, y, z, ph] = LP[i];
        m.position.set(-8 + ((u + t * 9) % 17), y + Math.sin(t * 5 + ph) * 0.3, z); m.rotation.set(t * 7 + ph, t * 5, t * 9 + ph);
      });
    });
  }

  // ---------- beach: the sea drains away (shot 6) ----------
  {
    const g = addLoc('beach');
    g.add(ground(140, 140, '#e8d4a0'));
    strip(g, 140, 80, -44, '#c9b07a', 0.01, {stains: 40});
    const water = new THREE.Mesh(new THREE.PlaneGeometry(140, 80), toon(P.waterTex()));
    water.rotation.x = -Math.PI / 2; water.receiveShadow = true; g.add(water);
    const foam = box(140, 0.04, 0.35, '#f4f8fb', {edges: false, hull: 0}); g.add(foam);
    const boat = P.boat(); at(boat, -1.6, 0.18, -7.5, 0.4); g.add(boat);
    const fishes = [[-0.4, -4.6], [1.2, -5.6], [-2.6, -5.2], [0.6, -8.0]].map(([x, z], i) => { const f = P.fish(['#7aa3b8', '#e8a83a', '#c75b5b', '#7aa3b8'][i]); at(f, x, 0.1, z); g.add(f); return f; });
    const post = P.signpost([{text: L.poles, dir: 1, angle: -0.25}]); at(post, 0.55, 0, -2.6); g.add(post);
    const hero = ch('hero', {seed: 67}, g, -0.2, -1.4, 0);
    hero.act([
      {t: 0, pose: 'hips', expr: 'happy'},
      {t: E('laut') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('mengalir') + 0.15, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.6},
      {t: E('kutub') + 0.1, pose: 'point', expr: 'worried', action: 'tremble', dur: 0.6},
    ]);
    const edge0 = -3.2;
    updaters.push((t) => {
      const u = smooth((t - E('mengalir') + 0.2) / (cut(7) - E('mengalir') + 0.4));
      const ez = edge0 - u * 30;
      water.position.set(0, 0.02 - u * 0.15, ez - 40);
      foam.position.set(0, 0.02 - u * 0.15, ez);
      boat.position.y = u < 0.12 ? 0.18 + Math.sin(t * 2.4) * 0.05 : 0.12 + (1 - smooth((u - 0.12) * 4)) * 0.06;
      boat.rotation.z = u > 0.12 ? 0.18 * smooth((u - 0.12) * 4) : Math.sin(t * 2) * 0.03;
      fishes.forEach((f, i) => { const bare = -f.position.z < -ez - 0.5; f.visible = bare; f.position.y = 0.1 + Math.abs(Math.sin(t * 7 + i * 2)) * 0.18; f.rotation.z = Math.sin(t * 9 + i) * 0.6; });
    });
  }

  // ---------- room: a day is no longer 24 hours (shot 8) ----------
  {
    const g = addLoc('room');
    under(g, '#3a3036');
    g.add(P.room(6.5, 3.4, 6, {wall: '#e8d8b8', floor: '#a7845e', wain: '#7a9a6a'}));
    const clk = P.wallClock(0.62, {rim: '#4f7fa6'}); at(clk.group, 0.55, 2.05, -4.86); g.add(clk.group);
    const hrs = sign(L.hours, 1.3, 0.55, {bg: '#f2d24a', frame: '#8a6a2a'}); at(hrs, -1.55, 2.05, -4.84); g.add(hrs);
    const xm = new THREE.Group(); at(xm, -1.55, 2.05, -4.74); g.add(xm);
    for (const s of [-1, 1]) { const b = box(1.45, 0.12, 0.04, '#d8413a', {center: true, hull: 0.012}); b.rotation.z = s * 0.38; xm.add(b); }
    const lampT = box(0.5, 0.6, 0.45, toon('#8a5a3a', {paint: {planks: 2, seed: 95}})); at(lampT, 2.3, 0, -4.2); g.add(lampT);
    const plant = new THREE.Group(); at(plant, -2.6, 0, -4.3); g.add(plant);
    plant.add(cyl(0.22, 0.17, 0.4, '#c75b5b')); const lf = ball(0.4, '#5f9a5a', {sy: 1.3}); at(lf, 0, 0.85, 0); plant.add(lf);
    const hero = ch('hero', {seed: 68}, g, 0.1, -2.5, 0);
    hero.act([
      {t: 0, pose: 'chin', expr: 'thinking'},
      {t: E('hari') + 0.1, pose: 'shrug', expr: 'confused'},
      {t: E('jam24') + 0.2, pose: 'headHold', expr: 'shocked', action: 'jump', dur: 0.6},
    ]);
    updaters.push((t) => {
      // hands race, then slow and stop dead on "hari"
      const t0 = cut(8), ts = E('hari') + 0.3;
      const m = t < ts ? (t - t0) * 900 : (ts - t0) * 900 + 60 * (1 - Math.exp(-(t - ts) * 5));
      clk.set(m / 60, m % 60);
      xm.scale.setScalar(pop(t, E('jam24') + 0.25, 0.35));
    });
  }

  // ---------- desert: six months of day (shot 9, first half) ----------
  {
    const g = addLoc('desert');
    g.add(ground(140, 140, '#e3c27f', {stains: 40, chips: 30}));
    const sun = P.sunBall(3.2, '#ffe070'); sun.position.set(-5, 15, -32); g.add(sun);
    for (const [x, z, h] of [[-2.4, -3.8, 1.7], [2.9, -6.5, 2.0], [-6, -9, 1.5]]) { const c = P.cactus(h); at(c, x, 0, z); g.add(c); }
    for (const [x, z, s] of [[1.2, -4.5, 0.4], [-1.0, -7, 0.6], [4.5, -3.5, 0.3]]) { const r = ball(s, '#c79a5a', {sy: 0.6, seg: 8}); at(r, x, s * 0.2, z); g.add(r); }
    for (let i = 0; i < 6; i++) { const d = box(4 + i, 0.6 + (i % 3) * 0.4, 2, '#d9b06a'); at(d, -14 + i * 6, -0.2, -18 - (i % 2) * 4); g.add(d); }
    const ban = P.banner(L.day6, 1.6, 0.7, {poleH: 2.4, bg: '#e8a83a', frame: '#8a5a2a'}); at(ban, 1.65, 0, -3.2, -0.25); g.add(ban);
    const sub = sign(L.day6Sub, 1.5, 0.32, {bg: '#fff3df', frame: '#8a5a2a'}); at(sub, 1.65 - 0.05, 1.32, -3.17, -0.25); g.add(sub);
    const hero = ch('hero', {seed: 69}, g, -0.1, -1.6, 0);
    hero.act([
      {t: 0, pose: 'wave', expr: 'tired'},
      {t: E('siang') + 0.1, pose: 'wave', expr: 'worried', action: 'slump', dur: 1.0},
    ]);
    fx(g, FX.glints([-0.1, 1.6, -1.5], E('siang'), {n: 20, color: '#ffd890'}), (t) => inShots(t, 9));
    updaters.push((t) => {
      sun.scale.setScalar(1 + Math.sin(t * 3) * 0.04);
      const k = pop(t, E('siang') - 0.15, 0.4); ban.scale.setScalar(k); sub.scale.setScalar(k);
    });
  }

  // ---------- frozen night: six months of dark (shot 9, second half) ----------
  {
    const g = addLoc('frozen');
    g.add(ground(140, 140, '#e8eef4', {stains: 10}));
    for (const [x, z, s] of [[-2.6, -4, 0.9], [3.0, -6, 1.2], [-5, -9, 1.6], [1.0, -10, 1.3], [6, -11, 1.8]]) { const d = ball(s, '#f4f8fb', {sy: 0.45, seg: 12}); at(d, x, 0, z); g.add(d); }
    for (const [x, z] of [[-1.9, -3.2], [2.4, -4.4]]) { const b = P.iceBlock(0.7, 0.55, 0.6); at(b, x, 0, z, 0.4); g.add(b); }
    const tree = new THREE.Group(); at(tree, -3.2, 0, -5.5); g.add(tree);
    tree.add(cyl(0.1, 0.16, 2.6, '#5a4a4a'));
    for (const [y, a] of [[1.5, 0.7], [2.0, -0.8], [2.4, 0.5]]) { const br = cyl(0.04, 0.06, 0.9, '#5a4a4a'); at(br, 0, y, 0, 0, 0, a); tree.add(br); }
    const lantern = new THREE.PointLight('#ffcf8a', 2.5, 6, 1.6); lantern.position.set(-0.9, 1.4, -0.9); g.add(lantern);
    const lan = new THREE.Group(); at(lan, -0.9, 0, -1.0); g.add(lan);
    lan.add(cyl(0.03, 0.04, 1.2, '#4a4a50')); const lb = ball(0.12, new THREE.MeshBasicMaterial({color: '#ffd98a'}), {hull: 0.012}); at(lb, 0, 1.25, 0); lan.add(lb);
    const ban = P.banner(L.night6, 1.6, 0.7, {poleH: 2.4, bg: '#3f5f8a', frame: '#1f2a40'}); at(ban, 1.65, 0, -3.2, -0.25); g.add(ban);
    const sub = sign(L.night6Sub, 1.5, 0.32, {bg: '#dfe8ff', frame: '#1f2a40'}); at(sub, 1.6, 1.32, -3.17, -0.25); g.add(sub);
    const hero = ch('hero', {seed: 70}, g, 0.0, -1.6, 0);
    hero.act([
      {t: 0, pose: 'cross', expr: 'worried', action: 'tremble', dur: 3},
      {t: E('membeku') + 0.1, pose: 'cross', expr: 'shocked'},
    ]);
    const ice = P.iceBlock(0.75, 1.75, 0.5); at(ice, 0.0, 0, -1.6); g.add(ice);
    fx(g, FX.snow([0, -3, 14, 12], {n: 400}), (t) => inShots(t, 9));
    fx(g, FX.glints([0, 1.3, -1.3], E('membeku') + 0.05, {n: 24, color: '#dff4ff'}), (t) => inShots(t, 9));
    updaters.push((t) => {
      const k = pop(t, E('lainnya') - 0.05, 0.4); ban.scale.setScalar(k); sub.scale.setScalar(k);
      ice.scale.set(1, Math.max(0.0001, smooth((t - E('membeku') - 0.05) / 0.3)), 1);
      ice.visible = t > E('membeku');
    });
  }

  // ---------- lab: scientists say it will not happen (shot 10) ----------
  {
    const g = addLoc('lab');
    under(g, '#4a525a');
    g.add(P.room(7, 3.5, 6.5, {wall: '#e6e2d6', floor: '#9aa6ae', wain: '#5a7a8a', floorPaint: {bricks: true}}));
    const board = P.chalkboard(2.6, 1.35, {text: L.safe, textY: 0.78, draw: (x, W, H) => {
      x.strokeStyle = '#f4efe2'; x.lineWidth = 10; x.beginPath(); x.arc(W * 0.5, H * 0.36, H * 0.22, 0, 7); x.stroke();
      x.beginPath(); x.ellipse(W * 0.5, H * 0.36, H * 0.22, H * 0.06, 0, 0, 7); x.stroke();
      x.beginPath(); x.arc(W * 0.5, H * 0.36, H * 0.3, -2.4, -0.7); x.stroke();
      x.beginPath(); x.moveTo(W * 0.5 + Math.cos(-0.7) * H * 0.3, H * 0.36 + Math.sin(-0.7) * H * 0.3); x.lineTo(W * 0.5 + Math.cos(-0.7) * H * 0.3 - 30, H * 0.36 + Math.sin(-0.7) * H * 0.3 - 6);
      x.moveTo(W * 0.5 + Math.cos(-0.7) * H * 0.3, H * 0.36 + Math.sin(-0.7) * H * 0.3); x.lineTo(W * 0.5 + Math.cos(-0.7) * H * 0.3 - 4, H * 0.36 + Math.sin(-0.7) * H * 0.3 - 30); x.stroke();
    }});
    at(board, 0, 1.95, -5.35); g.add(board);
    const chk = P.chalkDoodle('check', 0.5, 0.4); chk.position.set(0.95, 2.2, -5.3); g.add(chk);
    const tel = P.telescope(); at(tel, 2.9, 0, -4.6, -0.6); g.add(tel);
    const tbl = box(0.7, 0.75, 0.6, toon('#8a5a3a', {paint: {planks: 2, seed: 96}})); at(tbl, -2.5, 0, -3.6); g.add(tbl);
    const mini = P.globe(0.28, {seed: 7}); at(mini.group, -2.5, 1.08, -3.6); g.add(mini.group);
    const stand = cyl(0.03, 0.08, 0.2, '#c9a462'); at(stand, -2.5, 0.75, -3.6); g.add(stand);
    const sA = ch('scientist', {seed: 71}, g, -1.75, -3.7, 0.3);
    const sB = ch('scientist', {seed: 72, hat: 'none', jacket: '#f3f0e6', hair: '#3a2a26', glasses: false}, g, 2.15, -3.7, -0.3);
    const hero = ch('hero', {seed: 73}, g, 0.95, -2.0, -0.2);
    sA.act([{t: 0, pose: 'present', expr: 'smug'}, {t: E('ilmuwan') + 0.1, pose: 'present', expr: 'proud', action: 'nod', dur: 0.7},
      {t: E('tidak') + 0.1, pose: 'stop', expr: 'happy', action: 'shake', dur: 0.7}]);
    sB.act([{t: 0, pose: 'chin', expr: 'thinking'}, {t: E('ilmuwan') + 0.2, pose: 'point', expr: 'happy'}, {t: E('tidak') + 0.2, pose: 'hips', expr: 'proud', action: 'nod', dur: 0.6}]);
    hero.act([{t: 0, pose: 'idle', expr: 'worried'}, {t: E('tenang') + 0.1, pose: 'idle', expr: 'surprised'},
      {t: E('tidak') + 0.3, pose: 'cheer', expr: 'laugh', action: 'jump', dur: 0.6}]);
    fx(g, FX.glints([0.95, 2.2, -5.2], E('tidak') + 0.2, {n: 20}), (t) => inShots(t, 10));
    updaters.push((t) => { mini.spin.rotation.y = t * 1.2; chk.scale.setScalar(pop(t, E('tidak') + 0.15, 0.35)); });
  }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
