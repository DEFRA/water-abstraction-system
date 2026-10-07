/**
 * Fetches the return log needed to start the return log edit journey
 * @module FetchReturnLogDal
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

/**
 * Fetches the return log needed to start the return log edit journey
 *
 * @param {string} returnLogId - The UUID of the return log to be fetched
 *
 * @returns {Promise<module:ReturnLogModel>} the matching `ReturnLogModel` instance, plus its licence and current
 * return submission
 */
export default async function fetchReturnLogDal(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(
      'returnLogs.id',
      'returnLogs.dueDate',
      'returnLogs.endDate',
      'returnLogs.metadata',
      'returnLogs.receivedDate',
      'returnLogs.returnId',
      'returnLogs.returnsFrequency',
      'returnLogs.startDate',
      'returnLogs.status',
      'returnLogs.underQuery',
      // NOTE: return_logs.return_reference is a varchar whereas return_requirements.reference is an integer. We cast
      // so both sides of the COALESCE() match, and so the result sorts numerically rather than alphabetically
      Objection.raw('COALESCE(return_requirement.reference, return_logs.return_reference::integer)').as(
        'returnReference'
      )
    )
    .leftJoinRelated('returnRequirement')
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (returnSubmissionsBuilder) => {
      returnSubmissionsBuilder
        .select(['metadata', 'nilReturn'])
        .where('current', true)
        .withGraphFetched('returnSubmissionLines')
        .modifyGraph('returnSubmissionLines', (returnSubmissionLinesBuilder) => {
          returnSubmissionLinesBuilder
            .select(['id', 'startDate', 'endDate', 'quantity', 'userUnit'])
            .orderBy('startDate', 'asc')
        })
    })
}
