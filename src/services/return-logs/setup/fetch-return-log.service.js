/**
 * Fetches return log data needed for the /return-logs/setup/{sessionId}/check page
 * @module FetchReturnLogService
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

/**
 * Fetches return log data needed for the /return-logs/setup/{sessionId}/check page
 *
 * @param {string} returnLogId - The UUID of the return log to be fetched
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance and licence data
 */
export default async function fetchReturnLogService(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'licence.id AS licenceId',
      'licence.licenceRef',
      'returnLogs.id',
      'returnLogs.status',
      // NOTE: return_logs.return_reference is a varchar whereas return_requirements.reference is an integer. We cast
      // so both sides of the COALESCE() match, and so the result sorts numerically rather than alphabetically
      Objection.raw('COALESCE(return_requirement.reference, return_logs.return_reference::integer)').as(
        'returnReference'
      ),
      Objection.ref('returnLogs.metadata:purposes').as('purposes'),
      Objection.ref('returnLogs.metadata:description').as('siteDescription'),
      ReturnLogModel.relatedQuery('returnSubmissions').count().as('submissionCount')
    )
    .innerJoinRelated('licence')
    .leftJoinRelated('returnRequirement')
}
