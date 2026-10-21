/*
 * Utilitats dels scripts de `scripts/verify/`.
 *
 * No és un marc de proves (decisió de Miquel, 21/10/2026): són comprovacions
 * de contractes que ni `astro check` ni `astro build` no veuen, escrites en
 * Node pla i sense cap dependència nova. Cada fitxer de comprovació exporta
 * una funció que rep un `t` i hi apunta les afirmacions; `run.mjs` les passa
 * totes i surt amb codi 1 si en falla cap.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const fromRoot = (...parts) => path.join(root, ...parts);

/** Recull d'afirmacions d'una comprovació. */
export class Tally {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failures = [];
    this.notes = [];
  }
  ok(cond, message) {
    if (cond) this.passed++;
    else this.failures.push(message);
    return cond;
  }
  equal(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    return this.ok(a === e, `${message}\n      esperat: ${e}\n      obtingut: ${a}`);
  }
  note(message) {
    this.notes.push(message);
  }
}

/*
 * Els mòduls nous (`lang-keys.ts`, `timeline-instrument.ts`…) es carreguen tal
 * qual amb `import`: Node 24 esborra els tipus, i les seves importacions de
 * valor porten l'extensió `.ts`. Els antics, en canvi, importen sense extensió
 * (`timeline.ts` → `../i18n/ui`) o porten mòduls virtuals d'Astro
 * (`cases.ts` → `astro:content`), i aquests passen per esbuild, que ja és al
 * dipòsit com a dependència d'Astro. Els mòduls virtuals es substitueixen per
 * l'imprescindible perquè el fitxer es pugui avaluar.
 */
const astroStubs = {
  name: 'astro-stubs',
  setup(b) {
    b.onResolve({ filter: /^astro:content$|^astro\/loaders$/ }, (args) => ({ path: args.path, namespace: 'astro-stub' }));
    b.onLoad({ filter: /.*/, namespace: 'astro-stub' }, (args) => {
      if (args.path === 'astro/loaders') return { contents: 'export const glob = (options) => ({ options });', loader: 'js' };
      // La `z` d'Astro és la seva zod 3, la mateixa que valida els fitxers
      // (vegeu la capçalera de `src/content.config.ts`).
      return {
        contents: `export { z } from ${JSON.stringify(fromRoot('node_modules/astro/node_modules/zod/index.js'))};
          export const defineCollection = (collection) => collection;
          export const getCollection = async () => [];`,
        loader: 'js',
        resolveDir: root,
      };
    });
  },
};

export async function bundle(entry) {
  const result = await build({
    entryPoints: [fromRoot(entry)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    plugins: [astroStubs],
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
