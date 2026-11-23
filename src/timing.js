// Sentence timing -> shot cuts and word times, per language.
import EN from './data/sentence_times_en.json';
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 11;
export const TAIL = 0.7; // hold after the last word

const DATA = {en: EN, id: ID};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

export function makeTiming(lang) {
  const d = DATA[lang];
  const S = d.sentences;
  const total = d.duration + TAIL;
  const CUTS = [0];
  for (let k = 2; k <= SHOTS; k++) {
    const i = S.findIndex((s) => s.shot === k);
    CUTS.push((S[i - 1].end + S[i].start) / 2);
  }
  CUTS.push(total);
  // time of the start of a word inside sentence si (proportional by letters)
  function wt(si, word, occ = 0) {
    const s = S[si];
    const text = norm(s.text);
    const letters = text.replace(/ /g, '');
    let idx = -1, from = 0;
    const w = norm(word);
    for (let k = 0; k <= occ; k++) { idx = text.indexOf(w, from); from = idx + 1; }
    if (idx < 0) throw new Error(`word "${word}" not in sentence ${si} (${lang})`);
    const before = text.slice(0, idx).replace(/ /g, '').length;
    return s.start + (s.end - s.start) * (before / letters.length);
  }
  function shotOf(t) { for (let k = SHOTS; k >= 1; k--) if (t >= CUTS[k - 1]) return k; return 1; }
  return {S, total, CUTS, wt, shotOf, frames: Math.ceil(total * FPS)};
}

// Word events per language: [sentenceIndex, word, occurrence]. Story: "Raja yang mencetak uang / The king who printed money".
export const EV = {
  miskin: {en: [0, 'poor'], id: [0, 'miskin']},
  raja: {en: [1, 'king'], id: [1, 'raja']}, ide: {en: [1, 'idea'], id: [1, 'ide']}, jenius: {en: [1, 'brilliant'], id: [1, 'jenius']},
  gampang: {en: [2, 'easy'], id: [2, 'gampang']},
  cetak: {en: [3, 'print'], id: [3, 'cetak']}, bagikan: {en: [3, 'give'], id: [3, 'bagikan']}, haha: {en: [3, 'hahaha'], id: [3, 'hahaha']},
  kaya: {en: [4, 'rich'], id: [4, 'kaya']}, mobil: {en: [4, 'car'], id: [4, 'mobil']},
  tapi: {en: [5, 'but'], id: [5, 'tapi']}, uang5: {en: [5, 'money'], id: [5, 'uang']}, roti5: {en: [5, 'bread'], id: [5, 'roti']}, sama: {en: [5, 'same'], id: [5, 'sama']},
  maaf: {en: [6, 'sorry'], id: [6, 'maaf']}, naik1: {en: [6, 'up', 0], id: [6, 'naik', 0]}, naik2: {en: [6, 'up', 1], id: [6, 'naik', 1]}, naik3: {en: [6, 'up', 2], id: [6, 'naik', 2]},
  pagi: {en: [7, 'morning'], id: [7, 'pagi']}, kambing: {en: [7, 'goat'], id: [7, 'kambing']}, sekarang7: {en: [7, 'now'], id: [7, 'sekarang']}, huhu: {en: [7, 'huhuhu'], id: [7, 'huhuhu']},
  ehem: {en: [8, 'ahem'], id: [8, 'ehem']}, matikan: {en: [8, 'switch'], id: [8, 'matikan']},
  dongeng: {en: [9, 'fairy'], id: [9, 'dongeng']}, negara: {en: [10, 'country'], id: [10, 'negara']},
  barang: {en: [11, 'goods'], id: [11, 'barang']}, meroket: {en: [11, 'skyrocketed'], id: [11, 'meroket']},
  dua: {en: [12, 'double'], id: [12, 'dua']}, hari: {en: [12, 'day'], id: [12, 'hari']},
  triliun: {en: [13, 'trillion'], id: [13, 'triliun']},
  dipakai: {en: [14, 'used'], id: [14, 'dipakai']}, asing: {en: [14, 'foreign'], id: [14, 'asing']},
  lucunya: {en: [15, 'funny'], id: [15, 'lucunya']}, kolektor: {en: [15, 'collectors'], id: [15, 'kolektor']}, mahal: {en: [15, 'more'], id: [15, 'mahal']},
  tebak: {en: [16, 'guess'], id: [16, 'tebak']}, beli: {en: [17, 'buy'], id: [17, 'beli']}, komentar: {en: [18, 'comments'], id: [18, 'komentar']},
};

export const LABELS = {
  en: {kingdom: 'KINGDOM', money: 'MONEY', bakery: 'BAKERY', bread: 'BREAD', rice: 'RICE', price: 'PRICE', prices: ['10', '20', '40', '80'],
    noteVal: '100', note: '100 TRILLION', foreignVal: '$5', country: 'REAL COUNTRY', chart: 'PRICES', tagA: '100', tagB: '200', x2: 'x2', day: '1 DAY',
    collectorShop: 'COLLECTOR', forSale: 'SOLD $$$', comment: 'COMMENT!'},
  id: {kingdom: 'KERAJAAN', money: 'UANG', bakery: 'TOKO ROTI', bread: 'ROTI', rice: 'BERAS', price: 'HARGA', prices: ['10', '20', '40', '80'],
    noteVal: '100', note: '100 TRILIUN', foreignVal: '$5', country: 'NEGARA NYATA', chart: 'HARGA', tagA: '100', tagB: '200', x2: 'x2', day: '1 HARI',
    collectorShop: 'KOLEKTOR', forSale: 'LAKU $$$', comment: 'KOMENTAR!'},
};
