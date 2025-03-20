'use strict'

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 * @module FetchDownloadReturnLogService
 */

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 *
 * @param {string} returnLogId - The UUID of the return log to fetch for download
 * @param {number} version - The version number of the submission data to use
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and associated submission (if any)
 */
async function go(returnLogId, version) {
  const returnLog = await _fetch(returnLogId, version)

  returnLog.returnSubmissions[0].$applyReadings()

  return returnLog
}

async function _fetch(returnLogId, version) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(['id', 'returnReference', 'startDate', 'endDate'])
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .select(['id', 'metadata', 'version'])
        .where('version', version)
        .orderBy('version', 'desc')
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder.select(['id', 'startDate', 'endDate', 'quantity']).orderBy('startDate', 'asc')
        })
    })
}

module.exports = {
  go
}
