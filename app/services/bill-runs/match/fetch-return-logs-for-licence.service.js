'use strict'

/**
 * Fetches SROC return logs linked to licences flagged for inclusion in next SROC 2PT billing
 * @module FetchReturnLogsForLicenceService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Fetch all SROC return logs to be processed as part of two-part-tariff billing
 * *
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object>} Contains an array of `returnLogs` and the associated current `returnSubmissions`, and
 * `returnSubmissionLines` if they exist
 */
async function go(licenceRef, billingPeriod) {
  try {
    return await _fetch(licenceRef, billingPeriod)
  } catch (error) {
    // NOTE: The try/catch was added after we found out that it is possible to set up return requirements in NALD with
    // empty abstraction periods. This then causes the return log to also be missing abstraction period data. Our
    // cast in the query then causes an error.
    global.GlobalNotifier.omfg(
      'Bill run process fetch return logs for licence failed',
      { licenceRef, billingPeriod },
      error
    )
    // NOTE: We rethrow the error so that the bill run will be set to error status. We know this will result in use
    // having to check out the issue. But with this additional logging we should be able to quickly see which licence
    // caused the error.
    //
    // If we don't rethrow the error then the bill run will complete without the return log being picked up. This would
    // result in an incorrect bill run because the submission would not have been picked up for allocation.
    throw error
  }
}

async function _fetch(licenceRef, billingPeriod) {
  const returnLogs = await ReturnLogModel.query()
    .select([
      'id',
      'returnReference',
      ref('metadata:description').castText().as('description'),
      'startDate',
      'endDate',
      'receivedDate',
      'dueDate',
      'status',
      'underQuery',
      ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
      ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
      ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
      ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth'),
      ref('metadata:purposes').as('purposes')
    ])
    .where('licenceRef', licenceRef)
    // water-abstraction-service filters out old return logs in this way: see
    // `src/lib/services/returns/api-connector.js`
    .where('startDate', '>=', '2008-04-01')
    .whereNot('status', 'void')
    .where('endDate', '>=', billingPeriod.startDate)
    .where('endDate', '<=', billingPeriod.endDate)
    .whereJsonPath('metadata', '$.isTwoPartTariff', '=', true)
    .orderBy('startDate', 'ASC')
    .orderBy('returnReference', 'ASC')
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

  return returnLogs
}

module.exports = {
  go
}
