// cast.js — Kisah Nabi Yusuf Part 2 (same Yusuf as Part 1; the white qamis is the key object).
export const QAMIS = '#f2ecdc';
export const YUSUF_KID = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950', kid: true };
export const YUSUF = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950' };                 // young man, servant / prisoner
export const AZIZ = { top: 'dress', color: '#2c4f9e', head: 'none', acc: ['collar'] };                      // the high official: royal-blue robe
export const ISTRI_AZIZ = { top: 'dress', color: '#4a1e3a', head: 'hood', headColor: '#c0306a' };           // the official's wife: crimson veil (always modest)
export const SAKSI = { top: 'dress', color: '#5a4a3a', head: 'hood', headColor: '#b8a888' };                // the witness
export const WANITA = ['#d87aa8', '#8a5ad6', '#e0a040', '#4aa0b0', '#c05a4a'].map((c) => ({ top: 'dress', color: '#3a2a34', head: 'hood', headColor: c }));
export const PEMUDA = [{ top: 'dress', color: '#4a3a2a', head: 'none' }, { top: 'dress', color: '#3a3a44', head: 'none' }];   // the two prisoners
export const RAJA = { top: 'dress', color: '#ece2c8', head: 'none', acc: ['nemesRed', 'collar'] };          // the King (red-striped nemes, not Pharaoh)
export const CAST = [YUSUF, AZIZ, ISTRI_AZIZ, RAJA];
