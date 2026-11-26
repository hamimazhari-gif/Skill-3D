// Sentence timing -> shot cuts and word times, per language.
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 13;
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

// Word events: [sentenceIndex, word, occurrence]. Story: "Bibit sawit palsu" (Indonesian).
export const EV = {
  menunggu: {id: [0, 'menunggu']},
  merawat: {id: [1, 'merawat']},
  menyiangi: {id: [1, 'menyiangi']},
  memupuk: {id: [1, 'memupuk']},
  berharap: {id: [1, 'berharap']},
  panen: {id: [2, 'panen']},
  tandan: {id: [3, 'tandannya']},
  merah: {id: [3, 'merah']},
  pengepul: {id: [4, 'pengepul']},
  harga: {id: [4, 'harganya']},
  tetangga: {id: [4, 'tetangganya']},
  kenapa: {id: [5, 'kenapa']},
  murah: {id: [5, 'murah']},
  kakek: {id: [6, 'kakek']},
  mengambil: {id: [6, 'mengambil']},
  membelah: {id: [6, 'membelahnya']},
  parang: {id: [6, 'parang']},
  lihat: {id: [7, 'lihat']},
  cangkang: {id: [7, 'cangkangnya']},
  tebal: {id: [7, 'tebal']},
  daging: {id: [7, 'dagingnya']},
  dura: {id: [8, 'dura']},
  sedikit: {id: [8, 'sedikit']},
  terdiam: {id: [9, 'terdiam']},
  sebelah: {id: [10, 'sebelah']},
  tipis2: {id: [10, 'tipis']},
  tebal2: {id: [10, 'tebal']},
  tenera: {id: [11, 'tenera']},
  persilangan: {id: [11, 'persilangan']},
  banyak: {id: [11, 'banyak']},
  beli: {id: [12, 'beli']},
  menunduk: {id: [13, 'menunduk']},
  pinggir: {id: [13, 'pinggir']},
  murah2: {id: [13, 'murah']},
  menghela: {id: [14, 'menghela']},
  palsu: {id: [15, 'palsu']},
  dibedakan: {id: [15, 'dibedakan']},
  kecil: {id: [15, 'kecil']},
  bertahun: {id: [15, 'bertahun']},
  malam: {id: [16, 'malam']},
  pelajaran: {id: [16, 'pelajaran']},
  pertama: {id: [17, 'pertama']},
  penangkar: {id: [17, 'penangkar']},
  izin: {id: [17, 'izin']},
  kedua: {id: [18, 'kedua']},
  sertifikat: {id: [18, 'sertifikat']},
  label: {id: [18, 'label']},
  ketiga: {id: [19, 'ketiga']},
  tergiur: {id: [19, 'tergiur']},
  unggul: {id: [19, 'unggul']},
  mahal: {id: [19, 'mahal']},
  keempat: {id: [20, 'keempat']},
  kokoh: {id: [20, 'kokoh']},
  segar: {id: [20, 'segar']},
  singkirkan: {id: [20, 'singkirkan']},
  kerdil: {id: [20, 'kerdil']},
  kelima: {id: [21, 'kelima']},
  belah: {id: [21, 'belah']},
  cangkang5: {id: [21, 'cangkang']},
  salah: {id: [21, 'salah']},
  menebang: {id: [22, 'menebang']},
  memulai: {id: [22, 'memulai']},
  hilang: {id: [23, 'hilang']},
  keputusan: {id: [23, 'keputusan']},
  haripertama: {id: [23, 'pertama']},
  kesalahan: {id: [24, 'kesalahan']},
  panen2: {id: [24, 'panen']},
  memilih: {id: [24, 'memilih']},
};

export const LABELS = {
  id: {kebun: 'KEBUN JOKO', pengepul: 'PENGEPUL TBS', harga: 'HARGA', joko: 'JOKO', tetangga: 'TETANGGA', dura: 'DURA', tenera: 'TENERA',
    murahSign: 'BIBIT SAWIT MURAH!!', pelajaran: 'PELAJARAN BIBIT', penangkar: 'PENANGKAR BENIH RESMI', berizin: 'BERIZIN',
    sertifikat: 'SERTIFIKAT BENIH', sertifikatSub: 'TENERA (D x P)', label: 'LABEL BENIH', unggul: 'UNGGUL', murah: 'MURAH', afkir: 'AFKIR',
    years: ['TAHUN 1', 'TAHUN 2', 'TAHUN 3', 'TAHUN 4'],
    lessons: ['1. PENANGKAR RESMI', '2. SERTIFIKAT / LABEL', '3. JANGAN CARI MURAH', '4. BATANG KOKOH, DAUN SEGAR', '5. BELAH BUAHNYA']},
};
