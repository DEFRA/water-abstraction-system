'use strict'

/**
 * Config values used to connect to our other services
 * @module ServicesConfig
 */

const config = {
  addressFacade: {
    url: process.env.EA_ADDRESS_FACADE_URL
  },
  chargingModule: {
    url: process.env.CHARGING_MODULE_URL
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
