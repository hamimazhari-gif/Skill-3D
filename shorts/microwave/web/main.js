import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  rot: texM(P.rotten(4), 1, 1), rotB: texM(P.rotten(14), 1, 1),
  stone: texM(P.stone(4), 1, 1), stoneMoss: texM(P.mossy(P.stone(4), 5, 1.2), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#5c5a57' }), bronze: toon({ color: '#b08a4a' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }),
  window: toon({ color: '#2b2430' }), red: toon({ color: '#b8282b' }),
};
M.banner = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.banner()), alphaTest: 0.5, side: THREE.DoubleSide });
// helmet
const helmetIn = P.tex(P.helmetInside()); helmetIn.wrapS = helmetIn.wrapT = THREE.ClampToEdgeWrapping;
M.helmIn = new THREE.MeshToonMaterial({ gradientMap: grad, map: helmetIn, side: THREE.BackSide });
M.helmOut = toon({ color: '#8f8a7e' });

// ---------- ink / normal-depth contract ----------
const NOINK = 'noink'; // userData flag: never outlined (cards, fx, water handled specially)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const uvScale = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
/** box with world-scaled UVs per face (texel density 1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- world ----------
const DECK = 0; // floor height (cards stand on it)
const world = new THREE.Group(); scene.add(world);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color() }, shal: { value: new THREE.Color() }, glint: { value: new THREE.Color() } };
const glowM = (col) => new THREE.MeshBasicMaterial({ color: col, fog: false });
Object.assign(M, {
  lino: texM(P.checker(20, '#e6dcc2', '#4f7f6a', 8), 1, 1), kfloor: texM(P.checker(24, '#f2efe8', '#c9cfd6', 6), 1, 1),
  labWall: texM(P.labWall(21), 1, 1), kwall: toon({ color: '#cfe0e6' }), subway: texM(P.subway(22), 1, 1),
  ceil: toon({ color: '#e8e0cc' }), bench: texM(P.beam(30, [28, 38, 46]), 1, 1), benchTop: toon({ color: '#3b3a38' }),
  steel: toon({ color: '#9aa3ab' }), steelDark: toon({ color: '#5d656d' }), copper: toon({ color: '#c97a44' }), copperDark: toon({ color: '#8f4f2c' }),
  console: texM(P.consoleFace(23), 1, 1), consoleSide: toon({ color: '#6f7f73' }), cable: toon({ color: '#2a2a2e' }),
  oven: texM(P.bigOven(), 1, 1), ovenSide: toon({ color: '#ddd0b2' }), piano: toon({ color: '#4a2a1c' }), pianoTop: toon({ color: '#5a3424' }),
  keys: texM(P.pianoKeys(), 1, 1), plankW: texM(P.planks(5), 1, 1), fulcrum: toon({ color: '#6a4a32' }),
  cabinet: toon({ color: '#7fa7b5' }), cabinetDoor: toon({ color: '#8fb8c6' }), counter: toon({ color: '#efe9dc' }), handle: toon({ color: '#c8ccd0' }),
  mwBody: toon({ color: '#dfe3e8' }), mwPanel: texM(P.mwPanel(), 1, 1), glass: toon({ color: '#25303a' }), bowl: toon({ color: '#d8e2ea' }),
  kettle: toon({ color: '#c0c6cc' }), corn: toon({ color: '#f0c43c' }), egg: toon({ color: '#f6efe0' }), sill: toon({ color: '#f0ece2' }),
  outGrass: toon({ color: '#86b45a' }), dish: toon({ color: '#c9ced3' }), plant: toon({ color: '#4f8a3a' }), pot: toon({ color: '#c46a3c' }),
  fruit: toon({ color: '#e0563c' }), fruit2: toon({ color: '#f0c03a' }), board: toon({ color: '#2f3d33' }), paper: toon({ color: '#f4efe0' }),
});
// ===== LAB (origin), floor y=0, back wall z=-6, sides x=±8, open front =====
const LAB = new THREE.Group(); world.add(LAB);
const floorL = add(new THREE.PlaneGeometry(16, 12), M.lino, 0, 0, 0, LAB, { cast: false }); floorL.rotation.x = -Math.PI / 2; uvScale(floorL.geometry, 4, 3);
// back wall with a window hole x∈[-6,-2], y∈[1.2,3.2]
const WH = 4.4;
const wallPiece = (x0, x1, y0, y1, z = -6) => { const m = add(tbox(x1 - x0, y1 - y0, 0.2, WH), M.labWall, (x0 + x1) / 2, (y0 + y1) / 2, z, LAB); 
  const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) + y0 / WH); return m; };
wallPiece(-8, -6, 0, WH); wallPiece(-2, 8, 0, WH); wallPiece(-6, -2, 0, 1.2); wallPiece(-6, -2, 3.2, WH);
for (const s of [-1, 1]) { const w = add(tbox(0.2, WH, 12, WH), M.labWall, s * 8, WH / 2, 0, LAB); }
const ceil = add(box(16.4, 0.2, 12.4), M.ceil, 0, WH + 0.1, 0, LAB); ceil.castShadow = false;
add(box(4.2, 0.12, 0.35), M.sill, -4, 1.16, -5.85, LAB); // window sill
for (const x of [-4]) add(box(0.08, 2.0, 0.08), M.steelDark, x, 2.2, -6, LAB); add(box(4, 0.08, 0.08), M.steelDark, -4, 2.2, -6, LAB);
// hanging lamps
const lamps = [];
for (const [x, z] of [[-2.5, -1.5], [2.5, -1.5]]) { add(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), M.cable, x, WH - 0.5, z, LAB); const sh = add(new THREE.ConeGeometry(0.4, 0.3, 16, 1, true), M.steelDark, x, WH - 1.1, z, LAB); add(new THREE.SphereGeometry(0.12, 12, 8), glowM('#fff1c4'), x, WH - 1.22, z, LAB).castShadow = false; lamps.push(sh); }
// outside the window: lawn + radar dish
const outG = add(new THREE.PlaneGeometry(200, 200), M.outGrass, -4, -0.5, -110, world, { cast: false }); outG.rotation.x = -Math.PI / 2;
const radar = new THREE.Group(); radar.position.set(-3.2, 0, -18); world.add(radar);
add(new THREE.CylinderGeometry(0.25, 0.4, 5, 10), M.steelDark, 0, 2.5, 0, radar);
const dishG = new THREE.Group(); dishG.position.y = 5.2; radar.add(dishG);
{ const d = add(new THREE.SphereGeometry(2.2, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.32), M.dish, 0, 0, 0, dishG); d.rotation.x = -Math.PI / 2 - 0.4; d.position.z = 1.8;
  add(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), M.steelDark, 0, 0.3, 0.4, dishG).rotation.x = 1.1; }
for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(-14 + i * 6 + (i % 2) * 2, -0.5, -40 - (i % 3) * 12); world.add(g); add(new THREE.CylinderGeometry(0.2, 0.3, 3, 6), M.trunk, 0, 1.5, 0, g); const c = add(new THREE.SphereGeometry(2.2, 12, 8), M.pine, 0, 4, 0, g); c.scale.y = 1.2; }
for (let i = 0; i < 10; i++) { const a = -1.3 + i * 0.28, d = 160; const h = add(new THREE.SphereGeometry(50, 16, 8), i % 2 ? M.hill : M.hillFar, Math.sin(a) * d, -20, -Math.cos(a) * d, world, { cast: false }); h.scale.y = 0.45; }
// main bench (front edge z=-1.0), top at 0.86
const BENCH = { x: 0, z: -1.6, w: 3.4, d: 1.1, h: 0.86 };
add(tbox(BENCH.w, 0.08, BENCH.d, 1), M.benchTop, BENCH.x, BENCH.h - 0.04, BENCH.z, LAB);
add(tbox(BENCH.w - 0.2, BENCH.h - 0.2, BENCH.d - 0.2, 1), M.bench, BENCH.x, (BENCH.h - 0.08) / 2 + 0.06, BENCH.z, LAB);
// magnetron unit on the bench: grey base, copper finned tube, glass top
const tube = new THREE.Group(); tube.position.set(0.75, BENCH.h, -1.65); LAB.add(tube);
add(tbox(0.7, 0.22, 0.5, 1), M.steelDark, 0, 0.11, 0, tube);
add(new THREE.CylinderGeometry(0.15, 0.15, 0.36, 18), M.copper, 0, 0.4, 0, tube);
for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.24, 0.24, 0.025, 18), M.copperDark, 0, 0.27 + i * 0.05, 0, tube);
add(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), M.steel, 0, 0.64, 0, tube);
const bulbM = new THREE.MeshBasicMaterial({ color: '#ffd27a', fog: false }); const bulb = add(new THREE.SphereGeometry(0.11, 16, 10), bulbM, 0, 0.76, 0, tube); bulb.castShadow = false;
add(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), M.steel, 0, 0.68, 0, tube);
// horn pointing at the bench front (where food goes)
{ const h = add(new THREE.CylinderGeometry(0.07, 0.16, 0.3, 4, 1, true), M.steel, -0.35, 0.42, 0.1, tube); h.rotation.z = Math.PI / 2; h.rotation.x = Math.PI / 4; }
// cables from tube to consoles
for (let i = 0; i < 3; i++) { const c = add(new THREE.TorusGeometry(1.2 + i * 0.15, 0.025, 6, 24, Math.PI * 0.6), M.cable, 1.8 + i * 0.1, BENCH.h + 0.02, -2.6, LAB); c.rotation.x = -Math.PI / 2; c.rotation.z = 2.4; }
// bowl of kernels and the kettle (egg)
const bowl = new THREE.Group(); bowl.position.set(-0.05, BENCH.h, -1.35); LAB.add(bowl);
add(new THREE.SphereGeometry(0.17, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.bowl, 0, 0.14, 0, bowl);
const kern = add(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16), M.corn, 0, 0.12, 0, bowl);
const kettle = new THREE.Group(); kettle.position.set(-0.75, BENCH.h, -1.45); LAB.add(kettle);
{ const b = add(new THREE.SphereGeometry(0.17, 18, 12), M.kettle, 0, 0.15, 0, kettle); b.scale.y = 0.9;
  const sp = add(new THREE.CylinderGeometry(0.02, 0.04, 0.2, 8), M.kettle, 0.17, 0.2, 0, kettle); sp.rotation.z = -1.0;
  const hd = add(new THREE.TorusGeometry(0.1, 0.018, 6, 16, Math.PI), M.steelDark, 0, 0.3, 0, kettle); }
const lid = add(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 14), M.steelDark, -0.75, BENCH.h + 0.31, -1.45, LAB);
// clutter on the bench: notebook, tools
add(box(0.36, 0.02, 0.26), M.paper, -1.3, BENCH.h + 0.01, -1.3, LAB).rotation.y = 0.3;
add(box(0.3, 0.04, 0.05), M.steelDark, 1.35, BENCH.h + 0.02, -1.25, LAB).rotation.y = -0.5;
// consoles along the back wall
for (const [x, h] of [[1.2, 2.2], [2.4, 2.4], [3.6, 2.2], [4.8, 1.9]]) {
  const g = new THREE.Group(); g.position.set(x, 0, -5.4); LAB.add(g);
  add(new THREE.BoxGeometry(1.1, h, 0.8), [M.consoleSide, M.consoleSide, M.consoleSide, M.consoleSide, M.console, M.consoleSide], 0, h / 2, 0, g);
  add(box(1.14, 0.08, 0.84), M.steelDark, 0, h + 0.04, 0, g);
}
// chalkboard with a sketch (no text)
add(box(2.2, 1.2, 0.05), M.board, -1.2, 2.3, -5.88, LAB);
// big vintage oven (as tall as a man) — rides the seesaw
const SEE = { x: 2.2, z: 0.2, h: 0.35, L: 3.6 };
const seesaw = new THREE.Group(); seesaw.position.set(SEE.x, SEE.h, SEE.z); world.add(seesaw);
{ const fs = new THREE.Shape(); fs.moveTo(-0.45, 0); fs.lineTo(0.45, 0); fs.lineTo(0, SEE.h); fs.closePath();
  const fm = add(new THREE.ExtrudeGeometry(fs, { depth: 0.8, bevelEnabled: false }), M.fulcrum, SEE.x, 0, SEE.z - 0.4, world); seesaw.userData.fulcrum = fm; }
const plankS = add(tbox(SEE.L, 0.14, 1.0, 1.2), M.plankW, 0, 0.07, 0, seesaw);
const setPiece = [seesaw, seesaw.userData.fulcrum];
const oven = new THREE.Group(); oven.position.set(-SEE.L / 2 + 0.55, 0.14, 0); seesaw.add(oven);
add(new THREE.BoxGeometry(0.95, 2.0, 0.8), [M.ovenSide, M.ovenSide, M.ovenSide, M.ovenSide, M.oven, M.ovenSide], 0, 1.0, 0, oven);
add(box(1.0, 0.06, 0.85), M.steel, 0, 2.03, 0, oven);
const piano = new THREE.Group(); world.add(piano);
add(tbox(1.5, 1.25, 0.6, 1), M.piano, 0, 0.75, 0, piano);
add(tbox(1.56, 0.06, 0.66, 1), M.pianoTop, 0, 1.4, 0, piano);
add(tbox(1.4, 0.06, 0.32, 1), M.piano, 0, 0.72, 0.42, piano);
{ const k = add(new THREE.BoxGeometry(1.3, 0.03, 0.24), [M.piano, M.piano, M.keys, M.piano, M.piano, M.piano], 0, 0.765, 0.42, piano); }
for (const s of [-1, 1]) add(tbox(0.08, 0.6, 0.08, 1), M.piano, s * 0.62, 0.3, 0.5, piano);
piano.visible = false;
// ===== KITCHEN (x≈40), floor y=0, back wall z=-3 =====
const KIT = new THREE.Group(); KIT.position.set(40, 0, 0); world.add(KIT);
const kf = add(new THREE.PlaneGeometry(10, 8), M.kfloor, 0, 0, 0, KIT, { cast: false }); kf.rotation.x = -Math.PI / 2; uvScale(kf.geometry, 4, 3);
add(tbox(10, 3.2, 0.2, 3.2), M.kwall, 0, 1.6, -3.1, KIT);
for (const s of [-1, 1]) add(tbox(0.2, 3.2, 8, 3.2), M.kwall, s * 5, 1.6, 1, KIT);
const kc = add(box(10.4, 0.2, 8.4), M.ceil, 0, 3.3, 1, KIT); kc.castShadow = false;
// window in the back wall (glass shows sky through a hole: frame only, wall split)
KIT.remove(KIT.children[1]);
const kwp = (x0, x1, y0, y1) => add(tbox(x1 - x0, y1 - y0, 0.2, 3.2), M.kwall, (x0 + x1) / 2, (y0 + y1) / 2, -3.1, KIT);
kwp(-5, 1.2, 0, 3.2); kwp(3.2, 5, 0, 3.2); kwp(1.2, 3.2, 0, 1.45); kwp(1.2, 3.2, 2.6, 3.2);
add(box(2.1, 0.06, 0.06), M.sill, 2.2, 2.03, -3.02, KIT); add(box(0.06, 1.15, 0.06), M.sill, 2.2, 2.03, -3.02, KIT);
// counter run
add(tbox(7, 0.86, 0.66, 1), M.cabinet, -0.5, 0.43, -2.65, KIT);
for (let i = 0; i < 6; i++) { add(box(1.08, 0.7, 0.03), M.cabinetDoor, -3.4 + i * 1.16, 0.45, -2.31, KIT); add(box(0.2, 0.03, 0.04), M.handle, -3.4 + i * 1.16, 0.7, -2.29, KIT); }
add(tbox(7.1, 0.06, 0.72, 1), M.counter, -0.5, 0.89, -2.63, KIT);
add(tbox(5.8, 0.6, 0.04, 0.6), M.subway, -1.1, 1.22, -2.98, KIT);
add(tbox(5.8, 0.75, 0.38, 1), M.cabinet, -1.1, 2.25, -2.8, KIT);
for (let i = 0; i < 5; i++) add(box(1.08, 0.68, 0.03), M.cabinetDoor, -3.4 + i * 1.16, 2.25, -2.6, KIT);
// modern microwave (no logos) at kitchen x=0
const MW = { x: 0, y: 0.92, z: -2.62 };
const mw = new THREE.Group(); mw.position.set(MW.x, MW.y, MW.z); KIT.add(mw);
add(tbox(0.56, 0.32, 0.4, 1), M.mwBody, 0, 0.16, 0, mw);
add(new THREE.BoxGeometry(0.13, 0.28, 0.01), [M.mwPanel, M.mwPanel, M.mwPanel, M.mwPanel, M.mwPanel, M.mwPanel], 0.2, 0.16, 0.205, mw);
const mwGlowM = new THREE.MeshBasicMaterial({ color: '#2a2f36', fog: false }); const mwIn = add(box(0.36, 0.24, 0.01), mwGlowM, -0.06, 0.16, 0.19, mw); mwIn.castShadow = false;
const mwDoor = new THREE.Group(); mwDoor.position.set(-0.27, 0, 0.205); mw.add(mwDoor);
add(box(0.41, 0.29, 0.02), M.mwBody, 0.205, 0.16, 0.0, mwDoor);
const mwWin = add(box(0.3, 0.19, 0.01), new THREE.MeshBasicMaterial({ color: '#3a3020', transparent: true, opacity: 0.85, fog: false }), 0.2, 0.16, 0.012, mwDoor); mwWin.castShadow = false;
add(box(0.02, 0.2, 0.03), M.handle, 0.38, 0.16, 0.03, mwDoor);
// kitchen dressing
const ptG = new THREE.Group(); ptG.position.set(2.2, 0.92, -2.75); KIT.add(ptG); add(new THREE.CylinderGeometry(0.1, 0.08, 0.16, 12), M.pot, 0, 0.08, 0, ptG); for (let i = 0; i < 5; i++) { const l = add(new THREE.SphereGeometry(0.08, 8, 6), M.plant, Math.cos(i) * 0.06, 0.22 + (i % 2) * 0.06, Math.sin(i) * 0.06, ptG); l.scale.y = 1.6; }
const fb = new THREE.Group(); fb.position.set(-1.0, 0.92, -2.6); KIT.add(fb); add(new THREE.SphereGeometry(0.16, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.bowl, 0, 0.13, 0, fb); for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(0.055, 10, 8), i % 2 ? M.fruit : M.fruit2, Math.cos(i * 1.7) * 0.07, 0.13, Math.sin(i * 1.7) * 0.07, fb);
add(new THREE.CylinderGeometry(0.08, 0.09, 0.2, 14), M.kettle, -2.2, 1.02, -2.7, KIT);
// outside the kitchen window
const kout = add(new THREE.PlaneGeometry(200, 120), M.outGrass, 40, -0.6, -64, world, { cast: false }); kout.rotation.x = -Math.PI / 2;
for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(34 + i * 4, -0.5, -14 - (i % 2) * 6); world.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 2, 6), M.trunk, 0, 1, 0, g); add(new THREE.SphereGeometry(1.6, 12, 8), M.bush, 0, 2.6, 0, g); }
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 10; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = -1.2 + r() * 2.4, d = 650 + r() * 250; m.position.set(Math.sin(a) * d, 90 + r() * 140, -Math.cos(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(scale = 1) {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;            // character cards: never outlined by the world ink
      if (card) ds = 1e4;                        // sky
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
// final copy with sRGB handled by the renderer output (we render to screen with linear->sRGB in the shader chunk)
dofScene.children[0].material.toneMapped = false;

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
}
function placeSun(L, focus) {
  // sun direction from azimuth/elevation in world space
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}

const cA = new THREE.Color(), cB = new THREE.Color();
function worldState(S, f) {
  dishG.rotation.y = f * 0.045;
  // magnetron glow (pulses while on)
  const g = S.tube * (0.85 + 0.15 * Math.sin(f * 0.9));
  bulbM.color.copy(cA.set('#6d5a3c')).lerp(cB.set(S.blue ? '#9fe6ff' : '#ffe08a'), g);
  // modern microwave: inner light + door
  mwGlowM.color.copy(cA.set('#2a2f36')).lerp(cB.set('#ffcf6a'), S.mwOn);
  mwWin.material.color.copy(cA.set('#3a3020')).lerp(cB.set('#ffd88a'), S.mwOn * 0.9);
  mwDoor.rotation.y = -S.mwDoor * 1.75;
  // seesaw + piano
  for (const o of setPiece) o.visible = S.seesaw;
  seesaw.rotation.z = S.tilt;
  const lx = SEE.L / 2 - 0.85, c = Math.cos(S.tilt), sn = Math.sin(S.tilt);
  piano.visible = S.seesaw && S.piano > -0.5;
  piano.position.set(SEE.x + lx * c - 0.14 * sn, SEE.h + lx * sn + 0.14 * c + Math.max(0, S.pianoUp), SEE.z);
  piano.rotation.set(0, 0, S.tilt + S.pianoSpin);
  // kettle lid / kernels
  lid.position.set(-0.75 + S.lid * 0.25, BENCH.h + 0.31 + S.lid * 0.9 - S.lid * S.lid * 0.5, -1.45); lid.rotation.set(S.lid * 5, 0, S.lid * 3);
  kern.visible = !S.popped;
  waterU.t.value = f / 30;
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.y < DECK + 0.5) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  // ink + grade
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
