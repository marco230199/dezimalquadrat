# Dezimalzahlen am Quadrat

Interaktive Simulation für die 6. Jahrgangsstufe (Mathematik, Dezimalbrüche): Ein Quadrat ist ein Ganzes.
Jedes Teil wird in 10 gleiche Teile zerlegt. Da sich ein Quadrat nicht in 10 gleiche Quadrate teilen lässt
(10 ist keine Quadratzahl), wechseln sich Rechtecke und Quadrate ab:

- **Rechtecke (Zehnerfeld, Standard):** Quadrat → 5 × 2 Rechtecke (**Zehntel**, 0,2 × 0,5) → je 2 × 5 Quadrate
  (**Hundertstel**) → 5 × 2 Rechtecke (**Tausendstel**) → 2 × 5 Quadrate (**Zehntausendstel**)
- **Streifen:** Quadrat → 10 Streifen (Zehntel) → je 10 Quadrate (Hundertstel) → 10 Streifen → 10 Quadrate

In beiden Fällen bilden die Hundertstel das bekannte Hunderterfeld. Die Teile werden wie beim Lesen
gefüllt (zeilenweise von links nach rechts). Eine Dezimalzahl wird als gefärbte Fläche dargestellt, jede
Stufe in ihrer Farbe – passend zur Stellenwerttafel.

## Funktionen

- **Darstellung:** Quadrat oder **Zahlenstrahl**. Zahl, Eingabe und Stellenwerttafel gelten für beide.
  Auf dem Zahlenstrahl gibt es Striche für Ganze, Zehntel, Hundertstel, Tausendstel und Zehntausendstel
  (feinere erst beim Hineinzoomen, mit Beschriftung, sobald Platz ist). Die Zahl erscheint als farbiger
  Balken ab 0 – in denselben Stufenfarben wie die Flächen im Quadrat – und als Markierung. Antippen setzt
  die Zahl auf den nächsten Strich der feinsten sichtbaren Stufe.

- **Zahl eingeben** (z. B. `0,347`, auch mit Punkt) → die Fläche wird gefärbt
- **Antippen** färbt bis einschließlich des angetippten Teils (feinste sichtbare Stufe); dasselbe Teil
  nochmal antippen nimmt es wieder weg
- **Stellenwerttafel** (per Knopf ein- und ausblendbar, anfangs ausgeblendet) E | z | h | t | zt mit ▲/▼: ein Teil dieser Stufe dazu bzw. weg, mit Übertrag
  (0,09 + 0,01 = 0,1)
- **Zerlegung**: „= 3 Zehntel + 4 Hundertstel + 7 Tausendstel = 347 Tausendstel“
- **1, 2 oder 3 Quadrate** (Zahlen bis 3)
- **Einteilung** umschaltbar: Rechtecke (5 × 2) oder Streifen
- **Zoom**: Mausrad, zwei Finger, Knöpfe +/−, „Übersicht“; Ziehen verschiebt. Die Einteilung erscheint
  je nach Vergrößerung: in der Übersicht Zehntel und Hundertstel, hineingezoomt auch Tausendstel und
  Zehntausendstel. **Lupe**: Antippen zoomt auf das angetippte Hundertstel. Beim Hineinzoomen zeigt
  eine kleine Übersichtskarte, wo man gerade ist.
- Hochformat (Tablet): Bedienfeld unten

## Starten

Über einen Webserver öffnen (ES-Module):

- **VS Code:** „Live Server“ → `index.html`
- **Terminal:** im Projektordner `python3 -m http.server` und <http://localhost:8000> öffnen

## Projektstruktur

```text
├── index.html
├── css/style.css
├── js/
│   ├── main.js        # Start
│   ├── zahl.js        # Zahl (in Zehntausendsteln), Einlesen, Text, Einteilung, Antippen (ohne Zeichnen, testbar)
│   ├── state.js       # Zustand, Farben der Stellenwerte
│   ├── ansicht.js     # Quadrat: Zeichenfläche, Zoom, Verschieben, Antippen, Übersichtskarte
│   ├── strahl.js      # Zahlenstrahl: Striche, Balken, Zoom, Verschieben, Antippen, Übersichtskarte
│   └── bedienfeld.js  # Zahlanzeige, Eingabe, Stellenwerttafel, Anzahl der Quadrate
├── tests/zahl.test.mjs
└── package.json
```

## Tests

```bash
npm test
```
