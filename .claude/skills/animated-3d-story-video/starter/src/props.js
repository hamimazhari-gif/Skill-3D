// Shared procedural props: facade/house, stall, sack, crate, barrel, tree, goat, chicken, fish, coin, etc.
import * as THREE from 'three';
import {INK, toon, ink, box, cyl, ball, cone, at, sign, signTex, paintTex, canvas, texFrom, rng, shade, decal, gradientMap} from './kit';

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
    if (o.bars !== false) { const bar = box(0.04, wh, 0.04, trim); at(bar, wx, wy, -depth / 2); g.add(bar); }
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

// ================= Banana story props =================
// Curved, five-sided, tapered banana (centred on its bounding box). len = tip-to-tip chord length.
const _bgeo = new Map();
export function bananaGeo(len = 0.22) {
  if (_bgeo.has(len)) return _bgeo.get(len);
  const R = len * 0.95, A = 0.6;
  const curve = new THREE.CatmullRomCurve3(Array.from({length: 9}, (_, i) => { const a = -A + 2 * A * i / 8; return new THREE.Vector3(R * Math.sin(a), R * (1 - Math.cos(a)), 0); }));
  const TS = 24, RS = 5;
  const geo = new THREE.TubeGeometry(curve, TS, len * 0.13, RS, false);
  const p = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) {
    const u = i / TS; curve.getPointAt(u, c);
    const k = 0.22 + 0.78 * Math.pow(Math.sin(Math.PI * u), 0.55);
    for (let j = 0; j <= RS; j++) { const ix = i * (RS + 1) + j; v.fromBufferAttribute(p, ix).sub(c).multiplyScalar(k).add(c); p.setXYZ(ix, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals(); geo.center();
  _bgeo.set(len, geo);
  return geo;
}

export function banana(o = {}) {
  const len = o.len || 0.22;
  const g = new THREE.Group();
  g.add(ink(bananaGeo(len), toon(o.color || '#f2cf3e', {paint: {seed: 7, stains: 4, chips: 2, scratches: 0}}), {hull: 0.008, edges: false, cast: o.cast !== false}));
  const R = len * 0.95, A = 0.6, yOff = R * (1 - Math.cos(A)) / 2;
  const stem = cyl(len * 0.03, len * 0.04, len * 0.14, '#8a7a3a', {hull: 0.005, center: true}); at(stem, -R * Math.sin(A) - len * 0.03, yOff + len * 0.05, 0, 0, 0, 0.9); g.add(stem);
  const tip = ball(len * 0.03, '#4a3a2a', {hull: 0.004}); at(tip, R * Math.sin(A) + len * 0.005, yOff + len * 0.01, 0); g.add(tip);
  return g;
}

export function bunch(n = 5, o = {}) {
  const g = new THREE.Group(); const len = o.len || 0.22;
  const crown = cyl(0.03 * len / 0.22, 0.035 * len / 0.22, 0.08 * len / 0.22, '#7d8a4a', {hull: 0.005}); g.add(crown);
  for (let i = 0; i < n; i++) {
    const piv = new THREE.Group(); piv.rotation.y = (i - (n - 1) / 2) * 0.32; g.add(piv);
    const b = banana({len, cast: o.cast}); at(b, len * 0.5, 0.02 + (i % 2) * 0.012, 0, 0, 0, -0.15); piv.add(b);
  }
  return g;
}

// Instanced bananas (piles, avalanches, mountains): set(i, [x,y,z], [rx,ry,rz], scale) then done().
export function bananaInstances(n, o = {}) {
  const geo = bananaGeo(o.len || 0.22);
  const m = new THREE.InstancedMesh(geo, toon(o.color || '#f2cf3e', {paint: {seed: 7, stains: 4, chips: 2, scratches: 0}}), n);
  const hull = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide}), n);
  m.castShadow = !!o.cast; m.receiveShadow = true; m.frustumCulled = false; hull.frustumCulled = false;
  const g = new THREE.Group(); g.add(m, hull);
  const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const hk = 1 + (o.hull ?? 0.09);
  return {obj: g,
    set(i, p, r, sc) { e.set(r[0], r[1], r[2]); q.setFromEuler(e); v.set(p[0], p[1], p[2]); s.setScalar(Math.max(1e-4, sc)); M4.compose(v, q, s); m.setMatrixAt(i, M4); s.setScalar(Math.max(1e-4, sc * hk)); M4.compose(v, q, s); hull.setMatrixAt(i, M4); },
    done() { m.instanceMatrix.needsUpdate = true; hull.instanceMatrix.needsUpdate = true; }};
}

export function bananaTree(o = {}) {
  const r = rng(o.seed || 3); const g = new THREE.Group(); const h = o.h || 2.6;
  g.add(cyl(0.1, 0.17, h, toon('#8a9a52', {paint: {stripes: {n: 9, color: '#76864a'}, seed: 13}})));
  const n = o.leaves || 8;
  for (let i = 0; i < n; i++) {
    const piv = new THREE.Group(); piv.position.y = h - 0.05; piv.rotation.y = i / n * Math.PI * 2 + r() * 0.4; g.add(piv);
    const tilt = new THREE.Group(); tilt.rotation.z = 0.15 + r() * 0.55 - (i % 3 === 0 ? 0.6 : 0); piv.add(tilt);
    const leaf = ball(0.5, i % 2 ? '#6fae4a' : '#5f9e42', {sx: 2.5, sy: 0.07, sz: 0.62, seg: 12, hull: 0.014}); at(leaf, 1.1, 0, 0, 0, 0, -0.18); tilt.add(leaf);
    const rib = box(2.4, 0.03, 0.03, '#a8c46a', {center: true, edges: false, hull: 0}); at(rib, 1.1, 0.04, 0, 0, 0, -0.18); tilt.add(rib);
  }
  if (o.bunch !== false) {
    const stalk = cyl(0.025, 0.025, 0.5, '#7d8a4a', {hull: 0.006}); at(stalk, 0.22, h - 0.55, 0.12); g.add(stalk);
    for (let k = 0; k < 3; k++) { const b = bunch(6, {len: 0.2}); at(b, 0.22, h - 0.25 - k * 0.14, 0.12, k * 1.1); g.add(b); }
    const fl = cone(0.07, 0.2, '#7a2a4a', {hull: 0.008}); at(fl, 0.22, h - 0.78, 0.12, 0, Math.PI); g.add(fl);
  }
  return g;
}

// Yellow radiation warning sign (trefoil + label), standing on a post or hung on a wall.
export function radSign(text, w = 0.9, h = 1.15) {
  const c = canvas(512, Math.round(512 * h / w)), x = c.getContext('2d'); const W = c.width, H = c.height;
  x.fillStyle = '#f2c73a'; x.fillRect(0, 0, W, H);
  x.strokeStyle = INK; x.lineWidth = 22; x.strokeRect(16, 16, W - 32, H - 32);
  const cx = W / 2, cy = H * 0.4, R = W * 0.33;
  x.fillStyle = INK;
  for (const a0 of [-Math.PI / 2 - Math.PI / 6 - Math.PI / 3, -Math.PI / 2 + Math.PI / 6, Math.PI / 2 - Math.PI / 6]) {
    x.beginPath(); x.moveTo(cx + Math.cos(a0) * R * 0.28, cy + Math.sin(a0) * R * 0.28); x.arc(cx, cy, R, a0, a0 + Math.PI / 3); x.arc(cx, cy, R * 0.28, a0 + Math.PI / 3, a0, true); x.fill();
  }
  x.beginPath(); x.arc(cx, cy, R * 0.18, 0, 7); x.fill();
  let fs = H * 0.13; x.font = `900 ${fs}px "Inter Display"`; while (x.measureText(text).width > W * 0.84) { fs -= 3; x.font = `900 ${fs}px "Inter Display"`; }
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cx, H * 0.83);
  const geo = new THREE.BoxGeometry(w, h, 0.05);
  const side = toon('#c99a2a');
  const m = new THREE.Mesh(geo, [side, side, side, side, toon(texFrom(c)), side]); m.castShadow = true;
  const g = new THREE.Group(); g.add(m);
  const hull = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide})); hull.scale.set(1 + 0.04 / w, 1 + 0.04 / h, 1.4); g.add(hull);
  return g;
}

// Geiger counter on a table: body + dial + needle (returns {group, needle}); needle.rotation.z = -1.1 .. 1.1.
export function geiger() {
  const g = new THREE.Group();
  g.add(box(0.38, 0.22, 0.24, toon('#e0b84f', {paint: {seed: 44, stains: 8, chips: 10}})));
  for (const s of [-1, 1]) { const p = box(0.03, 0.08, 0.03, '#3a3a40'); at(p, s * 0.11, 0.22, 0); g.add(p); }
  const hd = box(0.28, 0.04, 0.05, '#3a3a40'); at(hd, 0, 0.29, 0); g.add(hd);
  const c = canvas(512, 300), x = c.getContext('2d');
  x.fillStyle = '#f4ecd6'; x.fillRect(0, 0, 512, 300);
  const cx = 256, cy = 270, R = 210;
  const segs = [['#6abf5a', 0, 0.45], ['#e8c33a', 0.45, 0.75], ['#d8513a', 0.75, 1]];
  for (const [col, a, b] of segs) { x.strokeStyle = col; x.lineWidth = 34; x.beginPath(); x.arc(cx, cy, R - 20, Math.PI + 0.45 + a * (Math.PI - 0.9), Math.PI + 0.45 + b * (Math.PI - 0.9)); x.stroke(); }
  x.strokeStyle = INK; x.lineWidth = 6;
  for (let i = 0; i <= 10; i++) { const a = Math.PI + 0.45 + i / 10 * (Math.PI - 0.9); x.beginPath(); x.moveTo(cx + Math.cos(a) * (R - 45), cy + Math.sin(a) * (R - 45)); x.lineTo(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2)); x.stroke(); }
  x.fillStyle = INK; x.font = '800 44px "Inter Display"'; x.textAlign = 'center'; x.fillText('µSv/h', cx, 200);
  x.lineWidth = 12; x.strokeRect(6, 6, 500, 288);
  const dial = decal(texFrom(c), 0.3, 0.176); dial.position.set(0, 0.112, 0.122); g.add(dial);
  const needle = new THREE.Group(); needle.position.set(0, 0.04, 0.126); g.add(needle);
  const nd = new THREE.Mesh(new THREE.PlaneGeometry(0.008, 0.115), new THREE.MeshBasicMaterial({color: INK})); nd.position.y = 0.0575; needle.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.012, 16), new THREE.MeshBasicMaterial({color: INK})); hub.position.z = 0.001; needle.add(hub);
  const probe = cyl(0.03, 0.03, 0.24, '#4a4a52', {center: true, hull: 0.006}); at(probe, 0.3, 0.05, 0.06, 0.3, 0, Math.PI / 2); g.add(probe);
  const cable = cyl(0.008, 0.008, 0.16, INK, {center: true, hull: 0}); at(cable, 0.2, 0.06, 0.04, 0, 0, Math.PI / 2); g.add(cable);
  return {group: g, needle};
}

// Atom: glowing nucleus + three ink orbits with electrons. update(t) spins electrons.
export function atom(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 8); const R = o.r || 0.3;
  const nuc = new THREE.Group(); g.add(nuc);
  for (let i = 0; i < 11; i++) {
    const col = i % 2 ? '#7ad66a' : '#c9cbd6';
    const b = ball(R * 0.15, toon(col, {wear: false, emissive: i % 2 ? '#5fd04a' : undefined, emissiveIntensity: 0.5}), {hull: 0.006});
    const a = r() * 6.28, e = r() * 3.14; at(b, Math.cos(a) * Math.sin(e) * R * 0.17, Math.cos(e) * R * 0.17, Math.sin(a) * Math.sin(e) * R * 0.17); nuc.add(b);
  }
  const els = [];
  for (let k = 0; k < 3; k++) {
    const piv = new THREE.Group(); piv.rotation.set(k === 0 ? Math.PI / 2 : 1.2, k * 1.05, k === 2 ? 0.9 : 0.2); g.add(piv);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, R * 0.025, 6, 72), new THREE.MeshBasicMaterial({color: INK})); piv.add(ring);
    const el = ball(R * 0.09, toon('#4f9fe0', {wear: false}), {hull: 0.005}); piv.add(el); els.push({el, ph: k * 2.1, w: 2.6 + k * 0.7});
  }
  return {group: g, update(t) { for (const q of els) q.el.position.set(Math.cos(t * q.w + q.ph) * R, Math.sin(t * q.w + q.ph) * R, 0); nuc.rotation.y = t * 0.6; }};
}

export function magnifier() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 10, 40), toon('#3a3a40', {wear: false})); g.add(ring);
  const ringH = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.032, 10, 40), new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide})); g.add(ringH);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.16, 40), new THREE.MeshBasicMaterial({color: '#cfeef6', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide})); g.add(glass);
  const hd = cyl(0.025, 0.025, 0.26, '#8a5a3a', {center: true, hull: 0.008}); at(hd, 0.2, -0.2, 0, 0, 0, 0.78); g.add(hd);
  return g;
}

// Floating "K" potassium token (sprite) for showing potassium leaving the body.
export function kToken(label = 'K') {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = '#9a6fb0'; x.beginPath(); x.arc(128, 128, 112, 0, 7); x.fill();
  x.strokeStyle = INK; x.lineWidth = 16; x.stroke();
  x.fillStyle = '#fff3df'; x.font = '900 120px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 128, 136);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: texFrom(c), transparent: true, depthWrite: false}));
  return s;
}

export function heart(color = '#d8413a') {
  const s = new THREE.Shape();
  s.moveTo(0, -0.25); s.bezierCurveTo(-0.05, -0.18, -0.3, -0.05, -0.3, 0.1); s.bezierCurveTo(-0.3, 0.25, -0.12, 0.32, 0, 0.18);
  s.bezierCurveTo(0.12, 0.32, 0.3, 0.25, 0.3, 0.1); s.bezierCurveTo(0.3, -0.05, 0.05, -0.18, 0, -0.25);
  const geo = new THREE.ExtrudeGeometry(s, {depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3}); geo.translate(0, 0, -0.05);
  return ink(geo, toon(color, {wear: false}), {hull: 0.015, edges: false});
}

export function plane() {
  const g = new THREE.Group();
  const fus = new THREE.CapsuleGeometry(0.85, 7.5, 8, 24); fus.rotateZ(Math.PI / 2); fus.translate(0, 1.6, 0);
  g.add(ink(fus, toon('#f4f1ea', {paint: {seed: 5, stains: 6, chips: 4}}), {hull: 0.03, edges: false}));
  const band = new THREE.CylinderGeometry(0.862, 0.862, 7.4, 28, 1, true, Math.PI * 0.1, Math.PI * 0.8); band.rotateZ(Math.PI / 2); band.translate(0, 1.6, 0);
  const bm = new THREE.Mesh(band, toon('#4f7fa6', {wear: false})); bm.scale.set(1, 1, 1); bm.position.y = -0.05; g.add(bm);
  for (let i = 0; i < 13; i++) { const w = ball(0.075, '#2f4f6a', {sy: 1.35, sz: 0.4, hull: 0.008}); at(w, -3.0 + i * 0.5, 1.82, 0.8); g.add(w); }
  for (const s of [-1, 1]) { const cw = box(0.3, 0.16, 0.25, '#2f4f6a', {center: true, hull: 0.01}); at(cw, 4.15, 1.95, s * 0.38, 0, 0, 0.35); g.add(cw); }
  const door = box(0.55, 1.1, 0.05, '#dfe4e8', {center: true}); at(door, 3.0, 1.55, 0.82); g.add(door);
  const wing = box(2.2, 0.12, 9.2, toon('#d8dde2', {paint: {seed: 6}})); at(wing, 0.2, 1.05, 0, 0, 0, 0); g.add(wing);
  for (const s of [-1, 1]) {
    const eng = cyl(0.32, 0.28, 1.2, '#b8c0c8', {center: true}); at(eng, 0.8, 0.72, s * 2.3, 0, 0, Math.PI / 2); g.add(eng);
    const intake = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), new THREE.MeshBasicMaterial({color: '#2b2b33'})); intake.position.set(1.41, 0.72, s * 2.3); intake.rotation.y = Math.PI / 2; g.add(intake);
  }
  const fin = box(1.4, 1.7, 0.12, '#4f7fa6'); at(fin, -4.0, 2.2, 0, 0, 0, 0.35); g.add(fin);
  const stab = box(1.1, 0.08, 3.4, '#d8dde2'); at(stab, -4.1, 1.95, 0); g.add(stab);
  for (const [x, z] of [[3.2, 0], [0.4, 0.6], [0.4, -0.6]]) { const st = cyl(0.05, 0.05, 0.6, '#5a5a62'); at(st, x, 0.2, z); g.add(st); const wh = cyl(0.2, 0.2, 0.14, '#2b2b33', {center: true}); at(wh, x, 0.2, z, 0, Math.PI / 2); g.add(wh); }
  return g;
}

export function suitcase(color = '#c75b5b') {
  const g = new THREE.Group();
  g.add(box(0.42, 0.55, 0.2, toon(color, {paint: {seed: 9}})));
  const hd = box(0.16, 0.06, 0.04, '#3a3a40'); at(hd, 0, 0.55, 0); g.add(hd);
  for (const s of [-1, 1]) { const w = cyl(0.04, 0.04, 0.04, '#2b2b33', {center: true}); at(w, s * 0.15, 0.02, 0.1, 0, Math.PI / 2); g.add(w); }
  return g;
}

export function ctScanner(label = 'CT') {
  const g = new THREE.Group();
  const base = box(2.2, 0.4, 1.0, toon('#cdd6da', {paint: {seed: 3}})); at(base, 0, 0, 0); g.add(base);
  const tg = new THREE.TorusGeometry(0.85, 0.4, 18, 48); tg.scale(1, 1, 1.25); tg.translate(0, 1.35, 0);
  g.add(ink(tg, toon('#eef3f5', {paint: {seed: 4, stains: 4}}), {hull: 0.03, edges: false}));
  const acc = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.045, 8, 48), toon('#4f9fb0', {wear: false})); acc.position.set(0, 1.35, 0.5); g.add(acc);
  const lb = sign(label, 0.5, 0.18, {bg: '#eef3f5', border: false}); at(lb, 0, 2.38, 0.42, 0, -0.25); g.add(lb);
  const ped = box(0.5, 0.7, 0.7, '#cdd6da'); at(ped, 0, 0, 1.7); g.add(ped);
  const bed = box(0.56, 0.1, 2.8, toon('#f6f8f8', {paint: {seed: 5}})); at(bed, 0, 0.8, 0.95); g.add(bed);
  const pil = ball(0.16, '#dfeaf0', {sx: 1.4, sy: 0.4, sz: 0.8}); at(pil, 0, 0.93, 2.1); g.add(pil);
  return g;
}

export function flask(color = '#7ad66a', h = 0.3) {
  const g = new THREE.Group();
  const geo = new THREE.LatheGeometry([[0.001, 0], [0.11, 0.0], [0.12, 0.05], [0.12, 0.12], [0.05, 0.2], [0.04, h], [0.05, h + 0.02]].map(([a, b]) => new THREE.Vector2(a, b)), 20);
  g.add(ink(geo, new THREE.MeshToonMaterial({color: '#dff2f6', transparent: true, opacity: 0.45, gradientMap: gradientMap()}), {hull: 0.008, edges: false}));
  const liq = cyl(0.105, 0.115, 0.1, toon(color, {wear: false, emissive: color, emissiveIntensity: 0.25}), {hull: 0}); at(liq, 0, 0.005, 0); g.add(liq);
  return g;
}

// ---------- "7 hari tanpa tidur" props ----------
// Bed (foot toward +z). The sleeper stands inside it at local (0, -0.35, -0.55) so the blanket hides the legs.
export function bed(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#8a5a3a', sheet = o.sheet || '#7fa6c9';
  const frame = box(1.3, 0.38, 2.1, toon(c, {paint: {planks: 3, seed: 81}})); at(frame, 0, 0, 0); g.add(frame);
  const mat = box(1.2, 0.16, 2.0, '#f3ece0'); at(mat, 0, 0.38, 0); g.add(mat);
  const head = box(1.4, 1.15, 0.1, toon(c, {paint: {planks: 4, seed: 82}})); at(head, 0, 0, -1.05); g.add(head);
  const foot = box(1.4, 0.6, 0.08, toon(c, {paint: {planks: 3, seed: 83}})); at(foot, 0, 0, 1.05); g.add(foot);
  const pil = ball(0.28, '#f6f1e6', {sx: 1.6, sy: 0.45, sz: 0.8}); at(pil, 0, 0.62, -0.82); g.add(pil);
  const blanket = box(1.26, 0.3, 1.45, toon(sheet, {paint: {seed: 84, stains: 4}})); at(blanket, 0, 0.5, 0.25); g.add(blanket);
  const fold = box(1.28, 0.08, 0.3, '#f3ece0'); at(fold, 0, 0.78, -0.4); g.add(fold);
  return g;
}

// Wall clock with moving hands: returns {group, set(hours, minutes)}.
export function wallClock(r = 0.32, o = {}) {
  const g = new THREE.Group();
  const rim = cyl(r, r, 0.08, o.rim || '#c75b5b', {center: true, hull: 0.012}); rim.rotation.x = Math.PI / 2; g.add(rim);
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = '#fbf6ea'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill();
  x.fillStyle = INK; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.save(); x.translate(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); x.rotate(a); x.fillRect(-5, -14, 10, i % 3 ? 16 : 28); x.restore(); }
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.9, 32), new THREE.MeshBasicMaterial({map: texFrom(c)})); face.position.z = 0.045; g.add(face);
  const mk = (len, w) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshBasicMaterial({color: INK})); m.position.y = len / 2 - 0.02; p.add(m); p.position.z = 0.05; g.add(p); return p; };
  const hh = mk(r * 0.5, 0.035), mh = mk(r * 0.78, 0.022);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), new THREE.MeshBasicMaterial({color: INK})); dot.position.z = 0.055; g.add(dot);
  return {group: g, set(h, m) { mh.rotation.z = -m / 60 * Math.PI * 2; hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; }};
}

export function desk(o = {}) {
  const g = new THREE.Group();
  const top = box(1.8, 0.06, 0.85, toon(o.color || '#c9a27a', {paint: {planks: 4, seed: 85}})); at(top, 0, 0.74, 0); g.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = box(0.06, 0.74, 0.06, '#5a4a42'); at(l, sx * 0.84, 0, sz * 0.36); g.add(l); }
  const dr = box(0.5, 0.45, 0.75, toon('#b08454', {paint: {seed: 86}})); at(dr, 0.6, 0.29, 0); g.add(dr);
  return g;
}

export function monitor(screen = '#8fd0e0') {
  const g = new THREE.Group();
  const st = box(0.06, 0.25, 0.06, '#3a3a40'); g.add(st);
  const ft = box(0.28, 0.02, 0.18, '#3a3a40'); g.add(ft);
  const sc = box(0.62, 0.4, 0.04, '#2b2b33'); at(sc, 0, 0.22, 0); g.add(sc);
  const c = canvas(256, 160), x = c.getContext('2d');
  x.fillStyle = screen; x.fillRect(0, 0, 256, 160); x.fillStyle = 'rgba(53,31,34,0.35)';
  for (let i = 0; i < 6; i++) x.fillRect(20, 20 + i * 22, 80 + ((i * 53) % 130), 9);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.34), new THREE.MeshBasicMaterial({map: texFrom(c)})); s.position.set(0, 0.42, 0.022); g.add(s);
  return g;
}

export function mug(color = '#f3e7d3') {
  const g = new THREE.Group();
  g.add(cyl(0.055, 0.05, 0.12, color, {hull: 0.008}));
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12), toon(color)); h.position.set(0.06, 0.06, 0); g.add(h);
  return g;
}

// Small open-top car facing +z. The driver stands at local (0.28, -0.25, -0.15).
export function car(color = '#c75b5b') {
  const g = new THREE.Group();
  const body = box(1.7, 0.55, 3.6, toon(color, {paint: {seed: 87, stains: 6, chips: 6}})); at(body, 0, 0.28, 0); g.add(body);
  const hood = box(1.66, 0.14, 1.2, toon(color, {paint: {seed: 88}})); at(hood, 0, 0.83, 1.15); g.add(hood);
  const trunk = box(1.66, 0.14, 0.9, toon(color, {paint: {seed: 89}})); at(trunk, 0, 0.83, -1.35); g.add(trunk);
  for (const s of [-1, 1]) { const side = box(0.1, 0.2, 1.4, toon(color)); at(side, s * 0.8, 0.83, -0.2); g.add(side); }
  const seat = box(1.4, 0.55, 0.25, '#5a3a2a'); at(seat, 0, 0.6, -0.75); g.add(seat);
  const ws = box(1.6, 0.4, 0.04, new THREE.MeshBasicMaterial({color: '#cfe8f6', transparent: true, opacity: 0.22, depthWrite: false}), {hull: 0, edges: true}); at(ws, 0, 0.97, 0.5, 0, -0.35); g.add(ws);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20), toon('#2b2b33')); wheel.position.set(0.28, 0.98, 0.42); wheel.rotation.x = -1.0; g.add(wheel);
  const wheels = [];
  for (const sx of [-1, 1]) for (const sz of [-1.15, 1.15]) {
    const w = cyl(0.34, 0.34, 0.26, '#2b2b33', {center: true, seg: 20}); at(w, sx * 0.83, 0.34, sz, 0, 0, Math.PI / 2); g.add(w); wheels.push(w);
    const hub = cyl(0.14, 0.14, 0.28, '#c9ccd0', {center: true}); at(hub, sx * 0.83, 0.34, sz, 0, 0, Math.PI / 2); g.add(hub);
  }
  for (const s of [-1, 1]) {
    const hl = ball(0.12, new THREE.MeshBasicMaterial({color: '#fff3b0'}), {hull: 0.015}); at(hl, s * 0.6, 0.66, 1.8); g.add(hl);
    const tl = box(0.25, 0.1, 0.04, new THREE.MeshBasicMaterial({color: '#ff5a4a'})); at(tl, s * 0.6, 0.6, -1.8); g.add(tl);
  }
  // soft headlight beams
  const beamMat = new THREE.MeshBasicMaterial({color: '#fff1b0', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide});
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.9, 6, 20, 1, true), beamMat); b.rotation.x = -Math.PI / 2; b.position.set(s * 0.6, 0.55, 4.8); g.add(b); }
  g.userData.wheels = wheels;
  return g;
}

export function streetLamp() {
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.08, 3.6, '#4a5058'));
  const arm = box(0.9, 0.06, 0.06, '#4a5058'); at(arm, -0.42, 3.55, 0); g.add(arm);
  const hd = box(0.4, 0.1, 0.22, '#4a5058'); at(hd, -0.82, 3.45, 0); g.add(hd);
  const bulb = ball(0.12, new THREE.MeshBasicMaterial({color: '#ffd98a'}), {sy: 0.5, hull: 0}); at(bulb, -0.82, 3.42, 0); g.add(bulb);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), new THREE.MeshBasicMaterial({color: '#ffcf7a', transparent: true, opacity: 0.16, depthWrite: false}));
  pool.rotation.x = -Math.PI / 2; pool.position.set(-0.82, 0.03, 0); g.add(pool);
  return g;
}

export function sofa(color = '#6a7fb0') {
  const g = new THREE.Group();
  const base = box(2.2, 0.42, 0.9, toon(color, {paint: {seed: 90, stains: 8}})); g.add(base);
  const back = box(2.2, 0.55, 0.22, toon(color, {paint: {seed: 91}})); at(back, 0, 0.42, -0.34); g.add(back);
  for (const s of [-1, 1]) { const arm = box(0.22, 0.32, 0.9, toon(shade(color, -0.08))); at(arm, s * 1.0, 0.42, 0); g.add(arm); }
  for (const s of [-0.5, 0.5]) { const cu = box(0.9, 0.12, 0.66, shade(color, 0.08)); at(cu, s, 0.42, 0.08); g.add(cu); }
  return g;
}

// TV with a flickering screen: returns {group, update(t, on)}.
export function tv() {
  const g = new THREE.Group();
  const stand = box(1.4, 0.5, 0.45, toon('#7a5236', {paint: {planks: 3, seed: 92}})); g.add(stand);
  const set = box(1.1, 0.68, 0.12, '#2b2b33'); at(set, 0, 0.58, 0); g.add(set);
  const c = canvas(128, 96), x = c.getContext('2d'); const tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.58), new THREE.MeshBasicMaterial({map: tex})); scr.position.set(0, 0.92, 0.065); g.add(scr);
  let last = -1;
  return {group: g, update(t) {
    const f = Math.floor(t * 12); if (f === last) return; last = f; const r = rng(f + 1);
    for (let i = 0; i < 96; i += 4) for (let j = 0; j < 128; j += 4) { const v = 120 + Math.floor(r() * 120); x.fillStyle = `rgb(${v - 20},${v},${v + 30})`; x.fillRect(j, i, 4, 4); }
    tex.needsUpdate = true;
  }};
}

export function goalPost() {
  const g = new THREE.Group(); const y = '#f2d24a';
  g.add(cyl(0.12, 0.14, 3.0, y));
  const cross = cyl(0.08, 0.08, 5.6, y, {center: true}); at(cross, 0, 3.0, 0, 0, 0, Math.PI / 2); g.add(cross);
  for (const s of [-1, 1]) { const up = cyl(0.07, 0.07, 4.2, y); at(up, s * 2.8, 3.0, 0); g.add(up); }
  return g;
}

export function footballBall() {
  const g = new THREE.Group();
  g.add(ball(0.11, '#8a4a2a', {sx: 1, sy: 1, sz: 1.65, hull: 0.012}));
  const lace = box(0.012, 0.012, 0.12, '#f6f1e6', {center: true, hull: 0}); at(lace, 0, 0.11, 0); g.add(lace);
  return g;
}

export function bleachers(w = 10, rows = 4) {
  const g = new THREE.Group();
  for (let i = 0; i < rows; i++) { const s = box(w, 0.45, 0.8, toon(i % 2 ? '#8a9aa8' : '#9aaab8', {paint: {seed: 93 + i}})); at(s, 0, 0, -i * 0.8); s.scale.y = 1 + i; g.add(s); }
  return g;
}

// Floating "Z" letters / big glyphs as camera-facing sprites.
export function glyph(text, size = 0.3, color = '#fff3df') {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.font = '900 200px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 28; x.strokeStyle = INK; x.lineJoin = 'round'; x.strokeText(text, 128, 138); x.fillStyle = color; x.fillText(text, 128, 138);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: texFrom(c), transparent: true, depthWrite: false}));
  s.scale.set(size, size, 1);
  return s;
}

// ================= Earth-stops-spinning story props =================
// Painted Earth globe. Returns {group, spin (rotating part), setStop(u)}: u 0 = today's Earth, 1 = stopped Earth
// (oceans pooled at both poles, one giant continent around the equator). Equirectangular canvas texture.
export function globe(R = 3, o = {}) {
  const g = new THREE.Group();
  const W = 1024, H = 512;
  const c = canvas(W, H), x = c.getContext('2d'); const tex = texFrom(c);
  const r0 = rng(o.seed || 41);
  // continent blobs (lon, lat, size) roughly Earth-like
  const land = [[-100, 45, 70], [-60, -15, 55], [15, 50, 55], [20, 5, 60], [90, 45, 80], [130, -25, 40], [-40, 72, 28]];
  const blobs = [];
  for (const [lo, la, s] of land) for (let i = 0; i < 9; i++) blobs.push([lo + (r0() - 0.5) * s, la + (r0() - 0.5) * s * 0.55, s * (0.18 + r0() * 0.22)]);
  const P = (lo, la) => [(lo + 180) / 360 * W, (90 - la) / 180 * H];
  let last = -1;
  function draw(u) {
    const q = Math.round(u * 24) / 24; if (q === last) return; last = q;
    x.fillStyle = '#4f8fc8'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(240,248,255,0.25)'; x.lineWidth = 3;
    for (let i = 0; i < 70; i++) { const px = (i * 137) % W, py = (i * 71) % H; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 14, py - 5, px + 28, py); x.stroke(); }
    x.globalAlpha = 1 - q;
    for (const [lo, la, s] of blobs) {
      const [px, py] = P(lo, la); x.fillStyle = Math.abs(la) > 30 && lo > 60 ? '#a8b86a' : (la < 25 && la > -25 && lo > -20 && lo < 60 ? '#d8b878' : '#7fae5a');
      x.beginPath(); x.ellipse(px, py, s / 360 * W, s / 180 * H * 0.8, 0, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    // polar ice
    x.fillStyle = '#f4f8fb'; x.fillRect(0, 0, W, H * 0.045); x.fillRect(0, H * 0.955, W, H * 0.045);
    if (q > 0) {
      // stopped Earth: land band around the equator with wobbly coasts, oceans at the poles
      const band = q * 0.2 * H;
      x.fillStyle = '#c9a86a'; x.beginPath(); x.moveTo(0, H / 2 - band);
      for (let i = 0; i <= 64; i++) x.lineTo(i / 64 * W, H / 2 - band + Math.sin(i * 1.7) * 10 * q);
      for (let i = 64; i >= 0; i--) x.lineTo(i / 64 * W, H / 2 + band + Math.sin(i * 2.3) * 10 * q);
      x.fill();
      x.fillStyle = '#7fae5a'; x.globalAlpha = q;
      for (let i = 0; i < 26; i++) { x.beginPath(); x.ellipse((i * 97) % W, H / 2 + Math.sin(i * 1.9) * band * 0.6, 40, 16, 0, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    }
    tex.needsUpdate = true;
  }
  draw(0);
  const spin = new THREE.Group(); g.add(spin);
  const body = ink(new THREE.SphereGeometry(R, 64, 40), toon(tex), {hull: 0.05, edges: false});
  body.traverse((m) => { m.castShadow = false; }); spin.add(body);
  // thin cloud shell
  const clouds = new THREE.Group(); spin.add(clouds);
  for (let i = 0; i < 9; i++) {
    const a = r0() * 6.28, la = (r0() - 0.5) * 1.3;
    const cl = ball(0.35 + r0() * 0.3, '#ffffff', {sy: 0.35, hull: 0.01, seg: 10});
    cl.position.set(Math.cos(la) * Math.cos(a) * (R + 0.08), Math.sin(la) * (R + 0.08), Math.cos(la) * Math.sin(a) * (R + 0.08));
    cl.lookAt(0, 0, 0); cl.rotateX(Math.PI / 2); cl.traverse((m) => { m.castShadow = false; }); clouds.add(cl);
  }
  return {group: g, spin, clouds, setStop: draw};
}

// Starfield on a sphere around a point (space background).
export function stars(n = 500, r = 70, seed = 9) {
  const rr = rng(seed); const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = rr() * 6.28, z = rr() * 2 - 1, s = Math.sqrt(1 - z * z); pos.set([Math.cos(a) * s * r, z * r, Math.sin(a) * s * r], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({color: '#fff6dc', size: 2.2, sizeAttenuation: false, fog: false}));
  p.frustumCulled = false; return p;
}

// Glowing sun ball with halo (place far away).
export function sunBall(r = 3, color = '#ffd760') {
  const g = new THREE.Group();
  const c = canvas(256, 256), x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,240,180,0.9)'); gr.addColorStop(0.35, 'rgba(255,210,110,0.4)'); gr.addColorStop(1, 'rgba(255,200,100,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: texFrom(c), transparent: true, depthWrite: false, fog: false})); halo.scale.setScalar(r * 5); g.add(halo);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), new THREE.MeshBasicMaterial({color, fog: false})));
  return g;
}

export function cactus(h = 1.6) {
  const g = new THREE.Group(); const m = '#6f9a4f';
  const t = cyl(0.18, 0.2, h, toon(m, {paint: {seed: 66, stains: 4}})); g.add(t);
  const cap = ball(0.18, m); at(cap, 0, h, 0); g.add(cap);
  for (const s of [-1, 1]) {
    const a = cyl(0.11, 0.12, 0.45, m); at(a, s * 0.3, h * 0.45, 0); g.add(a);
    const j = box(0.32, 0.18, 0.18, m, {center: true}); at(j, s * 0.16, h * 0.45, 0); g.add(j);
    const k = ball(0.11, m); at(k, s * 0.3, h * 0.45 + 0.45, 0); g.add(k);
  }
  return g;
}

export function iceBlock(w = 0.9, h = 0.7, d = 0.8) {
  return box(w, h, d, new THREE.MeshToonMaterial({color: '#cfeaf6', gradientMap: gradientMap(), transparent: true, opacity: 0.42, depthWrite: false}), {hull: 0.02, edges: true});
}

export function telescope() {
  const g = new THREE.Group();
  for (const a of [0, 2.1, 4.2]) { const l = cyl(0.025, 0.03, 1.2, '#5a3a2a'); at(l, Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25, 0, Math.cos(a) * 0.22, -Math.sin(a) * 0.22); g.add(l); }
  const tube = cyl(0.09, 0.13, 1.1, '#c9a462', {center: true}); at(tube, 0, 1.25, 0, 0, 0, -1.0); g.add(tube);
  const lens = cyl(0.14, 0.14, 0.08, '#3a3a40', {center: true}); lens.position.set(0.47, 1.55, 0); lens.rotation.z = -1.0; g.add(lens);
  return g;
}

// ================= Brain-energy story props =================
// Brain mascot: two wrinkled pink hemispheres with a cartoon face. Returns {group, setFace(kind)} kind: 'sly'|'happy'|'shock'|'sleep'.
export function brainMascot(o = {}) {
  const g = new THREE.Group();
  const c = canvas(512, 256), x = c.getContext('2d');
  x.fillStyle = o.color || '#f2a3b3'; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = 'rgba(150,60,90,0.65)'; x.lineWidth = 7; x.lineCap = 'round';
  const r = rng(o.seed || 23);
  for (let i = 0; i < 34; i++) { let px = r() * 512, py = r() * 256; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (r() - 0.3) * 40; py += (r() - 0.5) * 34; x.quadraticCurveTo(px - 10, py + 12, px, py); } x.stroke(); }
  const tex = texFrom(c);
  for (const s of [-1, 1]) {
    const h = ink(new THREE.SphereGeometry(0.5, 32, 22), toon(tex), {hull: 0.025, edges: false});
    h.scale.set(0.58, 0.72, 0.95); h.position.set(s * 0.27, 0, 0); h.traverse((m) => { m.castShadow = true; }); g.add(h);
  }
  const stem = cyl(0.09, 0.12, 0.3, '#e88aa0'); at(stem, 0.05, -0.62, -0.1, 0, 0.3); g.add(stem);
  // face decal
  const faces = {};
  const mk = (kind) => {
    const fc = canvas(256, 192), f = fc.getContext('2d'); f.lineCap = 'round'; f.lineJoin = 'round'; f.strokeStyle = INK;
    for (const s of [-1, 1]) {
      const ex = 128 + s * 46, ey = 70;
      if (kind === 'sleep') { f.lineWidth = 9; f.beginPath(); f.arc(ex, ey, 20, 0.15 * Math.PI, 0.85 * Math.PI); f.stroke(); continue; }
      f.fillStyle = '#fff'; f.lineWidth = 8; f.beginPath(); f.ellipse(ex, ey, kind === 'shock' ? 30 : 26, kind === 'shock' ? 34 : 30, 0, 0, 7); f.fill(); f.stroke();
      f.fillStyle = INK; f.beginPath(); f.arc(ex + (kind === 'sly' ? 8 : 0), ey + 4, kind === 'shock' ? 8 : 12, 0, 7); f.fill();
      if (kind === 'sly') { f.fillStyle = o.color || '#f2a3b3'; f.fillRect(ex - 32, ey - 38, 64, 30); f.lineWidth = 8; f.beginPath(); f.moveTo(ex - 30, ey - 8 + s * 6); f.lineTo(ex + 30, ey - 8 - s * 6); f.stroke(); }
    }
    f.lineWidth = 8;
    if (kind === 'sly') { f.beginPath(); f.moveTo(86, 140); f.quadraticCurveTo(140, 168, 178, 128); f.stroke(); }
    else if (kind === 'happy') { f.fillStyle = '#5a2328'; f.beginPath(); f.moveTo(88, 128); f.quadraticCurveTo(128, 186, 168, 128); f.closePath(); f.fill(); f.stroke(); f.fillStyle = '#fffdf6'; f.fillRect(96, 128, 64, 12); }
    else if (kind === 'shock') { f.fillStyle = '#5a2328'; f.beginPath(); f.ellipse(128, 145, 18, 24, 0, 0, 7); f.fill(); f.stroke(); }
    else { f.beginPath(); f.moveTo(110, 145); f.lineTo(146, 145); f.stroke(); }
    return texFrom(fc);
  };
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.46), new THREE.MeshBasicMaterial({transparent: true, depthWrite: false}));
  face.position.set(0, -0.02, 0.5); g.add(face);
  const setFace = (k) => { if (!faces[k]) faces[k] = mk(k); face.material.map = faces[k]; face.material.needsUpdate = true; };
  setFace('sly');
  return {group: g, setFace};
}

// Pie chart on a standing board: draw(slices, u) with slices [{frac, color, label}], u = reveal 0..1 of the highlighted (first) slice.
export function pieChart(R = 0.9, o = {}) {
  const g = new THREE.Group();
  const W = 512, c = canvas(W, W), x = c.getContext('2d'); const tex = texFrom(c);
  let key = '';
  function draw(slices, u = 1) {
    const k = JSON.stringify(slices) + Math.round(u * 30); if (k === key) return; key = k;
    x.clearRect(0, 0, W, W); const cx = W / 2, cy = W / 2, rr = W * 0.46;
    let a = -Math.PI / 2; const n = slices.length;
    slices.forEach((sl, i) => {
      let span = sl.frac * Math.PI * 2;
      if (i === 0) span *= u; if (i === n - 1) span += slices[0].frac * Math.PI * 2 * (1 - u);
      if (span <= 0.0001) return;
      x.fillStyle = sl.color; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, rr, a, a + span); x.closePath(); x.fill();
      x.strokeStyle = INK; x.lineWidth = 10; x.stroke();
      if (sl.label && span > 0.35) {
        const m = a + span / 2; x.fillStyle = sl.fg || '#fffdf6'; x.font = `900 ${sl.size || 64}px "Inter Display"`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.lineWidth = 12; x.strokeStyle = INK; x.strokeText(sl.label, cx + Math.cos(m) * rr * 0.58, cy + Math.sin(m) * rr * 0.58); x.fillText(sl.label, cx + Math.cos(m) * rr * 0.58, cy + Math.sin(m) * rr * 0.58);
      }
      a += span;
    });
    x.strokeStyle = INK; x.lineWidth = 14; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.stroke();
    tex.needsUpdate = true;
  }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({map: tex, transparent: true}));
  disc.position.z = 0.04; g.add(disc);
  const back = cyl(R + 0.05, R + 0.05, 0.06, o.rim || '#f3e7d3', {center: true, hull: 0.015}); back.rotation.x = Math.PI / 2; g.add(back);
  return {group: g, draw};
}

// Light bulb with a screw base: returns {group, set(on 0..1)}.
export function bulb(s = 1) {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshBasicMaterial({color: '#fff6c8', transparent: true, opacity: 0.55});
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 24, 18), glassMat); glass.position.y = 0.42 * s; g.add(glass);
  const hullB = new THREE.Mesh(new THREE.SphereGeometry(0.29 * s, 24, 18), new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide})); hullB.position.y = 0.42 * s; g.add(hullB);
  const neck = cyl(0.12 * s, 0.13 * s, 0.22 * s, '#b8bcc4'); at(neck, 0, 0.0, 0); g.add(neck);
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.13 * s, 0.015 * s, 6, 20), toon('#8a8e96')); r.rotation.x = Math.PI / 2; r.position.y = 0.05 * s + i * 0.06 * s; g.add(r); }
  const fil = new THREE.Mesh(new THREE.TorusGeometry(0.07 * s, 0.012 * s, 6, 16, Math.PI), new THREE.MeshBasicMaterial({color: '#6a4a2a'})); fil.position.y = 0.42 * s; g.add(fil);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: glowTex(), transparent: true, depthWrite: false, opacity: 0, color: '#ffe08a'})); halo.scale.setScalar(1.6 * s); halo.position.y = 0.42 * s; g.add(halo);
  const light = new THREE.PointLight('#ffd98a', 0, 7, 1.6); light.position.y = 0.45 * s; g.add(light);
  return {group: g, set(on) { glassMat.color.set(on > 0.5 ? '#fff3a0' : '#e8eef2'); glassMat.opacity = 0.5 + on * 0.45; fil.material.color.set(on > 0.5 ? '#fffbe0' : '#6a4a2a'); halo.material.opacity = on * 0.9; light.intensity = on * 4; }};
}
let _glow;
function glowTex() {
  if (_glow) return _glow;
  const c = canvas(128, 128), x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  _glow = texFrom(c); return _glow;
}
export function glowSprite(color = '#ffe08a', size = 0.3) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: glowTex(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending})); s.scale.setScalar(size); return s;
}

// Bathroom scale with a dial; returns {group, set(kg)}.
export function bathScale(label = 'KG') {
  const g = new THREE.Group();
  const base = box(0.62, 0.1, 0.62, '#eef0ee'); g.add(base);
  const top = box(0.56, 0.02, 0.56, '#c9ccd0', {hull: 0.006}); at(top, 0, 0.1, 0); g.add(top);
  const c = canvas(256, 128), x = c.getContext('2d'); const tex = texFrom(c);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshBasicMaterial({map: tex})); face.rotation.x = -Math.PI / 2.6; face.position.set(0, 0.13, 0.22); g.add(face);
  let last = null;
  return {group: g, set(v) { const t = Math.round(v * 10) / 10; if (t === last) return; last = t; x.fillStyle = '#1f2a28'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#7dff9a'; x.font = '900 70px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(`${t.toFixed(1)} ${label}`, 128, 66); tex.needsUpdate = true; }};
}

// Toy block with a letter.
export function toyBlock(letter, color, s = 0.32) {
  const c = canvas(128, 128), x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 128, 128); x.strokeStyle = INK; x.lineWidth = 10; x.strokeRect(8, 8, 112, 112);
  x.fillStyle = '#fffdf6'; x.font = '900 84px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letter, 64, 70);
  return box(s, s, s, toon(texFrom(c)), {hull: 0.012});
}

export function lungs() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const l = ball(0.22, '#f0909a', {sy: 1.4, sz: 0.7}); at(l, s * 0.2, 0, 0); g.add(l); }
  const tr = cyl(0.04, 0.05, 0.3, '#e8c8c0'); at(tr, 0, 0.18, 0); g.add(tr);
  return g;
}
export function eyeball() {
  const g = new THREE.Group(); g.add(ball(0.2, '#fbf8f2'));
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), new THREE.MeshBasicMaterial({color: '#4f7fa6'})); iris.position.z = 0.201; g.add(iris);
  const pup = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), new THREE.MeshBasicMaterial({color: INK})); pup.position.z = 0.203; g.add(pup);
  return g;
}
export function plate() {
  const g = new THREE.Group(); const p = cyl(0.2, 0.16, 0.03, '#fbf8f2', {hull: 0.008}); g.add(p);
  const rice = ball(0.1, '#fbf6ea', {sy: 0.5}); at(rice, -0.05, 0.03, 0); g.add(rice);
  const egg = cyl(0.06, 0.06, 0.02, '#f2d24a'); at(egg, 0.07, 0.03, 0.02); g.add(egg);
  const veg = ball(0.05, '#6f9a4f'); at(veg, 0.05, 0.05, -0.07); g.add(veg);
  return g;
}
export function waterGlass() {
  const g = new THREE.Group();
  const gl = cyl(0.06, 0.05, 0.16, new THREE.MeshBasicMaterial({color: '#dff2fb', transparent: true, opacity: 0.6}), {hull: 0.006}); g.add(gl);
  const w = cyl(0.052, 0.045, 0.1, '#8fd0ef', {hull: 0}); at(w, 0, 0.01, 0); g.add(w);
  return g;
}
export function bookStack(n = 4, seed = 3) {
  const g = new THREE.Group(); const r = rng(seed); let y = 0;
  for (let i = 0; i < n; i++) { const h = 0.05 + r() * 0.03; const b = box(0.32 + r() * 0.06, h, 0.24, ['#c75b5b', '#4f7fa6', '#e8c35a', '#5a9a8a', '#9a6fb0'][i % 5], {hull: 0.008}); at(b, (r() - 0.5) * 0.04, y, 0, (r() - 0.5) * 0.3); g.add(b); y += h; }
  return g;
}

// ---------- money printing story props ----------
// Banknote texture: our own design (not a real note) with a big value and a small caption.
export function noteTex(value = '100', o = {}) {
  const {color = '#7fb36a', dark = '#3f6a3a', sub = '', seed = 3} = o;
  const c = canvas(512, 256), x = c.getContext('2d'); const r = rng(seed);
  x.fillStyle = color; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = INK; x.lineWidth = 12; x.strokeRect(0, 0, 512, 256);
  x.strokeStyle = dark; x.lineWidth = 10; x.strokeRect(20, 20, 472, 216);
  x.lineWidth = 2; for (let i = 0; i < 26; i++) { x.globalAlpha = 0.25; x.beginPath(); x.arc(256, 128, 30 + i * 9, 0, 7); x.stroke(); } x.globalAlpha = 1;
  x.fillStyle = shade(color, 0.25); x.beginPath(); x.ellipse(110, 128, 62, 78, 0, 0, 7); x.fill();
  x.strokeStyle = dark; x.lineWidth = 5; x.stroke();
  // crown emblem in the oval
  x.fillStyle = '#e8c04a'; x.beginPath(); x.moveTo(72, 150); x.lineTo(72, 100); x.lineTo(92, 122); x.lineTo(110, 92); x.lineTo(128, 122); x.lineTo(148, 100); x.lineTo(148, 150); x.closePath(); x.fill(); x.strokeStyle = INK; x.lineWidth = 4; x.stroke();
  x.fillStyle = INK; x.textAlign = 'center'; x.textBaseline = 'middle';
  const big = value.length > 6 ? 46 : value.length > 4 ? 62 : 92;
  x.font = `900 ${big}px "Inter Display"`; x.fillText(value, 345, sub ? 110 : 128);
  if (sub) { x.font = '900 34px "Inter Display"'; x.fillText(sub, 345, 178); }
  x.font = '900 30px "Inter Display"'; x.fillText(value.length > 4 ? '' : value, 455, 50);
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(40,30,20,${0.03 + r() * 0.05})`; x.beginPath(); x.arc(r() * 512, r() * 256, 4 + r() * 14, 0, 7); x.fill(); }
  return texFrom(c);
}
export function banknote(value = '100', o = {}) {
  const w = o.w || 0.32, h = w / 2;
  const tex = o.tex || noteTex(value, o);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: tex, side: THREE.DoubleSide}));
  const g = new THREE.Group(); g.add(m);
  return g;
}
// A stack (brick) of notes.
export function noteStack(n = 6, o = {}) {
  const g = new THREE.Group(); const tex = noteTex(o.value || '100', o);
  const side = toon(o.color || '#7fb36a', {wear: false}); const top = toon(tex);
  const w = o.w || 0.34, d = w / 2;
  const geo = new THREE.BoxGeometry(w, 0.022, d); geo.translate(0, 0.011, 0);
  for (let i = 0; i < n; i++) { const b = ink(geo, [side, side, top, side, side, side], {hull: 0.008}); at(b, (i % 2) * 0.012, i * 0.024, 0, (i % 3 - 1) * 0.06); g.add(b); }
  return g;
}
// Money printing press: a chunky machine with rollers, a lever, a chute and a glowing lamp.
export function printingPress(label = 'MONEY', o = {}) {
  const g = new THREE.Group(); const col = o.color || '#5a6a7a';
  const body = box(1.7, 1.25, 1.1, toon(col, {paint: {seed: 61, stains: 14, chips: 10}})); g.add(body);
  const top = box(1.9, 0.18, 1.25, toon(shade(col, -0.2))); at(top, 0, 1.25, 0); g.add(top);
  for (const z of [-0.22, 0.22]) { const rl = cyl(0.16, 0.16, 1.5, '#b8b0a0'); rl.rotation.z = Math.PI / 2; at(rl, 0.75, 1.62, z); g.add(rl); }
  const chute = box(0.9, 0.06, 0.7, toon('#3a3a42')); at(chute, 0, 0.55, 0.75, 0, 0.35); g.add(chute);
  const s = sign(label, 1.2, 0.36, {bg: '#e8c04a', frame: '#8a6a2a'}); at(s, 0, 0.92, 0.56); g.add(s);
  const gear = cyl(0.3, 0.3, 0.1, '#c9a462'); gear.rotation.x = Math.PI / 2; at(gear, -0.6, 0.95, 0.58); g.add(gear);
  const leverBase = box(0.16, 0.2, 0.16, '#3a3a42'); at(leverBase, 0.98, 0.9, 0.2); g.add(leverBase);
  const lever = new THREE.Group(); at(lever, 0.98, 1.05, 0.2); g.add(lever);
  const stick = cyl(0.035, 0.035, 0.55, '#3a3a42'); lever.add(stick);
  const knob = ball(0.08, '#d8413a'); at(knob, 0, 0.58, 0); lever.add(knob);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({color: '#6fd06a'})); at(lamp, 0.55, 1.42, 0.62); g.add(lamp);
  return {group: g, lever, gear, lamp};
}
// Throne: high-backed gold chair with a red cushion.
export function throne() {
  const g = new THREE.Group();
  const seat = box(1.0, 0.55, 0.8, toon('#d8a83a', {paint: {seed: 71}})); g.add(seat);
  const cush = box(0.86, 0.12, 0.7, toon('#b8323a')); at(cush, 0, 0.55, 0.02); g.add(cush);
  const back = box(1.0, 1.7, 0.18, toon('#d8a83a', {paint: {seed: 72}})); at(back, 0, 0.55, -0.35); g.add(back);
  const pad = box(0.7, 1.2, 0.06, toon('#b8323a')); at(pad, 0, 0.85, -0.24); g.add(pad);
  for (const s of [-1, 1]) { const k = ball(0.12, '#e8c04a'); at(k, s * 0.44, 2.35, -0.35); g.add(k); const arm = box(0.14, 0.28, 0.8, toon('#c9982f')); at(arm, s * 0.46, 0.55, 0); g.add(arm); }
  const crest = cone(0.2, 0.32, '#e8c04a'); at(crest, 0, 2.25, -0.35); g.add(crest);
  return g;
}
// Bread loaf.
export function loaf(s = 1) {
  const g = new THREE.Group();
  const b = ball(0.16 * s, toon('#d89a4a', {paint: {seed: 81, stains: 6}}), {sx: 1.6, sy: 0.75, sz: 1, hull: 0.012}); at(b, 0, 0.1 * s, 0); g.add(b);
  for (let i = -1; i <= 1; i++) { const c = box(0.03 * s, 0.012, 0.2 * s, '#f3d9a0', {hull: 0}); at(c, i * 0.09 * s, 0.2 * s, 0, 0.5); g.add(c); }
  return g;
}
// Wheelbarrow.
export function wheelbarrow(color = '#6a8aa8') {
  const g = new THREE.Group();
  const tub = box(0.9, 0.35, 0.6, toon(color, {paint: {seed: 91, chips: 8}})); at(tub, 0, 0.32, 0); g.add(tub);
  const wh = cyl(0.2, 0.2, 0.08, '#3a3a42'); wh.rotation.z = Math.PI / 2; at(wh, 0, 0.2, 0.45); wh.rotation.set(0, 0, Math.PI / 2); at(wh, 0.55, 0.2, 0); g.add(wh);
  for (const z of [-0.22, 0.22]) { const h = cyl(0.025, 0.025, 0.9, '#7a5236'); h.rotation.z = Math.PI / 2 - 0.25; at(h, -0.75, 0.55, z); g.add(h); const lg = cyl(0.025, 0.025, 0.3, '#7a5236'); at(lg, -0.3, 0, z); g.add(lg); }
  return g;
}
// Picture frame for a collector's note.
export function noteFrame(value, o = {}) {
  const g = new THREE.Group(); const w = o.w || 1.3, h = w / 2;
  const fr = box(w + 0.2, h + 0.2, 0.06, toon('#c9982f', {paint: {seed: 93}}), {center: true}); g.add(fr);
  const n = banknote(value, {...o, w}); n.position.z = 0.035; g.add(n);
  return g;
}

// ---------- living-to-500 story props ----------
// Birthday cake with a number plaque and candles; returns {group, flames}.
export function cake(label = '250', o = {}) {
  const g = new THREE.Group(); const flames = [];
  const t1 = cyl(0.42, 0.42, 0.28, toon(o.color || '#f3c8d8', {wear: false}), {hull: 0.012, seg: 32}); g.add(t1);
  const ic1 = cyl(0.44, 0.44, 0.05, toon('#fff3df', {wear: false}), {hull: 0.01, seg: 32}); at(ic1, 0, 0.26, 0); g.add(ic1);
  const t2 = cyl(0.3, 0.3, 0.24, toon(o.color2 || '#c97aa8', {wear: false}), {hull: 0.012, seg: 32}); at(t2, 0, 0.3, 0); g.add(t2);
  const ic2 = cyl(0.32, 0.32, 0.05, toon('#fff3df', {wear: false}), {hull: 0.01, seg: 32}); at(ic2, 0, 0.52, 0); g.add(ic2);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2;
    const c = cyl(0.018, 0.018, 0.14, ['#4f8fc8', '#f2d24a', '#7fa35a'][i % 3], {hull: 0.006}); at(c, x, 0.56, z); g.add(c);
    const f = ball(0.03, new THREE.MeshBasicMaterial({color: '#ffcf5a'}), {sy: 1.6, hull: 0}); at(f, x, 0.74, z); g.add(f); flames.push(f);
  }
  const pl = sign(label, 0.42, 0.2, {bg: '#fff3df', frame: '#c97aa8'}); at(pl, 0, 0.06, 0.43); g.add(pl);
  return {group: g, flames};
}

// Wall progress bar board: label, bar filled to `frac`, percentage. set(frac) redraws.
export function lifeBar(label, w = 1.6, h = 0.55) {
  const c = canvas(1024, Math.round(1024 * h / w)), x = c.getContext('2d'); const tex = texFrom(c); const H = c.height;
  let last = -1;
  const set = (f) => {
    const q = Math.round(f * 100); if (q === last) return; last = q;
    x.fillStyle = '#fff3df'; x.fillRect(0, 0, 1024, H); x.strokeStyle = INK; x.lineWidth = 18; x.strokeRect(12, 12, 1000, H - 24);
    x.font = '900 110px "Inter Display"'; x.fillStyle = INK; x.textBaseline = 'middle'; x.fillText(label, 50, H * 0.3);
    x.textAlign = 'right'; x.fillText(q + '%', 975, H * 0.3); x.textAlign = 'left';
    x.fillStyle = '#e7dcc8'; x.fillRect(50, H * 0.55, 925, H * 0.3);
    x.fillStyle = q < 30 ? '#d8413a' : '#7fc06a'; x.fillRect(50, H * 0.55, 925 * q / 100, H * 0.3);
    x.lineWidth = 12; x.strokeRect(50, H * 0.55, 925, H * 0.3); tex.needsUpdate = true;
  };
  set(0.5);
  const g = new THREE.Group(); const back = box(w + 0.06, h + 0.06, 0.05, '#7a5236', {center: true}); g.add(back);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: tex})); face.position.z = 0.03; g.add(face);
  return {group: g, set};
}

// A book standing upright, very thick (the thesis). Spine faces +z with the title.
export function bigBook(label, w = 0.9, h = 1.9, d = 1.5, color = '#3f5f8a') {
  const g = new THREE.Group();
  const pages = box(w * 0.94, h * 0.97, d * 0.96, toon('#f6efdf', {paint: {stripes: {n: 40, color: '#e2d6bd'}, seed: 91}})); at(pages, 0.02, h * 0.015, 0); g.add(pages);
  for (const s of [-1, 1]) { const cv = box(0.05, h, d, color); at(cv, s * w / 2, 0, 0); g.add(cv); }
  const sp = box(w, h, 0.08, color); at(sp, 0, 0, d / 2); g.add(sp);
  const t = sign(label, w * 0.8, 0.32, {bg: '#e8c35a', frame: '#8a6a2a'}); at(t, 0, h * 0.72, d / 2 + 0.06); g.add(t);
  for (const y of [0.2, 0.9]) { const b = box(w + 0.01, 0.05, 0.02, '#e8c35a', {hull: 0}); at(b, 0, h * y, d / 2 + 0.045); g.add(b); }
  return g;
}

// Wardrobe with two doors and knobs.
export function wardrobe(color = '#9a6a4a', w = 1.0, h = 1.9, d = 0.6) {
  const g = new THREE.Group();
  g.add(box(w, h, d, toon(color, {paint: {planks: 3, seed: 92}})));
  for (const s of [-1, 1]) {
    const door = box(w / 2 - 0.06, h - 0.2, 0.03, toon(color, {paint: {seed: 93 + s}})); at(door, s * w / 4, 0.12, d / 2 + 0.01); g.add(door);
    const k = ball(0.035, '#e8c35a'); at(k, s * 0.06, h * 0.52, d / 2 + 0.05); g.add(k);
  }
  const top = box(w + 0.08, 0.08, d + 0.06, color); at(top, 0, h, 0); g.add(top);
  return g;
}

// Time clock on a post (clock-in machine): returns {group, card}.
export function timeClock(label) {
  const g = new THREE.Group();
  const post = cyl(0.04, 0.06, 1.1, '#5a5a62'); g.add(post);
  const bx = box(0.5, 0.55, 0.3, '#c9ccd2'); at(bx, 0, 1.1, 0); g.add(bx);
  const clk = wallClock(0.15, {rim: '#5a5a62'}); at(clk.group, 0, 1.47, 0.16); clk.set(9, 20); g.add(clk.group);
  const s = sign(label, 0.42, 0.13, {bg: '#d8413a', fg: '#fff3df', frame: '#8a2a2a'}); at(s, 0, 1.22, 0.16); g.add(s);
  const card = box(0.12, 0.18, 0.01, '#fff3df', {hull: 0.004}); at(card, 0.1, 1.68, 0.05); g.add(card);
  return {group: g, card, clock: clk};
}

// Tray of fried snacks.
export function snackTray(n = 7, seed = 5) {
  const g = new THREE.Group(); const r = rng(seed);
  const tray = cyl(0.36, 0.32, 0.04, '#c9ccd2', {hull: 0.008, seg: 24}); g.add(tray);
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, rr = r() * 0.22;
    const p = ball(0.07 + r() * 0.02, toon(['#d9a04a', '#c98a3a', '#e3b25a'][i % 3], {paint: {grain: 120, seed: 50 + i}}), {sx: 1.5, sy: 0.6, hull: 0.008});
    at(p, Math.cos(a) * rr, 0.06 + (i % 3) * 0.03, Math.sin(a) * rr, r() * 3); g.add(p);
  }
  return g;
}

// Tiny simple person (for crowds on the globe): body + head, coloured.
export function tinyPerson(color = '#4f8fc8', s = 0.12) {
  const g = new THREE.Group();
  const b = cyl(s * 0.35, s * 0.45, s * 1.1, color, {hull: 0.006, seg: 10}); g.add(b);
  const h = ball(s * 0.32, '#f5dcc6', {hull: 0.006, seg: 10}); at(h, 0, s * 1.4, 0); g.add(h);
  return g;
}

// ================= Knocker-upper story props =================
// Two-storey brick terraced house. Front face at z=0; upper windows centred at y = h1 + 1.1 + 0.425, x = ±w/4.
// Returns {group, upper: [[x, y], ...], lit: [planes]} — lit planes sit just behind the upper window openings.
export function terrace(w = 3.2, o = {}) {
  const g = new THREE.Group(); const h1 = 2.6, h2 = 2.4;
  const col = o.color || '#b5654a';
  const low = facade(w, h1, {color: col, windows: 2, doorX: o.doorX ?? w / 4, seed: o.seed || 1, trim: o.trim || '#e8dcc0', shutter: o.shutter || '#3f5a4a', doorColor: o.door || '#3a4a5a'});
  g.add(low);
  const up = facade(w, h2, {color: col, windows: 2, door: false, bars: false, seed: (o.seed || 1) + 7, trim: o.trim || '#e8dcc0', shutter: o.shutter || '#3f5a4a'});
  up.position.y = h1; g.add(up);
  const body = box(w, h1 + h2, 3, toon(col, {paint: {bricks: true, seed: o.seed || 1}})); at(body, 0, 0, -0.85 - 1.5); g.add(body);
  const roof = gableRoof(w, 3.3, 1.2, o.roof || '#5a4a52'); at(roof, 0, h1 + h2 + 0.18, -1.6); g.add(roof);
  const ch = box(0.45, 1.1, 0.45, '#8a4a3a'); at(ch, w / 3, h1 + h2 + 0.4, -1.4); g.add(ch);
  const pot = cyl(0.09, 0.09, 0.25, '#6a3a2a'); at(pot, w / 3, h1 + h2 + 1.5, -1.4); g.add(pot);
  const lit = [], upper = [];
  for (const sx of [-1, 1]) {
    const x = sx * w / 4, y = h1 + 1.1 + 0.425;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.95), new THREE.MeshBasicMaterial({color: '#2a2436'}));
    p.position.set(x, y, -0.7); g.add(p); lit.push(p); upper.push([x, y]);
  }
  return {group: g, upper, lit, h1};
}

// Brick mill with tall chimneys, big windows and a gate. Front face at z=0.
export function factory(w = 9, h = 5, o = {}) {
  const g = new THREE.Group();
  const f = facade(w, h, {color: o.color || '#a85a44', windows: 5, doorX: 0, seed: 77, trim: '#d8ccb0', shutter: '#4a4a52', doorColor: '#4a3a32'});
  g.add(f);
  const up = facade(w, 2.6, {color: o.color || '#a85a44', windows: 6, door: false, seed: 78, trim: '#d8ccb0', shutter: '#4a4a52'}); up.position.y = h; g.add(up);
  const body = box(w, h + 2.6, 6, toon(o.color || '#a85a44', {paint: {bricks: true, seed: 79}})); at(body, 0, 0, -0.9 - 3); g.add(body);
  const roof = box(w + 0.4, 0.3, 6.4, '#4a4048'); at(roof, 0, h + 2.6, -3.9); g.add(roof);
  const tops = [];
  for (const [x, z, hh] of [[-w / 2 + 1.2, -2.5, 6.5], [w / 2 - 1.6, -4.5, 8]]) {
    const c = cyl(0.55, 0.75, hh, toon('#8a4a3a', {paint: {bricks: true, seed: 80}})); at(c, x, h + 2.6, z); g.add(c);
    const rim = cyl(0.65, 0.65, 0.3, '#5a3a32'); at(rim, x, h + 2.6 + hh - 0.3, z); g.add(rim);
    tops.push([x, h + 2.6 + hh + 0.1, z]);
  }
  return {group: g, tops};
}

// Twin-bell alarm clock. Returns {group, set(h, m), ring(t, amount)}: ring shakes it (amount 0..1).
export function alarmClock(r = 0.16, o = {}) {
  const g = new THREE.Group(); const inner = new THREE.Group(); g.add(inner);
  const wc = wallClock(r, {rim: o.color || '#d8413a'}); wc.group.position.y = r + 0.05; inner.add(wc.group);
  for (const s of [-1, 1]) {
    const b = ball(r * 0.42, toon(o.bell || '#e8c04a', {wear: false}), {sy: 0.8}); at(b, s * r * 0.62, r * 2.0 + 0.05, -0.02); b.rotation.z = -s * 0.5; inner.add(b);
    const leg = cyl(0.012, 0.016, 0.07, INK); at(leg, s * r * 0.6, 0, 0, 0, 0, s * 0.35); inner.add(leg);
  }
  const hm = cyl(0.012, 0.012, r * 0.35, INK); at(hm, 0, r * 2.0 + 0.05, 0); inner.add(hm);
  wc.set(5, 0);
  return {group: g, set: wc.set, ring(t, a) { inner.rotation.z = a * 0.14 * Math.sin(t * 60); inner.position.y = a * 0.01 * Math.abs(Math.sin(t * 45)); }};
}

// ================= "A banknote's day" story props =================
// ATM booth, front at z=0. Returns {group, slot: [x, y, z] (cash slot mouth), screen (mesh, set its map/color)}.
export function atmBooth(label = 'ATM', o = {}) {
  const g = new THREE.Group(); const col = o.color || '#3f6fa8';
  const back = box(1.5, 2.6, 1.0, toon(col, {paint: {seed: 91, stains: 8, chips: 6}})); at(back, 0, 0, -0.55); g.add(back);
  const roof = box(1.7, 0.18, 1.2, toon(shade(col, -0.25))); at(roof, 0, 2.6, -0.5); g.add(roof);
  const s = sign(label, 1.2, 0.36, {bg: o.signBg || '#f2d24a', frame: '#8a6a2a'}); at(s, 0, 2.32, -0.02); g.add(s);
  const panel = box(1.1, 1.3, 0.12, toon('#d8dde4', {paint: {seed: 92, stains: 4}})); at(panel, 0, 0.6, -0.02); g.add(panel);
  const c = canvas(256, 192), x = c.getContext('2d');
  x.fillStyle = '#7fc4e8'; x.fillRect(0, 0, 256, 192); x.fillStyle = '#fff6e0'; x.fillRect(24, 24, 208, 30);
  x.fillStyle = 'rgba(53,31,34,0.4)'; for (let i = 0; i < 3; i++) x.fillRect(40, 80 + i * 30, 120 + i * 20, 14);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.4), new THREE.MeshBasicMaterial({map: texFrom(c)})); screen.position.set(0, 1.55, 0.05); g.add(screen);
  const bezel = box(0.66, 0.5, 0.04, '#2b2b33'); at(bezel, 0, 1.3, 0.02); g.add(bezel);
  const pad = box(0.34, 0.26, 0.08, '#4a4a52'); at(pad, -0.18, 1.0, 0.06, 0, 0.5); g.add(pad);
  for (let i = 0; i < 12; i++) { const k = box(0.06, 0.04, 0.03, i === 11 ? '#6fb06a' : i === 9 ? '#d8413a' : '#e8e8ea', {hull: 0.004}); at(k, -0.28 + (i % 3) * 0.1, 1.04 + Math.floor(i / 3) * 0.05, 0.12 - Math.floor(i / 3) * 0.025, 0, 0.5); g.add(k); }
  const slotBox = box(0.4, 0.09, 0.1, '#5a5a62'); at(slotBox, 0.2, 0.86, 0.06); g.add(slotBox);
  const slit = box(0.32, 0.025, 0.02, '#151518', {hull: 0}); at(slit, 0.2, 0.892, 0.11); g.add(slit);
  const ledge = box(1.0, 0.06, 0.35, toon('#9aa0a8')); at(ledge, 0, 0.7, 0.12); g.add(ledge);
  return {group: g, slot: [0.2, 0.9, 0.12], screen};
}

// Motor scooter facing +x (side view along the street). Rider/seat top at about y 0.78.
export function scooter(color = '#d8413a') {
  const g = new THREE.Group();
  const body = box(1.1, 0.42, 0.42, toon(color, {paint: {seed: 93, stains: 4}})); at(body, -0.1, 0.3, 0); g.add(body);
  const seat = box(0.6, 0.1, 0.36, '#2b2b33'); at(seat, -0.25, 0.72, 0); g.add(seat);
  const front = box(0.22, 0.75, 0.42, toon(color)); at(front, 0.5, 0.2, 0, 0, 0, -0.18); g.add(front);
  const floor = box(0.4, 0.06, 0.4, '#3a3a40'); at(floor, 0.2, 0.25, 0); g.add(floor);
  const stem = cyl(0.03, 0.03, 0.5, '#5a5a62'); at(stem, 0.6, 0.85, 0, 0, 0, -0.18); g.add(stem);
  const bar = cyl(0.025, 0.025, 0.6, '#2b2b33', {center: true}); at(bar, 0.68, 1.3, 0, 0, Math.PI / 2); g.add(bar);
  const lamp = ball(0.09, new THREE.MeshBasicMaterial({color: '#fff3b0'}), {hull: 0.01}); at(lamp, 0.72, 1.18, 0); g.add(lamp);
  for (const x of [-0.5, 0.62]) {
    const w = cyl(0.22, 0.22, 0.14, '#2b2b33', {center: true, seg: 20}); at(w, x, 0.22, 0, 0, Math.PI / 2); g.add(w);
    const hub = cyl(0.1, 0.1, 0.16, '#c9ccd0', {center: true}); at(hub, x, 0.22, 0, 0, Math.PI / 2); g.add(hub);
  }
  return g;
}

// Trendy café counter piece: an espresso machine.
export function espressoMachine() {
  const g = new THREE.Group();
  const b = box(0.7, 0.5, 0.45, toon('#c9ccd0', {wear: false})); g.add(b);
  const top = box(0.74, 0.06, 0.48, '#2b2b33'); at(top, 0, 0.5, 0); g.add(top);
  for (const s of [-0.18, 0.18]) { const pf = cyl(0.05, 0.05, 0.08, '#2b2b33'); at(pf, s, 0.22, 0.25); g.add(pf); const hd = box(0.03, 0.03, 0.16, '#2b2b33'); at(hd, s, 0.24, 0.36); g.add(hd); }
  const gauge = cyl(0.06, 0.06, 0.02, '#fbf6ea', {center: true}); at(gauge, 0, 0.38, 0.23, 0, Math.PI / 2); g.add(gauge);
  return g;
}

// Takeaway iced coffee with a dome lid, whipped cream and a straw.
export function fancyCup(o = {}) {
  const g = new THREE.Group();
  g.add(cyl(0.07, 0.05, 0.2, toon(o.color || '#c9935a', {wear: false}), {hull: 0.008}));
  const band = cyl(0.071, 0.066, 0.06, toon('#f3e7d3', {wear: false}), {hull: 0.004}); at(band, 0, 0.07, 0); g.add(band);
  const cream = ball(0.065, '#fffaf0', {sy: 0.7, hull: 0.008}); at(cream, 0, 0.21, 0); g.add(cream);
  const drizzle = ball(0.03, '#8a5a3a', {sy: 0.6, hull: 0.004}); at(drizzle, 0, 0.255, 0); g.add(drizzle);
  const straw = cyl(0.008, 0.008, 0.22, '#d8413a', {hull: 0.004}); at(straw, 0.02, 0.2, 0, 0, 0, -0.2); g.add(straw);
  return g;
}

// Angkot (Indonesian minibus) facing +x. Returns the group; door side faces +z.
export function minibus(color = '#5aa8a0', label = 'ANGKOT') {
  const g = new THREE.Group();
  const body = box(3.4, 1.45, 1.6, toon(color, {paint: {seed: 95, stains: 8, chips: 8}})); at(body, 0, 0.35, 0); g.add(body);
  const hood = box(0.7, 0.55, 1.56, toon(color)); at(hood, 1.95, 0.35, 0); g.add(hood);
  const win = box(2.5, 0.5, 1.62, '#2a3a4a', {hull: 0}); at(win, -0.35, 1.15, 0); g.add(win);
  const ws = box(0.06, 0.5, 1.4, '#8fc0d8', {hull: 0}); at(ws, 1.62, 1.12, 0, 0, 0, 0.2); g.add(ws);
  const stripe = box(3.42, 0.1, 1.62, '#f2d24a', {hull: 0}); at(stripe, 0, 0.82, 0); g.add(stripe);
  const roofS = sign(label, 1.2, 0.3, {bg: '#fff3df', frame: '#8a6a2a'}); at(roofS, 0.2, 1.85, 0.0, 0); roofS.rotation.y = 0; g.add(roofS);
  const door = box(0.75, 1.2, 0.02, '#1f2a36', {hull: 0}); at(door, -1.2, 0.4, 0.8); g.add(door);
  for (const x of [-1.1, 1.5]) for (const z of [-0.8, 0.8]) {
    const w = cyl(0.3, 0.3, 0.22, '#2b2b33', {center: true, seg: 20}); at(w, x, 0.3, z, 0, Math.PI / 2); g.add(w);
    const hub = cyl(0.13, 0.13, 0.24, '#c9ccd0', {center: true}); at(hub, x, 0.3, z, 0, Math.PI / 2); g.add(hub);
  }
  const hl = ball(0.1, new THREE.MeshBasicMaterial({color: '#fff3b0'}), {hull: 0.01}); at(hl, 2.3, 0.75, 0.5); g.add(hl);
  return g;
}

// Vegetable heap on a cart table: cabbages, carrots, tomatoes, chillies.
export function vegPile(seed = 5) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < 18; i++) {
    const k = i % 4, x = (r() - 0.5) * 1.6, z = (r() - 0.5) * 0.6, y = 0.86 + r() * 0.08;
    const m = k === 0 ? ball(0.11, '#7fb35a', {hull: 0.008}) : k === 1 ? cyl(0.03, 0.012, 0.2, '#e8823a', {hull: 0.006, center: true}) : k === 2 ? ball(0.06, '#d8413a', {hull: 0.006}) : cyl(0.012, 0.006, 0.12, '#c8302a', {hull: 0.004, center: true});
    at(m, x, y + (k === 0 ? 0.08 : 0.03), z, r() * 3, 0, k % 2 ? Math.PI / 2 : 0); g.add(m);
  }
  return g;
}

// Chicken piggy bank (celengan ayam): painted clay chicken with a slot on its back. Faces +z.
export function piggyChicken(s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const clay = toon(paintTex('#e8823a', {seed: 97, stains: 6, chips: 4}));
  const body = ball(0.3, clay, {sx: 1.25, sy: 1.0, sz: 1.0}); at(body, 0, 0.3, 0); g.add(body);
  const head = ball(0.15, clay); at(head, 0.32, 0.6, 0); g.add(head);
  const comb = ball(0.08, '#d8302a', {sx: 0.5, sy: 1.0, sz: 1.2}); at(comb, 0.32, 0.77, 0); g.add(comb);
  const beak = cone(0.05, 0.12, '#f2c94c'); at(beak, 0.48, 0.6, 0, 0, 0, -Math.PI / 2); g.add(beak);
  const wattle = ball(0.04, '#d8302a', {sy: 1.4}); at(wattle, 0.42, 0.5, 0); g.add(wattle);
  const tail = ball(0.16, '#d8302a', {sx: 0.5, sy: 1.2, sz: 0.9}); at(tail, -0.38, 0.5, 0, 0, 0, 0.4); g.add(tail);
  for (const z of [-0.08, 0.08]) { const e = ball(0.022, INK, {hull: 0}); at(e, 0.42, 0.65, z * 1.3); g.add(e); }
  for (const [y, c] of [[0.3, '#f2d24a'], [0.22, '#4f8fc8']]) { const st = cyl(0.302, 0.302, 0.03, c, {center: true, hull: 0, seg: 32}); st.scale.set(1.25, 1, 1); at(st, 0, y + 0.08, 0); g.add(st); }
  const slot = box(0.2, 0.03, 0.04, '#2a1a14', {hull: 0}); at(slot, -0.02, 0.6, 0); g.add(slot);
  const foot = cyl(0.18, 0.22, 0.06, clay); at(foot, 0, 0, 0); g.add(foot);
  return {group: g, slot: [-0.02 * s, 0.61 * s, 0]};
}

// Wallet: returns {group, open(u)} (u 0 closed .. 1 open flat).
export function wallet(color = '#6a4a3a') {
  const g = new THREE.Group();
  const a = box(0.22, 0.13, 0.02, toon(color, {paint: {seed: 98, stains: 4}}), {center: true, hull: 0.006}); at(a, -0.11, 0, 0); 
  const L = new THREE.Group(); L.add(a); g.add(L);
  const b = box(0.22, 0.13, 0.02, toon(color, {paint: {seed: 99, stains: 4}}), {center: true, hull: 0.006}); at(b, 0.11, 0, 0);
  const R = new THREE.Group(); R.add(b); g.add(R);
  const inner = box(0.2, 0.11, 0.005, '#3a2a22', {center: true, hull: 0}); at(inner, 0.11, 0, 0.012); R.add(inner);
  return {group: g, open(u) { L.rotation.y = -Math.PI / 2 * (1 - u) * 0.98; R.rotation.y = 0; L.position.z = 0.0; }};
}

// Shoe box with a painted label and a sneaker on the lid.
export function shoeBox(color = '#e8a83a', label = '') {
  const g = new THREE.Group();
  const b = box(0.5, 0.22, 0.3, toon(color, {wear: false})); g.add(b);
  const lid = box(0.52, 0.06, 0.32, toon(shade(color, -0.15), {wear: false})); at(lid, 0, 0.22, 0); g.add(lid);
  if (label) { const s = sign(label, 0.42, 0.12, {bg: '#fff3df', frame: shade(color, -0.3), depth: 0.01}); at(s, 0, 0.06, 0.155); g.add(s); }
  return g;
}

// Open notebook with ruled lines and a heading; pencil on top.
export function notebook(label = '', o = {}) {
  const g = new THREE.Group();
  const cover = box(0.9, 0.03, 0.62, toon(o.cover || '#4f7fa6', {wear: false})); g.add(cover);
  const c = canvas(512, 360), x = c.getContext('2d');
  x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, 512, 360); x.strokeStyle = '#9ab8d8'; x.lineWidth = 3;
  for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(20, 80 + i * 32); x.lineTo(492, 80 + i * 32); x.stroke(); }
  x.strokeStyle = '#d88a8a'; x.beginPath(); x.moveTo(256, 0); x.lineTo(256, 360); x.stroke();
  x.fillStyle = INK; x.font = '900 34px "Inter Display"'; x.textAlign = 'center'; x.fillText(label, 128, 50);
  x.font = '700 24px "Inter Display"'; x.textAlign = 'left';
  (o.lines || []).forEach((l, i) => x.fillText(l, 22, 104 + i * 32));
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.58), toon(texFrom(c))); page.rotation.x = -Math.PI / 2; page.position.y = 0.032; g.add(page);
  const pencil = cyl(0.012, 0.012, 0.42, '#f2c94c', {center: true, hull: 0.004}); at(pencil, 0.2, 0.05, 0.05, 0.6, 0, Math.PI / 2); g.add(pencil);
  return g;
}

// ================= "Gaji lima juta" story props =================
// Coconut palm: a gently curved ringed trunk, long fronds and coconuts. Returns {group, top: [x, y, z]} (crown point).
export function coconutPalm(o = {}) {
  const g = new THREE.Group(); const h = o.h || 6; const lean = o.lean ?? 0.5; const r = rng(o.seed || 7);
  const segs = 8; let x = 0, y = 0;
  const mat = toon('#9a7a52', {paint: {stripes: {n: 14, color: '#7a5a3a'}, seed: 15}});
  for (let i = 0; i < segs; i++) {
    const u = i / segs, dx = lean * (Math.pow((i + 1) / segs, 2) - Math.pow(u, 2)), dy = h / segs;
    const len = Math.hypot(dx, dy), ang = Math.atan2(dx, dy);
    const c = cyl(0.13 - 0.04 * u, 0.15 - 0.04 * u, len + 0.02, mat, {hull: 0.012}); at(c, x, y, 0, 0, 0, -ang); g.add(c);
    x += dx; y += dy;
  }
  const n = 9;
  for (let i = 0; i < n; i++) {
    const ay = i / n * Math.PI * 2 + r() * 0.3;
    if (o.open && -Math.sin(ay) > 0.45) continue; // leave the camera side open
    const piv = new THREE.Group(); piv.position.set(x, y, 0); piv.rotation.y = ay; g.add(piv);
    const tilt = new THREE.Group(); tilt.rotation.z = -0.35 - r() * 0.35; piv.add(tilt);
    const leaf = ball(0.5, i % 2 ? '#5f9e42' : '#4f8e3a', {sx: 3.2, sy: 0.05, sz: 0.38, seg: 12, hull: 0.014}); at(leaf, 1.45, 0, 0, 0, 0, -0.25); tilt.add(leaf);
  }
  for (let k = 0; k < 4; k++) { const c = ball(0.13, '#6a8a3a', {hull: 0.01}); at(c, x + Math.cos(k * 1.7) * 0.18, y - 0.2, Math.sin(k * 1.7) * 0.18); g.add(c); }
  return {group: g, top: [x, y, 0]};
}

// Glass office tower with a lit window grid. Front at z = d/2.
export function tower(w = 3, h = 12, d = 3, o = {}) {
  const c = canvas(256, 512), x = c.getContext('2d');
  x.fillStyle = o.color || '#6a8aa8'; x.fillRect(0, 0, 256, 512);
  const r = rng(o.seed || 3);
  for (let j = 0; j < 24; j++) for (let i = 0; i < 6; i++) { x.fillStyle = r() < (o.lit ?? 0.25) ? '#ffe9a8' : (o.glass || '#a8c8e0'); x.fillRect(12 + i * 40, 10 + j * 21, 30, 14); }
  const tex = texFrom(c); const m = toon(tex);
  const side = toon(shade(o.color || '#6a8aa8', -0.2), {wear: false});
  const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
  return ink(geo, [side, side, side, side, m, side], {hull: 0.03});
}

// Instant noodle bowl with noodles, egg and chopsticks.
export function noodleBowl() {
  const g = new THREE.Group();
  g.add(cyl(0.16, 0.1, 0.12, '#f3efe6', {hull: 0.008}));
  const band = cyl(0.161, 0.15, 0.03, '#d8413a', {hull: 0}); at(band, 0, 0.07, 0); g.add(band);
  const soup = cyl(0.15, 0.15, 0.01, '#e8b85a', {hull: 0}); at(soup, 0, 0.11, 0); g.add(soup);
  for (let i = 0; i < 5; i++) { const n = new THREE.Mesh(new THREE.TorusGeometry(0.04 + i * 0.015, 0.006, 4, 16), toon('#f2d98a', {wear: false})); n.rotation.x = Math.PI / 2; n.position.set(0.01 * i, 0.122, 0); g.add(n); }
  for (const s of [-1, 1]) { const st = cyl(0.006, 0.006, 0.36, '#c9935a', {hull: 0.003}); at(st, 0.05 + s * 0.02, 0.1, 0, 0, 0, -0.5); g.add(st); }
  return g;
}

// Nasi bungkus: rice wrapped in brown paper on a banana leaf.
export function nasiBungkus() {
  const g = new THREE.Group();
  const leaf = ball(0.18, '#5f9e42', {sx: 1.4, sy: 0.06, sz: 1.0, seg: 12, hull: 0.008}); g.add(leaf);
  const rice = ball(0.1, '#fbf6ea', {sy: 0.55, hull: 0.008}); at(rice, 0, 0.03, 0); g.add(rice);
  const paper = box(0.2, 0.012, 0.16, '#c9a272', {hull: 0.004}); at(paper, -0.12, 0.0, 0.08, 0.5, 0, 0.6); g.add(paper);
  const egg = ball(0.035, '#f2c94c', {sy: 0.5, hull: 0.004}); at(egg, 0.06, 0.06, 0.03); g.add(egg);
  return g;
}

// Angkringan: a wooden street-food cart with a tarp roof, kettles and two oil lamps. Front at z ~ 0.45.
// Returns {group, lamps: [[x, y, z], ...]} (flame positions, location-local offsets from the cart origin).
export function angkringan(label = '', o = {}) {
  const g = new THREE.Group();
  const body = box(2.0, 0.95, 0.9, toon('#8a5a3a', {paint: {planks: 5, seed: 101}})); g.add(body);
  const top = box(2.1, 0.06, 1.0, '#6a4a32'); at(top, 0, 0.95, 0); g.add(top);
  for (const x of [-0.95, 0.95]) for (const z of [-0.4, 0.4]) { const p = cyl(0.035, 0.035, 1.25, '#5a3a2a'); at(p, x, 0.95, z); g.add(p); }
  const tarp = box(2.5, 0.05, 1.5, toon(o.tarp || '#d8642a', {paint: {stripes: {n: 6, color: '#e8a83a'}, seed: 102}}), {hull: 0.015}); at(tarp, 0, 2.2, 0, 0, -0.08); g.add(tarp);
  for (const [x, c] of [[-0.6, '#3a3a40'], [-0.25, '#4a4a52']]) { const k = cyl(0.11, 0.13, 0.22, c, {hull: 0.008}); at(k, x, 1.0, -0.1); g.add(k); const sp = cyl(0.015, 0.02, 0.12, c, {hull: 0}); at(sp, x + 0.12, 1.12, -0.1, 0, 0, -0.9); g.add(sp); }
  for (let i = 0; i < 6; i++) { const b = ball(0.06, '#c9a272', {sx: 1.3, sy: 0.7, hull: 0.005}); at(b, 0.15 + (i % 3) * 0.16, 1.02, 0.05 + Math.floor(i / 3) * 0.16); g.add(b); }
  for (let i = 0; i < 4; i++) { const sk = cyl(0.008, 0.008, 0.24, '#c9935a', {hull: 0}); at(sk, 0.72 + (i % 2) * 0.06, 1.0, -0.15 + i * 0.06, 0, 0.2); g.add(sk); }
  if (label) { const s = sign(label, 1.4, 0.32, {bg: '#f3e7d3', fg: '#5a2a1a', frame: '#5a3a2a'}); at(s, 0, 1.8, 0.5); g.add(s); }
  const lamps = [];
  for (const x of [-0.85, 0.85]) { const l = cyl(0.04, 0.05, 0.14, '#4a4a52', {hull: 0.005}); at(l, x, 1.6, 0.45); g.add(l); lamps.push([x, 1.8, 0.45]); }
  const bench = box(2.0, 0.42, 0.3, toon('#7a5236', {paint: {planks: 2, seed: 103}})); at(bench, 0, 0, 1.15); g.add(bench);
  return {group: g, lamps};
}

// Wooden village house on short stilts with a palm-leaf roof.
export function villageHouse(o = {}) {
  const g = new THREE.Group();
  for (const x of [-1.3, 1.3]) for (const z of [-1.0, 0.8]) { const p = cyl(0.08, 0.08, 0.5, '#5a3a2a'); at(p, x, 0, z - 1.2); g.add(p); }
  const body = box(3.0, 2.0, 2.2, toon(o.color || '#b8865a', {paint: {planks: 9, seed: 104}})); at(body, 0, 0.5, -1.3); g.add(body);
  const roof = gableRoof(3.0, 2.2, 1.2, o.roof || '#8a6a3a'); at(roof, 0, 2.5, -1.3); g.add(roof);
  const door = box(0.7, 1.4, 0.06, '#5a3a2a'); at(door, 0.6, 0.5, -0.17); g.add(door);
  const win = box(0.7, 0.6, 0.06, '#3a2a22'); at(win, -0.7, 1.3, -0.17); g.add(win);
  const steps = box(0.8, 0.25, 0.4, '#7a5236'); at(steps, 0.6, 0, 0.05); g.add(steps);
  return g;
}

// Vegetable bed rows (garden): returns a group of soil rows with leafy plants.
export function gardenRows(n = 4, len = 4, seed = 9) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const row = box(len, 0.18, 0.5, toon('#6a4a32', {paint: {seed: 105 + i}}), {edges: false}); at(row, 0, 0, i * 0.85); g.add(row);
    for (let k = 0; k < len / 0.45; k++) { const pl = ball(0.13 + r() * 0.05, ['#6fae4a', '#5f9e42', '#8ac45a'][k % 3], {sy: 0.8, seg: 10, hull: 0.008}); at(pl, -len / 2 + 0.25 + k * 0.45, 0.25, i * 0.85); g.add(pl); if (k % 4 === 1) { const t = ball(0.05, '#d8413a', {hull: 0.005}); at(t, -len / 2 + 0.3 + k * 0.45, 0.33, i * 0.85 + 0.1); g.add(t); } }
  }
  return g;
}

// ================= "Misi beli telur" story props =================
// A supermarket shelf run along +x (front at z=0): three shelf boards packed with colourful product boxes.
export function shelfRow(len = 6, o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 21);
  const back = box(len, 2.1, 0.5, toon(o.color || '#e8e4dc', {wear: false})); at(back, len / 2, 0, -0.25); g.add(back);
  const cols = o.colors || ['#d8413a', '#f2d24a', '#4f8fc8', '#7fa35a', '#e8823a', '#9a6fb0', '#e0626e', '#5ab8b0'];
  for (const y of [0.05, 0.6, 1.15, 1.7]) {
    const b = box(len, 0.05, 0.55, '#b8bcc4', {edges: false}); at(b, len / 2, y, -0.02); g.add(b);
    let x = 0.1;
    while (x < len - 0.25) {
      const w = 0.16 + r() * 0.16, h = 0.25 + r() * 0.25, c = cols[Math.floor(r() * cols.length)];
      const p = o.bags ? ball(w * 0.6, c, {sx: 1, sy: h / w * 1.1, sz: 0.5, seg: 10, hull: 0.006}) : box(w, h, 0.3, c, {hull: 0.006, edges: false});
      at(p, x + w / 2, y + 0.05 + (o.bags ? h * 0.5 : 0), -0.05); g.add(p); x += w + 0.03;
    }
  }
  return g;
}

// Price tag texture with a big "49" and small ".900" (charm pricing).
export function priceTag(big = 'Rp49', small = '.900', o = {}) {
  const c = canvas(1024, 512), x = c.getContext('2d');
  x.fillStyle = o.bg || '#f2d24a'; x.fillRect(0, 0, 1024, 512); x.strokeStyle = INK; x.lineWidth = 24; x.strokeRect(12, 12, 1000, 488);
  x.fillStyle = '#d8413a'; x.fillRect(12, 12, 1000, 90); x.fillStyle = '#fff3df'; x.font = '900 70px "Inter Display"'; x.textAlign = 'center'; x.fillText(o.head || 'PROMO!', 512, 82);
  x.fillStyle = INK; x.textAlign = 'right'; x.font = '900 300px "Inter Display"'; x.fillText(big, 700, 420);
  x.textAlign = 'left'; x.font = '900 110px "Inter Display"'; x.fillText(small, 712, 280);
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.2, 0.6, 0.04);
  const m = new THREE.Mesh(geo, [toon('#c9a040'), toon('#c9a040'), toon('#c9a040'), toon('#c9a040'), toon(texFrom(c)), toon('#c9a040')]); g.add(m);
  return g;
}

// Shopping bag (paper/plastic) with handles.
export function shopBag(color = '#f3efe6', o = {}) {
  const g = new THREE.Group();
  g.add(box(0.36, 0.42, 0.2, toon(color, {wear: false}), {hull: 0.008}));
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16, Math.PI), toon(o.handle || '#5a4a3a', {wear: false})); h.position.y = 0.42; g.add(h);
  for (let i = 0; i < 3; i++) { const p = box(0.1, 0.12, 0.08, ['#d8413a', '#f2d24a', '#4f8fc8'][i], {hull: 0.004}); at(p, -0.1 + i * 0.1, 0.42, 0); g.add(p); }
  return g;
}

// Egg tray with eggs.
export function eggTray(n = 10) {
  const g = new THREE.Group();
  g.add(box(0.5, 0.05, 0.22, '#c9b48a', {hull: 0.006}));
  for (let i = 0; i < n; i++) { const e = ball(0.035, '#f3e3c8', {sy: 1.25, hull: 0.004}); at(e, -0.2 + (i % 5) * 0.1, 0.08, -0.05 + Math.floor(i / 5) * 0.1); g.add(e); }
  return g;
}

// Sausage tester: a small plate with sausage bites on toothpicks.
export function sausagePlate() {
  const g = new THREE.Group();
  g.add(cyl(0.18, 0.16, 0.03, '#fbf6ea', {hull: 0.006}));
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const s = cyl(0.025, 0.025, 0.06, '#c85a3a', {hull: 0.004, center: true}); at(s, Math.cos(a) * 0.1, 0.06, Math.sin(a) * 0.1, 0, 0, Math.PI / 2); g.add(s); const tp = cyl(0.003, 0.003, 0.08, '#e8d8a8', {hull: 0}); at(tp, Math.cos(a) * 0.1, 0.08, Math.sin(a) * 0.1); g.add(tp); }
  return g;
}

// Checkout candy rack: short shelves of chocolate bars and lollipops.
export function candyRack() {
  const g = new THREE.Group();
  g.add(box(0.9, 1.2, 0.35, toon('#4f8fc8', {wear: false})));
  for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) { const b = box(0.11, 0.2, 0.04, ['#6a3a2a', '#d8413a', '#f2d24a', '#9a6fb0'][(i + k) % 4], {hull: 0.004}); at(b, -0.32 + i * 0.13, 0.3 + k * 0.32, 0.19, 0, -0.2); g.add(b); }
  for (let i = 0; i < 5; i++) { const st = cyl(0.006, 0.006, 0.22, '#fbf6ea', {hull: 0}); at(st, -0.3 + i * 0.15, 1.2, 0.05); g.add(st); const l = ball(0.05, ['#e0626e', '#f2d24a', '#7fc4e8', '#7fa35a', '#e8823a'][i], {sz: 0.4, hull: 0.005}); at(l, -0.3 + i * 0.15, 1.45, 0.05); g.add(l); }
  return g;
}
