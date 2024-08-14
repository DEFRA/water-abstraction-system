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
 * @param {Object[]} years - An array of the years to be persisted as individual records
 * @param {Boolean} twoPartTariff - If there are any two-part tariff indicators on the licence
 */
async function go (licenceId, years, twoPartTariff) {
  for (const year of years) {
    const existingLicenceSupplementaryYears = await _fetchExistingLicenceSupplementaryYears(
      licenceId, year, twoPartTariff
    )

    // Create a new record only if no existing record matches all the provided properties, and where 'billRunId' is null
    if (existingLicenceSupplementaryYears.length === 0) {
      await _persistSupplementaryBillingYearsData(licenceId, year, twoPartTariff)
    }
  }
}

async function _fetchExistingLicenceSupplementaryYears (licenceId, year, twoPartTariff) {
  return LicenceSupplementaryYearModel.query()
    .select('id')
    .where('licenceId', licenceId)
    .where('financialYearEnd', year)
    .where('twoPartTariff', twoPartTariff)
    .where('billRunId', null)
}

async function _persistSupplementaryBillingYearsData (licenceId, year, twoPartTariff) {
  return LicenceSupplementaryYearModel.query()
    .insert({
      licenceId,
      financialYearEnd: year,
      twoPartTariff
    })
}

module.exports = {
  go
}
