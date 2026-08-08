import type { Lang } from '../i18n/utils';

/**
 * Cronologia — dades i contingut.
 *
 * La geometria (any, zones ocupades, estat de cada llengua) és única i no es
 * tradueix: el diagrama es dibuixa dels mateixos números en les dues llengües.
 * Només els textos van per llengua, i la paritat la imposen els tipus: sis
 * fites en tupla i les sis llengües en `Record`. Afegir una fita o una llengua
 * en una llengua i no en l'altra no compila.
 */

export const zoneKeys = ['europa', 'nord', 'sud'] as const;
export type Zone = (typeof zoneKeys)[number];

/** Ordre d'entrada a la trajectòria: és l'ordre en què es llegeix la columna. */
export const langKeys = ['fr', 'pt', 'ca', 'es', 'en', 'de'] as const;
export type LangKey = (typeof langKeys)[number];

/** 0 absent · 1 adquirida · 2 llengua de treball. */
export type LangState = 0 | 1 | 2;

type Six<T> = readonly [T, T, T, T, T, T];

export interface Milestone {
  /** Identificador estable: no es tradueix ni surt a la interfície. */
  id: string;
  year: number;
  /**
   * Zones ocupades. La primera és la de residència i marca el carril pel qual
   * passa el traç; les altres es dibuixen com a pont cap a l'altre carril.
   */
  zones: readonly [Zone, ...Zone[]];
  langs: Record<LangKey, LangState>;
}

export const milestones: Six<Milestone> = [
  {
    id: 'cevenes',
    year: 1987,
    zones: ['europa'],
    langs: { fr: 1, pt: 0, ca: 0, es: 0, en: 0, de: 0 },
  },
  {
    id: 'portugal',
    year: 1996,
    zones: ['europa'],
    langs: { fr: 2, pt: 1, ca: 0, es: 0, en: 0, de: 0 },
  },
  {
    id: 'barcelona',
    year: 2008,
    zones: ['sud'],
    // L'arribada a Barcelona només tanca el portuguès: el català, el castellà i
    // l'anglès hi comencen —és el que diu el text del pas («passen a ser les
    // llengües de cada dia»)— i no es donen per adquirits fins a la fita
    // següent. Aplanar-ho tot a 2 aquí feia que la columna s'omplís de cop.
    langs: { fr: 2, pt: 2, ca: 1, es: 1, en: 1, de: 0 },
  },
  {
    id: 'europa',
    year: 2012,
    zones: ['sud'],
    langs: { fr: 2, pt: 2, ca: 2, es: 2, en: 2, de: 0 },
  },
  {
    id: 'pandemia',
    year: 2020,
    zones: ['europa', 'nord'],
    langs: { fr: 2, pt: 2, ca: 2, es: 2, en: 2, de: 1 },
  },
  {
    id: 'vallespir',
    year: 2023,
    zones: ['nord', 'sud'],
    langs: { fr: 2, pt: 2, ca: 2, es: 2, en: 2, de: 2 },
  },
];

interface MilestoneCopy {
  /** Per a les fites que són un període obert, no un any tancat. */
  yearSuffix?: string;
  title: string;
  /** L'eix territori en paraules, tal com surt a la fitxa del pas. */
  zoneLabel: string;
  body: string;
  /** Trajectòria associativa, etiquetada (frontera 2.2 del brief). */
  aside?: { label: string; body: string };
}

export interface TimelineContent {
  zoneNames: Record<Zone, string>;
  frontier: string;
  langNames: Record<LangKey, string>;
  stateLabels: { learning: string; acquired: string };
  axisLabels: { zone: string; acquired: string; learning: string };
  figureNote: string;
  milestones: Six<MilestoneCopy>;
}

const ca: TimelineContent = {
  zoneNames: { europa: 'Europa', nord: 'Nord', sud: 'Sud' },
  frontier: 'Frontera',
  langNames: {
    fr: 'francès',
    pt: 'portuguès',
    ca: 'català',
    es: 'castellà',
    en: 'anglès',
    de: 'alemany',
  },
  stateLabels: { learning: 'en aprenentatge', acquired: 'adquirida' },
  axisLabels: { zone: 'Territori', acquired: 'Adquirides', learning: 'En aprenentatge' },
  figureNote:
    'Cada fila és una fita: el carril diu a quin costat de la frontera, la columna de la dreta en quines llengües. La línia de punts és la frontera.',
  milestones: [
    {
      title: 'Les Cevenes',
      zoneLabel: 'Cevenes, França',
      body: 'Creixo en un poble de mitja muntanya, als peus de les Cevenes. Francès com a primera llengua i un entorn de comuna petita: d’aquí ve la familiaritat amb els territoris de muntanya que després he retrobat com a terreny de treball.',
    },
    {
      title: 'Évora i Lisboa',
      zoneLabel: 'Évora i Lisboa, Portugal',
      body: 'Passo l’adolescència a Évora i em llicencio en Economia a Lisboa. El portuguès es converteix en llengua d’estudi i de vida diària; és el primer bilingüisme complet i el primer canvi de país.',
    },
    {
      title: 'Barcelona',
      zoneLabel: 'Barcelona, Espanya',
      body: 'M’instal·lo a Barcelona: dos màsters i un doctorat en comunicació, amb l’anglès com a llengua de treball. El català i el castellà passen a ser les llengües de cada dia, i és aquí que el sud de la frontera deixa de ser un lloc de pas.',
    },
    {
      title: 'Projectes europeus',
      zoneLabel: 'Barcelona, amb viatges arreu d’Europa',
      body: 'Entro en projectes europeus: establir partenariats, fer el seguiment de subvencions i organitzar esdeveniments arreu d’Europa. És on aprenc que un dossier no es guanya escrivint bé, sinó entenent qui l’ha de llegir i amb quins criteris.',
    },
    {
      title: 'Suïssa, Alemanya, Vallespir',
      zoneLabel: 'Suïssa, Alemanya i Vallespir',
      body: 'Deixo la ciutat. Passo la pandèmia entre Suïssa, Alemanya i el Vallespir, i en surto parlant alemany amb solvència. Treballar a distància per a interlocutors de tres països deixa de ser una excepció i es converteix en la manera normal de treballar.',
    },
    {
      yearSuffix: '→ avui',
      title: 'Alt Vallespir',
      zoneLabel: 'Prats de Molló, França',
      body: 'M’estableixo a Prats de Molló, aquesta vegada per quedar-m’hi. Des del nord de la frontera treballo per encàrrec als dos costats i en sis llengües: els contactes dispersos per Europa acaben servint el territori que m’ha rebut.',
      aside: {
        label: 'Realitzat en el marc associatiu',
        body: 'Presideixo CLM, l’associació que duu TVallespir. És on provo formats i eines que després faig servir per encàrrec; per això el portfolio inclou feines no facturades, sempre etiquetades com a tals.',
      },
    },
  ],
};

const fr: TimelineContent = {
  zoneNames: { europa: 'Europe', nord: 'Nord', sud: 'Sud' },
  frontier: 'Frontière',
  langNames: {
    fr: 'français',
    pt: 'portugais',
    ca: 'catalan',
    es: 'castillan',
    en: 'anglais',
    de: 'allemand',
  },
  stateLabels: { learning: 'en apprentissage', acquired: 'acquise' },
  axisLabels: { zone: 'Territoire', acquired: 'Acquises', learning: 'En apprentissage' },
  figureNote:
    'Chaque ligne est une étape : le couloir indique de quel côté de la frontière, la colonne de droite dans quelles langues. La ligne pointillée est la frontière.',
  milestones: [
    {
      title: 'Les Cévennes',
      zoneLabel: 'Cévennes, France',
      body: 'Je grandis dans un village de moyenne montagne, au pied des Cévennes. Le français comme première langue et un cadre de petite commune : de là vient la familiarité avec les territoires de montagne que j’ai retrouvés ensuite comme terrain de travail.',
    },
    {
      title: 'Évora et Lisbonne',
      zoneLabel: 'Évora et Lisbonne, Portugal',
      body: 'Je passe mon adolescence à Évora et j’obtiens une licence d’économie à Lisbonne. Le portugais devient langue d’étude et de vie quotidienne ; c’est le premier bilinguisme complet, et le premier changement de pays.',
    },
    {
      title: 'Barcelone',
      zoneLabel: 'Barcelone, Espagne',
      body: 'Je m’installe à Barcelone : deux masters et un doctorat en communication, l’anglais comme langue de travail. Le catalan et le castillan deviennent les langues du quotidien, et c’est là que le sud de la frontière cesse d’être un lieu de passage.',
    },
    {
      title: 'Projets européens',
      zoneLabel: 'Barcelone, avec des déplacements à travers l’Europe',
      body: 'J’entre dans les projets européens : établir des partenariats, assurer le suivi de subventions, organiser des événements à travers l’Europe. C’est là que j’apprends qu’un dossier ne se gagne pas en écrivant bien, mais en comprenant qui va le lire et avec quels critères.',
    },
    {
      title: 'Suisse, Allemagne, Vallespir',
      zoneLabel: 'Suisse, Allemagne et Vallespir',
      body: 'Je quitte la ville. Je passe la pandémie entre la Suisse, l’Allemagne et le Vallespir, et j’en sors avec un allemand solide. Travailler à distance pour des interlocuteurs de trois pays cesse d’être une exception : cela devient la façon normale de travailler.',
    },
    {
      yearSuffix: '→ aujourd’hui',
      title: 'Haut-Vallespir',
      zoneLabel: 'Prats-de-Mollo, France',
      body: 'Je m’installe à Prats-de-Mollo, cette fois pour y rester. Depuis le nord de la frontière, je travaille sur commande des deux côtés et en six langues : les contacts dispersés en Europe finissent par servir le territoire qui m’accueille.',
      aside: {
        label: 'Réalisé dans le cadre associatif',
        body: 'Je préside CLM, l’association qui porte TVallespir. C’est là que j’essaie des formats et des outils que j’emploie ensuite sur commande ; c’est pourquoi le portfolio comprend des travaux non facturés, toujours étiquetés comme tels.',
      },
    },
  ],
};

export const timeline: Record<Lang, TimelineContent> = { ca, fr };

/** Serialització de l'eix llengua per al client, un sol atribut per pas. */
export function langAttr(langs: Record<LangKey, LangState>): string {
  return langKeys.map((key) => `${key}:${langs[key]}`).join(',');
}
