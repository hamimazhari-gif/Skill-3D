// Shared procedural props: facade/house, stall, sack, crate, barrel, tree, goat, chicken, fish, coin, etc.
import * as THREE from 'three';
import {INK, toon, ink, box, cyl, ball, cone, at, sign, signTex, paintTex, canvas, texFrom, rng, shade, decal} from './kit';

// Extruded wall with window reveals + sills, door as a notch (not a hole touching the edge), cornice, interior backdrop.
export function facade(w, h, o = {}) {
  const {color = '#e6c99a', door = true, windows = 2, depth = 0.25, seed = 1, trim = '#8a5a3a'} = o;
  const g = new THREE.Group();
  const s = new THREE.Shape();
  const dw = 0.9, dh = 1.9, dx = o.doorX ?? 0;
  s.moveTo(-w / 2, 0);
  if (door) { s.lineTo(dx - dw / 2, 0); s.lineTo(dx - dw / 2, dh); s.lineTo(dx + dw / 2, dh); s.lineTo(dx + dw / 2, 0); }
  s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
  const wins = [];
  const ww = 0.7, wh = 0.85;
  for (let i = 0; i < windows; i++) {
    const wx = windows === 1 ? (door ? w / 4 : 0) : -w / 2 + w * (i + 0.5) / windows;
    if (door && Math.abs(wx - dx) < 0.9) continue;
    const wy = Math.min(h - wh - 0.4, 1.1);
    const hole = new THREE.Path();
    hole.moveTo(wx - ww / 2, wy); hole.lineTo(wx + ww / 2, wy); hole.lineTo(wx + ww / 2, wy + wh); hole.lineTo(wx - ww / 2, wy + wh); hole.lineTo(wx - ww / 2, wy);
    s.holes.push(hole); wins.push([wx, wy]);
  }
  const geo = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: false});
  geo.translate(0, 0, -depth);
  g.add(ink(geo, toon(color, {paint: {seed, stains: 14, chips: 20, scratches: 10}}), {hull: 0}));
  // backdrop behind openings (interior)
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, h - 0.1), toon('#5a3d33', {wear: false}));
  back.position.set(0, h / 2, -depth - 0.5); g.add(back);
  for (const [wx, wy] of wins) {
    const sill = box(ww + 0.2, 0.08, 0.18, trim); at(sill, wx, wy - 0.08, 0.05); g.add(sill);
    const lintel = box(ww + 0.16, 0.1, 0.08, trim); at(lintel, wx, wy + wh, 0.02); g.add(lintel);
    const shL = box(0.32, wh, 0.05, o.shutter || '#5f8a6a'); at(shL, wx - ww / 2 - 0.2, wy, 0.03); g.add(shL);
    const shR = box(0.32, wh, 0.05, o.shutter || '#5f8a6a'); at(shR, wx + ww / 2 + 0.2, wy, 0.03); g.add(shR);
    const bar = box(0.04, wh, 0.04, trim); at(bar, wx, wy, -depth / 2); g.add(bar);
  }
  if (door) {
    const d = box(dw - 0.04, dh - 0.04, 0.06, o.doorColor || '#7a4a32'); at(d, dx, 0, -depth + 0.06); g.add(d);
    const p1 = box(dw * 0.3, dh * 0.35, 0.04, shade(o.doorColor || '#7a4a32', -0.15)); at(p1, dx - dw * 0.2, dh * 0.5, -depth + 0.1); g.add(p1);
    const p2 = box(dw * 0.3, dh * 0.35, 0.04, shade(o.doorColor || '#7a4a32', -0.15)); at(p2, dx + dw * 0.2, dh * 0.5, -depth + 0.1); g.add(p2);
    const step = box(dw + 0.3, 0.12, 0.4, '#9a8a7a'); at(step, dx, 0, 0.15); g.add(step);
  }
  const cor = box(w + 0.3, 0.18, depth + 0.25, trim); at(cor, 0, h, -depth / 2 + 0.06); g.add(cor);
  return g;
}

export function gableRoof(w, d, h, color) {
  const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.3, 0); s.lineTo(w / 2 + 0.3, 0); s.lineTo(0, h); s.lineTo(-w / 2 - 0.3, 0);
  const geo = new THREE.ExtrudeGeometry(s, {depth: d + 0.5, bevelEnabled: false}); geo.translate(0, 0, -(d + 0.5) / 2);
  return ink(geo, toon(color, {paint: {planks: 10, seed: 9}}), {hull: 0.03});
}

export function house(w, h, d, o = {}) {
  const g = new THREE.Group();
  const body = box(w, h, d, o.color || '#e6c99a'); at(body, 0, 0, -d / 2 - 0.25); g.add(body);
  const f = facade(w, h, o); g.add(f);
  const roof = gableRoof(w, d, 1.3, o.roof || '#b5543c'); at(roof, 0, h + 0.18, -d / 2); g.add(roof);
  const ch = box(0.4, 1.2, 0.4, '#9a6a52'); at(ch, w / 3, h + 0.3, -d / 2); g.add(ch);
  return g;
}

export function sack(label, o = {}) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.3, 20, 14);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = y > 0 ? 1 - (y / 0.3) * 0.45 : 1 + Math.min(0, y / 0.3) * -0.05;
    p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k * 0.75);
    p.setY(i, y * 1.25 + (y < -0.2 ? (y + 0.2) * -0.6 : 0));
  }
  geo.computeVertexNormals(); geo.translate(0, 0.36, 0);
  g.add(ink(geo, toon(o.color || '#d8bf8a', {paint: {grain: 120, seed: 31}}), {edges: false, hull: 0.02}));
  const tie = cyl(0.07, 0.09, 0.12, '#8a6a3a'); at(tie, 0, 0.66, 0); g.add(tie);
  if (label) {
    const t = signTex(label, {w: 512, h: 256, bg: o.color || '#d8bf8a', border: false, wear: true});
    const d = decal(t, 0.42, 0.21); d.position.set(0, 0.34, 0.235); g.add(d);
  }
  g.scale.setScalar(o.scale || 1);
  return g;
}

export function crate(w = 0.7, h = 0.5, d = 0.6, label, color = '#b08454') {
  const g = new THREE.Group();
  g.add(box(w, h, d, toon(color, {paint: {planks: 5, seed: 12}})));
  if (label) { const s = sign(label, w * 0.8, h * 0.45, {depth: 0.02, frame: color, bg: shade(color, 0.3), border: false}); at(s, 0, h / 2, d / 2 + 0.012); g.add(s); }
  return g;
}

export function barrel(o = {}) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 20, 6);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = 1 + 0.12 * Math.cos(y / 0.4 * Math.PI / 2); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  geo.computeVertexNormals(); geo.translate(0, 0.4, 0);
  g.add(ink(geo, toon(o.color || '#a0703f', {paint: {planks: 0, grain: 80, seed: 41}}), {edges: false}));
  for (const y of [0.15, 0.65]) { const r = cyl(0.335, 0.335, 0.05, '#5a4a44', {hull: 0.01}); at(r, 0, y, 0); g.add(r); }
  return g;
}

export function tree(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 5);
  const h = o.h || 2.4;
  g.add(cyl(0.12, 0.18, h, '#7a5236'));
  for (let i = 0; i < 4; i++) {
    const b = ball(0.7 + r() * 0.4, o.leaf || '#6f9a4f', {seg: 10});
    at(b, (r() - 0.5) * 0.9, h + (r() - 0.2) * 0.8, (r() - 0.5) * 0.9); g.add(b);
  }
  return g;
}

export function goat(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#efe6d6';
  const body = ball(0.32, c, {sx: 1.5, sy: 0.85, sz: 0.85}); at(body, 0, 0.62, 0); g.add(body);
  const head = ball(0.17, c, {sx: 1.3, sy: 1, sz: 0.9}); at(head, 0.5, 0.92, 0); g.add(head);
  const beard = cone(0.05, 0.14, c); at(beard, 0.62, 0.72, 0, 0, Math.PI); g.add(beard);
  for (const s of [-1, 1]) {
    const horn = cone(0.035, 0.2, '#8a7a6a'); at(horn, 0.42, 1.05, s * 0.07, 0, 0, 0.6); g.add(horn);
    const ear = ball(0.07, c, {sx: 1.6, sy: 0.6, sz: 0.6}); at(ear, 0.42, 0.97, s * 0.16); g.add(ear);
    const eye = ball(0.025, INK); at(eye, 0.62, 0.97, s * 0.09); g.add(eye);
  }
  for (const [x, z] of [[-0.3, -0.15], [-0.3, 0.15], [0.3, -0.15], [0.3, 0.15]]) { const l = cyl(0.04, 0.035, 0.4, c, {hull: 0.012}); at(l, x, 0, z); g.add(l); }
  const tail = cone(0.04, 0.12, c); at(tail, -0.5, 0.75, 0, 0, 0, 0.9); g.add(tail);
  return g;
}

export function chicken() {
  const g = new THREE.Group();
  const b = ball(0.16, '#fbf6ec', {sx: 1.2, sy: 1, sz: 0.9}); at(b, 0, 0.2, 0); g.add(b);
  const h = ball(0.09, '#fbf6ec'); at(h, 0.14, 0.37, 0); g.add(h);
  const comb = ball(0.045, '#d8413a', {sx: 1.4, sy: 0.9, sz: 0.4}); at(comb, 0.14, 0.47, 0); g.add(comb);
  const beak = cone(0.03, 0.07, '#e8a83a'); at(beak, 0.24, 0.37, 0, 0, 0, -Math.PI / 2); g.add(beak);
  const tail = ball(0.08, '#fbf6ec', {sx: 0.6, sy: 1.3, sz: 0.5}); at(tail, -0.18, 0.32, 0, 0, 0, 0.4); g.add(tail);
  for (const s of [-1, 1]) { const e = ball(0.015, INK); at(e, 0.2, 0.39, s * 0.06); g.add(e); }
  return g;
}

export function cage() {
  const g = new THREE.Group();
  g.add(crate(0.8, 0.45, 0.6, null, '#a07a4a'));
  const top = box(0.8, 0.05, 0.6, '#c9a462'); at(top, 0, 1.05, 0); g.add(top);
  for (let i = 0; i <= 6; i++) for (const z of [-0.28, 0.28]) { const b = cyl(0.012, 0.012, 0.6, '#c9a462', {hull: 0.006}); at(b, -0.38 + i * 0.127, 0.45, z); g.add(b); }
  for (const x of [-0.38, 0.38]) for (let i = 0; i <= 4; i++) { const b = cyl(0.012, 0.012, 0.6, '#c9a462', {hull: 0.006}); at(b, x, 0.45, -0.28 + i * 0.14); g.add(b); }
  const ch = chicken(); at(ch, 0, 0.45, 0, 0.3); g.add(ch);
  g.userData.chicken = ch;
  return g;
}

export function fish(color = '#7aa3b8') {
  const g = new THREE.Group();
  const b = ball(0.12, color, {sx: 1.8, sy: 0.75, sz: 0.45}); g.add(b);
  const t = cone(0.08, 0.12, color); at(t, -0.27, 0, 0, 0, 0, Math.PI / 2); g.add(t);
  const e = ball(0.018, INK); at(e, 0.14, 0.03, 0.05); g.add(e);
  return g;
}

export function basket(color = '#b8925a', fishCount = 3) {
  const g = new THREE.Group();
  g.add(cyl(0.3, 0.24, 0.32, toon(color, {paint: {stripes: {n: 14, color: shade(color, -0.12)}, seed: 21}})));
  for (let i = 0; i < fishCount; i++) { const f = fish(); at(f, (i - 1) * 0.15, 0.36, (i % 2) * 0.08 - 0.04, i * 0.8, 0, 0.3); g.add(f); }
  return g;
}

export function stall(label, o = {}) {
  const g = new THREE.Group();
  const w = o.w || 2.2, d = o.d || 1.0;
  const table = box(w, 0.85, d, toon('#a8784a', {paint: {planks: 4, seed: 17}})); g.add(table);
  for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) for (const z of [-d / 2 - 0.1, d / 2 + 0.05]) {
    const p = cyl(0.05, 0.05, z < 0 ? 2.6 : 2.3, '#7a5236'); at(p, x, 0, z); g.add(p);
  }
  const aw = new THREE.BoxGeometry(w + 0.4, 0.06, d + 0.8);
  const awn = ink(aw, toon(o.awning || '#d9774a', {paint: {stripes: {n: 8, color: '#f3e3c3'}, seed: 5}}), {hull: 0.02});
  at(awn, 0, 2.45, -0.05, 0, -0.18); g.add(awn);
  if (label) { const s = sign(label, 1.4, 0.42, {bg: o.signBg || '#f1dcae'}); at(s, 0, 2.05, d / 2 + 0.1); g.add(s); }
  return g;
}

export function coinTex(o = {}) {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = o.color || '#d9b44a'; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill();
  x.strokeStyle = shade(o.color || '#d9b44a', -0.35); x.lineWidth = 8; x.beginPath(); x.arc(128, 128, 110, 0, 7); x.stroke();
  // stylised lion head (mane + face), as on early Lydian coins
  x.fillStyle = shade(o.color || '#d9b44a', -0.25);
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; x.beginPath(); x.ellipse(128 + Math.cos(a) * 52, 128 + Math.sin(a) * 52, 22, 13, a, 0, 7); x.fill(); }
  x.fillStyle = shade(o.color || '#d9b44a', 0.15); x.beginPath(); x.arc(128, 128, 48, 0, 7); x.fill();
  x.fillStyle = INK; x.beginPath(); x.arc(110, 118, 6, 0, 7); x.arc(146, 118, 6, 0, 7); x.fill();
  x.beginPath(); x.moveTo(118, 140); x.lineTo(138, 140); x.lineTo(128, 152); x.fill();
  x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.arc(128, 150, 16, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke();
  return texFrom(c);
}

export function coin(r = 0.06, o = {}) {
  const geo = new THREE.CylinderGeometry(r, r, r * 0.22, 28);
  const face = toon(o.tex || coinTex(o));
  const edge = toon(o.color || '#c99a3a', {wear: false});
  const m = new THREE.Mesh(geo, [edge, face, face]); m.castShadow = true;
  const g = new THREE.Group(); g.add(m);
  const hull = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide}));
  hull.scale.set(1 + 0.012 / r, 1.25, 1 + 0.012 / r); g.add(hull);
  return g;
}

export function coinPile(n = 10, seed = 3) {
  const g = new THREE.Group(); const r = rng(seed); const t = coinTex();
  for (let i = 0; i < n; i++) { const c = coin(0.045, {tex: t}); at(c, (r() - 0.5) * 0.25, 0.01 + i * 0.012, (r() - 0.5) * 0.2, r() * 6, (r() - 0.5) * 0.3); g.add(c); }
  return g;
}

export function shells(n = 7, seed = 4) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const s = ball(0.05, i % 2 ? '#f6ead8' : '#f0d6c8', {sx: 1.3, sy: 0.6, sz: 0.9});
    at(s, (r() - 0.5) * 0.32, 0.03, (r() - 0.5) * 0.25, r() * 6); g.add(s);
  }
  return g;
}

export function chalkboard(w, h, o = {}) {
  const g = new THREE.Group();
  const frame = box(w + 0.1, h + 0.1, 0.05, '#7a5236', {center: true}); g.add(frame);
  const c = canvas(1024, Math.round(1024 * h / w)), x = c.getContext('2d');
  x.fillStyle = '#2f3f3a'; x.fillRect(0, 0, c.width, c.height);
  const r = rng(o.seed || 2);
  for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,0.04)'; x.beginPath(); x.ellipse(r() * c.width, r() * c.height, 60 + r() * 100, 20 + r() * 40, r() * 3, 0, 7); x.fill(); }
  if (o.text) {
    x.fillStyle = '#f4efe2'; x.textAlign = 'center'; x.textBaseline = 'middle';
    let fs = c.height * 0.3; x.font = `800 ${fs}px "Inter Display"`;
    while (x.measureText(o.text).width > c.width * 0.85) { fs -= 4; x.font = `800 ${fs}px "Inter Display"`; }
    x.fillText(o.text, c.width / 2, o.textY ? c.height * o.textY : c.height / 2);
  }
  if (o.draw) o.draw(x, c.width, c.height);
  const surf = decal(texFrom(c), w, h); surf.position.z = 0.03; g.add(surf);
  return g;
}

// Chalk doodle on transparent canvas (shoe, goat, check...)
export function chalkDoodle(kind, w = 0.5, h = 0.4) {
  const c = canvas(512, Math.round(512 * h / w)), x = c.getContext('2d');
  x.strokeStyle = '#f4efe2'; x.lineWidth = 14; x.lineCap = 'round'; x.lineJoin = 'round';
  const W = c.width, H = c.height;
  x.beginPath();
  if (kind === 'shoe') {
    x.moveTo(W * 0.3, H * 0.15); x.lineTo(W * 0.3, H * 0.6); x.lineTo(W * 0.15, H * 0.75); x.lineTo(W * 0.15, H * 0.85);
    x.lineTo(W * 0.85, H * 0.85); x.quadraticCurveTo(W * 0.88, H * 0.62, W * 0.6, H * 0.58); x.lineTo(W * 0.55, H * 0.15); x.closePath();
    x.moveTo(W * 0.15, H * 0.92); x.lineTo(W * 0.85, H * 0.92);
  } else if (kind === 'goat') {
    x.ellipse(W * 0.45, H * 0.5, W * 0.25, H * 0.17, 0, 0, 7);
    x.moveTo(W * 0.68, H * 0.42); x.lineTo(W * 0.8, H * 0.28); x.lineTo(W * 0.9, H * 0.33); x.lineTo(W * 0.78, H * 0.46);
    x.moveTo(W * 0.8, H * 0.28); x.lineTo(W * 0.76, H * 0.12); x.moveTo(W * 0.84, H * 0.29); x.lineTo(W * 0.86, H * 0.13);
    for (const lx of [0.3, 0.38, 0.52, 0.6]) { x.moveTo(W * lx, H * 0.63); x.lineTo(W * lx, H * 0.88); }
    x.moveTo(W * 0.2, H * 0.45); x.lineTo(W * 0.12, H * 0.36);
  } else if (kind === 'check') {
    x.moveTo(W * 0.2, H * 0.55); x.lineTo(W * 0.42, H * 0.78); x.lineTo(W * 0.82, H * 0.25);
  }
  x.stroke();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: texFrom(c), transparent: true, depthWrite: false}));
  return m;
}

export function signpost(labels, o = {}) {
  const g = new THREE.Group();
  g.add(cyl(0.07, 0.08, 2.7, '#7a5236'));
  labels.forEach((l, i) => {
    const s = sign(l.text, 1.25, 0.32, {bg: '#efd9a8'});
    const piv = new THREE.Group(); piv.position.y = 2.35 - i * 0.42; piv.rotation.y = l.angle;
    s.position.x = 0.62 * (l.dir || 1); piv.add(s);
    const tip = new THREE.Shape(); tip.moveTo(0, -0.16); tip.lineTo(0.2, 0); tip.lineTo(0, 0.16);
    const tg = new THREE.ExtrudeGeometry(tip, {depth: 0.06, bevelEnabled: false}); tg.translate(0, 0, -0.03);
    const tm = ink(tg, toon('#efd9a8'), {hull: 0.015}); tm.position.x = 1.24 * (l.dir || 1); if ((l.dir || 1) < 0) tm.rotation.y = Math.PI;
    piv.add(tm);
    g.add(piv);
  });
  return g;
}

export function banner(text, w = 2.6, h = 0.7, o = {}) {
  const g = new THREE.Group();
  const ph = o.poleH || 3.2;
  for (const s of [-1, 1]) { const p = cyl(0.09, 0.11, ph, '#7a5236'); at(p, s * (w / 2 + 0.12), 0, 0); g.add(p); const k = ball(0.13, '#c9a462'); at(k, s * (w / 2 + 0.12), ph + 0.05, 0); g.add(k); }
  const s = sign(text, w, h, {bg: o.bg || '#d9774a', fg: o.fg || '#fff3df', frame: o.frame || '#8a3f2a'});
  at(s, 0, ph - h / 2 - 0.15, 0); g.add(s);
  return g;
}

export function boat() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-1.6, 0.5); s.quadraticCurveTo(-1.5, -0.1, -0.9, -0.2); s.lineTo(1.0, -0.2); s.quadraticCurveTo(1.6, -0.1, 1.9, 0.6); s.lineTo(-1.6, 0.5);
  const geo = new THREE.ExtrudeGeometry(s, {depth: 1.0, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2});
  geo.translate(0, 0, -0.5);
  g.add(ink(geo, toon('#4f7fa6', {paint: {planks: 6, seed: 51}}), {hull: 0.03, edgeAngle: 50}));
  const rim = box(3.3, 0.1, 1.15, '#e9d6a8'); at(rim, 0.1, 0.48, 0); g.add(rim);
  const inside = box(3.0, 0.05, 0.9, '#7a5236'); at(inside, 0.1, 0.35, 0); g.add(inside);
  const mast = cyl(0.05, 0.06, 3.0, '#7a5236'); at(mast, 0.2, 0.4, 0); g.add(mast);
  const sail = box(0.25, 1.8, 0.25, '#f1e4c8'); at(sail, 0.2, 1.2, 0, 0, 0, 0); g.add(sail);
  const net = ball(0.3, '#8a9a7a', {sx: 1.4, sy: 0.5, sz: 1}); at(net, -0.8, 0.5, 0); g.add(net);
  return g;
}

export function waterTex() {
  const c = canvas(512, 512), x = c.getContext('2d');
  x.fillStyle = '#5f9fb8'; x.fillRect(0, 0, 512, 512);
  const r = rng(77);
  x.strokeStyle = 'rgba(240,248,250,0.45)'; x.lineWidth = 4; x.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const px = r() * 512, py = r() * 512, l = 20 + r() * 40; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + l / 2, py - 6, px + l, py); x.stroke(); }
  return texFrom(c, [8, 8]);
}

export function anvil() {
  const g = new THREE.Group();
  g.add(cyl(0.22, 0.28, 0.5, '#7a5236'));
  const b = box(0.3, 0.2, 0.22, '#5a5a62'); at(b, 0, 0.5, 0); g.add(b);
  const top = box(0.6, 0.12, 0.26, '#6a6a74'); at(top, 0.05, 0.7, 0); g.add(top);
  const horn = cone(0.1, 0.3, '#6a6a74'); at(horn, 0.35, 0.76, 0, 0, 0, -Math.PI / 2); g.add(horn);
  return g;
}

export function hammer() {
  const g = new THREE.Group();
  const h = cyl(0.02, 0.02, 0.36, '#8a5a3a', {hull: 0.008}); at(h, 0, -0.2, 0); g.add(h);
  const hd = box(0.18, 0.08, 0.08, '#5a5a62', {center: true}); at(hd, 0, -0.22, 0); g.add(hd);
  return g;
}

export function phone() {
  const g = new THREE.Group();
  g.add(box(0.09, 0.17, 0.015, '#2b2b33', {center: true, hull: 0.006}));
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.145), new THREE.MeshBasicMaterial({color: '#8fd0e0'}));
  sc.position.z = 0.009; g.add(sc);
  return g;
}

export function room(w, h, d, o = {}) {
  const g = new THREE.Group();
  const floor = box(w, 0.1, d, toon(o.floor || '#b08454', {paint: {planks: o.tiles ? 0 : 12, seed: 61, ...(o.floorPaint || {})}}), {edges: false});
  at(floor, 0, -0.1, -d / 2 + 1); g.add(floor);
  const wallMat = toon(o.wall || '#e7d2b0', {paint: {bricks: !!o.bricks, seed: 62, stains: 16}});
  const back = box(w, h, 0.2, wallMat); at(back, 0, 0, -d + 1); back.traverse((m) => { m.castShadow = false; }); g.add(back);
  for (const s of [-1, 1]) {
    const side = box(0.2, h, d, wallMat); at(side, s * w / 2, 0, -d / 2 + 1); side.traverse((m) => { m.castShadow = false; }); g.add(side);
  }
  const wain = box(w - 0.2, 0.9, 0.06, o.wain || '#9a6a4a'); at(wain, 0, 0, -d + 1.12); g.add(wain);
  const ceil = box(w, 0.15, d, '#6a4a3a'); at(ceil, 0, h, -d / 2 + 1); ceil.traverse((m) => { m.castShadow = false; }); g.add(ceil);
  for (let i = 0; i < 4; i++) { const b = box(w, 0.18, 0.2, '#5a3a2a'); at(b, 0, h - 0.18, -d + 1.5 + i * d / 4); b.traverse((m) => { m.castShadow = false; }); g.add(b); }
  return g;
}

export function boot(color = '#6b3f2a') {
  const g = new THREE.Group();
  const leg = box(0.1, 0.22, 0.12, color); at(leg, -0.04, 0.06, 0); g.add(leg);
  const foot = box(0.22, 0.08, 0.12, color); at(foot, 0.02, 0, 0); g.add(foot);
  const sole = box(0.24, 0.025, 0.13, '#2b2326'); at(sole, 0.02, -0.02, 0); g.add(sole);
  return g;
}

export function hills(color = '#8fb36a') {
  const g = new THREE.Group(); const r = rng(9);
  for (let i = 0; i < 6; i++) { const h = ball(8 + r() * 6, color, {sx: 1.6, sy: 0.5, sz: 1, seg: 14, hull: 0.08}); at(h, -40 + i * 16, -1.5, -38 - r() * 8); g.add(h); }
  return g;
}

export function jiaoziTex() {
  const c = canvas(400, 720), x = c.getContext('2d');
  x.fillStyle = '#e8d9b4'; x.fillRect(0, 0, 400, 720);
  x.strokeStyle = '#3a2f4a'; x.lineWidth = 10; x.strokeRect(20, 20, 360, 680);
  x.lineWidth = 3; x.strokeRect(40, 40, 320, 640);
  for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(60 + (i % 9) * 35, i < 9 ? 70 : 650, 10, 0, 7); x.stroke(); }
  x.fillStyle = '#3a2f4a'; x.font = '700 96px "IPAGothic"'; x.textAlign = 'center';
  x.fillText('交子', 200, 220);
  for (let i = 0; i < 9; i++) { x.fillRect(80, 290 + i * 26, 240 * (0.5 + ((i * 37) % 50) / 100), 8); }
  x.fillStyle = 'rgba(200,50,40,0.85)'; x.fillRect(140, 540, 120, 90);
  x.fillStyle = '#e8d9b4'; x.fillRect(160, 560, 80, 50);
  return texFrom(c);
}

export function skyDome() {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {top: {value: new THREE.Color('#9fc8e8')}, bottom: {value: new THREE.Color('#f3e7d3')}},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = smoothstep(-0.05, 0.6, vP.y); gl_FragColor = vec4(mix(bottom, top, h), 1.0);\n#include <colorspace_fragment>\n}',
  });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = -10; m.frustumCulled = false;
  return m;
}

// Glowing moon disc (place far away, e.g. [x, 40, -120]); a halo sprite makes it read through fog.
export function moon(r = 6) {
  const g = new THREE.Group();
  const c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,250,225,0.9)'); gr.addColorStop(0.35, 'rgba(255,245,210,0.35)'); gr.addColorStop(1, 'rgba(255,245,210,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: texFrom(c), transparent: true, depthWrite: false, fog: false}));
  halo.scale.setScalar(r * 5); g.add(halo);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({color: '#fff6dc', fog: false}));
  g.add(disc);
  g.userData.faceCamera = true;
  return g;
}
