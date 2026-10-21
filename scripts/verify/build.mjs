/*
 * El JS de client, sobre la sortida de l'última compilació
 * (`.vercel/output/static`; cal `npm run build` abans). Dos invariants que fins
 * al 21/10/2026 només guardava la convenció, i que cap tipus ni cap esquema no
 * veu:
 *
 * - Cap tros de client compartit. Els guions de la portada i dels casos van en
 *   línia a l'HTML, i ho poden fer perquè cada mòdul que importen
 *   (`timeline-instrument.ts`, `offer-handle.ts`, `src/i18n/utils.ts`) només
 *   l'importa un guió. Si un segon guió n'importa un, Vite el treu a un fitxer
 *   a part, Astro ja no pot posar en línia cap dels dos, i la pàgina passa a
 *   demanar `<script type="module" src>` per a cada un. Comprovat sobre la
 *   sortida d'abans dels mòduls i sobre la d'ara (21/10/2026): les pàgines del
 *   lloc només demanen a `/_astro/` els dos guions d'Astro (`ClientRouter…` i
 *   `page`), i cap guió en línia no hi importa res.
 * - Cap text de la còpia al JS de client. Frases de la cronologia i dels casos,
 *   llegides de les dades en el moment de comprovar, no hi poden sortir: ni als
 *   guions en línia ni als fitxers de `/_astro/` que les pàgines carreguen. Que
 *   hi surtin vol dir que un guió ha importat un valor de `timeline.ts`, de
 *   `ui.ts` o d'un cas, i que el text de les dues llengües viatja dins el JS.
 *
 * «Les pàgines del lloc» són les del sitemap, que ja deixa fora els prototips
 * (vegeu `astro.config.mjs`). Els prototips en queden fora a posta: importen
 * `timeline.ts` al client i comparteixen un tros entre ells, la còpia inclosa,
 * i no tenen la paritat ni les regles del lloc fins que s'esborrin.
 */
import fs from 'node:fs';
import path from 'node:path';
import { bundle, fromRoot } from './lib.mjs';

const OUT = fromRoot('.vercel/output/static');

/** Els dos guions que Astro mateix serveix des de `/_astro/`, sense el hash. */
const ASTRO_OWN = ['ClientRouter.astro_astro_type_script_index_0_lang', 'page'];

const unhash = (file) => file.replace(/\.[\w-]{8}\.js$/, '');

/** Els guions JS de l'HTML: els en línia (`type` absent o `module`) i els `src` de `/_astro/`. */
function scriptsOf(html) {
  const inline = [];
  const external = [];
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const type = /\btype="([^"]*)"/.exec(attrs)?.[1];
    if (type !== undefined && type !== 'module') continue;
    const src = /\bsrc="([^"]*)"/.exec(attrs)?.[1];
    if (src === undefined) inline.push(body);
    else if (src.startsWith('/_astro/')) external.push(src.slice('/_astro/'.length));
  }
  return { inline, external };
}

/** Els fitxers de `/_astro/` que arrossega un guió, seguint-ne les importacions relatives. */
function closure(files) {
  const seen = new Set();
  const queue = [...files];
  while (queue.length) {
    const file = queue.pop();
    // Un `src` que no porta enlloc ja el diu `links.mjs`.
    if (seen.has(file) || !fs.existsSync(path.join(OUT, '_astro', file))) continue;
    seen.add(file);
    const code = fs.readFileSync(path.join(OUT, '_astro', file), 'utf8');
    for (const m of code.matchAll(/(?:from|import)\s*\(?\s*["']\.\/([^"']+\.js)["']/g)) queue.push(m[1]);
  }
  return seen;
}

/** El tros ASCII més llarg d'una frase: cap escapament de JS ni d'HTML no el pot amagar. */
const fragmentOf = (text) =>
  text
    .split(/[^A-Za-z0-9 ,]+/)
    .map((s) => s.trim())
    .reduce((a, b) => (b.length > a.length ? b : a), '');

export default async function build(t) {
  if (!t.ok(fs.existsSync(OUT), 'hi ha sortida compilada a .vercel/output/static (cal `npm run build` abans)')) return;

  const sitemaps = fs.readdirSync(OUT).filter((n) => /^sitemap-\d+\.xml$/.test(n));
  const pages = sitemaps.flatMap((n) =>
    [...fs.readFileSync(path.join(OUT, n), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURIComponent(new URL(m[1]).pathname)),
  );
  if (!t.ok(pages.length > 0, 'el sitemap porta pàgines')) return;

  // ── Cap tros de client compartit ──
  const inline = [];
  const loaded = [];
  const htmlText = [];
  for (const page of pages) {
    const file = path.join(OUT, page, 'index.html');
    if (!t.ok(fs.existsSync(file), `la pàgina del sitemap ${page} existeix`)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const scripts = scriptsOf(html);
    // L'arrel (`/`, la tria de llengua) només porta `page`; la resta, tots dos.
    t.equal(
      scripts.external.map(unhash).filter((name) => !ASTRO_OWN.includes(name)),
      [],
      `${page}: de /_astro/ només es demanen els guions d'Astro; un altre nom vol dir un tros compartit`,
    );
    const importing = scripts.inline.filter((code) => code.includes('/_astro/'));
    t.ok(importing.length === 0, `${page}: cap guió en línia no importa res de /_astro/ (${importing.length})`);
    inline.push(...scripts.inline);
    loaded.push(...scripts.external);
    htmlText.push(html.replace(/<script\b[\s\S]*?<\/script>/g, ''));
  }

  // ── Cap text de la còpia al JS de client ──
  const { timeline } = await bundle('src/data/timeline.ts');
  const casesDir = fromRoot('src/content/cases');
  const cases = fs.readdirSync(casesDir).filter((n) => n.endsWith('.json')).map((n) => JSON.parse(fs.readFileSync(path.join(casesDir, n), 'utf8')));
  const sentences = ['ca', 'fr'].flatMap((lang) => [
    ...Object.entries(timeline[lang].milestones).map(([id, m]) => [`cronologia ${lang} «${id}»`, m.body]),
    ...cases.map((c) => [`cas ${lang} «${c.ca.title}»`, c[lang].summary]),
  ]);
  const js = [...inline, ...[...closure(loaded)].map((f) => fs.readFileSync(path.join(OUT, '_astro', f), 'utf8'))];
  for (const [where, sentence] of sentences) {
    const fragment = fragmentOf(sentence);
    if (!t.ok(fragment.length >= 20, `${where}: hi ha un tros de frase prou llarg per buscar («${fragment}»)`)) continue;
    // Control: el tros es troba tal qual a l'HTML del lloc. Si no, buscar-lo al JS no demostraria res.
    if (!t.ok(htmlText.some((h) => h.includes(fragment)), `${where}: «${fragment}» és a l'HTML d'alguna pàgina`)) continue;
    t.ok(!js.some((code) => code.includes(fragment)), `${where}: «${fragment}» no és a cap guió de client`);
  }
  t.note(`${sentences.length} frases de la còpia, cap en ${new Set(inline).size} guions en línia diferents ni en ${closure(loaded).size} fitxers de /_astro/`);
}
