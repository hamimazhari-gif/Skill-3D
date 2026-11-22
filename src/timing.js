// Sentence timing -> shot cuts and word times, per language.
import EN from './data/sentence_times_en.json';
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 10;
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

// Word events per language: [sentenceIndex, word, occurrence]
export const EV = {
  eat: {en: [0, 'eat'], id: [0, 'makan']},
  radio: {en: [0, 'radioactive'], id: [0, 'radioaktif']},
  kalium: {en: [1, 'potassium'], id: [1, 'kalium']},
  otot: {en: [1, 'muscles'], id: [1, 'otot']},
  jantung: {en: [1, 'heart'], id: [1, 'jantung']},
  k40: {en: [2, 'potassium', 1], id: [2, 'kalium', 1]},
  alami: {en: [2, 'naturally'], id: [2, 'secara']},
  radiasi: {en: [2, 'radiation'], id: [2, 'radiasi']},
  scientists: {en: [3, 'scientists'], id: [3, 'ilmuwan']},
  dose: {en: [3, 'banana'], id: [3, 'dosis']},
  easy: {en: [3, 'anyone'], id: [3, 'mudah']},
  plane: {en: [4, 'flight'], id: [4, 'pesawat']},
  hundreds: {en: [4, 'hundreds'], id: [4, 'ratusan']},
  ct: {en: [5, 'ct'], id: [5, 'ct']},
  tens: {en: [5, 'tens'], id: [5, 'puluhan']},
  relax: {en: [6, 'relax'], id: [6, 'tenang']},
  dangerous: {en: [7, 'dangerous'], id: [7, 'berbahaya']},
  millions: {en: [7, 'tens'], id: [7, 'puluhan']},
  impossible: {en: [7, 'impossible'], id: [7, 'mustahil']},
  body: {en: [8, 'body'], id: [8, 'tubuh']},
  remove: {en: [8, 'rid'], id: [8, 'membuang']},
  bonus: {en: [9, 'bonus'], id: [9, 'bonus']},
  yourself: {en: [9, 'radioactive'], id: [9, 'radioaktif']},
  because: {en: [9, 'because'], id: [9, 'karena']},
  samek: {en: [9, 'potassium'], id: [9, 'kalium']},
  follow: {en: [10, 'follow'], id: [10, 'follow']},
};

export const LABELS = {
  en: {radio: 'RADIOACTIVE!', potassium: 'POTASSIUM', k40: 'K-40', bed: 'BANANA EQUIVALENT DOSE', bedSub: '1 banana ≈ 0.1 µSv', lab: 'LAB',
    airport: 'AIRPORT', bananas: 'BANANAS', ct: 'CT SCAN', millions: 'TENS OF MILLIONS', millionsSub: 'BANANAS AT ONCE', follow: 'FOLLOW!'},
  id: {radio: 'RADIOAKTIF!', potassium: 'KALIUM', k40: 'K-40', bed: 'DOSIS SETARA PISANG', bedSub: '1 pisang ≈ 0,1 µSv', lab: 'LAB',
    airport: 'BANDARA', bananas: 'PISANG', ct: 'CT SCAN', millions: 'PULUHAN JUTA', millionsSub: 'PISANG SEKALIGUS', follow: 'FOLLOW!'},
};
