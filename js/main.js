// ------------------------------------------------------------------
// Start: Zeichenfläche und Bedienfeld
// ------------------------------------------------------------------
import { initAnsicht } from './ansicht.js';
import { initStrahl } from './strahl.js';
import { initBedienfeld, sichtbarkeit } from './bedienfeld.js';

initAnsicht(() => sichtbarkeit());
initStrahl(() => sichtbarkeit());
initBedienfeld();
