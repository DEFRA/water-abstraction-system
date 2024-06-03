'use strict'

/**
 * Fetches a licence's purposes needed for `/return-requirements/{sessionId}/check` page
 * @module FetchPurposeByIdsService
 */

const PurposeModel = require('../../../models/purpose.model.js')

/**
 * Fetches a licence's purposes needed for `/return-requirements/{sessionId}/purpose` page
 *
 * @param {[string]} purposeIds - An array of ids to fetch
 *
 * @returns {Promise<Object>} The purposes matching the array of id's
 */
async function go (purposeIds) {
  return _fetch(purposeIds)
}

async function _fetch (purposeIds) {
  return PurposeModel.query()
    .select([
      'purposes.id',
      'purposes.description'
    ])
    .findByIds(purposeIds)
}

module.exports = {
  go
}
