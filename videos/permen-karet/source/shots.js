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
  // Calm camera: close-ups for the dialogue, slow tracks through the gut.
  {shot: 1, loc: 'home', lift: false, move: 'close: the gum went down', keys: [
    {at: 'start', pos: [-0.55, 1.35, -1.6], look: [-0.6, 1.3, -3.0]},
    {at: 'end', pos: [-0.55, 1.35, -1.7], look: [-0.6, 1.3, -3.0]}]},
  {shot: 2, loc: 'home', lift: false, move: 'close: mum says seven years', keys: [
    {at: 'start', pos: [0.65, 1.7, -1.6], look: [0.75, 1.65, -3.2]},
    {at: 'end', pos: [0.65, 1.7, -1.7], look: [0.75, 1.65, -3.2]}]},
  {shot: 3, loc: 'home', lift: false, move: 'a childhood fear', keys: [
    {at: 'start', pos: [0.1, 1.6, 0.0], look: [0.1, 1.4, -3.2]},
    {at: 'end', pos: [0.1, 1.6, -0.3], look: [0.1, 1.4, -3.2]}]},
  {shot: 3, from: 'bayangkan', loc: 'gut', lift: false, move: 'imagined: gum stuck everywhere in the stomach', keys: [
    {at: 'start', pos: [0, 1.5, -0.5], look: [0, 1.5, -3.6]},
    {at: 'end', pos: [0, 1.5, -0.8], look: [0, 1.5, -3.6]}]},
  {shot: 3, from: 'smp', loc: 'home', lift: false, move: 'grown up, the gum still on his belly', keys: [
    {at: 'start', pos: [-0.6, 1.4, -1.1], look: [-0.6, 1.25, -3.0]},
    {at: 'end', pos: [-0.6, 1.4, -1.25], look: [-0.6, 1.25, -3.0]}]},
  {shot: 4, loc: 'studio', lift: false, move: 'myth or fact', keys: [
    {at: 'start', pos: [0, 1.35, 0.7], look: [0, 1.35, -3.4]},
    {at: 'end', pos: [0, 1.35, 0.45], look: [0, 1.35, -3.4]}]},
  {shot: 5, loc: 'gut', lift: false, move: 'in the stomach: hard to digest', keys: [
    {at: 'start', pos: [0, 0.8, -1.2], look: [0, 0.6, -3.1]},
    {at: 'end', pos: [0, 0.8, -1.4], look: [0, 0.6, -3.1]}]},
  {shot: 6, loc: 'gut', lift: false, move: 'it does not stick', keys: [
    {at: 'start', pos: [0.8, 1.4, 0.2], look: [1.2, 1.0, -3.6]},
    {at: 'end', pos: [0.8, 1.4, 0.0], look: [1.2, 1.0, -3.6]}]},
  {shot: 7, loc: 'gut', lift: false, move: 'the gut keeps pushing', keys: [
    {at: 'start', pos: [9.4, 1.05, -0.5], look: [9.4, 0.6, -3.3]},
    {at: 'end', pos: [12.4, 1.05, -0.6], look: [12.6, 0.6, -3.3]}]},
  {shot: 8, loc: 'gut', lift: false, move: 'the tourist waves goodbye', keys: [
    {at: 'start', pos: [13.2, 1.05, -0.5], look: [13.4, 0.6, -3.3]},
    {at: 'end', pos: [17.6, 1.05, -0.6], look: [18.2, 0.6, -3.3]}]},
  {shot: 9, loc: 'home', lift: false, move: 'swallowing gum every day', keys: [
    {at: 'start', pos: [-0.3, 1.5, -0.8], look: [-0.4, 1.4, -3.0]},
    {at: 'end', pos: [-0.3, 1.5, -1.0], look: [-0.4, 1.4, -3.0]}]},
  {shot: 9, from: 'sumbatan', loc: 'gut', lift: false, move: 'too much: a blockage', keys: [
    {at: 'start', pos: [30, 1.4, 1.2], look: [30, 1.0, -3.4]},
    {at: 'end', pos: [30, 1.4, 0.8], look: [30, 1.0, -3.4]}]},
  {shot: 9, from: 'dikunyah', loc: 'home', lift: false, move: 'chew it, do not swallow it', keys: [
    {at: 'start', pos: [-0.55, 1.45, -1.3], look: [-0.6, 1.4, -3.0]},
    {at: 'end', pos: [-0.55, 1.45, -1.45], look: [-0.6, 1.4, -3.0]}]},
  {shot: 10, loc: 'home', lift: false, move: 'relief until mum comes back', keys: [
    {at: 'start', pos: [0.3, 1.6, 0.0], look: [0.3, 1.4, -3.2]},
    {at: 'end', pos: [0.3, 1.6, -0.3], look: [0.3, 1.4, -3.2]}]},
  {shot: 11, loc: 'home', lift: false, move: 'no watermelon seeds', keys: [
    {at: 'start', pos: [0.1, 1.65, -0.6], look: [0.1, 1.55, -3.1]},
    {at: 'end', pos: [0.1, 1.65, -0.8], look: [0.1, 1.55, -3.1]}]},
  {shot: 12, loc: 'home', lift: false, move: 'which threat did you believe', keys: [
    {at: 'start', pos: [0.1, 1.7, -0.2], look: [0.1, 1.6, -3.0]},
    {at: 'end', pos: [0.1, 1.7, -0.45], look: [0.1, 1.6, -3.0]}]},
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
