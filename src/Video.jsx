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
    let {pos, look, loc} = camAt(built.cams, t);
    if (thumb) { pos = new THREE.Vector3(...thumb.pos).add(new THREE.Vector3(LOC[loc], 0, 0)); look = new THREE.Vector3(...thumb.look).add(new THREE.Vector3(LOC[loc], 0, 0)); }
    camera.position.copy(pos); camera.lookAt(look);
    // camera shake on impacts (decaying, deterministic)
    let amp = 0;
    for (const sh of storyFx(T, EVt).shakes) { const dt = t - sh.t; if (dt > 0 && dt < sh.dur) amp = Math.max(amp, sh.amp * (1 - dt / sh.dur)); }
    if (amp > 0 && !thumb) { camera.position.x += Math.sin(t * 71) * amp; camera.position.y += Math.sin(t * 53 + 1) * amp; camera.rotation.z += Math.sin(t * 37) * amp * 0.5; }
    camera.fov = 80; camera.near = 0.1; camera.far = 500; camera.updateProjectionMatrix();
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
  const c = (k) => T.CUTS[k - 1];
  const E = EVt;
  return [
    ['05-airy-whoosh.mp3', 0.0, 0.2],
    ['04-counter-tick-number-roll.wav', 0.6, 0.2],
    ['03-subtle-digital-impact.mp3', E.menyiangi + 0.05, 0.18],
    ['pop-bubble-sound-effect.mp3', E.memupuk + 0.2, 0.2],
    ['07-smooth-transition-whoosh.mp3', c(2) - 0.3, 0.2],
    ['06-deep-cinematic-boom.wav', E.panen + 0.5, 0.26],
    ['08-soft-success-chime.mp3', E.merah, 0.26],
    ['08-heavy-whoosh.wav', c(3) - 0.35, 0.24],
    ['04-soft-ui-pop.mp3', E.harga - 0.1, 0.26],
    ['02-error-denied-buzz.wav', E.harga + 0.1, 0.24],
    ['09-notification-ding.wav', E.tetangga, 0.22],
    ['02-error-denied-buzz.wav', E.murah, 0.2],
    ['pop-bubble-sound-effect.mp3', E.mengambil + 0.1, 0.24],
    ['03-subtle-digital-impact.mp3', E.membelah + 0.4, 0.34],
    ['04-soft-ui-pop.mp3', E.dura - 0.15, 0.28],
    ['02-error-denied-buzz.wav', E.dura + 0.6, 0.18],
    ['pop-bubble-sound-effect.mp3', E.sebelah - 0.6, 0.22],
    ['03-subtle-digital-impact.mp3', E.sebelah - 0.05, 0.34],
    ['04-soft-ui-pop.mp3', E.tenera - 0.15, 0.28],
    ['08-soft-success-chime.mp3', E.banyak, 0.26],
    ['07-smooth-transition-whoosh.mp3', E.pinggir - 0.3, 0.22],
    ['05-airy-whoosh.mp3', E.menghela, 0.2],
    ['07-smooth-transition-whoosh.mp3', E.palsu - 0.3, 0.2],
    ['07-riser-build-up.wav', E.dibedakan, 0.14],
    ['06-deep-cinematic-boom.wav', E.bertahun + 0.2, 0.26],
    ['08-heavy-whoosh.wav', c(7) - 0.35, 0.24],
    ['04-soft-ui-pop.mp3', E.pelajaran - 0.1, 0.26],
    ['08-heavy-whoosh.wav', c(8) - 0.35, 0.24],
    ['04-soft-ui-pop.mp3', E.penangkar - 0.1, 0.26],
    ['09-notification-ding.wav', E.izin, 0.24],
    ['pop-bubble-sound-effect.mp3', E.sertifikat - 0.05, 0.24],
    ['pop-bubble-sound-effect.mp3', E.label - 0.05, 0.22],
    ['04-soft-ui-pop.mp3', E.tergiur - 0.05, 0.24],
    ['02-error-denied-buzz.wav', E.tergiur + 0.5, 0.24],
    ['04-counter-tick-number-roll-2.wav', E.mahal - 0.1, 0.22],
    ['08-soft-success-chime.mp3', E.kokoh, 0.22],
    ['05-airy-whoosh.mp3', E.singkirkan + 0.15, 0.24],
    ['03-subtle-digital-impact.mp3', E.singkirkan + 0.75, 0.26],
    ['08-heavy-whoosh.wav', c(11) - 0.35, 0.24],
    ['03-subtle-digital-impact.mp3', E.belah + 0.3, 0.32],
    ['02-error-denied-buzz.wav', E.salah, 0.26],
    ['07-smooth-transition-whoosh.mp3', c(12) - 0.3, 0.2],
    ['06-deep-cinematic-boom.wav', E.menebang + 0.9, 0.3],
    ['03-subtle-digital-impact.mp3', E.menebang + 1.5, 0.26],
    ['08-soft-success-chime.mp3', E.memulai + 0.1, 0.22],
    ['04-counter-tick-number-roll.wav', E.hilang, 0.18],
    ['07-smooth-transition-whoosh.mp3', c(13) - 0.3, 0.2],
    ['07-riser-build-up.wav', E.kesalahan - 0.4, 0.14],
    ['08-soft-success-chime.mp3', E.memilih, 0.3],
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
      out.push({text: txt.replace(/["“”]/g, '').replace(/[,;:]$/, ''), t0});
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

// Screen text cards requested by the user's scene plan (top of frame), timed to the narration.
function cards(T, EVt) {
  const c = (k) => T.CUTS[k - 1];
  const E = EVt;
  return [
    {t0: E.menunggu - 0.2, t1: c(2), text: '4 tahun menunggu…'},
    {t0: E.harga, t1: c(4), text: 'Kenapa harganya murah?'},
    {t0: E.dura - 0.1, t1: c(5), label: 'DURA', color: '#d8413a', text: 'Cangkang tebal, daging tipis, minyak sedikit'},
    {t0: E.tenera - 0.1, t1: c(6), label: 'TENERA', text: 'Cangkang tipis, daging tebal, minyak banyak'},
    {t0: E.palsu - 0.1, t1: c(7), text: 'Bibit palsu tak bisa dibedakan saat masih kecil'},
    {t0: c(8) + 0.1, t1: E.kedua - 0.1, label: 'LANGKAH 1', text: 'Beli dari penangkar resmi yang berizin'},
    {t0: E.kedua, t1: c(9), label: 'LANGKAH 2', text: 'Minta sertifikat / label asal benih'},
    {t0: c(9) + 0.1, t1: c(10), label: 'LANGKAH 3', text: 'Jangan tergiur harga murah'},
    {t0: c(10) + 0.1, t1: c(11), label: 'LANGKAH 4', text: 'Batang kokoh, daun segar. Buang yang kerdil'},
    {t0: c(11) + 0.1, t1: c(12), label: 'LANGKAH 5', text: 'Belah buahnya: cangkang tebal = ada yang salah'},
    {t0: E.hilang - 0.1, t1: c(13), text: '4 tahun hilang…'},
    {t0: E.kesalahan - 0.2, t1: T.total + 1, text: 'Kesalahan terbesar ada saat memilih bibit 🌴'},
  ];
}
const easeBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const ScreenCard = ({T, EVt, t}) => {
  const list = useMemo(() => cards(T, EVt), [T, EVt]);
  const cur = list.find((k) => t >= k.t0 && t < k.t1);
  if (!cur) return null;
  const a = Math.min(1, (t - cur.t0) / 0.28), out = Math.min(1, Math.max(0, (cur.t1 - t) / 0.18));
  const sc = 0.8 + 0.2 * easeBack(a);
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 150, height: 'auto', bottom: 'auto', opacity: Math.min(a * 2, out)}}>
      <div style={{transform: `scale(${sc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0}}>
        {cur.label ? <div style={{background: cur.color || '#5a9a5a', color: '#fffaf0', fontFamily: '"Inter Display"', fontWeight: 900, fontSize: 50, letterSpacing: 2,
          padding: '8px 28px 10px', border: `7px solid ${INK}`, borderRadius: 20, marginBottom: -14, zIndex: 2, boxShadow: `6px 7px 0 ${INK}`}}>{cur.label}</div> : null}
        <div style={{maxWidth: 960, background: '#fff6e4', color: INK, fontFamily: '"Inter Display"', fontWeight: 900, fontSize: 70, lineHeight: 1.12, textAlign: 'center',
          padding: '30px 40px 32px', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `10px 12px 0 ${INK}`, letterSpacing: -0.5}}>{cur.text}</div>
      </div>
    </AbsoluteFill>
  );
};
// Save + share icons for the call to action.
const Icon = ({kind, t, t0}) => {
  if (t < t0) return null;
  const a = Math.min(1, (t - t0) / 0.3), sc = 0.3 + 0.7 * easeBack(a);
  const path = kind === 'save'
    ? <path d="M30 18 h40 a6 6 0 0 1 6 6 v58 l-26 -17 l-26 17 v-58 a6 6 0 0 1 6 -6 z" fill="#fffaf0" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    : <g fill="#fffaf0" stroke={INK} strokeWidth="7" strokeLinejoin="round"><path d="M50 16 l28 26 h-16 v22 h-24 v-22 h-16 z" /><path d="M22 60 v18 h56 v-18" fill="none" strokeLinecap="round" /></g>;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc}) rotate(${(1 - a) * -12}deg)`}}>
      <div style={{width: 170, height: 170, borderRadius: 90, background: kind === 'save' ? '#e8a83a' : '#5a9a5a', border: `9px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="110" height="110" viewBox="0 0 100 100">{path}</svg>
      </div>
      <div style={{marginTop: 14, fontFamily: '"Inter Display"', fontWeight: 900, fontSize: 46, color: '#fffaf0', WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill'}}>{kind === 'save' ? 'SIMPAN' : 'BAGIKAN'}</div>
    </div>
  );
};

export const Story = ({lang, captions = true}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const {T, EVt} = useStory(lang);
  const t = frame / FPS;
  // 0.4 s dip to cream at location changes
  let dip = 0;
  const DIPS = [3, 7, 8, 11];
  const dipT = [...DIPS.map((k) => T.CUTS[k - 1]), EVt.pinggir - 0.12];
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
      <ScreenCard T={T} EVt={EVt} t={t} />
      <Audio src={staticFile(`vo/voiceover_${lang}.wav`)} />
      <Audio src={staticFile('music/bgm_sawit.wav')} volume={0.16} />
      {cues(T, EVt).map(([f, at, v, trim], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={trim ? Math.round(trim * FPS) : undefined}>
          <Audio src={staticFile(`sfx/${f}`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const TH = {
  id: {top: 'BIBIT SAWIT PALSU?!', mid: '4 TAHUN SIA-SIA', tag: 'CEK CANGKANGNYA!'},
};
// Frozen moment: Dura and Tenera halves side by side on the block, with their tags.
const THUMB = (EVt) => ({t: EVt.tenera + 0.6, pos: [-0.13, 1.08, 0.32], look: [-0.13, 0.56, -0.44]});
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
        {word(tx.mid, 90, '#e8a83a', ink, 2)}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 230}}>
        {word(tx.tag, 64, '#5a9a5a', '#fff3df', -2)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
