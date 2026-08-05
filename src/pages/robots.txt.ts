import type { APIRoute } from 'astro';

/**
 * Generat, no escrit a mà: el sitemap ha de seguir el domini de la config.
 *
 * Les dues exclusions són del bloc 9. `/admin/` és la pantalla del CMS, que és
 * HTML pla a `public/` i no passa per `BaseLayout`, de manera que la propietat
 * `noindex` de la plantilla no l'abasta; i `/api/` són les rutes d'autenticació,
 * que no són pàgines. Cap de les dues no surt al sitemap —el sitemap només
 * recull pàgines, i aquestes no ho són—, però un fitxer estàtic a `public/` es
 * pot trobar per enllaç, i el que no s'ha d'indexar val més dir-ho dues vegades.
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
