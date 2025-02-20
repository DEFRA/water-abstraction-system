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
 *
 * @returns {Promise<module:ReturnSubmissionModel>} the matching `ReturnSubmissionModel` instance and its associated
 * data (return lines and the return reference from its return log)
 */
async function go(returnSubmissionId) {
  const returnSubmission = await _fetch(returnSubmissionId)

  returnSubmission.$applyReadings()

  return returnSubmission
}

async function _fetch(returnSubmissionId) {
  return ReturnSubmissionModel.query()
    .findById(returnSubmissionId)
    .select(['id', 'metadata', 'returnLogId'])
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
}

module.exports = {
  go
}
