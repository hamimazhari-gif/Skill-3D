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
const DIPS = [2, 3, 5, 6, 7, 9, 10, 11, 12];
const every = (a, b, step) => { const o = []; for (let t = a; t < b; t += step) o.push(t); return o; };
function cues(T, EVt) {
  const C = T.CUTS, E = EVt, sy = (f) => `synth/${f}.wav`;
  // location changes: a different whoosh each time
  const W = ['07-smooth-transition-whoosh.mp3', '08-heavy-whoosh.wav', '05-airy-whoosh.mp3', sy('swish')];
  const k4 = E.ketuk - 0.1;
  const press = [0, 1, 2, 3, 4].map((i) => E.snooze + i * (E.lima + 0.5 - E.snooze) / 4);
  const shots = [E.kacang + 0.1, E.tik1 - 0.3, E.tik2 - 0.3, E.tik3 - 0.3];
  return [
    ...DIPS.map((k, i) => [W[i % W.length], C[k - 1] - 0.25, 0.2]),
    // 1 street: the pole taps the window, the sleeper snores then pops up, paid coin, TRUE STORY stamp
    ...every(0.3, E.bangunkan + 0.4, 0.42).map((t) => [sy('glass_tap'), t + 0.05, 0.2]),
    [sy('snore'), 0.0, 0.12, Math.max(0.5, E.bangunkan)],
    [sy('coin_drop'), E.dibayar, 0.2, 0.5],
    [sy('slide_whistle_up'), E.bangunkan - 0.15, 0.14],
    [sy('stamp'), E.nyata, 0.36],
    [sy('tada'), E.nyata + 0.1, 0.14],
    // 2 the mill: steam whistle, shuffling workers, the ringing clock, "expensive", "rare"
    [sy('steam_whistle'), C[1] + 0.2, 0.16],
    [sy('footsteps_walk'), C[1], 0.18, Math.max(0.6, E.subuh + 0.2 - C[1])],
    [sy('alarm_bell'), E.masalah, 0.18, 1.2],
    [sy('ka_ching'), E.mahal, 0.22],
    [sy('uh_oh'), E.mahal + 0.35, 0.14],
    [sy('slide_whistle_down'), E.langka + 0.05, 0.16],
    // 3 the title
    [sy('footsteps_walk'), C[2], 0.2, 1.6],
    [sy('party_horn'), E.knocker, 0.18],
    [sy('applause'), E.knocker + 0.2, 0.11],
    [sy('sparkle'), E.knocker + 0.5, 0.12],
    // 4 the rounds
    [sy('footsteps_walk'), C[3], 0.2, Math.max(0.5, k4 - C[3])],
    ...every(k4 + 0.35, C[4], 0.42).map((t) => [sy('glass_tap'), t + 0.05, 0.16]),
    ...[0, 1, 2].map((i) => ['04-soft-ui-pop.mp3', E.pelanggan - 0.1 + i * 0.12, 0.16]),
    // 5 bedroom: snoring, tok tok tok, the shout
    [sy('snore'), C[4], 0.16, Math.max(0.3, E.tok1 - C[4])],
    ...[E.tok1, E.tok2, E.tok3].map((t) => [sy('glass_tap'), t, 0.4]),
    [sy('boing'), E.iya, 0.16],
    [sy('thud'), E.iya + 0.35, 0.16],
    // 6 don't pretend
    ...[...every(C[5] + 0.2, E.jangan - 0.1, 0.42), ...every(E.pergi - 0.1, E.yakin + 0.2, 0.26)].map((t) => [sy('glass_tap'), t + 0.05, 0.18]),
    [sy('slide_whistle_up'), E.jangan - 0.35, 0.12],
    [sy('slide_whistle_down'), E.pura + 0.25, 0.16],
    [sy('slide_whistle_up'), E.yakin - 0.25, 0.14],
    [sy('boing'), E.bangun2, 0.12],
    // 7 London: the pea shooter
    [sy('footsteps_walk'), C[6], 0.2, 1.6],
    [sy('sparkle'), E.kreatif, 0.14],
    ...shots.map((t) => [sy('puff'), t, 0.24]),
    ...shots.map((t) => [sy('pea_tik'), t + 0.3, 0.34]),
    [sy('creak'), E.tik3 + 0.2, 0.16],
    // 8 the pay
    [sy('coin_drop'), E.sen, 0.3],
    [sy('slide_whistle_down'), E.minggu + 0.1, 0.14],
    // 9 who wakes the knocker?
    [sy('snore'), C[8], 0.18, Math.max(0.3, E.siapa - C[8])],
    [sy('clock_tick'), C[8], 0.08],
    [sy('boing'), E.siapa + 0.05, 0.16],
    ...[0, 1, 2].map((i) => ['pop-bubble-sound-effect.mp3', E.pembangun + i * 0.18, 0.18]),
    // 10 night walk to sunrise
    [sy('footsteps_walk'), C[9], 0.18, Math.max(0.5, E.belum + 0.2 - C[9])],
    [sy('footsteps_walk'), E.pulang - 0.1, 0.18, Math.max(0.5, C[10] - E.pulang)],
    [sy('birds'), E.semua - 0.3, 0.12, Math.max(0.5, C[10] - E.semua + 0.3)],
    ['08-soft-success-chime.mp3', E.semua, 0.26],
    // 11 cheap clocks
    [sy('alarm_bell'), C[10] + 0.2, 0.14, Math.max(0.3, E.hilang - C[10] - 0.2)],
    [sy('slide_whistle_down'), E.hilang + 0.05, 0.14],
    [sy('ka_ching'), E.murah, 0.24],
    [sy('crowd_cheer'), E.murah + 0.1, 0.1],
    // 12 today: phone alarm, five snoozes, the question
    [sy('snore'), C[11], 0.14, Math.max(0.3, E.alarm - C[11])],
    [sy('phone_alarm'), E.alarm, 0.18, Math.max(0.5, press[4] - E.alarm)],
    ...press.map((t) => [sy('snooze_tap'), t, 0.4]),
    [sy('swish'), E.langsung - 0.1, 0.16],
    ['04-soft-ui-pop.mp3', E.langsung, 0.2],
    ['pop-bubble-sound-effect.mp3', E.tim, 0.2],
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
  id: {top: 'PROFESI ANEH:', mid: 'ALARM MANUSIA!'},
  en: {top: 'WEIRDEST JOB:', mid: 'HUMAN ALARM!'},
};
const THUMB = (EVt) => ({t: EVt.bangunkan + 0.9, pos: [-1.6, 1.0, 0.9], look: [-3.5, 3.0, -3.6]});
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
        {word(tx.mid, 104, '#e8a83a', ink, 2)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
