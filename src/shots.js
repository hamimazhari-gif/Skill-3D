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
  // Camera language for this video: low tracking shots beside walking characters, high-angle crane shots, orbits,
  // dutch angles (roll) on tension beats, a handheld-style truck in the crowd, and wide/close lens changes (fov).
  // 1 street: the hero walks in thinking, 500 pops up, then "wait"
  {shot: 1, loc: 'street', move: 'low tracking shot beside the walking hero', keys: [
    {at: 'start', pos: [-3.1, 0.75, -0.35], look: [-2.4, 1.5, -2.4]},
    {at: 'end', pos: [-0.55, 0.85, -0.1], look: [0, 1.6, -2.6]}]},
  {shot: 1, from: 'lima', loc: 'street', move: 'high crane down from above the banner', keys: [
    {at: 'start', pos: [2.2, 4.0, 2.2], look: [0.1, 1.5, -4.0], fov: 74},
    {at: 'end', pos: [0.8, 2.3, 0.6], look: [0.05, 1.6, -3.6]}]},
  {shot: 1, from: 'tunggu', loc: 'street', move: 'close-up rolling into a dutch angle', keys: [
    {at: 'start', pos: [-0.35, 1.45, -1.05], look: [0, 1.45, -2.6]},
    {at: 'end', pos: [-0.3, 1.5, -1.3], look: [0, 1.45, -2.6], roll: 0.14}]},
  // 2 party: top shot on the cake, orbit around the hero's line, the life bar
  {shot: 2, loc: 'party', move: 'overhead on the cake, crane down to the party', keys: [
    {at: 'start', pos: [0.2, 3.25, -1.4], look: [-0.05, 0.75, -3.3]},
    {at: 'end', pos: [0.2, 2.0, -0.2], look: [0, 1.4, -3.8]}]},
  {shot: 2, from: 'santai', loc: 'party', move: 'orbit around the boasting hero', keys: [
    {at: 'start', pos: [-1.75, 1.45, -1.6], look: [-0.55, 1.45, -3.0]},
    {at: 'end', pos: [0.05, 1.5, -1.5], look: [-0.45, 1.45, -3.0]}]},
  {shot: 2, from: 'setengah', loc: 'party', move: 'low push to the life bar', keys: [
    {at: 'start', pos: [-0.3, 1.5, -0.55], look: [0.5, 1.8, -5.0]},
    {at: 'end', pos: [-0.25, 1.75, -0.9], look: [0.5, 1.75, -5.0]}]},
  // 3 classroom: the hero carries books in; books pile up; the giant thesis
  {shot: 3, loc: 'campus', move: 'side track with the hero carrying books', keys: [
    {at: 'start', pos: [-2.9, 1.5, -0.7], look: [-2.2, 1.4, -2.5]},
    {at: 'end', pos: [-0.1, 1.75, -0.5], look: [-0.5, 1.4, -3.2]}]},
  {shot: 3, from: 'ilmu', loc: 'campus', move: 'high angle down on the growing book piles', keys: [
    {at: 'start', pos: [0.45, 3.0, -1.2], look: [-0.5, 0.95, -3.3]},
    {at: 'end', pos: [0.25, 2.75, -1.45], look: [-0.5, 1.0, -3.3]}]},
  {shot: 3, from: 'skripsi', loc: 'campus', move: 'low dutch angle on the thesis', keys: [
    {at: 'start', pos: [0.3, 0.95, 0.6], look: [1.05, 1.35, -3.6], roll: -0.12},
    {at: 'end', pos: [0.4, 1.05, 0.2], look: [1.1, 1.4, -3.6], roll: -0.04}]},
  // 4 house: high crane while the hero walks up; low angle on the salesman; dutch on the shock
  {shot: 4, loc: 'house', move: 'high crane down following the walking hero', keys: [
    {at: 'start', pos: [-2.8, 3.4, 2.4], look: [-1.1, 1.0, -4.0], fov: 74},
    {at: 'end', pos: [-1.0, 1.8, 0.3], look: [-0.3, 1.5, -3.6]}]},
  {shot: 4, from: 'sales', loc: 'house', move: 'low angle on the salesman, tilt up to the billboard', keys: [
    {at: 'start', pos: [0.2, 0.8, -1.3], look: [0.55, 1.7, -3.1]},
    {at: 'cicilan', pos: [0.5, 0.95, -0.8], look: [1.1, 2.0, -4.6]},
    {at: 'end', pos: [0.55, 1.0, -0.95], look: [1.1, 2.0, -4.6]}]},
  {shot: 4, from: 'dp', loc: 'house', move: 'dutch close on the shocked buyer', keys: [
    {at: 'start', pos: [-0.6, 1.5, -1.45], look: [-0.85, 1.45, -2.8], roll: -0.15},
    {at: 'end', pos: [-0.7, 1.5, -1.75], look: [-0.85, 1.45, -2.8], roll: -0.07}]},
  // 5 schoolyard reunion: classmates run in, then generations keep arriving
  {shot: 5, loc: 'reunion', move: 'sideways track across the schoolyard', keys: [
    {at: 'start', pos: [-2.8, 1.5, 0.2], look: [-1.2, 1.4, -3.0]},
    {at: 'end', pos: [1.2, 1.7, 0.0], look: [0.3, 1.45, -3.0]}]},
  {shot: 5, from: 'teman', loc: 'reunion', move: 'low two-shot of the old friends', keys: [
    {at: 'start', pos: [-0.15, 1.0, -1.15], look: [-0.5, 1.5, -2.6]},
    {at: 'end', pos: [0.1, 1.05, -1.4], look: [-0.4, 1.5, -2.6]}]},
  {shot: 5, from: 'anak', loc: 'reunion', move: 'crane up and back in an arc as the crowd grows', keys: [
    {at: 'start', pos: [-0.9, 1.6, -0.3], look: [0, 1.5, -4.0]},
    {at: 'generasi', pos: [0.45, 3.1, 2.4], look: [0, 1.6, -6.0], fov: 84},
    {at: 'end', pos: [0.5, 3.2, 2.6], look: [0, 1.65, -6.0], fov: 84}]},
  // 6 office: track with the shuffling grandpa, low on the boss, high on grandpa
  {shot: 6, loc: 'office', move: 'low track beside grandpa, tilt up to the poster', keys: [
    {at: 'start', pos: [-2.8, 1.2, -0.9], look: [-2.2, 1.35, -3.0]},
    {at: 'empat', pos: [-0.9, 1.9, -0.3], look: [-1.1, 1.95, -5.0]},
    {at: 'end', pos: [-0.6, 1.85, -0.4], look: [-0.8, 1.8, -4.6]}]},
  {shot: 6, from: 'kakek', loc: 'office', move: 'low angle on the angry boss', keys: [
    {at: 'start', pos: [0.45, 0.95, -1.9], look: [0.75, 1.6, -3.4]},
    {at: 'end', pos: [0.5, 1.0, -2.1], look: [0.75, 1.6, -3.4]}]},
  {shot: 6, from: 'maaf', loc: 'office', move: 'high angle down on grandpa', keys: [
    {at: 'start', pos: [-0.25, 2.3, -1.3], look: [-0.6, 1.2, -2.7]},
    {at: 'end', pos: [-0.35, 2.15, -1.55], look: [-0.6, 1.2, -2.7]}]},
  // 7 Earth gets overcrowded; the crowd runs to the stall and fights
  {shot: 7, loc: 'earth', lift: false, move: 'arc in on the filling planet', keys: [
    {at: 'start', pos: [-2.6, 3.0, 4.2], look: [0, 1.6, -6.0], fov: 70},
    {at: 'end', pos: [0.4, 1.8, -1.3], look: [0, 1.65, -6.0]}]},
  {shot: 7, from: 'makanan', loc: 'street', move: 'handheld truck through the crowd', keys: [
    {at: 'start', pos: [-2.2, 1.3, -0.5], look: [-0.8, 1.4, -3.8], roll: 0.08},
    {at: 'end', pos: [1.4, 1.5, -0.2], look: [0.6, 1.4, -3.6], roll: -0.06}]},
  {shot: 7, from: 'rebutan', loc: 'street', move: 'high angle on the scramble', keys: [
    {at: 'start', pos: [0.2, 3.6, -0.4], look: [0, 0.9, -3.5]},
    {at: 'end', pos: [0.2, 3.9, 0.2], look: [0, 0.9, -3.5]}]},
  // 8 warung: grandpa walks up, complains, remembers the old price
  {shot: 8, loc: 'warung', move: 'low track beside grandpa walking to the stall', keys: [
    {at: 'start', pos: [-3.3, 1.0, -0.6], look: [-2.7, 1.35, -2.6]},
    {at: 'end', pos: [-0.4, 1.6, -0.1], look: [0, 1.45, -3.6]}]},
  {shot: 8, from: 'gorengan', loc: 'warung', move: 'side angle on grandpa, swing to his memory', keys: [
    {at: 'start', pos: [0.7, 1.2, -1.1], look: [-0.9, 1.5, -2.8]},
    {at: 'lalu', pos: [-0.35, 1.6, -0.9], look: [-1.2, 1.75, -2.8], roll: 0.06},
    {at: 'end', pos: [-0.45, 1.6, -1.15], look: [-1.2, 1.75, -2.8], roll: 0.03}]},
  // 9 park: the hero walks in, then gives bread to the kid
  {shot: 9, loc: 'park', move: 'crane down from the trees following the walking hero', keys: [
    {at: 'start', pos: [-3.4, 3.2, 1.2], look: [-2.4, 1.1, -2.4], fov: 74},
    {at: 'pas', pos: [-0.3, 1.7, -0.3], look: [0, 1.4, -3.0]},
    {at: 'end', pos: [0.2, 1.6, -0.4], look: [0.15, 1.4, -3.0]}]},
  {shot: 9, from: 'manfaat', loc: 'park', move: 'low arc around the giving', keys: [
    {at: 'start', pos: [0.0, 0.8, -1.0], look: [0.4, 1.3, -2.8]},
    {at: 'end', pos: [0.75, 0.85, -1.1], look: [0.45, 1.3, -2.8]}]},
  // 10 the question
  {shot: 10, loc: 'park', move: 'arc to the front, rise to the wishes', keys: [
    {at: 'start', pos: [-0.75, 1.45, -1.05], look: [-0.15, 1.5, -2.7]},
    {at: 'ngapain', pos: [0, 1.75, -0.3], look: [0, 1.85, -2.7]},
    {at: 'end', pos: [0, 1.8, -0.2], look: [0, 1.9, -2.7]}]},
  {shot: 10, from: 'komentar', loc: 'park', move: 'pull back and crane up to the comment sign', keys: [
    {at: 'start', pos: [0, 1.85, 0.0], look: [-0.05, 1.95, -2.9]},
    {at: 'end', pos: [0.2, 2.5, 1.3], look: [-0.05, 2.05, -2.9], fov: 84}]},
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
