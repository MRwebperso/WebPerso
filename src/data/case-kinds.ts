/**
 * Vocabulari tancat del marc de cada cas.
 *
 * Viu en un mòdul propi perquè el necessiten dues bandes que no es poden
 * importar l'una a l'altra: l'esquema de la col·lecció (`src/content.config.ts`,
 * que Astro carrega abans que existeixi `astro:content`) i les etiquetes de
 * `src/data/cases.ts`, que sí que llegeix la col·lecció.
 *
 * `position`, `commission`, `own` i `affiliation` són activitat individual;
 * `associative` obliga l'etiquetatge de la secció 2.2 del brief.
 *
 * `position` és un lloc de treball ocupat, que no és el mateix que un encàrrec
 * facturat: dir-ne «encàrrec» seria inexacte, i la precisió del marc és part
 * del senyal que ha de donar el portfolio. Pel mateix motiu hi ha
 * `affiliation`: una vinculació de recerca no és un lloc de treball, i
 * presentar-la com a tal seria inflar-la.
 *
 * NO és text lliure: és el mecanisme de la frontera CLM/individual. A l'esquema
 * hi entra com a `z.enum` i al CMS com a llista tancada, mai com a camp obert.
 */
export const caseKinds = [
  'position',
  'commission',
  'own',
  'associative',
  'affiliation',
] as const;

export type CaseKind = (typeof caseKinds)[number];
