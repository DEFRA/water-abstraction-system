'use strict'

/**
 * Persists the supplementary billing flags for a licence
 * @module PersistSupplementaryBillingFlagsService
 */

const CreateLicenceSupplementaryYearService = require('./create-licence-supplementary-year.service.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Persists the supplementary billing flags for a licence
 *
 * Updates the licences includeInPresrocBilling and includeInSrocBilling flags.
 * Adds financial years related to two-part tariff billing into the LicenceSupplementaryYears table.
 *
 * NOTE: Due to the column data type of the includeInPresrocBilling & includeInSrocBilling, one is a string value and
 * one is a boolean.
 *
 * @param {object[]} twoPartTariffFinancialYears - The years that need persisting in the LicenceSupplementaryYears table
 * @param {string} preSrocFlag - "yes" or "no" depending on if the licence needs to be flagged for pre sroc billing
 * @param {boolean} srocFlag - `true` or `false` depending on if the licence needs to be flagged for sroc billing
 * @param {string} wrlsLicenceId - The UUID of the licence that needs the flags persisting for
 */
async function go (twoPartTariffFinancialYears, preSrocFlag, srocFlag, wrlsLicenceId) {
  await _updateLicenceFlags(preSrocFlag, srocFlag, wrlsLicenceId)
  await _flagForLicenceSupplementaryYears(twoPartTariffFinancialYears, wrlsLicenceId)
}

/**
 * Persists two-part tariff financial years in the LicenceSupplementaryYears table.
 * @private
 */
async function _flagForLicenceSupplementaryYears (financialYears, wrlsLicenceId) {
  if (financialYears.length > 0) {
    const twoPartTariff = true

    await CreateLicenceSupplementaryYearService.go(wrlsLicenceId, financialYears, twoPartTariff)
  }
}

async function _updateLicenceFlags (preSrocFlag, srocFlag, wrlsLicenceId) {
  return LicenceModel.query()
    .patch({ includeInPresrocBilling: preSrocFlag, includeInSrocBilling: srocFlag })
    .where('id', wrlsLicenceId)
}

module.exports = {
  go
}
