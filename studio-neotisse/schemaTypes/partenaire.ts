import {defineField, defineType} from 'sanity'
import {IconePartenaire} from './icones'

// Un partenaire du bandeau « Ils nous ont fait confiance ».
export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  icon: IconePartenaire,
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom du partenaire',
      type: 'string',
      validation: (r) => r.required().error('Merci d’indiquer un nom.'),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      description:
        'Ajoutez un logo seulement si le partenaire a donné son accord. Sans logo, c’est le nom qui s’affiche.',
      type: 'image',
    }),
    defineField({
      name: 'site',
      title: 'Site du partenaire',
      description: 'Facultatif. Si rempli, le logo devient cliquable.',
      type: 'url',
      validation: (r) => r.uri({scheme: ['https', 'http']}),
    }),
    defineField({
      name: 'ordre',
      title: 'Ordre d’affichage',
      description: '1 = premier logo du bandeau.',
      type: 'number',
      initialValue: 10,
    }),
  ],
  orderings: [{title: 'Ordre d’affichage', name: 'ordre', by: [{field: 'ordre', direction: 'asc'}]}],
  preview: {
    select: {title: 'nom', subtitle: 'site', media: 'logo'},
  },
})
