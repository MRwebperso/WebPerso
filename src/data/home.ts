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
    /**
     * Segon paràgraf de la presentació (refosa del 4-9-2026). Va un grau per
     * sota del nucli invariant: mateixa mida, el color de lead en comptes del
     * ple. Substancia amb fets datats el que el primer paràgraf declara.
     */
    intro2: string;
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
    intro2:
      'La meva tesi analitzava com s’havia explicat la crisi de l’euro en diverses llengües alhora. Des d’aleshores faig el mateix a escala petita: saber qui llegeix, en quina llengua i amb quins criteris jutja. He dirigit una oficina de turisme de frontera durant dos anys, he escrit i justificat dossiers europeus, i he auditat organitzacions des de fora. Treballo des de Prats de Molló, a mitja hora de Camprodon per la Collada d’Ares.',
  },

  communication: {
    eyebrow: 'Serveis',
    title: 'Dues línies de treball',
    lead: 'Treballo per encàrrec, amb l’abast acordat per escrit. Els interlocutors habituals són ajuntaments petits, associacions culturals, oficines de turisme i estructures d’una o dues persones que necessiten una campanya sencera i no tenen ningú per coordinar-la. En projectes transfronterers les dues línies solen anar juntes: el dossier i la comunicació que en surt s’escriuen alhora.',
    offers: [
      {
        title: 'Assessorament i productes de comunicació',
        body: 'Del pla de comunicació a la peça acabada: estratègia, identitat, redacció, fotografia i vídeo. Ho produeixo tot jo, i el mateix criteri travessa el cartell, el web i el compte d’Instagram. Vaig portar la comunicació institucional de l’Ajuntament dels Banys d’Arles i, després, la de la destinació de l’Alt Vallespir en quatre llengües.',
        deliverablesLabel: 'Lliurables',
        deliverables: [
          'Pla de comunicació',
          'Identitat visual i normes d’ús',
          'Webs bilingües amb gestor d’edició',
          'Vídeo i fotografia',
          'Calendari editorial de xarxes',
        ],
      },
      {
        title: 'Redacció de dossiers i recerca aplicada',
        body: 'Candidatures a subvenció, memòries i informes, amb la recerca que els sosté: dades de territori, cartografia d’actors, estat de la qüestió. He redactat i justificat dossiers europeus fins al tancament, he coordinat socis de diversos països al projecte MOVOKEUR del Ministerio de Educación y Cultura, he auditat organitzacions per encàrrec extern i he signat tretze publicacions acadèmiques.',
        deliverablesLabel: 'Lliurables',
        deliverables: [
          'Dossiers de subvenció (Fonds 66, EsCaT/POCTEFA, Generalitat)',
          'Memòries i informes de justificació',
          'Estudis de context i cartografia d’actors',
          'Cartes de suport i convenis de partenariat',
          'Acompanyament fins a la justificació final',
        ],
      },
    ],
  },

  method: {
    eyebrow: 'Mètode',
    title: 'Com faig servir les eines d’IA',
    lead: 'Faig servir eines d’IA en gairebé tot el que produeixo. Aquest lloc n’és un exemple: escrit amb assistència d’IA, muntat amb Claude Code, i amb la cronologia de més avall com a peça a jutjar. La feina real és el que es descarta abans de lliurar.',
    principles: [
      {
        title: 'El pilotatge',
        body: 'L’eina produeix matèria: esborranys, variants, traduccions de treball. Jo la reescric, la retallo o la llenço. En un dossier institucional, un paràgraf que ha sortit sencer d’un model es nota de seguida, i el comitè el llegeix com a manca d’interès pel projecte.',
      },
      {
        title: 'La comprovació',
        body: 'Cada dada, cita i referència que arriba al lliurament l’he vista a la font. Els models fabriquen referències versemblants amb una facilitat notable: any equivocat, revista que no existeix, pàgina inventada. Comprovar-ho és una hora de feina per dossier i no me la salto mai.',
      },
      {
        title: 'Les dues llengües',
        body: 'El català i el francès es redacten en paral·lel, cadascun des de zero. En aquest territori el lector institucional sovint té les dues versions obertes, i una traducció feta de pressa es reconeix pel registre. Aquest lloc no té versió principal: les dues rutes es generen alhora i el commutador de dalt no recarrega res.',
      },
    ],
    boundary:
      'No venc implantacions d’IA ni formació en programari. El que es contracta és el producte acabat.',
  },

  timeline: {
    eyebrow: 'Trajectòria',
    title: 'Una trajectòria en tres eixos',
    lead: 'Temps, territori i llengua alhora: quan, a quin costat de la frontera i en quines llengües. Les sis llengües surten d’aquest recorregut, cadascuna del lloc on em va tocar viure.',
  },

  cases: {
    eyebrow: 'Casos',
    title: 'Selecció de feines',
    lead: 'Sis feines, explicades de dalt a baix: què es demanava, què vaig fer i com va acabar, inclosos els punts que continuen oberts. Algunes són encàrrecs; d’altres, llocs de treball o feina associativa, i van etiquetades.',
  },

  contact: {
    eyebrow: 'Contacte',
    title: 'Parlem-ne',
    lead: 'Escriu-me amb el que necessites, per a quina estructura i amb quin termini. Pots escriure’m en català, francès, castellà, portuguès, anglès o alemany, i et contesto en la mateixa llengua.',
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
    intro2:
      'Ma thèse portait sur la manière dont la crise de l’euro s’est racontée dans plusieurs langues à la fois. Depuis, je fais la même chose à petite échelle : savoir qui lit, dans quelle langue, et selon quels critères. J’ai dirigé pendant deux ans un office de tourisme frontalier, j’ai écrit et justifié des dossiers européens, et j’ai audité des organisations de l’extérieur. Je travaille depuis Prats-de-Mollo, à trente minutes de Camprodon par le col d’Ares.',
  },

  communication: {
    eyebrow: 'Services',
    title: 'Deux volets de travail',
    lead: 'Je travaille sur commande, avec un périmètre arrêté par écrit. Mes interlocuteurs habituels sont de petites mairies, des associations culturelles, des offices de tourisme et des structures d’une ou deux personnes qui ont besoin d’une campagne entière sans avoir personne pour la coordonner. Sur les projets transfrontaliers, les deux volets vont généralement de pair : le dossier et la communication qui en découle s’écrivent en même temps.',
    offers: [
      {
        title: 'Conseil et produits de communication',
        body: 'Du plan de communication à la pièce finie : stratégie, identité, rédaction, photo et vidéo. Je produis tout moi-même, et le même parti pris traverse l’affiche, le site et le compte Instagram. J’ai porté la communication institutionnelle de la mairie d’Amélie-les-Bains, puis celle de la destination Haut-Vallespir en quatre langues.',
        deliverablesLabel: 'Livrables',
        deliverables: [
          'Plan de communication',
          'Identité visuelle et règles d’usage',
          'Sites bilingues avec interface d’édition',
          'Vidéo et photographie',
          'Calendrier éditorial des réseaux',
        ],
      },
      {
        title: 'Rédaction de dossiers et recherche appliquée',
        body: 'Candidatures à subvention, mémoires et rapports, avec la recherche qui les tient : données de territoire, cartographie d’acteurs, état de la question. J’ai rédigé et justifié des dossiers européens jusqu’à la clôture, coordonné des partenaires de plusieurs pays sur le projet MOVOKEUR du Ministerio de Educación y Cultura, audité des organisations pour un commanditaire extérieur et signé treize publications académiques.',
        deliverablesLabel: 'Livrables',
        deliverables: [
          'Dossiers de subvention (Fonds 66, EsCaT/POCTEFA, Generalitat)',
          'Mémoires et rapports de justification',
          'Études de contexte et cartographie d’acteurs',
          'Lettres de soutien et conventions de partenariat',
          'Accompagnement jusqu’à la clôture',
        ],
      },
    ],
  },

  method: {
    eyebrow: 'Méthode',
    title: 'Comment je me sers des outils d’IA',
    lead: 'J’utilise des outils d’IA dans presque tout ce que je produis. Ce site en est un exemple : écrit avec l’assistance d’une IA, monté avec Claude Code, et avec la chronologie plus bas comme pièce à juger. Le vrai travail, c’est ce qu’on écarte avant de livrer.',
    principles: [
      {
        title: 'Le pilotage',
        body: 'L’outil produit de la matière : brouillons, variantes, traductions de travail. Je la réécris, je la coupe ou je la jette. Dans un dossier institutionnel, un paragraphe sorti tel quel d’un modèle se repère aussitôt, et le comité le lit comme un manque d’intérêt pour le projet.',
      },
      {
        title: 'La vérification',
        body: 'Chaque donnée, citation et référence qui arrive à la livraison, je l’ai vue à la source. Les modèles fabriquent des références vraisemblables avec une facilité remarquable : mauvaise année, revue inexistante, page inventée. La vérification, c’est une heure de travail par dossier, et je ne la saute jamais.',
      },
      {
        title: 'Les deux langues',
        body: 'Le catalan et le français s’écrivent en parallèle, chacun depuis zéro. Sur ce territoire, le lecteur institutionnel a souvent les deux versions ouvertes, et une traduction faite trop vite s’entend au registre. Ce site n’a pas de version principale : les deux routes sont générées ensemble, et le sélecteur du haut ne recharge rien.',
      },
    ],
    boundary:
      'Je ne vends ni implantation d’IA ni formation à des logiciels. Ce qui se contracte, c’est le produit fini.',
  },

  timeline: {
    eyebrow: 'Parcours',
    title: 'Un parcours en trois axes',
    lead: 'Le temps, le territoire et la langue en même temps : quand, de quel côté de la frontière et dans quelles langues. Les six langues sortent de ce parcours, chacune du lieu où j’ai vécu.',
  },

  cases: {
    eyebrow: 'Cas',
    title: 'Sélection de travaux',
    lead: 'Six travaux, expliqués de bout en bout : ce qui était demandé, ce que j’ai fait, comment cela s’est terminé, points encore ouverts compris. Certains sont des commandes ; d’autres des postes occupés ou du travail associatif, et ils sont étiquetés.',
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Écrivez-moi',
    lead: 'Écrivez-moi ce dont vous avez besoin, pour quelle structure et dans quel délai. Vous pouvez m’écrire en catalan, en français, en castillan, en portugais, en anglais ou en allemand : je réponds dans la même langue.',
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
