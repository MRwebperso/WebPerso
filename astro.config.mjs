// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteUrl } from './src/config/site.mjs';

export default defineConfig({
  // Únic punt del projecte que coneix el domini. Ve de src/config/site.mjs.
  site: siteUrl,
  /*
   * Estàtic pur, sense adaptador, des del 13/11/2026. Entre el 05/08 i el
   * 13/11/2026 hi va haver `@astrojs/vercel` per una sola raó: les dues rutes a
   * petició que autenticaven el CMS contra GitHub. El CMS va sortir del
   * projecte sense haver-se fet servir, i amb ell l'adaptador. La compilació
   * torna a deixar un `dist/` d'HTML pla, i el que l'adaptador feia a
   * l'encaminament (barra final, memòria cau de `/_astro/`) és ara a
   * `vercel.json`, on `npm run verify` (`headers`) ho vigila.
   */
  /*
   * Cap pàgina no passa per `astro:assets` (cap `<Image>`, cap `getImage`): les
   * imatges són a `public/` i es serveixen tal com són. El servei de pas es va
   * posar el 29/10/2026 per treure `sharp` de la funció de l'adaptador; sense
   * adaptador ja no hi ha funció, i es manté perquè la compilació tampoc no
   * necessiti `sharp`.
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
       * Els prototips llençables porten `noindex` a la pàgina i per tant no
       * s'indexarien igualment, però anunciar-los al sitemap és contradir-se:
       * el sitemap declara quines són les pàgines del lloc, i ells no ho són.
       * Quan s'esborrin, aquesta llista se'n va amb ells.
       */
      filter: (page) => {
        const { pathname } = new URL(page);
        const prototips = ['/hero-demo/', '/la-travessa/', '/la-ruta/'];
        return !prototips.includes(pathname);
      },
      i18n: {
        defaultLocale: 'ca',
        locales: { ca: 'ca-ES', fr: 'fr-FR' },
      },
    }),
  ],
});
