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
 * @param {String} licenceRef The reference of the licence that the return log relates to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<Object>} Contains an array of `returnLogs` and the associated current `returnSubmissions`, and
 * `returnSubmissionLines` if they exist
 */
async function go (licenceRef, billingPeriod) {
  return _fetch(licenceRef, billingPeriod)
}

async function _fetch (licenceRef, billingPeriod) {
  const returnLogs = await ReturnLogModel.query()
    .select([
      'id',
      'returnRequirement',
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
    // water-abstraction-service filters out old return logs in this way: see `src/lib/services/returns/api-connector.js`
    .where('startDate', '>=', '2008-04-01')
    .where('startDate', '<=', billingPeriod.endDate)
    .where('endDate', '>=', billingPeriod.startDate)
    .whereJsonPath('metadata', '$.isTwoPartTariff', '=', true)
    .orderBy('startDate', 'ASC')
    .orderBy('returnRequirement', 'ASC')
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', builder => {
      builder
        .select([
          'id',
          'nilReturn'
        ])
        .where('returnSubmissions.current', true)
    })
    .withGraphFetched('returnSubmissions.returnSubmissionLines')
    .modifyGraph('returnSubmissions.returnSubmissionLines', builder => {
      builder
        .select([
          'id',
          'startDate',
          'endDate',
          'quantity'
        ])
        .where('returnSubmissionLines.quantity', '>', 0)
        .where('returnSubmissionLines.startDate', '<=', billingPeriod.endDate)
        .where('returnSubmissionLines.endDate', '>=', billingPeriod.startDate)
    })

  return returnLogs
}

module.exports = {
  go
}
