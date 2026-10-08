/**
 * Fetches the matching return submission needed for the view
 * @module FetchReturnSubmissionService
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnSubmissionModel from 'water-abstraction-engine/models/return-submission.model.js'

/**
 * Fetches the matching return submission
 *
 * @param {string} returnSubmissionId - The return submission ID
 *
 * @returns {Promise<module:ReturnSubmissionModel>} the matching `ReturnSubmissionModel` instance and its associated
 * data (return lines and the return reference from its return log)
 */
export default async function fetchReturnSubmissionService(returnSubmissionId) {
  const returnSubmission = await _fetch(returnSubmissionId)

  returnSubmission.$applyReadings()

  return returnSubmission
}

async function _fetch(returnSubmissionId) {
  return ReturnSubmissionModel.query()
    .findById(returnSubmissionId)
    .select(['id', 'metadata', 'returnLogId', 'version', 'current'])
    .withGraphFetched('returnSubmissionLines')
    .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
      returnSubmissionLinesBuilder
        .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
        .orderBy('startDate', 'asc')
    })
    .withGraphFetched('returnLog')
    .modifyGraph('returnLog', (returnLogBuilder) => {
      returnLogBuilder
        .select([
          'returnLogs.returnsFrequency',
          // NOTE: return_logs.return_reference is a varchar whereas return_requirements.reference is an integer. We
          // cast so both sides of the COALESCE() match
          Objection.raw('COALESCE(return_requirement.reference, return_logs.return_reference::integer)').as(
            'returnReference'
          )
        ])
        .leftJoinRelated('returnRequirement')
    })
}
