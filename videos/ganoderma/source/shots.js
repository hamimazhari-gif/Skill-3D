// Camera plan: framings. Each entry is one framing inside narration shot `shot`; `from` (EV name) starts a hard cut
// inside that shot (the framing then runs until the next framing / shot end). Keys: {at: 'start' | 'end' | EV, pos, look}
// in location-local coordinates.
import * as THREE from 'three';
import {LOC, CHAR_DESIGN} from './world';
import {headLift} from './char';

// Framings were planned for classic-height characters; keys aimed at people (look height > 0.9 m) rise with the head.
const LIFT = headLift(CHAR_DESIGN) - 0.03;
const ly = (p, k) => (p.lift !== false && k.look[1] > 0.9 ? LIFT : 0);

export const SHOT_PLAN = [
  {shot: 1, lift: false, loc: 'kebun', move: 'wide night: the palm falls', keys: [
    {at: 'start', pos: [0.3, 1.7, 1.2], look: [-1.6, 1.7, -3.0]},
    {at: 'end', pos: [0.0, 1.55, 0.6], look: [-2.2, 0.7, -3.0]}]},
  {shot: 1, from: 'hasan', loc: 'kebun', move: 'Hasan comes out with a lantern', keys: [
    {at: 'start', pos: [3.6, 1.5, 4.0], look: [5.1, 1.2, 1.3]},
    {at: 'end', pos: [3.9, 1.5, 3.4], look: [5.1, 1.2, 1.3]}]},
  {shot: 1, from: 'tumbang', lift: false, loc: 'kebun', move: 'over Hasan to the fallen palm', keys: [
    {at: 'start', pos: [4.3, 1.8, 2.8], look: [-1.9, 0.5, -3.0]},
    {at: 'end', pos: [4.0, 1.7, 2.4], look: [-1.9, 0.5, -3.0]}]},
  {shot: 1, from: 'angin', loc: 'kebun', move: 'close-up: no wind, no rain', keys: [
    {at: 'start', pos: [4.9, 1.5, 2.35], look: [5.1, 1.42, 1.3]},
    {at: 'end', pos: [4.85, 1.5, 2.15], look: [5.1, 1.42, 1.3]}]},
  {shot: 2, loc: 'kebun', move: 'dawn: Hasan at the fallen palm', keys: [
    {at: 'start', pos: [0.6, 1.6, 0.8], look: [-1.2, 0.9, -2.6]},
    {at: 'end', pos: [0.3, 1.5, 0.3], look: [-1.2, 0.9, -2.6]}]},
  {shot: 2, from: 'pangkal', lift: false, loc: 'kebun', move: 'macro: the rotten base', keys: [
    {at: 'start', pos: [-1.15, 0.85, -1.8], look: [-1.6, 0.35, -3.0]},
    {at: 'end', pos: [-1.25, 0.75, -2.05], look: [-1.6, 0.35, -3.0]}]},
  {shot: 2, from: 'busuk', loc: 'kebun', move: 'close-up: grimace', keys: [
    {at: 'start', pos: [-0.4, 1.45, -0.9], look: [-0.55, 1.4, -2.0]},
    {at: 'end', pos: [-0.42, 1.45, -1.05], look: [-0.55, 1.4, -2.0]}]},
  {shot: 3, loc: 'kebun', move: 'medium: just bad luck', keys: [
    {at: 'start', pos: [1.3, 1.5, 0.4], look: [0.9, 1.3, -1.7]},
    {at: 'end', pos: [1.2, 1.48, 0.1], look: [0.9, 1.3, -1.7]}]},
  {shot: 3, from: 'bulan', lift: false, loc: 'kebun', move: 'months later: crane over the sickening palms', keys: [
    {at: 'start', pos: [-0.5, 3.2, 3.5], look: [2.0, 1.5, -5.0]},
    {at: 'end', pos: [0.0, 2.6, 2.0], look: [2.0, 1.4, -5.0]}]},
  {shot: 3, from: 'berikutnya', loc: 'kebun', move: 'close-up: the next one too', keys: [
    {at: 'start', pos: [1.1, 1.45, -0.6], look: [0.9, 1.4, -1.7]},
    {at: 'end', pos: [1.08, 1.45, -0.75], look: [0.9, 1.4, -1.7]}]},
  {shot: 4, lift: false, loc: 'kebun', move: 'looking up at pale fronds', keys: [
    {at: 'start', pos: [1.6, 1.6, 0.2], look: [2.8, 2.3, -3.0]},
    {at: 'end', pos: [1.8, 1.5, -0.4], look: [2.8, 2.3, -3.0]}]},
  {shot: 4, from: 'pelepah', lift: false, loc: 'kebun', move: 'broken fronds hanging', keys: [
    {at: 'start', pos: [3.9, 1.45, -0.7], look: [2.8, 1.3, -3.0]},
    {at: 'end', pos: [3.65, 1.35, -1.15], look: [2.8, 1.3, -3.0]}]},
  {shot: 4, from: 'pucuk', lift: false, loc: 'kebun', move: 'high: spear leaves at the top', keys: [
    {at: 'start', pos: [3.5, 3.6, -1.3], look: [2.8, 2.9, -3.0]},
    {at: 'end', pos: [3.25, 3.8, -1.75], look: [2.8, 2.9, -3.0]}]},
  {shot: 5, loc: 'kebun', move: 'wide: Kakek walks in', keys: [
    {at: 'start', pos: [2.6, 1.6, 2.8], look: [3.4, 1.0, -2.2]},
    {at: 'end', pos: [2.3, 1.5, 2.0], look: [2.8, 1.0, -2.3]}]},
  {shot: 5, from: 'berjongkok', lift: false, loc: 'kebun', move: 'low: Kakek crouches and points', keys: [
    {at: 'start', pos: [1.95, 0.85, -0.55], look: [2.5, 0.55, -2.6]},
    {at: 'end', pos: [2.15, 0.8, -0.85], look: [2.5, 0.55, -2.6]}]},
  {shot: 5, from: 'cokelat', lift: false, loc: 'kebun', move: 'macro: the fan-shaped brackets', keys: [
    {at: 'start', pos: [2.9, 0.6, -1.8], look: [2.8, 0.3, -2.66]},
    {at: 'end', pos: [2.86, 0.55, -1.95], look: [2.8, 0.3, -2.66]}]},
  {shot: 5, from: 'ganoderma', lift: false, loc: 'kebun', move: 'close-up: Ganoderma!', keys: [
    {at: 'start', pos: [1.85, 1.2, -1.25], look: [2.05, 1.1, -2.3]},
    {at: 'end', pos: [1.88, 1.2, -1.42], look: [2.05, 1.1, -2.3]}]},
  {shot: 5, from: 'pembunuh', loc: 'kebun', move: 'close-up: Hasan scared', keys: [
    {at: 'start', pos: [1.25, 1.45, -0.85], look: [1.1, 1.4, -1.8]},
    {at: 'end', pos: [1.22, 1.45, -1.0], look: [1.1, 1.4, -1.8]}]},
  {shot: 6, lift: false, loc: 'akar', move: 'underground cutaway: two palms, their roots', keys: [
    {at: 'start', pos: [0, -0.4, 3.6], look: [0, -0.5, 0]},
    {at: 'end', pos: [0, -0.5, 3.2], look: [0, -0.5, 0]}]},
  {shot: 6, from: 'menggerogoti', lift: false, loc: 'akar', move: 'push: rot inside the trunk', keys: [
    {at: 'start', pos: [-0.9, 0.55, 1.9], look: [-1.25, 0.5, -0.2]},
    {at: 'end', pos: [-1.05, 0.6, 1.55], look: [-1.25, 0.5, -0.2]}]},
  {shot: 6, from: 'menular', lift: false, loc: 'akar', move: 'roots touching: the infection crosses', keys: [
    {at: 'start', pos: [0, -0.8, 1.7], look: [0, -0.9, 0]},
    {at: 'end', pos: [0, -0.85, 1.35], look: [0, -0.9, 0]}]},
  {shot: 7, loc: 'kebun', move: 'close-up: where from?', keys: [
    {at: 'start', pos: [-0.15, 1.45, 0.3], look: [-0.3, 1.4, -0.8]},
    {at: 'end', pos: [-0.17, 1.45, 0.15], look: [-0.3, 1.4, -0.8]}]},
  {shot: 7, from: 'tumpukan', loc: 'kebun', move: 'Kakek points to the corner', keys: [
    {at: 'start', pos: [0.6, 1.55, 1.9], look: [0.0, 1.25, -0.8]},
    {at: 'end', pos: [0.3, 1.5, 1.5], look: [-0.3, 1.25, -0.8]}]},
  {shot: 7, from: 'sudut', lift: false, loc: 'kebun', move: 'pan to the pile of old stumps', keys: [
    {at: 'start', pos: [-4.1, 1.5, 1.5], look: [-6.2, 0.5, -1.2]},
    {at: 'end', pos: [-4.55, 1.3, 0.95], look: [-6.2, 0.5, -1.2]}]},
  {shot: 7, from: 'sarang', lift: false, loc: 'kebun', move: 'macro: the nest, spores', keys: [
    {at: 'start', pos: [-4.7, 1.35, 1.0], look: [-6.1, 0.5, -1.0]},
    {at: 'end', pos: [-4.85, 1.25, 0.8], look: [-6.1, 0.5, -1.0]}]},
  {shot: 8, loc: 'kebun', move: 'two-shot: time to fight', keys: [
    {at: 'start', pos: [0.25, 1.6, 1.4], look: [0.22, 1.3, -0.8]},
    {at: 'end', pos: [0.25, 1.5, 1.0], look: [0.22, 1.3, -0.8]}]},
  {shot: 9, loc: 'kebun', move: 'medium: the sick palm behind them', keys: [
    {at: 'start', pos: [0.9, 1.75, 2.6], look: [1.3, 1.4, -1.6]},
    {at: 'end', pos: [1.0, 1.65, 2.1], look: [1.3, 1.4, -1.6]}]},
  {shot: 9, from: 'membuka', lift: false, loc: 'kebun', move: 'high: spear leaves tagged', keys: [
    {at: 'start', pos: [3.6, 3.3, -0.6], look: [3.3, 3.05, -2.7]},
    {at: 'end', pos: [3.55, 3.35, -0.95], look: [3.3, 3.05, -2.7]}]},
  {shot: 9, from: 'pucat2', lift: false, loc: 'kebun', move: 'pale fronds tagged', keys: [
    {at: 'start', pos: [1.5, 2.3, 0.2], look: [1.85, 2.3, -2.1]},
    {at: 'end', pos: [1.55, 2.3, -0.05], look: [1.85, 2.3, -2.1]}]},
  {shot: 9, from: 'jamur1', lift: false, loc: 'kebun', move: 'brackets tagged', keys: [
    {at: 'start', pos: [3.0, 0.95, -1.0], look: [2.95, 0.4, -2.6]},
    {at: 'end', pos: [3.0, 0.88, -1.2], look: [2.95, 0.4, -2.6]}]},
  {shot: 10, lift: false, loc: 'kebun', move: 'medium: scraping the brackets off', keys: [
    {at: 'start', pos: [2.8, 1.35, 0.2], look: [2.8, 0.65, -2.6]},
    {at: 'end', pos: [2.7, 1.25, -0.2], look: [2.8, 0.65, -2.6]}]},
  {shot: 10, from: 'spora', lift: false, loc: 'kebun', move: 'macro: into the sack', keys: [
    {at: 'start', pos: [2.3, 0.95, -0.85], look: [2.2, 0.45, -2.35]},
    {at: 'end', pos: [2.28, 0.9, -1.0], look: [2.2, 0.45, -2.35]}]},
  {shot: 11, lift: false, loc: 'kebun', move: 'high: digging the isolation trench', keys: [
    {at: 'start', pos: [-2.9, 2.7, -3.3], look: [0.7, 0.0, -7.0]},
    {at: 'end', pos: [-2.6, 2.5, -3.7], look: [0.7, 0.0, -7.0]}]},
  {shot: 11, from: 'memutus', lift: false, loc: 'akar', move: 'cutaway: the trench cuts the roots', keys: [
    {at: 'start', pos: [0.2, -0.4, 2.2], look: [0.15, -0.6, 0]},
    {at: 'end', pos: [0.2, -0.5, 1.9], look: [0.15, -0.6, 0]}]},
  {shot: 12, lift: false, loc: 'kebun', move: 'wide: the sick palm is pulled out', keys: [
    {at: 'start', pos: [1.0, 1.8, 2.4], look: [2.6, 1.6, -3.0]},
    {at: 'end', pos: [0.9, 2.0, 1.8], look: [2.6, 1.8, -3.0]}]},
  {shot: 12, from: 'tinggalkan', lift: false, loc: 'kebun', move: 'no stumps left behind', keys: [
    {at: 'start', pos: [-0.8, 1.1, -1.2], look: [-1.6, 0.5, -3.0]},
    {at: 'end', pos: [-0.9, 1.0, -1.5], look: [-1.6, 0.5, -3.0]}]},
  {shot: 13, lift: false, loc: 'kebun', move: 'medium: clearing the old trunks', keys: [
    {at: 'start', pos: [-3.4, 1.7, 2.4], look: [-5.6, 0.8, -1.0]},
    {at: 'end', pos: [-3.8, 1.6, 1.9], look: [-5.6, 0.8, -1.0]}]},
  {shot: 13, from: 'biarkan', lift: false, loc: 'kebun', move: 'new seedlings in the cleared corner', keys: [
    {at: 'start', pos: [-4.6, 1.05, 1.4], look: [-6.0, 0.5, -1.3]},
    {at: 'end', pos: [-4.8, 1.1, 1.0], look: [-6.0, 0.5, -1.3]}]},
  {shot: 14, loc: 'kebun', move: 'two-shot: a few trees lost', keys: [
    {at: 'start', pos: [0.1, 1.55, 1.4], look: [0.05, 1.3, -0.6]},
    {at: 'end', pos: [0.1, 1.5, 1.1], look: [0.05, 1.3, -0.6]}]},
  {shot: 14, from: 'selamat', lift: false, loc: 'kebun', move: 'crane up: the garden is saved', keys: [
    {at: 'start', pos: [0.2, 1.7, 1.6], look: [0.1, 1.2, -1.0]},
    {at: 'end', pos: [0.6, 3.2, 4.2], look: [0.5, 1.2, -4.0]}]},
  {shot: 15, loc: 'kebun', move: 'close two-shot', keys: [
    {at: 'start', pos: [0.1, 1.5, 1.2], look: [0.05, 1.35, -0.6]},
    {at: 'end', pos: [0.08, 1.48, 0.9], look: [0.05, 1.35, -0.6]}]},
  {shot: 15, from: 'terlihat', lift: false, loc: 'akar', move: 'the enemy you cannot see', keys: [
    {at: 'start', pos: [0, -0.4, 3.0], look: [-0.3, -0.7, 0]},
    {at: 'end', pos: [0, -0.6, 2.2], look: [-0.3, -0.7, 0]}]},
  {shot: 15, from: 'bagikan', loc: 'kebun', move: 'pull back: share it', keys: [
    {at: 'start', pos: [0.1, 1.55, 1.5], look: [0.05, 1.3, -0.6]},
    {at: 'end', pos: [0.2, 1.9, 2.6], look: [0.05, 1.3, -0.6]}]},
];

export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1];
}

// Build per-framing curves and key times. A framing with `from` cuts in 0.12 s before its word.
export function buildCameras(T, EVt) {
  const start = (p) => (p.from ? Math.max(T.CUTS[p.shot - 1] + 0.3, EVt[p.from] - 0.12) : T.CUTS[p.shot - 1]);
  return SHOT_PLAN.map((p, i) => {
    const nx = SHOT_PLAN[i + 1];
    const t0 = start(p), t1 = nx && nx.shot === p.shot ? start(nx) : T.CUTS[p.shot];
    const ox = LOC[p.loc];
    const times = p.keys.map((k) => (k.at === 'start' ? t0 : k.at === 'end' ? t1 - 0.05 : EVt[k.at] + 0.15));
    for (let j = 1; j < times.length; j++) times[j] = Math.max(times[j], times[j - 1] + 0.35);
    const pos = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.pos[0] + ox, k.pos[1] + ly(p, k), k.pos[2])), false, 'centripetal');
    const look = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.look[0] + ox, k.look[1] + ly(p, k), k.look[2])), false, 'centripetal');
    return {...p, t0, t1, times, pos, look};
  });
}

// Camera at time t: the last framing that has started.
export function camAt(cams, t) {
  let c = cams[0];
  for (const k of cams) if (t >= k.t0) c = k;
  const u = warpU(c.times, t);
  return {pos: c.pos.getPoint(u), look: c.look.getPoint(u), loc: c.loc};
}
