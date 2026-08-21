import type { Lang } from './utils';

/**
 * Cadenes d'interfície i textos curts.
 *
 * La paritat és una restricció de tipus: `fr` ha de cobrir exactament les
 * mateixes claus que `ca`. Si en falta cap, `npm run check` falla. No es pot
 * publicar una llengua per davant de l'altra ni per descuit.
 */
const ca = {
  'meta.title': 'Miquel Rodrigues — comunicació, recerca i IA',
  'meta.description':
    'Doctor en comunicació establert a Prats de Molló. Assessorament i productes de comunicació, redacció de dossiers i recerca aplicada, integració crítica d’eines d’IA. Sis llengües, dos costats de la frontera.',

  'skip.content': 'Vés al contingut',
  'nav.label': 'Navegació principal',
  'nav.presentation': 'Presentació',
  'nav.communication': 'Comunicació',
  'nav.method': 'Mètode',
  'nav.timeline': 'Trajectòria',
  'nav.cases': 'Casos',
  'nav.contact': 'Contacte',

  /* Enllaç de l'hero cap a la presentació, que ve just a sota. */
  'hero.more': 'Llegir més',
  'hero.portraitAlt': 'Retrat d’en Miquel Rodrigues',

  /* Maneta de la peça de l'oferta: la costura que reparteix les dues línies. */
  'offer.split': 'Repartiment entre les dues línies de l’oferta',
  'offer.hint': 'Arrossega la línia per veure’n més',

  'lang.switch': 'Canvia de llengua',
  'lang.to': 'Versió en francès',

  'footer.rights': 'Tots els drets reservats',
  'footer.email': 'Correu',

  'case.facts': 'Fitxa',
  'case.account': 'El cas',
  'case.read': 'Llegir el cas',
  'case.nav': 'Navegació entre casos',
  'case.prev': 'Cas anterior',
  'case.next': 'Cas següent',
  'case.back': 'Tornar a la selecció',

  '404.title': 'Pàgina no trobada',
  '404.body': 'L’adreça no correspon a cap pàgina d’aquest lloc.',
  '404.home': 'Tornar a la portada',
} as const;

export type UIKey = keyof typeof ca;

const fr: Record<UIKey, string> = {
  'meta.title': 'Miquel Rodrigues — communication, recherche et IA',
  'meta.description':
    'Docteur en communication établi à Prats-de-Mollo. Conseil et produits de communication, rédaction de dossiers et recherche appliquée, intégration critique d’outils d’IA. Six langues, deux côtés de la frontière.',

  'skip.content': 'Aller au contenu',
  'nav.label': 'Navigation principale',
  'nav.presentation': 'Présentation',
  'nav.communication': 'Communication',
  'nav.method': 'Méthode',
  'nav.timeline': 'Parcours',
  'nav.cases': 'Cas',
  'nav.contact': 'Contact',

  'hero.more': 'Lire la suite',
  'hero.portraitAlt': 'Portrait de Miquel Rodrigues',

  'offer.split': 'Répartition entre les deux volets de l’offre',
  'offer.hint': 'Faites glisser la ligne pour en voir plus',

  'lang.switch': 'Changer de langue',
  'lang.to': 'Version en catalan',

  'footer.rights': 'Tous droits réservés',
  'footer.email': 'Courriel',

  'case.facts': 'Fiche',
  'case.account': 'Le cas',
  'case.read': 'Lire le cas',
  'case.nav': 'Navigation entre les cas',
  'case.prev': 'Cas précédent',
  'case.next': 'Cas suivant',
  'case.back': 'Retour à la sélection',

  '404.title': 'Page introuvable',
  '404.body': 'Cette adresse ne correspond à aucune page du site.',
  '404.home': 'Retour à l’accueil',
};

export const ui: Record<Lang, Record<UIKey, string>> = { ca, fr };

/** Traductor lligat a una llengua. */
export function useTranslations(lang: Lang) {
  return (key: UIKey): string => ui[lang][key];
}
