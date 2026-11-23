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

// Word events per language: [sentenceIndex, word, occurrence]
export const EV = {
  chicken: {en: [0, 'chicken'], id: [0, 'ayam']},
  rice: {en: [0, 'rice'], id: [0, 'beras']},
  market: {en: [0, 'market'], id: [0, 'pasar']},
  rice2: {en: [2, 'rice'], id: [2, 'beras']},
  fish: {en: [2, 'fish'], id: [2, 'ikan']},
  salt: {en: [2, 'salt'], id: [2, 'garam']},
  cloth: {en: [2, 'cloth'], id: [2, 'kain']},
  goats: {en: [2, 'goats'], id: [2, 'kambing']},
  wheat: {en: [2, 'wheat'], id: [2, 'gandum']},
  wantsFish: {en: [3, 'fish'], id: [3, 'ikan']},
  docks: {en: [4, 'docks'], id: [4, 'dermaga']},
  fisherman: {en: [4, 'fisherman'], id: [4, 'nelayan']},
  shakes: {en: [5, 'shakes'], id: [5, 'menggeleng']},
  shoes: {en: [6, 'shoes'], id: [7, 'sepatu']},
  shoemaker: {en: [7, 'shoemaker'], id: [8, 'tukang']},
  goat: {en: [7, 'goat'], id: [9, 'kambing']},
  half: {en: [8, 'half'], id: [10, 'setengah']},
  feet: {en: [8, 'feet'], id: [10, 'pegal']},
  nofish: {en: [8, 'fish'], id: [10, 'ikan']},
  see: {en: [9, 'see'], id: [11, 'lihat']},
  two: {en: [9, 'two'], id: [11, 'dua']},
  once: {en: [9, 'once'], id: [11, 'sama']},
  shells: {en: [10, 'shells'], id: [12, 'kerang']},
  salt8: {en: [10, 'salt'], id: [12, 'garam']},
  metal: {en: [10, 'metal'], id: [12, 'logam']},
  lydia: {en: [11, 'lydia'], id: [13, 'lydia']},
  coins: {en: [11, 'coins'], id: [13, 'koin']},
  paper: {en: [12, 'paper'], id: [14, 'kertas']},
  tap: {en: [13, 'tap'], id: [15, 'tempelkan']},
  rice10: {en: [14, 'rice'], id: [16, 'beras']},
  single: {en: [14, 'single'], id: [16, 'sentuhan']},
  us: {en: [14, 'us'], id: [16, 'kita']},
  trade: {en: [15, 'trade'], id: [17, 'tukar']},
  comment: {en: [16, 'comment'], id: [18, 'komentar']},
};

export const LABELS = {
  en: {rice: 'RICE', market: 'MARKET', docks: 'DOCKS', shoes: 'SHOES', fish: 'FISH', salt: 'SALT', cloth: 'CLOTH', wheat: 'WHEAT',
    signMarket: 'MARKET', signDocks: 'DOCKS', signShoes: 'SHOES', trade: 'TRADE WHAT?', lydia: 'LYDIA', lydiaSub: 'c. 600 BC', jiaozi: 'JIAOZI · 1024', jiaoziSub: 'SONG DYNASTY, CHINA', pay: 'PAY', museum: 'MUSEUM OF MONEY'},
  id: {rice: 'BERAS', market: 'PASAR', docks: 'DERMAGA', shoes: 'SEPATU', fish: 'IKAN', salt: 'GARAM', cloth: 'KAIN', wheat: 'GANDUM',
    signMarket: 'PASAR', signDocks: 'DERMAGA', signShoes: 'SEPATU', trade: 'TUKAR APA?', lydia: 'LYDIA', lydiaSub: '± 600 SM', jiaozi: 'JIAOZI · 1024', jiaoziSub: 'DINASTI SONG, CHINA', pay: 'BAYAR', museum: 'MUSEUM UANG'},
};
