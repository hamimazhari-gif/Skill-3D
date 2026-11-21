// cast.js — ancient Egypt / Madyan cast. One signature colour each, identical in every shot.
// Robes use the rig's 'dress' top (long garment); head cloths use 'hood'. Extra costume pieces
// (nemes, collar, magician hat, staff) are drawn by lib/_costume.js via the `acc` list.
export const MUSA = { top: 'dress', color: '#6e5038', head: 'hood', headColor: '#3a6ea5' };             // blue head cloth
export const MUSA_KID = { top: 'dress', color: '#e8dcc0', head: 'none', kid: true, acc: ['collar'] };  // raised as a prince
export const HARUN = { top: 'dress', color: '#5e4a3c', head: 'hood', headColor: '#d64a33' };           // red head cloth
export const FIRAUN = { top: 'dress', color: '#ece2c8', head: 'none', acc: ['nemes', 'collar'] };       // gold nemes
export const ISTRI = { top: 'dress', color: '#4e3442', head: 'hood', headColor: '#f29ac0' };           // pink veil
export const ADIK = { top: 'dress', color: '#3e3450', head: 'hood', headColor: '#8a5ad6' };            // purple veil
export const AYAH = { top: 'dress', color: '#cfc4b0', head: 'hood', headColor: '#e4dccb' };            // old man of Madyan
export const GEMBALA = { top: 'dress', color: '#2e2420', head: 'hood', headColor: '#3a2e28' };         // shepherds (plain)
export const PENYIHIR = { top: 'dress', color: '#24142e', head: 'none', acc: ['hat'] };                // magicians
export const PENJAGA = { top: 'none', head: 'none', acc: ['guardcloth'] };                             // palace guards
export const CAST = [MUSA, HARUN, FIRAUN, ISTRI];
