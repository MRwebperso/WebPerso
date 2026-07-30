/**
 * Configuració portable del lloc.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ CANVI DE DOMINI = NOMÉS LA LÍNIA `siteUrl` D'AQUÍ SOTA.          │
 * │ Cap altre fitxer del projecte no conté el domini.                │
 * │ Tots els enllaços interns són relatius a l'arrel (`/ca/…`).      │
 * └──────────────────────────────────────────────────────────────────┘
 */
export const siteUrl = process.env.SITE_URL ?? 'https://miquelrodrigues.example';

/**
 * Punt d'arribada del formulari de contacte: la URL que dona el servei de
 * formularis (Formspree, Web3Forms, Getform i companyia serveixen tots).
 *
 * Mentre estigui buida, el formulari no es dibuixa i la secció de contacte es
 * queda amb el correu directe. És deliberat: val més una secció amb una sola
 * via que funciona que un formulari que empassa el missatge en silenci.
 */
export const formEndpoint = process.env.FORM_ENDPOINT ?? '';

/** Metadades neutres respecte del domini. */
export const site = {
  /** Correu professional visible (secció 3 del brief). */
  email: 'desplacaments@gmail.com',
  /** Nom d'ús públic. */
  name: 'Miquel Rodrigues',
  /** Nom administratiu, només per a mencions legals. */
  legalName: 'Galvão Michel Rodrigues',
  place: {
    ca: 'Prats de Molló, Alt Vallespir',
    fr: 'Prats-de-Mollo, Haut-Vallespir',
  },
};
