'use strict'

/**
 * Config values used for licence features
 * @module LicencesConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  endDates: {
    batchSize: parseInt(process.env.LICENCE_END_DATES_BATCH_SIZE) || 10
  },
  returnVersionBatchUser: process.env.RETURN_VERSION_BATCH_USER
}

module.exports = config
