// 2D flat characters standing in the 3D world. One base design; variants by palette, hat, glasses.
import * as THREE from 'three';
import {INK, rng, canvas, texFrom} from './kit';

const PX = 420; // canvas pixels per metre
const SKIN = '#f6dfc8';

function smoothPoly(n, fn) { const p = []; for (let i = 0; i < n; i++) p.push(fn(i / n)); return p; }

// Fill a closed polygon, then ink it with a hand-drawn band of varying thickness.
function inkShape(x, pts, fill, r, base = 10) {
  x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath();
  if (fill) { x.fillStyle = fill; x.fill(); }
  x.strokeStyle = INK; x.lineCap = 'round'; x.lineJoin = 'round';
  const ph = r() * 6.28, n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    x.lineWidth = base * (0.78 + 0.3 * Math.sin(i / n * 6.28 * 3 + ph) + 0.12 * r());
    x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
  }
}
function wobble(pts, r, amt) { return pts.map(([a, b]) => [a + (r() - 0.5) * amt, b + (r() - 0.5) * amt]); }
function ellipse(cx, cy, rx, ry, n = 48, a0 = 0, a1 = Math.PI * 2) {
  return smoothPoly(n, (t) => { const a = a0 + (a1 - a0) * t; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
}
function partMesh(c, wM, hM) {
  const tex = texFrom(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wM, hM),
    new THREE.MeshBasicMaterial({map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide}));
  m.castShadow = false;
  return m;
}

function drawHead(o, r) {
  const W = 0.86, H = 1.0, c = canvas(W * PX, H * PX), x = c.getContext('2d');
  const cx = W / 2 * PX, cy = 0.62 * PX, R = 0.29 * PX;
  // head
  inkShape(x, wobble(ellipse(cx, cy, R, R * 0.97, 64), r, 2), SKIN, r, 11);
  // cheeks
  x.fillStyle = 'rgba(232,140,120,0.35)';
  x.beginPath(); x.ellipse(cx - R * 0.52, cy + R * 0.3, R * 0.13, R * 0.08, 0, 0, 7); x.fill();
  x.beginPath(); x.ellipse(cx + R * 0.52, cy + R * 0.3, R * 0.13, R * 0.08, 0, 0, 7); x.fill();
  // hair fringe
  const fr = [];
  for (let i = 0; i <= 40; i++) { const a = Math.PI * (1.08 + 0.84 * i / 40); fr.push([cx + Math.cos(a) * R * 1.02, cy + Math.sin(a) * R * 1.02]); }
  const scallops = 4;
  for (let i = 0; i <= 24; i++) {
    const t = 1 - i / 24, xx = cx + (t - 0.5) * 2 * R * 0.9;
    const yy = cy - R * 0.42 + Math.abs(Math.sin(t * Math.PI * scallops)) * R * 0.2;
    fr.push([xx, yy]);
  }
  inkShape(x, fr, o.hair, r, 9);
  // eyes: calm, half-lidded
  for (const s of [-1, 1]) {
    const ex = cx + s * R * 0.36, ey = cy + R * 0.05;
    x.fillStyle = INK; x.beginPath(); x.ellipse(ex, ey, R * 0.1, R * 0.12, 0, 0, 7); x.fill();
    x.fillStyle = SKIN; x.fillRect(ex - R * 0.14, ey - R * 0.2, R * 0.28, R * 0.19);
    x.strokeStyle = INK; x.lineWidth = 8; x.lineCap = 'round';
    x.beginPath(); x.moveTo(ex - R * 0.14, ey - R * 0.01); x.lineTo(ex + R * 0.14, ey - R * 0.03); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + R * 0.03, ey + R * 0.03, R * 0.025, 0, 7); x.fill();
  }
  // tiny smile
  x.strokeStyle = INK; x.lineWidth = 7; x.beginPath(); x.arc(cx, cy + R * 0.32, R * 0.12, 0.25 * Math.PI, 0.75 * Math.PI); x.stroke();
  // glasses
  if (o.glasses) {
    x.lineWidth = 7;
    for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * R * 0.36, cy + R * 0.04, R * 0.2, 0, 7); x.stroke(); }
    x.beginPath(); x.moveTo(cx - R * 0.16, cy); x.lineTo(cx + R * 0.16, cy); x.stroke();
  }
  // hats
  const top = cy - R;
  if (o.hat === 'cap') {
    inkShape(x, ellipse(cx, top + R * 0.42, R * 0.98, R * 0.62, 40, Math.PI, Math.PI * 2).concat([[cx + R * 0.98, top + R * 0.42]]), o.hatColor, r, 10);
    inkShape(x, [[cx - R * 0.95, top + R * 0.36], [cx + R * 1.45, top + R * 0.36], [cx + R * 1.4, top + R * 0.5], [cx - R * 0.95, top + R * 0.5]], o.hatColor2 || o.hatColor, r, 9);
  } else if (o.hat === 'bowler') {
    inkShape(x, ellipse(cx, top + R * 0.25, R * 0.82, R * 0.75, 40, Math.PI, Math.PI * 2), o.hatColor, r, 10);
    inkShape(x, ellipse(cx, top + R * 0.27, R * 1.25, R * 0.13, 40), o.hatColor, r, 9);
  } else if (o.hat === 'top') {
    inkShape(x, [[cx - R * 0.62, top - R * 0.85], [cx + R * 0.62, top - R * 0.85], [cx + R * 0.68, top + R * 0.25], [cx - R * 0.68, top + R * 0.25]], o.hatColor, r, 10);
    inkShape(x, ellipse(cx, top + R * 0.27, R * 1.15, R * 0.13, 40), o.hatColor, r, 9);
  }
  return {mesh: partMesh(c, W, H), W, H, headCY: 1 - 0.62}; // headCY: metres from bottom of canvas to head centre
}

function drawTorso(o, r) {
  const W = 0.66, H = 0.74, c = canvas(W * PX, H * PX), x = c.getContext('2d');
  const cx = W / 2 * PX, top = 0.06 * PX, bot = 0.68 * PX, tw = 0.15 * PX, bw = 0.25 * PX;
  const hw = (t) => {
    let w = tw + (bw - tw) * Math.pow(Math.sin(Math.min(1, t / 0.82) * Math.PI / 2), 1.3);
    if (t > 0.82) w = bw * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.82) / 0.18, 2)));
    if (t < 0.12) w *= Math.sqrt(1 - Math.pow((0.12 - t) / 0.12, 2)) * 0.5 + 0.5;
    return w;
  };
  const L = [], Rr = [];
  for (let i = 0; i <= 30; i++) { const t = i / 30, y = top + (bot - top) * t; Rr.push([cx + hw(t), y]); L.unshift([cx - hw(t), y]); }
  const pts = wobble(Rr.concat(L), r, 1.5);
  // two-tone fill with clip
  x.save(); x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.clip();
  x.fillStyle = o.jacket; x.fillRect(0, 0, W * PX, H * PX);
  x.fillStyle = o.lower; x.fillRect(0, top + (bot - top) * 0.64, W * PX, H * PX);
  x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); x.moveTo(0, top + (bot - top) * 0.64); x.lineTo(W * PX, top + (bot - top) * 0.64); x.stroke();
  x.restore();
  // pocket patch
  const py = top + (bot - top) * 0.42, px = cx - bw * 0.58;
  inkShape(x, wobble([[px - 18, py], [px + 18, py], [px + 16, py + 30], [px - 16, py + 30]], r, 2), o.pocket || o.lower, r, 5);
  // collar + tie
  inkShape(x, [[cx, top + 52], [cx - 36, top + 6], [cx - 6, top + 2]], '#fffdf6', r, 5);
  inkShape(x, [[cx, top + 52], [cx + 36, top + 6], [cx + 6, top + 2]], '#fffdf6', r, 5);
  inkShape(x, [[cx, top + 40], [cx + 11, top + 58], [cx + 7, top + 140], [cx, top + 156], [cx - 7, top + 140], [cx - 11, top + 58]], o.tie, r, 5);
  // body outline on top
  inkShape(x, pts, null, r, 11);
  return {mesh: partMesh(c, W, H), W, H};
}

function drawLimb(len, color, end, r) {
  const W = 0.18, H = len + 0.1, c = canvas(W * PX, H * PX), x = c.getContext('2d');
  const cx = W / 2 * PX, top = 0.03 * PX, bot = (len + 0.02) * PX;
  const pts = [[cx - 9, top], [cx + 9, top], [cx + 5, bot], [cx - 5, bot]];
  inkShape(x, wobble(pts, r, 1), color, r, 7);
  if (end === 'hand') { x.fillStyle = INK; x.beginPath(); x.arc(cx, bot + 4, 0.05 * PX, 0, 7); x.fill(); }
  if (end === 'shoe') inkShape(x, ellipse(cx + 8, bot + 6, 0.07 * PX, 0.035 * PX, 30), '#3b2a2c', r, 6);
  return {mesh: partMesh(c, W, H), W, H};
}

// Soft contact shadow blob.
let _blob;
function blobTex() {
  if (_blob) return _blob;
  const c = canvas(128, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(53,31,34,0.55)'); g.addColorStop(1, 'rgba(53,31,34,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  _blob = texFrom(c); return _blob;
}

export const PALETTES = {
  farmer: {jacket: '#7fa35a', lower: '#a77b4f', tie: '#c2463a', hair: '#4a3026', hat: 'cap', hatColor: '#d9b45a', hatColor2: '#c49a3e'},
  fisher: {jacket: '#4f7fa6', lower: '#2f4f6a', tie: '#e3b34a', hair: '#2b2326', hat: 'none'},
  shoemaker: {jacket: '#b0694a', lower: '#6b4a3a', tie: '#2f5f5a', hair: '#8a5a3a', hat: 'bowler', hatColor: '#4a3430', glasses: true},
  sellerA: {jacket: '#d99a4e', lower: '#7d5a44', tie: '#4f7fa6', hair: '#3a2a26', hat: 'none'},
  sellerB: {jacket: '#9a6fb0', lower: '#5a4466', tie: '#e8c35a', hair: '#5a3a2a', hat: 'bowler', hatColor: '#3d3a4a'},
  sellerC: {jacket: '#c75b5b', lower: '#6a3d3d', tie: '#f0d27a', hair: '#2b2326', hat: 'cap', hatColor: '#4f7fa6'},
  sellerD: {jacket: '#5a9a8a', lower: '#3d5a52', tie: '#d9774a', hair: '#7a4a2a', hat: 'none', glasses: true},
  minter: {jacket: '#c99a4a', lower: '#7a5a3a', tie: '#8a3a3a', hair: '#3a2a26', hat: 'none'},
  guide: {jacket: '#3f5f8a', lower: '#2a3a56', tie: '#d9a441', hair: '#5a3a2a', hat: 'none', glasses: true},
  buyer: {jacket: '#e0b84f', lower: '#55606e', tie: '#4f7fa6', hair: '#2b2326', hat: 'top', hatColor: '#3a2f33'},
};

// Build a character. Returns {group, parts, update(t, camPos)}. Feet at y=0, facing +z.
export function makeChar(name, o = {}) {
  const p = {...PALETTES[name], ...o};
  const r = rng(o.seed || name.length * 17 + 3);
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  const s = o.scale || 1;
  g.scale.setScalar(s);

  const hipY = 0.64, shY = 1.1, neckY = 1.12;
  const legs = [];
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(sx * 0.075, hipY, -0.02);
    const l = drawLimb(0.62, p.lower, 'shoe', r);
    l.mesh.position.set(0, -l.H / 2 + 0.03, 0); piv.add(l.mesh); body.add(piv); legs.push(piv);
  }
  const torso = drawTorso(p, r);
  torso.mesh.position.set(0, 0.53 + torso.H / 2, 0); body.add(torso.mesh);
  const arms = [];
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(sx * 0.165, shY, 0.02);
    const a = drawLimb(0.5, p.jacket, 'hand', r);
    a.mesh.position.set(0, -a.H / 2 + 0.03, 0); piv.add(a.mesh); body.add(piv);
    const hand = new THREE.Group(); hand.position.set(0, -0.52, 0.02); piv.add(hand);
    piv.userData.hand = hand; piv.userData.sx = sx; piv.rotation.z = sx * 0.12;
    arms.push(piv);
  }
  const headPiv = new THREE.Group(); headPiv.position.set(0, neckY, 0.03); body.add(headPiv);
  const head = drawHead(p, r);
  head.mesh.position.set(0, (1.42 - neckY) + (head.H / 2 - (1 - 0.62)), 0); headPiv.add(head.mesh);

  const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshBasicMaterial({map: blobTex(), transparent: true, depthWrite: false}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.012; g.add(blob);

  const phase = r() * 6.28;
  const state = {yaw0: o.yaw ?? 0, walk: 0, armL: 0, armR: 0, shake: 0, nod: 1};
  const up = new THREE.Vector3();
  function update(t, camPos) {
    const bob = Math.sin(t * 2.2 + phase) * 0.012 * s;
    body.position.y = bob + Math.abs(Math.sin(t * 7)) * 0.04 * state.walk;
    headPiv.rotation.z = Math.sin(t * 1.3 + phase) * 0.04 * state.nod;
    headPiv.position.x = Math.sin(t * 16) * 0.035 * state.shake;
    headPiv.rotation.z += Math.sin(t * 16) * 0.12 * state.shake;
    legs[0].rotation.x = Math.sin(t * 7) * 0.45 * state.walk;
    legs[1].rotation.x = -Math.sin(t * 7) * 0.45 * state.walk;
    legs[0].rotation.z = Math.sin(t * 7) * 0.15 * state.walk;
    legs[1].rotation.z = Math.sin(t * 7) * 0.15 * state.walk;
    arms[0].rotation.z = -0.12 - Math.sin(t * 1.7 + phase) * 0.05 - state.armL;
    arms[1].rotation.z = 0.12 + Math.sin(t * 1.7 + phase + 1) * 0.05 + state.armR;
    if (camPos) {
      g.getWorldPosition(up);
      let a = Math.atan2(camPos.x - up.x, camPos.z - up.z) - state.yaw0;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      body.rotation.y = state.yaw0 - (g.rotation.y) + Math.max(-0.7, Math.min(0.7, a));
      blob.rotation.z = 0;
    }
  }
  return {group: g, state, update, arms, hand: (i) => arms[i].userData.hand, headPiv};
}
