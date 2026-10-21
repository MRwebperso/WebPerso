import { getCollection, type CollectionEntry } from 'astro:content';
import { type CaseCategory } from './case-categories';
import { type CaseKind } from './case-kinds';
import { type SkillUse } from './case-skills';
import type { Lang } from '../i18n/utils';
import { ui } from '../i18n/ui';
import { langKeys } from './lang-keys';

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
 * La portada i la cronologia tampoc no s'han migrat, pel mateix motiu: les
 * tuples de la portada (ofertes, línies de servei, relat del mètode) i la
 * geometria del diagrama són on la garantia de tipus val més. La presentació ja
 * no és un text intocable (decisió de Miquel, 12/10/2026), però continua en
 * TypeScript perquè la paritat CA–FR hi és imposada pel tipus.
 */

/** Les dades d'un cas tal com les deixa l'esquema de la col·lecció. */
type CaseData = CollectionEntry<'cases'>['data'];

/** Text d'un cas en una llengua, tal com el deixa l'esquema de la col·lecció. */
export type CaseCopy = CaseData['ca'];

/**
 * Un cas resolt: els fets, que són únics, i el text en les dues llengües.
 *
 * Els tipus dels fets surten de l'esquema de la col·lecció i no s'hi tornen a
 * escriure (21/10/2026). Abans eren copiats a mà, i la còpia ja s'havia
 * separat de l'original sense que res avisés: `skills` hi era una llista
 * qualsevol quan l'esquema en demana tres exactament. El preu és que la forma
 * d'un camp ja no es llegeix aquí, sinó a `src/content.config.ts`. Quins fets
 * passen al cas resolt, en canvi, continua sent una decisió d'aquest fitxer:
 * `order` hi és, perquè `byRecency` el necessita per desfer els empats d'any
 * sense dependre de l'ordre en què li arriba la llista (21/10/2026).
 *
 * `copy` no es deriva, i és deliberat. `Record<Lang, CaseCopy>` és el que
 * queda de la paritat en temps de tipus, i no és poca cosa: si algun dia
 * s'afegeix una tercera llengua al registre de `src/i18n/utils.ts`, aquest
 * fitxer deixa de compilar fins que l'esquema de la col·lecció tingui la clau
 * nova. La paritat entre `ca` i `fr` dins de cada cas la garanteix l'esquema.
 */
export interface CaseRecord {
  /** Slug de la URL. No es tradueix: és nom propi de projecte o d'entitat. */
  id: string;
  /** Ordre de lectura editorial. Únic entre casos (vegeu `resolveCases`). */
  order: CaseData['order'];
  kind: CaseData['kind'];
  category: CaseData['category'];
  year: CaseData['year'];
  langs: Readonly<CaseData['langs']>;
  /** Les tres competències de la targeta, amb el nom en les dues llengües. */
  skills: Readonly<CaseData['skills']>;
  /** Entitats de l'encàrrec, per les sigles del cul de la targeta. */
  orgs: Readonly<CaseData['orgs']>;
  copy: Record<Lang, CaseCopy>;
}

/** El que `resolveCases` necessita d'una entrada de la col·lecció: l'`id` i les dades. */
type CaseEntry = Pick<CollectionEntry<'cases'>, 'id' | 'data'>;

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
 *
 * És una funció pura, separada de `getCases()`, perquè es pugui provar sense
 * Astro (decisió de Miquel, 21/10/2026). Mentre les dues comprovacions i
 * l'ordenació vivien dins de `getCases()`, lligades a `astro:content`, només
 * saltaven compilant: `npm run check` no les veu, i dir que «`build` les
 * atrapa» era l'únic control. Ara `scripts/verify/cases.mjs` hi passa fixtures
 * (carpeta buida, `order` repetit, entrades barrejades) sense compilar el lloc.
 * El preu és una funció exportada més, que només crida `getCases()`.
 */
export function resolveCases(entries: CaseEntry[]): CaseRecord[] {
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
      order: entry.data.order,
      kind: entry.data.kind,
      category: entry.data.category,
      year: entry.data.year,
      // En l'ordre del registre i no en el del fitxer: la fitxa del cas les
      // llegeix així, igual que la columna de la cronologia.
      langs: langKeys.filter((key) => entry.data.langs.includes(key)),
      skills: entry.data.skills,
      orgs: entry.data.orgs,
      copy: { ca: entry.data.ca, fr: entry.data.fr },
    }));
}

/** Els casos en ordre de lectura (`order`), de la col·lecció de debò. Vegeu `resolveCases`. */
export async function getCases(): Promise<CaseRecord[]> {
  return resolveCases(await getCollection('cases'));
}

/**
 * Els casos del més recent al més antic, per al carril de la portada.
 *
 * Dues ordenacions i no una perquè responen a preguntes diferents. `order` és
 * una decisió editorial —què vull que es llegeixi primer— i mana a la
 * navegació entre casos. El carril, en canvi, dibuixa una cronologia amb un
 * filet i una osca per any: si no anés per any, la línia mentiria.
 *
 * Els empats els desfà `order`, de manera explícita: abans els desfeia
 * l'estabilitat de `Array.prototype.sort` (ES2019) sobre una llista que ja
 * arribava ordenada per `order`, i això només valia si el cridant la passava
 * així; amb una llista filtrada o reordenada, els casos del mateix any sortien
 * en ordre arbitrari i sense cap error (21/10/2026). Hi ha dos casos del 2026 i
 * dos del 2023, així que l'empat no és hipotètic. Separada de
 * `getCasesByRecency()` pel mateix motiu que `resolveCases`, i `verify cases` la
 * comprova també amb la llista del revés. No toca l'entrada: ordena una còpia.
 */
export function byRecency(records: CaseRecord[]): CaseRecord[] {
  return records.slice().sort((a, b) => b.year - a.year || a.order - b.order);
}

/** Els casos del més recent al més antic. Vegeu `byRecency`. */
export async function getCasesByRecency(): Promise<CaseRecord[]> {
  return byRecency(await getCases());
}

/** El que rep cada pàgina de cas: el cas i els dos veïns de la navegació de baix. */
export interface CaseRouteProps {
  record: CaseRecord;
  /** El cas anterior en l'ordre editorial (`order`), o `null` si aquest és el primer. */
  prev: CaseRecord | null;
  /** El cas següent en l'ordre editorial (`order`), o `null` si aquest és el darrer. */
  next: CaseRecord | null;
}

/**
 * Les rutes de cas, amb tot el que cada pàgina necessita ja resolt.
 *
 * Existeix perquè la col·lecció es llegeixi una sola vegada per compilació de
 * les rutes, i no tres cops per pàgina (una a `getStaticPaths`, una per
 * recuperar el cas i una altra a la plantilla per trobar-ne els veïns). Els
 * veïns es calculen aquí i enlloc més: les dues pàgines bessones (`ca` i `fr`)
 * i `CaseContent` només reben el resultat, de manera que cap d'elles no ha de
 * recopiar la lògica de posició ni arriscar-se a divergir.
 *
 * Contracte de `prev` i `next`: són els veïns en l'ordre editorial que dicta
 * `order` (el mateix ordre de lectura de `getCases()`), i valen `null` als
 * extrems, de manera que el primer cas no té anterior i el darrer no té
 * següent.
 */
export async function getCaseRoutes(): Promise<
  { params: { case: string }; props: CaseRouteProps }[]
> {
  const cases = await getCases();
  return cases.map((record, index) => ({
    params: { case: record.id },
    props: {
      record,
      prev: index > 0 ? cases[index - 1] : null,
      next: index < cases.length - 1 ? cases[index + 1] : null,
    },
  }));
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
      associative: ui.ca['case.associative'],
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
      deliverables: ui.ca['case.deliverables'],
    },
  },
  fr: {
    kindLabels: {
      position: 'Poste occupé',
      commission: 'Commande',
      own: 'Projet personnel',
      associative: ui.fr['case.associative'],
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
      deliverables: ui.fr['case.deliverables'],
    },
  },
};
