'use strict'

/**
 * Fetches purposes data needed for creating the return logs
 * @module FetchReturnRequirementPurposesService
 */

const ReturnRequirementPurposeModel = require('../../models/return-requirement-purpose.model.js')

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
      name: point.description,
      ngr1: point.ngr1,
      ngr2: point.ngr2,
      ngr3: point.ngr3,
      ngr4: point.ngr4
    }
  })
}

async function _fetch (id) {
  return ReturnRequirementPurposeModel.query()
    .where('returnRequirementId', id)
}

module.exports = {
  go
}
