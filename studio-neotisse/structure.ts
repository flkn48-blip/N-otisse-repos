import type {StructureResolver} from 'sanity/structure'
import {IconeEvenement, IconeAvisPublie, IconeAvisRefuse, IconeAvis, IconeActualite, IconePartenaire} from './schemaTypes/icones'

// Menu de gauche du Studio : les avis à relire en premier, puis les autres rubriques.
// Avis à relire = brouillons non refusés (privés) ; publiés = version publiée ; refusés = case « Avis refusé » cochée (restent privés).
// Le Studio lit les avis « brouillon d'abord » : _originalId indique si la version affichée est un brouillon.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenus du site')
    .items([
      S.listItem()
        .title('Avis à relire')
        .icon(IconeAvis)
        .child(
          S.documentList()
            .title('Avis à relire')
            .schemaType('avis')
            .filter('_type == "avis" && (_id in path("drafts.**") || _originalId in path("drafts.**")) && refuse != true')
            .defaultOrdering([{field: 'envoyeLe', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Avis publiés')
        .icon(IconeAvisPublie)
        .child(
          S.documentList()
            .title('Avis publiés')
            .schemaType('avis')
            .filter('_type == "avis" && !(_id in path("drafts.**")) && !(_originalId in path("drafts.**"))')
            .defaultOrdering([{field: 'envoyeLe', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Avis refusés')
        .icon(IconeAvisRefuse)
        .child(
          S.documentList()
            .title('Avis refusés')
            .schemaType('avis')
            .filter('_type == "avis" && refuse == true')
            .defaultOrdering([{field: 'envoyeLe', direction: 'desc'}]),
        ),
      S.divider(),
      S.documentTypeListItem('evenement').title('Événements du calendrier').icon(IconeEvenement),
      S.documentTypeListItem('actualite').title('Actualités').icon(IconeActualite),
      S.documentTypeListItem('partenaire').title('Partenaires').icon(IconePartenaire),
    ])
