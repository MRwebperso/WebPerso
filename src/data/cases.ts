import type { Lang } from '../i18n/utils';
import type { LangKey } from './timeline';

/**
 * Portfolio — dades i contingut dels casos.
 *
 * Quatre casos, sense filtres (secció 4.3 del brief): amb tan poc contingut,
 * un filtre buit només crida l'atenció sobre el buit.
 *
 * L'ordre de l'array és l'ordre de lectura, a la portada i a la navegació entre
 * casos. Els dos casos d'activitat pròpia van primer: la frontera 2.2 no permet
 * que la feina individual quedi per sota de l'associativa.
 *
 * Com a la cronologia, els fets no es tradueixen i la paritat la imposen els
 * tipus: quatre casos en tupla, tres capítols per cas i les etiquetes de tipus
 * en `Record`. Afegir un cas o un capítol en una llengua i no en l'altra no
 * compila. L'eix llengua reutilitza el registre de `timeline.ts`, que és el
 * mateix de la cronologia.
 */

/**
 * `commission` i `own` són activitat individual; `associative` obliga
 * l'etiquetatge de la secció 2.2 del brief.
 */
export const caseKinds = ['commission', 'own', 'associative'] as const;
export type CaseKind = (typeof caseKinds)[number];

export interface CaseFacts {
  /** Slug de la URL. No es tradueix: és nom propi de projecte. */
  id: string;
  kind: CaseKind;
  /** Any d'inici. Ordena i surt a la fitxa en xifres. */
  year: number;
  /** Llengües de treball del cas, del registre de la cronologia. */
  langs: readonly LangKey[];
}

type Four<T> = readonly [T, T, T, T];

export const cases: Four<CaseFacts> = [
  { id: 'casa-macia', kind: 'commission', year: 2026, langs: ['fr', 'ca', 'es'] },
  { id: 'que-fas', kind: 'own', year: 2026, langs: ['fr', 'ca'] },
  { id: 'mar-i-muntanya', kind: 'associative', year: 2026, langs: ['fr', 'ca'] },
  { id: 'xerrem-al-vallespir', kind: 'associative', year: 2026, langs: ['fr', 'ca'] },
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
  cases: Four<CaseCopy>;
}

const ca: CasesContent = {
  kindLabels: {
    commission: 'Encàrrec',
    own: 'Projecte propi',
    associative: 'Realitzat en el marc associatiu',
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
      title: 'Casa Macià: dues candidatures, dos marcs',
      summary:
        'Dos dossiers de subvenció el mateix any per a un centre d’interpretació en obres, davant de dos finançadors que no demanen ni la mateixa llengua ni la mateixa mena d’argument.',
      context: 'Casa Macià (Vil·la Denise), Prats-de-Molló-la-Preste',
      role: 'Redacció de dossiers i recerca de context',
      period: '2026',
      territory: 'Vallespir i Ripollès',
      deliverables: [
        'Dossier EsCaT / POCTEFA (plataforma SIGEFA)',
        'Dossier de projectes singulars d’economia social (Generalitat)',
        'Cartografia d’actors i xarxa de centres de memòria',
        'Pressupost i documents d’acompanyament',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'La Casa Macià és la casa on el 1926 es va instal·lar l’estat major de Francesc Macià, i avui un centre d’interpretació en obres dedicat a la resistència, l’exili i la solidaritat. L’estructura jurídica són tres entitats amb papers diferents —una al nord, una al sud i una fundació—, cosa que en la vida diària és un detall administratiu i en un formulari de subvenció és la primera pantalla que et pot deixar fora. Calia finançar una fase concreta de l’equipament i hi havia dues convocatòries obertes el mateix any.',
        },
        {
          title: 'Què vaig fer',
          body: 'Vaig llegir les dues convocatòries senceres abans d’escriure cap línia, i la lectura va decidir el dossier. La d’economia social tenia un tallafoc d’admissibilitat en forma jurídica i antiguitat que deixava fora tres de les quatre línies: haver-hi treballat la línia equivocada volia dir perdre el termini sense saber-ho. La candidatura transfronterera demanava el contrari, un argument de cooperació —què produeix la col·laboració nord-sud que no existiria sense ella—, amb els indicadors encadenats com els vol el programa. Base factual comuna per a totes dues, doncs, i dues arquitectures argumentals separades, sempre en el registre de memòria i patrimoni, que és el terreny on el projecte es defensa millor.',
        },
        {
          title: 'On és ara',
          body: 'La candidatura transfronterera es va dipositar dins el termini de juliol i la decisió és pendent; la segona segueix el seu propi calendari. El que queda fet, arribin els diners o no, és una base documentada —dades de territori, xarxa d’actors, avals acadèmics— que es torna a fer servir a la convocatòria següent en lloc de reconstruir-se cada vegada des de zero.',
        },
      ],
    },
    {
      title: '«Què fas?», l’agenda cultural de Catalunya Nord',
      summary:
        'Una agenda d’esdeveniments per a les cinc comarques del nord, feta amb la condició de no costar res cada mes i de continuar essent reparable per una sola persona.',
      context: 'Iniciativa pròpia',
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
      title: 'Xerrem al Vallespir',
      summary:
        'Un dossier per portar al Vallespir un mètode de grups de conversa que al sud ja funciona, amb el partenariat que el pugui sostenir quan la subvenció s’acabi.',
      context: 'CLM, amb la CAL, Ràdio Arrels, el CCCV i Òmnium Cultural',
      role: 'Redacció del dossier i construcció del partenariat',
      period: '2026',
      territory: 'Vallespir i Catalunya Sud',
      deliverables: [
        'Dossier Fonds EsCaT 2026',
        'Arquitectura del partenariat nord-sud',
        'Cartografia de socis i cartes de suport',
        'Objectius i pla d’indicadors',
      ],
      chapters: [
        {
          title: 'El punt de partida',
          body: 'Al Vallespir el català es parla, però es fa servir poc en situacions noves. La manera habitual de demanar diners per a això —descriure una llengua en perill— acaba parlant del declivi i no de l’ús, i davant d’un comitè el resultat és un projecte de conservació. El plantejament havia de ser l’invers: crear llocs on la llengua es triï activament i demostrar-ho amb dades de participació.',
        },
        {
          title: 'Què vaig fer',
          body: 'El mètode no me’l vaig inventar. Els grups de conversa de la CAL funcionen al sud des de fa anys i CLM els va anar a buscar; la feina de dossier va ser construir el partenariat capaç de sostenir-los al nord —Ràdio Arrels per l’estudi i la credibilitat editorial, el CCCV per la xarxa associativa i la continuïtat després del projecte, Òmnium Cultural— i escriure els objectius com a estats observables i no com a activitats lliurades: no «formar trenta persones», sinó «trenta persones capaces de sostenir una conversa en català en un context nou». Cada indicador va amb font de verificació plural, perquè un sol document no prova res davant d’un controlador.',
        },
        {
          title: 'On és ara',
          body: 'La quarta versió del dossier està dipositada i la decisió és pendent. La part que ja no depèn de la resolució és el partenariat: existeix, està documentat i serveix per a la convocatòria següent tant si aquesta arriba com si no.',
        },
      ],
    },
  ],
};

const fr: CasesContent = {
  kindLabels: {
    commission: 'Commande',
    own: 'Projet personnel',
    associative: 'Réalisé dans le cadre associatif',
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
      title: 'Casa Macià : deux candidatures, deux cadres',
      summary:
        'Deux dossiers de subvention la même année pour un centre d’interprétation en travaux, devant deux financeurs qui ne demandent ni la même langue ni le même type d’argument.',
      context: 'Casa Macià (Vil·la Denise), Prats-de-Mollo-la-Preste',
      role: 'Rédaction de dossiers et recherche de contexte',
      period: '2026',
      territory: 'Vallespir et Ripollès',
      deliverables: [
        'Dossier EsCaT / POCTEFA (plateforme SIGEFA)',
        'Dossier de projets singuliers d’économie sociale (Generalitat)',
        'Cartographie d’acteurs et réseau de centres de mémoire',
        'Budget et pièces d’accompagnement',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'La Casa Macià est la maison où s’est installé en 1926 l’état-major de Francesc Macià, aujourd’hui centre d’interprétation en travaux consacré à la résistance, à l’exil et à la solidarité. Le montage juridique repose sur trois entités aux rôles distincts —une au nord, une au sud et une fondation—, ce qui relève du détail administratif au quotidien mais constitue, dans un formulaire de subvention, le premier écran susceptible de vous écarter. Il fallait financer une phase précise de l’équipement, et deux appels étaient ouverts la même année.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'J’ai lu les deux appels en entier avant d’écrire une ligne, et cette lecture a décidé du dossier. Celui de l’économie sociale comportait un verrou d’admissibilité portant sur la forme juridique et l’ancienneté, qui écartait trois des quatre lignes : travailler la mauvaise ligne, c’était perdre le délai sans le savoir. La candidature transfrontalière demandait l’inverse, un argument de coopération —ce que produit la collaboration nord-sud et qui n’existerait pas sans elle—, avec des indicateurs chaînés comme le programme les attend. Une base factuelle commune aux deux, donc, et deux architectures argumentatives séparées, toujours dans le registre de la mémoire et du patrimoine, qui est le terrain où le projet se défend le mieux.',
        },
        {
          title: 'Où cela en est',
          body: 'La candidature transfrontalière a été déposée dans le délai de juillet et la décision est en attente ; la seconde suit son propre calendrier. Ce qui est acquis, que l’argent arrive ou non, c’est une base documentée —données de territoire, réseau d’acteurs, cautions académiques— qui resservira au prochain appel au lieu d’être reconstruite chaque fois depuis zéro.',
        },
      ],
    },
    {
      title: '« Què fas ? », l’agenda culturelle de Catalogne Nord',
      summary:
        'Un agenda d’événements pour les cinq comarques du nord, construit à la condition de ne rien coûter chaque mois et de rester réparable par une seule personne.',
      context: 'Initiative personnelle',
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
      title: 'Xerrem al Vallespir',
      summary:
        'Un dossier pour amener au Vallespir une méthode de groupes de conversation qui fonctionne déjà au sud, avec le partenariat capable de la tenir quand la subvention s’arrêtera.',
      context: 'CLM, avec la CAL, Ràdio Arrels, le CCCV et Òmnium Cultural',
      role: 'Rédaction du dossier et construction du partenariat',
      period: '2026',
      territory: 'Vallespir et Catalogne Sud',
      deliverables: [
        'Dossier Fonds EsCaT 2026',
        'Architecture du partenariat nord-sud',
        'Cartographie des partenaires et lettres de soutien',
        'Objectifs et plan d’indicateurs',
      ],
      chapters: [
        {
          title: 'Le point de départ',
          body: 'Au Vallespir, le catalan se parle, mais il s’emploie peu dans des situations nouvelles. La manière habituelle de demander de l’argent pour cela —décrire une langue en danger— finit par parler du déclin et non de l’usage, et devant un comité le résultat est un projet de conservation. Le cadrage devait être l’inverse : créer des lieux où la langue est activement choisie, et le démontrer par des données de participation.',
        },
        {
          title: 'Ce que j’ai fait',
          body: 'La méthode, je ne l’ai pas inventée. Les groupes de conversation de la CAL fonctionnent au sud depuis des années et CLM est allé les chercher ; le travail de dossier a consisté à bâtir le partenariat capable de les tenir au nord —Ràdio Arrels pour le studio et la crédibilité éditoriale, le CCCV pour le réseau associatif et la continuité après le projet, Òmnium Cultural— et à écrire les objectifs comme des états observables et non comme des activités livrées : non pas « former trente personnes », mais « trente personnes capables de tenir une conversation en catalan dans un contexte nouveau ». Chaque indicateur va avec une source de vérification plurielle, parce qu’un document isolé ne prouve rien devant un contrôleur.',
        },
        {
          title: 'Où cela en est',
          body: 'La quatrième version du dossier est déposée et la décision est en attente. Ce qui ne dépend plus de l’issue, c’est le partenariat : il existe, il est documenté, et il servira au prochain appel que celui-ci aboutisse ou non.',
        },
      ],
    },
  ],
};

export const caseContent: Record<Lang, CasesContent> = { ca, fr };
