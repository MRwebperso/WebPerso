// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteUrl } from './src/config/site.mjs';

export default defineConfig({
  // Únic punt del projecte que coneix el domini. Ve de src/config/site.mjs.
  site: siteUrl,
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
      i18n: {
        defaultLocale: 'ca',
        locales: { ca: 'ca-ES', fr: 'fr-FR' },
      },
    }),
  ],
});
