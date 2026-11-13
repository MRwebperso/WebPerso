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
 * Origen de l'administració del CMS: `/admin/` i les dues rutes d'`api/` es
 * serveixen només aquí, i la resta del lloc, només al domini públic (decisió de
 * Miquel del 13/11/2026, D1 del pla de seguretat). El motiu és `/ruta/`: el
 * rewrite fa córrer el JS d'un altre projecte a l'origen públic, i el testimoni
 * de GitHub que Decap desa al `localStorage` no hi ha de viure.
 *
 * No surt de cap variable d'entorn, a diferència de `siteUrl`, perquè l'amfitrió
 * també és escrit a les condicions de `vercel.json`, que no en pot llegir cap:
 * una variable que canviés aquí i no allà trencaria l'entrada sense cap error
 * visible. La comprovació `headers` de `npm run verify` vigila que els dos llocs
 * diguin el mateix. Canviar-lo vol dir moure alhora aquesta línia,
 * `vercel.json`, el domini del projecte a Vercel, el registre DNS i l'adreça de
 * retorn de l'aplicació OAuth de GitHub (`<cmsUrl>/api/callback/`).
 */
export const cmsUrl = 'https://cms.clm.cat';

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
  /** Identificador de la microempresa, per a la pàgina d'avís legal. */
  siren: '106 974 439',
  place: {
    ca: 'Prats de Molló, Alt Vallespir',
    fr: 'Prats-de-Mollo, Haut-Vallespir',
  },
};
