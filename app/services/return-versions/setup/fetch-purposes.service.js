'use strict'

/**
 * Fetches a licence's purposes needed for `/return-versions/setup/{sessionId}/purpose` page
 * @module FetchPurposesService
 */

const PurposeModel = require('../../../models/purpose.model.js')

/**
 * Fetches a licence's purposes needed for `/return-versions/setup/{sessionId}/purpose` page
 *
 * @param {string} licenceVersionId - The UUID for the relevant licence version to fetch purposes from
 *
 * @returns {Promise<object>} The distinct purposes for the matching licence version
 */
async function go(licenceVersionId) {
  return PurposeModel.query()
    .select(['purposes.id', 'purposes.description'])
    .whereExists(
      PurposeModel.relatedQuery('licenceVersionPurposes')
        .innerJoin('licenceVersions', 'licenceVersions.id', 'licenceVersionPurposes.licenceVersionId')
        .where('licenceVersions.id', licenceVersionId)
    )
    .orderBy([{ column: 'purposes.description', order: 'asc' }])
}

module.exports = {
  go
}
