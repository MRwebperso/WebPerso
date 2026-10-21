/*
 * El registre de contrastos del tema fosc, calculat a partir de
 * `src/styles/theme-dark.css` i no copiat a mà.
 *
 * - Cada color de text fa 4,5:1 com a mínim (WCAG 2.1, AA en cos petit) sobre
 *   `--paper` i sobre `--paper-sunk`; els `-dim`, sobre `--paper`, que és el
 *   fons de la fitxa que recula.
 * - Cada `-dim` és exactament el que en dona la seva regla (vegeu el
 *   comentari de `theme-dark.css`), al hex.
 * - La taula de la capçalera de `theme-dark.css` diu el que surt del càlcul.
 *
 * Les ràtios que depenen del que pinta el navegador (degradats retallats,
 * traços puntejats) no són aquí: es mesuren al navegador i els comentaris ho
 * diuen (`0c5b5a3`).
 */
import fs from 'node:fs';
import { fromRoot } from './lib.mjs';

const AA = 4.5;
/** El terra de la regla (c): una mica per sobre de 4,5 perquè un arrodoniment no hi faci caure. */
const FLOOR = 4.55;

const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const channel = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (c) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const fmt = (n) => n.toFixed(2).replace('.', ',');

/** El punt `t` del segment que va de `paper` a `color`, arrodonit canal a canal. */
const along = (color, paper, t) => color.map((v, i) => Math.round(paper[i] + t * (v - paper[i])));
/** El primer punt del segment que arriba a `target` de contrast sobre `paper`. */
function firstReaching(color, paper, target) {
  for (let k = 0; k <= 100_000; k++) {
    const c = along(color, paper, k / 100_000);
    if (contrast(c, paper) >= target) return c;
  }
  return null;
}

export default async function palette(t) {
  const css = fs.readFileSync(fromRoot('src/styles/theme-dark.css'), 'utf8');
  const body = css.slice(css.indexOf(':root:root {'));
  const tok = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tok[name] = toRgb(value.toLowerCase());
  const need = ['paper', 'paper-sunk', 'ink', 'ink-soft', 'ink-faint', 'accent', 'accent-soft', 'vermell', 'rule'];
  if (!t.ok(need.every((n) => tok[n]), `theme-dark.css declara ${need.join(', ')}`)) return;
  const P = tok.paper;

  // ── Les regles dels `-dim` ──
  const inkDim = along(tok.ink, P, 0.55);
  const rules = {
    'ink-dim': ['(a) 55 %', inkDim],
    'rule-dim': ['(a) 55 %', along(tok.rule, P, 0.55)],
    'paper-sunk-dim': ['(a) 55 %', along(tok['paper-sunk'], P, 0.55)],
    'accent-dim': ['(b) contrast de --ink-dim', firstReaching(tok.accent, P, contrast(inkDim, P))],
    'ink-faint-dim': [`(c) terra ${fmt(FLOOR)}`, firstReaching(tok['ink-faint'], P, FLOOR)],
    'ink-soft-dim': ['(d) mitjana geomètrica', firstReaching(tok['ink-soft'], P, Math.sqrt(contrast(inkDim, P) * FLOOR))],
  };
  for (const [name, [rule, value]] of Object.entries(rules)) {
    if (!t.ok(tok[name], `theme-dark.css declara --${name}`)) continue;
    t.equal(toHex(tok[name]), value && toHex(value), `--${name} és el que dona la seva regla ${rule}`);
  }

  // ── AA ──
  const text = ['ink', 'ink-soft', 'ink-faint', 'accent', 'vermell'];
  const ledger = [];
  for (const name of text) {
    const onPaper = contrast(tok[name], P);
    const onSunk = contrast(tok[name], tok['paper-sunk']);
    ledger.push(`--${name.padEnd(14)} ${fmt(onPaper).padStart(6)} ${fmt(onSunk).padStart(6)}`);
    t.ok(onPaper >= AA, `--${name} sobre --paper: ${fmt(onPaper)}:1 (mínim ${fmt(AA)})`);
    t.ok(onSunk >= AA, `--${name} sobre --paper-sunk: ${fmt(onSunk)}:1 (mínim ${fmt(AA)})`);
  }
  for (const name of ['ink-dim', 'accent-dim', 'ink-soft-dim', 'ink-faint-dim']) {
    if (!tok[name]) continue;
    const onPaper = contrast(tok[name], P);
    ledger.push(`--${name.padEnd(14)} ${fmt(onPaper).padStart(6)}      ·`);
    t.ok(onPaper >= AA, `--${name} sobre --paper: ${fmt(onPaper)}:1 (mínim ${fmt(AA)})`);
  }
  for (const name of ['accent', 'ink-faint']) {
    const r = contrast(tok[name], tok['accent-soft']);
    t.ok(r >= AA, `--${name} sobre --accent-soft (ressalt del commutador): ${fmt(r)}:1`);
  }
  t.note(`ràtios (sobre --paper, sobre --paper-sunk):\n        ${ledger.join('\n        ')}`);

  // ── La taula de la capçalera diu el que surt del càlcul ──
  const header = css.slice(0, css.indexOf(':root:root {'));
  const rows = [...header.matchAll(/\*\s+--([\w-]+)\s+(\d+,\d+)\s+(\d+,\d+)/g)];
  t.ok(rows.length >= 4, 'la capçalera de theme-dark.css té la taula de contrastos');
  for (const [, name, onPaper, onSunk] of rows) {
    if (!tok[name]) continue;
    t.equal(
      [onPaper, onSunk],
      [fmt(contrast(tok[name], P)), fmt(contrast(tok[name], tok['paper-sunk']))],
      `la taula de la capçalera, fila --${name}`,
    );
  }
}
