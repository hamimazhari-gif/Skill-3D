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
  // Calm camera: medium shots, slow pushes.
  {shot: 1, loc: 'home', lift: false, move: 'the mirror: not the same body', keys: [
    {at: 'start', pos: [0.2, 1.6, -0.5], look: [0.3, 1.5, -3.6]},
    {at: 'end', pos: [0.2, 1.6, -0.75], look: [0.3, 1.5, -3.6]}]},
  {shot: 2, loc: 'factory', lift: false, move: 'the cell factory', keys: [
    {at: 'start', pos: [0, 1.4, -0.4], look: [0, 1.2, -3.4]},
    {at: 'end', pos: [0, 1.4, -0.7], look: [0, 1.2, -3.4]}]},
  {shot: 3, loc: 'body', lift: false, move: 'the gut lining renews in days', keys: [
    {at: 'start', pos: [0, 1.05, -0.5], look: [0, 0.6, -3.6]},
    {at: 'end', pos: [0, 1.05, -0.7], look: [0, 0.6, -3.6]}]},
  {shot: 4, loc: 'factory', lift: false, move: 'skin flakes off', keys: [
    {at: 'start', pos: [12, 1.35, -1.0], look: [12, 0.95, -3.5]},
    {at: 'end', pos: [12, 1.35, -1.25], look: [12, 0.95, -3.5]}]},
  {shot: 5, loc: 'home', lift: false, move: 'dust in the sunbeam is you', keys: [
    {at: 'start', pos: [0.2, 1.6, -0.3], look: [0.2, 1.5, -3.4]},
    {at: 'end', pos: [0.2, 1.6, -0.55], look: [0.2, 1.5, -3.4]}]},
  {shot: 6, loc: 'body', lift: false, move: 'red blood cells retire', keys: [
    {at: 'start', pos: [14, 1.1, -0.4], look: [14, 0.8, -3.3]},
    {at: 'end', pos: [14.3, 1.1, -0.6], look: [14.3, 0.8, -3.3]}]},
  {shot: 7, loc: 'factory', lift: false, move: 'the skeleton is renovated', keys: [
    {at: 'start', pos: [24, 1.5, -0.5], look: [24, 1.0, -3.6]},
    {at: 'end', pos: [24, 1.5, -0.75], look: [24, 1.0, -3.6]}]},
  {shot: 8, loc: 'factory', lift: false, move: 'plot twist: myth', keys: [
    {at: 'start', pos: [36, 1.9, -0.2], look: [36, 2.0, -3.6]},
    {at: 'end', pos: [36, 1.9, -0.45], look: [36, 2.0, -3.6]}]},
  {shot: 9, loc: 'body', lift: false, move: 'the brain and the eye lens stay', keys: [
    {at: 'start', pos: [27.6, 1.6, 0.2], look: [27.6, 1.55, -3.6]},
    {at: 'end', pos: [27.8, 1.6, -0.05], look: [27.8, 1.55, -3.6]}]},
  {shot: 10, loc: 'home', lift: false, move: 'memories stay', keys: [
    {at: 'start', pos: [-0.4, 1.6, -0.3], look: [-0.4, 1.7, -3.4]},
    {at: 'end', pos: [-0.4, 1.6, -0.55], look: [-0.4, 1.7, -3.4]}]},
  {shot: 11, loc: 'home', lift: false, move: '"you have changed!"', keys: [
    {at: 'start', pos: [0.1, 1.6, -0.5], look: [0.1, 1.5, -3.1]},
    {at: 'end', pos: [0.1, 1.6, -0.7], look: [0.1, 1.5, -3.1]}]},
  {shot: 12, loc: 'home', lift: false, move: 'the question', keys: [
    {at: 'start', pos: [-0.3, 1.7, -0.4], look: [-0.3, 1.7, -3.0]},
    {at: 'end', pos: [-0.3, 1.7, -0.6], look: [-0.3, 1.7, -3.0]}]},
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
