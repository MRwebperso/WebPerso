// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
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
  /*
   * Cap pàgina no passa per `astro:assets` (cap `<Image>`, cap `getImage`): les
   * imatges són a `public/` i es serveixen tal com són. Amb el servei per
   * omissió, l'adaptador però empaqueta `sharp` a la funció —un binari natiu de
   * 21,8 MB amb els seus `@img/*`— i deixa `/_image/` a l'abast de tothom, i els
   * avisos d'`npm audit` per `sharp` i per la ruta d'imatges (un d'ells crític)
   * apunten justament aquí. Amb el servei de pas, `sharp` surt de la funció i
   * l'endpoint no té res a processar (29/10/2026; compilació mesurada abans i
   * després, el lloc surt idèntic: `verify` passa amb els 727 enllaços).
   * Preu assumit: el dia que algú faci servir `<Image>`, les imatges sortiran
   * sense optimitzar, sense cap error. Si cal, es treu aquesta línia i es torna
   * a mirar l'estat de l'advisory de `sharp`.
   */
  image: { service: passthroughImageService() },
  trailingSlash: 'always',
  // Només afecta `astro dev`: permet obrir el servidor de desenvolupament en un
  // port lliure quan el 4321 ja està ocupat. No té cap efecte a la compilació.
  server: { port: Number(process.env.PORT) || 4321 },
  /*
   * Decisió de Miquel (8/10/2026): amb `'auto'` Astro triava per mida quin CSS
   * anava en línia, i un component nou va canviar el repartiment de les pàgines
   * de cas. Amb `'never'` no es mou i els fulls es queden en memòria cau entre
   * navegacions; a canvi, unes quantes peticions més a la primera càrrega.
   */
  build: { format: 'directory', inlineStylesheets: 'never' },
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
