'use strict'

/**
 * Config values used to enable feature flags
 * @module FeatureFlagsConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  enableBillingAccountChangeAddress: String(process.env.ENABLE_BILLING_ACCOUNT_CHANGE_ADDRESS) === 'true' || false,
  enableCustomerManage: String(process.env.ENABLE_CUSTOMER_MANAGE) === 'true' || false,
  enableCustomerView: String(process.env.ENABLE_CUSTOMER_VIEW) === 'true' || false,
  enableLicenceHistoryView: String(process.env.ENABLE_LICENCE_HISTORY_VIEW) === 'true' || false
}

module.exports = config
