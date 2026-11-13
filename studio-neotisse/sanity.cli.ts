import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'uffj7vsg',
    dataset: 'production'
  },
  // adresse du Studio en ligne : https://neotisse.sanity.studio
  studioHost: 'neotisse',
  deployment: {
    // identifiant du Studio en ligne (évite une question à chaque « npm run deploy »)
    appId: 'aoku72o7hx4i0wcdczgqtnxr',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
