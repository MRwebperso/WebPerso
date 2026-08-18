import { milestones, type Zone } from './timeline';
import type { CaseKind } from './case-kinds';

/**
 * «La travessa» — prototip. La geometria, la càmera i el guió d'scroll.
 *
 * Res d'aquí no és una dada nova: les fites surten de `./timeline.ts` i els
 * casos de `src/content/cases/`. El que hi ha aquí és el DIBUIX —a quina
 * altitud passa la carena, on mira la càmera, quant de scroll dura cada tram—
 * i el dibuix és opinió, no dada. Els punts de forma sense estrella no són
 * fites: no tenen text, no surten a cap lectura i no en surt cap número a
 * pantalla; només donen forma al terreny entre dues fites que sí que ho són.
 *
 * ── Per què la unitat vertical és el metre ───────────────────────────────
 * Perquè així les corbes de nivell són corbes de nivell de debò. Amb una
 * altura abstracta, les ratlles horitzontals del gravat serien decoració; amb
 * metres, cada ratlla és una cota i el regle del marge esquerre en pot posar
 * el número. Les xifres són versemblants i estan triades a ull —és una carena
 * biogràfica, no un aixecament topogràfic— però l'escala és coherent de punta
 * a punta, i és això el que fa que el relleu es llegeixi.
 *
 * ── La marca, estesa ──────────────────────────────────────────────────────
 * El favicon és una ratlla vermella plana i una muntanya irregular a sobre:
 * horitzó, cim alt, vall, cim més baix, horitzó. L'últim terç de la carena
 * —2008 al nivell del mar, 2020 al punt més alt, la vall de 2021, 2023 al cim
 * mitjà i el replà de 2026— redibuixa aquest perfil. La ratlla vermella hi és
 * literalment: és la cota zero, i és l'únic vermell de tota la peça.
 */

// ── El full: unitats de dibuix ────────────────────────────────────────────
/**
 * Finestra de la càmera. El `viewBox` és més alt del que sembla que hauria de
 * ser —relació 1,49 quan les pantalles solen anar de 1,6 a 1,78— i és a posta:
 * amb `slice`, la relació més estreta de les dues mana, i si el `viewBox` fos
 * apaïsat com la pantalla, el retall aniria pels costats i se'n duria el regle
 * d'altitud del marge esquerre. Fent-lo alt, el retall és per dalt i per baix,
 * que és on el dibuix té marge de sobres i on no hi ha res fix.
 */
export const VIEW = { w: 1280, h: 860 } as const;

/**
 * On seu el punt actual de la carena dins de la finestra. Tot el món es mou
 * perquè aquest punt no es mogui: és l'ancoratge, i és el que fa que un
 * desplaçament ràpid no desfaci el quadre.
 */
export const ANCHOR = { x: 496, y: 500 } as const;

export const YEAR_FIRST = 1984;
export const YEAR_LAST = 2029;
export const YEAR_START = milestones[0].year;
export const TODAY_YEAR = 2026;

/** Amplada d'un any. Amb 122, la finestra en mostra poc més de deu: un cicle. */
const UNITS_PER_YEAR = 122;
/** Un metre d'altitud, en unitats de dibuix. */
export const METRE = 0.2;

export const worldX = (year: number): number => (year - YEAR_FIRST) * UNITS_PER_YEAR;
export const worldY = (metres: number): number => -metres * METRE;
export const WORLD_W = worldX(YEAR_LAST);

/** Cota màxima del regle del marge. */
export const MAX_METRES = 2000;

// ── El terreny ────────────────────────────────────────────────────────────

interface Control {
  year: number;
  m: number;
  /** Cert només per als sis anys que són fita. La resta és forma, no dada. */
  milestone?: string;
}

/**
 * Perfil de la travessa. Les sis fites hi són amb el seu `id`; els altres
 * punts són el relleu entre fites i no signifiquen res per ells mateixos.
 *
 * El tram 1996→2008 és el «long undulating traverse» de l'espec: Portugal, la
 * dècada de projectes europeus i l'arribada a Barcelona no són una baixada
 * recta sinó una travessa llarga que puja i baixa. El tram 2008→2020 es queda
 * arran de mar fins al 2017 —els anys de Barcelona, amb el MOVOKEUR a dins— i
 * només llavors s'enfila: la pujada és de tres anys, no de dotze.
 */
const CONTROLS: readonly Control[] = [
  { year: 1984, m: 780 },
  { year: 1987, m: 700, milestone: 'cevenes' },
  { year: 1991, m: 620 },
  { year: 1994, m: 300 },
  { year: 1996, m: 60, milestone: 'portugal' },
  { year: 1999, m: 200 },
  { year: 2002, m: 540 },
  { year: 2004, m: 330 },
  { year: 2006, m: 420, milestone: 'europa' },
  { year: 2008, m: 10, milestone: 'barcelona' },
  { year: 2013, m: 70 },
  { year: 2017, m: 130 },
  { year: 2020, m: 1800, milestone: 'pandemia' },
  { year: 2021.6, m: 520 },
  { year: 2023, m: 1150, milestone: 'vallespir' },
  { year: 2026, m: 1150 },
  { year: 2029, m: 1150 },
];

/**
 * Interpolació entre punts de control. `smoothstep` pur arrodoniria tots els
 * cims; lineal pur els faria de serra. La barreja 0,7 deixa els cims tous i
 * els vessants rectes, que és com es dibuixa una muntanya en un gravat.
 */
function baseElevation(year: number): number {
  if (year <= CONTROLS[0].year) return CONTROLS[0].m;
  const last = CONTROLS[CONTROLS.length - 1];
  if (year >= last.year) return last.m;
  for (let i = 1; i < CONTROLS.length; i++) {
    const b = CONTROLS[i];
    if (year > b.year) continue;
    const a = CONTROLS[i - 1];
    const t = (year - a.year) / (b.year - a.year);
    const eased = t * 0.3 + t * t * (3 - 2 * t) * 0.7;
    return a.m + (b.m - a.m) * eased;
  }
  return last.m;
}

/** Soroll de valor determinista: mateix resultat al servidor i al client. */
function hash(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1;
}

/**
 * L'altitud de la carena en un any qualsevol, aspresa inclosa. És l'única
 * font: la fita, el cas, la càmera i el traç dibuixat en surten tots, i per
 * això el caminant queda sempre exactament damunt de la línia.
 *
 * L'aspresa creix amb l'altitud —arran de mar el terreny és pla, als 1.800 m
 * és trencat—, cosa que d'una banda és cert i de l'altra evita que la càmera
 * tremoli als trams baixos, on el pas és lent.
 */
export function elevationAt(year: number): number {
  const base = baseElevation(year);
  const rugged = Math.min(1, base / 900);
  const amp = 4 + 26 * rugged;
  const n = noise(year / 1.7) + noise(year / 0.62 + 41) * 0.45 + noise(year / 0.23 + 97) * 0.2;
  return Math.max(2, base + n * amp);
}

// ── La càmera ─────────────────────────────────────────────────────────────

/**
 * Biaix vertical de l'enquadrament segons la banda on visc. No mou el món
 * —això desenganxaria el caminant de la carena—: mou l'ancoratge dins de la
 * finestra. Al nord l'ancoratge baixa i s'obre cel a sobre, com quan es mira
 * des de dalt; al sud puja i s'obre terra a sota.
 */
const ZONE_LIFT: Record<Zone, number> = { europa: 0, nord: 58, sud: -58 };

/**
 * L'última fita (Vallespir) té `zones: ['nord', 'sud']` i li tocaria el biaix
 * del nord. Es queda a zero a posta: és l'únic fotograma on les dues bandes
 * es llegeixen alhora, i val més el gest que la regla.
 */
const LIFT_TARGETS: readonly number[] = milestones.map((m, i) =>
  i === milestones.length - 1 ? 0 : ZONE_LIFT[m.zones[0]],
);

function liftAt(year: number): number {
  if (year <= milestones[0].year) return LIFT_TARGETS[0];
  for (let i = 1; i < milestones.length; i++) {
    if (year > milestones[i].year) continue;
    const t = (year - milestones[i - 1].year) / (milestones[i].year - milestones[i - 1].year);
    const eased = t * t * (3 - 2 * t);
    return LIFT_TARGETS[i - 1] + (LIFT_TARGETS[i] - LIFT_TARGETS[i - 1]) * eased;
  }
  return LIFT_TARGETS[LIFT_TARGETS.length - 1];
}

export interface Camera {
  /** Punt del món que ha de caure sobre l'ancoratge. */
  wx: number;
  wy: number;
  /** L'ancoratge, ja amb el biaix de banda aplicat. */
  ax: number;
  ay: number;
  metres: number;
}

export function cameraAt(year: number): Camera {
  const metres = elevationAt(year);
  return {
    wx: worldX(year),
    wy: worldY(metres),
    ax: ANCHOR.x,
    ay: ANCHOR.y + liftAt(year),
    metres,
  };
}

/**
 * Els plans, del fons cap endavant. `fx`/`fy` són els factors de paral·laxi:
 * l'horitzó llunyà amb prou feines es mou i per això serveix d'ancoratge tant
 * com el marc; el primer pla passa volant i és el que fa notar la velocitat.
 */
export const LAYERS = {
  far: { fx: 0.12, fy: 0.2 },
  mid: { fx: 0.44, fy: 0.55 },
  main: { fx: 1, fy: 1 },
  // El primer pla no té paral·laxi vertical. Si en tingués, s'enfonsaria fora
  // del quadre en pujar als 1.800 m i la pista de velocitat desapareixeria
  // justament al tram més ràpid de tota la travessa.
  near: { fx: 1.25, fy: 0 },
} as const;
export type LayerName = keyof typeof LAYERS;

// ── El guió de l'scroll ───────────────────────────────────────────────────

/**
 * Quina part del recorregut és carena. La resta és el despatx.
 */
export const RIDGE_SPAN = 0.78;

/**
 * L'scroll no és lineal en anys: alterna trams de marxa i parades. La parada
 * és el que fa llegible el conjunt —els números s'aturen, les etiquetes dels
 * casos es poden llegir, l'inset s'obre sobre un món quiet— i és també el que
 * evita que 2006→2008, dos anys, passi en un parpelleig mentre 2008→2020 se
 * n'endugui mitja pàgina.
 */
const HOLD_WEIGHT = 0.62;
const TRAVEL_BASE = 0.5;
const TRAVEL_PER_YEAR = 0.085;

/**
 * La parada no és una aturada. Deriva mig any llarg mentre la marxa en fa
 * quatre o cinc, i la diferència és tota la gràcia: una aturada de debò
 * deixaria la pantalla morta uns quants centenars de píxels de scroll i es
 * llegiria com una avaria, no com una pausa.
 */
const HOLD_DRIFT = 0.45;

interface Stop {
  at: number;
  year: number;
}

const stops: Stop[] = (() => {
  const years = [...milestones.map((m) => m.year), TODAY_YEAR];
  const drift = (i: number) => (i === years.length - 1 ? 0 : HOLD_DRIFT);
  const spans: { weight: number; to: number }[] = [
    { weight: HOLD_WEIGHT, to: years[0] + drift(0) },
  ];
  for (let i = 1; i < years.length; i++) {
    const gap = years[i] - years[i - 1];
    spans.push({ weight: TRAVEL_BASE + TRAVEL_PER_YEAR * gap, to: years[i] });
    spans.push({ weight: HOLD_WEIGHT, to: years[i] + drift(i) });
  }
  const total = spans.reduce((sum, s) => sum + s.weight, 0);
  const out: Stop[] = [{ at: 0, year: years[0] }];
  let acc = 0;
  for (const span of spans) {
    acc += span.weight;
    out.push({ at: acc / total, year: span.to });
  }
  return out;
})();

/** Els anys de fita, en fracció del tram de carena: la barra de progrés els marca. */
export const milestoneMarks: readonly { year: number; at: number }[] = milestones.map((m) => {
  const hit = stops.find((s) => s.year === m.year);
  return { year: m.year, at: (hit ? hit.at : 0) * RIDGE_SPAN };
});

/**
 * L'any en un punt del recorregut. Dins d'un tram de marxa el pas s'accelera i
 * frena: la càmera arriba a cada fita alentint-se, que és la diferència entre
 * una càmera i un potenciòmetre.
 */
export function yearAtProgress(p: number): number {
  const q = p / RIDGE_SPAN;
  if (q <= 0) return stops[0].year;
  if (q >= 1) return TODAY_YEAR;
  for (let i = 1; i < stops.length; i++) {
    if (q > stops[i].at) continue;
    const a = stops[i - 1];
    const b = stops[i];
    if (a.year === b.year) return a.year;
    const t = (q - a.at) / (b.at - a.at || 1);
    return a.year + (b.year - a.year) * t * t * (3 - 2 * t);
  }
  return TODAY_YEAR;
}

/** El traspàs carena → despatx: comença just abans d'acabar la travessa. */
export function handoffAt(p: number): number {
  return Math.max(0, Math.min(1, (p - (RIDGE_SPAN - 0.035)) / 0.055));
}

/** Posició dins de la seqüència del despatx, 0 → 1. */
export function deskAtProgress(p: number): number {
  return Math.max(0, Math.min(1, (p - RIDGE_SPAN) / (1 - RIDGE_SPAN)));
}

// ── Les fites, ja col·locades ─────────────────────────────────────────────

export interface RidgeNode {
  id: string;
  year: number;
  index: number;
  x: number;
  y: number;
  metres: number;
  label: string;
}

export const ridgeNodes: RidgeNode[] = milestones.map((m, index) => {
  const metres = elevationAt(m.year);
  return {
    id: m.id,
    year: m.year,
    index,
    x: worldX(m.year),
    y: worldY(metres),
    metres,
    label: String(m.year),
  };
});

export function milestoneIndexForYear(year: number): number {
  let idx = 0;
  for (let i = 0; i < milestones.length; i++) {
    if (milestones[i].year <= year) idx = i;
    else break;
  }
  return idx;
}

// ── La frontera ───────────────────────────────────────────────────────────

/**
 * La frontera no és una alçada: és un lloc pel qual es passa. Es dibuixa com
 * una fita de terme al punt de la carena on la banda de residència canvia, i
 * el pas queda una mica abans d'arribar a la fita nova —perquè travessar és
 * el que es fa just abans d'instal·lar-se, no un cop instal·lat.
 */
export interface FrontierPost {
  year: number;
  x: number;
  y: number;
  from: Zone;
  to: Zone;
}

export const frontierPosts: FrontierPost[] = (() => {
  const posts: FrontierPost[] = [];
  for (let i = 1; i < milestones.length; i++) {
    const from = milestones[i - 1].zones[0];
    const to = milestones[i].zones[0];
    if (from === to) continue;
    const gap = milestones[i].year - milestones[i - 1].year;
    const year = milestones[i].year - Math.min(1.4, gap * 0.18);
    posts.push({ year, x: worldX(year), y: worldY(elevationAt(year)), from, to });
  }
  return posts;
})();

// ── Els casos ─────────────────────────────────────────────────────────────

export type Structure = 'cairn' | 'mast' | 'pillar';

/**
 * Cada marc de treball té la seva construcció. Registre complet perquè cap
 * `kind` nou no pugui entrar sense triar-ne una.
 */
const KIND_STRUCTURE: Record<CaseKind, Structure> = {
  position: 'cairn',
  commission: 'cairn',
  own: 'mast',
  associative: 'mast',
  affiliation: 'pillar',
};

export interface CasePlacement {
  id: string;
  order: number;
  year: number;
  /** L'any desplaçat per no encavalcar-se amb un altre cas del mateix any. */
  atYear: number;
  x: number;
  y: number;
  structure: Structure;
  eraIndex: number;
  label: string;
  /** Alterna perquè dues etiquetes veïnes no se superposin. */
  tier: 0 | 1;
}

/** L'etiqueta del rètol: el títol fins als dos punts, o tallat a la paraula. */
export function shortTitle(title: string): string {
  const cut = title.split(':')[0].trim();
  if (cut.length <= 26) return cut;
  const clipped = cut.slice(0, 26);
  return `${clipped.slice(0, clipped.lastIndexOf(' '))}…`;
}

/**
 * Col·locació per any i separació per col·lisió. L'ordre de lectura (`order`)
 * hi viatja intacte i no toca la posició: l'espec demana totes dues coses i el
 * conflicte es resol donant-los canals diferents —la posició diu quan, el
 * número del rètol diu en quin ordre es llegeix.
 */
export function placeCases(
  records: readonly { id: string; order: number; year: number; kind: CaseKind; title: string }[],
): CasePlacement[] {
  const byYear = new Map<number, typeof records>();
  for (const rec of records) {
    byYear.set(rec.year, [...(byYear.get(rec.year) ?? []), rec] as typeof records);
  }

  const placed: CasePlacement[] = [];
  for (const [year, group] of byYear) {
    // Repartits simètricament al voltant del seu any: cap cas no es mou més
    // d'un any i mig, i el que hi ha és sempre l'any real al rètol.
    //
    // Si el repartiment n'empeny cap més enllà del 2026, el grup sencer recula
    // el que calgui. Un cas plantat després del final de la travessa no s'hi
    // arriba a passar mai per davant i es quedaria apagat per sempre: la
    // separació per col·lisió no pot treure'n cap de la carena.
    const last = (group.length - 1) / 2;
    const overshoot = Math.max(0, year + last * 1.15 - (TODAY_YEAR - 0.25));
    group.forEach((rec, i) => {
      const atYear = year + (i - last) * 1.15 - overshoot;
      placed.push({
        id: rec.id,
        order: rec.order,
        year,
        atYear,
        x: worldX(atYear),
        y: worldY(elevationAt(atYear)),
        structure: KIND_STRUCTURE[rec.kind],
        eraIndex: milestoneIndexForYear(year),
        label: shortTitle(rec.title),
        tier: (i % 2) as 0 | 1,
      });
    });
  }
  return placed.sort((a, b) => a.x - b.x);
}

// ── El gravat: cadenes de camí ────────────────────────────────────────────

/**
 * La carena, tancada avall. Un sol camí per a les tres feines —la massa
 * omplerta, el traç de dalt i les corbes de nivell, que són aquest mateix
 * camí desplaçat i retallat— perquè un gravat no repeteix la planxa.
 *
 * El fons baixa fins molt per sota de qualsevol enquadrament, i els costats
 * queden fora dels anys que es recorren: així els tres costats tancats no es
 * veuen mai i el que es llegeix és només la línia de dalt.
 */
export function ridgeMassD(step = 10): string {
  const parts: string[] = [];
  for (let x = 0; x <= WORLD_W; x += step) {
    const year = YEAR_FIRST + x / UNITS_PER_YEAR;
    const y = worldY(elevationAt(year));
    parts.push(`${parts.length === 0 ? 'M' : 'L'}${x},${y.toFixed(1)}`);
  }
  parts.push(`L${WORLD_W},700`, 'L0,700', 'Z');
  return parts.join(' ');
}

/** Les cotes que porten ratlla de nivell, de 100 en 100. */
export const levels: readonly number[] = Array.from(
  { length: MAX_METRES / 100 },
  (_, i) => (i + 1) * 100,
);

/**
 * Un teló de fons: un perfil propi, més suau i més baix com més lluny és, amb
 * la seva pròpia llavor de soroll perquè no sigui la carena repetida.
 */
export function backdropD(width: number, seed: number, base: number, amp: number, wave: number): string {
  const step = 16;
  const parts: string[] = [];
  for (let x = -step; x <= width; x += step) {
    const t = x / 100;
    const m =
      base +
      (noise(t / wave + seed) + noise(t / (wave * 0.4) + seed * 3) * 0.5) * amp;
    parts.push(`${parts.length === 0 ? 'M' : 'L'}${x},${worldY(Math.max(0, m)).toFixed(1)}`);
  }
  parts.push(`L${width},700`, `L${-step},700`, 'Z');
  return parts.join(' ');
}

/** Amplada que ha de tenir un pla per cobrir la finestra tot el recorregut. */
export function layerWidth(fx: number): number {
  return WORLD_W * fx + VIEW.w + 400;
}

// ── El despatx que envelleix ──────────────────────────────────────────────

export interface DeskEra {
  /** Índex de fita: el despatx torna a llegir les mateixes sis. */
  index: number;
  year: number;
  place: string;
  /** Etiqueta de la llengua dels papers de sobre la taula. */
  paper: string;
  /** Peu de la làmina. */
  caption: string;
}

export const deskEras: readonly DeskEra[] = [
  { index: 0, year: 1987, place: 'Cevenes', paper: 'FR', caption: 'Cevenes, 1987' },
  { index: 1, year: 1996, place: 'Lisboa', paper: 'PT', caption: 'Lisboa, 1996' },
  { index: 2, year: 2006, place: 'Europa', paper: 'EN', caption: 'Europa, 2006' },
  { index: 3, year: 2008, place: 'Barcelona', paper: 'CA · ES', caption: 'Barcelona, 2008' },
  { index: 4, year: 2020, place: 'Suïssa', paper: 'DE', caption: 'Suïssa, 2020' },
  { index: 5, year: 2026, place: 'Prats de Molló', paper: 'SIS', caption: 'Prats de Molló, 2026' },
];

/**
 * El que s'acumula sobre la taula. Un objecte no marxa mai: apareix a la seva
 * època i s'hi queda, i és per això que l'última làmina és plena. La llista
 * és la de l'espec, i cada peça hi és amb l'època en què entra.
 */
export interface DeskObject {
  id: string;
  from: number;
  label: string;
}

export const deskObjects: readonly DeskObject[] = [
  { id: 'textbook', from: 1, label: 'Manual d’economia' },
  { id: 'file', from: 2, label: 'Expedient de partenariat' },
  { id: 'thesis', from: 3, label: 'Tesi' },
  { id: 'notebook', from: 4, label: 'Quadern de camp' },
  { id: 'camera', from: 4, label: 'Càmera' },
  { id: 'radio', from: 5, label: 'Enllaç amb Arrels' },
  { id: 'posters', from: 5, label: 'Quatre cartells de fira' },
];

/** Estat del despatx en un punt de la seva seqüència, amb la fosa entre làmines. */
export function deskStateAt(dp: number): { index: number; blend: number } {
  const scaled = Math.max(0, Math.min(deskEras.length - 0.001, dp * deskEras.length));
  const index = Math.floor(scaled);
  return { index, blend: scaled - index };
}
