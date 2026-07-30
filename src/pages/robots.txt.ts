import type { APIRoute } from 'astro';

/** Generat, no escrit a mà: el sitemap ha de seguir el domini de la config. */
export const GET: APIRoute = ({ site }) =>
  new Response(
    ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('sitemap-index.xml', site)}`, ''].join(
      '\n',
    ),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
