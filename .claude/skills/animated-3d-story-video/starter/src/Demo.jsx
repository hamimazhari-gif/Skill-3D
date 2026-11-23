// Demo: natural locomotion (walk, run, turn), automatic view angles (front / three-quarter / side / back / top)
// and the realistic world style. 12 s, no audio. Composition "DemoGerak".
import React, {useMemo, useRef, useEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {makeChar, setCharDesign, CHAR_TINT} from './char';
import * as P from './props';
import {box, cyl, ball, at, toon, paintTex, patternTex, patternMat, CREAM, INK, smooth} from './kit';
import {GradeShader, applyGrade, LOOK_PRESETS} from './lighting';

export const DEMO_SECONDS = 12;
const FPS = 30;

function buildPark() {
  setCharDesign('bean');
  const g = new THREE.Group(); const chars = []; const updaters = [];
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), patternMat('grass', {base: '#5f8a3f', repeat: [40, 40], seed: 4, rough: 0.95, bump: 2}));
  grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; g.add(grass);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(40, 2.2), patternMat('stone', {base: '#a89a86', repeat: [14, 1], seed: 6, bump: 3}));
  path.rotation.x = -Math.PI / 2; path.position.set(0, 0.01, -2.0); path.receiveShadow = true; g.add(path);
  const path2 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 7), patternMat('stone', {base: '#a89a86', repeat: [1, 3.5], seed: 7, bump: 3}));
  path2.rotation.x = -Math.PI / 2; path2.position.set(2.6, 0.012, -5.0); path2.receiveShadow = true; g.add(path2);
  for (let i = 0; i < 9; i++) { const tr = P.tree({seed: 10 + i, h: 2.4 + (i % 3) * 0.5}); at(tr, -14 + i * 3.6, 0, -9 - (i % 2) * 2.5); g.add(tr); }
  for (const [x, z] of [[-6, 2.5], [7, 1.8]]) { const tr = P.tree({seed: 40 + x, h: 2.8}); at(tr, x, 0, z); g.add(tr); }
  for (const x of [-5.5, 4.2, 8]) { const l = P.streetLamp(); at(l, x, 0, -3.4); g.add(l); }
  for (const x of [-2.5, 5.2]) {
    const bench = new THREE.Group(); at(bench, x, 0, -3.6); g.add(bench);
    const wood = toon('#9a6a42', {paint: {planks: 4, seed: 33}, rough: 0.7});
    const seat = box(1.6, 0.08, 0.45, wood); at(seat, 0, 0.45, 0); bench.add(seat);
    const back = box(1.6, 0.4, 0.06, wood); at(back, 0, 0.55, -0.2); bench.add(back);
    for (const s of [-0.7, 0.7]) { const leg = box(0.08, 0.45, 0.4, toon('#3a3a40', {rough: 0.4, metal: 0.6})); at(leg, s, 0, 0); bench.add(leg); }
  }
  [[-9, '#e6c99a', '#b5543c'], [-3, '#c9d4e8', '#4f7fa6'], [3.5, '#f0d8b0', '#c75b5b'], [10, '#d8e4c0', '#7a5236']].forEach(([x, c, rf], i) => {
    const h = P.house(4.0, 3.2, 3.5, {color: c, roof: rf, seed: 60 + i}); at(h, x, 0, -15); g.add(h);
  });
  for (let i = 0; i < 26; i++) { const f = box(0.08, 0.9, 0.08, patternMat('woodfloor', {base: '#e8dcc8', planks: 1, seed: 40 + i})); at(f, -13 + i, 0, -6.2); g.add(f); }
  // tall grass meadow behind the fence and a strip in the foreground, pebbles along the path
  const meadow = P.grassField([0, -10.5, 36, 8], {n: 26000, h: 0.65, color: '#4a7a2e', tip: '#c8c87a', dry: 0.2, flowers: 0.025}); g.add(meadow.obj); updaters.push(meadow.update);
  const fg = P.grassField([0, 2.0, 24, 3.6], {n: 22000, h: 0.26, color: '#4a7a2e', tip: '#a8c06a', dry: 0.1, flowers: 0.01, seed: 19});
  for (const [zc, dz] of [[-4.6, 2.2], [-0.15, 0.9]]) { const mid = P.grassField([0, zc, 30, dz], {n: 9000, h: 0.2, seed: 30 + zc, flowers: 0.01}); g.add(mid.obj); updaters.push(mid.update); } g.add(fg.obj); updaters.push(fg.update);
  g.add(P.pebbles([0, -0.85, 24, 0.3], 50, 5)); g.add(P.pebbles([0, -3.15, 24, 0.3], 50, 6));
  const mts = P.mountains({village: true}); g.add(mts);
  // warm lanterns on the benches and by the path
  for (const [x, y, z] of [[5.7, 0.49, -3.6], [1.2, 0, -0.75], [-6.5, 0, -0.75]]) { const ln = P.lantern({seed: x}); at(ln.group, x, y, z); g.add(ln.group); updaters.push(ln.update); }
  const rail = box(26, 0.07, 0.06, toon('#f3ece0')); at(rail, -0.5, 0.75, -6.2); g.add(rail);
  // walker: crosses (side view), comes to camera (front), walks away (back), then runs (three-quarter)
  const A = makeChar('hero', {seed: 3, jacket: '#c75b5b', lower: '#34445e', hat: 'none', hairStyle: 'tuft'}); at(A.group, -3.0, 0, -2.0); g.add(A.group); chars.push(A);
  A.act([
    {t: 0, pose: 'idle', expr: 'happy'},
    {t: 0.2, move: [2.6, -2.0], dur: 3.4, gait: 'walk'},
    {t: 3.7, face: 'camera', expr: 'cheesy', pose: 'wave'},
    {t: 4.3, pose: 'idle', move: [2.6, -0.3], dur: 1.3, gait: 'walk'},
    {t: 5.8, move: [2.6, -5.2], dur: 2.0, gait: 'walk', expr: 'neutral'},
    {t: 7.9, move: [-1.6, -0.8], dur: 1.8, gait: 'run', expr: 'toothy'},
    {t: 9.9, face: 'camera', pose: 'cheer', expr: 'laugh', action: 'jump', dur: 0.7},
  ]);
  // stander for the orbit: the camera circles her, so her drawing switches front -> 3/4 -> side -> back
  const B = makeChar('hero', {seed: 8, jacket: '#5a9a8a', lower: '#3a4a5a', hat: 'none', hairStyle: 'fringe'}); at(B.group, -0.8, 0, -2.6); g.add(B.group); chars.push(B);
  B.act([{t: 0, pose: 'hips', expr: 'smug'}, {t: 2.0, pose: 'wave', expr: 'happy'}, {t: 9.6, pose: 'point', expr: 'cheesy'}]);
  return {g, chars, updaters};
}

// camera keys: [t, pos, look]
const CAM = [
  [0.0, [-2.0, 1.5, 2.2], [-2.0, 1.3, -2.2]],
  [3.4, [2.0, 1.5, 1.8], [2.2, 1.3, -2.2]],
  [5.6, [2.8, 1.55, 1.9], [2.6, 1.35, -0.8]],
  [7.8, [2.4, 1.7, 1.2], [2.6, 1.2, -4.6]],
  [9.6, [0.2, 1.6, 2.4], [-1.4, 1.2, -1.2]],
  // orbit around B at (-0.8, -2.6): front -> side -> back, then up to a top view
  [10.4, [-0.8, 1.7, 0.4], [-0.8, 1.3, -2.6]],
  [11.0, [2.2, 1.8, -2.6], [-0.8, 1.3, -2.6]],
  [11.5, [-0.8, 2.6, -5.6], [-0.8, 1.0, -2.6]],
  [12.0, [-0.6, 6.0, -2.2], [-0.8, 0.6, -2.7]],
];
function camAtDemo(t) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, p0, l0] = CAM[i], [t1, p1, l1] = CAM[i + 1];
  const u = smooth((t - t0) / (t1 - t0));
  const L = (a, b) => new THREE.Vector3(...a.map((v, k) => v + (b[k] - v) * u));
  // orbit segment: interpolate around the circle, not through it
  if (t0 >= 10.4 && t1 <= 11.5) {
    const c = new THREE.Vector3(-0.8, 0, -2.6), a0 = Math.atan2(p0[0] - c.x, p0[2] - c.z), a1 = Math.atan2(p1[0] - c.x, p1[2] - c.z);
    let da = a1 - a0; if (Math.abs(da) > Math.PI) da -= Math.sign(da) * Math.PI * 2;
    const a = a0 + da * u, rr = 3.0;
    return {pos: new THREE.Vector3(c.x + Math.sin(a) * rr, p0[1] + (p1[1] - p0[1]) * u, c.z + Math.cos(a) * rr), look: L(l0, l1)};
  }
  return {pos: L(p0, p1), look: L(l0, l1)};
}

function DemoScene() {
  const frame = useCurrentFrame();
  const {gl, scene, camera, size} = useThree();
  const built = useMemo(() => {
    const w = buildPark();
    const sky = P.skyDome();
    const key = new THREE.DirectionalLight('#fff0d8', 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 0.5; sc.far = 60; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    const hemi = new THREE.HemisphereLight('#dcecff', '#8a9a6a', 1.2);
    return {...w, sky, key, hemi};
  }, []);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl); c.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, {focus: 4, aperture: 0.0012, maxblur: 0.005}); c.addPass(bokeh);
    c.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.6, 0.5, 1.6));
    const grade = new ShaderPass(GradeShader); c.addPass(grade); c.addPass(new OutputPass()); c.grade = grade; c.bokeh = bokeh; return c;
  }, [gl, scene, camera]);
  useEffect(() => { composer.setSize(size.width, size.height); composer.setPixelRatio(gl.getPixelRatio()); }, [composer, size, gl]);
  const fref = useRef(frame); fref.current = frame;
  useFrame(() => {
    const t = fref.current / FPS;
    if (!built.g.parent) {
      scene.add(built.g, built.sky, built.key, built.key.target, built.hemi);
      gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
      const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
      gl.toneMapping = THREE.NeutralToneMapping;
      scene.fog = new THREE.Fog('#f0c89a', 16, 95);
    }
    const lk = {...LOOK_PRESETS.goldenHour, clouds: 0.9};
    const {pos, look} = camAtDemo(t);
    camera.position.copy(pos); camera.lookAt(look); camera.fov = 70; camera.near = 0.1; camera.far = 500; camera.updateProjectionMatrix();
    built.sky.position.copy(camera.position);
    built.sky.material.uniforms.top.value.set('#6f86b8'); built.sky.material.uniforms.bottom.value.set('#ffc890'); built.sky.material.uniforms.clouds.value = 0.9;
    built.key.color.set('#ffc07a'); built.key.position.set(-14, 7, -6); built.key.target.position.set(0, 0, -2); built.key.target.updateMatrixWorld(); built.key.intensity = 2.8;
    built.hemi.color.set('#9ab0e0'); built.hemi.groundColor.set('#6a5a3a'); built.hemi.intensity = 1.1;
    CHAR_TINT.set('#ffffff').lerp(new THREE.Color('#ffd8a8'), 0.18);
    applyGrade(composer.grade, {sat: 1.08, contrast: 1.06, tint: '#ffc880', tintAmt: 0.08, vignette: 0.36});
    for (const u of built.updaters) u(t);
    for (const c of built.chars) c.update(t, camera.position);
    composer.bokeh.uniforms.focus.value = pos.distanceTo(look);
    composer.render();
  }, 1);
  return null;
}

const NOTES = [[0, 3.6, 'Berjalan'], [3.6, 5.7, 'Berhenti & menyapa'], [5.7, 7.8, 'Berjalan menjauh'], [7.8, 9.9, 'Berlari'], [9.9, 12.1, 'Kamera berputar']];
export const DemoGerak = () => {
  const {width, height} = useVideoConfig();
  const t = useCurrentFrame() / FPS;
  const n = NOTES.find(([a, b]) => t >= a && t < b);
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 70, near: 0.1, far: 500}}>
        <DemoScene />
      </ThreeCanvas>
      {n ? <AbsoluteFill style={{alignItems: 'center', top: '78%', height: 'auto', bottom: 'auto'}}>
        <div style={{fontFamily: '"Inter Display"', fontWeight: 900, fontSize: 44, color: '#fffaf0', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{n[2]}</div>
      </AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
