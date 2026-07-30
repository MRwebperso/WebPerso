import type { Lang } from '../i18n/utils';
import type { LangKey } from './timeline';

/**
 * Portfolio — dades i contingut dels casos.
 *
 * Sis casos, sense filtres (secció 4.3 del brief): amb tan poc contingut, un
 * filtre buit només crida l’atenció sobre el buit. El brief en demanava tres o
 * quatre; els sis són decisió de l’usuari del 30/07/2026.
 *
 * L’ordre de l’array és l’ordre de lectura, a la portada i a la navegació entre
 * casos. L’ordre el fixa l’usuari. Obre un lloc de treball, que és el que
 * sosté la jerarquia de la frontera 2.2: els Banys d’Arles van en quart lloc
 * per decisió seva del 30/07/2026, tot i quedar per sota dels associatius.
 *
 * Com a la cronologia, els fets no es tradueixen i la paritat la imposen els
 * tipus: sis casos en tupla, tres capítols per cas i les etiquetes de tipus
 * en `Record`. Afegir un cas o un capítol en una llengua i no en l’altra no
 * compila. L’eix llengua reutilitza el registre de `timeline.ts`, que és el
 * mateix de la cronologia.
 */

/**
 * `position`, `commission`, `own` i `affiliation` són activitat individual;
 * `associative` obliga l’etiquetatge de la secció 2.2 del brief.
 *
 * `position` és un lloc de treball ocupat, que no és el mateix que un encàrrec
 * facturat: dir-ne «encàrrec» seria inexacte, i la precisió del marc és part
 * del senyal que ha de donar el portfolio. Pel mateix motiu hi ha
 * `affiliation`: una vinculació de recerca no és un lloc de treball, i
 * presentar-la com a tal seria inflar-la.
 */
export const caseKinds = [
  'position',
  'commission',
  'own',
  'associative',
  'affiliation',
] as const;
export type CaseKind = (typeof caseKinds)[number];

export interface CaseFacts {
  /** Slug de la URL. No es tradueix: és nom propi de projecte o d’entitat. */
  id: string;
  kind: CaseKind;
  /** Any d’inici. L’ordre de lectura, però, és el de l’array, no el de l’any. */
  year: number;
  /** Llengües de treball del cas, del registre de la cronologia. */
  langs: readonly LangKey[];
}

type Six<T> = readonly [T, T, T, T, T, T];

export const cases: Six<CaseFacts> = [
  { id: 'agencia-atractivitat', kind: 'position', year: 2023, langs: ['fr', 'ca', 'es', 'en'] },
  { id: 'mar-i-muntanya', kind: 'associative', year: 2026, langs: ['fr', 'ca'] },
  { id: 'que-fas', kind: 'associative', year: 2026, langs: ['fr', 'ca'] },
  { id: 'banys-d-arles', kind: 'position', year: 2023, langs: ['fr', 'ca'] },
  { id: 'grecs-oacu', kind: 'affiliation', year: 2020, langs: ['ca', 'es', 'en'] },
  { id: 'movokeur', kind: 'position', year: 2013, langs: ['es', 'en'] },
];

interface Chapter {
  title: string;
  body: string;
}

interface CaseCopy {
  title: string;
  /** Una frase: què és el cas. Surt a la fitxa de la portada i a la capçalera. */
  summary: string;
  /** En quin marc es va fer i per a qui. */
  context: string;
  role: string;
  /** Període en paraules: admet «→ avui», que un any sol no admet. */
  period: string;
  territory: string;
  deliverables: string[];
  /** Punt de partida → intervenció → on és ara. */
  chapters: [Chapter, Chapter, Chapter];
}

export interface CasesContent {
  kindLabels: Record<CaseKind, string>;
  factLabels: {
    context: string;
    role: string;
    period: string;
    territory: string;
    langs: string;
    deliverables: string;
  };
  cases: Six<CaseCopy>;
}

const ca: CasesContent = {
  kindLabels: {
    position: 'Lloc de treball',
    commission: 'Encàrrec',
    own: 'Projecte propi',
    associative: 'Realitzat en el marc associatiu',
    affiliation: 'Vinculació de recerca',
  },
  factLabels: {
    context: 'Marc',
    role: 'Paper',
    period: 'Període',
    territory: 'Territori',
    langs: 'Llengües',
    deliverables: 'Lliurables',
  },
  cases: [
    {
      title: 'Alt Vallespir: una destinació de frontera en quatre llengües',
      summary:
        'Dos anys de promoció turística a l’Alt Vallespir, amb la frontera tractada com a mercat i no com a límit, i quatre llengües de treball en lloc d’una i tres traduccions.',
      context:
        'Oficina de Turisme de Prats de Molló · Agència d’Atractivitat, Comunitat de Municipis de l’Alt Vallespir',
      role: 'Eixos estratègics, promoció transfronterera i comunicació',
      period: 'octubre 2023 → desembre 2025',
      territory: 'Alt Vallespir',
      deliverables: [
        'Eixos estratègics del turisme a l’Alt Vallespir',
        'Promoció transfronterera de la destinació',
        'Visuals turístics d’acollida i de captació',
        'Gestió editorial del compte d’Instagram',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'L’Alt Vallespir és un territori de muntanya amb la frontera al capdamunt: els visitants hi arriben del nord i del sud, i les dues procedències no busquen el mateix ni s’informen als mateixos llocs. La feina es feia des de l’oficina de turisme de Prats de Molló i, alhora, dins de l’agència d’atractivitat de la comunitat de municipis. Això vol dir dues escales sempre a la vista: el que necessita un municipi concret i el que només té sentit si es promociona el conjunt.',
        },
        {
          title: 'Què vaig fer',
          body: 'Quatre feines, i cap no era independent de les altres. Els eixos estratègics fixaven de què es parla i de què no, perquè en un territori petit dispersar el missatge surt més car que no dir res. La promoció transfronterera era una responsabilitat pròpia i no un afegit: mirar el sud com a públic i com a soci, no com a competència. El plurilingüisme el vaig tractar com a quatre llengües de treball —francès, català, anglès i castellà—, que no és el mateix que redactar en francès i encarregar tres traduccions: canvia què s’escriu, no només com es diu. I els visuals anaven per parelles de funció: els d’acollida, que els ha de trobar qui ja hi és, i els de captació, que han de funcionar en una pantalla de telèfon a dos-cents quilòmetres. El compte d’Instagram el portava jo, amb línia editorial i calendari, no a impulsos.',
        },
        {
          title: 'Què n’ha quedat',
          body: 'El lloc es va acabar el desembre del 2025. Al territori hi queden el marc estratègic i la pràctica editorial. El que me’n vaig endur és la manera de treballar en quatre llengües alhora i la lectura de la frontera com a recurs, que és exactament el que faig servir ara als projectes de comunicació transfronterera que porto pel meu compte.',
        },
      ],
    },
    {
      title: 'Mar i Muntanya, a Taula!',
      summary:
        'Una marca de comunicació bilingüe per a quatre fires gastronòmiques fora de temporada, dues al nord i dues al sud, que per separat no arriben enlloc.',
      context: 'CLM, amb Som Turisme (Alt Empordà)',
      role: 'Marca, web bilingüe, xarxes i redacció del dossier',
      period: '2026',
      territory: 'Vallespir, Rosselló i Alt Empordà',
      deliverables: [
        'Identitat de marca amb logotip de dos modes',
        'Web bilingüe amb CMS d’edició',
        'Canals de xarxes centralitzats',
        'Dossier Fonds 66 EsCaT 2026',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'Quatre esdeveniments —el Cat’Festa a Sant Llorenç de Cerdans, la Bullinada dels Pescaires a Sant Cebrià de Rosselló, la Fira de Vins Naturals Contraband a Rabós d’Empordà i la Fira del Bolet de La Vajol— es fan a l’octubre i al novembre, en municipis petits i just fora de la temporada que ho paga tot. Cadascun per separat és massa poca cosa per a una campanya; tots quatre junts, amb la lectura mar-muntanya que els lliga, ja són una història que es pot explicar als dos costats de la frontera.',
        },
        {
          title: 'Què vaig fer',
          body: 'La marca havia de funcionar en un cartell penjat a la porta d’un ajuntament i en una miniatura de telèfon, i d’aquí va sortir un sistema de dos modes: contorn monocrom per a la impressió i els usos formals, silueta plena de color per al digital i les mides petites. Els dos colors són semàntics i fixos —el de la muntanya i el del mar—, sense transparències que els facin variar segons el fons. A partir d’aquí, el web bilingüe amb un gestor que permet publicar sense tocar codi, els canals de xarxes centralitzats i el dossier de subvenció. La regla que travessa totes les peces és l’equitat editorial: cap dels quatre esdeveniments pot tenir més exposició que els altres, i això és una restricció escrita al calendari de publicacions, no una bona intenció.',
        },
        {
          title: 'On és ara',
          body: 'El dossier es va dipositar i la decisió és pendent. El web, que no forma part de la sol·licitud i no s’hi va pressupostar, és en línia i funciona: si la subvenció no arriba, la comunicació es farà igualment amb menys mitjans. Queda obert un punt de la identitat, la tipografia del logotip, que encara és provisional.',
        },
      ],
    },
    {
      title: '«Què fas?», l’agenda cultural de Catalunya Nord',
      summary:
        'Una agenda d’esdeveniments per a les cinc comarques del nord, feta amb la condició de no costar res cada mes i de continuar essent reparable per una sola persona.',
      context: 'CLM',
      role: 'Concepció, desenvolupament i curadoria',
      period: '2026 → avui',
      territory: 'Rosselló, Conflent, Vallespir, Capcir i Cerdanya',
      deliverables: [
        'Aplicació web estàtica, sense framework ni dependències',
        'Cadena d’extracció automàtica de les propostes per correu',
        'Full de curadoria amb publicació a un clic',
        'Butlletí setmanal per comarca',
      ],
      chapters: [
        {
          title: 'El problema',
          body: 'Les associacions culturals del nord anuncien cadascuna pel seu compte, i el resultat és que ningú no sap què passa a trenta quilòmetres de casa. Concebre un agregador no té cap dificultat; el que costa és que sobrevisqui a l’entusiasme inicial. Per això les restriccions me les vaig posar jo abans de començar: cap cost recurrent, cap compte d’usuari, cap base de dades, i codi que jo mateix pugui reparar d’aquí a sis mesos sense demanar ajuda a ningú.',
        },
        {
          title: 'Què vaig fer',
          body: 'Una associació escriu un correu tal com l’escriuria a una persona. Un model de llenguatge en treu els setze camps de la fitxa d’esdeveniment, sempre els mateixos i sempre en text pla, a temperatura zero. Jo reviso les fitxes deu minuts la setmana i publico les que passen. El web és HTML, CSS i JavaScript sense framework: llegeix un sol fitxer de dades i mostra cada esdeveniment en català a dalt i en francès a sota, amb la tipografia diferenciant les dues llengües. La part d’IA fa exactament una feina —convertir prosa lliure en fitxa estructurada— i res del que produeix arriba al públic sense passar per la revisió.',
        },
        {
          title: 'On és ara',
          body: 'El web està construït i en la seva forma definitiva. La cadena d’automatització està escrita i revisada, i queda pendent de connectar-se al compte definitiu, que ha de ser propietari alhora de la bústia, del full i de l’script. De tot el que he fet, és el cas que explica millor com faig servir les eines d’IA: una peça acotada dins d’un procés que valida una persona, no un motor que decideix què es publica.',
        },
      ],
    },
    {
      title: 'Els Banys d’Arles: tres mesos i un servei per endreçar',
      summary:
        'Un pas curt pel servei de comunicació d’un ajuntament termal, amb la comunicació institucional de l’alcaldia a fer cada setmana i el servei mateix a reestructurar.',
      context: 'Servei de Comunicació, Ajuntament dels Banys d’Arles i Palaldà',
      role: 'Comunicació institucional i reestructuració del servei',
      period: 'agost → octubre 2023',
      territory: 'Els Banys d’Arles i Palaldà',
      deliverables: [
        'Comunicació institucional de l’alcaldia',
        'Reestructuració i modernització del servei',
        'Traduccions i visuals',
        'Dinamització de les xarxes socials',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'Tres mesos en un servei de comunicació municipal són poc temps per a gairebé tot. Hi havia dues coses a fer alhora: sortir cada setmana amb la comunicació institucional de l’alcaldia, que no espera, i endreçar un servei que necessitava modernitzar-se. Les dues competien pel mateix temps.',
        },
        {
          title: 'Què vaig fer',
          body: 'Vaig posar l’estructura abans del volum, perquè l’estructura sobreviu al contracte i les publicacions no. Això va voler dir reorganitzar com entra i com surt la informació del servei, i modernitzar-ne les eines. A sobre d’això, la producció corrent: la comunicació de l’alcaldia, les traduccions i els visuals, i una presència a les xarxes que passés de publicar quan hi havia temps a publicar per calendari.',
        },
        {
          title: 'Què n’ha quedat',
          body: 'El pas va ser curt i orientat a propòsit al que quedaria després, que és la reorganització del servei. A l’octubre del mateix any vaig començar a l’Alt Vallespir. D’aquells tres mesos ve una convicció que no he canviat: en comunicació pública, arreglar el procés val més que afegir una publicació més.',
        },
      ],
    },
    {
      title: 'Recerca associada a la UB: seminaris, projectes i un terreny a Suïssa',
      summary:
        'Quatre anys de vinculació al Departament d’Antropologia Social i Cultural de la Universitat de Barcelona, amb una etnografia pròpia sobre els temporers vitícoles a Suïssa.',
      context:
        'GRECS/OACU, Departament d’Antropologia Social i Cultural, Universitat de Barcelona',
      role: 'Investigador associat',
      period: 'setembre 2020 → 2024',
      territory: 'Barcelona i Suïssa',
      deliverables: [
        'Participació en seminaris i projectes de recerca del grup',
        'Etnografia sobre els temporers vitícoles a Suïssa',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'Una vinculació de recerca associada no és un lloc de treball: ningú no t’assigna feina i ningú no te’n reclama. El que la sosté és, d’una banda, un grup amb qui discutir el que fas, i de l’altra, un terreny propi que justifiqui seguir-hi. Vaig entrar-hi el setembre del 2020, quan acabava d’instal·lar-me lluny de Barcelona, i això volia dir mantenir el vincle a distància i amb el terreny en un tercer país.',
        },
        {
          title: 'Què vaig fer',
          body: 'Dues coses en paral·lel. Als seminaris i als projectes del grup, el que s’hi aprèn és a defensar un plantejament davant de gent que no té cap obligació de ser amable: és la millor escola que conec per detectar on un argument no s’aguanta. I un terreny propi, l’etnografia dels temporers vitícoles a Suïssa. Una població estacional i mòbil no s’estudia amb un qüestionari: demana ser-hi quan hi són, tornar-hi la temporada següent i parlar la llengua de la gent, no la de la institució que la contracta.',
        },
        {
          title: 'Què n’ha quedat',
          body: 'La vinculació es va acabar el 2024. El que en conservo és mètode, i el faig servir cada setmana: abans d’escriure res sobre un territori, anar-hi, escoltar qui hi viu i acceptar que el que en surti no serà el que esperava. Els diagnòstics territorials que faig ara per encàrrec surten d’aquesta disciplina, no d’una plantilla.',
        },
      ],
    },
    {
      title: 'MOVOKEUR: quatre anys d’assistència a la recerca en un projecte internacional',
      summary:
        'Assistència de recerca en un projecte internacional del Ministerio de Educación y Cultura: planificació compartida, entrevistes, publicacions i l’organització d’un taller internacional.',
      context: 'Projecte MOVOKEUR · Ministerio de Educación y Cultura',
      role: 'Assistent de recerca',
      period: 'setembre 2013 → juliol 2017',
      territory: 'Barcelona · projecte internacional',
      deliverables: [
        'Planificació col·laborativa d’un projecte internacional',
        'Articles i capítols de llibre',
        'Entrevistes semiestructurades',
        'Organització de l’Antipode International Workshop Award 2015',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'Un projecte de recerca internacional té dues vides que no s’assemblen: la que consta a la sol·licitud i la que passa cada mes entre equips de països diferents, amb calendaris i maneres de treballar que no coincideixen. Hi vaig entrar el setembre del 2013 com a assistent de recerca, que és la posició des de la qual es veuen totes dues alhora.',
        },
        {
          title: 'Què vaig fer',
          body: 'La planificació era col·laborativa i això és menys còmode del que sona: vol dir negociar què s’entrega, quan i qui ho signa, amb gent que no comparteix ni institució ni horari. A sobre, la feina de recerca: entrevistes semiestructurades i la redacció d’articles i de capítols de llibre, on el text ha de passar per avaluadors que no et coneixen i que busquen l’escletxa. I el 2015, l’organització de l’Antipode International Workshop Award, que ja no és recerca sinó producció —programa, pressupost, gent que arriba i que se’n va— i que es va fer amb la mateixa exigència.',
        },
        {
          title: 'Què n’ha quedat',
          body: 'El projecte es va tancar el juliol del 2017. D’aquells quatre anys en surten les dues coses que ara faig servir a la línia de dossiers i de recerca aplicada: escriure per a algú que avalua amb criteris explícits, i sostenir un calendari compartit entre socis que no depenen de tu. La segona és, de llarg, la que decideix si un projecte transfronterer arriba a terme.',
        },
      ],
    },
  ],
};

const fr: CasesContent = {
  kindLabels: {
    position: 'Poste occupé',
    commission: 'Commande',
    own: 'Projet personnel',
    associative: 'Réalisé dans le cadre associatif',
    affiliation: 'Rattachement de recherche',
  },
  factLabels: {
    context: 'Cadre',
    role: 'Rôle',
    period: 'Période',
    territory: 'Territoire',
    langs: 'Langues',
    deliverables: 'Livrables',
  },
  cases: [
    {
      title: 'Haut-Vallespir : une destination frontalière en quatre langues',
      summary:
        'Deux ans de promotion touristique en Haut-Vallespir, la frontière traitée comme un marché et non comme une limite, et quatre langues de travail au lieu d’une et trois traductions.',
      context:
        'Office de Tourisme de Prats-de-Mollo · Agence d’Attractivité, Communauté de Communes du Haut-Vallespir',
      role: 'Axes stratégiques, promotion transfrontalière et communication',
      period: 'octobre 2023 → décembre 2025',
      territory: 'Haut-Vallespir',
      deliverables: [
        'Axes stratégiques du tourisme en Haut-Vallespir',
        'Promotion transfrontalière de la destination',
        'Visuels touristiques d’accueil et d’appel',
        'Gestion éditoriale du compte Instagram',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'Le Haut-Vallespir est un territoire de montagne avec la frontière tout en haut : les visiteurs arrivent du nord et du sud, et ces deux provenances ne cherchent pas la même chose et ne s’informent pas aux mêmes endroits. Le travail se faisait depuis l’office de tourisme de Prats-de-Mollo et, en même temps, au sein de l’agence d’attractivité de la communauté de communes. Cela suppose deux échelles toujours présentes : ce dont une commune donnée a besoin, et ce qui n’a de sens que si l’on promeut l’ensemble.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'Quatre chantiers, et aucun n’était indépendant des autres. Les axes stratégiques fixaient de quoi l’on parle et de quoi l’on ne parle pas, car sur un petit territoire disperser le message coûte plus cher que de se taire. La promotion transfrontalière relevait d’une responsabilité propre et non d’un supplément : regarder le sud comme un public et comme un partenaire, pas comme une concurrence. Le plurilinguisme, je l’ai traité comme quatre langues de travail —français, catalan, anglais et castillan—, ce qui n’est pas la même chose que rédiger en français et commander trois traductions : cela change ce qu’on écrit, pas seulement la façon de le dire. Et les visuels allaient par couples de fonction : ceux d’accueil, que doit trouver celui qui est déjà là, et ceux d’appel, qui doivent tenir sur un écran de téléphone à deux cents kilomètres. Le compte Instagram, je le tenais moi-même, avec une ligne éditoriale et un calendrier, non par impulsions.',
        },
        {
          title: 'Ce qui en reste',
          body: 'Le poste s’est achevé en décembre 2025. Au territoire restent le cadre stratégique et la pratique éditoriale. Ce que j’en ai emporté, c’est la manière de travailler en quatre langues à la fois et la lecture de la frontière comme ressource, qui est exactement ce que j’emploie aujourd’hui dans les projets de communication transfrontalière que je mène à mon compte.',
        },
      ],
    },
    {
      title: 'Mar i Muntanya, a Taula !',
      summary:
        'Une marque de communication bilingue pour quatre foires gastronomiques hors saison, deux au nord et deux au sud, qui séparément ne portent nulle part.',
      context: 'CLM, avec Som Turisme (Alt Empordà)',
      role: 'Marque, site bilingue, réseaux et rédaction du dossier',
      period: '2026',
      territory: 'Vallespir, Roussillon et Alt Empordà',
      deliverables: [
        'Identité de marque avec logotype à deux modes',
        'Site bilingue avec CMS d’édition',
        'Canaux de réseaux sociaux centralisés',
        'Dossier Fonds 66 EsCaT 2026',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'Quatre événements —le Cat’Festa à Sant Llorenç de Cerdans, la Bullinada dels Pescaires à Sant Cebrià de Rosselló, la Fira de Vins Naturals Contraband à Rabós d’Empordà et la Fira del Bolet de La Vajol— se tiennent en octobre et en novembre, dans de petites communes et juste en dehors de la saison qui paie tout. Chacun pris à part est trop modeste pour une campagne ; les quatre ensemble, avec la lecture mer-montagne qui les relie, forment déjà un récit qui s’explique des deux côtés de la frontière.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'La marque devait fonctionner sur une affiche punaisée à la porte d’une mairie et sur une vignette de téléphone : d’où un système à deux modes, contour monochrome pour l’impression et les usages formels, silhouette pleine en couleur pour le numérique et les petites tailles. Les deux couleurs sont sémantiques et fixes —celle de la montagne et celle de la mer—, sans transparences qui les feraient varier selon le fond. De là ont suivi le site bilingue avec un gestionnaire permettant de publier sans toucher au code, les canaux de réseaux centralisés et le dossier de subvention. La règle qui traverse toutes les pièces est la péréquation éditoriale : aucun des quatre événements ne peut être plus exposé que les autres, et c’est une contrainte inscrite au calendrier de publication, pas une bonne intention.',
        },
        {
          title: 'Où cela en est',
          body: 'Le dossier a été déposé et la décision est en attente. Le site, qui ne fait pas partie de la demande et n’y a pas été budgété, est en ligne et fonctionne : si la subvention n’arrive pas, la communication se fera quand même avec moins de moyens. Un point de l’identité reste ouvert, la typographie du logotype, encore provisoire.',
        },
      ],
    },
    {
      title: '« Què fas ? », l’agenda culturel de Catalogne Nord',
      summary:
        'Un agenda d’événements pour les cinq comarques du nord, construit à la condition de ne rien coûter chaque mois et de rester réparable par une seule personne.',
      context: 'CLM',
      role: 'Conception, développement et curation',
      period: '2026 → aujourd’hui',
      territory: 'Roussillon, Conflent, Vallespir, Capcir et Cerdagne',
      deliverables: [
        'Application web statique, sans framework ni dépendances',
        'Chaîne d’extraction automatique des propositions reçues par courriel',
        'Feuille de curation avec publication en un clic',
        'Lettre hebdomadaire par comarque',
      ],
      chapters: [
        {
          title: 'Le problème',
          body: 'Les associations culturelles du nord annoncent chacune de son côté, et personne ne sait ce qui se passe à trente kilomètres de chez soi. Concevoir un agrégateur ne présente aucune difficulté ; ce qui est difficile, c’est qu’il survive à l’enthousiasme du début. Les contraintes, je me les suis donc imposées avant de commencer : aucun coût récurrent, aucun compte utilisateur, aucune base de données, et un code que je puisse moi-même réparer dans six mois sans demander d’aide à personne.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'Une association écrit un courriel comme elle l’écrirait à une personne. Un modèle de langue en extrait les seize champs de la fiche d’événement, toujours les mêmes et toujours en texte brut, à température zéro. Je relis les fiches dix minutes par semaine et je publie celles qui passent. Le site est du HTML, du CSS et du JavaScript sans framework : il lit un seul fichier de données et affiche chaque événement en catalan au-dessus et en français en dessous, la typographie distinguant les deux langues. La part d’IA fait exactement un travail —transformer de la prose libre en fiche structurée— et rien de ce qu’elle produit n’arrive au public sans passer par la relecture.',
        },
        {
          title: 'Où cela en est',
          body: 'Le site est construit et dans sa forme définitive. La chaîne d’automatisation est écrite et relue ; il reste à la brancher sur le compte définitif, qui doit être propriétaire à la fois de la boîte, de la feuille et du script. De tout ce que j’ai produit, c’est le cas qui explique le mieux comment j’emploie les outils d’IA : une pièce délimitée dans un processus qu’une personne valide, non un moteur qui décide de ce qui se publie.',
        },
      ],
    },
    {
      title: 'Amélie-les-Bains : trois mois et un service à remettre en ordre',
      summary:
        'Un passage court au service communication d’une mairie thermale, avec la communication institutionnelle de la municipalité à assurer chaque semaine et le service lui-même à restructurer.',
      context: 'Service Communication, Mairie d’Amélie-les-Bains-Palalda',
      role: 'Communication institutionnelle et restructuration du service',
      period: 'août → octobre 2023',
      territory: 'Amélie-les-Bains-Palalda',
      deliverables: [
        'Communication institutionnelle de la municipalité',
        'Restructuration et modernisation du service',
        'Traductions et visuels',
        'Dynamisation des réseaux sociaux',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'Trois mois dans un service de communication municipale, c’est peu de temps pour presque tout. Il y avait deux choses à mener en même temps : sortir chaque semaine la communication institutionnelle de la municipalité, qui n’attend pas, et remettre en ordre un service qui avait besoin d’être modernisé. Les deux se disputaient le même temps.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'J’ai placé la structure avant le volume, parce que la structure survit au contrat et les publications non. Cela a voulu dire réorganiser la manière dont l’information entre et sort du service, et en moderniser les outils. Là-dessus, la production courante : la communication de la mairie, les traductions et les visuels, et une présence sur les réseaux qui passe de publier quand il y a le temps à publier selon un calendrier.',
        },
        {
          title: 'Ce qui en reste',
          body: 'Le passage a été court et orienté à dessein vers ce qui resterait ensuite, c’est-à-dire la réorganisation du service. En octobre de la même année, je commençais en Haut-Vallespir. De ces trois mois vient une conviction que je n’ai pas changée : en communication publique, réparer le processus vaut mieux qu’ajouter une publication de plus.',
        },
      ],
    },
    {
      title: 'Recherche associée à l’UB : séminaires, projets et un terrain en Suisse',
      summary:
        'Quatre ans de rattachement au Département d’Anthropologie Sociale et Culturelle de l’Université de Barcelone, avec une ethnographie propre sur les saisonniers viticoles en Suisse.',
      context:
        'GRECS/OACU, Département d’Anthropologie Sociale et Culturelle, Université de Barcelone',
      role: 'Chercheur associé',
      period: 'septembre 2020 → 2024',
      territory: 'Barcelone et Suisse',
      deliverables: [
        'Participation aux séminaires et aux projets de recherche du groupe',
        'Ethnographie sur les saisonniers viticoles en Suisse',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'Un rattachement de chercheur associé n’est pas un poste : personne ne vous assigne de travail et personne ne vous en réclame. Ce qui le tient, c’est d’un côté un groupe avec qui discuter ce que l’on fait, de l’autre un terrain propre qui justifie d’y rester. J’y suis entré en septembre 2020, au moment où je venais de m’installer loin de Barcelone : il fallait donc maintenir le lien à distance, et le terrain dans un troisième pays.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'Deux choses en parallèle. Dans les séminaires et les projets du groupe, ce qui s’apprend, c’est à défendre une approche devant des gens qui n’ont aucune obligation d’être aimables : je ne connais pas de meilleure école pour repérer où un argument ne tient pas. Et un terrain propre, l’ethnographie des saisonniers viticoles en Suisse. Une population saisonnière et mobile ne s’étudie pas par questionnaire : elle demande d’être là quand elle y est, d’y revenir la saison suivante et de parler la langue des gens, pas celle de l’institution qui les emploie.',
        },
        {
          title: 'Ce qui en reste',
          body: 'Le rattachement s’est achevé en 2024. Ce que j’en garde est une méthode, et je m’en sers chaque semaine : avant d’écrire quoi que ce soit sur un territoire, y aller, écouter ceux qui y vivent et accepter que ce qui en sortira ne sera pas ce que j’attendais. Les diagnostics territoriaux que je mène aujourd’hui sur commande viennent de cette discipline, pas d’un modèle prérempli.',
        },
      ],
    },
    {
      title: 'MOVOKEUR : quatre ans d’assistanat de recherche sur un projet international',
      summary:
        'Assistanat de recherche sur un projet international du Ministerio de Educación y Cultura : planification partagée, entretiens, publications et organisation d’un atelier international.',
      context: 'Projet MOVOKEUR · Ministerio de Educación y Cultura',
      role: 'Assistant de recherche',
      period: 'septembre 2013 → juillet 2017',
      territory: 'Barcelone · projet international',
      deliverables: [
        'Planification collaborative d’un projet international',
        'Articles et chapitres de livres',
        'Entretiens semi-structurés',
        'Organisation de l’Antipode International Workshop Award 2015',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'Un projet de recherche international a deux vies qui ne se ressemblent pas : celle qui figure dans la demande, et celle qui se joue chaque mois entre des équipes de pays différents, avec des calendriers et des façons de travailler qui ne coïncident pas. J’y suis entré en septembre 2013 comme assistant de recherche, c’est-à-dire à la place d’où l’on voit les deux à la fois.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'La planification était collaborative, ce qui est moins confortable que cela n’en a l’air : il s’agit de négocier ce que l’on livre, quand, et qui le signe, avec des gens qui ne partagent ni institution ni horaires. Là-dessus, le travail de recherche : des entretiens semi-structurés et la rédaction d’articles et de chapitres de livres, où le texte passe devant des évaluateurs qui ne vous connaissent pas et qui cherchent la faille. Et en 2015, l’organisation de l’Antipode International Workshop Award, qui n’est plus de la recherche mais de la production —programme, budget, des gens qui arrivent et qui repartent— et qui s’est menée avec la même exigence.',
        },
        {
          title: 'Ce qui en reste',
          body: 'Le projet s’est clos en juillet 2017. De ces quatre ans viennent les deux choses dont je me sers aujourd’hui sur la ligne des dossiers et de la recherche appliquée : écrire pour quelqu’un qui évalue selon des critères explicites, et tenir un calendrier partagé entre des partenaires qui ne dépendent pas de vous. La seconde est, de loin, celle qui décide si un projet transfrontalier arrive à son terme.',
        },
      ],
    },
  ],
};

export const caseContent: Record<Lang, CasesContent> = { ca, fr };
