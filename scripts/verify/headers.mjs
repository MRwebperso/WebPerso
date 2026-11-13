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
 *   mescla d'origens —això ho fa l'origen a part de l'administració, des del
 *   13/11/2026— i no talla tota sortida: no cobreix la navegació ni WebRTC. És
 *   una barrera contra la injecció i la càrrega de codi de fora. Es va escriure després de llegir la seva
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
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { bundle, fromRoot } from './lib.mjs';

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

/*
 * Dos amfitrions des del 13/11/2026 (F1): l'administració (`cmsUrl` de
 * `src/config/site.mjs`) i el lloc públic, que és qualsevol altre —el domini de
 * `SITE_URL`, les adreces `.vercel.app`—. Les condicions `has`/`missing` de
 * `vercel.json` es comparen com fa Vercel, amb el valor com a expressió
 * ancorada, sense distingir majúscules.
 */
const PUBLIC_HOSTS = ['miquel.clm.cat', 'web-perso-md-e-ro.vercel.app'];

function conditionsHold(route, host) {
  const hostMatches = (c) => c.type === 'host' && new RegExp(`^(?:${c.value})$`, 'i').test(host);
  for (const c of route.has ?? []) if (c.type !== 'host' || !hostMatches(c)) return false;
  for (const c of route.missing ?? []) if (c.type === 'host' && hostMatches(c)) return false;
  return true;
}

/** Les capçaleres que Vercel afegiria a un camí, amb la clau en minúscula. */
function headersFor(routes, pathname, host = PUBLIC_HOSTS[0]) {
  const found = {};
  for (const route of routes) {
    if (!route.headers || !route.src || !route.continue) continue;
    if (new RegExp(route.src).test(pathname) && conditionsHold(route, host)) {
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
 * pren abans de mirar els fitxers: `/admin/` és un fitxer, i una regla que
 * arribés després no el taparia mai.
 */
function outcomeFor(routes, pathname, host) {
  let beforeFilesystem = true;
  for (const route of routes) {
    if (route.handle === 'filesystem') {
      beforeFilesystem = false;
      continue;
    }
    if (!route.src || route.continue) continue;
    const m = new RegExp(route.src).exec(pathname);
    if (!m || !conditionsHold(route, host)) continue;
    const fill = (v) => v.replace(/\$(\d+)/g, (_, i) => m[Number(i)] ?? '');
    if (route.status >= 300 && route.status < 400) return { redirect: fill(route.headers.Location), status: route.status, beforeFilesystem };
    if (route.dest) return { rewrite: fill(route.dest), beforeFilesystem };
  }
  return { filesystem: true };
}

/** Els camins de mostra on les capçaleres han de ser: pàgines, API, actius i La Ruta. */
const COVERED = [
  '/', '/ca/', '/fr/', '/ca/casos/', '/admin/', '/api/auth/', '/api/callback/', '/_astro/x.js', '/404.html',
  '/ruta/', '/ruta/_astro/x.js',
];
/** Els de l'administració: només a `cmsUrl`, i les seves capçaleres es miren a `hosts`. */
const CMS_PATHS = ['/admin', '/admin/', '/admin/config.yml', '/api/auth/', '/api/callback/'];
/** La resta: només al lloc públic. */
const SITE_PATHS = COVERED.filter((p) => !CMS_PATHS.includes(p));
/** S'assemblen als de l'administració i no en són. */
const LOOKALIKES = ['/administracio/', '/apis/', '/ca/admin/'];

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
  const { routes, error } = getTransformedRoutes({ headers: config.headers, redirects: config.redirects, rewrites: config.rewrites });

  if (!t.ok(!error, `Vercel rebutjaria vercel.json: ${error?.message ?? error}`)) return;
  t.ok(Array.isArray(routes) && routes.length > 0, 'vercel.json no genera cap ruta');

  for (const pathname of SITE_PATHS) {
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
  for (const pathname of SITE_PATHS.filter((p) => !RUTA.includes(p))) {
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

  await hosts(t, config, routes);

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

/*
 * F1 (13/11/2026): `/admin/` i `/api/` només a l'origen de l'administració, la
 * resta del lloc només al públic. El que es vigila és que el testimoni de GitHub
 * i el JS de `/ruta/` (un altre projecte) no comparteixin mai origen.
 *
 * - Al domini públic, l'administració no es serveix: una redirecció temporal,
 *   presa ABANS de mirar els fitxers, la porta a `cmsUrl` amb el mateix camí. No
 *   és un 404 perquè `/admin/` és un fitxer estàtic, i a `vercel.json` (sense
 *   `routes`, l'esquema antic que no admet `headers` ni `rewrites`) només les
 *   capçaleres i les redireccions passen abans dels fitxers.
 * - A l'origen de l'administració, `/ruta/` no es reescriu cap a la-ruta: hi
 *   cau al 404 de l'adaptador.
 * - A l'origen de l'administració, la resta del lloc es serveix (els fitxers
 *   estàtics no saben d'amfitrions), però inert: CSP `sandbox` sense
 *   `allow-scripts` (origen opac, cap script, cap formulari) i `noindex`.
 * - L'amfitrió escrit a `vercel.json` és el de `cmsUrl`: si un canviés i l'altre
 *   no, l'entrada al CMS es trencaria sense cap error visible.
 */
async function hosts(t, config, routes) {
  const { cmsUrl } = await import(pathToFileURL(fromRoot('src/config/site.mjs')).href);
  const cms = new URL(cmsUrl);
  const CMS_HOST = cms.host;

  const written = [...(config.headers ?? []), ...(config.redirects ?? []), ...(config.rewrites ?? [])]
    .flatMap((r) => [...(r.has ?? []), ...(r.missing ?? [])])
    .filter((c) => c.type === 'host')
    .map((c) => c.value);
  t.ok(written.length > 0, "vercel.json no porta cap condició d'amfitrió: l'administració i el lloc compartirien origen");
  t.equal([...new Set(written)], [CMS_HOST], `les condicions d'amfitrió de vercel.json han de nomenar ${CMS_HOST}, el de cmsUrl`);
  t.ok(!PUBLIC_HOSTS.includes(CMS_HOST), "l'amfitrió de l'administració no pot ser el del lloc");

  for (const host of PUBLIC_HOSTS) {
    for (const pathname of CMS_PATHS) {
      const out = outcomeFor(routes, pathname, host);
      const wanted = new URL(pathname.endsWith('/') || pathname.includes('.') ? pathname : `${pathname}/`, cms).href;
      t.equal(out.redirect, wanted, `${host}${pathname}: l'administració no es serveix al lloc públic, es redirigeix a ${wanted}`);
      t.ok(out.beforeFilesystem === true, `${host}${pathname}: la redirecció ha de passar abans dels fitxers, o /admin/ se serviria igualment`);
      t.ok(out.status === 307 || out.status === 302, `${host}${pathname}: redirecció temporal, no ${out.status}: una de permanent quedaria a la memòria del navegador`);
    }
    for (const pathname of [...SITE_PATHS, ...LOOKALIKES]) {
      const out = outcomeFor(routes, pathname, host);
      t.ok(!out.redirect, `${host}${pathname}: el lloc públic no es redirigeix (${out.redirect})`);
      t.ok(!('x-robots-tag' in headersFor(routes, pathname, host)), `${host}${pathname}: el lloc públic no porta noindex`);
    }
    t.equal(outcomeFor(routes, '/ruta/', host).rewrite, 'https://la-ruta-psi.vercel.app/ruta/', `${host}/ruta/: La Ruta es continua servint al lloc públic`);
  }

  for (const pathname of CMS_PATHS) {
    const out = outcomeFor(routes, pathname, CMS_HOST);
    t.ok(out.filesystem === true, `${CMS_HOST}${pathname}: l'administració es serveix, sense redirecció ni rewrite`);
    const got = headersFor(routes, pathname, CMS_HOST);
    for (const [key, value] of Object.entries(REQUIRED)) t.equal(got[key], value, `${CMS_HOST}${pathname}: la capçalera ${key} no és la d'ara`);
    const csp = directivesOf(got);
    t.ok(!csp.has('sandbox'), `${CMS_HOST}${pathname}: l'administració no pot anar en sandbox, Decap no correria`);
    t.equal(csp.get('frame-ancestors'), "'none'", `${CMS_HOST}${pathname}: frame-ancestors 'none'`);
    t.equal(csp.get('object-src'), "'none'", `${CMS_HOST}${pathname}: object-src 'none'`);
  }

  await cmsPolicies(t, routes, CMS_HOST);

  for (const pathname of ['/ruta', '/ruta/', '/ruta/_astro/x.js', '/ruta/a/b/']) {
    const out = outcomeFor(routes, pathname, CMS_HOST);
    t.ok(!out.rewrite && !out.redirect, `${CMS_HOST}${pathname}: La Ruta no es reescriu a l'origen de l'administració (${out.rewrite ?? out.redirect})`);
  }

  for (const pathname of [...SITE_PATHS, ...LOOKALIKES]) {
    const got = headersFor(routes, pathname, CMS_HOST);
    const csp = directivesOf(got);
    t.ok(csp.has('sandbox') && csp.get('sandbox') === '', `${CMS_HOST}${pathname}: la CSP ha de portar \`sandbox\` sense excepcions (cap allow-scripts)`);
    t.ok(!csp.has('script-src') && csp.get('default-src') === "'none'", `${CMS_HOST}${pathname}: cap script fora de l'administració`);
    t.equal(csp.get('frame-ancestors'), "'none'", `${CMS_HOST}${pathname}: frame-ancestors 'none'`);
    t.equal(got['x-robots-tag'], 'noindex, nofollow', `${CMS_HOST}${pathname}: fora dels cercadors`);
    for (const [key, value] of Object.entries(REQUIRED)) t.equal(got[key], value, `${CMS_HOST}${pathname}: la capçalera ${key} no és la d'ara`);
  }
}

/*
 * F3 (13/11/2026): CSP de càrrega a l'origen de l'administració, camí per camí.
 *
 * - `/admin/`: el que Decap 3.16.3 necessita, mesurat en un Edge sense
 *   interfície (CDP) recorrent l'entrada, la llista de casos, l'editor d'un cas
 *   amb la previsualització i un cas nou: zero violacions amb aquesta política.
 *   Dues concessions, cadascuna amb el seu control fallit: `'unsafe-eval'`
 *   (sense ell, la validació de `config.yml` crida `new Function` i Decap no
 *   arrenca: «Error loading the CMS configuration … EvalError») i
 *   `style-src 'unsafe-inline'` (sense ell, cinc violacions d'estils en línia,
 *   que Decap injecta en temps d'execució). `api.github.com` i
 *   `avatars.githubusercontent.com` són del rerefons `github`, que no es pot
 *   recórrer sense entrar: es posen pel que el rerefons fa (API i avatar de qui
 *   edita), no per una violació vista. L'script de Decap es nomena pel camí
 *   sencer, el mateix de la pàgina, que a més el lliga amb `integrity`.
 * - `/api/`: res a carregar (una redirecció i textos plans).
 * - `/api/callback/`: el guió i l'estil de la pàgina de tancament, pel seu
 *   hash, calculat aquí sobre el que serveix `_oauth.ts`.
 */
async function cmsPolicies(t, routes, CMS_HOST) {
  const admin = fs.readFileSync(fromRoot('src/pages/admin/index.astro'), 'utf8');
  const decapSrc = /<script[^>]*\ssrc="(https:\/\/unpkg\.com\/[^"]+)"/.exec(admin)?.[1];
  t.ok(decapSrc !== undefined, "la pàgina d'administració no carrega Decap d'unpkg amb un camí exacte");
  const scripts = [...admin.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
  t.ok(scripts.length > 0 && scripts.every((attrs) => /\ssrc=/.test(attrs)), "la pàgina d'administració no pot portar cap guió en línia: la CSP de /admin/ no admet 'unsafe-inline'");

  const ADMIN = {
    'default-src': "'none'",
    'script-src': `'self' 'unsafe-eval' ${decapSrc}`,
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' https://avatars.githubusercontent.com",
    'connect-src': "'self' https://api.github.com",
    'base-uri': "'none'",
    'form-action': "'none'",
    'object-src': "'none'",
    'frame-ancestors': "'none'",
  };
  for (const pathname of ['/admin/', '/admin/config.yml', '/admin/init.js']) {
    const csp = directivesOf(headersFor(routes, pathname, CMS_HOST));
    t.equal(Object.fromEntries(csp), ADMIN, `${CMS_HOST}${pathname}: la CSP de l'administració no és la mesurada`);
  }

  for (const pathname of ['/api/auth/', '/api/callback/', '/api/x/']) {
    const csp = directivesOf(headersFor(routes, pathname, CMS_HOST));
    t.equal(csp.get('default-src'), "'none'", `${CMS_HOST}${pathname}: default-src 'none'`);
    t.ok(!/'unsafe-|https?:|\*/.test([...csp.values()].join(' ')), `${CMS_HOST}${pathname}: cap 'unsafe-', origen de fora ni comodí`);
  }

  const oauth = await bundle('src/pages/api/_oauth.ts');
  const page = await oauth.authSuccess('x', new URL(`https://${CMS_HOST}/`)).text();
  const hash = (text) => `'sha256-${crypto.createHash('sha256').update(text ?? '', 'utf8').digest('base64')}'`;
  const scriptHash = hash(/<script>([\s\S]*?)<\/script>/.exec(page)?.[1]);
  const styleHash = hash(/<style>([\s\S]*?)<\/style>/.exec(page)?.[1]);
  const callback = directivesOf(headersFor(routes, '/api/callback/', CMS_HOST));
  t.equal(callback.get('script-src'), scriptHash, `/api/callback/: script-src ha de ser el hash del guió que serveix _oauth.ts (${scriptHash}); si s'ha tocat el guió, cal posar-lo a vercel.json`);
  t.equal(callback.get('style-src'), styleHash, `/api/callback/: style-src ha de ser el hash de l'estil que serveix _oauth.ts (${styleHash})`);
  t.equal(directivesOf(headersFor(routes, '/api/auth/', CMS_HOST)).has('script-src'), false, '/api/auth/: cap script');
}
