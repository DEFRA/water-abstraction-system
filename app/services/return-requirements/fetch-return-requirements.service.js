'use strict'

/**
 * Fetches existing return requirements needed for `/return-requirements/{sessionId}/check` page
 * @module FetchReturnRequirementsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches existing return requirements needed for `/return-requirements/{sessionId}/check` page
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
  console.log(licenceId)
  const result = await ReturnVersionModel.query()
    .where('licenceId', licenceId)
    .withGraphFetched('returnRequirementPoints')
    .modifyGraph('returnRequirementPoints', (builder) => {
      builder.select([
        '*'
      ])
    })

  return result
}

module.exports = {
  go
}
