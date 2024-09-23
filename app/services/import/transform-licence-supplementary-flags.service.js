'use strict'

/**
 * Transforms NALD licence data to determine eligibility for supplementary billing.
 * @module TransformLicenceSupplementaryFlagsService
 */

const FetchLicenceChargeVersionsService = require('./fetch-licence-charge-versions.service.js')
const FlagForSupplementaryBillingService = require('./flag-for-supplementary-billing.service.js')

/**
 * Transforms NALD licence data to determine eligibility for supplementary billing.
 *
 * When importing a licence from NALD with an end date, this service checks if the licence should be included in
 * supplementary billing.
 * It orchestrates these checks and applies the necessary flags when required.
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 * @param {string} wrlsLicenceId - The WRLS licence ID
 */
async function go (transformedLicence, wrlsLicenceId) {
  const wrlsLicence = await FetchLicenceChargeVersionsService.go(wrlsLicenceId)

  await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)
}

module.exports = {
  go
}
