// ------------------------------------------------------------------
// Bedienfeld: Zahlanzeige, Eingabe, Stellenwerttafel mit ▲ / ▼, Anzahl der Quadrate, Zoom-Knöpfe
// ------------------------------------------------------------------
import { STUFEN, STELLEN, ziffern, nachkommastellen, lies, zerlegung, inKleinsterEinheit } from './zahl.js';
import { state, FARBEN } from './state.js';
import * as Quadrat from './ansicht.js';
import * as Strahl from './strahl.js';

/** Die gerade sichtbare Darstellung (Zoom, Übersicht, Antippen) */
const ansicht = () => (state.darstellung === 'strahl' ? Strahl : Quadrat);
const feinsteStufe = () => ansicht().feinsteStufe();

const $ = id => document.getElementById(id);

// ---------------- Stellenwerttafel aufbauen
const spalten = STUFEN.map((stufe, k) => {
  const el = document.createElement('div');
  el.className = 'spalte' + (k === 0 ? ' ganze' : '');
  const kopf = document.createElement('div');
  kopf.className = 'kopf';
  kopf.textContent = stufe.kurz;
  kopf.title = stufe.name;
  kopf.style.background = FARBEN[k].schrift;
  const hoch = document.createElement('button');
  hoch.type = 'button';
  hoch.textContent = '▲';
  hoch.setAttribute('aria-label', `ein ${stufe.einzahl} dazu`);
  const ziffer = document.createElement('div');
  ziffer.className = 'ziffer';
  ziffer.style.color = FARBEN[k].schrift;
  const runter = document.createElement('button');
  runter.type = 'button';
  runter.textContent = '▼';
  runter.setAttribute('aria-label', `ein ${stufe.einzahl} weg`);
  el.append(kopf, hoch, ziffer, runter);
  $('stellenwerttafel').appendChild(el);
  // Ein Teil dieser Stufe dazu bzw. weg (mit Übertrag: 0,09 + 0,01 = 0,1)
  const schritt = 10 ** (STELLEN - k);
  hoch.addEventListener('click', () => state.setze(state.n + schritt));
  runter.addEventListener('click', () => state.setze(state.n - schritt));
  return { el, ziffer, hoch, runter, schritt };
});

// ---------------- Anzeigen auffrischen
function zahlHtml(n) {
  const { ganze, nach } = ziffern(n);
  const k = nachkommastellen(n);
  const span = (text, stufe) => `<span style="color:${FARBEN[stufe].schrift}">${text}</span>`;
  let html = span(ganze, 0);
  if (k > 0) html += ',' + nach.slice(0, k).map((d, j) => span(d, j + 1)).join('');
  return html;
}

function auffrischen() {
  const n = state.n;
  $('zahlAnzeige').innerHTML = zahlHtml(n);
  const klein = inKleinsterEinheit(n);
  $('zerlegung').textContent = n === 0 ? 'Nichts ist gefärbt.'
    : `= ${zerlegung(n)}` + (klein && nachkommastellen(n) > 1 ? `\n= ${klein}` : '');
  const { ganze, nach } = ziffern(n);
  [ganze, ...nach].forEach((d, k) => {
    const s = spalten[k];
    s.ziffer.textContent = d;
    s.hoch.disabled = n + s.schritt > state.max;
    s.runter.disabled = n - s.schritt < 0;
  });
  for (const b of document.querySelectorAll('[data-quadrate]')) {
    b.classList.toggle('active', Number(b.dataset.quadrate) === state.quadrate);
  }
  for (const b of document.querySelectorAll('[data-einteilung]')) {
    b.classList.toggle('active', b.dataset.einteilung === state.einteilung);
  }
  for (const b of document.querySelectorAll('[data-darstellung]')) {
    b.classList.toggle('active', b.dataset.darstellung === state.darstellung);
  }
  $('tafelBereich').hidden = !state.zeigeTafel;
  $('tafelBtn').textContent = state.zeigeTafel ? 'Stellenwerttafel ausblenden' : 'Stellenwerttafel einblenden';
  $('tafelBtn').setAttribute('aria-pressed', String(state.zeigeTafel));
  const strahl = state.darstellung === 'strahl';
  $('flaeche').hidden = strahl;
  $('strahl').hidden = !strahl;
  $('einteilungTitel').hidden = $('einteilungWahl').hidden = strahl;
  $('quadrateTitel').textContent = strahl ? 'Zahlenstrahl bis' : 'Quadrate';
  $('untertitel').textContent = strahl ? 'Zahlenstrahl: Von 0 bis 1 ist ein Ganzes.' : 'Ein Quadrat ist ein Ganzes.';
  document.querySelector('.header h1').textContent = strahl ? 'Dezimalzahlen am Zahlenstrahl' : 'Dezimalzahlen am Quadrat';
  sichtbarkeit(true);
  Quadrat.neuZeichnenAnfordern();
  Strahl.neuZeichnenAnfordern();
}

// Hinweise je nach Zoom (wird nach jedem Neuzeichnen aufgerufen, ändert nur bei Bedarf etwas)
let zuletzt = null;
export function sichtbarkeit(immer = false) {
  const fein = feinsteStufe();
  const schluessel = `${fein}|${state.lupe}|${nachkommastellen(state.n)}|${state.einteilung}|${state.darstellung}`;
  if (!immer && schluessel === zuletzt) return;
  zuletzt = schluessel;
  spalten.forEach((s, k) => s.el.classList.toggle('unsichtbar', k > fein));
  const versteckt = nachkommastellen(state.n) > fein;
  const feiner = STUFEN.slice(fein + 1, STELLEN + 1).map(st => st.name).join(' und ');
  $('tafelHinweis').textContent = fein === STELLEN
    ? 'Hineingezoomt: Jetzt kannst du auch Zehntausendstel antippen.'
    : versteckt
      ? `${feiner} sind hier zu klein – zoome hinein (z. B. mit der Lupe).`
      : `${feiner} siehst du, wenn du hineinzoomst.`;
  const strahl = state.darstellung === 'strahl';
  $('hinweis').textContent = state.lupe
    ? `Lupe: Tippe auf ${strahl ? 'eine Stelle' : 'ein Hundertstel'}, um hineinzuzoomen. Nochmal tippen: zurück.`
    : (strahl ? `Antippen setzt die Zahl auf den nächsten ${STUFEN[fein].einzahl}-Strich`
      : `Antippen färbt bis zu diesem ${STUFEN[fein].einzahl}`) + ' · Ziehen: verschieben · Mausrad oder zwei Finger: zoomen';
  $('lupeBtn').setAttribute('aria-pressed', String(state.lupe));
}

export function initBedienfeld() {
  state.beiAenderung(auffrischen);
  $('eingabeForm').addEventListener('submit', e => {
    e.preventDefault();
    const r = lies($('eingabe').value, state.max);
    $('fehler').textContent = r.fehler ?? '';
    if (!r.fehler) state.setze(r.n);
  });
  $('eingabe').addEventListener('input', () => { $('fehler').textContent = ''; });
  for (const b of document.querySelectorAll('[data-quadrate]')) {
    b.addEventListener('click', () => {
      state.quadrate = Number(b.dataset.quadrate);
      state.setze(state.n);                 // ggf. auf die neue Höchstzahl begrenzen
      Quadrat.uebersicht(true);
      Strahl.uebersicht(true);
    });
  }
  for (const b of document.querySelectorAll('[data-einteilung]')) {
    b.addEventListener('click', () => { state.einteilung = b.dataset.einteilung; state.setze(state.n); });
  }
  $('nullBtn').addEventListener('click', () => { state.setze(0); $('eingabe').value = ''; $('fehler').textContent = ''; });
  for (const b of document.querySelectorAll('[data-darstellung]')) {
    b.addEventListener('click', () => { state.darstellung = b.dataset.darstellung; state.setze(state.n); });
  }
  $('tafelBtn').addEventListener('click', () => { state.zeigeTafel = !state.zeigeTafel; auffrischen(); });
  $('zoomIn').addEventListener('click', () => ansicht().zoom(2));
  $('zoomOut').addEventListener('click', () => ansicht().zoom(0.5));
  $('uebersichtBtn').addEventListener('click', () => ansicht().uebersicht());
  $('lupeBtn').addEventListener('click', () => { state.lupe = !state.lupe; sichtbarkeit(true); });
  auffrischen();
}
