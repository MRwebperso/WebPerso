/*
 * Les dues ordenacions dels casos i les dues comprovacions de `getCases()`, sense
 * compilar el lloc.
 *
 * `resolveCases` (carpeta no buida, `order` no repetit, ordre de lectura) i
 * `byRecency` (del més recent al més antic, els empats els desfà `order`) són
 * funcions pures de `src/data/cases.ts` des del 21/10/2026, justament perquè es
 * pugui fer això. Abans vivien dins de `getCases()`, lligades a `astro:content`,
 * i només saltaven en compilar: `npm run check` no les veu. L'estabilitat de
 * l'ordenació, de la qual depèn que els dos casos del 2026 i els dos del 2023
 * es llegeixin en l'ordre editorial, només la deia un comentari.
 *
 * - Sobre els fitxers de debò de `src/content/cases/`: `resolveCases` no cau,
 *   els `order` del resultat creixen estrictament, i `byRecency` no puja mai
 *   d'any i, a igualtat d'any, respecta l'`order`. Les dades passen per
 *   l'esquema de la col·lecció, com les hi deixa Astro (valors per defecte
 *   inclosos), i l'`id` és el nom del fitxer sense extensió.
 * - Sobre fixtures: la carpeta buida i l'`order` repetit cauen amb el missatge
 *   que toca (el segon, nomenant els dos casos); unes entrades barrejades surten
 *   en el mateix ordre que les ordenades; els empats d'any respecten `order`;
 *   i els buits d'`order` es toleren, com diu el comentari de `resolveCases`.
 *
 * Els fixtures neixen d'un cas real (clonat, amb `order` i `year` canviats) i no
 * d'una forma escrita a mà: si l'esquema canvia, el fixture segueix sent vàlid.
 */
import fs from 'node:fs';
import path from 'node:path';
import { bundle, fromRoot } from './lib.mjs';

/** L'error que llança `fn`, o `null` si no en llança cap. */
function thrown(fn) {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

const ids = (records) => records.map((r) => r.id);

export default async function cases(t) {
  const { resolveCases, byRecency } = await bundle('src/data/cases.ts');
  const { collections } = await bundle('src/content.config.ts');

  // ── Els fitxers de debò ──
  const casesDir = fromRoot('src/content/cases');
  const real = fs
    .readdirSync(casesDir)
    .filter((n) => n.endsWith('.json'))
    .map((n) => ({
      id: path.basename(n, '.json'),
      data: collections.cases.schema.parse(JSON.parse(fs.readFileSync(path.join(casesDir, n), 'utf8'))),
    }));
  if (!t.ok(real.length > 0, 'hi ha fitxers a src/content/cases/')) return;
  const orderOf = new Map(real.map((e) => [e.id, e.data.order]));

  let resolved;
  const failure = thrown(() => {
    resolved = resolveCases(real);
  });
  if (!t.ok(failure === null, `resolveCases accepta els ${real.length} casos de src/content/cases/ (${failure?.message})`)) return;

  t.equal(new Set(ids(resolved)).size, real.length, 'resolveCases porta tots els casos, cap de repetit');
  const orders = ids(resolved).map((id) => orderOf.get(id));
  t.ok(
    orders.every((o, i) => i === 0 || orders[i - 1] < o),
    `l'ordre de lectura dels casos reals creix estrictament amb order (${orders.join(', ')})`,
  );

  const before = ids(resolved);
  const recent = byRecency(resolved);
  t.equal(ids(resolved), before, 'byRecency no toca la llista que rep');
  t.equal(ids(recent).sort(), before.slice().sort(), 'byRecency porta els mateixos casos');
  const years = recent.map((r) => r.year);
  t.ok(
    years.every((y, i) => i === 0 || years[i - 1] >= y),
    `byRecency no puja mai d'any als casos reals (${years.join(', ')})`,
  );
  let ties = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1].year !== recent[i].year) continue;
    ties++;
    t.ok(
      orderOf.get(recent[i - 1].id) < orderOf.get(recent[i].id),
      `a igualtat d'any (${recent[i].year}), «${recent[i - 1].id}» va davant de «${recent[i].id}» com a l'ordre editorial`,
    );
  }
  t.note(`${real.length} casos reals, ${ties} empats d'any desfets per order`);

  // ── Fixtures ──
  const entry = (id, order, year) => {
    const data = structuredClone(real[0].data);
    data.order = order;
    data.year = year;
    return { id, data };
  };

  const empty = thrown(() => resolveCases([]));
  t.ok(empty !== null && /^No hi ha cap cas a src\/content\/cases\//.test(empty.message), `una carpeta buida cau amb el missatge de la carpeta buida (${empty?.message})`);

  const clash = thrown(() => resolveCases([entry('alfa', 3, 2026), entry('gamma', 1, 2026), entry('beta', 3, 2025)]));
  t.ok(
    clash !== null && /^Ordre de lectura ambigu/.test(clash.message) && clash.message.includes('«alfa»') && clash.message.includes('«beta»') && clash.message.includes('order: 3'),
    `un order repetit cau amb el missatge d'ordre ambigu, nomenant els dos casos i el número (${clash?.message})`,
  );

  const gaps = [entry('c9', 9, 2020), entry('c1', 1, 2021), entry('c5', 5, 2022)];
  const sparse = thrown(() => resolveCases(gaps));
  t.ok(sparse === null, `els buits d'order es toleren (${sparse?.message})`);

  // Entrades barrejades: cap permutació no pot canviar el resultat. Les rotacions i l'invers.
  const reference = ids(resolveCases(real));
  const permutations = [real.slice().reverse(), ...real.slice(1).map((_, k) => [...real.slice(k + 1), ...real.slice(0, k + 1)])];
  for (const [i, permutation] of permutations.entries()) {
    t.equal(ids(resolveCases(permutation)), reference, `entrades barrejades (permutació ${i + 1} de ${permutations.length}): el mateix ordre de lectura`);
  }

  // Empats d'any: dos del 2026 i dos del 2023, com als casos reals, i entrades fora d'ordre.
  const tied = [entry('c4', 4, 2023), entry('c1', 1, 2026), entry('c5', 5, 2024), entry('c3', 3, 2026), entry('c2', 2, 2023)];
  t.equal(ids(resolveCases(tied)), ['c1', 'c2', 'c3', 'c4', 'c5'], 'fixture d\'empats: l\'ordre de lectura va per order');
  const input = resolveCases(tied);
  t.equal(ids(byRecency(input)), ['c1', 'c3', 'c5', 'c2', 'c4'], 'fixture d\'empats: byRecency va per any i, a igualtat, per order');
  t.equal(ids(input), ['c1', 'c2', 'c3', 'c4', 'c5'], 'fixture d\'empats: byRecency no toca la llista que rep');
}
