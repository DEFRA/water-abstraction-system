/**
 * Config values used to enable feature flags
 * @module FeatureFlagsConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  setOldReturnsDueDate: String(process.env.ENABLE_SET_OLD_RETURNS_DUE_DATE) === 'true' || false
}
