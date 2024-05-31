'use strict'

/**
 * Fetches existing return requirements needed for `/return-requirements/{sessionId}/setup` page
 * @module FetchReturnRequirementsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches existing return requirements needed for `/return-requirements/{sessionId}/setup` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} The existing return requirements for the matching licenceId
 */
async function go (licenceId) {
  const data = await _fetchReturnRequirements(licenceId)

  return data
}

async function _fetchReturnRequirements (licenceId) {
  const result = await ReturnVersionModel.query()
    .where('licenceId', licenceId)
    .withGraphFetched('returnRequirementPoints')
    .modifyGraph('returnRequirementPoints', (builder) => {
      builder.select([
        'id'
      ])
    })

  return result
}

module.exports = {
  go
}
