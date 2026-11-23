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

// ================= Rich pattern textures (reference: ornate, layered, hand-made surfaces) =================
// patternTex(kind, o) -> repeating CanvasTexture. Kinds: carpet, wallpaper, woodfloor, plaster, dirt, tiles, fabric,
// stone, thatch, bark. Colours via o.{base, accent, accent2, dark}; o.repeat for tiling; o.seed for variation.
export function patternTex(kind, o = {}) {
  const S = o.size || 512, c = canvas(S, S), x = c.getContext('2d'), r = rng(o.seed || hash(kind));
  const base = o.base || '#9a6a42', acc = o.accent || shade(base, 0.25), acc2 = o.accent2 || shade(base, -0.25), dark = o.dark || shade(base, -0.45);
  const noise = (n, a) => { for (let i = 0; i < n; i++) { x.fillStyle = r() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`; x.fillRect(r() * S, r() * S, 1 + r() * 3, 1 + r() * 3); } };
  const blotch = (n, a) => { for (let i = 0; i < n; i++) { const px = r() * S, py = r() * S, rad = 30 + r() * 110; const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, `rgba(${r() < 0.5 ? '0,0,0' : '255,240,220'},${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); } };
  x.fillStyle = base; x.fillRect(0, 0, S, S);
  if (kind === 'carpet') { // border bands + field motifs + central medallion
    const m = S * 0.06;
    x.fillStyle = dark; x.fillRect(0, 0, S, S); x.fillStyle = acc2; x.fillRect(m * 0.5, m * 0.5, S - m, S - m);
    x.fillStyle = base; x.fillRect(m * 1.4, m * 1.4, S - m * 2.8, S - m * 2.8);
    x.fillStyle = acc; for (let i = 0; i < 24; i++) { const t = (i + 0.5) / 24 * (S - m * 2) + m; for (const [px, py] of [[t, m], [t, S - m], [m, t], [S - m, t]]) { x.beginPath(); x.moveTo(px, py - m * 0.35); x.lineTo(px + m * 0.3, py); x.lineTo(px, py + m * 0.35); x.lineTo(px - m * 0.3, py); x.fill(); } }
    x.strokeStyle = acc; x.lineWidth = 3; x.strokeRect(m * 1.8, m * 1.8, S - m * 3.6, S - m * 3.6);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const px = S * (0.2 + i * 0.2), py = S * (0.2 + j * 0.2); if (Math.hypot(px - S / 2, py - S / 2) < S * 0.22) continue; x.fillStyle = acc2; x.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, rr = k % 2 ? 6 : 14; x.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); } x.fill(); }
    const cx = S / 2; for (let k = 0; k < 3; k++) { x.fillStyle = [dark, acc, acc2][k]; x.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * 6.283, rr = S * (0.2 - k * 0.055) * (1 + 0.12 * Math.cos(a * 8)); x.lineTo(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr); } x.fill(); }
    noise(S * 8, 0.05);
  } else if (kind === 'wallpaper') { // soft stripes + damask motifs
    const n = 8; for (let i = 0; i < n; i += 2) { x.fillStyle = shade(base, 0.05); x.fillRect(i * S / n, 0, S / n, S); }
    x.fillStyle = acc; x.globalAlpha = 0.55;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const px = (i + (j % 2) * 0.5) * S / 4 + S / 8, py = j * S / 4 + S / 8; x.beginPath(); x.ellipse(px, py, S * 0.035, S * 0.07, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(px, py - S * 0.07, S * 0.06, S * 0.022, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(px, py + S * 0.06, S * 0.05, S * 0.018, 0, 0, 7); x.fill(); }
    x.globalAlpha = 1; blotch(8, 0.06); noise(S * 6, 0.035);
  } else if (kind === 'woodfloor') { // planks with grain, knots and gaps
    const n = o.planks || 6, h = S / n;
    for (let i = 0; i < n; i++) {
      const y0 = i * h, off = r() * S; x.fillStyle = shade(base, (r() - 0.5) * 0.18); x.fillRect(0, y0, S, h);
      x.strokeStyle = `rgba(40,20,10,0.22)`; x.lineWidth = 1.2;
      for (let k = 0; k < 9; k++) { const yy = y0 + (k + 0.5) * h / 9; x.beginPath(); for (let px = 0; px <= S; px += 8) x.lineTo(px, yy + Math.sin((px + off) * 0.02 + k) * 2.5 + Math.sin((px + off) * 0.005) * 4); x.stroke(); }
      if (r() < 0.6) { const kx = r() * S, ky = y0 + h / 2; x.fillStyle = 'rgba(50,25,10,0.35)'; x.beginPath(); x.ellipse(kx, ky, 9, 5, 0, 0, 7); x.fill(); }
      x.fillStyle = 'rgba(20,10,5,0.55)'; x.fillRect(0, y0, S, 2.5); x.fillRect((off * 1.7) % S, y0, 2.5, h);
    }
    noise(S * 5, 0.04);
  } else if (kind === 'plaster') { blotch(26, 0.08); noise(S * 12, 0.05); x.strokeStyle = 'rgba(60,40,30,0.25)'; x.lineWidth = 1; for (let i = 0; i < 5; i++) { let px = r() * S, py = r() * S; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (r() - 0.5) * 30; py += r() * 22; x.lineTo(px, py); } x.stroke(); } }
  else if (kind === 'dirt') { blotch(40, 0.12); noise(S * 18, 0.07); for (let i = 0; i < 90; i++) { const px = r() * S, py = r() * S, rr = 2 + r() * 6; x.fillStyle = shade(base, (r() - 0.3) * 0.5); x.beginPath(); x.ellipse(px, py, rr, rr * 0.7, r() * 3, 0, 7); x.fill(); x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(px + 1.5, py + 1.5, rr, rr * 0.5, 0, 0, 7); x.fill(); } }
  else if (kind === 'tiles') { const n = o.n || 6, w = S / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 && o.checker ? acc : shade(base, (r() - 0.5) * 0.1); x.fillRect(i * w + 2, j * w + 2, w - 4, w - 4); } x.strokeStyle = dark; x.lineWidth = 4; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * w, 0); x.lineTo(i * w, S); x.moveTo(0, i * w); x.lineTo(S, i * w); x.stroke(); } blotch(10, 0.05); noise(S * 4, 0.03); }
  else if (kind === 'fabric') { const st = o.stripes ?? 6; for (let i = 0; i < st; i++) { x.fillStyle = i % 2 ? acc : base; x.fillRect(i * S / st, 0, S / st * 0.5, S); } x.strokeStyle = 'rgba(0,0,0,0.08)'; x.lineWidth = 1; for (let i = 0; i < S; i += 3) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke(); } x.fillStyle = acc2; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(r() * S, r() * S, 3, 0, 7); x.fill(); } }
  else if (kind === 'stone') { const rows = 6, h = S / rows; for (let j = 0; j < rows; j++) { let px = -(j % 2) * h * 0.6; while (px < S) { const w = h * (1 + r() * 1.2); x.fillStyle = shade(base, (r() - 0.5) * 0.22); x.fillRect(px + 3, j * h + 3, w - 6, h - 6); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(px + 3, j * h + 3, w - 6, 4); px += w; } } x.fillStyle = dark; x.globalAlpha = 0.2; noise(S * 10, 0.08); x.globalAlpha = 1; }
  else if (kind === 'grass') { // lawn: patches of several greens, bare soil spots, clover, thousands of tiny blades
    for (let i = 0; i < 26; i++) { const px = r() * S, py = r() * S, rad = 40 + r() * 120; const gg = x.createRadialGradient(px, py, 0, px, py, rad); const cc = shade(base, (r() - 0.5) * 0.3); gg.addColorStop(0, cc); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.globalAlpha = 0.5; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); }
    x.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { const px = r() * S, py = r() * S; x.fillStyle = 'rgba(110,85,55,0.35)'; x.beginPath(); x.ellipse(px, py, 12 + r() * 26, 8 + r() * 14, r() * 3, 0, 7); x.fill(); }
    for (let i = 0; i < S * 22; i++) { const px = r() * S, py = r() * S, k = r(); x.strokeStyle = k < 0.15 ? shade(base, -0.35) : k < 0.85 ? shade(base, (r() - 0.45) * 0.45) : shade('#b8b86a', (r() - 0.5) * 0.2); x.lineWidth = 0.9 + r() * 0.8; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + (r() - 0.5) * 3, py - 3, px + (r() - 0.5) * 5, py - 4 - r() * 8); x.stroke(); }
    for (let i = 0; i < 40; i++) { const px = r() * S, py = r() * S; x.fillStyle = shade(base, 0.12); for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(px + Math.cos(k * 2.1) * 3, py + Math.sin(k * 2.1) * 3, 2.6, 0, 7); x.fill(); } }
    for (let i = 0; i < 18; i++) { x.fillStyle = r() < 0.5 ? '#f6f2e0' : '#f2d24a'; x.beginPath(); x.arc(r() * S, r() * S, 1.6, 0, 7); x.fill(); }
  }
  else if (kind === 'thatch') { for (let i = 0; i < S * 3; i++) { const px = r() * S, py = r() * S, l = 20 + r() * 40; x.strokeStyle = shade(base, (r() - 0.5) * 0.4); x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 6, py + l); x.stroke(); } }
  else if (kind === 'bark') { for (let i = 0; i < 60; i++) { const px = r() * S; x.strokeStyle = shade(base, -0.2 - r() * 0.2); x.lineWidth = 2 + r() * 4; x.beginPath(); x.moveTo(px, 0); for (let py = 0; py <= S; py += 20) x.lineTo(px + Math.sin(py * 0.05 + i) * 6, py); x.stroke(); } noise(S * 6, 0.06); }
  return texFrom(c, o.repeat || [1, 1]);
}
// Material from a pattern (physically based in realistic mode).
export function patternMat(kind, o = {}) { return toon(patternTex(kind, o), {rough: o.rough ?? 0.85, metal: o.metal ?? 0, bump: o.bump ?? 1.5}); }
