'use strict'

/**
 * Fetches licence agreements needed for `/return-requirements/{sessionId}/check-your-answers` page
 * @module FetchLicenceAgreementsService
 */

const LicenceAgreementModel = require('../../models/licence-agreement.model.js')

/**
 * Fetches licence agreements needed for `/return-requirements/{sessionId}/check-your-answers` page
 *
 * @param {string} licenceRef - The reference of the licence to fetch agreements for
 *
 * @returns {Promise<Object>} The licence agreements for the matching licenceRef
 */
async function go (licenceRef) {
  const data = await _fetchLicenceAgreements(licenceRef)

  return data
}

async function _fetchLicenceAgreements (licenceRef) {
  const result = await LicenceAgreementModel.query()
    .where('licenceRef', licenceRef)
    .where(function () {
      this.whereNull('endDate').orWhere('endDate', '>=', new Date())
    })
    .withGraphFetched('financialAgreements')
    .modifyGraph('financialAgreements', (builder) => {
      builder.select([
        'id'
      ])
        .where('financialAgreementCode', 'S127')
    })

  return result
}

module.exports = {
  go
}
