# CLAUDE.md

El [README.md](README.md) és la documentació de referència i és exhaustiu: contracte lingüístic, sistema de disseny, cronologia, casos, contacte i contingut dels casos, cadascun amb el perquè de les decisions. **Llegeix-lo abans de tocar qualsevol d'aquestes àrees.** Aquest fitxer no el repeteix: recull el que no es dedueix ni del codi ni del README.

## Textos públics

Abans d'escriure o reescriure cap text de `home.ts`, dels casos o de la cronologia, llegeix [EDITORIAL.md](EDITORIAL.md): hi són el lector, la veu, el banc de fets i el procés, que és una sola sessió.

## Ordres

```bash
npm run dev      # astro dev, port 4321 (o $PORT si està ocupat)
npm run check    # tipus + esquemes de col·lecció
npm run build    # esquemes + comprovacions que travessen fitxers, sense tipus
npm run verify   # contractes en Node pla: cronologia, maneta, enllaços, paleta, sortida del build, casos, capçaleres
```

**No hi ha cap framework de proves ni cap linter.** No inventis `npm test`; la xarxa de seguretat són `check`, `build` i `verify`, i no cobreixen el mateix. `verify` no és un marc de proves: són scripts de Node pla a `scripts/verify/` que no compilen el lloc ni obren cap navegador. `links` llegeix la sortida de l'últim `npm run build`, que cal fer abans, i `links` i `build` es posen en vermell si aquesta sortida és més vella que `src/`, `public/`, `astro.config.mjs` o `package.json`; `palette` calcula les ràtios del tema fosc a partir de `theme-dark.css`; `headers` passa `vercel.json` pel transformador de rutes de Vercel (`@vercel/routing-utils`) i comprova que les capçaleres de seguretat arribin a tots els camins, `/ruta/` inclosa (que hi porta la seva CSP estreta), i que la barra final i la memòria cau de `/_astro/`, que abans feia l'adaptador, hi siguin. `check` no atrapa l'`order` duplicat entre casos ni la carpeta de casos buida, perquè aquestes dues comprovacions viuen en temps d'execució a [resolveCases()](src/data/cases.ts); `verify cases` sí que les atrapa, sense compilar (sobre els fitxers de `src/content/cases/` i sobre fixtures), i `build` continua fent-les saltar. Si has tocat `src/content/cases/`, l'ordre que val és `build`.

El que es desplega és `dist/`: lloc estàtic pur, sense adaptador ni funcions des del 13/11/2026. Si trobes un `.vercel/output/` al disc, és d'abans i no compta.

## Paritat CA–FR: tres capes, tres fitxers

L'invariant central del projecte és que cap llengua va per davant de l'altra. No l'imposa un sol mecanisme, i cal saber quin et parla quan alguna cosa falla:

1. **Rutes** — [src/i18n/utils.ts](src/i18n/utils.ts). El registre `segments` tradueix els segments publicats (`casos` → `cas`); els slugs de cas no es tradueixen mai. `getAlternates()` alimenta alhora el commutador de llengua i les `hreflang`, de manera que afegir una ruta nova vol dir afegir-hi una clau, no cablejar enllaços.
2. **Cadenes d'interfície** — [src/i18n/ui.ts](src/i18n/ui.ts). La paritat la imposa el tipus: una clau en català sense bessona en francès no compila.
3. **Contingut dels casos** — [src/content.config.ts](src/content.config.ts). Un fitxer per cas amb les dues llengües a dins; els fets (`order`, `kind`, `year`, `langs`) són a l'arrel i compartits, i el `superRefine` comprova l'única regla que no surt de l'estructura: `deliverables` ha de tenir la mateixa longitud en les dues llengües.

Afegir una tercera llengua al registre de `utils.ts` fa caure [src/data/cases.ts](src/data/cases.ts) fins que l'esquema de la col·lecció tingui la clau nova. És deliberat.

## La Ruta

El codi de La Ruta és al dipòsit `MRwebperso/la-ruta`; el lloc el serveix a `/ruta/` pel rewrite de `vercel.json`, amb la seva CSP estreta (vegeu README). Els prototips `/hero-demo/`, `/la-ruta/` i `/la-travessa/` s'han esborrat (novembre 2026): no els recreïs.

## Convencions

**Comentaris i missatges de commit en català.** Els comentaris del codi expliquen el perquè d'una decisió, sovint amb la contrapartida assumida i la data en què l'usuari la va prendre; no els redueixis a descripcions del què.

**Els missatges de commit són ASCII pur**, sense accents ni ce trencada: «la darrera fita es Catalunya sencera», «contorns de paisos», «la capcelera». El format és `Àrea: descripció en minúscules`, amb un cos llarg en prosa que documenta el raonament i les xifres comprovades. Segueix-ho.

**Escriu la ela geminada com `l·l`** (ela + punt volat U+00B7), mai amb els precomposats `Ŀ`/`ŀ`. Aquests viuen al subconjunt llatí estès i n'activen la descàrrega: 36 kB de més sense cap guany.

**El contrast és un requisit, no una preferència.** Els comentaris i els missatges de commit porten les ràtios mesurades sobre els dos fons. Abans de canviar un color o d'aplicar `opacity` a text petit, comprova que continua per damunt de 4,5:1 — el README documenta els casos on ja se n'ha caigut.

## Variables d'entorn i degradació silenciosa

Cap `.env` no alimenta res d'això: `src/config/site.mjs` llegeix `process.env` en compilació, que és on Vercel posa les variables.

| Variable | Absent vol dir |
|---|---|
| `SITE_URL` | Cau al valor de [src/config/site.mjs](src/config/site.mjs). Únic punt del projecte que coneix el domini |
| `FORM_ENDPOINT` | **El formulari de contacte no es dibuixa.** La secció es queda amb el correu directe, sense error |

Si es canvia de domini es mouen dues coses alhora: `SITE_URL` a Vercel i el domini del projecte a Vercel.

## No hi ha CMS

Decap i les seves rutes d'autenticació van sortir del projecte el 13/11/2026 sense haver-se fet servir: els casos (`src/content/cases/*.json`) s'editen directament, i l'esquema de `src/content.config.ts` els valida a `check` i `build`. No hi tornis a afegir cap ruta a petició sense parlar-ne: el lloc és estàtic, i és el que manté curta la llista d'avisos de seguretat.
