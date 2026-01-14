'use strict'

/**
 * Config values used by app/services/bill-runs/ engines
 * @module BillingConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  annual: {
    batchSize: Number.parseInt(process.env.BILLING_ANNUAL_BATCH_SIZE) || 5
  },
  waitForStatusPauseInMs: Number.parseInt(process.env.BILLING_WAIT_FOR_STATUS_PAUSE_IN_MS) || 1000
}

module.exports = config
