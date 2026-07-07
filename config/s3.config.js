/**
 * Config values used for the amazon s3 bucket
 * @module S3Config
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

const config = {
  s3: {
    bucket: process.env.AWS_MAINTENANCE_BUCKET
  }
}

export default config
