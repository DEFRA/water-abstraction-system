'use strict'

/**
 * Fetch all licences linked to the given company via their licence version holders
 * @module FetchCompanyLicencesDal
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch all licences linked to the given company via their licence version holders
 *
 * @param {string} companyId - The UUID of the company to fetch licences for
 *
 * @returns {Promise<object[]>} An array of licence objects with `id` and `licenceRef`, sorted by `licenceRef`
 */
async function go(companyId) {
  return LicenceModel.query()
    .select(['licences.id', 'licences.licenceRef'])
    .whereNull('licences.expiredDate')
    .whereNull('licences.lapsedDate')
    .whereNull('licences.revokedDate')
    .whereExists(
      LicenceModel.relatedQuery('licenceVersions')
        .innerJoinRelated('licenceVersionHolder')
        .where('licenceVersionHolder.companyId', companyId)
    )
    .orderBy([{ column: 'licenceRef', order: 'asc' }])
}

module.exports = {
  go
}
