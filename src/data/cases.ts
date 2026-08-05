import { getCollection, type CollectionEntry } from 'astro:content';
import { type CaseKind } from './case-kinds';
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
  year: number;
  langs: readonly LangKey[];
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
      year: entry.data.year,
      langs: entry.data.langs,
      copy: { ca: entry.data.ca, fr: entry.data.fr },
    }));
}

/** Un cas pel seu slug. Llança si no existeix: cap ruta no l'hi ha de demanar. */
export async function getCase(id: string): Promise<CaseRecord> {
  const found = (await getCases()).find((item) => item.id === id);
  if (!found) throw new Error(`Cas desconegut: «${id}».`);
  return found;
}

interface CaseLabels {
  kindLabels: Record<CaseKind, string>;
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
