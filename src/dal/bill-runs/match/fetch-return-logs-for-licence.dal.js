/**
 * Fetches SROC return logs linked to licences flagged for inclusion in next SROC 2PT billing
 * @module FetchReturnLogsForLicenceDal
 */

import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

/**
 * Fetches SROC return logs linked to licences flagged for inclusion in next SROC 2PT billing
 *
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object>} Contains an array of `returnLogs` and the associated current `returnSubmissions`, and
 * `returnSubmissionLines` if they exist
 */
export default async function fetchReturnLogsForLicenceDal(licenceRef, billingPeriod) {
  return ReturnLogModel.query()
    .select([
      'returnLogs.id',
      'returnLogs.returnId',
      'returnLogs.startDate',
      'returnLogs.endDate',
      'returnLogs.receivedDate',
      'returnLogs.dueDate',
      'returnLogs.status',
      'returnLogs.underQuery',
      'returnRequirement.abstractionPeriodStartDay AS periodStartDay',
      'returnRequirement.abstractionPeriodStartMonth AS periodStartMonth',
      'returnRequirement.abstractionPeriodEndDay AS periodEndDay',
      'returnRequirement.abstractionPeriodEndMonth AS periodEndMonth',
      'returnRequirement.siteDescription AS description',
      'returnRequirement.reference AS returnReference'
    ])
    .select(
      ReturnLogModel.relatedQuery('returnRequirement')
        .innerJoinRelated('returnRequirementPurposes')
        .innerJoin('purposes', 'purposes.id', 'returnRequirementPurposes.purposeId')
        .select(
          Objection.raw(
            `COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'alias', return_requirement_purposes.alias,
                  'code', purposes.legacy_id,
                  'description', purposes.description
                )
                ORDER BY purposes.description
              ),
              '[]'::json
            )`
          )
        )
        .as('purposes')
    )
    .innerJoinRelated('returnRequirement')
    .where('returnLogs.licenceRef', licenceRef)
    .whereNot('returnLogs.status', 'void')
    .where('returnLogs.endDate', '>=', billingPeriod.startDate)
    .where('returnLogs.endDate', '<=', billingPeriod.endDate)
    .where('returnRequirement.twoPartTariff', true)
    .orderBy('returnLogs.startDate', 'ASC')
    .orderBy('returnRequirement.reference', 'ASC')
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', (builder) => {
      builder.select(['id', 'nilReturn']).where('returnSubmissions.current', true)
    })
    .withGraphFetched('returnSubmissions.returnSubmissionLines')
    .modifyGraph('returnSubmissions.returnSubmissionLines', (builder) => {
      builder
        .select(['id', 'startDate', 'endDate', 'quantity'])
        .where('returnSubmissionLines.quantity', '>', 0)
        .where('returnSubmissionLines.startDate', '<=', billingPeriod.endDate)
        .where('returnSubmissionLines.endDate', '>=', billingPeriod.startDate)
    })
}
