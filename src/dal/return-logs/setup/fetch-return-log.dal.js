/**
 * Fetches the return log needed to start the return log edit journey
 * @module FetchReturnLogDal
 */

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
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('returnRequirement')
    .modifyGraph('returnRequirement', (returnRequirementBuilder) => {
      returnRequirementBuilder
        .select([
          'id',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'reference',
          'siteDescription',
          'twoPartTariff'
        ])
        .withGraphFetched('returnRequirementPurposes')
        .modifyGraph('returnRequirementPurposes', (returnRequirementPurposesBuilder) => {
          returnRequirementPurposesBuilder
            .select(['returnRequirementPurposes.purposeId'])
            .innerJoinRelated('purpose')
            .withGraphFetched('purpose')
            .modifyGraph('purpose', (purposeBuilder) => {
              purposeBuilder.select(['description'])
            })
            .orderBy('purpose.description', 'asc')
        })
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
