import type { MilestoneId } from './timeline';
import { langKeys, type LangKey, type LangState } from './lang-keys.ts';

/**
 * L'instrument de la cronologia, sense el dibuix: projecció, contorns i, per a
 * cada fita, el punt, la càmera, el tram que hi arriba i el ram; la regla de
 * quina fita es dibuixa en cada pas, i els dos formats d'atribut que porten la
 * càmera i les llengües de l'HTML al guió.
 *
 * Per què un mòdul i no el frontmatter de `TimelineFigure.astro`, on vivia fins
 * al 21/10/2026 (decisió de Miquel): allà eren 683 línies de càlcul que res no
 * podia importar, i la interfície real eren atributs del DOM que s'escrivien en
 * un fitxer i es llegien en un altre. Ara l'encodador i el descodificador de
 * cada atribut són aquí l'un al costat de l'altre, `TimelineFigure.astro` només
 * dibuixa el que en surt, el guió de `Timeline.astro` només tradueix el scroll
 * en un índex, i la geometria es pot comprovar sense navegador
 * (`scripts/verify/`).
 *
 * Res no es tradueix: el diagrama surt dels mateixos números en les dues
 * llengües. Per això de `timeline.ts` només se n'importen tipus —una
 * importació de valor portaria el text de les dues llengües i `ui.ts` al JS de
 * client— i les importacions de valor porten l'extensió `.ts`, que és el que
 * deixa que Node el carregui tal qual.
 *
 * El guió de client n'importa els descodificadors i `stateAt`; la resta de dades
 * són literals i només les fa servir `buildInstrument()`, o sigui que el
 * paquet de client no se les emporta.
 */

// ── Projecció: longitud/latitud reals → unitats de viewBox ──
// Equirectangular amb compressió de longitud (cos de la latitud mitjana): prou
// per a una il·lustració petita i esquemàtica, no una carta de navegació.
export const VIEW = { w: 220, h: 200 } as const;
const MARGIN = 14;
const LON_MIN = -10.5;
const LON_MAX = 17.5;
const LAT_MIN = 37.5;
const LAT_MAX = 55;

export interface Point {
  x: number;
  y: number;
}

type LonLat = [number, number];

function project(lon: number, lat: number): Point {
  const lonCompress = Math.cos((46.5 * Math.PI) / 180);
  const xNorm = (lon - LON_MIN) * lonCompress;
  const xSpan = (LON_MAX - LON_MIN) * lonCompress;
  const yNorm = LAT_MAX - lat;
  const ySpan = LAT_MAX - LAT_MIN;
  return {
    x: MARGIN + (xNorm / xSpan) * (VIEW.w - MARGIN * 2),
    y: MARGIN + (yNorm / ySpan) * (VIEW.h - MARGIN * 2),
  };
}

// ── Serialització dels traços: una sola funció per a l'atribut `d` ──
// Un decimal: és la resolució del viewBox de 220 × 200, i és el format que
// diffs anteriors del SVG compilat han comprovat al caràcter.
const xy = (p: Point) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

/** Polilínia per punts; `closed` hi afegeix el `Z` dels contorns tancats. */
function lineD(points: readonly Point[], closed: boolean): string {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xy(p)}`).join(' ');
  return closed ? `${d} Z` : d;
}

function controlFor(a: Point, b: Point, bow: number): Point {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: mx, y: my - len * bow };
}

/** Corba quadràtica de `a` a `b`, arquejada cap amunt en proporció a la corda. */
function arcD(a: Point, b: Point, bow: number): string {
  return `M${xy(a)} Q${xy(controlFor(a, b, bow))} ${xy(b)}`;
}

/**
 * La frontera d'estat pels Pirineus. Ja no és una ratlla recta de banda a
 * banda: a la fita final la càmera hi és a sobre i una recta no hi passaria
 * per on hi passa de veres. Els anells d'Espanya i de França llegeixen aquest
 * mateix array com a aresta comuna, així la ratlla de punts cau exactament
 * sobre la vora dels dos països i no uns quants quilòmetres al costat, i
 * corregir la frontera és tocar un sol lloc.
 *
 * El tram que compta és `[2.42, 42.36]`, el coll d'Ares: passa just al sud de
 * Prats de Molló, que és on para el punt de la darrera fita.
 */
export const FRONTIER_LONLAT: readonly LonLat[] = [
  [-1.79, 43.35],
  [-0.7, 42.85],
  [0.65, 42.7],
  [1.15, 42.72],
  [1.42, 42.65],
  [1.72, 42.5],
  [2.05, 42.35],
  [2.42, 42.36],
  [2.65, 42.42],
  [3.05, 42.43],
];

/**
 * Els països, un contorn tancat cadascun.
 *
 * Abans hi havia una sola silueta que ajuntava França i la península en un
 * únic polígon. Tenia dos problemes: els costats que no són costa —el tall
 * pels Pirineus, el que travessava el golf de Biscaia— quedaven dibuixats
 * igual que la costa, i a prop (la càmera arriba a 2,4×) allò ja no es llegia
 * com un mapa sinó com ratlles escampades. Amb un anell per país, cada traç
 * que es veu és una frontera o una costa de veres, i quan la càmera s'allunya
 * hi apareixen els veïns en lloc de blanc.
 *
 * Continuen sent contorns simplificats —de 5 a 45 punts per país, no cartografia—,
 * però les fronteres compartides van amb les mateixes coordenades als dos
 * anells perquè no s'obrin escletxes entre països.
 *
 * Una funció i no una constant: el guió de client importa d'aquest mòdul els
 * descodificadors i prou, i el que només es calcula quan es crida no arriba
 * al seu paquet.
 */
export function countryRings(): LonLat[][] {
  // Tot menys el primer punt, d'est a oest: l'anell francès ja comença a
  // `FRONTIER_LONLAT[0]`. `reverse()` capgira l'array sobre si mateix: el
  // `slice()` d'abans fa que capgiri una còpia i l'original quedi intacte.
  const FRONTIER_EAST_TO_WEST = FRONTIER_LONLAT.slice(1).reverse();
  return [
    // Portugal
    [
      [-8.87, 41.88],
      [-8.2, 42.15],
      [-7.0, 41.95],
      [-6.2, 41.58],
      [-6.85, 41.0],
      [-6.95, 40.35],
      [-7.0, 39.68],
      [-7.55, 39.68],
      [-7.05, 38.9],
      [-7.35, 38.4],
      [-7.1, 38.05],
      [-7.45, 37.55],
      [-7.4, 37.18],
      [-8.6, 37.1],
      [-8.95, 37.02],
      [-8.8, 38.45],
      [-9.5, 38.78],
      [-9.35, 39.35],
      [-8.85, 40.15],
      [-8.7, 41.0],
    ],
    // Espanya
    [
      [-8.87, 41.88],
      [-8.85, 42.6],
      [-9.3, 43.05],
      [-8.9, 43.4],
      [-7.0, 43.55],
      [-5.0, 43.55],
      [-3.0, 43.42],
      // Pirineu: el mateix array `FRONTIER_LONLAT` que llegeix l'anell francès
      // (allà, el primer punt i la resta a l'inrevés), perquè la ratlla de la
      // frontera hi caigui exactament al damunt.
      ...FRONTIER_LONLAT,
      [3.32, 42.32],
      [3.18, 42.26],
      [3.13, 41.85],
      [2.85, 41.7],
      [2.17, 41.39],
      [1.25, 41.1],
      [0.87, 40.72],
      [0.0, 40.0],
      [-0.33, 39.45],
      [-0.5, 38.35],
      [-0.98, 37.6],
      [-2.45, 36.83],
      [-4.42, 36.72],
      [-5.6, 36.02],
      [-6.3, 36.53],
      [-6.95, 37.2],
      [-7.4, 37.18],
      [-7.45, 37.55],
      [-7.1, 38.05],
      [-7.35, 38.4],
      [-7.05, 38.9],
      [-7.55, 39.68],
      [-7.0, 39.68],
      [-6.95, 40.35],
      [-6.85, 41.0],
      [-6.2, 41.58],
      [-7.0, 41.95],
      [-8.2, 42.15],
    ],
    // França
    [
      FRONTIER_LONLAT[0],
      [-1.25, 44.6],
      [-1.15, 45.6],
      [-1.05, 46.0],
      [-2.15, 47.0],
      [-4.78, 48.05],
      [-3.0, 48.85],
      [-1.6, 49.7],
      [0.2, 49.7],
      [1.6, 50.95],
      [2.55, 51.05],
      [3.6, 50.5],
      [4.2, 49.95],
      [5.8, 49.55],
      [6.35, 49.47],
      [8.23, 48.97],
      [7.6, 47.58],
      [6.87, 47.5],
      [6.1, 46.55],
      [6.15, 46.15],
      [7.05, 45.92],
      [6.63, 45.1],
      [7.0, 44.25],
      [7.5, 43.77],
      [5.35, 43.32],
      [4.85, 43.35],
      [3.05, 43.02],
      [3.03, 42.92],
      [3.05, 42.72],
      [3.16, 42.44],
      // Pirineu, d'est a oest: el mateix array `FRONTIER_LONLAT` que llegeix
      // l'anell espanyol (el primer punt és ja a l'inici de l'anell, la resta va
      // a l'inrevés), perquè la ratlla de la frontera hi caigui exactament al damunt.
      ...FRONTIER_EAST_TO_WEST,
    ],
    // Gran Bretanya
    [
      [-5.7, 50.07],
      [-3.0, 50.7],
      [0.9, 50.95],
      [1.75, 52.48],
      [0.0, 53.6],
      [-1.4, 54.6],
      [-2.0, 55.4],
      [-3.3, 55.0],
      [-3.1, 54.1],
      [-3.3, 53.4],
      [-4.7, 53.4],
      [-4.1, 52.4],
      [-5.3, 51.7],
      [-3.3, 51.4],
      [-4.2, 51.2],
    ],
    // Irlanda
    [
      [-6.03, 54.1],
      [-6.2, 53.35],
      [-6.05, 52.2],
      [-7.0, 51.95],
      [-8.5, 51.55],
      [-9.9, 51.45],
      [-10.2, 52.1],
      [-9.3, 53.25],
      [-9.9, 54.25],
      [-8.3, 54.6],
      [-7.2, 55.4],
      [-5.9, 54.6],
    ],
    // Bèlgica
    [
      [2.55, 51.05],
      [3.35, 51.38],
      [4.2, 51.35],
      [5.05, 51.47],
      [5.8, 51.1],
      [6.0, 50.75],
      [6.4, 50.32],
      [6.13, 50.18],
      [5.75, 49.9],
      [5.8, 49.55],
      [4.2, 49.95],
      [3.6, 50.5],
    ],
    // Països Baixos
    [
      [3.35, 51.38],
      [4.05, 51.98],
      [4.55, 52.45],
      [4.75, 52.95],
      [5.4, 53.45],
      [6.7, 53.4],
      [7.0, 52.64],
      [6.7, 52.4],
      [6.17, 51.9],
      [5.8, 51.1],
      [5.05, 51.47],
      [4.2, 51.35],
    ],
    // Luxemburg
    [
      [5.75, 49.9],
      [5.8, 49.55],
      [6.35, 49.47],
      [6.5, 49.8],
      [6.13, 50.18],
    ],
    // Alemanya
    [
      [7.6, 47.58],
      [8.6, 47.8],
      [9.55, 47.55],
      [10.17, 47.27],
      [12.9, 47.72],
      [13.8, 48.58],
      [12.4, 49.8],
      [12.1, 50.3],
      [13.4, 50.7],
      [14.8, 50.87],
      [14.7, 52.1],
      [14.4, 53.3],
      [13.0, 54.4],
      [11.0, 54.4],
      [10.0, 54.5],
      [9.0, 54.85],
      [8.65, 55.4],
      [8.5, 53.9],
      [7.2, 53.68],
      [6.7, 53.4],
      [7.0, 52.64],
      [6.7, 52.4],
      [6.17, 51.9],
      [5.8, 51.1],
      [6.0, 50.75],
      [6.4, 50.32],
      [6.13, 50.18],
      [6.5, 49.8],
      [6.35, 49.47],
      [8.23, 48.97],
    ],
    // Suïssa
    [
      [6.15, 46.15],
      [7.05, 45.92],
      [8.0, 46.0],
      [9.0, 46.0],
      [10.45, 46.87],
      [9.6, 47.06],
      [9.55, 47.55],
      [8.6, 47.8],
      [7.6, 47.58],
      [6.87, 47.5],
      [6.1, 46.55],
    ],
    // Àustria
    [
      [9.55, 47.55],
      [9.6, 47.06],
      [10.45, 46.87],
      [11.0, 46.9],
      [12.4, 46.7],
      [13.6, 46.5],
      [14.6, 46.45],
      [16.0, 46.87],
      [16.5, 47.0],
      [16.9, 47.7],
      [17.16, 48.0],
      [16.0, 48.78],
      [15.0, 48.98],
      [13.8, 48.58],
      [12.9, 47.72],
      [10.17, 47.27],
    ],
    // Itàlia
    [
      [7.5, 43.77],
      [8.9, 44.4],
      [10.0, 44.0],
      [10.3, 43.0],
      [11.1, 42.4],
      [12.2, 41.7],
      [13.5, 41.2],
      [14.2, 40.8],
      [15.3, 40.0],
      [16.1, 38.9],
      [15.65, 38.0],
      [17.2, 38.9],
      [17.5, 40.5],
      [16.2, 41.75],
      [15.0, 42.1],
      [14.0, 42.6],
      [13.5, 43.6],
      [12.5, 44.4],
      [12.3, 45.4],
      [13.6, 45.8],
      [13.6, 46.5],
      [12.4, 46.7],
      [11.0, 46.9],
      [10.45, 46.87],
      [9.0, 46.0],
      [8.0, 46.0],
      [7.05, 45.92],
      [6.63, 45.1],
      [7.0, 44.25],
    ],
    // Eslovènia i el seu entorn immediat
    [
      [13.6, 45.8],
      [13.6, 46.5],
      [14.6, 46.45],
      [16.0, 46.87],
      [16.6, 46.48],
      [15.6, 45.8],
    ],
    // Txèquia
    [
      [12.1, 50.3],
      [13.4, 50.7],
      [14.8, 50.87],
      [15.3, 51.0],
      [16.6, 50.2],
      [17.5, 50.3],
      [17.5, 49.0],
      [16.9, 48.6],
      [16.0, 48.78],
      [15.0, 48.98],
      [13.8, 48.58],
      [12.4, 49.8],
    ],
    // Polònia occidental (l'est queda fora del quadre)
    [
      [14.7, 52.1],
      [14.4, 53.3],
      [14.2, 53.9],
      [16.5, 54.55],
      [17.5, 54.75],
      [17.5, 50.3],
      [16.6, 50.2],
      [15.3, 51.0],
      [14.8, 50.87],
    ],
    // Còrsega
    [
      [8.55, 42.98],
      [9.45, 42.72],
      [9.55, 42.1],
      [9.35, 41.38],
      [8.8, 41.55],
      [8.55, 42.35],
    ],
    // Sardenya
    [
      [8.2, 41.15],
      [9.3, 41.2],
      [9.55, 40.5],
      [9.7, 39.2],
      [9.1, 39.1],
      [8.4, 38.9],
      [8.4, 40.0],
      [8.15, 40.6],
    ],
    // Sicília
    [
      [12.45, 37.8],
      [15.1, 38.25],
      [15.65, 38.0],
      [15.1, 36.65],
      [12.65, 37.55],
    ],
  ];
}

/**
 * Catalunya sencera, Nord i Sud com una sola massa: de Salses als Ports, de
 * la Ribagorça al cap de Creus. La frontera d'estat hi passa pel mig —és el
 * traç de `FRONTIER_LONLAT` qui la dibuixa, i és tot el sentit de la fita
 * final: el contorn no s'atura on s'atura l'estat.
 *
 * A la darrera fita la càmera hi entra a fons i aquest contorn passa a ser el
 * mapa; per això té més punts que gairebé tots els anells de país, i per això
 * el traç és més marcat que el d'ells.
 */
const CATALONIA_LONLAT: readonly LonLat[] = [
  [3.03, 42.92], // Salses, límit nord de la Catalunya del Nord
  [3.05, 42.72], // Canet
  [3.03, 42.55], // Argelers
  [3.16, 42.44], // Cervera de la Marenda
  [3.32, 42.32], // cap de Creus
  [3.18, 42.26], // Roses
  [3.13, 41.85], // Palamós
  [2.85, 41.7], // Lloret
  [2.17, 41.39], // Barcelona
  [1.62, 41.2], // el Garraf
  [1.25, 41.1], // Tarragona
  [1.06, 41.06], // Cambrils
  [0.87, 40.72], // delta de l'Ebre
  [0.72, 40.55],
  [0.28, 40.52], // els Ports
  [0.2, 40.8], // el Matarranya
  [0.33, 41.3],
  [0.3, 41.6], // la Llitera
  [0.45, 41.9],
  [0.72, 42.3], // la Ribagorça
  [0.65, 42.68], // la Val d'Aran
  [0.8, 42.83],
  [1.15, 42.72],
  [1.42, 42.65], // Andorra
  [1.72, 42.5], // la Cerdanya
  [1.98, 42.62], // el Capcir
  [2.12, 42.87], // el Donasà
  [2.55, 42.92], // les Corberes
];

/** Els llocs reals de cada fita. «Projectes europeus» comparteix coordenades
 * amb Barcelona a propòsit: no hi va haver trasllat, és la mateixa base amb
 * els viatges europeus a sobre. La clau és l'`id` de la fita (no la posició),
 * i el tipus `Record<MilestoneId, …>` fa que un `id` que falti no compili. */
const COORDS: Record<MilestoneId, LonLat> = {
  cevenes: [3.9, 44.2],
  portugal: [-9.15, 38.72],
  barcelona: [2.17, 41.39],
  europa: [2.17, 41.39],
  pandemia: [6.63, 46.52], // Lausanne: Suïssa occidental, dins del territori suís
  vallespir: [2.47, 42.4],
};
const GERMANY: LonLat = [9.73, 52.37]; // Hannover, no Hamburg

// ── «Projectes europeus»: el ram de destinacions, decoratiu i genèric. ──
const FAN_DESTS: readonly LonLat[] = [
  [2.35, 48.86], // París
  [12.5, 41.9], // Roma
  [16.37, 48.2], // Viena
  [13.4, 52.52], // Berlín
  [4.9, 52.37], // Amsterdam
  [-0.12, 51.5], // Londres
];

/**
 * Fita final: el ram de la feina d'ara. Surt de Prats de Molló cap a les
 * ciutats on hi ha els encàrrecs i els interlocutors, als dos costats de la
 * frontera —el mateix vocabulari que «Projectes europeus», però a l'escala de
 * casa: allà eren capitals europees, aquí són cinc ciutats a dues hores.
 */
const CATALAN_DESTS: readonly LonLat[] = [
  [2.895, 42.698], // Perpinyà
  [2.422, 42.617], // Prada
  [2.824, 41.983], // Girona
  [2.174, 41.387], // Barcelona
  [0.626, 41.617], // Lleida
];

/** Marge del quadre de la fita final al voltant del contorn de Catalunya. */
export const CAT_PAD = 26;

/** Corbes dels trams del viatge i dels rams: com s'arquegen sobre la corda. */
const ROUTE_BOW = 0.09;
const FAN_BOW = 0.18;
const RAM_BOW = 0.16;

// ── La càmera ──

export interface Camera {
  scale: number;
  tx: number;
  ty: number;
}

function cameraFor(focus: Point, scale: number): Camera {
  return { scale, tx: VIEW.w / 2 - scale * focus.x, ty: VIEW.h / 2 - scale * focus.y };
}

/** Capsa d'un conjunt de punts, en unitats del viewBox. */
function bounds(points: readonly Point[]) {
  return points.reduce(
    (box, p) => ({
      minX: Math.min(box.minX, p.x),
      maxX: Math.max(box.maxX, p.x),
      minY: Math.min(box.minY, p.y),
      maxY: Math.max(box.maxY, p.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  );
}

// ── Rams decoratius ──

/** Quin ram penja de quina fita. El ram es lliga al `data-node` de la seva
 * fita, i per això `activate()` el sincronitza sense saber que hi és. */
export const RAM_OF = {
  europa: 'fan',
  pandemia: 'oscillation',
  vallespir: 'catalonia',
} as const satisfies Partial<Record<MilestoneId, string>>;

export type RamKind = (typeof RAM_OF)[keyof typeof RAM_OF];

interface Arc {
  d: string;
  dest: Point;
}

export interface Rams {
  /** «Projectes europeus»: Barcelona cap a sis capitals. */
  fan: { node: number; arcs: Arc[] };
  /** Pandèmia: Suïssa → Vallespir → Alemanya → Suïssa, i el punt d'Alemanya. */
  oscillation: { node: number; arcs: string[]; dot: Point };
  /** Fita final: el contorn de Catalunya i les cinc ciutats. */
  catalonia: { node: number; land: string; arcs: Arc[] };
}

// ── Per fita ──

export interface Fita {
  id: MilestoneId;
  /** Posició en l'ordre de `milestones`: és el `data-node` de tot el que hi penja. */
  index: number;
  anchor: Point;
  camera: Camera;
  /** El tram que hi arriba des de la fita anterior; `null` a la primera i
   * quan no hi ha trasllat (Barcelona → «Projectes europeus»). */
  segment: string | null;
  ram: RamKind | null;
}

export interface Instrument {
  /** Un `d` per anell, en ordre de dibuix. */
  countries: string[];
  frontier: string;
  /** En l'ordre de `milestones`. */
  fites: Fita[];
  rams: Rams;
  /** El contorn de Catalunya projectat, el que enquadra la darrera càmera. */
  catalonia: Point[];
}

/**
 * Tot el que dibuixa `TimelineFigure.astro`, per a les fites en l'ordre que
 * rep. La clau de cada dada és l'`id` de la fita, i la posició només surt
 * d'aquest ordre: un `id` que no hi sigui atura la compilació en lloc d'emetre
 * un `-1`.
 */
export function buildInstrument(order: readonly { id: MilestoneId }[]): Instrument {
  const nodeOf = (id: MilestoneId): number => {
    const i = order.findIndex((m) => m.id === id);
    if (i < 0) throw new Error(`timeline-instrument: fita desconeguda «${id}»`);
    return i;
  };
  const at = (id: MilestoneId) => project(...COORDS[id]);

  const countries = countryRings().map((ring) => lineD(ring.map(([lon, lat]) => project(lon, lat)), true));
  const frontier = lineD(FRONTIER_LONLAT.map(([lon, lat]) => project(lon, lat)), false);
  const catalonia = CATALONIA_LONLAT.map(([lon, lat]) => project(lon, lat));

  // Els punts nomenats es llegeixen per `id`. Alemanya no és una fita: es projecta.
  const cevenesPoint = at('cevenes');
  const portugalPoint = at('portugal');
  const barcelonaPoint = at('barcelona');
  const chPoint = at('pandemia');
  const dePoint = project(...GERMANY);
  const vaPoint = at('vallespir');

  /*
   * La «càmera»: la primera fita és un únic punt fosc, no un territori, i s'hi
   * entra de prop; s'allunya a «Évora i Lisboa» per fer lloc a la segona i
   * manté el punt de vista fins a Barcelona; s'allunya a «Projectes europeus»
   * perquè s'hi vegin els països veïns; es desplaça cap al nord a la Pandèmia,
   * i s'acosta a Catalunya al final. Un sol transform per fita, i `activate()`
   * només el llegeix.
   */
  const westFocus: Point = {
    x: (cevenesPoint.x + portugalPoint.x + barcelonaPoint.x) / 3,
    y: (cevenesPoint.y + portugalPoint.y + barcelonaPoint.y) / 3,
  };
  const europeFocus = project((LON_MIN + LON_MAX) / 2, (LAT_MIN + LAT_MAX) / 2);
  // Nomes Suïssa i Alemanya: Vallespir hi entraria massa al sud i tornaria a
  // abaixar la càmera just quan cal pujar-la.
  const oscillationFocus: Point = { x: (chPoint.x + dePoint.x) / 2, y: (chPoint.y + dePoint.y) / 2 };
  /*
   * A la fita final el quadre és Catalunya sencera i prou: l'enquadrament surt
   * del contorn mateix, no d'un nombre triat a ull, així que si un dia el
   * contorn canvia la càmera l'hi segueix. Abans hi havia el punt mitjà entre
   * Barcelona i el Vallespir a 2,4×, i el país no hi cabia ni s'hi reconeixia.
   */
  const catBox = bounds(catalonia);
  const catalanFocus: Point = { x: (catBox.minX + catBox.maxX) / 2, y: (catBox.minY + catBox.maxY) / 2 };
  const catalanScale = Math.min(
    (VIEW.w - CAT_PAD * 2) / (catBox.maxX - catBox.minX),
    (VIEW.h - CAT_PAD * 2) / (catBox.maxY - catBox.minY),
  );
  // `Record` i no una llista: una fita sense càmera no compila.
  const camera: Record<MilestoneId, Camera> = {
    cevenes: cameraFor(cevenesPoint, 2.4),
    portugal: cameraFor(westFocus, 1.3),
    barcelona: cameraFor(westFocus, 1.3),
    europa: cameraFor(europeFocus, 0.75),
    pandemia: cameraFor(oscillationFocus, 0.85),
    vallespir: cameraFor(catalanFocus, catalanScale),
  };

  /*
   * El viatge de veres: un tram per parella de fites consecutives, saltant les
   * que no es van moure. Cada tram porta el `data-node` de la fita d'arribada,
   * perquè `activate()` el pugui il·luminar sol —només el tram que s'acaba de
   * recórrer es dibuixa— sense saber res de mapes.
   *
   * La longitud no es calcula aquí: cada tram surt amb `pathLength="1"` i el
   * dibuix s'anima de `stroke-dashoffset: 1` a `0`. Abans se n'aproximava la
   * llargada per corda (dotze mostres) i es passava a `stroke-dasharray`;
   * qualsevol diferència entre l'aproximació i la corba real deixava el tram
   * sense arribar al punt de destinació. Amb `pathLength` la mesura la fa el
   * navegador i el traç acaba exactament al punt, sigui quin sigui el zoom.
   */
  const fites: Fita[] = order.map(({ id }, index) => {
    const anchor = at(id);
    const from = index > 0 ? at(order[index - 1].id) : null;
    const moved = from !== null && !(from.x === anchor.x && from.y === anchor.y);
    const ram = (RAM_OF as Partial<Record<MilestoneId, RamKind>>)[id] ?? null;
    return { id, index, anchor, camera: camera[id], segment: moved ? arcD(from, anchor, ROUTE_BOW) : null, ram };
  });

  const rams: Rams = {
    fan: {
      node: nodeOf('europa'),
      arcs: FAN_DESTS.map(([lon, lat]) => {
        const dest = project(lon, lat);
        return { d: arcD(barcelonaPoint, dest, FAN_BOW), dest };
      }),
    },
    // L'ordre és el de l'espec, no alfabètic ni geogràfic. El tram cap a
    // Barcelona ja no hi és perquè quedava tapat pel traç del recorregut i no
    // es veia (decisió de Miquel, 9/10/2026).
    oscillation: {
      node: nodeOf('pandemia'),
      arcs: [arcD(chPoint, vaPoint, RAM_BOW), arcD(vaPoint, dePoint, RAM_BOW), arcD(dePoint, chPoint, RAM_BOW)],
      dot: dePoint,
    },
    catalonia: {
      node: nodeOf('vallespir'),
      land: lineD(catalonia, true),
      arcs: CATALAN_DESTS.map(([lon, lat]) => {
        const dest = project(lon, lat);
        return { d: arcD(vaPoint, dest, RAM_BOW), dest };
      }),
    },
  };

  return { countries, frontier, fites, rams, catalonia };
}

// ── La regla de quina fita es dibuixa ──

/**
 * Quatre estats i no tres: el mapa ha de poder distingir la fita d'on es ve
 * («prev») de les que ja han quedat més enrere («past»), perquè només les dues
 * últimes es dibuixen. Amb un sol «past» el recorregut s'anava acumulant i al
 * final hi havia sis punts alhora.
 */
export type NodeState = 'current' | 'prev' | 'past' | 'future';

/** Estat d'un element amb `data-node = node` quan es llegeix la fita `index`. */
export function stateAt(node: number, index: number): NodeState {
  return node === index ? 'current' : node === index - 1 ? 'prev' : node < index ? 'past' : 'future';
}

/**
 * Quins estats es veuen, per tipus d'element: és el que diuen les regles
 * `.figure.is-live …[data-state]` de `TimelineFigure.astro`, escrit aquí perquè
 * `scripts/verify/` en pugui comptar el resultat. El punt d'ara i el d'on es
 * venia; del recorregut, només el tram que s'acaba de fer; dels rams, només
 * el de la fita que es llegeix.
 */
export const SHOWN: Record<'node' | 'segment' | 'ram', readonly NodeState[]> = {
  node: ['current', 'prev'],
  segment: ['current'],
  ram: ['current'],
};

// ── Els dos formats d'atribut, de l'HTML al guió ──

/** `data-camera` de l'SVG: una entrada per fita, `escala:tx:ty`, separades per comes. */
export function encodeCameras(cameras: readonly Camera[]): string {
  return cameras.map((cam) => `${cam.scale}:${cam.tx.toFixed(1)}:${cam.ty.toFixed(1)}`).join(',');
}

export function decodeCameras(attr: string): Camera[] {
  return attr.split(',').map((entry) => {
    const [scale, tx, ty] = entry.split(':').map(Number);
    return { scale, tx, ty };
  });
}

/** `data-langs` de cada pas: `clau:estat` per llengua, en l'ordre de `langKeys`. */
export function encodeLangs(langs: Record<LangKey, LangState>): string {
  return langKeys.map((key) => `${key}:${langs[key]}`).join(',');
}

/**
 * La clau torna com a text i no es contrasta amb `langKeys`: el guió la busca
 * entre les llengües que hi ha dibuixades, i una clau desconeguda no hi troba
 * res. Contrastar-la faria entrar `lang-keys.ts` al guió, i com que el
 * comparteix amb els prototips, Vite el trauria a un fitxer a part i el guió ja
 * no aniria en línia a l'HTML (comprovat el 21/10/2026).
 */
export function decodeLangs(attr: string): { key: string; state: LangState }[] {
  const out: { key: string; state: LangState }[] = [];
  for (const pair of attr.split(',')) {
    const [key, state] = pair.split(':');
    if (key && (state === '0' || state === '1' || state === '2')) out.push({ key, state: Number(state) as LangState });
  }
  return out;
}

/**
 * `patternTransform` de la trama del territori. La trama es mesura en unitats
 * del mapa i la càmera l'amplia igual que tot: a les fites de zoom fort
 * quedaven quatre ratlles escampades. Compensada per l'escala inversa, el pas
 * que es veu és el mateix a totes les fites. Sense escala és el de l'HTML
 * estàtic; `patternTransform` no és una propietat CSS animable, i per això el
 * guió el reescriu a cada fita.
 */
export function hatchTransform(scale?: number): string {
  return scale === undefined ? 'rotate(38)' : `rotate(38) scale(${(1 / scale).toFixed(4)})`;
}
