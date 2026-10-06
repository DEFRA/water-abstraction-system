/**
 * Fetches the matching return log data and associated submission needed for the csv download
 * @module FetchDownloadReturnLogService
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

/**
 * Fetches the matching return log data and associated submission needed for the csv download
 *
 * @param {string} returnLogId - The UUID of the return log to fetch for download
 * @param {number} version - The version number of the submission data to use
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and associated submission (if any)
 */
export default async function fetchDownloadReturnLogService(returnLogId, version) {
  const returnLog = await _fetch(returnLogId, version)

  returnLog.returnSubmissions[0].$applyReadings()

  return returnLog
}

async function _fetch(returnLogId, version) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select([
      'returnLogs.id',
      'returnLogs.startDate',
      'returnLogs.endDate',
      // NOTE: return_logs.return_reference is a varchar whereas return_requirements.reference is an integer. We cast
      // so both sides of the COALESCE() match, and so the result sorts numerically rather than alphabetically
      Objection.raw('COALESCE(return_requirement.reference, return_logs.return_reference::integer)').as(
        'returnReference'
      )
    ])
    .leftJoinRelated('returnRequirement')
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
}
