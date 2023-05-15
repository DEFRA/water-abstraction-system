'use strict'

/**
 * Config values used for the amazon s3 bucket
 * @module S3Config
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  s3: {
    bucket: process.env.AWS_MAINTENANCE_BUCKET
  }
}

module.exports = config
