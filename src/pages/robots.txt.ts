import type { APIRoute } from 'astro';

/**
 * Generat, no escrit a mà: el sitemap ha de seguir el domini de la config.
 *
 * Les dues exclusions són del bloc 9. `/admin/` és la pantalla del CMS, una
 * pàgina d'Astro que no passa per `BaseLayout`, de manera que la propietat
 * `noindex` de la plantilla no l'abasta; i `/api/` són les rutes d'autenticació,
 * que no són pàgines. Cap de les dues no surt al sitemap —l'admin perquè un
 * filtre de la config l'en treu, l'api perquè no és pregenerada—, però una
 * pàgina generada es pot trobar per enllaç, i el que no s'ha d'indexar val
 * més dir-ho dues vegades.
 */
export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Disallow: /admin/',
      'Disallow: /api/',
      'Allow: /',
      '',
      `Sitemap: ${new URL('sitemap-index.xml', site)}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
