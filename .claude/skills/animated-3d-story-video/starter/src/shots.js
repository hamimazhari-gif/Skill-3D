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
  // 1 planet: "What happens... if Earth suddenly stops spinning?" — orbit in, then close on the hero as it halts
  {shot: 1, loc: 'planet', move: 'orbit + crane to the top of the globe', keys: [
    {at: 'start', pos: [4.5, 2.6, 4.0], look: [0, 1.6, -6]},
    {at: 'end', pos: [1.3, 4.4, -2.7], look: [0, 4.0, -6]}]},
  {shot: 1, from: 'berhenti', loc: 'planet', move: 'close-up', keys: [
    {at: 'start', pos: [0.6, 4.6, -4.15], look: [0, 4.3, -6]},
    {at: 'end', pos: [0.4, 4.55, -4.4], look: [0, 4.3, -6]}]},
  // 2 town: calm, then speed lines
  {shot: 2, loc: 'town', move: 'push', keys: [
    {at: 'start', pos: [1.6, 1.9, 3.2], look: [0, 1.1, -2.6]},
    {at: 'end', pos: [0.7, 1.55, 1.1], look: [0, 1.15, -2.2]}]},
  {shot: 2, from: 'cepat', loc: 'town', move: 'close-up', keys: [
    {at: 'start', pos: [0.3, 1.45, -0.1], look: [0, 1.35, -1.3]},
    {at: 'end', pos: [0.15, 1.42, -0.3], look: [0, 1.35, -1.3]}]},
  // 3 planet: equator speed
  {shot: 3, loc: 'planet', move: 'push on the spinning globe', keys: [
    {at: 'start', pos: [1.3, 1.2, 3.8], look: [0, 0.3, -6]},
    {at: 'end', pos: [0.5, 0.7, 2.2], look: [0, 0.2, -6]}]},
  {shot: 3, from: 'seribu', loc: 'planet', move: 'push to the speed sign', keys: [
    {at: 'start', pos: [0.5, 0.35, 0.8], look: [0, 0.0, -2.5]},
    {at: 'end', pos: [0.2, 0.2, 0.2], look: [0, 0.0, -2.5]}]},
  // 4 town: the Earth stops, everything flies east
  {shot: 4, loc: 'town', move: 'wide, slow push', keys: [
    {at: 'start', pos: [0.4, 2.3, 5.6], look: [0, 1.3, -3.0]},
    {at: 'end', pos: [0.1, 2.0, 4.6], look: [0, 1.3, -3.0]}]},
  {shot: 4, from: 'manusia', loc: 'town', move: 'track right with the flyers', keys: [
    {at: 'start', pos: [-0.4, 1.7, 3.0], look: [0.8, 1.4, -2.5]},
    {at: 'end', pos: [1.8, 2.0, 3.4], look: [4.0, 1.9, -3.5]}]},
  {shot: 4, from: 'terlempar', loc: 'town', move: 'pull back wide', keys: [
    {at: 'start', pos: [0.4, 1.8, 2.6], look: [0.6, 1.5, -1.5]},
    {at: 'end', pos: [1.6, 2.6, 4.6], look: [4.4, 2.6, -1.5]}]},
  // 5 town in the storm: hero clings to the lamp post
  {shot: 5, loc: 'town', lift: false, move: 'push', keys: [
    {at: 'start', pos: [0.8, 2.1, 4.6], look: [2.6, 1.6, -2.0]},
    {at: 'end', pos: [2.0, 1.95, 2.6], look: [3.0, 1.7, -1.2]}]},
  {shot: 5, from: 'angin', loc: 'town', lift: false, move: 'close-up on the face in the wind', keys: [
    {at: 'start', pos: [3.1, 2.0, 0.55], look: [2.85, 1.8, -0.7]},
    {at: 'end', pos: [3.0, 1.95, 0.35], look: [2.85, 1.8, -0.7]}]},
  // 6 beach: the sea drains away
  {shot: 6, loc: 'beach', move: 'crane down', keys: [
    {at: 'start', pos: [0.9, 2.6, 2.6], look: [0, 0.8, -6]},
    {at: 'end', pos: [0.5, 1.7, 1.4], look: [0, 0.9, -6]}]},
  {shot: 6, from: 'mengalir', loc: 'beach', move: 'low angle over the hero to the horizon', keys: [
    {at: 'start', pos: [-0.9, 0.9, 1.0], look: [0.4, 1.2, -6]},
    {at: 'end', pos: [-0.7, 1.0, 0.5], look: [0.6, 1.2, -6]}]},
  // 7 planet: oceans pool at the poles, a giant continent appears
  {shot: 7, loc: 'planet', move: 'slow push on the whole globe', keys: [
    {at: 'start', pos: [1.0, 0.7, 3.2], look: [0, 0.1, -6]},
    {at: 'end', pos: [0.5, 0.5, 2.0], look: [0, 0.1, -6]}]},
  {shot: 7, from: 'daratan', loc: 'planet', move: 'push to the continent band', keys: [
    {at: 'start', pos: [0.6, 0.4, 0.4], look: [0, 0.0, -6]},
    {at: 'end', pos: [0.3, 0.3, -0.4], look: [0, 0.0, -6]}]},
  // 8 room: clock and 24 hours crossed out
  {shot: 8, loc: 'room', move: 'push', keys: [
    {at: 'start', pos: [1.3, 1.75, 1.4], look: [-0.3, 1.6, -4.5]},
    {at: 'end', pos: [0.7, 1.65, 0.2], look: [-0.3, 1.6, -4.5]}]},
  {shot: 8, from: 'jam24', loc: 'room', move: 'close on the crossed-out sign', keys: [
    {at: 'start', pos: [-0.5, 1.75, -1.5], look: [-1.2, 1.8, -4.8]},
    {at: 'end', pos: [-0.6, 1.75, -1.9], look: [-1.25, 1.85, -4.8]}]},
  // 9 desert -> frozen night
  {shot: 9, loc: 'desert', move: 'low push looking up to the sun', keys: [
    {at: 'start', pos: [0.9, 1.3, 1.8], look: [0, 1.7, -4]},
    {at: 'end', pos: [0.5, 1.4, 0.6], look: [0, 1.6, -4]}]},
  {shot: 9, from: 'siang', loc: 'desert', move: 'close-up sweating', keys: [
    {at: 'start', pos: [0.3, 1.45, -0.3], look: [-0.1, 1.35, -1.6]},
    {at: 'end', pos: [0.2, 1.42, -0.5], look: [-0.1, 1.35, -1.6]}]},
  {shot: 9, from: 'lainnya', loc: 'frozen', move: 'push in the snow', keys: [
    {at: 'start', pos: [-0.9, 1.9, 2.2], look: [0.2, 1.1, -2.6]},
    {at: 'end', pos: [-0.4, 1.7, 1.0], look: [0.2, 1.1, -2.6]}]},
  {shot: 9, from: 'membeku', loc: 'frozen', move: 'close-up frozen', keys: [
    {at: 'start', pos: [0.35, 1.45, 0.3], look: [0, 1.3, -1.6]},
    {at: 'end', pos: [0.5, 1.55, 0.6], look: [0, 1.3, -1.6]}]},
  // 10 lab: scientists say no
  {shot: 10, loc: 'lab', move: 'push', keys: [
    {at: 'start', pos: [0.2, 1.9, 1.8], look: [0.2, 1.5, -4.6]},
    {at: 'end', pos: [0.1, 1.75, 0.6], look: [0.2, 1.5, -4.6]}]},
  {shot: 10, from: 'ilmuwan', loc: 'lab', move: 'two-shot board + scientist', keys: [
    {at: 'start', pos: [-0.3, 1.7, -1.2], look: [-0.6, 1.7, -5.2]},
    {at: 'end', pos: [-0.1, 1.7, -1.5], look: [-0.4, 1.7, -5.2]}]},
  {shot: 10, from: 'tidak', loc: 'lab', move: 'close-up relieved hero', keys: [
    {at: 'start', pos: [1.25, 1.55, -0.35], look: [0.9, 1.5, -2.0]},
    {at: 'end', pos: [1.3, 1.6, -0.1], look: [0.9, 1.55, -2.0]}]},
  // 11 planet: closing question
  {shot: 11, loc: 'planet', move: 'push on the hero on top of the world', keys: [
    {at: 'start', pos: [1.1, 4.5, -2.6], look: [0, 4.1, -6]},
    {at: 'end', pos: [0.5, 4.4, -3.7], look: [0, 4.15, -6]}]},
  {shot: 11, from: 'komentar', loc: 'planet', move: 'pull back to the whole globe', keys: [
    {at: 'start', pos: [0.5, 4.5, -3.5], look: [0, 4.3, -6]},
    {at: 'end', pos: [1.6, 4.5, 0.4], look: [0, 3.3, -6]}]},
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
