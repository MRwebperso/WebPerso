// Arrencada manual de Decap: ha de córrer abans del paquet. Vegeu
// `src/pages/admin/index.astro`. És un fitxer i no un guió en línia perquè la
// CSP de `/admin/` (vercel.json) no admet `'unsafe-inline'` a `script-src`.
window.CMS_MANUAL_INIT = true;
