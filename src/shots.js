// Camera plan: per shot, location + keys [pos, look] + beat (event name, 'start' or 'end').
import * as THREE from 'three';
import {LOC} from './world';

export const SHOT_PLAN = [
  {shot: 1, loc: 'road', move: 'pull back + crane', keys: [
    {at: 'start', pos: [2.75, 1.05, 3.2], look: [2.1, 0.75, 1.6]},
    {at: 'rice', pos: [-0.3, 1.45, 3.0], look: [-0.9, 1.15, 0.3]},
    {at: 'end', pos: [1.6, 1.9, 5.6], look: [2.4, 1.7, -0.8]}]},
  {shot: 2, loc: 'market', move: 'sideways track', keys: [
    {at: 'start', pos: [-4.0, 1.45, 2.0], look: [-3.3, 0.95, -1.2]},
    {at: 'rice2', pos: [-3.0, 1.5, 2.1], look: [-3.0, 0.95, -1.2]},
    {at: 'salt', pos: [0.2, 1.5, 2.1], look: [0.2, 0.95, -1.2]},
    {at: 'goats', pos: [3.4, 1.5, 2.1], look: [3.4, 0.95, -1.2]},
    {at: 'end', pos: [3.9, 1.6, 2.4], look: [3.6, 0.95, -1.2]}]},
  {shot: 3, loc: 'docks', move: 'crane down', keys: [
    {at: 'start', pos: [2.2, 4.6, 3.6], look: [2.6, 0.2, -4.0]},
    {at: 'docks', pos: [0.7, 2.7, 2.9], look: [0.0, 0.9, -1.8]},
    {at: 'end', pos: [0.05, 1.55, 1.3], look: [-0.05, 1.15, -2.0]}]},
  {shot: 4, loc: 'docks', move: 'push in', continuous: true, keys: [
    {at: 'start', pos: [0.05, 1.55, 1.3], look: [-0.05, 1.15, -2.0]},
    {at: 'shakes', pos: [0.35, 1.55, 0.05], look: [0.38, 1.35, -2.2]},
    {at: 'end', pos: [0.75, 1.4, -0.35], look: [0.72, 1.05, -2.4]}]},
  {shot: 5, loc: 'shop', move: 'push + track', keys: [
    {at: 'start', pos: [-1.5, 1.55, 2.5], look: [-1.55, 1.1, -1.2]},
    {at: 'shoemaker', pos: [-0.2, 1.6, 1.2], look: [0.3, 1.25, -2.8]},
    {at: 'end', pos: [0.9, 1.65, 0.6], look: [1.4, 1.45, -4.9]}]},
  {shot: 6, loc: 'cross', move: 'crane up', keys: [
    {at: 'start', pos: [-1.3, 1.05, 1.9], look: [-1.55, 0.8, 0.55]},
    {at: 'feet', pos: [-0.5, 1.45, 2.5], look: [-0.35, 0.95, -0.2]},
    {at: 'end', pos: [0.4, 3.0, 4.4], look: [0.9, 2.0, -1.2]}]},
  {shot: 7, loc: 'market', move: 'crane up', keys: [
    {at: 'start', pos: [9.0, 1.5, 2.4], look: [9.0, 1.3, -1.5]},
    {at: 'two', pos: [9.0, 2.3, 1.6], look: [9.0, 1.7, -3.6]},
    {at: 'end', pos: [9.0, 2.9, 0.7], look: [9.0, 1.85, -3.6]}]},
  {shot: 8, loc: 'mint', move: 'track + push', keys: [
    {at: 'start', pos: [-2.55, 1.85, 1.1], look: [-2.4, 0.9, -1.4]},
    {at: 'salt8', pos: [-1.95, 1.85, 1.05], look: [-1.9, 0.9, -1.4]},
    {at: 'metal', pos: [-1.3, 1.85, 1.05], look: [-1.3, 0.9, -1.4]},
    {at: 'lydia', pos: [0.6, 1.9, 2.5], look: [1.6, 1.8, -2.6]},
    {at: 'end', pos: [1.3, 1.45, 1.2], look: [1.4, 1.1, -1.1]}]},
  {shot: 9, loc: 'museum', move: 'sideways track', keys: [
    {at: 'start', pos: [-1.75, 1.55, 1.1], look: [-1.5, 1.2, -1.4]},
    {at: 'paper', pos: [-1.45, 1.5, 0.55], look: [-1.5, 1.3, -1.4]},
    {at: 'tap', pos: [0.8, 1.5, 1.2], look: [1.15, 1.15, -1.5]},
    {at: 'end', pos: [1.0, 1.45, 0.85], look: [1.15, 1.1, -1.55]}]},
  {shot: 10, loc: 'market', move: 'pull back + track', keys: [
    {at: 'start', pos: [-2.2, 1.6, 1.6], look: [-2.4, 1.0, -1.2]},
    {at: 'single', pos: [0.8, 2.6, 5.4], look: [0.8, 1.2, -2.0]},
    {at: 'end', pos: [4.6, 1.75, 4.4], look: [5.0, 1.25, 0.6]}]},
  {shot: 11, loc: 'market', move: 'slow push', continuous: true, keys: [
    {at: 'start', pos: [4.6, 1.75, 4.4], look: [5.0, 1.25, 0.6]},
    {at: 'end', pos: [5.0, 1.55, 3.2], look: [5.15, 1.25, 0.6]}]},
];

export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1];
}

// Build per-shot curves and beat times.
export function buildCameras(T, EVt) {
  return SHOT_PLAN.map((p) => {
    const t0 = T.CUTS[p.shot - 1], t1 = T.CUTS[p.shot];
    const ox = LOC[p.loc];
    const times = p.keys.map((k) => (k.at === 'start' ? t0 : k.at === 'end' ? t1 - 0.15 : EVt[k.at] + 0.15));
    for (let i = 1; i < times.length; i++) times[i] = Math.max(times[i], times[i - 1] + 0.35);
    const pos = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.pos[0] + ox, k.pos[1], k.pos[2])), false, 'centripetal');
    const look = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.look[0] + ox, k.look[1], k.look[2])), false, 'centripetal');
    return {...p, t0, t1, times, pos, look};
  });
}

// Curve point at key-index parameter u (0..1): use getPoint, which is index-uniform for CatmullRomCurve3.
export function camAt(cams, shot, t) {
  const c = cams[shot - 1];
  const u = warpU(c.times, t);
  return {pos: c.pos.getPoint(u), look: c.look.getPoint(u), loc: c.loc};
}
