/*
 * Cronologia: el que el diagrama ha de complir i que cap tipus no diu.
 *
 * - Quatre trams de viatge, cap de llargada zero (Barcelona → «Projectes
 *   europeus» no té trasllat i no en porta cap).
 * - A cada pas, com a molt dos punts, un tram i un ram a la vista, segons el
 *   CSS de `TimelineFigure.astro` llegit del fitxer (vegeu `visibleIn()`).
 * - Les fites de `milestones` són les de la unió `MilestoneId`, en el mateix
 *   ordre.
 * - La darrera càmera enquadra el contorn de Catalunya amb el marge `CAT_PAD`.
 * - La frontera dels Pirineus és la vora comuna d'Espanya i de França.
 * - Els dos formats d'atribut tornen el que han rebut.
 */
import fs from 'node:fs';
import { bundle, fromRoot } from './lib.mjs';
import {
  CAT_PAD,
  FRONTIER_LONLAT,
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

  /*
   * Abans es comparava `fig.fites` amb `milestones`, i era una identitat:
   * `buildInstrument` en torna l'ordre tal qual. La font independent és la
   * unió `MilestoneId`, escrita a mà a `timeline.ts`: una clau que hi sobri
   * té coordenades, càmera i text, però cap pas que la mostri, i cap tipus no
   * ho atura.
   */
  const union = /export type MilestoneId =([^;]+);/.exec(fs.readFileSync(fromRoot('src/data/timeline.ts'), 'utf8'));
  t.equal(
    milestones.map((m) => m.id),
    union ? [...union[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : null,
    '`milestones` porta les fites de la unió `MilestoneId`, en el mateix ordre',
  );

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
  const css = figureCss();
  const visible = visibleIn(css, t);
  const states = (cls) => ['current', 'prev', 'past', 'future'].filter((s) => visible(cls, s)).join('+') || 'cap';
  t.note(
    `segons el CSS es veuen: punts ${states('figure__node')}; trams ${states('figure__route-segment')}; rams ${Object.keys(fig.rams).map((k) => states(`figure__${k}`)).join('/')}`,
  );
  const count = (cls, nodes, index) => nodes.filter((node) => visible(cls, stateAt(node, index))).length;
  for (let index = 0; index < fig.fites.length; index++) {
    const nodes = count('figure__node', fig.fites.map((f) => f.index), index);
    const segs = count('figure__route-segment', segments.map((f) => f.index), index);
    // Cada ram és un `<g class="figure__<clau>">` amb el `data-node` de la seva fita.
    const ramsShown = Object.entries(fig.rams).filter(([kind, r]) => visible(`figure__${kind}`, stateAt(r.node, index))).length;
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

// ── El CSS de la figura ──

/*
 * Quins estats es veuen ho diu el `<style>` de `TimelineFigure.astro`, i es
 * llegeix d'allà. Fins al 21/10/2026 la comprovació comptava sobre una còpia
 * escrita a mà (`SHOWN`), i si el CSS deixava veure els punts «past» o els
 * trams «prev» continuava en verd: comprovava la còpia, no el mapa.
 *
 * El model és el mínim que el fitxer fa servir i prou: regles planes, selectors
 * de descendència, l'element per la seva classe i `data-state` en positiu o
 * dins d'un `:not()`, sota `.figure.is-live`. Les regles d'`.is-priming` en
 * queden fora perquè són d'un sol fotograma, abans de la primera fita. La
 * cascada es resol com el navegador: `!important`, especificitat i ordre.
 * Una regla que toqui `opacity`, `display` o `visibility` d'un element del mapa
 * amb un selector que el model no sap llegir no es descarta en silenci: fa
 * fallar la comprovació, perquè qui l'ha escrita adapti el model.
 */
const LIVE = new Set(['figure', 'is-live']);
const TRANSIENT = 'is-priming';

/** Talla `text` per `sep` fora de parèntesis i claudàtors. */
function splitTop(text, sep) {
  const out = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (depth === 0 && sep.test(ch)) {
      if (current.trim()) out.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function figureCss() {
  const source = fs.readFileSync(fromRoot('src/components/home/TimelineFigure.astro'), 'utf8');
  const css = source.slice(source.indexOf('<style>') + '<style>'.length, source.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const open = [];
  let last = 0;
  for (const m of css.matchAll(/[{}]/g)) {
    const chunk = css.slice(last, m.index);
    last = m.index + 1;
    if (m[0] === '{') {
      open.push({ prelude: chunk.trim(), start: last });
      continue;
    }
    const block = open.pop();
    if (block.prelude.startsWith('@')) continue;
    const decls = splitTop(css.slice(block.start, m.index), /;/).map((d) => {
      const colon = d.indexOf(':');
      const value = d.slice(colon + 1).trim();
      return { prop: d.slice(0, colon).trim().toLowerCase(), value: value.replace(/\s*!important$/, ''), important: /!important$/.test(value) };
    });
    const at = open.map((o) => o.prelude).filter((p) => p.startsWith('@'));
    rules.push({ selectors: splitTop(block.prelude, /,/), decls, at, order: rules.length });
  }
  return rules;
}

const TOKEN = /\.[\w-]+|\[[^\]]*\]|:not\([^()]*\)|::?[\w-]+(?:\([^()]*\))?|#[\w-]+|\*|[a-zA-Z][\w-]*/gy;
const compound = (text) => {
  TOKEN.lastIndex = 0;
  const tokens = [];
  let m;
  while (TOKEN.lastIndex < text.length && (m = TOKEN.exec(text))) tokens.push(m[0]);
  return TOKEN.lastIndex === text.length ? tokens : null;
};
const stateTest = (token) => {
  const m = /^(:not\()?\[data-state=(['"]?)([\w-]+)\2\]\)?$/.exec(token);
  return m && { negated: Boolean(m[1]), state: m[3] };
};

/**
 * Com llegeix el selector l'element de classe `cls`: `null` si no hi apunta;
 * `{ outOfModel: true }` si hi apunta d'una manera que el model no sap
 * avaluar; si no, la funció que diu si s'hi aplica en l'estat donat.
 */
function reading(selector, cls) {
  const parts = splitTop(selector, /[\s>]/);
  const last = parts[parts.length - 1];
  if (!new RegExp(`\\.${cls}(?![\\w-])`).test(last)) return null;
  const target = compound(last);
  if (!target) return { outOfModel: true };
  const tests = [];
  for (const token of target) {
    if (token === `.${cls}`) continue;
    const test = stateTest(token);
    if (!test) return { outOfModel: true };
    tests.push(test);
  }
  for (const part of parts.slice(0, -1)) {
    const tokens = compound(part);
    if (tokens?.includes(`.${TRANSIENT}`)) return { applies: () => false };
    if (!tokens || !tokens.every((tk) => tk.startsWith('.') && LIVE.has(tk.slice(1)))) return { outOfModel: true };
  }
  return { applies: (state) => tests.every((test) => (test.state === state) !== test.negated) };
}

/** [id, classe, element]; `:not(x)` val el que val `x`. */
function specificity(selector) {
  const s = [0, 0, 0];
  for (const part of splitTop(selector, /[\s>]/)) {
    for (const token of compound(part) ?? []) {
      const inner = /^:not\((.*)\)$/.exec(token);
      if (inner) specificity(inner[1]).forEach((v, i) => (s[i] += v));
      else if (token.startsWith('#')) s[0]++;
      else if (token.startsWith('.') || token.startsWith('[') || (token.startsWith(':') && !token.startsWith('::'))) s[1]++;
      else if (token !== '*') s[2]++;
    }
  }
  return s;
}

const outranks = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};

/** `(classe, estat) → es veu?`, segons les regles de `figureCss()`. */
function visibleIn(rules, t) {
  const reported = new Set();
  const report = (message) => {
    if (!reported.has(message)) t.ok(false, message);
    reported.add(message);
  };
  const cascaded = (cls, state, prop) => {
    let best = null;
    for (const rule of rules) {
      const decl = rule.decls.findLast((d) => d.prop === prop);
      if (!decl) continue;
      for (const selector of rule.selectors) {
        const r = reading(selector, cls);
        if (!r) continue;
        if (r.outOfModel || rule.at.length) {
          report(`TimelineFigure.astro: «${selector}»${rule.at.map((a) => ` dins de «${a}»`).join('')} toca \`${prop}\` de .${cls} i la comprovació no el sap llegir`);
          continue;
        }
        if (!r.applies(state)) continue;
        const rank = [decl.important ? 1 : 0, ...specificity(selector), rule.order];
        if (!best || outranks(rank, best.rank)) best = { rank, value: decl.value };
      }
    }
    return best?.value;
  };
  return (cls, state) => {
    const opacity = cascaded(cls, state, 'opacity') ?? '1';
    if (!/^[\d.]+$/.test(opacity)) report(`TimelineFigure.astro: l'opacitat de .${cls} «${state}» és «${opacity}», i la comprovació només llegeix nombres`);
    return Number(opacity) > 0 && cascaded(cls, state, 'display') !== 'none' && cascaded(cls, state, 'visibility') !== 'hidden';
  };
}
