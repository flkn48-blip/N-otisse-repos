import {defineField, defineType} from 'sanity'
import {IconeEvenement} from './icones'
import {TYPES_EVENEMENT} from './listes'

// Un événement du calendrier du site.
export const evenement = defineType({
  name: 'evenement',
  title: 'Événement',
  type: 'document',
  icon: IconeEvenement,
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      validation: (r) => r.required().error('Merci d’indiquer un titre.'),
    }),
    defineField({
      name: 'type',
      title: 'Type d’événement',
      description: 'Donne la couleur de la case dans le calendrier.',
      type: 'string',
      options: {list: TYPES_EVENEMENT, layout: 'radio'},
      initialValue: 'ateliers',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'debut',
      title: 'Date de début',
      type: 'date',
      options: {dateFormat: 'DD/MM/YYYY'},
      validation: (r) => r.required().error('Merci d’indiquer la date de début.'),
    }),
    defineField({
      name: 'fin',
      title: 'Date de fin',
      description: 'Laisser vide si l’événement dure un seul jour.',
      type: 'date',
      options: {dateFormat: 'DD/MM/YYYY'},
      validation: (r) =>
        r.custom((fin, ctx) => {
          const debut = (ctx.document as {debut?: string} | undefined)?.debut
          return !fin || !debut || fin >= debut
            ? true
            : 'La date de fin ne peut pas être avant la date de début.'
        }),
    }),
    defineField({
      name: 'horaires',
      title: 'Horaires',
      description: 'Facultatif. Exemple : 14 h – 17 h',
      type: 'string',
    }),
    defineField({name: 'lieu', title: 'Lieu', description: 'Facultatif.', type: 'string'}),
    defineField({
      name: 'organisateur',
      title: 'Structure organisatrice',
      description: 'Exemple : le nom du musée. Il apparaît sur le bouton « Réserver sur le site de… ».',
      type: 'string',
    }),
    defineField({
      name: 'lienReservation',
      title: 'Lien de réservation',
      description:
        'Facultatif. Page de la structure où l’on réserve (aucune réservation ne passe par le site Néotisse).',
      type: 'url',
      validation: (r) => r.uri({scheme: ['https', 'http']}),
    }),
    defineField({
      name: 'description',
      title: 'Description courte',
      description: 'Facultatif. Une ou deux phrases.',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {title: 'Date (la plus proche d’abord)', name: 'dateAsc', by: [{field: 'debut', direction: 'asc'}]},
    {title: 'Date (la plus lointaine d’abord)', name: 'dateDesc', by: [{field: 'debut', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'titre', debut: 'debut', fin: 'fin', lieu: 'lieu'},
    prepare({title, debut, fin, lieu}) {
      const fr = (d?: string) => (d ? d.split('-').reverse().join('/') : '')
      const dates = fin && fin !== debut ? `du ${fr(debut)} au ${fr(fin)}` : fr(debut)
      return {title, subtitle: [dates, lieu].filter(Boolean).join(' · ')}
    },
  },
})
