'use strict'

/**
 * Fetch all licences linked to the given company via their licence version holders
 * @module FetchCompanyLicencesDal
 */

const LicenceModel = require('../../models/licence.model.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Fetch all licences linked to the given company via their licence version holders
 *
 * @param {string} companyId - The UUID of the company to fetch licences for
 *
 * @returns {Promise<object[]>} An array of licence objects with `id` and `licenceRef`, sorted by `licenceRef`
 */
async function go(companyId) {
  const licences = await _fetch(companyId)

  return _data(licences)
}

async function _fetch(companyId) {
  return LicenceModel.query()
    .select(['id', 'licenceRef'])
    .where((expiredDateBuilder) => {
      expiredDateBuilder.whereNull('expiredDate').orWhere('expiredDate', '>=', timestampForPostgres())
    })
    .where((lapsedDateBuilder) => {
      lapsedDateBuilder.whereNull('lapsedDate').orWhere('lapsedDate', '>=', timestampForPostgres())
    })
    .where((revokedDateBuilder) => {
      revokedDateBuilder.whereNull('revokedDate').orWhere('revokedDate', '>=', timestampForPostgres())
    })
    .whereExists(LicenceModel.relatedQuery('licenceVersions').where('companyId', companyId))
    .modify('currentVersion')
    .orderBy([{ column: 'licenceRef', order: 'asc' }])
}

/**
 * We only need to return the licence ID and licence reference.
 *
 * @private
 */
function _data(licences) {
  return licences.map((licence) => {
    return {
      id: licence.id,
      licenceRef: licence.licenceRef
    }
  })
}

module.exports = {
  go
}
