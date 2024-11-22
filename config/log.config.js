'use strict'

/**
 * Config values used by our logger
 * @module LogConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  logAssetRequests: String(process.env.LOG_ASSET_REQUESTS) === 'true' || false,
  logInTest: String(process.env.LOG_IN_TEST) === 'true' || false
}

module.exports = config
