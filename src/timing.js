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

// Word events per language: [sentenceIndex, word, occurrence]. Story: "Bumi berhenti berputar" (Indonesian + English).
export const EV = {
  bumi: {en: [0, 'earth'], id: [0, 'bumi']}, berhenti: {en: [0, 'stops'], id: [0, 'berhenti']},
  sadari: {en: [1, 'noticing'], id: [1, 'sadari']}, cepat: {en: [1, 'fast'], id: [1, 'cepat']},
  khatulistiwa: {en: [2, 'equator'], id: [2, 'khatulistiwa']}, seribu: {en: [2, 'thousand'], id: [2, 'seribu']}, kmjam: {en: [2, 'hour'], id: [2, 'jam']},
  mendadak: {en: [3, 'suddenly'], id: [3, 'mendadak']}, manusia: {en: [3, 'people'], id: [3, 'manusia']}, mobil: {en: [3, 'cars'], id: [3, 'mobil']},
  rumah: {en: [3, 'houses'], id: [3, 'rumah']}, terlempar: {en: [3, 'thrown'], id: [3, 'terlempar']},
  udara: {en: [4, 'air'], id: [4, 'udara']}, angin: {en: [4, 'winds'], id: [4, 'angin']}, badai: {en: [4, 'hurricane'], id: [4, 'badai']},
  laut: {en: [5, 'oceans'], id: [5, 'laut']}, mengalir: {en: [5, 'flow'], id: [5, 'mengalir']}, kutub: {en: [5, 'poles'], id: [5, 'kutub']},
  utara: {en: [6, 'north'], id: [6, 'utara']}, selatan: {en: [6, 'south'], id: [6, 'selatan']}, daratan: {en: [6, 'continent'], id: [6, 'daratan']},
  hari: {en: [7, 'day'], id: [7, 'hari']}, jam24: {en: [7, 'twenty'], id: [7, 'dua']},
  matahari: {en: [8, 'sun'], id: [8, 'matahari']}, siang: {en: [8, 'daylight'], id: [8, 'siang']}, lainnya: {en: [8, 'other'], id: [8, 'lainnya']}, membeku: {en: [8, 'freeze'], id: [8, 'membeku']},
  tenang: {en: [9, 'worry'], id: [9, 'tenang']}, ilmuwan: {en: [9, 'scientists'], id: [9, 'ilmuwan']}, tidak: {en: [9, 'won'], id: [9, 'tidak']},
  seram: {en: [10, 'scares'], id: [10, 'menyeramkan']}, tulis: {en: [11, 'tell'], id: [11, 'tulis']}, komentar: {en: [11, 'comments'], id: [11, 'komentar']},
};

export const LABELS = {
  en: {speed: '1,670 KM/H', equator: 'EQUATOR', north: 'NORTH', south: 'SOUTH', poles: 'TO THE POLES', beach: 'BEACH', hours: '24 HOURS',
    day6: '6 MONTHS', day6Sub: 'OF DAYLIGHT', night6: '6 MONTHS', night6Sub: 'OF DARKNESS', safe: 'EARTH: SAFE', comment: 'COMMENT!', shop: 'BAKERY'},
  id: {speed: '1.670 KM/JAM', equator: 'KHATULISTIWA', north: 'UTARA', south: 'SELATAN', poles: 'KE KUTUB', beach: 'PANTAI', hours: '24 JAM',
    day6: '6 BULAN', day6Sub: 'SIANG TERUS', night6: '6 BULAN', night6Sub: 'MALAM GELAP', safe: 'BUMI: AMAN', comment: 'KOMENTAR!', shop: 'TOKO ROTI'},
};
