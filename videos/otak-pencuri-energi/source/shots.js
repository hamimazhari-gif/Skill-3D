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
  // 1 home: energy drains, a brain steals it from behind the sofa
  {shot: 1, loc: 'home', move: 'push in on the tired hero and the battery', keys: [
    {at: 'start', pos: [1.5, 2.0, 2.0], look: [-0.3, 1.5, -4.5]},
    {at: 'end', pos: [0.7, 1.7, 0.4], look: [-0.4, 1.4, -4.5]}]},
  {shot: 1, from: 'mencuri', loc: 'home', move: 'over the hero to the thief', keys: [
    {at: 'start', pos: [-1.0, 1.5, -1.0], look: [-2.3, 1.1, -5.4]},
    {at: 'end', pos: [-1.2, 1.45, -1.8], look: [-2.35, 1.1, -5.4]}]},
  // 2 lab: 2% vs 20%, then the reveal
  {shot: 2, loc: 'lab', move: 'push', keys: [
    {at: 'start', pos: [0.3, 1.95, 2.2], look: [0, 1.6, -4.6]},
    {at: 'end', pos: [0.1, 1.8, 0.9], look: [0, 1.6, -4.6]}]},
  {shot: 2, from: 'puluh', loc: 'lab', move: 'close on the pie', keys: [
    {at: 'start', pos: [0.9, 1.75, -1.6], look: [1.45, 1.6, -4.4]},
    {at: 'end', pos: [1.0, 1.7, -1.95], look: [1.45, 1.6, -4.4]}]},
  {shot: 2, from: 'otakmu', loc: 'lab', move: 'low push on the revealed brain', keys: [
    {at: 'start', pos: [0.4, 1.25, -1.9], look: [0.1, 1.45, -3.9]},
    {at: 'end', pos: [0.3, 1.3, -2.35], look: [0.1, 1.45, -3.9]}]},
  // 3 power room: brain lights the bulb, all day long
  {shot: 3, loc: 'power', move: 'push', keys: [
    {at: 'start', pos: [0.2, 1.8, 1.6], look: [0, 1.3, -4.0]},
    {at: 'end', pos: [0.1, 1.65, 0.5], look: [0, 1.3, -4.0]}]},
  {shot: 3, from: 'lampu', loc: 'power', move: 'close on the bulb', keys: [
    {at: 'start', pos: [0.9, 1.6, -1.5], look: [1.35, 1.6, -3.7]},
    {at: 'end', pos: [0.95, 1.6, -1.85], look: [1.35, 1.6, -3.7]}]},
  {shot: 3, from: 'sepanjang', loc: 'power', move: 'wide with the window', keys: [
    {at: 'start', pos: [0.6, 1.75, 0.6], look: [-0.3, 1.8, -4.6]},
    {at: 'end', pos: [0.2, 1.7, 0.1], look: [-0.3, 1.8, -4.6]}]},
  // 4 neurons
  {shot: 4, loc: 'neuro', move: 'close-up question', keys: [
    {at: 'start', pos: [-0.6, 1.5, -0.4], look: [-1.1, 1.45, -2.3]},
    {at: 'end', pos: [-0.7, 1.5, -0.65], look: [-1.1, 1.45, -2.3]}]},
  {shot: 4, from: 'miliar', loc: 'neuro', lift: false, move: 'crane up into the network', keys: [
    {at: 'start', pos: [0.2, 1.9, 2.4], look: [0, 2.7, -5.0]},
    {at: 'end', pos: [0, 2.5, 1.4], look: [0, 3.0, -5.5]}]},
  {shot: 4, from: 'tidur', loc: 'neuro', move: 'sleeping under firing neurons', keys: [
    {at: 'start', pos: [1.6, 1.8, -0.6], look: [1.0, 1.5, -3.8]},
    {at: 'end', pos: [1.5, 1.7, -1.0], look: [1.0, 1.5, -3.8]}]},
  // 5 study
  {shot: 5, loc: 'study', move: 'push to the plot twist', keys: [
    {at: 'start', pos: [0.6, 1.8, 1.2], look: [-0.3, 1.5, -3.6]},
    {at: 'end', pos: [0.4, 1.7, 0.4], look: [-0.3, 1.5, -3.6]}]},
  {shot: 5, from: 'belajar', loc: 'study', move: 'close-up studying hard', keys: [
    {at: 'start', pos: [0.1, 1.5, -1.1], look: [-0.4, 1.4, -3.2]},
    {at: 'end', pos: [0.0, 1.5, -1.35], look: [-0.4, 1.4, -3.2]}]},
  {shot: 5, from: 'kurus', loc: 'study', move: 'on the scale', keys: [
    {at: 'start', pos: [2.2, 1.4, 0.4], look: [1.45, 1.0, -2.3]},
    {at: 'end', pos: [2.1, 1.45, 0.1], look: [1.45, 1.05, -2.3]}]},
  // 6 lab: where the energy goes
  {shot: 6, loc: 'lab', move: 'close on the pie', keys: [
    {at: 'start', pos: [1.0, 1.85, -1.0], look: [1.55, 1.4, -4.4]},
    {at: 'end', pos: [1.05, 1.8, -1.4], look: [1.55, 1.4, -4.4]}]},
  {shot: 6, from: 'sebagian', loc: 'lab', move: 'wide: hero, brain and pie', keys: [
    {at: 'start', pos: [0.2, 1.85, 1.0], look: [0.4, 1.5, -4.3]},
    {at: 'end', pos: [0.1, 1.75, 0.3], look: [0.4, 1.5, -4.3]}]},
  // 7 playroom
  {shot: 7, loc: 'kids', lift: false, move: 'push on the kid', keys: [
    {at: 'start', pos: [0.4, 1.6, 1.2], look: [0, 1.0, -3.2]},
    {at: 'end', pos: [0.3, 1.45, 0.2], look: [0, 1.0, -3.2]}]},
  {shot: 7, from: 'lima', loc: 'kids', lift: false, move: 'low close on the kid', keys: [
    {at: 'start', pos: [0.35, 1.35, -0.9], look: [0.1, 1.3, -2.6]},
    {at: 'end', pos: [0.3, 1.35, -1.15], look: [0.1, 1.3, -2.6]}]},
  {shot: 7, from: 'separuh', loc: 'kids', lift: false, move: 'pie on the wall with the kid', keys: [
    {at: 'start', pos: [0.3, 1.55, -0.3], look: [1.0, 1.45, -4.6]},
    {at: 'end', pos: [0.25, 1.5, -0.6], look: [1.0, 1.45, -4.6]}]},
  {shot: 7, from: 'tumbuh', loc: 'kids', lift: false, move: 'pull back', keys: [
    {at: 'start', pos: [0.3, 1.3, -0.9], look: [0.1, 1.3, -2.6]},
    {at: 'end', pos: [0.4, 1.7, 0.8], look: [-0.2, 1.3, -3.4]}]},
  // 8 home: eat, drink, sleep
  {shot: 8, loc: 'home', move: 'push at the table', keys: [
    {at: 'start', pos: [0.6, 1.65, -0.2], look: [-0.5, 1.35, -3.2]},
    {at: 'end', pos: [0.4, 1.6, -0.7], look: [-0.5, 1.35, -3.2]}]},
  {shot: 8, from: 'tidur2', loc: 'home', move: 'to the bed', keys: [
    {at: 'start', pos: [1.5, 1.7, -2.1], look: [2.5, 1.2, -5.0]},
    {at: 'end', pos: [1.6, 1.65, -2.4], look: [2.5, 1.2, -5.0]}]},
  // 9 home: closing question
  {shot: 9, loc: 'home', move: 'push on the hero among organs', keys: [
    {at: 'start', pos: [0.1, 1.8, 1.0], look: [-0.25, 1.65, -3.0]},
    {at: 'end', pos: [0.05, 1.75, 0.4], look: [-0.25, 1.65, -3.0]}]},
  {shot: 9, from: 'komentar', loc: 'home', move: 'pull back to the sign', keys: [
    {at: 'start', pos: [0.05, 1.8, 0.4], look: [-0.4, 2.1, -5.5]},
    {at: 'end', pos: [0.3, 1.9, 1.4], look: [-0.5, 2.1, -5.5]}]},
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
