/**
 * Config values used by our logger
 * @module LogConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

const config = {
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  logAssetRequests: String(process.env.LOG_ASSET_REQUESTS) === 'true' || false,
  logInTest: String(process.env.LOG_IN_TEST) === 'true' || false
}

export default config
