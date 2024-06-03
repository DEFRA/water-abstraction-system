'use strict'

/**
 * Fetches licence agreements data needed for the view '/licences/{id}/set-up` page
 * @module FetchAgreementsService
 */

const LicenceAgreementModel = require('../../models/licence-agreement.model.js')

/**
 * Fetches charge version data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceRef - The licence ref for the licence to fetch licence agreements for
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's set up tab
 */
async function go (licenceRef) {
  return _fetch(licenceRef)
}

async function _fetch (licenceRef) {
  return LicenceAgreementModel.query()
    .where('licenceRef', licenceRef)
    .select([
      'id',
      'startDate',
      'endDate',
      'dateSigned'
    ])
    .withGraphFetched('financialAgreements')
    .modifyGraph('financialAgreements', (builder) => {
      builder.select([
        'financialAgreementCode'
      ])
    })
    .orderBy([
      { column: 'createdAt', order: 'asc' }
    ])
}

module.exports = {
  go
}
