'use strict'

/**
 * Config values used to enable feature flags
 * @module FeatureFlagsConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  enableReissuingBillingBatches: (String(process.env.ENABLE_REISSUING_BILLING_BATCHES) === 'true') || false
}

module.exports = config
