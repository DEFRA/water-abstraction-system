'use strict'

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 * @module FetchDownloadReturnLogService
 */

const ReturnLogModel = require('../../models/return-log.model.js')
const ReturnSubmissionModel = require('../../models/return-submission.model.js')

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 *
 * @param {string} returnLogId - The UUID of the return log to fetch for download
 * @param {number} version - The version number of the submission data to use
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and associated submission (if any)
 */
async function go(returnLogId, version) {
  const returnSubmissions = await _fetchReturnSubmissions(returnLogId)

  const selectedReturnSubmission = _selectReturnSubmission(returnSubmissions, version)

  const returnLog = await _fetch(returnLogId, selectedReturnSubmission)

  if (selectedReturnSubmission) {
    returnLog.returnSubmissions[0].$applyReadings()
  }

  return returnLog
}

async function _fetch(returnLogId, selectedReturnSubmission) {
  const query = ReturnLogModel.query().findById(returnLogId).select(['id', 'returnReference', 'startDate', 'endDate'])

  if (selectedReturnSubmission) {
    query.withGraphFetched('returnSubmissions').modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .findById(selectedReturnSubmission.id)
        .select(['id', 'metadata', 'version'])
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder.select(['id', 'startDate', 'quantity']).orderBy('startDate', 'asc')
        })
    })
  }

  return query
}

async function _fetchReturnSubmissions(returnLogId) {
  return ReturnSubmissionModel.query()
    .select(['createdAt', 'id', 'version', 'userId'])
    .where('returnLogId', returnLogId)
    .orderBy('version', 'desc')
}

function _selectReturnSubmission(returnSubmissions, version) {
  if (returnSubmissions.length === 0) {
    return null
  }

  // If version is 0, we want the latest i.e. the 'current' version
  if (version === 0) {
    return returnSubmissions[0]
  }

  const selectedReturnSubmission = returnSubmissions.find((returnSubmission) => {
    return returnSubmission.version === version
  })

  return selectedReturnSubmission
}

module.exports = {
  go
}
