/**
 * Vocabulari tancat de l'eix llengua: les sis llengües de la trajectòria, els
 * tres estats que en pot tenir cadascuna i el nom de cada llengua en cada
 * llengua del lloc.
 *
 * Viu en un mòdul propi, com `case-kinds.ts`, perquè el llegeixen bandes que no
 * han d'arrossegar el text de la cronologia: l'esquema de la col·lecció dels
 * casos (`src/content.config.ts`), l'instrument de la cronologia
 * (`timeline-instrument.ts`), que el guió de client importa, i el que verifica
 * fora del navegador (`scripts/verify/`). Quan vivia a `timeline.ts`, importar
 * `langKeys` volia dir importar també el text de les dues llengües i `ui.ts`
 * (decisió de Miquel, 21/10/2026).
 *
 * Els noms (`langNames`) hi van amb les claus, i no a `TimelineContent`, pel
 * mateix motiu (21/10/2026): les pàgines de cas en volien sis mots i
 * n'importaven la cronologia sencera, i el CMS en compara les etiquetes amb
 * un camp d'un contingut de portada. Preu assumit: aquest mòdul que el guió de
 * client ja importa ara porta text. No n'hi arriba al client del lloc, perquè
 * els guions només llegeixen `langKeys` i l'empaquetador esborra la resta: cap
 * dels 64 guions en línia de la compilació no en porta cap nom. Ho vigila
 * `verify build` (21/10/2026): cap nom sencer entre cometes als guions de
 * client del lloc. L'únic guió que en porta és el del prototip `/la-ruta/`, que
 * pinta els senyals amb `langNames.ca`, i que s'ha d'esborrar; la comprovació
 * no el mira, com no mira cap prototip.
 *
 * Sense cap importació de valor: Node el carrega tal qual, sense compilació.
 * L'única importació és de tipus (`Lang`) i s'esborra en compilar: la
 * paritat dels noms amb el registre de llengües la imposa el tipus, de manera
 * que una tercera llengua al registre fa caure aquest fitxer fins que hi té
 * els seus sis noms.
 */
import type { Lang } from '../i18n/utils';

/** Ordre d'entrada a la trajectòria: és l'ordre en què es llegeix la columna. */
export const langKeys = ['fr', 'pt', 'ca', 'es', 'en', 'de'] as const;
export type LangKey = (typeof langKeys)[number];

/**
 * El nom de cada llengua, en minúscula i en la llengua de qui llegeix: és el
 * que surt al diagrama, als passos de la cronologia i a la fitxa dels casos.
 * `Record` per llengua i per clau: un nom que falti, en una llengua o en l'altra,
 * no compila.
 */
export const langNames: Record<Lang, Record<LangKey, string>> = {
  ca: {
    fr: 'francès',
    pt: 'portuguès',
    ca: 'català',
    es: 'castellà',
    en: 'anglès',
    de: 'alemany',
  },
  fr: {
    fr: 'français',
    pt: 'portugais',
    ca: 'catalan',
    es: 'castillan',
    en: 'anglais',
    de: 'allemand',
  },
};

/**
 * 0 absent · 1 en aprenentatge · 2 adquirida.
 *
 * És el sentit que fa servir el lloc: la llegenda del diagrama («en
 * aprenentatge» / «adquirida») i les dues files de cada pas de la cronologia.
 * El comentari d'abans deia «1 adquirida · 2 llengua de treball», i era el que
 * s'equivocava (Miquel, 21/10/2026); les dades i les etiquetes no s'han tocat.
 */
export type LangState = 0 | 1 | 2;
