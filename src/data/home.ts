import type { Lang } from '../i18n/utils';

/**
 * Contingut editorial de la one-page.
 *
 * La paritat no és una bona intenció: `ca` i `fr` compleixen la mateixa
 * interfície, i la parella d'ofertes i els dos paràgrafs de relat del mètode
 * són tuples de longitud fixa.
 * Afegir una línia o un paràgraf en una llengua i no en l'altra no compila.
 * Contrapartida assumida: allargar una d'aquestes llistes vol dir tocar el tipus
 * abans de tocar cap text.
 */

/**
 * Una oferta és un títol i un cos de prosa, i res més. Fins al 12/10/2026
 * duia sota el cos un bloc de lliuraments amb noms de projectes, d'entitats i de
 * finançadors; Miquel el va treure (D3) i va demanar que cap projecte, entitat
 * ni finançador no surti nomenat als textos de l'oferta: els noms propis viuen
 * als casos. Per això el tipus no té cap tupla de detall ni l'etiqueta que la
 * presentava.
 */
interface Offer {
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
    /**
     * Primer paràgraf de la presentació: d'on vinc, de les Cevenes a Prats de
     * Molló, amb el doctorat pel camí. Des del 13/10/2026 la presentació no
     * exposa ni els fets ni la promesa de l'oferta: dona una trajectòria i la
     * voluntat de servei (decisió de Miquel, que va descartar les dues
     * variants construïdes sobre els fets i sobre la promesa). Fins al
     * 12/10/2026 aquest camp era un text de referència de la secció 2.1 del
     * brief que no s'havia d'alterar; Miquel va aixecar la restricció (D1), i
     * per això es toca com els altres. El 20/10/2026 Miquel el va demanar més
     * llarg: hi entren les llengües de cada etapa, que fins aleshores eren el
     * lead de la trajectòria, i el treball de camp al Valais. Així les sis
     * llengües del segon paràgraf ja no arriben soles.
     */
    intro: string;
    /**
     * Segon paràgraf de la presentació (refosa del 4-9-2026, refeta el 12 i el
     * 13/10/2026). Va un grau per sota del primer: mateixa mida, el color de
     * lead en comptes del ple. Hi va la vall: l'Alt Vallespir com a vall
     * aïllada on la comunicació és vital (paraules de Miquel del 13/10/2026),
     * amb una imatge concreta en lloc d'una màxima, els trenta quilòmetres que
     * ja diu el cas de «Què fas?». Després, el que hi he fet amb nom propi,
     * TVallespir: és l'únic lloc de la portada que el pot nomenar, perquè les
     * seccions d'oferta i de mètode no diuen cap projecte ni cap entitat (D3).
     * La xifra de TVallespir porta les xarxes on es mesura: sola, el lector no
     * sabia de què eren els usuaris. L'oficina de turisme en va sortir el
     * 20/10/2026: Miquel no la veu pertinent a la presentació, i els casos ja
     * la conten. El mateix dia va caure la llista de tres serveis enllaçats
     * que anava entre els dos paràgrafs (D7).
     */
    intro2: string;
  };
  communication: SectionIntro & { offers: [Offer, Offer] };
  method: SectionIntro & {
    /**
     * El relat de la secció en dos paràgrafs. Des del 13/10/2026 (decisió de
     * Miquel) no parteix d'una proposta: reconeix que faig servir la IA i en
     * presenta un ús crític. El primer paràgraf nomena els riscos (cites
     * inventades, servidors aliens, instruccions amagades en un correu) i les
     * precaucions; el segon, el que hi pot guanyar el lector, sigui quina sigui
     * la seva activitat. La llista d'eines del 12/10 (D4: aplicació, cadena de
     * tractament, producte de comunicació) ha caigut amb la proposta. De les
     * dues frases de privacitat que es van proposar, hi va la més prudent, la
     * que Miquel va confirmar com a certa: no promet més del que es fa. Tupla
     * per la mateixa raó que la resta: la paritat CA–FR la imposa el tipus.
     */
    story: [string, string];
    /**
     * La frase destacada amb el filet d'accent. Des del 20/10/2026 diu el
     * coneixement d'especialista que fa possible supervisar, reconduir i
     * verificar el que produeix la IA (decisió de Miquel). Substitueix el
     * compromís de verificació xifrat de D5 («les comprovo a la font; […] una
     * hora»), que Miquel no volia destacar. Tampoc no torna l'antiga negació
     * de venda («no venc implantacions d'IA»).
     */
    boundary: string;
  };
  /**
   * Sense lead des del 20/10/2026: el paràgraf de les llengües va passar al
   * primer de la presentació, i el seu lloc l'ocuparà l'enllaç al CV dinàmic
   * que Miquel ha de passar.
   */
  timeline: Omit<SectionIntro, 'lead'>;
  cases: SectionIntro;
  contact: SectionIntro & { emailLabel: string; form: ContactForm };
}

const ca: HomeContent = {
  hero: {
    eyebrow: 'Miquel Rodrigues',
    title: 'Comunicació i recerca aplicades a les teves necessitats',
    intro:
      'Vaig créixer en un poble de les Cevenes i vaig estudiar economia a Lisboa, on el portuguès es va convertir en la llengua de cada dia. A Barcelona em vaig doctorar en comunicació, amb una tesi sobre com es va explicar la crisi de l’euro en diverses llengües alhora. Hi vaig coordinar socis de diferents països en un projecte de recerca europeu, en anglès, mentre vivia en català i en castellà. Vaig passar la pandèmia entre Suïssa i Alemanya: al Valais feia la verema com a temporer i, alhora, l’etnografia dels temporers per a la Universitat de Barcelona. En vaig tornar parlant alemany. El 2023 em vaig instal·lar a Prats de Molló per quedar-m’hi.',
    intro2:
      'L’Alt Vallespir és una vall de muntanya que s’acaba a la frontera. En un lloc tan aïllat, la comunicació és vital: sense ella, ningú no sap què passa a trenta quilòmetres de casa. El 2024 hi vaig llançar TVallespir, un mitjà associatiu i bilingüe que arriba a 150 000 usuaris al mes a Instagram i Facebook. Treballo en sis llengües perquè els projectes d’aquí i de l’altra banda de la frontera arribin més lluny.',
  },

  communication: {
    eyebrow: 'Serveis',
    title: 'Dues línies de treball',
    lead: 'D’un projecte, el públic en veu la comunicació. El dossier de finançament i la recerca no es veuen, però són els que responen quan algú pregunta per què es fa i què costarà. Treballo per encàrrec per a empreses i ajuntaments, amb l’abast acordat per escrit.',
    offers: [
      {
        title: 'Assessorament i productes de comunicació',
        body: 'Primer decidim què ha de dir el projecte, a qui i en quina llengua. Després en surten les peces acabades: textos, imatge, vídeo i web. Les produeixo totes jo, com les del mitjà audiovisual i bilingüe que vaig llançar, que arriba a 150 000 usuaris al mes. Si cal, hi sumo eines d’IA i informes que posen en clar les teves xifres de visites o de vendes.',
      },
      {
        title: 'Redacció de dossiers i recerca aplicada',
        body: 'Cada dossier comença per la recerca: les dades del territori i les institucions que hi decideixen. Llavors l’escric, amb el projecte justificat davant els criteris amb què l’avaluaran, i el segueixo fins al tancament, quan toca demostrar què s’ha fet amb els diners. La recerca també es pot encarregar sola, com a diagnòstic territorial.',
      },
    ],
  },

  method: {
    eyebrow: 'Mètode',
    title: 'Un ús crític de la IA',
    lead: 'Treballo amb eines d’IA, com cada vegada més gent, i hi aplico la mateixa desconfiança que a qualsevol font que encara no he comprovat.',
    story: [
      'Un model s’inventa una cita amb el mateix aplom que les certes. Un comitè d’avaluació, en canvi, reconeix el paràgraf de dossier que n’ha sortit tal qual, i el llegeix com a falta d’interès pel projecte. El que s’hi escriu pot acabar en servidors que no controles, i un correu pot dur instruccions amagades per a l’eina que el processa. Per això les dades personals i els documents interns no hi entren sense que sàpiga on van a parar, i la IA s’hi limita a feines acotades que una persona valida. Conec l’ofici: veig quan un resultat encara no hi és i sé portar el model cap a una versió millor.',
      'Amb aquestes precaucions, hi ha molt a guanyar, sigui quina sigui la teva activitat. Una associació que rep per correu propostes d’activitats, cadascuna escrita a la seva manera, en pot treure fitxes amb els mateixos camps sense tornar-les a picar. Un ajuntament pot fer de l’acta d’un ple un resum per al butlletí, i una empresa, ordenar les ressenyes dels clients per saber què li demanen.',
    ],
    boundary:
      'Tinc els coneixements d’especialista que calen per supervisar la qualitat del que produeix la IA, reconduir-la quan s’equivoca i comprovar-ne les dades a la font.',
  },

  timeline: {
    eyebrow: 'Trajectòria',
    title: 'Una trajectòria en tres eixos',
  },

  cases: {
    eyebrow: 'Casos',
    title: 'Selecció de feines',
    lead: 'Una mostra del que he fet, en sis feines explicades de cap a cap, inclosos els punts que continuen oberts.',
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
    eyebrow: 'Miquel Rodrigues',
    title: 'Communication et recherche appliquées à vos besoins',
    intro:
      'J’ai grandi dans un village des Cévennes, puis j’ai étudié l’économie à Lisbonne, où le portugais est devenu la langue de tous les jours. À Barcelone, j’ai soutenu un doctorat en communication, avec une thèse sur la manière dont la crise de l’euro s’est racontée en plusieurs langues à la fois. J’y ai ensuite coordonné des partenaires de différents pays sur un projet de recherche européen. Je travaillais en anglais, je vivais en catalan et en castillan. J’ai passé la pandémie entre la Suisse et l’Allemagne : en Valais, je faisais les vendanges comme saisonnier et, en même temps, l’ethnographie des saisonniers pour l’Université de Barcelone. J’en suis revenu germanophone. En 2023, je me suis installé à Prats-de-Mollo pour y rester.',
    intro2:
      'Le Haut-Vallespir est une vallée de montagne qui bute sur la frontière. Dans un endroit aussi isolé, la communication devient vitale : sans elle, personne ne sait ce qui se passe à trente kilomètres de chez soi. En 2024, j’y ai lancé TVallespir, un média associatif et bilingue qui touche 150 000 utilisateurs par mois sur Instagram et Facebook. Je travaille en six langues pour que les projets d’ici et de l’autre côté de la frontière portent plus loin.',
  },

  communication: {
    eyebrow: 'Services',
    title: 'Deux volets de travail',
    lead: 'Ce que le public voit d’un projet, c’est sa communication. Le dossier de financement et la recherche restent en coulisse, mais ce sont eux qui répondent quand on demande pourquoi le projet se fait et ce qu’il coûtera. Je travaille sur commande pour des entreprises et des mairies, dans un périmètre convenu par écrit.',
    offers: [
      {
        title: 'Conseil et produits de communication',
        body: 'On fixe d’abord ce que le projet doit dire, à qui et dans quelle langue. Puis les supports finis : textes, image, vidéo, site. Je les produis moi-même, comme ceux du média audiovisuel bilingue que j’ai lancé, qui touche 150 000 utilisateurs par mois. Au besoin, j’y ajoute des outils d’IA et des rapports qui mettent au clair vos chiffres de fréquentation ou de ventes.',
      },
      {
        title: 'Rédaction de dossiers et recherche appliquée',
        body: 'Chaque dossier commence par la recherche : les données du territoire et les institutions qui y décident. Je l’écris ensuite en justifiant le projet selon les critères qui serviront à l’évaluer, et je le suis jusqu’à la clôture, quand il faut montrer ce qu’on a fait de l’argent. La recherche peut aussi se commander seule, sous forme de diagnostic territorial.',
      },
    ],
  },

  method: {
    eyebrow: 'Méthode',
    title: 'Un usage critique de l’IA',
    lead: 'Je travaille avec des outils d’IA, comme de plus en plus de gens, et je leur applique la même méfiance qu’à toute source que je n’ai pas encore vérifiée.',
    story: [
      'Un modèle invente une citation avec le même aplomb que les vraies. Un comité d’évaluation, lui, repère le paragraphe de dossier qui en sort tel quel, et il y lit un manque d’intérêt pour le projet. Ce qu’on y écrit peut finir sur des serveurs que vous ne contrôlez pas, et un courriel peut contenir des instructions cachées destinées à l’outil qui le traite. Alors les données personnelles et les documents internes n’y entrent pas sans que je sache où ils vont, et l’IA s’en tient à des tâches délimitées qu’une personne valide. Je connais le métier : je vois quand un résultat n’y est pas encore, et je sais mener le modèle vers une meilleure version.',
      'Avec ces précautions, il y a beaucoup à gagner, quelle que soit votre activité. Une association qui reçoit par courriel des propositions d’activités, chacune rédigée à sa façon, peut en tirer des fiches aux mêmes champs sans rien ressaisir. Une mairie peut faire du compte rendu d’un conseil municipal un résumé pour le bulletin, et une entreprise trier les avis de ses clients pour savoir ce qu’ils lui demandent.',
    ],
    boundary:
      'J’ai les connaissances de spécialiste qu’il faut pour superviser la qualité de ce que produit l’IA, la recadrer quand elle se trompe et en vérifier les données à la source.',
  },

  timeline: {
    eyebrow: 'Parcours',
    title: 'Un parcours en trois axes',
  },

  cases: {
    eyebrow: 'Cas',
    title: 'Sélection de travaux',
    lead: 'Un aperçu de ce que j’ai fait, en six travaux expliqués de bout en bout, points encore ouverts compris.',
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
