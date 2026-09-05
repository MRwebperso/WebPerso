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
    'El mapa mostra la fita que s’està llegint i d’on es venia; la columna de la dreta, en quines llengües. La línia de punts és la frontera.',
  milestones: [
    {
      title: 'Les Cevenes',
      zoneLabel: 'Cevenes, França',
      body: 'Creixo en un poble de mitja muntanya, al peu de les Cevenes. Francès com a primera llengua i una comuna petita com a món sencer. Els territoris on treballo avui s’hi assemblen més del que sembla.',
    },
    {
      title: 'Évora i Lisboa',
      zoneLabel: 'Évora i Lisboa, Portugal',
      body: 'L’adolescència a Évora i després la llicenciatura d’Economia a l’ISEG, a Lisboa. El portuguès passa a ser la llengua de casa, de classe i del carrer alhora: primer canvi de país, primer bilingüisme complet. De l’Economia me n’he quedat el costum de mirar primer els números d’un territori.',
    },
    {
      title: 'Barcelona',
      zoneLabel: 'Barcelona, Espanya',
      body: 'M’instal·lo a Barcelona: dos màsters i un doctorat en comunicació, amb l’anglès com a llengua de treball. La tesi analitza com s’havia explicat la crisi de l’euro en diverses llengües alhora — cum laude i menció de doctorat internacional, amb una estada a la Universitat d’Aarhus. El català i el castellà passen a ser les llengües de cada dia.',
    },
    {
      title: 'Projectes europeus',
      zoneLabel: 'Barcelona, amb viatges arreu d’Europa',
      body: 'Entro als projectes europeus: partenariats, seguiment de subvencions, organització de trobades. Coordino socis de diversos països al projecte MOVOKEUR i organitzo el taller internacional Antipode del 2015. Aprenc a llegir una convocatòria pels criteris d’avaluació abans que per la descripció.',
    },
    {
      title: 'Suïssa, Alemanya, Vallespir',
      zoneLabel: 'Suïssa, Alemanya i Vallespir',
      body: 'Deixo la ciutat. Passo la pandèmia entre Suïssa, Alemanya i el Vallespir. Al Valais faig la verema com a temporer i, alhora, l’etnografia dels temporers per a la Universitat de Barcelona: el terreny i la feina són el mateix lloc. En surto parlant alemany.',
    },
    {
      yearSuffix: '→ avui',
      title: 'Alt Vallespir',
      zoneLabel: 'Prats de Molló, França',
      body: 'M’estableixo a Prats de Molló, aquesta vegada per quedar-m’hi. Dirigeixo l’oficina de turisme durant dos anys, en quatre llengües i amb la frontera al capdamunt de la vall, i ara treballo per encàrrec als dos costats. Els contactes escampats per Europa acaben servint el poble on visc.',
      aside: {
        label: 'Realitzat en el marc associatiu',
        body: 'Presideixo CLM, l’associació que duu TVallespir. Hi provo formats, eines i maneres de treballar abans de fer-los servir per encàrrec. Les feines fetes des d’allà surten al portfolio etiquetades: no són facturades, i la distinció compta.',
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
    'La carte montre l’étape en cours de lecture et celle d’où l’on vient ; la colonne de droite, dans quelles langues. La ligne pointillée est la frontière.',
  milestones: [
    {
      title: 'Les Cévennes',
      zoneLabel: 'Cévennes, France',
      body: 'Je grandis dans un village de moyenne montagne, au pied des Cévennes. Le français comme première langue, et une petite commune pour tout horizon. Les territoires où je travaille aujourd’hui y ressemblent plus qu’on ne croit.',
    },
    {
      title: 'Évora et Lisbonne',
      zoneLabel: 'Évora et Lisbonne, Portugal',
      body: 'L’adolescence à Évora, puis une licence d’économie à l’ISEG, à Lisbonne. Le portugais devient la langue de la maison, des cours et de la rue en même temps : premier changement de pays, premier bilinguisme complet. De l’économie, j’ai gardé l’habitude de regarder d’abord les chiffres d’un territoire.',
    },
    {
      title: 'Barcelone',
      zoneLabel: 'Barcelone, Espagne',
      body: 'Je m’installe à Barcelone : deux masters et un doctorat en communication, l’anglais comme langue de travail. La thèse analyse la manière dont la crise de l’euro s’est racontée dans plusieurs langues à la fois — mention cum laude, doctorat international, avec un séjour à l’université d’Aarhus. Le catalan et le castillan deviennent les langues du quotidien.',
    },
    {
      title: 'Projets européens',
      zoneLabel: 'Barcelone, avec des déplacements à travers l’Europe',
      body: 'J’entre dans les projets européens : partenariats, suivi de subventions, organisation de rencontres. Je coordonne des partenaires de plusieurs pays sur le projet MOVOKEUR et j’organise l’atelier international Antipode de 2015. J’apprends à lire un appel à projets par ses critères d’évaluation avant sa description.',
    },
    {
      title: 'Suisse, Allemagne, Vallespir',
      zoneLabel: 'Suisse, Allemagne et Vallespir',
      body: 'Je quitte la ville. Je passe la pandémie entre la Suisse, l’Allemagne et le Vallespir. En Valais, je fais les vendanges comme saisonnier et, dans le même temps, l’ethnographie des saisonniers pour l’Université de Barcelone : le terrain et le travail sont au même endroit. J’en ressors germanophone.',
    },
    {
      yearSuffix: '→ aujourd’hui',
      title: 'Haut-Vallespir',
      zoneLabel: 'Prats-de-Mollo, France',
      body: 'Je m’installe à Prats-de-Mollo, cette fois pour y rester. Je dirige l’office de tourisme pendant deux ans, en quatre langues et avec la frontière en haut de la vallée, puis je travaille sur commande des deux côtés. Les contacts dispersés en Europe finissent par servir le village où j’habite.',
      aside: {
        label: 'Réalisé dans le cadre associatif',
        body: 'Je préside CLM, l’association qui porte TVallespir. J’y essaie des formats, des outils et des façons de travailler avant de les employer sur commande. Les travaux réalisés depuis l’association figurent au portfolio avec leur étiquette : ils ne sont pas facturés, et la distinction compte.',
      },
    },
  ],
};

export const timeline: Record<Lang, TimelineContent> = { ca, fr };

/** Serialització de l'eix llengua per al client, un sol atribut per pas. */
export function langAttr(langs: Record<LangKey, LangState>): string {
  return langKeys.map((key) => `${key}:${langs[key]}`).join(',');
}
