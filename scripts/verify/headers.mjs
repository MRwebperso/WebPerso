/*
 * Les capçaleres de resposta de `vercel.json`.
 *
 * Fins al 29/10/2026 el lloc no en portava cap de seguretat: ni `nosniff`, ni
 * política de referent, ni cap prohibició d'encaixar-se en un marc, en un lloc
 * on `/admin/` guarda un testimoni de GitHub amb permís d'escriptura a `main`,
 * que és el que es desplega. Es posen aquí, a l'únic fitxer que ja mana en
 * l'encaminament, i no una a una a les rutes.
 *
 * El que es comprova és el que Vercel en farà, no el text del fitxer: es passa
 * `vercel.json` pel mateix transformador de rutes que fa servir l'adaptador
 * (`@vercel/routing-utils`, que `@astrojs/vercel` porta com a dependència
 * pròpia; es resol des d'ell, com fa `lib.mjs` amb el `zod` d'Astro) i s'hi
 * proven camins de mostra. Cap xarxa: el que només es veu desplegat —que la
 * capçalera arribi de debò— es comprova amb `curl -I` al domini.
 *
 * Tres coses que ningú no ha de desfer sense saber-ho:
 *
 * - `/ruta/` hi entra, tot i ser un altre projecte de Vercel (el rewrite el
 *   serveix des de l'origen del lloc, i per tant les capçaleres són les del
 *   lloc). Es va deixar fora fins que es va llegir la seva pàgina compilada
 *   (29/10/2026): un sol `<script>` del mateix origen, cap URL externa, cap
 *   marc, formulari, `<object>`, gestor en línia ni ús de `navigator`, i el
 *   generador del clip la carrega a nivell superior. Si La Ruta passa a
 *   incrustar res o a demanar el micròfon, el que es toca és aquest fitxer.
 * - Cap `Cross-Origin-Opener-Policy`. L'administració i la finestra emergent
 *   d'OAuth parlen per `window.opener`; el `COOP` el talla i l'entrada al CMS
 *   deixa de funcionar sense cap error visible.
 * - Cap directiva de CSP que carregui contingut (`script-src`, `style-src`…).
 *   Les pàgines porten JS en línia, atributs `style=` i un formulari que
 *   escriu a una adreça de variable d'entorn: una política escrita a mà les
 *   bloquejaria. Aquesta, quan vingui, ha de sortir d'un hash calculat a la
 *   compilació, i llavors aquesta comprovació es canvia amb ella. Les tres
 *   directives d'ara (`base-uri`, `object-src`, `frame-ancestors`) no toquen
 *   cap recurs de la pàgina.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fromRoot } from './lib.mjs';

const nodeRequire = createRequire(import.meta.url);

/** `getTransformedRoutes`, des de l'adaptador que n'és el propietari. */
function routingUtils() {
  try {
    const adapter = nodeRequire.resolve('@astrojs/vercel');
    return createRequire(adapter)('@vercel/routing-utils');
  } catch (error) {
    throw new Error(`no es troba \`@vercel/routing-utils\` des de \`@astrojs/vercel\`: sense ell no es pot saber què en farà Vercel, de vercel.json (${error.message})`);
  }
}

/** Les capçaleres que Vercel afegiria a un camí, amb la clau en minúscula. */
function headersFor(routes, pathname) {
  const found = {};
  for (const route of routes) {
    if (!route.headers || !route.src) continue;
    if (new RegExp(route.src).test(pathname)) {
      for (const [key, value] of Object.entries(route.headers)) found[key.toLowerCase()] = value;
    }
  }
  return found;
}

/** Els camins de mostra on les capçaleres han de ser: pàgines, API, actius i La Ruta. */
const COVERED = [
  '/', '/ca/', '/fr/', '/ca/casos/', '/admin/', '/api/auth/', '/api/callback/', '/_astro/x.js', '/404.html',
  '/ruta/', '/ruta/_astro/x.js',
];

const REQUIRED = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const CSP_REQUIRED = ["base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'"];
const CSP_FORBIDDEN = ['default-src', 'script-src', 'style-src', 'connect-src', 'form-action'];

export default async function run(t) {
  const config = JSON.parse(fs.readFileSync(fromRoot('vercel.json'), 'utf8'));
  const { getTransformedRoutes } = routingUtils();
  const { routes, error } = getTransformedRoutes({ headers: config.headers, rewrites: config.rewrites });

  if (!t.ok(!error, `Vercel rebutjaria vercel.json: ${error?.message ?? error}`)) return;
  t.ok(Array.isArray(routes) && routes.length > 0, 'vercel.json no genera cap ruta');

  for (const pathname of COVERED) {
    const got = headersFor(routes, pathname);
    for (const [key, value] of Object.entries(REQUIRED)) {
      t.equal(got[key], value, `${pathname}: la capçalera ${key} no és la d'ara`);
    }
    const directives = (got['content-security-policy'] ?? '').split(';').map((d) => d.trim());
    for (const wanted of CSP_REQUIRED) {
      t.ok(directives.includes(wanted), `${pathname}: la CSP no porta \`${wanted}\``);
    }
  }

  // Vigilàncies que valen per a qualsevol camí, no només per als de mostra.
  const everyKey = routes.flatMap((r) => Object.keys(r.headers ?? {}).map((k) => k.toLowerCase()));
  t.ok(
    !everyKey.includes('cross-origin-opener-policy'),
    'vercel.json posa Cross-Origin-Opener-Policy: talla `window.opener` i l\'entrada al CMS deixa de funcionar sense cap error visible',
  );
  const csp = routes.map((r) => r.headers?.['Content-Security-Policy']).filter(Boolean).join(';');
  for (const directive of CSP_FORBIDDEN) {
    t.ok(
      !csp.split(';').some((d) => d.trim().startsWith(`${directive} `)),
      `la CSP porta \`${directive}\`: bloquejaria el JS en línia, els atributs style= o el formulari de contacte; ha de sortir d'un hash de compilació`,
    );
  }
}
