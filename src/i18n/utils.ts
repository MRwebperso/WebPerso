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
 */
export const segments = {
  casos: { ca: 'casos', fr: 'cas' },
} as const satisfies Record<string, Record<Lang, string>>;

type SegmentKey = keyof typeof segments;

/** Índex invers: segment publicat → clau canònica, per llengua. */
const canonicalBySegment: Record<Lang, Map<string, SegmentKey>> = (() => {
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

/** Llengua deduïda de la URL; `defaultLang` si la URL no en porta. */
export function getLangFromUrl(url: URL): Lang {
  const [first] = split(url.pathname);
  return isLang(first) ? first : defaultLang;
}

/**
 * Camí canònic d'una URL: sense prefix de llengua i amb els segments
 * retraduïts a les seves claus internes.
 */
export function getCanonicalPath(url: URL): string[] {
  const parts = split(url.pathname);
  const lang = isLang(parts[0]) ? parts.shift() as Lang : defaultLang;
  return parts.map((part) => canonicalBySegment[lang].get(part) ?? part);
}

/**
 * Construeix una ruta absoluta-a-l'arrel per a una llengua.
 * Sempre relativa al domini: `localize('fr', ['casos', 'tvallespir'])`
 * → `/fr/cas/tvallespir/`.
 */
export function localize(lang: Lang, path: string[] = []): string {
  const parts = path.map((part) =>
    part in segments ? segments[part as SegmentKey][lang] : part,
  );
  return `/${[lang, ...parts].join('/')}/`;
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
