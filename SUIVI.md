---
brouillon: oui
projet: web-perso
domaine: Personnel
---

| clé | tâche | échéance | contrainte | statut | organisme |
|---|---|---|---|---|---|
| commiter-editorial-md | Commiter EDITORIAL.md et la section « Textos públics » ajoutée à CLAUDE.md | | Interne | À faire | |
| configurer-form-endpoint | Configurer FORM_ENDPOINT sur Vercel pour afficher le formulaire de contact | | Interne | À faire | |
| tester-cms-decap | Tester l'entrée au CMS Decap (/admin/) et la création d'un cas depuis le CMS | | Interne | À faire | |
| confirmer-langues-cas-recherche | Confirmer les langues des cas GRECS/OACU et MOVOKEUR et le territoire de MOVOKEUR | | Interne | À faire | |
| audit-accessibilite | Faire l'audit d'accessibilité du site | | Interne | À faire | |
| supprimer-la-travessa | Supprimer le prototype /la-travessa/, remplacé par /la-ruta/ | | Interne | À faire | |

## Notes

Brouillon rédigé le 2026-10-14 à partir de : CLAUDE.md, EDITORIAL.md, README.md (section « Pendent »), SPEC_LA_RUTA.md (en-tête), coordination/REGISTRE.md, coordination/HANDOFF-MAITRE.md, `git log`, `git status`. À relire par Miquel.

Aucune échéance : aucun document du projet n'en donne une explicite. Toutes les contraintes sont `Interne` (site personnel, pas de financeur ni de client).

Sources des tâches :
- commiter-editorial-md : `git status` du 2026-10-14 montre `CLAUDE.md` modifié et `EDITORIAL.md` non suivi ; `main` = `origin/main` = `113ed01`, tout le reste est poussé.
- configurer-form-endpoint : README, « Pendent » : « `FORM_ENDPOINT` a Vercel: fins que no hi sigui, el formulari de contacte no es dibuixa en producció. » CLAUDE.md, tableau des variables : sans elle, « el formulari de contacte no es dibuixa ».
- tester-cms-decap : README, « Pendent » : « Queda per provar l'entrada mateixa […] i la creació d'un cas nou des del CMS ». REGISTRE, ligne 016 : « à vérifier par Miquel : `/admin/` après le push ».
- confirmer-langues-cas-recherche : README, « Pendent » : « Queda per confirmar l'eix llengua dels dos casos de recerca — `ca, es, en` per al GRECS/OACU i `es, en` per al MOVOKEUR — […] i el territori del MOVOKEUR ».
- audit-accessibilite : README, « Pendent » : « Auditoria d'accessibilitat, pendent des del bloc 5 i més exigible ara que el lloc és públic. »
- supprimer-la-travessa : CLAUDE.md, « Prototips llençables » : SPEC_LA_RUTA.md « declara `/la-travessa/` superada i pendent d'esborrar » ; SPEC_LA_RUTA.md, en-tête : « Supersedes: `/la-travessa/` (v1, built, to be deleted) ». REGISTRE, 2026-10-08 : Miquel supprime les prototypes lui-même, la boucle d'agents n'y touche pas.

## À confirmer par Miquel

- Les cinq lignes tirées de « Pendent » (README, dernière modification 2026-10-12) sont-elles encore ouvertes ? Le README n'a pas été relu contre le site en ligne : FORM_ENDPOINT, le test Decap, les langues des cas de recherche et l'audit d'accessibilité peuvent avoir été réglés sans trace dans les documents.
- Prototypes `/hero-demo/` et `/la-ruta/` : les pages existent encore dans le dépôt (`src/pages/hero-demo.astro`, `src/pages/la-ruta.astro`). CLAUDE.md dit de les supprimer « quan hagin fet la seva feina », sans dire si c'est fait. Ligne à ajouter si oui. SPEC_LA_RUTA.md indique « Status: not built » alors que `la-ruta.astro` est suivi par git : l'avancement de La Ruta n'est pas tranché ici (le projet `la-ruta` a son propre dossier, non lu).
- « Vint anys d'experiència » (EDITORIAL.md, banc de fets, état « A fixar ») : n'est pas une tâche, mais ce fait reste à confirmer avant tout usage dans un texte public.
- Relecture finale du texte de la portada et des fiches (commits `41f7795` et `113ed01`, déjà poussés) : EDITORIAL.md, procédé pas 8, prévoit de présenter le texte à Miquel paragraphe par paragraphe. Aucun document ne dit si c'est fait ; non listé comme tâche.
- Statut des lignes : toutes `À faire`, faute de document indiquant un travail commencé.
