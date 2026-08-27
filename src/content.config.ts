import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseCategories } from './data/case-categories';
import { caseKinds } from './data/case-kinds';
import { skillUses } from './data/case-skills';
import { langKeys } from './data/timeline';

/**
 * Col·lecció de contingut dels casos — bloc 9 de l'ordre de treball.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ ON PASSA LA PARITAT CA–FR EN AQUESTA COL·LECCIÓ                          │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Abans de la migració, la paritat dels casos la imposava el compilador: dues
 * tuples de sis alineades per índex, tres capítols per cas, `Record<Lang, …>`.
 * Aquí la imposa l'esquema, i el repartiment no és una traducció literal del
 * que feia el compilador:
 *
 * - **Per estructura, i és més fort que abans.** Cada cas és un sol fitxer amb
 *   les dues llengües a dins, i `ca` i `fr` són tots dos obligatoris: no hi ha
 *   manera de publicar-ne un sense l'altre. Els fets (`kind`, `year`, `langs`)
 *   són un sol camp compartit, no dos que caldria mantenir alineats: el
 *   desfasament entre fets i text que el vell aliniament per índex feia
 *   possible aquí ja no es pot ni escriure. Els capítols són una tupla de tres
 *   en cada llengua, i cada camp de text és obligatori i no pot ser buit —cosa
 *   que el compilador no comprovava, perquè `''` és un `string` vàlid.
 *
 * - **Per `superRefine`, l'únic que no surt de l'estructura.** `deliverables`
 *   és de longitud lliure, i és el sol lloc on una llengua pot cobrir més que
 *   l'altra sense que res se'n queixi. Quatre lliurables en català i dos en
 *   francès és exactament l'asimetria que no es veu fins que algú obre la
 *   pàgina en l'altra llengua. Per això la regla és una i és explícita: si un
 *   dia se n'hi afegeix cap altra, ha de ser per un camp nou de longitud
 *   lliure, no per refinar aquesta.
 *
 * - **El que ja no es comprova, i és deliberat.** El nombre de casos: la tupla
 *   de sis en imposava sis, i ara sis és un fet de la carpeta. És el preu
 *   d'acceptar que afegir un cas sigui deixar-hi un fitxer. El que sí que es
 *   comprova, a `src/data/cases.ts`, és que la carpeta no quedi buida i que
 *   l'ordre de lectura no sigui ambigu.
 *
 * La `z` ve d'`astro:content` i no de `zod`: al dipòsit hi ha dues versions de
 * zod instal·lades —la 3 que fa servir Astro i una 4 que arrossega el sitemap—,
 * i l'esquema ha de parlar la mateixa que valida els fitxers.
 */

/**
 * Text obligatori. `.trim()` no és cosmètic: un camp de CMS torna sovint amb un
 * salt de línia final, i sense retallar-lo `.min(1)` deixaria passar un camp
 * que a la pàgina es veu buit.
 */
const text = z.string().trim().min(1);

const chapter = z.object({
  title: text,
  body: text,
});

/**
 * Una competència de la targeta: la intensitat és un fet compartit i el nom va
 * en les dues llengües dins del mateix objecte. La paritat, doncs, és
 * estructural i no cal cap comprovació creuada.
 */
const skill = z.object({
  use: z.enum(skillUses),
  ca: text,
  fr: text,
});

/**
 * Una entitat de l'encàrrec. La sigla no es tradueix —és nom propi i és el que
 * es dibuixa al cercle—; el nom sencer, que surt al `title` emergent, sí.
 */
const org = z.object({
  abbr: z.string().trim().min(1).max(4),
  ca: text,
  fr: text,
});

/** Text d'un cas en una llengua. Les dues llengües compleixen aquest mateix. */
const copy = z.object({
  title: text,
  /**
   * Títol curt de la targeta del carril, i subtítol d'una línia.
   *
   * Dos camps més i no una retallada automàtica de `title`: els títols dels
   * casos porten l'aposició que la pàgina necessita —«Alt Vallespir: una
   * destinació de frontera en quatre llengües»— i la targeta no té ni l'espai
   * ni la funció de dir-la sencera. Partir-la a mà deixa que el títol nomeni
   * l'entitat i el subtítol digui la promesa; tallar-la per caràcters deixaria
   * frases mutilades a la portada.
   */
  cardTitle: text,
  cardSubtitle: text,
  /** Una frase: què és el cas. Surt a la fitxa de la portada i a la capçalera. */
  summary: text,
  /** En quin marc es va fer i per a qui. */
  context: text,
  role: text,
  /** Període en paraules: admet «→ avui», que un any sol no admet. */
  period: text,
  territory: text,
  deliverables: z.array(text).min(1),
  /** Punt de partida → intervenció → on és ara. */
  chapters: z.tuple([chapter, chapter, chapter]),
});

const cases = defineCollection({
  loader: glob({
    pattern: '*.json',
    base: './src/content/cases',
    // El nom del fitxer és l'identificador i l'identificador és el segment de
    // la URL, en les dues llengües. Sense aquesta funció hi passaria pel mig el
    // slugificador d'Astro, i un canvi de nom de fitxer podria moure una URL
    // publicada sense que es vegi.
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z
    .object({
      /**
       * Ordre de lectura, a la portada i a la navegació entre casos. No l'any:
       * l'ordre el fixa l'usuari i no coincideix amb la cronologia. Els números
       * poden tenir buits —esborrar un cas no ha de trencar la compilació—,
       * però no es poden repetir; això ho comprova `src/data/cases.ts`.
       */
      order: z.number().int().positive(),
      kind: z.enum(caseKinds),
      /** Línia de feina. Diu de què va el cas; `kind`, en quin règim es va fer. */
      category: z.enum(caseCategories),
      /**
       * Les tres competències que la targeta ensenya en obrir-se.
       *
       * Tres exactament, i no una llista lliure: la targeta en dibuixa tres i
       * una quarta hi cauria fora. La paritat CA–FR aquí no la comprova cap
       * `superRefine` perquè no cal —el nom va en un sol objecte amb les dues
       * llengües a dins, i `use` és un fet compartit. Un cas amb la competència
       * escrita només en català no compila.
       */
      skills: z
        .tuple([skill, skill, skill]),
      /**
       * Entitats de l'encàrrec, per les sigles del cul de la targeta. Fins a
       * tres: la quarta ja no es distingeix a la pila de cercles encavalcats.
       */
      orgs: z.array(org).min(1).max(3),
      /**
       * Any d'inici. No es publica mai tal qual —el que es llegeix és
       * `period`, que admet «→ avui»—, però des del carril de la portada sí que
       * ordena: les targetes van del més recent al més antic, i els empats els
       * desfà `order`. `order` continua manant a la navegació entre casos.
       */
      year: z.number().int(),
      /**
       * Llengües de treball del cas. Vocabulari del registre de la cronologia,
       * i és d'allà que surt l'ordre en què es llegeixen: aquí l'ordre és
       * indiferent.
       */
      langs: z.array(z.enum(langKeys)).min(1),
      ca: copy,
      fr: copy,
    })
    .superRefine((entry, ctx) => {
      if (entry.ca.deliverables.length !== entry.fr.deliverables.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fr', 'deliverables'],
          message:
            `Paritat trencada: ${entry.ca.deliverables.length} lliurables en català i ` +
            `${entry.fr.deliverables.length} en francès. Les dues llistes han de cobrir el mateix.`,
        });
      }
    }),
});

export const collections = { cases };
