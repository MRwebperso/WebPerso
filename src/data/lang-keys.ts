/**
 * Vocabulari tancat de l'eix llengua: les sis llengües de la trajectòria i els
 * tres estats que en pot tenir cadascuna.
 *
 * Viu en un mòdul propi, com `case-kinds.ts`, perquè el llegeixen bandes que no
 * han d'arrossegar el text de la cronologia: l'esquema de la col·lecció dels
 * casos (`src/content.config.ts`), l'instrument de la cronologia
 * (`timeline-instrument.ts`), que el guió de client importa, i el que verifica
 * fora del navegador (`scripts/verify/`). Quan vivia a `timeline.ts`, importar
 * `langKeys` volia dir importar també el text de les dues llengües i `ui.ts`
 * (decisió de Miquel, 21/10/2026).
 *
 * Sense cap importació de valor: Node el carrega tal qual, sense compilació.
 */

/** Ordre d'entrada a la trajectòria: és l'ordre en què es llegeix la columna. */
export const langKeys = ['fr', 'pt', 'ca', 'es', 'en', 'de'] as const;
export type LangKey = (typeof langKeys)[number];

/**
 * 0 absent · 1 en aprenentatge · 2 adquirida.
 *
 * És el sentit que fa servir el lloc: la llegenda del diagrama («en
 * aprenentatge» / «adquirida») i les dues files de cada pas de la cronologia.
 * El comentari d'abans deia «1 adquirida · 2 llengua de treball», i era el que
 * s'equivocava (Miquel, 21/10/2026); les dades i les etiquetes no s'han tocat.
 */
export type LangState = 0 | 1 | 2;
