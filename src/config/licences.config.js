/**
 * Config values used for licence features
 * @module LicencesConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  endDates: {
    batchSize: Number.parseInt(process.env.LICENCE_END_DATES_BATCH_SIZE) || 10
  },
  returnVersionBatchUser: process.env.RETURN_VERSION_BATCH_USER
}
