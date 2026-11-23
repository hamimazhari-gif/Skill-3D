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

// Word events per language: [sentenceIndex, word, occurrence]. Story: "7 hari tanpa tidur" (Indonesian + English).
export const EV = {
  tidak: {en: [0, 'don'], id: [0, 'tidak']}, tujuh: {en: [0, 'seven'], id: [0, 'tujuh']},
  day1: {en: [1, 'day'], id: [1, 'hari']}, jam24: {en: [1, 'twenty'], id: [1, 'dua']}, mabuk: {en: [1, 'drunk'], id: [1, 'mabuk']},
  fokus: {en: [2, 'focus'], id: [2, 'fokus']}, marah: {en: [2, 'irritated'], id: [2, 'marah']}, lambat: {en: [2, 'slow'], id: [2, 'melambat']},
  day2: {en: [3, 'day'], id: [3, 'hari']}, paksa: {en: [3, 'forcing'], id: [3, 'memaksa']},
  tertidur: {en: [4, 'doze'], id: [4, 'tertidur']}, detik: {en: [4, 'seconds'], id: [4, 'detik']}, micro: {en: [4, 'noticing'], id: [4, 'microsleep']},
  sangat: {en: [5, 'microsleep'], id: [5, 'sangat']}, bahaya: {en: [5, 'extremely'], id: [5, 'berbahaya']}, kendara: {en: [5, 'wheel'], id: [5, 'berkendara']},
  day3: {en: [6, 'days'], id: [6, 'hari']}, kacau: {en: [6, 'glitch'], id: [6, 'kacau']},
  melihat: {en: [7, 'you'], id: [7, 'melihat']}, mendengar: {en: [7, 'things'], id: [7, 'mendengar']}, tidakada: {en: [7, 'really'], id: [7, 'tidak']},
  halu: {en: [8, 'hallucinations'], id: [8, 'halusinasi']},
  day5: {en: [9, 'days'], id: [9, 'hari']}, sulit: {en: [9, 'harder'], id: [9, 'sulit']}, nyata: {en: [9, 'real'], id: [9, 'nyata']}, tidak2: {en: [9, 'not'], id: [9, 'tidak']},
  pikiran: {en: [10, 'thoughts'], id: [10, 'pikiran']}, curiga: {en: [10, 'paranoid'], id: [10, 'curiga']}, ingatan: {en: [10, 'memory'], id: [10, 'ingatan']},
  tahun: {en: [11, 'nineteen'], id: [11, 'tahun']}, remaja: {en: [11, 'teenager'], id: [11, 'remaja']}, randy: {en: [11, 'randy'], id: [11, 'randy']}, sebelas: {en: [11, 'eleven'], id: [11, 'sebelas']},
  ia: {en: [12, 'he'], id: [12, 'ia']}, mengira: {en: [12, 'believed'], id: [12, 'mengira']}, pemain: {en: [12, 'famous'], id: [12, 'pemain']}, terkenal: {en: [12, 'player'], id: [12, 'terkenal']},
  jadi: {en: [13, 'so'], id: [13, 'jadi']}, jangan: {en: [13, 'never'], id: [13, 'jangan']},
  tidurlah: {en: [14, 'get'], id: [14, 'tidurlah']}, tujuh2: {en: [14, 'seven'], id: [14, 'tujuh']}, malam: {en: [14, 'night'], id: [14, 'malam']},
  begadang: {en: [15, 'longest'], id: [15, 'begadang']}, jam: {en: [15, 'awake'], id: [15, 'jam']},
  tulis: {en: [16, 'tell'], id: [16, 'tulis']}, komentar: {en: [16, 'comments'], id: [16, 'komentar']},
};

export const LABELS = {
  en: {day1: 'DAY 1', day2: 'DAY 2', day34: 'DAYS 3-4', day57: 'DAYS 5-7', day7: 'DAY 7', year: '1964', record: '11 DAYS',
    recordSub: '264 HOURS AWAKE', sleep: '7-9 HOURS', sleepSub: 'EVERY NIGHT', comment: 'COMMENT!', score: 'TOUCHDOWN!'},
  id: {day1: 'HARI 1', day2: 'HARI 2', day34: 'HARI 3-4', day57: 'HARI 5-7', day7: 'HARI 7', year: '1964', record: '11 HARI',
    recordSub: '264 JAM TANPA TIDUR', sleep: '7-9 JAM', sleepSub: 'SETIAP MALAM', comment: 'KOMENTAR!', score: 'GOL!'},
};
