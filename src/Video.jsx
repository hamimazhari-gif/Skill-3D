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
const DIPS = [2, 3, 4, 5, 6, 7, 9, 10];

// Storyboard screen text: [time (EV name or 'cutN'), text]; each stays until the next one ('' hides it).
const TITLES = []; // no storyboard yet: only captions
const Titles = ({T, E, t}) => {
  const at = (k) => (/^cut\d+$/.test(k) ? T.CUTS[+k.slice(3) - 1] : E[k]);
  let cur = null; for (const [k, txt] of TITLES) { const t0 = at(k) + (k === 'cut1' ? 0.2 : 0.05); if (t >= t0) cur = {txt, t0}; }
  if (!cur || !cur.txt) return null;
  const longest = Math.max(...cur.txt.split(' | ').map((l) => [...l].length)), fs = longest > 25 ? 46 : longest > 19 ? 54 : 66;
  const u = Math.min(1, (t - cur.t0) / 0.3), s = 0.7 + 0.3 * (1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2));
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 120}}>
      <div style={{maxWidth: 1000, textAlign: 'center', background: '#fff3df', color: INK, fontFamily: '"Inter Display", "Noto Color Emoji"', fontWeight: 900,
        fontSize: fs, lineHeight: 1.08, padding: '16px 34px 20px', border: `9px solid ${INK}`, borderRadius: 26, boxShadow: `12px 14px 0 ${INK}`,
        transform: `scale(${s}) rotate(-1.5deg)`, letterSpacing: -1}}>
        {cur.txt.split(' | ').map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// "Kita mundur satu minggu": a VHS rewind look (scanlines, colour shift, rewind sign) until the cut to 1925.
const Rewind = ({T, E, t}) => {
  const t0 = E.mundur - 0.05, t1 = T.CUTS[2] + 0.15; if (t < t0 || t >= t1) return null;
  const k = Math.min(1, (t - t0) / 0.15, (t1 - t) / 0.2);
  const jit = Math.sin(t * 61) * 6, bar = ((t * 2.3) % 1) * 1920;
  return (
    <AbsoluteFill style={{opacity: k, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(20,10,30,0.22) 0px, rgba(20,10,30,0.22) 4px, rgba(0,0,0,0) 4px, rgba(0,0,0,0) 9px)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'rgba(120,150,255,0.12)', transform: `translateX(${jit}px)`, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: bar, height: 70, background: 'rgba(255,255,255,0.18)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: '"JetBrains Mono", "Noto Color Emoji", monospace', fontWeight: 800, fontSize: 150, color: '#fffaf0', textShadow: `8px 8px 0 ${INK}`, marginTop: -420}}>⏪⏪</div>
        <div style={{fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: 66, color: '#fffaf0', textShadow: `6px 6px 0 ${INK}`, letterSpacing: -2}}>1 MINGGU SEBELUMNYA</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
function cues(T, EVt) {
  const C = T.CUTS, E = EVt, sy = (f) => `synth/${f}.wav`;
  const W = ['07-smooth-transition-whoosh.mp3', '05-airy-whoosh.mp3', sy('swish'), '08-heavy-whoosh.wav'];
  return [
    ...DIPS.map((k, i) => [W[i % W.length], C[k - 1] - 0.25, 0.16]),
    [sy('uh_oh'), E.bukan0, 0.12], [sy('sparkle'), E.sekarang, 0.12],
    [sy('rumble'), C[1] + 0.1, 0.06, 3.0], ['07-riser-build-up.wav', E.tigaRatus - 0.2, 0.1, 1.6], ['06-deep-cinematic-boom.wav', E.miliar, 0.14], [sy('ka_ching'), E.setiapHari, 0.12],
    [sy('frying'), E.mencerna, 0.05, 2.0], ...Array.from({length: 4}, (_, i) => ['pop-bubble-sound-effect.mp3', E.digantiU + i * 0.25, 0.1]),
    [sy('paper_flutter'), E.rontok, 0.12, 1.5], [sy('sparkle'), E.debu, 0.14], [sy('swish'), E.disapu - 0.4, 0.14], [sy('swish'), E.disapu, 0.14],
    [sy('party_horn'), E.pensiun, 0.14], [sy('thud'), E.renovasi, 0.14], [sy('stamp'), E.renovasi + 0.4, 0.12],
    [sy('tense_drone'), E.tapi, 0.1, 2.0], ['02-error-denied-buzz.wav', E.mitos, 0.12], [sy('stamp'), E.mitos, 0.18],
    ['08-soft-success-chime.mp3', E.kecil, 0.14], [sy('heart_pop'), E.tetap, 0.14],
    [sy('boing'), E.berubah, 0.12], [sy('sparkle'), E.ilmiah, 0.16],
    ['pop-bubble-sound-effect.mp3', E.fakta - 0.15, 0.2],
    [sy('boing'), E.komentar, 0.14],
    ['08-soft-success-chime.mp3', E.komentar + 0.05, 0.3],
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
      <Titles T={T} E={EVt} t={t} />
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
  id: {top: 'TUBUHMU BUKAN\nTUBUH TAHUN LALU 🧬', mid: '330 MILIAR SEL / HARI!', bot: ''},
  en: {top: 'TUBUHMU BUKAN\nTUBUH TAHUN LALU 🧬', mid: '330 MILIAR SEL / HARI!', bot: ''},
};
const THUMB = (EVt) => ({t: EVt.bukan0 + 0.4, loc: 'home', pos: [0.2, 1.55, -1.0], look: [0.3, 1.45, -3.6]});
const fit = (txt, size) => { const n = Math.max(...txt.split('\n').map((l) => [...l].length)); return n > 15 ? Math.round(size * 15.5 / n) : size; };
export const Thumb = ({lang}) => {
  const {width, height} = useVideoConfig();
  const {EVt} = useStory(lang);
  const tx = TH[lang];
  const ink = '#351f22';
  const word = (txt, size, bg, fg, rot) => (
    <div style={{display: 'inline-block', background: bg, color: fg, fontFamily: '"Inter Display", "Noto Color Emoji"', fontWeight: 900, fontSize: size, lineHeight: 1.05,
      padding: '14px 34px 20px', border: `10px solid ${ink}`, borderRadius: 28, transform: `rotate(${rot}deg)`, boxShadow: `12px 14px 0 ${ink}`, letterSpacing: -1, whiteSpace: 'pre', textAlign: 'center'}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 500}}>
        <Scene lang={lang} thumb={THUMB(EVt)} />
      </ThreeCanvas>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 150, gap: 34}}>
        {word(tx.top, fit(tx.top, 84), '#fff3df', ink, -3)}
        {word(tx.mid, fit(tx.mid, 74), '#e8a83a', ink, 2)}
      </AbsoluteFill>
      {tx.bot ? <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 260}}>{word(tx.bot, 88, '#7fb35a', '#fff3df', -2)}</AbsoluteFill> : null}
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
        {word(tx.top, 84, '#fff3df', ink, -3)}
        {word(tx.mid, 74, '#e8a83a', ink, 2)}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>{word(tx.bot, 88, '#7fb35a', '#fff3df', -2)}</AbsoluteFill>
    </AbsoluteFill>
  );
};
