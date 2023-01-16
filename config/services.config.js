'use strict'

/**
 * Config values used to connect to our other services
 * @module ServicesConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  addressFacade: {
    url: process.env.EA_ADDRESS_FACADE_URL
  },
  chargingModule: {
    url: process.env.CHARGING_MODULE_URL,
    token: {
      url: process.env.CHARGING_MODULE_TOKEN_URL,
      username: process.env.CHARGING_MODULE_TOKEN_USERNAME,
      password: process.env.CHARGING_MODULE_TOKEN_PASSWORD
    }
  },
  serviceForeground: {
    url: process.env.SERVICE_FOREGROUND_URL
  },
  serviceBackground: {
    url: process.env.SERVICE_BACKGROUND_URL
  },
  reporting: {
    url: process.env.REPORTING_URL
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

module.exports = config
