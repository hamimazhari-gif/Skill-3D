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

// Word events per language: [sentenceIndex, word, occurrence]. Story: "7 hari tanpa tidur" (Indonesian only).
export const EV = {
  tidak: {id: [0, 'tidak']}, tujuh: {id: [0, 'tujuh']},
  day1: {id: [1, 'hari']}, jam24: {id: [1, 'dua']}, mabuk: {id: [1, 'mabuk']},
  fokus: {id: [2, 'fokus']}, marah: {id: [2, 'marah']}, lambat: {id: [2, 'melambat']},
  day2: {id: [3, 'hari']}, paksa: {id: [3, 'memaksa']},
  tertidur: {id: [4, 'tertidur']}, detik: {id: [4, 'detik']}, micro: {id: [4, 'microsleep']},
  sangat: {id: [5, 'sangat']}, bahaya: {id: [5, 'berbahaya']}, kendara: {id: [5, 'berkendara']},
  day3: {id: [6, 'hari']}, kacau: {id: [6, 'kacau']},
  melihat: {id: [7, 'melihat']}, mendengar: {id: [7, 'mendengar']}, tidakada: {id: [7, 'tidak']},
  halu: {id: [8, 'halusinasi']},
  day5: {id: [9, 'hari']}, sulit: {id: [9, 'sulit']}, nyata: {id: [9, 'nyata']}, tidak2: {id: [9, 'tidak']},
  pikiran: {id: [10, 'pikiran']}, curiga: {id: [10, 'curiga']}, ingatan: {id: [10, 'ingatan']},
  tahun: {id: [11, 'tahun']}, remaja: {id: [11, 'remaja']}, randy: {id: [11, 'randy']}, sebelas: {id: [11, 'sebelas']},
  ia: {id: [12, 'ia']}, mengira: {id: [12, 'mengira']}, pemain: {id: [12, 'pemain']}, terkenal: {id: [12, 'terkenal']},
  jadi: {id: [13, 'jadi']}, jangan: {id: [13, 'jangan']},
  tidurlah: {id: [14, 'tidurlah']}, tujuh2: {id: [14, 'tujuh']}, malam: {id: [14, 'malam']},
  begadang: {id: [15, 'begadang']}, jam: {id: [15, 'jam']},
  tulis: {id: [16, 'tulis']}, komentar: {id: [16, 'komentar']},
};

export const LABELS = {
  id: {day1: 'HARI 1', day2: 'HARI 2', day34: 'HARI 3-4', day57: 'HARI 5-7', day7: 'HARI 7', year: '1964', record: '11 HARI',
    recordSub: '264 JAM TANPA TIDUR', sleep: '7-9 JAM', sleepSub: 'SETIAP MALAM', comment: 'KOMENTAR!', score: 'GOL!'},
};
