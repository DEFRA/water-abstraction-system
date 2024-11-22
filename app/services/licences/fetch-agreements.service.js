'use strict'

/**
 * Fetches licence agreements data needed for the view '/licences/{id}/set-up` page
 * @module FetchAgreementsService
 */

const LicenceAgreementModel = require('../../models/licence-agreement.model.js')

/**
 * Fetches licence agreements data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceRef - The licence ref for the licence to fetch licence agreements for
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's set up tab
 */
async function go(licenceRef) {
  return _fetch(licenceRef)
}

async function _fetch(licenceRef) {
  return LicenceAgreementModel.query()
    .where('licenceRef', licenceRef)
    .whereNull('deletedAt')
    .select(['id', 'startDate', 'endDate', 'signedOn'])
    .withGraphFetched('financialAgreement')
    .modifyGraph('financialAgreement', (builder) => {
      builder.select(['id', 'code'])
    })
    .orderBy([{ column: 'createdAt', order: 'asc' }])
}

module.exports = {
  go
}
