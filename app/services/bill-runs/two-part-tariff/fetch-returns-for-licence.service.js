'use strict'

/**
 * Fetches SROC Returns linked to licences flagged for inclusion in next SROC 2PT billing
 * @module FetchReturnsForLicenceService
 */

const { ref } = require('objection')

const ReturnModel = require('../../../models/returns/return.model')

/**
 * Fetch all SROC returns to be processed as part of supplementary billing
 * *
 * From this initial result we extract an array of unique licence IDs and then remove any that are non-chargeable (we
 * need to know about them in order to unset the licence's supplementary billing flag).
 *
 * @param {String} licenceRef The reference of the licence that the return relates to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object} Contains an array of unique licence IDs and array of charge versions to be processed
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
