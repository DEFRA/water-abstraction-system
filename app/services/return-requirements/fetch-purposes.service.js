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
 * @returns {Promise<object>} The distinct purposes for the matching licence's current version
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return PurposeModel.query()
    .select([
      'purposes.id',
      'purposes.description'
    ])
    .whereExists(
      PurposeModel.relatedQuery('licenceVersionPurposes')
        .innerJoin('licenceVersions', 'licenceVersions.id', 'licenceVersionPurposes.licenceVersionId')
        .where('licenceVersions.licenceId', licenceId)
        .where('licenceVersions.status', 'current')
    )
    .orderBy([
      { column: 'purposes.description', order: 'asc' }
    ])
}

module.exports = {
  go
}
