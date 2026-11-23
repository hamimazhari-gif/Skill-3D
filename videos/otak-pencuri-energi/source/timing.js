// Sentence timing -> shot cuts and word times, per language.
import EN from './data/sentence_times_en.json';
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 9;
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

// Word events per language: [sentenceIndex, word, occurrence]. Story: "Otak, pencuri energi" (Indonesian + English).
export const EV = {
  organ: {en: [0, 'organ'], id: [0, 'organ']}, mencuri: {en: [0, 'stealing'], id: [0, 'mencuri']}, detik: {en: [0, 'second'], id: [0, 'detik']},
  dua: {en: [1, 'two'], id: [1, 'dua']}, puluh: {en: [1, 'twenty'], id: [1, 'puluh']}, energi: {en: [1, 'energy'], id: [1, 'energi']},
  otakmu: {en: [2, 'brain'], id: [2, 'otakmu']},
  listrik: {en: [3, 'electricity'], id: [3, 'listrik']}, watt: {en: [3, 'watts'], id: [3, 'watt']},
  lampu: {en: [4, 'bulb'], id: [4, 'lampu']},
  sepanjang: {en: [5, 'day'], id: [5, 'sepanjang']}, mati: {en: [5, 'switching'], id: [5, 'mati']},
  serakus: {en: [6, 'hungry'], id: [6, 'serakus']},
  miliar: {en: [7, 'billion'], id: [7, 'miliar']}, sinyal: {en: [7, 'signals'], id: [7, 'sinyal']}, tidur: {en: [7, 'sleep'], id: [7, 'tidur']},
  twist: {en: [8, 'twist'], id: [8, 'twist']},
  belajar: {en: [9, 'studying'], id: [9, 'belajar']}, kurus: {en: [9, 'weight'], id: [9, 'kurus']},
  sedikit: {en: [10, 'tiny'], id: [10, 'sedikit']}, keras: {en: [10, 'concentrate'], id: [10, 'keras']},
  sebagian: {en: [11, 'most'], id: [11, 'sebagian']}, hidup: {en: [11, 'alive'], id: [11, 'hidup']},
  anak: {en: [12, 'children'], id: [12, 'anak']}, lima: {en: [12, 'five'], id: [12, 'lima']}, separuh: {en: [12, 'half'], id: [12, 'separuh']}, tumbuh: {en: [12, 'growing'], id: [12, 'tumbuh']},
  rawat: {en: [13, 'care'], id: [13, 'rawat']},
  makan: {en: [14, 'eat'], id: [14, 'makan']}, minum: {en: [14, 'drink'], id: [14, 'minum']}, tidur2: {en: [14, 'sleep'], id: [14, 'tidur']},
  organ2: {en: [15, 'organ'], id: [15, 'organ']}, hebat: {en: [15, 'amazing'], id: [15, 'hebat']},
  tulis: {en: [16, 'tell'], id: [16, 'tulis']}, komentar: {en: [16, 'comments'], id: [16, 'komentar']},
};

export const LABELS = {
  en: {energy: 'ENERGY', weight: '2%', weightSub: 'BODY WEIGHT', energy20: '20%', energySub: 'BODY ENERGY', watt: '20 WATTS', neurons: '86 BILLION', neuronsSub: 'NERVE CELLS',
    kg: 'KG', twist: 'PLOT TWIST!', alive: 'STAY ALIVE', think: '+THINK', half: 'OVER 50%', halfSub: 'RESTING ENERGY', age: 'AGE 5', comment: 'COMMENT!', rest: 'BODY'},
  id: {energy: 'ENERGI', weight: '2%', weightSub: 'BERAT BADAN', energy20: '20%', energySub: 'ENERGI TUBUH', watt: '20 WATT', neurons: '86 MILIAR', neuronsSub: 'SEL SARAF',
    kg: 'KG', twist: 'PLOT TWIST!', alive: 'TETAP HIDUP', think: '+MIKIR', half: 'LEBIH 50%', halfSub: 'ENERGI ISTIRAHAT', age: 'USIA 5', comment: 'KOMENTAR!', rest: 'TUBUH'},
};
