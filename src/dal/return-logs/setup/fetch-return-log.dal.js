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
      'returnLogs.receivedDate',
      'returnLogs.returnId',
      'returnLogs.returnsFrequency',
      'returnLogs.startDate',
      'returnLogs.status',
      'returnLogs.underQuery'
    )
    .select(
      ReturnLogModel.relatedQuery('returnRequirement')
        .innerJoinRelated('returnRequirementPurposes')
        .innerJoin('purposes', 'purposes.id', 'returnRequirementPurposes.purposeId')
        .select(Objection.raw("COALESCE(JSON_AGG(purposes.description ORDER BY purposes.description), '[]'::json)"))
        .as('purposes')
    )
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('returnRequirement')
    .modifyGraph('returnRequirement', (returnRequirementBuilder) => {
      returnRequirementBuilder.select([
        'id',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'reference',
        'siteDescription',
        'twoPartTariff'
      ])
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
