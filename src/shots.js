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
  // Calm camera: one to three framings per shot, slow short pushes, no dutch angles.
  {shot: 1, loc: 'tower', lift: false, move: 'low wide: the suitcase changes hands under the tower', keys: [
    {at: 'start', pos: [0, 1.25, 1.9], look: [0, 2.9, -7]},
    {at: 'end', pos: [0, 1.25, 1.6], look: [0, 2.9, -7]}]},
  {shot: 1, from: 'pria', loc: 'tower', lift: false, move: 'push to the man in the suit', keys: [
    {at: 'start', pos: [0.3, 1.55, 0.4], look: [0.4, 1.75, -2.2]},
    {at: 'end', pos: [0.32, 1.55, 0.2], look: [0.42, 1.75, -2.2]}]},
  {shot: 2, loc: 'tower', lift: false, move: 'close: Lustig, then the rewind', keys: [
    {at: 'start', pos: [0.35, 1.68, -0.4], look: [0.45, 1.7, -2.2]},
    {at: 'mundur', pos: [0.2, 1.5, 0.6], look: [0.1, 2.2, -4]},
    {at: 'end', pos: [0, 1.35, 1.4], look: [0, 2.6, -6]}]},
  {shot: 3, loc: 'cafe', lift: false, move: 'Paris street, the tower far away', keys: [
    {at: 'start', pos: [0.2, 1.7, 3.4], look: [0.2, 2.6, -12]},
    {at: 'victor', pos: [-0.1, 1.6, 1.0], look: [-0.2, 1.7, -3]},
    {at: 'end', pos: [-0.15, 1.6, 0.8], look: [-0.25, 1.7, -3]}]},
  {shot: 3, from: 'koran', loc: 'cafe', lift: false, move: 'macro: the headline', keys: [
    {at: 'start', pos: [-0.38, 1.3, -1.15], look: [-0.42, 1.2, -2.1]},
    {at: 'end', pos: [-0.38, 1.3, -1.25], look: [-0.42, 1.2, -2.1]}]},
  {shot: 4, loc: 'cafe', lift: false, move: 'close: his eyes light up', keys: [
    {at: 'start', pos: [-0.38, 1.7, -1.0], look: [-0.4, 1.68, -2.45]},
    {at: 'end', pos: [-0.38, 1.7, -1.15], look: [-0.4, 1.68, -2.45]}]},
  {shot: 5, loc: 'office', lift: false, move: 'macro: the forged letter gets its stamp', keys: [
    {at: 'start', pos: [0.42, 1.45, -1.75], look: [0.42, 0.82, -2.7]},
    {at: 'end', pos: [0.42, 1.42, -1.9], look: [0.42, 0.82, -2.7]}]},
  {shot: 5, from: 'menyamar', loc: 'office', lift: false, move: 'the disguise', keys: [
    {at: 'start', pos: [-0.1, 1.6, 0.3], look: [-0.25, 1.35, -2.7]},
    {at: 'end', pos: [-0.12, 1.6, 0.15], look: [-0.27, 1.38, -2.7]}]},
  {shot: 5, from: 'mengundang', loc: 'hotel', lift: false, move: 'wide: the grand hotel, five dealers arrive', keys: [
    {at: 'start', pos: [0.4, 1.75, 2.5], look: [0.4, 1.6, -3.2]},
    {at: 'end', pos: [0.3, 1.75, 2.2], look: [0.3, 1.6, -3.2]}]},
  {shot: 6, loc: 'hotel', lift: false, move: 'Lustig presents the plan to the dealers', keys: [
    {at: 'start', pos: [0.1, 1.75, 1.9], look: [0.1, 1.55, -3.2]},
    {at: 'end', pos: [0.0, 1.75, 1.65], look: [0.0, 1.55, -3.2]}]},
  {shot: 6, from: 'rahasia', loc: 'hotel', lift: false, move: 'close: state secret', keys: [
    {at: 'start', pos: [-1.2, 1.75, -0.8], look: [-1.4, 1.85, -2.6]},
    {at: 'end', pos: [-1.2, 1.75, -0.9], look: [-1.4, 1.85, -2.6]}]},
  {shot: 7, loc: 'hotel', lift: false, move: 'close: Poisson takes the bait', keys: [
    {at: 'start', pos: [1.2, 1.72, -0.8], look: [1.2, 1.85, -3.9]},
    {at: 'end', pos: [1.2, 1.72, -1.0], look: [1.2, 1.85, -3.9]}]},
  {shot: 7, from: 'istri', loc: 'home', lift: false, move: 'Poisson at home with his wife', keys: [
    {at: 'start', pos: [0.1, 1.65, 0.9], look: [0.1, 1.6, -2.5]},
    {at: 'end', pos: [0.1, 1.65, 0.7], look: [0.1, 1.6, -2.5]}]},
  {shot: 8, loc: 'home', lift: false, move: 'close: the wife asks', keys: [
    {at: 'start', pos: [0.45, 1.7, -0.7], look: [0.6, 1.68, -2.5]},
    {at: 'end', pos: [0.45, 1.7, -0.8], look: [0.6, 1.68, -2.5]}]},
  {shot: 8, from: 'rencana', loc: 'hotel', lift: false, move: 'close: Lustig sweats', keys: [
    {at: 'start', pos: [3.25, 1.72, -0.8], look: [3.25, 1.75, -2.4]},
    {at: 'end', pos: [3.25, 1.72, -0.9], look: [3.25, 1.75, -2.4]}]},
  {shot: 9, loc: 'hotel', lift: false, move: 'two-shot by the window: the bribe', keys: [
    {at: 'start', pos: [3.75, 1.7, 0.6], look: [3.75, 1.6, -2.4]},
    {at: 'end', pos: [3.75, 1.7, 0.35], look: [3.75, 1.6, -2.4]}]},
  {shot: 9, from: 'oh', loc: 'hotel', lift: false, move: 'close: Poisson is relieved', keys: [
    {at: 'start', pos: [4.1, 1.72, -0.8], look: [4.2, 1.72, -2.4]},
    {at: 'end', pos: [4.1, 1.72, -0.9], look: [4.2, 1.72, -2.4]}]},
  {shot: 10, loc: 'tower', lift: false, move: 'the money is paid (back to the hook)', keys: [
    {at: 'start', pos: [0, 1.5, 1.0], look: [0, 1.6, -2.2]},
    {at: 'end', pos: [0, 1.5, 0.85], look: [0, 1.6, -2.2]}]},
  {shot: 10, from: 'kabur', loc: 'station', lift: false, move: 'he runs for the train', keys: [
    {at: 'start', pos: [-1.4, 1.6, 1.4], look: [-1.0, 1.45, -3.0]},
    {at: 'end', pos: [-0.5, 1.6, 1.2], look: [0.0, 1.5, -3.0]}]},
  {shot: 10, from: 'danPoisson', loc: 'police', lift: false, move: 'Poisson at the police door', keys: [
    {at: 'start', pos: [-0.6, 1.65, 2.4], look: [-0.4, 1.7, -3.2]},
    {at: 'end', pos: [-0.6, 1.65, 2.1], look: [-0.4, 1.7, -3.2]}]},
  {shot: 11, loc: 'tower', lift: false, move: 'back in Paris: a new buyer, then the police', keys: [
    {at: 'start', pos: [0, 1.45, 1.1], look: [0, 2.3, -6]},
    {at: 'korban', pos: [0.5, 1.55, 1.7], look: [0.3, 1.7, -3]},
    {at: 'end', pos: [0.3, 1.55, 1.9], look: [-0.1, 1.7, -3]}]},
  {shot: 12, loc: 'tower', lift: false, move: 'Lustig and the question, sunset', keys: [
    {at: 'start', pos: [0, 1.45, 0.95], look: [0, 2.6, -7]},
    {at: 'end', pos: [0, 1.5, 0.65], look: [0, 2.6, -7]}]},
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
    const rolls = p.keys.map((k) => k.roll || 0), fovs = p.keys.map((k) => k.fov || 80);
    return {...p, t0, t1, times, pos, look, rolls, fovs};
  });
}

// Camera at time t: the last framing that has started.
export function camAt(cams, t) {
  let c = cams[0];
  for (const k of cams) if (t >= k.t0) c = k;
  const u = warpU(c.times, t);
  // roll (dutch angle, rad) and fov (lens) per key, eased between keys
  const s = u * (c.rolls.length - 1), i = Math.min(c.rolls.length - 2, Math.floor(s)), f = s - i;
  const e = f * f * (3 - 2 * f), mix = (a) => (a.length < 2 ? a[0] : a[i] + (a[i + 1] - a[i]) * e);
  return {pos: c.pos.getPoint(u), look: c.look.getPoint(u), loc: c.loc, roll: mix(c.rolls), fov: mix(c.fovs)};
}
