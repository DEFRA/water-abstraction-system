'use strict'

/**
 * Fetches the matching return log data needed for the csv
 * @module FetchDownloadReturnService
 */

const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionModel = require('../../models/return-submission.model.js')

async function go(returnLogId, version) {
  const allReturnSubmissions = await _fetchAllReturnSubmissions(returnLogId)

  const selectedReturnSubmission = _returnSubmission(allReturnSubmissions, version)

  const returnLog = await _fetch(returnLogId, selectedReturnSubmission)

  if (selectedReturnSubmission) {
    returnLog.returnSubmissions[0].$applyReadings()
  }

  returnLog.versions = allReturnSubmissions

  return returnLog
}

async function _fetch(returnLogId, selectedReturnSubmission) {
  const query = ReturnLogModel.query().findById(returnLogId)

  if (selectedReturnSubmission) {
    query.withGraphFetched('returnSubmissions').modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .findById(selectedReturnSubmission.id)
        .select(['createdAt', 'id', 'metadata', 'nilReturn', 'userId', 'userType', 'version'])
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder
            .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
            .orderBy('startDate', 'asc')
        })
    })
  }

  return query
}

async function _fetchAllReturnSubmissions(returnId) {
  return ReturnSubmissionModel.query()
    .select(['createdAt', 'id', 'version', 'userId'])
    .where('returnLogId', returnId)
    .orderBy('version', 'desc')
}

function _returnSubmission(allReturnSubmissions, version) {
  // We are dealing with a due or received return log that has no submissions yet
  if (allReturnSubmissions.length === 0) {
    return null
  }

  // If version is 0, it means a previous version has not been selected so we want the latest i.e. the 'current' version
  if (version === 0) {
    return allReturnSubmissions[0]
  }

  const selectedReturnSubmission = allReturnSubmissions.find((returnSubmission) => {
    return returnSubmission.version === version
  })

  return selectedReturnSubmission
}

module.exports = {
  go
}
