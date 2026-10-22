/**
 * Fetches return log data needed for the `/return-logs/setup/confirmed/{returnLogId}` page
 * @module FetchReturnLogService
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

/**
 * Fetches return log data needed for the `/return-logs/setup/confirmed/{returnLogId}` page
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
      'returnRequirement.siteDescription',
      'returnRequirement.reference as returnReference',
      ReturnLogModel.relatedQuery('returnSubmissions').count().as('submissionCount')
    )
    .select(
      ReturnLogModel.relatedQuery('returnRequirement')
        .innerJoinRelated('returnRequirementPurposes')
        .innerJoin('purposes', 'purposes.id', 'returnRequirementPurposes.purposeId')
        .select(Objection.raw(`COALESCE(JSON_AGG(purposes.description ORDER BY purposes.description), '[]'::json)`))
        .as('purposes')
    )
    .innerJoinRelated('licence')
    .innerJoinRelated('returnRequirement')
}
