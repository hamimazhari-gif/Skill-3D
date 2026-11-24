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
const DIPS = [4, 5, 6, 8, 9, 10, 11];
function cues(T, EVt) {
  const C = T.CUTS, E = EVt, sy = (f) => `synth/${f}.wav`;
  const W = ['07-smooth-transition-whoosh.mp3', '05-airy-whoosh.mp3', sy('swish'), '08-heavy-whoosh.wav'];
  const pass = ['sayur', 'angkot', 'warung', 'nenek', 'cucu'].map((k) => E[k] + 0.1);
  return [
    ...DIPS.map((k, i) => [W[i % W.length], C[k - 1] - 0.25, 0.18]),
    // 1 the note on the ATM: dawn birds, sparkle on "hundred thousand", the sign pops
    [sy('birds'), 0, 0.08, C[1]],
    ['04-soft-ui-pop.mp3', 0.25, 0.18],
    [sy('sparkle'), E.seratus, 0.16],
    ['pop-bubble-sound-effect.mp3', E.perjalanan - 0.1, 0.2],
    [sy('tada'), E.satuhari, 0.12],
    // 2 six o'clock: steps, keypad, cash dispenser, kiss, payday!
    [sy('clock_tick'), C[1], 0.12, 1.2],
    [sy('footsteps_walk'), C[1], 0.18, Math.max(0.6, E.jam6 + 1.0 - C[1])],
    [sy('atm_beep'), E.jam6 + 1.0, 0.2],
    [sy('cash_dispense'), E.atm - 0.75, 0.3],
    [sy('kiss'), E.cium, 0.4],
    [sy('heart_pop'), E.cium + 0.15, 0.16],
    [sy('party_horn'), E.gajian, 0.14],
    [sy('sparkle'), E.sayang, 0.14],
    // 3 an hour later: walking off, the clock runs, the love fades
    [sy('footsteps_walk'), C[2], 0.16, Math.max(0.5, C[3] - C[2] - 0.2)],
    [sy('clock_tick'), E.tapi, 0.16, Math.max(0.5, E.sejam + 0.4 - E.tapi)],
    [sy('slide_whistle_down'), E.sejam, 0.16],
    // 4 the café: espresso, the note breaks (puff), change pops out, the till
    [sy('espresso'), C[3] + 0.05, 0.14],
    [sy('puff'), E.pecah - 0.05, 0.3],
    [sy('ka_ching'), E.pecah + 0.05, 0.2],
    ...[0, 1, 2].map((i) => ['pop-bubble-sound-effect.mp3', E.pecah + 0.05 + i * 0.12, 0.18]),
    [sy('heart_pop'), E.kopi - 0.2, 0.12],
    // 5 the parking attendant
    [sy('scooter'), C[4] + 0.1, 0.08],
    [sy('puff'), E.muncul - 0.05, 0.26],
    [sy('boing'), E.muncul, 0.14],
    [sy('paper_flutter'), E.parkir + 0.35, 0.3],
    [sy('slide_whistle_down'), E.parkir + 0.9, 0.12],
    [sy('uh_oh'), E.tadi + 0.1, 0.12],
    [sy('whistle_prit'), E.prit - 0.02, 0.22],
    [sy('scooter'), E.terus - 0.1, 0.14],
    // 6 noon: notification, FLASH SALE
    [sy('clock_tick'), C[5], 0.1, 1.0],
    ['09-notification-ding.wav', E.aplikasi, 0.2],
    ['07-riser-build-up.wav', E.flash - 0.9, 0.1, 0.9],
    [sy('tada'), E.flash, 0.18],
    [sy('sparkle'), E.flash + 0.15, 0.12],
    // 7 "no! no!" — checkout anyway
    ['02-error-denied-buzz.wav', E.jangan, 0.12],
    ['04-soft-ui-pop.mp3', E.kelima - 0.1, 0.16],
    ['mouse-click-sound-effect.mp3', E.checkout - 0.1, 0.45, 0.4],
    [sy('ka_ching'), E.checkout, 0.2],
    [sy('swish'), E.checkout + 0.1, 0.16],
    [sy('thud'), E.checkout + 0.4, 0.18],
    // 8 the kampung: hand to hand
    [sy('birds'), C[7], 0.07, Math.max(0.5, C[8] - C[7])],
    [sy('sparkle'), E.beruntung, 0.14],
    ...pass.map((t) => [sy('paper_flutter'), t, 0.22]),
    [sy('horn'), E.angkot + 0.2, 0.14],
    [sy('party_horn'), E.jajan, 0.12],
    // 9 into the piggy bank
    [sy('slot_drop'), E.celengan + 0.3, 0.3],
    [sy('coin_drop'), E.celengan + 0.45, 0.12],
    [sy('snore'), E.istirahat, 0.08, Math.max(0.5, C[9] - E.istirahat - 0.2)],
    // 10 night: the wallet is empty
    [sy('clock_tick'), C[9], 0.12, Math.max(0.5, E.dompet - C[9])],
    [sy('velcro'), E.dompet - 0.1, 0.3],
    [sy('fly_buzz'), E.dompet + 0.25, 0.14],
    [sy('uh_oh'), E.kemana, 0.12],
    [sy('slide_whistle_down'), E.beli + 0.1, 0.14],
    // 11 the money log; disappearing
    [sy('page_flips'), E.catat, 0.14, 0.8],
    ['06-digital-glitch-tech-blip.mp3', E.hilang, 0.12],
    [sy('puff'), E.sadar - 0.1, 0.24],
    // 12 the question
    ['04-soft-ui-pop.mp3', C[11] + 0.05, 0.18],
    ['pop-bubble-sound-effect.mp3', E.tanya + 0.2, 0.2],
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
  id: {top: 'UANG 100 RIBU', mid: 'HABIS KE MANA?!'},
  en: {top: 'MY Rp100K', mid: 'WHERE DID IT GO?!'},
};
const THUMB = (EVt) => ({t: EVt.seratus + 0.7, pos: [-0.15, 1.05, -1.05], look: [-0.25, 1.15, -2.0]});
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
