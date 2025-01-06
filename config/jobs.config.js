'use strict'

/**
 * Config values used for jobs
 * @module JobsConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  licenceChanges: {
    batchSize: parseInt(process.env.JOBS_LICENCE_CHANGES_BATCH_SIZE) || 10
  }
}

module.exports = config
