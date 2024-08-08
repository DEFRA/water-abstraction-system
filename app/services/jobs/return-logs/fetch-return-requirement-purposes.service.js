'use strict'

/**
 * Fetches purposes data needed for creating the return logs
 * @module FetchReturnRequirementPurposesService
 */

const ReturnRequirementPurposeModel = require('../../../models/return-requirement-purpose.model.js')

/**
 * Fetch the matching purposes for the given return requirement id
 *
 * @param {string} returnRequirementId The UUID of the return requirement to search for
 *
 * @returns {Promise<Object>} the data needed to populate the metadata blob on a return log
 */
async function go (returnRequirementId) {
  const results = await _fetch(returnRequirementId)
  const formattedResults = _data(results)

  return formattedResults
}

function _data (results) {
  return results.map((point) => {
    return {
      alias: point.alias,
      primary: {
        code: point.primaryPurpose.legacyId,
        description: point.primaryPurpose.description
      },
      tertiary: {
        code: point.purpose.legacyId,
        description: point.purpose.description
      },
      secondary: {
        code: point.secondaryPurpose.legacyId,
        description: point.secondaryPurpose.description
      }
    }
  })
}

async function _fetch (id) {
  return ReturnRequirementPurposeModel.query()
    .withGraphFetched('primaryPurpose')
    .withGraphFetched('purpose')
    .withGraphFetched('secondaryPurpose')
    .where('returnRequirementId', id)
}

module.exports = {
  go
}
