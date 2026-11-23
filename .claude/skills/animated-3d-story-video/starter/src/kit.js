// Shared 3D kit: toon materials, painted textures with wear, ink outlines, signs.
import * as THREE from 'three';

export const INK = '#351f22';
// Render style for worlds and props. 'realistic' (default): physically based materials with roughness, bump detail and
// environment light, no ink outlines on props (characters keep their hand-drawn ink). 'toon': the original flat look.
export const STYLE = {realistic: true};
export function setRenderStyle(name) { STYLE.realistic = name !== 'toon'; matCache.clear(); }
export const CREAM = '#f3e7d3';
const V3 = THREE.Vector3;

export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function shade(hex, amt) {
  const c = new THREE.Color(hex);
  if (amt < 0) c.lerp(new THREE.Color('#2a1a1c'), -amt);
  else c.lerp(new THREE.Color('#fff8ee'), amt);
  return '#' + c.getHexString();
}

let _grad;
export function gradientMap() {
  if (_grad) return _grad;
  const d = new Uint8Array([105, 105, 105, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
  _grad.generateMipmaps = false;
  _grad.needsUpdate = true;
  return _grad;
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function texFrom(c, repeat) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

// Flat painted colour with wear: stains, chips, scratches; optional planks / bricks / stripes.
export function paintTex(base, o = {}) {
  const {seed = 1, size = 256, stains = 8, chips = 12, scratches = 6, planks = 0, bricks = false,
    stripes = null, cobbles = false, repeat = null, grain = 0} = o;
  const r = rng(seed);
  const c = canvas(size, size), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  if (stripes) {
    const n = stripes.n || 6;
    for (let i = 0; i < n; i += 2) { x.fillStyle = stripes.color; x.fillRect(i * size / n, 0, size / n, size); }
  }
  if (planks) {
    for (let i = 0; i < planks; i++) {
      const y = i * size / planks;
      x.fillStyle = shade(base, (r() - 0.5) * 0.12); x.fillRect(0, y, size, size / planks);
      x.fillStyle = shade(base, -0.35); x.fillRect(0, y, size, 3);
      const k = r() * size; x.fillRect(k, y, 3, size / planks);
    }
  }
  if (bricks) {
    const rows = 8, cols = 4, bh = size / rows, bw = size / cols;
    for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) {
      const ox = (j % 2) * bw / 2;
      x.fillStyle = shade(base, (r() - 0.5) * 0.18);
      x.fillRect(i * bw + ox + 2, j * bh + 2, bw - 4, bh - 4);
    }
  }
  if (cobbles) {
    x.fillStyle = shade(base, -0.25); x.fillRect(0, 0, size, size);
    for (let i = 0; i < 70; i++) {
      x.fillStyle = shade(base, (r() - 0.5) * 0.2);
      x.beginPath(); x.ellipse(r() * size, r() * size, 10 + r() * 12, 8 + r() * 10, r() * 3, 0, 7); x.fill();
    }
  }
  for (let i = 0; i < grain; i++) {
    x.fillStyle = shade(base, (r() - 0.5) * 0.25); x.globalAlpha = 0.5;
    x.fillRect(r() * size, r() * size, 2 + r() * 6, 1 + r() * 2);
  }
  x.globalAlpha = 1;
  if (STYLE.realistic) { // micro texture: fine mottling so surfaces never look plastic
    for (let i = 0; i < size * 6; i++) { x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; x.fillRect(r() * size, r() * size, 1 + r() * 3, 1 + r() * 3); }
    for (let i = 0; i < 6; i++) { const px = r() * size, py = r() * size, rad = 40 + r() * 90; const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.06)`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); }
  }
  for (let i = 0; i < stains; i++) {
    const px = r() * size, py = r() * size, rad = 10 + r() * 40;
    const g = x.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, 'rgba(60,35,30,0.13)'); g.addColorStop(1, 'rgba(60,35,30,0)');
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < chips; i++) {
    const px = r() * size, py = r() * size, s = 2 + r() * 6;
    x.fillStyle = 'rgba(255,250,240,0.35)';
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + s, py + r() * s); x.lineTo(px + r() * s, py + s); x.fill();
  }
  x.strokeStyle = 'rgba(53,31,34,0.22)'; x.lineWidth = 1.2;
  for (let i = 0; i < scratches; i++) {
    const px = r() * size, py = r() * size;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 40, py + (r() - 0.5) * 14); x.stroke();
  }
  return texFrom(c, repeat);
}

const matCache = new Map();
export function toon(colorOrTex, o = {}) {
  const key = typeof colorOrTex === 'string' && !o.noCache ? colorOrTex + JSON.stringify(o) : null;
  if (key && matCache.has(key)) return matCache.get(key);
  let m;
  const real = STYLE.realistic && !o.toon;
  const Mat = (opts) => (real ? new THREE.MeshStandardMaterial({roughness: o.rough ?? 0.82, metalness: o.metal ?? 0, ...opts}) : new THREE.MeshToonMaterial({gradientMap: gradientMap(), ...opts}));
  if (typeof colorOrTex === 'string') {
    const wear = o.wear === false ? null : paintTex(colorOrTex, {seed: hash(colorOrTex), ...(o.paint || {})});
    m = Mat({color: '#ffffff', map: wear});
    if (!wear) m.color.set(colorOrTex);
  } else {
    m = Mat({map: colorOrTex});
  }
  if (real && m.map && o.bump !== false) { m.bumpMap = m.map; m.bumpScale = o.bump ?? 1.2; }
  if (o.transparent) { m.transparent = true; m.opacity = o.opacity ?? 0.4; m.depthWrite = false; }
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.emissiveIntensity ?? 0.6; }
  if (o.side) m.side = o.side;
  if (key) matCache.set(key, m);
  return m;
}

function hash(s) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 9973 + 1; }

const hullMat = new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide});
const lineMat = new THREE.LineBasicMaterial({color: INK});

// Wrap a geometry in a group: toon mesh + inverted hull + edge lines.
export function ink(geom, mat, o = {}) {
  let {hull = 0.022, edges = true, edgeAngle = 35, cast = true, receive = true} = o;
  if (STYLE.realistic && !o.keepInk) { hull = 0; edges = false; }
  const g = new THREE.Group();
  const m = new THREE.Mesh(geom, mat);
  m.castShadow = cast; m.receiveShadow = receive;
  g.add(m);
  geom.computeBoundingBox();
  const bb = geom.boundingBox, size = bb.getSize(new V3()), c = bb.getCenter(new V3());
  if (hull > 0) {
    const s = new V3(
      size.x > 0.03 ? 1 + 2 * hull / size.x : 1,
      size.y > 0.03 ? 1 + 2 * hull / size.y : 1,
      size.z > 0.03 ? 1 + 2 * hull / size.z : 1);
    const h = new THREE.Mesh(geom, hullMat);
    h.scale.copy(s);
    h.position.set(c.x * (1 - s.x), c.y * (1 - s.y), c.z * (1 - s.z));
    g.add(h);
  }
  if (edges) g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, edgeAngle), lineMat));
  g.userData.mesh = m;
  return g;
}

export function at(obj, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
  obj.position.set(x, y, z); obj.rotation.set(rx, ry, rz); return obj;
}

const M = (m) => (typeof m === 'string' ? toon(m) : m);
// Box resting on y=0 (base at bottom).
export function box(w, h, d, mat, o = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (!o.center) geo.translate(0, h / 2, 0);
  return ink(geo, M(mat), o);
}
export function cyl(rt, rb, h, mat, o = {}) {
  const geo = new THREE.CylinderGeometry(rt, rb, h, o.seg || 18);
  if (!o.center) geo.translate(0, h / 2, 0);
  return ink(geo, M(mat), {edges: false, ...o});
}
export function ball(r, mat, o = {}) {
  const geo = new THREE.SphereGeometry(r, o.seg || 18, o.seg ? o.seg - 4 : 12);
  if (o.sx || o.sy || o.sz) geo.scale(o.sx || 1, o.sy || 1, o.sz || 1);
  return ink(geo, M(mat), {edges: false, ...o});
}
export function cone(r, h, mat, o = {}) {
  const geo = new THREE.ConeGeometry(r, h, o.seg || 16);
  geo.translate(0, h / 2, 0);
  return ink(geo, M(mat), {edges: false, ...o});
}

// Painted sign lettering on a wear texture.
export function signTex(text, o = {}) {
  const {w = 1024, h = 384, bg = '#ead2a2', fg = INK, font = '"Inter Display"', weight = 900,
    seed = 3, border = true, sub = null, wear = true} = o;
  const c = canvas(w, h), x = c.getContext('2d');
  const r = rng(seed);
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  if (wear) {
    for (let i = 0; i < 14; i++) {
      const px = r() * w, py = r() * h, rad = 20 + r() * 80;
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, 'rgba(70,40,30,0.12)'); g.addColorStop(1, 'rgba(70,40,30,0)');
      x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
  }
  if (border) { x.strokeStyle = fg; x.lineWidth = h * 0.05; x.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12); }
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
  const mainH = sub ? h * 0.42 : h * 0.55;
  let fs = mainH;
  x.font = `${weight} ${fs}px ${font}`;
  while (x.measureText(text).width > w * 0.84 && fs > 10) { fs -= 4; x.font = `${weight} ${fs}px ${font}`; }
  x.fillText(text, w / 2, sub ? h * 0.42 : h * 0.53);
  if (sub) {
    let s2 = h * 0.2; x.font = `700 ${s2}px ${font}`;
    while (x.measureText(sub).width > w * 0.84 && s2 > 8) { s2 -= 2; x.font = `700 ${s2}px ${font}`; }
    x.fillText(sub, w / 2, h * 0.75);
  }
  // paint chips over letters
  x.fillStyle = bg;
  for (let i = 0; i < 30; i++) { x.globalAlpha = 0.5; x.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 4); }
  x.globalAlpha = 1;
  return texFrom(c);
}

// A flat board with painted text, outlined, given world width/height and depth.
export function sign(text, w, h, o = {}) {
  const tex = signTex(text, {w: 1024, h: Math.round(1024 * h / w), ...o});
  const geo = new THREE.BoxGeometry(w, h, o.depth || 0.06);
  const side = toon(o.frame || '#7a5236');
  const front = toon(tex);
  const mats = [side, side, side, side, front, side];
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mats); m.castShadow = true; m.receiveShadow = true;
  g.add(m);
  if (!STYLE.realistic) { const hull = new THREE.Mesh(geo, hullMat); hull.scale.set(1 + 0.05 / w, 1 + 0.05 / h, 1.4); g.add(hull); }
  return g;
}

// Plane decal (for painted things on surfaces), unlit-ish via toon map.
export function decal(tex, w, h, o = {}) {
  const m = new THREE.MeshToonMaterial({map: tex, gradientMap: gradientMap(), transparent: !!o.transparent, alphaTest: o.transparent ? 0.4 : 0});
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.receiveShadow = true;
  return mesh;
}

export function easeOutBack(x) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
export function clamp01(x) { return Math.max(0, Math.min(1, x)); }
export function smooth(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
// pop-in scale at time t0 (seconds), duration d
export function pop(t, t0, d = 0.35) { if (t < t0) return 0.0001; const u = clamp01((t - t0) / d); return Math.max(0.0001, easeOutBack(u)); }
