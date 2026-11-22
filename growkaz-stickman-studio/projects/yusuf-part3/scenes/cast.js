// cast.js — Kisah Nabi Yusuf Part 3 (same characters as Parts 1–2).
export const QAMIS = '#f2ecdc';
export const YUSUF_KID = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950', kid: true };
export const YUSUF = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950' };                       // prisoner
export const YUSUF_GOLD = { top: 'dress', color: QAMIS, head: 'headband', headColor: '#3fb950', acc: ['collar'] };   // treasurer of Egypt
export const YAQUB = { top: 'dress', color: '#5a4636', head: 'hood', headColor: '#e4dccb' };
export const IBU = { top: 'dress', color: '#4a3040', head: 'hood', headColor: '#e8a0c0' };
export const BUNYAMIN = { top: 'dress', color: '#3a3a4a', head: 'hood', headColor: '#3a8ad0' };
const BRO = [['#3a2a24', '#8a2e22'], ['#2e2a30', '#4a4038'], ['#34302a', '#5a4a3a'], ['#2a2e2a', '#3e463a'], ['#302a2a', '#6a4a3a'], ['#2a2a30', '#4a4a5a'], ['#33302a', '#7a6a4a'], ['#2a302e', '#4a5a50'], ['#302a30', '#5a3a4a'], ['#2e2e2a', '#6a6a50']];
export const BROTHERS = BRO.map(([c, h]) => ({ top: 'dress', color: c, head: 'hood', headColor: h }));   // the ten elder brothers (eldest first)
export const RAJA = { top: 'dress', color: '#ece2c8', head: 'none', acc: ['nemesRed', 'collar'] };
export const PEMUDA = [{ top: 'dress', color: '#4a3a2a', head: 'none' }];
export const CAST = [YUSUF_GOLD, YAQUB, BROTHERS[0]];
