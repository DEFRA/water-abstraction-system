/**
 * Config values used to connect to our Airbrake compatible error tracker (Errbit)
 * @module AirbrakeConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

const config = {
  host: process.env.AIRBRAKE_HOST,
  projectKey: process.env.AIRBRAKE_KEY,
  projectId: 1,
  environment: process.env.ENVIRONMENT
}

export default config
