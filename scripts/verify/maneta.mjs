/*
 * La maneta de l'oferta: el contracte de `src/data/offer-handle.ts` i el CSS
 * d'`OfferReveal.astro`, que no el pot importar.
 *
 * - Al repòs no s'obre res: ni cossos ni cotes, a cap banda.
 * - La costura no surt mai de [MIN, MAX]; Inici i Fi hi porten.
 * - L'amortiment arriba al lloc, en pocs fotogrames o d'un sol pas amb
 *   moviment reduït.
 * - L'aria anuncia el percentatge enter de la posició.
 * - La política del gest, contra l'autòmat `createHandle`: qui mana (ratolí,
 *   dit, ploma, teclat), què torna la costura al repòs en marxar, què passa en
 *   passar a estret i enrere, i que l'aria surti sempre del mateix estat que
 *   la posició.
 * - El `--x` de repòs i les cinc rampes del CSS diuen els mateixos nombres que
 *   el mòdul.
 * - Els passos del teclat, τ, el sostre del pas de temps i ε són els valors
 *   aprovats, escrits aquí com a nombres i no llegits del mòdul.
 */
import fs from 'node:fs';
import { fromRoot } from './lib.mjs';
import {
  DT_CAP_MS,
  EPSILON,
  KEY_STEP,
  MAX,
  MIN,
  PAGE_STEP,
  RAMPS,
  REST,
  TAU_MS,
  aimAt,
  ariaValue,
  createHandle,
  damp,
  keyTarget,
  ramp,
} from '../../src/data/offer-handle.ts';

/*
 * Els valors aprovats del contracte de la maneta: els que escrivia en literal
 * el guió d'`OfferReveal.astro` abans que passessin al mòdul (18ec8d2: ±0,04,
 * ±0,16, τ de 90 ms, sostre de 140 ms, ε de 0,0004). Es copien aquí a posta: comparar
 * `KEY_STEP` amb `KEY_STEP` no podia fallar mai (revisió del 21/10/2026), i un
 * canvi en el mòdul ha de fer vermella la comprovació fins que algú decideixi
 * que el valor nou és el bo i el posi també aquí.
 */
const APPROVED = { KEY_STEP: 0.04, PAGE_STEP: 0.16, TAU_MS: 90, DT_CAP_MS: 140, EPSILON: 0.0004 };

export default async function maneta(t) {
  // ── Els nombres aprovats ──
  t.equal({ KEY_STEP, PAGE_STEP, TAU_MS, DT_CAP_MS, EPSILON }, APPROVED, 'passos, τ, sostre del pas de temps i ε: els valors aprovats');

  // ── Repòs ──
  for (const name of Object.keys(RAMPS).filter((n) => !n.startsWith('veil'))) {
    t.equal(ramp(name, REST), 0, `al repòs, «${name}» val 0`);
  }
  t.equal([ramp('veil-render', REST), ramp('veil-wire', REST)], [0, 0], 'al repòs, cap vel');
  t.equal([ramp('open-render', MAX), ramp('open-wire', MIN), ramp('more-wire', MIN)], [1, 1, 1], 'als extrems, cada banda s’obre del tot');

  // ── Límits i teclat ──
  t.equal([aimAt(-1), aimAt(0), aimAt(1), aimAt(2)], [MIN, MIN, MAX, MAX], 'fora de [MIN, MAX], la costura es queda al límit');
  t.equal(aimAt(keyTarget('End', REST)), 0.95, 'Fi porta a 0,95');
  t.equal(aimAt(keyTarget('Home', REST)), 0.05, 'Inici porta a 0,05');
  t.equal(keyTarget('ArrowRight', REST), REST + KEY_STEP, 'fletxa dreta: un pas');
  t.equal(keyTarget('ArrowUp', REST), REST + KEY_STEP, 'fletxa amunt: un pas');
  t.equal(keyTarget('ArrowLeft', REST), REST - KEY_STEP, 'fletxa esquerra: un pas enrere');
  t.equal(keyTarget('ArrowDown', REST), REST - KEY_STEP, 'fletxa avall: un pas enrere');
  t.equal(keyTarget('PageUp', REST), REST + PAGE_STEP, 'Re Pàg: quatre passos');
  t.equal(keyTarget('PageDown', REST), REST - PAGE_STEP, 'Av Pàg: quatre passos enrere');
  t.equal(keyTarget('Enter', REST), null, 'una tecla aliena no mou res');
  let x = MAX;
  for (let i = 0; i < 10; i++) x = aimAt(keyTarget('PageUp', x));
  t.equal(x, MAX, 'empènyer més enllà del límit no el passa');

  // ── Amortiment ──
  for (const [from, to] of [
    [REST, MAX],
    [MIN, MAX],
  ]) {
    let current = from;
    let frames = 0;
    while (current !== to && frames < 1000) {
      current = damp(current, to, 16, false);
      frames++;
    }
    const expected = Math.ceil((90 / 16) * Math.log(Math.abs(to - from) / EPSILON));
    t.ok(current === to, `de ${from} a ${to}, l’amortiment arriba exactament al lloc`);
    t.ok(Math.abs(frames - expected) <= 1, `de ${from} a ${to}: ${frames} fotogrames a 16 ms (τ = 90 ms, ε = ${EPSILON}; previst ${expected})`);
    t.note(`amortiment ${from} → ${to}: ${frames} fotogrames a 16 ms (${frames * 16} ms)`);
    t.equal(damp(from, to, 16, true), to, `de ${from} a ${to}, amb moviment reduït: d’un sol pas`);
  }
  t.ok(damp(REST, MAX, 10_000, false) < MAX, 'un fotograma endarrerit no fa saltar la costura fins al final');
  t.equal(damp(REST, MAX, 10_000, false), damp(REST, MAX, 140, false), 'un fotograma de 10 s avança el mateix que un de 140 ms: el sostre s’aplica');

  // ── Aria ──
  t.equal([ariaValue(MIN), ariaValue(MAX), ariaValue(REST)], ['5', '95', '50'], 'aria: 5, 95 i 50, els valors del marcatge');
  /*
   * Abans es comparava `ariaValue(v)` amb `String(Math.round(v * 100))`, que és
   * el cos de la funció mateixa. Ara, valors esperats escrits a mà: 0,29 × 100
   * dona 28,999…, i ha d'anunciar 29, no 28; la meitat arrodoneix amunt.
   */
  for (const [v, expected] of [
    [0.29, '29'],
    [0.57, '57'],
    [0.125, '13'],
    [0.334, '33'],
    [0.666, '67'],
  ]) {
    t.equal(ariaValue(v), expected, `aria de ${v}: ${expected}`);
  }

  // ── La política del gest: l'autòmat ──
  /*
   * Valors esperats escrits a mà, no calculats amb les fórmules del mòdul.
   * `peek` llegeix l'estat sense tocar-lo (`narrow(false)` no fa res), i
   * `settle` fa córrer fotogrames amb moviment reduït, que arriben d'un sol pas.
   */
  const peek = (h) => h.narrow(false);
  const settle = (h) => h.tick(16, true);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const AT_REST = { x: 0.5, aria: '50', moving: false, touched: false };

  t.equal(createHandle().tick(16, false), AT_REST, 'sense cap gest, l’autòmat és al repòs: x 0,5, aria 50, quiet i sense tocar');
  {
    const h = createHandle();
    t.equal(h.down('mouse', 0.8), { x: 0.5, aria: '80', moving: true, touched: true }, 'un clic a 0,8: l’aria ja anuncia 80 i la costura encara és al 0,5, en camí');
    const v = settle(h);
    t.ok(v.x === 0.8 && v.aria === '80' && !v.moving, 'amb moviment reduït la costura salta al 0,8 d’un sol pas i s’atura');
  }
  {
    const h = createHandle();
    h.down('mouse', 0.8);
    const v = h.tick(16, false);
    t.ok(Math.abs(v.x - 0.5489) < 0.0001, `amb amortiment, un fotograma de 16 ms no la porta al 0,8 sinó cap al 0,5489 (obtingut ${v.x})`);
    t.ok(v.moving && v.aria === '80', 'amb amortiment segueix en camí, i l’aria ja és la de la destinació');
    let frames = 0;
    let w = v;
    while (w.moving && frames < 500) {
      w = h.tick(16, false);
      frames++;
    }
    t.ok(w.x === 0.8 && !w.moving, `l’amortiment acaba exactament al 0,8 (${frames + 1} fotogrames)`);
  }
  t.equal([createHandle().down('mouse', -3).aria, createHandle().down('touch', 7).aria], ['5', '95'], 'un gest fora del panell s’anuncia retallat: 5 i 95');

  // El viatge a estret i enrere: la deriva que va motivar l'autòmat.
  for (const type of ['mouse', 'touch']) {
    const h = createHandle();
    h.down(type, 0.8);
    settle(h);
    t.equal(h.narrow(true), { x: 0.5, aria: '50', moving: false, touched: true }, `${type}: en passar a estret, la costura i l’aria tornen al repòs junts`);
    t.equal(h.narrow(false), { x: 0.5, aria: '50', moving: false, touched: true }, `${type}: en tornar a ample, l’aria diu 50 i no el 80 d’abans; el «tocat» no es desfà`);
  }
  {
    const h = createHandle();
    h.down('mouse', 0.8);
    t.equal(h.narrow(true), { x: 0.5, aria: '50', moving: false, touched: true }, 'a estret enmig d’un camí: no queda res en camí');
  }

  // Dit, ploma i teclat fixen la costura; només el ratolí que se'n va la torna al mig.
  for (const type of ['touch', 'pen']) {
    const h = createHandle();
    h.down(type, 0.3);
    h.up();
    t.equal(h.leave(), null, `${type}: en aixecar-se i marxar, la costura no torna al mig`);
    t.equal(peek(h).aria, '30', `${type}: continua anunciant 30`);
  }
  {
    const h = createHandle();
    t.equal(h.move('touch', 0.7), null, 'un dit que passa per sobre sense prémer no existeix');
    t.equal(h.move('pen', 0.7), null, 'una ploma que sobrevola sense prémer tampoc');
    t.equal(peek(h), AT_REST, 'i no ha mogut res ni ha marcat «tocat»');
  }
  {
    const h = createHandle();
    t.equal(h.key('Enter'), null, 'una tecla aliena no fa res (i el guió no n’atura el comportament)');
    t.equal(h.key('ArrowRight')?.aria, '54', 'fletxa dreta des del repòs: 54');
    t.equal(h.leave(), null, 'després del teclat, un ratolí que marxa no torna la costura al mig');
    t.equal(h.key('End')?.aria, '95', 'Fi: 95');
    t.equal(h.key('Home')?.aria, '5', 'Inici: 5');
    t.equal(h.key('PageUp')?.aria, '21', 'Re Pàg des del 0,05: 21');
    const v = settle(h);
    t.ok(near(v.x, 0.21), `amb moviment reduït arriba al 0,21 (${v.x})`);
  }
  {
    const h = createHandle();
    h.key('ArrowRight');
    h.key('ArrowRight');
    h.key('ArrowRight');
    t.equal(h.key('ArrowRight')?.aria, '66', 'quatre fletxes dretes: 66, cada pas parteix de la destinació i no d’on és la costura');
  }
  {
    const h = createHandle();
    t.equal(h.move('mouse', 0.8)?.aria, '80', 'el ratolí mana sense prémer: passar-hi per sobre porta la destinació al 0,8');
    settle(h);
    t.equal(h.leave(), { x: 0.8, aria: '50', moving: true, touched: true }, 'el ratolí que se’n va torna la destinació al repòs, aria inclosa, i la costura hi va en camí');
    t.equal(settle(h), { x: 0.5, aria: '50', moving: false, touched: true }, 'i hi arriba');
  }
  {
    const h = createHandle();
    h.down('mouse', 0.7);
    t.equal(h.leave(), null, 'un ratolí que surt mentre arrossega no torna la costura al mig');
    h.up();
    t.equal(h.leave()?.aria, '50', 'una vegada deixat anar, sí');
  }
  {
    const h = createHandle();
    h.down('touch', 0.9);
    t.equal(h.move('touch', 1.2)?.aria, '95', 'un dit que arrossega fora del panell queda retallat al 95');
    h.up();
    t.equal(h.leave(), null, 'i en aixecar-se no torna');
  }
  {
    const h = createHandle();
    h.key('ArrowRight');
    t.equal(h.leave(), null, 'fixada pel teclat…');
    t.equal(h.move('mouse', 0.2)?.aria, '20', '…un ratolí que torna a entrar recupera el comandament');
    t.equal(h.leave()?.aria, '50', 'i, en marxar, la torna al mig');
  }
  {
    const h = createHandle();
    h.move('mouse', 0.7);
    t.equal(h.move('touch', 0.1), null, 'un dit que passa després del ratolí no mou res…');
    t.equal(h.leave(), null, '…però compta com a darrer punter: en marxar no torna la costura al mig');
  }
  {
    const h = createHandle();
    h.key('ArrowRight');
    h.narrow(true);
    t.equal(h.leave(), { x: 0.5, aria: '50', moving: false, touched: true }, 'passar a estret desfà el «fixat» del teclat: el ratolí que marxa respon (i ja és al mig)');
  }

  // La demostració de la costura a estret (`nudge`): la fa la pàgina, i cedeix al primer gest de qui llegeix.
  {
    const h = createHandle();
    t.equal(h.nudge(0.7), { x: 0.5, aria: '70', moving: true, touched: false }, 'una passada de demostració porta la destinació al 0,7 i no marca «tocat»');
    t.equal(h.nudge(2)?.aria, '95', 'la demostració també queda retallada: 95');
    h.down('touch', 0.2);
    t.equal(h.nudge(0.7), null, 'un cop algú ha tocat la maneta, la demostració ja no hi mou res');
    t.equal(peek(h).aria, '20', 'i la destinació continua sent la del gest');
  }
  {
    const h = createHandle();
    h.down('mouse', 0.8);
    h.narrow(true);
    t.equal(h.leave(), null, 'com abans, passar a estret no desfà un arrossegament que encara no s’ha deixat anar');
  }

  // ── El CSS diu el mateix ──
  const source = fs.readFileSync(fromRoot('src/components/home/OfferReveal.astro'), 'utf8');
  const css = source.slice(source.indexOf('<style>'), source.indexOf('</style>'));
  const rest = /\.stage\s*\{\s*--x:\s*([\d.]+);/.exec(css);
  t.ok(rest !== null && Number(rest[1]) === REST, `el --x de repòs del CSS és REST (${rest?.[1]})`);
  const found = {};
  const re = /--(veil-render|open-render|veil-wire|open-wire|more-wire):\s*clamp\(0,\s*calc\(\((?:var\(--x\)\s*-\s*([\d.]+)|([\d.]+)\s*-\s*var\(--x\))\)\s*\*\s*([\d.]+)\),\s*1\);/g;
  for (const m of css.matchAll(re)) {
    found[m[1]] = { side: m[2] !== undefined ? 'render' : 'wire', from: Number(m[2] ?? m[3]), slope: Number(m[4]) };
  }
  t.equal(Object.keys(found), Object.keys(RAMPS), 'el CSS declara les cinc rampes, en el mateix ordre');
  for (const [name, spec] of Object.entries(RAMPS)) {
    t.equal(found[name], { side: spec.side, from: spec.from, slope: spec.slope }, `la rampa «${name}» del CSS té els nombres del mòdul`);
  }
}
