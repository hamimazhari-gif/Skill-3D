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
const basicTex = (c, extra = {}) => new THREE.MeshBasicMaterial({ map: P.tex(c), fog: false, ...extra });
Object.assign(M, {
  lino: texM(P.checker(20, '#e6dcc2', '#5f7f8a', 8), 1, 1),
  labWall: texM(P.labWall(21, '#efe4c8', '#8aa0a8'), 1, 1), ceil: toon({ color: '#e8e0cc' }),
  table: texM(P.beam(30, [28, 38, 46]), 1, 1), tableTop: toon({ color: '#4a4440' }),
  steel: toon({ color: '#9aa3ab' }), steelDark: toon({ color: '#5d656d' }), alu: toon({ color: '#c9ced4' }), knob: toon({ color: '#2a2a2e' }), btn: toon({ color: '#c8322f' }),
  scopeBody: toon({ color: '#6f7a6a' }), console: texM(P.consoleFace(23, '#7a8578'), 1, 1), consoleSide: toon({ color: '#7a8578' }), cable: toon({ color: '#2a2a2e' }),
  board: toon({ color: '#2f3d33' }), easel: toon({ color: '#6a4a32' }), photos: texM(P.exhibitPhotos(), 1, 1), chart: texM(P.exhibitChart(), 1, 1),
  crate: texM(P.planks(61), 1, 1), outGrass: toon({ color: '#86b45a' }), dish: toon({ color: '#c9ced3' }),
  asphalt: texM(P.asphalt(), 1, 1), sidewalk: toon({ color: '#5a5668' }), curb: toon({ color: '#8a8698' }),
  palmTrunk: toon({ color: '#3a2a3a' }), palmLeaf: toon({ color: '#1f2a3a' }), pole: toon({ color: '#2a2834' }),
  gold: toon({ color: '#f0c03a', emissive: '#8a6410' }), goldDark: toon({ color: '#c8962a', emissive: '#5a3a08' }), billM: new THREE.MeshBasicMaterial({ map: P.tex(P.bills(), 2, 8), color: '#c8ffc0' }), cinemaWall: toon({ color: '#5a2a4a' }), roofC: toon({ color: '#2a2034' }),
});
// ===== LAB HALL (origin), floor y=0, back wall z=-6, sides x=±8, open front =====
const LAB = new THREE.Group(); world.add(LAB);
const floorL = add(new THREE.PlaneGeometry(16, 12), M.lino, 0, 0, 0, LAB, { cast: false }); floorL.rotation.x = -Math.PI / 2; uvScale(floorL.geometry, 4, 3);
const WH = 4.4;
const wallPiece = (x0, x1, y0, y1, z = -6) => { const m = add(tbox(x1 - x0, y1 - y0, 0.2, WH), M.labWall, (x0 + x1) / 2, (y0 + y1) / 2, z, LAB);
  const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) + y0 / WH); return m; };
wallPiece(-8, -6, 0, WH); wallPiece(-2, 8, 0, WH); wallPiece(-6, -2, 0, 1.2); wallPiece(-6, -2, 3.2, WH);
for (const s of [-1, 1]) add(tbox(0.2, WH, 12, WH), M.labWall, s * 8, WH / 2, 0, LAB);
const ceil = add(box(16.4, 0.2, 12.4), M.ceil, 0, WH + 0.1, 0, LAB); ceil.castShadow = false;
add(box(4.2, 0.12, 0.35), toon({ color: '#f0ece2' }), -4, 1.16, -5.85, LAB);
add(box(0.08, 2.0, 0.08), M.steelDark, -4, 2.2, -6, LAB); add(box(4, 0.08, 0.08), M.steelDark, -4, 2.2, -6, LAB);
for (const [x, z] of [[-2.5, -1.5], [2.5, -1.5], [0, 1.5]]) { add(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), M.cable, x, WH - 0.5, z, LAB); add(new THREE.ConeGeometry(0.4, 0.3, 16, 1, true), M.steelDark, x, WH - 1.1, z, LAB); add(new THREE.SphereGeometry(0.12, 12, 8), glowM('#fff1c4'), x, WH - 1.22, z, LAB).castShadow = false; }
// banner on the back wall
add(new THREE.PlaneGeometry(3.6, 0.9), basicTex(P.textBanner("VISITORS' DAY 1958")), 2.4, 3.35, -5.88, LAB).castShadow = false;
// outside: lawn + radar dish
const outG = add(new THREE.PlaneGeometry(200, 200), M.outGrass, -4, -0.5, -110, world, { cast: false }); outG.rotation.x = -Math.PI / 2;
const radar = new THREE.Group(); radar.position.set(-3.2, 0, -18); world.add(radar);
add(new THREE.CylinderGeometry(0.25, 0.4, 5, 10), M.steelDark, 0, 2.5, 0, radar);
const dishG = new THREE.Group(); dishG.position.y = 5.2; radar.add(dishG);
{ const d = add(new THREE.SphereGeometry(2.2, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.32), M.dish, 0, 0, 0, dishG); d.rotation.x = -Math.PI / 2 - 0.4; d.position.z = 1.8; }
for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(-14 + i * 6 + (i % 2) * 2, -0.5, -40 - (i % 3) * 12); world.add(g); add(new THREE.CylinderGeometry(0.2, 0.3, 3, 6), M.trunk, 0, 1.5, 0, g); const c = add(new THREE.SphereGeometry(2.2, 12, 8), M.pine, 0, 4, 0, g); c.scale.y = 1.2; }
for (let i = 0; i < 10; i++) { const a = -1.3 + i * 0.28, d = 160; const h = add(new THREE.SphereGeometry(50, 16, 8), i % 2 ? M.hill : M.hillFar, Math.sin(a) * d, -20, -Math.cos(a) * d, world, { cast: false }); h.scale.y = 0.45; }
// consoles (analog computers) along the back wall
const consoles = [];
for (const [x, h] of [[1.2, 2.2], [2.4, 2.4], [3.6, 2.2], [4.8, 1.9]]) {
  const g = new THREE.Group(); g.position.set(x, 0, -5.4); LAB.add(g); consoles.push(g);
  add(new THREE.BoxGeometry(1.1, h, 0.8), [M.consoleSide, M.consoleSide, M.consoleSide, M.consoleSide, M.console, M.consoleSide], 0, h / 2, 0, g);
  add(box(1.14, 0.08, 0.84), M.steelDark, 0, h + 0.04, 0, g);
}
// exhibits on the left: photo board, chart board on easels, a humming machine
const easel = (x, z, mat, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; LAB.add(g);
  for (const s of [-1, 1]) { const l = add(box(0.06, 1.9, 0.06), M.easel, s * 0.55, 0.95, 0, g); l.rotation.z = s * 0.06; }
  const bl = add(box(0.06, 1.9, 0.06), M.easel, 0, 0.9, -0.35, g); bl.rotation.x = -0.2;
  add(new THREE.BoxGeometry(1.4, 1.05, 0.04), [M.easel, M.easel, M.easel, M.easel, mat, M.easel], 0, 1.45, 0.05, g); return g; };
easel(-6.2, -2.6, M.photos, 0.5); easel(-5.6, -0.2, M.chart, 0.9);
const humm = new THREE.Group(); humm.position.set(-6.3, 0, 2.0); humm.rotation.y = 1.3; LAB.add(humm);
add(new THREE.BoxGeometry(1.1, 1.6, 0.8), [M.consoleSide, M.consoleSide, M.consoleSide, M.consoleSide, M.console, M.consoleSide], 0, 0.8, 0, humm);
const hummLamp = add(new THREE.SphereGeometry(0.08, 10, 8), glowM('#ff6a4a'), 0.3, 1.72, 0, humm);
// ===== GAME TABLE =====
const TABLE = { x: 0, z: -1.5, w: 2.2, d: 1.0, h: 0.82 };
add(tbox(TABLE.w, 0.08, TABLE.d, 1), M.tableTop, TABLE.x, TABLE.h - 0.04, TABLE.z, LAB);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.07, TABLE.h - 0.08, 0.07), M.table, TABLE.x + sx * (TABLE.w / 2 - 0.1), (TABLE.h - 0.08) / 2, TABLE.z + sz * (TABLE.d / 2 - 0.1), LAB);
// analog computer cabinet behind the table (slides in on "grabbed")
const computer = new THREE.Group(); LAB.add(computer);
add(new THREE.BoxGeometry(0.9, 1.5, 0.6), [M.consoleSide, M.consoleSide, M.consoleSide, M.consoleSide, M.console, M.consoleSide], 0, 0.75, 0, computer);
// the oscilloscope: body + round screen with a live canvas
const scopeC = document.createElement('canvas'); scopeC.width = scopeC.height = 512; const scopeG = scopeC.getContext('2d');
const scopeT = new THREE.CanvasTexture(scopeC); scopeT.colorSpace = THREE.SRGBColorSpace;
const scope = new THREE.Group(); LAB.add(scope);
add(tbox(0.42, 0.38, 0.5, 1), M.scopeBody, 0, 0.19, 0, scope);
add(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 32), M.knob, 0, 0.215, 0.25, scope).rotation.x = Math.PI / 2;
const screen = add(new THREE.CircleGeometry(0.1, 48), new THREE.MeshBasicMaterial({ map: scopeT, fog: false }), 0, 0.215, 0.267, scope); screen.castShadow = false; screen.userData.nd = null;
for (const x of [-0.12, 0.12]) add(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), M.knob, x, 0.055, 0.26, scope).rotation.x = Math.PI / 2;
// two aluminium controllers: knob + button
const ctrls = [];
for (const s of [-1, 1]) {
  const g = new THREE.Group(); LAB.add(g); ctrls.push(g);
  add(tbox(0.16, 0.07, 0.11, 0.5), M.alu, 0, 0.035, 0, g);
  const k = add(new THREE.CylinderGeometry(0.028, 0.03, 0.03, 16), M.knob, -0.03, 0.085, 0, g); g.userData.knob = k;
  add(box(0.008, 0.012, 0.026), M.alu, 0, 0.016, 0.012, k);
  const b = add(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 12), M.btn, 0.045, 0.078, 0.02, g); g.userData.btn = b;
}
// cables
const cableA = add(new THREE.TorusGeometry(0.35, 0.012, 6, 24, Math.PI * 0.7), M.cable, 0, TABLE.h + 0.01, -1.45, LAB); cableA.rotation.x = -Math.PI / 2;
// crate for spare parts
const crate = new THREE.Group(); crate.position.set(1.7, 0, -0.9); LAB.add(crate);
add(tbox(0.8, 0.55, 0.6, 0.6), M.crate, 0, 0.275, 0, crate);
add(new THREE.PlaneGeometry(0.6, 0.18), basicTex(P.textBanner('SPARE PARTS', '#c9b58a', '#3a2a1a', 1024, 256, 'bold 130px DejaVu Sans')), 0, 0.32, 0.305, crate).castShadow = false;
const crateLid = add(tbox(0.82, 0.05, 0.62, 0.6), M.crate, 0, 0.58, 0, crate);
// ===== CITY AT NIGHT (x≈60), street along x, shops at z=-7 =====
const CITY = new THREE.Group(); CITY.position.set(60, 0, 0); world.add(CITY);
{ const st = add(new THREE.PlaneGeometry(140, 9), M.asphalt, 0, 0.0, -0.5, CITY, { cast: false }); st.rotation.x = -Math.PI / 2; uvScale(st.geometry, 14, 1);
  const sw = add(tbox(140, 0.15, 3.2, 2), M.sidewalk, 0, 0.075, -5.6, CITY); add(tbox(140, 0.16, 0.2, 2), M.curb, 0, 0.08, -4.0, CITY);
  const sw2 = add(tbox(140, 0.15, 3.0, 2), M.sidewalk, 0, 0.075, 5.0, CITY); }
const buildings = [];
const bld = (x, w, h, d, z, seed, wall) => { const m = add(new THREE.BoxGeometry(w, h, d), texM(P.nightWindows(seed, wall), Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 8))), x, h / 2, z, CITY); buildings.push(m); return m; };
const rb = P.rng(77);
for (let x = -60; x <= 60; x += 7.5) { if (x > -6 && x < 22) continue; bld(x, 7, 10 + rb() * 26, 6, -10.5, 50 + (x | 0), ['#2a2440', '#30264a', '#262a44'][(rb() * 3) | 0]); }
for (let i = 0; i < 16; i++) bld(-70 + i * 9, 8, 30 + rb() * 50, 8, -30 - rb() * 20, 120 + i, '#221c38');
// game store (x 0) and cinema (x 14)
const STORE = new THREE.Group(); STORE.position.set(0, 0, -8.6); CITY.add(STORE);
add(tbox(10, 7, 3, 3), M.cinemaWall, 0, 3.5, -0.5, STORE);
const sw_ = add(new THREE.PlaneGeometry(8, 3.2), basicTex(P.storeWindow()), 0, 1.9, 1.02, STORE); sw_.castShadow = false;
const sign = add(new THREE.PlaneGeometry(6, 1.5), basicTex(P.neonSign('GAMES', '#4fe0ff'), { transparent: true }), 0, 5.4, 1.05, STORE); sign.castShadow = false; sign.userData.ndSkip = true;
add(box(10.4, 0.25, 1.6), M.roofC, 0, 3.75, 1.6, STORE);
const CIN = new THREE.Group(); CIN.position.set(14, 0, -8.6); CITY.add(CIN);
add(tbox(10, 12, 3, 3), M.cinemaWall, 0, 6, -0.5, CIN);
const cinSign = add(new THREE.PlaneGeometry(7, 1.6), basicTex(P.neonSign('CINEMA', '#ffd24a'), { transparent: true }), 0, 9.5, 1.05, CIN); cinSign.castShadow = false; cinSign.userData.ndSkip = true;
add(box(9, 1.2, 2.2), M.roofC, 0, 4.4, 1.8, CIN);
for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(0.08, 8, 6), glowM(i % 2 ? '#ffd24a' : '#fff4c4'), -4.2 + i * 0.65, 3.75, 2.92, CIN).castShadow = false;
// money tower beside the cinema (grows) and the billboard counter
const money = new THREE.Group(); money.position.set(21.5, 0, -6.2); CITY.add(money);
const moneyBox = add(new THREE.BoxGeometry(3.2, 1, 2.2), M.billM, 0, 0.5, 0, money);
const bbC = document.createElement('canvas'); bbC.width = 1024; bbC.height = 256; const bbG = bbC.getContext('2d'); const bbT = new THREE.CanvasTexture(bbC); bbT.colorSpace = THREE.SRGBColorSpace;
const billboard = new THREE.Group(); billboard.position.set(0, 9.2, -8.7); CITY.add(billboard);
add(box(5.1, 1.45, 0.3), M.pole, 0, 0, -0.2, billboard); const bbScreen = add(new THREE.PlaneGeometry(4.8, 1.2), new THREE.MeshBasicMaterial({ map: bbT, fog: false }), 0, 0, -0.04, billboard); bbScreen.castShadow = false;
for (const s of [-1, 1]) add(box(0.2, 3, 0.2), M.pole, s * 1.8, -2.2, -0.3, billboard);
// gold coin stacks (the billion-dollar budget)
const coins = new THREE.Group(); coins.position.set(-2, 0, 1.5); CITY.add(coins); const coinStacks = [];
{ const r = P.rng(81); for (let i = 0; i < 18; i++) { const g = new THREE.Group(); g.position.set((r() - 0.5) * 3.5, 0, (r() - 0.5) * 2.2); coins.add(g); const h = 0.6 + r() * 1.6;
  const m = add(new THREE.CylinderGeometry(0.22, 0.22, 1, 18), M.gold, 0, 0.5, 0, g); for (let k = 0; k < 6; k++) add(new THREE.TorusGeometry(0.22, 0.012, 4, 18), M.goldDark, 0, k / 6, 0, g).rotation.x = Math.PI / 2;
  g.userData.h = h; coinStacks.push(g); } }
// palms + street lights
const palm = (x, z, h = 7) => { const g = new THREE.Group(); g.position.set(x, 0, z); CITY.add(g);
  for (let k = 0; k < 6; k++) { const t = add(new THREE.CylinderGeometry(0.16 - k * 0.012, 0.2 - k * 0.012, h / 6 + 0.05, 8), M.palmTrunk, Math.sin(k * 0.35) * 0.25 * k / 6 * 2, h / 6 * (k + 0.5), 0, g); }
  for (let i = 0; i < 7; i++) { const l = add(new THREE.ConeGeometry(0.35, 2.6, 4), M.palmLeaf, 0.5, h + 0.1, 0, g); l.geometry.translate(0, 1.3, 0); l.position.set(0.5, h, 0); l.rotation.set(0, i / 7 * Math.PI * 2, 1.9); l.scale.set(1, 1, 0.25); }
  return g; };
for (let x = -40; x <= 50; x += 11) { if (x + 3 < -24 || x + 3 > 10) palm(x + 3, -4.25, 6 + (x % 3)); palm(x - 2, 4.6, 7); }
for (let x = -36; x <= 50; x += 11) { if (x > -26 && x < 10) continue; add(box(0.12, 5, 0.12), M.pole, x, 2.5, -4.3, CITY); add(box(1.2, 0.1, 0.1), M.pole, x, 5, -3.8, CITY); add(new THREE.SphereGeometry(0.18, 10, 8), glowM('#ffe6a8'), x, 4.9, -3.3, CITY).castShadow = false; }
// a modern controller prop is 2D; city clouds none (night)
const clouds = [];

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
const fmt = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function drawScope(S, f) {
  const g = scopeG, W = 512, cx = 256, cy = 256, mode = S.mode;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, W);
  const bg = mode === 'moon' ? '#1a2a22' : mode === 'jupiter' ? '#2a1e10' : '#0c1a12';
  g.fillStyle = S.on ? bg : '#121614'; g.beginPath(); g.arc(cx, cy, 256, 0, 7); g.fill();
  if (!S.on) { g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.ellipse(190, 170, 90, 50, -0.5, 0, 7); g.fill(); scopeT.needsUpdate = true; return; }
  if (mode === 'moon') { g.fillStyle = 'rgba(160,200,170,.25)'; for (const [x, y, r] of [[150, 420, 40], [330, 440, 30], [420, 400, 22], [90, 380, 18]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
  if (mode === 'jupiter') for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? 'rgba(255,170,90,.22)' : 'rgba(255,220,150,.14)'; g.fillRect(0, 60 + i * 60, W, 34); }
  g.strokeStyle = 'rgba(120,255,160,.12)'; g.lineWidth = 2; for (let k = 64; k < W; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, W); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(W, k); g.stroke(); }
  g.shadowColor = '#7dffb0'; g.shadowBlur = 18; g.strokeStyle = '#9dffc4'; g.lineCap = 'round';
  const GY = 380;
  if (S.net > 0) { g.lineWidth = 8; g.beginPath(); g.moveTo(40, GY); g.lineTo(40 + 432 * Math.min(1, S.net * 2), GY); g.stroke();
    if (S.net > 0.5) { g.beginPath(); g.moveTo(cx, GY); g.lineTo(cx, GY - 110 * Math.min(1, (S.net - 0.5) * 2)); g.stroke(); } }
  if (S.ball > 0) {
    const grav = mode === 'moon' ? 0.35 : mode === 'jupiter' ? 2.6 : 1, per = mode === 'moon' ? 70 : mode === 'jupiter' ? 34 : 46;
    const pos = (ff) => { const ph = ((ff % (2 * per)) + 2 * per) % (2 * per), dir = ph < per ? 1 : -1, u = (ph % per) / per;
      const x = dir > 0 ? 90 + u * 332 : 422 - u * 332; const hop = (u * 2) % 1, h = (mode === 'jupiter' ? 120 : 230) * 4 * hop * (1 - hop) / Math.sqrt(grav) * (mode === 'moon' ? 0.75 : 1);
      return [x, GY - 14 - Math.min(300, h)]; };
    for (let k = 6; k >= 0; k--) { const [x, y] = pos(f - k * 1.2); g.globalAlpha = k ? 0.12 + 0.08 * (6 - k) : 1; g.fillStyle = '#d8ffe6'; g.beginPath(); g.arc(x, y, k ? 9 : 14, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }
  g.shadowBlur = 0;
  const vg = g.createRadialGradient(cx, cy, 150, cx, cy, 256); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, W);
  g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.ellipse(190, 160, 110, 60, -0.5, 0, 7); g.fill();
  scopeT.needsUpdate = true;
}
let bbLast = '';
function drawBillboard(v, label) {
  const key = v + label; if (key === bbLast) return; bbLast = key;
  const g = bbG; g.fillStyle = '#0d0a18'; g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = '#ff4fa0'; g.lineWidth = 10; g.strokeRect(8, 8, 1008, 240);
  g.font = 'bold 104px DejaVu Sans Mono'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#4fffb0'; g.shadowBlur = 24; g.fillStyle = '#7dffc4'; g.fillText(fmt(v), 512, 120);
  g.shadowBlur = 0; g.font = 'bold 34px DejaVu Sans'; g.fillStyle = '#ffd24a'; g.fillText(label, 512, 218); bbT.needsUpdate = true;
}
function worldState(S, f) {
  dishG.rotation.y = f * 0.045;
  hummLamp.visible = Math.floor(f / 8) % 2 === 0;
  // scope + computer + controllers
  scope.position.set(...S.scopeP); scope.scale.setScalar(S.scopeS); scope.rotation.set(0, S.scopeRy || 0, S.scopeRz || 0); scope.visible = S.scopeVis;
  computer.position.set(...S.compP); computer.visible = S.compVis;
  ctrls.forEach((c, i) => { c.visible = S.ctrlVis; c.position.set(TABLE.x + (i ? 0.27 : -0.27), TABLE.h, TABLE.z + 0.36); c.rotation.y = i ? -0.3 : 0.3;
    c.userData.knob.rotation.y = S.knob * (i ? -1 : 1); c.userData.btn.position.y = 0.078 - (S.press && i === 0 ? 0.008 : 0); });
  crateLid.position.y = 0.58 + S.lidUp; crateLid.rotation.z = S.lidUp * 1.2;
  drawScope(S, f);
  // city
  drawBillboard(S.bb, S.bbLabel);
  moneyBox.scale.y = Math.max(0.01, S.money * 26); moneyBox.position.y = moneyBox.scale.y / 2;
  coinStacks.forEach((g, i) => { const k = Math.min(1, Math.max(0, S.coins * 1.6 - (i % 6) * 0.1)); g.scale.set(1, Math.max(0.01, k * g.userData.h), 1); g.visible = k > 0.01; });
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
