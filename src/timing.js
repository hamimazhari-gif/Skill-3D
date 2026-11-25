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

// Word events: [sentenceIndex, word, occurrence]. Story: "Pak Darto dan bonggol pisang" (Indonesian).
export const EV = {
  darto: {id: [0, 'darto']},
  menjual: {id: [0, 'menjual']},
  kerdil: {id: [1, 'kerdil']},
  menguning: {id: [2, 'menguning']},
  uang: {id: [3, 'uangnya']},
  habis: {id: [3, 'habis']},
  pupuk: {id: [3, 'pupuk']},
  tapi: {id: [3, 'tapi']},
  kecewa: {id: [3, 'mengecewakan']},
  sore: {id: [4, 'sore']},
  duduk: {id: [4, 'duduk']},
  menatap: {id: [4, 'menatap']},
  tumpukan: {id: [4, 'tumpukan']},
  ditebang: {id: [4, 'ditebang']},
  kakek: {id: [5, 'kakek']},
  lewat: {id: [5, 'lewat']},
  empat: {id: [6, 'empat']},
  tahun40: {id: [6, 'tahun']},
  tertawa: {id: [7, 'tertawa']},
  mahal: {id: [8, 'mahal']},
  padahal: {id: [8, 'padahal']},
  emas: {id: [8, 'emasnya']},
  situ: {id: [8, 'situ']},
  menunjuk: {id: [9, 'menunjuk']},
  bonggol: {id: [9, 'bonggol']},
  malam: {id: [10, 'malam']},
  resep: {id: [10, 'resep']},
  pertama: {id: [11, 'pertama']},
  satukilo: {id: [11, 'satu']},
  cacah: {id: [11, 'cacah']},
  kedua: {id: [12, 'kedua']},
  gula: {id: [12, 'gula']},
  lima: {id: [12, 'lima']},
  air: {id: [12, 'air']},
  ketiga: {id: [13, 'ketiga']},
  jeriken: {id: [13, 'jeriken']},
  tutup: {id: [13, 'tutup']},
  keempat: {id: [14, 'keempat']},
  setiap: {id: [14, 'setiap']},
  buka: {id: [14, 'buka']},
  gas: {id: [14, 'gas']},
  tunggu: {id: [15, 'tunggu']},
  duaminggu: {id: [15, 'dua']},
  bau: {id: [16, 'baunya']},
  tape: {id: [16, 'tape']},
  jadi: {id: [16, 'jadi']},
  kemudian: {id: [17, 'kemudian']},
  membuka: {id: [17, 'membuka']},
  asam: {id: [18, 'asam']},
  tape2: {id: [18, 'tape']},
  mencampur: {id: [19, 'mencampur']},
  sepuluh: {id: [19, 'sepuluh']},
  menyiram: {id: [19, 'menyiramkannya']},
  pangkal: {id: [19, 'pangkal']},
  minggu: {id: [20, 'minggu']},
  kuning: {id: [20, 'kuning']},
  menghijau: {id: [20, 'menghijau']},
  akar: {id: [21, 'akar']},
  kuat: {id: [21, 'kuat']},
  tidakjadi: {id: [22, 'tidak']},
  menjual2: {id: [22, 'menjual']},
  sejak: {id: [23, 'sejak']},
  membuang: {id: [23, 'membuang']},
  bonggol2: {id: [23, 'bonggol']},
  sampah: {id: [24, 'sampah']},
  penyelamat: {id: [24, 'penyelamat']},
  simpan: {id: [25, 'simpan']},
  bagikan: {id: [25, 'bagikan']},
  teman: {id: [25, 'teman']},
};

export const LABELS = {
  id: {sale: 'DIJUAL', saleSub: 'KEBUN INI', pupuk: 'PUPUK', resep: 'RESEP LAMA', kg1: '1 KG', kg14: '1/4 KG', liter5: '5 LITER',
    airBeras: 'AIR CUCIAN BERAS', gulaMerah: 'GULA MERAH', day: 'HARI KE', ratio: '1 : 10', mol: 'MOL', save: 'SIMPAN & BAGIKAN',
    steps: ['1. BONGGOL PISANG 1 KG, CACAH', '2. GULA MERAH 1/4 KG + AIR BERAS 5 L', '3. MASUK JERIKEN, TUTUP RAPAT', '4. BUKA TIAP HARI, BUANG GAS'],
    weeks2: '2 MINGGU'},
};
