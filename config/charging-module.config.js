'use strict'

/**
 * Config values used to connect to the Charging Module - An Environment Agency built wrapper API for its Rules service
 * @module ChargingModuleConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  url: process.env.CHARGING_MODULE_URL,
  // These values are used as part of requesting a JSON web token from the Charging Modules's AWS Cognito service.
  // This token is then used to authenticate with the Charging Module itself.
  token: {
    url: process.env.CHARGING_MODULE_TOKEN_URL,
    username: process.env.CHARGING_MODULE_TOKEN_USERNAME,
    password: process.env.CHARGING_MODULE_TOKEN_PASSWORD
  }
}

module.exports = config
