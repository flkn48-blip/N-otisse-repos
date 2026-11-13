import {defineField, defineType} from 'sanity'
import {IconeActualite} from './icones'

// Une actualité de la section « Actualités » du site.
export const actualite = defineType({
  name: 'actualite',
  title: 'Actualité',
  type: 'document',
  icon: IconeActualite,
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      validation: (r) => r.required().error('Merci d’indiquer un titre.'),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description: 'Les actualités les plus récentes s’affichent en premier.',
      type: 'date',
      options: {dateFormat: 'DD/MM/YYYY'},
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'resume',
      title: 'Résumé',
      description: 'Une ou deux phrases, visibles sans cliquer.',
      type: 'text',
      rows: 2,
      validation: (r) => r.required().error('Merci d’écrire un résumé.'),
    }),
    defineField({
      name: 'texte',
      title: 'Texte complet',
      description:
        'Affiché quand on ouvre l’actualité. Laissez une ligne vide entre deux paragraphes.',
      type: 'text',
      rows: 10,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Facultatif.',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Description de l’image',
          description: 'Pour Google et les personnes malvoyantes. Exemple : « Démonstration de tissage aux tablettes ».',
          type: 'string',
        }),
      ],
    }),
  ],
  orderings: [{title: 'Date (la plus récente d’abord)', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'titre', date: 'date', media: 'image'},
    prepare({title, date, media}) {
      return {title, subtitle: date ? date.split('-').reverse().join('/') : '', media}
    },
  },
})
