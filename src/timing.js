// Sentence timing -> shot cuts and word times, per language.
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 15;
export const TAIL = 0.7; // hold after the last word

const DATA = {id: ID};

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

// Word events: [sentenceIndex, word, occurrence]. Story: "Ganoderma, jamur pembunuh sawit" (Indonesian).
export const EV = {
  malam: {id: [0, 'malam']},
  keras: {id: [0, 'keras']},
  hasan: {id: [0, 'hasan']},
  tumbang: {id: [1, 'tumbang']},
  angin: {id: [2, 'angin']},
  hujan: {id: [2, 'hujan']},
  pagi: {id: [3, 'pagi']},
  pangkal: {id: [3, 'pangkal']},
  busuk: {id: [3, 'busuk']},
  rapuh: {id: [3, 'rapuh']},
  biasa: {id: [4, 'biasa']},
  bulan: {id: [5, 'bulan']},
  sebelah: {id: [5, 'sebelahnya']},
  sakit: {id: [5, 'sakit']},
  berikutnya: {id: [5, 'berikutnya']},
  pucat: {id: [6, 'pucat']},
  pelepah: {id: [7, 'pelepah']},
  menggantung: {id: [7, 'menggantung']},
  pucuk: {id: [8, 'pucuk']},
  tegak: {id: [8, 'tegak']},
  tombak: {id: [8, 'tombak']},
  kakek: {id: [9, 'kakek']},
  berjongkok: {id: [9, 'berjongkok']},
  menunjuk: {id: [9, 'menunjuk']},
  cokelat: {id: [9, 'cokelat']},
  kipas: {id: [9, 'kipas']},
  ganoderma: {id: [10, 'ganoderma']},
  pembunuh: {id: [10, 'pembunuh']},
  akar: {id: [11, 'akar']},
  menggerogoti: {id: [11, 'menggerogoti']},
  menular: {id: [11, 'menular']},
  bersentuhan: {id: [11, 'bersentuhan']},
  bertanya: {id: [12, 'bertanya']},
  datangnya: {id: [12, 'datangnya']},
  tumpukan: {id: [13, 'tumpukan']},
  tunggul: {id: [13, 'tunggul']},
  sudut: {id: [13, 'sudut']},
  membusuk: {id: [13, 'membusuk']},
  ditanam: {id: [13, 'ditanam']},
  sarang: {id: [14, 'sarangnya']},
  melawan: {id: [15, 'melawan']},
  pertama: {id: [16, 'pertama']},
  gejala: {id: [16, 'gejalanya']},
  membuka: {id: [16, 'membuka']},
  pucat2: {id: [16, 'pucat']},
  jamur1: {id: [16, 'jamur']},
  kedua: {id: [17, 'kedua']},
  buang: {id: [17, 'buang']},
  spora: {id: [17, 'sporanya']},
  ketiga: {id: [18, 'ketiga']},
  parit: {id: [18, 'parit']},
  memutus: {id: [18, 'memutus']},
  sehat: {id: [18, 'sehat']},
  keempat: {id: [19, 'keempat']},
  dibongkar: {id: [19, 'dibongkar']},
  tinggalkan: {id: [19, 'tinggalkan']},
  kelima: {id: [20, 'kelima']},
  bersihkan: {id: [20, 'bersihkan']},
  biarkan: {id: [20, 'biarkan']},
  kehilangan: {id: [21, 'kehilangan']},
  selamat: {id: [21, 'selamat']},
  musuh: {id: [22, 'musuh']},
  terlihat: {id: [22, 'terlihat']},
  terlambat: {id: [22, 'terlambat']},
  bagikan: {id: [23, 'bagikan']},
};

export const LABELS = {
  id: {gano: 'GANODERMA', tombak: 'DAUN TOMBAK', pucat: 'DAUN PUCAT', jamur: 'JAMUR', sarang: 'SARANG JAMUR', karung: 'JAMUR', parit: 'PARIT ISOLASI'},
};
