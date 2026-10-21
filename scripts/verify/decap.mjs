/*
 * El formulari del CMS (`public/admin/config.yml`) contra l'esquema de la
 * col·lecció dels casos (`src/content.config.ts`).
 *
 * Decap llegeix un YAML escrit a mà i no sap res de l'esquema. Si un
 * vocabulari o una cardinalitat canvia en un costat i no en l'altre, el
 * formulari ofereix valors que la compilació rebutja, o en prohibeix que
 * l'esquema accepta, i no se'n sap res fins que un cas desat des del CMS fa
 * caure el desplegament. El YAML no es genera a partir de l'esquema
 * (21/10/2026): generar-lo voldria dir un pas de compilació més i perdre els
 * comentaris i les pistes escrites per a qui edita. Es comprova.
 *
 * - Les opcions de cada llista tancada (`kind`, `category`, `use` de les
 *   competències, `langs`) són el vocabulari de `src/data/`, en el mateix
 *   ordre.
 * - Cada opció es diu com a la fitxa en català, amb la primera lletra en
 *   majúscula i la clau entre parèntesis: `caseLabels.ca` per al marc, la
 *   línia de feina i la intensitat; `langNames` de la cronologia per a les
 *   llengües, que és d'on les treu la pàgina del cas.
 * - Els mínims i els màxims del formulari són els de l'esquema, llegits de
 *   l'esquema mateix i no copiats aquí: `order` enter i a partir d'1, `year`
 *   enter, tres competències exactament, d'una a tres entitats, sigla d'1 a 4
 *   caràcters, almenys una llengua, i en cada llengua almenys un lliurable i
 *   tres capítols.
 *
 * No hi entra el que Decap fa amb el fitxer —si el dibuixa, si desa bé—, que
 * només es veu obrint `/admin/`. `js-yaml` ja és al dipòsit com a dependència
 * d'Astro, com `esbuild` (vegeu `lib.mjs`).
 */
import fs from 'node:fs';
import { load } from 'js-yaml';
import { bundle, fromRoot } from './lib.mjs';
import { caseCategories } from '../../src/data/case-categories.ts';
import { caseKinds } from '../../src/data/case-kinds.ts';
import { skillUses } from '../../src/data/case-skills.ts';
import { langKeys } from '../../src/data/lang-keys.ts';

/*
 * Opcions que no es diuen com a la fitxa i que ja eren així quan es va
 * escriure la comprovació (21/10/2026). No s'han tocat perquè canviar-les
 * canvia el que veu qui edita: queden anotades, no amagades. Si un dia
 * coincideixen, la comprovació avisa que l'entrada sobra.
 *
 * - `associative`: a la fitxa no hi ha un nom de marc sinó l'etiqueta que
 *   obliga la secció 2.2 del brief («Realitzat en el marc associatiu», de
 *   `ui.ts`); al formulari hi ha un nom curt com els altres quatre, i la pista
 *   del camp ja diu que «Marc associatiu» porta aquella etiqueta.
 */
const KNOWN = [{ field: 'kind', value: 'associative' }];

/** Treu els embolcalls de zod (`superRefine`, `optional`…) fins al tipus de debò. */
const inner = (s) => {
  while (['ZodEffects', 'ZodOptional', 'ZodDefault', 'ZodNullable'].includes(s._def.typeName)) s = s._def.schema ?? s._def.innerType;
  return s;
};
const checkOf = (s, kind) => inner(s)._def.checks?.find((c) => c.kind === kind);
/** [mínim, màxim] d'una llista; una tupla en té exactament tants com elements. */
const cardinality = (s) => {
  const d = inner(s)._def;
  if (d.typeName === 'ZodTuple') return [d.items.length, d.items.length];
  return [d.minLength?.value ?? null, d.maxLength?.value ?? null];
};
const elementOf = (s) => {
  const d = inner(s)._def;
  return d.typeName === 'ZodTuple' ? d.items[0] : d.type;
};
const shapeOf = (s) => inner(s).shape;

const field = (fields, name) => fields.find((f) => f.name === name);
const range = (f) => [f.min ?? null, f.max ?? null];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function decap(t) {
  const config = load(fs.readFileSync(fromRoot('public/admin/config.yml'), 'utf8'));
  const collection = config.collections?.find((c) => c.name === 'cases');
  if (!t.ok(collection, 'config.yml té la col·lecció `cases`')) return;
  const form = collection.fields;

  const { collections } = await bundle('src/content.config.ts');
  const schema = shapeOf(collections.cases.schema);
  const { caseLabels } = await bundle('src/data/cases.ts');
  const { timeline } = await bundle('src/data/timeline.ts');
  const ca = caseLabels.ca;

  // ── Llistes tancades: valors i noms ──
  const skills = field(form, 'skills');
  const selects = [
    ['kind', field(form, 'kind'), caseKinds, ca.kindLabels],
    ['category', field(form, 'category'), caseCategories, ca.categoryLabels],
    ['skills.use', skills && field(skills.fields, 'use'), skillUses, ca.useLabels],
    ['langs', field(form, 'langs'), langKeys, timeline.ca.langNames],
  ];
  const seen = new Set();
  for (const [name, f, vocabulary, labels] of selects) {
    if (!t.ok(f?.widget === 'select', `config.yml: \`${name}\` és una llista tancada (select)`)) continue;
    t.equal(f.options.map((o) => o.value), [...vocabulary], `config.yml: les opcions de \`${name}\` són el vocabulari, en el mateix ordre`);
    for (const o of f.options) {
      const expected = labels[o.value] === undefined ? undefined : `${cap(labels[o.value])} (${o.value})`;
      const known = KNOWN.some((k) => k.field === name && k.value === o.value);
      if (known && o.label !== expected) {
        seen.add(`${name}:${o.value}`);
        continue;
      }
      t.equal(o.label, expected, `config.yml: l'opció \`${o.value}\` de \`${name}\` es diu com a la fitxa`);
    }
  }
  for (const k of KNOWN) {
    const key = `${k.field}:${k.value}`;
    if (t.ok(seen.has(key), `el nom conegut «${key}» ja coincideix amb la fitxa: traieu-lo de KNOWN`)) {
      t.note(`nom diferent i conegut: ${key} (vegeu KNOWN)`);
    }
  }
  t.ok(field(form, 'langs')?.multiple === true, 'config.yml: `langs` admet més d\'una llengua');

  // ── Nombres ──
  const order = field(form, 'order');
  t.ok(order?.value_type === 'int' && checkOf(schema.order, 'int'), 'config.yml i esquema: `order` és enter');
  const orderMin = checkOf(schema.order, 'min');
  t.equal(order?.min, orderMin && (orderMin.inclusive ? orderMin.value : Math.floor(orderMin.value) + 1), 'config.yml: el mínim de `order` és el de l\'esquema');
  t.ok(field(form, 'year')?.value_type === 'int' && checkOf(schema.year, 'int'), 'config.yml i esquema: `year` és enter');

  // ── Cardinalitats ──
  const orgs = field(form, 'orgs');
  const lists = [
    ['skills', skills, schema.skills],
    ['orgs', orgs, schema.orgs],
    ['langs', field(form, 'langs'), schema.langs],
  ];
  for (const lang of ['ca', 'fr']) {
    const copy = field(form, lang);
    if (!t.ok(copy?.fields, `config.yml: \`${lang}\` és un objecte amb camps`)) continue;
    const copySchema = shapeOf(schema[lang]);
    lists.push([`${lang}.deliverables`, field(copy.fields, 'deliverables'), copySchema.deliverables]);
    lists.push([`${lang}.chapters`, field(copy.fields, 'chapters'), copySchema.chapters]);
  }
  for (const [name, f, s] of lists) {
    if (!t.ok(f, `config.yml declara \`${name}\``)) continue;
    t.equal(range(f), cardinality(s), `config.yml: el mínim i el màxim de \`${name}\` són els de l'esquema`);
  }

  const abbr = orgs && field(orgs.fields, 'abbr');
  const abbrSchema = shapeOf(elementOf(schema.orgs)).abbr;
  t.equal(
    abbr?.pattern?.[0],
    `^.{${checkOf(abbrSchema, 'min')?.value},${checkOf(abbrSchema, 'max')?.value}}$`,
    'config.yml: el patró de la sigla és la llargada que admet l\'esquema',
  );
}
