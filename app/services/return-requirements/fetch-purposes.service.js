'use strict'

/**
 * Fetches purpose descriptions needed for `/return-requirements/{sessionId}/purpose` page
 * @module FetchPurposesService
 */

const PurposeModel = require('../../models/purpose.model.js')

/**
 * Fetches purpose descriptions needed for `/return-requirements/{sessionId}/purpose` page
 *
 * @param {string} licenceId The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} The purpose descriptions for the matching licenceId
 */
async function go (licenceId) {
  const data = await _fetchPurpose(licenceId)

  return data
}

async function _fetchPurpose (licenceId) {
  const results = await PurposeModel.query()
    .distinct('description')
    .innerJoin('licenceVersionPurposes', 'purposes.id', 'licenceVersionPurposes.purposeId')
    .innerJoin('licenceVersions', 'licenceVersionPurposes.licenceVersionId', 'licenceVersions.id')
    .where('licenceVersions.licenceId', licenceId)
    .where('licenceVersions.status', 'current')

  return results.map((purpose) => {
    return purpose.description
  })
}

module.exports = {
  go
}
