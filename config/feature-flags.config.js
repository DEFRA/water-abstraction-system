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
  enableMonitoringStationsView: (String(process.env.ENABLE_MONITORING_STATIONS_VIEW) === 'true') || false,
  enableReissuingBillingBatches: (String(process.env.ENABLE_REISSUING_BILLING_BATCHES) === 'true') || false,
  enableRequirementsForReturns: (String(process.env.ENABLE_REQUIREMENTS_FOR_RETURNS) === 'true') || false,
  enableSystemLicenceView: (String(process.env.ENABLE_SYSTEM_LICENCE_VIEW) === 'true') || false,
  enableSystemImportLegacyLicence: (String(process.env.ENABLE_IMPORT_LEGACY_LICENCE) === 'true') || false,
  enableTwoPartTariffSupplementary: (String(process.env.ENABLE_TWO_PART_TARIFF_SUPPLEMENTARY) === 'true') || false
}

module.exports = config
