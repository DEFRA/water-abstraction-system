'use strict'

/**
 * Determines if a licence should be flagged for supplementary billing
 * @module FlagForSupplementaryBillingService
 */

const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')

/**
 * I am a comment
 * @param {*} wrlsLicenceId
 * @param {*} transformedLicence
 * @returns
 */
async function go (transformedLicence, wrlsLicenceId) {
  const chargeVersions = FetchChargeVersionsService.go(transformedLicence, wrlsLicenceId)

  // await _flagForPreSrocSupplementary()
  // await _flagForSrocSupplementary()
  // await _flagForTwoPartTariffSupplementary()
}

async function _flagForPreSrocSupplementary () {

}

module.exports = {
  go
}
