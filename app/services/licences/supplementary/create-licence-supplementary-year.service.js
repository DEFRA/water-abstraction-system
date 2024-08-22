'use strict'

/**
 * Creates a licenceSupplementaryYears record based on the provided licence data
 * @module CreateLicenceSupplementaryYearService
 */

const LicenceSupplementaryYearModel = require('../../../models/licence-supplementary-year.model.js')

/**
 * Creates a licenceSupplementaryYears record based on the provided licence data
 *
 * @param {module:LicenceModel} licenceId - The UUID of the licence to be persisted
 * @param {object[]} financialYearEnds - An array of the financial year ends to be persisted as individual records
 * @param {boolean} twoPartTariff - If there are any two-part tariff indicators on the licence
 */
async function go (licenceId, financialYearEnds, twoPartTariff) {
  for (const financialYearEnd of financialYearEnds) {
    const match = await _fetchExistingLicenceSupplementaryYears(licenceId, financialYearEnd, twoPartTariff)

    // Create a new record only if no existing record matches all the provided properties, and where 'billRunId' is null
    if (match) {
      continue
    }

    await _persistSupplementaryBillingYearsData(licenceId, financialYearEnd, twoPartTariff)
  }
}

async function _fetchExistingLicenceSupplementaryYears (licenceId, financialYearEnd, twoPartTariff) {
  return LicenceSupplementaryYearModel.query()
    .select('id')
    .where('licenceId', licenceId)
    .where('financialYearEnd', financialYearEnd)
    .where('twoPartTariff', twoPartTariff)
    .where('billRunId', null)
    .limit(1)
    .first()
}

async function _persistSupplementaryBillingYearsData (licenceId, financialYearEnd, twoPartTariff) {
  return LicenceSupplementaryYearModel.query()
    .insert({
      licenceId,
      financialYearEnd,
      twoPartTariff
    })
}

module.exports = {
  go
}
