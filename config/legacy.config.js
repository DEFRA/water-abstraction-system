/**
 * Config values used to connect to our other legacy services
 * @module LegacyConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

const config = {
  legacyAuthToken: process.env.LEGACY_AUTH_TOKEN,
  serviceForeground: {
    url: process.env.SERVICE_FOREGROUND_URL
  },
  serviceBackground: {
    url: process.env.SERVICE_BACKGROUND_URL
  },
  import: {
    url: process.env.IMPORT_URL
  },
  tacticalCrm: {
    url: process.env.TACTICAL_CRM_URL
  },
  externalUi: {
    url: process.env.EXTERNAL_UI_URL
  },
  internalUi: {
    url: process.env.INTERNAL_UI_URL
  },
  tacticalIdm: {
    url: process.env.TACTICAL_IDM_URL
  },
  permitRepository: {
    url: process.env.PERMIT_REPOSITORY_URL
  },
  returns: {
    url: process.env.RETURNS_URL
  }
}

export default config
