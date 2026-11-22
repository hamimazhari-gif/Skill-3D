// Frame-driven visual effects: sparks, smoke, dust, debris, lightning, glow light. All deterministic (seeded),
// all driven by scene time t (seconds). Each returns {obj, update(t)}; add obj to a location group and push update.
import * as THREE from 'three';
import {rng, canvas, texFrom, INK} from './kit';

let _soft;
function softTex() {
  if (_soft) return _soft;
  const c = canvas(128, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  _soft = texFrom(c); return _soft;
}

// Burst of sparks at time t0 from position p (local coords), e.g. a fuse, a hammer strike, a fire.
export function sparks(p, t0, o = {}) {
  const {n = 60, speed = 2.2, life = 0.9, color = '#ffcf5a', size = 0.06, spread = 1, up = 1.2, seed = 3, repeat = 0} = o;
  const r = rng(seed);
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const vel = [], born = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, e = r() * spread;
    vel.push([Math.cos(a) * e * speed, (up + r()) * speed * 0.6, Math.sin(a) * e * speed]);
    born.push(repeat ? r() * repeat : r() * 0.08);
  }
  const mat = new THREE.PointsMaterial({color, size, map: softTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false});
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return {obj: pts, update(t) {
    let vis = 0;
    for (let i = 0; i < n; i++) {
      let dt = t - t0 - born[i];
      if (repeat && dt > 0) dt = dt % repeat;
      const alive = dt > 0 && dt < life;
      const k = alive ? dt : 0;
      pos[i * 3] = p[0] + (alive ? vel[i][0] * k : 0);
      pos[i * 3 + 1] = p[1] + (alive ? vel[i][1] * k - 4.9 * k * k : -99);
      pos[i * 3 + 2] = p[2] + (alive ? vel[i][2] * k : 0);
      if (alive) vis++;
    }
    geo.attributes.position.needsUpdate = true;
    pts.visible = vis > 0;
    mat.opacity = 1;
  }};
}

// Soft smoke / dust puffs (sprites that grow and fade). continuous: emit every `every` seconds.
export function smoke(p, t0, o = {}) {
  const {n = 8, life = 2.2, color = '#cfc6bc', size = 0.6, grow = 2.2, rise = 0.6, drift = 0.25, seed = 5, every = 0, opacity = 0.55} = o;
  const r = rng(seed); const g = new THREE.Group();
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({map: softTex(), color, transparent: true, depthWrite: false, opacity}));
    g.add(m); puffs.push({m, d: every ? i * every : r() * 0.15, dx: (r() - 0.5) * drift * 2, dz: (r() - 0.5) * drift * 2});
  }
  return {obj: g, update(t) {
    for (const q of puffs) {
      let dt = t - t0 - q.d;
      if (every && dt > 0) dt = dt % (n * every);
      const alive = dt > 0 && dt < life; q.m.visible = alive;
      if (!alive) continue;
      const u = dt / life;
      q.m.position.set(p[0] + q.dx * u * 2, p[1] + rise * u * 2, p[2] + q.dz * u * 2);
      q.m.scale.setScalar(size * (1 + grow * u));
      q.m.material.opacity = opacity * (1 - u) * Math.min(1, dt * 8);
    }
  }};
}

// Dust ring on a landing / impact.
export function dust(p, t0, o = {}) { return smoke(p, t0, {n: 7, life: 0.8, size: 0.35, grow: 1.6, rise: 0.15, drift: 0.9, color: '#d8c2a0', opacity: 0.7, ...o}); }

// Debris chunks flung from p at t0 (small outlined boxes that tumble and fall).
export function debris(p, t0, o = {}) {
  const {n = 10, color = '#6a4a3a', speed = 3, seed = 9, life = 1.6} = o;
  const r = rng(seed); const g = new THREE.Group(); const parts = [];
  for (let i = 0; i < n; i++) {
    const s = 0.05 + r() * 0.1;
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.6, s * 0.8), new THREE.MeshToonMaterial({color}));
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({color: INK})); m.add(e);
    g.add(m); const a = r() * 6.28;
    parts.push({m, v: [Math.cos(a) * speed * r(), 2 + r() * speed, Math.sin(a) * speed * r()], w: [r() * 10, r() * 10, r() * 10]});
  }
  return {obj: g, update(t) {
    const dt = t - t0; g.visible = dt > 0 && dt < life;
    for (const q of parts) {
      const k = Math.max(0, dt);
      q.m.position.set(p[0] + q.v[0] * k, Math.max(0.03, p[1] + q.v[1] * k - 4.9 * k * k), p[2] + q.v[2] * k);
      q.m.rotation.set(q.w[0] * k, q.w[1] * k, q.w[2] * k);
    }
  }};
}

// Jagged lightning bolt from a to b, flickering between t0 and t0+dur.
export function lightning(a, b, t0, o = {}) {
  const {dur = 0.6, color = '#dff3ff', seed = 7, segs = 14, jag = 0.35, branches = 3} = o;
  const r = rng(seed); const g = new THREE.Group();
  const bolt = (p0, p1, n, j) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = p0[0] + (p1[0] - p0[0]) * u, y = p0[1] + (p1[1] - p0[1]) * u, z = p0[2] + (p1[2] - p0[2]) * u;
      const k = i === 0 || i === n ? 0 : j;
      pts.push(new THREE.Vector3(x + (r() - 0.5) * k, y + (r() - 0.5) * k * 0.4, z + (r() - 0.5) * k));
    }
    return pts;
  };
  const main = bolt(a, b, segs, jag);
  const lines = [main];
  for (let i = 0; i < branches; i++) { const s = main[2 + Math.floor(r() * (segs - 4))]; lines.push(bolt([s.x, s.y, s.z], [s.x + (r() - 0.5) * 2, s.y - 0.5 - r(), s.z + (r() - 0.5) * 2], 6, jag * 0.6)); }
  const mats = [];
  for (const L of lines) {
    for (const [w, op] of [[1, 1], [3, 0.35]]) {
      const m = new THREE.LineBasicMaterial({color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, fog: false, linewidth: w});
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(L), m); g.add(ln); mats.push(m);
    }
    // glow tubes so the bolt reads at 1080p (WebGL lines are 1 px)
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(L, false, 'catmullrom', 0), L.length * 3, 0.025, 5),
      new THREE.MeshBasicMaterial({color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
    g.add(tube); mats.push(tube.material);
  }
  const light = new THREE.PointLight('#bfe4ff', 0, 12, 1.2); light.position.set(b[0], b[1] + 0.5, b[2]); g.add(light);
  return {obj: g, update(t) {
    const dt = t - t0; const on = dt > 0 && dt < dur && (Math.floor(dt * 24) % 3 !== 2);
    g.visible = dt > 0 && dt < dur; for (const m of mats) { if (m.userData.base === undefined) m.userData.base = m.opacity; m.opacity = on ? m.userData.base : 0; }
    light.intensity = on ? 18 : 0;
  }};
}

// Flickering warm light (fires, torches, lanterns).
export function fireLight(p, o = {}) {
  const {color = '#ff9a3a', intensity = 4, dist = 7, seed = 2} = o;
  const l = new THREE.PointLight(color, intensity, dist, 1.5); l.position.set(...p);
  const ph = rng(seed)() * 6;
  return {obj: l, update(t) { l.intensity = intensity * (0.85 + 0.1 * Math.sin(t * 9 + ph) + 0.05 * Math.sin(t * 23 + ph)); }};
}

// Flame: stacked additive sprites that flicker (campfire, torch, fuse tip).
export function flame(p, o = {}) {
  const {size = 0.5, seed = 4} = o; const r = rng(seed); const g = new THREE.Group(); const fl = [];
  for (const [c, s, y] of [['#ff7a2a', 1, 0], ['#ffb43a', 0.75, 0.12], ['#fff0a0', 0.45, 0.2]]) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({map: softTex(), color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
    m.position.set(p[0], p[1] + y * size, p[2]); g.add(m); fl.push({m, s, y, ph: r() * 6});
  }
  return {obj: g, update(t) { for (const q of fl) { const k = 1 + 0.15 * Math.sin(t * 13 + q.ph); q.m.scale.set(size * q.s * k, size * q.s * 1.5 * k, 1); } }};
}

// Falling particles over an area (rain streaks, snow, ash, petals). area: [cx, cz, w, d], top height h.
export function fall(area, o = {}) {
  const {n = 400, h = 8, speed = 9, color = '#cfe3ff', size = 0.05, drift = 0.2, seed = 11, from = -1e9, to = 1e9, sway = 0} = o;
  const r = rng(seed); const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const P = []; for (let i = 0; i < n; i++) P.push([area[0] + (r() - 0.5) * area[2], r() * h, area[1] + (r() - 0.5) * area[3], r() * 6]);
  const mat = new THREE.PointsMaterial({color, size, map: softTex(), transparent: true, depthWrite: false, opacity: 0.85});
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return {obj: pts, update(t) {
    pts.visible = t >= from && t <= to;
    for (let i = 0; i < n; i++) {
      const [x, y0, z, ph] = P[i];
      const y = ((y0 - t * speed) % h + h) % h;
      pos[i * 3] = x + Math.sin(t * 1.3 + ph) * sway + drift * t % 1; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;
  }};
}
// Rain: falling streaks (instanced thin boxes, slightly slanted), so it reads as rain, not dots.
export function rain(area, o = {}) {
  const {n = 900, h = 8, speed = 12, color = '#9dbfe0', len = 0.35, width = 0.012, slant = 0.12, seed = 11, from = -1e9, to = 1e9, opacity = 0.6} = o;
  const r = rng(seed);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(width, len, width), new THREE.MeshBasicMaterial({color, transparent: true, opacity, depthWrite: false}), n);
  mesh.frustumCulled = false;
  const P = []; for (let i = 0; i < n; i++) P.push([area[0] + (r() - 0.5) * area[2], r() * h, area[1] + (r() - 0.5) * area[3]]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, slant)), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  return {obj: mesh, update(t) {
    mesh.visible = t >= from && t <= to;
    for (let i = 0; i < n; i++) {
      const y = ((P[i][1] - t * speed) % h + h) % h;
      v.set(P[i][0] - y * slant, y, P[i][2]); m4.compose(v, q, sc); mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }};
}
export const snow = (area, o = {}) => fall(area, {n: 350, speed: 0.9, color: '#ffffff', size: 0.09, sway: 0.25, ...o});

// Confetti burst (celebrations, wins): coloured paper flakes that flutter down.
export function confetti(p, t0, o = {}) {
  const {n = 90, seed = 13, life = 2.6, colors = ['#e8a83a', '#c75b5b', '#5a9a8a', '#4f7fa6', '#9a6fb0', '#f3e7d3']} = o;
  const r = rng(seed); const g = new THREE.Group(); const parts = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({color: colors[i % colors.length], side: THREE.DoubleSide}));
    g.add(m); const a = r() * 6.28;
    parts.push({m, v: [Math.cos(a) * (0.5 + r() * 1.8), 3 + r() * 2.5, Math.sin(a) * (0.5 + r() * 1.8)], w: [r() * 12, r() * 12, r() * 12], ph: r() * 6});
  }
  return {obj: g, update(t) {
    const dt = t - t0; g.visible = dt > 0 && dt < life;
    for (const q of parts) {
      const k = Math.max(0, dt), vy = q.v[1] - 9.8 * k;
      const fallK = vy < -1.2 ? (k - (q.v[1] + 1.2) / 9.8) : 0; // terminal flutter speed
      const y = fallK > 0 ? p[1] + (q.v[1] ** 2 - 1.44) / 19.6 - 1.2 * fallK : p[1] + q.v[1] * k - 4.9 * k * k;
      q.m.position.set(p[0] + q.v[0] * Math.min(k, 0.6) + Math.sin(k * 4 + q.ph) * 0.1, Math.max(0.02, y), p[2] + q.v[2] * Math.min(k, 0.6));
      q.m.rotation.set(q.w[0] * k, q.w[1] * k, q.w[2] * k);
    }
  }};
}

// Water splash (something drops in water, a boat lands, a wave hits).
export function splash(p, t0, o = {}) {
  return sparks(p, t0, {n: 70, speed: 2.0, life: 1.0, color: '#d6f0ff', size: 0.08, spread: 0.7, up: 1.6, seed: 17, ...o});
}

// Magic / idea glints (a discovery, a "lightbulb" moment): small twinkles around a point.
export function glints(p, t0, o = {}) {
  return sparks(p, t0, {n: 24, speed: 0.6, life: 1.2, color: '#fff3b0', size: 0.12, spread: 1, up: 0.4, seed: 19, ...o});
}
