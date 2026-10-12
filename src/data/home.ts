import type { Lang } from '../i18n/utils';

/**
 * Contingut editorial de la one-page.
 *
 * La paritat no és una bona intenció: `ca` i `fr` compleixen la mateixa
 * interfície, i la parella d'ofertes, les tres línies de servei del hero i els
 * dos paràgrafs de relat del mètode són tuples de longitud fixa.
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

/**
 * Una línia de la llista de serveis del hero: el text i la secció a la qual
 * enllaça. Les àncores són els `id` de `Offer.astro` i de `Method.astro`, que
 * no es tradueixen, i per això són iguals en les dues llengües; el tipus les
 * tanca sobre les dues seccions que existeixen, de manera que una àncora
 * escrita malament no compila en lloc de trencar-se en silenci al navegador.
 */
interface ServiceLine {
  text: string;
  anchor: 'comunicacio' | 'metode';
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
     * Primer paràgraf de la presentació: tres fets (el doctorat, el lloc de
     * treball, les llengües). Fins al 12/10/2026 era un text de referència de la
     * secció 2.1 del brief que no s'havia d'alterar; Miquel va aixecar la
     * restricció (D1) en demanar de refer la presentació en coherència amb les
     * tres seccions reescrites, i per això aquest camp ja es pot tocar com els
     * altres.
     */
    intro: string;
    /**
     * Els tres serveis en tres línies, entre els dos paràgrafs, cadascuna
     * enllaçada a la seva secció (D7, 12/10/2026): anuncien el visible, el
     * treball que el sosté i les eines, i el lector hi arriba pel servei que
     * busca sense haver de llegir la portada de dalt a baix. Tupla: la llargada
     * i l'ordre han de ser els mateixos en les dues llengües.
     */
    services: [ServiceLine, ServiceLine, ServiceLine];
    /**
     * Segon paràgraf de la presentació (refosa del 4-9-2026, refeta el
     * 12/10/2026). Va un grau per sota del primer: mateixa mida, el color de
     * lead en comptes del ple. Hi van els fets de trajectòria (la tesi,
     * l'oficina de turisme, Camprodon) que ni el primer paràgraf ni la llista
     * de serveis diuen, i és l'únic lloc de la portada que els pot dir: les
     * seccions d'oferta i de mètode ja no nomenen cap projecte ni cap entitat.
     */
    intro2: string;
  };
  communication: SectionIntro & { offers: [Offer, Offer] };
  method: SectionIntro & {
    /**
     * El relat de la secció en dos paràgrafs (D4, 12/10/2026): què s'hi guanya
     * quan algú que ja fa servir un assistent d'IA treballa amb mi, i qui
     * controla el resultat. Ocupa el lloc de les tres columnes numerades
     * d'abans (D5): les tres formes d'eina (aplicació, cadena de tractament,
     * producte de comunicació) hi surten en prosa i no en llista. Tupla per la
     * mateixa raó que la resta: la paritat CA–FR la imposa el tipus.
     */
    story: [string, string];
    /**
     * Compromís de verificació xifrat, no una negació de venda (D5): l'antiga
     * frase («no venc implantacions d'IA») contradeia l'oferta d'eines pensades
     * per al projecte del client.
     */
    boundary: string;
  };
  timeline: SectionIntro;
  cases: SectionIntro;
  contact: SectionIntro & { emailLabel: string; form: ContactForm };
}

const ca: HomeContent = {
  hero: {
    eyebrow: 'Miquel Rodrigues · Prats de Molló, Alt Vallespir',
    title: 'Comunicació i recerca als dos costats de la frontera',
    intro:
      'Soc doctor en comunicació i treballo des de Prats de Molló, en sis llengües.',
    services: [
      { text: 'Comunicació: estratègia i peces acabades', anchor: 'comunicacio' },
      { text: 'Dossiers de finançament i recerca aplicada', anchor: 'comunicacio' },
      { text: 'Eines d’IA fetes per a cada projecte', anchor: 'metode' },
    ],
    intro2:
      'De la tesi, me n’ha quedat un mètode: abans d’escriure, saber qui llegeix i en quina llengua. Durant dos anys vaig dirigir l’oficina de turisme de Prats. La promoció es feia en quatre llengües i mirava també al sud, a l’altre costat de la frontera, on Camprodon és a mitja hora de casa per la Collada d’Ares.',
  },

  communication: {
    eyebrow: 'Serveis',
    title: 'Dues línies de treball',
    lead: 'Del que faig per a un projecte, el públic en veu la comunicació. Els dossiers i la recerca queden al darrere i donen sentit a la campanya: si em demanes totes dues coses, per exemple, la campanya parteix del dossier i fa servir dades que ja he comprovat. Treballo per encàrrec per a empreses, amb l’abast acordat per escrit.',
    offers: [
      {
        title: 'Assessorament i productes de comunicació',
        body: 'Comencem per l’estratègia: de què parlarà el projecte i a qui. Després en surten les peces, acabades: textos, imatge, vídeo, web. Ho produeixo tot jo. Si el projecte ho demana, hi afegeixo eines basades en IA i informes que agafen les teves dades i les fan llegibles per a qui ha de decidir.',
      },
      {
        title: 'Redacció de dossiers i recerca aplicada',
        body: 'La recerca va primer: les dades del territori, el mapa de qui hi decideix. Després escric el dossier que va a buscar el finançament, amb el projecte ben justificat, i el segueixo fins al tancament, quan toca demostrar què s’ha fet amb els diners. La recerca també es pot encarregar sola, en forma de diagnòstic territorial.',
      },
    ],
  },

  method: {
    eyebrow: 'Mètode',
    title: 'Com faig servir les eines d’IA',
    lead: 'Si portes un ajuntament petit o una associació, probablement ja fas servir un assistent d’IA per a les feines de cada dia: resumir un informe, escriure un correu difícil.',
    story: [
      'Amb aquesta base ens entenem de seguida i puc portar el teu projecte més lluny amb eines pensades per a ell: una aplicació petita, una cadena de tractament interna, un producte de comunicació. Si reps per correu propostes d’activitats, cadascuna escrita a la seva manera, un model en pot fer una fitxa per proposta, sempre amb els mateixos camps: qui l’organitza, què s’hi fa, on i quan. Jo munto aquesta cadena i decideixo en quin punt una persona revisa les fitxes abans que es publiquin.',
      'Tens els resultats abans i més ben fets. Un model et pot donar, amb el mateix aplom que la resta, la cita d’una revista que no existeix. Un paràgraf de dossier que en surt tal qual, un comitè d’avaluació el reconeix de seguida i el llegeix com a falta d’interès pel projecte. Conec prou les eines per guiar-les cap a una versió millor i prou l’ofici per veure quan encara no hi és.',
    ],
    boundary:
      'Les dades i les cites que proposa un model, com totes les del lliurament, les comprovo a la font; en un dossier hi dedico una hora.',
  },

  timeline: {
    eyebrow: 'Trajectòria',
    title: 'Una trajectòria en tres eixos',
    lead: 'A Barcelona treballava en anglès i vivia en català i en castellà. L’alemany el vaig aprendre durant la pandèmia, entre Suïssa i Alemanya.',
  },

  cases: {
    eyebrow: 'Casos',
    title: 'Selecció de feines',
    lead: 'Sis feines, explicades de cap a cap, inclosos els punts que continuen oberts. La meitat eren llocs de treball; l’altra meitat, feina associativa i recerca a la universitat.',
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
    title: 'Communication et recherche des deux côtés de la frontière',
    intro:
      'Docteur en communication, je travaille depuis Prats-de-Mollo, en six langues.',
    services: [
      { text: 'Communication : stratégie et pièces terminées', anchor: 'comunicacio' },
      { text: 'Dossiers de financement et recherche appliquée', anchor: 'comunicacio' },
      { text: 'Outils d’IA faits pour chaque projet', anchor: 'metode' },
    ],
    intro2:
      'Ma thèse m’a laissé une méthode : avant d’écrire, savoir qui lit et dans quelle langue. Pendant deux ans, j’ai dirigé l’office de tourisme de Prats. La promotion se faisait en quatre langues et regardait aussi vers le sud, de l’autre côté de la frontière, où Camprodon est à une demi-heure de chez moi par le col d’Ares.',
  },

  communication: {
    eyebrow: 'Services',
    title: 'Deux volets de travail',
    lead: 'De mon travail sur un projet, le public en voit la communication. Les dossiers et la recherche restent en coulisse et donnent du sens à la campagne : si vous me demandez les deux, par exemple, la campagne part du dossier et utilise des données que j’ai déjà vérifiées. Je travaille sur commande pour des entreprises, dans un périmètre convenu par écrit.',
    offers: [
      {
        title: 'Conseil et produits de communication',
        body: 'Nous commençons par la stratégie : de quoi le projet va parler et à qui. Viennent ensuite les pièces, terminées : textes, image, vidéo, site. Je produis tout moi-même. Si le projet le demande, j’y ajoute des outils appuyés sur l’IA et des rapports qui prennent vos données et les rendent lisibles par ceux qui décident.',
      },
      {
        title: 'Rédaction de dossiers et recherche appliquée',
        body: 'La recherche vient d’abord : les données du territoire, la carte de ceux qui y décident. J’écris ensuite le dossier qui va chercher le financement, avec un projet bien justifié, et je le suis jusqu’à la clôture, quand il faut montrer ce qu’on a fait de l’argent. La recherche peut aussi se commander seule, sous la forme d’un diagnostic territorial.',
      },
    ],
  },

  method: {
    eyebrow: 'Méthode',
    title: 'Comment je me sers des outils d’IA',
    lead: 'Si vous faites tourner une petite mairie ou une association, vous vous servez probablement déjà d’un assistant d’IA pour les tâches courantes : résumer un rapport, rédiger un courriel délicat.',
    story: [
      'Sur cette base, nous nous comprenons vite et je peux emmener votre projet plus loin avec des outils pensés pour lui : une petite application, une chaîne de traitement interne, un produit de communication. Si vous recevez par courriel des propositions d’activités, chacune rédigée à sa façon, un modèle peut en tirer une fiche par proposition, toujours avec les mêmes champs : qui l’organise, ce qu’on y fait, où et quand. Je monte cette chaîne et je décide à quel moment une personne relit les fiches avant leur publication.',
      'Vous avez les résultats plus tôt et mieux faits. Un modèle peut vous donner, avec le même aplomb que le reste, la citation d’une revue qui n’existe pas. Un paragraphe de dossier qui en sort tel quel, un comité d’évaluation le repère aussitôt et le lit comme un manque d’intérêt pour le projet. Je connais assez les outils pour les mener vers une meilleure version et assez le métier pour voir quand elle n’y est pas encore.',
    ],
    boundary:
      'Les données et les citations qu’avance un modèle, comme toutes celles de la livraison, je les vérifie à la source ; sur un dossier, j’y passe une heure.',
  },

  timeline: {
    eyebrow: 'Parcours',
    title: 'Un parcours en trois axes',
    lead: 'À Barcelone, je travaillais en anglais et je vivais en catalan et en castillan. L’allemand, je l’ai appris pendant la pandémie, entre la Suisse et l’Allemagne.',
  },

  cases: {
    eyebrow: 'Cas',
    title: 'Sélection de travaux',
    lead: 'Six travaux, expliqués de bout en bout, points encore ouverts compris. La moitié étaient des emplois ; l’autre moitié, du travail associatif et de la recherche à l’université.',
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
