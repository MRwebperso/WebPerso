/*
 * L'encaixada de la finestra emergent del CMS (`src/pages/api/_oauth.ts`).
 *
 * El que es comprova és el que serveix la pàgina de tancament, no el codi que
 * la genera: se n'extreu el `<script>` i s'executa en una finestra simulada,
 * amb una obridora que respon l'eco des de l'origen que es vulgui. Cap xarxa i
 * cap navegador (vegeu la capçalera de `lib.mjs`).
 *
 * Va néixer de la revisió de seguretat del 29/10/2026: la pàgina lliurava el
 * testimoni de GitHub a l'origen de qualsevol finestra que n'hagués respost
 * l'eco, de manera que una pàgina aliena que obrís `/api/auth/` el rebia. El
 * contracte és que el testimoni —i l'error, que passa per la mateixa
 * encaixada— només arriba a l'origen del lloc, i que res més que la salutació
 * constant surt cap a `*`.
 *
 * Hi entra també l'escapada del testimoni i del motiu dins del document, que
 * l'encaixada ja prometia i que fins ara no vigilava ningú.
 */
import vm from 'node:vm';
import { bundle } from './lib.mjs';

const SITE = new URL('https://site.example/admin/');
const HOSTILE = 'https://evil.example';
const HELLO = 'authorizing:github';

/**
 * Executa el `<script>` de `html` en una finestra simulada i hi fa arribar els
 * ecos de `echoes` (`{ origin, data }`, en ordre). Torna els missatges que la
 * pàgina ha enviat a l'obridora, cadascun amb el seu destí.
 */
function run(html, echoes) {
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (script === undefined) throw new Error('la pàgina de tancament no porta cap <script>');
  const sent = [];
  const listeners = [];
  const window = {
    opener: { postMessage: (data, target) => sent.push({ data: String(data), target }) },
    addEventListener: (type, fn) => type === 'message' && listeners.push(fn),
    removeEventListener: (_type, fn) => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    },
  };
  vm.runInNewContext(script, { window });
  for (const echo of echoes) for (const fn of [...listeners]) fn(echo);
  return sent;
}

const payloads = (sent) => sent.filter((m) => m.data.startsWith('authorization:'));

export default async function (t) {
  const oauth = await bundle('src/pages/api/_oauth.ts');
  const hello = (origin) => ({ origin, data: HELLO });

  const TOKEN = 'gho_FAKE';
  const success = await oauth.authSuccess(TOKEN, SITE).text();

  // Salutació: l'únic que surt cap a `*`, i res no hi pot dependre del lloc.
  const toAny = run(success, []).filter((m) => m.target === '*');
  t.equal(toAny.map((m) => m.data), [HELLO], "cap missatge no surt cap a `*` llevat de la salutació constant");

  // El camí bo: l'eco de l'origen del lloc rep el testimoni, una sola vegada.
  const own = payloads(run(success, [hello(SITE.origin), hello(SITE.origin)]));
  t.equal(own.map((m) => m.target), [SITE.origin], "l'eco de l'origen del lloc rep el testimoni, i només un cop");
  t.equal(
    own[0]?.data,
    `authorization:github:success:${JSON.stringify({ token: TOKEN, provider: 'github' })}`,
    'el missatge és el que espera Decap',
  );

  // L'atac: una pàgina aliena que ha obert `/api/auth/` respon l'eco.
  t.equal(payloads(run(success, [hello(HOSTILE)])), [], "l'eco d'un origen aliè no rep el testimoni");
  const raced = payloads(run(success, [hello(HOSTILE), hello(SITE.origin)]));
  t.equal(raced.map((m) => m.target), [SITE.origin], "l'eco aliè no crema l'encaixada: el del lloc, darrere seu, encara rep el testimoni");
  t.equal(
    payloads(run(success, [{ origin: SITE.origin, data: 'authorizing:other' }])),
    [],
    "un missatge que no és la salutació, ni des de l'origen del lloc, no rep res",
  );

  // L'error passa per la mateixa porta: el motiu tampoc no va a un origen aliè.
  const failure = await oauth.authError('GitHub no ha tornat cap codi.', SITE).text();
  t.equal(payloads(run(failure, [hello(HOSTILE)])), [], "l'error no es lliura a un origen aliè");
  t.equal(payloads(run(failure, [hello(SITE.origin)])).map((m) => m.target), [SITE.origin], "l'error es lliura a l'origen del lloc");

  // L'origen surt del domini i no del camí: un `site` amb camí no el canvia.
  t.ok(
    payloads(run(success, [hello(SITE.origin)])).length === 1 && !success.includes('/admin/'),
    "el que es fixa és l'origen, sense camí",
  );

  // Escapada: un testimoni o un motiu no poden tancar l'etiqueta ni afegir-ne.
  const hostileToken = `</script><script>window.pwned=1</script>`;
  const escaped = await oauth.authSuccess(hostileToken, SITE).text();
  t.equal(escaped.match(/<\/script>/g)?.length, 1, 'un testimoni amb `</script>` no tanca el <script> de la pàgina');
  t.equal(
    payloads(run(escaped, [hello(SITE.origin)]))[0]?.data,
    `authorization:github:success:${JSON.stringify({ token: hostileToken, provider: 'github' })}`,
    'el testimoni arriba intacte malgrat l’escapada',
  );
  const reasoned = await oauth.authError('<img src=x onerror=alert(1)>', SITE).text();
  t.ok(!reasoned.includes('<img'), 'el motiu surt escapat al text visible');
  t.equal(reasoned.match(/<\/script>/g)?.length, 1, 'el motiu no afegeix cap etiqueta <script>');

  await routes(t);
}

/*
 * Les dues rutes, cridades com les crida Astro: un `cookies` de mentida, el
 * `site` i la `url`. El que hi pot trencar l'entrada al CMS és que el nom de la
 * galeta que escriu `auth` no sigui el que llegeix `callback` (el prefix
 * `__Host-` depèn de l'esquema), i per això es prova l'anada i tornada sencera,
 * amb `fetch` simulat per a l'intercanvi del codi.
 */
const ROOT = new URL('https://site.example/');

function jar(initial = {}) {
  const store = new Map(Object.entries(initial));
  const log = { set: [], deleted: [] };
  return {
    log,
    store,
    set: (name, value, options) => (store.set(name, value), log.set.push({ name, value, options })),
    get: (name) => (store.has(name) ? { value: store.get(name) } : undefined),
    delete: (name, options) => (store.delete(name), log.deleted.push({ name, options })),
  };
}

async function routes(t) {
  const auth = await bundle('src/pages/api/auth.ts');
  const callback = await bundle('src/pages/api/callback.ts');
  const env = { GITHUB_OAUTH_ID: 'id-de-prova', GITHUB_OAUTH_SECRET: 'secret-de-prova' };
  const saved = { fetch: globalThis.fetch, env: {} };
  for (const key of [...Object.keys(env), 'GITHUB_OAUTH_SCOPE']) saved.env[key] = process.env[key];
  Object.assign(process.env, env);
  delete process.env.GITHUB_OAUTH_SCOPE;
  try {
    // Primer tram, sobre https: galeta `__Host-` (Secure, camí `/`, sense Domain)
    // i l'abast més estret per omissió.
    const cookies = jar();
    const first = await auth.GET({ cookies, site: ROOT, url: new URL('/api/auth/', ROOT) });
    const set = cookies.log.set[0];
    t.equal(set?.name, '__Host-decap-oauth-state', 'sobre https la galeta d\'estat porta el prefix __Host-');
    t.ok(
      set?.options?.secure === true && set?.options?.path === '/' && set?.options?.domain === undefined && set?.options?.httpOnly === true,
      'la galeta __Host- és Secure, de camí `/`, HttpOnly i sense Domain',
    );
    const location = new URL(first.headers.get('Location'));
    t.equal(location.searchParams.get('scope'), 'public_repo', "l'abast per omissió és public_repo");
    t.equal(location.searchParams.get('state'), set?.value, "l'estat que va a GitHub és el de la galeta");
    t.equal(location.searchParams.get('redirect_uri'), 'https://site.example/api/callback/', "el retorn és el del lloc");

    process.env.GITHUB_OAUTH_SCOPE = 'repo';
    const custom = await auth.GET({ cookies: jar(), site: ROOT, url: new URL('/api/auth/', ROOT) });
    t.equal(new URL(custom.headers.get('Location')).searchParams.get('scope'), 'repo', 'GITHUB_OAUTH_SCOPE mana sobre el per omissió');
    delete process.env.GITHUB_OAUTH_SCOPE;

    // Sobre http (desenvolupament) el prefix no s'hi pot posar: el navegador la refusaria.
    const dev = jar();
    await auth.GET({ cookies: dev, site: ROOT, url: new URL('http://localhost:4321/api/auth/') });
    t.equal(
      [dev.log.set[0]?.name, dev.log.set[0]?.options?.secure],
      ['decap-oauth-state', false],
      'sobre http la galeta no porta __Host- ni Secure',
    );

    // Tornada: l'estat de la galeta, un codi, i el testimoni arriba a la pàgina.
    const requests = [];
    globalThis.fetch = async (url, init) => {
      requests.push({ url, body: JSON.parse(init.body) });
      return { status: 200, json: async () => ({ access_token: 'gho_ANADA_I_TORNADA' }) };
    };
    const back = jar({ [set.name]: set.value });
    const done = await callback.GET({
      cookies: back,
      site: ROOT,
      url: new URL(`/api/callback/?code=el-codi&state=${set.value}`, ROOT),
    });
    t.ok((await done.text()).includes('gho_ANADA_I_TORNADA'), "l'anada i tornada sencera acaba amb el testimoni a la pàgina de tancament");
    t.equal(requests[0]?.body?.redirect_uri, 'https://site.example/api/callback/', "l'intercanvi porta el mateix redirect_uri que el primer tram");
    t.equal(
      back.log.deleted.map((d) => [d.name, d.options?.secure, d.options?.path]),
      [['__Host-decap-oauth-state', true, '/']],
      "la galeta s'esborra amb el seu nom, Secure i camí `/`: sense Secure el navegador descartaria l'esborrat",
    );

    // Estat que no coincideix o que no ha tornat: no hi ha intercanvi.
    requests.length = 0;
    const wrong = await callback.GET({
      cookies: jar({ [set.name]: set.value }),
      site: ROOT,
      url: new URL('/api/callback/?code=x&state=un-altre', ROOT),
    });
    t.ok((await wrong.text()).includes("L'estat no coincideix"), "un estat diferent no s'accepta");
    const none = await callback.GET({ cookies: jar(), site: ROOT, url: new URL('/api/callback/?code=x&state=y', ROOT) });
    t.ok((await none.text()).includes("L'estat de la sessió no ha tornat"), 'sense galeta no s\'accepta cap estat');
    t.equal(requests.length, 0, "cap dels dos casos no arriba a parlar amb GitHub");

    // GitHub rebutja el codi, o no es pot arribar a GitHub: la pàgina d'error ha
    // de sortir amb un estat que Cloudflare, davant del domini, no substitueixi.
    // Amb un 502 o un 504 la finestra emergent rebia la pàgina de Cloudflare
    // («error code: 502»), no executava l'encaixada i Decap no se n'assabentava
    // (vist en viu el 29/10/2026).
    const exchange = async (fetchImpl) => {
      globalThis.fetch = fetchImpl;
      const res = await callback.GET({
        cookies: jar({ [set.name]: set.value }),
        site: ROOT,
        url: new URL(`/api/callback/?code=el-codi&state=${set.value}`, ROOT),
      });
      return { status: res.status, body: await res.text() };
    };
    const refused = await exchange(async () => ({
      status: 200,
      json: async () => ({ error: 'bad_verification_code', error_description: 'The code passed is incorrect or expired.' }),
    }));
    t.ok(refused.body.includes('The code passed is incorrect or expired.'), "el motiu de GitHub arriba a la pàgina d'error");
    t.ok(![502, 504].includes(refused.status), `un codi rebutjat no surt amb ${refused.status}: Cloudflare el substituiria per la seva pàgina`);
    t.ok(refused.status >= 400 && refused.status < 500, 'un codi rebutjat surt amb un 4xx, que Cloudflare no intercepta');
    const unreachable = await exchange(async () => {
      throw new Error('xarxa caiguda');
    });
    t.ok(unreachable.body.includes("No s'ha pogut parlar amb GitHub"), "si no s'arriba a GitHub, la pàgina ho diu");
    t.ok(![502, 504].includes(unreachable.status), `GitHub inabastable no surt amb ${unreachable.status}: Cloudflare el substituiria`);

    // El text de l'adreça no surt a la pàgina: l'escriu qui vulgui.
    const phrase = 'Truqueu al 06 00 00 00 00 per recuperar el compte';
    const hostile = await callback.GET({
      cookies: jar(),
      site: ROOT,
      url: new URL(`/api/callback/?error=access_denied&error_description=${encodeURIComponent(phrase)}`, ROOT),
    });
    const hostileBody = await hostile.text();
    t.ok(!hostileBody.includes('Truqueu'), "l'error_description de l'adreça no arriba a la pàgina");
    t.ok(hostileBody.includes("Has refusat l'accés a GitHub."), 'un error conegut surt amb el text fix');
    const unknown = await callback.GET({
      cookies: jar(),
      site: ROOT,
      url: new URL(`/api/callback/?error=${encodeURIComponent(phrase)}`, ROOT),
    });
    const unknownBody = await unknown.text();
    t.ok(!unknownBody.includes('Truqueu') && unknownBody.includes("GitHub ha refusat l'autenticació."), "un error desconegut tampoc no s'amolla: surt el text genèric");
  } finally {
    globalThis.fetch = saved.fetch;
    for (const [key, value] of Object.entries(saved.env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}
