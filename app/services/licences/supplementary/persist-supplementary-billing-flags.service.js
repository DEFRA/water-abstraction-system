'use strict'

/**
 * Persists the supplementary billing flags for a licence
 * @module PersistSupplementaryBillingFlagsService
 */

const CreateLicenceSupplementaryYearService = require('./create-licence-supplementary-year.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Persists the supplementary billing flags for a licence
 *
 * Updates the licences includeInPresrocBilling and includeInSrocBilling flags.
 * Adds financial years related to two-part tariff billing into the LicenceSupplementaryYears table.
 *
 * NOTE: Due to the column data type of the includeInPresrocBilling & includeInSrocBilling, one is a string value and
 * one is a boolean.
 *
 * @param {object[]} twoPartTariffBillingYears - The years that need persisting in the LicenceSupplementaryYears table
 * @param {boolean} flagForPreSrocSupplementary - `true` or `false` depending on if the licence needs to be flagged
 * for pre sroc billing
 * @param {boolean} flagForSrocSupplementary - `true` or `false` depending on if the licence needs to be flagged for
 * sroc billing
 * @param {string} licenceId - The UUID of the licence that needs the flags persisting for
 */
async function go(twoPartTariffBillingYears, flagForPreSrocSupplementary, flagForSrocSupplementary, licenceId) {
  const includeInPresrocBilling = flagForPreSrocSupplementary ? 'yes' : 'no'

  await _updateLicenceFlags(includeInPresrocBilling, flagForSrocSupplementary, licenceId)

  await _flagForLicenceSupplementaryYears(twoPartTariffBillingYears, licenceId)
}

/**
 * Persists two-part tariff financial years in the LicenceSupplementaryYears table.
 * @private
 */
async function _flagForLicenceSupplementaryYears(twoPartTariffBillingYears, licenceId) {
  if (twoPartTariffBillingYears.length === 0) {
    return
  }

  const twoPartTariff = true

  await CreateLicenceSupplementaryYearService.go(licenceId, twoPartTariffBillingYears, twoPartTariff)
}

async function _updateLicenceFlags(includeInPresrocBilling, flagForSrocSupplementary, licenceId) {
  return LicenceModel.query()
    .patch({
      includeInPresrocBilling,
      includeInSrocBilling: flagForSrocSupplementary,
      updatedAt: timestampForPostgres()
    })
    .where('id', licenceId)
}

module.exports = {
  go
}
