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
import {buildWorld, LOOK, LOC, storyFx} from './world';
import {buildCameras, camAt} from './shots';
import {skyDome, moon as moonDisc} from './props';
import {CREAM, INK} from './kit';
import {GradeShader, resolveLook, applyGrade} from './lighting';
import {CHAR_TINT} from './char';


const TMPC = new THREE.Color();
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
    const moon = moonDisc();
    const key = new THREE.DirectionalLight('#fff0d8', 2.6);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 0.5; sc.far = 40;
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    const hemi = new THREE.HemisphereLight('#dcecff', '#b09a72', 1.3);
    return {...w, cams, sky, key, hemi, moon};
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
    const grade = new ShaderPass(GradeShader); c.addPass(grade); c.grade = grade;
    c.addPass(new OutputPass());
    c.bokeh = bokeh;
    return c;
  }, [gl, scene, camera]);
  useEffect(() => { composer.setSize(size.width, size.height); composer.setPixelRatio(gl.getPixelRatio()); }, [composer, size, gl]);

  const fref = useRef(frame); fref.current = frame;
  useFrame(() => {
    const t = thumb ? thumb.t : fref.current / FPS;
    let {pos, look, loc, roll, fov} = camAt(built.cams, t);
    if (thumb) { pos = new THREE.Vector3(...thumb.pos).add(new THREE.Vector3(LOC[loc], 0, 0)); look = new THREE.Vector3(...thumb.look).add(new THREE.Vector3(LOC[loc], 0, 0)); }
    camera.position.copy(pos); camera.lookAt(look); if (!thumb && roll) camera.rotateZ(roll);
    // camera shake on impacts (decaying, deterministic)
    let amp = 0;
    for (const sh of storyFx(T, EVt).shakes) { const dt = t - sh.t; if (dt > 0 && dt < sh.dur) amp = Math.max(amp, sh.amp * (1 - dt / sh.dur)); }
    if (amp > 0 && !thumb) { camera.position.x += Math.sin(t * 71) * amp; camera.position.y += Math.sin(t * 53 + 1) * amp; camera.rotation.z += Math.sin(t * 37) * amp * 0.5; }
    camera.fov = thumb ? 80 : (fov || 80); camera.near = 0.1; camera.far = 500; camera.updateProjectionMatrix();
    for (const [name, g] of Object.entries(built.locGroups)) g.visible = name === loc;
    const lk = resolveLook(LOOK[loc], t, {EVt, CUTS: T.CUTS});
    if (!scene.fog) scene.fog = new THREE.Fog('#efe6d2', 14, 55);
    if (!built.world.parent) { scene.add(built.world, built.sky, built.moon, built.key, built.key.target, built.hemi); gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; }
    scene.fog.color.set(lk.fog); scene.fog.near = lk.near; scene.fog.far = lk.far;
    built.sky.material.uniforms.top.value.set(lk.skyTop); built.sky.material.uniforms.bottom.value.set(lk.skyBottom);
    built.sky.position.copy(camera.position);
    built.moon.visible = !!lk.moon;
    if (lk.moon) { built.moon.position.set(camera.position.x - 30, 45, camera.position.z - 120); built.moon.lookAt(camera.position); }
    const ox = LOC[loc];
    const kp = lk.keyPos;
    built.key.color.set(lk.key);
    built.hemi.color.set(lk.hemiSky || '#dcecff'); built.hemi.groundColor.set(lk.hemiGround || '#b09a72');
    applyGrade(composer.grade, lk.grade);
    // characters pick up the scene light a little (cool at night, warm at sunset)
    CHAR_TINT.set('#ffffff').lerp(TMPC.set(lk.hemiSky || '#dcecff'), 0.22).lerp(TMPC.set(lk.key), 0.12);
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
  const C = T.CUTS, E = EVt, sy = (f) => `synth/${f}.wav`;
  // location changes: a different whoosh each time
  const W = ['07-smooth-transition-whoosh.mp3', '08-heavy-whoosh.wav', '05-airy-whoosh.mp3', sy('swish')];
  return [
    ...[2, 3, 4, 5, 6, 7, 8, 9].map((k, i) => [W[i % W.length], C[k - 1] - 0.25, 0.2]),
    // 1 street: walking in, 500 pops up, happy hop, "wait"
    [sy('footsteps_walk'), 0.0, 0.24, E.lima - 0.2],
    [sy('birds'), 0.0, 0.07, C[1]],
    ['08-soft-success-chime.mp3', E.lima, 0.3],
    [sy('boing'), E.enak + 0.1, 0.18],
    [sy('swish'), E.tunggu - 0.12, 0.14],
    [sy('uh_oh'), E.tunggu + 0.05, 0.2],
    // 2 party
    [sy('party_horn'), C[1] + 0.15, 0.2],
    [sy('tada'), E.dua, 0.2],
    [sy('crowd_cheer'), E.dua + 0.1, 0.1],
    ['pop-bubble-sound-effect.mp3', E.dua + 0.05, 0.18],
    ['04-counter-tick-number-roll.wav', E.setengah, 0.26],
    [sy('slide_whistle_down'), E.setengah + 0.25, 0.16],
    // 3 classroom: footsteps with the books, clock ticking, pages, the thesis lands
    [sy('footsteps_walk'), C[2], 0.2, 2.0],
    [sy('clock_tick'), C[2] + 0.3, 0.1],
    [sy('page_flips'), E.ilmu, 0.22],
    [sy('slide_whistle_down'), E.skripsi - 0.25, 0.14],
    ['06-deep-cinematic-boom.wav', E.skripsi + 0.1, 0.32],
    [sy('thud'), E.skripsi + 0.1, 0.3],
    [sy('creak'), E.lemari, 0.18],
    // 4 house: walk up, brochure, the loan
    [sy('footsteps_walk'), C[3], 0.22, E.rumah - C[3]],
    [sy('birds'), C[3], 0.08],
    [sy('boing'), E.rumah + 0.1, 0.14],
    [sy('swish'), E.brosur - 0.05, 0.2],
    [sy('ka_ching'), E.cicilan, 0.24],
    [sy('sparkle'), E.cicilan + 0.15, 0.12],
    [sy('slide_whistle_down'), E.dp + 0.15, 0.2],
    // 5 reunion: friends run in, cheering, generations pop in
    [sy('footsteps_run'), C[4] + 0.2, 0.22, Math.max(0.6, E.terbesar - C[4] - 0.3)],
    [sy('crowd_cheer'), E.reuni + 0.1, 0.14],
    [sy('applause'), E.teman, 0.13],
    [sy('heart_pop'), E.anak, 0.2],
    ['pop-bubble-sound-effect.mp3', E.cucu, 0.22],
    ['04-soft-ui-pop.mp3', E.cicit, 0.22],
    [sy('party_horn'), E.generasi, 0.16],
    [sy('crowd_cheer'), E.generasi + 0.1, 0.14],
    // 6 office: grandpa shuffles in on his cane, the clock, clocking in late, creaky knees
    [sy('cane_shuffle'), C[5], 0.28, 2.6],
    [sy('clock_tick'), C[5] + 0.2, 0.1],
    ['09-notification-ding.wav', E.empat, 0.22],
    [sy('punch_clock'), E.telat - 0.05, 0.3],
    ['02-error-denied-buzz.wav', E.telat + 0.1, 0.18],
    [sy('creak'), E.lutut + 0.1, 0.28],
    // 7 Earth fills up; the crowd runs and fights
    [sy('rumble'), C[6], 0.18],
    ['07-riser-build-up.wav', E.semua, 0.18],
    ['06-deep-cinematic-boom.wav', E.penuh, 0.32],
    [sy('footsteps_run'), E.makanan - 0.3, 0.22, 1.0],
    [sy('crowd_angry'), E.makanan - 0.2, 0.13],
    [sy('swish'), E.air, 0.14],
    [sy('thud'), E.rebutan, 0.26],
    ['03-subtle-digital-impact.mp3', E.rebutan + 0.05, 0.2],
    // 8 warung: frying snacks, grandpa's cane, the memory bubble
    [sy('frying'), C[7], 0.1],
    [sy('cane_shuffle'), C[7], 0.26, 2.2],
    [sy('ka_ching'), E.gorengan, 0.16],
    ['pop-bubble-sound-effect.mp3', E.lalu - 0.4, 0.24],
    // 9 park: birds, walking in, the kind gift
    [sy('birds'), C[8], 0.1],
    [sy('footsteps_walk'), C[8], 0.22, 2.4],
    [sy('footsteps_walk'), E.manfaat - 1.0, 0.18, 0.65],
    ['08-soft-success-chime.mp3', E.manfaat, 0.26],
    ...[0, 1, 2].map((i) => [sy('heart_pop'), E.manfaat + 0.2 + i * 0.15, 0.16]),
    // 10 the question
    [sy('birds'), C[9], 0.08],
    [sy('sparkle'), E.ngapain, 0.16],
    ['pop-bubble-sound-effect.mp3', E.ngapain + 0.2, 0.18],
    [sy('boing'), E.komentar, 0.14],
    ['08-soft-success-chime.mp3', E.komentar + 0.05, 0.3],
    ['mouse-click-sound-effect.mp3', E.komentar + 0.4, 0.4, 0.45],
  ];
}

// Word-by-word captions (1-2 words at a time), timed by letters inside each sentence.
export function captionWords(T) {
  const out = [];
  for (const s of T.S) {
    const words = s.text.split(/\s+/).filter(Boolean);
    const letters = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').length || 1;
    const total = words.reduce((a, w) => a + letters(w), 0);
    let acc = 0; const items = words.map((w) => { const t0 = s.start + (s.end - s.start) * acc / total; acc += letters(w); return {w, t0}; });
    // merge short words with the next one so chunks read naturally
    for (let i = 0; i < items.length; i++) {
      let txt = items[i].w; const t0 = items[i].t0;
      if (letters(items[i].w) <= 3 && i + 1 < items.length && !/[.,!?:;]$/.test(items[i].w)) { i++; txt += ' ' + items[i].w; }
      out.push({text: txt.replace(/[,;:]$/, ''), t0});
    }
    out.push({text: '', t0: s.end + 0.05});
  }
  return out;
}

const Captions = ({T, t}) => {
  const words = useMemo(() => captionWords(T), [T]);
  let cur = null; for (const w of words) if (w.t0 <= t) cur = w;
  if (!cur || !cur.text) return null;
  const age = t - cur.t0, k = Math.min(1, age / 0.12);
  const scale = 1.18 - 0.18 * k;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: '63%', height: 'auto', bottom: 'auto'}}>
      <div style={{fontFamily: '"Inter Display"', fontWeight: 900, fontSize: 92, color: '#fffaf0', letterSpacing: -1,
        WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`, transform: `scale(${scale})`, whiteSpace: 'nowrap'}}>{cur.text}</div>
    </AbsoluteFill>
  );
};

export const Story = ({lang, captions = true}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const {T, EVt} = useStory(lang);
  const t = frame / FPS;
  // 0.4 s dip to cream at location changes
  let dip = 0;
  const DIPS = [2, 3, 4, 5, 6, 7, 8, 9];
  const dipT = DIPS.map((k) => T.CUTS[k - 1]);
  for (const ct of dipT) dip = Math.max(dip, 1 - Math.abs(t - ct) / 0.2);
  dip = Math.max(dip, 1 - t / 0.25); // open from cream
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 500}}>
        <Scene lang={lang} />
      </ThreeCanvas>
      <AbsoluteFill style={{backgroundColor: CREAM, opacity: Math.max(0, dip)}} />
      {storyFx(T, EVt).flashes.map((f, i) => { const dt = t - f.t; const o = dt > 0 && dt < f.dur ? (1 - dt / f.dur) * (f.strength ?? 0.8) : 0; return o > 0 ? <AbsoluteFill key={'f' + i} style={{background: f.color || '#fff4d6', opacity: o, mixBlendMode: 'screen'}} /> : null; })}
      {captions ? <Captions T={T} t={t} /> : null}
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
  id: {top: 'HIDUP', mid: '500 TAHUN?!'},
  en: {top: 'LIVE TO', mid: '500?!'},
};
const THUMB = (EVt) => ({t: EVt.setengah + 0.7, pos: [-0.1, 1.9, -0.6], look: [0.15, 1.75, -4.2]});
export const Thumb = ({lang}) => {
  const {width, height} = useVideoConfig();
  const {EVt} = useStory(lang);
  const tx = TH[lang];
  const ink = '#351f22';
  const word = (txt, size, bg, fg, rot) => (
    <div style={{display: 'inline-block', background: bg, color: fg, fontFamily: '"Inter Display"', fontWeight: 900, fontSize: size, lineHeight: 1.05,
      padding: '14px 34px 20px', border: `10px solid ${ink}`, borderRadius: 28, transform: `rotate(${rot}deg)`, boxShadow: `12px 14px 0 ${ink}`, letterSpacing: -1, whiteSpace: 'nowrap'}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 500}}>
        <Scene lang={lang} thumb={THUMB(EVt)} />
      </ThreeCanvas>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 150, gap: 34}}>
        {word(tx.top, 118, '#fff3df', ink, -3)}
        {word(tx.mid, 132, '#e8a83a', ink, 2)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
