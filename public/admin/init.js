// Arrencada de Decap amb els dos orígens que la pàgina posa a l'element arrel
// (`data-base-url`, `data-site-url`). Vegeu `src/pages/admin/index.astro`. És un
// fitxer i no un guió en línia per la CSP de `/admin/` (vercel.json): sense
// `'unsafe-inline'` a `script-src`, i un hash no valdria perquè els valors
// canvien amb `SITE_URL`.
(function () {
  if (!window.CMS) return;
  // El text d'espera diu «no s'ha pogut baixar el paquet», i aquest camí és
  // justament el que demostra que sí que s'ha baixat: si es quedés a la pàgina,
  // quedaria per damunt de l'administració contradient-la.
  var fallback = document.querySelector('.fallback');
  if (fallback) fallback.remove();
  var data = document.documentElement.dataset;
  var config = { backend: { base_url: data.baseUrl } };
  // `site_url` només si el lloc té domini: buit, Decap enllaçaria a res.
  if (data.siteUrl) {
    config.site_url = data.siteUrl;
    config.display_url = data.siteUrl;
  }
  window.CMS.init({ config: config });
})();
