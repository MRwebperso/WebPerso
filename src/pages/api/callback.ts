import type { APIRoute } from 'astro';
import {
  authError,
  authSuccess,
  CALLBACK_PATH,
  missingEnv,
  plainText,
  readEnv,
  STATE_COOKIE,
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

export const GET: APIRoute = async ({ cookies, site, url }) => {
  // Es llegeix abans d'esborrar-la: la galeta d'estat és d'un sol ús, i tant hi
  // val si el que ve després acaba bé o mal.
  const expected = cookies.get(STATE_COOKIE)?.value;
  cookies.delete(STATE_COOKIE, { path: '/' });

  const refusal = url.searchParams.get('error_description') ?? url.searchParams.get('error');
  if (refusal) return authError(refusal);

  const code = url.searchParams.get('code');
  if (!code) return authError('GitHub no ha tornat cap codi.');

  if (!expected) {
    return authError(
      "L'estat de la sessió no ha tornat. Cal obrir l'administració des del domini canònic del lloc, que és el que rep el retorn de GitHub.",
    );
  }
  if (url.searchParams.get('state') !== expected) {
    return authError("L'estat no coincideix: aquesta autenticació no ha començat aquí.");
  }

  const clientId = readEnv('GITHUB_OAUTH_ID');
  if (!clientId) return missingEnv('GITHUB_OAUTH_ID');
  const clientSecret = readEnv('GITHUB_OAUTH_SECRET');
  if (!clientSecret) return missingEnv('GITHUB_OAUTH_SECRET');
  if (!site) return plainText('Configuració incompleta: el lloc no té domini.', 500);

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
    return authError("No s'ha pogut parlar amb GitHub per bescanviar el codi.", 502);
  }

  if (!payload.access_token) {
    // GitHub respon 200 amb un cos d'error: sense aquesta comprovació,
    // l'absència de testimoni passaria per èxit. El codi de resposta entra al
    // missatge de reserva perquè un cos inesperat no deixi l'error sense pistes.
    return authError(
      payload.error_description ??
        payload.error ??
        `GitHub no ha tornat cap testimoni (resposta ${status}).`,
      502,
    );
  }

  return authSuccess(payload.access_token);
};
