import type { UIKey } from './ui';

/**
 * Nucli lingüístic. Paritat estricta CA–FR: cap llengua no és la subordinada
 * de l'altra. Tota ruta existeix en les dues llengües (rutes mirall
 * pregenerades) i la commutació és una substitució de segments, no una
 * redirecció a la portada.
 */

export const languages = {
  ca: { label: 'Català', htmlLang: 'ca', hreflang: 'ca', ogLocale: 'ca_ES' },
  fr: { label: 'Français', htmlLang: 'fr', hreflang: 'fr', ogLocale: 'fr_FR' },
} as const;

export type Lang = keyof typeof languages;

export const langCodes = Object.keys(languages) as Lang[];

/** Llengua de `x-default`. No implica jerarquia editorial: cal triar-ne una. */
export const defaultLang: Lang = 'ca';

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/**
 * Registre de segments de ruta. La clau és canònica (interna, mai visible);
 * els valors són els segments publicats en cada llengua.
 *
 * Els identificadors de cas (slugs de portfolio) NO es tradueixen: són noms
 * propis de projecte i han de ser estables entre llengües.
 *
 * Els segments del registre són de primer nivell: només es tradueix el primer
 * segment de la ruta. El que ve després (l'identificador d'un cas) no es
 * tradueix mai, encara que dugui el nom d'un segment (`/ca/casos/casos/` ↔
 * `/fr/cas/casos/`). Contrapartida assumida: una ruta que volgués un segment
 * traduït en segona posició obligaria a tocar `getCanonicalPath` i `localize`.
 */
export const segments = {
  casos: { ca: 'casos', fr: 'cas' },
  legal: { ca: 'avis-legal', fr: 'mentions-legales' },
} as const satisfies Record<string, Record<Lang, string>>;

type SegmentKey = keyof typeof segments;

/**
 * Seccions de la portada, en l'ordre de lectura —el de les claus d'aquest
 * objecte—, amb l'àncora publicada i, les que surten a la navegació de la
 * capçalera, la clau del rètol a `ui.ts`. La presentació no hi surt
 * (`nav: null`).
 *
 * Les àncores no es tradueixen, com els identificadors de cas: són idèntiques
 * en les dues llengües perquè el commutador pugui conservar la secció on ets.
 * Viuen aquí, al costat del registre de segments, i no escrites a cada lloc
 * (decisió de Miquel, 21/10/2026): la capçalera, les seccions, l'enllaç de
 * tornada de les pàgines de cas i el guió del carril de casos les repetien a
 * mà, i el guió es quedava mort sense cap avís si l'àncora canviava.
 * `scripts/verify/links.mjs` comprova a la sortida compilada que cada
 * `#àncora` té destí i que la portada té les seccions en aquest ordre.
 */
export const homeSections = {
  presentation: { id: 'presentacio', nav: null },
  communication: { id: 'comunicacio', nav: 'nav.communication' },
  method: { id: 'metode', nav: 'nav.method' },
  timeline: { id: 'trajectoria', nav: 'nav.timeline' },
  cases: { id: 'casos', nav: 'nav.cases' },
  contact: { id: 'contacte', nav: 'nav.contact' },
} as const satisfies Record<string, { id: string; nav: UIKey | null }>;

/** Índex invers: segment publicat → clau canònica, per llengua.
 *
 * `@__PURE__` diu al paquet de client que la funció no té efectes fora del
 * resultat: el guió del carril de casos importa `homeSections` d'aquest
 * fitxer, i sense l'anotació s'enduia aquest índex, que no fa servir
 * (21/10/2026). */
const canonicalBySegment: Record<Lang, Map<string, SegmentKey>> = /* @__PURE__ */ (() => {
  const index = {} as Record<Lang, Map<string, SegmentKey>>;
  for (const lang of langCodes) {
    index[lang] = new Map();
    for (const key of Object.keys(segments) as SegmentKey[]) {
      index[lang].set(segments[key][lang], key);
    }
  }
  return index;
})();

/** Divideix un pathname en segments no buits. */
function split(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

/**
 * Camí canònic d'una URL: sense prefix de llengua i amb el primer segment
 * retraduït a la seva clau interna; els següents passen tal qual.
 */
export function getCanonicalPath(url: URL): string[] {
  const parts = split(url.pathname);
  const lang = isLang(parts[0]) ? parts.shift() as Lang : defaultLang;
  const [first, ...rest] = parts;
  if (first === undefined) return [];
  return [canonicalBySegment[lang].get(first) ?? first, ...rest];
}

/**
 * Construeix una ruta absoluta-a-l'arrel per a una llengua.
 * Sempre relativa al domini: `localize('fr', ['casos', 'tvallespir'])`
 * → `/fr/cas/tvallespir/`. Només es tradueix el primer segment.
 */
export function localize(lang: Lang, path: string[] = []): string {
  const [first, ...rest] = path;
  if (first === undefined) return `/${lang}/`;
  const head = first in segments ? segments[first as SegmentKey][lang] : first;
  return `/${[lang, head, ...rest].join('/')}/`;
}

/**
 * Les dues rutes mirall de la pàgina actual. Alimenta el commutador de
 * llengua i les etiquetes `hreflang`.
 */
export function getAlternates(url: URL): Record<Lang, string> {
  const canonical = getCanonicalPath(url);
  return Object.fromEntries(
    langCodes.map((lang) => [lang, localize(lang, canonical)]),
  ) as Record<Lang, string>;
}

/** L'altra llengua (sistema de dues llengües). */
export function otherLang(lang: Lang): Lang {
  return lang === 'ca' ? 'fr' : 'ca';
}
