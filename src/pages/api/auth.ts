import type { APIRoute } from 'astro';
import { CALLBACK_PATH, missingEnv, plainText, readEnv, STATE_COOKIE } from './_oauth';

/**
 * Primer tram de l'autenticació del CMS: encamina cap a GitHub.
 *
 * Aquesta ruta i `callback.ts` són les dues úniques del lloc que s'executen a
 * petició. Tota la resta continua pregenerada.
 *
 * El `redirect_uri` es construeix damunt d'`Astro.site`, que ve de la línia
 * `siteUrl` de `src/config/site.mjs` —el punt únic que coneix el domini—, i no
 * damunt de l'amfitrió de la petició. Així el retorn i la galeta d'estat cauen
 * sempre al mateix origen, i la conseqüència, que és volguda, és que l'adreça de
 * retorn registrada a l'aplicació OAuth de GitHub ha de ser exactament
 * `<domini>/api/callback/`. Si es canvia de domini, es mouen les dues alhora.
 */
export const prerender = false;

export const GET: APIRoute = ({ cookies, site, url }) => {
  const clientId = readEnv('GITHUB_OAUTH_ID');
  if (!clientId) return missingEnv('GITHUB_OAUTH_ID');

  if (!site) {
    return plainText(
      "Configuració incompleta: el lloc no té domini. Ve de `siteUrl` a src/config/site.mjs o de la variable d'entorn SITE_URL.",
      500,
    );
  }

  // Estat d'un sol ús contra la falsificació de peticions: es desa en galeta i
  // el segon tram comprova que el que torna GitHub sigui el mateix. `lax` és el
  // que fa que la galeta torni en un salt de navegació des d'un altre lloc;
  // `secure` es condiciona a l'esquema perquè en desenvolupament, sobre http,
  // el navegador ni tan sols la desaria.
  const state = crypto.randomUUID();
  cookies.set(STATE_COOKIE, state, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    maxAge: 600,
  });

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', new URL(CALLBACK_PATH, site).href);
  // `repo` és el que necessita Decap per escriure a un dipòsit privat. Si el
  // dipòsit és públic, `public_repo` és més estret i es posa per variable.
  authorize.searchParams.set('scope', readEnv('GITHUB_OAUTH_SCOPE') ?? 'repo');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: { Location: authorize.href, 'Cache-Control': 'no-store' },
  });
};
