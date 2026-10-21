// ------------------------------------------------------------------
// Zustand der Simulation und Farben der Stellenwerte
// ------------------------------------------------------------------
import { EINHEIT } from './zahl.js';

// Je Stufe eine Farbe: Fläche im Quadrat (hell) und Schrift in der Stellenwerttafel (kräftig)
export const FARBEN = [
  { flaeche: '#9fa8da', schrift: '#283593' },   // Ganze
  { flaeche: '#64b5f6', schrift: '#1565c0' },   // Zehntel
  { flaeche: '#81c784', schrift: '#2e7d32' },   // Hundertstel
  { flaeche: '#ffb74d', schrift: '#e65100' },   // Tausendstel
  { flaeche: '#ce93d8', schrift: '#7b1fa2' },   // Zehntausendstel
];

const beobachter = [];

export const state = {
  n: 0,                 // dargestellte Zahl in Zehntausendsteln (3470 = 0,347)
  quadrate: 1,          // Anzahl der Quadrate (1, 2 oder 3) – beim Zahlenstrahl: bis zu welcher Zahl
  darstellung: 'quadrat',   // 'quadrat' oder 'strahl' (Zahlenstrahl)
  einteilung: 'rechtecke',   // 'rechtecke' (Zehnerfeld 5 × 2) oder 'streifen' (10 Streifen), siehe zahl.js
  lupe: false,          // Antippen zoomt statt zu färben
  zeigeTafel: false,    // Stellenwerttafel eingeblendet (per Knopf)
  get max() { return this.quadrate * EINHEIT; },
  /** Zahl setzen (auf 0 … Anzahl der Quadrate begrenzt) und alle Anzeigen auffrischen */
  setze(n) {
    this.n = Math.max(0, Math.min(this.max, Math.round(n)));
    for (const f of beobachter) f();
  },
  beiAenderung(f) { beobachter.push(f); },
};
