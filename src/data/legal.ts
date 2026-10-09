/**
 * Text de la pàgina d'avís legal (`/ca/avis-legal/` ↔ `/fr/mentions-legales/`).
 *
 * Ve de les decisions de Miquel del 8 i del 9/10/2026: exerceix com a
 * microempresa, amb franquícia d'IVA, i no publica ni adreça ni telèfon (per
 * decisió seva, no per oblit). Els fets d'identitat es llegeixen de `site.mjs`
 * i no es copien aquí: si canvien, canvien en un sol lloc.
 *
 * La forma del tipus imposa la paritat de seccions: una llengua sense alguna
 * de les quatre no compila. L'ordre en què es dibuixen el fixa el component.
 *
 * ATENCIÓ: si un dia es configura `FORM_ENDPOINT`, la secció `data` ha de
 * guanyar el paràgraf sobre el servei de formularis que rep els missatges.
 * Avui el formulari no es dibuixa i el text només parla del correu; amb el
 * formulari actiu, dir-ho així seria inexacte.
 */
import { site } from '../config/site.mjs';
import type { Lang } from '../i18n/utils';

type LegalSection = 'editor' | 'host' | 'data' | 'contents';

interface LegalCopy {
  title: string;
  /** Per a la balisa meta de la pàgina. */
  description: string;
  sections: Record<LegalSection, { heading: string; paragraphs: string[] }>;
}

export const legal: Record<Lang, LegalCopy> = {
  ca: {
    title: 'Avís legal',
    description: 'Qui edita i allotja aquest lloc, i què se’n fa de les vostres dades.',
    sections: {
      editor: {
        heading: 'Qui edita aquest lloc',
        paragraphs: [
          `Aquest lloc l’edita ${site.name} (nom civil: ${site.legalName}), empresari individual en règim de microempresa, SIREN ${site.siren}. IVA no aplicable, article 293 B del Code général des impôts. Correu: ${site.email}.`,
          `El director de la publicació és el mateix ${site.name}.`,
        ],
      },
      host: {
        heading: 'Qui l’allotja',
        paragraphs: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, Estats Units (privacy@vercel.com).'],
      },
      data: {
        heading: 'Les vostres dades',
        paragraphs: [
          'El lloc no fa servir galetes ni cap eina de mesura d’audiència, i les lletres tipogràfiques se serveixen des del mateix domini: navegar-hi no envia res a tercers.',
          'L’única dada que es desa és la llengua triada, al vostre navegador i enlloc més, perquè la visita següent s’obri directament en aquesta llengua. S’esborra buidant les dades del lloc al navegador.',
          'Si m’escriviu per correu, faig servir la vostra adreça i el vostre missatge només per respondre-us: no entren en cap llista i no es cedeixen a ningú. Podeu demanar-ne la consulta, la correcció o l’esborrament a la mateixa adreça i, si cal, adreçar-vos a la CNIL.',
        ],
      },
      contents: {
        heading: 'Continguts',
        paragraphs: [
          `Els textos, les imatges i els elements gràfics d’aquest lloc són de ${site.name}, llevat que s’indiqui el contrari. Els logotips i les marques dels projectes presentats als casos pertanyen a les entitats respectives.`,
        ],
      },
    },
  },
  fr: {
    title: 'Mentions légales',
    description: 'Qui édite et héberge ce site, et ce qu’il advient de vos données.',
    sections: {
      editor: {
        heading: 'Éditeur',
        paragraphs: [
          `Ce site est édité par ${site.name} (nom à l’état civil : ${site.legalName}), entrepreneur individuel sous le régime de la micro-entreprise, SIREN ${site.siren}. TVA non applicable, article 293 B du CGI. Courriel : ${site.email}.`,
          `Directeur de la publication : ${site.name}.`,
        ],
      },
      host: {
        heading: 'Hébergeur',
        paragraphs: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (privacy@vercel.com).'],
      },
      data: {
        heading: 'Vos données',
        paragraphs: [
          'Le site ne pose aucun cookie et n’utilise aucun outil de mesure d’audience ; les polices sont servies depuis le domaine lui-même. Le consulter ne transmet donc rien à des tiers.',
          'La seule donnée conservée est la langue choisie, dans votre navigateur et nulle part ailleurs, pour que la visite suivante s’ouvre directement dans cette langue. On l’efface en vidant les données du site dans le navigateur.',
          'Si vous m’écrivez par courriel, votre adresse et votre message ne me servent qu’à vous répondre : ils ne rejoignent aucune liste et ne sont cédés à personne. Vous pouvez en demander l’accès, la rectification ou l’effacement à la même adresse et, au besoin, saisir la CNIL.',
        ],
      },
      contents: {
        heading: 'Contenus',
        paragraphs: [
          `Sauf mention contraire, les textes, images et éléments graphiques du site sont de ${site.name}. Les logos et marques des projets présentés dans les cas appartiennent à leurs structures respectives.`,
        ],
      },
    },
  },
};
