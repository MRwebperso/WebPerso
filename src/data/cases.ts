import { getCollection, type CollectionEntry } from 'astro:content';
import { type CaseCategory } from './case-categories';
import { type CaseKind } from './case-kinds';
import { type SkillUse } from './case-skills';
import type { Lang } from '../i18n/utils';
import type { LangKey } from './timeline';

/**
 * Portfolio — accés als casos i etiquetes de la fitxa.
 *
 * El text dels casos ja no viu aquí: viu a `src/content/cases/*.json`, un
 * fitxer per cas amb les dues llengües a dins, i el valida l'esquema de
 * `src/content.config.ts`. La raó del canvi és el CMS: Decap escriu fitxers de
 * dades al dipòsit i no sap editar TypeScript.
 *
 * Aquí queden les dues coses que no s'han migrat, i no per comoditat:
 *
 * - **Les etiquetes del marc** (`kindLabels`). Són el mecanisme de la frontera
 *   de la secció 2.2 del brief, i `Record<CaseKind, string>` garanteix que cap
 *   dels cinc valors es quedi sense text en cap de les dues llengües. En un
 *   fitxer de dades això seria una comprovació més a escriure a mà; aquí és
 *   gratis. Al CMS, `kind` hi entra com a llista tancada i no com a text.
 * - **Les etiquetes de la fitxa** (`factLabels`). Són interfície, no contingut:
 *   canvien quan canvia la plantilla, no quan es publica un cas.
 *
 * La portada i la cronologia tampoc no s'han migrat, pel mateix motiu: el nucli
 * invariant de la secció 2.1 i la geometria del diagrama són on la garantia de
 * tipus val més i on el contingut es toca menys.
 */

/** Text d'un cas en una llengua, tal com el deixa l'esquema de la col·lecció. */
export type CaseCopy = CollectionEntry<'cases'>['data']['ca'];

/**
 * Un cas resolt: els fets, que són únics, i el text en les dues llengües.
 *
 * `Record<Lang, CaseCopy>` és el que queda de la paritat en temps de tipus, i
 * no és poca cosa: si algun dia s'afegeix una tercera llengua al registre de
 * `src/i18n/utils.ts`, aquest fitxer deixa de compilar fins que l'esquema de la
 * col·lecció tingui la clau nova. La paritat entre `ca` i `fr` dins de cada cas
 * la garanteix l'esquema.
 */
export interface CaseRecord {
  /** Slug de la URL. No es tradueix: és nom propi de projecte o d'entitat. */
  id: string;
  kind: CaseKind;
  category: CaseCategory;
  year: number;
  langs: readonly LangKey[];
  /** Les tres competències de la targeta, amb el nom en les dues llengües. */
  skills: readonly { use: SkillUse; ca: string; fr: string }[];
  /** Entitats de l'encàrrec, per les sigles del cul de la targeta. */
  orgs: readonly { abbr: string; ca: string; fr: string }[];
  copy: Record<Lang, CaseCopy>;
}

/**
 * Els casos en ordre de lectura.
 *
 * Les dues comprovacions que l'esquema no pot fer, perquè travessen fitxers:
 *
 * - **La carpeta no pot quedar buida.** Un lloc sense cap cas compila
 *   perfectament i publica una secció buida i cap pàgina de cas.
 * - **`order` no es pot repetir.** Amb dos casos al mateix número, l'ordre de
 *   lectura passaria a dependre de l'ordre en què el carregador llegeix la
 *   carpeta, i l'ordre és una decisió editorial, no un atzar del sistema de
 *   fitxers. Els buits, en canvi, es toleren: esborrar un cas des del CMS no ha
 *   de fer caure la compilació.
 */
export async function getCases(): Promise<CaseRecord[]> {
  const entries = await getCollection('cases');

  if (entries.length === 0) {
    throw new Error(
      'No hi ha cap cas a src/content/cases/. La secció de casos i les seves pàgines quedarien buides.',
    );
  }

  const seen = new Map<number, string>();
  for (const entry of entries) {
    const clash = seen.get(entry.data.order);
    if (clash !== undefined) {
      throw new Error(
        `Ordre de lectura ambigu: «${clash}» i «${entry.id}» tenen tots dos order: ${entry.data.order}.`,
      );
    }
    seen.set(entry.data.order, entry.id);
  }

  return entries
    .slice()
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      id: entry.id,
      kind: entry.data.kind,
      category: entry.data.category,
      year: entry.data.year,
      langs: entry.data.langs,
      skills: entry.data.skills,
      orgs: entry.data.orgs,
      copy: { ca: entry.data.ca, fr: entry.data.fr },
    }));
}

/**
 * Els casos del més recent al més antic, per al carril de la portada.
 *
 * Dues ordenacions i no una perquè responen a preguntes diferents. `order` és
 * una decisió editorial —què vull que es llegeixi primer— i mana a la
 * navegació entre casos. El carril, en canvi, dibuixa una cronologia amb un
 * filet i una osca per any: si no anés per any, la línia mentiria.
 *
 * Els empats els desfà `order`, i no per casualitat: `getCases()` ja retorna
 * ordenat per `order` i `Array.prototype.sort` és estable des d'ES2019, o
 * sigui que dos casos del mateix any conserven l'ordre editorial. Hi ha dos
 * casos del 2026 i dos del 2023, així que l'empat no és hipotètic.
 */
export async function getCasesByRecency(): Promise<CaseRecord[]> {
  return (await getCases()).sort((a, b) => b.year - a.year);
}

/** Un cas pel seu slug. Llança si no existeix: cap ruta no l'hi ha de demanar. */
export async function getCase(id: string): Promise<CaseRecord> {
  const found = (await getCases()).find((item) => item.id === id);
  if (!found) throw new Error(`Cas desconegut: «${id}».`);
  return found;
}

interface CaseLabels {
  kindLabels: Record<CaseKind, string>;
  /** Línia de feina. És el text del botó d'entrada de la targeta. */
  categoryLabels: Record<CaseCategory, string>;
  /**
   * Intensitat d'ús d'una competència. No es dibuixa enlloc: la targeta
   * n'ensenya la gradació i prou (decisió de l'usuari, 27/08/2026), i aquest
   * text és el que se serveix per `aria-label` a qui no la veu. Que existeixi
   * en les dues llengües no és opcional: sense ell, la barra és muda.
   */
  useLabels: Record<SkillUse, string>;
  factLabels: {
    context: string;
    role: string;
    period: string;
    territory: string;
    langs: string;
    deliverables: string;
  };
}

export const caseLabels: Record<Lang, CaseLabels> = {
  ca: {
    kindLabels: {
      position: 'Lloc de treball',
      commission: 'Encàrrec',
      own: 'Projecte propi',
      associative: 'Realitzat en el marc associatiu',
      affiliation: 'Vinculació de recerca',
    },
    categoryLabels: {
      code: 'Codi i IA',
      communication: 'Comunicació',
      research: 'Recerca',
    },
    useLabels: {
      ocasional: 'ús ocasional',
      regular: 'ús regular',
      central: 'ús central',
    },
    factLabels: {
      context: 'Marc',
      role: 'Paper',
      period: 'Període',
      territory: 'Territori',
      langs: 'Llengües',
      deliverables: 'Lliurables',
    },
  },
  fr: {
    kindLabels: {
      position: 'Poste occupé',
      commission: 'Commande',
      own: 'Projet personnel',
      associative: 'Réalisé dans le cadre associatif',
      affiliation: 'Rattachement de recherche',
    },
    categoryLabels: {
      code: 'Code et IA',
      communication: 'Communication',
      research: 'Recherche',
    },
    useLabels: {
      ocasional: 'usage ponctuel',
      regular: 'usage régulier',
      central: 'usage central',
    },
    factLabels: {
      context: 'Cadre',
      role: 'Rôle',
      period: 'Période',
      territory: 'Territoire',
      langs: 'Langues',
      deliverables: 'Livrables',
    },
  },
};
