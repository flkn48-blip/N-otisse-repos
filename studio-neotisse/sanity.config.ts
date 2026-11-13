import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {frFRLocale} from '@sanity/locale-fr-fr'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

// Studio Néotisse : l'espace où les fondatrices gèrent les avis, les événements,
// les actualités et les partenaires affichés sur le site.
export default defineConfig({
  name: 'default',
  title: 'Néotisse',

  projectId: 'uffj7vsg',
  dataset: 'production',

  plugins: [structureTool({structure, title: 'Contenus'}), frFRLocale()],

  schema: {
    types: schemaTypes,
  },
})
