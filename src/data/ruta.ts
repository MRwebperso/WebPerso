import { langKeys, milestones, timeline, type LangKey, type LangState } from './timeline';
import type { Lang } from '../i18n/utils';

/**
 * «La Ruta» — model d'etapes (prototip v0).
 *
 * Tot deriva de `timeline.ts`, que és NOMÉS DE LECTURA (una altra sessió hi
 * pot estar treballant): sis fites → sis etapes, i els senyals de cada tram
 * surten del diff de `langs` entre la fita anterior i la nova. Els temes de
 * carretera i el vestit del despatx són presentació, no dades: viuen aquí i
 * no toquen cap fitxer del lloc viu.
 *
 * Nota d'ordre: l'espec posa `europa` el 2006, abans de Barcelona; el dipòsit
 * la té el 2012, després. Aquí mana el dipòsit.
 */

/** Longitud d'un tram en unitats de món; la càmera va de 0 a ROAD_LEN. */
export const ROAD_LEN = 1000;

export type SignKind = 'entrada' | 'portic';

export interface Sign {
  lang: LangKey;
  /** entrada: senyal verd de país (0→1) · pòrtic: blau d'autopista (→2). */
  kind: SignKind;
  to: LangState;
  /** Posició al llarg del tram, en unitats de món. */
  z: number;
}

export interface RoadTheme {
  skyTop: string;
  skyLow: string;
  groundA: string;
  groundB: string;
  roadA: string;
  roadB: string;
  sun: boolean;
  curve: number;
}

export interface DeskDress {
  /** Ranures d'art (§8): silueta grisa amb el nom imprès fins que hi hagi dibuix. */
  window: string;
  char: string;
  verb: string;
  objects: string[];
}

export interface Stage {
  id: string;
  index: number;
  year: number;
  yearLabel: string;
  title: string;
  place: string;
  signs: Sign[];
  theme: RoadTheme;
  desk: DeskDress;
}

/* La paleta es queda dins del joc de §4.5: barreges de paper amb blau/taronja
   per desplaçar la temperatura per etapa, mai colors nous. */
const THEMES: Record<string, RoadTheme> = {
  cevenes: {
    skyTop: '#e7eaee', skyLow: '#f3f1e9',
    groundA: '#dde1dc', groundB: '#d2d8d2',
    roadA: '#efece4', roadB: '#e6e2d8',
    sun: false, curve: 0,
  },
  portugal: {
    skyTop: '#f6dcbc', skyLow: '#f2c896',
    groundA: '#ecdab6', groundB: '#e3cda3',
    roadA: '#f2ede2', roadB: '#eae4d6',
    sun: true, curve: 0.5,
  },
  barcelona: {
    skyTop: '#7d95c4', skyLow: '#c2cfe6',
    groundA: '#e9dabf', groundB: '#e0d0b0',
    roadA: '#f5f1e8', roadB: '#ece7da',
    sun: true, curve: -0.45,
  },
  europa: {
    skyTop: '#242c3e', skyLow: '#2f4f5e',
    groundA: '#3c4148', groundB: '#34393f',
    roadA: '#585d62', roadB: '#4c5156',
    sun: false, curve: 0.3,
  },
  pandemia: {
    skyTop: '#dfe5ec', skyLow: '#eef1f4',
    groundA: '#e6eaed', groundB: '#dae0e5',
    roadA: '#e9e7e2', roadB: '#dfddd6',
    sun: false, curve: -0.6,
  },
  vallespir: {
    skyTop: '#eda86c', skyLow: '#f2c88e',
    groundA: '#e1d5c1', groundB: '#d7c9b1',
    roadA: '#f2ede2', roadB: '#e9e3d6',
    sun: true, curve: 0.45,
  },
};

const THEME_FALLBACK: RoadTheme = THEMES.cevenes;

/* Vestit del despatx per fita (taula §5 de l'espec). Els noms són ranures
   d'actiu, no copy: es pinten sobre la silueta grisa. El verb sí que és copy
   i de moment només en català (decisió D1, per defecte). */
const DESKS: Record<string, Pick<DeskDress, 'verb' | 'objects'>> = {
  cevenes: { verb: 'escriu a mà', objects: ['prop/quadern', 'prop/tinter'] },
  portugal: { verb: 'estudia i escriu', objects: ['prop/llibres', 'prop/apunts-eco'] },
  barcelona: { verb: 'tesi i recerca', objects: ['prop/ordinador', 'prop/tesi'] },
  europa: { verb: 'ordinador i telèfon', objects: ['prop/crt', 'prop/telefon', 'prop/dossiers'] },
  pandemia: { verb: 'trucades i vídeo', objects: ['prop/portatil', 'prop/quadern-camp', 'prop/camera'] },
  vallespir: { verb: 'IA i multipantalla', objects: ['prop/pantalles', 'prop/ia', 'prop/radio'] },
};

/** Diff de llengües entre la fita anterior i la fita `i` → senyals del tram. */
function signsFor(i: number): Sign[] {
  if (i === 0) return [];
  const prev = milestones[i - 1].langs;
  const next = milestones[i].langs;
  const changed = langKeys.filter((key) => next[key] !== prev[key]);
  return changed.map((lang, j) => ({
    lang,
    kind: next[lang] === 2 ? 'portic' : 'entrada',
    to: next[lang],
    // Repartits pel tram, mai a tocar de la sortida ni de l'arribada.
    z: ROAD_LEN * (0.12 + (0.76 * (j + 1)) / (changed.length + 1)),
  }));
}

export function stagesFor(lang: Lang): Stage[] {
  const copy = timeline[lang];
  return milestones.map((m, i) => {
    const mc = copy.milestones[i];
    return {
      id: m.id,
      index: i,
      year: m.year,
      yearLabel: mc.yearSuffix ? `${m.year} ${mc.yearSuffix}` : String(m.year),
      title: mc.title,
      place: mc.zoneLabel,
      signs: signsFor(i),
      theme: THEMES[m.id] ?? THEME_FALLBACK,
      desk: {
        window: `window/${m.id}`,
        char: `char/${m.id}/working`,
        verb: DESKS[m.id]?.verb ?? '',
        objects: DESKS[m.id]?.objects ?? [],
      },
    };
  });
}

/** Índex de la fita a la qual pertany un any: l'última que ja ha començat. */
export function stageForYear(year: number): number {
  let idx = 0;
  milestones.forEach((m, i) => {
    if (year >= m.year) idx = i;
  });
  return idx;
}
