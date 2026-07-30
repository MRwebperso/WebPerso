import type { Lang } from '../i18n/utils';

/**
 * Contingut editorial de la one-page.
 *
 * La paritat no és una bona intenció: `ca` i `fr` compleixen la mateixa
 * interfície, i les llistes d'oferta i de mètode són tuples de longitud fixa.
 * Afegir un principi en una llengua i no en l'altra no compila.
 */

interface Offer {
  title: string;
  body: string;
  deliverablesLabel: string;
  deliverables: string[];
}

interface Principle {
  title: string;
  body: string;
}

interface SectionIntro {
  eyebrow: string;
  title: string;
  lead: string;
}

/**
 * Textos del formulari. Els missatges d'error són els de la validació pròpia:
 * les cadenes que posa el navegador surten en la llengua de la interfície de
 * qui llegeix, que en un lloc bilingüe estricte no serveix.
 */
interface ContactForm {
  legend: string;
  required: string;
  fields: {
    name: { label: string; error: string };
    email: { label: string; error: string };
    message: { label: string; error: string };
  };
  /** Etiqueta del camp trampa, només per a lectors de pantalla. */
  honeypot: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  privacy: string;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    /** NUCLI INVARIANT (secció 2.1 del brief). Text de referència: no alterar. */
    intro: string;
  };
  communication: SectionIntro & { offers: [Offer, Offer] };
  method: SectionIntro & {
    principles: [Principle, Principle, Principle];
    boundary: string;
  };
  timeline: SectionIntro;
  cases: SectionIntro;
  contact: SectionIntro & { emailLabel: string; form: ContactForm };
}

const ca: HomeContent = {
  hero: {
    eyebrow: 'Miquel Rodrigues · Prats de Molló, Alt Vallespir',
    title: 'Comunicació, recerca aplicada i integració crítica d’IA',
    intro:
      'Doctor en comunicació establert a Prats de Molló, amb vint anys d’experiència en comunicació, recerca i formació. Ofereixo tres serveis: assessorament i productes de comunicació, redacció de dossiers i recerca aplicada, i integració crítica d’eines d’IA. Treballo en sis llengües als dos costats de la frontera. Aquesta combinació no existeix al territori.',
  },

  communication: {
    eyebrow: 'L’oferta',
    title: 'L’oferta, en dues línies',
    lead: 'Treballo per encàrrec, amb un abast acordat per escrit abans de començar. Les dues línies es contracten per separat o juntes; en projectes transfronterers acostumen a anar juntes, perquè el dossier i la comunicació que en surt s’escriuen alhora.',
    offers: [
      {
        title: 'Assessorament i productes de comunicació',
        body: 'Des del pla de comunicació fins a la peça acabada. Cobreixo tot el cicle —estratègia, identitat, redacció, producció audiovisual—, i això vol dir no haver de coordinar tres proveïdors per obtenir una campanya coherent. En una estructura petita, aquesta és la diferència entre tenir comunicació i tenir intencions.',
        deliverablesLabel: 'Lliurables',
        deliverables: [
          'Pla de comunicació',
          'Identitat visual i normes d’ús',
          'Continguts web bilingües',
          'Vídeo i fotografia',
          'Presència a xarxes',
        ],
      },
      {
        title: 'Redacció de dossiers i recerca aplicada',
        body: 'Redacció de candidatures a subvenció, memòries i informes, amb la recerca de context que els sosté: dades de territori, cartografia d’actors, estat de la qüestió. El doctorat aquí no és una línia de currículum; és el que fa que la part de recerca aguanti una lectura exigent.',
        deliverablesLabel: 'Lliurables',
        deliverables: [
          'Dossiers de subvenció (Fonds 66, EsCaT/POCTEFA, Generalitat)',
          'Memòries i informes de justificació',
          'Estudis de context i cartografia d’actors',
          'Acompanyament fins a la justificació final',
        ],
      },
    ],
  },

  method: {
    eyebrow: 'Mètode',
    title: 'Com treballo amb les eines d’IA',
    lead: 'Faig servir eines d’IA en gairebé tot el que produeixo, i ho dic perquè el resultat es pot comprovar, no perquè sigui cap virtut. El que canvia la qualitat no és l’eina: és qui la pilota i què es valida abans de lliurar.',
    principles: [
      {
        title: 'Pilotatge, no delegació',
        body: 'L’eina no decideix res. Produeix matèria —esborranys, variants, traduccions de treball— i jo la reescric o la descarto. Un text que surt sencer d’un model es reconeix de seguida, i en un dossier institucional això costa punts.',
      },
      {
        title: 'Validació contra la font',
        body: 'Cada dada, cita o referència que arriba al lliurament l’he vista a la font. Els models fabriquen referències versemblants amb una facilitat notable, i comprovar-les continua essent l’única part del procés que no es pot delegar.',
      },
      {
        title: 'Paritat lingüística construïda, no traduïda',
        body: 'El català i el francès es redacten en paral·lel, no l’un a partir de l’altre. Una traducció automàtica repassada de pressa se sent en el registre, i davant d’un lector institucional, del costat que sigui, el registre és el que et situa.',
      },
    ],
    boundary:
      'No venc implantacions d’IA, ni auditories d’eines, ni formació en programari. La integració crítica és una manera de treballar; el que es contracta és el producte final, i és pel producte final que s’ha de jutjar.',
  },

  timeline: {
    eyebrow: 'Trajectòria',
    title: 'Una trajectòria en tres eixos',
    lead: 'Temps, territori i llengua alhora: quan, a quin costat de la frontera i en quines llengües. La combinació diu més del perfil que una llista de càrrecs, perquè el que hi compta és el pas d’un context a l’altre.',
  },

  cases: {
    eyebrow: 'Casos',
    title: 'Selecció de feines',
    lead: 'Una selecció curta, explicada de dalt a baix: què es demanava, què vaig fer i què va passar després. Alguns són encàrrecs; d’altres els he fet en el marc associatiu, i van etiquetats com a tals perquè la distinció compta.',
  },

  contact: {
    eyebrow: 'Contacte',
    title: 'Parlem-ne',
    lead: 'Escriu-me amb el que necessites i el termini que tens. Si no és feina meva t’ho diré de seguida, i si conec algú que ho faci millor, també. Pots escriure en català, francès o castellà; responc en la mateixa llengua.',
    emailLabel: 'Correu directe',
    form: {
      legend: 'O escriu-me des d’aquí',
      required: 'Els tres camps són necessaris.',
      fields: {
        name: { label: 'Nom', error: 'Digue’m com et dius.' },
        email: {
          label: 'Correu',
          error: 'Aquesta adreça no sembla completa; sense ella no et puc respondre.',
        },
        message: {
          label: 'Missatge',
          error: 'Explica’m què necessites, encara que siguin dues línies.',
        },
      },
      honeypot: 'Deixa aquest camp buit',
      submit: 'Envia el missatge',
      sending: 'Enviant…',
      success: 'Rebut. Et responc en un o dos dies feiners.',
      error:
        'L’enviament no ha arribat. Torna-ho a provar d’aquí a una estona o escriu-me directament al correu de sobre.',
      privacy: 'El que escriguis va a la meva bústia i enlloc més.',
    },
  },
};

const fr: HomeContent = {
  hero: {
    eyebrow: 'Miquel Rodrigues · Prats-de-Mollo, Haut-Vallespir',
    title: 'Communication, recherche appliquée et intégration critique de l’IA',
    intro:
      'Docteur en communication établi à Prats-de-Mollo, avec vingt ans d’expérience en communication, recherche et formation. Je propose trois services : conseil et produits de communication, rédaction de dossiers et recherche appliquée, et intégration critique d’outils d’IA. Je travaille en six langues des deux côtés de la frontière. Cette combinaison n’existe pas sur le territoire.',
  },

  communication: {
    eyebrow: 'L’offre',
    title: 'L’offre, en deux volets',
    lead: 'Je travaille sur commande, avec un périmètre arrêté par écrit avant de commencer. Les deux volets se contractent séparément ou ensemble ; sur les projets transfrontaliers ils vont d’ailleurs le plus souvent de pair, puisque le dossier et la communication qui en découle s’écrivent en même temps.',
    offers: [
      {
        title: 'Conseil et produits de communication',
        body: 'Du plan de communication à la pièce finie. Je couvre tout le cycle —stratégie, identité, rédaction, production audiovisuelle—, ce qui évite d’avoir à coordonner trois prestataires pour obtenir une campagne cohérente. Dans une petite structure, c’est ce qui sépare une communication d’une intention.',
        deliverablesLabel: 'Livrables',
        deliverables: [
          'Plan de communication',
          'Identité visuelle et règles d’usage',
          'Contenus web bilingues',
          'Vidéo et photographie',
          'Présence sur les réseaux',
        ],
      },
      {
        title: 'Rédaction de dossiers et recherche appliquée',
        body: 'Rédaction de candidatures à subvention, de mémoires et de rapports, avec la recherche de contexte qui les tient : données de territoire, cartographie d’acteurs, état de la question. Le doctorat n’est pas ici une ligne de CV ; c’est ce qui fait que la partie recherche résiste à une lecture exigeante.',
        deliverablesLabel: 'Livrables',
        deliverables: [
          'Dossiers de subvention (Fonds 66, EsCaT/POCTEFA, Generalitat)',
          'Mémoires et rapports de justification',
          'Études de contexte et cartographie d’acteurs',
          'Accompagnement jusqu’à la justification finale',
        ],
      },
    ],
  },

  method: {
    eyebrow: 'Méthode',
    title: 'Comment je travaille avec les outils d’IA',
    lead: 'J’utilise des outils d’IA dans presque tout ce que je produis, et je le dis parce que le résultat est vérifiable, non parce que ce serait une vertu. Ce qui change la qualité, ce n’est pas l’outil : c’est qui le pilote et ce qui est validé avant la livraison.',
    principles: [
      {
        title: 'Pilotage, pas délégation',
        body: 'L’outil ne décide rien. Il produit de la matière —brouillons, variantes, traductions de travail— que je réécris ou que j’écarte. Un texte sorti tel quel d’un modèle se repère aussitôt, et dans un dossier institutionnel cela coûte des points.',
      },
      {
        title: 'Validation à la source',
        body: 'Chaque donnée, citation ou référence qui arrive à la livraison, je l’ai vue à la source. Les modèles fabriquent des références vraisemblables avec une facilité remarquable, et les vérifier reste la seule partie du processus qui ne se délègue pas.',
      },
      {
        title: 'Parité linguistique construite, non traduite',
        body: 'Le catalan et le français s’écrivent en parallèle, pas l’un à partir de l’autre. Une traduction automatique relue trop vite s’entend dans le registre, et devant un lecteur institutionnel, d’un côté comme de l’autre, c’est le registre qui vous situe.',
      },
    ],
    boundary:
      'Je ne vends pas d’implantation d’IA, ni d’audit d’outils, ni de formation à des logiciels. L’intégration critique est une façon de travailler ; ce qui se contracte, c’est le produit fini, et c’est sur le produit fini qu’il faut juger.',
  },

  timeline: {
    eyebrow: 'Parcours',
    title: 'Un parcours en trois axes',
    lead: 'Le temps, le territoire et la langue en même temps : quand, de quel côté de la frontière et dans quelles langues. La combinaison dit plus du profil qu’une liste de postes, parce que ce qui compte ici, c’est le passage d’un contexte à l’autre.',
  },

  cases: {
    eyebrow: 'Cas',
    title: 'Sélection de travaux',
    lead: 'Une sélection courte, expliquée de bout en bout : ce qui était demandé, ce que j’ai fait, ce qui s’est passé ensuite. Certains sont des commandes ; d’autres ont été réalisés dans le cadre associatif, et ils sont étiquetés comme tels parce que la distinction compte.',
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Écrivez-moi',
    lead: 'Dites-moi ce dont vous avez besoin et dans quel délai. Si ce n’est pas mon travail je vous le dirai tout de suite, et si je connais quelqu’un qui le fait mieux, également. Vous pouvez écrire en catalan, en français ou en espagnol ; je réponds dans la même langue.',
    emailLabel: 'Courriel direct',
    form: {
      legend: 'Ou écrivez-moi d’ici',
      required: 'Les trois champs sont nécessaires.',
      fields: {
        name: { label: 'Nom', error: 'Dites-moi votre nom.' },
        email: {
          label: 'Courriel',
          error: 'Cette adresse semble incomplète ; sans elle je ne peux pas vous répondre.',
        },
        message: {
          label: 'Message',
          error: 'Dites-moi ce dont vous avez besoin, même en deux lignes.',
        },
      },
      honeypot: 'Laissez ce champ vide',
      submit: 'Envoyer le message',
      sending: 'Envoi…',
      success: 'Bien reçu. Je réponds sous un ou deux jours ouvrés.',
      error:
        'L’envoi n’a pas abouti. Réessayez dans un moment, ou écrivez-moi directement à l’adresse ci-dessus.',
      privacy: 'Ce que vous écrivez arrive dans ma boîte et nulle part ailleurs.',
    },
  },
};

export const home: Record<Lang, HomeContent> = { ca, fr };
