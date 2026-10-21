/*
 * La maneta de l'oferta: el contracte de `src/data/offer-handle.ts` i el CSS
 * d'`OfferReveal.astro`, que no el pot importar.
 *
 * - Al repòs no s'obre res: ni cossos ni cotes, a cap banda.
 * - La costura no surt mai de [MIN, MAX]; Inici i Fi hi porten.
 * - L'amortiment arriba al lloc, en pocs fotogrames o d'un sol pas amb
 *   moviment reduït.
 * - L'aria anuncia el percentatge enter de la posició.
 * - El `--x` de repòs i les cinc rampes del CSS diuen els mateixos nombres que
 *   el mòdul.
 */
import fs from 'node:fs';
import { fromRoot } from './lib.mjs';
import {
  EPSILON,
  KEY_STEP,
  MAX,
  MIN,
  PAGE_STEP,
  RAMPS,
  REST,
  aimAt,
  ariaValue,
  damp,
  keyTarget,
  ramp,
} from '../../src/data/offer-handle.ts';

export default async function maneta(t) {
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

  // ── Aria ──
  t.equal([ariaValue(MIN), ariaValue(MAX), ariaValue(REST)], ['5', '95', '50'], 'aria: 5, 95 i 50, els valors del marcatge');
  for (let v = MIN; v <= MAX + 1e-9; v += 0.01) {
    if (!t.ok(ariaValue(v) === String(Math.round(v * 100)), `aria de ${v}`)) break;
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
