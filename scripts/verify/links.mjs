/*
 * Enllaços i àncores, sobre la sortida de l'última compilació
 * (`.vercel/output/static`; cal `npm run build` abans, i `compiledSite` de
 * `lib.mjs` ho exigeix: en vermell si la sortida és més vella que els fonts).
 *
 * - Cada camí intern (`href` i `src` que comencen per `/`) existeix.
 * - Cada `#àncora` té un `id` a la pàgina on porta.
 * - Cada `<link rel="canonical">` i cada `<link rel="alternate" hreflang>` són
 *   URL absolutes del lloc (`siteUrl` de `src/config/site.mjs`) i porten a una
 *   pàgina que és a la sortida. Els de dalt no es veien: la comprovació de
 *   `href` només mira els camins que comencen per `/`, i aquestes són
 *   absolutes (la 404 en tenia tres a pàgines que no existeixen, i ningú no ho
 *   va veure fins que es va revisar a mà, 21/10/2026).
 * - Les dues portades tenen les seccions de `homeSections` en aquest ordre.
 *
 * Queden fora `/ruta/`, que `vercel.json` reescriu cap a un altre projecte, i
 * `/api/`, que són rutes a petició i no fitxers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { compiledSite } from './lib.mjs';
import { siteUrl } from '../../src/config/site.mjs';
import { homeSections } from '../../src/i18n/utils.ts';

const OUTSIDE = [/^\/ruta\//, /^\/api\//];

/*
 * Enllaços trencats que ja hi eren quan es va escriure la comprovació
 * (21/10/2026) i que no s'han arreglat perquè canviar-los canvia l'HTML: queden
 * anotats, no amagats. Si un dia s'arreglen, la comprovació avisa que l'entrada
 * sobra. Ara és buit: l'únic que hi havia, el commutador de llengua de la 404
 * cap a `/fr/404/`, es va arreglar el mateix dia (la 404 no té mirall, vegeu
 * `noMirror` a `BaseLayout.astro`).
 */
const KNOWN = [];

/** El fitxer que serveix un camí, com fa l'amfitrió estàtic. */
function fileFor(out, urlPath) {
  const clean = decodeURIComponent(urlPath);
  const candidate = path.join(out, clean);
  if (clean.endsWith('/')) return path.join(candidate, 'index.html');
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  return null;
}

const idsCache = new Map();
function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
}

export default async function links(t) {
  const site = compiledSite(t);
  if (!site) return;
  const { out, pages } = site;

  let checked = 0;
  const known = new Set();
  for (const rel of pages) {
    const page = path.join(out, rel);
    const html = site.read(rel);
    // Sense el contingut dels <script>: hi ha selectors i plantilles, no enllaços.
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    for (const [, attr, value] of markup.matchAll(/\s(href|src)="([^"]*)"/g)) {
      const raw = value.replace(/&amp;/g, '&');
      if (!raw.startsWith('/') && !raw.startsWith('#')) continue;
      if (raw.startsWith('//')) continue;
      const [pathPart, fragment] = raw.split('#');
      const target = pathPart === '' ? page : pathPart.split('?')[0];
      if (target !== page && OUTSIDE.some((re) => re.test(target))) continue;
      const file = target === page ? page : fileFor(out, target);
      checked++;
      const exists = file !== null && fs.existsSync(file);
      if (!exists && KNOWN.some((k) => k.page === rel && k.href === raw)) {
        known.add(`${rel} ${raw}`);
        continue;
      }
      if (!t.ok(exists, `${rel}: ${attr}="${raw}" no porta enlloc`)) continue;
      if (fragment !== undefined && fragment !== '') {
        t.ok(idsOf(file).has(decodeURIComponent(fragment)), `${rel}: ${attr}="${raw}" porta a una àncora que no existeix`);
      }
    }
  }
  t.note(`${checked} enllaços interns a ${pages.length} pàgines`);
  for (const k of KNOWN) {
    const key = `${k.page} ${k.href}`;
    if (t.ok(known.has(key), `l'enllaç trencat conegut «${key}» ja no hi és: traieu-lo de KNOWN`)) {
      t.note(`trencat i conegut: ${key} (vegeu KNOWN)`);
    }
  }

  // ── canonical i hreflang: URL absolutes, cap a una pàgina que existeixi ──
  // Es mira el `<head>` tal com surt: una etiqueta per cop, amb els atributs en
  // qualsevol ordre. L'origen ha de ser el del lloc: un canonical cap a un altre
  // domini no és «una pàgina que no existeix», és pitjor, i també salta aquí.
  const origin = new URL(siteUrl).origin;
  const attrOf = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
  let declared = 0;
  for (const rel of pages) {
    const markup = site.read(rel).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    for (const [tag] of markup.matchAll(/<link\b[^>]*>/g)) {
      const kind = attrOf(tag, 'rel');
      const hreflang = attrOf(tag, 'hreflang');
      const label = kind === 'canonical' ? 'canonical' : kind === 'alternate' && hreflang !== undefined ? `hreflang="${hreflang}"` : null;
      if (label === null) continue;
      declared++;
      const href = (attrOf(tag, 'href') ?? '').replace(/&amp;/g, '&');
      let url = null;
      try {
        url = new URL(href);
      } catch {
        // href buit, relatiu o malformat: es dona per fallit més avall
      }
      if (!t.ok(url !== null && url.origin === origin, `${rel}: ${label} «${href}» no és una URL absoluta de ${origin}`)) continue;
      const file = fileFor(out, url.pathname);
      t.ok(file !== null && fs.existsSync(file), `${rel}: ${label} «${href}» no porta a cap pàgina de la sortida`);
    }
  }
  t.ok(declared > 0, 'la sortida declara canonical i hreflang: si en surten 0, l\'expressió ja no troba res');
  t.note(`${declared} canonical i hreflang a ${pages.length} pàgines`);

  const order = Object.values(homeSections).map((s) => s.id);
  for (const lang of ['ca', 'fr']) {
    const file = `${lang}/index.html`;
    if (!t.ok(pages.includes(file), `hi ha portada ${lang}`)) continue;
    const html = site.read(file);
    const found = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    t.equal(found, order, `la portada ${lang} té les seccions de \`homeSections\` en el mateix ordre`);
  }
}
