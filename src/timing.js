// Sentence timing -> shot cuts and word times, per language.
import EN from './data/sentence_times_en.json';
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 12;
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

// Word events per language: [sentenceIndex, word, occurrence]. Story: "Knocker-upper / si pembangun orang".
export const EV = {
  dibayar: {en: [0, 'paid'], id: [0, 'dibayar']}, bangunkan: {en: [0, 'wake'], id: [0, 'membangunkan']},
  nyata: {en: [1, 'real'], id: [1, 'benar']},
  inggris: {en: [2, 'britain'], id: [2, 'inggris']}, pabrik: {en: [2, 'factory'], id: [2, 'pabrik']}, subuh: {en: [2, 'dawn'], id: [2, 'subuh']},
  masalah: {en: [3, 'problem'], id: [3, 'masalahnya']}, mahal: {en: [3, 'expensive'], id: [3, 'mahal']}, langka: {en: [3, 'rare'], id: [3, 'langka']},
  muncul: {en: [4, 'strange'], id: [4, 'muncullah']}, knocker: {en: [4, 'knocker'], id: [4, 'knocker']},
  setiap: {en: [5, 'every'], id: [5, 'setiap']}, tongkat: {en: [5, 'stick'], id: [5, 'tongkat']}, ketuk: {en: [5, 'tapping'], id: [5, 'mengetuk']}, pelanggan: {en: [5, 'customers'], id: [5, 'pelanggan']},
  tok1: {en: [6, 'tap', 0], id: [6, 'tok', 0]}, tok2: {en: [6, 'tap', 1], id: [6, 'tok', 1]}, tok3: {en: [6, 'tap', 2], id: [6, 'tok', 2]},
  iya: {en: [7, 'okay'], id: [7, 'iya']}, bangun1: {en: [7, 'awake'], id: [7, 'bangun']},
  jangan: {en: [8, 'don'], id: [8, 'jangan']}, pura: {en: [8, 'pretending'], id: [8, 'pura']},
  pergi: {en: [9, 'leave'], id: [9, 'pergi']}, yakin: {en: [9, 'sure'], id: [9, 'yakin']}, bangun2: {en: [9, 'really'], id: [9, 'bangun']},
  kreatif: {en: [10, 'creative'], id: [10, 'kreatif']},
  wanita: {en: [11, 'woman'], id: [11, 'wanita']}, london: {en: [11, 'london'], id: [11, 'london']}, sumpit: {en: [11, 'pea'], id: [11, 'sumpit']},
  kacang: {en: [11, 'peas'], id: [11, 'kacang']}, jendela: {en: [11, 'windows'], id: [11, 'jendela']},
  tik1: {en: [12, 'tik', 0], id: [12, 'tik', 0]}, tik2: {en: [12, 'tik', 1], id: [12, 'tik', 1]}, tik3: {en: [12, 'tik', 2], id: [12, 'tik', 2]},
  bayar: {en: [13, 'pay'], id: [13, 'bayarannya']}, sen: {en: [13, 'pennies'], id: [13, 'sen']}, minggu: {en: [13, 'week'], id: [13, 'minggu']},
  tunggu: {en: [14, 'wait'], id: [14, 'tunggu']}, siapa: {en: [14, 'who'], id: [14, 'siapa']}, pembangun: {en: [14, 'knocker'], id: [14, 'pembangun']},
  jawab: {en: [15, 'answer'], id: [15, 'jawabannya']}, malam: {en: [15, 'night'], id: [15, 'malam']},
  belum: {en: [16, 'stayed'], id: [16, 'belum']}, pulang: {en: [16, 'bed'], id: [16, 'pulang']}, semua: {en: [16, 'all'], id: [16, 'semua']},
  hilang: {en: [17, 'disappeared'], id: [17, 'hilang']}, murah: {en: [17, 'cheap'], id: [17, 'murah']},
  sekarang: {en: [18, 'today'], id: [18, 'sekarang']}, alarm: {en: [18, 'alarms'], id: [18, 'alarm']}, snooze: {en: [18, 'snooze'], id: [18, 'snooze']}, lima: {en: [18, 'five'], id: [18, 'lima']},
  langsung: {en: [19, 'instant'], id: [19, 'langsung']}, tim: {en: [19, 'team'], id: [19, 'tim']}, komentar: {en: [19, 'comments'], id: [19, 'komentar']},
};

export const LABELS = {
  en: {true: 'TRUE STORY!', mill: 'COTTON MILL', price: 'EXPENSIVE!', rare: 'RARE', title: 'KNOCKER-UPPER', titleSub: 'THE HUMAN ALARM CLOCK', london: 'LONDON',
    pay: 'A FEW PENNIES', paySub: 'PER WEEK', shop: 'ALARM CLOCKS', cheap: 'CHEAP!', snooze: 'SNOOZE', riser: 'INSTANT RISER', team: 'TEAM SNOOZE', comment: 'COMMENT!', who: 'WHO WAKES HIM?'},
  id: {true: 'KISAH NYATA!', mill: 'PABRIK KAPAS', price: 'MAHAL!', rare: 'LANGKA', title: 'KNOCKER-UPPER', titleSub: 'SI PEMBANGUN ORANG', london: 'LONDON',
    pay: 'BEBERAPA SEN', paySub: 'PER MINGGU', shop: 'JAM WEKER', cheap: 'MURAH!', snooze: 'SNOOZE', riser: 'LANGSUNG BANGUN', team: 'TIM SNOOZE', comment: 'KOMENTAR!', who: 'SIAPA YANG BANGUNIN?'},
};
