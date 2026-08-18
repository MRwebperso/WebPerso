# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

El [README.md](README.md) és la documentació de referència i és exhaustiu: contracte lingüístic, sistema de disseny, cronologia, casos, contacte i CMS, cadascun amb el perquè de les decisions. **Llegeix-lo abans de tocar qualsevol d'aquestes àrees.** Aquest fitxer no el repeteix: recull el que no es dedueix ni del codi ni del README.

## Ordres

```bash
npm run dev      # astro dev, port 4321 (o $PORT si està ocupat)
npm run check    # tipus + esquemes de col·lecció
npm run build    # tot l'anterior + comprovacions que travessen fitxers
```

**No hi ha cap framework de proves ni cap linter.** No inventis `npm test`; la xarxa de seguretat són `check` i `build`, i no cobreixen el mateix. `check` no atrapa l'`order` duplicat entre casos ni la carpeta de casos buida, perquè aquestes dues comprovacions viuen en temps d'execució a [getCases()](src/data/cases.ts) i només salten compilant. Si has tocat `src/content/cases/`, l'ordre que val és `build`.

La compilació deixa `.vercel/output/`, no `dist/`. Un `dist/` al disc és sobrer d'abans de l'adaptador.

## Paritat CA–FR: tres capes, tres fitxers

L'invariant central del projecte és que cap llengua va per davant de l'altra. No l'imposa un sol mecanisme, i cal saber quin et parla quan alguna cosa falla:

1. **Rutes** — [src/i18n/utils.ts](src/i18n/utils.ts). El registre `segments` tradueix els segments publicats (`casos` → `cas`); els slugs de cas no es tradueixen mai. `getAlternates()` alimenta alhora el commutador de llengua i les `hreflang`, de manera que afegir una ruta nova vol dir afegir-hi una clau, no cablejar enllaços.
2. **Cadenes d'interfície** — [src/i18n/ui.ts](src/i18n/ui.ts). La paritat la imposa el tipus: una clau en català sense bessona en francès no compila.
3. **Contingut dels casos** — [src/content.config.ts](src/content.config.ts). Un fitxer per cas amb les dues llengües a dins; els fets (`order`, `kind`, `year`, `langs`) són a l'arrel i compartits, i el `superRefine` comprova l'única regla que no surt de l'estructura: `deliverables` ha de tenir la mateixa longitud en les dues llengües.

Afegir una tercera llengua al registre de `utils.ts` fa caure [src/data/cases.ts](src/data/cases.ts) fins que l'esquema de la col·lecció tingui la clau nova. És deliberat.

## Prototips llençables

`/hero-demo/`, `/la-travessa/` i `/la-ruta/` **no són el lloc**: van fora de la navegació i de l'i18n, són en català només, porten `noindex` i s'han d'esborrar quan hagin fet la seva feina. La paritat CA–FR no s'hi aplica encara, i duplicar-hi el text ara costaria més del que val.

- [SPEC_LA_RUTA.md](SPEC_LA_RUTA.md) és l'especificació vigent de `/la-ruta/` i declara `/la-travessa/` superada i pendent d'esborrar. Si treballes en aquesta àrea, l'espec mana.
- Aquests prototips carreguen `base.css` pel seu compte i **es queden en paper clar a posta**. El tema fosc del lloc viu a [src/styles/theme-dark.css](src/styles/theme-dark.css) i el carrega només `BaseLayout`; invertir-los els trauria el sentit. El selector és `:root:root` i no `:root` per una raó d'ordre d'emissió del bundler — no el simplifiquis.

## Convencions

**Comentaris i missatges de commit en català.** Els comentaris del codi expliquen el perquè d'una decisió, sovint amb la contrapartida assumida i la data en què l'usuari la va prendre; no els redueixis a descripcions del què.

**Els missatges de commit són ASCII pur**, sense accents ni ce trencada: «la darrera fita es Catalunya sencera», «contorns de paisos», «la capcelera». El format és `Àrea: descripció en minúscules`, amb un cos llarg en prosa que documenta el raonament i les xifres comprovades. Segueix-ho.

**Escriu la ela geminada com `l·l`** (ela + punt volat U+00B7), mai amb els precomposats `Ŀ`/`ŀ`. Aquests viuen al subconjunt llatí estès i n'activen la descàrrega: 36 kB de més sense cap guany.

**El contrast és un requisit, no una preferència.** Els comentaris i els missatges de commit porten les ràtios mesurades sobre els dos fons. Abans de canviar un color o d'aplicar `opacity` a text petit, comprova que continua per damunt de 4,5:1 — el README documenta els casos on ja se n'ha caigut.

## Variables d'entorn i degradació silenciosa

Cap `.env` no alimenta res d'això: les rutes de l'API llegeixen `process.env` i **no** `import.meta.env`, perquè aquesta segona se substitueix en compilació i incrustaria el secret al paquet.

| Variable | Absent vol dir |
|---|---|
| `SITE_URL` | Cau al valor de [src/config/site.mjs](src/config/site.mjs). Únic punt del projecte que coneix el domini |
| `FORM_ENDPOINT` | **El formulari de contacte no es dibuixa.** La secció es queda amb el correu directe, sense error |
| `GITHUB_OAUTH_ID` / `_SECRET` / `_SCOPE` | L'entrada al CMS respon amb un text que nomena la variable que falta |

Si es canvia de domini es mouen tres coses alhora: `SITE_URL` a Vercel, el domini del projecte i l'adreça de retorn de l'aplicació OAuth de GitHub (exactament `<domini>/api/callback/`, amb barra final).

## Trampes del servidor de desenvolupament

- **`/admin/` respon amb el cos correcte i estat 404** a `astro dev`. Ve de l'encaminament i18n amb `prefixDefaultLocale`, el navegador el dibuixa igualment i a la sortida compilada respon 200. No és una regressió.
- Per editar contingut en local sense OAuth: `npx decap-server` en un terminal i `npm run dev` a l'altre.
