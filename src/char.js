// 2D flat characters standing in the 3D world. One base design; variants by palette, hat, glasses.
// Acting: expressions (face layer swapped per frame from a texture cache), poses (two-segment arms),
// actions (jump, hop, shake, nod, tremble, slump, talk, walk, run, spin-in) with squash & stretch.
import * as THREE from 'three';
import {INK, rng, canvas, texFrom} from './kit';

const PX = 420; // canvas pixels per metre

// Character DESIGNS: each video picks one (setCharDesign) so every story has its own look.
//   head: 'round' | 'egg' | 'bean'; hair: 'fringe' | 'side' | 'tuft'; skin; brows: 'thin' | 'thick';
//   limb: stick widths [top, bottom]; legExtra: extra leg length (m); shading: painted light/shadow on every part;
//   shadows: characters cast real shadows on the ground and walls.
export const DESIGNS = {
  classic: {head: 'round', hair: 'fringe', skin: '#f6dfc8', brows: 'thin', limb: [9, 5], legExtra: 0, shading: false, shadows: false},
  egg: {head: 'egg', hair: 'side', skin: '#fbf1e6', brows: 'thick', limb: [7, 4], legExtra: 0.04, torsoExtra: 0.16, cheeks: false, shading: true, shadows: true},
  bean: {head: 'bean', hair: 'tuft', skin: '#f3d9bd', brows: 'thick', limb: [10, 7], legExtra: -0.04, shading: true, shadows: true},
};
let D = DESIGNS.classic;
let SKIN = D.skin;
export function setCharDesign(name) { D = DESIGNS[name] || DESIGNS.classic; SKIN = D.skin; }
// How much higher the head sits than in the classic design (cameras aimed at faces add this).
export const headLift = (name) => { const d = DESIGNS[name] || DESIGNS.classic; return (d.legExtra || 0) + (d.torsoExtra || 0); };
// Shared tint for every character part (set per frame from the scene light, so characters sit in the light).
export const CHAR_TINT = new THREE.Color('#ffffff');
const SHADE = 'rgba(64,38,58,';
// Painted shading inside a closed shape: light from the upper left, soft core shadow on the lower right.
function paintShade(x, pts, cx, cy, R, amt = 0.3) {
  if (!D.shading) return;
  x.save(); x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.clip();
  const g = x.createRadialGradient(cx - R * 0.4, cy - R * 0.5, R * 0.15, cx - R * 0.4, cy - R * 0.5, R * 1.95);
  g.addColorStop(0, SHADE + '0)'); g.addColorStop(0.5, SHADE + '0)'); g.addColorStop(0.72, SHADE + (amt * 0.6) + ')'); g.addColorStop(1, SHADE + amt + ')');
  x.fillStyle = g; x.fillRect(cx - R * 3, cy - R * 3, R * 6, R * 6);
  x.restore();
}
const HEAD_W = 0.86, HEAD_H = 1.0, HEAD_CY = 0.62, HEAD_R = 0.29; // head canvas (metres); centre from top
const headRY = () => (D.head === 'egg' ? 1.17 : D.head === 'bean' ? 0.86 : 0.97);
const headRX = () => (D.head === 'egg' ? 0.93 : D.head === 'bean' ? 1.12 : 1.0);

function smoothPoly(n, fn) { const p = []; for (let i = 0; i < n; i++) p.push(fn(i / n)); return p; }

// Fill a closed polygon, then ink it with a hand-drawn band of varying thickness.
function inkShape(x, pts, fill, r, base = 10, shade) {
  x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath();
  if (fill) { x.fillStyle = fill; x.fill(); }
  if (shade) shade(pts);
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
function partMesh(tex, wM, hM, castsShadow = true) {
  const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide});
  mat.color = CHAR_TINT;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wM, hM), mat);
  m.castShadow = D.shadows && castsShadow;
  if (m.castShadow) m.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide});
  return m;
}

// ---------- head base: skin, cheeks, hair, hat ----------
function drawHeadBase(o, r) {
  const c = canvas(HEAD_W * PX, HEAD_H * PX), x = c.getContext('2d');
  const cx = HEAD_W / 2 * PX, cy = HEAD_CY * PX, R = HEAD_R * PX;
  const RX = R * headRX(), RY = R * headRY();
  const headPts = D.head === 'egg'
    ? wobble(smoothPoly(64, (t) => { const a = t * Math.PI * 2; return [cx + Math.cos(a) * RX * (1 - 0.09 * Math.sin(a)), cy + Math.sin(a) * RY]; }), r, 2)
    : wobble(ellipse(cx, cy, RX, RY, 64), r, 2);
  inkShape(x, headPts, SKIN, r, 11, (pts) => paintShade(x, pts, cx, cy, Math.max(RX, RY), 0.42));
  if (D.cheeks !== false) {
    x.fillStyle = 'rgba(232,140,120,0.35)';
    x.beginPath(); x.ellipse(cx - R * 0.52, cy + R * 0.3, R * 0.13, R * 0.08, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(cx + R * 0.52, cy + R * 0.3, R * 0.13, R * 0.08, 0, 0, 7); x.fill();
  }
  const fr = [];
  const hx = (a, k = 1.02) => cx + Math.cos(a) * RX * k * (D.head === 'egg' ? 1 - 0.09 * Math.sin(a) : 1), hy = (a, k = 1.02) => cy + Math.sin(a) * RY * k;
  const hairStyle = o.hairStyle || D.hair;
  if (hairStyle === 'side') { // side-swept hair: covers the crown, sweeps down over one temple
    for (let i = 0; i <= 40; i++) { const a = Math.PI * (1.06 + 0.9 * i / 40); fr.push([hx(a), hy(a)]); }
    fr.push([cx + RX * 0.62, cy - RY * 0.66]);
    fr.push([cx + RX * 0.2, cy - RY * 0.62]); fr.push([cx - RX * 0.3, cy - RY * 0.5]); fr.push([cx - RX * 0.7, cy - RY * 0.3]); fr.push([cx - RX * 0.95, cy - RY * 0.12]);
  } else if (hairStyle === 'tuft') { // short cap of hair with a tuft on top
    for (let i = 0; i <= 40; i++) { const a = Math.PI * (1.12 + 0.76 * i / 40); fr.push([hx(a), hy(a)]); }
    for (let i = 0; i <= 12; i++) { const t = 1 - i / 12; fr.push([cx + (t - 0.5) * 2 * RX * 0.8, cy - RY * 0.6 + Math.sin(t * Math.PI) * RY * 0.06]); }
  } else {
    for (let i = 0; i <= 40; i++) { const a = Math.PI * (1.08 + 0.84 * i / 40); fr.push([hx(a), hy(a)]); }
    for (let i = 0; i <= 24; i++) {
      const t = 1 - i / 24, xx = cx + (t - 0.5) * 2 * RX * 0.9;
      fr.push([xx, cy - RY * 0.42 + Math.abs(Math.sin(t * Math.PI * 4)) * R * 0.2]);
    }
  }
  inkShape(x, fr, o.hair, r, 9, (pts) => paintShade(x, pts, cx, cy, Math.max(RX, RY), 0.3));
  if (D.shading && (!o.hat || o.hat === 'none')) { // glossy hair streak
    x.save(); x.strokeStyle = 'rgba(255,255,255,0.13)'; x.lineCap = 'round'; x.lineWidth = R * 0.1; x.filter = 'blur(3px)';
    x.beginPath(); x.arc(cx, cy, Math.max(RX, RY) * 0.82, Math.PI * 1.22, Math.PI * 1.45); x.stroke();
    x.restore();
  }
  if (hairStyle === 'tuft' && o.hat === 'none') inkShape(x, ellipse(cx + RX * 0.1, cy - RY * 1.02, RX * 0.22, RY * 0.16, 30), o.hair, r, 8);
  const top = cy - RY;
  if (o.hat === 'cap') {
    inkShape(x, ellipse(cx, top + R * 0.42, R * 0.98, R * 0.62, 40, Math.PI, Math.PI * 2).concat([[cx + R * 0.98, top + R * 0.42]]), o.hatColor, r, 10, (pts) => paintShade(x, pts, cx, top, R * 1.3, 0.3));
    inkShape(x, [[cx - R * 0.95, top + R * 0.36], [cx + R * 1.45, top + R * 0.36], [cx + R * 1.4, top + R * 0.5], [cx - R * 0.95, top + R * 0.5]], o.hatColor2 || o.hatColor, r, 9);
  } else if (o.hat === 'bowler') {
    inkShape(x, ellipse(cx, top + R * 0.25, R * 0.82, R * 0.75, 40, Math.PI, Math.PI * 2), o.hatColor, r, 10, (pts) => paintShade(x, pts, cx, top, R * 1.3, 0.3));
    inkShape(x, ellipse(cx, top + R * 0.27, R * 1.25, R * 0.13, 40), o.hatColor, r, 9);
  } else if (o.hat === 'top') {
    inkShape(x, [[cx - R * 0.62, top - R * 0.85], [cx + R * 0.62, top - R * 0.85], [cx + R * 0.68, top + R * 0.25], [cx - R * 0.68, top + R * 0.25]], o.hatColor, r, 10, (pts) => paintShade(x, pts, cx, top, R * 1.3, 0.3));
    inkShape(x, ellipse(cx, top + R * 0.27, R * 1.15, R * 0.13, 40), o.hatColor, r, 9);
  }
  return texFrom(c);
}

// ---------- face layer: eyes, brows, mouth, extras ----------
export const EXPRESSIONS = {
  neutral: {eyes: 'calm', brows: 'none', mouth: 'smile'},
  happy: {eyes: 'closed', brows: 'up', mouth: 'grin'},
  laugh: {eyes: 'closed', brows: 'up', mouth: 'laugh', extras: ['blush']},
  excited: {eyes: 'open', brows: 'up', mouth: 'laugh', extras: ['sparkle']},
  surprised: {eyes: 'open', brows: 'up', mouth: 'open'},
  shocked: {eyes: 'wide', brows: 'up', mouth: 'shout', extras: ['shock', 'sweat']},
  annoyed: {eyes: 'angry', brows: 'angry', mouth: 'frown'},
  angry: {eyes: 'angry', brows: 'angry', mouth: 'frown', extras: ['anger']},
  furious: {eyes: 'angry', brows: 'angry', mouth: 'shout', extras: ['anger', 'shock']},
  sad: {eyes: 'sad', brows: 'sad', mouth: 'frown'},
  cry: {eyes: 'sad', brows: 'sad', mouth: 'wavy', extras: ['tear']},
  worried: {eyes: 'open', brows: 'sad', mouth: 'wavy', extras: ['sweat']},
  confused: {eyes: 'open', brows: 'skeptic', mouth: 'flat', extras: ['question']},
  tired: {eyes: 'tired', brows: 'sad', mouth: 'flat', extras: ['gloom']},
  smug: {eyes: 'calm', brows: 'skeptic', mouth: 'smirk'},
  thinking: {eyes: 'calm', brows: 'skeptic', mouth: 'flat'},
  proud: {eyes: 'closed', brows: 'up', mouth: 'smile', extras: ['blush', 'sparkle']},
  determined: {eyes: 'open', brows: 'angry', mouth: 'grin'},
  disgusted: {eyes: 'squint', brows: 'angry', mouth: 'wavy'},
  sleep: {eyes: 'blink', brows: 'none', mouth: 'flat'},
  drowsy: {eyes: 'tired', brows: 'sad', mouth: 'wavy', extras: ['gloom']},
  paranoid: {eyes: 'squint', brows: 'angry', mouth: 'wavy', extras: ['sweat']},
  // teeth showing
  grimace: {eyes: 'wide', brows: 'sad', mouth: 'teeth', extras: ['sweat']},
  nervous: {eyes: 'open', brows: 'sad', mouth: 'teethSmall', extras: ['sweat']},
  toothy: {eyes: 'closed', brows: 'up', mouth: 'toothy', extras: ['blush']},
  cheesy: {eyes: 'open', brows: 'up', mouth: 'toothy', extras: ['sparkle']},
  scream: {eyes: 'wide', brows: 'up', mouth: 'scream', extras: ['shock', 'sweat']},
  gritted: {eyes: 'angry', brows: 'angry', mouth: 'teeth', extras: ['anger']},
  scheming: {eyes: 'calm', brows: 'skeptic', mouth: 'teethSmirk'},
};

function drawFace(o, f, r) {
  const c = canvas(HEAD_W * PX, HEAD_H * PX), x = c.getContext('2d');
  const cx = HEAD_W / 2 * PX, cy = HEAD_CY * PX, R = HEAD_R * PX;
  x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = INK;
  const lid = (ex, ey, s, kind) => { // skin cover over the top of an eye, inner = towards the nose
    const w = R * 0.15, top = ey - R * 0.2;
    let yi, yo; // lid edge at inner and outer side
    if (kind === 'calm') { yi = yo = ey - R * 0.01; }
    if (kind === 'angry') { yi = ey + R * 0.03; yo = ey - R * 0.08; }
    if (kind === 'sad') { yi = ey - R * 0.08; yo = ey + R * 0.03; }
    if (kind === 'tired') { yi = yo = ey + R * 0.03; }
    const xi = ex - s * w, xo = ex + s * w;
    x.fillStyle = SKIN; x.beginPath(); x.moveTo(xi, top); x.lineTo(xo, top); x.lineTo(xo, yo); x.lineTo(xi, yi); x.closePath(); x.fill();
    x.lineWidth = 8; x.beginPath(); x.moveTo(xi, yi); x.lineTo(xo, yo); x.stroke();
  };
  for (const s of [-1, 1]) {
    const ex = cx + s * R * 0.36, ey = cy + R * 0.05;
    const dot = (rx, ry) => { x.fillStyle = INK; x.beginPath(); x.ellipse(ex, ey, rx, ry, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + R * 0.03, ey - R * 0.02, R * 0.028, 0, 7); x.fill(); };
    switch (f.eyes) {
      case 'open': dot(R * 0.1, R * 0.13); break;
      case 'wide':
        x.fillStyle = '#fff'; x.lineWidth = 7; x.beginPath(); x.arc(ex, ey, R * 0.17, 0, 7); x.fill(); x.stroke();
        x.fillStyle = INK; x.beginPath(); x.arc(ex, ey, R * 0.055, 0, 7); x.fill(); break;
      case 'closed': x.lineWidth = 9; x.beginPath(); x.arc(ex, ey + R * 0.06, R * 0.12, Math.PI * 1.12, Math.PI * 1.88); x.stroke(); break;
      case 'blink': x.lineWidth = 8; x.beginPath(); x.moveTo(ex - R * 0.12, ey + R * 0.02); x.quadraticCurveTo(ex, ey + R * 0.07, ex + R * 0.12, ey + R * 0.02); x.stroke(); break;
      case 'squint': x.lineWidth = 9; x.beginPath(); x.moveTo(ex - s * R * 0.12, ey - R * 0.07); x.lineTo(ex + s * R * 0.08, ey); x.lineTo(ex - s * R * 0.12, ey + R * 0.07); x.stroke(); break;
      default: dot(R * 0.1, R * 0.12); lid(ex, ey, s, f.eyes === 'calm' ? 'calm' : f.eyes);
    }
    // brows
    const by = ey - R * 0.27; x.lineWidth = D.brows === 'thick' ? 14 : 9;
    const brow = (yi, yo) => { x.beginPath(); x.moveTo(ex - s * R * 0.13, by + yi); x.lineTo(ex + s * R * 0.13, by + yo); x.stroke(); };
    if (f.brows === 'up') { x.beginPath(); x.arc(ex, by + R * 0.02, R * 0.14, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); }
    if (f.brows === 'angry') brow(R * 0.1, -R * 0.05);
    if (f.brows === 'sad') brow(-R * 0.07, R * 0.06);
    if (f.brows === 'none' && D.brows === 'thick') brow(-R * 0.02, -R * 0.04);
    if (f.brows === 'skeptic') brow(s < 0 ? -R * 0.08 : R * 0.03, s < 0 ? -R * 0.1 : R * 0.03);
  }
  // mouth
  const my = cy + R * 0.34, mx = cx; x.lineWidth = 7;
  const openShape = (w, h, tongue) => {
    x.fillStyle = '#5a2328'; x.beginPath(); x.ellipse(mx, my, w, h, 0, 0, 7); x.fill(); x.lineWidth = 7; x.stroke();
    if (tongue) { x.save(); x.beginPath(); x.ellipse(mx, my, w, h, 0, 0, 7); x.clip(); x.fillStyle = '#e8737a'; x.beginPath(); x.ellipse(mx, my + h * 0.8, w * 0.7, h * 0.55, 0, 0, 7); x.fill(); x.restore(); }
  };
  const dShape = (w, h) => {
    x.fillStyle = '#5a2328'; x.beginPath(); x.moveTo(mx - w, my - h * 0.2); x.quadraticCurveTo(mx, my - h * 0.35, mx + w, my - h * 0.2); x.quadraticCurveTo(mx + w * 0.8, my + h, mx, my + h); x.quadraticCurveTo(mx - w * 0.8, my + h, mx - w, my - h * 0.2); x.closePath(); x.fill(); x.stroke();
    x.save(); x.clip(); x.fillStyle = '#e8737a'; x.beginPath(); x.ellipse(mx, my + h * 0.95, w * 0.6, h * 0.45, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillRect(mx - w, my - h * 0.4, w * 2, h * 0.28); x.restore();
  };
  // clenched teeth: rounded box with a tooth grid
  const teethBox = (w, h, dy = 0) => {
    const x0 = mx - w, y0 = my - h + dy, rr = h * 0.7;
    x.beginPath(); x.moveTo(x0 + rr, y0); x.lineTo(x0 + 2 * w - rr, y0); x.quadraticCurveTo(x0 + 2 * w, y0, x0 + 2 * w, y0 + rr); x.lineTo(x0 + 2 * w, y0 + 2 * h - rr);
    x.quadraticCurveTo(x0 + 2 * w, y0 + 2 * h, x0 + 2 * w - rr, y0 + 2 * h); x.lineTo(x0 + rr, y0 + 2 * h); x.quadraticCurveTo(x0, y0 + 2 * h, x0, y0 + 2 * h - rr); x.lineTo(x0, y0 + rr); x.quadraticCurveTo(x0, y0, x0 + rr, y0); x.closePath();
    x.fillStyle = '#fffdf6'; x.fill(); x.save(); x.clip(); x.lineWidth = 4;
    x.beginPath(); x.moveTo(x0, y0 + h); x.lineTo(x0 + 2 * w, y0 + h); for (let i = 1; i < 6; i++) { const xx = x0 + 2 * w * i / 6; x.moveTo(xx, y0); x.lineTo(xx, y0 + 2 * h); } x.stroke(); x.restore();
    x.lineWidth = 7; x.stroke();
  };
  // big smile showing the upper teeth
  const toothy = (w, h) => {
    x.beginPath(); x.moveTo(mx - w, my - h * 0.25); x.quadraticCurveTo(mx, my - h * 0.1, mx + w, my - h * 0.25); x.quadraticCurveTo(mx + w * 0.85, my + h, mx, my + h); x.quadraticCurveTo(mx - w * 0.85, my + h, mx - w, my - h * 0.25); x.closePath();
    x.fillStyle = '#5a2328'; x.fill(); x.save(); x.clip();
    x.fillStyle = '#e8737a'; x.beginPath(); x.ellipse(mx, my + h * 1.0, w * 0.55, h * 0.4, 0, 0, 7); x.fill();
    x.fillStyle = '#fffdf6'; x.fillRect(mx - w, my - h * 0.5, w * 2, h * 0.75); x.lineWidth = 4; x.beginPath();
    for (let i = 1; i < 6; i++) { const xx = mx - w + 2 * w * i / 6; x.moveTo(xx, my - h * 0.5); x.lineTo(xx, my + h * 0.25); } x.moveTo(mx - w, my + h * 0.25); x.lineTo(mx + w, my + h * 0.25); x.stroke(); x.restore();
    x.lineWidth = 7; x.beginPath(); x.moveTo(mx - w, my - h * 0.25); x.quadraticCurveTo(mx, my - h * 0.1, mx + w, my - h * 0.25); x.quadraticCurveTo(mx + w * 0.85, my + h, mx, my + h); x.quadraticCurveTo(mx - w * 0.85, my + h, mx - w, my - h * 0.25); x.closePath(); x.stroke();
  };
  switch (f.mouth) {
    case 'teeth': teethBox(R * 0.22, R * 0.085); break;
    case 'teethSmall': teethBox(R * 0.15, R * 0.065); break;
    case 'teethSmirk': x.save(); x.translate(mx, my); x.rotate(-0.18); x.translate(-mx, -my); teethBox(R * 0.16, R * 0.06); x.restore(); break;
    case 'toothy': toothy(R * 0.24, R * 0.2); break;
    case 'scream': {
      x.fillStyle = '#5a2328'; x.beginPath(); x.ellipse(mx, my + R * 0.04, R * 0.18, R * 0.24, 0, 0, 7); x.fill();
      x.save(); x.clip(); x.fillStyle = '#e8737a'; x.beginPath(); x.ellipse(mx, my + R * 0.26, R * 0.12, R * 0.08, 0, 0, 7); x.fill();
      x.fillStyle = '#fffdf6'; x.fillRect(mx - R * 0.2, my - R * 0.22, R * 0.4, R * 0.08); x.fillRect(mx - R * 0.2, my + R * 0.2, R * 0.4, R * 0.07);
      x.lineWidth = 3; x.beginPath(); for (let i = 1; i < 5; i++) { const xx = mx - R * 0.2 + R * 0.4 * i / 5; x.moveTo(xx, my - R * 0.22); x.lineTo(xx, my - R * 0.14); x.moveTo(xx, my + R * 0.2); x.lineTo(xx, my + R * 0.27); } x.stroke(); x.restore();
      x.lineWidth = 7; x.beginPath(); x.ellipse(mx, my + R * 0.04, R * 0.18, R * 0.24, 0, 0, 7); x.stroke(); break;
    }
    case 'grin': dShape(R * 0.2, R * 0.16); break;
    case 'laugh': dShape(R * 0.26, R * 0.26); break;
    case 'open': openShape(R * 0.08, R * 0.1, false); break;
    case 'shout': openShape(R * 0.16, R * 0.2, true); break;
    case 'talkA': openShape(R * 0.09, R * 0.06, false); break;
    case 'talkB': openShape(R * 0.12, R * 0.12, true); break;
    case 'frown': x.beginPath(); x.arc(mx, my + R * 0.12, R * 0.13, 1.25 * Math.PI, 1.75 * Math.PI); x.stroke(); break;
    case 'flat': x.beginPath(); x.moveTo(mx - R * 0.1, my); x.lineTo(mx + R * 0.1, my); x.stroke(); break;
    case 'wavy': x.beginPath(); for (let i = 0; i <= 6; i++) { const xx = mx - R * 0.15 + i * R * 0.05, yy = my + (i % 2 ? -1 : 1) * R * 0.03; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); break;
    case 'smirk': x.beginPath(); x.moveTo(mx - R * 0.1, my + R * 0.01); x.quadraticCurveTo(mx + R * 0.04, my + R * 0.06, mx + R * 0.14, my - R * 0.05); x.stroke(); break;
    default: x.beginPath(); x.arc(mx, my - R * 0.02, R * 0.12, 0.25 * Math.PI, 0.75 * Math.PI); x.stroke();
  }
  if (o.glasses) {
    x.lineWidth = 7;
    for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * R * 0.36, cy + R * 0.04, R * 0.2, 0, 7); x.stroke(); }
    x.beginPath(); x.moveTo(cx - R * 0.16, cy); x.lineTo(cx + R * 0.16, cy); x.stroke();
  }
  // extras
  for (const e of (f.extras || []).filter((e) => D.cheeks !== false || (e !== 'blush' && e !== 'anger'))) {
    if (e === 'blush') { x.fillStyle = 'rgba(232,110,110,0.55)'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(cx + s * R * 0.55, cy + R * 0.3, R * 0.17, R * 0.09, 0, 0, 7); x.fill(); } }
    if (e === 'sweat') { const sx = cx + R * 0.95, sy = cy - R * 0.55; x.fillStyle = '#8fd0ef'; x.lineWidth = 6; x.beginPath(); x.moveTo(sx, sy - R * 0.2); x.quadraticCurveTo(sx + R * 0.14, sy + R * 0.02, sx, sy + R * 0.08); x.quadraticCurveTo(sx - R * 0.14, sy + R * 0.02, sx, sy - R * 0.2); x.fill(); x.stroke(); }
    if (e === 'tear') { x.fillStyle = '#8fd0ef'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(cx + s * R * 0.4, cy + R * 0.35, R * 0.06, R * 0.16, 0, 0, 7); x.fill(); } }
    if (e === 'anger') { const ax = cx + R * 0.98, ay = cy - R * 0.2; x.strokeStyle = '#d8413a'; x.lineWidth = 9; for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { x.beginPath(); x.arc(ax + a * R * 0.13, ay + b * R * 0.13, R * 0.1, 0, 7); x.stroke(); } x.strokeStyle = INK; }
    if (e === 'shock') { x.lineWidth = 8; for (const a of [-0.5, 0, 0.5]) { const bx = cx + Math.sin(a) * R * 1.25, by2 = cy - Math.cos(a) * R * 1.25; x.beginPath(); x.moveTo(bx, by2); x.lineTo(cx + Math.sin(a) * R * 1.55, cy - Math.cos(a) * R * 1.55); x.stroke(); } }
    if (e === 'question') { x.fillStyle = INK; x.font = `900 ${R * 0.9}px "Inter Display"`; x.textAlign = 'center'; x.fillText('?', cx + R * 1.05, cy - R * 0.6); }
    if (e === 'sparkle') { x.fillStyle = '#f2c94c'; x.lineWidth = 5; for (const [sx, sy, k] of [[cx + R * 1.05, cy - R * 0.75, 1], [cx - R * 1.1, cy - R * 0.5, 0.7]]) { x.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28, rr = (i % 2 ? 0.07 : 0.2) * R * k; x.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); } }
    if (e === 'gloom') { x.strokeStyle = 'rgba(80,70,140,0.75)'; x.lineWidth = 6; for (let i = 0; i < 5; i++) { const gx = cx - R * 0.4 + i * R * 0.2; x.beginPath(); x.moveTo(gx, cy - R * 0.62); x.lineTo(gx, cy - R * 0.3); x.stroke(); } x.strokeStyle = INK; }
  }
  return texFrom(c);
}

function drawTorso(o, r) {
  const TX = D.torsoExtra || 0;
  const W = 0.66, H = 0.74 + TX, c = canvas(W * PX, H * PX), x = c.getContext('2d');
  const cx = W / 2 * PX, top = 0.06 * PX, bot = (0.68 + TX) * PX, tw = 0.15 * PX, bw = 0.25 * PX;
  const hw = (t) => {
    let w = tw + (bw - tw) * Math.pow(Math.sin(Math.min(1, t / 0.82) * Math.PI / 2), 1.3);
    if (t > 0.82) w = bw * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.82) / 0.18, 2)));
    if (t < 0.12) w *= Math.sqrt(1 - Math.pow((0.12 - t) / 0.12, 2)) * 0.5 + 0.5;
    return w;
  };
  const L = [], Rr = [];
  for (let i = 0; i <= 30; i++) { const t = i / 30, y = top + (bot - top) * t; Rr.push([cx + hw(t), y]); L.unshift([cx - hw(t), y]); }
  const pts = wobble(Rr.concat(L), r, 1.5);
  x.save(); x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.clip();
  x.fillStyle = o.jacket; x.fillRect(0, 0, W * PX, H * PX);
  x.fillStyle = o.lower; x.fillRect(0, top + (bot - top) * 0.64, W * PX, H * PX);
  x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); x.moveTo(0, top + (bot - top) * 0.64); x.lineTo(W * PX, top + (bot - top) * 0.64); x.stroke();
  x.restore();
  const py = top + (bot - top) * 0.42, px = cx - bw * 0.58;
  inkShape(x, wobble([[px - 18, py], [px + 18, py], [px + 16, py + 30], [px - 16, py + 30]], r, 2), o.pocket || o.lower, r, 5);
  inkShape(x, [[cx, top + 52], [cx - 36, top + 6], [cx - 6, top + 2]], '#fffdf6', r, 5);
  inkShape(x, [[cx, top + 52], [cx + 36, top + 6], [cx + 6, top + 2]], '#fffdf6', r, 5);
  inkShape(x, [[cx, top + 40], [cx + 11, top + 58], [cx + 7, top + 140], [cx, top + 156], [cx - 7, top + 140], [cx - 11, top + 58]], o.tie, r, 5);
  if (D.shading) {
    x.save(); x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.clip();
    // fabric: fine vertical weave lines
    x.strokeStyle = 'rgba(40,20,30,0.035)'; x.lineWidth = 2;
    for (let xx = cx - bw; xx < cx + bw; xx += 7) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, H * PX); x.stroke(); }
    // round body: dark core on the right, white sheen band on the left like a lit cylinder
    const g = x.createLinearGradient(cx - bw, 0, cx + bw, 0);
    g.addColorStop(0, SHADE + '0.12)'); g.addColorStop(0.18, SHADE + '0)'); g.addColorStop(0.55, SHADE + '0)'); g.addColorStop(0.82, SHADE + '0.26)'); g.addColorStop(1, SHADE + '0.4)');
    x.fillStyle = g; x.fillRect(0, 0, W * PX, H * PX);
    const sh = x.createLinearGradient(cx - bw, 0, cx + bw, 0);
    sh.addColorStop(0.02, 'rgba(255,255,255,0)'); sh.addColorStop(0.24, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.34, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.44, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.62, 'rgba(255,255,255,0)');
    x.fillStyle = sh; x.fillRect(0, 0, W * PX, H * PX);
    // small bright specular glint high on the chest
    const sp = x.createRadialGradient(cx - bw * 0.4, top + (bot - top) * 0.3, 1, cx - bw * 0.4, top + (bot - top) * 0.3, bw * 0.5);
    sp.addColorStop(0, 'rgba(255,255,255,0.14)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sp; x.fillRect(0, 0, W * PX, H * PX);
    const n = x.createRadialGradient(cx, top - 10, 4, cx, top - 10, 0.16 * PX); // shadow of the head on the chest
    n.addColorStop(0, SHADE + '0.3)'); n.addColorStop(1, SHADE + '0)'); x.fillStyle = n; x.fillRect(0, 0, W * PX, H * PX);
    x.restore();
  }
  inkShape(x, pts, null, r, 11);
  return {mesh: partMesh(texFrom(c), W, H), W, H};
}

function drawLimb(len, color, end, r, wTop = 9, wBot = 5) {
  if (D.limb) { wTop = Math.max(3, wTop + D.limb[0] - 9); wBot = Math.max(3, wBot + D.limb[1] - 5); }
  const W = 0.18, H = len + 0.1, c = canvas(W * PX, H * PX), x = c.getContext('2d');
  const cx = W / 2 * PX, top = 0.03 * PX, bot = (len + 0.02) * PX;
  inkShape(x, wobble([[cx - wTop, top], [cx + wTop, top], [cx + wBot, bot], [cx - wBot, bot]], r, 1), color, r, 7, (pts) => {
    if (!D.shading) return; x.save(); x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.clip();
    const g = x.createLinearGradient(cx - wTop, 0, cx + wTop, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,0.12)'); g.addColorStop(0.5, SHADE + '0)'); g.addColorStop(0.62, SHADE + '0)'); g.addColorStop(1, SHADE + '0.38)');
    x.fillStyle = g; x.fillRect(0, 0, W * PX, H * PX); x.restore();
  });
  if (end === 'hand') { x.fillStyle = INK; x.beginPath(); x.arc(cx, bot + 4, 0.05 * PX, 0, 7); x.fill(); }
  if (end === 'shoe') inkShape(x, ellipse(cx + 8, bot + 6, 0.07 * PX, 0.035 * PX, 30), '#3b2a2c', r, 6);
  if (end === 'elbow') { x.fillStyle = color; x.beginPath(); x.arc(cx, bot, wBot + 2, 0, 7); x.fill(); }
  return {mesh: partMesh(texFrom(c), W, H), W, H};
}

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
  hero: {jacket: '#4f9a8a', lower: '#2f4f5a', tie: '#e8c35a', hair: '#2b2326', hat: 'cap', hatColor: '#e8c35a', hatColor2: '#c9a43a'},
  scientist: {jacket: '#eef0ee', lower: '#55606e', tie: '#4f7fa6', hair: '#6a5a52', hat: 'none', glasses: true},
  doctor: {jacket: '#8fc7c0', lower: '#4f7f7a', tie: '#eef0ee', hair: '#3a2a26', hat: 'none'},
  pilot: {jacket: '#2a3a56', lower: '#1f2a40', tie: '#d9a441', hair: '#5a3a2a', hat: 'cap', hatColor: '#2a3a56', hatColor2: '#1f2a40'},
  coworker: {jacket: '#c99a4a', lower: '#55606e', tie: '#4f7fa6', hair: '#3a2a26', hat: 'none', glasses: true},
  friend: {jacket: '#9a6fb0', lower: '#4a3a56', tie: '#e8c35a', hair: '#5a3a2a', hat: 'none'},
  randy: {jacket: '#b8443a', lower: '#3a4a6a', tie: '#f3e7d3', hair: '#8a5a3a', hat: 'none'},
  pal1: {jacket: '#4f7fa6', lower: '#55606e', tie: '#c75b5b', hair: '#2b2326', hat: 'none'},
  pal2: {jacket: '#7fa35a', lower: '#6b4a3a', tie: '#e8c35a', hair: '#4a3026', hat: 'none', glasses: true},
  player: {jacket: '#2f5fa8', lower: '#f3e7d3', tie: '#f2d24a', hair: '#8a5a3a', hat: 'cap', hatColor: '#2f5fa8', hatColor2: '#f2d24a'},
  fanA: {jacket: '#e0b84f', lower: '#55606e', tie: '#2f5fa8', hair: '#2b2326', hat: 'none'},
  fanB: {jacket: '#2f5fa8', lower: '#3a3a40', tie: '#f2d24a', hair: '#6a4a2a', hat: 'cap', hatColor: '#f2d24a', hatColor2: '#2f5fa8'},
};

// Poses: [upper, fore] per arm, radians. 0 = hanging down; positive upper = swings outward (away from body),
// positive fore = bends the forearm further outward/up, negative fore = bends back in across the body.
export const POSES = {
  idle: {L: [0.12, 0], R: [0.12, 0]},
  limp: {L: [0.03, 0], R: [0.03, 0]},
  wave: {L: [0.12, 0], R: [2.5, 0.5], wiggle: 'R'},
  point: {L: [0.12, 0], R: [1.55, 0.05]},
  pointUp: {L: [0.12, 0], R: [2.9, 0]},
  present: {L: [0.12, 0], R: [1.0, 0.9]},
  presentBoth: {L: [1.0, 0.9], R: [1.0, 0.9]},
  shrug: {L: [0.75, 1.5], R: [0.75, 1.5]},
  hips: {L: [0.75, -1.7], R: [0.75, -1.7]},
  armsUp: {L: [2.75, 0.2], R: [2.75, 0.2]},
  cheer: {L: [2.4, 0.6], R: [2.4, 0.6], wiggle: 'both'},
  facepalm: {L: [0.12, 0], R: [-2.3, -1.2]},
  think: {L: [-0.3, -1.9], R: [-0.5, -2.64]},
  chin: {L: [0.12, 0], R: [-0.5, -2.64]},
  cross: {L: [-0.3, -1.9], R: [-0.3, -1.9]},
  headHold: {L: [2.2, 1.55], R: [2.2, 1.55]},
  carry: {L: [0.12, 0], R: [2.75, 0.15]},
  carryBoth: {L: [2.75, 0.15], R: [2.75, 0.15]},
  hold: {L: [0.12, 0], R: [0.55, -0.9]},
  give: {L: [0.12, 0], R: [1.3, 0.3]},
  stop: {L: [0.12, 0], R: [1.2, 1.4]},
  hammerUp: {L: [2.8, 0.3], R: [0.12, 0]},
  hammerDown: {L: [1.0, 0.2], R: [0.12, 0]},
  tap: {L: [0.12, 0], R: [1.25, 0.15]},
  beg: {L: [0.9, -0.9], R: [0.9, -0.9]},
  flex: {L: [1.45, 1.75], R: [1.45, 1.75]},
  eat: {L: [0.12, 0], R: [0.35, -2.2]},
};

const easeOutBack = (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const cl = (x) => Math.max(0, Math.min(1, x));

// Build a character. Returns {group, state, act, update(t, camPos), hand(i), headPiv}. Feet at y=0, facing +z.
export function makeChar(name, o = {}) {
  const p = {...PALETTES[name], ...o};
  const r = rng(o.seed || name.length * 17 + 3);
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  const s = o.scale || 1;
  g.scale.setScalar(s);

  const LX = D.legExtra || 0, TX = D.torsoExtra || 0;
  const hipY = 0.64 + LX, shY = 1.1 + LX + TX, neckY = 1.12 + LX + TX;
  const legs = [];
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(sx * 0.075, hipY, -0.02);
    const l = drawLimb(0.62 + LX, p.lower, 'shoe', r);
    l.mesh.position.set(0, -l.H / 2 + 0.03, 0); piv.add(l.mesh); body.add(piv); legs.push(piv);
  }
  const torso = drawTorso(p, r);
  torso.mesh.position.set(0, 0.53 + LX + torso.H / 2, 0); body.add(torso.mesh);
  const arms = [];
  for (const sx of [-1, 1]) {
    const up = new THREE.Group(); up.position.set(sx * 0.165, shY, 0.02);
    const a1 = drawLimb(0.26, p.jacket, 'elbow', r, 9, 7);
    a1.mesh.position.set(0, -a1.H / 2 + 0.03, 0); up.add(a1.mesh);
    const fore = new THREE.Group(); fore.position.set(0, -0.26, 0.004); up.add(fore);
    const a2 = drawLimb(0.25, p.jacket, 'hand', r, 7, 5);
    a2.mesh.position.set(0, -a2.H / 2 + 0.03, 0); fore.add(a2.mesh);
    const hand = new THREE.Group(); hand.position.set(0, -0.27, 0.02); fore.add(hand);
    body.add(up);
    arms.push({up, fore, hand, sx});
  }
  const headPiv = new THREE.Group(); headPiv.position.set(0, neckY, 0.03); body.add(headPiv);
  const headY = (1.42 - 1.12) + (HEAD_H / 2 - (1 - HEAD_CY)); // head sits on the neck, so a taller body lifts it
  const head = partMesh(drawHeadBase(p, r), HEAD_W, HEAD_H); head.position.set(0, headY, 0); headPiv.add(head);
  const face = partMesh(null, HEAD_W, HEAD_H, false); face.position.set(0, headY, 0.004); headPiv.add(face);
  const faceCache = new Map();
  const faceTex = (f) => {
    const key = `${f.eyes}|${f.brows}|${f.mouth}|${(f.extras || []).join(',')}`;
    if (!faceCache.has(key)) faceCache.set(key, drawFace(p, f, rng(7)));
    return faceCache.get(key);
  };
  face.material.map = faceTex(EXPRESSIONS.neutral);

  const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshBasicMaterial({map: blobTex(), transparent: true, depthWrite: false}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.012; g.add(blob);

  const phase = r() * 6.28;
  // Legacy manual controls (still honoured, added on top of the acting timeline).
  const state = {yaw0: o.yaw ?? 0, walk: 0, armL: 0, armR: 0, shake: 0, nod: 1, expr: null, pose: null};
  let cues = [];
  // cues: [{t, expr?, pose?, action?, dur?, talk?}] — expr/pose persist until the next cue that sets them.
  function act(list) { cues = [...cues, ...list].sort((a, b) => a.t - b.t); return api; }

  const tmp = new THREE.Vector3();
  function poseAt(t) {
    let cur = POSES[state.pose] || POSES.idle, before = cur, t0 = -10;
    for (const c of cues) if (c.pose && c.t <= t) { before = cur; cur = POSES[c.pose] || POSES.idle; t0 = c.t; }
    const k = easeOutBack(cl((t - t0) / 0.32));
    const mix = (a, b) => a + (b - a) * k;
    return {L: [mix(before.L[0], cur.L[0]), mix(before.L[1], cur.L[1])], R: [mix(before.R[0], cur.R[0]), mix(before.R[1], cur.R[1])], wiggle: cur.wiggle};
  }
  function exprAt(t) {
    let e = state.expr || 'neutral', te = -10;
    for (const c of cues) if (c.expr && c.t <= t) { e = c.expr; te = c.t; }
    return {e, te};
  }
  function activeActions(t) { return cues.filter((c) => c.action && t >= c.t && t <= c.t + (c.dur || 0.6)); }

  function update(t, camPos) {
    const P = poseAt(t);
    const {e, te} = exprAt(t);
    const acts = activeActions(t);
    let walk = state.walk, shake = state.shake, nodAmt = 0.04 * state.nod, sy = 1, sx = 1, lift = 0, tremble = 0, slump = 0, lean = 0, talk = false, spin = 0;
    for (const a of acts) {
      const u = (t - a.t) / (a.dur || 0.6);
      if (a.action === 'jump') { // anticipation squash -> stretch up -> land squash
        if (u < 0.18) { const k = u / 0.18; sy = 1 - 0.18 * k; sx = 1 + 0.12 * k; }
        else if (u < 0.82) { const k = (u - 0.18) / 0.64; lift = Math.sin(k * Math.PI) * 0.45; sy = 1 + 0.14 * Math.sin(k * Math.PI); sx = 1 - 0.08 * Math.sin(k * Math.PI); }
        else { const k = (u - 0.82) / 0.18; sy = 1 - 0.14 * Math.sin(k * Math.PI); sx = 1 + 0.1 * Math.sin(k * Math.PI); }
      }
      if (a.action === 'hop') { lift = Math.max(lift, Math.abs(Math.sin(u * Math.PI * 2)) * 0.12); sy *= 1 + 0.05 * Math.sin(u * Math.PI * 4); }
      if (a.action === 'shake') shake = Math.max(shake, Math.sin(cl(u) * Math.PI));
      if (a.action === 'nod') nodAmt = 0; // handled below
      if (a.action === 'tremble') tremble = 1;
      if (a.action === 'slump') slump = Math.max(slump, Math.min(1, u * 4));
      if (a.action === 'lean') lean = (a.amount ?? 0.15) * Math.sin(Math.min(1, u * 3) * Math.PI / 2);
      if (a.action === 'talk') talk = true;
      if (a.action === 'walk') walk = 1;
      if (a.action === 'run') walk = 1.8;
      if (a.action === 'spinIn') spin = (1 - cl(u)) * Math.PI * 2;
      if (a.action === 'popIn') { const k = cl(u * 1.6); const sc = Math.max(0.001, easeOutBack(k)); sx *= sc; sy *= sc; }
    }
    // expression + blink + talk
    let f = {...(EXPRESSIONS[e] || EXPRESSIONS.neutral)};
    const sinceE = t - te;
    const blinkPhase = (t + phase) % 3.7;
    if (blinkPhase < 0.12 && f.eyes !== 'closed' && f.eyes !== 'wide' && sinceE > 0.3) f.eyes = 'blink';
    if (talk) { const k = Math.floor((t + phase) * 9) % 4; f.mouth = k === 0 ? 'talkB' : k === 2 ? 'talkA' : k === 1 ? 'talkB' : f.mouth === 'smile' ? 'talkA' : f.mouth; }
    face.material.map = faceTex(f);
    // expression change "take": quick squash pop on the head
    const take = sinceE >= 0 && sinceE < 0.25 ? Math.sin(sinceE / 0.25 * Math.PI) : 0;
    headPiv.scale.set(1 + 0.08 * take, 1 + 0.12 * take, 1);

    const walkF = walk > 1 ? 11 : 7;
    const bob = Math.sin(t * 2.2 + phase) * 0.012;
    body.position.y = bob + Math.abs(Math.sin(t * walkF)) * 0.04 * Math.min(1, walk) + lift;
    body.position.x = tremble ? Math.sin(t * 60) * 0.012 : 0;
    body.scale.set(sx, sy * (1 - 0.06 * slump), 1);
    body.rotation.z = lean + (walk > 1 ? 0 : 0);
    const nod = acts.some((a) => a.action === 'nod');
    headPiv.rotation.x = 0;
    headPiv.rotation.z = Math.sin(t * 1.3 + phase) * nodAmt;
    headPiv.position.y = neckY - 0.05 * slump + (nod ? -Math.abs(Math.sin(t * 10)) * 0.04 : 0);
    headPiv.position.x = Math.sin(t * 16) * 0.035 * shake;
    headPiv.rotation.z += Math.sin(t * 16) * 0.14 * shake + slump * 0.12;
    const sw = Math.sin(t * walkF) * 0.45 * Math.min(1.3, walk);
    legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
    legs[0].rotation.z = sw * 0.33; legs[1].rotation.z = -sw * 0.33;
    if (lift > 0.05) { legs[0].rotation.z = -0.25; legs[1].rotation.z = 0.25; }
    const swayL = Math.sin(t * 1.7 + phase) * 0.05, swayR = Math.sin(t * 1.7 + phase + 1) * 0.05;
    const wig = Math.sin(t * 12) * 0.35;
    const walkArm = walk ? Math.sin(t * walkF) * 0.35 * Math.min(1.3, walk) : 0;
    const [L, R] = arms;
    const isDefault = (P.L[0] === 0.12 && P.L[1] === 0);
    L.up.rotation.z = -(P.L[0] + swayL + state.armL + (P.wiggle === 'both' ? wig * 0.5 : 0) + (isDefault ? walkArm : 0));
    L.fore.rotation.z = -(P.L[1]);
    R.up.rotation.z = (P.R[0] + swayR + state.armR + (P.wiggle ? wig * 0.5 : 0) - (P.R[0] === 0.12 ? walkArm : 0));
    R.fore.rotation.z = P.R[1] + (P.wiggle ? wig : 0);
    if (slump) { L.up.rotation.z *= 1 - slump * 0.8; R.up.rotation.z *= 1 - slump * 0.8; }

    if (camPos) {
      g.getWorldPosition(tmp);
      let a = Math.atan2(camPos.x - tmp.x, camPos.z - tmp.z) - state.yaw0;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      body.rotation.y = state.yaw0 - g.rotation.y + Math.max(-0.7, Math.min(0.7, a)) + spin;
    }
  }
  const api = {group: g, state, act, update, arms, hand: (i) => arms[i].hand, headPiv};
  return api;
}
