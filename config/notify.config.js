'use strict'

/**
 * Config values used for GOV.UK Notify
 * @module NotifyConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  apiKey: process.env.GOV_UK_NOTIFY_API_KEY,
  stubNotify: process.env.STUB_NOTIFY || true // Used to perform integration tests with notify
}

module.exports = config
