import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('web'); fs.mkdirSync('png', { recursive: true });
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html`); await pg.waitForFunction(() => window.ready);
const JOBS = process.env.ONLY ? {
  explorer: ['char', 'explorer', { seed: 7, expr: 'grin', L: 'wave', R: 'thumb', wv: 0.6, goggles: true }],
  prof: ['char', 'prof', { seed: 11, expr: 'grin', L: 'up', R: 'point', look: 0 }],
  mascotQ: ['char', 'mascot', { seed: 7, expr: 'whistle', L: 'temple', R: 'hip', swirl: 1, look: 0.4 }],
  magnifier: ['fx', 'magnifier', []], bulb: ['fx', 'bulb', []], clock: ['fx', 'clockFx', []],
} : {
  mascot: ['char', 'mascot', { seed: 7, expr: 'grin', L: 'wave', R: 'thumb', wv: 0.6, look: 0 }],
  mascot2: ['char', 'mascot', { seed: 7, expr: 'laugh', L: 'up', R: 'up', look: 0 }],
  spencer: ['char', 'spencer', { seed: 3, expr: 'shock', L: 'cheek', R: 'cheek', melt: 1 }],
  cowork: ['char', 'cowork', { seed: 8, expr: 'dazed', L: 'up', R: 'up', yolk: 1 }],
  higgy: ['char', 'higgy', { seed: 5, expr: 'grin', L: 'hip', R: 'point', look: 0.6 }],
  kid58: ['char', 'kid58', { seed: 43, expr: 'shock', L: 'cheek', R: 'cheek' }],
  gran58: ['char', 'gran58', { seed: 29, expr: 'wink', R: 'thumb' }],
  youB: ['char', 'youB', { seed: 21, expr: 'shock', L: 'up', R: 'up' }],
  youA: ['char', 'youA', { seed: 20, expr: 'laugh', L: 'wave', R: 'up', wv: 1 }],
  popcorn: ['fx', 'fxPopcorn', [2]], popcorn2: ['fx', 'fxPopcorn', [4]], ctrl: ['fx', 'fxController', [1]], dot: ['fx', 'fxDot', [1]], mol: ['fx', 'fxMolecule', [{ expr: 'grin', rub: 0.5 }]],
};
for (const [k, [kind, who, o]] of Object.entries(JOBS)) { const d = await pg.evaluate(([a, b_, c]) => window.draw(a, b_, c), [kind, who, o]); fs.writeFileSync(`png/${k}.png`, Buffer.from(d.split(',')[1], 'base64')); }
console.log('done', Object.keys(JOBS).length); await b.close(); srv.close();
