/*
 * Utilitats dels scripts de `scripts/verify/`.
 *
 * No és un marc de proves (decisió de Miquel, 21/10/2026): són comprovacions
 * de contractes que ni `astro check` ni `astro build` no veuen, escrites en
 * Node pla. Les úniques dependències són `esbuild` (per carregar els mòduls
 * TypeScript que Node no pot, vegeu `bundle`) i `js-yaml` (per llegir la
 * configuració del CMS), totes dues a `devDependencies` des del 21/10/2026.
 * Cada fitxer de comprovació exporta
 * una funció que rep un `t` i hi apunta les afirmacions; `run.mjs` les passa
 * totes i surt amb codi 1 si en falla cap.
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const fromRoot = (...parts) => path.join(root, ...parts);

/** Recull d'afirmacions d'una comprovació. */
export class Tally {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failures = [];
    this.notes = [];
  }
  ok(cond, message) {
    if (cond) this.passed++;
    else this.failures.push(message);
    return cond;
  }
  equal(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    return this.ok(a === e, `${message}\n      esperat: ${e}\n      obtingut: ${a}`);
  }
  note(message) {
    this.notes.push(message);
  }
}

const nodeRequire = createRequire(import.meta.url);

/**
 * El directori d'Astro, després d'haver comprovat que el `zod` que veu és
 * resoluble des d'allà. La resolució de debò la fa esbuild (amb la condició
 * `import`, que és la que ja feia servir l'antic camí a `index.js`); el
 * `resolve` de Node només hi és perquè l'error sigui un que digui què falta, en
 * lloc del «Could not resolve» d'esbuild enmig d'un paquet.
 */
function astroDir() {
  const astroPkg = nodeRequire.resolve('astro/package.json');
  try {
    createRequire(astroPkg).resolve('zod/package.json');
  } catch {
    throw new Error(`no es troba cap \`zod\` des d'Astro (${path.dirname(astroPkg)}): sense ell no es poden carregar els esquemes de col·lecció`);
  }
  return path.dirname(astroPkg);
}

/*
 * Els mòduls nous (`lang-keys.ts`, `timeline-instrument.ts`…) es carreguen tal
 * qual amb `import`: Node 24 esborra els tipus, i les seves importacions de
 * valor porten l'extensió `.ts`. Els antics, en canvi, importen sense extensió
 * (`timeline.ts` → `../i18n/ui`) o porten mòduls virtuals d'Astro
 * (`cases.ts` → `astro:content`), i aquests passen per esbuild, que és a
 * `devDependencies` (abans només hi era perquè Astro se'l porta). Els mòduls
 * virtuals es substitueixen per l'imprescindible perquè el fitxer es pugui
 * avaluar.
 */
const astroStubs = {
  name: 'astro-stubs',
  setup(b) {
    b.onResolve({ filter: /^astro:content$|^astro\/loaders$/ }, (args) => ({ path: args.path, namespace: 'astro-stub' }));
    b.onLoad({ filter: /.*/, namespace: 'astro-stub' }, (args) => {
      if (args.path === 'astro/loaders') return { contents: 'export const glob = (options) => ({ options });', loader: 'js' };
      // La `z` d'Astro és la seva zod 3, la mateixa que valida els fitxers
      // (vegeu la capçalera de `src/content.config.ts`). Es resol des del
      // directori d'Astro i no des de `node_modules/astro/node_modules/zod`:
      // npm la deixa niada només si el `zod` del dipòsit no la pot compartir,
      // i el camí escrit a mà es trencava el dia que la hissés (21/10/2026).
      return {
        contents: `export { z } from 'zod';
          export const defineCollection = (collection) => collection;
          export const getCollection = async () => [];`,
        loader: 'js',
        resolveDir: astroDir(),
      };
    });
  },
};

export async function bundle(entry) {
  const result = await build({
    entryPoints: [fromRoot(entry)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    plugins: [astroStubs],
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

/*
 * La sortida compilada (`.vercel/output/static`) que llegeixen `links.mjs` i
 * `build.mjs`. Fins al 21/10/2026 cada una ho resolia pel seu compte, i cap de
 * les dues no mirava si la sortida era de la mateixa feina que els fonts: amb un
 * `npm run build` oblidat, `verify` donava per bo un lloc que ja no existia. Ara
 * ho resol un sol lloc, i en vermell si la sortida falta o és més vella que el
 * fitxer més nou de `src/`, `public/`, `astro.config.mjs` o `package.json`.
 *
 * L'edat de la sortida és la de la pàgina HTML més vella que la compilació
 * ha generat, i no la del directori ni la del fitxer més nou. L'adaptador
 * copia `public/` conservant les dates (el `favicon.svg` de la sortida és de
 * juliol), de manera que qualsevol fitxer copiat faria semblar vella una
 * sortida acabada de fer: això val també per als `.html` de `public/` (un
 * `googleXXXX.html` de Search Console), que per això no compten; les pàgines
 * generades, en canvi, s'escriuen a cada compilació. El preu és que un fitxer
 * editat mentre la compilació encara escriu pàgines també salta com a vell:
 * s'assumeix, perquè aquesta sortida és justament la dubtosa.
 *
 * Els directoris compten com a fonts (21/10/2026): esborrar o reanomenar un
 * fitxer no toca la data de cap dels que queden, i sense la del directori una
 * pàgina o un cas esborrats deixaven la sortida per fresca.
 */
const SOURCES = ['src', 'public', 'astro.config.mjs', 'package.json'];

/** El fitxer o directori amb la data de modificació més recent de `SOURCES`. */
function newestSource() {
  let newest = { file: null, mtimeMs: 0, dir: false };
  const visit = (p) => {
    const stat = fs.statSync(p);
    if (stat.mtimeMs > newest.mtimeMs) newest = { file: p, mtimeMs: stat.mtimeMs, dir: stat.isDirectory() };
    if (stat.isDirectory()) for (const name of fs.readdirSync(p)) visit(path.join(p, name));
  };
  for (const source of SOURCES) if (fs.existsSync(fromRoot(source))) visit(fromRoot(source));
  return newest;
}

/** Camins (relatius, amb `/`) dels `.html` de sota `dir`, en l'ordre del sistema de fitxers. */
function htmlFiles(dir, base = dir, found = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, base, found);
    else if (e.name.endsWith('.html')) found.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return found;
}

/**
 * La sortida compilada, o `null` (i un error apuntat a `t`) si falta o és vella.
 *
 * - `out`: el directori de la sortida.
 * - `pages`: tots els `.html`, com a camins relatius (`ca/index.html`). Inclou
 *   la 404 i els prototips, que el sitemap no porta.
 * - `sitemap`: els camins de lloc (`/ca/`) que diu el sitemap, que ja deixa fora
 *   els prototips (vegeu `astro.config.mjs`). Són dues llistes i no una perquè
 *   responen a preguntes diferents: `links` vol tot el que es pot servir,
 *   `build` només les pàgines del lloc.
 * - `origin`: l'origen (`https://domini`) que declara el sitemap, o `null` si en
 *   surt buit. És el de la compilació i no el de `siteUrl`, que es llegeix a
 *   l'entorn del moment de verificar: una sortida feta amb un altre `SITE_URL`
 *   (el de Vercel, una variable exportada) en faria caure cada canonical sense
 *   cap causa a la vista (21/10/2026).
 * - `read(rel)`: el contingut en utf8 d'un fitxer de la sortida, pel camí
 *   relatiu. Es llegeix una sola vegada per procés.
 *
 * Es calcula un sol cop per procés i es comparteix entre `links` i `build`, que
 * abans cada una tornava a recórrer `src/`, la sortida i el sitemap. Una sortida
 * vella o absent no es guarda: cada comprovació en torna a apuntar l'error al
 * seu `t`.
 */
let compiled = null;

export function compiledSite(t) {
  if (compiled) return compiled;

  const out = fromRoot('.vercel/output/static');
  if (!t.ok(fs.existsSync(out), 'hi ha sortida compilada a .vercel/output/static: cal `npm run build`')) return null;

  const pages = htmlFiles(out);
  // Només les pàgines que ha generat la compilació: les de `public/` es copien amb la data d'origen.
  const generated = pages.filter((rel) => !fs.existsSync(fromRoot('public', rel)));
  if (!t.ok(generated.length > 0, 'la sortida compilada porta pàgines HTML generades: cal `npm run build`')) return null;

  const builtAt = Math.min(...generated.map((rel) => fs.statSync(path.join(out, rel)).mtimeMs));
  const newest = newestSource();
  const fresh = newest.mtimeMs <= builtAt;
  const stamp = (ms) => new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
  const message = fresh
    ? ''
    : `la sortida compilada és més vella que ${path.relative(root, newest.file).split(path.sep).join('/')}${newest.dir ? '/ (s\'hi ha afegit, tret o reanomenat un fitxer)' : ''} ` +
      `(${stamp(newest.mtimeMs)} contra ${stamp(builtAt)} UTC): cal \`npm run build\``;
  if (!t.ok(fresh, message)) return null;

  const files = new Map();
  const read = (rel) => {
    if (!files.has(rel)) files.set(rel, fs.readFileSync(path.join(out, rel), 'utf8'));
    return files.get(rel);
  };
  const locs = fs
    .readdirSync(out)
    .filter((n) => /^sitemap-\d+\.xml$/.test(n))
    .flatMap((n) => [...read(n).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1])));
  const sitemap = locs.map((url) => decodeURIComponent(url.pathname));
  compiled = { out, pages, sitemap, origin: locs[0]?.origin ?? null, read };
  return compiled;
}

/**
 * Els fitxers de `src/content/cases/`: l'`id` (el nom sense extensió, com el
 * posa el carregador d'Astro) i el JSON tal com és, sense passar per l'esquema.
 * Un sol lloc per a `build` i `cases`, perquè no examinin conjunts diferents si
 * el carregador d'`src/content.config.ts` canvia de glob.
 */
export function caseFiles() {
  const dir = fromRoot('src/content/cases');
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .map((n) => ({ id: path.basename(n, '.json'), raw: JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')) }));
}
