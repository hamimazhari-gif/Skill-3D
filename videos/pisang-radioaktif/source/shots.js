// Camera plan: framings. Each entry is one framing inside narration shot `shot`; `from` (EV name) starts a hard cut
// inside that shot (the framing then runs until the next framing / shot end). Keys: {at: 'start' | 'end' | EV, pos, look}
// in location-local coordinates.
import * as THREE from 'three';
import {LOC} from './world';

export const SHOT_PLAN = [
  // 1 kitchen: "This fruit you eat all the time... is actually radioactive!"
  {shot: 1, loc: 'kitchen', move: 'push in on banana', keys: [
    {at: 'start', pos: [0.75, 1.62, -0.35], look: [0.2, 1.38, -2.4]},
    {at: 'end', pos: [0.32, 1.52, -1.05], look: [0.12, 1.42, -2.4]}]},
  {shot: 1, from: 'radio', loc: 'kitchen', move: 'pull back reveal', keys: [
    {at: 'start', pos: [1.25, 1.55, -0.2], look: [0.35, 1.15, -2.1]},
    {at: 'end', pos: [1.9, 1.85, 0.9], look: [0.3, 1.3, -2.3]}]},
  // 2 farm: potassium, muscles, heart
  {shot: 2, loc: 'farm', move: 'crane down', keys: [
    {at: 'start', pos: [1.4, 3.9, 3.2], look: [0.2, 1.6, -3.0]},
    {at: 'end', pos: [0.55, 1.6, 1.0], look: [0.1, 1.2, -1.8]}]},
  {shot: 2, from: 'otot', loc: 'farm', move: 'low push', keys: [
    {at: 'start', pos: [-0.9, 1.15, 0.2], look: [-0.25, 1.45, -1.8]},
    {at: 'end', pos: [-0.55, 1.2, -0.25], look: [-0.05, 1.6, -1.8]}]},
  // 3 lab: K-40 gives off radiation
  {shot: 3, loc: 'lab', move: 'establish + push', keys: [
    {at: 'start', pos: [3.0, 2.3, 1.8], look: [1.0, 1.2, -2.6]},
    {at: 'end', pos: [1.6, 1.65, -0.5], look: [0.9, 1.25, -2.6]}]},
  {shot: 3, from: 'k40', loc: 'lab', move: 'macro track', keys: [
    {at: 'start', pos: [0.62, 1.52, -1.75], look: [0.9, 1.45, -2.6]},
    {at: 'end', pos: [1.12, 1.56, -1.72], look: [0.92, 1.45, -2.6]}]},
  {shot: 3, from: 'alami', loc: 'lab', move: 'pull to scientist', keys: [
    {at: 'start', pos: [1.55, 1.5, -0.9], look: [1.6, 1.42, -3.3]},
    {at: 'end', pos: [1.75, 1.6, -0.3], look: [1.6, 1.4, -3.3]}]},
  // 4 lab chalkboard: banana equivalent dose
  {shot: 4, loc: 'lab', move: 'track to board', keys: [
    {at: 'start', pos: [0.4, 1.6, -0.6], look: [-0.6, 1.45, -4.6]},
    {at: 'end', pos: [-0.4, 1.7, -1.0], look: [-1.4, 1.6, -4.8]}]},
  {shot: 4, from: 'dose', loc: 'lab', move: 'push on board', keys: [
    {at: 'start', pos: [-1.45, 1.95, -2.9], look: [-1.5, 1.95, -5.8]},
    {at: 'end', pos: [-1.5, 1.95, -3.35], look: [-1.5, 1.95, -5.8]}]},
  {shot: 4, from: 'easy', loc: 'lab', move: 'two-shot', keys: [
    {at: 'start', pos: [-0.75, 1.62, -0.55], look: [-1.3, 1.45, -4.4]},
    {at: 'end', pos: [-0.7, 1.62, -0.85], look: [-1.28, 1.45, -4.4]}]},
  // 5 airport: a flight = hundreds of bananas
  {shot: 5, loc: 'airport', move: 'crane up wide', keys: [
    {at: 'start', pos: [-3.2, 1.1, 4.2], look: [0.5, 2.0, -6.0]},
    {at: 'end', pos: [-1.8, 2.2, 3.0], look: [0.8, 1.5, -4.0]}]},
  {shot: 5, from: 'hundreds', loc: 'airport', move: 'push on pile', keys: [
    {at: 'start', pos: [0.1, 1.55, 2.1], look: [0.15, 1.05, -1.8]},
    {at: 'end', pos: [-0.05, 1.5, 1.6], look: [0.05, 1.15, -1.8]}]},
  // 6 hospital: CT scan = tens of thousands
  {shot: 6, loc: 'hospital', move: 'push', keys: [
    {at: 'start', pos: [2.4, 1.7, 1.4], look: [0.3, 1.3, -2.6]},
    {at: 'end', pos: [1.6, 1.6, 0.6], look: [0.0, 1.3, -2.4]}]},
  {shot: 6, from: 'tens', loc: 'hospital', move: 'pull back', keys: [
    {at: 'start', pos: [-0.2, 1.65, 0.4], look: [-0.6, 1.2, -2.2]},
    {at: 'end', pos: [0.2, 2.3, 2.4], look: [-0.4, 1.0, -2.2]}]},
  // 7 banana mountain: relax... tens of millions... impossible
  {shot: 7, loc: 'mountain', move: 'slow push two-shot', keys: [
    {at: 'start', pos: [0.4, 1.5, 1.4], look: [0.2, 1.45, -1.3]},
    {at: 'end', pos: [0.3, 1.5, 0.7], look: [0.2, 1.45, -1.3]}]},
  {shot: 7, from: 'millions', loc: 'mountain', move: 'crane up reveal', keys: [
    {at: 'start', pos: [0.2, 1.2, 1.6], look: [0.2, 1.7, -1.3]},
    {at: 'end', pos: [0.0, 3.0, 4.8], look: [0.0, 4.2, -18]}]},
  {shot: 7, from: 'impossible', loc: 'mountain', move: 'close-up', keys: [
    {at: 'start', pos: [-0.05, 1.5, 1.05], look: [-0.35, 1.35, -1.2]},
    {at: 'end', pos: [-0.12, 1.5, 0.85], look: [-0.38, 1.35, -1.2]}]},
  // 8 kitchen: the body flushes extra potassium
  {shot: 8, loc: 'kitchen', move: 'push', keys: [
    {at: 'start', pos: [0.7, 1.55, -0.1], look: [0.1, 1.4, -2.4]},
    {at: 'end', pos: [0.45, 1.55, -0.7], look: [0.1, 1.45, -2.4]}]},
  {shot: 8, from: 'remove', loc: 'kitchen', move: 'crane up after tokens', keys: [
    {at: 'start', pos: [0.9, 1.6, 0.2], look: [0.2, 1.6, -2.4]},
    {at: 'end', pos: [1.0, 2.1, 0.6], look: [0.4, 2.0, -3.0]}]},
  // 9 lab corner: you are radioactive too
  {shot: 9, loc: 'lab', move: 'push two-shot', keys: [
    {at: 'start', pos: [3.9, 1.55, 0.6], look: [3.7, 1.3, -2.4]},
    {at: 'end', pos: [3.7, 1.5, -0.3], look: [3.6, 1.3, -2.4]}]},
  {shot: 9, from: 'because', loc: 'lab', move: 'close-up', keys: [
    {at: 'start', pos: [3.3, 1.55, -1.25], look: [3.2, 1.5, -2.4]},
    {at: 'end', pos: [3.25, 1.55, -1.4], look: [3.2, 1.5, -2.4]}]},
  // 10 farm finale
  {shot: 10, loc: 'farm', move: 'pull back', keys: [
    {at: 'start', pos: [0.0, 1.6, 2.2], look: [0.0, 1.4, -1.6]},
    {at: 'end', pos: [0.0, 2.0, 3.6], look: [0.0, 1.5, -1.6]}]},
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
