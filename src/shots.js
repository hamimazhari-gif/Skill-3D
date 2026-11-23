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
  // 1 street: imagine living to 500, then "wait"
  {shot: 1, loc: 'street', move: 'crane down from the 500 banner to the hero', keys: [
    {at: 'start', pos: [0.5, 3.0, 3.0], look: [0.1, 1.9, -5.0]},
    {at: 'lima', pos: [0.3, 2.2, 1.4], look: [0.1, 1.7, -4.5]},
    {at: 'end', pos: [0.2, 1.7, 0.2], look: [0, 1.45, -2.6]}]},
  {shot: 1, from: 'tunggu', loc: 'street', move: 'snap close on the frozen hero', keys: [
    {at: 'start', pos: [-0.3, 1.5, -1.0], look: [0, 1.45, -2.6]},
    {at: 'end', pos: [-0.25, 1.5, -1.25], look: [0, 1.45, -2.6]}]},
  // 2 party: the 250th birthday, "only halfway"
  {shot: 2, loc: 'party', move: 'push into the party', keys: [
    {at: 'start', pos: [0.3, 2.1, 0.8], look: [0.2, 1.6, -4.5]},
    {at: 'end', pos: [0.1, 1.8, -0.4], look: [0.1, 1.45, -4.0]}]},
  {shot: 2, from: 'santai', loc: 'party', move: 'close on the hero, swing to the life bar', keys: [
    {at: 'start', pos: [-0.75, 1.5, -1.6], look: [-0.55, 1.45, -3.0]},
    {at: 'setengah', pos: [-0.25, 1.75, -0.7], look: [0.5, 1.75, -5.0]},
    {at: 'end', pos: [-0.25, 1.75, -0.9], look: [0.5, 1.75, -5.0]}]},
  // 3 classroom: decades of college; the wardrobe-thick thesis
  {shot: 3, loc: 'campus', move: 'push on the tired student', keys: [
    {at: 'start', pos: [0.6, 2.3, 0.8], look: [-0.6, 1.5, -4.5]},
    {at: 'end', pos: [0.1, 1.8, -0.4], look: [-0.4, 1.4, -3.2]}]},
  {shot: 3, from: 'skripsi', loc: 'campus', move: 'low angle on the giant thesis next to the wardrobe', keys: [
    {at: 'start', pos: [0.3, 1.0, 0.6], look: [1.05, 1.35, -3.6]},
    {at: 'end', pos: [0.4, 1.05, 0.2], look: [1.1, 1.4, -3.6]}]},
  // 4 house: the salesman's 300-year loan
  {shot: 4, loc: 'house', move: 'walk-up to the house for sale', keys: [
    {at: 'start', pos: [-0.3, 2.3, 2.6], look: [0.4, 1.6, -6.0]},
    {at: 'end', pos: [-0.2, 1.85, 0.4], look: [0.2, 1.5, -4.0]}]},
  {shot: 4, from: 'sales', loc: 'house', move: 'salesman pitch, tilt up to the billboard', keys: [
    {at: 'start', pos: [0.85, 1.5, -1.4], look: [0.6, 1.5, -3.6]},
    {at: 'cicilan', pos: [0.7, 1.6, -0.9], look: [0.95, 1.85, -4.4]},
    {at: 'end', pos: [0.7, 1.6, -1.05], look: [0.95, 1.85, -4.4]}]},
  {shot: 4, from: 'dp', loc: 'house', move: 'close on the shocked buyer', keys: [
    {at: 'start', pos: [-0.65, 1.5, -1.5], look: [-0.85, 1.45, -2.8]},
    {at: 'end', pos: [-0.7, 1.5, -1.7], look: [-0.85, 1.45, -2.8]}]},
  // 5 schoolyard reunion: generations keep arriving
  {shot: 5, loc: 'reunion', move: 'push on the classmates', keys: [
    {at: 'start', pos: [0.3, 1.8, 0.9], look: [0, 1.5, -3.5]},
    {at: 'end', pos: [0.2, 1.7, -0.4], look: [0, 1.45, -3.0]}]},
  {shot: 5, from: 'anak', loc: 'reunion', move: 'crane up and back as the crowd grows', keys: [
    {at: 'start', pos: [0.2, 1.8, 0.0], look: [0, 1.5, -4.0]},
    {at: 'generasi', pos: [0.3, 3.0, 2.4], look: [0, 1.6, -6.0]},
    {at: 'end', pos: [0.3, 3.1, 2.6], look: [0, 1.65, -6.0]}]},
  // 6 office: retire at 400, the late grandpa
  {shot: 6, loc: 'office', move: 'grandpa shuffles in under the poster', keys: [
    {at: 'start', pos: [0.2, 2.0, 0.6], look: [-0.8, 1.6, -4.5]},
    {at: 'end', pos: [0.0, 1.8, -0.4], look: [-0.3, 1.5, -3.6]}]},
  {shot: 6, from: 'kakek', loc: 'office', move: 'close on the boss', keys: [
    {at: 'start', pos: [0.5, 1.5, -1.9], look: [0.75, 1.45, -3.4]},
    {at: 'end', pos: [0.5, 1.5, -2.1], look: [0.75, 1.45, -3.4]}]},
  {shot: 6, from: 'maaf', loc: 'office', move: 'close on grandpa and his knees', keys: [
    {at: 'start', pos: [-0.45, 1.45, -1.35], look: [-0.6, 1.35, -2.7]},
    {at: 'end', pos: [-0.5, 1.4, -1.6], look: [-0.6, 1.3, -2.7]}]},
  // 7 Earth gets overcrowded; the fight for food, water, housing
  {shot: 7, loc: 'earth', lift: false, move: 'push in on the filling planet', keys: [
    {at: 'start', pos: [0, 1.7, 4.5], look: [0, 1.6, -6.0]},
    {at: 'end', pos: [0, 1.7, 0.6], look: [0, 1.6, -6.0]}]},
  {shot: 7, from: 'makanan', loc: 'street', move: 'into the crowd at the stall', keys: [
    {at: 'start', pos: [0.2, 2.2, 1.6], look: [0, 1.4, -4.0]},
    {at: 'end', pos: [0.1, 1.85, 0.3], look: [0, 1.4, -3.5]}]},
  // 8 warung: grandpa complains about snack prices
  {shot: 8, loc: 'warung', move: 'push on the snack stall', keys: [
    {at: 'start', pos: [0.3, 2.0, 1.2], look: [0.1, 1.5, -4.2]},
    {at: 'end', pos: [0.2, 1.8, -0.2], look: [0, 1.5, -3.6]}]},
  {shot: 8, from: 'gorengan', loc: 'warung', move: 'close on grandpa and his memory', keys: [
    {at: 'start', pos: [-0.35, 1.6, -0.9], look: [-1.2, 1.75, -2.8]},
    {at: 'end', pos: [-0.45, 1.6, -1.2], look: [-1.2, 1.75, -2.8]}]},
  // 9 park: the lesson
  {shot: 9, loc: 'park', move: 'golden push on the hero', keys: [
    {at: 'start', pos: [0.6, 2.0, 1.6], look: [0, 1.4, -4.0]},
    {at: 'end', pos: [0.3, 1.7, -0.2], look: [0, 1.4, -3.0]}]},
  {shot: 9, from: 'manfaat', loc: 'park', move: 'two-shot: the hero gives bread to the kid', keys: [
    {at: 'start', pos: [0.4, 1.3, -0.9], look: [0.35, 1.2, -2.8]},
    {at: 'end', pos: [0.4, 1.35, -1.1], look: [0.35, 1.2, -2.8]}]},
  // 10 the question
  {shot: 10, loc: 'park', move: 'close on the hero, rise to the wishes', keys: [
    {at: 'start', pos: [-0.1, 1.55, -0.9], look: [-0.15, 1.5, -2.7]},
    {at: 'ngapain', pos: [0, 1.75, -0.3], look: [0, 1.85, -2.7]},
    {at: 'end', pos: [0, 1.8, -0.2], look: [0, 1.9, -2.7]}]},
  {shot: 10, from: 'komentar', loc: 'park', move: 'pull back to the comment sign', keys: [
    {at: 'start', pos: [0, 1.85, 0.0], look: [-0.05, 1.95, -2.9]},
    {at: 'end', pos: [0, 1.95, 0.8], look: [-0.05, 2.0, -2.9]}]},
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
