'use strict'

/**
 * Fetches the years that have licences flagged for supplementary billing for the given region
 * @module FetchLicenceSupplementaryYearsService
 */

const LicenceSupplementaryYearModel = require('../../../models/licence-supplementary-year.model.js')

/**
 * Fetches the years that have licences flagged for supplementary billing for the given region
 *
 * @param {string} regionId - The UUID for the region
 * @param {boolean} twoPartTariff - Whether the supplementary billing is for two-part tariff
 *
 * @returns {Promise<object[]>} An array of distinct years flagged for supplementary billing in descending order
 */
async function go (regionId, twoPartTariff) {
  return LicenceSupplementaryYearModel.query()
    .distinct('financialYearEnd')
    .innerJoinRelated('licence')
    .where('twoPartTariff', twoPartTariff)
    .where('regionId', regionId)
    .orderBy('financialYearEnd', 'desc')
}

module.exports = {
  go
}
