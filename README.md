# web-perso — Miquel Rodrigues

Lloc estàtic (Astro) amb paritat estricta català–francès.

```bash
npm install && npm run dev
```

`npm run build` genera `.vercel/output/`, no `dist/`: hi ha un adaptador de Vercel, i el motiu és a «Contingut editable i CMS». Totes les pàgines continuen pregenerades.

Les dues ordres que validen no cobreixen el mateix, i val la pena saber-ho:

| Ordre | Què atrapa |
|---|---|
| `npm run check` | Tipus, i els esquemes de les col·leccions de contingut: paritat de lliurables, camps buits, valors de `kind` fora de la llista |
| `npm run build` | Tot l'anterior, i a més les comprovacions que travessen fitxers: `order` duplicat entre casos, carpeta de casos buida |

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
src/content.config.ts    esquema de les col·leccions: on viu la paritat dels casos
src/content/cases/       un fitxer per cas, amb les dues llengües a dins
src/data/                portada, cronologia, etiquetes i accés als casos
src/i18n/                llengües, registre de rutes, cadenes
src/layouts/             BaseLayout (head, hreflang, canònica)
src/components/          Header, Footer, LangSwitcher, HomeContent, CaseContent
src/pages/{ca,fr}/       rutes mirall (embolcalls fins)
src/pages/api/           autenticació del CMS: les úniques rutes a petició
src/pages/admin/         pantalla del CMS (config a public/admin/config.yml)
src/styles/              fonts.css + tokens.css + base.css
```

## Cronologia

L'única peça amb scrollytelling del lloc ([Timeline.astro](src/components/home/Timeline.astro)). Tres eixos sincronitzats —temps, territori, llengua— amb el repartiment següent:

- **Els passos porten el contingut.** Cada fita té any, títol, territori i estat de cada llengua en text. Funcionen sols: sense JS, amb lector de pantalla i en pantalla estreta, on el diagrama no es mostra.
- **L'instrument és decoratiu** (`aria-hidden`), perquè no hi diu res que no sigui ja al text. Sense JS es queda en l'estat d'avui —trajectòria sencera, sis llengües de treball—, que és una lectura vàlida; la classe `is-live` és el que cedeix el control als passos.
- La geometria viu a [src/data/timeline.ts](src/data/timeline.ts) i no es tradueix: el diagrama surt dels mateixos números en les dues llengües. Les longituds del traç es calculen en compilació perquè el dibuix progressiu s'aturi al node exacte de cada pas.
- El pas actiu es marca **només** amb el filet d'accent. Enfosquir els altres amb `opacity` baixa les etiquetes de `--ink-faint` a 3,4:1 i se'n va per sota de l'AA en cos petit.

## Casos

Sis casos, sense filtres, amb una sola plantilla ([CaseContent.astro](src/components/CaseContent.astro)) i un fitxer de dades per cas a [src/content/cases/](src/content/cases/). El brief en demanava tres o quatre; els sis són decisió de l'usuari del 30/07/2026.

- **Afegir o treure un cas és deixar o esborrar un fitxer a `src/content/cases/`.** El nom del fitxer és el slug i el slug és la URL en les dues llengües. Cada fitxer porta el text en català i en francès, i tots dos són obligatoris: no es pot publicar una llengua per davant de l'altra.
- **El camp `order` és l'ordre de lectura**, a la portada i a la navegació entre casos, i el fixa l'usuari. Obre la llista un lloc de treball, que és el que sosté la jerarquia de la frontera 2.2; els Banys d'Arles van en quart lloc per decisió seva del 30/07/2026, tot i quedar per sota dels casos associatius. Els números poden tenir buits, però no repetir-se: amb dos casos al mateix número l'ordre passaria a dependre de com llegeix la carpeta el sistema de fitxers, i la compilació s'atura. El camp `year` no ordena res i no es publica: només documenta l'any d'inici.
- `kind` té cinc valors ([case-kinds.ts](src/data/case-kinds.ts)): `position`, `commission`, `own`, `affiliation` i `associative`. Els quatre primers són activitat individual; el darrer obliga l'etiqueta *«realitzat en el marc associatiu»*. Cap no té tractament visual propi: l'etiqueta és text, no distintiu. Les distincions són deliberades: dir «encàrrec» d'un lloc assalariat seria inexacte, i presentar una vinculació de recerca (`affiliation`) com a lloc de treball seria inflar-la. El marc exacte és part del senyal.
- **Els slugs no es tradueixen** (`/ca/casos/banys-d-arles/` ↔ `/fr/cas/banys-d-arles/`): són noms propis de projecte o d'entitat, i és el que fa que `hreflang` i el commutador de llengua surtin sols del registre de `src/i18n/utils.ts`. La contrapartida és que un lector francès veu una URL en català per a una entitat que coneix pel nom francès.
- La plantilla reutilitza les primitives de la portada —`.wrap`, `.section-grid`, `.rail`, `.eyebrow`, `.lead`— i els capítols repeteixen la peça dels blocs d'oferta. És el que evita que les pàgines de cas divergeixin d'estil de la one-page.
- A les fitxes de la portada, tota la superfície és clicable amb **un sol enllaç**, el del títol, estirat amb un `::after`. La contrapartida assumida és que el text de la fitxa no es pot seleccionar amb el ratolí.
- L'eix llengua de cada cas surt del mateix registre que la cronologia (`langKeys` de `timeline.ts`), i per això es llegeix sempre en el mateix ordre.

## Contacte

Correu professional visible i formulari senzill ([Contact.astro](src/components/home/Contact.astro)).

- **El formulari necessita una variable d'entorn**, `FORM_ENDPOINT`: la URL que dona el servei de formularis (Formspree, Web3Forms, Getform i companyia serveixen tots; l'enviament és un `POST` amb els camps `name`, `email` i `message`). **Mentre no hi sigui, el formulari no es dibuixa** i la secció es queda amb el correu directe. És deliberat: val més una via que funciona que un formulari que empassa el missatge en silenci.
- **Funciona sense JS**: `method="post"` cap al servei, que redirigeix a la seva pàgina de confirmació. Amb JS no surt de la pàgina: enviament per `fetch` i estats a la mateixa secció, amb el missatge conservat si l'enviament falla.
- **La validació és pròpia**, i no la del navegador, per la mateixa raó que tot el contingut és bilingüe: les cadenes natives surten en la llengua de la interfície de qui llegeix, no en la de la pàgina. Els errors viuen a `home.ts`, amb la paritat imposada pels tipus.
- La revisió en directe d'un camp només s'engega **quan ja ha fallat una vegada**: corregir algú mentre escriu per primer cop és molestar-lo. L'error va lligat al camp amb `aria-describedby` i el resultat de l'enviament, a una regió `role="status"`.
- Contra el correu brossa, un **camp trampa** fora del recorregut del tabulador i sense veu al lector de pantalla. No hi ha cap servei extern de verificació ni cap galeta.

## Moviment i marca

Fora de la cronologia, el moviment és el de la secció 4.4 del brief: mesurat, i mai per cridar l'atenció sobre ell mateix.

- **Revelació en scroll** sobre els blocs de llista —oferta, principis de mètode, fitxes de cas i capítols de cas—, amb un escalonament de 70 ms per posició. No la porten ni el hero ni la cronologia: el primer ja es veu en carregar i la segona té la seva pròpia mecànica.
- **L'estat inicial el condiciona `.js`**, que s'afegeix a l'arrel abans del primer pintat. El text el tapa una regla de CSS i qui la desfà és l'script, de manera que aquest té dues sortides directes cap al contingut visible —moviment reduït i absència d'`IntersectionObserver`— abans de dependre de l'observador.
- **Transició entre pàgines:** fosa curta a la sortida i mig centímetre de pujada a l'entrada. La capçalera té nom de transició propi i en queda fora: és idèntica a totes les pàgines i, animada com a grup a part, no parpelleja.
- **La marca** (`public/favicon.svg` i la capçalera) és la mateixa a la pestanya i a la pàgina: horitzó pla i muntanya irregular que dibuixa la M. A la capçalera va inline i pren els tokens —l'horitzó amb `--mark-rule`, la muntanya amb `currentColor`, que segueix el color de l'enllaç. El vermell està acotat a la marca i no entra a la interfície: si s'escampés, competiria amb l'accent.

## Contingut editable i CMS

Decap escriu fitxers de dades al dipòsit —Markdown, YAML, JSON— i no sap editar TypeScript. Com que tot el contingut del lloc era TypeScript tipat, calia triar què es movia. **S'han migrat els casos i prou**, per decisió de l'usuari del 30/07/2026:

| Contingut | On viu | Per què |
|---|---|---|
| Casos | `src/content/cases/*.json` | És el que canvia més sovint, i és l'únic que val la pena poder publicar sense tocar codi |
| Portada, cronologia, cadenes d'interfície | TypeScript, com abans | El nucli invariant de la secció 2.1, la geometria del diagrama i les etiquetes del marc són on la garantia de tipus val més i on el text es toca menys |

**Què se n'ha perdut i què se n'ha guanyat.** Abans la paritat dels casos la imposava el compilador. Ara la imposa l'esquema de [src/content.config.ts](src/content.config.ts), i el canvi no és una pèrdua neta:

- Cada cas és **un sol fitxer amb les dues llengües a dins**, i totes dues són obligatòries. Els fets —`kind`, `year`, `langs`— són un camp compartit i no dos alineats per índex, de manera que el desfasament entre fets i text que la forma anterior feia possible ara no es pot ni escriure. Els camps de text no poden ser buits, cosa que el compilador no comprovava: `''` és un `string` vàlid.
- La sola regla que no surt de l'estructura és la **paritat de `deliverables`**, que és de longitud lliure. Quatre lliurables en català i dos en francès és l'asimetria que no es veu fins que algú obre l'altra llengua, i és el que comprova el `superRefine`.
- El que ja no es comprova és **el nombre de casos**: la tupla de sis n'imposava sis, i ara sis és un fet de la carpeta. És el preu d'acceptar que afegir un cas sigui deixar-hi un fitxer.

**Autenticació.** El rerefons `git-gateway` de Decap és de Netlify i aquí no serveix; a Vercel cal el rerefons `github`, i això vol dir una aplicació OAuth i un intercanvi de codi per testimoni que no pot passar pel navegador. D'aquí surt l'única part del lloc que no és estàtica: [src/pages/api/auth.ts](src/pages/api/auth.ts) i [src/pages/api/callback.ts](src/pages/api/callback.ts), amb `prerender = false`, i l'adaptador `@astrojs/vercel` que les fa possibles. Totes les pàgines del lloc continuen pregenerades —quinze, més la de l'administració— i el seu HTML és idèntic al d'abans de l'adaptador.

- L'adreça de retorn es construeix damunt d'`Astro.site`, no de l'amfitrió de la petició: el domini continua sortint d'un sol lloc. La conseqüència és que **l'adreça de retorn registrada a GitHub ha de ser exactament `<domini>/api/callback/`**, amb barra final, i que l'administració s'ha d'obrir des d'aquest mateix domini. Si es canvia de domini es mouen les dues coses alhora, `SITE_URL` i l'aplicació OAuth.
- Tres variables d'entorn a Vercel: `GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET` i, opcionalment, `GITHUB_OAUTH_SCOPE` (per omissió `repo`, que va bé amb dipòsit privat; si el dipòsit és públic, `public_repo` és més estret). Si en falta cap, la ruta respon amb un text que la nomena, no amb un 500 mut.
- Es llegeixen de `process.env` i **no** d'`import.meta.env`, i no és un detall: `import.meta.env` se substitueix en compilació, i el secret quedaria incrustat al paquet. La contrapartida és que un fitxer `.env` local no les alimenta; per editar en local, la via és `npx decap-server` amb el rerefons local, que no fa servir OAuth.
- `/admin/` i `/api/` queden fora dels cercadors pel `robots.txt`, i les pàgines de trànsit de l'autenticació porten `noindex` i `X-Robots-Tag`.

**La pantalla d'administració** és [src/pages/admin/index.astro](src/pages/admin/index.astro) —una pàgina d'Astro pregenerada, no un fitxer d'HTML a `public/`— i la configuració de Decap és [public/admin/config.yml](public/admin/config.yml), que Decap va a buscar tot sol a `/admin/config.yml`. La repartició respon a dues coses que només es veuen provant-ho:

- A `astro dev`, un `public/admin/index.html` respon a `/admin/index.html` i dona **404 a `/admin/`**. Com que l'edició en local passa justament pel servidor de desenvolupament, la forma còmoda hi era la forma trencada.
- El `base_url` que Decap necessita surt d'`Astro.site` i s'injecta a la pàgina amb arrencada manual (`CMS_MANUAL_INIT`), perquè un fitxer de `public/` no pot llegir `SITE_URL` i el domini ha de sortir d'un sol lloc. Amb l'origen de la finestra en lloc del domini canònic, un desplegament de previsualització deixaria la galeta d'estat en un domini i el retorn en un altre, i l'autenticació moriria amb un «l'estat de la sessió no ha tornat».
- La pàgina queda fora del sitemap pel filtre d'`astro.config.mjs`: és una pàgina pregenerada com les altres i, sense filtre, hi entraria.
- **A `astro dev`, `/admin/` respon amb el cos correcte i estat 404.** Ve de l'encaminament i18n, que amb `prefixDefaultLocale` no reconeix cap camí sense prefix de llengua fora de l'arrel; el navegador el dibuixa igualment i l'edició en local funciona. A la sortida compilada `/admin/` és un fitxer i respon 200 —comprovat servint `.vercel/output/static` el 05/08/2026—, de manera que en producció no hi és.

**La i18n de Decap no es fa servir, i és deliberat.** Seria la via natural —panells costat per costat i un botó per copiar d'una llengua a l'altra—, però amb `structure: single_file` Decap espera els camps no traduïts *dins* de l'objecte de la llengua per omissió, no a l'arrel del fitxer. Aquí `order`, `kind`, `year` i `langs` són a l'arrel perquè són un sol camp compartit, que és el que fa impossible el desfasament entre els fets i el text. Provat el 05/08/2026: amb la i18n activada, Decap obre els casos amb aquests quatre camps buits i marcats com a obligatoris, i desar-los els perdria. Per tant, les dues llengües són dos camps d'objecte amb els mateixos subcamps —escrits una sola vegada, per àncora de YAML—; es perd el copiar d'una llengua a l'altra i no es perd la paritat.

**Edició en local, sense OAuth ni desplegament**: `npx decap-server` en un terminal, `npm run dev` a l'altre, i `/admin/` a localhost escriu directament als fitxers del disc. És la via provada d'aquesta sessió, i la que val per a qualsevol canvi de text abans que l'aplicació OAuth existeixi. Decap desa amb salts de línia Unix, que és el que el dipòsit ja guarda; la indentació de dos espais i els apòstrofs tipogràfics es conserven.

## Pendent

- Domini definitiu: només la línia `siteUrl` de `site.mjs`, o la variable d'entorn `SITE_URL` a l'amfitrió. El correu professional ja hi és. `SITE_URL` està definida a Vercel des del 30/07/2026 i la canònica de producció ja hi apunta. **El 30/07/2026 l'usuari ha creat el subdomini `miquel.clm.cat`, encara inactiu**; mentre no ho estigui, el lloc viu a `web-perso-azure.vercel.app`. Quan s'activi, tres coses es mouen juntes: `SITE_URL` a Vercel, l'adreça de retorn de l'aplicació OAuth de GitHub i el domini del projecte a Vercel.
- Casos: la selecció, els fets i l'ordre són els que va donar l'usuari, i l'eix llengua dels Banys d'Arles està confirmat. Queda per confirmar l'eix llengua dels dos casos de recerca —`ca, es, en` per al GRECS/OACU i `es, en` per al MOVOKEUR—, deduït del marc institucional i no dit per l'usuari, i el territori del MOVOKEUR («Barcelona · projecte internacional»).
- `FORM_ENDPOINT` a Vercel: fins que no hi sigui, el formulari de contacte no es dibuixa en producció.
- **Decap, el que hi falta:** l'**aplicació OAuth de GitHub**, que l'ha de crear l'usuari, i les tres variables a Vercel. Fins que no hi siguin, `/admin/` existeix i es carrega, però el botó d'entrada no pot completar res —i el lloc públic no en queda afectat. L'edició en local amb `npx decap-server` funciona ja avui i no en depèn. El que no s'ha pogut provar en aquest entorn és **el camí d'OAuth sencer** (cal l'aplicació de GitHub) i **la creació d'un cas nou des del CMS**: el nom de fitxer el deriva del títol en català, i convé mirar-lo abans de publicar, perquè és l'adreça en les dues llengües.
- Desplegament (bloc 10): funciona; amb l'adaptador, el directori de sortida el detecta el preajust d'Astro a Vercel, i si algú hi hagués fixat `dist` a mà, quedaria buit.
- Auditoria d'accessibilitat, pendent des del bloc 5 i més exigible ara que el lloc és públic.
