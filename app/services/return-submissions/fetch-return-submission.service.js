'use strict'

/**
 * Fetches the matching return submission needed for the view
 * @module FetchReturnSubmissionService
 */

const ReturnSubmissionModel = require('../../models/return-submission.model.js')

/**
 * Fetches the matching return submission
 *
 * @param {string} returnSubmissionId - The return submission ID
 * @param {number} [version=0] - Optional version number of the submission to display. Defaults to 0 which means
 * 'current'
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and associated submission (if any)
 * and licence data
 */
async function go(returnSubmissionId) {
  const returnSubmission = await _fetch(returnSubmissionId)

  returnSubmission.$applyReadings()

  return returnSubmission
}

async function _fetch(returnSubmissionId) {
  const query = ReturnSubmissionModel.query()
    .findById(returnSubmissionId)
    .select(['metadata'])
    .withGraphFetched('returnSubmissionLines')
    .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
      returnSubmissionLinesBuilder
        .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
        .orderBy('startDate', 'asc')
    })
    .withGraphFetched('returnLog')
    .modifyGraph('returnLog', (returnLogBuilder) => {
      returnLogBuilder.select(['returnReference'])
    })

  return query
}

module.exports = {
  go
}
