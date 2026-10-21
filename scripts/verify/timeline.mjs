/*
 * Cronologia: el que el diagrama ha de complir i que cap tipus no diu.
 *
 * - Quatre trams de viatge, cap de llargada zero (Barcelona → «Projectes
 *   europeus» no té trasllat i no en porta cap).
 * - A cada pas, com a molt dos punts, un tram i un ram a la vista.
 * - La darrera càmera enquadra el contorn de Catalunya amb el marge `CAT_PAD`.
 * - La frontera dels Pirineus és la vora comuna d'Espanya i de França.
 * - Els dos formats d'atribut tornen el que han rebut.
 */
import { bundle } from './lib.mjs';
import {
  CAT_PAD,
  FRONTIER_LONLAT,
  SHOWN,
  VIEW,
  buildInstrument,
  countryRings,
  decodeCameras,
  decodeLangs,
  encodeCameras,
  encodeLangs,
  hatchTransform,
  stateAt,
} from '../../src/data/timeline-instrument.ts';
import { langKeys } from '../../src/data/lang-keys.ts';

export default async function timeline(t) {
  // `timeline.ts` importa `ui.ts` sense extensió: passa per esbuild.
  const { milestones } = await bundle('src/data/timeline.ts');
  const fig = buildInstrument(milestones);

  t.equal(fig.fites.map((f) => f.id), milestones.map((m) => m.id), 'les fites surten en l’ordre de `milestones`');

  // ── Trams ──
  const segments = fig.fites.filter((f) => f.segment !== null);
  t.equal(segments.length, 4, 'quatre trams de viatge');
  for (const f of segments) {
    const m = /^M(-?[\d.]+),(-?[\d.]+) Q[-\d.]+,[-\d.]+ (-?[\d.]+),(-?[\d.]+)$/.exec(f.segment);
    t.ok(m !== null, `el tram de «${f.id}» és una corba quadràtica: ${f.segment}`);
    if (m) t.ok(m[1] !== m[3] || m[2] !== m[4], `el tram de «${f.id}» no té llargada zero`);
  }
  const skipped = fig.fites.filter((f) => f.index > 0 && f.segment === null).map((f) => f.id);
  t.equal(skipped, ['europa'], 'l’única fita sense tram (a banda de la primera) és «Projectes europeus»');

  // ── Què es veu a cada pas ──
  const rams = Object.values(fig.rams).map((r) => r.node);
  for (let index = 0; index < fig.fites.length; index++) {
    const shown = (kind, nodes) => nodes.filter((node) => SHOWN[kind].includes(stateAt(node, index))).length;
    const nodes = shown('node', fig.fites.map((f) => f.index));
    const segs = shown('segment', segments.map((f) => f.index));
    const ramsShown = shown('ram', rams);
    t.ok(nodes <= 2, `pas ${index}: ${nodes} punts a la vista (com a molt 2)`);
    t.ok(nodes >= 1, `pas ${index}: el punt d’ara és a la vista`);
    t.ok(segs <= 1, `pas ${index}: ${segs} trams a la vista (com a molt 1)`);
    t.ok(ramsShown <= 1, `pas ${index}: ${ramsShown} rams a la vista (com a molt 1)`);
  }
  t.equal(
    [0, 1, 2, 3].map((index) => stateAt(2, index)),
    ['future', 'future', 'current', 'prev'],
    'la regla d’estat: futur, actual, d’on es ve',
  );
  t.equal(stateAt(0, 3), 'past', 'dues fites enrere ja és «past»');

  // ── La darrera càmera ──
  const last = fig.fites[fig.fites.length - 1].camera;
  const shot = fig.catalonia.map((p) => ({ x: last.scale * p.x + last.tx, y: last.scale * p.y + last.ty }));
  const box = shot.reduce(
    (b, p) => ({ minX: Math.min(b.minX, p.x), maxX: Math.max(b.maxX, p.x), minY: Math.min(b.minY, p.y), maxY: Math.max(b.maxY, p.y) }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  );
  const eps = 1e-9;
  t.ok(
    box.minX >= CAT_PAD - eps && box.maxX <= VIEW.w - CAT_PAD + eps && box.minY >= CAT_PAD - eps && box.maxY <= VIEW.h - CAT_PAD + eps,
    `Catalunya cap dins del quadre amb ${CAT_PAD} de marge: ${JSON.stringify(box)}`,
  );
  const tightX = Math.abs(box.minX - CAT_PAD) < 1e-6 && Math.abs(VIEW.w - CAT_PAD - box.maxX) < 1e-6;
  const tightY = Math.abs(box.minY - CAT_PAD) < 1e-6 && Math.abs(VIEW.h - CAT_PAD - box.maxY) < 1e-6;
  t.ok(tightX || tightY, 'el contorn toca el marge en un dels dos eixos: l’enquadrament surt del contorn, no d’un nombre a ull');

  // ── La frontera ──
  const key = ([lon, lat]) => `${lon},${lat}`;
  const frontier = FRONTIER_LONLAT.map(key);
  const rings = countryRings().map((ring) => ring.map(key));
  const containing = rings.filter((ring) => frontier.every((p) => ring.includes(p)));
  t.equal(containing.length, 2, 'dos anells de país porten tots els punts de la frontera');
  const runIn = (ring, run) => ring.join(' ').includes(run.join(' '));
  t.ok(containing.some((ring) => runIn(ring, frontier)), 'un dels dos la recorre d’oest a est, sense salts');
  t.ok(
    containing.some((ring) => ring[0] === frontier[0] && runIn(ring, frontier.slice(1).reverse())),
    'l’altre comença al primer punt i la recorre d’est a oest al final',
  );

  // ── Formats d'atribut ──
  const attr = encodeCameras(fig.fites.map((f) => f.camera));
  t.equal(encodeCameras(decodeCameras(attr)), attr, '`data-camera`: codificar el descodificat torna el mateix text');
  const decoded = decodeCameras(attr);
  t.ok(
    fig.fites.every(
      (f, i) => decoded[i].scale === f.camera.scale && Math.abs(decoded[i].tx - f.camera.tx) <= 0.05 && Math.abs(decoded[i].ty - f.camera.ty) <= 0.05,
    ),
    '`data-camera`: l’escala torna exacta i el desplaçament a una dècima',
  );
  for (const m of milestones) {
    t.equal(
      decodeLangs(encodeLangs(m.langs)),
      langKeys.map((k) => ({ key: k, state: m.langs[k] })),
      `\`data-langs\` de «${m.id}» torna les sis llengües en l’ordre de \`langKeys\``,
    );
  }
  t.equal(hatchTransform(), 'rotate(38)', 'la trama de l’HTML estàtic');
  t.equal(hatchTransform(2), 'rotate(38) scale(0.5000)', 'la trama compensada per l’escala');
}
