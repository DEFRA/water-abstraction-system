'use strict'

/**
 * Fetches point data needed for creating the return logs
 * @module FetchReturnRequirementPointsService
 */

const ReturnRequirementPointModel = require('../../models/return-requirement-point.model.js')

/**
 * Fetch the matching points for the given return requirement id
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
  return ReturnRequirementPointModel.query()
    .where('returnRequirementId', id)
    .select([
      'description',
      'ngr1',
      'ngr2',
      'ngr3',
      'ngr4'
    ])
}

module.exports = {
  go
}
