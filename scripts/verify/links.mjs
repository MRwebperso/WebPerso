/*
 * Enllaços i àncores, sobre la sortida de l'última compilació
 * (`.vercel/output/static`; cal `npm run build` abans).
 *
 * - Cada camí intern (`href` i `src` que comencen per `/`) existeix.
 * - Cada `#àncora` té un `id` a la pàgina on porta.
 * - Les dues portades tenen les seccions de `homeSections` en aquest ordre.
 *
 * Queden fora `/ruta/`, que `vercel.json` reescriu cap a un altre projecte, i
 * `/api/`, que són rutes a petició i no fitxers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fromRoot } from './lib.mjs';
import { homeSections } from '../../src/i18n/utils.ts';

const OUT = fromRoot('.vercel/output/static');
const OUTSIDE = [/^\/ruta\//, /^\/api\//];

/*
 * Enllaços trencats que ja hi eren quan es va escriure la comprovació
 * (21/10/2026) i que no s'han arreglat perquè canviar-los canvia l'HTML: queden
 * anotats, no amagats. Si un dia s'arreglen, la comprovació avisa que l'entrada
 * sobra.
 *
 * - El commutador de llengua de la pàgina d'error porta a `/fr/404/`, que no
 *   existeix: `getAlternates()` tradueix el camí `/404` com si fos una pàgina
 *   mirall, i la 404 és una de sola per a les dues llengües.
 */
const KNOWN = [{ page: '404.html', href: '/fr/404/' }];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** El fitxer que serveix un camí, com fa l'amfitrió estàtic. */
function fileFor(urlPath) {
  const clean = decodeURIComponent(urlPath);
  const candidate = path.join(OUT, clean);
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
  if (!t.ok(fs.existsSync(OUT), 'hi ha sortida compilada a .vercel/output/static (cal `npm run build` abans)')) return;

  const pages = walk(OUT);
  let checked = 0;
  const known = new Set();
  for (const page of pages) {
    const rel = path.relative(OUT, page).split(path.sep).join('/');
    const html = fs.readFileSync(page, 'utf8');
    // Sense el contingut dels <script>: hi ha selectors i plantilles, no enllaços.
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    for (const [, attr, value] of markup.matchAll(/\s(href|src)="([^"]*)"/g)) {
      const raw = value.replace(/&amp;/g, '&');
      if (!raw.startsWith('/') && !raw.startsWith('#')) continue;
      if (raw.startsWith('//')) continue;
      const [pathPart, fragment] = raw.split('#');
      const target = pathPart === '' ? page : pathPart.split('?')[0];
      if (target !== page && OUTSIDE.some((re) => re.test(target))) continue;
      const file = target === page ? page : fileFor(target);
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

  const order = Object.values(homeSections).map((s) => s.id);
  for (const lang of ['ca', 'fr']) {
    const file = path.join(OUT, lang, 'index.html');
    if (!t.ok(fs.existsSync(file), `hi ha portada ${lang}`)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const found = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    t.equal(found, order, `la portada ${lang} té les seccions de \`homeSections\` en el mateix ordre`);
  }
}
