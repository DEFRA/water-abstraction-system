'use strict'

/**
 * Config values used to connect to our Airbrake compatible error tracker (Errbit)
 * @module AirbrakeConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  host: process.env.AIRBRAKE_HOST,
  projectKey: process.env.AIRBRAKE_KEY,
  projectId: 1,
  environment: process.env.ENVIRONMENT
}

module.exports = config
