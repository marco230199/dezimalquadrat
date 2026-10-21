// ------------------------------------------------------------------
// Zahlenstrahl: dieselbe Zahl wie im Quadrat, als farbiger Balken ab 0 und Markierung.
// Striche für Ganze, Zehntel, Hundertstel, Tausendstel, Zehntausendstel – feinere erst beim Hineinzoomen.
// Bedienung wie beim Quadrat: Mausrad / zwei Finger zoomen, Ziehen verschiebt, Antippen setzt die Zahl
// auf den nächsten Strich (oder zoomt mit der Lupe). Welt-Koordinate x = Zahlwert.
// ------------------------------------------------------------------
import { ziffern, alsText, EINHEIT, STELLEN } from './zahl.js';
import { state, FARBEN } from './state.js';

const MIN_PX = 7, VOLL_PX = 16;              // Strichabstand, ab dem eine Stufe erscheint bzw. voll da ist
const TIPP_PX = 18;                          // Strichabstand, ab dem man eine Stufe antippen kann
const STRICH = [44, 30, 20, 13, 8];          // Strichlänge je Stufe (Pixel, nach oben und unten)
const LINIE = [3, 2.2, 1.6, 1.2, 0.9];

const cv = document.getElementById('strahl');
const ctx = cv.getContext('2d');
let W = 0, H = 0, dpr = 1;
const kamera = { s: 100, ox: 0 };            // Bildschirm-x = Zahl · s + ox
let animation = null, neuZeichnen = true, onAendern = () => {};

const achseY = () => H * 0.58;
const RAND = 60;

// ---------------- Kamera
function passend() {
  const s = (W - 2 * RAND) / state.quadrate;
  return { s, ox: RAND };
}
const sMin = () => passend().s * 0.6;
const sMax = () => W / 0.002;                // zwei Tausendstel füllen das Bild
function begrenzen(k) {
  k.s = Math.min(sMax(), Math.max(sMin(), k.s));
  k.ox = Math.min(W - 40, Math.max(40 - state.quadrate * k.s, k.ox));
  return k;
}
function fahreZu(ziel, dauer = 0.45) {
  animation = { von: { ...kamera }, ziel: begrenzen(ziel), t0: performance.now(), dauer: dauer * 1000 };
  anfordern();
}
export function uebersicht(sofort = false) {
  if (sofort) { animation = null; Object.assign(kamera, passend()); anfordern(); } else fahreZu(passend());
}
export function zoom(f, px = W / 2, _py, weich = true) {
  const s = Math.min(sMax(), Math.max(sMin(), kamera.s * f));
  const wx = (px - kamera.ox) / kamera.s;
  const ziel = { s, ox: px - wx * s };
  if (weich) fahreZu(ziel, 0.3); else { Object.assign(kamera, begrenzen(ziel)); anfordern(); }
}
/** Bereich [a, b] des Zahlenstrahls ins Bild holen */
function zeige(a, b) {
  const s = W / ((b - a) * 1.4);
  fahreZu({ s, ox: W / 2 - (a + b) / 2 * s });
}

const abstandPx = k => 10 ** -k * kamera.s;
const deckkraft = k => (k === 0 ? 1 : Math.max(0, Math.min(1, (abstandPx(k) - MIN_PX) / (VOLL_PX - MIN_PX))));
/** Feinste Stufe, deren Striche weit genug auseinander liegen, um sie anzutippen */
export function feinsteStufe() {
  let k = 1;
  for (let s = 2; s <= STELLEN; s++) if (abstandPx(s) >= TIPP_PX) k = s;
  return k;
}

// ---------------- Zeichnen
function groesse() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
}

function zeichnen() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (W === 0) return;
  const y0 = achseY(), S = kamera.s, X = v => kamera.ox + v * S;
  const v0 = Math.max(0, -kamera.ox / S), v1 = Math.min(state.quadrate, (W - kamera.ox) / S);

  // Farbiger Balken über der Achse: Ganze, dann Zehntel, Hundertstel … (wie die Flächen im Quadrat)
  const { ganze, nach } = ziffern(state.n);
  const teile = [[0, ganze]];
  nach.forEach((d, j) => teile.push([j + 1, d * 10 ** -(j + 1)]));
  let start = 0;
  const balkenH = 22, by = y0 - 14 - balkenH;
  for (const [k, laenge] of teile) {
    if (laenge > 0) {
      ctx.fillStyle = FARBEN[k].flaeche;
      ctx.fillRect(X(start), by, Math.max(1, laenge * S), balkenH);
      // Trennlinien zwischen den einzelnen Teilen dieser Stufe (wenn sie groß genug sind)
      const d = k === 0 ? 1 : 10 ** -k;
      if (d * S >= 6) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let v = start + d; v < start + laenge - 1e-9; v += d) { ctx.moveTo(X(v), by); ctx.lineTo(X(v), by + balkenH); }
        ctx.stroke();
      }
    }
    start += laenge;
  }

  // Achse
  ctx.strokeStyle = '#1d2733'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(X(0) - 2, y0); ctx.lineTo(Math.min(W, X(state.quadrate) + 30), y0); ctx.stroke();
  if (X(state.quadrate) + 30 < W) {           // Pfeilspitze am Ende
    ctx.fillStyle = '#1d2733';
    ctx.beginPath(); ctx.moveTo(X(state.quadrate) + 42, y0); ctx.lineTo(X(state.quadrate) + 28, y0 - 7); ctx.lineTo(X(state.quadrate) + 28, y0 + 7); ctx.fill();
  }

  // Striche: von fein nach grob; jede Stufe nur, wo es nicht schon einen gröberen Strich gibt
  for (let k = STELLEN; k >= 0; k--) {
    const a = deckkraft(k);
    if (a <= 0) continue;
    const d = 10 ** -k;
    ctx.globalAlpha = a;
    ctx.strokeStyle = k === 0 ? '#1d2733' : FARBEN[k].schrift;
    ctx.lineWidth = LINIE[k];
    ctx.beginPath();
    const i0 = Math.ceil(v0 / d - 1e-9), i1 = Math.floor(v1 / d + 1e-9);
    for (let i = i0; i <= i1; i++) {
      if (k > 0 && i % 10 === 0) continue;   // dort steht ein gröberer Strich
      const x = X(i * d);
      ctx.moveTo(x, y0 - STRICH[k]); ctx.lineTo(x, y0 + STRICH[k]);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Beschriftung: Ganze immer, feinere Stufen, sobald Platz für die Zahlen ist
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let k = 0; k <= STELLEN; k++) {
    const d = 10 ** -k;
    const breite = (k + 3) * 11;              // grob geschätzte Breite der Beschriftung
    if (k > 0 && d * S < breite + 8) break;
    ctx.font = `${k === 0 ? 700 : 600} ${k === 0 ? 20 : 15}px system-ui, sans-serif`;
    ctx.fillStyle = k === 0 ? '#1d2733' : FARBEN[k].schrift;
    const i0 = Math.ceil(v0 / d - 1e-9), i1 = Math.floor(v1 / d + 1e-9);
    for (let i = i0; i <= i1; i++) {
      if (k > 0 && i % 10 === 0) continue;
      const n = Math.round(i * d * EINHEIT);
      ctx.fillText(alsText(n), X(i * d), y0 + STRICH[k] + 6);
    }
  }

  // Markierung der Zahl: Dreieck über dem Balken und Zahl
  const xm = X(state.n / EINHEIT);
  if (xm > -20 && xm < W + 20) {
    ctx.fillStyle = '#c62828';
    ctx.beginPath(); ctx.moveTo(xm, by - 2); ctx.lineTo(xm - 9, by - 16); ctx.lineTo(xm + 9, by - 16); ctx.fill();
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xm, by); ctx.lineTo(xm, y0 + 6); ctx.stroke();
    ctx.font = '700 22px system-ui, sans-serif'; ctx.textBaseline = 'bottom';
    ctx.fillText(alsText(state.n), xm, by - 18);
  }

  if (kamera.s > passend().s * 1.6) uebersichtskarte(v0, v1);
}

// Kleine Übersicht unten links: ganzer Zahlenstrahl, Rahmen um den sichtbaren Ausschnitt
function uebersichtskarte(v0, v1) {
  const b = 150, x0 = 18, y0 = H - 34, m = b / state.quadrate;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillRect(x0 - 8, y0 - 18, b + 16, 32);
  ctx.fillStyle = FARBEN[1].flaeche;
  ctx.fillRect(x0, y0 - 8, state.n / EINHEIT * m, 8);
  ctx.strokeStyle = '#1d2733'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + b, y0);
  for (let q = 0; q <= state.quadrate; q++) { ctx.moveTo(x0 + q * m, y0 - 6); ctx.lineTo(x0 + q * m, y0 + 6); }
  ctx.stroke();
  ctx.strokeStyle = '#d32f2f'; ctx.lineWidth = 2;
  ctx.strokeRect(x0 + v0 * m, y0 - 14, Math.max(3, (v1 - v0) * m), 24);
}

function anfordern() { neuZeichnen = true; }
export const neuZeichnenAnfordern = anfordern;

function schleife(now) {
  if (animation) {
    const t = Math.min(1, (now - animation.t0) / animation.dauer), e = t * t * (3 - 2 * t);
    const { von, ziel } = animation;
    const s = Math.exp(Math.log(von.s) + (Math.log(ziel.s) - Math.log(von.s)) * e);
    const c0 = (W / 2 - von.ox) / von.s, c1 = (W / 2 - ziel.ox) / ziel.s;
    Object.assign(kamera, { s, ox: W / 2 - (c0 + (c1 - c0) * e) * s });
    if (t >= 1) animation = null;
    neuZeichnen = true;
  }
  if (neuZeichnen && W > 0) { neuZeichnen = false; zeichnen(); onAendern(); }
  requestAnimationFrame(schleife);
}

// ---------------- Bedienung
const zeiger = new Map();
let ziehen = null, pinch = null;

function antippen(px) {
  const v = (px - kamera.ox) / kamera.s;
  if (v < -0.02 * state.quadrate || v > state.quadrate * 1.02) return;
  const k = feinsteStufe();
  if (state.lupe) {
    if (k === STELLEN) uebersicht();
    else { const a = Math.floor(v * 100) / 100; zeige(a, a + 0.01); }
    return;
  }
  const schritt = 10 ** (STELLEN - k);         // in Zehntausendsteln
  state.setze(Math.round(v * EINHEIT / schritt) * schritt);
}

cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId);
  zeiger.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  animation = null;
  if (zeiger.size === 1) ziehen = { x: e.offsetX, ox: kamera.ox, bewegt: false };
  if (zeiger.size === 2) {
    const [a, b] = [...zeiger.values()];
    pinch = { d: Math.abs(a.x - b.x) || 1, s: kamera.s, mx: (a.x + b.x) / 2, ox: kamera.ox };
    ziehen = null;
  }
});
cv.addEventListener('pointermove', e => {
  if (!zeiger.has(e.pointerId)) return;
  zeiger.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  if (pinch && zeiger.size === 2) {
    const [a, b] = [...zeiger.values()];
    const d = Math.abs(a.x - b.x) || 1, mx = (a.x + b.x) / 2;
    const s = Math.min(sMax(), Math.max(sMin(), pinch.s * d / pinch.d));
    const wx = (pinch.mx - pinch.ox) / pinch.s;
    Object.assign(kamera, begrenzen({ s, ox: mx - wx * s }));
    anfordern();
  } else if (ziehen) {
    const dx = e.offsetX - ziehen.x;
    if (Math.abs(dx) > 6) ziehen.bewegt = true;
    if (ziehen.bewegt) { Object.assign(kamera, begrenzen({ s: kamera.s, ox: ziehen.ox + dx })); anfordern(); }
  }
});
function loslassen(e) {
  if (!zeiger.has(e.pointerId)) return;
  if (ziehen && !ziehen.bewegt && zeiger.size === 1) antippen(e.offsetX);
  zeiger.delete(e.pointerId);
  if (zeiger.size < 2) pinch = null;
  if (zeiger.size === 0) ziehen = null;
  else if (zeiger.size === 1) { const [p] = [...zeiger.values()]; ziehen = { x: p.x, ox: kamera.ox, bewegt: true }; }
}
cv.addEventListener('pointerup', loslassen);
cv.addEventListener('pointercancel', e => { zeiger.delete(e.pointerId); ziehen = pinch = null; });
cv.addEventListener('wheel', e => {
  e.preventDefault();
  zoom(Math.exp(-(e.deltaY || e.deltaX) * 0.0015), e.offsetX, 0, false);
}, { passive: false });

export function initStrahl(beiAenderung) {
  onAendern = beiAenderung;
  groesse();
  new ResizeObserver(() => { groesse(); if (W > 0) uebersicht(true); }).observe(cv);
  requestAnimationFrame(schleife);
}
