// Camera plan: framings. Each entry is one framing inside narration shot `shot`; `from` (EV name) starts a hard cut
// inside that shot (the framing then runs until the next framing / shot end). Keys: {at: 'start' | 'end' | EV, pos, look}
// in location-local coordinates.
import * as THREE from 'three';
import {LOC} from './world';

export const SHOT_PLAN = [
  // 1 bedroom 3 a.m.: "What happens... if you don't sleep for seven days?"
  {shot: 1, loc: 'bedroom', move: 'push in on hero in bed', keys: [
    {at: 'start', pos: [0.9, 1.6, 0.1], look: [-0.6, 1.1, -3.8]},
    {at: 'end', pos: [0.35, 1.4, -1.5], look: [-0.45, 1.15, -3.9]}]},
  {shot: 1, from: 'tujuh', loc: 'bedroom', move: 'two-shot with calendar', keys: [
    {at: 'start', pos: [0.75, 1.5, -1.1], look: [0.05, 1.35, -4.6]},
    {at: 'end', pos: [0.7, 1.5, -1.35], look: [0.05, 1.35, -4.6]}]},
  // 2 office, day 1: drunk-like brain, angry, slow reactions
  {shot: 2, loc: 'office', move: 'crane down', keys: [
    {at: 'start', pos: [2.2, 2.9, 1.6], look: [0.0, 1.0, -3.0]},
    {at: 'end', pos: [0.9, 1.6, -0.1], look: [0.0, 1.1, -3.0]}]},
  {shot: 2, from: 'mabuk', loc: 'office', move: 'close-up', keys: [
    {at: 'start', pos: [0.15, 1.3, -1.55], look: [-0.1, 1.15, -3.0]},
    {at: 'end', pos: [0.05, 1.27, -1.8], look: [-0.1, 1.15, -3.0]}]},
  {shot: 2, from: 'fokus', loc: 'office', move: 'two-shot', keys: [
    {at: 'start', pos: [0.95, 1.5, 0.3], look: [0.65, 1.2, -2.7]},
    {at: 'end', pos: [0.75, 1.45, -0.1], look: [0.6, 1.2, -2.7]}]},
  {shot: 2, from: 'lambat', loc: 'office', move: 'low angle on the mug', keys: [
    {at: 'start', pos: [-0.15, 0.55, -0.35], look: [-0.45, 0.75, -2.3]},
    {at: 'end', pos: [-0.2, 0.5, -0.55], look: [-0.45, 0.75, -2.3]}]},
  // 3 office, day 2 at dusk: microsleep
  {shot: 3, loc: 'office', move: 'push', keys: [
    {at: 'start', pos: [1.6, 1.7, 0.7], look: [-0.1, 1.1, -3.0]},
    {at: 'end', pos: [0.8, 1.5, -0.5], look: [-0.1, 1.1, -3.0]}]},
  {shot: 3, from: 'tertidur', loc: 'office', move: 'close-up', keys: [
    {at: 'start', pos: [0.3, 1.25, -1.55], look: [-0.1, 1.1, -3.0]},
    {at: 'end', pos: [0.2, 1.22, -1.8], look: [-0.1, 1.1, -3.0]}]},
  {shot: 3, from: 'micro', loc: 'office', move: 'side track', keys: [
    {at: 'start', pos: [-1.8, 1.45, -1.3], look: [0.1, 1.3, -3.2]},
    {at: 'end', pos: [-1.4, 1.4, -1.7], look: [0.2, 1.3, -3.2]}]},
  // 4 night road: dangerous while driving
  {shot: 4, loc: 'road', move: 'low push on car', keys: [
    {at: 'start', pos: [-1.5, 1.0, 2.8], look: [0.1, 0.95, -3.0]},
    {at: 'end', pos: [-0.9, 1.2, 1.4], look: [0.3, 1.0, -3.0]}]},
  {shot: 4, from: 'bahaya', loc: 'road', move: 'close-up driver', keys: [
    {at: 'start', pos: [1.05, 1.5, -1.3], look: [0.55, 1.2, -3.2]},
    {at: 'end', pos: [0.95, 1.45, -1.6], look: [0.5, 1.2, -3.2]}]},
  // 5 living room, days 3-4: hallucinations
  {shot: 5, loc: 'living', move: 'crane down', keys: [
    {at: 'start', pos: [2.3, 2.6, 1.5], look: [0.0, 0.9, -3.6]},
    {at: 'end', pos: [1.1, 1.6, 0.1], look: [0.0, 1.0, -3.6]}]},
  {shot: 5, from: 'melihat', loc: 'living', move: 'two-shot hero + goat', keys: [
    {at: 'start', pos: [0.25, 1.3, -1.25], look: [0.05, 1.0, -3.7]},
    {at: 'end', pos: [0.15, 1.25, -1.6], look: [0.05, 1.0, -3.7]}]},
  {shot: 5, from: 'mendengar', loc: 'living', move: 'tilt up to flying fish', keys: [
    {at: 'start', pos: [-1.3, 1.2, -0.6], look: [0.3, 1.5, -3.2]},
    {at: 'end', pos: [-1.0, 1.4, -1.1], look: [0.2, 1.6, -3.3]}]},
  {shot: 5, from: 'halu', loc: 'living', move: 'close-up', keys: [
    {at: 'start', pos: [-0.25, 1.25, -2.35], look: [-0.45, 1.15, -3.8]},
    {at: 'end', pos: [-0.3, 1.22, -2.55], look: [-0.45, 1.15, -3.8]}]},
  // 6 living room, days 5-7: real or not, suspicious, memory
  {shot: 6, loc: 'living', move: 'push three-shot', keys: [
    {at: 'start', pos: [1.9, 1.6, 0.6], look: [0.7, 1.2, -3.2]},
    {at: 'end', pos: [1.3, 1.5, -0.3], look: [0.7, 1.2, -3.2]}]},
  {shot: 6, from: 'nyata', loc: 'living', move: 'over the shoulder at the two friends', keys: [
    {at: 'start', pos: [-0.7, 1.4, -1.1], look: [1.8, 1.3, -3.1]},
    {at: 'end', pos: [-0.55, 1.4, -1.35], look: [1.8, 1.3, -3.1]}]},
  {shot: 6, from: 'pikiran', loc: 'living', move: 'close-up', keys: [
    {at: 'start', pos: [0.0, 1.25, -2.25], look: [-0.45, 1.15, -3.8]},
    {at: 'end', pos: [-0.1, 1.22, -2.5], look: [-0.45, 1.15, -3.8]}]},
  {shot: 6, from: 'ingatan', loc: 'living', move: 'pull back', keys: [
    {at: 'start', pos: [0.3, 1.4, -1.2], look: [0.3, 1.15, -3.4]},
    {at: 'end', pos: [0.8, 1.75, 0.4], look: [0.4, 1.2, -3.4]}]},
  // 7 1964: Randy Gardner, eleven days
  {shot: 7, loc: 'retro', move: 'crane from the board', keys: [
    {at: 'start', pos: [-1.1, 2.3, -2.7], look: [-1.35, 2.1, -5.4]},
    {at: 'end', pos: [-0.4, 1.8, -0.7], look: [-0.3, 1.6, -4.0]}]},
  {shot: 7, from: 'randy', loc: 'retro', move: 'push on Randy', keys: [
    {at: 'start', pos: [0.3, 1.5, -1.0], look: [0.0, 1.4, -2.65]},
    {at: 'end', pos: [0.2, 1.48, -1.25], look: [0.0, 1.4, -2.65]}]},
  {shot: 7, from: 'sebelas', loc: 'retro', move: 'wide with record sign', keys: [
    {at: 'start', pos: [0.6, 1.75, 0.6], look: [0.45, 1.8, -4.0]},
    {at: 'end', pos: [0.5, 1.85, 0.2], look: [0.45, 1.85, -4.0]}]},
  // 8 dream stadium: he thought he was a famous football player
  {shot: 8, loc: 'field', move: 'low push with goal posts', keys: [
    {at: 'start', pos: [0.0, 0.9, 3.0], look: [0.0, 1.7, -8.0]},
    {at: 'end', pos: [0.3, 1.3, 1.4], look: [0.0, 1.55, -8.0]}]},
  {shot: 8, from: 'mengira', loc: 'field', move: 'low-angle close-up', keys: [
    {at: 'start', pos: [0.35, 1.1, -0.35], look: [0.0, 1.5, -1.7]},
    {at: 'end', pos: [0.25, 1.15, -0.55], look: [0.0, 1.5, -1.7]}]},
  {shot: 8, from: 'terkenal', loc: 'field', move: 'crane up over the crowd', keys: [
    {at: 'start', pos: [0.2, 1.4, 0.6], look: [0.0, 1.6, -3.0]},
    {at: 'end', pos: [0.0, 3.0, 2.6], look: [0.0, 2.6, -14.0]}]},
  // 9 bedroom at night: don't try it, sleep 7-9 hours
  {shot: 9, loc: 'bedroom', move: 'close-up', keys: [
    {at: 'start', pos: [1.0, 1.5, -0.95], look: [0.75, 1.45, -2.45]},
    {at: 'end', pos: [0.95, 1.48, -1.2], look: [0.75, 1.45, -2.45]}]},
  {shot: 9, from: 'tidurlah', loc: 'bedroom', move: 'push on sleeper + sign', keys: [
    {at: 'start', pos: [0.4, 1.8, -0.8], look: [-1.1, 1.35, -4.3]},
    {at: 'end', pos: [0.0, 1.6, -1.55], look: [-1.15, 1.35, -4.3]}]},
  // 10 bedroom morning: closing question
  {shot: 10, loc: 'bedroom', move: 'close-up', keys: [
    {at: 'start', pos: [-0.05, 1.35, -1.95], look: [-0.6, 1.1, -3.85]},
    {at: 'end', pos: [-0.15, 1.3, -2.15], look: [-0.6, 1.1, -3.85]}]},
  {shot: 10, from: 'komentar', loc: 'bedroom', move: 'pull back to wide', keys: [
    {at: 'start', pos: [-0.1, 1.5, -1.3], look: [-0.8, 1.75, -4.6]},
    {at: 'end', pos: [0.4, 1.8, 0.2], look: [-0.7, 1.7, -4.6]}]},
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
    const pos = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.pos[0] + ox, k.pos[1], k.pos[2])), false, 'centripetal');
    const look = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.look[0] + ox, k.look[1], k.look[2])), false, 'centripetal');
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
