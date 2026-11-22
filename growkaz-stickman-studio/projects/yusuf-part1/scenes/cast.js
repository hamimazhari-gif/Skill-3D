// cast.js — Kisah Nabi Yusuf. Yusuf's white qamis is the story's key object (it returns in every part).
export const QAMIS = '#f2ecdc';
export const YUSUF_KID = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950', kid: true };   // white qamis + green headband
export const YUSUF = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950', acc: ['collar'] }; // adult, in Egypt
export const YAQUB = { top: 'dress', color: '#5a4636', head: 'hood', headColor: '#e4dccb' };                  // cream head cloth, staff
export const BROTHERS = [
  { top: 'dress', color: '#3a2a24', head: 'hood', headColor: '#8a2e22' },   // the eldest / spokesman: dark red
  { top: 'dress', color: '#2e2a30', head: 'hood', headColor: '#4a4038' },
  { top: 'dress', color: '#34302a', head: 'hood', headColor: '#5a4a3a' },
  { top: 'dress', color: '#2a2e2a', head: 'hood', headColor: '#3e463a' },
];
export const MUSAFIR = { top: 'dress', color: '#5a4a34', head: 'hood', headColor: '#d8b878' };                // caravan travellers
export const CAST = [YUSUF_KID, YAQUB, BROTHERS[0]];
