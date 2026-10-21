/*
 * `npm run verify`: passa totes les comprovacions de `scripts/verify/` i surt
 * amb codi 1 si en falla cap. Vegeu la capçalera de `lib.mjs` i la taula
 * d'ordres del README.
 */
import { Tally } from './lib.mjs';

const checks = ['timeline', 'maneta'];

let failed = 0;
for (const name of checks) {
  const t = new Tally(name);
  try {
    const { default: run } = await import(`./${name}.mjs`);
    await run(t);
  } catch (error) {
    t.failures.push(`no s'ha pogut acabar: ${error?.stack ?? error}`);
  }
  const mark = t.failures.length === 0 ? 'ok ' : 'KO ';
  console.log(`${mark} ${name.padEnd(10)} ${t.passed} comprovacions${t.failures.length ? `, ${t.failures.length} errors` : ''}`);
  for (const n of t.notes) console.log(`      · ${n}`);
  for (const f of t.failures) console.log(`    ✗ ${f}`);
  failed += t.failures.length;
}

if (failed > 0) {
  console.log(`\n${failed} comprovacions fallides.`);
  process.exitCode = 1;
}
