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

// Word events per language: [sentenceIndex, word, occurrence]. Story: "Hidup 500 tahun / Living to 500".
export const EV = {
  bayang: {en: [0, 'imagine'], id: [0, 'bayangkan']}, lima: {en: [0, 'five'], id: [0, 'lima']},
  enak: {en: [1, 'amazing'], id: [1, 'enak']}, tunggu: {en: [2, 'wait'], id: [2, 'tunggu']},
  dua: {en: [3, 'two'], id: [3, 'dua']}, muda: {en: [3, 'young'], id: [3, 'muda']},
  santai: {en: [4, 'relax'], id: [4, 'santai']}, setengah: {en: [4, 'halfway'], id: [4, 'setengah']},
  kuliah: {en: [5, 'college'], id: [5, 'kuliah']}, ilmu: {en: [5, 'learn'], id: [5, 'ilmunya']},
  skripsi: {en: [6, 'thesis'], id: [6, 'skripsinya']}, lemari: {en: [6, 'wardrobe'], id: [6, 'lemari']},
  rumah: {en: [7, 'house'], id: [7, 'rumah']}, brosur: {en: [7, 'brochure'], id: [7, 'brosurnya']},
  sales: {en: [8, 'only'], id: [8, 'cicilan']}, cicilan: {en: [8, 'three'], id: [8, 'tiga']}, dp: {en: [8, 'low'], id: [8, 'dp']},
  reuni: {en: [9, 'reunion'], id: [9, 'reuni']}, terbesar: {en: [9, 'biggest'], id: [9, 'terbesar']},
  teman: {en: [10, 'classmates'], id: [10, 'teman']}, anak: {en: [10, 'kids'], id: [10, 'anak']}, cucu: {en: [10, 'grandkids'], id: [10, 'cucu']},
  cicit: {en: [10, 'great'], id: [10, 'cicit']}, generasi: {en: [10, 'twelve'], id: [10, 'dua belas']},
  pensiun: {en: [11, 'retirement'], id: [11, 'pensiun']}, empat: {en: [11, 'four'], id: [11, 'empat']},
  kakek: {en: [12, 'grandpa'], id: [12, 'kakek']}, telat: {en: [12, 'late'], id: [12, 'telat']},
  maaf: {en: [13, 'sorry'], id: [13, 'maaf']}, lutut: {en: [13, 'knees'], id: [13, 'lututku']},
  tapi: {en: [14, 'but'], id: [14, 'tapi']}, serius: {en: [14, 'serious'], id: [14, 'serius']},
  semua: {en: [15, 'everyone'], id: [15, 'semua']}, penuh: {en: [15, 'overcrowded'], id: [15, 'kepenuhan']},
  makanan: {en: [16, 'food'], id: [16, 'makanan']}, air: {en: [16, 'water'], id: [16, 'air']}, tinggal: {en: [16, 'housing'], id: [16, 'tinggal']}, rebutan: {en: [16, 'fight'], id: [16, 'rebutan']},
  sebal: {en: [17, 'annoying'], id: [17, 'menyebalkan']}, kakek2: {en: [17, 'grandpa'], id: [17, 'kakek']}, gorengan: {en: [17, 'snack'], id: [17, 'gorengan']}, lalu: {en: [17, 'ago'], id: [17, 'lalu']},
  jadi: {en: [18, 'so'], id: [18, 'jadi']}, pas: {en: [18, 'right'], id: [18, 'pas']},
  penting: {en: [19, 'matters'], id: [19, 'penting']}, manfaat: {en: [19, 'meaningful'], id: [19, 'bermanfaat']},
  ngapain: {en: [20, 'what'], id: [20, 'ngapain']}, komentar: {en: [20, 'comments'], id: [20, 'komentar']},
};

export const LABELS = {
  en: {big500: '500 YEARS', party: 'HAPPY 250th!', cake: '250', life: 'LIFE', campus: 'SEMESTER 80', thesis: 'THESIS', forSale: 'FOR SALE',
    loan: '300-YEAR LOAN', loanSub: 'LOW DOWN PAYMENT!', reunion: 'SCHOOL REUNION', gens: '12 GENERATIONS', retire: 'RETIRE AT 400', clockIn: 'CLOCK IN',
    late: 'LATE!', food: 'FOOD', water: 'WATER', full: 'FULL', snacks: 'SNACKS', price: '$2', oldPrice: '1¢', oldSub: '400 YEARS AGO', comment: 'COMMENT!'},
  id: {big500: '500 TAHUN', party: 'ULTAH KE-250!', cake: '250', life: 'HIDUP', campus: 'SEMESTER 80', thesis: 'SKRIPSI', forSale: 'DIJUAL',
    loan: 'CICILAN 300 TAHUN', loanSub: 'DP RINGAN!', reunion: 'REUNI SD', gens: '12 GENERASI', retire: 'PENSIUN: 400', clockIn: 'ABSEN',
    late: 'TELAT!', food: 'MAKANAN', water: 'AIR', full: 'PENUH', snacks: 'GORENGAN', price: 'Rp2.000', oldPrice: 'Rp1', oldSub: '400 TAHUN LALU', comment: 'KOMENTAR!'},
};
