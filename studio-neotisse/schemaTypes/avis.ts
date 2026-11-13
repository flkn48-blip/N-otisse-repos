import {defineField, defineType} from 'sanity'
import {IconeAvis} from './icones'
import {PROFILS_AVIS, SUJETS_AVIS} from './listes'

// Un avis du livre d'or.
// - Un avis envoyé depuis le site arrive EN BROUILLON : il est privé (visible seulement dans le Studio).
// - Pour l'afficher sur le site : bouton « Publier ».
// - Pour le refuser : cocher « Avis refusé ». Il reste en brouillon, donc privé, et on en garde la trace.
//   Tant que la case est cochée, il ne peut pas être publié.
export const avis = defineType({
  name: 'avis',
  title: 'Avis',
  type: 'document',
  icon: IconeAvis,
  fields: [
    defineField({
      name: 'refuse',
      title: 'Avis refusé',
      description:
        'Cochez pour refuser cet avis : il reste privé (jamais affiché sur le site) et on en garde la trace. Pour l’accepter, laissez décoché et cliquez sur « Publier ».',
      type: 'boolean',
      initialValue: false,
      validation: (r) =>
        r.custom((refuse) =>
          refuse === true
            ? {message: 'Avis refusé : il ne peut pas être publié. Décochez « Avis refusé » pour pouvoir le publier.', level: 'error'}
            : true,
        ),
    }),
    defineField({
      name: 'prenom',
      title: 'Prénom',
      description: 'Avec l’initiale du nom. Exemple : Camille D.',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'note',
      title: 'Note sur 5',
      type: 'number',
      options: {list: [5, 4, 3, 2, 1]},
      validation: (r) => r.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 5,
      validation: (r) => r.required().max(800),
    }),
    defineField({
      name: 'profil',
      title: 'Profil',
      type: 'string',
      options: {list: PROFILS_AVIS},
    }),
    defineField({
      name: 'sujet',
      title: 'Atelier ou événement concerné',
      type: 'string',
      options: {list: SUJETS_AVIS},
    }),
    defineField({
      name: 'envoyeLe',
      title: 'Envoyé le',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [{title: 'Les plus récents d’abord', name: 'recent', by: [{field: 'envoyeLe', direction: 'desc'}]}],
  preview: {
    select: {prenom: 'prenom', note: 'note', refuse: 'refuse', message: 'message'},
    prepare({prenom, note, refuse, message}) {
      return {
        title: `${prenom || 'Sans prénom'} · ${'★'.repeat(note || 0)}`,
        subtitle: `${refuse ? 'Refusé — ' : ''}${(message || '').slice(0, 70)}`,
      }
    },
  },
})
