# web-perso — Miquel Rodrigues

Lloc estàtic (Astro) amb paritat estricta català–francès.

```bash
npm install && npm run dev
```

`npm run build` genera `dist/`. `npm run check` valida tipus i, de retruc, la paritat lingüística.

## Canvi de domini

Una sola línia, a [src/config/site.mjs](src/config/site.mjs):

```js
export const siteUrl = process.env.SITE_URL ?? 'https://…';
```

`astro.config.mjs` l'importa i d'allà surten canòniques, `hreflang`, sitemap i `robots.txt`. Cap altre fitxer no coneix el domini: tots els enllaços interns són relatius a l'arrel. Alternativament, l'amfitrió pot definir `SITE_URL` com a variable d'entorn de compilació i no cal tocar el codi.

## Contracte lingüístic

- Rutes mirall pregenerades: `/ca/…` i `/fr/…`. Cap llengua sense prefix.
- L'arrel `/` no és una portada: encamina segons tria desada → llengua del navegador → `x-default`, i sense JS mostra les dues portes en igualtat.
- Els segments de ruta es tradueixen des del registre de [src/i18n/utils.ts](src/i18n/utils.ts) (`casos` → `cas`). Els identificadors de cas no es tradueixen.
- El commutador de llengua porta a la **ruta mirall de la pàgina on ets**, mai a la portada, i conserva la secció (àncora). Funciona sense JS; amb JS és instantani (pre-càrrega + transició de vista).
- `src/i18n/ui.ts` imposa la paritat per tipus: si una clau existeix en català i no en francès, `npm run check` falla.
- Les àncores de secció (`#casos`, `#metode`…) són idèntiques en les dues llengües, perquè la commutació pugui mantenir la posició.

## Sistema de disseny

Dues famílies, tres rols ([src/styles/tokens.css](src/styles/tokens.css)):

| Rol | Família | On s'aplica |
|---|---|---|
| `--font-display` | Newsreader | Títols, signatura de la capçalera |
| `--font-text` | Newsreader | Tot el text corregut |
| `--font-ui` | IBM Plex Sans | Navegació, etiquetes (`.eyebrow`), xifres (`.nums`), peu |

La regla que fa funcionar la parella és l'acotació del Plex: si s'escampa al text corregut, el conjunt cau al registre de producte digital. Auto-allotjades des de npm, sense CDN de tercers; només es baixa el subconjunt llatí (58 kB serif + 46 kB sans, tots dos precarregats).

**Nota de contingut:** escriu la ela geminada com `l·l` (ela + punt volat U+00B7), no amb els caràcters precomposats `Ŀ`/`ŀ`. Els precomposats viuen al subconjunt llatí estès i n'activen la descàrrega (36 kB de més) sense cap guany.

`--ink-faint` és el gris més clar que manté AA en cos petit **sobre els dos fons**: 5,06:1 sobre `--paper` i 4,63:1 sobre `--paper-sunk`. La comprovació sobre el fons enfonsat no és opcional, perquè hi viuen etiquetes de la secció de mètode i tota la fitxa dels casos.

Les revelacions en scroll (`.reveal`) porten l'estat inicial condicionat a `.js`, una classe que un script del `<head>` posa a l'element arrel abans del primer pintat. Sense aquesta condició, qualsevol contingut amb `.reveal` es quedaria a opacitat zero per sempre amb el JS desactivat.

## Estructura

```
src/config/site.mjs      domini + metadades (únic punt configurable)
src/data/                contingut editorial i dades de la cronologia
src/i18n/                llengües, registre de rutes, cadenes
src/layouts/             BaseLayout (head, hreflang, canònica)
src/components/          Header, Footer, LangSwitcher, HomeContent, CaseContent
src/pages/{ca,fr}/       rutes mirall (embolcalls fins)
src/styles/              fonts.css + tokens.css + base.css
```

## Cronologia

L'única peça amb scrollytelling del lloc ([Timeline.astro](src/components/home/Timeline.astro)). Tres eixos sincronitzats —temps, territori, llengua— amb el repartiment següent:

- **Els passos porten el contingut.** Cada fita té any, títol, territori i estat de cada llengua en text. Funcionen sols: sense JS, amb lector de pantalla i en pantalla estreta, on el diagrama no es mostra.
- **L'instrument és decoratiu** (`aria-hidden`), perquè no hi diu res que no sigui ja al text. Sense JS es queda en l'estat d'avui —trajectòria sencera, sis llengües de treball—, que és una lectura vàlida; la classe `is-live` és el que cedeix el control als passos.
- La geometria viu a [src/data/timeline.ts](src/data/timeline.ts) i no es tradueix: el diagrama surt dels mateixos números en les dues llengües. Les longituds del traç es calculen en compilació perquè el dibuix progressiu s'aturi al node exacte de cada pas.
- El pas actiu es marca **només** amb el filet d'accent. Enfosquir els altres amb `opacity` baixa les etiquetes de `--ink-faint` a 3,4:1 i se'n va per sota de l'AA en cos petit.

## Casos

Quatre casos, sense filtres, amb una sola plantilla ([CaseContent.astro](src/components/CaseContent.astro)) i les dades a [src/data/cases.ts](src/data/cases.ts).

- **Afegir o treure un cas és editar `cases.ts` i res més.** La tupla de quatre i els tres capítols per cas són el que imposa la paritat: si el francès no cobreix el que hi ha en català, `npm run check` falla.
- **L'ordre de l'array és l'ordre de lectura**, a la portada i a la navegació entre casos. Els casos d'activitat pròpia van primer, perquè la frontera 2.2 del brief no permet que la feina individual quedi visualment per sota de l'associativa.
- `kind` té tres valors: `commission`, `own` i `associative`. Els dos primers són activitat individual; el tercer obliga l'etiqueta *«realitzat en el marc associatiu»*. Cap dels tres té tractament visual propi: l'etiqueta és text, no distintiu.
- **Els slugs no es tradueixen** (`/ca/casos/casa-macia/` ↔ `/fr/cas/casa-macia/`): són noms propis de projecte, i és el que fa que `hreflang` i el commutador de llengua surtin sols del registre de `src/i18n/utils.ts`.
- La plantilla reutilitza les primitives de la portada —`.wrap`, `.section-grid`, `.rail`, `.eyebrow`, `.lead`— i els capítols repeteixen la peça dels blocs d'oferta. És el que evita que les pàgines de cas divergeixin d'estil de la one-page.
- A les fitxes de la portada, tota la superfície és clicable amb **un sol enllaç**, el del títol, estirat amb un `::after`. La contrapartida assumida és que el text de la fitxa no es pot seleccionar amb el ratolí.
- L'eix llengua de cada cas surt del mateix registre que la cronologia (`langKeys` de `timeline.ts`), i per això es llegeix sempre en el mateix ordre.

## Pendent

- Domini definitiu: només la línia `siteUrl` de `site.mjs`, o la variable d'entorn `SITE_URL` a l'amfitrió. El correu professional ja hi és.
- Contingut dels quatre casos: pendent de confirmació dels fets i de la tria de la selecció.
- Micro-interaccions, formulari, Decap CMS i desplegament: blocs 7–10 de l'ordre de treball.
