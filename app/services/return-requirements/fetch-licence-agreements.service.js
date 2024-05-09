'use strict'

/**
 * Fetches licence agreements needed to create a return requirement from abstraction data
 * @module FetchLicenceAgreementsService
 */

const LicenceAgreementModel = require('../../models/licence-agreement.model.js')

/**
 * Fetches licence agreements needed to create a return requirement from abstraction data
 *
 * @param {string} licenceRef - The reference of the licence to fetch agreements for
 *
 * @returns {Promise<Object>} The licence agreements for the matching licenceRef
 */
async function go (licenceRef) {
  return _fetch(licenceRef)
}

async function _fetch (licenceRef) {
  return LicenceAgreementModel.query()
    .where('licenceRef', licenceRef)
    .whereNull('endDate')
    .orWhere('endDate', '>=', new Date())
    .withGraphFetched('financialAgreements')
    .modifyGraph('financialAgreements', (builder) => {
      builder.select([
        'id'
      ])
        .where('financialAgreementCode', 'S127')
    })
}

module.exports = {
  go
}
