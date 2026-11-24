// Sentence timing -> shot cuts and word times, per language.
import EN from './data/sentence_times_en.json';
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 12;
export const TAIL = 0.7; // hold after the last word

const DATA = {en: EN, id: ID};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Map a fraction of a sentence's letters to a time, spreading the letters over its voiced segments only.
export function voicedAt(s, f) {
  const segs = s.voiced && s.voiced.length ? s.voiced : [[s.start, s.end]];
  const V = segs.reduce((a, [x, y]) => a + y - x, 0);
  let r = f * V;
  for (const [x, y] of segs) { if (r < y - x - 1e-6) return x + r; r -= y - x; }
  return segs[segs.length - 1][1];
}

// Time of the letter at offset `before` (letters only) inside sentence s. When the sentence has as many
// punctuation-separated phrases as voiced segments, each phrase is placed in its own segment; otherwise the
// letters are spread over the voiced parts.
export function letterTime(s, before) {
  const toks = s.text.split(/\s+/).filter(Boolean);
  const phrases = []; let cur = 0;
  toks.forEach((tk, i) => { cur += norm(tk).replace(/ /g, '').length; if (/[,.!?…:;]["”']?$/.test(tk) || i === toks.length - 1) { phrases.push(cur); cur = 0; } });
  const total = phrases.reduce((a, b) => a + b, 0) || 1;
  const segs = s.voiced && s.voiced.length ? s.voiced : [[s.start, s.end]];
  if (phrases.length === segs.length) {
    let acc = 0;
    for (let i = 0; i < phrases.length; i++) {
      if (before < acc + phrases[i] || i === phrases.length - 1) return segs[i][0] + (segs[i][1] - segs[i][0]) * Math.min(1, (before - acc) / phrases[i]);
      acc += phrases[i];
    }
  }
  return voicedAt(s, before / total);
}

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
  // time of the start of a word inside sentence si (proportional by letters over the voiced parts, pauses skipped)
  function wt(si, word, occ = 0) {
    const s = S[si];
    const text = norm(s.text);
    const letters = text.replace(/ /g, '');
    let idx = -1, from = 0;
    const w = norm(word);
    for (let k = 0; k <= occ; k++) { idx = text.indexOf(w, from); from = idx + 1; }
    if (idx < 0) throw new Error(`word "${word}" not in sentence ${si} (${lang})`);
    const before = text.slice(0, idx).replace(/ /g, '').length;
    return letterTime(s, before);
  }
  function shotOf(t) { for (let k = SHOTS; k >= 1; k--) if (t >= CUTS[k - 1]) return k; return 1; }
  return {S, total, CUTS, wt, shotOf, frames: Math.ceil(total * FPS)};
}

// Word events per language: [sentenceIndex, word, occurrence]. Story: "Uang seratus ribu / a banknote's day".
export const EV = {
  halo: {en: [0, 'hi'], id: [0, 'halo']}, seratus: {en: [0, 'hundred'], id: [0, 'seratus']},
  hari: {en: [1, 'today'], id: [1, 'hari']}, perjalanan: {en: [1, 'journey'], id: [1, 'perjalananku']}, satuhari: {en: [1, 'single'], id: [1, 'satu']},
  jam6: {en: [2, 'six'], id: [2, 'enam']}, atm: {en: [2, 'atm'], id: [2, 'atm']},
  pemilik: {en: [3, 'owner'], id: [3, 'pemilikku']}, cium: {en: [3, 'kissed'], id: [3, 'menciumku']},
  gajian: {en: [4, 'payday'], id: [4, 'gajian']}, sayang: {en: [4, 'love'], id: [4, 'sayang']},
  tapi: {en: [5, 'but'], id: [5, 'tapi']}, sejam: {en: [5, 'hour'], id: [5, 'jam']},
  jam7: {en: [6, 'seven'], id: [6, 'tujuh']}, pecah: {en: [6, 'broken'], id: [6, 'dipecah']}, kopi: {en: [6, 'coffee'], id: [6, 'kopi']},
  duaribu: {en: [7, 'two'], id: [7, 'dua']}, parkir: {en: [7, 'parking'], id: [7, 'parkir']}, muncul: {en: [7, 'appeared'], id: [7, 'tiba']}, entah: {en: [7, 'nowhere'], id: [7, 'entah']},
  tadi: {en: [8, 'definitely'], id: [8, 'padahal']},
  prit: {en: [9, 'okay'], id: [9, 'prit']}, terus: {en: [9, 'keep'], id: [9, 'terus']}, bos: {en: [9, 'boss'], id: [9, 'bos']},
  siang: {en: [10, 'noon'], id: [10, 'siang']}, aplikasi: {en: [10, 'app'], id: [10, 'aplikasi']},
  flash: {en: [11, 'flash'], id: [11, 'flash']},
  jangan: {en: [12, 'no'], id: [12, 'jangan']}, kelima: {en: [12, 'fifth'], id: [12, 'kelima']}, sepatu: {en: [12, 'shoes'], id: [12, 'sepatu']},
  checkout: {en: [13, 'checked'], id: [13, 'checkout']},
  sebagian: {en: [14, 'rest'], id: [14, 'sebagian']}, beruntung: {en: [14, 'luckier'], id: [14, 'beruntung']},
  sayur: {en: [15, 'vegetable'], id: [15, 'sayur']}, angkot: {en: [15, 'minibus'], id: [15, 'angkot']}, warung: {en: [15, 'food'], id: [15, 'warung']},
  nenek: {en: [15, 'grandmother'], id: [15, 'nenek']}, cucu: {en: [15, 'grandchild'], id: [15, 'cucunya']}, jajan: {en: [15, 'pocket'], id: [15, 'jajan']},
  anak: {en: [16, 'kid'], id: [16, 'anak']}, celengan: {en: [16, 'chicken'], id: [16, 'celengan']},
  istirahat: {en: [17, 'rest'], id: [17, 'istirahat']}, tenang: {en: [17, 'peace'], id: [17, 'tenang']},
  malam: {en: [18, 'night'], id: [18, 'malam']}, dompet: {en: [18, 'wallet'], id: [18, 'dompet']},
  lho: {en: [19, 'wait'], id: [19, 'lho']}, kemana: {en: [19, 'where'], id: [19, 'mana']}, beli: {en: [19, 'buy'], id: [19, 'beli']},
  itulah: {en: [20, 'that'], id: [20, 'itulah']},
  catat: {en: [21, 'track'], id: [21, 'mencatat']}, hilang: {en: [21, 'disappear'], id: [21, 'menghilang']}, sadar: {en: [21, 'noticing'], id: [21, 'sadari']},
  tanya: {en: [22, 'what'], id: [22, 'uang']}, apa: {en: [22, 'go'], id: [22, 'apa']},
  komentar: {en: [23, 'comments'], id: [23, 'komentar']},
};

export const LABELS = {
  en: {day: 'ONE-DAY JOURNEY', payday: 'PAYDAY!', cafe: 'TRENDY COFFEE', price: 'Rp28,000', menu: 'MENU', flash: 'FLASH SALE!', flashSub: 'ENDS IN 00:59',
    checkout: 'CHECKOUT', shoe: '5TH PAIR', sayur: 'VEGGIES', warung: 'FOOD STALL', angkot: 'MINIBUS', jajan: 'POCKET MONEY', log: 'MONEY LOG',
    logLines: ['Coffee  28,000', 'Parking  2,000', 'Shoes  ???', '...'], question: 'WHERE DOES IT GO?', comment: 'COMMENT!', parking: 'PARKING', empty: 'Rp0', bank: 'BANK'},
  id: {day: 'PERJALANAN 1 HARI', payday: 'GAJIAN!', cafe: 'KOPI KEKINIAN', price: 'Rp28.000', menu: 'MENU', flash: 'FLASH SALE!', flashSub: 'SISA 00:59',
    checkout: 'CHECKOUT', shoe: 'SEPATU KE-5', sayur: 'SAYUR', warung: 'WARUNG', angkot: 'ANGKOT', jajan: 'UANG JAJAN', log: 'CATATAN UANG',
    logLines: ['Kopi  28.000', 'Parkir  2.000', 'Sepatu  ???', '...'], question: 'HABIS BUAT APA?', comment: 'KOMENTAR!', parking: 'PARKIR', empty: 'Rp0', bank: 'BANK'},
};
