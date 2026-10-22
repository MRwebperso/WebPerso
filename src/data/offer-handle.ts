/**
 * El contracte de la maneta de l'oferta (`OfferReveal.astro`): on descansa la
 * costura, fins on arriba, com la mouen el teclat i el temps, i on s'obren els
 * cossos i les cotes de cada banda.
 *
 * Per què un mòdul (decisió de Miquel, 21/10/2026): aquests nombres vivien en
 * quatre llocs —els atributs `aria-*` de la maneta, el `--x` de repòs del CSS,
 * les rampes de revelat i el guió— i només els lligava un comentari. Tres
 * commits seguits van corregir derives d'aquest contracte: `c4cf796` (l'aria
 * anunciava 0–100 mentre el guió limitava a 5–95, un error real per a qui
 * llegeix amb lector de pantalla), `4306599` i `52f9673` (el comentari del
 * repòs deia que els cossos es llegien d'entrada, i no és així). Ara el
 * marcatge en treu l'aria, el guió n'importa les regles, i el CSS, que no pot
 * importar res, el comprova `scripts/verify/maneta.mjs`.
 *
 * Les rampes es queden escrites al CSS amb els seus nombres: passar-les a
 * propietats posades des del marcatge afegiria un atribut `style` a l'HTML, i
 * «per fotograma només canvia `--x`» és la regla de la peça. `RAMPS` n'és el
 * mirall, no la font, i la comprovació és el que els manté iguals.
 *
 * La política del gest també hi viu (decisió de Miquel, 21/10/2026): qui
 * mana —ratolí, dit o teclat—, què torna la costura al repòs i què passa en
 * passar a pantalla estreta eren `let` dins del guió, fora de l'abast de
 * `verify`, i hi cabia una deriva que ningú no podia veure: en passar a estret
 * el guió tornava la costura al mig sense tocar l'aria, de manera que, en
 * tornar a ample, la costura era al 50 i la maneta seguia anunciant el 80
 * d'abans. `createHandle` ho recull tot com un autòmat sense DOM, i la posició
 * i l'aria surten del mateix estat. El preu és un objecte `HandleView` per
 * gest i per fotograma, i uns quants centenars de bytes més al guió en línia,
 * que ha de continuar per sota del límit d'Astro (4096) perquè no surti cap
 * tros compartit: `verify build` ho vigila.
 *
 * Sense cap importació: Node el carrega tal qual.
 */

/** Repòs al mig: els dos titulars llegibles alhora; els cossos esperen que s'empenyi la maneta. */
export const REST = 0.5;

/** Als extrems queda una franja de l'altra capa. Amb 0 o 1 la maneta se
 * n'aniria mig fora del panell, que té el desbordament amagat. */
export const MIN = 0.05;
export const MAX = 0.95;

/** Pas de les fletxes i de les tecles de pàgina. */
export const KEY_STEP = 0.04;
export const PAGE_STEP = 0.16;

/** Amortiment per constant de temps: 90 ms, el mateix valor que la travessa. */
export const TAU_MS = 90;
/** Sostre del pas de temps: una pestanya que torna de segon pla no fa saltar la costura. */
export const DT_CAP_MS = 140;
/**
 * Per sota d'aquesta diferència la costura ja és on ha d'anar i no es torna a
 * pintar: és molt menys d'un píxel fins i tot en una pantalla ampla, i és el
 * que fa que en repòs no hi hagi cap `requestAnimationFrame` viu.
 */
export const EPSILON = 0.0004;

/**
 * Les rampes de revelat del CSS de `.stage`, en el mateix ordre i amb els
 * mateixos nombres. `render` s'obre cap a la dreta (`(x − from) × slope`) i
 * `wire` cap a l'esquerra (`(from − x) × slope`), totes dues retallades a [0, 1].
 * El vel arrenca al repòs; el cos, una mica més enllà; les cotes del plànol,
 * darrere del cos.
 */
export const RAMPS = {
  'veil-render': { side: 'render', from: REST, slope: 14 },
  'open-render': { side: 'render', from: 0.54, slope: 8.3 },
  'veil-wire': { side: 'wire', from: REST, slope: 14 },
  'open-wire': { side: 'wire', from: 0.46, slope: 8.3 },
  'more-wire': { side: 'wire', from: 0.36, slope: 8.3 },
} as const;

export type RampName = keyof typeof RAMPS;

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** On pot anar la costura: dins de [MIN, MAX], vingui d'on vingui. */
export const aimAt = (v: number) => clamp(v, MIN, MAX);

/** El valor que anuncia la maneta, en percentatge enter. */
export const ariaValue = (x: number) => String(Math.round(x * 100));

/**
 * Un pas de l'amortiment: la costura recorre la fracció `1 − e^(−dt/τ)` del
 * que li falta. Amb moviment reduït no hi ha amortiment: el moviment el fa la
 * mà de qui llegeix, i arriba d'un sol pas.
 */
export function damp(current: number, target: number, dt: number, reduced: boolean): number {
  const next = current + (target - current) * (reduced ? 1 : 1 - Math.exp(-clamp(dt, 0, DT_CAP_MS) / TAU_MS));
  return Math.abs(target - next) < EPSILON ? target : next;
}

/** On ha d'anar la costura amb cada tecla, o `null` si la tecla no és de la maneta. */
export function keyTarget(key: string, target: number): number | null {
  if (key === 'ArrowLeft' || key === 'ArrowDown') return target - KEY_STEP;
  if (key === 'ArrowRight' || key === 'ArrowUp') return target + KEY_STEP;
  if (key === 'PageDown') return target - PAGE_STEP;
  if (key === 'PageUp') return target + PAGE_STEP;
  if (key === 'Home') return MIN;
  if (key === 'End') return MAX;
  return null;
}

/** El valor d'una rampa a la posició `x`: el que calcula el CSS. */
export function ramp(name: RampName, x: number): number {
  const { side, from, slope } = RAMPS[name];
  return clamp((side === 'render' ? x - from : from - x) * slope, 0, 1);
}

/** Què ha de pintar el guió després de cada gest o fotograma. */
export interface HandleView {
  /** On és la costura ara (`--x`), no on va. */
  x: number;
  /** El que anuncia la maneta: el valor de la destinació, com sempre. */
  aria: string;
  /** Falta camí: cal un fotograma més. */
  moving: boolean;
  /** Algú ha tocat la maneta; no es desfà (`data-touched`). */
  touched: boolean;
}

/**
 * L'autòmat de la maneta: l'estat i les regles del gest, sense DOM.
 *
 * Cada gest torna què cal pintar, o `null` si no ha fet res (un dit que passa
 * per sobre, una tecla aliena, un ratolí que se'n va quan no s'ha de moure).
 * Les regles són les d'abans, passades del guió tal qual:
 * - Amb el teclat o amb el dit, la costura es queda on l'han deixat. Només el
 *   ratolí que se'n va la torna al mig, perquè allà sí que hi ha un gest clar
 *   de marxar.
 * - Un ratolí que torna a entrar recupera el comandament encara que l'hagués
 *   fixat el teclat. Sense botó premut només mana el ratolí.
 * - En passar a pantalla estreta tot torna al repòs; en tornar a ample no es
 *   toca res, que el repòs ja hi és.
 * `reduced` entra a cada fotograma i no en crear-lo: la preferència pot canviar
 * amb la pàgina oberta, i el guió la llegeix en viu.
 */
export function createHandle() {
  let target = REST;
  let current = REST;
  let dragging = false;
  let held = false;
  let mouse = true;
  let touched = false;

  const view = (): HandleView => ({ x: current, aria: ariaValue(target), moving: current !== target, touched });
  const aim = (v: number, byUser = true) => {
    target = aimAt(v);
    if (byUser) touched = true;
    return view();
  };

  return {
    down(type: string, v: number) {
      mouse = type === 'mouse';
      dragging = true;
      held = !mouse;
      return aim(v);
    },
    move(type: string, v: number) {
      mouse = type === 'mouse';
      if (!dragging && !mouse) return null;
      if (!dragging) held = false;
      return aim(v);
    },
    up() {
      dragging = false;
    },
    leave() {
      return dragging || held || !mouse ? null : aim(REST, false);
    },
    key(k: string) {
      const v = keyTarget(k, target);
      if (v === null) return null;
      held = true;
      return aim(v);
    },
    /**
     * Un moviment de demostració (21/10/2026): el fa la pàgina i no qui llegeix,
     * de manera que no marca «tocat» i cedeix al primer gest de debò —un cop
     * algú ha tocat la maneta, retorna `null` i la demostració s'atura.
     */
    nudge(v: number) {
      return touched ? null : aim(v, false);
    },
    narrow(isNarrow: boolean) {
      if (isNarrow) {
        target = current = REST;
        held = false;
      }
      return view();
    },
    tick(dt: number, reduced: boolean) {
      current = damp(current, target, dt, reduced);
      return view();
    },
  };
}
