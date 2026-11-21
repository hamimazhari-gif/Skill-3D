import React, {useMemo, useRef, useEffect} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {makeTiming, EV, LABELS, FPS} from './timing';
import {buildWorld, LOOK, LOC} from './world';
import {buildCameras, camAt} from './shots';
import {skyDome} from './props';
import {CREAM} from './kit';

const VignetteShader = {
  uniforms: {tDiffuse: {value: null}, strength: {value: 0.32}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float strength; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv-0.5; d.x *= 0.75; float v = smoothstep(0.75, 0.2, length(d)); c.rgb *= mix(1.0-strength, 1.0, v); gl_FragColor = c; }',
};

export function useStory(lang) {
  return useMemo(() => {
    const T = makeTiming(lang);
    const EVt = {};
    for (const [k, v] of Object.entries(EV)) EVt[k] = T.wt(...v[lang]);
    return {T, EVt, L: LABELS[lang]};
  }, [lang]);
}

function Scene({lang, thumb}) {
  const frame = useCurrentFrame();
  const {T, EVt, L} = useStory(lang);
  const {gl, scene, camera, size} = useThree();
  const built = useMemo(() => {
    const w = buildWorld(lang, T, EVt, L);
    const cams = buildCameras(T, EVt);
    const sky = skyDome();
    const key = new THREE.DirectionalLight('#fff0d8', 2.6);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 0.5; sc.far = 40;
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    const hemi = new THREE.HemisphereLight('#dcecff', '#b09a72', 1.3);
    return {...w, cams, sky, key, hemi};
  }, [lang, T, EVt, L]);

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(built.world, built.sky, built.key, built.key.target, built.hemi);
    scene.fog = new THREE.Fog('#efe6d2', 14, 55);
    return () => { scene.remove(built.world, built.sky, built.key, built.key.target, built.hemi); };
  }, [built, scene, gl]);

  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, {focus: 3, aperture: 0.0016, maxblur: 0.0055});
    c.addPass(bokeh);
    c.addPass(new ShaderPass(VignetteShader));
    c.addPass(new OutputPass());
    c.bokeh = bokeh;
    return c;
  }, [gl, scene, camera]);
  useEffect(() => { composer.setSize(size.width, size.height); composer.setPixelRatio(gl.getPixelRatio()); }, [composer, size, gl]);

  const fref = useRef(frame); fref.current = frame;
  useFrame(() => {
    const t = thumb ? thumb.t : fref.current / FPS;
    const shot = T.shotOf(t);
    let {pos, look, loc} = camAt(built.cams, shot, t);
    if (thumb) { pos = new THREE.Vector3(...thumb.pos).add(new THREE.Vector3(LOC[loc], 0, 0)); look = new THREE.Vector3(...thumb.look).add(new THREE.Vector3(LOC[loc], 0, 0)); }
    camera.position.copy(pos); camera.lookAt(look);
    camera.fov = 80; camera.near = 0.1; camera.far = 500; camera.updateProjectionMatrix();
    for (const [name, g] of Object.entries(built.locGroups)) g.visible = name === loc;
    const lk = LOOK[loc];
    if (!scene.fog) scene.fog = new THREE.Fog('#efe6d2', 14, 55);
    if (!built.world.parent) { scene.add(built.world, built.sky, built.key, built.key.target, built.hemi); gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; }
    scene.fog.color.set(lk.fog); scene.fog.near = lk.near; scene.fog.far = lk.far;
    built.sky.material.uniforms.top.value.set(lk.skyTop); built.sky.material.uniforms.bottom.value.set(lk.skyBottom);
    built.sky.position.copy(camera.position);
    const ox = LOC[loc];
    let kp = lk.keyPos;
    if (loc === 'cross') { // the sun sinks during "half a day"
      const u = THREE.MathUtils.clamp((t - built.cams[5].t0) / (built.cams[5].t1 - built.cams[5].t0), 0, 1);
      kp = [-8 + 2 * u, 9 - 4.5 * u, 6 - 1 * u];
      built.key.color.set('#ffd9a8').lerp(new THREE.Color('#ff9a5a'), u);
    } else built.key.color.set(lk.key);
    built.key.position.set(ox + kp[0], kp[1], kp[2]);
    built.key.target.position.set(ox, 0, -1); built.key.target.updateMatrixWorld();
    built.key.intensity = lk.keyI; built.hemi.intensity = lk.hemiI;
    built.update(t, camera.position);
    composer.bokeh.uniforms.focus.value = pos.distanceTo(look);
    composer.render();
  }, 1);
  return null;
}

// SFX cue sheet: [file, time, volume, trimSeconds?]
function cues(T, EVt) {
  const c = (k) => T.CUTS[k - 1];
  const list = [
    ['05-airy-whoosh.mp3', 0.0, 0.25],
    ['04-soft-ui-pop.mp3', EVt.chicken, 0.35],
    ['04-soft-ui-pop.mp3', EVt.fish, 0.35], ['04-soft-ui-pop.mp3', EVt.cloth, 0.35], ['pop-bubble-sound-effect.mp3', EVt.wheat, 0.3],
    ['08-heavy-whoosh.wav', c(3) - 0.35, 0.3],
    ['02-error-denied-buzz.wav', EVt.shakes, 0.32],
    ['pop-bubble-sound-effect.mp3', EVt.shoes, 0.3],
    ['08-heavy-whoosh.wav', c(5) - 0.35, 0.3],
    ['02-error-denied-buzz.wav', EVt.goat, 0.32],
    ['04-counter-tick-number-roll.wav', EVt.half, 0.35], ['04-counter-tick-number-roll-2.wav', EVt.feet, 0.35],
    ['07-riser-build-up.wav', EVt.once - 1.7, 0.3],
    ['03-subtle-digital-impact.mp3', EVt.shells, 0.35], ['03-subtle-digital-impact.mp3', EVt.salt8, 0.35], ['03-subtle-digital-impact.mp3', EVt.metal, 0.35],
    ['06-deep-cinematic-boom.wav', EVt.coins, 0.45],
    ['03-typing-keyboard-burst.wav', EVt.paper, 0.18],
    ['09-notification-ding.wav', EVt.tap + 0.1, 0.4],
    ['07-smooth-transition-whoosh.mp3', c(10) - 0.4, 0.3],
    ['08-soft-success-chime.mp3', EVt.trade, 0.3],
    ['mouse-click-sound-effect.mp3', EVt.comment, 0.4, 0.45],
  ];
  return list;
}

export const Story = ({lang}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const {T, EVt} = useStory(lang);
  const t = frame / FPS;
  // 0.4 s dip to cream at location changes
  let dip = 0;
  const DIPS = [2, 3, 5, 6, 7, 8, 9, 10];
  for (const k of DIPS) { const ct = T.CUTS[k - 1]; dip = Math.max(dip, 1 - Math.abs(t - ct) / 0.2); }
  dip = Math.max(dip, 1 - t / 0.25); // open from cream
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 500}}>
        <Scene lang={lang} />
      </ThreeCanvas>
      <AbsoluteFill style={{backgroundColor: CREAM, opacity: Math.max(0, dip)}} />
      <Audio src={staticFile(`vo/voiceover_${lang}.wav`)} />
      {cues(T, EVt).map(([f, at, v, trim], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={trim ? Math.round(trim * FPS) : undefined}>
          <Audio src={staticFile(`sfx/${f}`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const TH = {
  id: {top: 'BELI AYAM', mid: 'PAKAI BERAS?', tag: 'SEJARAH UANG'},
  en: {top: 'BUY A CHICKEN', mid: 'WITH RICE?', tag: 'HISTORY OF MONEY'},
};
export const Thumb = ({lang}) => {
  const {width, height} = useVideoConfig();
  const tx = TH[lang];
  const ink = '#351f22';
  const word = (txt, size, bg, fg, rot) => (
    <div style={{display: 'inline-block', background: bg, color: fg, fontFamily: '"Inter Display"', fontWeight: 900, fontSize: size, lineHeight: 1.05,
      padding: '14px 34px 20px', border: `10px solid ${ink}`, borderRadius: 28, transform: `rotate(${rot}deg)`, boxShadow: `12px 14px 0 ${ink}`, letterSpacing: -1, whiteSpace: 'nowrap'}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 500}}>
        <Scene lang={lang} thumb={{t: lang === 'id' ? 4.95 : 4.15, pos: [1.4, 1.0, 3.75], look: [1.4, 1.15, 0.9]}} />
      </ThreeCanvas>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 150, gap: 34}}>
        {word(tx.top, 118, '#fff3df', ink, -3)}
        {word(tx.mid, 132, '#e8a83a', ink, 2)}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170}}>
        {word(tx.tag, 72, '#c75b5b', '#fff3df', -2)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
