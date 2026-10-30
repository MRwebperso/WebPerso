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
 *   lloc), i hi porta una CSP pròpia i estreta, que substitueix la del lloc
 *   (les directives comunes s'hi repeteixen). El perquè: el JS de La Ruta corre
 *   a l'origen on viu la sessió del CMS, i la política és el que li impedeix
 *   parlar amb ningú de fora (`connect-src 'self'`, cap `eval`, cap marc, cap
 *   formulari, cap *worker*, scripts només del mateix origen). No tanca la
 *   mescla d'origens —això només ho fa un origen a part— però talla la sortida
 *   silenciosa i qualsevol injecció. Es va escriure després de llegir la seva
 *   pàgina compilada (29/10/2026) i es va provar en un Edge real recorrent-la
 *   sencera, amb les capçaleres que calcula Vercel: zero violacions, les mateixes
 *   sis peticions, totes al seu origen, i 204 violacions amb una política
 *   deliberadament massa estreta (el control que demostra que la prova mira).
 *   Si La Ruta passa a demanar res de fora —mosaics d'OpenStreetMap, un vídeo,
 *   una API— el que es toca és aquest fitxer i `vercel.json`, i en cas contrari
 *   el que falla és en producció, sense error visible.
 * - Cap `Cross-Origin-Opener-Policy`. L'administració i la finestra emergent
 *   d'OAuth parlen per `window.opener`; el `COOP` el talla i l'entrada al CMS
 *   deixa de funcionar sense cap error visible.
 * - Cap directiva de CSP que carregui contingut (`script-src`, `style-src`…)
 *   al lloc mateix, que és tot menys `/ruta/`. Les pàgines porten JS en línia,
 *   atributs `style=` i un formulari que escriu a una adreça de variable
 *   d'entorn: una política escrita a mà les bloquejaria. Aquesta, quan vingui,
 *   ha de sortir d'un hash calculat a la compilació, i llavors aquesta
 *   comprovació es canvia amb ella. Les tres directives d'ara (`base-uri`,
 *   `object-src`, `frame-ancestors`) no toquen cap recurs de la pàgina.
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

/** Els camins de La Ruta: porten la seva CSP estreta en lloc de la del lloc. */
const RUTA = ['/ruta', '/ruta/', '/ruta/_astro/x.js', '/ruta/a/b/'];
/** Fora de La Ruta, i amb un nom que s'hi assembla, la CSP és la del lloc. */
const NOT_RUTA = ['/rutafoo/', '/la-ruta/'];
/** Directives de La Ruta que han de ser exactament això: són la part que talla la sortida. */
const RUTA_EXACT = {
  'default-src': "'none'",
  'script-src': "'self'",
  'connect-src': "'self'",
  'form-action': "'none'",
  'frame-src': "'none'",
  'worker-src': "'none'",
  'object-src': "'none'",
  'frame-ancestors': "'none'",
  'base-uri': "'self'",
};

/** La CSP d'un camí com a mapa directiva → valor. */
function directivesOf(got) {
  return new Map(
    (got['content-security-policy'] ?? '')
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.split(/\s+/)[0], d.split(/\s+/).slice(1).join(' ')]),
  );
}

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

  // El lloc: la CSP de tres directives, sense res que carregui contingut.
  for (const pathname of COVERED.filter((p) => !RUTA.includes(p))) {
    const names = [...directivesOf(headersFor(routes, pathname)).keys()];
    for (const directive of CSP_FORBIDDEN) {
      t.ok(
        !names.includes(directive),
        `${pathname}: la CSP porta \`${directive}\`: bloquejaria el JS en línia, els atributs style= o el formulari de contacte; ha de sortir d'un hash de compilació`,
      );
    }
  }
  for (const pathname of NOT_RUTA) {
    t.equal(directivesOf(headersFor(routes, pathname)).has('default-src'), false, `${pathname}: no és de La Ruta i no n'ha de portar la CSP estreta`);
  }

  // La Ruta: la CSP estreta, sencera i sense escapatòries.
  for (const pathname of RUTA) {
    const csp = directivesOf(headersFor(routes, pathname));
    for (const [directive, value] of Object.entries(RUTA_EXACT)) {
      t.equal(csp.get(directive), value, `${pathname}: la CSP de La Ruta ha de dir \`${directive} ${value}\``);
    }
    const everything = [...csp.values()].join(' ');
    t.ok(!/'unsafe-eval'|'wasm-unsafe-eval'|\*|https?:/.test(everything), `${pathname}: la CSP de La Ruta deixa passar \`eval\`, un comodí o un origen de fora: això és el que no ha de poder fer`);
    t.ok(!(csp.get('script-src') ?? '').includes("'unsafe-inline'"), `${pathname}: script-src de La Ruta no pot portar 'unsafe-inline'`);
  }
}
