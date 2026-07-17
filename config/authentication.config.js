/**
 * Config values used for cookie authentication
 * @module AuthenticationConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  password: process.env.COOKIE_SECRET
}
