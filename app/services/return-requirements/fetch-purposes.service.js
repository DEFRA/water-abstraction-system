'use strict'

/**
 * Fetches a licence's purposes needed for `/return-requirements/{sessionId}/purpose` page
 * @module FetchPurposesService
 */

const PurposeModel = require('../../models/purpose.model.js')

/**
 * Fetches a licence's purposes needed for `/return-requirements/{sessionId}/purpose` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} The purposes for the matching licenceId
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return PurposeModel.query()
    .distinct('description')
    .innerJoin('licenceVersionPurposes', 'purposes.id', 'licenceVersionPurposes.purposeId')
    .innerJoin('licenceVersions', 'licenceVersionPurposes.licenceVersionId', 'licenceVersions.id')
    .where('licenceVersions.licenceId', licenceId)
    .where('licenceVersions.status', 'current')
}

module.exports = {
  go
}
