'use strict'

/**
 * Config values used for cookie authentication
 * @module AuthenticationConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  password: process.env.COOKIE_SECRET
}

module.exports = config
