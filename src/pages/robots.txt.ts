import type { APIRoute } from 'astro';

/**
 * Generat, no escrit a mà: el sitemap ha de seguir el domini de la config.
 *
 * Fins al 13/11/2026 excloïa `/admin/` i `/api/`, la pantalla i les rutes
 * d'autenticació del CMS. El CMS ja no existeix (vegeu el README, «Contingut
 * dels casos»), i el lloc no té cap camí que calgui amagar.
 */
export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${new URL('sitemap-index.xml', site)}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
