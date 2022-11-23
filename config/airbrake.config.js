'use strict'

/**
 * Config values used to connect to our Airbrake compatible error tracker (Errbit)
 * @module AirbrakeConfig
 */

const config = {
  host: process.env.AIRBRAKE_HOST,
  projectKey: process.env.AIRBRAKE_KEY,
  projectId: 1,
  environment: process.env.ENVIRONMENT
}

module.exports = config
