// cast.js — Kisah Nabi Hud.
export const QAMIS = '#f2ecdc';
export const HUD = { top: 'dress', color: '#d8cdb4', head: 'hood', headColor: '#f4efe2' };   // white head cloth, light robe
export const AD = ['#8a3a2a', '#6a4a2a', '#4a3a5a', '#7a5a2a', '#5a2a2a', '#3a4a3a'].map((c, i) => ({ top: 'dress', color: ['#2a1c14', '#24201a', '#2c1a1a'][i % 3], head: i % 3 === 1 ? 'none' : 'hood', headColor: c }));
