// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { siteUrl } from './src/config/site.mjs';

export default defineConfig({
  // Únic punt del projecte que coneix el domini. Ve de src/config/site.mjs.
  site: siteUrl,
  /*
   * `output: 'static'` (el valor per omissió) es manté: cada pàgina del lloc es
   * pregenera igual que abans i la compilació no en fa cap a petició.
   *
   * L'adaptador, en canvi, és nou i canvia la naturalesa del desplegament: la
   * compilació ja no deixa un `dist/` d'HTML pla sinó un `.vercel/output/` amb
   * els actius estàtics i les funcions. Hi és per una sola raó, i és l'única
   * part del lloc que no pot ser estàtica: les dues rutes d'`src/pages/api/`
   * que autentiquen el CMS contra GitHub, que porten `prerender = false` i són
   * les úniques que s'executen a petició. Si algun dia el CMS surt del projecte,
   * treure l'adaptador i les dues rutes torna el lloc a estàtic pur.
   *
   * Conseqüència a vigilar a Vercel: el directori de sortida el detecta el
   * preajust d'Astro. Si al projecte hi hagués un «Output Directory» fixat a
   * `dist` a mà, el desplegament quedaria buit i sense error visible.
   */
  adapter: vercel(),
  trailingSlash: 'always',
  // Només afecta `astro dev`: permet obrir el servidor de desenvolupament en un
  // port lliure quan el 4321 ja està ocupat. No té cap efecte a la compilació.
  server: { port: Number(process.env.PORT) || 4321 },
  build: { format: 'directory' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  i18n: {
    locales: ['ca', 'fr'],
    defaultLocale: 'ca',
    routing: {
      // Paritat estricta: cap llengua no té prefix privilegiat.
      prefixDefaultLocale: true,
      // L'arrel la serveix src/pages/index.astro (tria de llengua), no Astro.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      /*
       * Dues famílies de rutes en queden fora, per raons diferents.
       *
       * L'administració del CMS és una pàgina pregenerada com les altres, i
       * sense filtre entraria al sitemap. Les rutes d'`src/pages/api/` no hi
       * entren mai —no són pregenerades—, i el `robots.txt` exclou totes dues.
       *
       * Els prototips llençables porten `noindex` a la pàgina i per tant no
       * s'indexarien igualment, però anunciar-los al sitemap és contradir-se:
       * el sitemap declara quines són les pàgines del lloc, i ells no ho són.
       * Quan s'esborrin, aquesta llista se'n va amb ells.
       */
      filter: (page) => {
        const { pathname } = new URL(page);
        const prototips = ['/hero-demo/', '/la-travessa/', '/la-ruta/'];
        return !pathname.startsWith('/admin') && !prototips.includes(pathname);
      },
      i18n: {
        defaultLocale: 'ca',
        locales: { ca: 'ca-ES', fr: 'fr-FR' },
      },
    }),
  ],
});
