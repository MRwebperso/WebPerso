import type { APIRoute } from 'astro';
import {
  authError,
  authSuccess,
  CALLBACK_PATH,
  missingEnv,
  plainText,
  readEnv,
  stateCookie,
} from './_oauth';

/**
 * Segon tram: bescanvia el codi de GitHub pel testimoni i el torna a Decap.
 *
 * L'intercanvi ha de passar per aquí i no pel navegador, perquè hi entra el
 * secret del client. El testimoni resultant no es desa a cap galeta ni a cap
 * registre: viu el temps d'un `postMessage` cap a la finestra que ha obert
 * l'autenticació, i d'allà l'administra Decap.
 *
 * Cada camí de sortida diu què ha passat. En una autenticació de finestra
 * emergent, la manera habitual de fallar és que no passi res de visible, i
 * aquesta és la que costa més d'endreçar.
 */
export const prerender = false;

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * Els refusos que GitHub documenta al primer tram, amb el text que en veu qui
 * edita. El `error_description` de l'adreça no surt mai a la pàgina: l'escriu
 * qui vulgui, i la pàgina és del nostre domini, de manera que un enllaç
 * `/api/callback/?error=x&error_description=…` hi posaria davant d'una persona
 * que edita la frase que li convingués (revisió de seguretat del 29/10/2026).
 */
const REFUSALS = new Map([
  ['access_denied', "Has refusat l'accés a GitHub."],
  ['application_suspended', "GitHub ha suspès l'aplicació OAuth del lloc."],
  [
    'redirect_uri_mismatch',
    "L'adreça de retorn no coincideix amb la de l'aplicació OAuth de GitHub: ha de ser exactament <domini>/api/callback/.",
  ],
]);

/**
 * Estat de les pàgines d'error quan GitHub no respon bé a l'intercanvi. No és el
 * 502 que semblaria natural: davant de `miquel.clm.cat` hi ha Cloudflare, que
 * substitueix per la seva pàgina qualsevol 502 o 504 de l'origen. La finestra
 * emergent no rebia la nostra, no executava l'encaixada i Decap no sabia què
 * havia passat, que és justament el que aquest fitxer vol evitar. Es va veure en
 * viu el 29/10/2026 amb un codi fals i l'estat bo: la resposta tornava amb
 * `Server: cloudflare`, sense `x-vercel-id` i amb el cos «error code: 502».
 * Un 4xx no l'intercepta; el 424 (Failed Dependency) és el que més s'acosta al
 * que ha passat.
 */
const UPSTREAM_FAILED = 424;

export const GET: APIRoute = async ({ cookies, site, url }) => {
  // Es llegeix abans d'esborrar-la: la galeta d'estat és d'un sol ús, i tant hi
  // val si el que ve després acaba bé o mal.
  const { name, secure } = stateCookie(url);
  const expected = cookies.get(name)?.value;
  cookies.delete(name, { path: '/', secure });

  // Abans de la primera sortida per `authError`: la pàgina de tancament ha de
  // saber a quin origen pot lliurar el resultat, i sense domini no en té cap.
  if (!site) return plainText('Configuració incompleta: el lloc no té domini.', 500);

  const refusal = url.searchParams.get('error');
  if (refusal !== null) return authError(REFUSALS.get(refusal) ?? "GitHub ha refusat l'autenticació.", site);

  const code = url.searchParams.get('code');
  if (!code) return authError('GitHub no ha tornat cap codi.', site);

  if (!expected) {
    return authError(
      "L'estat de la sessió no ha tornat. Cal obrir l'administració des del domini canònic del lloc, que és el que rep el retorn de GitHub.",
      site,
    );
  }
  if (url.searchParams.get('state') !== expected) {
    return authError("L'estat no coincideix: aquesta autenticació no ha començat aquí.", site);
  }

  const clientId = readEnv('GITHUB_OAUTH_ID');
  if (!clientId) return missingEnv('GITHUB_OAUTH_ID');
  const clientSecret = readEnv('GITHUB_OAUTH_SECRET');
  if (!clientSecret) return missingEnv('GITHUB_OAUTH_SECRET');

  let payload: TokenResponse;
  let status = 0;
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        // El mateix valor que al primer tram: GitHub el compara.
        redirect_uri: new URL(CALLBACK_PATH, site).href,
      }),
    });
    status = response.status;
    payload = (await response.json()) as TokenResponse;
  } catch {
    return authError("No s'ha pogut parlar amb GitHub per bescanviar el codi.", site, UPSTREAM_FAILED);
  }

  if (!payload.access_token) {
    // GitHub respon 200 amb un cos d'error: sense aquesta comprovació,
    // l'absència de testimoni passaria per èxit. El codi de resposta entra al
    // missatge de reserva perquè un cos inesperat no deixi l'error sense pistes.
    return authError(
      payload.error_description ??
        payload.error ??
        `GitHub no ha tornat cap testimoni (resposta ${status}).`,
      site,
      UPSTREAM_FAILED,
    );
  }

  return authSuccess(payload.access_token, site);
};
