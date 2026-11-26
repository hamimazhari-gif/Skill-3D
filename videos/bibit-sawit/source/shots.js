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
  {shot: 1, lift: false, loc: 'kebun', move: 'crane over the young plantation (time-lapse)', keys: [
    {at: 'start', pos: [3.5, 4.2, 5.5], look: [0.5, 0.6, -4]},
    {at: 'end', pos: [1.6, 2.2, 2.8], look: [0.3, 1.0, -2.0]}]},
  {shot: 1, from: 'menyiangi', loc: 'kebun', move: 'medium: weeding with the hoe', keys: [
    {at: 'start', pos: [0.6, 1.5, 1.4], look: [0.1, 1.0, -1.5]},
    {at: 'end', pos: [0.5, 1.45, 1.0], look: [0.1, 1.0, -1.5]}]},
  {shot: 1, from: 'berharap', loc: 'kebun', move: 'close-up: hoping under grown palms', keys: [
    {at: 'start', pos: [0.55, 1.45, -0.35], look: [0.3, 1.4, -1.55]},
    {at: 'end', pos: [0.5, 1.5, -0.5], look: [0.3, 1.4, -1.55]}]},
  {shot: 2, lift: false, loc: 'kebun', move: 'low angle: harvesting with the dodos', keys: [
    {at: 'start', pos: [0.4, 1.45, 1.4], look: [1.9, 0.95, -2.6]},
    {at: 'end', pos: [0.65, 1.4, 1.0], look: [2.0, 0.95, -2.6]}]},
  {shot: 2, from: 'tandan', lift: false, loc: 'kebun', move: 'macro: the fallen red bunch', keys: [
    {at: 'start', pos: [2.55, 0.8, -1.2], look: [3.0, 0.25, -2.65]},
    {at: 'end', pos: [2.65, 0.7, -1.5], look: [3.0, 0.25, -2.65]}]},
  {shot: 2, from: 'merah', loc: 'kebun', move: 'medium: Joko cheers', keys: [
    {at: 'start', pos: [1.35, 1.45, 0.6], look: [1.6, 1.2, -2.25]},
    {at: 'end', pos: [1.45, 1.4, 0.3], look: [1.6, 1.2, -2.25]}]},
  {shot: 3, lift: false, loc: 'pengepul', move: "wide: the collector's shed", keys: [
    {at: 'start', pos: [1.5, 2.4, 4.6], look: [0.3, 1.2, -2.5]},
    {at: 'end', pos: [0.6, 1.7, 3.0], look: [0.3, 1.2, -2.5]}]},
  {shot: 3, from: 'harga', lift: false, loc: 'pengepul', move: 'push to the price board', keys: [
    {at: 'start', pos: [-1.0, 1.6, -1.6], look: [-1.5, 1.4, -4.6]},
    {at: 'end', pos: [-1.3, 1.6, -2.6], look: [-1.5, 1.4, -4.6]}]},
  {shot: 3, from: 'tetangga', loc: 'pengepul', move: 'the neighbour and his coins', keys: [
    {at: 'start', pos: [1.5, 1.5, 0.6], look: [2.0, 1.15, -2.0]},
    {at: 'end', pos: [1.6, 1.45, 0.2], look: [2.0, 1.15, -2.0]}]},
  {shot: 3, from: 'kenapa', loc: 'pengepul', move: 'close-up: why so cheap?', keys: [
    {at: 'start', pos: [-0.75, 1.45, 0.45], look: [-1.0, 1.4, -0.85]},
    {at: 'end', pos: [-0.8, 1.45, 0.25], look: [-1.0, 1.4, -0.85]}]},
  {shot: 4, loc: 'pengepul', move: 'medium: Kakek at the block', keys: [
    {at: 'start', pos: [-0.2, 1.55, 2.0], look: [-0.35, 1.05, -0.6]},
    {at: 'end', pos: [-0.25, 1.45, 1.5], look: [-0.35, 1.05, -0.6]}]},
  {shot: 4, from: 'membelah', lift: false, loc: 'pengepul', move: 'macro: the fruit splits', keys: [
    {at: 'start', pos: [-0.3, 1.38, 0.12], look: [-0.15, 0.58, -0.45]},
    {at: 'end', pos: [-0.28, 1.32, 0.02], look: [-0.15, 0.58, -0.45]}]},
  {shot: 4, from: 'lihat', loc: 'pengepul', move: 'close-up: Kakek explains', keys: [
    {at: 'start', pos: [0.45, 1.45, 0.3], look: [0.32, 1.4, -0.95]},
    {at: 'end', pos: [0.42, 1.45, 0.1], look: [0.32, 1.4, -0.95]}]},
  {shot: 4, from: 'tebal', lift: false, loc: 'pengepul', move: 'macro: thick shell, thin flesh', keys: [
    {at: 'start', pos: [-0.28, 1.3, 0.02], look: [-0.15, 0.56, -0.47]},
    {at: 'end', pos: [-0.26, 1.25, -0.06], look: [-0.15, 0.56, -0.47]}]},
  {shot: 4, from: 'dura', loc: 'pengepul', move: 'two-shot: DURA', keys: [
    {at: 'start', pos: [-0.3, 1.5, 1.6], look: [-0.35, 1.25, -0.9]},
    {at: 'end', pos: [-0.35, 1.45, 1.25], look: [-0.35, 1.25, -0.9]}]},
  {shot: 4, from: 'terdiam', loc: 'pengepul', move: 'close-up: Joko silent', keys: [
    {at: 'start', pos: [-0.85, 1.45, 0.4], look: [-1.0, 1.38, -0.85]},
    {at: 'end', pos: [-0.9, 1.43, 0.25], look: [-1.0, 1.38, -0.85]}]},
  {shot: 5, loc: 'pengepul', move: 'medium: the second fruit', keys: [
    {at: 'start', pos: [0.1, 1.5, 1.5], look: [-0.05, 1.0, -0.6]},
    {at: 'end', pos: [0.0, 1.4, 1.1], look: [-0.05, 1.0, -0.6]}]},
  {shot: 5, from: 'sebelah', lift: false, loc: 'pengepul', move: 'macro: Dura and Tenera side by side', keys: [
    {at: 'start', pos: [-0.32, 1.42, 0.2], look: [-0.13, 0.58, -0.45]},
    {at: 'end', pos: [-0.3, 1.36, 0.08], look: [-0.13, 0.58, -0.45]}]},
  {shot: 5, from: 'tenera', loc: 'pengepul', move: 'close-up: Kakek proud', keys: [
    {at: 'start', pos: [0.5, 1.42, 0.3], look: [0.32, 1.42, -0.95]},
    {at: 'end', pos: [0.47, 1.43, 0.15], look: [0.32, 1.42, -0.95]}]},
  {shot: 5, from: 'banyak', loc: 'pengepul', move: 'close-up: Joko realises', keys: [
    {at: 'start', pos: [-0.85, 1.45, 0.4], look: [-1.0, 1.38, -0.85]},
    {at: 'end', pos: [-0.88, 1.43, 0.25], look: [-1.0, 1.38, -0.85]}]},
  {shot: 6, loc: 'pengepul', move: 'close-up: where did you buy?', keys: [
    {at: 'start', pos: [0.5, 1.45, 0.35], look: [0.32, 1.4, -0.95]},
    {at: 'end', pos: [0.48, 1.45, 0.2], look: [0.32, 1.4, -0.95]}]},
  {shot: 6, from: 'menunduk', loc: 'pengepul', move: 'high close-up: Joko looks down', keys: [
    {at: 'start', pos: [-0.85, 1.75, 0.3], look: [-1.0, 1.3, -0.85]},
    {at: 'end', pos: [-0.88, 1.7, 0.15], look: [-1.0, 1.3, -0.85]}]},
  {shot: 6, from: 'pinggir', lift: false, loc: 'jalan', move: 'flashback: the roadside stall', keys: [
    {at: 'start', pos: [0.8, 1.7, 3.6], look: [-0.1, 1.1, -1.2]},
    {at: 'end', pos: [0.3, 1.55, 2.6], look: [-0.1, 1.1, -1.2]}]},
  {shot: 6, from: 'menghela', loc: 'pengepul', move: 'close-up: Kakek sighs', keys: [
    {at: 'start', pos: [0.45, 1.45, 0.3], look: [0.32, 1.38, -0.95]},
    {at: 'end', pos: [0.44, 1.43, 0.18], look: [0.32, 1.38, -0.95]}]},
  {shot: 6, from: 'palsu', lift: false, loc: 'jalan', move: 'macro: two identical seedlings', keys: [
    {at: 'start', pos: [0, 1.35, 0.75], look: [0, 1.1, -0.85]},
    {at: 'end', pos: [0, 1.3, 0.55], look: [0, 1.08, -0.85]}]},
  {shot: 6, from: 'bertahun', lift: false, loc: 'jalan', move: 'push: the tags reveal DURA / TENERA', keys: [
    {at: 'start', pos: [0, 1.2, 0.45], look: [0, 1.0, -0.85]},
    {at: 'end', pos: [0, 1.15, 0.3], look: [0, 0.98, -0.85]}]},
  {shot: 7, lift: false, loc: 'teras', move: 'crane down to the two seated at night', keys: [
    {at: 'start', pos: [1.6, 2.4, 4.0], look: [0.2, 1.0, -1.8]},
    {at: 'end', pos: [0.5, 1.45, 2.0], look: [0.3, 1.05, -1.8]}]},
  {shot: 7, from: 'pelajaran', lift: false, loc: 'teras', move: 'push to the lesson board', keys: [
    {at: 'start', pos: [-0.8, 1.65, 0.8], look: [-1.75, 1.65, -2.9]},
    {at: 'end', pos: [-1.2, 1.7, 0.2], look: [-1.75, 1.7, -2.9]}]},
  {shot: 8, lift: false, loc: 'penangkar', move: 'crane down over the official nursery', keys: [
    {at: 'start', pos: [2.2, 2.6, 4.6], look: [-0.4, 1.2, -2.0]},
    {at: 'end', pos: [0.8, 1.7, 2.6], look: [-0.2, 1.2, -1.6]}]},
  {shot: 8, from: 'izin', lift: false, loc: 'penangkar', move: 'medium: banner + BERIZIN', keys: [
    {at: 'start', pos: [-0.9, 1.6, 1.3], look: [-1.4, 1.5, -1.5]},
    {at: 'end', pos: [-1.1, 1.6, 0.9], look: [-1.45, 1.5, -1.5]}]},
  {shot: 8, from: 'sertifikat', lift: false, loc: 'penangkar', move: 'macro: certificate + label', keys: [
    {at: 'start', pos: [0.5, 1.25, 0.5], look: [0.45, 0.95, -0.6]},
    {at: 'end', pos: [0.48, 1.2, 0.3], look: [0.45, 0.95, -0.6]}]},
  {shot: 9, lift: false, loc: 'penangkar', move: 'medium: the cheap tag gets an X', keys: [
    {at: 'start', pos: [-0.3, 1.4, 1.2], look: [-0.45, 0.95, -0.4]},
    {at: 'end', pos: [-0.35, 1.3, 0.9], look: [-0.45, 0.95, -0.4]}]},
  {shot: 9, from: 'unggul', lift: false, loc: 'penangkar', move: 'medium: UNGGUL costs more', keys: [
    {at: 'start', pos: [1.35, 1.5, 1.2], look: [1.1, 1.1, -0.7]},
    {at: 'end', pos: [1.3, 1.45, 0.9], look: [1.1, 1.1, -0.7]}]},
  {shot: 10, loc: 'penangkar', move: 'medium two-shot over the table', keys: [
    {at: 'start', pos: [0.4, 1.6, 2.0], look: [0.3, 1.15, -0.8]},
    {at: 'end', pos: [0.35, 1.5, 1.5], look: [0.3, 1.15, -0.8]}]},
  {shot: 10, from: 'kokoh', lift: false, loc: 'penangkar', move: 'macro: sturdy, fresh seedling', keys: [
    {at: 'start', pos: [0.95, 1.2, 0.3], look: [0.85, 1.0, -0.45]},
    {at: 'end', pos: [0.9, 1.15, 0.15], look: [0.85, 1.0, -0.45]}]},
  {shot: 10, from: 'singkirkan', lift: false, loc: 'penangkar', move: 'medium: the stunted one goes in AFKIR', keys: [
    {at: 'start', pos: [-0.45, 1.55, 2.6], look: [-0.7, 1.0, -0.6]},
    {at: 'end', pos: [-0.55, 1.5, 2.3], look: [-0.75, 1.0, -0.6]}]},
  {shot: 11, loc: 'kebun', move: 'medium: Joko at the block in his plantation', keys: [
    {at: 'start', pos: [0.6, 1.6, 1.6], look: [0.2, 1.05, -1.0]},
    {at: 'end', pos: [0.4, 1.5, 1.1], look: [0.2, 1.05, -1.0]}]},
  {shot: 11, from: 'belah', lift: false, loc: 'kebun', move: 'macro: thick shell again', keys: [
    {at: 'start', pos: [0.05, 1.0, -0.2], look: [0, 0.5, -0.75]},
    {at: 'end', pos: [0.03, 0.95, -0.3], look: [0, 0.5, -0.75]}]},
  {shot: 11, from: 'salah', loc: 'kebun', move: 'close-up: facepalm', keys: [
    {at: 'start', pos: [0.6, 1.45, -0.1], look: [0.45, 1.4, -1.2]},
    {at: 'end', pos: [0.58, 1.45, -0.2], look: [0.45, 1.4, -1.2]}]},
  {shot: 12, lift: false, loc: 'kebun', move: 'wide pull back: the palms come down', keys: [
    {at: 'start', pos: [0.9, 1.8, 2.4], look: [-1.0, 1.0, -3.0]},
    {at: 'end', pos: [0.8, 2.4, 3.6], look: [-0.8, 0.9, -3.4]}]},
  {shot: 12, from: 'memulai', lift: false, loc: 'kebun', move: 'low push: starting again with new seedlings', keys: [
    {at: 'start', pos: [0.9, 0.75, 1.0], look: [0.0, 0.45, -2.5]},
    {at: 'end', pos: [0.65, 0.8, 0.35], look: [0.0, 0.45, -2.5]}]},
  {shot: 12, from: 'hilang', loc: 'kebun', move: 'close-up: four years lost', keys: [
    {at: 'start', pos: [0.35, 1.45, -0.15], look: [0.2, 1.4, -1.3]},
    {at: 'end', pos: [0.33, 1.45, -0.25], look: [0.2, 1.4, -1.3]}]},
  {shot: 12, from: 'keputusan', lift: false, loc: 'kebun', move: 'crane up over the new rows', keys: [
    {at: 'start', pos: [0.5, 1.8, 1.8], look: [0, 0.6, -3]},
    {at: 'end', pos: [0.3, 2.6, 3.2], look: [0, 0.6, -3]}]},
  {shot: 13, loc: 'kebun', move: 'two-shot at golden hour', keys: [
    {at: 'start', pos: [0.1, 1.55, 1.8], look: [0.05, 1.25, -0.9]},
    {at: 'end', pos: [0.05, 1.5, 1.3], look: [0.05, 1.25, -0.9]}]},
  {shot: 13, from: 'memilih', lift: false, loc: 'kebun', move: 'pull back + crane up', keys: [
    {at: 'start', pos: [0.1, 1.6, 1.5], look: [0, 1.2, -1]},
    {at: 'end', pos: [0.6, 3.4, 5.0], look: [0, 0.6, -3.5]}]},
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
