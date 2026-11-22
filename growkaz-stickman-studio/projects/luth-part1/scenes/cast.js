// cast.js — Kisah Nabi Luth.
export const QAMIS = '#f2ecdc';
export const LUTH = { top: 'dress', color: '#5a4636', head: 'hood', headColor: '#1e9e8a' };      // teal head cloth
export const IBRAHIM = { top: 'dress', color: '#6a5a48', head: 'hood', headColor: '#f0ead8' };    // white head cloth
export const ISTRI_LUTH = { top: 'dress', color: '#2a1a24', head: 'hood', headColor: '#4a2a3a' }; // shown only as a dark silhouette in Part 1
export const KAUM = ['#7a2a24', '#5a3a2a', '#6a4a2a', '#4a2a3a', '#3a3a2a', '#6a2a3a'].map((c, i) => ({ top: 'dress', color: ['#2a1a1a', '#2a2020', '#30241a'][i % 3], head: i % 2 ? 'none' : 'hood', headColor: c }));
export const MUSAFIR = { top: 'dress', color: '#5a4a34', head: 'hood', headColor: '#d8b878' };
export const CAST = [LUTH, IBRAHIM];
