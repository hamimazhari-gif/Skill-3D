import React, {useMemo, useRef, useEffect} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {makeTiming, EV, LABELS, FPS, letterTime} from './timing';
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
    if (thumb && thumb.loc) loc = thumb.loc;
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
const DIPS = [2, 4, 6, 8, 9, 11];
// On-screen scene titles from the user's storyboard: [first narration shot, text]
const TITLES = [[1, 'GAJI SAMA, NASIB BEDA 😮'], [2, 'JAKARTA: BERTAHAN HIDUP 🥵'], [4, 'BALI: FEED MEWAH, DOMPET SEDERHANA 📸'],
  [6, 'JOGJA: CUKUP & SANTAI ☕'], [8, 'KOTA KECIL: DIPANGGIL BOS 😎'], [9, 'DESA: SULTAN, TAPI SINYAL DI ATAS POHON 📶🌳'], [11, 'BUKAN SOAL BESAR GAJI… 🤔']];
const Titles = ({T, t}) => {
  let cur = null; for (const [k, txt] of TITLES) if (t >= T.CUTS[k - 1]) cur = {txt, t0: T.CUTS[k - 1] + (k === 1 ? 0.25 : 0.15)};
  if (!cur || t < cur.t0) return null;
  const u = Math.min(1, (t - cur.t0) / 0.3), sc = u < 1 ? 0.6 + 0.4 * (1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2)) : 1;
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 120}}>
      <div style={{maxWidth: 940, textAlign: 'center', background: '#fff3df', color: INK, fontFamily: '"Inter Display", "Noto Color Emoji"', fontWeight: 900,
        fontSize: 64, lineHeight: 1.12, padding: '18px 34px 22px', border: `9px solid ${INK}`, borderRadius: 26, boxShadow: `10px 12px 0 ${INK}`,
        transform: `scale(${sc}) rotate(-1.5deg)`, letterSpacing: -1}}>{cur.txt}</div>
    </AbsoluteFill>
  );
};
function cues(T, EVt) {
  const C = T.CUTS, E = EVt, sy = (f) => `synth/${f}.wav`;
  const W = ['07-smooth-transition-whoosh.mp3', '05-airy-whoosh.mp3', sy('swish'), '08-heavy-whoosh.wav'];
  return [
    ...DIPS.map((k, i) => [W[i % W.length], C[k - 1] - 0.25, 0.18]),
    // 1 the line-up: salary, five places, "very different"
    [sy('crowd_murmur'), 0, 0.06, C[1]],
    [sy('ka_ching'), E.juta, 0.2],
    [sy('sparkle'), E.juta + 0.2, 0.12],
    ...[0, 1, 2, 3, 4].map((i) => ['pop-bubble-sound-effect.mp3', E.tempat - 0.1 + i * 0.12, 0.16]),
    [sy('tada'), E.beda, 0.14],
    // 2 Jakarta: traffic, expenses out of the wallet, the calendar
    [sy('scooter'), C[1] + 0.1, 0.08],
    ...['kos', 'ojol', 'makan', 'kopi'].map((k) => [sy('coin_drop'), E[k] - 0.05, 0.14, 0.4]),
    [sy('horn'), E.ojol + 0.1, 0.1],
    [sy('espresso'), E.kopi + 0.05, 0.08, 0.8],
    [sy('paper_flutter'), E.tgl15 - 0.1, 0.18],
    [sy('slide_whistle_down'), E.kurus, 0.14],
    [sy('paper_flutter'), E.tgl20 - 0.1, 0.18],
    [sy('uh_oh'), E.tgl20 + 0.2, 0.12],
    // 3 boarding room
    [sy('clock_tick'), C[2], 0.1, C[3] - C[2]],
    [sy('slide_whistle_down'), E.sabar, 0.1],
    // 4-5 Bali: waves, camera shutter, likes; the shack
    [sy('birds'), C[3], 0.06, C[5] - C[3]],
    ['mouse-click-sound-effect.mp3', E.insta - 0.05, 0.4, 0.4],
    ['09-notification-ding.wav', E.insta + 0.3, 0.14],
    [sy('heart_pop'), E.sunset, 0.14],
    [sy('sparkle'), E.mewah, 0.16],
    [sy('slide_whistle_down'), E.balik, 0.12],
    [sy('paper_flutter'), C[4] + 0.1, 0.12],
    // 6-7 Jogja: night street, coffee, coins
    [sy('crowd_murmur'), C[5], 0.05, C[7] - C[5]],
    [sy('frying'), C[5], 0.05, C[6] - C[5]],
    [sy('coin_drop'), E.nabung, 0.2],
    [sy('uh_oh'), E.mantan + 0.2, 0.1],
    // 8 small town: "Bos!"
    [sy('footsteps_walk'), C[7], 0.16, Math.max(0.5, E.kota + 1.3 - C[7])],
    [sy('party_horn'), E.bos, 0.12],
    [sy('sparkle'), E.bos + 0.1, 0.12],
    [sy('ka_ching'), E.traktir, 0.14],
    // 9 the village: birds, savings, sultan, no signal
    [sy('birds'), C[8], 0.08, C[10] - C[8]],
    [sy('coin_drop'), E.tabungan, 0.18],
    [sy('tada'), E.sultan, 0.16],
    ['02-error-denied-buzz.wav', E.masalah, 0.12],
    // 10 up the palm
    [sy('creak'), C[9] + 0.1, 0.12],
    ['09-notification-ding.wav', E.halo + 1.0, 0.16],
    // 11-12 the moral and the question
    ['04-soft-ui-pop.mp3', E.biaya - 0.1, 0.18],
    ['04-soft-ui-pop.mp3', E.gaya - 0.1, 0.18],
    [sy('coin_drop'), E.biaya, 0.16],
    ['pop-bubble-sound-effect.mp3', E.kotamana - 0.2, 0.2],
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
    let acc = 0; const items = words.map((w) => { const t0 = letterTime(s, acc); acc += w.replace(/[^a-zA-Z0-9]/g, '').length; return {w, t0}; });
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
      <Titles T={T} t={t} />
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
  id: {top: 'GAJI SAMA 5 JUTA', mid: 'NASIB BEDA! 😮', bot: 'SIAPA PALING KAYA?'},
  en: {top: 'GAJI SAMA 5 JUTA', mid: 'NASIB BEDA! 😮', bot: 'SIAPA PALING KAYA?'},
};
const THUMB = (EVt) => ({t: 1.0, loc: 'poster', pos: [0, 1.55, 3.3], look: [0, 1.5, -1.0]});
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
        {word(tx.top, 96, '#fff3df', ink, -3)}
        {word(tx.mid, 104, '#e8a83a', ink, 2)}
      </AbsoluteFill>
      {tx.bot ? <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 260}}>{word(tx.bot, 84, '#7fb35a', '#fff3df', -2)}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

// One square "photo" of a scene moment (no captions or overlays), for the collage thumbnail.
export const Photo = ({lang, t, loc, pos, look}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 500}}>
        <Scene lang={lang} thumb={{t, loc, pos, look}} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// Collage thumbnail: polaroid photos of each person at home, pinned at angles, with the title blocks.
const COLLAGE = [
  {img: 'thumbparts/photo_1.png', label: 'JAKARTA', x: 30, y: 390, r: -6, w: 440},
  {img: 'thumbparts/photo_2.png', label: 'BALI', x: 600, y: 405, r: 5, w: 440},
  {img: 'thumbparts/photo_4.png', label: 'KOTA KECIL', x: 30, y: 1140, r: 4, w: 440},
  {img: 'thumbparts/photo_5.png', label: 'DESA', x: 605, y: 1120, r: -5, w: 440},
  {img: 'thumbparts/photo_3.png', label: 'JOGJA', x: 345, y: 850, r: -2, w: 390},
]
export const ThumbCollage = ({lang}) => {
  const tx = TH[lang];
  const ink = '#351f22';
  const word = (txt, size, bg, fg, rot) => (
    <div style={{display: 'inline-block', background: bg, color: fg, fontFamily: '"Inter Display", "Noto Color Emoji"', fontWeight: 900, fontSize: size, lineHeight: 1.05,
      padding: '14px 34px 20px', border: `10px solid ${ink}`, borderRadius: 28, transform: `rotate(${rot}deg)`, boxShadow: `12px 14px 0 ${ink}`, letterSpacing: -1, whiteSpace: 'nowrap'}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #f6e3c0 0%, #e8c99a 70%, #d9b07a 100%)'}}>
      {COLLAGE.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: p.w, padding: '18px 18px 0', background: '#fffaf0', border: `6px solid ${ink}`,
          boxShadow: `10px 14px 0 rgba(53,31,34,0.55)`, transform: `rotate(${p.r}deg)`}}>
          <Img src={staticFile(p.img)} style={{width: p.w - 48, height: p.w - 48, display: 'block', border: `4px solid ${ink}`}} />
          <div style={{fontFamily: '"Inter Display"', fontWeight: 900, fontSize: 46, color: ink, textAlign: 'center', padding: '10px 0 14px'}}>{p.label}</div>
          <div style={{position: 'absolute', top: -22, left: p.w / 2 - 55, width: 110, height: 40, background: 'rgba(242,210,74,0.8)', transform: 'rotate(-4deg)'}} />
        </div>
      ))}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 70, gap: 26}}>
        {word(tx.top, 96, '#fff3df', ink, -3)}
        {word(tx.mid, 104, '#e8a83a', ink, 2)}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>{word(tx.bot, 84, '#7fb35a', '#fff3df', -2)}</AbsoluteFill>
    </AbsoluteFill>
  );
};
