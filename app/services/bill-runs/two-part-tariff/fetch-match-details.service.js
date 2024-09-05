'use strict'

/**
 * Fetches the individual charge element match details during the review stage of a two-part tariff bill run
 * @module FetchMatchDetailsService
 */

const { ref } = require('objection')

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Fetches the match details for an individual charge element
 *
 * @param {string} billRunId - UUID of the bill run
 * @param {string} reviewChargeElementId - The UUID of the review charge element being viewed
 *
 * @returns {Promise<object>} An object containing the bill run and review charge element instances
 */
async function go (billRunId, reviewChargeElementId) {
  const billRun = await _fetchBillRun(billRunId)
  const reviewChargeElement = await _fetchReviewChargeElement(reviewChargeElementId)

  return { billRun, reviewChargeElement }
}

async function _fetchBillRun (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(
      'id',
      'fromFinancialYearEnding',
      'toFinancialYearEnding')
}

async function _fetchReviewChargeElement (reviewChargeElementId) {
  return ReviewChargeElementModel.query()
    .findById(reviewChargeElementId)
    .withGraphFetched('reviewReturns')
    .withGraphFetched('reviewReturns.returnLog')
    .modifyGraph('reviewReturns.returnLog', (builder) => {
      builder.select([
        ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
        ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
        ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
        ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth')])
    })
    .withGraphFetched('chargeElement')
    .modifyGraph('chargeElement', (builder) => {
      builder.select([
        'description',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'authorisedAnnualQuantity'
      ])
    })
    .withGraphFetched('reviewChargeReference')
    .modifyGraph('reviewChargeReference', (builder) => {
      builder.select([
        'id',
        'amendedAuthorisedVolume'
      ])
    })
    .withGraphFetched('reviewChargeReference.reviewChargeVersion')
    .modifyGraph('reviewChargeReference.reviewChargeVersion', (builder) => {
      builder.select([
        'chargePeriodStartDate',
        'chargePeriodEndDate'
      ])
    })
}

module.exports = {
  go
}
