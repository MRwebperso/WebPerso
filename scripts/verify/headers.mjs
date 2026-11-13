/*
 * Les capçaleres de resposta de `vercel.json`.
 *
 * Fins al 29/10/2026 el lloc no en portava cap de seguretat: ni `nosniff`, ni
 * política de referent, ni cap prohibició d'encaixar-se en un marc. Es posen
 * aquí, a l'únic fitxer que ja mana en l'encaminament, i no una a una.
 *
 * El que es comprova és el que Vercel en farà, no el text del fitxer: es passa
 * `vercel.json` pel transformador de rutes de Vercel (`@vercel/routing-utils`)
 * i s'hi proven camins de mostra. Cap xarxa: el que només es veu desplegat
 * —que la capçalera arribi de debò— es comprova amb `curl -I` al domini.
 *
 * Dues coses que ningú no ha de desfer sense saber-ho:
 *
 * - `/ruta/` hi entra, tot i ser un altre projecte de Vercel (el rewrite el
 *   serveix des de l'origen del lloc, i per tant les capçaleres són les del
 *   lloc), i hi porta una CSP pròpia i estreta, que substitueix la del lloc
 *   (les directives comunes s'hi repeteixen): cap `eval`, cap marc, cap
 *   formulari, cap *worker*, scripts i peticions només del mateix origen. És
 *   una barrera contra la injecció i la càrrega de codi de fora, no contra tota
 *   sortida: no cobreix la navegació ni WebRTC. Es va escriure després de
 *   llegir la seva pàgina compilada (29/10/2026) i es va provar en un Edge real
 *   recorrent-la sencera: zero violacions, les mateixes sis peticions, totes al
 *   seu origen, i 204 violacions amb una política deliberadament massa estreta.
 *   Si La Ruta passa a demanar res de fora —mosaics d'OpenStreetMap, un vídeo,
 *   una API— el que es toca és aquest fitxer i `vercel.json`, i en cas
 *   contrari el que falla és en producció, sense error visible. El repositori
 *   la-ruta en porta una còpia idèntica: si es canvia, a tots dos llocs.
 * - Cap directiva de CSP que carregui contingut (`script-src`, `style-src`…)
 *   al lloc mateix, que és tot menys `/ruta/`. Les pàgines porten JS en línia,
 *   atributs `style=` i un formulari que escriu a una adreça de variable
 *   d'entorn: una política escrita a mà les bloquejaria. Aquesta, quan vingui,
 *   ha de sortir d'un hash calculat a la compilació, i llavors aquesta
 *   comprovació es canvia amb ella.
 *
 * Fins al 13/11/2026 també vigilava el CMS (cap `Cross-Origin-Opener-Policy`,
 * que tallava la finestra emergent d'OAuth, i el repartiment entre el lloc i
 * l'origen de l'administració). El CMS ja no existeix, i aquelles comprovacions
 * se n'han anat amb ell.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fromRoot } from './lib.mjs';

const nodeRequire = createRequire(import.meta.url);

/** `getTransformedRoutes`, des de l'adaptador que n'és el propietari. */
function routingUtils() {
  try {
    return nodeRequire('@vercel/routing-utils');
  } catch (error) {
    throw new Error(`no es troba \`@vercel/routing-utils\` (devDependencies): sense ell no es pot saber què en farà Vercel, de vercel.json (${error.message})`);
  }
}

/** Les capçaleres que Vercel afegiria a un camí, amb la clau en minúscula. */
function headersFor(routes, pathname) {
  const found = {};
  for (const route of routes) {
    if (!route.headers || !route.src || !route.continue) continue;
    if (new RegExp(route.src).test(pathname)) {
      for (const [key, value] of Object.entries(route.headers)) found[key.toLowerCase()] = value;
    }
  }
  return found;
}

/**
 * Què fa Vercel amb un camí, a part de les capçaleres: la primera ruta que no
 * continua decideix. `{ redirect }` amb el destí, `{ rewrite }` amb el destí, o
 * `{ filesystem: true }` si el camí arriba als fitxers (i, d'allà, a les
 * funcions o al 404 de l'adaptador). `beforeFilesystem` diu si la decisió es
 * pren abans de mirar els fitxers.
 */
function outcomeFor(routes, pathname) {
  let beforeFilesystem = true;
  for (const route of routes) {
    if (route.handle === 'filesystem') {
      beforeFilesystem = false;
      continue;
    }
    if (!route.src || route.continue) continue;
    const m = new RegExp(route.src).exec(pathname);
    if (!m) continue;
    const fill = (v) => v.replace(/\$(\d+)/g, (_, i) => m[Number(i)] ?? '');
    if (route.status >= 300 && route.status < 400) return { redirect: fill(route.headers.Location), status: route.status, beforeFilesystem };
    if (route.dest) return { rewrite: fill(route.dest), beforeFilesystem };
  }
  return { filesystem: true };
}

/** Els camins de mostra on les capçaleres han de ser: pàgines, API, actius i La Ruta. */
const COVERED = ['/', '/ca/', '/fr/', '/ca/casos/', '/_astro/x.js', '/404.html', '/ruta/', '/ruta/_astro/x.js'];

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
  const { routes, error } = getTransformedRoutes({ headers: config.headers, redirects: config.redirects, rewrites: config.rewrites, trailingSlash: config.trailingSlash });

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

  // Un sol origen des del 13/11/2026: cap condició d'amfitrió ni cap redirecció
  // cap a l'antic origen de l'administració.
  // El que feia l'adaptador fins al 13/11/2026 i ara fa `vercel.json`: la barra
  // final de `trailingSlash: 'always'` (sense ella, `/ca` donaria 404 o una
  // pàgina sense barra i els enllaços relatius anirien a un altre lloc) i la
  // memòria cau llarga dels actius amb empremta de `/_astro/`.
  t.equal(config.trailingSlash, true, 'vercel.json porta trailingSlash: true, com astro.config.mjs (always)');
  for (const [from, to] of [['/ca', '/ca/'], ['/ca/casos/banys-d-arles', '/ca/casos/banys-d-arles/'], ['/favicon.svg/', '/favicon.svg']]) {
    const out = outcomeFor(routes, from);
    t.ok(out.redirect === to && out.status === 308 && out.beforeFilesystem, `${from} es redirigeix amb un 308 a ${to} abans dels fitxers (${out.redirect} ${out.status})`);
  }
  for (const path of ['/', '/ca/', '/favicon.svg', '/_astro/x.js', '/ruta/']) {
    t.ok(!outcomeFor(routes, path).redirect, `${path} no es redirigeix`);
  }
  t.equal(headersFor(routes, '/_astro/x.js')['cache-control'], 'public, max-age=31536000, immutable', '/_astro/ porta la memòria cau llarga dels actius amb empremta');
  t.ok(!('cache-control' in headersFor(routes, '/ca/')), "les pàgines no porten la memòria cau llarga: un canvi de text ha d'arribar al següent desplegament");

  const conditional = [...(config.headers ?? []), ...(config.redirects ?? []), ...(config.rewrites ?? [])].filter((r) => r.has || r.missing);
  t.equal(conditional.length, 0, "vercel.json no porta cap regla condicionada (has/missing): el lloc té un sol origen");
  t.ok(!JSON.stringify(config).includes('cms.clm.cat'), "vercel.json no nomena cms.clm.cat: l'origen de l'administració ja no existeix");

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

