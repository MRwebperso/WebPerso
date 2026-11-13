import type { APIRoute } from 'astro';
import { CALLBACK_PATH, CMS, missingEnv, readEnv, stateCookie } from './_oauth';

/**
 * Primer tram de l'autenticació del CMS: encamina cap a GitHub.
 *
 * Aquesta ruta i `callback.ts` són les dues úniques del lloc que s'executen a
 * petició. Tota la resta continua pregenerada.
 *
 * El `redirect_uri` es construeix damunt de `CMS`, l'origen de l'administració
 * (`cmsUrl` de `src/config/site.mjs`), i no damunt de l'amfitrió de la petició
 * ni del domini públic. Així el retorn i la galeta d'estat cauen sempre a
 * l'origen de l'administració, i la conseqüència, que és volguda, és que
 * l'adreça de retorn registrada a l'aplicació OAuth de GitHub ha de ser
 * exactament `<cmsUrl>/api/callback/`. Si es canvia l'origen, es mouen les dues
 * alhora. Aquesta ruta només es serveix a aquell origen: `vercel.json` redirigeix
 * `/api/` del domini públic cap allà.
 */
export const prerender = false;

export const GET: APIRoute = ({ cookies, url }) => {
  const clientId = readEnv('GITHUB_OAUTH_ID');
  if (!clientId) return missingEnv('GITHUB_OAUTH_ID');

  // Estat d'un sol ús contra la falsificació de peticions: es desa en galeta i
  // el segon tram comprova que el que torna GitHub sigui el mateix. `lax` és el
  // que fa que la galeta torni en un salt de navegació des d'un altre lloc;
  // `secure` i el nom (amb o sense `__Host-`) surten de l'esquema perquè en
  // desenvolupament, sobre http, el navegador ni tan sols la desaria.
  const state = crypto.randomUUID();
  const { name, secure } = stateCookie(url);
  cookies.set(name, state, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 600,
  });

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', new URL(CALLBACK_PATH, CMS).href);
  // `public_repo` és l'abast més estret amb què Decap pot escriure a un dipòsit
  // públic, i per això és el per omissió (revisió de seguretat del 29/10/2026).
  // Preu assumit: amb un dipòsit privat cal posar `repo` per variable, i sense
  // fer-ho GitHub rebutja l'escriptura.
  authorize.searchParams.set('scope', readEnv('GITHUB_OAUTH_SCOPE') ?? 'public_repo');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: { Location: authorize.href, 'Cache-Control': 'no-store' },
  });
};
