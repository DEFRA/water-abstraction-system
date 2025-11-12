'use strict'

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 * @module FetchDownloadReturnLogService
 */

const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 *
 * @param {string} returnId - The UUID of the return log to fetch for download
 * @param {number} version - The version number of the submission data to use
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and associated submission (if any)
 */
async function go(returnId, version) {
  const returnLog = await _fetch(returnId, version)

  returnLog.returnSubmissions[0].$applyReadings()

  return returnLog
}

async function _fetch(returnId, version) {
  return ReturnLogModel.query()
    .select(['id', 'returnReference', 'startDate', 'endDate'])
    .where('returnId', returnId)
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .select(['id', 'metadata', 'version'])
        .where('version', version)
        .orderBy('version', 'desc')
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder.select(['id', 'startDate', 'endDate', 'quantity']).orderBy('endDate', 'asc')
        })
    })
    .first()
}

module.exports = {
  go
}
