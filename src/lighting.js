// Lighting presets + time-keyed lighting per location + mood grading.
// A LOOK entry is either a flat look ({...LOOK_PRESETS.day, keyPos: [...]}) or {keys: [{at, ...look}, ...]},
// where `at` is a number (seconds), an EV word name, or 'cutN' (start of narration shot N). Values between keys
// are interpolated (colours in linear space, numbers and arrays linearly, booleans switch at the midpoint).
import * as THREE from 'three';

// grade: sat (1 = unchanged), contrast (1 = unchanged), tint colour + tintAmt (0..1), vignette strength.
export const LOOK_PRESETS = {
  dawn: {clouds: 0.6, fog: '#e9d6d2', near: 14, far: 55, skyTop: '#8fa9d6', skyBottom: '#f4c9b0', key: '#ffd2b0', keyI: 2.0, hemiI: 1.2, keyPos: [-8, 4, 6],
    hemiSky: '#cfd8f0', hemiGround: '#a08a7a', grade: {sat: 0.95, contrast: 1.0, tint: '#ffd8c8', tintAmt: 0.08, vignette: 0.3}},
  day: {clouds: 0.85, fog: '#efe6d2', near: 14, far: 55, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#fff0d8', keyI: 2.6, hemiI: 1.35, keyPos: [-6, 10, 7],
    grade: {sat: 1.0, contrast: 1.0, tintAmt: 0, vignette: 0.3}},
  noon: {clouds: 0.7, fog: '#f4efe2', near: 16, far: 60, skyTop: '#7fb8e6', skyBottom: '#eef3f0', key: '#ffffff', keyI: 3.0, hemiI: 1.45, keyPos: [-3, 14, 3],
    grade: {sat: 1.05, contrast: 1.05, tintAmt: 0, vignette: 0.25}},
  goldenHour: {clouds: 0.75, fog: '#f6dcb4', near: 12, far: 50, skyTop: '#9fbde0', skyBottom: '#ffd9a0', key: '#ffcf8a', keyI: 2.6, hemiI: 1.2, keyPos: [-9, 5, 6],
    grade: {sat: 1.08, contrast: 1.02, tint: '#ffc880', tintAmt: 0.1, vignette: 0.32}},
  sunset: {clouds: 0.8, fog: '#f1cfa6', near: 12, far: 50, skyTop: '#e8a27a', skyBottom: '#f8dcb0', key: '#ffc48a', keyI: 2.5, hemiI: 1.15, keyPos: [-8, 7, 6],
    grade: {sat: 1.05, contrast: 1.0, tint: '#ffb070', tintAmt: 0.12, vignette: 0.35}},
  dusk: {fog: '#8a7f9a', near: 10, far: 45, skyTop: '#3f4a7a', skyBottom: '#d99a8a', key: '#ff9a6a', keyI: 1.5, hemiI: 0.9, keyPos: [-9, 3, 5],
    hemiSky: '#8a90c0', hemiGround: '#6a5a5a', grade: {sat: 0.95, contrast: 1.05, tint: '#b8a0d8', tintAmt: 0.1, vignette: 0.4}},
  night: {fog: '#1c2436', near: 10, far: 45, skyTop: '#0e1626', skyBottom: '#34405a', key: '#a9c4ff', keyI: 1.1, hemiI: 0.55, keyPos: [-6, 12, -4], moon: true,
    hemiSky: '#6a80b0', hemiGround: '#2a2a3a', grade: {sat: 0.9, contrast: 1.08, tint: '#7a9ad8', tintAmt: 0.08, vignette: 0.45}},
  overcast: {clouds: 1.0, fog: '#d4d6d4', near: 10, far: 45, skyTop: '#b4bcc4', skyBottom: '#dedfdc', key: '#f0f0f0', keyI: 1.4, hemiI: 1.6, keyPos: [-4, 12, 4],
    grade: {sat: 0.82, contrast: 0.97, tintAmt: 0, vignette: 0.3}},
  storm: {fog: '#5a6470', near: 8, far: 38, skyTop: '#2e3640', skyBottom: '#6a747c', key: '#c8d4e0', keyI: 0.9, hemiI: 1.0, keyPos: [-4, 12, 2],
    hemiSky: '#8a96a4', hemiGround: '#3a3a40', grade: {sat: 0.7, contrast: 1.12, tint: '#9ab0c8', tintAmt: 0.1, vignette: 0.5}},
  winter: {clouds: 0.7, fog: '#e6edf3', near: 10, far: 45, skyTop: '#a9c2da', skyBottom: '#eef2f5', key: '#e8f0ff', keyI: 2.1, hemiI: 1.6, keyPos: [-6, 8, 6],
    hemiSky: '#e0ecff', hemiGround: '#c8d0d8', grade: {sat: 0.85, contrast: 1.0, tint: '#cfe0ff', tintAmt: 0.08, vignette: 0.28}},
  desert: {clouds: 0.35, fog: '#f0d8a8', near: 14, far: 60, skyTop: '#86b8e0', skyBottom: '#f6e2b8', key: '#fff0c8', keyI: 3.0, hemiI: 1.3, keyPos: [-4, 13, 4],
    hemiSky: '#cfe0f0', hemiGround: '#d8b880', grade: {sat: 1.1, contrast: 1.06, tint: '#ffd890', tintAmt: 0.08, vignette: 0.3}},
  interiorWarm: {fog: '#3a2a26', near: 8, far: 30, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#ffe2b8', keyI: 2.4, hemiI: 1.25, keyPos: [-4, 8, 8],
    grade: {sat: 1.0, contrast: 1.02, tint: '#ffd0a0', tintAmt: 0.05, vignette: 0.38}},
  interiorCool: {fog: '#2e3440', near: 8, far: 30, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#f2f6ff', keyI: 2.4, hemiI: 1.4, keyPos: [-4, 8, 8],
    grade: {sat: 0.95, contrast: 1.0, tint: '#d8e6ff', tintAmt: 0.05, vignette: 0.32}},
  candle: {fog: '#1a1418', near: 6, far: 26, skyTop: '#0e1626', skyBottom: '#34405a', key: '#ffb870', keyI: 1.3, hemiI: 0.55, keyPos: [-3, 6, 6],
    hemiSky: '#7a5a4a', hemiGround: '#2a1a1a', grade: {sat: 1.0, contrast: 1.1, tint: '#ffa860', tintAmt: 0.12, vignette: 0.55}},
  underground: {fog: '#16120f', near: 5, far: 22, skyTop: '#0a0a0a', skyBottom: '#1a1612', key: '#ff9a50', keyI: 1.1, hemiI: 0.45, keyPos: [-2, 5, 4],
    hemiSky: '#5a4a3a', hemiGround: '#1a1410', grade: {sat: 0.9, contrast: 1.15, tint: '#ff9a50', tintAmt: 0.1, vignette: 0.6}},
  underwater: {fog: '#2f7a8a', near: 3, far: 24, skyTop: '#3fa0b8', skyBottom: '#1a5a6a', key: '#bff0ff', keyI: 1.6, hemiI: 1.2, keyPos: [-2, 12, 2],
    hemiSky: '#9fe0f0', hemiGround: '#1a4a5a', grade: {sat: 0.9, contrast: 0.98, tint: '#7fd0e0', tintAmt: 0.18, vignette: 0.45}},
};

// Mood overlays you can spread on top of a preset for one beat: {...LOOK_PRESETS.day, ...MOODS.tense}
export const MOODS = {
  tense: {grade: {sat: 0.8, contrast: 1.12, tint: '#9ab0c8', tintAmt: 0.08, vignette: 0.55}},
  sad: {grade: {sat: 0.65, contrast: 0.95, tint: '#a8b4d0', tintAmt: 0.12, vignette: 0.5}},
  joyful: {grade: {sat: 1.15, contrast: 1.03, tint: '#ffe0a0', tintAmt: 0.06, vignette: 0.22}},
  danger: {grade: {sat: 0.95, contrast: 1.15, tint: '#ff6a50', tintAmt: 0.12, vignette: 0.55}},
  mystery: {grade: {sat: 0.8, contrast: 1.1, tint: '#8a7ad0', tintAmt: 0.12, vignette: 0.55}},
  nostalgic: {grade: {sat: 0.8, contrast: 0.96, tint: '#e8c89a', tintAmt: 0.15, vignette: 0.42}},
};

const DEF_GRADE = {sat: 1, contrast: 1, tint: '#ffffff', tintAmt: 0, vignette: 0.32};
const C1 = new THREE.Color(), C2 = new THREE.Color();
function lerpVal(a, b, u) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * u;
  if (typeof a === 'string' && typeof b === 'string' && a[0] === '#' && b[0] === '#') return '#' + C1.set(a).lerp(C2.set(b), u).getHexString();
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => x + (b[i] - x) * u);
  if (a && b && typeof a === 'object') { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = lerpVal(a[k] ?? b[k], b[k] ?? a[k], u); return o; }
  return u < 0.5 ? a : b;
}

// Resolve a LOOK entry at time t. ctx: {EVt, CUTS}.
export function resolveLook(entry, t, ctx) {
  const base = (l) => ({...l, grade: {...DEF_GRADE, ...(l.grade || {})}});
  if (!entry.keys) return base(entry);
  const time = (at) => (typeof at === 'number' ? at : /^cut\d+$/.test(at) ? ctx.CUTS[+at.slice(3) - 1] : ctx.EVt[at]);
  const K = entry.keys.map((k) => ({t: time(k.at), look: base({...entry.base, ...k, at: undefined})})).sort((a, b) => a.t - b.t);
  if (t <= K[0].t) return K[0].look;
  for (let i = 0; i < K.length - 1; i++) {
    if (t <= K[i + 1].t) { const u = (t - K[i].t) / Math.max(1e-3, K[i + 1].t - K[i].t); const s = u * u * (3 - 2 * u); return lerpVal(K[i].look, K[i + 1].look, s); }
  }
  return K[K.length - 1].look;
}

// Post pass: vignette + saturation + contrast + tint.
export const GradeShader = {
  uniforms: {tDiffuse: {value: null}, strength: {value: 0.32}, sat: {value: 1}, contrast: {value: 1}, tint: {value: new THREE.Color('#ffffff')}, tintAmt: {value: 0}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float strength; uniform float sat; uniform float contrast; uniform vec3 tint; uniform float tintAmt; varying vec2 vUv;
void main(){
  vec4 c = texture2D(tDiffuse, vUv);
  float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  c.rgb = mix(vec3(l), c.rgb, sat);
  c.rgb = (c.rgb - 0.18) * contrast + 0.18;
  c.rgb = mix(c.rgb, c.rgb * tint * 1.6, tintAmt);
  vec2 d = vUv - 0.5; d.x *= 0.75; float v = smoothstep(0.75, 0.2, length(d));
  c.rgb *= mix(1.0 - strength, 1.0, v);
  gl_FragColor = vec4(max(c.rgb, 0.0), c.a);
}`,
};

export function applyGrade(pass, g) {
  pass.uniforms.strength.value = g.vignette; pass.uniforms.sat.value = g.sat; pass.uniforms.contrast.value = g.contrast;
  pass.uniforms.tint.value.set(g.tint || '#ffffff'); pass.uniforms.tintAmt.value = g.tintAmt || 0;
}
