/**
 * Vocabulari tancat de la línia de feina de cada cas.
 *
 * Viu en un mòdul propi pel mateix motiu que `case-kinds.ts`: el necessiten
 * l'esquema de la col·lecció (`src/content.config.ts`, que Astro carrega abans
 * que existeixi `astro:content`) i les etiquetes de `src/data/cases.ts`, i cap
 * dels dos no pot importar l'altre.
 *
 * No s'ha de confondre amb `kind`, encara que tots dos siguin etiquetes de la
 * fitxa. `kind` diu en quin règim es va fer la feina —lloc de treball, marc
 * associatiu, vinculació de recerca—, i és el mecanisme de la frontera
 * CLM/individual de la secció 2.2 del brief. `category` diu de quina feina es
 * tracta, i és el que la targeta convida a clicar.
 *
 * Tres i no cinc: es van provar «marca» i «territori» al prototip i cadascuna
 * cobria un sol cas. Una categoria que no agrupa res no classifica —etiqueta—,
 * i tres línies llegibles valen més que cinc de precises. Si un dia n'hi ha
 * tres casos, es torna a obrir.
 */
export const caseCategories = ['code', 'communication', 'research'] as const;

export type CaseCategory = (typeof caseCategories)[number];
