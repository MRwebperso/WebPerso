# web-perso — Miquel Rodrigues

Lloc estàtic (Astro) amb paritat estricta català–francès.

```bash
npm install && npm run dev
```

`npm run build` genera `dist/`. El lloc és estàtic pur: cap adaptador i cap funció (des del 13/11/2026; el perquè és a «Contingut dels casos»).

Les tres ordres que validen no cobreixen el mateix, i val la pena saber-ho:

| Ordre | Què atrapa |
|---|---|
| `npm run check` | Tipus, i els esquemes de les col·leccions de contingut: paritat de lliurables, camps buits, valors de `kind` fora de la llista |
| `npm run build` | Els mateixos esquemes de col·lecció que `check`, però no els tipus, i a més les comprovacions que travessen fitxers: `order` duplicat entre casos, carpeta de casos buida |
| `npm run verify` | Els contractes que no són ni tipus ni esquema, comprovats en Node pla ([scripts/verify/](scripts/verify/)): la geometria de la cronologia (quatre trams, què es veu a cada pas, l'enquadrament final, la frontera comuna) i els dos formats d'atribut que van de l'HTML al guió; el contracte de la maneta de l'oferta (repòs, límits, teclat, amortiment, aria) i la política del gest —qui mana, què torna la costura al repòs, què passa en passar a estret i enrere—, que viu a l'autòmat pur `createHandle` d'[offer-handle.ts](src/data/offer-handle.ts) i no al guió d'`OfferReveal.astro` (que només l'adapta al DOM); i que les rampes del seu CSS diguin els mateixos nombres; i, sobre la sortida de l'última compilació, que cada enllaç intern i cada `#àncora` tinguin destí, que cada `canonical` i cada `hreflang` portin a una pàgina de la sortida, que el `canonical` sigui el de la pàgina mateixa i que els `hreflang` es responguin d'un mirall a l'altre, i que les dues portades tinguin les seccions en l'ordre de `homeSections`; que el JS de client de les pàgines del lloc vagi en línia, sense cap tros compartit, sense cap frase de la còpia i sense cap nom de llengua; i la paleta del tema fosc, llegida de [theme-dark.css](src/styles/theme-dark.css): que cada color de text faci 4,5:1 sobre els dos fons, que cada `-dim` del carril de casos sigui el que en dona la seva regla, al hex, i que la taula de contrastos de la capçalera digui el que surt del càlcul; i les ordenacions dels casos (`resolveCases` i `byRecency`, de [cases.ts](src/data/cases.ts)), sobre els fitxers de debò i sobre fixtures: la carpeta buida i l'`order` repetit cauen amb el seu missatge i els empats d'any respecten l'`order`, sense compilar; i les capçaleres i l'encaminament de [vercel.json](vercel.json), passats pel transformador de rutes de Vercel: les de seguretat arriben a tots els camins de mostra, `/ruta/` inclosa, cap directiva de CSP no carrega contingut fora de `/ruta/`, la barra final es posa amb un 308 abans dels fitxers, `/_astro/` porta la memòria cau llarga i cap regla no depèn de l'amfitrió. No és un marc de proves: no compila el lloc ni obre cap navegador —els enllaços i el JS de client els llegeixen de l'últim `npm run build`, que cal fer abans, i es neguen a passar si és més vell que el fitxer més nou de `src/`, `public/`, `astro.config.mjs` o `package.json`—, o sigui que no veu el comportament ni el que es pinta, i no substitueix cap de les dues ordres de sobre |

## Canvi de domini

Una sola línia, a [src/config/site.mjs](src/config/site.mjs):

```js
export const siteUrl = process.env.SITE_URL ?? 'https://…';
```

`astro.config.mjs` l'importa i d'allà surten canòniques, `hreflang`, sitemap i `robots.txt`. Cap altre fitxer no coneix el domini públic: tots els enllaços interns són relatius a l'arrel. Alternativament, l'amfitrió pot definir `SITE_URL` com a variable d'entorn de compilació i no cal tocar el codi.

## Contracte lingüístic

- Rutes mirall pregenerades: `/ca/…` i `/fr/…`. Cap llengua sense prefix.
- L'arrel `/` no és una portada: encamina segons tria desada → llengua del navegador → `x-default`, i sense JS mostra les dues portes en igualtat.
- Els segments de ruta es tradueixen des del registre de [src/i18n/utils.ts](src/i18n/utils.ts) (`casos` → `cas`). Els identificadors de cas no es tradueixen.
- El commutador de llengua porta a la **ruta mirall de la pàgina on ets**, mai a la portada, i conserva la secció (àncora). Funciona sense JS; amb JS és instantani (pre-càrrega + transició de vista).
- `src/i18n/ui.ts` imposa la paritat per tipus: si una clau existeix en català i no en francès, `npm run check` falla.
- Les àncores de secció (`#casos`, `#metode`…) són idèntiques en les dues llengües, perquè la commutació pugui mantenir la posició. Viuen en un sol lloc, `homeSections` de [src/i18n/utils.ts](src/i18n/utils.ts), en l'ordre de la portada: d'allà les llegeixen la navegació, les seccions, la tornada de les pàgines de cas i el guió del carril.

## Sistema de disseny

Dues famílies, tres rols ([src/styles/tokens.css](src/styles/tokens.css)):

| Rol | Família | On s'aplica |
|---|---|---|
| `--font-display` | Newsreader | Títols, signatura de la capçalera |
| `--font-text` | Newsreader | Tot el text corregut |
| `--font-ui` | IBM Plex Sans | Navegació, etiquetes (`.eyebrow`), xifres (`.nums`), peu |

La regla que fa funcionar la parella és l'acotació del Plex: si s'escampa al text corregut, el conjunt cau al registre de producte digital. Auto-allotjades des de npm, sense CDN de tercers; només es baixa el subconjunt llatí (58 kB serif + 46 kB sans, tots dos precarregats).

**Nota de contingut:** escriu la ela geminada com `l·l` (ela + punt volat U+00B7), no amb els caràcters precomposats `Ŀ`/`ŀ`. Els precomposats viuen al subconjunt llatí estès i n'activen la descàrrega (36 kB de més) sense cap guany.

`--ink-faint` és el gris de text més apagat que ha de mantenir AA en cos petit **sobre els dos fons**: en el tema fosc, que és el que serveix el lloc, fa 7,63:1 sobre `--paper` i 6,85:1 sobre `--paper-sunk` (al tema clar de `tokens.css`, que només fan servir els prototips, 5,12:1 i 4,69:1). Les ràtios del tema fosc, i les del joc amb què reculen les fitxes del carril, les calcula `npm run verify` a partir de [theme-dark.css](src/styles/theme-dark.css). La comprovació sobre el fons enfonsat no és opcional, perquè hi viuen etiquetes de la secció de mètode i tota la fitxa dels casos.

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
src/styles/              fonts.css + tokens.css + base.css
scripts/verify/          comprovacions de `npm run verify`, en Node pla
```

## Cronologia

L'única peça amb scrollytelling del lloc ([Timeline.astro](src/components/home/Timeline.astro)). Tres eixos sincronitzats —temps, territori, llengua— amb el repartiment següent:

- **Els passos porten el contingut.** Cada fita té any, títol, territori i estat de cada llengua en text. Funcionen sols: sense JS i amb lector de pantalla.
- **En pantalla estreta l'instrument es compacta i s'enganxa a dalt** (decisió de Miquel, 21/10/2026, després de veure el telèfon sense ell): per sota de 62rem és una barra amb l'any i el territori en una línia, el mapa i les llengües al costat, i els passos desfilen a sota. És el mateix guió i el mateix marcatge que a l'escriptori; només canvia on s'adhereix (`.scrolly__figure` a [Timeline.astro](src/components/home/Timeline.astro) en comptes de `.figure`). El mapa no passa de 24 % de l'alçada de la pantalla, i en un telèfon en horitzontal (alçada ≤ 30rem) la barra deixa d'enganxar-se: hi menjaria la meitat de la pantalla.
- **L'instrument és decoratiu** (`aria-hidden`), perquè no hi diu res que no sigui ja al text. Sense JS es queda en l'estat d'avui —trajectòria sencera, sis llengües de treball—, que és una lectura vàlida; la classe `is-live` és el que cedeix el control als passos.
- Els fets de cada fita (any, zones, estat de les llengües) viuen a [src/data/timeline.ts](src/data/timeline.ts) i la geometria del dibuix (projecció, contorns, coordenades, càmera) a [src/data/timeline-instrument.ts](src/data/timeline-instrument.ts), que també fixa quina fita es dibuixa a cada pas i el format dels atributs que el guió llegeix; [TimelineFigure.astro](src/components/home/TimelineFigure.astro) només dibuixa el que en surt. Cap dels dos no es tradueix: el diagrama surt dels mateixos números en les dues llengües. Cada tram del traç surt amb `pathLength="1"`: la longitud la mesura el navegador, i el dibuix progressiu s'atura al node exacte de cada pas sigui quin sigui el zoom.
- El pas actiu es marca **només** amb el filet d'accent, i als altres passos no s'hi posa `opacity`. En el tema fosc, que és el que serveix el lloc, `--ink-faint` a 0,8 ja dona 5,19:1 sobre `--paper`, però el 4,5:1 es perd per sota de 0,732 sobre `--paper` i de 0,762 sobre `--paper-sunk`: el marge és massa estret per sobreviure a un ajust de paleta, i per això la regla és no posar-n'hi gens en lloc d'un llindar. El 3,4:1 que s'havia escrit era del tema clar, que el lloc ja no serveix.
- **L'entrada a La Ruta és una banda amb un clip, no una frase** (decisió de Miquel, 22/10/2026: l'enllaç de text era massa discret). És [RutaTeaser.astro](src/components/home/RutaTeaser.astro), al cap de la secció i abans dels passos; el clip i el pòster són a `public/media/` (640×360, 24 fps, uns 350 kB) i surten de la pàgina real —`tools/teaser` al repositori de `la-ruta`—, de manera que es tornen a generar quan La Ruta canvia. No es baixa fins que la banda entra a la pantalla; amb moviment reduït, estalvi de dades o sense JS es queda el pòster. L'atribució d'OpenStreetMap hi va com a text sota la banda (`home.ts`, `ruta.credit`), perquè la que porta el fotograma fa 5 px reduïda. El paper del clip és el de La Ruta, clar sobre el negre del lloc: és el que fa que es vegi.

## Casos

Sis casos, sense filtres, amb una sola plantilla ([CaseContent.astro](src/components/CaseContent.astro)) i un fitxer de dades per cas a [src/content/cases/](src/content/cases/). El brief en demanava tres o quatre; els sis són decisió de l'usuari del 30/07/2026.

- **Afegir o treure un cas és deixar o esborrar un fitxer a `src/content/cases/`.** El nom del fitxer és el slug i el slug és la URL en les dues llengües. Cada fitxer porta el text en català i en francès, i tots dos són obligatoris: no es pot publicar una llengua per davant de l'altra.
- **El camp `order` és l'ordre de lectura**, a la portada i a la navegació entre casos, i el fixa l'usuari. Obre la llista un lloc de treball, que és el que sosté la jerarquia de la frontera 2.2; els Banys van en quart lloc per decisió seva del 30/07/2026, tot i quedar per sota dels casos associatius. Els números poden tenir buits, però no repetir-se: amb dos casos al mateix número l'ordre passaria a dependre de com llegeix la carpeta el sistema de fitxers, i la compilació s'atura. El camp `year` no es publica mai tal qual —el que es llegeix és `period`—, però des del 27/08/2026 sí que ordena el carril de la portada: les targetes van del més recent al més antic, i els empats els desfà `order` (hi ha dos casos del 2026 i dos del 2023).
- `kind` té cinc valors ([case-kinds.ts](src/data/case-kinds.ts)): `position`, `commission`, `own`, `affiliation` i `associative`. Els quatre primers són activitat individual; el darrer obliga l'etiqueta *«realitzat en el marc associatiu»*. Cap no té tractament visual propi: l'etiqueta és text, no distintiu. Les distincions són deliberades: dir «encàrrec» d'un lloc assalariat seria inexacte, i presentar una vinculació de recerca (`affiliation`) com a lloc de treball seria inflar-la. El marc exacte és part del senyal.
- **Els slugs no es tradueixen** (`/ca/casos/banys-d-arles/` ↔ `/fr/cas/banys-d-arles/`): són noms propis de projecte o d'entitat, i és el que fa que `hreflang` i el commutador de llengua surtin sols del registre de `src/i18n/utils.ts`. La contrapartida és que un lector francès veu una URL en català per a una entitat que coneix pel nom francès.
- La plantilla reutilitza les primitives de la portada —`.wrap`, `.section-grid`, `.rail`, `.eyebrow`, `.lead`— i els capítols repeteixen la peça dels blocs d'oferta. És el que evita que les pàgines de cas divergeixin d'estil de la one-page.
- **A la portada els casos són un carril cronològic** ([Cases.astro](src/components/home/Cases.astro)), no una graella. Les fitxes van del més recent al més antic, un filet les travessa a la mateixa alçada i cada fitxa hi posa la seva osca; la que s'obre s'eixampla i les altres es queden visibles i en gris. En repòs la fitxa diu període, títol curt, subtítol i marc; en obrir-se, el títol passa de groc a blanc i el subtítol i el marc deixen lloc a les tres competències, les sigles de les entitats i el botó de categoria.
- **Un sol enllaç per fitxa i és el botó**, sense capa que faci clicable tota la superfície: amb la capa, el botó es veuria premut només per tenir el cursor dins de la targeta. El repartiment és explícit —s'obre passant-hi per sobre, s'entra pel botó—, i el botó porta `aria-label` amb el títol del cas. La navegació entre pàgines de cas continua anant per `order`.
- **La gradació de les competències mesura l'ús dins d'aquell encàrrec, no el domini** ([case-skills.ts](src/data/case-skills.ts)). Per això són tres graons i cinc osques i no un percentatge: una barra plena al 60 % es llegeix com «l'hi falta un 40 %», que és el contrari del que ha de dir un portfolio. La paraula del nivell no es dibuixa; se serveix per `aria-label`.
- **`category` no és `kind`** ([case-categories.ts](src/data/case-categories.ts)). `kind` diu en quin règim es va fer la feina i és el mecanisme de la frontera 2.2; `category` diu de quina feina es tracta i és el text del botó. Tres valors i no cinc: al prototip es van provar «marca» i «territori» i cadascuna cobria un sol cas.
- El carril fa servir el vermell de la senyera aclarit a `#ec443a` (5,14:1 sobre `--paper`, 4,61:1 sobre `--paper-sunk`) per a l'osca i el període de la fitxa activa. És l'única excepció a la paleta d'un sol accent: no toca cap enllaç ni cap superfície, i el groc continua sent l'únic color d'interacció, també a les fletxes del carril, que es fan grogues en passar-hi per sobre. El mateix vermell, `--vermell` de `theme-dark.css`, marca també els errors del formulari de contacte.
- L'eix llengua de cada cas surt del mateix registre que la cronologia (`langKeys` de [lang-keys.ts](src/data/lang-keys.ts)), i per això es llegeix sempre en el mateix ordre.

## Portada al mòbil

El lloc es mira al telèfon abans que a l'escriptori —s'hi arriba des de la targeta—, i per això les peces animades no es degraden a text apilat (21/10/2026). Tres peces, tres adaptacions:

- **Hero** ([MinimalistHero.astro](src/components/ui/MinimalistHero.astro)): per sota de 48rem el retrat s'escala 1,15 i no 1,5 (`--portrait-scale`). Amb 1,5 sortia 88 px per amunt de la seva caixa i l'`overflow: hidden` li tallava el cap. La caixa de la figura fa l'alçada del retrat escalat (`--portrait-aspect`, de les mides del fitxer), el cercle cedeix a l'alçada de la pantalla (`100svh − 24rem`), el nom munta sobre la vora baixa i aquesta es dilueix en el fons (el fitxer acaba en sec a la cintura). Mesurat a 390×844, 375×667 i 360×640: el cap hi és sencer i el conjunt cap d'una pantalla.
- **Oferta** ([OfferReveal.astro](src/components/home/OfferReveal.astro)): la maneta existeix a totes les amplades, amb dos eixos. A 48rem i més, la costura és vertical i es mou d'esquerra a dreta; per sota és **horitzontal i es mou de dalt a baix** (`data-axis="y"`). Una costura vertical en un telèfon deixava cada bloc de text en ~150 px d'amplada. El dit només arrossega agafant la maneta (`touch-action: none` a la maneta i a res més): la resta del panell continua desplaçant la pàgina, i el ratolí tampoc no dirigeix per sobre a estret. La primera vegada que el panell es veu fa una passada de demostració (0,7 → 0,3 → 0,5, mètode `nudge` de l'autòmat, que no marca «tocat» i s'atura al primer gest); amb moviment reduït no n'hi ha. El canvi d'eix torna la costura al repòs, però un `resize` no: la barra d'adreces d'un telèfon el dispara en desplaçar-se.
- **Cronologia**: vegeu la secció corresponent.

## Contacte

Correu professional visible i formulari senzill ([Contact.astro](src/components/home/Contact.astro)).

- **El formulari necessita una variable d'entorn**, `FORM_ENDPOINT`: la URL que dona el servei de formularis (Formspree, Web3Forms, Getform i companyia serveixen tots; l'enviament és un `POST` amb els camps `name`, `email` i `message`). **Mentre no hi sigui, el formulari no es dibuixa** i la secció es queda amb el correu directe. És deliberat: val més una via que funciona que un formulari que empassa el missatge en silenci.
- **Funciona sense JS**: `method="post"` cap al servei, que redirigeix a la seva pàgina de confirmació. Amb JS no surt de la pàgina: enviament per `fetch` i estats a la mateixa secció, amb el missatge conservat si l'enviament falla.
- **La validació és pròpia**, i no la del navegador, per la mateixa raó que tot el contingut és bilingüe: les cadenes natives surten en la llengua de la interfície de qui llegeix, no en la de la pàgina. Els errors viuen a `home.ts`, amb la paritat imposada pels tipus.
- La revisió en directe d'un camp només s'engega **quan ja ha fallat una vegada**: corregir algú mentre escriu per primer cop és molestar-lo. L'error va lligat al camp amb `aria-describedby` i el resultat de l'enviament, a una regió `role="status"`.
- Contra el correu brossa, un **camp trampa** fora del recorregut del tabulador i sense veu al lector de pantalla. No hi ha cap servei extern de verificació ni cap galeta.
- **La pàgina d'avís legal només parla del correu** ([legal.ts](src/data/legal.ts)), perquè avui el formulari no es dibuixa. El dia que `FORM_ENDPOINT` s'activi, la secció de dades ha de guanyar el paràgraf sobre el servei que rep els missatges.

## Moviment i marca

Fora de la cronologia, el moviment és el de la secció 4.4 del brief: mesurat, i mai per cridar l'atenció sobre ell mateix.

- **Revelació en scroll** sobre els blocs de llista —oferta, fitxes de cas i capítols de cas—, amb un escalonament de 70 ms per posició. No la porten ni el hero ni la cronologia: el primer ja es veu en carregar i la segona té la seva pròpia mecànica.
- **L'estat inicial el condiciona `.js`**, que s'afegeix a l'arrel abans del primer pintat. El text el tapa una regla de CSS i qui la desfà és l'script, de manera que aquest té dues sortides directes cap al contingut visible —moviment reduït i absència d'`IntersectionObserver`— abans de dependre de l'observador.
- **Transició entre pàgines:** fosa curta a la sortida i mig centímetre de pujada a l'entrada. La capçalera té nom de transició propi i en queda fora: és idèntica a totes les pàgines i, animada com a grup a part, no parpelleja.
- **La marca** (`public/favicon.svg` i la capçalera) és la mateixa a la pestanya i a la pàgina: horitzó pla i muntanya irregular que dibuixa la M. A la capçalera va inline i pren els tokens —l'horitzó amb `--mark-rule`, la muntanya amb `currentColor`, que segueix el color de l'enllaç. El vermell de marca (`#c1272d`) es queda fora de la interfície: sobre negre no hi té lloc (3,39:1). El vermell que hi entra és l'aclarit de `--vermell` (`#ec443a`), només per senyalar estats —el carril i els errors del formulari—, i l'accent groc continua sent l'únic color d'interacció.

## Contingut dels casos

Els casos viuen a `src/content/cases/*.json`, un fitxer per cas amb les dues llengües a dins, i la resta del contingut és TypeScript:

| Contingut | On viu | Per què |
|---|---|---|
| Casos | `src/content/cases/*.json` | És el que canvia més sovint |
| Portada, cronologia, cadenes d'interfície | TypeScript, com abans | El text de la presentació (que viu a `home.ts` com la resta de la portada), la geometria del diagrama i les etiquetes del marc són on la garantia de tipus val més i on el text es toca menys |

La repartició ve del CMS Decap (decisió de l'usuari del 30/07/2026): Decap només sabia escriure fitxers de dades, i els casos eren el que canviava més sovint. **El CMS va sortir del projecte el 13/11/2026** sense haver-se fet servir mai —l'entrada amb GitHub no es va arribar a provar, i totes les edicions s'han fet amb Claude, directament als fitxers—, i amb ell les rutes d'autenticació i l'adaptador de Vercel, que hi eren només per a ell. Era l'única part del lloc que no era estàtica i la font de sis de les deu troballes de la revisió de seguretat d'aquell dia. Si mai torna a caldre (algú que editi sense Claude ni git), la versió reforçada és a la història, al commit `ca54f00`: administració a un origen propi, CSP mesurada, galeta d'estat d'un sol ús i temps màxim a l'intercanvi. Un aprenentatge que no és al codi: la i18n de Decap no serveix amb els fets compartits a l'arrel del fitxer (provat el 05/08/2026), i per això les dues llengües eren dos camps d'objecte.

Els casos s'han quedat en JSON perquè l'esquema val per si sol. **Què es va perdre i què es va guanyar en treure'ls de TypeScript.** Abans la paritat dels casos la imposava el compilador. Ara la imposa l'esquema de [src/content.config.ts](src/content.config.ts), i el canvi no és una pèrdua neta:

- Cada cas és **un sol fitxer amb les dues llengües a dins**, i totes dues són obligatòries. Els fets —`kind`, `year`, `langs`— són un camp compartit i no dos alineats per índex, de manera que el desfasament entre fets i text que la forma anterior feia possible ara no es pot ni escriure. Els camps de text no poden ser buits, cosa que el compilador no comprovava: `''` és un `string` vàlid.
- La sola regla que no surt de l'estructura és la **paritat de `deliverables`**, que és de longitud lliure. Quatre lliurables en català i dos en francès és l'asimetria que no es veu fins que algú obre l'altra llengua, i és el que comprova el `superRefine`.
- El que ja no es comprova és **el nombre de casos**: la tupla de sis n'imposava sis, i ara sis és un fet de la carpeta. És el preu d'acceptar que afegir un cas sigui deixar-hi un fitxer.

## Capçaleres, La Ruta i dependències

- **Capçaleres de seguretat** (29/10/2026), a [vercel.json](vercel.json) i per a tots els camins, `/ruta/` inclosa: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` sense càmera, micròfon ni geolocalització, i una CSP de només tres directives (`base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), que no toquen cap recurs de la pàgina i impedeixen d'encaixar el lloc en un marc aliè. No hi ha CSP de càrrega (`script-src`, `style-src`…) perquè les pàgines surten amb 66 guions en línia, 306 atributs `style=` i un formulari amb l'adreça en una variable d'entorn, i una política a mà els bloquejaria: cal que surti d'un hash de compilació (el suport de CSP d'Astro), com a pas a part. HSTS no hi és perquè Vercel ja el posa. El mateix fitxer fa el que feia l'adaptador fins al 13/11/2026: la barra final (`trailingSlash: true`, 308 de `/ca` a `/ca/`) i la memòria cau llarga de `/_astro/`. La comprovació `headers` de `npm run verify` ho vigila tot; l'únic que no es veu sense desplegar és que la capçalera arribi de debò: `curl -I` al domini.
- **`/ruta/` corre a l'origen del lloc.** El rewrite de `vercel.json` serveix el projecte de la-ruta a `miquel.clm.cat/ruta/`, que és l'adreça de les targetes amb QR (Miquel, 20/10/2026), i el seu JS s'hi executa com a `miquel.clm.cat`. Fins al 13/11/2026 era el problema gros: al mateix origen hi vivia la sessió de GitHub del CMS. Sense CMS, a l'origen no hi queda res que calgui protegir del codi de La Ruta. La CSP pròpia i estreta de `/ruta/` (29/10/2026) continua: `default-src 'none'`, scripts només del mateix origen, `connect-src 'self'`, cap `eval`, cap marc, formulari ni *worker*. Provada en un Edge real recorrent la pàgina sencera amb les capçaleres que calcula Vercel: zero violacions i les mateixes sis peticions, totes al seu origen, i 204 violacions amb una política deliberadament massa estreta, que és el control que demostra que la prova mira. **Correcció del 13/11/2026:** s'havia escrit que aquesta CSP «talla la sortida silenciosa», i no és cert. Limita el que la pàgina carrega i les peticions que fa, però no cobreix la navegació (un script pot posar a `location` una adreça de fora amb les dades a dins) ni WebRTC. És una barrera contra la injecció i la càrrega de codi de fora, no contra l'exfiltració; Ho reobriria que el projecte de la-ruta passés a dependre de codi de tercers, o que el nom `la-ruta-psi.vercel.app` s'esborrés: algú altre el podria registrar i el seu codi correria sota el domini públic.
- **Dependències i avisos d'`npm audit`** (29/10/2026). Eren 17 i són 8. S'han tret amb `npm audit fix`, sense cap salt de versió major (dotze paquets transitius, entre ells `devalue` i `vite`; les 62 sortides estàtiques d'abans i d'ara són idèntiques byte a byte) i amb `passthroughImageService` a [astro.config.mjs](astro.config.mjs), que va treure `sharp` de la funció de l'adaptador. L'avís crític que hi queda (Astro, execució remota amb una imatge AVIF) és de `libheif`, dins del servei d'imatges per omissió: sense `sharp` a la funció, i sense cap pàgina que processi imatges, no té per on arribar. Des del 13/11/2026 no hi ha ni adaptador ni funció: els avisos que demanen un servidor (`x-astro-path`, `/_image/`) no tenen on arribar, tot i que `npm audit` els continua comptant. Els vuit restants demanen Astro 7 i l'adaptador 11, i **no s'han aplicat**: provat en una còpia, compila, `check` dona 0 errors i `verify` passa tret de `decap` (que llegeix les entranyes de `zod` 3, i Astro 7 en porta la 4), però **la portada d'escriptori surt trencada** —l'heroi perd el retrat i el cercle daurat, i el nom i el commutador de llengua es recoloquen—, perquè Astro 7 reparteix el CSS en un fitxer per component i l'ordre d'emissió canvia, el mateix risc que ja explica el `:root:root`. A 390 px només hi ha 202 píxels de diferència sobre 3,9 milions. Cap contracte de `verify` no ho veu: es va trobar comparant captures d'Edge sense interfície (CDP), píxel a píxel, de les dues sortides. Amb Astro 7 se'n van tots els d'Astro i els de `sharp`; en queden tres de menors (`esbuild`, només al servidor de desenvolupament; `path-to-regexp`; `zod`). Quan es faci, cal arreglar l'ordre del CSS i repetir la comparació de captures abans de passar a `main`.

## Pendent

- ~~Domini definitiu~~: **resolt el 05/08/2026.** El lloc viu a `https://miquel.clm.cat`, amb `SITE_URL` a Vercel apuntant-hi, i `web-perso-azure.vercel.app` hi redirigeix amb un 308. Canònica, `hreflang` i sitemap ja hi són. Si algun dia es torna a moure, són dues coses que van juntes: `SITE_URL` a Vercel i el domini del projecte a Vercel.
- Casos: la selecció, els fets i l'ordre són els que va donar l'usuari, i l'eix llengua dels Banys està confirmat. Queda per confirmar l'eix llengua dels dos casos de recerca —`ca, es, en` per al GRECS/OACU i `es, en` per al MOVOKEUR—, deduït del marc institucional i no dit per l'usuari, i el territori del MOVOKEUR («Barcelona · projecte internacional»).
- `FORM_ENDPOINT` a Vercel: fins que no hi sigui, el formulari de contacte no es dibuixa en producció.
- Desplegament (bloc 10): funciona. Des del 13/11/2026 és un lloc estàtic sense adaptador: el directori de sortida és `dist`, el del preajust d'Astro a Vercel, i no s'ha de fixar res a mà. El registre `miquel` de `clm.cat` a Cloudflare va en «DNS only» des del 23/11/2026: amb el servidor intermediari encès, Vercel avisava «Proxy Detected», perquè la seva protecció contra atacs i robots no veu els visitants reals i les pàgines passen per dues memòries cau. No el tornis a encendre sense motiu.
- Auditoria d'accessibilitat, pendent des del bloc 5 i més exigible ara que el lloc és públic.
