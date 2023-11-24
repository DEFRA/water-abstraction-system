'use strict'

/**
 * Fetches SROC Returns linked to licences flagged for inclusion in next SROC 2PT billing
 * @module FetchReturnsForLicenceService
 */

const { ref } = require('objection')

const ReturnModel = require('../../../models/returns/return.model')

/**
 * Fetch all SROC returns to be processed as part of two-part-tariff billing
 * *
 * @param {String} licenceRef The reference of the licence that the return relates to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object} Contains an array of Returns and the associated current Version, and Lines if they exist
 */
async function go (licenceRef, billingPeriod) {
  return _fetch(licenceRef, billingPeriod)
}

async function _fetch (licenceRef, billingPeriod) {
  const returns = await ReturnModel.query()
    .select([
      'returnId',
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
    // water-abstraction-service filters out old returns in this way: see `src/lib/services/returns/api-connector.js`
    .where('startDate', '>=', '2008-04-01')
    .where('startDate', '<=', billingPeriod.endDate)
    .where('endDate', '>=', billingPeriod.startDate)
    .whereJsonPath('metadata', '$.isTwoPartTariff', '=', true)
    .orderBy('startDate', 'ASC')
    .orderBy('returnRequirement', 'ASC')
    .withGraphFetched('versions')
    .modifyGraph('versions', builder => {
      builder
        .select([
          'versionId',
          'nilReturn'
        ])
        .where('versions.current', true)
    })
    .withGraphFetched('versions.lines')
    .modifyGraph('versions.lines', builder => {
      builder
        .select([
          'lineId',
          'startDate',
          'endDate',
          'quantity'
        ])
        .where('lines.quantity', '>', 0)
        .where('lines.startDate', '<=', billingPeriod.endDate)
        .where('lines.endDate', '>=', billingPeriod.startDate)
    })

  return returns
}

module.exports = {
  go
}
