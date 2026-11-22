// All locations in one scene at different x offsets. Each returns {group, update(t)}.
import * as THREE from 'three';
import {toon, box, cyl, ball, at, sign, paintTex, pop, smooth, clamp01, INK, decal, signTex} from './kit';
import {makeChar} from './char';
import * as P from './props';
import * as FX from './vfx';
import {LOOK_PRESETS, MOODS} from './lighting';

export const LOC = {road: 0, market: 40, docks: 80, shop: 120, cross: 160, mint: 200, museum: 240};

export {LOOK_PRESETS, MOODS} from './lighting';

export const LOOK = {
  road: {fog: '#efe6d2', near: 14, far: 55, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#fff0d8', keyI: 2.6, hemiI: 1.35, keyPos: [-6, 10, 7]},
  market: {fog: '#f1e5cf', near: 12, far: 45, skyTop: '#a6cbe6', skyBottom: '#f6ead6', key: '#ffeccc', keyI: 2.6, hemiI: 1.35, keyPos: [-6, 10, 7]},
  docks: {fog: '#e4ecec', near: 14, far: 60, skyTop: '#8fc1e3', skyBottom: '#eef1e8', key: '#fff3e0', keyI: 2.5, hemiI: 1.4, keyPos: [-7, 10, 6]},
  shop: {fog: '#3a2a26', near: 8, far: 30, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#ffe2b8', keyI: 2.4, hemiI: 1.25, keyPos: [-4, 8, 8]},
  // "Half a day gone": the sun sinks through the shot and the mood turns sad on "still no fish".
  cross: {keys: [{at: 'cut6', ...LOOK_PRESETS.goldenHour, keyPos: [-8, 9, 6]}, {at: 'nofish', ...LOOK_PRESETS.dusk, ...MOODS.sad, keyPos: [-6, 4, 5]}]},
  mint: {fog: '#3a2620', near: 8, far: 30, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#ffd6a0', keyI: 2.5, hemiI: 1.2, keyPos: [-4, 8, 8]},
  museum: {fog: '#2e3440', near: 8, far: 30, skyTop: '#9cc6e6', skyBottom: '#f6ead6', key: '#fff4e6', keyI: 2.4, hemiI: 1.35, keyPos: [-4, 8, 8]},
};

function ground(w, d, color, paint) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(paintTex(color, {seed: 3, grain: 220, stains: 20, chips: 0, scratches: 0, repeat: [w / 4, d / 4], ...paint})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}

// Screen-level effects for this story: flashes (overlay) and camera shakes, timed to words.
export function storyFx(T, EVt) {
  return {
    flashes: [{t: EVt.coins + 0.02, dur: 0.35, color: '#ffe9b0', strength: 0.7}],
    shakes: [{t: EVt.coins, dur: 0.45, amp: 0.035}, {t: EVt.goat + 0.15, dur: 0.3, amp: 0.02}],
  };
}

export function buildWorld(lang, T, EVt, L) {
  const world = new THREE.Group();
  const chars = [];
  const updaters = [];
  const locGroups = {};
  const addLoc = (name) => { const g = new THREE.Group(); g.position.x = LOC[name]; world.add(g); locGroups[name] = g; return g; };
  const ch = (name, o, parent, x, z, yaw = 0) => { const c = makeChar(name, {yaw, ...o}); at(c.group, x, 0, z); parent.add(c.group); chars.push(c); return c; };
  const E = (k) => EVt[k];
  const cut = (k) => T.CUTS[k - 1];

  // ---------- L0: village road to the market ----------
  {
    const g = addLoc('road');
    g.add(ground(60, 60, '#9dbb6a'));
    const road = box(26, 0.03, 2.4, toon('#c9a77a', {paint: {grain: 200, seed: 8}}), {edges: false, hull: 0}); at(road, 0, 0, 0.3); g.add(road);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      const p = box(3.2, 0.18, 2.0, toon('#7fae4f', {paint: {stripes: {n: 12, color: '#6f9e45'}, seed: 70 + i}}));
      at(p, -9 + i * 3.6, 0, -3.2 - j * 2.4); g.add(p);
    }
    const gate = P.banner(L.market, 2.4, 0.66, {poleH: 3.1}); at(gate, 3.6, 0, -1.3); g.add(gate);
    const cg = P.cage(); at(cg, 2.1, 0, 1.6, -0.3); g.add(cg);
    const sk = P.sack(null, {scale: 0.9, color: '#cdb48a'}); at(sk, 4.6, 0, 1.3); g.add(sk);
    const bk = P.basket(); at(bk, 3.9, 0, 2.6); g.add(bk);
    const h1 = P.house(4, 2.8, 3, {seed: 4}); at(h1, -6.5, 0, -10.5, 0.15); g.add(h1);
    const h2 = P.house(3.4, 2.6, 3, {color: '#dcb98a', roof: '#8a5a3a', seed: 6, shutter: '#4f7fa6'}); at(h2, 7.5, 0, -11, -0.2); g.add(h2);
    for (const [x, z, s] of [[-3, -12, 1], [1.5, -13, 2], [11, -9, 3], [-10, -8, 4], [6, -6.5, 5]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    const seller = ch('sellerA', {}, g, 2.9, 1.0, 0.3);
    const farmer = ch('farmer', {}, g, -2.4, 0.4, 0.6);
    const fs = P.sack(L.rice, {scale: 0.8}); at(fs, 0.3, 0.92, -0.08, 0, 0, -0.15); fs.traverse((m) => { m.castShadow = false; }); farmer.group.children[0].add(fs);
    farmer.act([
      {t: 0, pose: 'carry', expr: 'happy', action: 'walk', dur: cut(2) - 0.2},
      {t: E('chicken'), expr: 'excited'},
      {t: E('rice'), expr: 'worried', action: 'tremble', dur: 0.5},
      {t: E('market') - 0.1, expr: 'determined'},
    ]);
    seller.act([{t: 0, pose: 'hips', expr: 'smug'}, {t: E('chicken'), pose: 'present', expr: 'happy', action: 'hop', dur: 0.5}]);
    updaters.push((t) => {
      const u = clamp01((t - 0) / (cut(2)));
      farmer.group.position.x = -2.6 + u * 3.0;
      cg.userData.chicken.rotation.y = -0.3 + Math.sin(t * 3) * 0.3;
      cg.userData.chicken.position.y = 0.45 + Math.abs(Math.sin(t * 5)) * 0.03;
    });
  }

  // ---------- L1: barter market (also shots 7, 10, 11) ----------
  {
    const g = addLoc('market');
    g.add(ground(60, 60, '#c8ad86', {cobbles: true}));
    const stalls = [[-4.2, -4.2, L.fish, '#4f7fa6'], [0, -4.6, L.salt, '#d9774a'], [4.2, -4.2, L.cloth, '#9a6fb0']];
    for (const [x, z, l, c] of stalls) { const s = P.stall(l, {awning: c}); at(s, x, 0, z); g.add(s); }
    const b1 = P.basket(); at(b1, -4.6, 0.85, -4.2); g.add(b1);
    const b2 = P.basket(); at(b2, -3.8, 0.85, -4.2); g.add(b2);
    const salt = P.sack(null, {color: '#f4f1ea', scale: 0.6}); at(salt, -0.4, 0.85, -4.6); g.add(salt);
    const salt2 = P.sack(null, {color: '#f4f1ea', scale: 0.55}); at(salt2, 0.4, 0.85, -4.5); g.add(salt2);
    for (let i = 0; i < 3; i++) { const cl = cyl(0.12, 0.12, 0.7, ['#c75b5b', '#e0b84f', '#5a9a8a'][i]); at(cl, 3.7 + i * 0.4, 0.97, -4.2, 0, 0, Math.PI / 2); g.add(cl); }
    for (const [x, z] of [[-8, -9], [8, -10], [-11, -3], [13.5, -7]]) { const h = P.house(4, 3, 3, {seed: x + 20, color: x < 0 ? '#e6c99a' : '#d8b48a'}); at(h, x, 0, z, x < 0 ? 0.5 : -0.5); g.add(h); }
    for (const [x, z, s] of [[-6, -14, 3], [5, -15, 8], [13, -11, 2]]) { const tr = P.tree({seed: s}); at(tr, x, 0, z); g.add(tr); }
    for (const [x, z] of [[-6.5, 1.2], [6.6, 0.6]]) { const b = P.barrel(); at(b, x, 0, z); g.add(b); }

    // shot 2: three trading pairs, each with a crate where goods pop in on the words
    const pairs = [
      {x: -3.0, a: 'farmer', b: 'fisher', ga: () => P.sack(L.rice, {scale: 0.55}), gb: () => P.basket(undefined, 2), ea: 'rice2', eb: 'fish'},
      {x: 0.2, a: 'sellerB', b: 'sellerC', ga: () => P.sack(null, {color: '#f4f1ea', scale: 0.5}), gb: () => { const gg = new THREE.Group(); for (let i = 0; i < 3; i++) { const c = cyl(0.09, 0.09, 0.5, ['#c75b5b', '#e0b84f', '#5a9a8a'][i]); at(c, 0, 0.09 + i * 0.17, 0, 0, 0, Math.PI / 2); gg.add(c); } return gg; }, ea: 'salt', eb: 'cloth'},
      {x: 3.4, a: 'sellerD', b: 'sellerA', ga: () => { const gt = P.goat(); gt.scale.setScalar(0.75); return gt; }, gb: () => { const gg = new THREE.Group(); for (let i = 0; i < 5; i++) { const w = cyl(0.015, 0.015, 0.6, '#d9b44a', {hull: 0.006}); at(w, (i - 2) * 0.03, 0, 0, 0, 0, (i - 2) * 0.08); gg.add(w); const e = ball(0.035, '#e0bf5a', {sx: 0.7, sy: 1.6, sz: 0.7}); at(e, (i - 2) * 0.03 + Math.sin((i - 2) * 0.08) * -0.6, 0.62, 0); gg.add(e); } return gg; }, ea: 'goats', eb: 'wheat'},
    ];
    const pairGroup = new THREE.Group(); g.add(pairGroup);
    const pops = [];
    for (const p of pairs) {
      const cr = P.crate(0.8, 0.5, 0.6, null); at(cr, p.x, 0, -1.2); pairGroup.add(cr);
      const ca = ch(p.a, {}, pairGroup, p.x - 0.75, -1.15, 0.35);
      const cb2 = ch(p.b, {}, pairGroup, p.x + 0.75, -1.15, -0.35);
      ca.act([{t: 0, pose: 'hold', expr: 'neutral'}, {t: E(p.ea) - 0.05, pose: 'give', expr: 'happy', action: 'hop', dur: 0.5}, {t: E(p.eb) + 0.1, expr: 'laugh', pose: 'cheer'}]);
      cb2.act([{t: 0, pose: 'hips', expr: 'thinking'}, {t: E(p.ea) + 0.1, expr: 'surprised'}, {t: E(p.eb) - 0.05, pose: 'give', expr: 'happy', action: 'hop', dur: 0.5}]);
      const A = p.ga(); at(A, p.x - 0.2, p.a === 'sellerD' ? 0 : 0.5, p.a === 'sellerD' ? -0.55 : -1.2); pairGroup.add(A); pops.push([A, p.ea]);
      if (p.a === 'sellerD') { A.position.x = p.x - 0.1; A.position.z = -2.0; A.rotation.y = 0.5; }
      const B = p.gb(); at(B, p.x + 0.2, 0.5, -1.2); pairGroup.add(B); pops.push([B, p.eb]);
    }
    // shot 7: notice board with two painted "want" circles that slide together
    const board = new THREE.Group(); at(board, 9, 0, -3.6); g.add(board);
    for (const s of [-1, 1]) { const p = cyl(0.09, 0.1, 4.0, '#7a5236'); at(p, s * 1.85, 0, 0); board.add(p); }
    const panel = box(3.4, 2.1, 0.12, toon('#efdcb2', {paint: {seed: 90, stains: 20}})); at(panel, 0, 1.75, 0); board.add(panel);
    const ring = (label, col) => {
      const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
      x.fillStyle = col; x.globalAlpha = 0.35; x.beginPath(); x.arc(256, 256, 230, 0, 7); x.fill(); x.globalAlpha = 1;
      x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.arc(256, 256, 230, 0, 7); x.stroke();
      x.fillStyle = INK; x.font = '900 92px "Inter Display"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 256, 256);
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({map: tx, transparent: true, depthWrite: false}));
      return m;
    };
    const rL = ring(L.rice, '#e0b84f'); const rR = ring(L.fish, '#5f9fb8');
    rL.position.set(-0.8, 1.75, 0.07); rR.position.set(0.8, 1.75, 0.075); board.add(rL, rR);
    const chk = P.chalkDoodle('check', 0.5, 0.5); chk.material.color.set('#3f7a3a'); chk.position.set(0, 1.75, 0.08); board.add(chk);
    const top = box(3.7, 0.12, 0.3, '#7a5236'); at(top, 0, 2.86, 0); board.add(top);
    const f7 = ch('farmer', {seed: 99}, g, 8.0, -1.4, 0.2);
    for (const [x, d] of [[8.0, 0], [10.0, 0.1]]) { const dd = FX.dust([x, 0.05, -1.4], EVt.once + d + 0.55, {}); g.add(dd.obj); updaters.push(dd.update); }
    const n7 = ch('fisher', {seed: 98}, g, 10.0, -1.4, -0.2);

    // shot 10/11: coins and the chalkboard
    const coinGroup = new THREE.Group(); g.add(coinGroup);
    for (const [x, z] of [[-3.0, -1.2], [0.2, -1.2], [3.4, -1.2]]) { const cp = P.coinPile(9, x * 10 + 50); at(cp, x, 0.5, z); coinGroup.add(cp); }
    const buyer = ch('buyer', {}, coinGroup, -1.9, -0.6, 0.3);
    ch('sellerC', {seed: 61}, coinGroup, -4.2, -3.25, 0).act([{t: 0, pose: 'wave', expr: 'happy'}]); ch('sellerB', {seed: 62}, coinGroup, 0, -3.6, 0).act([{t: 0, pose: 'presentBoth', expr: 'laugh'}]); ch('sellerD', {seed: 63}, coinGroup, 4.2, -3.25, 0).act([{t: 0, pose: 'hips', expr: 'proud'}]); ch('fisher', {seed: 64}, coinGroup, -0.9, -1.0, -0.3).act([{t: 0, pose: 'give', expr: 'happy'}]);
    const ph = P.phone(); at(ph, 0, 0.02, 0.05); buyer.hand(1).add(ph);
    const cb = P.chalkboard(1.3, 0.95, {text: L.trade, textY: 0.5});
    const easel = new THREE.Group(); at(easel, 5.6, 0, 0.6, -0.35); g.add(easel);
    for (const s of [-1, 1]) { const leg = cyl(0.03, 0.03, 1.9, '#7a5236', {hull: 0.01}); at(leg, s * 0.55, 0, 0.1, 0, -0.12); easel.add(leg); }
    const back = cyl(0.03, 0.03, 1.9, '#7a5236', {hull: 0.01}); at(back, 0, 0, -0.35, 0, 0.25); easel.add(back);
    at(cb, 0, 1.25, 0.12, 0, -0.12); easel.add(cb);
    const f11 = ch('farmer', {seed: 97}, g, 4.55, 0.85, 0.2);
    const sk11 = P.sack(L.rice, {scale: 0.55}); at(sk11, 4.0, 0, 1.15, 0.3); g.add(sk11);
    const ph11 = P.phone(); at(ph11, 0, 0.03, 0.05); f11.hand(1).add(ph11);
    f7.act([{t: 0, pose: 'chin', expr: 'thinking'}, {t: E('two'), pose: 'present', expr: 'surprised'}, {t: E('once'), pose: 'cheer', expr: 'excited', action: 'jump', dur: 0.7}]);
    n7.act([{t: 0, pose: 'cross', expr: 'confused'}, {t: E('two') + 0.2, pose: 'present', expr: 'surprised'}, {t: E('once') + 0.1, pose: 'cheer', expr: 'laugh', action: 'jump', dur: 0.7}]);
    buyer.act([{t: 0, pose: 'give', expr: 'happy'}, {t: E('single'), action: 'hop', dur: 0.6, expr: 'laugh'}]);
    f11.act([{t: 0, pose: 'hold', expr: 'thinking'}, {t: E('trade'), pose: 'shrug', expr: 'confused', action: 'hop', dur: 0.4}, {t: E('comment'), pose: 'point', expr: 'excited', action: 'jump', dur: 0.6}]);

    updaters.push((t) => {
      const s2 = t >= cut(2) && t < cut(3);
      const s7 = t >= cut(7) && t < cut(8);
      const s10 = t >= cut(10);
      pairGroup.visible = s2;
      for (const [o, k] of pops) o.scale.setScalar(pop(t, E(k) - 0.05));
      board.visible = s7; f7.group.visible = s7; n7.group.visible = s7;
      const u = smooth((t - E('see')) / Math.max(0.5, E('once') - E('see')));
      rL.position.x = -1.05 + 0.55 * u; rR.position.x = 1.05 - 0.55 * u;
      chk.scale.setScalar(s10 ? 1 : pop(t, E('once')));
      coinGroup.visible = s10; easel.visible = s10; f11.group.visible = s10; sk11.visible = s10;
    });
  }

  // ---------- L2: docks ----------
  {
    const g = addLoc('docks');
    const sand = ground(60, 26, '#e3cf9e'); sand.position.z = 13 + 1.5; g.add(sand);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(80, 70), new THREE.MeshToonMaterial({map: P.waterTex(), gradientMap: undefined}));
    water.rotation.x = -Math.PI / 2; water.position.set(0, -0.55, -33.5); water.receiveShadow = true; g.add(water);
    const deck = box(3.0, 0.16, 10, toon('#b08454', {paint: {planks: 14, seed: 33}})); at(deck, 0, -0.16, -3.4); g.add(deck);
    deck.children[0].material.map.rotation = Math.PI / 2;
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const p = cyl(0.11, 0.11, 1.2, '#7a5236'); at(p, s * 1.45, -0.9, 1.0 - i * 1.9); g.add(p); }
    for (const s of [-1, 1]) { const rail = box(0.08, 0.08, 9.5, '#7a5236'); at(rail, s * 1.48, 0.6, -3.6); if (s > 0) g.add(rail); }
    for (let i = 0; i < 5; i++) { const p = cyl(0.05, 0.05, 0.62, '#7a5236'); at(p, 1.48, 0, 0.6 - i * 2.2); g.add(p); }
    const bt = P.boat(); at(bt, 3.4, -0.6, -3.2, Math.PI / 2 + 0.1); g.add(bt);
    const bt2 = P.boat(); at(bt2, -5.5, -0.6, -8, 0.4); g.add(bt2);
    const sg = new THREE.Group(); at(sg, -1.75, 0, 0.6); g.add(sg);
    const pole = cyl(0.07, 0.08, 2.6, '#7a5236'); sg.add(pole);
    const sb = sign(L.signDocks, 1.5, 0.45, {bg: '#e9d6a8'}); at(sb, 0.0, 2.25, 0.08); sg.add(sb);
    const bkt = P.basket(); at(bkt, -0.95, 0, -2.6); g.add(bkt);
    const bkt2 = P.basket(); at(bkt2, -0.75, 0, -3.3); g.add(bkt2);
    const brl = P.barrel(); at(brl, 1.0, 0, -2.6); g.add(brl);
    const slate = P.chalkboard(0.5, 0.4, {}); at(slate, 1.0, 1.02, -2.38, 0, -0.25); g.add(slate);
    const shoe = P.chalkDoodle('shoe', 0.38, 0.32); shoe.position.set(1.0, 1.04, -2.33); shoe.rotation.x = -0.25; g.add(shoe);
    const rope = cyl(0.25, 0.25, 0.12, '#c9a462'); at(rope, -1.0, 0, -0.6); g.add(rope);
    const cr = P.crate(0.7, 0.5, 0.6, null); at(cr, 0.95, 0, -4.4); g.add(cr);
    for (const [x, z, s] of [[-7, 6, 11], [8, 7, 12]]) { const tr = P.tree({seed: s, leaf: '#7aa35a', h: 3}); at(tr, x, 0, z); g.add(tr); }
    const shed = P.house(3.6, 2.6, 3, {color: '#c9b08a', roof: '#5f7f8a', seed: 13, windows: 1}); at(shed, -6, 0, 3.2, 0.6); g.add(shed);
    const fisher = ch('fisher', {}, g, 0.35, -2.25, 0);
    const farmer = ch('farmer', {seed: 44}, g, -0.6, -1.6, 0.4);
    farmer.act([{t: 0, pose: 'carry', expr: 'excited'}, {t: E('fisherman'), expr: 'happy', action: 'hop', dur: 0.5},
      {t: E('shakes') + 0.15, expr: 'shocked', action: 'tremble', dur: 0.6}, {t: E('shoes') + 0.3, expr: 'confused'}]);
    fisher.act([{t: 0, pose: 'hips', expr: 'neutral'}, {t: E('fisherman') + 0.1, expr: 'surprised'},
      {t: E('shakes'), pose: 'cross', expr: 'annoyed', action: 'shake', dur: 1.3}, {t: E('shoes'), pose: 'point', expr: 'smug', action: 'hop', dur: 0.4}]);
    const fsk = P.sack(L.rice, {scale: 0.7}); at(fsk, 0.3, 0.92, -0.08, 0, 0, -0.15); fsk.traverse((m) => { m.castShadow = false; }); farmer.group.children[0].add(fsk);
    updaters.push((t) => {
      water.material.map.offset.set(t * 0.01, t * 0.006);
      bt.position.y = -0.6 + Math.sin(t * 1.3) * 0.04; bt.rotation.z = Math.sin(t * 1.1) * 0.03;
      const walkU = clamp01((t - cut(3)) / Math.max(0.5, E('fisherman') - cut(3)));
      farmer.group.position.z = 0.6 + (-1.5 - 0.6) * smooth(walkU);
      farmer.state.walk = walkU > 0 && walkU < 1 ? 1 : 0;
      const sh = pop(t, E('shoes'), 0.3); shoe.scale.setScalar(sh);
    });
  }

  // ---------- L3: shoemaker's workshop ----------
  {
    const g = addLoc('shop');
    g.add(ground(40, 40, '#8a6a4a'));
    const rm = P.room(6.4, 4.2, 6.2, {wall: '#e2c9a0', floor: '#a87a4e', wain: '#8a5a3a'}); g.add(rm);
    const win = new THREE.Group(); at(win, -3.08, 0, -1.8, Math.PI / 2); g.add(win);
    const wb = box(1.1, 1.0, 0.1, '#f4e9cf', {}); at(wb, 0, 1.4, 0); win.add(wb);
    for (const s of [-1, 1]) { const sh = box(0.06, 1.0, 0.12, '#6b4a3a'); at(sh, s * 0.55, 1.4, 0.02); win.add(sh); }
    const sill = box(1.3, 0.08, 0.2, '#6b4a3a'); at(sill, 0, 1.36, 0.05); win.add(sill);
    for (let r = 0; r < 3; r++) {
      const shelf = box(3.2, 0.06, 0.4, '#7a5236'); at(shelf, -0.6, 0.9 + r * 0.6, -4.95); g.add(shelf);
      for (let i = 0; i < 6; i++) { const b = P.boot(['#6b3f2a', '#3b2a2c', '#9a5a3a', '#4a3a5a'][(i + r) % 4]); at(b, -2.0 + i * 0.55, 0.98 + r * 0.6, -4.9); g.add(b); }
    }
    const ss = sign(L.signShoes, 1.8, 0.5, {bg: '#e8c76a'}); at(ss, -0.6, 3.05, -5.05); g.add(ss);
    const bench = box(2.0, 0.85, 0.8, toon('#9a6a3e', {paint: {planks: 4, seed: 71}})); at(bench, 0.1, 0, -2.2); g.add(bench);
    const lst = P.boot('#9a5a3a'); at(lst, -0.3, 0.88, -2.0, 0.4); g.add(lst);
    const hm = P.hammer(); at(hm, 0.5, 0.92, -2.0, 0, 0, Math.PI / 2); g.add(hm);
    const leather = box(0.6, 0.02, 0.4, '#b0694a'); at(leather, 0.6, 0.85, -2.3, 0.3); g.add(leather);
    const shoemaker = ch('shoemaker', {}, g, 0.35, -2.95, 0);
    const farmer = ch('farmer', {seed: 45}, g, -1.6, -1.05, 0.5);
    const fsk = P.sack(L.rice, {scale: 0.7}); at(fsk, 0.3, 0.92, -0.08, 0, 0, -0.15); fsk.traverse((m) => { m.castShadow = false; }); farmer.group.children[0].add(fsk);
    const ob = P.chalkboard(1.1, 0.8, {}); at(ob, 2.0, 1.75, -5.0); g.add(ob);
    const gd = P.chalkDoodle('goat', 0.85, 0.6); gd.position.set(2.0, 1.75, -4.94); g.add(gd);
    const lamp = cyl(0.18, 0.28, 0.3, '#e8c76a', {}); at(lamp, -2.2, 3.3, -2.5); g.add(lamp);
    const cord = cyl(0.01, 0.01, 0.6, INK, {hull: 0}); at(cord, -2.2, 3.6, -2.5); g.add(cord);
    const dg = FX.dust([-0.3, 0.05, -1.0], EVt.goat + 0.5, {}); g.add(dg.obj); updaters.push(dg.update);
    const realGoat = P.goat(); realGoat.scale.setScalar(0.8); at(realGoat, 2.2, 0, -3.6, -0.5); g.add(realGoat);
    farmer.act([{t: 0, pose: 'carry', expr: 'determined'}, {t: E('shoemaker'), expr: 'happy'},
      {t: E('goat') + 0.15, expr: 'shocked', action: 'jump', dur: 0.6}, {t: E('goat') + 0.9, expr: 'furious', action: 'tremble', dur: 0.8}]);
    shoemaker.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('shoemaker') + 0.2, pose: 'hips', expr: 'smug'},
      {t: E('goat'), pose: 'point', expr: 'happy', action: 'hop', dur: 0.4}]);
    updaters.push((t) => {
      gd.scale.setScalar(pop(t, E('goat')));
      realGoat.visible = false;
      const wu = clamp01((t - cut(5)) / 1.4);
      farmer.group.position.x = -1.9 + 1.6 * smooth(wu); farmer.state.walk = wu < 1 ? 1 : 0;
    });
  }

  // ---------- L4: crossroads at sunset ----------
  {
    const g = addLoc('cross');
    g.add(ground(70, 70, '#a8b86a'));
    const r1 = box(30, 0.03, 2.2, toon('#d0ac7c', {paint: {grain: 200, seed: 18}}), {edges: false, hull: 0}); at(r1, 0, 0, 0); g.add(r1);
    const r2 = box(2.2, 0.03, 30, toon('#d0ac7c', {paint: {grain: 200, seed: 19}}), {edges: false, hull: 0}); at(r2, 1.6, 0, -8); g.add(r2);
    const sp = P.signpost([{text: L.signMarket, angle: 0.3, dir: 1}, {text: L.signDocks, angle: -0.35, dir: -1}, {text: L.signShoes, angle: 0.15, dir: 1}]);
    at(sp, 0.9, 0, -1.25); g.add(sp);
    const dial = new THREE.Group(); at(dial, -1.55, 0, 0.55); g.add(dial);
    dial.add(cyl(0.16, 0.22, 0.85, '#bdb2a0'));
    const plate = cyl(0.36, 0.36, 0.05, toon('#e6dcc6', {paint: {seed: 5}})); at(plate, 0, 0.85, 0); dial.add(plate);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const tk = box(0.02, 0.012, 0.08, INK, {edges: false, hull: 0}); at(tk, Math.cos(a) * 0.28, 0.9, Math.sin(a) * 0.28, -a); dial.add(tk); }
    const gn = new THREE.Shape(); gn.moveTo(0, 0); gn.lineTo(0.28, 0); gn.lineTo(0, 0.22); gn.lineTo(0, 0);
    const gng = new THREE.ExtrudeGeometry(gn, {depth: 0.02, bevelEnabled: false}); gng.translate(-0.12, 0, -0.01);
    const gnm = (await_ink(gng)); at(gnm, 0, 0.9, 0); dial.add(gnm);
    const farmer = ch('farmer', {seed: 46}, g, -0.35, -0.2, 0.2);
    const sk = P.sack(L.rice, {scale: 0.7}); at(sk, 0.35, 0, 0.2, -0.3); g.add(sk);
    farmer.act([{t: 0, pose: 'limp', expr: 'tired', action: 'slump', dur: 99}, {t: E('feet'), action: 'tremble', dur: 0.5},
      {t: E('nofish'), expr: 'cry', pose: 'facepalm'}]);
    g.add(P.hills('#9cb46a'));
    for (const [x, z, s] of [[-5, -6, 21], [5, -9, 22], [-9, -12, 23], [9, -4, 24], [-4, -15, 25]]) { const tr = P.tree({seed: s, leaf: '#8fa04f'}); at(tr, x, 0, z); g.add(tr); }
    for (let i = 0; i < 8; i++) { const p = cyl(0.05, 0.06, 0.9, '#7a5236'); at(p, -3.5 - i * 1.1, 0, -1.6); g.add(p); }
    const fr = box(8, 0.06, 0.05, '#7a5236'); at(fr, -7.4, 0.65, -1.6); g.add(fr);
    updaters.push((t) => {
    });
  }

  // ---------- L5: early money table + Lydian coin workshop ----------
  {
    const g = addLoc('mint');
    g.add(ground(40, 40, '#6a4a3a'));
    const rm = P.room(8.4, 4.4, 6.4, {wall: '#d8b48a', floor: '#9a7a5a', bricks: true, wain: '#7a4a32'}); g.add(rm);
    const tbl = box(2.4, 0.85, 0.8, toon('#8a5a3a', {paint: {planks: 4, seed: 81}})); at(tbl, -1.9, 0, -1.3); g.add(tbl);
    const sh = P.shells(9, 5); at(sh, -2.65, 0.86, -1.2); g.add(sh);
    ch('sellerB', {seed: 81}, g, -1.9, -2.05, 0).act([{t: 0, pose: 'hips', expr: 'neutral'}, {t: E('shells'), pose: 'presentBoth', expr: 'happy', action: 'hop', dur: 0.4},
      {t: E('salt8'), expr: 'excited'}, {t: E('metal'), expr: 'proud', action: 'hop', dur: 0.4}]);
    const saltPile = new THREE.Group(); at(saltPile, -1.9, 0.86, -1.2); g.add(saltPile);
    const sp1 = P.basket('#c9a462', 0); saltPile.add(sp1); sp1.scale.setScalar(0.7);
    const mound = ball(0.2, '#fbfaf5', {sx: 1, sy: 0.6, sz: 1}); at(mound, 0, 0.22, 0); saltPile.add(mound);
    const metal = new THREE.Group(); at(metal, -1.15, 0.86, -1.2); g.add(metal);
    for (let i = 0; i < 4; i++) { const b = box(0.32, 0.07, 0.11, i % 2 ? '#c9853a' : '#b8b8c0'); at(b, 0, i * 0.075, 0, i % 2 ? 0.3 : -0.1); metal.add(b); }
    const bn = P.banner(L.lydia, 2.4, 0.75, {poleH: 3.3, bg: '#8a3a3a', frame: '#5a2a24'}); at(bn, 1.7, 0, -2.9); g.add(bn);
    const sub = sign(L.lydiaSub, 1.2, 0.3, {bg: '#efd9a8'}); at(sub, 1.7, 2.12, -2.85); g.add(sub);
    const av = P.anvil(); at(av, 1.6, 0, -1.25); g.add(av);
    const cp = P.coinPile(7, 9); at(cp, 1.3, 0.77, -1.2); g.add(cp);
    const big = P.coin(0.24); at(big, 0.95, 1.3, -0.6, 0, Math.PI / 2); g.add(big);
    const stand = cyl(0.04, 0.14, 1.05, '#5a3a2a'); at(stand, 0.95, 0, -0.6); g.add(stand);
    const minter = ch('minter', {}, g, 2.35, -1.55, -0.2);
    const hm = P.hammer(); at(hm, 0, 0, 0.03, 0, 0, Math.PI); minter.hand(0).add(hm);
    minter.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('lydia'), pose: 'hammerUp', expr: 'determined'},
      {t: E('coins') - 0.05, pose: 'hammerDown', expr: 'shocked', action: 'hop', dur: 0.3}, {t: E('coins') + 0.35, expr: 'proud', pose: 'hips'}]);
    const furnace = box(1.0, 1.1, 0.9, toon('#8a6a5a', {paint: {bricks: true, seed: 3}})); at(furnace, 3.3, 0, -2.6); g.add(furnace);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({color: '#ffb04a'})); glow.position.set(3.3, 0.45, -2.14); g.add(glow);
    const fire = new THREE.PointLight('#ff9a3a', 4, 6, 1.5); fire.position.set(3.3, 0.8, -1.8); g.add(fire);
    const fxs = [FX.sparks([1.65, 0.8, -1.2], EVt.coins, {n: 70, speed: 2.4}), FX.smoke([3.3, 1.2, -2.3], 0, {every: 0.35, n: 8, color: '#9a8a80', size: 0.4, opacity: 0.45}),
      FX.dust([1.6, 0.05, -1.0], EVt.coins, {color: '#b89a80'}), FX.flame([3.3, 0.35, -2.1], {size: 0.45})];
    for (const f of fxs) { g.add(f.obj); updaters.push(f.update); }
    updaters.push((t) => {
      sh.scale.setScalar(1.7 * pop(t, E('shells')));
      saltPile.scale.setScalar(1.3 * pop(t, E('salt8')));
      metal.scale.setScalar(1.3 * pop(t, E('metal')));
      const tc = E('coins');
      big.scale.setScalar(pop(t, tc, 0.4));
      big.rotation.set(Math.PI / 2, 0, Math.sin(t * 1.4) * 0.2);
      fire.intensity = 4 + Math.sin(t * 9) * 0.6;
    });
  }

  // ---------- L6: museum of money ----------
  {
    const g = addLoc('museum');
    g.add(ground(40, 40, '#4a4a52'));
    const rm = P.room(7.2, 4.4, 6.2, {wall: '#e9dcc0', floor: '#c9b48a', floorPaint: {cobbles: false, bricks: true}, wain: '#3f5f8a'}); g.add(rm);
    const title = sign(L.museum, 3.0, 0.5, {bg: '#3f5f8a', fg: '#f6ead6', frame: '#2a3a56'}); at(title, 0, 3.4, -5.05); g.add(title);
    for (const [x, c] of [[-2.2, '#c75b5b'], [2.2, '#5a9a8a']]) { const fr = box(1.1, 0.8, 0.06, '#8a6a3a'); at(fr, x, 2.1, -5.05); g.add(fr); const pic = box(0.95, 0.65, 0.07, c, {edges: false}); at(pic, x, 2.17, -5.04); g.add(pic); }
    const plinth = box(1.0, 1.0, 0.8, toon('#3f5f8a', {paint: {seed: 91}})); at(plinth, -1.5, 0, -1.4); g.add(plinth);
    const note = decal(P.jiaoziTex(), 0.32, 0.58); note.position.set(-1.5, 1.38, -1.4); note.rotation.x = -0.15; g.add(note);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 0.7), new THREE.MeshToonMaterial({color: '#dff2f6', transparent: true, opacity: 0.18, depthWrite: false, gradientMap: undefined}));
    glass.position.set(-1.5, 1.38, -1.4); g.add(glass);
    const ge = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({color: INK})); ge.position.copy(glass.position); g.add(ge);
    const capb = box(0.95, 0.05, 0.75, '#2a3a56'); at(capb, -1.5, 1.75, -1.4); g.add(capb);
    const plaque = sign(L.jiaozi, 0.9, 0.32, {bg: '#efe2bf', sub: L.jiaoziSub}); at(plaque, -1.5, 0.8, -0.98); g.add(plaque);
    const counter = box(1.8, 1.0, 0.6, toon('#8a5a3a', {paint: {planks: 3, seed: 92}})); at(counter, 1.5, 0, -1.7); g.add(counter);
    const term = new THREE.Group(); at(term, 1.15, 1.0, -1.6, 0.2); g.add(term);
    term.add(box(0.22, 0.08, 0.3, '#2b2b33'));
    const head = box(0.2, 0.26, 0.05, '#2b2b33'); at(head, 0, 0.05, -0.1, 0, -0.5); term.add(head);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.18), new THREE.MeshBasicMaterial({color: '#7fb8d0'}));
    scr.position.set(0, 0.19, -0.08); scr.rotation.x = -0.5; term.add(scr);
    const ok = P.chalkDoodle('check', 0.12, 0.12); ok.position.set(0, 0.19, -0.075); ok.rotation.x = -0.5; term.add(ok);
    const paySign = sign(L.pay, 0.6, 0.22, {bg: '#e8c76a'}); at(paySign, 1.9, 1.0, -1.38); g.add(paySign);
    const cashier = ch('guide', {}, g, 1.85, -2.45, 0);
    const buyer = ch('buyer', {seed: 71}, g, 0.55, -0.85, 0.35);
    const ph = P.phone(); at(ph, 0, 0.02, 0.06); buyer.hand(1).add(ph);
    buyer.act([{t: 0, pose: 'hold', expr: 'neutral'}, {t: E('paper'), expr: 'surprised'}, {t: E('tap') - 0.5, pose: 'tap', expr: 'smug'},
      {t: E('tap') + 0.2, expr: 'laugh', action: 'jump', dur: 0.6}]);
    cashier.act([{t: 0, pose: 'idle', expr: 'neutral'}, {t: E('tap') + 0.25, pose: 'wave', expr: 'happy'}]);
    const rope = cyl(0.02, 0.02, 1.2, '#8a2a2a', {hull: 0.008}); at(rope, -1.5, 0.5, -0.5, 0, 0, Math.PI / 2); g.add(rope);
    for (const s of [-1, 1]) { const st = cyl(0.03, 0.08, 0.55, '#c9a462'); at(st, -1.5 + s * 0.62, 0, -0.5); g.add(st); }
    updaters.push((t) => {
      const tt = E('tap');
      const reach = smooth((t - (tt - 0.6)) / 0.6);
      buyer.group.position.x = 0.55 + 0.15 * reach;
      const paid = t > tt + 0.1;
      scr.material.color.set(paid ? '#5fbf6a' : '#7fb8d0');
      ok.visible = paid; ok.scale.setScalar(pop(t, tt + 0.1, 0.3));
    });
  }

  function await_ink(geo) { return new THREE.Mesh(geo, toon('#8a7a6a')); }

  return {world, chars, locGroups, update(t, camPos) { for (const u of updaters) u(t); for (const c of chars) c.update(t, camPos); }};
}
